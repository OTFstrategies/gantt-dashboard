# Gantt Implementation: Percent Done

> **Voortgangsregistratie** met PercentDone column, visuele progress bars, parent rollup, en editing modes.

---

## Overzicht

Percent Done tracking visualiseert taakvoortgang in de Gantt. Het systeem ondersteunt directe editing, automatische parent berekening, en vergelijking met geplande voortgang.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Name               │ % Done │ Timeline                                │
├────────────────────────────────────────────────────────────────────────┤
│ ▼ Project Launch   │   65%  │ ████████████████████████████████░░░░░░░ │
│   ├── Planning     │  100%  │ ████████████████                        │
│   ├── Development  │   80%  │         ████████████████████░░░         │
│   ├── Testing      │   40%  │                        ████░░░░░░       │
│   └── Deployment   │    0%  │                              ░░░░░░░░░░ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basis Configuratie

### 1.1 PercentDone Column

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',

    columns: [
        { type: 'name', field: 'name', width: 250 },
        {
            type: 'percentdone',
            width: 100,
            text: 'Progress',
            showCircle: true  // Toon circulaire progress indicator
        },
        { type: 'startdate' },
        { type: 'enddate' }
    ],

    project: new ProjectModel({
        loadUrl: '/api/project',
        autoLoad: true
    })
});
```

### 1.2 Column Options

```javascript
{
    type: 'percentdone',
    text: 'Complete',
    width: 120,

    // Visual options
    showCircle: true,           // Circulaire indicator
    lowThreshold: 30,           // < 30% = low color
    highThreshold: 70,          // > 70% = high color

    // Editor
    editor: {
        type: 'slider',
        min: 0,
        max: 100,
        step: 5
    }
}
```

---

## 2. PercentBar Feature

### 2.1 Feature Activeren

```javascript
const gantt = new Gantt({
    features: {
        percentBar: true
    }
});
```

### 2.2 PercentBar Configuratie

```javascript
features: {
    percentBar: {
        // Waar tonen in taakbalk
        position: 'inside',  // 'inside', 'outside', 'top', 'bottom'

        // Styling
        cls: 'custom-percent-bar',

        // Verberg voor bepaalde taken
        disabled: ({ taskRecord }) => taskRecord.isMilestone
    }
}
```

### 2.3 Custom Styling

```css
/* Percent bar binnen taak */
.b-gantt-task-percent {
    background: rgba(255, 255, 255, 0.4);
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
}

/* Progress thresholds */
.b-percent-low .b-gantt-task-percent {
    background: rgba(244, 67, 54, 0.5);  /* Red */
}

.b-percent-medium .b-gantt-task-percent {
    background: rgba(255, 152, 0, 0.5);  /* Orange */
}

.b-percent-high .b-gantt-task-percent {
    background: rgba(76, 175, 80, 0.5);  /* Green */
}
```

---

## 3. Data Model

### 3.1 Task PercentDone Field

```javascript
// Standaard TaskModel heeft percentDone field
const task = {
    id: 1,
    name: 'Development',
    startDate: '2024-01-15',
    duration: 10,
    percentDone: 75  // 0-100
};
```

### 3.2 Custom Percent Field

```javascript
import { TaskModel } from '@bryntum/gantt';

class CustomTaskModel extends TaskModel {
    static fields = [
        // Custom percent field
        {
            name: 'completionPercentage',
            type: 'number',
            defaultValue: 0
        }
    ];

    // Map naar standaard percentDone
    get percentDone() {
        return this.completionPercentage;
    }

    set percentDone(value) {
        this.completionPercentage = value;
    }
}
```

---

## 4. Parent Task Rollup

### 4.1 Automatic Calculation

```javascript
// Parent percentDone wordt automatisch berekend
// Gebaseerd op child durations en percentDone

// Project (60% complete)
//   ├── Phase 1 (100%, 5 days)    = 5 completed days
//   ├── Phase 2 (50%, 10 days)    = 5 completed days
//   └── Phase 3 (0%, 5 days)      = 0 completed days
//                                   ─────────────────
//                                   10/20 = 50% wait, that's wrong...

