# SchedulerPro Implementation: Grouping

## Overview

SchedulerPro provides comprehensive grouping capabilities:
- **Store Grouping**: StoreGroup mixin for data-level grouping
- **Group Feature**: Visual grouping with collapsible headers
- **GroupSummary Feature**: Summary rows for groups
- **Event Grouping**: Group events within resource rows
- **TreeGroup Feature**: Multi-level tree grouping

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Grouping System                             │
├─────────────────────────────────────────────────────────────────┤
│  Store Layer (StoreGroup mixin)                                  │
│  ├── groupers[] - Active grouper configurations                 │
│  ├── group() / clearGroupers()                                  │
│  ├── setGroupers() - Apply multiple groupers                    │
│  └── groupHeaderRecords - Generated header records              │
├─────────────────────────────────────────────────────────────────┤
│  Grouper Configuration                                           │
│  ├── field - Field to group by                                   │
│  ├── ascending - Sort direction                                  │
│  └── fn - Custom grouping function                              │
├─────────────────────────────────────────────────────────────────┤
│  UI Features                                                     │
│  ├── Group - Collapsible row groups                             │
│  ├── GroupSummary - Summary rows per group                      │
│  └── TreeGroup - Hierarchical grouping                          │
└─────────────────────────────────────────────────────────────────┘
```

## Grouper Type

```javascript
// Grouper configuration
type Grouper = {
    // Field to group by
    field: string;

    // Sort direction (true = ascending)
    ascending?: boolean;

    // Custom grouping function
    fn?: (record: Model) => any;
};
```

## Store Grouping (StoreGroup Mixin)

### Basic Configuration

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        resourceStore: {
            // Initial groupers
            groupers: [
                { field: 'department' },
                { field: 'role', ascending: false }
            ],

            // Start with groups collapsed
            startGroupsCollapsed: true
        }
    }
});
```

### Programmatic Grouping

```javascript
const store = scheduler.resourceStore;

// Group by single field
await store.group('department');

// Group by field with direction
await store.group({ field: 'department', ascending: false });

// Multiple groupers
await store.setGroupers([
    { field: 'department' },
    { field: 'team' }
]);

// Clear all groupers
await store.clearGroupers();

// Check if grouped
if (store.isGrouped) {
    console.log('Store is grouped');
}

// Get current groupers
console.log('Groupers:', store.groupers);

// Get group header records
console.log('Headers:', store.groupHeaderRecords);
```

### Custom Grouping Function

```javascript
const scheduler = new SchedulerPro({
    project: {
        resourceStore: {
            groupers: [{
                field: 'salary',
                // Custom function to determine group
                fn(record) {
                    const salary = record.salary;
                    if (salary < 50000) return 'Junior';
                    if (salary < 80000) return 'Mid-Level';
                    if (salary < 120000) return 'Senior';
                    return 'Executive';
                }
            }]
        }
    }
});
```

### Store Grouping Events

```javascript
scheduler.resourceStore.on({
    // Grouping changed
    group({ groupers, records }) {
        console.log('Grouped by:', groupers.map(g => g.field));
        console.log('Record count:', records.length);
    }
});
```

## Group Feature

### Enable Group Feature

```javascript
const scheduler = new SchedulerPro({
    features: {
        // Enable grouping
        group: {
            // Field to group by
            field: 'department',

            // Sort direction
            ascending: true,

            // Show record count in headers
            showCount: true,

            // Custom header height
            headerHeight: 40,

            // Toggle on row click
            toggleOnRowClick: true,

            // Custom icons
            expandIconCls: 'b-icon b-icon-expand',
            collapseIconCls: 'b-icon b-icon-collapse'
        }
    }
});
```

### Group Renderer

```javascript
features: {
    group: {
        field: 'department',

        // Custom group header renderer
        renderer({ groupRowFor, record, count, column, isFirstColumn, size }) {
            // Only render in first column
            if (!isFirstColumn) {
                return '';
            }

            // Custom height
            size.height = 50;

            return {
                className: 'custom-group-header',
                children: [
                    {
                        tag: 'span',
                        className: 'group-icon',
                        html: record.meta.collapsed ? '▶' : '▼'
                    },
                    {
                        tag: 'span',
                        className: 'group-title',
                        text: groupRowFor
                    },
                    {
                        tag: 'span',
                        className: 'group-count',
                        text: `(${count} members)`
                    }
                ]
            };
        }
    }
}
```

