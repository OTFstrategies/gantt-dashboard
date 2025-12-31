# Grid Implementation: Locked/Frozen Columns

> **Frozen columns** met multi-region grids, region resize, en column picker integratie.

---

## Overzicht

Bryntum Grid ondersteunt locked (frozen) columns die op hun plaats blijven terwijl de rest van de grid horizontaal scrollt.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                                                                      │
├─────────────────────┬────────────────────────────────────────────────────┤
│  LOCKED REGION      │  NORMAL REGION (scrollable)                  ◄──►  │
│  ══════════════     │  ════════════════════════════════════════════════  │
│  First │ Surname   ║│  Location │ Follow up │ Purchases │ Value │ ...   │
│  name  │           ║│           │           │           │       │       │
├────────┼───────────╫┼───────────┼───────────┼───────────┼───────┼───────┤
│  John  │ Doe       ║│  Paris    │ 2024-01-15│    125    │  850  │       │
│  Jane  │ Smith     ║│  London   │ 2024-02-20│    230    │ 1200  │       │
│  Bob   │ Wilson    ║│  Berlin   │ 2024-03-10│     75    │  450  │       │
└────────┴───────────╨┴───────────┴───────────┴───────────┴───────┴───────┘
                      ▲
                      │ Resizable divider
```

---

## 1. Basic Locked Columns

### 1.1 Simple Setup

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        regionResize: true  // Allow resizing locked region
    },

    // Configure locked region width
    subGridConfigs: {
        locked: {
            width: 360
        }
    },

    columns: [
        // Locked columns (frozen)
        { text: 'First name', field: 'firstName', width: 180, locked: true },
        { text: 'Surname', field: 'surName', width: 180, locked: true },

        // Normal columns (scrollable)
        { text: 'Location', field: 'city', width: 180 },
        { text: 'Follow up', field: 'start', type: 'date', width: 180 },
        { text: 'Purchases', field: 'age', type: 'number', width: 180 },
        { text: 'Value', field: 'score', type: 'number', width: 180 }
    ],

    data: DataGenerator.generateData(50)
});
```

### 1.2 Column Picker Integration

```javascript
features: {
    regionResize: true,
    columnPicker: {
        // Group columns by region in picker
        groupByRegion: true
    }
}
```

---

## 2. Multiple Regions

### 2.1 Three-Region Grid

```javascript
const grid = new Grid({
    appendTo: 'container',

    // Define three regions
    subGridConfigs: {
        left: {
            width: 200
        },
        normal: {
            flex: 1
        },
        right: {
            width: 200
        }
    },

    columns: [
        // Left region (frozen)
        { text: 'ID', field: 'id', width: 80, region: 'left' },
        { text: 'Name', field: 'name', width: 120, region: 'left' },

        // Normal region (scrollable)
        { text: 'City', field: 'city', width: 150, region: 'normal' },
        { text: 'Age', field: 'age', width: 100, region: 'normal' },
        { text: 'Score', field: 'score', width: 100, region: 'normal' },
        { text: 'Rating', field: 'rating', width: 100, region: 'normal' },

        // Right region (frozen)
        { text: 'Actions', field: 'actions', width: 100, region: 'right' },
        { text: 'Status', field: 'status', width: 100, region: 'right' }
    ]
});
```

---

## 3. Dynamic Locking

### 3.1 Toggle Locked State

```javascript
// Lock/unlock column programmatically
const column = grid.columns.get('firstName');
column.locked = true;  // Lock column
column.locked = false; // Unlock column

// Or move to specific region
column.region = 'locked';  // Move to locked region
column.region = 'normal';  // Move to normal region
```

### 3.2 Lock via Context Menu

```javascript
features: {
    headerMenu: {
        items: {
            lockColumn: {
                text: 'Lock Column',
                icon: 'fa fa-lock',
                weight: 100,
                onItem({ column }) {
                    column.locked = true;
                }
            },
            unlockColumn: {
                text: 'Unlock Column',
                icon: 'fa fa-unlock',
                weight: 101,
                onItem({ column }) {
                    column.locked = false;
                }
            }
        },
        processItems({ items, column }) {
            // Show appropriate option based on current state
            items.lockColumn = !column.locked;
            items.unlockColumn = column.locked;
        }
    }
}
```

---

## 4. Region Configuration

### 4.1 Width Options

```javascript
subGridConfigs: {
    locked: {
        // Fixed width
        width: 360,

        // Or flex-based
        flex: 1,

        // Min/max constraints
        minWidth: 200,
        maxWidth: 500
    },
    normal: {
        flex: 2
    }
}
```

### 4.2 Region Resize Feature

```javascript
features: {
    regionResize: {
        // Enable resize handle
        enabled: true,

        // Show resize handle on hover
        showHandle: true
    }
}
```

---

