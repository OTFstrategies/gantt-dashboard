# Grid Implementation: Search & QuickFind

> **Search functionaliteit** met Search feature, QuickFind, en programmatic search.

---

## Overzicht

Bryntum Grid biedt twee search modes: Search (met toolbar) en QuickFind (keyboard-driven).

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ 🔍 [search term....] [↑] [↓]  │  F3 or CTRL+G navigates               │
├──────────────────────────────────────────────────────────────────────────┤
│  First name ▼  │  Surname  │  Team (no search) │  Color    │  Age       │
├────────────────┼───────────┼───────────────────┼───────────┼────────────┤
│  John          │  [Doe]    │  Alpha            │  Blue     │  35        │
│  Jane          │  Smith    │  Beta             │  [Red]    │  28        │
│  Bob           │  Wilson   │  Alpha            │  Green    │  42        │
├────────────────┴───────────┴───────────────────┴───────────┴────────────┤
│  [Doe] = highlighted search match                                        │
│                                                                          │
│  SEARCH MODES:                                                           │
│  🔍 Search Feature    ⌨️ QuickFind (keyboard)                            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Search Feature

### 1.1 Basic Search Setup

```javascript
import { Grid, DataGenerator, DateHelper, ObjectHelper } from '@bryntum/grid';

class App {
    constructor() {
        const me = this;

        const grid = me.grid = new Grid({
            appendTo: 'container',

            features: {
                search: true
            },

            columns: [
                { text: 'First name', field: 'firstName', flex: 1 },
                { text: 'Surname', field: 'surName', flex: 1 },
                // Exclude column from search
                { text: 'Team', field: 'team', flex: 1, searchable: false },
                {
                    type: 'color',
                    text: 'Favorite color',
                    field: 'color',
                    showColorName: true,
                    colorNameAsValue: true,
                    flex: 1
                },
                { text: 'Age', field: 'age', flex: 1, type: 'number' },
                {
                    text: 'Start',
                    field: 'start',
                    type: 'date',
                    format: 'YYYY-MM-DD',
                    flex: 1
                }
            ],

            store: {
                fields: [
                    'firstName',
                    'surName',
                    'team',
                    'color',
                    { name: 'age', type: 'number' },
                    { name: 'start', type: 'date' }
                ],
                data: DataGenerator.generateData(250)
            },

            tbar: [
                {
                    type: 'text',
                    ref: 'searchField',
                    clearable: true,
                    label: '<i class="b-icon b-icon-search"></i>',
                    listeners: {
                        change: 'onSearchFieldChange',
                        clear: 'onSearchFieldClear',
                        thisObj: me
                    }
                },
                {
                    type: 'button',
                    ref: 'prevBtn',
                    icon: 'b-icon-up',
                    disabled: true,
                    tooltip: 'Go to previous hit (Shift+F3)',
                    listeners: {
                        action: 'onPrevHit',
                        thisObj: me
                    }
                },
                {
                    type: 'button',
                    ref: 'nextBtn',
                    icon: 'b-icon-down',
                    disabled: true,
                    tooltip: 'Go to next hit (F3)',
                    listeners: {
                        action: 'onNextHit',
                        thisObj: me
                    }
                }
            ],

            listeners: {
                search: 'onSearchPerformed',
                clearSearch: 'onClearPerformed',
                thisObj: me
            }
        });

        me.search = grid.widgetMap.searchField;
        me.previousBtn = grid.widgetMap.prevBtn;
        me.nextBtn = grid.widgetMap.nextBtn;
    }

    onNextHit() {
        this.grid.features.search.gotoNextHit(false, { animate: 300 });
    }

    onPrevHit() {
        this.grid.features.search.gotoPrevHit({ animate: 300 });
    }

    onSearchPerformed({ find, found }) {
        const me = this;

        // Update badge with hit count
        me.search.badge = found.length;
        me.grid.element.focus({ preventScroll: true });
        me.previousBtn.enable();
        me.nextBtn.enable();
    }

    onClearPerformed() {
        const me = this;
        me.search.value = '';
        me.search.badge = null;
        me.previousBtn.disable();
        me.nextBtn.disable();
    }

    onSearchFieldClear() {
        this.grid.features.search.clear();
    }

    onSearchFieldChange({ value }) {
        this.grid.features.search.search(value);
    }
}

const app = new App();

// Programmatic search
app.grid.features.search.search('range');
```

---

## 2. QuickFind Feature

### 2.1 Basic QuickFind Setup

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        quickFind: true,
        sort: 'rank'
    },

    columns: [
        { type: 'rownumber' },
        { text: 'First name', field: 'firstName', flex: 1 },
        { text: 'Surname', field: 'surName', flex: 1 },
        { text: 'Team', field: 'team', flex: 1 },
        {
            text: 'Personal best',
            field: 'score',
            flex: 1,
            type: 'number',
            align: 'end'
        },
        {
            text: 'Current rank',
            field: 'rank',
            flex: 1,
            type: 'number',
            align: 'end'
        }
    ],

    data: DataGenerator.generateData(250),

    tbar: [
        {
            type: 'buttongroup',
            items: [
                {
                    type: 'button',
                    ref: 'previousButton',
                    icon: 'fa-arrow-up',
                    disabled: true,
                    text: 'Previous hit',
                    tooltip: 'Shift+F3 or Shift+Ctrl+G',
                    onAction: () => grid.features.quickFind.gotoPrevHit()
                },
                {
                    type: 'button',
                    ref: 'nextButton',
                    icon: 'fa-arrow-down',
                    disabled: true,
                    text: 'Next hit',
                    tooltip: 'F3 or Ctrl+G',
                    onAction: () => grid.features.quickFind.gotoNextHit()
                }
            ]
        }
    ],

    listeners: {
        // Triggered after a quick find is performed
        quickFind({ found }) {
            if (found.length) {
                previousButton.enable();
                nextButton.enable();
            }
        },
        // Triggered after quick find is cleared
        hideQuickFind() {
            previousButton.disable();
            nextButton.disable();
        }
    }
});

