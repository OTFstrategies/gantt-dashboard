# Grid Implementation: Auto Height

> **Auto Height** voor automatische rijhoogte gebaseerd op celinhoud.

---

## Overzicht

Bryntum Grid kan automatisch rijhoogtes aanpassen gebaseerd op de inhoud van cellen.

```
+--------------------------------------------------------------------------+
| GRID                                                                      |
+--------------------------------------------------------------------------+
|  Customer           |  Company    |  E-mail         |  City    |  Notes  |
+--------------------------------------------------------------------------+
| [CD] Clarence       |             |                 |          | One of  |
|      Diggings       | Fancy Pants | clarence@...    | Bristol  | our     |
|      Gold member    |             |                 |          | most... |
+--------------------------------------------------------------------------+
| [DE] Donald Evans   | Excellent   | donald@...      | Notting  |         |
|      Silver member  | Suits       |                 | ham      |         |
+--------------------------------------------------------------------------+
| [EF] Elizabeth      | Excellent   | elizabeth@...   | Ports    | Espec-  |
|      Frank          | Suits       |                 | mouth    | ially   |
|      Gold member    |             |                 |          | fond... |
+--------------------------------------------------------------------------+
|                                                                          |
|  AUTO HEIGHT COLUMNS:                                                    |
|    autoHeight: true - Enables automatic row height                       |
|    NOTE: Performance cost for large datasets                             |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Auto Height Setup

### 1.1 Column with Auto Height

```javascript
import { Grid, StringHelper } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        stripe: true
    },

    columns: [
        {
            text: 'Customer',
            field: 'name',
            minWidth: 200,
            flex: 2,
            // Enable automatic row height based on cell contents
            // NOTE: Comes with a performance cost for rendering
            autoHeight: true,
            htmlEncode: false,
            // Custom renderer with multi-line content
            renderer({ record }) {
                return [
                    // Avatar with initials
                    {
                        className: 'initials',
                        style: { background: record.color },
                        text: record.name?.split(' ')?.map(name => name[0]).join('')
                    },
                    {
                        children: [
                            // Name
                            { className: 'name', text: record.name },
                            // Membership level
                            { className: 'membership', text: `${record.membershipLevel || ''} member` }
                        ]
                    }
                ];
            }
        },
        {
            text: 'Company',
            field: 'company',
            flex: 1
        },
        {
            text: 'E-mail',
            field: 'email',
            width: 240,
            htmlEncode: false,
            renderer({ value }) {
                return StringHelper.xss`<a href="mailto:${value}">${value}</a>`;
            }
        },
        {
            text: 'City',
            field: 'city',
            cellCls: 'city',
            flex: 1,
            htmlEncode: false,
            renderer({ value }) {
                return StringHelper.xss`
                    <a href="https://www.google.com/maps/place/${value}" target="_blank">
                        <i class="fa fa-location-dot"></i>
                        <span>${value}</span>
                    </a>
                `;
            }
        },
        {
            text: 'Notes',
            field: 'notes',
            cellCls: 'notes',
            flex: 1,
            minWidth: 200,
            editor: 'textarea',
            // Enable automatic row height
            autoHeight: true
        }
    ],

    data: [
        {
            id: 1,
            name: 'Clarence Diggings',
            membershipLevel: 'Gold',
            color: 'crimson',
            email: 'clarence@fancypants.mail',
            city: 'Bristol',
            company: 'Fancy Pants ltd',
            notes: 'One of our most appreciated customers. Loves our new line of knitting equipment'
        },
        {
            id: 2,
            name: 'Donald Evans',
            membershipLevel: 'Silver',
            color: 'blueviolet',
            email: 'donald@excellentsuits.mail',
            city: 'Nottingham',
            company: 'Excellent Suits plc',
            notes: ''
        }
    ]
});
```

---

## 2. Performance Considerations

### 2.1 When to Use Auto Height

```javascript
// Good: Limited rows with text content
columns: [
    {
        text: 'Description',
        field: 'description',
        autoHeight: true,  // OK for small datasets
        flex: 1
    }
]

