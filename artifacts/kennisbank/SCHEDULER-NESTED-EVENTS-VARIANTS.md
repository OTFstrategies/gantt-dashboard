# SchedulerPro Implementation: Nested Events Variants

> **Implementatie guide** voor nested events in Bryntum SchedulerPro: parent-child event hiërarchie, layout opties, configuration, deep nesting, dependencies, en lazy loading.

---

## Overzicht

Nested events bieden hiërarchische event structuren met 6 varianten:

| Variant | Omschrijving | Use Case |
|---------|--------------|----------|
| **Basic** | Standaard parent-child relatie | Taken met subtaken |
| **Configuration** | Uitgebreide layout/styling opties | Capacity planning |
| **Deep** | Meerdere nesting niveaus | Project hiërarchie |
| **Dependencies** | Dependencies tussen nested events | Project scheduling |
| **Drag from Grid** | External drag naar parent | Backlog planning |
| **Lazy Load** | On-demand loading | Grote datasets |

---

## 1. Basic Nested Events

### 1.1 Concept

Parent events bevatten child events die binnen de parent timespan vallen:

```
Parent Event (Project)
┌──────────────────────────────────────────────────────┐
│  ┌────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Task 1 │  │   Task 2     │  │     Task 3      │  │
│  └────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 1.2 Basic Configuration

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',
    startDate: new Date(2023, 0, 1),
    endDate: new Date(2023, 0, 31),
    rowHeight: 100,

    project: {
        autoLoad: true,
        loadUrl: './data/data.json',

        // Tree event store activeren
        eventStore: {
            tree: true
        }
    },

    features: {
        nestedEvents: {
            // Voorkom drag buiten parent
            constrainDragToParent: true
        },
        // Dependencies werken niet met nested events
        dependencies: false
    }
});
```

### 1.3 Data Structure

```json
{
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Project Alpha",
                "startDate": "2023-01-01",
                "endDate": "2023-01-15",
                "children": [
                    {
                        "id": 11,
                        "name": "Phase 1",
                        "startDate": "2023-01-01",
                        "endDate": "2023-01-05"
                    },
                    {
                        "id": 12,
                        "name": "Phase 2",
                        "startDate": "2023-01-06",
                        "endDate": "2023-01-10"
                    },
                    {
                        "id": 13,
                        "name": "Phase 3",
                        "startDate": "2023-01-11",
                        "endDate": "2023-01-15"
                    }
                ]
            }
        ]
    }
}
```

---

## 2. Configuration Variant

### 2.1 Layout Options

```javascript
features: {
    nestedEvents: {
        // Layout van nested events
        eventLayout: 'stack',    // 'stack' | 'pack' | 'none'

        // Hoogte van nested events
        eventHeight: 35,         // default: 30

        // Ruimte boven nested events (voor parent header)
        headerHeight: 25,

        // Ruimte tussen nested events
        barMargin: 5,

        // Drag beperkingen
        constrainDragToParent: true,
        allowDeNestingOnDrop: false,
        constrainResizeToParent: false
    }
}
```

### 2.2 Capacity-based Row Height

```javascript
function exceeded(eventRecord, capacity) {
    const hours = DateHelper.as('h', eventRecord.duration, 'd');

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

// Column renderer met dynamische row height
columns: [
    {
        text: 'Station',
        field: 'name',
        width: 225,

        renderer({ record, size }) {
            if (record.capacity) {
                const {
                    barMargin,
                    resourceMargin,
                    eventHeight,
                    headerHeight
                } = scheduler.features.nestedEvents;

                // Bereken row height voor capacity
                size.height = record.capacity * (eventHeight + barMargin) +
                    2 * resourceMargin + headerHeight +
                    scheduler.resourceMargin * 2 + 1;
            }

            return [
                { tag: 'i', className: record.iconCls },
                { className: 'name', text: record.name },
                { className: 'capacity', text: `Capacity: ${record.capacity ?? 0}` }
            ];
        }
    }
]
```

### 2.3 Parent Event Renderer met Add Button

