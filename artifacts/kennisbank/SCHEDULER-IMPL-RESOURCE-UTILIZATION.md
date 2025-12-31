# SCHEDULER-IMPL-RESOURCE-UTILIZATION.md

> **Implementatie guide** voor ResourceHistogram en ResourceUtilization views - resource allocatie visualisatie, over-allocatie detectie en histogram bar rendering.

---

## Overzicht

SchedulerPro biedt twee gespecialiseerde views voor het visualiseren van resource allocatie:

| View | Doel | Hierarchie |
|------|------|------------|
| **ResourceHistogram** | Toont allocatie als histogram per resource | Flat (resources only) |
| **ResourceUtilization** | Toont allocatie per resource + per assignment | Tree (resources → assignments) |

Beide views erven van `TimelineHistogram` en synchroniseren met een gekoppelde SchedulerPro via de `partner` config.

---

## 1. ResourceHistogram Basics

### Minimale Setup

```typescript
import { SchedulerPro, ResourceHistogram, Splitter, ProjectModel } from '@bryntum/schedulerpro';

const project = new ProjectModel({
    loadUrl  : 'data/data.json',
    autoLoad : true
});

// Main scheduler
const scheduler = new SchedulerPro({
    appendTo   : 'scheduler-container',
    project,
    startDate  : new Date(2024, 3, 26),
    endDate    : new Date(2024, 4, 10),
    viewPreset : 'dayAndWeek'
});

// Histogram view (synchronized with scheduler)
const histogram = new ResourceHistogram({
    appendTo    : 'histogram-container',
    project,
    partner     : scheduler,         // Synchronizes timeline & scrolling
    rowHeight   : 60,
    hideHeaders : true,              // Hide column headers
    showBarTip  : true,              // Enable hover tooltips
    columns     : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            field          : 'name',
            width          : 240,
            showEventCount : false
        }
    ]
});
```

### Partner Synchronisatie

De `partner` config synchroniseert:
- **Time axis**: zoomen en panning worden gespiegeld
- **Vertical scrolling**: beide views scrollen samen
- **Timeline preset**: wijzigingen in viewPreset worden gedeeld

```typescript
// Both zoom together
scheduler.zoomIn();   // Both scheduler AND histogram zoom in

// Scroll to same resource
scheduler.scrollRowIntoView(resource);  // Both scroll together
```

### Histogram Configuratie

```typescript
const histogram = new ResourceHistogram({
    project,
    partner : scheduler,

    // Display options
    showBarText   : true,          // Show allocation % in bars
    showBarTip    : true,          // Tooltip on hover
    showMaxEffort : true,          // Red line for max allocation

    // Row configuration
    rowHeight : 60,

    // Feature configuration
    features : {
        nonWorkingTime : true       // Show weekends/holidays
    }
});
```

---

## 2. ResourceUtilization (Tree View)

ResourceUtilization toont een tree-structuur met resources als parent nodes en hun assignments als children.

### Tree Structuur

```typescript
import { ResourceUtilization, DateHelper } from '@bryntum/schedulerpro';

const resourceUtilization = new ResourceUtilization({
    project,
    partner     : scheduler,
    hideHeaders : true,
    rowHeight   : 50,
    showBarTip  : true,

    columns : [
        {
            type  : 'tree',
            field : 'name',
            text  : 'Resource/Event',
            width : 240,

            renderer({ record, value, grid }) {
                // Resolve to original model (resource or assignment)
                const origin = grid.resolveRecordToOrigin(record);

                if (origin.isAssignmentModel) {
                    const { event } = origin;

                    return {
                        children : [
                            {
                                tag      : 'dl',
                                class    : 'b-assignment-info',
                                children : [
                                    {
                                        tag  : 'dt',
                                        text : event.name
                                    },
                                    {
                                        tag  : 'dd',
                                        text : `${DateHelper.format(event.startDate, 'L')} - ${DateHelper.format(event.endDate, 'L')}`
                                    }
                                ]
                            }
                        ]
                    };
                }

                // Resource row
                return origin.name || value;
            }
        }
    ]
});
```

### TreeGroup Feature

Groepeer de tree view op custom criteria:

