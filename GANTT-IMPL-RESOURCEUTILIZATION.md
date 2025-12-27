# Gantt Implementation: Resource Utilization

> **Resource Utilization view** voor effort, cost, en material tracking met tijdsfase-weergave.

---

## Overzicht

Bryntum's ResourceUtilization toont resource allocatie per tijdsperiode met effort, cost en material series.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GANTT                                                                     │
├──────────────────────────────────────────────────────────────────────────┤
│  Task Name         │ Resources    │          Timeline                   │
│  Development       │ [👤][👤]     │ ████████████████████                │
│  Testing           │ [👤]         │          ████████████████           │
╠══════════════════════════════════════════════════════════════════════════╣
│ RESOURCE UTILIZATION                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ Display: [Effort] [Cost] [Material]  [x] Tooltip  Group by: [Res,Proj ▼]│
├──────────────────────────────────────────────────────────────────────────┤
│ Resource / Task    │ Date Range  │  Jan 15   Jan 20   Jan 25   Jan 30   │
├────────────────────┼─────────────┼──────────────────────────────────────┤
│ ▼ 👤 John Doe      │             │  16h      24h      16h               │
│   ├ Development    │ Jan 15-25   │  ████     ████     ████              │
│   └ Testing        │ Jan 20-30   │           ████     ████     ████     │
├────────────────────┼─────────────┼──────────────────────────────────────┤
│ ▼ 👤 Jane Smith    │             │  8h       8h                         │
│   └ Development    │ Jan 15-20   │  ████     ████                       │
├────────────────────┴─────────────┴──────────────────────────────────────┤
│                                                                          │
│  SERIES: ████ Effort   ████ Cost   ████ Material                        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic Resource Utilization Setup

### 1.1 TimePhasedProjectModel Setup

```javascript
import {
    TimePhasedTaskModel,
    Gantt,
    TimePhasedProjectModel,
    ResourceUtilization,
    Splitter,
    DateHelper,
    StringHelper,
    AvatarRendering,
    Store
} from '@bryntum/gantt';

// Custom Task Model for project tracking
class Task extends TimePhasedTaskModel {
    static $name = 'Task';

    static fields = [
        { name: 'isProjectTask', type: 'boolean' }
    ];

    // Get the project task this task belongs to
    get projectTask() {
        let result = null;

        this.bubbleWhile(task => {
            if (task.isProjectTask) {
                result = task;
            }
            return !result && task.parent && !task.parent.isRoot;
        });

        return result;
    }
}

const project = new TimePhasedProjectModel({
    taskModelClass: Task,
    loadUrl: 'data/load.json',
    autoLoad: true,
    autoSetConstraints: true,
    validateResponse: true
});
```

### 1.2 Gantt with ResourceUtilization

```javascript
const gantt = new Gantt({
    project,
    dependencyIdField: 'sequenceNumber',
    resourceImagePath: '../_shared/images/users/',
    appendTo: 'container',
    collapsible: true,
    header: false,
    minHeight: 0,
    viewPreset: 'weekAndDay',
    tickSize: 40,
    columnLines: true,
    startDate: '2024-01-16',

    columns: [
        { type: 'name', width: 280 },
        { type: 'resourceassignment', showAvatars: true, width: 170 }
    ]
});

new Splitter({
    appendTo: 'container',
    showButtons: true
});
```

---

## 2. Resource Utilization Configuration

### 2.1 Full Configuration

