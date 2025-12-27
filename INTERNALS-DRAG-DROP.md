# Bryntum Gantt Drag & Drop System Internals

This document provides a comprehensive deep-dive into the Bryntum Gantt drag and drop system, covering the core architecture, event lifecycle, and implementation details for all drag-related features.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [DragHelper Class - Core Implementation](#draghelper-class---core-implementation)
3. [DragContext Object](#dragcontext-object)
4. [Drag Lifecycle & Event Flow](#drag-lifecycle--event-flow)
5. [TaskDrag Feature](#taskdrag-feature)
6. [TaskResize Feature](#taskresize-feature)
7. [TaskDragCreate Feature](#taskdragcreate-feature)
8. [Dependency Creation (Terminal to Terminal)](#dependency-creation-terminal-to-terminal)
9. [Row Reordering](#row-reordering)
10. [Column Reordering](#column-reordering)
11. [Drag Proxies & Ghost Elements](#drag-proxies--ghost-elements)
12. [Drop Zones & Target Detection](#drop-zones--target-detection)
13. [Snapping System](#snapping-system)
14. [Constraint Validation](#constraint-validation)
15. [Multi-Drag (Multiple Items)](#multi-drag-multiple-items)
16. [Touch Support](#touch-support)
17. [Scroll Manager Integration](#scroll-manager-integration)
18. [CSS Classes During Drag](#css-classes-during-drag)
19. [Custom Drag Implementation Patterns](#custom-drag-implementation-patterns)

---

## Architecture Overview

The Bryntum drag and drop system is built on a layered architecture:

```
+-------------------+
|   Feature Layer   |  TaskDrag, TaskResize, RowReorder, ColumnReorder, etc.
+-------------------+
         |
+-------------------+
|   DragBase Layer  |  Scheduler/Gantt-specific drag base classes
+-------------------+
         |
+-------------------+
|   DragHelper      |  Core drag implementation (Core module)
+-------------------+
         |
+-------------------+
|   DragContext     |  State management during drag operations
+-------------------+
         |
+-------------------+
|  ScrollManager    |  Automatic scrolling during drag
+-------------------+
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `DragHelper` | `Core/helper/DragHelper` | Low-level drag implementation |
| `DragContext` | `Core/util/drag/DragContext` | Holds drag operation state |
| `DragBase` | `Scheduler/feature/base/DragBase` | Base for task/event drag |
| `TaskDrag` | `Gantt/feature/TaskDrag` | Task dragging (date changes) |
| `TaskResize` | `Gantt/feature/TaskResize` | Task resizing (duration changes) |
| `TaskDragCreate` | `Gantt/feature/TaskDragCreate` | Create tasks by drag |
| `RowReorder` | `Grid/feature/RowReorder` | Row reordering in tree |
| `ColumnReorder` | `Grid/feature/ColumnReorder` | Column header reordering |
| `ScrollManager` | `Core/helper/ScrollManager` | Auto-scroll during drag |

---

## DragHelper Class - Core Implementation

`DragHelper` is the foundation of all drag operations in Bryntum products.

### DragHelper Configuration

```typescript
interface DragHelperConfig {
    // Mode Configuration
    mode?: 'container' | 'translateXY';  // Drag mode

    // Target Selection
    targetSelector?: string;              // CSS selector for draggable elements
    target?: HTMLElement | Widget;        // Direct target element
    containers?: HTMLElement[];           // Container mode: elements for reordering

    // Proxy Configuration
    cloneTarget?: boolean;                // Clone element for drag proxy
    createProxy?: (element: HTMLElement) => HTMLElement;  // Custom proxy creation
    proxySelector?: string;               // Selector for proxy element
    autoSizeClonedTarget?: boolean;       // Apply width/height to cloned proxy
    hideOriginalElement?: boolean;        // Hide original during drag
    unifiedProxy?: boolean;               // Stack related elements below main proxy
    unifiedOffset?: number;               // Offset between stacked elements (px)
    removeProxyAfterDrop?: boolean;       // Clean up proxy after drop

    // Drop Target Configuration
    dropTargetSelector?: string;          // CSS selector for valid drop targets
    dropTargetCls?: string;               // CSS class added to drop targets during drag

    // Constraints
    dragWithin?: HTMLElement;             // Outer boundary element
    constrain?: boolean;                  // Constrain to dragWithin bounds
    lockX?: boolean;                      // Disable horizontal movement
    lockY?: boolean;                      // Disable vertical movement
    minX?: number;                        // Minimum X position
    maxX?: number;                        // Maximum X position
    minY?: number;                        // Minimum Y position
    maxY?: number;                        // Maximum Y position

    // Behavior
    dragThreshold?: number;               // Pixels before drag starts (default: 5)
    touchStartDelay?: number;             // Milliseconds before touch drag starts
    outerElement?: HTMLElement;           // Event listener attachment element
    ignoreSelector?: string;              // Elements to ignore in container mode

    // Validation
    isElementDraggable?: (element: HTMLElement) => boolean;  // Draggability check

    // Styling
    invalidCls?: string;                  // Class when drop position invalid

    // Scrolling
    scrollManager?: ScrollManager;        // For auto-scroll during drag
}
```

### DragHelper Modes

#### TranslateXY Mode (Default)
Moves elements using CSS transforms:

```typescript
const dragHelper = new DragHelper({
    mode: 'translateXY',
    targetSelector: '.my-draggable',
    cloneTarget: true,
    listeners: {
        drag({ context }) {
            // context.element is the drag proxy
            // context.newX, context.newY are calculated positions
        }
    }
});
```

#### Container Mode
Reorders elements within containers:

```typescript
const dragHelper = new DragHelper({
    mode: 'container',
    containers: [container1, container2],
    listeners: {
        drop({ context }) {
            // context.target is the drop location
            // context.grabbed is the original element
        }
    }
});
```

### DragHelper Events

```typescript
interface DragHelperEvents {
    // Before drag begins - return false to prevent
    beforeDragStart: {
        source: DragHelper;
        context: {
            element: HTMLElement;  // Original grabbed element
        };
        event: MouseEvent | TouchEvent;
    };

    // Drag operation started
    dragStart: {
        source: DragHelper;
        context: {
            element: HTMLElement;    // Moving element (may be clone)
            grabbed: HTMLElement;    // Original element
            relatedElements: HTMLElement[];  // Additional elements
        };
        event: MouseEvent | TouchEvent;
    };

    // During drag movement
    drag: {
        source: DragHelper;
        context: {
            element: HTMLElement;
            target: HTMLElement;     // Current element under cursor
            grabbed: HTMLElement;
            newX: number;            // New X position
            newY: number;            // New Y position
            relatedElements: HTMLElement[];
            valid: boolean;          // Set to false to mark invalid
        };
        event: MouseEvent;
    };

    // Drop completed
    drop: {
        source: DragHelper;
        context: {
            element: HTMLElement;
            target: HTMLElement;
            grabbed: HTMLElement;
            relatedElements: HTMLElement[];
            valid: boolean;
            async: boolean;          // Set true for async finalization
            finalize: (success: boolean) => void;
        };
    };

    // Drop aborted (invalid position)
    abort: {
        source: DragHelper;
        context: {
            element: HTMLElement;
            target: HTMLElement;
            grabbed: HTMLElement;
            relatedElements: HTMLElement[];
        };
        event: MouseEvent;
    };
}
```

### DragHelper Methods

```typescript
class DragHelper {
    // Properties
    readonly isDragging: boolean;

    // Methods
    abort(): Promise<void>;

    createProxy(element: HTMLElement): HTMLElement;

    animateProxyTo(
        element: HTMLElement | Rectangle,
        alignSpec?: AlignSpec
    ): Promise<void>;
}
```

---

## DragContext Object

The `DragContext` class encapsulates the state of an ongoing drag operation.

### DragContext Properties

```typescript
class DragContext {
    // State Properties
    readonly aborted: boolean;           // true if abort() was called
    readonly completed: boolean;         // true if drag finished
    readonly pending: boolean;           // true if threshold not reached
    readonly started: boolean;           // true if threshold exceeded
    valid: boolean;                      // Current validity state

    // Element References
    readonly element: HTMLElement;       // Drag origin element
    readonly endEvent: Event;            // Final event (mouseup/touchend)
    readonly event: Event;               // Current event
    readonly startEvent: Event;          // Initial event

    // Modifier Keys (from most recent event)
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
}
```

### DragContext Configuration

```typescript
interface DragContextConfig {
    itemElement?: HTMLElement;           // Element with draggingItemCls
    threshold?: number;                  // Pixels before drag starts
    touchStartDelay?: number;            // Touch delay before drag
}
```

### DragContext Methods

```typescript
class DragContext {
    // Abort the drag operation
    abort(): void;

    // Get data item (async, only after completion)
    get(name: string | string[]): Promise<any>;

    // Check if data item exists
    has(name: string): boolean;

    // Peek at data (sync, returns undefined for deferred)
    peek(name: string | string[]): any;

    // Set data item (can use function for lazy evaluation)
    set(name: string, value: any): void;
}
```

---

## Drag Lifecycle & Event Flow

### Complete Drag Lifecycle

```
User Action          Internal Process                    Events Fired
-----------          ----------------                    ------------

mousedown/       1. DragHelper captures event
touchstart       2. Check isElementDraggable()
    |            3. Initialize DragContext
    |            4. Wait for threshold/delay
    |
    v
movement         5. Threshold exceeded?
exceeds             - No: Continue waiting
threshold           - Yes: Proceed to drag start
    |
    v
                 6. Fire beforeDragStart              beforeDragStart
                    - Can return false to cancel      (on DragHelper)
    |
    v
                 7. Create proxy element
                 8. Set up related elements
                 9. Fire dragStart                    dragStart
                                                      (on DragHelper)

                 For TaskDrag:                        beforeTaskDrag
                                                      (on Gantt)
                                                      taskDragStart
                                                      (on Gantt)
    |
    v
mousemove/      10. Calculate new position
touchmove       11. Apply constraints
    |           12. Check drop target validity
    |           13. Update proxy position
    |           14. Fire drag event                   drag
    |                                                 (on DragHelper)
    |
    |           For TaskDrag:                         taskDrag
    |                                                 (on Gantt)
    v
mouseup/        15. Fire drop or abort
touchend            based on validity
    |
    v
valid drop      16. Process drop                      drop
    |               - Update data model               (on DragHelper)
    |
    |           For TaskDrag:                         beforeTaskDropFinalize
    |                                                 (on Gantt)
    |                                                 taskDrop
    |                                                 (on Gantt)
    |                                                 afterTaskDrop
    |                                                 (on Gantt)
    v
invalid drop    17. Animate proxy back                abort
    |           18. Clean up                          (on DragHelper)
    v
                19. Remove proxy element
                20. Restore original element
                21. Dispose DragContext
```

### Async Drop Finalization

For operations requiring user confirmation:

```typescript
gantt.on('beforeTaskDropFinalize', ({ context }) => {
    // Signal async handling
    context.async = true;

    // Show confirmation dialog
    MessageDialog.confirm({
        title: 'Confirm Move',
        message: 'Move task to new date?'
    }).then(result => {
        // Finalize with result
        context.finalize(result === MessageDialog.yesButton);
    });
});
```

---

## TaskDrag Feature

The `TaskDrag` feature enables dragging tasks to change their start dates.

### TaskDrag Configuration

```typescript
interface TaskDragConfig {
    // Multi-selection
    dragAllSelectedTasks?: boolean;      // Drag all selected (default: true)

    // Successor Pinning
    pinSuccessors?: boolean | string;    // Pin dependent tasks
    // Supported values: true, false, 'ctrl', 'shift', 'alt', 'meta'

    // Visual Feedback
    showExactDropPosition?: boolean;     // Snap to exact drop date
    showTooltip?: boolean;               // Show drag tooltip

    // Tooltip Customization
    tip?: TooltipConfig;                 // Tooltip configuration
    tooltipTemplate?: (data: {
        taskRecord: TaskModel;
        valid: boolean;
        startDate: Date;
        endDate: Date;
    }) => string;

    // Validation
    validatorFn?: (
        taskRecords: TaskModel[],
        startDate: Date,
        duration: number,
        event: Event
    ) => boolean | { valid: boolean; message: string };
    validatorFnThisObj?: object;

    // Events
    throttleDragEvent?: boolean;         // Only fire on actual changes

    // DragHelper passthrough
    dragHelperConfig?: DragHelperConfig;
}
```

### TaskDrag Events on Gantt

```typescript
interface TaskDragEvents {
    // Before drag starts - return false to prevent
    beforeTaskDrag: {
        source: Gantt;
        taskRecord: TaskModel;
        event: Event;
    };

    // Drag started
    taskDragStart: {
        source: Gantt;
        taskRecords: TaskModel[];
    };

    // During drag (throttled by default)
    taskDrag: {
        source: Gantt;
        taskRecords: TaskModel[];
        startDate: Date;
        endDate: Date;
        valid: boolean;
    };

    // Before finalization - supports async
    beforeTaskDropFinalize: {
        source: Gantt;
        context: {
            taskRecords: TaskModel[];
            valid: boolean;
            async: boolean;
            finalize: (success: boolean) => void;
        };
    };

    // Valid drop completed
    taskDrop: {
        source: Gantt;
        taskRecords: TaskModel[];
        isCopy: boolean;
    };

    // After drop (valid or invalid)
    afterTaskDrop: {
        source: Gantt;
        taskRecords: TaskModel[];
        valid: boolean;
    };
}
```

### TaskDrag Usage Example

```typescript
const gantt = new Gantt({
    features: {
        taskDrag: {
            dragAllSelectedTasks: true,
            showTooltip: true,

            validatorFn(taskRecords, startDate, duration, event) {
                // Prevent dragging to weekends
                const day = startDate.getDay();
                if (day === 0 || day === 6) {
                    return {
                        valid: false,
                        message: 'Cannot start on weekend'
                    };
                }
                return true;
            },

            tooltipTemplate({ taskRecord, startDate, endDate, valid }) {
                return `
                    <div class="drag-tip ${valid ? '' : 'invalid'}">
                        <strong>${taskRecord.name}</strong>
                        <div>Start: ${DateHelper.format(startDate, 'MMM D')}</div>
                        <div>End: ${DateHelper.format(endDate, 'MMM D')}</div>
                    </div>
                `;
            }
        }
    },

    listeners: {
        beforeTaskDrag({ taskRecord }) {
            // Prevent dragging milestones
            return !taskRecord.milestone;
        },

        taskDragStart({ taskRecords }) {
            console.log('Started dragging:', taskRecords.length, 'tasks');
        },

        beforeTaskDropFinalize({ context }) {
            // Async confirmation
            context.async = true;
            confirmDrop().then(confirmed => {
                context.finalize(confirmed);
            });
        },

        taskDrop({ taskRecords, isCopy }) {
            if (isCopy) {
                console.log('Tasks copied');
            } else {
                console.log('Tasks moved');
            }
        }
    }
});
```

### Segment Drag (TaskSegmentDrag)

For split tasks, individual segments can be dragged:

```typescript
const gantt = new Gantt({
    features: {
        taskSegmentDrag: {
            // Inherits TaskDrag config
        }
    }
});
```

---

## TaskResize Feature

The `TaskResize` feature allows resizing tasks by dragging their edges.

### TaskResize Configuration

```typescript
interface TaskResizeConfig {
    // Inherit from base
    ...EventResizeConfig;

    // Successor Pinning
    pinSuccessors?: boolean | string;

    // Tooltip
    showTooltip?: boolean;
    tooltipTemplate?: (data: {
        taskRecord: TaskModel;
        startDate: Date;
        endDate: Date;
        valid: boolean;
    }) => string;

    // Validation
    validatorFn?: (options: {
        taskRecord: TaskModel;
        startDate: Date;
        endDate: Date;
        edge: 'left' | 'right';
    }) => boolean | { valid: boolean; message: string };
}
```

### TaskResize Events

```typescript
interface TaskResizeEvents {
    beforeTaskResize: {
        source: Gantt;
        taskRecord: TaskModel;
        edge: 'left' | 'right';
    };

    taskResizeStart: {
        source: Gantt;
        taskRecord: TaskModel;
    };

    taskPartialResize: {
        source: Gantt;
        taskRecord: TaskModel;
        startDate: Date;
        endDate: Date;
    };

    beforeTaskResizeFinalize: {
        source: Gantt;
        context: {
            taskRecord: TaskModel;
            valid: boolean;
            async: boolean;
            finalize: Function;
        };
    };

    taskResizeEnd: {
        source: Gantt;
        taskRecord: TaskModel;
    };

    afterTaskResize: {
        source: Gantt;
        taskRecord: TaskModel;
        valid: boolean;
    };
}
```

### Resize Handles

Resize handles appear on hover at task edges:

```css
/* Resize handle styling */
.b-gantt .b-task-wrap .b-resize-handle {
    position: absolute;
    width: 10px;
    height: 100%;
    cursor: ew-resize;
}

.b-resize-handle-start {
    left: 0;
}

.b-resize-handle-end {
    right: 0;
}
```

---

## TaskDragCreate Feature

Create new tasks by dragging in empty row areas.

### TaskDragCreate Configuration

```typescript
interface TaskDragCreateConfig {
    // Disabled by default in Gantt
    disabled?: boolean;

    // Validation
    validatorFn?: (options: {
        startDate: Date;
        endDate: Date;
        resourceRecord: ResourceModel;
    }) => boolean;

    // Tooltip
    showTooltip?: boolean;
    tooltipTemplate?: (data: object) => string;
}
```

### TaskDragCreate Events

```typescript
interface TaskDragCreateEvents {
    beforeDragCreate: {
        source: Gantt;
        date: Date;
        resourceRecord: ResourceModel;
    };

    dragCreateStart: {
        source: Gantt;
        proxyElement: HTMLElement;
    };

    beforeDragCreateFinalize: {
        source: Gantt;
        context: {
            startDate: Date;
            endDate: Date;
            async: boolean;
            finalize: Function;
        };
    };

    dragCreateEnd: {
        source: Gantt;
        taskRecord: TaskModel;
    };

    afterDragCreate: {
        source: Gantt;
        taskRecord: TaskModel;
    };
}
```

---

## Dependency Creation (Terminal to Terminal)

The `Dependencies` feature includes the `DependencyCreation` mixin for creating dependencies by dragging.

### DependencyCreation Configuration

```typescript
interface DependencyCreationConfig {
    allowCreate?: boolean;                // Enable creation (default: true)
    allowDropOnEventBar?: boolean;        // Drop on bar vs terminal only
    allowCreateOnlyParent?: boolean;      // Only parent events (nested)

    // Terminal Configuration
    terminalCls?: string;                 // CSS class for terminals
    terminalSides?: string[];             // 'start', 'end', 'top', 'bottom'
    terminalSize?: number | string;       // Terminal diameter
    terminalOffset?: number;              // Offset from event edge
    terminalShowDelay?: number;           // Delay before showing (ms)
    terminalHideDelay?: number;           // Delay before hiding (ms)

    // Tooltip
    showCreationTooltip?: boolean;
    creationTooltip?: TooltipConfig;
    creationTooltipTemplate?: (data: {
        source: TimeSpan;
        target: TimeSpan;
        fromSide: string;
        toSide: string;
        valid: boolean;
    }) => string | DomConfig;
}
```

### DependencyCreation Events

```typescript
interface DependencyCreationEvents {
    // Before showing terminals
    beforeShowTerminals: {
        source: TimeSpan;
    };

    // Before drag starts
    beforeDependencyCreateDrag: {
        source: TimeSpan;
    };

    // Drag started
    dependencyCreateDragStart: {
        source: TimeSpan;
    };

    // Validation started (async)
    dependencyValidationStart: {
        source: TimeSpan;
        target: TimeSpan;
        dependencyType: number;
    };

    // Validation completed
    dependencyValidationComplete: {
        source: TimeSpan;
        target: TimeSpan;
        dependencyType: number;
    };

    // Before finalization
    beforeDependencyCreateFinalize: {
        source: TimeSpan;
        target: TimeSpan;
        fromSide: 'start' | 'end' | 'top' | 'bottom';
        toSide: 'start' | 'end' | 'top' | 'bottom';
    };

    // Drop successful
    dependencyCreateDrop: {
        source: TimeSpan;
        target: TimeSpan;
        dependency: DependencyModel;
    };

    // After drop (success or failure)
    afterDependencyCreateDrop: {
        source: TimeSpan;
        target: TimeSpan;
        dependency: DependencyModel;
    };
}
```

### Terminal Behavior

Terminals appear at task edges when hovering:

```typescript
// Show terminals programmatically
gantt.features.dependencies.showTerminals(taskRecord, element);

// Hide terminals
gantt.features.dependencies.hideTerminals(element);

// Abort dependency creation
gantt.features.dependencies.abort();
```

### Dependency Type Determination

The dependency type is determined by which terminals are connected:

| From Side | To Side | Type |
|-----------|---------|------|
| end | start | Finish-to-Start (FS) |
| start | start | Start-to-Start (SS) |
| end | end | Finish-to-Finish (FF) |
| start | end | Start-to-Finish (SF) |

---

## Row Reordering

The `RowReorder` feature enables drag and drop reordering of rows in the grid.

### RowReorder Configuration

```typescript
interface RowReorderConfig {
    // Interaction
    gripOnly?: boolean;                   // Require grip handle
    showGrip?: boolean | 'hover';         // Show grip icon
    touchStartDelay?: number;             // Touch delay

    // Tree Behavior
    dropOnLeaf?: boolean;                 // Allow drop on leaf (creates parent)
    hoverExpandTimeout?: number;          // Expand parent on hover (ms)

    // Sorting
    preserveSorters?: boolean;            // Keep sorters after drop

    // DragHelper
    dragHelperConfig?: DragHelperConfig;
}
```

### RowReorder Events

```typescript
interface RowReorderEvents {
    gridRowBeforeDropFinalize: {
        source: Grid;
        context: {
            records: Model[];
            parent: Model;
            insertBefore: Model;
            async: boolean;
            finalize: Function;
        };
    };

    gridRowDrag: {
        source: Grid;
        context: {
            records: Model[];
            target: HTMLElement;
            valid: boolean;
        };
    };

    gridRowDrop: {
        source: Grid;
        context: {
            records: Model[];
            parent: Model;
            insertBefore: Model;
        };
    };

    gridRowAbort: {
        source: Grid;
        context: object;
    };
}
```

### Row Grip Visual

```css
/* Grip icon styles */
.b-row-reorder-grip {
    width: 20px;
    cursor: grab;
}

.b-row-reorder-grip::before {
    content: '\2630';  /* Hamburger icon */
}
```

---

## Column Reordering

The `ColumnReorder` feature allows dragging column headers to reorder columns.

### ColumnReorder Configuration

```typescript
interface ColumnReorderConfig {
    stretchedDragProxy?: boolean;         // Full-height drag proxy
}
```

### ColumnReorder Properties

```typescript
class ColumnReorder {
    readonly isReordering: boolean;       // Drag in progress
    stretchedDragProxy: boolean;
}
```

---

## Drag Proxies & Ghost Elements

### Proxy Creation Methods

```typescript
// Default cloning
const dragHelper = new DragHelper({
    cloneTarget: true,
    autoSizeClonedTarget: true
});

// Custom proxy
const dragHelper = new DragHelper({
    cloneTarget: true,
    createProxy(element) {
        const proxy = document.createElement('div');
        proxy.className = 'custom-drag-proxy';
        proxy.innerHTML = `
            <div class="proxy-content">
                ${element.textContent}
            </div>
            <div class="proxy-badge">Moving...</div>
        `;
        return proxy;
    }
});

// Via proxySelector
const dragHelper = new DragHelper({
    cloneTarget: true,
    proxySelector: '.drag-handle'  // Clone only this part
});
```

### Proxy Animation

```typescript
// Animate proxy to target
await dragHelper.animateProxyTo(targetElement, {
    align: 'l-r',  // Align left edge to right edge
    offset: 10     // 10px gap
});

// Animate to rectangle
await dragHelper.animateProxyTo(new Rectangle(100, 100, 200, 50));
```

### Unified Proxy (Multi-Drag)

When dragging multiple items:

```typescript
const dragHelper = new DragHelper({
    unifiedProxy: true,      // Stack elements
    unifiedOffset: 5         // 5px offset per item
});
```

The visual effect shows stacked elements:
```
+---------------+
| Item 1        |
+---------------+
    +---------------+
    | Item 2        |
    +---------------+
        +---------------+
        | Item 3        |
        +---------------+
```

---

## Drop Zones & Target Detection

### Drop Target Configuration

```typescript
const dragHelper = new DragHelper({
    // CSS selector for valid drop zones
    dropTargetSelector: '.drop-zone',

    // Class added to drop zones during drag
    dropTargetCls: 'b-drag-over'
});
```

### Programmatic Drop Target Validation

```typescript
gantt.on('taskDrag', ({ context, valid }) => {
    // Get element under cursor
    const target = context.target;

    // Check if over valid drop zone
    if (!target.closest('.allowed-zone')) {
        context.valid = false;
    }
});
```

### External Drop Targets

For drops outside the Gantt:

```typescript
const gantt = new Gantt({
    features: {
        eventDrag: {
            externalDropTargetSelector: '.external-container'
        }
    },

    listeners: {
        taskDrop({ context }) {
            if (context.externalDropTarget) {
                // Handle external drop
                handleExternalDrop(context);
            }
        }
    }
});
```

---

## Snapping System

### Gantt Snapping Configuration

```typescript
const gantt = new Gantt({
    // Enable snapping
    snap: true,

    // Snap relative to event start (not timeline start)
    snapRelativeToEventStartDate: true,

    // Configure snap resolution via viewPreset
    viewPreset: {
        base: 'dayAndWeek',
        timeResolution: {
            unit: 'hour',
            increment: 1
        }
    }
});
```

### Task Drag Snapping

```typescript
const gantt = new Gantt({
    features: {
        taskDrag: {
            // Show exact drop position
            showExactDropPosition: true
        }
    }
});
```

### Custom Snap Logic

```typescript
const gantt = new Gantt({
    features: {
        eventDrag: {
            snapToPosition({ assignmentRecord, startDate, snapTo }) {
                // Round to nearest hour
                const snappedDate = DateHelper.round(startDate, 'hour');
                const x = gantt.getCoordinateFromDate(snappedDate);

                snapTo.x = x;
            }
        }
    }
});
```

### Snap to Resource (Vertical Snapping)

```typescript
const scheduler = new Scheduler({
    features: {
        eventDrag: {
            snapToResource: true,
            // Or with threshold
            snapToResource: {
                threshold: 50  // Pixels before snapping
            }
        }
    }
});
```

---

## Constraint Validation

### TaskDrag Validator

```typescript
const gantt = new Gantt({
    features: {
        taskDrag: {
            validatorFn(taskRecords, startDate, duration, event) {
                // Check project boundaries
                if (startDate < gantt.project.startDate) {
                    return {
                        valid: false,
                        message: 'Cannot move before project start'
                    };
                }

                // Check resource availability
                for (const task of taskRecords) {
                    if (!isResourceAvailable(task.resource, startDate)) {
                        return {
                            valid: false,
                            message: `${task.resource.name} is not available`
                        };
                    }
                }

                return true;
            }
        }
    }
});
```

### TaskResize Validator

```typescript
const gantt = new Gantt({
    features: {
        taskResize: {
            validatorFn({ taskRecord, startDate, endDate, edge }) {
                // Minimum duration check
                const duration = DateHelper.diff(startDate, endDate, 'hour');
                if (duration < 4) {
                    return {
                        valid: false,
                        message: 'Minimum duration is 4 hours'
                    };
                }

                // Check constraints
                if (edge === 'left' && taskRecord.constraintType === 'startnoearlierthan') {
                    if (startDate < taskRecord.constraintDate) {
                        return {
                            valid: false,
                            message: 'Violates start constraint'
                        };
                    }
                }

                return true;
            }
        }
    }
});
```

### Dependency Creation Validator

```typescript
gantt.on('beforeDependencyCreateFinalize', ({ source, target, fromSide, toSide }) => {
    // Prevent circular dependencies
    if (wouldCreateCircular(source, target)) {
        return false;
    }

    // Prevent parent-child dependencies
    if (source.isParentOf(target) || target.isParentOf(source)) {
        return false;
    }
});
```

---

## Multi-Drag (Multiple Items)

### Enabling Multi-Drag

```typescript
const gantt = new Gantt({
    multiEventSelect: true,  // Enable multi-selection

    features: {
        taskDrag: {
            dragAllSelectedTasks: true  // Default: true
        }
    }
});
```

### Related Elements During Drag

```typescript
gantt.on('taskDragStart', ({ context }) => {
    // Add custom related elements
    const labels = document.querySelectorAll('.task-label');
    context.relatedElements = Array.from(labels);
});
```

### Unified Drag Mode

```typescript
const gantt = new Gantt({
    features: {
        eventDrag: {
            unifiedDrag: true  // All selected move together
            // vs false: each on its own row
        }
    }
});
```

---

## Touch Support

### Touch Configuration

```typescript
const gantt = new Gantt({
    features: {
        taskDrag: {
            dragHelperConfig: {
                touchStartDelay: 300  // ms before drag starts on touch
            }
        },
        rowReorder: {
            touchStartDelay: 500
        }
    }
});
```

### Touch vs Mouse Detection

```typescript
gantt.on('taskDragStart', ({ event }) => {
    const isTouch = event.pointerType === 'touch' ||
                    event.type.startsWith('touch');

    if (isTouch) {
        // Adjust behavior for touch
        gantt.features.taskDrag.showTooltip = false;
    }
});
```

### Touch Event Handling

Bryntum normalizes touch events through `EventHelper`:

```typescript
// Get point from any event type
const point = EventHelper.getClientPoint(event);

// Get distance between events
const distance = EventHelper.getDistanceBetween(startEvent, currentEvent);

// Standard timing
EventHelper.dblClickTime;   // Double-tap detection
EventHelper.longPressTime;  // Context menu trigger
```

---

## Scroll Manager Integration

### ScrollManager Configuration

```typescript
interface ScrollManagerConfig {
    direction?: 'horizontal' | 'vertical' | 'both';
    scrollSpeed?: number;
    zoneWidth?: number;  // Pixels from edge to trigger scroll
}
```

### Auto-Scroll During Drag

```typescript
const scrollManager = new ScrollManager({
    direction: 'both',
    zoneWidth: 50
});

const dragHelper = new DragHelper({
    scrollManager,
    // ...
});

// Or manual control
scrollManager.startMonitoring({
    direction: 'horizontal',
    scrollables: [
        { element: gantt.timeAxisSubGrid.scrollable.element }
    ],
    callback() {
        // Called during scroll
        updateDragPosition();
    }
});
```

### ScrollManager Methods

```typescript
class ScrollManager {
    readonly isScrolling: boolean;

    startMonitoring(config: {
        direction?: 'horizontal' | 'vertical' | 'both';
        callback?: Function;
        thisObj?: object;
        scrollables?: object[];
    }): Function;  // Returns detach function

    stopMonitoring(element?: HTMLElement | HTMLElement[]): void;
}
```

---

## CSS Classes During Drag

### DragHelper Classes

| Class | Applied To | When |
|-------|-----------|------|
| `b-dragging` | Document body | Any drag active |
| `b-dragging-event` | Gantt element | Task drag active |
| `b-drag-proxy` | Proxy element | Always on proxy |
| `b-drag-invalid` | Proxy element | Drop invalid |
| `b-drag-original` | Original element | When hidden |
| `b-aborting` | Proxy element | During abort animation |

### TaskDrag Classes

| Class | Applied To | When |
|-------|-----------|------|
| `b-dragging` | Task element | Being dragged |
| `b-drag-hover` | Row element | Drag over row |
| `b-sch-event-hover` | Task element | Mouse over task |

### RowReorder Classes

| Class | Applied To | When |
|-------|-----------|------|
| `b-row-reordering` | Grid element | Row drag active |
| `b-row-drop-target` | Row element | Valid drop target |
| `b-row-insert-above` | Row element | Insert marker above |
| `b-row-insert-below` | Row element | Insert marker below |

### Dependency Creation Classes

| Class | Applied To | When |
|-------|-----------|------|
| `b-sch-terminal` | Terminal element | Always |
| `b-sch-terminal-start` | Terminal | Left/start side |
| `b-sch-terminal-end` | Terminal | Right/end side |
| `b-sch-terminal-top` | Terminal | Top side |
| `b-sch-terminal-bottom` | Terminal | Bottom side |
| `b-creating-dependency` | Task element | Dependency being drawn |

---

## Custom Drag Implementation Patterns

### Pattern 1: External Data Drag-In

```typescript
// Set up external drag source
const externalDragHelper = new DragHelper({
    targetSelector: '.external-item',
    mode: 'translateXY',
    cloneTarget: true,

    listeners: {
        dragStart({ context }) {
            // Set data for potential drop
            context.set('taskData', {
                name: context.grabbed.dataset.name,
                duration: 8
            });
        }
    }
});

// Handle drop on Gantt
gantt.on('scheduleClick', ({ date, event }) => {
    if (externalDragHelper.isDragging) {
        const taskData = externalDragHelper.context.peek('taskData');

        gantt.taskStore.add({
            ...taskData,
            startDate: date
        });

        externalDragHelper.abort();
    }
});
```

### Pattern 2: Custom Drag Constraint Zone

```typescript
class ConstrainedTaskDrag extends TaskDrag {
    setupDragHelperConfig() {
        const config = super.setupDragHelperConfig();

        // Add constraint
        config.dragWithin = this.client.timeAxisSubGridElement;
        config.constrain = true;

        return config;
    }
}
```

### Pattern 3: Drag with Preview

```typescript
let previewElement = null;

gantt.on({
    taskDragStart() {
        previewElement = document.createElement('div');
        previewElement.className = 'task-drop-preview';
        gantt.element.appendChild(previewElement);
    },

    taskDrag({ context, startDate }) {
        const rect = gantt.getTaskBox(context.taskRecords[0], startDate);
        previewElement.style.cssText = `
            left: ${rect.x}px;
            top: ${rect.y}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
        `;
    },

    afterTaskDrop() {
        previewElement?.remove();
        previewElement = null;
    }
});
```

### Pattern 4: Coordinated Multi-Widget Drag

```typescript
// Share drag state between Gantt and external Grid
const gantt = new Gantt({ ... });
const resourceGrid = new Grid({ ... });

// External items can be dropped on Gantt
resourceGrid.features.rowReorder.dragHelperConfig = {
    dropTargetSelector: '.b-gantt, .b-grid'
};

gantt.element.addEventListener('drop', (e) => {
    if (resourceGrid.features.rowReorder.isDragging) {
        const resourceRecord = resourceGrid.features.rowReorder
            .context.records[0];

        gantt.taskStore.add({
            name: resourceRecord.name,
            resourceId: resourceRecord.id,
            startDate: gantt.getDateFromCoordinate(e.clientX)
        });
    }
});
```

---

## Performance Considerations

### Throttling Drag Events

```typescript
const gantt = new Gantt({
    features: {
        taskDrag: {
            // Only fire when position changes
            throttleDragEvent: true  // Default
        }
    }
});
```

### Disabling Dependencies During Drag

```typescript
const gantt = new Gantt({
    features: {
        dependencies: {
            // Improves performance during drag
            drawOnEventInteraction: false
        }
    }
});
```

### Optimizing Large Drags

```typescript
gantt.on({
    taskDragStart() {
        // Suspend store events
        gantt.taskStore.suspendEvents();

        // Disable expensive features
        gantt.features.labels.disabled = true;
    },

    afterTaskDrop() {
        // Re-enable
        gantt.features.labels.disabled = false;
        gantt.taskStore.resumeEvents();
        gantt.refresh();
    }
});
```

---

## Troubleshooting

### Common Issues

**Drag not starting:**
- Check `isElementDraggable` returns true
- Verify `targetSelector` matches element
- Check `dragThreshold` value
- For touch, check `touchStartDelay`

**Drop not registering:**
- Verify `dropTargetSelector` matches
- Check `validatorFn` returns true
- Ensure not calling `event.preventDefault()`

**Proxy not visible:**
- Check `cloneTarget` is true
- Verify proxy CSS z-index
- Check `hideOriginalElement` setting

**Scroll not working:**
- Ensure `scrollManager` is configured
- Check `zoneWidth` is appropriate
- Verify scrollable container detection

### Debug Mode

```typescript
// Enable drag debug logging
DragHelper.debug = true;

// Monitor context state
gantt.on('taskDrag', ({ context }) => {
    console.log('Drag state:', {
        valid: context.valid,
        target: context.target,
        pending: context.pending,
        started: context.started
    });
});
```

---

## Summary

The Bryntum drag and drop system provides a comprehensive, layered architecture for implementing complex drag interactions:

1. **DragHelper** provides the low-level foundation with modes, proxies, and event management
2. **DragContext** manages state throughout the drag lifecycle
3. **Feature classes** (TaskDrag, TaskResize, etc.) build on this foundation for specific use cases
4. **Extensive events** allow interception and customization at every stage
5. **Validation system** enables constraint enforcement
6. **Touch support** is built-in with configurable delays
7. **Scroll integration** provides seamless auto-scrolling
8. **CSS classes** enable visual feedback throughout drag operations

Understanding these internals enables building sophisticated custom drag behaviors while leveraging the robust Bryntum infrastructure.