```typescript
import { Store } from '@bryntum/schedulerpro';

const groupLevels = [
    // Level 1: Group by resource
    ({ origin }) => {
        // Stop grouping if already at resource level (no assignments)
        if (origin.isResourceModel) {
            return Store.StopBranch;
        }
        return origin.resource;
    },
    // Level 2: Group by city
    ({ origin }) => origin.isResourceModel
        ? origin.city
        : origin.resource.city
];

const resourceUtilization = new ResourceUtilization({
    project,
    partner : scheduler,

    features : {
        treeGroup : {
            levels : groupLevels
        }
    }
});

// Toggle grouping at runtime
resourceUtilization.group(groupLevels);

// Clear grouping
resourceUtilization.clearGroups();

// Reverse grouping order
groupLevels.reverse();
resourceUtilization.group(groupLevels);
```

---

## 3. Allocation Data Structures

### ResourceAllocationInterval

Object met allocatie data per time interval voor een resource:

```typescript
type ResourceAllocationInterval = {
    resource         : ResourceModel;       // De resource
    assignments      : Set<AssignmentModel>;// Actieve assignments
    assignmentIntervals : Map<AssignmentModel, any>; // Per-assignment data

    effort           : number;              // Actual effort (ms)
    maxEffort        : number;              // Max possible effort (ms)
    units            : number;              // Allocation percentage

    isOverallocated  : boolean;             // effort > maxEffort
    isUnderallocated : boolean;             // effort < maxEffort

    tick             : TickInfo;            // Time interval
    inEventTimeSpan  : boolean;             // Within event bounds
};
```

### AssignmentAllocationInterval

Object met allocatie data per time interval voor een assignment:

```typescript
type AssignmentAllocationInterval = {
    assignment      : AssignmentModel;      // De assignment
    effort          : number;               // Work in interval (ms)
    units           : number;               // Assignment units %

    tick            : TickInfo;             // Time interval
    rectConfig      : object;               // DOM rect configuration
    inEventTimeSpan : boolean;              // Within event bounds
};
```

---

## 4. Bar Customization

### Custom Bar Text

```typescript
const histogram = new ResourceHistogram({
    project,
    partner : scheduler,

    // Show allocation percentage in bars
    showBarText : true,

    // Custom text formatter
    getBarText(datum, index, series, renderData) {
        const { effort, maxEffort, units, isOverallocated } = datum;

        if (isOverallocated) {
            return `${Math.round(units)}% OVER!`;
        }

        // Show effort in hours
        const effortHours = effort / (1000 * 60 * 60);
        return `${effortHours.toFixed(1)}h`;
    }
});
```

### Custom Bar Styling

```typescript
const histogram = new ResourceHistogram({
    project,
    partner : scheduler,

    // Custom bar CSS class
    getBarClass(series, domConfig, datum, index, renderData) {
        const { isOverallocated, isUnderallocated, units } = datum;

        if (isOverallocated) {
            return 'over-allocated';      // Red
        }
        if (isUnderallocated) {
            return 'under-allocated';     // Yellow
        }
        if (units >= 90) {
            return 'near-capacity';       // Orange
        }
        return 'normal-allocation';       // Green
    },

    // Full DOM control
    getBarDOMConfig(series, domConfig, datum, index, renderData) {
        const { units, isOverallocated } = datum;

        // Add custom attributes
        domConfig.dataset = {
            allocation : Math.round(units),
            overallocated : isOverallocated
        };

        // Conditional styling
        if (units > 100) {
            domConfig.style = {
                background : `linear-gradient(to right, red ${100/units*100}%, darkred ${100/units*100}%)`
            };
        }

        return domConfig;
    }
});
```

### CSS voor Over-allocation

```css
/* Over-allocated bars */
.b-resourcehistogram .over-allocated {
    fill: #ff4444 !important;
    animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

/* Under-allocated bars */
.b-resourcehistogram .under-allocated {
    fill: #ffcc00 !important;
}

/* Near capacity */
.b-resourcehistogram .near-capacity {
    fill: #ff8800 !important;
}

/* Max effort line */
.b-resourcehistogram .b-max-effort-line {
    stroke: red;
    stroke-width: 2px;
    stroke-dasharray: 4 2;
}
```

