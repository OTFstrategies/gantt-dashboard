# TaskBoard Implementation: Charts Integration

> **Complete guide** voor Chart widgets integratie in Bryntum TaskBoard - ChartItem, standalone charts, en real-time data visualisatie.

---

## Overzicht

TaskBoard kan geïntegreerd worden met Bryntum Chart (gebaseerd op Chart.js):

| Component | Beschrijving |
|-----------|--------------|
| **ChartItem** | TaskItem type voor mini-charts in cards |
| **Chart Widget** | Standalone chart widget |
| **Real-time Updates** | Live data updates in charts |

> **Let op:** Charts vereist het Bryntum Chart module (`chart.module.js`) naast TaskBoard.

---

## 1. Setup & Imports

### 1.1 Module Imports

```javascript
// Standard imports
import { Container, StringHelper, Toast } from '@bryntum/core';
import '@bryntum/chart';  // Chart module
import '@bryntum/taskboard';

// Of thin modules voor kleinere bundles
import { Container, StringHelper, Toast } from '@bryntum/core/thin';
import '@bryntum/chart/thin';
import '@bryntum/taskboard/thin';
```

### 1.2 CSS Imports

```javascript
// Chart styles
import '@bryntum/chart/chart.stockholm.css';
// TaskBoard styles
import '@bryntum/taskboard/taskboard.stockholm.css';
```

---

## 2. ChartItem in Task Cards

### 2.1 Line Chart in Header

```javascript
const taskBoard = new TaskBoard({
    headerItems: {
        text: {
            type: 'template',
            template: ({ taskRecord }) =>
                StringHelper.xss`<i class="fa fa-${taskRecord.iconCls}"></i>${taskRecord.name}`
        },

        // Mini line chart showing activity
        activity: {
            type: 'chart',
            chartType: 'line',
            chartConfig: {
                showPoints: false,
                max: 8
            }
        }
    },

    project: {
        taskStore: {
            fields: [
                // Array field voor chart data
                { name: 'activity', type: 'array' }
            ]
        }
    }
});
```

### 2.2 Bar Chart in Body

```javascript
bodyItems: {
    // Task progress
    progress: { type: 'progress' },

    // Bar chart voor custom data
    bars: {
        type: 'chart',
        chartType: 'bar',
        chartConfig: {
            showAxes: true,
            series: [
                {
                    field: 'value',
                    fillColor: '#96c3e8',
                    strokeColor: 'transparent'
                }
            ]
        }
    }
}
```

### 2.3 Data Format voor Charts

```json
{
    "id": 11,
    "name": "Set up tracking system",
    "status": "Doing",
    "activity": [3, 2, 3, 1, 2, 1, 1],
    "bars": [
        { "label": "New", "value": 5 },
        { "label": "Reviewed", "value": 3 },
        { "label": "Qualified", "value": 2 }
    ]
}
```

---

## 3. ChartItem Configuration

### 3.1 ChartItemConfig

```typescript
interface ChartItemConfig {
    type: 'chart';

    // Chart type
    chartType?: 'line' | 'bar' | 'pie';

    // Chart widget configuration
    chartConfig?: {
        // Line chart options
        showPoints?: boolean;
        max?: number;
        min?: number;

        // Bar chart options
        showAxes?: boolean;

        // Series configuration
        series?: SeriesConfig[];

        // General options
        showLegend?: boolean;
        showTitle?: boolean;
    };

    // Field containing chart data
    field?: string;

    // Styling
    style?: string | object;
}
```

### 3.2 Series Configuration

```javascript
chartConfig: {
    series: [
        {
            // Data field
            field: 'value',

            // Colors
            fillColor: '#96c3e8',
            strokeColor: '#4a90d9',
            fillColorField: 'color',  // Dynamic color from data

            // Label
            label: 'Task Count'
        }
    ]
}
```

---

## 4. Standalone Chart Widget

### 4.1 Dashboard Layout

