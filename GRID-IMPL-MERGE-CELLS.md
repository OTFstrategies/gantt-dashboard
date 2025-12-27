# Grid Implementation: Merge Cells

> **Cell spanning** en row/column merging voor visuele data groepering, met custom merge ranges, passthrough events, en conditional merging.

---

## Overzicht

Cell merging combineert aangrenzende cellen met dezelfde waarde tot één visuele cel. Dit verbetert de leesbaarheid voor gegroepeerde data.

```
Zonder merge:              Met merge:
┌────────┬────────┐        ┌────────┬────────┐
│ London │ Fish   │        │        │ Fish   │
├────────┼────────┤        │ London ├────────┤
│ London │ Burger │        │        │ Burger │
├────────┼────────┤        ├────────┼────────┤
│ Paris  │ Salad  │        │ Paris  │ Salad  │
└────────┴────────┘        └────────┴────────┘
```

---

## 1. Basis Configuratie

### 1.1 MergeCells Feature Activeren

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    features: {
        mergeCells: true
    },

    columns: [
        {
            text: 'City',
            field: 'city',
            mergeCells: true  // Enable merge voor deze kolom
        },
        {
            text: 'Chef',
            field: 'name',
            mergeable: false  // Disable merge toggle in menu
        },
        {
            text: 'Dish',
            field: 'food',
            mergeCells: true
        }
    ],

    store: {
        // Sorteren is belangrijk voor effectieve merging
        sorters: [
            { field: 'city' },
            { field: 'food' }
        ]
    }
});
```

### 1.2 Feature Opties

```javascript
features: {
    mergeCells: {
        // Click events gaan door merged cells
        passthrough: true,

        // Merge alleen in gesorteerde kolommen
        sortedOnly: false,

        // Custom range adjustment hook
        adjustRange: null,

        // Custom merge beslissing hook
        shouldMerge: null
    }
}
```

---

## 2. Column Configuratie

### 2.1 Per-Column Settings

```javascript
columns: [
    {
        text: 'Category',
        field: 'category',
        mergeCells: true,    // Enable merging
        mergeable: true      // Toon merge toggle in header menu (default)
    },
    {
        text: 'Name',
        field: 'name',
        mergeable: false     // Geen merge toggle in menu
    },
    {
        text: 'Status',
        field: 'status',
        mergeCells: false,   // Start zonder merge
        mergeable: true      // Maar user kan toggle
    }
]
```

### 2.2 Column met Custom Renderer

```javascript
{
    text: 'Dish',
    field: 'food',
    mergeCells: true,
    renderer({ value }) {
        const icons = {
            'Fish n chips': 'fa-fish',
            'Burger': 'fa-hamburger',
            'Salad': 'fa-carrot'
        };

        return [
            { tag: 'i', className: `fa ${icons[value]}` },
            value
        ];
    }
}
```

---

## 3. Conditional Merging

### 3.1 shouldMerge Hook

```javascript
// Hook om merge beslissing te customizen
const shouldMerge = ({ column, record, previousRecord, value }) => {
    // Merge city alleen als food ook overeenkomt
    if (column.field === 'city') {
        return record.food === previousRecord.food;
    }

    // Default behavior voor andere kolommen
    return true;
};

const grid = new Grid({
    features: {
        mergeCells: {
            shouldMerge
        }
    }
});
```

### 3.2 Dynamic Toggle

```javascript
// Toggle custom merge logic
tbar: [
    {
        type: 'slidetoggle',
        text: 'Custom ranges',
        checked: false,
        onChange({ checked }) {
            grid.features.mergeCells.shouldMerge = checked ? shouldMerge : null;
        }
    }
]
```

---

## 4. Range Adjustment

### 4.1 adjustRange Hook

```javascript
features: {
    mergeCells: {
        // Manipuleer de berekende merge ranges
        adjustRange({ column, range, fromRecord, toRecord }) {
            // range.fromIndex = start row index
            // range.toIndex = end row index

            // Voorbeeld: limiteer merge tot max 5 rijen
            if (range.toIndex - range.fromIndex > 5) {
                range.toIndex = range.fromIndex + 5;
            }

            // Return false om range te skippen
            if (someCondition) {
                return false;
            }
        }
    }
}
```

---

## 5. Runtime Controls

### 5.1 Toolbar Controls

```javascript
tbar: [
    {
        type: 'slidetoggle',
        text: 'Merge cells',
        checked: true,
        onChange({ checked }) {
            grid.features.mergeCells.disabled = !checked;
        }
    },
    '->',
    {
        type: 'slidetoggle',
        text: 'Sorted only',
        checked: false,
        tooltip: 'Merge cells in all columns, or only in sorted columns',
        onChange({ checked }) {
            grid.features.mergeCells.sortedOnly = checked;
        }
    },
    {
        type: 'slidetoggle',
        text: 'Passthrough',
        checked: true,
        tooltip: 'Allow pointer events to pass through',
        onChange({ checked }) {
            grid.features.mergeCells.passthrough = checked;
        }
    }
]
```

### 5.2 Programmatic Control

```javascript
// Enable/disable
grid.features.mergeCells.disabled = true;

// Toggle kolom merge
const column = grid.columns.get('city');
column.mergeCells = !column.mergeCells;