---

## 5. Bar Tooltip Customization

### Standard Tooltip

```typescript
const histogram = new ResourceHistogram({
    project,
    partner  : scheduler,
    showBarTip : true              // Default tooltip
});
```

### Custom Tooltip Template

```typescript
const histogram = new ResourceHistogram({
    project,
    partner : scheduler,

    showBarTip : {
        // Tooltip positioning
        align : 'b-t',             // Bottom to top

        // Custom template
        listeners : {
            beforeShow({ source: tip }) {
                // Access datum from tip's activeTarget
                // Customize tip.html here
            }
        }
    },

    // Template function for tooltip content
    barTooltipTemplate({ datum, record }) {
        const {
            effort,
            maxEffort,
            units,
            isOverallocated,
            assignments
        } = datum;

        const effortHours = (effort / 3600000).toFixed(1);
        const maxHours = (maxEffort / 3600000).toFixed(1);

        let html = `
            <div class="tooltip-header">
                <strong>${record.name}</strong>
            </div>
            <div class="tooltip-body">
                <div>Effort: ${effortHours}h / ${maxHours}h</div>
                <div>Allocation: ${Math.round(units)}%</div>
        `;

        if (isOverallocated) {
            html += `<div class="warning">OVERALLOCATED!</div>`;
        }

        if (assignments.size > 0) {
            html += `<div>Active tasks: ${assignments.size}</div>`;
        }

        html += '</div>';

        return html;
    }
});
```

---

## 6. FixedDuration Scheduling Mode

Voor accurate effort tracking, gebruik FixedDuration scheduling:

### Custom Event Model

```typescript
import { EventModel, ProjectModel } from '@bryntum/schedulerpro';

class FixedDurationEvent extends EventModel {
    static fields = [
        // Force FixedDuration mode - distributes effort over duration
        { name : 'schedulingMode', defaultValue : 'FixedDuration' }
    ];
}

const project = new ProjectModel({
    eventModelClass : FixedDurationEvent,
    loadUrl         : 'data/data.json',
    autoLoad        : true
});
```

### TaskEdit met Units

```typescript
const scheduler = new SchedulerPro({
    project,

    features : {
        taskEdit : {
            items : {
                // Remove resources from General tab
                generalTab : {
                    items : {
                        resourcesField : false
                    }
                },
                // Add Resources tab with Units column
                resourcesTab : {
                    type      : 'resourcestab',
                    weight    : 400,
                    showUnits : true       // Enable units editing
                }
            },
            editorConfig : {
                width : '37em'
            }
        }
    }
});
```

---

## 7. Data Handling

### getRecordData Override

Customize hoe histogram data wordt verzameld:

```typescript
const histogram = new ResourceHistogram({
    project,
    partner : scheduler,

    getRecordData({ record }, aggregationContext) {
        // record is a ResourceModel
        const allocation = record.getAllocation({
            startDate : this.startDate,
            endDate   : this.endDate,
            ticks     : this.timeAxis.ticks
        });

        // Return processed data
        return {
            total : allocation.total.map(interval => ({
                ...interval,
                // Add custom calculations
                utilizationRating : this.calculateRating(interval)
            }))
        };
    },

    calculateRating(interval) {
        const { units } = interval;
        if (units > 100) return 'overloaded';
        if (units > 80) return 'busy';
        if (units > 50) return 'moderate';
        return 'available';
    }
});
```

### Include Inactive Events

```typescript
const histogram = new ResourceHistogram({
    project,
    partner : scheduler,

    // Include cancelled/inactive events in allocation
    includeInactiveEvents : true
});
```

---

## 8. Aggregation (Group Totals)

### Custom Aggregation

