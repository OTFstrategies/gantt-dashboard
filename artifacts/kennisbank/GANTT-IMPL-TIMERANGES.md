# Gantt Implementation: Time Ranges

> **Time Ranges** voor het highlighten van periodes, deadlines, en belangrijke tijdspannen.

---

## Overzicht

Bryntum Gantt's TimeRanges feature toont visuele markers voor belangrijke tijdsperioden.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GANTT                          [x] Show header elements                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Task Name    │          Feb 15      Feb 20      Feb 25      Mar 01     │
│               │            │            │           │           │        │
│               │            ▼ Sprint 1   │           │           │        │
│               │     ┌──────────────────┐│           │           │        │
│  Development  │─────│████████████████ ││           │           │        │
│               │     └──────────────────┘│           │           │        │
│               │                         ▼ Review    ▼ Deadline  │        │
│               │                  ┌──────────────────────────────┐        │
│  Testing      │──────────────────│█████████████████████████████ │        │
│               │                  └──────────────────────────────┘        │
│               │                                                          │
├───────────────┴──────────────────────────────────────────────────────────┤
│                                                                          │
│  TIME RANGE TYPES:                                                       │
│  │░░│ Duration range    │▼│ Point in time    │▓▓│ Current time          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic TimeRanges Setup

### 1.1 Enable TimeRanges Feature

```javascript
import { Gantt, ProjectModel, DateHelper, StringHelper } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    loadUrl: '../_datasets/timeranges.json'
});

const gantt = new Gantt({
    appendTo: 'container',
    flex: '1 1 auto',
    project,

    dependencyIdField: 'sequenceNumber',

    columns: [
        {
            type: 'name',
            field: 'name',
            width: 250
        }
    ],

    features: {
        timeRanges: {
            // Allow resizing time ranges
            enableResizing: true,

            // Show/hide current time line
            showCurrentTimeLine: false,

            // Show header elements for time ranges
            showHeaderElements: true,

            // Enable instant update while resizing
            instantUpdate: true,

            // Custom header renderer
            headerRenderer({ timeRange }) {
                return DateHelper.format(timeRange.startDate, 'MMM DD') +
                    ' ' + StringHelper.encodeHtml(timeRange.name);
            }
        }
    },

    tbar: [
        {
            type: 'slidetoggle',
            text: 'Show header elements',
            tooltip: 'Toggles the rendering of time range header elements',
            checked: true,
            onChange({ checked }) {
                gantt.features.timeRanges.showHeaderElements = checked;
            }
        }
    ]
});

project.load();
```

### 1.2 TimeRanges Data Format

```json
{
    "timeRanges": {
        "rows": [
            {
                "id": 1,
                "name": "Sprint 1",
                "startDate": "2024-02-15",
                "duration": 10,
                "cls": "sprint-range"
            },
            {
                "id": 2,
                "name": "Review Period",
                "startDate": "2024-02-20",
                "duration": 5,
                "cls": "review-range"
            },
            {
                "id": 3,
                "name": "Deadline",
                "startDate": "2024-02-25",
                "cls": "deadline-marker"
            }
        ]
    }
}
```

---

## 2. TimeRanges Grid (Editor)

### 2.1 Custom Grid for Managing TimeRanges

```javascript
import { Grid, Gantt, ProjectModel, Splitter } from '@bryntum/gantt';

// Custom TimeRanges Grid class
class TimeRangesGrid extends Grid {
    static type = 'timerangesgrid';

    static configurable = {
        cls: 'time-ranges-grid',

        features: {
            stripe: true,
            sort: 'startDate'
        },

        columns: [
            {
                text: 'Time ranges',
                flex: 1,
                field: 'name'
            },
            {
                type: 'date',
                text: 'Start Date',
                width: 120,
                align: 'right',
                field: 'startDate'
            },
            {
                type: 'number',
                text: 'Duration',
                width: 100,
                field: 'duration',
                min: 0,
                instantUpdate: true,
                renderer: ({ record }) =>
                    typeof record.duration === 'number'
                        ? `${record.duration} d`
                        : ''
            }
        ]
    };
}

// Register the grid type
TimeRangesGrid.initClass();

// Setup Gantt with TimeRanges Grid
const project = new ProjectModel({
    loadUrl: '../_datasets/timeranges.json'
});

const gantt = new Gantt({
    appendTo: 'main',
    flex: '1 1 auto',
    project,

    features: {
        timeRanges: {
            enableResizing: true,
            showHeaderElements: true
        }
    }
});

project.load();

// Get the time range store from the feature
const timeRangeStore = gantt.features.timeRanges.store;

// Add splitter between Gantt and Grid
new Splitter({
    appendTo: 'main',
    showButtons: 'end'
});

// Create the TimeRanges Grid
new TimeRangesGrid({
    appendTo: 'main',
    flex: '0 0 370px',
    store: timeRangeStore,
    collapsible: true,
    header: false,
    disableGridRowModelWarning: true,

    tbar: [
        {
            type: 'button',
            text: 'Add time range',
            icon: 'fa-plus',
            color: 'b-blue',
            onClick() {
                timeRangeStore.add({
                    name: 'New range',
                    startDate: new Date(2024, 1, 27),
                    duration: 5
                });
            }
        }
    ]
});
```

