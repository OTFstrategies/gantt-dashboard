# Grid Implementation: Column Reorder

> **Column Reorder** voor het herschikken van kolommen door drag & drop.

---

## Overzicht

Bryntum Grid ondersteunt drag & drop kolom herschikking.

```
+--------------------------------------------------------------------------+
| GRID                                                                      |
+--------------------------------------------------------------------------+
|  Name  ↔  Status  ↔  Priority  ↔  Due Date  ↔  Actions                   |
|  ▲                    ▲                                                   |
|  │    ← Drag to →    │                                                    |
|  └──────────────────┘                                                     |
+--------------------------------------------------------------------------+
|  Task A   |  Active    |  High       |  Jan 15     |  Edit               |
|  Task B   |  Pending   |  Medium     |  Jan 20     |  Edit               |
+--------------------------------------------------------------------------+
|                                                                          |
|  COLUMN REORDER FEATURES:                                                |
|    - Drag column headers to reorder                                      |
|    - Visual drop indicators                                              |
|    - Locked column regions                                               |
|    - Persist column order                                                |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Column Reorder Setup

### 1.1 Enable Column Reorder

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        columnReorder: true  // Enabled by default
    },

    columns: [
        { text: 'Name', field: 'name', width: 200 },
        { text: 'Status', field: 'status', width: 120 },
        { text: 'Priority', field: 'priority', width: 100 },
        { text: 'Due Date', field: 'dueDate', type: 'date', width: 120 }
    ],

    data: [
        { id: 1, name: 'Task A', status: 'Active', priority: 'High', dueDate: '2024-01-15' },
        { id: 2, name: 'Task B', status: 'Pending', priority: 'Medium', dueDate: '2024-01-20' }
    ]
});
```

---

## 2. Advanced Configuration

### 2.1 Restrict Reordering

```javascript
features: {
    columnReorder: {
        // Only allow reorder within same region
        lockColumnRegions: true
    }
},

columns: [
    // Locked columns (cannot be reordered with unlocked)
    { text: 'ID', field: 'id', width: 60, locked: true, draggable: false },
    { text: 'Name', field: 'name', width: 200, locked: true },

    // Unlocked columns (can be reordered among themselves)
    { text: 'Status', field: 'status', width: 120 },
    { text: 'Priority', field: 'priority', width: 100 },
    { text: 'Due Date', field: 'dueDate', type: 'date', width: 120 }
]
```

### 2.2 Non-Draggable Columns

```javascript
columns: [
    // Not draggable
    { text: 'ID', field: 'id', width: 60, draggable: false },

    // Draggable (default)
    { text: 'Name', field: 'name', width: 200 },
    { text: 'Status', field: 'status', width: 120 },

    // Not draggable - actions column stays at end
    { text: 'Actions', field: 'actions', width: 100, draggable: false }
]
```

---

## 3. Event Handling

### 3.1 Listen to Reorder Events

```javascript
grid.on({
    beforeColumnDragStart({ column }) {
        console.log('Starting to drag:', column.text);
        // Return false to prevent drag
        if (column.field === 'id') {
            return false;
        }
        return true;
    },

    columnDragStart({ column }) {
        console.log('Drag started:', column.text);
    },

    beforeColumnDropFinalize({ source, targetColumn, insertBefore }) {
        console.log('About to drop', source.text,
            insertBefore ? 'before' : 'after', targetColumn.text);
        // Return false to cancel drop
        return true;
    },

    columnDrop({ column, newIndex }) {
        console.log('Column dropped at index:', newIndex);
    }
});
```

### 3.2 Save Column Order

