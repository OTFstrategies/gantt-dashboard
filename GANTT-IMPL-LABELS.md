# Gantt Implementation: Task Labels

> **Task labels** voor het tonen van informatie boven, onder, voor, en na task bars.

---

## Overzicht

Bryntum Gantt's Labels feature toont tekst labels rond task bars.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GANTT                    [Top+Bottom] [Before+After] [Show All]          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Task Name    │                    Timeline                             │
│               │                                                          │
│               │              ┌─ top label: "Development" ─┐              │
│  Development  │     Id: 5    │██████████████████████████████│  10 days   │
│               │  before label└── bottom: "15-Jan-2024" ───┘  after label │
│               │                                                          │
│               │              ┌─ top label: "Testing" ─┐                  │
│  Testing      │     Id: 6    │████████████████████████│  7 days          │
│               │              └── bottom: "25-Jan-2024" ┘                 │
│               │                                                          │
├───────────────┴──────────────────────────────────────────────────────────┤
│                                                                          │
│  LABEL POSITIONS:                                                        │
│  ↑ top    ↓ bottom    ← before    → after                               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic Labels Setup

### 1.1 Simple Label Configuration

```javascript
import { Gantt, DateHelper } from '@bryntum/gantt';

// Label configurations
const topLabel = {
    field: 'name',
    editor: {
        type: 'textfield'
    }
};

const bottomLabel = {
    field: 'startDate',
    renderer({ taskRecord }) {
        return DateHelper.format(taskRecord.startDate, 'DD-MMM-Y');
    }
};

const beforeLabel = {
    renderer({ taskRecord }) {
        return 'Id: ' + taskRecord.id;
    }
};

const afterLabel = {
    renderer({ taskRecord }) {
        const duration = taskRecord.duration || '?';
        const unit = DateHelper.getLocalizedNameOfUnit(
            taskRecord.durationUnit,
            taskRecord.duration !== 1
        );
        return `${duration} ${unit}`;
    }
};

const gantt = new Gantt({
    appendTo: 'container',

    startDate: '2024-01-08',
    endDate: '2024-04-01',

    project: {
        autoSetConstraints: true,
        autoLoad: true,
        transport: {
            load: {
                url: '../_datasets/launch-saas.json'
            }
        }
    },

    dependencyIdField: 'sequenceNumber',

    columns: [
        { type: 'name', field: 'name', text: 'Name', width: 250 }
    ],

    viewPreset: 'weekAndDayLetter',

    // Higher row for label visibility
    rowHeight: 70,
    barMargin: 5,

    features: {
        labels: {
            top: topLabel,
            bottom: bottomLabel,
            before: null,  // Disabled
            after: null    // Disabled
        }
    }
});
```

---

## 2. Label Configurations

### 2.1 Toggle Label Positions

```javascript
const gantt = new Gantt({
    appendTo: 'container',

    rowHeight: 70,
    barMargin: 5,

    features: {
        labels: {
            top: topLabel,
            bottom: bottomLabel,
            before: null,
            after: null
        }
    },

    tbar: [
        {
            type: 'buttonGroup',
            toggleGroup: true,
            defaults: {
                width: '9em'
            },
            items: [
                {
                    text: 'Top + Bottom',
                    ref: 'topAndBottomLabels',
                    pressed: true,
                    ganttConfig: {
                        rowHeight: 70,
                        barMargin: 5
                    },
                    labelsFeatureConfig: {
                        top: topLabel,
                        bottom: bottomLabel,
                        before: null,
                        after: null
                    }
                },
                {
                    text: 'Before + After',
                    ref: 'beforeAndAfterLabels',
                    ganttConfig: {
                        rowHeight: 45,
                        barMargin: 10
                    },
                    labelsFeatureConfig: {
                        top: null,
                        bottom: null,
                        before: beforeLabel,
                        after: afterLabel
                    }
                },
                {
                    text: 'Show All',
                    ref: 'allLabels',
                    ganttConfig: {
                        rowHeight: 70,
                        barMargin: 5
                    },
                    labelsFeatureConfig: {
                        top: topLabel,
                        bottom: bottomLabel,
                        before: beforeLabel,
                        after: afterLabel
                    }
                }
            ],
            onAction({ source: button }) {
                gantt.suspendRefresh();
                gantt.features.labels.setConfig(button.labelsFeatureConfig);
                gantt.rowHeight = button.ganttConfig.rowHeight;
                gantt.barMargin = button.ganttConfig.barMargin;
                gantt.resumeRefresh();
            }
        }
    ]
});
```

