# Grid Implementation: Charts Integration

> **Chart.js integratie** voor het visualiseren van geselecteerde grid data.

---

## Overzicht

Bryntum Grid's Charts feature integreert met Chart.js voor interactieve data visualisatie.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ ℹ Select cells, right-click and select "New chart" to create a chart   │
├──────────────────────────────────────────────────────────────────────────┤
│  Player      │ Team  │ Points │ Assists │ Rebounds │ Games │ Position   │
├──────────────┼───────┼────────┼─────────┼──────────┼───────┼────────────┤
│  John Doe    │ Lakers│🏆 28.5 │   7.2   │   6.8    │  72   │ Forward    │
│  Jane Smith  │ Bulls │   21.3 │   4.5   │   5.2    │  68   │ Guard      │
│  Bob Wilson  │ Heat  │🚩 12.1 │  10.3   │   3.1    │  75   │ Point Guard│
├──────────────┴───────┴────────┴─────────┴──────────┴───────┴────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                   📊 CHART POPUP                                    │ │
│  │  ┌───────────────────────────────────────────────────────────────┐ │ │
│  │  │       30 ┤ ████                                               │ │ │
│  │  │          │ ████  ███                                          │ │ │
│  │  │       20 ┤ ████  ███  ██                                      │ │ │
│  │  │          │ ████  ███  ██                                      │ │ │
│  │  │       10 ┤ ████  ███  ██                                      │ │ │
│  │  │          │ ████  ███  ██                                      │ │ │
│  │  │        0 └─John──Jane─Bob──────────────────────────────────── │ │ │
│  │  └───────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic Charts Setup

### 1.1 Enable Charts Feature

```javascript
import { Grid, StringHelper, Toast } from '@bryntum/grid';
import '@bryntum/grid/chart.module.js';  // Include chart module

const grid = new Grid({
    appendTo: 'container',
    flex: 1,

    // Selection mode for chart data selection
    selectionMode: {
        cell: true,
        column: true,
        multiSelect: true,
        dragSelect: true
    },

    features: {
        charts: {
            popup: {
                minWidth: '60em',
                minHeight: '30em'
            }
        }
    },

    columns: [
        { text: 'Player', field: 'player', flex: 2 },
        { text: 'Team', field: 'team', flex: 1 },
        { text: 'Points', field: 'points', type: 'number', width: 100 },
        { text: 'Assists', field: 'assists', type: 'number', width: 100 },
        { text: 'Rebounds', field: 'rebounds', type: 'number', width: 100 },
        { text: 'Games Played', field: 'gamesPlayed', type: 'number', width: 120 },
        { text: 'Position', field: 'position', flex: 1 },
        { text: 'Salary', field: 'salary', type: 'number', width: 120, format: '$9,999.' },
        { text: 'Experience', field: 'experience', type: 'number', width: 100 }
    ],

    store: {
        fields: [
            { name: 'player', type: 'string' },
            { name: 'team', type: 'string' },
            { name: 'points', type: 'number' },
            { name: 'assists', type: 'number' },
            { name: 'rebounds', type: 'number' },
            { name: 'gamesPlayed', type: 'number' },
            { name: 'position', type: 'string' },
            { name: 'salary', type: 'number' },
            { name: 'experience', type: 'number' }
        ],

        readUrl: 'data/players.json',
        autoLoad: true,

        listeners: {
            load() {
                // Auto-select range and open chart on load
                grid.selectCellRange(
                    { columnIndex: 0, rowIndex: 0 },
                    { columnIndex: 4, rowIndex: 10 }
                );
                grid.features.charts.openPopup();
            }
        }
    },

    tbar: [
        '<i class="fa fa-info-circle"></i> Select cells, right-click and select "New chart"'
    ]
});

Toast.show({
    html: 'This example uses the <b>Bryntum Chart</b> module, built on <a href="https://www.chartjs.org/">Chart.js</a>',
    timeout: 10000
});
```

