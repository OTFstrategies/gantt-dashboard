# Gantt Implementation: Task Indicators

> **Visuele indicatoren** voor constraints, deadlines, early/late dates, en custom indicators.

---

## Overzicht

Bryntum Gantt's Indicators feature toont visuele markers voor belangrijke taak-gerelateerde data punten.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GANTT                                  [Indicators ▼]                    │
├──────────────────────────────────────────────────────────────────────────┤
│  Task Name    │ Constraint   │ Constraint │ Deadline   │                │
│               │ Date         │ Type       │ Date       │                │
├───────────────┼──────────────┼────────────┼────────────┼────────────────┤
│                                                                          │
│                   Jan 15          Jan 20         Jan 25        Jan 30    │
│                    │               │               │              │      │
│  Design       ─────┼───────████████│███────────────┼──────────────┤      │
│               ⬥ constraint  │       task        │              │      │
│                              │                   │              │      │
│  Development  ───────────────┼───────────────████│██████────────┤      │
│                              │                  ⚠ deadline     │      │
│                              │                                  │      │
│  Testing      ───────────────┼──────────────────────────────────┼────   │
│                              │              🍺 custom           │      │
│                              │                                  │      │
│               ────────────────────────────────────────────────────────── │
│                                                                          │
│  INDICATOR TYPES:                                                        │
│  ⬥ Constraint Date    ⚠ Deadline    ◀ Early Start    ▶ Late Finish      │
│  🍺 Custom Indicator                                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic Indicators Setup

### 1.1 Enable Built-in Indicators

```javascript
import { Gantt, ProjectModel, DateHelper } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    loadUrl: '/api/project'
});

const gantt = new Gantt({
    appendTo: 'container',
    dependencyIdField: 'sequenceNumber',

    features: {
        indicators: {
            items: {
                // Disable early dates indicator
                earlyDates: false,

                // Enable late dates (default)
                lateDates: true,

                // Enable deadline indicator (default)
                deadlineDate: true,

                // Enable constraint indicator (default)
                constraintDate: true
            }
        }
    },

    // Higher row for indicator visibility
    rowHeight: 50,
    resourceMargin: 15,

    columns: [
        { type: 'name' },
        { type: 'constraintdate', width: 140 },
        { type: 'constrainttype', width: 190 },
        { type: 'deadlinedate' }
    ],

    project
});
```

### 1.2 Indicator Toggle Menu

```javascript
tbar: [
    {
        type: 'button',
        icon: 'fa-bars',
        text: 'Indicators',
        menu: [
            {
                ref: 'earlyDates',
                text: 'Early Dates',
                checked: false,
                onToggle: ({ item, checked }) => {
                    gantt.features.indicators.items.earlyDates = checked;
                }
            },
            {
                ref: 'lateDates',
                text: 'Late Dates',
                checked: true,
                onToggle: ({ item, checked }) => {
                    gantt.features.indicators.items.lateDates = checked;
                }
            },
            {
                ref: 'deadlineDate',
                text: 'Deadline',
                checked: true,
                onToggle: ({ item, checked }) => {
                    gantt.features.indicators.items.deadlineDate = checked;
                }
            },
            {
                ref: 'constraintDate',
                text: 'Constraint',
                checked: true,
                onToggle: ({ item, checked }) => {
                    gantt.features.indicators.items.constraintDate = checked;
                }
            }
        ]
    }
]
```

---

## 2. Custom Indicators

### 2.1 Conditional Custom Indicator

```javascript
features: {
    indicators: {
        items: {
            // Built-in indicators
            earlyDates: false,
            lateDates: true,
            deadlineDate: true,
            constraintDate: true,

            // Custom indicator: celebration beer after tasks starting with 'C'
            beer: taskRecord => taskRecord.name.startsWith('C') ? {
                startDate: DateHelper.add(taskRecord.endDate, 2, 'day'),
                cls: 'beer',
                iconCls: 'fa fa-beer',
                name: 'Post-task celebration beer'
            } : null
        }
    }
}
```

