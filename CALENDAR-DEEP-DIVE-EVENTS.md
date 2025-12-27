# Calendar Deep Dive: Events

> **Fase 6.2** - Diepgaande analyse van Calendar event handling: all-day events, multi-day spanning, event overlapping en event layout.

---

## Overzicht

De Bryntum Calendar biedt uitgebreide ondersteuning voor verschillende event types en geavanceerde layout algoritmes voor overlappende events.

### Event Types

| Type | Beschrijving | Weergave |
|------|--------------|----------|
| **Timed Event** | Event met specifieke start/end tijd | Verticale blok in DayView |
| **All-Day Event** | Event zonder specifieke tijd | Header bar in DayView |
| **Multi-Day Event** | Event over meerdere dagen | Spanning bar |
| **Recurring Event** | Herhalend event | Zie CALENDAR-IMPL-RECURRING.md |

---

## 1. EventModel

De basis voor alle calendar events.

### TypeScript Interface

```typescript
interface EventModel {
    // Identificatie
    id: string | number;
    name: string;

    // Timing
    startDate: Date | string;
    endDate: Date | string;
    duration: number;
    durationUnit: 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

    // All-day flag
    allDay: boolean;

    // Resource binding
    resourceId: string | number;
    resource: ResourceModel;

    // Styling
    eventColor: string;
    eventStyle: string;
    cls: string;
    iconCls: string;

    // Recurrence
    recurrenceRule: string;  // RRULE format

    // State
    draggable: boolean;
    resizable: boolean | 'start' | 'end';
}
```

### Custom EventModel

```javascript
// Bron: examples/event-items/app.module.js
class Event extends EventModel {
    static $name = 'Event';

    static fields = [{
        name: 'guests',
        internal: true
    }, {
        name: 'important',
        type: 'boolean'
    }, {
        name: 'location',
        type: 'string'
    }];

    static defaults = {
        guests: []
    };

    // Computed property
    get isUrgent() {
        return this.important && DateHelper.diff(new Date(), this.startDate, 'hour') < 24;
    }
}
```

---

## 2. All-Day Events

### Detectie

Een event is "all-day" als:
- `allDay: true` expliciet is gezet, of
- Het event precies 24 uur of een veelvoud daarvan duurt, of
- Het event begint op middernacht en eindigt op middernacht

### Rendering in DayView

All-day events worden weergegeven in een speciale header (`CalendarRow`):

```typescript
interface DayViewConfig {
    // All-day header configuratie
    showAllDayHeader: boolean;  // default: true

    // Referentie naar all-day events widget
    readonly allDayEvents: CalendarRow;
}
```

### CalendarRow voor All-Day Events

```typescript
interface CalendarRow {
    // Event height
    eventHeight: number | string;
    eventSpacing: number;

    // Overflow handling
    maxEventRows: number;  // Maximaal aantal rijen voor all-day events

    // Layout
    compactHeader: boolean;
}
```

### Example: All-Day Header Customization

```javascript
const calendar = new Calendar({
    modes: {
        day: {
            // Verberg all-day header
            showAllDayHeader: false
        },
        week: {
            // Configureer all-day events
            allDayEvents: {
                eventHeight: 24,
                maxEventRows: 3
            }
        }
    }
});
```

---

## 3. Multi-Day Spanning Events

Multi-day events overspannen meerdere dagen en worden als connected bars weergegeven.

### Layout Algoritme

1. Event start in eerste cel
2. Event bar "loopt door" naar volgende cellen
3. Aan het begin van elke week/rij wordt een nieuwe bar segment gecreëerd
4. Pijlen indiceren doorloop

### EventBar Type

```typescript
type EventBar = {
    // Het event record
    eventRecord: EventModel;

    // Positie in de cel
    slot: number;           // Verticale positie (0, 1, 2, ...)
    continue: boolean;      // Loopt door van vorige dag
    ends: boolean;          // Eindigt in deze cel
    continueRight: boolean; // Loopt door naar volgende dag

    // Styling
    cls: DomClassList;
    style: object;

    // Resource (voor resource views)
    resource: ResourceModel;
}
```

### Spanning Configuratie

```javascript
modes: {
    month: {
        // End datum display
        extendAllDayEndDay: true  // Toont inclusieve end date
    }
}
```

---

## 4. Event Overlapping

### Overlap Detectie

Events overlappen wanneer hun tijdsbereiken intersecteren:

```typescript
// Pseudo-code voor overlap detectie
function eventsOverlap(event1: EventModel, event2: EventModel): boolean {
    return event1.startDate < event2.endDate &&
           event1.endDate > event2.startDate;
}
```

### Layout Algoritmes

#### FluidDayLayout (DayView)

Events worden naast elkaar geplaatst met gedeelde breedte:

```typescript
interface FluidDayLayoutConfig {
    // Minimum event breedte als percentage
    minEventWidth: number;  // default: 30 (30%)

    // Maximum aantal overlappende events
    maxEventsPerColumn: number;

    // Sortering
    eventSorter: (lhs: EventModel | EventBar, rhs: EventModel | EventBar) => number;
}
```

#### Event Sortering

