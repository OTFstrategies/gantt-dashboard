# Calendar Implementation: Timezone Support

> **Fase 6** - Implementatiegids voor Calendar timezone ondersteuning: TimeZoneHelper, project timezone, conversies en UI integratie.

---

## Overzicht

De Bryntum Calendar biedt uitgebreide timezone ondersteuning via de `TimeZoneHelper` class en project-level timezone configuratie. Dit maakt het mogelijk om events in verschillende tijdzones correct weer te geven.

### Timezone Components

| Component | Beschrijving |
|-----------|--------------|
| **TimeZoneHelper** | Static helper voor timezone conversies |
| **Project.timeZone** | Project-level timezone setting |
| **Intl.DateTimeFormat** | Browser native timezone support |
| **LoadOnDemand** | Dynamic loading met timezone-aware data |

---

## 1. TimeZoneHelper Class

### TypeScript Interface

```typescript
// Bron: calendar.d.ts line 78899
export class TimeZoneHelper {
    /**
     * Converteert datum naar lokale systeemtijd die overeenkomt met de opgegeven timezone
     * "Welke tijd in mijn timezone komt overeen met deze tijd in timezone X?"
     * @param date De datum om te converteren
     * @param timeZone Timezone string of UTC offset in minuten
     */
    static fromTimeZone(date: Date, timeZone: string | number): Date;

    /**
     * Converteert datum naar de opgegeven timezone
     * "Hoe laat is het nu in timezone X?"
     * @param date De datum om te converteren
     * @param timeZone Timezone string of UTC offset in minuten
     */
    static toTimeZone(date: Date, timeZone: string | number): Date;
}
```

### Basis Timezone Conversie

```javascript
import { TimeZoneHelper } from '@bryntum/calendar';

const localDate = new Date('2024-06-15T10:00:00');

// Converteer naar andere timezone
const newYorkTime = TimeZoneHelper.toTimeZone(localDate, 'America/New_York');
const tokyoTime = TimeZoneHelper.toTimeZone(localDate, 'Asia/Tokyo');

console.log('Local:', localDate.toISOString());
console.log('New York:', newYorkTime.toISOString());
console.log('Tokyo:', tokyoTime.toISOString());

// Converteer terug van timezone naar local
const fromNewYork = TimeZoneHelper.fromTimeZone(newYorkTime, 'America/New_York');
```

### UTC Offset Support

```javascript
// Timezone als UTC offset in minuten
const utcPlus2 = TimeZoneHelper.toTimeZone(date, 120);   // UTC+2
const utcMinus5 = TimeZoneHelper.toTimeZone(date, -300); // UTC-5

// Combineer met string timezones
const offset = new Date().getTimezoneOffset(); // Lokale offset in minuten
```

---

## 2. Project Timezone

### Project Configuratie

```javascript
// Bron: examples/timezone/app.module.js
const calendar = new Calendar({
    appendTo: 'container',

    crudManager: {
        loadUrl: 'timezone-data',
        autoLoad: false,
        autoSync: false
    },

    features: {
        loadOnDemand: {
            alwaysLoadNewRange: true
        }
    }
});

// Set project timezone
calendar.project.timeZone = 'America/New_York';
```

### Dynamische Timezone Selectie

```javascript
const timeZones = [
    'America/Caracas',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/New_York',
    'America/Sao_Paulo',
    'America/St_Johns',
    'Asia/Bangkok',
    'Asia/Dhaka',
    'Asia/Hong_Kong',
    'Asia/Tokyo',
    'Australia/Adelaide',
    'Australia/Melbourne',
    'Europe/London',
    'Europe/Helsinki',
    'Europe/Moscow',
    'Europe/Stockholm',
    'Indian/Maldives',
    'Indian/Mahe',
    'Pacific/Auckland',
    'Pacific/Honolulu'
];

const calendar = new Calendar({
    tbar: {
        items: {
            timezone: {
                label: 'Timezone:',
                type: 'combo',
                filterOperator: '*',
                width: 300,
                weight: 600,

                // Gebruik browser-ondersteunde timezones
                items: Intl.supportedValuesOf?.('timeZone') || timeZones,

                // Start met lokale systeem timezone
                value: new Intl.DateTimeFormat().resolvedOptions().timeZone,

                onSelect: 'up.onTimezoneSelected'
            }
        }
    },

    onTimezoneSelected({ record }) {
        this.project.timeZone = record.text;
    }
});
```