```typescript
const histogram = new ResourceHistogram({
    project,
    partner : scheduler,

    // Initialize aggregated entry
    initAggregatedDataEntry() {
        return {
            effort          : 0,
            maxEffort       : 0,
            units           : 0,
            isOverallocated : false,
            assignments     : new Set()
        };
    },

    // Aggregate child entries into parent
    getDataEntryForAggregating({ entry }) {
        // Return the entry to aggregate
        // Can transform/filter here
        return entry;
    },

    // Custom aggregation logic
    aggregateAllocationEntry(aggregated, entry, arrayIndex, colIndex) {
        aggregated.effort += entry.effort;
        aggregated.maxEffort += entry.maxEffort;

        // Recalculate units
        aggregated.units = aggregated.maxEffort > 0
            ? (aggregated.effort / aggregated.maxEffort) * 100
            : 0;

        // Check overallocation
        aggregated.isOverallocated = aggregated.effort > aggregated.maxEffort;

        // Merge assignments
        entry.assignments?.forEach(a => aggregated.assignments.add(a));

        return aggregated;
    }
});
```

---

## 9. Event Handling

### Histogram Events

```typescript
const histogram = new ResourceHistogram({
    project,
    partner : scheduler,

    listeners : {
        // Cell click
        cellClick({ record, column, event }) {
            console.log('Clicked resource:', record.name);
        },

        // Before assignment delete
        beforeAssignmentDelete({ assignmentRecords, context }) {
            // Show confirmation
            return new Promise(resolve => {
                showConfirmDialog({
                    message : `Delete ${assignmentRecords.length} assignments?`,
                    onConfirm : () => resolve(true),
                    onCancel  : () => resolve(false)
                });
            });
        },

        // Selection change
        selectionChange({ selected, deselected }) {
            console.log('Selected resources:', selected.map(r => r.name));
        }
    }
});
```

### Refresh on Data Changes

```typescript
// Manual refresh
histogram.refresh();

// Refresh specific row
histogram.refreshRow(resource);

// React to project changes
project.on({
    change() {
        // Data changed, histogram auto-updates via reactive binding
    }
});
```

---

## 10. Layout Integration

### Splitter Layout

```typescript
import { Splitter } from '@bryntum/schedulerpro';

// Container uses flexbox
// <div id="container" style="display:flex;flex-direction:column;height:100%">

const scheduler = new SchedulerPro({
    appendTo : 'container',
    flex     : '1 1 50%',
    minHeight : 0,
    // ...config
});

new Splitter({
    appendTo    : 'container',
    showButtons : true             // Expand/collapse buttons
});

const histogram = new ResourceHistogram({
    appendTo : 'container',
    flex     : '1 1 50%',
    minHeight : 0,
    partner  : scheduler,
    // ...config
});
```

### Collapsible Panels

```typescript
const scheduler = new SchedulerPro({
    appendTo    : 'container',
    collapsible : true,
    header      : 'Schedule',      // Shows header when collapsible
    // ...
});

const histogram = new ResourceHistogram({
    appendTo    : 'container',
    collapsible : true,
    header      : 'Resource Allocation',
    partner     : scheduler,
    // ...
});

// Toggle collapse programmatically
histogram.collapsed = true;
```

---

## 11. Performance Optimizations

### Cache Management

```typescript
const histogram = new ResourceHistogram({
    project,
    partner : scheduler,

    // Clear cache on time axis change (default: true)
    hardRefreshOnTimeAxisReconfigure : true,

    // Custom cache invalidation
    listeners : {
        beforeRefresh() {
            // Clear specific cached data
            this.clearAllocationCache();
        }
    }
});
```

### Large Datasets

```typescript
const histogram = new ResourceHistogram({
    project,
    partner : scheduler,

    // Optimize for large datasets
    features : {
        regionResize : false        // Disable region resizing
    },

    // Reduce calculations
    showMaxEffort : false,          // Skip max effort calculation
    showBarText   : false,          // Skip text rendering

    // Throttle refresh
    throttleRefresh : 100           // ms between refreshes
});
```

---

## TypeScript Interfaces

