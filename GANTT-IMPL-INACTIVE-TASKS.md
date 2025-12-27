# Gantt Implementation: Inactive Tasks

> **Inactive Tasks** voor het markeren van taken als inactief.

---

## Overzicht

Bryntum Gantt ondersteunt inactieve taken die niet bijdragen aan scheduling.

```
+--------------------------------------------------------------------------+
| GANTT                                                                     |
+--------------------------------------------------------------------------+
|  Name              | Start date | Inactive |        Timeline            |
+--------------------------------------------------------------------------+
|  Active Task 1     | Jan 15     |    ☐     |  ████████████               |
|  Inactive Task     | Jan 20     |    ☑     |     ░░░░░░░░ (greyed out)   |
|  Active Task 2     | Jan 25     |    ☐     |         ████████████        |
+--------------------------------------------------------------------------+
|                                                                          |
|  INACTIVE TASK BEHAVIOR:                                                 |
|    - Niet opgenomen in critical path berekening                          |
|    - Dependencies worden genegeerd voor scheduling                       |
|    - Visueel onderscheiden (grijs/transparant)                           |
|    - Kan worden getoggeld via Inactive column                            |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Inactive Tasks Setup

### 1.1 Enable Inactive Column

```javascript
import { Gantt } from '@bryntum/gantt';

new Gantt({
    appendTo: 'container',

    project: {
        autoSetConstraints: true,
        autoLoad: true,
        loadUrl: 'data/tasks.json'
    },

    columns: [
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'inactive' }  // Add inactive toggle column
    ]
});
```

---

## 2. Data Configuration

### 2.1 Tasks with Inactive Property

```javascript
const projectData = {
    tasks: {
        rows: [
            {
                id: 1,
                name: 'Active Task',
                startDate: '2024-01-15',
                duration: 5,
                inactive: false
            },
            {
                id: 2,
                name: 'Inactive Task',
                startDate: '2024-01-20',
                duration: 3,
                inactive: true  // Task is inactive
            },
            {
                id: 3,
                name: 'Another Active Task',
                startDate: '2024-01-23',
                duration: 5,
                inactive: false
            }
        ]
    },
    dependencies: {
        rows: [
            { from: 1, to: 2 },  // Dependency to inactive task
            { from: 2, to: 3 }   // Dependency from inactive task
        ]
    }
};
```

---

## 3. Programmatic Control

### 3.1 Toggle Task Inactive State

```javascript
// Get task
const task = gantt.taskStore.getById(2);

// Set inactive
task.inactive = true;

// Toggle inactive
task.inactive = !task.inactive;

// Check if inactive
if (task.inactive) {
    console.log('Task is inactive');
}

// Get all inactive tasks
const inactiveTasks = gantt.taskStore.query(task => task.inactive);
```

### 3.2 Bulk Operations

```javascript
// Make multiple tasks inactive
function deactivateTasks(taskIds) {
    gantt.taskStore.beginBatch();

    taskIds.forEach(id => {
        const task = gantt.taskStore.getById(id);
        if (task) {
            task.inactive = true;
        }
    });

    gantt.taskStore.endBatch();
}

