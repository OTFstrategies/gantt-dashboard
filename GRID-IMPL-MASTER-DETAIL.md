# Grid Implementation: Master-Detail

> **Master-detail patterns** met linked grids, hierarchische data (Customer → Order → LineItem), RowExpander feature, en store-type fields voor geneste data.

---

## Overzicht

Master-detail is een patroon waarbij selectie in een "master" grid detail records toont in geneste grids. Dit is ideaal voor hiërarchische data zoals:

- Customer → Orders → Line Items
- Project → Tasks → Subtasks
- Category → Products → Variants

```
┌────────────────────────────────────────────────────────────────┐
│ Customer          │ Location      │ Total                     │
├────────────────────────────────────────────────────────────────┤
│ ▼ John Smith      │ New York      │ $3,500.00                 │
├────────────────────────────────────────────────────────────────┤
│ │ ┌─────────────────────────────────────────────────────────┐ │
│ │ │ Order #  │ Items │ Date       │ Total                   │ │
│ │ ├─────────────────────────────────────────────────────────┤ │
│ │ │ ▼ 1001   │ 3     │ 2024-01-15 │ $1,200.00               │ │
│ │ ├─────────────────────────────────────────────────────────┤ │
│ │ │ │ Product          │ Qty │ Price   │ 🗑️               │ │
│ │ │ │ Widget Pro       │ 2   │ $500.00 │                   │ │
│ │ │ │ Cable USB-C      │ 5   │ $40.00  │                   │ │
│ │ │ └───────────────────────────────────────────────────────┘ │
│ │ │ 1002    │ 2     │ 2024-01-20 │ $800.00                  │ │
│ │ └─────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│   Sarah Johnson   │ Los Angeles   │ $2,100.00                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 1. Hiërarchische Data Modellen

### 1.1 LineItem Model (Diepste niveau)

```javascript
import { GridRowModel } from '@bryntum/grid';

class LineItem extends GridRowModel {
    static fields = [
        'product_name',
        'quantity',
        { name: 'price', type: 'number' }
    ];

    // Computed field: totaal per regel
    get lineTotal() {
        return this.price * this.quantity;
    }
}
```

### 1.2 Order Model (Midden niveau)

```javascript
import { Store, GridRowModel } from '@bryntum/grid';

class Order extends GridRowModel {
    static fields = [
        { name: 'order_date', type: 'date' },
        {
            // "store" type field bevat geneste records
            name: 'order_lines',
            type: 'store',
            storeClass: Store,
            modelClass: LineItem
        }
    ];

    // Computed: order totaal
    get orderTotal() {
        return this.order_lines?.sum('lineTotal') || 0;
    }

    // Computed: aantal regels
    get lineCount() {
        return this.order_lines?.count || 0;
    }
}

// Custom ID field
Order.idField = 'order_id';
```

### 1.3 Customer Model (Top niveau)

```javascript
class Customer extends GridRowModel {
    static fields = [
        'name',
        { name: 'avatar', defaultValue: 'none.png' },
        'location',
        {
            // Geneste orders store
            name: 'orders',
            type: 'store',
            storeClass: Store,
            modelClass: Order
        }
    ];

    // Computed: totaal van alle orders
    get total() {
        return this.orders?.sum('orderTotal') || 0;
    }
}
```

---

## 2. Geneste Grid Widgets

### 2.1 LineItemGrid (Diepste niveau)

```javascript
class LineItemGrid extends Grid {
    static $name = 'LineItemGrid';
    static type = 'lineitemgrid';

