# SchedulerPro Deep Dive: Recurring Events

## Overview

SchedulerPro supports recurring events through RFC-5545 compliant recurrence rules (RRULE). Events can repeat daily, weekly, monthly, or yearly with various patterns. The system distinguishes between "base" events (the recurrence definition) and "occurrences" (individual instances of the recurring event).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Recurring Event Base                          │
│                                                                  │
│  ┌─────────────────────┐    ┌────────────────────────────────┐ │
│  │ recurrenceRule      │───▶│    RecurrenceModel             │ │
│  │ "FREQ=WEEKLY;..."   │    │  - frequency (DAILY, WEEKLY..) │ │
│  └─────────────────────┘    │  - interval                    │ │
│                              │  - count / endDate             │ │
│  ┌─────────────────────┐    │  - days, months, positions     │ │
│  │ exceptionDates      │    └────────────────────────────────┘ │
│  │ ["2024-02-14", ...] │                                       │
│  └─────────────────────┘                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ generates
┌─────────────────────────────────────────────────────────────────┐
│                      Occurrences                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │ Jan 15    │  │ Jan 22    │  │ Jan 29    │  │ Feb 5     │   │
│  │ isOccur-  │  │ isOccur-  │  │ isOccur-  │  │ isOccur-  │   │
│  │ rence:true│  │ rence:true│  │ rence:true│  │ rence:true│   │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## RecurrenceModel

The `RecurrenceModel` defines the recurrence pattern.

### Configuration

```typescript
type RecurrenceModelConfig = {
    // Frequency (required)
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

    // Interval between occurrences (default: 1)
    interval?: number

    // End conditions (optional, use one)
    count?: number      // Number of occurrences (including base)
    endDate?: Date      // Last occurrence date

    // Day of week filters
    days?: string[]     // ['MO', 'TU', 'WE', 'TH', 'FR']

    // Monthly/yearly specific
    monthDays?: number[]     // [1, 15, -1] (day of month, -1 = last)
    months?: number[]        // [1, 6, 12] (month numbers)
    positions?: number[]     // [1, -1] (first, last)
}
```

### Frequency Values

| Frequency | Description |
|-----------|-------------|
| `'DAILY'` | Repeats every day (or every N days with interval) |
| `'WEEKLY'` | Repeats every week (or every N weeks) |
| `'MONTHLY'` | Repeats every month (or every N months) |
| `'YEARLY'` | Repeats every year (or every N years) |

### Day Abbreviations

| Abbreviation | Day |
|--------------|-----|
| `'SU'` | Sunday |
| `'MO'` | Monday |
| `'TU'` | Tuesday |
| `'WE'` | Wednesday |
| `'TH'` | Thursday |
| `'FR'` | Friday |
| `'SA'` | Saturday |

## Recurrence Rule (RRULE) Format

The `recurrenceRule` field uses RFC-5545 RRULE format.

### RRULE Components

```
FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;COUNT=10
│            │            │           │
│            │            │           └── End after 10 occurrences
│            │            └── On Monday, Wednesday, Friday
│            └── Every 2 weeks
└── Weekly frequency
```

### Common RRULE Examples

```typescript
// Every day
'FREQ=DAILY'

// Every 2 days
'FREQ=DAILY;INTERVAL=2'

// Every weekday
'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'

// Every week on Monday
'FREQ=WEEKLY;BYDAY=MO'

// Every 2 weeks on Tuesday and Thursday
'FREQ=WEEKLY;INTERVAL=2;BYDAY=TU,TH'

// Monthly on the 15th
'FREQ=MONTHLY;BYMONTHDAY=15'

// Monthly on the last day
'FREQ=MONTHLY;BYMONTHDAY=-1'

// Monthly on first Monday
'FREQ=MONTHLY;BYDAY=1MO'

// Monthly on last Friday
'FREQ=MONTHLY;BYDAY=-1FR'

// Yearly on March 15
'FREQ=YEARLY;BYMONTH=3;BYMONTHDAY=15'

// End after 10 occurrences
'FREQ=WEEKLY;BYDAY=MO;COUNT=10'

// End on specific date
'FREQ=WEEKLY;BYDAY=MO;UNTIL=20241231T235959Z'
```

## Creating Recurring Events

### Using recurrenceRule String

```typescript
scheduler.eventStore.add({
    name: 'Weekly Meeting',
    startDate: '2024-01-15',
    duration: 1,
    durationUnit: 'hour',
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO'
});
```

### Using setRecurrence Method

