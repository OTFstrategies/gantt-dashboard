# Bryntum Gantt: Advanced Calendars Guide

> **Deep-dive** in het calendar systeem van Bryntum Gantt: recurrence rules, intervallen, resource calendars, en duration conversie.

---

## Overzicht

Het Bryntum calendar systeem biedt:
- **Performante Caching** - Snelle berekeningen voor grote aantallen calendars
- **Tree Structure** - Hierarchische calendar overerving
- **Later.js Syntax** - Krachtige recurrence rules
- **Resource Intersection** - Automatische calendar combinatie bij assignments

---

## 1. Calendar Basics

### 1.1 CalendarModel

```javascript
import { CalendarModel } from '@bryntum/gantt';

const calendar = new CalendarModel({
    id: 111,
    name: 'My cool calendar',
    intervals: [
        {
            // Non-working weekend
            recurrentStartDate: 'on Sat',
            recurrentEndDate: 'on Mon',
            isWorking: false
        }
    ]
});
```

### 1.2 Calendar Manager Store

```javascript
// Access via project
const calendarManager = project.calendarManagerStore;

// Iterate calendars
calendarManager.forEach(calendar => {
    console.log(calendar.name, calendar.intervals.count);
});

// Find calendar by ID
const calendar = calendarManager.getById(111);
```

---

## 2. Availability Intervals

### 2.1 Interval Types

| Type | Velden | Voorbeeld |
|------|--------|-----------|
| Static | `startDate`, `endDate` | Vakantie op specifieke datums |
| Recurrent | `recurrentStartDate`, `recurrentEndDate` | Elke weekend |
| Bounded Recurrent | Alle vier velden | Recurrend alleen in bepaalde periode |

### 2.2 isWorking Field

```javascript
// Default: calendar treats all time as working
// So we define NON-working intervals

intervals: [
    {
        recurrentStartDate: 'on Sat',
        recurrentEndDate: 'on Mon',
        isWorking: false  // Weekend is non-working
    }
]
```

### 2.3 unspecifiedTimeIsWorking

```javascript
// Inverteer default gedrag
const calendar = new CalendarModel({
    unspecifiedTimeIsWorking: false,  // Alles is default non-working
    intervals: [
        {
            recurrentStartDate: 'at 08:00',
            recurrentEndDate: 'at 17:00',
            isWorking: true  // Alleen dit is working
        }
    ]
});
```

---

## 3. Later.js Recurrence Syntax

### 3.1 Basic Patterns

| Pattern | Betekenis |
|---------|-----------|
| `on Sat` | Elke zaterdag om 00:00 |
| `on Mon` | Elke maandag om 00:00 |
| `at 08:00` | Elke dag om 08:00 |
| `at 17:00` | Elke dag om 17:00 |
| `every weekday` | Mon-Fri |
| `on Mon, Tue, Wed, Thu, Fri` | Expliciete weekdagen |

### 3.2 8-Hour/5-Day Calendar

```json
{
    "id": 555,
    "name": "8h / 5d calendar",
    "intervals": [
        {
            "recurrentStartDate": "every weekday at 12:00",
            "recurrentEndDate": "every weekday at 13:00",
            "isWorking": false
        },
        {
            "recurrentStartDate": "every weekday at 17:00",
            "recurrentEndDate": "every weekday at 08:00",
            "isWorking": false
        }
    ]
}
```

**Toelichting:** De twee intervallen definiëren:
1. Lunchpauze 12:00-13:00
2. Nacht + weekend: 17:00 → 08:00 volgende werkdag

### 3.3 6-Day Calendar (Mon-Sat)

```json
{
    "id": 666,
    "name": "8h / 6d calendar",
    "intervals": [
        {
            "recurrentStartDate": "on Mon, Tue, Wed, Thu, Fri, Sat at 12:00",
            "recurrentEndDate": "on Mon, Tue, Wed, Thu, Fri, Sat at 13:00",
            "isWorking": false
        },
        {
            "recurrentStartDate": "on Mon, Tue, Wed, Thu, Fri, Sat at 17:00",
            "recurrentEndDate": "on Mon, Tue, Wed, Thu, Fri, Sat at 08:00",
            "isWorking": false
        }
    ]
}
```

### 3.4 Bounded Recurrence

