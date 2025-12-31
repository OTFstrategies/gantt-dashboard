# SchedulerPro Internals: Store Architecture

## Overview

SchedulerPro uses a sophisticated multi-store architecture where specialized stores manage different entity types (events, resources, assignments, dependencies). All stores connect to a central ProjectModel that coordinates relationships and change propagation.

## Store Hierarchy

```
AjaxStore (Core)
    └── SchedulerEventStore
    └── SchedulerResourceStore
    └── SchedulerAssignmentStore
    └── SchedulerDependencyStore

Model (Core)
    └── SchedulerProjectModel (coordinates all stores)
```

## Core Store Types

### SchedulerEventStore

Manages event/task records with temporal data.

```typescript
export class SchedulerEventStore extends AjaxStore {
    // Static identity flags
    static readonly isEventStore: boolean
    static readonly isEventStoreMixin: boolean
    static readonly isGetEventsMixin: boolean
    static readonly isPartOfProject: boolean
    static readonly isRecurringEventsMixin: boolean

    // Project relationships - all stores link back to same project
    readonly assignmentStore: SchedulerAssignmentStore
    readonly dependencyStore: SchedulerDependencyStore
    readonly eventStore: SchedulerEventStore
    readonly resourceStore: SchedulerResourceStore
    readonly project: SchedulerProjectModel

    // Model class for records
    modelClass: typeof EventModel

    // Lazy loading configuration
    lazyLoad: boolean | {
        bufferUnit: DurationUnit
        bufferAmount: number
        dateFormat: string
        loadFullResourceRange: boolean
        useResourceIds: boolean
    }

    // Recurring event handling
    autoAdjustRecurrence: boolean
}
```

**Key Methods:**

```typescript
// Add events with immediate calculation
add(records: SchedulerEventModel | EventModelConfig[]): SchedulerEventModel[]

// Add with async calculation - await for up-to-date data
addAsync(records: SchedulerEventModel | EventModelConfig[]): Promise<SchedulerEventModel[]>

// Get events for a resource
getEventsForResource(resource: SchedulerResourceModel | string | number): SchedulerEventModel[]

// Get assignments for an event
getAssignmentsForEvent(event: SchedulerEventModel): SchedulerAssignmentModel[]

// Get resources assigned to an event
getResourcesForEvent(event: SchedulerEventModel | string | number): SchedulerResourceModel[]
```

**Events:**

```typescript
// Date range loading for lazy/infinite scenarios
onLoadDateRange: (event: {
    source: SchedulerEventStore
    old: { startDate: Date, endDate: Date }
    new: { startDate: Date, endDate: Date }
    changed: boolean
}) => void

// Standard CRUD events
onAdd: (event: { source: Store, records: Model[], isMove?: object }) => void
onBeforeAdd: (event: { source: Store, records: Model[] }) => Promise<boolean> | boolean | void
onRemove: (event: { source: Store, records: Model[], isMove?: boolean }) => void
onBeforeRemove: (event: { source: Store, records: Model[] }) => Promise<boolean> | boolean | void
```

### SchedulerResourceStore

Manages resource records (people, equipment, rooms, etc.).

```typescript
export class SchedulerResourceStore extends AjaxStore {
    // Static identity flags
    static readonly isResourceStore: boolean
    static readonly isResourceStoreMixin: boolean
    static readonly isPartOfProject: boolean

    // Project relationships
    readonly assignmentStore: SchedulerAssignmentStore
    readonly dependencyStore: SchedulerDependencyStore
    readonly eventStore: SchedulerEventStore
    readonly project: SchedulerProjectModel
    readonly resourceStore: SchedulerResourceStore
}
```

**Key Methods:**

```typescript
// Get events assigned to a resource
getEventsForResource(resource: SchedulerResourceModel | string | number): TimeSpan[]

// Get all assignments for a resource
getAssignmentsForResource(resource: SchedulerResourceModel): SchedulerAssignmentModel[]

// Get resources for an event (via assignments)
getResourcesForEvent(event: SchedulerEventModel): SchedulerResourceModel[]
```

