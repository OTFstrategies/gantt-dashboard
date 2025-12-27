# IMPL: Filter System Patterns

> **Implementation Guide** - Hoe Bryntum's filter systeem werkt.

---

## Overzicht

Bryntum biedt meerdere manieren om data te filteren:

```
Filter Approaches:
┌─────────────────────────────────────────────────────────────┐
│ 1. Store.filter()      - Programmatic filtering             │
│ 2. FilterBar feature   - Column header filter inputs        │
│ 3. FieldFilterPicker   - Visual filter builder              │
│ 4. Facet filters       - Checkbox-based category filters    │
│ 5. Quick search        - Text-based search                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Filter Operators

### 1.1 Beschikbare Operators

```typescript
type CollectionCompareOperator =
    // Comparison
    | '='              // Equal
    | '!='             // Not equal
    | '>'              // Greater than
    | '>='             // Greater than or equal
    | '<'              // Less than
    | '<='             // Less than or equal

    // String operations
    | '*'              // Contains (wildcard)
    | 'startsWith'     // Starts with
    | 'endsWith'       // Ends with
    | 'includes'       // String includes
    | 'doesNotInclude' // String does not include

    // Collection operations
    | 'isIncludedIn'   // Value in array
    | 'isNotIncludedIn'// Value not in array

    // Empty checks
    | 'empty'          // Is null/undefined/empty
    | 'notEmpty'       // Has value

    // Range
    | 'between'        // Between two values
    | 'notBetween'     // Not between two values

    // Date operations
    | 'sameDay'        // Same calendar day
    | 'isToday'        // Is today
    | 'isTomorrow'     // Is tomorrow
    | 'isYesterday'    // Is yesterday
    | 'isThisWeek'     // Within current week
    | 'isLastWeek'     // Within last week
    | 'isNextWeek'     // Within next week
    | 'isThisMonth'    // Within current month
    | 'isLastMonth'    // Within last month
    | 'isNextMonth'    // Within next month
    | 'isThisYear'     // Within current year
    | 'isLastYear'     // Within last year
    | 'isNextYear'     // Within next year
    | 'isYearToDate'   // Year to date

    // Boolean
    | 'isTrue'         // Is true
    | 'isFalse'        // Is false

    // Logical
    | 'or'             // Logical OR
    | 'and';           // Logical AND
```

---

## 2. Store Filtering

### 2.1 Basic Filter

```javascript
// Simple filter
taskStore.filter({
    property: 'name',
    operator: '*',
    value: 'Deploy'
});

// Multiple filters
taskStore.filter([
    { property: 'percentDone', operator: '<', value: 100 },
    { property: 'duration', operator: '>', value: 5 }
]);
```

### 2.2 Filter by Function

```javascript
// Custom filter function
taskStore.filterBy(task => {
    return task.name.includes('Critical') && task.percentDone < 50;
});

// Or via filter config
taskStore.filter({
    filterBy: task => task.priority === 'high'
});
```

### 2.3 Named Filters

```javascript
// Add named filter (can be replaced/removed by id)
taskStore.filter({
    id: 'status-filter',
    property: 'status',
    operator: '=',
    value: 'In Progress'
});

// Replace same filter
taskStore.filter({
    id: 'status-filter',
    property: 'status',
    operator: '=',
    value: 'Completed'
});

// Remove specific filter
taskStore.removeFilter('status-filter');

