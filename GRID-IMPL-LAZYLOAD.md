# Grid Implementation: Lazy Load (Infinite Scroll)

> **Lazy Load** voor het laden van data op aanvraag tijdens scrollen.

---

## Overzicht

Bryntum Grid ondersteunt lazy loading van data via server-side paginering en filtering.

```
+--------------------------------------------------------------------------+
| GRID                            Network: [Loading...] [Reset] [Add]      |
+--------------------------------------------------------------------------+
|  Sort | Id |  Name            |  Age  |  City        |  Email            |
+--------------------------------------------------------------------------+
|   1   | 42 | [img] John Doe   |  32   | [🇺🇸] SF     | john@mail.com     |
|   2   | 43 | [JD] Jane Doe    |  28   | [🇫🇷] Paris  | jane@mail.com     |
|   3   | 44 | [BW] Bob Wilson  |  45   | [🇸🇪] Stock  | bob@mail.com      |
|  ...  |... | ...              |  ...  | ...          | ...               |
|       |    | [Loading more...] |       |              |                   |
+--------------------------------------------------------------------------+
|                                                                          |
|  LAZY LOAD FLOW:                                                         |
|    1. Initial load: First page of data                                   |
|    2. User scrolls: Trigger lazyLoadStarted event                        |
|    3. Fetch data: Server request with offset/limit                       |
|    4. Append data: Add to store, trigger lazyLoadEnded                   |
|    5. Sorting/Filtering: Server-side with parameters                     |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Lazy Load Setup

### 1.1 Configure Lazy Load Store

```javascript
import { StringHelper, Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    selectionMode: { rowNumber: true },

    features: {
        // Grouping is not supported when using a lazyLoad store
        group: false,
        filter: { allowedOperators: ['*', '=', '<', '>'] }
    },

    columns: [
        { text: 'Sort', field: 'sortIndex', align: 'center' },
        { text: 'Id', field: 'id', hidden: true },
        {
            text: 'Name',
            field: 'name',
            htmlEncode: false,
            flex: 2,
            renderer({ value, record: { id } }) {
                if (value) {
                    const nameParts = value.split(' ');
                    const firstName = nameParts[0].toLowerCase();
                    const initials = value[0] + (nameParts?.length > 1 ? nameParts.reverse()[0][0] : '');

                    // Return avatar with name
                    return [{
                        class: 'avatar',
                        text: initials
                    }, value];
                }
            }
        },
        {
            text: 'Age',
            field: 'age',
            width: 100,
            type: 'number',
            align: 'center'
        },
        {
            text: 'City',
            field: 'city',
            flex: 1,
            renderer({ value }) {
                return StringHelper.xss`${value}`;
            }
        },
        {
            text: 'Email',
            field: 'email',
            flex: 2,
            htmlEncode: false,
            renderer: ({ value }) => {
                return StringHelper.xss`<a href="mailto:${value}">${value}</a>`;
            }
        }
    ],

    store: {
        // Enable lazy loading
        lazyLoad: true,

        // API endpoints
        readUrl: './api/read',
        createUrl: './api/create',
        deleteUrl: './api/delete',
        updateUrl: './api/update',

        autoLoad: true,
        autoCommit: true,

        // Query parameter names
        sortParamName: 'sort',
        filterParamName: 'filter',

        listeners: {
            lazyLoadStarted() {
                updateNetworkStatus('Loading', 'var(--b-primary)');
            },
            lazyLoadEnded() {
                updateNetworkStatus('Idle');
            },
            beforeCommit() {
                updateNetworkStatus('Committing', 'var(--b-color-red)');
            },
            commit() {
                updateNetworkStatus('Idle');
            }
        }
    }
});

