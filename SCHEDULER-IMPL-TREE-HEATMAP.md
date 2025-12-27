# SchedulerPro Implementation: Tree Summary Heatmap

> **Implementatie guide** voor hiërarchische resource analytics in Bryntum SchedulerPro: tree view met summary aggregatie, heatmap visualisatie, en interactieve filtering.

---

## Overzicht

Tree Summary Heatmap combineert hiërarchische resources met visuele aggregatie:

- **Tree Resources** - Hiërarchische weergave (land > categorie > events)
- **Tree Summary** - Aggregatie van events per parent node
- **Heatmap Rendering** - Kleurintensiteit op basis van event count
- **Tick Cell Interactie** - Click events op summary cellen
- **Category Filtering** - Checkbox filtering op event categorieën
- **Dynamic Row Heights** - Verschillende hoogtes voor parent/child nodes

---

## 1. Data Model

### 1.1 Resource Model met Tree Support

```javascript
import { ResourceModel } from '@bryntum/schedulerpro';

class Resource extends ResourceModel {
    static fields = [
        'flag'  // Voor country flags in parent nodes
    ];

    // Parent nodes zijn read-only
    get readOnly() {
        return this.isParent;
    }

    // Verschillende row heights voor parent/child
    get rowHeight() {
        if (this.isLeaf) {
            return super.rowHeight;
        }
        return 45;  // Compacte height voor groepen
    }
}
```

### 1.2 Event Model

```javascript
import { EventModel } from '@bryntum/schedulerpro';

class Task extends EventModel {
    static fields = [
        'trending'  // Custom field voor badge display
    ];
}
```

---

## 2. Data Structure

### 2.1 Hiërarchische Resources

```json
{
    "resources": {
        "rows": [
            {
                "id": 1,
                "name": "United States",
                "flag": "us",
                "expanded": true,
                "eventColor": "blue",
                "children": [
                    {
                        "id": 10,
                        "name": "Music",
                        "expanded": true,
                        "eventColor": "purple",
                        "children": [
                            { "id": 101, "name": "Coachella" },
                            { "id": 102, "name": "Lollapalooza" }
                        ]
                    },
                    {
                        "id": 11,
                        "name": "Sports",
                        "eventColor": "green",
                        "children": [
                            { "id": 111, "name": "Super Bowl" },
                            { "id": 112, "name": "World Series" }
                        ]
                    }
                ]
            },
            {
                "id": 2,
                "name": "Germany",
                "flag": "de",
                "children": [
                    {
                        "id": 20,
                        "name": "Tech",
                        "eventColor": "orange",
                        "children": [
                            { "id": 201, "name": "CeBIT" }
                        ]
                    }
                ]
            }
        ]
    }
}
```

---

## 3. Tree Summary Feature

### 3.1 Basic Configuration

```javascript
const scheduler = new SchedulerPro({
    features: {
        tree: true,

        treeSummary: {
            // Custom renderer voor summary cellen
            renderer({ startDate, endDate, resourceRecord, timeline }) {
                let totalEvents = 0;

                // Traverse alle child nodes
                resourceRecord.traverse(node => {
                    node.events.forEach(task => {
                        if (DateHelper.intersectSpans(
                            task.startDate, task.endDate,
                            startDate, endDate
                        )) {
                            totalEvents++;
                        }
                    });
                }, true);

                return totalEvents;
            }
        }
    }
});
```

### 3.2 Heatmap Renderer

