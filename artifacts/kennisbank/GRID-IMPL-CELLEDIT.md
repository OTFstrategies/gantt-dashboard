# Grid Implementation: Cell Editing

> **Cell editing** met custom editors, validatie, dirty tracking, en custom widgets.

---

## Overzicht

Bryntum Grid's CellEdit feature biedt inline editing met diverse editor types.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                        [x] Read-only  [+ Add] [+ Insert] [🗑 Remove]│
├──────────────────────────────────────────────────────────────────────────┤
│  Name  ▼   │ Birthplace │ Team │ Score │ Start   │ Time  │Custom│ %     │
├────────────┼────────────┼──────┼───────┼─────────┼───────┼──────┼───────┤
│  John Doe  │ [Paris ▼]  │ Alpha│ 200 ● │ Jan 15  │ 09:30 │ Yes  │ ███75%│
│  Jane Smith│ London     │ Beta │  85   │ Jan 20  │ 10:00 │ No   │ ██ 50%│
│  Bob Wilson│ Berlin     │ Gamma│  92   │ Feb 01  │ 08:45 │ Yes  │ █ 25% │
├────────────┴────────────┴──────┴───────┴─────────┴───────┴──────┴───────┤
│                                                                          │
│  ● = dirty (modified)     [Paris ▼] = dropdown editor                   │
│                                                                          │
│  EDITOR TYPES:                                                           │
│  📝 Text   🔢 Number   📅 Date   ⏰ Time   ☑️ YesNo   📊 Percent         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic Cell Edit Setup

### 1.1 Enable Cell Editing

```javascript
import { Grid, DataGenerator, DateHelper, Widget, EventHelper } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        cellEdit: true,
        sort: 'name',
        stripe: true
    },

    // Show dirty indicator on modified cells
    showDirty: true,

    columns: [
        { text: 'Name', field: 'name', flex: 1 },
        {
            text: 'Birthplace',
            field: 'city',
            width: '10em',
            editor: {
                type: 'dropdown',
                items: DataGenerator.cities
            }
        },
        { text: 'Team', field: 'team', flex: 1 },
        { text: 'Score', field: 'score', editor: 'number', width: '6em' },
        {
            text: 'Start',
            id: 'start',
            type: 'date',
            field: 'start',
            width: '9em',
            editor: { step: 0 }  // Hide step triggers
        },
        {
            text: 'Finish (readonly)',
            type: 'date',
            field: 'finish',
            width: '10em',
            editor: false  // No editor = readonly
        },
        {
            text: 'Time',
            id: 'time',
            type: 'time',
            field: 'time',
            width: '10em',
            editor: { step: null }
        },
        { type: 'percent', text: 'Percent', field: 'percent', flex: 1 }
    ],

    data: DataGenerator.generateData(50)
});

// Show dirty marker on first record
grid.store.getAt(0).score = 200;
```

---

## 2. Custom Widget Editor

### 2.1 YesNo Toggle Widget

```javascript
// Custom YesNo widget
class YesNo extends Widget {
    static $name = 'YesNo';
    static type = 'yesno';

    construct(config) {
        super.construct(config);

        EventHelper.on({
            element: this.element,
            click: 'onClick',
            thisObj: this
        });
    }

    // Required by CellEdit feature
    get isValid() {
        return true;
    }

    get value() {
        return Boolean(this._value);
    }

    set value(value) {
        this._value = value;
        this.syncInputFieldValue();
    }

    // Update display on locale change
    syncInputFieldValue() {
        const { element, value } = this;

        if (element) {
            element.classList[value ? 'add' : 'remove']('yes');
            element.innerText = value
                ? this.L('L{Object.Yes}')
                : this.L('L{Object.No}');
        }
    }

    template() {
        return `<button class="yesno"></button>`;
    }

    onClick() {
        this.value = !this.value;
    }
}

// Register widget type
YesNo.initClass();

// Use in column
columns: [
    {
        text: 'Custom',
        field: 'done',
        editor: 'yesno',
        width: '7.5em',
        renderer: ({ value }) => value
            ? YesNo.L('L{Object.Yes}')
            : YesNo.L('L{Object.No}')
    }
]
```

---

## 3. Validation

### 3.1 Async Validation with Confirmation

```javascript
const grid = new Grid({
    appendTo: 'container',

    // Validation function
    async validateStartDateEdit({ grid, value }) {
        if (value > DateHelper.clearTime(new Date())) {
            // Show confirmation dialog
            return grid.features.cellEdit.confirm({
                title: 'Selected date in future',
                message: 'Update field?'
            });
        }
        return true;
    },

    columns: [
        {
            text: 'Start',
            type: 'date',
            field: 'start',
            // Link to validation function
            finalizeCellEdit: 'up.validateStartDateEdit',
            editor: { step: 0 }
        }
    ]
});
```

### 3.2 Inline Validation

```javascript
columns: [
    {
        text: 'Score',
        field: 'score',
        type: 'number',
        editor: {
            type: 'number',
            min: 0,
            max: 100,
            // Real-time validation
            validate: value => {
                if (value < 0) return 'Score must be positive';
                if (value > 100) return 'Score cannot exceed 100';
                return true;
            }
        }
    }
]
```

---

## 4. CRUD Toolbar

### 4.1 Add, Insert, Remove Buttons

