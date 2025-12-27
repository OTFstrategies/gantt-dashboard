# TaskBoard Implementatie: Filtering

> **Implementatie guide** voor card filtering, search, swimlane filtering, filter UI en quick filters.

---

## Overzicht

De TaskBoard ondersteunt meerdere filtertypen:
- **Task Filtering**: Filteren van kaarten op basis van eigenschappen
- **Column Filtering**: Kolommen tonen/verbergen op basis van naam
- **Swimlane Filtering**: Swimlanes tonen/verbergen op basis van naam
- **Filter Widgets**: Ingebouwde UI componenten voor filtering
- **Picker Buttons**: Column/swimlane visibility pickers
- **FilterBar Feature**: Ingebouwde zoekbalk met highlight
- **Programmatisch Filteren**: Via Store API

### Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                  TaskBoard Filter Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     Filter Widgets (tbar)                   │ │
│  │  ┌───────────────┐ ┌─────────────────┐ ┌─────────────────┐  │ │
│  │  │TaskFilterField│ │ColumnFilterField│ │SwimlaneFilter   │  │ │
│  │  └───────┬───────┘ └────────┬────────┘ └────────┬────────┘  │ │
│  │          │                  │                    │          │ │
│  └──────────┼──────────────────┼────────────────────┼──────────┘ │
│             │                  │                    │            │
│             ▼                  ▼                    ▼            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐   │
│  │ Project         │ │ Columns Store   │ │ Swimlanes Store  │   │
│  │ TaskStore       │ │                 │ │                  │   │
│  │ (master)        │ │ filter()        │ │ filter()         │   │
│  │                 │ │ hidden property │ │ hidden property  │   │
│  │ chainFilters───►│ │                 │ │                  │   │
│  └────────┬────────┘ └─────────────────┘ └──────────────────┘   │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  Column Task Stores (chained)               │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │ │
│  │  │Column 1 │ │Column 2 │ │Column 3 │ │Column N │           │ │
│  │  │Store    │ │Store    │ │Store    │ │Store    │           │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Filter Types Matrix

| Filter Type | Affects | Widget | Store Method |
|-------------|---------|--------|--------------|
| Task Filter | Visible tasks | `taskfilterfield` | `taskStore.filter()` |
| Column Filter | Column text search | `columnfilterfield` | Columns store filter |
| Swimlane Filter | Swimlane text search | `swimlanefilterfield` | Swimlanes store filter |
| Column Picker | Column visibility | `columnpickerbutton` | `column.hidden` |
| Swimlane Picker | Swimlane visibility | `swimlanepickerbutton` | `swimlane.hidden` |
| FilterBar | Task properties + highlight | Feature | `taskStore.filter()` |

---

## 1. Toolbar Filter Widgets

### Basis Configuratie

```javascript
// Bron: examples/filtering/app.module.js
import { TaskBoard } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    appendTo: 'container',

    // KRITISCH: zorgt dat filters doorwerken naar column stores
    chainFilters: true,

    tbar: [
        // Task filter - zoekt in task properties
        { type: 'taskfilterfield' },

        // Column filter - zoekt in column names
        { type: 'columnfilterfield' },

        // Swimlane filter - zoekt in swimlane names
        { type: 'swimlanefilterfield' },

        // Spacer om items rechts te alignen
        '->',

        // Column visibility picker
        { type: 'columnpickerbutton' },

        // Swimlane visibility picker
        { type: 'swimlanepickerbutton' }
    ],

    columns: ['todo', 'doing', 'done'],
    columnField: 'status',

    swimlanes: [
        { id: 'high', text: 'High', color: 'red' },
        { id: 'medium', text: 'Medium', color: 'orange' },
        { id: 'low', text: 'Low', color: 'lime' }
    ],
    swimlaneField: 'prio'
});
```

---

## 2. TaskFilterField

> **Bron**: `taskboard.d.ts:165451-165489`

### Widget Definition

```typescript
/**
 * TaskFilterField Widget
 * Zoekt in task properties en filtert zichtbare kaarten
 */
export class TaskFilterField extends FilterField {
    static readonly isTaskBoardLinked: boolean;
    static readonly isTaskFilterField: boolean;

    readonly isTaskBoardLinked: boolean;
    readonly isTaskFilterField: boolean;
}
```

### Basis Gebruik

```javascript
tbar: [
    {
        type: 'taskfilterfield',
        placeholder: 'Search tasks...',
        width: 200
    }
]
```

### Complete Configuratie

```javascript
tbar: [
    {
        type: 'taskfilterfield',

        // Widget reference voor programmatische toegang
        ref: 'taskFilter',

        // Placeholder tekst
        placeholder: 'Type to filter tasks...',

        // Breedte
        width: 250,

        // Clear button tonen
        clearable: true,

        // Icon
        icon: 'b-fa-search',

        // Keyboard shortcut delay (debounce)
        keyStrokeChangeDelay: 300,

        // Welke velden doorzoeken
        // Default: zoekt in name en andere tekst velden
        filterFields: ['name', 'description', 'notes'],

        // Case sensitivity
        caseSensitive: false,

        // Event listeners
        listeners: {
            change({ value, source }) {
                console.log('Filter value:', value);

                // Analytics tracking
                if (value?.length >= 3) {
                    analytics.track('task_search', { query: value });
                }
            },

            clear({ source }) {
                console.log('Filter cleared');
            }
        }
    }
]
```

### Programmatische Controle

```javascript
const taskBoard = new TaskBoard({
    tbar: [
        {
            type: 'taskfilterfield',
            ref: 'taskFilter'
        }
    ]
});

// Na initialisatie...

// Get filter widget
const filterField = taskBoard.widgetMap.taskFilter;

// Set filter value programmatisch
filterField.value = 'urgent';

// Clear filter
filterField.clear();

// Check huidige waarde
console.log('Current filter:', filterField.value);

// Disable/enable filter
filterField.disabled = true;
filterField.disabled = false;

// Focus op filter veld
filterField.focus();
```

