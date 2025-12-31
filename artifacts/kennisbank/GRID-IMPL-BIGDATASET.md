# Grid Implementation: Big Dataset

> **Big Dataset** voor het efficiënt werken met grote hoeveelheden data.

---

## Overzicht

Bryntum Grid kan efficiënt omgaan met honderdduizenden rijen door speciale optimalisaties.

```
+--------------------------------------------------------------------------+
| GRID                                 [Records: 100000] [Scroll: 500]     |
+--------------------------------------------------------------------------+
|  #    |  First name  |  Surname   |  City    |  Age  |  Score  | Percent |
+--------------------------------------------------------------------------+
|  1    |  John        |  Doe       |  Paris   |  32   |   850   |  ███ 75%|
|  2    |  Jane        |  Smith     |  London  |  28   |   720   |  ██ 50% |
|  3    |  Bob         |  Wilson    |  Berlin  |  45   |   350   |  █ 25%  |
|  ...  |  ...         |  ...       |  ...     |  ...  |   ...   |  ...    |
|100000 |  Alice       |  Brown     |  Tokyo   |  38   |   900   |  ████85%|
+--------------------------------------------------------------------------+
|                                                                          |
|  PERFORMANCE OPTIMIZATIONS:                                              |
|    useRawData: true     - Skip field conversion for clean data           |
|    fixedRowHeight: true - Skip variable height calculations              |
|    Virtual scrolling    - Only render visible rows                       |
|    Mask.mask()          - Show progress during generation                |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Big Dataset Setup

### 1.1 Performance-Optimized Grid

```javascript
import { Mask, Grid, DataGenerator, AsyncHelper, BrowserHelper } from '@bryntum/grid';

const rowCount = BrowserHelper.searchParam('rowCount', 1000);

async function generateRows(count) {
    const
        maxHeight = 33554400,
        interval  = Math.min(Math.floor(count / 20), 10000),
        rows      = [];

    // Adjust row height to fit requested amount of records
    if (count * grid.rowHeight > maxHeight) {
        grid.rowHeight = Math.floor(maxHeight / count) - 1;
    }

    const mask = Mask.mask('Generating records', grid.element);

    console.time('Generating ' + count + ' rows');

    const iterator = DataGenerator.generate(count);
    let step;

    while ((step = iterator.next()) && !step.done) {
        rows.push(step.value);

        // Update mask progress periodically
        if (rows.length % interval === 0) {
            mask.text = `Generated ${rows.length} of ${count} records`;
            await AsyncHelper.animationFrame();
        }
    }

    console.timeEnd('Generating ' + count + ' rows');

    console.time('Loading ' + count + ' rows into store');

    if (!grid.isDestroyed) {
        grid.store.data = rows;
        console.timeEnd('Loading ' + count + ' rows into store');
    }

    mask.close();
}

const grid = new Grid({
    appendTo: 'container',

    columns: [
        { type: 'rownumber', width: 80 },
        { text: 'First name', field: 'firstName', flex: 1 },
        { text: 'Surname', field: 'surName', flex: 1 },
        { text: 'City', field: 'city', flex: 1 },
        { text: 'Age', field: 'age', flex: 1, type: 'number' },
        { text: 'Score', field: 'score', flex: 1, type: 'number' },
        { text: 'Percent', field: 'percent', width: 150, type: 'percent' }
    ],

    store: {
        // Boosts record creation performance by requiring correctly formatted data
        useRawData: true
    },

    // Opt out of supporting variable row height for better performance
    fixedRowHeight: true
});

generateRows(rowCount);
```

---

## 2. Scroll Navigation

### 2.1 Scroll Controls

```javascript
tbar: [
    {
        type: 'number',
        ref: 'recCount',
        placeholder: 'Number of records',
        label: 'Records',
        tooltip: 'Enter number of records to generate and press [ENTER]',
        value: 1000,
        width: '12em',
        min: 1,
        max: 1000000,
        onChange: ({ value }) => {
            scrollToField.max = value;
            scrollToField.value = Math.min(scrollToField.value, value);
            generateRows(value);
        }
    },
    {
        type: 'numberfield',
        ref: 'scrollTo',
        label: 'Scroll to',
        width: '12em',
        min: 1,
        max: 1000,
        value: 500
    },
    {
        type: 'button',
        text: 'Scroll',
        tooltip: 'Scroll to selected row number',
        onAction: () => grid.scrollRowIntoView(
            grid.store.getAt(grid.widgetMap.scrollTo.value),
            {
                animate: {
                    easing: 'easeOutBounce',
                    duration: 2000
                },
                highlight: true
            }
        )
    },
    {
        type: 'button',
        icon: 'fa-arrow-up',
        tooltip: 'Scroll to top',
        onClick: () => grid.scrollToTop()
    },
    {
        type: 'button',
        icon: 'fa-arrow-down',
        tooltip: 'Scroll to bottom',
        onClick: () => grid.scrollToBottom()
    }
]
```

---

## 3. Performance Best Practices

### 3.1 Store Configuration

```javascript
store: {
    // Skip field conversion - data must be properly formatted
    useRawData: true,

    // Optionally define fields for type safety
    fields: [
        'firstName',
        'surName',
        'city',
        { name: 'age', type: 'number' },
        { name: 'score', type: 'number' },
        { name: 'percent', type: 'number' }
    ]
}
```

### 3.2 Grid Configuration

```javascript
const grid = new Grid({
    // Fixed row height for optimal rendering
    fixedRowHeight: true,

    // Disable features that impact performance
    features: {
        // Disable if not needed
        group: false,
        sort: false
    },

    // Simple column configuration
    columns: [
        // Avoid complex renderers for large datasets
        { text: 'Name', field: 'name', flex: 1 },
        { text: 'Age', field: 'age', type: 'number' }
    ]
});
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { Mask, AsyncHelper, DataGenerator } from '@bryntum/grid';
import { useState, useRef, useCallback, useEffect } from 'react';

