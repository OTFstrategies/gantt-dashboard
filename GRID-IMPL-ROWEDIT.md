# Grid Implementation: Row Editing

> **Row Edit** feature voor het bewerken van hele rijen met een popup editor.

---

## Overzicht

Bryntum Grid's RowEdit feature biedt een popup editor voor het bewerken van volledige rijen.

```
+--------------------------------------------------------------------------+
| GRID                    [x] Read-only  [+ Add] [+ Insert] [X Remove]     |
+--------------------------------------------------------------------------+
|  Name        | City      | Team   | Score | Start    | Finish   | %     |
+--------------------------------------------------------------------------+
|  John Doe    | Paris     | Alpha  | 200 * | Jan 15   | Jan 20   | 75%   |
|  Jane Smith  | London    | Beta   |  85   | Jan 20   | Jan 25   | 50%   |
+--------------------------------------------------------------------------+
|                                                                          |
|  +--------------------------------------------------------------------+  |
|  |  ROW EDIT POPUP                                           [x]     |  |
|  +--------------------------------------------------------------------+  |
|  |  Name:       [John Doe          ]                                 |  |
|  |  City:       [Paris         |v|]                                  |  |
|  |  Team:       [Alpha             ]                                 |  |
|  |  Score:      [200            |^|]                                 |  |
|  |  Start:      [Jan 15, 2024  |#|]                                  |  |
|  |  Finish:     [Jan 20, 2024  |#|]  (readonly)                     |  |
|  +--------------------------------------------------------------------+  |
|  |                      [Revert]  [Cancel]  [Save]                   |  |
|  +--------------------------------------------------------------------+  |
|                                                                          |
|  * = dirty (modified)                                                   |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Row Edit Setup

### 1.1 Enable Row Editing

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

let newPlayerCount = 0;

const grid = new Grid({
    appendTo: 'container',

    features: {
        // Disable cell editing (row edit is alternative)
        cellEdit: false,
        rowEdit: {
            // Show revert button to undo changes
            revertButton: true
        },
        sort: 'name',
        stripe: true
    },

    // Show changed cells
    showDirty: true,

    columns: [
        { text: 'Name', field: 'name', flex: 1 },
        {
            text: 'Birthplace',
            field: 'city',
            width: '8em',
            editor: { type: 'dropdown', items: DataGenerator.cities }
        },
        { text: 'Team', field: 'team', flex: 1 },
        { text: 'Score', field: 'score', editor: 'number', width: '5em' },
        {
            text: 'Start',
            id: 'start',
            type: 'date',
            field: 'start',
            width: '9em'
        },
        {
            text: 'Finish (readonly)',
            type: 'date',
            field: 'finish',
            width: '9em',
            readOnly: true
        },
        { text: 'Time', id: 'time', type: 'time', field: 'time', width: '10em' },
        { type: 'percent', text: 'Percent', field: 'percent', flex: 1 }
    ],

    data: DataGenerator.generateData(50)
});

// Show dirty marker on first record
grid.store.getAt(0).score = 200;
```

---

## 2. CRUD Operations

### 2.1 Add, Insert, Remove Toolbar

```javascript
const grid = new Grid({
    appendTo: 'container',

    features: {
        cellEdit: false,
        rowEdit: { revertButton: true }
    },

    listeners: {
        selectionChange({ selection }) {
            removeButton.disabled = !selection.length || grid.readOnly;
        }
    },

    tbar: {
        items: {
            readOnlyButton: {
                type: 'slidetoggle',
                text: 'Read-only',
                tooltip: 'Toggles read-only mode on grid',
                onChange: ({ checked }) => {
                    addButton.disabled = insertButton.disabled = grid.readOnly = checked;
                    removeButton.disabled = checked || !grid.selectedRecords.length;
                }
            },
            addRemoveButtons: {
                type: 'buttongroup',
                items: {
                    addButton: {
                        type: 'button',
                        icon: 'fa-plus-circle',
                        text: 'Add',
                        tooltip: 'Adds a new row (at bottom)',
                        onAction: () => {
                            const counter = ++newPlayerCount;
                            const added = grid.store.add({
                                name: `New player ${counter}`,
                                cls: `new_player_${counter}`
                            });
                            grid.selectedRecord = added[0];
                        }
                    },
                    insertButton: {
                        type: 'button',
                        icon: 'fa-plus-square',
                        text: 'Insert',
                        tooltip: 'Inserts a new row (at top)',
                        onAction: () => {
                            const counter = ++newPlayerCount;
                            const added = grid.store.insert(0, {
                                name: `New player ${counter}`,
                                cls: `new_player_${counter}`
                            });
                            grid.selectedRecord = added[0];
                        }
                    }
                }
            },
            removeButton: {
                type: 'button',
                color: 'b-red',
                icon: 'fa-trash',
                text: 'Remove',
                tooltip: 'Removes selected record(s)',
                disabled: true,
                onAction: () => {
                    const selected = grid.selectedRecords;

                    if (selected?.length) {
                        const { store } = grid;
                        const nextRecord = store.getNext(selected[selected.length - 1]);
                        const prevRecord = store.getPrev(selected[0]);

                        store.remove(selected);
                        grid.selectedRecord = nextRecord || prevRecord;
                    }
                }
            },
            instantUpdate: {
                type: 'checkbox',
                text: 'Instant Update',
                tooltip: 'Update record instantly after editing',
                value: false,
                onChange: ({ checked }) => {
                    grid.features.rowEdit.instantUpdate = checked;
                }
            }
        }
    }
});

const { addButton, removeButton, insertButton } = grid.widgetMap;
```

---

## 3. Feature Configuration

### 3.1 RowEdit Options

