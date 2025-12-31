# Grid Implementation: Responsive Design

> **Responsive design** voor het aanpassen van de grid layout aan verschillende schermgroottes.

---

## Overzicht

Bryntum Grid's responsive feature past kolommen en layout aan op basis van viewport-grootte.

```
+--------------------------------------------------------------------------+
| GRID              Force: [Small] [Medium] [Large] [None]                 |
|                                              Responsive level: Large     |
+--------------------------------------------------------------------------+

LARGE (> 800px):
+--------------------------------------------------------------------------+
| City      | First name  | Surname     | Team   | Food    | Rank         |
+--------------------------------------------------------------------------+
| Paris     | John        | Doe         | Alpha  | Pizza   |  1           |
| London    | Jane        | Smith       | Beta   | Sushi   |  2           |
+--------------------------------------------------------------------------+

MEDIUM (450-800px):
+------------------------------------------------------+
| City    | Name           | Team   | Food    | Rank  |
+------------------------------------------------------+
| Paris   | John Doe       | Alpha  | Pizza   |  1    |
+------------------------------------------------------+

SMALL (< 450px):
+--------------------------------------+
| City  | Name        | Team | Rank   |
+--------------------------------------+
| Paris | John Doe    | Alpha|  1     |
+--------------------------------------+

RESPONSIVE LEVELS:
  small: < 450px    medium: 450-800px    large: > 800px
```

---

## 1. Basic Responsive Setup

### 1.1 Define Responsive Levels

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

const showMedium = {
    large: { hidden: true },
    '*': { hidden: false }
};

const hideMedium = {
    large: { hidden: false },
    '*': { hidden: true }
};

const grid = new Grid({
    appendTo: 'container',

    // Define breakpoints
    responsiveLevels: {
        small: 450,
        medium: 800,
        large: '*'  // Everything above 800px
    },

    columns: [
        {
            text: 'City',
            field: 'city',
            locked: true,
            responsiveLevels: {
                '*': { width: 120 },
                medium: { width: 100 },
                small: { width: 80 }
            }
        },
        {
            text: 'Name',
            field: 'name',
            flex: 1,
            responsiveLevels: showMedium
        },
        {
            text: 'First name',
            field: 'firstName',
            width: 120,
            responsiveLevels: hideMedium
        },
        {
            text: 'Surname',
            field: 'surName',
            width: 120,
            responsiveLevels: hideMedium
        },
        {
            text: 'Team',
            field: 'team',
            flex: 1
        },
        {
            text: 'Food',
            field: 'food',
            flex: 1
        },
        {
            type: 'number',
            text: 'Rank',
            field: 'rank',
            width: 80,
            align: 'right',
            responsiveLevels: {
                '*': { width: 80 },
                medium: { width: 40 },
                small: { flex: 0.5 }
            }
        }
    ],

    listeners: {
        responsive({ source: grid, level }) {
            console.log(`Responsive level changed to: ${level}`);
        }
    },

    data: DataGenerator.generateData(50)
});
```

---

## 2. Force Responsive Level

### 2.1 Manual Level Control

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
                gridMaxWidth: 449
            },
            {
                text: 'Medium',
                gridMaxWidth: 799
            },
            {
                text: 'Large',
                gridMaxWidth: 900
            },
            {
                text: 'None',
                gridMaxWidth: null,
                pressed: true,
                tooltip: 'Level is decided by browser window width'
            }
        ],
        onToggle({ source: button }) {
            if (button.pressed) {
                grid.maxWidth = button.gridMaxWidth;
            }
        }
    },
    '->',
    'Responsive level:'
],

listeners: {
    responsive({ source: grid, level }) {
        // Update toolbar label
        grid.tbar.items[3].html = `Responsive level: <b style="margin-inline-start: .5em">${level}</b>`;
    }
}
```

---

## 3. Column Responsive Configuration

### 3.1 Visibility Control

```javascript
columns: [
    {
        text: 'Details',
        field: 'details',
        // Only visible on large screens
        responsiveLevels: {
            large: { hidden: false },
            '*': { hidden: true }
        }
    },
    {
        text: 'Summary',
        field: 'summary',
        // Only visible on small screens
        responsiveLevels: {
            small: { hidden: false },
            '*': { hidden: true }
        }
    }
]
```

### 3.2 Width Adjustments

```javascript
columns: [
    {
        text: 'Name',
        field: 'name',
        responsiveLevels: {
            large: { width: 200 },
            medium: { width: 150, flex: null },
            small: { flex: 1, width: null }
        }
    },
    {
        text: 'Description',
        field: 'description',
        responsiveLevels: {
            large: { flex: 2 },
            medium: { flex: 1 },
            small: { hidden: true }
        }
    }
]
```

### 3.3 Multiple Properties