```javascript
features: {
    treeSummary: {
        renderer({ startDate, endDate, resourceRecord, timeline }) {
            let totalEvents = 0;

            // Tel events in alle child nodes
            resourceRecord.traverse(node => {
                node.events.forEach(task => {
                    if (DateHelper.intersectSpans(
                        task.startDate, task.endDate,
                        startDate, endDate
                    )) {
                        totalEvents++;
                    }
                });
            }, true);

            // Bereken heatmap kleur
            let backgroundColor = '';
            if (totalEvents) {
                const
                    min = 1,
                    max = 30,
                    normalized = (totalEvents - min) / (max - min),
                    alpha = 0.05 + normalized * 0.5;

                backgroundColor = `rgba(30, 144, 255, ${alpha})`;
            }

            // Return DomConfig object
            return {
                class: {
                    'b-summary-value': 1
                },
                style: {
                    backgroundColor
                },
                dataset: {
                    btip: totalEvents
                        ? `${DateHelper.format(startDate, 'MMMM DD')}: ${totalEvents} event${totalEvents > 1 ? 's' : ''}`
                        : undefined
                },
                text: totalEvents
            };
        }
    }
}
```

---

## 4. Tree Column Configuration

### 4.1 Column met Icons en Flags

```javascript
columns: [
    {
        type: 'tree',
        text: 'Name',
        width: 300,
        field: 'name',

        renderer(renderData) {
            const { record, value } = renderData;

            // Leaf nodes: toon gekleurde icon
            if (record.isLeaf) {
                renderData.iconCls = `fa b-${record.parent.eventColor || 'green'} fa-square`;
            }
            // Parent nodes met flag: toon vlag
            else if (record.flag) {
                return [
                    {
                        tag: 'img',
                        alt: record.name,
                        class: 'flag',
                        src: `./resources/${record.flag}.svg`,
                        style: 'vertical-align: middle'
                    },
                    value
                ];
            }

            return value;
        }
    }
]
```

---

## 5. Event Rendering

### 5.1 Custom Event Renderer

```javascript
eventRenderer({ eventRecord }) {
    return [
        {
            tag: 'span',
            class: 'b-event-dates',
            text: DateHelper.format(eventRecord.startDate, 'MMM D') + '-' +
                  DateHelper.format(DateHelper.add(eventRecord.endDate, -1, 'ms'), 'D')
        },
        {
            tag: 'span',
            class: 'b-event-name',
            text: eventRecord.name
        },
        // Optionele trending badge
        eventRecord.trending ? {
            tag: 'span',
            class: 'b-event-badge',
            text: 'TRENDING'
        } : undefined
    ];
}
```

### 5.2 Event CSS

```css
.b-sch-event {
    display: flex;
    flex-direction: column;
    padding: 4px 8px;
}

.b-event-dates {
    font-size: 0.8em;
    opacity: 0.8;
}

.b-event-name {
    font-weight: bold;
}

.b-event-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 0.65em;
    padding: 1px 4px;
    background: gold;
    color: black;
    border-radius: 2px;
    font-weight: bold;
}

/* Summary cell styling */
.b-summary-value {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    cursor: pointer;
}
```

---

## 6. Tick Cell Interaction

### 6.1 Click Handler

```javascript
listeners: {
    tickCellClick({ resourceRecord, startDate, endDate }) {
        let totalEvents = 0;

        // Tel events in hele subtree
        resourceRecord.traverse(node => {
            node.events.forEach(task => {
                if (DateHelper.intersectSpans(
                    task.startDate, task.endDate,
                    startDate, endDate
                )) {
                    totalEvents++;
                }
            });
        }, true);

        Toast.show({
            html: StringHelper.xss`
                <div class="tick-cell-toast">
                    <h3>Tick cell clicked</h3>
                    <div class="toast-grid">
                        <div class="label">Resource:</div>
                        <div class="value">${resourceRecord.name}</div>
                        <div class="label">Date:</div>
                        <div class="value">${DateHelper.format(startDate, 'MMMM D')}</div>
                        <div class="label">Total events:</div>
                        <div class="value">${totalEvents}</div>
                    </div>
                </div>
            `,
            timeout: 3000
        });
    }
}
```

---

## 7. Category Filtering

### 7.1 Toolbar met Checkbox Group

