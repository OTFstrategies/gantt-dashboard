# SchedulerPro Deep Dive: Events

> **Uitgebreide analyse** van het Bryntum SchedulerPro EventModel: event properties, recurring events, event styling, renderers, nested events, en constraints.

---

## Overzicht

Het EventModel in SchedulerPro is de centrale data-entiteit voor alle geplande activiteiten. Het biedt:
- **Tijdspan eigenschappen** - startDate, endDate, duration
- **Resource toewijzing** - assignments, resources
- **Recurrence** - herhalende events met RRULE support
- **Styling** - eventColor, eventStyle, iconCls
- **Constraints** - scheduling constraints en calendar support
- **Nested events** - parent/child event hiërarchie

---

## 1. EventModel Basis

### 1.1 Core Fields

```javascript
{
    id         : 1,
    name       : 'Meeting',
    startDate  : '2024-01-15T09:00',
    endDate    : '2024-01-15T11:00',
    // OF
    duration   : 2,
    durationUnit: 'hour',

    // Resource assignment (eenvoudig)
    resourceId : 'r1',
    // OF meerdere resources
    resourceIds: ['r1', 'r2'],

    // Optioneel
    allDay     : false,
    note       : 'Quarterly review'
}
```

### 1.2 Field Definities

```typescript
interface EventModelFields {
    // Identificatie
    id: string | number;
    name?: string;

    // Tijdspan
    startDate: Date | string;
    endDate: Date | string;
    duration: number;
    durationUnit: 'millisecond' | 'second' | 'minute' | 'hour' |
                  'day' | 'week' | 'month' | 'quarter' | 'year';

    // All-day
    allDay: boolean;

    // Styling
    eventColor: EventColor | string | null;
    eventStyle: EventStyle | null;
    iconCls: string;
    cls: string;

    // Behavior
    draggable: boolean;
    resizable: boolean | 'start' | 'end';

    // Recurrence
    recurrenceRule: string;           // RRULE format
    exceptionDates: string | string[];

    // Notes
    note: string;
}
```

---

## 2. Event Styling

### 2.1 EventColor

De `eventColor` property bepaalt de primaire kleur van een event:

```javascript
// Standard colors
type EventColor =
    'red' | 'pink' | 'magenta' | 'purple' | 'violet' |
    'deep-purple' | 'indigo' | 'blue' | 'light-blue' |
    'cyan' | 'teal' | 'green' | 'light-green' | 'lime' |
    'yellow' | 'orange' | 'amber' | 'deep-orange' |
    'light-gray' | 'gray' | 'black' | string | null;

// Usage in data
{
    id         : 1,
    name       : 'High Priority',
    eventColor : 'red',
    startDate  : '2024-01-15',
    duration   : 2
}

// Custom hex color
{
    id         : 2,
    name       : 'Custom Color',
    eventColor : '#d4a9b5',
    startDate  : '2024-01-16',
    duration   : 3
}
```

### 2.2 EventStyle

De `eventStyle` property bepaalt de visuele stijl:

```javascript
type EventStyle =
    'plain' |      // Solid color
    'border' |     // Colored border only
    'colored' |    // Fully colored background
    'hollow' |     // Transparent with border
    'line' |       // Thin line style
    'dashed' |     // Dashed border
    'minimal' |    // Minimal styling
    'rounded' |    // Rounded corners
    'calendar' |   // Calendar app style
    'interday' |   // Multi-day event style
    'gantt' |      // Gantt chart style
    null;

// Scheduler-level default
const scheduler = new SchedulerPro({
    eventStyle : 'filled',
    eventColor : 'blue'
});

// Per-event override
{
    id         : 1,
    name       : 'Special Event',
    eventStyle : 'rounded',
    eventColor : 'orange'
}
```

### 2.3 Icons

```javascript
{
    id      : 1,
    name    : 'Meeting',
    iconCls : 'fa fa-users'
}

// In eventRenderer
eventRenderer({ eventRecord, renderData }) {
    if (eventRecord.isRecurring) {
        renderData.iconCls = 'fa fa-rotate';
    }
    return eventRecord.name;
}
```

---

## 3. Event Renderer

### 3.1 Basic Renderer

```javascript
const scheduler = new SchedulerPro({
    eventRenderer({ eventRecord, renderData, resourceRecord }) {
        // renderData bevat eigenschappen die aangepast kunnen worden
        // - cls         : CSS classes
        // - style       : Inline styles
        // - iconCls     : Icon class
        // - eventColor  : Override event color

        return eventRecord.name;
    }
});
```

### 3.2 Advanced Renderer

