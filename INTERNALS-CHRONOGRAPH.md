# ChronoGraph Reactive Calculation Engine - Deep Dive

## Overview

ChronoGraph is Bryntum's custom reactive calculation engine that powers the scheduling logic in Gantt and SchedulerPro. It implements a directed acyclic graph (DAG) of computations with automatic dependency tracking, lazy/eager evaluation, transaction support, and sophisticated cycle resolution.

**Key Design Principles:**
- Pure functional computations (deterministic, side-effect free)
- Immutable data flow
- Automatic dependency tracking via "effect yielding"
- Generator-based calculations for unlimited stack depth
- Transaction-based state management with undo/redo support

---

## 1. Graph-Based Reactivity

### Core Architecture

At its foundation, ChronoGraph is a directed acyclic graph where:
- **Nodes** = Identifiers (reactive primitives)
- **Edges** = Dependencies between identifiers (discovered at runtime)

```
                    +-----------+
                    |  Replica  |  (Enhanced ChronoGraph for Entity/Relation)
                    +-----------+
                          |
                    +-----------+
                    |ChronoGraph|  (Low-level computation scope)
                    +-----------+
                          |
        +-----------------+-----------------+
        |                 |                 |
  +-----v-----+     +-----v-----+     +-----v-----+
  |Identifier |---->|Identifier |---->|Identifier |
  | (source)  |     | (computed)|     | (computed)|
  +-----------+     +-----------+     +-----------+
```

### Dependency Propagation Algorithm

1. **Write Phase**: User writes to a variable/identifier
2. **Mark Phase**: All transitively dependent identifiers are marked as "potentially stale"
3. **Propagation Phase**: On commit (or lazy read), recalculate stale identifiers
4. **Memoization**: If computed value equals previous value (via equality check), dependent identifiers skip recalculation

```typescript
// Simplified propagation flow
graph.write(variable, newValue)
// -> Marks variable's dependents as stale
// -> On commit/read:
//    1. Topologically sort stale identifiers
//    2. For each identifier in order:
//       - Execute calculation function
//       - If result === previousValue, skip marking dependents
//       - Else, store new value and propagate
```

### Effect Handler Pattern

The core innovation is the "effect yielding" mechanism. Inside any calculation function, dependencies are declared by calling the effect handler:

```typescript
// Synchronous form (stack-limited to ~1300 deep)
const identifier = Identifier.new({
    calculation: (Y: SyncEffectHandler) => {
        const dep1Value = Y(identifier1)  // Yields to graph, records dependency
        const dep2Value = Y(identifier2)  // Another dependency
        return dep1Value + dep2Value
    }
})

// Generator form (unlimited stack depth, async capable)
const identifier = Identifier.new({
    *calculation(Y: SyncEffectHandler): ChronoIterator<number> {
        const dep1Value: number = yield identifier1
        const dep2Value: number = yield identifier2
        return dep1Value + dep2Value
    }
})
```

---

## 2. Atom/Identifier System

### Core Types

```typescript
// Base Identifier - represents a reactive computation node
interface Identifier<V = any> {
    // The calculation function
    calculation: (Y: SyncEffectHandler) => V | ChronoIterator<V>

    // Context for 'this' binding in calculation
    context?: object

    // Custom equality check (default: ===)
    equality?: (v1: V, v2: V) => boolean

    // Unique ID for this identifier
    name?: string

    // Whether calculation is lazy or strict
    lazy?: boolean
}

// Variable - special identifier representing user input (no calculation)
type Variable<V> = Identifier<V>  // Lightweight, no calculation function

// FieldIdentifier - identifier bound to an Entity field
interface FieldIdentifier<V> extends Identifier<V> {
    field: string
    entity: Entity
}
```

### Entity/Field Framework

Higher-level abstraction mapping identifiers to TypeScript classes:

```typescript
// Entity mixin - makes a class reactive
class Person extends Entity.mix(Base) {
    @field()
    firstName: string

    @field()
    lastName: string

    @field()
    fullName: string

    @calculate('fullName')
    calculateFullName(Y: SyncEffectHandler): string {
        return Y(this.$.firstName) + ' ' + Y(this.$.lastName)
    }
}

// Under the hood:
// - Each @field() creates an Identifier
// - All identifiers stored in entity.$ property
// - @calculate() binds a method as the calculation function
```

### Field Configuration Options

```typescript
@field({
    // Whether to compute lazily (on-demand) or strictly (on commit)
    lazy: boolean,

    // Custom equality function
    equality: (v1: T, v2: T) => boolean,

    // Sync function or generator for complex calculations
    calculation: (Y: SyncEffectHandler) => T
})
propertyName: T
```

---

