# SchedulerPro Internals: Rendering Pipeline

## Overview

SchedulerPro uses a sophisticated virtual rendering system based on:
- **DomSync**: Efficient DOM diffing and patching (virtual DOM-like)
- **DomConfig**: Declarative DOM structure definitions
- **Virtual Rendering**: Only visible rows/events are rendered
- **Event Layout Engine**: Automatic positioning of overlapping events

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Rendering Pipeline                           │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ├── EventStore → Event records                                │
│  ├── ResourceStore → Resource rows                              │
│  └── AssignmentStore → Event-Resource links                    │
├─────────────────────────────────────────────────────────────────┤
│  Layout Layer                                                   │
│  ├── RowManager → Virtual row rendering                         │
│  ├── Event Layout Engine → Overlap resolution                   │
│  └── TimeAxis → Time-to-pixel mapping                          │
├─────────────────────────────────────────────────────────────────┤
│  Rendering Layer                                                │
│  ├── eventRenderer → Generate event content                     │
│  ├── DomConfig → Declarative DOM structure                      │
│  └── DomSync → Efficient DOM updates                           │
├─────────────────────────────────────────────────────────────────┤
│  DOM Layer                                                      │
│  ├── Row elements                                               │
│  ├── Event elements                                             │
│  └── Feature overlays (dependencies, time ranges, etc.)        │
└─────────────────────────────────────────────────────────────────┘
```

## DomConfig System

The `DomConfig` object defines DOM structure declaratively:

```typescript
interface DomConfig {
    // Element basics
    tag?: string;              // HTML tag (default: 'div')
    id?: string;               // Element id
    className?: string | DomClassList;
    class?: string | DomClassList;  // Alias for className

    // Content
    text?: string;             // Text content (auto-escaped)
    html?: string;             // Raw HTML content
    children?: DomConfig[];    // Child elements

    // Attributes
    style?: string | Record<string, string>;
    dataset?: Record<string, any>;  // data-* attributes
    [attribute: string]: any;  // Any HTML attribute

    // Syncing
    syncId?: string | number;  // Stable ID for DomSync
    ns?: string;               // XML namespace (for SVG)

    // Event handlers
    onClick?: Function;
    onMouseenter?: Function;
    // ... any event handler
}
```

### DomConfig Examples

```javascript
// Simple element
const simple = {
    tag: 'div',
    className: 'my-class',
    text: 'Hello World'
};

// Complex structure
const complex = {
    className: 'event-content',
    children: [
        {
            tag: 'i',
            className: 'b-fa b-fa-calendar'
        },
        {
            tag: 'span',
            className: 'event-title',
            text: eventRecord.name
        },
        {
            tag: 'div',
            className: 'event-times',
            children: [
                { tag: 'span', text: '9:00 AM' },
                { tag: 'span', className: 'separator', text: '-' },
                { tag: 'span', text: '10:30 AM' }
            ]
        }
    ]
};

// With data attributes
const withData = {
    className: 'task-item',
    dataset: {
        taskId: 123,
        status: 'active'
    },
    text: 'Task Name'
};
```

## DomSync

The `DomSync` class performs efficient DOM updates by comparing new DomConfig with previous state:

```typescript
class DomSync {
    /**
     * Sync a DOM config to a target element.
     * Only applies changes, doesn't recreate unchanged elements.
     */
    static sync(options: {
        domConfig: DomConfig;
        targetElement: HTMLElement;
        strict?: boolean;           // Strict mode removes unmanaged children
        syncIdField?: string;       // Field name for sync IDs
        syncOwner?: string;         // Owner identifier
        affected?: string[];        // Track affected elements
        callback?: Function;        // Post-sync callback
        configEquality?: boolean;   // Use config equality check
    }): HTMLElement;

    /**
     * Get child element by sync path.
     * @param path - Dot-separated path of syncId values
     */
    static getChild(element: HTMLElement, path: string): HTMLElement;

    /**
     * Add child without syncing (for drag-drop).
     */
    static addChild(
        parentElement: HTMLElement,
        childElement: HTMLElement,
        syncId: string | number
    ): void;

