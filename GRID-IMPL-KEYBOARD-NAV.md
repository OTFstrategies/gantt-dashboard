# Grid Implementation: Keyboard Navigation

> **Keyboard Navigation** voor toetsenbord-gebaseerde navigatie en accessibility.

---

## Overzicht

Bryntum Grid ondersteunt volledige toetsenbordnavigatie voor accessibility en efficiëntie.

```
+--------------------------------------------------------------------------+
| GRID                                              [Focus: Cell 2,3]      |
+--------------------------------------------------------------------------+
|  #  |  Name        |  Status     |  Priority   |  Due Date   |          |
+--------------------------------------------------------------------------+
|  1  |  Task A      |  Active     |  High       |  Jan 15     |          |
|  2  |  Task B      | [Pending]   |  Medium     |  Jan 20     |  ← Focus |
|  3  |  Task C      |  Done       |  Low        |  Jan 25     |          |
+--------------------------------------------------------------------------+
|                                                                          |
|  KEYBOARD SHORTCUTS:                                                     |
|    ↑↓←→  - Navigate cells                                                |
|    Enter - Edit cell / Expand row                                        |
|    Space - Select row                                                    |
|    Tab   - Move to next cell                                             |
|    Home/End - First/Last cell                                            |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Keyboard Navigation

### 1.1 Enable Keyboard Navigation

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        cellEdit: true  // Enables Enter to edit
    },

    // Keyboard navigation is enabled by default
    // Configure focus behavior
    focusOnTouch: true,
    trapFocus: true,  // Keep focus within grid

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

## 2. Custom Keyboard Shortcuts

### 2.1 Add Custom Key Mappings

```javascript
const grid = new Grid({
    appendTo: 'container',

    keyMap: {
        // Delete row
        'Delete': 'deleteSelectedRecords',

        // Custom actions
        'Ctrl+D': 'duplicateRow',
        'Ctrl+E': 'editCurrentCell',
        'Ctrl+S': 'saveChanges',

        // Navigation
        'Ctrl+Home': 'navigateToFirstRow',
        'Ctrl+End': 'navigateToLastRow',

        // Selection
        'Ctrl+A': 'selectAll',
        'Escape': 'clearSelection'
    },

    // Define custom action handlers
    deleteSelectedRecords() {
        const selected = this.selectedRecords;
        if (selected.length > 0) {
            this.store.remove(selected);
        }
    },

    duplicateRow() {
        const selected = this.selectedRecord;
        if (selected) {
            const copy = { ...selected.data };
            delete copy.id;
            copy.name = `${copy.name} (Copy)`;
            this.store.add(copy);
        }
    },

    editCurrentCell() {
        const cell = this.focusedCell;
        if (cell) {
            this.startEditing(cell);
        }
    },

    saveChanges() {
        if (this.store.changes) {
            console.log('Saving changes:', this.store.changes);
            this.store.commit();
        }
    },

    navigateToFirstRow() {
        const firstRecord = this.store.first;
        if (firstRecord) {
            this.focusCell({ record: firstRecord, column: this.columns[0] });
        }
    },

    navigateToLastRow() {
        const lastRecord = this.store.last;
        if (lastRecord) {
            this.focusCell({ record: lastRecord, column: this.columns[0] });
        }
    }
});
```

### 2.2 Listen for Key Events

```javascript
grid.on({
    // Cell navigation
    cellKeyDown({ event, record, column }) {
        console.log(`Key pressed: ${event.key} on ${column.field}`);

        // Custom F2 to edit
        if (event.key === 'F2') {
            grid.startEditing({ record, column });
            event.preventDefault();
        }
    },

    // Navigation changed
    navigate({ record, column }) {
        console.log('Navigated to:', record.id, column.field);
    }
});
```

---

## 3. Focus Management

### 3.1 Programmatic Focus

```javascript
// Focus specific cell
grid.focusCell({
    record: grid.store.getById(5),
    column: grid.columns.getById('name')
});

// Focus by row index and column index
grid.focusCell({
    row: 2,
    column: 1
});

// Get current focused cell
const focusedCell = grid.focusedCell;
console.log('Focused:', focusedCell?.record?.id, focusedCell?.column?.field);

// Navigate to next/previous cell
grid.navigateRight();
grid.navigateLeft();
grid.navigateUp();
grid.navigateDown();
```

### 3.2 Focus Indicators

```javascript
const grid = new Grid({
    appendTo: 'container',

    // Show focus outline
    showFocusOutline: true,

    // Focus highlight options
    focusCls: 'custom-focus',

    // Tab behavior
    tabbableColumns: true  // Allow Tab between columns
});
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useRef, useMemo, useCallback, useEffect } from 'react';

