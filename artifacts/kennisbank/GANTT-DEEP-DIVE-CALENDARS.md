# Gantt Deep Dive: Calendars

> **Werktijden en planning** met kalenders, werkdagen, feestdagen, TaskNonWorkingTime feature, en resource-specifieke kalenders.

---

## Overzicht

Kalenders definiëren wanneer werk kan plaatsvinden. Ze bepalen werkdagen, werktijden, en uitzonderingen zoals feestdagen. Taken passen hun duur automatisch aan op basis van beschikbare werktijd.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Task              │ Calendar    │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun│
├──────────────────────────────────────────────────────────────────────────┤
│ Development       │ Standard    │ ███ │ ███ │ ███ │ ███ │ ███ │░░░░░│░░░░░│
│ Support           │ 24/7        │ ███ │ ███ │ ███ │ ███ │ ███ │ ███ │ ███ │
│ Part-time Task    │ Part-time   │ █░░ │ █░░ │ █░░ │ █░░ │ █░░ │░░░░░│░░░░░│
├──────────────────────────────────────────────────────────────────────────┤
│ Holiday: Christmas│             │     │     │░░░░░│░░░░░│░░░░░│░░░░░│░░░░░│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Calendar Model

### 1.1 Basis Calendar Configuratie

```javascript
import { ProjectModel, CalendarModel } from '@bryntum/gantt';

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
        }
    ],

    // Project gebruikt 'general' calendar
    calendar: 'general'
});
```

### 1.2 Werkdagen en Werktijden

```javascript
calendarsData: [
    {
        id: 'standard',
        name: 'Standard Work Week',
        unspecifiedTimeIsWorking: false,  // Niet-gedefinieerde tijd is vrij

        intervals: [
            // Werkdagen: Ma-Vr, 9:00-17:00
            {
                recurrentStartDate: 'every weekday at 09:00',
                recurrentEndDate: 'every weekday at 17:00',
                isWorking: true
            },
            // Lunchpauze
            {
                recurrentStartDate: 'every weekday at 12:00',
                recurrentEndDate: 'every weekday at 13:00',
                isWorking: false
            }
        ]
    }
]
```

### 1.3 24/7 Calendar

```javascript
{
    id: '24-7',
    name: '24/7 Operations',
    unspecifiedTimeIsWorking: true,  // Altijd werkend
    intervals: []  // Geen uitzonderingen
}
```

---

## 2. Calendar Intervals

### 2.1 Recurrent Intervals

```javascript
intervals: [
    // Elke zaterdag en zondag
    {
        recurrentStartDate: 'on Sat at 0:00',
        recurrentEndDate: 'on Mon at 0:00',
        isWorking: false,
        name: 'Weekend'
    },

    // Elke dag van 18:00 tot 08:00 volgende dag
    {
        recurrentStartDate: 'at 18:00',
        recurrentEndDate: 'at 08:00',
        isWorking: false,
        name: 'Night hours'
    },

    // Eerste maandag van de maand
    {
        recurrentStartDate: 'on first Monday of month at 0:00',
        recurrentEndDate: 'on first Monday of month at 23:59',
        isWorking: false,
        name: 'Monthly meeting day'
    }
]
```

### 2.2 Static Intervals (Feestdagen)

```javascript
intervals: [
    // Specifieke datums
    {
        startDate: '2024-12-25',
        endDate: '2024-12-26',
        isWorking: false,
        name: 'Christmas Day'
    },
    {
        startDate: '2024-12-26',
        endDate: '2024-12-27',
        isWorking: false,
        name: 'Boxing Day'
    },
    {
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        isWorking: false,
        name: 'New Year'
    }
]
```

### 2.3 Mixed Intervals

```javascript
{
    id: 'dutch-calendar',
    name: 'Dutch Work Calendar',
    intervals: [
        // Weekends (recurring)
        {
            recurrentStartDate: 'on Sat at 0:00',
            recurrentEndDate: 'on Mon at 0:00',
            isWorking: false
        },

        // Nederlandse feestdagen 2024 (static)
        { startDate: '2024-01-01', endDate: '2024-01-02', isWorking: false, name: 'Nieuwjaarsdag' },
        { startDate: '2024-04-27', endDate: '2024-04-28', isWorking: false, name: 'Koningsdag' },
        { startDate: '2024-05-05', endDate: '2024-05-06', isWorking: false, name: 'Bevrijdingsdag' },
        { startDate: '2024-05-09', endDate: '2024-05-10', isWorking: false, name: 'Hemelvaartsdag' },
        { startDate: '2024-05-19', endDate: '2024-05-21', isWorking: false, name: 'Pinksteren' },
        { startDate: '2024-12-25', endDate: '2024-12-27', isWorking: false, name: 'Kerst' }
    ]
}
```

