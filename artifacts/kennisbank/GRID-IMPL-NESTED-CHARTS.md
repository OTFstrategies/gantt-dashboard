# Grid Implementation: Nested Charts

> **Embedded charts in grid cellen** via RowExpander, Chart widget integratie, dynamische data visualisatie, en theme-aware chart styling.

---

## Overzicht

Nested charts combineren Bryntum Grid met Bryntum Chart om rijke data visualisaties te tonen binnen expandable rows. Dit patroon is ideaal voor:

- Employee dashboards met performance metrics
- Project overzichten met cost/time charts
- Sales data met trend visualisaties
- Hiërarchische data met detail views

```
┌────────────────────────────────────────────────────────────────┐
│ #  │ Name           │ Rate    │ Start     │ Email      │ City │
├────────────────────────────────────────────────────────────────┤
│ 1  │ John Smith     │ $85     │ 2023-01   │ john@...   │ NYC  │
├────────────────────────────────────────────────────────────────┤
│ ▼  │ Sarah Johnson  │ $95     │ 2023-02   │ sarah@...  │ LA   │
├────────────────────────────────────────────────────────────────┤
│    │ ┌─────────────────────────┬──────────────────────────┐    │
│    │ │ TASK GRID               │ REVENUE CHART 2024       │    │
│    │ ├─────────────────────────┤ ┌────────────────────┐   │    │
│    │ │ Project A    │ 40h │ $ │ │  ████              │   │    │
│    │ │ Project B    │ 25h │ $ │ │  ████ ████         │   │    │
│    │ │ Project C    │ 30h │ $ │ │  ████ ████ ██      │   │    │
│    │ │ ───────────────────── │ │  Jan  Feb  Mar     │   │    │
│    │ │ Total: 3 tasks   95h  │ └────────────────────┘   │    │
│    │ └─────────────────────────┴──────────────────────────┘    │
├────────────────────────────────────────────────────────────────┤
│ 3  │ Mike Wilson    │ $75     │ 2023-03   │ mike@...   │ CHI  │
└────────────────────────────────────────────────────────────────┘
```

---

## 1. Architectuur

### 1.1 Component Overzicht

```
Grid (Main)
├── Store (employeeStore)
├── Columns
└── RowExpander Feature
    └── Widget Container
        ├── TaskGrid (nested grid)
        │   └── Store (task subset)
        └── NestedChart (Chart widget)
            └── Chart.js integration
```

### 1.2 Benodigde Modules

```javascript
// Core imports
import { DomHelper, GlobalEvents, StringHelper, AjaxStore } from '@bryntum/core';

// Chart module (built on Chart.js)
import { Chart } from '@bryntum/chart';

// Grid modules
import { GridRowModel, Grid } from '@bryntum/grid';
```

---

## 2. Data Modellen

### 2.1 Employee Model (Parent)

```javascript
class EmployeeModel extends GridRowModel {
    static $name = 'EmployeeModel';

    static fields = [
        'id',
        'firstName',
        'surName',
        'city',
        { name: 'start', type: 'date' },
        'email',
        'rate',
        'avatar'
    ];

    // Calculated field - totaal uren uit gerelateerde tasks
    get totalTime() {
        return this.taskLog.reduce((acc, r) => acc + r.hours, 0);
    }

    get fullName() {
        return `${this.firstName} ${this.surName}`;
    }
}
```

### 2.2 Task Model (Child) met Relations

```javascript
class TaskModel extends GridRowModel {
    static $name = 'TaskModel';

    static fields = [
        'id',
        'employeeId',
        'project',
        'estimatedHours',
        { name: 'hours', defaultValue: 0 },
        'cost',
        'attested'
    ];

    // Calculated cost gebaseerd op employee rate
    get cost() {
        return this.employee.rate * this.hours;
    }
}

class EmployeeTaskModel extends TaskModel {
    static $name = 'EmployeeTaskModel';

    // Definieert relatie tussen task en employee
    static relations = {
        employee: {
            // FK naar employee
            foreignKey: 'employeeId',

            // Store waarin employee records zitten
            foreignStore: 'employeeStore',

            // Collectie naam op employee record
            relatedCollectionName: 'taskLog',

            // Propageer changes naar parent grid
            propagateRecordChanges: true
        }
    };
}
```