### Filter Field Events

```javascript
const taskBoard = new TaskBoard({
    tbar: [
        {
            type: 'taskfilterfield',
            ref: 'taskFilter',
            listeners: {
                // Fired wanneer waarde verandert (na debounce)
                change({ value, oldValue, valid, source }) {
                    console.log(`Filter changed: "${oldValue}" → "${value}"`);

                    // Update URL parameter
                    if (value) {
                        updateURLParam('search', value);
                    } else {
                        removeURLParam('search');
                    }
                },

                // Fired bij elke toetsaanslag
                input({ value }) {
                    // Realtime feedback (voor debounce)
                    showSearchingIndicator();
                },

                // Fired wanneer filter gecleared wordt
                clear() {
                    removeURLParam('search');
                    hideSearchingIndicator();
                },

                // Focus events
                focusin() {
                    showSearchSuggestions();
                },

                focusout() {
                    hideSearchSuggestions();
                }
            }
        }
    ]
});
```

---

## 3. ColumnFilterField

> **Bron**: `taskboard.d.ts:147236-147279`

### Widget Definition

```typescript
/**
 * ColumnFilterField Widget
 * Filtert columns op basis van hun text property
 */
export class ColumnFilterField extends FilterField {
    static readonly isColumnFilterField: boolean;
    static readonly isTaskBoardLinked: boolean;

    readonly isColumnFilterField: boolean;
    readonly isTaskBoardLinked: boolean;
}
```

### Configuratie

```javascript
tbar: [
    {
        type: 'columnfilterfield',
        ref: 'columnFilter',
        placeholder: 'Filter columns...',
        width: 180,
        clearable: true,

        // Column property om te filteren (default: 'text')
        filterField: 'text',

        // Case sensitivity
        caseSensitive: false,

        listeners: {
            change({ value }) {
                if (value) {
                    console.log(`Filtering columns by: ${value}`);
                }
            }
        }
    }
]
```

### Hoe Het Werkt

```javascript
// ColumnFilterField filtert de columns store
// Columns waarvan de text NIET matched worden verborgen

// Voorbeeld: als je typt "do"
// - "todo" → visible (contains "do")
// - "doing" → visible (contains "do")
// - "review" → hidden (geen "do")
// - "done" → visible (contains "do")
```

---

## 4. SwimlaneFilterField

> **Bron**: `taskboard.d.ts:154831+`

### Widget Definition

```typescript
/**
 * SwimlaneFilterField Widget
 * Filtert swimlanes op basis van hun text property
 */
export class SwimlaneFilterField extends FilterField {
    static readonly isSwimlaneFilterField: boolean;
    static readonly isTaskBoardLinked: boolean;

    readonly isSwimlaneFilterField: boolean;
    readonly isTaskBoardLinked: boolean;
}
```

### Configuratie

```javascript
tbar: [
    {
        type: 'swimlanefilterfield',
        ref: 'swimlaneFilter',
        placeholder: 'Filter swimlanes...',
        width: 180,
        clearable: true,

        listeners: {
            change({ value }) {
                console.log(`Filtering swimlanes by: ${value}`);
            }
        }
    }
]
```

---

## 5. Picker Buttons

### ColumnPickerButton

> **Bron**: `taskboard.d.ts:147607-148373`

```typescript
/**
 * ColumnPickerButton - Button met menu voor column visibility
 */
export class ColumnPickerButton extends Button {
    static readonly isColumnPickerButton: boolean;
    static readonly isTaskBoardLinked: boolean;

    readonly isColumnPickerButton: boolean;
    readonly isTaskBoardLinked: boolean;
}
```

### Configuratie

```javascript
tbar: [
    {
        type: 'columnpickerbutton',
        ref: 'columnPicker',

        // Button tekst (optioneel)
        text: 'Columns',

        // Icon (default: kolom icon)
        icon: 'b-fa-columns',

        // Tooltip
        tooltip: 'Show/hide columns',

        // Menu configuratie
        menu: {
            cls: 'column-picker-menu',
            width: 200
        }
    }
]
```

### Werking

```javascript
// Wanneer je op de ColumnPickerButton klikt:
// 1. Er verschijnt een menu met checkboxes
// 2. Elke column heeft een checkbox
// 3. Unchecken verbergt de column (column.hidden = true)
// 4. Checken toont de column (column.hidden = false)

// Programmatisch kolommen verbergen
taskBoard.columns.getById('backlog').hidden = true;
taskBoard.columns.getById('backlog').hidden = false;
```

### SwimlanePickerButton

```javascript
tbar: [
    {
        type: 'swimlanepickerbutton',
        ref: 'swimlanePicker',
        text: 'Swimlanes',
        icon: 'b-fa-bars',
        tooltip: 'Show/hide swimlanes'
    }
]
```

---

## 6. FilterBar Feature

> **Bron**: `taskboard.d.ts:128843-129026`

### FilterBar Config Interface

```typescript
/**
 * FilterBar Feature Configuration
 * Bron: taskboard.d.ts:128845-129026
 */
type FilterBarConfig = {
    type?: 'filterBar' | 'filterbar';

    /**
     * Regular expressions toestaan in zoekopdracht
     * @default false
     */
    allowRegExp?: boolean;

    /**
     * Feature disabled state
     */
    disabled?: boolean | 'inert';

    /**
     * De velden van TaskModel om te doorzoeken
     * @default ['name']
     */
    fields?: string[];

    /**
     * Match highlights tonen in kaarten
     * @default true
     */
    highlightMatches?: boolean;

    /**
     * Match modus
     * - 'substring': match anywhere in string
     * - 'word': match whole words
     * - 'startsWith': match at beginning
     * @default 'substring'
     */
    matchMode?: 'substring' | 'word' | 'startsWith';

    /**
     * Event listeners
     */
    listeners?: FilterBarListeners;
};
```

