# CALENDAR-IMPL-RECURRENCE.md

## Overzicht

Dit document beschrijft het recurrence (herhalende events) systeem in Bryntum Calendar. Het systeem is gebaseerd op de RFC-5545 standaard (iCalendar RRULE) en ondersteunt:

1. **RecurrenceModel** - Data model voor herhalingspatronen
2. **RecurrenceRule** - RFC-5545 RRULE expressies
3. **RecurrenceConfirmationPopup** - UI voor bewerking van recurring events
4. **RecurrenceLegend** - Mensleesbare beschrijvingen

---

## TypeScript Interfaces

### RecurrenceModelConfig (regel 264306)

```typescript
// calendar.d.ts:264306
type RecurrenceModelConfig = {
    // Frequentie van herhaling
    frequency?: 'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY'

    // Interval (elke N dagen/weken/maanden/jaren)
    interval?: number

    // Einde van herhaling
    count?: number     // Na N voorkomens
    endDate?: Date     // Tot datum

    // Dagen van de week
    days?: string[]    // ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

    // Dagen van de maand (-31..-1, 1..31)
    monthDays?: number[]

    // Maanden van het jaar (1-12)
    months?: number[]

    // Posities binnen interval
    positions?: number[]  // 1 to 366, of -366 to -1

    // Tree support
    children?: boolean|object[]|Model[]|ModelConfig[]
    expanded?: boolean
    parentId?: string|number|null

    // Read-only
    readOnly?: boolean
}
```

### RecurrenceModel Class (regel 264425)

```typescript
// calendar.d.ts:264425
export class RecurrenceModel extends Model {
    static readonly isRecurrenceModel: boolean
    readonly isRecurrenceModel: boolean

    // Frequentie velden
    frequency: 'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY'
    interval: number

    // Einde van herhaling
    count: number
    endDate: Date

    // Dag specificaties
    days: string[]       // ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
    monthDays: number[]  // [-31..-1, 1..31]
    months: number[]     // [1..12]
    positions: number[]  // [1..366] of [-366..-1]

    // RFC-5545 RRULE string
    rule: string

    // Gekoppelde timespan
    timeSpan: TimeSpan
}
```

### RecurrenceLegend (regel 244840)

```typescript
// calendar.d.ts:244840
export class RecurrenceLegend {
    /**
     * Returns a human-readable description of the recurrence
     */
    static getLegend(
        recurrence: RecurrenceModel,
        timeSpanStartDate?: Date
    ): string;
}
```

### Event Model Recurrence Fields

```typescript
// Op EventModel (via RecurringTimeSpan mixin)
interface EventModelRecurrenceFields {
    // RRULE string direct op event
    recurrenceRule?: string

    // RecurrenceModel object
    recurrence: RecurrenceModel

    // Is dit een occurrence (voorkomen) van een recurring event?
    isOccurrence: boolean

    // Is dit de basis recurring event?
    isRecurring: boolean

    // Originele recurring event (voor occurrences)
    recurringTimeSpan: EventModel

    // Exception dates (uitgesloten datums)
    exceptionDates: Date[]
}
```

---

## RRULE Syntax (RFC-5545)

### Basis Formaat

```
FREQ=<frequency>;[INTERVAL=<n>];[COUNT=<n>|UNTIL=<date>];[BYDAY=<days>];...
```

### Frequency Waarden

| Frequency | Beschrijving |
|-----------|--------------|
| `DAILY` | Elke dag |
| `WEEKLY` | Elke week |
| `MONTHLY` | Elke maand |
| `YEARLY` | Elk jaar |

### Dag Afkortingen

| Code | Dag |
|------|-----|
| `SU` | Zondag |
| `MO` | Maandag |
| `TU` | Dinsdag |
| `WE` | Woensdag |
| `TH` | Donderdag |
| `FR` | Vrijdag |
| `SA` | Zaterdag |

### RRULE Voorbeelden

