# Grid Implementation: Clipboard

> **Clipboard** voor kopiëren en plakken van cellen en rijen.

---

## Overzicht

Bryntum Grid ondersteunt clipboard operaties voor efficiënte data manipulatie.

```
+--------------------------------------------------------------------------+
| GRID                                        [Ctrl+C Copy] [Ctrl+V Paste] |
+--------------------------------------------------------------------------+
|  #  |  Name        |  Status     |  Priority   |  Due Date   | Actions  |
+--------------------------------------------------------------------------+
|  1  |  Task A      |  Active     |  High       |  Jan 15     |  ✓ Copy  |
|  2  |  Task B      |  Pending    |  Medium     |  Jan 20     |  ✓ Paste |
|  3  |  ████████████████████████████████████████████████████████ Selected|
|  4  |  Task D      |  Done       |  Low        |  Jan 30     |          |
+--------------------------------------------------------------------------+
|                                                                          |
|  CLIPBOARD FEATURES:                                                     |
|    - Ctrl+C: Copy selected cells/rows                                    |
|    - Ctrl+V: Paste clipboard content                                     |
|    - Ctrl+X: Cut selected cells/rows                                     |
|    - Multi-cell selection and paste                                      |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Clipboard Setup

### 1.1 Enable Clipboard Feature

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        cellCopyPaste: true  // Enable cell copy/paste
    },

    columns: [
        { text: 'Name', field: 'name', width: 200 },
        { text: 'Status', field: 'status', width: 120 },
        { text: 'Priority', field: 'priority', width: 100 },
        { text: 'Due Date', field: 'dueDate', type: 'date', width: 120 }
    ],

    data: [
        { id: 1, name: 'Task A', status: 'Active', priority: 'High', dueDate: '2024-01-15' },
        { id: 2, name: 'Task B', status: 'Pending', priority: 'Medium', dueDate: '2024-01-20' },
        { id: 3, name: 'Task C', status: 'Done', priority: 'Low', dueDate: '2024-01-25' }
    ]
});
```

---

## 2. Advanced Configuration

### 2.1 Custom Copy/Paste Behavior

```javascript
features: {
    cellCopyPaste: {
        // Called before copying
        beforeCopy({ source, cellsToCopy }) {
            console.log('Copying cells:', cellsToCopy);
            return true;  // Return false to prevent copy
        },

        // Called before pasting
        beforePaste({ source, cells, targetCell }) {
            console.log('Pasting to:', targetCell);
            return true;  // Return false to prevent paste
        },

        // Custom copy data transformer
        transformCopyData(cells) {
            return cells.map(cell => ({
                ...cell,
                value: String(cell.value).toUpperCase()
            }));
        }
    }
}
```

### 2.2 Row Copy/Paste

```javascript
features: {
    rowCopyPaste: {
        // Enable row copy/paste
        copyRows: true,
        pasteRows: true,

        // Generate new IDs for pasted rows
        generateNewId: true,

        // Custom processing
        processPastedRecords(records) {
            return records.map(record => ({
                ...record.data,
                name: `${record.name} (Copy)`,
                status: 'New'
            }));
        }
    }
}
```

---

## 3. Programmatic Control

### 3.1 Copy and Paste Methods

```javascript
// Copy selected cells
function copySelection() {
    grid.features.cellCopyPaste.copySelection();
}

// Paste from clipboard
function pasteClipboard() {
    grid.features.cellCopyPaste.pasteSelection();
}

// Cut selected cells
function cutSelection() {
    grid.features.cellCopyPaste.cutSelection();
}

// Copy specific cells
function copyCells(cells) {
    grid.features.cellCopyPaste.copy(cells);
}

// Listen for copy/paste events
grid.on({
    copy({ source, cells, text }) {
        console.log('Copied:', text);
    },

    paste({ source, cells, text }) {
        console.log('Pasted:', text);
    }
});
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useRef, useMemo, useCallback } from 'react';

function ClipboardGrid({ data }) {
    const gridRef = useRef(null);

    const handleCopy = useCallback(() => {
        const grid = gridRef.current?.instance;
        grid?.features.cellCopyPaste?.copySelection();
    }, []);

    const handlePaste = useCallback(() => {
        const grid = gridRef.current?.instance;
        grid?.features.cellCopyPaste?.pasteSelection();
    }, []);

    const handleCut = useCallback(() => {
        const grid = gridRef.current?.instance;
        grid?.features.cellCopyPaste?.cutSelection();
    }, []);

    const gridConfig = useMemo(() => ({
        features: {
            cellCopyPaste: {
                beforeCopy({ cellsToCopy }) {
                    console.log(`Copying ${cellsToCopy.length} cells`);
                    return true;
                },
                beforePaste({ targetCell }) {
                    console.log('Pasting to:', targetCell);
                    return true;
                }
            }
        },

        columns: [
            { text: 'Name', field: 'name', width: 200 },
            { text: 'Status', field: 'status', width: 120 },
            { text: 'Priority', field: 'priority', width: 100 }
        ],

        selectionMode: {
            cell: true,
            multiSelect: true
        }
    }), []);

    return (
        <div className="clipboard-grid">
            <div className="toolbar">
                <button onClick={handleCopy}>
                    <i className="fa fa-copy"></i> Copy (Ctrl+C)
                </button>
                <button onClick={handleCut}>
                    <i className="fa fa-cut"></i> Cut (Ctrl+X)
                </button>
                <button onClick={handlePaste}>
                    <i className="fa fa-paste"></i> Paste (Ctrl+V)
                </button>
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

## 5. Styling

```css
/* Clipboard selection */
.b-grid-cell.b-clipboard-source {
    background: rgba(33, 150, 243, 0.1) !important;
    outline: 2px dashed #2196F3 !important;
}

/* Paste target */
.b-grid-cell.b-clipboard-target {
    background: rgba(76, 175, 80, 0.1) !important;
    outline: 2px solid #4CAF50 !important;
}

/* Cut selection */
.b-grid-cell.b-cut-selection {
    opacity: 0.5;
    background: rgba(255, 152, 0, 0.1) !important;
}

/* Toolbar */
.toolbar {
    display: flex;
    gap: 8px;
    padding: 12px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.toolbar button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid #e0e0e0;
    background: white;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
}

.toolbar button:hover {
    background: #e3f2fd;
    border-color: #2196F3;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Copy werkt niet | Feature niet enabled | Enable cellCopyPaste feature |
| Paste niet zichtbaar | Geen selectie | Selecteer target cel eerst |
| Data verloren | Cut zonder paste | Gebruik undo of refreshData |
| Keyboard werkt niet | Focus niet op grid | Klik eerst op grid |

---

## API Reference

### Clipboard Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `cellCopyPaste` | Boolean/Object | Enable cell copy/paste |
| `rowCopyPaste` | Boolean/Object | Enable row copy/paste |

### Events

| Event | Description |
|-------|-------------|
| `copy` | Fired after copying |
| `paste` | Fired after pasting |
| `cut` | Fired after cutting |
| `beforeCopy` | Fired before copying |
| `beforePaste` | Fired before pasting |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Copy selection |
| `Ctrl+X` | Cut selection |
| `Ctrl+V` | Paste clipboard |
| `Ctrl+A` | Select all |

---

## Bronnen

- **Feature**: `Grid.feature.CellCopyPaste`
- **Row Copy/Paste**: `Grid.feature.RowCopyPaste`

---

*Priority 2: Medium Priority Features*
