# Gantt Implementation: Responsive

> **Responsive** voor het aanpassen van de Gantt aan verschillende schermgroottes.

---

## Overzicht

Bryntum Gantt ondersteunt responsieve layouts met breakpoints en automatische configuratie.

```
+--------------------------------------------------------------------------+
| GANTT                    Force: [Small] [Medium] [Large] [None ●]        |
|                                              Responsive level: large     |
+--------------------------------------------------------------------------+
|                                                                          |
|  LARGE (> 800px):        |  MEDIUM (500-800px):   |  SMALL (< 500px):   |
|  tickSize: 25            |  tickSize: 20          |  tickSize: 15       |
|  rowHeight: 50           |  rowHeight: 40         |  rowHeight: 40      |
|  locked: false           |  locked: false         |  locked: true       |
|  startdate: visible      |  startdate: hidden     |  startdate: hidden  |
|                          |                        |                     |
|  ┌─────────┬───────────┐ |  ┌──────────────────┐  |  ┌────────────────┐ |
|  │ Name    │ Start     │ |  │ Name             │  |  │≡│Name          │ |
|  │─────────┼───────────│ |  │──────────────────│  |  │─│──────────────│ |
|  │ Task 1  │ Jan 15    │ |  │ Task 1 ████      │  |  │ │Task 1 ███   │ |
|  │ Task 2  │ Jan 20    │ |  │ Task 2   ████    │  |  │ │Task 2  ███  │ |
|  └─────────┴───────────┘ |  └──────────────────┘  |  └────────────────┘ |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Responsive Setup

### 1.1 Configure Responsive Levels

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    loadUrl: 'data/tasks.json'
});

const gantt = new Gantt({
    appendTo: 'container',
    project,
    dependencyIdField: 'sequenceNumber',
    startDate: new Date(2019, 0, 6),

    columns: [
        {
            type: 'name',
            field: 'name',
            width: 250
        },
        {
            type: 'startdate',
            // Column-specific responsive config
            responsiveLevels: {
                small: { hidden: true },
                medium: { hidden: true },
                large: { hidden: false }
            }
        }
    ],

    features: {
        labels: {
            before: {
                field: 'name'
            }
        }
    },

    // Breakpoints at which configs should change
    responsiveLevels: {
        small: {
            // When below 500px wide, apply "small"
            levelWidth: 500,
            // With these configs
            tickSize: 15,
            rowHeight: 40,
            collapsed: {
                locked: true  // Collapse locked region
            }
        },
        medium: {
            // When below 800px wide, apply "medium"
            levelWidth: 800,
            tickSize: 20,
            rowHeight: 40,
            collapsed: {
                locked: false
            }
        },
        large: {
            // For any larger width, apply "large"
            levelWidth: '*',
            tickSize: 25,
            rowHeight: 50,
            collapsed: {
                locked: false
            }
        }
    },

    listeners: {
        // Called when reaching a responsive breakpoint
        responsive({ source: gantt, level }) {
            console.log('Responsive level changed to:', level);
            gantt.tbar.items[3].html = `Level: <b>${level}</b>`;
        }
    }
});

project.load();
```

---

## 2. Force Responsive Level

### 2.1 Toolbar to Force Level

```javascript
tbar: [
    'Force',
    {
        type: 'buttongroup',
        rendition: 'padded',
        toggleGroup: true,
        items: [
            {
                text: 'Small',
                ganttMaxWidth: 499
            },
            {
                text: 'Medium',
                ganttMaxWidth: 750
            },
            {
                text: 'Large',
                ganttMaxWidth: 900
            },
            {
                text: 'None',
                pressed: true,
                ganttMaxWidth: null,
                tooltip: 'Level is decided by browser window width'
            }
        ],
        onClick({ source: button }) {
            gantt.maxWidth = button.ganttMaxWidth;
            document.body.classList.remove('small', 'medium', 'large');
            document.body.classList.add(button.text.toLowerCase());
        }
    },
    '->',
    'Responsive level:'
]
```

---

## 3. Column Responsive Config

### 3.1 Per-Column Visibility

```javascript
columns: [
    // Always visible
    { type: 'name', width: 200 },

    // Hide on small screens
    {
        type: 'startdate',
        responsiveLevels: {
            small: { hidden: true },
            '*': { hidden: false }
        }
    },

    // Different widths per level
    {
        type: 'duration',
        responsiveLevels: {
            small: { width: 60 },
            medium: { width: 80 },
            large: { width: 100 }
        }
    },

    // Hide on small and medium
    {
        type: 'percentdone',
        responsiveLevels: {
            small: { hidden: true },
            medium: { hidden: true },
            large: { hidden: false }
        }
    }
]
```