### SchedulerAssignmentStore

Manages the many-to-many relationship between events and resources.

```typescript
export class SchedulerAssignmentStore extends AjaxStore {
    // Static identity flags
    static readonly isAssignmentStore: boolean
    static readonly isAssignmentStoreMixin: boolean
    static readonly isPartOfProject: boolean

    // Project relationships
    readonly assignmentStore: SchedulerAssignmentStore
    readonly dependencyStore: SchedulerDependencyStore
    readonly eventStore: SchedulerEventStore
    readonly resourceStore: SchedulerResourceStore
    readonly project: SchedulerProjectModel
}
```

**Key Methods:**

```typescript
// Get all assignments for an event
getAssignmentsForEvent(event: SchedulerEventModel): SchedulerAssignmentModel[]

// Get all assignments for a resource
getAssignmentsForResource(resource: SchedulerResourceModel | string | number): SchedulerAssignmentModel[]

// Get events for a resource (through assignments)
getEventsForResource(resource: SchedulerResourceModel | string | number): TimeSpan[]

// Get resources for an event (through assignments)
getResourcesForEvent(event: SchedulerEventModel): SchedulerResourceModel[]
```

### SchedulerDependencyStore

Manages dependencies (predecessor/successor relationships) between events.

```typescript
export class SchedulerDependencyStore extends AjaxStore {
    // Static identity flags
    static readonly isDependencyStore: boolean
    static readonly isDependencyStoreMixin: boolean
    static readonly isPartOfProject: boolean

    // Project relationships
    readonly assignmentStore: SchedulerAssignmentStore
    readonly dependencyStore: SchedulerDependencyStore
    readonly eventStore: SchedulerEventStore
    readonly resourceStore: SchedulerResourceStore
    readonly project: SchedulerProjectModel
}
```

## Model Classes

### SchedulerEventModel

Represents an event/task with temporal properties.

```typescript
export class SchedulerEventModel extends TimeSpan {
    // Identity
    id: string | number
    static readonly isEventModel: boolean

    // Temporal fields
    startDate: string | Date
    endDate: string | Date
    duration: number
    fullDuration: DurationConfig | Duration
    allDay: boolean

    // Relationships
    readonly assignments: SchedulerAssignmentModel[]
    resource: SchedulerResourceModel                // First assigned resource
    readonly resources: SchedulerResourceModel[]    // All assigned resources
    resourceId: string | number                     // Single assignment (legacy)
    resourceIds: string[] | number[]                // Multiple assignments

    // Dependencies
    readonly predecessors: DependencyBaseModel[]
    readonly successors: DependencyBaseModel[]

    // Behavior flags
    draggable: boolean
    resizable: boolean | 'start' | 'end'
    readonly isDraggable: boolean
    readonly isResizable: boolean | string

    // Styling
    eventColor: EventColor | string | null
    eventStyle: 'plain' | 'border' | 'colored' | 'hollow' | 'line' | 'dashed' | 'minimal' | 'rounded' | 'calendar' | 'interday' | 'gantt' | null
    milestoneWidth: number
    stickyContents: boolean

    // Recurrence
    readonly isRecurring: boolean
    readonly isOccurrence: boolean
    recurrence: RecurrenceModel
    recurrenceRule: string
    exceptionDates: string | string[]
    readonly occurrenceIndex: number
    supportsRecurring: boolean

    // State flags
    readonly isInterDay: boolean
    readonly isPersistable: boolean
}
```

**Key Methods:**

```typescript
// Assignment management
assign(resource: SchedulerResourceModel | string | number | SchedulerResourceModel[], removeExisting?: boolean): Promise<void>
unassign(resource?: SchedulerResourceModel | string | number): Promise<void>
reassign(oldResource: SchedulerResourceModel | string, newResource: SchedulerResourceModel | string): void
isAssignedTo(resource: SchedulerResourceModel | string | number): boolean
getResource(resourceId?: string): SchedulerResourceModel

// Async field updates (triggers engine calculations)
setAsync(field: string | object, value?: any, silent?: boolean): Promise<void>

// Date manipulation
shift(amount: number, unit: DurationUnitShort): Promise<any>

// Recurrence
setRecurrence(recurrence: RecurrenceModelConfig | string | RecurrenceModel, interval?: number, recurrenceEnd?: number | Date): void
getOccurrencesForDateRange(startDate: Date, endDate?: Date): TimeSpan[]
addExceptionDate(date: Date): void
hasException(date: Date): boolean

// Field editability
isEditable(fieldName: string): boolean
```

