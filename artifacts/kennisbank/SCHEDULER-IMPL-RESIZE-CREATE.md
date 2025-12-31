# SchedulerPro Implementation: Event Resize, Drag & Create

## Overview

SchedulerPro provides comprehensive event manipulation features:
- **EventDrag**: Drag and drop events to new times/resources
- **EventResize**: Resize events by dragging handles
- **EventDragCreate**: Create events by dragging on empty schedule
- **EventDragSelect**: Select multiple events by dragging
- **EventEdit**: Modal editor for event details
- **SimpleEventEdit**: Inline text editing

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 Event Manipulation Features                      │
├─────────────────────────────────────────────────────────────────┤
│  EventDrag                                                       │
│  ├── Drag events to new date/time                               │
│  ├── Drag events to new resource                                │
│  ├── Multi-event drag support                                   │
│  └── Unified drag for multi-assignment                          │
├─────────────────────────────────────────────────────────────────┤
│  EventResize                                                     │
│  ├── Resize start (left/top handle)                             │
│  ├── Resize end (right/bottom handle)                           │
│  ├── Dynamic handle sizing                                       │
│  └── Multi-event resize                                         │
├─────────────────────────────────────────────────────────────────┤
│  EventDragCreate                                                 │
│  ├── Drag to create new event                                   │
│  ├── Auto-open editor on create                                 │
│  └── Resource-aware creation                                    │
├─────────────────────────────────────────────────────────────────┤
│  Editing Features                                                │
│  ├── EventEdit - Modal popup editor                             │
│  └── SimpleEventEdit - Inline text editing                      │
└─────────────────────────────────────────────────────────────────┘
```

## EventDrag Feature

### Basic Configuration

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    features: {
        eventDrag: {
            // Allow dragging to non-working time
            allowNonWorkingTimeSNET: false,

            // Snap to time resolution
            snapToPosition: true,

            // Snap to resource rows
            snapToResource: true,

            // Drag all selected events together
            unifiedDrag: true,

            // Custom tooltip during drag
            showTooltip: true,

            // Custom tooltip template
            tooltipTemplate({ eventRecord, startDate, endDate }) {
                return `
                    <div class="drag-tooltip">
                        <strong>${eventRecord.name}</strong>
                        <div>${DateHelper.format(startDate, 'MMM D HH:mm')}</div>
                        <div>to ${DateHelper.format(endDate, 'HH:mm')}</div>
                    </div>
                `;
            }
        }
    }
});
```

### Drag Validation

```javascript
features: {
    eventDrag: {
        // Custom validation function
        validatorFn({ draggedRecords, newResource, startDate, endDate }) {
            // Check resource capacity
            const existingEvents = scheduler.eventStore.getEventsForResource(newResource);
            const overlapping = existingEvents.filter(e =>
                e.startDate < endDate && e.endDate > startDate
            );

            if (overlapping.length > 0) {
                return {
                    valid: false,
                    message: 'Resource already has events at this time'
                };
            }

            // Check working hours
            if (!isWithinWorkingHours(startDate, endDate)) {
                return {
                    valid: false,
                    message: 'Cannot schedule outside working hours'
                };
            }

            return { valid: true };
        }
    }
}
```

### Drag Events

```javascript
scheduler.on({
    // Before drag starts
    beforeEventDrag({ eventRecord, resourceRecord }) {
        // Return false to prevent drag
        if (eventRecord.locked) {
            return false;
        }
    },

    // During drag
    eventDrag({ context, event }) {
        // context contains current drag state
        console.log('Dragging to:', context.startDate);
    },

    // After successful drop
    eventDrop({ eventRecords, targetResourceRecord, valid }) {
        if (valid) {
            console.log('Dropped events:', eventRecords.map(e => e.name));
        }
    },

    // Drag cancelled
    dragAbort() {
        console.log('Drag was cancelled');
    }
});
```

## EventResize Feature

### Basic Configuration

```javascript
features: {
    eventResize: {
        // Show resize handles
        leftHandle: true,      // Horizontal mode
        rightHandle: true,     // Horizontal mode
        topHandle: true,       // Vertical mode
        bottomHandle: true,    // Vertical mode

        // Allow resize to zero duration
        allowResizeToZero: false,

        // Show exact position during resize
        showExactResizePosition: true,

        // Show tooltip during resize
        showTooltip: true,

        // Resize all selected events
        resizeSelected: true,

        // Lock layout during resize (better performance)
        lockLayout: true,

        // Dynamic handle sizing
        dynamicHandleSize: true,
        reservedSpace: 10,

        // Drag threshold in pixels
        dragThreshold: 5,

        // Touch delay
        dragTouchStartDelay: 300
    }
}
```

