# Bryntum Gantt/Scheduler: Time Axis and ViewPreset System Internals

This document provides a deep analysis of the Time Axis and ViewPreset system in Bryntum Gantt/Scheduler, covering tick generation, date-to-pixel conversions, zooming algorithms, and infinite scrolling.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [ViewPreset Structure](#viewpreset-structure)
3. [TimeAxis Class](#timeaxis-class)
4. [TimeAxisViewModel](#timeaxisviewmodel)
5. [Tick Generation Algorithm](#tick-generation-algorithm)
6. [Header Levels Configuration](#header-levels-configuration)
7. [Date-to-Pixel Conversion](#date-to-pixel-conversion)
8. [Pixel-to-Date Conversion](#pixel-to-date-conversion)
9. [Zooming System](#zooming-system)
10. [Infinite Scrolling](#infinite-scrolling)
11. [Time Resolution and Snapping](#time-resolution-and-snapping)
12. [DateHelper Utilities](#datehelper-utilities)
13. [Built-in Presets](#built-in-presets)
14. [Custom Preset Creation](#custom-preset-creation)

---

## Architecture Overview

The time axis system consists of several interconnected components:

```
PresetManager (Singleton)
    |
    v
PresetStore --> ViewPreset (records)
    |
    v
TimeAxis (Store of TimeSpan ticks)
    |
    v
TimeAxisViewModel (visual representation)
    |
    v
Timeline Rendering (Headers + Events)
```

### Key Classes

| Class | Purpose |
|-------|---------|
| `PresetManager` | Global singleton store of available ViewPresets |
| `PresetStore` | Store class holding ViewPreset records |
| `ViewPreset` | Model defining timeline granularity and headers |
| `TimeAxis` | Store of tick records representing time intervals |
| `TimeAxisViewModel` | Visual model calculating positions and sizes |
| `TimelineDateMapper` | Mixin providing coordinate/date conversion |
| `TimelineScroll` | Mixin handling infinite scroll behavior |
| `TimelineZoomable` | Mixin providing zoom functionality |
| `TimelineViewPresets` | Mixin managing preset switching |

---

## ViewPreset Structure

A ViewPreset defines the complete visual configuration of the timeline.

### ViewPreset Properties

```typescript
interface ViewPresetConfig {
    // Identity
    id?: string | number;
    name?: string;
    base?: string;  // Extend from existing preset

    // Time Configuration
    tickWidth?: number;         // Width of each tick in pixels (horizontal)
    tickHeight?: number;        // Height of each tick in pixels (vertical)
    defaultSpan?: number;       // Default visible span in mainUnit

    // Header Configuration
    headers?: ViewPresetHeaderRow[];
    mainHeaderLevel?: number;   // Index of "main" header (default: bottom)
    columnLinesFor?: number;    // Header level for column lines

    // Units
    mainUnit?: DurationUnit;    // Primary time unit
    shiftUnit?: DurationUnit;   // Unit for shift operations
    shiftIncrement?: number;    // Amount to shift

    // Resolution
    timeResolution?: {
        unit: DurationUnit;
        increment: number;
    };

    // Display
    displayDateFormat?: string; // Date format for tooltips
    rowHeight?: number;         // Row height in horizontal mode
}
```

### ViewPresetHeaderRow

Each header row defines one level in the timeline header:

```typescript
interface ViewPresetHeaderRow {
    unit: DurationUnit;           // Time unit for this row
    increment?: number;           // Units per cell (default: 1)
    dateFormat?: string;          // Format string for cell text
    align?: 'start' | 'center' | 'end';
    headerCellCls?: string;       // CSS class for cells
    renderer?: (data: HeaderRenderData) => string;
    cellGenerator?: () => HeaderCell[];
}

interface HeaderRenderData {
    startDate: Date;
    endDate: Date;
    headerConfig: object;
    align?: string;
    headerCellCls?: string;
    index?: number;
}
```

### Duration Units

Valid units for time configuration:

```typescript
type DurationUnit =
    | 'millisecond' | 'second' | 'minute' | 'hour'
    | 'day' | 'week' | 'month' | 'quarter' | 'year';

// Short forms also accepted:
type DurationUnitShort =
    | 'ms' | 's' | 'min' | 'h'
    | 'd' | 'w' | 'mo' | 'q' | 'y';
```

---

## TimeAxis Class

The TimeAxis is a specialized Store containing TimeSpan records (ticks).

### Key Properties

```typescript
class TimeAxis extends Store {
    // Date boundaries
    startDate: Date;              // Current start (may be filtered)
    endDate: Date;                // Current end (may be filtered)
    unfilteredStartDate: Date;    // Original configured start
    unfilteredEndDate: Date;      // Original configured end

    // Configuration
    unit: DurationUnit;           // Current tick unit
    viewPreset: ViewPreset;       // Active preset
    isContinuous: boolean;        // False when filtered
    autoAdjust: boolean;          // Auto-adjust span to unit boundaries
    continuous: boolean;          // Timeline has no gaps

    // Generated ticks
    ticks: TimeSpan[];            // Array of tick records

    // Custom tick generation
    generateTicks: (
        axisStartDate: Date,
        axisEndDate: Date,
        unit: DurationUnit,
        increment: number
    ) => TimeSpanConfig[];
}
```

### TimeSpan Structure

Each tick in the TimeAxis:

```typescript
interface TimeSpan {
    startDate: Date;
    endDate: Date;
}

interface TimeSpanConfig {
    startDate: Date;
    endDate: Date;
}
```

### Key Methods

```typescript
class TimeAxis {
    // Date queries
    dateInAxis(date: Date): boolean;
    timeSpanInAxis(start: Date, end: Date): boolean;

    // Tick/Date conversion
    getTickFromDate(date: Date): number;  // Returns tick index (fractional)
    getDateFromTick(tick: number, roundingMethod?: RoundingMethod): Date;

    // Manipulation
    setTimeSpan(newStartDate: Date, newEndDate?: Date): void;
    shift(amount: number, unit?: string): void;
    shiftNext(amount?: number): void;
    shiftPrevious(amount?: number): void;

    // Filtering
    filterBy(fn: FilterFunction, thisObj?: object): Promise<any>;
}

type RoundingMethod = 'floor' | 'round' | 'ceil';
```

---

## TimeAxisViewModel

The visual model translates the TimeAxis into pixel coordinates.

### Key Methods

```typescript
class TimeAxisViewModel {
    // Position/Date conversion
    getDateFromPosition(
        position: number,
        roundingMethod?: RoundingMethod,
        allowOutOfRange?: boolean
    ): Date;

    getPositionFromDate(date: Date): number;

    // Distance calculations
    getDistanceBetweenDates(start: Date, end: Date): number;
    getDistanceForDuration(durationMS: number): number;
}
```

---

## Tick Generation Algorithm

### Default Tick Generation

The TimeAxis generates ticks based on the ViewPreset's bottom header configuration:

```javascript
// Conceptual algorithm (not actual source)
function generateTicks(axisStartDate, axisEndDate, unit, increment) {
    const ticks = [];

    // Normalize start to unit boundary
    let tickStart = DateHelper.startOf(axisStartDate, unit);

    while (tickStart < axisEndDate) {
        const tickEnd = DateHelper.add(tickStart, increment, unit);

        ticks.push({
            startDate: tickStart,
            endDate: tickEnd
        });

        tickStart = tickEnd;
    }

    return ticks;
}
```

### Custom Tick Generation

Override `generateTicks` for custom behavior:

```javascript
const gantt = new Gantt({
    timeAxis: {
        generateTicks(axisStartDate, axisEndDate, unit, increment) {
            // Generate ticks only for working days
            const ticks = [];
            let current = DateHelper.startOf(axisStartDate, 'day');

            while (current < axisEndDate) {
                const dayOfWeek = current.getDay();

                // Skip weekends
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    ticks.push({
                        startDate: current,
                        endDate: DateHelper.add(current, 1, 'day')
                    });
                }

                current = DateHelper.add(current, 1, 'day');
            }

            return ticks;
        }
    }
});
```

### Include Configuration

Built-in filtering via `include` config:

```javascript
const gantt = new Gantt({
    timeAxis: {
        continuous: false,
        include: {
            // Only include certain hours
            hour: {
                from: 8,
                to: 18
            },
            // Only include weekdays
            day: {
                from: 1,  // Monday
                to: 5     // Friday
            }
        }
    }
});
```

---

## Header Levels Configuration

### Multiple Header Rows

Headers are configured from top to bottom:

```javascript
const preset = {
    id: 'dayAndWeek',
    name: 'Day and Week',
    tickWidth: 40,
    rowHeight: 32,

    headers: [
        // Top row: Months
        {
            unit: 'month',
            dateFormat: 'MMMM YYYY',
            align: 'center'
        },
        // Middle row: Weeks
        {
            unit: 'week',
            dateFormat: 'DD',
            renderer: ({ startDate, endDate }) => {
                return `Week ${DateHelper.getWeekNumber(startDate)[1]}`;
            }
        },
        // Bottom row: Days (this is the "main" level)
        {
            unit: 'day',
            dateFormat: 'ddd DD',
            increment: 1
        }
    ],

    // Main level is the bottom (index 2)
    mainHeaderLevel: 2,

    // Draw column lines at day boundaries
    columnLinesFor: 2
};
```

### Header Renderer Function

Custom rendering for header cells:

```javascript
const preset = {
    headers: [
        {
            unit: 'day',
            renderer({ startDate, endDate, headerConfig, index }) {
                const dayName = DateHelper.format(startDate, 'ddd');
                const dayNum = DateHelper.format(startDate, 'DD');
                const isWeekend = [0, 6].includes(startDate.getDay());

                // Can modify headerCellCls
                if (isWeekend) {
                    headerConfig.headerCellCls = 'weekend-header';
                }

                return `<span class="day-name">${dayName}</span>
                        <span class="day-num">${dayNum}</span>`;
            }
        }
    ]
};
```

### Cell Generator

For complete control over header cells:

```javascript
const preset = {
    headers: [
        {
            unit: 'custom',
            cellGenerator() {
                // Return array of cell configs
                return [
                    { start: new Date(2024, 0, 1), end: new Date(2024, 0, 8), header: 'Sprint 1' },
                    { start: new Date(2024, 0, 8), end: new Date(2024, 0, 15), header: 'Sprint 2' },
                    // ...
                ];
            }
        }
    ]
};
```

---

## Date-to-Pixel Conversion

### Algorithm Overview

The conversion from date to pixel position:

```javascript
// Conceptual algorithm
function getCoordinateFromDate(date, options = { local: true }) {
    const timeAxis = this.timeAxis;
    const tickIndex = timeAxis.getTickFromDate(date);

    if (tickIndex === -1) {
        return -1;  // Date not in axis
    }

    // Position = tick index * tick width
    const position = tickIndex * this.tickSize;

    // Adjust for scroll position if not local
    if (!options.local) {
        return position - this.scrollX + this.timeAxisSubGridElement.offsetLeft;
    }

    return position;
}
```

### getTickFromDate Implementation

```javascript
// Conceptual algorithm
function getTickFromDate(date) {
    const ticks = this.ticks;

    for (let i = 0; i < ticks.length; i++) {
        const tick = ticks[i];

        if (date >= tick.startDate && date < tick.endDate) {
            // Calculate fractional position within tick
            const tickDuration = tick.endDate - tick.startDate;
            const offset = date - tick.startDate;

            return i + (offset / tickDuration);
        }
    }

    // Date before first tick
    if (date < ticks[0].startDate) {
        const firstTick = ticks[0];
        const tickDuration = firstTick.endDate - firstTick.startDate;
        const offset = date - firstTick.startDate;
        return offset / tickDuration;
    }

    // Date after last tick
    if (date >= ticks[ticks.length - 1].endDate) {
        const lastTick = ticks[ticks.length - 1];
        const tickDuration = lastTick.endDate - lastTick.startDate;
        const offset = date - lastTick.startDate;
        return (ticks.length - 1) + (offset / tickDuration);
    }

    return -1;
}
```

### Distance Between Dates

```javascript
function getDistanceBetweenDates(startDate, endDate) {
    const startTick = this.getTickFromDate(startDate);
    const endTick = this.getTickFromDate(endDate);

    return (endTick - startTick) * this.tickSize;
}

function getDistanceForDuration(durationMS) {
    // Calculate average tick duration
    const totalDuration = this.endDate - this.startDate;
    const totalWidth = this.ticks.length * this.tickSize;

    // pixels per millisecond
    const ratio = totalWidth / totalDuration;

    return durationMS * ratio;
}
```

---

## Pixel-to-Date Conversion

### Algorithm Overview

```javascript
function getDateFromCoordinate(coordinate, roundingMethod, local, allowOutOfRange) {
    // Convert page coordinate to local if needed
    let localCoord = local ? coordinate :
        coordinate - this.timeAxisSubGridElement.getBoundingClientRect().left;

    // Add scroll offset
    localCoord += this.scrollX;

    // Calculate tick index
    const tickIndex = localCoord / this.tickSize;

    return this.timeAxis.getDateFromTick(tickIndex, roundingMethod);
}
```

### getDateFromTick Implementation

```javascript
function getDateFromTick(tick, roundingMethod = 'floor') {
    const ticks = this.ticks;
    const tickFloor = Math.floor(tick);
    const tickCeil = Math.ceil(tick);

    // Clamp to valid range
    const index = Math.max(0, Math.min(tickFloor, ticks.length - 1));
    const tickRecord = ticks[index];

    if (!tickRecord) return null;

    const tickDuration = tickRecord.endDate - tickRecord.startDate;
    const fraction = tick - index;

    // Base date within tick
    let date = new Date(tickRecord.startDate.getTime() + (fraction * tickDuration));

    // Apply rounding
    switch (roundingMethod) {
        case 'floor':
            return tickRecord.startDate;
        case 'ceil':
            return tickRecord.endDate;
        case 'round':
            // Round to nearest time resolution increment
            return this.roundDate(date);
        default:
            return date;
    }
}
```

---

## Zooming System

### Zoom Levels

Zoom levels are determined by preset order in PresetStore:

```javascript
// Level 0 = most zoomed out (year ticks)
// Level N = most zoomed in (millisecond ticks)

class TimelineZoomableClass {
    minZoomLevel: number;   // Default: 0
    maxZoomLevel: number;   // Default: presets.count - 1
    zoomLevel: number;      // Current level

    visibleZoomFactor: number;  // Width multiplier during zoom
    zoomKeepsOriginalTimespan: boolean;
    zoomOnMouseWheel: boolean;
    zoomOnTimeAxisDoubleClick: boolean;
}
```

### Zoom Methods

```typescript
class TimelineZoomableClass {
    // Zoom in/out by levels
    zoomIn(levels?: number, options?: ChangePresetOptions): number | null;
    zoomOut(levels?: number, options?: ChangePresetOptions): number | null;

    // Zoom to extremes
    zoomInFull(options?: ChangePresetOptions): number | null;
    zoomOutFull(options?: ChangePresetOptions): number | null;

    // Zoom to specific level
    zoomToLevel(preset: number, options?: ChangePresetOptions): number | null;

    // Zoom to fit content
    zoomToFit(options?: ZoomToFitOptions): void;

    // Zoom to specific date range
    zoomToSpan(config: ZoomToSpanConfig): number | null;

    // Zoom with full control
    zoomTo(config: ZoomToConfig): void;
}

interface ChangePresetOptions {
    startDate?: Date;
    endDate?: Date;
    centerDate?: Date;
}

interface ZoomToFitOptions {
    leftMargin?: number;
    rightMargin?: number;
}

interface ZoomToSpanConfig {
    startDate: Date;
    endDate: Date;
    centerDate?: Date;
    leftMargin?: number;
    rightMargin?: number;
    adjustStart?: number;
    adjustEnd?: number;
}

interface ZoomToConfig {
    preset?: string;
    level?: number;
    visibleDate?: VisibleDate;
    startDate?: Date;
    endDate?: Date;
    centerDate?: Date;
    zoomDate?: Date;
    zoomPosition?: number;
    width?: number;
    leftMargin?: number;
    rightMargin?: number;
    adjustStart?: number;
    adjustEnd?: number;
}
```

### Zoom Algorithm

```javascript
// Conceptual algorithm for zoomToSpan
function zoomToSpan({ startDate, endDate, leftMargin = 0, rightMargin = 0 }) {
    const availableWidth = this.timeAxisSubGridElement.clientWidth - leftMargin - rightMargin;
    const duration = endDate - startDate;

    // Find best preset that fits the span
    let bestPreset = null;
    let bestTickWidth = 0;

    for (const preset of this.presets) {
        // Calculate how many ticks would fit
        const tickDuration = DateHelper.asMilliseconds(1, preset.bottomHeader.unit);
        const tickCount = duration / tickDuration;
        const requiredWidth = tickCount * preset.tickWidth;

        if (requiredWidth <= availableWidth) {
            // This preset fits - check if it's better than current best
            if (preset.tickWidth > bestTickWidth) {
                bestPreset = preset;
                bestTickWidth = preset.tickWidth;
            }
        }
    }

    if (bestPreset) {
        this.viewPreset = bestPreset;
        this.setTimeSpan(startDate, endDate);
    }

    return this.zoomLevel;
}
```

### Zoom Events

```javascript
gantt.on({
    beforePresetChange({ startDate, endDate, from, to }) {
        console.log(`Changing from ${from.name} to ${to.name}`);
        // Return false to cancel
    },

    presetChange({ startDate, centerDate, endDate, from, to }) {
        console.log(`Changed to ${to.name}`);
    }
});
```

---

## Infinite Scrolling

### Configuration

```typescript
interface InfiniteScrollConfig {
    infiniteScroll: boolean;     // Enable infinite scrolling
    bufferCoef: number;          // Buffer size multiplier (default: 5)
    bufferThreshold: number;     // Trigger threshold (default: 0.2)
}
```

### Buffer Calculation

```javascript
// The rendered timespan extends beyond visible area:
//
//    |<-- buffer -->|<-- visible -->|<-- buffer -->|
//    |    coef=5    |               |    coef=5    |
//
// Total width = visible * (1 + 2 * bufferCoef)

const visibleWidth = this.timeAxisSubGridElement.clientWidth;
const bufferWidth = visibleWidth * this.bufferCoef;
const totalWidth = visibleWidth + (2 * bufferWidth);

// Threshold determines when to shift:
// When scrolled past (bufferWidth * bufferThreshold), regenerate ticks
const shiftThreshold = bufferWidth * this.bufferThreshold;
```

### Shift Trigger

```javascript
// Conceptual scroll handler
function onScroll(scrollLeft) {
    const bufferWidth = this.visibleWidth * this.bufferCoef;
    const threshold = bufferWidth * this.bufferThreshold;

    // Check left edge
    if (scrollLeft < threshold) {
        // Extend timeline to the past
        this.shiftPrevious();
    }

    // Check right edge
    const rightEdge = this.totalWidth - scrollLeft - this.visibleWidth;
    if (rightEdge < threshold) {
        // Extend timeline to the future
        this.shiftNext();
    }
}
```

### Time Span Extension

```javascript
function shiftNext(amount = 1) {
    const shiftUnit = this.viewPreset.shiftUnit;
    const shiftIncrement = this.viewPreset.shiftIncrement * amount;

    const newEnd = DateHelper.add(this.endDate, shiftIncrement, shiftUnit);
    const newStart = DateHelper.add(this.startDate, shiftIncrement, shiftUnit);

    this.setTimeSpan(newStart, newEnd);
}

function shiftPrevious(amount = 1) {
    const shiftUnit = this.viewPreset.shiftUnit;
    const shiftIncrement = this.viewPreset.shiftIncrement * amount;

    const newStart = DateHelper.add(this.startDate, -shiftIncrement, shiftUnit);
    const newEnd = DateHelper.add(this.endDate, -shiftIncrement, shiftUnit);

    this.setTimeSpan(newStart, newEnd);
}
```

---

## Time Resolution and Snapping

### Time Resolution

Controls minimum duration for created/resized tasks:

```javascript
const gantt = new Gantt({
    timeResolution: {
        unit: 'minute',
        increment: 15  // Snap to 15-minute intervals
    }
});

// Or via preset
const preset = {
    timeResolution: {
        unit: 'hour',
        increment: 1
    }
};
```

### Snapping

```javascript
const gantt = new Gantt({
    snap: true,  // Enable snapping

    // Optional: snap relative to event start
    snapRelativeToEventStartDate: false
});
```

### Snap Calculation

```javascript
// When snap is enabled and dragging/resizing:
function snapDate(date) {
    const resolution = this.timeResolution;

    // Round to nearest increment
    return DateHelper.round(date, {
        unit: resolution.unit,
        increment: resolution.increment
    });
}
```

---

## DateHelper Utilities

### Core Date Operations

```typescript
class DateHelper {
    // Add time to date (always clones)
    static add(date: Date, amount: number, unit: DurationUnit): Date;

    // Calculate difference
    static diff(start: Date, end: Date, unit: DurationUnit, fractional?: boolean): number;

    // Compare dates
    static compare(first: Date, second: Date, unit?: DurationUnit): number;
    static isEqual(first: Date, second: Date, unit?: DurationUnit): boolean;
    static isBefore(first: Date, second: Date): boolean;
    static isAfter(first: Date, second: Date): boolean;

    // Boundary operations
    static startOf(date: Date, unit: DurationUnit, clone?: boolean): Date;
    static endOf(date: Date): Date;
    static clearTime(date: Date, clone?: boolean): Date;

    // Rounding
    static floor(time: Date, increment: string | number | object, base?: Date): Date;
    static ceil(time: Date, increment: string | number | object, base?: Date): Date;
    static round(time: Date, increment: string | number | object, base?: Date): Date;

    // Formatting
    static format(date: Date, format?: string): string;
    static parse(dateString: string, format?: string): Date;

    // Unit operations
    static normalizeUnit(unit: DurationUnit): string;
    static compareUnits(unit1: DurationUnit, unit2: DurationUnit): number;
    static asMilliseconds(amount: number, unit: DurationUnit): number;
    static as(toUnit: DurationUnit, amount: number, fromUnit: DurationUnit): number;

    // Range operations
    static betweenLesser(date: Date, start: Date, end: Date): boolean;
    static betweenLesserEqual(date: Date, start: Date, end: Date): boolean;
    static intersectSpans(s1: Date, e1: Date, s2: Date, e2: Date): boolean;
    static timeSpanContains(s1: Date, e1: Date, s2: Date, e2: Date): boolean;

    // Utility
    static clone(date: Date): Date;
    static min(first: Date, second: Date): Date;
    static max(first: Date, second: Date): Date;
    static constrain(date: Date, min?: Date, max?: Date): Date;
    static clamp(date: Date, min: Date, max: Date): Date;

    // Week/Month helpers
    static getWeekNumber(date: Date, weekStartDay?: number): [number, number];
    static daysInMonth(date: Date): number;
    static getFirstDateOfMonth(date: Date): Date;
    static getLastDateOfMonth(date: Date): Date;

    // Localization
    static weekStartDay: number;  // 0-6 (Sunday-Saturday)
    static nonWorkingDays: Record<number, boolean>;
}
```

### Format Tokens

Common date format tokens:

| Token | Output | Example |
|-------|--------|---------|
| YYYY | 4-digit year | 2024 |
| YY | 2-digit year | 24 |
| MMMM | Full month name | January |
| MMM | Abbreviated month | Jan |
| MM | Month with zero | 01 |
| M | Month | 1 |
| DD | Day with zero | 05 |
| D | Day | 5 |
| dddd | Full day name | Monday |
| ddd | Abbreviated day | Mon |
| HH | 24-hour with zero | 09 |
| H | 24-hour | 9 |
| hh | 12-hour with zero | 09 |
| h | 12-hour | 9 |
| mm | Minutes with zero | 05 |
| m | Minutes | 5 |
| ss | Seconds with zero | 05 |
| s | Seconds | 5 |
| A | AM/PM | AM |
| a | am/pm | am |

---

## Built-in Presets

PresetManager includes these default presets (from most zoomed out to most zoomed in):

```javascript
// Approximate list of built-in presets (check PresetManager for exact definitions)
const builtInPresets = [
    'manyYears',           // Years view (very zoomed out)
    'year',                // Year with quarters
    'yearAndMonth',        // Year with months
    'monthAndYear',        // Months with year header
    'weekAndDayLetter',    // Weeks with single-letter days
    'weekAndDay',          // Weeks with days
    'weekAndMonth',        // Weeks with month header
    'weekDateAndMonth',    // Week dates with month
    'dayAndWeek',          // Days with week header
    'day',                 // Days only
    'dayAndMonth',         // Days with month header
    'hourAndDay',          // Hours with day header
    'minuteAndHour',       // Minutes with hour header
    'secondAndMinute',     // Seconds with minute header
    'millisecond'          // Milliseconds (most zoomed in)
];
```

### Accessing Built-in Presets

```javascript
import { PresetManager } from '@bryntum/gantt';

// Get all presets
const allPresets = PresetManager.records;

// Get specific preset
const preset = PresetManager.getById('hourAndDay');

// Normalize preset (apply customizations)
const customized = PresetManager.normalizePreset({
    base: 'hourAndDay',
    tickWidth: 60
});
```

---

## Custom Preset Creation

### Registering Globally

```javascript
import { PresetManager } from '@bryntum/gantt';

PresetManager.registerPreset('myCustomPreset', {
    name: 'My Custom View',
    tickWidth: 100,
    rowHeight: 40,

    shiftUnit: 'week',
    shiftIncrement: 1,

    timeResolution: {
        unit: 'hour',
        increment: 1
    },

    headers: [
        {
            unit: 'month',
            dateFormat: 'MMMM YYYY'
        },
        {
            unit: 'week',
            renderer({ startDate }) {
                return `Week ${DateHelper.getWeekNumber(startDate)[1]}`;
            }
        },
        {
            unit: 'day',
            dateFormat: 'ddd D'
        }
    ],

    columnLinesFor: 2,  // Draw lines at day level
    mainHeaderLevel: 2  // Days are the main level
});

// Use in Gantt
const gantt = new Gantt({
    viewPreset: 'myCustomPreset'
});
```

### Instance-Level Presets

```javascript
const gantt = new Gantt({
    presets: [
        // Custom presets for this instance only
        {
            id: 'customDayView',
            base: 'dayAndWeek',
            tickWidth: 80,
            headers: [
                { unit: 'month', dateFormat: 'MMM YYYY' },
                { unit: 'day', dateFormat: 'D' }
            ]
        },
        {
            id: 'customHourView',
            tickWidth: 40,
            headers: [
                { unit: 'day', dateFormat: 'ddd MMM D' },
                { unit: 'hour', dateFormat: 'HH:mm' }
            ]
        }
    ],

    viewPreset: 'customDayView'
});
```

### Extending Existing Presets

```javascript
const gantt = new Gantt({
    viewPreset: {
        base: 'weekAndDay',

        // Override specific properties
        tickWidth: 50,
        rowHeight: 36,

        // Customize time resolution
        timeResolution: {
            unit: 'hour',
            increment: 4
        },

        // Modify header rendering
        headers: [
            {
                unit: 'month',
                dateFormat: 'MMMM YYYY',
                align: 'start'
            },
            {
                unit: 'week',
                renderer({ startDate, endDate }) {
                    const weekNum = DateHelper.getWeekNumber(startDate)[1];
                    const startDay = DateHelper.format(startDate, 'MMM D');
                    const endDay = DateHelper.format(
                        DateHelper.add(endDate, -1, 'day'),
                        'MMM D'
                    );
                    return `W${weekNum}: ${startDay} - ${endDay}`;
                }
            },
            {
                unit: 'day',
                dateFormat: 'dd',  // Two-letter day
                renderer({ startDate, headerConfig }) {
                    const isWeekend = [0, 6].includes(startDate.getDay());
                    if (isWeekend) {
                        headerConfig.headerCellCls = 'weekend';
                    }
                    return DateHelper.format(startDate, 'dd');
                }
            }
        ]
    }
});
```

### Responsive Tick Sizing

```javascript
const gantt = new Gantt({
    // Listen to resize
    listeners: {
        resize() {
            const width = this.timeAxisSubGridElement.clientWidth;

            // Adjust tick width based on available space
            if (width < 800) {
                this.tickSize = 30;
            } else if (width < 1200) {
                this.tickSize = 50;
            } else {
                this.tickSize = 70;
            }
        }
    },

    // Or use suppressFit to prevent auto-calculation
    suppressFit: false  // Allow auto-fitting tick size
});
```

---

## Summary

The Bryntum time axis system provides:

1. **ViewPresets** - Define timeline granularity, headers, and time units
2. **TimeAxis** - Store of time ticks with filtering and navigation
3. **TimeAxisViewModel** - Visual representation with coordinate mapping
4. **DateHelper** - Comprehensive date math utilities
5. **Zooming** - Multi-level zoom with various targeting options
6. **Infinite Scroll** - Dynamic timeline extension on demand
7. **Snapping** - Time resolution enforcement for precise scheduling

The system is highly customizable through:
- Custom preset creation and registration
- Custom tick generation functions
- Header renderers and cell generators
- Include/exclude filters for working time
- Event-driven hooks for all major operations
