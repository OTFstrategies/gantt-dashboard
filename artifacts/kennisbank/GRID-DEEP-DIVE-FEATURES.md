# Grid Deep Dive: Features

> **Uitgebreide analyse** van de 35+ built-in features in Bryntum Grid: sorting, grouping, filtering, editing, en veel meer.

---

## Overzicht

Grid Features zijn plug-ins die extra functionaliteit toevoegen. Ze worden geconfigureerd via de `features` property.

```javascript
const grid = new Grid({
    features: {
        sort         : true,           // Boolean enables with defaults
        group        : 'city',         // String = sort by field
        cellEdit     : { ... },        // Object = custom config
        regionResize : false           // False disables
    }
});
```

---

## 1. Sorting Feature

Sorteren van data op één of meerdere kolommen.

### 1.1 Basic Configuration

```javascript
features: {
    sort: true                          // Enable sorting
}

// OF: initial sorter
features: {
    sort: 'name'                        // Sort by 'name' ascending
}

// OF: advanced config
features: {
    sort: {
        field              : 'name',
        ascending          : false,
        toggleOnHeaderClick: true       // Click header to toggle
    }
}
```

### 1.2 Multi-Column Sort

```javascript
store: {
    sorters: [
        { field: 'team', ascending: false },
        { field: 'age', ascending: true }
    ]
}
```

### 1.3 Custom Sort Function

```javascript
{
    field    : 'rank',
    text     : 'Rank',
    sortable : (a, b) => {
        // Sort by ranges of 10
        const rangeA = Math.floor(a.rank / 10);
        const rangeB = Math.floor(b.rank / 10);

        if (rangeA === rangeB) {
            return b.rank - a.rank;  // Descending within range
        }
        return rangeA - rangeB;
    }
}
```

### 1.4 Sort Events

```javascript
store: {
    listeners: {
        sort({ sorters }) {
            console.log('Sorted by:', sorters.map(s =>
                `${s.field} ${s.ascending ? 'ASC' : 'DESC'}`
            ));
        }
    }
}
```

---

## 2. Group Feature

Groeperen van rijen op kolomwaarden.

### 2.1 Basic Grouping

```javascript
features: {
    group: 'city'                       // Group by city field
}

// OF: met renderer
features: {
    group: {
        field: 'city',
        renderer({ groupRowFor, count, groupRecords }) {
            const avg = groupRecords.reduce((sum, r) => sum + r.age, 0) / count;
            return `${groupRowFor} (${count} items, avg age: ${avg.toFixed(1)})`;
        }
    }
}
```

### 2.2 Column-Specific Group Renderer

```javascript
{
    text          : 'Age',
    field         : 'age',
    type          : 'number',
    groupRenderer : ({ groupRowFor, count }) =>
        `Age ${groupRowFor} <span class="b-group-count">${count}</span>`
}
```

### 2.3 Actions in Group Rows

```javascript
{
    type    : 'action',
    actions : [
        {
            cls          : 'fa fa-plus',
            showForGroup : true,           // Only show in group rows
            onClick      : ({ record }) => {
                record.groupChildren.forEach(r => r.rating++);
            }
        }
    ]
}
```

### 2.4 GroupBar Widget

```javascript
tbar: [
    { type: 'groupbar' }               // Drag columns to group
]
```

### 2.5 Group Methods

```javascript
grid.expandAll();                       // Expand all groups
grid.collapseAll();                     // Collapse all groups
grid.collapse(record);                  // Collapse specific group
grid.expand(record);                    // Expand specific group
```

---

## 3. GroupSummary Feature

Aggregatie statistieken per groep.

### 3.1 Configuration

```javascript
features: {
    group        : 'city',
    groupSummary : {
        target           : 'footer',    // 'header' | 'footer'
        collapseToHeader : true         // Move to header when collapsed
    }
}
```

### 3.2 Column Summaries

```javascript
{
    field     : 'age',
    type      : 'number',
    sum       : 'sum'                   // Built-in aggregator
}

// Multiple summaries
{
    field     : 'score',
    summaries : [
        { sum: 'min', label: 'Min' },
        { sum: 'max', label: 'Max' },
        { sum: 'average', label: 'Avg' }
    ]
}
```

### 3.3 Built-in Aggregators

