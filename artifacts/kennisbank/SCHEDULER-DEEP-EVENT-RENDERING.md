# SchedulerPro Deep Dive: Event Rendering

## Overview

Event rendering in SchedulerPro involves a sophisticated pipeline that transforms event data into visual DOM elements. Understanding this system is crucial for customizing appearance, implementing complex layouts, and optimizing performance.

## Rendering Pipeline

```
Event Data (EventModel)
         │
         ▼
┌─────────────────────────────┐
│   Calculate Position/Size   │  ← TimeAxisViewModel
│   (left, width, top, height)│
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Prepare RenderData        │  ← Style, classes, layout
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   eventRenderer callback    │  ← Custom content
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   renderEvent event         │  ← Post-render hooks
└─────────────────────────────┘
         │
         ▼
      DOM Element
```

## EventRenderData Type

The data object passed to renderers and events:

```typescript
type EventRenderData = {
    // Record references
    eventRecord: SchedulerEventModel
    resourceRecord: SchedulerResourceModel
    assignmentRecord: SchedulerAssignmentModel

    // Calculated dimensions (milliseconds)
    startMS: number       // Event start as timestamp
    endMS: number         // Event end as timestamp

    // Calculated pixel positions
    height: number        // Element height in px
    width: number         // Element width in px
    top: number           // Top offset within row
    left: number          // Left offset on timeline
}
```

## eventRenderer Configuration

The primary customization hook for event content.

### Basic Signature

```typescript
eventRenderer?: (detail: {
    eventRecord: SchedulerEventModel
    resourceRecord: SchedulerResourceModel
    assignmentRecord: SchedulerAssignmentModel
    scheduler: Scheduler
    renderData: RenderDataObject
}) => string | DomConfig | DomConfig[]
```

### RenderData Object

```typescript
renderData: {
    // Record reference
    event: SchedulerEventModel

    // CSS class management
    cls: DomClassList | string           // Classes for event bar
    wrapperCls: DomClassList | string    // Classes for wrapper element
    iconCls: DomClassList | string       // Classes for icon element

    // Positioning
    left: number                         // Horizontal offset (px)
    width: number                        // Width (px)
    height: number                       // Height (px)

    // Inline styles
    style: string | Record<string, string>         // Event bar styles
    wrapperStyle: string | Record<string, string>  // Wrapper styles

    // Appearance
    eventStyle: EventStyleType | null    // Current event style
    eventColor: string                   // Current color

    // Accessibility
    ariaLabel: string                    // Screen reader label

    // Child elements
    children: DomConfig[]                // Child DOM configs
}
```

### Return Values

```typescript
// String - Simple HTML content
eventRenderer({ eventRecord }) {
    return eventRecord.name;
}

// DomConfig - Structured DOM
eventRenderer({ eventRecord }) {
    return {
        tag: 'div',
        class: 'my-event-content',
        children: [
            { tag: 'span', class: 'title', text: eventRecord.name },
            { tag: 'span', class: 'time', text: eventRecord.duration + 'h' }
        ]
    };
}

// DomConfig[] - Multiple elements
eventRenderer({ eventRecord }) {
    return [
        { tag: 'i', class: 'icon-calendar' },
        { tag: 'span', text: eventRecord.name }
    ];
}
```

## DomClassList Helper

Utility for managing CSS classes dynamically.

```typescript
export class DomClassList {
    // Clear all classes
    clear(): DomClassList

    // Clone the list
    clone(): DomClassList

    // Compare to another list
    isEqual(other: DomClassList | string): boolean

    // Set classes (replaces existing)
    set(...classes: string[]): DomClassList

    // Get trimmed string
    trim(): string
}
```

### Usage in eventRenderer

```typescript
eventRenderer({ eventRecord, renderData }) {
    // Add conditional classes
    renderData.cls['high-priority'] = eventRecord.priority === 'high';
    renderData.cls['overdue'] = eventRecord.endDate < new Date();
    renderData.cls['milestone'] = eventRecord.duration === 0;

    // Add wrapper classes
    renderData.wrapperCls['has-dependencies'] = eventRecord.predecessors.length > 0;

    // Set icon class
    if (eventRecord.type === 'meeting') {
        renderData.iconCls['b-fa b-fa-users'] = true;
    }

    return eventRecord.name;
}
```

