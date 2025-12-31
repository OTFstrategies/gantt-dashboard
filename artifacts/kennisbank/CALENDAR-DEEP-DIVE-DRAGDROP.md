# CALENDAR-DEEP-DIVE-DRAGDROP.md

## Overzicht

Dit document beschrijft het uitgebreide drag & drop systeem in Bryntum Calendar. Het systeem ondersteunt:

1. **Drag Create** - Nieuwe events aanmaken door te slepen
2. **Drag Move** - Events verplaatsen naar andere tijden/dagen
3. **Drag Resize** - Events vergroten/verkleinen
4. **External Drag** - Events slepen van/naar externe bronnen

---

## TypeScript Interfaces

### CalendarDragConfig (regel 7538)

```typescript
// calendar.d.ts:7538
type CalendarDragConfig = {
    type?: 'drag'

    // Basis drag operaties
    creatable?: boolean      // Sta drag-create toe (default: true)
    draggable?: boolean      // Sta drag-move toe (default: true)
    resizable?: boolean      // Sta drag-resize toe (default: true)

    // Disabled state
    disabled?: boolean|'inert'

    // Nieuwe event configuratie
    newName?: string|((eventRecord: EventModel) => string)
    durationUnit?: string    // Default duration unit voor nieuwe events

    // Tooltip tijdens drag
    tooltip?: boolean|EventTipConfig|EventTip
    recurrenceTip?: string   // Hint voor recurring events

    // Footer element tijdens drag
    footer?: DomConfig

    // External drag
    removeFromExternalStore?: boolean  // Verwijder uit bron store (default: true)

    // Validatie functies
    validateCreateFn?: ((info: {
        drag: DragContext,
        event: Event,
        view: CalendarView,
        eventRecord: EventModel
    }) => boolean|ValidateCreateResult)|string

    validateMoveFn?: ((info: {
        drag: DragContext,
        event: Event,
        view: CalendarView,
        eventRecord: EventModel
    }) => boolean)|string

    validateResizeFn?: ((info: {
        drag: DragContext,
        event: Event,
        view: CalendarView,
        eventRecord: EventModel
    }) => boolean|Promise<any>)|string

    // Event handlers
    listeners?: CalendarDragListeners
    onBeforeDestroy?: ((event: { source: Base }) => void)|string
    onDisable?: ((event: { source: InstancePlugin }) => void)|string
    onEnable?: ((event: { source: InstancePlugin }) => void)|string
}
```

### CalendarDrag Class (regel 7728)

```typescript
// calendar.d.ts:7728
export class CalendarDrag extends CalendarFeature {
    static readonly isCalendarDrag: boolean
    readonly isCalendarDrag: boolean

    // Runtime configuratie
    removeFromExternalStore: boolean

    constructor(config?: CalendarDragConfig);
}
```

### ExternalEventSourceConfig (regel 9507)

```typescript
// calendar.d.ts:9507
type ExternalEventSourceConfig = {
    type?: 'externalEventSource'|'externaleventsource'

    // Grid als bron
    grid?: Grid|string

    // Custom element bron
    dragRootElement?: HTMLElement|string
    dragItemSelector?: string
    getRecordFromElement?: ((element: HTMLElement) => EventModel|void)|string

    // Draggable configuratie
    draggable?: object

    // Droppable - sta drop terug naar bron toe
    droppable?: object|boolean

    // Proxy visibility
    hideExternalProxy?: boolean

    // State
    disabled?: boolean|'inert'

    // Events
    listeners?: ExternalEventSourceListeners
}
```

### ExternalEventSource Class (regel 9654)

```typescript
// calendar.d.ts:9654
export class ExternalEventSource extends CalendarFeature {
    static readonly isExternalEventSource: boolean
    readonly isExternalEventSource: boolean

    constructor(config?: ExternalEventSourceConfig);
}
```

### DragHelper Class (regel 78256)

```typescript
// calendar.d.ts:78256
export class DragHelper extends Base {
    // Configuratie
    cloneTarget: boolean
    autoSizeClonedTarget: boolean
    dropTargetSelector: string
    targetSelector: string
    proxySelector: string

    // Methoden
    animateProxyTo(target: HTMLElement, options?: object): Promise<void>;
}
```

### DragContext Class (regel 82633)