### Group Sort Function

```javascript
features: {
    group: {
        field: 'priority',

        // Custom sort order for groups
        groupSortFn(first, second) {
            const order = { 'Critical': 1, 'High': 2, 'Medium': 3, 'Low': 4 };
            return order[first.groupRowFor] - order[second.groupRowFor];
        }
    }
}
```

### Dynamic Grouping

```javascript
const scheduler = new SchedulerPro({
    features: {
        group: true
    },

    tbar: [
        {
            type: 'combo',
            label: 'Group by',
            items: [
                { value: '', text: 'None' },
                { value: 'department', text: 'Department' },
                { value: 'role', text: 'Role' },
                { value: 'location', text: 'Location' }
            ],
            onChange({ value }) {
                if (value) {
                    scheduler.features.group.field = value;
                    scheduler.store.group(value);
                } else {
                    scheduler.store.clearGroupers();
                }
            }
        }
    ]
});
```

## GroupSummary Feature

### Enable GroupSummary

```javascript
const scheduler = new SchedulerPro({
    features: {
        group: { field: 'department' },

        // Enable group summaries
        groupSummary: {
            // Show summary in header or footer
            collapseToHeader: false,  // true = show in header when collapsed

            // Target: 'header' or 'footer'
            target: 'footer'
        }
    },

    columns: [
        { type: 'resourceInfo', text: 'Name', width: 200 },
        {
            field: 'salary',
            text: 'Salary',
            type: 'number',
            // Summary configuration per column
            sum: true,       // Enable sum summary
            summaryRenderer({ sum }) {
                return `Total: $${sum.toLocaleString()}`;
            }
        },
        {
            field: 'hours',
            text: 'Hours',
            type: 'number',
            sum: 'average',  // Average instead of sum
            summaryRenderer({ sum }) {
                return `Avg: ${sum.toFixed(1)} hrs`;
            }
        }
    ]
});
```

### Summary Types

```javascript
columns: [
    {
        field: 'value',
        text: 'Value',

        // Built-in summary types
        sum: true,        // Total sum
        sum: 'sum',       // Same as true
        sum: 'count',     // Record count
        sum: 'average',   // Average value
        sum: 'min',       // Minimum value
        sum: 'max',       // Maximum value

        // Custom summary function
        sum: 'mySum',
        summaries: [{
            sum: 'mySum',
            renderer({ sum }) {
                return `Custom: ${sum}`;
            }
        }]
    }
]
```

### Multiple Summaries Per Column

```javascript
columns: [
    {
        field: 'hours',
        text: 'Hours',
        summaries: [
            {
                sum: 'sum',
                label: 'Total'
            },
            {
                sum: 'average',
                label: 'Average'
            },
            {
                sum: 'max',
                label: 'Maximum'
            }
        ],
        summaryRenderer({ sum, label }) {
            return `${label}: ${sum.toFixed(1)}`;
        }
    }
]
```

## Event Grouping (Within Rows)

### Group Events in Row

```javascript
const scheduler = new SchedulerPro({
    // Group events within each resource row
    eventLayout: {
        type: 'stack',

        // Group events by field
        groupBy: 'category',

        // Group order
        groupOrder: ['urgent', 'normal', 'low']
    }
});

// Or with custom function
const scheduler = new SchedulerPro({
    eventLayout: {
        type: 'stack',

        groupBy(eventRecord) {
            // Custom grouping logic
            if (eventRecord.priority > 8) return 'high';
            if (eventRecord.priority > 4) return 'medium';
            return 'low';
        }
    }
});
```

## Collapse/Expand Groups

### Programmatic Control

```javascript
const store = scheduler.resourceStore;

// Collapse a specific group
store.collapse(groupRecord);

// Expand a specific group
store.expand(groupRecord);

// Toggle group state
store.toggleCollapse(groupRecord);

// Collapse all groups
store.collapseAll();

// Expand all groups
store.expandAll();

// Check if group is collapsed
if (groupRecord.meta.collapsed) {
    console.log('Group is collapsed');
}
```

### Collapse/Expand Events

```javascript
scheduler.on({
    // Group toggled
    toggleGroup({ groupRecord, groupRecords, collapse, allRecords }) {
        console.log(
            collapse ? 'Collapsed' : 'Expanded',
            groupRecord.meta.groupRowFor
        );
    }
});
```

