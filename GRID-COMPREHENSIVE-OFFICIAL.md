# Bryntum Grid - Complete Official Documentation

> **Bron**: Officiële Bryntum Grid v7.1.0 documentatie - `docs/data/Grid/guides/`

---

## 1. Grid Columns

### Basic Column Configuration

```javascript
const grid = new Grid({
    columns : [
        { text : 'Name', field : 'name', flex : 1 },
        { text : 'City', field : 'city', width : 100 }
    ]
});
```

### Column Properties

| Property | Description |
|----------|-------------|
| `text` | Text displayed in column header |
| `field` | Data field for cell contents |
| `flex` | Proportional width (remaining space shared between flex columns) |
| `width` | Fixed width in pixels |
| `type` | Column type (affects formatting and editing) |

### Column Types

```javascript
const grid = new Grid({
    columns : [
        { type : 'rownumber' },
        { type : 'check', text : 'Done', field : 'done', flex : 1 },
        { type : 'date', text : 'Start', field : 'start', flex : 1 },
        { type : 'number', text : 'Rank', field : 'rank', flex : 1 },
        { type : 'percent', text : 'Progress', field : 'percent', flex : 1 },
        { type : 'rating', text : 'Rating', field : 'rating', flex : 1 },
        {
            type     : 'template',
            text     : 'Location',
            field    : 'city',
            flex     : 1,
            template : ({ value }) => `Lives in ${value}`
        },
        {
            type    : 'widget',
            text    : 'Action',
            field   : 'color',
            flex    : 1,
            widgets : [{ type : 'button', text : 'Click' }]
        }
    ]
});
```

### Column Settings

| Setting | Description |
|---------|-------------|
| `renderer` | Function to affect styling and cell contents |
| `afterRenderCell` | Function called after cell rendering |
| `editor` | Type of editor for cell editing |
| `align` | Text alignment: left, center, right |
| `hidden` | Initially hide column |
| `locked` | Lock/freeze column |
| `htmlEncode` | Set false to render HTML in cells |
| `cls` | CSS class for column header |
| `cellCls` | CSS class for each cell |

### Column Renderers

```javascript
const grid = new Grid({
    columns : [
        {
            field : 'name',
            text  : 'Name',
            flex  : 1,
            renderer({ cellElement, record, row }) {
                row.assignCls({
                    private    : record.access === 'private',
                    deprecated : record.deprecated
                });
                cellElement.style.backgroundColor = record.color;
                cellElement.style.color = '#fff';
                return record.name;
            }
        },
        {
            field      : 'color',
            text       : 'Color',
            flex       : 1,
            htmlEncode : false,
            renderer({ value }) {
                return `
                    <div style="
                        width: 1em;
                        height: 1em;
                        border-radius: 3px;
                        background-color: ${value};
                        margin-right: .5em"></div>
                    ${value}
                `;
            }
        }
    ]
});
```

### Renderer Parameters

| Parameter | Description |
|-----------|-------------|
| `cellElement` | Direct access to cell DOM element |
| `value` | Default display value |
| `record` | Data record for current row |
| `size` | Object to control row height |
| `grid` | Grid instance |
| `column` | Column instance |
| `row` | Row instance |

### AfterRenderCell for Styling

```javascript
{
    text  : 'Date',
    type  : 'date',
    field : 'date',
    width : 100,
    afterRenderCell({ row, record, cellElement, value }) {
        cellElement.classList.toggle('past', value < Date.now());
    }
}
```

### Manipulating Columns

```javascript
// Access ColumnStore
grid.columns;

// Get columns
const first = grid.columns.first;
const age = grid.columns.get('age');
const name = grid.columns.getById('nameColumnId');

// Modify columns
grid.columns.first.width = 100;
ageColumn.hidden = true;
```

---

## 2. Displaying Data

### Inline Data

```javascript
// Vanilla JS
const grid = new Grid({
    columns : [/*...*/],
    data : [
        { id : 1, name : 'Batman' },
        { id : 2, name : 'Wolverine' }
    ]
});

// React
const [data, setData] = useState([
    { id : 1, name : 'Batman' },
    { id : 2, name : 'Wolverine' }
]);
return <BryntumGrid data={data} />

// Vue 3
const data = reactive([
    { id : 1, name : 'Batman' },
    { id : 2, name : 'Wolverine' }
]);

// Angular
data = [
    { id : 1, name : 'Batman' },
    { id : 2, name : 'Wolverine' }
]
```

