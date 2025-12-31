# SchedulerPro Implementation: Infinite Scroll & Virtualization

## Overview

SchedulerPro provides advanced scrolling and virtualization features:
- **Infinite Timeline Scroll**: Automatically extend timeline as user scrolls
- **Row Virtualization**: Render only visible rows for performance
- **Lazy Loading**: Load data on demand from server
- **Store Paging**: Load data in pages for large datasets

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 Scroll & Virtualization System                   │
├─────────────────────────────────────────────────────────────────┤
│  Timeline Scroll (TimelineScroll mixin)                         │
│  ├── infiniteScroll - Auto-extend timeline                      │
│  ├── bufferCoef - Hidden buffer size                            │
│  ├── scrollToDate() - Navigate to date                          │
│  └── visibleDateRange - Current visible range                   │
├─────────────────────────────────────────────────────────────────┤
│  Row Virtualization (RowManager)                                 │
│  ├── Virtual row pool                                            │
│  ├── Row recycling                                               │
│  ├── fixedRowHeight optimization                                │
│  └── Dynamic row height support                                 │
├─────────────────────────────────────────────────────────────────┤
│  Data Loading                                                    │
│  ├── lazyLoad - Load chunks on scroll                           │
│  ├── remotePaging - Server-side paging                          │
│  └── requestData() - Custom data loading                        │
└─────────────────────────────────────────────────────────────────┘
```

## Infinite Timeline Scroll

### Enable Infinite Scroll

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    // Enable infinite timeline scrolling
    infiniteScroll: true,

    // Buffer coefficient (multiplier for visible width)
    // Larger = more preloaded, but heavier
    bufferCoef: 5,

    // Buffer threshold (when to trigger extension)
    // 0.2 = trigger when 20% from edge
    bufferThreshold: 0.2,

    // Initial visible date
    visibleDate: {
        date: new Date(),
        block: 'center'  // 'start', 'center', 'end'
    },

    viewPreset: 'dayAndWeek'
});
```

### Buffer Configuration

```javascript
const scheduler = new SchedulerPro({
    infiniteScroll: true,

    // bufferCoef determines hidden timeline size
    // Total rendered width = visibleWidth * bufferCoef
    bufferCoef: 5,  // 5x visible width total

    // bufferThreshold determines when to extend
    // When scroll position is within (bufferCoef * bufferThreshold)
    // from either edge, timeline extends
    bufferThreshold: 0.2
});

// Example with bufferCoef=5, bufferThreshold=0.2:
// - Visible area: 1000px
// - Total rendered: 5000px (2000px before, 1000px visible, 2000px after)
// - Extension triggered when: within 1000px (5 * 0.2 * 1000) of edges
```

### Visible Date Configuration

```javascript
// VisibleDate type
type VisibleDate = {
    date: Date;
    block: 'start' | 'center' | 'end';
};

const scheduler = new SchedulerPro({
    infiniteScroll: true,

    // Start with today centered
    visibleDate: {
        date: new Date(),
        block: 'center'
    }
});

// Update visible date dynamically
scheduler.visibleDate = {
    date: new Date(2024, 5, 15),
    block: 'start'
};

// Get current visible date range
const { startDate, endDate } = scheduler.visibleDateRange;
console.log(`Showing ${startDate} to ${endDate}`);
```

### Visible Date Range Events

```javascript
scheduler.on({
    // Fired when visible date range changes
    visibleDateRangeChange({ old, new: newRange }) {
        console.log('Previous range:', old.startDate, '-', old.endDate);
        console.log('New range:', newRange.startDate, '-', newRange.endDate);

        // Load events for new range
        loadEventsForRange(newRange.startDate, newRange.endDate);
    }
});
```

## Timeline Scroll Methods

### Scroll To Date

```javascript
// Scroll to specific date
await scheduler.scrollToDate(new Date(2024, 6, 1), {
    block: 'center',      // 'start', 'center', 'end'
    animate: true,        // Enable animation
    duration: 300,        // Animation duration
    easing: 'easeInOut'   // Animation easing
});

// Scroll to now
await scheduler.scrollToNow({
    block: 'center',
    animate: true
});

// Scroll to specific x position
await scheduler.scrollTo(500);  // 500px from left
```

