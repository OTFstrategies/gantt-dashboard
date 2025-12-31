# Grid Implementation: Transactions

> **Transactions** met StateTrackingManager voor undo/redo en commit/rollback.

---

## Overzicht

Bryntum Grid's StateTrackingManager beheert transacties voor wijzigingen.

```
+--------------------------------------------------------------------------+
| GRID     [Start] [Stop] [Undo 2] [Transaction 2 v] [Redo 0] [Commit]     |
+--------------------------------------------------------------------------+
|  Team   |  First name  |  Surname    |  City     |  Cooks   |  Rating   |
+--------------------------------------------------------------------------+
| (Orange)|  John        |  Doe *      |  Paris    |  Pizza   |  *****    |
| (Purple)|  Jane        |  Smith      |  London   |  Sushi   |  ****     |
| (Blue)  |  Bob         |  Wilson     |  Berlin   |  Pasta   |  ***      |
+--------------------------------------------------------------------------+
|                                                                          |
|  TRANSACTION FLOW:                                                       |
|                                                                          |
|  [Start] ─────> Recording mode (grid editable)                          |
|      │                                                                   |
|      v         Make changes: edit cells, add/remove rows                 |
|  [Stop] ──────> Transaction saved, grid readonly                        |
|      │                                                                   |
|      v         Navigate transactions with combo                          |
|  [Undo/Redo] ─> Restore previous states                                  |
|      │                                                                   |
|      v                                                                   |
|  [Commit] ────> Accept all changes, clear history                       |
|                                                                          |
|  * = modified cell                                                       |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Transaction Setup

### 1.1 Configure StateTrackingManager

```javascript
import { Grid, Toast, StateTrackingManager, DataGenerator, StringHelper } from '@bryntum/grid';

// Create State Tracking Manager
const stm = new StateTrackingManager({
    disabled: false
});

const grid = new Grid({
    appendTo: 'container',

    features: {
        cellEdit: true,
        sort: 'city',
        stripe: true
    },

    // Start in read-only mode (enable during transaction)
    readOnly: true,

    columns: [
        {
            text: 'Team',
            field: 'color',
            width: 90,
            resizable: false,
            htmlEncode: false,
            align: 'center',
            editor: {
                type: 'dropdown',
                items: DataGenerator.colors,
                pickerWidth: '4em',
                editable: false,
                listItemTpl: ({ text }) => StringHelper.xss`<div class="team-badge" style="background-color: var(--b-color-${text.toLowerCase()})"></div>`
            },
            renderer: ({ value }) => StringHelper.xss`<div class="team-badge" style="background-color: var(--b-color-${(value || '').toLowerCase()})"></div>`
        },
        { text: 'First name', field: 'firstName', flex: 1 },
        { text: 'Surname', field: 'surName', flex: 1 },
        {
            text: 'City',
            field: 'city',
            flex: 1,
            editor: { type: 'dropdown', items: DataGenerator.cities }
        },
        {
            text: 'Cooks',
            field: 'food',
            flex: 1,
            editor: { type: 'dropdown', items: DataGenerator.foods }
        },
        { type: 'rating', text: 'Rating', field: 'rating' }
    ],

    store: {
        // Register store with STM for transaction tracking
        stm,
        data: DataGenerator.generateData(25)
    }
});
```

---

## 2. Transaction Toolbar

### 2.1 Complete Toolbar Setup

```javascript
tbar: [
    {
        type: 'button',
        ref: 'startButton',
        text: 'Start',
        tooltip: 'Start a transaction',
        disabled: false,
        onAction: () => {
            stm.startTransaction('Transaction ' + transactionCombo.store.count);
            updateUndoRedoControls(true);
        }
    },
    {
        type: 'button',
        ref: 'stopButton',
        text: 'Stop',
        tooltip: 'Stop the transaction, add changes to transaction list',
        disabled: true,
        onAction: () => {
            stm.stopTransaction();
            updateUndoRedoControls();
            Toast.show('Transaction stopped');
        }
    },
    {
        type: 'button',
        ref: 'undoButton',
        icon: 'fa-undo',
        tooltip: 'Undo',
        disabled: true,
        rendition: 'text',
        onAction: () => {
            stm.canUndo && stm.undo();
            updateUndoRedoControls();
        }
    },
    {
        type: 'combo',
        ref: 'transactionCombo',
        width: 250,
        valueField: 'idx',
        editable: false,
        disabled: true,
        items: [],
        onAction: (combo) => {
            const value = combo.value;

            if (value > stm.position) {
                stm.redo(value - stm.position);
            }
            else if (value < stm.position) {
                stm.undo(stm.position - value);
            }
        }
    },
    {
        type: 'button',
        ref: 'redoButton',
        icon: 'fa-redo',
        tooltip: 'Redo',
        disabled: true,
        rendition: 'text',
        onAction: () => {
            stm.canRedo && stm.redo();
            updateUndoRedoControls();
        }
    },
    {
        type: 'button',
        ref: 'commitButton',
        color: 'b-green',
        text: 'Commit',
        tooltip: 'Accept changes',
        disabled: true,
        onAction: () => {
            grid.store.commit();
            stm.resetQueue();
            updateUndoRedoControls();
            Toast.show('Changes committed');
        }
    },
    {
        type: 'button',
        ref: 'addButton',
        icon: 'fa-plus-circle',
        tooltip: 'Adds a new row (at bottom)',
        disabled: true,
        rendition: 'text',
        onAction: () => {
            const added = grid.store.add({
                firstName: 'John',
                surName: 'Doe',
                color: DataGenerator.colors[grid.store.count % DataGenerator.colors.length]
            });
            grid.selectedRecord = added[0];
        }
    },
    {
        type: 'button',
        ref: 'removeButton',
        icon: 'fa-trash',
        tooltip: 'Removes selected record',
        disabled: true,
        rendition: 'text',
        onAction: () => {
            const selected = grid.selectedRecord;
            if (selected) {
                const { store } = grid;
                const nextRecord = store.getNext(selected);
                const prevRecord = store.getPrev(selected);

                store.remove(selected);
                grid.selectedRecord = nextRecord || prevRecord;
            }
        }
    }
]
```

---

## 3. Update Controls Function

### 3.1 Sync UI with STM State

```javascript
const { startButton, stopButton, undoButton, transactionCombo, redoButton, commitButton, addButton, removeButton } = grid.widgetMap;

