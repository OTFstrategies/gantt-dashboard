# Gantt Implementation: Constraint Resolution

> **Constraint Resolution** voor het oplossen van scheduling conflicten en constraint violations.

---

## Overzicht

Bryntum Gantt biedt automatische en handmatige constraint resolution voor scheduling conflicten.

```
+--------------------------------------------------------------------------+
| GANTT                                                                     |
+--------------------------------------------------------------------------+
|  Name              | Start       | Constraint     |    Timeline          |
+--------------------------------------------------------------------------+
|  Task A            | Jan 15      | Start No Later | ████████             |
|  Task B            | Jan 18      | ⚠️ Conflict!   |    ████████████      |
|  Task C            | Jan 25      | Must Start On  |           ███████    |
+--------------------------------------------------------------------------+
|                                                                          |
|  +-- Constraint Conflict Detected --+                                     |
|  |                                   |                                    |
|  |  Task B has a conflict:          |                                    |
|  |  Cannot start before Jan 18      |                                    |
|  |  due to dependency on Task A     |                                    |
|  |                                   |                                    |
|  |  [Cancel] [Remove Constraint]    |                                    |
|  |            [Reschedule Task]      |                                    |
|  +-----------------------------------+                                    |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Constraint Setup

### 1.1 Enable Constraint Resolution

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,

    // Enable constraint resolution popup
    enableConstraintResolutionPopup: true,

    transport: {
        load: { url: 'data/tasks.json' }
    }
});

const gantt = new Gantt({
    appendTo: 'container',
    project,

    columns: [
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'constrainttype', width: 150 },
        { type: 'constraintdate', width: 120 }
    ]
});
```

---

## 2. Constraint Types

### 2.1 Available Constraints

```javascript
const projectData = {
    tasks: {
        rows: [
            {
                id: 1,
                name: 'Start No Earlier Than',
                startDate: '2024-01-15',
                duration: 5,
                constraintType: 'startnoearlierthan',
                constraintDate: '2024-01-15'
            },
            {
                id: 2,
                name: 'Start No Later Than',
                startDate: '2024-01-20',
                duration: 3,
                constraintType: 'startnolaterthan',
                constraintDate: '2024-01-22'
            },
            {
                id: 3,
                name: 'Must Start On',
                startDate: '2024-01-25',
                duration: 4,
                constraintType: 'muststarton',
                constraintDate: '2024-01-25'
            },
            {
                id: 4,
                name: 'Finish No Earlier Than',
                startDate: '2024-01-20',
                duration: 5,
                constraintType: 'finishnoearlierthan',
                constraintDate: '2024-01-27'
            },
            {
                id: 5,
                name: 'Must Finish On',
                startDate: '2024-01-22',
                duration: 5,
                constraintType: 'mustfinishon',
                constraintDate: '2024-01-28'
            }
        ]
    }
};

// Constraint types:
// - startnoearlierthan: Start No Earlier Than
// - startnolaterthan: Start No Later Than
// - muststarton: Must Start On
// - finishnoearlierthan: Finish No Earlier Than
// - finishnolaterthan: Finish No Later Than
// - mustfinishon: Must Finish On
// - assoonaspossible: As Soon As Possible (default)
// - aslateaspossible: As Late As Possible
```

---

## 3. Conflict Resolution

### 3.1 Custom Resolution Handler

