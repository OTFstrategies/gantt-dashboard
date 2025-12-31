# Grid Implementation: Row Expander

> **Row Expander** voor detail views, async content loading, en custom templates.

---

## Overzicht

Bryntum Grid's RowExpander feature toont extra content wanneer een rij wordt uitgeklapt.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│  Pos │ Class │ Name        │ Age │ Distance │ Time     │ [+]             │
├──────┼───────┼─────────────┼─────┼──────────┼──────────┼─────────────────┤
│  1   │ 🥇 A  │ John Doe    │ 32  │ 5km      │ 00:18:45 │ [−]             │
├──────┴───────┴─────────────┴─────┴──────────┴──────────┴─────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ John Doe                                           [VIEW] [SHARE]   │ │
│  │ Position in class A: 1                                              │ │
│  │ Total time: 00:18:45                                                │ │
│  │ Pace: 3:45 min/km                                                   │ │
│  │ ──────────────────────────────────────────────────────────────────  │ │
│  │ Lap │ Distance │ Pace       │ Split    │ Time     │ Behind         │ │
│  │ 1   │ 1km      │ ████ 3:42  │ 00:03:42 │ 00:03:42 │ +00:00         │ │
│  │ 2   │ 2km      │ ███  3:48  │ 00:03:48 │ 00:07:30 │ +00:06         │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
├──────┬───────┬─────────────┬─────┬──────────┬──────────┬─────────────────┤
│  2   │ 🥈 A  │ Jane Smith  │ 28  │ 5km      │ 00:19:12 │ [+]             │
│  3   │ 🥉 A  │ Bob Wilson  │ 35  │ 5km      │ 00:19:45 │ [+]             │
└──────┴───────┴─────────────┴─────┴──────────┴──────────┴─────────────────┘
```

---

## 1. Basic Row Expander

### 1.1 Simple Configuration

```javascript
import { Grid, StringHelper, MessageDialog, EventHelper } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        cellEdit: false,
        rowExpander: {
            // Position of expander button
            columnPosition: 'last',  // 'first' or 'last'

            // Expander column configuration
            column: {
                width: 80
            },

            // Renderer called when row is expanded
            async renderer({ record, expanderElement, rowElement, region }) {
                return {
                    className: 'expander-content',
                    children: [
                        {
                            className: 'text-info',
                            children: [
                                {
                                    text: record.name,
                                    style: {
                                        fontWeight: 'bold',
                                        gridColumn: 'span 2'
                                    }
                                },
                                { text: 'Position in class ' + record.class + ':' },
                                { text: record.posInClass },
                                { text: 'Total time:' },
                                { text: record.time },
                                { text: 'Pace:' },
                                { text: calculatePace(record) }
                            ]
                        },
                        {
                            className: 'buttons',
                            children: [
                                { text: 'VIEW MAP', 'data-btip': 'View track on map' },
                                { text: 'SHARE', 'data-btip': 'Share results' },
                                { text: 'HISTORY', 'data-btip': 'View history' }
                            ]
                        }
                    ]
                };
            }
        }
    },

    columns: [
        { text: 'Pos', field: 'pos', flex: 1, align: 'center' },
        { text: 'Name', field: 'name', flex: 3 },
        { text: 'Class', field: 'class', flex: 2 },
        { text: 'Age', field: 'age', flex: 1, align: 'center' },
        { text: 'Time', field: 'time', flex: 2 }
    ],

    store: {
        readUrl: 'data/results.json',
        autoLoad: true,
        listeners: {
            load() {
                // Expand first row on load
                grid.features.rowExpander.expand(grid.store.first);
            }
        }
    }
});

