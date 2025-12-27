# TaskBoard Implementation: Remote Columns

> **Implementatie guide** voor dynamisch laden van kolommen in Bryntum TaskBoard: server-side column configuratie, CRUD operaties, column sync, en lazy loading.

---

## Overzicht

Remote Columns biedt server-gestuurde kolom configuratie:

- **Remote Loading** - Kolommen laden via API
- **Column Store** - Aparte store voor kolom data
- **CRUD Operations** - Create, Read, Update, Delete via server
- **Sync** - Wijzigingen synchroniseren met backend
- **Dynamic Updates** - Real-time kolom wijzigingen

---

## 1. Basic Configuration

### 1.1 TaskBoard Setup

```javascript
import { TaskBoard } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    appendTo: 'container',

    project: {
        // Kolommen komen mee in project data
        loadUrl: 'api/taskboard/load',
        syncUrl: 'api/taskboard/sync',
        autoLoad: true,
        autoSync: true
    },

    // Kolom veld in task data
    columnField: 'status'

    // Kolommen worden geladen via project
});
```

---

## 2. Server Response Format

### 2.1 Load Response

```json
{
    "success": true,
    "columns": {
        "rows": [
            {
                "id": "todo",
                "text": "To Do",
                "color": "blue",
                "index": 0
            },
            {
                "id": "doing",
                "text": "In Progress",
                "color": "orange",
                "index": 1
            },
            {
                "id": "review",
                "text": "Review",
                "color": "purple",
                "index": 2
            },
            {
                "id": "done",
                "text": "Done",
                "color": "green",
                "index": 3
            }
        ]
    },
    "tasks": {
        "rows": [
            {
                "id": 1,
                "name": "Implement feature",
                "status": "doing",
                "description": "Add new functionality"
            }
        ]
    }
}
```

### 2.2 Sync Request

```json
{
    "requestId": 12345,
    "columns": {
        "added": [
            {
                "$PhantomId": "temp_1",
                "text": "New Column",
                "color": "teal",
                "index": 4
            }
        ],
        "updated": [
            {
                "id": "doing",
                "text": "Work In Progress"
            }
        ],
        "removed": [
            { "id": "review" }
        ]
    },
    "tasks": {
        "updated": [
            {
                "id": 1,
                "status": "done"
            }
        ]
    }
}
```

### 2.3 Sync Response

```json
{
    "success": true,
    "requestId": 12345,
    "columns": {
        "rows": [
            {
                "$PhantomId": "temp_1",
                "id": "new_column_5"
            }
        ]
    }
}
```

---

## 3. Column Store Configuration

### 3.1 Separate Column Store

```javascript
import { TaskBoard, Store } from '@bryntum/taskboard';

// Aparte column store
const columnStore = new Store({
    // Automatisch laden
    autoLoad: true,

    // API endpoint
    readUrl: 'api/columns',
    createUrl: 'api/columns',
    updateUrl: 'api/columns',
    deleteUrl: 'api/columns',

    // Auto sync
    autoCommit: true,

    // Sortering
    sorters: [{ field: 'index', ascending: true }]
});

const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Gebruik externe column store
    columns: columnStore,

    columnField: 'status',

    project: {
        loadUrl: 'api/tasks',
        autoLoad: true
    }
});
```

### 3.2 Column Model

```javascript
import { Model } from '@bryntum/taskboard';

class ColumnModel extends Model {
    static fields = [
        'id',
        'text',
        'color',
        { name: 'index', type: 'number' },
        { name: 'collapsed', type: 'boolean', defaultValue: false },
        { name: 'hidden', type: 'boolean', defaultValue: false },
        { name: 'width', type: 'number' },
        { name: 'minWidth', type: 'number', defaultValue: 200 },
        { name: 'maxWidth', type: 'number', defaultValue: 500 }
    ];
}

const columnStore = new Store({
    modelClass: ColumnModel,
    readUrl: 'api/columns',
    autoLoad: true
});
```

---

## 4. CRUD Operations

### 4.1 Add Column

```javascript
// Via store
taskBoard.columns.add({
    id: 'blocked',
    text: 'Blocked',
    color: 'red',
    index: taskBoard.columns.count
});

// Via project sync
taskBoard.project.columnStore.add({
    text: 'New Column',
    color: 'teal'
});

// Trigger sync
await taskBoard.project.sync();
```

### 4.2 Update Column

