# SchedulerPro Deep Dive: Event Selection

## Overview

The event selection system in SchedulerPro is provided through the `EventSelection` mixin. It manages selecting/deselecting events and assignments, multi-select support, keyboard modifiers, and related features like highlighting dependencies. Understanding this system is essential for implementing custom selection behaviors and responding to user interactions.

## EventSelection Mixin

```typescript
export class EventSelectionClass {
    // Identity
    static readonly isEventSelection: boolean
    readonly isEventSelection: boolean

    // Selection state
    selectedEvents: SchedulerEventModel[]
    selectedAssignments: SchedulerAssignmentModel[]

    // Configuration
    isEventSelectable: (event: SchedulerEventModel) => boolean
    selectResourceOnEventNavigate: boolean
}
```

## Configuration Options

### multiEventSelect

Enables multiple event selection with keyboard modifiers.

```typescript
type MultiEventSelectConfig = boolean | {
    ctrlKey?: boolean   // Allow CTRL+click
    altKey?: boolean    // Allow ALT+click
    shiftKey?: boolean  // Allow SHIFT+click
}

const scheduler = new SchedulerPro({
    // Simple boolean
    multiEventSelect: true,

    // Or with specific modifiers
    multiEventSelect: {
        ctrlKey: true,
        shiftKey: true
    }
});
```

**Behavior:**
- When `true`: CTRL/CMD+click adds/removes events from selection
- When object: Only specified modifier keys enable multi-select
- SHIFT+click: Selects range between last selected and clicked event (on same resource)

### deselectAllOnScheduleClick

```typescript
const scheduler = new SchedulerPro({
    // true (default): Clicking empty schedule area clears selection
    deselectAllOnScheduleClick: true,

    // false: Selection preserved when clicking empty area
    deselectAllOnScheduleClick: false
});
```

### deselectOnClick

```typescript
const scheduler = new SchedulerPro({
    // true: Clicking a selected event deselects it
    deselectOnClick: true,

    // false (default): Clicking selected event keeps it selected
    deselectOnClick: false
});
```

### eventSelectionDisabled

```typescript
const scheduler = new SchedulerPro({
    // Disable all event selection
    eventSelectionDisabled: true
});

// Can also be set at runtime
scheduler.eventSelectionDisabled = true;
```

### maintainSelectionOnDatasetChange

```typescript
const scheduler = new SchedulerPro({
    // Preserve selection when loading new data
    // (if event IDs exist in new dataset)
    maintainSelectionOnDatasetChange: true
});
```

### triggerSelectionChangeOnRemove

```typescript
const scheduler = new SchedulerPro({
    // Trigger selectionChange when selected events are removed
    triggerSelectionChangeOnRemove: true
});
```

### isEventSelectable

Template function to control which events can be selected.

```typescript
const scheduler = new SchedulerPro({
    isEventSelectable(eventRecord) {
        // Only allow selection of non-locked events
        if (eventRecord.locked) {
            return false;
        }

        // Only allow future events
        if (eventRecord.endDate < new Date()) {
            return false;
        }

        return true;
    }
});
```

### highlightPredecessors / highlightSuccessors

```typescript
const scheduler = new SchedulerPro({
    // Highlight predecessor events when selecting
    highlightPredecessors: true,

    // Highlight successor events when selecting
    highlightSuccessors: true
});
```

When enabled, dependent events receive highlight CSS classes when their predecessor/successor is selected.

## Selection Properties

### selectedEvents

```typescript
// Get selected events
const events: SchedulerEventModel[] = scheduler.selectedEvents;

// Set selected events (replaces current selection)
scheduler.selectedEvents = [event1, event2, event3];
```

### selectedAssignments

```typescript
// Get selected assignments
const assignments: SchedulerAssignmentModel[] = scheduler.selectedAssignments;

// Set selected assignments (replaces current selection)
scheduler.selectedAssignments = [assignment1, assignment2];
```

