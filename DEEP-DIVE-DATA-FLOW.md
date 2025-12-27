# Deep Dive: Data Flow in Bryntum Gantt

## Level 2 Documentation - Data Architecture and Flow Patterns

This document provides a detailed analysis of how data flows through the Bryntum Gantt component, from the ProjectModel through stores to the visual representation.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [ProjectModel: The Central Hub](#projectmodel-the-central-hub)
3. [Store Relationships](#store-relationships)
4. [Data Loading Patterns](#data-loading-patterns)
5. [Change Propagation and Events](#change-propagation-and-events)
6. [Parent-Child Task Trees](#parent-child-task-trees)
7. [Assignment Linking](#assignment-linking)
8. [Change Tracking and Dirty State](#change-tracking-and-dirty-state)
9. [Practical Patterns](#practical-patterns)

---

## Architecture Overview

Bryntum Gantt uses a centralized data architecture where the `ProjectModel` acts as the orchestrator for all data stores. Data flows in a hierarchical pattern:

```
ProjectModel (Central Hub)
    |
    +-- TaskStore (eventStore) -----> TaskModel instances
    |       |
    |       +-- Tree structure (parent/children)
    |
    +-- ResourceStore --------------> ResourceModel instances
    |
    +-- AssignmentStore ------------> AssignmentModel instances
    |       |                              |
    |       +-- Links tasks <------------>resources
    |
    +-- DependencyStore ------------> DependencyModel instances
    |       |
    |       +-- Links predecessor <-----> successor tasks
    |
    +-- CalendarManagerStore -------> CalendarModel instances
    |
    +-- TimeRangeStore -------------> TimeRangeModel instances
```

---

## ProjectModel: The Central Hub

The `ProjectModel` is the heart of the Bryntum Gantt data system. It extends `Model` and incorporates multiple mixins for CRUD management, event handling, and scheduling.

### Key Properties

```typescript
interface ProjectModel {
    // Store References
    taskStore: TaskStore;           // Alias for eventStore
    eventStore: TaskStore;          // The main task/event store
    resourceStore: ResourceStore;   // Resources that can be assigned
    assignmentStore: AssignmentStore; // Task-to-resource assignments
    dependencyStore: DependencyStore; // Task dependencies
    calendarManagerStore: CalendarManagerStore;
    timeRangeStore: Store;

    // Data Accessors (shorthand for store data)
    tasks: TaskModel[] | TaskModelConfig[];
    resources: ResourceModel[] | ResourceModelConfig[];
    assignments: AssignmentModel[] | AssignmentModelConfig[];
    dependencies: DependencyModel[] | DependencyModelConfig[];
    calendars: CalendarModel[] | CalendarModelConfig[];

    // State Properties
    readonly changes: object;       // Current uncommitted changes
    readonly isModified: boolean;   // Has uncommitted changes
    inlineData: object;             // Get/set all store data at once
    json: string;                   // Get/set data as JSON string
}
```

### Creating a ProjectModel

```typescript
import { ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    // Direct data assignment
    tasks: [
        { id: 1, name: 'Task 1', startDate: '2024-01-01', duration: 5 },
        { id: 2, name: 'Task 2', startDate: '2024-01-06', duration: 3 }
    ],
    resources: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
    ],
    assignments: [
        { id: 1, eventId: 1, resourceId: 1, units: 100 }
    ],
    dependencies: [
        { id: 1, fromTask: 1, toTask: 2, type: 2 } // Finish-to-Start
    ],

    // Configuration
    startDate: '2024-01-01',
    calendar: 'general',
    hoursPerDay: 8,
    daysPerWeek: 5
});
```

---

## Store Relationships

### The Four Core Stores

#### 1. TaskStore (EventStore)

The TaskStore holds all tasks in a tree structure. In Gantt, `eventStore` and `taskStore` are aliases for the same store.

```typescript
interface TaskStore {
    // Tree operations
    rootNode: TaskModel;

    // Accessing tasks
    getById(id: string | number): TaskModel;
    query(fn: (record: TaskModel) => boolean): TaskModel[];

    // Modification
    add(records: TaskModel | TaskModelConfig[]): TaskModel[];
    remove(records: TaskModel | TaskModel[]): TaskModel[];

    // Events
    onAdd: (event: { records: Model[] }) => void;
    onRemove: (event: { records: Model[] }) => void;
    onUpdate: (event: { record: Model, changes: object }) => void;
    onChange: (event: { action: string, records: Model[] }) => void;
}
```

#### 2. ResourceStore

Holds the resources (people, equipment) that can be assigned to tasks.

```typescript
interface ResourceStore {
    data: ResourceModelConfig[];

    // Key methods
    add(records: ResourceModel | ResourceModelConfig[]): ResourceModel[];
    getById(id: string | number): ResourceModel;
}
```

#### 3. AssignmentStore

The bridge between tasks and resources. Each assignment links one task to one resource.

```typescript
interface AssignmentStore {
    // Key methods
    assignEventToResource(
        event: TaskModel,
        resources: ResourceModel | ResourceModel[],
        assignmentSetupFn?: Function,
        removeExistingAssignments?: boolean
    ): AssignmentModel[];

    getAssignmentForEventAndResource(
        event: TaskModel | string | number,
        resource: ResourceModel | string | number
    ): AssignmentModel;

    getAssignmentsForResource(resource: ResourceModel): AssignmentModel[];
    getResourcesForEvent(event: TaskModel): ResourceModel[];
    getEventsForResource(resource: ResourceModel): TaskModel[];

    isEventAssignedToResource(
        event: TaskModel | string | number,
        resource: ResourceModel | string | number
    ): boolean;
}
```

#### 4. DependencyStore

Manages task dependencies (predecessor/successor relationships).

```typescript
interface DependencyStore {
    // Key methods
    add(records: DependencyModel | DependencyModelConfig[]): DependencyModel[];

    getDependencyForSourceAndTargetEvents(
        sourceEvent: TaskModel | string,
        targetEvent: TaskModel | string
    ): DependencyModel;

    getEventDependencies(event: TaskModel): DependencyModel[];

    isValidDependency(
        dependencyOrFromId: DependencyModel | TaskModel | number | string,
        toId?: TaskModel | number | string,
        type?: number
    ): Promise<boolean>;
}
```

### Store Interconnections

```typescript
// From a TaskModel, access related data:
const task = project.taskStore.getById(1);

// Get assignments for this task
const assignments: AssignmentModel[] = task.assignments;

// Get assigned resources
const resources: Set<ResourceModel> = task.assigned;

// Get dependencies
const allDeps: DependencyModel[] = task.allDependencies;
const incoming: Set<DependencyModel> = task.incomingDeps;
const outgoing: Set<DependencyModel> = task.outgoingDeps;

// Navigate to predecessor/successor tasks
const predecessors: TaskModel[] = task.predecessors;
const successors: TaskModel[] = task.successors;
```

---

## Data Loading Patterns

### Pattern 1: Inline Data

Load data directly at construction time or via property assignment:

```typescript
// At construction
const project = new ProjectModel({
    tasks: [...],
    resources: [...],
    assignments: [...]
});

// After construction - using inlineData
project.inlineData = {
    tasks: { rows: [...] },
    resources: { rows: [...] },
    assignments: { rows: [...] },
    dependencies: { rows: [...] }
};

// After construction - using individual store data
project.tasks = [...];
project.resources = [...];
```

### Pattern 2: URL Loading (CrudManager)

Load data from server endpoints:

```typescript
const project = new ProjectModel({
    // Simple URL configuration
    loadUrl: '/api/gantt/load',
    syncUrl: '/api/gantt/sync',

    // Or detailed transport configuration
    transport: {
        load: {
            url: '/api/gantt/load',
            method: 'GET',
            headers: { 'Authorization': 'Bearer token' }
        },
        sync: {
            url: '/api/gantt/sync',
            method: 'POST'
        }
    }
});

// Trigger load
await project.load();

// Trigger sync (save changes)
await project.sync();
```

### Pattern 3: Lazy Loading

Load data on demand for large datasets:

```typescript
const project = new ProjectModel({
    lazyLoad: {
        chunkSize: 100,
        bufferUnit: 'week',
        bufferAmount: 2
    },
    loadUrl: '/api/gantt/load'
});
```

### Pattern 4: JSON String Loading

```typescript
// Get data as JSON string
const jsonString = project.json;

// Set data from JSON string
project.json = '{"tasks":{"rows":[...]},"resources":{"rows":[...]}}';

// Or use toJSON/loadInlineData
const data = project.toJSON();
project.loadInlineData(data);
```

### syncDataOnLoad Pattern (React/Angular/Vue)

For framework integration, use `syncDataOnLoad` to intelligently merge data:

```typescript
const project = new ProjectModel({
    taskStore: {
        syncDataOnLoad: true  // Default in React/Angular/Vue wrappers
    }
});

// Hook to customize sync behavior
project.shouldSyncDataOnLoad = ({ store, records, data }) => {
    // Return Set of records to process, or boolean
    return true; // Process all
};
```

---

## Change Propagation and Events

### Event Flow

When data changes, events propagate through the system:

```
User/Code Action
       |
       v
Store.set() / Store.add() / Store.remove()
       |
       v
Model field change
       |
       v
Store fires 'update'/'add'/'remove' event
       |
       v
ProjectModel fires 'change' event
       |
       v
Scheduling Engine recalculates
       |
       v
ProjectModel fires 'dataReady' event
       |
       v
Gantt view refreshes
```

### Key Events

```typescript
// Store-level events
project.taskStore.on({
    add: ({ records, isMove }) => {
        console.log('Tasks added:', records);
    },
    remove: ({ records }) => {
        console.log('Tasks removed:', records);
    },
    update: ({ record, changes }) => {
        console.log('Task updated:', record.name, changes);
    },
    refresh: ({ action }) => {
        console.log('Store refreshed:', action);
    }
});

// Project-level events
project.on({
    // Fires when any store changes
    change: ({ store, action, record, records, changes }) => {
        console.log(`${store.id} changed:`, action);
    },

    // Fires when scheduling engine completes calculations
    dataReady: ({ isInitialCommit, records }) => {
        console.log('Data ready, modified records:', records.size);

        // Access modifications on each record
        records.forEach(record => {
            console.log(record.name, record.modifications);
        });
    },

    // CRUD events
    beforeLoad: ({ pack }) => { /* can return false to cancel */ },
    load: ({ response }) => { /* data loaded */ },
    beforeSync: ({ pack }) => { /* can return false to cancel */ },
    sync: ({ response }) => { /* data synced */ },

    // Change tracking
    hasChanges: () => { console.log('Has unsaved changes'); },
    noChanges: () => { console.log('All changes saved'); }
});
```

### Batching Changes

For performance, batch multiple changes:

```typescript
// Using beginBatch/endBatch on a model
const task = project.taskStore.getById(1);
task.beginBatch();
task.startDate = new Date('2024-02-01');
task.duration = 10;
task.name = 'Updated Task';
task.endBatch(); // Triggers single update event

// Suspending events on store
project.taskStore.suspendEvents();
// ... make many changes ...
project.taskStore.resumeEvents();
project.taskStore.trigger('refresh');
```

---

## Parent-Child Task Trees

### Tree Structure

Tasks form a hierarchical tree structure. Parent tasks (summary tasks) aggregate their children.

```typescript
interface TaskModel {
    // Tree navigation
    parent: TaskModel;
    parentId: string | number | null;
    children: TaskModel[];
    firstChild: TaskModel;
    lastChild: TaskModel;
    nextSibling: TaskModel;
    previousSibling: TaskModel;

    // Tree state
    isLeaf: boolean;
    isParent: boolean;
    isRoot: boolean;
    isExpanded: boolean;

    // Tree operations
    appendChild(child: TaskModel | TaskModelConfig): TaskModel;
    insertChild(child: TaskModel, before?: TaskModel): TaskModel;
    removeChild(child: TaskModel): TaskModel;
    clearChildren(): TaskModel[];

    // Traversal
    bubble(fn: (node: TaskModel) => void, skipSelf?: boolean): void;
    bubbleWhile(fn: (node: TaskModel) => boolean): boolean;
    contains(child: TaskModel | string | number): boolean;
}
```

### Defining Tree Data

```typescript
const project = new ProjectModel({
    tasks: [
        {
            id: 1,
            name: 'Project Phase 1',
            expanded: true,
            children: [
                {
                    id: 2,
                    name: 'Design',
                    startDate: '2024-01-01',
                    duration: 5,
                    children: [
                        { id: 3, name: 'Wireframes', duration: 2 },
                        { id: 4, name: 'Mockups', duration: 3 }
                    ]
                },
                {
                    id: 5,
                    name: 'Development',
                    startDate: '2024-01-06',
                    duration: 10
                }
            ]
        }
    ]
});
```

### Summary Task Behavior

Parent tasks automatically aggregate child data:

```typescript
// Parent task dates are calculated from children
const parent = project.taskStore.getById(1);

// These are read-only for parent tasks:
console.log(parent.startDate);  // Earliest child start
console.log(parent.endDate);    // Latest child end
console.log(parent.duration);   // Calculated from start/end

// Effort rolls up from children
console.log(parent.effort);     // Sum of child efforts

// Percent done can be auto-calculated
project.autoCalculatePercentDoneForParentTasks = true;
```

### WBS (Work Breakdown Structure)

```typescript
// WBS is automatically calculated
const task = project.taskStore.getById(4);
console.log(task.wbsValue);  // e.g., "1.1.2"

// Refresh WBS after structural changes
task.refreshWbs();
```

---

## Assignment Linking

### AssignmentModel Structure

```typescript
interface AssignmentModel {
    // Key fields
    id: string | number;
    event: string | number | TaskModel;    // Reference to task
    eventId: string | number;
    resource: string | number | ResourceModel;  // Reference to resource
    resourceId: string | number;

    // Assignment properties
    units: number;          // Percentage allocation (0-100+)
    effort: number;         // Effort contributed
    effortUnit: string;

    // Time-phased assignments
    startDate?: Date;
    endDate?: Date;
    duration?: number;
    durationUnit?: string;
}
```

### Creating Assignments

```typescript
// Method 1: Via AssignmentStore
const assignment = project.assignmentStore.add({
    eventId: 1,
    resourceId: 1,
    units: 100
});

// Method 2: Via convenience method
const assignments = project.assignmentStore.assignEventToResource(
    task,
    [resource1, resource2],
    (assignment) => {
        assignment.units = 50;  // Setup function
        return assignment;
    }
);

// Method 3: Async version (waits for calculations)
const newAssignments = await project.assignmentStore.addAsync({
    eventId: 1,
    resourceId: 2,
    units: 50
});
```

### Querying Assignments

```typescript
// Get all assignments for a task
const taskAssignments = task.assignments;

// Get all resources assigned to a task
const assignedResources = task.assigned;  // Returns Set

// Get assignment for specific task+resource
const assignment = project.assignmentStore.getAssignmentForEventAndResource(
    task, resource
);

// Get all assignments for a resource
const resourceAssignments = project.assignmentStore.getAssignmentsForResource(
    resource
);

// Check if task is assigned to resource
const isAssigned = project.assignmentStore.isEventAssignedToResource(
    taskId, resourceId
);
```

### Resource Allocation

```typescript
// Resource properties
interface ResourceModel {
    maxUnits: number;           // Maximum allocation capacity (default 100%)
    events: TaskModel[];        // All assigned tasks
    assignments: AssignmentModel[];
}

// Check allocation
const resource = project.resourceStore.getById(1);
const tasks = resource.events;
const totalUnits = resource.assignments.reduce(
    (sum, a) => sum + a.units, 0
);
const isOverallocated = totalUnits > resource.maxUnits;
```

---

## Change Tracking and Dirty State

### Model-Level Tracking

```typescript
interface Model {
    // Change state
    readonly isModified: boolean;
    readonly isPhantom: boolean;     // New, not yet persisted
    readonly isPersistable: boolean;

    // Modification details
    readonly modifications: object;  // Field name -> new value
    readonly modificationData: object;  // Uses dataSource names

    // Methods
    isFieldModified(fieldName: string): boolean;
    getUnmodified(fieldName: string): any;
    clearChanges(): void;
}
```

### Store-Level Tracking

```typescript
interface Store {
    // Change collections
    readonly added: Model[];
    readonly removed: Model[];
    readonly modified: Model[];

    // Methods
    commit(): void;           // Clears change tracking
    revertChanges(): void;    // Reverts all changes
    acceptChanges(): void;    // Clears changes without reverting
}
```

### Project-Level Changes

```typescript
// Get all changes across all stores
const changes = project.changes;
/*
Returns:
{
    tasks: {
        added: [...],
        updated: [...],
        removed: [...]
    },
    resources: { ... },
    assignments: { ... },
    dependencies: { ... }
}
*/

// Accept all changes (clear dirty state)
project.acceptChanges();

// Suspend/resume change tracking
project.suspendChangeTracking();
// ... make changes that shouldn't be tracked ...
project.resumeChangeTracking();
```

### Listening to Change State

```typescript
project.on({
    hasChanges: () => {
        // Enable save button
        saveButton.disabled = false;
    },
    noChanges: () => {
        // Disable save button
        saveButton.disabled = true;
    }
});

// Check current state
if (project.changes) {
    console.log('Has unsaved changes');
}
```

---

## Practical Patterns

### Pattern 1: Loading External Data

```typescript
async function loadProjectData() {
    const project = new ProjectModel();

    // Fetch data from multiple sources
    const [tasks, resources, assignments] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/resources').then(r => r.json()),
        fetch('/api/assignments').then(r => r.json())
    ]);

    // Load all at once using inlineData
    project.inlineData = {
        tasks: { rows: tasks },
        resources: { rows: resources },
        assignments: { rows: assignments }
    };

    // Wait for scheduling calculations
    await project.commitAsync();

    return project;
}
```

### Pattern 2: Reactive Updates (React/Vue/Angular)

```typescript
// React example with useMemo
const projectConfig = useMemo(() => ({
    tasks: tasksFromState,
    resources: resourcesFromState,
    assignments: assignmentsFromState,
    taskStore: {
        syncDataOnLoad: true  // Smart diffing
    }
}), [tasksFromState, resourcesFromState, assignmentsFromState]);

// ProjectModel will diff and update only changed records
```

### Pattern 3: Undo/Redo with STM

```typescript
// Project uses State Tracking Manager (STM)
const project = new ProjectModel({
    stm: {
        autoRecord: true,
        disabled: false
    }
});

// After setup
project.stm.enable();

// User makes changes...
// Later:
project.stm.undo();  // Undo last action
project.stm.redo();  // Redo

// Check state
const canUndo = project.stm.canUndo;
const canRedo = project.stm.canRedo;
```

### Pattern 4: Validating Before Save

```typescript
async function saveProject(project: ProjectModel) {
    const changes = project.changes;

    if (!changes) {
        console.log('No changes to save');
        return;
    }

    // Validate added/updated tasks
    const invalidTasks = [];

    for (const task of [...(changes.tasks?.added || []),
                        ...(changes.tasks?.updated || [])]) {
        if (!task.isValid) {
            invalidTasks.push(task);
        }
    }

    if (invalidTasks.length > 0) {
        throw new Error('Some tasks are invalid');
    }

    // Perform sync
    try {
        await project.sync();
        console.log('Save successful');
    } catch (error) {
        console.error('Save failed:', error);
    }
}
```

### Pattern 5: Custom Field Mapping

```typescript
class CustomTaskModel extends TaskModel {
    static get fields() {
        return [
            // Map server field names to model field names
            { name: 'name', dataSource: 'task_name' },
            { name: 'startDate', dataSource: 'start_date' },
            { name: 'duration', dataSource: 'task_duration' },

            // Custom fields
            { name: 'priority', type: 'number', defaultValue: 1 },
            { name: 'customField', persist: true }
        ];
    }
}

const project = new ProjectModel({
    taskStore: {
        modelClass: CustomTaskModel
    }
});
```

### Pattern 6: Handling Large Data Sets

```typescript
const project = new ProjectModel({
    // Enable lazy loading
    lazyLoad: true,
    loadUrl: '/api/gantt/load',

    // Batch visual updates
    taskStore: {
        // Suspend events during bulk operations
        useRawData: true  // Better performance for remote data
    }
});

// For bulk updates
async function bulkUpdate(updates: TaskModelConfig[]) {
    project.taskStore.suspendEvents();

    for (const update of updates) {
        const task = project.taskStore.getById(update.id);
        if (task) {
            task.set(update);
        }
    }

    project.taskStore.resumeEvents();

    // Trigger single refresh
    await project.commitAsync();
}
```

---

## 9. Chronograph Scheduling Engine

The Chronograph engine is the reactive computation graph that powers Bryntum Gantt's scheduling calculations.

### What is Chronograph?

Chronograph is an open-source library (MIT licensed) developed by Bryntum that provides:
- Reactive field calculations (similar to spreadsheet formulas)
- Automatic dependency tracking between computed values
- Incremental recalculation (only affected values update)
- Transaction-based commits

### How Chronograph Works

```
┌────────────────────────────────────────────────────────────────────┐
│                        Chronograph Graph                            │
│                                                                      │
│   ┌─────────┐     ┌──────────┐     ┌─────────┐                     │
│   │startDate│────▶│ duration │────▶│ endDate │                     │
│   └─────────┘     └──────────┘     └─────────┘                     │
│        │                                  │                          │
│        │         ┌──────────────┐         │                          │
│        └────────▶│  dependency  │◀────────┘                         │
│                  │   (from)     │                                   │
│                  └──────────────┘                                   │
│                         │                                           │
│                  ┌──────▼──────┐                                    │
│                  │   successor │                                    │
│                  │  startDate  │                                    │
│                  └─────────────┘                                    │
└────────────────────────────────────────────────────────────────────┘
```

### The commitAsync() Flow

```typescript
// All scheduling calculations go through commitAsync()
const project = new ProjectModel({
    tasksData: [...],
    dependenciesData: [...]
});

// Wait for initial scheduling calculation
await project.commitAsync();

// Make a change
const task = project.taskStore.getById(1);
task.startDate = new Date('2024-01-15');

// Chronograph will:
// 1. Mark task's startDate as dirty
// 2. Find all fields that depend on startDate (endDate, successor startDates, etc.)
// 3. Mark those as dirty too (cascading)
// 4. Recalculate only the dirty fields
// 5. Apply the results

await project.commitAsync();
```

### Computed Fields in TaskModel

Many fields on TaskModel are computed by Chronograph:

```typescript
interface TaskModelComputedFields {
    // Dates (computed from constraints, dependencies, calendars)
    startDate: Date;      // Computed or set
    endDate: Date;        // Computed from startDate + duration
    earlyStartDate: Date; // Earliest possible start
    earlyEndDate: Date;   // Earliest possible end
    lateStartDate: Date;  // Latest possible start (backward pass)
    lateEndDate: Date;    // Latest possible end

    // Slack
    totalSlack: number;   // Time task can slip without delaying project
    freeSlack: number;    // Time task can slip without delaying successors
    criticalPath: boolean; // true if totalSlack === 0

    // Effort calculations
    effort: number;       // Computed from duration * assignment units
    effectiveCalendar: CalendarModel; // Resolved calendar

    // Rollup for parent tasks
    percentDone: number;  // Can be auto-calculated from children
}
```

### Manual vs Automatic Calculation

```typescript
// Disable automatic scheduling for specific tasks
const task = {
    id: 1,
    name: 'Manual Task',
    manuallyScheduled: true,  // Chronograph won't compute dates
    startDate: '2024-01-10',
    endDate: '2024-01-20'
};

// For entire project
const project = new ProjectModel({
    autoCalculatePercentDone: false,  // Don't roll up percentDone
    skipNonWorkingTimeWhenScheduling: true
});
```

### Propagation Control

```typescript
// Propagate changes immediately (default)
await project.commitAsync();

// Propagate with timeout (for batching UI updates)
project.propagate();  // Non-blocking, schedules microtask

// Check if propagation is needed
if (project.isEngineReady) {
    // All calculations are complete
}

// Listen for propagation completion
project.on('dataReady', () => {
    console.log('All calculations complete');
});
```

### Constraint Propagation Example

```
Task A: startDate=Jan 1, duration=5 days → endDate=Jan 6
    │
    │ FS dependency (lag: 2 days)
    ▼
Task B: constraint propagates → startDate=Jan 8 (Jan 6 + 2 days)
    │
    │ FS dependency
    ▼
Task C: constraint propagates → startDate=calculated from Task B
```

```typescript
// The Chronograph engine handles this automatically:
const taskA = project.taskStore.getById('A');
taskA.duration = 10;  // Change duration

// After commitAsync(), Task B and C's dates are recalculated
await project.commitAsync();

const taskB = project.taskStore.getById('B');
console.log(taskB.startDate);  // Automatically updated
```

---

## 10. Cross-References

### Related Deep-Dive Documents

| Document | Relationship |
|----------|--------------|
| [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) | Scheduling modes, constraints, calendars |
| [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md) | Server synchronization of data |
| [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) | Store and model events |
| [DEEP-DIVE-DEPENDENCIES](./DEEP-DIVE-DEPENDENCIES.md) | Dependency data and propagation |
| [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) | React data binding patterns (Redux, RTK Query) |
| [DEEP-DIVE-DEMO-PATTERNS](./DEEP-DIVE-DEMO-PATTERNS.md) | Custom TaskModel, data loading patterns |

### Key API References (Level 1)

- `ProjectModelConfig` - Project data configuration
- `TaskModelConfig` - Task model fields
- `ResourceModelConfig` - Resource model fields
- `DependencyModelConfig` - Dependency model fields
- `AssignmentModelConfig` - Assignment model fields

---

## Summary

The Bryntum Gantt data flow architecture is built around these key concepts:

1. **ProjectModel as Hub**: All stores are coordinated through the ProjectModel
2. **Four Core Stores**: TaskStore, ResourceStore, AssignmentStore, DependencyStore
3. **Tree-Based Tasks**: Tasks form a hierarchical structure with automatic rollup
4. **Assignment Bridge**: Assignments link tasks to resources with allocation tracking
5. **Event-Driven Updates**: Changes propagate through events for reactive UIs
6. **Flexible Loading**: Support for inline data, URL loading, and lazy loading
7. **Change Tracking**: Built-in dirty state management at model, store, and project levels

Understanding these patterns enables efficient integration with modern frameworks and backends while leveraging Bryntum Gantt's powerful scheduling engine.
