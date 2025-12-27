# BRYNTUM GRID API SURFACE

> Foundation component - all Bryntum products extend Grid (156,916 lines)

---

## 1. GRID CLASS

```typescript
export class Grid extends GridBase
```

### Key Properties

```typescript
features: GridFeaturesType
store: Store
columns: ColumnStore
```

### Grid Config Options

```typescript
columns?: ColumnStore | GridColumnConfig[] | ColumnStoreConfig
store?: Store | StoreConfig
data?: object[] | Model[] | ModelConfig[]
autoHeight?: boolean
columnLines?: boolean
cellEllipsis?: boolean
contextMenuTriggerEvent?: 'contextmenu' | 'click' | 'dblclick'
destroyStore?: boolean
features?: GridFeaturesConfigType
```

---

## 2. FEATURES (37 total)

| Feature | Class | Purpose |
|---------|-------|---------|
| `aiFilter` | AIFilter | AI-powered filtering |
| `cellCopyPaste` | CellCopyPaste | Copy/paste cells |
| `cellEdit` | CellEdit | Cell editing |
| `cellMenu` | CellMenu | Cell context menu |
| `cellTooltip` | CellTooltip | Cell tooltips |
| `charts` | Charts | Chart integration |
| `columnAutoWidth` | ColumnAutoWidth | Auto-fit columns |
| `columnDragToolbar` | ColumnDragToolbar | Column drag UI |
| `columnPicker` | ColumnPicker | Show/hide columns |
| `columnRename` | ColumnRename | Rename columns |
| `columnReorder` | ColumnReorder | Reorder columns |
| `columnResize` | ColumnResize | Resize columns |
| `excelExporter` | ExcelExporter | Excel export |
| `fileDrop` | FileDrop | File drop handler |
| `fillHandle` | FillHandle | Excel-like fill |
| `filter` | Filter | Data filtering |
| `filterBar` | FilterBar | Filter UI bar |
| `group` | Group | Data grouping |
| `groupSummary` | GroupSummary | Group summaries |
| `headerMenu` | HeaderMenu | Header menu |
| `lockRows` | LockRows | Lock rows |
| `mergeCells` | MergeCells | Merge cells |
| `pdfExport` | PdfExport | PDF export |
| `pinColumns` | PinColumns | Pin/freeze columns |
| `print` | Print | Print support |
| `quickFind` | QuickFind | Quick search |
| `regionResize` | RegionResize | Region resizing |
| `rowCopyPaste` | RowCopyPaste | Copy/paste rows |
| `rowEdit` | RowEdit | Row editing |
| `rowExpander` | RowExpander | Expandable rows |
| `rowReorder` | RowReorder | Reorder rows |
| `rowResize` | RowResize | Resize rows |
| `search` | Search | Search feature |
| `sort` | Sort | Data sorting |
| `split` | Split | Split view |
| `stickyCells` | StickyCells | Sticky headers |
| `stripe` | Stripe | Row striping |
| `summary` | Summary | Summary rows |
| `tree` | Tree | Tree view |
| `treeGroup` | TreeGroup | Tree grouping |

### Feature Configuration Examples

```typescript
features: {
    filter: true,                    // Enable with defaults
    sort: { showIconOnColumnHover: true },
    group: {
        field: 'category',
        showCount: true,
        toggleOnRowClick: true
    },
    cellEdit: {
        triggerEvent: 'dblclick',
        addNewAtEnd: true
    },
    rowExpander: {
        singleExpand: true,
        renderer: ({ record }) => `<div>${record.details}</div>`
    }
}
```

---

## 3. COLUMN TYPES (17)

| Type | Class | Purpose |
|------|-------|---------|
| (base) | `Column` | Base column |
| `action` | `ActionColumn` | Action buttons |
| `aggregate` | `AggregateColumn` | Aggregations |
| `chart` | `ChartColumn` | Inline charts |
| `check` | `CheckColumn` | Checkboxes |
| `color` | `ColorColumn` | Color picker |
| `currency` | `CurrencyColumn` | Currency format |
| `date` | `DateColumn` | Date display |
| `number` | `NumberColumn` | Numbers |
| `percent` | `PercentColumn` | Percentages |
| `rating` | `RatingColumn` | Star ratings |
| `rownumber` | `RowNumberColumn` | Row numbers |
| `sparkline` | `SparklineColumn` | Mini charts |
| `template` | `TemplateColumn` | Custom HTML |
| `time` | `TimeColumn` | Time display |
| `tree` | `TreeColumn` | Tree structure |
| `widget` | `WidgetColumn` | Custom widgets |

### Column Configuration

```typescript
interface ColumnConfig {
    type?: string
    field?: string
    text?: string
    width?: number | string
    flex?: number
    hidden?: boolean
    sortable?: boolean
    filterable?: boolean | FilterableConfig
    groupable?: boolean
    align?: 'left' | 'center' | 'right'
    editor?: EditorConfig | Field
    renderer?: (data: RenderData) => HTMLElement | string
    minWidth?: number | string
    autoWidth?: boolean | number[]
    cellCls?: string
    cls?: string
    autoHeight?: boolean
    collapsed?: boolean
    collapsible?: boolean
    children?: ColumnConfig[]
}
```