## TreeGroup Feature

Multi-level tree grouping for complex hierarchies.

### Enable TreeGroup

```javascript
const scheduler = new SchedulerPro({
    features: {
        // Use TreeGroup instead of Group
        treeGroup: {
            // Define grouping levels
            levels: ['department', 'team', 'role'],

            // Generate parent records
            parentIdField: 'parentId'
        }
    }
});
```

### TreeGroup Configuration

```javascript
features: {
    treeGroup: {
        levels: ['department', 'team'],

        // Custom parent record generation
        transformParentRecords(parentRecords) {
            return parentRecords.map(record => {
                // Add custom properties to generated parents
                record.isGroupParent = true;
                return record;
            });
        },

        // Parent renderer
        parentRenderer({ record, row }) {
            return {
                className: 'tree-group-parent',
                text: record.name
            };
        }
    }
}
```

## Group Feature Events

```javascript
const scheduler = new SchedulerPro({
    features: {
        group: true
    },

    listeners: {
        // Before group collapse/expand
        beforeToggleGroup({ groupRecord, collapse }) {
            // Return false to prevent
            if (groupRecord.groupChildren.some(r => r.hasChanges)) {
                return false;  // Prevent collapse if unsaved changes
            }
        },

        // After group toggle
        toggleGroup({ groupRecord, collapse }) {
            console.log(`Group ${groupRecord.meta.groupRowFor}`,
                collapse ? 'collapsed' : 'expanded');
        }
    }
});
```

## Complete Example

```javascript
import { SchedulerPro, DateHelper } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    features: {
        // Enable grouping
        group: {
            field: 'department',
            ascending: true,
            showCount: true,
            headerHeight: 45,

            // Custom group header
            renderer({ groupRowFor, count, isFirstColumn, size }) {
                if (!isFirstColumn) return '';

                size.height = 45;

                return {
                    className: 'department-group',
                    children: [
                        {
                            tag: 'div',
                            className: 'group-info',
                            children: [
                                {
                                    tag: 'span',
                                    className: 'group-name',
                                    text: groupRowFor
                                },
                                {
                                    tag: 'span',
                                    className: 'group-count',
                                    text: `${count} resources`
                                }
                            ]
                        }
                    ]
                };
            }
        },

        // Enable group summaries
        groupSummary: {
            collapseToHeader: true
        }
    },

    project: {
        resourceStore: {
            // Start grouped
            groupers: [{ field: 'department' }],

            // Groups collapsed initially
            startGroupsCollapsed: false
        }
    },

    columns: [
        {
            type: 'resourceInfo',
            text: 'Resource',
            width: 200
        },
        {
            field: 'role',
            text: 'Role',
            width: 120
        },
        {
            field: 'allocation',
            text: 'Allocation',
            type: 'percent',
            width: 100,
            sum: 'average',
            summaryRenderer({ sum }) {
                return `Avg: ${sum.toFixed(0)}%`;
            }
        },
        {
            field: 'hourlyRate',
            text: 'Rate',
            type: 'number',
            width: 100,
            renderer({ value }) {
                return `$${value}/hr`;
            },
            sum: 'average',
            summaryRenderer({ sum }) {
                return `Avg: $${sum.toFixed(2)}/hr`;
            }
        }
    ],

    tbar: [
        {
            type: 'combo',
            ref: 'groupBy',
            label: 'Group by',
            width: 200,
            items: [
                { value: '', text: 'No Grouping' },
                { value: 'department', text: 'Department' },
                { value: 'role', text: 'Role' },
                { value: 'location', text: 'Location' }
            ],
            value: 'department',
            onChange({ value }) {
                changeGrouping(value);
            }
        },
        '|',
        {
            type: 'button',
            text: 'Expand All',
            icon: 'b-icon b-icon-expand',
            onClick() {
                scheduler.resourceStore.expandAll();
            }
        },
        {
            type: 'button',
            text: 'Collapse All',
            icon: 'b-icon b-icon-collapse',
            onClick() {
                scheduler.resourceStore.collapseAll();
            }
        },
        '->',
        {
            type: 'text',
            ref: 'groupInfo',
            text: ''
        }
    ],

    listeners: {
        // Track group changes
        toggleGroup({ groupRecord, collapse }) {
            updateGroupInfo();
        },

        // Store group event
        ['resourceStore.group']() {
            updateGroupInfo();
        }
    }
});

// Change grouping
async function changeGrouping(field) {
    if (field) {
        await scheduler.resourceStore.group(field);
        scheduler.features.group.field = field;
    } else {
        await scheduler.resourceStore.clearGroupers();
    }
    updateGroupInfo();
}

// Update info display
function updateGroupInfo() {
    const store = scheduler.resourceStore;

    if (store.isGrouped) {
        const groupCount = store.groupHeaderRecords.length;
        const collapsedCount = store.groupHeaderRecords.filter(
            r => r.meta.collapsed
        ).length;

        scheduler.widgetMap.groupInfo.text =
            `${groupCount} groups (${collapsedCount} collapsed)`;
    } else {
        scheduler.widgetMap.groupInfo.text = 'No grouping';
    }
}

// Multi-level grouping
async function applyMultiLevelGrouping() {
    await scheduler.resourceStore.setGroupers([
        { field: 'department' },
        { field: 'team' }
    ]);
}

// Custom grouping with computed values
async function groupByWorkload() {
    await scheduler.resourceStore.setGroupers([{
        field: 'allocation',
        fn(record) {
            const allocation = record.allocation || 0;
            if (allocation >= 100) return 'Overallocated';
            if (allocation >= 80) return 'High Load';
            if (allocation >= 50) return 'Medium Load';
            return 'Available';
        }
    }]);
}

// Initialize
updateGroupInfo();
```

