# Gantt Deep Dive: Resource Management

> **Complete gids voor resources, assignments, histogram en utilization**

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Resource & Assignment Model](#resource--assignment-model)
3. [Resource Assignment Column](#resource-assignment-column)
4. [Resource Histogram](#resource-histogram)
5. [Resource Utilization](#resource-utilization)
6. [Time-Phased Data](#time-phased-data)
7. [Resource Filtering](#resource-filtering)
8. [Resource Calendars](#resource-calendars)
9. [Best Practices](#best-practices)

---

## Overzicht

Bryntum Gantt biedt uitgebreide resource management met:
- **Resources**: Personen, machines of materialen
- **Assignments**: Koppeling tussen tasks en resources
- **Histogram**: Visuele weergave van resource belasting
- **Utilization**: Gedetailleerde effort, cost en quantity tracking

### Architectuur

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RESOURCE MANAGEMENT                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ResourceStore          AssignmentStore         TaskStore            │
│  ─────────────          ───────────────         ─────────            │
│  ┌──────────┐           ┌─────────────┐         ┌────────┐          │
│  │ Resource │◄──────────│ Assignment  │────────►│  Task  │          │
│  │ • id     │           │ • resource  │         │ • id   │          │
│  │ • name   │           │ • event     │         │ • name │          │
│  │ • city   │           │ • units     │         │ • dates│          │
│  │ • calendar│          └─────────────┘         └────────┘          │
│  └──────────┘                                                        │
│                                                                      │
│  ResourceHistogram                  ResourceUtilization              │
│  ─────────────────                  ───────────────────              │
│  • Bar per tijdseenheid             • Effort, Cost, Quantity         │
│  • Over/under allocation            • Time-phased breakdown          │
│  • Max effort line                  • Grouping support               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Resource & Assignment Model

### Data Schema

```json
{
  "resources": {
    "rows": [
      {
        "id": 1,
        "name": "Celia",
        "city": "Barcelona",
        "calendar": "business",
        "image": "celia.png"
      },
      {
        "id": 2,
        "name": "Lee",
        "city": "London",
        "calendar": "night",
        "image": "lee.png"
      }
    ]
  },
  "assignments": {
    "rows": [
      {
        "id": 1,
        "event": 11,
        "resource": 1,
        "units": 100
      },
      {
        "id": 2,
        "event": 11,
        "resource": 2,
        "units": 50
      }
    ]
  }
}
```

### Resource Model Fields

```typescript
// Standaard ResourceModel fields
interface ResourceModel {
    id          : string | number;
    name        : string;
    calendar    : string | CalendarModel;  // Resource calendar
    city        : string;                   // Custom field
    image       : string;                   // Avatar image
    eventColor  : string;                   // Default event color
    iconCls     : string;                   // Icon class
}
```

### Assignment Model Fields

```typescript
// Standaard AssignmentModel fields
interface AssignmentModel {
    id       : string | number;
    event    : string | number;    // Task ID
    resource : string | number;    // Resource ID
    units    : number;             // Assignment percentage (default: 100)
}
```

---

## Resource Assignment Column

### Basic Configuration

```typescript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo          : 'container',
    resourceImagePath : '/images/users/',

    project : {
        autoSetConstraints : true,
        loadUrl            : '/api/project'
    },

    columns : [
        { type : 'name', width : 250 },
        {
            type        : 'resourceassignment',
            width       : 250,
            showAvatars : true  // Toon user avatars
        }
    ]
});
```

### Advanced Assignment Editor

```typescript
import { AssignmentField } from '@bryntum/gantt';

columns : [
    { type : 'name', width : 250 },
    {
        type        : 'resourceassignment',
        width       : 250,
        showAvatars : true,

        // Custom assignment editor
        editor : {
            type   : AssignmentField.type,
            picker : {
                height   : 350,
                width    : 450,
                features : {
                    filterBar  : true,
                    group      : 'resource.city',  // Group by city
                    headerMenu : false,
                    cellMenu   : false
                },
                items : {
                    // Voeg extra columns toe aan Work-type resources tab
                    workTab : {
                        columns : [
                            {
                                text       : 'Calendar',
                                field      : 'resource.calendar.name',
                                filterable : false,
                                editor     : false,
                                width      : 85
                            }
                        ]
                    }
                }
            }
        }
    }
]
```

---

## Resource Histogram

### Basic Histogram Setup

```typescript
import { Gantt, ResourceHistogram, Splitter, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    startDate : '2024-01-16',
    endDate   : '2024-02-13',
    transport : {
        load : { url : '/api/project' }
    },
    autoSetConstraints : true,
    autoLoad           : true
});

// Gantt component
const gantt = new Gantt({
    project,
    appendTo          : 'container',
    resourceImagePath : '/images/users/',
    collapsible       : true,
    header            : false,
    minHeight         : 0,
    viewPreset        : 'weekAndDayLetter',
    columnLines       : true,
    columns           : [
        { type : 'name', width : 280 },
        { type : 'resourceassignment', showAvatars : true, width : 170 }
    ]
});

// Splitter tussen Gantt en Histogram
new Splitter({
    appendTo    : 'container',
    showButtons : true
});

// Resource Histogram
const histogram = new ResourceHistogram({
    appendTo          : 'container',
    project,
    partner           : gantt,  // Sync scrolling
    rowHeight         : 50,
    collapsible       : true,
    header            : false,
    minHeight         : 0,
    showBarTip        : true,
    hideHeaders       : true,
    resourceImagePath : '/images/users/',

    features : {
        scheduleTooltip : false,
        group           : {
            field : 'city'  // Group resources by city
        }
    },

    columns : [
        {
            type           : 'resourceInfo',
            field          : 'name',
            showEventCount : false,
            flex           : 1
        }
    ]
});
```

### Histogram Toolbar Options

```typescript
const histogram = new ResourceHistogram({
    // ... config

    tbar : {
        cls   : 'histogram-toolbar',
        items : {
            showBarText : {
                type     : 'slidetoggle',
                text     : 'Show bar texts',
                tooltip  : 'Show resource allocation in bars',
                checked  : false,
                onAction : 'up.onShowBarTextToggle'
            },
            showMaxEffort : {
                type     : 'slidetoggle',
                text     : 'Show max allocation',
                tooltip  : 'Display max resource allocation line',
                checked  : true,
                onAction : 'up.onShowMaxAllocationToggle'
            },
            showBarTip : {
                type     : 'slidetoggle',
                text     : 'Enable bar tooltip',
                tooltip  : 'Show tooltips on hover',
                checked  : true,
                onAction : 'up.onShowBarTipToggle'
            }
        }
    },

    onShowBarTextToggle({ source }) {
        histogram.showBarText = source.checked;
    },

    onShowMaxAllocationToggle({ source }) {
        histogram.showMaxEffort = source.checked;
    },

    onShowBarTipToggle({ source }) {
        histogram.showBarTip = source.checked;
    }
});
```

---

## Resource Utilization

### Basic Utilization Setup

```typescript
import {
    Gantt, ResourceUtilization, Splitter,
    TimePhasedProjectModel, TimePhasedTaskModel,
    Store, DateHelper, StringHelper, AvatarRendering
} from '@bryntum/gantt';

// Custom Task model met project tracking
class Task extends TimePhasedTaskModel {
    static $name = 'Task';

    static fields = [
        { name : 'isProjectTask', type : 'boolean' }
    ];

    get projectTask() {
        let result = null;
        this.bubbleWhile(task => {
            if (task.isProjectTask) {
                result = task;
            }
            return !result && task.parent && !task.parent.isRoot;
        });
        return result;
    }
}

const project = new TimePhasedProjectModel({
    taskModelClass     : Task,
    loadUrl            : '/api/project',
    autoLoad           : true,
    autoSetConstraints : true
});

const gantt = new Gantt({
    project,
    appendTo          : 'container',
    resourceImagePath : '/images/users/',
    collapsible       : true,
    header            : false,
    minHeight         : 0,
    viewPreset        : 'weekAndDay',
    tickSize          : 40,
    columnLines       : true,
    columns           : [
        { type : 'name', width : 280 },
        { type : 'resourceassignment', showAvatars : true, width : 170 }
    ]
});

new Splitter({ appendTo : 'container', showButtons : true });
```

### Resource Utilization Widget

```typescript
// Grouping functions
const resourceNProjectGroupFns = [
    // Group by resource
    ({ origin }) => {
        if (origin.isResourceModel) {
            return Store.StopBranch;
        }
        origin = origin[0] || origin;
        return origin.resource;
    },
    // Group by project task
    ({ origin }) => {
        if (origin.isResourceModel) {
            return Store.StopBranch;
        }
        origin = origin[0] || origin;
        return origin.event?.projectTask || 'No Project';
    }
];

const resourceUtilization = new ResourceUtilization({
    appendTo          : 'container',
    project,
    partner           : gantt,
    collapsible       : true,
    header            : false,
    minHeight         : 0,
    showBarTip        : true,
    resourceImagePath : '/images/users/',
    rowHeight         : 45,

    // Enable multiple series
    series : {
        effort : {
            disabled : false  // Default enabled
        },
        cost : {
            disabled : true
        },
        quantity : {
            disabled : true
        }
    },

    features : {
        treeGroup : {
            levels : resourceNProjectGroupFns
        },
        scheduleContext : {
            keyNavigation : true,
            multiSelect   : true
        },
        allocationCellEdit  : true,
        allocationCopyPaste : true
    },

    columns : [
        {
            type  : 'tree',
            field : 'name',
            width : 280,
            text  : 'Resource / Task',
            renderer({ record, grid }) {
                record = grid.resolveRecordToOrigin(record);

                if (record.key?.isResourceModel) {
                    record = record.key;
                } else if (Array.isArray(record)) {
                    record = record[0];
                }

                if (record.isResourceModel) {
                    if (!this.avatarRendering) {
                        this.avatarRendering = new AvatarRendering({
                            element : grid.element
                        });
                    }

                    return {
                        class    : 'b-resource-info',
                        children : [
                            this.avatarRendering.getResourceAvatar({
                                initials : record.initials,
                                color    : record.eventColor,
                                iconCls  : record.iconCls,
                                imageUrl : record.image ? `${grid.resourceImagePath}${record.image}` : null
                            }),
                            record.name
                        ]
                    };
                }
                else if (record.isAssignmentModel) {
                    return StringHelper.encodeHtml(record.event?.name);
                }

                return record.key?.name || record.key;
            }
        },
        {
            text    : 'Task date range',
            cellCls : 'task-date-range',
            renderer({ record, grid }) {
                record = grid.resolveRecordToOrigin(record);
                record = record[0] || record;

                if (record.isAssignmentModel) {
                    const task = record.event;
                    return DateHelper.format(task.startDate, 'MMM Do') + ' - ' +
                           DateHelper.format(task.endDate, 'MMM Do');
                }
                return '';
            }
        }
    ]
});
```

### Utilization Toolbar

```typescript
tbar : {
    cls   : 'utilization-toolbar',
    items : {
        displayLabel : {
            type : 'label',
            text : 'Display'
        },
        seriesButtonGroup : {
            type      : 'buttongroup',
            rendition : 'padded',
            defaults  : { toggleable : true },
            onAction  : 'up.onSeriesButtonToggle',
            items     : [
                {
                    text     : 'Effort',
                    icon     : 'b-icon-user',
                    tooltip  : 'Show effort',
                    seriesId : 'effort',
                    pressed  : true
                },
                {
                    text     : 'Cost',
                    icon     : 'b-icon-cost',
                    tooltip  : 'Show cost',
                    seriesId : 'cost',
                    pressed  : false
                },
                {
                    text     : 'Material',
                    icon     : 'b-icon-material',
                    tooltip  : 'Show material',
                    seriesId : 'quantity',
                    pressed  : false
                }
            ]
        },
        spacer       : '->',
        groupByLabel : { type : 'label', text : 'Group by' },
        groupButtons : {
            type        : 'buttongroup',
            rendition   : 'padded',
            toggleGroup : true,
            items       : [
                {
                    text    : 'Resource, Project',
                    tooltip : 'Toggle Resource-Project grouping',
                    icon    : 'fa fa-arrow-down',
                    pressed : true,
                    supportsPressedClick : true,
                    onAction() {
                        this._groupDirection = !this._groupDirection;
                        if (this._groupDirection) {
                            this.icon = 'fa fa-arrow-up';
                            resourceUtilization.group([...resourceNProjectGroupFns].reverse());
                        } else {
                            this.icon = 'fa fa-arrow-down';
                            resourceUtilization.group(resourceNProjectGroupFns);
                        }
                    }
                },
                {
                    text    : 'City, Resource',
                    tooltip : 'Group by City and Resource',
                    onAction() {
                        resourceUtilization.group([
                            ({ origin }) => origin.isResourceModel ? origin.city : origin.resource.city,
                            ({ origin }) => origin.isResourceModel ? Store.StopBranch : origin.resource
                        ]);
                    }
                },
                {
                    text    : 'Default',
                    tooltip : 'Reset to default',
                    onAction() {
                        resourceUtilization.clearGroups();
                    }
                }
            ]
        }
    }
},

onSeriesButtonToggle({ source }) {
    resourceUtilization.series[source.seriesId].disabled = !source.pressed;
}
```

---

## Time-Phased Data

### TimePhasedProjectModel

```typescript
import { TimePhasedProjectModel, TimePhasedTaskModel } from '@bryntum/gantt';

const project = new TimePhasedProjectModel({
    taskModelClass : TimePhasedTaskModel,
    loadUrl        : '/api/project',
    autoLoad       : true,

    // Time-phased breakdown unit
    timePhasedUnit : 'day'  // 'hour', 'day', 'week', 'month'
});
```

### Time-Phased Data Schema

```json
{
  "tasks": {
    "rows": [
      {
        "id": 1,
        "name": "Development",
        "startDate": "2024-01-15",
        "duration": 5,
        "timePhasedData": {
          "effort": [8, 8, 6, 8, 8],
          "cost": [400, 400, 300, 400, 400]
        }
      }
    ]
  }
}
```

---

## Resource Filtering

### Filter by Resource

```typescript
const gantt = new Gantt({
    tbar : [
        {
            type        : 'resourcecombo',
            placeholder : 'Show tasks assigned to:',
            width       : 250,
            multiSelect : true,
            store       : project.resourceStore.chain(),
            onChange({ source }) {
                const selectedResources = source.records;

                if (selectedResources.length === 0) {
                    // Clear filter
                    gantt.taskStore.removeFilter('resource');
                }
                else {
                    // Filter tasks by assigned resources
                    gantt.taskStore.filter({
                        id       : 'resource',
                        filterBy : task => task.resources.some(
                            resource => selectedResources.includes(resource)
                        )
                    });
                }
            }
        }
    ],

    features : {
        filterBar : true
    }
});
```

### Resource Overload Detection

```typescript
function getOverloadedResources() {
    const overloaded = [];

    project.resourceStore.forEach(resource => {
        // Bereken totale allocatie per dag
        const allocations = {};

        resource.assignments.forEach(assignment => {
            const task = assignment.event;
            const startDate = task.startDate;
            const endDate = task.endDate;
            const units = assignment.units || 100;

            let current = new Date(startDate);
            while (current < endDate) {
                const key = DateHelper.format(current, 'YYYY-MM-DD');
                allocations[key] = (allocations[key] || 0) + units;
                current = DateHelper.add(current, 1, 'day');
            }
        });

        // Check voor overallocatie (>100%)
        const overloadedDays = Object.entries(allocations)
            .filter(([_, units]) => units > 100)
            .map(([date, units]) => ({ date, units }));

        if (overloadedDays.length > 0) {
            overloaded.push({
                resource : resource,
                days     : overloadedDays
            });
        }
    });

    return overloaded;
}
```

---

## Resource Calendars

### Calendar per Resource

```json
{
  "calendars": {
    "rows": [
      {
        "id": "general",
        "name": "General",
        "intervals": [
          {
            "recurrentStartDate": "on Sat",
            "recurrentEndDate": "on Mon",
            "isWorking": false
          }
        ],
        "children": [
          {
            "id": "business",
            "name": "Business Hours",
            "hoursPerDay": 8,
            "daysPerWeek": 5,
            "intervals": [
              {
                "recurrentStartDate": "every weekday at 12:00",
                "recurrentEndDate": "every weekday at 13:00",
                "isWorking": false
              },
              {
                "recurrentStartDate": "every weekday at 17:00",
                "recurrentEndDate": "every weekday at 08:00",
                "isWorking": false
              }
            ]
          },
          {
            "id": "night",
            "name": "Night Shift",
            "hoursPerDay": 8,
            "intervals": [
              {
                "recurrentStartDate": "every weekday at 6:00",
                "recurrentEndDate": "every weekday at 22:00",
                "isWorking": false
              }
            ]
          }
        ]
      }
    ]
  },
  "resources": {
    "rows": [
      { "id": 1, "name": "Celia", "calendar": null },
      { "id": 2, "name": "Henrik", "calendar": "business" },
      { "id": 3, "name": "Dave", "calendar": "night" }
    ]
  }
}
```

### Calendar in Assignment Editor

```typescript
columns : [
    {
        type        : 'resourceassignment',
        width       : 250,
        editor      : {
            picker : {
                items : {
                    workTab : {
                        columns : [{
                            text  : 'Calendar',
                            field : 'resource.calendar.name',
                            width : 85
                        }]
                    }
                }
            }
        }
    }
]
```

---

## Best Practices

### 1. Resource Load Optimization

```typescript
// Lazy load resources when needed
const project = new ProjectModel({
    resourceStore : {
        lazyLoad : {
            chunkSize : 50
        }
    }
});
```

### 2. Allocation Dashboard

```typescript
function getResourceStats() {
    return project.resourceStore.map(resource => {
        const assignments = resource.assignments;
        const totalEffort = assignments.reduce((sum, a) => {
            return sum + (a.event?.effort || 0) * (a.units / 100);
        }, 0);

        return {
            resource    : resource.name,
            assignments : assignments.length,
            totalEffort : totalEffort,
            avgUnits    : assignments.length ?
                assignments.reduce((s, a) => s + a.units, 0) / assignments.length : 0
        };
    });
}
```

### 3. Bulk Assignment

```typescript
async function bulkAssign(taskIds, resourceId, units = 100) {
    const assignments = taskIds.map(taskId => ({
        event    : taskId,
        resource : resourceId,
        units    : units
    }));

    project.assignmentStore.add(assignments);
    await project.commitAsync();
}
```

### 4. Partner Widget Synchronization

```typescript
// Gantt en Histogram synchroniseren automatisch via partner
const histogram = new ResourceHistogram({
    partner : gantt,  // Sync timeline scrolling
    project         // Shared project
});

// Beide widgets reageren op dezelfde data changes
```

---

## Samenvatting

### Widget Types

| Widget | Doel | Key Features |
|--------|------|--------------|
| ResourceHistogram | Visuele belasting | Bars, max line, tooltips |
| ResourceUtilization | Gedetailleerde tracking | Effort, cost, quantity series |

### Key Properties

```typescript
// ResourceHistogram
histogram.showBarText = true;
histogram.showMaxEffort = true;
histogram.showBarTip = true;

// ResourceUtilization
utilization.series.effort.disabled = false;
utilization.series.cost.disabled = true;
utilization.group(groupFunctions);
```

---

## Gerelateerde Documenten

- [GANTT-DEEP-DIVE-CRITICAL-PATH.md](./GANTT-DEEP-DIVE-CRITICAL-PATH.md) - Critical Path
- [GANTT-DEEP-DIVE-BASELINES.md](./GANTT-DEEP-DIVE-BASELINES.md) - Effort tracking
- [INTEGRATION-GANTT-SCHEDULER.md](./INTEGRATION-GANTT-SCHEDULER.md) - Partner widgets
- [INTEGRATION-PERFORMANCE.md](./INTEGRATION-PERFORMANCE.md) - Large resource sets

---

*Bryntum Gantt 7.1.0 - Resource Management Deep Dive*