```typescript
const event = scheduler.eventStore.add({
    name: 'Daily Standup',
    startDate: '2024-01-15',
    duration: 15,
    durationUnit: 'minute'
})[0];

// Set recurrence with parameters
event.setRecurrence(
    'DAILY',        // frequency or RecurrenceModelConfig
    1,              // interval
    30              // count (end after 30 occurrences)
);

// Or with date end
event.setRecurrence('WEEKLY', 1, new Date('2024-12-31'));

// Or with full config
event.setRecurrence({
    frequency: 'WEEKLY',
    interval: 2,
    days: ['MO', 'WE', 'FR'],
    endDate: new Date('2024-12-31')
});
```

### Using RecurrenceModel Directly

```typescript
event.recurrence = new RecurrenceModel({
    frequency: 'MONTHLY',
    interval: 1,
    days: ['1MO'],  // First Monday
    count: 12
});
```

## Event Properties

### Base Event Properties

```typescript
// Check if event has recurrence
event.isRecurring: boolean

// Access recurrence model
event.recurrence: RecurrenceModel

// Access/set recurrence rule string
event.recurrenceRule: string

// Exception dates (skipped occurrences)
event.exceptionDates: string[]
```

### Occurrence Properties

```typescript
// Check if this is an occurrence (not the base)
event.isOccurrence: boolean

// Get the base recurring event
event.recurringTimeSpan: EventModel

// Get occurrence index (0-based, base event is excluded)
event.occurrenceIndex: number
```

## Exception Dates

Skip specific occurrences by adding exception dates.

```typescript
// Add exception date (skip Feb 14 occurrence)
event.addExceptionDate(new Date('2024-02-14'));

// Access all exception dates
const exceptions = event.exceptionDates;
// ['2024-02-14']

// Set multiple exception dates
event.exceptionDates = ['2024-02-14', '2024-03-21', '2024-04-18'];
```

## EventStore Methods

### Get Recurring Events

```typescript
// Get all base recurring events
const recurringEvents = scheduler.eventStore.getRecurringTimeSpans();

// Check if any recurring events exist
const hasRecurring = recurringEvents.length > 0;
```

### Filtering Occurrences

```typescript
// Get visible events (includes occurrences in view)
const visibleEvents = scheduler.eventStore.records;

// Filter to just base events
const baseEvents = visibleEvents.filter(e => !e.isOccurrence);

// Filter to just occurrences
const occurrences = visibleEvents.filter(e => e.isOccurrence);

// Get occurrences of a specific base event
const meetingOccurrences = visibleEvents.filter(
    e => e.isOccurrence && e.recurringTimeSpan === meetingBase
);
```

## Editing Recurring Events

### RecurringEventEdit Mixin

The EventEdit feature includes RecurringEventEdit for handling recurring events.

```typescript
const scheduler = new SchedulerPro({
    features: {
        eventEdit: {
            items: {
                // Recurrence editor shows automatically for recurring events
                recurrenceCombo: {
                    weight: 200
                }
            }
        }
    }
});
```

### Edit Confirmation

When editing an occurrence, users are prompted with options:

1. **Only this event** - Creates an exception and modified version
2. **All following events** - Splits the recurrence
3. **All events** - Modifies the base event

### Programmatic Editing

```typescript
// Modify base (affects all future occurrences)
baseEvent.name = 'Updated Meeting';

// Modify single occurrence (creates exception)
async function modifyOccurrence(occurrence, changes) {
    // Add original date to exceptions
    baseEvent.addExceptionDate(occurrence.startDate);

    // Create standalone event for this date
    const standalone = scheduler.eventStore.add({
        ...occurrence.data,
        ...changes,
        recurrenceRule: null  // Not recurring
    });
}
```

## RecurrenceLegend

Get human-readable recurrence descriptions.

```typescript
import { RecurrenceLegend } from '@bryntum/schedulerpro';

// Get description
const description = RecurrenceLegend.getLegend(
    event.recurrence,
    event.startDate
);
// "Weekly on Monday"
// "Every 2 weeks on Tuesday, Thursday"
// "Monthly on the first Monday"
```

## Store Configuration

### autoAdjustRecurrence

```typescript
const eventStore = new EventStore({
    // When base event moves, adjust recurrence pattern
    autoAdjustRecurrence: true
});
```

When enabled: If a Monday recurring event is moved to Wednesday, the recurrence pattern updates to repeat on Wednesdays.

When disabled: The event moves but keeps "repeat on Monday" pattern, which may not align.

## Common Patterns

### Pattern 1: Weekly Team Meeting

