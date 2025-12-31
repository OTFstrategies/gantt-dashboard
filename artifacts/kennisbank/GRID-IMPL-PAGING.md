# Grid Implementation: Paging

> **Server-side paging** met remote pagination, AjaxStore configuratie, PagingToolbar, en server-side filtering/sorting.

---

## Overzicht

Server-side paging laadt data in pagina's van de server in plaats van alles in één keer. Dit is essentieel voor grote datasets.

```
┌─────────────────────────────────────────────────────────────┐
│ #     │ First name │ Surname  │ Score │ Rank │ Percent    │
├─────────────────────────────────────────────────────────────┤
│   1   │ John       │ Smith    │  85   │  3   │    75%     │
│   2   │ Jane       │ Doe      │  92   │  1   │    89%     │
│   ...                                                      │
│  25   │ Mike       │ Wilson   │  78   │  8   │    68%     │
├─────────────────────────────────────────────────────────────┤
│ ◀ ◁ Page 1 of 10 ▷ ▶          │ Showing 1-25 of 250       │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. AjaxStore Configuratie

### 1.1 Basis Paging Store

```javascript
import { AjaxStore, GridRowModel } from '@bryntum/grid';

const store = new AjaxStore({
    modelClass: GridRowModel,

    // Server endpoint
    readUrl: '/api/data',

    // Paging parameters
    pageParamName: 'page',       // ?page=1
    pageSize: 25,                // Records per pagina

    // Auto-load eerste pagina
    autoLoad: true
});
```

### 1.2 Complete Store Config

```javascript
const store = new AjaxStore({
    modelClass: GridRowModel,
    readUrl: '/api/data',

    // Paging
    pageParamName: 'page',
    pageSize: 25,

    // Sorting (server-side)
    sortParamName: 'sort',

    // Filtering (server-side)
    filterParamName: 'filter',

    autoLoad: true
});
```

---

## 2. Server Response Format

### 2.1 Expected JSON Response

```json
{
    "success": true,
    "total": 250,           // Totaal aantal records (voor pagination)
    "data": [
        { "id": 1, "firstName": "John", "surName": "Smith", "score": 85 },
        { "id": 2, "firstName": "Jane", "surName": "Doe", "score": 92 },
        // ... 25 records per page
    ]
}
```

### 2.2 Request Parameters

Server ontvangt:
```
GET /api/data?page=1&pageSize=25&sort=[{"field":"score","ascending":false}]&filter=[{"field":"firstName","value":"John"}]
```

---

## 3. Grid met PagingToolbar

### 3.1 Basis Grid Setup

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    store,

    features: {
        filter: true
    },

    columns: [
        { text: '#', width: 80, field: 'id', align: 'end' },
        { text: 'First name', field: 'firstName', flex: 1 },
        { text: 'Surname', field: 'surName', flex: 1 },
        { text: 'Score', field: 'score', type: 'number' },
        { text: 'Rank', field: 'rank', type: 'number' },
        { text: 'Percent', field: 'percent', type: 'percent', width: 150 }
    ],

    // Bottom bar met paging toolbar
    bbar: {
        type: 'pagingtoolbar'
    }
});
```

### 3.2 PagingToolbar met Extra Items

```javascript
bbar: {
    type: 'pagingtoolbar',
    items: {
        // Extra button toevoegen
        exportBtn: {
            type: 'button',
            text: 'Export',
            icon: 'fa fa-download',
            weight: 1000,  // Append aan het einde
            onClick: () => exportCurrentPage()
        }
    }
}
```

---

## 4. Toolbar Controls

### 4.1 Page Size Selector

```javascript
tbar: [
    {
        type: 'number',
        ref: 'fieldPageSize',
        label: 'Page size',
        value: 25,
        min: 10,
        max: 100,
        step: 5,
        width: '11em'
    },
    {
        type: 'number',
        ref: 'fieldRowCount',
        label: 'Total records',
        value: 250,
        min: 10,
        max: 1000
    },
    {
        type: 'button',
        text: 'Apply',
        icon: 'fa-check',
        async onClick() {
            store.pageSize = grid.widgetMap.fieldPageSize.value;
            await store.loadPage(1);
        }
    }
]
```