## Event Styles

### Available eventStyle Values

```typescript
type EventStyle =
    | 'tonal'      // Light background, darker text
    | 'filled'     // Solid background
    | 'bordered'   // Border only, transparent fill
    | 'traced'     // Thin bottom border
    | 'outlined'   // Outline style
    | 'indented'   // Indented appearance
    | 'line'       // Thin line
    | 'dashed'     // Dashed border
    | 'minimal'    // Minimal styling
    | 'rounded'    // Rounded corners
    | 'calendar'   // Calendar-style
    | 'interday'   // Multi-day events
    | 'gantt'      // Gantt chart style
    | null         // No style (custom)
```

### Style Priority

1. **Event level** - `eventRecord.eventStyle`
2. **Resource level** - `resourceRecord.eventStyle`
3. **Scheduler level** - `scheduler.eventStyle`

```typescript
const scheduler = new SchedulerPro({
    // Default for all events
    eventStyle: 'filled',

    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        // Override for specific events
        if (eventRecord.type === 'milestone') {
            renderData.eventStyle = 'minimal';
        }

        return eventRecord.name;
    }
});
```

## Event Colors

### Built-in Color Palette

```typescript
type EventColor =
    | 'red' | 'pink' | 'purple' | 'violet' | 'indigo'
    | 'blue' | 'cyan' | 'teal' | 'green' | 'lime'
    | 'yellow' | 'orange' | 'gray' | 'gantt-green'
    | null  // Custom color via CSS
```

### Color Priority

1. **Event level** - `eventRecord.eventColor`
2. **Resource level** - `resourceRecord.eventColor`
3. **Scheduler level** - `scheduler.eventColor`

```typescript
const scheduler = new SchedulerPro({
    eventColor: 'blue',  // Default

    eventRenderer({ eventRecord, renderData }) {
        // Dynamic color based on data
        if (eventRecord.priority === 'critical') {
            renderData.eventColor = 'red';
        } else if (eventRecord.status === 'completed') {
            renderData.eventColor = 'green';
        }

        return eventRecord.name;
    }
});
```

### Custom CSS Colors

```typescript
eventRenderer({ eventRecord, renderData }) {
    // Use any CSS color
    renderData.style = {
        backgroundColor: eventRecord.customColor || '#3498db',
        borderColor: eventRecord.borderColor || '#2980b9'
    };

    return eventRecord.name;
}
```

## Layout Configuration

### barMargin

Space between stacked events.

```typescript
const scheduler = new SchedulerPro({
    barMargin: 5  // 5px gap between stacked events
});
```

### resourceMargin

Space around events within resource row.

```typescript
// Simple number (both sides)
resourceMargin: 10

// Start/end specific
resourceMargin: {
    start: 5,
    end: 10
}
```

### Milestone Layout

```typescript
const scheduler = new SchedulerPro({
    // Alignment relative to startDate
    milestoneAlign: 'start' | 'center' | 'end',

    // Width calculation mode
    milestoneLayoutMode: 'default' | 'estimate' | 'data' | 'measure',

    // Character width for 'estimate' mode
    milestoneCharWidth: 8
});
```

**milestoneLayoutMode Options:**

| Mode | Description |
|------|-------------|
| `'default'` | Fixed diamond shape |
| `'estimate'` | Estimate width from name length |
| `'data'` | Use `milestoneWidth` field from model |
| `'measure'` | Measure actual rendered text width |

## Icon Classes

Add icons to events.

### Model-Level Icon

```typescript
// In EventModel
eventStore.add({
    name: 'Team Meeting',
    iconCls: 'b-fa b-fa-users'  // Font Awesome icon
});
```

### Renderer-Level Icon

```typescript
eventRenderer({ eventRecord, renderData }) {
    // Set icon based on type
    switch (eventRecord.type) {
        case 'meeting':
            renderData.iconCls = { 'b-fa': true, 'b-fa-users': true };
            break;
        case 'deadline':
            renderData.iconCls = { 'b-fa': true, 'b-fa-flag': true };
            break;
        case 'milestone':
            renderData.iconCls = null;  // Disable icon
            break;
    }

    return eventRecord.name;
}
```

