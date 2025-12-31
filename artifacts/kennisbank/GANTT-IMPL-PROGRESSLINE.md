# Gantt Implementation: Progress Line

> **Progress Line** voor het visualiseren van project voortgang ten opzichte van een statusdatum.

---

## Overzicht

Bryntum Gantt's ProgressLine feature toont de voortgang van het project.

```
+--------------------------------------------------------------------------+
| GANTT         [x] Show project line   Status date: [Jan 27, 2019]        |
+--------------------------------------------------------------------------+
|                                                                          |
|  Task Name          | Duration |         Timeline                       |
+--------------------------------------------------------------------------+
|                     |          |    Jan 15   Jan 20   Jan 27   Feb 01   |
|                     |          |       |        |        |        |     |
|  Planning           | 5 days   |    ████████████|                       |
|                     |          |                 |                       |
|  Design             | 10 days  |    ████████████████████                |
|                     |          |                 |        |              |
|  Development        | 15 days  |         ████████████████████████      |
|                     |          |                 |              |        |
|  Testing            | 7 days   |              ████████████████          |
|                     |          |                 |                       |
|                                        |                                 |
|                              Progress Line (zigzag)                      |
|                                        |                                 |
|                                        v                                 |
|                     ─────/\──────/\──────/\─────                        |
|                                                                          |
|  PROGRESS LINE:                                                          |
|    Connects actual progress of tasks at status date                      |
|    Zigzag pattern shows ahead/behind schedule                           |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Progress Line Setup

### 1.1 Enable Progress Line

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    loadUrl: '../_datasets/launch-saas.json'
});

const statusDate = new Date(2019, 0, 27);

const gantt = new Gantt({
    appendTo: 'container',

    startDate: '2019-01-08',
    endDate: '2019-04-01',

    project,

    dependencyIdField: 'sequenceNumber',

    features: {
        progressLine: {
            statusDate
        }
    },

    columns: [
        { type: 'name', width: 250 }
    ],

    viewPreset: 'weekAndDayLetter'
});

project.load();
```

---

## 2. Toolbar Controls

### 2.1 Toggle and Date Picker

```javascript
tbar: [
    {
        type: 'slidetoggle',
        label: 'Show project line',
        checked: true,
        listeners: {
            change: ({ checked }) => {
                gantt.features.progressLine.disabled = !checked;
            }
        }
    },
    {
        type: 'datefield',
        label: 'Project status date',
        value: statusDate,
        step: '1d',
        inputWidth: '13em',
        listeners: {
            change: ({ value }) => {
                gantt.features.progressLine.statusDate = value;
            }
        }
    },
    '->',
    {
        icon: 'fa-angle-left',
        rendition: 'text',
        onAction() {
            this.up('gantt').shiftPrevious();
        }
    },
    {
        type: 'viewpresetcombo',
        inputWidth: '9.5em'
    },
    {
        icon: 'fa-angle-right',
        rendition: 'text',
        onAction() {
            this.up('gantt').shiftNext();
        }
    }
]
```

---

## 3. Feature Configuration

### 3.1 Progress Line Options

```javascript
features: {
    progressLine: {
        // The status date for progress calculation
        statusDate: new Date(),

        // Disable/enable the feature
        disabled: false
    }
}
```

### 3.2 Programmatic Control

```javascript
// Enable/disable progress line
gantt.features.progressLine.disabled = false;

// Update status date
gantt.features.progressLine.statusDate = new Date();

// Get current status date
const currentDate = gantt.features.progressLine.statusDate;
```

---

## 4. Progress Calculation

### 4.1 How It Works

The progress line connects the actual progress points of tasks at the status date:

1. For each task, calculate where it should be at status date
2. Compare with actual percent complete
3. Draw a line connecting these points
4. Zigzag pattern shows ahead/behind schedule

### 4.2 Task Properties

```javascript
// Task properties for progress
task.percentDone       // Actual completion percentage
task.startDate         // Task start date
task.endDate           // Task end date
task.duration          // Task duration

// At status date, expected progress =
// (statusDate - startDate) / duration * 100
```

---

