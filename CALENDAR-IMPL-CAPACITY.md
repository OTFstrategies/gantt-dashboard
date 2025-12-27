# Calendar Implementation: Resource Time Capacity

> **Implementatie guide** voor capaciteitsplanning in Bryntum Calendar: resource-gebaseerde weergave, capaciteitsindicatoren, overboeking detectie, en tick rendering.

---

## Overzicht

Resource Time Capacity toont beschikbare capaciteit per resource per tijdslot:

- **DayResource View** - Dag weergave met resource kolommen
- **Capacity Tracking** - Beschikbare vs gebruikte capaciteit per uur
- **Overbooking Detection** - Visuele indicatie bij overschrijding
- **Tick Renderer** - Custom rendering per tijdslot
- **Event Renderer** - Markering van overboekte events

---

## 1. Basic Configuration

### 1.1 Calendar Setup

```javascript
import { Calendar, DateHelper } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo: 'container',
    date: '2025-01-27',

    crudManager: {
        autoLoad: true,
        loadUrl: 'data/data.json'
    },

    modes: {
        // Disable standaard views
        day: null,
        week: null,
        month: null,
        year: null,
        agenda: null,

        // Alleen dayresource view
        dayresource: {
            dayStartTime: 8,
            dayEndTime: 19,
            hourHeight: 80,
            hideNonWorkingDays: true,
            minResourceWidth: '10em',
            shortEventDuration: '1 hour'
        }
    }
});
```

---

## 2. Data Model

### 2.1 Resource met Capacity

```json
{
    "resources": {
        "rows": [
            {
                "id": 1,
                "name": "Conference Room A",
                "maxCapacity": 20,
                "iconCls": "fa fa-building"
            },
            {
                "id": 2,
                "name": "Meeting Room B",
                "maxCapacity": 10,
                "iconCls": "fa fa-door-open"
            }
        ]
    }
}
```

### 2.2 Event met Party Size

```json
{
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Team Meeting",
                "resourceId": 1,
                "startDate": "2025-01-27T09:00",
                "endDate": "2025-01-27T11:00",
                "partySize": 15
            },
            {
                "id": 2,
                "name": "Workshop",
                "resourceId": 1,
                "startDate": "2025-01-27T10:00",
                "endDate": "2025-01-27T12:00",
                "partySize": 8
            }
        ]
    }
}
```

---

## 3. Tick Renderer

### 3.1 Capacity Display per Tijdslot

```javascript
modes: {
    dayresource: {
        tickRenderer({ startTime, endTime, events, subTickCount, resourceRecord }) {
            // Alleen renderen op het hele uur
            if (resourceRecord && startTime.getMinutes() === 0) {
                const
                    resourceCapacity = resourceRecord.maxCapacity,
                    // Haal events op voor dit tijdslot
                    tickEvents = this.eventStore.getEvents({
                        startDate: startTime,
                        endDate: endTime,
                        resourceRecord
                    }),
                    // Bereken gebruikte capaciteit
                    usedCapacity = tickEvents.reduce(
                        (total, event) => total + (event.partySize || 0),
                        0
                    );

                return {
                    rowspan: subTickCount,
                    className: {
                        unused: events.length === 0,
                        overbooked: usedCapacity > resourceCapacity
                    },
                    children: [
                        {
                            className: 'time',
                            text: DateHelper.format(startTime, this.timeFormat)
                        },
                        {
                            className: 'capacity',
                            text: `${resourceCapacity - usedCapacity}/${resourceCapacity}`
                        }
                    ]
                };
            }
        }
    }
}
```

### 3.2 Tick CSS

```css
/* Basis tick styling */
.b-cal-cell-tick {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px;
    border-bottom: 1px solid #eee;
}

.b-cal-cell-tick .time {
    font-size: 0.85em;
    color: #666;
}

.b-cal-cell-tick .capacity {
    font-size: 0.75em;
    padding: 2px 6px;
    border-radius: 4px;
    background: #e8f5e9;
    color: #2e7d32;
}

/* Geen events */
.b-cal-cell-tick.unused {
    opacity: 0.6;
}

.b-cal-cell-tick.unused .capacity {
    background: #f5f5f5;
    color: #999;
}

/* Overboekt */
.b-cal-cell-tick.overbooked .capacity {
    background: #ffebee;
    color: #c62828;
    font-weight: bold;
}
```