---

## 2. Stats Highlighting

### 2.1 Custom Stats Renderer

```javascript
const statFields = [
    'points', 'assists', 'rebounds', 'gamesPlayed',
    'salary', 'endorsements', 'experience'
];

const stats = {};

// Calculate stats for highlighting
function updateStats() {
    const { store } = grid;

    statFields.forEach(field => {
        stats[`max${StringHelper.capitalize(field)}`] = store.max(field);
        stats[`min${StringHelper.capitalize(field)}`] = store.min(field);
        stats[`avg${StringHelper.capitalize(field)}`] = store.average(field);
    });

    grid.refreshRows();
}

// Custom renderer for stats columns
function statsRenderer({ column, value }) {
    const capField = StringHelper.capitalize(column.field);
    const { text } = column;
    const max = stats[`max${capField}`];
    const min = stats[`min${capField}`];
    const avg = stats[`avg${capField}`];

    if (value == null) {
        return '';
    }

    // Highest value
    if (value === max) {
        return `<span style="color:gold" data-btip="Highest ${text}">
            <i class="fa fa-trophy"></i> ${value}
        </span>`;
    }

    // Lowest value
    if (value === min) {
        return `<span style="color:red" data-btip="Lowest ${text}">
            <i class="fa fa-flag"></i> ${value}
        </span>`;
    }

    // Above average
    if (value > avg * 1.2) {
        return `<span style="color:green" data-btip="Above Average ${text}">${value}</span>`;
    }

    // Below average
    if (value < avg * 0.8) {
        return `<span style="color:crimson" data-btip="Below Average ${text}">${value}</span>`;
    }

    return value;
}

// Apply renderer to columns
columns: [
    { text: 'Player', field: 'player', flex: 2 },
    { text: 'Team', field: 'team', flex: 1 },
    {
        text: 'Points',
        field: 'points',
        type: 'number',
        width: 100,
        htmlEncode: false,
        renderer: statsRenderer
    },
    {
        text: 'Assists',
        field: 'assists',
        type: 'number',
        width: 100,
        htmlEncode: false,
        renderer: statsRenderer
    }
]

// Update stats on store changes
store: {
    listeners: {
        load: updateStats,
        change: updateStats
    }
}
```

---

## 3. Chart Configuration

### 3.1 Popup Configuration

```javascript
features: {
    charts: {
        popup: {
            minWidth: '60em',
            minHeight: '30em',
            maximizable: true,
            modal: false,
            title: 'Data Visualization'
        }
    }
}
```

### 3.2 Programmatic Chart Opening

```javascript
// Select cell range
grid.selectCellRange(
    { columnIndex: 2, rowIndex: 0 },  // Start: Points column, first row
    { columnIndex: 4, rowIndex: 5 }   // End: Rebounds column, sixth row
);

// Open chart popup
grid.features.charts.openPopup();
```

---

## 4. Selection Modes

### 4.1 Cell Selection

```javascript
selectionMode: {
    cell: true,
    column: true,
    row: false,
    multiSelect: true,
    dragSelect: true
}
```

### 4.2 Column Selection

```javascript
selectionMode: {
    cell: false,
    column: true,
    multiSelect: true
}
```

---

## 5. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useRef, useCallback, useEffect } from 'react';