```javascript
const container = new Container({
    appendTo: 'container',
    layout: 'hbox',
    flex: 1,

    items: {
        // TaskBoard
        taskBoard: {
            type: 'taskboard',
            flex: 2,
            // ... taskboard config
        },

        // Standalone bar chart
        barChart: {
            type: 'chart',
            flex: 1,
            minWidth: 400,
            title: 'Employee Recruitment Progress',
            chartType: 'bar',
            showTitle: true,

            // Styling
            titleFont: {
                family: 'Poppins, "Helvetica Neue", Arial, sans-serif',
                bold: false,
                size: 18
            },

            titlePadding: {
                top: 0,
                left: 0,
                right: 0,
                bottom: 15
            },

            showLegend: false,

            chartPadding: {
                top: 25,
                left: 25,
                right: 25,
                bottom: 25
            },

            // Labels (x-axis)
            labels: {
                field: 'status'
            },

            // Series
            series: [
                {
                    field: 'count',
                    label: 'Task Count',
                    fillColorField: 'color'
                }
            ],

            // Initial data
            data: [
                { status: 'Todo', count: 0, color: '#feddb2' },
                { status: 'Doing', count: 0, color: '#b4e5fc' },
                { status: 'Done', count: 0, color: '#ddedc9' }
            ]
        }
    }
});
```

### 4.2 Chart Widget Access

```javascript
const { taskBoard, barChart } = container.widgetMap;

// Update chart data
barChart.data = [
    { status: 'Todo', count: 5, color: '#feddb2' },
    { status: 'Doing', count: 3, color: '#b4e5fc' },
    { status: 'Done', count: 8, color: '#ddedc9' }
];
```

---

## 5. Real-time Chart Updates

### 5.1 Update op Data Changes

```javascript
project: {
    loadUrl: 'data/data.json',
    autoLoad: true,

    listeners: {
        // Update chart na load
        load: updateChart
    },

    taskStore: {
        listeners: {
            // Update chart bij task changes
            change({ action, changes }) {
                if (action !== 'update' || changes?.status) {
                    updateChart();
                }
            }
        }
    }
}

function updateChart() {
    const stats = {
        Todo: 0,
        Doing: 0,
        Done: 0
    };

    for (const task of taskBoard.project.taskStore) {
        stats[task.status] += 1;
    }

    barChart.data = [
        { status: 'Todo', count: stats.Todo, color: '#feddb2' },
        { status: 'Doing', count: stats.Doing, color: '#b4e5fc' },
        { status: 'Done', count: stats.Done, color: '#ddedc9' }
    ];
}
```

### 5.2 Periodic Updates (Simulated Activity)

```javascript
// Update activity data elke 2 seconden
container.setInterval(() => {
    taskBoard.project.taskStore.forEach(task => {
        if (task.status === 'Doing' && task.activity?.length > 0) {
            const { activity } = task;

            // Shift data (remove oldest, add newest)
            activity.pop();
            activity.unshift(Math.floor(Math.random() * 9));

            // Trigger update (slice creates new array reference)
            task.activity = activity.slice();
        }
    });
}, 2000);
```

---

## 6. Chart Types

### 6.1 Line Chart

```javascript
{
    type: 'chart',
    chartType: 'line',
    chartConfig: {
        showPoints: true,
        pointRadius: 3,
        tension: 0.4,  // Curve smoothness
        fill: true,
        series: [
            {
                field: 'value',
                strokeColor: '#4a90d9',
                fillColor: 'rgba(74, 144, 217, 0.2)'
            }
        ]
    }
}
```

### 6.2 Bar Chart

```javascript
{
    type: 'chart',
    chartType: 'bar',
    chartConfig: {
        showAxes: true,
        horizontal: false,  // Vertical bars (default)
        series: [
            {
                field: 'value',
                fillColor: '#96c3e8',
                strokeColor: '#4a90d9',
                barThickness: 20
            }
        ]
    }
}
```

