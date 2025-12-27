# Grid Implementation: Context Menus

> **Cell en header context menus** met custom items, dynamic processing, en column-specific menus.

---

## Overzicht

Bryntum Grid biedt uitgebreide context menu functionaliteit voor zowel cells als headers.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│  First name ▼  │  Surname  │  Birthplace  │  Birthday   │  ⋮            │
├────────────────┼───────────┼──────────────┼─────────────┼────────────────┤
│  John          │  Doe      │  Paris  ──────► ┌────────────────────────┐ │
│  Jane          │  Smith    │  London │       │ ✏️  Edit cell           │ │
│  Bob           │  Wilson   │  Berlin │       │ 📊 Custom cell item    │ │
│                │           │         │       │ ────────────────────── │ │
│                │           │         │       │ 📍 Move to Paris       │ │
│                │           │         │       │ ⭐ Column specific     │ │
│                │           │         │       └────────────────────────┘ │
├────────────────┴───────────┴─────────┴─────────────────┴────────────────┤
│                                                                          │
│  HEADER MENU (right-click column header)                                │
│  ┌────────────────────────────────────────┐                             │
│  │ ⚙️  Custom header item                 │                             │
│  │ ⭐ Column specific                     │                             │
│  │ ────────────────────────────────────── │                             │
│  │ ↑  Sort ascending                      │                             │
│  │ ↓  Sort descending                     │                             │
│  │ 🔒 Lock column                         │                             │
│  └────────────────────────────────────────┘                             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Cell Menu Configuration

### 1.1 Basic Setup

```javascript
import { Toast, Grid, DataGenerator } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        cellMenu: {
            items: {
                // Add custom item
                customItem: {
                    text: 'Custom cell item',
                    icon: 'fa fa-chart-area',
                    cls: 'b-separator color',
                    weight: 110,  // Position after first default item
                    onItem: ({ item, record, column }) => {
                        if (record[column.field]) {
                            Toast.show(`Clicked "${item.text}" for "${record[column.field]}"`);
                        }
                        else {
                            Toast.show(`Clicked "${item.text}" for ${record?.name}`);
                        }
                    }
                },
                // Remove built-in item
                removeRow: false
            }
        }
    },

    columns: [
        { text: 'First name', field: 'firstName', flex: 1 },
        { text: 'Surname', field: 'surName', flex: 1 },
        { text: 'Birthplace', field: 'city', flex: 1 },
        { text: 'Birthday', field: 'start', flex: 1, type: 'date' }
    ],

    data: DataGenerator.generateData(50)
});
```

### 1.2 Dynamic Menu Processing

```javascript
features: {
    cellMenu: {
        // Process items before showing menu
        processItems({ items, column, record }) {
            // Add conditional item
            if (column.field === 'city' && record.city !== 'Paris') {
                items.moveTo = {
                    text: 'Move to Paris',
                    icon: 'fa fa-fw fa-map-marker-alt',
                    onItem({ record }) {
                        record.city = 'Paris';
                    }
                };
            }

            // Remove item conditionally
            if (record.isProtected) {
                items.removeRow = false;
            }
        }
    }
}
```

---

## 2. Header Menu Configuration

### 2.1 Basic Setup

```javascript
features: {
    headerMenu: {
        items: {
            // Add custom item
            customItem: {
                text: 'Custom header item',
                icon: 'fa fa-cogs',
                cls: 'b-separator color',
                weight: 80,  // Position before first default item
                onItem: ({ item, column }) => {
                    Toast.show(`Clicked "${item.text}" for column "${column.field}"`);
                }
            },
            // Customize existing submenu
            multiSort: {
                menu: {
                    addSortAsc: {
                        text: 'Going up'
                    },
                    addSortDesc: {
                        text: 'Going down'
                    }
                }
            },
            // Remove built-in item
            hideColumn: false
        }
    }
}
```

### 2.2 Dynamic Header Processing