```typescript
// calendar.d.ts:82633
export class DragContext extends Base {
    // Drag state
    grabbed: HTMLElement      // Het gesleepte element
    valid: boolean            // Is de drop valid?
    target: HTMLElement       // Drop target element

    // Custom data
    // Kan worden uitgebreid met eigen properties
}
```

---

## Calendar Drag Events

### Drag Create Events

```typescript
// calendar.d.ts:12363
beforeDragCreate: (event: {
    source: Calendar,
    drag: DragContext,
    domEvent: Event,
    date: Date,
    resourceRecord?: ResourceModel,
    feature: CalendarDrag,
    view: CalendarView
}) => Promise<boolean>|boolean|void

// calendar.d.ts:12379
beforeDragCreateEnd: (event: {
    source: Calendar,
    drag: DragContext,
    event: Event,
    eventRecord: EventModel,
    newStartDate: Date,
    newEndDate: Date,
    resourceRecord?: ResourceModel,
    feature: CalendarDrag,
    validation: boolean|ValidateCreateResult,
    view: CalendarView
}) => Promise<boolean>|boolean|void

// calendar.d.ts:16154
dragCreateEnd: (event: {
    source: Calendar,
    drag: DragContext,
    event: Event,
    eventRecord: EventModel,
    resourceRecord?: ResourceModel,
    feature: CalendarDrag,
    validation: boolean|ValidateCreateResult,
    view: CalendarView
}) => void
```

### Drag Move Events

```typescript
// calendar.d.ts:12393
beforeDragMove: (event: {
    source: Calendar,
    drag: DragContext,
    domEvent: Event,
    eventRecord: EventModel,
    date: Date,
    resourceRecord?: ResourceModel,
    feature: CalendarDrag,
    view: CalendarView
}) => Promise<boolean>|boolean|void

// calendar.d.ts:12410
beforeDragMoveEnd: (event: {
    source: Calendar,
    drag: DragContext,
    event: Event,
    eventRecord: EventModel,
    proxyEventRecord: EventModel,
    newStartDate: Date,
    newEndDate: Date,
    resourceRecord?: ResourceModel,
    feature: CalendarDrag,
    validation: boolean|ValidateCreateResult,
    view: CalendarView
}) => Promise<boolean>|boolean|void

// calendar.d.ts:16168
dragMoveEnd: (event: {
    source: Calendar,
    drag: DragContext,
    event: Event,
    eventRecord: EventModel,
    resourceRecord?: ResourceModel,
    feature: CalendarDrag,
    validation: boolean|ValidateCreateResult,
    view: CalendarView
}) => void
```

### Drag Resize Events

```typescript
// calendar.d.ts:12424
beforeDragResize: (event: {
    source: Calendar,
    drag: DragContext,
    domEvent: Event,
    eventRecord: EventModel,
    date: Date,
    resourceRecord?: ResourceModel,
    feature: CalendarDrag,
    view: CalendarView
}) => Promise<boolean>|boolean|void

// calendar.d.ts:12440
beforeDragResizeEnd: (event: {
    source: Calendar,
    drag: DragContext,
    event: Event,
    eventRecord: EventModel,
    proxyEventRecord: EventModel,
    newStartDate: Date,
    newEndDate: Date,
    feature: CalendarDrag,
    validation: boolean|ValidateCreateResult,
    view: CalendarView
}) => Promise<boolean>|boolean|void

// calendar.d.ts:16199
dragResizeEnd: (event: {
    source: Calendar,
    drag: DragContext,
    event: Event,
    eventRecord: EventModel,
    feature: CalendarDrag,
    validation: boolean|ValidateCreateResult,
    view: CalendarView
}) => void
```

### External Drag Events

```typescript
// calendar.d.ts:16187
dragMoveExternal: (event: {
    eventRecord: EventModel,
    itemElement: HTMLElement,
    targetElement: HTMLElement,
    domEvent: Event,
    overIndex: number,
    overRecord: Model,
    isAbove: boolean,
    altKey: boolean,
    ctrlKey: boolean,
    metaKey: boolean,
    shiftKey: boolean
}) => void
```

---

## Basis Configuratie

### CalendarDrag Feature