### Configuratie Voorbeelden

```javascript
const taskBoard = new TaskBoard({
    features: {
        // Boolean voor default settings
        filterBar: true,

        // Of met volledige configuratie
        filterBar: {
            // Welke velden doorzoeken
            fields: ['name', 'description', 'notes', 'category'],

            // Highlight matches in cards
            highlightMatches: true,

            // Match mode
            matchMode: 'substring',  // 'substring', 'word', 'startsWith'

            // Regular expressions toestaan
            allowRegExp: false
        }
    }
});
```

### Match Mode Voorbeelden

```javascript
// Zoekterm: "test"

// matchMode: 'substring' (default)
// "Testing the app" → MATCH
// "Contest winner" → MATCH
// "A test case" → MATCH

// matchMode: 'startsWith'
// "Testing the app" → MATCH
// "Contest winner" → NO MATCH
// "A test case" → NO MATCH

// matchMode: 'word'
// "This is a test" → MATCH (hele woord)
// "Testing" → NO MATCH (onderdeel van woord)
// "Contest" → NO MATCH (onderdeel van woord)
```

### Highlight Styling

```css
/* Match highlighting in cards */
.b-filter-highlight {
    background-color: #ffff00;
    font-weight: bold;
    padding: 0 2px;
    border-radius: 2px;
}

/* Custom highlighting */
.b-taskboard-card .b-filter-highlight {
    background: linear-gradient(180deg, transparent 60%, rgba(255, 215, 0, 0.4) 60%);
    font-weight: 600;
}

/* Dark theme compatible */
.b-theme-dark .b-filter-highlight {
    background-color: rgba(255, 255, 0, 0.3);
    color: #fff;
}
```

---

## 7. Programmatisch Filteren

### Task Store Filtering

```javascript
const taskStore = taskBoard.project.taskStore;

// === SIMPELE FILTER ===

// Filter op één property
taskStore.filter({
    property: 'status',
    value: 'doing'
});

// Filter met operator
taskStore.filter({
    property: 'weight',
    operator: '>',
    value: 5
});

// === MULTIPLE FILTERS ===

// Array van filters (AND logica)
taskStore.filter([
    { property: 'status', value: 'doing' },
    { property: 'prio', operator: '!=', value: 'low' }
]);

// === FILTER FUNCTIE ===

// Custom filter functie
taskStore.filter(task => {
    return task.status !== 'done' && task.prio === 'high';
});

// === FILTER MET ID ===

// Filter met ID voor later verwijderen
taskStore.filter({
    id: 'myCustomFilter',
    filterBy: task => task.weight > 3
});

// Filter verwijderen met ID
taskStore.removeFilter('myCustomFilter');

// === ALLE FILTERS WISSEN ===
taskStore.clearFilters();
```

### Filter Operators

```typescript
/**
 * Alle beschikbare filter operators
 * Bron: taskboard.d.ts:1121-1126
 */
type CollectionCompareOperator =
    // Vergelijkingen
    | '='           // Gelijk aan (default)
    | '!='          // Niet gelijk aan
    | '>'           // Groter dan
    | '>='          // Groter of gelijk aan
    | '<'           // Kleiner dan
    | '<='          // Kleiner of gelijk aan

    // String operaties
    | '*'           // Contains (string)
    | 'startsWith'  // Begint met
    | 'endsWith'    // Eindigt met

    // Array operaties
    | 'isIncludedIn'    // Waarde zit in array
    | 'isNotIncludedIn' // Waarde zit NIET in array
    | 'includes'        // Array bevat waarde
    | 'doesNotInclude'  // Array bevat waarde NIET

    // Empty checks
    | 'empty'       // Is leeg (null, undefined, '', [])
    | 'notEmpty'    // Is niet leeg

    // Range
    | 'between'     // Tussen twee waarden
    | 'notBetween'  // Niet tussen twee waarden

    // Date operaties
    | 'sameDay'     // Zelfde dag
    | 'isToday'     // Vandaag
    | 'isTomorrow'  // Morgen
    | 'isYesterday' // Gisteren
    | 'isThisWeek'  // Deze week
    | 'isLastWeek'  // Vorige week
    | 'isNextWeek'  // Volgende week
    | 'isThisMonth' // Deze maand
    | 'isLastMonth' // Vorige maand
    | 'isNextMonth' // Volgende maand
    | 'isThisYear'  // Dit jaar
    | 'isLastYear'  // Vorig jaar
    | 'isNextYear'  // Volgend jaar
    | 'isYearToDate'// Year to date

    // Boolean
    | 'isTrue'      // Is true
    | 'isFalse'     // Is false

    // Logical
    | 'or'          // OF logica
    | 'and';        // EN logica
```

### Filter Operator Voorbeelden

