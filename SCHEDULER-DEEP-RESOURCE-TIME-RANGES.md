# SchedulerPro Deep Dive: Resource Time Ranges & Time Ranges

## Overview

SchedulerPro provides two features for displaying non-event time spans:

1. **TimeRanges** - Global time spans that span all resources (holidays, deadlines, milestones)
2. **ResourceTimeRanges** - Per-resource time spans (vacation, shifts, availability)

Both features render background elements behind events and can support recurring patterns.

## Feature Comparison

| Feature | Scope | Store | Use Cases |
|---------|-------|-------|-----------|
| TimeRanges | All resources (full height) | TimeRangeStore | Holidays, deadlines, project phases |
| ResourceTimeRanges | Single resource (row height) | ResourceTimeRangeStore | Vacation, shifts, availability |

## TimeRanges Feature

### Basic Configuration

```typescript
const scheduler = new SchedulerPro({
    features: {
        timeRanges: true  // Enable with defaults
    },

    // Inline time ranges data
    timeRanges: [
        {
            id: 1,
            name: 'Company Holiday',
            startDate: '2024-12-25',
            endDate: '2024-12-26',
            cls: 'holiday'
        },
        {
            id: 2,
            name: 'Project Deadline',
            startDate: '2024-01-31T17:00',
            duration: 0,  // Zero duration = line
            cls: 'deadline'
        }
    ]
});
```

### Full Configuration

```typescript
features: {
    timeRanges: {
        // Display options
        showHeaderElements: true,       // Show in timeline header
        showCurrentTimeLine: true,      // Show "now" line

        // Current time line customization
        currentDateFormat: 'HH:mm',     // Format in header
        currentTimeLineUpdateInterval: 60000,  // Update every minute

        // Interaction
        enableResizing: true,           // Allow resize in header

        // Tooltips
        showTooltip: true,
        hoverTooltip: {
            align: 'b-t'
        },

        // Renderers
        headerRenderer({ timeRange }) {
            return `<i class="icon-calendar"></i> ${timeRange.name}`;
        },

        bodyRenderer({ timeRange }) {
            return `<div class="range-label">${timeRange.name}</div>`;
        },

        tooltipTemplate({ timeRange, startClockHtml, endClockHtml }) {
            return `
                <div class="range-tooltip">
                    <h4>${timeRange.name}</h4>
                    <div>${startClockHtml} - ${endClockHtml}</div>
                </div>
            `;
        },

        // Update behavior
        instantUpdate: true  // Update during drag
    }
}
```

### TimeRangeModel

```typescript
export class TimeRangeModel extends TimeSpan {
    // Time span fields (inherited)
    name: string
    startDate: Date | string
    endDate: Date | string
    duration: number
    durationUnit: DurationUnit

    // Styling
    cls: string                        // CSS class
    style: string                      // Inline styles

    // Identity
    readonly isTimeRangeModel: boolean
}
```

### Current Time Line

```typescript
features: {
    timeRanges: {
        // Simple boolean
        showCurrentTimeLine: true,

        // Or with customization
        showCurrentTimeLine: {
            name: 'Now',
            cls: 'current-time'
        },

        // Update interval (ms)
        currentTimeLineUpdateInterval: 30000,  // Every 30 seconds

        // Format in header
        currentDateFormat: 'HH:mm:ss'
    }
}
```

### Header vs Body Elements

```
Timeline Header ─────────────────────────────────────────
  ┌─────────────────┐   ← Header element (showHeaderElements)
  │   Q1 Deadline   │
  └────────┬────────┘
           │
Schedule   │
           ▼
┌──────────────────────────────────────────────────────┐
│ Resource 1  ███████████████████████████████████████  │ ← Body element
│                     (full height column)              │
│ Resource 2  ███████████████████████████████████████  │
│                                                       │
│ Resource 3  ███████████████████████████████████████  │
└──────────────────────────────────────────────────────┘
```

## ResourceTimeRanges Feature

### Basic Configuration