    static configurable = {
        autoHeight: true,  // Grid past hoogte aan inhoud aan

        store: {
            modelClass: LineItem
        },

        selectionMode: {
            checkbox: true,
            showCheckAll: true
        },

        columns: [
            {
                type: 'template',
                text: 'Product',
                field: 'product_name',
                flex: 3,
                template: ({ record }) =>
                    `<i class="${record.icon} fa-fw"></i>${record.product_name}`
            },
            {
                // Widget column voor quantity +/- buttons
                type: 'widget',
                text: 'Quantity',
                field: 'quantity',
                width: 150,
                align: 'center',
                widgets: [
                    {
                        type: 'button',
                        icon: 'fa fa-minus',
                        onAction: ({ source: btn }) => {
                            const { record } = btn.cellInfo;
                            if (record.quantity > 0) {
                                record.quantity--;
                            }
                        }
                    },
                    {
                        // Text display van quantity
                        name: 'quantity'
                    },
                    {
                        type: 'button',
                        icon: 'fa fa-plus',
                        onAction: ({ source: btn }) => {
                            btn.cellInfo.record.quantity++;
                        }
                    }
                ]
            },
            {
                text: 'Price',
                type: 'number',
                field: 'price',
                width: 100,
                align: 'end',
                format: {
                    style: 'currency',
                    currency: 'USD'
                }
            },
            {
                type: 'action',
                width: 50,
                actions: [{
                    cls: 'fa fa-trash',
                    tooltip: 'Delete item',
                    onClick: async({ record }) => {
                        const result = await MessageDialog.confirm({
                            title: 'Please confirm',
                            message: 'Delete this line item?'
                        });

                        if (result === MessageDialog.okButton) {
                            record.remove();
                        }
                    }
                }]
            }
        ]
    };
}

LineItemGrid.initClass();
```

### 2.2 OrderGrid (Midden niveau)

```javascript
class OrderGrid extends Grid {
    static $name = 'OrderGrid';
    static type = 'ordergrid';

    static configurable = {
        autoHeight: true,

        store: {
            modelClass: Order
        },

        selectionMode: {
            checkbox: true,
            showCheckAll: true
        },

        columns: [
            { text: 'Order #', field: 'id', flex: 1 },
            { text: 'Items', field: 'lineCount', editor: false },
            { text: 'Date', type: 'date', field: 'order_date' },
            {
                type: 'number',
                text: 'Total',
                field: 'orderTotal',
                editor: false,
                format: {
                    style: 'currency',
                    currency: 'USD'
                },
                align: 'right'
            }
        ],

        features: {
            sort: 'id',
            rowExpander: {
                // Geneste LineItemGrid
                widget: {
                    type: 'lineitemgrid'
                },
                // Data komt uit order_lines field
                dataField: 'order_lines'
            }
        }
    };
}

OrderGrid.initClass();
```

---

## 3. Master Grid Configuratie

```javascript
const grid = new Grid({
    appendTo: 'container',
    rowHeight: 70,

    features: {
        rowExpander: {
            // Geneste OrderGrid
            widget: {
                type: 'ordergrid'
            },
            // Data komt uit orders field
            dataField: 'orders'
        }
    },

    columns: [
        {
            text: 'Customer',
            field: 'name',
            flex: 1,
            renderer({ value, record }) {
                return [
                    {
                        tag: 'img',
                        alt: record.name,
                        className: 'avatar',
                        src: `images/users/${record.avatar}`
                    },
                    value
                ];
            }
        },
        { text: 'Location', field: 'location', flex: 1 },
        {
            type: 'number',
            text: 'Total',
            field: 'total',
            editor: false,
            format: {
                style: 'currency',
                currency: 'USD'
            },
            align: 'right'
        }
    ],

    store: {
        readUrl: 'data/customers.json',
        autoLoad: true,
        modelClass: Customer
    }
});
```

---

## 4. Auto-Expand Nested Rows

### 4.1 Expand bij Data Load

```javascript
store: {
    readUrl: 'data/customers.json',
    autoLoad: true,
    modelClass: Customer,

    listeners: {
        load() {
            // Expand eerste customer
            grid.features.rowExpander.expand(grid.store.first);
        }
    }
}
```

### 4.2 Cascading Expand

```javascript
store: {
    listeners: {
        load() {
            grid.on({
                rowExpand({ widget }) {
                    // Expand eerste order in OrderGrid
                    widget.features.rowExpander.expand(widget.store.first);
                },
                once: true
            });

            // Start met expand customer
            grid.features.rowExpander.expand(grid.store.first);
        }
    }
}
```

---

## 5. Data Structuur (JSON)

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "John Smith",
            "avatar": "john.jpg",
            "location": "New York",
            "orders": [
                {
                    "order_id": 1001,
                    "order_date": "2024-01-15",
                    "order_lines": [
                        {
                            "id": 1,
                            "product_name": "Widget Pro",
                            "quantity": 2,
                            "price": 500,
                            "icon": "fa fa-cog"
                        },
                        {
                            "id": 2,
                            "product_name": "Cable USB-C",
                            "quantity": 5,
                            "price": 40,
                            "icon": "fa fa-plug"
                        }
                    ]
                },
                {
                    "order_id": 1002,
                    "order_date": "2024-01-20",
                    "order_lines": [
                        {
                            "id": 3,
                            "product_name": "Monitor 27\"",
                            "quantity": 1,
                            "price": 800,
                            "icon": "fa fa-desktop"
                        }
                    ]
                }
            ]
        }
    ]
}
```