---

## 4. STORE & MODEL

### Store Class

```typescript
export class Store extends Base
```

**Static Properties:**
```typescript
static readonly isStore: boolean
static readonly isStoreFilter: boolean
static readonly isStoreSort: boolean
static readonly isStoreGroup: boolean
static readonly isStorePaging: boolean
static readonly isStoreChain: boolean
static readonly isStoreTree: boolean
static readonly isStoreSearch: boolean
```

**Key Properties:**
```typescript
readonly allRecords: Model[]
readonly changes: { added: Model[], modified: Model[], removed: Model[] }
autoCommit: boolean
```

**Store Mixins:**
| Mixin | Purpose |
|-------|---------|
| `StoreFilterClass` | Filtering |
| `StoreSortClass` | Sorting |
| `StoreGroupClass` | Grouping |
| `StorePagingClass` | Pagination |
| `StoreCRUDClass` | CRUD operations |
| `StoreChainedClass` | Chained stores |
| `StoreChangesClass` | Change tracking |
| `StoreSearchClass` | Search |
| `StoreTreeClass` | Tree structure |
| `StoreSyncClass` | Server sync |

### Model Class

```typescript
export class Model extends Base
```

**Static Properties:**
```typescript
static readonly allFields: DataField[]
static readonly fieldMap: Record<string, DataField>
static readonly fields: (string | ModelFieldConfig | DataField)[]
static idField: string
static childrenField: string
static readonly isModel: boolean
static readonly isTreeNode: boolean
static defaults: object
static relations: Record<string, RelationConfig>
```

**Instance Properties:**
```typescript
allChildren: Model[]
depth: number
id: any
parent: Model
children: Model[]
```

---

## 5. WIDGETS

### Core Widgets

| Widget | Purpose |
|--------|---------|
| `Widget` | Base widget |
| `Container` | Widget container |
| `Panel` | Panel with toolbars |
| `Button` | Clickable button |
| `TextField` | Text input |
| `NumberField` | Number input |
| `DateField` | Date picker |
| `Combo` | Dropdown select |
| `List` | List widget |
| `Checkbox` | Checkbox |
| `Radio` | Radio button |
| `Slider` | Slider input |
| `Toolbar` | Toolbar container |
| `Menu` | Dropdown menu |
| `Popup` | Popup window |
| `Dialog` | Modal dialog |
| `Toast` | Toast notification |
| `Tooltip` | Tooltip |
| `Splitter` | Panel splitter |
| `TabPanel` | Tab container |

### Widget Configuration Pattern

```typescript
{
    type: 'button',
    text: 'Click me',
    icon: 'fa fa-check',
    cls: 'my-button',
    disabled: false,
    onClick: () => { ... }
}
```

### Container Properties

```typescript
firstItem: Widget
lastItem: Widget
items: ContainerItemConfig[] | Widget[]
isValid: boolean
hasChanges: boolean
labelPosition?: 'before' | 'above' | 'align-before' | 'auto'
```

### Panel Properties

```typescript
collapsed: boolean
bbar: Toolbar     // Bottom toolbar
tbar: Toolbar     // Top toolbar
state: any        // State management
```

---

## 6. EVENTS

### Grid Events

```typescript
onBeforeSelectionChange
onBeforeStateApply
onBeforeStateSave
onCellClick
onCellContextMenu
onCellDblClick
onCellMouseEnter
onCatchAll
```

### Event Listening

```typescript
// Config style
onCellClick: ({ record, column }) => { ... }

// Method style
grid.on('cellClick', ({ record, column }) => { ... })

// Multiple events
grid.on({
    cellClick: handler1,
    cellDblClick: handler2
})
```

---

## 7. KEY PATTERNS

### Config to Instance

```typescript
// Config (initialization)
{ type: 'number', field: 'price', width: 100 }

// Instance (runtime)
new NumberColumn({ field: 'price', width: 100 })
```

### Feature Toggle

```typescript
features: {
    filter: true,              // Enable defaults
    sort: { /* config */ },    // Enable with config
    group: false               // Disable
}
```

### Change Tracking

```typescript
store.changes           // { added, modified, removed }
container.hasChanges    // Boolean
store.autoCommit        // Auto-persist
```

---

## 8. INHERITANCE CHAIN

```
Base
  └── Model
        └── GridRowModel
  └── Store
  └── Widget
        └── Container
              └── Panel
                    └── Grid
                          └── TreeGrid
                                └── Gantt
                                └── SchedulerPro
                                └── Calendar
                                └── TaskBoard
```

---

## SUMMARY

| Category | Count |
|----------|-------|
| Features | 37 |
| Column Types | 17 |
| Core Widgets | 20+ |
| Store Mixins | 10+ |

**Source:** `grid.d.ts` - 156,916 lines

All Bryntum products (Gantt, Scheduler, Calendar, TaskBoard) extend Grid.
