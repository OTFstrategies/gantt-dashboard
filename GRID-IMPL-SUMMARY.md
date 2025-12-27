# Grid Implementation: Summary Rows

> **Summary rows** met aggregatie functies, custom renderers, en selected-only mode.

---

## Overzicht

Bryntum Grid ondersteunt summary rows voor het tonen van aggregaties zoals totalen, gemiddelden, en custom berekeningen.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                                     [☑ Sum selected rows]           │
├──────────────────────────────────────────────────────────────────────────┤
│  Name         │ City        │ Team    │ Score  │ Percent                │
├───────────────┼─────────────┼─────────┼────────┼────────────────────────┤
│  John Doe     │ Paris       │ Alpha   │ 🥇 920 │ ████████████░░ 85%     │
│  Jane Smith   │ London      │ Beta    │ 🥈 850 │ ██████████░░░░ 72%     │
│  Bob Wilson   │ Paris       │ Alpha   │ 🥉 780 │ ████████░░░░░░ 65%     │
│  Alice Brown  │ Berlin      │ Gamma   │    650 │ ██████░░░░░░░░ 55%     │
│  ...          │ ...         │ ...     │ ...    │ ...                    │
├───────────────┼─────────────┼─────────┼────────┼────────────────────────┤
│ SUMMARY ROW                                                              │
│  Total: 50    │Most: Paris  │         │Total:  │ Average: 68%           │
│               │             │         │ 38,500 │                        │
└───────────────┴─────────────┴─────────┴────────┴────────────────────────┘
```

---

## 1. Basic Summary Setup

### 1.1 Enable Summary Feature

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        filter: true,
        summary: true  // Enable summary row
    },

    columns: [
        {
            text: 'Name',
            field: 'name',
            width: 200,
            locked: true,
            sum: 'count',  // Count records
            summaryRenderer: ({ sum }) => `Total: ${sum}`
        },
        {
            type: 'number',
            text: 'Score',
            field: 'score',
            width: 190,
            sum: 'sum',  // Sum values
            summaryRenderer: ({ sum }) => `Total amount: ${sum}`
        },
        {
            type: 'percent',
            text: 'Percent',
            field: 'percent',
            width: 100,
            sum: 'average',  // Average values
            summaryRenderer: ({ sum }) => `Average: ${Math.round(sum)}%`
        }
    ],

    data: DataGenerator.generateData(50)
});
```

---

## 2. Summary Functions

### 2.1 Built-in Sum Functions

```javascript
columns: [
    // Count records
    {
        text: 'Name',
        field: 'name',
        sum: 'count',
        summaryRenderer: ({ sum }) => `Total: ${sum}`
    },

    // Sum numeric values
    {
        text: 'Score',
        field: 'score',
        sum: 'sum',
        summaryRenderer: ({ sum }) => `Sum: ${sum}`
    },

    // Average numeric values
    {
        text: 'Percent',
        field: 'percent',
        sum: 'average',
        summaryRenderer: ({ sum }) => `Avg: ${sum.toFixed(1)}%`
    },

    // Min value
    {
        text: 'Min Score',
        field: 'score',
        sum: 'min',
        summaryRenderer: ({ sum }) => `Min: ${sum}`
    },

    // Max value
    {
        text: 'Max Score',
        field: 'score',
        sum: 'max',
        summaryRenderer: ({ sum }) => `Max: ${sum}`
    }
]
```

### 2.2 Custom Sum Function

```javascript
{
    text: 'City',
    field: 'city',
    width: 200,
    locked: true,

    // Custom aggregation: find most popular city
    sum: (result, current, index) => {
        // Initialize on first record
        if (index === 0) {
            result = {};
        }

        const city = current.city;
        if (!Object.prototype.hasOwnProperty.call(result, city)) {
            result[city] = 1;
        }
        else {
            result[city]++;
        }

        return result;
    },

    summaryRenderer: ({ sum }) => {
        let maxCount = 0;
        let mostPopularCity = '';

        Object.keys(sum).forEach(city => {
            if (sum[city] > maxCount) {
                maxCount = sum[city];
                mostPopularCity = city;
            }
        });

        return StringHelper.xss`Most entries: ${mostPopularCity}`;
    }
}
```

---

## 3. Custom Renderers

### 3.1 Cell Renderer with Summary

```javascript
{
    type: 'number',
    text: 'Score',
    field: 'score',
    width: 190,
    sum: 'sum',
    align: 'end',
    summaryRenderer: ({ sum }) => `Total amount: ${sum}`,

    // Custom cell renderer with medals
    renderer({ value }) {
        if (value > 900) {
            return `🥇 ${value}`;
        }
        if (value > 800) {
            return `🥈 ${value}`;
        }
        if (value > 700) {
            return `🥉 ${value}`;
        }
        return value;
    }
}
```

### 3.2 Percent Column with Summary

```javascript
{
    type: 'percent',
    text: 'Percent',
    field: 'percent',
    width: 100,
    sum: 'average',
    summaryRenderer: ({ sum }) => `Average: ${Math.round(sum)}%`,

    editor: {
        type: 'number',
        min: 0,
        max: 100
    }
}
```

---

## 4. Selected Rows Only

### 4.1 Toggle Selected Only Mode

```javascript
const grid = new Grid({
    appendTo: 'container',

    features: {
        filter: true,
        summary: true
    },

    tbar: {
        items: {
            sumSelected: {
                type: 'slidetoggle',
                text: 'Sum selected rows',
                cls: 'sum-selected-rows-checkbox',
                onChange: 'up.onChange'
            }
        }
    },

    columns: [/* ... */],

    data: DataGenerator.generateData(50),

    // Toggle handler
    onChange() {
        this.features.summary.selectedOnly = !this.features.summary.selectedOnly;
    }
});
```