## 5. Custom Renderers with Locked Columns

```javascript
columns: [
    { text: 'First name', field: 'firstName', width: 180, locked: true },
    { text: 'Surname', field: 'surName', width: 180, locked: true },

    // Value column with conditional styling
    {
        type: 'number',
        text: 'Value',
        field: 'score',
        width: 180,
        renderer: ({ value, cellElement, record }) => {
            const rank = record.rank;

            if (rank < 30) cellElement.classList.add('decrease');
            else if (rank > 70) cellElement.classList.add('increase');
            else cellElement.classList.add('stable');

            return value;
        }
    },

    // Percent column with warning
    {
        type: 'percent',
        text: 'Satisfaction',
        field: 'percent',
        width: 180,
        renderer: ({ value, cellElement }) => {
            if (value < 20) cellElement.classList.add('warning');
            return value;
        }
    },

    // Custom ID renderer
    {
        text: 'Sales#',
        field: 'id',
        width: 180,
        type: 'number',
        editor: false,
        renderer({ record, value }) {
            if (record.hasGeneratedId) {
                return '★';
            }
            return value;
        }
    }
]
```

---

## 6. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useState } from 'react';

function LockedColumnsGrid({ data }) {
    const [lockedWidth, setLockedWidth] = useState(360);

    const gridConfig = {
        features: {
            regionResize: true,
            columnPicker: {
                groupByRegion: true
            }
        },

        subGridConfigs: {
            locked: {
                width: lockedWidth
            }
        },

        columns: [
            { text: 'First name', field: 'firstName', width: 180, locked: true },
            { text: 'Surname', field: 'surName', width: 180, locked: true },
            { text: 'City', field: 'city', width: 180 },
            { text: 'Age', field: 'age', type: 'number', width: 120 },
            { text: 'Score', field: 'score', type: 'number', width: 120 },
            { text: 'Start', field: 'start', type: 'date', width: 150 }
        ],

        listeners: {
            subGridCollapse({ subGrid }) {
                console.log('Region collapsed:', subGrid.region);
            },
            subGridExpand({ subGrid }) {
                console.log('Region expanded:', subGrid.region);
            }
        }
    };

    return (
        <div className="locked-grid-wrapper">
            <div className="toolbar">
                <label>
                    Locked width:
                    <input
                        type="range"
                        min="200"
                        max="600"
                        value={lockedWidth}
                        onChange={(e) => setLockedWidth(Number(e.target.value))}
                    />
                    {lockedWidth}px
                </label>
            </div>

            <BryntumGrid
                data={data}
                {...gridConfig}
            />
        </div>
    );
}
```

---

## 7. Styling

```css
/* Locked region styling */
.b-grid-subgrid-locked {
    background: #fafafa;
}

.b-grid-subgrid-locked .b-grid-header {
    background: #f0f0f0;
}

/* Region divider */
.b-grid-splitter {
    width: 4px;
    background: #ddd;
    cursor: col-resize;
}

.b-grid-splitter:hover {
    background: #2196F3;
}

/* Value indicators */
.increase {
    color: #4CAF50;
}

.increase::before {
    content: '▲ ';
}

.decrease {
    color: #f44336;
}

.decrease::before {
    content: '▼ ';
}

.stable {
    color: #9e9e9e;
}

/* Warning styling */
.warning {
    background: #ffebee;
    color: #c62828;
}

/* Locked column header indicator */
.b-grid-header[data-column-locked="true"]::after {
    content: '🔒';
    margin-left: 4px;
    font-size: 10px;
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Column niet locked | locked: true ontbreekt | Voeg locked: true toe aan column config |
| Resize werkt niet | regionResize disabled | Enable regionResize feature |
| Columns overlappen | Width te klein | Verhoog subGridConfigs.locked.width |
| Scroll sync issues | Browser bug | Update browser of gebruik polyfill |
| Column picker toont niet | Feature disabled | Enable columnPicker feature |

---

## API Reference

### Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `locked` | Boolean | Lock column to left region |
| `region` | String | Target region name |

### SubGrid Config

| Property | Type | Description |
|----------|------|-------------|
| `width` | Number | Fixed width in pixels |
| `flex` | Number | Flex-based sizing |
| `minWidth` | Number | Minimum width |
| `maxWidth` | Number | Maximum width |

### RegionResize Feature

| Property | Type | Description |
|----------|------|-------------|
| `enabled` | Boolean | Enable resize |
| `showHandle` | Boolean | Show resize handle |

---

## Bronnen

- **Example**: `examples/lockedcolumns/`
- **RegionResize Feature**: `Grid.feature.RegionResize`
- **ColumnPicker Feature**: `Grid.feature.ColumnPicker`
- **SubGrid**: `Grid.view.SubGrid`

---

*Priority 1: Missing Core Functionality*