```javascript
eventRenderer({ eventRecord, renderData }) {
    // Dynamic color based on data
    const colors = {
        'Meeting'    : '#d4a9b5',
        'Workshop'   : '#aaa3e3',
        'Deadline'   : '#ff6b6b'
    };

    if (colors[eventRecord.name]) {
        renderData.eventColor = colors[eventRecord.name];
    }

    // Add icon for recurring events
    if (eventRecord.isOccurrence) {
        renderData.iconCls = 'fa fa-rotate';
    }

    // Add custom class
    if (eventRecord.priority === 'high') {
        renderData.cls.add('high-priority');
    }

    // Return content (string or DomConfig)
    return StringHelper.encodeHtml(eventRecord.name);
}
```

### 3.3 DomConfig Return

```javascript
eventRenderer({ eventRecord, renderData }) {
    return {
        className : 'custom-event-content',
        children  : [
            { tag: 'span', className: 'event-name', text: eventRecord.name },
            { tag: 'span', className: 'event-time', text: eventRecord.duration + 'h' }
        ]
    };
}
```

---

## 4. Recurring Events

### 4.1 Activeren

```javascript
const scheduler = new SchedulerPro({
    // Enable recurring events support
    enableRecurringEvents : true,

    project : {
        events : [
            {
                id             : 1,
                name           : 'Weekly Meeting',
                startDate      : '2024-01-08',
                duration       : 2,
                recurrenceRule : 'FREQ=WEEKLY'
            }
        ]
    }
});
```

### 4.2 RRULE Format (RFC-5545)

```javascript
// Weekly
{ recurrenceRule: 'FREQ=WEEKLY' }

// Weekly on specific days
{ recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' }

// Every 2 weeks
{ recurrenceRule: 'FREQ=WEEKLY;INTERVAL=2' }

// Daily for 10 occurrences
{ recurrenceRule: 'FREQ=DAILY;COUNT=10' }

// Monthly on the 15th
{ recurrenceRule: 'FREQ=MONTHLY;BYMONTHDAY=15' }

// Until specific date
{ recurrenceRule: 'FREQ=WEEKLY;UNTIL=20241231T000000' }

// Every 4 days
{ recurrenceRule: 'FREQ=DAILY;INTERVAL=4' }
```

### 4.3 RecurrenceModel

```typescript
interface RecurrenceModelConfig {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;           // Elke N periodes
    count?: number;              // Aantal occurrences
    endDate?: Date;              // Einddatum
    days?: string[];             // 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'
    monthDays?: number[];        // -31..-1, 1..31
    months?: number[];           // 1-12
    positions?: number[];        // Positie in periode
}

// Programmatisch aanmaken
eventRecord.setRecurrence({
    frequency : 'WEEKLY',
    interval  : 1,
    days      : ['MO', 'WE', 'FR'],
    count     : 10
});

// Of via recurrenceRule string
eventRecord.recurrenceRule = 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;COUNT=10';
```

### 4.4 Occurrence Detectie

```javascript
eventRenderer({ eventRecord, renderData }) {
    // Check of dit een occurrence is (niet de base event)
    if (eventRecord.isOccurrence) {
        renderData.iconCls = 'fa fa-rotate';
        console.log('Occurrence index:', eventRecord.occurrenceIndex);
    }

    // Check of event recurring is
    if (eventRecord.isRecurring) {
        console.log('Has recurrence rule:', eventRecord.recurrenceRule);
    }

    return eventRecord.name;
}
```

### 4.5 Exception Dates

```javascript
// Specifieke dates uitsluiten van recurrence
{
    id              : 1,
    name            : 'Weekly Meeting',
    startDate       : '2024-01-08',
    recurrenceRule  : 'FREQ=WEEKLY',
    exceptionDates  : '2024-01-22,2024-02-05'  // Skip deze dates
}

// Programmatisch
eventRecord.addExceptionDate(new Date(2024, 0, 22));
```

---

## 5. All-Day Events

### 5.1 Configuratie

```javascript
{
    id        : 1,
    name      : 'Holiday',
    startDate : '2024-01-15',
    allDay    : true
}

// Multi-day all-day event
{
    id        : 2,
    name      : 'Conference',
    startDate : '2024-01-20',
    endDate   : '2024-01-23',
    allDay    : true
}
```

### 5.2 InterDay Detectie

```javascript
eventRenderer({ eventRecord }) {
    // Check of event meerdere dagen spant
    if (eventRecord.isInterDay) {
        // Dit is een multi-day event
    }

    return eventRecord.name;
}
```

---