## 3. Transaction Processing

### Transaction Lifecycle

```
    +--------+     write      +------------+
    | Clean  | -------------> | Dirty      |
    | State  |                | (pending)  |
    +--------+                +------------+
        ^                           |
        |                           |
   reject()                    commit()
        |                           |
        |                     +-----v------+
        +---------------------| Propagate  |
                              | (calculate)|
                              +-----+------+
                                    |
                              +-----v------+
                              | New Clean  |
                              | State      |
                              +------------+
```

### Key Transaction Operations

```typescript
const replica = Replica.new({ historyLimit: 10 })

// Add entities to replica (starts reactivity contract)
replica.addEntity(person)

// Write operations are batched
person.firstName = 'Mark'
person.lastName = 'Twain'

// Commit finalizes transaction, triggers propagation
replica.commit()  // or commitAsync() for async calculations

// Reject discards all changes since last commit
replica.reject()

// Undo/Redo (requires historyLimit > 0)
replica.undo()
replica.redo()
```

### Revision/Quark System

Internally, ChronoGraph tracks state through revisions:

```
Revision 0 (Initial)
    |
    v
Revision 1 (After commit)
    |
    v
Revision 2 (After commit)
    ...

Each identifier has a "Quark" per revision storing:
- The computed value
- Dependencies discovered during calculation
- Proposal state (user input vs computed)
```

---

## 4. Lazy vs Eager Evaluation

### Strict (Eager) Fields

Default behavior - computed during `commit()`:

```typescript
@field()  // strict by default
totalCost: number

@calculate('totalCost')
calculateTotalCost(Y: SyncEffectHandler): number {
    // Computed on every commit where dependencies changed
    return Y(this.$.unitCost) * Y(this.$.quantity)
}
```

### Lazy Fields

Computed on-demand when value is first read:

```typescript
@field({ lazy: true })
expensiveCalculation: number

@calculate('expensiveCalculation')
calculateExpensive(Y: SyncEffectHandler): number {
    // Only computed when accessed
    return /* expensive operation */
}
```

### Evaluation Strategy

```
On commit():
  1. Identify all "potentially stale" strict identifiers
  2. Topologically sort by dependency order
  3. Compute each strict identifier
  4. Lazy identifiers remain uncomputed

On read() of lazy identifier:
  1. If stale, compute on-demand
  2. Cache result until next transaction
```

---

## 5. Cycle Detection and Resolution

### Cyclic Dependencies Problem

In scheduling, many fields are interdependent:
- `EndDate = StartDate + Duration`
- `StartDate = EndDate - Duration`
- `Duration = EndDate - StartDate`

Direct cycles would cause infinite computation. ChronoGraph uses a **Cycle Resolution** system.

### Cycle Description

```typescript
// Abstract variable symbols
const StartVar = Symbol('Start')
const EndVar = Symbol('End')
const DurationVar = Symbol('Duration')

// Define formulas (not actual calculations, just I/O mapping)
const startFormula = Formula.new({
    output: StartVar,
    inputs: new Set([DurationVar, EndVar])
})

const endFormula = Formula.new({
    output: EndVar,
    inputs: new Set([DurationVar, StartVar])
})

const durationFormula = Formula.new({
    output: DurationVar,
    inputs: new Set([StartVar, EndVar])
})

// Combine into cycle description
const cycleDescription = CycleDescription.new({
    variables: new Set([StartVar, EndVar, DurationVar]),
    formulas: new Set([startFormula, endFormula, durationFormula])
})

// Define default resolution (which formula wins when no user input)
const cycleResolution = CycleResolution.new({
    description: cycleDescription,
    defaultResolutionFormulas: new Set([endFormula])  // E = S + D is default
})
```

### Resolution Algorithm

```typescript
// Resolution input describes which variables have user input
interface CycleResolutionInput {
    addProposedValueFlag(variable: Symbol): void  // Has user input
    addPreviousValueFlag(variable: Symbol): void  // Has previous value only
}

// Resolution output maps each variable to a formula (or CalculateProposed)
type CycleResolutionValue = Map<Symbol, FormulaId>

// Example: User sets Start and Duration
const input = CycleResolutionInput.new({ context: cycleResolution })
input.addProposedValueFlag(StartVar)
input.addProposedValueFlag(DurationVar)
input.addPreviousValueFlag(EndVar)

const resolution = cycleResolution.resolve(input)
// Result:
//   StartVar -> CalculateProposed (use user input)
//   DurationVar -> CalculateProposed (use user input)
//   EndVar -> endFormula (calculate from S + D)
```

### Cycle Dispatcher Pattern