```javascript
const taskStore = taskBoard.project.taskStore;

// === STRING OPERATORS ===

// Contains
taskStore.filter({
    property: 'name',
    operator: '*',
    value: 'urgent'
});

// Starts with
taskStore.filter({
    property: 'name',
    operator: 'startsWith',
    value: 'Feature:'
});

// Ends with
taskStore.filter({
    property: 'name',
    operator: 'endsWith',
    value: '(WIP)'
});

// === DATE OPERATORS ===

// Due today
taskStore.filter({
    property: 'endDate',
    operator: 'isToday'
});

// Due this week
taskStore.filter({
    property: 'endDate',
    operator: 'isThisWeek'
});

// Due between dates
taskStore.filter({
    property: 'endDate',
    operator: 'between',
    value: [new Date('2024-01-01'), new Date('2024-01-31')]
});

// === ARRAY OPERATORS ===

// Status is in lijst
taskStore.filter({
    property: 'status',
    operator: 'isIncludedIn',
    value: ['todo', 'doing']
});

// Tags array bevat waarde
taskStore.filter({
    property: 'tags',
    operator: 'includes',
    value: 'important'
});

// === BOOLEAN OPERATORS ===

// Is flagged
taskStore.filter({
    property: 'flagged',
    operator: 'isTrue'
});

// Is not completed
taskStore.filter({
    property: 'completed',
    operator: 'isFalse'
});

// === EMPTY CHECKS ===

// Has no assignee
taskStore.filter({
    property: 'assignee',
    operator: 'empty'
});

// Has description
taskStore.filter({
    property: 'description',
    operator: 'notEmpty'
});
```

### Column Store Filtering

```javascript
const columnStore = taskBoard.columns;

// Column verbergen via filter
columnStore.filter({
    property: 'id',
    operator: '!=',
    value: 'done'
});

// Alleen columns met taken tonen
columnStore.filter(column => {
    return column.tasks.length > 0;
});

// Filter op custom property
columnStore.filter({
    property: 'category',
    value: 'active'
});

// Filters wissen
columnStore.clearFilters();
```

### Swimlane Store Filtering

```javascript
const swimlaneStore = taskBoard.swimlanes;

// Swimlane verbergen
swimlaneStore.filter({
    property: 'id',
    operator: '!=',
    value: 'low'
});

// Alleen swimlanes met taken
swimlaneStore.filter(swimlane => {
    return swimlane.tasks.length > 0;
});

// Filters wissen
swimlaneStore.clearFilters();
```

---

## 8. Chain Filters

### Wat is chainFilters?

```javascript
// KRITISCH voor correcte filtering!
// TaskBoard columns hebben elk hun eigen store (chained van project.taskStore)

const taskBoard = new TaskBoard({
    // Zorgt dat filters van master store doorwerken naar column stores
    chainFilters: true
});
```

### Hoe Chain Filters Werkt

```
┌─────────────────────────────────────────────────────────────────┐
│                    Project TaskStore (master)                   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                 Filter Applied Here                      │   │
│   │           taskStore.filter({ status: 'doing' })          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                    chainFilters: true                            │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐              │
│         ▼                    ▼                    ▼              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│  │  Todo Col   │     │  Doing Col  │     │  Done Col   │        │
│  │   Store     │     │   Store     │     │   Store     │        │
│  │  (chained)  │     │  (chained)  │     │  (chained)  │        │
│  │             │     │             │     │             │        │
│  │  Receives   │     │  Receives   │     │  Receives   │        │
│  │  filter     │     │  filter     │     │  filter     │        │
│  └─────────────┘     └─────────────┘     └─────────────┘        │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│   0 tasks shown       5 tasks shown       0 tasks shown          │
│   (filtered out)      (matching)          (filtered out)         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Zonder chainFilters

```javascript
const taskBoard = new TaskBoard({
    chainFilters: false  // DEFAULT!
});

// Filter op master store werkt NIET door naar column stores!
taskBoard.project.taskStore.filter({ property: 'prio', value: 'high' });
// Columns tonen nog steeds ALLE tasks!

