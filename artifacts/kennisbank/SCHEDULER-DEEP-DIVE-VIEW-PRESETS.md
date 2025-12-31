# SchedulerPro Deep Dive: View Presets & Zooming

## Overview

ViewPresets define the granularity and appearance of the timeline:
- **Time Unit**: The base time unit (hours, days, weeks, etc.)
- **Header Configuration**: Multiple header rows with custom formatting
- **Tick Width**: Column widths for time cells
- **Time Resolution**: Snap granularity for drag operations
- **Zoom Levels**: Seamless zoom transitions between presets

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ViewPreset System                             │
├─────────────────────────────────────────────────────────────────┤
│  PresetManager (Singleton)                                       │
│  ├── Built-in presets (secondAndMinute → year)                  │
│  ├── Custom preset registration                                  │
│  └── Preset normalization                                       │
├─────────────────────────────────────────────────────────────────┤
│  PresetStore                                                     │
│  ├── Sorted by zoom order                                       │
│  ├── Preset lookup by ID                                        │
│  └── Zoom level management                                      │
├─────────────────────────────────────────────────────────────────┤
│  ViewPreset Record                                               │
│  ├── headers[] - Header row configurations                      │
│  ├── tickWidth/tickHeight - Tick dimensions                     │
│  ├── timeResolution - Snap granularity                          │
│  └── shiftUnit/shiftIncrement - Navigation settings             │
├─────────────────────────────────────────────────────────────────┤
│  TimelineViewPresets Mixin                                       │
│  ├── viewPreset property                                         │
│  ├── Preset change events                                        │
│  └── Zoom methods                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Built-in Presets

SchedulerPro includes these presets by default:

| Preset ID | Main Unit | Description |
|-----------|-----------|-------------|
| `secondAndMinute` | Second | Seconds within minutes |
| `minuteAndHour` | Minute | Minutes within hours |
| `hourAndDay` | Hour | Hours within days |
| `dayAndWeek` | Day | Days within weeks |
| `weekAndDay` | Day | Days within weeks (week focus) |
| `weekAndMonth` | Week | Weeks within months |
| `weekAndDayLetter` | Day | Days with single letter |
| `weekDateAndMonth` | Week | Week numbers within months |
| `monthAndYear` | Month | Months within years |
| `year` | Year | Years |
| `manyYears` | Year | Multiple years |

## ViewPreset Configuration

### Basic Structure

```typescript
interface ViewPresetConfig {
    // Identity
    id?: string;
    name?: string;
    base?: string;  // Extend existing preset

    // Header configuration
    headers?: ViewPresetHeaderRow[];
    mainHeaderLevel?: number;

    // Time units
    mainUnit?: DurationUnit;
    shiftUnit?: DurationUnit;
    shiftIncrement?: number;
    defaultSpan?: number;

    // Dimensions
    tickWidth?: number;      // Horizontal mode
    tickHeight?: number;     // Vertical mode
    rowHeight?: number;      // Row height in horizontal mode

    // Resolution
    timeResolution?: {
        unit: string;
        increment: number;
    };

    // Display
    displayDateFormat?: string;
    columnLinesFor?: number;
}
```

### Header Row Configuration

```typescript
interface ViewPresetHeaderRow {
    // Time unit and increment
    unit: DurationUnit;
    increment?: number;

    // Display
    dateFormat?: string;
    align?: 'start' | 'center' | 'end';
    headerCellCls?: string;

    // Custom rendering
    renderer?: (data: {
        startDate: Date;
        endDate: Date;
        headerConfig: object;
        index: number;
    }) => string | DomConfig;
}
```

## Using View Presets

### Basic Configuration

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    // Use built-in preset
    viewPreset: 'hourAndDay',

    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 8)
});
```

### Inline Preset Configuration

```javascript
const scheduler = new SchedulerPro({
    // Configure preset inline
    viewPreset: {
        base: 'hourAndDay',  // Extend existing

        // Override tick width
        tickWidth: 50,

        // Custom headers
        headers: [
            {
                unit: 'day',
                dateFormat: 'ddd DD MMM',
                align: 'center'
            },
            {
                unit: 'hour',
                dateFormat: 'HH:mm',
                increment: 2  // Every 2 hours
            }
        ],

        // Snap to 15 minute intervals
        timeResolution: {
            unit: 'minute',
            increment: 15
        }
    }
});
```

### Change Preset at Runtime

```javascript
// Change to different preset
scheduler.viewPreset = 'dayAndWeek';

