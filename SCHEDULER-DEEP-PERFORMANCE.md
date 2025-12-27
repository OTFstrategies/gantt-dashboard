# SchedulerPro Deep Dive: Performance Optimization

## Overview

SchedulerPro is designed for high performance with large datasets. It employs virtual rendering, element recycling, and efficient data structures. This document covers performance optimization techniques for building responsive scheduling applications.

## Core Performance Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SchedulerPro Performance Stack                    │
├─────────────────────────────────────────────────────────────────────┤
│ Virtual Rendering │ Only visible rows/events rendered to DOM        │
├─────────────────────────────────────────────────────────────────────┤
│ Element Recycling │ DOM elements reused during scrolling            │
├─────────────────────────────────────────────────────────────────────┤
│ Buffered Rendering│ Pre-render rows above/below viewport            │
├─────────────────────────────────────────────────────────────────────┤
│ Lazy Loading      │ Load data on-demand as user scrolls             │
├─────────────────────────────────────────────────────────────────────┤
│ Batched Updates   │ Multiple changes combined into single repaint   │
└─────────────────────────────────────────────────────────────────────┘
```

## Virtual Rendering

SchedulerPro only renders visible content plus a buffer zone.

### Row Virtualization

```typescript
// Only visible rows are rendered
// As user scrolls, new rows are rendered and old ones recycled

const scheduler = new SchedulerPro({
    // Default row height for consistent virtualization
    rowHeight: 50,

    // Buffer of rows above/below viewport
    bufferCoef: 5  // Render 5x viewport height of rows
});
```

### Event Virtualization

```typescript
// Events outside visible time range are not rendered
// Events in off-screen rows are not rendered

// Access visible events only
const visibleEvents = scheduler.eventStore.storage.values.filter(
    event => scheduler.isEventInView(event)
);
```

## Element Recycling

DOM elements are recycled when scrolling to minimize garbage collection.

### releaseEvent Event

```typescript
scheduler.on('releaseEvent', ({ element, eventRecord }) => {
    // Clean up custom content before element is recycled
    const customElement = element.querySelector('.my-custom-content');
    if (customElement) {
        customElement.remove();
    }

    // Remove custom event listeners
    element.removeEventListener('click', customHandler);
});
```

### renderEvent for Initialization

```typescript
scheduler.on('renderEvent', ({
    element,
    eventRecord,
    isRepaint,
    isReusingElement
}) => {
    if (isReusingElement) {
        // Element was recycled - reinitialize content
    }

    if (isRepaint) {
        // Existing element being updated
    }
});
```

## Lazy Loading

Load data on-demand as user scrolls or navigates dates.

### Store Configuration

```typescript
const eventStore = new EventStore({
    lazyLoad: {
        chunkSize: 100,         // Records per chunk
        bufferUnit: 'day',      // Buffer time unit
        bufferAmount: 7,        // Buffer days before/after visible
        dateFormat: 'YYYY-MM-DD' // Date format for server requests
    }
});
```

### Request Data Handler

```typescript
const eventStore = new EventStore({
    lazyLoad: true,

    async requestData({ startDate, endDate, startIndex, count }) {
        const response = await fetch(
            `/api/events?start=${startDate}&end=${endDate}&offset=${startIndex}&limit=${count}`
        );
        const data = await response.json();

        return {
            data: data.events,
            total: data.total
        };
    }
});
```

### Lazy Load Events

```typescript
scheduler.eventStore.on({
    lazyLoadStarted() {
        showLoadingIndicator();
    },

    lazyLoadEnded() {
        hideLoadingIndicator();
    }
});
```

## Batch Updates

Combine multiple changes into single repaints.

### Using suspendRefresh/resumeRefresh

```typescript
// Suspend UI updates
scheduler.suspendRefresh();

try {
    // Make many changes without triggering repaints
    for (let i = 0; i < 1000; i++) {
        scheduler.eventStore.add({
            name: `Event ${i}`,
            startDate: new Date(),
            duration: 1
        });
    }
} finally {
    // Resume and trigger single repaint
    scheduler.resumeRefresh(true);  // true = trigger refresh now
}
```

### Using Store batch methods

```typescript
// Batch add
scheduler.eventStore.add(thousandsOfEvents);  // Single update

// Batch remove
scheduler.eventStore.remove(selectedEvents);  // Single update

// Suspend change tracking
scheduler.eventStore.suspendAutoCommit();
// Make changes
scheduler.eventStore.resumeAutoCommit();
```

### Using Project queue

```typescript
project.queue(async () => {
    // All changes in this block are batched
    project.eventStore.add([...]);
    project.assignmentStore.add([...]);

    await project.commitAsync();
});
```

## Configuration Optimizations

### Disable Unused Features

```typescript
const scheduler = new SchedulerPro({
    features: {
        // Disable features you don't need
        cellEdit: false,
        columnReorder: false,
        columnResize: false,
        columnPicker: false,
        sort: false,
        filter: false,
        group: false,

        // Tooltips add overhead on hover
        eventTooltip: false,
        scheduleTooltip: false,
        cellTooltip: false,

        // Dependencies can be expensive
        dependencies: false
    }
});
```

### Optimize eventRenderer

```typescript
// ❌ Expensive: Complex calculations in renderer
eventRenderer({ eventRecord }) {
    const total = calculateComplexValue(eventRecord);
    return `${eventRecord.name}: ${total}`;
}

