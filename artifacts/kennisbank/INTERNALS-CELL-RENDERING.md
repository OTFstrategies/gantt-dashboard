# Bryntum Gantt/Grid Cell Rendering and Recycling System - Internal Architecture

This document provides comprehensive analysis of the column/cell rendering and recycling system used in Bryntum Grid and Gantt components, covering the complete rendering pipeline from data to DOM.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Row Virtualization](#row-virtualization)
3. [Cell Recycling](#cell-recycling)
4. [Row Height Calculation](#row-height-calculation)
5. [Column Rendering](#column-rendering)
6. [Cell Element Pool](#cell-element-pool)
7. [Scroll Synchronization](#scroll-synchronization)
8. [Buffer Zones](#buffer-zones)
9. [Refresh Strategies](#refresh-strategies)
10. [Timeline vs Grid Rendering](#timeline-vs-grid-rendering)

---

## Architecture Overview

### Component Hierarchy

```
Gantt / Grid
    |
    +-- RowManager
    |       |
    |       +-- Row[]  (virtualized row pool)
    |               |
    |               +-- cells: HTMLElement[]
    |               +-- elements: Record<region, HTMLElement>
    |
    +-- SubGrid (per region: 'locked', 'normal')
    |       |
    |       +-- Header
    |       +-- Body (scrollable viewport)
    |       +-- Footer
    |
    +-- ColumnStore
    |       |
    |       +-- Column[]
    |               |
    |               +-- renderer function
    |               +-- cellElement management
    |
    +-- TimeAxisColumn (Gantt-specific)
            |
            +-- Task rendering pipeline
```

### Key Classes

| Class | Responsibility |
|-------|----------------|
| `RowManager` | Manages the pool of Row objects for virtualization |
| `Row` | Represents a single virtualized row with DOM elements per region |
| `SubGrid` | A scrollable region containing a subset of columns |
| `GridBase` | Core grid functionality, row/cell rendering orchestration |
| `Column` | Column definition with rendering configuration |
| `GridLocation` | Encapsulates a reference to a specific cell location |

---

## Row Virtualization

### RowManager Architecture

The RowManager is responsible for maintaining a pool of Row objects that are reused as the grid scrolls. This is the core of the virtualization system.

**Key Concepts:**

1. **Fixed Row Pool**: RowManager creates only enough Row objects to fill the visible viewport plus buffer zones
2. **No 1:1 Mapping**: There is NOT a one-to-one relationship between rows and records
3. **Row Recycling**: As the user scrolls, rows are repositioned and their content is updated to display different records

**Row Properties:**

```typescript
class Row extends Base {
    // Position properties
    readonly top: number;           // Row top coordinate
    readonly bottom: number;        // Row bottom coordinate
    height: number;                 // Row height (get/set)
    offsetHeight: number;           // Row height including border

    // Index properties
    dataIndex: number;              // Index in grid's store
    readonly index: number;         // Index in RowManager's rows array
    id: string | number;            // ID of currently rendered record

    // DOM access
    readonly cells: HTMLElement[];  // All cell elements
    readonly element: HTMLElement;  // Row element (single region)
    readonly elements: Record<string, HTMLElement>; // Elements per region

    // State
    readonly isFirst: boolean;      // Is this the first row?
    cls: DomClassList;              // CSS classes for row
}
```

**Row Methods:**

```typescript
// Cell access
getCell(columnId: string | number): HTMLElement;
getCells(region: string): HTMLElement[];
getElement(region: string): HTMLElement;
getRectangle(region: string): Rectangle;

// Iteration
eachCell(fn: Function): void;
eachElement(fn: Function): void;

// CSS manipulation
addCls(classes: string | Record<string, boolean>): void;
removeCls(classes: string | Record<string, boolean>): void;
toggleCls(classes: string | Record<string, boolean>, add: boolean): void;
assignCls(classes: Record<string, boolean>): void;
```

### Visible Row Calculation

The system calculates which records should be visible based on:

1. **Viewport Height**: `grid.bodyHeight`
2. **Scroll Position**: Current vertical scroll offset
3. **Row Heights**: Either fixed or variable per record
4. **Buffer Zones**: Extra rows rendered above/below viewport

```
+----------------------------------+
|        Buffer Zone (top)         |  <- Pre-rendered rows
+----------------------------------+
|                                  |
|         Visible Viewport         |  <- Actually visible to user
|                                  |
+----------------------------------+
|       Buffer Zone (bottom)       |  <- Pre-rendered rows
+----------------------------------+
```

### fixedRowHeight Configuration

The `fixedRowHeight` config optimizes performance when all rows have the same height:

```typescript
const gantt = new Gantt({
    fixedRowHeight: true,  // Enable fixed height optimization
    rowHeight: 50          // All rows are 50px
});
```

**Benefits of fixedRowHeight:**
- Faster row position calculation (simple multiplication)
- Reduced reflow during scroll
- Instant scroll-to-row positioning

**Trade-offs:**
- Cannot use variable row heights
- Cannot use `autoHeight` on columns

---

## Cell Recycling

### How Cells Are Reused During Scroll

When the user scrolls, the rendering system:

1. **Identifies Off-Screen Rows**: Rows that have scrolled completely out of view
2. **Repositions Row Elements**: Moves DOM elements to new positions
3. **Updates Row Data**: Assigns new record data to recycled rows
4. **Re-renders Cell Content**: Calls column renderers with new data

**Recycling Flow:**

```
Scroll Event
    |
    v
Calculate New Visible Range
    |
    v
For each row that scrolled out:
    |
    +-- Calculate new position
    |
    +-- Assign new dataIndex
    |
    +-- Update row.id
    |
    +-- For each cell:
    |       |
    |       +-- Clear previous content
    |       +-- Call column.renderer()
    |       +-- Update cellElement
    |
    +-- Apply row CSS classes
    |
    +-- Position row element
```

### Cell Element Structure

Each cell in a row has a specific DOM structure:

```html
<div class="b-grid-cell" data-column="columnId" data-column-id="columnId">
    <!-- Cell content from renderer -->
</div>
```

**Cell CSS Classes:**
- `b-grid-cell` - Base cell class
- `b-selected` - Cell is selected
- `b-focused` - Cell has focus
- `b-cell-editing` - Cell is being edited
- Column-specific classes via `cellCls` config

---

## Row Height Calculation

### Height Modes

1. **Fixed Height**: All rows use `grid.rowHeight`
2. **Variable Height**: Per-record heights via `getRowHeight` function
3. **Auto Height**: Height determined by cell content

### getRowHeight Function

Custom row heights can be specified per record:

```typescript
const grid = new Grid({
    getRowHeight({ record }) {
        // Return desired height for this record
        if (record.isExpanded) {
            return 100;
        }
        return record.rowHeight || 45;  // Fallback to default
    }
});
```

### Size Object in Renderers

Renderers can specify row height through the `size` parameter:

```typescript
renderer({ cellElement, record, size }) {
    // Set desired height for this row (largest wins)
    size.height = record.needsTallRow ? 80 : 45;

    return record.name;
}
```

**Size Properties:**

```typescript
{
    height: number;           // Set to specify desired row height
    configuredHeight: number; // The configured default rowHeight
}
```

**Height Resolution:**
- Each column's renderer can request a height
- The **largest** requested height is used
- Falls back to `grid.rowHeight` if no height specified

### autoHeight Column Configuration

Columns can automatically size rows based on content:

```typescript
{
    field: 'description',
    autoHeight: true  // Row height adjusts to content
}
```

**Warning**: `autoHeight` disables virtualization benefits for that column and can significantly impact performance with large datasets.

---

## Column Rendering

### Renderer Function Signature

```typescript
renderer(renderData: {
    cellElement: HTMLElement;     // The cell's DOM element
    value: any;                   // Field value from record
    record: Model;                // The data record
    column: Column;               // Column instance
    grid: Grid;                   // Grid instance
    row: Row;                     // Row instance
    size: {                       // Row height control
        height: number;
        configuredHeight: number;
    };
    isExport: boolean;            // True during export
    isMeasuring: boolean;         // True during measurement phase
}): string | DomConfig | DomConfig[] | HTMLElement | void
```

### Renderer Return Values

| Return Type | Behavior |
|-------------|----------|
| `string` | Set as cell's innerHTML (HTML encoded by default) |
| `DomConfig` | Bryntum's declarative DOM structure |
| `DomConfig[]` | Array of DOM configs |
| `HTMLElement` | Direct DOM node insertion |
| `void` | Renderer manipulates cellElement directly |

### DomConfig Structure

```typescript
interface DomConfig {
    tag?: string;           // HTML tag name
    html?: string;          // innerHTML
    text?: string;          // textContent
    class?: string | object; // CSS classes
    style?: string | object; // Inline styles
    children?: DomConfig[]; // Child elements
    dataset?: object;       // data-* attributes
    // Plus any HTML attribute...
}
```

**Example:**

```typescript
renderer({ value, record }) {
    return {
        tag: 'div',
        class: 'custom-cell',
        children: [
            { tag: 'span', class: 'icon', html: '&#9733;' },
            { tag: 'span', class: 'value', text: value }
        ]
    };
}
```

### afterRenderCell Hook

Called after the cell has been rendered, useful for post-render styling:

```typescript
{
    field: 'date',
    type: 'date',
    afterRenderCell({ row, record, cellElement, value }) {
        // Add class for past dates
        cellElement.classList.toggle('past', value < Date.now());
    }
}
```

### headerRenderer Function

Custom header rendering:

```typescript
{
    field: 'name',
    headerRenderer({ column, headerElement }) {
        return `<span class="header-icon"></span>${column.text}`;
    }
}
```

---

## Cell Element Pool

### DOM Element Management

Bryntum uses a sophisticated element pooling strategy:

1. **Pre-allocation**: Row elements are created during grid initialization
2. **Element Reuse**: Same DOM elements are recycled for different records
3. **Minimal DOM Operations**: Only content changes, not structure

### Element Access Patterns

```typescript
// Grid-level access
grid.getCell({ record, column }): HTMLElement | null;
grid.getRowFor(recordOrId): Row;

// Row-level access
row.getCell(columnId): HTMLElement;
row.getCells(region): HTMLElement[];
row.cells: HTMLElement[];  // All cells in row

// Column-level access
column.refreshCell(record): void;  // Refresh specific cell
column.refreshCells(): void;       // Refresh all cells in column
```

### Performance Considerations

**Do NOT:**
- Store references to cell elements (they get recycled)
- Attach persistent event listeners to cells
- Modify cells outside of renderers

**Do:**
- Use renderers for all cell modifications
- Use `afterRenderCell` for post-render styling
- Use event delegation at grid level

---

## Scroll Synchronization

### SubGrid Architecture

Bryntum Grid supports multiple synchronized regions:

```typescript
const grid = new Grid({
    subGridConfigs: {
        locked: { width: 300 },   // Left locked region
        normal: { flex: 1 }       // Main scrollable region
    },
    columns: [
        { field: 'name', locked: true },  // In 'locked' region
        { field: 'value' }                 // In 'normal' region
    ]
});
```

### Vertical Scroll Sync

All SubGrids share the same RowManager, ensuring vertical scroll sync:

```
+----------------+------------------------+
|  Locked Region |     Normal Region      |
+----------------+------------------------+
|                |                        |
|  Row 1 cells   |      Row 1 cells       | <- Same Row object
|                |                        |
|  Row 2 cells   |      Row 2 cells       | <- Same Row object
|                |                        |
+----------------+------------------------+
      ^                    ^
      |                    |
   Shared RowManager - synchronized vertical scroll
```

### Horizontal Scroll

Each SubGrid scrolls horizontally independently:

```typescript
// Access SubGrid
const normalSubGrid = gantt.getSubGrid('normal');

// Horizontal scroll events
gantt.on({
    horizontalScroll({ source, subGrid, scrollLeft }) {
        console.log(`${subGrid.region} scrolled to ${scrollLeft}`);
    }
});
```

### LockRows Feature

The `GridLockRows` feature allows locking specific records at the top:

```typescript
const grid = new Grid({
    features: {
        lockRows: {
            filterFn: record => record.isPinned
        }
    }
});

// Lock rows programmatically
grid.features.lockRows.lockRows({
    fieldName: 'isPinned',
    filterFn: record => record.isPinned === true
});
```

**How it works:**
- Creates two synchronized grid views
- Top view shows "locked" records
- Bottom view shows remaining records
- Both share scroll position

### Split Feature

Grid can be split into multiple views:

```typescript
grid.features.split.split({
    direction: 'horizontal',  // or 'vertical', 'both'
    atRecord: someRecord      // Split at this record
});
```

---

## Buffer Zones

### Over-Rendering for Smooth Scrolling

The RowManager renders additional rows beyond the visible viewport:

```
Total Rendered Rows = Visible Rows + (Buffer * 2)

                     +------------------+
                     | Buffer (top)     |  Invisible but rendered
                     +------------------+
Viewport Edge -----> +==================+
                     |                  |
                     | Visible Area     |  User sees this
                     |                  |
Viewport Edge -----> +==================+
                     +------------------+
                     | Buffer (bottom)  |  Invisible but rendered
                     +------------------+
```

### Buffer Benefits

1. **Smooth Scrolling**: Content is ready before becoming visible
2. **Reduced Flicker**: No empty rows during fast scroll
3. **Keyboard Navigation**: Next rows ready for arrow key navigation

### Configuration

Buffer size is typically automatic based on:
- Viewport height
- Row height
- Scroll velocity

---

## Refresh Strategies

### Full Refresh vs Incremental Update

**Full Refresh (`refreshRows()`):**
- Re-renders all visible rows
- Used after major data changes
- More expensive but complete

**Incremental Update (`refreshRow(record)`):**
- Re-renders single row
- Used after record modification
- Efficient for single-record updates

### fullRowRefresh Configuration

```typescript
const grid = new Grid({
    fullRowRefresh: true,   // Refresh entire row on any change
    // or
    fullRowRefresh: false   // Only refresh affected cells
});
```

### Refresh Methods

```typescript
// Full grid refresh
grid.renderRows();           // Re-render all rows
grid.renderContents();       // Re-render rows, headers, footers

// Row-level refresh
grid.refreshRow(record);     // Refresh specific row
grid.refreshRows(records);   // Refresh multiple rows

// Cell-level refresh
column.refreshCell(record);  // Refresh one cell
column.refreshCells();       // Refresh all cells in column

// Suspend/Resume pattern
grid.suspendRefresh();
// ... multiple data changes ...
grid.resumeRefresh(true);    // true triggers refresh if suspended
```

### Render Events

```typescript
grid.on({
    // Fired when a single row is rendered
    renderRow({ source, row, record, recordIndex }) {
        console.log(`Rendered row ${recordIndex}`);
    },

    // Fired when all rows have been rendered
    renderRows({ source }) {
        console.log('All rows rendered');
    }
});
```

---

## Timeline vs Grid Rendering

### Grid Cell Rendering (Left Panel)

Standard grid cells use the column `renderer`:

```typescript
{
    field: 'name',
    renderer({ value, record, cellElement }) {
        return value;  // Simple text content
    }
}
```

**Characteristics:**
- One cell per column per row
- Content from record fields
- Standard HTML/CSS rendering
- Managed by RowManager/Column

### Timeline/Task Rendering (Right Panel)

Gantt task bars use a specialized rendering pipeline:

```typescript
const gantt = new Gantt({
    taskRenderer({ taskRecord, renderData, indicators }) {
        // Customize task bar appearance
        renderData.cls['my-task'] = true;
        renderData.style = 'background: red';
        renderData.iconCls['fa-star'] = true;

        // Add indicators (milestones, deadlines)
        indicators.push({
            startDate: taskRecord.deadline,
            cls: 'deadline-indicator'
        });

        return taskRecord.name;  // Task bar content
    }
});
```

**TaskRenderer RenderData:**

```typescript
{
    cls: DomClassList;           // Task bar CSS classes
    style: string | object;      // Task bar inline styles
    wrapperCls: DomClassList;    // Wrapper element classes
    iconCls: DomClassList;       // Icon element classes
}
```

### EventRenderData Structure (Scheduler)

```typescript
type EventRenderData = {
    eventRecord: EventModel;
    resourceRecord: ResourceModel;
    assignmentRecord: AssignmentModel;
    startMS: number;          // Start time in milliseconds
    endMS: number;            // End time in milliseconds
    height: number;           // Calculated element height
    width: number;            // Calculated element width
    top: number;              // Position from row top
    left: number;             // Position from row left
};
```

### Task vs Cell Rendering Pipeline Comparison

| Aspect | Grid Cells | Task Bars |
|--------|------------|-----------|
| Data Source | Record fields | TaskModel dates/duration |
| Position Calculation | Column layout | Time-to-pixel conversion |
| Size | Column width, row height | Duration-to-width, configured height |
| Recycling | Per-row recycling | Event element pooling |
| Renderer | `column.renderer` | `gantt.taskRenderer` |
| Styling | `cellCls`, `cellElement.style` | `renderData.cls/style` |

### TimeAxisColumn

The special column that renders the Gantt timeline:

```typescript
class TimeAxisColumn {
    // Renders task bars, dependencies, time axis
    // Uses separate rendering pipeline from grid cells
    // Handles horizontal scrolling of timeline
}
```

**Timeline Rendering Steps:**

1. **Calculate Visible Time Range**: Based on scroll position
2. **Query Visible Tasks**: Tasks intersecting visible range
3. **Calculate Task Positions**: Start/end dates to pixels
4. **Render Task Elements**: Apply taskRenderer
5. **Render Dependencies**: SVG lines between tasks
6. **Render Time Header**: Ticks, labels

---

## Complete Rendering Pipeline

### Data to DOM Flow

```
1. Data Layer
   +-- Store contains records
   +-- Record changes trigger events

2. Virtual Layer
   +-- RowManager calculates visible range
   +-- Row objects assigned to records
   +-- Position calculations

3. Rendering Layer
   +-- Column renderers called
   +-- DomConfig/HTML generated
   +-- Cell elements updated

4. DOM Layer
   +-- Elements positioned via CSS transforms
   +-- Content synced to DOM
   +-- Styles applied

5. Paint Layer (Browser)
   +-- Layout calculated
   +-- Pixels painted to screen
```

### Rendering Lifecycle

```
Grid Initialization
    |
    v
Create RowManager
    |
    v
Create Row Pool
    |
    v
Initial Render
    |
    +---> Calculate visible records
    |
    +---> For each visible record:
    |         |
    |         +-- Assign to Row object
    |         |
    |         +-- For each column:
    |         |       |
    |         |       +-- Call renderer()
    |         |       +-- Update cell content
    |         |
    |         +-- Position row element
    |
    v
Await User Interaction
    |
    +---> Scroll Event
    |         |
    |         +-- Recalculate visible range
    |         +-- Recycle out-of-view rows
    |         +-- Render new visible rows
    |
    +---> Data Change Event
    |         |
    |         +-- Identify affected rows
    |         +-- Re-render affected cells/rows
    |
    +---> Resize Event
              |
              +-- Recalculate row pool size
              +-- Add/remove rows as needed
```

---

## Performance Optimization Tips

### Best Practices

1. **Use fixedRowHeight when possible**
   ```typescript
   { fixedRowHeight: true, rowHeight: 45 }
   ```

2. **Minimize renderer complexity**
   ```typescript
   // Good: Simple, fast renderer
   renderer: ({ value }) => value

   // Avoid: Complex DOM manipulation
   renderer: ({ cellElement }) => {
       // Don't do complex DOM queries here
   }
   ```

3. **Use DomConfig over HTML strings**
   ```typescript
   // Better: Declarative DomConfig
   renderer: () => ({ tag: 'span', text: value })

   // Worse: String concatenation
   renderer: () => `<span>${value}</span>`
   ```

4. **Batch updates with suspend/resume**
   ```typescript
   grid.suspendRefresh();
   records.forEach(r => r.set('field', value));
   grid.resumeRefresh(true);
   ```

5. **Avoid autoHeight with large datasets**
   - Use fixed heights where possible
   - Consider virtual scrolling limitations

6. **Use column-specific refresh**
   ```typescript
   // Refresh only affected column
   column.refreshCells();

   // Instead of full grid refresh
   grid.renderRows();
   ```

---

## References

- Bryntum Grid API: `Grid/view/GridBase`
- Row Class: `Grid/row/Row`
- Column Class: `Grid/column/Column`
- SubGrid Class: `Grid/view/SubGrid`
- Gantt TaskRenderer: `Gantt/view/GanttBase#config-taskRenderer`
- LockRows Feature: `Grid/feature/LockRows`
- Split Feature: `Grid/feature/Split`
