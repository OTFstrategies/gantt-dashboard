# Calendar Implementation: Recurring Events

> **Fase 6.5** - Implementatie guide voor RecurrenceRule, RRULE parsing, exception dates en recurrence UI.

---

## Overzicht

Bryntum Calendar ondersteunt volledige RFC 5545 (iCalendar) recurrence rules voor herhalende events. De implementatie is gebaseerd op de `later.js` library.

### Componenten

| Component | Beschrijving |
|-----------|--------------|
| **RecurrenceRule** | RRULE string parsing & generation |
| **RecurringTimeSpan** | Mixin voor recurring events |
| **RecurrenceEditor** | UI voor recurrence configuratie |
| **RecurrenceConfirmationPopup** | "Edit this/all" dialog |
| **RecurrenceLegend** | Menselijk leesbare beschrijving |

---

## 1. RRULE Formaat

### Basis Syntax

```
FREQ=<frequency>;[INTERVAL=n];[COUNT=n|UNTIL=date];[BYDAY=...];[BYMONTH=...];...
```

### Frequenties

| FREQ | Beschrijving |
|------|--------------|
| DAILY | Elke dag |
| WEEKLY | Elke week |
| MONTHLY | Elke maand |
| YEARLY | Elk jaar |

### Common RRULE Voorbeelden

```javascript
// Dagelijks
"FREQ=DAILY"

// Elke werkdag
"FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"

// Wekelijks op dinsdag en donderdag
"FREQ=WEEKLY;BYDAY=TU,TH"

// Maandelijks op de eerste maandag
"FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1"

// Jaarlijks op 25 december
"FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25"

// Elke 2 weken op vrijdag
"FREQ=WEEKLY;INTERVAL=2;BYDAY=FR"

// 10 keer, elke dag
"FREQ=DAILY;COUNT=10"

// Tot 31 december 2024
"FREQ=WEEKLY;UNTIL=20241231T235959Z"
```

---

## 2. EventModel met Recurrence

### Recurrence Field

```typescript
interface EventModel {
    // RRULE string
    recurrenceRule: string;

    // Exception dates (skip these occurrences)
    exceptionDates: string | string[];

    // Check if recurring
    readonly isRecurring: boolean;

    // Check if occurrence (not base event)
    readonly isOccurrence: boolean;

    // Base event (for occurrences)
    readonly recurringTimeSpan: EventModel;

    // Get occurrences in range
    getOccurrencesForDateRange(
        startDate: Date,
        endDate: Date
    ): EventModel[];
}
```

### Recurring Event Data

```javascript
// Bron: examples/recurrence/data/data.json
{
    "events": {
        "rows": [
            {
                "id": 1,
                "startDate": "2020-01-01T10:00",
                "endDate": "2020-01-01T11:00",
                "name": "Scrum (twice/week)",
                "recurrenceRule": "FREQ=WEEKLY;BYDAY=TU,TH",
                "resourceId": "bryntum"
            },
            {
                "id": 2,
                "startDate": "2020-01-01T09:00",
                "endDate": "2020-01-01T12:00",
                "name": "Board meeting",
                "recurrenceRule": "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1",
                "resourceId": "bryntum"
            },
            {
                "id": 3,
                "startDate": "2020-01-01T17:30",
                "endDate": "2020-01-01T18:30",
                "name": "Happy hour",
                "recurrenceRule": "FREQ=WEEKLY;BYDAY=FR",
                "resourceId": "bryntum"
            }
        ]
    }
}
```

---

## 3. RecurrenceRule Parsing

### RecurrenceRule Class

```typescript
interface RecurrenceRule {
    // Frequency
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

    // Interval (every N periods)
    interval: number;

    // End condition
    count: number;        // N occurrences
    endDate: Date;        // or until date

    // Day specifications
    days: string[];       // ['MO', 'TU', 'WE', ...]

    // Position in month
    positions: number[];  // [1, -1] = first, last

    // Month specifications
    months: number[];     // [1, 12] = Jan, Dec
    monthDays: number[];  // [1, 15, -1] = 1st, 15th, last

    // Parse from string
    static parse(rrule: string): RecurrenceRule;

    // Convert to string
    toString(): string;
}
```

