# SchedulerPro Deep Dive: Display Modes & Event Layout

## Overview

SchedulerPro supports two primary display modes and multiple event layout strategies:
- **Horizontal Mode**: Resources as rows, time as columns (default)
- **Vertical Mode**: Time as rows, resources as columns
- **Event Layout**: stack, pack, mixed, none

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Display Mode System                           │
├─────────────────────────────────────────────────────────────────┤
│  Mode Configuration                                              │
│  ├── horizontal - Resources vertical, time horizontal           │
│  └── vertical - Time vertical, resources horizontal             │
├─────────────────────────────────────────────────────────────────┤
│  Event Layout Strategies                                         │
│  ├── stack - Events in vertical bands                           │
│  ├── pack - Compact event positioning                           │
│  ├── mixed - Combination of pack/stack                          │
│  └── none - No overlap handling                                 │
├─────────────────────────────────────────────────────────────────┤
│  Rendering Pipeline                                              │
│  ├── Resource dimensions                                         │
│  ├── Event bar positioning                                       │
│  └── Layout engine calculations                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Display Modes

### Horizontal Mode (Default)

Resources displayed as rows, time flows left to right:

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    // Explicitly set horizontal mode (default)
    mode: 'horizontal',

    // Row configuration
    rowHeight: 50,
    barMargin: 5,

    // Time axis
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31),
    viewPreset: 'dayAndWeek',

    columns: [
        { type: 'resourceInfo', text: 'Resource', width: 150 }
    ]
});
```

### Vertical Mode

Time displayed as rows, resources as columns:

```javascript
const scheduler = new SchedulerPro({
    appendTo: 'container',

    // Enable vertical mode
    mode: 'vertical',

    // Resource column width
    resourceWidth: 100,

    // Time axis configuration
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 8),

    // Different preset for vertical
    viewPreset: 'hourAndDay',

    // Resources displayed as columns
    resources: [
        { id: 1, name: 'Room A' },
        { id: 2, name: 'Room B' },
        { id: 3, name: 'Room C' }
    ]
});
```

### Mode-Specific Configuration

```javascript
// Horizontal mode specific
const horizontal = new SchedulerPro({
    mode: 'horizontal',
    rowHeight: 60,                  // Height per resource row
    barMargin: 5,                   // Margin between stacked events
    resourceMargin: 10              // Margin in resource cells
});

// Vertical mode specific
const vertical = new SchedulerPro({
    mode: 'vertical',
    resourceWidth: 120,             // Width per resource column
    tickHeight: 50,                 // Height per time tick
    resourceMargin: {
        start: 5,                   // Margin left
        end: 5                      // Margin right
    }
});
```

## Event Layout Types

### Stack Layout

Events are stacked vertically (horizontal mode) or horizontally (vertical mode):

```javascript
const scheduler = new SchedulerPro({
    // Stack overlapping events
    eventLayout: 'stack',

    // Fixed event height for stacking
    eventHeight: 30,    // In horizontal mode
    eventWidth: 80,     // In vertical mode

    // Margin between stacked events
    barMargin: 3
});
```

**Visual representation (horizontal mode):**
```
Resource 1:  |====Event 1====|
             |====Event 2====|
             |====Event 3====|
```

### Pack Layout

Events are packed to use minimum vertical (or horizontal) space:

```javascript
const scheduler = new SchedulerPro({
    // Pack events efficiently
    eventLayout: 'pack',

    // Events sized based on row height
    rowHeight: 80
});
```

**Visual representation:**
```
Resource 1:  |==Event 1==| |==Event 3==|
                 |====Event 2====|
```

### Mixed Layout

Combination of pack and stack behaviors:

```javascript
const scheduler = new SchedulerPro({
    // Available in vertical mode only
    mode: 'vertical',
    eventLayout: 'mixed'
});
```

### None Layout

No overlap handling - events can overlap:

```javascript
const scheduler = new SchedulerPro({
    // No layout adjustment for overlaps
    eventLayout: 'none',

    // Events may visually overlap
    allowOverlap: true
});
```

## Resource-Level Layout

Override layout per resource:

```javascript
// Resources with individual layout
const resources = [
    {
        id: 1,
        name: 'Conference Room',
        eventLayout: 'stack'    // Stack events for this resource
    },
    {
        id: 2,
        name: 'Equipment',
        eventLayout: 'pack'     // Pack events for this resource
    },
    {
        id: 3,
        name: 'Staff',
        eventLayout: 'none',    // No layout for this resource
        rowHeight: 40           // Custom row height
    }
];