```javascript
let newPlayerCount = 0;

const grid = new Grid({
    appendTo: 'container',

    features: { cellEdit: true },

    listeners: {
        selectionChange({ selection }) {
            removeButton.disabled = !selection.length || grid.readOnly;
        }
    },

    tbar: [
        {
            type: 'slidetoggle',
            ref: 'readOnlyToggle',
            text: 'Read-only',
            tooltip: 'Toggles read-only mode',
            onChange: ({ checked }) => {
                addButtonGroup.disabled = grid.readOnly = checked;
                removeButton.disabled = checked || !grid.selectedRecords.length;
            }
        },
        {
            type: 'buttongroup',
            ref: 'addButtonGroup',
            items: [
                {
                    type: 'button',
                    ref: 'addButton',
                    icon: 'fa-plus-circle',
                    text: 'Add',
                    tooltip: 'Adds a new row at bottom',
                    onAction: () => {
                        const counter = ++newPlayerCount;
                        const added = grid.store.add({
                            name: `New player ${counter}`,
                            cls: `new_player_${counter}`
                        });
                        grid.selectedRecord = added[0];
                    }
                },
                {
                    type: 'button',
                    ref: 'insertButton',
                    icon: 'fa-plus-square',
                    text: 'Insert',
                    tooltip: 'Inserts row below selected',
                    onAction: () => {
                        let index = 0;

                        if (grid.selectedRecords) {
                            index = Math.max(
                                ...grid.selectedRecords.map(r => grid.store.indexOf(r))
                            ) + 1;
                        }

                        const counter = ++newPlayerCount;
                        const added = grid.store.insert(index, {
                            name: `New player ${counter}`
                        });
                        grid.selectedRecord = added[0];
                    }
                }
            ]
        },
        {
            type: 'button',
            ref: 'removeButton',
            color: 'red',
            icon: 'fa fa-trash',
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
        }
    ]
});

const { addButtonGroup, removeButton } = grid.widgetMap;
```

---

## 5. Editor Types

### 5.1 Built-in Editors

```javascript
columns: [
    // Text editor (default)
    { text: 'Name', field: 'name', editor: 'text' },

    // Number editor
    { text: 'Score', field: 'score', editor: 'number' },

    // Date editor
    { text: 'Date', field: 'date', type: 'date', editor: { step: 0 } },

    // Time editor
    { text: 'Time', field: 'time', type: 'time', editor: { step: null } },

    // Dropdown/Combo editor
    {
        text: 'City',
        field: 'city',
        editor: {
            type: 'combo',
            items: ['Paris', 'London', 'Berlin', 'New York']
        }
    },

    // Checkbox editor
    { text: 'Active', field: 'active', type: 'check' },

    // Percent editor
    { text: 'Progress', field: 'percent', type: 'percent' },

    // No editor (readonly)
    { text: 'ID', field: 'id', editor: false }
]
```

### 5.2 Custom Editor Configuration

```javascript
{
    text: 'Rating',
    field: 'rating',
    editor: {
        type: 'slider',
        min: 0,
        max: 5,
        step: 0.5,
        showValue: true
    }
}
```

---

## 6. React Integration

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
            cellEdit: true,
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

## 7. Styling

```css
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

/* Editor styling */
.b-grid .b-editor {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.b-grid .b-editor .b-textfield {
    background: white;
}

/* YesNo custom widget */
.yesno {
    padding: 4px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #e0e0e0;
    color: #666;
}

.yesno.yes {
    background: #4CAF50;
    color: white;
}

/* Invalid cell */
.b-grid-cell.b-invalid {
    background: rgba(244, 67, 54, 0.1);
}

.b-grid-cell.b-invalid::before {
    content: '!';
    color: #f44336;
    font-weight: bold;
    margin-right: 4px;
}

/* Read-only mode */
.b-grid.b-readonly .b-grid-cell {
    opacity: 0.8;
}

/* Toolbar buttons */
.toolbar button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Editing niet actief | Feature disabled | Enable cellEdit feature |
| Column niet editable | editor: false | Verwijder of wijzig editor |
| Dirty niet zichtbaar | showDirty: false | Zet showDirty: true |
| Validation werkt niet | finalizeCellEdit mist | Voeg validation function toe |
| Custom widget werkt niet | Widget niet geregistreerd | Roep Widget.initClass() aan |

---

## API Reference

### CellEdit Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `disabled` | Boolean | Disable editing |
| `autoEdit` | Boolean | Start editing on keystroke |

### Column Editor Config

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | Editor type |
| `step` | Number | Step for numeric editors |
| `min` | Number | Minimum value |
| `max` | Number | Maximum value |
| `items` | Array | Options for combo |
| `validate` | Function | Validation function |

### Grid Config

| Property | Type | Description |
|----------|------|-------------|
| `showDirty` | Boolean | Show dirty indicators |
| `readOnly` | Boolean | Disable all editing |

### Methods

| Method | Description |
|--------|-------------|
| `confirm(config)` | Show confirmation dialog |
| `startEditing(config)` | Start editing a cell |
| `finishEditing()` | Complete current edit |
| `cancelEditing()` | Cancel current edit |

---

## Bronnen

- **Example**: `examples/celledit/`
- **CellEdit Feature**: `Grid.feature.CellEdit`
- **Widget Class**: `Core.widget.Widget`

---

*Priority 2: Medium Priority Features*