// Je moet elke column apart filteren:
taskBoard.columns.forEach(column => {
    // Dit werkt niet - column stores zijn read-only views
});
```

---

## 9. Custom Filter UI

### Quick Filter Buttons

```javascript
const taskBoard = new TaskBoard({
    tbar: [
        // Preset filter buttons
        {
            type: 'buttonGroup',
            items: [
                {
                    text: 'All',
                    pressed: true,
                    toggleGroup: 'filter',
                    onAction: () => {
                        taskBoard.project.taskStore.clearFilters();
                    }
                },
                {
                    text: 'High Priority',
                    toggleGroup: 'filter',
                    onAction: () => {
                        taskBoard.project.taskStore.filter({
                            id: 'quickFilter',
                            property: 'prio',
                            value: 'high'
                        });
                    }
                },
                {
                    text: 'My Tasks',
                    toggleGroup: 'filter',
                    onAction: () => {
                        taskBoard.project.taskStore.filter({
                            id: 'quickFilter',
                            filterBy: task => task.resources.some(
                                r => r.id === currentUserId
                            )
                        });
                    }
                },
                {
                    text: 'Overdue',
                    toggleGroup: 'filter',
                    onAction: () => {
                        taskBoard.project.taskStore.filter({
                            id: 'quickFilter',
                            filterBy: task => {
                                return task.endDate && task.endDate < new Date();
                            }
                        });
                    }
                }
            ]
        },

        '->',

        // Standaard zoekbalk
        { type: 'taskfilterfield' }
    ]
});
```

### Priority Filter Combo

```javascript
tbar: [
    {
        type: 'combo',
        ref: 'priorityFilter',
        label: 'Priority',
        width: 150,
        clearable: true,
        displayField: 'text',
        valueField: 'value',
        items: [
            { value: 'critical', text: '🔥 Critical' },
            { value: 'high', text: 'High' },
            { value: 'medium', text: 'Medium' },
            { value: 'low', text: 'Low' }
        ],
        onChange({ value }) {
            if (value) {
                taskBoard.project.taskStore.filter({
                    id: 'prioFilter',
                    property: 'prio',
                    value
                });
            } else {
                taskBoard.project.taskStore.removeFilter('prioFilter');
            }
        }
    }
]
```

### Status Filter Multiselect

```javascript
tbar: [
    {
        type: 'combo',
        ref: 'statusFilter',
        label: 'Status',
        width: 200,
        clearable: true,
        multiSelect: true,  // Meerdere waarden selecteren
        displayField: 'text',
        valueField: 'value',
        items: [
            { value: 'todo', text: 'Todo' },
            { value: 'doing', text: 'Doing' },
            { value: 'review', text: 'Review' },
            { value: 'done', text: 'Done' }
        ],
        onChange({ value }) {
            if (value && value.length > 0) {
                taskBoard.project.taskStore.filter({
                    id: 'statusFilter',
                    property: 'status',
                    operator: 'isIncludedIn',
                    value
                });
            } else {
                taskBoard.project.taskStore.removeFilter('statusFilter');
            }
        }
    }
]
```

### Date Range Filter

```javascript
tbar: [
    {
        type: 'datefield',
        ref: 'dueDateFilter',
        label: 'Due before',
        width: 180,
        clearable: true,
        onChange({ value }) {
            if (value) {
                taskBoard.project.taskStore.filter({
                    id: 'dueDateFilter',
                    filterBy: task => {
                        return !task.endDate || task.endDate <= value;
                    }
                });
            } else {
                taskBoard.project.taskStore.removeFilter('dueDateFilter');
            }
        }
    },

    {
        type: 'datefield',
        ref: 'dueAfterFilter',
        label: 'Due after',
        width: 180,
        clearable: true,
        onChange({ value }) {
            if (value) {
                taskBoard.project.taskStore.filter({
                    id: 'dueAfterFilter',
                    filterBy: task => {
                        return task.endDate && task.endDate >= value;
                    }
                });
            } else {
                taskBoard.project.taskStore.removeFilter('dueAfterFilter');
            }
        }
    }
]
```

### Assignee Filter

```javascript
tbar: [
    {
        type: 'combo',
        ref: 'assigneeFilter',
        label: 'Assignee',
        width: 180,
        clearable: true,
        displayField: 'name',
        valueField: 'id',
        store: taskBoard.project.resourceStore,
        onChange({ value }) {
            if (value) {
                taskBoard.project.taskStore.filter({
                    id: 'assigneeFilter',
                    filterBy: task => {
                        return task.resources.some(r => r.id === value);
                    }
                });
            } else {
                taskBoard.project.taskStore.removeFilter('assigneeFilter');
            }
        }
    }
]
```

---

## 10. Saved Filters (Presets)

### Filter Preset System

```javascript
// Predefined filter presets
const FILTER_PRESETS = {
    myTasks: {
        name: 'My Tasks',
        icon: 'b-fa-user',
        filter: task => task.resourceId === currentUserId ||
            task.resources.some(r => r.id === currentUserId)
    },

    urgent: {
        name: 'Urgent',
        icon: 'b-fa-fire',
        filter: [
            { property: 'prio', value: 'high' },
            { property: 'status', operator: '!=', value: 'done' }
        ]
    },

    overdue: {
        name: 'Overdue',
        icon: 'b-fa-clock',
        filter: task => {
            if (!task.endDate) return false;
            if (task.status === 'done') return false;
            return task.endDate < new Date();
        }
    },

    dueToday: {
        name: 'Due Today',
        icon: 'b-fa-calendar-day',
        filter: {
            property: 'endDate',
            operator: 'isToday'
        }
    },

    dueThisWeek: {
        name: 'Due This Week',
        icon: 'b-fa-calendar-week',
        filter: {
            property: 'endDate',
            operator: 'isThisWeek'
        }
    },

    unassigned: {
        name: 'Unassigned',
        icon: 'b-fa-user-slash',
        filter: task => !task.resourceId && task.resources.length === 0
    },

    blocked: {
        name: 'Blocked',
        icon: 'b-fa-ban',
        filter: task => task.blocked === true
    },

    recent: {
        name: 'Recently Modified',
        icon: 'b-fa-history',
        filter: task => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return task.modificationDate >= oneWeekAgo;
        }
    }
};

// Filter preset dropdown
const taskBoard = new TaskBoard({
    tbar: [
        {
            type: 'combo',
            ref: 'presetFilter',
            label: 'Quick Filter',
            width: 200,
            clearable: true,
            displayField: 'name',
            valueField: 'id',
            listItemTpl: data => `
                <i class="${data.icon}"></i>
                ${data.name}
            `,
            items: Object.entries(FILTER_PRESETS).map(([id, preset]) => ({
                id,
                name: preset.name,
                icon: preset.icon
            })),
            onChange({ value }) {
                if (value) {
                    const preset = FILTER_PRESETS[value];
                    applyPresetFilter(preset);
                } else {
                    taskBoard.project.taskStore.clearFilters();
                }
            }
        },

        '->',

        // Standaard zoekbalk
        { type: 'taskfilterfield' }
    ]
});

function applyPresetFilter(preset) {
    const filter = preset.filter;

    if (typeof filter === 'function') {
        taskBoard.project.taskStore.filter({
            id: 'presetFilter',
            filterBy: filter
        });
    } else if (Array.isArray(filter)) {
        // Multiple filters
        taskBoard.project.taskStore.clearFilters();
        filter.forEach((f, i) => {
            taskBoard.project.taskStore.addFilter({
                id: `presetFilter_${i}`,
                ...f
            });
        });
    } else {
        // Single filter object
        taskBoard.project.taskStore.filter({
            id: 'presetFilter',
            ...filter
        });
    }
}
```

---

## 11. Filter Events

### Task Store Filter Events

```javascript
const taskBoard = new TaskBoard({
    project: {
        taskStore: {
            listeners: {
                // Fires wanneer filters veranderen
                filter({ source, filters, oldFilters, records }) {
                    console.log('Filter applied');
                    console.log('Active filters:', filters.count);
                    console.log('Visible records:', records.length);

                    // Update filter indicator
                    updateFilterBadge(filters.count);
                },

                // Fires wanneer filters worden gecleared
                clearFilters({ source }) {
                    console.log('All filters cleared');

                    // Reset filter indicator
                    updateFilterBadge(0);
                }
            }
        }
    }
});