```typescript
// Dispatcher identifier manages the cycle
@calculate('dispatcher')
calculateDispatcher(Y: SyncEffectHandler): CycleDispatcher {
    const cycleDispatcher = CycleDispatcher.new({ context: cycleResolution })

    // Collect info about which fields have user input
    cycleDispatcher.collectInfo(Y, this.$.startDate, StartVar)
    cycleDispatcher.collectInfo(Y, this.$.endDate, EndVar)
    cycleDispatcher.collectInfo(Y, this.$.duration, DurationVar)

    return cycleDispatcher
}

// Individual field calculations consult the dispatcher
@calculate('startDate')
calculateStartDate(Y: SyncEffectHandler): Date {
    const dispatch = this.dispatcher
    const instruction = dispatch.resolution.get(StartVar)

    if (instruction === startFormula.formulaId) {
        // Calculate: S = E - D
        return this.endDate - this.duration
    } else if (instruction === CalculateProposed) {
        // Use user input or previous value
        return Y(ProposedOrPrevious)
    }
}
```

---

## 6. Effect System

### Built-in Effects

```typescript
// YieldableValue - what can be yielded in calculations
type YieldableValue = Effect | Identifier | Promise<any>

// Core effects:
const ProposedOrPrevious: Effect  // Get user input or previous value
const ProposedValue: Effect       // Get proposed (user input) value only
const PreviousValue: Effect       // Get previous value only
const Reject: Effect              // Reject current transaction
```

### ProposedOrPrevious Pattern

This is the key to creating "mixed" identifiers that can accept user input OR compute:

```typescript
@calculate('value')
calculateValue(Y: SyncEffectHandler): number {
    const proposedValue = Y(ProposedOrPrevious)
    const maxValue = Y(this.$.maxValue)

    // Validate user input against constraint
    return proposedValue <= maxValue ? proposedValue : maxValue
}
```

### Async Effects

Generator-based calculations can yield Promises for async operations:

```typescript
@calculate('data')
*calculateData(Y: SyncEffectHandler): ChronoIterator<Data> {
    const url = yield this.$.dataUrl
    const response = yield fetch(url)  // Awaits promise
    return yield response.json()
}

// Must use commitAsync() instead of commit()
await replica.commitAsync()
```

### Effect Handler Type Signature

```typescript
type SyncEffectHandler = <T>(effect: YieldableValue) => T & NotPromise<T>

// Usage in calculation:
calculation(Y: SyncEffectHandler): number {
    const value1: number = Y(identifier1)     // Read another identifier
    const proposed: number = Y(ProposedOrPrevious)  // Get user input
    return value1 + proposed
}
```

---

## 7. Replica Pattern (State Snapshots)

### Data Branching

ChronoGraph supports creating lightweight branches for "what-if" analysis:

```typescript
const graph = ChronoGraph.new()
const variable = graph.variable(5)

// Create a branch (cheap operation)
const branch = graph.branch()

// Write to branch only
branch.write(variable, 10)

// Original unchanged, branch has new value
graph.read(variable)   // 5
branch.read(variable)  // 10
```

### Use Cases

1. **Cycle Detection**: Before adding a dependency, test in a branch
2. **Undo/Redo**: Branches are the mechanism for history
3. **Preview Changes**: Show "what-if" without affecting real data

### Replica (Enhanced ChronoGraph)

Replica extends ChronoGraph with Entity/Relation support:

```typescript
interface Replica extends ChronoGraph {
    // Entity management
    addEntity(entity: Entity): void
    removeEntity(entity: Entity): void
    addEntities(entities: Entity[]): void

    // Transaction control
    commit(): void
    commitAsync(): Promise<void>
    reject(): void

    // History (if historyLimit > 0)
    undo(): void
    redo(): void
    historyLimit: number

    // Branching
    branch(): Replica
}

const replica = Replica.new({ historyLimit: 10 })
```

### EngineReplica in Gantt/SchedulerPro

The scheduling engine uses an extended `EngineReplica`:

```typescript
class EngineReplica extends Replica {
    // Project reference
    project: AbstractProjectMixin

    // Conflict resolution
    onSchedulingConflict: (conflict: Conflict) => ConflictResolution

    // Propagation control
    async propagate(): Promise<CommitResult>

    // Engine-specific entity management
    addEvents(events: EventModel[]): void
    addResources(resources: ResourceModel[]): void
    addAssignments(assignments: AssignmentModel[]): void
}
```

---

## 8. Propagation Algorithm Details

### Full Propagation Flow