```typescript
const scheduler = new SchedulerPro({
    features: {
        resourceTimeRanges: true
    },

    // Via resourceTimeRangeStore
    resourceTimeRangeStore: {
        data: [
            {
                id: 1,
                resourceId: 'r1',
                name: 'Vacation',
                startDate: '2024-01-15',
                endDate: '2024-01-22',
                timeRangeColor: 'red'
            },
            {
                id: 2,
                resourceId: 'r2',
                name: 'Training',
                startDate: '2024-01-10',
                endDate: '2024-01-12',
                cls: 'training-range'
            }
        ]
    }
});
```

### Full Configuration

```typescript
features: {
    resourceTimeRanges: {
        // Mouse interaction
        enableMouseEvents: true,  // Default: false (static background)

        // Tab index for keyboard navigation
        tabIndex: 0,

        // Custom renderer
        resourceTimeRangeRenderer({
            resourceTimeRangeRecord,
            resourceRecord,
            renderData
        }) {
            // Add custom classes
            renderData.cls['vacation'] = resourceTimeRangeRecord.type === 'vacation';
            renderData.cls['training'] = resourceTimeRangeRecord.type === 'training';

            return {
                tag: 'div',
                class: 'range-content',
                children: [
                    { tag: 'i', class: resourceTimeRangeRecord.iconCls },
                    { tag: 'span', text: resourceTimeRangeRecord.name }
                ]
            };
        }
    }
}
```

### ResourceTimeRangeModel

```typescript
export class ResourceTimeRangeModel extends TimeSpan {
    // Identity
    static readonly isResourceTimeRangeModel: boolean
    readonly isResourceTimeRangeModel: boolean

    // Resource association
    resourceId: string | number
    resource: SchedulerResourceModel  // Via relation

    // Styling
    timeRangeColor: string            // Primary color
    cls: string                       // CSS class (inherited)

    // Recurrence support
    readonly isRecurring: boolean
    readonly isOccurrence: boolean
    recurrence: RecurrenceModel
    recurrenceRule: string
    exceptionDates: string | string[]
    readonly occurrenceIndex: number
    supportsRecurring: boolean

    // Methods
    setRecurrence(recurrence, interval?, recurrenceEnd?): void
    addExceptionDate(date: Date): void
    hasException(date: Date): boolean
    getOccurrencesForDateRange(startDate: Date, endDate?: Date): TimeSpan[]
}
```

### Resource Association

```typescript
// Access from resource
const resource = resourceStore.getById('r1');
const timeRanges = resource.timeRanges;  // ResourceTimeRangeModel[]

// Access from range
const range = resourceTimeRangeStore.getById(1);
const resource = range.resource;  // SchedulerResourceModel
```

## Stores

### TimeRangeStore

```typescript
const timeRangeStore = new TimeRangeStore({
    data: [
        { id: 1, name: 'Holiday', startDate: '2024-12-25', endDate: '2024-12-26' }
    ]
});

// Or with scheduler
const scheduler = new SchedulerPro({
    timeRangeStore: {
        data: [...]
    }
});
```

### ResourceTimeRangeStore

```typescript
const resourceTimeRangeStore = new ResourceTimeRangeStore({
    data: [
        { id: 1, resourceId: 'r1', name: 'Vacation', startDate: '2024-01-15', endDate: '2024-01-22' }
    ]
});

// Or with scheduler
const scheduler = new SchedulerPro({
    resourceTimeRangeStore: {
        data: [...]
    }
});
```

## Styling

### timeRangeColor Property

Built-in color support for quick styling:

```typescript
resourceTimeRangeStore.add({
    resourceId: 'r1',
    name: 'Vacation',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    timeRangeColor: 'red'  // Uses theme's red color
});

// Available colors (same as eventColor)
// 'red', 'pink', 'purple', 'violet', 'indigo', 'blue', 'cyan',
// 'teal', 'green', 'lime', 'yellow', 'orange', 'gray', etc.
```

### CSS Classes

```typescript
// Via cls property
timeRangeStore.add({
    name: 'Deadline',
    startDate: '2024-01-31',
    endDate: '2024-01-31',
    cls: 'deadline urgent'
});

// Via renderer
resourceTimeRangeRenderer({ resourceTimeRangeRecord, renderData }) {
    renderData.cls['vacation'] = resourceTimeRangeRecord.type === 'vacation';
    renderData.cls['sick-leave'] = resourceTimeRangeRecord.type === 'sick';
    return resourceTimeRangeRecord.name;
}
```

