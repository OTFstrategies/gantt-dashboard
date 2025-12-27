# TaskBoard Implementatie: Drag & Drop

> **Implementatie guide** voor card dragging, column transitions, validatie, drag proxies en animaties.

---

## Overzicht

De TaskBoard ondersteunt meerdere drag & drop scenario's:
- **Task Drag**: Kaarten verslepen tussen columns/swimlanes
- **Column Drag**: Columns herschikken
- **Swimlane Drag**: Swimlanes herschikken
- **Task Drag Select**: Marquee selectie van kaarten
- **Externe Drag**: Drag van/naar externe componenten

### Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                     TaskBoard Drag System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │   TaskDrag      │  │   ColumnDrag     │  │  SwimlaneDrag  │  │
│  │   Feature       │  │   Feature        │  │  Feature       │  │
│  └────────┬────────┘  └────────┬─────────┘  └───────┬────────┘  │
│           │                    │                     │           │
│           ▼                    ▼                     ▼           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    DragHelper (Core)                        │ │
│  │  - Touch support                                            │ │
│  │  - Drag threshold                                           │ │
│  │  - Proxy management                                         │ │
│  │  - Event coordination                                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    DOM Transition                           │ │
│  │  - Smooth animations                                        │ │
│  │  - Card movement                                            │ │
│  │  - Visual feedback                                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Feature Dependencies

```
TaskDrag
├── requires: TaskBoard.project.taskStore
├── optional: TaskDragSelect (multi-select)
└── integrates: TaskEdit, TaskMenu

ColumnDrag
├── requires: TaskBoard.columns (store)
├── blocked by: columnLock feature
└── integrates: ColumnHeaderMenu

SwimlaneDrag
├── requires: TaskBoard.swimlanes (store)
└── integrates: Swimlane configuration
```

---

## 1. TaskDrag Feature

> **Bron**: `taskboard.d.ts:129786-129939`

### Basis Configuratie

```javascript
const taskBoard = new TaskBoard({
    features: {
        // Boolean voor default settings
        taskDrag: true,

        // Of met configuratie
        taskDrag: {
            disabled: false,
            dragTouchStartDelay: 300,     // ms voor touch devices
            reorderTaskRecords: false     // True: pas store volgorde aan
        }
    }
});
```

### Complete TaskDragConfig Interface

```typescript
/**
 * Configuration options for TaskDrag feature
 * Bron: taskboard.d.ts:129787-129900
 */
type TaskDragConfig = {
    type?: 'taskDrag' | 'taskdrag';

    /**
     * Feature aan/uit zetten
     * - false: feature disabled, geen drag mogelijk
     * - 'inert': visueel actief maar niet functioneel
     */
    disabled?: boolean | 'inert';

    /**
     * Touch delay in milliseconds
     * De tijd dat een touch moet worden vastgehouden voordat drag start
     * Dit voorkomt accidentele drags tijdens scroll
     * @default 300
     */
    dragTouchStartDelay?: number;

    /**
     * Of tasks in de store moeten worden herschikt bij drop
     * - false (default): alleen columnField/swimlaneField wordt aangepast
     * - true: store volgorde wordt ook aangepast (legacy behavior)
     */
    reorderTaskRecords?: boolean;

    /**
     * Events die omhoog bubbelen in de ownership hierarchy
     */
    bubbleEvents?: object;

    /**
     * Call onXXX methods (onShow, onClick) automatisch
     */
    callOnFunctions?: boolean;

    /**
     * Catch exceptions in event handlers
     */
    catchEventHandlerExceptions?: boolean;

    /**
     * De TaskBoard widget waar deze feature aan gekoppeld is
     */
    client?: Widget;

    /**
     * Event listeners voor deze feature
     */
    listeners?: TaskDragListeners;
};

/**
 * TaskDrag Feature class
 */
export class TaskDrag extends TaskBoardFeature {
    /**
     * Static type identifier
     */
    static readonly isTaskDrag: boolean;

    /**
     * Instance type identifier
     */
    readonly isTaskDrag: boolean;

    /**
     * Returns true als een drag operatie actief is
     * Handig voor UI state management
     */
    readonly isDragging: boolean;

    /**
     * Constructor
     */
    constructor(config?: TaskDragConfig);
}
```

### Feature State Checking

```javascript
const taskBoard = new TaskBoard({
    features: { taskDrag: true }
});

// Check of drag actief is
if (taskBoard.features.taskDrag.isDragging) {
    // Disable andere interacties tijdens drag
    disableContextMenu();
}

// Programmatisch feature aan/uit
taskBoard.features.taskDrag.disabled = true;  // Disable
taskBoard.features.taskDrag.disabled = false; // Enable

// Inert mode (visueel actief, niet functioneel)
taskBoard.features.taskDrag.disabled = 'inert';
```

---

## 2. Drag Event Lifecycle

### Complete Event Flow

```
User Actions                    Events Fired                   Handler Returns
─────────────────────────────────────────────────────────────────────────────────

Mouse down on card      ───►    beforeTaskDrag        ───►    false: cancel drag
                                                               true/void: continue
                                    │
                                    ▼
                               taskDragStart          ───►    (no return value)
                                    │
                                    ▼
Mouse move             ───►    taskDrag (repeated)    ───►    false: invalid target
                                    │                          true: valid target
                                    ▼
Mouse up               ───►    beforeTaskDrop         ───►    false: abort drop
                                    │                          Promise<boolean>
                                    ▼
                         ┌──────────┴──────────┐
                         ▼                     ▼
                    taskDrop              taskDragAbort
                    (success)             (cancelled/invalid)
                         │                     │
                         └──────────┬──────────┘
                                    ▼
                               taskDragEnd           ───►    (always called)
                               (cleanup)
```

### Event Volgorde Gedetailleerd

```
1. beforeTaskDrag    → Voordat drag start (kan voorkomen)
                       - Kan async zijn (return Promise)
                       - return false voorkomt drag

2. taskDragStart     → Drag is daadwerkelijk gestart
                       - Drag proxy is aangemaakt
                       - Event logging starten hier

3. taskDrag          → Tijdens drag (elke muisbeweging)
                       - return false markeert target als invalid
                       - Cursor verandert naar "not-allowed"

4. beforeTaskDrop    → Voordat drop wordt uitgevoerd
                       - Kan async zijn voor confirmatie dialogen
                       - return false annuleert de drop

5a. taskDrop         → Na succesvolle drop
    - Task data is al bijgewerkt
    - Animatie kan nog lopen

5b. taskDragAbort    → Als drag geannuleerd
    - ESC toets ingedrukt
    - Invalid drop location
    - beforeTaskDrop returned false

6. taskDragEnd       → Altijd aan het eind
   - Cleanup code hier
   - UI state reset
```

### Complete Event Handler Implementatie