    /**
     * Remove child without syncing.
     */
    static removeChild(
        parentElement: HTMLElement,
        childElement: HTMLElement
    ): void;
}
```

### DomSync Usage

```javascript
// Initial render
DomSync.sync({
    domConfig: {
        className: 'event-bar',
        syncId: 'event-1',
        children: [
            { syncId: 'icon', tag: 'i', className: 'b-fa b-fa-task' },
            { syncId: 'text', tag: 'span', text: 'Task Name' }
        ]
    },
    targetElement: eventElement
});

// Update - only 'text' span is updated
DomSync.sync({
    domConfig: {
        className: 'event-bar',
        syncId: 'event-1',
        children: [
            { syncId: 'icon', tag: 'i', className: 'b-fa b-fa-task' },
            { syncId: 'text', tag: 'span', text: 'Updated Name' }  // Only this changes
        ]
    },
    targetElement: eventElement
});

// Get child element
const textElement = DomSync.getChild(eventElement, 'event-1.text');
```

## EventRenderData

Data passed to the `eventRenderer` function:

```typescript
interface EventRenderData {
    // Model references
    eventRecord: EventModel;
    resourceRecord: ResourceModel;
    assignmentRecord: AssignmentModel;

    // Calculated positions (pixels)
    left: number;           // Horizontal offset
    top: number;            // Vertical offset within row
    width: number;          // Event width
    height: number;         // Event height

    // Time values (milliseconds)
    startMS: number;        // Start date as timestamp
    endMS: number;          // End date as timestamp

    // Styling
    cls: DomClassList;           // Event bar CSS classes
    wrapperCls: DomClassList;    // Wrapper element CSS classes
    iconCls: DomClassList;       // Icon CSS classes
    style: string | object;      // Inline styles
    wrapperStyle: string | object;
    eventStyle: EventStyleType;  // Visual style preset
    eventColor: string;          // Color value

    // Content
    children: DomConfig[];       // Additional child elements
    ariaLabel: string;           // Accessibility label
}
```

## Event Renderer

The `eventRenderer` function generates event content:

```javascript
const scheduler = new SchedulerPro({
    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        // Return string (simple)
        return eventRecord.name;

        // Return DomConfig (preferred)
        return {
            className: 'custom-event',
            children: [
                {
                    tag: 'i',
                    className: `b-fa ${eventRecord.iconCls}`
                },
                {
                    tag: 'span',
                    text: eventRecord.name
                }
            ]
        };

        // Return array of DomConfigs
        return [
            { tag: 'div', className: 'title', text: eventRecord.name },
            { tag: 'div', className: 'subtitle', text: eventRecord.description }
        ];
    }
});
```

### Modifying RenderData

```javascript
eventRenderer({ eventRecord, renderData }) {
    // Modify CSS classes
    renderData.cls.add('custom-class');
    renderData.cls['high-priority'] = eventRecord.priority === 'high';

    // Modify wrapper
    renderData.wrapperCls.add('special-wrapper');

    // Add inline styles
    renderData.style = {
        opacity: eventRecord.confirmed ? 1 : 0.6,
        borderLeftColor: eventRecord.categoryColor
    };

    // Set event color programmatically
    renderData.eventColor = eventRecord.isOverdue ? 'red' : 'green';

    // Change event style
    renderData.eventStyle = 'filled';

    // Add child elements
    renderData.children.push({
        className: 'progress-indicator',
        style: `width: ${eventRecord.percentDone}%`
    });

    // Disable default icon
    renderData.iconCls = null;

    return eventRecord.name;
}
```

## Event Layout Engine

Handles positioning of overlapping events within a row:

```typescript
type EventLayoutMode = 'stack' | 'pack' | 'mixed' | 'none';

interface EventLayoutConfig {
    type?: EventLayoutMode;
    // Additional layout options
}
```

### Layout Modes

```javascript
// Stack: Events arranged in fixed rows
eventLayout: 'stack'
// - Fixed height per event
// - Stacks vertically when overlapping
// - Row height grows to fit all stacked events

// Pack: Events fill available space
eventLayout: 'pack'
// - Events share available height
// - Better space utilization
// - Overlapping events get equal share of height

// Mixed: Combination of stack and pack
eventLayout: 'mixed'
// - First overlapping event is full height
// - Additional events are packed

