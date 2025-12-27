# Grid Implementation: Filtering

> **Data filtering** met Filter feature, FilterBar, custom filter functions, en checklist filters.

---

## Overzicht

Bryntum Grid biedt uitgebreide filtering mogelijkheden via header menu, filterbar, of programmatisch.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                                      [Remove all filters]           │
├──────────────────────────────────────────────────────────────────────────┤
│ FILTER BAR                                                               │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐ │
│ │ Name...     │ Age ≥ 25    │ [Paris ▼]   │ Date...     │ [☑ Pizza]   │ │
│ └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘ │
├──────────────────────────────────────────────────────────────────────────┤
│  Name         │ Age │ City      │ When       │ Food                     │
├───────────────┼─────┼───────────┼────────────┼──────────────────────────┤
│ 👨 John Doe   │  35 │ Paris     │ 2024-01-15 │ Pizza                    │
│ 👩 Jane Smith │  28 │ Paris     │ 2024-02-20 │ Pizza                    │
│ 👴 Bob Wilson │  72 │ Paris     │ 2024-03-10 │ Pizza                    │
└──────────────────────────────────────────────────────────────────────────┘
              ▲                       ▲                    ▲
         Whole word            Multi-select           Checklist
         filter               combo filter            filter
```

---

## 1. Basic Filter Feature

### 1.1 Simple Setup

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        // Enable filter with initial value
        filter: {
            property: 'city',
            operator: '=',
            value: 'Paris'
        },
        stripe: true,
        quickFind: true
    },

    columns: [
        { type: 'rownumber' },
        { text: 'Name', field: 'name', flex: 1 },
        { text: 'Age', field: 'age', width: 100, type: 'number' },
        { text: 'City', field: 'city' },
        { text: 'When', field: 'start', type: 'date' },
        // Disable filtering for specific column
        { text: 'Team', field: 'team', flex: 1, filterable: false }
    ],

    data: DataGenerator.generateData(100),

    tbar: [
        {
            ref: 'removeAll',
            text: 'Remove all filters',
            icon: 'fa fa-times',
            onAction: () => grid.store.clearFilters()
        }
    ]
});

// Listen for filter changes
grid.store.on({
    filter() {
        grid.widgetMap.removeAll.disabled = !grid.store.isFiltered;
    }
});
```

### 1.2 Custom Filter Function

```javascript
columns: [
    {
        text: 'Name (whole words)',
        field: 'name',
        flex: 1,
        // Custom filter: match whole words only
        filterable: ({ value, record }) => {
            const regex = new RegExp(`\\b${StringHelper.escapeRegExp(value)}\\b`, 'i');
            return Boolean(record.name.match(regex));
        }
    }
]
```

---

## 2. FilterBar Feature

### 2.1 Basic FilterBar

```javascript
const grid = new Grid({
    appendTo: 'container',

    features: {
        filterBar: {
            compactMode: false,
            filter: { property: 'city', value: 'Paris' }
        },
        stripe: true,
        quickFind: true
    },

    columns: [
        { text: 'Name', field: 'name', flex: 1 },
        { text: 'Age', field: 'age', width: 125, type: 'number' },
        { text: 'City', field: 'city', flex: 1 },
        { text: 'When', field: 'start', flex: 1, type: 'date' },
        // Not filterable
        { text: 'Color', field: 'color', flex: 1, filterable: false }
    ],

    tbar: [
        {
            type: 'slidetoggle',
            text: 'Use compact mode',
            onChange: ({ checked }) => {
                grid.features.filterBar.compactMode = checked;
            }
        },
        {
            type: 'button',
            text: 'Remove all filters',
            icon: 'fa-times',
            onAction: () => grid.store.clearFilters()
        }
    ]
});
```

### 2.2 Custom Filter Field (Combo)

