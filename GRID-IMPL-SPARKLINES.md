# Grid Implementation: Sparklines

> **Inline mini-charts** voor trend visualisatie in grid cellen, met line, bar, en pie chart types, tooltips, en realtime data updates.

---

## Overzicht

Sparklines zijn compacte inline charts die data trends tonen binnen grid cellen. Ze bieden snelle visuele context zonder de grid layout te verstoren.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Name                │ Sparkline    │ Bar         │ Pie  │ Jan │ Feb │ │
├────────────────────────────────────────────────────────────────────────┤
│ Blue jeans mens L   │ ╱╲_╱╲        │ ▁▃▅▂▄       │ ◐    │  45 │  67 │ │
│ Sweatshirt XL       │ ╱‾╲__        │ ▅▂▁▄▃       │ ◑    │  89 │  32 │ │
│ Black turtleneck    │ _╱╲_╲        │ ▂▄▃▅▁       │ ◕    │  56 │  78 │ │
│ Red flannel shirt   │ ‾╲_╱╲        │ ▄▁▃▂▅       │ ◔    │  23 │  91 │ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. SparklineColumn Basis

### 1.1 Benodigde Imports

```javascript
// Core module
import { ArrayHelper, Toast } from '@bryntum/core';

// Chart module (vereist voor sparklines)
import '@bryntum/chart';

// Grid module
import { Grid, GridRowModel } from '@bryntum/grid';
```

### 1.2 Data Model met Calculated Field

```javascript
class Row extends GridRowModel {
    static fields = [
        { name: 'name' },
        { name: 'jan', type: 'number' },
        { name: 'feb', type: 'number' },
        { name: 'mar', type: 'number' },
        { name: 'apr', type: 'number' },
        { name: 'may', type: 'number' },
        {
            // Calculated field combineert maanden tot array
            name: 'monthlySales',
            calculate: data => [data.jan, data.feb, data.mar, data.apr, data.may]
        }
    ];
}
```

### 1.3 Basis Grid met Sparkline

```javascript
const grid = new Grid({
    appendTo: 'container',
    rowHeight: 50,  // Voldoende hoogte voor charts

    store: {
        modelClass: Row,
        data: salesData
    },

    columns: [
        { text: 'Name', field: 'name', width: 300 },
        {
            text: 'Trend',
            field: 'monthlySales',
            width: 120,
            type: 'sparkline'  // Gebruik SparklineColumn
        }
    ]
});
```

---

## 2. Chart Types

### 2.1 Line Chart (Default)

```javascript
{
    id: 'line',
    text: 'Sparkline',
    field: 'monthlySales',
    width: 120,
    type: 'sparkline',
    // chartType: 'line' is default
    chart: {
        showTooltips: true
    }
}
```

### 2.2 Bar Chart

```javascript
{
    id: 'bar',
    text: 'Bar',
    field: 'monthlySales',
    width: 120,
    type: 'sparkline',
    chartType: 'bar',
    chart: {
        showTooltips: true,
        chartTooltip: {
            callbacks: {
                // Verberg title in tooltip
                title: () => ''
            },
            yAlign: 'bottom'
        }
    }
}
```

### 2.3 Pie Chart

```javascript
{
    id: 'pie',
    text: 'Pie',
    field: 'monthlySales',
    width: 80,
    type: 'sparkline',
    chartType: 'pie',
    chart: {
        showTooltips: true
    }
}
```

### 2.4 Doughnut Chart

```javascript
{
    id: 'doughnut',
    text: 'Doughnut',
    field: 'monthlySales',
    width: 80,
    type: 'sparkline',
    chartType: 'doughnut',
    chart: {
        cutout: '40%'  // Binnenste opening
    }
}
```

---

## 3. Complete Grid Configuratie