### Store Configuration

```javascript
const grid = new Grid({
    store : {
        sorters : [{ field : 'name' }],
        data : [
            { id : 1, name : 'Batman' }
        ]
    }
});
```

### Custom Data Loading

```javascript
const grid = new Grid({ columns : [/*...*/] });

const response = await fetch('backend/load.php');
const data = await response.json();

data.forEach((row, index) => {
    row.index = index;
    row.someValue = Math.random();
});

grid.store.data = data;
```

### Remote Data (AjaxStore)

```javascript
const grid = new Grid({
    store : {
        readUrl : 'backend/load.php',
        autoLoad : true
    }
});
```

### Expected Response Format

```json
{
    "success" : true,
    "data" : [
        { "id" : 1, "name" : "Batman" }
    ]
}
```

### Remote Sorting/Filtering/Paging

```javascript
class MyStore extends Store {
   static configurable = {
       remotePaging : true,
       remoteSort : true,
       remoteFilter : true
   }

   requestData({ page, pageSize, sorters, filters }){
      let filteredRecords = [...allRecords];

      filters?.forEach(filter => {
         const { field, operator, value } = filter;
         if(operator === '='){
             filteredRecords = filteredRecords.filter(r => r[field] === value);
         }
      });

      sorters?.forEach(sorter => filteredRecords.sort((a,b) => {
         const { field, ascending } = sorter;
         if (!ascending) ([b, a] = [a, b]);
         return a[field] > b[field] ? 1 : (a[field] < b[field] ? -1 : 0);
      }));

      const start = (page - 1) * pageSize;
      const data = filteredRecords.splice(start, start + pageSize);

      return { data, total : filteredRecords.length };
   }
}
```

### Filter Object Format

```javascript
{
    "field": "country",
    "operator": "=",
    "value": "sweden",
    "caseSensitive": false
}
```

### Sorter Object Format

```javascript
{
    "field": "name",
    "ascending": true
}
```

---

## 3. Store Basics

### Store Creation

```javascript
const store = new Store({
    data : [
        { id : 1, name : 'Ms. Marvel', powers : 'Shapeshifting' },
        { id : 2, name : 'Black Widow', powers : 'Martial arts' }
    ]
});
```

### Custom Data Model

```javascript
class SuperHero extends Model {
    static fields = [
        'name',
        { name : 'powers', defaultValue: 'String' },
        { name : 'birthday', type : 'date', format : 'YYYY-MM-DD' },
        { name : 'affiliation', readOnly : true }
    ]
}

const store = new Store({
    modelClass : SuperHero,
    data: [/*...*/]
});
```

### Inline Fields

```javascript
const store = new Store({
    fields : ['name', 'powers', 'affiliation'],
    data : [/*...*/]
});
```

### Retrieving Records

```javascript
store.getAt(1);           // By index
store.getById(3);         // By ID
store.first;              // First record
store.last;               // Last record

store.find(r => r.name.startsWith('M'));     // Single match
store.findRecord('name', 'X-23');            // By field value
store.query(r => r.name.startsWith('M'));    // Multiple matches
```

### Counting Records

```javascript
// Visible records after filtering
const visibleRecords = store.count;

// Total including filtered/collapsed
const allDataRecords = store.getCount({
    collapsed : true,
    filteredOut : true
});

// All including headers
const allRecords = store.getCount({ all : true });
```

### Sorting

```javascript
// At creation
const store = new Store({
    sorters : [
        { field : 'powers' },
        { field : 'name', ascending : false }
    ]
});

// After creation
store.sort('name');
store.sort('name', false);
store.addSorter('powers');
store.removeSorter('powers');
```

### Filtering

```javascript
store.filter('powers', 'Martial arts');

store.filter({
    property  : 'id',
    operator : '<',
    value     : 4
});

store.clearFilters();
```

### Iterating

```javascript
// for-of
for (let record of store) {
    console.log(record.name);
}

// forEach (can return false to stop)
store.forEach(record => {
    console.log(record.name);
});
```

### CRUD Operations

```javascript
// Add
store.add({ name : 'Scarlet Witch' });
store.add(new Model({ name : 'Storm', powers : 'Weather' }));

// Insert
store.insert(0, { name : 'She-Hulk' });

// Remove
store.remove(1);
store.last.remove();

// Modify
store.last.name = 'Jennifer Walters';
store.last.set({
    name   : 'Jennifer Walters',
    powers : 'Strength'
});
```

