# Grid Deep Dive: Columns

> **Uitgebreide analyse** van het Bryntum Grid kolom-systeem: types, configuratie, renderers, editors, en custom columns.

---

## Overzicht

De Grid Column is de fundamentele bouwsteen voor data presentatie in Bryntum Grid. Elke kolom bepaalt hoe data wordt weergegeven, geëditeerd, en geformatteerd.

```
Column Hiërarchie:
Column (base)
├── ActionColumn
├── ColorColumn
├── DateColumn
├── NumberColumn
│   ├── AggregateColumn
│   ├── CurrencyColumn
│   ├── PercentColumn
│   └── RatingColumn
├── RowNumberColumn
├── TemplateColumn
├── TimeColumn
├── TreeColumn
└── WidgetColumn
    ├── CheckColumn
    └── ChartColumn
        └── SparklineColumn
```

---

## 1. Built-in Column Types

### 1.1 Column (Base Class)

De basis voor alle kolom types. Biedt core functionaliteit.

```javascript
{
    text         : 'Header Text',        // Header tekst
    field        : 'dataField',          // Model field binding
    width        : 150,                  // Vaste breedte (px)
    flex         : 1,                    // Flexibele breedte
    minWidth     : 100,                  // Minimum breedte
    maxWidth     : 300,                  // Maximum breedte
    align        : 'left',               // 'left' | 'center' | 'right' | 'start' | 'end'
    hidden       : false,                // Verberg kolom
    locked       : false,                // Lock naar links
    sortable     : true,                 // Sorteerbaar
    filterable   : true,                 // Filterbaar
    resizable    : true,                 // Resizable
    draggable    : true,                 // Drag/drop in headers
    groupable    : true,                 // Groupeerbaar
    exportable   : true,                 // Inclusief in exports
    editor       : true,                 // Editor config of false
    cls          : 'my-header-cls',      // Header CSS class
    cellCls      : 'my-cell-cls',        // Cell CSS class
    htmlEncode   : true,                 // Encode HTML in cells
    htmlEncodeHeaderText : true,         // Encode HTML in header
    ariaLabel    : 'Column description'  // Accessibility
}
```

### 1.2 NumberColumn

Voor numerieke data met formatting en alignment.

```javascript
{
    type         : 'number',
    field        : 'price',
    text         : 'Price',
    align        : 'right',              // Default: right
    format       : '0.00',               // Number format string
    min          : 0,                    // Minimum waarde (voor editor)
    max          : 1000,                 // Maximum waarde
    step         : 1,                    // Step increment
    instantUpdate: true,                 // Update on keypress
    unit         : 'kg'                  // Unit suffix
}
```

### 1.3 CurrencyColumn

Extends NumberColumn voor valuta formatting.

```javascript
{
    type     : 'currency',
    field    : 'amount',
    text     : 'Amount',
    currency : 'EUR',                    // Currency code
    locale   : 'nl-NL'                   // Locale for formatting
}
```

### 1.4 PercentColumn

Voor percentages met progress bar visualisatie.

```javascript
{
    type         : 'percent',
    field        : 'progress',
    text         : 'Progress',
    showValue    : true,                 // Toon percentage tekst
    lowThreshold : 20                    // Onder dit % = low styling
}
```

### 1.5 RatingColumn

Interactieve star rating.

```javascript
{
    type    : 'rating',
    field   : 'rating',
    text    : 'Rating',
    max     : 5,                         // Aantal sterren
    min     : 0,                         // Minimum waarde
    cellCls : 'satisfaction'             // Custom styling
}
```

### 1.6 DateColumn

Voor datums met locale-aware formatting.

```javascript
{
    type   : 'date',
    field  : 'startDate',
    text   : 'Start Date',
    format : 'MMMM D YYYY',              // DateHelper format string
    step   : '1d',                       // Step in picker
    min    : new Date(2020, 0, 1),       // Minimum date
    max    : new Date(2030, 11, 31)      // Maximum date
}
```