// Change with options
scheduler.viewPreset = {
    base: 'weekAndMonth',
    tickWidth: 100
};

// Access current preset
console.log(scheduler.viewPreset);
```

## Custom Presets

### Register with PresetManager

```javascript
import { PresetManager } from '@bryntum/schedulerpro';

// Register a custom preset globally
PresetManager.registerPreset('myCustomPreset', {
    name: 'My Custom Preset',

    // Base unit is 30-minute blocks
    tickWidth: 60,
    tickHeight: 50,
    rowHeight: 40,

    displayDateFormat: 'HH:mm',

    // Shift by 1 day when using navigation
    shiftUnit: 'day',
    shiftIncrement: 1,

    // Default visible span: 2 days
    defaultSpan: 2,

    // Time resolution: snap to 15 minutes
    timeResolution: {
        unit: 'minute',
        increment: 15
    },

    // Three header levels
    headers: [
        // Top: Week
        {
            unit: 'week',
            dateFormat: 'Week WW, YYYY',
            align: 'center'
        },
        // Middle: Day
        {
            unit: 'day',
            dateFormat: 'ddd DD MMM'
        },
        // Bottom: 30-minute blocks
        {
            unit: 'minute',
            increment: 30,
            dateFormat: 'HH:mm'
        }
    ],

    // Column lines for bottom header
    columnLinesFor: 2,

    // Main header is day (index 1)
    mainHeaderLevel: 1
});

// Now use it
const scheduler = new SchedulerPro({
    viewPreset: 'myCustomPreset'
});
```

### Custom Header Renderers

```javascript
PresetManager.registerPreset('customRendered', {
    base: 'hourAndDay',

    headers: [
        {
            unit: 'day',
            renderer({ startDate, endDate, headerConfig }) {
                const isWeekend = startDate.getDay() === 0 ||
                                  startDate.getDay() === 6;

                return {
                    className: isWeekend ? 'weekend-header' : 'weekday-header',
                    children: [
                        {
                            tag: 'span',
                            className: 'day-name',
                            text: DateHelper.format(startDate, 'ddd')
                        },
                        {
                            tag: 'span',
                            className: 'day-date',
                            text: DateHelper.format(startDate, 'DD')
                        }
                    ]
                };
            }
        },
        {
            unit: 'hour',
            dateFormat: 'HH'
        }
    ]
});
```

## Zooming

### Zoom Configuration

```javascript
const scheduler = new SchedulerPro({
    // Min/max zoom levels (index into presets)
    minZoomLevel: 0,       // Most zoomed out
    maxZoomLevel: 23,      // Most zoomed in

    // Zoom via mouse wheel
    zoomOnMouseWheel: true,

    // Double-click header to zoom
    zoomOnTimeAxisDoubleClick: true,

    // Keep original timespan when zooming
    zoomKeepsOriginalTimespan: false,

    // Size of timespan after zoom
    visibleZoomFactor: 5
});
```

### Zoom Methods

```javascript
// Zoom in one level
scheduler.zoomIn();

// Zoom in multiple levels
scheduler.zoomIn(3);

// Zoom in fully
scheduler.zoomInFull();

// Zoom out one level
scheduler.zoomOut();

// Zoom out fully
scheduler.zoomOutFull();

// Zoom to specific level
scheduler.zoomToLevel(5);

// Zoom to fit all events
scheduler.zoomToFit();

// Zoom to specific date range
scheduler.zoomToSpan({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 15)
});

