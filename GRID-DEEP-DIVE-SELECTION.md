# Grid Deep Dive: Selection

> **Uitgebreide analyse** van het Bryntum Grid selectie-systeem: row selection, cell selection, checkbox selection, drag select, en keyboard navigatie.

---

## Overzicht

Grid Selection wordt geconfigureerd via de `selectionMode` property. Het systeem ondersteunt:
- **Row selection** - Hele rijen selecteren
- **Cell selection** - Individuele cellen selecteren
- **Column selection** - Hele kolommen selecteren
- **Checkbox selection** - Checkbox kolom voor selectie
- **Drag selection** - Slepen om meerdere items te selecteren
- **Keyboard selection** - Pijltjes + Shift voor selectie

---

## 1. SelectionMode Configuration

### 1.1 Type Definitie

```typescript
type GridSelectionMode = {
    // Selectie types
    cell?: boolean;                          // Cell selection
    row?: boolean;                           // Row selection
    column?: boolean;                        // Column selection

    // Multi-select
    multiSelect?: boolean;                   // Ctrl/Shift multi-select
    alwaysMultiSelect?: boolean;             // Multi-select without modifier
    dragSelect?: boolean;                    // Drag to select

    // Checkbox
    checkbox?: boolean | CheckColumnConfig;  // Checkbox column
    checkboxIndex?: number | string;         // Checkbox position
    checkboxOnly?: boolean;                  // Only select via checkbox
    showCheckAll?: boolean;                  // Header check all
    showCheckAllInGroupRows?: boolean;       // Group header checkboxes

    // Row number
    rowNumber?: boolean;                     // RowNumber column select

    // Behavior
    selectOnKeyboardNavigation?: boolean;    // Select on arrow keys
    deselectOnClick?: boolean;               // Deselect when clicking selected
    deselectFilteredOutRecords?: boolean;    // Deselect when filtered out
    selectRecordOnCell?: boolean;            // Also select record on cell select

    // Tree
    includeChildren?: boolean | 'always';    // Select children with parent
    includeParents?: boolean | 'some' | 'all'; // Select parent when children selected
}
```

### 1.2 Basic Configuration

```javascript
const grid = new Grid({
    selectionMode: {
        cell       : true,
        dragSelect : true,
        rowNumber  : true
    }
});
```

---

## 2. Row Selection

### 2.1 Enable Row Selection

```javascript
selectionMode: {
    row        : true,
    multiSelect: true
}
```

### 2.2 Programmatic Selection

```javascript
// Select single record
grid.selectRecord(record);
grid.selectRecord(recordId);

// Select multiple records
grid.selectRecords([record1, record2]);

// Deselect
grid.deselectRecord(record);
grid.deselectAll();

// Toggle
grid.toggleRecordSelection(record);
```

### 2.3 Access Selected Rows

```javascript
// Selected records (Model instances)
const records = grid.selectedRecords;

// Selected rows (Row instances)
const rows = grid.selectedRows;

// Check if selected
const isSelected = grid.isSelected(record);
```

---

## 3. Cell Selection

### 3.1 Enable Cell Selection

```javascript
selectionMode: {
    cell       : true,
    multiSelect: true,
    dragSelect : true
}
```

### 3.2 Programmatic Cell Selection

```javascript
// Select single cell
grid.selectCell({
    record : record,
    column : grid.columns.get('name')
});

// OR with indices
grid.selectCell({
    rowIndex   : 5,
    columnIndex: 2
});

// Deselect cell
grid.deselectCell(cellSelector);

// Deselect all
grid.deselectAll();
```

### 3.3 Access Selected Cells

```javascript
// Selected cells (GridLocation instances)
const cells = grid.selectedCells;

// Last selected cell
const lastCell = grid.selectedCell;

// Cell info
cells.forEach(cell => {
    console.log(cell.record);       // Record
    console.log(cell.column);       // Column
    console.log(cell.rowIndex);     // Row index
    console.log(cell.columnIndex);  // Column index
});
```

---

## 4. Column Selection

### 4.1 Enable Column Selection

```javascript
selectionMode: {
    cell       : true,    // Required
    column     : true,
    multiSelect: true     // Required for column selection
}

// Selecteer kolom door op header te klikken
```

---

## 5. Checkbox Selection

### 5.1 Basic Checkbox

```javascript
selectionMode: {
    checkbox: true
}
```

### 5.2 Checkbox Column Configuration

```javascript
selectionMode: {
    checkbox: {
        checkCls : 'b-my-checkbox',  // Custom CSS class
        width    : 50
    }
}
```

