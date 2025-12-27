# TaskBoard Internals: Stores & Data Models

> **Reverse-engineered uit Bryntum TaskBoard 7.1.0**
> Volledige documentatie over de store architectuur, models en data flow.

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Store Architectuur](#store-architectuur)
3. [ProjectModel](#projectmodel)
4. [TaskStore & TaskModel](#taskstore--taskmodel)
5. [Column Store & ColumnModel](#column-store--columnmodel)
6. [Swimlane Store & SwimlaneModel](#swimlane-store--swimlanemodel)
7. [ResourceStore & AssignmentStore](#resourcestore--assignmentstore)
8. [Store Events](#store-events)
9. [Chained Stores](#chained-stores)
10. [Filtering & Sorting](#filtering--sorting)
11. [Custom Models](#custom-models)
12. [Data Loading Patterns](#data-loading-patterns)
13. [Complete TypeScript Interfaces](#complete-typescript-interfaces)

---

## Overzicht

TaskBoard gebruikt een hiërarchische store structuur met ProjectModel als centraal punt:

```
┌───────────────────────────────────────────────────────┐
│                    ProjectModel                        │
│   (Central data container + CrudManager)              │
├───────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │  TaskStore  │  │ResourceStore│  │AssignmentStore│  │
│  │ (TaskModel) │  │(ResourceModel)│ │(AssignmentModel)│ │
│  └─────────────┘  └─────────────┘  └───────────────┘  │
│         │                                              │
│         ▼                                              │
│  ┌─────────────────────────────────────────────────┐  │
│  │   Column Chained Stores (per column)            │  │
│  │   (gefilterd op columnField waarde)             │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
└───────────────────────────────────────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│    Column Store     │  │   Swimlane Store    │
│   (ColumnModel)     │  │  (SwimlaneModel)    │
│   (op TaskBoard)    │  │   (op TaskBoard)    │
└─────────────────────┘  └─────────────────────┘
```

### Key Concepts

- **ProjectModel**: Bevat TaskStore, ResourceStore, AssignmentStore + CrudManager
- **Column/Swimlane Stores**: Beheerd door TaskBoard zelf, niet door Project
- **Chained Stores**: Elke column krijgt een gefilterde view op de TaskStore
- **Events**: Stores triggeren events bij data changes

---

## Store Architectuur

### Store Class Hierarchy

```
Store (Core/data/Store)
    └── AjaxStore (Core/data/AjaxStore)
            ├── EventStore (Scheduler/data/EventStore)
            │       └── TaskStore (TaskBoard/store/TaskStore)
            │
            ├── ResourceStore (Scheduler/data/ResourceStore)
            │
            └── AssignmentStore (Scheduler/data/AssignmentStore)
```

### TaskBoard Store Access

```javascript
const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'data/data.json',
        autoLoad: true
    }
});

// Access stores via project
const taskStore = taskBoard.project.taskStore;
const resourceStore = taskBoard.project.resourceStore;
const assignmentStore = taskBoard.project.assignmentStore;

// Access column/swimlane stores via TaskBoard
const columnStore = taskBoard.columns;  // Store instance
const swimlaneStore = taskBoard.swimlanes;  // Store instance
```

---

## ProjectModel

### ProjectModel Configuration

```typescript
interface ProjectModelConfig {
    // Data loading
    loadUrl?: string;
    syncUrl?: string;
    autoLoad?: boolean;
    autoSync?: boolean;

    // Inline data
    tasks?: TaskModel[] | object[];
    resources?: ResourceModel[] | object[];
    assignments?: AssignmentModel[] | object[];

    // Store configurations
    taskStore?: TaskStore | TaskStoreConfig;
    resourceStore?: ResourceStore | ResourceStoreConfig;
    assignmentStore?: AssignmentStore | AssignmentStoreConfig;

    // Model classes
    taskModelClass?: typeof TaskModel;
    resourceModelClass?: typeof ResourceModel;
    assignmentModelClass?: typeof AssignmentModel;

    // Sync options
    useRawData?: boolean;
    writeAllFields?: boolean;
}
```

### Usage

```javascript
const taskBoard = new TaskBoard({
    project: {
        // Load from URL
        loadUrl: 'api/data',
        syncUrl: 'api/sync',
        autoLoad: true,
        autoSync: true,

        // Or inline data
        tasks: [
            { id: 1, name: 'Task 1', status: 'todo' },
            { id: 2, name: 'Task 2', status: 'doing' }
        ],
        resources: [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' }
        ],
        assignments: [
            { id: 1, resourceId: 1, eventId: 1 }
        ],

        // Custom model class
        taskModelClass: MyCustomTask
    }
});
```

### ProjectModel Properties

```javascript
// Access stores
const taskStore = project.taskStore;
const resourceStore = project.resourceStore;
const assignmentStore = project.assignmentStore;

// Get/set inline data
const data = project.inlineData;
project.inlineData = { tasks: [...], resources: [...] };

// JSON serialization
const json = project.json;
project.json = '{ "tasks": [...] }';

// Loading state
const isLoading = project.isLoading;

// Changes pending
const hasChanges = project.changes;  // { added: [], modified: [], removed: [] }
```

### ProjectModel Methods

```javascript
// Load data
await project.load();

// Load inline data
await project.loadInlineData({
    tasks: [...],
    resources: [...],
    assignments: [...]
});

// Sync changes
await project.sync();

// Cancel pending changes
project.rejectChanges();

// Accept all changes
project.acceptChanges();

// Export to JSON
const data = project.toJSON();
```

---

## TaskStore & TaskModel

### TaskStore

```typescript
interface TaskStoreConfig extends AjaxStoreConfig {
    modelClass?: typeof TaskModel;
}

class TaskStore extends EventStore {
    static readonly isTaskStore: boolean;
    readonly isTaskStore: boolean;
}
```

### TaskModel Fields

```typescript
interface TaskModelConfig {
    // Identity
    id?: string | number;
    name?: string;

    // TaskBoard specific
    status?: string;          // Maps to columnField
    priority?: string;        // Maps to swimlaneField
    weight?: number;          // Sort order within column
    collapsed?: boolean;      // Card collapsed state

    // Display
    description?: string;
    eventColor?: NamedColor | string;
    cls?: string;
    style?: string;
    iconCls?: string;

    // Event properties (inherited)
    startDate?: Date;
    endDate?: Date;
    duration?: number;
    durationUnit?: string;

    // Custom fields
    [key: string]: any;
}
```

### TaskModel Properties

```javascript
const task = taskStore.getById(1);

// Core properties
task.name;          // 'Task 1'
task.status;        // 'todo' (column mapping)
task.priority;      // 'high' (swimlane mapping)
task.weight;        // 100 (sort order)
task.collapsed;     // false

// Display
task.description;   // 'Task description'
task.eventColor;    // 'blue'
task.cls;           // 'custom-class'
task.style;         // 'color: red'
task.iconCls;       // 'b-fa-star'

// Relationships
task.resources;     // Assigned ResourceModels[]
task.assignments;   // AssignmentModels[]

// Status
task.isTaskModel;   // true
```

### TaskModel Methods

```javascript
// Move to different column
task.status = 'done';  // Updates columnField

// Move to different swimlane
task.priority = 'low';  // Updates swimlaneField

// Change weight (sort order)
task.weight = 50;

// Assign resource
task.assign(resourceRecord);

// Unassign resource
task.unassign(resourceRecord);

// Get assigned resources
const resources = task.resources;

// Collapse/expand card
task.collapsed = true;
```

---

## Column Store & ColumnModel

### Column Store Configuration

```javascript
// Columns can be specified as:
// 1. Array of ColumnModel configs
// 2. Array of strings (auto-creates ColumnModels)
// 3. Store instance
// 4. Store config

const taskBoard = new TaskBoard({
    columnField: 'status',

    // Option 1: Array of configs
    columns: [
        { id: 'todo', text: 'Todo', color: 'yellow' },
        { id: 'doing', text: 'In Progress', color: 'blue' },
        { id: 'done', text: 'Done', color: 'green' }
    ],

    // Option 2: Array of strings
    columns: ['todo', 'doing', 'done'],

    // Option 3: Store config
    columns: {
        data: [
            { id: 'todo', text: 'Todo' }
        ]
    }
});
```

### ColumnModel Fields

```typescript
interface ColumnModelConfig {
    // Identity
    id?: string | number;
    text?: string;
    tooltip?: string;

    // Display
    color?: NamedColor | string;
    hidden?: boolean;
    collapsed?: boolean;
    collapsible?: boolean;

    // Layout
    flex?: number;
    width?: number;
    tasksPerRow?: number;

    // Behavior
    locked?: boolean;           // Cannot drag tasks out
    canMoveInto?: boolean;      // Can drag tasks into

    // Custom
    [key: string]: any;
}
```

### ColumnModel Properties

```javascript
const column = taskBoard.columns.getById('todo');

// Core properties
column.id;           // 'todo'
column.text;         // 'Todo'
column.tooltip;      // 'Tasks to do'
column.color;        // 'yellow'

// State
column.collapsed;    // false
column.collapsible;  // true
column.hidden;       // false

// Layout
column.flex;         // 1
column.width;        // null
column.tasksPerRow;  // undefined (uses global)

// Related data
column.tasks;        // TaskModel[] in this column
column.taskCount;    // Number of tasks

// Status
column.isColumnModel; // true
```

### ColumnModel Methods

```javascript
// Collapse/expand
column.collapse();
column.expand();

// Hide/show
column.hidden = true;
column.hidden = false;

// Access tasks
const tasks = column.tasks;
const count = column.taskCount;
```

### Column Store Access

```javascript
// Access column store
const columnStore = taskBoard.columns;

// Query columns
const todoColumn = columnStore.getById('todo');
const visibleColumns = columnStore.query(c => !c.hidden);
const firstColumn = columnStore.first;
const lastColumn = columnStore.last;

// Iterate
columnStore.forEach(column => {
    console.log(column.text, column.taskCount);
});

// Add column
columnStore.add({ id: 'review', text: 'Review', color: 'orange' });

// Remove column
columnStore.remove(columnStore.getById('review'));

// Reorder columns
columnStore.move(todoColumn, 2);  // Move to index 2
```

---

## Swimlane Store & SwimlaneModel

### Swimlane Store Configuration

```javascript
const taskBoard = new TaskBoard({
    swimlaneField: 'priority',

    // Option 1: Array of configs
    swimlanes: [
        { id: 'high', text: 'High Priority', color: 'red' },
        { id: 'medium', text: 'Medium', color: 'orange' },
        { id: 'low', text: 'Low Priority', color: 'green' }
    ],

    // Option 2: Array of strings
    swimlanes: ['high', 'medium', 'low'],

    // Option 3: Auto-generate from data
    autoGenerateSwimlanes: true
});
```

### SwimlaneModel Fields

```typescript
interface SwimlaneModelConfig {
    // Identity
    id?: string | number;
    text?: string;

    // Display
    color?: NamedColor | string;
    collapsed?: boolean;
    collapsible?: boolean;

    // Layout
    flex?: number;
    height?: number;
    tasksPerRow?: number;

    // Custom
    [key: string]: any;
}
```

### SwimlaneModel Properties

```javascript
const swimlane = taskBoard.swimlanes.getById('high');

// Core properties
swimlane.id;           // 'high'
swimlane.text;         // 'High Priority'
swimlane.color;        // 'red'

// State
swimlane.collapsed;    // false
swimlane.collapsible;  // true

// Layout
swimlane.flex;         // 1
swimlane.height;       // null
swimlane.tasksPerRow;  // undefined (uses global)

// Related data
swimlane.tasks;        // TaskModel[] in this swimlane

// Status
swimlane.isSwimlaneModel; // true
```

### Swimlane Store Access

```javascript
// Access swimlane store
const swimlaneStore = taskBoard.swimlanes;

// Query swimlanes
const highPriority = swimlaneStore.getById('high');
const expandedSwimlanes = swimlaneStore.query(s => !s.collapsed);

// Iterate
swimlaneStore.forEach(swimlane => {
    console.log(swimlane.text, swimlane.tasks.length);
});
```

---

## ResourceStore & AssignmentStore

### ResourceStore

```javascript
const taskBoard = new TaskBoard({
    resourceImagePath: 'images/users/',

    project: {
        resources: [
            { id: 1, name: 'John Doe', image: 'john.jpg' },
            { id: 2, name: 'Jane Smith', image: 'jane.jpg' }
        ]
    }
});

// Access
const resourceStore = taskBoard.project.resourceStore;
const john = resourceStore.getById(1);

// Resource properties
john.name;     // 'John Doe'
john.image;    // 'john.jpg'
john.events;   // Tasks assigned to this resource
```

### AssignmentStore

```javascript
// Assignments link tasks to resources
const taskBoard = new TaskBoard({
    project: {
        tasks: [
            { id: 1, name: 'Task 1' }
        ],
        resources: [
            { id: 1, name: 'John' }
        ],
        assignments: [
            { id: 1, resourceId: 1, eventId: 1 }
        ]
    }
});

// Access
const assignmentStore = taskBoard.project.assignmentStore;

// Create assignment
const assignment = assignmentStore.add({
    resourceId: 2,
    eventId: 1
});

// Remove assignment
assignmentStore.remove(assignment);
```

### ResourceAvatars Display

```javascript
const taskBoard = new TaskBoard({
    // Path to avatar images
    resourceImagePath: 'images/users/',

    // Show avatars in footer
    footerItems: {
        resourceAvatars: { type: 'resourceAvatars' }
    }
});
```

---

## Store Events

### Task Store Events

```javascript
taskBoard.project.taskStore.on({
    // Record added
    add({ records }) {
        console.log('Tasks added:', records.map(t => t.name));
    },

    // Record removed
    remove({ records }) {
        console.log('Tasks removed:', records.map(t => t.name));
    },

    // Record updated
    update({ record, changes }) {
        console.log('Task updated:', record.name, changes);
    },

    // Data completely changed (load, filter, sort)
    refresh({ action }) {
        console.log('Store refreshed due to:', action);
        // action: 'dataset', 'sort', 'filter', 'clearchanges', etc.
    },

    // Before load
    beforeLoad({ params }) {
        console.log('About to load with params:', params);
    },

    // After load
    load({ data }) {
        console.log('Loaded data:', data);
    }
});
```

### Project Events

```javascript
taskBoard.project.on({
    // Any store changed
    change({ store, action, record, records, changes }) {
        console.log(`${store.id} changed:`, action);
    },

    // Before load
    beforeLoad() {
        console.log('Loading data...');
    },

    // After load
    load() {
        console.log('Data loaded');
    },

    // Before sync
    beforeSync({ pack }) {
        console.log('Syncing:', pack);
    },

    // After sync
    sync({ response }) {
        console.log('Synced:', response);
    },

    // Sync failed
    syncFail({ response, responseText }) {
        console.error('Sync failed:', responseText);
    }
});
```

### Column/Swimlane Store Events

```javascript
taskBoard.columns.on({
    add({ records }) {
        console.log('Columns added:', records);
    },

    remove({ records }) {
        console.log('Columns removed:', records);
    },

    update({ record, changes }) {
        console.log('Column updated:', record.text, changes);
    }
});

taskBoard.swimlanes.on({
    add({ records }) {
        console.log('Swimlanes added:', records);
    }
});
```

---

## Chained Stores

### How Chained Stores Work

Elke column krijgt een **chained store** - een gefilterde view op de master TaskStore:

```
TaskStore (master)
    │
    ├── Column "todo" chained store
    │   └── Filter: task.status === 'todo'
    │
    ├── Column "doing" chained store
    │   └── Filter: task.status === 'doing'
    │
    └── Column "done" chained store
        └── Filter: task.status === 'done'
```

### Accessing Chained Stores

```javascript
// Get column's chained task store
const todoColumn = taskBoard.columns.getById('todo');
const todoTasks = todoColumn.tasks;  // Array van TaskModels

// Internal: get actual chained store (not exposed in public API)
// const chainedStore = column._taskStore;
```

### chainFilters Configuration

```javascript
const taskBoard = new TaskBoard({
    // By default, project filters don't apply to column stores
    // Set chainFilters: true to apply them
    chainFilters: true,

    project: {
        taskStore: {
            filters: [
                // This filter will now also apply to column stores
                { property: 'active', value: true }
            ]
        }
    }
});
```

### Chained Store Behavior

```javascript
// Filters on master store
taskBoard.project.taskStore.filter({
    property: 'priority',
    value: 'high'
});

// With chainFilters: false (default)
// - Column stores show ALL tasks (ignoring project filter)
// - Only the column's own filter (status) applies

// With chainFilters: true
// - Column stores respect project filter
// - Show only high priority tasks per column
```

---

## Filtering & Sorting

### Task Store Filtering

```javascript
// Simple filter
taskBoard.project.taskStore.filter({
    property: 'priority',
    value: 'high'
});

// Multiple filters
taskBoard.project.taskStore.filter([
    { property: 'priority', value: 'high' },
    { property: 'active', value: true }
]);

// Filter function
taskBoard.project.taskStore.filter(task => {
    return task.priority === 'high' && task.dueDate < new Date();
});

// Clear filters
taskBoard.project.taskStore.clearFilters();
```

### Column-level Filtering

```javascript
// Filter tasks in a specific column
const todoColumn = taskBoard.columns.getById('todo');

// Via FilterBar feature
taskBoard.features.filterBar.show();

// Programmatic filtering per column
taskBoard.project.taskStore.filter({
    id: 'columnFilter',
    filterBy: task => {
        if (task.status === 'todo') {
            return task.priority === 'high';
        }
        return true;
    }
});
```

### Task Sorting

```javascript
// Sort task store
taskBoard.project.taskStore.sort('name', 'asc');

// Multiple sorters
taskBoard.project.taskStore.sort([
    { field: 'priority', direction: 'desc' },
    { field: 'name', direction: 'asc' }
]);

// Custom sort function
taskBoard.project.taskStore.sort((a, b) => {
    return a.weight - b.weight;
});

// TaskBoard-specific sorting (per column)
const taskBoard = new TaskBoard({
    taskSorterFn(first, second) {
        // Negative: first before second
        // Positive: second before first
        return first.weight - second.weight;
    }
});
```

### Column Sorting (via ColumnSort feature)

```javascript
const taskBoard = new TaskBoard({
    features: {
        columnSort: {
            // Sorters available in UI
            sorters: [
                { field: 'name', label: 'Name' },
                { field: 'weight', label: 'Weight' },
                { field: 'dueDate', label: 'Due Date' },
                {
                    field: 'priority',
                    label: 'Priority',
                    fn: (a, b) => {
                        const order = { high: 1, medium: 2, low: 3 };
                        return order[a.priority] - order[b.priority];
                    }
                }
            ]
        }
    }
});
```

---

## Custom Models

### Custom TaskModel

```javascript
import { TaskModel } from '@bryntum/taskboard';

class MyTask extends TaskModel {
    static fields = [
        // Add custom fields
        'customField',
        { name: 'priority', type: 'string', defaultValue: 'medium' },
        { name: 'dueDate', type: 'date' },
        { name: 'tags', type: 'array' },
        { name: 'completed', type: 'boolean', defaultValue: false }
    ];

    // Custom getter
    get isOverdue() {
        return this.dueDate && this.dueDate < new Date() && !this.completed;
    }

    // Custom method
    markComplete() {
        this.set({
            completed: true,
            status: 'done'
        });
    }
}

const taskBoard = new TaskBoard({
    project: {
        taskModelClass: MyTask
    }
});
```

### Custom ColumnModel

```javascript
import { ColumnModel, Store } from '@bryntum/taskboard';

class MyColumn extends ColumnModel {
    static fields = [
        'maxTasks',       // WIP limit
        'owner',          // Column owner
        'description'
    ];

    get isOverCapacity() {
        return this.maxTasks && this.tasks.length > this.maxTasks;
    }
}

const taskBoard = new TaskBoard({
    columns: new Store({
        modelClass: MyColumn,
        data: [
            { id: 'todo', text: 'Todo', maxTasks: 10, owner: 'John' },
            { id: 'doing', text: 'In Progress', maxTasks: 5, owner: 'Jane' }
        ]
    })
});
```

### Custom SwimlaneModel

```javascript
import { SwimlaneModel, Store } from '@bryntum/taskboard';

class MySwimlane extends SwimlaneModel {
    static fields = [
        'team',
        'budget'
    ];

    get budgetUsed() {
        return this.tasks.reduce((sum, task) => sum + (task.cost || 0), 0);
    }
}

const taskBoard = new TaskBoard({
    swimlanes: new Store({
        modelClass: MySwimlane,
        data: [
            { id: 'dev', text: 'Development', team: 'Dev Team', budget: 10000 }
        ]
    })
});
```

---

## Data Loading Patterns

### Remote Loading via Project

```javascript
const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'api/load',
        autoLoad: true,

        // Load parameters
        loadParams: {
            projectId: 123
        }
    }
});

// Expected response format
{
    "success": true,
    "tasks": {
        "rows": [
            { "id": 1, "name": "Task 1", "status": "todo" }
        ]
    },
    "resources": {
        "rows": [
            { "id": 1, "name": "John" }
        ]
    },
    "assignments": {
        "rows": [
            { "id": 1, "eventId": 1, "resourceId": 1 }
        ]
    },
    "columns": {
        "rows": [
            { "id": "todo", "text": "Todo" }
        ]
    }
}
```

### Remote Loading Columns

```javascript
// Columns can be loaded as part of project data
const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'api/data.json',
        autoLoad: true
    }
    // columns will be populated from response.columns.rows
});

// data.json
{
    "success": true,
    "columns": {
        "rows": [
            { "id": "todo", "text": "Todo", "color": "yellow" },
            { "id": "doing", "text": "In Progress", "color": "blue" },
            { "id": "done", "text": "Done", "color": "green" }
        ]
    },
    "tasks": {
        "rows": [...]
    }
}
```

### Inline Data Loading

```javascript
const taskBoard = new TaskBoard({
    // Columns inline
    columns: [
        { id: 'todo', text: 'Todo' },
        { id: 'doing', text: 'Doing' },
        { id: 'done', text: 'Done' }
    ],

    // Swimlanes inline
    swimlanes: [
        { id: 'high', text: 'High Priority' },
        { id: 'low', text: 'Low Priority' }
    ],

    // Tasks via project
    project: {
        tasks: [
            { id: 1, name: 'Task 1', status: 'todo', priority: 'high' }
        ],
        resources: [
            { id: 1, name: 'John' }
        ],
        assignments: [
            { id: 1, eventId: 1, resourceId: 1 }
        ]
    }
});
```

### Dynamic Data Updates

```javascript
// Add tasks
const newTask = taskBoard.project.taskStore.add({
    name: 'New Task',
    status: 'todo'
});

// Bulk add
taskBoard.project.taskStore.add([
    { name: 'Task A', status: 'todo' },
    { name: 'Task B', status: 'doing' }
]);

// Update task
newTask.name = 'Updated Task';
newTask.status = 'doing';  // Moves to different column

// Remove task
taskBoard.project.taskStore.remove(newTask);

// Load new data
await taskBoard.project.loadInlineData({
    tasks: [...],
    resources: [...],
    assignments: [...]
});
```

---

## Complete TypeScript Interfaces

```typescript
// ========== Project Model ==========
interface ProjectModelConfig {
    loadUrl?: string;
    syncUrl?: string;
    autoLoad?: boolean;
    autoSync?: boolean;
    autoSyncTimeout?: number;
    validateResponse?: boolean;
    writeAllFields?: boolean;
    useRawData?: boolean;

    tasks?: TaskModel[] | TaskModelConfig[] | object[];
    resources?: ResourceModel[] | ResourceModelConfig[] | object[];
    assignments?: AssignmentModel[] | AssignmentModelConfig[] | object[];

    taskStore?: TaskStore | TaskStoreConfig;
    resourceStore?: ResourceStore | ResourceStoreConfig;
    assignmentStore?: AssignmentStore | AssignmentStoreConfig;

    taskModelClass?: typeof TaskModel;
    resourceModelClass?: typeof ResourceModel;
    assignmentModelClass?: typeof AssignmentModel;
}

class ProjectModel extends SchedulerProjectModel {
    readonly isLoading: boolean;
    readonly isSyncing: boolean;
    readonly changes: {
        added: Model[];
        modified: Model[];
        removed: Model[];
    };

    taskStore: TaskStore;
    resourceStore: ResourceStore;
    assignmentStore: AssignmentStore;

    inlineData: object;
    json: string;

    load(params?: object): Promise<void>;
    loadInlineData(data: object): Promise<void>;
    sync(): Promise<void>;
    acceptChanges(): void;
    rejectChanges(): void;
    toJSON(): object;
}


// ========== Task Model ==========
interface TaskModelConfig {
    id?: string | number;
    name?: string;
    status?: string;
    priority?: string;
    weight?: number;
    collapsed?: boolean;
    description?: string;
    eventColor?: NamedColor | string;
    cls?: string;
    style?: string;
    iconCls?: string;
    startDate?: Date;
    endDate?: Date;
    duration?: number;
    durationUnit?: 'day' | 'hour' | 'minute' | 'week' | 'month';
    [key: string]: any;
}

class TaskModel extends EventModel {
    static readonly isTaskModel: boolean;
    static fields: DataFieldConfig[];

    name: string;
    status: string;
    priority: string;
    weight: number;
    collapsed: boolean;
    description: string;
    eventColor: NamedColor | string;
    cls: string;
    style: string;
    iconCls: string;

    readonly resources: ResourceModel[];
    readonly assignments: AssignmentModel[];
    readonly isTaskModel: boolean;

    assign(resource: ResourceModel | number | string): AssignmentModel;
    unassign(resource: ResourceModel | number | string): void;
}


// ========== Column Model ==========
interface ColumnModelConfig {
    id?: string | number;
    text?: string;
    tooltip?: string;
    color?: NamedColor | string;
    hidden?: boolean;
    collapsed?: boolean;
    collapsible?: boolean;
    flex?: number;
    width?: number;
    tasksPerRow?: number;
    locked?: boolean;
    canMoveInto?: boolean;
    [key: string]: any;
}

class ColumnModel extends Model {
    static readonly isColumnModel: boolean;

    id: string | number;
    text: string;
    tooltip: string;
    color: NamedColor | string;
    hidden: boolean;
    readonly collapsed: boolean;
    collapsible: boolean;
    flex: number;
    width: number;
    tasksPerRow: number;

    readonly tasks: TaskModel[];
    readonly taskCount: number;
    readonly isColumnModel: boolean;

    collapse(): void;
    expand(): void;
}


// ========== Swimlane Model ==========
interface SwimlaneModelConfig {
    id?: string | number;
    text?: string;
    color?: NamedColor | string;
    collapsed?: boolean;
    collapsible?: boolean;
    flex?: number;
    height?: number;
    tasksPerRow?: number;
    [key: string]: any;
}

class SwimlaneModel extends Model {
    static readonly isSwimlaneModel: boolean;

    id: string | number;
    text: string;
    color: NamedColor | string;
    readonly collapsed: boolean;
    collapsible: boolean;
    flex: number;
    height: number;
    tasksPerRow: number;

    readonly tasks: TaskModel[];
    readonly isSwimlaneModel: boolean;

    collapse(): void;
    expand(): void;
}


// ========== Task Store ==========
interface TaskStoreConfig extends AjaxStoreConfig {
    modelClass?: typeof TaskModel;
}

class TaskStore extends EventStore {
    static readonly isTaskStore: boolean;
    readonly isTaskStore: boolean;
}


// ========== Store Events ==========
interface StoreEvents {
    add: (event: {
        source: Store;
        records: Model[];
        allRecords: Model[];
        parent?: Model;
        index?: number;
        isChild?: boolean;
    }) => void;

    remove: (event: {
        source: Store;
        records: Model[];
        allRecords: Model[];
        parent?: Model;
        isChild?: boolean;
    }) => void;

    update: (event: {
        source: Store;
        record: Model;
        changes: object;
    }) => void;

    refresh: (event: {
        source: Store;
        batch: boolean;
        action: 'dataset' | 'sort' | 'clearchanges' | 'filter' |
                'create' | 'update' | 'delete' | 'group';
    }) => void;

    beforeLoad: (event: {
        source: Store;
        params: object;
    }) => void;

    load: (event: {
        source: Store;
        data: object;
    }) => void;
}


// ========== Named Colors ==========
type NamedColor =
    | 'red' | 'pink' | 'magenta' | 'purple' | 'violet'
    | 'deep-purple' | 'indigo' | 'blue' | 'light-blue' | 'cyan'
    | 'teal' | 'green' | 'light-green' | 'lime' | 'yellow'
    | 'orange' | 'amber' | 'deep-orange' | 'light-gray' | 'gray';


// ========== TaskBoard Store Access ==========
interface TaskBoardStoreAccess {
    // Via project
    project: ProjectModel;

    // Column/Swimlane stores (Store instances)
    columns: Store;
    swimlanes: Store;

    // Shortcut accessors
    columnField: string;
    swimlaneField: string;
}
```

---

## Zie Ook

- [TASKBOARD-IMPL-BACKEND-SYNC.md](./TASKBOARD-IMPL-BACKEND-SYNC.md) - CrudManager en sync
- [TASKBOARD-DEEP-DIVE-CARDS.md](./TASKBOARD-DEEP-DIVE-CARDS.md) - Task card rendering
- [TASKBOARD-IMPL-FILTERING.md](./TASKBOARD-IMPL-FILTERING.md) - Filter functionaliteit
- [INTERNALS-STORE.md](./INTERNALS-STORE.md) - Core Store internals

---

*Gegenereerd uit Bryntum TaskBoard 7.1.0 broncode analyse*
*Laatste update: December 2024*