// Clear all filters
taskStore.clearFilters();
```

### 2.4 Filter Options

```javascript
taskStore.filter({
    property: 'name',
    operator: 'startsWith',
    value: 'task',
    caseSensitive: false,  // Case insensitive (default: true)
    replace: true          // Replace existing filters
});
```

---

## 3. FilterBar Feature

### 3.1 Basic Setup

```javascript
const gantt = new Gantt({
    features: {
        filterBar: {
            keyStrokeFilterDelay: 100  // Delay before filtering (ms)
        }
    },

    columns: [
        { type: 'name', width: 250 },
        { type: 'startdate', filterable: true },
        { type: 'duration', filterable: true },
        { type: 'percentdone', filterable: false }  // Disable filtering
    ]
});
```

### 3.2 Column Filter Configuration

```javascript
columns: [
    {
        type: 'name',
        filterable: {
            // Custom filter field type
            filterField: {
                type: 'textfield',
                placeholder: 'Search name...'
            }
        }
    },
    {
        field: 'status',
        filterable: {
            filterField: {
                type: 'combo',
                items: ['Not Started', 'In Progress', 'Completed']
            }
        }
    }
]
```

### 3.3 FilterBar with Picker Config

```javascript
features: {
    filter: {
        pickerConfig: {
            // Restrict which filters can be deleted
            canDeleteFilter: filter => filter.id !== 'permanent-filter',

            // Custom field picker configuration
            getFieldFilterPickerConfig: filter =>
                filter.id === 'permanent-filter'
                    ? { propertyLocked: true, operatorLocked: true }
                    : undefined,

            // Custom field definitions
            fields: {
                colorId: {
                    relatedDisplayField: 'name'
                }
            }
        }
    }
}
```

---

## 4. FieldFilterPicker

### 4.1 GridFieldFilterPickerGroup

```javascript
const filterPickers = new GridFieldFilterPickerGroup({
    // Reference to grid for column definitions
    grid: gantt,

    // Override field definitions
    fields: {
        colorId: {
            relatedDisplayField: 'name'
        }
    },

    // Initial filters
    filters: [
        {
            id: 'permanent-filter-1',
            property: 'percentDone',
            operator: '<',
            value: 100,
            caseSensitive: false
        }
    ],

    // Prevent certain filters from being deleted
    canDeleteFilter: filter => filter.id !== 'permanent-filter-1',

    // Lock property/operator for certain filters
    getFieldFilterPickerConfig: filter =>
        filter.id === 'permanent-filter-1'
            ? { propertyLocked: true, operatorLocked: true }
            : undefined,

    listeners: {
        change: ({ filters }) => {
            // Save filters to localStorage
            localStorage.setItem('filters', JSON.stringify(filters));
        }
    }
});
```

### 4.2 Restoring Saved Filters

```javascript
const savedFiltersJSON = localStorage.getItem('filters');

let savedFilters;
if (savedFiltersJSON) {
    savedFilters = JSON.parse(savedFiltersJSON, (key, value) => {
        // Restore Date objects
        if (key === 'value' && this.type === 'date') {
            return Array.isArray(value)
                ? value.map(v => new Date(v))
                : new Date(value);
        }
        // Restore Duration objects
        if (key === 'value' && this.type === 'duration') {
            return Array.isArray(value)
                ? value.map(v => new Duration(v))
                : new Duration(value);
        }
        return value;
    });
}
```

---

## 5. Facet Filters

### 5.1 Custom Facet Filter Widget

```javascript
class GanttTaskFacetFilter extends Panel {
    static $name = 'GanttTaskFacetFilter';
    static type = 'gantttaskfacetfilter';

    static configurable = {
        layout: 'vbox',
        collapsible: { direction: 'up' },
        gantt: null,
        fieldName: null
    };

    // Get unique values for field
    static getFieldValues(dataStore, fieldName) {
        return dataStore.getDistinctValues(fieldName, true)
            .filter(v => v)
            .sort();
    }

    // Build checkbox items from field values
    refreshOptions() {
        const { fieldName, gantt: { taskStore } } = this;
        const values = GanttTaskFacetFilter.getFieldValues(taskStore, fieldName);

        this.items = values.map(value => ({
            type: 'checkbox',
            checkedValue: value,
            text: String(value),
            fieldName,
            checked: false,
            listeners: {
                change: 'up.onCheckboxChange'
            }
        }));
    }

    // Apply filters based on checked checkboxes
    onCheckboxChange({ source }) {
        const filters = {};
        const { taskStore } = this.gantt;

        // Collect checked values per field
        for (const checkbox of Widget.queryAll('checkbox')) {
            if (checkbox.checked && checkbox.fieldName) {
                filters[checkbox.fieldName] = [
                    ...filters[checkbox.fieldName] ?? [],
                    checkbox.checkedValue
                ];
            }
        }

        // Apply filters
        taskStore.clearFilters();
        for (const fieldName in filters) {
            taskStore.filter({
                id: fieldName,
                property: fieldName,
                operator: 'isIncludedIn',
                value: filters[fieldName]
            });
        }
    }
}