### Resize Tooltip Template

```javascript
features: {
    eventResize: {
        // Custom tooltip template
        tooltipTemplate({ record, startDate, endDate, startClockHtml, endClockHtml }) {
            const duration = DateHelper.diff(startDate, endDate, 'hours');
            return `
                <div class="resize-tooltip">
                    <div class="event-name">${record.name}</div>
                    <div class="time-range">
                        ${startClockHtml} - ${endClockHtml}
                    </div>
                    <div class="duration">${duration} hours</div>
                </div>
            `;
        }
    }
}
```

### Resize Validation

```javascript
features: {
    eventResize: {
        // Custom validation
        validatorFn({ record, startDate, endDate, originalStartDate, originalEndDate }, event) {
            // Minimum duration check
            const duration = DateHelper.diff(startDate, endDate, 'hours');
            if (duration < 1) {
                return false;  // Minimum 1 hour
            }

            // Maximum duration check
            if (duration > 8) {
                return false;  // Maximum 8 hours
            }

            // Check for conflicts
            const conflicts = checkConflicts(record, startDate, endDate);
            return !conflicts;
        }
    }
}
```

### Resize Events

```javascript
scheduler.on({
    // Before resize starts
    beforeEventResize({ eventRecord }) {
        if (eventRecord.readonly) {
            return false;
        }
    },

    // During resize
    eventResizing({ eventRecord, startDate, endDate }) {
        // Update UI preview
        updateDurationPreview(startDate, endDate);
    },

    // After resize
    eventResize({ eventRecord, startDate, endDate }) {
        console.log(`Resized ${eventRecord.name} to ${startDate} - ${endDate}`);
    },

    // Resize cancelled
    eventResizeAbort({ eventRecord }) {
        console.log('Resize cancelled');
    }
});
```

## EventDragCreate Feature

### Basic Configuration

```javascript
features: {
    eventDragCreate: {
        // Disable if using EventEdit instead
        disabled: false,

        // Lock layout during create
        lockLayout: true,

        // Create for selected events too
        resizeSelected: false,

        // Default values for new events
        defaults: {
            duration: 1,
            durationUnit: 'hour'
        }
    }
}
```

### Create Events

```javascript
scheduler.on({
    // Before creation starts
    beforeDragCreate({ resourceRecord, date }) {
        // Check if resource can accept new events
        if (resourceRecord.readonly) {
            return false;
        }
    },

    // After creation
    dragCreateEnd({ newEventRecord, resourceRecord, event }) {
        console.log('Created:', newEventRecord);

        // Auto-open editor
        if (scheduler.features.eventEdit) {
            scheduler.editEvent(newEventRecord);
        }
    },

    // Creation cancelled
    dragCreateAbort() {
        console.log('Create cancelled');
    }
});
```

## EventDragSelect Feature

Select multiple events by dragging a rectangle.

```javascript
features: {
    eventDragSelect: {
        // Enable selection by dragging
        disabled: false,

        // Include nested events (in tree)
        includeNested: true
    }
}

scheduler.on({
    // Selection change from drag
    eventSelectionChange({ action, selected, deselected }) {
        if (action === 'select') {
            console.log('Drag selected:', selected.map(e => e.name));
        }
    }
});
```

## EventEdit Feature

Modal popup editor for events.

### Basic Configuration

```javascript
features: {
    eventEdit: {
        // Continue editing when clicking another event
        continueEditingOnEventClick: false,

        // Minimum size to edit (smaller events skip edit)
        minEditSize: 10,

        // Read-only mode
        readOnly: false,

        // Type field for polymorphic events
        typeField: 'eventType',

        // Use contextual recurrence rules
        useContextualRecurrenceRules: true,

        // Custom editor config
        editorConfig: {
            title: 'Edit Event',
            width: 450,
            height: 600
        },

        // Customize items
        items: {
            nameField: {
                label: 'Event Title',
                required: true
            },
            resourceField: {
                label: 'Assigned To'
            },
            startDateField: {
                label: 'Start'
            },
            endDateField: {
                label: 'End'
            },
            // Add custom fields
            notesField: {
                type: 'textarea',
                label: 'Notes',
                name: 'notes',
                weight: 500
            },
            priorityField: {
                type: 'combo',
                label: 'Priority',
                name: 'priority',
                items: ['Low', 'Medium', 'High'],
                weight: 400
            }
        }
    }
}
```

### Edit Events