```javascript
features: {
    headerMenu: {
        processItems({ items, column }) {
            // Remove custom item for specific column
            if (column.field === 'city') {
                items.customItem = false;
            }

            // Add column-specific items
            if (column.type === 'number') {
                items.showStats = {
                    text: 'Show Statistics',
                    icon: 'fa fa-calculator',
                    onItem({ column }) {
                        showColumnStats(column);
                    }
                };
            }
        }
    }
}
```

---

## 3. Column-Specific Menu Items

### 3.1 Per-Column Configuration

```javascript
columns: [
    {
        text: 'First name',
        field: 'firstName',
        flex: 1,
        // Column-specific header menu items
        headerMenuItems: {
            firstColumnItem: {
                text: 'Column specific',
                icon: 'fa fa-star',
                cls: 'color',
                weight: 90
            }
        },
        // Column-specific cell menu items
        cellMenuItems: {
            firstColumnItem: {
                text: 'Column specific',
                icon: 'fa fa-comment',
                cls: 'color',
                weight: 120
            }
        }
    },
    { text: 'Surname', field: 'surName', flex: 1 },
    { text: 'Birthplace', field: 'city', flex: 1 }
]
```

---

## 4. Action Column with Menu Trigger

```javascript
columns: [
    // ... other columns
    {
        type: 'action',
        actions: [
            {
                cls: 'b-icon fa-ellipsis-h',
                tooltip: 'Show cell menu',
                onClick({ record, target, column, grid }) {
                    // Programmatically show menu
                    grid.features.cellMenu.showMenuFor(
                        { record, column },
                        { targetElement: target }
                    );
                }
            }
        ]
    }
]
```

---

## 5. Menu Events

```javascript
const grid = new Grid({
    // ... config

    listeners: {
        // Cell menu item clicked
        cellMenuItem({ item, record, column }) {
            Toast.show(`Cell item: ${item.text}`);
        },

        // Header menu item clicked
        headerMenuItem({ item, column }) {
            Toast.show(`Header item: ${item.text}`);
        },

        // Before menu shows
        cellMenuBeforeShow({ items, record, column }) {
            console.log('Menu about to show for:', column.field);
            // Return false to prevent menu
        },

        headerMenuBeforeShow({ items, column }) {
            console.log('Header menu for:', column.field);
        }
    }
});
```

---

## 6. Column Rename Feature

```javascript
features: {
    headerMenu: true,
    columnRename: true  // Allow renaming columns from header menu
}
```

---

## 7. Custom Menu Styling

### 7.1 Separator and Colors

```javascript
items: {
    myItem: {
        text: 'My Item',
        icon: 'fa fa-star',
        cls: 'b-separator',  // Add separator above
        // Or use multiple classes
        cls: 'b-separator color highlight'
    }
}
```

### 7.2 Item Weight (Position)

```javascript
// Lower weight = higher in menu
items: {
    topItem: { text: 'Top', weight: 10 },
    middleItem: { text: 'Middle', weight: 100 },
    bottomItem: { text: 'Bottom', weight: 200 }
}
```

---

## 8. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useCallback } from 'react';