```javascript
// Elke dag
"FREQ=DAILY"

// Elke 2 dagen
"FREQ=DAILY;INTERVAL=2"

// Elke werkdag (ma-vr)
"FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"

// Elke dinsdag en donderdag
"FREQ=WEEKLY;BYDAY=TU,TH"

// Elke 2 weken op maandag
"FREQ=WEEKLY;INTERVAL=2;BYDAY=MO"

// Eerste maandag van elke maand
"FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1"

// Laatste vrijdag van elke maand
"FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1"

// 15e van elke maand
"FREQ=MONTHLY;BYMONTHDAY=15"

// Elke 1e en 15e van de maand
"FREQ=MONTHLY;BYMONTHDAY=1,15"

// Elk jaar op 1 januari
"FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1"

// Elke 2e woensdag in maart
"FREQ=YEARLY;BYMONTH=3;BYDAY=WE;BYSETPOS=2"

// 10 keer herhalen
"FREQ=WEEKLY;BYDAY=MO;COUNT=10"

// Tot specifieke datum
"FREQ=DAILY;UNTIL=20251231T235959Z"
```

---

## Basis Configuratie

### Recurring Events in Data

```javascript
// data/events.json
{
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Dagelijkse standup",
                "startDate": "2025-01-06T09:00",
                "endDate": "2025-01-06T09:15",
                "recurrenceRule": "FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR"
            },
            {
                "id": 2,
                "name": "Wekelijkse teammeeting",
                "startDate": "2025-01-06T14:00",
                "endDate": "2025-01-06T15:00",
                "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO"
            },
            {
                "id": 3,
                "name": "Maandelijkse review",
                "startDate": "2025-01-01T10:00",
                "endDate": "2025-01-01T12:00",
                "recurrenceRule": "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1"
            }
        ]
    }
}
```

### Calendar met Recurrence

```javascript
import { Calendar } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo : 'container',

    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/events.json'
    },

    // Recurrence UI in event editor
    features : {
        eventEdit : {
            // Contextual recurrence rules (bijv. "Every Monday")
            useContextualRecurrenceRules : true
        }
    }
});
```

---

## Programmatisch Werken met Recurrence

### Recurring Event Aanmaken

```javascript
// Via recurrenceRule string
calendar.eventStore.add({
    name           : 'Dagelijks rapport',
    startDate      : new Date(2025, 0, 6, 17, 0),
    endDate        : new Date(2025, 0, 6, 17, 30),
    recurrenceRule : 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR'
});

// Via recurrence object
calendar.eventStore.add({
    name      : 'Wekelijkse sync',
    startDate : new Date(2025, 0, 7, 10, 0),
    endDate   : new Date(2025, 0, 7, 11, 0),
    recurrence : {
        frequency : 'WEEKLY',
        interval  : 1,
        days      : ['TU'],
        count     : 52  // 52 weken = 1 jaar
    }
});
```

### Recurrence Uitlezen

```javascript
const event = calendar.eventStore.getById(1);

// Check of event recurring is
if (event.isRecurring) {
    console.log('Dit is een recurring event');
    console.log('RRULE:', event.recurrenceRule);
    console.log('Frequency:', event.recurrence.frequency);
    console.log('Interval:', event.recurrence.interval);
    console.log('Days:', event.recurrence.days);
}

// Check of dit een occurrence is
if (event.isOccurrence) {
    console.log('Dit is een occurrence van:', event.recurringTimeSpan.name);
}
```

### Recurrence Wijzigen

```javascript
const event = calendar.eventStore.getById(1);

// Wijzig de RRULE
event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO,WE,FR';

// Of via recurrence object
event.recurrence.frequency = 'WEEKLY';
event.recurrence.interval = 2;
event.recurrence.days = ['MO', 'TH'];

// Recurrence verwijderen
event.recurrenceRule = null;
// of
event.recurrence = null;
```

### Occurrences Ophalen