### 1.7 TimeColumn

Voor tijdstippen.

```javascript
{
    type   : 'time',
    field  : 'time',
    text   : 'Time',
    format : 'LT'                        // Locale time format
}
```

### 1.8 CheckColumn

Boolean checkbox of toggle.

```javascript
{
    type           : 'check',
    field          : 'done',
    text           : 'Done',
    useSlideToggle : true,               // SlideToggle ipv checkbox
    widgets        : [{                  // Custom widget
        type      : 'slidetoggle',
        ariaLabel : 'Toggle status'
    }]
}
```

### 1.9 ActionColumn

Icon buttons voor acties per rij.

```javascript
{
    type    : 'action',
    text    : 'Actions',
    width   : 120,
    align   : 'center',
    actions : [
        {
            cls     : 'fa fa-edit',
            tooltip : 'Edit record',
            onClick : ({ record }) => {
                console.log('Edit:', record.id);
            }
        },
        {
            cls     : 'fa fa-trash',
            tooltip : 'Delete record',
            visible : ({ record }) => record.deletable,
            onClick : ({ record }) => {
                record.remove();
            }
        }
    ]
}
```

### 1.10 ColorColumn

Voor kleurselectie.

```javascript
{
    type   : 'color',
    field  : 'color',
    text   : 'Color',
    colors : ['red', 'blue', 'green', 'yellow']  // Beschikbare kleuren
}
```

### 1.11 TemplateColumn

Met string template functie.

```javascript
{
    type     : 'template',
    field    : 'name',
    text     : 'Template',
    template : data => StringHelper.xss`Hi ${data.record.name}!`,
    fitMode  : 'value'                   // Voor auto-sizing
}
```

### 1.12 WidgetColumn

Embed widgets in cells.

```javascript
{
    type    : 'widget',
    text    : 'Controls',
    widgets : [
        {
            type      : 'button',
            icon      : 'fa fa-plus',
            rendition : 'filled',
            color     : 'b-blue',
            onAction  : ({ source }) => {
                source.cellInfo.record.count++;
            }
        }
    ]
}
```

### 1.13 TreeColumn

Voor hiërarchische data in TreeGrid.

```javascript
{
    type            : 'tree',
    field           : 'name',
    text            : 'Name',
    expandIconCls   : 'fa fa-plus-square',   // Custom expand icon
    collapseIconCls : 'fa fa-minus-square',  // Custom collapse icon
    indentSize      : 20                     // Indent per level (px)
}
```

### 1.14 AggregateColumn

Voor parent node aggregatie in TreeGrid.

```javascript
{
    type            : 'aggregate',
    field           : 'price',
    text            : 'Total Price',
    sum             : 'sum',                 // 'sum' | 'count' | 'average' | function
    enableAggregation: true,
    format          : {
        locale      : 'en-US',
        template    : '$9,999',
        currency    : 'USD',
        significant : 5
    },
    summaryRenderer : ({ sum }) => `Total: ${sum}`
}
```

### 1.15 RowNumberColumn

Automatische rij nummering.

```javascript
{
    type   : 'rownumber',
    width  : 50,
    align  : 'center'
}
```

---

## 2. Column Renderers

### 2.1 Renderer Function

```javascript
{
    field    : 'status',
    text     : 'Status',
    renderer : ({
        value,           // Field value
        record,          // Full record
        column,          // Column instance
        cellElement,     // DOM element
        row,             // Row instance
        grid,            // Grid instance
        size,            // { height, configuredHeight }
        isExport,        // True tijdens export
        isMeasuring      // True tijdens size measuring
    }) => {
        // Return string
        return `Status: ${value}`;

        // OF: Return DomConfig
        return {
            tag       : 'div',
            className : 'status-badge',
            style     : { backgroundColor: 'green' },
            text      : value
        };

        // OF: Mutate cellElement directly
        cellElement.classList.add('custom-class');
        return value;
    }
}
```