### SchedulerResourceModel

Represents a resource that can be assigned to events.

```typescript
export class SchedulerResourceModel extends GridRowModel {
    // Identity
    id: string | number
    name: string
    static readonly isResourceModel: boolean

    // Relationships
    assignments: SchedulerAssignmentModel[]
    readonly events: SchedulerEventModel[]
    readonly timeRanges: ResourceTimeRangeModel[]

    // Appearance
    image: string | boolean
    imageUrl: string
    readonly initials: string
    showAvatar: boolean
    columnWidth: number
    rowHeight: number

    // Event styling (inherited by events)
    eventColor: EventColor
    eventStyle: 'tonal' | 'filled' | 'bordered' | 'traced' | 'outlined' | 'indented' | 'line' | 'dashed' | 'minimal' | 'rounded' | 'calendar' | 'interday' | 'gantt' | null
    eventLayout: 'stack' | 'pack' | 'mixed' | 'none'

    // Layout
    allowOverlap: boolean
    barMargin: number
    resourceMargin: number | ResourceMarginConfig

    // State
    readonly isPersistable: boolean
}
```

**Key Methods:**

```typescript
// Async field updates
setAsync(field: string | object, value?: any, silent?: boolean): Promise<void>

// Unassign from all events
unassignAll(): void
```

### SchedulerAssignmentModel

Links an event to a resource (many-to-many junction).

```typescript
export class SchedulerAssignmentModel extends Model {
    // Identity
    static readonly isAssignmentModel: boolean

    // Relationship fields
    event: string | number | SchedulerEventModel | TimeSpan
    eventId: string | number
    resource: string | number | SchedulerResourceModel
    resourceId: string | number

    // Convenience getters
    readonly eventName: string
    readonly resourceName: string

    // Behavior
    drawDependencies: boolean

    // State
    isPersistable: boolean
}
```

**Key Methods:**

```typescript
// Get the assigned resource
getResource(): SchedulerResourceModel

// Async updates
setAsync(field: string | object, value?: any, silent?: boolean): Promise<void>

// String representation
toString(): string  // e.g., "Mike 50%"
```

### DependencyBaseModel

Represents a dependency between two events.

```typescript
type DependencyBaseModelConfig = {
    // Relationship
    from: string | number
    fromEvent: string | number | SchedulerEventModel
    fromSide: 'top' | 'left' | 'bottom' | 'right'

    to?: string | number
    toEvent?: string | number | SchedulerEventModel
    toSide?: 'top' | 'left' | 'bottom' | 'right'

    // Type
    type?: number  // 0=SS, 1=SF, 2=FS, 3=FF
    bidirectional?: boolean

    // Lag
    lag?: number
    lagUnit?: DurationUnit

    // Styling
    cls?: string
}
```

## SchedulerProjectModel

Central coordinator for all stores and the scheduling engine.

```typescript
export class SchedulerProjectModel extends Model {
    // Store references
    assignmentStore: SchedulerAssignmentStore
    eventStore: SchedulerEventStore
    dependencyStore: SchedulerDependencyStore
    resourceStore: SchedulerResourceStore

    // Data accessors (get/set)
    assignments: SchedulerAssignmentModel[] | AssignmentModelConfig[]
    events: SchedulerEventModel[] | EventModelConfig[]
    dependencies: SchedulerDependencyModel[] | DependencyModelConfig[]
    resources: SchedulerResourceModel[] | ResourceModelConfig[]

    // Inline data (all stores combined)
    inlineData: object

    // Tree node support
    allChildren: Model[]
    allUnfilteredChildren: Model[]
    readonly childLevel: number
    readonly children: boolean | object[] | Model[]
    readonly firstChild: Model

    // Model metadata
    readonly allFields: DataField[]
    readonly fieldMap: Record<string, DataField>
    readonly fieldNames: string[]

    // State
    readonly isModified: boolean
    readonly isPhantom: boolean
    hasGeneratedId: boolean
}
```