const scheduler = new SchedulerPro({
    resourceStore: { data: resources }
});
```

## Advanced Event Layout

### Custom Event Positioning

```javascript
const scheduler = new SchedulerPro({
    eventLayout: {
        type: 'stack',

        // Custom positioning function (horizontal mode)
        positionEventFn({ eventRecord, resourceRecord, events }) {
            // Calculate custom position
            const index = events.indexOf(eventRecord);
            return {
                top: index * 25,
                height: 20
            };
        }
    }
});
```

### Event Grouping

Group events within a row:

```javascript
const scheduler = new SchedulerPro({
    eventLayout: {
        type: 'stack',

        // Group events by field
        groupBy: 'category',

        // Optional group order
        groupOrder: ['high', 'medium', 'low']
    }
});
```

## Row Height Management

### Fixed vs Variable Height

```javascript
// Fixed row height (better performance)
const scheduler = new SchedulerPro({
    fixedRowHeight: true,
    rowHeight: 50
});

// Variable row height (accommodates content)
const scheduler = new SchedulerPro({
    fixedRowHeight: false,

    // Calculate based on events
    getRowHeight({ record }) {
        const eventCount = scheduler.eventStore.getEventsForResource(record).length;
        return Math.max(50, eventCount * 30);
    }
});
```

### Dynamic Row Height

```javascript
const scheduler = new SchedulerPro({
    // Adjust row height based on content
    getRowHeight({ record }) {
        const events = scheduler.eventStore.getEventsForResource(record);

        // Get maximum stack depth for this row
        let maxDepth = 1;
        // ... calculate overlap depth

        return 30 + (maxDepth * 25);
    }
});
```

## Event Sizing

### Horizontal Mode

```javascript
const scheduler = new SchedulerPro({
    mode: 'horizontal',

    // Event bar sizing
    barMargin: 5,          // Margin between stacked events
    eventHeight: 30,       // Fixed height when using stack layout

    // Full row height events
    eventLayout: 'none',
    eventHeight: null,     // Uses row height minus margins

    // Resource-level margin
    resourceMargin: {
        start: 10,         // Top margin
        end: 10            // Bottom margin
    }
});
```

### Vertical Mode

```javascript
const scheduler = new SchedulerPro({
    mode: 'vertical',

    // Resource column sizing
    resourceWidth: 120,

    // Event bar sizing
    eventWidth: 80,        // Fixed width when using stack layout

    // Resource-level margin
    resourceMargin: {
        start: 5,          // Left margin
        end: 5             // Right margin
    }
});
```

## Event Renderer Adaptation

Adapt rendering based on mode:

```javascript
const scheduler = new SchedulerPro({
    eventRenderer({ eventRecord, renderData }) {
        const isVertical = scheduler.mode === 'vertical';

        if (isVertical) {
            // Vertical mode: adjust for narrower events
            return {
                className: 'vertical-event',
                children: [
                    {
                        className: 'event-time',
                        text: DateHelper.format(eventRecord.startDate, 'HH:mm')
                    },
                    {
                        className: 'event-name',
                        text: eventRecord.name.substring(0, 10)
                    }
                ]
            };
        } else {
            // Horizontal mode: more space for content
            return {
                className: 'horizontal-event',
                children: [
                    {
                        className: 'event-icon',
                        tag: 'i',
                        className: eventRecord.iconCls
                    },
                    {
                        className: 'event-text',
                        text: eventRecord.name
                    }
                ]
            };
        }
    }
});
```

## Switching Modes Dynamically

```javascript
const scheduler = new SchedulerPro({
    mode: 'horizontal',

    tbar: [
        {
            type: 'buttongroup',
            toggleGroup: true,
            items: [
                {
                    text: 'Horizontal',
                    pressed: true,
                    onClick() {
                        scheduler.mode = 'horizontal';
                    }
                },
                {
                    text: 'Vertical',
                    onClick() {
                        scheduler.mode = 'vertical';
                    }
                }
            ]
        }
    ]
});