const updateUndoRedoControls = (recording) => {
    if (!recording) {
        // Disable editing
        grid.readOnly = true;

        // Toggle buttons
        startButton.enable();
        stopButton.disabled = addButton.disabled = removeButton.disabled = true;

        // Show undo/redo counts as badges
        undoButton.badge = stm.position || null;
        redoButton.badge = stm.length - stm.position || null;

        // Enable/disable based on STM state
        undoButton.disabled = !stm.canUndo;
        redoButton.disabled = !stm.canRedo;
        commitButton.disabled = !stm.canUndo;

        transactionCombo.disabled = false;

        // Populate transaction combo
        const data = stm.queue.map((title, idx) => ({
            idx: idx + 1,
            text: title
        }));

        data.splice(0, 0, {
            idx: 0,
            text: 'No transactions'
        });

        transactionCombo.store.data = data;
        transactionCombo.value = stm.position;
    }
    else {
        // Allow editing during recording
        grid.readOnly = false;

        // Toggle buttons
        startButton.disable();
        stopButton.disabled = addButton.disabled = removeButton.disabled = false;
    }
};

// Initialize controls
updateUndoRedoControls();
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { StateTrackingManager, Toast } from '@bryntum/grid';
import { useState, useRef, useCallback, useMemo } from 'react';