```typescript
interface ResourceHistogramConfig {
    // Core
    project: ProjectModel;
    partner?: TimelineBase;

    // Display
    showBarText?: boolean;
    showBarTip?: boolean | TooltipConfig;
    showMaxEffort?: boolean;
    rowHeight?: number;

    // Headers/Footers
    hideHeaders?: boolean;
    hideFooters?: boolean;

    // Inactive events
    includeInactiveEvents?: boolean;

    // Customization
    getBarText?: (
        datum: ResourceAllocationInterval,
        index: number,
        series: HistogramSeries,
        renderData: ResourceHistogramRenderData
    ) => string;

    getBarClass?: (
        series: HistogramSeries,
        domConfig: DomConfig,
        datum: ResourceAllocationInterval,
        index: number,
        renderData: ResourceHistogramRenderData
    ) => string;

    getBarDOMConfig?: (
        series: HistogramSeries,
        domConfig: DomConfig,
        datum: ResourceAllocationInterval,
        index: number,
        renderData: ResourceHistogramRenderData
    ) => object;

    barTooltipTemplate?: (context: {
        datum: ResourceAllocationInterval;
        tip: Tooltip;
        element: HTMLElement;
        record: ResourceModel;
    }) => string;
}

interface ResourceUtilizationConfig extends ResourceHistogramConfig {
    // Tree-specific
    features?: {
        treeGroup?: {
            levels: TreeGroupLevel[];
        };
    };

    // Override for assignment intervals
    getBarText?: (
        datum: ResourceAllocationInterval | AssignmentAllocationInterval,
        index: number
    ) => string;
}

interface ResourceAllocationInterval {
    resource: ResourceModel;
    assignments: Set<AssignmentModel>;
    assignmentIntervals: Map<AssignmentModel, any>;
    effort: number;
    maxEffort: number;
    units: number;
    isOverallocated: boolean;
    isUnderallocated: boolean;
    tick: TickInfo;
    inEventTimeSpan: boolean;
}

interface AssignmentAllocationInterval {
    assignment: AssignmentModel;
    effort: number;
    units: number;
    tick: TickInfo;
    rectConfig: object;
    inEventTimeSpan: boolean;
}
```

---

## Complete Example: Resource Dashboard

