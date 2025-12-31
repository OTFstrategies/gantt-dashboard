# SchedulerPro Internals: TimeAxis Architecture

## Overview

The TimeAxis system in SchedulerPro manages the temporal dimension of the scheduler. It controls date ranges, tick generation, coordinate conversion, and synchronization with the visual timeline. The architecture consists of three main components: TimeAxis (data), TimeAxisViewModel (calculations), and TimeAxisColumn (rendering).

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Scheduler                              │
│                                                              │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │   TimeAxis      │───▶│    TimeAxisViewModel         │   │
│  │   (Data Store)  │    │    (Coordinate Calculator)   │   │
│  └─────────────────┘    └──────────────────────────────┘   │
│           │                          │                       │
│           ▼                          ▼                       │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │  ViewPreset     │    │    TimeAxisColumn            │   │
│  │  (Configuration)│    │    (DOM Renderer)            │   │
│  └─────────────────┘    └──────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## TimeAxis Class

The TimeAxis is a specialized Store that holds tick records representing time intervals.

```typescript
export class TimeAxis extends Store {
    // Identity
    static readonly isTimeAxis: boolean
    readonly isTimeAxis: boolean

    // Date boundaries
    startDate: Date                     // Current start (after workingTime filtering)
    endDate: Date                       // Current end (after workingTime filtering)
    readonly unfilteredStartDate: Date  // Original start before filtering
    readonly unfilteredEndDate: Date    // Original end before filtering

    // Ticks collection
    ticks: TimeSpan[]                   // Array of {startDate, endDate} objects

    // Current settings
    readonly unit: DurationUnit         // Current tick unit (day, week, etc.)
    viewPreset: ViewPreset              // Currently applied preset

    // Continuity flag
    isContinuous: boolean               // false when workingTime filtering is active

    // Custom tick generator
    generateTicks: (axisStartDate: Date, axisEndDate: Date, unit: DurationUnit, increment: number) => any[]|undefined
}
```

### TimeAxis Methods

```typescript
// Date range management
setTimeSpan(newStartDate: Date, newEndDate?: Date): void

// Navigation
shift(amount: number, unit?: string): void
shiftNext(amount?: number): void
shiftPrevious(amount?: number): void

// Date queries
dateInAxis(date: Date): boolean
timeSpanInAxis(start: Date, end: Date): boolean

// Tick coordinate conversion
getTickFromDate(date: Date): number       // Returns -1 if not in axis
getDateFromTick(tick: number, roundingMethod?: 'floor'|'round'|'ceil'): Date

// Filtering
filterBy(fn: Function, thisObj?: object): Promise<any|null>
```

### TimeAxis Events

```typescript
// Configuration change
onBeforeReconfigure: (event: {
    source: TimeAxis
    startDate: Date
    endDate: Date
}) => Promise<boolean> | boolean | void

onReconfigure: (event: { source: TimeAxis }) => void

// Filter validation
onInvalidFilter: (event: { source: TimeAxis }) => void
```

## TimeAxisViewModel

Handles coordinate calculations between dates and pixel positions.

```typescript
export class TimeAxisViewModel extends EventsClass {
    static readonly isTimeAxisViewModel: boolean
    readonly isTimeAxisViewModel: boolean

    // Events
    onReconfigure: (event: { source: TimeAxisViewModel }) => void
    onUpdate: (event: { source: TimeAxisViewModel }) => void
}
```

### Coordinate Conversion Methods

```typescript
// Date → Position
getPositionFromDate(date: Date): number  // Returns -1 if not in axis

// Position → Date
getDateFromPosition(
    position: number,
    roundingMethod?: 'floor' | 'round' | 'ceil',
    allowOutOfRange?: boolean
): Date

// Duration → Distance
getDistanceForDuration(durationMS: number): number
getDistanceBetweenDates(start: Date, end: Date): number
```

## Scheduler Date Conversion Methods

The scheduler exposes higher-level coordinate conversion methods:

```typescript
// Pixel coordinate → Date
getCoordinateFromDate(
    date: Date | number,
    options?: boolean | { local: boolean }
): number

getDateFromCoordinate(
    coordinate: number,
    roundingMethod?: 'floor' | 'round' | 'ceil',
    local?: boolean,
    allowOutOfRange?: boolean
): Date

// DOM event → Date
getDateFromDomEvent(
    e: Event,
    roundingMethod?: 'floor' | 'round' | 'ceil',
    allowOutOfRange?: boolean
): Date

// XY coordinate → Date
getDateFromXY(
    xy: any[],
    roundingMethod?: 'floor' | 'round' | 'ceil',
    local?: boolean,
    allowOutOfRange?: boolean
): Date

// Time span → Pixel distance
getTimeSpanDistance(startDate: Date, endDate: Date): number

// Rectangle → Date range
getStartEndDatesFromRectangle(
    rect: Rectangle,
    roundingMethod: 'floor' | 'round' | 'ceil',
    duration: number
): object
```