---

## 3. Event Rendering met Timezone

### UTC in Event Header

```javascript
// Bron: examples/timezone/app.module.js
const eventHeaderRenderer = function({ eventRecord }) {
    if (!eventRecord.allDay) {
        // Converteer event start naar UTC
        const utcString = TimeZoneHelper
            .fromTimeZone(eventRecord.startDate, calendar.project.timeZone)
            .toISOString()
            .substring(11, 16);

        // Gebruik default renderer als basis
        const result = this.defaultEventHeaderRenderer(...arguments);

        // Voeg UTC tijd toe
        result.children.push({
            className: 'b-event-utc',
            text: `${utcString} UTC`
        });

        return result;
    }
};

const calendar = new Calendar({
    modes: {
        day: { eventHeaderRenderer },
        week: { eventHeaderRenderer }
    }
});
```

### Custom Timezone Display

```javascript
eventRenderer({ eventRecord, renderData }) {
    const projectTz = calendar.project.timeZone;

    // Event tijd in project timezone
    const localTime = DateHelper.format(eventRecord.startDate, 'HH:mm');

    // Event tijd in UTC
    const utcDate = TimeZoneHelper.fromTimeZone(eventRecord.startDate, projectTz);
    const utcTime = DateHelper.format(utcDate, 'HH:mm');

    return {
        tag: 'div',
        className: 'event-content',
        children: [
            {
                className: 'event-name',
                text: eventRecord.name
            },
            {
                className: 'event-times',
                children: [
                    { text: `Local: ${localTime}` },
                    { text: `UTC: ${utcTime}` }
                ]
            }
        ]
    };
}
```

---

## 4. Server Data met Timezone

### UTC Data van Server

```javascript
// Server stuurt altijd UTC
// data/data.json
{
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Meeting",
                "startDate": "2024-06-15T14:00:00Z",  // UTC
                "endDate": "2024-06-15T15:00:00Z"
            }
        ]
    }
}
```

### Timezone-aware Data Loading

```javascript
// Bron: examples/timezone/app.module.js
AjaxHelper.mockUrl('timezone-data', async(url, urlParams, { queryParams }) => {
    const data = await dataPromise;
    const date = DateHelper.startOf(DateHelper.parseKey(queryParams.startDate), 'week');

    let events = ObjectHelper.clone(data.events);

    // Converteer datums naar correcte week
    events.forEach(event => {
        // Dates zijn in UTC
        event.startDate = new Date(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + dayDelta,
            eventStartDate.getHours(),
            eventStartDate.getMinutes()
        ));
        event.endDate = new Date(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + dayDelta,
            eventEndDate.getHours(),
            eventEndDate.getMinutes()
        ));
    });

    return {
        delay: 100,
        responseText: JSON.stringify({
            success: true,
            resources: { rows: resources, append: true },
            events: { rows: events, append: true }
        })
    };
});
```

---

## 5. Timezone Conversie Patterns

### User Input Timezone

```javascript
// Wanneer gebruiker tijd invoert in lokale timezone
function handleUserTimeInput(inputTime, userTimezone) {
    // inputTime is in user's timezone
    // Converteer naar project timezone voor opslag
    const projectTz = calendar.project.timeZone;

    // Als user timezone anders is dan project timezone
    if (userTimezone !== projectTz) {
        // Converteer user input naar UTC, dan naar project timezone
        const utcTime = TimeZoneHelper.fromTimeZone(inputTime, userTimezone);
        return TimeZoneHelper.toTimeZone(utcTime, projectTz);
    }

    return inputTime;
}
```

### Display Timezone