---

## 3. Task Calendars

### 3.1 Task-Specific Calendar

```javascript
// Taken kunnen eigen calendar hebben
tasksData: [
    {
        id: 1,
        name: 'Standard Task',
        calendar: 'standard',  // Gebruikt standard calendar
        startDate: '2024-02-01',
        duration: 5
    },
    {
        id: 2,
        name: 'Urgent Task',
        calendar: '24-7',  // Gebruikt 24/7 calendar
        startDate: '2024-02-01',
        duration: 5  // 5 dagen = 120 uur werkelijk
    }
]
```

### 3.2 Calendar Column

```javascript
columns: [
    { type: 'name', width: 200 },
    {
        type: 'calendar',
        text: 'Calendar',
        width: 150,
        editor: {
            type: 'combo',
            valueField: 'id',
            displayField: 'name'
        }
    }
]
```

---

## 4. Resource Calendars

### 4.1 Resource-Specific Availability

```javascript
resourcesData: [
    {
        id: 'r1',
        name: 'John',
        calendar: 'standard'
    },
    {
        id: 'r2',
        name: 'Jane',
        calendar: 'part-time'  // Werkt alleen ochtenden
    },
    {
        id: 'r3',
        name: 'Support Team',
        calendar: '24-7'
    }
]
```

### 4.2 Part-Time Calendar

```javascript
{
    id: 'part-time',
    name: 'Part-time (Mornings)',
    unspecifiedTimeIsWorking: false,
    intervals: [
        {
            recurrentStartDate: 'every weekday at 09:00',
            recurrentEndDate: 'every weekday at 13:00',
            isWorking: true
        }
    ]
}
```

### 4.3 Effectieve Calendar Berekening

```javascript
// Wanneer taak en resource beide calendars hebben:
// effectiveCalendar = intersection van beide

// Task calendar: Ma-Vr 9:00-17:00
// Resource calendar: Ma-Wo-Vr 9:00-17:00
// Effectief: Ma-Wo-Vr 9:00-17:00

class TaskModel extends Model {
    get effectiveCalendar() {
        const taskCalendar = this.calendar;
        const resourceCalendars = this.assignments
            .map(a => a.resource?.calendar)
            .filter(Boolean);

        if (resourceCalendars.length === 0) {
            return taskCalendar;
        }

        // Combine calendars
        return this.project.combineCalendars([taskCalendar, ...resourceCalendars]);
    }
}
```

---

## 5. TaskNonWorkingTime Feature

### 5.1 Feature Activeren

```javascript
const gantt = new Gantt({
    features: {
        taskNonWorkingTime: true
    }
});
```

### 5.2 Visual Indicators

```javascript
features: {
    taskNonWorkingTime: {
        // Toon non-working time in taakbalk
        showInTaskBar: true,

        // Styling
        cls: 'task-non-working'
    }
}
```

### 5.3 Non-Working Time Styling

```css
/* Non-working time overlay in taak */
.b-task-non-working-time {
    background: repeating-linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.1),
        rgba(0, 0, 0, 0.1) 4px,
        transparent 4px,
        transparent 8px
    );
}

/* Alternatief: strepen */
.task-non-working {
    background: repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 3px,
        rgba(255, 255, 255, 0.3) 3px,
        rgba(255, 255, 255, 0.3) 6px
    );
}
```

---

## 6. Non-Working Time Zones

### 6.1 Feature Configuratie

```javascript
features: {
    nonWorkingTime: {
        // Toon non-working time in timeline
        highlightWeekends: true,

        // Custom styling per interval type
        store: {
            data: [
                {
                    startDate: '2024-12-25',
                    endDate: '2024-12-26',
                    name: 'Christmas',
                    cls: 'holiday'
                }
            ]
        }
    }
}
```

### 6.2 Timeline Styling

```css
/* Weekend highlighting */
.b-sch-nonworking-time {
    background: rgba(0, 0, 0, 0.05);
}

/* Holiday highlighting */
.b-sch-nonworking-time.holiday {
    background: rgba(244, 67, 54, 0.1);
}

/* Night hours */
.b-sch-nonworking-time.night {
    background: rgba(63, 81, 181, 0.1);
}
```

---

## 7. Calendar CRUD