// None: Events overlap freely
eventLayout: 'none'
// - All events render at same position
// - No automatic stacking
// - Useful for transparent/layered events
```

### Layout Configuration

```javascript
const scheduler = new SchedulerPro({
    eventLayout: {
        type: 'stack'
    },

    // Or per-resource
    resourceStore: {
        data: [
            { id: 1, name: 'Resource 1', eventLayout: 'pack' },
            { id: 2, name: 'Resource 2', eventLayout: 'stack' }
        ]
    }
});
```

### Overlapping Event Sorting

```javascript
const scheduler = new SchedulerPro({
    // Custom sort for overlapping events
    overlappingEventSorter(a, b) {
        // Sort by priority first
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff =
            (priorityOrder[a.priority] || 1) -
            (priorityOrder[b.priority] || 1);

        if (priorityDiff !== 0) return priorityDiff;

        // Then by start date
        return a.startDate - b.startDate;
    }
});
```

## Row Height Calculation

```javascript
const scheduler = new SchedulerPro({
    // Fixed row height (all rows)
    rowHeight: 50,

    // Or dynamic based on events
    getRowHeight({ record }) {
        const events = scheduler.eventStore.getEventsForResource(record);
        const overlapping = calculateMaxOverlap(events);
        return 30 + (overlapping * 25);  // Base + per-event
    },

    // Fixed row height optimization
    fixedRowHeight: true  // Slightly better performance
});
```

## Rendering Events

### Render Event Lifecycle

```javascript
listeners: {
    // Before event is rendered
    beforeEventRender({ eventRecord, renderData }) {
        // Modify renderData before rendering
        if (eventRecord.isHighPriority) {
            renderData.cls.add('priority-indicator');
        }
    },

    // After event is rendered to DOM
    renderEvent({
        eventRecord,
        resourceRecord,
        element,
        isRepaint,
        isReusingElement
    }) {
        // Access the rendered DOM element
        if (!isReusingElement) {
            // First-time render
            element.addEventListener('customEvent', handler);
        }

        // Update third-party components
        updateChart(element, eventRecord);
    },

    // Event element is being released (removed/recycled)
    releaseEvent({ eventRecord, element }) {
        // Cleanup
        element.removeEventListener('customEvent', handler);
        destroyChart(element);
    }
}
```

### Force Repaint

```javascript
// Repaint all events
scheduler.refresh();

// Repaint events for specific resource
scheduler.refreshRows();

// Repaint specific event
const event = scheduler.eventStore.first;
scheduler.repaintEvent(event);

// Repaint after data change
scheduler.eventStore.on({
    change() {
        scheduler.refreshRows();
    }
});
```

## Virtual Rendering

Only visible rows and events are rendered:

```javascript
// RowManager handles virtual rendering
const scheduler = new SchedulerPro({
    // Buffer rows above/below viewport
    bufferCount: 5,

    // Pre-calculate all row heights (disables virtual scrolling)
    // Only use for small datasets
    // virtualRendering: false  // Not recommended
});
```

### Row Reuse

```javascript
listeners: {
    // Row is being rendered (possibly reused)
    renderRow({ row, record, recordIndex }) {
        // row.element is the DOM element
        // Check if row is being reused
        if (row.isReused) {
            // Clear previous custom content
        }
    },

    // Multiple rows rendered
    renderRows({ source }) {
        // Batch update after rendering
    }
}
```

## Performance Optimization

### Use DomConfig Instead of Strings

```javascript
// Slower (HTML parsing)
eventRenderer({ eventRecord }) {
    return `<div class="content"><span>${eventRecord.name}</span></div>`;
}

// Faster (DomConfig)
eventRenderer({ eventRecord }) {
    return {
        className: 'content',
        children: [{ tag: 'span', text: eventRecord.name }]
    };
}
```

### Use syncId for Stable Elements

```javascript
eventRenderer({ eventRecord, renderData }) {
    renderData.children = [
        { syncId: 'icon', tag: 'i', className: eventRecord.iconCls },
        { syncId: 'title', text: eventRecord.name },
        { syncId: 'time', text: formatTime(eventRecord.startDate) }
    ];
}
```

### Batch Updates

```javascript
// Bad: Multiple individual updates
events.forEach(event => {
    event.name = newName;  // Triggers repaint each time
});