### 2.3 Store Setup

```javascript
const employeeStore = new AjaxStore({
    modelClass: EmployeeModel,
    readUrl: 'data/employees.json',
    autoLoad: true
});

const taskLogStore = new AjaxStore({
    modelClass: EmployeeTaskModel,
    // BELANGRIJK: moet op store gezet worden voor relations
    employeeStore,
    readUrl: 'data/tasks.json',
    autoLoad: true
});
```

---

## 3. NestedChart Widget

### 3.1 Custom Chart Widget

```javascript
// Theme-aware kleuren
const chartColors = {
    // Dark theme
    true: {
        gridColor: '#444',
        fillColor: '#3183fe99',
        strokeColor: '#36A2EBFF'
    },
    // Light theme
    false: {
        gridColor: '#eee',
        fillColor: '#3183fe22',
        strokeColor: '#36A2EB88'
    }
};

class NestedChart extends Chart {
    static $name = 'NestedChart';
    static type = 'nestedchart';

    static configurable = {
        title: `Revenue Summary ${new Date().getFullYear()}`,
        chartType: 'bar',
        showTitle: true,

        titleFont: {
            family: 'Poppins, "Helvetica Neue", Arial, sans-serif',
            weight: 500,
            size: 14
        },

        axisLabelColor: '#888',
        showLegend: false,

        // Voorkom label rotatie
        maxTickLabelRotation: 0,
        minTickLabelRotation: 0,

        chartPadding: {
            top: 0,
            left: 25,
            right: 25,
            bottom: 25
        },

        titlePadding: {
            bottom: 25
        },

        // X-axis labels
        labels: {
            field: 'month'
        },

        // Data series
        series: [{
            field: 'totalCost',
            label: 'Total Cost',
            strokeWidth: 1,
            borderRadius: 3
        }]
    };

    construct(...args) {
        super.construct(...args);

        // Luister naar theme changes
        GlobalEvents.on({
            theme: 'updateChartColors',
            thisObj: this
        });

        // Apply initiële kleuren
        this.updateChartColors();
    }

    updateChartColors() {
        const
            colors = chartColors[DomHelper.isDarkTheme],
            [series] = this.series;

        this.gridColor = this.axisColor = colors.gridColor;
        series.fillColor = colors.fillColor;
        series.strokeColor = colors.strokeColor;
    }
}

// Registreer widget type
NestedChart.initClass();
```

### 3.2 Chart Types

```javascript
// Bar chart (default)
{
    chartType: 'bar',
    series: [{ field: 'value', label: 'Revenue' }]
}

// Line chart
{
    chartType: 'line',
    series: [{
        field: 'value',
        fillColor: 'rgba(54, 162, 235, 0.2)',
        strokeColor: 'rgba(54, 162, 235, 1)',
        tension: 0.3  // Smooth curves
    }]
}

// Pie/Doughnut chart
{
    chartType: 'doughnut',
    series: [{ field: 'value' }],
    labels: { field: 'category' }
}

// Multiple series
{
    chartType: 'bar',
    series: [
        { field: 'actual', label: 'Actual', fillColor: '#36A2EB' },
        { field: 'planned', label: 'Planned', fillColor: '#FF6384' }
    ]
}
```

---

## 4. Nested TaskGrid Widget

### 4.1 Custom Grid Widget

