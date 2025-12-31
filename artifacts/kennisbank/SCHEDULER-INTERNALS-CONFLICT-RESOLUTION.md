# SchedulerPro Internals: Conflict Resolution & Overlap Handling

## Overview

SchedulerPro provides comprehensive conflict resolution mechanisms for handling overlapping events, validating drag/drop operations, and enforcing scheduling constraints. This document covers the internal systems for detecting and resolving conflicts.

## Overlap Prevention

### Global allowOverlap Setting

The primary control for event overlap at the scheduler level.

```typescript
const scheduler = new SchedulerPro({
    // Prevent any events from overlapping on any resource
    allowOverlap: false,  // Default: true

    // When false:
    // - Drag operations validate for overlap
    // - Paste operations check availability
    // - Event creation validates time slots
});
```

**Behavior when `allowOverlap: false`:**
- Drag operations are blocked if target time conflicts with existing events
- Paste operations trigger `pasteNotAllowed` event with `reason: 'overlappingEvents'`
- EventDragCreate validates slot availability

### Per-Resource allowOverlap

Override overlap behavior for specific resources.

```typescript
// Model definition
export class SchedulerResourceModel extends GridRowModel {
    // Set to false to prevent overlapping events for THIS resource only
    allowOverlap: boolean  // Overrides scheduler.allowOverlap for this resource
}

// Configuration
resourceStore.add({
    id: 'room-1',
    name: 'Conference Room A',
    allowOverlap: false  // This room cannot have overlapping bookings
});
```

**Use Cases:**
- Meeting rooms that cannot have concurrent bookings
- Unique equipment that cannot be double-booked
- Mix of shared and exclusive resources

## Date Range Availability Check

### isDateRangeAvailable Method

Programmatically check if a time slot is available.

```typescript
// Method signature
isDateRangeAvailable(
    startDate: Date,
    endDate: Date,
    excludeEvent: SchedulerEventModel | SchedulerEventModel[] | null,
    resourceRecord: SchedulerResourceModel | SchedulerResourceModel[],
    allowOverlap?: boolean  // Override scheduler's allowOverlap
): boolean

// Usage examples
const scheduler = new SchedulerPro({ ... });

// Check if slot is free (excluding current event during drag)
const isAvailable = scheduler.isDateRangeAvailable(
    new Date('2024-01-15T09:00'),
    new Date('2024-01-15T11:00'),
    eventBeingDragged,
    targetResource
);

// Check availability for multiple resources
const isAvailable = scheduler.isDateRangeAvailable(
    startDate,
    endDate,
    null,
    [resource1, resource2]
);

// Force check ignoring allowOverlap setting
const isAvailable = scheduler.isDateRangeAvailable(
    startDate,
    endDate,
    null,
    resource,
    false  // Treat as if allowOverlap: false
);
```

**Implementation Notes:**
- Excludes the event(s) passed in `excludeEvent` from conflict check
- Checks all resources if array is provided
- Returns `true` if slot is available, `false` if conflict exists

## Date Constraints

### getDateConstraints Callback

Dynamically restrict where events can be placed.

```typescript
type DateConstraint = {
    start?: Date   // Earliest allowed date
    end?: Date     // Latest allowed date
}

const scheduler = new SchedulerPro({
    // Return date constraints for drag/resize operations
    getDateConstraints(
        resourceRecord?: SchedulerResourceModel,
        eventRecord?: SchedulerEventModel
    ): DateConstraint {
        // Resource-specific constraints
        if (resourceRecord?.data.maxDate) {
            return {
                start: new Date('2024-01-01'),
                end: resourceRecord.data.maxDate
            };
        }

        // Event-specific constraints
        if (eventRecord?.data.mustStartAfter) {
            return {
                start: eventRecord.data.mustStartAfter
            };
        }

        // No constraints
        return {};
    }
});
```

**Constraint Effects:**
- `start` - Events cannot be moved/resized before this date
- `end` - Events cannot be moved/resized after this date
- Omitting a property means that boundary is unconstrained

**Use Cases:**
- Resource availability windows (vacation, shifts)
- Project phase boundaries
- Event deadlines or start-no-earlier-than dates

## Event Layout Strategies

