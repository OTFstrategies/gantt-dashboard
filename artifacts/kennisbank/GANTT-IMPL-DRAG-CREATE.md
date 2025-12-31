# Gantt Implementation: Drag Create

> **Drag Create** voor het aanmaken van taken door te slepen op de timeline.

---

## Overzicht

Bryntum Gantt ondersteunt het creëren van taken door direct te slepen op de timeline.

```
+--------------------------------------------------------------------------+
| GANTT                                                                     |
+--------------------------------------------------------------------------+
|  Name              | Start       |        Timeline                       |
+--------------------------------------------------------------------------+
|  Project           | Jan 15      |                                       |
|    Task A          | Jan 15      |  ████████████                         |
|    Task B          | Jan 20      |       ████████████                    |
|    [New Task]      |             |            ░░░░░░░░░░░░░░░░░░░░░░░    |
|                    |             |            ← Drag to create →          |
+--------------------------------------------------------------------------+
|                                                                          |
|  DRAG CREATE FEATURES:                                                    |
|    - Click and drag on empty timeline to create task                     |
|    - Auto-calculate duration based on drag length                        |
|    - Optional task editor popup after creation                           |
|    - Snap to grid/time units                                             |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Drag Create Setup

### 1.1 Enable Drag Create Feature

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    transport: {
        load: { url: 'data/tasks.json' }
    }
});

const gantt = new Gantt({
    appendTo: 'container',
    project,

    features: {
        taskDragCreate: true  // Enable drag to create
    },

    columns: [
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'duration' }
    ]
});
```

---

## 2. Advanced Configuration

### 2.1 Drag Create Options

```javascript
features: {
    taskDragCreate: {
        // Show editor after creating
        showEditor: true,

        // Minimum duration for created task
        minDuration: 1,
        minDurationUnit: 'day',

        // Default task values
        newTaskDefaults: {
            name: 'New Task',
            percentDone: 0,
            manuallyScheduled: false
        },

        // Snap to time units
        snapToUnits: true,

        // Validation
        validatorFn({ startDate, endDate, record }) {
            // Prevent creating on weekends
            const start = new Date(startDate);
            const day = start.getDay();
            if (day === 0 || day === 6) {
                return {
                    valid: false,
                    message: 'Cannot create tasks on weekends'
                };
            }
            return true;
        }
    }
}
```

### 2.2 Listen to Create Events

```javascript
gantt.on({
    beforeTaskDragCreate({ startDate, endDate, parent }) {
        console.log('Creating task from', startDate, 'to', endDate);
        // Return false to prevent creation
        return true;
    },

    taskDragCreateStart({ date, parent }) {
        console.log('Started drag at', date);
    },

    taskDragCreateEnd({ taskRecord, parent }) {
        console.log('Created task:', taskRecord.name);
    },

    afterTaskDragCreate({ taskRecord }) {
        // After task is fully created
        console.log('Task created with ID:', taskRecord.id);
    }
});
```

---

## 3. Custom Task Creation

### 3.1 Process New Tasks

```javascript
features: {
    taskDragCreate: {
        showEditor: false,  // Don't show editor

        // Process before adding to store
        onTaskCreated({ taskRecord, startDate, endDate }) {
            // Set custom properties
            taskRecord.name = `Task ${taskRecord.id}`;
            taskRecord.percentDone = 0;
            taskRecord.priority = 'Medium';

            // Calculate duration
            const duration = gantt.project.calendar.calculateDurationMs(
                startDate,
                endDate
            );
            taskRecord.duration = duration / (1000 * 60 * 60 * 24);
            taskRecord.durationUnit = 'day';
        }
    }
}

// Alternative: Listen to event
gantt.on({
    afterTaskDragCreate({ taskRecord }) {
        // Show custom dialog
        showCustomTaskDialog(taskRecord);
    }
});

function showCustomTaskDialog(task) {
    const name = prompt('Enter task name:', task.name);
    if (name) {
        task.name = name;
    } else {
        // User cancelled, remove task
        gantt.taskStore.remove(task);
    }
}
```

### 3.2 Create Under Specific Parent

```javascript
features: {
    taskDragCreate: {
        // Determine parent for new task
        getParent({ resource, date }) {
            // Find or create appropriate parent
            const parentTask = gantt.taskStore.find(
                t => t.isParent && t.startDate <= date && t.endDate >= date
            );
            return parentTask || gantt.taskStore.rootNode;
        }
    }
}
```

---

## 4. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useRef, useMemo, useCallback, useState } from 'react';