```javascript
// Grouping functions
const resourceNProjectGroupFns = [
    // Group by resource
    ({ origin }) => {
        if (origin.isResourceModel) {
            return Store.StopBranch;
        }
        origin = origin[0] || origin;
        return origin.resource;
    },
    // Group by project
    ({ origin }) => {
        if (origin.isResourceModel) {
            return Store.StopBranch;
        }
        origin = origin[0] || origin;
        return origin.event?.projectTask || 'No Project';
    }
];

const resourceUtilization = new ResourceUtilization({
    appendTo: 'container',
    project,
    partner: gantt,
    collapsible: true,
    header: false,
    minHeight: 0,
    showBarTip: true,
    resourceImagePath: '../_shared/images/users/',

    // Row height for series data
    rowHeight: 45,

    // Series configuration
    series: {
        cost: { disabled: true },
        quantity: { disabled: true }
    },

    features: {
        treeGroup: {
            levels: resourceNProjectGroupFns
        },
        scheduleContext: {
            keyNavigation: true,
            multiSelect: true
        },
        allocationCellEdit: true,
        allocationCopyPaste: true
    },

    columns: [
        {
            type: 'tree',
            field: 'name',
            width: 280,
            text: 'Resource / Task',
            renderer({ record, grid }) {
                record = grid.resolveRecordToOrigin(record);

                if (record.key?.isResourceModel) {
                    record = record.key;
                } else if (Array.isArray(record)) {
                    record = record[0];
                }

                // Resource row rendering with avatar
                if (record.isResourceModel) {
                    if (!this.avatarRendering) {
                        this.avatarRendering = new AvatarRendering({
                            element: grid.element
                        });
                    }

                    return {
                        class: 'b-resource-info',
                        children: [
                            this.avatarRendering.getResourceAvatar({
                                initials: record.initials,
                                color: record.eventColor,
                                iconCls: record.iconCls,
                                imageUrl: record.image
                                    ? `${grid.resourceImagePath}${record.image}`
                                    : null
                            }),
                            record.name
                        ]
                    };
                }
                // Assignment row
                else if (record.isAssignmentModel) {
                    return StringHelper.encodeHtml(record.event?.name);
                }

                // Group header
                return record.key?.name || record.key;
            }
        },
        {
            text: 'Task date range',
            cellCls: 'task-date-range',
            renderer({ record, grid }) {
                record = grid.resolveRecordToOrigin(record);
                record = record[0] || record;

                if (record.isAssignmentModel) {
                    const task = record.event;
                    return DateHelper.format(task.startDate, 'MMM Do') +
                        ' - ' + DateHelper.format(task.endDate, 'MMM Do');
                }
                return '';
            }
        }
    ]
});
```

---

## 3. Series Configuration

### 3.1 Toggle Series Display

```javascript
tbar: {
    items: {
        displayLabel: {
            type: 'label',
            text: 'Display'
        },
        seriesButtonGroup: {
            type: 'buttongroup',
            rendition: 'padded',
            defaults: { toggleable: true },
            onAction: 'up.onSeriesButtonToggle',
            items: [
                {
                    text: 'Effort',
                    icon: 'b-icon-user',
                    tooltip: 'Show effort',
                    seriesId: 'effort',
                    pressed: true
                },
                {
                    text: 'Cost',
                    icon: 'b-icon-cost',
                    tooltip: 'Show cost',
                    seriesId: 'cost',
                    pressed: false
                },
                {
                    text: 'Material',
                    icon: 'b-icon-material',
                    tooltip: 'Show material expenditure',
                    seriesId: 'quantity',
                    pressed: false
                }
            ]
        }
    }
},

onSeriesButtonToggle({ source }) {
    resourceUtilization.series[source.seriesId].disabled = !source.pressed;
}
```

---

## 4. Grouping Options

### 4.1 Dynamic Grouping

```javascript
tbar: {
    items: {
        groupButtons: {
            type: 'buttongroup',
            rendition: 'padded',
            toggleGroup: true,
            cls: 'group-buttons',
            items: [
                {
                    text: 'Resource, Project',
                    tooltip: 'Group by Resource then Project',
                    pressed: true,
                    supportsPressedClick: true,
                    onAction() {
                        this._groupDirection = !this._groupDirection;

                        if (this._groupDirection) {
                            this.icon = 'fa fa-arrow-up';
                            // Reverse order: Project then Resource
                            resourceUtilization.group([...resourceNProjectGroupFns].reverse());
                        } else {
                            this.icon = 'fa fa-arrow-down';
                            resourceUtilization.group(resourceNProjectGroupFns);
                        }
                    }
                },
                {
                    text: 'City, Resource',
                    tooltip: 'Group by City and Resource',
                    onAction() {
                        resourceUtilization.group([
                            // By city
                            ({ origin }) => origin.isResourceModel
                                ? origin.city
                                : origin.resource.city,
                            // By resource
                            ({ origin }) => origin.isResourceModel
                                ? Store.StopBranch
                                : origin.resource
                        ]);
                    }
                },
                {
                    text: 'Default',
                    tooltip: 'Reset grouping to default',
                    onAction() {
                        resourceUtilization.clearGroups();
                    }
                }
            ]
        }
    }
}
```

---

## 5. React Integration