```javascript
scheduler.on({
    // Before editor opens
    beforeEventEdit({ eventRecord }) {
        if (eventRecord.readonly) {
            return false;
        }
    },

    // Editor opened
    eventEditShow({ eventRecord, editor }) {
        console.log('Editing:', eventRecord.name);
    },

    // Before save
    beforeEventSave({ eventRecord, values }) {
        // Validate values
        if (!values.name) {
            Toast.show('Name is required');
            return false;
        }
    },

    // After save
    eventEditSave({ eventRecord }) {
        console.log('Saved:', eventRecord.name);
    },

    // Editor closed
    eventEditHide() {
        console.log('Editor closed');
    }
});

// Programmatic editing
scheduler.editEvent(eventRecord);
scheduler.editEvent(eventRecord, resourceRecord);
```

## SimpleEventEdit Feature

Inline text editing for quick edits.

```javascript
features: {
    // Use simple edit instead of full editor
    eventEdit: false,
    simpleEventEdit: {
        // Field to edit
        field: 'name',

        // Trigger key (default: Enter on selected event)
        triggerKey: 'Enter'
    }
}

scheduler.on({
    // Edit started
    simpleEventEditStart({ eventRecord, inputField }) {
        console.log('Editing:', eventRecord.name);
    },

    // Edit completed
    simpleEventEditEnd({ eventRecord, newValue, oldValue }) {
        console.log(`Changed from "${oldValue}" to "${newValue}"`);
    },

    // Edit cancelled
    simpleEventEditCancel({ eventRecord }) {
        console.log('Edit cancelled');
    }
});
```

## Complete Example

```javascript
import { SchedulerPro, DateHelper, Toast } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    features: {
        // Event dragging
        eventDrag: {
            snapToPosition: true,
            unifiedDrag: true,
            showTooltip: true,

            tooltipTemplate({ eventRecord, startDate, endDate }) {
                return `
                    <div class="drag-info">
                        <strong>${eventRecord.name}</strong>
                        <div>${DateHelper.format(startDate, 'MMM D HH:mm')} -
                             ${DateHelper.format(endDate, 'HH:mm')}</div>
                    </div>
                `;
            },

            validatorFn({ draggedRecords, newResource, startDate, endDate }) {
                // Check resource availability
                for (const record of draggedRecords) {
                    if (!isResourceAvailable(newResource, startDate, endDate, record)) {
                        return {
                            valid: false,
                            message: 'Resource not available'
                        };
                    }
                }
                return { valid: true };
            }
        },

        // Event resizing
        eventResize: {
            showTooltip: true,
            showExactResizePosition: true,
            resizeSelected: true,
            lockLayout: true,
            dynamicHandleSize: true,

            tooltipTemplate({ record, startDate, endDate }) {
                const hours = DateHelper.diff(startDate, endDate, 'hours');
                return `
                    <div class="resize-info">
                        <div>${record.name}</div>
                        <div>${hours.toFixed(1)} hours</div>
                    </div>
                `;
            },

            validatorFn({ record, startDate, endDate }) {
                const hours = DateHelper.diff(startDate, endDate, 'hours');
                return hours >= 0.5 && hours <= 12;  // 30 min to 12 hours
            }
        },

        // Drag to create
        eventDragCreate: {
            lockLayout: true
        },

        // Event editing
        eventEdit: {
            items: {
                nameField: {
                    label: 'Title',
                    required: true
                },
                resourceField: {
                    label: 'Resource'
                },
                startDateField: {
                    label: 'Start',
                    format: 'YYYY-MM-DD HH:mm'
                },
                endDateField: {
                    label: 'End',
                    format: 'YYYY-MM-DD HH:mm'
                },
                // Custom fields
                priorityField: {
                    type: 'combo',
                    label: 'Priority',
                    name: 'priority',
                    items: [
                        { value: 1, text: 'Low' },
                        { value: 2, text: 'Medium' },
                        { value: 3, text: 'High' }
                    ],
                    weight: 400
                },
                descriptionField: {
                    type: 'textarea',
                    label: 'Description',
                    name: 'description',
                    weight: 500
                }
            },

            editorConfig: {
                width: 400
            }
        },

        // Drag selection
        eventDragSelect: true
    },

    listeners: {
        // Drag events
        beforeEventDrag({ eventRecord }) {
            if (eventRecord.locked) {
                Toast.show('This event is locked');
                return false;
            }
        },

        eventDrop({ eventRecords, targetResourceRecord }) {
            Toast.show(`Moved ${eventRecords.length} event(s)`);
        },

        // Resize events
        beforeEventResize({ eventRecord }) {
            if (eventRecord.fixed) {
                Toast.show('Fixed duration event cannot be resized');
                return false;
            }
        },

        eventResize({ eventRecord }) {
            Toast.show(`Resized: ${eventRecord.name}`);
        },

        // Create events
        dragCreateEnd({ newEventRecord }) {
            // Auto-open editor for new events
            scheduler.editEvent(newEventRecord);
        },

        // Edit events
        beforeEventSave({ eventRecord, values }) {
            if (!values.name?.trim()) {
                Toast.show('Event name is required');
                return false;
            }
        },

        eventEditSave({ eventRecord }) {
            Toast.show(`Saved: ${eventRecord.name}`);
        }
    },

    tbar: [
        {
            type: 'button',
            text: 'Lock Selected',
            icon: 'b-icon b-icon-lock',
            onClick() {
                scheduler.selectedEvents.forEach(e => {
                    e.locked = true;
                });
            }
        },
        {
            type: 'button',
            text: 'Unlock Selected',
            icon: 'b-icon b-icon-unlock',
            onClick() {
                scheduler.selectedEvents.forEach(e => {
                    e.locked = false;
                });
            }
        },
        '|',
        {
            type: 'button',
            text: 'Delete Selected',
            icon: 'b-icon b-icon-trash',
            onClick() {
                scheduler.selectedEvents.forEach(e => e.remove());
            }
        }
    ]
});

// Helper: Check resource availability
function isResourceAvailable(resource, startDate, endDate, excludeRecord = null) {
    const events = scheduler.eventStore.getEventsForResource(resource);

    for (const event of events) {
        if (excludeRecord && event === excludeRecord) continue;

        if (event.startDate < endDate && event.endDate > startDate) {
            return false;
        }
    }
    return true;
}

// Programmatic event creation
function createEvent(resourceId, startDate, duration = 1) {
    const event = scheduler.eventStore.add({
        name: 'New Event',
        resourceId,
        startDate,
        duration,
        durationUnit: 'hour'
    })[0];

    scheduler.editEvent(event);
    return event;
}

// Programmatic resize
function resizeEvent(eventRecord, newEndDate) {
    eventRecord.endDate = newEndDate;
}

// Programmatic move
function moveEvent(eventRecord, newStartDate, newResourceId) {
    eventRecord.startDate = newStartDate;
    if (newResourceId) {
        eventRecord.resourceId = newResourceId;
    }
}
```

