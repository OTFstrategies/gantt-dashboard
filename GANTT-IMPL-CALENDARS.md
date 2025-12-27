# Gantt Implementation: Calendars & Non-Working Time

> **Calendars** voor het definiëren van werkdagen, niet-werkende periodes, en task-specifieke calendars.

---

## Overzicht

Bryntum Gantt ondersteunt project- en task-level calendars voor werkschema's.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GANTT        Mode: [Row ▼]  [x] Project non-working  [x] Task non-working│
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Task Name    │ Calendar    │          Timeline                         │
│               │             │                                            │
│  Development  │ Standard    │ ░░│████████│░░│████████│░░│████           │
│  Testing      │ Night Shift │ ██│░░░░░░░░│██│░░░░░░░░│██│░░░░           │
│  Deployment   │ 24/7        │ ██████████████████████████████            │
│               │             │                                            │
├───────────────┴─────────────┴────────────────────────────────────────────┤
│                                                                          │
│     Mon       Tue       Wed       Thu       Fri       Sat       Sun     │
│      │         │         │         │         │         │         │       │
│      ████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░        │
│      ↑ Working days                      ↑ Weekend (non-working)        │
│                                                                          │
│  CALENDAR TYPES:                                                         │
│  ████ Working time    ░░░░ Non-working time    🎄 Holiday               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic Calendar Setup

### 1.1 Enable Non-Working Time Features

```javascript
import { Gantt, DateHelper, Toast } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',

    project: {
        autoSetConstraints: true,
        loadUrl: '../_datasets/calendars.json',
        autoLoad: true
    },

    tickSize: 50,

    columns: [
        { type: 'name', width: 260 },
        { type: 'calendar', width: 210 }  // Calendar picker column
    ],

    features: {
        // Task-level non-working time
        taskNonWorkingTime: {
            tooltipTemplate({ name, startDate, endDate, iconCls }) {
                return `
                    <p class="b-non-working-time-tip-title">
                        ${iconCls ? `<i class="${iconCls}"></i>` : ''}
                        ${name || 'Non-working time'}
                    </p>
                    ${DateHelper.format(startDate, 'L')} - ${DateHelper.format(endDate, 'L')}
                `;
            }
        },

        // Project-level non-working time (disabled by default)
        nonWorkingTime: {
            disabled: true
        },

        percentBar: false
    },

    tbar: [
        {
            ref: 'mode',
            type: 'combo',
            label: 'Display mode',
            value: 'row',
            inputWidth: '7em',
            editable: false,
            items: [
                ['row', 'Row'],
                ['bar', 'Bar'],
                ['both', 'Both']
            ],
            onChange({ value }) {
                gantt.features.taskNonWorkingTime.mode = value;
            }
        },
        {
            type: 'slidetoggle',
            text: 'Highlight project non-working time',
            checked: false,
            onChange({ checked }) {
                gantt.features.nonWorkingTime.disabled = !checked;
            }
        },
        {
            type: 'slidetoggle',
            text: 'Highlight task non-working time',
            checked: true,
            onChange({ checked }) {
                gantt.features.taskNonWorkingTime.disabled = !checked;
            }
        },
        {
            ref: 'custom',
            type: 'slidetoggle',
            text: 'Custom styling',
            onChange() {
                gantt.element.classList.toggle('b-custom-non-working-time');
            }
        }
    ],

    listeners: {
        nonWorkingTimeClick: 'onNonWorkingTimeElementInteraction',
        nonWorkingTimeContextMenu: 'onNonWorkingTimeElementInteraction',
        nonWorkingTimeDoubleClick: 'onNonWorkingTimeElementInteraction'
    },

    onNonWorkingTimeElementInteraction({ type, name, startDate, endDate, domEvent }) {
        const action = domEvent.type === 'contextmenu' ? 'rightclick' : domEvent.type;
        Toast.show(`You ${action}ed ${name || 'a non-working range'}, starting: ${DateHelper.format(startDate, 'll')}`);
    }
});
```

---

## 2. Calendar Data Format

### 2.1 Calendar Definition

```json
{
    "calendars": {
        "rows": [
            {
                "id": "general",
                "name": "General",
                "intervals": [
                    {
                        "recurrentStartDate": "on Sat at 0:00",
                        "recurrentEndDate": "on Mon at 0:00",
                        "isWorking": false,
                        "name": "Weekend"
                    }
                ]
            },
            {
                "id": "nightshift",
                "name": "Night Shift",
                "intervals": [
                    {
                        "recurrentStartDate": "at 6:00",
                        "recurrentEndDate": "at 22:00",
                        "isWorking": false,
                        "name": "Day off"
                    },
                    {
                        "recurrentStartDate": "on Sat at 0:00",
                        "recurrentEndDate": "on Mon at 0:00",
                        "isWorking": false,
                        "name": "Weekend"
                    }
                ]
            },
            {
                "id": "24/7",
                "name": "24/7 Operations",
                "intervals": []
            }
        ]
    },
    "project": {
        "calendar": "general"
    },
    "tasks": {
        "rows": [
            {
                "id": 1,
                "name": "Development",
                "calendar": "general"
            },
            {
                "id": 2,
                "name": "Night Operations",
                "calendar": "nightshift"
            }
        ]
    }
}
```

