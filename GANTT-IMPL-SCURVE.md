# Gantt Implementation: S-Curve Chart

> **S-Curve** voor het visualiseren van cumulatieve project voortgang over tijd.

---

## Overzicht

Bryntum Gantt's TimelineChart feature toont S-Curve grafieken voor project metrics.

```
+--------------------------------------------------------------------------+
| GANTT     S-Curve fields: [Duration v] [Effort v]    [x] S-curve [x] Tasks|
+--------------------------------------------------------------------------+
|                                                                          |
|  Name              | Start    | Duration |       Timeline               |
+--------------------------------------------------------------------------+
|  Planning          | Jan 15   | 5 days   | ████████                     |
|  Design            | Jan 20   | 10 days  |        ████████████          |
|  Development       | Feb 01   | 15 days  |                 ███████████  |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|  100% ─┬────────────────────────────────────────────────────────────     |
|        │                                              ╭────────────      |
|   80% ─┤                                         ╭───╯                   |
|        │                                    ╭───╯                        |
|   60% ─┤                               ╭───╯                             |
|        │                          ╭───╯                                  |
|   40% ─┤                     ╭───╯                                       |
|        │                ╭───╯                                            |
|   20% ─┤           ╭───╯                                                 |
|        │      ╭───╯                                                      |
|    0% ─┴─────╯──────────────────────────────────────────────────────     |
|        |         |         |         |         |         |               |
|       Jan 15   Jan 25    Feb 04    Feb 14    Feb 24    Mar 06           |
|                                                                          |
|  SERIES:  ── Duration    ── Effort    ── Cost                           |
+--------------------------------------------------------------------------+
```

---

## 1. Basic S-Curve Setup

### 1.1 Enable Timeline Chart

```javascript
import { DateHelper, DomHelper, Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    autoLoad: true,
    loadUrl: '../_datasets/launch-saas.json',
    validateResponse: true
});

const gantt = new Gantt({
    appendTo: 'container',
    dependencyIdField: 'sequenceNumber',
    project,

    columns: [
        { type: 'name', field: 'name', text: 'Name', width: 200 },
        { type: 'startdate', text: 'Start date' },
        { type: 'duration', text: 'Duration' }
    ],

    columnLines: false,

    features: {
        timelineChart: {
            dataProvider: {
                // Configure data series
                meta: {
                    // Override color of default duration series
                    duration: { color: 'green' },

                    // Add custom effort series
                    effort: {
                        text: 'Effort',
                        color: '#FFCCCC',
                        callback: (task, start, end, durationDoneToDate, doneDuration, durationInInterval) => {
                            let value = 0;

                            if (durationInInterval > 0) {
                                if (task.isMilestone) {
                                    value = DateHelper.as('ms', task.effort, task.effortUnit);
                                }
                                else {
                                    value = Math.round(
                                        DateHelper.as('ms', task.effort, task.effortUnit) *
                                        (durationInInterval / task.durationMS)
                                    );
                                }
                            }

                            return value;
                        }
                    }
                }
            },
            chartProvider: {
                tooltipTemplate: function({ dataset, date }) {
                    return `
                        <div>${dataset.label}: ${Math.round(DateHelper.as('d', parseInt(dataset.value)) * 100) / 100} days</div>
                        <div>${DateHelper.format(date, this.gantt.displayDateFormat)}</div>
                    `;
                }
            }
        }
    }
});
```

---

## 2. Toolbar Controls

### 2.1 Dataset Selection