// Get current zoom level
console.log(scheduler.zoomLevel);
```

### Zoom to Span Options

```javascript
scheduler.zoomToSpan({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 7),

    // Center on specific date
    centerDate: new Date(2024, 0, 4),

    // Adjust margins
    leftMargin: 50,
    rightMargin: 50
});
```

### Zoom Events

```javascript
scheduler.on({
    // Before preset change
    beforePresetChange({ from, to, startDate, endDate }) {
        console.log(`Changing from ${from.name} to ${to.name}`);
        // Return false to cancel
        return true;
    },

    // After preset change
    presetChange({ from, to, startDate, endDate, centerDate }) {
        console.log(`Now using ${to.name}`);
    },

    // When zoom limit reached
    zoomLevelReached({ currentZoomLevel }) {
        console.log(`Cannot zoom further. Level: ${currentZoomLevel}`);
    }
});
```

## Preset Store

### Access Presets

```javascript
// Get all available presets
const presets = scheduler.presets;

// Get specific preset by ID
const preset = PresetManager.normalizePreset('hourAndDay');

// Iterate presets
scheduler.presets.forEach(preset => {
    console.log(`${preset.id}: ${preset.name}`);
});
```

### Limit Available Presets

```javascript
const scheduler = new SchedulerPro({
    // Only use specific presets
    presets: [
        'hourAndDay',
        'dayAndWeek',
        'weekAndMonth'
    ],

    viewPreset: 'dayAndWeek'
});
```

### Custom Preset Store

```javascript
const scheduler = new SchedulerPro({
    // Use custom preset data
    presets: [
        {
            id: 'quarterHour',
            name: '15 Minute View',
            tickWidth: 30,
            headers: [
                { unit: 'day', dateFormat: 'ddd DD' },
                { unit: 'minute', increment: 15, dateFormat: 'HH:mm' }
            ],
            timeResolution: { unit: 'minute', increment: 15 }
        },
        {
            id: 'halfDay',
            name: 'Half Day View',
            tickWidth: 80,
            headers: [
                { unit: 'week', dateFormat: 'Week WW' },
                { unit: 'day', dateFormat: 'ddd DD MMM' }
            ],
            timeResolution: { unit: 'hour', increment: 1 }
        }
    ],

    viewPreset: 'halfDay'
});
```

## ViewPreset Combo Widget

UI control for selecting presets:

```javascript
const scheduler = new SchedulerPro({
    tbar: [
        {
            type: 'viewpresetcombo',
            ref: 'presetCombo',
            width: 200,

            // Filter available presets
            presets: ['hourAndDay', 'dayAndWeek', 'weekAndMonth'],

            // Handle selection
            onSelect({ record }) {
                console.log('Selected preset:', record.id);
            }
        },

        // Zoom buttons
        {
            type: 'button',
            icon: 'b-icon-search-plus',
            tooltip: 'Zoom In',
            onClick() {
                scheduler.zoomIn();
            }
        },
        {
            type: 'button',
            icon: 'b-icon-search-minus',
            tooltip: 'Zoom Out',
            onClick() {
                scheduler.zoomOut();
            }
        },
        {
            type: 'button',
            text: 'Fit All',
            onClick() {
                scheduler.zoomToFit();
            }
        }
    ]
});
```

## Complete Example

```javascript
import {
    SchedulerPro,
    DateHelper,
    PresetManager
} from '@bryntum/schedulerpro';

// Register custom presets
PresetManager.registerPreset('quarterHour', {
    name: '15 Minute Blocks',
    tickWidth: 40,
    rowHeight: 32,
    displayDateFormat: 'HH:mm',
    shiftUnit: 'hour',
    shiftIncrement: 4,
    defaultSpan: 8,
    timeResolution: {
        unit: 'minute',
        increment: 15
    },
    headers: [
        {
            unit: 'day',
            dateFormat: 'ddd DD MMMM YYYY',
            align: 'center'
        },
        {
            unit: 'hour',
            dateFormat: 'HH:mm'
        },
        {
            unit: 'minute',
            increment: 15,
            renderer({ startDate }) {
                const minutes = startDate.getMinutes();
                return minutes === 0 ? '' : `:${minutes}`;
            }
        }
    ],
    columnLinesFor: 1
});

