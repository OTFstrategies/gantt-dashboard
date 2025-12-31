# Gantt Implementation: Resource Histogram

> **Resource Histogram** voor het visualiseren van resource allocatie en workload.

---

## Overzicht

Bryntum Gantt's ResourceHistogram toont resource bezetting als staafdiagrammen.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GANTT                                                                     │
├──────────────────────────────────────────────────────────────────────────┤
│  Task Name    │ Resources │          Timeline                           │
│               │           │                                              │
│  Development  │ [👤][👤]  │ ████████████████████████                    │
│  Testing      │ [👤]      │          ████████████████                    │
│               │           │                                              │
╠══════════════════════════════════════════════════════════════════════════╣
│ RESOURCE HISTOGRAM                [x] Bar texts [x] Max allocation [x] Tip│
├──────────────────────────────────────────────────────────────────────────┤
│               │           │  Jan 15    Jan 20    Jan 25    Jan 30       │
│               │           │                                              │
│ ▼ New York                │                                              │
│ 👤 John Doe   │ 3 tasks   │  ████  100%  ──────────────────── max line  │
│               │           │  ████  ████                                  │
│               │           │  ████  ████  ████                           │
│               │           │   80%   80%  120% ⚠                         │
│               │           │                                              │
│ 👤 Jane Smith │ 2 tasks   │  ████                                       │
│               │           │  ████  ████                                  │
│               │           │   60%  100%                                  │
│               │           │                                              │
├───────────────┴───────────┴──────────────────────────────────────────────┤
│                                                                          │
│  HISTOGRAM BARS:                                                         │
│  ████ Normal    ████ Over-allocated (>100%)    ── Max effort line       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic Resource Histogram Setup

### 1.1 Gantt with Histogram

```javascript
import { Gantt, ProjectModel, ResourceHistogram, Splitter } from '@bryntum/gantt';

const project = new ProjectModel({
    startDate: '2024-01-16',
    endDate: '2024-02-13',

    transport: {
        load: {
            url: 'data/data.json'
        }
    },

    autoSetConstraints: true,
    autoLoad: true,
    validateResponse: true
});

// Gantt chart
const gantt = new Gantt({
    project,

    dependencyIdField: 'sequenceNumber',
    resourceImagePath: '../_shared/images/users/',

    collapsible: true,
    header: false,
    minHeight: 0,

    appendTo: 'container',

    features: {
        labels: {
            before: {
                field: 'name',
                editor: { type: 'textfield' }
            }
        }
    },

    viewPreset: 'weekAndDayLetter',
    columnLines: true,

    columns: [
        { type: 'name', width: 280 },
        { type: 'resourceassignment', showAvatars: true, width: 170 }
    ],

    startDate: '2024-01-11'
});

// Splitter between Gantt and Histogram
new Splitter({
    appendTo: 'container',
    showButtons: true
});

// Resource Histogram
const histogram = new ResourceHistogram({
    appendTo: 'container',
    project,
    hideHeaders: true,
    partner: gantt,  // Sync scrolling with Gantt
    rowHeight: 50,
    collapsible: true,
    header: false,
    minHeight: 0,
    showBarTip: true,
    resourceImagePath: '../_shared/images/users/',

    features: {
        scheduleTooltip: false,
        group: {
            field: 'city'  // Group resources by city
        }
    },

    columns: [
        {
            type: 'resourceInfo',
            field: 'name',
            showEventCount: false,
            flex: 1
        }
    ],

    tbar: {
        cls: 'histogram-toolbar',
        items: {
            showBarText: {
                type: 'slidetoggle',
                text: 'Show bar texts',
                tooltip: 'Show resource allocation in the bars',
                checked: false,
                onAction: 'up.onShowBarTextToggle'
            },
            showMaxEffort: {
                type: 'slidetoggle',
                text: 'Show max allocation',
                tooltip: 'Display max resource allocation line',
                checked: true,
                onAction: 'up.onShowMaxAllocationToggle'
            },
            showBarTip: {
                type: 'slidetoggle',
                text: 'Enable bar tooltip',
                tooltip: 'Show tooltips on bar hover',
                checked: true,
                onAction: 'up.onShowBarTipToggle'
            }
        }
    },

    onShowBarTextToggle({ source }) {
        histogram.showBarText = source.checked;
    },

    onShowMaxAllocationToggle({ source }) {
        histogram.showMaxEffort = source.checked;
    },

    onShowBarTipToggle({ source }) {
        histogram.showBarTip = source.checked;
    }
});
```