```javascript
tbar: [
    {
        type: 'combo',
        ref: 'datasetCombo',
        text: 'Dataset',
        valueField: 'name',
        label: 'S-Curve fields',
        ariaLabel: 'dataset',
        displayField: 'text',
        multiSelect: true,
        width: '38em',
        chipView: {
            iconTpl({ color }) {
                return `<div class="b-series-icon" style="${color ? `background-color:${color}` : ''}"></div>`;
            }
        },
        listItemTpl({ text, color }) {
            return `<div class="b-series-icon" style="${color ? `background-color:${color}` : ''}"></div>${text}`;
        },
        onChange({ value }) {
            this.up('gantt').features.timelineChart.selectedDatasets = value;
        }
    },
    {
        type: 'slidetoggle',
        ref: 'toggleSCurve',
        icon: 'fa-chart',
        text: 'Show s-curve',
        checked: true,
        onChange({ checked }) {
            gantt.features.timelineChart.disabled = !checked;
        }
    },
    {
        type: 'slidetoggle',
        ref: 'toggleTasks',
        text: 'Show tasks',
        checked: true,
        onChange({ checked }) {
            DomHelper.toggleClasses(gantt.element, ['b-hide-tasks'], !checked);
        }
    },
    '->',
    {
        type: 'buttonGroup',
        ref: 'zoomButtons',
        defaults: { width: '3.25em' },
        items: {
            zoomInButton: {
                icon: 'fa-search-plus',
                tooltip: 'Zoom in',
                onAction: () => gantt.zoomIn()
            },
            zoomOutButton: {
                icon: 'fa-search-minus',
                tooltip: 'Zoom out',
                onAction: () => gantt.zoomOut()
            },
            previousButton: {
                icon: 'fa-angle-left',
                tooltip: 'Previous time span',
                onAction: () => gantt.shiftPrevious()
            },
            nextButton: {
                icon: 'fa-angle-right',
                tooltip: 'Next time span',
                onAction: () => gantt.shiftNext()
            }
        }
    }
]
```

### 2.2 Initialize Dataset Combo

```javascript
listeners: {
    paint() {
        const { datasets } = this.features.timelineChart;

        // Populate combo with available datasets
        this.widgetMap.datasetCombo.items = datasets;

        // Select first two datasets by default
        this.widgetMap.datasetCombo.value = datasets.slice(0, 2).map(ds => ds.name);
    }
}
```

---

## 3. Custom Data Series

### 3.1 Define Custom Series

```javascript
features: {
    timelineChart: {
        dataProvider: {
            meta: {
                // Built-in duration series (override color)
                duration: {
                    text: 'Duration',
                    color: '#4CAF50'
                },

                // Custom effort series
                effort: {
                    text: 'Effort',
                    color: '#2196F3',
                    callback: (task, start, end, durationDoneToDate, doneDuration, durationInInterval) => {
                        if (durationInInterval > 0 && !task.isMilestone) {
                            return task.effort * (durationInInterval / task.durationMS);
                        }
                        return 0;
                    }
                },

                // Custom cost series
                cost: {
                    text: 'Cost',
                    color: '#FF9800',
                    callback: (task, start, end, durationDoneToDate, doneDuration, durationInInterval) => {
                        if (durationInInterval > 0) {
                            const dailyCost = task.cost || 0;
                            const days = durationInInterval / (24 * 60 * 60 * 1000);
                            return dailyCost * days;
                        }
                        return 0;
                    }
                },

                // Baseline comparison
                baseline: {
                    text: 'Baseline Duration',
                    color: '#9E9E9E',
                    callback: (task) => {
                        return task.baselines?.[0]?.duration || 0;
                    }
                }
            }
        }
    }
}
```

---

## 4. Chart Customization

### 4.1 Tooltip Template

```javascript
chartProvider: {
    tooltipTemplate: function({ dataset, date }) {
        const value = parseInt(dataset.value);
        const days = Math.round(DateHelper.as('d', value) * 100) / 100;
        const formatted = DateHelper.format(date, this.gantt.displayDateFormat);

        return `
            <div class="tooltip-header">${dataset.label}</div>
            <div class="tooltip-value">${days} days</div>
            <div class="tooltip-date">${formatted}</div>
        `;
    }
}
```

---

## 5. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { DateHelper, DomHelper } from '@bryntum/gantt';
import { useState, useRef, useCallback, useEffect } from 'react';

