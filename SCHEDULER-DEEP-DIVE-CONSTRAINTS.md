# SchedulerPro Deep Dive: Constraints & Scheduling

## Overview

SchedulerPro provides a powerful constraint system that controls when events can be scheduled. Constraints work with the scheduling engine to enforce temporal boundaries on events, ensuring they start or finish at specific times or within specific ranges.

## Constraint Types

```typescript
type ConstraintType =
    | 'muststarton'           // Event must start on exact date
    | 'mustfinishon'          // Event must finish on exact date
    | 'startnoearlierthan'    // Event cannot start before date
    | 'startnolaterthan'      // Event cannot start after date
    | 'finishnoearlierthan'   // Event cannot finish before date
    | 'finishnolaterthan'     // Event cannot finish after date
    | null;                   // No constraint
```

### Constraint Categories

**Hard Constraints (Must):**
- `muststarton` - Forces exact start date
- `mustfinishon` - Forces exact finish date

**Soft Constraints (No Earlier/Later Than):**
- `startnoearlierthan` - Minimum start boundary
- `startnolaterthan` - Maximum start boundary
- `finishnoearlierthan` - Minimum finish boundary
- `finishnolaterthan` - Maximum finish boundary

## EventModel Constraint Fields

```typescript
class EventModel {
    // Constraint configuration
    constraintType: ConstraintType;
    constraintDate: Date;

    // Calculated scheduling boundaries
    readonly earlyStartDate: Date;  // Earliest possible start
    readonly earlyEndDate: Date;    // Earliest possible end

    // Methods
    setConstraint(
        constraintType: ConstraintType,
        constraintDate?: Date
    ): Promise<void>;
}
```

## Scheduling Modes

Events can operate in different scheduling modes:

```typescript
type SchedulingMode = 'Normal' | 'FixedDuration';

class EventModel {
    schedulingMode: SchedulingMode;

    // FixedDuration mode settings
    effortDriven: boolean;  // true: keep effort, update units
                            // false: keep units, update effort
}
```

### Normal Mode
Duration is calculated based on assigned resource calendars and effort.

### FixedDuration Mode
Duration remains fixed regardless of resource assignments.

## Basic Usage

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31),

    project: {
        eventsData: [
            {
                id: 1,
                name: 'Fixed Start Meeting',
                startDate: '2024-01-15',
                duration: 2,
                // Must start on this exact date
                constraintType: 'muststarton',
                constraintDate: '2024-01-15'
            },
            {
                id: 2,
                name: 'Deadline Project',
                startDate: '2024-01-10',
                duration: 5,
                // Must complete by this date
                constraintType: 'finishnolaterthan',
                constraintDate: '2024-01-20'
            },
            {
                id: 3,
                name: 'Materials Arrival',
                startDate: '2024-01-08',
                duration: 1,
                // Cannot start until materials arrive
                constraintType: 'startnoearlierthan',
                constraintDate: '2024-01-08'
            }
        ]
    }
});
```

## Programmatic Constraint Management

### Setting Constraints

```javascript
// Get event
const event = scheduler.eventStore.getById(1);

// Set a start constraint
await event.setConstraint('startnoearlierthan', new Date(2024, 0, 10));

// Set a finish constraint
await event.setConstraint('finishnolaterthan', new Date(2024, 0, 20));

// Set a hard start constraint
await event.setConstraint('muststarton', new Date(2024, 0, 15));

// Remove constraint
await event.setConstraint(null);
```

### Direct Field Assignment

```javascript
// Set via fields (requires project.commitAsync())
event.constraintType = 'startnoearlierthan';
event.constraintDate = new Date(2024, 0, 10);

// Commit changes to trigger recalculation
await scheduler.project.commitAsync();
```

### Checking Early Dates

```javascript
// Get calculated earliest possible dates
const event = scheduler.eventStore.first;

console.log('Early Start:', event.earlyStartDate);
console.log('Early End:', event.earlyEndDate);

// These dates consider:
// - Predecessor dependencies
// - Event constraints
// - Calendar working time
```

## Constraint Visualization

### Event Renderer with Constraints

```javascript
const constraintNames = {
    muststarton: 'Must start on',
    mustfinishon: 'Must finish on',
    startnoearlierthan: 'Start no earlier than',
    startnolaterthan: 'Start no later than',
    finishnoearlierthan: 'Finish no earlier than',
    finishnolaterthan: 'Finish no later than'
};