### 2.2 After Render Callback

Voor post-processing na built-in renderers:

```javascript
{
    type            : 'check',
    field           : 'visible',
    afterRenderCell : ({ record, widgets }) => {
        // Modify widget na rendering
        widgets[0].text = record.name;
    }
}
```

### 2.3 Header Renderer

```javascript
{
    field          : 'pm25',
    text           : 'PM 2.5',
    headerRenderer : ({ column }) => `${column.text} <small>(μg/m³)</small>`
}
```

### 2.4 Summary Renderer

```javascript
{
    type            : 'number',
    field           : 'price',
    sum             : 'sum',
    summaryRenderer : ({ sum }) => `Total: €${sum.toFixed(2)}`
}
```

### 2.5 Tooltip Renderer

```javascript
{
    field           : 'value',
    tooltipRenderer : ({ record, event }) => {
        return `<strong>${record.name}</strong>: ${record.value}`;
    }
}
```

---

## 3. Column Editors

### 3.1 Basic Editor Config

```javascript
// Disable editing
{ field: 'id', editor: false }

// Default editor based on field type
{ field: 'name', editor: true }

// Specific editor type
{
    field  : 'name',
    editor : {
        type : 'text',
        label: 'Name'
    }
}
```

### 3.2 Combo Editor

```javascript
{
    field  : 'status',
    editor : {
        type       : 'combo',
        editable   : false,          // Geen vrije invoer
        autoExpand : true,           // Expand on focus
        items      : [
            [0, 'Todo'],
            [1, 'In Progress'],
            [2, 'Done']
        ]
    }
}
```

### 3.3 Multi-Select Combo

```javascript
{
    field  : 'skills',
    editor : {
        type        : 'combo',
        multiSelect : true,
        editable    : false,
        items       : ['JavaScript', 'TypeScript', 'Python', 'Java']
    }
}
```

### 3.4 Textarea Editor

```javascript
{
    field  : 'notes',
    editor : {
        type : 'textareapickerfield'  // Popup textarea
    }
}
```

### 3.5 Cell Editor Container

```javascript
{
    field      : 'chips',
    cellEditor : {
        matchSize : {
            height : false           // Allow overflow
        }
    }
}
```

### 3.6 Finalize Cell Edit

Validatie voor edit completion:

```javascript
{
    field           : 'skills',
    finalizeCellEdit: ({ value }) => {
        const valid = value.length < 4;
        if (!valid) {
            Toast.show('Max 3 skills allowed');
        }
        return valid;  // false = cancel edit
    }
}
```

---

## 4. Custom Columns

### 4.1 Extend Column Class

```javascript
import { Column, ColumnStore, StringHelper } from '@bryntum/grid';

class StatusColumn extends Column {
    // Register column type
    static type = 'status';

    // Default configurations
    static defaults = {
        align  : 'center',
        field  : 'status',
        editor : {
            type       : 'combo',
            editable   : false,
            items      : [
                [0, 'Todo'],
                [1, 'In Progress'],
                [2, 'Review'],
                [3, 'Finished']
            ]
        }
    };

    // Custom renderer
    renderer({ value }) {
        const colors = {
            0: 'blue',
            1: 'orange',
            2: 'red',
            3: 'green'
        };

        return {
            className : 'status-tag',
            style     : {
                '--color': `var(--b-color-${colors[value]})`
            },
            text : this.editor.items[value]?.text
        };
    }
}

// Register with ColumnStore
ColumnStore.registerColumnType(StatusColumn);
```

### 4.2 Extend NumberColumn

```javascript
class BarColumn extends PercentColumn {
    static type = 'bar';

    static get defaults() {
        return {
            editor         : false,
            headerRenderer : ({ column }) => `${column.text} <small>(μg/m³)</small>`,
            width          : 170
        };
    }

    calculatePercentage(record) {
        const measurement = record.originalData[this.field];
        return 100 * measurement / this.max;
    }

    renderer({ record }) {
        // Use parent's defaultRenderer for bar
        const barConfig = super.defaultRenderer({
            record,
            value: this.calculatePercentage(record)
        });

        barConfig.dataset = { field: this.field };
        return barConfig;
    }
}

ColumnStore.registerColumnType(BarColumn, true);  // true = replace existing
```