```javascript
import { Calendar } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo : 'container',

    features : {
        drag : {
            // Alle drag operaties aan/uit
            creatable : true,   // Drag om nieuwe events te maken
            draggable : true,   // Drag om events te verplaatsen
            resizable : true,   // Drag om events te resizen

            // Naam voor nieuwe events
            newName : 'Nieuw event',

            // Of een functie
            newName : (eventRecord) => {
                return `Event op ${DateHelper.format(eventRecord.startDate, 'DD-MM')}`;
            },

            // Default duration unit
            durationUnit : 'hour',

            // Tooltip tijdens drag
            tooltip : true
        }
    }
});
```

### Per-View Configuratie

```javascript
const calendar = new Calendar({
    modes : {
        day : {
            // Drag instellingen voor day view
            allowDragCreate : true,
            allowDragMove   : true,
            allowDragResize : true
        },
        week : {
            allowDragCreate : true,
            allowDragMove   : true,
            allowDragResize : true
        },
        month : {
            // In month view is resize vaak uitgeschakeld
            allowDragCreate : true,
            allowDragMove   : true,
            allowDragResize : false
        }
    }
});
```

### Drag Uitschakelen

```javascript
// Volledig uitschakelen
const calendar = new Calendar({
    features : {
        drag : false
    }
});

// Alleen bepaalde operaties
const calendar = new Calendar({
    features : {
        drag : {
            creatable : false,  // Geen nieuwe events via drag
            resizable : false   // Geen resize
        }
    }
});

// Runtime uitschakelen
calendar.features.drag.disabled = true;

// Weer inschakelen
calendar.features.drag.disabled = false;
```

---

## Drag Validatie

### Validate Create

```javascript
const calendar = new Calendar({
    features : {
        drag : {
            validateCreateFn({ drag, event, view, eventRecord }) {
                // Geen events in het weekend
                const day = eventRecord.startDate.getDay();
                if (day === 0 || day === 6) {
                    return {
                        valid   : false,
                        message : 'Geen events in het weekend toegestaan'
                    };
                }

                // Geen events buiten werktijden
                const hour = eventRecord.startDate.getHours();
                if (hour < 8 || hour >= 18) {
                    return {
                        valid   : false,
                        message : 'Alleen events tussen 8:00 en 18:00'
                    };
                }

                return true;
            }
        }
    }
});
```

### Validate Move

```javascript
const calendar = new Calendar({
    features : {
        drag : {
            validateMoveFn({ drag, event, view, eventRecord }) {
                // Check voor minimum duration
                const duration = DateHelper.diff(
                    eventRecord.startDate,
                    eventRecord.endDate,
                    'minute'
                );

                if (duration < 30) {
                    return false;
                }

                // Check voor resource availability
                const resource = eventRecord.resource;
                if (resource?.unavailable) {
                    return false;
                }

                return true;
            }
        }
    }
});
```

### Validate Resize

```javascript
const calendar = new Calendar({
    features : {
        drag : {
            validateResizeFn({ drag, event, view, eventRecord }) {
                const duration = DateHelper.diff(
                    eventRecord.startDate,
                    eventRecord.endDate,
                    'minute'
                );

                // Minimum 15 minuten
                if (duration < 15) {
                    return false;
                }

                // Maximum 8 uur
                if (duration > 480) {
                    return false;
                }

                return true;
            }
        }
    }
});
```

### ValidateCreateResult Object

```javascript
// Return een object voor gedetailleerde validatie
validateCreateFn({ eventRecord }) {
    return {
        valid   : false,
        message : 'Custom validatie bericht',

        // Optioneel: pas het event aan
        eventRecord : {
            name : 'Aangepaste naam',
            cls  : 'special-event'
        }
    };
}
```

---

## Event Handlers voor Drag

### Async Confirmation

