# Grid Implementation: Widget Column

> **Embedded widgets** in grid cellen, custom column types met buttons, sliders, checkboxes, en veld-binding voor interactieve data editing.

---

## Overzicht

Widget columns embedden interactieve UI componenten direct in grid cellen. Dit maakt rijke editing en visualisatie mogelijk zonder popups.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Name       │ Age │ Buttons │ Name Field   │ Age Slider  │ Checks  │ Prog │
├──────────────────────────────────────────────────────────────────────────┤
│ John Doe   │ 28  │ [-] [+] │ [John Doe  ] │ ○────●────○ │ ☑ ☐ ☑  │ ██▌  │
│ Jane Smith │ 32  │ [-] [+] │ [Jane Smith] │ ○──────●──○ │ ☑ ☑ ☐  │ ███▌ │
│ Mike Brown │ 25  │ [-] [+] │ [Mike Brown] │ ○──●──────○ │ ☐ ☑ ☑  │ ██   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basis Widget Column

### 1.1 Column Type Declaratie

```javascript
import { Grid, Model } from '@bryntum/grid';

class Person extends Model {
    static fields = [
        'name',
        'age',
        'verified',
        'approved',
        'reviewed'
    ];
}

const grid = new Grid({
    appendTo: 'container',
    rowHeight: 60,

    columns: [
        { text: 'Name', field: 'name', flex: 1 },
        { text: 'Age', field: 'age', type: 'number' },
        {
            text: 'Actions',
            type: 'widget',
            width: 120,
            widgets: [
                // Widget configuraties
            ]
        }
    ],

    store: {
        modelClass: Person,
        data: [...]
    }
});
```

### 1.2 Button Widgets

```javascript
{
    text: 'Buttons',
    type: 'widget',
    align: 'center',
    width: 120,
    widgets: [
        {
            type: 'button',
            icon: 'fa fa-minus',
            rendition: 'tonal',
            onAction: ({ source: btn }) => {
                // Toegang tot record via cellInfo
                btn.cellInfo.record.age--;
            }
        },
        {
            type: 'button',
            icon: 'fa fa-plus',
            rendition: 'tonal',
            onAction: ({ source: btn }) => {
                btn.cellInfo.record.age++;
            }
        }
    ]
}
```

---

## 2. Field-Bound Widgets

### 2.1 TextField Binding

```javascript
{
    text: 'Name Editor',
    type: 'widget',
    width: 200,
    widgets: [
        {
            type: 'textfield',
            name: 'name',  // Binding naar record.name
            ariaLabel: 'Change name'
        }
    ]
}
```

### 2.2 Slider Binding

```javascript
{
    text: 'Age Slider',
    type: 'widget',
    width: 250,
    cls: 'slidercell',
    widgets: [
        {
            type: 'slider',
            name: 'age',  // Binding naar record.age
            min: 0,
            max: 100,
            triggerChangeOnInput: true,
            showValue: 'thumb'  // Toon waarde in slider thumb
        }
    ]
}
```

### 2.3 Checkbox Binding

```javascript
{
    text: 'Checkboxes',
    type: 'widget',
    align: 'center',
    width: 200,
    widgets: [
        {
            type: 'checkbox',
            tooltip: 'Reviewed',
            name: 'reviewed',
            ariaLabel: 'Toggle reviewed'
        },
        {
            type: 'checkbox',
            tooltip: 'Verified',
            name: 'verified',
            ariaLabel: 'Toggle verified'
        },
        {
            type: 'checkbox',
            tooltip: 'Approved',
            name: 'approved',
            ariaLabel: 'Toggle approved'
        }
    ]
}
```

---

## 3. cellInfo Object

Elke widget heeft toegang tot `cellInfo`:

```javascript
{
    type: 'button',
    text: 'Action',
    onAction({ source: widget }) {
        const {
            record,    // Het data record
            column,    // De column instance
            row,       // De row instance
            cell,      // Het cell DOM element
            grid       // De grid instance
        } = widget.cellInfo;

        console.log('Record:', record.name);
        console.log('Column:', column.field);
    }
}
```

