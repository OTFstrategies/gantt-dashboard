# SchedulerPro Deep Dive: Columns Configuration

## Overview

SchedulerPro's column system provides:
- **Locked Columns**: Resource information in the frozen left region
- **TimeAxisColumn**: Special column containing the timeline
- **Built-in Types**: ResourceInfo, Action, Check, Tree, Widget columns
- **Custom Columns**: Fully customizable cell rendering and editing

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Column System                                 │
├─────────────────────────────────────────────────────────────────┤
│  ColumnStore                                                     │
│  ├── Manages column collection                                  │
│  ├── Column ordering and visibility                             │
│  └── Column state persistence                                   │
├─────────────────────────────────────────────────────────────────┤
│  Regions                                                         │
│  ├── locked (left) - Resource columns                           │
│  ├── normal (right) - TimeAxisColumn                            │
│  └── Optional additional regions                                │
├─────────────────────────────────────────────────────────────────┤
│  Column Types                                                    │
│  ├── Column (base)                                               │
│  ├── ResourceInfoColumn                                         │
│  ├── ActionColumn                                                │
│  ├── CheckColumn                                                 │
│  ├── TreeColumn                                                  │
│  ├── WidgetColumn                                                │
│  ├── NumberColumn                                                │
│  ├── DateColumn                                                  │
│  ├── TimeAxisColumn (special)                                   │
│  └── ScaleColumn                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Basic Column Configuration

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    columns: [
        {
            type: 'resourceInfo',
            text: 'Resource',
            width: 150
        },
        {
            text: 'Role',
            field: 'role',
            width: 120
        },
        {
            text: 'Department',
            field: 'department',
            width: 100
        }
    ]
});
```

## Column Types

### ResourceInfoColumn

Displays resource avatar, name, and additional info:

```javascript
columns: [
    {
        type: 'resourceInfo',
        text: 'Resource',
        width: 180,

        // Show/hide elements
        showImage: true,        // Show avatar image
        showEventCount: true,   // Show event count badge
        showRole: true,         // Show role field
        showMeta: false,        // Show additional meta

        // Fields
        field: 'name',          // Name field
        roleField: 'title',     // Role/title field

        // Auto-scale content based on row height
        autoScaleThreshold: 40  // Start scaling at 40px
    }
]
```

### ActionColumn

Buttons or icons for row actions:

```javascript
columns: [
    {
        type: 'action',
        text: 'Actions',
        width: 100,

        actions: [
            {
                cls: 'b-fa b-fa-edit',
                tooltip: 'Edit resource',
                onClick({ record }) {
                    editResource(record);
                }
            },
            {
                cls: 'b-fa b-fa-trash',
                tooltip: 'Delete resource',
                onClick({ record }) {
                    record.remove();
                }
            },
            {
                cls: 'b-fa b-fa-calendar',
                tooltip: 'View calendar',
                visible({ record }) {
                    return record.hasCalendar;
                },
                onClick({ record }) {
                    showCalendar(record);
                }
            }
        ]
    }
]
```

### CheckColumn

Boolean checkbox column:

```javascript
columns: [
    {
        type: 'check',
        text: 'Active',
        field: 'active',
        width: 60,

        // Checkbox behavior
        checkable: true,         // Allow checking
        showCheckAll: true,      // Show header checkbox

        // Custom rendering
        renderer({ record, checked }) {
            return checked ? 'Yes' : 'No';
        }
    }
]
```

### TreeColumn

For hierarchical resource display:

```javascript
columns: [
    {
        type: 'tree',
        text: 'Organization',
        field: 'name',
        width: 200,

        // Tree behavior
        expandIconCls: 'b-fa b-fa-folder-open',
        collapseIconCls: 'b-fa b-fa-folder',
        leafIconCls: 'b-fa b-fa-user'
    }
]
```

### NumberColumn

Numeric values with formatting:

```javascript
columns: [
    {
        type: 'number',
        text: 'Capacity',
        field: 'capacity',
        width: 80,

        // Number formatting
        format: '0.00',
        min: 0,
        max: 100,

        // Summary
        sum: 'sum',  // 'sum', 'count', 'min', 'max', 'average'
        summaryRenderer: ({ sum }) => `Total: ${sum}`
    }
]
```

### DateColumn

Date values with formatting:

```javascript
columns: [
    {
        type: 'date',
        text: 'Hire Date',
        field: 'hireDate',
        width: 100,

        format: 'MMM DD, YYYY',

        // Filtering
        filterable: {
            filter: {
                type: 'date'
            }
        }
    }
]
```

### WidgetColumn

Embed widgets in cells:

```javascript
columns: [
    {
        type: 'widget',
        text: 'Progress',
        field: 'progress',
        width: 150,

        widgets: [{
            type: 'slider',
            min: 0,
            max: 100,
            showTooltip: true
        }]
    },
    {
        type: 'widget',
        text: 'Status',
        field: 'status',
        width: 120,

        widgets: [{
            type: 'combo',
            items: ['Pending', 'Active', 'Complete']
        }]
    }
]
```

### ScaleColumn

Display scale/gauge visualization:

```javascript
columns: [
    {
        type: 'scale',
        text: 'Workload',
        field: 'workload',
        width: 150,

        // Scale configuration
        scalePoints: [
            { value: 0, text: '0%' },
            { value: 50, text: '50%' },
            { value: 100, text: '100%' }
        ]
    }
]
```

## Custom Renderers

### Basic Renderer

```javascript
columns: [
    {
        text: 'Status',
        field: 'status',
        width: 100,

        renderer({ value, record, cellElement }) {
            // Add CSS class based on value
            cellElement.classList.add(`status-${value.toLowerCase()}`);

            // Return string or DomConfig
            return {
                className: 'status-badge',
                text: value
            };
        }
    }
]
```

### Advanced Renderer with HTML

```javascript
columns: [
    {
        text: 'Resource',
        field: 'name',
        width: 200,
        htmlEncode: false,  // Allow HTML

        renderer({ record }) {
            const { name, email, avatar } = record;

            return `
                <div class="resource-cell">
                    <img src="${avatar}" class="avatar" />
                    <div class="info">
                        <div class="name">${name}</div>
                        <div class="email">${email}</div>
                    </div>
                </div>
            `;
        }
    }
]
```

### DomConfig Renderer

```javascript
columns: [
    {
        text: 'Progress',
        field: 'percentDone',
        width: 150,

        renderer({ value }) {
            return {
                className: 'progress-cell',
                children: [
                    {
                        className: 'progress-bar',
                        style: {
                            width: `${value}%`
                        }
                    },
                    {
                        className: 'progress-text',
                        text: `${value}%`
                    }
                ]
            };
        }
    }
]
```

### afterRenderCell

Post-render modifications:

```javascript
columns: [
    {
        type: 'resourceInfo',
        text: 'Resource',

        afterRenderCell({ cellElement, record, row }) {
            // Add custom styling after default render
            if (record.isManager) {
                cellElement.classList.add('manager-cell');
                row.assignCls({ manager: true });
            }
        }
    }
]
```

## Column Configuration Options

### Common Options

```javascript
{
    // Identity
    id: 'myColumn',
    field: 'fieldName',
    text: 'Column Header',

    // Sizing
    width: 150,
    minWidth: 80,
    maxWidth: 300,
    flex: 1,          // Flex sizing

    // Auto width
    autoWidth: true,  // Size to content
    fitMode: 'value', // 'value', 'textContent', 'exact'

    // Display
    align: 'left',    // 'left', 'center', 'right', 'start', 'end'
    cls: 'my-column', // Header CSS class
    cellCls: 'my-cell', // Cell CSS class

    // Behavior
    hidden: false,
    hideable: true,
    sortable: true,
    groupable: true,
    resizable: true,
    draggable: true,

    // Region
    region: 'locked', // 'locked' or 'normal'
    locked: true      // Shorthand for region: 'locked'
}
```

### Editing Options

```javascript
{
    // Cell editing
    editor: {
        type: 'textfield',
        required: true,
        maxLength: 50
    },

    // Or use field type string
    editor: 'text',  // 'text', 'number', 'date', 'combo'

    // Disable editing
    editor: false,

    // Finalize edit callback
    finalizeCellEdit({ value, oldValue, record, field }) {
        // Validate
        if (value.length < 3) {
            return 'Name must be at least 3 characters';
        }
        return true;
    }
}
```

### Filtering Options

```javascript
{
    // Enable filtering
    filterable: true,

    // Custom filter type
    filterType: 'text',  // 'text', 'number', 'date', 'duration'

    // Custom filter function
    filterable({ value, record }) {
        return value.toLowerCase().includes(filterValue);
    },

    // Filter configuration
    filterable: {
        filterField: {
            type: 'combo',
            items: ['Active', 'Inactive']
        }
    }
}
```

### Summary Options

```javascript
{
    // Summary calculation
    sum: 'sum',        // 'sum', 'count', 'min', 'max', 'average'
    // Or custom
    sum: records => records.reduce((s, r) => s + r.value, 0),

    // Summary renderer
    summaryRenderer({ sum, records }) {
        return `Total: ${sum} (${records.length} items)`;
    }
}
```

## Nested/Grouped Columns

```javascript
columns: [
    {
        text: 'Resource',
        children: [
            {
                type: 'resourceInfo',
                text: 'Name',
                width: 150
            },
            {
                text: 'Role',
                field: 'role',
                width: 100
            }
        ]
    },
    {
        text: 'Contact',
        collapsible: true,
        collapsed: false,
        children: [
            {
                text: 'Email',
                field: 'email',
                width: 150
            },
            {
                text: 'Phone',
                field: 'phone',
                width: 100
            }
        ]
    }
]
```

## Column API

### Access Columns

```javascript
// Get all columns
const columns = scheduler.columns;