function GridWithContextMenu({ data }) {
    const handleCellMenuItem = useCallback(({ item, record, column }) => {
        console.log('Cell menu clicked:', item.text, record.id, column.field);
    }, []);

    const handleHeaderMenuItem = useCallback(({ item, column }) => {
        console.log('Header menu clicked:', item.text, column.field);
    }, []);

    const gridConfig = {
        features: {
            cellMenu: {
                items: {
                    viewDetails: {
                        text: 'View Details',
                        icon: 'fa fa-eye',
                        weight: 100,
                        onItem: ({ record }) => {
                            openDetailModal(record);
                        }
                    },
                    editRecord: {
                        text: 'Edit',
                        icon: 'fa fa-pencil',
                        weight: 110,
                        onItem: ({ record }) => {
                            openEditModal(record);
                        }
                    },
                    deleteRecord: {
                        text: 'Delete',
                        icon: 'fa fa-trash',
                        cls: 'b-separator',
                        weight: 200,
                        onItem: ({ record }) => {
                            if (confirm('Delete this record?')) {
                                record.remove();
                            }
                        }
                    }
                },
                processItems({ items, record }) {
                    // Disable delete for protected records
                    if (record.isProtected) {
                        items.deleteRecord = false;
                    }
                }
            },
            headerMenu: {
                items: {
                    exportColumn: {
                        text: 'Export Column',
                        icon: 'fa fa-download',
                        weight: 50,
                        onItem: ({ column }) => {
                            exportColumnData(column);
                        }
                    }
                }
            },
            columnRename: true
        },

        columns: [
            {
                text: 'Name',
                field: 'name',
                flex: 1,
                cellMenuItems: {
                    copyName: {
                        text: 'Copy Name',
                        icon: 'fa fa-copy',
                        onItem: ({ record }) => {
                            navigator.clipboard.writeText(record.name);
                        }
                    }
                }
            },
            { text: 'Age', field: 'age', width: 100 },
            { text: 'City', field: 'city', flex: 1 }
        ],

        listeners: {
            cellMenuItem: handleCellMenuItem,
            headerMenuItem: handleHeaderMenuItem
        }
    };

    return (
        <BryntumGrid
            data={data}
            {...gridConfig}
        />
    );
}
```

---

## 9. Styling

```css
/* Custom menu item styling */
.b-menu .b-menuitem.color {
    color: #2196F3;
}

.b-menu .b-menuitem.color .b-icon {
    color: #2196F3;
}

.b-menu .b-menuitem.highlight {
    background: #e3f2fd;
}

/* Separator styling */
.b-menu .b-menuitem.b-separator {
    border-top: 1px solid #e0e0e0;
    margin-top: 4px;
    padding-top: 8px;
}

/* Disabled item */
.b-menu .b-menuitem.b-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Menu header */
.b-menu .b-menu-header {
    font-weight: bold;
    background: #f5f5f5;
    padding: 8px 12px;
}

/* Icon styling */
.b-menu .b-menuitem .b-icon {
    width: 20px;
    margin-right: 8px;
    text-align: center;
}

/* Hover state */
.b-menu .b-menuitem:hover:not(.b-disabled) {
    background: #e3f2fd;
}

/* Danger items */
.b-menu .b-menuitem.danger {
    color: #f44336;
}

.b-menu .b-menuitem.danger .b-icon {
    color: #f44336;
}
```

---

## 10. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Menu niet zichtbaar | Feature disabled | Enable cellMenu/headerMenu feature |
| Custom item niet zichtbaar | processItems returns false | Check processItems logic |
| Item op verkeerde positie | Weight niet gezet | Configureer weight property |
| Separator niet zichtbaar | cls niet gezet | Voeg cls: 'b-separator' toe |
| Column rename werkt niet | Feature disabled | Enable columnRename feature |

---

## API Reference

### CellMenu Feature

| Property | Type | Description |
|----------|------|-------------|
| `items` | Object | Menu item definitions |
| `processItems` | Function | Dynamic item processing |

### HeaderMenu Feature

| Property | Type | Description |
|----------|------|-------------|
| `items` | Object | Menu item definitions |
| `processItems` | Function | Dynamic item processing |

### Menu Item Config

| Property | Type | Description |
|----------|------|-------------|
| `text` | String | Item label |
| `icon` | String | Icon CSS class |
| `cls` | String | Additional CSS classes |
| `weight` | Number | Position (lower = higher) |
| `onItem` | Function | Click handler |
| `disabled` | Boolean | Disable item |
| `menu` | Object | Submenu config |

### Column Menu Properties

| Property | Type | Description |
|----------|------|-------------|
| `headerMenuItems` | Object | Column-specific header items |
| `cellMenuItems` | Object | Column-specific cell items |

---

## Bronnen

- **Example**: `examples/contextmenu/`
- **Custom Context Menu**: `examples/custom-contextmenu/`
- **CellMenu Feature**: `Grid.feature.CellMenu`
- **HeaderMenu Feature**: `Grid.feature.HeaderMenu`
- **ColumnRename Feature**: `Grid.feature.ColumnRename`

---

*Priority 2: Medium Priority Features*
