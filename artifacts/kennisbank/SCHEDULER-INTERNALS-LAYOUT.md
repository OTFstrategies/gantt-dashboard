# SchedulerPro Internals: Layout System

## Overview

SchedulerPro's layout system consists of:
- **ViewPreset**: Defines time scale and header configuration
- **TimeAxis**: Manages time ticks and date-to-coordinate mapping
- **SubGrid/Regions**: Locked (left) and normal (schedule) areas
- **Time-to-pixel mapping**: Converts dates to screen coordinates

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Layout System                                │
├─────────────────────────────────────────────────────────────────┤
│  PresetManager                                                  │
│  └── ViewPreset definitions (hourAndDay, weekAndDay, etc.)     │
├─────────────────────────────────────────────────────────────────┤
│  TimeAxis                                                       │
│  ├── Tick store (date ranges)                                   │
│  ├── Date-to-coordinate mapping                                 │
│  └── Time resolution                                            │
├─────────────────────────────────────────────────────────────────┤
│  SubGrid Layout                                                 │
│  ├── Locked region (columns)                                    │
│  └── Normal region (schedule/timeline)                          │
├─────────────────────────────────────────────────────────────────┤
│  TimeAxisColumn                                                 │
│  └── Schedule area with events                                  │
└─────────────────────────────────────────────────────────────────┘
```

## ViewPreset

Defines the time scale granularity and header layout:

```typescript
interface ViewPreset {
    // Identity
    id?: string;
    name?: string;
    base?: string;              // Extend existing preset

    // Time scale
    tickWidth?: number;         // Width per tick (horizontal)
    tickHeight?: number;        // Height per tick (vertical)
    displayDateFormat?: string; // Tooltip date format

    // Navigation
    shiftUnit?: DurationUnit;   // Unit for shift operations
    shiftIncrement?: number;    // Amount to shift
    defaultSpan?: number;       // Default view span

    // Headers
    headers?: ViewPresetHeaderRow[];
    mainHeaderLevel?: number;   // Which header is "main"
    columnLinesFor?: number;    // Header level for column lines

    // Resolution
    timeResolution?: {
        unit: DurationUnit;
        increment: number;
    };

    // Row sizing
    rowHeight?: number;
}
```

### Built-in Presets

```javascript
// Available preset IDs
const presets = [
    'secondAndMinute',   // Per-second view
    'minuteAndHour',     // Per-minute view
    'hourAndDay',        // Per-hour view
    'dayAndWeek',        // Per-day view
    'weekAndDay',        // Per-week view
    'weekAndMonth',      // Weekly with months
    'weekDateAndMonth',  // Week dates with months
    'monthAndYear',      // Per-month view
    'year',              // Per-year view
    'manyYears'          // Multi-year view
];

// Use preset
const scheduler = new SchedulerPro({
    viewPreset: 'hourAndDay'
});
```

### Custom Preset

```javascript
import { PresetManager, SchedulerPro } from '@bryntum/schedulerpro';

// Register custom preset
PresetManager.add({
    id: 'customDayView',
    name: 'Custom Day View',
    base: 'hourAndDay',  // Extend existing

    tickWidth: 50,
    rowHeight: 40,

    displayDateFormat: 'HH:mm',

    shiftUnit: 'day',
    shiftIncrement: 1,
    defaultSpan: 24,  // Hours

    timeResolution: {
        unit: 'minute',
        increment: 15
    },

    headers: [
        // Top header: Day
        {
            unit: 'day',
            dateFormat: 'ddd DD/MM'
        },
        // Bottom header: Hour
        {
            unit: 'hour',
            dateFormat: 'HH:mm',
            increment: 1
        }
    ]
});

const scheduler = new SchedulerPro({
    viewPreset: 'customDayView'
});
```

### Header Configuration

```typescript
interface ViewPresetHeaderRow {
    unit: DurationUnit;         // Time unit
    increment?: number;         // Units per cell
    dateFormat?: string;        // Date formatting
    align?: 'start' | 'center' | 'end';
    headerCellCls?: string;     // CSS class

    // Custom rendering
    renderer?: (data: {
        startDate: Date;
        endDate: Date;
        headerConfig: object;
        index: number;
    }) => string;