### Parsing Example

```javascript
import { RecurrenceRule } from '@bryntum/calendar';

// Parse RRULE string
const rule = RecurrenceRule.parse('FREQ=WEEKLY;BYDAY=MO,WE,FR');

console.log(rule.frequency);  // 'WEEKLY'
console.log(rule.days);       // ['MO', 'WE', 'FR']

// Create programmatically
const customRule = new RecurrenceRule({
    frequency: 'MONTHLY',
    interval: 1,
    days: ['TU'],
    positions: [2]  // Second Tuesday
});

console.log(customRule.toString());
// "FREQ=MONTHLY;BYDAY=TU;BYSETPOS=2"
```

---

## 4. Exception Dates

### Concept

Exception dates zijn datums waarop een recurring event NIET plaatsvindt. Dit wordt gebruikt wanneer één occurrence wordt verwijderd of verplaatst.

### Adding Exceptions

```javascript
// Get recurring event
const recurringEvent = eventStore.getById(1);

// Add exception (skip occurrence on specific date)
recurringEvent.addExceptionDate(new Date(2024, 5, 15));

// Or via field
recurringEvent.exceptionDates = [
    '2024-06-15',
    '2024-06-22'
];
```

### Exception vs Occurrence Edit

Wanneer een occurrence wordt gewijzigd:

1. **Exception wordt toegevoegd** aan base event
2. **Nieuwe event** wordt gemaakt voor de gewijzigde occurrence
3. Nieuwe event heeft `isOccurrence: false`

```javascript
// Edit single occurrence - system handles automatically
calendar.on('beforeEventSave', ({ eventRecord, values }) => {
    if (eventRecord.isOccurrence) {
        // Dit is een occurrence edit
        // Base event krijgt exception date
        // Nieuwe event wordt gemaakt
    }
});
```

---

## 5. Recurrence UI

### RecurrenceCombo

Dropdown voor snelle recurrence selectie:

```typescript
interface RecurrenceComboConfig {
    // Beschikbare opties
    items: RecurrenceOption[];

    // Selected value
    value: string;  // RRULE string of preset key
}

type RecurrenceOption = {
    text: string;
    value: string;  // 'none', 'daily', 'weekly', etc.
};
```

### Default RecurrenceCombo Opties

- None
- Daily
- Weekly on [day]
- Monthly on day [number]
- Monthly on [ordinal] [day]
- Yearly on [month] [day]
- Custom...

### EventEdit Integration

```javascript
features: {
    eventEdit: {
        items: {
            // Recurrence combo (default: enabled)
            recurrenceCombo: {
                weight: 500
            },

            // Edit recurrence button
            editRecurrenceButton: {
                weight: 510
            }
        }
    }
}
```

---

## 6. RecurrenceEditor

### Popup Dialog

De `RecurrenceEditor` is een popup voor geavanceerde recurrence configuratie.

```typescript
interface RecurrenceEditorConfig {
    // Initial values
    frequency: string;
    interval: number;
    endDate: Date;
    count: number;
    days: string[];
    positions: number[];
}
```

### Opening Editor

```javascript
// Via Calendar
calendar.editRecurrenceButton.trigger('click');

// Programmatisch
const editor = new RecurrenceEditor({
    record: eventRecord
});
editor.show();
```

### Editor Sections

1. **Frequency** - Daily/Weekly/Monthly/Yearly
2. **Interval** - Every N days/weeks/months/years
3. **On** - Specific days/dates
4. **Ends** - Never/After N/On date

---

## 7. RecurrenceConfirmationPopup

### "Edit This or All" Dialog

Wanneer een recurring event wordt gewijzigd, verschijnt een confirmation dialog:

```typescript
interface RecurrenceConfirmationPopupConfig {
    // Title
    title: string;

    // Options
    items: {
        changeMultipleButton: ButtonConfig;
        changeSingleButton: ButtonConfig;
        cancelButton: ButtonConfig;
    };
}
```

### Actions

| Actie | Beschrijving |
|-------|--------------|
| **This event only** | Wijzig alleen deze occurrence |
| **All events** | Wijzig base event (alle occurrences) |
| **Cancel** | Annuleer wijziging |

### Configuration