```javascript
// Currency formatter
const formatUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
}).format;

class TaskGrid extends Grid {
    static $name = 'TaskGrid';
    static type = 'taskgrid';

    static configurable = {
        cls: 'b-inner-grid',
        minHeight: '20em',
        rowHeight: 45,
        columnLines: false,

        features: {
            group: false,
            summary: true,
            rowCopyPaste: false
        },

        columns: [
            {
                text: 'Project',
                field: 'name',
                flex: 1,
                sum: 'count',
                summaryRenderer: ({ sum }) => `Total: ${sum} tasks`
            },
            {
                type: 'number',
                text: 'Hours spent',
                field: 'hours',
                width: 140,
                align: 'right',
                sum: 'sum'
            },
            {
                text: 'Cost',
                field: 'cost',
                type: 'number',
                align: 'end',
                width: '15em',
                editor: false,
                htmlEncode: false,
                sum: 'sum',
                summaryRenderer: ({ sum }) => formatUSD(sum),
                renderer({ record, value, cellElement }) {
                    const
                        estimated = record.estimatedHours,
                        diff = estimated && record.hours
                            ? Math.round(1000 * ((record.hours / estimated) - 1)) / 10
                            : 0,
                        label = StringHelper.xss`
                            <div class="diffLabel">
                                ${diff > 0 ? '+' : ''}${diff}%
                                <i class="fa fa-arrow-trend-${diff > 0 ? 'up' : 'down'}"></i>
                            </div>`;

                    return `${label}<span class="b-cost">${formatUSD(value)}</span>`;
                }
            },
            {
                type: 'check',
                text: 'Attested',
                field: 'attested',
                width: 110,
                sum: 'sum'
            }
        ]
    };
}

TaskGrid.initClass();
```

---

## 5. RowExpander Configuratie

### 5.1 Complete Grid Setup

```javascript
const grid = new Grid({
    appendTo: 'container',
    columnLines: false,
    store: employeeStore,

    columns: [
        { text: '#', field: 'id', width: 60, align: 'center' },
        {
            text: 'Name',
            flex: 1,
            field: 'fullName',
            editor: false,
            renderer({ record }) {
                return [
                    {
                        tag: 'img',
                        className: 'b-avatar',
                        src: `images/${record.firstName.toLowerCase()}.png`
                    },
                    record.fullName
                ];
            }
        },
        {
            type: 'number',
            text: 'Hourly rate',
            field: 'rate',
            width: 150,
            renderer: ({ value }) => `$${value}`
        },
        { text: 'Start date', field: 'start', type: 'date' },
        { text: 'Total time', field: 'totalTime', width: 110, editor: false }
    ],

    features: {
        group: false,
        filterBar: true,

        rowExpander: {
            // Expander kolom configuratie
            column: {
                width: '3em',
                headerWidgets: [{
                    type: 'button',
                    tooltip: 'Toggle filter',
                    icon: 'fa fa-filter',
                    onAction() {
                        this.owner.grid.element.classList.toggle('b-show-filters');
                    }
                }]
            },

            // Widget configuratie voor expanded content
            widget: {
                type: 'container',
                cls: 'b-inner-container',
                items: {
                    innerGrid: {
                        type: 'taskgrid',
                        flex: 2,
                        store: {
                            modelClass: TaskModel,
                            employeeStore
                        },
                        destroyStore: true
                    },
                    nestedChart: {
                        type: 'nestedchart',
                        flex: 1
                    }
                }
            },

            // Handler voor expand event
            onExpand({ record, widget }) {
                const
                    year = new Date().getFullYear(),
                    { nestedChart, innerGrid } = widget.widgetMap;

                // Wacht op task store als nog aan het laden
                if (taskLogStore.isLoading) {
                    taskLogStore.on({
                        load() {
                            innerGrid.store.data = taskLogStore.query(
                                task => record.id === task.employeeId
                            );
                        },
                        once: true
                    });
                }
                else {
                    // Filter tasks voor deze employee
                    innerGrid.store.data = taskLogStore.query(
                        task => record.id === task.employeeId
                    );
                }

                // Functie om chart data te updaten
                const refreshChart = (animate) => {
                    nestedChart.setData(
                        // Genereer 12 maanden
                        ArrayHelper.populate(12, index => ({
                            month: new Date(year, index, 1)
                                .toLocaleString('default', { month: 'short' }),
                            totalCost: innerGrid.store.reduce((total, task) => {
                                if (task.month === index && task.attested) {
                                    total += task.cost;
                                }
                                return total;
                            }, 0)
                        })),
                        !animate  // Skip animation eerste keer
                    );
                };

                // Refresh chart bij task grid changes
                innerGrid.store.on({
                    name: 'chartRefresh',
                    change: refreshChart,
                    thisObj: innerGrid.store
                });

                // Initiële render
                refreshChart(false);
            }
        }
    },

    listeners: {
        // Auto-expand eerste rij
        renderRows: async({ source }) => {
            source.features.rowExpander.expand(source.store.getAt(2));
        },
        once: true
    }
});
```