```javascript
const recurringEvent = calendar.eventStore.getById(1);

// Alle occurrences in een periode
const startDate = new Date(2025, 0, 1);
const endDate = new Date(2025, 0, 31);

const occurrences = recurringEvent.getOccurrencesForDateRange(startDate, endDate);

occurrences.forEach(occurrence => {
    console.log(`${occurrence.name} op ${occurrence.startDate}`);
});
```

---

## RecurrenceLegend

### Mensleesbare Beschrijving

```javascript
import { RecurrenceLegend } from '@bryntum/calendar';

const event = calendar.eventStore.getById(1);

// Krijg beschrijving van recurrence
const description = RecurrenceLegend.getLegend(event.recurrence, event.startDate);

console.log(description);
// Bijv: "Every week on Monday, Tuesday"
// Of: "Every 2 weeks on Friday"
// Of: "Every month on the 1st Monday"
```

### In Custom UI

```javascript
// Custom recurrence info weergave
function showRecurrenceInfo(event) {
    if (!event.isRecurring) {
        return 'Eenmalig event';
    }

    const legend = RecurrenceLegend.getLegend(event.recurrence, event.startDate);

    return `
        <div class="recurrence-info">
            <i class="b-fa b-fa-repeat"></i>
            <span>${legend}</span>
        </div>
    `;
}
```

---

## Exception Dates

### Uitsluiten van Datums

```javascript
// Event met exception dates
calendar.eventStore.add({
    name           : 'Dagelijkse meeting',
    startDate      : new Date(2025, 0, 6, 9, 0),
    endDate        : new Date(2025, 0, 6, 10, 0),
    recurrenceRule : 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR',

    // Uitsluitingen (bijv. feestdagen)
    exceptionDates : [
        new Date(2025, 0, 1),   // Nieuwjaarsdag
        new Date(2025, 3, 21),  // Pasen
        new Date(2025, 4, 5)    // Bevrijdingsdag
    ]
});
```

### Exception Toevoegen

```javascript
const event = calendar.eventStore.getById(1);

// Voeg exception toe (bijv. bij verwijderen van een occurrence)
event.addExceptionDate(new Date(2025, 2, 17));

// Of meerdere tegelijk
event.exceptionDates = [
    ...event.exceptionDates,
    new Date(2025, 2, 24),
    new Date(2025, 2, 31)
];
```

---

## RecurrenceConfirmationPopup

### Standaard Gedrag

Wanneer een gebruiker een occurrence van een recurring event bewerkt, verschijnt automatisch een popup die vraagt:

- **"Only this event"** - Alleen deze occurrence wijzigen (maakt exception)
- **"All future events"** - Alle toekomstige occurrences wijzigen
- **"All events"** - Alle occurrences wijzigen

### Configuratie

```javascript
const calendar = new Calendar({
    // Custom confirmation popup
    recurrenceConfirmationPopup : {
        // Standaard opties
        title : 'Herhalend event bewerken',

        items : {
            // Custom content
            message : {
                html : 'Dit is een herhalend event. Wat wilt u wijzigen?'
            }
        }
    }
});
```

### Programmatisch Afhandelen

```javascript
const calendar = new Calendar({
    listeners : {
        // Voorkom standaard popup, handel zelf af
        beforeRecurrenceConfirmation({ eventRecord, actionType }) {
            // actionType: 'update', 'delete', 'resize', 'drop'

            if (actionType === 'delete') {
                // Custom delete handling
                return handleRecurringDelete(eventRecord);
            }

            // Laat standaard popup zien
            return true;
        }
    }
});

async function handleRecurringDelete(eventRecord) {
    const result = await MessageDialog.confirm({
        title   : 'Verwijderen',
        message : 'Wilt u alle occurrences verwijderen of alleen deze?',
        okButton : { text: 'Alleen deze' },
        cancelButton : { text: 'Alle' }
    });

    if (result === MessageDialog.okButton) {
        // Alleen deze occurrence - maak exception
        eventRecord.recurringTimeSpan.addExceptionDate(eventRecord.startDate);
    } else {
        // Alle - verwijder het recurring event
        eventRecord.recurringTimeSpan.remove();
    }

    return false; // Voorkom standaard popup
}
```