// Finish constraints should show icon on right
const rightJustifyIcon = {
    finishnoearlierthan: true,
    finishnolaterthan: true,
    mustfinishon: true
};

const scheduler = new SchedulerPro({
    eventRenderer({ eventRecord, renderData }) {
        const { constraintType } = eventRecord;

        if (constraintType) {
            // Add constraint class
            renderData.cls[constraintType] = true;

            // Add pin icon
            renderData.iconCls.fa = true;
            renderData.iconCls['fa-thumbtack'] = true;

            // Color based on constraint strength
            if (constraintType === 'mustfinishon' ||
                constraintType === 'muststarton') {
                renderData.eventColor = 'red';  // Hard constraint
            } else {
                renderData.eventColor = 'orange';  // Soft constraint
            }

            // Position icon for finish constraints
            if (rightJustifyIcon[constraintType]) {
                renderData.children.unshift({
                    tag: 'i',
                    className: renderData.iconCls
                });
                renderData.iconCls = null;  // Don't add default icon
            }
        }

        return eventRecord.name;
    }
});
```

### Tooltip with Constraint Info

```javascript
features: {
    eventTooltip: {
        template: ({ eventRecord }) => {
            const {
                startDate,
                duration,
                durationUnit,
                constraintType,
                constraintDate
            } = eventRecord;

            return {
                children: [
                    {
                        tag: 'dl',
                        children: [
                            { tag: 'dt', html: 'Start' },
                            {
                                tag: 'dd',
                                html: DateHelper.format(startDate, 'll LT')
                            },
                            { tag: 'dt', html: 'Duration' },
                            {
                                tag: 'dd',
                                html: `${duration} ${durationUnit}${duration > 1 ? 's' : ''}`
                            },
                            constraintType ? { tag: 'dt', html: 'Constraint' } : null,
                            constraintType ? {
                                tag: 'dd',
                                html: `${constraintNames[constraintType]} ${DateHelper.format(constraintDate, 'll LT')}`
                            } : null
                        ].filter(Boolean)
                    }
                ]
            };
        }
    }
}
```

## Constraints with Dependencies

Constraints interact with dependencies to determine final scheduling:

```javascript
project: {
    eventsData: [
        {
            id: 1,
            name: 'Predecessor Task',
            startDate: '2024-01-05',
            duration: 5
        },
        {
            id: 2,
            name: 'Constrained Successor',
            startDate: '2024-01-12',
            duration: 3,
            // Cannot start until Jan 15, even if predecessor finishes earlier
            constraintType: 'startnoearlierthan',
            constraintDate: '2024-01-15'
        }
    ],
    dependenciesData: [
        {
            id: 1,
            fromEvent: 1,
            toEvent: 2,
            type: 2  // Finish-to-Start
        }
    ]
}

// Event 2 will start on Jan 15 (constraint), not Jan 10 (dependency)
// because the constraint is the later date
```

## Nested Events with Constraints

```javascript
features: {
    nestedEvents: {
        constrainResizeToParent: false  // Allow constraints to override parent
    },
    dependencies: {
        drawAroundParents: true
    }
}

// Parent event with constraint
const parentEvent = {
    id: 1,
    name: 'Project Phase',
    constraintType: 'muststarton',
    constraintDate: '2024-01-15',
    children: [
        {
            id: 11,
            name: 'Subtask 1'
            // Inherits scheduling from parent
        }
    ]
};

// Visual indication in renderer
eventRenderer({ eventRecord, renderData }) {
    if (eventRecord.isParent &&
        eventRecord.constraintType &&
        eventRecord.constraintDate) {
        renderData.wrapperCls.add('b-has-constraint');

        return [
            eventRecord.name,
            {
                tag: 'i',
                className: 'fa fa-thumbtack',
                dataset: { btip: 'Pinned by constraint' }
            }
        ];
    }
    return eventRecord.name;
}
```

## Removing Constraints Interactively

```javascript
import { EventHelper } from '@bryntum/schedulerpro';

