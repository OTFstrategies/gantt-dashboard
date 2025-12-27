# SchedulerPro Deep Dive: Keyboard Navigation & Accessibility

## Overview

SchedulerPro provides comprehensive keyboard navigation and accessibility features:
- **EventNavigation**: Navigate between events using keyboard
- **ScheduleContext**: Navigate timeline cells with keyboard
- **Grid Row Navigation**: Standard grid keyboard controls
- **ARIA Support**: Screen reader compatibility
- **Focus Management**: Visible focus indicators

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 Keyboard & Accessibility Layer                   │
├─────────────────────────────────────────────────────────────────┤
│  EventNavigation Mixin                                           │
│  ├── Arrow key navigation between events                        │
│  ├── Delete/Backspace for event removal                         │
│  └── Enter for event editing                                    │
├─────────────────────────────────────────────────────────────────┤
│  ScheduleContext Feature                                         │
│  ├── Timeline cell navigation                                   │
│  ├── Multi-cell selection                                       │
│  └── Widget display in cells                                    │
├─────────────────────────────────────────────────────────────────┤
│  Grid Navigation                                                 │
│  ├── Row navigation                                              │
│  ├── Cell navigation                                            │
│  └── Tab order management                                       │
├─────────────────────────────────────────────────────────────────┤
│  ARIA Layer                                                      │
│  ├── Role attributes                                             │
│  ├── aria-label / aria-describedby                              │
│  └── Live regions for announcements                             │
└─────────────────────────────────────────────────────────────────┘
```

## EventNavigation Mixin

Provides keyboard navigation between scheduled events.

### Configuration

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    // EventNavigation is enabled by default
    // These are configuration options:

    // Allow Delete/Backspace to remove events
    enableDeleteKey: true,

    // Navigate event on the navigate event
    onNavigate({ event, item, oldItem }) {
        console.log('Navigated to:', item);
    }
});
```

### Default Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow Keys | Navigate between events |
| Enter | Open event editor (if EventEdit feature enabled) |
| Delete/Backspace | Remove selected event (if enableDeleteKey: true) |
| Escape | Cancel current operation |
| Tab | Move focus to next focusable element |

### Navigation Events

```javascript
const scheduler = new SchedulerPro({
    listeners: {
        // Fired when navigation changes active item
        navigate({ event, item, oldItem }) {
            if (item) {
                const eventRecord = scheduler.resolveEventRecord(item);
                console.log('Now at event:', eventRecord.name);
            }
        }
    }
});
```

### Check if Event is in View

```javascript
// Determines if an event is within the visible time axis
if (scheduler.isInTimeAxis(eventRecord)) {
    console.log('Event is visible');
}
```

## EventSelection

Keyboard-driven event selection.

### Configuration

```javascript
const scheduler = new SchedulerPro({
    // Enable multi-event selection with Ctrl/Cmd+click
    multiEventSelect: true,

    // Or configure modifier keys
    multiEventSelect: {
        ctrlKey: true,   // Ctrl+click to add to selection
        shiftKey: true,  // Shift+click for range select
        altKey: false    // Alt not used
    },

    // Deselect when clicking empty schedule area
    deselectAllOnScheduleClick: true,

    // Deselect a selected event when clicked again
    deselectOnClick: false,

    // Highlight dependent events when selecting
    highlightPredecessors: true,
    highlightSuccessors: true,

    // Preserve selection on data reload
    maintainSelectionOnDatasetChange: true,

    // Select resource when navigating to event
    selectResourceOnEventNavigate: true,

    listeners: {
        // Selection change events
        eventSelectionChange({ action, selected, deselected, selection }) {
            console.log(`Action: ${action}`);
            console.log('Selected:', selected.map(e => e.name));
            console.log('Deselected:', deselected.map(e => e.name));
            console.log('Current selection:', selection.map(e => e.name));
        },

        // Before selection change (can be cancelled)
        beforeEventSelectionChange({ action, selected, deselected }) {
            // Return false to prevent selection change
            return true;
        },

        // Assignment-level selection
        assignmentSelectionChange({ action, selected, deselected, selection }) {
            console.log('Assignment selection changed');
        }
    }
});
```

### Control Selection Programmatically

```javascript
// Select events
scheduler.selectedEvents = [event1, event2];

// Add to selection
scheduler.selectEvent(event3, true); // preserve = true

// Deselect
scheduler.deselectEvent(event1);

// Clear selection
scheduler.clearEventSelection();

// Check selection
const isSelected = scheduler.isEventSelected(event);

// Get selected events
const selected = scheduler.selectedEvents;
```

## ScheduleContext Feature

Navigate and select timeline cells using keyboard.

### Configuration

