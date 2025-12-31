# Bryntum Calendars & Customization - Official Guide

> **Bron**: Officiële Bryntum Gantt v7.1.0 documentatie

---

## Deel 1: Calendars Systeem

### Overzicht

Bryntum Gantt heeft een krachtig calendar systeem dat bepaalt wanneer werk aan taken kan worden uitgevoerd.

**Key concepts:**
- Calendars kunnen worden toegewezen aan project, tasks en resources
- Default: 24/7/365 beschikbaarheid als geen calendar geconfigureerd
- Calendars zijn georganiseerd in een tree store (inheritance)
- Uitgebreide caching voor performance

### Calendar Manager Store

```javascript
// Toegang tot calendar manager
const calendarStore = gantt.project.calendarManagerStore;

// Itereren over calendars
calendarStore.forEach(calendar => {
    console.log(calendar.name, calendar.intervals);
});
```

### Calendar Model Structuur

```javascript
new CalendarModel({
    id: 111,
    name: "My cool calendar",
    intervals: [
        {
            recurrentStartDate: "on Sat",
            recurrentEndDate: "on Mon",
            isWorking: false
        }
    ]
});
```

---

## Availability Intervals

### Recurrent Intervals (Herhalend)

Gebruik Later.js syntax voor herhalende periodes:

**8 uur per dag, 5 dagen per week (met lunch):**

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

**6 dagen per week:**

```json
{
    "recurrentStartDate": "on Mon, Tue, Wed, Thu, Fri, Sat at 12:00",
    "recurrentEndDate": "on Mon, Tue, Wed, Thu, Fri, Sat at 13:00",
    "isWorking": false
}
```

**Later.js Syntax Reference:**
- `on Mon, Tue, Wed` - specifieke dagen
- `every weekday` - maandag t/m vrijdag
- `at 08:00` - specifieke tijd
- `on Sat`, `on Sun` - weekend dagen

### Static Intervals (Vast)

Voor specifieke datums zoals vakanties:

```json
{
    "id": 123,
    "startDate": "2020-10-02",
    "endDate": "2020-10-12",
    "isWorking": false,
    "name": "Vacation"
}
```

### Interval Toevoegen via API

```javascript
// Enkele interval toevoegen
calendar.addInterval({
    startDate: new Date(2020, 9, 1),
    endDate: new Date(2020, 9, 2),
    isWorking: false
});

// Meerdere intervals
calendar.addIntervals([...]);
```

---

## Intersecting Intervals Regels

Bij overlappende intervals:

1. Child calendar intervals winnen van parent
2. Static intervals winnen van recurrent (zelfde calendar)
3. Hogere `priority` waarde wint
4. Bij gelijke priority: laatste in array wint

```json
{
    "id": 1,
    "name": "My Calendar",
    "intervals": [
        {
            "recurrentStartDate": "at 08:00",
            "recurrentEndDate": "at 16:00",
            "isWorking": true
        },
        {
            "recurrentStartDate": "on Sat",
            "recurrentEndDate": "on Mon",
            "isWorking": false,
            "priority": 10
        }
    ],
    "unspecifiedTimeIsWorking": false
}
```

---

## Duration Berekening

### Project Duration Settings

```javascript
const project = new ProjectModel({
    hoursPerDay: 8,    // 1 dag = 8 uur
    daysPerWeek: 5,    // 1 week = 5 dagen
    daysPerMonth: 20   // 1 maand = 20 dagen
});
```

### Voorbeeld Duration Berekening

Task: start `2020-10-07 08:00`, calendar `08:00-12:00, 13:00-17:00`

Bij instellen duration `2 dagen`:
1. Convert: 2 dagen × 8 uur = 16 uur
2. Itereer working intervals:
   - `07 okt 08:00-12:00` = 4 uur
   - `07 okt 13:00-17:00` = 8 uur
   - `08 okt 08:00-12:00` = 12 uur
   - `08 okt 13:00-17:00` = 16 uur ✓
3. Resultaat: end date = `2020-10-08 17:00`

---

## Resource Calendars

Bij assigned resources wordt intersection van task en resource calendars gebruikt.

```javascript
// Resource calendar negeren
task.ignoreResourceCalendar = true;
```

**Voorbeeld:**
- Task calendar: `08:00-12:00, 13:00-17:00`
- Resource A calendar: `09:00-13:00`
- Effectieve working time: `09:00-12:00` (intersection)

---

## Parent Calendars (Inheritance)

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
                                "name": "Vacation 2020",
                                "startDate": "2020-08-14",
                                "endDate": "2020-09-14",
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

**Let op:** `unspecifiedTimeIsWorking` wordt NIET geërfd!

---

## Calendar Laden

### Via CrudManager Response

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

### Inline Data

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

## Deel 2: Task Editor Customization

### Default Tabs

| Tab Ref | Text | Weight | Beschrijving |
|---------|------|--------|--------------|
| `generalTab` | General | 100 | Name, dates, duration, % done, effort |
| `predecessorsTab` | Predecessors | 200 | Incoming dependencies grid |
| `successorsTab` | Successors | 300 | Outgoing dependencies grid |
| `resourcesTab` | Resources | 400 | Assigned resources grid |
| `advancedTab` | Advanced | 500 | Calendar, scheduling mode, constraints |
| `notesTab` | Notes | 600 | Text area voor notities |