## 5. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useRef, useCallback } from 'react';

function GanttWithProgressLine({ projectData }) {
    const ganttRef = useRef(null);
    const [showLine, setShowLine] = useState(true);
    const [statusDate, setStatusDate] = useState(new Date(2019, 0, 27));

    const toggleProgressLine = useCallback((checked) => {
        setShowLine(checked);
        if (ganttRef.current?.instance) {
            ganttRef.current.instance.features.progressLine.disabled = !checked;
        }
    }, []);

    const updateStatusDate = useCallback((date) => {
        setStatusDate(date);
        if (ganttRef.current?.instance) {
            ganttRef.current.instance.features.progressLine.statusDate = date;
        }
    }, []);

    const shiftPrevious = useCallback(() => {
        ganttRef.current?.instance?.shiftPrevious();
    }, []);

    const shiftNext = useCallback(() => {
        ganttRef.current?.instance?.shiftNext();
    }, []);

    const ganttConfig = {
        startDate: '2019-01-08',
        endDate: '2019-04-01',

        features: {
            progressLine: {
                disabled: !showLine,
                statusDate
            }
        },

        columns: [
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'duration' },
            { type: 'percentdone', width: 100 }
        ],

        viewPreset: 'weekAndDayLetter'
    };

    return (
        <div className="gantt-progress-wrapper">
            <div className="toolbar">
                <label>
                    <input
                        type="checkbox"
                        checked={showLine}
                        onChange={(e) => toggleProgressLine(e.target.checked)}
                    />
                    Show progress line
                </label>
                <label>
                    Status date:
                    <input
                        type="date"
                        value={statusDate.toISOString().split('T')[0]}
                        onChange={(e) => updateStatusDate(new Date(e.target.value))}
                    />
                </label>
                <div className="nav-buttons">
                    <button onClick={shiftPrevious}>Previous</button>
                    <button onClick={shiftNext}>Next</button>
                </div>
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
/* Progress line */
.b-gantt .b-progress-line {
    stroke: #1976d2;
    stroke-width: 2;
    fill: none;
}

/* Progress line zigzag */
.b-gantt .b-progress-line-zigzag {
    stroke: #1976d2;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
}

/* Ahead of schedule */
.b-gantt .b-progress-line.b-ahead {
    stroke: #4CAF50;
}

/* Behind schedule */
.b-gantt .b-progress-line.b-behind {
    stroke: #f44336;
}

/* Status date marker */
.b-gantt .b-status-date-marker {
    stroke: #FF9800;
    stroke-width: 2;
    stroke-dasharray: 5, 3;
}

/* Progress line dot at task */
.b-gantt .b-progress-line-dot {
    fill: #1976d2;
    stroke: white;
    stroke-width: 2;
}

/* Custom progress line styling */
.b-gantt.custom-progress .b-progress-line {
    stroke: #9C27B0;
    stroke-width: 3;
    stroke-linecap: round;
}

/* Toolbar styling */
.gantt-progress-wrapper .toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.nav-buttons {
    margin-left: auto;
}

.nav-buttons button {
    padding: 4px 12px;
    margin: 0 4px;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Line niet zichtbaar | Feature disabled | Zet disabled: false |
| Line op verkeerde datum | statusDate fout | Update statusDate |
| Geen zigzag | Tasks op schema | Normal - geen afwijking |
| Line verdwijnt | Buiten viewport | Scroll naar statusDate |

---

## API Reference

### ProgressLine Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `statusDate` | Date | The status date |
| `disabled` | Boolean | Enable/disable feature |

### ProgressLine Methods

| Method | Description |
|--------|-------------|
| `refresh()` | Redraw the progress line |

### Gantt Navigation

| Method | Description |
|--------|-------------|
| `shiftPrevious()` | Scroll to previous period |
| `shiftNext()` | Scroll to next period |
| `zoomIn()` | Zoom in timeline |
| `zoomOut()` | Zoom out timeline |

---

## Bronnen

- **Example**: `examples/progressline/`
- **ProgressLine Feature**: `Gantt.feature.ProgressLine`

---

*Priority 2: Medium Priority Features*