**Note:** In multi-assignment mode, the primary selection unit is assignments. In single-assignment mode, events and assignments are treated equivalently.

## Selection Methods

### selectEvent

```typescript
selectEvent(
    event: SchedulerEventModel,
    preserveSelection?: boolean
): void

// Select single event (clears other selections)
scheduler.selectEvent(eventRecord);

// Add event to selection
scheduler.selectEvent(eventRecord, true);
```

### selectEvents

```typescript
selectEvents(
    events: SchedulerEventModel[],
    preserveSelection?: boolean
): void

// Replace selection with multiple events
scheduler.selectEvents([event1, event2, event3]);

// Add multiple events to existing selection
scheduler.selectEvents([event1, event2], true);
```

### deselectEvent

```typescript
deselectEvent(event: SchedulerEventModel): void

// Deselect a specific event
scheduler.deselectEvent(eventRecord);
```

### deselectEvents

```typescript
deselectEvents(events: SchedulerEventModel[]): void

// Deselect multiple events
scheduler.deselectEvents([event1, event2, event3]);
```

### selectAssignment

```typescript
selectAssignment(
    assignment: SchedulerAssignmentModel,
    preserveSelection?: boolean,
    event?: Event
): void

// Select assignment (in multi-assignment mode)
scheduler.selectAssignment(assignmentRecord);

// Add to selection
scheduler.selectAssignment(assignmentRecord, true);

// With originating DOM event (for modifier key handling)
scheduler.selectAssignment(assignmentRecord, true, domEvent);
```

### selectAssignments

```typescript
selectAssignments(
    assignments: SchedulerAssignmentModel[]
): void

// Select multiple assignments
scheduler.selectAssignments([assignment1, assignment2]);
```

### deselectAssignment

```typescript
deselectAssignment(
    assignment: SchedulerAssignmentModel,
    event?: Event
): void

// Deselect a specific assignment
scheduler.deselectAssignment(assignmentRecord);
```

### deselectAssignments

```typescript
deselectAssignments(
    assignments: SchedulerAssignmentModel[]
): void

// Deselect multiple assignments
scheduler.deselectAssignments([assignment1, assignment2]);
```

### clearEventSelection

```typescript
clearEventSelection(): void

// Clear all selections
scheduler.clearEventSelection();
```

### isEventSelected

```typescript
isEventSelected(event: SchedulerEventModel): boolean

// Check if event is selected
if (scheduler.isEventSelected(eventRecord)) {
    console.log('Event is selected');
}
```

## Selection Events

### eventSelectionChange

Fires when event selection changes.

```typescript
type EventSelectionChangeEvent = {
    action: 'select' | 'deselect' | 'update' | 'clear'
    selected: SchedulerEventModel[]
    deselected: SchedulerEventModel[]
    selection: SchedulerEventModel[]
}

scheduler.on('eventSelectionChange', ({
    action,
    selected,
    deselected,
    selection
}) => {
    console.log(`Action: ${action}`);
    console.log(`Newly selected: ${selected.length}`);
    console.log(`Newly deselected: ${deselected.length}`);
    console.log(`Total selection: ${selection.length}`);

    // React to selection changes
    updateDetailPanel(selection);
});
```

**Actions:**
- `'select'`: Events added to selection
- `'deselect'`: Events removed from selection
- `'update'`: Selection changed due to data update (e.g., event deleted)
- `'clear'`: All events deselected

### beforeEventSelectionChange

Fires before selection changes. Return `false` to prevent the change.

```typescript
type BeforeEventSelectionChangeEvent = {
    action: string
    selected: SchedulerEventModel[]
    deselected: SchedulerEventModel[]
    selection: SchedulerEventModel[]
}

scheduler.on('beforeEventSelectionChange', ({
    action,
    selected,
    deselected,
    selection
}) => {
    // Prevent deselecting if there are unsaved changes
    if (action === 'deselect' && hasUnsavedChanges(deselected)) {
        return false;
    }

    // Can also return a Promise
    return confirmSelectionChange(selected, deselected);
});
```