// Good: Batch updates
scheduler.eventStore.beginBatch();
events.forEach(event => {
    event.name = newName;
});
scheduler.eventStore.endBatch();  // Single repaint
```

### Disable Features During Updates

```javascript
// Disable rendering during bulk operations
scheduler.suspendRefresh();
try {
    // Bulk data operations
    scheduler.eventStore.loadData(newEvents);
    scheduler.resourceStore.loadData(newResources);
} finally {
    scheduler.resumeRefresh(true);  // true to refresh now
}
```

## Complete Example

```javascript
import { SchedulerPro, DomSync, StringHelper } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    rowHeight: 60,
    barMargin: 5,

    eventLayout: {
        type: 'stack'
    },

    overlappingEventSorter(a, b) {
        // Sort by duration (longer events first)
        return b.duration - a.duration;
    },

    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        // Add conditional classes
        renderData.cls.overdue = eventRecord.isOverdue;
        renderData.cls.milestone = eventRecord.isMilestone;

        // Custom color based on status
        if (eventRecord.status === 'completed') {
            renderData.eventColor = 'green';
        } else if (eventRecord.status === 'blocked') {
            renderData.eventColor = 'red';
        }

        // Build content with DomConfig
        return {
            className: 'event-content',
            children: [
                // Icon
                eventRecord.iconCls ? {
                    syncId: 'icon',
                    tag: 'i',
                    className: eventRecord.iconCls
                } : null,

                // Title
                {
                    syncId: 'title',
                    className: 'event-title',
                    text: StringHelper.encodeHtml(eventRecord.name)
                },

                // Progress bar
                eventRecord.percentDone !== undefined ? {
                    syncId: 'progress',
                    className: 'progress-bar',
                    children: [{
                        syncId: 'fill',
                        className: 'progress-fill',
                        style: { width: `${eventRecord.percentDone}%` }
                    }]
                } : null,

                // Duration badge
                {
                    syncId: 'duration',
                    className: 'duration-badge',
                    text: `${eventRecord.duration}${eventRecord.durationUnit[0]}`
                }
            ].filter(Boolean)  // Remove nulls
        };
    },

    listeners: {
        renderEvent({ eventRecord, element, isRepaint }) {
            // Add tooltips or other enhancements after render
            if (!isRepaint) {
                element.title = `${eventRecord.name} - ${eventRecord.status}`;
            }
        },

        releaseEvent({ element }) {
            // Cleanup when element is recycled
            element.title = '';
        }
    }
});
```

## CSS Styling

```css
/* Event bar styling */
.b-sch-event {
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Event content */
.event-content {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
    height: 100%;
}

.event-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Progress bar */
.progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(0,0,0,0.1);
}

.progress-fill {
    height: 100%;
    background: currentColor;
    transition: width 0.3s ease;
}

/* Conditional styling */
.b-sch-event.overdue {
    border: 2px solid #e74c3c;
}

.b-sch-event.milestone::before {
    content: '◆';
    margin-right: 4px;
}

/* Duration badge */
.duration-badge {
    font-size: 10px;
    background: rgba(0,0,0,0.1);
    padding: 2px 6px;
    border-radius: 10px;
}
```

## Best Practices

1. **Use DomConfig over strings** - Better performance and security
2. **Always use syncId** - Enables efficient DOM updates
3. **Minimize DOM depth** - Flatter structures render faster
4. **Batch data updates** - Use beginBatch/endBatch
5. **Clean up on releaseEvent** - Prevent memory leaks
6. **Use fixed row heights** - When possible for better performance
7. **Avoid complex renderers** - Move logic to pre-calculated fields
8. **Test with large datasets** - Verify virtual rendering works

## API Reference Links

- [DomSync](https://bryntum.com/products/schedulerpro/docs/api/Core/helper/DomSync)
- [DomHelper](https://bryntum.com/products/schedulerpro/docs/api/Core/helper/DomHelper)
- [SchedulerEventRendering](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/mixin/SchedulerEventRendering)
- [TimelineEventRendering](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/mixin/TimelineEventRendering)
- [eventRenderer config](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/Scheduler#config-eventRenderer)
