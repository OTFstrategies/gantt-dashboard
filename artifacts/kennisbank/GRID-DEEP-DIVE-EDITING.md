# Grid Deep Dive: Editing

> **Uitgebreide analyse** van het Bryntum Grid editing-systeem: cell editing, row editing, custom editors, validatie, en batch editing.

---

## Overzicht

Grid Editing wordt verzorgd door twee features:
- **CellEdit** - Inline editing van individuele cellen (default aan)
- **RowEdit** - Modal editing van hele rijen in een popup

---

## 1. CellEdit Feature

### 1.1 Basic Configuration

```javascript
features: {
    cellEdit: true                      // Default: enabled
}

// Disable cell editing
features: {
    cellEdit: false
}

// Advanced config
features: {
    cellEdit: {
        addNewAtEnd     : true,         // Tab past last cell adds new row
        autoSelect      : true,         // Auto-select cell content
        scrollAction    : 'complete',   // On scroll: 'complete' | 'cancel' | null
        tabToFocusables : true          // Tab moves to next editable cell
    }
}
```

### 1.2 API Methods

```javascript
const cellEdit = grid.features.cellEdit;

// Start editing
grid.startEditing({
    record : record,
    column : grid.columns.get('name')
});

// OF met indices
grid.startEditing({
    rowIndex   : 0,
    columnIndex: 1
});

// Finish editing
await grid.finishEditing();

// Cancel editing
grid.cancelEditing();

// Check if editing
const isEditing = cellEdit.isEditing;
```

### 1.3 Confirmation Dialog

```javascript
features: {
    cellEdit: true
},
columns: [
    {
        field            : 'start',
        type             : 'date',
        finalizeCellEdit : async ({ value, grid }) => {
            if (value > new Date()) {
                return grid.features.cellEdit.confirm({
                    title   : 'Future Date',
                    message : 'Are you sure you want to use a future date?'
                });
            }
            return true;
        }
    }
]
```

---

## 2. Column Editor Configuration

### 2.1 Basic Editor Types

```javascript
// Text (default)
{ field: 'name', editor: true }
{ field: 'name', editor: 'text' }
{ field: 'name', editor: { type: 'text' } }

// Number
{ field: 'score', editor: 'number' }
{ field: 'score', editor: { type: 'number', min: 0, max: 100 } }

// Date
{ field: 'date', type: 'date', editor: { type: 'date', format: 'YYYY-MM-DD' } }

// Time
{ field: 'time', type: 'time' }

// Disable editing
{ field: 'id', editor: false }
{ field: 'id', readOnly: true }
```

### 2.2 Combo Editor

```javascript
{
    field  : 'city',
    editor : {
        type     : 'combo',
        items    : ['Amsterdam', 'Berlin', 'London', 'Paris'],
        editable : false              // No free text input
    }
}

// With value/text pairs
{
    field  : 'status',
    editor : {
        type  : 'combo',
        items : [
            { value: 1, text: 'Active' },
            { value: 2, text: 'Inactive' },
            { value: 3, text: 'Pending' }
        ]
    }
}

// Dropdown (simplified combo)
{
    field  : 'city',
    editor : {
        type  : 'dropdown',
        items : DataGenerator.cities
    }
}
```

### 2.3 Date/Time Editors

```javascript
// Date with step triggers
{
    type   : 'date',
    field  : 'startDate',
    editor : {
        type       : 'date',
        format     : 'YYYY-MM-DD',
        min        : new Date(2020, 0, 1),
        max        : new Date(2030, 11, 31),
        step       : '1d',              // Step by 1 day
        autoExpand : true               // Open picker on focus
    }
}

// Date without step triggers
{
    type   : 'date',
    field  : 'startDate',
    editor : { step: 0 }                // Disable step triggers
}

// Time
{
    type   : 'time',
    field  : 'time',
    editor : {
        type   : 'time',
        format : 'HH:mm',
        step   : null                   // Disable step triggers
    }
}
```

### 2.4 Textarea Editor

```javascript
{
    field  : 'notes',
    editor : {
        type : 'textareapickerfield'    // Popup textarea
    }
}
```

### 2.5 Number Editor

```javascript
{
    field  : 'amount',
    type   : 'number',
    editor : {
        type          : 'number',
        min           : 0,
        max           : 10000,
        step          : 100,
        format        : '0,000.00',
        instantUpdate : true            // Update on keystroke
    }
}
```

---

## 3. Custom Editors

### 3.1 Create Custom Widget