// Formule: sum(child.percentDone * child.duration) / sum(child.duration)
// (100*5 + 50*10 + 0*5) / (5+10+5) = 1000 / 20 = 50%
```

### 4.2 Manual Override

```javascript
// Parent met manuele percentDone (niet berekend)
const project = new ProjectModel({
    tasksData: [
        {
            id: 'parent',
            name: 'Manual Project',
            percentDone: 65,
            manuallyScheduled: true,  // Voorkomt auto-berekening
            children: [...]
        }
    ]
});
```

### 4.3 Custom Rollup Logic

```javascript
class CustomTaskModel extends TaskModel {

    // Override calculated percentDone
    calculatePercentDone() {
        if (!this.isParent) {
            return this._percentDone;
        }

        // Custom berekening: alleen leaf tasks
        const leaves = this.allChildren.filter(t => !t.isParent);

        if (leaves.length === 0) return 0;

        // Gemiddelde van alle leaves (zonder weging)
        const sum = leaves.reduce((s, t) => s + t.percentDone, 0);
        return sum / leaves.length;
    }
}
```

---

## 5. Editing Percent Done

### 5.1 Column Editor

```javascript
{
    type: 'percentdone',
    editor: {
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        showValue: true
    }
}
```

### 5.2 Task Editor Integration

```javascript
features: {
    taskEdit: {
        items: {
            generalTab: {
                items: {
                    percentDone: {
                        type: 'slider',
                        label: 'Progress',
                        name: 'percentDone',
                        min: 0,
                        max: 100,
                        step: 5,
                        showValue: true,
                        weight: 400  // Positie in form
                    }
                }
            }
        }
    }
}
```

### 5.3 Drag-based Editing

```javascript
features: {
    percentBar: {
        // Enable drag to change percent
        allowResize: true,

        // Snap naar increments
        step: 5
    }
}

// Listen naar percent changes
gantt.on({
    percentBarDrag({ taskRecord, percent }) {
        console.log(`${taskRecord.name} is now ${percent}% complete`);
    }
});
```

---

## 6. Visual Indicators

### 6.1 Color Coding

```javascript
{
    type: 'percentdone',
    renderer({ value, cellElement }) {
        // Voeg CSS class toe gebaseerd op value
        cellElement.classList.remove('low', 'medium', 'high', 'complete');

        if (value >= 100) {
            cellElement.classList.add('complete');
        }
        else if (value >= 70) {
            cellElement.classList.add('high');
        }
        else if (value >= 30) {
            cellElement.classList.add('medium');
        }
        else {
            cellElement.classList.add('low');
        }

        return `${value}%`;
    }
}
```

### 6.2 Custom Progress Bar

```javascript
{
    text: 'Progress',
    field: 'percentDone',
    width: 150,
    renderer({ value }) {
        return {
            class: 'custom-progress-cell',
            children: [
                {
                    class: 'progress-bar-container',
                    children: [{
                        class: 'progress-bar-fill',
                        style: {
                            width: `${value}%`,
                            background: getProgressColor(value)
                        }
                    }]
                },
                {
                    class: 'progress-text',
                    text: `${Math.round(value)}%`
                }
            ]
        };
    }
}