function KeyboardNavGrid({ data }) {
    const gridRef = useRef(null);

    const handleKeyAction = useCallback((action, event) => {
        const grid = gridRef.current?.instance;
        if (!grid) return;

        switch (action) {
            case 'delete':
                const selected = grid.selectedRecords;
                if (selected.length > 0) {
                    grid.store.remove(selected);
                }
                break;
            case 'duplicate':
                const record = grid.selectedRecord;
                if (record) {
                    const copy = { ...record.data };
                    delete copy.id;
                    grid.store.add(copy);
                }
                break;
            case 'save':
                console.log('Save changes');
                break;
        }
    }, []);

    const gridConfig = useMemo(() => ({
        keyMap: {
            'Delete': () => handleKeyAction('delete'),
            'Ctrl+D': () => handleKeyAction('duplicate'),
            'Ctrl+S': (e) => {
                e.preventDefault();
                handleKeyAction('save');
            }
        },

        features: {
            cellEdit: true
        },

        columns: [
            { text: 'Name', field: 'name', width: 200 },
            { text: 'Status', field: 'status', width: 120 },
            { text: 'Priority', field: 'priority', width: 100 }
        ],

        selectionMode: {
            row: true,
            multiSelect: true
        },

        listeners: {
            cellKeyDown({ event, record, column }) {
                // F2 to start editing
                if (event.key === 'F2') {
                    gridRef.current?.instance?.startEditing({ record, column });
                }
            }
        }
    }), [handleKeyAction]);

    // Focus grid on mount
    useEffect(() => {
        const grid = gridRef.current?.instance;
        if (grid && grid.store.first) {
            grid.focusCell({
                record: grid.store.first,
                column: grid.columns[0]
            });
        }
    }, []);

    return (
        <div className="keyboard-nav-grid">
            <div className="shortcuts-info">
                <span><kbd>↑↓←→</kbd> Navigate</span>
                <span><kbd>Enter</kbd> Edit</span>
                <span><kbd>Delete</kbd> Remove</span>
                <span><kbd>Ctrl+D</kbd> Duplicate</span>
                <span><kbd>Ctrl+S</kbd> Save</span>
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

## 5. Accessibility (a11y)

### 5.1 ARIA Attributes

```javascript
const grid = new Grid({
    appendTo: 'container',

    // ARIA configuration
    ariaLabel: 'Task list',
    ariaDescription: 'Navigate with arrow keys, press Enter to edit',

    columns: [
        {
            text: 'Name',
            field: 'name',
            ariaLabel: 'Task name',
            ariaDescription: 'The name of the task'
        },
        {
            text: 'Status',
            field: 'status',
            ariaLabel: 'Task status'
        }
    ]
});
```

### 5.2 Screen Reader Support

```javascript
// Announce changes to screen readers
grid.on({
    selectionChange({ selected }) {
        const count = selected.length;
        grid.announce(`${count} row${count !== 1 ? 's' : ''} selected`);
    },

    dataChange({ action, records }) {
        if (action === 'add') {
            grid.announce(`${records.length} record(s) added`);
        } else if (action === 'remove') {
            grid.announce(`${records.length} record(s) removed`);
        }
    }
});
```

---

## 6. Styling

```css
/* Focus outline */
.b-grid-cell.b-focused {
    outline: 2px solid #1976d2 !important;
    outline-offset: -2px;
}

/* Custom focus class */
.b-grid-cell.custom-focus {
    background: #e3f2fd !important;
    box-shadow: inset 0 0 0 2px #1976d2;
}

/* Focus visible (keyboard only) */
.b-grid:focus-visible .b-grid-cell.b-focused {
    outline: 3px solid #1976d2;
}

/* Skip links for accessibility */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    padding: 8px 16px;
    background: #1976d2;
    color: white;
    z-index: 1000;
    transition: top 0.2s;
}

.skip-link:focus {
    top: 0;
}

/* Keyboard shortcuts info */
.shortcuts-info {
    display: flex;
    gap: 16px;
    padding: 8px 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    font-size: 13px;
}

.shortcuts-info kbd {
    padding: 2px 6px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Arrows werken niet | Grid heeft geen focus | Klik eerst op grid |
| Tab verlaat grid | trapFocus niet enabled | Set trapFocus: true |
| Custom key niet werkt | Conflict met browser | Gebruik e.preventDefault() |
| Focus niet zichtbaar | CSS override | Check focus styling |

---

## API Reference

### Keyboard Properties

| Property | Type | Description |
|----------|------|-------------|
| `keyMap` | Object | Custom key mappings |
| `trapFocus` | Boolean | Keep focus in grid |
| `tabbableColumns` | Boolean | Tab between columns |
| `showFocusOutline` | Boolean | Show focus outline |

### Navigation Methods

| Method | Description |
|--------|-------------|
| `focusCell(config)` | Focus specific cell |
| `navigateUp()` | Move focus up |
| `navigateDown()` | Move focus down |
| `navigateLeft()` | Move focus left |
| `navigateRight()` | Move focus right |

### Default Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑↓←→` | Navigate cells |
| `Enter` | Edit cell / Confirm |
| `Escape` | Cancel edit / Clear selection |
| `Tab` | Next cell |
| `Shift+Tab` | Previous cell |
| `Home` | First cell in row |
| `End` | Last cell in row |
| `Ctrl+Home` | First row |
| `Ctrl+End` | Last row |
| `Space` | Toggle selection |
| `Ctrl+A` | Select all |

---

## Bronnen

- **Navigation**: `Grid.view.mixin.GridNavigation`
- **Focus Manager**: `Core.helper.FocusHelper`

---

*Priority 2: Medium Priority Features*