```javascript
import { Calendar, MessageDialog, DateHelper } from '@bryntum/calendar';

// Gebaseerd op examples/confirmation-dialogs/app.module.js
const calendar = new Calendar({
    listeners : {
        // Bevestiging bij drag move
        async beforeDragMoveEnd({ eventRecord }) {
            const result = await MessageDialog.confirm({
                title   : 'Bevestig verplaatsing',
                message : `Verplaatsen naar ${DateHelper.format(eventRecord.startDate, 'ddd LST')}?`
            });

            return result === MessageDialog.yesButton;
        },

        // Bevestiging bij resize
        async beforeDragResizeEnd({ eventRecord }) {
            const duration = DateHelper.getDurationInUnit(
                eventRecord.startDate,
                eventRecord.endDate,
                'hour'
            );

            const result = await MessageDialog.confirm({
                title   : 'Bevestig aanpassing',
                message : `Nieuwe duur: ${duration} uur?`
            });

            return result === MessageDialog.yesButton;
        },

        // Bevestiging bij create
        async beforeDragCreateEnd({ eventRecord }) {
            const result = await MessageDialog.confirm({
                title   : 'Bevestig aanmaken',
                message : `Event aanmaken op ${DateHelper.format(eventRecord.startDate, 'ddd LST')}?`
            });

            return result === MessageDialog.yesButton;
        }
    }
});
```

### Drag Event Logging

```javascript
const calendar = new Calendar({
    listeners : {
        beforeDragCreate({ date, resourceRecord, view }) {
            console.log('Start drag create:', {
                date,
                resource : resourceRecord?.name,
                view     : view.type
            });
        },

        dragCreateEnd({ eventRecord }) {
            console.log('Event created:', eventRecord.name);
        },

        beforeDragMove({ eventRecord }) {
            console.log('Start moving:', eventRecord.name);
        },

        dragMoveEnd({ eventRecord, resourceRecord }) {
            console.log('Moved to:', {
                start    : eventRecord.startDate,
                resource : resourceRecord?.name
            });
        },

        beforeDragResize({ eventRecord }) {
            console.log('Start resizing:', eventRecord.name);
        },

        dragResizeEnd({ eventRecord }) {
            console.log('New duration:', eventRecord.duration, eventRecord.durationUnit);
        }
    }
});
```

---

## External Event Source

### Drag van Grid naar Calendar

```javascript
// Gebaseerd op examples/dragfromgrid/app.module.js
import { Calendar, Grid, Splitter, GridRowModel, Duration } from '@bryntum/calendar';

const calendar = new Calendar({
    flex     : 1,
    appendTo : 'calendar-container',

    crudManager : {
        loadUrl  : 'data/data.json',
        autoLoad : true,
        stores   : {
            id         : 'unplanned',
            modelClass : class extends GridRowModel {
                get fullDuration() {
                    return new Duration({
                        unit      : this.durationUnit,
                        magnitude : this.duration
                    });
                }
            }
        }
    },

    features : {
        externalEventSource : {
            grid      : 'unscheduled',  // ID van de grid
            droppable : true            // Sta drop terug naar grid toe
        }
    },

    listeners : {
        beforeDropExternal({ eventRecord, dropOnCalendar }) {
            if (!dropOnCalendar) {
                // Event werd teruggesleept naar grid
                calendar.eventStore.remove(eventRecord);
            }
        }
    }
});

// Splitter tussen calendar en grid
new Splitter({
    appendTo : 'calendar-container'
});

// Unscheduled events grid
const unscheduledGrid = new Grid({
    id       : 'unscheduled',
    appendTo : 'calendar-container',
    title    : 'Ongeplande Events',
    flex     : '0 0 320px',

    // Gebruik dezelfde project
    project : calendar.project,
    store   : calendar.crudManager.getStore('unplanned'),

    columns : [
        {
            text  : 'Naam',
            field : 'name',
            flex  : 1
        },
        {
            text  : 'Duur',
            type  : 'duration',
            field : 'fullDuration',
            width : 100
        }
    ]
});
```

### Drag van Sidebar naar Calendar