---

## 4. afterRenderCell Hook

### 4.1 Widget Manipulatie

```javascript
{
    text: 'Conditional Widgets',
    type: 'widget',
    width: 200,
    widgets: [
        { type: 'button', text: 'Edit', ref: 'editBtn' },
        { type: 'button', text: 'Delete', ref: 'deleteBtn' }
    ],

    afterRenderCell({ widgets, record }) {
        // Toegang tot widgets na render
        const [editBtn, deleteBtn] = widgets;

        // Conditional visibility
        editBtn.hidden = !record.editable;
        deleteBtn.hidden = !record.deletable;

        // Conditional styling
        if (record.priority === 'high') {
            deleteBtn.color = 'b-red';
        }
    }
}
```

### 4.2 Dynamic Widget State

```javascript
{
    type: 'widget',
    widgets: [
        { type: 'slider', name: 'progress', max: 100 }
    ],

    afterRenderCell({ widgets, record }) {
        const [slider] = widgets;

        // Disable based on status
        slider.disabled = record.status === 'completed';

        // Change color based on value
        slider.cls = record.progress < 50 ? 'low' : 'ok';
    }
}
```

---

## 5. Progress Indicator Column

Combineert checkbox widgets met progress visualisatie:

```javascript
{
    text: 'Status',
    type: 'widget',
    align: 'center',
    width: 200,
    widgets: [
        { type: 'checkbox', name: 'step1', tooltip: 'Step 1' },
        { type: 'checkbox', name: 'step2', tooltip: 'Step 2' },
        { type: 'checkbox', name: 'step3', tooltip: 'Step 3' }
    ]
},
{
    text: 'Progress',
    cellCls: 'progresscell',
    editor: false,
    renderer({ record }) {
        const steps = [record.step1, record.step2, record.step3];
        const completed = steps.filter(Boolean).length;
        const percent = (completed / steps.length) * 100;

        return {
            class: 'progressbar',
            style: `height: ${percent}%`
        };
    }
}
```

---

## 6. Common Widget Types

### 6.1 Button

```javascript
{
    type: 'button',
    text: 'Click',
    icon: 'fa fa-check',
    color: 'b-blue',
    rendition: 'tonal',  // 'text', 'filled', 'outlined'
    onAction: handler
}
```

### 6.2 TextField

```javascript
{
    type: 'textfield',
    name: 'fieldName',
    placeholder: 'Enter value',
    clearable: true
}
```

### 6.3 NumberField

```javascript
{
    type: 'numberfield',
    name: 'quantity',
    min: 0,
    max: 100,
    step: 1
}
```

### 6.4 Slider

```javascript
{
    type: 'slider',
    name: 'progress',
    min: 0,
    max: 100,
    showValue: true,
    triggerChangeOnInput: true
}
```

### 6.5 Checkbox

```javascript
{
    type: 'checkbox',
    name: 'active',
    text: 'Active',
    tooltip: 'Toggle active state'
}
```

### 6.6 Combo

```javascript
{
    type: 'combo',
    name: 'status',
    items: ['Pending', 'Active', 'Completed'],
    editable: false
}
```

---

## 7. Multiple Widgets Layout

### 7.1 Inline Layout (Default)

```javascript
{
    type: 'widget',
    widgets: [
        { type: 'button', icon: 'fa fa-edit' },
        { type: 'button', icon: 'fa fa-trash' }
    ]
    // Widgets verschijnen naast elkaar
}
```

### 7.2 Custom Layout via CSS

```css
/* Stack widgets vertically */
.vertical-widgets .b-widget-column-cell {
    flex-direction: column;
    gap: 0.25em;
}

/* Equal width buttons */
.equal-buttons .b-button {
    flex: 1;
}
```

---

## 8. Styling

### 8.1 Cell Styling