---

## 2. Histogram Configuration

### 2.1 Display Options

```javascript
const histogram = new ResourceHistogram({
    project,
    partner: gantt,

    // Show allocation percentage in bars
    showBarText: true,

    // Show maximum effort line (100% line)
    showMaxEffort: true,

    // Show tooltip on bar hover
    showBarTip: true,

    // Row height for resource rows
    rowHeight: 50,

    // Resource avatars path
    resourceImagePath: '/images/users/'
});
```

### 2.2 Grouping Resources

```javascript
features: {
    group: {
        field: 'city'  // Group by city
        // Or: field: 'department'
        // Or: field: 'team'
    }
}
```

---

## 3. Column Configuration

### 3.1 ResourceInfo Column

```javascript
columns: [
    {
        type: 'resourceInfo',
        field: 'name',
        showEventCount: false,  // Don't show task count
        flex: 1,
        showImage: true,
        imagePath: '/images/users/'
    }
]
```

### 3.2 Custom Columns

```javascript
columns: [
    {
        type: 'resourceInfo',
        field: 'name',
        flex: 1
    },
    {
        text: 'Role',
        field: 'role',
        width: 100
    },
    {
        text: 'Capacity',
        field: 'maxUnits',
        width: 80,
        renderer({ value }) {
            return `${value * 100}%`;
        }
    }
]
```

---

## 4. Programmatic Control

### 4.1 Toggle Options

```javascript
// Toggle bar text display
histogram.showBarText = true;

// Toggle max effort line
histogram.showMaxEffort = true;

// Toggle bar tooltips
histogram.showBarTip = false;

// Change row height
histogram.rowHeight = 60;
```

### 4.2 Partner Scrolling

```javascript
// Sync histogram with Gantt scrolling
histogram.partner = gantt;

// Remove partner synchronization
histogram.partner = null;
```

---

## 5. React Integration

```jsx
import { BryntumGantt, BryntumResourceHistogram, BryntumSplitter } from '@bryntum/gantt-react';
import { useState, useRef, useCallback } from 'react';

function GanttWithHistogram({ projectData }) {
    const ganttRef = useRef(null);
    const histogramRef = useRef(null);
    const [showBarText, setShowBarText] = useState(false);
    const [showMaxEffort, setShowMaxEffort] = useState(true);
    const [showBarTip, setShowBarTip] = useState(true);

    const toggleBarText = useCallback((checked) => {
        setShowBarText(checked);
        if (histogramRef.current?.instance) {
            histogramRef.current.instance.showBarText = checked;
        }
    }, []);

    const toggleMaxEffort = useCallback((checked) => {
        setShowMaxEffort(checked);
        if (histogramRef.current?.instance) {
            histogramRef.current.instance.showMaxEffort = checked;
        }
    }, []);

    const ganttConfig = {
        columns: [
            { type: 'name', width: 250 },
            { type: 'resourceassignment', showAvatars: true, width: 150 }
        ],
        features: {
            labels: {
                before: { field: 'name' }
            }
        },
        viewPreset: 'weekAndDayLetter'
    };

    const histogramConfig = {
        hideHeaders: true,
        rowHeight: 50,
        showBarText,
        showMaxEffort,
        showBarTip,
        features: {
            scheduleTooltip: false,
            group: { field: 'city' }
        },
        columns: [
            { type: 'resourceInfo', field: 'name', flex: 1 }
        ]
    };

    return (
        <div className="gantt-histogram-wrapper">
            <div className="toolbar">
                <label>
                    <input
                        type="checkbox"
                        checked={showBarText}
                        onChange={(e) => toggleBarText(e.target.checked)}
                    />
                    Show bar texts
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showMaxEffort}
                        onChange={(e) => toggleMaxEffort(e.target.checked)}
                    />
                    Show max allocation
                </label>
            </div>

            <div className="panels-container">
                <BryntumGantt
                    ref={ganttRef}
                    project={projectData}
                    {...ganttConfig}
                />

                <BryntumSplitter showButtons={true} />

                <BryntumResourceHistogram
                    ref={histogramRef}
                    project={projectData}
                    partner={ganttRef.current?.instance}
                    {...histogramConfig}
                />
            </div>
        </div>
    );
}
```