### Scroll Event Into View

```javascript
// Scroll to make event visible
await scheduler.scrollEventIntoView(eventRecord, {
    block: 'center',
    animate: true
});

// With resource highlight
await scheduler.scrollEventIntoView(eventRecord, {
    block: 'center',
    highlight: true,
    edgeOffset: 20  // Padding from edges
});
```

### Scroll Resource Into View

```javascript
// Scroll to make resource row visible
await scheduler.scrollResourceIntoView(resourceRecord, {
    block: 'nearest',  // 'start', 'center', 'end', 'nearest'
    animate: true
});
```

## Row Virtualization

### Fixed Row Height (Best Performance)

```javascript
const scheduler = new SchedulerPro({
    // Enable fixed row height for best performance
    fixedRowHeight: true,

    // Set consistent row height
    rowHeight: 50,

    // This enables RowManager optimizations:
    // - Direct row index calculation
    // - No row height measurement
    // - Faster scrolling
});
```

### Variable Row Height

```javascript
const scheduler = new SchedulerPro({
    // Allow variable row heights
    fixedRowHeight: false,

    // Default row height
    rowHeight: 50,

    // Dynamic row height based on content
    getRowHeight({ record }) {
        const events = scheduler.eventStore.getEventsForResource(record);
        const stackDepth = calculateStackDepth(events);
        return Math.max(50, stackDepth * 30);
    }
});
```

## Store Lazy Loading

### Configure Lazy Loading

```javascript
const scheduler = new SchedulerPro({
    project: {
        resourceStore: {
            // Enable lazy loading
            lazyLoad: {
                // Records to load per chunk
                chunkSize: 100
            },

            // Read URL for loading
            readUrl: '/api/resources',

            // Auto-load on creation
            autoLoad: true
        },

        eventStore: {
            lazyLoad: {
                chunkSize: 200
            },
            readUrl: '/api/events'
        }
    }
});
```

### Lazy Loading Events

```javascript
scheduler.resourceStore.on({
    // Loading started
    lazyLoadStarted() {
        showLoadingIndicator();
    },

    // Loading completed
    lazyLoadEnded() {
        hideLoadingIndicator();
    }
});
```

### Manual Lazy Load Control

```javascript
const store = scheduler.resourceStore;

// Check if lazy loading available
if (store.lazyLoad) {
    // Trigger load for specific index range
    await store.loadRange(100, 200);

    // Clear and reload
    await store.clearLazyLoad();
    await store.load();
}
```

## Store Remote Paging

### Configure Remote Paging

```javascript
const scheduler = new SchedulerPro({
    project: {
        eventStore: {
            // Enable remote paging
            remotePaging: true,

            // Page size
            pageSize: 50,

            // Read URL
            readUrl: '/api/events',

            // Page parameter name
            pageParamName: 'page',

            // Page size parameter name
            pageSizeParamName: 'limit'
        }
    }
});
```

### Paging Methods

```javascript
const store = scheduler.eventStore;

// Check if paged
if (store.isPaged) {
    // Navigate pages
    await store.loadPage(1);      // Load first page
    await store.nextPage();       // Load next page
    await store.previousPage();   // Load previous page
    await store.loadPage(5);      // Load specific page

    // Get paging info
    console.log('Current page:', store.currentPage);
    console.log('Total pages:', store.pageCount);
    console.log('Total records:', store.totalCount);
}
```

## Custom Data Loading

### Request Data Handler

```javascript
const scheduler = new SchedulerPro({
    project: {
        eventStore: {
            // Custom data loading function
            async requestData({ startDate, endDate, params }) {
                const response = await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        start: startDate.toISOString(),
                        end: endDate.toISOString(),
                        ...params
                    })
                });

                const { data, total } = await response.json();

                return {
                    data,       // Array of records
                    total       // Total count (for paging)
                };
            }
        }
    }
});
```

### Load Events on Scroll

