# Grid Implementation: Group Summary

> **Group Summary** voor het tonen van samenvattingen per groep.

---

## Overzicht

Bryntum Grid kan samenvattingsrijen tonen voor elke groep met sum, count, average, min en max.

```
+--------------------------------------------------------------------------+
| GRID                    [Display in header] [Display in footer ●]        |
+--------------------------------------------------------------------------+
|  #  |  Firstname  |  Surname   |  Age  |  City      |  Rank    |  Score  |
+--------------------------------------------------------------------------+
|  ▼ Paris (5 records)                    | Sum: 178   | Min: 15  | Avg: 520|
+--------------------------------------------------------------------------+
|  1  |  John       |  Doe       |  32   |  Paris     |  15      |  850    |
|  2  |  Jane       |  Smith     |  28   |  Paris     |  23      |  720    |
|  3  |  Bob        |  Wilson    |  45   |  Paris     |  42      |  350    |
|  4  |  Alice      |  Brown     |  38   |  Paris     |  31      |  600    |
|  5  |  Charlie    |  Davis     |  35   |  Paris     |  28      |  480    |
+--------------------------------------------------------------------------+
|  ▼ London (3 records)                   | Sum: 105   | Min: 8   | Avg: 630|
+--------------------------------------------------------------------------+
|  6  |  Eva        |  Miller    |  42   |  London    |  8       |  790    |
|  7  |  Frank      |  Garcia    |  31   |  London    |  12      |  560    |
|  8  |  Grace      |  Martinez  |  32   |  London    |  18      |  540    |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Group Summary Setup

### 1.1 Enable Group Summary Feature

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    fillLastColumn: true,

    features: {
        sort: 'age',
        group: 'city',
        groupSummary: {
            // Show summary in header when collapsed
            collapseToHeader: true
        }
    },

    columns: [
        { type: 'rownumber' },
        { text: 'Firstname', field: 'firstName', width: 120 },
        { text: 'Surname', field: 'surName', width: 120 },
        {
            text: 'Age',
            field: 'age',
            width: 100,
            type: 'number',
            // Simple sum
            sum: 'sum'
        },
        {
            text: 'City',
            field: 'city',
            flex: 1,
            // Count with label
            summaries: [{ sum: 'count', label: 'Rows' }]
        },
        {
            type: 'number',
            text: 'Rank',
            field: 'rank',
            flex: 1,
            // Multiple summaries
            summaries: [
                { sum: 'min', label: 'Min' },
                { sum: 'max', label: 'Max' }
            ]
        },
        {
            type: 'number',
            text: 'Score',
            field: 'score',
            flex: 1,
            // Average
            summaries: [{ sum: 'average', label: 'Average' }]
        }
    ],

    data: DataGenerator.generateData(25)
});
```

---

## 2. Summary Display Options

### 2.1 Toggle Summary Location

```javascript
tbar: {
    items: {
        target: {
            type: 'buttongroup',
            rendition: 'padded',
            toggleGroup: true,
            items: {
                targetHeader: {
                    text: 'Display in header',
                    icon: 'fa-table',
                    onToggle({ pressed }) {
                        grid.widgetMap.collapseToHeader.disabled = pressed;
                        grid.features.groupSummary.target = pressed ? 'header' : 'footer';
                    }
                },
                targetFooter: {
                    text: 'Display in footer',
                    icon: 'fa-table fa-rotate-180',
                    pressed: true
                }
            }
        },
        collapseToHeader: {
            type: 'slidetoggle',
            text: 'Collapse to header',
            checked: true,
            onChange({ checked }) {
                grid.features.groupSummary.collapseToHeader = checked;
            }
        }
    }
}
```

---

## 3. Summary Types

### 3.1 Available Summary Functions

```javascript
columns: [
    // Sum - adds all values
    {
        text: 'Total Age',
        field: 'age',
        type: 'number',
        sum: 'sum'
    },

    // Count - counts records
    {
        text: 'City',
        field: 'city',
        summaries: [{ sum: 'count', label: 'Records' }]
    },

    // Average - calculates mean
    {
        text: 'Average Score',
        field: 'score',
        type: 'number',
        summaries: [{ sum: 'average', label: 'Avg' }]
    },

    // Min - finds minimum
    {
        text: 'Lowest Rank',
        field: 'rank',
        type: 'number',
        summaries: [{ sum: 'min', label: 'Lowest' }]
    },

    // Max - finds maximum
    {
        text: 'Highest Rank',
        field: 'rank',
        type: 'number',
        summaries: [{ sum: 'max', label: 'Highest' }]
    },

    // Multiple summaries on one column
    {
        text: 'Stats',
        field: 'value',
        type: 'number',
        summaries: [
            { sum: 'min', label: 'Min' },
            { sum: 'max', label: 'Max' },
            { sum: 'average', label: 'Avg' }
        ]
    }
]
```

### 3.2 Custom Summary Function