### 7.1 Runtime Calendar Updates

```javascript
// Voeg holiday toe aan calendar
function addHoliday(calendarId, date, name) {
    const calendar = project.calendarManagerStore.getById(calendarId);

    calendar.addInterval({
        startDate: date,
        endDate: DateHelper.add(date, 1, 'day'),
        isWorking: false,
        name
    });

    // Herbereken taken
    project.propagate();
}

// Verwijder interval
function removeInterval(calendarId, intervalId) {
    const calendar = project.calendarManagerStore.getById(calendarId);
    const interval = calendar.intervals.find(i => i.id === intervalId);

    if (interval) {
        calendar.removeInterval(interval);
        project.propagate();
    }
}
```

### 7.2 Calendar Editor Dialog

```javascript
function showCalendarEditor(calendarId) {
    const calendar = project.calendarManagerStore.getById(calendarId);

    new Popup({
        title: `Edit Calendar: ${calendar.name}`,
        width: 600,
        height: 400,
        items: [
            {
                type: 'grid',
                ref: 'intervalsGrid',
                flex: 1,
                store: {
                    data: calendar.intervals.map(i => ({
                        id: i.id,
                        startDate: i.startDate || i.recurrentStartDate,
                        endDate: i.endDate || i.recurrentEndDate,
                        isWorking: i.isWorking,
                        name: i.name
                    }))
                },
                columns: [
                    { text: 'Name', field: 'name', flex: 1 },
                    { text: 'Start', field: 'startDate', type: 'date' },
                    { text: 'End', field: 'endDate', type: 'date' },
                    { text: 'Working', field: 'isWorking', type: 'check' }
                ]
            }
        ],
        bbar: [
            {
                text: 'Add Holiday',
                onClick: () => {
                    // Voeg nieuwe interval toe
                }
            },
            '->',
            {
                text: 'Save',
                onClick: () => {
                    // Save changes
                }
            }
        ]
    }).show();
}
```

---

## 8. Duration Calculations

### 8.1 Werkdagen vs Kalenderdagen

```javascript
// Duration in werkdagen (respecteert calendar)
{
    name: 'Development',
    startDate: '2024-02-01', // Donderdag
    duration: 5,             // 5 werkdagen
    durationUnit: 'day'      // Einddatum = 7 feb (Do, Vr, [Za, Zo], Ma, Di, Wo)
}

// Duration in kalenderdagen
{
    name: 'Waiting Period',
    startDate: '2024-02-01',
    duration: 5,
    durationUnit: 'day',
    calendar: 'calendar-days'  // Calendar waar elke dag werkdag is
}
```

### 8.2 Effort vs Duration

```javascript
// Effort-based scheduling
{
    name: 'Task with Effort',
    startDate: '2024-02-01',
    effort: 40,          // 40 uur werk
    effortUnit: 'hour',
    schedulingMode: 'FixedDuration'
}

// Bij 8-uur werkdag calendar:
// 40 uur / 8 uur per dag = 5 werkdagen
```

### 8.3 Calendar Query Methods

```javascript
const calendar = project.calendarManagerStore.getById('standard');

// Is specifieke datum werkdag?
calendar.isWorkingDay(new Date('2024-02-03')); // false (zaterdag)

// Werkuren op specifieke dag
calendar.getWorkingHours(new Date('2024-02-01')); // 8

// Volgende werkdag
calendar.getNextWorkingDay(new Date('2024-02-02')); // 2024-02-05 (maandag)

// Bereken einddatum van duratie
calendar.calculateEndDate(
    new Date('2024-02-01'),
    5,
    'day'
); // 2024-02-07

// Bereken werkdagen tussen datums
calendar.getWorkingDays(
    new Date('2024-02-01'),
    new Date('2024-02-15')
); // 10 (exclusief weekends)
```

---

## 9. Calendar Hierarchy

### 9.1 Parent-Child Calendars

```javascript
calendarsData: [
    {
        id: 'base',
        name: 'Base Calendar',
        intervals: [
            // Weekends
            {
                recurrentStartDate: 'on Sat at 0:00',
                recurrentEndDate: 'on Mon at 0:00',
                isWorking: false
            }
        ],

        children: [
            {
                id: 'nl',
                name: 'Netherlands',
                // Erft weekends van parent, voegt holidays toe
                intervals: [
                    { startDate: '2024-04-27', endDate: '2024-04-28', isWorking: false, name: 'Koningsdag' }
                ]
            },
            {
                id: 'de',
                name: 'Germany',
                intervals: [
                    { startDate: '2024-10-03', endDate: '2024-10-04', isWorking: false, name: 'Tag der Deutschen Einheit' }
                ]
            }
        ]
    }
]
```

