# Calendar Deep Dive: Features Catalogus

> **Fase 6** - Volledige catalogus van alle Bryntum Calendar features met configuratie, events en use cases.

---

## Inhoudsopgave

1. [Features Overzicht](#1-features-overzicht)
2. [CalendarDrag](#2-calendardrag)
3. [EventEdit](#3-eventedit)
4. [EventMenu](#4-eventmenu)
5. [ScheduleMenu](#5-schedulemenu)
6. [EventTooltip](#6-eventtooltip)
7. [ScheduleTooltip](#7-scheduletooltip)
8. [EventCopyPaste](#8-eventcopypaste)
9. [ExternalEventSource](#9-externaleventsource)
10. [LoadOnDemand](#10-loadondemand)
11. [TimeRanges](#11-timeranges)
12. [WeekExpander](#12-weekexpander)
13. [EventBuffer](#13-eventbuffer)
14. [Print](#14-print)
15. [ExcelExporter](#15-excelexporter)
16. [Feature Combinaties](#16-feature-combinaties)
17. [Cross-References](#17-cross-references)

---

## 1. Features Overzicht

### 1.1 Feature Architectuur

```
CalendarFeature (abstract)
├── CalendarDrag        [enabled]   Drag-create, move, resize events
├── EventEdit           [enabled]   Event editor popup
├── EventMenu           [enabled]   Right-click context menu op events
├── ScheduleMenu        [enabled]   Right-click context menu op lege tijd
├── EventTooltip        [enabled]   Tooltip bij click/hover op events
├── EventCopyPaste      [enabled]   Copy/paste events via keyboard/menu
├── ScheduleTooltip     [disabled]  Tooltip met tijd bij hover op schedule
├── ExternalEventSource [disabled]  Drag events van externe bron
├── LoadOnDemand        [disabled]  Lazy loading van data per datum range
├── TimeRanges          [disabled]  Gemarkeerde tijdperiodes
├── WeekExpander        [disabled]  Uitklappen van week rows in MonthView
├── EventBuffer         [disabled]  Buffer tijd voor/na events (travel time)
├── Print               [disabled]  Print Calendar
└── ExcelExporter       [disabled]  Export naar Excel
```

### 1.2 Feature Configuratie Patronen

```typescript
// Pattern 1: Boolean enable/disable
features: {
    eventEdit: true,   // Enable met defaults
    drag: false        // Disable
}

// Pattern 2: Object configuratie
features: {
    eventTooltip: {
        align: 'l-r',
        showOn: 'hover',
        hoverDelay: 100
    }
}

// Pattern 3: Framework wrapper props
<BryntumCalendar
    eventEditFeature={true}
    eventTooltipFeature={{
        align: 'l-r',
        showOn: 'hover'
    }}
    dragFeature={false}
/>
```

### 1.3 Runtime Feature Access

```typescript
// Toegang via features property
const calendar = new Calendar({ ... });

// Feature methods aanroepen
calendar.features.eventEdit.editEvent(eventRecord);

// Feature config wijzigen
calendar.features.eventTooltip.showOn = 'click';

// Feature enable/disable runtime
calendar.features.drag.disabled = true;
```

---

## 2. CalendarDrag

**Status:** Enabled by default

De primaire interactie feature voor het creëren, verplaatsen en resizen van events via drag-and-drop.

### 2.1 Configuratie

```typescript
interface CalendarDragConfig {
    // Standaard duration voor nieuwe events (minuten)
    newEventDuration: number; // default: 60

    // Eenheid voor duration
    newEventDurationUnit: 'minute' | 'hour' | 'day'; // default: 'minute'

    // Snap interval bij drag (minuten)
    increment: number; // default: 15

    // Verwijder event uit externe store na drop
    removeFromExternalStore: boolean; // default: true

    // Proxy element tijdens drag
    showProxy: boolean; // default: true

    // Tooltip tijdens drag
    showTooltip: boolean; // default: true

    // Minimum drag pixels voordat drag start
    dragThreshold: number; // default: 5

    // Disabled state
    disabled: boolean; // default: false
}
```

### 2.2 Events

```typescript
// Before drag start - return false to prevent
calendar.on('beforeEventDrag', ({ eventRecord, context }) => {
    if (eventRecord.locked) {
        return false; // Prevent drag
    }
});

// During drag
calendar.on('eventDrag', ({ eventRecord, startDate, endDate, resource }) => {
    console.log(`Dragging to ${startDate}`);
});

// After drop
calendar.on('eventDrop', ({ eventRecords, targetDate, targetResource, valid }) => {
    if (valid) {
        console.log('Events dropped successfully');
    }
});

// Drag create (nieuw event)
calendar.on('beforeDragCreate', ({ date, resource }) => {
    // Return false to prevent create
});

calendar.on('dragCreate', ({ eventRecord, date, resource }) => {
    console.log(`Created event at ${date}`);
});

// Resize events
calendar.on('beforeEventResize', ({ eventRecord, edge }) => {
    // edge: 'start' or 'end'
});

calendar.on('eventResize', ({ eventRecord, startDate, endDate }) => {
    console.log(`Resized: ${startDate} - ${endDate}`);
});
```

### 2.3 Voorbeeldcode

```typescript
const calendar = new Calendar({
    features: {
        drag: {
            // 30 minuten intervals
            increment: 30,

            // 2 uur default voor nieuwe events
            newEventDuration: 120,
            newEventDurationUnit: 'minute',

            // Custom validatie
            validateFn({ eventRecord, startDate, endDate, resource }) {
                // Geen events voor 8:00
                if (startDate.getHours() < 8) {
                    return {
                        valid: false,
                        message: 'Events kunnen niet voor 8:00 beginnen'
                    };
                }
                return true;
            }
        }
    },

    listeners: {
        beforeEventDrag({ eventRecord }) {
            // Alleen unlocked events mogen bewegen
            return !eventRecord.locked;
        },

        eventDrop({ eventRecords, valid }) {
            if (valid) {
                // Auto-save na drop
                this.crudManager.sync();
            }
        }
    }
});
```

---

## 3. EventEdit

**Status:** Enabled by default

Editor popup voor het bewerken van event details.

### 3.1 Configuratie

```typescript
interface EventEditConfig {
    // Auto-save bij sluiten
    autoClose: boolean; // default: true

    // Trigger actie
    triggerEvent: 'eventclick' | 'eventdblclick'; // default: 'eventdblclick'

    // Editor type
    editorType: 'popup' | 'side'; // default: 'popup'

    // Read-only mode
    readOnly: boolean; // default: false

    // Editor items configuratie
    items: {
        [fieldName: string]: FieldConfig | null;
    };

    // Extra tab items
    extraItems: {
        [tabName: string]: TabConfig;
    };

    // Editor config (Popup configuratie)
    editorConfig: PopupConfig;
}

interface FieldConfig {
    type: string;
    label: string;
    name: string;
    weight: number;     // Volgorde (lager = eerst)
    required?: boolean;
    hidden?: boolean;
}
```

### 3.2 Standaard Editor Items

```typescript
// Default items en hun weights
const defaultItems = {
    nameField:        { weight: 100, label: 'Name' },
    resourceField:    { weight: 200, label: 'Calendar' },
    startDateField:   { weight: 300, label: 'Start' },
    startTimeField:   { weight: 400 },
    endDateField:     { weight: 500, label: 'End' },
    endTimeField:     { weight: 600 },
    allDayField:      { weight: 700, label: 'All day' },
    recurrenceCombo:  { weight: 800, label: 'Repeat' },
    editRecurrenceButton: { weight: 900 }
};
```

### 3.3 Custom Fields Toevoegen

```typescript
const calendar = new Calendar({
    features: {
        eventEdit: {
            items: {
                // Bestaand veld aanpassen
                nameField: {
                    label: 'Event Titel',
                    required: true
                },

                // Veld verbergen
                resourceField: null,

                // Custom veld toevoegen
                locationField: {
                    type: 'textfield',
                    name: 'location',
                    label: 'Locatie',
                    weight: 250 // Na resourceField
                },

                priorityField: {
                    type: 'combo',
                    name: 'priority',
                    label: 'Prioriteit',
                    weight: 150,
                    items: [
                        { value: 'low', text: 'Laag' },
                        { value: 'medium', text: 'Medium' },
                        { value: 'high', text: 'Hoog' }
                    ]
                },

                notesField: {
                    type: 'textarea',
                    name: 'notes',
                    label: 'Notities',
                    weight: 1000,
                    height: 100
                }
            }
        }
    }
});
```

### 3.4 Events

```typescript
// Before editor opens
calendar.on('beforeEventEdit', ({ eventRecord, eventElement }) => {
    // Return false to prevent opening
    if (eventRecord.readonly) {
        Toast.show('Dit event kan niet bewerkt worden');
        return false;
    }
});

// After editor opens
calendar.on('eventEditShow', ({ eventRecord, editor }) => {
    // Customize editor runtime
    if (eventRecord.type === 'meeting') {
        editor.widgetMap.locationField.required = true;
    }
});

// Before save
calendar.on('beforeEventSave', ({ eventRecord, values }) => {
    // Validate
    if (!values.location && values.type === 'meeting') {
        Toast.show('Locatie is verplicht voor meetings');
        return false;
    }
});

// After save
calendar.on('afterEventSave', ({ eventRecord }) => {
    console.log('Event saved:', eventRecord.name);
});

// Editor closed
calendar.on('eventEditHide', ({ eventRecord, editor }) => {
    console.log('Editor closed');
});
```

### 3.5 Programmatic Edit

```typescript
// Open editor voor specifiek event
calendar.features.eventEdit.editEvent(eventRecord);

// Met custom element als anchor
calendar.features.eventEdit.editEvent(eventRecord, null, targetElement);

// Via calendar shortcut
calendar.editEvent(eventRecord);
```

---

## 4. EventMenu

**Status:** Enabled by default

Context menu dat verschijnt bij rechts-klikken op een event.

### 4.1 Configuratie

```typescript
interface EventMenuConfig {
    // Process items before showing
    processItems: (params: ProcessItemsParams) => void;

    // Extra menu items
    items: {
        [itemName: string]: MenuItemConfig | null;
    };

    // Trigger event
    triggerEvent: 'contextmenu' | 'click';
}
```

### 4.2 Default Menu Items

```typescript
// Items toegevoegd door andere features
const defaultItems = {
    // Van EventEdit feature
    editEvent: { text: 'Edit', icon: 'b-icon-edit', weight: 100 },

    // Van EventCopyPaste feature
    copyEvent: { text: 'Copy', icon: 'b-icon-copy', weight: 200 },
    cutEvent: { text: 'Cut', icon: 'b-icon-cut', weight: 210 },
    pasteEvent: { text: 'Paste', icon: 'b-icon-paste', weight: 220 },

    // Van CalendarDrag feature
    deleteEvent: { text: 'Delete', icon: 'b-icon-trash', weight: 300 }
};
```

### 4.3 Custom Menu Items

```typescript
const calendar = new Calendar({
    features: {
        eventMenu: {
            items: {
                // Bestaand item aanpassen
                editEvent: {
                    text: 'Bewerken',
                    icon: 'b-fa-pencil'
                },

                // Item verwijderen
                cutEvent: null,

                // Custom items toevoegen
                duplicateEvent: {
                    text: 'Dupliceren',
                    icon: 'b-fa-clone',
                    weight: 150,
                    onItem: ({ eventRecord }) => {
                        const clone = eventRecord.copy();
                        clone.startDate = DateHelper.add(
                            eventRecord.startDate, 1, 'day'
                        );
                        calendar.eventStore.add(clone);
                    }
                },

                shareEvent: {
                    text: 'Delen',
                    icon: 'b-fa-share',
                    weight: 400,
                    menu: {
                        items: {
                            email: {
                                text: 'Via Email',
                                onItem: ({ eventRecord }) => {
                                    window.open(`mailto:?subject=${eventRecord.name}`);
                                }
                            },
                            link: {
                                text: 'Link kopiëren',
                                onItem: ({ eventRecord }) => {
                                    navigator.clipboard.writeText(
                                        `${window.location.href}?event=${eventRecord.id}`
                                    );
                                }
                            }
                        }
                    }
                }
            },

            // Dynamic items processing
            processItems({ eventRecord, items }) {
                // Verberg delete voor recurring events
                if (eventRecord.isRecurring) {
                    items.deleteEvent = false;
                }

                // Voeg status-specifieke items toe
                if (eventRecord.status === 'draft') {
                    items.publishEvent = {
                        text: 'Publiceren',
                        icon: 'b-fa-check',
                        weight: 50,
                        onItem: () => {
                            eventRecord.status = 'published';
                        }
                    };
                }
            }
        }
    }
});
```

### 4.4 Events

```typescript
// Before menu shows
calendar.on('eventMenuBeforeShow', ({ eventRecord, items }) => {
    // Modify items dynamically
    if (!eventRecord.isEditable) {
        delete items.editEvent;
        delete items.deleteEvent;
    }
});

// Menu item clicked
calendar.on('eventMenuItem', ({ item, eventRecord }) => {
    console.log(`${item.text} clicked for ${eventRecord.name}`);
});

// Menu shown
calendar.on('eventMenuShow', ({ eventRecord, menu }) => {
    console.log('Menu shown');
});
```

---

## 5. ScheduleMenu

**Status:** Enabled by default

Context menu voor lege tijdslots in de calendar.

### 5.1 Configuratie

```typescript
interface ScheduleMenuConfig {
    items: {
        [itemName: string]: MenuItemConfig | null;
    };

    processItems: (params: ProcessItemsParams) => void;

    triggerEvent: 'contextmenu';
}
```

### 5.2 Default Items

```typescript
const defaultItems = {
    addEvent: {
        text: 'Add event',
        icon: 'b-icon-add',
        weight: 100
    }
};
```

### 5.3 Custom Schedule Menu

```typescript
const calendar = new Calendar({
    features: {
        scheduleMenu: {
            items: {
                addEvent: {
                    text: 'Nieuwe Afspraak'
                },

                addMeeting: {
                    text: 'Nieuwe Vergadering',
                    icon: 'b-fa-users',
                    weight: 110,
                    onItem: ({ date, resourceRecord }) => {
                        const event = calendar.eventStore.add({
                            name: 'Vergadering',
                            startDate: date,
                            duration: 1,
                            durationUnit: 'hour',
                            type: 'meeting',
                            resourceId: resourceRecord?.id
                        })[0];
                        calendar.editEvent(event);
                    }
                },

                blockTime: {
                    text: 'Tijd blokkeren',
                    icon: 'b-fa-ban',
                    weight: 200,
                    onItem: ({ date }) => {
                        calendar.eventStore.add({
                            name: 'Geblokkeerd',
                            startDate: date,
                            duration: 1,
                            durationUnit: 'hour',
                            eventType: 'blocked',
                            cls: 'blocked-time'
                        });
                    }
                }
            },

            processItems({ date, resourceRecord, items }) {
                // Geen items op weekends
                if (date.getDay() === 0 || date.getDay() === 6) {
                    items.addEvent = false;
                    items.addMeeting = false;
                }
            }
        }
    }
});
```

---

## 6. EventTooltip

**Status:** Enabled by default

Tooltip die event details toont bij hover of click.

### 6.1 Configuratie

```typescript
interface EventTooltipConfig {
    // Trigger actie
    showOn: 'click' | 'hover'; // default: 'click'

    // Delay bij hover (ms)
    hoverDelay: number; // default: 100

    // Delay bij click (ms)
    clickDelay: number; // default: 0

    // Hide delay (ms)
    hideDelay: number; // default: 300

    // Alignment
    align: string; // default: 'l-r' (links van event, rechts aligned)

    // Anchor arrow
    anchor: boolean; // default: true

    // Template functie
    template: (data: TooltipData) => string | DomConfig;

    // Expand overlappende events
    revealEventsInCluster: boolean; // default: true

    // Align to click position
    alignToDomEvent: boolean; // default: false

    // Tooltip config
    tooltip: Partial<TooltipConfig>;
}

interface TooltipData {
    eventRecord: EventModel;
    startDate: Date;
    endDate: Date;
    startText: string;
    endText: string;
    startClockHtml: string;
    endClockHtml: string;
}
```

### 6.2 Custom Template

```typescript
const calendar = new Calendar({
    features: {
        eventTooltip: {
            showOn: 'hover',
            hoverDelay: 200,
            align: 'b-t', // Boven het event

            template: (data) => {
                const { eventRecord, startText, endText } = data;

                return `
                    <div class="custom-tooltip">
                        <h3>${StringHelper.encodeHtml(eventRecord.name)}</h3>

                        <div class="tooltip-time">
                            <i class="b-fa b-fa-clock"></i>
                            ${startText} - ${endText}
                        </div>

                        ${eventRecord.location ? `
                            <div class="tooltip-location">
                                <i class="b-fa b-fa-map-marker"></i>
                                ${StringHelper.encodeHtml(eventRecord.location)}
                            </div>
                        ` : ''}

                        ${eventRecord.resource ? `
                            <div class="tooltip-resource">
                                <i class="b-fa b-fa-calendar"></i>
                                ${eventRecord.resource.name}
                            </div>
                        ` : ''}

                        ${eventRecord.description ? `
                            <div class="tooltip-description">
                                ${StringHelper.encodeHtml(eventRecord.description)}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        }
    }
});
```

### 6.3 React JSX Template

```typescript
// React versie met JSX
const calendarConfig = {
    eventTooltipFeature: {
        showOn: 'hover',
        template: (data) => (
            <div className="custom-tooltip">
                <EventTooltipContent data={data} />
            </div>
        )
    }
};

const EventTooltipContent = ({ data }) => {
    const { eventRecord, startText, endText } = data;

    return (
        <>
            <h3>{eventRecord.name}</h3>
            <p>{startText} → {endText}</p>
            {eventRecord.location && (
                <p><i className="fa fa-map-marker" /> {eventRecord.location}</p>
            )}
        </>
    );
};
```

---

## 7. ScheduleTooltip

**Status:** Disabled by default

Toont de tijd bij het hoveren over lege delen van de schedule.

### 7.1 Configuratie

```typescript
interface ScheduleTooltipConfig {
    // Show resource name in tooltip
    showResource: boolean; // default: true

    // Time format
    timeFormat: string; // default: 'LT' (locale time)

    // Hover delay
    hoverDelay: number; // default: 100

    // Custom template
    template: (data: ScheduleTooltipData) => string;
}

interface ScheduleTooltipData {
    date: Date;
    resource: ResourceModel;
    formattedTime: string;
}
```

### 7.2 Voorbeeld

```typescript
const calendar = new Calendar({
    features: {
        scheduleTooltip: {
            showResource: true,

            template: ({ date, resource, formattedTime }) => `
                <div class="schedule-tip">
                    <strong>${formattedTime}</strong>
                    ${resource ? `<br>Resource: ${resource.name}` : ''}
                </div>
            `
        }
    }
});
```

---

## 8. EventCopyPaste

**Status:** Enabled by default

Copy/paste functionaliteit via keyboard (Ctrl+C/V) of context menu.

### 8.1 Configuratie

```typescript
interface EventCopyPasteConfig {
    // Keyboard shortcuts enabled
    keyMap: {
        copy: string;  // default: 'Ctrl+C'
        cut: string;   // default: 'Ctrl+X'
        paste: string; // default: 'Ctrl+V'
    };

    // Naam prefix voor gekopieerde events
    copyNameTemplate: string; // default: '{name} (copy)'
}
```

### 8.2 Events

```typescript
calendar.on('beforeCopy', ({ eventRecords }) => {
    console.log(`Copying ${eventRecords.length} events`);
});

calendar.on('beforePaste', ({ eventRecords, date, resourceRecord }) => {
    // Return false to prevent paste
    if (resourceRecord?.readonly) {
        return false;
    }
});

calendar.on('paste', ({ eventRecords }) => {
    console.log(`Pasted ${eventRecords.length} events`);
});
```

---

## 9. ExternalEventSource

**Status:** Disabled by default

Maakt het mogelijk om events te creëren door te slepen vanuit een externe bron (bijv. een sidebar of Grid).

### 9.1 Configuratie

```typescript
interface ExternalEventSourceConfig {
    // DOM element met draggable items
    dragRootElement: string | HTMLElement;

    // Selector voor draggable items
    dragItemSelector: string;

    // Grid widget als bron
    grid: string | Grid;

    // Store met unscheduled events
    store: Store;

    // Event creator functie
    getEventRecord: (element: HTMLElement) => EventModelConfig;

    // Drag proxy template
    dragProxyTemplate: (data: DragData) => string;
}
```

### 9.2 Drag from DOM Elements

```typescript
const calendar = new Calendar({
    features: {
        externalEventSource: {
            dragRootElement: '#event-templates',
            dragItemSelector: '.event-template',

            getEventRecord: (element) => ({
                name: element.innerText,
                duration: parseInt(element.dataset.duration) || 1,
                durationUnit: 'hour',
                eventColor: element.dataset.color
            })
        }
    }
});
```

```html
<div id="event-templates">
    <div class="event-template" data-duration="1" data-color="blue">
        Meeting (1h)
    </div>
    <div class="event-template" data-duration="2" data-color="green">
        Workshop (2h)
    </div>
    <div class="event-template" data-duration="4" data-color="orange">
        Training (4h)
    </div>
</div>
```

### 9.3 Drag from Grid

```typescript
// Grid met unscheduled events
const unscheduledGrid = new Grid({
    id: 'unscheduled-grid',
    store: {
        modelClass: EventModel,
        data: [
            { id: 'u1', name: 'Task 1', duration: 2 },
            { id: 'u2', name: 'Task 2', duration: 1 }
        ]
    },
    columns: [
        { field: 'name', text: 'Event', flex: 1 }
    ],
    features: {
        stripe: true
    }
});

const calendar = new Calendar({
    features: {
        externalEventSource: {
            grid: 'unscheduled-grid'
        }
    }
});
```

### 9.4 Events

```typescript
calendar.on('beforeExternalDrop', ({ eventRecord, date, resource }) => {
    // Valideer drop
    if (date.getHours() < 8) {
        Toast.show('Kan niet voor 8:00 plannen');
        return false;
    }
});

calendar.on('externalDrop', ({ eventRecord, source }) => {
    console.log(`${eventRecord.name} dropped from ${source}`);

    // Event verwijderd uit source grid (default)
    // Of behouden als removeFromExternalStore: false
});
```

---

## 10. LoadOnDemand

**Status:** Disabled by default

Laadt data dynamisch wanneer de zichtbare datum range verandert.

### 10.1 Configuratie

```typescript
interface LoadOnDemandConfig {
    // Datum format voor requests
    dateFormat: string; // default: 'YYYY-MM-DD'

    // Buffer rondom zichtbare range
    buffer: number | object; // default: { month: 1 }

    // Trigger bij navigatie
    loadOnNavigate: boolean; // default: true

    // Parameters voor load request
    paramNames: {
        startDate: string; // default: 'startDate'
        endDate: string;   // default: 'endDate'
    };
}
```

### 10.2 Voorbeeld Setup

```typescript
const calendar = new Calendar({
    crudManager: {
        transport: {
            load: {
                url: '/api/events'
                // Parameters worden automatisch toegevoegd:
                // ?startDate=2024-01-01&endDate=2024-02-28
            }
        }
    },

    features: {
        loadOnDemand: {
            // 2 maanden buffer
            buffer: { month: 2 },

            dateFormat: 'YYYY-MM-DDTHH:mm:ss'
        }
    }
});
```

### 10.3 Server Response Handling

```typescript
// Server endpoint voorbeeld
app.get('/api/events', (req, res) => {
    const { startDate, endDate } = req.query;

    const events = db.events.find({
        startDate: { $gte: new Date(startDate) },
        endDate: { $lte: new Date(endDate) }
    });

    res.json({
        success: true,
        events: {
            rows: events
        }
    });
});
```

---

## 11. TimeRanges

**Status:** Disabled by default

Markeert specifieke tijdperiodes in de calendar (bijv. lunch pauze, feestdagen).

### 11.1 Configuratie

```typescript
interface TimeRangesConfig {
    // Show header in time axis
    showHeaderElements: boolean; // default: true

    // Show in schedule body
    showBodyElements: boolean; // default: true

    // Enable recurring ranges
    enableRecurrenceRule: boolean; // default: false

    // Store met time ranges
    store: Store | TimeRangeModel[];
}

interface TimeRangeModel {
    id: string | number;
    name: string;
    startDate: Date | string;
    endDate: Date | string;
    cls?: string;
    style?: string;
    recurrenceRule?: string; // RRULE
}
```

### 11.2 Voorbeeld

```typescript
const calendar = new Calendar({
    features: {
        timeRanges: {
            showHeaderElements: true,
            enableRecurrenceRule: true
        }
    },

    project: {
        timeRangesData: [
            {
                id: 'lunch',
                name: 'Lunch',
                startDate: '2024-01-01T12:00',
                endDate: '2024-01-01T13:00',
                recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
                cls: 'lunch-break'
            },
            {
                id: 'holiday',
                name: 'Kerst',
                startDate: '2024-12-25',
                endDate: '2024-12-26',
                cls: 'holiday'
            },
            {
                id: 'maintenance',
                name: 'Onderhoud',
                startDate: '2024-01-15T08:00',
                endDate: '2024-01-15T10:00',
                cls: 'maintenance-window',
                style: 'background: rgba(255,0,0,0.2)'
            }
        ]
    }
});
```

### 11.3 Styling

```css
.b-timerange.lunch-break {
    background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 5px,
        rgba(0,0,0,0.05) 5px,
        rgba(0,0,0,0.05) 10px
    );
}

.b-timerange.holiday {
    background: rgba(255, 215, 0, 0.3);
}

.b-timerange-label {
    font-size: 11px;
    font-weight: 600;
}
```

---

## 12. WeekExpander

**Status:** Disabled by default

Voegt een expand/collapse knop toe aan week rows in MonthView wanneer er overflow is.

### 12.1 Configuratie

```typescript
interface WeekExpanderConfig {
    // Expand icon
    expandIcon: string; // default: 'b-icon-down'

    // Collapse icon
    collapseIcon: string; // default: 'b-icon-up'

    // Expand tool position
    position: 'start' | 'end'; // default: 'end'
}
```

### 12.2 Voorbeeld

```typescript
const calendar = new Calendar({
    mode: 'month',

    modes: {
        month: {
            // Lage row height om overflow te triggeren
            minRowHeight: 60,

            // Max events visible (rest wordt +N more)
            overflowButtonCount: 3
        }
    },

    features: {
        weekExpander: true
    }
});
```

---

## 13. EventBuffer

**Status:** Disabled by default

Toont buffer tijd voor en na events (bijv. reistijd).

### 13.1 Configuratie

```typescript
interface EventBufferConfig {
    // Tooltip voor buffer zones
    tooltipTemplate: (data: BufferData) => string;
}

// Model fields voor buffer
interface EventModelWithBuffer extends EventModel {
    preamble: number | string;    // Buffer voor event (minuten of duration string)
    postamble: number | string;   // Buffer na event
}
```

### 13.2 Voorbeeld

```typescript
const calendar = new Calendar({
    features: {
        eventBuffer: {
            tooltipTemplate: ({ eventRecord, type }) => {
                const time = type === 'preamble'
                    ? eventRecord.preamble
                    : eventRecord.postamble;
                return `${type === 'preamble' ? 'Voorbereiding' : 'Opruimen'}: ${time} min`;
            }
        }
    },

    project: {
        eventsData: [
            {
                id: 1,
                name: 'Meeting bij klant',
                startDate: '2024-01-15T10:00',
                endDate: '2024-01-15T11:00',
                preamble: 30,    // 30 min reistijd ervoor
                postamble: 30   // 30 min reistijd erna
            },
            {
                id: 2,
                name: 'Vergadering',
                startDate: '2024-01-15T14:00',
                endDate: '2024-01-15T15:00',
                preamble: '15 minutes',
                postamble: '10 minutes'
            }
        ]
    }
});
```

### 13.3 Styling

```css
/* Buffer zones styling */
.b-cal-event-buffer-before {
    background: repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 3px,
        rgba(0, 150, 136, 0.2) 3px,
        rgba(0, 150, 136, 0.2) 6px
    );
}

.b-cal-event-buffer-after {
    background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 3px,
        rgba(255, 152, 0, 0.2) 3px,
        rgba(255, 152, 0, 0.2) 6px
    );
}
```

---

## 14. Print

**Status:** Disabled by default

Print de huidige calendar view.

### 14.1 Configuratie

```typescript
interface PrintConfig {
    // Show print dialog
    showDialog: boolean; // default: true

    // Print options
    options: {
        exporterType: 'singlepage' | 'multipage';
        paperFormat: 'A4' | 'A3' | 'Letter' | 'Legal';
        orientation: 'portrait' | 'landscape';
    };
}
```

### 14.2 Programmatic Print

```typescript
const calendar = new Calendar({
    features: {
        print: true
    }
});

// Trigger print
calendar.features.print.print({
    orientation: 'landscape',
    paperFormat: 'A4'
});
```

---

## 15. ExcelExporter

**Status:** Disabled by default (Experimental)

Exporteert calendar data naar Excel formaat.

### 15.1 Configuratie

```typescript
interface ExcelExporterConfig {
    // Filename
    filename: string; // default: 'Calendar Export'

    // Include resources
    exportResources: boolean; // default: true

    // Date range
    dateRange: 'visible' | 'all' | { startDate: Date, endDate: Date };
}
```

### 15.2 Voorbeeld

```typescript
const calendar = new Calendar({
    features: {
        excelExporter: {
            filename: 'Mijn Calendar',
            exportResources: true
        }
    }
});

// Trigger export
calendar.features.excelExporter.export({
    filename: 'Calendar-Januari-2024',
    dateRange: {
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31)
    }
});
```

---

## 16. Feature Combinaties

### 16.1 Productiviteits Setup

```typescript
// Volledige productiviteits-georiënteerde configuratie
const calendar = new Calendar({
    features: {
        // Interactie
        drag: {
            increment: 15,
            newEventDuration: 60
        },

        // Editing
        eventEdit: {
            items: {
                locationField: { type: 'textfield', label: 'Locatie', weight: 250 },
                priorityField: { type: 'combo', label: 'Prioriteit', weight: 260 }
            }
        },

        // Tooltips
        eventTooltip: { showOn: 'hover', hoverDelay: 300 },
        scheduleTooltip: true,

        // Data loading
        loadOnDemand: { buffer: { month: 1 } },

        // Time marking
        timeRanges: true,
        eventBuffer: true,

        // Export
        print: true,
        excelExporter: true
    }
});
```

### 16.2 Viewer-Only Setup

```typescript
// Read-only configuratie
const calendar = new Calendar({
    readOnly: true,

    features: {
        drag: false,
        eventEdit: false,
        eventMenu: false,
        scheduleMenu: false,
        eventCopyPaste: false,

        // Alleen viewing features
        eventTooltip: {
            showOn: 'hover',
            template: viewOnlyTooltipTemplate
        }
    }
});
```

---

## 17. Cross-References

### Gerelateerde Documenten

| Document | Beschrijving |
|----------|--------------|
| [CALENDAR-DEEP-DIVE-VIEWS.md](./CALENDAR-DEEP-DIVE-VIEWS.md) | Calendar views configuratie |
| [CALENDAR-DEEP-DIVE-DRAG-DROP.md](./CALENDAR-DEEP-DIVE-DRAG-DROP.md) | Uitgebreide drag-drop analyse |
| [CALENDAR-DEEP-DIVE-EVENT-EDIT.md](./CALENDAR-DEEP-DIVE-EVENT-EDIT.md) | Event editor customization |
| [CALENDAR-DEEP-DIVE-TOOLTIPS.md](./CALENDAR-DEEP-DIVE-TOOLTIPS.md) | Tooltip templates en styling |
| [CALENDAR-DEEP-DIVE-MENUS.md](./CALENDAR-DEEP-DIVE-MENUS.md) | Context menu customization |
| [CALENDAR-IMPL-DRAG-FROM-EXTERNAL.md](./CALENDAR-IMPL-DRAG-FROM-EXTERNAL.md) | External drag sources |

### Demo Referenties

| Feature | Demo |
|---------|------|
| Basic Features | `examples/basic/` |
| Drag Create | `examples/dragcreate/` |
| Event Edit | `examples/eventedit/` |
| Tooltips | `examples/tooltips/` |
| Time Ranges | `examples/timeranges/` |
| Drag from Grid | `examples/dragfromgrid/` |
| Load on Demand | `examples/load-on-demand/` |
| Print | `examples/print/` |
| Excel Export | `examples/exporttoexcel/` |
| Travel Time (Buffer) | `examples/travel-time/` |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
