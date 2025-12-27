# Gantt Implementation: Non-Working Time

> **Non-Working Time** voor het visualiseren en configureren van niet-werkdagen en -uren.

---

## Overzicht

Bryntum Gantt ondersteunt non-working time visualisatie voor weekenden, feestdagen en andere niet-werkperiodes.

```
+--------------------------------------------------------------------------+
| GANTT                                                                     |
+--------------------------------------------------------------------------+
|  Name         |  Mon  |  Tue  |  Wed  |  Thu  |  Fri  | Sat | Sun |      |
+--------------------------------------------------------------------------+
|  Task A       |  ████████████████████████████████████|░░░░░|░░░░░|      |
|  Task B       |       |  ███████████████████████████████|░░░░░|░░░░░|   |
|  Task C       |░░░░░░░|░░░░░░░|  █████████████████████████████████████   |
+--------------------------------------------------------------------------+
|               | Working days                          | Weekend         |
|                                                                          |
|  NON-WORKING TIME FEATURES:                                              |
|    - Weekend highlighting (Sat/Sun grey)                                 |
|    - Holiday markers                                                     |
|    - Custom calendar intervals                                           |
|    - Tasks skip non-working time                                         |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Non-Working Time Setup

### 1.1 Enable Non-Working Time

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,

    // Define calendar
    calendar: 'general',
    calendarsData: [
        {
            id: 'general',
            name: 'General',
            intervals: [
                // Regular work week
                {
                    recurrentStartDate: 'on Sat at 0:00',
                    recurrentEndDate: 'on Mon at 0:00',
                    isWorking: false
                }
            ]
        }
    ],

    transport: {
        load: { url: 'data/tasks.json' }
    }
});

const gantt = new Gantt({
    appendTo: 'container',
    project,

    features: {
        nonWorkingTime: true  // Enable non-working time highlighting
    },

    columns: [
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'duration' }
    ]
});
```

---

## 2. Calendar Configuration

### 2.1 Define Work Schedule

```javascript
const project = new ProjectModel({
    calendarsData: [
        {
            id: 'general',
            name: 'General',
            intervals: [
                // Weekends off
                {
                    recurrentStartDate: 'on Sat at 0:00',
                    recurrentEndDate: 'on Mon at 0:00',
                    isWorking: false
                },
                // Lunch break
                {
                    recurrentStartDate: 'at 12:00',
                    recurrentEndDate: 'at 13:00',
                    isWorking: false
                }
            ],

            // Working hours
            hoursPerDay: 8,
            daysPerWeek: 5,
            daysPerMonth: 20
        },
        {
            id: 'night-shift',
            name: 'Night Shift',
            intervals: [
                // Work at night
                {
                    recurrentStartDate: 'at 22:00',
                    recurrentEndDate: 'at 06:00',
                    isWorking: true
                },
                // Day off
                {
                    recurrentStartDate: 'at 06:00',
                    recurrentEndDate: 'at 22:00',
                    isWorking: false
                }
            ]
        }
    ]
});
```

### 2.2 Add Holidays

```javascript
const project = new ProjectModel({
    calendarsData: [
        {
            id: 'general',
            name: 'General',
            intervals: [
                // Weekends
                {
                    recurrentStartDate: 'on Sat at 0:00',
                    recurrentEndDate: 'on Mon at 0:00',
                    isWorking: false
                },
                // Christmas
                {
                    startDate: '2024-12-25',
                    endDate: '2024-12-26',
                    isWorking: false,
                    name: 'Christmas Day'
                },
                // New Year
                {
                    startDate: '2025-01-01',
                    endDate: '2025-01-02',
                    isWorking: false,
                    name: 'New Year'
                },
                // Company holiday
                {
                    startDate: '2024-07-15',
                    endDate: '2024-07-29',
                    isWorking: false,
                    name: 'Summer Break'
                }
            ]
        }
    ]
});
```

---

## 3. Non-Working Time Feature

### 3.1 Feature Configuration

```javascript
features: {
    nonWorkingTime: {
        // Show non-working time
        showNonWorkingTime: true,

        // Highlight weekends
        highlightWeekends: true,

        // Max range to render
        maxTimeAxisUnit: 'year'
    }
}
```

### 3.2 Dynamic Calendar Updates

```javascript
// Add holiday programmatically
function addHoliday(date, name) {
    const calendar = project.calendar;

    calendar.addInterval({
        startDate: date,
        endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        isWorking: false,
        name: name
    });
}

// Remove interval
function removeHoliday(intervalId) {
    const calendar = project.calendar;
    const interval = calendar.intervalStore.getById(intervalId);
    if (interval) {
        calendar.intervalStore.remove(interval);
    }
}

// Check if date is working
function isWorkingDay(date) {
    return project.calendar.isWorkingDay(date);
}

// Get next working day
function getNextWorkingDay(date) {
    return project.calendar.skipNonWorkingTime(date, true);
}
```

---

## 4. React Integration