### 6.3 Pie Chart

```javascript
{
    type: 'chart',
    chartType: 'pie',
    chartConfig: {
        series: [
            {
                field: 'value',
                fillColorField: 'color'
            }
        ]
    },
    data: [
        { label: 'Todo', value: 5, color: '#feddb2' },
        { label: 'Doing', value: 3, color: '#b4e5fc' },
        { label: 'Done', value: 8, color: '#ddedc9' }
    ]
}
```

---

## 7. Swimlane Charts

### 7.1 Chart per Swimlane

```javascript
const taskBoard = new TaskBoard({
    swimlanes: [
        { id: 'dev', text: 'Development' },
        { id: 'qa', text: 'QA' },
        { id: 'ops', text: 'Operations' }
    ],

    swimlaneField: 'team'
});

// Calculate stats per swimlane
function getSwimlanStats() {
    const stats = {};

    taskBoard.swimlanes.forEach(swimlane => {
        stats[swimlane.id] = { todo: 0, doing: 0, done: 0 };
    });

    taskBoard.project.taskStore.forEach(task => {
        const swimlane = task[taskBoard.swimlaneField];
        const column = task[taskBoard.columnField];

        if (stats[swimlane]) {
            stats[swimlane][column.toLowerCase()]++;
        }
    });

    return stats;
}
```

---

## 8. Column Statistics Chart

### 8.1 Task Count per Column

```javascript
function updateColumnChart() {
    const data = taskBoard.columns.map(column => ({
        column: column.text,
        count: taskBoard.project.taskStore.query(
            task => task[taskBoard.columnField] === column.id
        ).length,
        color: getColumnColor(column.color)
    }));

    columnChart.data = data;
}

function getColumnColor(colorName) {
    const colors = {
        'orange': '#feddb2',
        'light-blue': '#b4e5fc',
        'light-green': '#ddedc9',
        'pink': '#f8d7da',
        'purple': '#e2d4f0'
    };
    return colors[colorName] || '#ccc';
}
```

---

## 9. Custom Chart Styling

### 9.1 Chart Theming

```javascript
{
    type: 'chart',
    chartType: 'bar',
    cls: 'custom-chart',

    titleFont: {
        family: 'Poppins, sans-serif',
        size: 18,
        bold: false,
        color: '#333'
    },

    chartPadding: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 40
    },

    backgroundColor: '#f5f5f5',

    series: [
        {
            field: 'value',
            fillColor: '#3498db',
            strokeColor: '#2980b9',
            hoverFillColor: '#2ecc71'
        }
    ]
}
```

### 9.2 CSS Overrides

```css
.custom-chart {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-chart .b-chart-title {
    font-weight: 600;
    color: #2c3e50;
}

/* Mini charts in task cards */
.b-taskboard-card .b-chart {
    height: 40px;
    min-width: 60px;
}
```

---

## 10. TypeScript Interfaces

```typescript
// ChartItem Config
interface ChartItemConfig {
    type: 'chart';
    chartType?: 'line' | 'bar' | 'pie';
    chartConfig?: ChartConfig;
    field?: string;
    style?: string | CSSStyleDeclaration;
    editor?: EditorConfig | false;
}

// Chart Configuration
interface ChartConfig {
    // Display options
    showPoints?: boolean;
    showAxes?: boolean;
    showLegend?: boolean;
    showTitle?: boolean;

    // Sizing
    max?: number;
    min?: number;

    // Series
    series?: SeriesConfig[];

    // Labels
    labels?: {
        field: string;
    };

    // Padding
    chartPadding?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
}

// Series Configuration
interface SeriesConfig {
    field: string;
    label?: string;
    fillColor?: string;
    strokeColor?: string;
    fillColorField?: string;
    barThickness?: number;
    tension?: number;
    fill?: boolean;
    pointRadius?: number;
}

// Chart Widget Config
interface ChartWidgetConfig {
    type: 'chart';
    chartType: 'line' | 'bar' | 'pie';
    title?: string;
    showTitle?: boolean;
    showLegend?: boolean;
    titleFont?: FontConfig;
    titlePadding?: PaddingConfig;
    chartPadding?: PaddingConfig;
    backgroundColor?: string;
    labels?: { field: string };
    series?: SeriesConfig[];
    data?: object[];
    flex?: number;
    minWidth?: number;
    minHeight?: number;
}

// Font Configuration
interface FontConfig {
    family?: string;
    size?: number;
    bold?: boolean;
    color?: string;
}

// Padding Configuration
interface PaddingConfig {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

// ChartItem Class
interface ChartItem extends TaskItem {
    readonly isChartItem: boolean;
}
```