GanttTaskFacetFilter.initClass();
```

### 5.2 Using Facet Filters

```javascript
const container = new Container({
    layout: 'hbox',
    items: {
        facetFilters: {
            type: 'panel',
            layout: 'vbox',
            width: '15em',
            defaults: {
                type: 'gantttaskfacetfilter',
                gantt
            },
            items: {
                status: { fieldName: 'status' },
                priority: { fieldName: 'priority' },
                eventColor: { fieldName: 'eventColor' }
            }
        },
        splitter: { type: 'splitter' },
        gantt
    }
});
```

---

## 6. Quick Search (Toolbar)

### 6.1 Toolbar Filter Field

```javascript
const gantt = new Gantt({
    tbar: {
        items: {
            filterByName: {
                type: 'textfield',
                placeholder: 'Find tasks by name',
                clearable: true,
                keyStrokeChangeDelay: 100,
                triggers: {
                    filter: {
                        align: 'end',
                        cls: 'fa fa-filter'
                    }
                },
                onChange: 'up.onFilterChange'
            }
        }
    },

    onFilterChange({ value }) {
        if (value === '') {
            this.taskStore.clearFilters();
        } else {
            // Escape regex special characters
            const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            this.taskStore.filter({
                filters: task => task.name?.match(new RegExp(escapedValue, 'i')),
                replace: true
            });
        }
    }
});
```

---

## 7. Tree Store Filtering

### 7.1 Filter with Parent Visibility

```javascript
// By default, filtering a tree store shows matching nodes AND their parents
taskStore.filter({
    property: 'name',
    value: 'Deploy'
});

// Result: Matching tasks + their parent hierarchy
```

### 7.2 Filter Options for Trees

```javascript
taskStore.filter({
    property: 'status',
    value: 'Critical',
    // Include filtered out records when iterating
    includeFilteredOutRecords: false
});
```

---

## 8. Eigen Implementatie

### 8.1 Filter Engine

```typescript
interface FilterConfig {
    id?: string;
    property?: string;
    operator?: FilterOperator;
    value?: any;
    filterBy?: (record: any) => boolean;
    caseSensitive?: boolean;
    disabled?: boolean;
}

type FilterOperator =
    | '=' | '!=' | '>' | '>=' | '<' | '<='
    | '*' | 'startsWith' | 'endsWith'
    | 'isIncludedIn' | 'isNotIncludedIn'
    | 'empty' | 'notEmpty'
    | 'between' | 'notBetween';

class FilterEngine {
    private filters: Map<string, FilterConfig> = new Map();
    private filteredData: any[] = [];
    private sourceData: any[] = [];

    setData(data: any[]): void {
        this.sourceData = data;
        this.applyFilters();
    }

    addFilter(filter: FilterConfig): void {
        const id = filter.id || crypto.randomUUID();
        this.filters.set(id, { ...filter, id });
        this.applyFilters();
    }

    removeFilter(id: string): void {
        this.filters.delete(id);
        this.applyFilters();
    }

    clearFilters(): void {
        this.filters.clear();
        this.filteredData = [...this.sourceData];
    }

    private applyFilters(): void {
        if (this.filters.size === 0) {
            this.filteredData = [...this.sourceData];
            return;
        }

        this.filteredData = this.sourceData.filter(record => {
            for (const filter of this.filters.values()) {
                if (filter.disabled) continue;

                if (!this.matchesFilter(record, filter)) {
                    return false;
                }
            }
            return true;
        });
    }