---

## 3. Current Time Line

### 3.1 Show Current Time

```javascript
features: {
    timeRanges: {
        showCurrentTimeLine: true
    }
}
```

### 3.2 Custom Current Time Line

```javascript
features: {
    timeRanges: {
        showCurrentTimeLine: {
            name: 'Now',
            cls: 'current-time-marker'
        }
    }
}
```

---

## 4. Programmatic TimeRange Management

### 4.1 Add TimeRanges

```javascript
// Access the time range store
const timeRangeStore = gantt.features.timeRanges.store;

// Add a single time range
timeRangeStore.add({
    name: 'Sprint Review',
    startDate: new Date(2024, 2, 1),
    duration: 2,
    cls: 'review-range'
});

// Add multiple time ranges
timeRangeStore.add([
    {
        name: 'Planning',
        startDate: new Date(2024, 2, 5),
        duration: 1
    },
    {
        name: 'Deployment',
        startDate: new Date(2024, 2, 15),
        duration: 1,
        cls: 'deployment-range'
    }
]);
```

### 4.2 Update TimeRanges

```javascript
// Find and update a time range
const range = timeRangeStore.getById(1);
if (range) {
    range.name = 'Updated Sprint';
    range.duration = 14;
}

// Batch update
timeRangeStore.beginBatch();
timeRangeStore.forEach(range => {
    if (range.duration < 5) {
        range.duration = 5;
    }
});
timeRangeStore.endBatch();
```

### 4.3 Remove TimeRanges

```javascript
// Remove by id
timeRangeStore.remove(1);

// Remove multiple
timeRangeStore.remove([1, 2, 3]);

// Clear all
timeRangeStore.removeAll();
```

---

## 5. TimeRange Configuration

### 5.1 TimeRange Properties

```javascript
{
    id: 1,
    name: 'Sprint 1',
    startDate: '2024-02-15',
    endDate: '2024-02-25',      // Either endDate or duration
    duration: 10,                // Days
    durationUnit: 'day',         // 'day', 'week', 'month'
    cls: 'custom-class',         // CSS class
    style: 'background: rgba(255,0,0,0.1)',  // Inline style
    iconCls: 'fa fa-flag',       // Icon for header
    recurrenceRule: 'FREQ=WEEKLY' // Recurring range
}
```

### 5.2 Recurring TimeRanges

```javascript
{
    name: 'Weekly Standup',
    startDate: '2024-02-05',
    duration: 0.5,
    durationUnit: 'hour',
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO'
}
```

---

## 6. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useCallback, useRef, useEffect } from 'react';