```javascript
const scheduler = new SchedulerPro({
    infiniteScroll: true,

    listeners: {
        // Listen for visible range changes
        visibleDateRangeChange({ new: range }) {
            loadEventsForRange(range.startDate, range.endDate);
        }
    }
});

// Load events for date range
async function loadEventsForRange(startDate, endDate) {
    // Check if already loaded
    const existingEvents = scheduler.eventStore.query(
        e => e.startDate >= startDate && e.endDate <= endDate
    );

    if (existingEvents.length === 0) {
        const events = await fetchEventsFromServer(startDate, endDate);
        scheduler.eventStore.add(events);
    }
}
```

## Scroll Performance Optimization

### Optimized Configuration

```javascript
const scheduler = new SchedulerPro({
    // Timeline
    infiniteScroll: true,
    bufferCoef: 3,           // Smaller buffer = less memory
    bufferThreshold: 0.3,    // Higher threshold = earlier load

    // Row rendering
    fixedRowHeight: true,
    rowHeight: 50,

    // Disable expensive features during scroll
    features: {
        eventDrag: {
            showTooltip: false  // Disable drag tooltip
        }
    },

    // Disable animations
    transitionDuration: 0,

    // Store configuration
    project: {
        eventStore: {
            // Disable change tracking during load
            trackRawChanges: false
        }
    }
});
```

### Debounce Scroll Events

```javascript
import { DomHelper } from '@bryntum/schedulerpro';

scheduler.on({
    scroll: DomHelper.debounce(({ scrollTop }) => {
        // Handle scroll (debounced)
        updateUIBasedOnScroll(scrollTop);
    }, 100)
});
```

## Complete Example

```javascript
import { SchedulerPro, DateHelper } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    // Infinite timeline
    infiniteScroll: true,
    bufferCoef: 5,
    bufferThreshold: 0.2,

    // Start centered on today
    visibleDate: {
        date: new Date(),
        block: 'center'
    },

    // Row virtualization
    fixedRowHeight: true,
    rowHeight: 50,

    viewPreset: 'dayAndWeek',

    columns: [
        { type: 'resourceInfo', text: 'Resource', width: 150 }
    ],

    project: {
        resourceStore: {
            readUrl: '/api/resources',
            autoLoad: true,

            // Lazy load resources
            lazyLoad: {
                chunkSize: 50
            }
        },

        eventStore: {
            // Events loaded on demand
            autoLoad: false
        }
    },

    tbar: [
        {
            type: 'button',
            text: 'Today',
            icon: 'b-icon b-icon-calendar',
            onClick() {
                scheduler.scrollToNow({ block: 'center', animate: true });
            }
        },
        {
            type: 'button',
            text: 'Go to Date',
            onClick() {
                showDatePicker();
            }
        },
        '->',
        {
            type: 'text',
            ref: 'dateRange',
            text: ''
        }
    ],

    listeners: {
        // Track visible range
        visibleDateRangeChange({ new: range }) {
            // Update toolbar
            updateDateRangeDisplay(range);

            // Load events for new range
            loadEventsForRange(range.startDate, range.endDate);
        },

        // Track loading state
        ['resourceStore.lazyLoadStarted']() {
            scheduler.maskBody('Loading resources...');
        },

        ['resourceStore.lazyLoadEnded']() {
            scheduler.unmaskBody();
        }
    }
});

// Update date range display
function updateDateRangeDisplay(range) {
    const text = `${DateHelper.format(range.startDate, 'MMM D')} - ${DateHelper.format(range.endDate, 'MMM D, YYYY')}`;
    scheduler.widgetMap.dateRange.text = text;
}

// Load events for visible range
const loadedRanges = new Map();

async function loadEventsForRange(startDate, endDate) {
    const rangeKey = `${startDate.getTime()}-${endDate.getTime()}`;

    // Skip if already loaded
    if (loadedRanges.has(rangeKey)) {
        return;
    }

    loadedRanges.set(rangeKey, true);

    // Add buffer to avoid edge gaps
    const bufferStart = DateHelper.add(startDate, -7, 'days');
    const bufferEnd = DateHelper.add(endDate, 7, 'days');

    try {
        const response = await fetch('/api/events?' + new URLSearchParams({
            start: bufferStart.toISOString(),
            end: bufferEnd.toISOString()
        }));

        const events = await response.json();

        // Add events (store handles duplicates)
        scheduler.eventStore.add(events);

    } catch (error) {
        console.error('Failed to load events:', error);
        loadedRanges.delete(rangeKey);  // Allow retry
    }
}

// Show date picker
function showDatePicker() {
    const popup = new Popup({
        header: 'Go to Date',
        items: [{
            type: 'datefield',
            ref: 'dateField',
            label: 'Select Date',
            value: new Date()
        }],
        buttons: {
            ok: {
                text: 'Go',
                onClick() {
                    const date = popup.widgetMap.dateField.value;
                    scheduler.scrollToDate(date, {
                        block: 'center',
                        animate: true
                    });
                    popup.close();
                }
            },
            cancel: {
                text: 'Cancel',
                onClick() {
                    popup.close();
                }
            }
        }
    });

    popup.show();
}

// Scroll to specific event
async function goToEvent(eventId) {
    const eventRecord = scheduler.eventStore.getById(eventId);

    if (eventRecord) {
        await scheduler.scrollEventIntoView(eventRecord, {
            block: 'center',
            animate: true,
            highlight: true
        });

        // Select the event
        scheduler.selectedEvents = [eventRecord];
    }
}

// Scroll to specific resource
async function goToResource(resourceId) {
    const resourceRecord = scheduler.resourceStore.getById(resourceId);

    if (resourceRecord) {
        await scheduler.scrollResourceIntoView(resourceRecord, {
            block: 'center',
            animate: true
        });

        // Select the resource row
        scheduler.selectedRecords = [resourceRecord];
    }
}

// Save and restore scroll state
function saveScrollState() {
    return {
        scrollTop: scheduler.scrollTop,
        scrollLeft: scheduler.scrollable.x,
        visibleDate: scheduler.visibleDate
    };
}

function restoreScrollState(state) {
    scheduler.visibleDate = state.visibleDate;
    scheduler.scrollTop = state.scrollTop;
    scheduler.scrollable.x = state.scrollLeft;
}
```

