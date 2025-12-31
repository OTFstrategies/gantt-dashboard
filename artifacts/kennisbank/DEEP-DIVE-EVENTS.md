# Deep Dive: Bryntum Gantt Event System

## Level 2 Technical Reference

This document provides an in-depth analysis of the Bryntum Gantt event system, covering listener patterns, event propagation, before/after event pairs, preventing default behavior, and practical implementation patterns.

---

## Table of Contents

1. [Event Listener Patterns](#1-event-listener-patterns)
2. [Event Propagation and Bubbling](#2-event-propagation-and-bubbling)
3. [Before/After Event Pairs](#3-beforeafter-event-pairs)
4. [Event Object Structure](#4-event-object-structure)
5. [Preventing Default Behavior](#5-preventing-default-behavior)
6. [Event Delegation Patterns](#6-event-delegation-patterns)
7. [Key Gantt Events Reference](#7-key-gantt-events-reference)
8. [Custom Event Firing with trigger()](#8-custom-event-firing-with-trigger)
9. [Event Suspension and Resumption](#9-event-suspension-and-resumption)
10. [Best Practices and Patterns](#10-best-practices-and-patterns)

---

## 1. Event Listener Patterns

Bryntum Gantt provides three primary methods for attaching event listeners.

### 1.1 The `listeners` Config Object

The most common pattern is using the `listeners` configuration during component initialization:

```typescript
import { Gantt, GanttConfig } from '@bryntum/gantt';

const ganttConfig: GanttConfig = {
    listeners: {
        taskClick: ({ source, taskRecord, event }) => {
            console.log(`Task clicked: ${taskRecord.name}`);
        },

        taskDblClick: ({ source, taskRecord, event }) => {
            console.log(`Task double-clicked: ${taskRecord.name}`);
        },

        beforeTaskEdit: ({ source, taskEdit, taskRecord, taskElement }) => {
            // Return false to prevent editing
            if (taskRecord.readOnly) {
                return false;
            }
        },

        // Using thisObj for context binding
        thisObj: myController
    }
};

const gantt = new Gantt(ganttConfig);
```

### 1.2 The `on()` Method

The `on()` method is an alias for `addListener()` and is used for dynamic event binding:

```typescript
// Simple function callback
gantt.on('taskClick', (event) => {
    console.log('Task clicked:', event.taskRecord);
});

// With thisObj binding
gantt.on('taskClick', this.handleTaskClick, this);

// Config object style
gantt.on({
    taskClick: this.handleTaskClick,
    taskDblClick: this.handleTaskDblClick,
    thisObj: this
});
```

### 1.3 The `addListener()` Method

The full-featured listener attachment method with advanced options:

```typescript
// BryntumListenerConfig type definition
type BryntumListenerConfig = Record<string, Function|boolean|object|object[]|number|string> & {
    thisObj?: object;       // The `this` reference for all listeners
    once?: boolean;         // Remove listener after first invocation
    expires?: number | {    // Auto-remove after timeout
        data: {
            delay?: number,
            alt?: string | Function
        }
    };
    args?: object[];        // Arguments passed before event object
    prio?: number;          // Priority (higher = called first)
    buffer?: number;        // Debounce delay in milliseconds
    throttle?: number;      // Throttle interval in milliseconds
    asap?: boolean;         // Invoke in next microtask
};

// Example with options
const detacher = gantt.addListener({
    taskClick: {
        fn: (event) => console.log('Clicked:', event.taskRecord.name),
        once: true,      // Auto-remove after first call
        prio: 100        // High priority, called before lower priority handlers
    },

    taskDrag: {
        fn: (event) => this.updateUI(event),
        buffer: 50,      // Wait 50ms after last call before executing
        thisObj: this
    },

    taskResize: {
        fn: (event) => this.handleResize(event),
        throttle: 100    // Execute at most once per 100ms
    }
});

// Later: remove the listener
detacher();
```

### 1.4 Declarative `on*` Properties (Config Pattern)

When using framework wrappers like React, you can use `on` prefixed properties:

```typescript
// These are equivalent to listeners config
const ganttConfig: GanttConfig = {
    onTaskClick: (event) => {
        console.log('Task clicked');
    },

    onBeforeTaskEdit: (event) => {
        // Prevent editing locked tasks
        return !event.taskRecord.locked;
    },

    onAfterTaskSave: (event) => {
        console.log('Task saved:', event.taskRecord);
    }
};
```

---

## 2. Event Propagation and Bubbling

### 2.1 Bubble Events Configuration

Bryntum supports event bubbling through the `bubbleEvents` configuration:

```typescript
const ganttConfig: GanttConfig = {
    project: {
        taskStore: {
            // Events listed here will bubble up to the project
            bubbleEvents: {
                add: true,
                remove: true,
                update: true,
                change: true
            }
        }
    }
};

// Listen on the project for store events
gantt.project.on({
    add: (event) => {
        console.log('Record added to a store:', event.records);
    }
});
```

### 2.2 The `relayAll()` Method

Relay all events through another object with a prefix:

```typescript
// Relay all store events through the gantt with prefix
gantt.taskStore.relayAll(
    gantt,           // Target object to relay through
    'taskStore',     // Prefix added to event names
    true             // Transform case (storeAdd -> taskStoreAdd)
);

// Now listen on gantt for prefixed events
gantt.on({
    taskStoreAdd: (event) => {
        console.log('Task added:', event.records);
    },
    taskStoreRemove: (event) => {
        console.log('Task removed:', event.records);
    }
});
```

### 2.3 Named Listener Groups with `detachListeners()`

Group listeners by name for easier management:

```typescript
// Add listeners with a name
gantt.addListener('taskClick', this.handleClick, { name: 'myFeature' });
gantt.addListener('taskDrag', this.handleDrag, { name: 'myFeature' });

// Later: remove all listeners with that name
gantt.detachListeners('myFeature');
```

---

## 3. Before/After Event Pairs

Bryntum uses a consistent pattern of `before*` and `after*` event pairs for operations that can be prevented or need cleanup.

### 3.1 Task Editing Events

```typescript
const ganttConfig: GanttConfig = {
    listeners: {
        // BEFORE: Fired before the editor opens
        // Return false to prevent editing
        beforeTaskEdit: ({ source, taskEdit, taskRecord, taskElement }) => {
            // Validate if task can be edited
            if (taskRecord.isMilestone) {
                console.log('Milestones cannot be edited');
                return false; // Prevents the editor from opening
            }

            // You can return a Promise for async validation
            return validateEditPermission(taskRecord);
        },

        // BEFORE SHOW: Editor is available but not visible yet
        beforeTaskEditShow: ({ source, taskEdit, taskRecord, eventElement, editor }) => {
            // Customize the editor before it's shown
            const durationField = editor.widgetMap.durationField;
            durationField.disabled = taskRecord.isParent;
        },

        // BEFORE SAVE: About to save changes
        beforeTaskSave: ({ source, taskRecord, editor }) => {
            // Validate before saving
            if (taskRecord.duration < 0) {
                return false; // Prevent save
            }
        },

        // AFTER SAVE: Task has been saved successfully
        afterTaskSave: ({ source, taskRecord, editor }) => {
            console.log('Task saved successfully:', taskRecord.name);
            this.showNotification('Task saved');
        },

        // AFTER EDIT: Editor closed (save, delete, or cancel)
        afterTaskEdit: ({ source, taskRecord, editor }) => {
            console.log('Editor closed');
            this.refreshRelatedViews();
        },

        // CANCELED: Edit was canceled
        taskEditCanceled: ({ source, taskRecord, editor }) => {
            console.log('Edit canceled for:', taskRecord.name);
        }
    }
};
```

### 3.2 Drag Operations Events

```typescript
const ganttConfig: GanttConfig = {
    listeners: {
        // BEFORE: Drag is about to start
        beforeTaskDrag: ({ source, taskRecord, event }) => {
            if (taskRecord.locked) {
                return false; // Prevent drag
            }
        },

        // START: Drag has started
        taskDragStart: ({ source, taskRecords }) => {
            console.log('Started dragging:', taskRecords.length, 'tasks');
        },

        // DURING: Continuous updates during drag
        taskDrag: ({ source, taskRecords, startDate, endDate, dragData, changed }) => {
            if (changed) {
                this.updatePreview(startDate, endDate);
            }
        },

        // BEFORE FINALIZE: Last chance to prevent or customize
        beforeTaskDropFinalize: ({ source, context }) => {
            const { taskRecords, valid, async, finalize } = context;

            // For async confirmation dialogs:
            context.async = true;

            this.showConfirmDialog('Move task?').then((confirmed) => {
                finalize(confirmed); // true to complete, false to cancel
            });
        },

        // DROP: Successful drop
        taskDrop: ({ source, taskRecords, isCopy }) => {
            console.log('Tasks dropped:', taskRecords, 'Copy:', isCopy);
        },

        // AFTER DROP: After drop completes (valid or invalid)
        afterTaskDrop: ({ source, taskRecords, valid }) => {
            console.log('Drop complete. Valid:', valid);
        }
    }
};
```

### 3.3 Resize Events

```typescript
const ganttConfig: GanttConfig = {
    listeners: {
        beforeTaskResize: ({ taskRecord, event }) => {
            if (taskRecord.constraint === 'mustfinishon') {
                return false; // Prevent resize for constrained tasks
            }
        },

        taskResizeStart: ({ taskRecord, event, resizeData }) => {
            console.log('Resize started:', taskRecord.name);
        },

        taskPartialResize: ({ taskRecord, startDate, endDate, element, resizeData }) => {
            // Called continuously during resize
            this.updateResizePreview(startDate, endDate);
        },

        beforeTaskResizeFinalize: ({ taskRecord, source, context, event }) => {
            const { endDate, originalEndDate, async, finalize, resizeData } = context;

            // Async confirmation
            context.async = true;

            const duration = endDate - originalEndDate;
            if (Math.abs(duration) > 86400000) { // More than 1 day
                this.confirmResize(duration).then(finalize);
            } else {
                finalize(true);
            }
        },

        taskResizeEnd: ({ changed, taskRecord, resizeData }) => {
            if (changed) {
                console.log('Task resized:', taskRecord.name);
            }
        }
    }
};
```

### 3.4 Dependency Events

```typescript
const ganttConfig: GanttConfig = {
    listeners: {
        // Dependency creation drag
        beforeDependencyCreateDrag: ({ source }) => {
            // source is the TimeSpan (task) being dragged from
            console.log('Starting dependency creation from:', source);
        },

        dependencyCreateDragStart: ({ source }) => {
            console.log('Drag started from task:', source);
        },

        beforeDependencyCreateFinalize: ({ source, target, fromSide, toSide }) => {
            // Validate dependency before creation
            if (source.id === target.id) {
                return false; // Prevent self-referencing
            }

            // Check for circular dependencies
            if (wouldCreateCycle(source, target)) {
                this.showError('This would create a circular dependency');
                return false;
            }
        },

        dependencyCreateDrop: ({ source, target, dependency }) => {
            console.log('Dependency created:', dependency.type);
        },

        afterDependencyCreateDrop: ({ source, target, dependency }) => {
            // dependency may be null if creation was prevented
            if (dependency) {
                this.logDependencyCreation(dependency);
            }
        },

        // Dependency editing
        beforeDependencyEdit: ({ source, dependencyEdit, dependencyRecord }) => {
            if (dependencyRecord.isSystem) {
                return false; // Prevent editing system dependencies
            }
        },

        beforeDependencySave: ({ source, dependencyRecord, values }) => {
            console.log('Saving dependency with values:', values);
        },

        afterDependencySave: ({ source, dependencyRecord }) => {
            console.log('Dependency saved:', dependencyRecord.id);
        },

        beforeDependencyDelete: ({ source, dependencyRecord }) => {
            return this.confirmDelete('Delete this dependency?');
        }
    }
};
```

---

## 4. Event Object Structure

### 4.1 Common Event Object Properties

All events include a standard set of properties:

```typescript
interface BryntumEventObject {
    source: Gantt;           // The component that fired the event
    type?: string;           // Event name (for catchAll)
    [key: string]: any;      // Event-specific properties
}
```

### 4.2 Task Event Objects

```typescript
// taskClick, taskDblClick, taskMouseOver, etc.
interface TaskMouseEvent {
    source: Gantt;                // The Gantt instance
    taskRecord: TaskModel;        // The task model
    event: MouseEvent;            // Native browser event
}

// taskDrag
interface TaskDragEvent {
    source: Gantt;
    taskRecords: TaskModel[];     // All dragged tasks
    startDate: Date;              // New start date
    endDate: Date;                // New end date
    dragData: object;             // Internal drag data
    changed: boolean;             // True if startDate changed
}

// taskResizeStart, taskPartialResize
interface TaskResizeEvent {
    taskRecord: TaskModel;
    event: Event;
    resizeData: TaskResizeData[]; // When resizeSelected is true
    startDate?: Date;             // For partial resize
    endDate?: Date;               // For partial resize
    element?: HTMLElement;        // For partial resize
}
```

### 4.3 Cell Event Objects

```typescript
// cellClick, cellDblClick, cellContextMenu
interface CellEvent {
    grid: Grid;                    // The grid instance
    record: Model;                 // Row record
    column: Column;                // Column definition
    cellElement: HTMLElement;      // The cell DOM element
    target: HTMLElement;           // Actual clicked element
    event: MouseEvent;             // Native browser event
}

// cellMouseEnter, cellMouseLeave
interface CellHoverEvent {
    source: Grid;
    record: Model;
    column: Column;
    cellElement: HTMLElement;
    event: MouseEvent;
}
```

### 4.4 Dependency Event Objects

```typescript
// dependencyClick, dependencyDblClick
interface DependencyClickEvent {
    source: Scheduler;
    dependency: SchedulerDependencyModel;
    event: MouseEvent;
}

// beforeDependencyCreateFinalize
interface DependencyCreateFinalizeEvent {
    source: TimeSpan;                        // Source task
    target: TimeSpan;                        // Target task
    fromSide: 'start' | 'end' | 'top' | 'bottom';
    toSide: 'start' | 'end' | 'top' | 'bottom';
}
```

### 4.5 Store Event Objects

```typescript
// Store change event (catch-all for store mutations)
interface StoreChangeEvent {
    source: Store;
    action: 'remove' | 'removeAll' | 'add' | 'clearchanges' |
            'filter' | 'update' | 'dataset' | 'replace';
    record?: Model;           // For 'update' action
    records?: Model[];        // Changed records
    changes?: object;         // For 'update', field changes
}

// Store add event
interface StoreAddEvent {
    source: Store;
    records: Model[];         // Added records (branch roots for tree)
    allRecords?: Model[];     // All added records (flat list)
    parent?: Model;           // Parent node (tree store)
    index?: number;           // Insertion index
    oldIndex?: number;        // Previous index (for moves)
    isChild?: boolean;        // Added to a parent
    isExpand?: boolean;       // Added by expanding parent
    isMove?: object;          // Map of moved record ids
}
```

---

## 5. Preventing Default Behavior

### 5.1 Returning `false`

The simplest way to prevent default behavior:

```typescript
gantt.on({
    beforeTaskEdit: ({ taskRecord }) => {
        if (taskRecord.readOnly) {
            return false; // Synchronously prevent
        }
    }
});
```

### 5.2 Returning a Promise

For async validation:

```typescript
gantt.on({
    beforeTaskEdit: async ({ taskRecord }) => {
        const canEdit = await checkPermissions(taskRecord);
        return canEdit; // false to prevent
    },

    beforeTaskSave: ({ taskRecord }) => {
        // Return a Promise
        return new Promise((resolve) => {
            validateTask(taskRecord).then((isValid) => {
                resolve(isValid);
            });
        });
    }
});
```

### 5.3 Using the Finalize Pattern

For complex async flows with UI confirmation:

```typescript
gantt.on({
    beforeTaskDropFinalize: ({ context }) => {
        // Tell the system this is async
        context.async = true;

        // Show a confirmation dialog
        showDialog({
            title: 'Confirm Move',
            message: 'Move this task?',
            onConfirm: () => context.finalize(true),
            onCancel: () => context.finalize(false)
        });
    },

    beforeTaskResizeFinalize: ({ context }) => {
        context.async = true;

        if (context.endDate > maxDate) {
            showError('Cannot extend beyond project end');
            context.finalize(false);
        } else {
            context.finalize(true);
        }
    },

    beforeDragCreateFinalize: ({ source, proxyElement, context }) => {
        context.async = true;

        // Show a form to collect task details
        showTaskForm({
            onSave: (data) => {
                Object.assign(context.taskRecord, data);
                context.finalize(true);
            },
            onCancel: () => context.finalize(false)
        });
    }
});
```

### 5.4 Preventing Events at Store Level

```typescript
gantt.taskStore.on({
    beforeAdd: ({ records }) => {
        // Validate all records
        for (const record of records) {
            if (!record.name) {
                return false; // Prevent add
            }
        }
    },

    beforeRemove: ({ records, removingAll }) => {
        if (removingAll) {
            return confirm('Delete all tasks?');
        }

        // Check for system tasks
        if (records.some(r => r.isSystemTask)) {
            showError('Cannot delete system tasks');
            return false;
        }
    },

    beforeUpdate: ({ record, changes }) => {
        // Prevent certain field changes
        if ('startDate' in changes && record.locked) {
            return false;
        }
    }
});
```

---

## 6. Event Delegation Patterns

### 6.1 The `catchAll` Event

Listen to all events on an object:

```typescript
gantt.on({
    catchAll: (event) => {
        const { type } = event;

        // Log all events
        console.log(`[${type}]`, event);

        // Handle specific patterns
        if (type.startsWith('task')) {
            analytics.track('task_event', { type });
        }
    }
});
```

### 6.2 Centralized Event Handler

```typescript
class GanttEventHandler {
    private gantt: Gantt;

    constructor(gantt: Gantt) {
        this.gantt = gantt;
        this.attachListeners();
    }

    private attachListeners(): void {
        this.gantt.on({
            // Task events
            taskClick: this.onTaskClick.bind(this),
            taskDblClick: this.onTaskDblClick.bind(this),
            beforeTaskEdit: this.onBeforeTaskEdit.bind(this),
            afterTaskSave: this.onAfterTaskSave.bind(this),

            // Dependency events
            dependencyClick: this.onDependencyClick.bind(this),
            beforeDependencyCreateFinalize: this.onBeforeDependencyCreate.bind(this),

            // Cell events
            cellClick: this.onCellClick.bind(this),
            cellDblClick: this.onCellDblClick.bind(this),

            thisObj: this
        });
    }

    private onTaskClick({ taskRecord, event }: { taskRecord: TaskModel; event: MouseEvent }): void {
        if (event.ctrlKey) {
            this.handleTaskSelection(taskRecord);
        } else {
            this.showTaskDetails(taskRecord);
        }
    }

    private onBeforeTaskEdit({ taskRecord }: { taskRecord: TaskModel }): boolean | Promise<boolean> {
        return this.validateEditPermission(taskRecord);
    }

    // ... other handlers
}
```

### 6.3 Feature-Based Event Grouping

```typescript
// Group related listeners for easy enable/disable
const dragDropListeners = {
    name: 'dragDrop',

    beforeTaskDrag: ({ taskRecord }) => {
        return !taskRecord.locked;
    },

    taskDragStart: ({ taskRecords }) => {
        showDragIndicator(taskRecords);
    },

    taskDrag: ({ changed, startDate }) => {
        if (changed) {
            updateDragPreview(startDate);
        }
    },

    taskDrop: () => {
        hideDragIndicator();
    },

    afterTaskDrop: ({ valid }) => {
        if (!valid) {
            showDropFailedMessage();
        }
    }
};

// Attach the group
gantt.addListener(dragDropListeners);

// Later: disable drag-drop handling
gantt.detachListeners('dragDrop');
```

---

## 7. Key Gantt Events Reference

### 7.1 Task Events

| Event | Description | Preventable |
|-------|-------------|-------------|
| `taskClick` | Single click on a task bar | No |
| `taskDblClick` | Double click on a task bar | No |
| `taskContextMenu` | Right-click on a task | No |
| `taskMouseDown` | Mouse button pressed on task | No |
| `taskMouseUp` | Mouse button released on task | No |
| `taskMouseOver` | Mouse enters task bar | No |
| `taskMouseOut` | Mouse leaves task bar | No |
| `taskKeyDown` | Key pressed with task selected | No |
| `taskKeyUp` | Key released with task selected | No |
| `beforeTaskEdit` | Before editor opens | Yes |
| `beforeTaskEditShow` | Editor available, not shown | No |
| `beforeTaskSave` | Before saving task | Yes |
| `afterTaskSave` | After task saved | No |
| `afterTaskEdit` | After editor closes | No |
| `taskEditCanceled` | Edit was canceled | No |
| `beforeTaskDrag` | Before drag starts | Yes |
| `taskDragStart` | Drag has started | No |
| `taskDrag` | During drag | No |
| `beforeTaskDropFinalize` | Before drop completes | Yes (async) |
| `taskDrop` | After successful drop | No |
| `afterTaskDrop` | After drop (any result) | No |
| `beforeTaskResize` | Before resize starts | Yes |
| `taskResizeStart` | Resize has started | No |
| `taskPartialResize` | During resize | No |
| `beforeTaskResizeFinalize` | Before resize completes | Yes (async) |
| `taskResizeEnd` | After resize ends | No |

### 7.2 Dependency Events

| Event | Description | Preventable |
|-------|-------------|-------------|
| `dependencyClick` | Click on dependency line | No |
| `dependencyDblClick` | Double click on dependency | No |
| `dependencyContextMenu` | Right-click on dependency | No |
| `dependencyMouseOver` | Mouse enters dependency | No |
| `dependencyMouseOut` | Mouse leaves dependency | No |
| `dependenciesDrawn` | Dependencies rendered | No |
| `beforeDependencyCreateDrag` | Before dependency drag | Yes |
| `dependencyCreateDragStart` | Dependency drag started | No |
| `beforeDependencyCreateFinalize` | Before dependency created | Yes |
| `dependencyCreateDrop` | Dependency creation succeeded | No |
| `afterDependencyCreateDrop` | After creation attempt | No |
| `beforeDependencyEdit` | Before dependency editor | Yes |
| `beforeDependencyEditShow` | Editor available, not shown | No |
| `beforeDependencyAdd` | Before adding dependency | Yes |
| `beforeDependencySave` | Before saving dependency | Yes |
| `afterDependencySave` | After dependency saved | No |
| `beforeDependencyDelete` | Before deleting dependency | Yes |
| `dependencyValidationStart` | Async validation started | No |
| `dependencyValidationComplete` | Async validation complete | No |

### 7.3 Cell/Grid Events

| Event | Description | Preventable |
|-------|-------------|-------------|
| `cellClick` | Click in grid cell | No |
| `cellDblClick` | Double click in cell | No |
| `cellContextMenu` | Right-click in cell | No |
| `cellMouseEnter` | Mouse enters cell | No |
| `cellMouseLeave` | Mouse leaves cell | No |
| `cellMouseOver` | Mouse over cell | No |
| `cellMouseOut` | Mouse out of cell | No |
| `cellMenuBeforeShow` | Before context menu | Yes |
| `cellMenuItem` | Menu item selected | No |
| `cellMenuShow` | Context menu shown | No |
| `cellMenuToggleItem` | Check item toggled | No |
| `beforeCellEditStart` | Before cell edit | Yes |
| `beforeCancelCellEdit` | Before canceling edit | Yes |
| `cancelCellEdit` | Cell edit canceled | No |

### 7.4 Store Events

| Event | Description | Preventable |
|-------|-------------|-------------|
| `add` | Records added | No |
| `beforeAdd` | Before records added | Yes |
| `addConfirmed` | Temporary record confirmed | No |
| `remove` | Records removed | No |
| `beforeRemove` | Before records removed | Yes |
| `update` | Record updated | No |
| `beforeUpdate` | Before record update | Yes |
| `change` | Any data change (catch-all) | No |
| `filter` | After filtering | No |
| `beforeFilter` | Before filtering | No |
| `sort` | After sorting | No |
| `beforeSort` | Before sorting | No |
| `group` | After grouping | No |
| `commit` | Changes committed | No |
| `beforeCommit` | Before commit | No |
| `idChange` | Record ID changed | No |
| `beforeRequest` | Before AJAX request | Yes |
| `afterRequest` | After AJAX request | No |

---

## 8. Custom Event Firing with trigger()

### 8.1 Basic trigger() Usage

```typescript
// Method signature
trigger(eventName: string, param?: {
    bubbles?: boolean,
    [key: string]: any
}): Promise<boolean | any>;

// Fire a custom event
gantt.trigger('customTaskAction', {
    taskRecord: selectedTask,
    action: 'archive',
    timestamp: Date.now()
});

// Listen for custom events
gantt.on('customTaskAction', ({ taskRecord, action }) => {
    console.log(`Action ${action} on task:`, taskRecord.name);
});
```

### 8.2 Bubbling Custom Events

```typescript
// Fire event that bubbles to parent
gantt.taskStore.trigger('customStoreEvent', {
    bubbles: true,
    data: { message: 'Hello from store' }
});

// Listen on gantt (parent) for bubbled events
gantt.on('customStoreEvent', (event) => {
    console.log('Bubbled event:', event.data.message);
});
```

### 8.3 Async Event Handling

```typescript
// trigger() returns a Promise
async function performAction(): Promise<void> {
    const result = await gantt.trigger('beforeCustomAction', {
        taskRecord: selectedTask
    });

    if (result === false) {
        console.log('Action was prevented by a listener');
        return;
    }

    // Proceed with action
    await executeAction(selectedTask);

    gantt.trigger('afterCustomAction', {
        taskRecord: selectedTask
    });
}

// Listener that prevents the action
gantt.on('beforeCustomAction', async ({ taskRecord }) => {
    const allowed = await checkPermission(taskRecord);
    return allowed; // false prevents the action
});
```

### 8.4 Custom Event in a Feature/Plugin

```typescript
class MyCustomFeature {
    private gantt: Gantt;

    constructor(gantt: Gantt) {
        this.gantt = gantt;
    }

    async performBulkOperation(tasks: TaskModel[]): Promise<void> {
        // Fire before event, check if prevented
        const shouldContinue = await this.gantt.trigger('beforeBulkOperation', {
            tasks,
            operation: 'update'
        });

        if (shouldContinue === false) {
            return;
        }

        // Perform operation
        for (const task of tasks) {
            await this.processTask(task);

            // Fire progress event
            this.gantt.trigger('bulkOperationProgress', {
                task,
                completed: tasks.indexOf(task) + 1,
                total: tasks.length
            });
        }

        // Fire completion event
        this.gantt.trigger('afterBulkOperation', {
            tasks,
            success: true
        });
    }
}

// Usage
gantt.on({
    beforeBulkOperation: ({ tasks }) => {
        return tasks.length <= 100; // Limit to 100 tasks
    },

    bulkOperationProgress: ({ completed, total }) => {
        updateProgressBar(completed / total * 100);
    },

    afterBulkOperation: ({ success }) => {
        showNotification(success ? 'Complete!' : 'Failed');
    }
});
```

---

## 9. Event Suspension and Resumption

### 9.1 suspendEvents() and resumeEvents()

Temporarily prevent events from firing:

```typescript
// Suspend all events
gantt.suspendEvents();

// Perform bulk operations without triggering events
gantt.taskStore.add([task1, task2, task3]);
gantt.taskStore.remove([oldTask1, oldTask2]);

// Resume events
gantt.resumeEvents();

// Events are now firing again
```

### 9.2 Queuing Events During Suspension

```typescript
// Suspend with queuing enabled
gantt.suspendEvents(true); // true = queue events

// Perform operations
gantt.taskStore.add(newTask);
gantt.taskStore.update(existingTask);

// Resume and fire queued events
const hadEvents = gantt.resumeEvents();
// hadEvents is true if queued events were fired
```

### 9.3 Nested Suspension

```typescript
// Multiple calls stack
gantt.suspendEvents();
console.log('First suspension');

performNestedOperation(); // May call suspendEvents again

function performNestedOperation() {
    gantt.suspendEvents();
    // Do work
    gantt.resumeEvents(); // Only removes one suspension level
}

// Events still suspended here

gantt.resumeEvents(); // Now events fire again
```

### 9.4 Store-Level Batching

```typescript
// beginBatch/endBatch for store operations
gantt.taskStore.beginBatch();

// Multiple operations, one change event at end
gantt.taskStore.add(task1);
gantt.taskStore.add(task2);
gantt.taskStore.add(task3);
gantt.taskStore.remove(oldTask);

gantt.taskStore.endBatch(); // Single 'change' event fires
```

### 9.5 Project-Level Batching

```typescript
// For complex operations affecting multiple stores
await gantt.project.commitAsync(); // Ensure clean state

gantt.project.suspendAutoSync(); // Prevent auto-sync during changes

try {
    // Make many changes
    await gantt.taskStore.addAsync(newTasks);
    await gantt.dependencyStore.addAsync(newDependencies);
    await gantt.assignmentStore.addAsync(newAssignments);

    // Single sync at the end
    await gantt.project.sync();
} finally {
    gantt.project.resumeAutoSync();
}
```

---

## 10. Best Practices and Patterns

### 10.1 Performance Optimization

```typescript
// Use throttle for frequent events
gantt.on({
    taskDrag: {
        fn: (event) => updateUI(event),
        throttle: 50 // Max once per 50ms
    },

    scroll: {
        fn: (event) => handleScroll(event),
        throttle: 16 // ~60fps
    }
});

// Use buffer for events that may fire rapidly
gantt.on({
    change: {
        fn: () => recalculateStats(),
        buffer: 100 // Wait 100ms after last change
    }
});

// Suspend events during bulk operations
function importTasks(tasks: TaskData[]): void {
    gantt.suspendEvents();
    gantt.taskStore.beginBatch();

    try {
        tasks.forEach(data => gantt.taskStore.add(data));
    } finally {
        gantt.taskStore.endBatch();
        gantt.resumeEvents();
    }
}
```

### 10.2 Memory Management

```typescript
class TaskController {
    private gantt: Gantt;
    private detachers: Function[] = [];

    initialize(gantt: Gantt): void {
        this.gantt = gantt;

        // Store detacher functions for cleanup
        this.detachers.push(
            gantt.on('taskClick', this.handleClick, this),
            gantt.on('taskDblClick', this.handleDblClick, this),
            gantt.taskStore.on('change', this.handleChange, this)
        );
    }

    destroy(): void {
        // Clean up all listeners
        this.detachers.forEach(detach => detach());
        this.detachers = [];
    }
}

// Alternative: use named listener groups
gantt.addListener({
    name: 'myController',
    taskClick: this.handleClick,
    taskDblClick: this.handleDblClick,
    thisObj: this
});

// Clean up by name
gantt.detachListeners('myController');
```

### 10.3 Error Handling

```typescript
gantt.on({
    // Handle exceptions in event handlers
    catchEventHandlerExceptions: true, // If available in config

    taskClick: (event) => {
        try {
            processTaskClick(event);
        } catch (error) {
            console.error('Error in taskClick handler:', error);
            // Don't let errors break the UI
        }
    },

    beforeTaskSave: async ({ taskRecord }) => {
        try {
            return await validateTask(taskRecord);
        } catch (error) {
            console.error('Validation error:', error);
            showError('Validation failed');
            return false; // Prevent save on error
        }
    }
});
```

### 10.4 Debugging Events

```typescript
// Debug mode: log all events
const DEBUG_EVENTS = true;

if (DEBUG_EVENTS) {
    gantt.on({
        catchAll: (event) => {
            console.group(`Event: ${event.type}`);
            console.log('Event data:', event);
            console.trace('Stack trace');
            console.groupEnd();
        }
    });
}

// Conditional debugging for specific events
gantt.on({
    taskDrag: (event) => {
        if (window.DEBUG_DRAG) {
            console.log('Drag event:', {
                tasks: event.taskRecords.map(t => t.name),
                startDate: event.startDate,
                changed: event.changed
            });
        }
    }
});
```

### 10.5 TypeScript Type Safety

```typescript
import {
    Gantt,
    TaskModel,
    GanttConfig,
    SchedulerDependencyModel
} from '@bryntum/gantt';

// Define typed event handlers
interface TaskClickEvent {
    source: Gantt;
    taskRecord: TaskModel;
    event: MouseEvent;
}

interface DependencyClickEvent {
    source: Gantt;
    dependency: SchedulerDependencyModel;
    event: MouseEvent;
}

// Type-safe handler functions
const handleTaskClick = (event: TaskClickEvent): void => {
    const { taskRecord } = event;
    console.log(`Task: ${taskRecord.name}, Duration: ${taskRecord.duration}`);
};

const handleDependencyClick = (event: DependencyClickEvent): void => {
    const { dependency } = event;
    console.log(`Dependency: ${dependency.fromTask?.name} -> ${dependency.toTask?.name}`);
};

// Apply to config
const config: GanttConfig = {
    listeners: {
        taskClick: handleTaskClick,
        dependencyClick: handleDependencyClick
    }
};
```

---

## Cross-References

### Related Deep-Dive Documents

| Document | Relationship |
|----------|--------------|
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | Store events (add, remove, update) |
| [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) | Widget events, button clicks |
| [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) | Scheduling events (dataReady, beforeCommit) |
| [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md) | Sync events (beforeSync, syncSuccess) |
| [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) | Render events (renderTask, releaseTask) |

### Key API References (Level 1)

- `GanttConfig.listeners` - Event listener configuration
- `EventHelper` - Event utility methods
- `Observable` mixin - Event source interface

---

## Summary

The Bryntum Gantt event system provides:

1. **Multiple listener patterns**: `listeners` config, `on()`, `addListener()`, and declarative `on*` properties
2. **Event bubbling**: Via `bubbleEvents` config and `relayAll()` method
3. **Before/After pairs**: Consistent pattern for preventable operations
4. **Rich event objects**: Detailed context including records, elements, and browser events
5. **Prevention mechanisms**: Return `false`, Promises, and async `finalize()` callbacks
6. **Delegation support**: `catchAll` event and centralized handling patterns
7. **Custom events**: `trigger()` method with bubbling and async support
8. **Suspension control**: `suspendEvents()`/`resumeEvents()` and store batching

These tools enable building responsive, maintainable applications with fine-grained control over Gantt component behavior.