```javascript
modes: {
    day: {
        eventLayout: {
            // Custom sortering
            eventSorter(lhs, rhs) {
                // Langere events eerst
                const durationDiff = rhs.duration - lhs.duration;
                if (durationDiff !== 0) return durationDiff;

                // Dan op naam
                return lhs.name.localeCompare(rhs.name);
            }
        }
    }
}
```

### Overlap Visualisatie

```javascript
// Default overlap handling
const calendar = new Calendar({
    modes: {
        day: {
            // Events naast elkaar
            eventLayout: {
                type: 'fluid'  // default
            }
        },
        month: {
            // Overflow popup voor te veel events
            overflowClickAction: 'popup'  // of 'shrinkwrap'
        }
    }
});
```

---

## 5. Event Rendering

### Event Renderer

Custom rendering van event content:

```typescript
interface EventRendererConfig {
    eventRenderer: (params: {
        eventRecord: EventModel;
        renderData: EventRenderData;
        view: CalendarView;
    }) => string | DomConfig | null;
}

interface EventRenderData {
    // CSS classes
    cls: DomClassList;
    iconCls: DomClassList;

    // Styling
    style: object;

    // Event metadata
    startText: string;
    endText: string;
}
```

### Example: Custom Event Renderer

```javascript
// Bron: examples/event-items/app.module.js
const eventRenderer = ({ eventRecord, renderData, view }) => {
    const calendar = view.up('calendar');
    const guestsStore = calendar.crudManager.getStore('guests');
    const guestList = guestsStore.getRange()
        .filter(r => eventRecord.guests.includes(r.id));

    if (eventRecord.important) {
        renderData.iconCls['fa fa-exclamation'] = 1;
    }

    return {
        tag: 'div',
        className: 'b-event-content',
        children: [{
            tag: 'span',
            className: 'b-event-name',
            text: eventRecord.name
        }, {
            tag: 'div',
            className: 'b-avatars-container',
            children: guestList.map(r => calendar.avatarRendering.getResourceAvatar({
                initials: r.initials,
                dataset: { btip: r.name }
            }))
        }]
    };
};

const calendar = new Calendar({
    modes: {
        week: { eventRenderer },
        day: { eventRenderer }
    }
});
```

### Event Styling

```javascript
// Via EventModel
const event = new EventModel({
    name: 'Meeting',
    eventColor: '#ff5722',   // Bar color
    eventStyle: 'colored',   // 'plain', 'colored', 'border', 'hollow'
    cls: 'custom-event',     // Extra CSS class
    iconCls: 'fa fa-users'   // Icon
});

// Via CSS
.b-cal-event-wrap.custom-event {
    border-radius: 8px;
    font-weight: bold;
}
```

---

## 6. Event Overflow

### MonthView Overflow

Wanneer een cel te veel events bevat:

```typescript
interface MonthViewConfig {
    // Maximum events per cel (rest in overflow)
    maxEventsPerCell: number;

    // Wat gebeurt bij klik op "+n more"
    overflowClickAction: 'popup' | 'shrinkwrap';

    // Custom overflow button
    overflowButtonRenderer: (buttonConfig: object, count: number) => object;
}
```

### Overflow Popup Configuratie

```javascript
// Bron: examples/event-items/app.module.js
const calendar = new Calendar({
    modeDefaults: {
        overflowPopup: {
            align: {
                align: 'c-c',    // Center-center alignment
                anchor: false    // Geen anchor arrow
            }
        }
    }
});
```

### Custom Overflow Button

```javascript
// Bron: examples/sidebar-customization/app.module.js
modes: {
    month: {
        overflowButtonRenderer(buttonConfig, count) {
            buttonConfig.style.justifyContent = 'unset';
            buttonConfig.className['fa'] = 1;

            if (this.overflowClickAction === 'shrinkwrap') {
                buttonConfig.className['fa-arrow-down'] = 1;
                buttonConfig.text = 'Expand';
            } else {
                buttonConfig.className['fa-window-maximize'] = 1;
                buttonConfig.text = `Show ${count} more`;
            }

            return buttonConfig;
        }
    }
}
```

---

## 7. DayCell Data Structure

Elke cel in de Calendar bevat uitgebreide metadata:

```typescript
type DayCell = {
    // Basis info
    view: CalendarView;
    date: Date;
    key: string;  // 'YYYY-MM-DD'

    // Positie
    cellIndex: number;
    columnIndex: number;
    visibleColumnIndex: number;
    day: number;  // 0-6

    // State
    isNonWorking: boolean;
    isOtherMonth: boolean;
    visible: boolean;
    isRowStart: boolean;
    isRowEnd: boolean;

    // Events
    events: EventModel[];
    intraDayEvents: EventModel[];  // Timed events
    allDayEvents: EventModel[];    // All-day events

    // Rendered bars
    renderedEvents: EventBar[];
    hasOverflow: boolean;

    // Time ranges
    timeRanges: TimeRangeModel[];
    allDayTimeRanges: TimeRangeModel[];

    // Resource (in ResourceView)
    resource: ResourceModel;
    resourceDayEvents: EventModel[];
};
```

