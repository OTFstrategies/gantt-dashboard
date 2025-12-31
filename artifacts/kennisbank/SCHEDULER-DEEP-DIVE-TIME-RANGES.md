# SchedulerPro Deep Dive: Time Ranges & Time Span Highlighting

## Overview

SchedulerPro provides comprehensive time range visualization capabilities through multiple features:
- **TimeRanges**: Global time ranges spanning all resources (lunch breaks, company events)
- **ResourceTimeRanges**: Resource-specific time ranges (personal breaks, training)
- **TimeSpanHighlight**: Dynamic highlighting for interactive feedback
- **Current Time Line**: Real-time indicator of current time

These systems work together to provide visual context and constraints within the schedule.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       SchedulerPro                               │
├─────────────────────────────────────────────────────────────────┤
│  TimeRanges Feature          ResourceTimeRanges Feature         │
│  ├── TimeRangeStore          ├── ResourceTimeRangeStore        │
│  │   └── TimeRangeModel[]    │   └── ResourceTimeRangeModel[]  │
│  ├── showCurrentTimeLine     └── enableMouseEvents             │
│  └── enableResizing                                             │
├─────────────────────────────────────────────────────────────────┤
│  TimeSpanHighlight Feature                                      │
│  ├── highlightTimeSpan()                                        │
│  ├── highlightTimeSpans()                                       │
│  └── unhighlightTimeSpans()                                     │
└─────────────────────────────────────────────────────────────────┘
```

## TimeRanges Feature

### Feature Configuration

```typescript
interface TimeRangesConfig {
    // Feature type identifier
    type?: 'timeRanges' | 'timeranges';

    // Show current time indicator
    showCurrentTimeLine?: boolean | TimeSpanConfig;

    // Update interval for current time line (ms)
    currentTimeLineUpdateInterval?: number;

    // Date format for current time header
    currentDateFormat?: string;

    // Show range elements in header
    showHeaderElements?: boolean;

    // Enable drag/resize of header elements
    enableResizing?: boolean;

    // Update record data while dragging
    instantUpdate?: boolean;

    // Header element renderer
    headerRenderer?: (data: { timeRange: TimeSpan }) => string;

    // Body element renderer
    bodyRenderer?: (data: { timeRange: TimeSpan }) => string;

    // Tooltip configuration
    hoverTooltip?: TooltipConfig;

    // Tooltip template
    tooltipTemplate?: (data: {
        timeRange: TimeSpan;
        startClockHtml: string;
        endClockHtml: string;
    }) => string;

    // Show tooltip during resize
    showTooltip?: boolean | TooltipConfig;

    // Disabled state
    disabled?: boolean | 'inert';
}
```

### TimeRangeModel

```typescript
class TimeRangeModel extends TimeSpan {
    // Identity
    static readonly isTimeRangeModel: boolean;
    readonly isTimeRangeModel: boolean;

    // TimeSpan fields (inherited)
    name: string;
    startDate: Date | string;
    endDate: Date | string;
    duration: number;
    durationUnit: DurationUnit;
    cls: DomClassList | string | string[] | object;
    iconCls: string;

    // Recurrence support
    static readonly isRecurringTimeSpan: boolean;
    readonly isRecurringTimeSpan: boolean;
    readonly isRecurring: boolean;
    readonly isOccurrence: boolean;
    readonly occurrenceIndex: number;

    recurrence: RecurrenceModel;
    recurrenceModel: string;
    recurrenceRule: string;  // RFC-5545 RRULE format
    exceptionDates: string | string[];
    supportsRecurring: boolean;

    // Methods
    setRecurrence(
        recurrence: RecurrenceModelConfig | string | RecurrenceModel,
        interval?: number,
        recurrenceEnd?: number | Date
    ): void;

    addExceptionDate(date: Date): void;
    hasException(date: Date): boolean;
    getOccurrencesForDateRange(startDate: Date, endDate?: Date): TimeSpan[];
}
```

### TimeRangeStore

```typescript
class TimeRangeStore extends AjaxStore {
    static readonly isTimeRangeStore: boolean;
    readonly isTimeRangeStore: boolean;