| Aggregator | Beschrijving |
|------------|--------------|
| `sum` | Som van alle waarden |
| `count` | Aantal rijen |
| `average` | Gemiddelde |
| `min` | Minimum waarde |
| `max` | Maximum waarde |

---

## 4. Filter Feature

Client-side filtering van data.

### 4.1 Basic Filtering

```javascript
features: {
    filter: true
}

// Filter programmatisch
grid.store.filter({
    property : 'age',
    operator : '>',
    value    : 25
});
```

### 4.2 Column Filterable Config

```javascript
{
    field      : 'age',
    filterable : true,
    filterType : 'number'               // Enables number operators
}

// OF: disable voor specifieke kolom
{
    field      : 'id',
    filterable : false
}
```

---

## 5. FilterBar Feature

Filter invoervelden in column headers.

### 5.1 Basic FilterBar

```javascript
features: {
    filterBar: true
}

// OF: compact mode
features: {
    filterBar: {
        compactMode      : true,        // Expandable filters
        keyStrokeFilterDelay: 300       // Debounce delay (ms)
    }
}
```

### 5.2 Column Filter Field Config

```javascript
{
    field      : 'name',
    filterable : {
        filterField: {
            type        : 'text',
            placeholder : 'Filter name...'
        }
    }
}
```

---

## 6. Search Feature

Full-text zoeken met highlighting.

### 6.1 Configuration

```javascript
features: {
    search: true
}
```

### 6.2 API Methods

```javascript
const search = grid.features.search;

search.search('John');                  // Start search
search.gotoNextHit();                   // Navigate to next
search.gotoPrevHit();                   // Navigate to previous
search.clear();                         // Clear search
```

### 6.3 Column Searchable

```javascript
{
    field      : 'team',
    searchable : false                  // Exclude from search
}
```

### 6.4 Events

```javascript
listeners: {
    search({ find, found }) {
        console.log(`Found ${found.length} matches for "${find}"`);
    },
    clearSearch() {
        console.log('Search cleared');
    }
}
```

---

## 7. QuickFind Feature

Snelle navigatie met typing.

```javascript
features: {
    quickFind: true
}

// Start typing om te zoeken, focus springt naar match
```

---

## 8. CellEdit Feature

Inline cell bewerking.

### 8.1 Basic Configuration

```javascript
features: {
    cellEdit: true
}

// Per column
{
    field  : 'name',
    editor : {
        type     : 'text',
        required : true
    }
}

// Disable editing
{
    field  : 'id',
    editor : false
}
```

### 8.2 Editor Types

```javascript
// Text
editor: { type: 'text' }

// Number
editor: { type: 'number', min: 0, max: 100, step: 5 }

// Date
editor: { type: 'date', format: 'YYYY-MM-DD' }

// Combo
editor: {
    type     : 'combo',
    editable : false,
    items    : ['Option 1', 'Option 2', 'Option 3']
}

// Textarea
editor: { type: 'textareapickerfield' }
```

### 8.3 Validation

```javascript
{
    field           : 'email',
    finalizeCellEdit: ({ value }) => {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!valid) {
            Toast.show('Invalid email format');
        }
        return valid;
    }
}
```

---

## 9. RowExpander Feature

Uitklappbare rij-details.

### 9.1 Configuration

```javascript
features: {
    rowExpander: {
        columnPosition: 'last',         // 'first' | 'last' | number
        column: {
            width: 80
        },
        async renderer({ record, expanderElement }) {
            return {
                className: 'expander-content',
                children: [
                    { text: record.name, style: { fontWeight: 'bold' } },
                    { text: `Details: ${record.description}` }
                ]
            };
        }
    }
}
```

### 9.2 Async Content

```javascript
features: {
    rowExpander: {
        async renderer({ record }) {
            const response = await fetch(`/api/details/${record.id}`);
            const data = await response.json();

            return {
                className: 'detail-content',
                html: data.html
            };
        }
    }
}
```

### 9.3 API Methods

```javascript
const expander = grid.features.rowExpander;

expander.expand(record);                // Expand row
expander.collapse(record);              // Collapse row
expander.toggleExpand(record);          // Toggle
```

---

## 10. RowReorder Feature

Drag-and-drop rij volgorde.