```javascript
// Get current column order
function getColumnOrder() {
    return grid.columns.records.map(col => col.id || col.field);
}

// Save to localStorage
function saveColumnOrder() {
    const order = getColumnOrder();
    localStorage.setItem('gridColumnOrder', JSON.stringify(order));
}

// Restore column order
function restoreColumnOrder() {
    const saved = localStorage.getItem('gridColumnOrder');
    if (saved) {
        const order = JSON.parse(saved);
        order.forEach((colId, index) => {
            const column = grid.columns.get(colId);
            if (column) {
                grid.columns.move(column, index);
            }
        });
    }
}

// Listen for reorder and save
grid.on('columnDrop', saveColumnOrder);

// Restore on init
restoreColumnOrder();
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useRef, useMemo, useCallback, useEffect, useState } from 'react';

function ReorderableGrid({ data }) {
    const gridRef = useRef(null);
    const [columnOrder, setColumnOrder] = useState(() => {
        const saved = localStorage.getItem('columnOrder');
        return saved ? JSON.parse(saved) : null;
    });

    const handleColumnDrop = useCallback(({ column, newIndex }) => {
        const grid = gridRef.current?.instance;
        if (!grid) return;

        const order = grid.columns.records.map(c => c.field);
        setColumnOrder(order);
        localStorage.setItem('columnOrder', JSON.stringify(order));
    }, []);

    const resetOrder = useCallback(() => {
        const grid = gridRef.current?.instance;
        if (!grid) return;

        // Reset to original order
        const originalOrder = ['name', 'status', 'priority', 'dueDate'];
        originalOrder.forEach((field, index) => {
            const column = grid.columns.get(field);
            if (column) {
                grid.columns.move(column, index);
            }
        });

        setColumnOrder(originalOrder);
        localStorage.removeItem('columnOrder');
    }, []);

    const gridConfig = useMemo(() => ({
        features: {
            columnReorder: true
        },

        columns: [
            { text: 'Name', field: 'name', width: 200 },
            { text: 'Status', field: 'status', width: 120 },
            { text: 'Priority', field: 'priority', width: 100 },
            { text: 'Due Date', field: 'dueDate', type: 'date', width: 120 }
        ],

        listeners: {
            columnDrop: handleColumnDrop
        }
    }), [handleColumnDrop]);

    // Restore column order on mount
    useEffect(() => {
        if (columnOrder) {
            const grid = gridRef.current?.instance;
            if (grid) {
                columnOrder.forEach((field, index) => {
                    const column = grid.columns.get(field);
                    if (column) {
                        grid.columns.move(column, index);
                    }
                });
            }
        }
    }, []);

    return (
        <div className="reorderable-grid">
            <div className="toolbar">
                <p>Drag column headers to reorder</p>
                <button onClick={resetOrder}>Reset Order</button>
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
/* Dragging column header */
.b-grid-header.b-dragging {
    opacity: 0.8;
    background: #e3f2fd !important;
    border: 2px dashed #2196F3 !important;
}

/* Drag proxy */
.b-column-drag-proxy {
    background: white;
    border: 2px solid #2196F3;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 8px 16px;
}

/* Drop indicator */
.b-grid-header.b-drop-target::before {
    content: '';
    position: absolute;
    left: -2px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #2196F3;
}

.b-grid-header.b-drop-target.b-drop-after::before {
    left: auto;
    right: -2px;
}

/* Non-draggable indicator */
.b-grid-header[data-draggable="false"] {
    cursor: default;
}

.b-grid-header[data-draggable="false"]::after {
    content: '🔒';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    opacity: 0.5;
}

/* Invalid drop zone */
.b-grid-header.b-invalid-drop {
    background: #ffebee !important;
}

/* Toolbar */
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.toolbar p {
    margin: 0;
    color: #666;
}

.toolbar button {
    padding: 8px 16px;
    border: 1px solid #e0e0e0;
    background: white;
    cursor: pointer;
    border-radius: 4px;
}

.toolbar button:hover {
    background: #f0f0f0;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Kolom niet draggable | draggable: false | Set draggable: true |
| Kan niet naar locked | lockColumnRegions | Disable of herstructureer |
| Order niet bewaard | Geen persistence | Implementeer localStorage |
| Drop indicator mist | CSS niet geladen | Check CSS imports |

---

## API Reference

### Column Reorder Config

| Property | Type | Description |
|----------|------|-------------|
| `columnReorder` | Boolean/Object | Enable feature |
| `lockColumnRegions` | Boolean | Restrict to same region |

### Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `draggable` | Boolean | Allow column drag |
| `locked` | Boolean | Lock column to region |

### Events

| Event | Description |
|-------|-------------|
| `beforeColumnDragStart` | Before drag starts |
| `columnDragStart` | Drag started |
| `beforeColumnDropFinalize` | Before drop completes |
| `columnDrop` | Column dropped |

### Columns Methods

| Method | Description |
|--------|-------------|
| `columns.move(column, index)` | Move column to index |
| `columns.get(id)` | Get column by id/field |
| `columns.records` | All columns array |

---

## Bronnen

- **Feature**: `Grid.feature.ColumnReorder`
- **ColumnStore**: `Grid.data.ColumnStore`

---

*Priority 2: Medium Priority Features*