```javascript
// Gebaseerd op examples/dragfromsidebar/app.module.js
import { Calendar, StringHelper, GridRowModel, Duration } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo : 'container',

    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json',
        stores   : {
            id         : 'unplanned',
            modelClass : class extends GridRowModel {
                get fullDuration() {
                    return new Duration({
                        unit      : this.durationUnit,
                        magnitude : this.duration
                    });
                }
            }
        }
    },

    features : {
        externalEventSource : {
            grid      : 'unscheduled',
            droppable : true
        }
    },

    sidebar : {
        flex : '0 0 300px',

        items : {
            // Grid in de sidebar
            externalEvents : {
                type   : 'grid',
                id     : 'unscheduled',
                flex   : '1 1 0',
                weight : 250,
                store  : 'unplanned',

                features : {
                    stripe   : true,
                    sort     : 'name',
                    cellEdit : false
                },

                columns : [{
                    text       : 'Ongeplande taken',
                    flex       : 1,
                    field      : 'name',
                    htmlEncode : false,
                    renderer   : ({ record }) =>
                        StringHelper.xss`<i class="${record.iconCls}"></i>${record.name}`
                }, {
                    text            : 'Duur',
                    type            : 'duration',
                    width           : 80,
                    abbreviatedUnit : true
                }],

                rowHeight : 50
            },

            resourceFilter : {
                flex : '0 1 auto'
            }
        }
    },

    listeners : {
        beforeDropExternal({ eventRecord, dropOnCalendar }) {
            if (!dropOnCalendar) {
                calendar.eventStore.remove(eventRecord);
            }
        }
    }
});
```

---

## Custom Drag Helper

### Drag naar Events (Equipment Drop)

```javascript
// Gebaseerd op examples/drag-onto-tasks/app.module.js
import { DragHelper, Toast, Calendar } from '@bryntum/calendar';

class EquipmentDrag extends DragHelper {
    static configurable = {
        callOnFunctions      : true,
        cloneTarget          : true,
        autoSizeClonedTarget : false,

        // Alleen droppen op calendar events
        dropTargetSelector : '.b-cal-event',

        // Drag alleen het icon
        proxySelector : 'i',

        // Alleen grid cellen kunnen gesleept worden
        targetSelector : '.b-grid-row:not(.b-group-row) .b-grid-cell'
    };

    onDragStart({ event, context }) {
        // Bewaar referentie naar equipment
        context.equipment = this.grid.getRecordFromElement(context.grabbed);

        // Disable tooltips tijdens drag
        this.calendar.features.eventTooltip.disabled = true;
    }

    async onDrop({ context }) {
        if (context.valid) {
            const equipmentItem = context.equipment;
            const eventRecord = this.calendar.resolveEventRecord(context.target);

            // Check of equipment al is toegewezen
            if (eventRecord.equipment.includes(equipmentItem)) {
                context.valid = false;
                Toast.show(`${equipmentItem.name} is al toegewezen aan ${eventRecord.name}`);
            }
            else {
                // Animeer naar doelpositie
                const equipmentWrap = context.target.closest('.b-cal-event')
                    .querySelector('.b-event-equipment-wrap');

                if (equipmentWrap) {
                    await this.animateProxyTo(equipmentWrap.lastElementChild || equipmentWrap, {
                        align : 'l0-r14'
                    });
                }

                // Voeg equipment toe aan event
                eventRecord.equipment = eventRecord.equipment.concat(equipmentItem);
                Toast.show(`${equipmentItem.name} toegevoegd aan ${eventRecord.name}`);
            }
        }

        this.calendar.features.eventTooltip.disabled = false;
    }
}

// Gebruik
const drag = new EquipmentDrag({
    grid         : equipmentGrid,
    calendar     : calendar,
    outerElement : equipmentGrid.contentElement
});
```

---

## Drag Tussen Calendars

```javascript
// Gebaseerd op examples/drag-between-calendars/app.module.js
import { Container } from '@bryntum/calendar';

const container = new Container({
    appendTo : 'container',
    layout   : 'hbox',
    flex     : 1,

    defaults : {
        responsive : false,

        modes : {
            dayresource : {
                minResourceWidth : '10em',
                range            : '3d',
                dayStartTime     : 8,
                dayEndTime       : 19
            },
            day    : null,
            week   : null,
            month  : null,
            year   : null,
            agenda : null
        },

        listeners : {
            layoutUpdate({ source }) {
                // Synchroniseer hourHeight tussen calendars
                const otherId = source.calendar.ref === 'calendar1'
                    ? 'calendar2'
                    : 'calendar1';
                const other = container.widgetMap[otherId];

                other.activeView.hourHeight = source.hourHeight;
                other.activeView.scrollable.y = source.scrollable.y;
            }
        }
    },

    items : {
        calendar1 : {
            type  : 'calendar',
            title : 'Team A',
            date  : new Date(2025, 8, 1),
            flex  : 1,

            crudManager : {
                autoLoad : true,
                loadUrl  : 'data/team-a.json'
            }
        },

        splitter : { type : 'splitter' },

        calendar2 : {
            type  : 'calendar',
            title : 'Team B',
            date  : new Date(2025, 8, 1),
            flex  : 1,

            crudManager : {
                autoLoad : true,
                loadUrl  : 'data/team-b.json'
            }
        }
    }
});
```

