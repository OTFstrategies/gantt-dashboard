# Grid Implementation: Column Resize

> **Column Resize** voor het aanpassen van kolombreedte door slepen.

---

## Overzicht

Bryntum Grid ondersteunt kolom resize door de kolomrand te slepen.

```
+--------------------------------------------------------------------------+
| GRID                                                                      |
+--------------------------------------------------------------------------+
|  Name           |  Status   |  Priority   |  Due Date   |  Description  |
|                 |←→ Resize  |             |             |               |
+--------------------------------------------------------------------------+
|  Task Alpha     |  Active   |  High       |  Jan 15     |  Lorem ipsum  |
|  Task Beta      |  Pending  |  Medium     |  Jan 20     |  Dolor sit... |
+--------------------------------------------------------------------------+
|                                                                          |
|  COLUMN RESIZE FEATURES:                                                 |
|    - Drag column border to resize                                        |
|    - Double-click to auto-fit content                                    |
|    - Minimum/maximum width constraints                                   |
|    - Save column widths to state                                         |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Column Resize Setup

### 1.1 Enable Column Resize

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        columnResize: true  // Enabled by default
    },

    columns: [
        { text: 'Name', field: 'name', width: 200 },
        { text: 'Status', field: 'status', width: 120 },
        { text: 'Priority', field: 'priority', width: 100 },
        { text: 'Description', field: 'description', flex: 1 }
    ],

    data: [
        { id: 1, name: 'Task Alpha', status: 'Active', priority: 'High', description: 'Lorem ipsum dolor sit amet' },
        { id: 2, name: 'Task Beta', status: 'Pending', priority: 'Medium', description: 'Consectetur adipiscing elit' }
    ]
});
```

---

## 2. Column Width Constraints

### 2.1 Min/Max Width

```javascript
columns: [
    {
        text: 'Name',
        field: 'name',
        width: 200,
        minWidth: 100,  // Minimum width
        maxWidth: 400   // Maximum width
    },
    {
        text: 'Status',
        field: 'status',
        width: 120,
        resizable: false  // Disable resize for this column
    },
    {
        text: 'Priority',
        field: 'priority',
        width: 100,
        minWidth: 80
    },
    {
        text: 'Description',
        field: 'description',
        flex: 1,  // Flexible width
        minWidth: 150
    }
]
```

### 2.2 Auto-fit Content

```javascript
columns: [
    {
        text: 'Name',
        field: 'name',
        width: 200,
        // Auto-size to content on header double-click
        autoWidth: true
    }
]

// Programmatic auto-fit
function autoFitColumn(columnId) {
    const column = grid.columns.get(columnId);
    if (column) {
        column.resizeToFitContent();
    }
}

// Auto-fit all columns
function autoFitAllColumns() {
    grid.columns.forEach(column => {
        if (column.resizable !== false) {
            column.resizeToFitContent();
        }
    });
}
```

---

## 3. Event Handling

### 3.1 Listen to Resize Events