    private matchesFilter(record: any, filter: FilterConfig): boolean {
        // Custom filter function
        if (filter.filterBy) {
            return filter.filterBy(record);
        }

        const { property, operator, value, caseSensitive = true } = filter;
        let recordValue = record[property!];

        // Case insensitive string comparison
        if (!caseSensitive && typeof recordValue === 'string') {
            recordValue = recordValue.toLowerCase();
        }
        const compareValue = !caseSensitive && typeof value === 'string'
            ? value.toLowerCase()
            : value;

        switch (operator) {
            case '=':
                return recordValue === compareValue;
            case '!=':
                return recordValue !== compareValue;
            case '>':
                return recordValue > compareValue;
            case '>=':
                return recordValue >= compareValue;
            case '<':
                return recordValue < compareValue;
            case '<=':
                return recordValue <= compareValue;
            case '*':
                return String(recordValue).includes(String(compareValue));
            case 'startsWith':
                return String(recordValue).startsWith(String(compareValue));
            case 'endsWith':
                return String(recordValue).endsWith(String(compareValue));
            case 'isIncludedIn':
                return Array.isArray(compareValue) && compareValue.includes(recordValue);
            case 'isNotIncludedIn':
                return Array.isArray(compareValue) && !compareValue.includes(recordValue);
            case 'empty':
                return recordValue == null || recordValue === '';
            case 'notEmpty':
                return recordValue != null && recordValue !== '';
            case 'between':
                return Array.isArray(compareValue) &&
                    recordValue >= compareValue[0] &&
                    recordValue <= compareValue[1];
            case 'notBetween':
                return Array.isArray(compareValue) &&
                    (recordValue < compareValue[0] || recordValue > compareValue[1]);
            default:
                return true;
        }
    }

    getFilteredData(): any[] {
        return this.filteredData;
    }

    getActiveFilters(): FilterConfig[] {
        return [...this.filters.values()].filter(f => !f.disabled);
    }
}
```

### 8.2 Tree Filter (met Parent Visibility)

```typescript
interface TreeNode {
    id: string;
    children?: TreeNode[];
    [key: string]: any;
}

class TreeFilterEngine extends FilterEngine {
    private keepParentsVisible = true;

    filterTree(nodes: TreeNode[], filter: FilterConfig): TreeNode[] {
        const result: TreeNode[] = [];

        for (const node of nodes) {
            const matchesSelf = this.nodeMatchesFilter(node, filter);
            const filteredChildren = node.children
                ? this.filterTree(node.children, filter)
                : [];

            // Include node if it matches OR has matching descendants
            if (matchesSelf || filteredChildren.length > 0) {
                result.push({
                    ...node,
                    children: filteredChildren.length > 0 ? filteredChildren : undefined,
                    // Mark if node itself matches (vs just kept for hierarchy)
                    _isFilterMatch: matchesSelf
                });
            }
        }

        return result;
    }

    private nodeMatchesFilter(node: TreeNode, filter: FilterConfig): boolean {
        if (filter.filterBy) {
            return filter.filterBy(node);
        }

        const { property, operator = '=', value } = filter;
        const nodeValue = node[property!];

        // Simplified matching logic
        switch (operator) {
            case '=':
                return nodeValue === value;
            case '*':
                return String(nodeValue).toLowerCase().includes(String(value).toLowerCase());
            default:
                return true;
        }
    }
}
```

### 8.3 Filter UI Component (React)

```tsx
interface FilterPickerProps {
    fields: { name: string; type: string; label: string }[];
    filters: FilterConfig[];
    onChange: (filters: FilterConfig[]) => void;
}