// Helper functie
function updateFilterBadge(count) {
    const badge = document.getElementById('filter-badge');
    if (count > 0) {
        badge.textContent = count;
        badge.classList.add('active');
    } else {
        badge.textContent = '';
        badge.classList.remove('active');
    }
}
```

### TaskBoard Render Events

```javascript
const taskBoard = new TaskBoard({
    listeners: {
        // Fires na elke render (inclusief na filter)
        renderTasks({ taskRecords }) {
            console.log(`Showing ${taskRecords.length} tasks`);

            // Update summary
            updateTaskSummary(taskRecords);
        },

        // Column render
        renderColumn({ columnRecord, taskRecords }) {
            console.log(`Column ${columnRecord.text}: ${taskRecords.length} tasks`);
        }
    }
});

function updateTaskSummary(tasks) {
    const total = taskBoard.project.taskStore.allRecords.length;
    const visible = tasks.length;
    const filtered = total - visible;

    document.getElementById('task-summary').innerHTML = `
        Showing ${visible} of ${total} tasks
        ${filtered > 0 ? `(${filtered} filtered)` : ''}
    `;
}
```

---

## 12. Persist Filter State

### LocalStorage Persistence

```javascript
const STORAGE_KEY = 'taskboard-filters';

// Save filter state
function saveFilterState() {
    const state = {
        // Task filters (alleen serializable filters)
        taskFilters: taskBoard.project.taskStore.filters.values
            .filter(f => !f.filterBy)  // Skip function filters
            .map(f => ({
                id: f.id,
                property: f.property,
                operator: f.operator,
                value: f.value
            })),

        // Preset filter (if any)
        presetFilter: taskBoard.widgetMap.presetFilter?.value,

        // Text search
        searchText: taskBoard.widgetMap.taskFilter?.value,

        // Hidden columns
        hiddenColumns: taskBoard.columns
            .filter(c => c.hidden)
            .map(c => c.id),

        // Hidden swimlanes
        hiddenSwimlanes: taskBoard.swimlanes
            ?.filter(s => s.hidden)
            .map(s => s.id) || []
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log('Filter state saved');
}

// Load filter state
function loadFilterState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        const state = JSON.parse(saved);

        // Restore task filters
        if (state.taskFilters?.length) {
            taskBoard.project.taskStore.filter(state.taskFilters);
        }

        // Restore preset
        if (state.presetFilter && taskBoard.widgetMap.presetFilter) {
            taskBoard.widgetMap.presetFilter.value = state.presetFilter;
        }

        // Restore search text
        if (state.searchText && taskBoard.widgetMap.taskFilter) {
            taskBoard.widgetMap.taskFilter.value = state.searchText;
        }

        // Restore column visibility
        state.hiddenColumns?.forEach(id => {
            const column = taskBoard.columns.getById(id);
            if (column) column.hidden = true;
        });

        // Restore swimlane visibility
        state.hiddenSwimlanes?.forEach(id => {
            const swimlane = taskBoard.swimlanes?.getById(id);
            if (swimlane) swimlane.hidden = true;
        });

        console.log('Filter state restored');
    } catch (e) {
        console.error('Failed to restore filter state:', e);
    }
}

// Auto-save bij wijzigingen
taskBoard.project.taskStore.on('filter', saveFilterState);
taskBoard.columns.on('update', ({ record, changes }) => {
    if ('hidden' in changes) saveFilterState();
});
taskBoard.swimlanes?.on('update', ({ record, changes }) => {
    if ('hidden' in changes) saveFilterState();
});

// Load bij startup
taskBoard.on('paint', loadFilterState, { once: true });
```

### URL Parameter Persistence

```javascript
function updateURLFromFilters() {
    const params = new URLSearchParams();

    // Search query
    const search = taskBoard.widgetMap.taskFilter?.value;
    if (search) params.set('search', search);

    // Priority filter
    const prio = taskBoard.widgetMap.priorityFilter?.value;
    if (prio) params.set('priority', prio);

    // Status filter
    const status = taskBoard.widgetMap.statusFilter?.value;
    if (status?.length) params.set('status', status.join(','));

    // Update URL
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newURL);
}

function loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);

    // Search query
    const search = params.get('search');
    if (search && taskBoard.widgetMap.taskFilter) {
        taskBoard.widgetMap.taskFilter.value = search;
    }

    // Priority filter
    const prio = params.get('priority');
    if (prio && taskBoard.widgetMap.priorityFilter) {
        taskBoard.widgetMap.priorityFilter.value = prio;
    }

    // Status filter
    const status = params.get('status');
    if (status && taskBoard.widgetMap.statusFilter) {
        taskBoard.widgetMap.statusFilter.value = status.split(',');
    }
}

// Load bij startup
loadFiltersFromURL();
```

---

## 13. Filter Performance

### Large Dataset Optimization

```javascript
const taskBoard = new TaskBoard({
    // Enable virtualization
    virtualize: true,

    // Chain filters voor correcte werking
    chainFilters: true,

    project: {
        taskStore: {
            // Batch filter updates
            suspendAutoCommit: false
        }
    }
});

// Batch multiple filter changes
function applyMultipleFilters(filters) {
    const store = taskBoard.project.taskStore;

    // Suspend events
    store.suspendAutoCommit();

    // Clear existing filters
    store.clearFilters(true);  // silent

    // Add all filters
    filters.forEach((filter, i) => {
        store.addFilter({
            id: `filter_${i}`,
            ...filter
        }, true);  // silent
    });

    // Resume and trigger single update
    store.resumeAutoCommit();
}
```

### Debounced Filter Input

```javascript
import { debounce } from 'lodash';