```javascript
// Find and update
const column = taskBoard.columns.find(c => c.id === 'doing');
column.text = 'Work In Progress';
column.color = 'yellow';

// Trigger sync
await taskBoard.project.sync();
```

### 4.3 Remove Column

```javascript
// Verwijder kolom
const column = taskBoard.columns.find(c => c.id === 'review');

// Optioneel: verplaats taken eerst
const tasksInColumn = taskBoard.project.taskStore.query(
    t => t.status === 'review'
);

tasksInColumn.forEach(task => {
    task.status = 'todo';  // Verplaats naar To Do
});

// Verwijder kolom
taskBoard.columns.remove(column);

// Sync changes
await taskBoard.project.sync();
```

### 4.4 Reorder Columns

```javascript
// Verplaats kolom naar nieuwe positie
function moveColumn(taskBoard, columnId, newIndex) {
    const columns = [...taskBoard.columns];
    const column = columns.find(c => c.id === columnId);
    const currentIndex = columns.indexOf(column);

    // Remove from current position
    columns.splice(currentIndex, 1);

    // Insert at new position
    columns.splice(newIndex, 0, column);

    // Update indices
    columns.forEach((col, idx) => {
        col.index = idx;
    });

    // Sync
    taskBoard.project.sync();
}
```

---

## 5. Lazy Loading

### 5.1 Load Columns on Demand

```javascript
const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Start zonder kolommen
    columns: [],

    columnField: 'status',

    project: {
        loadUrl: 'api/tasks',
        autoLoad: true
    }
});

// Laad kolommen later
async function loadColumns() {
    const response = await fetch('api/columns');
    const data = await response.json();

    taskBoard.columns = data.columns;
}

// Bij project load
taskBoard.project.on('load', loadColumns);
```

### 5.2 Paginated Column Loading

```javascript
async function loadColumnsPaginated(page = 1, pageSize = 10) {
    const response = await fetch(
        `api/columns?page=${page}&pageSize=${pageSize}`
    );
    const data = await response.json();

    if (page === 1) {
        taskBoard.columns = data.columns;
    } else {
        // Append to existing
        data.columns.forEach(col => {
            taskBoard.columns.add(col);
        });
    }

    return data.hasMore;
}
```

---

## 6. Real-time Updates

### 6.1 WebSocket Integration

```javascript
const socket = new WebSocket('ws://localhost:8080/taskboard');

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
        case 'column_added':
            taskBoard.columns.add(message.column);
            break;

        case 'column_updated':
            const column = taskBoard.columns.find(c => c.id === message.column.id);
            if (column) {
                Object.assign(column, message.column);
            }
            break;

        case 'column_removed':
            const toRemove = taskBoard.columns.find(c => c.id === message.columnId);
            if (toRemove) {
                taskBoard.columns.remove(toRemove);
            }
            break;

        case 'columns_reordered':
            message.order.forEach((id, index) => {
                const col = taskBoard.columns.find(c => c.id === id);
                if (col) col.index = index;
            });
            taskBoard.columns.sort();
            break;
    }
};
```

### 6.2 Polling Updates

```javascript
class ColumnPoller {
    constructor(taskBoard, interval = 30000) {
        this.taskBoard = taskBoard;
        this.interval = interval;
        this.timer = null;
        this.lastUpdate = Date.now();
    }

    start() {
        this.timer = setInterval(() => this.poll(), this.interval);
    }

    stop() {
        clearInterval(this.timer);
    }

    async poll() {
        const response = await fetch(
            `api/columns/updates?since=${this.lastUpdate}`
        );
        const updates = await response.json();

        if (updates.length > 0) {
            this.applyUpdates(updates);
            this.lastUpdate = Date.now();
        }
    }

    applyUpdates(updates) {
        updates.forEach(update => {
            const column = this.taskBoard.columns.find(c => c.id === update.id);

            if (update.deleted) {
                column && this.taskBoard.columns.remove(column);
            } else if (column) {
                Object.assign(column, update);
            } else {
                this.taskBoard.columns.add(update);
            }
        });
    }
}

const poller = new ColumnPoller(taskBoard);
poller.start();
```

---

## 7. Error Handling

### 7.1 Sync Error Handling