```json
{
    "id": 999,
    "name": "Summer hours (June only)",
    "intervals": [
        {
            "startDate": "2025-06-01",
            "endDate": "2025-07-01",
            "recurrentStartDate": "every weekday at 12:00",
            "recurrentEndDate": "every weekday at 08:00",
            "isWorking": false
        }
    ]
}
```

---

## 4. Static Intervals

### 4.1 Holiday Definition

```json
{
    "id": 123,
    "startDate": "2024-12-25",
    "endDate": "2024-12-26",
    "isWorking": false,
    "name": "Christmas Day"
}
```

### 4.2 Vacation Period

```json
{
    "id": 456,
    "startDate": "2024-07-15",
    "endDate": "2024-08-05",
    "isWorking": false,
    "name": "Summer Vacation"
}
```

### 4.3 Dynamic Interval Addition

```javascript
// Add holiday programmatically
calendar.addInterval({
    startDate: new Date(2024, 11, 25),
    endDate: new Date(2024, 11, 26),
    isWorking: false,
    name: 'Christmas'
});

// Add multiple
calendar.addIntervals([
    { startDate: '2024-12-25', endDate: '2024-12-26', isWorking: false },
    { startDate: '2024-12-31', endDate: '2025-01-02', isWorking: false }
]);
```

---

## 5. Intersecting Intervals (Priority Rules)

### 5.1 Conflict Resolution

Wanneer intervallen overlappen:

1. **Child calendar** wint van parent
2. **Static intervals** winnen van recurrent
3. **Hogere priority** wint (bij gelijke type)
4. **Later index** wint (bij gelijke priority)

### 5.2 Priority Field

```json
{
    "intervals": [
        {
            "recurrentStartDate": "at 08:00",
            "recurrentEndDate": "at 16:00",
            "isWorking": true,
            "priority": 10
        },
        {
            "recurrentStartDate": "on Sat",
            "recurrentEndDate": "on Mon",
            "isWorking": false,
            "priority": 20
        }
    ]
}
```

---

## 6. Parent Calendars (Inheritance)

### 6.1 Tree Structure

```json
{
    "calendars": {
        "rows": [
            {
                "id": 1,
                "name": "Default",
                "intervals": [
                    {
                        "recurrentStartDate": "on Sat",
                        "recurrentEndDate": "on Mon",
                        "isWorking": false
                    }
                ],
                "children": [
                    {
                        "id": 11,
                        "name": "Team1 calendar",
                        "intervals": [
                            {
                                "name": "Team Vacation 2024",
                                "startDate": "2024-08-14",
                                "endDate": "2024-09-14",
                                "isWorking": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
```

### 6.2 Overerving

- Team1 calendar erft automatisch weekend van Default
- Team1 voegt eigen vacation toe
- `unspecifiedTimeIsWorking` wordt NIET geërfd

---

## 7. Resource Calendars

### 7.1 Intersection Gedrag

Wanneer een taak resources heeft:
- Taak kan alleen werken wanneer BEIDE calendars working zijn
- Automatische intersection van taak + resource calendars

### 7.2 Voorbeeld

```
Task calendar: 08:00-17:00 (Mon-Fri)
Resource A calendar: 09:00-13:00

Effective working time: 09:00-12:00 (intersection)
```

### 7.3 Ignore Resource Calendar

```javascript
// Negeer resource calendars voor deze taak
task.ignoreResourceCalendar = true;
```

### 7.4 FixedDuration Exception

Tasks met `schedulingMode: 'FixedDuration'` negeren resource calendars voor duration berekening (maar niet voor effort).

---

## 8. Duration Conversie

### 8.1 Project Settings

```javascript
const project = new ProjectModel({
    hoursPerDay: 8,    // 1 day = 8 hours
    daysPerWeek: 5,    // 1 week = 5 days
    daysPerMonth: 20,  // 1 month = 20 days
    calendar: 'general'
});
```

### 8.2 Matching Calendar met Settings

```json
{
    "project": {
        "calendar": 777,
        "hoursPerDay": 8,
        "daysPerWeek": 5,
        "daysPerMonth": 20
    },
    "calendars": {
        "rows": [{
            "id": 777,
            "name": "Default 8h/5d",
            "intervals": [...]
        }]
    }
}
```

### 8.3 Calendar-level Duration Conversion (Legacy)

