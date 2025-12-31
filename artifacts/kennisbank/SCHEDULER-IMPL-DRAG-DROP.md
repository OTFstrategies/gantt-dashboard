# SchedulerPro Implementation: Drag & Drop

> **Implementatie guide** voor drag & drop in Bryntum SchedulerPro: event dragging, resize, drag-create, external drag, en cross-resource moves.

---

## Overzicht

SchedulerPro biedt uitgebreide drag & drop functionaliteit:
- **EventDrag** - Verplaatsen van events in tijd en tussen resources
- **EventResize** - Aanpassen van event duration via resizing
- **EventDragCreate** - Nieuwe events creëren door te slepen
- **External Drag** - Events van externe grids naar scheduler slepen
- **Cross-Scheduler Drag** - Events tussen scheduler instances slepen

---

## 1. EventDrag Feature

### 1.1 Basic Configuration

```javascript
const scheduler = new SchedulerPro({
    features : {
        eventDrag : true          // Default: enabled
    }
});

// Disable
features : {
    eventDrag : false
}
```

### 1.2 Advanced Configuration

```javascript
features : {
    eventDrag : {
        // Copy instead of move
        copyKey        : 'CTRL',         // CTRL/ALT/SHIFT/META
        alwaysCopy     : false,
        copyMode       : 'auto',         // 'auto' | 'assignment' | 'event'

        // Constraints
        constrainDragToResource  : false, // Only horizontal
        constrainDragToTimeSlot  : false, // Only vertical
        constrainDragToTimeline  : true,  // Stay within scheduler

        // Snapping
        snapToResource      : true,       // Snap to resource rows
        showExactDropPosition: true,      // Show exact snap position

        // UI
        showTooltip    : true,
        singleDirection: false,           // Only one axis at a time

        // Non-working time
        allowNonWorkingTimeSNET : false
    }
}
```

### 1.3 Validation

```javascript
features : {
    eventDrag : {
        // Validate before drop
        validatorFn({ eventRecords, newResource, startDate, endDate }) {
            // Return true/false or { valid: boolean, message: string }
            if (newResource.type === 'machine' && !eventRecords[0].isMachineTask) {
                return {
                    valid   : false,
                    message : 'Cannot assign human task to machine'
                };
            }
            return true;
        }
    }
}
```

---

## 2. Drag Events

### 2.1 Event Lifecycle

```javascript
listeners : {
    // Before drag starts
    beforeEventDrag({ eventRecord, resourceRecord }) {
        // Return false to prevent
        if (eventRecord.locked) return false;
    },

    // Drag started
    eventDragStart({ eventRecords, context }) {
        console.log('Dragging:', eventRecords.map(e => e.name));
    },

    // During drag
    eventDrag({ eventRecords, startDate, endDate, newResource, context }) {
        console.log('Over:', newResource?.name, 'at', startDate);
    },

    // Before drop finalizes
    beforeEventDropFinalize({ context, eventRecords }) {
        // Async validation possible
        context.async = true;

        setTimeout(() => {
            if (confirm('Apply changes?')) {
                context.finalize(true);
            } else {
                context.finalize(false);
            }
        }, 100);
    },

    // After drop
    eventDrop({ eventRecords, targetEventRecord, resourceRecord }) {
        console.log('Dropped on:', resourceRecord.name);
    },

    // Drag aborted
    eventDragAbort({ eventRecord }) {
        console.log('Drag cancelled');
    }
}
```

### 2.2 Context Object

```javascript
beforeEventDropFinalize({ context }) {
    context.eventRecords;     // Events being dragged
    context.resourceRecord;   // Original resource
    context.newResource;      // Target resource
    context.startDate;        // New start date
    context.endDate;          // New end date
    context.valid;            // Is drop valid
    context.async;            // Set true for async
    context.finalize(true);   // Complete async
    context.finalize(false);  // Cancel async
}
```

---

## 3. EventResize Feature

### 3.1 Configuration

```javascript
features : {
    eventResize : true        // Default: enabled
}

// Advanced
features : {
    eventResize : {
        // Validation
        validatorFn({ eventRecord, startDate, endDate, resourceRecord }) {
            // Min duration check
            const duration = endDate - startDate;
            if (duration < 3600000) { // 1 hour in ms
                return {
                    valid   : false,
                    message : 'Minimum 1 hour required'
                };
            }
            return true;
        },

        // UI
        showTooltip    : true,
        showExactResizePosition : true,

        // Resize handles position
        leftHandle : true,
        rightHandle : true
    }
}
```

