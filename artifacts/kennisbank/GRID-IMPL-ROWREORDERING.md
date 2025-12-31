# Grid Implementation: Row Reordering

> **Row Reordering** voor het herordenen van rijen via drag-and-drop.

---

## Overzicht

Bryntum Grid's RowReorder feature maakt het mogelijk om rijen te verslepen.

```
+--------------------------------------------------------------------------+
| GRID                Show grip: [Always] [Hover] [Never]  [x] Grip only   |
+--------------------------------------------------------------------------+
|      |  Name        | Age  | City      | Food    | Color                |
+--------------------------------------------------------------------------+
|  ::  |  John Doe    | 32   | Paris     | Pizza   |  Orange              |
|  ::  |  Jane Smith  | 28   | London    | Sushi   |  Purple              |
|  ::  |  Bob Wilson  | 45   | Berlin    | Pasta   |  Blue                |
+--------------------------------------------------------------------------+
|                                                                          |
|                    +---------------------------+                          |
|                    |  :: Jane Smith            |  <-- Dragging row       |
|                    +---------------------------+                          |
|                             |                                             |
|                             v                                             |
|       Drop indicator line here                                            |
|                                                                          |
|  DRAG OPTIONS:                                                           |
|  ::  Grip icon     [Confirmation dialog option]                          |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Row Reordering Setup

### 1.1 Enable Row Reordering

```javascript
import { Grid, DataGenerator, MessageDialog } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        rowReorder: {
            showGrip: true,
            gripOnly: false  // Allow drag from anywhere
        }
    },

    multiSelect: true,

    columns: [
        {
            text: 'Name',
            field: 'name',
            flex: 2,
            editor: {
                type: 'textfield',
                required: true
            }
        },
        { text: 'Age', field: 'age', width: 100, type: 'number' },
        { text: 'City', field: 'city', flex: 1 },
        { text: 'Food', field: 'food', flex: 1 },
        {
            text: 'Color (not sortable)',
            field: 'color',
            width: 170,
            sortable: false,
            htmlEncode: false,
            renderer: ({ cellElement, value }) => {
                cellElement.style.color = value
                    ? `color-mix(in oklab, var(--b-color-${value.toLowerCase()}), var(--b-opposite) 10%)`
                    : 'inherit';
                cellElement.style.backgroundColor = value
                    ? `color-mix(in oklab, var(--b-color-${value.toLowerCase()}), transparent 95%)`
                    : 'inherit';
                return value ? `<i class="fa fa-palette"></i>${value}` : '';
            }
        }
    ],

    data: DataGenerator.generateData(50)
});
```

---

## 2. Grip Configuration

### 2.1 Grip Display Options

```javascript
tbar: [
    {
        type: 'label',
        text: 'Show grip icon'
    },
    {
        type: 'buttongroup',
        rendition: 'padded',
        ref: 'gripButtons',
        toggleGroup: true,
        items: {
            gripAlways: {
                text: 'Always',
                pressed: true
            },
            gripHover: {
                text: 'On hover'
            },
            gripNever: {
                text: 'Never'
            }
        },
        onToggle({ source }) {
            switch (source.ref) {
                case 'gripAlways':
                    grid.features.rowReorder.showGrip = true;
                    break;
                case 'gripHover':
                    grid.features.rowReorder.showGrip = 'hover';
                    break;
                case 'gripNever':
                    grid.features.rowReorder.showGrip = false;
                    break;
            }

            grid.widgetMap.gripOnly.disabled = source.ref === 'gripNever';
        }
    },
    {
        type: 'slidetoggle',
        ref: 'gripOnly',
        text: 'Drag by grip only',
        checked: false,
        onChange({ checked }) {
            grid.features.rowReorder.gripOnly = checked;
        }
    }
]
```

---

## 3. Confirmation Dialog

### 3.1 Async Drop Confirmation

```javascript
const grid = new Grid({
    appendTo: 'container',

    features: {
        rowReorder: {
            showGrip: true
        }
    },

    tbar: [
        {
            type: 'slidetoggle',
            ref: 'confirmationButton',
            text: 'Show confirmation dialog',
            checked: false
        }
    ],

    listeners: {
        gridRowBeforeDropFinalize: async ({ context }) => {
            if (grid.widgetMap.confirmationButton.checked) {
                const result = await MessageDialog.confirm({
                    title: 'Please confirm',
                    message: 'Did you want the row here?'
                });

                // Return true to accept the drop or false to reject it
                return result === MessageDialog.yesButton;
            }
        }
    },

    data: DataGenerator.generateData(50)
});
```

---

## 4. Event Handling

### 4.1 Drag Events

```javascript
listeners: {
    // Before drag starts
    gridRowDragStart({ source, context }) {
        console.log('Started dragging:', context.records.map(r => r.name));
    },

    // During drag
    gridRowDrag({ source, context }) {
        // Update UI during drag
        console.log('Dragging over index:', context.insertBefore?.index);
    },

    // Before drop is finalized
    gridRowBeforeDropFinalize: async ({ context }) => {
        // Can return false to cancel drop
        // Can return Promise for async validation
        return true;
    },

    // After successful drop
    gridRowDrop({ source, context }) {
        console.log('Dropped at index:', context.insertBefore?.index);
    },

    // Drag aborted/cancelled
    gridRowAbort({ source, context }) {
        console.log('Drag cancelled');
    }
}
```

---

## 5. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useState, useRef, useCallback } from 'react';
import { MessageDialog } from '@bryntum/grid';

function ReorderableGrid({ data }) {
    const gridRef = useRef(null);
    const [showGrip, setShowGrip] = useState(true);
    const [gripOnly, setGripOnly] = useState(false);
    const [confirmDrop, setConfirmDrop] = useState(false);

    const handleGripChange = useCallback((value) => {
        setShowGrip(value);
        if (gridRef.current?.instance) {
            gridRef.current.instance.features.rowReorder.showGrip = value;
        }
    }, []);

    const handleGripOnlyChange = useCallback((checked) => {
        setGripOnly(checked);
        if (gridRef.current?.instance) {
            gridRef.current.instance.features.rowReorder.gripOnly = checked;
        }
    }, []);

    const handleBeforeDropFinalize = useCallback(async ({ context }) => {
        if (confirmDrop) {
            const result = await MessageDialog.confirm({
                title: 'Bevestig verplaatsing',
                message: 'Wilt u de rij hier plaatsen?'
            });
            return result === MessageDialog.yesButton;
        }
        return true;
    }, [confirmDrop]);

    const gridConfig = {
        features: {
            rowReorder: {
                showGrip,
                gripOnly
            }
        },

        multiSelect: true,

        columns: [
            { text: 'Name', field: 'name', flex: 2 },
            { text: 'Age', field: 'age', width: 100, type: 'number' },
            { text: 'City', field: 'city', flex: 1 },
            { text: 'Food', field: 'food', flex: 1 }
        ],

        listeners: {
            gridRowBeforeDropFinalize: handleBeforeDropFinalize
        }
    };

    return (
        <div className="reorderable-grid">
            <div className="toolbar">
                <label>Show grip:</label>
                <select
                    value={showGrip === true ? 'always' : showGrip === 'hover' ? 'hover' : 'never'}
                    onChange={(e) => {
                        const val = e.target.value;
                        handleGripChange(val === 'always' ? true : val === 'hover' ? 'hover' : false);
                    }}
                >
                    <option value="always">Always</option>
                    <option value="hover">On hover</option>
                    <option value="never">Never</option>
                </select>
                <label>
                    <input
                        type="checkbox"
                        checked={gripOnly}
                        onChange={(e) => handleGripOnlyChange(e.target.checked)}
                        disabled={showGrip === false}
                    />
                    Grip only
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={confirmDrop}
                        onChange={(e) => setConfirmDrop(e.target.checked)}
                    />
                    Confirm drops
                </label>
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
/* Grip icon */
.b-row-reorder-grip {
    cursor: grab;
    color: #666;
    padding: 0 8px;
}

.b-row-reorder-grip:hover {
    color: #1976d2;
}

/* Grip on hover only */
.b-grid-row .b-row-reorder-grip {
    opacity: 0;
    transition: opacity 0.2s;
}

.b-grid-row:hover .b-row-reorder-grip,
.b-row-reorder-grip.b-visible {
    opacity: 1;
}

/* Dragging row */
.b-grid-row.b-dragging {
    opacity: 0.5;
    background: #e3f2fd;
}

/* Drop proxy */
.b-row-reorder-proxy {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border: 2px solid #1976d2;
    border-radius: 4px;
}

/* Drop indicator line */
.b-row-reorder-drop-indicator {
    height: 2px;
    background: #1976d2;
}

.b-row-reorder-drop-indicator::before,
.b-row-reorder-drop-indicator::after {
    content: '';
    width: 8px;
    height: 8px;
    background: #1976d2;
    border-radius: 50%;
}

/* Valid drop zone */
.b-grid-row.b-row-reorder-valid-drop {
    background: rgba(76, 175, 80, 0.1);
}

/* Invalid drop zone */
.b-grid-row.b-row-reorder-invalid-drop {
    background: rgba(244, 67, 54, 0.1);
}

/* Multi-select drag */
.b-row-reorder-proxy .b-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #1976d2;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Drag werkt niet | Feature disabled | Enable rowReorder feature |
| Grip niet zichtbaar | showGrip: false | Zet showGrip: true of 'hover' |
| Drop niet toegestaan | Event returns false | Check gridRowBeforeDropFinalize |
| Multi-select drag werkt niet | multiSelect: false | Zet multiSelect: true |
| Confirmation niet async | Geen await | Gebruik async/await pattern |

---

## API Reference

### RowReorder Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `showGrip` | Boolean/String | true, false, or 'hover' |
| `gripOnly` | Boolean | Only drag by grip |

### RowReorder Events

| Event | Description |
|-------|-------------|
| `gridRowDragStart` | Drag started |
| `gridRowDrag` | During drag |
| `gridRowBeforeDropFinalize` | Before drop (can cancel) |
| `gridRowDrop` | After successful drop |
| `gridRowAbort` | Drag cancelled |

### Context Object

| Property | Type | Description |
|----------|------|-------------|
| `records` | Model[] | Records being dragged |
| `insertBefore` | Model | Target record |
| `valid` | Boolean | Is drop valid |

---

## Bronnen

- **Example**: `examples/rowreordering/`
- **RowReorder Feature**: `Grid.feature.RowReorder`
- **MessageDialog**: `Core.widget.MessageDialog`

---

*Priority 2: Medium Priority Features*