```javascript
eventRenderer({ eventRecord, resourceRecord, renderData }) {
    // Parent event
    if (eventRecord.isParent) {
        renderData.iconCls = null;

        // Check capacity exceeded
        const isExceeded = exceeded(eventRecord, resourceRecord.capacity);
        renderData.wrapperCls['b-capacity-exceeded'] = isExceeded;
        renderData.wrapperCls['b-has-add'] = true;

        return [
            {
                className: 'event-name',
                text: eventRecord.name
            },
            {
                className: 'add-button',
                dataset: { btip: 'Add new task' },
                children: [{ tag: 'i', className: 'b-icon b-icon-add' }]
            }
        ];
    }

    // Nested event
    return [
        { tag: 'i', className: 'fa fa-fw fa-flag' },
        StringHelper.encodeHtml(eventRecord.name)
    ];
}
```

---

## 3. Deep Nesting

### 3.1 Multiple Nesting Levels

```javascript
features: {
    nestedEvents: {
        eventLayout: 'pack',
        eventHeight: 35,
        headerHeight: 25,
        barMargin: 5,

        // Maximum nesting diepte (default: 1)
        maxNesting: 2  // Parent -> Child -> Grandchild
    }
}
```

### 3.2 Level-based Coloring

```javascript
eventRenderer({ eventRecord, renderData }) {
    // Kleur op basis van nesting level
    if (eventRecord.childLevel === 2) {
        renderData.eventColor = 'cyan';       // Grandchild
    }
    else if (eventRecord.childLevel === 1) {
        renderData.eventColor = 'blue';       // Child
    }
    else {
        renderData.eventColor = 'indigo';     // Parent (level 0)
    }

    return StringHelper.encodeHtml(eventRecord.name);
}
```

### 3.3 Deep Nesting Data

```json
{
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Q1 Project",
                "startDate": "2023-01-01",
                "endDate": "2023-03-31",
                "children": [
                    {
                        "id": 10,
                        "name": "January Sprint",
                        "startDate": "2023-01-01",
                        "endDate": "2023-01-31",
                        "children": [
                            {
                                "id": 101,
                                "name": "Week 1 Tasks",
                                "startDate": "2023-01-01",
                                "endDate": "2023-01-07"
                            },
                            {
                                "id": 102,
                                "name": "Week 2 Tasks",
                                "startDate": "2023-01-08",
                                "endDate": "2023-01-14"
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
```

---

## 4. Dependencies between Nested Events

### 4.1 Configuration

```javascript
features: {
    nestedEvents: {
        eventLayout: 'stack',
        headerHeight: 25,
        allowDeNestingOnDrop: false,
        constrainResizeToParent: false
    },

    // Dependencies zijn beschikbaar met nested events
    dependencies: {
        clickWidth: 5,
        radius: 5,
        terminalSize: 16,
        terminalHideDelay: 200,

        // Teken dependencies om parent events heen
        drawAroundParents: true,
        showLagInTooltip: true
    },

    dependencyEdit: true
}
```

### 4.2 Dependencies Data

```json
{
    "dependencies": {
        "rows": [
            {
                "id": 1,
                "fromEvent": 11,
                "toEvent": 12,
                "type": 2
            },
            {
                "id": 2,
                "fromEvent": 12,
                "toEvent": 13,
                "type": 2,
                "lag": 1,
                "lagUnit": "d"
            }
        ]
    }
}
```

---

## 5. Drag from External Grid

### 5.1 External Grid Setup

```javascript
import { Grid, DragHelper } from '@bryntum/schedulerpro';

const unscheduledGrid = new Grid({
    appendTo: 'unscheduled',
    title: 'Unscheduled Tasks',

    columns: [
        { text: 'Task', field: 'name', flex: 1 },
        { text: 'Duration', field: 'duration', width: 80 }
    ],

    store: {
        data: [
            { id: 'u1', name: 'Design Review', duration: 2 },
            { id: 'u2', name: 'Code Review', duration: 4 },
            { id: 'u3', name: 'Testing', duration: 3 }
        ]
    }
});
```

### 5.2 Drag Helper