---

## RecurrenceCombo in EventEdit

### Standaard Recurrence Opties

De EventEdit feature bevat automatisch een RecurrenceCombo met opties:

- None (geen herhaling)
- Daily
- Weekly
- Monthly
- Yearly
- Custom...

### Contextual Recurrence Rules

```javascript
const calendar = new Calendar({
    features : {
        eventEdit : {
            // Toon context-gevoelige opties
            useContextualRecurrenceRules : true
        }
    }
});

// Voorbeeld: Event op maandag toont:
// - None
// - Daily
// - Every Monday        <- Contextual
// - Every weekday       <- Contextual
// - Monthly on the 1st Monday <- Contextual
// - Yearly
// - Custom...
```

### Custom Recurrence Editor

```javascript
const calendar = new Calendar({
    features : {
        eventEdit : {
            items : {
                // Vervang of configureer de recurrence combo
                recurrenceCombo : {
                    // Custom opties
                    items : [
                        { value: null, text: 'Niet herhalend' },
                        { value: 'FREQ=DAILY', text: 'Elke dag' },
                        { value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', text: 'Elke werkdag' },
                        { value: 'FREQ=WEEKLY', text: 'Elke week' },
                        { value: 'FREQ=MONTHLY;BYMONTHDAY=1', text: 'Eerste van de maand' },
                        { value: 'custom', text: 'Aangepast...' }
                    ],

                    onChange({ value }) {
                        if (value === 'custom') {
                            // Open custom recurrence dialog
                            this.showCustomRecurrenceDialog();
                        }
                    }
                }
            }
        }
    }
});
```

---

## Custom Recurrence Patterns

### Werkdagen Pattern

```javascript
// Helper voor werkdagen recurrence
function createWorkdayRecurrence(startDate, options = {}) {
    return {
        frequency : 'WEEKLY',
        interval  : options.interval || 1,
        days      : ['MO', 'TU', 'WE', 'TH', 'FR'],
        count     : options.count,
        endDate   : options.endDate
    };
}

// Gebruik
calendar.eventStore.add({
    name       : 'Dagelijks standup',
    startDate  : new Date(2025, 0, 6, 9, 0),
    endDate    : new Date(2025, 0, 6, 9, 15),
    recurrence : createWorkdayRecurrence(new Date(2025, 0, 6))
});
```

### Bi-Weekly Pattern

```javascript
// Om de week op specifieke dagen
function createBiWeeklyRecurrence(days, options = {}) {
    return {
        frequency : 'WEEKLY',
        interval  : 2,
        days      : days,
        count     : options.count,
        endDate   : options.endDate
    };
}

// Gebruik: Om de week op maandag en donderdag
calendar.eventStore.add({
    name       : 'Team sync',
    startDate  : new Date(2025, 0, 6, 14, 0),
    endDate    : new Date(2025, 0, 6, 15, 0),
    recurrence : createBiWeeklyRecurrence(['MO', 'TH'])
});
```

### Nth Weekday Pattern

```javascript
// Nth weekday van de maand
function createNthWeekdayRecurrence(dayCode, position, options = {}) {
    return {
        frequency : 'MONTHLY',
        interval  : options.interval || 1,
        days      : [dayCode],
        positions : [position],  // 1=eerste, 2=tweede, -1=laatste
        count     : options.count,
        endDate   : options.endDate
    };
}

// Eerste maandag van elke maand
calendar.eventStore.add({
    name       : 'Maandelijkse planning',
    startDate  : new Date(2025, 0, 6, 10, 0),
    endDate    : new Date(2025, 0, 6, 12, 0),
    recurrence : createNthWeekdayRecurrence('MO', 1)
});

// Laatste vrijdag van elke maand
calendar.eventStore.add({
    name       : 'Maandafsluiting',
    startDate  : new Date(2025, 0, 31, 15, 0),
    endDate    : new Date(2025, 0, 31, 17, 0),
    recurrence : createNthWeekdayRecurrence('FR', -1)
});
```

