# Gantt Implementation: Split Tasks

> **Split Tasks** voor taken die onderbroken worden en in segmenten worden uitgevoerd.

---

## Overzicht

Bryntum Gantt ondersteunt split tasks - taken die in meerdere segmenten zijn verdeeld.

```
+--------------------------------------------------------------------------+
| GANTT                              [x] Custom styling                    |
+--------------------------------------------------------------------------+
|                                                                          |
|  Task Name          |         Timeline                                   |
+--------------------------------------------------------------------------+
|                     |    Mon      Tue      Wed      Thu      Fri        |
|                     |     |        |        |        |        |         |
|  Development        |  ┌──────┐ ░░░ ┌──────┐ ░░░ ┌──────┐              |
|                     |  │Seg 1 │     │Seg 2 │     │Seg 3 │              |
|                     |  └──────┘     └──────┘     └──────┘              |
|                     |                                                    |
|  Testing            |     ┌────────────┐ ░░░ ┌────────────┐            |
|                     |     │  Part A    │     │  Part B    │            |
|                     |     └────────────┘     └────────────┘            |
|                     |                                                    |
|  Deployment         |  ████████████████████████████████████            |
|                     |  (single segment - not split)                     |
|                                                                          |
|  SPLIT TASK CONCEPTS:                                                    |
|    ┌──────┐ = Task segment    ░░░ = Gap between segments                |
|    Each segment has its own name, start, and duration                   |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Split Tasks Setup

### 1.1 Enable Split Tasks

```javascript
import { Gantt, StringHelper } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',

    cls: 'custom-styling',

    project: {
        autoSetConstraints: true,
        autoLoad: true,
        loadUrl: '../_datasets/split-tasks.json'
    },

    columns: [
        { type: 'name', width: 250 }
    ],

    features: {
        nonWorkingTime: {
            disabled: true
        },
        percentBar: {
            disabled: true
        }
    },

    tickSize: 70,

    // Custom task content
    taskRenderer({ taskRecord }) {
        // Display segment names
        if (taskRecord.isEventSegment) {
            return StringHelper.encodeHtml(taskRecord.name);
        }

        return '';
    }
});
```

---

## 2. Toolbar Toggle

### 2.1 Custom Styling Toggle

```javascript
tbar: [
    {
        type: 'slidetoggle',
        text: 'Custom styling',
        icon: 'fa-square',
        pressedIcon: 'fa-check-square',
        checked: true,
        onChange({ checked }) {
            gantt.element.classList.toggle('custom-styling', checked);
            gantt.features.nonWorkingTime.disabled = checked;
            gantt.features.percentBar.disabled = checked;
        }
    }
]
```

---

## 3. Split Task Data Format

### 3.1 JSON Data Structure

```json
{
    "tasks": {
        "rows": [
            {
                "id": 1,
                "name": "Development",
                "startDate": "2024-01-15",
                "segments": [
                    {
                        "id": 101,
                        "name": "Segment 1",
                        "startDate": "2024-01-15",
                        "duration": 2
                    },
                    {
                        "id": 102,
                        "name": "Segment 2",
                        "startDate": "2024-01-18",
                        "duration": 2
                    },
                    {
                        "id": 103,
                        "name": "Segment 3",
                        "startDate": "2024-01-22",
                        "duration": 2
                    }
                ]
            },
            {
                "id": 2,
                "name": "Testing",
                "startDate": "2024-01-16",
                "segments": [
                    {
                        "id": 201,
                        "name": "Part A",
                        "startDate": "2024-01-16",
                        "duration": 3
                    },
                    {
                        "id": 202,
                        "name": "Part B",
                        "startDate": "2024-01-22",
                        "duration": 3
                    }
                ]
            },
            {
                "id": 3,
                "name": "Deployment",
                "startDate": "2024-01-15",
                "duration": 10
            }
        ]
    }
}
```

---

## 4. Segment Rendering

### 4.1 Custom Segment Renderer

```javascript
taskRenderer({ taskRecord }) {
    // Check if this is a segment
    if (taskRecord.isEventSegment) {
        return {
            tag: 'div',
            class: 'segment-content',
            children: [
                {
                    tag: 'span',
                    class: 'segment-name',
                    html: StringHelper.encodeHtml(taskRecord.name)
                },
                {
                    tag: 'span',
                    class: 'segment-duration',
                    html: `${taskRecord.duration}d`
                }
            ]
        };
    }

    // Regular task
    return StringHelper.encodeHtml(taskRecord.name);
}
```

### 4.2 Advanced Segment Info

```javascript
taskRenderer({ taskRecord, renderData }) {
    if (taskRecord.isEventSegment) {
        // Get parent task
        const parentTask = taskRecord.event;

        // Get segment index
        const segmentIndex = parentTask.segments.indexOf(taskRecord);

        // Calculate segment info
        const totalSegments = parentTask.segments.length;

        renderData.cls.add('b-segment');

        return `Seg ${segmentIndex + 1}/${totalSegments}`;
    }

    return '';
}
```

---

## 5. Programmatic Segment Management

### 5.1 Create Split Task

```javascript
// Create a new split task
const task = gantt.taskStore.add({
    name: 'New Split Task',
    startDate: '2024-01-15'
})[0];