---

## Drag Constraints

### Tijdslot Constraints

```javascript
const calendar = new Calendar({
    features : {
        drag : {
            validateCreateFn({ eventRecord }) {
                const start = eventRecord.startDate;
                const hour = start.getHours();
                const minutes = start.getMinutes();

                // Alleen op hele of halve uren
                if (minutes !== 0 && minutes !== 30) {
                    return false;
                }

                // Alleen tussen 9:00 en 17:00
                if (hour < 9 || hour >= 17) {
                    return {
                        valid   : false,
                        message : 'Alleen tussen 9:00 en 17:00'
                    };
                }

                return true;
            }
        }
    }
});
```

### Resource Constraints

```javascript
const calendar = new Calendar({
    features : {
        drag : {
            validateMoveFn({ eventRecord }) {
                const resource = eventRecord.resource;

                // Check resource capacity
                if (resource) {
                    const existingEvents = calendar.eventStore.query(
                        e => e !== eventRecord &&
                             e.resourceId === resource.id &&
                             e.startDate < eventRecord.endDate &&
                             e.endDate > eventRecord.startDate
                    );

                    if (existingEvents.length >= resource.maxConcurrent) {
                        return false;
                    }
                }

                return true;
            }
        }
    }
});
```

### Date Range Constraints

```javascript
const calendar = new Calendar({
    features : {
        drag : {
            validateMoveFn({ eventRecord }) {
                const today = DateHelper.clearTime(new Date());
                const eventDate = DateHelper.clearTime(eventRecord.startDate);

                // Niet in het verleden
                if (eventDate < today) {
                    return false;
                }

                // Niet meer dan 3 maanden vooruit
                const maxDate = DateHelper.add(today, 3, 'month');
                if (eventDate > maxDate) {
                    return false;
                }

                return true;
            }
        }
    }
});
```

---

## Drag Tooltip

### Basis Tooltip

```javascript
const calendar = new Calendar({
    features : {
        drag : {
            tooltip : true
        }
    }
});
```

### Custom Tooltip

```javascript
const calendar = new Calendar({
    features : {
        drag : {
            tooltip : {
                // Tooltip configuratie
                cls      : 'my-drag-tooltip',
                anchor   : true,
                align    : 'l-r',

                // Custom renderer
                renderer({ eventRecord, startDate, endDate }) {
                    return `
                        <div class="drag-tooltip-content">
                            <div class="event-name">${eventRecord.name}</div>
                            <div class="time-range">
                                ${DateHelper.format(startDate, 'HH:mm')} -
                                ${DateHelper.format(endDate, 'HH:mm')}
                            </div>
                            <div class="duration">
                                ${DateHelper.formatDelta(endDate - startDate)}
                            </div>
                        </div>
                    `;
                }
            }
        }
    }
});
```

---

## CSS Styling

### Drag Proxy Styling

```css
/* Event proxy tijdens drag */
.b-dragging .b-cal-event {
    opacity: 0.7;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: scale(1.02);
}

/* Invalid drop indicator */
.b-dragging.b-drag-invalid .b-cal-event {
    border: 2px dashed #f44336;
    background-color: rgba(244, 67, 54, 0.1);
}

/* Valid drop indicator */
.b-dragging.b-drag-valid .b-cal-event {
    border: 2px solid #4caf50;
}

/* Resize handles */
.b-cal-event .b-resize-handle {
    position: absolute;
    width: 100%;
    height: 8px;
    cursor: ns-resize;
}

.b-cal-event .b-resize-handle-start {
    top: 0;
}

.b-cal-event .b-resize-handle-end {
    bottom: 0;
}

/* Drag footer (eindtijd indicator) */
.b-cal-event-footer {
    position: absolute;
    bottom: 2px;
    right: 4px;
    font-size: 0.85em;
    opacity: 0.8;
}
```

### External Drag Styling

