# SchedulerPro Deep Dive: Nested Events

> **Complete gids voor nested events, parent/child event structuren en subtask management**

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Nested Events Feature](#nested-events-feature)
3. [Event Layouts](#event-layouts)
4. [Drag & Drop Configuratie](#drag--drop-configuratie)
5. [Custom Event Rendering](#custom-event-rendering)
6. [Subtask Editor Tab](#subtask-editor-tab)
7. [Capacity Management](#capacity-management)
8. [Best Practices](#best-practices)

---

## Overzicht

Nested Events in SchedulerPro maken het mogelijk om events in een parent/child structuur te organiseren. Dit is ideaal voor:
- Shiften met meerdere taken
- Projecten met subtaken
- Workstations met capaciteit
- Conferenties met sessies

### Architectuur

```
┌─────────────────────────────────────────────────────────────────┐
│                      NESTED EVENTS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Parent Event (Container)                                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Morning Shift                                              │  │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │  │
│  │ │ Task A      │ │ Task B      │ │ Task C      │           │  │
│  │ │ 08:00-10:00 │ │ 10:00-12:00 │ │ 13:00-15:00 │           │  │
│  │ └─────────────┘ └─────────────┘ └─────────────┘           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Layouts:                                                        │
│  • stack  - Verticaal gestapeld                                  │
│  • pack   - Horizontaal compact                                  │
│  • none   - Overlappend                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Nested Events Feature

### Basic Setup

```typescript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo : 'container',

    project : {
        autoLoad : true,
        loadUrl  : '/api/events',
        // Tree event store voor nested events
        eventStore : {
            tree : true
        }
    },

    startDate  : new Date(2022, 0, 2),
    endDate    : new Date(2022, 0, 9),
    rowHeight  : 165,  // Ruimte voor gestapelde events

    features : {
        nestedEvents : {
            // Activeer nested events
            eventLayout  : 'stack',
            eventHeight  : 35,
            headerHeight : 25,
            barMargin    : 5
        },
        // Dependencies niet compatible met nested events
        dependencies : false
    }
});
```

### Feature Configuratie Opties

```typescript
features : {
    nestedEvents : {
        // Layout mode voor nested events
        eventLayout : 'stack',  // 'stack' | 'pack' | 'none'

        // Hoogte van nested event bars
        eventHeight : 35,

        // Ruimte boven nested events container
        headerHeight : 25,

        // Ruimte tussen nested events
        barMargin : 5,

        // Resource margin (top/bottom padding)
        resourceMargin : 0,

        // Drag constraints
        constrainDragToParent   : false,
        constrainResizeToParent : true,

        // Nesting behavior bij drag & drop
        allowNestingOnDrop   : true,
        allowDeNestingOnDrop : true
    }
}
```

### Data Schema met Nested Events

```json
{
  "events": {
    "rows": [
      {
        "id": 1,
        "name": "Morning Shift",
        "startDate": "2022-01-03T06:00:00",
        "endDate": "2022-01-03T14:00:00",
        "children": [
          {
            "id": 11,
            "name": "Task A",
            "startDate": "2022-01-03T06:00:00",
            "endDate": "2022-01-03T10:00:00"
          },
          {
            "id": 12,
            "name": "Task B",
            "startDate": "2022-01-03T10:00:00",
            "endDate": "2022-01-03T14:00:00"
          }
        ]
      }
    ]
  }
}
```

---

## Event Layouts

### Stack Layout

Events worden verticaal gestapeld:

```typescript
features : {
    nestedEvents : {
        eventLayout : 'stack',
        eventHeight : 35,   // Hoogte per stacked event
        barMargin   : 5     // Ruimte tussen events
    }
}

// Dynamisch wijzigen
scheduler.features.nestedEvents.eventLayout = 'stack';
```

### Pack Layout

Events worden horizontaal compact geplaatst:

```typescript
features : {
    nestedEvents : {
        eventLayout : 'pack'
        // Events worden compact naast elkaar geplaatst
        // waar tijdsruimte beschikbaar is
    }
}
```

### None Layout (Overlap)

Events overlappen vrij:

```typescript
features : {
    nestedEvents : {
        eventLayout : 'none'
        // Events kunnen overlappen
        // Geen automatische layout berekening
    }
}
```

### Layout Toggle Toolbar

```typescript
tbar : {
    items : {
        layout : {
            type     : 'combo',
            editable : false,
            items    : [
                ['none', 'Overlap'],
                ['stack', 'Stack'],
                ['pack', 'Pack']
            ],
            value : 'stack',
            onChange({ value }) {
                scheduler.features.nestedEvents.eventLayout = value;
            }
        }
    }
}
```

---

## Drag & Drop Configuratie

### Constrain Drag to Parent

```typescript
features : {
    nestedEvents : {
        // Nested events kunnen niet buiten parent worden gesleept
        constrainDragToParent : true
    }
}
```

### Nesting on Drop

```typescript
features : {
    nestedEvents : {
        // Sta toe om events in andere events te droppen (nesten)
        allowNestingOnDrop : true,

        // Sta toe om nested events eruit te slepen (de-nesten)
        allowDeNestingOnDrop : true
    }
}
```

### Resize Constraints

```typescript
features : {
    nestedEvents : {
        // Resize mag niet buiten parent grenzen
        constrainResizeToParent : true
    }
}
```

### Toolbar met Drag Settings

```typescript
tbar : {
    items : {
        dragResize : {
            text : 'Drag & resize settings',
            menu : [
                {
                    text    : 'Constrain drag to parent',
                    checked : false,
                    onToggle({ checked }) {
                        scheduler.features.nestedEvents.constrainDragToParent = checked;
                    }
                },
                {
                    text    : 'Nest on drop',
                    checked : true,
                    onToggle({ checked }) {
                        scheduler.features.nestedEvents.allowNestingOnDrop = checked;
                    }
                },
                {
                    text    : 'De-nest on drop',
                    checked : true,
                    onToggle({ checked }) {
                        scheduler.features.nestedEvents.allowDeNestingOnDrop = checked;
                    }
                },
                {
                    text    : 'Constrain resize to parent',
                    cls     : 'b-separator',
                    checked : true,
                    onToggle({ checked }) {
                        scheduler.features.nestedEvents.constrainResizeToParent = checked;
                    }
                }
            ]
        }
    }
}
```

---

## Custom Event Rendering

### Parent vs Child Rendering

```typescript
eventRenderer({ eventRecord, resourceRecord, renderData }) {
    // Parent event
    if (eventRecord.isParent) {
        return [
            {
                tag       : 'i',
                className : 'selection-indicator fa'
            },
            eventRecord.name,
            {
                tag       : 'i',
                className : 'add-event fa fa-plus-circle',
                dataset   : {
                    btip : 'Add job'
                }
            }
        ];
    }
    // Nested event
    else {
        renderData.style = `color: ${eventRecord.color ?? resourceRecord.color}`;

        return [
            {
                tag       : 'i',
                className : 'selection-indicator fa'
            },
            eventRecord.name,
            eventRecord.hazardous ? {
                tag       : 'i',
                className : 'fa fa-biohazard',
                dataset   : { btip : 'Hazardous' }
            } : null
        ];
    }
}
```

### Add Event via Click

```typescript
import { EventHelper } from '@bryntum/schedulerpro';

// Click handler voor add buttons
EventHelper.on({
    element  : scheduler.element,
    delegate : '.add-event',
    click(event) {
        const
            parentEventRecord = scheduler.resolveEventRecord(event),
            currentResource   = scheduler.resolveResourceRecord(event),
            newChild          = parentEventRecord.appendChild({
                name      : 'New job',
                startDate : parentEventRecord.startDate,
                duration  : 1
            });

        newChild.assign(currentResource);
    }
});
```

### Convert to Parent on Create

```typescript
const scheduler = new SchedulerPro({
    // ... config

    // Nieuwe events worden automatisch parent events
    onEventCreated(eventRecord) {
        eventRecord.convertToParent();
    }
});
```

---

## Subtask Editor Tab

### Custom EditorTab voor Subtasks

```typescript
import { EditorTab, EventModel, Toast, DateHelper } from '@bryntum/schedulerpro';

class SubtaskTab extends EditorTab {
    static $name = 'SubtaskTab';
    static type = 'subtasktab';

    static configurable = {
        title            : 'Subtasks',
        cls              : 'b-tab-subtasks',
        autoUpdateRecord : false,
        layoutStyle      : {
            flexFlow : 'column nowrap'
        },
        items : {
            subEvents : {
                type  : 'grid',
                name  : 'subEvents',
                flex  : '1 1 auto',
                width : '100%',
                store : {
                    sorters    : [{ field : 'startDate', ascending : true }],
                    modelClass : EventModel
                },
                columns : [
                    { field : 'name', text : 'Name', flex : 1 },
                    {
                        field  : 'startDate',
                        text   : 'Start date',
                        flex   : 1,
                        type   : 'date',
                        format : 'YYYY-MM-DD hh:mm A',
                        editor : {
                            type      : 'datetimefield',
                            timeField : { stepTriggers : false },
                            dateField : { stepTriggers : false }
                        }
                    },
                    {
                        field  : 'endDate',
                        text   : 'End date',
                        flex   : 1,
                        type   : 'date',
                        format : 'YYYY-MM-DD hh:mm A',
                        editor : {
                            type      : 'datetimefield',
                            timeField : { stepTriggers : false },
                            dateField : { stepTriggers : false }
                        }
                    }
                ]
            },
            toolbar : {
                type : 'toolbar',
                flex : '0 0 auto',
                cls  : 'b-compact-bbar',
                items : {
                    add : {
                        type    : 'button',
                        icon    : 'b-icon b-icon-add',
                        tooltip : 'Add new subtask',
                        color   : 'b-green',
                        onClick : 'up.onAddClick'
                    },
                    remove : {
                        type    : 'button',
                        icon    : 'b-icon b-icon-trash',
                        tooltip : 'Delete selected',
                        color   : 'b-red',
                        onClick : 'up.onDeleteClick'
                    }
                }
            }
        }
    };

    construct(...args) {
        super.construct(...args);
        this.grid = this.widgetMap.subEvents;
        this.grid.store.on({
            change  : 'onStoreChange',
            thisObj : this
        });
    }

    // Vind eerste beschikbare tijdslot
    findEarliestUnallocatedTimeSlot(parentEvent) {
        const
            subEvents = parentEvent.children.slice(),
            { endDate : parentEnd } = parentEvent;

        let { startDate } = parentEvent,
            endDate = DateHelper.add(startDate, 1, 'hour');

        subEvents.sort((r1, r2) => r1.startDate - r2.startDate);

        for (const nestedEvent of subEvents) {
            const nestedStartDate = nestedEvent.startDate,
                  nestedEndDate = nestedEvent.endDate;

            if (nestedStartDate.getTime() === startDate.getTime() ||
                nestedStartDate < startDate && nestedEndDate > startDate) {
                startDate = nestedEndDate;
                endDate = DateHelper.add(startDate, 1, 'hour');
            }
            else if (nestedStartDate < endDate) {
                endDate = nestedStartDate;
            }

            if (startDate >= parentEnd) {
                startDate = endDate = parentEnd;
            }
            else if (endDate >= parentEnd) {
                endDate = parentEnd;
            }
        }

        if (startDate.getTime() === endDate.getTime()) {
            return null;
        }

        return { startDate, endDate };
    }

    onStoreChange({ action, records }) {
        if (action === 'remove') {
            this.record.removeChild(records);
        }
        else if (action === 'add') {
            this.record.appendChild(records);
        }
    }

    onAddClick() {
        const timeSlot = this.findEarliestUnallocatedTimeSlot(this.record);

        if (!timeSlot) {
            Toast.show('No unallocated time slot found');
            return;
        }

        const [added] = this.grid.store.add({
            name : 'New subtask',
            startDate : timeSlot.startDate,
            endDate   : timeSlot.endDate
        });

        added.assign(this.record.resource);
        this.grid.startEditing(added);
    }

    onDeleteClick() {
        const selectedRecord = this.grid.selectedRecord;
        this.grid.features.cellEdit.cancelEditing(true);
        selectedRecord && this.grid.store.remove(selectedRecord);
    }

    set record(record) {
        super.record = record;
        if (record) {
            this.grid.store.loadData(record.children || []);
        }
        else {
            this.grid.features.cellEdit.finishEditing();
        }
    }

    get record() {
        return super.record;
    }
}

SubtaskTab.initClass();
```

### Integratie met TaskEdit

```typescript
features : {
    taskEdit : {
        editorConfig : {
            width : '50em'
        },
        items : {
            subTaskTab : {
                type   : 'subtasktab',
                weight : 110
            }
        }
    }
},

listeners : {
    beforeTaskEditShow({ taskRecord, editor }) {
        // Alleen subtask tab voor parent events
        editor.widgetMap.subTaskTab.disabled = !taskRecord.isParent;
    }
}
```

---

## Capacity Management

### Capacity Check Functie

```typescript
function exceeded(eventRecord, capacity) {
    const hours = eventRecord.duration
        ? DateHelper.as('h', eventRecord.duration, 'd')
        : DateHelper.as('h', eventRecord.endDate - eventRecord.startDate, 'ms');

    for (let i = 0; i < hours; i++) {
        const time = DateHelper.add(eventRecord.startDate, i, 'h');
        let overlaps = 0;

        for (const child of eventRecord.children) {
            if (time >= child.startDate && time < child.endDate) {
                overlaps++;
            }
        }

        if (overlaps > capacity) {
            return true;
        }
    }

    return false;
}
```

### Capacity in Event Renderer

```typescript
eventRenderer({ eventRecord, resourceRecord, renderData }) {
    if (eventRecord.isParent) {
        const exceedsCapacity = exceeded(eventRecord, resourceRecord.capacity);
        renderData.wrapperCls.toggle('exceeded', exceedsCapacity);

        return [
            eventRecord.name,
            {
                tag       : 'i',
                className : exceedsCapacity
                    ? 'warning fa fa-exclamation-circle'
                    : 'add-event fa fa-plus-circle',
                dataset   : {
                    btip : exceedsCapacity ? 'Capacity exceeded' : 'Add job'
                }
            }
        ];
    }
}
```

### Dynamic Row Height based on Capacity

```typescript
columns : [
    {
        text  : 'Station',
        field : 'name',
        width : 225,
        renderer({ record, size }) {
            if (record.capacity) {
                const {
                    barMargin,
                    resourceMargin,
                    eventHeight,
                    headerHeight
                } = scheduler.features.nestedEvents;

                // Bereken hoogte gebaseerd op capacity
                size.height = record.capacity * (eventHeight + barMargin)
                    + 2 * resourceMargin + headerHeight
                    + scheduler.resourceMargin * 2 + 1;
            }

            return [
                { tag : 'i', className : record.iconCls },
                { className : 'name', text : record.name },
                { className : 'capacity', text : `Capacity: ${record.capacity ?? 0}` }
            ];
        }
    }
]
```

---

## Best Practices

### 1. Tree Store Setup

```typescript
project : {
    eventStore : {
        tree   : true,  // Forceer tree store
        fields : ['color', 'hazardous']  // Extra fields
    },
    resourceStore : {
        fields : ['color', 'capacity']
    }
}
```

### 2. Tooltip met Nested Events

```typescript
features : {
    eventTooltip : {
        template : data => `
            ${data.eventRecord.name
                ? `<div class="b-sch-event-title">${StringHelper.encodeHtml(data.eventRecord.name)}</div>`
                : ''}
            ${data.startClockHtml}
            ${data.endClockHtml}
            ${data.eventRecord.children
                ? '</br>' + data.eventRecord.children.slice()
                    .sort((a, b) => a.startDate - b.startDate)
                    .map(r => `
                        <h4 class="b-tooltip-subevent-title">${StringHelper.encodeHtml(r.name)}</h4>
                        ${DateHelper.format(r.startDate, 'LT')} - ${DateHelper.format(r.endDate, 'LT')}
                    `).join('')
                : ''}
        `
    }
}
```

### 3. Feature Coordinatie

```typescript
features : {
    nestedEvents : true,
    // Niet compatible met nested events:
    dependencies : false,
    // Wel compatible:
    percentBar : {
        showPercentage : false
    },
    eventDragSelect : {
        includeNested : true  // Selecteer ook nested events
    },
    stickyEvents : false
}
```

### 4. Bar Settings Sliders

```typescript
tbar : {
    items : {
        barSettings : {
            text : 'Bar settings',
            menu : {
                type  : 'panel',
                items : [
                    {
                        type      : 'slider',
                        label     : 'Resource margin',
                        showValue : 'thumb',
                        value     : 0,
                        min       : 0,
                        max       : 20,
                        onInput({ value }) {
                            scheduler.features.nestedEvents.resourceMargin = value;
                        }
                    },
                    {
                        type      : 'slider',
                        label     : 'Bar margin',
                        value     : 5,
                        min       : 0,
                        max       : 20,
                        onInput({ value }) {
                            scheduler.features.nestedEvents.barMargin = value;
                        }
                    },
                    {
                        type      : 'slider',
                        label     : 'Event height',
                        value     : 35,
                        min       : 20,
                        max       : 50,
                        onInput({ value }) {
                            scheduler.features.nestedEvents.eventHeight = value;
                        }
                    }
                ]
            }
        }
    }
}
```

---

## Samenvatting

### Feature Opties

| Optie | Default | Beschrijving |
|-------|---------|--------------|
| eventLayout | 'stack' | Layout mode: 'stack', 'pack', 'none' |
| eventHeight | 30 | Hoogte nested event bar |
| headerHeight | 20 | Ruimte boven nested events |
| barMargin | 5 | Ruimte tussen bars |
| constrainDragToParent | false | Beperk drag tot parent |
| constrainResizeToParent | true | Beperk resize tot parent |
| allowNestingOnDrop | true | Sta nesting toe bij drop |
| allowDeNestingOnDrop | true | Sta de-nesting toe bij drop |

### Event Methods

```typescript
// Convert leaf naar parent
eventRecord.convertToParent();

// Voeg child toe
const child = parentEvent.appendChild({
    name      : 'New task',
    startDate : parentEvent.startDate,
    duration  : 1
});

// Assign resource
child.assign(resource);

// Verwijder child
parentEvent.removeChild(child);
```

---

## Gerelateerde Documenten

- [GANTT-DEEP-DIVE-WBS.md](./GANTT-DEEP-DIVE-WBS.md) - Vergelijkbare parent/child in Gantt
- [INTEGRATION-GANTT-SCHEDULER.md](./INTEGRATION-GANTT-SCHEDULER.md) - Gantt + Scheduler combinatie
- [INTEGRATION-PERFORMANCE.md](./INTEGRATION-PERFORMANCE.md) - Lazy loading voor nested events
- [SCHEDULERPRO-DEEP-DIVE-RESOURCES.md](./SCHEDULERPRO-DEEP-DIVE-RESOURCES.md) - Resource management

---

*Bryntum SchedulerPro 7.1.0 - Nested Events Deep Dive*