// Listen for mode change
scheduler.on('modeChange', ({ mode }) => {
    console.log(`Switched to ${mode} mode`);

    // Adjust settings for new mode
    if (mode === 'vertical') {
        scheduler.viewPreset = 'hourAndDay';
    } else {
        scheduler.viewPreset = 'dayAndWeek';
    }
});
```

## Complete Example

```javascript
import { SchedulerPro, DateHelper } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    // Start in horizontal mode
    mode: 'horizontal',

    // Default event layout
    eventLayout: 'stack',

    // Sizing
    rowHeight: 60,
    barMargin: 3,
    resourceMargin: { start: 5, end: 5 },

    // Time range
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 15),
    viewPreset: 'dayAndWeek',

    columns: [
        {
            type: 'resourceInfo',
            text: 'Resource',
            width: 150
        }
    ],

    // Resources with mixed layouts
    resources: [
        { id: 1, name: 'Conference Room A', eventLayout: 'stack' },
        { id: 2, name: 'Conference Room B', eventLayout: 'pack' },
        { id: 3, name: 'Equipment Pool', eventLayout: 'none' }
    ],

    events: [
        { id: 1, resourceId: 1, name: 'Meeting 1', startDate: '2024-01-02', duration: 2 },
        { id: 2, resourceId: 1, name: 'Meeting 2', startDate: '2024-01-02', duration: 3 },
        { id: 3, resourceId: 2, name: 'Workshop', startDate: '2024-01-03', duration: 5 }
    ],

    // Adapt renderer to mode
    eventRenderer({ eventRecord, renderData }) {
        const isVertical = scheduler.mode === 'vertical';

        return {
            className: {
                'compact-event': isVertical,
                'full-event': !isVertical
            },
            children: [
                {
                    className: 'event-content',
                    text: isVertical ?
                        DateHelper.format(eventRecord.startDate, 'HH:mm') :
                        eventRecord.name
                }
            ]
        };
    },

    tbar: [
        // Mode switcher
        {
            type: 'buttongroup',
            toggleGroup: true,
            items: [
                {
                    ref: 'horizontalBtn',
                    text: 'Horizontal',
                    icon: 'b-icon b-icon-rows',
                    pressed: true,
                    onClick: () => scheduler.mode = 'horizontal'
                },
                {
                    ref: 'verticalBtn',
                    text: 'Vertical',
                    icon: 'b-icon b-icon-columns',
                    onClick: () => scheduler.mode = 'vertical'
                }
            ]
        },
        '|',
        // Layout switcher
        {
            type: 'combo',
            label: 'Layout',
            width: 150,
            items: ['stack', 'pack', 'none'],
            value: 'stack',
            onChange({ value }) {
                scheduler.eventLayout = value;
            }
        }
    ],

    listeners: {
        // Update presets on mode change
        modeChange({ mode }) {
            if (mode === 'vertical') {
                scheduler.viewPreset = 'hourAndDay';
            } else {
                scheduler.viewPreset = 'dayAndWeek';
            }
        }
    }
});
```

## CSS for Modes

```css
/* Horizontal mode styling */
.b-scheduler.b-horizontal .b-sch-event {
    min-height: 24px;
    padding: 4px 8px;
}

/* Vertical mode styling */
.b-scheduler.b-vertical .b-sch-event {
    min-width: 60px;
    padding: 2px 4px;
    font-size: 11px;
}

/* Compact event for vertical mode */
.compact-event {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Full event for horizontal mode */
.full-event {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* Stack layout adjustments */
.b-eventlayout-stack .b-sch-event {
    transition: top 0.2s ease;
}

/* Pack layout adjustments */
.b-eventlayout-pack .b-sch-event {
    box-shadow: 1px 1px 3px rgba(0,0,0,0.2);
}

/* No layout - overlapping events */
.b-eventlayout-none .b-sch-event {
    opacity: 0.9;
}

.b-eventlayout-none .b-sch-event:hover {
    opacity: 1;
    z-index: 10;
}
```

## Best Practices

1. **Choose Mode Based on Use Case**:
   - Horizontal: Many resources, fewer time slots visible
   - Vertical: Few resources, detailed time view

2. **Event Layout Selection**:
   - Stack: Clear visualization of all events
   - Pack: Space-efficient for many overlapping events
   - None: When overlaps are meaningful or rare

3. **Performance**:
   - Use `fixedRowHeight: true` when possible
   - Limit visible resources in vertical mode
   - Consider virtualization for large datasets

4. **Responsive Design**:
   - Switch modes based on viewport width
   - Adjust row/column sizes for different screens

## API Reference Links

- [Scheduler mode](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/Scheduler#config-mode)
- [eventLayout](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/mixin/SchedulerEventRendering#config-eventLayout)
- [ResourceModel eventLayout](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/model/ResourceModel#field-eventLayout)
- [rowHeight](https://bryntum.com/products/schedulerpro/docs/api/Grid/view/Grid#config-rowHeight)
- [resourceWidth](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/Scheduler#config-resourceWidth)
