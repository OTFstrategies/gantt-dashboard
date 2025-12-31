# Calendar Deep Dive: Drag & Drop

> **Fase 6** - Diepgaande analyse van Calendar drag & drop: event dragging, resizing, auto-create, cross-calendar drag en externe bronnen.

---

## Overzicht

De Calendar ondersteunt uitgebreide drag & drop functionaliteit via de `CalendarDrag` feature en gerelateerde componenten.

### Drag Types

| Type | Beschrijving | Feature |
|------|--------------|---------|
| **Event Move** | Sleep event naar andere tijd/dag | CalendarDrag |
| **Event Resize** | Wijzig event duur door randen te slepen | CalendarDrag |
| **Event Create** | Creëer event door te slepen op lege ruimte | CalendarDrag |
| **External Drop** | Drop van externe bron naar Calendar | ExternalEventSource |
| **Cross-Calendar** | Sleep tussen meerdere calendars | CalendarDrag |

---

## 1. CalendarDrag Feature

### Configuratie

```typescript
// Bron: calendar.d.ts line 7728
interface CalendarDragConfig {
    type?: 'calendarDrag';

    // Event verwijderen bij externe drop
    removeFromExternalStore: boolean;  // default: true

    // Drag validatie
    validatorFn?: (context: DragContext) => boolean | string;
    validatorFnThisObj?: object;
}

interface DragContext {
    eventRecord: EventModel;
    startDate: Date;
    endDate: Date;
    resourceRecord?: ResourceModel;
    view: CalendarView;
}
```

### Basis Configuratie

```javascript
const calendar = new Calendar({
    features: {
        calendarDrag: {
            // Drag naar externe bron verwijdert niet
            removeFromExternalStore: false,

            // Custom validatie
            validatorFn({ eventRecord, startDate, endDate }) {
                // Niet in het verleden
                if (startDate < new Date()) {
                    return 'Cannot move to past';
                }

                // Max 8 uur
                const hours = (endDate - startDate) / 3600000;
                if (hours > 8) {
                    return 'Event too long';
                }

                return true;
            }
        }
    }
});
```

---

## 2. Per-View Drag Configuration

### DayView/WeekView Drag

```typescript
interface DayViewDragConfig {
    // Drag move
    allowDragMove: boolean;  // default: true

    // Drag resize
    allowDragResize: boolean;  // default: true

    // Drag create
    allowDragCreate: boolean;  // default: true

    // Drag unit
    dragUnit: 'minute' | 'hour' | 'day';  // default: 'minute'
}
```

```javascript
modes: {
    day: {
        allowDragMove: true,
        allowDragResize: true,
        allowDragCreate: true
    },
    week: {
        allowDragMove: true,
        allowDragResize: true,
        allowDragCreate: false  // Disable auto-create
    }
}
```

### MonthView Drag

```typescript
interface MonthViewDragConfig {
    allowDragMove: boolean;
    allowDragResize: boolean;
    allowDragCreate: boolean;
}
```

```javascript
modes: {
    month: {
        allowDragMove: true,
        allowDragResize: true,
        allowDragCreate: true
    }
}
```

### YearView Drag

```javascript
modes: {
    year: {
        allowDragMove: true,
        allowDragResize: false,  // Geen resize in year view
        allowDragCreate: true
    }
}
```

---

## 3. Auto-Create Events

### autoCreate Configuratie

```typescript
interface AutoCreateConfig {
    // Trigger gesture
    gesture?: 'click' | 'dblclick' | 'drag';

    // Nieuwe event naam
    newName?: string | ((date: Date) => string);

    // Snap naar tijdseenheid
    step?: string;  // '15 minutes', '30 minutes', '1 hour'
    snapType?: 'round' | 'ceil' | 'floor';

    // Default duur
    duration?: string;  // '1 hour', '30 minutes'

    // Start uur (voor all-day clicks)
    startHour?: number;
}
```

### Auto-Create Voorbeelden

```javascript
modes: {
    day: {
        autoCreate: {
            gesture: 'dblclick',
            newName: 'New Meeting',
            step: '15 minutes',
            duration: '1 hour'
        }
    },
    month: {
        autoCreate: {
            gesture: 'dblclick',
            startHour: 9,  // 9:00 AM
            duration: '1 hour',
            newName: (date) => `Meeting on ${DateHelper.format(date, 'MMM D')}`
        }
    }
}
```

### Disable Auto-Create

```javascript
modes: {
    week: {
        autoCreate: false
    }
}

// Of per interactie type
modes: {
    week: {
        allowDragCreate: false,  // Geen drag-create
        autoCreate: {
            gesture: 'dblclick'  // Alleen double-click
        }
    }
}
```

---

## 4. Drag Events

### Event Lifecycle