---

## 8. Event Drag & Drop

### Configuratie

```typescript
interface CalendarDragConfig {
    // Per view type
    allowDragCreate: boolean;
    allowDragMove: boolean;
    allowDragResize: boolean;

    // Drag unit
    dragUnit: 'minute' | 'hour' | 'day';

    // Auto-create op gesture
    autoCreate: {
        gesture: string;      // 'dblclick'
        newName: string | Function;
        step: string;         // '15 minutes'
        duration: string;     // '1 hour'
        startHour: number;
    };
}
```

### Drag Events

```javascript
calendar.on({
    // Before drag starts
    beforeEventDrag({ eventRecord, context }) {
        // Return false to prevent
    },

    // During drag
    eventDrag({ eventRecord, startDate, endDate }) {
        // Update preview
    },

    // After drop
    afterEventDrop({ eventRecord, valid }) {
        if (valid) {
            console.log('Event moved to', eventRecord.startDate);
        }
    }
});
```

### Resize Events

```javascript
calendar.on({
    beforeEventResize({ eventRecord, edge }) {
        // edge is 'start' or 'end'
    },

    eventResize({ eventRecord }) {
        // During resize
    },

    afterEventResize({ eventRecord }) {
        // After resize complete
    }
});
```

---

## 9. Event Selection

### Multi-Selection

```javascript
const calendar = new Calendar({
    multiEventSelect: true,

    listeners: {
        eventSelectionChange({ selection, deselected, selected }) {
            console.log('Selected:', selection.map(e => e.name));
        }
    }
});

// Programmatic selection
calendar.selectedEvents = [event1, event2];

// Add to selection
calendar.selectEvent(event3, true);  // true = add to existing

// Clear selection
calendar.deselectAllEvents();
```

### Selection Filtering

```javascript
const calendar = new Calendar({
    // Filter welke events selecteerbaar zijn
    isEventSelectable: (event) => {
        return !event.readOnly && event.resourceId !== 'holiday';
    }
});
```

---

## 10. Event Store Operations

### CRUD Operations

```javascript
const eventStore = calendar.eventStore;

// Create
const newEvent = eventStore.add({
    name: 'New Meeting',
    startDate: '2024-01-15T10:00',
    endDate: '2024-01-15T11:00',
    resourceId: 'r1'
});

// Read
const event = eventStore.getById(123);
const events = eventStore.getEventsInTimeSpan(startDate, endDate);

// Update
event.set({
    name: 'Updated Meeting',
    startDate: '2024-01-15T11:00'
});

// Delete
eventStore.remove(event);
```

### Filtering

```javascript
// Filter events
calendar.eventStore.filter({
    property: 'resourceId',
    value: 'r1'
});

// Multiple filters
calendar.eventStore.filter([
    { property: 'important', value: true },
    { property: 'resourceId', value: 'r1' }
]);

// Custom filter function
calendar.eventStore.filter(event => {
    return event.duration > 60 && !event.allDay;
});

// Clear filters
calendar.eventStore.clearFilters();
```

---

## 11. Event Validation

### beforeEventSave

```javascript
calendar.on({
    beforeEventSave({ eventRecord, values }) {
        // Validate
        if (values.duration > 480) {
            Toast.show('Event cannot be longer than 8 hours');
            return false;
        }

        // Modify
        values.name = values.name.trim();

        return true;
    }
});
```

### Conflict Detection

```javascript
function hasConflict(eventRecord, eventStore) {
    return eventStore.getEventsInTimeSpan(
        eventRecord.startDate,
        eventRecord.endDate,
        eventRecord.resourceId
    ).some(e => e !== eventRecord);
}

calendar.on({
    beforeEventDrop({ eventRecord, startDate, endDate }) {
        const tempEvent = eventRecord.copy();
        tempEvent.startDate = startDate;
        tempEvent.endDate = endDate;

        if (hasConflict(tempEvent, calendar.eventStore)) {
            return false;  // Prevent drop
        }
    }
});
```

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `event-items/` | Custom event fields en rendering |
| `custom-rendering/` | Advanced event rendering |
| `confirmation-dialogs/` | Event validation dialogs |
| `drag-between-calendars/` | Cross-calendar event drag |
| `drag-from-grid/` | External drag sources |
| `multiassign/` | Multi-resource assignments |

---

## CSS Styling Reference

### Event Classes

```css
/* Basis event wrapper */
.b-cal-event-wrap {
    border-radius: 4px;
}

/* All-day event */
.b-cal-event-wrap.b-allday {
    height: var(--event-bar-height);
}

/* Multi-day spanning */
.b-cal-event-wrap.b-continues-left::before,
.b-cal-event-wrap.b-continues-right::after {
    /* Arrow indicators */
}

/* Event states */
.b-cal-event-wrap.b-selected { }
.b-cal-event-wrap.b-dragging { }
.b-cal-event-wrap.b-resizing { }

/* Event styles */
.b-cal-event-wrap.b-cal-event-colored { }
.b-cal-event-wrap.b-cal-event-border { }
.b-cal-event-wrap.b-cal-event-hollow { }
```

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
