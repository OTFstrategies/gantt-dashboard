# TaskBoard Implementation: Column Search & Filter

> **Implementatie guide** voor zoek- en filterfunctionaliteit in Bryntum TaskBoard: filterBar feature, regex support, match highlighting, en custom filter fields.

---

## Overzicht

Column Search biedt krachtige filter mogelijkheden voor TaskBoard:

- **FilterBar** - Zoekbalk boven de kolommen
- **Multi-field Search** - Zoeken over meerdere task velden
- **Match Highlighting** - Markeren van zoekresultaten
- **Regex Support** - Geavanceerde zoekpatronen
- **Match Modes** - AND/OR combinatie van filters

---

## 1. Basic Configuration

### 1.1 TaskBoard Setup

```javascript
import { TaskBoard } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    appendTo: 'container',

    project: {
        loadUrl: 'data/data.json',
        autoLoad: true
    },

    // Kolom configuratie
    columnField: 'status',
    columns: [
        { id: 'todo', text: 'To Do' },
        { id: 'doing', text: 'In Progress' },
        { id: 'done', text: 'Done' }
    ],

    // FilterBar feature
    features: {
        filterBar: true
    }
});
```

---

## 2. FilterBar Configuration

### 2.1 Basic FilterBar

```javascript
features: {
    filterBar: {
        // Velden om te doorzoeken
        fields: ['name', 'description'],

        // Delay voor keystroke filtering (ms)
        keyStrokeChangeDelay: 100,

        // Placeholder tekst
        placeholder: 'Search tasks...'
    }
}
```

### 2.2 Advanced FilterBar

```javascript
features: {
    filterBar: {
        // Uitgebreide velden configuratie
        fields: ['id', 'name', 'description', 'prio', 'owner', 'category'],

        // Snelle response
        keyStrokeChangeDelay: 100,

        // Regex ondersteuning
        allowRegExp: true,

        // Match mode toggle tonen
        showMatchModeTrigger: true,

        // AND of OR matching
        matchMode: 'and',

        // Highlight matches in tasks
        highlightMatches: true
    }
}
```

---

## 3. Match Highlighting

### 3.1 Enable Highlighting

```javascript
features: {
    filterBar: {
        fields: ['name', 'description'],
        highlightMatches: true
    }
}
```

### 3.2 Highlight CSS

```css
/* Highlighted matches */
.b-match-highlight {
    background-color: #ffeb3b;
    padding: 0 2px;
    border-radius: 2px;
    font-weight: bold;
}

/* Dark theme */
.b-theme-dark .b-match-highlight {
    background-color: #ffc107;
    color: #000;
}
```

---

## 4. Match Modes

### 4.1 AND Mode

```javascript
features: {
    filterBar: {
        matchMode: 'and',
        showMatchModeTrigger: true
    }
}

// Zoekterm "urgent review" matcht alleen tasks die BEIDE woorden bevatten
```

### 4.2 OR Mode

```javascript
features: {
    filterBar: {
        matchMode: 'or',
        showMatchModeTrigger: true
    }
}

// Zoekterm "urgent review" matcht tasks die EEN van beide woorden bevatten
```

### 4.3 Dynamic Mode Toggle

```javascript
// Programmatisch wisselen
taskBoard.features.filterBar.matchMode = 'or';

// Check huidige mode
const currentMode = taskBoard.features.filterBar.matchMode;
```

---

## 5. Regex Filtering

### 5.1 Enable Regex

```javascript
features: {
    filterBar: {
        allowRegExp: true,
        fields: ['name', 'description']
    }
}
```

### 5.2 Regex Examples

```javascript
// Start regex met /
// Zoek tasks die beginnen met "Bug"
/^Bug/

// Case-insensitive zoeken
/urgent/i

// Zoek specifiek patroon (ID format)
/TASK-\d{4}/

// Multiple patterns
/(bug|issue|error)/i
```

---

## 6. Custom Filter Fields

### 6.1 Field Configuration