```jsx
import { BryntumGantt, BryntumProjectModel } from '@bryntum/gantt-react';
import { useRef, useMemo, useCallback, useState } from 'react';

function NonWorkingTimeGantt() {
    const ganttRef = useRef(null);
    const projectRef = useRef(null);
    const [holidays, setHolidays] = useState([
        { date: '2024-12-25', name: 'Christmas' },
        { date: '2025-01-01', name: 'New Year' }
    ]);

    const addHoliday = useCallback((date, name) => {
        const project = projectRef.current?.instance;
        if (!project) return;

        project.calendar.addInterval({
            startDate: new Date(date),
            endDate: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
            isWorking: false,
            name
        });

        setHolidays(prev => [...prev, { date, name }]);
    }, []);

    const projectConfig = useMemo(() => ({
        calendar: 'general',
        calendarsData: [
            {
                id: 'general',
                name: 'General',
                intervals: [
                    // Weekends
                    {
                        recurrentStartDate: 'on Sat at 0:00',
                        recurrentEndDate: 'on Mon at 0:00',
                        isWorking: false
                    },
                    // Initial holidays
                    ...holidays.map(h => ({
                        startDate: h.date,
                        endDate: new Date(new Date(h.date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        isWorking: false,
                        name: h.name
                    }))
                ]
            }
        ]
    }), [holidays]);

    const ganttConfig = useMemo(() => ({
        features: {
            nonWorkingTime: {
                highlightWeekends: true
            }
        },

        columns: [
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'enddate' },
            { type: 'duration' }
        ],

        viewPreset: 'weekAndDayLetter'
    }), []);

    const handleAddHoliday = useCallback(() => {
        const date = prompt('Enter holiday date (YYYY-MM-DD):');
        const name = prompt('Enter holiday name:');
        if (date && name) {
            addHoliday(date, name);
        }
    }, [addHoliday]);

    return (
        <div className="non-working-time-gantt">
            <div className="toolbar">
                <button onClick={handleAddHoliday}>
                    Add Holiday
                </button>
                <div className="holiday-list">
                    {holidays.map(h => (
                        <span key={h.date} className="holiday-chip">
                            {h.name} ({h.date})
                        </span>
                    ))}
                </div>
            </div>

            <BryntumGantt
                ref={ganttRef}
                project={projectConfig}
                projectRef={projectRef}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 5. Resource-Specific Calendars

### 5.1 Assign Calendars to Resources

```javascript
const project = new ProjectModel({
    calendarsData: [
        {
            id: 'general',
            name: 'General',
            intervals: [
                {
                    recurrentStartDate: 'on Sat at 0:00',
                    recurrentEndDate: 'on Mon at 0:00',
                    isWorking: false
                }
            ]
        },
        {
            id: 'part-time',
            name: 'Part Time',
            intervals: [
                // Only works Mon-Wed
                {
                    recurrentStartDate: 'on Thu at 0:00',
                    recurrentEndDate: 'on Mon at 0:00',
                    isWorking: false
                }
            ]
        }
    ],

    resourcesData: [
        { id: 1, name: 'John', calendar: 'general' },
        { id: 2, name: 'Jane', calendar: 'part-time' }
    ]
});
```

---

## 6. Styling

```css
/* Non-working time zones */
.b-sch-nonworkingtime {
    background: repeating-linear-gradient(
        45deg,
        #f5f5f5,
        #f5f5f5 5px,
        #e0e0e0 5px,
        #e0e0e0 10px
    ) !important;
}

/* Weekend specific */
.b-sch-nonworkingtime.b-weekend {
    background: #f9f9f9 !important;
}

/* Holiday highlight */
.b-sch-nonworkingtime.b-holiday {
    background: #fff3e0 !important;
    border-left: 3px solid #ff9800;
}

/* Holiday label */
.b-sch-nonworkingtime.b-holiday::before {
    content: attr(data-holiday-name);
    position: absolute;
    top: 4px;
    left: 8px;
    font-size: 11px;
    color: #e65100;
    font-weight: 500;
}

/* Header column for weekend */
.b-sch-header-timeaxis-cell.b-weekend {
    background: #f5f5f5;
    color: #999;
}

/* Current day indicator */
.b-sch-today {
    background: rgba(33, 150, 243, 0.05);
}

.b-sch-today::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    background: #2196F3;
    transform: translateX(-50%);
}

/* Toolbar */
.toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.holiday-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.holiday-chip {
    padding: 4px 12px;
    background: #fff3e0;
    border: 1px solid #ffcc80;
    border-radius: 16px;
    font-size: 12px;
    color: #e65100;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Weekenden niet zichtbaar | Feature niet enabled | Enable nonWorkingTime feature |
| Taken eindigen op weekend | Calendar niet toegepast | Check project.calendar config |
| Holidays niet getoond | Interval configuratie fout | Check date formats |
| Overlap issues | Multiple intervals | Check recurrent patterns |

---

## API Reference

### NonWorkingTime Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `showNonWorkingTime` | Boolean | Show non-working zones |
| `highlightWeekends` | Boolean | Highlight weekend days |
| `maxTimeAxisUnit` | String | Max unit to render |

### Calendar Interval

| Property | Type | Description |
|----------|------|-------------|
| `startDate` | Date/String | Start date |
| `endDate` | Date/String | End date |
| `recurrentStartDate` | String | Recurring start pattern |
| `recurrentEndDate` | String | Recurring end pattern |
| `isWorking` | Boolean | Is working time |
| `name` | String | Interval name |

### Calendar Methods

| Method | Description |
|--------|-------------|
| `isWorkingDay(date)` | Check if date is working |
| `skipNonWorkingTime(date, forward)` | Get next/prev working time |
| `addInterval(config)` | Add interval |
| `calculateDuration(start, end, unit)` | Calculate working duration |

### Recurrence Patterns

| Pattern | Example |
|---------|---------|
| Day of week | `on Sat at 0:00` |
| Time of day | `at 12:00` |
| Specific date | `2024-12-25` |
| Every week | `every week on Mon` |

---

## Bronnen

- **Feature**: `Scheduler.feature.NonWorkingTime`
- **CalendarModel**: `Scheduler.model.CalendarModel`
- **CalendarIntervalModel**: `Scheduler.model.CalendarIntervalModel`

---

*Priority 2: Medium Priority Features*