---

## 4. Event Renderer

### 4.1 Overboeking Detectie

```javascript
modes: {
    dayresource: {
        eventRenderer({ eventRecord, resourceRecord, renderData: { cls } }) {
            // Markeer event als partySize > resource capacity
            if (eventRecord.partySize > resourceRecord.maxCapacity) {
                cls.add('overbooked');
            }

            return [
                {
                    className: 'event-name',
                    text: eventRecord.name
                },
                {
                    className: 'party-size',
                    text: `${eventRecord.partySize} persons`
                }
            ];
        }
    }
}
```

### 4.2 Event CSS

```css
.b-cal-event-wrap.overbooked .b-cal-event {
    border-left: 4px solid #c62828;
}

.b-cal-event-wrap.overbooked .b-cal-event::before {
    content: '\f071'; /* Font Awesome warning */
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    position: absolute;
    top: 4px;
    right: 4px;
    color: #c62828;
}

.party-size {
    font-size: 0.85em;
    opacity: 0.8;
}
```

---

## 5. Event Editor

### 5.1 Party Size Field

```javascript
features: {
    eventEdit: {
        items: {
            partySizeField: {
                type: 'number',
                name: 'partySize',
                label: 'Party size',
                weight: 200,
                min: 1,
                step: 1,

                // Validatie
                onChange({ value, source }) {
                    const resourceRecord = source.owner.record?.resource;

                    if (resourceRecord && value > resourceRecord.maxCapacity) {
                        source.setError(`Exceeds capacity (${resourceRecord.maxCapacity})`);
                    } else {
                        source.clearError();
                    }
                }
            }
        }
    }
}
```

---

## 6. Capacity Calculation Utilities

### 6.1 Helper Functions

```javascript
// Bereken gebruikte capaciteit voor een tijdslot
function getUsedCapacity(eventStore, resourceRecord, startTime, endTime) {
    const events = eventStore.getEvents({
        startDate: startTime,
        endDate: endTime,
        resourceRecord
    });

    return events.reduce((total, event) => total + (event.partySize || 0), 0);
}

// Check of een event past binnen capaciteit
function canFitEvent(eventStore, resourceRecord, startTime, endTime, partySize) {
    const usedCapacity = getUsedCapacity(eventStore, resourceRecord, startTime, endTime);
    return (usedCapacity + partySize) <= resourceRecord.maxCapacity;
}

// Zoek eerste beschikbare tijdslot met voldoende capaciteit
function findAvailableSlot(eventStore, resourceRecord, date, partySize, duration) {
    const dayStart = DateHelper.clearTime(date);
    dayStart.setHours(8); // Start zoeken vanaf 8:00

    for (let hour = 8; hour < 19; hour++) {
        const startTime = DateHelper.add(dayStart, hour - 8, 'hour');
        const endTime = DateHelper.add(startTime, duration, 'hour');

        if (canFitEvent(eventStore, resourceRecord, startTime, endTime, partySize)) {
            return { startTime, endTime };
        }
    }

    return null;
}
```

---

## 7. Capacity Summary Panel

### 7.1 Summary Widget

```javascript
import { Panel, DateHelper } from '@bryntum/calendar';

const summaryPanel = new Panel({
    appendTo: 'sidebar',
    title: 'Daily Capacity Overview',
    cls: 'capacity-summary',

    items: {
        summary: {
            type: 'container',
            html: '' // Will be updated
        }
    },

    updateSummary(calendar, date) {
        const { eventStore, resourceStore } = calendar;
        let html = '';

        resourceStore.forEach(resource => {
            const dayEvents = eventStore.getEvents({
                startDate: DateHelper.startOf(date, 'day'),
                endDate: DateHelper.endOf(date, 'day'),
                resourceRecord: resource
            });

            const totalUsed = dayEvents.reduce(
                (sum, e) => sum + (e.partySize || 0), 0
            );

            const peakHour = this.findPeakHour(eventStore, resource, date);

            html += `
                <div class="resource-capacity">
                    <h4>${resource.name}</h4>
                    <div>Total bookings: ${dayEvents.length}</div>
                    <div>Total persons: ${totalUsed}</div>
                    <div>Peak hour: ${peakHour || 'N/A'}</div>
                </div>
            `;
        });

        this.widgetMap.summary.html = html;
    },

    findPeakHour(eventStore, resource, date) {
        let peak = { hour: null, count: 0 };
        const dayStart = DateHelper.clearTime(date);

        for (let hour = 8; hour < 19; hour++) {
            const startTime = new Date(dayStart);
            startTime.setHours(hour);
            const endTime = DateHelper.add(startTime, 1, 'hour');

            const count = eventStore.getEvents({
                startDate: startTime,
                endDate: endTime,
                resourceRecord: resource
            }).reduce((sum, e) => sum + (e.partySize || 0), 0);

            if (count > peak.count) {
                peak = { hour: DateHelper.format(startTime, 'HH:mm'), count };
            }
        }

        return peak.hour;
    }
});
```