    // Recurrence support
    static readonly isRecurringTimeSpansMixin: boolean;
    readonly isRecurringTimeSpansMixin: boolean;

    // Auto-adjust recurrence when base event moves
    autoAdjustRecurrence: boolean;

    // Lazy loading configuration
    lazyLoad: boolean | {
        bufferUnit: DurationUnit;
        bufferAmount: number;
        dateFormat: string;
        loadFullResourceRange: boolean;
        useResourceIds: boolean;
    };
}
```

### TimeRanges Class

```typescript
class TimeRanges extends AbstractTimeRanges {
    static readonly isTimeRanges: boolean;
    readonly isTimeRanges: boolean;

    // Current time line configuration
    showCurrentTimeLine: boolean | TimeSpanConfig;

    // Access to store
    readonly store: Store;

    // Get ranges in current view
    timeRanges: TimeSpan[];
}

abstract class AbstractTimeRanges extends InstancePlugin {
    static readonly isAbstractTimeRanges: boolean;
    readonly isAbstractTimeRanges: boolean;

    // Tooltip shown when hovering header
    readonly hoverTooltip: Tooltip;

    // Show elements in header
    showHeaderElements: boolean;

    // Check if range should be rendered
    shouldRenderRange(
        range: TimeSpan,
        viewStartDate?: Date,
        viewEndDate?: Date
    ): boolean;

    // Get tooltip HTML
    getTipHtml(): void;
}
```

### Basic Usage

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 7),

    project: {
        timeRangesData: [
            {
                id: 1,
                name: 'Lunch Break',
                startDate: '2024-01-02 12:00',
                endDate: '2024-01-02 13:00',
                cls: 'lunch-break'
            },
            {
                id: 2,
                name: 'Company Meeting',
                startDate: '2024-01-03 09:00',
                endDate: '2024-01-03 10:00',
                cls: 'meeting'
            }
        ]
    },

    features: {
        timeRanges: {
            showCurrentTimeLine: true,
            enableResizing: true,
            showHeaderElements: true,

            // Custom header renderer
            headerRenderer: ({ timeRange }) => `
                <div class="range-header">
                    <i class="b-fa b-fa-clock"></i>
                    ${timeRange.name}
                </div>
            `,

            // Custom body renderer
            bodyRenderer: ({ timeRange }) =>
                timeRange.name || 'Reserved'
        }
    }
});
```

### Current Time Line

```javascript
const scheduler = new SchedulerPro({
    features: {
        timeRanges: {
            // Simple boolean
            showCurrentTimeLine: true,

            // Or custom configuration
            showCurrentTimeLine: {
                name: 'Now',
                cls: 'current-time-custom'
            },

            // Update frequency (default: 10000ms)
            currentTimeLineUpdateInterval: 5000,

            // Date format in header
            currentDateFormat: 'HH:mm'
        }
    }
});
```

### Recurring Time Ranges

```javascript
// Daily lunch break that repeats every weekday
const lunchBreak = {
    id: 1,
    name: 'Lunch Break',
    startDate: '2024-01-01 12:00',
    duration: 1,
    durationUnit: 'hour',
    // RFC-5545 RRULE format
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
};

// Programmatic recurrence
const timeRange = scheduler.project.timeRangeStore.first;
timeRange.setRecurrence({
    frequency: 'WEEKLY',
    interval: 1,
    days: ['MO', 'TU', 'WE', 'TH', 'FR']
});

// Add exception (skip a specific occurrence)
timeRange.addExceptionDate(new Date(2024, 0, 15));
```

## ResourceTimeRanges Feature

### Feature Configuration

```typescript
interface ResourceTimeRangesConfig {
    type?: 'resourceTimeRanges' | 'resourcetimeranges';

    // Enable mouse interaction with ranges
    enableMouseEvents?: boolean;

    // Custom renderer
    resourceTimeRangeRenderer?: (detail: {
        resourceTimeRangeRecord: ResourceTimeRangeModel;
        resourceRecord: SchedulerResourceModel;
        renderData: object;
    }) => string | DomConfig | DomConfig[];

    // Tab index for accessibility
    tabIndex?: number;

    // Disabled state
    disabled?: boolean | 'inert';
}
```