### eventLayout Configuration

Controls how overlapping events are visually arranged.

```typescript
eventLayout?: 'stack' | 'pack' | 'mixed' | 'none' | {
    type?: 'stack' | 'pack' | 'mixed' | 'none'
}
```

**Layout Types:**

| Layout | Behavior | Best For |
|--------|----------|----------|
| `'stack'` | Events stack vertically, same width | Most scheduling views |
| `'pack'` | Events resize to fit side-by-side | Dense calendars |
| `'mixed'` | Combination of stack and pack | Variable event densities |
| `'none'` | Events overlap visually | Transparent/indicator events |

```typescript
const scheduler = new SchedulerPro({
    // Simple string configuration
    eventLayout: 'pack',

    // Object configuration (for future extensibility)
    eventLayout: {
        type: 'stack'
    }
});
```

### Per-Resource eventLayout

Override layout for specific resources.

```typescript
export class SchedulerResourceModel extends GridRowModel {
    // Resource-specific layout
    eventLayout: 'stack' | 'pack' | 'mixed' | 'none'
}

resourceStore.add([
    { id: 'team-1', name: 'Development', eventLayout: 'stack' },
    { id: 'room-1', name: 'Boardroom', eventLayout: 'none' }  // Show overlaps
]);
```

### overlappingEventSorter

Control the order of stacked/packed events.

```typescript
const scheduler = new SchedulerPro({
    // Custom sort for overlapping events
    overlappingEventSorter(a: SchedulerEventModel, b: SchedulerEventModel): number {
        // Sort by start date (earliest first)
        const startDiff = a.startDate.getTime() - b.startDate.getTime();
        if (startDiff !== 0) return startDiff;

        // Then by duration (longest first)
        return b.duration - a.duration;
    }
});
```

**Sorting Criteria Examples:**
- Priority field: `return a.priority - b.priority`
- Name: `return a.name.localeCompare(b.name)`
- Duration: `return b.duration - a.duration`

## Drag Validation

### EventDrag validatorFn

Validate drag operations in real-time.

```typescript
const scheduler = new SchedulerPro({
    features: {
        eventDrag: {
            // Validator function called during drag
            validatorFn({
                eventRecords,
                newResource,
                startDate,
                endDate,
                context
            }) {
                // Check for conflicts
                for (const event of eventRecords) {
                    const isAvailable = scheduler.isDateRangeAvailable(
                        startDate,
                        endDate,
                        event,
                        newResource
                    );

                    if (!isAvailable) {
                        return {
                            valid: false,
                            message: 'Time slot not available'
                        };
                    }
                }

                // Check resource skills
                if (!newResource.skills?.includes(eventRecords[0].requiredSkill)) {
                    return {
                        valid: false,
                        message: 'Resource lacks required skill'
                    };
                }

                return { valid: true };
            }
        }
    }
});
```

### Drag Constraints

Limit where events can be dragged.

```typescript
const scheduler = new SchedulerPro({
    features: {
        eventDrag: {
            // Keep event on same resource row
            constrainDragToResource: true,

            // Snap to time slots
            constrainDragToTimeSlot: true
        }
    }
});
```

**Constraint Options:**

| Option | Effect |
|--------|--------|
| `constrainDragToResource: true` | Cannot change resource during drag |
| `constrainDragToTimeSlot: true` | Snaps to time axis resolution |

## beforeEventDrag Event

Prevent drag start based on conditions.

```typescript
const scheduler = new SchedulerPro({
    listeners: {
        beforeEventDrag({
            source,
            eventRecord,
            resourceRecord,
            eventRecords,
            assignmentRecords,
            domEvent
        }) {
            // Prevent dragging locked events
            if (eventRecord.locked) {
                return false;
            }

            // Prevent dragging past events
            if (eventRecord.endDate < new Date()) {
                return false;
            }

            // Allow drag
            return true;
        }
    }
});

// Async validation
listeners: {
    async beforeEventDrag({ eventRecord }) {
        // Check with server
        const canEdit = await checkPermissions(eventRecord.id);
        return canEdit;
    }
}
```

**Return Values:**
- `true` or `undefined` - Allow drag
- `false` - Prevent drag
- `Promise<boolean>` - Async validation