### 2.2 Holiday Definition

```json
{
    "calendars": {
        "rows": [
            {
                "id": "general",
                "name": "General",
                "intervals": [
                    {
                        "recurrentStartDate": "on Sat at 0:00",
                        "recurrentEndDate": "on Mon at 0:00",
                        "isWorking": false,
                        "name": "Weekend"
                    },
                    {
                        "startDate": "2024-12-25",
                        "endDate": "2024-12-26",
                        "isWorking": false,
                        "name": "Christmas",
                        "iconCls": "fa fa-gift"
                    },
                    {
                        "startDate": "2024-01-01",
                        "endDate": "2024-01-02",
                        "isWorking": false,
                        "name": "New Year",
                        "iconCls": "fa fa-champagne-glasses"
                    }
                ]
            }
        ]
    }
}
```

---

## 3. Display Modes

### 3.1 Row Mode (Default)

```javascript
features: {
    taskNonWorkingTime: {
        mode: 'row'  // Show in row background
    }
}
```

### 3.2 Bar Mode

```javascript
features: {
    taskNonWorkingTime: {
        mode: 'bar'  // Show stripes on task bar
    }
}
```

### 3.3 Both Modes

```javascript
features: {
    taskNonWorkingTime: {
        mode: 'both'  // Show in both row and bar
    }
}
```

---

## 4. Event Handling

### 4.1 Non-Working Time Events

```javascript
listeners: {
    // Single click on non-working time
    nonWorkingTimeClick({ name, startDate, endDate, taskRecord }) {
        console.log(`Clicked: ${name} (${startDate} - ${endDate})`);
    },

    // Double click
    nonWorkingTimeDoubleClick({ name, startDate, endDate }) {
        showEditDialog(name, startDate, endDate);
    },

    // Right click (context menu)
    nonWorkingTimeContextMenu({ name, startDate, endDate, domEvent }) {
        domEvent.preventDefault();
        showContextMenu(name, startDate, endDate);
    }
}
```

---

## 5. Programmatic Control

### 5.1 Feature Control

```javascript
// Enable/disable project non-working time
gantt.features.nonWorkingTime.disabled = false;

// Enable/disable task non-working time
gantt.features.taskNonWorkingTime.disabled = false;

// Change display mode
gantt.features.taskNonWorkingTime.mode = 'both';
```

### 5.2 Calendar Access

```javascript
// Get project calendar
const projectCalendar = gantt.project.calendar;

// Get task calendar
const task = gantt.taskStore.getById(1);
const taskCalendar = task.calendar;

// Check if date is working
const isWorking = projectCalendar.isWorkingTime(new Date());

// Get working time for date
const workingHours = projectCalendar.getWorkingTime(new Date());
```

---

## 6. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { DateHelper } from '@bryntum/gantt';
import { useState, useCallback, useRef } from 'react';