```javascript
// Bron: examples/task-drag/app.module.js
import { StringHelper, MessageDialog, Toast, TaskBoard } from '@bryntum/taskboard';

// Event logging functie voor debugging
function logDragEvent({ type }) {
    if (type === 'beforetaskdrag') {
        console.log('%c**** DRAG START ****', 'color:orange');
    }

    console.log(`[${new Date().toISOString()}] ${type}`);

    if (type === 'taskdragend') {
        console.log('%c****  DRAG END  ****', 'color:orange');
    }
}

const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Experimental smooth animations
    useDomTransition: true,

    features: {
        taskDrag: true,
        columnDrag: true
    },

    listeners: {
        // === BEFORE DRAG START ===
        beforeTaskDrag({ taskRecords, domEvent }) {
            // Return false om drag te voorkomen
            if (taskRecords.some(t => t.locked)) {
                Toast.show({
                    html: 'Locked tasks cannot be dragged',
                    type: 'warning'
                });
                return false;
            }

            // Check voor rechten
            if (!currentUser.canMoveTask) {
                return false;
            }

            // Async check (Promise)
            // return checkPermissionsAsync(taskRecords);
        },

        // === DRAG STARTED ===
        taskDragStart({ taskRecords, domEvent }) {
            console.log('Started dragging:', taskRecords.map(t => t.name));

            // Analytics tracking
            analytics.track('task_drag_start', {
                taskCount: taskRecords.length,
                taskIds: taskRecords.map(t => t.id)
            });

            // UI feedback
            document.body.classList.add('dragging-tasks');
        },

        // === DURING DRAG ===
        taskDrag({ taskRecords, targetColumn, targetSwimlane, domEvent }) {
            // Return false markeert target als invalid

            // Voorbeeld: voorkom terug naar backlog
            if (targetColumn?.id === 'backlog') {
                const allFromBacklog = taskRecords.every(
                    t => t.status === 'backlog'
                );
                if (!allFromBacklog) {
                    return false;  // Shows no-drop cursor
                }
            }

            // WIP limiet check
            if (targetColumn && WIP_LIMITS[targetColumn.id]) {
                const limit = WIP_LIMITS[targetColumn.id];
                const current = targetColumn.tasks.length;
                const incoming = taskRecords.filter(
                    t => t.status !== targetColumn.id
                ).length;

                if (current + incoming > limit) {
                    return false;
                }
            }

            // Swimlane restrictie
            if (targetSwimlane?.id === 'vip' && !currentUser.isVip) {
                return false;
            }

            return true; // Valid target
        },

        // === BEFORE DROP ===
        async beforeTaskDrop({ taskRecords, targetColumn, targetSwimlane, domEvent }) {
            // Geen confirmatie voor reordering binnen zelfde column
            if (taskRecords.every(t => t.status === targetColumn.id)) {
                return true;
            }

            // Confirmation dialog
            const result = await MessageDialog.confirm({
                title: 'Verify drop',
                message: StringHelper.xss`Please confirm moving ${
                    taskRecords.map(t => `"${t.name}"`).join(', ')
                } to ${targetColumn.text}?`
            });

            return result === MessageDialog.okButton;
        },

        // === DROP SUCCESS ===
        taskDrop({ taskRecords, targetColumn, targetSwimlane, domEvent }) {
            Toast.show({
                html: `${taskRecords.map(t =>
                    StringHelper.xss`"${t.name}"`
                ).join(', ')} was moved to ${targetColumn.text}`
            });

            // Server sync
            syncTasksToServer(taskRecords.map(t => ({
                id: t.id,
                status: t.status,
                swimlane: t.prio
            })));

            // Analytics
            analytics.track('task_dropped', {
                taskCount: taskRecords.length,
                targetColumn: targetColumn.id
            });
        },

        // === DRAG ABORTED ===
        taskDragAbort({ taskRecords }) {
            Toast.show({
                html: StringHelper.xss`Dragging ${
                    taskRecords.map(t => `"${t.name}"`).join(', ')
                } aborted`,
                type: 'warning'
            });
        },

        // === DRAG ENDED (always called) ===
        taskDragEnd({ taskRecords, domEvent }) {
            console.log('Drag operation ended');

            // Cleanup UI state
            document.body.classList.remove('dragging-tasks');

            // Reset any temporary state
            cleanupDragState();
        }
    }
});

// Dynamic event binding voor logging
let loggingEnabled = false;

function toggleDragLogging(enable) {
    loggingEnabled = enable;

    taskBoard[enable ? 'on' : 'un']({
        beforeTaskDrag: logDragEvent,
        taskDragStart: logDragEvent,
        taskDrag: logDragEvent,
        beforeTaskDrop: logDragEvent,
        taskDrop: logDragEvent,
        taskDragAbort: logDragEvent,
        taskDragEnd: logDragEvent
    });
}
```

### Complete Event Interfaces

```typescript
/**
 * Base interface voor alle task drag events
 */
interface TaskDragEventBase {
    /** De TaskBoard instantie */
    source: TaskBoard;

    /** Array van tasks die worden versleept */
    taskRecords: TaskModel[];

    /** Het originele DOM event (mouse/touch) */
    domEvent: Event;
}

/**
 * Event: beforeTaskDrag
 * Fired voor drag start - return false om te voorkomen
 */
type BeforeTaskDragEvent = TaskDragEventBase;
type BeforeTaskDragHandler = (event: BeforeTaskDragEvent) =>
    Promise<boolean> | boolean | void;

/**
 * Event: taskDragStart
 * Fired wanneer drag daadwerkelijk start
 */
type TaskDragStartEvent = TaskDragEventBase;
type TaskDragStartHandler = (event: TaskDragStartEvent) => void;

/**
 * Event: taskDrag
 * Fired tijdens drag movement - return false voor invalid target
 */
interface TaskDragMoveEvent extends TaskDragEventBase {
    /** Column waar cursor momenteel boven hangt (null indien buiten board) */
    targetColumn: ColumnModel | null;

    /** Swimlane waar cursor momenteel boven hangt */
    targetSwimlane: SwimlaneModel | null;
}
type TaskDragHandler = (event: TaskDragMoveEvent) => boolean | void;

/**
 * Event: beforeTaskDrop
 * Fired voor drop - return false om te annuleren (async supported)
 */
interface BeforeTaskDropEvent extends TaskDragEventBase {
    /** Target column voor drop */
    targetColumn: ColumnModel;

    /** Target swimlane voor drop */
    targetSwimlane: SwimlaneModel | null;
}
type BeforeTaskDropHandler = (event: BeforeTaskDropEvent) =>
    Promise<boolean> | boolean | void;

/**
 * Event: taskDrop
 * Fired na succesvolle drop
 */
interface TaskDropEvent extends TaskDragEventBase {
    /** Column waar gedrop is */
    targetColumn: ColumnModel;

    /** Swimlane waar gedrop is */
    targetSwimlane: SwimlaneModel | null;
}
type TaskDropHandler = (event: TaskDropEvent) => void;

/**
 * Event: taskDragAbort
 * Fired wanneer drag wordt geannuleerd
 */
interface TaskDragAbortEvent {
    source: TaskBoard;
    taskRecords: TaskModel[];
}
type TaskDragAbortHandler = (event: TaskDragAbortEvent) => void;

/**
 * Event: taskDragEnd
 * Fired aan het eind van elke drag operatie
 */
type TaskDragEndEvent = TaskDragEventBase;
type TaskDragEndHandler = (event: TaskDragEndEvent) => void;

/**
 * Complete listeners interface
 */
interface TaskBoardDragListeners {
    beforeTaskDrag?: BeforeTaskDragHandler | string;
    taskDragStart?: TaskDragStartHandler | string;
    taskDrag?: TaskDragHandler | string;
    beforeTaskDrop?: BeforeTaskDropHandler | string;
    taskDrop?: TaskDropHandler | string;
    taskDragAbort?: TaskDragAbortHandler | string;
    taskDragEnd?: TaskDragEndHandler | string;
}
```

---

## 3. Drag Validatie Patterns

### Per-Task Validatie

