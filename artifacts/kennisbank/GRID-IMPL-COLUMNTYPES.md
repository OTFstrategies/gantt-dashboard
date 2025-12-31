# Grid Implementation: Column Types

> **Column Types** voor diverse ingebouwde en custom kolom types.

---

## Overzicht

Bryntum Grid biedt vele ingebouwde kolom types en de mogelijkheid om custom types te maken.

```
+--------------------------------------------------------------------------+
| GRID                                                                      |
+--------------------------------------------------------------------------+
| # |Template | Chips       |Percent|Widget|Num|Status  |Date    |Rating   |
+---+---------+-------------+-------+------+---+--------+--------+---------+
| 1 |Hi John! |[JS][React]  |███ 75%| [+]  |32 |●Review |Dec 25  |★★★★☆   |
| 2 |Hi Jane! |[CSS][Vue]   |██ 50% | [+]  |28 |●Done   |Dec 26  |★★★☆☆   |
| 3 |Hi Bob!  |[TS]         |█ 25%  | [+]  |45 |●Todo   |Dec 27  |★★☆☆☆   |
+--------------------------------------------------------------------------+
|                                                                          |
|  BUILT-IN COLUMN TYPES:                                                  |
|    rownumber, template, widget, percent, number, date, time              |
|    rating, action, check, tree, aggregate                                |
|                                                                          |
|  CUSTOM COLUMN TYPES:                                                    |
|    Extend Column class and register with ColumnStore                     |
+--------------------------------------------------------------------------+
```

---

## 1. Built-in Column Types

### 1.1 Complete Example