### 4.2 Page Navigation

```javascript
// Ga naar specifieke pagina
await store.loadPage(5);

// Volgende/vorige pagina
await store.nextPage();
await store.previousPage();

// Eerste/laatste pagina
await store.loadPage(1);
await store.loadPage(store.pageCount);
```

---

## 5. Server-Side Implementation

### 5.1 Node.js/Express Voorbeeld

```javascript
app.get('/api/data', (req, res) => {
    const {
        page = 1,
        pageSize = 25,
        sort,
        filter
    } = req.query;

    let data = [...allData];

    // Apply filters
    if (filter) {
        const filters = JSON.parse(filter);
        data = data.filter(record => {
            return filters.every(f => {
                const value = record[f.field];
                switch (f.operator) {
                    case '=': return value === f.value;
                    case '*': return String(value).includes(f.value);
                    default: return true;
                }
            });
        });
    }

    // Apply sorting
    if (sort) {
        const sorters = JSON.parse(sort);
        data.sort((a, b) => {
            for (const s of sorters) {
                const cmp = a[s.field] < b[s.field] ? -1 : a[s.field] > b[s.field] ? 1 : 0;
                if (cmp !== 0) return s.ascending ? cmp : -cmp;
            }
            return 0;
        });
    }

    // Pagination
    const startIdx = (page - 1) * pageSize;
    const pageData = data.slice(startIdx, startIdx + parseInt(pageSize));

    res.json({
        success: true,
        total: data.length,
        data: pageData
    });
});
```

### 5.2 PHP Voorbeeld

```php
<?php
$page = $_GET['page'] ?? 1;
$pageSize = $_GET['pageSize'] ?? 25;
$sort = isset($_GET['sort']) ? json_decode($_GET['sort'], true) : null;
$filter = isset($_GET['filter']) ? json_decode($_GET['filter'], true) : null;

// Query builder
$query = "SELECT * FROM employees";
$countQuery = "SELECT COUNT(*) as total FROM employees";

// Apply filters
if ($filter) {
    $whereClauses = [];
    foreach ($filter as $f) {
        $whereClauses[] = "{$f['field']} LIKE '%{$f['value']}%'";
    }
    $where = " WHERE " . implode(" AND ", $whereClauses);
    $query .= $where;
    $countQuery .= $where;
}

// Apply sorting
if ($sort) {
    $orderClauses = [];
    foreach ($sort as $s) {
        $dir = $s['ascending'] ? 'ASC' : 'DESC';
        $orderClauses[] = "{$s['field']} $dir";
    }
    $query .= " ORDER BY " . implode(", ", $orderClauses);
}

// Pagination
$offset = ($page - 1) * $pageSize;
$query .= " LIMIT $offset, $pageSize";

// Execute
$result = $db->query($query);
$total = $db->query($countQuery)->fetch_assoc()['total'];

echo json_encode([
    'success' => true,
    'total' => (int)$total,
    'data' => $result->fetch_all(MYSQLI_ASSOC)
]);
```

---

## 6. Mock Server (Development)

### 6.1 AjaxHelper.mockUrl

```javascript
import { AjaxHelper, CollectionFilter } from '@bryntum/grid';

let allData = DataGenerator.generateData(250);

AjaxHelper.mockUrl('/api/data', (url, params) => {
    const
        page = parseInt(params.page, 10),
        pageSize = parseInt(params.pageSize, 10),
        startIdx = (page - 1) * pageSize;

    let data = [...allData];

    // Filter
    if (params.filter) {
        const filters = JSON.parse(params.filter).map(f => {
            f.property = f.field;
            return new CollectionFilter(f);
        });
        data = data.filter(CollectionFilter.generateFiltersFunction(filters));
    }

    // Sort
    if (params.sort) {
        data.sort(store.createSorterFn(JSON.parse(params.sort)));
    }

    return {
        responseText: JSON.stringify({
            success: true,
            total: data.length,
            data: data.slice(startIdx, startIdx + pageSize)
        })
    };
});
```

