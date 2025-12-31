# Calendar Implementation: External Drag Sources

> **Fase 6** - Implementatiegids voor drag & drop vanaf externe bronnen naar de Calendar: Grid, Sidebar widgets en custom DOM elementen.

---

## Overzicht

De Calendar ondersteunt het slepen van events vanuit externe bronnen via de `ExternalEventSource` feature. Dit maakt het mogelijk om ongeplande taken of templates naar de calendar te slepen.

### Drag Source Types

| Type | Bron | Use Case |
|------|------|----------|
| **Grid** | Externe Grid widget | Ongeplande taken lijst |
| **Sidebar Grid** | Grid in sidebar | Compacte task list |
| **Custom Elements** | DOM elementen | Event templates |
| **Other Calendar** | Andere Calendar instance | Cross-calendar scheduling |

---

## 1. ExternalEventSource Feature

### TypeScript Interface

```typescript
// Bron: calendar.d.ts line 9507
interface ExternalEventSourceConfig {
    type?: 'externalEventSource';

    // Grid als bron (Grid ID of instance)
    grid?: string | Grid;

    // Accept drops terug op de bron
    droppable?: boolean;

    // Custom drag element selector (niet-grid mode)
    dragItemSelector?: string;

    // Root element voor custom drag (niet-grid mode)
    dragRootElement?: HTMLElement | string;

    // Verwijder van externe store bij drop op calendar
    removeFromExternalStore?: boolean;  // default: true
}
```

### Feature Registratie

```javascript
const calendar = new Calendar({
    features: {
        externalEventSource: {
            grid: 'unscheduled',
            droppable: true
        }
    }
});
```

---

## 2. Drag from External Grid

### Grid als Drag Source

```javascript
// Bron: examples/dragfromgrid/app.module.js
import { Calendar, Splitter, Grid, StringHelper, GridRowModel, Duration } from '@bryntum/calendar';

const calendar = new Calendar({
    date: new Date(2020, 9, 12),
    flex: 1,

    crudManager: {
        loadUrl: 'data/data.json',
        autoLoad: true,

        // Extra store voor ongeplande events
        stores: {
            id: 'unplanned',
            modelClass: class extends GridRowModel {
                get fullDuration() {
                    return new Duration({
                        unit: this.durationUnit,
                        magnitude: this.duration
                    });
                }
            }
        }
    },

    features: {
        externalEventSource: {
            grid: 'unscheduled',
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

// Splitter tussen calendar en grid
new Splitter({
    appendTo: 'calendar-container',
    showButtons: 'end'
});

// Externe grid met ongeplande events
const unscheduledGrid = new Grid({
    id: 'unscheduled',
    appendTo: 'calendar-container',
    title: 'Unscheduled Events',
    collapsible: true,
    flex: '0 0 320px',
    ui: 'calendar-banner',

    // Deel project met calendar
    project: calendar.project,

    // Gebruik store uit CrudManager
    store: calendar.crudManager.getStore('unplanned'),

    features: {
        stripe: true,
        sort: 'name',
        cellEdit: false,
        group: false
    },

    columns: [{
        text: 'Unassigned tasks',
        flex: 1,
        field: 'name',
        htmlEncode: false,
        renderer: (data) => StringHelper.xss`
            <i class="${data.record.iconCls}"></i>
            ${data.record.name}
        `
    }, {
        text: 'Duration',
        type: 'duration',
        field: 'fullDuration',
        width: 100,
        align: 'right',
        editor: false
    }],

    rowHeight: 50
});
```

### Grid Data Format

```json
{
    "success": true,
    "events": { "rows": [...] },
    "resources": { "rows": [...] },
    "unplanned": {
        "rows": [
            {
                "id": "u1",
                "name": "New feature development",
                "duration": 4,
                "durationUnit": "hour",
                "iconCls": "fa fa-code"
            },
            {
                "id": "u2",
                "name": "Bug fixing session",
                "duration": 2,
                "durationUnit": "hour",
                "iconCls": "fa fa-bug"
            }
        ]
    }
}
```

---

## 3. Drag from Sidebar Grid

### Sidebar Grid Configuratie