### JSON Serialization

```javascript
const jsonString = store.json;
const jsonArray = store.toJSON();

// Restore
store.json = jsonString;
store.data = jsonString;
```

---

## 4. Lazy Loading (Infinite Scroll)

### Basic Setup

```javascript
new Grid({
    store: {
        readUrl: 'backend/read',
        lazyLoad: true,
        autoLoad: true
    }
});
```

### Custom Store Implementation

```javascript
class MyStore extends Store {
    static configurable = {
        lazyLoad: true,
        autoLoad: true
    };

    async requestData({ startIndex, count }) {
        const response = await fetchData({ startIndex, count });
        return {
            data: response.data,
            total: response.totalCount
        };
    }
}
```

### With Remote Sort/Filter

```javascript
class MyStore extends Store {
    static configurable = {
        remoteSort: true,
        remoteFilter: true,
        lazyLoad: true,
        autoLoad: true
    };

    async requestData({ startIndex, count, sorters, filters }) {
        const response = await fetchData({
            startIndex, count, sorters, filters
        });
        return {
            data: response.data,
            total: response.totalCount
        };
    }
}
```

### Tree Store Lazy Loading

```javascript
// Initial response with nested children
{
   "success": true,
   "total": 100000,
   "isFullyLoaded": false,
   "data": [
      {
          "id": 1,
          "parentId": null,
          "expanded": true,
          "isFullyLoaded": true,
          "children": [
              {"id": 10, "parentId": 1, "expanded": true, "isFullyLoaded": true, "children": [
                  {"id": 100, "parentId": 10},
                  {"id": 101, "parentId": 10}
              ]}
          ]
      }
   ]
}
```

### Backend Example (Express.js + MySQL)

```javascript
app.get('/read', async(req, res) => {
    const { startIndex, count } = req.query;

    const total = await new Promise(resolve => {
        connection.query('SELECT COUNT(*) from Records',
            (error, result) => resolve(result));
    });

    const data = await new Promise(resolve => {
        connection.query(
            `SELECT * from Records ORDER BY id LIMIT ${count} OFFSET ${startIndex}`,
            (error, results) => resolve(results)
        );
    });

    res.json({ success: true, total, data });
});
```

---

## 5. Grid Features

### Enabling/Disabling Features

```javascript
const grid = new Grid({
    features : {
        // Disable default features
        sort  : false,
        group : false,

        // Enable optional features
        filter    : true,
        quickFind : true,

        // Configure features
        filter : {
            property : 'city',
            name     : 'Stockholm'
        },
        sort : 'name'
    }
});
```

### Feature Reference

| Feature | Default | Description |
|---------|---------|-------------|
| **CellCopyPaste** | Disabled | Ctrl+C/X/V for cell ranges |
| **CellEdit** | Enabled | Inline cell editing |
| **RowEdit** | Disabled | Side-docked editing panel |
| **CellTooltip** | Disabled | Per-cell tooltips |
| **Charts** | Disabled | Chart.js integration |
| **ColumnAutoWidth** | Enabled | Auto-width for columns |
| **ColumnDragToolbar** | Disabled* | Touch-friendly column actions |
| **ColumnPicker** | Enabled | Toggle column visibility |
| **ColumnRename** | Disabled | Rename columns via right-click |
| **ColumnReorder** | Enabled | Drag headers to reorder |
| **ColumnResize** | Enabled | Drag header edges to resize |
| **CellMenu** | Enabled | Cell context menu |
| **HeaderMenu** | Enabled | Header context menu |
| **ExcelExporter** | Disabled | Export to Excel/CSV |
| **FileDrop** | Disabled | Drop files on widget |
| **FillHandle** | Disabled | Spreadsheet-like fill handle |
| **Filter** | Disabled | Row filtering via menu/headers |
| **FilterBar** | Disabled | Filter fields in headers |
| **Group** | Enabled | Row grouping |
| **GroupSummary** | Disabled | Summary bar per group |
| **LockRows** | Disabled | Pin rows to top |
| **MergeCells** | Disabled | Merge cells with same value |
| **PdfExport** | Disabled | Generate PDF/PNG |
| **PinColumns** | Disabled | Pin columns to start/end |
| **Print** | Disabled | Browser print dialog |
| **QuickFind** | Disabled | Type to search in column |
| **RegionResize** | Disabled | Resize locked/normal regions |
| **RowCopyPaste** | Enabled | Ctrl+C/X/V for rows |
| **RowExpander** | Disabled | Expandable row details |
| **RowReorder** | Disabled | Drag rows to reorder |
| **RowResize** | Disabled | Drag row borders to resize |
| **Search** | Disabled | Grid search (no UI) |
| **Sort** | Enabled | Single/multi-column sort |
| **Split** | Disabled | Split grid into views |
| **StickyCells** | Disabled | Pin cell content while scrolling |
| **Stripe** | Disabled | Alternating row colors |
| **Summary** | Disabled | Footer summary bar |
| **Tree** | Disabled | Tree grid (use TreeGrid) |
| **TreeGroup** | Disabled | Transform flat data to tree |
| **AIFilter** | Disabled | Natural language filtering |