```css
/* Grid row als draggable */
.b-grid-row.b-draggable {
    cursor: grab;
}

.b-grid-row.b-dragging {
    cursor: grabbing;
    opacity: 0.5;
}

/* Drag proxy van externe bron */
.b-external-drag-proxy {
    background: var(--calendar-event-background);
    border-radius: 4px;
    padding: 8px 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Drop zone highlight */
.b-calendar.b-drop-target {
    outline: 2px dashed var(--calendar-primary-color);
    outline-offset: -2px;
}
```

---

## Best Practices

### 1. Performance bij Veel Events

```javascript
// Gebruik validation caching
const validationCache = new Map();

const calendar = new Calendar({
    features : {
        drag : {
            validateMoveFn({ eventRecord }) {
                const cacheKey = `${eventRecord.id}-${eventRecord.startDate.getTime()}`;

                if (validationCache.has(cacheKey)) {
                    return validationCache.get(cacheKey);
                }

                const result = performExpensiveValidation(eventRecord);
                validationCache.set(cacheKey, result);

                return result;
            }
        }
    },

    listeners : {
        dragMoveEnd() {
            // Clear cache na drop
            validationCache.clear();
        }
    }
});
```

### 2. Undo/Redo Support

```javascript
const calendar = new Calendar({
    features : {
        drag : true
    },

    project : {
        stm : {
            autoRecord : true
        }
    },

    listeners : {
        beforeDragMoveEnd() {
            // Start transaction voor drag operatie
            calendar.project.stm.startTransaction('Event verplaatst');
        },

        dragMoveEnd() {
            calendar.project.stm.stopTransaction();
        }
    }
});
```

### 3. Drag State Feedback

```javascript
const calendar = new Calendar({
    listeners : {
        beforeDragMove({ eventRecord }) {
            // Toon visuele feedback
            eventRecord.cls = 'being-dragged';
        },

        dragMoveEnd({ eventRecord }) {
            // Verwijder feedback
            eventRecord.cls = '';
        },

        // Ook bij cancel
        dragCancel({ eventRecord }) {
            eventRecord.cls = '';
        }
    }
});
```

---

## TypeScript Referenties

| Interface | Regel | Beschrijving |
|-----------|-------|--------------|
| `CalendarDragConfig` | 7538 | Configuratie voor CalendarDrag feature |
| `CalendarDrag` | 7728 | CalendarDrag class |
| `ExternalEventSourceConfig` | 9507 | Configuratie voor externe drag source |
| `ExternalEventSource` | 9654 | ExternalEventSource class |
| `DragHelper` | 78256 | Basis drag helper class |
| `DragContext` | 82633 | Context object voor drag operaties |
| `beforeDragCreate` | 12363 | Event voor start drag create |
| `beforeDragMove` | 12393 | Event voor start drag move |
| `beforeDragResize` | 12424 | Event voor start drag resize |
| `beforeDragMoveEnd` | 12410 | Event voor einde drag move |
| `beforeDragResizeEnd` | 12440 | Event voor einde drag resize |
| `beforeDragCreateEnd` | 12379 | Event voor einde drag create |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `examples/confirmation-dialogs/` | Async bevestigingsdialogen bij drag operaties |
| `examples/dragfromgrid/` | Drag events van Grid naar Calendar |
| `examples/dragfromsidebar/` | Drag events van sidebar Grid |
| `examples/drag-onto-tasks/` | Custom DragHelper voor equipment op events |
| `examples/drag-between-calendars/` | Drag events tussen twee calendars |

---

## Samenvatting

Het Bryntum Calendar drag & drop systeem biedt:

1. **CalendarDrag Feature** - Ingebouwde drag create, move en resize
2. **Validation Functions** - `validateCreateFn`, `validateMoveFn`, `validateResizeFn`
3. **Async Event Handlers** - `beforeDragXxxEnd` met Promise support
4. **ExternalEventSource** - Drag van/naar externe grids
5. **Custom DragHelper** - Uitbreidbare drag functionaliteit

Key patterns:
- Return `false` of `{ valid: false, message: '...' }` voor validatie
- Async handlers met `await MessageDialog.confirm()`
- `proxyEventRecord` vs `eventRecord` - proxy wordt getoond, origineel blijft ongewijzigd
- `droppable: true` voor bidirectionele drag
