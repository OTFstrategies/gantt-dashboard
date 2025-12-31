# Gantt Implementation: Critical Paths

> **Critical Path Method (CPM)** voor het identificeren van project-kritische taken.

---

## Overzicht

Bryntum Gantt's CriticalPaths feature identificeert en markeert taken op het kritieke pad.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GANTT                    [x] Highlight Critical Paths                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Task Name    │ Early Start │ Early End │ Late Start │ Late End │ Slack │
│               │             │           │            │          │       │
│  Planning     │ Jan 15      │ Jan 20    │ Jan 15     │ Jan 20   │  0 🔴│
│  Design       │ Jan 21      │ Feb 01    │ Jan 21     │ Feb 01   │  0 🔴│
│  Development  │ Feb 02      │ Feb 20    │ Feb 05     │ Feb 23   │  3    │
│  Testing      │ Feb 21      │ Feb 28    │ Feb 21     │ Feb 28   │  0 🔴│
│               │                                                          │
├───────────────┴──────────────────────────────────────────────────────────┤
│                                                                          │
│     Jan 15      Jan 20      Jan 25      Feb 01      Feb 10              │
│        │           │           │           │           │                 │
│        ╔═══════════╗                                                     │
│        ║███████████║ Planning (CRITICAL)                                │
│        ╚═══════════╝                                                     │
│                    ╔═══════════════════════╗                            │
│                    ║███████████████████████║ Design (CRITICAL)          │
│                    ╚═══════════════════════╝                            │
│                    ┌───────────────────────┐                            │
│                    │░░░░░░░░░░░░░░░░░░░░░░░│ Development (has slack)    │
│                    └───────────────────────┘                            │
│                                                                          │
│  CRITICAL PATH:                                                          │
│  ═══ Critical (no slack)    ─── Non-critical (has slack)                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic Critical Paths Setup

### 1.1 Enable Critical Paths Feature

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    loadUrl: '../_datasets/criticalpaths.json',
    validateResponse: true
});

const gantt = new Gantt({
    appendTo: 'container',

    project,

    dependencyIdField: 'sequenceNumber',

    columns: [
        { type: 'name' },
        { type: 'earlystartdate' },
        { type: 'earlyenddate' },
        { type: 'latestartdate' },
        { type: 'lateenddate' },
        { type: 'totalslack' }
    ],

    features: {
        // Critical paths feature is included but disabled by default
        criticalPaths: {
            disabled: false,
            highlightCriticalRows: true
        }
    },

    tbar: [
        {
            type: 'slidetoggle',
            color: 'b-red',
            ref: 'criticalPathsButton',
            text: 'Highlight Critical Paths',
            checked: true,
            onChange({ checked }) {
                // Toggle critical paths feature
                gantt.features.criticalPaths.disabled = !checked;
            }
        }
    ]
});

project.load();
```

---

## 2. Critical Path Columns

### 2.1 Available Column Types

```javascript
columns: [
    // Task name
    { type: 'name' },

    // Early dates (earliest possible start/end)
    { type: 'earlystartdate', text: 'Early Start' },
    { type: 'earlyenddate', text: 'Early End' },

    // Late dates (latest possible start/end without delay)
    { type: 'latestartdate', text: 'Late Start' },
    { type: 'lateenddate', text: 'Late End' },

    // Total slack (float time)
    { type: 'totalslack', text: 'Total Slack' },

    // Free slack
    { type: 'freeslack', text: 'Free Slack' }
]
```

### 2.2 Custom Slack Column

```javascript
{
    text: 'Status',
    field: 'totalSlack',
    width: 100,
    renderer({ record }) {
        if (record.critical) {
            return '<span class="critical-badge">Critical</span>';
        }
        return `${record.totalSlack} days slack`;
    }
}
```

---

## 3. Feature Configuration

### 3.1 Highlight Options

```javascript
features: {
    criticalPaths: {
        // Enable feature
        disabled: false,

        // Highlight entire rows for critical tasks
        highlightCriticalRows: true
    }
}
```

### 3.2 Programmatic Control

```javascript
// Enable critical paths
gantt.features.criticalPaths.disabled = false;

// Disable critical paths
gantt.features.criticalPaths.disabled = true;

