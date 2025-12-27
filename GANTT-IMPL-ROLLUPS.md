# Gantt Implementation: Rollups

> **Rollups** voor het tonen van kindertaken op de parent-taakregel.

---

## Overzicht

Bryntum Gantt's Rollups feature toont child tasks als mini-bars op de parent row.

```
+--------------------------------------------------------------------------+
| GANTT                                   [x] Show Rollups                  |
+--------------------------------------------------------------------------+
|                                                                          |
|  WBS  |  Name              | Rollup |        Timeline                    |
+--------------------------------------------------------------------------+
|  1    |  Project           | ●●●    |  ════════════════════════          |
|       |                    |        |  ▪ ▪ ▪ (rollup mini-bars)          |
+--------------------------------------------------------------------------+
|  1.1  |    Planning        |        |  ████                              |
|  1.2  |    Design          |        |       ████                         |
|  1.3  |    Development     |        |            ████████                |
+--------------------------------------------------------------------------+
|  2    |  Testing           | ●●     |               ════════════         |
|       |                    |        |               ▪ ▪                   |
+--------------------------------------------------------------------------+
|  2.1  |    Unit Tests      |        |               ████                 |
|  2.2  |    Integration     |        |                    ████            |
+--------------------------------------------------------------------------+
|                                                                          |
|  ROLLUP DISPLAY:                                                         |
|    ════ = Parent task bar                                                |
|    ▪ = Rollup (child task represented on parent row)                     |
|    ● = Rollup column indicator                                           |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Rollups Setup

### 1.1 Enable Rollups Feature

```javascript
import { Gantt } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',

    project: {
        autoSetConstraints: true,
        loadUrl: 'data/tasks.json',
        autoLoad: true
    },

    dependencyIdField: 'wbsCode',
    showTaskColorPickers: true,

    columns: [
        { type: 'wbs' },
        { type: 'name' },
        { type: 'rollup' }  // Add rollup column
    ],

    viewPreset: 'monthAndYear',

    // Allow extra space for rollups
    rowHeight: 50,
    barMargin: 11,

    columnLines: true,

    features: {
        rollups: true
    }
});
```

---

## 2. Toolbar Toggle

### 2.1 Toggle Rollups Display

```javascript
tbar: [
    {
        type: 'slidetoggle',
        label: 'Show Rollups',
        checked: true,
        onAction({ checked }) {
            gantt.features.rollups.disabled = !checked;
        }
    }
]
```

---

## 3. Feature Configuration

### 3.1 Rollups Options

```javascript
features: {
    rollups: {
        // Enable rollups
        disabled: false
    }
}
```

### 3.2 Column Configuration

```javascript
columns: [
    { type: 'wbs' },
    { type: 'name', width: 250 },
    {
        type: 'rollup',
        text: 'Rollups',
        width: 80,
        // Custom rollup indicator
        renderer({ record }) {
            const childCount = record.children?.length || 0;
            return childCount > 0 ? '●'.repeat(Math.min(childCount, 5)) : '';
        }
    }
]
```

---

## 4. Row Configuration

### 4.1 Adjust Row Height for Rollups

```javascript
const gantt = new Gantt({
    // Extra height for rollup bars
    rowHeight: 50,

    // Margin around task bars
    barMargin: 11,

    // Or use responsive row height
    getRowHeight(record) {
        // Parent tasks get more height for rollups
        if (record.children?.length > 0) {
            return 60;
        }
        return 40;
    }
});
```

---

## 5. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useRef, useCallback } from 'react';

function GanttWithRollups({ projectData }) {
    const ganttRef = useRef(null);
    const [showRollups, setShowRollups] = useState(true);

    const toggleRollups = useCallback((checked) => {
        setShowRollups(checked);
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.features.rollups.disabled = !checked;
        }
    }, []);

    const ganttConfig = {
        rowHeight: 50,
        barMargin: 11,
        columnLines: true,

        columns: [
            { type: 'wbs', width: 80 },
            { type: 'name', width: 250 },
            { type: 'rollup', width: 80 }
        ],

        features: {
            rollups: {
                disabled: !showRollups
            }
        },

        viewPreset: 'monthAndYear'
    };

    return (
        <div className="gantt-rollups-wrapper">
            <div className="toolbar">
                <label>
                    <input
                        type="checkbox"
                        checked={showRollups}
                        onChange={(e) => toggleRollups(e.target.checked)}
                    />
                    Show Rollups
                </label>
            </div>

            <BryntumGantt
                ref={ganttRef}
                project={projectData}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 6. Styling

```css
/* Rollup bar styling */
.b-rollup {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
    height: 8px;
}

/* Rollup bar color inheritance */
.b-rollup.b-gantt-task-bar {
    background: inherit;
    opacity: 0.6;
}

/* Parent task with rollups */
.b-gantt-task.b-has-rollups .b-gantt-task-bar {
    background: transparent;
    border: 2px solid currentColor;
}

/* Rollup column indicator */
.b-rollup-column {
    font-family: 'Courier New', monospace;
    letter-spacing: 2px;
}

/* Extra row height for rollups */
.b-grid-row.b-has-rollups {
    min-height: 50px;
}

/* Rollup container */
.b-rollup-container {
    position: absolute;
    bottom: 4px;
    left: 0;
    right: 0;
    display: flex;
    gap: 2px;
}

/* Individual rollup items */
.b-rollup-item {
    flex-shrink: 0;
    border-radius: 2px;
}

/* Rollup hover */
.b-rollup:hover {
    opacity: 1;
    transform: scaleY(1.2);
}

/* Rollup tooltip */
.b-rollup-tooltip {
    background: #333;
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Rollups niet zichtbaar | Feature disabled | Zet rollups: true |
| Rollups overlappen | rowHeight te klein | Verhoog rowHeight |
| Column indicator mist | rollup column niet toegevoegd | Voeg { type: 'rollup' } toe |
| Kleuren niet correct | Color inheritance mist | Check CSS inheritance |

---

## API Reference

### Rollups Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `disabled` | Boolean | Enable/disable feature |

### Rollup Column Config

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | 'rollup' |
| `text` | String | Column header |
| `width` | Number | Column width |
| `renderer` | Function | Custom renderer |

### Gantt Config for Rollups

| Property | Type | Description |
|----------|------|-------------|
| `rowHeight` | Number | Row height |
| `barMargin` | Number | Bar margin |

---

## Bronnen

- **Example**: `examples/rollups/`
- **Rollups Feature**: `Gantt.feature.Rollups`
- **RollupColumn**: `Gantt.column.RollupColumn`

---

*Priority 2: Medium Priority Features*