```javascript
import { Model } from '@bryntum/grid';

class CityModel extends Model {
    static idField = 'name';
    static fields = ['name', 'region'];
}

const cityCombo = {
    type: 'combo',
    valueField: 'name',
    displayField: 'name',
    cls: 'city-combo',
    chipView: {
        iconTpl: () => '<i class="b-icon fa-city"></i>'
    },
    listItemTpl: ({ name }) => `<i class="b-icon fa-city"></i>${name}`,
    picker: {
        cls: 'city-list',
        allowGroupSelect: false
    },
    store: {
        modelClass: CityModel,
        groupers: [{ field: 'region', ascending: true }],
        data: [
            { name: 'Stockholm', region: 'Europe' },
            { name: 'Barcelona', region: 'Europe' },
            { name: 'Paris', region: 'Europe' },
            { name: 'Dubai', region: 'Middle East' },
            { name: 'New York', region: 'US' },
            { name: 'San Francisco', region: 'US' }
        ]
    }
};

columns: [
    {
        text: 'City',
        field: 'city',
        flex: 1,
        editor: cityCombo,
        filterable: {
            // Multi-select combo for filtering
            filterField: { ...cityCombo, multiSelect: true }
        }
    }
]
```

### 2.3 Checklist Filter

```javascript
import { VALUE_COUNT } from '@bryntum/grid';

columns: [
    {
        text: 'Food',
        field: 'food',
        flex: 1,
        filterable: {
            filterField: {
                type: 'checklistfiltercombo',
                placeholder: '',
                value: [],
                // Show count next to each item
                listItemPillTpl: (record) =>
                    `<span class="item-count">${record.originalData[VALUE_COUNT]}</span>`
            }
        }
    }
]
```

### 2.4 Custom Filter Function in FilterBar

```javascript
columns: [
    {
        text: 'Team (acronym match)',
        tooltip: 'Matches first letter of each word (SFC -> San Francisco Cats)',
        field: 'team',
        flex: 1,
        // Custom filter: match acronyms
        filterable({ value, record }) {
            const matches = record.team.match(/\b(\w)/g);
            return matches ? matches.join('').startsWith(value) : false;
        }
    }
]
```

---

## 3. Filter Operators

### 3.1 Available Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equal | `city = 'Paris'` |
| `!=` | Not equal | `city != 'Paris'` |
| `>` | Greater than | `age > 30` |
| `>=` | Greater or equal | `age >= 30` |
| `<` | Less than | `age < 30` |
| `<=` | Less or equal | `age <= 30` |
| `*` | Contains | `name * 'john'` |
| `startsWith` | Starts with | `name startsWith 'J'` |
| `endsWith` | Ends with | `name endsWith 'son'` |
| `isIncludedIn` | In array | `city isIncludedIn ['Paris', 'London']` |

### 3.2 Programmatic Filtering

```javascript
// Add single filter
grid.store.filter({
    property: 'age',
    operator: '>',
    value: 30
});

// Add multiple filters
grid.store.filter([
    { property: 'city', value: 'Paris' },
    { property: 'age', operator: '>=', value: 25 }
]);

// Custom filter function
grid.store.filter({
    id: 'customFilter',
    filterBy: record => record.age > 30 && record.city === 'Paris'
});

// Remove specific filter
grid.store.removeFilter('customFilter');

// Clear all filters
grid.store.clearFilters();

// Check if filtered
if (grid.store.isFiltered) {
    console.log('Grid is filtered');
}
```

---

## 4. Filter Events

```javascript
grid.store.on({
    // Before filter applied
    beforeFilter({ filters }) {
        console.log('About to filter with:', filters);
        // Return false to cancel
    },

    // After filter applied
    filter({ filters, records }) {
        console.log(`Filtered to ${records.length} records`);
        updateFilterIndicator(filters);
    }
});

// Grid-level events
grid.on({
    filterBarFieldChange({ column, value }) {
        console.log(`Filter changed for ${column.field}: ${value}`);
    }
});
```

---

## 5. Cell Renderers with Filtering

```javascript
columns: [
    {
        text: 'Name',
        field: 'name',
        flex: 1,
        htmlEncode: false,
        // Custom filter
        filterable: ({ value, record }) =>
            Boolean(record.name.match(new RegExp(`\\b${value}\\b`, 'i'))),
        // Custom renderer with emoji
        renderer({ record, value }) {
            const female = isFemale(record.firstName);
            let emoji = '👽';

            if (record.age > 70) {
                emoji = female ? '👵' : '👴';
            }
            else if (record.age < 20) {
                emoji = female ? '👧' : '👦';
            }
            else {
                emoji = female ? '👩' : '👨';
            }

            return StringHelper.xss`<span class="emoji">${emoji}</span> ${value || ''}`;
        }
    }
]
```