### assignmentSelectionChange

Fires when assignment selection changes (multi-assignment mode).

```typescript
type AssignmentSelectionChangeEvent = {
    action: 'select' | 'deselect' | 'update' | 'clear'
    selected: SchedulerAssignmentModel[]
    deselected: SchedulerAssignmentModel[]
    selection: SchedulerAssignmentModel[]
}

scheduler.on('assignmentSelectionChange', ({
    action,
    selected,
    deselected,
    selection
}) => {
    console.log(`Selected assignments: ${selection.length}`);
});
```

## EventDragSelect Feature

Enables marquee/lasso selection by dragging on empty schedule area.

### Configuration

```typescript
type EventDragSelectConfig = {
    type?: 'eventDragSelect' | 'eventdragselect'
    disabled?: boolean
    includeNested?: boolean  // Include nested events in selection
    // ... standard feature options
}

const scheduler = new SchedulerPro({
    features: {
        eventDragSelect: true,

        // Or with options
        eventDragSelect: {
            includeNested: true
        }
    }
});
```

### EventDragSelect Events

```typescript
// Before drag select starts
scheduler.on('beforeEventDragSelect', ({
    source,
    event  // Native browser event
}) => {
    // Return false to prevent drag select
    if (event.shiftKey) {
        return false;
    }
});

// After drag selection completes
scheduler.on('afterEventDragSelect', ({ source }) => {
    console.log('Drag select completed');
});

// When drag selection area changes
scheduler.on('eventDragSelect', ({
    source,
    startDate,
    endDate,
    rectangle,
    selectedAssignments,
    selectedEvents
}) => {
    console.log(`Selected ${selectedEvents.length} events`);
    console.log(`Time range: ${startDate} to ${endDate}`);
});
```

**Behavior:**
- Draw rectangle on empty schedule area to select events within
- Hold CTRL/CMD to extend existing selection
- Events must be at least partially within rectangle to be selected

## CSS Classes

Selection-related CSS classes applied to elements:

| Class | Applied When |
|-------|--------------|
| `b-sch-event-selected` | Event is selected |
| `b-highlight-predecessor` | Event is predecessor of selected event (when highlightPredecessors enabled) |
| `b-highlight-successor` | Event is successor of selected event (when highlightSuccessors enabled) |
| `b-eventselection-disabled` | Selection is disabled |
| `b-drag-select-active` | Drag select is in progress |

```css
/* Custom selection styling */
.b-sch-event-selected {
    box-shadow: 0 0 0 3px rgba(0, 120, 255, 0.5);
    transform: scale(1.02);
}

/* Highlight dependencies */
.b-highlight-predecessor {
    opacity: 0.7;
    border: 2px dashed orange;
}

.b-highlight-successor {
    opacity: 0.7;
    border: 2px dashed green;
}
```

## Common Patterns

### Pattern 1: Single Selection Mode

```typescript
const scheduler = new SchedulerPro({
    multiEventSelect: false,  // Default
    deselectOnClick: false,

    listeners: {
        eventSelectionChange({ selection }) {
            if (selection.length === 1) {
                showEventDetails(selection[0]);
            } else {
                hideEventDetails();
            }
        }
    }
});
```

### Pattern 2: Multi-Selection with Actions

```typescript
const scheduler = new SchedulerPro({
    multiEventSelect: true,

    listeners: {
        eventSelectionChange({ selection }) {
            // Enable/disable bulk action buttons
            deleteButton.disabled = selection.length === 0;
            moveButton.disabled = selection.length === 0;
            bulkEditButton.disabled = selection.length < 2;

            // Update selection count
            selectionLabel.text = `${selection.length} selected`;
        }
    }
});

// Bulk delete selected
function deleteSelected() {
    const toDelete = [...scheduler.selectedEvents];
    scheduler.eventStore.remove(toDelete);
}

// Bulk reschedule selected
function moveSelectedByDays(days) {
    scheduler.selectedEvents.forEach(event => {
        event.shift(days, 'day');
    });
}
```