### 2.2 Multiple Custom Indicators

```javascript
features: {
    indicators: {
        items: {
            // Review indicator
            review: taskRecord => taskRecord.needsReview ? {
                startDate: taskRecord.endDate,
                cls: 'review-indicator',
                iconCls: 'fa fa-clipboard-check',
                name: 'Review required'
            } : null,

            // Approval indicator
            approval: taskRecord => taskRecord.pendingApproval ? {
                startDate: DateHelper.add(taskRecord.endDate, 1, 'day'),
                cls: 'approval-indicator',
                iconCls: 'fa fa-stamp',
                name: 'Pending approval'
            } : null,

            // Risk indicator
            risk: taskRecord => {
                if (taskRecord.riskLevel === 'high') {
                    return {
                        startDate: taskRecord.startDate,
                        cls: 'risk-high',
                        iconCls: 'fa fa-exclamation-triangle',
                        name: 'High risk task'
                    };
                }
                return null;
            },

            // Milestone marker
            milestone: taskRecord => taskRecord.isMilestone ? {
                startDate: taskRecord.startDate,
                cls: 'milestone-indicator',
                iconCls: 'fa fa-diamond',
                name: taskRecord.name
            } : null
        }
    }
}
```

---

## 3. Indicator Configuration

### 3.1 Indicator Object Properties

```javascript
// Return object from indicator function
{
    // Required: Position of indicator
    startDate: DateHelper.add(taskRecord.endDate, 2, 'day'),

    // CSS class for styling
    cls: 'my-indicator',

    // Icon class (FontAwesome, etc.)
    iconCls: 'fa fa-star',

    // Tooltip text
    name: 'Indicator tooltip text',

    // Optional: End date for range indicators
    endDate: DateHelper.add(taskRecord.endDate, 5, 'day')
}
```

### 3.2 Dynamic Indicator Updates

```javascript
// Update indicators when task changes
gantt.taskStore.on({
    update({ record, changes }) {
        if (changes.percentDone || changes.endDate) {
            // Indicators auto-refresh on task changes
            gantt.features.indicators.refresh();
        }
    }
});

// Manually toggle indicator
function toggleIndicator(name, enabled) {
    gantt.features.indicators.items[name] = enabled;
}
```

---

## 4. Built-in Indicator Types

### 4.1 Early/Late Dates

```javascript
features: {
    indicators: {
        items: {
            // Early start/finish dates
            earlyDates: true,  // or false to disable

            // Late start/finish dates
            lateDates: true
        }
    }
}

// These show when critical path analysis is enabled
features: {
    criticalPaths: true,
    indicators: {
        items: {
            earlyDates: true,
            lateDates: true
        }
    }
}
```

### 4.2 Constraint Dates

```javascript
// Data with constraints
tasksData: [
    {
        id: 1,
        name: 'Design Phase',
        startDate: '2024-01-15',
        duration: 10,
        constraintType: 'startnoearlierthan',
        constraintDate: '2024-01-15'
    },
    {
        id: 2,
        name: 'Development',
        startDate: '2024-01-25',
        duration: 20,
        constraintType: 'finishnolaterthan',
        constraintDate: '2024-02-20'
    }
]
```

### 4.3 Deadline Dates

```javascript
// Data with deadlines
tasksData: [
    {
        id: 1,
        name: 'Critical Delivery',
        startDate: '2024-01-15',
        duration: 15,
        deadlineDate: '2024-02-01'  // Must complete by this date
    }
]

// Deadline column
columns: [
    { type: 'name' },
    { type: 'deadlinedate' }  // Shows deadline picker
]
```

---

## 5. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useCallback } from 'react';
import { DateHelper } from '@bryntum/gantt';