### 3.2 Resize Events

```javascript
listeners : {
    // Before resize starts
    beforeEventResize({ eventRecord, resourceRecord }) {
        return !eventRecord.locked;
    },

    // Resize started
    eventResizeStart({ eventRecord, context }) {
        console.log('Resizing:', eventRecord.name);
    },

    // During resize
    eventPartialResize({ eventRecord, startDate, endDate, context }) {
        console.log('Duration:', endDate - startDate);
    },

    // Before resize finalizes
    beforeEventResizeFinalize({ context }) {
        // Async possible
        context.async = true;
        // ...
        context.finalize(true);
    },

    // After resize
    eventResizeEnd({ eventRecord, wasChanged }) {
        if (wasChanged) {
            console.log('New duration:', eventRecord.duration);
        }
    }
}
```

### 3.3 Per-Event Resizable

```javascript
// In event data
{
    id        : 1,
    name      : 'Fixed Event',
    resizable : false        // Cannot resize
}

{
    id        : 2,
    name      : 'Start Only',
    resizable : 'start'      // Only resize from start
}

{
    id        : 3,
    name      : 'End Only',
    resizable : 'end'        // Only resize from end
}
```

---

## 4. EventDragCreate Feature

### 4.1 Configuration

```javascript
features : {
    eventDragCreate : true    // Default: enabled
}

// Advanced
features : {
    eventDragCreate : {
        // Validation
        validatorFn({ resourceRecord, startDate, endDate }) {
            // Check if resource accepts new events
            if (resourceRecord.isFull) {
                return {
                    valid   : false,
                    message : 'Resource is full'
                };
            }
            return true;
        },

        // UI
        showTooltip : true,

        // Double-click behavior
        disabled : false
    }
}
```

### 4.2 DragCreate Events

```javascript
listeners : {
    // Before create starts
    beforeDragCreate({ resourceRecord, date }) {
        return !resourceRecord.readOnly;
    },

    // Create started
    dragCreateStart({ resourceRecord, context }) {
        console.log('Creating on:', resourceRecord.name);
    },

    // During create
    dragCreate({ resourceRecord, startDate, endDate, context }) {
        console.log('Duration:', endDate - startDate);
    },

    // Before finalize
    beforeDragCreateFinalize({ context, resourceRecord, eventRecord }) {
        // eventRecord is the new event
        eventRecord.name = 'New Event';
    },

    // After create
    dragCreateEnd({ eventRecord, resourceRecord }) {
        console.log('Created:', eventRecord.name);
    },

    // Create cancelled
    afterDragCreate({ eventRecord }) {
        // Event was created but may be invalid
    }
}
```

---

## 5. External Drag (Grid to Scheduler)

### 5.1 Custom DragHelper

```javascript
import { DragHelper, StringHelper } from '@bryntum/schedulerpro';

class ExternalDrag extends DragHelper {
    static configurable = {
        cloneTarget          : true,
        autoSizeClonedTarget : false,
        dropTargetSelector   : '.b-timeline-sub-grid',
        targetSelector       : '.b-grid-row:not(.b-group-row)'
    };

    afterConstruct() {
        // Use scheduler's scroll manager
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(element) {
        const
            { schedule } = this,
            record       = this.grid.getRecordFromElement(element),
            proxy        = document.createElement('div'),
            width        = schedule.timeAxisViewModel.getDistanceForDuration(record.durationMS);

        proxy.classList.add('b-sch-event-wrap', 'b-unassigned-class');
        proxy.innerHTML = `<div class="b-sch-event">${record.name}</div>`;
        proxy.style.width = `${width}px`;
        proxy.style.height = `${schedule.rowHeight - 10}px`;

        return proxy;
    }

    onDragStart({ context }) {
        const record = this.grid.getRecordFromElement(context.grabbed);
        context.record = record;

        // Enable edge scrolling
        this.schedule.enableScrollingCloseToEdges(this.schedule.timeAxisSubGrid);

        // Disable tooltips
        this.schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ context }) {
        const
            { schedule }   = this,
            startDate      = schedule.getDateFromCoordinate(context.newX, 'round', false),
            resource       = schedule.resolveResourceRecord(context.target);

        // Validate drop
        context.valid = Boolean(startDate && resource);
        context.startDate = startDate;
        context.resource = resource;
    }

    async onDrop({ context }) {
        const { schedule } = this;

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        if (context.valid) {
            // Transfer to scheduler
            await schedule.scheduleEvent({
                eventRecord    : context.record,
                startDate      : context.startDate,
                resourceRecord : context.resource
            });
        }

        schedule.features.eventTooltip.disabled = false;
    }
}
```