## 6. Nested Events (Parent/Child)

### 6.1 Feature Configuratie

```javascript
const scheduler = new SchedulerPro({
    features : {
        nestedEvents : {
            // Niet toestaan dat nested events buiten parent gesleept worden
            constrainDragToParent : true
        }
    }
});
```

### 6.2 Data Structuur

```javascript
{
    events : [
        {
            id        : 'parent1',
            name      : 'Project Sprint',
            startDate : '2024-01-15T08:00',
            endDate   : '2024-01-15T17:00',
            children  : [
                {
                    id        : 'child1',
                    name      : 'Planning',
                    startDate : '2024-01-15T08:00',
                    endDate   : '2024-01-15T10:00'
                },
                {
                    id        : 'child2',
                    name      : 'Development',
                    startDate : '2024-01-15T10:00',
                    endDate   : '2024-01-15T15:00'
                },
                {
                    id        : 'child3',
                    name      : 'Review',
                    startDate : '2024-01-15T15:00',
                    endDate   : '2024-01-15T17:00'
                }
            ]
        }
    ]
}
```

### 6.3 Nested Event Properties

```javascript
// Check of event parent is
if (eventRecord.isParent) {
    console.log('Children:', eventRecord.children);
}

// Navigatie
eventRecord.parent;           // Parent event
eventRecord.children;         // Direct children
eventRecord.firstChild;       // First child
eventRecord.lastChild;        // Last child

// Delay from parent (in durationUnit)
eventRecord.delayFromParent;
```

---

## 7. Event Constraints

### 7.1 Constraint Types

```javascript
type ConstraintType =
    'muststarton' |          // Must start on specific date
    'mustfinishon' |         // Must finish on specific date
    'startnoearlierthan' |   // Start not earlier than date
    'startnolaterthan' |     // Start not later than date
    'finishnoearlierthan' |  // Finish not earlier than date
    'finishnolaterthan' |    // Finish not later than date
    null;

{
    id             : 1,
    name           : 'Constrained Event',
    startDate      : '2024-01-15',
    duration       : 3,
    constraintType : 'startnoearlierthan',
    constraintDate : '2024-01-15'
}
```

### 7.2 Manually Scheduled

```javascript
// Event dat niet automatisch gescheduled wordt
{
    id               : 1,
    name             : 'Fixed Event',
    startDate        : '2024-01-15',
    duration         : 2,
    manuallyScheduled: true  // Geen automatische berekeningen
}
```

---

## 8. Preamble & Postamble

Buffer tijd voor/na het event:

```javascript
{
    id        : 1,
    name      : 'Meeting',
    startDate : '2024-01-15T10:00',
    duration  : 2,
    preamble  : '30 min',    // 30 min prep time before
    postamble : '15 min'     // 15 min cleanup after
}

// Outer dates (inclusief preamble/postamble)
console.log(eventRecord.outerStartDate);  // 09:30
console.log(eventRecord.outerEndDate);    // 12:15
```

---

## 9. Effort & Scheduling

### 9.1 Effort Tracking

```javascript
{
    id        : 1,
    name      : 'Development Task',
    startDate : '2024-01-15',
    duration  : 5,           // Calendar days
    effort    : 40,          // Work hours
    effortUnit: 'hour'
}

// Actual effort (read-only, calculated from assignments)
console.log(eventRecord.actualEffort);
```

### 9.2 PercentDone

```javascript
{
    id          : 1,
    name        : 'In Progress Task',
    startDate   : '2024-01-15',
    duration    : 5,
    percentDone : 60         // 60% complete
}

// Status checks
eventRecord.isCompleted;     // percentDone >= 100
eventRecord.isInProgress;    // 0 < percentDone < 100
eventRecord.isStarted;       // percentDone > 0
```

---

## 10. Calendar Integration

```javascript
// Event met eigen calendar
{
    id        : 1,
    name      : 'Consultant Work',
    startDate : '2024-01-15',
    duration  : 5,
    calendar  : 'consultant-calendar'  // Custom calendar ID
}

// Access calendars
eventRecord.calendar;           // Assigned calendar
eventRecord.effectiveCalendar;  // Effective calendar (falls back to project)

// Ignore resource calendars
{
    ignoreResourceCalendar : true
}
```

---

## 11. Event API Methods

### 11.1 Assignment Methods

