# Grid Implementation: Quick Find

> **Quick Find** voor snelle zoekfunctionaliteit met keyboard shortcuts.

---

## Overzicht

Bryntum Grid biedt een quick find functie voor snel zoeken met Ctrl+F.

```
+--------------------------------------------------------------------------+
| GRID                                            [🔍 Quick Find: task___] |
+--------------------------------------------------------------------------+
|  Name           |  Status     |  Priority   |  Category   |              |
+--------------------------------------------------------------------------+
|  [Task A]       |  Active     |  High       |  Dev        |  ← Match 1   |
|  Build system   |  Pending    |  Medium     |  Ops        |              |
|  [Task B]       |  Done       |  Low        |  Dev        |  ← Match 2   |
|  Deploy app     |  Active     |  High       |  Ops        |              |
|  [Task C]       |  Pending    |  Medium     |  QA         |  ← Match 3   |
+--------------------------------------------------------------------------+
|  Found 3 of 5 records                         [↑ Prev] [↓ Next] [✕ Close]|
+--------------------------------------------------------------------------+
```

---

## 1. Basic Quick Find Setup

### 1.1 Enable Quick Find

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        quickFind: true  // Enable quick find with Ctrl+F
    },

    columns: [
        { text: 'Name', field: 'name', width: 200 },
        { text: 'Status', field: 'status', width: 120 },
        { text: 'Priority', field: 'priority', width: 100 },
        { text: 'Category', field: 'category', width: 120 }
    ],

    data: [
        { id: 1, name: 'Task A', status: 'Active', priority: 'High', category: 'Dev' },
        { id: 2, name: 'Build system', status: 'Pending', priority: 'Medium', category: 'Ops' },
        { id: 3, name: 'Task B', status: 'Done', priority: 'Low', category: 'Dev' },
        { id: 4, name: 'Deploy app', status: 'Active', priority: 'High', category: 'Ops' },
        { id: 5, name: 'Task C', status: 'Pending', priority: 'Medium', category: 'QA' }
    ]
});
```

---

## 2. Advanced Configuration

### 2.1 Quick Find Options

```javascript
features: {
    quickFind: {
        // Search configuration
        find: '',  // Initial search value

        // Case sensitivity
        caseSensitive: false,

        // Search in specific columns only
        columns: ['name', 'status'],

        // Auto-highlight matches
        highlight: true,

        // Navigate to first match
        goToFirstMatch: true
    }
}
```

### 2.2 Custom Search Behavior

```javascript
features: {
    quickFind: {
        // Custom match function
        matchFn({ record, value, column }) {
            const cellValue = String(record.get(column.field) || '');

            // Custom matching logic - fuzzy search
            const searchTerms = value.toLowerCase().split(' ');
            const cellLower = cellValue.toLowerCase();

            return searchTerms.every(term => cellLower.includes(term));
        },

        // Debounce search
        delay: 300
    }
}
```

---

## 3. Programmatic Control

### 3.1 Search Methods

```javascript
const quickFind = grid.features.quickFind;

// Open quick find bar
quickFind.showQuickFind();

// Search for value
quickFind.search('task');

// Go to next/previous match
quickFind.gotoNextHit();
quickFind.gotoPrevHit();

// Get current matches
const matches = quickFind.results;
console.log(`Found ${matches.length} matches`);

// Clear search
quickFind.clear();

// Close quick find bar
quickFind.hide();
```

### 3.2 Event Handling

```javascript
grid.on({
    quickFindShow() {
        console.log('Quick find opened');
    },

    quickFindHide() {
        console.log('Quick find closed');
    },

    quickFindSearch({ value, results }) {
        console.log(`Searched for "${value}", found ${results.length} matches`);
    },

    quickFindHit({ record, column }) {
        console.log('Navigated to:', record.get(column.field));
    }
});
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useRef, useMemo, useCallback, useState } from 'react';