```javascript
import { Widget, EventHelper } from '@bryntum/grid';

class YesNoEditor extends Widget {
    static $name = 'YesNo';
    static type = 'yesno';

    // Required: validity check
    get isValid() {
        return true;
    }

    // Required: value getter
    get value() {
        return Boolean(this._value);
    }

    // Required: value setter
    set value(value) {
        this._value = value;
        this.syncInputFieldValue();
    }

    // Required: update display
    syncInputFieldValue() {
        if (this.element) {
            this.element.innerText = this.value ? 'Yes' : 'No';
            this.element.classList.toggle('yes', this.value);
        }
    }

    // HTML template
    template() {
        return '<button class="yesno"></button>';
    }

    construct(config) {
        super.construct(config);

        EventHelper.on({
            element : this.element,
            click   : () => { this.value = !this.value; },
            thisObj : this
        });
    }
}

// Register the widget
YesNoEditor.initClass();
```

### 3.2 Use Custom Editor

```javascript
{
    field    : 'approved',
    editor   : 'yesno',                 // Use registered type
    renderer : ({ value }) => value ? 'Yes' : 'No'
}
```

---

## 4. Cell Editor Container

### 4.1 Editor Sizing

```javascript
{
    field      : 'chips',
    cellEditor : {
        matchSize : {
            width  : true,              // Match cell width
            height : false              // Allow overflow
        }
    }
}
```

---

## 5. Validation

### 5.1 finalizeCellEdit

```javascript
{
    field           : 'email',
    finalizeCellEdit: ({ value, oldValue, record }) => {
        // Sync validation
        if (!value.includes('@')) {
            return false;               // Cancel edit
        }
        return true;                    // Accept edit
    }
}

// Async validation
{
    field           : 'username',
    finalizeCellEdit: async ({ value }) => {
        const exists = await checkUsernameExists(value);
        if (exists) {
            Toast.show('Username already exists');
            return false;
        }
        return true;
    }
}

// Reference grid method
{
    field           : 'date',
    finalizeCellEdit: 'up.validateDateEdit'
}
```

### 5.2 Validation Context

```javascript
finalizeCellEdit({
    value,           // New value
    oldValue,        // Previous value
    record,          // The record being edited
    column,          // The column
    grid,            // Grid instance
    inputField,      // Editor widget
    editorContext    // Full context object
}) {
    // Validation logic
}
```

---

## 6. RowEdit Feature

### 6.1 Configuration

```javascript
features: {
    cellEdit : false,                   // Disable cell edit
    rowEdit  : {
        revertButton  : true,           // Show revert button
        instantUpdate : false           // Update on save only
    }
}
```

### 6.2 API Methods

```javascript
const rowEdit = grid.features.rowEdit;

// Start editing
rowEdit.startEdit(record);

// Finish editing
await rowEdit.finishEdit();

// Cancel editing
rowEdit.cancelEdit();

// Toggle instant update
rowEdit.instantUpdate = true;
```

### 6.3 Row Editor Config

```javascript
features: {
    rowEdit: {
        // Editor popup config
        editorConfig: {
            title    : 'Edit Record',
            width    : 600,
            centered : true
        },

        // Bottom bar buttons
        bbar: {
            items: {
                revertButton : { text: 'Reset' },
                saveButton   : { text: 'Save' },
                cancelButton : { text: 'Cancel' }
            }
        }
    }
}
```

---

## 7. Dirty Tracking

### 7.1 Show Dirty Indicator

```javascript
const grid = new Grid({
    showDirty: true                     // Show changed cell indicator
});

// Advanced config
showDirty: {
    duringEdit : true,                  // Show during edit
    newRecord  : true                   // Show for new records
}
```

### 7.2 Commit/Revert Changes

```javascript
// Commit all changes
grid.store.commit();

// Revert all changes
grid.store.rejectChanges();

// Check for changes
const hasChanges = grid.store.changes !== null;

// Get changes
const changes = grid.store.changes;
// { added: [...], modified: [...], removed: [...] }
```

---

## 8. Edit Events

### 8.1 Cell Edit Events

```javascript
listeners: {
    // Before edit starts
    beforeCellEditStart({ record, column, cell }) {
        if (record.locked) {
            return false;               // Prevent edit
        }
    },

    // After edit starts
    cellEditStart({ record, column, editor }) {
        console.log('Editing:', column.field);
    },

    // Before edit finishes
    beforeFinishCellEdit({ record, column, value, oldValue }) {
        console.log('Changing:', oldValue, '->', value);
    },

    // After edit finishes
    finishCellEdit({ record, column, value, oldValue }) {
        console.log('Changed:', column.field);
    },

    // Edit cancelled
    cancelCellEdit({ record, column }) {
        console.log('Edit cancelled');
    }
}
```

### 8.2 Row Edit Events

```javascript
listeners: {
    beforeRowEditStart({ record }) {
        return !record.locked;
    },

    rowEditStart({ record, editor }) {
        console.log('Editing row:', record.id);
    },

    beforeFinishRowEdit({ record, values }) {
        console.log('Saving:', values);
    },

    finishRowEdit({ record, changes }) {
        console.log('Saved:', changes);
    },

    cancelRowEdit({ record }) {
        console.log('Row edit cancelled');
    }
}
```

---

## 9. Read-Only Mode

### 9.1 Grid Level