---

## 5. Grouped Headers

### 5.1 Basic Grouping

```javascript
columns: [
    { text: 'ID', field: 'id', width: 80 },
    {
        text     : 'Contact',
        children : [
            { text: 'First name', field: 'firstName', width: 150 },
            { text: 'Surname', field: 'surName', width: 150 }
        ]
    },
    {
        text     : 'Details',
        children : [
            { text: 'City', field: 'city', width: 140 },
            { text: 'Country', field: 'country', width: 140 }
        ]
    }
]
```

### 5.2 Collapsible Groups

```javascript
{
    text        : 'Contact',
    collapsible : true,              // Enable collapse
    collapsed   : true,              // Start collapsed
    collapseMode: 'toggleAll',       // 'toggleAll' | 'showFirst'
    children    : [
        { text: 'First name', field: 'firstName' },
        { text: 'Surname', field: 'surName' },
        // Shown only when collapsed
        {
            text           : 'Full Name',
            toggleAllHidden: true,    // Hidden when expanded
            renderer       : ({ record }) => `${record.firstName} ${record.surName}`
        }
    ]
}
```

### 5.3 Collapse Events

```javascript
listeners: {
    beforeColumnCollapseToggle({ collapsed, column }) {
        // Prepare for transition
        if (collapsed) {
            grid.element.classList.add('collapsed-mode');
        }
    },
    columnCollapseToggle({ collapsed, column }) {
        // After transition complete
        if (!collapsed) {
            grid.element.classList.remove('collapsed-mode');
        }
    }
}
```

---

## 6. Locked Columns

### 6.1 Basic Locking

```javascript
columns: [
    { text: 'Name', field: 'name', width: 200, locked: true },
    { text: 'ID', field: 'id', width: 80, locked: true },
    // Normal columns
    { text: 'City', field: 'city', width: 150 },
    { text: 'Score', field: 'score', width: 100 }
]
```

### 6.2 SubGrid Configuration

```javascript
const grid = new Grid({
    features: {
        regionResize: true           // Allow resizing locked area
    },

    subGridConfigs: {
        locked: {
            width: 360               // Fixed width for locked region
        }
    },

    columns: [
        { field: 'firstName', locked: true },
        { field: 'surName', locked: true },
        { field: 'city' }
    ]
});
```

### 6.3 Region Configuration

```javascript
subGridConfigs: {
    locked: {
        width     : 400,
        minWidth  : 200,
        maxWidth  : 600,
        collapsed : false            // Start collapsed
    },
    normal: {
        flex: 1
    }
}
```

---

## 7. Column Features

### 7.1 ColumnPicker

```javascript
features: {
    columnPicker: {
        groupByRegion        : true,   // Group by locked/unlocked
        createColumnsFromData: true    // Create columns from model fields
    }
}
```

### 7.2 ColumnReorder

```javascript
features: {
    columnReorder: {
        stretchedDragProxy: true       // Full height drag proxy
    }
}
```

### 7.3 ColumnResize

```javascript
features: {
    columnResize: true                 // Default: enabled
}
```

### 7.4 ColumnRename

```javascript
features: {
    columnRename: true                 // Double-click header to rename
}
```

### 7.5 ColumnAutoWidth

```javascript
// Per column
{ field: 'name', autoWidth: true }

// With constraints
{ field: 'name', autoWidth: [100, 300] }  // [min, max]
```

---

## 8. Column Store

### 8.1 Accessing Columns

```javascript
// By field
const nameColumn = grid.columns.get('name');

// By index
const firstColumn = grid.columns.getAt(0);

// All visible columns
const visible = grid.columns.visibleColumns;

// Bottom (leaf) columns
const leaves = grid.columns.bottomColumns;

// Top level columns
const top = grid.columns.topColumns;
```