```css
/* Widget column cell */
.b-widget-column .b-grid-cell {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.25em;
}

/* Slider cell */
.slidercell .b-slider {
    width: 100%;
}

/* Progress bar */
.progresscell {
    position: relative;
    padding: 0 !important;
}

.progressbar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--b-green-400);
    transition: height 0.3s;
}
```

### 8.2 Row Height Adjustment

```javascript
const grid = new Grid({
    rowHeight: 60,  // Verhoog voor grotere widgets
    fillLastColumn: false
});
```

---

## 9. Editing vs Widget Column

### 9.1 Wanneer Widget Column

- Real-time updates zonder edit mode
- Meerdere interactieve elementen per cel
- Complexe UI (sliders, multi-checkbox)
- Altijd zichtbare controls

### 9.2 Wanneer Standard Editor

- Occasional editing
- Simple text/number input
- Popup editors OK
- Space efficient

---

## 10. Performance Tips

### 10.1 Minimize Widget Creation

```javascript
// Widgets worden hergebruikt bij scroll
// Gebruik afterRenderCell voor dynamic state

{
    type: 'widget',
    widgets: [
        { type: 'button', text: 'Action' }
    ],
    afterRenderCell({ widgets, record }) {
        // Update bestaande widget, niet recreate
        widgets[0].disabled = record.locked;
    }
}
```

### 10.2 Lightweight Widgets

```javascript
// Prefer simple widgets
{ type: 'button' }  // ✓ Lightweight

// Avoid complex widgets in large grids
{ type: 'grid' }    // ✗ Heavy
```

---

## 11. React Integratie

```jsx
import { BryntumGrid } from '@bryntum/grid-react';

function WidgetColumnGrid({ data }) {
    const columns = [
        { text: 'Name', field: 'name', flex: 1 },
        {
            text: 'Actions',
            type: 'widget',
            width: 120,
            widgets: [
                {
                    type: 'button',
                    icon: 'fa fa-edit',
                    onAction: ({ source }) => {
                        const record = source.cellInfo.record;
                        handleEdit(record);
                    }
                },
                {
                    type: 'button',
                    icon: 'fa fa-trash',
                    onAction: ({ source }) => {
                        const record = source.cellInfo.record;
                        handleDelete(record);
                    }
                }
            ]
        }
    ];

    return <BryntumGrid columns={columns} data={data} rowHeight={60} />;
}
```

---

## 12. Custom Widget Types

### 12.1 Registreer Custom Widget

```javascript
import { Widget } from '@bryntum/grid';

class StarRating extends Widget {
    static $name = 'StarRating';
    static type = 'starrating';

    static configurable = {
        value: 0,
        max: 5
    };

    compose() {
        return {
            children: Array.from({ length: this.max }, (_, i) => ({
                tag: 'i',
                class: i < this.value ? 'fa fa-star' : 'fa fa-star-o',
                onclick: () => this.onStarClick(i + 1)
            }))
        };
    }

    onStarClick(rating) {
        this.value = rating;
        if (this.cellInfo) {
            this.cellInfo.record[this.name] = rating;
        }
        this.trigger('change', { value: rating });
    }
}

StarRating.initClass();

// Gebruik
{
    type: 'widget',
    widgets: [
        { type: 'starrating', name: 'rating', max: 5 }
    ]
}
```

---

## 13. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Widgets overlappen | rowHeight te klein | Verhoog `rowHeight` |
| Binding werkt niet | `name` property ontbreekt | Voeg `name: 'fieldName'` toe |
| Click werkt niet | Event niet gedelegeerd | Gebruik widget `onAction` |
| Re-render issues | State niet in record | Bewaar state in record |

---

## Bronnen

- **Example**: `examples/widgetcolumn/`
- **WidgetColumn**: `Grid.column.WidgetColumn`
- **Widget API**: `Core.widget.Widget`

---

*Track A: Foundation - Grid Core Extensions (A1.10)*