### 5.2 Unplanned Grid Setup

```javascript
// Grid showing unassigned events
class UnplannedGrid extends Grid {
    set project(project) {
        // Chain the event store, filtered to unassigned only
        this.store = project.eventStore.chain(
            event => !event.assignments.length
        );

        // Update when assignments change
        project.assignmentStore.on({
            change : () => this.store.fillFromMaster(),
            thisObj : this
        });
    }
}

// Setup
const unplannedGrid = new UnplannedGrid({
    appendTo : 'unplanned-container',
    project  : scheduler.project,
    columns  : [
        { text: 'Name', field: 'name', flex: 1 },
        { text: 'Duration', field: 'duration', width: 80 }
    ]
});

// Create drag helper
new ExternalDrag({
    grid         : unplannedGrid,
    schedule     : scheduler,
    outerElement : unplannedGrid.element
});
```

---

## 6. scheduleEvent Method

### 6.1 API

```javascript
// Schedule an unassigned event
await scheduler.scheduleEvent({
    eventRecord    : eventModel,
    startDate      : new Date(2024, 0, 15, 9, 0),
    resourceRecord : resourceModel
});

// With element adoption
await scheduler.scheduleEvent({
    eventRecord    : eventModel,
    startDate      : date,
    resourceRecord : resource,
    element        : proxyElement    // Animate from proxy
});
```

---

## 7. Drag Between Schedulers

### 7.1 Configuration

```javascript
const scheduler1 = new SchedulerPro({
    features : {
        eventDrag : {
            constrainDragToTimeline : false  // Allow external drop
        }
    }
});

const scheduler2 = new SchedulerPro({
    features : {
        eventDrag : {
            constrainDragToTimeline : false,
            externalDropTargetSelector : `#${scheduler1.id} .b-timeline-sub-grid`
        }
    }
});
```

### 7.2 Cross-Scheduler Drop

```javascript
// Scheduler 1
scheduler1.on({
    eventDrop({ eventRecords, externalDropTarget }) {
        if (externalDropTarget) {
            // Dropped on another scheduler
            const targetScheduler = Widget.fromElement(externalDropTarget);
            // Handle transfer...
        }
    }
});
```

---

## 8. Snap Configuration

### 8.1 Time Snap

```javascript
const scheduler = new SchedulerPro({
    snap      : true,        // Enable snapping
    snapRelativeToEventStartDate : true,

    // Custom snap resolution
    timeResolution : {
        unit      : 'minute',
        increment : 15         // Snap to 15 min
    }
});
```

### 8.2 Custom Snap Position

```javascript
features : {
    eventDrag : {
        snapToPosition({ assignmentRecord, eventRecord, startDate, snapTo }) {
            // Custom snap logic
            const hour = startDate.getHours();

            // Snap to work hours only
            if (hour < 9) {
                snapTo.x = scheduler.getCoordinateFromDate(
                    new Date(startDate.setHours(9, 0, 0, 0))
                );
            }
        }
    }
}
```

---

## 9. Drag Validation Patterns

### 9.1 Working Time Check

```javascript
features : {
    eventDrag : {
        validatorFn({ eventRecords, newResource, startDate, endDate }) {
            const calendar = newResource.effectiveCalendar;

            if (!calendar.isWorkingTime(startDate, endDate, true)) {
                return {
                    valid   : false,
                    message : 'Cannot schedule outside working hours'
                };
            }
            return true;
        }
    }
}
```

### 9.2 Overlap Check

```javascript
features : {
    eventDrag : {
        validatorFn({ eventRecords, newResource, startDate, endDate }) {
            // Check for overlaps
            if (!scheduler.isDateRangeAvailable(startDate, endDate, eventRecords[0], newResource)) {
                return {
                    valid   : false,
                    message : 'Time slot already occupied'
                };
            }
            return true;
        }
    }
}
```

### 9.3 Resource Capacity Check

```javascript
features : {
    eventDrag : {
        validatorFn({ eventRecords, newResource }) {
            const event = eventRecords[0];

            // Custom capacity check
            if (event.participants > newResource.capacity) {
                return {
                    valid   : false,
                    message : `Room capacity (${newResource.capacity}) insufficient`
                };
            }
            return true;
        }
    }
}
```

---

## 10. Async Finalization

### 10.1 Server Validation

```javascript
listeners : {
    async beforeEventDropFinalize({ context }) {
        context.async = true;

        try {
            // Validate with server
            const response = await fetch('/api/validate-drop', {
                method : 'POST',
                body   : JSON.stringify({
                    eventId    : context.eventRecords[0].id,
                    resourceId : context.newResource.id,
                    startDate  : context.startDate
                })
            });

            const result = await response.json();

            if (result.valid) {
                context.finalize(true);
            } else {
                Toast.show(result.message);
                context.finalize(false);
            }
        } catch (error) {
            context.finalize(false);
        }
    }
}
```

### 10.2 Confirmation Dialog

```javascript
listeners : {
    beforeEventDropFinalize({ context }) {
        context.async = true;

        MessageDialog.confirm({
            title   : 'Confirm Move',
            message : `Move ${context.eventRecords[0].name} to ${context.newResource.name}?`
        }).then(result => {
            context.finalize(result === MessageDialog.yesButton);
        });
    }
}
```

---

## 11. TypeScript Interfaces

```typescript
import { EventDrag, EventResize, DragHelper } from '@bryntum/schedulerpro';