// Activate all tasks
function activateAllTasks() {
    gantt.taskStore.beginBatch();

    gantt.taskStore.forEach(task => {
        task.inactive = false;
    });

    gantt.taskStore.endBatch();
}
```

---

## 4. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useMemo, useRef, useCallback } from 'react';

function GanttWithInactiveTasks({ projectData }) {
    const ganttRef = useRef(null);

    const toggleInactive = useCallback((taskId) => {
        const gantt = ganttRef.current?.instance;
        const task = gantt?.taskStore.getById(taskId);
        if (task) {
            task.inactive = !task.inactive;
        }
    }, []);

    const deactivateSelected = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        const selectedRecords = gantt?.selectedRecords || [];

        gantt?.taskStore.beginBatch();
        selectedRecords.forEach(task => {
            task.inactive = true;
        });
        gantt?.taskStore.endBatch();
    }, []);

    const activateAll = useCallback(() => {
        const gantt = ganttRef.current?.instance;

        gantt?.taskStore.beginBatch();
        gantt?.taskStore.forEach(task => {
            task.inactive = false;
        });
        gantt?.taskStore.endBatch();
    }, []);

    const getInactiveCount = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        return gantt?.taskStore.query(t => t.inactive).length || 0;
    }, []);

    const ganttConfig = useMemo(() => ({
        columns: [
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'duration' },
            {
                type: 'inactive',
                text: 'Inactive',
                width: 80
            }
        ],

        selectionMode: {
            row: true,
            multiSelect: true
        }
    }), []);

    return (
        <div className="gantt-inactive-tasks">
            <div className="toolbar">
                <button onClick={deactivateSelected}>
                    Deactivate Selected
                </button>
                <button onClick={activateAll}>
                    Activate All
                </button>
                <span className="count">
                    Inactive: {getInactiveCount()}
                </span>
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

## 5. Custom Inactive Column

### 5.1 Enhanced Inactive Column

```javascript
columns: [
    { type: 'name', width: 250 },
    {
        type: 'inactive',
        text: 'Status',
        width: 100,
        renderer({ value, record }) {
            const icon = value ? 'fa-pause-circle' : 'fa-play-circle';
            const text = value ? 'Inactive' : 'Active';
            const cls = value ? 'status-inactive' : 'status-active';

            return {
                class: cls,
                children: [
                    { tag: 'i', class: `fa ${icon}` },
                    { text: ` ${text}` }
                ]
            };
        }
    }
]
```

---

## 6. Styling

```css
/* Inactive task bar */
.b-gantt-task.b-inactive .b-gantt-task-bar {
    opacity: 0.5;
    background: #9e9e9e !important;
    filter: grayscale(100%);
}

/* Inactive task text */
.b-gantt-task.b-inactive .b-gantt-task-content {
    color: #666;
    font-style: italic;
}

/* Inactive row in grid */
.b-grid-row.b-inactive {
    background: #f5f5f5;
}

.b-grid-row.b-inactive .b-grid-cell {
    color: #888;
}

/* Status indicators */
.status-active {
    color: #4CAF50;
}

.status-active i {
    color: #4CAF50;
}

.status-inactive {
    color: #9e9e9e;
}

.status-inactive i {
    color: #9e9e9e;
}

/* Inactive checkbox column */
.b-inactive-column .b-checkbox {
    margin: 0 auto;
}

/* Inactive dependency line */
.b-gantt-task.b-inactive ~ .b-sch-dependency-line {
    stroke-dasharray: 4, 4;
    stroke: #ccc;
}

/* Toolbar */
.toolbar {
    display: flex;
    gap: 12px;
    padding: 8px 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.toolbar .count {
    margin-left: auto;
    padding: 6px 12px;
    background: #e0e0e0;
    border-radius: 4px;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Column niet zichtbaar | type: 'inactive' mist | Voeg column toe |
| Taak nog in schedule | Project niet herberekend | Trigger project.propagate() |
| Styling niet toegepast | CSS niet geladen | Check CSS imports |
| Toggle werkt niet | Read-only mode | Check editor config |

---

## API Reference

### TaskModel Properties

| Property | Type | Description |
|----------|------|-------------|
| `inactive` | Boolean | Task inactive state |

### Inactive Column Config

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | 'inactive' |
| `text` | String | Column header |
| `width` | Number | Column width |

### Scheduling Behavior

| Aspect | Active Task | Inactive Task |
|--------|-------------|---------------|
| Critical path | Included | Excluded |
| Dependencies | Applied | Ignored for scheduling |
| Duration calculation | Included | Excluded from parent |
| Visual | Normal | Greyed out |

---

## Bronnen

- **Example**: `examples/inactive-tasks/`
- **TaskModel**: `Gantt.model.TaskModel`
- **InactiveColumn**: `Gantt.column.InactiveColumn`

---

*Priority 2: Medium Priority Features*