```javascript
const grid = new Grid({
    readOnly: true                      // Entire grid read-only
});

// Toggle at runtime
grid.readOnly = true;
```

### 9.2 Column Level

```javascript
{
    field    : 'id',
    readOnly : true                     // Column read-only
}

// OR
{
    field  : 'id',
    editor : false                      // No editor
}
```

### 9.3 Record Level

```javascript
// In model
class MyModel extends Model {
    get readOnly() {
        return this.status === 'locked';
    }
}

// In beforeCellEditStart
listeners: {
    beforeCellEditStart({ record }) {
        return !record.readOnly;
    }
}
```

---

## 10. Batch Editing

### 10.1 Multiple Record Update

```javascript
// Update multiple records at once
grid.store.suspendEvents();

records.forEach(record => {
    record.status = 'approved';
});

grid.store.resumeEvents();

// Single change event
grid.store.trigger('change');
```

### 10.2 beginBatch/endBatch

```javascript
grid.store.beginBatch();

// Multiple operations
grid.store.add({ name: 'New 1' });
grid.store.add({ name: 'New 2' });
grid.store.remove(oldRecord);

grid.store.endBatch();
// Single refresh
```

---

## 11. Add New At End

### 11.1 Configuration

```javascript
features: {
    cellEdit: {
        addNewAtEnd: true               // Tab past last cell adds row
    }
}
```

### 11.2 Tree Support

```javascript
features: {
    cellEdit: {
        addNewAtEnd      : true,
        addToCurrentParent: true        // Add to parent of current record
    }
}
```

---

## 12. Touch Editing

### 12.1 Touch Config

```javascript
{
    field       : 'name',
    touchConfig : {
        editor : false                  // Disable editing on touch devices
    }
}
```

---

## 13. TypeScript Interfaces

```typescript
interface CellEditConfig {
    addNewAtEnd?: boolean;
    addToCurrentParent?: boolean;
    autoEdit?: boolean;
    autoSelect?: boolean;
    blurAction?: 'complete' | 'cancel' | 'none';
    scrollAction?: 'complete' | 'cancel' | null;
    tabToFocusables?: boolean;
    triggerEvent?: string;
}

interface RowEditConfig {
    autoEdit?: boolean;
    bbar?: object;
    editorConfig?: object;
    instantUpdate?: boolean;
    revertButton?: boolean;
    triggerEvent?: string;
}

interface FinalizeCellEditContext {
    value: any;
    oldValue: any;
    record: Model;
    column: Column;
    grid: Grid;
    inputField: Field;
    editorContext: {
        column: Column;
        record: Model;
        cell: HTMLElement;
        editor: Editor;
    };
}

type FinalizeCellEditResult = boolean | Promise<boolean>;
```

---

## 14. Complete Example

```javascript
import { Grid, Widget, EventHelper } from '@bryntum/grid';

// Custom editor widget
class StatusEditor extends Widget {
    static type = 'statuseditor';

    get isValid() { return true; }
    get value() { return this._value; }
    set value(v) {
        this._value = v;
        this.syncInputFieldValue();
    }

    syncInputFieldValue() {
        if (this.element) {
            this.element.textContent = this.value || 'Select...';
        }
    }

    template() {
        return '<div class="status-editor"></div>';
    }
}
StatusEditor.initClass();

// Grid with editing
const grid = new Grid({
    appendTo: 'container',

    features: {
        cellEdit : true,
        sort     : 'name',
        stripe   : true
    },

    showDirty: true,

    columns: [
        { text: 'Name', field: 'name', flex: 1 },
        {
            text   : 'City',
            field  : 'city',
            editor : {
                type  : 'combo',
                items : ['Amsterdam', 'Berlin', 'London']
            }
        },
        {
            text            : 'Score',
            field           : 'score',
            type            : 'number',
            editor          : { type: 'number', min: 0, max: 100 },
            finalizeCellEdit: ({ value }) => {
                if (value < 0 || value > 100) {
                    return false;
                }
                return true;
            }
        },
        {
            text   : 'Start',
            field  : 'start',
            type   : 'date',
            editor : { step: 0 }
        },
        {
            text     : 'Finish',
            field    : 'finish',
            type     : 'date',
            readOnly : true
        },
        {
            text    : 'Status',
            field   : 'status',
            editor  : 'statuseditor'
        }
    ],

    data: [...],

    listeners: {
        beforeCellEditStart({ record, column }) {
            // Prevent editing locked records
            if (record.locked) return false;
        },

        finishCellEdit({ record, column, value, oldValue }) {
            console.log(`Changed ${column.field}: ${oldValue} -> ${value}`);
        }
    }
});
```

---

## Referenties

- Examples: `grid-7.1.0-trial/examples/celledit/`
- Examples: `grid-7.1.0-trial/examples/rowedit/`
- TypeScript: `grid.d.ts` lines 118653-118732 (CellEdit class)

---

*Document gegenereerd: December 2024*
*Bryntum Grid versie: 7.1.0*