```javascript
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

const grid = new Grid({
    appendTo: 'container',

    features: {
        group: false
    },

    rowHeight: 50,

    columns: [
        {
            text: 'Name',
            field: 'name',
            width: 300,
            editor: {
                type: 'textfield',
                required: true
            }
        },
        {
            id: 'line',
            text: 'Sparkline',
            field: 'monthlySales',
            width: 120,
            type: 'sparkline',
            chart: {
                showTooltips: true
            }
        },
        {
            id: 'bar',
            text: 'Bar',
            field: 'monthlySales',
            width: 120,
            type: 'sparkline',
            chartType: 'bar',
            chart: {
                showTooltips: true,
                chartTooltip: {
                    callbacks: {
                        title: () => ''
                    },
                    yAlign: 'bottom'
                }
            }
        },
        {
            id: 'pie',
            text: 'Pie',
            field: 'monthlySales',
            width: 80,
            type: 'sparkline',
            chartType: 'pie',
            chart: {
                showTooltips: true
            }
        },
        // Individuele maand kolommen
        ...months.map(monthName => ({
            type: 'number',
            field: monthName.toLowerCase(),
            text: monthName,
            width: 150
        })),
        {
            type: 'rating',
            field: 'rating',
            text: 'Rating'
        }
    ],

    store: {
        modelClass: Row,
        data: regenerateData(),
        syncDataOnLoad: true
    }
});
```

---

## 4. Realtime Data Updates

### 4.1 Auto-Refresh Interval

```javascript
const grid = new Grid({
    // ... columns config

    tbar: [
        {
            type: 'button',
            text: 'Regenerate data',
            icon: 'fa fa-refresh',
            color: 'b-blue',
            onClick: 'up.onRegenerateDataClick'
        },
        {
            type: 'durationfield',
            ref: 'refreshIntervalField',
            label: 'Refresh every',
            width: '20em',
            defaultUnit: 's',
            clearable: true,
            onChange: 'up.onIntervalChange'
        }
    ],

    onRegenerateDataClick() {
        this.store.data = regenerateData();
    },

    onIntervalChange({ value }) {
        // Clear existing interval
        this.clearInterval(this.refreshInterval);

        if (value) {
            // Set new refresh interval
            this.refreshInterval = this.setInterval(() => {
                this.store.data = regenerateData();
            }, value.milliseconds);
        }
    }
});

// Start met 1 seconde interval
grid.tbar.widgetMap.refreshIntervalField.value = 1;
```

### 4.2 Data Regeneratie

```javascript
const products = [
    'Blue jeans mens L',
    'Sweatshirt XL',
    'Black turtleneck womens M',
    'Red flannel shirt mens S',
    // ... meer producten
];

const regenerateData = () => ArrayHelper.populate(50, n => ({
    id: n,
    name: products[n],
    jan: Math.round(Math.random() * 80 + 20),
    feb: Math.round(Math.random() * 80 + 20),
    mar: Math.round(Math.random() * 80 + 20),
    apr: Math.round(Math.random() * 80 + 20),
    may: Math.round(Math.random() * 80 + 20),
    rating: Math.round(Math.random() * 5)
}));
```

---

## 5. Chart Configuratie Opties

### 5.1 Line Chart Styling

```javascript
{
    type: 'sparkline',
    chartType: 'line',
    chart: {
        // Lijn styling
        strokeColor: '#36A2EB',
        strokeWidth: 2,
        fill: true,
        fillColor: 'rgba(54, 162, 235, 0.2)',

        // Punten
        showPoints: true,
        pointRadius: 2,
        pointHoverRadius: 4,

        // Curve smoothing
        tension: 0.3  // 0 = straight, 0.4 = smooth

        // Tooltips
        showTooltips: true
    }
}
```

### 5.2 Bar Chart Styling

```javascript
{
    type: 'sparkline',
    chartType: 'bar',
    chart: {
        // Bar styling
        fillColor: '#36A2EB',
        strokeColor: '#2E8BC0',
        strokeWidth: 1,
        borderRadius: 2,

        // Bar spacing
        barPercentage: 0.8,
        categoryPercentage: 0.9,

        // Tooltips
        showTooltips: true,
        chartTooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            displayColors: false
        }
    }
}
```

### 5.3 Pie/Doughnut Styling