// Click handler for constraint icon
EventHelper.on({
    element: scheduler.element,
    delegate: '.fa-thumbtack',
    async click({ target }) {
        const eventRecord = scheduler.resolveEventRecord(target);

        if (eventRecord) {
            // Remove constraint
            await eventRecord.setConstraint(null);
        }
    }
});
```

## Task Editor Integration

```javascript
features: {
    taskEdit: {
        items: {
            generalTab: {
                items: {
                    // Add constraint fields to general tab
                    constraintType: {
                        type: 'combo',
                        label: 'Constraint',
                        name: 'constraintType',
                        items: [
                            { value: null, text: 'None' },
                            { value: 'muststarton', text: 'Must start on' },
                            { value: 'mustfinishon', text: 'Must finish on' },
                            { value: 'startnoearlierthan', text: 'Start no earlier than' },
                            { value: 'startnolaterthan', text: 'Start no later than' },
                            { value: 'finishnoearlierthan', text: 'Finish no earlier than' },
                            { value: 'finishnolaterthan', text: 'Finish no later than' }
                        ]
                    },
                    constraintDate: {
                        type: 'datefield',
                        label: 'Constraint Date',
                        name: 'constraintDate'
                    }
                }
            }
        }
    }
}
```

## Scheduling with Calendars

Constraints respect working time defined in calendars:

```javascript
project: {
    calendar: 'general',
    calendarsData: [
        {
            id: 'general',
            name: 'General',
            intervals: [
                {
                    recurrentStartDate: 'on Sat at 0:00',
                    recurrentEndDate: 'on Mon at 0:00',
                    isWorking: false
                }
            ]
        }
    ],
    eventsData: [
        {
            id: 1,
            name: 'Constrained Task',
            duration: 3,
            durationUnit: 'day',
            // Start no earlier than Monday
            constraintType: 'startnoearlierthan',
            constraintDate: '2024-01-08'  // Monday
            // If this falls on weekend, engine adjusts to next working day
        }
    ]
}
```

## Conflict Resolution

When constraints conflict with dependencies:

```javascript
project: {
    // How to handle scheduling conflicts
    // The engine will try to satisfy all constraints and dependencies
    // When impossible, constraints generally win over dependencies
    eventsData: [
        {
            id: 1,
            name: 'Task A',
            startDate: '2024-01-01',
            duration: 10
        },
        {
            id: 2,
            name: 'Task B',
            // Dependency says: start after Task A (Jan 11)
            // Constraint says: start no later than Jan 8
            // Result: Conflict - constraint may cause negative slack
            constraintType: 'startnolaterthan',
            constraintDate: '2024-01-08',
            duration: 5
        }
    ],
    dependenciesData: [
        { fromEvent: 1, toEvent: 2 }
    ]
}
```

## Styling

```css
/* Constraint indicator icon */
.b-sch-event .fa-thumbtack {
    position: absolute;
    top: 2px;
    font-size: 10px;
}

/* Start constraints - icon on left */
.b-sch-event.muststarton .fa-thumbtack,
.b-sch-event.startnoearlierthan .fa-thumbtack,
.b-sch-event.startnolaterthan .fa-thumbtack {
    left: 4px;
}

/* Finish constraints - icon on right */
.b-sch-event.mustfinishon .fa-thumbtack,
.b-sch-event.finishnoearlierthan .fa-thumbtack,
.b-sch-event.finishnolaterthan .fa-thumbtack {
    right: 4px;
}

/* Hard constraint styling */
.b-sch-event.muststarton,
.b-sch-event.mustfinishon {
    border: 2px solid #c0392b;
}

/* Soft constraint styling */
.b-sch-event.startnoearlierthan,
.b-sch-event.startnolaterthan,
.b-sch-event.finishnoearlierthan,
.b-sch-event.finishnolaterthan {
    border: 2px dashed #e67e22;
}

/* Constraint with nested events */
.b-sch-event-wrap.b-has-constraint .b-sch-event {
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.5);
}
```

## Best Practices

1. **Use soft constraints when possible** - They allow more scheduling flexibility
2. **Hard constraints for fixed dates** - Only use `muststarton`/`mustfinishon` for immovable dates
3. **Consider calendars** - Constraints respect working time; dates may adjust
4. **Check for conflicts** - Dependencies and constraints can conflict
5. **Visual feedback** - Always indicate constrained events to users
6. **Allow removal** - Provide UI to remove constraints when needed

## Constraint Use Cases

| Scenario | Constraint Type |
|----------|-----------------|
| Project deadline | `finishnolaterthan` |
| Resource availability start | `startnoearlierthan` |
| Fixed meeting | `muststarton` |
| Delivery deadline | `mustfinishon` |
| Review period | `startnolaterthan` |
| Prerequisite completion | `finishnoearlierthan` |

## API Reference Links

- [EventModel Constraints](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/EventModel#field-constraintType)
- [setConstraint Method](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/EventModel#function-setConstraint)
- [Scheduling Engine](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/ProjectModel)