### ResourceTimeRangeModel

```typescript
class ResourceTimeRangeModel extends TimeSpan {
    static readonly isResourceTimeRangeModel: boolean;
    readonly isResourceTimeRangeModel: boolean;

    // Resource association
    resourceId: string | number;
    resource: SchedulerResourceModel;  // Via relation

    // Color styling
    timeRangeColor: string;

    // Recurrence support (same as TimeRangeModel)
    readonly isRecurringTimeSpan: boolean;
    readonly isRecurring: boolean;
    readonly isOccurrence: boolean;
    recurrenceRule: string;
    exceptionDates: string | string[];

    // Methods
    setRecurrence(recurrence, interval?, recurrenceEnd?): void;
    addExceptionDate(date: Date): void;
    getOccurrencesForDateRange(startDate: Date, endDate?: Date): TimeSpan[];
}
```

### ResourceTimeRanges Class

```typescript
class ResourceTimeRanges extends ResourceTimeRangesBase {
    static readonly isResourceTimeRanges: boolean;
    readonly isResourceTimeRanges: boolean;

    // Enable mouse interaction
    enableMouseEvents: boolean;

    // Get element for a record
    getElementFromResourceTimeRangeRecord(
        record: ResourceTimeRangeModel
    ): HTMLElement;

    // Resolve record from element
    resolveResourceTimeRangeRecord(
        rangeElement: HTMLElement
    ): ResourceTimeRangeModel;
}
```

### Basic Usage

```javascript
const scheduler = new SchedulerPro({
    project: {
        resourceTimeRangesData: [
            {
                id: 1,
                resourceId: 'r1',
                name: 'Training',
                startDate: '2024-01-02 14:00',
                endDate: '2024-01-02 16:00',
                timeRangeColor: 'blue'
            },
            {
                id: 2,
                resourceId: 'r2',
                name: 'Vacation',
                startDate: '2024-01-03',
                endDate: '2024-01-04',
                timeRangeColor: 'green'
            }
        ]
    },

    features: {
        resourceTimeRanges: {
            enableMouseEvents: true,

            // Custom renderer
            resourceTimeRangeRenderer: ({ resourceTimeRangeRecord, resourceRecord }) => ({
                class: 'custom-range',
                children: [
                    {
                        tag: 'i',
                        class: 'b-fa b-fa-user'
                    },
                    {
                        text: resourceTimeRangeRecord.name
                    }
                ]
            })
        }
    },

    listeners: {
        // Handle clicks on resource time ranges
        resourceTimeRangeClick({ resourceTimeRangeRecord, resourceRecord }) {
            console.log(`Clicked: ${resourceTimeRangeRecord.name}`);
        }
    }
});
```

### Accessing Resource Time Ranges

```javascript
// Get all time ranges for a resource
const resource = scheduler.resourceStore.first;
const timeRanges = resource.timeRanges;  // Via relation

// Add a new resource time range
scheduler.project.resourceTimeRangeStore.add({
    resourceId: resource.id,
    name: 'Break',
    startDate: new Date(),
    duration: 30,
    durationUnit: 'minute'
});

// Get element for a range
const range = scheduler.project.resourceTimeRangeStore.first;
const element = scheduler.features.resourceTimeRanges
    .getElementFromResourceTimeRangeRecord(range);
```

## TimeSpanHighlight Feature

### Highlighting API

```typescript
// Type for highlight configuration
type HighlightTimeSpan = {
    startDate: Date;
    endDate: Date;
    name: string;

    // For resource-specific highlight (Scheduler only)
    resourceRecord?: SchedulerResourceModel;

    // For task-specific highlight (Gantt only)
    taskRecord?: Model;

    // Custom CSS class
    cls?: string;

    // Keep existing highlights
    clearExisting?: boolean;

    // Animation support
    animationId?: string;

    // Shade before/after the span
    surround?: boolean;

    // Padding around the highlight
    padding?: number;
};

class TimeSpanHighlight extends InstancePlugin {
    static readonly isTimeSpanHighlight: boolean;
    readonly isTimeSpanHighlight: boolean;

    // Highlight single time span
    highlightTimeSpan(options: HighlightTimeSpan): Promise<void>;

    // Highlight multiple time spans
    highlightTimeSpans(
        timeSpans: HighlightTimeSpan[],
        options?: { clearExisting?: boolean }
    ): Promise<void>;

    // Remove all highlights
    unhighlightTimeSpans(fadeOut?: boolean): Promise<void>;
}
```