const updateNetworkStatus = (text = 'Idle', color = '') => {
    const { networkValue } = grid.widgetMap;
    networkValue.html = text;
    networkValue.element.style.color = color;
};
```

---

## 2. Toolbar with Network Status

### 2.1 Network Status and Controls

```javascript
tbar: [
    {
        type: 'container',
        layout: 'hbox',
        style: 'align-content:center',
        items: {
            label: 'Network status:',
            networkValue: 'Idle'
        }
    },
    '->',
    {
        type: 'button',
        text: 'Reset data',
        icon: 'fa fa-refresh',
        ref: 'resetButton',
        onClick() {
            // Load with params object to include in lazy load request
            // This clears all previously loaded data and cache
            grid.store.load({ reset: true });
        }
    },
    {
        type: 'button',
        text: 'Add',
        icon: 'fa fa-add',
        ref: 'addButton',
        disabled: true,
        onClick() {
            const sortIndex = grid.store.records[0]?.sortIndex / 2 || 1;
            const [newRecord] = grid.store.insert(0, { sortIndex });

            grid.startEditing({ id: newRecord.id, columnIndex: 2 });
        }
    }
]
```

---

## 3. Server-Side Implementation

### 3.1 PHP Backend Example

```php
<?php
// read.php
header('Content-Type: application/json');

$pdo = new PDO('mysql:host=localhost;dbname=grid', 'user', 'pass');

$offset = $_GET['offset'] ?? 0;
$limit = $_GET['limit'] ?? 50;
$sort = json_decode($_GET['sort'] ?? '[]', true);
$filter = json_decode($_GET['filter'] ?? '[]', true);

// Build query
$query = "SELECT * FROM users";
$countQuery = "SELECT COUNT(*) as total FROM users";

// Apply filters
if (!empty($filter)) {
    $whereClauses = [];
    foreach ($filter as $f) {
        $field = $f['field'];
        $operator = $f['operator'];
        $value = $f['value'];

        switch ($operator) {
            case '=':
                $whereClauses[] = "$field = " . $pdo->quote($value);
                break;
            case '*':
                $whereClauses[] = "$field LIKE " . $pdo->quote("%$value%");
                break;
            case '<':
                $whereClauses[] = "$field < " . $pdo->quote($value);
                break;
            case '>':
                $whereClauses[] = "$field > " . $pdo->quote($value);
                break;
        }
    }

    if (!empty($whereClauses)) {
        $whereClause = " WHERE " . implode(' AND ', $whereClauses);
        $query .= $whereClause;
        $countQuery .= $whereClause;
    }
}

// Apply sorting
if (!empty($sort)) {
    $orderClauses = [];
    foreach ($sort as $s) {
        $orderClauses[] = $s['field'] . ' ' . ($s['ascending'] ? 'ASC' : 'DESC');
    }
    $query .= " ORDER BY " . implode(', ', $orderClauses);
}

// Apply pagination
$query .= " LIMIT $offset, $limit";

$stmt = $pdo->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$countStmt = $pdo->query($countQuery);
$total = $countStmt->fetch()['total'];

echo json_encode([
    'success' => true,
    'data' => $data,
    'total' => $total
]);
```

### 3.2 Node.js/Express Backend

```javascript
// server.js
const express = require('express');
const app = express();

app.get('/read', async (req, res) => {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const sort = JSON.parse(req.query.sort || '[]');
    const filter = JSON.parse(req.query.filter || '[]');

    // Build query
    let query = db.collection('users');

    // Apply filters
    filter.forEach(f => {
        switch (f.operator) {
            case '=':
                query = query.where(f.field, '==', f.value);
                break;
            case '*':
                query = query.where(f.field, '>=', f.value)
                             .where(f.field, '<=', f.value + '\uf8ff');
                break;
        }
    });

    // Apply sorting
    sort.forEach(s => {
        query = query.orderBy(s.field, s.ascending ? 'asc' : 'desc');
    });

    // Get total count
    const countSnapshot = await query.get();
    const total = countSnapshot.size;

    // Apply pagination
    query = query.offset(offset).limit(limit);
    const snapshot = await query.get();

    const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    res.json({
        success: true,
        data,
        total
    });
});

app.listen(3000);
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { StringHelper } from '@bryntum/grid';
import { useState, useRef, useCallback, useMemo } from 'react';

