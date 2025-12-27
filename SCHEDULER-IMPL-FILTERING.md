# SchedulerPro Implementation: Filtering

## Overview

SchedulerPro provides comprehensive filtering capabilities:
- **Store Filtering**: StoreFilter mixin for programmatic filtering
- **Filter Feature**: Grid header context menu filtering
- **FilterBar Feature**: Persistent filter row in column headers
- **EventFilter Feature**: Filter events from timeline header menu
- **ResourceFilter Widget**: List widget for resource selection

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Filtering Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│  Store Layer (StoreFilter mixin)                                 │
│  ├── filters Collection                                          │
│  ├── addFilter() / removeFilter()                                │
│  ├── filter() / clearFilters()                                   │
│  └── filterBy() for custom functions                            │
├─────────────────────────────────────────────────────────────────┤
│  CollectionFilter                                                │
│  ├── property - Field to filter                                  │
│  ├── operator - Comparison operator                              │
│  ├── value - Value to match                                      │
│  └── filterBy - Custom filter function                          │
├─────────────────────────────────────────────────────────────────┤
│  UI Features                                                     │
│  ├── Filter - Column header menu filtering                      │
│  ├── FilterBar - Persistent filter row                          │
│  ├── EventFilter - Timeline header menu                         │
│  └── ResourceFilter - Resource selection widget                 │
└─────────────────────────────────────────────────────────────────┘
```

## CollectionFilter Configuration

### Filter Config Object

```javascript
// CollectionFilterConfig type
type CollectionFilterConfig = {
    // Field to filter on
    property?: string;

    // Comparison operator
    operator?: CollectionCompareOperator;

    // Value to compare against
    value?: any;

    // Custom filter function
    filterBy?: (data: any) => boolean;

    // Case sensitivity (default: true)
    caseSensitive?: boolean;

    // Disable filter
    disabled?: boolean;

    // Unique filter ID
    id?: string;

    // Internal filter (survives clearFilters)
    internal?: boolean;

    // Value converter function
    convert?: (value: any) => any;

    // Child filters for complex logic
    children?: CollectionFilterConfig[];
};
```

### Comparison Operators

```javascript
// Available operators
type CollectionCompareOperator =
    | '='         // Equal
    | '!='        // Not equal
    | '>'         // Greater than
    | '>='        // Greater or equal
    | '<'         // Less than
    | '<='        // Less or equal
    | '*'         // Contains (string)
    | 'startsWith'
    | 'endsWith'
    | 'isIncludedIn'  // Value in array
    | 'includesAll'   // Array includes all
    | 'includesAny'   // Array includes any
    | 'empty'         // Empty/null check
    | 'notEmpty'      // Not empty check
    | 'between'       // Range (array value)
    | 'sameDay'       // Date same day
    | 'isToday'       // Date is today
    | 'isTomorrow'    // Date is tomorrow
    | 'isYesterday'   // Date is yesterday
    | 'isThisWeek'    // Date is this week
    | 'isLastWeek'    // Date is last week
    | 'isNextWeek';   // Date is next week
```

## Store Filtering (StoreFilter Mixin)

### Basic Configuration

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        eventStore: {
            // Initial filters
            filters: [
                { property: 'status', value: 'active' },
                { property: 'priority', operator: '>=', value: 3 }
            ],

            // Reapply filter when records added
            reapplyFilterOnAdd: true,

            // Reapply filter when records updated
            reapplyFilterOnUpdate: true
            // Or specify fields:
            // reapplyFilterOnUpdate: { includeFields: ['status', 'priority'] }
        },

        resourceStore: {
            filters: [
                { property: 'department', value: 'Engineering' }
            ]
        }
    }
});
```

### Remote Filtering

```javascript
project: {
    eventStore: {
        // Enable remote filtering
        remoteFilter: true,

        // Parameter name for filters
        filterParamName: 'filters',

        // Custom filter encoding
        encodeFilterParams(filters) {
            return filters.map(f => ({
                field: f.property,
                op: f.operator,
                val: f.value
            }));
        }
    }
}
```

### Programmatic Filter Methods

```javascript
const store = scheduler.eventStore;

// Add single filter
await store.addFilter({
    property: 'status',
    value: 'pending'
});

// Add filter with ID
await store.addFilter({
    id: 'statusFilter',
    property: 'status',
    operator: '=',
    value: 'active'
});

// Add multiple filters
await store.filter({
    filters: [
        { property: 'status', value: 'active' },
        { property: 'priority', operator: '>', value: 2 }
    ]
});

// Replace all filters
await store.filter({
    replace: true,
    filters: [
        { property: 'category', value: 'meeting' }
    ]
});

// Filter with custom function
await store.filterBy(record => {
    return record.duration > 2 && record.status === 'active';
});

// Remove filter by ID
await store.removeFilter('statusFilter');

// Remove filter by instance
await store.removeFilter(filterInstance);

// Clear all filters
await store.clearFilters();

// Clear silently (no events)
await store.clearFilters(true);
```