## CSS for Drag/Resize

```css
/* Drag proxy styling */
.b-sch-event.b-dragging {
    opacity: 0.7;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: scale(1.02);
}

.b-sch-event.b-dragging-invalid {
    background-color: #ff4444 !important;
}

/* Resize handles */
.b-sch-event .b-resize-handle {
    position: absolute;
    width: 8px;
    height: 100%;
    cursor: ew-resize;
    background: transparent;
}

.b-sch-event .b-resize-handle-start {
    left: 0;
}

.b-sch-event .b-resize-handle-end {
    right: 0;
}

.b-sch-event:hover .b-resize-handle {
    background: rgba(255, 255, 255, 0.3);
}

/* Drag create preview */
.b-sch-dragcreator-proxy {
    background-color: rgba(0, 123, 255, 0.4);
    border: 2px dashed #007bff;
    border-radius: 4px;
}

/* Tooltips */
.drag-info,
.resize-info {
    padding: 8px 12px;
    font-size: 12px;
}

.drag-info strong,
.resize-info strong {
    display: block;
    margin-bottom: 4px;
}

/* Locked events */
.b-sch-event.b-locked {
    opacity: 0.6;
    cursor: not-allowed;
}

.b-sch-event.b-locked::after {
    content: '🔒';
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 10px;
}

/* Selection rectangle */
.b-drag-select-rect {
    background: rgba(0, 123, 255, 0.2);
    border: 1px solid #007bff;
}
```

## Best Practices

1. **Validate Operations**: Always validate drag/resize in validatorFn
2. **Show Feedback**: Use tooltips to show current state during drag
3. **Handle Conflicts**: Check for overlaps and resource availability
4. **Lock Layout**: Enable lockLayout for better performance
5. **Multi-Select**: Support unified drag/resize for selected events
6. **Undo Support**: Ensure STM captures drag/resize for undo
7. **Touch Support**: Configure appropriate touch delays
8. **Visual Feedback**: Style drag proxies and invalid states

## API Reference Links

- [EventDrag Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/EventDrag)
- [EventResize Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/EventResize)
- [EventDragCreate Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/EventDragCreate)
- [EventDragSelect Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/EventDragSelect)
- [EventEdit Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/EventEdit)
- [SimpleEventEdit Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/SimpleEventEdit)
- [EventDropData Type](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/EventDrag#typedef-EventDropData)
- [EventResizeData Type](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/EventResize#typedef-EventResizeData)