```jsx
import { BryntumGantt, BryntumResourceUtilization, BryntumSplitter } from '@bryntum/gantt-react';
import { useState, useRef, useCallback } from 'react';

function GanttWithUtilization({ projectData }) {
    const ganttRef = useRef(null);
    const utilizationRef = useRef(null);
    const [showEffort, setShowEffort] = useState(true);
    const [showCost, setShowCost] = useState(false);
    const [showMaterial, setShowMaterial] = useState(false);

    const toggleSeries = useCallback((seriesId, enabled) => {
        const utilization = utilizationRef.current?.instance;
        if (utilization) {
            utilization.series[seriesId].disabled = !enabled;
        }
    }, []);

    const ganttConfig = {
        columns: [
            { type: 'name', width: 250 },
            { type: 'resourceassignment', showAvatars: true, width: 150 }
        ],
        viewPreset: 'weekAndDay'
    };

    const utilizationConfig = {
        rowHeight: 45,
        showBarTip: true,
        series: {
            effort: { disabled: !showEffort },
            cost: { disabled: !showCost },
            quantity: { disabled: !showMaterial }
        },
        features: {
            allocationCellEdit: true,
            allocationCopyPaste: true
        },
        columns: [
            { type: 'tree', field: 'name', width: 250, text: 'Resource / Task' }
        ]
    };

    return (
        <div className="gantt-utilization-wrapper">
            <div className="toolbar">
                <span>Display:</span>
                <label>
                    <input
                        type="checkbox"
                        checked={showEffort}
                        onChange={(e) => {
                            setShowEffort(e.target.checked);
                            toggleSeries('effort', e.target.checked);
                        }}
                    />
                    Effort
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showCost}
                        onChange={(e) => {
                            setShowCost(e.target.checked);
                            toggleSeries('cost', e.target.checked);
                        }}
                    />
                    Cost
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showMaterial}
                        onChange={(e) => {
                            setShowMaterial(e.target.checked);
                            toggleSeries('quantity', e.target.checked);
                        }}
                    />
                    Material
                </label>
            </div>

            <div className="panels-container">
                <BryntumGantt
                    ref={ganttRef}
                    project={projectData}
                    {...ganttConfig}
                />

                <BryntumSplitter showButtons={true} />

                <BryntumResourceUtilization
                    ref={utilizationRef}
                    project={projectData}
                    partner={ganttRef.current?.instance}
                    {...utilizationConfig}
                />
            </div>
        </div>
    );
}
```

---

## 6. Styling

```css
/* Resource Utilization container */
.b-resourceutilization {
    border-top: 1px solid #e0e0e0;
}

/* Utilization toolbar */
.utilization-toolbar {
    background: #f5f5f5;
    padding: 8px;
    border-bottom: 1px solid #e0e0e0;
}

/* Series bars */
.b-resourceutilization .b-effort-bar {
    background: #4CAF50;
}

.b-resourceutilization .b-cost-bar {
    background: #2196F3;
}

.b-resourceutilization .b-quantity-bar {
    background: #FF9800;
}

/* Over-allocation */
.b-resourceutilization .b-overallocated {
    background: #f44336;
}

/* Resource info cell */
.b-resource-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* Task date range column */
.task-date-range {
    font-size: 11px;
    color: #666;
}

/* Group buttons */
.group-buttons {
    margin-left: 16px;
}

/* Cell tooltips */
.b-utilization-tooltip {
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
}

/* Series legend */
.series-legend {
    display: flex;
    gap: 16px;
    padding: 8px;
}

.series-legend .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.series-legend .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Geen data zichtbaar | Project niet geladen | Wacht op project.load() |
| Series niet zichtbaar | series.disabled: true | Zet disabled: false |
| Scroll niet gesync | partner niet gezet | Zet partner: gantt |
| Grouping werkt niet | TreeGroup feature mist | Enable treeGroup feature |
| Cell edit werkt niet | Feature disabled | Enable allocationCellEdit |

---

## API Reference

### ResourceUtilization Config

| Property | Type | Description |
|----------|------|-------------|
| `project` | ProjectModel | Project reference |
| `partner` | Gantt | Sync scroll partner |
| `showBarTip` | Boolean | Enable cell tooltips |
| `rowHeight` | Number | Row height |
| `series` | Object | Series configuration |
| `resourceImagePath` | String | Path to images |

### Series Config

| Series | Description |
|--------|-------------|
| `effort` | Resource effort in hours |
| `cost` | Resource cost |
| `quantity` | Material quantity |

### Features

| Feature | Description |
|---------|-------------|
| `treeGroup` | Multi-level grouping |
| `scheduleContext` | Cell navigation/selection |
| `allocationCellEdit` | Edit allocations |
| `allocationCopyPaste` | Copy/paste allocations |

---

## Bronnen

- **Example**: `examples/resourceutilization/`
- **ResourceUtilization**: `Gantt.view.ResourceUtilization`
- **TimePhasedProjectModel**: `Gantt.model.TimePhasedProjectModel`

---

*Priority 2: Medium Priority Features*