function GanttWithTimeRanges({ projectData }) {
    const ganttRef = useRef(null);
    const [showHeaders, setShowHeaders] = useState(true);
    const [timeRanges, setTimeRanges] = useState([
        { id: 1, name: 'Sprint 1', startDate: '2024-02-01', duration: 14 },
        { id: 2, name: 'Review', startDate: '2024-02-15', duration: 3 }
    ]);

    const addTimeRange = useCallback(() => {
        const store = ganttRef.current?.instance.features.timeRanges.store;
        if (store) {
            store.add({
                name: 'New Range',
                startDate: new Date(),
                duration: 7
            });
        }
    }, []);

    const toggleHeaders = useCallback((checked) => {
        setShowHeaders(checked);
        if (ganttRef.current?.instance) {
            ganttRef.current.instance.features.timeRanges.showHeaderElements = checked;
        }
    }, []);

    const ganttConfig = {
        columns: [
            { type: 'name', width: 200 }
        ],

        features: {
            timeRanges: {
                enableResizing: true,
                showCurrentTimeLine: true,
                showHeaderElements: showHeaders,
                instantUpdate: true
            }
        }
    };

    const projectConfig = {
        timeRangesData: timeRanges,
        ...projectData
    };

    return (
        <div className="gantt-timeranges-wrapper">
            <div className="toolbar">
                <button onClick={addTimeRange}>
                    Add Time Range
                </button>
                <label>
                    <input
                        type="checkbox"
                        checked={showHeaders}
                        onChange={(e) => toggleHeaders(e.target.checked)}
                    />
                    Show header elements
                </label>
            </div>

            <BryntumGantt
                ref={ganttRef}
                project={projectConfig}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 7. Styling

```css
/* Base time range styling */
.b-sch-timerange {
    background: rgba(100, 100, 255, 0.1);
    border-left: 2px solid rgba(100, 100, 255, 0.5);
    border-right: 2px solid rgba(100, 100, 255, 0.5);
}

/* Time range header element */
.b-sch-header-timerange-indicator {
    background: #2196F3;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: bold;
}

/* Sprint range */
.sprint-range {
    background: rgba(33, 150, 243, 0.15);
    border-left: 3px solid #2196F3;
    border-right: 3px solid #2196F3;
}

.sprint-range .b-sch-header-timerange-indicator {
    background: #2196F3;
}

/* Review range */
.review-range {
    background: rgba(255, 152, 0, 0.15);
    border-left: 3px solid #FF9800;
    border-right: 3px solid #FF9800;
}

.review-range .b-sch-header-timerange-indicator {
    background: #FF9800;
}

/* Deadline marker (point in time) */
.deadline-marker {
    background: transparent;
    border-left: 2px dashed #f44336;
}

.deadline-marker .b-sch-header-timerange-indicator {
    background: #f44336;
}

/* Current time line */
.b-sch-current-time {
    border-left: 2px solid #4CAF50;
    z-index: 10;
}

.b-sch-current-time .b-sch-header-timerange-indicator {
    background: #4CAF50;
}

/* Time range resize handles */
.b-sch-timerange-resize-handle {
    width: 6px;
    background: rgba(0, 0, 0, 0.2);
    cursor: ew-resize;
}

.b-sch-timerange-resize-handle:hover {
    background: rgba(0, 0, 0, 0.4);
}

/* TimeRanges Grid styling */
.time-ranges-grid {
    border-left: 1px solid #e0e0e0;
}

.time-ranges-grid .b-grid-row:nth-child(odd) {
    background: #fafafa;
}

/* Deployment range */
.deployment-range {
    background: repeating-linear-gradient(
        45deg,
        rgba(156, 39, 176, 0.1),
        rgba(156, 39, 176, 0.1) 10px,
        rgba(156, 39, 176, 0.2) 10px,
        rgba(156, 39, 176, 0.2) 20px
    );
    border-left: 3px solid #9C27B0;
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| TimeRanges niet zichtbaar | Feature disabled | Enable timeRanges feature |
| Header elements niet zichtbaar | showHeaderElements: false | Zet showHeaderElements: true |
| Resize werkt niet | enableResizing: false | Zet enableResizing: true |
| Current time niet zichtbaar | showCurrentTimeLine: false | Enable showCurrentTimeLine |
| Custom styling niet toegepast | cls niet gezet | Voeg cls toe aan timeRange config |

---

## API Reference

### TimeRanges Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `enableResizing` | Boolean | Allow resizing time ranges |
| `showCurrentTimeLine` | Boolean/Object | Show current time marker |
| `showHeaderElements` | Boolean | Show header indicators |
| `instantUpdate` | Boolean | Update while resizing |
| `headerRenderer` | Function | Custom header rendering |

### TimeRange Model Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | String | Display name |
| `startDate` | Date | Start date |
| `endDate` | Date | End date |
| `duration` | Number | Duration value |
| `durationUnit` | String | Duration unit |
| `cls` | String | CSS class |
| `iconCls` | String | Icon class |
| `recurrenceRule` | String | Recurrence rule |

### TimeRanges Store

| Method | Description |
|--------|-------------|
| `add(data)` | Add time range(s) |
| `remove(id)` | Remove time range(s) |
| `getById(id)` | Get by ID |
| `removeAll()` | Clear all ranges |

---

## Bronnen

- **Example**: `examples/timeranges/`
- **TimeRanges Feature**: `Gantt.feature.TimeRanges`
- **TimeRangeModel**: `Scheduler.model.TimeRange`

---

*Priority 2: Medium Priority Features*