```javascript
const drag = new DragHelper({
    cloneTarget: true,
    mode: 'translateXY',
    dropTargetSelector: '.b-sch-event-wrap.b-nested-events-parent',
    targetSelector: '.b-grid-row',

    createProxy(element) {
        const proxy = document.createElement('div');
        proxy.classList.add('b-sch-event');
        proxy.textContent = unscheduledGrid.getRecordFromElement(element).name;
        return proxy;
    },

    onDragStart({ context }) {
        context.task = unscheduledGrid.getRecordFromElement(context.grabbed);
        scheduler.enableScrollingCloseToEdges(scheduler.timeAxisSubGrid);
    },

    onDrag({ context }) {
        const parent = context.target &&
            scheduler.resolveEventRecord(context.target);

        context.valid = parent?.isParent || false;
        context.parent = parent;
    },

    async onDrop({ context }) {
        if (context.valid && context.parent) {
            const { task, parent } = context;

            // Voeg als child toe aan parent
            parent.appendChild({
                name: task.name,
                duration: task.duration,
                durationUnit: 'h',
                startDate: parent.startDate
            });

            // Verwijder uit grid
            unscheduledGrid.store.remove(task);
        }

        scheduler.disableScrollingCloseToEdges(scheduler.timeAxisSubGrid);
    }
});
```

---

## 6. Lazy Loading

### 6.1 Store Configuration

```javascript
project: {
    resourceStore: {
        lazyLoad: { chunkSize: 30 },
        autoLoad: true,

        async requestData({ startIndex, count }) {
            const response = await fetch(
                `/api/resources?start=${startIndex}&count=${count}`
            );
            const data = await response.json();

            return {
                data: data.resources,
                total: data.total
            };
        }
    },

    eventStore: {
        tree: true,
        lazyLoad: true,

        async requestData({ startDate, endDate, startIndex, count }) {
            const response = await fetch(
                `/api/events?start=${startIndex}&count=${count}&from=${startDate}&to=${endDate}`
            );
            return { data: await response.json() };
        }
    },

    assignmentStore: {
        lazyLoad: true,

        async requestData({ startDate, endDate, startIndex, count }) {
            const response = await fetch(
                `/api/assignments?start=${startIndex}&count=${count}&from=${startDate}&to=${endDate}`
            );
            return { data: await response.json() };
        }
    }
},

features: {
    nestedEvents: {
        constrainDragToParent: true
    }
}
```

---

## 7. Custom Subtask Tab

### 7.1 EditorTab Extension

```javascript
import { EditorTab, Grid, EventModel } from '@bryntum/schedulerpro';

class SubtaskTab extends EditorTab {
    static $name = 'SubtaskTab';
    static type = 'subtasktab';

    static configurable = {
        title: 'Subtasks',
        cls: 'b-tab-subtasks',
        autoUpdateRecord: false,

        items: {
            subEvents: {
                type: 'grid',
                name: 'subEvents',
                flex: '1 1 auto',

                store: {
                    sorters: [{ field: 'startDate', ascending: true }],
                    modelClass: EventModel
                },

                columns: [
                    { field: 'name', text: 'Name', flex: 1 },
                    {
                        field: 'startDate',
                        text: 'Start',
                        type: 'date',
                        format: 'LLL dd HH:mm'
                    },
                    {
                        field: 'endDate',
                        text: 'End',
                        type: 'date',
                        format: 'LLL dd HH:mm'
                    }
                ]
            },

            buttonBar: {
                type: 'toolbar',
                items: {
                    addButton: {
                        type: 'button',
                        icon: 'b-icon-add',
                        text: 'Add subtask',
                        onClick: 'up.onAddClick'
                    },
                    removeButton: {
                        type: 'button',
                        icon: 'b-icon-trash',
                        text: 'Remove',
                        onClick: 'up.onRemoveClick'
                    }
                }
            }
        }
    };

    loadEvent(eventRecord) {
        super.loadEvent(eventRecord);

        // Laad children in grid
        this.widgetMap.subEvents.store.data = eventRecord.children || [];
    }

    onAddClick() {
        const parent = this.record;

        this.widgetMap.subEvents.store.add({
            name: 'New Subtask',
            startDate: parent.startDate,
            duration: 1,
            durationUnit: 'h'
        });
    }

    onRemoveClick() {
        const grid = this.widgetMap.subEvents;
        grid.store.remove(grid.selectedRecord);
    }

    async save() {
        // Sync grid data naar parent children
        this.record.children = this.widgetMap.subEvents.store.allRecords;
    }
}

SubtaskTab.initClass();
```

### 7.2 Task Editor met Subtask Tab