// ✅ Efficient: Pre-calculate values
eventRecord.cachedTotal = calculateComplexValue(eventRecord);
// Later in renderer:
eventRenderer({ eventRecord }) {
    return `${eventRecord.name}: ${eventRecord.cachedTotal}`;
}
```

```typescript
// ❌ Expensive: Deep DOM structure
eventRenderer({ eventRecord }) {
    return {
        tag: 'div',
        children: [
            { tag: 'div', children: [
                { tag: 'span', text: eventRecord.name }
            ]}
        ]
    };
}

// ✅ Efficient: Simple structure
eventRenderer({ eventRecord }) {
    return eventRecord.name;  // Just text
}
```

### Row Height Optimization

```typescript
const scheduler = new SchedulerPro({
    // Fixed row height enables optimized calculations
    rowHeight: 50,

    // Or use resourceMargin for consistent spacing
    resourceMargin: 5,

    // Avoid dynamic row heights when possible
    dynamicRowHeight: false
});
```

### Event Layout Optimization

```typescript
const scheduler = new SchedulerPro({
    // Stack overlapping events efficiently
    eventLayout: 'stack',  // or 'pack', 'none'

    // Limit overlapping events
    maxOverlappingEvents: 5,  // Cap at 5 stacked

    // Margin between events
    barMargin: 2
});
```

## Memory Management

### Clean Up Event Listeners

```typescript
// Store reference to handler for removal
const handler = (event) => handleEvent(event);
element.addEventListener('click', handler);

// Remove in releaseEvent
scheduler.on('releaseEvent', ({ element }) => {
    element.removeEventListener('click', handler);
});
```

### Destroy Unused Instances

```typescript
// Properly destroy scheduler when done
scheduler.destroy();

// Clear references
scheduler = null;
```

### Limit Stored History

```typescript
// Limit STM history
const project = new ProjectModel({
    stm: {
        autoRecord: true,
        maxTransactionCount: 20  // Limit undo history
    }
});
```

## Large Dataset Strategies

### Windowed Data Loading

```typescript
// Load only visible date range plus buffer
async function loadDateRange(startDate, endDate) {
    const buffer = 1000 * 60 * 60 * 24 * 7;  // 1 week buffer

    const response = await fetch(`/api/events?` +
        `start=${new Date(startDate - buffer).toISOString()}` +
        `&end=${new Date(endDate + buffer).toISOString()}`
    );

    const data = await response.json();
    await scheduler.eventStore.loadDataAsync(data);
}

// React to visible range changes
scheduler.on('visibleDateRangeChange', ({ new: range }) => {
    loadDateRange(range.startDate, range.endDate);
});
```

### Progressive Loading

```typescript
// Load essential data first, details later
async function progressiveLoad() {
    // Phase 1: Load structure
    await project.loadInlineData({
        resources: await fetch('/api/resources').then(r => r.json()),
        events: []
    });

    // Phase 2: Load events in chunks
    const chunks = await fetch('/api/events/chunks').then(r => r.json());

    for (const chunk of chunks) {
        await project.eventStore.add(chunk);
        await new Promise(r => requestAnimationFrame(r));  // Yield to UI
    }
}
```

### Server-Side Filtering

```typescript
const scheduler = new SchedulerPro({
    eventStore: {
        remoteFilter: true,
        remoteSort: true,

        async requestData({ filters, sorters }) {
            const params = new URLSearchParams();

            // Send filters to server
            filters?.forEach(f => {
                params.append(`filter_${f.field}`, f.value);
            });

            // Send sorters to server
            sorters?.forEach(s => {
                params.append('sort', `${s.field}:${s.ascending ? 'asc' : 'desc'}`);
            });

            return fetch(`/api/events?${params}`).then(r => r.json());
        }
    }
});
```

## Rendering Optimizations

### Use CSS Instead of Inline Styles

```typescript
// ❌ Inline styles trigger style recalculation
eventRenderer({ eventRecord, renderData }) {
    renderData.style = {
        backgroundColor: eventRecord.color,
        borderColor: eventRecord.borderColor
    };
}

// ✅ CSS classes are more efficient
eventRenderer({ eventRecord, renderData }) {
    renderData.cls[`color-${eventRecord.colorIndex}`] = true;
}

// In CSS:
// .color-0 { background: #ff0000; border-color: #cc0000; }
// .color-1 { background: #00ff00; border-color: #00cc00; }
```

### Avoid Layout Thrashing

```typescript
// ❌ Causes layout thrashing
events.forEach(event => {
    const rect = event.element.getBoundingClientRect();  // Forces layout
    event.element.style.height = rect.width + 'px';      // Invalidates layout
});

