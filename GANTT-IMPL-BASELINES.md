# Gantt Implementation: Baselines

> **Project baselines** voor het vergelijken van geplande vs actuele voortgang.

---

## Overzicht

Bryntum Gantt's Baselines feature toont baseline (snapshot) vergelijkingen met actuele task data.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GANTT            [Set baseline ▼] [Show baseline ▼] [x] Show baselines  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Task Name    │ Start │ End │ Duration │ B1 Start │ B1 End │ Variance  │
│               │       │     │          │          │        │           │
│  Development  │ Jan 20│Feb 5│ 16 days  │ Jan 15   │ Jan 30 │ +5 days ⚠│
│  Testing      │ Feb 6 │Feb 15│ 9 days  │ Feb 1    │ Feb 10 │ +5 days ⚠│
│               │                                                          │
├───────────────┴──────────────────────────────────────────────────────────┤
│                                                                          │
│     Jan 15      Jan 20      Jan 25      Jan 30      Feb 05              │
│        │           │           │           │           │                 │
│        │           ┌───────────────────────────────────┐                │
│        │  Actual:  │██████████████████████████████████│                │
│        │           └───────────────────────────────────┘                │
│        ┌───────────────────────────────┐                                │
│  Base: │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Delayed!                     │
│        └───────────────────────────────┘                                │
│                                                                          │
│  BASELINE STATUS:                                                        │
│  ███ On time    ███ Ahead    ███ Behind                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic Baselines Setup

### 1.1 Enable Baselines Feature

```javascript
import { DateHelper, Gantt, ProjectModel, StringHelper } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    loadUrl: '../_datasets/launch-saas.json'
});

const gantt = new Gantt({
    appendTo: 'container',

    dependencyIdField: 'wbsCode',

    project,

    // Allow extra space for baseline(s)
    rowHeight: 60,

    columns: [
        { type: 'wbs' },
        { type: 'name', width: 300 },
        { type: 'startdate' },
        { type: 'enddate' },
        { type: 'duration' },
        { type: 'effort' },
        { type: 'actualeffort' },

        // Baseline 1 columns
        {
            text: 'Baseline 1',
            collapsible: true,
            children: [
                { type: 'baselinestartdate', text: 'Start', field: 'baselines[0].startDate' },
                { type: 'baselineenddate', text: 'Finish', field: 'baselines[0].endDate' },
                { type: 'baselineduration', text: 'Duration', field: 'baselines[0].fullDuration' },
                { type: 'baselineeffort', text: 'Effort', field: 'baselines[0].fullEffort' },
                { type: 'baselinestartvariance', field: 'baselines[0].startVariance' },
                { type: 'baselineendvariance', field: 'baselines[0].endVariance' },
                { type: 'baselinedurationvariance', field: 'baselines[0].durationVariance' }
            ]
        },

        // Baseline 2 columns (collapsed by default)
        {
            text: 'Baseline 2',
            collapsible: true,
            collapsed: true,
            children: [
                { type: 'baselinestartdate', text: 'Start', field: 'baselines[1].startDate' },
                { type: 'baselineenddate', text: 'Finish', field: 'baselines[1].endDate' },
                { type: 'baselineduration', text: 'Duration', field: 'baselines[1].fullDuration' },
                { type: 'baselinestartvariance', field: 'baselines[1].startVariance' },
                { type: 'baselineendvariance', field: 'baselines[1].endVariance' },
                { type: 'baselinedurationvariance', field: 'baselines[1].durationVariance' }
            ]
        }
    ],

    subGridConfigs: {
        locked: { flex: 1 },
        normal: { flex: 1 }
    },

    features: {
        baselines: {
            // Custom tooltip template
            template(data) {
                const me = this;
                const { baseline } = data;
                const { task } = baseline;
                const delayed = task.startDate > baseline.startDate;
                const overrun = task.durationMS > baseline.durationMS;

                let { decimalPrecision } = me;
                if (decimalPrecision == null) {
                    decimalPrecision = me.client.durationDisplayPrecision;
                }

                const multiplier = Math.pow(10, decimalPrecision);
                const displayDuration = Math.round(baseline.duration * multiplier) / multiplier;

                return `
                    <div class="b-gantt-task-title">
                        ${StringHelper.encodeHtml(task.name)} (${me.L('baseline')} ${baseline.parentIndex + 1})
                    </div>
                    <table>
                        <tr><td>${me.L('Start')}:</td><td>${data.startClockHtml}</td></tr>
                        ${baseline.milestone ? '' : `
                            <tr><td>${me.L('End')}:</td><td>${data.endClockHtml}</td></tr>
                            <tr>
                                <td>${me.L('Duration')}:</td>
                                <td class="b-right">
                                    ${displayDuration} ${DateHelper.getLocalizedNameOfUnit(baseline.durationUnit, baseline.duration !== 1)}
                                </td>
                            </tr>
                        `}
                    </table>
                    ${delayed ? `
                        <h4 class="statusmessage b-baseline-delay">
                            <i class="statusicon fa fa-exclamation-triangle"></i>
                            ${me.L('Delayed start by')} ${DateHelper.formatDelta(task.startDate - baseline.startDate)}
                        </h4>
                    ` : ''}
                    ${overrun ? `
                        <h4 class="statusmessage b-baseline-overrun">
                            <i class="statusicon fa fa-exclamation-triangle"></i>
                            ${me.L('Overrun by')} ${DateHelper.formatDelta(task.durationMS - baseline.durationMS)}
                        </h4>
                    ` : ''}
                `;
            },

            // Custom renderer (optional)
            renderer: null
        },
        columnLines: false,
        filter: true,
        labels: {
            before: {
                field: 'name',
                editor: { type: 'textfield' }
            }
        }
    }
});

project.load();
```