### 8.2 Modifying Columns

```javascript
// Add column
grid.columns.add({
    field: 'newField',
    text: 'New Column',
    width: 150
});

// Remove column
column.remove();
// OF
grid.columns.remove(column);

// Show/hide
column.hidden = true;
column.hide();
column.show();

// Reorder
column.parent.insertChild(column, 2);  // Move to index 2
```

### 8.3 Column Config Autoload

```javascript
columns: {
    autoAddField: true,              // Auto-add columns from data
    data: [
        { text: 'Name', field: 'name' },
        { text: 'Age', field: 'age', type: 'number' }
    ]
}
```

---

## 9. TypeScript Interfaces

```typescript
interface ColumnConfig {
    id?: string;
    type?: string;
    text?: string;
    field?: string;
    width?: number;
    flex?: number;
    minWidth?: number;
    maxWidth?: number;
    align?: 'left' | 'center' | 'right' | 'start' | 'end';
    hidden?: boolean;
    locked?: boolean;
    sortable?: boolean;
    filterable?: boolean | FilterableConfig;
    resizable?: boolean;
    draggable?: boolean;
    groupable?: boolean;
    exportable?: boolean;
    editor?: boolean | EditorConfig | string;
    renderer?: RendererFunction;
    headerRenderer?: HeaderRendererFunction;
    tooltipRenderer?: TooltipRendererFunction;
    cls?: string;
    cellCls?: string;
    htmlEncode?: boolean;
    htmlEncodeHeaderText?: boolean;
    autoHeight?: boolean;
    autoWidth?: boolean | number[];
    autoSyncHtml?: boolean;
    children?: ColumnConfig[];
    collapsible?: boolean;
    collapsed?: boolean;
    collapseMode?: 'toggleAll' | 'showFirst';
    sealed?: boolean;
}

interface RenderData {
    value: any;
    record: Model;
    column: Column;
    cellElement: HTMLElement;
    row: Row;
    grid: Grid;
    size: { height: number; configuredHeight: number };
    isExport: boolean;
    isMeasuring: boolean;
}

type RendererFunction = (data: RenderData) => string | DomConfig | void;
```

---

## 10. Best Practices

### 10.1 Performance

```javascript
// Use renderer return instead of DOM manipulation
renderer({ value }) {
    return {
        className: 'status',
        text: value
    };
}

// Use autoSyncHtml for efficient updates
{
    autoSyncHtml: true,
    htmlEncode: false,
    renderer({ value }) {
        return `<div class="status">${value}</div>`;
    }
}

// Avoid heavy calculations in renderers
// Pre-calculate in model instead
store: {
    fields: [{
        name: 'displayValue',
        calculate: record => heavyCalculation(record)
    }]
}
```

### 10.2 Accessibility

```javascript
{
    ariaLabel    : 'Status column',
    cellAriaLabel: 'Current status'
}
```

### 10.3 Export Compatibility

```javascript
renderer({ value, isExport }) {
    if (isExport) {
        // Return plain text for export
        return value;
    }
    // Return rich content for display
    return {
        className: 'rich-cell',
        html: `<icon class="fa fa-star"></icon>${value}`
    };
}
```

---

## Referenties

- Examples: `grid-7.1.0-trial/examples/columns/`
- Examples: `grid-7.1.0-trial/examples/columntypes/`
- Examples: `grid-7.1.0-trial/examples/lockedcolumns/`
- Examples: `grid-7.1.0-trial/examples/groupedheaders/`
- Examples: `grid-7.1.0-trial/examples/collapsible-columns/`
- TypeScript: `grid.d.ts` lines 107903-108200 (Column class)
- TypeScript: `grid.d.ts` lines 117732+ (ColumnStore)

---

*Document gegenereerd: December 2024*
*Bryntum Grid versie: 7.1.0*