---

## 3. Custom Label Renderers

### 3.1 Date Label

```javascript
const bottomLabel = {
    field: 'startDate',
    renderer({ taskRecord }) {
        return DateHelper.format(taskRecord.startDate, 'DD-MMM-Y');
    }
};
```

### 3.2 Duration Label

```javascript
const afterLabel = {
    renderer({ taskRecord }) {
        const duration = taskRecord.duration || '?';
        const unit = DateHelper.getLocalizedNameOfUnit(
            taskRecord.durationUnit,
            taskRecord.duration !== 1  // Plural?
        );
        return `${duration} ${unit}`;
    }
};
```

### 3.3 Progress Label

```javascript
const bottomLabel = {
    renderer({ taskRecord }) {
        return `${taskRecord.percentDone}% complete`;
    }
};
```

### 3.4 Resource Label

```javascript
const afterLabel = {
    renderer({ taskRecord }) {
        const resources = taskRecord.resources;
        if (resources.length === 0) return 'Unassigned';
        if (resources.length === 1) return resources[0].name;
        return `${resources.length} resources`;
    }
};
```

### 3.5 Status Label with Icon

```javascript
const beforeLabel = {
    renderer({ taskRecord }) {
        if (taskRecord.critical) {
            return '<i class="fa fa-exclamation-triangle"></i> Critical';
        }
        return '';
    }
};
```

---

## 4. Editable Labels

### 4.1 Text Field Editor

```javascript
const topLabel = {
    field: 'name',
    editor: {
        type: 'textfield'
    }
};
```

### 4.2 Date Field Editor

```javascript
const bottomLabel = {
    field: 'startDate',
    renderer({ taskRecord }) {
        return DateHelper.format(taskRecord.startDate, 'DD-MMM-Y');
    },
    editor: {
        type: 'datefield',
        format: 'DD-MMM-Y'
    }
};
```

### 4.3 Number Field Editor

```javascript
const afterLabel = {
    field: 'duration',
    renderer({ taskRecord }) {
        return `${taskRecord.duration} days`;
    },
    editor: {
        type: 'numberfield',
        min: 1,
        max: 100
    }
};
```

---

## 5. Dynamic Label Configuration

### 5.1 Change Labels Programmatically

```javascript
// Update label configuration
gantt.features.labels.setConfig({
    top: { field: 'name' },
    bottom: null,
    before: null,
    after: { field: 'duration' }
});

// Adjust row height for label visibility
gantt.rowHeight = 60;
gantt.barMargin = 8;
```

### 5.2 Conditional Labels

```javascript
const conditionalLabel = {
    renderer({ taskRecord }) {
        // Show different content based on task state
        if (taskRecord.isMilestone) {
            return `Milestone: ${taskRecord.name}`;
        }
        if (taskRecord.critical) {
            return `⚠ ${taskRecord.name} (Critical Path)`;
        }
        return taskRecord.name;
    }
};
```

---

## 6. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { DateHelper } from '@bryntum/gantt';
import { useState, useCallback, useRef } from 'react';