### CSS Examples

```css
/* Time range spanning all resources */
.b-sch-timerange {
    background: rgba(200, 200, 200, 0.3);
}

.b-sch-timerange.holiday {
    background: rgba(255, 200, 200, 0.5);
}

.b-sch-timerange.deadline {
    border-left: 3px solid red;
    background: transparent;
}

/* Current time line */
.b-sch-current-time {
    border-left: 2px dashed #ff6b6b;
}

/* Resource time ranges */
.b-sch-resourcetimerange {
    background: rgba(100, 100, 255, 0.2);
}

.b-sch-resourcetimerange.vacation {
    background: repeating-linear-gradient(
        45deg,
        rgba(255, 0, 0, 0.1),
        rgba(255, 0, 0, 0.1) 10px,
        transparent 10px,
        transparent 20px
    );
}

.b-sch-resourcetimerange.training {
    background: rgba(0, 200, 0, 0.2);
    border: 1px dashed green;
}
```

## Recurring Time Ranges

ResourceTimeRangeModel supports recurrence (like events):

```typescript
resourceTimeRangeStore.add({
    resourceId: 'r1',
    name: 'Weekly Stand-up',
    startDate: '2024-01-08T09:00',
    endDate: '2024-01-08T09:30',
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO'  // Every Monday
});

// Or via method
const range = resourceTimeRangeStore.getById(1);
range.setRecurrence('WEEKLY', 1);  // Every week
range.setRecurrence({
    frequency: 'DAILY',
    interval: 1,
    endDate: new Date('2024-12-31')
});
```

### Recurrence Exception Dates

```typescript
// Add exception for a specific occurrence
range.addExceptionDate(new Date('2024-02-19'));  // Skip this Monday

// Check for exceptions
if (range.hasException(new Date('2024-02-19'))) {
    console.log('This date is skipped');
}

// Get occurrences for a date range
const occurrences = range.getOccurrencesForDateRange(
    new Date('2024-01-01'),
    new Date('2024-03-31')
);
```

## Programmatic Management

### Adding Ranges

```typescript
// Add time range
timeRangeStore.add({
    name: 'Q1 Planning',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    cls: 'quarter-planning'
});

// Add resource time range
resourceTimeRangeStore.add({
    resourceId: 'r1',
    name: 'Conference',
    startDate: '2024-02-10',
    endDate: '2024-02-15',
    timeRangeColor: 'purple'
});
```

### Modifying Ranges

```typescript
const range = timeRangeStore.getById(1);

// Update properties
range.name = 'Updated Name';
range.endDate = new Date('2024-02-01');
range.cls = 'new-class';

// Batch update
range.set({
    name: 'Batch Update',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-20')
});
```

### Removing Ranges

```typescript
// Remove single
timeRangeStore.remove(range);

// Remove by ID
timeRangeStore.remove(timeRangeStore.getById(1));

// Remove multiple
timeRangeStore.remove([range1, range2]);

// Clear all
timeRangeStore.removeAll();
```

### Querying Ranges

```typescript
// Get all ranges for a resource
const ranges = resource.timeRanges;

// Filter by date range
const rangesInRange = resourceTimeRangeStore.query(range => {
    return range.startDate >= startDate && range.endDate <= endDate;
});

// Find by resource
const vacations = resourceTimeRangeStore.query(range => {
    return range.resourceId === 'r1' && range.cls === 'vacation';
});
```

## Element Access

### Get Element from Record

```typescript
// For resource time ranges
const element = scheduler.features.resourceTimeRanges
    .getElementFromResourceTimeRangeRecord(rangeRecord);

// For time ranges (body element)
// TimeRanges renders directly to scheduler body, use CSS selectors
const elements = scheduler.element.querySelectorAll('.b-sch-timerange');
```

### Get Record from Element

```typescript
// For resource time ranges
const record = scheduler.features.resourceTimeRanges
    .resolveResourceTimeRangeRecord(element);
```

## Mouse Events

By default, resource time ranges don't respond to mouse events. Enable with:

```typescript
features: {
    resourceTimeRanges: {
        enableMouseEvents: true
    }
}
```