---

## 6. Styling

```css
/* Histogram container */
.b-resourcehistogram {
    border-top: 1px solid #e0e0e0;
}

/* Histogram toolbar */
.histogram-toolbar {
    background: #f5f5f5;
    padding: 8px;
    border-bottom: 1px solid #e0e0e0;
}

/* Resource row */
.b-resourcehistogram .b-grid-row {
    border-bottom: 1px solid #eee;
}

/* Histogram bars */
.b-resourcehistogram .b-histogram-bar {
    background: #4CAF50;
    border-radius: 2px 2px 0 0;
}

/* Over-allocated bars (>100%) */
.b-resourcehistogram .b-histogram-bar.b-overallocated {
    background: #f44336;
}

/* Max effort line */
.b-resourcehistogram .b-max-effort-line {
    stroke: #FF9800;
    stroke-width: 2;
    stroke-dasharray: 4, 2;
}

/* Bar text */
.b-resourcehistogram .b-histogram-bar-text {
    font-size: 10px;
    fill: white;
    font-weight: bold;
}

/* Resource info column */
.b-resourcehistogram .b-resourceinfo-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.b-resourcehistogram .b-resource-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
}

/* Group header */
.b-resourcehistogram .b-group-row {
    background: #f0f0f0;
    font-weight: bold;
}

/* Bar tooltip */
.b-histogram-tooltip {
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
}

.b-histogram-tooltip .b-resource-name {
    font-weight: bold;
    margin-bottom: 4px;
}

.b-histogram-tooltip .b-allocation {
    font-size: 12px;
}

/* Splitter between Gantt and Histogram */
.b-splitter {
    background: #e0e0e0;
}

.b-splitter:hover {
    background: #bdbdbd;
}
```

---

## 7. Data Format

### 7.1 Resource Data

```json
{
    "resources": {
        "rows": [
            {
                "id": 1,
                "name": "John Doe",
                "image": "john.jpg",
                "city": "New York",
                "role": "Developer",
                "maxUnits": 1
            },
            {
                "id": 2,
                "name": "Jane Smith",
                "image": "jane.jpg",
                "city": "New York",
                "role": "Designer",
                "maxUnits": 1
            }
        ]
    },
    "assignments": {
        "rows": [
            { "id": 1, "resource": 1, "event": 1, "units": 100 },
            { "id": 2, "resource": 2, "event": 1, "units": 50 },
            { "id": 3, "resource": 1, "event": 2, "units": 100 }
        ]
    }
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Histogram leeg | Geen assignments | Voeg resource assignments toe |
| Bars niet zichtbaar | Project niet geladen | Wacht op project.load() |
| Scroll niet gesync | partner niet gezet | Zet partner: gantt |
| Over-allocation niet rood | CSS niet geladen | Check CSS import |
| Grouping werkt niet | Group feature disabled | Enable group feature |

---

## API Reference

### ResourceHistogram Config

| Property | Type | Description |
|----------|------|-------------|
| `project` | ProjectModel | Project reference |
| `partner` | Gantt | Sync scroll partner |
| `showBarText` | Boolean | Show % in bars |
| `showMaxEffort` | Boolean | Show 100% line |
| `showBarTip` | Boolean | Enable tooltips |
| `rowHeight` | Number | Row height in pixels |
| `resourceImagePath` | String | Path to resource images |

### ResourceHistogram Features

| Feature | Description |
|---------|-------------|
| `group` | Group resources by field |
| `scheduleTooltip` | Schedule tooltip |

### Column Types

| Type | Description |
|------|-------------|
| `resourceInfo` | Resource name with avatar |

---

## Bronnen

- **Example**: `examples/resourcehistogram/`
- **ResourceHistogram**: `Gantt.view.ResourceHistogram`
- **Splitter**: `Core.widget.Splitter`

---

*Priority 2: Medium Priority Features*