function GanttWithLabels({ projectData }) {
    const ganttRef = useRef(null);
    const [labelMode, setLabelMode] = useState('topBottom');

    const labelConfigs = {
        topBottom: {
            top: { field: 'name' },
            bottom: {
                renderer: ({ taskRecord }) =>
                    DateHelper.format(taskRecord.startDate, 'DD-MMM-Y')
            },
            before: null,
            after: null
        },
        beforeAfter: {
            top: null,
            bottom: null,
            before: {
                renderer: ({ taskRecord }) => `Id: ${taskRecord.id}`
            },
            after: {
                renderer: ({ taskRecord }) => `${taskRecord.duration || '?'} days`
            }
        },
        all: {
            top: { field: 'name' },
            bottom: {
                renderer: ({ taskRecord }) =>
                    DateHelper.format(taskRecord.startDate, 'DD-MMM-Y')
            },
            before: {
                renderer: ({ taskRecord }) => `Id: ${taskRecord.id}`
            },
            after: {
                renderer: ({ taskRecord }) => `${taskRecord.duration || '?'} days`
            }
        }
    };

    const rowHeights = {
        topBottom: 70,
        beforeAfter: 45,
        all: 70
    };

    const handleModeChange = useCallback((mode) => {
        setLabelMode(mode);

        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.suspendRefresh();
            gantt.features.labels.setConfig(labelConfigs[mode]);
            gantt.rowHeight = rowHeights[mode];
            gantt.resumeRefresh();
        }
    }, []);

    const ganttConfig = {
        rowHeight: rowHeights[labelMode],
        barMargin: 5,
        viewPreset: 'weekAndDayLetter',

        columns: [
            { type: 'name', width: 200 }
        ],

        features: {
            labels: labelConfigs[labelMode]
        }
    };

    return (
        <div className="gantt-labels-wrapper">
            <div className="toolbar">
                <button
                    onClick={() => handleModeChange('topBottom')}
                    className={labelMode === 'topBottom' ? 'active' : ''}
                >
                    Top + Bottom
                </button>
                <button
                    onClick={() => handleModeChange('beforeAfter')}
                    className={labelMode === 'beforeAfter' ? 'active' : ''}
                >
                    Before + After
                </button>
                <button
                    onClick={() => handleModeChange('all')}
                    className={labelMode === 'all' ? 'active' : ''}
                >
                    Show All
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

## 7. Styling

```css
/* Task label base styling */
.b-gantt-task-label {
    font-size: 11px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Top label */
.b-gantt-task-label-top {
    font-weight: bold;
    color: #333;
    margin-bottom: 2px;
}

/* Bottom label */
.b-gantt-task-label-bottom {
    font-style: italic;
    color: #888;
    margin-top: 2px;
}

/* Before label */
.b-gantt-task-label-before {
    color: #666;
    padding-right: 8px;
}

/* After label */
.b-gantt-task-label-after {
    color: #666;
    padding-left: 8px;
}

/* Critical task label */
.b-gantt-task.b-critical .b-gantt-task-label-top {
    color: #f44336;
}

/* Milestone label */
.b-milestone .b-gantt-task-label-top {
    font-weight: bold;
    color: #9C27B0;
}

/* Editable label hover */
.b-gantt-task-label[data-editable]:hover {
    background: rgba(33, 150, 243, 0.1);
    cursor: text;
}

/* Icon in label */
.b-gantt-task-label .fa {
    margin-right: 4px;
}

/* Truncation with tooltip */
.b-gantt-task-label.b-truncated {
    max-width: 150px;
}

/* Label toolbar buttons */
.toolbar button.active {
    background: #2196F3;
    color: white;
}
```

---

## 8. Row Height Considerations

| Label Mode | Recommended rowHeight | barMargin |
|------------|----------------------|-----------|
| Top + Bottom | 70px | 5px |
| Before + After | 45px | 10px |
| All labels | 70-80px | 5px |
| No labels | 35-45px | 8px |

---

## 9. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Labels niet zichtbaar | Feature disabled | Enable labels feature |
| Labels afgesneden | rowHeight te klein | Verhoog rowHeight |
| Editor werkt niet | editor config mist | Voeg editor toe aan label |
| Renderer error | Return value incorrect | Check renderer return |
| Overlap met bars | barMargin te klein | Verhoog barMargin |

---

## API Reference

### Labels Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `top` | Object/null | Top label config |
| `bottom` | Object/null | Bottom label config |
| `before` | Object/null | Before label config |
| `after` | Object/null | After label config |

### Label Config Properties

| Property | Type | Description |
|----------|------|-------------|
| `field` | String | Data field to display |
| `renderer` | Function | Custom render function |
| `editor` | Object | Editor configuration |

### Renderer Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `taskRecord` | TaskModel | The task being rendered |

### Methods

| Method | Description |
|--------|-------------|
| `setConfig(config)` | Update all label configs |

---

## Bronnen

- **Example**: `examples/labels/`
- **Labels Feature**: `Gantt.feature.Labels`
- **DateHelper**: `Core.helper.DateHelper`

---

*Priority 2: Medium Priority Features*