```javascript
const project = new ProjectModel({
    autoSetConstraints: true,

    // Custom conflict resolution
    onSchedulingConflict({ schedulingIssue, continueWithResolutionResult }) {
        const { type, source } = schedulingIssue;

        console.log('Conflict detected:', type, source.name);

        // Auto-resolve: remove constraint
        if (type === 'constraintConflict') {
            continueWithResolutionResult({
                resolution: 'remove-constraint'
            });
        }

        // Or show custom dialog
        showConflictDialog(schedulingIssue, continueWithResolutionResult);
    }
});

function showConflictDialog(issue, continueWith) {
    const dialog = new MessageDialog({
        title: 'Scheduling Conflict',
        message: `Task "${issue.source.name}" has a constraint conflict`,
        buttons: [
            {
                text: 'Remove Constraint',
                onClick() {
                    continueWith({ resolution: 'remove-constraint' });
                    dialog.close();
                }
            },
            {
                text: 'Keep & Adjust',
                onClick() {
                    continueWith({ resolution: 'adjust-task' });
                    dialog.close();
                }
            },
            {
                text: 'Cancel',
                onClick() {
                    continueWith({ resolution: 'cancel' });
                    dialog.close();
                }
            }
        ]
    });
    dialog.show();
}
```

### 3.2 Built-in Resolution Popup

```javascript
const project = new ProjectModel({
    autoSetConstraints: true,

    // Enable built-in popup
    enableConstraintResolutionPopup: true,

    // Customize popup
    constraintResolutionPopup: {
        title: 'Resolve Conflict',
        width: 400,
        // Available resolutions
        resolutions: [
            'remove-constraint',
            'adjust-task',
            'cancel'
        ]
    }
});
```

---

## 4. Programmatic Constraint Management

### 4.1 Set and Remove Constraints

```javascript
// Get task
const task = gantt.taskStore.getById(1);

// Set constraint
task.constraintType = 'muststarton';
task.constraintDate = new Date('2024-02-01');

// Remove constraint
task.constraintType = 'assoonaspossible';
task.constraintDate = null;

// Check for conflicts
async function checkConstraints() {
    const issues = await project.getSchedulingIssues();

    issues.forEach(issue => {
        console.log(`${issue.type}: ${issue.source.name}`);

        if (issue.type === 'constraintConflict') {
            console.log('Suggested resolution:', issue.resolutions);
        }
    });
}
```

### 4.2 Validate Before Changes

```javascript
// Before moving task
gantt.on({
    beforeTaskDrag({ taskRecord, startDate }) {
        // Check if move would violate constraint
        if (taskRecord.constraintType === 'startnoearlierthan') {
            if (startDate < taskRecord.constraintDate) {
                Toast.show({
                    html: 'Cannot move before constraint date',
                    timeout: 3000
                });
                return false;
            }
        }
        return true;
    }
});
```

---

## 5. React Integration

```jsx
import { BryntumGantt, BryntumProjectModel } from '@bryntum/gantt-react';
import { useRef, useMemo, useCallback, useState } from 'react';

function ConstraintGantt() {
    const ganttRef = useRef(null);
    const [conflicts, setConflicts] = useState([]);

    const handleConflict = useCallback((event) => {
        const { schedulingIssue, continueWithResolutionResult } = event;

        // Add to conflict list
        setConflicts(prev => [...prev, {
            id: Date.now(),
            task: schedulingIssue.source.name,
            type: schedulingIssue.type
        }]);

        // Show resolution options
        return false;  // Prevent default popup
    }, []);

    const resolveConflict = useCallback((conflictId, resolution) => {
        const gantt = ganttRef.current?.instance;

        // Apply resolution
        switch (resolution) {
            case 'remove':
                // Remove constraint from task
                const task = gantt.taskStore.getById(conflictId);
                task.constraintType = 'assoonaspossible';
                task.constraintDate = null;
                break;
            case 'reschedule':
                // Trigger reschedule
                gantt.project.propagate();
                break;
        }

        // Remove from list
        setConflicts(prev => prev.filter(c => c.id !== conflictId));
    }, []);

    const projectConfig = useMemo(() => ({
        autoSetConstraints: true,
        enableConstraintResolutionPopup: false,

        listeners: {
            schedulingConflict: handleConflict
        }
    }), [handleConflict]);

    const ganttConfig = useMemo(() => ({
        columns: [
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'constrainttype', width: 150 },
            { type: 'constraintdate', width: 120 }
        ],

        features: {
            taskEdit: {
                items: {
                    constraintTab: {
                        title: 'Constraints',
                        items: {
                            constraintType: true,
                            constraintDate: true
                        }
                    }
                }
            }
        }
    }), []);

    return (
        <div className="constraint-gantt">
            {conflicts.length > 0 && (
                <div className="conflict-panel">
                    <h3>Scheduling Conflicts</h3>
                    {conflicts.map(conflict => (
                        <div key={conflict.id} className="conflict-item">
                            <span>{conflict.task}: {conflict.type}</span>
                            <div className="actions">
                                <button onClick={() => resolveConflict(conflict.id, 'remove')}>
                                    Remove Constraint
                                </button>
                                <button onClick={() => resolveConflict(conflict.id, 'reschedule')}>
                                    Reschedule
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <BryntumGantt
                ref={ganttRef}
                project={projectConfig}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 6. Styling

```css
/* Constraint indicator */
.b-gantt-task.b-has-constraint .b-gantt-task-bar::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 8px solid #ff9800;
}

