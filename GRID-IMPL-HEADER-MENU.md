# Grid Implementation: Header Menu

> **Header Menu** voor column header context menu met sortering, filtering en column management.

---

## Overzicht

Bryntum Grid biedt een uitgebreid header menu voor column management.

```
+--------------------------------------------------------------------------+
| GRID                                                                      |
+--------------------------------------------------------------------------+
|  Name ▼        |  Status         |  Priority      |  Due Date            |
+--------------------------------------------------------------------------+
|  +------------+                                                           |
|  | Sort A-Z   |                                                           |
|  | Sort Z-A   |                                                           |
|  |------------|                                                           |
|  | Filter     |  → Name contains: [______]                               |
|  |------------|                                                           |
|  | Hide column|                                                           |
|  | Columns... |                                                           |
|  |------------|                                                           |
|  | Group by   |                                                           |
|  +------------+                                                           |
|                                                                          |
|  HEADER MENU FEATURES:                                                    |
|    - Sorting controls                                                     |
|    - Quick filters                                                        |
|    - Column visibility toggle                                             |
|    - Grouping options                                                     |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Header Menu Setup

### 1.1 Enable Header Menu

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        headerMenu: true  // Enable by default
    },

    columns: [
        { text: 'Name', field: 'name', width: 200 },
        { text: 'Status', field: 'status', width: 120 },
        { text: 'Priority', field: 'priority', width: 100 },
        { text: 'Due Date', field: 'dueDate', type: 'date', width: 120 }
    ],

    data: [
        { id: 1, name: 'Task A', status: 'Active', priority: 'High', dueDate: '2024-01-15' },
        { id: 2, name: 'Task B', status: 'Pending', priority: 'Medium', dueDate: '2024-01-20' }
    ]
});
```

---

## 2. Custom Menu Items

### 2.1 Add Custom Items

```javascript
features: {
    headerMenu: {
        items: {
            // Add custom item
            exportColumn: {
                text: 'Export Column',
                icon: 'b-fa b-fa-download',
                weight: 200,  // Position in menu
                onItem({ column }) {
                    console.log('Export column:', column.field);
                    exportColumnData(column);
                }
            },

            // Add with submenu
            columnActions: {
                text: 'Column Actions',
                icon: 'b-fa b-fa-cog',
                menu: {
                    items: {
                        freeze: {
                            text: 'Freeze Column',
                            onItem({ column }) {
                                column.locked = true;
                            }
                        },
                        resize: {
                            text: 'Auto Resize',
                            onItem({ column }) {
                                column.resizeToFitContent();
                            }
                        }
                    }
                }
            },

            // Separator
            customSeparator: {
                separator: true,
                weight: 150
            }
        }
    }
}
```

### 2.2 Process Menu Items Dynamically

```javascript
features: {
    headerMenu: {
        processItems({ column, items }) {
            // Hide certain items for specific columns
            if (column.field === 'id') {
                items.hideColumn = false;  // Disable hide for ID column
            }

            // Add column-specific items
            if (column.type === 'number') {
                items.showSum = {
                    text: 'Show Sum',
                    icon: 'b-fa b-fa-calculator',
                    onItem() {
                        showColumnSum(column);
                    }
                };
            }

            return items;
        }
    }
}
```

---

## 3. Built-in Menu Items

### 3.1 Configure Built-in Items

