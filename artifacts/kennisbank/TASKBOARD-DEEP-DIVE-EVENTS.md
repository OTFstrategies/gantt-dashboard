# TaskBoard Deep Dive: Events

> **Reverse-engineered uit Bryntum TaskBoard 7.1.0**
> Complete documentatie van alle TaskBoard events en event handling.

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Event System Basics](#event-system-basics)
3. [Task Events](#task-events)
4. [Column Events](#column-events)
5. [Swimlane Events](#swimlane-events)
6. [Drag & Drop Events](#drag--drop-events)
7. [Feature Events](#feature-events)
8. [Widget Lifecycle Events](#widget-lifecycle-events)
9. [Store Events](#store-events)
10. [Project Events](#project-events)
11. [Event Bubbling](#event-bubbling)
12. [Async Event Handlers](#async-event-handlers)
13. [Complete TypeScript Interfaces](#complete-typescript-interfaces)

---

## Overzicht

TaskBoard events kunnen gegroepeerd worden in categorieën:

| Categorie | Voorbeelden |
|-----------|-------------|
| **Task Events** | taskClick, taskDblClick, taskMouseEnter, activateTask |
| **Column Events** | columnHeaderClick, columnToggle, columnFilterToggle |
| **Swimlane Events** | swimlaneToggle, swimlaneHeaderClick |
| **Drag Events** | beforeTaskDrag, taskDrag, taskDrop |
| **Feature Events** | beforeSimpleTaskEdit, taskMenuShow |
| **Lifecycle Events** | paint, beforeShow, beforeHide, recompose |
| **Store Events** | add, remove, update, refresh |
| **Project Events** | load, sync, change |

---

## Event System Basics

### Event Listener Registration

```javascript
const taskBoard = new TaskBoard({
    // Via config object
    listeners: {
        taskClick({ taskRecord, columnRecord, event }) {
            console.log('Clicked:', taskRecord.name);
        },

        taskDblClick({ taskRecord }) {
            console.log('Double clicked:', taskRecord.name);
        }
    }
});

// Via on() method
taskBoard.on({
    taskClick({ taskRecord }) {
        console.log('Clicked:', taskRecord.name);
    }
});

// Single event
taskBoard.on('taskClick', ({ taskRecord }) => {
    console.log('Clicked:', taskRecord.name);
});

// With thisObj
taskBoard.on('taskClick', this.handleTaskClick, this);
```

### Event Handler Signature

```javascript
taskBoard.on({
    taskClick(event) {
        // event.source - The TaskBoard instance
        // event.taskRecord - The clicked TaskModel
        // event.columnRecord - The ColumnModel
        // event.swimlaneRecord - The SwimlaneModel (if using swimlanes)
        // event.event - The native browser MouseEvent
    }
});
```

### Removing Listeners

```javascript
// Remove specific listener
const fn = ({ taskRecord }) => console.log(taskRecord.name);
taskBoard.on('taskClick', fn);
taskBoard.un('taskClick', fn);

// Remove all listeners
taskBoard.removeAllListeners();

// Using detacher
const detacher = taskBoard.on('taskClick', handler);
detacher();  // Remove listener
```

### Once Listeners

```javascript
// Listen only once
taskBoard.on({
    taskClick: {
        fn({ taskRecord }) {
            console.log('First click only:', taskRecord.name);
        },
        once: true
    }
});
```

---

## Task Events

### taskClick

Triggered when a task card is clicked.

```javascript
taskBoard.on({
    taskClick({
        source,          // TaskBoard instance
        taskRecord,      // TaskModel
        columnRecord,    // ColumnModel
        swimlaneRecord,  // SwimlaneModel | null
        event            // MouseEvent
    }) {
        console.log('Clicked task:', taskRecord.name);
        console.log('In column:', columnRecord.text);

        // Check modifier keys
        if (event.ctrlKey) {
            console.log('Ctrl+Click');
        }
    }
});
```

### taskDblClick

Triggered when a task card is double-clicked.

```javascript
taskBoard.on({
    taskDblClick({
        source,
        taskRecord,
        columnRecord,
        swimlaneRecord,
        event
    }) {
        // Open editor or perform action
        taskBoard.features.taskEdit.editTask(taskRecord);
    }
});
```

### taskMouseEnter / taskMouseLeave

Triggered when mouse enters/leaves a card.

```javascript
taskBoard.on({
    taskMouseEnter({
        source,
        taskRecord,
        columnRecord,
        swimlaneRecord,
        event
    }) {
        // Show tooltip or highlight
        console.log('Mouse entered:', taskRecord.name);
    },

    taskMouseLeave({
        source,
        taskRecord,
        columnRecord,
        swimlaneRecord,
        event
    }) {
        // Hide tooltip
        console.log('Mouse left:', taskRecord.name);
    }
});
```

### activateTask

Triggered when a task is "activated" (Enter key or double-click based on config).

```javascript
const taskBoard = new TaskBoard({
    // Configure what triggers activation
    activateTaskEvent: 'taskDblClick',  // or 'taskClick' or null

    listeners: {
        activateTask({
            source,
            taskRecord,
            event
        }) {
            // Default behavior opens task editor
            // Custom activation logic here
            openTaskDetails(taskRecord);
        }
    }
});
```

### taskContextMenu

Triggered when a task is right-clicked.

```javascript
taskBoard.on({
    taskContextMenu({
        source,
        taskRecord,
        columnRecord,
        swimlaneRecord,
        event
    }) {
        // Show custom context menu
        event.preventDefault();
        showCustomMenu(event.clientX, event.clientY, taskRecord);
    }
});
```

---

## Column Events

### columnHeaderClick

Triggered when a column header is clicked.

```javascript
taskBoard.on({
    columnHeaderClick({
        source,
        columnRecord,
        event
    }) {
        console.log('Clicked column:', columnRecord.text);

        // Toggle collapse
        if (event.target.closest('.b-taskboard-column-header-collapse')) {
            columnRecord.collapsed = !columnRecord.collapsed;
        }
    }
});
```

### columnHeaderContextMenu

Triggered when a column header is right-clicked.

```javascript
taskBoard.on({
    columnHeaderContextMenu({
        source,
        columnRecord,
        event
    }) {
        event.preventDefault();
        // Show column options menu
    }
});
```

### columnToggle

Triggered when a column is expanded or collapsed.

```javascript
taskBoard.on({
    columnToggle({
        source,
        columnRecord,
        collapse  // true if collapsing, false if expanding
    }) {
        console.log(
            columnRecord.text,
            collapse ? 'collapsed' : 'expanded'
        );
    }
});
```

### columnFilterToggle

Triggered when a column filter popup is shown/hidden.

```javascript
taskBoard.on({
    columnFilterToggle({
        source,
        columnRecord,
        visible  // true if filter popup is visible
    }) {
        console.log(
            columnRecord.text,
            'filter popup',
            visible ? 'shown' : 'hidden'
        );
    }
});
```

### beforeColumnResize / columnResize

Column resize events.

```javascript
taskBoard.on({
    beforeColumnResize({
        source,
        column,
        domEvent
    }) {
        // Return false to prevent resize
        if (column.locked) {
            return false;
        }
    },

    columnResize({
        source,
        column,
        domEvent
    }) {
        console.log('Column resized:', column.text, column.width);
    }
});
```

---

## Swimlane Events

### swimlaneHeaderClick

Triggered when a swimlane header is clicked.

```javascript
taskBoard.on({
    swimlaneHeaderClick({
        source,
        swimlaneRecord,
        event
    }) {
        console.log('Clicked swimlane:', swimlaneRecord.text);
    }
});
```

### swimlaneToggle

Triggered when a swimlane is expanded or collapsed.

```javascript
taskBoard.on({
    swimlaneToggle({
        source,
        swimlaneRecord,
        collapse  // true if collapsing
    }) {
        console.log(
            swimlaneRecord.text,
            collapse ? 'collapsed' : 'expanded'
        );
    }
});
```

---

## Drag & Drop Events

### Task Drag Events

```javascript
taskBoard.on({
    // Before drag starts
    beforeTaskDrag({
        source,
        taskRecords,     // Tasks being dragged
        event
    }) {
        // Return false to prevent drag
        if (taskRecords.some(t => t.locked)) {
            return false;
        }
    },

    // During drag
    taskDrag({
        source,
        taskRecords,
        targetColumn,    // Column being dragged over
        targetSwimlane,  // Swimlane being dragged over
        beforeTask,      // Task to insert before
        event
    }) {
        // Update UI during drag
        highlightDropTarget(targetColumn);
    },

    // Drag cancelled
    taskDragAbort({
        source,
        taskRecords
    }) {
        console.log('Drag cancelled');
    },

    // Before drop completes
    beforeTaskDrop({
        source,
        taskRecords,
        targetColumn,
        targetSwimlane,
        beforeTask,
        event
    }) {
        // Return false to abort drop
        // Supports async handlers
        if (targetColumn.id === 'blocked') {
            return false;
        }
    },

    // After drop
    taskDrop({
        source,
        taskRecords,
        targetColumn,
        targetSwimlane,
        event
    }) {
        console.log('Dropped in:', targetColumn.text);
    }
});
```

### Column Drag Events

```javascript
taskBoard.on({
    beforeColumnDrag({
        source,
        columnRecord
    }) {
        // Prevent locked columns from being dragged
        if (columnRecord.locked) {
            return false;
        }
    },

    beforeColumnDrop({
        source,
        columnRecord,
        beforeColumn  // Column to insert before
    }) {
        // Validate drop position
        return true;
    },

    columnDrop({
        source,
        columnRecord,
        beforeColumn
    }) {
        console.log('Column reordered');
    }
});
```

### Swimlane Drag Events

```javascript
taskBoard.on({
    beforeSwimlaneDrag({
        source,
        swimlaneRecord
    }) {
        if (swimlaneRecord.locked) {
            return false;
        }
    },

    beforeSwimlaneDrop({
        source,
        swimlaneRecord,
        beforeSwimlane
    }) {
        return true;
    },

    swimlaneDrop({
        source,
        swimlaneRecord,
        beforeSwimlane
    }) {
        console.log('Swimlane reordered');
    }
});
```

---

## Feature Events

### Task Edit Events

```javascript
taskBoard.on({
    // Before inline edit starts
    beforeSimpleTaskEdit({
        source,
        simpleTaskEdit,  // Feature instance
        taskRecord,
        field            // Field being edited
    }) {
        // Return false to prevent editing
        if (taskRecord.readOnly) {
            return false;
        }
    },

    // Inline edit cancelled
    simpleTaskEditCancel({
        source,
        simpleTaskEdit,
        taskRecord
    }) {
        console.log('Edit cancelled');
    },

    // Inline edit completed
    simpleTaskEditComplete({
        source,
        simpleTaskEdit,
        taskRecord,
        changes
    }) {
        console.log('Edit completed:', changes);
    }
});
```

### Task Menu Events

```javascript
taskBoard.on({
    // Before menu shows
    beforeTaskMenuShow({
        source,
        taskRecord,
        items       // Menu items (can be modified)
    }) {
        // Add custom item
        items.customItem = {
            text: 'Custom Action',
            onItem: () => customAction(taskRecord)
        };

        // Return false to prevent menu
    },

    // Menu shown
    taskMenuShow({
        source,
        taskRecord,
        menu
    }) {
        console.log('Menu shown for:', taskRecord.name);
    },

    // Menu item selected
    taskMenuItem({
        source,
        menu,
        item,
        taskRecord
    }) {
        console.log('Selected:', item.text);
    },

    // Toggle menu item (checkbox)
    taskMenuToggleItem({
        source,
        menu,
        item,
        taskRecord,
        checked
    }) {
        console.log('Toggled:', item.text, checked);
    }
});
```

### Column Header Menu Events

```javascript
taskBoard.on({
    beforeColumnHeaderMenuShow({
        source,
        columnRecord,
        items
    }) {
        // Customize menu items
    },

    columnHeaderMenuShow({
        source,
        columnRecord,
        menu
    }) {
        console.log('Column menu shown');
    },

    columnHeaderMenuItem({
        source,
        menu,
        item,
        columnRecord
    }) {
        console.log('Selected:', item.text);
    }
});
```

---

## Widget Lifecycle Events

### paint

Triggered when widget is first rendered to DOM.

```javascript
taskBoard.on({
    paint({
        source,
        firstPaint  // true if this is the initial paint
    }) {
        if (firstPaint) {
            // Initialize after first render
            initializeIntegrations();
        }
    }
});
```

### beforeShow / show

```javascript
taskBoard.on({
    beforeShow({ source }) {
        // Prepare data before showing
        // Return false to prevent
    },

    show({ source }) {
        console.log('TaskBoard is now visible');
    }
});
```

### beforeHide / hide

```javascript
taskBoard.on({
    beforeHide({ source }) {
        // Cleanup or validation
        // Return false to prevent
    },

    hide({ source }) {
        console.log('TaskBoard is now hidden');
    }
});
```

### recompose

Triggered after DOM is synchronized.

```javascript
taskBoard.on({
    recompose() {
        // DOM has been updated
        updateExternalElements();
    }
});
```

### resize

Triggered when widget resizes.

```javascript
const taskBoard = new TaskBoard({
    monitorResize: true,

    listeners: {
        resize({
            source,
            width,
            height,
            oldWidth,
            oldHeight
        }) {
            console.log(`Resized from ${oldWidth}x${oldHeight} to ${width}x${height}`);
        }
    }
});
```

### responsiveStateChange

Triggered when responsive state changes.

```javascript
taskBoard.on({
    beforeResponsiveStateChange({
        source,
        state,
        oldState
    }) {
        console.log(`Changing from ${oldState} to ${state}`);
    },

    responsiveStateChange({
        source,
        state,
        oldState
    }) {
        console.log(`Changed to ${state}`);
    }
});
```

---

## Store Events

### TaskStore Events

```javascript
taskBoard.project.taskStore.on({
    // Records added
    add({
        source,     // Store
        records,    // Added records
        index       // Insertion index
    }) {
        records.forEach(task => {
            console.log('Added:', task.name);
        });
    },

    // Records removed
    remove({
        source,
        records,
        parent,     // For tree stores
        isMove      // true if part of move operation
    }) {
        records.forEach(task => {
            console.log('Removed:', task.name);
        });
    },

    // Record updated
    update({
        source,
        record,
        changes     // { fieldName: { value, oldValue } }
    }) {
        console.log('Updated:', record.name);
        for (const [field, change] of Object.entries(changes)) {
            console.log(`  ${field}: ${change.oldValue} -> ${change.value}`);
        }
    },

    // Store data refreshed (filter, sort, load)
    refresh({
        source,
        action,    // 'dataset', 'sort', 'filter', etc.
        batch      // true if triggered by batch end
    }) {
        console.log('Refreshed due to:', action);
    },

    // Before filter applied
    beforeFilter({
        source,
        filters
    }) {
        console.log('Filtering with:', filters);
    },

    // Filter applied
    filter({
        source,
        filters,
        records
    }) {
        console.log('Filtered to', records.length, 'records');
    },

    // Before sort
    beforeSort({
        source,
        sorters,
        records
    }) {
        console.log('Sorting by:', sorters);
    },

    // Sorted
    sort({
        source,
        sorters,
        records
    }) {
        console.log('Sorted', records.length, 'records');
    }
});
```

### Column/Swimlane Store Events

```javascript
taskBoard.columns.on({
    add({ records }) {
        console.log('Columns added:', records.map(c => c.text));
    },

    remove({ records }) {
        console.log('Columns removed:', records.map(c => c.text));
    },

    update({ record, changes }) {
        console.log('Column updated:', record.text, changes);
    }
});

taskBoard.swimlanes.on({
    add({ records }) {
        console.log('Swimlanes added:', records.map(s => s.text));
    }
});
```

---

## Project Events

### Load Events

```javascript
taskBoard.project.on({
    beforeLoad({
        source,
        params
    }) {
        // Modify load parameters
        params.userId = getCurrentUser().id;
    },

    load({
        source
    }) {
        console.log('Data loaded');
        console.log('Tasks:', source.taskStore.count);
        console.log('Resources:', source.resourceStore.count);
    },

    loadFail({
        source,
        response,
        responseText
    }) {
        console.error('Load failed:', responseText);
    }
});
```

### Sync Events

```javascript
taskBoard.project.on({
    beforeSync({
        source,
        pack  // Data to be synced
    }) {
        console.log('Syncing:', pack);
        // Modify or validate sync data
    },

    syncStart({
        source
    }) {
        showLoadingIndicator();
    },

    sync({
        source,
        response
    }) {
        hideLoadingIndicator();
        console.log('Synced successfully');
    },

    syncFail({
        source,
        response,
        responseText
    }) {
        hideLoadingIndicator();
        showError('Sync failed: ' + responseText);
    }
});
```

### Change Event

```javascript
taskBoard.project.on({
    change({
        source,    // Project
        store,     // Affected store
        action,    // 'add', 'remove', 'update', etc.
        record,    // For single record actions
        records,   // For multi-record actions
        changes    // For updates
    }) {
        console.log(`${store.id} ${action}`);

        // Track all changes
        if (action === 'update') {
            logChange(record, changes);
        }
    }
});
```

---

## Event Bubbling

### bubbleEvents Configuration

```javascript
const taskBoard = new TaskBoard({
    // Events that bubble to parent widgets
    bubbleEvents: {
        taskClick: true,
        taskDblClick: true,
        beforeTaskDrag: true
    }
});

// Listen on parent container
const container = new Container({
    items: [taskBoard],

    listeners: {
        taskClick({ taskRecord }) {
            // Received via bubbling
            console.log('Bubbled:', taskRecord.name);
        }
    }
});
```

### relayAll

```javascript
// Relay all events through another object
const eventBus = new Events();

taskBoard.relayAll(eventBus, 'taskBoard');

// Events prefixed with 'taskBoard'
eventBus.on({
    taskBoardTaskClick({ taskRecord }) {
        console.log('Relayed:', taskRecord.name);
    }
});
```

---

## Async Event Handlers

### Async Before Events

```javascript
taskBoard.on({
    async beforeTaskDrop({
        taskRecords,
        targetColumn
    }) {
        // Async validation
        const canDrop = await validateDrop(taskRecords, targetColumn);

        if (!canDrop) {
            // Returning false prevents the action
            return false;
        }
    },

    async beforeSimpleTaskEdit({
        taskRecord
    }) {
        // Check permissions
        const canEdit = await checkEditPermission(taskRecord);
        return canEdit;
    }
});
```

### Promise-based Handlers

```javascript
taskBoard.on({
    beforeTaskDrag({
        taskRecords
    }) {
        return new Promise(resolve => {
            // Show confirmation dialog
            showConfirmDialog({
                message: 'Move these tasks?',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }
});
```

---

## Complete TypeScript Interfaces

```typescript
// ========== Event Types ==========

// Base event
interface TaskBoardEvent {
    source: TaskBoard;
}

// Task interaction events
interface TaskInteractionEvent extends TaskBoardEvent {
    taskRecord: TaskModel;
    columnRecord: ColumnModel;
    swimlaneRecord: SwimlaneModel | null;
    event: MouseEvent;
}

// Task events
interface TaskClickEvent extends TaskInteractionEvent {}
interface TaskDblClickEvent extends TaskInteractionEvent {}
interface TaskContextMenuEvent extends TaskInteractionEvent {}
interface TaskMouseEnterEvent extends TaskInteractionEvent {}
interface TaskMouseLeaveEvent extends TaskInteractionEvent {}

interface ActivateTaskEvent extends TaskBoardEvent {
    taskRecord: TaskModel;
    event: MouseEvent;
}

// Column events
interface ColumnHeaderClickEvent extends TaskBoardEvent {
    columnRecord: ColumnModel;
    event: MouseEvent;
}

interface ColumnToggleEvent extends TaskBoardEvent {
    columnRecord: ColumnModel;
    collapse: boolean;
}

interface ColumnFilterToggleEvent extends TaskBoardEvent {
    columnRecord: ColumnModel;
    visible: boolean;
}

interface ColumnResizeEvent extends TaskBoardEvent {
    column: ColumnModel;
    domEvent: Event;
}

// Swimlane events
interface SwimlaneHeaderClickEvent extends TaskBoardEvent {
    swimlaneRecord: SwimlaneModel;
    event: MouseEvent;
}

interface SwimlaneToggleEvent extends TaskBoardEvent {
    swimlaneRecord: SwimlaneModel;
    collapse: boolean;
}

// Drag events
interface BeforeTaskDragEvent extends TaskBoardEvent {
    taskRecords: TaskModel[];
    event: MouseEvent;
}

interface TaskDragEvent extends TaskBoardEvent {
    taskRecords: TaskModel[];
    targetColumn: ColumnModel | null;
    targetSwimlane: SwimlaneModel | null;
    beforeTask: TaskModel | null;
    event: MouseEvent;
}

interface BeforeTaskDropEvent extends TaskDragEvent {}

interface TaskDropEvent extends TaskBoardEvent {
    taskRecords: TaskModel[];
    targetColumn: ColumnModel;
    targetSwimlane: SwimlaneModel | null;
    event: MouseEvent;
}

interface TaskDragAbortEvent extends TaskBoardEvent {
    taskRecords: TaskModel[];
}

// Column drag events
interface BeforeColumnDragEvent extends TaskBoardEvent {
    columnRecord: ColumnModel;
}

interface BeforeColumnDropEvent extends TaskBoardEvent {
    columnRecord: ColumnModel;
    beforeColumn: ColumnModel | null;
}

interface ColumnDropEvent extends BeforeColumnDropEvent {}

// Swimlane drag events
interface BeforeSwimlaneDragEvent extends TaskBoardEvent {
    swimlaneRecord: SwimlaneModel;
}

interface BeforeSwimlaneDropEvent extends TaskBoardEvent {
    swimlaneRecord: SwimlaneModel;
    beforeSwimlane: SwimlaneModel | null;
}

interface SwimlaneDropEvent extends BeforeSwimlaneDropEvent {}

// Feature events
interface BeforeSimpleTaskEditEvent extends TaskBoardEvent {
    simpleTaskEdit: SimpleTaskEdit;
    taskRecord: TaskModel;
    field: string;
}

interface SimpleTaskEditCompleteEvent extends TaskBoardEvent {
    simpleTaskEdit: SimpleTaskEdit;
    taskRecord: TaskModel;
    changes: object;
}

interface BeforeTaskMenuShowEvent extends TaskBoardEvent {
    taskRecord: TaskModel;
    items: Record<string, MenuItemConfig | boolean>;
}

interface TaskMenuShowEvent extends TaskBoardEvent {
    taskRecord: TaskModel;
    menu: Menu;
}

interface TaskMenuItemEvent extends TaskBoardEvent {
    menu: Menu;
    item: MenuItem;
    taskRecord: TaskModel;
}

// Lifecycle events
interface PaintEvent extends TaskBoardEvent {
    firstPaint: boolean;
}

interface ResizeEvent extends TaskBoardEvent {
    width: number;
    height: number;
    oldWidth: number;
    oldHeight: number;
}

interface ResponsiveStateChangeEvent extends TaskBoardEvent {
    state: string;
    oldState: string;
}

// Store events
interface StoreAddEvent {
    source: Store;
    records: Model[];
    allRecords: Model[];
    parent?: Model;
    index?: number;
    isChild?: boolean;
}

interface StoreRemoveEvent {
    source: Store;
    records: Model[];
    allRecords?: Model[];
    parent?: Model;
    index?: number;
    isChild?: boolean;
    isMove?: boolean;
}

interface StoreUpdateEvent {
    source: Store;
    record: Model;
    changes: Record<string, { value: any; oldValue: any }>;
}

interface StoreRefreshEvent {
    source: Store;
    action: 'dataset' | 'sort' | 'filter' | 'clearchanges' |
            'create' | 'update' | 'delete' | 'group';
    batch: boolean;
}

// Project events
interface ProjectLoadEvent {
    source: ProjectModel;
}

interface ProjectSyncEvent {
    source: ProjectModel;
    response: object;
}

interface ProjectChangeEvent {
    source: ProjectModel;
    store: Store;
    action: 'add' | 'remove' | 'removeAll' | 'clearchanges' |
            'filter' | 'update' | 'dataset' | 'replace';
    record?: Model;
    records?: Model[];
    changes?: object;
}


// ========== Listeners Type ==========

interface TaskBoardListeners {
    // Task events
    taskClick?: (event: TaskClickEvent) => void;
    taskDblClick?: (event: TaskDblClickEvent) => void;
    taskContextMenu?: (event: TaskContextMenuEvent) => void;
    taskMouseEnter?: (event: TaskMouseEnterEvent) => void;
    taskMouseLeave?: (event: TaskMouseLeaveEvent) => void;
    activateTask?: (event: ActivateTaskEvent) => void;

    // Column events
    columnHeaderClick?: (event: ColumnHeaderClickEvent) => void;
    columnHeaderContextMenu?: (event: ColumnHeaderClickEvent) => void;
    columnToggle?: (event: ColumnToggleEvent) => void;
    columnFilterToggle?: (event: ColumnFilterToggleEvent) => void;
    beforeColumnResize?: (event: ColumnResizeEvent) => boolean | void;
    columnResize?: (event: ColumnResizeEvent) => void;

    // Swimlane events
    swimlaneHeaderClick?: (event: SwimlaneHeaderClickEvent) => void;
    swimlaneToggle?: (event: SwimlaneToggleEvent) => void;

    // Task drag events
    beforeTaskDrag?: (event: BeforeTaskDragEvent) => Promise<boolean> | boolean | void;
    taskDrag?: (event: TaskDragEvent) => void;
    taskDragAbort?: (event: TaskDragAbortEvent) => void;
    beforeTaskDrop?: (event: BeforeTaskDropEvent) => Promise<boolean> | boolean | void;
    taskDrop?: (event: TaskDropEvent) => void;

    // Column drag events
    beforeColumnDrag?: (event: BeforeColumnDragEvent) => Promise<boolean> | boolean | void;
    beforeColumnDrop?: (event: BeforeColumnDropEvent) => Promise<boolean> | boolean | void;
    columnDrop?: (event: ColumnDropEvent) => void;

    // Swimlane drag events
    beforeSwimlaneDrag?: (event: BeforeSwimlaneDragEvent) => Promise<boolean> | boolean | void;
    beforeSwimlaneDrop?: (event: BeforeSwimlaneDropEvent) => Promise<boolean> | boolean | void;
    swimlaneDrop?: (event: SwimlaneDropEvent) => void;

    // Feature events
    beforeSimpleTaskEdit?: (event: BeforeSimpleTaskEditEvent) => Promise<boolean> | boolean | void;
    simpleTaskEditCancel?: (event: { source: TaskBoard; taskRecord: TaskModel }) => void;
    simpleTaskEditComplete?: (event: SimpleTaskEditCompleteEvent) => void;
    beforeTaskMenuShow?: (event: BeforeTaskMenuShowEvent) => boolean | void;
    taskMenuShow?: (event: TaskMenuShowEvent) => void;
    taskMenuItem?: (event: TaskMenuItemEvent) => void;
    taskMenuToggleItem?: (event: TaskMenuItemEvent & { checked: boolean }) => void;

    // Lifecycle events
    paint?: (event: PaintEvent) => void;
    beforeShow?: (event: TaskBoardEvent) => Promise<boolean> | boolean | void;
    show?: (event: TaskBoardEvent) => void;
    beforeHide?: (event: TaskBoardEvent) => Promise<boolean> | boolean | void;
    hide?: (event: TaskBoardEvent) => void;
    recompose?: () => void;
    resize?: (event: ResizeEvent) => void;
    beforeResponsiveStateChange?: (event: ResponsiveStateChangeEvent) => void;
    responsiveStateChange?: (event: ResponsiveStateChangeEvent) => void;

    // Destruction
    beforeDestroy?: (event: { source: Base }) => void;
    destroy?: (event: { source: Base }) => void;
}

interface StoreListeners {
    add?: (event: StoreAddEvent) => void;
    remove?: (event: StoreRemoveEvent) => void;
    update?: (event: StoreUpdateEvent) => void;
    refresh?: (event: StoreRefreshEvent) => void;
    beforeAdd?: (event: { source: Store; records: Model[] }) => Promise<boolean> | boolean | void;
    beforeRemove?: (event: { source: Store; records: Model[] }) => Promise<boolean> | boolean | void;
    beforeUpdate?: (event: StoreUpdateEvent) => boolean | void;
    beforeFilter?: (event: { source: Store; filters: Collection }) => void;
    filter?: (event: { source: Store; filters: Collection; records: Model[] }) => void;
    beforeSort?: (event: { source: Store; sorters: Sorter[]; records: Model[] }) => void;
    sort?: (event: { source: Store; sorters: Sorter[]; records: Model[] }) => void;
}

interface ProjectListeners {
    beforeLoad?: (event: { source: ProjectModel; params: object }) => Promise<boolean> | boolean | void;
    load?: (event: ProjectLoadEvent) => void;
    loadFail?: (event: { source: ProjectModel; response: object; responseText: string }) => void;
    beforeSync?: (event: { source: ProjectModel; pack: object }) => Promise<boolean> | boolean | void;
    syncStart?: (event: { source: ProjectModel }) => void;
    sync?: (event: ProjectSyncEvent) => void;
    syncFail?: (event: { source: ProjectModel; response: object; responseText: string }) => void;
    change?: (event: ProjectChangeEvent) => void;
}
```

---

## Zie Ook

- [TASKBOARD-IMPL-DRAG-DROP.md](./TASKBOARD-IMPL-DRAG-DROP.md) - Drag & drop implementatie
- [TASKBOARD-DEEP-DIVE-MENUS.md](./TASKBOARD-DEEP-DIVE-MENUS.md) - Menu configuratie
- [TASKBOARD-INTERNALS-STORES.md](./TASKBOARD-INTERNALS-STORES.md) - Store events
- [DEEP-DIVE-EVENTS.md](./DEEP-DIVE-EVENTS.md) - Bryntum events algemeen

---

*Gegenereerd uit Bryntum TaskBoard 7.1.0 broncode analyse*
*Laatste update: December 2024*