```javascript
grid.on({
    columnResizeStart({ column }) {
        console.log('Started resizing:', column.text);
    },

    columnResize({ column, width, oldWidth }) {
        console.log(`${column.text}: ${oldWidth}px → ${width}px`);
    },

    columnResizeEnd({ column }) {
        console.log('Finished resizing:', column.text);
        saveColumnWidths();  // Persist to storage
    }
});

// Save column widths
function saveColumnWidths() {
    const widths = {};
    grid.columns.forEach(column => {
        if (column.field) {
            widths[column.field] = column.width;
        }
    });
    localStorage.setItem('columnWidths', JSON.stringify(widths));
}

// Restore column widths
function restoreColumnWidths() {
    const saved = localStorage.getItem('columnWidths');
    if (saved) {
        const widths = JSON.parse(saved);
        Object.entries(widths).forEach(([field, width]) => {
            const column = grid.columns.get(field);
            if (column) {
                column.width = width;
            }
        });
    }
}
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useRef, useMemo, useCallback, useEffect, useState } from 'react';

function ResizableGrid({ data }) {
    const gridRef = useRef(null);
    const [columnWidths, setColumnWidths] = useState(() => {
        const saved = localStorage.getItem('columnWidths');
        return saved ? JSON.parse(saved) : {};
    });

    const handleColumnResizeEnd = useCallback(({ column }) => {
        setColumnWidths(prev => {
            const updated = { ...prev, [column.field]: column.width };
            localStorage.setItem('columnWidths', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const autoFitAll = useCallback(() => {
        const grid = gridRef.current?.instance;
        if (grid) {
            grid.columns.forEach(column => {
                if (column.resizable !== false) {
                    column.resizeToFitContent();
                }
            });
        }
    }, []);

    const resetWidths = useCallback(() => {
        const grid = gridRef.current?.instance;
        if (grid) {
            // Reset to default widths
            grid.columns.get('name').width = 200;
            grid.columns.get('status').width = 120;
            grid.columns.get('priority').width = 100;

            localStorage.removeItem('columnWidths');
            setColumnWidths({});
        }
    }, []);

    const gridConfig = useMemo(() => ({
        features: {
            columnResize: true
        },

        columns: [
            {
                text: 'Name',
                field: 'name',
                width: columnWidths.name || 200,
                minWidth: 100,
                maxWidth: 400
            },
            {
                text: 'Status',
                field: 'status',
                width: columnWidths.status || 120,
                minWidth: 80
            },
            {
                text: 'Priority',
                field: 'priority',
                width: columnWidths.priority || 100,
                minWidth: 60
            },
            {
                text: 'Description',
                field: 'description',
                flex: 1,
                minWidth: 150
            }
        ],

        listeners: {
            columnResizeEnd: handleColumnResizeEnd
        }
    }), [columnWidths, handleColumnResizeEnd]);

    return (
        <div className="resizable-grid">
            <div className="toolbar">
                <span className="info">
                    Drag column borders to resize. Double-click to auto-fit.
                </span>
                <button onClick={autoFitAll}>Auto-fit All</button>
                <button onClick={resetWidths}>Reset Widths</button>
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
/* Column resize handle */
.b-grid-header .b-resize-handle {
    position: absolute;
    right: -3px;
    top: 0;
    bottom: 0;
    width: 6px;
    cursor: col-resize;
    background: transparent;
    z-index: 1;
}

.b-grid-header:hover .b-resize-handle {
    background: rgba(25, 118, 210, 0.2);
}

/* Active resize */
.b-grid-header.b-resizing .b-resize-handle {
    background: #2196F3;
}

/* Resize indicator line */
.b-column-resize-indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #2196F3;
    z-index: 10000;
}

/* Non-resizable column */
.b-grid-header[data-resizable="false"] {
    cursor: default;
}

.b-grid-header[data-resizable="false"] .b-resize-handle {
    display: none;
}

/* Min/max width indicators */
.b-grid-header.b-at-min-width .b-resize-handle {
    cursor: e-resize;
}

.b-grid-header.b-at-max-width .b-resize-handle {
    cursor: w-resize;
}

/* Toolbar */
.toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.toolbar .info {
    color: #666;
    font-size: 13px;
}

.toolbar button {
    margin-left: auto;
    padding: 8px 16px;
    border: 1px solid #e0e0e0;
    background: white;
    cursor: pointer;
    border-radius: 4px;
}

.toolbar button:hover {
    background: #f0f0f0;
}

.toolbar button + button {
    margin-left: 8px;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Kan niet resizen | resizable: false | Set resizable: true |
| Handle niet zichtbaar | CSS niet geladen | Check styles |
| Width niet bewaard | Geen persistence | Implementeer storage |
| Auto-fit werkt niet | Geen content | Wacht tot data geladen |

---

## API Reference

### Column Resize Feature

| Property | Type | Description |
|----------|------|-------------|
| `columnResize` | Boolean | Enable feature |
| `disabled` | Boolean | Disable feature |

### Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `width` | Number | Column width in pixels |
| `flex` | Number | Flexible width ratio |
| `minWidth` | Number | Minimum width |
| `maxWidth` | Number | Maximum width |
| `resizable` | Boolean | Allow resize |

### Column Methods

| Method | Description |
|--------|-------------|
| `resizeToFitContent()` | Auto-fit to content |

### Events

| Event | Description |
|-------|-------------|
| `columnResizeStart` | Resize started |
| `columnResize` | During resize |
| `columnResizeEnd` | Resize finished |

---

## Bronnen

- **Feature**: `Grid.feature.ColumnResize`

---

*Priority 2: Medium Priority Features*