```javascript
import { Toast, Grid, DataGenerator, Column, ColumnStore, StringHelper } from '@bryntum/grid';

// Custom Status Column
class StatusColumn extends Column {
    static type = 'status';

    static defaults = {
        align: 'center',
        field: 'status',
        editor: {
            type: 'combo',
            editable: false,
            autoExpand: true,
            items: [
                [0, 'Todo'],
                [1, 'In progress'],
                [2, 'Review'],
                [3, 'Finished']
            ]
        }
    };

    renderer({ value }) {
        const colors = {
            0: 'blue',
            1: 'orange',
            2: 'red',
            3: 'green'
        };

        if (typeof value === 'number') {
            return {
                className: { 'status-tag': true },
                style: { '--color': `var(--b-color-${colors[value] || 'gray'})` },
                text: this.editor.items[value]?.text
            };
        }
        return '';
    }
}

// Register custom column
ColumnStore.registerColumnType(StatusColumn);

new Grid({
    appendTo: 'container',

    selectionMode: {
        row: true,
        checkbox: {
            checkCls: 'b-my-checkbox'
        },
        showCheckAll: true
    },

    columns: [
        // Row number column
        { type: 'rownumber' },

        // Template column
        {
            text: 'Template',
            minWidth: 185,
            flex: 1,
            field: 'name',
            type: 'template',
            template: data => StringHelper.xss`Hi ${data.record.name}!`,
            fitMode: 'value',
            editor: { label: 'Name' }
        },

        // Widget column with ChipView
        {
            type: 'widget',
            text: 'Chips',
            field: 'skills',
            width: 300,
            widgets: [{
                type: 'chipview',
                valueProperty: 'items',
                itemsFocusable: false,
                navigator: null,
                closable: false,
                scrollable: null,
                style: {
                    flexFlow: 'row wrap',
                    display: 'flex',
                    padding: '5px 0 3px 0'
                }
            }],
            cellEditor: {
                matchSize: { height: false }
            },
            editor: {
                type: 'combo',
                multiSelect: true,
                editable: false,
                items: DataGenerator.skills
            },
            finalizeCellEdit({ value }) {
                const valid = value.length < 4;
                if (!valid) {
                    Toast.show('Pick max 3 skills');
                }
                return valid;
            }
        },

        // Percent column
        {
            text: 'Percent',
            field: 'percent',
            flex: 1,
            minWidth: 150,
            type: 'percent'
        },

        // Widget column with button
        {
            text: 'Widget',
            width: 90,
            type: 'widget',
            align: 'center',
            widgets: [{
                type: 'button',
                icon: 'fa fa-plus',
                height: '2.3em',
                width: '2.3em',
                minHeight: 0,
                rendition: 'filled',
                color: 'b-blue',
                onAction: ({ source: btn }) => {
                    btn.cellInfo.record.age++;
                }
            }]
        },

        // Number column
        {
            text: 'Number',
            field: 'age',
            width: 90,
            align: 'right',
            type: 'number',
            instantUpdate: true
        },

        // Custom status column
        {
            text: 'Custom rendering',
            width: 160,
            type: 'status'
        },

        // Date column
        {
            text: 'Date',
            field: 'start',
            width: 135,
            type: 'date',
            format: 'MMMM D YYYY'
        },

        // Time column
        {
            text: 'Time',
            field: 'time',
            type: 'time',
            format: 'LT'
        },

        // Link using template
        {
            text: 'Link',
            field: 'name',
            type: 'template',
            width: 120,
            editor: false,
            template: () => `<a href="https://bryntum.com" target="_blank">Click me</a>`
        },

        // Rating column
        {
            type: 'rating',
            text: 'Rating',
            cellCls: 'satisfaction',
            max: 5,
            field: 'rating'
        },

        // Action column
        {
            type: 'action',
            field: 'rating',
            width: 90,
            text: 'Actions',
            align: 'center',
            actions: [{
                cls: 'fa fa-minus',
                tooltip: 'Decrease rating',
                onClick: ({ record }) => {
                    if (record.rating > 1) record.rating--;
                }
            }, {
                cls: 'fa fa-plus',
                tooltip: 'Increase rating',
                onClick: ({ record }) => {
                    if (record.rating < 5) record.rating++;
                }
            }]
        },

        // TextArea editor
        {
            text: 'Notes',
            field: 'notes',
            minWidth: 200,
            flex: 1,
            editor: { type: 'textareapickerfield' }
        },

        // Check column with widget
        {
            type: 'check',
            text: 'Enabled',
            field: 'active',
            widgets: [{
                type: 'slidetoggle',
                ariaLabel: 'Toggle enabled state'
            }]
        },

        // Simple string column
        { text: 'String', field: 'firstName' },

        // Calculated field column
        {
            text: 'Calculated field',
            minWidth: 160,
            field: 'fullName'
        }
    ],

    store: {
        fields: [
            'name', 'firstName', 'surName', 'city', 'notes',
            { name: 'skills', type: 'array' },
            { name: 'age', type: 'number' },
            { name: 'percent', type: 'number' },
            { name: 'active', type: 'boolean' },
            { name: 'rating', type: 'int' },
            { name: 'start', type: 'date' },
            { name: 'time', type: 'date' },
            // Calculated field
            {
                name: 'fullName',
                calculate: record => `${record.firstName || ''} ${record.surName || ''}`
            }
        ],
        data: DataGenerator.generateData({
            count: 50,
            addSkills: 3,
            rowCallback(data) {
                data.status = (data.id % 5) % 4;
            }
        })
    }
});
```

---

## 2. Creating Custom Column Types

### 2.1 Custom Column Class

```javascript
import { Column, ColumnStore } from '@bryntum/grid';

class PriorityColumn extends Column {
    static type = 'priority';

    static defaults = {
        align: 'center',
        field: 'priority',
        width: 100,
        editor: {
            type: 'combo',
            items: ['Low', 'Medium', 'High', 'Critical']
        }
    };

    renderer({ value }) {
        const colors = {
            'Low': 'green',
            'Medium': 'blue',
            'High': 'orange',
            'Critical': 'red'
        };

        return {
            tag: 'span',
            class: 'priority-badge',
            style: {
                backgroundColor: colors[value] || 'gray',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px'
            },
            text: value || '-'
        };
    }
}

// Register the column type
ColumnStore.registerColumnType(PriorityColumn);

// Use in grid
columns: [
    { type: 'priority', text: 'Priority' }
]
```

---

## 3. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { Column, ColumnStore, StringHelper, DataGenerator } from '@bryntum/grid';
import { useMemo } from 'react';

// Register custom column before component
class StatusColumn extends Column {
    static type = 'status';
    static defaults = {
        align: 'center',
        field: 'status'
    };