    // Full control
    cellGenerator?: () => {
        start: Date;
        end: Date;
        header: string;
    }[];
}
```

### Multi-level Headers

```javascript
const preset = {
    id: 'quarterView',
    headers: [
        // Top: Year
        {
            unit: 'year',
            dateFormat: 'YYYY'
        },
        // Middle: Quarter
        {
            unit: 'quarter',
            renderer: ({ startDate }) => `Q${Math.floor(startDate.getMonth() / 3) + 1}`
        },
        // Bottom: Month
        {
            unit: 'month',
            dateFormat: 'MMM'
        }
    ],
    mainHeaderLevel: 2  // Month is main header
};
```

## TimeAxis

Manages time ticks and coordinate mapping:

```typescript
class TimeAxis extends Store {
    // Properties
    startDate: Date;
    endDate: Date;
    unit: DurationUnit;
    increment: number;

    // Tick access
    first: TimeSpan;           // First tick
    last: TimeSpan;            // Last tick
    count: number;             // Total ticks

    // Resolution
    resolution: {
        unit: DurationUnit;
        increment: number;
    };

    // Methods
    generateTicks(start: Date, end: Date, unit: string, increment: number): void;
    getTicksForRange(startDate: Date, endDate: Date): TimeSpan[];
    dateInAxis(date: Date): boolean;
    isTimeSpanInAxis(timeSpan: TimeSpan): boolean;
}
```

### TimeAxis Configuration

```javascript
const scheduler = new SchedulerPro({
    // TimeAxis generates from these
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31),

    // Or via TimeAxis directly
    timeAxis: {
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
        unit: 'day',
        increment: 1
    }
});
```

## Date-to-Coordinate Mapping

Core methods for positioning:

```javascript
// Get X coordinate from date
const x = scheduler.getCoordinateFromDate(new Date(), {
    local: true,           // Local to schedule area
    respectExclusion: true // Respect non-working time
});

// Get date from X,Y coordinates
const date = scheduler.getDateFromXY([x, y], {
    roundingMethod: 'round', // 'floor' | 'round' | 'ceil'
    local: true,
    allowOutOfRange: false
});

// Get date from X only
const dateFromX = scheduler.getDateFromCoordinate(x, 'round', true);

// Get time span for a resource at coordinates
const { startDate, endDate } = scheduler.getTimeSpanFromXY([x, y], 'round');
```

### Coordinate Examples

```javascript
// Position an element at specific date
function positionAtDate(element, date) {
    const x = scheduler.getCoordinateFromDate(date, { local: true });
    if (x !== -1) {
        element.style.left = `${x}px`;
    }
}

// Get date range for visible area
function getVisibleDateRange() {
    const rect = scheduler.timeAxisSubGridElement.getBoundingClientRect();
    const startDate = scheduler.getDateFromCoordinate(0, 'floor', true);
    const endDate = scheduler.getDateFromCoordinate(rect.width, 'ceil', true);
    return { startDate, endDate };
}
```

## SubGrid (Regions)

SchedulerPro has two main regions:

```
┌─────────────────────────────────────────────────────────────────┐
│  Header                                                         │
├─────────────────┬───────────────────────────────────────────────┤
│  Locked Region  │  Normal Region (Schedule)                     │
│  ┌───────────┐  │  ┌─────────────────────────────────────────┐ │
│  │ Resource  │  │  │ TimeAxisColumn                          │ │
│  │ Columns   │  │  │ ┌────────────────────────────────────┐  │ │
│  │           │  │  │ │ Event bars                         │  │ │
│  │           │  │  │ │                                    │  │ │
│  │           │  │  │ └────────────────────────────────────┘  │ │
│  └───────────┘  │  └─────────────────────────────────────────┘ │
└─────────────────┴───────────────────────────────────────────────┘
        ↑                              ↑
   subGrids.locked              subGrids.normal
```

### SubGrid Configuration

```javascript
const scheduler = new SchedulerPro({
    subGridConfigs: {
        locked: {
            width: 200,      // Fixed width
            minWidth: 100,
            maxWidth: 400,
            collapsible: true,
            collapsed: false
        },
        normal: {
            flex: 1          // Flexible width
        }
    }
});
```

### Access SubGrids

```javascript
// Get SubGrid instances
const lockedSubGrid = scheduler.subGrids.locked;
const normalSubGrid = scheduler.subGrids.normal;

// Get elements
const lockedElement = scheduler.lockedGridElement;
const scheduleElement = scheduler.timeAxisSubGridElement;