// Bad: Large datasets - consider fixed height
const grid = new Grid({
    // For large datasets, use fixed row height
    rowHeight: 60,

    columns: [
        {
            text: 'Notes',
            field: 'notes',
            // Use CSS truncation instead of autoHeight
            cellCls: 'truncate-cell'
        }
    ]
});
```

### 2.2 Mixed Approach

```javascript
columns: [
    // Fixed height column
    { text: 'Name', field: 'name', width: 200 },

    // Auto height only where needed
    {
        text: 'Notes',
        field: 'notes',
        autoHeight: true,  // Only this column triggers height calculation
        flex: 1
    }
]
```

---

## 3. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { StringHelper } from '@bryntum/grid';
import { useMemo, useCallback } from 'react';

function AutoHeightGrid({ data }) {
    const customerRenderer = useCallback(({ record }) => {
        const initials = record.name?.split(' ')?.map(n => n[0]).join('') || '';
        return [
            {
                className: 'initials',
                style: { background: record.color },
                text: initials
            },
            {
                children: [
                    { className: 'name', text: record.name },
                    { className: 'membership', text: `${record.membershipLevel} member` }
                ]
            }
        ];
    }, []);

    const emailRenderer = useCallback(({ value }) => {
        return StringHelper.xss`<a href="mailto:${value}">${value}</a>`;
    }, []);

    const cityRenderer = useCallback(({ value }) => {
        return StringHelper.xss`
            <a href="https://maps.google.com/place/${value}" target="_blank">
                <i class="fa fa-map-marker"></i> ${value}
            </a>
        `;
    }, []);

    const gridConfig = useMemo(() => ({
        features: {
            stripe: true
        },

        columns: [
            {
                text: 'Customer',
                field: 'name',
                minWidth: 200,
                flex: 2,
                autoHeight: true,
                htmlEncode: false,
                renderer: customerRenderer
            },
            { text: 'Company', field: 'company', flex: 1 },
            {
                text: 'E-mail',
                field: 'email',
                width: 240,
                htmlEncode: false,
                renderer: emailRenderer
            },
            {
                text: 'City',
                field: 'city',
                flex: 1,
                htmlEncode: false,
                renderer: cityRenderer
            },
            {
                text: 'Notes',
                field: 'notes',
                flex: 1,
                minWidth: 200,
                autoHeight: true,
                editor: 'textarea'
            }
        ]
    }), [customerRenderer, emailRenderer, cityRenderer]);

    return (
        <BryntumGrid
            data={data}
            {...gridConfig}
        />
    );
}
```

---

## 4. Styling

```css
/* Customer cell with initials */
.b-grid-cell .initials {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 14px;
    margin-right: 12px;
    flex-shrink: 0;
}

.b-grid-cell .name {
    font-weight: 500;
    font-size: 14px;
}

.b-grid-cell .membership {
    font-size: 12px;
    color: #666;
    margin-top: 2px;
}

/* City link */
.city .b-grid-cell a {
    color: #1976d2;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
}

.city .b-grid-cell a:hover {
    text-decoration: underline;
}

/* Notes cell with wrapping */
.notes .b-grid-cell {
    white-space: normal;
    line-height: 1.4;
    padding: 8px 12px;
}

/* Auto height row styling */
.b-grid-row {
    min-height: 48px;
}

/* Ensure content wraps properly */
.b-grid-cell {
    display: flex;
    align-items: center;
}

/* Truncation fallback for fixed height */
.truncate-cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Email link */
.b-grid-cell a[href^="mailto:"] {
    color: #1976d2;
    text-decoration: none;
}

.b-grid-cell a[href^="mailto:"]:hover {
    text-decoration: underline;
}
```

---

## 5. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Rijen passen niet aan | autoHeight niet gezet | Voeg autoHeight: true toe aan column |
| Slechte performance | Teveel autoHeight kolommen | Beperk tot 1-2 kolommen |
| Inhoud afgesneden | white-space: nowrap | Zet white-space: normal in CSS |
| Editor past niet | textarea niet gebruikt | Gebruik editor: 'textarea' |

---

## API Reference

### Column Config for Auto Height

| Property | Type | Description |
|----------|------|-------------|
| `autoHeight` | Boolean | Enable auto row height |
| `minWidth` | Number | Minimum column width |
| `cellCls` | String | CSS class for cells |
| `htmlEncode` | Boolean | Encode HTML in cells |

### Grid Config

| Property | Type | Description |
|----------|------|-------------|
| `rowHeight` | Number | Fixed row height (alternative) |

### Renderer Return Types

```javascript
// Array of DOM config objects
renderer({ record }) {
    return [
        { className: 'icon', html: '★' },
        { className: 'text', text: record.name }
    ];
}

// Nested children
renderer({ record }) {
    return {
        children: [
            { tag: 'div', className: 'line1', text: record.name },
            { tag: 'div', className: 'line2', text: record.role }
        ]
    };
}
```

---

## Bronnen

- **Example**: `examples/autoheight/`
- **Column**: `Grid.column.Column`

---

*Priority 2: Medium Priority Features*