function GanttWithIndicators({ projectData }) {
    const [indicators, setIndicators] = useState({
        earlyDates: false,
        lateDates: true,
        deadlineDate: true,
        constraintDate: true,
        customCelebration: true
    });

    const toggleIndicator = useCallback((name) => {
        setIndicators(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    }, []);

    const ganttConfig = {
        rowHeight: 50,
        resourceMargin: 15,

        features: {
            indicators: {
                items: {
                    earlyDates: indicators.earlyDates,
                    lateDates: indicators.lateDates,
                    deadlineDate: indicators.deadlineDate,
                    constraintDate: indicators.constraintDate,

                    // Custom celebration indicator
                    celebration: indicators.customCelebration
                        ? (taskRecord) => {
                            if (taskRecord.percentDone === 100) {
                                return {
                                    startDate: taskRecord.endDate,
                                    cls: 'celebration',
                                    iconCls: 'fa fa-trophy',
                                    name: 'Task completed!'
                                };
                            }
                            return null;
                        }
                        : false
                }
            }
        },

        columns: [
            { type: 'name', width: 200 },
            { type: 'constrainttype', width: 150 },
            { type: 'constraintdate', width: 120 },
            { type: 'deadlinedate', width: 120 }
        ]
    };

    return (
        <div className="gantt-indicators-wrapper">
            <div className="toolbar">
                <span>Indicators:</span>
                {Object.entries(indicators).map(([name, enabled]) => (
                    <label key={name}>
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => toggleIndicator(name)}
                        />
                        {name}
                    </label>
                ))}
            </div>

            <BryntumGantt
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
/* Base indicator styling */
.b-gantt-task-indicator {
    position: absolute;
    z-index: 5;
}

.b-gantt-task-indicator .b-icon {
    font-size: 14px;
}

/* Constraint indicator */
.b-indicator-constraint {
    color: #FF9800;
}

/* Deadline indicator */
.b-indicator-deadline {
    color: #f44336;
}

/* Early dates indicator */
.b-indicator-early {
    color: #4CAF50;
}

/* Late dates indicator */
.b-indicator-late {
    color: #9C27B0;
}

/* Custom beer indicator */
.beer {
    color: #FFC107;
}

.beer .fa-beer {
    font-size: 16px;
}

/* Custom celebration indicator */
.celebration {
    color: #FFD700;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}

/* Review indicator */
.review-indicator {
    color: #2196F3;
}

/* Risk indicator */
.risk-high {
    color: #f44336;
    animation: blink 0.5s infinite;
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Milestone indicator */
.milestone-indicator {
    color: #9C27B0;
}

/* Indicator tooltip */
.b-tooltip.b-indicator-tooltip {
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Indicators niet zichtbaar | Feature disabled | Enable indicators feature |
| Custom indicator niet zichtbaar | Functie returnt null | Check conditie in indicator functie |
| Indicator op verkeerde positie | startDate incorrect | Controleer DateHelper.add() parameters |
| Overlap met task bar | resourceMargin te klein | Verhoog rowHeight en resourceMargin |
| Tooltip niet zichtbaar | name property mist | Voeg name toe aan indicator config |

---

## API Reference

### Indicators Feature

| Property | Type | Description |
|----------|------|-------------|
| `items` | Object | Indicator definitions |

### Built-in Indicators

| Name | Description |
|------|-------------|
| `earlyDates` | Early start/finish dates |
| `lateDates` | Late start/finish dates |
| `deadlineDate` | Task deadline |
| `constraintDate` | Task constraint |

### Custom Indicator Return Object

| Property | Type | Description |
|----------|------|-------------|
| `startDate` | Date | Indicator position |
| `endDate` | Date | End for range indicators |
| `cls` | String | CSS class |
| `iconCls` | String | Icon class |
| `name` | String | Tooltip text |

### Related Columns

| Column Type | Description |
|-------------|-------------|
| `constraintdate` | Constraint date picker |
| `constrainttype` | Constraint type selector |
| `deadlinedate` | Deadline date picker |

---

## Bronnen

- **Example**: `examples/indicators/`
- **Indicators Feature**: `Gantt.feature.Indicators`
- **Constraint Types**: `Gantt.model.TaskModel.constraintType`

---

*Priority 1: Missing Core Functionality*