function calculatePace(record) {
    const minutes = Math.floor((record.timeInSeconds / 5) / 60);
    const seconds = Math.floor((record.timeInSeconds / 5) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} min/km`;
}
```

---

## 2. Async Content Loading

### 2.1 Load Data on Expand

```javascript
features: {
    rowExpander: {
        async renderer({ record }) {
            // Fetch additional data when expanded
            const details = await fetch(`/api/details/${record.id}`).then(r => r.json());

            return {
                className: 'async-content',
                children: [
                    { tag: 'h3', text: record.name },
                    {
                        className: 'details-grid',
                        children: details.items.map(item => ({
                            className: 'detail-row',
                            children: [
                                { text: item.label },
                                { text: item.value }
                            ]
                        }))
                    }
                ]
            };
        }
    }
}
```

### 2.2 Loading with Table Generation

```javascript
let cachedData = null;

async function generateDetailTable(record) {
    if (!cachedData) {
        cachedData = await (await fetch('data/splits.json')).json();
    }

    const tableContent = {
        className: 'splits-grid',
        children: []
    };

    // Headers
    const headers = ['Lap', 'Distance', 'Pace', 'Split time', 'Time'];
    tableContent.children = headers.map(header => ({
        text: header,
        className: 'header'
    }));

    // Data rows
    for (const split of cachedData.filter(s => s.recordId === record.id)) {
        tableContent.children.push(
            { text: split.lap, className: 'centered' },
            { text: split.distance },
            { text: split.pace },
            { text: split.splitTime },
            { text: split.totalTime }
        );
    }

    return tableContent;
}

features: {
    rowExpander: {
        async renderer({ record }) {
            return {
                className: 'expander-content',
                children: [
                    { tag: 'h3', text: record.name },
                    await generateDetailTable(record)
                ]
            };
        }
    }
}
```

---

## 3. Custom Renderers

### 3.1 Position Badge Renderer

```javascript
const posRenderer = function({ value, record, cellElement }) {
    const medals = { 1: 'gold', 2: 'silver', 3: 'bronze' };

    if (record.isSpecialRow) {
        return value;
    }

    if (value < 4) {
        cellElement.classList.add(medals[value]);
    }

    return StringHelper.xss`<div class="badge">${value}</div>`;
};

columns: [
    {
        text: 'Class pos',
        field: 'posInClass',
        flex: 1,
        align: 'center',
        renderer: posRenderer,
        htmlEncode: false
    }
]
```

### 3.2 Class Color Renderer

```javascript
const classRenderer = function({ value, cellElement }) {
    if (value) {
        cellElement.classList.add(value.toLowerCase());
    }
    return value;
};

columns: [
    {
        text: 'Class',
        field: 'class',
        flex: 2,
        renderer: classRenderer
    }
]
```

---

## 4. Button Actions in Expander

### 4.1 Handle Button Clicks

```javascript
// Set up click listener for buttons inside expander
EventHelper.on({
    element: grid.element,
    delegate: '.buttons > div',
    click({ target }) {
        // Get the record from the clicked element
        const contextRecord = grid.getRecordFromElement(target);

        MessageDialog.alert({
            title: StringHelper.xss`Action for ${contextRecord.name}`,
            message: 'This functionality is not yet implemented.'
        });
    }
});
```

### 4.2 Multiple Button Actions

```javascript
EventHelper.on({
    element: grid.element,
    delegate: '.expander-content .action-btn',
    click({ target }) {
        const record = grid.getRecordFromElement(target);
        const action = target.dataset.action;

        switch (action) {
            case 'view':
                showMapModal(record);
                break;
            case 'share':
                shareResults(record);
                break;
            case 'history':
                showHistory(record);
                break;
        }
    }
});

// Renderer with action buttons
features: {
    rowExpander: {
        renderer({ record }) {
            return {
                className: 'expander-content',
                children: [
                    {
                        className: 'buttons',
                        children: [
                            {
                                tag: 'button',
                                text: 'View',
                                className: 'action-btn',
                                dataset: { action: 'view' }
                            },
                            {
                                tag: 'button',
                                text: 'Share',
                                className: 'action-btn',
                                dataset: { action: 'share' }
                            },
                            {
                                tag: 'button',
                                text: 'History',
                                className: 'action-btn',
                                dataset: { action: 'history' }
                            }
                        ]
                    }
                ]
            };
        }
    }
}
```

---

## 5. Programmatic Control

### 5.1 Expand/Collapse Methods

```javascript
// Expand a specific record
grid.features.rowExpander.expand(record);

// Collapse a specific record
grid.features.rowExpander.collapse(record);

// Toggle expand state
grid.features.rowExpander.toggleExpand(record);

// Expand first row
grid.features.rowExpander.expand(grid.store.first);

// Check if expanded
const isExpanded = grid.features.rowExpander.isExpanded(record);
```

---

## 6. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useRef, useCallback, useEffect } from 'react';

function GridWithExpander({ data }) {
    const gridRef = useRef(null);

    const handleViewDetails = useCallback((record) => {
        console.log('View details for:', record.name);
    }, []);

    const gridConfig = {
        features: {
            cellEdit: false,
            rowExpander: {
                columnPosition: 'last',
                column: { width: 60 },

                renderer: ({ record }) => ({
                    className: 'expander-content',
                    children: [
                        {
                            className: 'detail-header',
                            children: [
                                {
                                    tag: 'h3',
                                    text: record.name
                                }
                            ]
                        },
                        {
                            className: 'detail-body',
                            children: [
                                {
                                    className: 'info-row',
                                    children: [
                                        { tag: 'label', text: 'Email:' },
                                        { tag: 'span', text: record.email }
                                    ]
                                },
                                {
                                    className: 'info-row',
                                    children: [
                                        { tag: 'label', text: 'Phone:' },
                                        { tag: 'span', text: record.phone }
                                    ]
                                },
                                {
                                    className: 'info-row',
                                    children: [
                                        { tag: 'label', text: 'Address:' },
                                        { tag: 'span', text: record.address }
                                    ]
                                }
                            ]
                        },
                        {
                            className: 'detail-actions',
                            children: [
                                {
                                    tag: 'button',
                                    text: 'Edit',
                                    className: 'btn btn-primary',
                                    dataset: { action: 'edit' }
                                },
                                {
                                    tag: 'button',
                                    text: 'Delete',
                                    className: 'btn btn-danger',
                                    dataset: { action: 'delete' }
                                }
                            ]
                        }
                    ]
                })
            }
        },

        columns: [
            { text: 'Name', field: 'name', flex: 2 },
            { text: 'Department', field: 'department', flex: 1 },
            { text: 'Role', field: 'role', flex: 1 }
        ]
    };

    useEffect(() => {
        const grid = gridRef.current?.instance;
        if (!grid) return;

        // Set up button click handlers
        const handler = ({ target }) => {
            const record = grid.getRecordFromElement(target);
            const action = target.dataset.action;

            if (action === 'edit') {
                console.log('Edit:', record);
            } else if (action === 'delete') {
                if (confirm('Delete this record?')) {
                    record.remove();
                }
            }
        };

        grid.element.addEventListener('click', handler);
        return () => grid.element.removeEventListener('click', handler);
    }, []);

    return (
        <BryntumGrid
            ref={gridRef}
            data={data}
            {...gridConfig}
        />
    );
}
```

---

## 7. Styling

```css
/* Expander content container */
.expander-content {
    padding: 16px;
    background: #fafafa;
    border-top: 1px solid #e0e0e0;
}

/* Text info grid layout */
.expander-content .text-info {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 16px;
    margin-bottom: 16px;
}

/* Buttons container */
.expander-content .buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.expander-content .buttons > div,
.expander-content .action-btn {
    padding: 8px 16px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
}

.expander-content .buttons > div:hover,
.expander-content .action-btn:hover {
    background: #1976D2;
}

/* Splits table */
.splits-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: #e0e0e0;
    border: 1px solid #e0e0e0;
}