---

## 8. TypeScript Interfaces

```typescript
import { Model, EventModel, Calendar, DateHelper } from '@bryntum/calendar';

// Resource with Capacity
interface CapacityResourceData {
    id: string | number;
    name: string;
    maxCapacity: number;
    iconCls?: string;
}

interface CapacityResource extends Model {
    maxCapacity: number;
}

// Event with Party Size
interface CapacityEventData {
    id: string | number;
    name: string;
    resourceId: string | number;
    startDate: Date | string;
    endDate: Date | string;
    partySize: number;
}

interface CapacityEvent extends EventModel {
    partySize: number;
}

// Tick Renderer Context
interface TickRendererContext {
    startTime: Date;
    endTime: Date;
    events: CapacityEvent[];
    subTickCount: number;
    resourceRecord: CapacityResource;
}

// Tick Render Result
interface TickRenderResult {
    rowspan?: number;
    className?: Record<string, boolean>;
    children?: Array<{
        className: string;
        text: string;
    }>;
}

// Capacity Calculation
interface CapacitySlot {
    startTime: Date;
    endTime: Date;
    usedCapacity: number;
    availableCapacity: number;
    isOverbooked: boolean;
}
```

---

## 9. Complete Example

```javascript
import { Calendar, DateHelper } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo: 'container',
    date: '2025-01-27',

    crudManager: {
        autoLoad: true,
        loadUrl: 'data/data.json'
    },

    modes: {
        day: null,
        week: null,
        month: null,
        year: null,
        agenda: null,

        dayresource: {
            dayStartTime: 8,
            dayEndTime: 19,
            hourHeight: 80,
            hideNonWorkingDays: true,
            minResourceWidth: '10em',
            shortEventDuration: '1 hour',

            // Event renderer met overboeking check
            eventRenderer({ eventRecord, resourceRecord, renderData: { cls } }) {
                if (eventRecord.partySize > resourceRecord.maxCapacity) {
                    cls.add('overbooked');
                }

                return [
                    { className: 'event-name', text: eventRecord.name },
                    { className: 'party-size', text: `${eventRecord.partySize} persons` }
                ];
            },

            // Tick renderer met capaciteit display
            tickRenderer({ startTime, endTime, events, subTickCount, resourceRecord }) {
                if (resourceRecord && startTime.getMinutes() === 0) {
                    const capacity = resourceRecord.maxCapacity;
                    const tickEvents = this.eventStore.getEvents({
                        startDate: startTime,
                        endDate: endTime,
                        resourceRecord
                    });
                    const used = tickEvents.reduce((t, e) => t + (e.partySize || 0), 0);

                    return {
                        rowspan: subTickCount,
                        className: {
                            unused: events.length === 0,
                            overbooked: used > capacity
                        },
                        children: [
                            { className: 'time', text: DateHelper.format(startTime, 'HH:mm') },
                            { className: 'capacity', text: `${capacity - used}/${capacity}` }
                        ]
                    };
                }
            }
        }
    },

    features: {
        eventEdit: {
            items: {
                partySizeField: {
                    type: 'number',
                    name: 'partySize',
                    label: 'Party size',
                    weight: 200,
                    min: 1
                }
            }
        }
    }
});
```

---

## Referenties

- Examples: `calendar-7.1.0-trial/examples/resource-time-capacity/`
- View: DayResourceView
- API: tickRenderer
- API: eventRenderer

---

*Document gegenereerd: December 2024*
*Bryntum Calendar versie: 7.1.0*