### Pattern 3: Conditional Selection

```typescript
const scheduler = new SchedulerPro({
    isEventSelectable(eventRecord) {
        // Only allow selection of editable events
        if (eventRecord.readOnly) {
            return false;
        }

        // Only allow selection of events user owns
        if (eventRecord.ownerId !== currentUserId) {
            return false;
        }

        // Don't allow selection of completed events
        if (eventRecord.percentDone === 100) {
            return false;
        }

        return true;
    }
});
```

### Pattern 4: Selection Validation

```typescript
const scheduler = new SchedulerPro({
    multiEventSelect: true,

    listeners: {
        beforeEventSelectionChange({ action, selected }) {
            if (action === 'select') {
                // Limit selection to 10 events
                if (scheduler.selectedEvents.length + selected.length > 10) {
                    showWarning('Maximum 10 events can be selected');
                    return false;
                }

                // Only allow selecting events from same resource
                const resources = new Set([
                    ...scheduler.selectedEvents.map(e => e.resourceId),
                    ...selected.map(e => e.resourceId)
                ]);

                if (resources.size > 1) {
                    showWarning('Can only select events from one resource');
                    return false;
                }
            }

            return true;
        }
    }
});
```

### Pattern 5: External Selection Control

```typescript
// Select from external list/grid
externalList.on('selectionChange', ({ selected }) => {
    // Find matching events in scheduler
    const eventIds = selected.map(item => item.eventId);
    const events = scheduler.eventStore.getRange().filter(
        e => eventIds.includes(e.id)
    );

    // Update scheduler selection
    scheduler.selectedEvents = events;

    // Scroll to first selected
    if (events.length > 0) {
        scheduler.scrollEventIntoView(events[0]);
    }
});

// Sync scheduler selection to external component
scheduler.on('eventSelectionChange', ({ selection }) => {
    externalList.selectedRecords = selection.map(event =>
        externalList.store.getById(event.id)
    );
});
```

### Pattern 6: Selection with Keyboard Shortcuts

```typescript
const scheduler = new SchedulerPro({
    multiEventSelect: true,

    keyMap: {
        'Ctrl+A': 'selectAll',
        'Escape': 'deselectAll',
        'Delete': 'deleteSelected'
    },

    selectAll() {
        const allEvents = this.eventStore.getRange();
        this.selectedEvents = allEvents.filter(
            e => this.isEventSelectable(e)
        );
    },

    deselectAll() {
        this.clearEventSelection();
    },

    deleteSelected() {
        if (this.selectedEvents.length > 0) {
            this.eventStore.remove(this.selectedEvents);
        }
    }
});
```

### Pattern 7: Highlight Related Events

```typescript
const scheduler = new SchedulerPro({
    highlightPredecessors: true,
    highlightSuccessors: true,

    listeners: {
        eventSelectionChange({ selection }) {
            // Additionally highlight events from same project
            const projectIds = new Set(
                selection.map(e => e.projectId)
            );

            scheduler.eventStore.forEach(event => {
                const related = projectIds.has(event.projectId);
                event.cls = related ? 'related-event' : '';
            });

            // Trigger visual refresh
            scheduler.refreshRows();
        }
    }
});
```

### Pattern 8: Copy/Paste Selected Events