.splits-grid > * {
    background: white;
    padding: 8px 12px;
}

.splits-grid .header {
    background: #f5f5f5;
    font-weight: bold;
}

.splits-grid .centered {
    text-align: center;
}

/* Pace bar visualization */
.pace {
    display: flex;
    flex-direction: column;
}

.pace-text {
    font-size: 12px;
    margin-bottom: 4px;
}

.pace-bar {
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
}

.pace-bar-inner {
    height: 100%;
    background: #4CAF50;
    border-radius: 3px;
}

/* Medal colors */
.gold { background: linear-gradient(135deg, #FFD700, #FFA500); color: #333; }
.silver { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); color: #333; }
.bronze { background: linear-gradient(135deg, #CD7F32, #8B4513); color: white; }

/* Position badge */
.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #2196F3;
    color: white;
    font-weight: bold;
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Expander niet zichtbaar | Feature disabled | Enable rowExpander feature |
| Content niet geladen | Async renderer error | Check renderer return value |
| Buttons werken niet | Event listener mist | Gebruik EventHelper.on() |
| Styling niet toegepast | CSS niet geladen | Import CSS bestand |
| Memory leak | Event listeners niet opgeruimd | Cleanup in useEffect |

---

## API Reference

### RowExpander Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `columnPosition` | String | 'first' or 'last' |
| `column` | Object | Column configuration |
| `renderer` | Function | Async content renderer |

### RowExpander Methods

| Method | Description |
|--------|-------------|
| `expand(record)` | Expand a record |
| `collapse(record)` | Collapse a record |
| `toggleExpand(record)` | Toggle expand state |
| `isExpanded(record)` | Check if expanded |

### Renderer Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `record` | Model | The record being expanded |
| `expanderElement` | Element | The expander container |
| `rowElement` | Element | The row element |
| `region` | String | The grid region |

---

## Bronnen

- **Example**: `examples/rowexpander/`
- **RowExpander Feature**: `Grid.feature.RowExpander`
- **EventHelper**: `Core.helper.EventHelper`
- **StringHelper**: `Core.helper.StringHelper`

---

*Priority 2: Medium Priority Features*
