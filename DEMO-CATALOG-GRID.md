# BRYNTUM GRID DEMO CATALOGUS (91 demos)

## CORE GRID

### basic
- **Doel**: Simple grid initialization
- **Features**: Column definitions, data binding, inline editors
- **Data**: 25 sample records

### tree
- **Doel**: Hierarchical data display
- **Features**: Parent-child relationships, tree lines toggle, Quick Find
- **Config**: Custom TreeGrid, GridRowModel classes
- **Data**: Airport terminal hierarchy

---

## COLUMNS & LAYOUT

### columns
- **Doel**: Dynamic column management
- **Features**: Add/delete columns, visibility management, column picker
- **Config**: Column renaming, reordering, type selection
- **Custom**: ColumnManager popup

### lockedcolumns
- **Doel**: Frozen columns in first region
- **Features**: Region resize, column picker with region grouping

### lockedcolumnstree
- **Doel**: Locked columns met tree structure

### collapsible-columns
- **Doel**: Columns inklapbaar maken

### collapsible-inline-columns
- **Doel**: Inline collapsible columns

### pin-columns
- **Doel**: Pin columns to left/right

### columndragtoolbar
- **Doel**: Toolbar for column drag operations

### columntypes
- **Doel**: Demo van alle column types
- **Types**: text, number, date, check, color, percent, rating, time, template, action, widget

### groupedheaders
- **Doel**: Multi-level column headers

### responsive
- **Doel**: Responsive design per breakpoint
- **Config**: `responsiveLevels: { small: 450, medium: 800, large: '*' }`
- **Features**: Column width/visibility per responsive level

---

## FILTERING

### filtering
- **Doel**: Programmatic filter control
- **Features**: Custom filter functions, whole word matching (regex)
- **Config**: Column-specific filterable configuration

### filterbar
- **Doel**: Interactive filter bar UI
- **Features**: Compact mode, custom filter fields, multi-select filters
- **Config**: ChecklistFilterCombo, grouping

### fieldfilters
- **Doel**: Field-level filter configuration

### facet-filter
- **Doel**: Faceted filtering (e-commerce style)

---

## GROUPING

### grouping
- **Doel**: Group by field
- **Features**: Custom group renderer, expand/collapse, group bar UI
- **Config**: Min/max calculations per group

### multi-group
- **Doel**: Multiple grouping levels

### groupsummary
- **Doel**: Group summary statistics
- **Summary Types**: sum, count, min, max, average
- **Config**: Display in header or footer

### tree-grouping
- **Doel**: Grouping in tree grids

---

## DATA EDITING

### celledit
- **Doel**: Cell-level editing
- **Features**: Various editor types, custom widget editors (YesNo toggle)
- **Config**: Validation, dirty indicators, readonly mode
- **Custom**: YesNo widget class

### rowedit
- **Doel**: Row-level editing in popup

### tinymce-editor
- **Doel**: Rich text editing met TinyMCE

### cascadingcombos
- **Doel**: Dependent dropdown editors

---

## ROW EXPANSION

### rowexpander
- **Doel**: Expandable row details
- **Features**: Async content loading, nested tables
- **Data**: Race results with splits

### rowexpander-regions
- **Doel**: Row expander met multiple regions

### rowexpander-spanregions
- **Doel**: Row expander spanning regions

### nested-grid
- **Doel**: Multiple nested Grid instances
- **Pattern**: Customer > Order > LineItem hierarchy
- **Features**: Auto-height, checkbox selection, computed fields
- **Custom**: OrderGrid, LineItemGrid classes

### nested-grid-with-chart
- **Doel**: Nested grid met embedded charts

### master-detail
- **Doel**: Master-detail pattern
- **Features**: Store foreign keys, calculated fields, attest functionality

---

## EXPORT

### exporttoexcel
- **Doel**: Excel export met styling
- **Features**: Type conversion, cell styling, conditional formatting
- **Config**: CustomExcelFileProvider
- **Dependencies**: write-excel-file library

### export
- **Doel**: General export functionality

### print
- **Doel**: Print dialog integration
- **Features**: Custom header/footer templates, page numbers

### import-from-excel
- **Doel**: Import Excel data

---

## PERFORMANCE

### bigdataset
- **Doel**: Up to 1,000,000 records
- **Config**: `fixedRowHeight`, `useRawData: true`
- **Features**: Async generation, scroll to row, progress display

### infinite-scroll
- **Doel**: Lazy loading from server
- **Features**: Server-side filtering/sorting, network status indicator
- **Backend**: PHP or Express.js

### infinite-scroll-tree
- **Doel**: Infinite scroll voor tree grids

### sparse-index / sparse-index-tree
- **Doel**: Sparse data indexing

---

## SELECTION

### selection
- **Doel**: Selection modes demo
- **Modes**: rowNumber, checkbox, cell, column, multiSelect, dragSelect