## Paste Conflict Handling

### pasteNotAllowed Event

Handle paste rejections due to conflicts.

```typescript
const scheduler = new SchedulerPro({
    listeners: {
        pasteNotAllowed({
            source,
            eventRecords,
            assignmentRecords,
            originalEventRecords,
            originalAssignmentRecords,
            date,
            resourceRecord,
            isCut,
            entityName,
            reason  // 'overlappingEvents' | 'resourceReadOnly'
        }) {
            if (reason === 'overlappingEvents') {
                Toast.show({
                    html: `Cannot paste: events would overlap with existing bookings on ${resourceRecord.name}`,
                    color: 'warning'
                });
            }

            if (reason === 'resourceReadOnly') {
                Toast.show({
                    html: `Cannot paste: ${resourceRecord.name} is read-only`,
                    color: 'error'
                });
            }
        }
    }
});
```

**Rejection Reasons:**

| Reason | Cause |
|--------|-------|
| `'overlappingEvents'` | Paste would create overlap and `allowOverlap: false` |
| `'resourceReadOnly'` | Target resource is marked read-only |

## Resize Validation

### EventResize validatorFn

Validate resize operations.

```typescript
const scheduler = new SchedulerPro({
    features: {
        eventResize: {
            validatorFn({
                eventRecord,
                startDate,
                endDate,
                resourceRecord
            }) {
                // Minimum duration check
                const duration = endDate - startDate;
                if (duration < 30 * 60 * 1000) {  // 30 minutes
                    return {
                        valid: false,
                        message: 'Events must be at least 30 minutes'
                    };
                }

                // Check for overlap
                const isAvailable = scheduler.isDateRangeAvailable(
                    startDate,
                    endDate,
                    eventRecord,
                    resourceRecord
                );

                if (!isAvailable) {
                    return {
                        valid: false,
                        message: 'Resize would cause overlap'
                    };
                }

                return { valid: true };
            }
        }
    }
});
```

## Event Creation Validation

### EventDragCreate validatorFn

Validate new event creation.

```typescript
const scheduler = new SchedulerPro({
    features: {
        eventDragCreate: {
            validatorFn({
                startDate,
                endDate,
                resourceRecord
            }) {
                // Check slot availability
                const isAvailable = scheduler.isDateRangeAvailable(
                    startDate,
                    endDate,
                    null,  // No event to exclude
                    resourceRecord
                );

                if (!isAvailable) {
                    return {
                        valid: false,
                        message: 'Time slot is not available'
                    };
                }

                // Check working hours
                const hour = startDate.getHours();
                if (hour < 8 || hour >= 18) {
                    return {
                        valid: false,
                        message: 'Events must be within working hours (8 AM - 6 PM)'
                    };
                }

                return { valid: true };
            }
        }
    }
});
```

## Conflict Resolution Flow

### Complete Validation Pipeline

```
User Action (Drag/Resize/Create/Paste)
         │
         ▼
    beforeEvent* Event
    (can return false to cancel)
         │
         ▼
    validatorFn Check
    (returns { valid, message })
         │
         ├─► valid: false ─► Show tooltip/toast with message
         │                   Operation cancelled
         │
         ▼
    getDateConstraints Check
    (returns { start, end })
         │
         ├─► Outside constraints ─► Operation blocked
         │
         ▼
    allowOverlap Check
    (scheduler + resource level)
         │
         ├─► Would overlap + !allowOverlap ─► Operation blocked
         │
         ▼
    Operation Succeeds
         │
         ▼
    afterEvent* Event
```

## Model-Level Restrictions

### Event Draggability

```typescript
export class SchedulerEventModel extends TimeSpan {
    // Prevent dragging this event
    draggable: boolean           // Config field
    readonly isDraggable: boolean  // Computed (respects other factors)
}

// Usage
eventStore.add({
    name: 'Fixed Meeting',
    startDate: '2024-01-15T10:00',
    duration: 2,
    draggable: false  // Cannot be moved
});
```

### Event Resizability