function BigDataGrid() {
    const gridRef = useRef(null);
    const [rowCount, setRowCount] = useState(10000);
    const [isLoading, setIsLoading] = useState(false);

    const generateData = useCallback(async (count) => {
        const grid = gridRef.current?.instance;
        if (!grid) return;

        setIsLoading(true);
        const mask = Mask.mask('Generating records', grid.element);

        const rows = [];
        const iterator = DataGenerator.generate(count);
        const interval = Math.min(Math.floor(count / 20), 10000);

        let step;
        while ((step = iterator.next()) && !step.done) {
            rows.push(step.value);

            if (rows.length % interval === 0) {
                mask.text = `Generated ${rows.length} of ${count} records`;
                await AsyncHelper.animationFrame();
            }
        }

        grid.store.data = rows;
        mask.close();
        setIsLoading(false);
    }, []);

    useEffect(() => {
        generateData(rowCount);
    }, [rowCount, generateData]);

    const scrollToRow = useCallback((index) => {
        const grid = gridRef.current?.instance;
        const record = grid?.store.getAt(index);
        if (record) {
            grid.scrollRowIntoView(record, {
                animate: { duration: 1000 },
                highlight: true
            });
        }
    }, []);

    const gridConfig = {
        fixedRowHeight: true,

        store: {
            useRawData: true
        },

        columns: [
            { type: 'rownumber', width: 80 },
            { text: 'First name', field: 'firstName', flex: 1 },
            { text: 'Surname', field: 'surName', flex: 1 },
            { text: 'City', field: 'city', flex: 1 },
            { text: 'Age', field: 'age', type: 'number', width: 100 },
            { text: 'Score', field: 'score', type: 'number', flex: 1 }
        ]
    };

    return (
        <div className="big-data-grid">
            <div className="toolbar">
                <label>
                    Records:
                    <input
                        type="number"
                        value={rowCount}
                        onChange={(e) => setRowCount(parseInt(e.target.value) || 1000)}
                        min={1}
                        max={1000000}
                    />
                    <button onClick={() => generateData(rowCount)} disabled={isLoading}>
                        Generate
                    </button>
                </label>
                <button onClick={() => scrollToRow(Math.floor(rowCount / 2))}>
                    Scroll to Middle
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
/* Loading mask */
.b-mask {
    background: rgba(0, 0, 0, 0.5);
}

.b-mask-content {
    background: white;
    padding: 20px 40px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Row number column */
.b-rownumber-cell {
    color: #888;
    font-size: 12px;
}

/* Scrollbar styling */
.b-grid .b-virtual-scrollers::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

.b-grid .b-virtual-scrollers::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 6px;
}

/* Performance indicator */
.performance-stats {
    padding: 8px;
    background: #f0f0f0;
    font-family: monospace;
    font-size: 12px;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Trage initialisatie | useRawData niet ingesteld | Zet useRawData: true |
| Hoge memory gebruik | Teveel kolommen met renderers | Simplificeer renderers |
| Scroll niet smooth | fixedRowHeight niet ingesteld | Zet fixedRowHeight: true |
| Browser vastgelopen | Teveel rijen in één keer laden | Gebruik async loading met mask |

---

## API Reference

### Store Config for Performance

| Property | Type | Description |
|----------|------|-------------|
| `useRawData` | Boolean | Skip field conversion |
| `data` | Array | Inline data array |

### Grid Config for Performance

| Property | Type | Description |
|----------|------|-------------|
| `fixedRowHeight` | Boolean | Disable variable row heights |
| `rowHeight` | Number | Fixed row height in pixels |

### Scroll Methods

| Method | Description |
|--------|-------------|
| `scrollRowIntoView(record, options)` | Scroll to record |
| `scrollToTop()` | Scroll to top |
| `scrollToBottom()` | Scroll to bottom |

### Mask API

| Method | Description |
|--------|-------------|
| `Mask.mask(text, element)` | Show mask |
| `mask.text` | Update mask text |
| `mask.close()` | Close mask |

---

## Bronnen

- **Example**: `examples/bigdataset/`
- **Mask**: `Core.widget.Mask`
- **DataGenerator**: `Core.data.DataGenerator`

---

*Priority 2: Medium Priority Features*