### 4.2 Programmatic Control

```javascript
// Enable selected-only mode
grid.features.summary.selectedOnly = true;

// Disable selected-only mode
grid.features.summary.selectedOnly = false;

// Check current mode
if (grid.features.summary.selectedOnly) {
    console.log('Summarizing selected rows only');
}
```

---

## 5. Multiple Summary Rows

### 5.1 Multi-Summary Configuration

```javascript
features: {
    summary: {
        summaries: [
            {
                // First summary row: totals
                renderer: ({ column, sum }) => {
                    if (column.sum === 'sum') return `Total: ${sum}`;
                    if (column.sum === 'count') return `Count: ${sum}`;
                    return '';
                }
            },
            {
                // Second summary row: averages
                renderer: ({ column, sum }) => {
                    if (column.sum === 'average') return `Avg: ${sum.toFixed(1)}`;
                    return '';
                }
            }
        ]
    }
}
```

---

## 6. Group Summary

```javascript
features: {
    group: 'city',
    groupSummary: true,  // Summary per group
    summary: true        // Overall summary
}

columns: [
    {
        text: 'Score',
        field: 'score',
        type: 'number',
        sum: 'sum',
        summaryRenderer: ({ sum }) => `Total: ${sum}`
    }
]
```

---

## 7. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useState, useCallback } from 'react';

function GridWithSummary({ data }) {
    const [selectedOnly, setSelectedOnly] = useState(false);

    const gridConfig = {
        features: {
            filter: true,
            summary: {
                selectedOnly
            }
        },

        columns: [
            {
                text: 'Name',
                field: 'name',
                width: 200,
                locked: true,
                sum: 'count',
                summaryRenderer: ({ sum }) => `Total: ${sum}`
            },
            {
                text: 'City',
                field: 'city',
                width: 150,
                sum: (result, current, index) => {
                    if (index === 0) result = {};
                    result[current.city] = (result[current.city] || 0) + 1;
                    return result;
                },
                summaryRenderer: ({ sum }) => {
                    const top = Object.entries(sum)
                        .sort(([,a], [,b]) => b - a)[0];
                    return top ? `Top: ${top[0]}` : '';
                }
            },
            {
                type: 'number',
                text: 'Score',
                field: 'score',
                width: 120,
                sum: 'sum',
                summaryRenderer: ({ sum }) => `Sum: ${sum}`
            },
            {
                type: 'percent',
                text: 'Progress',
                field: 'percent',
                width: 120,
                sum: 'average',
                summaryRenderer: ({ sum }) => `Avg: ${Math.round(sum)}%`
            }
        ]
    };

    return (
        <div className="grid-summary-wrapper">
            <div className="toolbar">
                <label>
                    <input
                        type="checkbox"
                        checked={selectedOnly}
                        onChange={(e) => setSelectedOnly(e.target.checked)}
                    />
                    Sum selected rows only
                </label>
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
/* Summary row */
.b-grid-footer {
    background: #f5f5f5;
    font-weight: bold;
    border-top: 2px solid #ddd;
}

.b-grid-footer .b-grid-cell {
    padding: 8px 12px;
}

/* Locked summary cells */
.b-grid-footer-scroller-locked {
    background: #eeeeee;
}

/* Summary value styling */
.b-grid-footer .b-sum-value {
    color: #2196F3;
}

/* Medal styling in cells */
.b-grid-cell .medal {
    font-size: 1.2em;
    margin-right: 4px;
}

/* Toggle button */
.sum-selected-rows-checkbox {
    margin-right: 16px;
}

/* Selected-only indicator */
.b-grid.selected-only-mode .b-grid-footer {
    background: #e3f2fd;
}

/* Group summary */
.b-group-footer {
    background: #fafafa;
    font-style: italic;
    border-top: 1px dashed #ccc;
}

/* Multi-summary rows */
.b-grid-footer-row:nth-child(odd) {
    background: #f5f5f5;
}

.b-grid-footer-row:nth-child(even) {
    background: #eeeeee;
}
```

---

## 9. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Summary niet zichtbaar | Feature disabled | Enable summary feature |
| Verkeerde waarde | sum config fout | Check sum function/type |
| Custom sum werkt niet | Geen return | Zorg dat functie result returnt |
| SelectedOnly update niet | Property niet reactive | Gebruik features.summary.selectedOnly |
| Group summary ontbreekt | Feature disabled | Enable groupSummary feature |

---

## API Reference

### Summary Feature

| Property | Type | Description |
|----------|------|-------------|
| `selectedOnly` | Boolean | Sum selected rows only |
| `summaries` | Array | Multiple summary configs |

### Column Summary Properties

| Property | Type | Description |
|----------|------|-------------|
| `sum` | String/Function | Aggregation type or function |
| `summaryRenderer` | Function | Custom summary cell renderer |

### Built-in Sum Types

| Type | Description |
|------|-------------|
| `count` | Count records |
| `sum` | Sum numeric values |
| `average` | Average numeric values |
| `min` | Minimum value |
| `max` | Maximum value |

### Custom Sum Function

```javascript
sum: (result, currentRecord, index) => {
    // index === 0 for first record
    // Return accumulated result
    return result;
}
```

---

## Bronnen

- **Example**: `examples/summary/`
- **Multi-Summary**: `examples/multisummary/`
- **Group Summary**: `examples/groupsummary/`
- **Summary Feature**: `Grid.feature.Summary`
- **GroupSummary Feature**: `Grid.feature.GroupSummary`

---

*Priority 2: Medium Priority Features*
