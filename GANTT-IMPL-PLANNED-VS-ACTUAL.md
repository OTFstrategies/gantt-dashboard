# Gantt Implementation: Planned vs Actual

> **Baseline vergelijking** met geplande versus actuele data, variantie-analyse, baseline snapshots, en PlannedPercentDone tracking.

---

## Overzicht

Planned vs Actual vergelijkt de oorspronkelijke planning (baseline) met de huidige status. Dit maakt schedule variantie-analyse en SPI berekeningen mogelijk.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Task               │ Planned │ Actual  │ Variance │ Timeline          │
├────────────────────────────────────────────────────────────────────────┤
│ Development        │   100%  │   80%   │   -20%   │ ████████░░░░      │
│                    │         │         │          │ ──────── (baseline)│
├────────────────────────────────────────────────────────────────────────┤
│ Testing            │    50%  │   60%   │   +10%   │     ████████░░    │
│                    │         │         │          │     ────────       │
└────────────────────────────────────────────────────────────────────────┘
                                         │
                                    Actual bar
                                    ──── Baseline (ghosted)
```

---

## 1. Baselines Feature

### 1.1 Feature Activeren

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',

    features: {
        baselines: {
            // Toon baseline bars
            disabled: false
        }
    },

    project: new ProjectModel({
        loadUrl: '/api/project',
        autoLoad: true
    })
});
```

### 1.2 Baseline Data Structure

```javascript
// Task met baseline data
{
    id: 1,
    name: 'Development Phase',
    startDate: '2024-02-01',      // Actuele start
    endDate: '2024-02-28',        // Actuele end
    percentDone: 80,              // Actuele progress

    // Baseline array (meerdere baselines mogelijk)
    baselines: [
        {
            startDate: '2024-01-15',   // Geplande start
            endDate: '2024-02-15',     // Geplande end
            percentDone: 100,          // Geplande progress voor vandaag
            name: 'Original Plan'
        }
    ]
}
```

---

## 2. PlannedPercentDone Column

### 2.1 Column Configuratie

```javascript
columns: [
    { type: 'name', width: 250 },
    {
        type: 'percentdone',
        text: 'Actual %',
        width: 100
    },
    {
        // Planned percent done (uit baseline)
        text: 'Planned %',
        field: 'plannedPercentDone',
        width: 100,
        renderer({ value }) {
            return value != null ? `${Math.round(value)}%` : '-';
        }
    },
    {
        text: 'Variance',
        width: 100,
        renderer({ record }) {
            const planned = record.plannedPercentDone;
            const actual = record.percentDone;

            if (planned == null) return '-';

            const variance = actual - planned;
            const cls = variance >= 0 ? 'positive' : 'negative';

            return {
                class: `variance ${cls}`,
                text: `${variance >= 0 ? '+' : ''}${Math.round(variance)}%`
            };
        }
    }
]
```

### 2.2 Berekende PlannedPercentDone

```javascript
import { TaskModel } from '@bryntum/gantt';

class PlannedTaskModel extends TaskModel {
    static fields = [
        {
            name: 'plannedPercentDone',
            persist: false
        }
    ];

    // Bereken geplande progress voor vandaag
    get plannedPercentDone() {
        const baseline = this.baselines?.[0];
        if (!baseline) return null;

        const today = new Date();
        const start = new Date(baseline.startDate);
        const end = new Date(baseline.endDate);

        // Nog niet gestart
        if (today < start) return 0;

        // Voorbij einddatum
        if (today > end) return 100;

        // Lineaire progressie
        const totalDuration = end - start;
        const elapsed = today - start;

        return (elapsed / totalDuration) * 100;
    }
}
```

---

## 3. Baseline Visualisatie

### 3.1 Baseline Bars

```javascript
features: {
    baselines: {
        // Welke baseline tonen (0 = eerste)
        baselineIndex: 0,

        // Rendering opties
        template: ({ taskRecord, baseline }) => {
            return {
                class: 'baseline-bar',
                style: {
                    opacity: 0.5
                }
            };
        }
    }
}
```

### 3.2 Custom Baseline Renderer

```javascript
features: {
    baselines: {
        renderer({ taskRecord, baseline, renderData }) {
            // Pas styling aan gebaseerd op variantie
            const startVariance = taskRecord.startDate - baseline.startDate;
            const endVariance = taskRecord.endDate - baseline.endDate;

            if (endVariance > 0) {
                // Loopt achter - rode baseline
                renderData.cls.add('baseline-delayed');
            }
            else if (endVariance < 0) {
                // Voor op schema - groene baseline
                renderData.cls.add('baseline-ahead');
            }

            return renderData;
        }
    }
}
```

