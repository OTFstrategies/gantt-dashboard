# Gantt Implementation: Conflict Resolution

> **Conflict Resolution** voor het detecteren en oplossen van scheduling conflicten.

---

## Overzicht

Bryntum Gantt detecteert automatisch scheduling conflicten en biedt oplossingen.

```
+--------------------------------------------------------------------------+
| GANTT       [Add invalid dep] [Add cycle] [Add conflicts] [Invalid cal]  |
+--------------------------------------------------------------------------+
|                                                                          |
|  Task Name          | Start     | Duration |          Timeline          |
+--------------------------------------------------------------------------+
|  Install Apache     | Jan 15    | 3 days   | ████████                   |
|  Configure ports    | Jan 18    | 2 days   |        ████                |
|  Run tests          | Jan 20    | 2 days   |           ████             |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|   +----------------------------------------------------------------+     |
|   |  CONFLICT DETECTED                                     [x]    |     |
|   +----------------------------------------------------------------+     |
|   |                                                                |     |
|   |  Type: Dependency Cycle                                       |     |
|   |  Tasks involved:                                               |     |
|   |    - Configure ports -> Run tests                              |     |
|   |    - Run tests -> Configure ports (NEW)                        |     |
|   |                                                                |     |
|   |  Resolution options:                                           |     |
|   |    [Cancel the change]  [Remove existing dependency]           |     |
|   |                                                                |     |
|   +----------------------------------------------------------------+     |
|                                                                          |
|  CONFLICT TYPES:                                                         |
|    Invalid dependency (self-reference)                                   |
|    Dependency cycle (circular reference)                                 |
|    Constraint conflict (scheduling conflict)                             |
|    Invalid calendar (no working time)                                    |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Conflict Detection Setup

### 1.1 Enable Conflict Indicators

```javascript
import { Gantt } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',

    project: {
        autoSetConstraints: true,
        autoLoad: true,
        loadUrl: '../_datasets/constraints.json'
    },

    features: {
        indicators: {
            items: {
                deadlineDate: false,
                earlyDates: false,
                lateDates: false,
                // Display constraint indicators
                constraintDate: true
            }
        },
        dependencyEdit: true
    },

    eventStyle: 'bordered'
});
```

---

## 2. Trigger Conflicts Programmatically

### 2.1 Invalid Dependency (Self-Reference)

```javascript
tbar: {
    items: {
        addInvalid: {
            text: 'Add invalid dependency',
            icon: 'fa fa-bug',
            onClick() {
                // Add dependency linking task to itself
                // This triggers conflict detection
                gantt.dependencyStore.add({
                    fromTask: 11,
                    toTask: 11
                });
            }
        }
    }
}
```

### 2.2 Dependency Cycle

```javascript
{
    text: 'Add dependency cycle',
    icon: 'fa fa-bug',
    onClick() {
        // Add dependency that creates a cycle
        // Task 15 -> Task 14, but 14 -> 15 already exists
        gantt.dependencyStore.add({
            fromTask: 15,
            toTask: 14
        });
    }
}
```

### 2.3 Multiple Conflicts at Once

```javascript
{
    text: 'Add all conflicts',
    icon: 'fa fa-bug',
    onClick() {
        const task = gantt.taskStore.getById(11);
        const date = new Date(task.startDate);
        date.setDate(date.getDate() + 2);

        // Constraint conflict
        task.startDate = date;

        // Self-reference
        gantt.dependencyStore.add({ fromTask: 11, toTask: 11 });

        // Cycle
        gantt.dependencyStore.add({ fromTask: 15, toTask: 14 });
    }
}
```

### 2.4 Invalid Calendar

```javascript
{
    text: 'Use invalid calendar',
    icon: 'fa fa-bug',
    onClick() {
        // Create calendar with no working time
        const [calendar] = gantt.calendarManagerStore.add({
            name: 'My Calendar',
            // No working intervals defined
            unspecifiedTimeIsWorking: false
        });

        // Assign to task - triggers conflict
        gantt.taskStore.getById(11).calendar = calendar;
    }
}
```

---

## 3. Conflict Resolution

### 3.1 Automatic Conflict Dialog

Bryntum automatically shows a conflict resolution dialog when conflicts are detected. Users can choose:
- Cancel the change
- Remove conflicting dependency
- Apply alternative scheduling

### 3.2 Programmatic Resolution

```javascript
project.on({
    // Listen for scheduling conflicts
    schedulingConflict({ schedulingIssue, continueWithResolutionResult }) {
        // Get conflict details
        console.log('Conflict type:', schedulingIssue.type);
        console.log('Affected tasks:', schedulingIssue.getAffectedTasks());

        // Auto-resolve: cancel the conflicting change
        continueWithResolutionResult(schedulingIssue.getResolutions()[0]);
    }
});
```

---

## 4. Constraint Handling

### 4.1 Constraint Types

```javascript
// Task constraint types
const constraintTypes = [
    'startnoearlierthan',    // Start no earlier than date
    'startnolaterthan',      // Start no later than date
    'finishnoearlierthan',   // Finish no earlier than date
    'finishnolaterthan',     // Finish no later than date
    'muststarton',           // Must start on exact date
    'mustfinishon',          // Must finish on exact date
    'assoonaspossible',      // Schedule ASAP
    'aslateaspossible'       // Schedule ALAP
];