function DragCreateGantt({ projectData }) {
    const ganttRef = useRef(null);
    const [lastCreatedTask, setLastCreatedTask] = useState(null);

    const handleTaskCreated = useCallback((taskRecord) => {
        setLastCreatedTask({
            id: taskRecord.id,
            name: taskRecord.name,
            startDate: taskRecord.startDate,
            duration: taskRecord.duration
        });
    }, []);

    const ganttConfig = useMemo(() => ({
        features: {
            taskDragCreate: {
                showEditor: true,

                newTaskDefaults: {
                    name: 'New Task',
                    percentDone: 0
                },

                validatorFn({ startDate, endDate }) {
                    const duration = (endDate - startDate) / (1000 * 60 * 60);
                    if (duration < 4) {
                        return {
                            valid: false,
                            message: 'Task must be at least 4 hours'
                        };
                    }
                    return true;
                }
            },

            taskEdit: true
        },

        columns: [
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'enddate' },
            { type: 'duration' }
        ],

        listeners: {
            afterTaskDragCreate({ taskRecord }) {
                handleTaskCreated(taskRecord);
            }
        }
    }), [handleTaskCreated]);

    return (
        <div className="drag-create-gantt">
            <div className="instructions">
                <p>Drag on the timeline to create a new task</p>
                {lastCreatedTask && (
                    <p className="last-created">
                        Last created: {lastCreatedTask.name}
                    </p>
                )}
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

## 5. Drag Create with Milestones

### 5.1 Create Milestones

```javascript
features: {
    taskDragCreate: {
        // Detect milestone creation (single click or very short drag)
        onTaskCreated({ taskRecord, startDate, endDate }) {
            const durationMs = endDate - startDate;
            const threshold = 1000 * 60 * 60 * 4;  // 4 hours

            if (durationMs < threshold) {
                // Create as milestone
                taskRecord.duration = 0;
                taskRecord.milestone = true;
                taskRecord.name = 'New Milestone';
            }
        }
    }
}
```

---

## 6. Styling

```css
/* Drag create proxy */
.b-gantt-task-drag-create-proxy {
    background: rgba(33, 150, 243, 0.3) !important;
    border: 2px dashed #2196F3 !important;
    border-radius: 4px;
}

/* Valid drop */
.b-gantt-task-drag-create-proxy.b-valid {
    background: rgba(76, 175, 80, 0.3) !important;
    border-color: #4CAF50 !important;
}

/* Invalid drop */
.b-gantt-task-drag-create-proxy.b-invalid {
    background: rgba(244, 67, 54, 0.3) !important;
    border-color: #f44336 !important;
}

/* Tooltip during drag */
.b-drag-create-tooltip {
    background: #1976d2;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
}

.b-drag-create-tooltip.b-invalid {
    background: #f44336;
}

/* Instructions */
.instructions {
    padding: 12px 16px;
    background: #e3f2fd;
    border-bottom: 1px solid #bbdefb;
}

.instructions p {
    margin: 0;
    color: #1565c0;
}

.last-created {
    margin-top: 4px !important;
    font-size: 13px;
    color: #666 !important;
}

/* Highlight droppable area on hover */
.b-gantt-task-wrap:hover .b-sch-timeaxis-cell {
    background: rgba(33, 150, 243, 0.05);
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Kan niet slepen | Feature niet enabled | Enable taskDragCreate |
| Taak niet zichtbaar | Parent collapsed | Expand parent task |
| Editor opent niet | showEditor: false | Set showEditor: true |
| Validatie werkt niet | validatorFn returns true | Check return value |

---

## API Reference

### Drag Create Config

| Property | Type | Description |
|----------|------|-------------|
| `showEditor` | Boolean | Show task editor after create |
| `minDuration` | Number | Minimum task duration |
| `minDurationUnit` | String | Duration unit |
| `newTaskDefaults` | Object | Default values for new tasks |
| `snapToUnits` | Boolean | Snap to time units |
| `validatorFn` | Function | Validation function |

### Events

| Event | Description |
|-------|-------------|
| `beforeTaskDragCreate` | Before drag starts |
| `taskDragCreateStart` | Drag started |
| `taskDragCreateEnd` | Drag ended, task created |
| `afterTaskDragCreate` | After task fully created |

### Validator Function Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | Date | Proposed start date |
| `endDate` | Date | Proposed end date |
| `record` | TaskModel | Parent record |
| `context` | Object | Drag context |

---

## Bronnen

- **Feature**: `Gantt.feature.TaskDragCreate`
- **Task Editor**: `Gantt.widget.TaskEditor`

---

*Priority 2: Medium Priority Features*