```javascript
// Via TaskModel property
class CustomTask extends TaskModel {
    static fields = [
        { name: 'locked', type: 'boolean', defaultValue: false },
        { name: 'draggable', type: 'boolean', defaultValue: true }
    ];
}

const task = taskBoard.project.taskStore.add({
    name: 'Locked Task',
    status: 'todo',
    draggable: false,  // Kan niet versleept worden
    locked: true       // Custom veld
});

// Via beforeTaskDrag event
listeners: {
    beforeTaskDrag({ taskRecords }) {
        // Controleer elk record
        for (const task of taskRecords) {
            // Check custom fields
            if (task.locked) {
                Toast.show({ html: 'Task is locked', type: 'error' });
                return false;
            }

            // Check model property
            if (task.draggable === false) {
                return false;
            }

            // Check status
            if (task.status === 'done') {
                Toast.show({ html: 'Cannot move completed tasks', type: 'warning' });
                return false;
            }
        }
        return true;
    }
}
```

### Column Transition Rules

```javascript
// Definieer toegestane transities
const ALLOWED_TRANSITIONS = {
    'backlog': ['todo'],
    'todo': ['doing', 'backlog'],
    'doing': ['review', 'todo'],
    'review': ['done', 'doing'],
    'done': ['review']  // Alleen terug naar review
};

const taskBoard = new TaskBoard({
    listeners: {
        taskDrag({ taskRecords, targetColumn }) {
            if (!targetColumn) return false;

            for (const task of taskRecords) {
                const currentColumn = task.status;
                const allowed = ALLOWED_TRANSITIONS[currentColumn] || [];

                // Zelfde column is altijd OK (reordering)
                if (currentColumn === targetColumn.id) continue;

                // Check of transitie is toegestaan
                if (!allowed.includes(targetColumn.id)) {
                    return false;
                }
            }

            return true;
        }
    }
});
```

### WIP Limits Validatie

```javascript
const WIP_LIMITS = {
    todo: null,      // Geen limiet
    doing: 5,        // Max 5 taken
    review: 3,       // Max 3 taken
    done: null       // Geen limiet
};

listeners: {
    // Validatie tijdens drag
    taskDrag({ taskRecords, targetColumn }) {
        if (!targetColumn) return false;

        const limit = WIP_LIMITS[targetColumn.id];
        if (limit === null) return true;  // Geen limiet

        // Tel huidige taken
        const currentCount = targetColumn.tasks.length;

        // Tel inkomende taken (die nog niet in deze column zijn)
        const incomingCount = taskRecords.filter(
            t => t.status !== targetColumn.id
        ).length;

        const wouldExceed = currentCount + incomingCount > limit;

        if (wouldExceed) {
            // Visual feedback op de column header
            targetColumn.element?.classList.add('wip-exceeded');
        }

        return !wouldExceed;
    },

    // Cleanup visual feedback
    taskDragEnd() {
        document.querySelectorAll('.wip-exceeded').forEach(el => {
            el.classList.remove('wip-exceeded');
        });
    }
}
```

### Swimlane Restrictions

```javascript
// Swimlane-specifieke regels
const SWIMLANE_RESTRICTIONS = {
    critical: {
        // Alleen senior devs mogen naar critical
        allowedRoles: ['senior', 'lead'],
        // Alleen high prio tasks
        requiredPriority: 'high'
    },
    vip: {
        // VIP swimlane alleen voor geverifieerde users
        requiresVerification: true
    }
};

listeners: {
    taskDrag({ taskRecords, targetColumn, targetSwimlane }) {
        if (!targetColumn) return false;

        // Swimlane check
        if (targetSwimlane) {
            const restrictions = SWIMLANE_RESTRICTIONS[targetSwimlane.id];

            if (restrictions) {
                // Role check
                if (restrictions.allowedRoles &&
                    !restrictions.allowedRoles.includes(currentUser.role)) {
                    return false;
                }

                // Priority check
                if (restrictions.requiredPriority) {
                    const allCorrectPrio = taskRecords.every(
                        t => t.prio === restrictions.requiredPriority
                    );
                    if (!allCorrectPrio) return false;
                }

                // Verification check
                if (restrictions.requiresVerification && !currentUser.verified) {
                    return false;
                }
            }
        }

        return true;
    }
}
```

### Server-Side Async Validatie

```javascript
listeners: {
    async beforeTaskDrop({ taskRecords, targetColumn, targetSwimlane }) {
        // Lokale pre-check voor snelle feedback
        const hasLockedTasks = taskRecords.some(t => t.locked);
        if (hasLockedTasks) {
            Toast.show({ html: 'Cannot move locked tasks', type: 'error' });
            return false;
        }

        // Server validatie
        try {
            const response = await fetch('/api/validate-move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskIds: taskRecords.map(t => t.id),
                    targetColumnId: targetColumn.id,
                    targetSwimlaneId: targetSwimlane?.id,
                    userId: currentUser.id
                })
            });

            const result = await response.json();

            if (!result.allowed) {
                Toast.show({
                    html: result.reason || 'Move not allowed',
                    type: 'error'
                });
                return false;
            }

            // Optioneel: laat server data meenemen
            if (result.updates) {
                // Server heeft extra updates
                result.updates.forEach(update => {
                    const task = taskRecords.find(t => t.id === update.id);
                    if (task) {
                        task.set(update.fields);
                    }
                });
            }

            return true;
        } catch (error) {
            Toast.show({
                html: 'Validation failed. Please try again.',
                type: 'error'
            });
            return false;
        }
    }
}
```

---

## 4. Drag Proxy & Animaties

### useDomTransition

```javascript
const taskBoard = new TaskBoard({
    // Experimentele smooth animaties voor:
    // - Card movement tijdens drag
    // - Card repositioning na drop
    // - Column reordering
    useDomTransition: true
});
```

### CSS Classes Tijdens Drag