### 10.1 Configuration

```javascript
features: {
    rowReorder: {
        showGrip: true,                 // true | false | 'hover'
        gripOnly: false                 // Only drag by grip
    }
}
```

### 10.2 Events

```javascript
listeners: {
    gridRowBeforeDropFinalize: async ({ context }) => {
        const result = await MessageDialog.confirm({
            title  : 'Confirm',
            message: 'Move row here?'
        });
        return result === MessageDialog.yesButton;
    }
}
```

---

## 11. MergeCells Feature

Samenvoegen van cellen met gelijke waarden.

### 11.1 Configuration

```javascript
features: {
    mergeCells: {
        passthrough: true,              // Allow click events through
        sortedOnly : false              // Merge all or only sorted columns
    }
}

// Per column
{
    field      : 'city',
    mergeCells : true,
    mergeable  : true                   // Allow toggle in header menu
}
```

### 11.2 Custom Merge Logic

```javascript
features: {
    mergeCells: {
        shouldMerge({ column, record, previousRecord, value }) {
            if (column.field === 'city') {
                // Only merge if food also matches
                return record.food === previousRecord.food;
            }
            return true;
        }
    }
}
```

---

## 12. Split Feature

Grid splitsen in meerdere views.

### 12.1 Configuration

```javascript
features: {
    split: true
}
```

### 12.2 API Methods

```javascript
grid.split({
    direction: 'horizontal'             // 'horizontal' | 'vertical' | 'both'
});

grid.unsplit();                         // Remove split
```

### 12.3 Events

```javascript
listeners: {
    split({ options }) {
        console.log('Split direction:', options.direction);
    },
    unsplit() {
        console.log('Grid unsplit');
    }
}
```

---

## 13. Summary Feature

Footer summary row.

```javascript
features: {
    summary: true
}

// Column config
{
    field           : 'score',
    sum             : 'sum',
    summaryRenderer : ({ sum }) => `Total: ${sum}`
}
```

---

## 14. CellTooltip Feature

Tooltips voor cellen.

### 14.1 Configuration

```javascript
features: {
    cellTooltip: {
        hoverDelay     : 300,           // Delay before showing
        textContent    : true,          // Show cell content as tooltip
        tooltipRenderer: ({ record, column }) =>
            `${column.text}: ${record[column.field]}`
    }
}
```

### 14.2 Column-Specific Tooltip

```javascript
{
    field          : 'name',
    tooltipRenderer: ({ record }) => `My name is <b>${record.name}</b>`
}

// Disable tooltip
{
    field          : 'id',
    tooltipRenderer: false
}
```

### 14.3 Async Tooltip

```javascript
{
    field          : 'details',
    tooltipRenderer: async ({ record }) => {
        const response = await fetch(`/api/tooltip/${record.id}`);
        return response.text();
    }
}
```

---

## 15. Stripe Feature

Alternerende rij kleuren.

```javascript
features: {
    stripe: true
}
```

---

## 16. RegionResize Feature

Resize van locked/normal regions.

```javascript
features: {
    regionResize: true
}
```

---

## 17. RowResize Feature

Handmatig aanpassen van rij hoogte.

```javascript
features: {
    rowResize: true
}
```

---

## 18. Column Features

### 18.1 ColumnPicker

```javascript
features: {
    columnPicker: {
        groupByRegion        : true,    // Group locked/normal
        createColumnsFromData: true     // Add columns from model
    }
}
```

### 18.2 ColumnReorder

```javascript
features: {
    columnReorder: {
        stretchedDragProxy: true
    }
}
```

### 18.3 ColumnResize

```javascript
features: {
    columnResize: true                  // Default: enabled
}
```

### 18.4 ColumnRename

```javascript
features: {
    columnRename: true                  // Double-click to rename
}
```

### 18.5 ColumnAutoWidth

```javascript
// Per column
{ field: 'name', autoWidth: true }

// Met constraints
{ field: 'name', autoWidth: [100, 300] }
```

---

## 19. Menu Features

### 19.1 HeaderMenu

```javascript
features: {
    headerMenu: {
        moveColumns: true,
        items: {
            customItem: {
                text   : 'Custom Action',
                icon   : 'fa fa-star',
                onItem : ({ column }) => console.log(column.field)
            }
        }
    }
}
```

