# Grid Implementation: Custom Renderers

> **Custom Renderers** voor het aanpassen van cel- en header-weergave.

---

## Overzicht

Bryntum Grid biedt uitgebreide renderer mogelijkheden voor cellen en headers.

```
+--------------------------------------------------------------------------+
| GRID                                                                      |
+--------------------------------------------------------------------------+
|  Name          [ADD] |  Age  | City       | - FOOD - | Color    | Score  |
+--------------------------------------------------------------------------+
|  John Doe           | [32]  | Paris      | Pizza    | [████] O | ███ 850|
|  Jane Smith         | [28]  | London     | Sushi    | [████] P | ██ 720 |
|  Bob Wilson         | [45]  | Berlin     | Pasta    | [████] B | █ 350  |
+--------------------------------------------------------------------------+
|                                                                          |
|  RENDERER TYPES:                                                         |
|    [ADD] = Button in header (headerRenderer)                             |
|    [32]  = Badge renderer (custom renderer)                              |
|    [████] = Color box with gradient (cell background)                    |
|    ███   = Progress bar renderer                                         |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Renderer Setup

### 1.1 Various Renderer Types

```javascript
import { Grid, DataGenerator, EventHelper, StringHelper } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',
    features: {
        sort: 'name'
    },

    columns: [
        {
            text: 'Name',
            field: 'name',
            flex: 1,
            cellCls: 'name',
            // Header with button
            headerRenderer: () => {
                return `<label>Name</label>
                    <button class="addnew b-button-outlined b-button b-text" style="width: 4em">ADD</button>`;
            }
        },
        {
            type: 'number',
            text: 'Age',
            field: 'age',
            width: 80,
            cellCls: 'age',
            align: 'center',
            htmlEncode: false,
            // Badge renderer
            renderer: ({ value = '' }) => StringHelper.xss`<div class="badge">${value}</div>`
        },
        {
            text: 'City',
            field: 'city',
            icon: 'fa fa-map-marker',
            flex: 1
        },
        {
            text: 'Food',
            field: 'food',
            flex: 1,
            // Dynamic header styling
            headerRenderer: ({ column, headerElement }) => {
                headerElement.style.color = '#00a164';
                headerElement.style.fontWeight = '700';
                return `- ${column.L('Food').toLocaleUpperCase()} -`;
            }
        },
        {
            text: 'Color',
            field: 'color',
            cls: 'color',
            flex: 1,
            htmlEncode: false,
            alwaysClearCell: false,
            // Color box renderer
            renderer: ({ value = '', cellElement }) => {
                cellElement.innerHTML = StringHelper.xss`<div class="color-box"></div>${value}`;
                cellElement.firstElementChild.style.setProperty(
                    '--b-primary',
                    `var(--b-color-${value.toLowerCase()})`
                );
            }
        },
        {
            type: 'number',
            text: 'Score',
            field: 'score',
            flex: 1,
            cls: 'score',
            icon: 'fa fa-trophy',
            // Underlined header
            headerRenderer: ({ column }) => StringHelper.xss`<u>${column.text}</u>`,
            // Progress bar background
            renderer: ({ value, cellElement }) => {
                if (isNaN(value)) return '';

                const percent = value / 1000 * 100;
                const from = 'var(--b-primary-90)';
                const to = 'rgba(255,255,255,0)';

                cellElement.style.background = `linear-gradient(to right, ${from} 0%, ${from} ${percent}%, ${to} ${percent}%)`;

                return value;
            }
        }
    ],

    data: DataGenerator.generateData(250)
});
```

---

## 2. Header Button Event

### 2.1 Listen for Header Button Click

```javascript
listeners: {
    paint({ firstPaint }) {
        if (firstPaint) {
            EventHelper.on({
                element: this.element,
                delegate: 'button.addnew',
                click: event => {
                    event.stopPropagation();

                    const [newRecord] = this.store.add({
                        name: 'New user'
                    });

                    this.features.cellEdit.startEditing({
                        record: newRecord,
                        field: 'name'
                    });
                },
                capture: true,
                thisObj: this
            });
        }
    }
}
```

---

## 3. Renderer Return Types

### 3.1 String Return

```javascript
renderer: ({ value }) => {
    return `<strong>${value}</strong>`;
}
```

### 3.2 DOM Config Object

```javascript
renderer: ({ value }) => {
    return {
        tag: 'div',
        class: 'custom-wrapper',
        children: [
            { tag: 'span', class: 'icon', html: '★' },
            { tag: 'span', class: 'value', text: value }
        ]
    };
}
```

### 3.3 Direct DOM Manipulation

```javascript
renderer: ({ value, cellElement }) => {
    cellElement.innerHTML = `<div class="custom">${value}</div>`;
    cellElement.style.background = value > 50 ? '#4CAF50' : '#f44336';
    // Return nothing when manipulating directly
}
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { StringHelper, EventHelper } from '@bryntum/grid';
import { useRef, useCallback, useEffect } from 'react';