### 5.3 Checkbox Positioning

```javascript
selectionMode: {
    checkbox      : true,
    checkboxIndex : 0,               // First column
    // OF
    checkboxIndex : 'name'           // After 'name' column
}
```

### 5.4 Select All Header

```javascript
selectionMode: {
    checkbox    : true,
    showCheckAll: true               // Adds check-all in header
}
```

### 5.5 Group Header Checkboxes

```javascript
features: {
    group: 'city'
},
selectionMode: {
    checkbox                : true,
    showCheckAllInGroupRows : true   // Checkbox per group
}
```

### 5.6 Checkbox Only Mode

```javascript
selectionMode: {
    cell         : false,    // Disable cell selection
    checkbox     : true,
    checkboxOnly : true      // Only select via checkbox
}
```

---

## 6. Row Number Selection

### 6.1 Configuration

```javascript
selectionMode: {
    rowNumber: true          // Adds RowNumberColumn that selects row on click
}
```

---

## 7. Drag Selection

### 7.1 Enable Drag Selection

```javascript
selectionMode: {
    cell       : true,
    multiSelect: true,
    dragSelect : true
}
```

### 7.2 Drag Selection Event

```javascript
listeners: {
    dragSelecting({ selectedCells, selectedRecords }) {
        console.log('Currently dragging over:', selectedRecords.length);
    }
}
```

---

## 8. Keyboard Selection

### 8.1 Configuration

```javascript
selectionMode: {
    selectOnKeyboardNavigation: true   // Default: true
}

// Shift + Arrow keys = extend selection
// Ctrl + Click = toggle selection
// Shift + Click = range selection
```

---

## 9. Multi-Select Options

### 9.1 Standard Multi-Select

```javascript
selectionMode: {
    multiSelect: true
}

// Ctrl + Click = add/remove from selection
// Shift + Click = range selection
```

### 9.2 Always Multi-Select

```javascript
selectionMode: {
    multiSelect      : true,
    alwaysMultiSelect: true    // No Ctrl needed
}
```

### 9.3 Deselect on Click

```javascript
selectionMode: {
    deselectOnClick: true      // Click selected to deselect
}
```

---

## 10. Tree Selection

### 10.1 Include Children

```javascript
selectionMode: {
    checkbox        : true,
    includeChildren : true     // Select children when parent selected
    // OF
    includeChildren : 'always' // Always include (not just via checkbox)
}
```

### 10.2 Include Parents

```javascript
selectionMode: {
    checkbox       : true,
    includeParents : true      // Select parent when ALL children selected
    // OF
    includeParents : 'some'    // Select parent when SOME children selected
    // OF
    includeParents : 'all'     // Same as true
}
```

---

## 11. Filter Behavior

```javascript
selectionMode: {
    deselectFilteredOutRecords: true   // Deselect when record filtered out
}
```

---

## 12. Selection Events

### 12.1 Selection Change

```javascript
listeners: {
    selectionChange({
        action,          // 'select' | 'deselect'
        mode,            // 'row' | 'cell'
        selected,        // Records selected in this operation
        deselected,      // Records deselected
        selection,       // All selected records
        selectedCells,   // Cells selected
        deselectedCells, // Cells deselected
        cellSelection    // All selected cells
    }) {
        console.log(`${action}: ${selected.length} records`);
    }
}
```

### 12.2 Before Selection Change

```javascript
listeners: {
    beforeSelectionChange({
        action,
        mode,
        selected,
        deselected,
        selection
    }) {
        // Return false to prevent selection
        if (someCondition) {
            return false;
        }
    }
}
```

### 12.3 Selection Mode Change

```javascript
listeners: {
    selectionModeChange({ selectionMode }) {
        console.log('New selection mode:', selectionMode);
    }
}
```

---

## 13. API Methods

### 13.1 Selection Methods

```javascript
// Records
grid.selectRecord(record, scrollIntoView, addToSelection);
grid.selectRecords(records);
grid.deselectRecord(record);
grid.deselectRecords(records);
grid.deselectAll(removeCurrentRecordsOnly, silent);
grid.toggleRecordSelection(record);
grid.isSelected(record);

// Cells
grid.selectCell(cellSelector, scrollIntoView, addToSelection);
grid.deselectCell(cellSelector);

// Range
grid.selectRange(fromRecord, toRecord);

// All
grid.selectAll();
grid.deselectAll();
```

### 13.2 Properties

