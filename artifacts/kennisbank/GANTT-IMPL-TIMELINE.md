# Gantt Implementation: Timeline Widget

> **Overzichtsweergave** met Timeline widget, ShowInTimeline column, milestone highlighting, en synchronisatie met Gantt.

---

## Overzicht

De Timeline widget biedt een compact overzicht van belangrijke taken en milestones. Het werkt samen met een Gantt voor detail-view, waarbij gebruikers bepalen welke taken in de timeline verschijnen.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ TIMELINE                                                    Jan Feb Mar  │
│ ┌────────────────┐  ┌──────────────────────┐  ●  ┌───────────────┐ ●    │
│ │ Phase 1        │  │    Development       │  │  │   Testing     │ │    │
│ └────────────────┘  └──────────────────────┘  │  └───────────────┘ │    │
│                                            Launch             Go-Live    │
├──────────────────────────────────────────────────────────────────────────┤
│ GANTT                                                                    │
│ ▼ Project                  ████████████████████████████████████████████  │
│   ├── Planning             ████████                                      │
│   ├── Phase 1              ████████████████                              │
│   ├── Development                  ████████████████████████              │
│   ├── Launch (milestone)                            ●                    │
│   ├── Testing                                         ████████████       │
│   └── Go-Live (milestone)                                          ●    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basis Timeline Setup

### 1.1 Timeline Widget

```javascript
import { Gantt, ProjectModel, Timeline } from '@bryntum/gantt';

const project = new ProjectModel({
    autoLoad: true,
    loadUrl: '/api/project'
});

// Timeline widget
const timeline = new Timeline({
    appendTo: 'timeline-container',
    project,

    // Styling
    eventStyle: 'gantt',
    eventColor: 'green',

    // Afhankelijkheid ID veld
    dependencyIdField: 'sequenceNumber'
});

// Gantt widget
const gantt = new Gantt({
    appendTo: 'gantt-container',
    project,

    columns: [
        { type: 'name', width: 250 },
        { type: 'showintimeline', width: 150 }
    ]
});
```

### 1.2 ShowInTimeline Column

```javascript
columns: [
    { type: 'name', width: 250 },
    {
        type: 'showintimeline',
        text: 'Show in Timeline',
        width: 150,

        // Standaard visible voor milestones
        defaultValue: false
    }
]
```

---

## 2. Timeline Configuratie

### 2.1 Sizing Options

```javascript
const timeline = new Timeline({
    appendTo: 'container',
    project,

    // Hoogte (of via CSS)
    height: 200,

    // Responsive sizing via CSS classes
    cls: 'medium'  // 'small', 'medium', 'large'
});

// CSS-based sizing
const setTimelineHeight = ({ source: button }) => {
    timeline.element.style.height = '';

    ['large', 'medium', 'small'].forEach(cls =>
        timeline.element.classList.remove(cls)
    );

    timeline.element.classList.add(button.text.toLowerCase());
};
```

### 2.2 Timeline Toolbar

```javascript
const timeline = new Timeline({
    appendTo: 'container',
    project,

    tbar: [
        'Timeline size',
        {
            type: 'buttonGroup',
            toggleGroup: true,
            items: [
                { text: 'Small' },
                { text: 'Medium', pressed: true },
                { text: 'Large' }
            ],
            onAction: setTimelineHeight
        }
    ]
});
```

---

## 3. Filtering Timeline Content

### 3.1 showInTimeline Property

```javascript
// Task data met timeline visibility
tasksData: [
    {
        id: 1,
        name: 'Project Planning',
        startDate: '2024-01-15',
        duration: 10,
        showInTimeline: true  // Zichtbaar in timeline
    },
    {
        id: 2,
        name: 'Development Sprint 1',
        startDate: '2024-01-25',
        duration: 15,
        showInTimeline: false  // Niet in timeline
    },
    {
        id: 3,
        name: 'Launch Milestone',
        startDate: '2024-02-15',
        milestone: true,
        showInTimeline: true  // Milestones vaak zichtbaar
    }
]
```

### 3.2 Automatic Milestone Display

```javascript
// Configureer welke taken automatisch in timeline komen
project.on({
    taskAdd({ records }) {
        records.forEach(task => {
            // Milestones automatisch in timeline
            if (task.isMilestone) {
                task.showInTimeline = true;
            }

            // Parent taken in timeline
            if (task.isParent) {
                task.showInTimeline = true;
            }
        });
    }
});
```

### 3.3 Toggle via Column

```javascript
{
    type: 'showintimeline',
    width: 40,  // Compact

    // Custom renderer als icon
    renderer({ value }) {
        return {
            tag: 'i',
            class: `fa ${value ? 'fa-eye' : 'fa-eye-slash'}`,
            style: {
                color: value ? '#4CAF50' : '#ccc',
                cursor: 'pointer'
            }
        };
    }
}
```

---

## 4. Synchronisatie

### 4.1 Gantt-Timeline Sync