```javascript
// Restore Ext JS Gantt gedrag: per-calendar conversie
import { DurationConverterMixin, CalendarModel } from '@bryntum/gantt';

class MyCalendarModel extends DurationConverterMixin.derive(CalendarModel) {
    // Calendar krijgt nu hoursPerDay, daysPerWeek, daysPerMonth fields
}

// Custom task model om calendar te gebruiken voor conversie
class MyTaskModel extends TaskModel {
    *convertDurationGen(duration, fromUnit, toUnit) {
        const converter = yield this.$.effectiveCalendar;
        return yield* converter.$convertDuration(duration, fromUnit, toUnit);
    }
}
```

---

## 9. DST Considerations

### 9.1 Timezone Issues

```javascript
// PROBLEEM: 0:00 bestaat niet op DST change dag
{
    "recurrentStartDate": "on Fri at 0:00",  // ❌ Kan mislukken
    "recurrentEndDate": "on Sat at 0:00"
}

// OPLOSSING: Laat tijd weg
{
    "recurrentStartDate": "on Fri",  // ✅ LaterJS kiest begin van dag
    "recurrentEndDate": "on Sat"
}
```

### 9.2 Invalid Interval Detection

```javascript
class MyCalendar extends CalendarModel {
    static fields = [
        // Throw exception bij invalid intervals
        { name: 'treatInconsistentIntervals', defaultValue: 'Throw' }
    ];
}
```

---

## 10. API Methods

### 10.1 Set Calendar

```javascript
// Async - triggers recalculation
await task.setCalendar(newCalendar);
await resource.setCalendar(newCalendar);
await project.setCalendar(newCalendar);
```

### 10.2 Calendar Column

```javascript
columns: [
    { type: 'calendar' }  // Dropdown voor calendar selectie
]
```

### 10.3 Task Editor Integration

Calendar field is beschikbaar op "Advanced" tab van TaskEditor.

---

## 11. Loading Calendars

### 11.1 Via CrudManager Response

```json
{
    "success": true,
    "project": {
        "calendar": 9999,
        "hoursPerDay": 8,
        "daysPerWeek": 5,
        "daysPerMonth": 20
    },
    "calendars": {
        "rows": [
            {
                "id": 9999,
                "name": "My calendar",
                "intervals": [...]
            }
        ]
    }
}
```

### 11.2 Inline Data

```javascript
const project = new ProjectModel({
    calendar: 9999,
    hoursPerDay: 8,
    daysPerWeek: 5,
    daysPerMonth: 20,

    calendars: [
        {
            id: 9999,
            name: 'My calendar',
            intervals: [...]
        }
    ]
});
```

---

## 12. Common Calendar Patterns

### 12.1 24/7 (Default)

```javascript
// Geen intervals = 24/7 working
const calendar = new CalendarModel({
    id: 'alltime',
    name: '24/7'
});
```

### 12.2 Standard Business Hours

```json
{
    "id": "business",
    "name": "Business Hours",
    "intervals": [
        {
            "recurrentStartDate": "every weekday at 17:00",
            "recurrentEndDate": "every weekday at 09:00",
            "isWorking": false
        }
    ]
}
```

### 12.3 Night Shift

```json
{
    "id": "nightshift",
    "name": "Night Shift",
    "unspecifiedTimeIsWorking": false,
    "intervals": [
        {
            "recurrentStartDate": "at 22:00",
            "recurrentEndDate": "at 06:00",
            "isWorking": true
        }
    ]
}
```

### 12.4 Part-time (Mon-Wed)

```json
{
    "id": "parttime",
    "name": "Part-time",
    "intervals": [
        {
            "recurrentStartDate": "on Thu",
            "recurrentEndDate": "on Mon",
            "isWorking": false
        },
        {
            "recurrentStartDate": "on Mon, Tue, Wed at 17:00",
            "recurrentEndDate": "on Mon, Tue, Wed at 09:00",
            "isWorking": false
        }
    ]
}
```

---

## Zie Ook

- [GANTT-IMPL-CALENDARS.md](./GANTT-IMPL-CALENDARS.md) - Basic calendar setup
- [GANTT-API-PROJECTMODEL.md](./GANTT-API-PROJECTMODEL.md) - Project configuration
- [GANTT-IMPL-RESOURCES.md](./GANTT-IMPL-RESOURCES.md) - Resource management

---

*Track A - Gantt Implementation - Advanced Calendars*