---

## 4. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useMemo, useCallback } from 'react';

function ResponsiveGantt({ projectData }) {
    const [currentLevel, setCurrentLevel] = useState('large');
    const [forcedWidth, setForcedWidth] = useState(null);

    const handleResponsive = useCallback(({ level }) => {
        setCurrentLevel(level);
    }, []);

    const ganttConfig = useMemo(() => ({
        maxWidth: forcedWidth,

        columns: [
            { type: 'name', width: 200 },
            {
                type: 'startdate',
                responsiveLevels: {
                    small: { hidden: true },
                    medium: { hidden: true },
                    large: { hidden: false }
                }
            },
            {
                type: 'duration',
                responsiveLevels: {
                    small: { width: 60 },
                    medium: { width: 80 },
                    large: { width: 100 }
                }
            }
        ],

        responsiveLevels: {
            small: {
                levelWidth: 500,
                tickSize: 15,
                rowHeight: 40,
                collapsed: { locked: true }
            },
            medium: {
                levelWidth: 800,
                tickSize: 20,
                rowHeight: 40,
                collapsed: { locked: false }
            },
            large: {
                levelWidth: '*',
                tickSize: 25,
                rowHeight: 50,
                collapsed: { locked: false }
            }
        },

        listeners: {
            responsive: handleResponsive
        }
    }), [forcedWidth, handleResponsive]);

    const forceLevel = useCallback((level) => {
        const widths = {
            small: 499,
            medium: 750,
            large: 900,
            none: null
        };
        setForcedWidth(widths[level]);
    }, []);

    return (
        <div className="responsive-gantt">
            <div className="toolbar">
                <span>Force:</span>
                <div className="button-group">
                    {['small', 'medium', 'large', 'none'].map(level => (
                        <button
                            key={level}
                            onClick={() => forceLevel(level)}
                            className={forcedWidth === (level === 'none' ? null : { small: 499, medium: 750, large: 900 }[level]) ? 'active' : ''}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>
                <span className="level-indicator">
                    Level: <strong>{currentLevel}</strong>
                </span>
            </div>

            <BryntumGantt
                project={projectData}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 5. Styling

```css
/* Responsive container */
.responsive-gantt {
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* Toolbar */
.toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

/* Button group */
.button-group {
    display: flex;
    gap: 4px;
}

.button-group button {
    padding: 6px 12px;
    border: 1px solid #e0e0e0;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.button-group button:first-child {
    border-radius: 4px 0 0 4px;
}

.button-group button:last-child {
    border-radius: 0 4px 4px 0;
}

.button-group button.active {
    background: #1976d2;
    color: white;
    border-color: #1976d2;
}

/* Level indicator */
.level-indicator {
    margin-left: auto;
    padding: 4px 12px;
    background: #e3f2fd;
    border-radius: 4px;
}

.level-indicator strong {
    color: #1976d2;
    margin-left: 4px;
}

/* Small screen adjustments */
@media (max-width: 500px) {
    .toolbar {
        flex-wrap: wrap;
        gap: 8px;
    }

    .level-indicator {
        margin-left: 0;
        width: 100%;
        text-align: center;
    }
}

/* Collapsed locked region indicator */
.b-gantt .b-grid-subgrid-locked.b-collapsed {
    width: 40px !important;
    min-width: 40px !important;
}

.b-gantt .b-grid-subgrid-locked.b-collapsed::before {
    content: '≡';
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 24px;
    color: #666;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Level verandert niet | levelWidth niet correct | Check breakpoint values |
| Column niet verborgen | responsiveLevels mist | Voeg toe aan column config |
| Event niet getriggerd | Listener niet toegevoegd | Voeg responsive listener toe |
| maxWidth werkt niet | Waarde niet correct | Check numerieke waarde |

---

## API Reference

### ResponsiveLevels Config

| Property | Type | Description |
|----------|------|-------------|
| `levelWidth` | Number/String | Width threshold ('*' for default) |
| `tickSize` | Number | Tick size at this level |
| `rowHeight` | Number | Row height at this level |
| `collapsed` | Object | Subgrid collapse config |

### Column ResponsiveLevels

| Property | Type | Description |
|----------|------|-------------|
| `hidden` | Boolean | Hide at this level |
| `width` | Number | Width at this level |

### Events

| Event | Description |
|-------|-------------|
| `responsive` | Fired when level changes |

### Event Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `source` | Gantt | Gantt instance |
| `level` | String | New responsive level |

---

## Bronnen

- **Example**: `examples/responsive/`
- **Responsive Mixin**: `Core.mixin.Responsive`

---

*Priority 2: Medium Priority Features*