```css
/* === DRAG PROXY STYLING === */

/* Dragged card - het element dat met de muis meebeweegt */
.b-taskboard-card.b-dragging {
    opacity: 0.9;
    transform: rotate(3deg) scale(1.02);
    box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.2),
        0 5px 15px rgba(0, 0, 0, 0.1);
    cursor: grabbing !important;
    z-index: 10000;
    transition: none; /* Disable transitions tijdens drag */
}

/* Ghost op originele positie */
.b-taskboard-card.b-drag-original {
    opacity: 0.3;
    transform: scale(0.98);
    pointer-events: none;
}

/* === DROP INDICATOR === */

/* Placeholder waar card gedropt zou worden */
.b-taskboard-drop-indicator {
    border: 2px dashed var(--taskboard-primary-color, #4f8aec);
    border-radius: 8px;
    background: rgba(79, 138, 236, 0.1);
    min-height: 80px;
    margin: 8px;
    transition: height 0.2s ease;
}

/* Drop indicator animation */
.b-taskboard-drop-indicator::before {
    content: 'Drop here';
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--taskboard-primary-color, #4f8aec);
    font-weight: 500;
    opacity: 0.7;
}

/* === COLUMN STATES TIJDENS DRAG === */

/* Column waar cursor boven hangt */
.b-taskboard-column.b-drag-over {
    background-color: rgba(79, 138, 236, 0.05);
    border: 2px solid rgba(79, 138, 236, 0.3);
}

/* Invalid drop target */
.b-taskboard-column.b-drag-invalid {
    background-color: rgba(255, 0, 0, 0.05);
    border: 2px solid rgba(255, 0, 0, 0.3);
}

.b-taskboard-column.b-drag-invalid::after {
    content: '✕';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 48px;
    color: rgba(255, 0, 0, 0.3);
    pointer-events: none;
}

/* Valid drop target */
.b-taskboard-column.b-drag-valid {
    background-color: rgba(0, 200, 0, 0.05);
    border: 2px solid rgba(0, 200, 0, 0.3);
}

/* === SWIMLANE STATES === */

/* Swimlane hover state */
.b-taskboard-swimlane.b-drag-over {
    background-color: rgba(79, 138, 236, 0.02);
}

/* === CARD TRANSITIONS === */

/* Smooth card movement animations */
.b-taskboard-card {
    transition:
        transform 0.2s ease,
        opacity 0.2s ease,
        box-shadow 0.2s ease;
}

/* Drop animation */
.b-taskboard-card.b-dropping {
    animation: dropBounce 0.3s ease-out;
}

@keyframes dropBounce {
    0% {
        transform: scale(1.05);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    50% {
        transform: scale(0.98);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
}

/* === CURSOR STATES === */

/* Grabbable cards */
.b-taskboard-card:not(.b-dragging) {
    cursor: grab;
}

/* Dragging cursor */
.b-taskboard.b-dragging,
.b-taskboard.b-dragging * {
    cursor: grabbing !important;
}

/* Invalid target cursor */
.b-taskboard-column.b-drag-invalid {
    cursor: not-allowed !important;
}

/* === WIP LIMIT WARNINGS === */

.b-taskboard-column.wip-warning {
    background-color: rgba(255, 165, 0, 0.1);
}

.b-taskboard-column.wip-exceeded {
    background-color: rgba(255, 0, 0, 0.1);
}

.b-taskboard-column.wip-exceeded .b-taskboard-column-header {
    color: #ff4444;
}
```

### Custom Drag Proxy via taskRenderer

```javascript
const taskBoard = new TaskBoard({
    taskRenderer({ taskRecord, cardConfig, isDragging }) {
        if (isDragging) {
            // Custom class toevoegen
            cardConfig.class['custom-dragging'] = true;

            // Inline style aanpassen
            cardConfig.style = {
                ...cardConfig.style,
                transform: 'scale(1.05) rotate(2deg)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.25)'
            };

            // Minimale content tijdens drag
            cardConfig.children = [{
                tag: 'div',
                class: 'drag-preview',
                html: taskRecord.name
            }];
        }

        return cardConfig;
    }
});
```

### Drag Handle Restricties

```javascript
// Drag alleen vanaf specifiek element
const taskBoard = new TaskBoard({
    listeners: {
        beforeTaskDrag({ domEvent }) {
            // Check of drag start vanaf handle element
            const handle = domEvent.target.closest('.drag-handle');
            if (!handle) {
                return false;  // Alleen drag vanaf handle
            }
        }
    },

    // Card met drag handle
    headerItems: {
        dragHandle: {
            type: 'template',
            template: () => ({
                tag: 'i',
                class: 'drag-handle b-fa b-fa-grip-vertical'
            })
        }
    }
});
```

---

## 5. Multi-Select Drag (TaskDragSelect)

### TaskDragSelect Feature Config

```typescript
/**
 * Configuration for TaskDragSelect feature
 * Bron: taskboard.d.ts:130025-130167
 */
type TaskDragSelectConfig = {
    type?: 'taskDragSelect' | 'taskdragselect';

    /**
     * Pixels beweging voordat drag-select start
     * Hogere waarde = minder accidentele selecties
     * @default 5
     */
    dragThreshold?: number;

    /**
     * Feature disabled state
     */
    disabled?: boolean | 'inert';

    /**
     * Event listeners
     */
    listeners?: TaskDragSelectListeners;
};
```

### Basis Configuratie

```javascript
const taskBoard = new TaskBoard({
    features: {
        taskDrag: true,
        taskDragSelect: {
            dragThreshold: 5  // Pixels beweging voordat select start
        }
    }
});

// Marquee selectie: Shift + drag op lege ruimte
// Selecteert alle kaarten binnen de rechthoek
```

### Selection Combinatie met Drag

```javascript
const taskBoard = new TaskBoard({
    features: {
        taskDrag: true,
        taskDragSelect: true
    },

    listeners: {
        // Bij selectie wijziging
        selectionChange({ selection, action, selected, deselected }) {
            console.log(`Selection changed: ${selection.length} tasks`);
            console.log('Action:', action);  // 'select', 'deselect', 'clear'

            // Update UI
            updateSelectionPanel(selection);
        },

        // Bij drag van geselecteerde taken
        beforeTaskDrag({ taskRecords }) {
            console.log(`Dragging ${taskRecords.length} selected tasks`);

            // Als meerdere geselecteerd, toon count indicator
            if (taskRecords.length > 1) {
                showDragCountBadge(taskRecords.length);
            }
        },

        taskDragEnd({ taskRecords }) {
            hideDragCountBadge();
        }
    }
});
```

### Programmatische Selectie

```javascript
// Selecteer één task
taskBoard.selectTask(task1);

// Selecteer meerdere tasks
taskBoard.selectTask(task2, true);  // true = add to selection
taskBoard.selectTask(task3, true);

// Selecteer via IDs
const tasks = taskBoard.project.taskStore.query(
    t => t.prio === 'high'
);
tasks.forEach(t => taskBoard.selectTask(t, true));

// Deselecteer
taskBoard.deselectTask(task1);

// Deselecteer alle
taskBoard.deselectAll();

// Get huidige selectie
const selectedTasks = taskBoard.selectedTasks;
console.log(`${selectedTasks.length} tasks selected`);

// Check of task geselecteerd is
const isSelected = taskBoard.isSelected(task1);

// Toggle selectie
if (taskBoard.isSelected(task)) {
    taskBoard.deselectTask(task);
} else {
    taskBoard.selectTask(task);
}
```

### Selection met Keyboard Modifiers

```javascript
listeners: {
    taskClick({ taskRecord, domEvent }) {
        if (domEvent.ctrlKey || domEvent.metaKey) {
            // Ctrl/Cmd+click: toggle selection
            if (taskBoard.isSelected(taskRecord)) {
                taskBoard.deselectTask(taskRecord);
            } else {
                taskBoard.selectTask(taskRecord, true);  // Add to selection
            }
        } else if (domEvent.shiftKey) {
            // Shift+click: range selection
            // (Dit vereist custom implementatie)
            selectRange(lastSelectedTask, taskRecord);
        } else {
            // Normal click: replace selection
            taskBoard.deselectAll();
            taskBoard.selectTask(taskRecord);
        }

        lastSelectedTask = taskRecord;
    }
}

function selectRange(fromTask, toTask) {
    // Get all visible tasks
    const allTasks = taskBoard.project.taskStore.records;

    const fromIndex = allTasks.indexOf(fromTask);
    const toIndex = allTasks.indexOf(toTask);

    const [start, end] = fromIndex < toIndex
        ? [fromIndex, toIndex]
        : [toIndex, fromIndex];

    for (let i = start; i <= end; i++) {
        taskBoard.selectTask(allTasks[i], true);
    }
}
```

### Bulk Actions op Selectie

