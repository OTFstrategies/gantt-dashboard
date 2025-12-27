# Grid Implementation: Virtual Scrolling

> **Implementatie guide** voor high-performance rendering in Bryntum Grid: virtuele rendering, lazy loading, buffer zones, en big data optimalisaties.

---

## Overzicht

Bryntum Grid gebruikt **virtual rendering** om grote datasets efficiënt te tonen. In plaats van alle rijen in de DOM te plaatsen, worden alleen zichtbare rijen gerenderd plus een buffer.

```
┌─────────────────────────────────────┐
│        Buffer Zone (boven)          │  ← Voorgeladen rijen
├─────────────────────────────────────┤
│                                     │
│        Zichtbare Viewport           │  ← Gerenderde rijen
│                                     │
├─────────────────────────────────────┤
│        Buffer Zone (onder)          │  ← Voorgeladen rijen
└─────────────────────────────────────┘
```

---

## 1. Virtual Rendering Basics

### 1.1 Hoe Het Werkt

1. **RowManager** beheert een pool van DOM row elementen
2. Alleen zichtbare rijen + buffer worden gerenderd
3. Bij scrollen worden rijen **hergebruikt** (recycled)
4. Data wordt **on-demand** aan rows gekoppeld

### 1.2 Default Configuratie

```javascript
const grid = new Grid({
    // Default virtual rendering is AAN
    // Geen speciale configuratie nodig

    columns: [...],
    store: {
        data: largeDataset  // 100k+ records
    }
});
```

---

## 2. Performance Optimalisaties

### 2.1 Fixed Row Height

```javascript
const grid = new Grid({
    // Vaste rij hoogte = snellere berekeningen
    fixedRowHeight: true,

    // Optioneel: specifieke hoogte
    rowHeight: 40
});
```

**Waarom?**
- Geen hoogte-meting per rij nodig
- Snellere scroll positie berekeningen
- Betere virtualisatie performance

### 2.2 useRawData

```javascript
store: {
    // Skip data transformaties voor snellere load
    useRawData: true
}

// Advanced config
store: {
    useRawData: {
        disableDuplicateIdCheck : true,  // Skip ID check
        disableDefaultValue     : true,  // Skip default values
        disableTypeConversion   : true   // Skip type conversion
    }
}
```

**Vereisten voor useRawData:**
- Data moet correct geformatteerd zijn
- IDs moeten uniek zijn
- Geen default values nodig
- Types moeten correct zijn

### 2.3 Data Generator Pattern

```javascript
import { DataGenerator, AsyncHelper } from '@bryntum/grid';

async function generateLargeDataset(count) {
    const
        rows     = [],
        interval = 10000;

    const iterator = DataGenerator.generate(count);
    let step;

    while ((step = iterator.next()) && !step.done) {
        rows.push(step.value);

        // Yield to UI every interval
        if (rows.length % interval === 0) {
            await AsyncHelper.animationFrame();
        }
    }

    return rows;
}
```

---

## 3. Lazy Loading (Server-Side)

### 3.1 Configuration

```javascript
const grid = new Grid({
    features: {
        group: false                    // Grouping niet ondersteund met lazyLoad
    },

    store: {
        lazyLoad: true,

        // Server endpoints
        readUrl  : '/api/read',
        createUrl: '/api/create',
        updateUrl: '/api/update',
        deleteUrl: '/api/delete',

        autoLoad  : true,
        autoCommit: true,

        // Parameter namen
        sortParamName  : 'sort',
        filterParamName: 'filter'
    }
});
```

### 3.2 Lazy Load Config

```javascript
store: {
    lazyLoad: {
        chunkSize: 100                  // Records per request
    }
}
```

### 3.3 Server Response Format

```json
{
    "success": true,
    "total": 10000,
    "data": [
        { "id": 1, "name": "Record 1", ... },
        { "id": 2, "name": "Record 2", ... }
    ]
}
```

### 3.4 Lazy Load Events

```javascript
store: {
    lazyLoad: true,
    listeners: {
        lazyLoadStarted() {
            showLoadingIndicator();
        },
        lazyLoadEnded() {
            hideLoadingIndicator();
        }
    }
}
```

---

## 4. Browser Height Limits