const { previousButton, nextButton } = grid.widgetMap;

// Programmatic search in specific field
grid.features.quickFind.search('duck', 'team');
```

---

## 3. Search Column Configuration

### 3.1 Exclude Column from Search

```javascript
columns: [
    { text: 'Name', field: 'name', flex: 1 },
    // This column won't be searched
    { text: 'Internal ID', field: 'internalId', flex: 1, searchable: false },
    { text: 'City', field: 'city', flex: 1 }
]
```

### 3.2 Custom Field Types in Search

```javascript
store: {
    fields: [
        'firstName',
        'surName',
        { name: 'age', type: 'number' },
        { name: 'start', type: 'date' }
    ],
    data: DataGenerator.generateData(250)
}
```

---

## 4. Programmatic Search Control

### 4.1 Search API

```javascript
// Perform search
grid.features.search.search('search term');

// Navigate hits
grid.features.search.gotoNextHit(false, { animate: 300 });
grid.features.search.gotoPrevHit({ animate: 300 });

// Clear search
grid.features.search.clear();

// Get search results
const results = grid.features.search.found;
console.log(`Found ${results.length} matches`);
```

### 4.2 QuickFind API

```javascript
// Search all columns
grid.features.quickFind.search('term');

// Search specific field
grid.features.quickFind.search('duck', 'team');

// Navigate hits
grid.features.quickFind.gotoNextHit();
grid.features.quickFind.gotoPrevHit();
```

---

## 5. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useState, useRef, useCallback } from 'react';

function SearchableGrid({ data }) {
    const gridRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [hitCount, setHitCount] = useState(0);

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        if (gridRef.current?.instance) {
            gridRef.current.instance.features.search.search(term);
        }
    }, []);

    const handleSearchPerformed = useCallback(({ found }) => {
        setHitCount(found.length);
    }, []);

    const handleClearSearch = useCallback(() => {
        setHitCount(0);
        setSearchTerm('');
    }, []);

    const gotoNext = useCallback(() => {
        gridRef.current?.instance.features.search.gotoNextHit(false, { animate: 300 });
    }, []);

    const gotoPrev = useCallback(() => {
        gridRef.current?.instance.features.search.gotoPrevHit({ animate: 300 });
    }, []);

    const gridConfig = {
        features: {
            search: true
        },

        columns: [
            { text: 'Name', field: 'name', flex: 1 },
            { text: 'Age', field: 'age', width: 100, type: 'number' },
            { text: 'City', field: 'city', flex: 1, searchable: false },
            { text: 'Team', field: 'team', flex: 1 }
        ],

        listeners: {
            search: handleSearchPerformed,
            clearSearch: handleClearSearch
        }
    };

    return (
        <div className="searchable-grid">
            <div className="search-toolbar">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search..."
                />
                {hitCount > 0 && (
                    <>
                        <span className="hit-count">{hitCount} matches</span>
                        <button onClick={gotoPrev}>Previous</button>
                        <button onClick={gotoNext}>Next</button>
                    </>
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

## 6. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F3` | Go to next hit |
| `Shift + F3` | Go to previous hit |
| `Ctrl/Cmd + G` | Go to next hit |
| `Shift + Ctrl/Cmd + G` | Go to previous hit |

---

## 7. Styling

```css
/* Search highlight */
.b-search-hit {
    background: #FFEB3B;
    color: #000;
    padding: 1px 2px;
    border-radius: 2px;
}

/* Current search hit */
.b-search-hit-current {
    background: #FF9800;
    color: white;
}

/* Search field badge */
.b-textfield .b-badge {
    background: #2196F3;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    margin-left: 8px;
}

/* QuickFind popup */
.b-quickfind {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    z-index: 100;
}

/* Navigation buttons */
.search-toolbar button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Keyboard shortcuts display */
.keycap {
    display: inline-block;
    background: #e0e0e0;
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 2px 6px;
    font-family: monospace;
    font-size: 11px;
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Column niet doorzoekbaar | Feature disabled | Enable search feature |
| Specifieke column niet gevonden | searchable: false | Verwijder searchable: false |
| QuickFind werkt niet | Touch device | QuickFind is niet voor touch |
| Geen highlights | CSS niet geladen | Controleer CSS imports |
| Navigation werkt niet | Geen hits gevonden | Check search term en data |

---

## API Reference

### Search Feature

| Method | Description |
|--------|-------------|
| `search(term)` | Perform search |
| `clear()` | Clear search |
| `gotoNextHit(wrap, options)` | Navigate to next hit |
| `gotoPrevHit(options)` | Navigate to previous hit |

### QuickFind Feature

| Method | Description |
|--------|-------------|
| `search(term, field?)` | Search term in optional field |
| `gotoNextHit()` | Navigate to next hit |
| `gotoPrevHit()` | Navigate to previous hit |

### Column Config

| Property | Type | Description |
|----------|------|-------------|
| `searchable` | Boolean | Include in search (default: true) |

### Events

| Event | Description |
|-------|-------------|
| `search` | Fired when search is performed |
| `clearSearch` | Fired when search is cleared |
| `quickFind` | Fired when quickfind matches |
| `hideQuickFind` | Fired when quickfind is cleared |

---

## Bronnen

- **Example**: `examples/search/`
- **QuickFind**: `examples/quickfind/`
- **Search Feature**: `Grid.feature.Search`
- **QuickFind Feature**: `Grid.feature.QuickFind`

---

*Priority 2: Medium Priority Features*