### Basic Usage

```javascript
const scheduler = new SchedulerPro({
    features: {
        timeSpanHighlight: true
    }
});

// Single highlight
scheduler.highlightTimeSpan({
    name: 'Focus Area',
    startDate: new Date(2024, 0, 2, 9),
    endDate: new Date(2024, 0, 2, 17),
    cls: 'highlight-focus'
});

// Multiple highlights
scheduler.highlightTimeSpans([
    {
        name: 'Morning',
        startDate: new Date(2024, 0, 2, 9),
        endDate: new Date(2024, 0, 2, 12),
        cls: 'morning'
    },
    {
        name: 'Afternoon',
        startDate: new Date(2024, 0, 2, 14),
        endDate: new Date(2024, 0, 2, 17),
        cls: 'afternoon'
    }
]);

// Clear with fade animation
await scheduler.unhighlightTimeSpans(true);
```

### Resource-Specific Highlighting

```javascript
const resource = scheduler.resourceStore.getById('r1');

// Highlight for specific resource
scheduler.highlightTimeSpan({
    name: 'Availability',
    startDate: new Date(2024, 0, 2, 10),
    endDate: new Date(2024, 0, 2, 14),
    resourceRecord: resource,
    cls: 'available-slot'
});
```

### Surround Mode (Inverse Highlighting)

```javascript
// Highlight by shading the surrounding areas
scheduler.highlightTimeSpan({
    name: 'Delivery Window',
    startDate: new Date(2024, 0, 2, 9),
    endDate: new Date(2024, 0, 2, 17),
    // Shade everything OUTSIDE this window
    surround: true,
    animationId: 'deliveryWindow'
});
```

### Interactive Highlighting

```javascript
const scheduler = new SchedulerPro({
    features: {
        timeSpanHighlight: true
    },

    listeners: {
        // Highlight during drag
        eventDragStart({ eventRecords }) {
            const event = eventRecords[0];
            if (event.deliveryWindow) {
                scheduler.highlightTimeSpan({
                    name: 'Delivery Window',
                    startDate: event.deliveryWindow.start,
                    endDate: event.deliveryWindow.end,
                    surround: true,
                    animationId: 'delivery'
                });
            }
        },

        // Clear on drag end
        eventDragReset() {
            scheduler.unhighlightTimeSpans();
        },

        // Highlight on selection
        eventSelectionChange({ selected }) {
            if (selected.length === 1) {
                const event = selected[0];
                scheduler.highlightTimeSpan({
                    name: event.name,
                    startDate: event.startDate,
                    endDate: event.endDate,
                    cls: 'selected-highlight'
                });
            } else {
                scheduler.unhighlightTimeSpans(true);
            }
        },

        // Clear on schedule click
        scheduleClick() {
            scheduler.unhighlightTimeSpans(true);
        }
    }
});
```

## Styling

### CSS Classes

```css
/* Global time ranges */
.b-sch-timerange {
    background-color: rgba(200, 200, 200, 0.3);
}

.b-sch-timerange .b-sch-timerange-body {
    display: flex;
    align-items: center;
    justify-content: center;
    font-style: italic;
}

/* Time range header element */
.b-sch-header-timerange-container {
    position: absolute;
    z-index: 1;
}

/* Current time line */
.b-sch-current-time {
    border-left: 2px solid red;
}

.b-sch-current-time .b-sch-timerange-body {
    display: none;
}

/* Resource time ranges */
.b-sch-resourcetimerange {
    background-color: rgba(100, 100, 200, 0.2);
    border-radius: 4px;
}

/* Highlight elements */
.b-sch-highlighted-range {
    background-color: rgba(255, 200, 100, 0.3);
    border: 1px dashed orange;
    animation: highlight-pulse 1s infinite;
}

@keyframes highlight-pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
}

/* Surround mode - unavailable areas */
.b-unavailable {
    background-color: rgba(0, 0, 0, 0.3);
    pointer-events: none;
}

/* Custom time range colors */
.lunch-break {
    background-color: rgba(100, 200, 100, 0.3);
}

.meeting {
    background-color: rgba(200, 100, 100, 0.3);
}

/* Resource time range colors via field */
.b-sch-resourcetimerange[data-color="blue"] {
    background-color: rgba(0, 100, 255, 0.2);
}

.b-sch-resourcetimerange[data-color="green"] {
    background-color: rgba(0, 200, 100, 0.2);
}
```