// Collapse/expand
scheduler.subGrids.locked.collapse();
scheduler.subGrids.locked.expand();

// Resize
scheduler.subGrids.locked.width = 250;
```

## Column Regions

Columns are assigned to regions:

```javascript
const scheduler = new SchedulerPro({
    columns: [
        // Locked region columns
        {
            type: 'resourceInfo',
            text: 'Name',
            field: 'name',
            width: 150,
            region: 'locked'  // Explicitly locked
        },
        {
            text: 'Role',
            field: 'role',
            width: 100
            // No region = defaults to 'locked' for regular columns
        }
    ]
});
```

## Tick Size and Zooming

Control time scale resolution:

```javascript
const scheduler = new SchedulerPro({
    // Fixed tick width
    tickSize: 50,

    // Or allow auto-calculation
    suppressFit: false  // Auto-fit ticks to viewport
});

// Change tick size at runtime
scheduler.tickSize = 75;

// Listen for changes
scheduler.on({
    tickSizeChange({ tickSize }) {
        console.log('New tick size:', tickSize);
    }
});
```

### Zooming

```javascript
const scheduler = new SchedulerPro({
    // Zooming configuration
    zoomOnMouseWheel: true,
    zoomOnTimeAxisDoubleClick: true,

    // Zoom levels (using presets)
    minZoomLevel: 0,
    maxZoomLevel: 10
});

// Programmatic zooming
scheduler.zoomIn();
scheduler.zoomOut();
scheduler.zoomToLevel(5);
scheduler.zoomToFit();  // Fit all events

// Zoom to specific date range
scheduler.zoomToSpan({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 7)
});
```

## Time Resolution

Controls snap behavior during drag/resize:

```javascript
const scheduler = new SchedulerPro({
    viewPreset: {
        base: 'hourAndDay',
        timeResolution: {
            unit: 'minute',
            increment: 15  // Snap to 15-minute intervals
        }
    }
});

// Access resolution
console.log(scheduler.timeResolution);
// { unit: 'minute', increment: 15 }

// Change at runtime
scheduler.timeResolution = {
    unit: 'minute',
    increment: 30
};
```

## Row Layout

Configure row sizing:

```javascript
const scheduler = new SchedulerPro({
    // Fixed row height
    rowHeight: 50,

    // Or auto-calculate based on events
    autoRowHeight: true,

    // Margin between event bars
    barMargin: 5,

    // Dynamic height per resource
    getRowHeight({ record }) {
        return record.isManager ? 80 : 50;
    }
});
```

## Working Time

Filter visible time:

```javascript
const scheduler = new SchedulerPro({
    // Show only working hours
    workingTime: {
        fromDay: 1,      // Monday
        toDay: 5,        // Friday
        fromHour: 9,     // 9 AM
        toHour: 17       // 5 PM
    }
});

// Or use TimeAxis include
timeAxis: {
    include: {
        unit: 'hour',
        from: 8,
        to: 18
    }
}
```

## Infinite Scroll

For large date ranges:

```javascript
const scheduler = new SchedulerPro({
    infiniteScroll: true,

    // Buffer size
    bufferCoef: 5,  // Buffer 5x visible area

    // Event for loading more data
    listeners: {
        beforeTimeAxisChange({ startDate, endDate }) {
            // Load data for new range
            loadDataForRange(startDate, endDate);
        }
    }
});
```

## State Management

Save and restore layout state:

```javascript
// Get state
const state = scheduler.state;
/*
{
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    viewPreset: 'hourAndDay',
    zoomLevel: 5,
    subGrids: {
        locked: { width: 200, collapsed: false }
    },
    columns: [...],
    scroll: { x: 0, y: 0 }
}
*/

// Restore state
scheduler.state = savedState;

// Or individual properties
scheduler.viewPreset = 'dayAndWeek';
scheduler.zoomLevel = 7;
```

## Complete Layout Example

```javascript
import { SchedulerPro, PresetManager } from '@bryntum/schedulerpro';