function QuickFindGrid({ data }) {
    const gridRef = useRef(null);
    const [searchResults, setSearchResults] = useState({ count: 0, total: 0 });
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleSearch = useCallback(() => {
        const grid = gridRef.current?.instance;
        grid?.features.quickFind?.showQuickFind();
    }, []);

    const handleNextMatch = useCallback(() => {
        const grid = gridRef.current?.instance;
        grid?.features.quickFind?.gotoNextHit();
    }, []);

    const handlePrevMatch = useCallback(() => {
        const grid = gridRef.current?.instance;
        grid?.features.quickFind?.gotoPrevHit();
    }, []);

    const handleClear = useCallback(() => {
        const grid = gridRef.current?.instance;
        grid?.features.quickFind?.clear();
        setSearchResults({ count: 0, total: data.length });
    }, [data.length]);

    const gridConfig = useMemo(() => ({
        features: {
            quickFind: {
                highlight: true,
                goToFirstMatch: true
            }
        },

        columns: [
            { text: 'Name', field: 'name', width: 200 },
            { text: 'Description', field: 'description', flex: 1 },
            { text: 'Status', field: 'status', width: 100 },
            { text: 'Category', field: 'category', width: 120 }
        ],

        listeners: {
            quickFindShow() {
                setIsSearchOpen(true);
            },
            quickFindHide() {
                setIsSearchOpen(false);
            },
            quickFindSearch({ results }) {
                setSearchResults({
                    count: results.length,
                    total: data.length
                });
            }
        }
    }), [data.length]);

    return (
        <div className="quick-find-grid">
            <div className="toolbar">
                <button onClick={handleSearch}>
                    <i className="fa fa-search"></i> Find (Ctrl+F)
                </button>

                {isSearchOpen && (
                    <div className="search-controls">
                        <button onClick={handlePrevMatch} title="Previous (Shift+Enter)">
                            <i className="fa fa-arrow-up"></i>
                        </button>
                        <button onClick={handleNextMatch} title="Next (Enter)">
                            <i className="fa fa-arrow-down"></i>
                        </button>
                        <span className="result-count">
                            {searchResults.count} of {searchResults.total}
                        </span>
                        <button onClick={handleClear} title="Clear">
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                )}
            </div>

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

## 5. Styling

```css
/* Quick find bar */
.b-quick-find {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #e3f2fd;
    border-bottom: 1px solid #bbdefb;
}

.b-quick-find input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #90caf9;
    border-radius: 4px;
    font-size: 14px;
}

.b-quick-find input:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
}

/* Navigation buttons */
.b-quick-find button {
    padding: 6px 12px;
    border: 1px solid #90caf9;
    background: white;
    cursor: pointer;
    border-radius: 4px;
}

.b-quick-find button:hover {
    background: #bbdefb;
}

/* Match count */
.b-quick-find .b-match-count {
    padding: 4px 12px;
    background: white;
    border-radius: 4px;
    font-size: 13px;
    color: #666;
}

/* Highlighted matches */
.b-grid-cell .b-quick-find-match {
    background: #ffeb3b;
    color: #000;
    padding: 2px 0;
    border-radius: 2px;
}

/* Current match */
.b-grid-cell .b-quick-find-match.b-current {
    background: #ff9800;
    color: white;
}

/* Focused row with match */
.b-grid-row.b-quick-find-hit {
    background: #fff8e1 !important;
}

/* Toolbar */
.toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.search-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

.result-count {
    padding: 4px 12px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 13px;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Ctrl+F werkt niet | Browser overrides | Focus grid eerst |
| Geen matches | caseSensitive: true | Set caseSensitive: false |
| Highlight mist | highlight: false | Enable highlight |
| Zoekt verkeerde columns | columns niet geconfigureerd | Specificeer columns |

---

## API Reference

### Quick Find Config

| Property | Type | Description |
|----------|------|-------------|
| `quickFind` | Boolean/Object | Enable feature |
| `caseSensitive` | Boolean | Case sensitive search |
| `columns` | Array | Columns to search |
| `highlight` | Boolean | Highlight matches |
| `goToFirstMatch` | Boolean | Navigate to first match |
| `delay` | Number | Search debounce (ms) |

### Quick Find Methods

| Method | Description |
|--------|-------------|
| `showQuickFind()` | Open quick find bar |
| `hide()` | Close quick find bar |
| `search(value)` | Search for value |
| `gotoNextHit()` | Go to next match |
| `gotoPrevHit()` | Go to previous match |
| `clear()` | Clear search |

### Events

| Event | Description |
|-------|-------------|
| `quickFindShow` | Quick find opened |
| `quickFindHide` | Quick find closed |
| `quickFindSearch` | Search performed |
| `quickFindHit` | Navigated to match |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+F` | Open quick find |
| `Enter` | Next match |
| `Shift+Enter` | Previous match |
| `Escape` | Close quick find |

---

## Bronnen

- **Feature**: `Grid.feature.QuickFind`

---

*Priority 2: Medium Priority Features*