### 3.3 Baseline Styling

```css
/* Baseline bar */
.b-gantt-baseline {
    background: #9e9e9e;
    opacity: 0.6;
    border-radius: 2px;
    height: 6px;
    margin-top: 4px;
}

/* Delayed baseline */
.baseline-delayed .b-gantt-baseline {
    background: #f44336;
}

/* Ahead of schedule */
.baseline-ahead .b-gantt-baseline {
    background: #4caf50;
}

/* Baseline label */
.b-gantt-baseline-label {
    font-size: 0.75em;
    color: #666;
}
```

---

## 4. Creating Baselines

### 4.1 Manual Baseline Creation

```javascript
// Maak baseline van huidige planning
function createBaseline(name = 'Baseline') {
    const tasks = gantt.taskStore.records;

    tasks.forEach(task => {
        // Voeg baseline toe
        const baseline = {
            startDate: task.startDate,
            endDate: task.endDate,
            duration: task.duration,
            percentDone: task.percentDone,
            name,
            createdDate: new Date()
        };

        // Append of replace
        if (!task.baselines) {
            task.baselines = [baseline];
        }
        else {
            task.baselines.push(baseline);
        }
    });

    gantt.refresh();
}

// Toolbar button
tbar: [
    {
        type: 'button',
        text: 'Save Baseline',
        icon: 'fa fa-save',
        onClick: () => {
            const name = prompt('Baseline name:', `Baseline ${Date.now()}`);
            if (name) createBaseline(name);
        }
    }
]
```

### 4.2 Baseline Selector

```javascript
tbar: [
    {
        type: 'combo',
        label: 'Show Baseline',
        width: 200,
        store: {
            data: [
                { id: 0, name: 'Original Plan' },
                { id: 1, name: 'Revision 1' },
                { id: 2, name: 'Revision 2' }
            ]
        },
        value: 0,
        onChange({ value }) {
            gantt.features.baselines.baselineIndex = value;
        }
    }
]
```

---

## 5. Variance Calculations

### 5.1 Schedule Variance

```javascript
class VarianceTaskModel extends TaskModel {
    static fields = [
        { name: 'startVariance', persist: false },
        { name: 'endVariance', persist: false },
        { name: 'durationVariance', persist: false }
    ];

    get startVariance() {
        const baseline = this.baselines?.[0];
        if (!baseline) return null;

        // Dagen verschil (positief = vertraagd)
        const diff = this.startDate - new Date(baseline.startDate);
        return Math.round(diff / (1000 * 60 * 60 * 24));
    }

    get endVariance() {
        const baseline = this.baselines?.[0];
        if (!baseline) return null;

        const diff = this.endDate - new Date(baseline.endDate);
        return Math.round(diff / (1000 * 60 * 60 * 24));
    }

    get durationVariance() {
        const baseline = this.baselines?.[0];
        if (!baseline) return null;

        return this.duration - baseline.duration;
    }
}
```

### 5.2 Variance Columns

```javascript
columns: [
    { type: 'name', width: 200 },
    {
        text: 'Start Var.',
        width: 100,
        align: 'center',
        renderer({ record }) {
            const variance = record.startVariance;
            if (variance == null) return '-';

            if (variance === 0) {
                return { class: 'on-time', text: 'On time' };
            }

            const cls = variance > 0 ? 'delayed' : 'early';
            const suffix = variance > 0 ? 'late' : 'early';

            return {
                class: cls,
                text: `${Math.abs(variance)}d ${suffix}`
            };
        }
    },
    {
        text: 'End Var.',
        width: 100,
        align: 'center',
        renderer({ record }) {
            const variance = record.endVariance;
            if (variance == null) return '-';

            if (variance === 0) {
                return { class: 'on-time', text: 'On time' };
            }

            const cls = variance > 0 ? 'delayed' : 'early';
            const suffix = variance > 0 ? 'late' : 'early';

            return {
                class: cls,
                text: `${Math.abs(variance)}d ${suffix}`
            };
        }
    }
]
```

---

## 6. Schedule Performance Index (SPI)

### 6.1 SPI Calculation