### cellselection
- **Doel**: Cell-level selection

---

## CHARTS & VISUALIZATION

### charts
- **Doel**: Chart.js integration
- **Features**: Right-click chart creation, stats calculation
- **Config**: Cell/column selection, multi-select, drag selection
- **Custom**: statsRenderer met min/max/avg highlighting

### sparklines
- **Doel**: Inline sparkline charts in cells

---

## STATE & PERSISTENCE

### state
- **Doel**: State persistence
- **Storage**: localStorage or backend server
- **Features**: Auto-save, reset to default
- **Custom**: BackendState class

---

## RENDERERS

### renderers
- **Doel**: Custom cell/header rendering
- **Features**: Badge elements, color boxes, gradients, icons
- **Config**: Header buttons, HTML content (XSS-safe)

### custom-contextmenu
- **Doel**: Custom context menu items

### contextmenu
- **Doel**: Context menu configuration

### celltooltip
- **Doel**: Cell tooltips

### tooltip
- **Doel**: Grid tooltips

---

## DRAG & DROP

### drag-between-grids
- **Doel**: Drag records tussen grids

### drag-between-trees
- **Doel**: Drag nodes tussen tree grids

### rowreordering
- **Doel**: Drag rows to reorder

---

## TREE FEATURES

### tree
- **Doel**: Basic tree grid

### treeloadondemand
- **Doel**: Lazy loading tree nodes

### tree-grouping
- **Doel**: Grouping in trees

---

## SPECIAL FEATURES

### merge-cells
- **Doel**: Cell merging/spanning

### multiregion
- **Doel**: Multiple grid regions

### split
- **Doel**: Split view

### lock-rows
- **Doel**: Lock specific rows

### autoheight
- **Doel**: Auto-height rows

### rowheight
- **Doel**: Custom row heights

### scaling
- **Doel**: Grid scaling/zoom

### summary
- **Doel**: Summary rows

### multisummary
- **Doel**: Multiple summary rows

### aggregation-column
- **Doel**: Aggregation in columns

### widgetcolumn
- **Doel**: Widget components in columns

### transaction
- **Doel**: Transaction management

### shareddata
- **Doel**: Shared data stores

### multipleinstances
- **Doel**: Multiple grid instances

### paged
- **Doel**: Client-side paging

### search / quickfind
- **Doel**: Search functionality

### sorting
- **Doel**: Sort configuration

### features
- **Doel**: All features demo

---

## AI FEATURES

### ai-ecommerce-grid
- **Doel**: AI-powered e-commerce grid

### ai-generator
- **Doel**: AI content generation

### ai-project-summary
- **Doel**: AI project summaries

### ai-review-grid
- **Doel**: AI review analysis

---

## INTEGRATION

### grid-taskboard
- **Doel**: Grid + TaskBoard integration

### stocklist
- **Doel**: Stock list real-time updates

### resource-monitor
- **Doel**: System resource monitoring

### project-summary
- **Doel**: Project summary view

---

## THEMES & STYLING

### themes
- **Doel**: Theme switcher
- **Themes**: Material3, Stockholm, Svalbard, Visby, High Contrast

### custom-theme
- **Doel**: Custom CSS theme

---

## FRAMEWORKS

### frameworks/
- Angular
- React (+ Vite, Remix)
- Vue 2, Vue 3 (+ Vite)
- Webpack
- ExtJS Modern
- WebComponents

---

## BACKEND EXAMPLES

### php / php-paged
- **Doel**: PHP backend integration

### remote-nonajax
- **Doel**: Non-AJAX remote data

---

## COLUMN TYPE REFERENCE

| Type | Beschrijving |
|------|--------------|
| `text` | Basic text |
| `number` | Numeric values |
| `date` | Date picker |
| `time` | Time picker |
| `check` | Checkbox |
| `color` | Color picker |
| `percent` | Progress bar |
| `rating` | Star rating |
| `template` | Custom template |
| `action` | Action buttons |
| `widget` | Custom widgets |
| `tree` | Tree column |
| `rownumber` | Row numbers |
| `aggregate` | Aggregated values |

---

## FEATURE CONFIGURATION

```javascript
features: {
    sort: 'fieldName',
    group: 'fieldName',
    filter: { property, operator, value },
    cellEdit: true,
    rowExpander: { /* config */ },
    filterBar: { compactMode: true },
    tree: true,
    stripe: true,
    quickFind: true
}
```

---

## SELECTION MODES

```javascript
selectionMode: {
    rowNumber: true,
    checkbox: true,
    cell: true,
    column: true,
    multiSelect: true,
    dragSelect: true
}
```

---

## RESPONSIVE CONFIG

```javascript
responsiveLevels: {
    small: 450,
    medium: 800,
    large: '*'
},
columns: [{
    responsiveLevels: {
        '*': { width: 120 },
        small: { hidden: true },
        medium: { flex: 1 }
    }
}]
```