```javascript
// Toon tijd in specifieke timezone
function formatInTimezone(date, timezone, format = 'HH:mm') {
    const converted = TimeZoneHelper.toTimeZone(date, timezone);
    return DateHelper.format(converted, format);
}

// Voorbeeld: multi-timezone display
function getMultiTimezoneString(date) {
    return [
        `NYC: ${formatInTimezone(date, 'America/New_York')}`,
        `LON: ${formatInTimezone(date, 'Europe/London')}`,
        `TOK: ${formatInTimezone(date, 'Asia/Tokyo')}`
    ].join(' | ');
}
```

### Timezone Offset Berekening

```javascript
function getTimezoneOffset(timezone) {
    const now = new Date();
    const localTime = now.getTime();
    const tzTime = TimeZoneHelper.toTimeZone(now, timezone).getTime();
    return (tzTime - localTime) / (60 * 1000); // Offset in minuten
}

// Voorbeeld
const nyOffset = getTimezoneOffset('America/New_York'); // -240 of -300 (DST)
```

---

## 6. Daylight Saving Time

### DST-aware Conversies

```javascript
// TimeZoneHelper handelt DST automatisch af
function isDST(date, timezone) {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);

    const janOffset = getTimezoneOffset(timezone, jan);
    const julOffset = getTimezoneOffset(timezone, jul);
    const currentOffset = getTimezoneOffset(timezone, date);

    const standardOffset = Math.max(janOffset, julOffset);
    return currentOffset < standardOffset;
}

function getTimezoneOffset(timezone, date = new Date()) {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (utcDate - tzDate) / (60 * 1000);
}
```

### DST Transitie Handling

```javascript
// Events die DST transitie overspannen
function handleDSTEvent(event) {
    const startOffset = getTimezoneOffset('America/New_York', event.startDate);
    const endOffset = getTimezoneOffset('America/New_York', event.endDate);

    if (startOffset !== endOffset) {
        // Event overspant DST transitie
        console.warn('Event crosses DST boundary:', event.name);

        // Optioneel: markeer event
        event.cls = 'dst-crossing-event';
    }
}
```

---

## 7. Timezone UI Components

### Timezone Selector Widget

```javascript
sidebar: {
    items: {
        timezoneSelector: {
            type: 'combo',
            label: 'Display Timezone',
            weight: 50,
            width: '100%',

            store: {
                data: Intl.supportedValuesOf?.('timeZone').map(tz => ({
                    id: tz,
                    text: tz,
                    offset: getTimezoneOffset(tz)
                })) || []
            },

            displayField: 'text',
            valueField: 'id',

            // Groepeer op regio
            listItemTpl: ({ text, offset }) => {
                const sign = offset >= 0 ? '+' : '';
                const hours = Math.floor(Math.abs(offset) / 60);
                const mins = Math.abs(offset) % 60;
                return `${text} (UTC${sign}${hours}:${mins.toString().padStart(2, '0')})`;
            },

            onChange({ value }) {
                calendar.project.timeZone = value;
            }
        }
    }
}
```

### Current Time in Multiple Timezones

```javascript
tbar: {
    items: {
        worldClock: {
            type: 'widget',
            weight: 700,
            html: '',

            // Update elke minuut
            listeners: {
                paint() {
                    this.updateClock();
                    this.clockInterval = setInterval(() => this.updateClock(), 60000);
                },
                destroy() {
                    clearInterval(this.clockInterval);
                }
            },

            updateClock() {
                const now = new Date();
                const zones = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];

                this.html = zones.map(tz => {
                    const time = TimeZoneHelper.toTimeZone(now, tz);
                    const formatted = DateHelper.format(time, 'HH:mm');
                    const city = tz.split('/')[1].replace('_', ' ');
                    return `<span class="clock-item">${city}: ${formatted}</span>`;
                }).join(' | ');
            }
        }
    }
}
```

---

## 8. Event Editor met Timezone

### Timezone Field in Editor