```javascript
// Assign to resource
await eventRecord.assign(resourceRecord);
await eventRecord.assign('r1');          // By ID
await eventRecord.assign(['r1', 'r2']);  // Multiple

// Unassign
await eventRecord.unassign(resourceRecord);
await eventRecord.unassign();            // Unassign all

// Reassign
eventRecord.reassign('r1', 'r2');        // From r1 to r2

// Check assignment
eventRecord.isAssignedTo('r1');          // Returns boolean

// Get resource
eventRecord.resource;                     // First assigned resource
eventRecord.resources;                    // All assigned resources
eventRecord.getResource('r1');            // Specific resource
```

### 11.2 Time Manipulation

```javascript
// Shift event
await eventRecord.shift(2, 'day');       // Move 2 days forward

// Set async (triggers engine calculation)
await eventRecord.setAsync('startDate', new Date(2024, 0, 20));
await eventRecord.setAsync({
    startDate : new Date(2024, 0, 20),
    duration  : 3
});
```

### 11.3 Editable Check

```javascript
// Check of field editable is
if (eventRecord.isEditable('startDate')) {
    // Can edit start date
}
```

---

## 12. Event Properties (Read-Only)

```javascript
// Assignments
eventRecord.assignments;          // All assignment records
eventRecord.assignmentStore;      // Assignment store reference

// Dependencies
eventRecord.predecessors;         // Predecessor dependency records
eventRecord.successors;           // Successor dependency records
eventRecord.dependencyStore;      // Dependency store reference

// Stores
eventRecord.eventStore;           // Event store reference
eventRecord.project;              // Project model reference

// Calculated dates (Critical Path)
eventRecord.earlyStartDate;       // Earliest possible start
eventRecord.earlyEndDate;         // Earliest possible end

// Duration
eventRecord.durationMS;           // Duration in milliseconds

// Segments (voor split events)
eventRecord.firstSegment;
eventRecord.lastSegment;

// Cost (calculated)
eventRecord.cost;
```

---

## 13. Event Model Flags

```javascript
// Type checks
EventModel.isEventModel;          // Static: true
eventRecord.isEventModel;         // Instance: true

// State flags
eventRecord.isDraggable;          // Can be dragged
eventRecord.isResizable;          // Can be resized
eventRecord.isPersistable;        // Can be persisted
eventRecord.isRecurring;          // Has recurrence rule
eventRecord.isOccurrence;         // Is occurrence of recurring
eventRecord.isInterDay;           // Spans multiple days
eventRecord.isParent;             // Has children
eventRecord.isLeaf;               // No children

// Progress flags
eventRecord.isCompleted;          // 100% done
eventRecord.isInProgress;         // 0 < done < 100
eventRecord.isStarted;            // > 0% done

// Special flags
eventRecord.inactive;             // Not participating in scheduling
```

---

## 14. Custom Event Model

### 14.1 Extend EventModel

```javascript
import { EventModel } from '@bryntum/schedulerpro';

class CustomEventModel extends EventModel {
    static $name = 'CustomEventModel';

    static fields = [
        // Extra fields
        { name: 'priority', type: 'string', defaultValue: 'normal' },
        { name: 'category', type: 'string' },
        { name: 'estimatedHours', type: 'number' },

        // Computed field
        {
            name      : 'displayName',
            persist   : false,
            calculate : record => `${record.priority.toUpperCase()}: ${record.name}`
        }
    ];

    // Custom getter
    get isHighPriority() {
        return this.priority === 'high';
    }
}

// Gebruik in project
const scheduler = new SchedulerPro({
    project : {
        eventModelClass : CustomEventModel,
        events : [...]
    }
});
```

---

## 15. TypeScript Interfaces