    renderer({ value }) {
        const labels = ['Todo', 'In Progress', 'Review', 'Done'];
        const colors = ['blue', 'orange', 'red', 'green'];

        return {
            className: 'status-tag',
            style: { '--status-color': colors[value] || 'gray' },
            text: labels[value] || 'Unknown'
        };
    }
}
ColumnStore.registerColumnType(StatusColumn);

function GridWithColumnTypes({ data }) {
    const gridConfig = useMemo(() => ({
        columns: [
            { type: 'rownumber' },
            {
                type: 'template',
                text: 'Greeting',
                field: 'name',
                flex: 1,
                template: ({ record }) => StringHelper.xss`Hello, ${record.name}!`
            },
            {
                type: 'percent',
                text: 'Progress',
                field: 'percent',
                width: 150
            },
            {
                type: 'rating',
                text: 'Rating',
                field: 'rating',
                max: 5
            },
            { type: 'status', text: 'Status', width: 120 },
            {
                type: 'date',
                text: 'Due Date',
                field: 'start',
                format: 'MMM D, YYYY'
            },
            {
                type: 'action',
                text: 'Actions',
                width: 100,
                actions: [
                    {
                        cls: 'fa fa-edit',
                        tooltip: 'Edit',
                        onClick: ({ record }) => console.log('Edit:', record.name)
                    },
                    {
                        cls: 'fa fa-trash',
                        tooltip: 'Delete',
                        onClick: ({ record }) => console.log('Delete:', record.name)
                    }
                ]
            }
        ],

        store: {
            fields: [
                'name',
                { name: 'percent', type: 'number' },
                { name: 'rating', type: 'number' },
                { name: 'status', type: 'number' },
                { name: 'start', type: 'date' }
            ]
        }
    }), []);

    return (
        <BryntumGrid
            data={data}
            {...gridConfig}
        />
    );
}
```

---

## 4. Styling

```css
/* Status tag */
.status-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
    background: var(--color, #e0e0e0);
    color: white;
}

/* Priority badge */
.priority-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 12px;
}

/* Rating column */
.b-rating-cell {
    font-size: 14px;
    letter-spacing: 2px;
}

.b-rating-cell .b-icon-star:not(.b-filled) {
    opacity: 0.3;
}

/* Percent column */
.b-percent-cell .b-percent-bar {
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(to right, #4CAF50, #8BC34A);
}

/* Action column */
.b-action-cell .b-action-button {
    cursor: pointer;
    padding: 4px;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.b-action-cell .b-action-button:hover {
    opacity: 1;
}

/* Check column */
.b-check-cell .b-checkbox {
    margin: 0 auto;
}

/* Widget column */
.b-widget-cell {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Template column */
.b-template-cell a {
    color: #1976d2;
    text-decoration: none;
}

.b-template-cell a:hover {
    text-decoration: underline;
}

/* ChipView in widget column */
.b-chipview .b-chip {
    margin: 2px;
    font-size: 11px;
}
```

---

## 5. Column Type Reference

### Built-in Types

| Type | Description |
|------|-------------|
| `rownumber` | Row number |
| `template` | Template-based rendering |
| `widget` | Widgets in cells |
| `percent` | Progress bar |
| `number` | Numeric value |
| `date` | Date display/editor |
| `time` | Time display/editor |
| `rating` | Star rating |
| `action` | Action buttons |
| `check` | Checkbox |
| `tree` | Tree column |
| `aggregate` | Aggregated values |

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Custom type niet herkend | Niet geregistreerd | Roep registerColumnType aan |
| Renderer niet aangeroepen | Type override mist | Check static type |
| Widget niet interactief | Widget config fout | Check widgets array |
| Template escaped | StringHelper mist | Gebruik StringHelper.xss |

---

## API Reference

### Column Registration

```javascript
// Register custom column
ColumnStore.registerColumnType(MyColumn);

// Or with explicit type name
ColumnStore.registerColumnType(MyColumn, false, 'mytype');
```

### Column Class Structure

```javascript
class MyColumn extends Column {
    static type = 'mytype';          // Type identifier
    static defaults = { /* ... */ }; // Default config

    renderer(params) { /* ... */ }   // Cell renderer
}
```

---

## Bronnen

- **Example**: `examples/columntypes/`
- **Column**: `Grid.column.Column`
- **ColumnStore**: `Grid.data.ColumnStore`

---

*Priority 2: Medium Priority Features*