function LazyLoadGrid() {
    const gridRef = useRef(null);
    const [networkStatus, setNetworkStatus] = useState('Idle');
    const [canAdd, setCanAdd] = useState(false);

    const gridConfig = useMemo(() => ({
        selectionMode: { rowNumber: true },

        features: {
            group: false,
            filter: { allowedOperators: ['*', '=', '<', '>'] }
        },

        columns: [
            { text: 'Name', field: 'name', flex: 2 },
            { text: 'Age', field: 'age', type: 'number', width: 100 },
            { text: 'City', field: 'city', flex: 1 },
            {
                text: 'Email',
                field: 'email',
                flex: 2,
                htmlEncode: false,
                renderer: ({ value }) => StringHelper.xss`<a href="mailto:${value}">${value}</a>`
            }
        ],

        store: {
            lazyLoad: true,
            readUrl: '/api/users',
            createUrl: '/api/users',
            updateUrl: '/api/users',
            deleteUrl: '/api/users',
            autoLoad: true,
            autoCommit: true,
            sortParamName: 'sort',
            filterParamName: 'filter',

            listeners: {
                lazyLoadStarted() {
                    setNetworkStatus('Loading...');
                    setCanAdd(false);
                },
                lazyLoadEnded() {
                    setNetworkStatus('Idle');
                    setCanAdd(true);
                },
                beforeCommit() {
                    setNetworkStatus('Saving...');
                },
                commit() {
                    setNetworkStatus('Idle');
                }
            }
        }
    }), []);

    const resetData = useCallback(() => {
        const grid = gridRef.current?.instance;
        grid?.store.load({ reset: true });
    }, []);

    const addRecord = useCallback(() => {
        const grid = gridRef.current?.instance;
        if (grid) {
            const sortIndex = grid.store.records[0]?.sortIndex / 2 || 1;
            const [newRecord] = grid.store.insert(0, { sortIndex });
            grid.startEditing({ id: newRecord.id, columnIndex: 0 });
        }
    }, []);

    return (
        <div className="lazy-load-grid">
            <div className="toolbar">
                <span className={`status ${networkStatus !== 'Idle' ? 'active' : ''}`}>
                    Network: {networkStatus}
                </span>
                <div className="actions">
                    <button onClick={resetData}>Reset Data</button>
                    <button onClick={addRecord} disabled={!canAdd}>Add Record</button>
                </div>
            </div>

            <BryntumGrid
                ref={gridRef}
                {...gridConfig}
            />
        </div>
    );
}
```

---

## 5. Styling

```css
/* Network status indicator */
.status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 4px;
    background: #e8f5e9;
    color: #2e7d32;
}

.status.active {
    background: #e3f2fd;
    color: #1565c0;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

/* Avatar styling */
.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1976d2;
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    margin-right: 8px;
}

.avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

/* Loading indicator in grid */
.b-grid-loading-row {
    text-align: center;
    color: #666;
    padding: 16px;
}

/* Flag icons */
.flag {
    width: 20px;
    height: 14px;
    margin-right: 8px;
    vertical-align: middle;
}

/* Email links */
.b-grid-cell a {
    color: #1976d2;
    text-decoration: none;
}

.b-grid-cell a:hover {
    text-decoration: underline;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Data laadt niet | readUrl niet correct | Check API endpoint |
| Grouping werkt niet | Niet ondersteund met lazyLoad | Zet group: false |
| Filtering werkt niet | Server verwerkt filter params niet | Implementeer server-side filtering |
| Dubbele requests | autoLoad en manual load | Gebruik alleen één methode |

---

## API Reference

### Store Config for Lazy Load

| Property | Type | Description |
|----------|------|-------------|
| `lazyLoad` | Boolean | Enable lazy loading |
| `readUrl` | String | URL for reading data |
| `createUrl` | String | URL for creating records |
| `updateUrl` | String | URL for updating records |
| `deleteUrl` | String | URL for deleting records |
| `autoLoad` | Boolean | Load on init |
| `autoCommit` | Boolean | Auto-save changes |
| `sortParamName` | String | Query param for sort |
| `filterParamName` | String | Query param for filter |

### Store Events

| Event | Description |
|-------|-------------|
| `lazyLoadStarted` | Loading started |
| `lazyLoadEnded` | Loading completed |
| `beforeCommit` | Before saving changes |
| `commit` | After saving changes |

### Store Methods

| Method | Description |
|--------|-------------|
| `load(params)` | Load with parameters |
| `insert(index, record)` | Insert new record |

---

## Bronnen

- **Example**: `examples/infinite-scroll/`
- **AjaxStore**: `Core.data.AjaxStore`

---

*Priority 2: Medium Priority Features*