```javascript
const calendar = new Calendar({
    recurrenceConfirmationPopup: {
        title: 'Edit Recurring Event',
        items: {
            changeMultipleButton: {
                text: 'All future events'
            },
            changeSingleButton: {
                text: 'Just this one'
            }
        }
    }
});
```

---

## 8. RecurrenceLegend

### Menselijk Leesbare Beschrijving

```javascript
import { RecurrenceLegend } from '@bryntum/calendar';

const rule = 'FREQ=WEEKLY;BYDAY=MO,WE,FR';
const legend = RecurrenceLegend.getLegend(rule);

console.log(legend);
// "Every week on Monday, Wednesday and Friday"
```

### Localization

```javascript
// In locale file
const locale = {
    RecurrenceLegend: {
        'Daily': 'Dagelijks',
        'Weekly on {1}': 'Wekelijks op {1}',
        'Monthly on {1}': 'Maandelijks op {1}',
        'Every {0} weeks on {1}': 'Elke {0} weken op {1}'
    }
};
```

---

## 9. Contextual Recurrence Rules

### useContextualRecurrenceRules

Past recurrence opties aan op basis van de geselecteerde datum:

```javascript
const calendar = new Calendar({
    // Enable contextual rules
    useContextualRecurrenceRules: true,

    features: {
        eventEdit: {
            useContextualRecurrenceRules: true
        }
    }
});
```

### Voorbeeld

Als event op dinsdag staat:
- "Weekly on Tuesday"
- "Monthly on the first Tuesday"

Als event op 15e staat:
- "Monthly on day 15"

---

## 10. Occurrence Handling

### Get Occurrences

```javascript
const recurringEvent = eventStore.getById(1);

// Get occurrences in date range
const occurrences = recurringEvent.getOccurrencesForDateRange(
    new Date(2024, 0, 1),
    new Date(2024, 11, 31)
);

// Via calendar
const allOccurrences = calendar.getOccurrencesForDateRange(
    recurringEvent,
    startDate,
    endDate
);
```

### Occurrence Properties

```javascript
occurrence.isOccurrence;        // true
occurrence.isRecurring;         // false (dit is een occurrence)
occurrence.recurringTimeSpan;   // Reference naar base event
occurrence.occurrenceDate;      // Datum van deze occurrence
```

---

## 11. Programmatic Recurrence

### Create Recurring Event

```javascript
const recurringEvent = eventStore.add({
    name: 'Team Standup',
    startDate: '2024-01-02T09:00',
    endDate: '2024-01-02T09:30',
    recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR'
});
```

### Modify Recurrence

```javascript
// Change frequency
event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO,WE';

// End recurrence
event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO;COUNT=10';

// Remove recurrence
event.recurrenceRule = null;
```

### Delete Occurrence

```javascript
// Delete single occurrence
const occurrence = calendar.getEventRecord(clickedElement);

if (occurrence.isOccurrence) {
    // Add exception to base event
    occurrence.recurringTimeSpan.addExceptionDate(
        occurrence.startDate
    );
}
```

### Delete All

```javascript
// Delete recurring event (all occurrences)
eventStore.remove(recurringEvent);
```

---

## 12. Events & Callbacks

### Recurrence Events

```javascript
calendar.on({
    // Before recurrence edit
    beforeRecurrenceEdit({ eventRecord }) {
        console.log('Editing recurrence for:', eventRecord.name);
    },

    // Recurrence confirmation shown
    beforeRecurrenceConfirmation({ eventRecord, type }) {
        // type is 'edit', 'delete', 'drag', 'resize'
        console.log('Confirming:', type);
    },

    // User chose option
    recurrenceConfirmation({ eventRecord, type, choice }) {
        // choice is 'single', 'all', 'cancel'
        console.log('User chose:', choice);
    }
});
```

---

## 13. Complete Implementation Example