```javascript
columns: [
    {
        text: 'Custom Calculation',
        field: 'value',
        type: 'number',
        summaries: [{
            sum: (result, current, index, records) => {
                // Custom calculation logic
                if (index === 0) {
                    result = 0;
                }
                result += current.value * current.weight;
                return result;
            },
            label: 'Weighted'
        }]
    }
]
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { DataGenerator } from '@bryntum/grid';
import { useState, useMemo, useCallback } from 'react';

function GroupSummaryGrid() {
    const [target, setTarget] = useState('footer');
    const [collapseToHeader, setCollapseToHeader] = useState(true);

    const gridConfig = useMemo(() => ({
        fillLastColumn: true,

        features: {
            sort: 'age',
            group: 'city',
            groupSummary: {
                target,
                collapseToHeader
            }
        },

        columns: [
            { type: 'rownumber' },
            { text: 'First name', field: 'firstName', width: 120 },
            { text: 'Surname', field: 'surName', width: 120 },
            {
                text: 'Age',
                field: 'age',
                width: 100,
                type: 'number',
                sum: 'sum'
            },
            {
                text: 'City',
                field: 'city',
                flex: 1,
                summaries: [{ sum: 'count', label: 'Records' }]
            },
            {
                text: 'Rank',
                field: 'rank',
                type: 'number',
                flex: 1,
                summaries: [
                    { sum: 'min', label: 'Min' },
                    { sum: 'max', label: 'Max' }
                ]
            },
            {
                text: 'Score',
                field: 'score',
                type: 'number',
                flex: 1,
                summaries: [{ sum: 'average', label: 'Avg' }]
            }
        ],

        data: DataGenerator.generateData(25)
    }), [target, collapseToHeader]);

    return (
        <div className="group-summary-grid">
            <div className="toolbar">
                <div className="button-group">
                    <button
                        className={target === 'header' ? 'active' : ''}
                        onClick={() => setTarget('header')}
                    >
                        Display in Header
                    </button>
                    <button
                        className={target === 'footer' ? 'active' : ''}
                        onClick={() => setTarget('footer')}
                    >
                        Display in Footer
                    </button>
                </div>
                <label>
                    <input
                        type="checkbox"
                        checked={collapseToHeader}
                        onChange={(e) => setCollapseToHeader(e.target.checked)}
                        disabled={target === 'header'}
                    />
                    Collapse to header
                </label>
            </div>

            <BryntumGrid {...gridConfig} />
        </div>
    );
}
```

---

## 5. Styling

```css
/* Group header row */
.b-group-header {
    background: #f5f5f5;
    font-weight: 500;
}

/* Group summary row */
.b-group-footer {
    background: #fafafa;
    border-top: 1px solid #e0e0e0;
}

/* Summary cell */
.b-summary-cell {
    font-weight: 500;
    color: #1976d2;
}

/* Summary label */
.b-summary-label {
    font-size: 11px;
    color: #666;
    margin-right: 4px;
}

/* Summary value */
.b-summary-value {
    font-family: monospace;
}

/* Multiple summaries in cell */
.b-summary-cell .b-summary-item {
    display: inline-block;
    margin-right: 12px;
}

/* Collapsed group with summary in header */
.b-group-header.b-collapsed .b-summary-cell {
    background: #e3f2fd;
}

/* Group toggle icon */
.b-group-header .b-group-title .b-icon {
    margin-right: 8px;
    color: #666;
}

/* Row count badge */
.b-group-header .b-group-count {
    background: #1976d2;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    margin-left: 8px;
}

/* Number column alignment */
.b-number-cell.b-summary-cell {
    text-align: right;
}

/* Alternating summary rows */
.b-group-footer:nth-child(odd) {
    background: #f0f0f0;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Summary niet zichtbaar | groupSummary niet enabled | Enable groupSummary feature |
| Sum toont NaN | Field is geen nummer | Zet type: 'number' op column |
| Footer niet zichtbaar | target: 'header' | Zet target: 'footer' |
| Multiple summaries overlappen | Geen styling | Voeg spacing toe in CSS |

---

## API Reference

### GroupSummary Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `target` | String | 'header' or 'footer' |
| `collapseToHeader` | Boolean | Show in header when collapsed |

### Column Summary Config

| Property | Type | Description |
|----------|------|-------------|
| `sum` | String/Function | Simple sum function |
| `summaries` | Array | Multiple summary configs |

### Summary Functions

| Function | Description |
|----------|-------------|
| `'sum'` | Add all values |
| `'count'` | Count records |
| `'average'` | Calculate mean |
| `'min'` | Find minimum |
| `'max'` | Find maximum |
| `Function` | Custom calculation |

### Summary Config Object

| Property | Type | Description |
|----------|------|-------------|
| `sum` | String/Function | Summary function |
| `label` | String | Display label |

---

## Bronnen

- **Example**: `examples/groupsummary/`
- **GroupSummary Feature**: `Grid.feature.GroupSummary`

---

*Priority 2: Medium Priority Features*