---

## 2. Baseline Management

### 2.1 Set Baseline

```javascript
// Helper function to set baseline
const setBaseline = (index) => {
    gantt.taskStore.setBaseline(index);
};

// Toolbar with baseline controls
tbar: {
    items: {
        setBaseline: {
            type: 'button',
            text: 'Set baseline',
            iconAlign: 'end',
            menu: [
                {
                    text: 'Set baseline 1',
                    onItem() { setBaseline(1); }
                },
                {
                    text: 'Set baseline 2',
                    onItem() { setBaseline(2); }
                },
                {
                    text: 'Set baseline 3',
                    onItem() { setBaseline(3); }
                }
            ]
        }
    }
}
```

### 2.2 Toggle Baseline Visibility

```javascript
// Helper function to toggle baseline visibility
const toggleBaselineVisible = (index, visible) => {
    gantt.element.classList[visible ? 'remove' : 'add'](`b-hide-baseline-${index}`);
};

// Toolbar with visibility controls
tbar: {
    items: {
        showBaseline: {
            type: 'button',
            text: 'Show baseline',
            iconAlign: 'end',
            menu: [
                {
                    checked: true,
                    text: 'Baseline 1',
                    onToggle({ checked }) {
                        toggleBaselineVisible(1, checked);
                    }
                },
                {
                    checked: true,
                    text: 'Baseline 2',
                    onToggle({ checked }) {
                        toggleBaselineVisible(2, checked);
                    }
                },
                {
                    checked: true,
                    text: 'Baseline 3',
                    onToggle({ checked }) {
                        toggleBaselineVisible(3, checked);
                    }
                }
            ]
        },

        showBaselines: {
            type: 'slidetoggle',
            text: 'Show baselines',
            checked: true,
            onAction({ checked }) {
                gantt.features.baselines.disabled = !checked;
            }
        }
    }
}
```

---

## 3. Custom Baseline Renderer

### 3.1 Status-Based Renderer

```javascript
const baselineRenderer = ({ baselineRecord, taskRecord, renderData }) => {
    const oneDayMs = 24 * 3600 * 1000;

    if (baselineRecord.isScheduled && taskRecord.isScheduled) {
        // Behind schedule: actual end more than 1 day after baseline end
        if (baselineRecord.endDate.getTime() + oneDayMs < taskRecord.endDate.getTime()) {
            renderData.className['b-baseline-behind'] = 1;
        }
        // Ahead of schedule: actual end before baseline end
        else if (taskRecord.endDate < baselineRecord.endDate) {
            renderData.className['b-baseline-ahead'] = 1;
        }
        // On time
        else {
            renderData.className['b-baseline-on-time'] = 1;
        }
    }
};

// Enable renderer toggle
tbar: {
    items: {
        enableRenderer: {
            type: 'slidetoggle',
            text: 'Enable baseline renderer',
            cls: 'b-baseline-toggle',
            checked: false,
            onAction({ checked }) {
                gantt.features.baselines.renderer = checked ? baselineRenderer : () => {};
            }
        }
    }
}
```