## PartOfProject Mixin

All scheduler stores implement this mixin for project coordination.

```typescript
export class SchedulerPartOfProjectClass {
    // Identity
    static readonly isPartOfProject: boolean
    readonly isPartOfProject: boolean

    // Project reference
    readonly project: SchedulerProjectModel

    // Store cross-references
    readonly assignmentStore: SchedulerAssignmentStore
    readonly dependencyStore: SchedulerDependencyStore
    readonly eventStore: SchedulerEventStore
    readonly resourceStore: SchedulerResourceStore
}

// Mixin application
export const SchedulerPartOfProject: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & SchedulerPartOfProjectClass>
```

## Change Tracking

### StoreChanges Mixin

Tracks modifications for synchronization.

```typescript
export class StoreChangesClass {
    static readonly isStoreChanges: boolean
    readonly isStoreChanges: boolean

    // Control filter/sort after changeset
    applyChangesetFilterSortTarget: 'changes' | 'none'

    // Apply changes from another store
    applyChangesFromStore(otherStore: Store): void

    // Apply backend changeset
    applyChangeset(
        changes: object,                // { added: [], modified: [], removed: [] }
        transformFn?: Function,         // Preprocess changeset format
        phantomIdField?: string,        // Field for phantom→real ID mapping
        clearChanges?: boolean          // Commit changes after applying
    ): void
}
```

### Model State Flags

```typescript
// On Model instances
readonly isModified: boolean   // Has unsaved changes
readonly isPhantom: boolean    // Not yet persisted (new record)
```

### Store Commit Events

```typescript
// Commit lifecycle
onBeforeCommit: (event: { source: Store, changes: object }) => void
onCommit: (event: { source: Store, changes: object }) => void
onCommitAdded: (event: { source: Store }) => void
onCommitModified: (event: { source: Store }) => void
onCommitRemoved: (event: { source: Store }) => void

// Exception handling
onException: (event: {
    source: Store
    exception: boolean
    action: 'create' | 'read' | 'update' | 'delete' | 'commit'
    exceptionType: 'network' | 'failure'
    response: Response
    json: object
}) => void
```

## Store Relationship Flow

```
                    ┌─────────────────────────┐
                    │   SchedulerProjectModel │
                    │                         │
                    │  - eventStore           │
                    │  - resourceStore        │
                    │  - assignmentStore      │
                    │  - dependencyStore      │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  EventStore   │     │  ResourceStore  │     │ DependencyStore │
│               │     │                 │     │                 │
│ getEventsFor  │◄───►│ getResourcesFor │     │ from/to events  │
│ Resource()    │     │ Event()         │     │                 │
└───────┬───────┘     └────────┬────────┘     └─────────────────┘
        │                      │
        │    ┌─────────────────┴─────────────────┐
        │    │                                   │
        └────┼───────────────────────────────────┘
             ▼
    ┌─────────────────┐
    │ AssignmentStore │
    │                 │
    │ - eventId       │
    │ - resourceId    │
    │                 │
    │ Junction table  │
    │ (many-to-many)  │
    └─────────────────┘
```

## Common Store Operations

### Adding Records

```typescript
// Synchronous add
const events = eventStore.add({ name: 'Meeting', startDate: new Date(), duration: 1 });

// Async add with calculation await
const events = await eventStore.addAsync({
    name: 'Meeting',
    startDate: new Date(),
    duration: 1,
    durationUnit: 'hour'
});

// Multiple records
eventStore.add([
    { name: 'Event 1', startDate: '2024-01-15', duration: 2 },
    { name: 'Event 2', startDate: '2024-01-16', duration: 3 }
]);
```