```javascript
{
    type: 'sparkline',
    chartType: 'doughnut',
    chart: {
        // Colors per segment
        colors: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
        ],

        // Doughnut hole size
        cutout: '50%',

        // Border
        borderWidth: 1,
        borderColor: '#fff',

        // Tooltips
        showTooltips: true,
        chartTooltip: {
            callbacks: {
                label: (context) => {
                    const value = context.raw;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${value} (${percentage}%)`;
                }
            }
        }
    }
}
```

---

## 6. Tooltip Customization

### 6.1 Basic Tooltip

```javascript
{
    type: 'sparkline',
    chart: {
        showTooltips: true
    }
}
```

### 6.2 Custom Tooltip Callbacks

```javascript
{
    type: 'sparkline',
    chart: {
        showTooltips: true,
        chartTooltip: {
            callbacks: {
                // Verberg of customize title
                title: (context) => {
                    const index = context[0].dataIndex;
                    return months[index];
                },

                // Customize label
                label: (context) => {
                    return `Sales: $${context.raw.toLocaleString()}`;
                },

                // Footer toevoegen
                footer: (context) => {
                    const total = context[0].dataset.data.reduce((a, b) => a + b, 0);
                    return `Total: $${total.toLocaleString()}`;
                }
            }
        }
    }
}
```

### 6.3 Tooltip Positioning

```javascript
{
    type: 'sparkline',
    chart: {
        chartTooltip: {
            // Position
            xAlign: 'center',  // 'left' | 'center' | 'right'
            yAlign: 'bottom',  // 'top' | 'center' | 'bottom'

            // Offset
            caretPadding: 6,

            // Disable caret
            displayCaret: false
        }
    }
}
```

---

## 7. Data Formaten

### 7.1 Array van Numbers

```javascript
// Eenvoudigste formaat
static fields = [
    {
        name: 'sparkData',
        calculate: data => [data.jan, data.feb, data.mar, data.apr, data.may]
    }
];
```

### 7.2 Array van Objects

```javascript
// Met labels
static fields = [
    {
        name: 'sparkData',
        calculate: data => [
            { label: 'Jan', value: data.jan },
            { label: 'Feb', value: data.feb },
            { label: 'Mar', value: data.mar }
        ]
    }
];

// Column config
{
    type: 'sparkline',
    field: 'sparkData',
    chart: {
        labelField: 'label',
        valueField: 'value'
    }
}
```

### 7.3 Multi-Series Data

```javascript
// Meerdere series
static fields = [
    {
        name: 'comparisonData',
        calculate: data => ({
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
                {
                    label: 'Actual',
                    data: [data.q1_actual, data.q2_actual, data.q3_actual, data.q4_actual],
                    strokeColor: '#36A2EB'
                },
                {
                    label: 'Planned',
                    data: [data.q1_plan, data.q2_plan, data.q3_plan, data.q4_plan],
                    strokeColor: '#FF6384'
                }
            ]
        })
    }
];
```

---

## 8. Responsive Sizing

### 8.1 Column Width

```javascript
{
    type: 'sparkline',
    width: 120,      // Fixed width
    minWidth: 80,    // Minimum bij resize
    maxWidth: 200,   // Maximum bij resize
    flex: 1          // Of gebruik flex
}
```

### 8.2 Row Height Considerations

```javascript
const grid = new Grid({
    rowHeight: 50,  // Genoeg ruimte voor charts

    columns: [
        {
            type: 'sparkline',
            // Charts schalen automatisch naar cell size
        }
    ]
});
```

### 8.3 Responsive Chart Options

```javascript
{
    type: 'sparkline',
    chart: {
        // Responsive options
        maintainAspectRatio: false,
        responsive: true,

        // Padding binnen cell
        padding: {
            top: 4,
            right: 4,
            bottom: 4,
            left: 4
        }
    }
}
```

---

## 9. Theme Integration

### 9.1 Auto Theme Detection

```javascript
import { DomHelper, GlobalEvents } from '@bryntum/core';

// Define theme-aware colors
const sparklineColors = {
    // Dark theme
    true: {
        stroke: '#64B5F6',
        fill: 'rgba(100, 181, 246, 0.3)'
    },
    // Light theme
    false: {
        stroke: '#1976D2',
        fill: 'rgba(25, 118, 210, 0.2)'
    }
};

// Apply colors based on theme
const updateSparklineColors = () => {
    const colors = sparklineColors[DomHelper.isDarkTheme];
    const column = grid.columns.get('sparkline');

    column.chart.strokeColor = colors.stroke;
    column.chart.fillColor = colors.fill;
    grid.refresh();
};

// Listen for theme changes
GlobalEvents.on('theme', updateSparklineColors);
updateSparklineColors();  // Initial apply
```

### 9.2 CSS Variables

```css
.b-sparkline-cell {
    --sparkline-line-color: var(--b-primary-color);
    --sparkline-fill-color: var(--b-primary-color-alpha-20);
    --sparkline-bar-color: var(--b-secondary-color);
}