function FilterPicker({ fields, filters, onChange }: FilterPickerProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    const operatorsByType: Record<string, FilterOperator[]> = {
        string: ['=', '!=', '*', 'startsWith', 'endsWith', 'empty', 'notEmpty'],
        number: ['=', '!=', '>', '>=', '<', '<=', 'between', 'empty', 'notEmpty'],
        date: ['=', '!=', '>', '>=', '<', '<=', 'between', 'empty', 'notEmpty'],
        boolean: ['=', '!=']
    };

    const addFilter = () => {
        const newFilter: FilterConfig = {
            id: crypto.randomUUID(),
            property: fields[0].name,
            operator: '=',
            value: ''
        };
        setLocalFilters([...localFilters, newFilter]);
    };

    const removeFilter = (id: string) => {
        setLocalFilters(localFilters.filter(f => f.id !== id));
    };

    const updateFilter = (id: string, updates: Partial<FilterConfig>) => {
        setLocalFilters(localFilters.map(f =>
            f.id === id ? { ...f, ...updates } : f
        ));
    };

    const applyFilters = () => {
        onChange(localFilters);
    };

    return (
        <div className="filter-picker">
            {localFilters.map(filter => {
                const field = fields.find(f => f.name === filter.property);
                const operators = operatorsByType[field?.type || 'string'];

                return (
                    <div key={filter.id} className="filter-row">
                        <select
                            value={filter.property}
                            onChange={e => updateFilter(filter.id!, { property: e.target.value })}
                        >
                            {fields.map(f => (
                                <option key={f.name} value={f.name}>{f.label}</option>
                            ))}
                        </select>

                        <select
                            value={filter.operator}
                            onChange={e => updateFilter(filter.id!, {
                                operator: e.target.value as FilterOperator
                            })}
                        >
                            {operators.map(op => (
                                <option key={op} value={op}>{op}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            value={filter.value || ''}
                            onChange={e => updateFilter(filter.id!, { value: e.target.value })}
                            placeholder="Value..."
                        />

                        <button onClick={() => removeFilter(filter.id!)}>×</button>
                    </div>
                );
            })}

            <div className="filter-actions">
                <button onClick={addFilter}>+ Add Filter</button>
                <button onClick={applyFilters}>Apply</button>
                <button onClick={() => { setLocalFilters([]); onChange([]); }}>Clear</button>
            </div>
        </div>
    );
}
```

### 8.4 Facet Filter Component (React)

```tsx
interface FacetFilterProps {
    field: string;
    label: string;
    data: any[];
    selectedValues: any[];
    onChange: (values: any[]) => void;
}

function FacetFilter({ field, label, data, selectedValues, onChange }: FacetFilterProps) {
    // Get distinct values
    const distinctValues = useMemo(() => {
        const values = new Set<any>();
        data.forEach(record => {
            const value = record[field];
            if (value != null) values.add(value);
        });
        return [...values].sort();
    }, [data, field]);

    const toggleValue = (value: any) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    return (
        <div className="facet-filter">
            <h4>{label}</h4>
            {distinctValues.map(value => (
                <label key={String(value)} className="facet-option">
                    <input
                        type="checkbox"
                        checked={selectedValues.includes(value)}
                        onChange={() => toggleValue(value)}
                    />
                    <span>{String(value)}</span>
                    <span className="count">
                        ({data.filter(r => r[field] === value).length})
                    </span>
                </label>
            ))}
        </div>
    );
}
```

---

## 9. Filter Persistence

### 9.1 URL Parameters

```javascript
// Save filters to URL
function saveFiltersToUrl(filters) {
    const params = new URLSearchParams();
    params.set('filters', JSON.stringify(filters));
    history.replaceState(null, '', `?${params}`);
}

// Load filters from URL
function loadFiltersFromUrl() {
    const params = new URLSearchParams(location.search);
    const filtersJson = params.get('filters');
    return filtersJson ? JSON.parse(filtersJson) : [];
}
```

### 9.2 LocalStorage

```javascript
const STORAGE_KEY = 'gantt-filters';

// Save
function saveFilters(filters) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

// Load with type restoration
function loadFilters() {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return [];

    return JSON.parse(json, (key, value) => {
        // Restore dates
        if (key === 'value' && typeof value === 'string' &&
            /^\d{4}-\d{2}-\d{2}/.test(value)) {
            return new Date(value);
        }
        return value;
    });
}
```

---

## 10. CSS Styling

```css
/* FilterBar styling */
.b-filter-bar-field {
    min-width: 100px;
}

.b-filter-bar-field input {
    border: 1px solid #ddd;
    border-radius: 3px;
    padding: 4px 8px;
}

/* FieldFilterPicker */
.b-fieldfilter-picker {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px;
    background: #f9f9f9;
    border-radius: 4px;
}

.b-fieldfilter-picker select,
.b-fieldfilter-picker input {
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

/* Facet filter */
.facet-filter {
    padding: 12px;
    border-right: 1px solid #eee;
}

.facet-filter h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
}

.facet-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    cursor: pointer;
}

.facet-option .count {
    color: #888;
    font-size: 12px;
    margin-left: auto;
}

/* Active filter indicator */
.b-column-header.b-filter-active {
    background: #e3f2fd;
}

.b-column-header.b-filter-active .b-filter-icon {
    color: #1976d2;
}
```

---

## 11. Cross-References

| Document | Relevante Secties |
|----------|-------------------|
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | Store basics |
| [CLASS-INVENTORY](./CLASS-INVENTORY.md) | Store classes |
| [IMPL-INFINITE-SCROLL](./IMPL-INFINITE-SCROLL.md) | Filtering large datasets |

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