### Getting Related Records

```typescript
// Get events for a resource
const events = eventStore.getEventsForResource(resource);
const events = eventStore.getEventsForResource('resource-1');
const events = eventStore.getEventsForResource(123);

// Get resources for an event
const resources = eventStore.getResourcesForEvent(event);

// Get assignments
const assignments = assignmentStore.getAssignmentsForEvent(event);
const assignments = assignmentStore.getAssignmentsForResource(resource);
```

### Event Assignment

```typescript
// Assign event to resource(s)
await event.assign(resource);
await event.assign([resource1, resource2]);
await event.assign(resource, true);  // Remove existing assignments first

// Unassign
await event.unassign(resource);
await event.unassign();  // Unassign from all

// Reassign
event.reassign(oldResource, newResource);

// Check assignment
const isAssigned = event.isAssignedTo(resource);
```

### Resource Data Access

```typescript
// From event
const resource = event.resource;           // First assigned
const resources = event.resources;         // All assigned
const assignments = event.assignments;     // All assignments

// From resource
const events = resource.events;            // All events
const assignments = resource.assignments;  // All assignments
```

## Store Event Lifecycle

### Add Lifecycle

```
User calls store.add(record)
         │
         ▼
   onBeforeAdd
   (can return false to cancel)
         │
         ▼
   Record added to collection
         │
         ▼
      onAdd
   (records, isMove, index, etc.)
```

### Remove Lifecycle

```
User calls store.remove(record)
         │
         ▼
   onBeforeRemove
   (can return false to cancel)
         │
         ▼
   Record removed from collection
         │
         ▼
     onRemove
   (records, isMove, parent, etc.)
```

### Commit Lifecycle

```
User calls store.commit() or autoCommit triggers
         │
         ▼
   onBeforeCommit
   (can return false to abort)
         │
         ▼
   Changes sent to server
         │
         ├───► Success ───► onCommit
         │                  onCommitAdded
         │                  onCommitModified
         │                  onCommitRemoved
         │
         └───► Failure ───► onException
```

## Async Operations Pattern

SchedulerPro uses async methods for operations that require scheduling engine calculations:

```typescript
// Model.setAsync - updates field and awaits engine
await event.setAsync('startDate', new Date('2024-02-01'));
await event.setAsync({ startDate: new Date(), duration: 5 });

// Store.addAsync - adds record and awaits calculation
const [event] = await eventStore.addAsync({
    name: 'New Event',
    startDate: new Date(),
    duration: 2
});

// After await, event dates are calculated
console.log(event.endDate);  // Correctly calculated
```

## Key Type Definitions

```typescript
// Event color options
type EventColor = 'red' | 'pink' | 'purple' | 'violet' | 'indigo' | 'blue' | 'cyan' | 'teal' |
                  'green' | 'lime' | 'yellow' | 'orange' | 'gray' | 'gantt-green' | null

// Duration units
type DurationUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
type DurationUnitShort = 'ms' | 's' | 'mi' | 'h' | 'd' | 'w' | 'M' | 'q' | 'y'

// Resource margin configuration
type ResourceMarginConfig = {
    start?: number
    end?: number
}

// Duration configuration
type DurationConfig = {
    magnitude: number
    unit: DurationUnit
}
```

## Integration Notes

1. **Store Cross-References**: All stores reference each other through the shared project. This enables methods like `getEventsForResource()` on any store.

2. **Phantom IDs**: New records get temporary phantom IDs until persisted. The `isPhantom` flag indicates this state.

3. **Async vs Sync**: Use `addAsync`/`setAsync` when you need calculated values immediately. Regular methods work but calculated fields update asynchronously.

4. **Assignment Store**: The many-to-many relationship between events and resources is managed through AssignmentStore. Using `event.resourceId` still creates assignments internally.

5. **Project Coordination**: All stores share a reference to the same ProjectModel. Modifications trigger scheduling engine calculations through the project.

6. **Change Tracking**: Stores track added/modified/removed records for CrudManager synchronization. The `changes` property exposes this data.