```javascript
const scheduler = new SchedulerPro({
    features: {
        scheduleContext: {
            // Enable keyboard navigation across ticks
            keyNavigation: true,

            // Auto-start navigation when column focused
            startNavigationOnColumnFocus: true,

            // Enable multi-cell selection
            multiSelect: true,

            // Trigger event: click, hover, contextmenu, mousedown
            triggerEvent: 'click',

            // Show context even when over events
            shareWithEvent: false,

            // Custom renderer for context cell
            renderer({ context, element }) {
                element.innerHTML = `
                    <div class="context-info">
                        ${context.resourceRecord.name}
                        <br>
                        ${DateHelper.format(context.date, 'HH:mm')}
                    </div>
                `;
            },

            // Or use a widget in the cell
            widget: {
                type: 'button',
                text: 'Add Event',
                onClick() {
                    // Create event at this context
                }
            }
        }
    }
});
```

### Context Properties

```javascript
const context = scheduler.features.scheduleContext.context;

// Access context information
console.log(context.resourceRecord);  // Resource at this cell
console.log(context.date);            // Date/time at this cell
console.log(context.tickStartDate);   // Start of tick
console.log(context.tickEndDate);     // End of tick
```

### Navigation Methods

```javascript
const scheduleContext = scheduler.features.scheduleContext;

// Check if navigating
if (scheduleContext.isNavigatingTimelineCells) {
    console.log('Currently navigating timeline');
}

// Start/stop navigation programmatically
scheduleContext.startNavigation();
scheduleContext.stopNavigation();

// Access selected cells (when multiSelect: true)
const selectedCells = scheduleContext.selectedCells;
```

## keyMap Configuration

Customize keyboard shortcuts for features:

### Feature-Level keyMap

```javascript
const scheduler = new SchedulerPro({
    features: {
        eventEdit: {
            keyMap: {
                // Custom key to save and close
                'Ctrl+S': 'save',
                // Custom key to delete event
                'Ctrl+D': 'delete'
            }
        },

        cellMenu: {
            keyMap: {
                // Custom context menu trigger
                'Shift+F10': 'showContextMenu'
            }
        }
    }
});
```

### Widget-Level keyMap

```javascript
const scheduler = new SchedulerPro({
    tbar: [
        {
            type: 'button',
            text: 'New Event',
            keyMap: {
                'Ctrl+N': 'click'
            },
            onClick() {
                // Create new event
            }
        }
    ]
});
```

## ARIA Accessibility

### Widget ARIA Attributes

```javascript
const scheduler = new SchedulerPro({
    // ARIA label for the scheduler
    ariaLabel: 'Project Schedule',

    // ARIA description (creates linked element)
    ariaDescription: 'Weekly schedule showing team assignments',

    columns: [
        {
            type: 'resourceInfo',
            text: 'Resource',
            ariaLabel: 'Resource name and role'
        }
    ]
});
```

### Event ARIA

```javascript
// Events automatically get ARIA roles and labels
// Customize via eventRenderer:

const scheduler = new SchedulerPro({
    eventRenderer({ eventRecord, renderData }) {
        // Add custom ARIA attributes
        renderData.elementAttributes = {
            'aria-label': `${eventRecord.name}, ${eventRecord.startDate} to ${eventRecord.endDate}`,
            'aria-selected': scheduler.isEventSelected(eventRecord)
        };

        return eventRecord.name;
    }
});
```

### Button ARIA

```javascript
const scheduler = new SchedulerPro({
    tbar: [
        {
            type: 'button',
            icon: 'b-icon-add',
            ariaLabel: 'Add new event',
            ariaDescription: 'Opens dialog to create a new scheduled event',
            onClick() {
                // ...
            }
        }
    ]
});
```

## Focus Management

### Focus Indicators

```javascript
const scheduler = new SchedulerPro({
    // Show focus renditions when using keyboard
    showFocusRendition: true  // Default: true
});
```

### Programmatic Focus

```javascript
// Focus the scheduler
scheduler.focus();

// Focus a specific element
scheduler.focusableElement.focus();

// Focus a specific event
scheduler.navigateTo(eventRecord);

// Scroll event into view and focus
await scheduler.scrollEventIntoView(eventRecord);
scheduler.selectEvent(eventRecord);
```

### Tab Order

```javascript
const scheduler = new SchedulerPro({
    // Control tab index
    tabIndex: 0,

    columns: [
        {
            type: 'resourceInfo',
            // Column-specific tab behavior
            tabIndex: -1  // Skip in tab order
        }
    ]
});
```

## Complete Example