---

## 6. Store-Type Fields

### 6.1 Basis Syntax

```javascript
static fields = [
    {
        name: 'children',       // Field naam
        type: 'store',          // Store type
        storeClass: Store,      // Store class
        modelClass: ChildModel  // Model class voor records
    }
];
```

### 6.2 Custom Store Class

```javascript
class OrderStore extends Store {
    static configurable = {
        modelClass: Order,
        sorters: [{ field: 'order_date', direction: 'DESC' }]
    };

    // Custom methods
    getRecentOrders(days = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return this.query(o => o.order_date >= cutoff);
    }
}

class Customer extends GridRowModel {
    static fields = [
        {
            name: 'orders',
            type: 'store',
            storeClass: OrderStore
        }
    ];
}
```

---

## 7. Computed Fields in Detail

### 7.1 Aggregatie van Geneste Data

```javascript
class Customer extends GridRowModel {
    // Totaal van alle orders
    get total() {
        return this.orders?.sum('orderTotal') || 0;
    }

    // Gemiddelde order waarde
    get averageOrderValue() {
        const count = this.orders?.count || 0;
        return count > 0 ? this.total / count : 0;
    }

    // Aantal items over alle orders
    get totalItems() {
        return this.orders?.reduce(
            (sum, order) => sum + order.lineCount, 0
        ) || 0;
    }

    // Laatste order datum
    get lastOrderDate() {
        if (!this.orders?.count) return null;
        return this.orders.max('order_date');
    }
}
```

### 7.2 Store Aggregatie Methods

```javascript
// Sum van field
store.sum('fieldName');

// Count
store.count;

// Min/Max
store.min('fieldName');
store.max('fieldName');

// Average
store.average('fieldName');

// Custom reduce
store.reduce((acc, record) => acc + record.value, 0);
```

---

## 8. RowExpander Configuratie

### 8.1 Basis Configuratie

```javascript
features: {
    rowExpander: {
        widget: {
            type: 'ordergrid'
        },
        dataField: 'orders'  // Field met geneste data
    }
}
```

### 8.2 Geavanceerde Configuratie

```javascript
features: {
    rowExpander: {
        // Widget configuratie
        widget: {
            type: 'ordergrid',
            cls: 'nested-grid'
        },

        // Data source field
        dataField: 'orders',

        // Column configuratie
        column: {
            width: 50,
            align: 'center'
        },

        // Event handlers
        onExpand({ record, widget }) {
            console.log('Expanded:', record.name);
            // Custom initialization
        },

        onCollapse({ record }) {
            console.log('Collapsed:', record.name);
        },

        // Expand gedrag
        singleExpand: true,  // Slechts één rij tegelijk open
        expandOnCellClick: false  // Alleen expand via button
    }
}
```

### 8.3 Programmatic Control

```javascript
// Expand specifieke record
grid.features.rowExpander.expand(record);

// Collapse
grid.features.rowExpander.collapse(record);

// Toggle
grid.features.rowExpander.toggleCollapse(record);

// Expand all
grid.store.forEach(r => grid.features.rowExpander.expand(r));

// Check of expanded
grid.features.rowExpander.isExpanded(record);
```

---

## 9. Synchronisatie & Propagation

### 9.1 Change Propagation naar Parent

Wijzigingen in geneste grids propageren automatisch naar parent computed fields:

```javascript
// In LineItemGrid - quantity wijzigen
record.quantity++;

// Automatisch updates:
// 1. lineTotal (LineItem computed)
// 2. orderTotal (Order computed)
// 3. total (Customer computed)
```

### 9.2 Store Events