```
1. COLLECT DIRTY IDENTIFIERS
   - Start from written variables
   - Mark all dependent identifiers as "stale"
   - Use reverse dependency graph

2. TOPOLOGICAL SORT
   - Order stale identifiers by dependency depth
   - Identifiers with no stale dependencies computed first

3. COMPUTE EACH IDENTIFIER
   For each stale identifier in sorted order:
   a. Execute calculation function
   b. Effect handler (Y) invoked for each dependency read:
      - If dependency is stale, compute it recursively
      - Record dependency edge
   c. Apply equality check vs previous value
   d. If equal, skip propagation to dependents
   e. If different, mark dependents for update

4. FINALIZE
   - Store new quark values
   - Update revision number
   - Clear dirty flags
```

### Optimization Strategies

1. **Memoization**: Same inputs = skip calculation
2. **Equality short-circuit**: Same result = stop propagation
3. **Lazy evaluation**: Defer unused calculations
4. **Branch sharing**: Branches share unmodified values

---

## 9. Key TypeScript Interfaces

### ChronoGraph Core

```typescript
// Main graph class
class ChronoGraph {
    // Add identifiers
    addIdentifier(identifier: Identifier): void
    identifier<V>(calculation: (Y: SyncEffectHandler) => V): Identifier<V>
    variable<V>(value: V): Variable<V>

    // Read/write
    read<V>(identifier: Identifier<V>): V
    write<V>(identifier: Identifier<V>, value: V): void

    // Transaction
    commit(): void
    reject(): void

    // Branching
    branch(): ChronoGraph
}
```

### Identifier

```typescript
class Identifier<V = any> {
    // Core properties
    name?: string
    calculation?: (Y: SyncEffectHandler) => V | ChronoIterator<V>
    context?: object
    equality?: (v1: V, v2: V) => boolean
    lazy?: boolean

    // Static constructor
    static new<V>(config: Partial<Identifier<V>>): Identifier<V>
}
```

### Entity

```typescript
class Entity {
    // All field identifiers
    $: Record<string, Identifier>

    // Mixin pattern
    static mix<T extends Constructor>(base: T): T & typeof Entity

    // Static constructor
    static new<T extends Entity>(config?: Partial<T>): T
}
```

### Replica

```typescript
class Replica extends ChronoGraph {
    // Entity management
    addEntity(entity: Entity): void
    removeEntity(entity: Entity): void

    // History (requires historyLimit > 0)
    historyLimit: number
    undo(): void
    redo(): void

    // Async support
    commitAsync(): Promise<void>
}
```

### CycleResolution

```typescript
class CycleResolution {
    description: CycleDescription
    defaultResolutionFormulas: Set<Formula>

    resolve(input: CycleResolutionInput): CycleResolutionValue
}

class CycleResolutionInput {
    context: CycleResolution

    addProposedValueFlag(variable: Symbol): void
    addPreviousValueFlag(variable: Symbol): void
}

class Formula {
    formulaId: FormulaId
    output: Symbol
    inputs: Set<Symbol>
}
```

---

## 10. Usage Patterns in Gantt

### Task Scheduling Fields

```typescript
// From SchedulerProEvent
class SchedulerProEvent extends Entity.mix(Model) {
    @field()
    startDate: Date

    @field()
    endDate: Date

    @field()
    duration: Duration

    @field()
    effort: number

    @field()
    percentDone: number

    // Cycle dispatcher for S/E/D relationship
    @field()
    dispatcher: SchedulingCycleDispatcher

    @calculate('startDate')
    *calculateStartDate(Y): ChronoIterator<Date> {
        const dispatch = this.dispatcher
        const instruction = dispatch.resolution.get(StartDateVar)

        if (instruction === CalculateProposed) {
            return Y(ProposedOrPrevious)
        }
        // ... formula-based calculations
    }
}
```

### Project Propagation

```typescript
// ProjectModel initiates propagation
class ProjectModel {
    // The replica holding all reactive state
    replica: EngineReplica

    // Trigger recalculation
    async propagate(): Promise<CommitResult> {
        return this.replica.commitAsync()
    }

    // STM-style transaction management
    async addEvent(data: Partial<EventModel>): Promise<EventModel> {
        const event = new EventModel(data)
        this.replica.addEntity(event)
        await this.propagate()
        return event
    }
}
```

---

## Summary

ChronoGraph provides a sophisticated reactive system that enables:

1. **Automatic Dependency Tracking**: No manual subscription management
2. **Efficient Updates**: Only recalculates what's necessary
3. **Cycle Handling**: Resolves interdependent scheduling formulas
4. **Transaction Support**: Atomic commits with undo/redo
5. **Branching**: Lightweight "what-if" analysis
6. **Async Support**: Generator-based calculations for complex operations

The system powers all scheduling calculations in Bryntum Gantt and SchedulerPro, handling thousands of interdependent tasks efficiently through its graph-based propagation algorithm.