```javascript
// Timeline en Gantt delen hetzelfde project
const project = new ProjectModel({
    loadUrl: '/api/project'
});

const timeline = new Timeline({ project });
const gantt = new Gantt({ project });

// Wijzigingen in Gantt reflecteren in Timeline
gantt.taskStore.on({
    update({ record, changes }) {
        // Timeline update automatisch door shared project
        console.log('Task updated:', record.name);
    }
});
```

### 4.2 Selection Sync

```javascript
// Synchroniseer selectie tussen widgets
gantt.on({
    selectionChange({ selection }) {
        // Highlight in timeline
        timeline.selectedRecords = selection.filter(r =>
            r.showInTimeline
        );
    }
});

timeline.on({
    eventClick({ eventRecord }) {
        // Scroll Gantt naar taak
        gantt.scrollRowIntoView(eventRecord);

        // Selecteer in Gantt
        gantt.selectedRecord = eventRecord;
    }
});
```

### 4.3 Time Range Sync

```javascript
// Sync zichtbare tijdsperiode
gantt.on({
    timeAxisChange({ source }) {
        timeline.setTimeSpan(
            source.startDate,
            source.endDate
        );
    }
});
```

---

## 5. Event Styling

### 5.1 Event Appearance

```javascript
const timeline = new Timeline({
    project,

    // Globale event styling
    eventStyle: 'gantt',       // 'plain', 'border', 'colored', 'gantt'
    eventColor: 'green',       // Default color

    // Custom event renderer
    eventRenderer({ eventRecord, renderData }) {
        // Milestone styling
        if (eventRecord.isMilestone) {
            renderData.cls.add('milestone');
            renderData.iconCls = 'fa fa-diamond';
        }

        // Status-based styling
        if (eventRecord.percentDone === 100) {
            renderData.cls.add('completed');
        }
        else if (eventRecord.percentDone > 0) {
            renderData.cls.add('in-progress');
        }

        return eventRecord.name;
    }
});
```

### 5.2 Milestone Styling

```css
/* Timeline milestones */
.b-timeline .b-sch-event.milestone {
    background: #FF5722;
    border-radius: 50%;
    transform: rotate(45deg);
}

.b-timeline .b-sch-event.milestone .b-sch-event-content {
    transform: rotate(-45deg);
}

/* Completed events */
.b-timeline .b-sch-event.completed {
    background: #4CAF50;
    opacity: 0.8;
}

/* In-progress events */
.b-timeline .b-sch-event.in-progress {
    background: linear-gradient(
        90deg,
        #2196F3 var(--percent-done),
        #90CAF9 var(--percent-done)
    );
}
```

### 5.3 Per-Event Colors

```javascript
tasksData: [
    {
        id: 1,
        name: 'Phase 1',
        eventColor: 'blue',  // Per-event color
        showInTimeline: true
    },
    {
        id: 2,
        name: 'Critical Milestone',
        eventColor: 'red',
        milestone: true,
        showInTimeline: true
    }
]
```

---

## 6. Timeline Features

### 6.1 Dependencies

```javascript
const timeline = new Timeline({
    project,

    features: {
        dependencies: {
            // Toon dependencies ook in timeline
            disabled: false
        }
    },

    // ID veld voor dependencies
    dependencyIdField: 'sequenceNumber'
});
```

### 6.2 Tooltips

```javascript
features: {
    eventTooltip: {
        template({ eventRecord }) {
            return `
                <div class="timeline-tooltip">
                    <h4>${eventRecord.name}</h4>
                    <p>${eventRecord.startDate.toLocaleDateString()} -
                       ${eventRecord.endDate.toLocaleDateString()}</p>
                    <p>Progress: ${eventRecord.percentDone}%</p>
                </div>
            `;
        }
    }
}
```

---

## 7. Layout Options

### 7.1 Horizontal vs Vertical

```javascript
// Horizontal timeline (default)
const horizontalTimeline = new Timeline({
    project,
    mode: 'horizontal'
});

// Vertical timeline
const verticalTimeline = new Timeline({
    project,
    mode: 'vertical',
    width: 300
});
```

### 7.2 Stacked Events

```javascript
const timeline = new Timeline({
    project,

    // Overlap handling
    eventLayout: 'stack',  // 'stack', 'pack', 'none'

    // Max stack levels
    maxStackLevel: 3
});
```

### 7.3 Row Height

```javascript
const timeline = new Timeline({
    project,
    rowHeight: 60,
    barMargin: 5
});
```

---

## 8. Interactive Features

### 8.1 Event Click

```javascript
timeline.on({
    eventClick({ eventRecord, event }) {
        // Open detail panel
        showTaskDetails(eventRecord);
    },

    eventDblClick({ eventRecord }) {
        // Open editor
        gantt.editTask(eventRecord);
    }
});
```

### 8.2 Context Menu

```javascript
features: {
    eventMenu: {
        items: {
            removeFromTimeline: {
                text: 'Remove from Timeline',
                icon: 'fa fa-eye-slash',
                onItem({ eventRecord }) {
                    eventRecord.showInTimeline = false;
                }
            },
            viewInGantt: {
                text: 'View in Gantt',
                icon: 'fa fa-search',
                onItem({ eventRecord }) {
                    gantt.scrollRowIntoView(eventRecord);
                    gantt.selectedRecord = eventRecord;
                }
            }
        }
    }
}
```

