# Grid Implementation: Stripe (Row Striping)

> **Stripe** voor afwisselende rijkleuren voor betere leesbaarheid.

---

## Overzicht

Bryntum Grid ondersteunt row striping (zebra striping) voor visuele onderscheiding.

```
+--------------------------------------------------------------------------+
| GRID                                                [☑ Enable Striping] |
+--------------------------------------------------------------------------+
|  #  |  Name           |  Status     |  Priority   |  Due Date          |
+--------------------------------------------------------------------------+
|  1  |  Task Alpha     |  Active     |  High       |  Jan 15     [█████]|
|  2  |  Task Beta      |  Pending    |  Medium     |  Jan 20     [░░░░░]|
|  3  |  Task Gamma     |  Done       |  Low        |  Jan 25     [█████]|
|  4  |  Task Delta     |  Active     |  High       |  Jan 30     [░░░░░]|
|  5  |  Task Epsilon   |  Pending    |  Medium     |  Feb 05     [█████]|
+--------------------------------------------------------------------------+
|  [█████] - Odd row (white)    [░░░░░] - Even row (grey)                  |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Stripe Setup

### 1.1 Enable Row Striping

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        stripe: true  // Enable row striping
    },

    columns: [
        { type: 'rownumber', width: 50 },
        { text: 'Name', field: 'name', width: 200 },
        { text: 'Status', field: 'status', width: 120 },
        { text: 'Priority', field: 'priority', width: 100 },
        { text: 'Due Date', field: 'dueDate', type: 'date', width: 120 }
    ],

    data: [
        { id: 1, name: 'Task Alpha', status: 'Active', priority: 'High', dueDate: '2024-01-15' },
        { id: 2, name: 'Task Beta', status: 'Pending', priority: 'Medium', dueDate: '2024-01-20' },
        { id: 3, name: 'Task Gamma', status: 'Done', priority: 'Low', dueDate: '2024-01-25' },
        { id: 4, name: 'Task Delta', status: 'Active', priority: 'High', dueDate: '2024-01-30' },
        { id: 5, name: 'Task Epsilon', status: 'Pending', priority: 'Medium', dueDate: '2024-02-05' }
    ]
});
```

---

## 2. Toggle Striping

### 2.1 Programmatic Control

```javascript
// Toggle striping
function toggleStripe() {
    grid.features.stripe.disabled = !grid.features.stripe.disabled;
}

// Enable striping
function enableStripe() {
    grid.features.stripe.disabled = false;
}

// Disable striping
function disableStripe() {
    grid.features.stripe.disabled = true;
}
```

### 2.2 With Toolbar Toggle

```javascript
const grid = new Grid({
    appendTo: 'container',

    features: {
        stripe: true
    },

    tbar: [
        {
            type: 'checkbox',
            text: 'Row Striping',
            checked: true,
            onChange({ checked }) {
                grid.features.stripe.disabled = !checked;
            }
        }
    ],

    columns: [
        { text: 'Name', field: 'name', width: 200 },
        { text: 'Status', field: 'status', width: 120 }
    ],

    data: generateData(50)
});
```

---

## 3. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useRef, useMemo, useState, useCallback } from 'react';

function StripedGrid({ data }) {
    const gridRef = useRef(null);
    const [stripingEnabled, setStripingEnabled] = useState(true);

    const toggleStriping = useCallback(() => {
        const grid = gridRef.current?.instance;
        if (grid) {
            const newValue = !stripingEnabled;
            grid.features.stripe.disabled = !newValue;
            setStripingEnabled(newValue);
        }
    }, [stripingEnabled]);

    const gridConfig = useMemo(() => ({
        features: {
            stripe: true
        },

        columns: [
            { type: 'rownumber', width: 50 },
            { text: 'Name', field: 'name', flex: 1 },
            { text: 'Status', field: 'status', width: 120 },
            { text: 'Priority', field: 'priority', width: 100 },
            { text: 'Due Date', field: 'dueDate', type: 'date', width: 120 }
        ]
    }), []);

    return (
        <div className="striped-grid">
            <div className="toolbar">
                <label className="toggle">
                    <input
                        type="checkbox"
                        checked={stripingEnabled}
                        onChange={toggleStriping}
                    />
                    <span>Row Striping</span>
                </label>
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

## 4. Styling

```css
/* Default stripe (even rows) */
.b-grid-row.b-even {
    background-color: #f5f5f5;
}

/* Odd rows (no stripe) */
.b-grid-row.b-odd {
    background-color: white;
}

/* Custom stripe colors */
.custom-stripe .b-grid-row.b-even {
    background-color: #e3f2fd;  /* Light blue */
}

/* Stripe with selection */
.b-grid-row.b-even.b-selected {
    background-color: #bbdefb !important;
}

.b-grid-row.b-odd.b-selected {
    background-color: #90caf9 !important;
}

/* Stripe with hover */
.b-grid-row.b-even:hover {
    background-color: #eeeeee;
}

.b-grid-row.b-odd:hover {
    background-color: #f5f5f5;
}

/* Dark theme stripe */
.b-theme-dark .b-grid-row.b-even {
    background-color: #424242;
}

.b-theme-dark .b-grid-row.b-odd {
    background-color: #303030;
}

/* Grouped rows with stripe */
.b-grid-row.b-group-row {
    background-color: #e0e0e0 !important;
}

/* Alternate group stripe pattern */
.b-grid-row.b-even:not(.b-group-row) {
    background-color: #fafafa;
}

/* Toolbar toggle */
.toolbar {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.toggle input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

/* Print stripe */
@media print {
    .b-grid-row.b-even {
        background-color: #f5f5f5 !important;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }
}
```

---

## 5. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Geen stripes zichtbaar | Feature disabled | Enable stripe feature |
| Stripes verdwijnen bij hover | CSS override | Check hover styles |
| Stripes missen in print | print-color-adjust | Voeg print CSS toe |
| Kleur incorrect | CSS specificity | Gebruik meer specifieke selectors |

---

## API Reference

### Stripe Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `stripe` | Boolean | Enable feature |
| `disabled` | Boolean | Disable feature |

### CSS Classes

| Class | Description |
|-------|-------------|
| `.b-even` | Even row (striped) |
| `.b-odd` | Odd row |

### Methods

| Method | Description |
|--------|-------------|
| `grid.features.stripe.disabled` | Get/set disabled state |

---

## Bronnen

- **Feature**: `Grid.feature.Stripe`

---

*Priority 3: Nice-to-Have Features*
