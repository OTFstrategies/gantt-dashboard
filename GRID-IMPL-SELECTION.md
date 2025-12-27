# Grid Implementation: Selection Modes

> **Selection Modes** voor het configureren van cel-, rij-, en kolom-selectie.

---

## Overzicht

Bryntum Grid biedt uitgebreide selectie-opties voor cellen, rijen en kolommen.

```
+--------------------------------------------------------------------------+
| GRID                                                                      |
+--------------------------------------------------------------------------+
| SELECTABLES           | FEATURES              | CHECKBOX                 |
| [x] Cell              | [x] Multi-select      | [ ] Checkbox             |
| [ ] Column            | [x] Drag select       | [ ] Checkbox only        |
| [x] Row number        | [x] Select on nav     | [ ] Show check all       |
+--------------------------------------------------------------------------+
|  #  |  Name        | Age  | City      | Food    | Color                  |
+--------------------------------------------------------------------------+
|  1  | ■ John Doe   | 32   | Paris     | Pizza   | Orange                 |
|  2  | ■ Jane Smith | 28   | London    | Sushi   | Purple                 |
|  3  |   Bob Wilson | 45   | Berlin    | Pasta   | Blue                   |
|  4  |   Alice Brown| 35   | New York  | Salad   | Green                  |
+--------------------------------------------------------------------------+
|                                                                          |
|  Current selection:                                                       |
|  2 records / 2 rows                                                      |
|  1-2                                                                      |
|  4 cells                                                                  |
|  0:0-1:1                                                                  |
+--------------------------------------------------------------------------+

SELECTION TYPES:
  ■ = Selected row    [Cell] = Selected cell    Column highlight
```

---

## 1. Basic Selection Setup

### 1.1 Configure Selection Mode

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

new Grid({
    appendTo: 'container',

    features: {
        group: true,
        filter: true,
        cellEdit: false,
        rowCopyPaste: false
    },

    selectionMode: {
        cell: true,           // Enable cell selection
        dragSelect: true,     // Enable drag selection
        rowNumber: true       // Enable row number selection
    },

    columns: [
        { text: 'Name', field: 'name', flex: 2 },
        { text: 'Age', field: 'age', width: 100, type: 'number' },
        { text: 'City', field: 'city', flex: 1 },
        { text: 'Food', field: 'food', flex: 1 },
        { text: 'Color', field: 'color', flex: 1 }
    ],

    data: DataGenerator.generateData(50)
});
```

---

## 2. Selection Mode Options

### 2.1 Selectables

```javascript
selectionMode: {
    // Enable cell selection (takes precedence over row)
    cell: true,

    // Enable column selection (requires cell: true)
    column: true,

    // Add row number column for row selection
    rowNumber: true
}
```

### 2.2 Features

```javascript
selectionMode: {
    // Allow multiple selection with Ctrl/Shift
    multiSelect: true,

    // Enable drag selection (requires multiSelect)
    dragSelect: true,

    // Select on keyboard navigation
    selectOnKeyboardNavigation: true
}
```

### 2.3 Checkbox Selection

```javascript
selectionMode: {
    // Add checkbox column
    checkbox: true,

    // Only select via checkbox
    checkboxOnly: true,

    // Show select all checkbox in header
    showCheckAll: true,

    // Show checkbox in group header rows
    showCheckAllInGroupRows: true
}
```

### 2.4 Additional Settings

```javascript
selectionMode: {
    // Deselect when clicking selected row/cell
    deselectOnClick: true,

    // Deselect records when filtered out
    deselectFilteredOutRecords: true,

    // Always use multi-select behavior
    alwaysMultiSelect: true,

    // Select record when selecting cell
    selectRecordOnCell: true
}
```

---

## 3. Interactive Toolbar

### 3.1 Toggle Configuration

```javascript
const btnCfg = {
    type: 'slidetoggle',
    onChange({ checked, source }) {
        source.up('grid').selectionMode[source.ref] = checked;
    }
};