```javascript
project: {
    loadUrl: 'api/taskboard/load',
    syncUrl: 'api/taskboard/sync',

    listeners: {
        syncFail({ response, exception }) {
            console.error('Sync failed:', exception);

            // Toon gebruiker melding
            Toast.show({
                html: 'Failed to save changes. Please try again.',
                color: 'b-red'
            });

            // Optioneel: revert changes
            this.revertChanges();
        },

        loadFail({ response, exception }) {
            console.error('Load failed:', exception);

            // Fallback naar cache
            this.loadFromCache();
        }
    }
}
```

### 7.2 Validation

```javascript
// Column validatie voor sync
project: {
    columnStore: {
        listeners: {
            beforeCommit({ changes }) {
                const { added, updated } = changes;

                // Valideer nieuwe kolommen
                for (const column of added) {
                    if (!column.text || column.text.trim() === '') {
                        Toast.show('Column name is required');
                        return false;
                    }
                }

                // Check voor duplicate IDs
                const existingIds = new Set(
                    this.records.map(r => r.id)
                );

                for (const column of added) {
                    if (existingIds.has(column.id)) {
                        Toast.show('Column ID already exists');
                        return false;
                    }
                }

                return true;
            }
        }
    }
}
```

---

## 8. Column Admin UI

### 8.1 Column Manager Panel

```javascript
import { Panel, Grid } from '@bryntum/taskboard';

const columnManager = new Panel({
    appendTo: 'sidebar',
    title: 'Manage Columns',
    collapsible: true,

    items: {
        columnGrid: {
            type: 'grid',
            flex: 1,
            store: taskBoard.columns,

            columns: [
                { field: 'text', text: 'Name', flex: 1, editor: true },
                { field: 'color', text: 'Color', width: 100, editor: true },
                {
                    type: 'action',
                    width: 80,
                    actions: [
                        {
                            cls: 'b-fa b-fa-trash',
                            tooltip: 'Delete',
                            onClick: ({ record }) => {
                                taskBoard.columns.remove(record);
                            }
                        }
                    ]
                }
            ]
        },

        addButton: {
            type: 'button',
            text: 'Add Column',
            icon: 'b-icon-add',
            onClick() {
                taskBoard.columns.add({
                    text: 'New Column',
                    color: 'gray',
                    index: taskBoard.columns.count
                });
            }
        }
    }
});
```

### 8.2 Inline Column Editing

```javascript
features: {
    columnHeaderMenu: {
        items: {
            editColumn: {
                text: 'Edit Column',
                icon: 'b-icon-edit',
                onItem({ column }) {
                    showColumnEditor(column);
                }
            },
            deleteColumn: {
                text: 'Delete Column',
                icon: 'b-icon-trash',
                onItem({ column }) {
                    if (confirm(`Delete column "${column.text}"?`)) {
                        taskBoard.columns.remove(column);
                    }
                }
            }
        }
    }
}

function showColumnEditor(column) {
    const editor = new Popup({
        title: 'Edit Column',
        centered: true,
        closable: true,
        width: 300,

        items: {
            nameField: {
                type: 'textfield',
                label: 'Name',
                value: column.text,
                onChange({ value }) {
                    column.text = value;
                }
            },
            colorField: {
                type: 'combo',
                label: 'Color',
                value: column.color,
                items: ['blue', 'green', 'orange', 'red', 'purple', 'gray'],
                onChange({ value }) {
                    column.color = value;
                }
            }
        },

        bbar: [
            {
                text: 'Save',
                onClick() {
                    taskBoard.project.sync();
                    editor.close();
                }
            }
        ]
    });

    editor.show();
}
```

---

## 9. TypeScript Interfaces

```typescript
import { TaskBoard, Store, Model } from '@bryntum/taskboard';

// Column Data
interface ColumnData {
    id: string;
    text: string;
    color?: string;
    index?: number;
    collapsed?: boolean;
    hidden?: boolean;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
}

// Server Response
interface LoadResponse {
    success: boolean;
    columns: {
        rows: ColumnData[];
    };
    tasks: {
        rows: TaskData[];
    };
}

interface SyncRequest {
    requestId: number;
    columns?: {
        added?: ColumnData[];
        updated?: Partial<ColumnData>[];
        removed?: { id: string }[];
    };
    tasks?: {
        added?: TaskData[];
        updated?: Partial<TaskData>[];
        removed?: { id: string }[];
    };
}

interface SyncResponse {
    success: boolean;
    requestId: number;
    columns?: {
        rows: { $PhantomId?: string; id: string }[];
    };
}

// Column Store
interface ColumnStore extends Store {
    modelClass: typeof ColumnModel;
    readUrl: string;
    createUrl?: string;
    updateUrl?: string;
    deleteUrl?: string;
}

// Column Model
interface ColumnModel extends Model {
    id: string;
    text: string;
    color?: string;
    index: number;
    collapsed: boolean;
    hidden: boolean;
}

// Remote Column TaskBoard
interface RemoteColumnTaskBoard extends TaskBoard {
    columns: ColumnStore | ColumnData[];
    project: {
        columnStore: ColumnStore;
        sync(): Promise<void>;
    };
}
```