// Add segments
task.segments = [
    {
        name: 'Phase 1',
        startDate: '2024-01-15',
        duration: 2
    },
    {
        name: 'Phase 2',
        startDate: '2024-01-18',
        duration: 3
    },
    {
        name: 'Phase 3',
        startDate: '2024-01-24',
        duration: 2
    }
];
```

### 5.2 Modify Segments

```javascript
// Get task
const task = gantt.taskStore.getById(1);

// Add new segment
task.segments.push({
    name: 'Additional Phase',
    startDate: '2024-01-28',
    duration: 2
});

// Remove segment
task.segments.splice(1, 1);

// Update segment
task.segments[0].duration = 3;
```

---

## 6. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { StringHelper } from '@bryntum/gantt';
import { useState, useRef, useCallback } from 'react';

function GanttWithSplitTasks({ projectData }) {
    const ganttRef = useRef(null);
    const [customStyling, setCustomStyling] = useState(true);

    const toggleCustomStyling = useCallback((checked) => {
        setCustomStyling(checked);
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.element.classList.toggle('custom-styling', checked);
            gantt.features.nonWorkingTime.disabled = checked;
            gantt.features.percentBar.disabled = checked;
        }
    }, []);

    const taskRenderer = useCallback(({ taskRecord }) => {
        if (taskRecord.isEventSegment) {
            return StringHelper.encodeHtml(taskRecord.name);
        }
        return '';
    }, []);

    const ganttConfig = {
        cls: customStyling ? 'custom-styling' : '',
        tickSize: 70,

        features: {
            nonWorkingTime: {
                disabled: customStyling
            },
            percentBar: {
                disabled: customStyling
            }
        },

        columns: [
            { type: 'name', width: 250 }
        ],

        taskRenderer
    };

    return (
        <div className="gantt-split-wrapper">
            <div className="toolbar">
                <label>
                    <input
                        type="checkbox"
                        checked={customStyling}
                        onChange={(e) => toggleCustomStyling(e.target.checked)}
                    />
                    Custom styling
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

## 7. Styling

```css
/* Split task container */
.b-gantt-task.b-split-task .b-gantt-task-bar {
    background: transparent;
    border: none;
}

/* Individual segment */
.b-gantt-task-segment {
    background: linear-gradient(to bottom, #64B5F6, #1976D2);
    border-radius: 4px;
    border: 1px solid #1565C0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Segment content */
.segment-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    font-size: 11px;
    color: white;
}

.segment-name {
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.segment-duration {
    opacity: 0.8;
    font-size: 10px;
}

/* Custom styling mode */
.custom-styling .b-gantt-task-segment {
    background: linear-gradient(to bottom, #81C784, #4CAF50);
    border-color: #388E3C;
}

/* Gap between segments */
.b-gantt-task.b-split-task .b-gantt-task-wrap {
    display: flex;
    align-items: center;
    gap: 4px;
}

/* Segment hover */
.b-gantt-task-segment:hover {
    filter: brightness(1.1);
}

/* Selected segment */
.b-gantt-task-segment.b-selected {
    outline: 2px solid #FFC107;
    outline-offset: 2px;
}

/* First/last segment styling */
.b-gantt-task-segment:first-child {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
}

.b-gantt-task-segment:last-child {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Segments niet zichtbaar | segments data mist | Voeg segments array toe |
| Renderer werkt niet | isEventSegment check mist | Check taskRecord.isEventSegment |
| Gaps niet correct | startDates overlappen | Fix segment start dates |
| Styling niet toegepast | cls niet gezet | Toggle custom-styling class |

---

## API Reference

### Task Model Properties

| Property | Type | Description |
|----------|------|-------------|
| `segments` | Array | Array of segment objects |
| `isEventSegment` | Boolean | True if this is a segment |
| `event` | TaskModel | Parent task (for segments) |

### Segment Object

| Property | Type | Description |
|----------|------|-------------|
| `id` | String/Number | Segment identifier |
| `name` | String | Segment name |
| `startDate` | Date/String | Segment start |
| `duration` | Number | Segment duration |
| `endDate` | Date/String | Segment end |

### Task Renderer Context

| Property | Type | Description |
|----------|------|-------------|
| `taskRecord` | TaskModel | Current task or segment |
| `renderData` | Object | Render configuration |

---

## Bronnen

- **Example**: `examples/split-tasks/`
- **TaskModel**: `Gantt.model.TaskModel`
- **Split Tasks Guide**: `docs/guides/split-tasks.md`

---

*Priority 2: Medium Priority Features*