```javascript
features: {
    filterBar: {
        fields: [
            // String veld
            'name',

            // Object configuratie
            {
                field: 'priority',
                type: 'combo',
                items: ['High', 'Medium', 'Low'],
                placeholder: 'Priority'
            },

            // Date veld
            {
                field: 'dueDate',
                type: 'date',
                placeholder: 'Due before'
            }
        ]
    }
}
```

### 6.2 Custom Filter Function

```javascript
features: {
    filterBar: {
        fields: ['name'],

        // Custom filter logic
        filterFn({ record, value }) {
            // Custom matching logic
            const searchTerms = value.toLowerCase().split(' ');

            return searchTerms.every(term =>
                record.name.toLowerCase().includes(term) ||
                record.description?.toLowerCase().includes(term) ||
                record.tags?.some(tag => tag.toLowerCase().includes(term))
            );
        }
    }
}
```

---

## 7. FilterableTaskModel

### 7.1 Extend TaskModel

```javascript
import { TaskModel, StringHelper } from '@bryntum/taskboard';

class FilterableTaskModel extends TaskModel {
    static fields = [
        'category',
        'owner',
        { name: 'prio', type: 'number' },
        { name: 'tags', type: 'array' }
    ];

    // Custom searchable text
    get searchableText() {
        return [
            this.name,
            this.description,
            this.category,
            this.owner,
            ...(this.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();
    }
}
```

### 7.2 Use Custom Model

```javascript
const taskBoard = new TaskBoard({
    project: {
        taskModelClass: FilterableTaskModel,
        loadUrl: 'data/data.json',
        autoLoad: true
    },

    features: {
        filterBar: {
            fields: ['name', 'description', 'category', 'owner', 'tags']
        }
    }
});
```

---

## 8. Programmatic Filtering

### 8.1 Set Filter Value

```javascript
// Stel filter waarde in
taskBoard.features.filterBar.value = 'urgent';

// Clear filter
taskBoard.features.filterBar.value = '';

// Of via store
taskBoard.project.taskStore.filter({
    id: 'searchFilter',
    filterBy: record => record.name.includes('Bug')
});
```

### 8.2 Filter Events

```javascript
features: {
    filterBar: {
        listeners: {
            change({ value }) {
                console.log('Filter changed:', value);

                // Update UI
                this.updateFilterIndicator(value);
            },

            clear() {
                console.log('Filter cleared');
            }
        }
    }
}
```

---

## 9. Filter Persistence

### 9.1 Save/Restore Filter

```javascript
// Opslaan
function saveFilter() {
    const filterState = {
        value: taskBoard.features.filterBar.value,
        matchMode: taskBoard.features.filterBar.matchMode
    };

    localStorage.setItem('taskBoardFilter', JSON.stringify(filterState));
}

// Herstellen
function restoreFilter() {
    const saved = localStorage.getItem('taskBoardFilter');

    if (saved) {
        const state = JSON.parse(saved);
        taskBoard.features.filterBar.value = state.value;
        taskBoard.features.filterBar.matchMode = state.matchMode;
    }
}

// Bij laden
taskBoard.on('load', restoreFilter);

// Bij wijziging
taskBoard.features.filterBar.on('change', saveFilter);
```

---

## 10. Styling

### 10.1 FilterBar CSS

```css
/* FilterBar container */
.b-taskboard-filterbar {
    padding: 8px 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

/* Search input */
.b-taskboard-filterbar .b-textfield {
    flex: 1;
    max-width: 400px;
}

.b-taskboard-filterbar .b-textfield input {
    padding: 8px 12px;
    border-radius: 20px;
    border: 1px solid #ddd;
}

.b-taskboard-filterbar .b-textfield input:focus {
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

/* Match mode toggle */
.b-taskboard-filterbar .b-match-mode-trigger {
    margin-left: 8px;
}

/* Active filter indicator */
.b-taskboard-filterbar.b-filtering {
    background: #e3f2fd;
    border-bottom-color: #2196f3;
}

/* Filtered task count */
.b-filter-count {
    margin-left: 12px;
    padding: 4px 8px;
    background: #2196f3;
    color: white;
    border-radius: 12px;
    font-size: 0.85em;
}
```