### Rounding Methods

| Method | Behavior |
|--------|----------|
| `'floor'` | Round down to tick start |
| `'round'` | Round to nearest increment |
| `'ceil'` | Round up to tick end |

```typescript
// Example: Click at 10:37 AM with hourly ticks
const date1 = scheduler.getDateFromCoordinate(x, 'floor');  // 10:00 AM
const date2 = scheduler.getDateFromCoordinate(x, 'round');  // 11:00 AM (nearest)
const date3 = scheduler.getDateFromCoordinate(x, 'ceil');   // 11:00 AM
```

## Time Navigation

### setTimeSpan

Change the visible time range:

```typescript
// Simple date range
scheduler.setTimeSpan(new Date('2024-01-01'), new Date('2024-03-31'));

// With options (on TimelineBase)
scheduler.setTimeSpan(
    new Date('2024-01-01'),
    new Date('2024-03-31'),
    {
        // Options for transition behavior
    }
);
```

### shift / shiftNext / shiftPrevious

Navigate through time:

```typescript
// Move by custom amount and unit
scheduler.shift(1, 'week');
scheduler.shift(-2, 'month');

// Move by preset-defined increment
scheduler.shiftNext();      // Forward by shiftIncrement
scheduler.shiftPrevious();  // Backward by shiftIncrement

// Move multiple increments
scheduler.shiftNext(3);     // Forward 3x shiftIncrement
scheduler.shiftPrevious(2); // Backward 2x shiftIncrement
```

The shift amount is defined by the ViewPreset:

```typescript
const preset = {
    shiftUnit: 'week',
    shiftIncrement: 1
};
```

## Visible Date Range

### visibleDateRange Property

Get the currently visible portion of the timeline:

```typescript
readonly visibleDateRange: {
    startDate: Date
    endDate: Date
}

// Usage
const { startDate, endDate } = scheduler.visibleDateRange;
console.log(`Showing ${startDate} to ${endDate}`);
```

### visibleDateRangeChange Event

React to viewport changes:

```typescript
scheduler.on('visibleDateRangeChange', ({
    source,
    old,   // { startDate, endDate }
    new    // { startDate, endDate } - use 'new' with brackets: event['new']
}) => {
    console.log('Visible range changed');
    console.log(`From: ${old.startDate} - ${old.endDate}`);
    console.log(`To: ${event['new'].startDate} - ${event['new'].endDate}`);

    // Trigger data load for new range
    loadEventsForRange(event['new'].startDate, event['new'].endDate);
});
```

## Tick Width Configuration

```typescript
type ViewPresetConfig = {
    tickWidth: number   // Pixel width of each tick
    // ...
}

// Example
const preset = {
    base: 'weekAndDay',
    tickWidth: 50  // Each day is 50px wide
};
```

## Custom Tick Generation

Override how ticks are generated:

```typescript
const scheduler = new SchedulerPro({
    timeAxis: {
        generateTicks(axisStartDate, axisEndDate, unit, increment) {
            const ticks = [];
            let current = new Date(axisStartDate);

            while (current < axisEndDate) {
                const tickStart = new Date(current);

                // Skip weekends
                if (current.getDay() !== 0 && current.getDay() !== 6) {
                    // Calculate tick end
                    current = DateHelper.add(current, increment, unit);

                    ticks.push({
                        startDate: tickStart,
                        endDate: current
                    });
                } else {
                    // Move past weekend
                    current = DateHelper.add(current, 1, 'day');
                }
            }

            return ticks;
        }
    }
});
```

## TimeAxis Filtering

Filter out certain time periods (e.g., non-working hours):

```typescript
// Filter by function
await timeAxis.filterBy((tick, index) => {
    const hour = tick.startDate.getHours();
    // Only include 9 AM - 5 PM
    return hour >= 9 && hour < 17;
});
```

**Note:** If all ticks are filtered out, the `invalidFilter` event fires and the filter is disabled.

## Working Time Integration

When `workingTime` is configured, the TimeAxis automatically filters:

```typescript
const scheduler = new SchedulerPro({
    workingTime: {
        fromDay: 1,   // Monday
        toDay: 5,     // Friday
        fromHour: 9,
        toHour: 17
    }
});

// The TimeAxis will:
// - Filter out weekend ticks
// - Filter out non-working hour ticks
// - Set isContinuous to false
// - unfilteredStartDate/unfilteredEndDate retain original range
```