## Inline Styles

### Event Bar Styles

```typescript
eventRenderer({ eventRecord, renderData }) {
    // String format
    renderData.style = 'border: 2px solid red; font-weight: bold';

    // Object format (recommended)
    renderData.style = {
        border: '2px solid red',
        fontWeight: 'bold',
        background: `linear-gradient(to right, ${eventRecord.startColor}, ${eventRecord.endColor})`
    };

    return eventRecord.name;
}
```

### Wrapper Styles

```typescript
eventRenderer({ eventRecord, renderData }) {
    // Style the wrapper element
    renderData.wrapperStyle = {
        boxShadow: eventRecord.important ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
        transform: eventRecord.highlighted ? 'scale(1.02)' : 'none'
    };

    return eventRecord.name;
}
```

## renderEvent Event

Fires after each event is rendered to DOM.

```typescript
const scheduler = new SchedulerPro({
    listeners: {
        renderEvent({
            source,
            eventRecord,
            resourceRecord,
            assignmentRecord,
            renderData,
            isRepaint,          // true if re-rendering existing element
            isReusingElement,   // true if recycling a released element
            element             // The actual DOM element
        }) {
            // Post-render DOM manipulation
            if (eventRecord.hasAttachment) {
                const badge = document.createElement('span');
                badge.className = 'attachment-badge';
                badge.textContent = '📎';
                element.appendChild(badge);
            }

            // Add custom event listeners
            element.addEventListener('dblclick', () => {
                showEventDetails(eventRecord);
            });
        }
    }
});
```

## releaseEvent Event

Fires when an event element is released (scrolled out of view).

```typescript
listeners: {
    releaseEvent({ element, eventRecord }) {
        // Cleanup custom content
        const badge = element.querySelector('.attachment-badge');
        if (badge) {
            badge.remove();
        }

        // Remove custom listeners
        element.removeEventListener('dblclick', handler);
    }
}
```

## Advanced Rendering Patterns

### Pattern 1: Progress Bar

```typescript
eventRenderer({ eventRecord, renderData }) {
    const percent = eventRecord.percentDone || 0;

    return {
        tag: 'div',
        class: 'event-with-progress',
        children: [
            {
                tag: 'div',
                class: 'progress-bar',
                style: { width: `${percent}%` }
            },
            {
                tag: 'span',
                class: 'event-name',
                text: eventRecord.name
            },
            {
                tag: 'span',
                class: 'percent-label',
                text: `${percent}%`
            }
        ]
    };
}
```

### Pattern 2: Avatar + Name

```typescript
eventRenderer({ eventRecord, resourceRecord, renderData }) {
    return [
        {
            tag: 'img',
            class: 'resource-avatar',
            src: resourceRecord.imageUrl || 'default-avatar.png'
        },
        {
            tag: 'div',
            class: 'event-details',
            children: [
                { tag: 'div', class: 'event-name', text: eventRecord.name },
                { tag: 'div', class: 'event-time', text: formatTime(eventRecord.startDate) }
            ]
        }
    ];
}
```

### Pattern 3: Status Indicator

```typescript
eventRenderer({ eventRecord, renderData }) {
    // Add status-based classes
    renderData.cls[`status-${eventRecord.status}`] = true;

    // Status indicator element
    const statusColors = {
        pending: '#ffc107',
        active: '#28a745',
        completed: '#6c757d',
        blocked: '#dc3545'
    };

    return {
        tag: 'div',
        class: 'event-content',
        children: [
            {
                tag: 'span',
                class: 'status-dot',
                style: { backgroundColor: statusColors[eventRecord.status] }
            },
            { tag: 'span', text: eventRecord.name }
        ]
    };
}
```

### Pattern 4: Conditional Rendering

```typescript
eventRenderer({ eventRecord, renderData }) {
    // Milestones
    if (eventRecord.duration === 0) {
        renderData.cls['is-milestone'] = true;
        return {
            tag: 'div',
            class: 'milestone-diamond',
            children: [{ tag: 'span', class: 'milestone-label', text: eventRecord.name }]
        };
    }

    // Summary tasks
    if (eventRecord.isParent) {
        renderData.cls['is-summary'] = true;
        return `${eventRecord.name} (${eventRecord.children.length} subtasks)`;
    }

    // Regular events
    return eventRecord.name;
}
```