### Filter Properties

```javascript
const store = scheduler.eventStore;

// Get filters collection
const filters = store.filters;

// Check if filtered
if (store.isFiltered) {
    console.log('Store has active filters');
}

// Access filter by ID
const statusFilter = store.filters.get('statusFilter');

// Get filtered count
console.log(`${store.count} of ${store.originalCount} visible`);
```

## Filter Feature

Header context menu filtering for Grid columns.

### Enable Filter Feature

```javascript
const scheduler = new SchedulerPro({
    features: {
        filter: {
            // Enable on all columns by default
            defaultEnabled: true
        }
    },

    columns: [
        {
            field: 'name',
            text: 'Name',
            // Enable filtering for this column
            filterable: true
        },
        {
            field: 'status',
            text: 'Status',
            // Disable filtering for this column
            filterable: false
        },
        {
            field: 'priority',
            text: 'Priority',
            // Custom filter configuration
            filterable: {
                // Custom filter function
                filterFn: ({ value, record }) => {
                    return record.priority >= value;
                }
            }
        }
    ]
});
```

### Show Filter Editor Programmatically

```javascript
// Show filter editor for column
scheduler.features.filter.showFilterEditor('name', 'John');

// With operator
scheduler.features.filter.showFilterEditor('priority', 5, '>=');

// Close filter editor
scheduler.features.filter.closeFilterEditor();
```

## FilterBar Feature

Persistent filter row below column headers.

### Enable FilterBar

```javascript
const scheduler = new SchedulerPro({
    features: {
        // Enable FilterBar
        filterBar: true,

        // Or with configuration
        filterBar: {
            // Enabled on all columns by default
            defaultEnabled: true,

            // Prioritize column filters over store filters
            prioritizeColumns: false
        }
    },

    columns: [
        {
            field: 'name',
            text: 'Name',
            filterable: {
                filterBar: {
                    // Field type for filter input
                    type: 'text',
                    placeholder: 'Filter name...'
                }
            }
        },
        {
            field: 'status',
            text: 'Status',
            filterable: {
                filterBar: {
                    type: 'combo',
                    items: ['active', 'pending', 'completed']
                }
            }
        },
        {
            field: 'startDate',
            text: 'Start Date',
            filterable: {
                filterBar: {
                    type: 'date'
                }
            }
        },
        {
            field: 'duration',
            text: 'Duration',
            filterable: {
                filterBar: {
                    type: 'number',
                    min: 0
                }
            }
        }
    ]
});
```

### FilterBar Methods

```javascript
const filterBar = scheduler.features.filterBar;

// Show filter bar
filterBar.showFilterBar();

// Hide filter bar
filterBar.hideFilterBar();

// Toggle visibility
filterBar.toggleFilterBar();
```

## EventFilter Feature

Adds event filtering to timeline header context menu.

### Enable EventFilter

```javascript
const scheduler = new SchedulerPro({
    features: {
        // EventFilter is enabled by default
        eventFilter: true,

        // Or configure
        eventFilter: {
            // Feature configuration
        }
    }
});
```

## ResourceFilter Widget

A List widget for filtering events by resource selection.

### Create ResourceFilter Widget

```javascript
import { ResourceFilter } from '@bryntum/schedulerpro';

const resourceFilter = new ResourceFilter({
    appendTo: 'sidebar',

    // Allow multi-select (default: true)
    multiSelect: true,

    // Resource store to display
    store: scheduler.resourceStore,

    // Event store to filter
    eventStore: scheduler.eventStore,

    listeners: {
        change({ value }) {
            console.log('Selected resources:', value);
        }
    }
});
```

### Integrate with Scheduler

```javascript
const scheduler = new SchedulerPro({
    appendTo: 'container',

    // Use with sidebar panel
    tbar: [
        {
            type: 'button',
            text: 'Filter Resources',
            onClick() {
                showResourceFilterPanel();
            }
        }
    ]
});

function showResourceFilterPanel() {
    const popup = new Popup({
        header: 'Select Resources',
        items: [{
            type: 'resourcefilter',
            store: scheduler.resourceStore,
            eventStore: scheduler.eventStore,
            multiSelect: true
        }],
        buttons: {
            ok: {
                text: 'Apply',
                onClick() {
                    popup.close();
                }
            }
        }
    });

    popup.show();
}
```