### General Tab Fields

| Field Ref | Type | Weight | Beschrijving |
|-----------|------|--------|--------------|
| `name` | TextField | 100 | Task naam |
| `percentDone` | NumberField | 200 | Voortgang % |
| `effort` | DurationField | 300 | Benodigde werktijd |
| `divider` | Widget | 400 | Visuele scheiding |
| `startDate` | DateField | 500 | Start datum |
| `endDate` | DateField | 600 | Eind datum |
| `duration` | NumberField | 700 | Duur |

### Advanced Tab Fields

| Field Ref | Type | Weight |
|-----------|------|--------|
| `calendarField` | CalendarField | 100 |
| `manuallyScheduledField` | Checkbox | 200 |
| `schedulingModeField` | Combo | 300 |
| `effortDrivenField` | Checkbox | 400 |
| `constraintTypeField` | Combo | 600 |
| `constraintDateField` | DateField | 700 |
| `rollupField` | Checkbox | 800 |
| `inactiveField` | Checkbox | 900 |
| `ignoreResourceCalendarField` | Checkbox | 1000 |

---

## Task Editor Uitschakelen

```javascript
const gantt = new Gantt({
    features: {
        taskEdit: false
    }
});
```

### Dynamisch Enable/Disable

```javascript
// Disable
gantt.features.taskEdit.disabled = true;

// Enable
gantt.features.taskEdit.disabled = false;
```

---

## Tabs en Fields Verwijderen

```javascript
const gantt = new Gantt({
    features: {
        taskEdit: {
            items: {
                generalTab: {
                    items: {
                        percentDone: false,
                        effort: false,
                        divider: false
                    }
                },
                notesTab: false,
                predecessorsTab: false,
                successorsTab: false,
                resourcesTab: false,
                advancedTab: false
            }
        }
    }
});
```

---

## Tabs en Fields Aanpassen

```javascript
const gantt = new Gantt({
    features: {
        taskEdit: {
            items: {
                generalTab: {
                    title: 'Main',  // Tab hernoemen
                    items: {
                        percentDone: {
                            label: 'Status'  // Field label aanpassen
                        }
                    }
                }
            }
        }
    }
});
```

---

## Custom Tabs en Fields Toevoegen

```javascript
const gantt = new Gantt({
    features: {
        taskEdit: {
            items: {
                generalTab: {
                    items: {
                        newGeneralField: {
                            type: 'textfield',
                            weight: 710,
                            label: 'New field in General Tab',
                            name: 'custom'  // Koppelt aan task.custom
                        }
                    }
                },
                newTab: {
                    title: 'New tab',
                    weight: 90,  // Voor General tab
                    items: {
                        newTabField: {
                            type: 'textfield',
                            weight: 100,
                            label: 'Custom Field',
                            name: 'name'
                        }
                    }
                }
            }
        }
    }
});
```

---

## Custom Editor Vervangen

```javascript
const gantt = new Gantt({
    listeners: {
        beforeTaskEdit({ taskRecord, taskElement }) {
            const editor = new Popup({
                forElement: taskElement,
                closeAction: 'destroy',
                items: {
                    name: {
                        type: 'textfield',
                        label: 'Name',
                        value: taskRecord.name
                    },
                    save: {
                        type: 'button',
                        text: 'Save',
                        color: 'b-green',
                        onClick: () => {
                            taskRecord.name = editor.widgetMap.name.value;
                            editor.close();
                        }
                    }
                }
            });

            return false;  // Prevent default editor
        }
    }
});
```

---

## Dynamic Field Updates

```javascript
const gantt = new Gantt({
    features: {
        taskEdit: {
            items: {
                equipment: { /* config */ },
                volume: { /* config */ }
            }
        }
    },
    listeners: {
        beforeTaskEditShow({ editor, taskRecord }) {
            const equipmentCombo = editor.widgetMap.equipment;
            const volumeField = editor.widgetMap.volume;

            // Update combo data
            equipmentCombo.items = this.equipmentStore.getRange();

            // Conditional visibility
            volumeField.hidden = !taskRecord.hasVolume;
        }
    }
});
```

---

## Calendar UI Components

### CalendarColumn

```javascript
columns: [
    { type: 'calendar', text: 'Calendar', width: 150 }
]
```

### CalendarField in Task Editor

Beschikbaar in Advanced tab - toont dropdown met beschikbare calendars.

### Calendar Toewijzen via API

```javascript
// Returns Promise
await task.setCalendar(calendarModel);
await project.setCalendar(calendarModel);
await resource.setCalendar(calendarModel);
```

---

## Timezone Considerations

**DST waarschuwing**: Sommige datums/tijden bestaan niet door DST wijzigingen.

```javascript
// FOUT - 0:00 bestaat mogelijk niet
{
    "recurrentStartDate": "on Fri at 0:00",
    "recurrentEndDate": "on Sat at 0:00"
}

// GOED - Laat tijd weg
{
    "recurrentStartDate": "on Fri",
    "recurrentEndDate": "on Sat"
}
```

**Development debugging:**

```javascript
class MyCalendar extends CalendarModel {
    static fields = [
        { name: 'treatInconsistentIntervals', defaultValue: 'Throw' }
    ];
}
```

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