---

## 11. TypeScript Interfaces

```typescript
import { TaskBoard, TaskModel, Feature } from '@bryntum/taskboard';

// FilterBar Configuration
interface FilterBarConfig {
    fields?: (string | FilterFieldConfig)[];
    keyStrokeChangeDelay?: number;
    placeholder?: string;
    allowRegExp?: boolean;
    showMatchModeTrigger?: boolean;
    matchMode?: 'and' | 'or';
    highlightMatches?: boolean;
    filterFn?: FilterFunction;
    listeners?: FilterBarListeners;
}

interface FilterFieldConfig {
    field: string;
    type?: 'text' | 'combo' | 'date' | 'number';
    items?: string[];
    placeholder?: string;
}

// Filter Function
type FilterFunction = (context: FilterContext) => boolean;

interface FilterContext {
    record: TaskModel;
    value: string;
    field?: string;
}

// Listeners
interface FilterBarListeners {
    change?: (event: FilterChangeEvent) => void;
    clear?: () => void;
}

interface FilterChangeEvent {
    value: string;
    source: FilterBarFeature;
}

// FilterBar Feature
interface FilterBarFeature extends Feature {
    value: string;
    matchMode: 'and' | 'or';
}

// Filterable Task Model
interface FilterableTask extends TaskModel {
    category?: string;
    owner?: string;
    prio?: number;
    tags?: string[];
    searchableText: string;
}
```

---

## 12. Complete Example

```javascript
import { TaskBoard, TaskModel } from '@bryntum/taskboard';

// Custom filterable task model
class FilterableTaskModel extends TaskModel {
    static fields = [
        'category',
        'owner',
        { name: 'prio', type: 'number' },
        { name: 'tags', type: 'array' }
    ];
}

const taskBoard = new TaskBoard({
    appendTo: 'container',

    project: {
        taskModelClass: FilterableTaskModel,
        loadUrl: 'data/data.json',
        autoLoad: true
    },

    columnField: 'status',
    columns: [
        { id: 'todo', text: 'To Do', color: 'blue' },
        { id: 'doing', text: 'In Progress', color: 'orange' },
        { id: 'review', text: 'Review', color: 'purple' },
        { id: 'done', text: 'Done', color: 'green' }
    ],

    features: {
        filterBar: {
            // Doorzoekbare velden
            fields: ['id', 'name', 'description', 'prio', 'owner', 'category'],

            // Response snelheid
            keyStrokeChangeDelay: 100,

            // Regex ondersteuning
            allowRegExp: true,

            // Match mode toggle
            showMatchModeTrigger: true,
            matchMode: 'and',

            // Highlight resultaten
            highlightMatches: true,

            // Placeholder
            placeholder: 'Search tasks (supports regex with /pattern/)',

            listeners: {
                change({ value }) {
                    // Update filter count
                    const visibleCount = taskBoard.project.taskStore.count;
                    const totalCount = taskBoard.project.taskStore.originalCount;

                    if (value) {
                        console.log(`Showing ${visibleCount} of ${totalCount} tasks`);
                    }
                }
            }
        }
    },

    tbar: [
        {
            type: 'button',
            text: 'Clear Filter',
            icon: 'b-icon-remove',
            onClick() {
                taskBoard.features.filterBar.value = '';
            }
        },
        {
            type: 'button',
            text: 'High Priority',
            onClick() {
                taskBoard.features.filterBar.value = 'prio:1';
            }
        }
    ]
});

// Keyboard shortcut voor focus
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        taskBoard.features.filterBar.focus();
    }
});
```

---

## Referenties

- Examples: `taskboard-7.1.0-trial/examples/column-search/`
- Feature: FilterBar
- API: TaskModel
- Config: highlightMatches, matchMode, allowRegExp

---

*Document gegenereerd: December 2024*
*Bryntum TaskBoard versie: 7.1.0*