## Column Filterable Configuration

### Filterable Options

```javascript
columns: [
    {
        field: 'name',
        text: 'Name',

        // Boolean - enable/disable
        filterable: true,

        // Object - detailed configuration
        filterable: {
            // Custom filter function
            filterFn({ value, record }) {
                return record.name.toLowerCase().includes(value.toLowerCase());
            },

            // FilterBar specific
            filterBar: {
                type: 'text',
                placeholder: 'Search...'
            },

            // Filter feature specific
            filter: {
                // Initial filter value
                value: null,

                // Operators available
                operators: ['=', '!=', '*', 'startsWith', 'endsWith']
            }
        }
    },

    // Date column filtering
    {
        field: 'startDate',
        type: 'date',
        text: 'Start',
        filterable: {
            filterBar: {
                type: 'date',
                format: 'YYYY-MM-DD'
            }
        }
    },

    // Number column filtering
    {
        field: 'duration',
        type: 'number',
        text: 'Duration',
        filterable: {
            filterBar: {
                type: 'number',
                min: 0,
                max: 100
            }
        }
    },

    // Combo column filtering
    {
        field: 'category',
        text: 'Category',
        filterable: {
            filterBar: {
                type: 'combo',
                items: ['Meeting', 'Training', 'Review'],
                multiSelect: true
            }
        }
    }
]
```

## Filter Events

### Store Filter Events

```javascript
scheduler.eventStore.on({
    // Before filter applied
    beforeFilter({ filters }) {
        console.log('About to filter with:', filters);
        // Return false to prevent
    },

    // After filter applied
    filter({ filters, records, removed, added }) {
        console.log('Filtered to:', records.length);
        console.log('Removed:', removed.length);
        console.log('Added back:', added.length);
    }
});
```

### Scheduler Filter Events

```javascript
scheduler.on({
    // Store data refreshed (includes filter)
    refresh({ source, action }) {
        if (action === 'filter') {
            console.log('Data filtered');
        }
    },

    // Records changed
    change({ action }) {
        if (action === 'filter') {
            console.log('Filter applied');
        }
    }
});
```

## Chained Store Filtering

### Chain Store with Filters

```javascript
// Create chained store
const chainedStore = scheduler.eventStore.chain(
    // Filter function
    record => record.status === 'active',

    // Sorters
    [{ field: 'startDate' }],

    // Config
    {
        // Apply master store filters
        chainFilters: true
    }
);

// Or with chainedFilterFn
const filteredStore = scheduler.eventStore.chain(null, null, {
    chainedFilterFn: record => {
        return record.resourceId === selectedResourceId;
    }
});
```

## Complete Example