// ✅ Batch reads and writes
const rects = events.map(e => e.element.getBoundingClientRect());
events.forEach((event, i) => {
    event.element.style.height = rects[i].width + 'px';
});
```

### Debounce Expensive Operations

```typescript
// Debounce search/filter operations
const debouncedFilter = Core.helper.FunctionHelper.createBuffered(
    (value) => {
        scheduler.eventStore.filter({
            property: 'name',
            value
        });
    },
    300  // 300ms debounce
);

searchInput.on('input', (e) => debouncedFilter(e.target.value));
```

## Profiling & Monitoring

### Browser DevTools

```javascript
// Profile specific operations
console.profile('Load Events');
await scheduler.eventStore.load();
console.profileEnd('Load Events');

// Mark timeline for visual reference
performance.mark('start-render');
scheduler.refreshRows();
performance.mark('end-render');
performance.measure('render-time', 'start-render', 'end-render');
```

### Measure Render Time

```typescript
scheduler.on('renderEvent', ({ eventRecord }) => {
    const start = performance.now();

    // After rendering
    requestAnimationFrame(() => {
        const duration = performance.now() - start;
        if (duration > 16) {  // > 1 frame
            console.warn('Slow event render:', eventRecord.id, duration);
        }
    });
});
```

### Memory Monitoring

```javascript
// Check memory usage
if (performance.memory) {
    console.log('Used JS Heap:', performance.memory.usedJSHeapSize);
    console.log('Total JS Heap:', performance.memory.totalJSHeapSize);
}
```

## Common Performance Antipatterns

### 1. Reading DOM During Render

```typescript
// ❌ Bad: DOM access in renderer
eventRenderer({ eventRecord }) {
    const containerWidth = scheduler.element.offsetWidth;  // Forces layout
    return eventRecord.name;
}

// ✅ Good: Cache DOM measurements
let containerWidth = scheduler.element.offsetWidth;
scheduler.on('resize', () => {
    containerWidth = scheduler.element.offsetWidth;
});

eventRenderer({ eventRecord }) {
    // Use cached value
    return containerWidth > 500 ? eventRecord.name : '';
}
```

### 2. Synchronous Network Calls

```typescript
// ❌ Bad: Sync call in renderer
eventRenderer({ eventRecord }) {
    const data = fetchSync(`/api/details/${eventRecord.id}`);  // Blocks!
    return data.name;
}

// ✅ Good: Pre-fetch data
await Promise.all(events.map(e =>
    fetch(`/api/details/${e.id}`).then(r => r.json())
        .then(data => e.details = data)
));

eventRenderer({ eventRecord }) {
    return eventRecord.details?.name || 'Loading...';
}
```

### 3. Unnecessary Re-renders

```typescript
// ❌ Bad: Triggering refresh on every change
scheduler.eventStore.on('update', () => {
    scheduler.refreshRows();  // Unnecessary - happens automatically
});

// ✅ Good: Let the scheduler manage refreshes
// Or batch custom refreshes
let needsRefresh = false;
scheduler.eventStore.on('update', () => {
    if (!needsRefresh) {
        needsRefresh = true;
        requestAnimationFrame(() => {
            scheduler.refreshRows();
            needsRefresh = false;
        });
    }
});
```

### 4. Creating Objects in Hot Paths

```typescript
// ❌ Bad: Object allocation in renderer
eventRenderer({ eventRecord }) {
    const config = { color: 'red', size: 'large' };  // New object every time
    return formatEvent(eventRecord, config);
}

// ✅ Good: Reuse objects
const renderConfig = { color: 'red', size: 'large' };

eventRenderer({ eventRecord }) {
    return formatEvent(eventRecord, renderConfig);
}
```

## Performance Checklist

- [ ] Disable unused features
- [ ] Use fixed row heights when possible
- [ ] Keep eventRenderer simple and fast
- [ ] Pre-calculate expensive values
- [ ] Use CSS classes instead of inline styles
- [ ] Implement lazy loading for large datasets
- [ ] Batch multiple changes together
- [ ] Clean up event listeners on element recycling
- [ ] Use server-side filtering/sorting for large datasets
- [ ] Profile regularly during development
- [ ] Monitor memory usage for leaks

## Integration Notes

1. **Initial Load**: The first render is often slowest. Consider showing a skeleton/loading state.

2. **Scroll Performance**: Virtual rendering maintains 60fps scrolling even with large datasets.

3. **Mobile Optimization**: Reduce buffer coefficients and disable hover-based features on touch devices.

4. **Memory Budget**: Monitor heap size with large datasets. Consider pagination for very large datasets.

5. **Network Optimization**: Compress data transfer. Use delta updates for real-time sync.

6. **Worker Threads**: Consider offloading heavy calculations to Web Workers.