```typescript
export class SchedulerEventModel extends TimeSpan {
    // Prevent or limit resizing
    resizable: boolean | 'start' | 'end'
    readonly isResizable: boolean | string

    // Values:
    // true    - Resize both ends
    // false   - Cannot resize
    // 'start' - Only resize start
    // 'end'   - Only resize end
}

// Usage
eventStore.add({
    name: 'Fixed Duration',
    startDate: '2024-01-15T10:00',
    duration: 2,
    resizable: false  // Cannot resize
});

eventStore.add({
    name: 'Deadline Task',
    startDate: '2024-01-15T10:00',
    duration: 4,
    resizable: 'start'  // Can only adjust start, end is fixed
});
```

## Common Conflict Resolution Patterns

### Pattern 1: Resource Booking System

```typescript
const scheduler = new SchedulerPro({
    allowOverlap: false,  // No double-bookings

    features: {
        eventDrag: {
            validatorFn({ eventRecords, newResource, startDate, endDate }) {
                // Check availability
                const available = scheduler.isDateRangeAvailable(
                    startDate, endDate, eventRecords[0], newResource
                );

                if (!available) {
                    return { valid: false, message: 'Room already booked' };
                }

                return { valid: true };
            }
        },
        eventDragCreate: {
            validatorFn({ resourceRecord, startDate, endDate }) {
                const available = scheduler.isDateRangeAvailable(
                    startDate, endDate, null, resourceRecord
                );

                return available
                    ? { valid: true }
                    : { valid: false, message: 'Time slot unavailable' };
            }
        }
    }
});
```

### Pattern 2: Working Hours Enforcement

```typescript
const scheduler = new SchedulerPro({
    getDateConstraints(resourceRecord, eventRecord) {
        // Get resource's working hours
        const workStart = resourceRecord?.data.workStart || 8;
        const workEnd = resourceRecord?.data.workEnd || 18;

        const today = new Date();
        return {
            start: new Date(today.setHours(workStart, 0, 0, 0)),
            end: new Date(today.setHours(workEnd, 0, 0, 0))
        };
    }
});
```

### Pattern 3: Skill-Based Assignment

```typescript
const scheduler = new SchedulerPro({
    features: {
        eventDrag: {
            validatorFn({ eventRecords, newResource }) {
                const event = eventRecords[0];
                const requiredSkills = event.requiredSkills || [];
                const resourceSkills = newResource.skills || [];

                const hasAllSkills = requiredSkills.every(
                    skill => resourceSkills.includes(skill)
                );

                if (!hasAllSkills) {
                    const missing = requiredSkills.filter(
                        s => !resourceSkills.includes(s)
                    );
                    return {
                        valid: false,
                        message: `Resource missing skills: ${missing.join(', ')}`
                    };
                }

                return { valid: true };
            }
        }
    }
});
```

### Pattern 4: Mixed Overlap/Exclusive Resources

```typescript
// Some resources allow overlap, others don't
const scheduler = new SchedulerPro({
    allowOverlap: true,  // Default allows overlap

    resourceStore: {
        data: [
            { id: 'dev-1', name: 'Developer 1', allowOverlap: true },  // Can multitask
            { id: 'room-1', name: 'Boardroom', allowOverlap: false }  // Exclusive use
        ]
    },

    features: {
        eventDrag: {
            validatorFn({ eventRecords, newResource, startDate, endDate }) {
                // Check resource-level allowOverlap
                if (newResource.allowOverlap === false) {
                    const available = scheduler.isDateRangeAvailable(
                        startDate, endDate, eventRecords[0], newResource, false
                    );

                    if (!available) {
                        return { valid: false, message: 'This resource is already booked' };
                    }
                }

                return { valid: true };
            }
        }
    }
});
```

## Integration Notes

1. **Validation Order**: `beforeEvent*` → `validatorFn` → `getDateConstraints` → `allowOverlap` check

2. **Async Validation**: Both `beforeEvent*` and `validatorFn` support async/Promise returns

3. **User Feedback**: Always return `message` in validation results for user-friendly feedback

4. **Performance**: `isDateRangeAvailable` iterates events; for large datasets, consider server-side validation

5. **STM Integration**: Invalid operations never reach the StateTrackingManager, so undo/redo isn't affected

6. **Store Events**: When validation passes, standard store events (`beforeAdd`, `add`, etc.) still fire