---

## 6. Chart Data Population

### 6.1 Static Data

```javascript
nestedChart.setData([
    { month: 'Jan', totalCost: 5000 },
    { month: 'Feb', totalCost: 7500 },
    { month: 'Mar', totalCost: 6200 }
]);
```

### 6.2 Dynamic Aggregation

```javascript
// Aggregeer per maand
const monthlyData = ArrayHelper.populate(12, monthIndex => {
    const monthTotal = taskStore.reduce((sum, task) => {
        const taskMonth = new Date(task.date).getMonth();
        return taskMonth === monthIndex ? sum + task.cost : sum;
    }, 0);

    return {
        month: new Date(2024, monthIndex, 1)
            .toLocaleString('default', { month: 'short' }),
        totalCost: monthTotal
    };
});

nestedChart.setData(monthlyData);
```

### 6.3 Realtime Updates

```javascript
// Luister naar store changes
innerGrid.store.on({
    change: ({ action, records }) => {
        // Recalculate chart data
        const updatedData = calculateMonthlyTotals(innerGrid.store);
        nestedChart.setData(updatedData, true);  // animate: true
    }
});
```

---

## 7. Styling

### 7.1 Container Styling

```css
.b-inner-container {
    display: flex;
    padding: 1em;
    gap: 1em;
    background: var(--b-row-bg);
}

.b-inner-grid {
    border: 1px solid var(--b-border-color);
    border-radius: 4px;
}
```

### 7.2 Chart Theme Integration

```css
/* Dark theme overrides */
.b-theme-dark .b-nestedchart {
    --chart-grid-color: #444;
    --chart-text-color: #ccc;
}

/* Light theme */
.b-theme-classic .b-nestedchart {
    --chart-grid-color: #eee;
    --chart-text-color: #666;
}
```

### 7.3 Responsive Layout

```css
.b-inner-container {
    flex-wrap: wrap;
}

@media (max-width: 768px) {
    .b-inner-container {
        flex-direction: column;
    }

    .b-inner-container > * {
        flex: 1 1 100% !important;
    }
}
```

---

## 8. Chart Types in Detail

### 8.1 Bar Chart

```javascript
{
    type: 'nestedchart',
    chartType: 'bar',
    series: [{
        field: 'value',
        label: 'Revenue',
        fillColor: '#36A2EB',
        strokeColor: '#2E8BC0',
        strokeWidth: 1,
        borderRadius: 3
    }],
    labels: { field: 'category' }
}
```

### 8.2 Stacked Bar

```javascript
{
    chartType: 'bar',
    stacked: true,
    series: [
        { field: 'q1', label: 'Q1', fillColor: '#FF6384' },
        { field: 'q2', label: 'Q2', fillColor: '#36A2EB' },
        { field: 'q3', label: 'Q3', fillColor: '#FFCE56' },
        { field: 'q4', label: 'Q4', fillColor: '#4BC0C0' }
    ]
}
```

### 8.3 Line Chart

```javascript
{
    chartType: 'line',
    series: [{
        field: 'value',
        fillColor: 'rgba(54, 162, 235, 0.2)',
        strokeColor: 'rgba(54, 162, 235, 1)',
        tension: 0.4,  // Smooth curves
        fill: true
    }]
}
```

### 8.4 Pie/Doughnut

```javascript
{
    chartType: 'doughnut',
    series: [{
        field: 'value',
        colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
    }],
    labels: { field: 'label' }
}
```

---

## 9. Performance Optimalisaties

### 9.1 Lazy Loading