// EventDrag Config
interface EventDragConfig {
    disabled?: boolean;
    constrainDragToResource?: boolean;
    constrainDragToTimeSlot?: boolean;
    constrainDragToTimeline?: boolean;
    copyKey?: 'CTRL' | 'ALT' | 'SHIFT' | 'META' | '';
    copyMode?: 'auto' | 'assignment' | 'event';
    alwaysCopy?: boolean;
    showTooltip?: boolean;
    showExactDropPosition?: boolean;
    snapToResource?: boolean | { threshold: number };
    singleDirection?: boolean;
    externalDropTargetSelector?: string;

    validatorFn?: (context: DragValidatorContext) => boolean | DragValidatorResult;
    snapToPosition?: (context: SnapContext) => void;
}

// Validator Context
interface DragValidatorContext {
    eventRecords: EventModel[];
    newResource: ResourceModel;
    startDate: Date;
    endDate: Date;
}

// Validator Result
interface DragValidatorResult {
    valid: boolean;
    message?: string;
}

// EventResize Config
interface EventResizeConfig {
    disabled?: boolean;
    showTooltip?: boolean;
    showExactResizePosition?: boolean;
    leftHandle?: boolean;
    rightHandle?: boolean;

    validatorFn?: (context: ResizeValidatorContext) => boolean | DragValidatorResult;
}

// DragCreate Config
interface EventDragCreateConfig {
    disabled?: boolean;
    showTooltip?: boolean;

    validatorFn?: (context: DragCreateValidatorContext) => boolean | DragValidatorResult;
}

// Drop Context
interface DropContext {
    eventRecords: EventModel[];
    resourceRecord: ResourceModel;
    newResource: ResourceModel;
    startDate: Date;
    endDate: Date;
    valid: boolean;
    async: boolean;
    finalize: (success: boolean) => void;
}
```

---

## 12. Complete Example

```javascript
import { SchedulerPro, DragHelper, Grid, Splitter, StringHelper } from '@bryntum/schedulerpro';

// External drag helper
class TaskDrag extends DragHelper {
    static configurable = {
        cloneTarget        : true,
        dropTargetSelector : '.b-timeline-sub-grid',
        targetSelector     : '.b-grid-row'
    };