```javascript
features: {
    taskEdit: {
        editorConfig: {
            width: '50em'
        },
        items: {
            subTaskTab: {
                type: 'subtasktab',
                weight: 110
            }
        }
    }
},

listeners: {
    beforeTaskEditShow({ taskRecord, editor }) {
        // Alleen voor parent events
        editor.widgetMap.subTaskTab.disabled = !taskRecord.isParent;
    }
}
```

---

## 8. Tooltip met Nested Events

```javascript
features: {
    eventTooltip: {
        template: data => {
            const { eventRecord, startClockHtml, endClockHtml } = data;

            const childrenHtml = eventRecord.children
                ? eventRecord.children
                    .slice()
                    .sort((a, b) => a.startDate - b.startDate)
                    .map(child => `
                        <h4 class="b-tooltip-subevent-title">
                            ${StringHelper.encodeHtml(child.name)}
                        </h4>
                        ${DateHelper.format(child.startDate, 'LT')} -
                        ${DateHelper.format(child.endDate, 'LT')}
                    `).join('')
                : '';

            return `
                ${eventRecord.name
                    ? `<div class="b-sch-event-title">${StringHelper.encodeHtml(eventRecord.name)}</div>`
                    : ''
                }
                ${startClockHtml}
                ${endClockHtml}
                ${childrenHtml ? '</br>' + childrenHtml : ''}
            `;
        }
    }
}
```

---

## 9. TypeScript Interfaces

```typescript
import { EventModel, SchedulerPro } from '@bryntum/schedulerpro';

// Nested Event Layout
type NestedEventLayout = 'stack' | 'pack' | 'none';

// Nested Events Feature Config
interface NestedEventsConfig {
    eventLayout?: NestedEventLayout;
    eventHeight?: number;
    headerHeight?: number;
    barMargin?: number;
    maxNesting?: number;
    constrainDragToParent?: boolean;
    allowDeNestingOnDrop?: boolean;
    constrainResizeToParent?: boolean;
}

// Nested Event Model
interface NestedEventData {
    id: string | number;
    name: string;
    startDate: Date | string;
    endDate: Date | string;
    children?: NestedEventData[];
}

interface NestedEvent extends EventModel {
    isParent: boolean;
    isLeaf: boolean;
    children: NestedEvent[];
    parent: NestedEvent | null;
    childLevel: number;  // 0 = top level, 1 = child, 2 = grandchild

    appendChild(child: Partial<NestedEventData>): NestedEvent;
    removeChild(child: NestedEvent): void;
}

// Lazy Load Config
interface LazyLoadStoreConfig {
    lazyLoad: boolean | { chunkSize: number };
    requestData: (params: LazyLoadParams) => Promise<LazyLoadResult>;
}

interface LazyLoadParams {
    startIndex: number;
    count: number;
    startDate?: Date;
    endDate?: Date;
}

interface LazyLoadResult {
    data: any[];
    total?: number;
}
```

---

## 10. Best Practices

### 10.1 Wanneer Welke Variant

| Use Case | Variant |
|----------|---------|
| Simpele subtaken | Basic |
| Capaciteitsplanning | Configuration |
| Project breakdown | Deep |
| Critical path | Dependencies |
| Backlog planning | Drag from Grid |
| Grote datasets | Lazy Load |

### 10.2 Performance Tips

- Beperk `maxNesting` tot 2-3 levels
- Gebruik lazy loading voor grote datasets
- Vermijd te veel nested events per parent
- Overweeg `eventLayout: 'none'` voor veel events

### 10.3 UX Guidelines

- Maak parent duidelijk visueel onderscheidbaar
- Toon add/remove controls in parent events
- Gebruik tooltips voor nested event overzicht
- Voorkom te diepe nesting (>3 levels)

---

## Referenties

- Examples: `schedulerpro-7.1.0-trial/examples/nested-events/`
- Examples: `schedulerpro-7.1.0-trial/examples/nested-events-configuration/`
- Examples: `schedulerpro-7.1.0-trial/examples/nested-events-deep/`
- Examples: `schedulerpro-7.1.0-trial/examples/nested-events-dependencies/`
- Examples: `schedulerpro-7.1.0-trial/examples/nested-events-drag-from-grid/`
- Examples: `schedulerpro-7.1.0-trial/examples/nested-events-lazy-load/`
- Feature: NestedEvents

---

*Document gegenereerd: December 2024*
*Bryntum SchedulerPro versie: 7.1.0*