```javascript
// Records
grid.selectedRecords        // Model[]
grid.selectedRecord         // Model (last selected)
grid.selectedRows           // Row[]

// Cells
grid.selectedCells          // GridLocation[]
grid.selectedCell           // GridLocation (last selected)

// Check
grid.isSelected(record)     // boolean
```

---

## 14. Column Configuration

### 14.1 Selectable Column

```javascript
{
    field      : 'name',
    selectable : false        // Exclude from selection
}
```

### 14.2 Selection Column Styling

```javascript
{
    field   : 'name',
    cellCls : 'selection-highlight'
}

// CSS
.b-selected .selection-highlight {
    background: var(--b-selection-color);
}
```

---

## 15. Checkbox Column Type

### 15.1 Manual Checkbox Column

```javascript
{
    type    : 'check',
    field   : 'selected',       // Bound to data field
    checkCls: 'my-checkbox'
}

// Note: Dit is ANDERS dan selection checkbox!
// Selection checkbox is niet gebonden aan data
```

### 15.2 Selection vs Data Checkbox

```javascript
// Selection checkbox (via selectionMode)
selectionMode: {
    checkbox: true              // Niet gebonden aan data
}

// Data checkbox (column type)
columns: [
    { type: 'check', field: 'done' }  // Gebonden aan 'done' field
]
```

---

## 16. Styling

### 16.1 Selected Row CSS

```css
/* Selected row */
.b-grid-row.b-selected {
    background-color: var(--b-selection-background);
}

/* Selected cell */
.b-grid-cell.b-selected {
    background-color: var(--b-cell-selection-background);
    outline: 2px solid var(--b-selection-color);
}

/* Checkbox column */
.b-check-cell .b-checkbox {
    --checkbox-color: var(--b-primary-color);
}
```

### 16.2 CSS Variables

```css
:root {
    --b-selection-color: #4287f5;
    --b-selection-background: rgba(66, 135, 245, 0.1);
    --b-cell-selection-background: rgba(66, 135, 245, 0.2);
}
```

---

## 17. TypeScript Interfaces

```typescript
interface GridSelectionMode {
    cell?: boolean;
    row?: boolean;
    column?: boolean;
    multiSelect?: boolean;
    alwaysMultiSelect?: boolean;
    dragSelect?: boolean;
    checkbox?: boolean | CheckColumnConfig;
    checkboxIndex?: number | string;
    checkboxOnly?: boolean;
    showCheckAll?: boolean;
    showCheckAllInGroupRows?: boolean;
    rowNumber?: boolean;
    selectOnKeyboardNavigation?: boolean;
    deselectOnClick?: boolean;
    deselectFilteredOutRecords?: boolean;
    selectRecordOnCell?: boolean;
    includeChildren?: boolean | 'always';
    includeParents?: boolean | 'some' | 'all';
}

interface SelectionChangeEvent {
    action: 'select' | 'deselect';
    mode: 'row' | 'cell';
    source: Grid;
    selected: Model[];
    deselected: Model[];
    selection: Model[];
    selectedCells: GridLocation[];
    deselectedCells: GridLocation[];
    cellSelection: GridLocation[];
}

interface GridLocation {
    record: Model;
    column: Column;
    rowIndex: number;
    columnIndex: number;
    cell: HTMLElement;
    row: Row;
}
```

---

## 18. Complete Example

```javascript
const grid = new Grid({
    appendTo: 'container',

    features: {
        group : 'city',
        filter: true
    },

    selectionMode: {
        // Enable cell + row selection
        cell       : true,
        rowNumber  : true,

        // Multi-select
        multiSelect: true,
        dragSelect : true,

        // Checkbox
        checkbox    : true,
        showCheckAll: true,
        showCheckAllInGroupRows: true,

        // Behavior
        selectOnKeyboardNavigation: true,
        deselectOnClick           : false,
        selectRecordOnCell        : true
    },

    columns: [
        { text: 'Name', field: 'name', flex: 1 },
        { text: 'Age', field: 'age', width: 100 },
        { text: 'City', field: 'city', flex: 1 }
    ],

    data: [...],

    listeners: {
        selectionChange({ action, mode, selected, selection }) {
            console.log(`${action} ${mode}: now ${selection.length} selected`);
        }
    }
});

// Programmatic selection
grid.selectRecords(grid.store.getRange(0, 5));
```

---

## Referenties

- Examples: `grid-7.1.0-trial/examples/selection/`
- TypeScript: `grid.d.ts` lines 1858-1920 (GridSelectionMode)
- TypeScript: `grid.d.ts` lines 148447-148590 (GridSelection mixin)

---

*Document gegenereerd: December 2024*
*Bryntum Grid versie: 7.1.0*