```javascript
import { SchedulerPro, ResourceFilter, Popup } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    features: {
        // Filter feature for column menus
        filter: {
            defaultEnabled: true
        },

        // FilterBar for persistent filters
        filterBar: {
            defaultEnabled: true
        },

        // EventFilter for timeline menu
        eventFilter: true
    },

    project: {
        eventStore: {
            // Reapply filters on changes
            reapplyFilterOnAdd: true,
            reapplyFilterOnUpdate: ['status', 'priority'],

            // Initial filters
            filters: [
                { property: 'status', operator: '!=', value: 'cancelled' }
            ]
        }
    },

    columns: [
        {
            type: 'resourceInfo',
            text: 'Resource',
            width: 150,
            filterable: {
                filterBar: {
                    type: 'text',
                    placeholder: 'Filter resources...'
                }
            }
        },
        {
            field: 'role',
            text: 'Role',
            width: 120,
            filterable: {
                filterBar: {
                    type: 'combo',
                    items: ['Developer', 'Designer', 'Manager', 'Tester']
                }
            }
        }
    ],

    tbar: [
        {
            type: 'button',
            ref: 'filterBtn',
            text: 'Resource Filter',
            icon: 'b-icon b-icon-filter',
            onClick() {
                showResourceFilter();
            }
        },
        {
            type: 'button',
            ref: 'clearBtn',
            text: 'Clear Filters',
            icon: 'b-icon b-icon-clear',
            onClick() {
                clearAllFilters();
            }
        },
        '->',
        {
            type: 'text',
            ref: 'filterStatus',
            text: 'No filters active'
        }
    ],

    listeners: {
        // Track filter changes
        ['eventStore.filter']() {
            updateFilterStatus();
        }
    }
});

// Show resource filter popup
function showResourceFilter() {
    new Popup({
        header: 'Filter by Resource',
        width: 300,
        height: 400,
        items: [{
            type: 'resourcefilter',
            ref: 'resourceFilter',
            store: scheduler.resourceStore,
            eventStore: scheduler.eventStore,
            multiSelect: true,
            height: '100%'
        }],
        buttons: {
            close: {
                text: 'Close',
                onClick() {
                    this.up('popup').close();
                }
            }
        }
    }).show();
}

// Clear all filters
async function clearAllFilters() {
    // Clear event store filters
    await scheduler.eventStore.clearFilters();

    // Clear resource store filters
    await scheduler.resourceStore.clearFilters();

    // Clear FilterBar
    scheduler.features.filterBar.hideFilterBar();
    scheduler.features.filterBar.showFilterBar();
}

// Update status text
function updateFilterStatus() {
    const eventStore = scheduler.eventStore;
    const text = eventStore.isFiltered
        ? `Showing ${eventStore.count} of ${eventStore.originalCount} events`
        : 'No filters active';

    scheduler.widgetMap.filterStatus.text = text;
}

// Programmatic filtering examples
async function filterByStatus(status) {
    await scheduler.eventStore.filter({
        id: 'statusFilter',
        property: 'status',
        value: status
    });
}

async function filterByDateRange(startDate, endDate) {
    await scheduler.eventStore.addFilter({
        id: 'dateRangeFilter',
        filterBy: record => {
            return record.startDate >= startDate &&
                   record.endDate <= endDate;
        }
    });
}

async function filterHighPriority() {
    await scheduler.eventStore.addFilter({
        id: 'priorityFilter',
        property: 'priority',
        operator: '>=',
        value: 8
    });
}

// Complex filter with AND/OR logic
async function applyComplexFilter() {
    await scheduler.eventStore.filter({
        replace: true,
        filters: [{
            // OR group
            operator: 'or',
            children: [
                { property: 'status', value: 'urgent' },
                {
                    // AND group
                    operator: 'and',
                    children: [
                        { property: 'priority', operator: '>=', value: 7 },
                        { property: 'status', value: 'pending' }
                    ]
                }
            ]
        }]
    });
}
```

## CSS for Filtering

```css
/* FilterBar styling */
.b-filter-bar-field {
    padding: 4px;
}

.b-filter-bar-field input {
    font-size: 12px;
}

/* Filtered column indicator */
.b-grid-header.b-filter-active {
    background-color: rgba(0, 123, 255, 0.1);
}

.b-grid-header.b-filter-active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #007bff;
}

/* Filter popup */
.b-filter-popup {
    min-width: 250px;
}

.b-filter-popup .b-field {
    margin: 8px;
}

/* ResourceFilter widget */
.b-resourcefilter {
    border: 1px solid #ddd;
    border-radius: 4px;
}

.b-resourcefilter .b-list-item {
    padding: 8px 12px;
}

.b-resourcefilter .b-list-item.b-selected {
    background-color: #007bff;
    color: white;
}

/* Filter status indicator */
.filter-status {
    font-size: 12px;
    color: #666;
}

.filter-status.active {
    color: #007bff;
    font-weight: bold;
}
```

## Best Practices

1. **Use Filter IDs**: Always assign IDs for programmatic filter management
2. **Remote Filtering**: Use for large datasets to reduce client data
3. **Reapply on Update**: Enable reapplyFilterOnUpdate for dynamic filtering
4. **Internal Filters**: Mark permanent filters as `internal: true`
5. **Silent Operations**: Use silent mode for batch operations
6. **Clear Before Replace**: Consider filter({ replace: true }) for complete resets
7. **Event Handling**: Listen to filter events for UI updates
8. **Chained Stores**: Use for complex filtering scenarios

## API Reference Links

- [StoreFilter Mixin](https://bryntum.com/products/schedulerpro/docs/api/Core/data/mixin/StoreFilter)
- [CollectionFilter](https://bryntum.com/products/schedulerpro/docs/api/Core/util/CollectionFilter)
- [Filter Feature](https://bryntum.com/products/schedulerpro/docs/api/Grid/feature/Filter)
- [FilterBar Feature](https://bryntum.com/products/schedulerpro/docs/api/Grid/feature/FilterBar)
- [EventFilter Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/EventFilter)
- [ResourceFilter Widget](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/widget/ResourceFilter)
- [FieldFilterPicker Widget](https://bryntum.com/products/schedulerpro/docs/api/Core/widget/FieldFilterPicker)