```javascript
class Customer extends GridRowModel {
    static fields = [
        {
            name: 'orders',
            type: 'store',
            storeClass: Store,
            modelClass: Order
        }
    ];

    construct(...args) {
        super.construct(...args);

        // Luister naar nested store changes
        this.orders?.on({
            change: () => {
                // Trigger refresh van computed fields
                this.afterChange({ total: true });
            }
        });
    }
}
```

---

## 10. Styling

### 10.1 Nested Grid Styling

```css
/* Nested grid container */
.b-rowexpander-body {
    padding: 0.5em 1em 0.5em 3em;
    background: var(--b-panel-bg);
}

/* Nested grid */
.nested-grid {
    border: 1px solid var(--b-border-color);
    border-radius: 4px;
    margin: 0.5em 0;
}

.nested-grid .b-grid-header {
    background: var(--b-grid-header-bg);
}
```

### 10.2 Avatar Styling

```css
.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 1em;
    vertical-align: middle;
}
```

### 10.3 Depth Indication

```css
/* Level 1 nested grid */
.b-rowexpander-body .b-grid {
    border-left: 3px solid var(--b-primary-color);
}

/* Level 2 nested grid */
.b-rowexpander-body .b-rowexpander-body .b-grid {
    border-left: 3px solid var(--b-secondary-color);
}
```

---

## 11. Performance Optimalisaties

### 11.1 Lazy Loading Nested Data

```javascript
features: {
    rowExpander: {
        widget: { type: 'ordergrid' },

        // Lazy load data on expand
        onExpand: async({ record, widget }) => {
            if (!record.orders?.count) {
                widget.mask('Loading orders...');

                const response = await fetch(`/api/customers/${record.id}/orders`);
                const orders = await response.json();

                record.orders.data = orders;
                widget.unmask();
            }
        }
    }
}
```

### 11.2 Virtual Nested Stores

```javascript
class Customer extends GridRowModel {
    static fields = [
        {
            name: 'orders',
            type: 'store',
            storeClass: Store,
            modelClass: Order,
            // Defer loading
            lazy: true
        }
    ];

    async loadOrders() {
        if (!this._ordersLoaded) {
            const response = await fetch(`/api/customers/${this.id}/orders`);
            this.orders.data = await response.json();
            this._ordersLoaded = true;
        }
        return this.orders;
    }
}
```

---

## 12. React Integratie

```jsx
import { BryntumGrid } from '@bryntum/grid-react';

function CustomerOrdersGrid({ customers }) {
    const gridRef = useRef();

    // Register custom grid widgets
    useEffect(() => {
        LineItemGrid.initClass();
        OrderGrid.initClass();
    }, []);

    const rowExpanderConfig = {
        widget: { type: 'ordergrid' },
        dataField: 'orders'
    };

    return (
        <BryntumGrid
            ref={gridRef}
            columns={customerColumns}
            data={customers}
            features={{
                rowExpander: rowExpanderConfig
            }}
        />
    );
}
```

---

## 13. Alternative: Side-by-Side Master-Detail

```javascript
// Twee aparte grids, gesynchroniseerd
const masterGrid = new Grid({
    columns: customerColumns,
    store: customerStore,

    listeners: {
        selectionChange({ selected }) {
            if (selected.length) {
                detailGrid.store.data = selected[0].orders.records;
            }
        }
    }
});

const detailGrid = new Grid({
    columns: orderColumns,
    store: { modelClass: Order }
});
```

---

## 14. Troubleshooting

### 14.1 Common Issues

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Nested data niet zichtbaar | dataField incorrect | Check field naam in model |
| Computed fields updaten niet | Geen change event | Trigger `afterChange()` |
| Widget type not found | Class niet registered | Call `initClass()` |
| autoHeight werkt niet | Container height fixed | Zet parent op `flex` |

### 14.2 Debug

```javascript
// Log nested store
console.log('Orders:', customer.orders.records);

// Check field definition
console.log('Fields:', Customer.fields);

// Inspect widget map
console.log('Widget:', grid.features.rowExpander.getWidget(record));
```

---

## Bronnen

- **Example**: `examples/master-detail/`
- **RowExpander**: `Grid.feature.RowExpander`
- **Store Fields**: `Core.data.field.StoreDataField`
- **GridRowModel**: `Grid.data.GridRowModel`

---

*Track A: Foundation - Grid Core Extensions (A1.6)*