---

## 4. Baseline Column Types

### 4.1 Available Column Types

```javascript
columns: [
    // Baseline dates
    { type: 'baselinestartdate', field: 'baselines[0].startDate' },
    { type: 'baselineenddate', field: 'baselines[0].endDate' },

    // Baseline duration and effort
    { type: 'baselineduration', field: 'baselines[0].fullDuration' },
    { type: 'baselineeffort', field: 'baselines[0].fullEffort' },

    // Variance columns (difference between baseline and actual)
    { type: 'baselinestartvariance', field: 'baselines[0].startVariance' },
    { type: 'baselineendvariance', field: 'baselines[0].endVariance' },
    { type: 'baselinedurationvariance', field: 'baselines[0].durationVariance' }
]
```

### 4.2 Custom Variance Column

```javascript
{
    text: 'Schedule Status',
    field: 'baselines[0].endVariance',
    width: 120,
    renderer({ value, record }) {
        if (value === null || value === undefined) return '';

        if (value > 0) {
            return `<span class="behind">+${value} days late</span>`;
        } else if (value < 0) {
            return `<span class="ahead">${value} days early</span>`;
        }
        return '<span class="on-time">On schedule</span>';
    }
}
```

---

## 5. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useCallback, useRef } from 'react';
import { DateHelper, StringHelper } from '@bryntum/gantt';