### Styling via Model Fields

```javascript
// Using cls field
const timeRange = {
    name: 'Holiday',
    cls: 'holiday-range',
    startDate: '2024-12-25',
    endDate: '2024-12-26'
};

// Using iconCls
const meeting = {
    name: 'Stand-up',
    iconCls: 'b-fa b-fa-users',
    startDate: '2024-01-02 09:00',
    duration: 15,
    durationUnit: 'minute'
};

// Using timeRangeColor for resource time ranges
const resourceRange = {
    resourceId: 'r1',
    name: 'Training',
    timeRangeColor: '#3498db',
    startDate: '2024-01-02 14:00',
    endDate: '2024-01-02 16:00'
};
```

## Integration Examples

### Complete Time Range Example

```javascript
import { SchedulerPro, DateHelper } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 8),

    project: {
        // Global time ranges
        timeRangesData: [
            {
                id: 'lunch',
                name: 'Lunch',
                startDate: '2024-01-02 12:00',
                endDate: '2024-01-02 13:00',
                recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
            }
        ],

        // Resource-specific ranges
        resourceTimeRangesData: [
            {
                id: 'vacation1',
                resourceId: 'r1',
                name: 'Vacation',
                startDate: '2024-01-03',
                endDate: '2024-01-05',
                timeRangeColor: 'green'
            }
        ]
    },

    features: {
        timeRanges: {
            showCurrentTimeLine: true,
            currentTimeLineUpdateInterval: 10000,
            enableResizing: true,

            headerRenderer: ({ timeRange }) => {
                const duration = DateHelper.diff(
                    timeRange.startDate,
                    timeRange.endDate,
                    'hour'
                );
                return `${timeRange.name} (${duration}h)`;
            },

            tooltipTemplate: ({ timeRange, startClockHtml, endClockHtml }) => `
                <div class="range-tooltip">
                    <h4>${timeRange.name}</h4>
                    <div class="times">
                        ${startClockHtml} - ${endClockHtml}
                    </div>
                </div>
            `
        },

        resourceTimeRanges: {
            enableMouseEvents: true,

            resourceTimeRangeRenderer: ({ resourceTimeRangeRecord }) => ({
                class: 'custom-resource-range',
                children: [
                    { tag: 'i', class: 'b-fa b-fa-calendar' },
                    { text: resourceTimeRangeRecord.name }
                ]
            })
        },

        timeSpanHighlight: true
    },

    tbar: [
        {
            type: 'slidetoggle',
            text: 'Highlight 9-5',
            onChange: ({ checked }) => {
                if (checked) {
                    scheduler.highlightTimeSpan({
                        name: 'Work Hours',
                        startDate: new Date(2024, 0, 2, 9),
                        endDate: new Date(2024, 0, 2, 17),
                        surround: true
                    });
                } else {
                    scheduler.unhighlightTimeSpans(true);
                }
            }
        }
    ],

    listeners: {
        resourceTimeRangeClick({ resourceTimeRangeRecord }) {
            scheduler.highlightTimeSpan({
                name: resourceTimeRangeRecord.name,
                startDate: resourceTimeRangeRecord.startDate,
                endDate: resourceTimeRangeRecord.endDate,
                resourceRecord: resourceTimeRangeRecord.resource,
                cls: 'clicked-range'
            });
        }
    }
});
```

### Constraint-Based Highlighting