### 19.2 CellMenu

```javascript
features: {
    cellMenu: {
        items: {
            deleteRow: {
                text   : 'Delete',
                icon   : 'fa fa-trash',
                onItem : ({ record }) => record.remove()
            }
        }
    }
}
```

---

## 20. Export Features

### 20.1 ExcelExporter

```javascript
import { ExcelExporter } from '@bryntum/grid';

grid.features.excelExporter.export({
    filename : 'data.xlsx',
    exporterConfig : {
        columns : grid.columns.allRecords
    }
});
```

### 20.2 PdfExport

```javascript
features: {
    pdfExport: {
        exportServer: 'http://localhost:8080/'
    }
}

grid.features.pdfExport.export({
    filename : 'data.pdf',
    format   : 'A4'
});
```

---

## 21. Tree Feature

Voor TreeGrid functionaliteit.

```javascript
features: {
    tree: {
        treeLines: true                 // Show connecting lines
    }
}

// API
tree.expandAll();
tree.collapseAll();
tree.expand(record);
tree.collapse(record);
```

---

## 22. TreeGroup Feature

Groeperen als tree structuur.

```javascript
features: {
    treeGroup: {
        levels: ['category', 'subcategory']
    }
}
```

---

## 23. FileDrop Feature

Drag-and-drop bestanden.

```javascript
features: {
    fileDrop: {
        allowedTypes: ['image/*', '.pdf'],
        onDrop({ files }) {
            console.log('Files dropped:', files);
        }
    }
}
```

---

## 24. FillHandle Feature

Excel-achtige cell vullen.

```javascript
features: {
    fillHandle: true
}
```

---

## 25. StickyCells Feature

Cellen die blijven staan bij scrollen.

```javascript
features: {
    stickyCells: true
}
```

---

## 26. PinColumns Feature

Pin kolommen naar links/rechts.

```javascript
features: {
    pinColumns: true
}
```

---

## 27. Charts Feature

Inline charts in cellen.

```javascript
features: {
    charts: true
}

// SparklineColumn of ChartColumn gebruiken
{
    type  : 'sparkline',
    field : 'trend'
}
```

---

## Feature Matrix

| Feature | Default | Beschrijving |
|---------|---------|--------------|
| `cellEdit` | `true` | Cell editing |
| `cellMenu` | `true` | Cell context menu |
| `cellTooltip` | `false` | Cell tooltips |
| `columnAutoWidth` | `true` | Auto-size columns |
| `columnDragToolbar` | `false` | Drag toolbar |
| `columnPicker` | `true` | Column picker menu |
| `columnReorder` | `true` | Drag columns |
| `columnRename` | `false` | Double-click rename |
| `columnResize` | `true` | Resize columns |
| `fillHandle` | `false` | Excel-style fill |
| `filter` | `false` | Filtering |
| `filterBar` | `false` | Filter bar |
| `group` | `false` | Grouping |
| `groupSummary` | `false` | Group aggregations |
| `headerMenu` | `true` | Header context menu |
| `mergeCells` | `false` | Cell merging |
| `pinColumns` | `false` | Pin columns |
| `quickFind` | `false` | Type-to-search |
| `regionResize` | `false` | Resize regions |
| `rowExpander` | `false` | Expandable rows |
| `rowReorder` | `false` | Drag rows |
| `rowResize` | `false` | Resize rows |
| `search` | `false` | Full-text search |
| `sort` | `true` | Sorting |
| `split` | `false` | Split view |
| `stickyCells` | `false` | Sticky cells |
| `stripe` | `false` | Zebra striping |
| `summary` | `false` | Footer summary |
| `tree` | `false` | Tree structure |
| `treeGroup` | `false` | Tree grouping |

---

## Referenties

- Examples: `grid-7.1.0-trial/examples/features/`
- Examples: `grid-7.1.0-trial/examples/sorting/`
- Examples: `grid-7.1.0-trial/examples/grouping/`
- Examples: `grid-7.1.0-trial/examples/search/`
- Examples: `grid-7.1.0-trial/examples/rowexpander/`
- TypeScript: `grid.d.ts` lines 120011+ (Features)

---

*Document gegenereerd: December 2024*
*Bryntum Grid versie: 7.1.0*