```javascript
// Bulk move
function moveSelectedTasks(targetColumnId) {
    const selected = taskBoard.selectedTasks;

    taskBoard.project.taskStore.suspendAutoCommit();

    selected.forEach(task => {
        task.status = targetColumnId;
    });

    taskBoard.project.taskStore.resumeAutoCommit();
    taskBoard.deselectAll();
}

// Bulk delete
async function deleteSelectedTasks() {
    const selected = taskBoard.selectedTasks;

    const confirmed = await MessageDialog.confirm({
        title: 'Delete Tasks',
        message: `Delete ${selected.length} selected task(s)?`
    });

    if (confirmed === MessageDialog.okButton) {
        taskBoard.project.taskStore.remove(selected);
        taskBoard.deselectAll();
    }
}

// Bulk update
function updateSelectedTasks(fieldUpdates) {
    const selected = taskBoard.selectedTasks;

    taskBoard.project.taskStore.suspendAutoCommit();

    selected.forEach(task => {
        task.set(fieldUpdates);
    });

    taskBoard.project.taskStore.resumeAutoCommit();
}

// Toolbar met bulk actions
const taskBoard = new TaskBoard({
    tbar: [
        {
            type: 'button',
            text: 'Move to Done',
            icon: 'b-fa-check',
            disabled: true,
            ref: 'moveBtn',
            onClick: () => moveSelectedTasks('done')
        },
        {
            type: 'button',
            text: 'Delete',
            icon: 'b-fa-trash',
            disabled: true,
            ref: 'deleteBtn',
            onClick: deleteSelectedTasks
        }
    ],

    listeners: {
        selectionChange({ selection }) {
            const hasSelection = selection.length > 0;
            taskBoard.widgetMap.moveBtn.disabled = !hasSelection;
            taskBoard.widgetMap.deleteBtn.disabled = !hasSelection;
        }
    }
});
```

---

## 6. Column Drag

> **Bron**: `taskboard.d.ts:126968-127100`

### Complete ColumnDrag Config

```typescript
/**
 * Configuration for ColumnDrag feature
 */
type ColumnDragConfig = {
    type?: 'columnDrag' | 'columndrag';

    /**
     * Feature disabled state
     */
    disabled?: boolean | 'inert';

    /**
     * Events die omhoog bubbelen
     */
    bubbleEvents?: object;

    /**
     * Event listeners
     */
    listeners?: ColumnDragListeners;
};

/**
 * ColumnDrag Feature class
 */
export class ColumnDrag extends TaskBoardFeature {
    static readonly isColumnDrag: boolean;
    readonly isColumnDrag: boolean;
}
```

### Column Drag Event Flow

```
beforeColumnDrag  ───►  columnDragStart  ───►  columnDrag (repeated)
                                                      │
                                                      ▼
                                              beforeColumnDrop
                                                      │
                                         ┌────────────┴────────────┐
                                         ▼                         ▼
                                    columnDrop              columnDragAbort
                                         │                         │
                                         └──────────┬──────────────┘
                                                    ▼
                                              columnDragEnd
```

### Configuratie & Event Handlers

```javascript
// Bron: examples/column-drag/app.module.js
const taskBoard = new TaskBoard({
    appendTo: 'container',

    useDomTransition: true,
    showCollapseInHeader: false,
    showCountInHeader: false,

    features: {
        columnDrag: true,
        columnResize: true,

        // Customize column header menu
        columnHeaderMenu: {
            processItems({ items, columnRecord }) {
                // Block moving the Done column
                if (columnRecord.id === 'Done') {
                    items.moveColumnLeft.disabled = true;
                    items.moveColumnRight.disabled = true;
                }

                // Prevent moving to after Done
                const lastColumn = taskBoard.columns.last;
                if (columnRecord === taskBoard.columns.getAt(
                    taskBoard.columns.count - 2
                )) {
                    items.moveColumnRight.disabled = true;
                }
            }
        }
    },

    columns: [
        { id: 'Todo', text: 'Todo', color: 'deep-orange' },
        { id: 'Doing', text: 'Doing', color: 'orange' },
        { id: 'Review', text: 'Review', color: 'blue' },
        { id: 'Done', text: 'Done', color: 'light-green' }
    ],

    listeners: {
        // Prevent dragging specific columns
        beforeColumnDrag({ columnRecord }) {
            // Done column mag niet verplaatst worden
            if (columnRecord.id === 'Done') {
                Toast.show({
                    html: 'The Done column cannot be moved',
                    type: 'warning'
                });
                return false;
            }

            // Locked columns
            if (columnRecord.locked !== null) {
                return false;
            }

            return true;
        },

        // Validate drop location during drag
        columnDrag({ columnRecord, beforeColumn }) {
            // Prevent dropping at the end (after Done)
            if (beforeColumn === null) {
                return false;  // Invalid - Done moet laatste blijven
            }

            // Prevent dropping before locked column
            if (beforeColumn?.locked === 'start') {
                return false;
            }

            return true;
        },

        // Confirmation before drop
        async beforeColumnDrop({ columnRecord, beforeColumn }) {
            if (beforeColumn) {
                const result = await MessageDialog.confirm({
                    title: 'Verify drop',
                    message: StringHelper.xss`Move "${columnRecord.text}" before "${beforeColumn.text}"?`
                });

                return result === MessageDialog.okButton;
            }
            return true;
        },

        // After successful drop
        columnDrop({ columnRecord, beforeColumn }) {
            if (beforeColumn) {
                Toast.show(
                    StringHelper.xss`${columnRecord.text} moved before ${beforeColumn.text}`
                );

                // Persist new order
                saveColumnOrder(taskBoard.columns.map(c => c.id));
            }
        },

        // Drag cancelled
        columnDragAbort({ columnRecord }) {
            Toast.show({
                html: StringHelper.xss`Dragging ${columnRecord.text} aborted`,
                type: 'warning'
            });
        },

        columnDragStart({ columnRecord }) {
            console.log('Started dragging column:', columnRecord.text);
        },

        columnDragEnd({ columnRecord }) {
            console.log('Column drag ended');
        }
    }
});

// Event logging toggle (voor development)
let logColumnDrag = false;

function toggleColumnDragLogging(enable) {
    logColumnDrag = enable;

    const logEvent = ({ type }) => {
        if (type === 'beforecolumndrag') {
            console.log('%c**** COLUMN DRAG START ****', 'color:blue');
        }
        console.log(type);
        if (type === 'columndragend') {
            console.log('%c****  COLUMN DRAG END  ****', 'color:blue');
        }
    };

    taskBoard[enable ? 'on' : 'un']({
        beforeColumnDrag: logEvent,
        columnDragStart: logEvent,
        columnDrag: logEvent,
        beforeColumnDrop: logEvent,
        columnDrop: logEvent,
        columnDragAbort: logEvent,
        columnDragEnd: logEvent
    });
}
```

### Column Drag Event Interfaces