### 4.1 Maximum Scroll Height

Browsers hebben een maximum element height (~33.5 miljoen pixels).

```javascript
// Auto-adjust row height voor extreme datasets
async function generateRows(count) {
    const maxHeight = 33554400;  // Browser limit

    if (count * grid.rowHeight > maxHeight) {
        grid.rowHeight = Math.floor(maxHeight / count) - 1;
    }

    // Generate data...
}
```

### 4.2 Praktische Limits

| Browser | Max Height | ~Max Rows (40px) |
|---------|------------|------------------|
| Chrome  | 33.5M px   | ~838,000 |
| Firefox | 17.8M px   | ~445,000 |
| Safari  | 33.5M px   | ~838,000 |

---

## 5. Scroll API

### 5.1 Scroll Methods

```javascript
// Scroll naar top
grid.scrollToTop();

// Scroll naar bottom
grid.scrollToBottom();

// Scroll naar specifieke rij
grid.scrollRowIntoView(record, {
    animate: {
        easing  : 'easeOutBounce',
        duration: 2000
    },
    highlight: true
});

// Scroll naar rij index
grid.scrollRowIntoView(grid.store.getAt(500));

// Scroll naar cell
grid.scrollCellIntoView({
    record : record,
    column : grid.columns.get('name')
});
```

### 5.2 Scroll Events

```javascript
listeners: {
    scroll({ scrollTop, scrollLeft }) {
        console.log('Scrolled to:', scrollTop);
    },

    horizontalScroll({ scrollLeft }) {
        console.log('Horizontal scroll:', scrollLeft);
    }
}
```

---

## 6. Remote Sorting & Filtering

### 6.1 Configuration

```javascript
store: {
    remoteSort  : true,                 // Server-side sorting
    remoteFilter: true,                 // Server-side filtering

    readUrl: '/api/data',

    // Automatisch bij sort/filter change
    autoLoad: true
}
```

### 6.2 Server Request Parameters

```javascript
// Sort request
GET /api/data?sort=[{"field":"name","ascending":true}]

// Filter request
GET /api/data?filter=[{"field":"age","operator":">","value":25}]
```

### 6.3 Filter Operators (voor server)

```javascript
features: {
    filter: {
        allowedOperators: ['*', '=', '<', '>']
    }
}
```

---

## 7. Paging (Alternative to Virtual)

### 7.1 Configuration

```javascript
store: {
    pageSize: 50,
    autoLoad: true,
    readUrl : '/api/data'
}
```

### 7.2 Pager Widget

```javascript
bbar: [
    { type: 'pagingtoolbar' }
]
```

---

## 8. Performance Tips

### 8.1 Renderer Optimalisaties

```javascript
// GOED: Return DomConfig
renderer({ value }) {
    return {
        className: 'status',
        text     : value
    };
}

// SLECHT: DOM manipulatie
renderer({ value, cellElement }) {
    cellElement.innerHTML = `<div class="status">${value}</div>`;
}
```

### 8.2 Vermijd in Renderers

- Heavy calculations
- Synchrone API calls
- Complex DOM queries
- Grote string concatenaties

### 8.3 Pre-Calculate in Model

```javascript
class MyModel extends Model {
    static fields = [
        'rawValue',
        {
            name     : 'displayValue',
            calculate: record => heavyCalculation(record.rawValue)
        }
    ];
}

// Renderer is nu simpel
{
    field   : 'displayValue',
    renderer: ({ value }) => value
}
```

---

## 9. autoSyncHtml

### 9.1 Efficiënte Updates

```javascript
{
    autoSyncHtml: true,                 // Alleen gewijzigde delen updaten
    htmlEncode  : false,
    renderer({ value }) {
        return `<div class="cell-content">${value}</div>`;
    }
}
```

---

## 10. Batch Operations

### 10.1 Suspend Refreshes

```javascript
// Suspend refreshes voor bulk updates
grid.suspendRefresh();

// Bulk operations
grid.store.add([...]);
grid.store.remove([...]);
records.forEach(r => r.set('status', 'done'));

// Resume en refresh één keer
grid.resumeRefresh(true);
```

### 10.2 beginBatch/endBatch