function GanttWithCalendars({ projectData }) {
    const ganttRef = useRef(null);
    const [displayMode, setDisplayMode] = useState('row');
    const [showProjectNWT, setShowProjectNWT] = useState(false);
    const [showTaskNWT, setShowTaskNWT] = useState(true);

    const handleModeChange = useCallback((mode) => {
        setDisplayMode(mode);
        if (ganttRef.current?.instance) {
            ganttRef.current.instance.features.taskNonWorkingTime.mode = mode;
        }
    }, []);

    const toggleProjectNWT = useCallback((checked) => {
        setShowProjectNWT(checked);
        if (ganttRef.current?.instance) {
            ganttRef.current.instance.features.nonWorkingTime.disabled = !checked;
        }
    }, []);

    const toggleTaskNWT = useCallback((checked) => {
        setShowTaskNWT(checked);
        if (ganttRef.current?.instance) {
            ganttRef.current.instance.features.taskNonWorkingTime.disabled = !checked;
        }
    }, []);

    const handleNWTClick = useCallback(({ name, startDate }) => {
        console.log(`Clicked: ${name} starting ${DateHelper.format(startDate, 'll')}`);
    }, []);

    const ganttConfig = {
        tickSize: 50,

        columns: [
            { type: 'name', width: 250 },
            { type: 'calendar', width: 180 }
        ],

        features: {
            taskNonWorkingTime: {
                disabled: !showTaskNWT,
                mode: displayMode,
                tooltipTemplate: ({ name, startDate, endDate, iconCls }) => `
                    <p>${iconCls ? `<i class="${iconCls}"></i> ` : ''}${name || 'Non-working time'}</p>
                    <p>${DateHelper.format(startDate, 'L')} - ${DateHelper.format(endDate, 'L')}</p>
                `
            },
            nonWorkingTime: {
                disabled: !showProjectNWT
            }
        },

        listeners: {
            nonWorkingTimeClick: handleNWTClick
        }
    };

    return (
        <div className="gantt-calendars-wrapper">
            <div className="toolbar">
                <label>
                    Mode:
                    <select
                        value={displayMode}
                        onChange={(e) => handleModeChange(e.target.value)}
                    >
                        <option value="row">Row</option>
                        <option value="bar">Bar</option>
                        <option value="both">Both</option>
                    </select>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showProjectNWT}
                        onChange={(e) => toggleProjectNWT(e.target.checked)}
                    />
                    Project non-working time
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showTaskNWT}
                        onChange={(e) => toggleTaskNWT(e.target.checked)}
                    />
                    Task non-working time
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
/* Non-working time in rows */
.b-gantt-task-row .b-non-working-time {
    background: repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 5px,
        rgba(0, 0, 0, 0.05) 5px,
        rgba(0, 0, 0, 0.05) 10px
    );
}

/* Non-working time in bars */
.b-gantt-task-bar .b-non-working-time-range {
    background: repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 3px,
        rgba(255, 255, 255, 0.3) 3px,
        rgba(255, 255, 255, 0.3) 6px
    );
}

/* Weekend highlighting */
.b-non-working-time.b-weekend {
    background-color: rgba(200, 200, 200, 0.3);
}

/* Holiday styling */
.b-non-working-time.b-holiday {
    background-color: rgba(244, 67, 54, 0.2);
}

/* Non-working time tooltip */
.b-non-working-time-tip-title {
    font-weight: bold;
    margin-bottom: 4px;
}

.b-non-working-time-tip-title i {
    margin-right: 8px;
}

/* Custom non-working time styling */
.b-custom-non-working-time .b-non-working-time {
    background: linear-gradient(
        135deg,
        rgba(156, 39, 176, 0.1) 25%,
        transparent 25%,
        transparent 50%,
        rgba(156, 39, 176, 0.1) 50%,
        rgba(156, 39, 176, 0.1) 75%,
        transparent 75%
    );
    background-size: 10px 10px;
}

/* Calendar column */
.b-calendar-column {
    font-style: italic;
}

/* Calendar picker */
.b-calendar-picker .b-list-item {
    padding: 8px 12px;
}

.b-calendar-picker .b-list-item:hover {
    background: #e3f2fd;
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Non-working time niet zichtbaar | Feature disabled | Enable taskNonWorkingTime feature |
| Weekends niet gemarkeerd | Geen calendar intervals | Definieer weekend intervals |
| Holidays niet zichtbaar | Geen holiday intervals | Voeg holiday intervals toe met dates |
| Tooltip niet zichtbaar | tooltipTemplate mist | Voeg tooltipTemplate toe |
| Custom styling werkt niet | CSS class niet toegevoegd | Toggle custom class |

---

## API Reference

### TaskNonWorkingTime Feature

| Property | Type | Description |
|----------|------|-------------|
| `disabled` | Boolean | Enable/disable feature |
| `mode` | String | 'row', 'bar', or 'both' |
| `tooltipTemplate` | Function | Tooltip template |

### NonWorkingTime Feature

| Property | Type | Description |
|----------|------|-------------|
| `disabled` | Boolean | Enable/disable feature |

### Calendar Interval Config

| Property | Type | Description |
|----------|------|-------------|
| `startDate` | String/Date | Fixed start date |
| `endDate` | String/Date | Fixed end date |
| `recurrentStartDate` | String | Recurring start rule |
| `recurrentEndDate` | String | Recurring end rule |
| `isWorking` | Boolean | Is working time |
| `name` | String | Display name |
| `iconCls` | String | Icon class |

### Events

| Event | Description |
|-------|-------------|
| `nonWorkingTimeClick` | Click on NWT |
| `nonWorkingTimeDoubleClick` | Double click on NWT |
| `nonWorkingTimeContextMenu` | Right click on NWT |

---

## Bronnen

- **Example**: `examples/calendars/`
- **TaskNonWorkingTime Feature**: `Gantt.feature.TaskNonWorkingTime`
- **NonWorkingTime Feature**: `Scheduler.feature.NonWorkingTime`
- **CalendarModel**: `Scheduler.model.CalendarModel`

---

*Priority 2: Medium Priority Features*
