# Grid Implementation: Grouping

> **Data grouping** met Group feature, GroupBar, custom group renderers, en multi-level grouping.

---

## Overzicht

Bryntum Grid ondersteunt single en multi-level grouping met customizable group headers en summaries.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                              [Expand all] [Collapse all]            │
├──────────────────────────────────────────────────────────────────────────┤
│ Group by: [Food ▼] [City ▼] [+ Add]                                      │
├──────────────────────────────────────────────────────────────────────────┤
│  Name         │ Age │ City  │ Food  │ Rating │ Jersey │ Actions         │
├───────────────┴─────┴───────┴───────┴────────┴────────┴─────────────────┤
│ ▼ Pizza liked by ages 25 - 45                                    (5)    │
├───────────────┬─────┬───────┬───────┬────────┬────────┬─────────────────┤
│   John Doe    │  35 │ Paris │ Pizza │ ★★★★☆  │ 🟦 Blue│ [−] [+]         │
│   Jane Smith  │  28 │ London│ Pizza │ ★★★☆☆  │ 🟩 Grn │ [−] [+]         │
├───────────────┴─────┴───────┴───────┴────────┴────────┴─────────────────┤
│ ▶ Salad liked by ages 20 - 60                                    (3)    │
├───────────────┴─────┴───────┴───────┴────────┴────────┴─────────────────┤
│ ▶ Burger liked by ages 18 - 55                                   (4)    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic Grouping

### 1.1 Simple Group Setup

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        sort: 'age',
        group: {
            field: 'food'
        }
    },

    columns: [
        { text: 'Name', field: 'name', flex: 1, groupable: false },
        { text: 'Age', field: 'age', width: 120, type: 'number' },
        { text: 'City', field: 'city', flex: 1 },
        { text: 'Food', field: 'food', flex: 1 },
        { type: 'rating', text: 'Rating', field: 'rating', width: 100 }
    ],

    store: {
        data: DataGenerator.generateData(50)
    },

    tbar: [
        {
            type: 'button',
            icon: 'fa-angle-double-down',
            text: 'Expand all',
            onAction: () => grid.expandAll()
        },
        {
            type: 'button',
            icon: 'fa-angle-double-up',
            text: 'Collapse all',
            onAction: () => grid.collapseAll()
        }
    ]
});
```

### 1.2 GroupBar Widget

```javascript
tbar: [
    'Group by',
    {
        type: 'groupbar'  // Drag & drop grouping interface
    },
    '->',
    {
        type: 'button',
        text: 'Expand all',
        onAction: () => grid.expandAll()
    },
    {
        type: 'button',
        text: 'Collapse all',
        onAction: () => grid.collapseAll()
    }
]
```

---

## 2. Custom Group Renderers

### 2.1 Column-Specific GroupRenderer

```javascript
columns: [
    {
        type: 'number',
        text: 'Age',
        field: 'age',
        width: 120,
        // Custom group header for age column
        groupRenderer: ({ groupRowFor, count }) =>
            `Age ${groupRowFor} <span class="b-group-count">${count}</span>`
    },
    {
        text: 'Food',
        field: 'food',
        flex: 1,
        // Complex group renderer with aggregation
        groupRenderer({ groupRowFor, groupRecords, count }) {
            const max = groupRecords.reduce((max, r) => Math.max(r.age || 0, max), 0);
            const min = groupRecords.reduce((min, r) => Math.min(r.age || 0, min), max);

            return `${groupRowFor} liked by ages ${min} - ${max} <span class="b-group-count">${count}</span>`;
        }
    }
]
```

### 2.2 Global Group Renderer

```javascript
features: {
    group: {
        field: 'food',
        // Global renderer for all grouped columns
        renderer({ column, groupColumn, groupRowFor, count, isFirstColumn, record }) {
            // Check which field is grouped
            if (record.meta.groupField === 'rating') {
                // Use RatingColumn's renderer for stars
                if (column.type === 'rating') {
                    return column.renderer({ value: groupRowFor });
                }
                // Custom text for first column
                else if (isFirstColumn) {
                    return `${count} <span style="font-size: .7em">x</span> ${groupRowFor} star ratings`;
                }
            }
        }
    }
}
```

### 2.3 Color Box Group Renderer

```javascript
{
    text: 'Jersey',
    field: 'color',
    width: 140,
    editor: {
        type: 'combo',
        listItemTpl: ({ text }) => StringHelper.xss`
            <div class="combo-color-box" style="background: var(--b-color-${text.toLowerCase()})"></div>
            ${text}
        `,
        editable: false,
        items: DataGenerator.colors
    },
    htmlEncode: false,
    groupRenderer: ({ groupRowFor, count }) => `
        <div class="group-color-box" style="background: var(--b-color-${groupRowFor?.toLowerCase()})"></div>
        ${count} ${groupRowFor} jerseys
    `,
    renderer: ({ value }) => StringHelper.xss`
        <div class="color-box" style="background: var(--b-color-${value?.toLowerCase()})">${value}</div>
    `
}
```

---

## 3. Action Column with Group Actions

```javascript
{
    type: 'action',
    field: 'rating',
    actions: [
        // Individual row actions
        {
            cls: 'fa fa-minus-circle',
            tooltip: 'Decrease rating',
            onClick: ({ record }) => {
                if (record.rating > 1) record.rating--;
            }
        },
        {
            cls: 'fa fa-plus-circle',
            tooltip: 'Increase rating',
            onClick: ({ record }) => {
                if (record.rating < 5) record.rating++;
            }
        },
        // Group-level actions (only shown in group headers)
        {
            cls: 'fa fa-minus',
            showForGroup: true,
            tooltip: 'Decrease rating for all in group',
            onClick: ({ record }) => {
                record?.groupChildren.forEach(r => {
                    if (r.rating > 1) r.rating--;
                });
            }
        },
        {
            cls: 'fa fa-plus',
            showForGroup: true,
            tooltip: 'Increase rating for all in group',
            onClick: ({ record }) => {
                record?.groupChildren.forEach(r => {
                    if (r.rating < 5) r.rating++;
                });
            }
        }
    ]
}
```

---

## 4. Programmatic Grouping

### 4.1 Change Grouping

```javascript
// Group by single field
grid.store.group('city');