function GridWithCharts({ data }) {
    const gridRef = useRef(null);

    const openChart = useCallback(() => {
        const grid = gridRef.current?.instance;
        if (grid) {
            // Select data range
            grid.selectCellRange(
                { columnIndex: 2, rowIndex: 0 },
                { columnIndex: 5, rowIndex: Math.min(10, grid.store.count - 1) }
            );
            // Open chart popup
            grid.features.charts.openPopup();
        }
    }, []);

    const gridConfig = {
        selectionMode: {
            cell: true,
            column: true,
            multiSelect: true,
            dragSelect: true
        },

        features: {
            charts: {
                popup: {
                    minWidth: '50em',
                    minHeight: '25em'
                }
            }
        },

        columns: [
            { text: 'Name', field: 'name', flex: 2 },
            { text: 'Category', field: 'category', flex: 1 },
            { text: 'Q1', field: 'q1', type: 'number', width: 100 },
            { text: 'Q2', field: 'q2', type: 'number', width: 100 },
            { text: 'Q3', field: 'q3', type: 'number', width: 100 },
            { text: 'Q4', field: 'q4', type: 'number', width: 100 },
            { text: 'Total', field: 'total', type: 'number', width: 120 }
        ]
    };

    return (
        <div className="grid-charts-wrapper">
            <div className="toolbar">
                <button onClick={openChart}>
                    Open Chart
                </button>
                <span className="info">
                    Or select cells and right-click for "New chart"
                </span>
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

## 6. Styling

```css
/* Chart popup */
.b-chart-popup {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.b-chart-popup .b-popup-header {
    background: #2196F3;
    color: white;
    padding: 12px 16px;
}

/* Stats highlighting */
.b-grid-cell .fa-trophy {
    color: gold;
    margin-right: 4px;
}

.b-grid-cell .fa-flag {
    color: red;
    margin-right: 4px;
}

/* Selection highlight */
.b-grid-cell.b-selected {
    background: rgba(33, 150, 243, 0.2);
}

.b-grid-cell.b-drag-selecting {
    background: rgba(33, 150, 243, 0.1);
    outline: 2px dashed #2196F3;
}

/* Info tooltip */
.b-grid-cell [data-btip] {
    cursor: help;
}

/* Chart container */
.b-chart-container {
    padding: 16px;
}

.b-chart-container canvas {
    max-width: 100%;
}

/* Toolbar info */
.grid-charts-wrapper .info {
    color: #666;
    font-size: 12px;
    margin-left: 16px;
}
```

---

## 7. Chart Types

De Charts feature ondersteunt alle Chart.js chart types:

| Type | Description |
|------|-------------|
| Bar | Vertical bar chart |
| Horizontal Bar | Horizontal bars |
| Line | Line chart |
| Area | Filled line chart |
| Pie | Pie chart |
| Doughnut | Ring chart |
| Radar | Spider/radar chart |
| Scatter | Scatter plot |
| Bubble | Bubble chart |

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Charts niet beschikbaar | Module niet geladen | Import chart.module.js |
| Geen chart optie in menu | Geen cellen geselecteerd | Selecteer eerst cellen |
| Popup te klein | Popup config mist | Configureer minWidth/minHeight |
| Stats niet geupdate | Listener mist | Voeg change listener toe |
| Selection werkt niet | selectionMode verkeerd | Enable cell: true |

---

## API Reference

### Charts Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `popup` | Object | Chart popup configuration |
| `popup.minWidth` | String | Minimum popup width |
| `popup.minHeight` | String | Minimum popup height |
| `popup.maximizable` | Boolean | Allow maximize |
| `popup.modal` | Boolean | Modal mode |

### Selection Mode Config

| Property | Type | Description |
|----------|------|-------------|
| `cell` | Boolean | Enable cell selection |
| `column` | Boolean | Enable column selection |
| `row` | Boolean | Enable row selection |
| `multiSelect` | Boolean | Allow multi-select |
| `dragSelect` | Boolean | Enable drag selection |

### Methods

| Method | Description |
|--------|-------------|
| `openPopup()` | Open chart popup |
| `selectCellRange(start, end)` | Select cell range |

### Store Aggregation Methods

| Method | Description |
|--------|-------------|
| `max(field)` | Get maximum value |
| `min(field)` | Get minimum value |
| `average(field)` | Get average value |
| `sum(field)` | Get sum of values |

---

## Bronnen

- **Example**: `examples/charts/`
- **Charts Feature**: `Grid.feature.Charts`
- **Chart.js**: https://www.chartjs.org/

---

*Priority 2: Medium Priority Features*