function getProgressColor(percent) {
    if (percent >= 100) return '#4CAF50';
    if (percent >= 70) return '#8BC34A';
    if (percent >= 30) return '#FFC107';
    return '#F44336';
}
```

### 6.3 Circular Progress

```javascript
{
    type: 'percentdone',
    showCircle: true,

    // Custom circle rendering
    circleRenderer({ value, size }) {
        const radius = size / 2 - 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (value / 100) * circumference;

        return {
            tag: 'svg',
            class: 'percent-circle',
            width: size,
            height: size,
            children: [
                {
                    tag: 'circle',
                    class: 'circle-bg',
                    cx: size / 2,
                    cy: size / 2,
                    r: radius
                },
                {
                    tag: 'circle',
                    class: 'circle-progress',
                    cx: size / 2,
                    cy: size / 2,
                    r: radius,
                    style: {
                        strokeDasharray: circumference,
                        strokeDashoffset: offset
                    }
                }
            ]
        };
    }
}
```

---

## 7. Status Indicators

### 7.1 On Track / Behind Schedule

```javascript
{
    text: 'Status',
    width: 120,
    renderer({ record }) {
        const expected = calculateExpectedProgress(record);
        const actual = record.percentDone;
        const difference = actual - expected;

        let status, cls;

        if (actual >= 100) {
            status = 'Complete';
            cls = 'status-complete';
        }
        else if (difference >= 0) {
            status = 'On Track';
            cls = 'status-on-track';
        }
        else if (difference >= -10) {
            status = 'Slight Delay';
            cls = 'status-warning';
        }
        else {
            status = 'Behind';
            cls = 'status-critical';
        }

        return {
            class: `status-badge ${cls}`,
            text: status
        };
    }
}

function calculateExpectedProgress(task) {
    const today = new Date();
    const start = task.startDate;
    const end = task.endDate;

    if (today < start) return 0;
    if (today > end) return 100;

    const total = end - start;
    const elapsed = today - start;

    return (elapsed / total) * 100;
}
```

### 7.2 Progress Variance

```javascript
{
    text: 'Variance',
    width: 100,
    renderer({ record }) {
        const expected = calculateExpectedProgress(record);
        const actual = record.percentDone;
        const variance = actual - expected;

        const prefix = variance >= 0 ? '+' : '';
        const cls = variance >= 0 ? 'positive' : 'negative';

        return {
            class: `variance ${cls}`,
            text: `${prefix}${Math.round(variance)}%`
        };
    }
}
```

---

## 8. Bulk Updates

### 8.1 Update Multiple Tasks

```javascript
// Update alle geselecteerde taken
function updateSelectedProgress(percent) {
    const selected = gantt.selectedRecords;

    gantt.project.beginBatch();

    selected.forEach(task => {
        if (!task.isParent) {  // Skip parents (auto-calculated)
            task.percentDone = percent;
        }
    });

    gantt.project.endBatch();
}

// Toolbar buttons
tbar: [
    {
        type: 'button',
        text: 'Mark Complete',
        onClick: () => updateSelectedProgress(100)
    },
    {
        type: 'button',
        text: 'Reset Progress',
        onClick: () => updateSelectedProgress(0)
    }
]
```

### 8.2 Increment Progress

```javascript
function incrementProgress(amount = 10) {
    const selected = gantt.selectedRecords.filter(t => !t.isParent);

    gantt.project.beginBatch();

    selected.forEach(task => {
        const newPercent = Math.min(100, task.percentDone + amount);
        task.percentDone = newPercent;
    });

    gantt.project.endBatch();
}
```

---

## 9. Events & Validation

### 9.1 Progress Change Events

```javascript
gantt.on({
    beforeTaskEdit({ taskRecord, changes }) {
        if ('percentDone' in changes) {
            // Valideer nieuwe waarde
            if (changes.percentDone < taskRecord.percentDone) {
                // Bevestig regressie
                return confirm('Progress will be reduced. Continue?');
            }
        }
    },

    taskChange({ source: task, changes }) {
        if ('percentDone' in changes) {
            console.log(
                `${task.name}: ${changes.percentDone.oldValue}% → ${changes.percentDone.value}%`
            );

            // Auto-complete bij 100%
            if (changes.percentDone.value === 100) {
                // Optioneel: zet actualEndDate
                task.actualEndDate = new Date();
            }
        }
    }
});
```

### 9.2 Custom Validation

```javascript
class ValidatedTaskModel extends TaskModel {
    static fields = [
        {
            name: 'percentDone',
            type: 'number',
            defaultValue: 0,

            // Built-in validation
            validate(value) {
                if (value < 0 || value > 100) {
                    return 'Progress must be between 0 and 100';
                }
                return true;
            }
        }
    ];