function GanttWithSCurve({ projectData }) {
    const ganttRef = useRef(null);
    const [showCurve, setShowCurve] = useState(true);
    const [showTasks, setShowTasks] = useState(true);
    const [datasets, setDatasets] = useState([]);
    const [selectedDatasets, setSelectedDatasets] = useState([]);

    useEffect(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            const { datasets } = gantt.features.timelineChart;
            setDatasets(datasets);
            setSelectedDatasets(datasets.slice(0, 2).map(ds => ds.name));
        }
    }, []);

    const toggleCurve = useCallback((checked) => {
        setShowCurve(checked);
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.features.timelineChart.disabled = !checked;
        }
    }, []);

    const toggleTasks = useCallback((checked) => {
        setShowTasks(checked);
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            DomHelper.toggleClasses(gantt.element, ['b-hide-tasks'], !checked);
        }
    }, []);

    const handleDatasetChange = useCallback((selected) => {
        setSelectedDatasets(selected);
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.features.timelineChart.selectedDatasets = selected;
        }
    }, []);

    const ganttConfig = {
        columnLines: false,

        columns: [
            { type: 'name', width: 200 },
            { type: 'startdate' },
            { type: 'duration' }
        ],

        features: {
            timelineChart: {
                dataProvider: {
                    meta: {
                        duration: { color: 'green' },
                        effort: {
                            text: 'Effort',
                            color: '#FFCCCC',
                            callback: (task, start, end, durationDoneToDate, doneDuration, durationInInterval) => {
                                if (durationInInterval > 0 && !task.isMilestone) {
                                    return DateHelper.as('ms', task.effort, task.effortUnit) *
                                        (durationInInterval / task.durationMS);
                                }
                                return 0;
                            }
                        }
                    }
                }
            }
        }
    };

    return (
        <div className="gantt-scurve-wrapper">
            <div className="toolbar">
                <select
                    multiple
                    value={selectedDatasets}
                    onChange={(e) => handleDatasetChange(
                        Array.from(e.target.selectedOptions, opt => opt.value)
                    )}
                >
                    {datasets.map(ds => (
                        <option key={ds.name} value={ds.name}>
                            {ds.text}
                        </option>
                    ))}
                </select>
                <label>
                    <input
                        type="checkbox"
                        checked={showCurve}
                        onChange={(e) => toggleCurve(e.target.checked)}
                    />
                    Show S-Curve
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showTasks}
                        onChange={(e) => toggleTasks(e.target.checked)}
                    />
                    Show Tasks
                </label>
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
/* S-Curve container */
.b-timeline-chart {
    background: linear-gradient(to bottom, #f5f5f5, white);
    border-top: 1px solid #e0e0e0;
}

/* Chart line */
.b-timeline-chart .chart-line {
    stroke-width: 2;
    fill: none;
}

/* Chart area fill */
.b-timeline-chart .chart-area {
    opacity: 0.2;
}

/* Series icon in combo */
.b-series-icon {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    display: inline-block;
    margin-right: 8px;
}

/* Tooltip */
.b-timeline-chart-tooltip {
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    padding: 8px 12px;
}

.tooltip-header {
    font-weight: bold;
    margin-bottom: 4px;
}

.tooltip-value {
    font-size: 14px;
    color: #1976d2;
}

.tooltip-date {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
}

/* Hide tasks class */
.b-hide-tasks .b-gantt-task {
    display: none;
}

/* Chart grid lines */
.b-timeline-chart .grid-line {
    stroke: #e0e0e0;
    stroke-width: 1;
}

/* Y-axis labels */
.b-timeline-chart .y-axis-label {
    font-size: 11px;
    fill: #666;
}

/* Legend */
.b-timeline-chart-legend {
    display: flex;
    gap: 16px;
    padding: 8px;
    background: #f5f5f5;
    border-top: 1px solid #e0e0e0;
}

.b-timeline-chart-legend .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Chart niet zichtbaar | Feature disabled | Zet disabled: false |
| Series mist | meta niet gedefinieerd | Voeg series toe aan meta |
| Callback error | Onjuiste parameters | Check callback signature |
| Combo leeg | datasets niet geladen | Wacht op paint event |

---

## API Reference

### TimelineChart Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `disabled` | Boolean | Enable/disable feature |
| `dataProvider` | Object | Data series configuration |
| `chartProvider` | Object | Chart rendering config |
| `selectedDatasets` | String[] | Selected series names |

### DataProvider Meta

| Property | Type | Description |
|----------|------|-------------|
| `text` | String | Series display name |
| `color` | String | Line color |
| `callback` | Function | Value calculator |

### Callback Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `task` | TaskModel | Current task |
| `start` | Date | Period start |
| `end` | Date | Period end |
| `durationDoneToDate` | Number | Cumulative done |
| `doneDuration` | Number | Duration done |
| `durationInInterval` | Number | Duration in period |

---

## Bronnen

- **Example**: `examples/s-curve/`
- **TimelineChart Feature**: `Gantt.feature.TimelineChart`
- **DataProvider**: `Gantt.data.TimelineChartDataProvider`

---

*Priority 2: Medium Priority Features*