### Pattern 5: Rich Content with HTML

```typescript
eventRenderer({ eventRecord }) {
    // Warning: Be careful with user-provided content (XSS risk)
    const escapedName = StringHelper.encodeHtml(eventRecord.name);
    const escapedDesc = StringHelper.encodeHtml(eventRecord.description || '');

    return `
        <div class="event-header">
            <strong>${escapedName}</strong>
        </div>
        <div class="event-body">
            ${escapedDesc}
        </div>
        <div class="event-footer">
            <span class="duration">${eventRecord.duration}h</span>
        </div>
    `;
}
```

## Performance Considerations

### Minimize DOM Complexity

```typescript
// ❌ Too complex
eventRenderer({ eventRecord }) {
    return {
        tag: 'div',
        children: [
            { tag: 'div', children: [
                { tag: 'div', children: [
                    { tag: 'span', text: eventRecord.name }
                ]}
            ]}
        ]
    };
}

// ✅ Simple and flat
eventRenderer({ eventRecord }) {
    return eventRecord.name;  // Just text
}
```

### Avoid Expensive Operations

```typescript
// ❌ Expensive calculation in renderer
eventRenderer({ eventRecord }) {
    const complexValue = calculateExpensiveMetric(eventRecord);
    return `${eventRecord.name}: ${complexValue}`;
}

// ✅ Pre-calculate and cache
eventRecord.cachedMetric = calculateExpensiveMetric(eventRecord);
// Later in renderer:
eventRenderer({ eventRecord }) {
    return `${eventRecord.name}: ${eventRecord.cachedMetric}`;
}
```

### Use CSS for Styling

```typescript
// ❌ Inline styles for common patterns
eventRenderer({ eventRecord, renderData }) {
    renderData.style = {
        backgroundColor: '#ff0000',
        color: '#ffffff',
        fontWeight: 'bold'
    };
    return eventRecord.name;
}

// ✅ Use CSS classes
eventRenderer({ eventRecord, renderData }) {
    renderData.cls['important-event'] = true;
    return eventRecord.name;
}

// CSS:
// .important-event { background: #ff0000; color: #fff; font-weight: bold; }
```

## fillTicks Configuration

Force events to fill entire ticks visually.

```typescript
const scheduler = new SchedulerPro({
    fillTicks: true  // Events expand to fill tick boundaries
});
```

**Note:** This only affects rendering; actual start/end dates remain unchanged.

## eventRendererThisObj

Set `this` context for eventRenderer.

```typescript
const myController = {
    formatEvent(record) {
        return `[${record.id}] ${record.name}`;
    }
};

const scheduler = new SchedulerPro({
    eventRendererThisObj: myController,

    eventRenderer({ eventRecord }) {
        return this.formatEvent(eventRecord);
    }
});
```

## CSS Class Reference

Built-in CSS classes applied to events:

| Class | Applied When |
|-------|--------------|
| `b-sch-event` | Always (main event element) |
| `b-sch-event-wrap` | Wrapper element |
| `b-milestone` | Duration is 0 |
| `b-sch-event-selected` | Event is selected |
| `b-sch-event-resizable-start` | Can resize start |
| `b-sch-event-resizable-end` | Can resize end |
| `b-sch-event-startsoutside` | Start is before visible range |
| `b-sch-event-endsoutside` | End is after visible range |
| `b-sch-dirty` | Has unsaved changes |

## Integration Notes

1. **Virtual Rendering**: Events outside the viewport are not rendered. Prepare for elements being created/destroyed as user scrolls.

2. **Element Recycling**: SchedulerPro recycles DOM elements. Use `releaseEvent` to clean up custom content.

3. **Async Content**: If you need async content (images, API data), load it beforehand and store on the model.

4. **XSS Prevention**: Always escape user-provided content when using HTML strings.

5. **Accessibility**: Set meaningful `ariaLabel` in renderData for screen readers.

6. **Performance**: Keep renderers fast - they run for every visible event on every repaint.