```typescript
scheduler.eventStore.add({
    name: 'Team Meeting',
    startDate: new Date('2024-01-15T10:00:00'),
    duration: 1,
    durationUnit: 'hour',
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
    resourceId: 'team-room'
});
```

### Pattern 2: Bi-Weekly Sprint Planning

```typescript
scheduler.eventStore.add({
    name: 'Sprint Planning',
    startDate: new Date('2024-01-15T09:00:00'),
    duration: 2,
    durationUnit: 'hour',
    recurrenceRule: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO'
});
```

### Pattern 3: Monthly Review (Last Friday)

```typescript
scheduler.eventStore.add({
    name: 'Monthly Review',
    startDate: new Date('2024-01-26T14:00:00'),  // Last Friday of Jan
    duration: 1,
    durationUnit: 'hour',
    recurrenceRule: 'FREQ=MONTHLY;BYDAY=-1FR'
});
```

### Pattern 4: Quarterly Business Review

```typescript
scheduler.eventStore.add({
    name: 'Quarterly Business Review',
    startDate: new Date('2024-01-15T09:00:00'),
    duration: 4,
    durationUnit: 'hour',
    recurrenceRule: 'FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=15'
});
```

### Pattern 5: Daily Standup (Weekdays Only)

```typescript
scheduler.eventStore.add({
    name: 'Daily Standup',
    startDate: new Date('2024-01-15T09:00:00'),
    duration: 15,
    durationUnit: 'minute',
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
});
```

### Pattern 6: Annual Review

```typescript
scheduler.eventStore.add({
    name: 'Annual Performance Review',
    startDate: new Date('2024-03-15'),
    duration: 1,
    durationUnit: 'day',
    recurrenceRule: 'FREQ=YEARLY;BYMONTH=3;BYMONTHDAY=15'
});
```

### Pattern 7: End After N Occurrences

```typescript
scheduler.eventStore.add({
    name: 'Training Session',
    startDate: new Date('2024-01-15'),
    duration: 2,
    durationUnit: 'hour',
    // 8 total sessions (including first)
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU,TH;COUNT=8'
});
```

### Pattern 8: End on Specific Date

```typescript
scheduler.eventStore.add({
    name: 'Project Sync',
    startDate: new Date('2024-01-15'),
    duration: 30,
    durationUnit: 'minute',
    // End when project completes
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=WE;UNTIL=20240630T235959Z'
});
```

## UI Integration

### EventEdit with Recurrence

```typescript
const scheduler = new SchedulerPro({
    features: {
        eventEdit: {
            items: {
                recurrenceCombo: {
                    // Show recurrence options
                    type: 'recurrencecombo',
                    name: 'recurrenceRule'
                }
            }
        }
    }
});
```

### Contextual Recurrence Options

```typescript
const scheduler = new SchedulerPro({
    features: {
        eventEdit: {
            // Use event's start date to suggest patterns
            useContextualRecurrenceRules: true
        }
    }
});
```

When enabled, if editing an event on Monday, the recurrence options include "Weekly on Monday".

### RecurrenceConfirmationPopup

When editing/deleting occurrences, a confirmation popup appears:

```typescript
scheduler.on('beforeEventEdit', ({ eventRecord }) => {
    if (eventRecord.isOccurrence) {
        // Popup will show: "Only this event", "This and following", "All events"
    }
});
```

## Performance Considerations

1. **Occurrence Generation**: Occurrences are generated on-demand for the visible date range. No need to pre-generate all occurrences.

2. **Large Date Ranges**: Avoid infinite recurrences without count/endDate when displaying large date ranges.

3. **Exception Dates**: Too many exception dates can indicate the recurrence pattern should be split.

4. **Store Queries**: When querying, remember that occurrences are transient and regenerated on date range changes.

## Integration Notes

1. **Persistence**: Only base events with `recurrenceRule` and `exceptionDates` are persisted. Occurrences are generated client-side.

2. **Server Format**: The `recurrenceRule` is an RFC-5545 RRULE string. Most calendar systems support this format.

3. **Editing Occurrences**: When an occurrence is modified, the original date is added to `exceptionDates` and a new standalone event is created.

4. **Deletion**: Deleting an occurrence adds its date to `exceptionDates`. Deleting the base removes all occurrences.

5. **Drag/Resize**: Moving/resizing an occurrence prompts for "this only" or "all events" behavior.

6. **Dependencies**: Dependencies to/from recurring events apply to the base. Occurrences inherit the dependency relationship.

7. **Assignments**: Assignments are made to the base event. All occurrences share the same resource assignments.

8. **Time Zone**: Recurrence calculations respect the project's time zone configuration.