```javascript
calendar.on({
    // === MOVE EVENTS ===

    // Before drag starts
    beforeEventDrag({ eventRecord, context }) {
        // Return false to prevent drag
        if (eventRecord.locked) {
            return false;
        }
    },

    // During drag
    eventDrag({ eventRecord, startDate, endDate, context }) {
        // Update preview of feedback
        console.log('Dragging to:', startDate);
    },

    // After drop (success)
    afterEventDrop({ eventRecord, valid, startDate, endDate }) {
        if (valid) {
            console.log('Moved to:', startDate);
        } else {
            console.log('Drop was invalid');
        }
    },

    // === RESIZE EVENTS ===

    beforeEventResize({ eventRecord, edge }) {
        // edge is 'start' or 'end'
        console.log('Resizing:', edge);
    },

    eventResize({ eventRecord, startDate, endDate }) {
        // During resize
    },

    afterEventResize({ eventRecord, valid }) {
        if (valid) {
            console.log('New duration:', eventRecord.duration);
        }
    },

    // === CREATE EVENTS ===

    beforeDragCreate({ date, resourceRecord }) {
        // Return false to prevent
    },

    dragCreate({ eventRecord, startDate, endDate }) {
        // During create drag
    },

    afterDragCreate({ eventRecord, valid }) {
        if (valid) {
            console.log('Created:', eventRecord.name);
        }
    }
});
```

---

## 5. External Event Source

### ExternalEventSource Feature

```typescript
// Bron: calendar.d.ts line 9654
interface ExternalEventSourceConfig {
    type?: 'externalEventSource';

    // Grid die events levert
    grid: string | Grid;

    // Accepteer drops op Calendar
    droppable: boolean;
}
```

### Setup met Grid

```javascript
// Bron: examples/dragfromgrid/app.module.js
const calendar = new Calendar({
    features: {
        externalEventSource: {
            grid: 'unscheduled',  // Grid ID
            droppable: true
        }
    },

    listeners: {
        beforeDropExternal({ eventRecord, dropOnCalendar }) {
            if (!dropOnCalendar) {
                // Drop buiten calendar - verwijder van calendar
                calendar.eventStore.remove(eventRecord);
            }
        }
    }
});

const unscheduledGrid = new Grid({
    id: 'unscheduled',
    title: 'Unscheduled Events',

    // Deel project met calendar
    project: calendar.project,

    // Data store
    store: calendar.crudManager.getStore('unplanned'),

    columns: [{
        field: 'name',
        flex: 1,
        renderer: (data) => StringHelper.xss`
            <i class="${data.record.iconCls}"></i>
            ${data.record.name}
        `
    }, {
        text: 'Duration',
        type: 'duration',
        field: 'fullDuration',
        width: 100
    }],

    rowHeight: 50
});
```

### Custom Event Data voor Drag

```javascript
// Grid model met duration
class UnscheduledTask extends GridRowModel {
    get fullDuration() {
        return new Duration({
            unit: this.durationUnit,
            magnitude: this.duration
        });
    }
}

crudManager: {
    stores: {
        id: 'unplanned',
        modelClass: UnscheduledTask
    }
}
```

---

## 6. Cross-Calendar Drag

### Meerdere Calendars

```javascript
// Bron: examples/drag-between-calendars/app.module.js
const container = new Container({
    layout: 'hbox',
    flex: 1,

    defaults: {
        responsive: false,

        modes: {
            dayresource: {
                minResourceWidth: '10em',
                range: '3d',
                dayStartTime: 8,
                dayEndTime: 19,
                hourHeight: 70
            },
            // Disable andere modes
            day: null,
            week: null,
            month: null,
            year: null,
            agenda: null
        },

        listeners: {
            layoutUpdate({ source }) {
                // Sync hourHeight tussen calendars
                const other = container.widgetMap[
                    source.calendar.ref === 'stockholmCalendar'
                        ? 'miamiCalendar'
                        : 'stockholmCalendar'
                ];
                other.activeView.hourHeight = source.hourHeight;
                other.activeView.scrollable.y = source.scrollable.y;
            }
        }
    },

    items: {
        stockholmCalendar: {
            type: 'calendar',
            title: 'Team Stockholm',
            flex: 1,
            crudManager: {
                autoLoad: true,
                loadUrl: 'data/stockholm.json'
            }
        },

        split: { type: 'splitter' },

        miamiCalendar: {
            type: 'calendar',
            title: 'Team Miami',
            flex: 1,
            crudManager: {
                autoLoad: true,
                loadUrl: 'data/miami.json'
            }
        }
    }
});
```

### Cross-Calendar Drop Handling

```javascript
calendar1.on({
    afterEventDrop({ eventRecord, valid, externalDropTarget }) {
        if (externalDropTarget) {
            // Event was dropped op andere calendar
            const targetCalendar = Widget.fromElement(externalDropTarget);

            if (targetCalendar?.isCalendar) {
                // Transfer event to other calendar
                calendar1.eventStore.remove(eventRecord);
                targetCalendar.eventStore.add(eventRecord.data);
            }
        }
    }
});
```

---

## 7. Drag from Sidebar

### Sidebar als Drag Source