### Quarterly Pattern

```javascript
// Elk kwartaal
function createQuarterlyRecurrence(monthDay = 1, options = {}) {
    return {
        frequency : 'MONTHLY',
        interval  : 3,
        monthDays : [monthDay],
        count     : options.count,
        endDate   : options.endDate
    };
}

// Elk kwartaal op de 1e
calendar.eventStore.add({
    name       : 'Kwartaal review',
    startDate  : new Date(2025, 0, 1, 9, 0),
    endDate    : new Date(2025, 0, 1, 12, 0),
    recurrence : createQuarterlyRecurrence(1)
});
```

---

## Event Handlers voor Recurrence

### Recurrence Wijzigingen Detecteren

```javascript
const calendar = new Calendar({
    listeners : {
        // Wanneer recurrence rule wijzigt
        beforeEventSave({ eventRecord, changes }) {
            if ('recurrenceRule' in changes) {
                const oldRule = changes.recurrenceRule.oldValue;
                const newRule = changes.recurrenceRule.value;

                console.log(`Recurrence gewijzigd van ${oldRule} naar ${newRule}`);

                // Validatie
                if (newRule && !isValidRecurrence(newRule, eventRecord)) {
                    Toast.show('Ongeldige herhaling configuratie');
                    return false;
                }
            }
        }
    }
});

function isValidRecurrence(rule, eventRecord) {
    // Custom validatie logica
    // Bijv: geen dagelijkse recurring events langer dan 8 uur
    if (rule.includes('FREQ=DAILY')) {
        const duration = eventRecord.duration;
        if (duration > 8) {
            return false;
        }
    }
    return true;
}
```

### Occurrence Bewerking Detecteren

```javascript
const calendar = new Calendar({
    listeners : {
        beforeEventEdit({ eventRecord }) {
            if (eventRecord.isOccurrence) {
                console.log('Bewerken van occurrence');
                console.log('Basis event:', eventRecord.recurringTimeSpan.name);
            }
        }
    }
});
```

---

## Data Synchronisatie

### Server-side Recurrence Expansion

```javascript
// Optie 1: Server expandeert recurrence
// Client ontvangt individuele events

// Optie 2: Client expandeert (standaard)
const calendar = new Calendar({
    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/events.json',

        eventStore : {
            // Recurrence expansion configuratie
            fillTicks : true  // Genereer occurrences voor zichtbare periode
        }
    }
});
```

### Sync Packet Formaat

```javascript
// Bij opslaan van recurring event
{
    "type": "sync",
    "requestId": 123,
    "events": {
        "updated": [
            {
                "id": 1,
                "name": "Updated recurring event",
                "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO,WE,FR",
                "exceptionDates": ["2025-03-17", "2025-03-24"]
            }
        ]
    }
}
```

---

## CSS Styling

### Recurring Event Indicator

```css
/* Recurring event styling */
.b-cal-event.b-recurring {
    /* Herhaal icoon */
}

.b-cal-event.b-recurring::before {
    content: '\f01e';  /* fa-repeat */
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 10px;
    opacity: 0.7;
}

/* Occurrence styling (kan anders zijn dan basis event) */
.b-cal-event.b-occurrence {
    border-style: dashed;
}

/* Exception styling */
.b-cal-event.b-exception {
    background: repeating-linear-gradient(
        45deg,
        var(--event-background),
        var(--event-background) 5px,
        rgba(255,255,255,0.1) 5px,
        rgba(255,255,255,0.1) 10px
    );
}
```

### RecurrenceConfirmationPopup Styling