```typescript
/**
 * Column drag event interfaces
 * Bron: taskboard.d.ts:135069-135284
 */

interface ColumnDragEventBase {
    source: TaskBoard;
    columnRecord: ColumnModel;
}

// beforeColumnDrag - return false om te voorkomen
type BeforeColumnDragEvent = ColumnDragEventBase;
type BeforeColumnDragHandler = (event: BeforeColumnDragEvent) =>
    Promise<boolean> | boolean | void;

// columnDragStart
type ColumnDragStartEvent = ColumnDragEventBase;

// columnDrag - return false voor invalid position
interface ColumnDragMoveEvent extends ColumnDragEventBase {
    beforeColumn: ColumnModel | null;  // null = drop at end
}
type ColumnDragHandler = (event: ColumnDragMoveEvent) => boolean | void;

// beforeColumnDrop - async supported
interface BeforeColumnDropEvent extends ColumnDragEventBase {
    beforeColumn: ColumnModel | null;
}
type BeforeColumnDropHandler = (event: BeforeColumnDropEvent) =>
    Promise<boolean> | boolean | void;

// columnDrop
interface ColumnDropEvent extends ColumnDragEventBase {
    beforeColumn: ColumnModel | null;
    targetSwimlane: SwimlaneModel;
}
type ColumnDropHandler = (event: ColumnDropEvent) => void;

// columnDragAbort
type ColumnDragAbortEvent = ColumnDragEventBase;

// columnDragEnd
type ColumnDragEndEvent = ColumnDragEventBase;
```

---

## 7. Swimlane Drag

> **Bron**: `taskboard.d.ts:129354-129456`

### SwimlaneDrag Config

```typescript
/**
 * Configuration for SwimlaneDrag feature
 */
type SwimlaneDragConfig = {
    type?: 'swimlaneDrag' | 'swimlanedrag';

    disabled?: boolean | 'inert';
    bubbleEvents?: object;
    listeners?: SwimlaneDragListeners;
};
```

### Configuratie & Handlers

```javascript
const taskBoard = new TaskBoard({
    features: {
        swimlaneDrag: true
    },

    swimlanes: [
        { id: 'critical', text: 'Critical', color: 'red' },
        { id: 'high', text: 'High Priority', color: 'orange' },
        { id: 'normal', text: 'Normal', color: 'blue' },
        { id: 'low', text: 'Low Priority', color: 'gray' }
    ],

    swimlaneField: 'priority',

    listeners: {
        // Prevent dragging certain swimlanes
        beforeSwimlaneDrag({ swimlaneRecord }) {
            // Critical swimlane moet bovenaan blijven
            if (swimlaneRecord.id === 'critical') {
                Toast.show({
                    html: 'Critical swimlane cannot be moved',
                    type: 'warning'
                });
                return false;
            }
            return true;
        },

        // Validate position during drag
        swimlaneDrag({ swimlaneRecord, beforeSwimlane }) {
            // Prevent dropping above critical
            if (beforeSwimlane?.id === 'critical') {
                return false;
            }
            return true;
        },

        // Confirmation
        async beforeSwimlaneDrop({ swimlaneRecord, beforeSwimlane }) {
            const position = beforeSwimlane
                ? `before "${beforeSwimlane.text}"`
                : 'at the end';

            const result = await MessageDialog.confirm({
                title: 'Reorder Swimlanes',
                message: `Move "${swimlaneRecord.text}" ${position}?`
            });

            return result === MessageDialog.okButton;
        },

        // Success
        swimlaneDrop({ swimlaneRecord, beforeSwimlane }) {
            Toast.show(`Swimlane "${swimlaneRecord.text}" moved`);

            // Persist order
            saveSwimlaneOrder(taskBoard.swimlanes.map(s => s.id));
        },

        swimlaneDragAbort({ swimlaneRecord }) {
            console.log('Swimlane drag cancelled');
        },

        swimlaneDragEnd({ swimlaneRecord }) {
            console.log('Swimlane drag ended');
        }
    }
});
```

---

## 8. Externe Drag Integratie

### Drag van Externe Bron naar TaskBoard

```javascript
// HTML voor externe items
// <ul id="external-items">
//   <li draggable="true" data-name="New Feature" data-type="feature">New Feature</li>
//   <li draggable="true" data-name="Bug Fix" data-type="bug">Bug Fix</li>
// </ul>

const externalList = document.getElementById('external-items');

// Setup drag from external source
externalList.addEventListener('dragstart', (e) => {
    const item = e.target.closest('li');
    if (!item) return;

    e.dataTransfer.setData('application/json', JSON.stringify({
        name: item.dataset.name,
        type: item.dataset.type,
        description: item.dataset.description || ''
    }));

    // Visual feedback
    e.dataTransfer.effectAllowed = 'copy';
    item.classList.add('dragging');
});

externalList.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
});

// TaskBoard drop handling
const taskBoard = new TaskBoard({
    // Native drop events
    listeners: {
        // Enable drop
        dragover(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        },

        // Handle drop
        drop(event) {
            event.preventDefault();

            const data = event.dataTransfer.getData('application/json');
            if (!data) return;

            try {
                const taskData = JSON.parse(data);

                // Bepaal target column
                const columnEl = event.target.closest('.b-taskboard-column');
                const columnId = columnEl?.dataset.columnId ||
                                 columnEl?.querySelector('[data-column]')?.dataset.column;

                // Bepaal target swimlane
                const swimlaneEl = event.target.closest('.b-taskboard-swimlane');
                const swimlaneId = swimlaneEl?.dataset.swimlaneId;

                if (columnId) {
                    // Voeg task toe
                    const newTask = taskBoard.project.taskStore.add({
                        name: taskData.name,
                        description: taskData.description,
                        taskType: taskData.type,
                        status: columnId,
                        priority: swimlaneId || 'normal'
                    })[0];

                    Toast.show({
                        html: `Created task "${newTask.name}" in ${columnId}`
                    });

                    // Scroll naar nieuwe task
                    taskBoard.scrollToTask(newTask);
                }
            } catch (e) {
                console.error('Failed to parse dropped data:', e);
            }
        }
    }
});
```

### Drag van TaskBoard naar Externe Target

```javascript
const taskBoard = new TaskBoard({
    listeners: {
        taskDragStart({ taskRecords, domEvent }) {
            // Set data for external receivers
            if (domEvent.dataTransfer) {
                const data = taskRecords.map(t => ({
                    id: t.id,
                    name: t.name,
                    status: t.status,
                    priority: t.prio,
                    data: t.data
                }));

                domEvent.dataTransfer.setData(
                    'application/json',
                    JSON.stringify(data)
                );

                domEvent.dataTransfer.setData(
                    'text/plain',
                    taskRecords.map(t => t.name).join(', ')
                );

                domEvent.dataTransfer.effectAllowed = 'copyMove';
            }
        }
    }
});

// External drop zone
const dropZone = document.getElementById('external-drop-zone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const data = e.dataTransfer.getData('application/json');
    if (data) {
        const tasks = JSON.parse(data);
        handleExternalDrop(tasks);
    }
});
```

### Cross-Component Drag (TaskBoard ↔ Grid)

```javascript
// Grid met draggable rows
const grid = new Grid({
    features: {
        rowReorder: true
    },

    columns: [
        { field: 'name', text: 'Task Name' },
        { field: 'status', text: 'Status' }
    ],

    listeners: {
        rowDragStart({ records, event }) {
            event.dataTransfer.setData('application/grid-rows',
                JSON.stringify(records.map(r => r.data))
            );
        }
    }
});

// TaskBoard accepts grid rows
const taskBoard = new TaskBoard({
    listeners: {
        dragover(event) {
            if (event.dataTransfer.types.includes('application/grid-rows')) {
                event.preventDefault();
            }
        },

        drop(event) {
            const gridData = event.dataTransfer.getData('application/grid-rows');
            if (gridData) {
                const rows = JSON.parse(gridData);

                // Find target column
                const columnEl = event.target.closest('.b-taskboard-column');
                const columnId = columnEl?.dataset.columnId;

                if (columnId) {
                    rows.forEach(row => {
                        taskBoard.project.taskStore.add({
                            ...row,
                            status: columnId
                        });
                    });
                }
            }
        }
    }
});
```