```typescript
import { EventModel, RecurrenceModel, Model } from '@bryntum/schedulerpro';

// EventColor type
type EventColor =
    'red' | 'pink' | 'magenta' | 'purple' | 'violet' |
    'deep-purple' | 'indigo' | 'blue' | 'light-blue' |
    'cyan' | 'teal' | 'green' | 'light-green' | 'lime' |
    'yellow' | 'orange' | 'amber' | 'deep-orange' |
    'light-gray' | 'gray' | 'black' | string | null;

// EventStyle type
type EventStyle =
    'plain' | 'border' | 'colored' | 'hollow' | 'line' |
    'dashed' | 'minimal' | 'rounded' | 'calendar' |
    'interday' | 'gantt' | null;

// ConstraintType
type ConstraintType =
    'muststarton' | 'mustfinishon' |
    'startnoearlierthan' | 'startnolaterthan' |
    'finishnoearlierthan' | 'finishnolaterthan' | null;

// EventModel interface
interface EventModelConfig {
    id: string | number;
    name?: string;
    startDate: Date | string;
    endDate?: Date | string;
    duration?: number;
    durationUnit?: string;
    allDay?: boolean;

    // Styling
    eventColor?: EventColor;
    eventStyle?: EventStyle;
    iconCls?: string;
    cls?: string;

    // Resources
    resourceId?: string | number;
    resourceIds?: (string | number)[];

    // Recurrence
    recurrenceRule?: string;
    exceptionDates?: string | string[];

    // Constraints
    constraintType?: ConstraintType;
    constraintDate?: Date;
    manuallyScheduled?: boolean;

    // Effort
    effort?: number;
    effortUnit?: string;
    effortDriven?: boolean;

    // Progress
    percentDone?: number;

    // Behavior
    draggable?: boolean;
    resizable?: boolean | 'start' | 'end';
    inactive?: boolean;

    // Buffer
    preamble?: string | Duration;
    postamble?: string | Duration;

    // Nested events
    children?: EventModelConfig[];

    // Other
    note?: string;
    calendar?: string;
    ignoreResourceCalendar?: boolean;
}

// RecurrenceModel interface
interface RecurrenceModelConfig {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    count?: number;
    endDate?: Date;
    days?: string[];
    monthDays?: number[];
    months?: number[];
    positions?: number[];
}

// EventRenderer data
interface EventRenderData {
    eventRecord: EventModel;
    resourceRecord: Model;
    renderData: {
        cls: DomClassList;
        style: object;
        iconCls: string;
        eventColor: string;
    };
}
```

---

## 16. Complete Example

```javascript
import { SchedulerPro, StringHelper, EventModel } from '@bryntum/schedulerpro';

// Custom event model
class ProjectEvent extends EventModel {
    static fields = [
        { name: 'priority', type: 'string', defaultValue: 'normal' },
        { name: 'category', type: 'string' }
    ];
}

const scheduler = new SchedulerPro({
    appendTo : 'container',

    startDate             : new Date(2024, 0, 1),
    endDate               : new Date(2024, 0, 31),
    viewPreset            : 'weekAndDay',
    rowHeight             : 70,
    barMargin             : 10,

    // Enable recurring events
    enableRecurringEvents : true,

    // Default styling
    eventStyle            : 'rounded',
    eventColor            : 'blue',

    features : {
        dependencies : true,
        nestedEvents : {
            constrainDragToParent : true
        }
    },

    project : {
        eventModelClass : ProjectEvent,
        autoLoad        : true,
        loadUrl         : '/api/data'
    },

    columns : [
        { type: 'resourceInfo', text: 'Name', width: 150 }
    ],

    // Custom event renderer
    eventRenderer({ eventRecord, renderData }) {
        // Color based on priority
        const priorityColors = {
            high   : 'red',
            normal : 'blue',
            low    : 'gray'
        };
        renderData.eventColor = priorityColors[eventRecord.priority] || 'blue';

        // Icon for recurring
        if (eventRecord.isOccurrence) {
            renderData.iconCls = 'fa fa-rotate';
        }

        // Icon for high priority
        if (eventRecord.priority === 'high') {
            renderData.iconCls = 'fa fa-exclamation';
        }

        // Progress indicator
        if (eventRecord.percentDone > 0) {
            renderData.cls.add('has-progress');
        }

        return {
            className : 'event-content',
            children  : [
                {
                    tag       : 'span',
                    className : 'event-name',
                    text      : StringHelper.encodeHtml(eventRecord.name)
                },
                eventRecord.percentDone > 0 ? {
                    tag       : 'span',
                    className : 'event-progress',
                    text      : `${eventRecord.percentDone}%`
                } : null
            ].filter(Boolean)
        };
    },

    listeners : {
        beforeEventEdit({ eventRecord }) {
            console.log('Editing:', eventRecord.name);
            console.log('Is recurring:', eventRecord.isRecurring);
            console.log('Is occurrence:', eventRecord.isOccurrence);
        }
    }
});
```

---

## Referenties

- Examples: `schedulerpro-7.1.0-trial/examples/recurrence/`
- Examples: `schedulerpro-7.1.0-trial/examples/nested-events/`
- Examples: `schedulerpro-7.1.0-trial/examples/event-non-working-time/`
- Examples: `schedulerpro-7.1.0-trial/examples/constraints/`
- TypeScript: `schedulerpro.d.ts` lines 311058+ (EventModel)
- TypeScript: `schedulerpro.d.ts` lines 203268+ (EventModelMixin)
- TypeScript: `schedulerpro.d.ts` lines 201887+ (RecurrenceModel)

---

*Document gegenereerd: December 2024*
*Bryntum SchedulerPro versie: 7.1.0*