function GanttWithBaselines({ projectData }) {
    const ganttRef = useRef(null);
    const [showBaselines, setShowBaselines] = useState(true);
    const [enableRenderer, setEnableRenderer] = useState(false);

    const baselineRenderer = useCallback(({ baselineRecord, taskRecord, renderData }) => {
        if (baselineRecord.isScheduled && taskRecord.isScheduled) {
            const oneDayMs = 24 * 3600 * 1000;
            if (baselineRecord.endDate.getTime() + oneDayMs < taskRecord.endDate.getTime()) {
                renderData.className['b-baseline-behind'] = 1;
            } else if (taskRecord.endDate < baselineRecord.endDate) {
                renderData.className['b-baseline-ahead'] = 1;
            } else {
                renderData.className['b-baseline-on-time'] = 1;
            }
        }
    }, []);

    const setBaseline = useCallback((index) => {
        ganttRef.current?.instance.taskStore.setBaseline(index);
    }, []);

    const toggleShowBaselines = useCallback((checked) => {
        setShowBaselines(checked);
        if (ganttRef.current?.instance) {
            ganttRef.current.instance.features.baselines.disabled = !checked;
        }
    }, []);

    const toggleRenderer = useCallback((checked) => {
        setEnableRenderer(checked);
        if (ganttRef.current?.instance) {
            ganttRef.current.instance.features.baselines.renderer =
                checked ? baselineRenderer : () => {};
        }
    }, [baselineRenderer]);

    const ganttConfig = {
        rowHeight: 60,

        columns: [
            { type: 'wbs' },
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'enddate' },
            { type: 'duration' },
            {
                text: 'Baseline 1',
                collapsible: true,
                children: [
                    { type: 'baselinestartdate', text: 'Start', field: 'baselines[0].startDate' },
                    { type: 'baselineenddate', text: 'End', field: 'baselines[0].endDate' },
                    { type: 'baselinedurationvariance', field: 'baselines[0].durationVariance' }
                ]
            }
        ],

        features: {
            baselines: {
                disabled: !showBaselines,
                renderer: enableRenderer ? baselineRenderer : null,
                template(data) {
                    const { baseline } = data;
                    const { task } = baseline;
                    return `
                        <div><strong>${task.name}</strong> (Baseline ${baseline.parentIndex + 1})</div>
                        <div>Start: ${DateHelper.format(baseline.startDate, 'MMM D, YYYY')}</div>
                        <div>End: ${DateHelper.format(baseline.endDate, 'MMM D, YYYY')}</div>
                    `;
                }
            }
        }
    };

    return (
        <div className="gantt-baselines-wrapper">
            <div className="toolbar">
                <div className="baseline-actions">
                    <button onClick={() => setBaseline(1)}>Set Baseline 1</button>
                    <button onClick={() => setBaseline(2)}>Set Baseline 2</button>
                    <button onClick={() => setBaseline(3)}>Set Baseline 3</button>
                </div>
                <div className="baseline-toggles">
                    <label>
                        <input
                            type="checkbox"
                            checked={showBaselines}
                            onChange={(e) => toggleShowBaselines(e.target.checked)}
                        />
                        Show baselines
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={enableRenderer}
                            onChange={(e) => toggleRenderer(e.target.checked)}
                        />
                        Enable status colors
                    </label>
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
/* Baseline bar base styling */
.b-gantt-baseline {
    height: 8px;
    margin-top: 2px;
    opacity: 0.7;
    border-radius: 2px;
}

/* Baseline status colors */
.b-baseline-on-time {
    background: #4CAF50;
}

.b-baseline-ahead {
    background: #2196F3;
}

.b-baseline-behind {
    background: #f44336;
}

/* Baseline tooltip */
.b-baseline-tooltip {
    background: #333;
    color: white;
    padding: 12px;
    border-radius: 4px;
}

.b-baseline-tooltip .b-gantt-task-title {
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 14px;
}

.b-baseline-tooltip table {
    width: 100%;
}

.b-baseline-tooltip td {
    padding: 4px 8px;
}

.b-baseline-tooltip .b-right {
    text-align: right;
}

/* Status messages in tooltip */
.statusmessage {
    margin-top: 12px;
    padding: 8px;
    border-radius: 4px;
}

.b-baseline-delay {
    background: rgba(244, 67, 54, 0.2);
    color: #f44336;
}

.b-baseline-overrun {
    background: rgba(255, 152, 0, 0.2);
    color: #FF9800;
}

.statusicon {
    margin-right: 8px;
}

/* Hide specific baselines */
.b-hide-baseline-1 .b-gantt-baseline-1 { display: none; }
.b-hide-baseline-2 .b-gantt-baseline-2 { display: none; }
.b-hide-baseline-3 .b-gantt-baseline-3 { display: none; }

/* Variance columns */
.behind { color: #f44336; }
.ahead { color: #4CAF50; }
.on-time { color: #2196F3; }

/* Baseline toggle button */
.b-baseline-toggle {
    margin-left: 16px;
}

/* Baseline columns in grid */
.b-baseline-column {
    background: #f5f5f5;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Baselines niet zichtbaar | Feature disabled | Enable baselines feature |
| Baseline bars te klein | rowHeight te laag | Verhoog rowHeight naar 60+ |
| Variance columns leeg | Geen baseline gezet | Roep setBaseline() aan |
| Custom renderer werkt niet | Renderer niet toegewezen | Zet renderer in feature config |
| Tooltip niet zichtbaar | Template error | Check template function |

---

## API Reference

### Baselines Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `disabled` | Boolean | Disable/enable feature |
| `template` | Function | Tooltip template |
| `renderer` | Function | Custom bar renderer |
| `decimalPrecision` | Number | Duration decimal places |

### TaskStore Methods

| Method | Description |
|--------|-------------|
| `setBaseline(index)` | Set baseline snapshot |

### Baseline Column Types

| Type | Description |
|------|-------------|
| `baselinestartdate` | Baseline start date |
| `baselineenddate` | Baseline end date |
| `baselineduration` | Baseline duration |
| `baselineeffort` | Baseline effort |
| `baselinestartvariance` | Start variance |
| `baselineendvariance` | End variance |
| `baselinedurationvariance` | Duration variance |

### Renderer Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `baselineRecord` | BaselineModel | The baseline data |
| `taskRecord` | TaskModel | The current task |
| `renderData` | Object | Render configuration |

---

## Bronnen

- **Example**: `examples/baselines/`
- **Baselines Feature**: `Gantt.feature.Baselines`
- **BaselineModel**: `Gantt.model.BaselineModel`
- **DateHelper**: `Core.helper.DateHelper`

---

*Priority 2: Medium Priority Features*