## Coordinate Flow Diagram

```
     User Click / Mouse Position
              │
              ▼
    ┌─────────────────────┐
    │ getDateFromDomEvent │ ─── Extracts X/Y from event
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │   getDateFromXY     │ ─── Handles orientation
    └─────────────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │ getDateFromCoordinate    │ ─── Local/page conversion
    └──────────────────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │ TimeAxisViewModel        │
    │ getDateFromPosition()    │ ─── Tick calculation
    └──────────────────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │ TimeAxis                 │
    │ getDateFromTick()        │ ─── Rounding applied
    └──────────────────────────┘
              │
              ▼
         Date Result
```

## TimeAxisColumn

Renders the timeline header with tick labels.

```typescript
type TimeAxisColumnConfig = {
    type: 'timeAxis' | 'timeaxis'
    // Inherits from WidgetColumn
}
```

The TimeAxisColumn automatically:
- Renders header rows based on ViewPreset
- Handles header click events
- Supports header context menu
- Manages header widgets

## Region Calculations

Get regions for scheduling operations:

```typescript
// Get region for a resource's schedule area
const region = scheduler.getScheduleRegion(resourceRecord, eventRecord);

// Get region for a resource constrained by dates
const region = scheduler.getResourceRegion(resourceRecord, startDate, endDate);

// Get box for a specific event on a resource
const box = scheduler.getResourceEventBox(eventRecord, resourceRecord, includeOutside);
```

## Common Patterns

### Pattern 1: Zoom to Date Range

```typescript
function zoomToDateRange(startDate, endDate) {
    scheduler.setTimeSpan(startDate, endDate);
}

// Zoom to a specific event
function zoomToEvent(event) {
    const padding = 1000 * 60 * 60 * 24;  // 1 day
    scheduler.setTimeSpan(
        new Date(event.startDate.getTime() - padding),
        new Date(event.endDate.getTime() + padding)
    );
}
```

### Pattern 2: Snap to Nearest Increment

```typescript
function snapDateToGrid(date) {
    const tick = scheduler.timeAxis.getTickFromDate(date);
    if (tick === -1) return null;

    return scheduler.timeAxis.getDateFromTick(Math.round(tick), 'round');
}
```

### Pattern 3: Date Validation

```typescript
function isDateInSchedule(date) {
    return scheduler.timeAxis.dateInAxis(date);
}

function isTimeSpanVisible(startDate, endDate) {
    return scheduler.timeAxis.timeSpanInAxis(startDate, endDate);
}
```

### Pattern 4: Navigation Buttons

```typescript
const toolbar = {
    items: [
        {
            type: 'button',
            text: '< Prev',
            onClick() {
                scheduler.shiftPrevious();
            }
        },
        {
            type: 'button',
            text: 'Today',
            onClick() {
                scheduler.setTimeSpan(
                    DateHelper.startOf(new Date(), 'week'),
                    DateHelper.add(DateHelper.startOf(new Date(), 'week'), 1, 'week')
                );
            }
        },
        {
            type: 'button',
            text: 'Next >',
            onClick() {
                scheduler.shiftNext();
            }
        }
    ]
};
```

### Pattern 5: Dynamic Time Range Based on Data

```typescript
function autoFitTimeRange() {
    const events = scheduler.eventStore.records;

    if (events.length === 0) return;

    let minDate = events[0].startDate;
    let maxDate = events[0].endDate;

    events.forEach(event => {
        if (event.startDate < minDate) minDate = event.startDate;
        if (event.endDate > maxDate) maxDate = event.endDate;
    });

    // Add padding
    const padding = 1000 * 60 * 60 * 24;  // 1 day
    scheduler.setTimeSpan(
        new Date(minDate.getTime() - padding),
        new Date(maxDate.getTime() + padding)
    );
}
```

## Integration Notes

1. **Store-Based**: TimeAxis extends Store, so standard store methods (filter, sort, etc.) are available but typically not used directly.

2. **ViewPreset Coupling**: TimeAxis configuration is largely driven by the active ViewPreset. Changing presets reconfigures the axis.

3. **Event Synchronization**: TimeAxis reconfiguration triggers scheduler redraws and event repositioning.

4. **Continuity**: When `isContinuous` is false (due to workingTime filtering), coordinate calculations account for gaps.

5. **Performance**: Tick generation is optimized for visible range plus buffer. Extreme ranges may impact performance.

6. **Timezone Awareness**: Dates respect the project's timezone configuration when set.