---

## 9. Programmatisch Verplaatsen

### Basis Task Movement

```javascript
// Task verplaatsen naar andere column
const task = taskBoard.project.taskStore.getById(1);
task.status = 'done';  // columnField waarde

// Task verplaatsen naar andere swimlane
task.prio = 'high';    // swimlaneField waarde

// Meerdere velden tegelijk
task.set({
    status: 'done',
    prio: 'normal'
});
```

### Batch Updates

```javascript
// Suspend auto-commit voor performance
taskBoard.project.taskStore.suspendAutoCommit();

tasks.forEach(task => {
    task.status = 'done';
});

// Resume en commit alle wijzigingen
taskBoard.project.taskStore.resumeAutoCommit();

// Of met project transaction
taskBoard.project.commitAsync().then(() => {
    console.log('All changes committed');
});
```

### Animated Movement

```javascript
// Scroll naar task en dan verplaatsen
await taskBoard.scrollToTask(task);
task.status = 'done';

// Of met delay voor visuele feedback
taskBoard.scrollToTask(task).then(() => {
    setTimeout(() => {
        task.status = 'done';
    }, 300);
});
```

### Movement met Validatie

```javascript
async function moveTask(task, targetColumn, targetSwimlane) {
    // Validate
    const canMove = await validateTaskMove({
        taskId: task.id,
        fromColumn: task.status,
        toColumn: targetColumn,
        fromSwimlane: task.prio,
        toSwimlane: targetSwimlane
    });

    if (!canMove.allowed) {
        Toast.show({
            html: canMove.reason,
            type: 'error'
        });
        return false;
    }

    // Move
    task.set({
        status: targetColumn,
        prio: targetSwimlane
    });

    // Notify
    Toast.show({
        html: `Moved "${task.name}" to ${targetColumn}`
    });

    return true;
}
```

### Column Reordering Programmatisch

```javascript
// Verplaats column
const column = taskBoard.columns.getById('review');
const beforeColumn = taskBoard.columns.getById('done');

// Insert before
taskBoard.columns.move(column, beforeColumn);

// Of via index
taskBoard.columns.move(column, 2);  // Move naar positie 2

// Nieuwe volgorde
const newOrder = ['backlog', 'doing', 'review', 'todo', 'done'];
newOrder.forEach((id, index) => {
    const col = taskBoard.columns.getById(id);
    taskBoard.columns.move(col, index);
});
```

---

## 10. Undo/Redo Integratie

### STM met Drag Operations

```javascript
import { TaskBoard, Undo } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    features: {
        taskDrag: true
    },

    // STM voor undo/redo
    project: {
        stm: {
            autoRecord: true
        }
    },

    tbar: [
        {
            type: 'button',
            icon: 'b-fa-undo',
            ref: 'undoBtn',
            tooltip: 'Undo',
            disabled: true,
            onClick: () => taskBoard.project.stm.undo()
        },
        {
            type: 'button',
            icon: 'b-fa-redo',
            ref: 'redoBtn',
            tooltip: 'Redo',
            disabled: true,
            onClick: () => taskBoard.project.stm.redo()
        }
    ],

    listeners: {
        // Update button states
        stmHasUndo({ hasUndo }) {
            taskBoard.widgetMap.undoBtn.disabled = !hasUndo;
        },

        stmHasRedo({ hasRedo }) {
            taskBoard.widgetMap.redoBtn.disabled = !hasRedo;
        }
    }
});
```

### Custom Transaction Titles

```javascript
const taskBoard = new TaskBoard({
    project: {
        stm: {
            autoRecord: true
        }
    },

    listeners: {
        // Start transaction met titel
        beforeTaskDrag({ taskRecords }) {
            const names = taskRecords.map(t => t.name).join(', ');
            taskBoard.project.stm.startTransaction(`Move ${names}`);
        },

        // Commit of reject
        taskDrop() {
            taskBoard.project.stm.stopTransaction();
        },

        taskDragAbort() {
            taskBoard.project.stm.rejectTransaction();
        }
    }
});
```

---

## 11. Touch & Mobile Support

### Touch Configuration

```javascript
const taskBoard = new TaskBoard({
    features: {
        taskDrag: {
            // Langere delay voor touch om scroll te onderscheiden van drag
            dragTouchStartDelay: 500  // 500ms hold before drag
        },
        taskDragSelect: {
            // Hogere threshold voor touch
            dragThreshold: 10
        }
    }
});
```

### Responsive Drag Behavior

```javascript
const isTouchDevice = 'ontouchstart' in window;

const taskBoard = new TaskBoard({
    features: {
        taskDrag: {
            dragTouchStartDelay: isTouchDevice ? 500 : 0
        }
    },

    listeners: {
        beforeTaskDrag({ domEvent }) {
            // Extra validatie voor touch
            if (domEvent.type === 'touchstart') {
                // Alleen drag als precies op card
                if (!domEvent.target.closest('.b-taskboard-card')) {
                    return false;
                }
            }
        }
    }
});

// CSS voor touch feedback
// .b-taskboard-card:active {
//     transform: scale(0.98);
//     transition: transform 0.1s ease;
// }
```

---

## 12. Performance Optimizations

### Large Dataset Drag

```javascript
const taskBoard = new TaskBoard({
    // Enable virtualization for large datasets
    virtualize: true,

    features: {
        taskDrag: {
            // Disable store reordering for better performance
            reorderTaskRecords: false
        }
    },

    listeners: {
        // Simplify proxy during drag for performance
        taskDragStart({ taskRecords }) {
            if (taskRecords.length > 10) {
                // Show simplified drag proxy for many cards
                showSimpleDragProxy(taskRecords.length);
            }
        }
    }
});
```

### Debounced Validation

```javascript
import { debounce } from 'lodash';

// Debounce expensive validations
const debouncedValidation = debounce(async (taskRecords, targetColumn) => {
    return await serverValidation(taskRecords, targetColumn);
}, 100);

listeners: {
    async taskDrag({ taskRecords, targetColumn }) {
        // Quick local validation
        if (!targetColumn) return false;

        // Debounced server validation
        const result = await debouncedValidation(taskRecords, targetColumn);
        return result;
    }
}
```

---

## 13. Complete Implementatie Voorbeeld

### Kanban Board met Alle Features