// Group by multiple fields
grid.store.group(['city', 'food']);

// Clear grouping
grid.store.clearGroupers();

// Check if grouped
if (grid.store.isGrouped) {
    console.log('Grouped by:', grid.store.groupers);
}
```

### 4.2 Expand/Collapse Groups

```javascript
// Expand all groups
grid.expandAll();

// Collapse all groups
grid.collapseAll();

// Toggle specific group
grid.toggleCollapse(groupRecord);

// Expand specific group
grid.expand(groupRecord);

// Collapse specific group
grid.collapse(groupRecord);
```

---

## 5. Multi-Level Grouping

```javascript
const grid = new Grid({
    appendTo: 'container',

    features: {
        group: true  // Enable grouping
    },

    store: {
        data: DataGenerator.generateData(100),
        // Multi-level grouping
        groupers: [
            { field: 'city', ascending: true },
            { field: 'food', ascending: true }
        ]
    },

    columns: [
        { text: 'Name', field: 'name', flex: 1 },
        { text: 'Age', field: 'age', width: 100 },
        { text: 'City', field: 'city', flex: 1 },
        { text: 'Food', field: 'food', flex: 1 }
    ]
});

// Change groupers programmatically
grid.store.groupers = [
    { field: 'food' },
    { field: 'city' }
];
```

---

## 6. Group Summary

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        group: 'city',
        groupSummary: true  // Enable group summaries
    },

    columns: [
        { text: 'Name', field: 'name', flex: 1 },
        {
            text: 'Age',
            field: 'age',
            width: 100,
            type: 'number',
            // Summary config
            sum: true,  // Show sum in group footer
            summaryRenderer: ({ sum }) => `Total: ${sum}`
        },
        {
            text: 'Score',
            field: 'score',
            width: 100,
            type: 'number',
            // Average summary
            sum: 'average',
            summaryRenderer: ({ sum }) => `Avg: ${sum.toFixed(1)}`
        }
    ],

    data: DataGenerator.generateData(50)
});
```

---

## 7. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useState, useCallback } from 'react';