// Check if task is critical
const task = gantt.taskStore.getById(1);
if (task.critical) {
    console.log(`${task.name} is on the critical path`);
}
```

---

## 4. Critical Path Data

### 4.1 Task Properties

```javascript
// Task model has these properties computed:
task.critical       // Boolean: is on critical path
task.earlyStartDate // Date: earliest start
task.earlyEndDate   // Date: earliest end
task.lateStartDate  // Date: latest start without delay
task.lateEndDate    // Date: latest end without delay
task.totalSlack     // Number: total float in days
task.freeSlack      // Number: free float in days
```

### 4.2 Dependencies and Critical Path

```json
{
    "tasks": {
        "rows": [
            { "id": 1, "name": "Start", "startDate": "2024-01-15", "duration": 0 },
            { "id": 2, "name": "Planning", "duration": 5 },
            { "id": 3, "name": "Design", "duration": 10 },
            { "id": 4, "name": "Development", "duration": 15 },
            { "id": 5, "name": "Testing", "duration": 7 },
            { "id": 6, "name": "End", "duration": 0 }
        ]
    },
    "dependencies": {
        "rows": [
            { "id": 1, "fromTask": 1, "toTask": 2 },
            { "id": 2, "fromTask": 2, "toTask": 3 },
            { "id": 3, "fromTask": 3, "toTask": 4 },
            { "id": 4, "fromTask": 3, "toTask": 5 },
            { "id": 5, "fromTask": 4, "toTask": 6 },
            { "id": 6, "fromTask": 5, "toTask": 6 }
        ]
    }
}
```

---

## 5. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useCallback, useRef } from 'react';

function GanttWithCriticalPath({ projectData }) {
    const ganttRef = useRef(null);
    const [showCritical, setShowCritical] = useState(true);

    const toggleCriticalPaths = useCallback((checked) => {
        setShowCritical(checked);
        if (ganttRef.current?.instance) {
            ganttRef.current.instance.features.criticalPaths.disabled = !checked;
        }
    }, []);

    const getCriticalTasks = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            const criticalTasks = gantt.taskStore.query(task => task.critical);
            console.log('Critical tasks:', criticalTasks.map(t => t.name));
            return criticalTasks;
        }
        return [];
    }, []);

    const ganttConfig = {
        columns: [
            { type: 'name', width: 200 },
            { type: 'earlystartdate', width: 120 },
            { type: 'earlyenddate', width: 120 },
            { type: 'latestartdate', width: 120 },
            { type: 'lateenddate', width: 120 },
            {
                type: 'totalslack',
                width: 100,
                renderer({ record }) {
                    if (record.critical) {
                        return '<span class="critical">0 (Critical)</span>';
                    }
                    return `${record.totalSlack} days`;
                }
            }
        ],

        features: {
            criticalPaths: {
                disabled: !showCritical,
                highlightCriticalRows: true
            }
        }
    };

    return (
        <div className="gantt-critical-wrapper">
            <div className="toolbar">
                <label>
                    <input
                        type="checkbox"
                        checked={showCritical}
                        onChange={(e) => toggleCriticalPaths(e.target.checked)}
                    />
                    Highlight Critical Paths
                </label>
                <button onClick={getCriticalTasks}>
                    List Critical Tasks
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
/* Critical task bar */
.b-gantt-task.b-critical .b-gantt-task-bar {
    background: linear-gradient(to bottom, #f44336, #c62828);
    border: 2px solid #b71c1c;
}

/* Critical task row highlight */
.b-gantt-task-row.b-critical-row {
    background: rgba(244, 67, 54, 0.1);
}

.b-gantt-task-row.b-critical-row:hover {
    background: rgba(244, 67, 54, 0.15);
}

/* Critical dependency line */
.b-sch-dependency.b-critical {
    stroke: #f44336;
    stroke-width: 2;
}

/* Critical badge in column */
.critical-badge {
    background: #f44336;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: bold;
}

/* Slack column styling */
.critical {
    color: #f44336;
    font-weight: bold;
}

/* Total slack column */
.b-grid-cell.b-totalslack-column {
    font-weight: 500;
}

/* Zero slack highlight */
.b-grid-cell.b-totalslack-column[data-value="0"] {
    color: #f44336;
    background: rgba(244, 67, 54, 0.1);
}

/* Critical path toggle button */
.b-slidetoggle.b-red .b-slidetoggle-thumb {
    background: #f44336;
}
```

---

## 7. Critical Path Concepts

### Key Terms

| Term | Description |
|------|-------------|
| **Critical Path** | Longest sequence of dependent tasks |
| **Early Start** | Earliest possible start date |
| **Early End** | Earliest possible end date |
| **Late Start** | Latest start without delaying project |
| **Late End** | Latest end without delaying project |
| **Total Slack** | Time task can be delayed without affecting project end |
| **Free Slack** | Time task can be delayed without affecting next task |
| **Critical Task** | Task with zero total slack |

### Critical Path Rules

1. Tasks on critical path have zero slack
2. Delaying any critical task delays the project
3. Non-critical tasks have float/slack time
4. Multiple critical paths can exist
5. Adding resources to critical tasks may shorten project

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Geen critical path zichtbaar | Feature disabled | Zet disabled: false |
| Alle taken critical | Geen dependencies | Voeg dependencies toe |
| Slack kolommen leeg | Data niet berekend | Project moet geladen zijn |
| Row highlighting werkt niet | highlightCriticalRows: false | Zet highlightCriticalRows: true |

---

## API Reference

### CriticalPaths Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `disabled` | Boolean | Enable/disable feature |
| `highlightCriticalRows` | Boolean | Highlight entire row |

### Task Model Properties

| Property | Type | Description |
|----------|------|-------------|
| `critical` | Boolean | Is on critical path |
| `earlyStartDate` | Date | Earliest start |
| `earlyEndDate` | Date | Earliest end |
| `lateStartDate` | Date | Latest start |
| `lateEndDate` | Date | Latest end |
| `totalSlack` | Number | Total float (days) |
| `freeSlack` | Number | Free float (days) |

### Column Types

| Type | Description |
|------|-------------|
| `earlystartdate` | Early start date |
| `earlyenddate` | Early end date |
| `latestartdate` | Late start date |
| `lateenddate` | Late end date |
| `totalslack` | Total slack |
| `freeslack` | Free slack |

---

## Bronnen

- **Example**: `examples/criticalpaths/`
- **CriticalPaths Feature**: `Gantt.feature.CriticalPaths`
- **TaskModel**: `Gantt.model.TaskModel`

---

*Priority 2: Medium Priority Features*