const debouncedFilter = debounce((value) => {
    if (value) {
        taskBoard.project.taskStore.filter({
            id: 'searchFilter',
            property: 'name',
            operator: '*',
            value
        });
    } else {
        taskBoard.project.taskStore.removeFilter('searchFilter');
    }
}, 300);

tbar: [
    {
        type: 'textfield',
        ref: 'searchField',
        placeholder: 'Search...',
        listeners: {
            input({ value }) {
                debouncedFilter(value);
            }
        }
    }
]
```

---

## 14. Complete Implementatie Voorbeeld

### Full-Featured Filter Toolbar

```javascript
import {
    TaskBoard,
    StringHelper,
    Toast
} from '@bryntum/taskboard';

// Current user (voor "My Tasks" filter)
const currentUserId = 'user1';

// Filter presets
const FILTER_PRESETS = {
    all: { name: 'All Tasks', icon: 'b-fa-list' },
    myTasks: {
        name: 'My Tasks',
        icon: 'b-fa-user',
        filter: task => task.resources.some(r => r.id === currentUserId)
    },
    urgent: {
        name: 'Urgent',
        icon: 'b-fa-fire',
        filter: [
            { property: 'prio', value: 'high' },
            { property: 'status', operator: '!=', value: 'done' }
        ]
    },
    overdue: {
        name: 'Overdue',
        icon: 'b-fa-clock',
        filter: task => task.endDate && task.endDate < new Date() && task.status !== 'done'
    },
    dueThisWeek: {
        name: 'Due This Week',
        icon: 'b-fa-calendar-week',
        filter: { property: 'endDate', operator: 'isThisWeek' }
    },
    unassigned: {
        name: 'Unassigned',
        icon: 'b-fa-user-slash',
        filter: task => task.resources.length === 0
    }
};

const taskBoard = new TaskBoard({
    appendTo: 'container',

    // KRITISCH
    chainFilters: true,

    features: {
        filterBar: {
            fields: ['name', 'description'],
            highlightMatches: true
        }
    },

    columns: [
        { id: 'backlog', text: 'Backlog', color: 'gray' },
        { id: 'todo', text: 'Todo', color: 'purple' },
        { id: 'doing', text: 'Doing', color: 'orange' },
        { id: 'review', text: 'Review', color: 'blue' },
        { id: 'done', text: 'Done', color: 'green' }
    ],
    columnField: 'status',

    swimlanes: [
        { id: 'critical', text: '🔥 Critical', color: 'red' },
        { id: 'high', text: 'High', color: 'orange' },
        { id: 'normal', text: 'Normal', color: 'blue' },
        { id: 'low', text: 'Low', color: 'gray' }
    ],
    swimlaneField: 'priority',

    tbar: [
        // === ROW 1: Quick filters ===
        {
            type: 'buttonGroup',
            ref: 'quickFilters',
            items: Object.entries(FILTER_PRESETS).map(([id, preset]) => ({
                ref: `filter_${id}`,
                text: preset.name,
                icon: preset.icon,
                toggleGroup: 'quickFilter',
                pressed: id === 'all',
                onAction() {
                    applyQuickFilter(id, preset);
                }
            }))
        },

        // Separator
        '|',

        // Priority filter
        {
            type: 'combo',
            ref: 'priorityFilter',
            label: 'Priority',
            width: 150,
            clearable: true,
            items: [
                { value: 'critical', text: '🔥 Critical' },
                { value: 'high', text: 'High' },
                { value: 'normal', text: 'Normal' },
                { value: 'low', text: 'Low' }
            ],
            onChange({ value }) {
                applyFilter('priority', value ? {
                    property: 'priority',
                    value
                } : null);
            }
        },

        // Assignee filter
        {
            type: 'combo',
            ref: 'assigneeFilter',
            label: 'Assignee',
            width: 180,
            clearable: true,
            displayField: 'name',
            valueField: 'id',
            store: {
                data: [] // Populated from project.resourceStore
            },
            onChange({ value }) {
                applyFilter('assignee', value ? {
                    filterBy: task => task.resources.some(r => r.id === value)
                } : null);
            }
        },

        // Spacer
        '->',

        // Filter count badge
        {
            type: 'widget',
            ref: 'filterBadge',
            html: '<span class="filter-badge"></span>'
        },

        // Clear all filters
        {
            type: 'button',
            ref: 'clearFiltersBtn',
            icon: 'b-fa-times',
            text: 'Clear',
            disabled: true,
            onClick() {
                clearAllFilters();
            }
        },

        // Separator
        '|',

        // Task search
        {
            type: 'taskfilterfield',
            ref: 'taskFilter',
            width: 250,
            placeholder: 'Search tasks...'
        },

        // Separator
        '|',

        // Column picker
        { type: 'columnpickerbutton' },

        // Swimlane picker
        { type: 'swimlanepickerbutton' }
    ],

    project: {
        loadUrl: 'data/data.json',
        autoLoad: true
    },

    listeners: {
        // Update filter badge
        renderTasks({ taskRecords }) {
            updateFilterUI(taskRecords);
        }
    }
});

// Active filters tracking
const activeFilters = new Map();

function applyQuickFilter(id, preset) {
    // Clear existing quick filter
    taskBoard.project.taskStore.removeFilter('quickFilter');

    if (id === 'all' || !preset.filter) {
        return;
    }

    const filter = preset.filter;

    if (typeof filter === 'function') {
        taskBoard.project.taskStore.filter({
            id: 'quickFilter',
            filterBy: filter
        });
    } else if (Array.isArray(filter)) {
        taskBoard.project.taskStore.filter({
            id: 'quickFilter',
            filterBy: task => {
                return filter.every(f => {
                    const value = task[f.property];
                    if (f.operator === '!=') return value !== f.value;
                    return value === f.value;
                });
            }
        });
    } else {
        taskBoard.project.taskStore.filter({
            id: 'quickFilter',
            ...filter
        });
    }
}