```javascript
import { SchedulerPro, EventModel, DateHelper } from '@bryntum/schedulerpro';

// Event with delivery window constraints
class DeliveryEvent extends EventModel {
    static fields = [
        'minStartTime',  // Hour (0-23)
        'maxEndTime'     // Hour (0-23)
    ];

    get minStartDate() {
        if (this.minStartTime !== undefined) {
            const start = DateHelper.startOf(this.startDate, 'day');
            start.setHours(this.minStartTime);
            return start;
        }
    }

    get maxEndDate() {
        if (this.maxEndTime !== undefined) {
            const end = DateHelper.startOf(this.endDate, 'day');
            end.setHours(this.maxEndTime);
            return end;
        }
    }
}

const scheduler = new SchedulerPro({
    project: {
        eventModelClass: DeliveryEvent
    },

    features: {
        timeSpanHighlight: true
    },

    // Custom date constraints for drag/resize
    getDateConstraints(resourceRecord, eventRecord) {
        if (eventRecord?.minStartDate) {
            return {
                start: eventRecord.minStartDate,
                end: eventRecord.maxEndDate
            };
        }
    },

    listeners: {
        eventDragStart({ eventRecords }) {
            const event = eventRecords[0];
            if (event.minStartDate) {
                scheduler.highlightTimeSpan({
                    name: 'Delivery Window',
                    startDate: event.minStartDate,
                    endDate: event.maxEndDate,
                    surround: true,
                    animationId: 'delivery'
                });
            }
        },

        eventResizeStart({ eventRecord }) {
            if (eventRecord.minStartDate) {
                scheduler.highlightTimeSpan({
                    name: 'Delivery Window',
                    startDate: eventRecord.minStartDate,
                    endDate: eventRecord.maxEndDate,
                    surround: true,
                    animationId: 'delivery'
                });
            }
        },

        eventDragReset() {
            scheduler.unhighlightTimeSpans();
        },

        eventResizeEnd() {
            scheduler.unhighlightTimeSpans();
        }
    }
});
```

## Data Loading

### Via Project Configuration

```javascript
const scheduler = new SchedulerPro({
    project: {
        // Inline data
        timeRangesData: [...],
        resourceTimeRangesData: [...],

        // Or via URL
        loadUrl: '/api/project',
        autoLoad: true
    }
});

// Server response format:
{
    "success": true,
    "timeRanges": {
        "rows": [
            { "id": 1, "name": "Lunch", ... }
        ]
    },
    "resourceTimeRanges": {
        "rows": [
            { "id": 1, "resourceId": "r1", ... }
        ]
    }
}
```

### Programmatic Access

```javascript
// Access stores
const timeRangeStore = scheduler.project.timeRangeStore;
const resourceTimeRangeStore = scheduler.project.resourceTimeRangeStore;

// Add records
timeRangeStore.add({
    name: 'Break',
    startDate: new Date(),
    duration: 30,
    durationUnit: 'minute'
});

// Modify records
const range = timeRangeStore.first;
range.endDate = DateHelper.add(range.endDate, 1, 'hour');

// Remove records
timeRangeStore.remove(range);

// Get ranges for current view
const visibleRanges = scheduler.features.timeRanges.timeRanges;
```

## Best Practices

1. **Use appropriate feature for scope**: TimeRanges for global, ResourceTimeRanges for per-resource
2. **Enable mouse events only when needed**: Improves performance when not interactive
3. **Use CSS classes via `cls` field**: Keeps styling maintainable
4. **Leverage recurrence for repeating ranges**: More efficient than creating individual records
5. **Use surround mode for constraints**: Clearly shows unavailable time
6. **Animate highlight changes**: Better UX with `animationId` and `fadeOut`
7. **Clear highlights on relevant events**: Prevent visual clutter

## API Reference Links

- [TimeRanges Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/TimeRanges)
- [TimeRangeModel](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/model/TimeRangeModel)
- [TimeRangeStore](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/data/TimeRangeStore)
- [ResourceTimeRanges Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/ResourceTimeRanges)
- [ResourceTimeRangeModel](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/model/ResourceTimeRangeModel)
- [TimeSpanHighlight Feature](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/feature/TimeSpanHighlight)
- [RecurringTimeSpan Mixin](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/model/mixin/RecurringTimeSpan)