```javascript
grid.store.beginBatch();

// Multiple operations
grid.store.data = newData;
grid.store.sort('name');
grid.store.filter('status', 'active');

grid.store.endBatch();  // Single refresh
```

---

## 11. TypeScript Interfaces

```typescript
interface LazyLoadConfig {
    chunkSize?: number;
}

interface AjaxStoreConfig {
    lazyLoad?: boolean | LazyLoadConfig;
    useRawData?: boolean | {
        disableDuplicateIdCheck?: boolean;
        disableDefaultValue?: boolean;
        disableTypeConversion?: boolean;
    };
    remoteSort?: boolean;
    remoteFilter?: boolean;
    pageSize?: number;
    readUrl?: string;
    createUrl?: string;
    updateUrl?: string;
    deleteUrl?: string;
    sortParamName?: string;
    filterParamName?: string;
}

interface GridConfig {
    fixedRowHeight?: boolean;
    rowHeight?: number;
}

interface ScrollOptions {
    animate?: boolean | {
        easing?: string;
        duration?: number;
    };
    highlight?: boolean;
    block?: 'start' | 'end' | 'center' | 'nearest';
}
```

---

## 12. Complete Example

```javascript
import { Grid, Mask, DataGenerator, AsyncHelper } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    // Performance optimalisaties
    fixedRowHeight: true,
    rowHeight     : 40,

    store: {
        useRawData: true                // Skip transformaties
    },

    columns: [
        { type: 'rownumber', width: 80 },
        { text: 'Name', field: 'name', flex: 1 },
        { text: 'City', field: 'city', flex: 1 },
        { text: 'Age', field: 'age', width: 100, type: 'number' },
        { text: 'Score', field: 'score', width: 100, type: 'number' }
    ],

    tbar: [
        {
            type    : 'number',
            label   : 'Records',
            value   : 10000,
            min     : 1000,
            max     : 500000,
            onChange: ({ value }) => loadData(value)
        },
        {
            type    : 'button',
            text    : 'Scroll to top',
            onClick : () => grid.scrollToTop()
        },
        {
            type    : 'button',
            text    : 'Scroll to bottom',
            onClick : () => grid.scrollToBottom()
        }
    ]
});

async function loadData(count) {
    const mask = Mask.mask('Generating...', grid.element);

    const rows = [];
    const iterator = DataGenerator.generate(count);
    let step;

    while ((step = iterator.next()) && !step.done) {
        rows.push(step.value);

        if (rows.length % 10000 === 0) {
            mask.text = `Generated ${rows.length}/${count}`;
            await AsyncHelper.animationFrame();
        }
    }

    grid.store.data = rows;
    mask.close();
}

// Initial load
loadData(10000);
```

---

## 13. Lazy Load Server Example (Node.js)

```javascript
// Express.js backend
const express = require('express');
const app = express();

let allData = []; // 100k records

app.get('/api/read', (req, res) => {
    const {
        startIndex = 0,
        count = 100,
        sort,
        filter
    } = req.query;

    let data = [...allData];

    // Apply filters
    if (filter) {
        const filters = JSON.parse(filter);
        filters.forEach(f => {
            data = data.filter(record => {
                switch (f.operator) {
                    case '=': return record[f.field] === f.value;
                    case '>': return record[f.field] > f.value;
                    case '<': return record[f.field] < f.value;
                    case '*': return String(record[f.field]).includes(f.value);
                }
            });
        });
    }

    // Apply sort
    if (sort) {
        const sorters = JSON.parse(sort);
        sorters.forEach(s => {
            data.sort((a, b) => {
                const result = a[s.field] > b[s.field] ? 1 : -1;
                return s.ascending ? result : -result;
            });
        });
    }

    // Return chunk
    res.json({
        success: true,
        total  : data.length,
        data   : data.slice(startIndex, startIndex + count)
    });
});

app.listen(3000);
```

---

## Referenties

- Examples: `grid-7.1.0-trial/examples/bigdataset/`
- Examples: `grid-7.1.0-trial/examples/infinite-scroll/`
- TypeScript: `grid.d.ts` lines 3399-3403 (lazyLoad)
- TypeScript: `grid.d.ts` lines 3672-3677 (useRawData)

---

*Document gegenereerd: December 2024*
*Bryntum Grid versie: 7.1.0*