```javascript
features: {
    rowEdit: {
        // Show revert button
        revertButton: true,

        // Auto-save on blur
        autoClose: true,

        // Instant update mode
        instantUpdate: false,

        // Custom button bar
        bbar: {
            items: {
                revertButton: { hidden: false },
                cancelButton: { text: 'Annuleren' },
                saveButton: { text: 'Opslaan' }
            }
        }
    }
}
```

### 3.2 Programmatic Control

```javascript
// Start editing a record
grid.features.rowEdit.startEditing({
    record: grid.store.getAt(0)
});

// Cancel current edit
grid.features.rowEdit.cancelEditing();

// Finish current edit
grid.features.rowEdit.finishEditing();

// Check if currently editing
if (grid.features.rowEdit.isEditing) {
    console.log('Currently editing:', grid.features.rowEdit.record);
}
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useState, useRef, useCallback } from 'react';

function EditableGrid({ data }) {
    const gridRef = useRef(null);
    const [readOnly, setReadOnly] = useState(false);
    const [playerCount, setPlayerCount] = useState(0);

    const addRecord = useCallback(() => {
        const grid = gridRef.current?.instance;
        if (!grid) return;

        const count = playerCount + 1;
        setPlayerCount(count);

        const added = grid.store.add({
            name: `New player ${count}`
        });
        grid.selectedRecord = added[0];
    }, [playerCount]);

    const insertRecord = useCallback(() => {
        const grid = gridRef.current?.instance;
        if (!grid) return;

        const count = playerCount + 1;
        setPlayerCount(count);

        const added = grid.store.insert(0, {
            name: `New player ${count}`
        });
        grid.selectedRecord = added[0];
    }, [playerCount]);

    const removeSelected = useCallback(() => {
        const grid = gridRef.current?.instance;
        if (!grid) return;

        const selected = grid.selectedRecords;
        if (selected?.length) {
            const { store } = grid;
            const nextRecord = store.getNext(selected[selected.length - 1]);
            const prevRecord = store.getPrev(selected[0]);

            store.remove(selected);
            grid.selectedRecord = nextRecord || prevRecord;
        }
    }, []);

    const gridConfig = {
        features: {
            cellEdit: false,
            rowEdit: {
                revertButton: true
            },
            stripe: true
        },

        readOnly,
        showDirty: true,

        columns: [
            { text: 'Name', field: 'name', flex: 1 },
            {
                text: 'City',
                field: 'city',
                width: 120,
                editor: {
                    type: 'combo',
                    items: ['Paris', 'London', 'Berlin', 'New York']
                }
            },
            { text: 'Team', field: 'team', flex: 1 },
            { text: 'Score', field: 'score', editor: 'number', width: 100 },
            { type: 'date', text: 'Start', field: 'start', width: 120 },
            { type: 'percent', text: 'Progress', field: 'percent', width: 100 }
        ]
    };

    return (
        <div className="editable-grid">
            <div className="toolbar">
                <label>
                    <input
                        type="checkbox"
                        checked={readOnly}
                        onChange={(e) => setReadOnly(e.target.checked)}
                    />
                    Read-only
                </label>
                <button onClick={addRecord} disabled={readOnly}>
                    Add
                </button>
                <button onClick={insertRecord} disabled={readOnly}>
                    Insert
                </button>
                <button onClick={removeSelected} disabled={readOnly}>
                    Remove
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
/* Row edit popup */
.b-rowedit-popup {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
}

.b-rowedit-popup .b-popup-header {
    background: #1976d2;
    color: white;
}

/* Editor fields */
.b-rowedit-popup .b-field {
    margin: 8px 12px;
}

.b-rowedit-popup .b-field-label {
    min-width: 100px;
}

/* Button bar */
.b-rowedit-popup .b-toolbar {
    background: #f5f5f5;
    border-top: 1px solid #e0e0e0;
}

/* Save button */
.b-rowedit-popup .b-save-button {
    background: #4CAF50;
    color: white;
}

/* Cancel button */
.b-rowedit-popup .b-cancel-button {
    background: #f44336;
    color: white;
}

/* Revert button */
.b-rowedit-popup .b-revert-button {
    background: #FF9800;
    color: white;
}

/* Dirty cell indicator */
.b-grid-cell.b-dirty::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border: 5px solid transparent;
    border-top-color: #FF9800;
    border-left-color: #FF9800;
}

/* Read-only mode */
.b-grid.b-readonly .b-grid-cell {
    opacity: 0.8;
}

/* CRUD toolbar */
.toolbar button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Row edit niet actief | cellEdit enabled | Disable cellEdit: false |
| Revert button mist | revertButton: false | Zet revertButton: true |
| Dirty niet zichtbaar | showDirty: false | Zet showDirty: true |
| Column niet editable | editor: false | Voeg editor config toe |
| ReadOnly werkt niet | readOnly niet gezet | Zet grid.readOnly = true |

---

## API Reference

### RowEdit Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `revertButton` | Boolean | Show revert button |
| `autoClose` | Boolean | Close on blur |
| `instantUpdate` | Boolean | Update instantly |
| `bbar` | Object | Button bar config |

### RowEdit Methods

| Method | Description |
|--------|-------------|
| `startEditing(config)` | Start editing record |
| `cancelEditing()` | Cancel current edit |
| `finishEditing()` | Save and close |

### RowEdit Properties

| Property | Type | Description |
|----------|------|-------------|
| `isEditing` | Boolean | Currently editing |
| `record` | Model | Current record |

---

## Bronnen

- **Example**: `examples/rowedit/`
- **RowEdit Feature**: `Grid.feature.RowEdit`

---

*Priority 2: Medium Priority Features*