```javascript
features: {
    rowExpander: {
        // Data pas laden bij expand
        onExpand({ record, widget }) {
            const { innerGrid } = widget.widgetMap;

            // Check of data al geladen is
            if (!innerGrid.store.count) {
                innerGrid.mask('Loading...');

                fetch(`/api/tasks?employeeId=${record.id}`)
                    .then(r => r.json())
                    .then(data => {
                        innerGrid.store.data = data;
                        innerGrid.unmask();
                    });
            }
        }
    }
}
```

### 9.2 Widget Recycling

```javascript
features: {
    rowExpander: {
        // Hergebruik widgets
        recycleExpandedWidgets: true,

        // Alleen data refreshen bij expand
        beforeExpand({ record, widget }) {
            if (widget) {
                // Widget bestaat al, update alleen data
                updateWidgetData(widget, record);
                return false;  // Voorkom nieuwe widget creatie
            }
        }
    }
}
```

### 9.3 Chart Animation Control

```javascript
// Disable animations voor snelle updates
nestedChart.setData(data, false);  // skipAnimation = true

// Enable voor user-initiated actions
nestedChart.setData(data, true);   // animate
```

---

## 10. Interactie Patronen

### 10.1 Chart Click Handlers

```javascript
class NestedChart extends Chart {
    static configurable = {
        // ...
        listeners: {
            click({ item, dataItem }) {
                console.log('Clicked:', dataItem);

                // Drill down
                Toast.show(`${dataItem.month}: ${formatUSD(dataItem.totalCost)}`);
            }
        }
    };
}
```

### 10.2 Grid-Chart Synchronisatie

```javascript
// Highlight chart segment bij row select
innerGrid.on('selectionChange', ({ selected }) => {
    if (selected.length) {
        const task = selected[0];
        nestedChart.highlightItem(task.month);
    }
});

// Select grid row bij chart click
nestedChart.on('click', ({ dataItem }) => {
    const matchingTask = innerGrid.store.find(
        t => new Date(t.date).getMonth() === dataItem.monthIndex
    );
    if (matchingTask) {
        innerGrid.selectedRecord = matchingTask;
    }
});
```

---

## 11. React Integratie

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { Chart } from '@bryntum/chart';

function EmployeeDashboard() {
    const gridRef = useRef();

    const rowExpanderConfig = {
        widget: {
            type: 'container',
            items: {
                taskGrid: {
                    type: 'grid',
                    flex: 2,
                    columns: taskColumns
                },
                chart: {
                    type: 'chart',
                    flex: 1,
                    chartType: 'bar'
                }
            }
        },
        onExpand({ record, widget }) {
            // Populate nested widgets
            const tasks = fetchTasksForEmployee(record.id);
            widget.widgetMap.taskGrid.store.data = tasks;
            widget.widgetMap.chart.setData(calculateChartData(tasks));
        }
    };

    return (
        <BryntumGrid
            ref={gridRef}
            store={employeeStore}
            columns={employeeColumns}
            features={{
                rowExpander: rowExpanderConfig
            }}
        />
    );
}
```

---

## 12. Troubleshooting

### 12.1 Common Issues

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Chart niet zichtbaar | Container te klein | Set `minHeight` op container |
| Data niet geladen | Race condition | Wacht op store `load` event |
| Theme kleuren incorrect | Geen listener | Luister naar `GlobalEvents.theme` |
| Widget destroyed errors | Expand/collapse snel | Check `isDestroyed` before access |

### 12.2 Debug Helpers

```javascript
// Log chart data
console.log('Chart data:', nestedChart.data);

// Log widget map
console.log('Widgets:', widget.widgetMap);

// Force chart redraw
nestedChart.refresh();

// Check store relations
console.log('Employee tasks:', employeeRecord.taskLog);
```

---

## Bronnen

- **Example**: `examples/nested-grid-with-chart/`
- **Chart API**: `Core.widget.Chart`
- **RowExpander**: `Grid.feature.RowExpander`
- **Chart.js**: https://www.chartjs.org/

---

*Track A: Foundation - Grid Core Extensions (A1.3)*