```javascript
// SPI = Earned Value / Planned Value
// EV = % Complete × Budget
// PV = Planned % Complete × Budget

class SPITaskModel extends TaskModel {

    get earnedValue() {
        // Werkelijke voortgang × totale inspanning
        return (this.percentDone / 100) * this.duration;
    }

    get plannedValue() {
        // Geplande voortgang voor vandaag × totale inspanning
        const plannedPercent = this.plannedPercentDone;
        if (plannedPercent == null) return null;

        return (plannedPercent / 100) * this.baselines[0].duration;
    }

    get schedulePerformanceIndex() {
        const pv = this.plannedValue;
        if (!pv || pv === 0) return null;

        return this.earnedValue / pv;
    }

    get spiStatus() {
        const spi = this.schedulePerformanceIndex;
        if (spi == null) return 'unknown';
        if (spi >= 1) return 'on-track';
        if (spi >= 0.9) return 'at-risk';
        return 'behind';
    }
}
```

### 6.2 SPI Column

```javascript
{
    text: 'SPI',
    width: 80,
    align: 'center',
    renderer({ record }) {
        const spi = record.schedulePerformanceIndex;
        if (spi == null) return '-';

        const cls = record.spiStatus;

        return {
            class: `spi-badge ${cls}`,
            text: spi.toFixed(2)
        };
    }
}
```

---

## 7. Progress Line

### 7.1 Feature Configuratie

```javascript
features: {
    progressLine: {
        // Toon progress line voor vandaag
        statusDate: new Date(),

        // Of specifieke datum
        // statusDate: new Date('2024-02-15')
    }
}
```

### 7.2 Dynamic Status Date

```javascript
tbar: [
    {
        type: 'datefield',
        label: 'Status Date',
        value: new Date(),
        onChange({ value }) {
            gantt.features.progressLine.statusDate = value;
        }
    }
]

// Progress line visualiseert:
// - Verticale lijn op status date
// - Hoeken naar links voor taken die achter lopen
// - Hoeken naar rechts voor taken die voorlopen
```

### 7.3 Progress Line Styling

```css
/* Progress line */
.b-gantt-progress-line {
    stroke: #2196f3;
    stroke-width: 2;
}

/* Behind schedule segment */
.b-gantt-progress-line.behind {
    stroke: #f44336;
}

/* Ahead of schedule segment */
.b-gantt-progress-line.ahead {
    stroke: #4caf50;
}
```

---

## 8. Comparison Views

### 8.1 Side-by-Side Comparison

```javascript
columns: [
    { type: 'name', width: 200 },

    // Planned columns
    {
        text: 'Planned',
        children: [
            {
                text: 'Start',
                width: 100,
                renderer: ({ record }) => formatDate(record.baselines?.[0]?.startDate)
            },
            {
                text: 'End',
                width: 100,
                renderer: ({ record }) => formatDate(record.baselines?.[0]?.endDate)
            },
            {
                text: 'Duration',
                width: 80,
                renderer: ({ record }) => record.baselines?.[0]?.duration || '-'
            }
        ]
    },

    // Actual columns
    {
        text: 'Actual',
        children: [
            { type: 'startdate', text: 'Start', width: 100 },
            { type: 'enddate', text: 'End', width: 100 },
            { type: 'duration', text: 'Duration', width: 80 }
        ]
    },

    // Variance
    {
        text: 'Variance',
        children: [
            {
                text: 'Days',
                width: 80,
                renderer: ({ record }) => formatVariance(record.endVariance)
            }
        ]
    }
]
```

### 8.2 Overlay Mode

```javascript
// Toon baseline en actueel overlappend
features: {
    baselines: {
        // Baseline onder taakbar
        position: 'below',

        // Of overlay
        position: 'overlay'
    }
}
```

---

## 9. Historical Baselines

### 9.1 Multiple Baselines

```javascript
// Data met meerdere baselines
{
    id: 1,
    name: 'Feature X',
    startDate: '2024-03-01',
    endDate: '2024-04-15',
    baselines: [
        {
            startDate: '2024-02-01',
            endDate: '2024-03-15',
            name: 'Original Plan',
            createdDate: '2024-01-15'
        },
        {
            startDate: '2024-02-15',
            endDate: '2024-03-30',
            name: 'Revision 1',
            createdDate: '2024-02-01'
        },
        {
            startDate: '2024-02-20',
            endDate: '2024-04-01',
            name: 'Revision 2',
            createdDate: '2024-02-10'
        }
    ]
}
```