```javascript
tbar: [
    {
        type: 'slidetoggle',
        text: 'Show summaries',
        checked: true,
        onChange({ value }) {
            scheduler.features.treeSummary.disabled = !value;
        }
    },
    {
        type: 'slidetoggle',
        text: 'Compact mode',
        onChange({ value }) {
            scheduler.rowHeight = value ? 44 : 65;
        }
    },
    '->',
    {
        type: 'checkboxgroup',
        label: 'Event categories',
        value: 'Cultural,Music,Sports,Tech',
        inline: true,
        options: {
            Cultural: 'Cultural',
            Music: 'Music',
            Sports: 'Sports',
            Tech: 'Technology'
        },
        onChange: 'up.onCategoriesChange'
    }
]
```

### 7.2 Filter Logic

```javascript
onCategoriesChange({ value }) {
    this.resourceStore.clearFilters(true);

    this.resourceStore.filter(rec => {
        // Filter op parent category
        if (rec.parent.flag || rec.isLeaf) {
            const category = rec.parent.flag ? rec : rec.parent;
            return value.some(val =>
                category.name.toLowerCase().includes(val.toLowerCase())
            );
        }
    });
}
```

---

## 8. View Preset Configuration

### 8.1 Week and Month Headers

```javascript
viewPreset: {
    base: 'weekAndMonth',
    headers: [
        {
            unit: 'month',
            align: 'start',
            dateFormat: 'MMM YYYY'
        },
        {
            unit: 'day',
            dateFormat: 'D'
        }
    ]
}
```

---

## 9. Cell Menu met Color Picker

### 9.1 Event Color Menu

```javascript
features: {
    cellMenu: {
        items: {
            eventColor: {
                text: 'L{SchedulerBase.color}',
                icon: 'b-icon b-icon-palette',
                menu: {
                    type: 'eventcolorpicker'
                }
            }
        }
    }
}
```

---

## 10. Dark Mode Toggle

### 10.1 Theme Switching

```javascript
import { DomHelper, GlobalEvents } from '@bryntum/schedulerpro';

tbar: [
    {
        type: 'slidetoggle',
        text: 'Dark mode',
        ref: 'modeToggle',
        checked: DomHelper.isDarkTheme,
        onChange({ userAction }) {
            userAction && DomHelper.toggleLightDarkTheme();
        }
    }
]

// Sync toggle state when theme changes externally
GlobalEvents.on({
    theme: ({ theme }) => {
        scheduler.widgetMap.modeToggle.checked =
            theme.toLowerCase().includes('dark');
    }
});
```

---

## 11. TypeScript Interfaces

```typescript
import { ResourceModel, EventModel, DateHelper } from '@bryntum/schedulerpro';

interface TreeResourceData {
    id: string | number;
    name: string;
    flag?: string;
    eventColor?: string;
    expanded?: boolean;
    children?: TreeResourceData[];
}

interface TreeResource extends ResourceModel {
    flag?: string;
    isParent: boolean;
    isLeaf: boolean;
    parent: TreeResource;
    children: TreeResource[];
    readOnly: boolean;
    rowHeight: number;
    traverse(fn: (node: TreeResource) => void, includeRoot?: boolean): void;
}

interface TaskData {
    id: string | number;
    name: string;
    startDate: Date | string;
    endDate: Date | string;
    trending?: boolean;
}

interface TreeSummaryRendererContext {
    startDate: Date;
    endDate: Date;
    resourceRecord: TreeResource;
    timeline: SchedulerPro;
}

type TreeSummaryRenderer = (context: TreeSummaryRendererContext) =>
    string | number | DomConfig;

interface TreeSummaryConfig {
    disabled?: boolean;
    renderer?: TreeSummaryRenderer;
}

interface TickCellClickEvent {
    resourceRecord: TreeResource;
    startDate: Date;
    endDate: Date;
}
```

---

## 12. Complete Example