```javascript
import { Calendar, EventModel, RecurrenceRule } from '@bryntum/calendar';

// Custom event with recurrence validation
class MeetingEvent extends EventModel {
    static fields = [
        { name: 'location' },
        { name: 'organizer' }
    ];

    // Validate recurrence
    get isValidRecurrence() {
        if (!this.recurrenceRule) return true;

        const rule = RecurrenceRule.parse(this.recurrenceRule);

        // Max 52 occurrences per year
        if (rule.count && rule.count > 52) {
            return false;
        }

        return true;
    }
}

const calendar = new Calendar({
    appendTo: 'container',
    date: new Date(),

    crudManager: {
        eventStore: { modelClass: MeetingEvent },
        loadUrl: 'data/meetings.json',
        autoLoad: true
    },

    // Enable contextual rules
    useContextualRecurrenceRules: true,

    // Custom confirmation popup
    recurrenceConfirmationPopup: {
        title: 'Recurring Meeting',
        items: {
            changeMultipleButton: {
                text: 'Update all meetings'
            },
            changeSingleButton: {
                text: 'Update only this meeting'
            }
        }
    },

    features: {
        eventEdit: {
            items: {
                // Custom recurrence field layout
                recurrenceCombo: {
                    label: 'Repeat',
                    weight: 300
                },
                editRecurrenceButton: {
                    text: 'More options...',
                    weight: 310
                }
            }
        }
    },

    listeners: {
        beforeEventSave({ eventRecord }) {
            // Validate recurrence
            if (!eventRecord.isValidRecurrence) {
                Toast.show('Too many occurrences');
                return false;
            }
        },

        // Log recurrence changes
        recurrenceConfirmation({ eventRecord, choice }) {
            if (choice === 'all') {
                console.log('Updated all occurrences of:',
                    eventRecord.recurringTimeSpan?.name || eventRecord.name);
            }
        }
    }
});

// Helper: Create weekly meeting
function createWeeklyMeeting(name, day, time) {
    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const dayCode = days[day];

    return calendar.eventStore.add({
        name,
        startDate: getNextDay(day, time),
        endDate: getNextDay(day, time, 1),  // 1 hour later
        recurrenceRule: `FREQ=WEEKLY;BYDAY=${dayCode}`
    });
}

// Helper: Get next occurrence of day
function getNextDay(dayOfWeek, timeString, addHours = 0) {
    const today = new Date();
    const result = new Date(today);

    result.setDate(today.getDate() + (dayOfWeek - today.getDay() + 7) % 7);

    const [hours, minutes] = timeString.split(':').map(Number);
    result.setHours(hours + addHours, minutes, 0, 0);

    return result;
}

// Usage
createWeeklyMeeting('Team Sync', 1, '10:00');  // Monday at 10:00
createWeeklyMeeting('Sprint Review', 5, '14:00');  // Friday at 14:00
```

---

## 14. RRULE Quick Reference

### Frequency + Interval

```javascript
'FREQ=DAILY'                    // Elke dag
'FREQ=DAILY;INTERVAL=2'         // Elke 2 dagen
'FREQ=WEEKLY'                   // Elke week
'FREQ=WEEKLY;INTERVAL=2'        // Elke 2 weken
'FREQ=MONTHLY'                  // Elke maand
'FREQ=YEARLY'                   // Elk jaar
```

### Days

```javascript
'FREQ=WEEKLY;BYDAY=MO'          // Elke maandag
'FREQ=WEEKLY;BYDAY=MO,WE,FR'    // Ma, Wo, Vr
'FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1'   // Eerste maandag
'FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1'  // Laatste vrijdag
'FREQ=MONTHLY;BYDAY=TU;BYSETPOS=2'   // Tweede dinsdag
```

### End Conditions

```javascript
'FREQ=DAILY;COUNT=10'           // 10 keer
'FREQ=WEEKLY;UNTIL=20241231'    // Tot 31 dec 2024
// Geen end = oneindig
```

### Complex Rules

```javascript
// Elke 2 weken op ma, wo, vr tot eind jaar
'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;UNTIL=20241231T235959Z'

// Maandelijks op 1e en 3e maandag
'FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1,3'

// Jaarlijks op laatste vrijdag van november (Black Friday)
'FREQ=YEARLY;BYMONTH=11;BYDAY=FR;BYSETPOS=-1'
```

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `recurrence/` | Basic recurrence setup |
| `eventedit/` | Event editor met recurrence |
| `confirmation-dialogs/` | Custom confirmation dialogs |
| `localization/` | Recurrence legend localization |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