// Get column by id
const column = scheduler.columns.get('name');

// Get column by field
const column = scheduler.columns.find(c => c.field === 'name');

// Iterate columns
scheduler.columns.forEach(column => {
    console.log(column.text);
});
```

### Modify Columns

```javascript
// Add column
scheduler.columns.add({
    text: 'New Column',
    field: 'newField',
    width: 100
});

// Insert at position
scheduler.columns.insert(2, {
    text: 'Inserted',
    field: 'inserted'
});

// Remove column
scheduler.columns.remove(column);

// Show/hide
column.hidden = true;
column.show();
column.hide();

// Resize
column.width = 200;
column.flex = 2;
```

### Column State

```javascript
// Get column state
const state = scheduler.columns.map(c => ({
    id: c.id,
    width: c.width,
    hidden: c.hidden,
    flex: c.flex
}));

// Restore state
scheduler.columns.forEach((column, i) => {
    Object.assign(column, state[i]);
});
```

## Complete Example

```javascript
import { SchedulerPro, DateHelper } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    columns: [
        // Row number
        {
            type: 'rownumber',
            width: 50
        },

        // Resource info with avatar
        {
            type: 'resourceInfo',
            text: 'Resource',
            width: 180,
            showImage: true,
            showEventCount: true
        },

        // Department with custom renderer
        {
            text: 'Department',
            field: 'department',
            width: 120,
            groupable: true,

            renderer({ value }) {
                const colors = {
                    Engineering: 'blue',
                    Design: 'purple',
                    Marketing: 'green'
                };

                return {
                    className: 'department-badge',
                    style: {
                        backgroundColor: colors[value] || 'gray'
                    },
                    text: value
                };
            }
        },

        // Status checkbox
        {
            type: 'check',
            text: 'Active',
            field: 'active',
            width: 70,
            showCheckAll: true
        },

        // Workload as progress bar
        {
            text: 'Workload',
            field: 'workload',
            width: 120,

            renderer({ value }) {
                const color = value > 80 ? 'red' :
                              value > 50 ? 'orange' : 'green';

                return {
                    className: 'workload-cell',
                    children: [
                        {
                            className: 'workload-bar',
                            style: {
                                width: `${value}%`,
                                backgroundColor: color
                            }
                        },
                        {
                            className: 'workload-text',
                            text: `${value}%`
                        }
                    ]
                };
            }
        },

        // Actions
        {
            type: 'action',
            text: '',
            width: 80,
            actions: [
                {
                    cls: 'b-fa b-fa-edit',
                    tooltip: 'Edit',
                    onClick({ record }) {
                        scheduler.editResource(record);
                    }
                },
                {
                    cls: 'b-fa b-fa-calendar-alt',
                    tooltip: 'View schedule',
                    onClick({ record }) {
                        scheduler.scrollResourceEventIntoView(record);
                    }
                }
            ]
        }
    ],

    // Column features
    features: {
        // Column resizing
        columnResize: true,

        // Column reordering
        columnReorder: true,

        // Column picker in header menu
        columnPicker: {
            disabled: false
        },

        // Cell editing
        cellEdit: {
            disabled: false
        },

        // Header menu
        headerMenu: {
            items: {
                // Custom menu item
                customItem: {
                    text: 'Custom Action',
                    icon: 'b-fa b-fa-cog',
                    onItem({ column }) {
                        console.log('Custom action for', column.text);
                    }
                }
            }
        }
    },

    // Handle column events
    listeners: {
        columnResize({ column, width }) {
            console.log(`${column.text} resized to ${width}px`);
        },

        columnReorder({ column, newIndex }) {
            console.log(`${column.text} moved to index ${newIndex}`);
        }
    }
});
```

## CSS for Columns

```css
/* Department badge */
.department-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    color: white;
    font-size: 11px;
}