```typescript
import {
    SchedulerPro,
    ResourceUtilization,
    ProjectModel,
    Splitter,
    DateHelper,
    EventModel,
    Store
} from '@bryntum/schedulerpro';

// FixedDuration event model for accurate effort tracking
class FixedDurationEvent extends EventModel {
    static fields = [
        { name : 'schedulingMode', defaultValue : 'FixedDuration' }
    ];
}

// Project with custom event model
const project = new ProjectModel({
    eventModelClass : FixedDurationEvent,
    loadUrl         : 'data/data.json',
    autoLoad        : true,
    validateResponse : true
});

// Main scheduler
const scheduler = new SchedulerPro({
    appendTo       : 'container',
    flex           : '1 1 50%',
    minHeight      : 0,
    collapsible    : true,
    header         : false,
    project,
    startDate      : new Date(2024, 3, 1),
    endDate        : new Date(2024, 4, 1),
    viewPreset     : 'dayAndWeek',
    eventStyle     : 'filled',
    tickSize       : 50,

    columns : [
        { type : 'resourceInfo', text : 'Name', width : 170 },
        { text : 'Role', field : 'role', width : 100 }
    ],

    features : {
        taskEdit : {
            items : {
                resourcesTab : {
                    type      : 'resourcestab',
                    showUnits : true
                }
            }
        }
    },

    tbar : [
        {
            type     : 'button',
            icon     : 'b-icon-search-plus',
            text     : 'Zoom in',
            onAction : () => scheduler.zoomIn()
        },
        {
            type     : 'button',
            icon     : 'b-icon-search-minus',
            text     : 'Zoom out',
            onAction : () => scheduler.zoomOut()
        }
    ]
});

// Splitter
new Splitter({
    appendTo    : 'container',
    showButtons : true
});

// Tree grouping levels
const groupLevels = [
    ({ origin }) => origin.isResourceModel ? Store.StopBranch : origin.resource,
    ({ origin }) => origin.isResourceModel ? origin.role : origin.resource.role
];

// Resource utilization view
const resourceUtilization = new ResourceUtilization({
    appendTo    : 'container',
    flex        : '1 1 50%',
    minHeight   : 0,
    collapsible : true,
    header      : false,
    project,
    partner     : scheduler,
    hideHeaders : true,
    rowHeight   : 50,
    showBarTip  : true,
    showBarText : false,

    features : {
        treeGroup : {
            levels : groupLevels
        },
        nonWorkingTime : true
    },

    columns : [
        {
            type  : 'tree',
            text  : 'Resource/Task',
            width : 280,
            flex  : 1,

            renderer({ record, grid }) {
                const origin = grid.resolveRecordToOrigin(record);

                if (origin.isAssignmentModel) {
                    const { event } = origin;
                    return {
                        children : [{
                            tag   : 'div',
                            class : 'assignment-info',
                            children : [
                                { tag : 'span', class : 'event-name', text : event.name },
                                {
                                    tag  : 'span',
                                    class : 'event-dates',
                                    text : `${DateHelper.format(event.startDate, 'MMM D')} - ${DateHelper.format(event.endDate, 'MMM D')}`
                                }
                            ]
                        }]
                    };
                }

                if (origin.isResourceModel) {
                    return origin.name;
                }

                // Group header
                return record.key?.name || record.key || '';
            }
        }
    ],

    // Custom bar styling for over-allocation
    getBarClass(series, domConfig, datum) {
        if (datum.isOverallocated) {
            return 'allocation-over';
        }
        if (datum.units > 80) {
            return 'allocation-high';
        }
        if (datum.units > 50) {
            return 'allocation-medium';
        }
        return 'allocation-low';
    },

    // Custom tooltip
    barTooltipTemplate({ datum, record }) {
        const effortHours = (datum.effort / 3600000).toFixed(1);
        const maxHours = (datum.maxEffort / 3600000).toFixed(1);
        const percentage = Math.round(datum.units);

        return `
            <div class="allocation-tooltip">
                <div class="tooltip-title">${record.name}</div>
                <div class="tooltip-stats">
                    <div>Effort: ${effortHours}h / ${maxHours}h</div>
                    <div class="${datum.isOverallocated ? 'over' : ''}">
                        Allocation: ${percentage}%
                    </div>
                </div>
                ${datum.isOverallocated
                    ? '<div class="warning">Resource is overallocated!</div>'
                    : ''}
            </div>
        `;
    },

    tbar : [
        {
            type    : 'checkbox',
            text    : 'Show tooltips',
            checked : true,
            onAction({ source }) {
                resourceUtilization.showBarTip = source.checked;
            }
        },
        '->',
        {
            type  : 'buttongroup',
            items : [
                {
                    text    : 'By Resource',
                    pressed : true,
                    onAction() {
                        resourceUtilization.group(groupLevels);
                    }
                },
                {
                    text : 'Flat',
                    onAction() {
                        resourceUtilization.clearGroups();
                    }
                }
            ]
        }
    ]
});
```

### CSS voor Dashboard

```css
/* Container layout */
#container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

/* Assignment info in tree column */
.assignment-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.assignment-info .event-name {
    font-weight: 500;
}

.assignment-info .event-dates {
    font-size: 0.85em;
    color: #666;
}

/* Allocation bar colors */
.b-resourceutilization .allocation-over rect {
    fill: #e74c3c !important;
}

.b-resourceutilization .allocation-high rect {
    fill: #f39c12 !important;
}

.b-resourceutilization .allocation-medium rect {
    fill: #3498db !important;
}

.b-resourceutilization .allocation-low rect {
    fill: #2ecc71 !important;
}

/* Tooltip styling */
.allocation-tooltip {
    padding: 8px;
}

.allocation-tooltip .tooltip-title {
    font-weight: bold;
    margin-bottom: 4px;
}

.allocation-tooltip .over {
    color: #e74c3c;
    font-weight: bold;
}

.allocation-tooltip .warning {
    background: #e74c3c;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    margin-top: 8px;
    text-align: center;
}
```

---

## Referenties

- **ResourceHistogram**: `schedulerpro.d.ts:325770`
- **ResourceUtilization**: `schedulerpro.d.ts:332400`
- **ResourceAllocationInterval**: `schedulerpro.d.ts:2691`
- **AssignmentAllocationInterval**: `schedulerpro.d.ts:2739`
- **Example resourcehistogram**: `examples/resourcehistogram/app.module.js`
- **Example resourceutilization**: `examples/resourceutilization/app.module.js`
- **Example effort**: `examples/effort/app.module.js`

---

*Laatst bijgewerkt: December 2024*