function GridWithRenderers({ data }) {
    const gridRef = useRef(null);

    useEffect(() => {
        const grid = gridRef.current?.instance;
        if (!grid) return;

        // Setup header button listener
        const cleanup = EventHelper.on({
            element: grid.element,
            delegate: 'button.addnew',
            click: (event) => {
                event.stopPropagation();
                const [newRecord] = grid.store.add({ name: 'New user' });
                grid.features.cellEdit.startEditing({
                    record: newRecord,
                    field: 'name'
                });
            },
            capture: true
        });

        return () => cleanup();
    }, []);

    const ageRenderer = useCallback(({ value = '' }) => {
        return StringHelper.xss`<div class="badge">${value}</div>`;
    }, []);

    const scoreRenderer = useCallback(({ value, cellElement }) => {
        if (isNaN(value)) return '';

        const percent = (value / 1000) * 100;
        cellElement.style.background = `linear-gradient(to right,
            rgba(76, 175, 80, 0.3) 0%,
            rgba(76, 175, 80, 0.3) ${percent}%,
            transparent ${percent}%
        )`;

        return value;
    }, []);

    const colorRenderer = useCallback(({ value = '', cellElement }) => {
        cellElement.innerHTML = StringHelper.xss`
            <div class="color-box" style="background: var(--b-color-${value.toLowerCase()})"></div>
            ${value}
        `;
    }, []);

    const headerWithButton = useCallback(() => {
        return `<label>Name</label>
            <button class="addnew b-button">ADD</button>`;
    }, []);

    const gridConfig = {
        features: {
            sort: 'name'
        },

        columns: [
            {
                text: 'Name',
                field: 'name',
                flex: 1,
                headerRenderer: headerWithButton
            },
            {
                text: 'Age',
                field: 'age',
                width: 80,
                align: 'center',
                htmlEncode: false,
                renderer: ageRenderer
            },
            { text: 'City', field: 'city', flex: 1 },
            {
                text: 'Color',
                field: 'color',
                flex: 1,
                htmlEncode: false,
                renderer: colorRenderer
            },
            {
                text: 'Score',
                field: 'score',
                flex: 1,
                type: 'number',
                renderer: scoreRenderer
            }
        ]
    };

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

## 5. Styling

```css
/* Badge styling */
.badge {
    display: inline-block;
    padding: 4px 12px;
    background: #1976d2;
    color: white;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
}

/* Color box */
.color-box {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    display: inline-block;
    vertical-align: middle;
    margin-right: 8px;
    background: var(--b-primary, #ccc);
}

/* Progress bar cell */
.score .b-grid-cell {
    position: relative;
}

/* Header button */
.b-grid-header button.addnew {
    margin-left: auto;
    font-size: 10px;
    padding: 2px 8px;
}

/* Custom header styling */
.b-grid-header[data-column-id="food"] {
    letter-spacing: 2px;
}

/* Icon in header */
.b-grid-header .fa {
    margin-right: 8px;
}

/* Name column */
.name .b-grid-cell {
    font-weight: 500;
}

/* Age column badge hover */
.age .b-grid-cell:hover .badge {
    background: #0d47a1;
    transform: scale(1.1);
}

/* Score gradient */
.score .b-grid-cell {
    transition: background 0.3s;
}

/* Underlined header */
.b-grid-header u {
    text-decoration-color: var(--b-primary);
    text-decoration-thickness: 2px;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| HTML niet gerenderd | htmlEncode: true | Zet htmlEncode: false |
| Renderer niet aangeroepen | Field niet in data | Check field naam |
| Header button werkt niet | Event niet gedelegeerd | Gebruik EventHelper.on |
| Style niet toegepast | cellCls niet gezet | Voeg cellCls toe |

---

## API Reference

### Renderer Function Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | Any | Cell value |
| `record` | Model | Row record |
| `column` | Column | Column config |
| `cellElement` | HTMLElement | Cell element |
| `row` | Row | Row instance |
| `grid` | Grid | Grid instance |

### HeaderRenderer Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `column` | Column | Column config |
| `headerElement` | HTMLElement | Header element |

### Column Config for Renderers

| Property | Type | Description |
|----------|------|-------------|
| `renderer` | Function | Cell renderer |
| `headerRenderer` | Function | Header renderer |
| `htmlEncode` | Boolean | Encode HTML (default: true) |
| `cellCls` | String | CSS class for cells |
| `cls` | String | CSS class for column |
| `alwaysClearCell` | Boolean | Clear before render |

---

## Bronnen

- **Example**: `examples/renderers/`
- **Column**: `Grid.column.Column`
- **StringHelper**: `Core.helper.StringHelper`

---

*Priority 2: Medium Priority Features*