```javascript
import {
    SchedulerPro, EventModel, ResourceModel,
    DateHelper, StringHelper, DomHelper, GlobalEvents, Toast
} from '@bryntum/schedulerpro';

// Models
class Task extends EventModel {
    static fields = ['trending'];
}

class Resource extends ResourceModel {
    static fields = ['flag'];

    get readOnly() {
        return this.isParent;
    }

    get rowHeight() {
        return this.isLeaf ? super.rowHeight : 45;
    }
}

// Scheduler
const scheduler = new SchedulerPro({
    appendTo: 'container',
    eventStyle: 'indented',
    tickSize: 60,
    rowHeight: 65,
    barMargin: 7,
    snap: true,
    startDate: new Date(2025, 2, 1),
    endDate: new Date(2025, 5, 1),
    multiEventSelect: true,

    project: {
        autoLoad: true,
        loadUrl: 'data/data.json',
        eventStore: { modelClass: Task },
        resourceStore: { modelClass: Resource }
    },

    columns: [
        {
            type: 'tree',
            text: 'Name',
            width: 300,
            field: 'name',
            renderer({ record, value }) {
                if (record.isLeaf) {
                    return { iconCls: `fa fa-square b-${record.parent.eventColor}`, text: value };
                }
                if (record.flag) {
                    return [
                        { tag: 'img', class: 'flag', src: `./resources/${record.flag}.svg` },
                        value
                    ];
                }
                return value;
            }
        }
    ],

    viewPreset: {
        base: 'weekAndMonth',
        headers: [
            { unit: 'month', align: 'start', dateFormat: 'MMM YYYY' },
            { unit: 'day', dateFormat: 'D' }
        ]
    },

    features: {
        tree: true,
        sort: 'name',
        nonWorkingTime: true,
        eventDragSelect: true,

        treeSummary: {
            renderer({ startDate, endDate, resourceRecord }) {
                let total = 0;

                resourceRecord.traverse(node => {
                    node.events.forEach(task => {
                        if (DateHelper.intersectSpans(
                            task.startDate, task.endDate,
                            startDate, endDate
                        )) {
                            total++;
                        }
                    });
                }, true);

                if (!total) return '';

                const
                    normalized = Math.min(total / 30, 1),
                    alpha = 0.1 + normalized * 0.5;

                return {
                    class: 'b-summary-value',
                    style: { backgroundColor: `rgba(30, 144, 255, ${alpha})` },
                    dataset: {
                        btip: `${DateHelper.format(startDate, 'MMM D')}: ${total} events`
                    },
                    text: total
                };
            }
        }
    },

    eventRenderer({ eventRecord }) {
        return [
            { class: 'b-event-dates', text: DateHelper.format(eventRecord.startDate, 'MMM D') },
            { class: 'b-event-name', text: eventRecord.name },
            eventRecord.trending && { class: 'b-event-badge', text: 'TRENDING' }
        ];
    },

    listeners: {
        tickCellClick({ resourceRecord, startDate }) {
            let total = 0;
            resourceRecord.traverse(n => { total += n.events.length; }, true);

            Toast.show({
                html: `${resourceRecord.name}: ${total} events on ${DateHelper.format(startDate, 'MMM D')}`,
                timeout: 3000
            });
        }
    },

    tbar: [
        {
            type: 'slidetoggle',
            text: 'Show summaries',
            checked: true,
            onChange({ value }) {
                scheduler.features.treeSummary.disabled = !value;
            }
        },
        '->',
        {
            type: 'checkboxgroup',
            label: 'Categories',
            inline: true,
            value: 'Music,Sports',
            options: { Music: 'Music', Sports: 'Sports', Tech: 'Tech' },
            onChange({ value }) {
                scheduler.resourceStore.clearFilters();
                scheduler.resourceStore.filter(r =>
                    r.isLeaf && value.some(v =>
                        r.parent?.name?.includes(v)
                    )
                );
            }
        }
    ]
});
```

---

## Referenties

- Examples: `schedulerpro-7.1.0-trial/examples/tree-summary-heatmap/`
- Feature: Tree
- Feature: TreeSummary
- Guide: Hierarchical Resources

---

*Document gegenereerd: December 2024*
*Bryntum SchedulerPro versie: 7.1.0*