function GroupableGrid({ data }) {
    const [groupField, setGroupField] = useState('food');

    const handleGroupChange = useCallback((field) => {
        setGroupField(field);
        const grid = document.querySelector('.b-grid')?.bryntum;
        grid?.store.group(field);
    }, []);

    const gridConfig = {
        features: {
            group: {
                field: groupField
            }
        },

        columns: [
            { text: 'Name', field: 'name', flex: 1, groupable: false },
            {
                text: 'Age',
                field: 'age',
                width: 100,
                type: 'number',
                groupRenderer: ({ groupRowFor, count }) =>
                    `Age ${groupRowFor} (${count})`
            },
            {
                text: 'City',
                field: 'city',
                flex: 1,
                groupRenderer: ({ groupRowFor, count }) =>
                    `${groupRowFor} (${count} people)`
            },
            {
                text: 'Food',
                field: 'food',
                flex: 1,
                groupRenderer: ({ groupRowFor, groupRecords }) => {
                    const avgAge = groupRecords.reduce((sum, r) => sum + r.age, 0) / groupRecords.length;
                    return `${groupRowFor} (avg age: ${avgAge.toFixed(0)})`;
                }
            }
        ]
    };

    const expandAll = () => {
        const grid = document.querySelector('.b-grid')?.bryntum;
        grid?.expandAll();
    };

    const collapseAll = () => {
        const grid = document.querySelector('.b-grid')?.bryntum;
        grid?.collapseAll();
    };

    return (
        <div className="groupable-grid">
            <div className="toolbar">
                <label>
                    Group by:
                    <select
                        value={groupField}
                        onChange={(e) => handleGroupChange(e.target.value)}
                    >
                        <option value="food">Food</option>
                        <option value="city">City</option>
                        <option value="age">Age</option>
                    </select>
                </label>
                <button onClick={expandAll}>Expand All</button>
                <button onClick={collapseAll}>Collapse All</button>
            </div>

            <BryntumGrid
                data={data}
                {...gridConfig}
            />
        </div>
    );
}
```

---

## 8. Styling

```css
/* Group header row */
.b-group-row {
    background: #f5f5f5;
    font-weight: bold;
}

.b-group-row:hover {
    background: #eeeeee;
}

/* Group count badge */
.b-group-count {
    background: #9e9e9e;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    margin-left: 8px;
}

/* Group expand/collapse icon */
.b-group-row .b-tree-expander {
    margin-right: 8px;
}

.b-group-row .b-tree-expander::before {
    content: '▶';
    transition: transform 0.2s;
}

.b-group-row.b-expanded .b-tree-expander::before {
    transform: rotate(90deg);
}

/* Color box in group header */
.group-color-box {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    margin-right: 8px;
    vertical-align: middle;
}

/* GroupBar styling */
.b-groupbar {
    background: #fafafa;
    padding: 8px;
    border-radius: 4px;
}

.b-groupbar .b-chip {
    background: #2196F3;
    color: white;
}

/* Group summary row */
.b-group-footer {
    background: #e3f2fd;
    font-style: italic;
}
```

---

## 9. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Column niet groupable | groupable: false | Verwijder of zet groupable: true |
| GroupBar niet zichtbaar | Niet in toolbar | Voeg { type: 'groupbar' } toe aan tbar |
| Custom renderer werkt niet | Verkeerde signature | Check groupRenderer parameters |
| Multi-group werkt niet | Enkele groep config | Gebruik store.groupers array |
| Summary niet zichtbaar | Feature disabled | Enable groupSummary feature |

---

## API Reference

### Group Feature

| Property | Type | Description |
|----------|------|-------------|
| `field` | String | Initial group field |
| `renderer` | Function | Global group renderer |

### Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `groupable` | Boolean | Allow grouping by column |
| `groupRenderer` | Function | Column-specific group renderer |

### Store Methods

| Method | Description |
|--------|-------------|
| `group(field)` | Group by field(s) |
| `clearGroupers()` | Remove all grouping |
| `isGrouped` | Check if grouped |
| `groupers` | Get/set groupers |

### Grid Methods

| Method | Description |
|--------|-------------|
| `expandAll()` | Expand all groups |
| `collapseAll()` | Collapse all groups |
| `expand(record)` | Expand specific group |
| `collapse(record)` | Collapse specific group |

---

## Bronnen

- **Example**: `examples/grouping/`
- **Group Feature**: `Grid.feature.Group`
- **GroupSummary Feature**: `Grid.feature.GroupSummary`
- **GroupBar Widget**: `Grid.widget.GroupBar`

---

*Priority 2: Medium Priority Features*