## CSS for Grouping

```css
/* Group header styling */
.b-group-row {
    background: linear-gradient(to right, #f5f5f5, #fff);
    font-weight: 600;
}

.b-group-row .b-grid-cell {
    border-bottom: 2px solid #ddd;
}

/* Custom group header */
.department-group {
    display: flex;
    align-items: center;
    padding: 8px 12px;
}

.department-group .group-info {
    display: flex;
    flex-direction: column;
}

.department-group .group-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.department-group .group-count {
    font-size: 11px;
    color: #666;
    font-weight: normal;
}

/* Collapse/expand icons */
.b-group-row .b-tree-expander {
    width: 20px;
    height: 20px;
    margin-right: 8px;
}

.b-group-row.b-collapsed .b-tree-expander::before {
    content: '▶';
}

.b-group-row:not(.b-collapsed) .b-tree-expander::before {
    content: '▼';
}

/* Group summary styling */
.b-group-footer {
    background: #f9f9f9;
    font-style: italic;
}

.b-group-footer .b-grid-cell {
    border-top: 1px solid #ddd;
}

/* Hover effects */
.b-group-row:hover {
    background: linear-gradient(to right, #e8f4ff, #fff);
}

/* Nested groups (TreeGroup) */
.b-tree-group-level-0 { padding-left: 0; }
.b-tree-group-level-1 { padding-left: 20px; }
.b-tree-group-level-2 { padding-left: 40px; }

/* Group indentation */
.b-grid-cell .b-tree-indent {
    display: inline-block;
    width: 1.2em;
}
```

## Best Practices

1. **Start with Grouping**: Use `groupers` config for initial grouping
2. **Collapsible Groups**: Enable for large datasets
3. **Show Count**: Help users understand group sizes
4. **Custom Renderers**: Enhance group headers with relevant info
5. **Group Summaries**: Add meaningful aggregations
6. **Multi-level Grouping**: Use for hierarchical data
7. **Event Layout**: Group events within rows for clarity
8. **Performance**: Consider virtualization with many groups

## API Reference Links

- [StoreGroup Mixin](https://bryntum.com/products/schedulerpro/docs/api/Core/data/mixin/StoreGroup)
- [Grouper Type](https://bryntum.com/products/schedulerpro/docs/api/Core/data/mixin/StoreGroup#typedef-Grouper)
- [Group Feature](https://bryntum.com/products/schedulerpro/docs/api/Grid/feature/Group)
- [GroupSummary Feature](https://bryntum.com/products/schedulerpro/docs/api/Grid/feature/GroupSummary)
- [TreeGroup Feature](https://bryntum.com/products/schedulerpro/docs/api/Grid/feature/TreeGroup)
- [GroupRecord Type](https://bryntum.com/products/schedulerpro/docs/api/Grid/feature/Group#typedef-GroupRecord)