```javascript
import { SchedulerPro, DateHelper } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    // ARIA configuration
    ariaLabel: 'Team Schedule',
    ariaDescription: 'Weekly schedule for project team members',

    // Enable keyboard features
    enableDeleteKey: true,
    multiEventSelect: true,
    highlightPredecessors: true,
    highlightSuccessors: true,

    features: {
        // Schedule context with keyboard navigation
        scheduleContext: {
            keyNavigation: true,
            startNavigationOnColumnFocus: true,
            multiSelect: false,

            renderer({ context }) {
                return {
                    className: 'schedule-context-cell',
                    children: [{
                        tag: 'span',
                        className: 'context-time',
                        text: DateHelper.format(context.date, 'HH:mm')
                    }]
                };
            }
        },

        // Event editing with keyboard
        eventEdit: {
            keyMap: {
                'Ctrl+S': 'save',
                'Escape': 'cancel'
            }
        },

        // Context menu
        eventMenu: {
            keyMap: {
                'Shift+F10': 'showContextMenu'
            }
        }
    },

    listeners: {
        // Track navigation
        navigate({ event, item, oldItem }) {
            if (item) {
                // Announce to screen readers
                announceToScreenReader(`Selected ${scheduler.resolveEventRecord(item).name}`);
            }
        },

        // Track selection
        eventSelectionChange({ selection }) {
            updateStatusBar(`${selection.length} event(s) selected`);
        },

        // Keyboard event handling
        keyDown({ event }) {
            // Custom keyboard shortcuts
            if (event.ctrlKey && event.key === 'a') {
                // Select all events
                event.preventDefault();
                scheduler.selectedEvents = scheduler.eventStore.records;
            }
        }
    },

    tbar: [
        {
            type: 'button',
            ref: 'addEvent',
            text: 'Add Event',
            icon: 'b-icon-add',
            ariaLabel: 'Add new event to schedule',
            keyMap: {
                'Ctrl+N': 'click'
            },
            onClick() {
                // Create event at current context or default
            }
        },
        {
            type: 'button',
            ref: 'deleteEvent',
            text: 'Delete',
            icon: 'b-icon-trash',
            ariaLabel: 'Delete selected events',
            keyMap: {
                'Delete': 'click'
            },
            onClick() {
                scheduler.selectedEvents.forEach(e => e.remove());
            }
        },
        '->',
        {
            type: 'button',
            text: 'Keyboard Help',
            icon: 'b-icon-help',
            ariaLabel: 'Show keyboard shortcuts',
            onClick() {
                showKeyboardHelp();
            }
        }
    ]
});

// Helper: Announce to screen readers
function announceToScreenReader(message) {
    const announcer = document.getElementById('sr-announcer') ||
        createAnnouncer();
    announcer.textContent = message;
}

function createAnnouncer() {
    const div = document.createElement('div');
    div.id = 'sr-announcer';
    div.setAttribute('role', 'status');
    div.setAttribute('aria-live', 'polite');
    div.className = 'visually-hidden';
    document.body.appendChild(div);
    return div;
}

// Helper: Show keyboard help
function showKeyboardHelp() {
    MessageDialog.alert({
        title: 'Keyboard Shortcuts',
        message: `
            <table class="keyboard-help">
                <tr><td>Arrow Keys</td><td>Navigate between events</td></tr>
                <tr><td>Enter</td><td>Edit selected event</td></tr>
                <tr><td>Delete</td><td>Remove selected event</td></tr>
                <tr><td>Ctrl+N</td><td>Add new event</td></tr>
                <tr><td>Ctrl+A</td><td>Select all events</td></tr>
                <tr><td>Escape</td><td>Cancel operation</td></tr>
                <tr><td>Tab</td><td>Move focus forward</td></tr>
                <tr><td>Shift+Tab</td><td>Move focus backward</td></tr>
            </table>
        `
    });
}
```

## CSS for Accessibility

```css
/* Visible focus indicators */
.b-scheduler .b-sch-event:focus {
    outline: 2px solid var(--b-focus-color, #007bff);
    outline-offset: 2px;
}

.b-scheduler .b-sch-event.b-focused {
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .b-scheduler .b-sch-event {
        border: 2px solid currentColor;
    }

    .b-scheduler .b-sch-event:focus {
        outline: 3px solid currentColor;
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .b-scheduler * {
        transition: none !important;
        animation: none !important;
    }
}

/* Screen reader only */
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Keyboard help table */
.keyboard-help {
    width: 100%;
    border-collapse: collapse;
}

.keyboard-help td {
    padding: 8px;
    border-bottom: 1px solid #eee;
}

.keyboard-help td:first-child {
    font-family: monospace;
    background: #f5f5f5;
    border-radius: 3px;
}
```

## Best Practices

1. **Enable Delete Key** - Set `enableDeleteKey: true` for keyboard event deletion
2. **Provide ARIA Labels** - Add descriptive labels for screen readers
3. **Visible Focus** - Ensure focus indicators are visible
4. **Keyboard Shortcuts** - Document and provide keyboard help
5. **Test with Screen Readers** - Verify with NVDA, JAWS, VoiceOver
6. **Respect User Preferences** - Honor `prefers-reduced-motion` and `prefers-contrast`
7. **Logical Tab Order** - Ensure tab navigation is intuitive
8. **Skip Links** - Provide skip navigation for large schedules

## API Reference Links

- [EventNavigation Mixin](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/mixin/EventNavigation)
- [EventSelection Mixin](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/view/mixin/EventSelection)
- [ScheduleContext Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/ScheduleContext)
- [Widget ARIA Config](https://bryntum.com/products/schedulerpro/docs/api/Core/widget/Widget#config-ariaLabel)
- [keyMap Configuration](https://bryntum.com/products/schedulerpro/docs/api/Core/widget/Widget#config-keyMap)