function TransactionalGrid({ initialData }) {
    const gridRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [position, setPosition] = useState(0);
    const [length, setLength] = useState(0);
    const [transactions, setTransactions] = useState([{ idx: 0, text: 'No transactions' }]);

    const stm = useMemo(() => new StateTrackingManager({ disabled: false }), []);

    const updateControls = useCallback(() => {
        setPosition(stm.position);
        setLength(stm.length);

        const data = stm.queue.map((title, idx) => ({
            idx: idx + 1,
            text: title
        }));
        data.unshift({ idx: 0, text: 'No transactions' });
        setTransactions(data);
    }, [stm]);

    const startTransaction = useCallback(() => {
        stm.startTransaction(`Transaction ${transactions.length}`);
        setIsRecording(true);
        const grid = gridRef.current?.instance;
        if (grid) grid.readOnly = false;
    }, [stm, transactions.length]);

    const stopTransaction = useCallback(() => {
        stm.stopTransaction();
        setIsRecording(false);
        const grid = gridRef.current?.instance;
        if (grid) grid.readOnly = true;
        updateControls();
        Toast.show('Transaction saved');
    }, [stm, updateControls]);

    const undo = useCallback(() => {
        if (stm.canUndo) {
            stm.undo();
            updateControls();
        }
    }, [stm, updateControls]);

    const redo = useCallback(() => {
        if (stm.canRedo) {
            stm.redo();
            updateControls();
        }
    }, [stm, updateControls]);

    const commit = useCallback(() => {
        const grid = gridRef.current?.instance;
        if (grid) {
            grid.store.commit();
            stm.resetQueue();
            updateControls();
            Toast.show('Changes committed');
        }
    }, [stm, updateControls]);

    const jumpToTransaction = useCallback((idx) => {
        if (idx > stm.position) {
            stm.redo(idx - stm.position);
        } else if (idx < stm.position) {
            stm.undo(stm.position - idx);
        }
        updateControls();
    }, [stm, updateControls]);

    const gridConfig = {
        readOnly: !isRecording,

        features: {
            cellEdit: true,
            stripe: true
        },

        store: {
            stm,
            data: initialData
        },

        columns: [
            { text: 'First name', field: 'firstName', flex: 1 },
            { text: 'Surname', field: 'surName', flex: 1 },
            { text: 'City', field: 'city', flex: 1 },
            { type: 'rating', text: 'Rating', field: 'rating' }
        ]
    };

    return (
        <div className="transactional-grid">
            <div className="toolbar">
                <button onClick={startTransaction} disabled={isRecording}>
                    Start
                </button>
                <button onClick={stopTransaction} disabled={!isRecording}>
                    Stop
                </button>
                <button onClick={undo} disabled={position === 0 || isRecording}>
                    Undo ({position})
                </button>
                <select
                    value={position}
                    onChange={(e) => jumpToTransaction(parseInt(e.target.value))}
                    disabled={isRecording}
                >
                    {transactions.map(t => (
                        <option key={t.idx} value={t.idx}>{t.text}</option>
                    ))}
                </select>
                <button onClick={redo} disabled={position === length || isRecording}>
                    Redo ({length - position})
                </button>
                <button onClick={commit} disabled={position === 0 || isRecording}>
                    Commit
                </button>
            </div>

            <BryntumGrid
                ref={gridRef}
                {...gridConfig}
            />
        </div>
    );
}
```

---

## 5. Styling

```css
/* Team badge */
.team-badge {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-block;
}

/* Transaction toolbar */
.toolbar {
    display: flex;
    gap: 8px;
    padding: 8px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

/* Button badges */
.toolbar button .badge {
    background: #1976d2;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 10px;
    margin-left: 4px;
}

/* Recording indicator */
.recording-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    background: #FFEBEE;
    border-radius: 4px;
    color: #f44336;
}

.recording-indicator::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #f44336;
    border-radius: 50%;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Commit button */
button.commit {
    background: #4CAF50;
    color: white;
}

/* Disabled state */
button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Transaction combo */
.transaction-combo {
    min-width: 200px;
}

/* Modified cell indicator */
.b-grid-cell.b-dirty::after {
    content: '*';
    color: #f44336;
    font-weight: bold;
    margin-left: 4px;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Wijzigingen niet tracked | Store niet geregistreerd | Voeg stm toe aan store config |
| Undo werkt niet | Geen transactie gestart | Start transactie eerst |
| Grid niet editable | readOnly: true | Disable tijdens recording |
| Commit reset niet | resetQueue() niet aangeroepen | Voeg stm.resetQueue() toe |

---

## API Reference

### StateTrackingManager Config

| Property | Type | Description |
|----------|------|-------------|
| `disabled` | Boolean | Disable tracking |

### STM Methods

| Method | Description |
|--------|-------------|
| `startTransaction(title)` | Start recording |
| `stopTransaction()` | Stop recording |
| `undo(steps)` | Undo transactions |
| `redo(steps)` | Redo transactions |
| `resetQueue()` | Clear history |

### STM Properties

| Property | Type | Description |
|----------|------|-------------|
| `position` | Number | Current position |
| `length` | Number | Total transactions |
| `queue` | String[] | Transaction titles |
| `canUndo` | Boolean | Can undo |
| `canRedo` | Boolean | Can redo |

### Store Methods

| Method | Description |
|--------|-------------|
| `commit()` | Accept all changes |

---

## Bronnen

- **Example**: `examples/transaction/`
- **StateTrackingManager**: `Core.data.stm.StateTrackingManager`

---

*Priority 2: Medium Priority Features*