```javascript
columns: [
    {
        text: 'Full Header Text',
        field: 'value',
        responsiveLevels: {
            large: {
                text: 'Full Header Text',
                width: 200,
                align: 'left'
            },
            medium: {
                text: 'Header',
                width: 120,
                align: 'center'
            },
            small: {
                text: 'Val',
                width: 60,
                align: 'right'
            }
        }
    }
]
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useState, useRef, useCallback } from 'react';

function ResponsiveGrid({ data }) {
    const gridRef = useRef(null);
    const [level, setLevel] = useState('large');
    const [forcedMaxWidth, setForcedMaxWidth] = useState(null);

    const handleResponsive = useCallback(({ level }) => {
        setLevel(level);
    }, []);

    const forceLevel = useCallback((maxWidth) => {
        setForcedMaxWidth(maxWidth);
        if (gridRef.current?.instance) {
            gridRef.current.instance.maxWidth = maxWidth;
        }
    }, []);

    const gridConfig = {
        responsiveLevels: {
            small: 450,
            medium: 800,
            large: '*'
        },

        columns: [
            {
                text: 'City',
                field: 'city',
                locked: true,
                responsiveLevels: {
                    '*': { width: 120 },
                    medium: { width: 100 },
                    small: { width: 80 }
                }
            },
            {
                text: 'Name',
                field: 'name',
                flex: 1,
                responsiveLevels: {
                    large: { hidden: true },
                    '*': { hidden: false }
                }
            },
            {
                text: 'First name',
                field: 'firstName',
                width: 120,
                responsiveLevels: {
                    large: { hidden: false },
                    '*': { hidden: true }
                }
            },
            {
                text: 'Surname',
                field: 'surName',
                width: 120,
                responsiveLevels: {
                    large: { hidden: false },
                    '*': { hidden: true }
                }
            },
            { text: 'Team', field: 'team', flex: 1 },
            { text: 'Food', field: 'food', flex: 1 },
            {
                text: 'Rank',
                field: 'rank',
                width: 80,
                responsiveLevels: {
                    '*': { width: 80 },
                    medium: { width: 50 },
                    small: { width: 40 }
                }
            }
        ],

        listeners: {
            responsive: handleResponsive
        }
    };

    return (
        <div className="responsive-grid">
            <div className="toolbar">
                <span>Force level:</span>
                <button
                    className={forcedMaxWidth === 449 ? 'active' : ''}
                    onClick={() => forceLevel(449)}
                >
                    Small
                </button>
                <button
                    className={forcedMaxWidth === 799 ? 'active' : ''}
                    onClick={() => forceLevel(799)}
                >
                    Medium
                </button>
                <button
                    className={forcedMaxWidth === 900 ? 'active' : ''}
                    onClick={() => forceLevel(900)}
                >
                    Large
                </button>
                <button
                    className={forcedMaxWidth === null ? 'active' : ''}
                    onClick={() => forceLevel(null)}
                >
                    Auto
                </button>
                <span className="level-indicator">
                    Level: <strong>{level}</strong>
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

## 5. Styling

```css
/* Grid container */
.responsive-grid {
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* Level indicator */
.level-indicator {
    padding: 4px 12px;
    background: #e3f2fd;
    border-radius: 4px;
    font-size: 14px;
}

.level-indicator strong {
    color: #1976d2;
}

/* Force buttons */
.toolbar button.active {
    background: #1976d2;
    color: white;
}

/* Mobile optimizations */
@media (max-width: 450px) {
    .b-grid .b-grid-cell {
        padding: 4px 8px;
        font-size: 12px;
    }

    .b-grid .b-grid-header {
        font-size: 11px;
    }
}

/* Tablet optimizations */
@media (min-width: 451px) and (max-width: 800px) {
    .b-grid .b-grid-cell {
        padding: 6px 10px;
        font-size: 13px;
    }
}

/* Desktop optimizations */
@media (min-width: 801px) {
    .b-grid .b-grid-cell {
        padding: 8px 12px;
        font-size: 14px;
    }
}

/* Transition for smooth column changes */
.b-grid-header,
.b-grid-cell {
    transition: width 0.3s ease, padding 0.3s ease;
}

/* Hidden columns */
.b-grid-header.b-hidden,
.b-grid-cell.b-hidden {
    display: none;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Responsive werkt niet | Geen responsiveLevels | Definieer responsiveLevels config |
| Kolom verdwijnt niet | hidden niet gezet | Gebruik hidden: true in responsiveLevels |
| Event niet getriggerd | Geen listener | Voeg responsive listener toe |
| Forced level werkt niet | maxWidth fout | Gebruik correcte pixel waarde |
| Flex en width conflict | Beide gezet | Zet width: null bij flex gebruik |

---

## API Reference

### Grid Responsive Config

| Property | Type | Description |
|----------|------|-------------|
| `responsiveLevels` | Object | Breakpoint definitions |
| `maxWidth` | Number | Force max width |

### Column Responsive Config

| Property | Type | Description |
|----------|------|-------------|
| `responsiveLevels` | Object | Per-level column config |

### Responsive Event

| Property | Type | Description |
|----------|------|-------------|
| `source` | Grid | Grid instance |
| `level` | String | Current level name |

### responsiveLevels Properties

| Property | Type | Description |
|----------|------|-------------|
| `hidden` | Boolean | Column visibility |
| `width` | Number | Fixed width |
| `flex` | Number | Flex width |
| `text` | String | Header text |
| `align` | String | Cell alignment |

---

## Bronnen

- **Example**: `examples/responsive/`
- **Grid Config**: `Grid.view.Grid`
- **Column Config**: `Grid.column.Column`

---

*Priority 2: Medium Priority Features*