```javascript
features: {
    eventEdit: {
        items: {
            // Timezone selectie per event
            eventTimezone: {
                type: 'combo',
                name: 'timezone',
                label: 'Event Timezone',
                weight: 250,

                items: Intl.supportedValuesOf?.('timeZone') || [],

                onChange({ value, source }) {
                    const editor = source.up('eventEditor');
                    const event = editor.eventRecord;

                    // Converteer event tijden naar nieuwe timezone
                    if (event.timezone && event.timezone !== value) {
                        const start = TimeZoneHelper.fromTimeZone(event.startDate, event.timezone);
                        const end = TimeZoneHelper.fromTimeZone(event.endDate, event.timezone);

                        editor.widgetMap.startDateField.value = TimeZoneHelper.toTimeZone(start, value);
                        editor.widgetMap.endDateField.value = TimeZoneHelper.toTimeZone(end, value);
                    }
                }
            }
        }
    }
}
```

---

## 9. Timezone Storage

### Event Model met Timezone

```javascript
class TimezoneAwareEvent extends EventModel {
    static fields = [
        // Timezone waarin event is aangemaakt
        { name: 'timezone', defaultValue: null },

        // Originele UTC tijden
        { name: 'utcStartDate', type: 'date' },
        { name: 'utcEndDate', type: 'date' }
    ];

    // Override setters voor timezone conversie
    set startDate(date) {
        super.startDate = date;
        this.utcStartDate = this.timezone ?
            TimeZoneHelper.fromTimeZone(date, this.timezone) : date;
    }

    set endDate(date) {
        super.endDate = date;
        this.utcEndDate = this.timezone ?
            TimeZoneHelper.fromTimeZone(date, this.timezone) : date;
    }
}
```

### Server Sync met UTC

```javascript
crudManager: {
    transport: {
        load: { url: 'api/events' },
        sync: { url: 'api/events/sync' }
    },

    // Converteer naar UTC voor server
    beforeSync({ pack }) {
        pack.events?.forEach(event => {
            if (event.timezone) {
                event.startDate = TimeZoneHelper
                    .fromTimeZone(new Date(event.startDate), event.timezone)
                    .toISOString();
                event.endDate = TimeZoneHelper
                    .fromTimeZone(new Date(event.endDate), event.timezone)
                    .toISOString();
            }
        });
    },

    // Converteer van UTC naar project timezone
    afterLoad({ response }) {
        const projectTz = calendar.project.timeZone;

        response.events?.rows?.forEach(event => {
            event.startDate = TimeZoneHelper
                .toTimeZone(new Date(event.startDate), projectTz);
            event.endDate = TimeZoneHelper
                .toTimeZone(new Date(event.endDate), projectTz);
        });
    }
}
```

---

## 10. Timezone Testing

### Test Helpers

```javascript
// Simuleer andere timezone
function withTimezone(timezone, callback) {
    const originalTz = calendar.project.timeZone;

    try {
        calendar.project.timeZone = timezone;
        callback();
    } finally {
        calendar.project.timeZone = originalTz;
    }
}

// Test event in verschillende timezones
function testEventInTimezones(event, timezones) {
    const results = {};

    timezones.forEach(tz => {
        const converted = TimeZoneHelper.toTimeZone(event.startDate, tz);
        results[tz] = DateHelper.format(converted, 'YYYY-MM-DD HH:mm');
    });

    return results;
}
```

### Timezone Edge Cases

```javascript
// Test cases voor timezone handling
const testCases = [
    // DST transitie
    {
        date: new Date('2024-03-10T02:30:00'),
        timezone: 'America/New_York',
        note: 'Spring forward - 2:30 AM does not exist'
    },
    // DST fall back
    {
        date: new Date('2024-11-03T01:30:00'),
        timezone: 'America/New_York',
        note: 'Fall back - 1:30 AM occurs twice'
    },
    // Crossing date line
    {
        date: new Date('2024-06-15T23:00:00'),
        timezone: 'Pacific/Auckland',
        note: 'May be next day in NZ'
    },
    // Half-hour offset
    {
        date: new Date('2024-06-15T12:00:00'),
        timezone: 'Asia/Kolkata',
        note: 'UTC+5:30'
    }
];
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| TimeZoneHelper | 78899 |
| Project.timeZone | Project config |
| DateHelper | Core module |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `timezone/` | Complete timezone implementatie |
| `load-on-demand/` | Dynamic loading met timezone |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