tbar: {
    items: {
        selectables: {
            type: 'fieldset',
            label: 'Selectables',
            labelPosition: 'above',
            gridColumns: 2,
            items: {
                cell: {
                    text: 'Cell',
                    checked: true,
                    tooltip: 'selectionMode.cell - Toggles cell selection',
                    ...btnCfg
                },
                column: {
                    text: 'Column',
                    tooltip: 'selectionMode.column - Enables column selection',
                    ...btnCfg
                },
                rowNumber: {
                    text: 'Row number',
                    checked: true,
                    tooltip: 'selectionMode.rowNumber - Adds RowNumberColumn',
                    ...btnCfg
                }
            }
        },
        features: {
            type: 'fieldset',
            label: 'Features',
            labelPosition: 'above',
            items: {
                multiSelect: {
                    text: 'Multi-select',
                    checked: true,
                    ...btnCfg
                },
                dragSelect: {
                    text: 'Drag select',
                    checked: true,
                    ...btnCfg
                }
            }
        }
    }
}
```

---

## 4. Selection Events

### 4.1 Listen for Selection Changes

```javascript
listeners: {
    selectionModeChange(selectionMode) {
        // Update UI when selection mode changes
        console.log('Selection mode changed:', selectionMode);
    },

    selectionChange() {
        const { selectedRows, selectedCells, selectedRecords } = this;

        console.log(`${selectedRecords.length} records selected`);
        console.log(`${selectedRows.length} rows selected`);
        console.log(`${selectedCells.length} cells selected`);
    }
}
```

### 4.2 Display Selection Info

```javascript
selectionChange() {
    const { selectedRows, selectedCells, selectedRecords } = this;

    // Count display
    const recordText = `${selectedRecords.length} record${selectedRecords.length !== 1 ? 's' : ''}`;
    const rowText = `${selectedRows.length} row${selectedRows.length !== 1 ? 's' : ''}`;
    const cellText = `${selectedCells.length} cell${selectedCells.length !== 1 ? 's' : ''}`;

    // Calculate ranges
    const sortedRecords = selectedRecords.sort((a, b) => a.id - b.id);
    let recordSelection = '';
    let isRange = false;

    for (let i = 0; i < sortedRecords.length; i++) {
        const curId = sortedRecords[i].id;
        if (i === 0) {
            recordSelection = curId;
        } else {
            const prevId = sortedRecords[i - 1].id;
            if (curId === prevId + 1) {
                if (i === sortedRecords.length - 1) {
                    recordSelection += '-' + curId;
                }
                isRange = true;
            } else {
                if (isRange) {
                    recordSelection += '-' + prevId;
                    isRange = false;
                }
                recordSelection += ',' + curId;
            }
        }
    }

    console.log(`${recordText} / ${rowText}: ${recordSelection}`);
    console.log(cellText);
}
```

---

## 5. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useState, useRef, useCallback } from 'react';

function SelectableGrid({ data }) {
    const gridRef = useRef(null);
    const [selectionMode, setSelectionMode] = useState({
        cell: true,
        dragSelect: true,
        rowNumber: true,
        multiSelect: true
    });
    const [selectionInfo, setSelectionInfo] = useState({
        records: 0,
        rows: 0,
        cells: 0
    });

    const updateSelectionMode = useCallback((key, value) => {
        setSelectionMode(prev => ({ ...prev, [key]: value }));
        const grid = gridRef.current?.instance;
        if (grid) {
            grid.selectionMode[key] = value;
        }
    }, []);

    const handleSelectionChange = useCallback(({ source }) => {
        setSelectionInfo({
            records: source.selectedRecords.length,
            rows: source.selectedRows.length,
            cells: source.selectedCells.length
        });
    }, []);

    const gridConfig = {
        selectionMode,

        columns: [
            { text: 'Name', field: 'name', flex: 2 },
            { text: 'Age', field: 'age', width: 100, type: 'number' },
            { text: 'City', field: 'city', flex: 1 },
            { text: 'Food', field: 'food', flex: 1 },
            { text: 'Color', field: 'color', flex: 1 }
        ],

        features: {
            group: true,
            filter: true
        },

        listeners: {
            selectionChange: handleSelectionChange
        }
    };

    return (
        <div className="selectable-grid">
            <div className="toolbar">
                <fieldset>
                    <legend>Selectables</legend>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectionMode.cell}
                            onChange={(e) => updateSelectionMode('cell', e.target.checked)}
                        />
                        Cell
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectionMode.rowNumber}
                            onChange={(e) => updateSelectionMode('rowNumber', e.target.checked)}
                        />
                        Row number
                    </label>
                </fieldset>
                <fieldset>
                    <legend>Features</legend>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectionMode.multiSelect}
                            onChange={(e) => updateSelectionMode('multiSelect', e.target.checked)}
                        />
                        Multi-select
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectionMode.dragSelect}
                            onChange={(e) => updateSelectionMode('dragSelect', e.target.checked)}
                        />
                        Drag select
                    </label>
                </fieldset>
                <div className="selection-info">
                    <strong>Selection:</strong>
                    {selectionInfo.records} records, {selectionInfo.cells} cells
                </div>
            </div>

            <BryntumGrid
                ref={gridRef}
                data={data}
                {...gridConfig}
            />
        </div>
    );
}
```