---

## 10. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useMemo } from 'react';

function CalendarGantt({ projectData }) {
    const [selectedCalendar, setSelectedCalendar] = useState('standard');

    const calendars = useMemo(() => [
        {
            id: 'standard',
            name: 'Standard (Mon-Fri)',
            intervals: [
                {
                    recurrentStartDate: 'on Sat at 0:00',
                    recurrentEndDate: 'on Mon at 0:00',
                    isWorking: false
                }
            ]
        },
        {
            id: '24-7',
            name: '24/7',
            unspecifiedTimeIsWorking: true,
            intervals: []
        }
    ], []);

    const columns = useMemo(() => [
        { type: 'name', width: 200 },
        { type: 'calendar', text: 'Calendar', width: 150 },
        { type: 'startdate' },
        { type: 'duration' }
    ], []);

    return (
        <div className="gantt-wrapper">
            <div className="toolbar">
                <label>
                    Project Calendar:
                    <select
                        value={selectedCalendar}
                        onChange={e => setSelectedCalendar(e.target.value)}
                    >
                        {calendars.map(cal => (
                            <option key={cal.id} value={cal.id}>
                                {cal.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <BryntumGantt
                columns={columns}
                projectConfig={{
                    ...projectData,
                    calendarsData: calendars,
                    calendar: selectedCalendar
                }}
                features={{
                    taskNonWorkingTime: true,
                    nonWorkingTime: {
                        highlightWeekends: true
                    }
                }}
            />
        </div>
    );
}
```

---

## 11. Styling

```css
/* Non-working time in timeline */
.b-sch-nonworking-time {
    background: repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 10px,
        rgba(0, 0, 0, 0.03) 10px,
        rgba(0, 0, 0, 0.03) 20px
    );
}

/* Weekend highlighting */
.b-sch-nonworking-time.weekend {
    background: rgba(0, 0, 0, 0.05);
}

/* Holiday highlighting */
.b-sch-nonworking-time.holiday {
    background: linear-gradient(
        135deg,
        rgba(244, 67, 54, 0.1) 25%,
        transparent 25%
    ),
    linear-gradient(
        225deg,
        rgba(244, 67, 54, 0.1) 25%,
        transparent 25%
    );
    background-size: 20px 20px;
}

/* Task non-working time overlay */
.b-gantt-task .b-task-non-working-time {
    position: absolute;
    top: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.4);
    pointer-events: none;
}

/* Calendar column badge */
.calendar-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25em;
    padding: 0.25em 0.5em;
    background: var(--calendar-color, #e0e0e0);
    border-radius: 4px;
    font-size: 0.85em;
}

.calendar-badge.standard { --calendar-color: #e3f2fd; }
.calendar-badge.24-7 { --calendar-color: #fff3e0; }
.calendar-badge.part-time { --calendar-color: #f3e5f5; }
```

---

## 12. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Taken niet aangepast aan calendar | Calendar niet gelinkt | Zet calendar property op taak |
| Weekends tellen mee | unspecifiedTimeIsWorking: true | Zet op false en definieer werkuren |
| Holidays niet zichtbaar | Verkeerde datum format | Gebruik ISO date strings |
| Duratie incorrect | Effort vs duration verwarring | Check schedulingMode |

---

## API Reference

### CalendarModel Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | String | Calendar naam |
| `intervals` | Array | Werk/vrije intervallen |
| `unspecifiedTimeIsWorking` | Boolean | Default voor niet-gedefinieerde tijd |
| `parent` | CalendarModel | Parent calendar |

### Interval Properties

| Property | Type | Description |
|----------|------|-------------|
| `startDate` | Date | Static start datum |
| `endDate` | Date | Static eind datum |
| `recurrentStartDate` | String | Recurrent start regel |
| `recurrentEndDate` | String | Recurrent eind regel |
| `isWorking` | Boolean | Is werktijd |
| `name` | String | Interval naam |

---

## Bronnen

- **Example**: `examples/calendars/`
- **CalendarModel**: `Scheduler.model.CalendarModel`
- **TaskNonWorkingTime**: `Gantt.feature.TaskNonWorkingTime`
- **NonWorkingTime**: `Scheduler.feature.NonWorkingTime`

---

*Track A: Foundation - Gantt Extensions (A2.6)*