### 9.2 Baseline History View

```javascript
// Toon alle baselines
features: {
    baselines: {
        showAllBaselines: true,

        // Styling per baseline
        getBaselineStyle(baseline, index) {
            const opacity = 0.8 - (index * 0.2);
            return {
                opacity: Math.max(0.2, opacity),
                strokeDasharray: index > 0 ? '4,2' : 'none'
            };
        }
    }
}
```

---

## 10. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useMemo } from 'react';

function PlannedActualGantt({ projectData }) {
    const [statusDate, setStatusDate] = useState(new Date());
    const [selectedBaseline, setSelectedBaseline] = useState(0);

    const columns = useMemo(() => [
        { type: 'name', width: 200 },
        { type: 'percentdone', text: 'Actual', width: 80 },
        {
            text: 'Planned',
            width: 80,
            renderer: ({ record }) => {
                const planned = record.plannedPercentDone;
                return planned != null ? `${Math.round(planned)}%` : '-';
            }
        },
        {
            text: 'SPI',
            width: 70,
            renderer: ({ record }) => {
                const spi = record.schedulePerformanceIndex;
                return spi ? spi.toFixed(2) : '-';
            }
        }
    ], []);

    return (
        <div className="gantt-wrapper">
            <div className="toolbar">
                <label>
                    Status Date:
                    <input
                        type="date"
                        value={statusDate.toISOString().split('T')[0]}
                        onChange={e => setStatusDate(new Date(e.target.value))}
                    />
                </label>

                <label>
                    Baseline:
                    <select
                        value={selectedBaseline}
                        onChange={e => setSelectedBaseline(Number(e.target.value))}
                    >
                        <option value={0}>Original Plan</option>
                        <option value={1}>Revision 1</option>
                        <option value={2}>Revision 2</option>
                    </select>
                </label>
            </div>

            <BryntumGantt
                columns={columns}
                projectConfig={projectData}
                features={{
                    baselines: {
                        baselineIndex: selectedBaseline
                    },
                    progressLine: {
                        statusDate
                    }
                }}
            />
        </div>
    );
}
```

---

## 11. Styling

```css
/* Variance indicators */
.variance.positive {
    color: #4caf50;
}

.variance.negative {
    color: #f44336;
}

/* Status indicators */
.on-time {
    color: #4caf50;
}

.delayed {
    color: #f44336;
}

.early {
    color: #2196f3;
}

/* SPI badges */
.spi-badge {
    padding: 0.25em 0.5em;
    border-radius: 4px;
    font-weight: 500;
}

.spi-badge.on-track {
    background: #e8f5e9;
    color: #2e7d32;
}

.spi-badge.at-risk {
    background: #fff3e0;
    color: #ef6c00;
}

.spi-badge.behind {
    background: #ffebee;
    color: #c62828;
}

/* Baseline bars */
.b-gantt-baseline {
    background: repeating-linear-gradient(
        45deg,
        #666,
        #666 2px,
        transparent 2px,
        transparent 6px
    );
    height: 6px;
}

/* Progress line */
.b-gantt-progress-line-path {
    stroke: #2196f3;
    stroke-width: 2;
    fill: none;
}
```

---

## 12. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Baseline niet zichtbaar | Feature disabled | Enable baselines feature |
| Geen variance data | Geen baseline in data | Voeg baselines array toe |
| SPI altijd null | PlannedValue is 0 | Check baseline duration |
| Progress line incorrect | Verkeerde statusDate | Verify date format |

---

## API Reference

### Baseline Properties

| Property | Type | Description |
|----------|------|-------------|
| `startDate` | Date | Geplande startdatum |
| `endDate` | Date | Geplande einddatum |
| `duration` | Number | Geplande duur |
| `percentDone` | Number | Geplande voortgang |
| `name` | String | Baseline naam |

### Variance Fields

| Field | Type | Description |
|-------|------|-------------|
| `startVariance` | Number | Dagen verschil start |
| `endVariance` | Number | Dagen verschil eind |
| `durationVariance` | Number | Duur verschil |

---

## Bronnen

- **Example**: `examples/planned-percent-done/`
- **Baselines Feature**: `Gantt.feature.Baselines`
- **ProgressLine Feature**: `Gantt.feature.ProgressLine`

---

*Track A: Foundation - Gantt Extensions (A2.5)*