## CSS for Loading States

```css
/* Loading mask styling */
.b-mask {
    background: rgba(255, 255, 255, 0.9);
}

.b-mask-text {
    font-size: 14px;
    color: #333;
}

/* Loading indicator in row */
.b-loading-row {
    position: relative;
}

.b-loading-row::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 2px solid #ddd;
    border-top-color: #007bff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Scroll position indicator */
.scroll-position-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
}

.scroll-position-indicator.visible {
    opacity: 1;
}

/* Virtual row fade-in */
.b-grid-row {
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

## Best Practices

1. **Use fixedRowHeight**: Enable for best scroll performance
2. **Tune bufferCoef**: Balance between smoothness and memory
3. **Load Events on Demand**: Don't load all events upfront
4. **Track Loaded Ranges**: Avoid duplicate data fetching
5. **Add Buffer to Loads**: Load slightly beyond visible range
6. **Handle Loading States**: Show indicators during data fetch
7. **Debounce Scroll Events**: Don't overload scroll handlers
8. **Save/Restore State**: Persist scroll position across sessions
9. **Use Animation Sparingly**: Disable for performance-critical scenarios
10. **Monitor Memory**: Watch for memory leaks with large datasets

## API Reference Links

- [infiniteScroll Config](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/Scheduler#config-infiniteScroll)
- [TimelineScroll Mixin](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/mixin/TimelineScroll)
- [bufferCoef Config](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/mixin/TimelineScroll#config-bufferCoef)
- [visibleDate Config](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/Scheduler#config-visibleDate)
- [scrollToDate Method](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/TimelineBase#function-scrollToDate)
- [lazyLoad Config](https://bryntum.com/products/schedulerpro/docs/api/Core/data/Store#config-lazyLoad)
- [remotePaging Config](https://bryntum.com/products/schedulerpro/docs/api/Core/data/mixin/StorePaging#config-remotePaging)