---

## 10. Complete Example

```javascript
import { TaskBoard, Store, Model, Toast } from '@bryntum/taskboard';

// Column Model
class ColumnModel extends Model {
    static fields = [
        'id',
        'text',
        'color',
        { name: 'index', type: 'number' },
        { name: 'collapsed', type: 'boolean', defaultValue: false }
    ];
}

// TaskBoard met remote columns
const taskBoard = new TaskBoard({
    appendTo: 'container',

    project: {
        loadUrl: 'api/taskboard/load',
        syncUrl: 'api/taskboard/sync',
        autoLoad: true,
        autoSync: true,

        columnStore: {
            modelClass: ColumnModel,
            sorters: [{ field: 'index', ascending: true }]
        },

        listeners: {
            load() {
                console.log('Data loaded, columns:', this.columnStore.count);
            },

            sync({ response }) {
                Toast.show('Changes saved');
            },

            syncFail({ exception }) {
                Toast.show({
                    html: 'Save failed: ' + exception.message,
                    color: 'b-red'
                });
            }
        }
    },

    columnField: 'status',

    // Kolommen worden geladen via project
    // columns: loaded from server

    swimlaneField: 'priority',
    swimlanes: [
        { id: 'high', text: 'High', color: 'red' },
        { id: 'medium', text: 'Medium', color: 'orange' },
        { id: 'low', text: 'Low', color: 'gray' }
    ],

    features: {
        columnDrag: true,
        columnHeaderMenu: {
            items: {
                addColumn: {
                    text: 'Add Column',
                    icon: 'b-icon-add',
                    weight: 100,
                    onItem() {
                        const newColumn = {
                            text: 'New Column',
                            color: 'teal',
                            index: taskBoard.columns.count
                        };

                        taskBoard.project.columnStore.add(newColumn);
                    }
                },
                editColumn: {
                    text: 'Edit Column',
                    icon: 'b-icon-edit',
                    weight: 110,
                    onItem({ column }) {
                        const newName = prompt('Column name:', column.text);
                        if (newName) {
                            column.text = newName;
                        }
                    }
                },
                deleteColumn: {
                    text: 'Delete Column',
                    icon: 'b-icon-trash',
                    weight: 120,
                    onItem({ column }) {
                        if (confirm(`Delete "${column.text}"?`)) {
                            // Move tasks first
                            const tasks = taskBoard.project.taskStore.query(
                                t => t.status === column.id
                            );

                            if (tasks.length > 0) {
                                const firstColumn = taskBoard.columns.first;
                                tasks.forEach(t => t.status = firstColumn.id);
                            }

                            taskBoard.project.columnStore.remove(column);
                        }
                    }
                }
            }
        }
    },

    tbar: {
        items: {
            addColumn: {
                type: 'button',
                text: 'Add Column',
                icon: 'b-icon-add',
                onClick() {
                    taskBoard.project.columnStore.add({
                        text: `Column ${taskBoard.columns.count + 1}`,
                        color: 'blue',
                        index: taskBoard.columns.count
                    });
                }
            },
            refresh: {
                type: 'button',
                icon: 'b-icon-refresh',
                tooltip: 'Reload data',
                onClick() {
                    taskBoard.project.load();
                }
            },
            save: {
                type: 'button',
                icon: 'b-icon-save',
                tooltip: 'Save changes',
                onClick() {
                    taskBoard.project.sync();
                }
            }
        }
    }
});
```

---

## Referenties

- Examples: `taskboard-7.1.0-trial/examples/columns-remote/`
- API: Project.columnStore
- API: Store CRUD operations
- Config: loadUrl, syncUrl

---

*Document gegenereerd: December 2024*
*Bryntum TaskBoard versie: 7.1.0*