/* Workload bar */
.workload-cell {
    position: relative;
    height: 100%;
}

.workload-bar {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 8px;
    border-radius: 4px;
    transition: width 0.3s ease;
}

.workload-text {
    position: relative;
    z-index: 1;
    font-size: 11px;
    color: #666;
}

/* Custom resource cell */
.resource-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.resource-cell .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
}

.resource-cell .info .name {
    font-weight: bold;
}

.resource-cell .info .email {
    font-size: 11px;
    color: #666;
}

/* Manager row highlight */
.manager-cell {
    background-color: rgba(255, 215, 0, 0.2);
}
```

## Best Practices

1. **Use Column Types**: Leverage built-in types for common patterns
2. **Return DomConfig**: More performant than HTML strings for complex cells
3. **Use afterRenderCell**: For modifications without replacing default rendering
4. **Set autoWidth Carefully**: Can impact performance with large datasets
5. **Lock Important Columns**: Keep resource columns visible during horizontal scroll
6. **Consistent Widths**: Use similar widths for related columns
7. **Responsive Design**: Use flex for columns that should grow/shrink

## API Reference Links

- [Column](https://bryntum.com/products/schedulerpro/docs/api/Grid/column/Column)
- [ResourceInfoColumn](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/column/ResourceInfoColumn)
- [ActionColumn](https://bryntum.com/products/schedulerpro/docs/api/Grid/column/ActionColumn)
- [CheckColumn](https://bryntum.com/products/schedulerpro/docs/api/Grid/column/CheckColumn)
- [TreeColumn](https://bryntum.com/products/schedulerpro/docs/api/Grid/column/TreeColumn)
- [WidgetColumn](https://bryntum.com/products/schedulerpro/docs/api/Grid/column/WidgetColumn)
- [TimeAxisColumn](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/column/TimeAxisColumn)
- [ScaleColumn](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/column/ScaleColumn)