---

## 7. Loading & Error States

### 7.1 Loading Indicator

```javascript
// Store events
store.on({
    beforeLoad() {
        grid.mask('Loading...');
    },
    load() {
        grid.unmask();
    },
    exception({ error }) {
        grid.unmask();
        Toast.show(`Error: ${error.message}`);
    }
});
```

### 7.2 Empty State

```javascript
const grid = new Grid({
    emptyText: 'No records found',
    // ...
});
```

---

## 8. Infinite Scroll Alternative

```javascript
// Voor continue scroll in plaats van pages
const grid = new Grid({
    features: {
        infiniteScroll: true
    },

    store: {
        readUrl: '/api/data',
        pageSize: 50,
        autoLoad: true
    }
});
```

---

## 9. Performance Tips

### 9.1 Optimal Page Size

```javascript
// Regel: pageSize = zichtbare rows + buffer
const visibleRows = Math.ceil(containerHeight / rowHeight);
const optimalPageSize = visibleRows + 10;
```

### 9.2 Debounce Filter Requests

```javascript
features: {
    filter: {
        // Wacht tot user stopt met typen
        keyStrokeChangeDelay: 300
    }
}
```

### 9.3 Cache Pages

```javascript
const store = new AjaxStore({
    // Cache geladen pagina's
    cachePages: true,
    // Max gecachte pagina's
    maxPageCache: 5
});
```

---

## 10. React Integratie

```jsx
import { BryntumGrid } from '@bryntum/grid-react';

function PagedGrid() {
    const [pageSize, setPageSize] = useState(25);

    const storeConfig = useMemo(() => ({
        readUrl: '/api/data',
        pageParamName: 'page',
        sortParamName: 'sort',
        filterParamName: 'filter',
        pageSize,
        autoLoad: true
    }), [pageSize]);

    return (
        <BryntumGrid
            columns={columns}
            store={storeConfig}
            features={{ filter: true }}
            bbar={{ type: 'pagingtoolbar' }}
        />
    );
}
```

---

## 11. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Geen pagination | `total` ontbreekt in response | Return `total` count van server |
| Page count incorrect | Client-side filtering | Gebruik server-side filtering |
| Sort reset bij page | sortParamName niet gezet | Configureer `sortParamName` |
| Dubbele requests | autoLoad + manual load | Disable één van beide |

---

## 12. API Reference

### 12.1 AjaxStore Paging Properties

| Property | Type | Description |
|----------|------|-------------|
| `pageSize` | Number | Records per pagina |
| `pageParamName` | String | URL parameter voor page number |
| `currentPage` | Number | Huidige pagina (read-only) |
| `pageCount` | Number | Totaal aantal pagina's (read-only) |

### 12.2 PagingToolbar Items

| Item | Description |
|------|-------------|
| `firstPageButton` | Ga naar eerste pagina |
| `previousPageButton` | Ga naar vorige pagina |
| `pageNumber` | Pagina nummer input |
| `nextPageButton` | Ga naar volgende pagina |
| `lastPageButton` | Ga naar laatste pagina |
| `reloadButton` | Herlaad huidige pagina |
| `spacer` | Separator |
| `pageCount` | "Page X of Y" tekst |
| `separator` | Visual separator |
| `summary` | "Showing X-Y of Z" tekst |

---

## Bronnen

- **Example**: `examples/paged/`
- **AjaxStore**: `Core.data.AjaxStore`
- **PagingToolbar**: `Core.widget.PagingToolbar`

---

*Track A: Foundation - Grid Core Extensions (A1.9)*