function applyFilter(name, filterConfig) {
    if (filterConfig) {
        activeFilters.set(name, filterConfig);
        taskBoard.project.taskStore.filter({
            id: `custom_${name}`,
            ...filterConfig
        });
    } else {
        activeFilters.delete(name);
        taskBoard.project.taskStore.removeFilter(`custom_${name}`);
    }

    updateClearButton();
}

function clearAllFilters() {
    // Clear all stores
    taskBoard.project.taskStore.clearFilters();
    activeFilters.clear();

    // Reset UI
    taskBoard.widgetMap.priorityFilter.value = null;
    taskBoard.widgetMap.assigneeFilter.value = null;
    taskBoard.widgetMap.taskFilter.clear();

    // Reset quick filter to "All"
    taskBoard.widgetMap.filter_all.pressed = true;

    updateClearButton();

    Toast.show('All filters cleared');
}

function updateClearButton() {
    const hasFilters = taskBoard.project.taskStore.filters.count > 0;
    taskBoard.widgetMap.clearFiltersBtn.disabled = !hasFilters;
}

function updateFilterUI(visibleTasks) {
    const total = taskBoard.project.taskStore.allRecords.length;
    const visible = visibleTasks.length;
    const filtered = total - visible;

    // Update badge
    const badge = taskBoard.widgetMap.filterBadge.element.querySelector('.filter-badge');
    if (filtered > 0) {
        badge.textContent = `${visible}/${total}`;
        badge.classList.add('active');
    } else {
        badge.textContent = '';
        badge.classList.remove('active');
    }

    updateClearButton();
}

// Populate assignee filter when resources load
taskBoard.project.on('load', () => {
    const assigneeCombo = taskBoard.widgetMap.assigneeFilter;
    assigneeCombo.store.data = taskBoard.project.resourceStore.records.map(r => ({
        id: r.id,
        name: r.name
    }));
});
```

### CSS voor Filter UI

```css
/* Filter badge */
.filter-badge {
    display: inline-block;
    padding: 2px 8px;
    background: var(--primary-color);
    color: white;
    border-radius: 12px;
    font-size: 0.85em;
    font-weight: 600;
    min-width: 20px;
    text-align: center;
}

.filter-badge:empty {
    display: none;
}

.filter-badge.active {
    animation: badgePulse 0.3s ease;
}

@keyframes badgePulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

/* Filter highlight in cards */
.b-filter-highlight {
    background: linear-gradient(180deg, transparent 50%, rgba(255, 215, 0, 0.5) 50%);
    font-weight: 600;
    padding: 0 2px;
}

/* Quick filter buttons */
.b-buttongroup .b-pressed {
    background: var(--primary-color) !important;
    color: white !important;
}

/* Filter field styling */
.b-taskfilterfield {
    --textfield-background-color: rgba(255, 255, 255, 0.1);
}

.b-taskfilterfield input {
    border-radius: 20px;
    padding-left: 35px;
}

.b-taskfilterfield::before {
    content: '\f002';  /* search icon */
    font-family: 'Font Awesome 5 Free';
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}
```

---

## 15. Troubleshooting

### Common Issues

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Filters werken niet | `chainFilters: false` | Zet `chainFilters: true` |
| Column filter toont alles | Filter op verkeerde store | Gebruik `taskBoard.columns` niet `project.taskStore` |
| Filters verdwijnen na reload | Geen persistence | Implementeer localStorage/URL persistence |
| Performance traag | Te veel filters | Batch filters, gebruik debounce |
| Highlight werkt niet | FilterBar niet enabled | Enable `filterBar` feature |
| Filters combineren niet | Aparte filter IDs | Gebruik unieke IDs per filter |

### Debug Helpers

```javascript
// Log alle actieve filters
function logActiveFilters() {
    const taskFilters = taskBoard.project.taskStore.filters.values;
    console.log('Task filters:', taskFilters.map(f => ({
        id: f.id,
        property: f.property,
        operator: f.operator,
        value: f.value
    })));

    const columnFilters = taskBoard.columns.filters?.values;
    console.log('Column filters:', columnFilters);

    const swimlaneFilters = taskBoard.swimlanes?.filters?.values;
    console.log('Swimlane filters:', swimlaneFilters);
}

// Test filter
function testFilter(filterConfig) {
    const store = taskBoard.project.taskStore;
    const before = store.count;

    store.filter({ id: 'test', ...filterConfig });

    const after = store.count;
    console.log(`Filter test: ${before} → ${after} records (${before - after} filtered)`);

    store.removeFilter('test');
}
```

---

## Referenties

| Item | Locatie |
|------|---------|
| FilterBar Feature | `taskboard.d.ts:128843-129026` |
| FilterBarConfig | `taskboard.d.ts:128845-129026` |
| TaskFilterField | `taskboard.d.ts:165451-165489` |
| ColumnFilterField | `taskboard.d.ts:147236-147279` |
| SwimlaneFilterField | `taskboard.d.ts:154831+` |
| ColumnPickerButton | `taskboard.d.ts:147607-148373` |
| SwimlanePickerButton | `taskboard.d.ts:155197+` |
| CollectionFilter Operators | `taskboard.d.ts:1121-1126` |
| Store.filter() | `taskboard.d.ts:7084-7088` |
| Store.addFilter() | `taskboard.d.ts:6970` |
| Store.removeFilter() | `taskboard.d.ts:7390` |
| Store.clearFilters() | `taskboard.d.ts:7032` |
| chainFilters | `taskboard.d.ts:2976-2978` |
| Filtering Example | `examples/filtering/app.module.js` |

---

*Laatst bijgewerkt: December 2024*
