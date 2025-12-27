# SchedulerPro Deep Dive: Nested Resources (Tree)

> **Complete gids voor hierarchische resources, tree structures, grouping en lazy loading**

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Tree Feature Setup](#tree-feature-setup)
3. [Data Schema](#data-schema)
4. [TreeColumn Configuratie](#treecolumn-configuratie)
5. [TreeGroup Feature](#treegroup-feature)
6. [TreeSummary Feature](#treesummary-feature)
7. [Lazy Loading](#lazy-loading)
8. [Custom ResourceModel](#custom-resourcemodel)
9. [Aggregate Columns](#aggregate-columns)
10. [Tree Node API](#tree-node-api)
11. [Event Rendering in Trees](#event-rendering-in-trees)
12. [Performance Optimalisatie](#performance-optimalisatie)
13. [Best Practices](#best-practices)

---

## Overzicht

Nested Resources in SchedulerPro maken hierarchische resource structuren mogelijk. Dit is ideaal voor:
- Organisatiestructuren (afdelingen → teams → medewerkers)
- Geografische hiërarchieën (landen → regio's → steden)
- Faciliteiten (gebouwen → verdiepingen → ruimtes)
- Asset categorieën (types → subtypes → assets)

### Architectuur

```
┌─────────────────────────────────────────────────────────────────┐
│                    NESTED RESOURCES (TREE)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ResourceStore (tree: true)                                      │
│  ├─ Engineering (parent)                    ▼ [expandable]       │
│  │  ├─ Frontend Team (parent)               ▼                    │
│  │  │  ├─ John Developer (leaf)             ████████ Event       │
│  │  │  └─ Jane Designer (leaf)              ██████ Event         │
│  │  └─ Backend Team (parent)                ▼                    │
│  │     └─ Mike Engineer (leaf)              ████████████ Event   │
│  └─ Marketing (parent)                      ▶ [collapsed]        │
│                                                                  │
│  Features:                                                       │
│  • tree        - Basis tree functionaliteit                      │
│  • treeGroup   - Dynamische grouping transformatie               │
│  • treeSummary - Aggregatie per parent node                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tree Feature Setup

### Basic Setup

```typescript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo : 'container',

    features : {
        // Activeer tree functionaliteit
        tree : true,

        // Dependencies niet compatible met sommige tree scenarios
        dependencies : false
    },

    columns : [
        {
            type  : 'tree',      // TreeColumn voor expand/collapse
            text  : 'Name',
            width : 250,
            field : 'name'
        }
    ],

    crudManager : {
        autoLoad      : true,
        loadUrl       : 'data/data.json',
        resourceStore : {
            // ResourceStore moet als tree geconfigureerd zijn
            tree : true
        }
    }
});
```

### Feature Configuratie Opties

```typescript
features : {
    tree : {
        // Expand/collapse animatie
        expandOnCellClick : true,   // Expand bij klik op cel

        // Keyboard navigatie
        toggleOnKeyboardNavigation : true
    },

    // Optionele gerelateerde features
    regionResize : true,            // Resize locked region
    sort         : 'name'           // Sorteer binnen levels
}
```

---

## Data Schema

### Nested Children Format

```json
{
    "resources": {
        "rows": [
            {
                "id": "engineering",
                "name": "Engineering",
                "expanded": true,
                "children": [
                    {
                        "id": "frontend",
                        "name": "Frontend Team",
                        "expanded": true,
                        "children": [
                            { "id": 1, "name": "John Developer" },
                            { "id": 2, "name": "Jane Designer" }
                        ]
                    },
                    {
                        "id": "backend",
                        "name": "Backend Team",
                        "children": [
                            { "id": 3, "name": "Mike Engineer" }
                        ]
                    }
                ]
            },
            {
                "id": "marketing",
                "name": "Marketing",
                "expanded": false,
                "children": [
                    { "id": 4, "name": "Sarah Marketer" }
                ]
            }
        ]
    }
}
```

### Flat Data met parentId (transformFlatData)

```typescript
const scheduler = new SchedulerPro({
    crudManager : {
        resourceStore : {
            tree              : true,
            transformFlatData : true   // Transformeer flat naar tree
        }
    }
});

// Flat data format
const resources = [
    { id: 'eng', name: 'Engineering' },
    { id: 'fe', name: 'Frontend', parentId: 'eng' },
    { id: 1, name: 'John', parentId: 'fe' },
    { id: 2, name: 'Jane', parentId: 'fe' },
    { id: 'be', name: 'Backend', parentId: 'eng' },
    { id: 3, name: 'Mike', parentId: 'be' }
];
```

### Custom Children Field

```typescript
class CustomResource extends ResourceModel {
    static childrenField = 'subResources';  // i.p.v. 'children'
}

// Data met custom field
{
    "id": "dept1",
    "name": "Department 1",
    "subResources": [
        { "id": 1, "name": "Employee 1" }
    ]
}
```

---

## TreeColumn Configuratie

### Basic TreeColumn

```typescript
columns : [
    {
        type  : 'tree',
        text  : 'Resource',
        width : 250,
        field : 'name',

        // Optionele configuratie
        expandedFolderIconCls  : 'fa fa-folder-open',
        collapsedFolderIconCls : 'fa fa-folder',
        leafIconCls            : 'fa fa-user'
    }
]
```

### Custom Renderer

```typescript
columns : [
    {
        type  : 'tree',
        text  : 'Name',
        width : 300,
        field : 'name',

        renderer({ record, value }) {
            const { isLeaf, isParent } = record;

            if (isLeaf) {
                // Leaf node rendering
                return [{
                    tag       : 'i',
                    className : `fa fa-square b-${record.parent.eventColor || 'green'}`
                }, value];
            }
            else if (record.flag) {
                // Parent met custom vlag
                return [{
                    tag   : 'img',
                    class : 'flag',
                    src   : `./flags/${record.flag}.svg`
                }, value];
            }

            return value;
        }
    }
]
```

### Met Aggregate Column

```typescript
columns : [
    {
        type  : 'tree',
        text  : 'Name',
        width : 240,
        field : 'name'
    },
    {
        type  : 'aggregate',     // Aggregeert waarden van children
        text  : 'Capacity',
        width : 110,
        field : 'capacity'       // Toont som van child capacities
    }
]
```

---

## TreeGroup Feature

De TreeGroup feature transformeert een flat of bestaande tree structuur dynamisch op basis van grouper functies.

### Setup

```typescript
const scheduler = new SchedulerPro({
    features : {
        tree      : true,
        treeGroup : {
            // Initiële grouping
            levels : [sizeGrouper]
        }
    }
});
```

### Grouper Functies

```typescript
// Groepeer op capacity ranges
const sizeGrouper = ({ capacity }) =>
    `Capacity ${Math.floor(capacity / 50) * 50} - ${(Math.floor(capacity / 50) + 1) * 50 - 1}`;

// Groepeer op wachttijd categorie
const waitingTimeGrouper = ({ waiting }) =>
    waiting === 0 ? 'None'
        : waiting < 60 ? 'Less than an hour'
        : 'More than an hour';

// Groepeer op boolean veld
const domesticGrouper = ({ domestic }) =>
    domestic ? 'Domestic' : 'International';
```

### Dynamisch Wijzigen van Grouping

```typescript
// Enkele level grouping
await scheduler.group([sizeGrouper]);

// Multi-level grouping
await scheduler.group([domesticGrouper, sizeGrouper]);

// Grouping verwijderen
await scheduler.clearGroups();
```

### Toolbar met Group Buttons

```typescript
tbar : [
    {
        type        : 'buttongroup',
        toggleGroup : true,
        items       : [
            {
                text    : 'By Capacity',
                pressed : true,
                async onToggle({ pressed }) {
                    if (pressed) {
                        await scheduler.group([sizeGrouper]);
                    }
                }
            },
            {
                text : 'By Department',
                async onToggle({ pressed }) {
                    if (pressed) {
                        await scheduler.group([departmentGrouper]);
                    }
                }
            },
            {
                text : 'Multi-level',
                async onToggle({ pressed }) {
                    if (pressed) {
                        await scheduler.group([domesticGrouper, sizeGrouper]);
                    }
                }
            },
            {
                text : 'None',
                async onToggle({ pressed }) {
                    if (pressed) {
                        await scheduler.clearGroups();
                    }
                }
            }
        ]
    }
]
```

---

## TreeSummary Feature

Toont aggregatie/samenvattingen in de tijdlijn voor parent nodes.

### Setup

```typescript
features : {
    tree        : true,
    treeSummary : {
        renderer({ startDate, endDate, resourceRecord, timeline }) {
            let totalEvents = 0;

            // Traverse alle children
            resourceRecord.traverse(node => {
                node.events.forEach(event => {
                    if (DateHelper.intersectSpans(
                        event.startDate, event.endDate,
                        startDate, endDate
                    )) {
                        totalEvents++;
                    }
                });
            }, true);  // true = include self

            // Heatmap styling
            let backgroundColor = '';
            if (totalEvents) {
                const normalized = (totalEvents - 1) / 29;
                const alpha = 0.05 + normalized * 0.5;
                backgroundColor = `rgba(30, 144, 255, ${alpha})`;
            }

            return {
                class : { 'b-summary-value': 1 },
                style : { backgroundColor },
                dataset : {
                    btip : totalEvents
                        ? `${DateHelper.format(startDate, 'MMM D')}: ${totalEvents} events`
                        : undefined
                },
                text : totalEvents
            };
        }
    }
}
```

### Toggle TreeSummary

```typescript
tbar : [
    {
        type    : 'slidetoggle',
        text    : 'Show summaries',
        checked : true,
        onChange({ value }) {
            scheduler.features.treeSummary.disabled = !value;
        }
    }
]
```

---

## Lazy Loading

Voor grote datasets kunnen resources on-demand geladen worden.

### Setup

```typescript
const scheduler = new SchedulerPro({
    features : {
        tree   : true,
        group  : false,    // Grouping niet ondersteund met lazyLoad
        filter : false     // Filtering ook niet ondersteund
    },

    columns : [
        {
            type  : 'tree',
            text  : 'Name',
            field : 'name',
            width : 270
        }
    ],

    resourceStore : {
        tree      : true,
        lazyLoad  : true,

        // CRUD URLs
        readUrl   : './api/resources/read',
        createUrl : './api/resources/create',
        updateUrl : './api/resources/update',
        deleteUrl : './api/resources/delete',

        autoLoad   : true,
        autoCommit : true
    },

    eventStore : {
        lazyLoad  : true,
        readUrl   : './api/events/read',
        createUrl : './api/events/create',
        updateUrl : './api/events/update',
        deleteUrl : './api/events/delete',

        autoCommit : true
    }
});
```

### Load on Demand Data Format

```json
{
    "resources": {
        "rows": [
            {
                "id": "dept1",
                "name": "Engineering",
                "children": true
            }
        ]
    }
}
```

Met `children: true` geeft de node aan dat er children zijn die later geladen moeten worden.

### Backend Request bij Expand

Wanneer een gebruiker een node expandeert:

```
GET /api/resources/read?parentId=dept1
```

Response:
```json
{
    "success": true,
    "data": [
        { "id": 1, "name": "John", "parentId": "dept1" },
        { "id": 2, "name": "Jane", "parentId": "dept1" }
    ]
}
```

---

## Custom ResourceModel

### Extended Fields

```typescript
import { ResourceModel } from '@bryntum/schedulerpro';

class DepartmentResource extends ResourceModel {
    static $name = 'DepartmentResource';

    static fields = [
        { name: 'capacity', type: 'number' },
        { name: 'flag', type: 'string' },
        { name: 'budget', type: 'number' },
        { name: 'department', type: 'string' }
    ];

    // Parent nodes zijn read-only
    get readOnly() {
        return this.isParent;
    }

    // Custom row height per level
    get rowHeight() {
        if (this.isLeaf) {
            return 65;  // Normale hoogte voor leaves
        }
        return 45;      // Kleinere hoogte voor parents
    }

    // Computed property
    get totalCapacity() {
        if (this.isLeaf) {
            return this.capacity || 0;
        }

        let total = 0;
        this.traverse(child => {
            if (child.isLeaf) {
                total += child.capacity || 0;
            }
        });
        return total;
    }
}
```

### Gebruik in Scheduler

```typescript
const scheduler = new SchedulerPro({
    crudManager : {
        resourceStore : {
            modelClass : DepartmentResource,
            tree       : true
        }
    }
});
```

---

## Aggregate Columns

### Built-in AggregateColumn

```typescript
columns : [
    {
        type  : 'tree',
        text  : 'Name',
        width : 240,
        field : 'name'
    },
    {
        type      : 'aggregate',
        text      : 'Total Capacity',
        width     : 120,
        field     : 'capacity',
        // Aggregatie functies: 'sum', 'avg', 'min', 'max', 'count'
        aggregate : 'sum'
    },
    {
        type      : 'aggregate',
        text      : 'Avg Budget',
        width     : 120,
        field     : 'budget',
        aggregate : 'avg',
        renderer  : ({ value }) => `$${value?.toFixed(0) || 0}`
    }
]
```

### Custom Aggregatie in Column Renderer

```typescript
columns : [
    {
        text  : 'Team Stats',
        width : 150,
        renderer({ record }) {
            if (record.isLeaf) {
                return `${record.capacity} seats`;
            }

            // Bereken stats voor parent
            let totalCapacity = 0;
            let memberCount = 0;

            record.traverse(child => {
                if (child.isLeaf) {
                    totalCapacity += child.capacity || 0;
                    memberCount++;
                }
            });

            return `${memberCount} members, ${totalCapacity} total capacity`;
        }
    }
]
```

---

## Tree Node API

### Node Properties

```typescript
// Type checks
record.isLeaf;           // true als geen children
record.isParent;         // true als heeft children
record.isRoot;           // true als rootNode

// Navigatie
record.parent;           // Parent node
record.children;         // Array van child nodes
record.previousSibling;  // Vorige sibling
record.nextSibling;      // Volgende sibling
record.childLevel;       // Diepte niveau (0 = root level)
record.parentIndex;      // Index in parent's children array

// Status
record.isExpanded;       // Expanded state
record.isLoaded;         // Children geladen (lazy load)
```

### Node Methods

```typescript
// Expand/collapse
await record.expand();
await record.collapse();
await record.toggle();

// Child management
const newChild = record.appendChild({ name: 'New Child' });
const inserted = record.insertChild({ name: 'Inserted' }, existingChild);
record.removeChild(childRecord);

// Traversal
record.traverse(node => {
    console.log(node.name);
});

record.traverseWhile(node => {
    // Return false om te stoppen
    return node.capacity < 100;
});

// Ancestors
record.ancestorOf(otherRecord);  // true als ancestor
record.contains(otherRecord);    // true als in subtree
```

### Store-level Operations

```typescript
const store = scheduler.resourceStore;

// Alle nodes doorlopen
store.traverse(node => {
    console.log(node.name);
});

// Query met filter
const highCapacity = store.query(node =>
    node.isLeaf && node.capacity > 50
);

// Expand/collapse all
store.expandAll();
store.collapseAll();

// Specifieke node expanderen
await store.getById('dept1').expand();
```

---

## Event Rendering in Trees

### Conditional Rendering

```typescript
eventRenderer({ eventRecord, resourceRecord, renderData }) {
    const { isLeaf, isParent } = resourceRecord;

    // Custom icon
    renderData.iconCls = 'fa fa-plane';

    // CSS classes toevoegen
    renderData.cls.leaf = isLeaf;
    renderData.cls.group = isParent;

    // Leaf nodes: toon event naam
    if (isLeaf) {
        return StringHelper.encodeHtml(eventRecord.name);
    }

    // Parent nodes: geen tekst (events worden geaggregeerd getoond)
    return '\xa0';  // Non-breaking space
}
```

### Events op Parent Nodes

```typescript
// Events die op een parent resource zitten worden getoond
// over de volledige breedte van de parent row

eventRenderer({ eventRecord, resourceRecord, renderData }) {
    if (resourceRecord.isParent) {
        // Stijl aanpassen voor parent events
        renderData.style = 'opacity: 0.7';
        return `${eventRecord.name} (Team Event)`;
    }

    return eventRecord.name;
}
```

---

## Performance Optimalisatie

### Grote Datasets

```typescript
const scheduler = new SchedulerPro({
    // Virtual rendering
    rowHeight : 45,

    // Beperk initieel geladen data
    crudManager : {
        resourceStore : {
            tree     : true,
            lazyLoad : true,    // On-demand loading
            pageSize : 100      // Paginated loading
        }
    },

    features : {
        tree : true,
        // Disable zware features voor grote datasets
        dependencies : false,
        group        : false
    }
});
```

### Batch Updates

```typescript
// Batch meerdere tree operaties
scheduler.resourceStore.beginBatch();

try {
    const parent = scheduler.resourceStore.getById('dept1');

    // Voeg meerdere children toe
    for (const data of newEmployees) {
        parent.appendChild(data);
    }

    // Verwijder nodes
    for (const id of removedIds) {
        const node = scheduler.resourceStore.getById(id);
        node?.remove();
    }
}
finally {
    scheduler.resourceStore.endBatch();
}
```

### Collapse Deep Trees

```typescript
// Start met ingeklapte nodes voor snellere initiële render
const data = {
    resources : {
        rows : [
            {
                id       : 'root',
                name     : 'Organization',
                expanded : false,  // Start ingeklapt
                children : [
                    // ... deep tree structure
                ]
            }
        ]
    }
};
```

---

## Best Practices

### 1. ReadOnly Parent Nodes

```typescript
class TeamResource extends ResourceModel {
    // Voorkom event drag naar parent nodes
    get readOnly() {
        return this.isParent;
    }
}
```

### 2. Visual Distinction per Level

```css
/* Stijl per tree level */
.b-tree-cell[data-depth="0"] {
    font-weight: bold;
    background: var(--tree-level-0-bg);
}

.b-tree-cell[data-depth="1"] {
    padding-left: 1.5em;
    background: var(--tree-level-1-bg);
}

.b-tree-cell[data-depth="2"] {
    padding-left: 3em;
}

/* Parent vs leaf styling */
.b-grid-row:has(.b-tree-parent-row) {
    background: #f5f5f5;
}
```

### 3. Tick Cell Click Handler

```typescript
listeners : {
    tickCellClick({ resourceRecord, startDate, endDate }) {
        let totalEvents = 0;

        // Tel events in subtree
        resourceRecord.traverse(node => {
            node.events.forEach(event => {
                if (DateHelper.intersectSpans(
                    event.startDate, event.endDate,
                    startDate, endDate
                )) {
                    totalEvents++;
                }
            });
        }, true);

        Toast.show({
            html : `${resourceRecord.name}: ${totalEvents} events on ${DateHelper.format(startDate, 'MMM D')}`
        });
    }
}
```

### 4. Filter Resources

```typescript
// Filter tree resources (behoud parent chain)
scheduler.resourceStore.filter(record => {
    // Filter op leaf nodes
    if (record.isLeaf) {
        return record.department === 'Engineering';
    }

    // Parents moeten zichtbaar zijn als ze matching children hebben
    return true;  // Filter wordt automatisch toegepast op children
});

// Checkbox group filter
onCategoriesChange({ value }) {
    scheduler.resourceStore.clearFilters(true);
    scheduler.resourceStore.filter(record => {
        if (record.parent.flag || record.isLeaf) {
            const category = record.parent.flag ? record : record.parent;
            return value.some(val =>
                category.name.toLowerCase().includes(val.toLowerCase())
            );
        }
    });
}
```

### 5. Responsive Row Heights

```typescript
columns : [
    {
        type  : 'tree',
        text  : 'Resource',
        width : 250,
        renderer({ record, size }) {
            // Pas row height aan per level
            if (record.isParent) {
                size.height = 45;  // Compacte parent rows
            }
            else {
                size.height = 65;  // Normale leaf rows
            }

            return record.name;
        }
    }
]
```

---

## Samenvatting

### Key Features

| Feature | Beschrijving |
|---------|--------------|
| `tree` | Basis tree functionaliteit met expand/collapse |
| `treeGroup` | Dynamische grouping transformatie |
| `treeSummary` | Aggregatie visualisatie voor parents |
| `TreeColumn` | Column type met expand/collapse UI |
| `AggregateColumn` | Automatische value aggregatie |

### Data Formaten

| Format | Configuratie |
|--------|--------------|
| Nested children | `children: [...]` in data |
| Flat met parentId | `transformFlatData: true` op store |
| Lazy load | `children: true` + `lazyLoad: true` |

### Node Properties

| Property | Type | Beschrijving |
|----------|------|--------------|
| `isLeaf` | boolean | Geen children |
| `isParent` | boolean | Heeft children |
| `parent` | Model | Parent node |
| `children` | Model[] | Child nodes |
| `childLevel` | number | Diepte (0 = top) |
| `isExpanded` | boolean | Expand state |

---

## Gerelateerde Documenten

- [SCHEDULER-DEEP-DIVE-RESOURCES.md](./SCHEDULER-DEEP-DIVE-RESOURCES.md) - Basis resource configuratie
- [SCHEDULERPRO-DEEP-DIVE-NESTED-EVENTS.md](./SCHEDULERPRO-DEEP-DIVE-NESTED-EVENTS.md) - Nested events (parent/child events)
- [GRID-IMPL-TREE.md](./GRID-IMPL-TREE.md) - Grid TreeGrid implementatie
- [INTEGRATION-SHARED-PROJECT.md](./INTEGRATION-SHARED-PROJECT.md) - Multi-widget data sharing

---

## Referenties

- Examples: `schedulerpro-7.1.0-trial/examples-scheduler/tree/`
- Examples: `schedulerpro-7.1.0-trial/examples-scheduler/tree-grouping/`
- Examples: `schedulerpro-7.1.0-trial/examples-scheduler/tree-summary/`
- Examples: `schedulerpro-7.1.0-trial/examples-scheduler/infinite-scroll-tree/`
- Examples: `schedulerpro-7.1.0-trial/examples/tree-summary-heatmap/`
- Guide: `docs/data/SchedulerPro/guides/data/treedata.md`
- TypeScript: `schedulerpro.d.ts` - ResourceModel, TreeNode mixin

---

*Bryntum SchedulerPro 7.1.0 - Nested Resources Deep Dive*
*Document gegenereerd: December 2024*