---

## 11. Best Practices

### 11.1 Performance

```javascript
// Debounce chart updates
let updateTimeout;
function scheduleChartUpdate() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateChart, 100);
}

taskStore.on({
    change: scheduleChartUpdate
});
```

### 11.2 Memory Management

```javascript
// Cleanup bij destroy
container.on({
    destroy() {
        clearInterval(updateInterval);
        clearTimeout(updateTimeout);
    }
});
```

### 11.3 Data Validation

```javascript
function updateChart() {
    const data = taskBoard.columns.map(column => {
        const count = taskBoard.project.taskStore.query(
            task => task[taskBoard.columnField] === column.id
        ).length;

        return {
            column: column.text,
            count: Math.max(0, count),  // Ensure non-negative
            color: getColumnColor(column.color) || '#ccc'
        };
    });

    if (data.length > 0) {
        barChart.data = data;
    }
}
```

---

## 12. Common Patterns

### 12.1 Dashboard met Meerdere Charts

```javascript
const dashboard = new Container({
    layout: 'vbox',
    items: {
        top: {
            type: 'container',
            layout: 'hbox',
            height: 300,
            items: {
                taskBoard: { type: 'taskboard', flex: 2 },
                statusChart: { type: 'chart', flex: 1, chartType: 'pie' }
            }
        },
        bottom: {
            type: 'container',
            layout: 'hbox',
            height: 200,
            items: {
                progressChart: { type: 'chart', flex: 1, chartType: 'bar' },
                activityChart: { type: 'chart', flex: 1, chartType: 'line' }
            }
        }
    }
});
```

### 12.2 Tooltip met Chart

```javascript
features: {
    taskTooltip: {
        template({ taskRecord }) {
            // Create mini chart data
            const activityHtml = taskRecord.activity
                ? `<div class="mini-chart">${taskRecord.activity.join(',')}</div>`
                : '';

            return StringHelper.xss`
                <h1>${taskRecord.name}</h1>
                <div>Activity: ${activityHtml}</div>
            `;
        }
    }
}
```

---

## 13. Troubleshooting

### 13.1 Chart Niet Zichtbaar

```javascript
// Ensure chart module is loaded
console.log('Chart loaded:', typeof Chart !== 'undefined');

// Check data format
console.log('Chart data:', barChart.data);

// Force refresh
barChart.refresh();
```

### 13.2 Data Updates Niet Doorgevoerd

```javascript
// Create new array reference (triggers reactivity)
task.activity = [...task.activity];  // GOED
task.activity = task.activity.slice();  // GOED

// Dit werkt NIET (geen nieuwe reference)
task.activity.push(value);  // SLECHT
```

---

## Samenvatting

| Aspect | Implementation |
|--------|----------------|
| **Import** | `import '@bryntum/chart'` |
| **ChartItem** | `type: 'chart'` in TaskItems |
| **Chart Types** | `'line'`, `'bar'`, `'pie'` |
| **Standalone** | `type: 'chart'` widget |
| **Data Field** | Array field in TaskModel |
| **Updates** | Store change listeners |

---

*Laatst bijgewerkt: December 2024*
*Bryntum TaskBoard v7.1.0*