---

## 6. Styling

```css
/* Selected row */
.b-grid-row.b-selected {
    background: #e3f2fd;
}

.b-grid-row.b-selected:hover {
    background: #bbdefb;
}

/* Selected cell */
.b-grid-cell.b-selected {
    background: #1976d2;
    color: white;
}

/* Checkbox column */
.b-checkbox-selection .b-checkbox {
    width: 18px;
    height: 18px;
}

/* Row number column */
.b-rownumber-cell {
    cursor: pointer;
    user-select: none;
}

.b-rownumber-cell:hover {
    background: #e0e0e0;
}

/* Drag selection box */
.b-drag-selection-box {
    background: rgba(25, 118, 210, 0.1);
    border: 1px dashed #1976d2;
}

/* Column selection highlight */
.b-grid-header.b-column-selected {
    background: #e3f2fd;
}

/* Selection info panel */
.selection-info {
    padding: 8px 16px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 14px;
}

/* Toolbar fieldsets */
.toolbar fieldset {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 8px 12px;
    margin: 0 8px;
}

.toolbar fieldset legend {
    font-size: 12px;
    font-weight: bold;
    color: #666;
}

.toolbar label {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 4px 0;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Cell selectie werkt niet | cell: false | Zet selectionMode.cell: true |
| Multi-select werkt niet | multiSelect: false | Zet multiSelect: true |
| Drag select werkt niet | Mist multiSelect | Enable beide options |
| Checkbox mist | checkbox: false | Zet checkbox: true |
| Column select werkt niet | cell: false | Requires cell: true |

---

## API Reference

### SelectionMode Config

| Property | Type | Description |
|----------|------|-------------|
| `cell` | Boolean | Enable cell selection |
| `column` | Boolean | Enable column selection |
| `rowNumber` | Boolean | Add row number column |
| `checkbox` | Boolean | Add checkbox column |
| `checkboxOnly` | Boolean | Only via checkbox |
| `showCheckAll` | Boolean | Header checkbox |
| `multiSelect` | Boolean | Multiple selection |
| `dragSelect` | Boolean | Drag to select |
| `selectOnKeyboardNavigation` | Boolean | Select on nav |
| `deselectOnClick` | Boolean | Click to deselect |
| `alwaysMultiSelect` | Boolean | Always multi mode |
| `selectRecordOnCell` | Boolean | Record on cell select |

### Selection Properties

| Property | Type | Description |
|----------|------|-------------|
| `selectedRecords` | Model[] | Selected records |
| `selectedRows` | Object[] | Selected rows |
| `selectedCells` | Object[] | Selected cells |
| `selectedRecord` | Model | First selected record |

### Selection Events

| Event | Description |
|-------|-------------|
| `selectionChange` | Selection changed |
| `selectionModeChange` | Mode config changed |

---

## Bronnen

- **Example**: `examples/selection/`
- **SelectionModel**: `Grid.selection.SelectionModel`

---

*Priority 2: Medium Priority Features*