```typescript
let clipboard = [];

function copySelected() {
    clipboard = scheduler.selectedEvents.map(event => ({
        name: event.name,
        duration: event.duration,
        durationUnit: event.durationUnit,
        // Don't copy dates, will be set on paste
    }));
}

function pasteAtDate(targetDate, resourceRecord) {
    let currentDate = new Date(targetDate);

    const newEvents = clipboard.map(eventData => {
        const newEvent = {
            ...eventData,
            startDate: new Date(currentDate),
            resourceId: resourceRecord.id
        };

        // Offset next event
        currentDate = DateHelper.add(currentDate, eventData.duration, eventData.durationUnit);

        return newEvent;
    });

    scheduler.eventStore.add(newEvents);
}
```

## Integration with Other Features

### With EventDrag (Unified Drag)

```typescript
const scheduler = new SchedulerPro({
    multiEventSelect: true,

    features: {
        eventDrag: {
            // Drag all selected events together
            unifiedDrag: true
        }
    }
});
```

When `unifiedDrag` is enabled:
- Dragging one selected event moves all selected events
- Events maintain their relative positions

### With EventMenu

```typescript
const scheduler = new SchedulerPro({
    multiEventSelect: true,

    features: {
        eventMenu: {
            items: {
                deleteSelected: {
                    text: 'Delete Selected',
                    icon: 'b-fa b-fa-trash',
                    weight: 200,
                    onItem({ eventRecord }) {
                        const toDelete = scheduler.selectedEvents.length > 1
                            ? scheduler.selectedEvents
                            : [eventRecord];
                        scheduler.eventStore.remove(toDelete);
                    }
                }
            },

            processItems({ eventRecord, items }) {
                // Show multi-select actions only when multiple selected
                items.deleteSelected.hidden = scheduler.selectedEvents.length < 2;
            }
        }
    }
});
```

### With EventEdit

```typescript
const scheduler = new SchedulerPro({
    multiEventSelect: true,

    features: {
        eventEdit: {
            // Custom handling for multi-selection
        }
    },

    listeners: {
        beforeEventEdit({ eventRecord }) {
            // If multiple events selected, show bulk edit dialog
            if (scheduler.selectedEvents.length > 1) {
                showBulkEditDialog(scheduler.selectedEvents);
                return false;  // Prevent default editor
            }
        }
    }
});
```

## Performance Considerations

1. **Large Selections**: When selecting many events, batch operations:

```typescript
// Inefficient: Multiple selection changes trigger multiple redraws
events.forEach(e => scheduler.selectEvent(e, true));

// Efficient: Single batch update
scheduler.selectedEvents = [...scheduler.selectedEvents, ...events];
```

2. **Selection Change Handlers**: Keep handlers lightweight:

```typescript
// Debounce expensive operations
const updateUI = Core.helper.FunctionHelper.createBuffered(
    (selection) => {
        renderDetailPanel(selection);
        updateExternalComponents(selection);
    },
    100
);

scheduler.on('eventSelectionChange', ({ selection }) => {
    updateUI(selection);
});
```

3. **Conditional Rendering**: Only process visible selections:

```typescript
scheduler.on('eventSelectionChange', ({ selection }) => {
    // Only process visible events
    const visibleSelection = selection.filter(event =>
        scheduler.isInTimeAxis(event)
    );
    processSelection(visibleSelection);
});
```

## Integration Notes

1. **Single vs Multi-Assignment**: In single-assignment mode, selecting an event implicitly selects its single assignment. In multi-assignment mode, you work with assignments directly.

2. **Event vs Assignment Selection**: When an event is selected, all its assignments are selected. When an assignment is selected, only that specific occurrence is selected.

3. **Resource Navigation**: By default, selecting an event also selects its resource row. Control with `selectResourceOnEventNavigate`.

4. **Virtual Rendering**: Selection state is maintained independently of DOM rendering. Events scrolled out of view retain their selection state.

5. **Dataset Changes**: When the event store is reloaded, selection can be maintained if `maintainSelectionOnDatasetChange` is enabled and event IDs match.

6. **Undo/Redo**: Selection changes are not tracked by the STM (State Tracking Manager). Selection state is not restored on undo/redo.