### 8.3 Drag & Drop

```javascript
// Events kunnen naar timeline worden gesleept
features: {
    eventDrag: {
        // Disable drag in timeline (read-only view)
        disabled: true
    }
}

// Of enable voor reordering
features: {
    eventDrag: {
        disabled: false,
        constrainDragToResource: false
    }
}
```

---

## 9. Multiple Timelines

### 9.1 Phase Timeline

```javascript
// Aparte timeline per project fase
const phaseTimelines = project.taskStore
    .query(t => t.isParent && t.parentId === project.taskStore.rootNode.id)
    .map(phase => new Timeline({
        appendTo: 'timelines-container',
        project,
        title: phase.name,

        // Filter voor deze fase
        taskStore: {
            filters: [
                { property: 'showInTimeline', value: true },
                {
                    filterBy: task => {
                        return task === phase || task.parent === phase;
                    }
                }
            ]
        }
    }));
```

### 9.2 Milestone Timeline

```javascript
// Timeline met alleen milestones
const milestoneTimeline = new Timeline({
    appendTo: 'milestone-container',
    project,
    height: 80,
    title: 'Key Milestones',

    // Filter voor milestones
    eventStore: {
        filters: [{
            filterBy: task => task.isMilestone && task.showInTimeline
        }]
    }
});
```

---

## 10. React Integration

```jsx
import { BryntumGantt, BryntumTimeline } from '@bryntum/gantt-react';
import { useState, useRef, useEffect } from 'react';

function GanttWithTimeline({ projectData }) {
    const [timelineSize, setTimelineSize] = useState('medium');
    const projectRef = useRef(null);

    // Shared project instance
    useEffect(() => {
        projectRef.current = new ProjectModel(projectData);
        return () => projectRef.current?.destroy();
    }, [projectData]);

    const ganttColumns = [
        { type: 'name', width: 200 },
        { type: 'showintimeline', width: 120 },
        { type: 'startdate' },
        { type: 'enddate' }
    ];

    return (
        <div className="gantt-timeline-wrapper">
            <div className="timeline-controls">
                <span>Timeline Size:</span>
                {['small', 'medium', 'large'].map(size => (
                    <button
                        key={size}
                        onClick={() => setTimelineSize(size)}
                        className={timelineSize === size ? 'active' : ''}
                    >
                        {size}
                    </button>
                ))}
            </div>

            <BryntumTimeline
                project={projectRef.current}
                className={`timeline-${timelineSize}`}
                eventStyle="gantt"
                eventColor="green"
            />

            <BryntumGantt
                project={projectRef.current}
                columns={ganttColumns}
            />
        </div>
    );
}
```

---

## 11. Styling

```css
/* Timeline container */
.b-timeline {
    border: 1px solid var(--b-gray-300);
    border-radius: 4px;
}

/* Size variations */
.timeline-small {
    height: 80px;
}

.timeline-medium {
    height: 150px;
}

.timeline-large {
    height: 250px;
}

/* Timeline header */
.b-timeline .b-sch-header-row {
    background: var(--b-gray-100);
}

/* Timeline events */
.b-timeline .b-sch-event {
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Milestone diamond */
.b-timeline .b-milestone {
    background: #FF5722;
}

/* Event label */
.b-timeline .b-sch-event-content {
    font-size: 0.85em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Hover state */
.b-timeline .b-sch-event:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* Show in timeline column */
.b-showintimeline-column {
    text-align: center;
}

.b-showintimeline-column .fa-eye {
    color: #4CAF50;
}

.b-showintimeline-column .fa-eye-slash {
    color: #bbb;
}
```

---

## 12. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Taken niet in timeline | showInTimeline: false | Zet property of gebruik column |
| Timeline leeg | Geen project | Zorg dat project is gekoppeld |
| Events niet gesynchroniseerd | Verschillende projects | Gebruik zelfde ProjectModel |
| Styling niet toegepast | CSS niet geladen | Import timeline CSS |
| Dependencies niet zichtbaar | Feature disabled | Enable dependencies feature |

---

## API Reference

### Timeline Properties

| Property | Type | Description |
|----------|------|-------------|
| `project` | ProjectModel | Gekoppeld project |
| `eventStyle` | String | Event styling mode |
| `eventColor` | String | Default event color |
| `mode` | String | 'horizontal' of 'vertical' |

### ShowInTimeline Column

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | 'showintimeline' |
| `defaultValue` | Boolean | Default visibility |

### Task Properties

| Property | Type | Description |
|----------|------|-------------|
| `showInTimeline` | Boolean | Zichtbaar in timeline |
| `eventColor` | String | Per-task color |

---

## Bronnen

- **Example**: `examples/timeline/`
- **Timeline Widget**: `Gantt.widget.Timeline`
- **ShowInTimeline Column**: `Gantt.column.ShowInTimelineColumn`

---

*Track A: Foundation - Gantt Extensions (A2.8)*