Then listen to events on the scheduler:

```typescript
scheduler.on({
    resourceTimeRangeClick({ resourceTimeRangeRecord, resourceRecord, event }) {
        console.log('Clicked:', resourceTimeRangeRecord.name);
    },

    resourceTimeRangeDblClick({ resourceTimeRangeRecord }) {
        // Edit range
    },

    resourceTimeRangeContextMenu({ resourceTimeRangeRecord, event }) {
        event.preventDefault();
        showContextMenu(event, resourceTimeRangeRecord);
    }
});
```

## Common Patterns

### Pattern 1: Working Hours Visualization

```typescript
// Show non-working hours for each resource
function addNonWorkingHours(resourceStore, resourceTimeRangeStore) {
    resourceStore.forEach(resource => {
        const workStart = resource.workStart || 9;
        const workEnd = resource.workEnd || 17;

        // Add ranges for before/after work hours
        const today = DateHelper.startOf(new Date(), 'day');

        for (let d = 0; d < 30; d++) {
            const date = DateHelper.add(today, d, 'day');

            // Before work hours
            resourceTimeRangeStore.add({
                resourceId: resource.id,
                name: 'Non-working',
                startDate: DateHelper.set(date, 'hour', 0),
                endDate: DateHelper.set(date, 'hour', workStart),
                cls: 'non-working',
                timeRangeColor: 'gray'
            });

            // After work hours
            resourceTimeRangeStore.add({
                resourceId: resource.id,
                name: 'Non-working',
                startDate: DateHelper.set(date, 'hour', workEnd),
                endDate: DateHelper.set(DateHelper.add(date, 1, 'day'), 'hour', 0),
                cls: 'non-working',
                timeRangeColor: 'gray'
            });
        }
    });
}
```

### Pattern 2: Holiday Highlighting

```typescript
const holidays = [
    { name: 'New Year', date: '2024-01-01' },
    { name: 'Christmas', date: '2024-12-25' }
];

holidays.forEach(holiday => {
    timeRangeStore.add({
        name: holiday.name,
        startDate: holiday.date,
        duration: 1,
        durationUnit: 'day',
        cls: 'holiday'
    });
});
```

### Pattern 3: Project Phases

```typescript
timeRangeStore.add([
    {
        name: 'Planning Phase',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        cls: 'phase planning'
    },
    {
        name: 'Development Phase',
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        cls: 'phase development'
    },
    {
        name: 'Testing Phase',
        startDate: '2024-05-01',
        endDate: '2024-05-31',
        cls: 'phase testing'
    }
]);
```

### Pattern 4: Capacity Visualization

```typescript
features: {
    resourceTimeRanges: {
        resourceTimeRangeRenderer({ resourceTimeRangeRecord, renderData }) {
            const capacity = resourceTimeRangeRecord.capacity;

            // Color based on capacity
            if (capacity > 80) {
                renderData.cls['high-capacity'] = true;
            } else if (capacity > 40) {
                renderData.cls['medium-capacity'] = true;
            } else {
                renderData.cls['low-capacity'] = true;
            }

            return `${capacity}% capacity`;
        }
    }
}
```

### Pattern 5: Deadline Lines

```typescript
// Zero-duration range creates a vertical line
timeRangeStore.add({
    name: 'Sprint End',
    startDate: '2024-01-14T23:59',
    duration: 0,
    cls: 'deadline-line'
});

// CSS
// .b-sch-timerange.deadline-line {
//     border-left: 2px dashed #ff0000;
//     background: transparent;
// }
```

## Integration Notes

1. **Z-Index**: Time ranges render behind events. Use CSS z-index if needed.

2. **Performance**: Large numbers of ranges can impact rendering. Consider virtualizing or limiting date range.

3. **Recurring**: Both TimeRangeModel and ResourceTimeRangeModel support recurrence, but TimeRanges feature needs explicit store support.

4. **Mouse Events**: Disabled by default on ResourceTimeRanges for performance. Enable only when needed.

5. **Store Sync**: Time range stores support CrudManager for server sync.

6. **Relation**: ResourceTimeRangeModel has a built-in relation to ResourceModel via `resourceId`.
