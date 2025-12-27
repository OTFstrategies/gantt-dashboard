# Grid Implementation: Sorting

> **Data sorting** met Sort feature, multi-column sort, custom sort functions, en Sort By widget.

---

## Overzicht

Bryntum Grid ondersteunt single en multi-column sorting met custom sort functies.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ Sort by: [Team ↓] [Age ↑] [+ Add field]    [x] Toggle on header click   │
├──────────────────────────────────────────────────────────────────────────┤
│  Name  ▼    │  Team  ↓   │  City      │  Age  ↑  │  Rank (custom)       │
├─────────────┼────────────┼────────────┼──────────┼──────────────────────┤
│  Bob Wilson │  Zeta      │  Berlin    │  25      │  [15]  ok            │
│  Jane Smith │  Zeta      │  Paris     │  32      │  [18]  ok            │
│  John Doe   │  Alpha     │  London    │  28      │  [75]  poor          │
│  Alice Brown│  Alpha     │  New York  │  45      │  [12]  good          │
├─────────────┴────────────┴────────────┴──────────┴──────────────────────┤
│                                                                          │
│  SORT MODES:                                                             │
│  ↑ Ascending    ↓ Descending    ⇅ Custom Function                       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic Sorting

### 1.1 Simple Sort Setup

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',
    columnLines: false,

    // Sort feature can be configured inline
    features: {
        sort: 'name'  // Initial sort by name
    },

    columns: [
        { text: 'Name', field: 'name', flex: 1 },
        { text: 'Team', field: 'team', flex: 1 },
        { text: 'City', field: 'city', flex: 1 },
        { text: 'Age', field: 'age', width: 150, type: 'number', align: 'end' }
    ],

    data: DataGenerator.generateData(50)
});
```

### 1.2 Multi-Column Sort

```javascript
const grid = new Grid({
    appendTo: 'container',

    columns: [
        { text: 'Name', field: 'name', flex: 1 },
        { text: 'Team', field: 'team', flex: 1 },
        { text: 'City', field: 'city', flex: 1 },
        { text: 'Age', field: 'age', width: 150, type: 'number' }
    ],

    store: {
        data: DataGenerator.generateData(50),
        // Multiple sorters
        sorters: [
            { field: 'team', ascending: false },
            { field: 'age', ascending: true }
        ],
        listeners: {
            sort({ sorters }) {
                console.log('Sorting by:', sorters.map(s =>
                    `${s.field} ${s.ascending ? 'asc' : 'desc'}`
                ).join(', '));
            }
        }
    }
});
```

---

## 2. Custom Sort Function

### 2.1 Column-Specific Sort

```javascript
columns: [
    { text: 'Name', field: 'name', flex: 1 },
    { text: 'Team', field: 'team', flex: 1 },
    {
        type: 'number',
        text: 'Rank (custom)',
        field: 'rank',
        width: 155,
        align: 'center',

        // Custom sorting function
        sortable(a, b) {
            const rankA = a.rank;
            const rankB = b.rank;

            // Sort rank in ranges of 10, with descending order within each group
            const groupA = Math.floor(rankA / 10);
            const groupB = Math.floor(rankB / 10);

            if (groupA === groupB) {
                // Within same group, sort descending
                return rankB - rankA;
            }

            // Between groups, sort ascending
            return groupA - groupB;
        },

        // Custom renderer to visualize rank
        renderer({ value }) {
            return {
                class: {
                    rank: true,
                    good: value < 20,
                    ok: value >= 20 && value < 80,
                    poor: value >= 80
                },
                text: value
            };
        }
    }
]
```

### 2.2 Priority-Based Custom Sort

```javascript
{
    text: 'Priority',
    field: 'priority',
    sortable(a, b) {
        const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
}
```

---

## 3. Sort By Widget

### 3.1 Interactive Sort Control

```javascript
import { Model, Grid, Toast, StringHelper, DataGenerator } from '@bryntum/grid';

// Model for sort options
class SortModel extends Model {
    static fields = [
        'field',
        { name: 'ascending', type: 'boolean' }
    ];
}

let ignoreSortChange = false;

const grid = new Grid({
    appendTo: 'container',

    columns: [
        { text: 'Name', field: 'name', flex: 1 },
        { text: 'Team', field: 'team', flex: 1 },
        { text: 'City', field: 'city', flex: 1 },
        { text: 'Age', field: 'age', width: 150, type: 'number' }
    ],

    store: {
        data: DataGenerator.generateData(50),
        sorters: [
            { field: 'team', ascending: false },
            { field: 'age', ascending: true }
        ],
        listeners: {
            sort({ sorters }) {
                Toast.show('Sorting by ' +
                    sorters.map(s =>
                        `${s.field} ${s.ascending ? 'ascending' : 'descending'}`
                    ).join(', '));

                if (!ignoreSortChange) {
                    sortBy.value = sorters;
                }
            }
        }
    },

    tbar: {
        items: {
            sortBy: {
                type: 'combo',
                width: '30em',
                editable: false,
                label: 'Sort by',
                multiSelect: true,
                valueField: 'field',
                hidePickerOnSelect: true,
                listItemTpl: record => StringHelper.capitalize(record.field),

                store: {
                    modelClass: SortModel
                },

                items: [
                    { field: 'name', ascending: true },
                    { field: 'team', ascending: true },
                    { field: 'city', ascending: true },
                    { field: 'age', ascending: true },
                    { field: 'rank', ascending: true }
                ],

                chipView: {
                    // Template for chip display
                    itemTpl: record => StringHelper.capitalize(record.field),

                    // Direction icon
                    iconTpl: record => `<i class="b-direction b-icon ${record.ascending ? 'fa-arrow-up' : 'fa-arrow-down'}" data-noselect></i>`,

                    // Toggle direction on icon click
                    onItem({ source: chipView, record, event }) {
                        if (event.target.classList.contains('b-direction')) {
                            record.ascending = !record.ascending;
                            grid.store.sort(chipView.store.records.map(r => r.data));
                        }
                    }
                },

                onChange({ source: combo, userAction, value, oldValue }) {
                    if (!userAction || value.length !== oldValue?.length) {
                        if (grid.store.sorters.map(s => s.field).join(',') !== combo.records.map(v => v.field).join(',')) {
                            ignoreSortChange = true;
                            grid.store.sort(combo.valueCollection.values.map(v => v.data));
                            ignoreSortChange = false;
                        }
                    }
                }
            },

            toggleSortClick: {
                type: 'slidetoggle',
                label: 'Toggle on header click',
                checked: true,
                onChange({ checked }) {
                    grid.features.sort.toggleOnHeaderClick = checked;
                },
                tooltip: 'When checked, sort toggles by clicking anywhere in header'
            }
        }
    }
});

const sortBy = grid.widgetMap.sortBy;
sortBy.value = grid.store.sorters;
```

---

## 4. Sort Feature Configuration

### 4.1 Toggle Behavior

```javascript
features: {
    sort: {
        // Sort on header click (true) or only on sort icon (false)
        toggleOnHeaderClick: true,

        // Allow multi-sort
        multiSort: true,

        // Sort indicator position
        sortIndicator: 'end'  // or 'start'
    }
}
```

### 4.2 Disable Sort on Column

```javascript
columns: [
    { text: 'Name', field: 'name', sortable: true },
    { text: 'ID', field: 'id', sortable: false }  // Cannot sort by this column
]
```

---

## 5. Programmatic Sorting

### 5.1 Sort API

```javascript
// Sort by single field
grid.store.sort('name');

// Sort by single field with direction
grid.store.sort({ field: 'name', ascending: false });

// Sort by multiple fields
grid.store.sort([
    { field: 'team', ascending: true },
    { field: 'age', ascending: false }
]);

// Clear all sorting
grid.store.clearSorters();

// Get current sorters
const sorters = grid.store.sorters;
console.log('Current sorters:', sorters);

// Check if sorted
if (grid.store.isSorted) {
    console.log('Grid is sorted');
}
```

### 5.2 Add/Remove Sorters

```javascript
// Add sorter (maintains existing sorters)
grid.store.addSorter({ field: 'city', ascending: true });

// Remove specific sorter
grid.store.removeSorter('city');

// Replace all sorters
grid.store.sorters = [{ field: 'name', ascending: true }];
```

---

## 6. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useState, useRef, useCallback } from 'react';

function SortableGrid({ data }) {
    const gridRef = useRef(null);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = useCallback(({ sorters }) => {
        if (sorters.length > 0) {
            setSortField(sorters[0].field);
            setSortDirection(sorters[0].ascending ? 'asc' : 'desc');
        }
    }, []);

    const handleSortChange = useCallback((field, direction) => {
        setSortField(field);
        setSortDirection(direction);

        const grid = gridRef.current?.instance;
        if (grid) {
            grid.store.sort({
                field,
                ascending: direction === 'asc'
            });
        }
    }, []);

    const gridConfig = {
        features: {
            sort: {
                toggleOnHeaderClick: true,
                multiSort: true
            }
        },

        columns: [
            { text: 'Name', field: 'name', flex: 1 },
            { text: 'Team', field: 'team', flex: 1 },
            { text: 'City', field: 'city', flex: 1 },
            {
                text: 'Age',
                field: 'age',
                width: 100,
                type: 'number'
            },
            {
                text: 'Rank',
                field: 'rank',
                width: 120,
                type: 'number',
                sortable(a, b) {
                    // Custom sort: group by tens
                    const groupA = Math.floor(a.rank / 10);
                    const groupB = Math.floor(b.rank / 10);
                    return groupA !== groupB
                        ? groupA - groupB
                        : b.rank - a.rank;
                }
            }
        ],

        store: {
            sorters: [{ field: sortField, ascending: sortDirection === 'asc' }],
            listeners: {
                sort: handleSort
            }
        }
    };

    return (
        <div className="sortable-grid">
            <div className="sort-controls">
                <label>
                    Sort by:
                    <select
                        value={sortField}
                        onChange={(e) => handleSortChange(e.target.value, sortDirection)}
                    >
                        <option value="name">Name</option>
                        <option value="team">Team</option>
                        <option value="city">City</option>
                        <option value="age">Age</option>
                        <option value="rank">Rank</option>
                    </select>
                </label>
                <label>
                    Direction:
                    <select
                        value={sortDirection}
                        onChange={(e) => handleSortChange(sortField, e.target.value)}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </label>
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

## 7. Styling

```css
/* Sort indicator in header */
.b-grid-header-text .b-sort-icon {
    margin-left: 8px;
    color: #2196F3;
}

.b-grid-header-text .b-sort-icon.b-asc::before {
    content: '↑';
}

.b-grid-header-text .b-sort-icon.b-desc::before {
    content: '↓';
}

/* Multi-sort badge */
.b-grid-header-text .b-sort-index {
    background: #2196F3;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    margin-left: 4px;
}

/* Rank cell styling */
.rank {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
}

.rank.good {
    background: #4CAF50;
    color: white;
}

.rank.ok {
    background: #FF9800;
    color: white;
}

.rank.poor {
    background: #f44336;
    color: white;
}

/* Sort By combo chips */
.b-chipview .b-chip {
    background: #e3f2fd;
    border: 1px solid #2196F3;
}

.b-chipview .b-chip .b-direction {
    margin-right: 4px;
    cursor: pointer;
}

.b-chipview .b-chip .b-direction:hover {
    color: #1976D2;
}

/* Header click highlight */
.b-grid-header-container.b-sortable:hover {
    background: rgba(33, 150, 243, 0.1);
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Column niet sorteerbaar | sortable: false | Verwijder sortable: false |
| Custom sort werkt niet | Functie signature fout | Check (a, b) parameters |
| Multi-sort niet actief | Feature niet geconfigureerd | multiSort: true |
| Direction togglet niet | toggleOnHeaderClick: false | Zet toggleOnHeaderClick: true |
| Sort event niet getriggerd | Listener niet toegevoegd | Voeg store listener toe |

---

## API Reference

### Sort Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `toggleOnHeaderClick` | Boolean | Sort on header click |
| `multiSort` | Boolean | Allow multiple sorters |
| `sortIndicator` | String | 'start' or 'end' |

### Store Sort Methods

| Method | Description |
|--------|-------------|
| `sort(field/sorters)` | Apply sort |
| `addSorter(sorter)` | Add to existing sorters |
| `removeSorter(field)` | Remove sorter |
| `clearSorters()` | Remove all sorting |

### Store Sort Properties

| Property | Type | Description |
|----------|------|-------------|
| `sorters` | Array | Current sorters |
| `isSorted` | Boolean | Check if sorted |

### Column Config

| Property | Type | Description |
|----------|------|-------------|
| `sortable` | Boolean/Function | Enable sort or custom function |

### Events

| Event | Description |
|-------|-------------|
| `sort` | Fired when sort changes |

---

## Bronnen

- **Example**: `examples/sorting/`
- **Sort Feature**: `Grid.feature.Sort`
- **Store Sorting**: `Core.data.Store.sort`

---

*Priority 2: Medium Priority Features*