```javascript
// Bron: examples/dragfromsidebar/app.module.js
const calendar = new Calendar({
    date: new Date(2025, 4, 12),

    crudManager: {
        loadUrl: 'data/data.json',
        autoLoad: true,
        stores: {
            id: 'unplanned',
            modelClass: class extends GridRowModel {
                get fullDuration() {
                    return new Duration({
                        unit: this.durationUnit,
                        magnitude: this.duration
                    });
                }
            }
        }
    },

    features: {
        externalEventSource: {
            grid: 'unscheduled',
            droppable: true
        }
    },

    sidebar: {
        flex: '0 0 300px',

        items: {
            // Grid embedded in sidebar
            externalEvents: {
                type: 'grid',
                id: 'unscheduled',
                flex: '1 1 0',
                weight: 250,

                // Store naam uit CrudManager
                store: 'unplanned',

                features: {
                    stripe: true,
                    sort: 'name',
                    cellEdit: false,
                    group: false
                },

                columns: [{
                    text: 'Unassigned tasks',
                    flex: 1,
                    field: 'name',
                    htmlEncode: false,
                    renderer: (data) => StringHelper.xss`
                        <i class="${data.record.iconCls}"></i>
                        ${data.record.name}
                    `
                }, {
                    text: 'Duration',
                    type: 'duration',
                    width: 80,
                    align: 'right',
                    editor: false,
                    abbreviatedUnit: true
                }],

                rowHeight: 50
            },

            // ResourceFilter onder grid
            resourceFilter: {
                flex: '0 1 auto'
            }
        }
    },

    listeners: {
        beforeDropExternal({ eventRecord, dropOnCalendar }) {
            if (!dropOnCalendar) {
                calendar.eventStore.remove(eventRecord);
            }
        }
    }
});
```

---

## 4. Custom Drag Elements

### Drag van Custom DOM Elementen

```javascript
const calendar = new Calendar({
    sidebar: {
        items: {
            // Container met draggable templates
            eventTemplates: {
                type: 'container',
                title: 'Event Templates',
                weight: 200,

                html: `
                    <div class="draggable-event" data-event-name="Meeting" data-duration="60">
                        <i class="fa fa-users"></i> Meeting
                    </div>
                    <div class="draggable-event" data-event-name="Call" data-duration="30">
                        <i class="fa fa-phone"></i> Call
                    </div>
                    <div class="draggable-event" data-event-name="Review" data-duration="90">
                        <i class="fa fa-check"></i> Review
                    </div>
                `
            }
        }
    },

    features: {
        externalEventSource: {
            // Selector voor draggable elements
            dragItemSelector: '.draggable-event',

            // Root element (sidebar)
            dragRootElement: null,  // Auto-detect

            // Event record factory
            getRecordFromElement(element) {
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

### CSS voor Draggable Elements

```css
.draggable-event {
    padding: 10px 15px;
    margin: 5px;
    background: #f5f5f5;
    border-radius: 4px;
    cursor: grab;
    display: flex;
    align-items: center;
    gap: 8px;
}

.draggable-event:hover {
    background: #e8e8e8;
}

.draggable-event i {
    width: 20px;
    text-align: center;
}

/* During drag */
.b-dragging .draggable-event {
    opacity: 0.5;
}