    // Custom setter met validatie
    set percentDone(value) {
        // Round naar hele getallen
        value = Math.round(value);

        // Clamp between 0-100
        value = Math.max(0, Math.min(100, value));

        // Prevent regression zonder flag
        if (value < this._percentDone && !this.allowRegression) {
            console.warn('Progress regression not allowed');
            return;
        }

        this._percentDone = value;
    }
}
```

---

## 10. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useCallback } from 'react';

function ProgressGantt({ projectData }) {
    const [selectedTasks, setSelectedTasks] = useState([]);

    const columns = [
        { type: 'name', width: 250 },
        {
            type: 'percentdone',
            width: 120,
            showCircle: true
        },
        {
            text: 'Status',
            width: 100,
            renderer: ({ record }) => {
                const status = getTaskStatus(record);
                return <span className={`status-${status}`}>{status}</span>;
            }
        }
    ];

    const handleProgressChange = useCallback((percent) => {
        selectedTasks.forEach(task => {
            task.percentDone = percent;
        });
    }, [selectedTasks]);

    return (
        <div className="gantt-container">
            <div className="toolbar">
                <button
                    onClick={() => handleProgressChange(100)}
                    disabled={selectedTasks.length === 0}
                >
                    Mark Complete
                </button>
                <span>{selectedTasks.length} tasks selected</span>
            </div>

            <BryntumGantt
                columns={columns}
                projectConfig={projectData}
                features={{
                    percentBar: true,
                    taskEdit: true
                }}
                onSelectionChange={({ selection }) => {
                    setSelectedTasks(selection.filter(t => !t.isParent));
                }}
            />
        </div>
    );
}
```

---

## 11. Styling

```css
/* Percent column */
.b-percent-column .b-grid-cell {
    text-align: center;
}

/* Progress bar in cell */
.custom-progress-cell {
    display: flex;
    align-items: center;
    gap: 0.5em;
}

.progress-bar-container {
    flex: 1;
    height: 8px;
    background: #eee;
    border-radius: 4px;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    transition: width 0.3s, background 0.3s;
}

/* Status badges */
.status-badge {
    padding: 0.25em 0.75em;
    border-radius: 1em;
    font-size: 0.85em;
}

.status-complete { background: #e8f5e9; color: #2e7d32; }
.status-on-track { background: #e3f2fd; color: #1565c0; }
.status-warning { background: #fff3e0; color: #ef6c00; }
.status-critical { background: #ffebee; color: #c62828; }

/* Variance */
.variance.positive { color: #4CAF50; }
.variance.negative { color: #F44336; }

/* Circular progress */
.percent-circle {
    transform: rotate(-90deg);
}

.circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 3;
}

.circle-progress {
    fill: none;
    stroke: var(--b-primary-color);
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.3s;
}
```

---

## 12. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Parent niet updated | Auto-calculation disabled | Check manuallyScheduled flag |
| Percent > 100 | Geen validatie | Implement setter validation |
| Editor niet zichtbaar | Wrong editor type | Gebruik slider of numberfield |
| Progress bar niet zichtbaar | Feature disabled | Enable percentBar feature |

---

## API Reference

### PercentDone Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `showCircle` | Boolean | Toon circulaire indicator |
| `lowThreshold` | Number | Threshold voor low styling |
| `highThreshold` | Number | Threshold voor high styling |

### Task Properties

| Property | Type | Description |
|----------|------|-------------|
| `percentDone` | Number | Voortgang 0-100 |
| `isComplete` | Boolean | percentDone >= 100 |

---

## Bronnen

- **Column**: `Gantt.column.PercentDoneColumn`
- **Feature**: `Gantt.feature.PercentBar`
- **Example**: `examples/basic/`

---

*Track A: Foundation - Gantt Extensions (A2.4)*