/* Conflict indicator */
.b-gantt-task.b-has-conflict .b-gantt-task-bar {
    border: 2px solid #f44336 !important;
    animation: pulse-conflict 1s infinite;
}

@keyframes pulse-conflict {
    0%, 100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(244, 67, 54, 0); }
}

/* Constraint column */
.b-constrainttype-column .b-grid-cell {
    font-size: 12px;
}

/* Conflict panel */
.conflict-panel {
    padding: 16px;
    background: #ffebee;
    border-bottom: 1px solid #ffcdd2;
}

.conflict-panel h3 {
    margin: 0 0 12px;
    color: #c62828;
}

.conflict-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 8px;
    background: white;
    border: 1px solid #ffcdd2;
    border-radius: 4px;
}

.conflict-item .actions {
    display: flex;
    gap: 8px;
}

.conflict-item button {
    padding: 4px 12px;
    border: 1px solid #e0e0e0;
    background: white;
    cursor: pointer;
    border-radius: 4px;
    font-size: 12px;
}

.conflict-item button:hover {
    background: #f5f5f5;
}

/* Resolution popup */
.b-constraint-resolution-popup {
    width: 400px;
}

.b-constraint-resolution-popup .b-resolution-option {
    padding: 12px;
    margin: 8px 0;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
}

.b-constraint-resolution-popup .b-resolution-option:hover {
    background: #e3f2fd;
    border-color: #2196F3;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Popup verschijnt niet | Popup disabled | Enable enableConstraintResolutionPopup |
| Constraint ignored | autoSetConstraints false | Enable autoSetConstraints |
| Conflict not detected | Manual scheduling | Disable manuallyScheduled |
| Resolution werkt niet | Handler returns incorrectly | Check continueWith call |

---

## API Reference

### Constraint Types

| Type | Description |
|------|-------------|
| `startnoearlierthan` | Start No Earlier Than date |
| `startnolaterthan` | Start No Later Than date |
| `muststarton` | Must Start On exact date |
| `finishnoearlierthan` | Finish No Earlier Than date |
| `finishnolaterthan` | Finish No Later Than date |
| `mustfinishon` | Must Finish On exact date |
| `assoonaspossible` | As Soon As Possible |
| `aslateaspossible` | As Late As Possible |

### ProjectModel Config

| Property | Type | Description |
|----------|------|-------------|
| `autoSetConstraints` | Boolean | Auto-set constraints |
| `enableConstraintResolutionPopup` | Boolean | Show resolution popup |
| `onSchedulingConflict` | Function | Conflict handler |

### Resolution Options

| Resolution | Description |
|------------|-------------|
| `remove-constraint` | Remove the constraint |
| `adjust-task` | Adjust task dates |
| `cancel` | Cancel the operation |

---

## Bronnen

- **ProjectModel**: `Gantt.model.ProjectModel`
- **TaskModel**: `Gantt.model.TaskModel`
- **Constraint Column**: `Gantt.column.ConstraintTypeColumn`

---

*Priority 2: Medium Priority Features*