// Force refresh
grid.features.mergeCells.refresh();
```

---

## 6. Interactie met Andere Features

### 6.1 FilterBar

```javascript
features: {
    mergeCells: {
        sortedOnly: false
    },
    filterBar: {
        compactMode: true  // Minder ruimte in header
    }
}
```

### 6.2 RowReorder

```javascript
features: {
    mergeCells: true,
    rowReorder: true  // Drag rows werkt met merged cells
}
```

### 6.3 Sorting

```javascript
// Merged cells updaten automatisch bij sort
store: {
    sorters: [
        { field: 'city' },
        { field: 'food' }
    ]
}

// Bij sort change worden merges herberekend
grid.store.sort('city', 'DESC');
```

---

## 7. Passthrough Behavior

### 7.1 Wat is Passthrough?

Met `passthrough: true` (default):
- Clicks op merged cell gaan naar onderliggende row
- Hover effects werken per row
- Selection werkt per row

Met `passthrough: false`:
- Click selecteert hele merged range
- Hover effect op hele merged cel
- Nuttig voor "section headers"

### 7.2 Configuratie

```javascript
features: {
    mergeCells: {
        passthrough: true  // Default, row-level interaction
    }
}

// Runtime toggle
grid.features.mergeCells.passthrough = false;
```

---

## 8. Styling

### 8.1 Merged Cell Styling

```css
/* Merged cell container */
.b-grid-merged-cell {
    background: var(--b-grid-cell-bg);
    border: none;
}

/* First cell in merged range */
.b-grid-merged-cell-first {
    font-weight: 600;
}

/* Hover state */
.b-grid-merged-cell:hover {
    background: var(--b-grid-cell-hover-bg);
}
```

### 8.2 Vertical Alignment

```css
/* Center content in merged cell */
.b-grid-merged-cell {
    display: flex;
    align-items: center;
    justify-content: center;
}
```

---

## 9. Performance Considerations

### 9.1 sortedOnly voor Performance

```javascript
features: {
    mergeCells: {
        // Performance boost: alleen merge in gesorteerde kolommen
        sortedOnly: true
    }
}
```

### 9.2 Large Datasets

```javascript
// Bij grote datasets
features: {
    mergeCells: {
        sortedOnly: true,  // Minder berekeningen

        // Beperk merge range checks
        adjustRange({ range }) {
            // Max 50 rijen per merge
            if (range.toIndex - range.fromIndex > 50) {
                range.toIndex = range.fromIndex + 50;
            }
        }
    }
}
```

---

## 10. Use Cases

### 10.1 Category Grouping

```javascript
columns: [
    {
        text: 'Department',
        field: 'department',
        mergeCells: true,
        renderer({ value, cellElement }) {
            cellElement.style.fontWeight = 'bold';
            return value;
        }
    },
    { text: 'Employee', field: 'name' },
    { text: 'Role', field: 'role' }
],

store: {
    sorters: [{ field: 'department' }]
}
```

### 10.2 Date Grouping

```javascript
columns: [
    {
        text: 'Month',
        field: 'date',
        mergeCells: true,
        renderer({ value }) {
            return new Date(value).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        }
    },
    { text: 'Sales', field: 'sales', type: 'number' }
]
```

### 10.3 Hierarchical Data

```javascript
columns: [
    { text: 'Region', field: 'region', mergeCells: true },
    { text: 'Country', field: 'country', mergeCells: true },
    { text: 'City', field: 'city' }
],

store: {
    sorters: [
        { field: 'region' },
        { field: 'country' },
        { field: 'city' }
    ]
}
```

---

## 11. React Integratie

```jsx
import { BryntumGrid } from '@bryntum/grid-react';

function MergedCellGrid({ data }) {
    const [mergeEnabled, setMergeEnabled] = useState(true);

    const gridRef = useRef();

    useEffect(() => {
        if (gridRef.current) {
            gridRef.current.instance.features.mergeCells.disabled = !mergeEnabled;
        }
    }, [mergeEnabled]);

    return (
        <>
            <label>
                <input
                    type="checkbox"
                    checked={mergeEnabled}
                    onChange={e => setMergeEnabled(e.target.checked)}
                />
                Enable cell merging
            </label>

            <BryntumGrid
                ref={gridRef}
                columns={columns}
                data={data}
                features={{
                    mergeCells: true
                }}
            />
        </>
    );
}
```

---

## 12. Troubleshooting

### 12.1 Common Issues

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Cells niet gemerged | Data niet gesorteerd | Sorteer op merge kolom |
| Merge lost na edit | Store event | Cells herberekenen automatisch |
| Click niet werkend | passthrough: false | Zet passthrough: true |
| Performance issues | Grote dataset | Gebruik sortedOnly: true |

### 12.2 Debug

```javascript
// Check feature status
console.log('Disabled:', grid.features.mergeCells.disabled);
console.log('Sorted only:', grid.features.mergeCells.sortedOnly);
console.log('Passthrough:', grid.features.mergeCells.passthrough);

// Check column config
console.log('Column mergeCells:', column.mergeCells);
console.log('Column mergeable:', column.mergeable);
```

---

## Bronnen

- **Example**: `examples/merge-cells/`
- **Feature API**: `Grid.feature.MergeCells`
- **Column Config**: `Grid.column.Column#config-mergeCells`

---

*Track A: Foundation - Grid Core Extensions (A1.7)*