/* Drag proxy */
.b-cal-drag-proxy {
    opacity: 0.9;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
```

---

## 5. Drag Events

### beforeDropExternal Event

```typescript
interface BeforeDropExternalEvent {
    eventRecord: EventModel;
    dropOnCalendar: boolean;
    targetDate?: Date;
    targetResource?: ResourceModel;
    source: Calendar;
}
```

```javascript
calendar.on({
    beforeDropExternal({ eventRecord, dropOnCalendar, targetDate }) {
        if (!dropOnCalendar) {
            // Event gedropped buiten calendar
            console.log('Dropped outside:', eventRecord.name);

            // Optioneel: verplaats terug naar externe store
            calendar.eventStore.remove(eventRecord);
            unscheduledGrid.store.add(eventRecord.data);

            return;
        }

        // Validatie voor drop op calendar
        if (targetDate < new Date()) {
            Toast.show('Cannot schedule in the past');
            return false;  // Voorkom drop
        }

        console.log('Scheduled:', eventRecord.name, 'at', targetDate);
    }
});
```

### afterDropExternal Event

```javascript
calendar.on({
    afterDropExternal({ eventRecord, valid, context }) {
        if (valid) {
            Toast.show(`Scheduled: ${eventRecord.name}`);

            // Optioneel: update UI
            updateScheduledCount();
        }
    }
});
```

---

## 6. Bi-directional Drag

### Van Calendar terug naar Grid

```javascript
const calendar = new Calendar({
    features: {
        externalEventSource: {
            grid: 'unscheduled',
            droppable: true,

            // Behoud in externe store bij drop terug
            removeFromExternalStore: false
        },

        calendarDrag: {
            // Verwijder niet automatisch bij drop buiten calendar
            removeFromExternalStore: false
        }
    },

    listeners: {
        beforeDropExternal({ eventRecord, dropOnCalendar }) {
            if (!dropOnCalendar) {
                // Handmatig verwijderen van calendar
                this.eventStore.remove(eventRecord);

                // Voeg toe aan externe grid
                unscheduledGrid.store.add({
                    ...eventRecord.data,
                    startDate: null,
                    endDate: null
                });
            }
        }
    }
});
```

### Drop Zone Styling

```css
/* Grid als drop zone */
.b-grid.b-drop-valid {
    outline: 2px dashed #4caf50;
    background: rgba(76, 175, 80, 0.1);
}

/* Grid rij hover tijdens drag */
.b-grid-row.b-drop-target {
    background: rgba(76, 175, 80, 0.2);
}
```

---

## 7. Duration Model

### Custom Model met Duration

```javascript
import { GridRowModel, Duration } from '@bryntum/calendar';

class UnscheduledTask extends GridRowModel {
    static fields = [
        { name: 'duration', type: 'number' },
        { name: 'durationUnit', defaultValue: 'hour' },
        { name: 'iconCls' },
        { name: 'priority' }
    ];

    // Computed property voor duration column
    get fullDuration() {
        return new Duration({
            unit: this.durationUnit,
            magnitude: this.duration
        });
    }

    // Bij drop op calendar: converteer naar EventModel format
    toEventData(startDate) {
        return {
            name: this.name,
            startDate,
            endDate: DateHelper.add(startDate, this.duration, this.durationUnit),
            iconCls: this.iconCls
        };
    }
}
```

---

## 8. Resource Assignment tijdens Drop

### Auto-assign Resource

```javascript
modes: {
    dayresource: {
        minResourceWidth: '10em',
        range: '1d'
    }
},

listeners: {
    beforeDropExternal({ eventRecord, context }) {
        // context bevat resource info bij ResourceView
        if (context.resourceRecord) {
            eventRecord.resourceId = context.resourceRecord.id;
        }
    }
}
```

### Drop Validatie per Resource

```javascript
features: {
    externalEventSource: {
        grid: 'unscheduled',
        droppable: true,

        validatorFn({ eventRecord, resourceRecord, startDate }) {
            // Check resource capacity
            if (resourceRecord) {
                const existingEvents = calendar.eventStore.getEventsForResource(
                    resourceRecord,
                    startDate,
                    DateHelper.add(startDate, eventRecord.duration, 'hour')
                );

                if (existingEvents.length >= 3) {
                    return 'Resource is overbooked';
                }
            }

            return true;
        }
    }
}
```

---

## 9. Drag Proxy Customization

### Custom Drag Proxy Renderer

```javascript
features: {
    externalEventSource: {
        grid: 'unscheduled',

        // Custom proxy content
        proxyRenderer({ eventRecord }) {
            return {
                tag: 'div',
                className: 'custom-drag-proxy',
                children: [
                    {
                        tag: 'i',
                        className: eventRecord.iconCls
                    },
                    {
                        tag: 'span',
                        text: eventRecord.name
                    },
                    {
                        tag: 'span',
                        className: 'duration',
                        text: `${eventRecord.duration}h`
                    }
                ]
            };
        }
    }
}
```

### Proxy Styling

```css
.custom-drag-proxy {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    font-weight: 500;
}

.custom-drag-proxy .duration {
    background: rgba(255,255,255,0.2);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.85em;
}
```

---

## 10. Integration met STM (Undo/Redo)

### Automatic Transaction Recording

```javascript
const calendar = new Calendar({
    project: {
        stm: {
            autoRecord: true
        }
    },

    features: {
        externalEventSource: {
            grid: 'unscheduled'
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

// Drop van externe bron wordt automatisch recorded
// Undo zet event terug naar externe store
```

---

## 11. Performance Optimalisaties

### Lazy Store Loading

```javascript
const calendar = new Calendar({
    crudManager: {
        loadUrl: 'data/data.json',
        autoLoad: true,

        stores: {
            id: 'unplanned',
            // Lazy loading voor grote datasets
            pageSize: 50,
            remoteFilter: true,
            remoteSort: true
        }
    }
});
```

### Virtual Scrolling in Grid

```javascript
const unscheduledGrid = new Grid({
    id: 'unscheduled',
    store: calendar.crudManager.getStore('unplanned'),

    // Enable virtual rendering
    rowHeight: 50,
    features: {
        stripe: true
    }
});
```

---

## 12. Error Handling

### Drop Validation Errors

```javascript
features: {
    externalEventSource: {
        grid: 'unscheduled',

        validatorFn({ eventRecord, startDate, endDate }) {
            // Business rules
            const errors = [];

            if (startDate < new Date()) {
                errors.push('Cannot schedule in the past');
            }

            if (DateHelper.as('hour', endDate - startDate) > 8) {
                errors.push('Maximum 8 hours per event');
            }

            if (errors.length) {
                return errors.join(', ');
            }

            return true;
        }
    }
},

listeners: {
    beforeDropExternal({ valid, context }) {
        if (!valid && context.message) {
            Toast.show({
                html: context.message,
                color: 'b-red'
            });
        }
    }
}
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| ExternalEventSource | 9654 |
| ExternalEventSourceConfig | 9507 |
| Grid | Core module |
| GridRowModel | Core module |
| Duration | Core module |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `dragfromgrid/` | Externe Grid als drag source |
| `dragfromsidebar/` | Sidebar Grid als drag source |
| `drag-between-calendars/` | Cross-calendar drag |
| `undoredo/` | Undo/redo met external drag |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