PresetManager.registerPreset('workWeek', {
    name: 'Work Week',
    tickWidth: 120,
    rowHeight: 40,
    displayDateFormat: 'ddd DD MMM',
    shiftUnit: 'week',
    shiftIncrement: 1,
    defaultSpan: 5,
    timeResolution: {
        unit: 'day',
        increment: 1
    },
    headers: [
        {
            unit: 'month',
            dateFormat: 'MMMM YYYY',
            align: 'center'
        },
        {
            unit: 'day',
            renderer({ startDate }) {
                const dayNum = startDate.getDay();
                // Skip weekends in data, but render header
                const isWeekend = dayNum === 0 || dayNum === 6;

                return {
                    className: isWeekend ? 'weekend' : 'weekday',
                    children: [
                        {
                            tag: 'div',
                            className: 'day-name',
                            text: DateHelper.format(startDate, 'ddd')
                        },
                        {
                            tag: 'div',
                            className: 'day-number',
                            text: DateHelper.format(startDate, 'DD')
                        }
                    ]
                };
            }
        }
    ]
});

const scheduler = new SchedulerPro({
    appendTo: 'container',

    // Available presets
    presets: [
        'quarterHour',
        'hourAndDay',
        'dayAndWeek',
        'workWeek',
        'weekAndMonth'
    ],

    viewPreset: 'dayAndWeek',

    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 15),

    // Zoom configuration
    zoomOnMouseWheel: true,
    zoomOnTimeAxisDoubleClick: true,
    minZoomLevel: 0,
    maxZoomLevel: 4,

    listeners: {
        beforePresetChange({ from, to }) {
            console.log(`Switching from ${from.name} to ${to.name}`);
        },

        presetChange({ to }) {
            // Update UI to reflect new preset
            document.getElementById('currentPreset').textContent = to.name;
        }
    },

    tbar: [
        {
            type: 'viewpresetcombo',
            width: 200
        },
        '|',
        {
            type: 'button',
            icon: 'b-icon-search-minus',
            tooltip: 'Zoom Out',
            onClick() {
                scheduler.zoomOut();
            }
        },
        {
            type: 'button',
            icon: 'b-icon-search-plus',
            tooltip: 'Zoom In',
            onClick() {
                scheduler.zoomIn();
            }
        },
        {
            type: 'button',
            text: 'Fit',
            onClick() {
                scheduler.zoomToFit();
            }
        },
        '->',
        {
            type: 'buttongroup',
            items: [
                {
                    icon: 'b-icon-previous',
                    onClick: () => scheduler.shiftPrevious()
                },
                {
                    text: 'Today',
                    onClick: () => scheduler.scrollToDate(new Date())
                },
                {
                    icon: 'b-icon-next',
                    onClick: () => scheduler.shiftNext()
                }
            ]
        }
    ]
});
```

## CSS for Custom Headers

```css
/* Custom header styling */
.weekend-header {
    background-color: #f0f0f0;
    color: #999;
}

.weekday-header {
    background-color: #fff;
}

.day-name {
    font-weight: bold;
    font-size: 12px;
}

.day-number {
    font-size: 18px;
    color: #333;
}

/* Quarter hour preset */
.b-sch-header-row-2 .b-sch-header-timeaxis-cell {
    font-size: 10px;
    color: #666;
}

/* Work week weekend styling */
.weekend {
    background-color: #f5f5f5;
    opacity: 0.7;
}
```

## Best Practices

1. **Extend Base Presets**: Use `base` to inherit from built-in presets
2. **Consistent Time Resolution**: Match resolution to use case (5 min for detailed, 1 day for overview)
3. **Header Hierarchy**: Use 2-3 header levels maximum for readability
4. **Tick Width**: Adjust for content - wider for more text, narrower for dense data
5. **Register Globally**: Use PresetManager for presets needed across multiple schedulers
6. **Zoom Limits**: Set appropriate min/max to prevent unusable zoom levels

## API Reference Links

- [ViewPreset](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/preset/ViewPreset)
- [PresetManager](https://bryntum.com/products/schedulerpro/docs/api/PresetManager)
- [PresetStore](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/preset/PresetStore)
- [TimelineViewPresets Mixin](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/mixin/TimelineViewPresets)
- [TimelineZoomable Mixin](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/mixin/TimelineZoomable)
- [ViewPresetCombo](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/widget/ViewPresetCombo)