*Auto-enabled on touch devices

### Importing Features (Thin Bundles)

```javascript
import Grid from 'PATH_TO_SOURCE/Grid/view/Grid.js';
import 'PATH_TO_SOURCE/Grid/feature/Filter.js';

const grid = new Grid({
    features : {
        filter : { /* config */ }
    }
});
```

---

## 6. Themes & Styling

### Available Themes

| Theme | Light | Dark |
|-------|-------|------|
| Svalbard (Default) | `svalbard-light.css` | `svalbard-dark.css` |
| Stockholm | `stockholm-light.css` | `stockholm-dark.css` |
| Visby | `visby-light.css` | `visby-dark.css` |
| Material3 | `material3-light.css` | `material3-dark.css` |
| Fluent2 | `fluent2-light.css` | `fluent2-dark.css` |

### Including Theme CSS

```html
<!-- Structural CSS -->
<link rel="stylesheet" href="build/grid.css">
<!-- Theme -->
<link rel="stylesheet" href="build/svalbard-light.css" data-bryntum-theme>
```

### Thin CSS (Multi-Product)

```html
<!-- Core + Grid + Scheduler combination -->
<link rel="stylesheet" href="core.thin.css">
<link rel="stylesheet" href="grid.thin.css">
<link rel="stylesheet" href="scheduler.thin.css">
<link rel="stylesheet" href="svalbard-light.css" data-bryntum-theme>
```

### Custom Theme Variables

```css
/* Override theme variables */
:root:not(.b-nothing) {
    --b-button-outlined-border-color : lightsalmon;
}

/* Or scope to specific selector */
.b-button {
    --b-button-outlined-border-color : lightsalmon;
}
```

### Runtime Theme Switching

```javascript
import { Grid, DomHelper } from '@bryntum/grid';

const grid = new Grid({
    tbar : [{
        type  : 'combo',
        items : [
            { text : 'Svalbard Light', value : 'svalbard-light' },
            { text : 'Svalbard Dark', value : 'svalbard-dark' },
            { text : 'Visby Light', value : 'visby-light' },
            { text : 'Visby Dark', value : 'visby-dark' }
        ],
        label : 'Theme',
        value : 'svalbard-light',
        onAction(props) {
            DomHelper.setTheme(props.value);
        }
    }]
});
```

### CSS Version Troubleshooting

```html
<!-- Cache busting -->
<link rel="stylesheet" href="path/to/stylesheet.css?v=7.1.0">
```

---

## Quick Reference

### Key Grid Configs

| Config | Type | Description |
|--------|------|-------------|
| `columns` | Array | Column definitions |
| `data` | Array | Inline data |
| `store` | Object/Store | Store configuration |
| `features` | Object | Feature configuration |
| `rowHeight` | Number | Row height in pixels |
| `tbar` | Array | Top toolbar items |
| `bbar` | Array | Bottom toolbar items |

### Key Store Configs

| Config | Type | Description |
|--------|------|-------------|
| `data` | Array | Inline data |
| `readUrl` | String | URL for AjaxStore |
| `autoLoad` | Boolean | Auto-load on creation |
| `lazyLoad` | Boolean | Enable infinite scroll |
| `remoteSort` | Boolean | Server-side sorting |
| `remoteFilter` | Boolean | Server-side filtering |
| `remotePaging` | Boolean | Server-side paging |
| `tree` | Boolean | Enable tree structure |

### Key Events

| Event | Description |
|-------|-------------|
| `cellClick` | Cell clicked |
| `cellDblClick` | Cell double-clicked |
| `selectionChange` | Selection changed |
| `beforeCellEditStart` | Before cell editing |
| `finishCellEdit` | After cell editing |
| `sort` | After sorting |
| `filter` | After filtering |

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