---

## 6. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useState, useCallback } from 'react';

function FilterableGrid({ data }) {
    const [filterCount, setFilterCount] = useState(0);
    const [compactMode, setCompactMode] = useState(false);

    const handleFilter = useCallback(({ filters }) => {
        setFilterCount(filters.length);
    }, []);

    const gridConfig = {
        features: {
            filterBar: {
                compactMode
            },
            stripe: true,
            quickFind: true
        },

        columns: [
            { text: 'Name', field: 'name', flex: 1 },
            { text: 'Age', field: 'age', width: 100, type: 'number' },
            {
                text: 'City',
                field: 'city',
                flex: 1,
                filterable: {
                    filterField: {
                        type: 'combo',
                        multiSelect: true,
                        items: ['Paris', 'London', 'Berlin', 'New York']
                    }
                }
            },
            { text: 'Date', field: 'start', type: 'date' }
        ],

        listeners: {
            filter: handleFilter
        }
    };

    const clearFilters = () => {
        const grid = document.querySelector('.b-grid')?.bryntum;
        grid?.store.clearFilters();
    };

    return (
        <div className="filterable-grid">
            <div className="toolbar">
                <label>
                    <input
                        type="checkbox"
                        checked={compactMode}
                        onChange={(e) => setCompactMode(e.target.checked)}
                    />
                    Compact mode
                </label>
                <span>Active filters: {filterCount}</span>
                <button onClick={clearFilters} disabled={filterCount === 0}>
                    Clear all filters
                </button>
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
/* FilterBar styling */
.b-filter-bar-field {
    background: white;
    border-radius: 4px;
}

.b-filter-bar-field:focus-within {
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
}

/* Active filter indicator */
.b-filter-bar-field.b-contains-value {
    background: #e3f2fd;
}

/* Checklist filter */
.b-checklistfiltercombo .item-count {
    background: #9e9e9e;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 11px;
    margin-left: 8px;
}

/* City combo styling */
.city-combo .b-icon {
    margin-right: 8px;
    color: #666;
}

.city-list .b-list-item {
    padding: 8px 12px;
}

/* Filter indicator in header */
.b-grid-header.b-filter-active::after {
    content: '🔍';
    margin-left: 4px;
    font-size: 10px;
}

/* Compact mode indicator */
.b-grid.b-filterbar-compact .b-grid-header:hover::after {
    content: 'Type to filter...';
    font-size: 10px;
    color: #999;
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Filter werkt niet | filterable: false | Verwijder of zet filterable: true |
| Custom filter faalt | Geen return value | Zorg dat filter functie boolean returnt |
| FilterBar niet zichtbaar | Feature niet enabled | Zet filterBar: true in features |
| Checklist leeg | Geen unieke waarden | Check data bevat waarden voor column |
| Filter reset niet | clearFilters() niet aangeroepen | Roep store.clearFilters() aan |

---

## API Reference

### Filter Feature

| Property | Type | Description |
|----------|------|-------------|
| `property` | String | Field to filter |
| `operator` | String | Filter operator |
| `value` | Any | Filter value |

### FilterBar Feature

| Property | Type | Description |
|----------|------|-------------|
| `compactMode` | Boolean | Use compact inline filter |
| `filter` | Object | Initial filter config |

### Column Filterable

| Property | Type | Description |
|----------|------|-------------|
| `filterable` | Boolean/Function/Object | Enable/configure filtering |
| `filterField` | Object | Custom filter field config |

### Store Filter Methods

| Method | Description |
|--------|-------------|
| `filter(config)` | Add filter(s) |
| `removeFilter(id)` | Remove specific filter |
| `clearFilters()` | Remove all filters |
| `isFiltered` | Check if store is filtered |

---

## Bronnen

- **Filter Example**: `examples/filtering/`
- **FilterBar Example**: `examples/filterbar/`
- **Filter Feature**: `Grid.feature.Filter`
- **FilterBar Feature**: `Grid.feature.FilterBar`

---

*Priority 2: Medium Priority Features*