    afterConstruct() {
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(element) {
        const
            task  = this.grid.getRecordFromElement(element),
            proxy = document.createElement('div'),
            width = this.schedule.timeAxisViewModel.getDistanceForDuration(task.durationMS);

        proxy.classList.add('b-sch-event-wrap', 'b-sch-style-rounded');
        proxy.innerHTML = StringHelper.xss`<div class="b-sch-event">${task.name}</div>`;
        proxy.style.width = `${width}px`;
        proxy.style.height = '30px';

        return proxy;
    }

    onDragStart({ context }) {
        context.task = this.grid.getRecordFromElement(context.grabbed);
        this.schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ context }) {
        const
            { schedule } = this,
            startDate    = schedule.getDateFromCoordinate(context.newX, 'round'),
            resource     = schedule.resolveResourceRecord(context.target);

        context.valid = Boolean(startDate && resource);
        context.startDate = startDate;
        context.resource = resource;
    }

    async onDrop({ context }) {
        if (context.valid) {
            await this.schedule.scheduleEvent({
                eventRecord    : context.task,
                startDate      : context.startDate,
                resourceRecord : context.resource
            });
        }
        this.schedule.features.eventTooltip.disabled = false;
    }
}

// Scheduler with drag features
const scheduler = new SchedulerPro({
    appendTo  : 'scheduler',
    flex      : 1,
    startDate : new Date(2024, 0, 1),
    endDate   : new Date(2024, 0, 14),

    features : {
        eventDrag : {
            constrainDragToTimeline : true,

            validatorFn({ eventRecords, newResource, startDate, endDate }) {
                // Working hours only
                const hour = startDate.getHours();
                if (hour < 9 || hour >= 17) {
                    return { valid: false, message: 'Working hours only (9-17)' };
                }

                // Capacity check
                const event = eventRecords[0];
                if (event.participants && event.participants > newResource.capacity) {
                    return { valid: false, message: 'Insufficient capacity' };
                }

                return true;
            }
        },

        eventResize : {
            validatorFn({ startDate, endDate }) {
                const durationHours = (endDate - startDate) / 3600000;
                if (durationHours < 0.5) {
                    return { valid: false, message: 'Minimum 30 minutes' };
                }
                return true;
            }
        },

        eventDragCreate : {
            validatorFn({ resourceRecord }) {
                return !resourceRecord.readOnly;
            }
        }
    },

    project : {
        resources : [
            { id: 1, name: 'Room A', capacity: 20 },
            { id: 2, name: 'Room B', capacity: 50 }
        ],
        events : [
            { id: 1, name: 'Meeting', startDate: '2024-01-02', duration: 2 }
        ],
        assignments : [
            { id: 1, eventId: 1, resourceId: 1 }
        ]
    },

    columns : [
        { type: 'resourceInfo', text: 'Room', width: 150 }
    ],

    listeners : {
        beforeEventDropFinalize({ context }) {
            // Async confirmation
            context.async = true;

            if (confirm(`Move to ${context.newResource.name}?`)) {
                context.finalize(true);
            } else {
                context.finalize(false);
            }
        },

        eventDrop({ eventRecords, resourceRecord }) {
            console.log(`Moved ${eventRecords[0].name} to ${resourceRecord.name}`);
        }
    }
});

// Unplanned tasks grid
const unplannedGrid = new Grid({
    appendTo : 'unplanned',
    flex     : '0 0 250px',
    store    : scheduler.project.eventStore.chain(e => !e.assignments.length),

    columns : [
        { text: 'Unplanned Tasks', field: 'name', flex: 1 }
    ]
});

// Splitter
new Splitter({ appendTo: 'container' });

// External drag
new TaskDrag({
    grid         : unplannedGrid,
    schedule     : scheduler,
    outerElement : unplannedGrid.element
});
```

---

## Referenties

- Examples: `schedulerpro-7.1.0-trial/examples/drag-from-grid/`
- Examples: `schedulerpro-7.1.0-trial/examples/drag-unplanned-tasks/`
- Examples: `schedulerpro-7.1.0-trial/examples/drag-batches/`
- TypeScript: `schedulerpro.d.ts` lines 184716+ (EventDrag)
- TypeScript: `schedulerpro.d.ts` lines 186837+ (EventResize)
- TypeScript: `schedulerpro.d.ts` lines 185128+ (EventDragCreate)

---

*Document gegenereerd: December 2024*
*Bryntum SchedulerPro versie: 7.1.0*