// Register custom preset
PresetManager.add({
    id: 'customSchedule',
    name: 'Custom Schedule',

    tickWidth: 60,
    rowHeight: 50,

    displayDateFormat: 'HH:mm',
    shiftUnit: 'day',
    shiftIncrement: 1,
    defaultSpan: 24,

    timeResolution: {
        unit: 'minute',
        increment: 15
    },

    headers: [
        {
            unit: 'day',
            dateFormat: 'dddd, MMMM D',
            align: 'center'
        },
        {
            unit: 'hour',
            dateFormat: 'HH:mm',
            increment: 1,
            renderer: ({ startDate, headerConfig }) => {
                const hour = startDate.getHours();
                headerConfig.headerCellCls = hour < 9 || hour >= 17
                    ? 'non-working'
                    : 'working';
                return `${hour}:00`;
            }
        }
    ],

    columnLinesFor: 1,  // Lines for hour header
    mainHeaderLevel: 1
});

const scheduler = new SchedulerPro({
    appendTo: 'container',

    viewPreset: 'customSchedule',

    startDate: new Date(2024, 0, 15, 0, 0),
    endDate: new Date(2024, 0, 16, 0, 0),

    // SubGrid configuration
    subGridConfigs: {
        locked: {
            width: 250,
            collapsible: true
        }
    },

    // Columns
    columns: [
        {
            type: 'resourceInfo',
            text: 'Staff',
            width: 150
        },
        {
            text: 'Role',
            field: 'role',
            width: 100
        }
    ],

    // Working time
    workingTime: {
        fromDay: 1,
        toDay: 5,
        fromHour: 9,
        toHour: 17
    },

    // Features
    features: {
        nonWorkingTime: true,
        columnLines: true,
        timeRanges: {
            showCurrentTimeLine: true
        }
    },

    // Zooming
    zoomOnMouseWheel: true,
    minZoomLevel: 0,
    maxZoomLevel: 10,

    tbar: [
        {
            type: 'button',
            icon: 'b-fa-search-minus',
            onClick: () => scheduler.zoomOut()
        },
        {
            type: 'button',
            icon: 'b-fa-search-plus',
            onClick: () => scheduler.zoomIn()
        },
        {
            type: 'button',
            text: 'Fit',
            onClick: () => scheduler.zoomToFit()
        },
        '->',
        {
            type: 'viewpresetcombo',
            width: 200
        }
    ],

    listeners: {
        tickSizeChange({ tickSize }) {
            console.log('Tick size:', tickSize);
        },

        viewPresetChange({ from, to }) {
            console.log(`Preset: ${from?.id} → ${to?.id}`);
        }
    }
});

// Runtime layout changes
function adjustLayout() {
    // Change preset
    scheduler.viewPreset = 'dayAndWeek';

    // Change time span
    scheduler.setTimeSpan(
        new Date(2024, 0, 1),
        new Date(2024, 0, 14)
    );

    // Adjust tick size
    scheduler.tickSize = 80;

    // Scroll to date
    scheduler.scrollToDate(new Date(2024, 0, 7), {
        block: 'center',
        animate: true
    });
}
```

## CSS Layout Variables

```css
/* Tick/column sizing */
.b-scheduler {
    --event-height: 36px;
    --bar-margin: 5px;
    --tick-width: 50px;
}

/* Region sizing */
.b-grid-subgrid-locked {
    min-width: 200px;
    max-width: 400px;
}

/* Header styling */
.b-sch-header-row {
    height: 40px;
}

.b-sch-header-timeaxis-cell.non-working {
    background-color: #f5f5f5;
    color: #999;
}

/* Column lines */
.b-column-line {
    border-left-color: rgba(0, 0, 0, 0.1);
}

/* Time axis scrolling */
.b-sch-timeaxis {
    scroll-behavior: smooth;
}
```

## Best Practices

1. **Use built-in presets** - Extend rather than create from scratch
2. **Register presets early** - Before creating scheduler instances
3. **Use timeResolution** - For consistent snap behavior
4. **Configure subGrids** - Set min/max widths for usability
5. **Handle state changes** - Listen to viewPresetChange, tickSizeChange
6. **Test zoom levels** - Verify layout at all zoom levels
7. **Consider infinite scroll** - For large date ranges
8. **Optimize headers** - Minimize complex renderers

## API Reference Links

- [ViewPreset](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/preset/ViewPreset)
- [PresetManager](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/preset/PresetManager)
- [TimeAxis](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/data/TimeAxis)
- [SubGrid](https://bryntum.com/products/schedulerpro/docs/api/Grid/view/SubGrid)
- [TimeAxisColumn](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/column/TimeAxisColumn)
- [TimelineDateMapper](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/mixin/TimelineDateMapper)