.b-theme-dark .b-sparkline-cell {
    --sparkline-line-color: #64B5F6;
    --sparkline-fill-color: rgba(100, 181, 246, 0.3);
}
```

---

## 10. Performance Optimalisaties

### 10.1 Chart Caching

```javascript
{
    type: 'sparkline',
    chart: {
        // Cache chart instances
        reuseChart: true,

        // Disable animations voor snellere updates
        animation: false
    }
}
```

### 10.2 Lazy Rendering

```javascript
{
    type: 'sparkline',
    // Render alleen wanneer zichtbaar
    lazyRender: true,

    // Of custom check
    shouldRender: (record) => record.monthlySales?.length > 0
}
```

### 10.3 Batch Updates

```javascript
// Bij veel simultane updates
grid.suspendRefresh();

try {
    grid.store.forEach(record => {
        record.jan = Math.random() * 100;
        record.feb = Math.random() * 100;
        // etc.
    });
}
finally {
    grid.resumeRefresh();
}
```

---

## 11. Use Cases

### 11.1 Stock Ticker

```javascript
{
    type: 'sparkline',
    field: 'priceHistory',
    chartType: 'line',
    chart: {
        strokeColor: (data) =>
            data[data.length - 1] >= data[0] ? '#4CAF50' : '#F44336',
        fill: true,
        tension: 0.2
    }
}
```

### 11.2 Progress Comparison

```javascript
{
    type: 'sparkline',
    field: 'weeklyProgress',
    chartType: 'bar',
    chart: {
        colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800'],
        showTooltips: true,
        chartTooltip: {
            callbacks: {
                title: (ctx) => `Week ${ctx[0].dataIndex + 1}`,
                label: (ctx) => `${ctx.raw}% complete`
            }
        }
    }
}
```

### 11.3 Category Distribution

```javascript
{
    type: 'sparkline',
    field: 'categoryBreakdown',
    chartType: 'doughnut',
    width: 60,
    chart: {
        colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        cutout: '40%'
    }
}
```

---

## 12. React Integratie

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import '@bryntum/chart';

const columns = [
    { field: 'name', text: 'Product', flex: 1 },
    {
        field: 'salesTrend',
        text: 'Trend',
        type: 'sparkline',
        width: 120,
        chart: {
            showTooltips: true
        }
    },
    {
        field: 'salesTrend',
        text: 'Distribution',
        type: 'sparkline',
        chartType: 'pie',
        width: 80
    }
];

function SalesGrid({ data }) {
    return (
        <BryntumGrid
            columns={columns}
            data={data}
            rowHeight={50}
        />
    );
}
```

---

## 13. Troubleshooting

### 13.1 Common Issues

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Charts niet zichtbaar | Chart module niet geladen | Import `@bryntum/chart` |
| Charts te klein | rowHeight te laag | Verhoog `rowHeight` naar minimaal 40 |
| Data niet updating | Store sync issue | Gebruik `syncDataOnLoad: true` |
| Tooltips niet werkend | showTooltips niet gezet | Voeg `chart: { showTooltips: true }` toe |

### 13.2 Debug

```javascript
// Check of chart module geladen is
console.log('Chart available:', !!window.bryntum?.Chart);

// Inspecteer column config
console.log('Column config:', grid.columns.get('sparkline'));

// Check data
console.log('Sparkline data:', grid.store.first.monthlySales);
```

---

## 14. API Reference

### 14.1 SparklineColumn Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | String | - | `'sparkline'` |
| `chartType` | String | `'line'` | `'line'`, `'bar'`, `'pie'`, `'doughnut'` |
| `field` | String | - | Field met array data |
| `chart` | Object | `{}` | Chart configuratie |

### 14.2 Chart Config Options

| Option | Type | Description |
|--------|------|-------------|
| `showTooltips` | Boolean | Enable tooltips |
| `strokeColor` | String | Line/border color |
| `fillColor` | String | Fill color |
| `tension` | Number | Line curve smoothness (0-0.5) |
| `colors` | Array | Segment colors (pie/doughnut) |
| `cutout` | String | Doughnut hole size |

---

## Bronnen

- **Example**: `examples/sparklines/`
- **SparklineColumn**: `Grid.column.SparklineColumn`
- **Chart Module**: `@bryntum/chart`
- **Chart.js**: https://www.chartjs.org/

---

*Track A: Foundation - Grid Core Extensions (A1.4)*