```javascript
import {
    TaskBoard,
    TaskModel,
    StringHelper,
    MessageDialog,
    Toast
} from '@bryntum/taskboard';

// WIP limits per column
const WIP_LIMITS = {
    todo: null,
    doing: 5,
    review: 3,
    done: null
};

// Allowed transitions
const TRANSITIONS = {
    backlog: ['todo'],
    todo: ['doing', 'backlog'],
    doing: ['review', 'todo'],
    review: ['done', 'doing'],
    done: ['review']
};

// Custom task model
class KanbanTask extends TaskModel {
    static fields = [
        { name: 'locked', type: 'boolean', defaultValue: false },
        { name: 'assignee', type: 'string' },
        { name: 'dueDate', type: 'date' }
    ];
}

const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Animations
    useDomTransition: true,

    // Custom task model
    project: {
        taskModelClass: KanbanTask,
        stm: { autoRecord: true }
    },

    // Features
    features: {
        taskDrag: {
            dragTouchStartDelay: 300,
            reorderTaskRecords: false
        },
        taskDragSelect: {
            dragThreshold: 5
        },
        columnDrag: true,
        columnResize: true,
        taskEdit: true
    },

    // Columns
    columns: [
        { id: 'backlog', text: 'Backlog', color: 'gray' },
        { id: 'todo', text: 'Todo', color: 'purple' },
        { id: 'doing', text: 'Doing (max 5)', color: 'orange' },
        { id: 'review', text: 'Review (max 3)', color: 'blue' },
        { id: 'done', text: 'Done', color: 'green' }
    ],
    columnField: 'status',

    // Swimlanes
    swimlanes: [
        { id: 'critical', text: '🔥 Critical', color: 'red' },
        { id: 'high', text: 'High', color: 'orange' },
        { id: 'normal', text: 'Normal', color: 'blue' },
        { id: 'low', text: 'Low', color: 'gray' }
    ],
    swimlaneField: 'priority',

    // WIP indicator in header
    htmlEncodeHeaderText: false,
    columnTitleRenderer({ columnRecord }) {
        const count = columnRecord.tasks.length;
        const limit = WIP_LIMITS[columnRecord.id];

        if (!limit) {
            return `${columnRecord.text} (${count})`;
        }

        const pct = (count / limit) * 100;
        let color = '#4caf50';  // green
        if (pct >= 100) color = '#f44336';  // red
        else if (pct >= 80) color = '#ff9800';  // orange

        return `${columnRecord.text} <span style="color:${color}">(${count}/${limit})</span>`;
    },

    // Toolbar
    tbar: [
        {
            type: 'button',
            icon: 'b-fa-undo',
            ref: 'undoBtn',
            disabled: true,
            onClick: () => taskBoard.project.stm.undo()
        },
        {
            type: 'button',
            icon: 'b-fa-redo',
            ref: 'redoBtn',
            disabled: true,
            onClick: () => taskBoard.project.stm.redo()
        },
        '->',
        {
            type: 'button',
            text: 'Move Selected to Done',
            ref: 'moveToDoneBtn',
            disabled: true,
            onClick: () => moveSelectedTasks('done')
        }
    ],

    // Event handlers
    listeners: {
        // STM state
        stmHasUndo: ({ hasUndo }) => {
            taskBoard.widgetMap.undoBtn.disabled = !hasUndo;
        },
        stmHasRedo: ({ hasRedo }) => {
            taskBoard.widgetMap.redoBtn.disabled = !hasRedo;
        },

        // Selection
        selectionChange({ selection }) {
            taskBoard.widgetMap.moveToDoneBtn.disabled = selection.length === 0;
        },

        // === TASK DRAG ===
        beforeTaskDrag({ taskRecords }) {
            // Check locked
            if (taskRecords.some(t => t.locked)) {
                Toast.show({ html: 'Cannot move locked tasks', type: 'warning' });
                return false;
            }

            // Check done tasks
            if (taskRecords.some(t => t.status === 'done')) {
                Toast.show({ html: 'Cannot drag completed tasks', type: 'warning' });
                return false;
            }

            return true;
        },

        taskDrag({ taskRecords, targetColumn }) {
            if (!targetColumn) return false;

            // Transition validation
            for (const task of taskRecords) {
                const allowed = TRANSITIONS[task.status] || [];
                if (task.status !== targetColumn.id && !allowed.includes(targetColumn.id)) {
                    return false;
                }
            }

            // WIP limit check
            const limit = WIP_LIMITS[targetColumn.id];
            if (limit) {
                const current = targetColumn.tasks.length;
                const incoming = taskRecords.filter(t => t.status !== targetColumn.id).length;
                if (current + incoming > limit) {
                    return false;
                }
            }

            return true;
        },

        async beforeTaskDrop({ taskRecords, targetColumn }) {
            // Skip confirmation for same-column reorder
            if (taskRecords.every(t => t.status === targetColumn.id)) {
                return true;
            }

            const result = await MessageDialog.confirm({
                title: 'Move Tasks',
                message: `Move ${taskRecords.length} task(s) to "${targetColumn.text}"?`
            });

            return result === MessageDialog.okButton;
        },

        taskDrop({ taskRecords, targetColumn }) {
            Toast.show({
                html: `Moved ${taskRecords.length} task(s) to ${targetColumn.text}`
            });
        },

        // === COLUMN DRAG ===
        beforeColumnDrag({ columnRecord }) {
            // Done moet laatste blijven
            return columnRecord.id !== 'done';
        },

        columnDrag({ beforeColumn }) {
            // Niet na done droppen
            return beforeColumn !== null;
        }
    }
});

// Helper function
function moveSelectedTasks(targetColumnId) {
    const selected = taskBoard.selectedTasks;

    taskBoard.project.taskStore.suspendAutoCommit();
    selected.forEach(t => { t.status = targetColumnId; });
    taskBoard.project.taskStore.resumeAutoCommit();

    taskBoard.deselectAll();
    Toast.show({ html: `Moved ${selected.length} task(s) to ${targetColumnId}` });
}
```

---

## 14. Debug & Troubleshooting

### Event Logging

```javascript
function enableDragDebugMode() {
    const events = [
        'beforeTaskDrag', 'taskDragStart', 'taskDrag',
        'beforeTaskDrop', 'taskDrop', 'taskDragAbort', 'taskDragEnd',
        'beforeColumnDrag', 'columnDragStart', 'columnDrag',
        'beforeColumnDrop', 'columnDrop', 'columnDragAbort', 'columnDragEnd'
    ];

    events.forEach(eventName => {
        taskBoard.on(eventName, (event) => {
            console.log(`[${new Date().toISOString()}] ${eventName}:`, {
                type: event.type,
                taskRecords: event.taskRecords?.map(t => t.name),
                columnRecord: event.columnRecord?.text,
                targetColumn: event.targetColumn?.text,
                targetSwimlane: event.targetSwimlane?.text
            });
        });
    });
}
```

### Common Issues

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Drag start niet | `beforeTaskDrag` returns false | Check validation logic |
| Drop werkt niet | `taskDrag` returns false | Check target validation |
| Geen animatie | `useDomTransition` false | Enable `useDomTransition: true` |
| Touch issues | Korte `dragTouchStartDelay` | Verhoog naar 300-500ms |
| Performance | Grote dataset | Enable `virtualize: true` |
| Undo werkt niet | STM niet geconfigureerd | Enable `stm: { autoRecord: true }` |

---

## Referenties

| Item | Locatie |
|------|---------|
| TaskDrag Feature | `taskboard.d.ts:129786-129939` |
| TaskDragConfig | `taskboard.d.ts:129787-129900` |
| TaskDragSelect | `taskboard.d.ts:129941-130167` |
| TaskDragSelectConfig | `taskboard.d.ts:130025-130167` |
| ColumnDrag | `taskboard.d.ts:126968-127100` |
| ColumnDragConfig | `taskboard.d.ts:126968-127070` |
| SwimlaneDrag | `taskboard.d.ts:129354-129456` |
| SwimlaneDragConfig | `taskboard.d.ts:129354-129400` |
| Task Drag Events | `taskboard.d.ts:135147-135693` |
| Column Drag Events | `taskboard.d.ts:135069-135284` |
| useDomTransition | `taskboard.d.ts:137371-137376` |
| Task Drag Example | `examples/task-drag/app.module.js` |
| Column Drag Example | `examples/column-drag/app.module.js` |

---

*Laatst bijgewerkt: December 2024*