```css
.b-recurrence-confirmation-popup {
    min-width: 300px;
}

.b-recurrence-confirmation-popup .b-popup-content {
    padding: 1.5em;
}

.b-recurrence-confirmation-popup .b-button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.b-recurrence-confirmation-popup .b-button {
    justify-content: flex-start;
}
```

---

## Best Practices

### 1. Recurrence Validatie

```javascript
// Valideer recurrence rules
function validateRecurrence(recurrence, event) {
    const errors = [];

    // Check voor oneindige loops
    if (!recurrence.count && !recurrence.endDate) {
        // Onbeperkte herhaling - misschien OK, maar waarschuw
        console.warn('Onbeperkte herhaling geconfigureerd');
    }

    // Check voor te frequente herhaling
    if (recurrence.frequency === 'DAILY' && recurrence.interval < 1) {
        errors.push('Interval moet minimaal 1 zijn');
    }

    // Check voor geldige dagen
    if (recurrence.days) {
        const validDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const invalidDays = recurrence.days.filter(d => !validDays.includes(d));
        if (invalidDays.length > 0) {
            errors.push(`Ongeldige dagen: ${invalidDays.join(', ')}`);
        }
    }

    return errors;
}
```

### 2. Performance met Veel Recurring Events

```javascript
// Beperk het aantal gegenereerde occurrences
const calendar = new Calendar({
    // Laad alleen data voor zichtbare periode
    features : {
        loadOnDemand : true
    },

    crudManager : {
        eventStore : {
            // Beperk occurrence generatie
            generateOccurrences : {
                // Max aantal occurrences per recurring event
                limit : 100
            }
        }
    }
});
```

### 3. User-Friendly Recurrence UI

```javascript
// Bied voorgedefinieerde opties
const commonRecurrencePatterns = [
    { label: 'Elke werkdag', value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
    { label: 'Elke week', value: 'FREQ=WEEKLY' },
    { label: 'Om de week', value: 'FREQ=WEEKLY;INTERVAL=2' },
    { label: 'Elke maand', value: 'FREQ=MONTHLY' },
    { label: 'Elk kwartaal', value: 'FREQ=MONTHLY;INTERVAL=3' },
    { label: 'Elk jaar', value: 'FREQ=YEARLY' }
];
```

---

## TypeScript Referenties

| Interface | Regel | Beschrijving |
|-----------|-------|--------------|
| `RecurrenceModelConfig` | 264306 | Configuratie voor RecurrenceModel |
| `RecurrenceModel` | 264425 | RecurrenceModel class |
| `RecurrenceLegend` | 244840 | Static class voor mensleesbare beschrijvingen |
| `RecurrenceConfirmationPopupConfig` | 321428 | Popup configuratie |
| `recurrenceRule` (EventModel) | 12151 | RRULE veld op events |
| `recurrenceCombo` | 17021 | Combo widget in EventEdit |
| `useContextualRecurrenceRules` | 8735 | Context-gevoelige recurrence opties |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `examples/recurrence/` | Basis recurring events demonstratie |
| `examples/eventedit/` | EventEdit met recurrence combo |

---

## Samenvatting

Het Bryntum Calendar recurrence systeem biedt:

1. **RFC-5545 Compliant** - Volledige RRULE ondersteuning
2. **RecurrenceModel** - Object-georiënteerd recurrence beheer
3. **Automatic Expansion** - Automatische occurrence generatie
4. **Exception Handling** - Uitsluiten van specifieke datums
5. **Confirmation UI** - Ingebouwde popup voor occurrence bewerking
6. **RecurrenceLegend** - Mensleesbare beschrijvingen

Key RRULE componenten:
- `FREQ` - DAILY, WEEKLY, MONTHLY, YEARLY
- `INTERVAL` - Elke N periodes
- `COUNT` / `UNTIL` - Einddatum of aantal
- `BYDAY` - Dagen van de week (MO, TU, etc.)
- `BYMONTHDAY` - Dagen van de maand
- `BYSETPOS` - Positie binnen set (1e, 2e, laatste)