// Apply constraint to task
const task = gantt.taskStore.getById(1);
task.constraintType = 'startnoearlierthan';
task.constraintDate = new Date('2024-02-01');
```

---

## 5. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useRef, useCallback } from 'react';

function GanttWithConflicts({ projectData }) {
    const ganttRef = useRef(null);

    const addInvalidDependency = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            // Self-reference dependency
            gantt.dependencyStore.add({
                fromTask: 11,
                toTask: 11
            });
        }
    }, []);

    const addDependencyCycle = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.dependencyStore.add({
                fromTask: 15,
                toTask: 14
            });
        }
    }, []);

    const addConstraintConflict = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            const task = gantt.taskStore.getById(11);
            const newDate = new Date(task.startDate);
            newDate.setDate(newDate.getDate() + 5);
            task.startDate = newDate;
        }
    }, []);

    const addInvalidCalendar = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            const [calendar] = gantt.calendarManagerStore.add({
                name: 'Empty Calendar',
                unspecifiedTimeIsWorking: false
            });
            gantt.taskStore.getById(11).calendar = calendar;
        }
    }, []);

    const ganttConfig = {
        features: {
            indicators: {
                items: {
                    deadlineDate: false,
                    earlyDates: false,
                    lateDates: false,
                    constraintDate: true
                }
            },
            dependencyEdit: true
        },

        eventStyle: 'bordered',

        columns: [
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'duration' }
        ]
    };

    return (
        <div className="gantt-conflicts-wrapper">
            <div className="toolbar">
                <button onClick={addInvalidDependency}>
                    Add Invalid Dependency
                </button>
                <button onClick={addDependencyCycle}>
                    Add Dependency Cycle
                </button>
                <button onClick={addConstraintConflict}>
                    Add Constraint Conflict
                </button>
                <button onClick={addInvalidCalendar}>
                    Add Invalid Calendar
                </button>
            </div>

            <BryntumGantt
                ref={ganttRef}
                project={projectData}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 6. Styling

```css
/* Conflict dialog */
.b-conflict-popup {
    background: white;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.b-conflict-popup .b-popup-header {
    background: #f44336;
    color: white;
}

/* Conflict icon */
.b-conflict-icon {
    color: #f44336;
}

/* Conflict task bar */
.b-gantt-task.b-conflict .b-gantt-task-bar {
    border: 2px solid #f44336;
    background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 5px,
        rgba(244, 67, 54, 0.1) 5px,
        rgba(244, 67, 54, 0.1) 10px
    );
}

/* Conflict dependency line */
.b-sch-dependency.b-conflict {
    stroke: #f44336;
    stroke-dasharray: 4, 2;
}

/* Constraint indicator */
.b-gantt-task .b-indicator.b-constraint {
    background: #FF9800;
    border-radius: 50%;
}

/* Resolution buttons */
.b-conflict-popup .b-button {
    margin: 4px;
}

.b-conflict-popup .b-button.b-cancel {
    background: #f44336;
    color: white;
}

.b-conflict-popup .b-button.b-resolve {
    background: #4CAF50;
    color: white;
}

/* Toolbar conflict buttons */
.b-invalid-dependency-button,
.b-cyclic-dependency-button,
.b-all-conflicts-button,
.b-invalid-calendar-button {
    background: #FF9800;
    color: white;
}

.b-invalid-dependency-button:hover,
.b-cyclic-dependency-button:hover,
.b-all-conflicts-button:hover,
.b-invalid-calendar-button:hover {
    background: #F57C00;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Conflict niet gedetecteerd | autoSetConstraints: false | Zet autoSetConstraints: true |
| Dialog niet zichtbaar | Feature disabled | Check project configuration |
| Calendar conflict | Geen working time | Definieer working intervals |
| Cycle niet herkend | Dependencies niet geladen | Wacht op project.load() |

---

## API Reference

### Conflict Types

| Type | Description |
|------|-------------|
| `SchedulingConflict` | Generic scheduling conflict |
| `DependencyCycleConflict` | Circular dependency |
| `InvalidDependencyConflict` | Self-reference or invalid |
| `ConstraintConflict` | Date constraint violation |
| `CalendarConflict` | No working time available |

### Conflict Resolution

| Method | Description |
|--------|-------------|
| `getResolutions()` | Get available resolutions |
| `getAffectedTasks()` | Get tasks involved |
| `resolve(resolution)` | Apply resolution |

### Project Events

| Event | Description |
|-------|-------------|
| `schedulingConflict` | Conflict detected |
| `schedulingConflictResolved` | Conflict resolved |

---

## Bronnen

- **Example**: `examples/conflicts/`
- **Conflict Handling**: `Gantt.data.mixin.ProjectCrudManager`
- **Constraints**: `Gantt.model.TaskModel`

---

*Priority 2: Medium Priority Features*