```javascript
// Bron: examples/dragfromsidebar/app.module.js
const calendar = new Calendar({
    sidebar: {
        items: {
            // Draggable event templates
            eventTemplates: {
                type: 'container',
                title: 'Event Templates',

                items: {
                    meeting: {
                        type: 'widget',
                        cls: 'draggable-event',
                        html: '<i class="fa fa-users"></i> Meeting',
                        dataset: {
                            eventName: 'Meeting',
                            duration: 60
                        }
                    },
                    call: {
                        type: 'widget',
                        cls: 'draggable-event',
                        html: '<i class="fa fa-phone"></i> Call',
                        dataset: {
                            eventName: 'Phone Call',
                            duration: 30
                        }
                    }
                }
            }
        }
    },

    features: {
        externalEventSource: {
            // Custom drag source
            dragItemSelector: '.draggable-event',

            // Event data van sidebar element
            getEventRecord(element) {
                return new EventModel({
                    name: element.dataset.eventName,
                    duration: parseInt(element.dataset.duration),
                    durationUnit: 'minute'
                });
            }
        }
    }
});
```

---

## 8. Drag Constraints

### Tijdsbeperkingen

```javascript
calendar.on({
    beforeEventDrag({ eventRecord, context }) {
        // Alleen binnen werkuren
        context.constrainTo = {
            startHour: 8,
            endHour: 18
        };
    }
});
```

### Resource Constraints

```javascript
modes: {
    dayresource: {
        // Alleen drag binnen eigen resource
        constrainDragToResource: true
    }
}

// Of met custom validatie
features: {
    calendarDrag: {
        validatorFn({ eventRecord, resourceRecord }) {
            // Alleen bepaalde resources
            const allowedResources = ['r1', 'r2', 'r3'];
            return allowedResources.includes(resourceRecord?.id);
        }
    }
}
```

### Date Constraints

```javascript
const calendar = new Calendar({
    minDate: new Date(2024, 0, 1),
    maxDate: new Date(2024, 11, 31),

    features: {
        calendarDrag: {
            validatorFn({ startDate, endDate }) {
                // Binnen calendar range
                if (startDate < this.minDate || endDate > this.maxDate) {
                    return 'Event must be within calendar range';
                }
                return true;
            }
        }
    }
});
```

---

## 9. Drag Visual Feedback

### Drag Proxy Styling

```css
/* Drag proxy */
.b-cal-drag-proxy {
    opacity: 0.8;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

/* Invalid drop zone */
.b-cal-drag-invalid .b-cal-drag-proxy {
    background-color: #ff0000 !important;
    opacity: 0.5;
}

/* Valid drop zone highlight */
.b-cal-drop-valid {
    background-color: rgba(0, 255, 0, 0.1);
}
```

### Custom Drag Tip

```javascript
features: {
    calendarDrag: {
        dragTip: {
            // Custom tooltip tijdens drag
            renderer({ eventRecord, startDate }) {
                return DateHelper.format(startDate, 'ddd, MMM D, HH:mm');
            }
        }
    }
}
```

---

## 10. Programmatic Drag

### Simuleer Drag

```javascript
// Verplaats event programmatisch
function moveEvent(eventRecord, newStartDate) {
    const duration = eventRecord.endDate - eventRecord.startDate;

    eventRecord.set({
        startDate: newStartDate,
        endDate: new Date(newStartDate.getTime() + duration)
    });
}

// Batch move
function moveMultipleEvents(events, daysDelta) {
    calendar.eventStore.beginBatch();

    events.forEach(event => {
        event.startDate = DateHelper.add(event.startDate, daysDelta, 'day');
        event.endDate = DateHelper.add(event.endDate, daysDelta, 'day');
    });

    calendar.eventStore.endBatch();
}
```

---

## 11. Drag & Drop met STM (Undo/Redo)

### Automatische Transaction Recording

```javascript
const calendar = new Calendar({
    project: {
        stm: {
            autoRecord: true
        }
    },

    tbar: {
        items: {
            undoRedo: {
                type: 'undoredo',
                width: 350
            }
        }
    }
});

// Drag/drop wordt automatisch opgenomen
// Undo terugzet naar originele positie
```

### Custom Transaction Titles

```javascript
project: {
    stm: {
        autoRecord: true,

        getTransactionTitle(transaction) {
            const action = transaction.queue[0];

            if (action?.type === 'UpdateAction') {
                return `Moved: ${action.record.name}`;
            }

            return `Transaction ${this.position}`;
        }
    }
}
```

---

## 12. Touch Drag Support

### Mobile Configuratie

```javascript
const calendar = new Calendar({
    // Touch-friendly settings
    features: {
        calendarDrag: {
            // Langere press voor touch drag
            touchStartDelay: 300,

            // Grotere drag threshold
            dragThreshold: 10
        }
    },

    responsive: {
        small: {
            when: 500,
            modes: {
                day: {
                    // Grotere touch targets
                    hourHeight: 80
                }
            }
        }
    }
});
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| CalendarDrag | 7728 |
| ExternalEventSource | 9654 |
| DragContext | varies |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `dragfromgrid/` | External grid drag source |
| `dragfromsidebar/` | Sidebar drag source |
| `drag-between-calendars/` | Cross-calendar drag |
| `drag-onto-tasks/` | Drop op taken |
| `undoredo/` | Undo/redo met drag |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