```javascript
features: {
    headerMenu: {
        items: {
            // Sort items
            sortAsc: {
                text: 'Sort A → Z',
                icon: 'b-fa b-fa-sort-alpha-down'
            },
            sortDesc: {
                text: 'Sort Z → A',
                icon: 'b-fa b-fa-sort-alpha-up'
            },

            // Disable group by
            groupAsc: false,
            groupDesc: false,

            // Rename filter
            filter: {
                text: 'Quick Filter'
            },

            // Custom hide column
            hideColumn: {
                text: 'Remove Column',
                icon: 'b-fa b-fa-eye-slash'
            },

            // Column picker
            columnPicker: {
                text: 'Manage Columns',
                icon: 'b-fa b-fa-columns'
            }
        }
    }
}
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useRef, useMemo, useCallback } from 'react';

function HeaderMenuGrid({ data }) {
    const gridRef = useRef(null);

    const handleColumnExport = useCallback((column) => {
        const grid = gridRef.current?.instance;
        const values = grid.store.records.map(r => r.get(column.field));
        console.log(`Exporting ${column.text}:`, values);
    }, []);

    const gridConfig = useMemo(() => ({
        features: {
            headerMenu: {
                items: {
                    exportColumn: {
                        text: 'Export Column',
                        icon: 'b-fa b-fa-download',
                        onItem: ({ column }) => handleColumnExport(column)
                    },
                    copyValues: {
                        text: 'Copy All Values',
                        icon: 'b-fa b-fa-copy',
                        onItem({ column, grid }) {
                            const values = grid.store.records
                                .map(r => r.get(column.field))
                                .join('\n');
                            navigator.clipboard.writeText(values);
                        }
                    },
                    separator1: { separator: true, weight: 150 },
                    statistics: {
                        text: 'Column Statistics',
                        icon: 'b-fa b-fa-chart-bar',
                        disabled: ({ column }) => column.type !== 'number',
                        onItem({ column, grid }) {
                            const values = grid.store.records
                                .map(r => r.get(column.field))
                                .filter(v => typeof v === 'number');
                            const sum = values.reduce((a, b) => a + b, 0);
                            const avg = sum / values.length;
                            alert(`Sum: ${sum}\nAverage: ${avg.toFixed(2)}`);
                        }
                    }
                },
                processItems({ column, items }) {
                    // Conditionally show items
                    if (column.field === 'id') {
                        items.hideColumn = false;
                        items.sortAsc = false;
                        items.sortDesc = false;
                    }
                    return items;
                }
            },
            sort: true,
            filter: true
        },

        columns: [
            { text: 'ID', field: 'id', width: 80 },
            { text: 'Name', field: 'name', width: 200 },
            { text: 'Amount', field: 'amount', type: 'number', width: 120 },
            { text: 'Status', field: 'status', width: 120 }
        ]
    }), [handleColumnExport]);

    return (
        <div className="header-menu-grid">
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

## 5. Column Picker

### 5.1 Custom Column Picker

```javascript
features: {
    headerMenu: {
        items: {
            columnPicker: {
                text: 'Show/Hide Columns',
                icon: 'b-fa b-fa-columns',
                menu: {
                    type: 'columnpickermenu',
                    // Grouping in picker
                    groupColumn: 'category',
                    // Max height
                    maxHeight: 400
                }
            }
        }
    }
},

columns: [
    { text: 'Name', field: 'name', category: 'Basic' },
    { text: 'Status', field: 'status', category: 'Basic' },
    { text: 'Start Date', field: 'startDate', category: 'Dates' },
    { text: 'End Date', field: 'endDate', category: 'Dates' },
    { text: 'Budget', field: 'budget', category: 'Financial' }
]
```

---

## 6. Styling

```css
/* Header menu */
.b-menu.b-header-menu {
    min-width: 200px;
}

.b-menu.b-header-menu .b-menuitem {
    padding: 8px 16px;
}

.b-menu.b-header-menu .b-menuitem:hover {
    background: #e3f2fd;
}

.b-menu.b-header-menu .b-menuitem .b-icon {
    margin-right: 12px;
    color: #1976d2;
}

/* Separator */
.b-menu.b-header-menu .b-menu-separator {
    margin: 4px 0;
    border-top: 1px solid #e0e0e0;
}

/* Disabled item */
.b-menu.b-header-menu .b-menuitem.b-disabled {
    opacity: 0.5;
    pointer-events: none;
}

/* Submenu arrow */
.b-menu.b-header-menu .b-menuitem.b-has-submenu::after {
    content: '▶';
    position: absolute;
    right: 12px;
    font-size: 10px;
    color: #999;
}

/* Column picker */
.b-columnpickermenu {
    max-height: 400px;
    overflow-y: auto;
}

.b-columnpickermenu .b-checkbox {
    margin: 4px 0;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Menu niet zichtbaar | Feature disabled | Enable headerMenu feature |
| Custom item mist | Wrong weight | Pas weight aan voor positie |
| Item werkt niet | onItem handler error | Check console voor errors |
| Menu sluit direct | Event propagation | Use e.stopPropagation() |

---

## API Reference

### Header Menu Config

| Property | Type | Description |
|----------|------|-------------|
| `items` | Object | Menu items configuration |
| `processItems` | Function | Dynamic item processing |
| `triggerEvent` | String | Event to show menu |

### Built-in Items

| Item | Description |
|------|-------------|
| `sortAsc` | Sort ascending |
| `sortDesc` | Sort descending |
| `groupAsc` | Group ascending |
| `groupDesc` | Group descending |
| `filter` | Filter column |
| `hideColumn` | Hide column |
| `columnPicker` | Column picker |

### Item Config

| Property | Type | Description |
|----------|------|-------------|
| `text` | String | Item text |
| `icon` | String | Icon class |
| `weight` | Number | Sort order |
| `disabled` | Boolean/Function | Disable item |
| `hidden` | Boolean/Function | Hide item |
| `onItem` | Function | Click handler |
| `menu` | Object | Submenu config |
| `separator` | Boolean | Separator line |

---

## Bronnen

- **Feature**: `Grid.feature.HeaderMenu`
- **Column Picker**: `Grid.widget.ColumnPickerMenu`

---

*Priority 2: Medium Priority Features*
