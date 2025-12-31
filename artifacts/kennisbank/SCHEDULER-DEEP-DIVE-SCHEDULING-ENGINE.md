# SchedulerPro Deep Dive: Scheduling Engine

## Overview

SchedulerPro uses a reactive, constraint-based scheduling engine built on ChronoGraph - a reactive computation graph library. The engine automatically propagates changes through dependencies, respects calendars, and resolves conflicts.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Scheduling Engine                             │
├─────────────────────────────────────────────────────────────────┤
│  ChronoGraph Layer (Reactive Computation)                       │
│  ├── Identifiers (reactive atoms)                               │
│  ├── Computed fields (derived values)                           │
│  └── Transaction management                                     │
├─────────────────────────────────────────────────────────────────┤
│  Scheduling Logic                                                │
│  ├── Dependency resolution                                       │
│  ├── Constraint satisfaction                                     │
│  ├── Calendar-aware calculations                                │
│  └── Conflict detection                                          │
├─────────────────────────────────────────────────────────────────┤
│  Data Models                                                     │
│  ├── EventModel (schedulingMode, constraints)                   │
│  ├── DependencyModel (lag, type)                                │
│  ├── AssignmentModel (units, effort allocation)                 │
│  └── CalendarModel (working time rules)                         │
└─────────────────────────────────────────────────────────────────┘
```

## Core Concepts

### 1. Reactive Computation (ChronoGraph)

The engine uses reactive programming where field changes automatically trigger recalculation of dependent fields:

```typescript
// When startDate changes, endDate is automatically recalculated
event.startDate = new Date(2024, 0, 15);
// endDate auto-updates: startDate + duration respecting calendar
await project.commitAsync();
```

### 2. commitAsync() - Transaction Commits

All scheduling calculations happen asynchronously through transactions:

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    project: {
        // Scheduling engine is part of ProjectModel
        autoLoad: true,
        loadUrl: '/api/project/load'
    }
});

// After making changes, commit them to trigger calculations
const event = scheduler.eventStore.first;
event.duration = 10;  // Change duration

// Commit changes - engine recalculates dependent values
await scheduler.project.commitAsync();

// Now dependent dates are updated
console.log(event.endDate);  // Automatically calculated
```

### 3. Scheduling Modes

Events can operate in different scheduling modes:

```typescript
interface EventSchedulingMode {
    schedulingMode: 'Normal' | 'FixedDuration';
}
```

#### Normal Mode
Default mode where duration, start date, and end date are interdependent:
- Setting `startDate` + `duration` → calculates `endDate`
- Setting `startDate` + `endDate` → calculates `duration`
- Respects calendar working time

#### FixedDuration Mode
Duration is fixed, controlled by `effortDriven` field:
- `effortDriven: true` → effort is fixed, units recalculated
- `effortDriven: false` → units are fixed, effort recalculated

```javascript
// FixedDuration with effort driven
const event = eventStore.add({
    name: 'Fixed Task',
    startDate: '2024-01-15',
    duration: 5,
    durationUnit: 'day',
    schedulingMode: 'FixedDuration',
    effortDriven: true,
    effort: 40,
    effortUnit: 'hour'
});
```

## Dependency Types

Dependencies control the scheduling relationship between events:

```typescript
type DependencyType = {
    StartToStart: 0;  // SS: Successor starts when predecessor starts
    StartToEnd: 1;    // SE: Successor ends when predecessor starts
    EndToStart: 2;    // FS: Successor starts when predecessor ends (default)
    EndToEnd: 3;      // FF: Successor ends when predecessor ends
};
```

### Dependency Configuration

```javascript
// In DependencyModel
const dependency = {
    id: 1,
    fromEvent: 1,           // Predecessor event ID
    toEvent: 2,             // Successor event ID
    type: 2,                // EndToStart (FS)
    lag: 2,                 // Lag time
    lagUnit: 'day',         // Lag unit
    active: true,           // Set false to ignore in scheduling
    calendar: 'general',    // Calendar for lag calculations
    bidirectional: false    // Draw arrows both directions
};
```

### Lag (Lead/Lag Time)

Lag represents time delay between linked events:

```javascript
const dependency = dependencyStore.add({
    fromEvent: 1,
    toEvent: 2,
    type: 2,  // Finish-to-Start
    lag: 3,   // 3 day gap between predecessor finish and successor start
    lagUnit: 'day'
});

// Negative lag = lead time (overlap)
dependency.lag = -1;  // Successor can start 1 day before predecessor finishes
```

## Constraint Types

Constraints limit when events can be scheduled:

```typescript
type ConstraintType =
    | 'startnoearlierthan'  // SNET - Event cannot start before date
    | 'startnolaterthan'    // SNLT - Event cannot start after date
    | 'finishnoearlierthan' // FNET - Event cannot finish before date
    | 'finishnolaterthan'   // FNLT - Event cannot finish after date
    | 'muststarton'         // MSO  - Event must start on exact date
    | 'mustfinishon'        // MFO  - Event must finish on exact date
    | null;                 // No constraint
```

### Setting Constraints

```javascript
// Using setConstraint method
await event.setConstraint('startnoearlierthan', new Date(2024, 0, 15));

// Direct field assignment
event.constraintType = 'muststarton';
event.constraintDate = new Date(2024, 0, 20);
await project.commitAsync();

// Clear constraint
await event.setConstraint(null);
```

### Constraint Behavior

```javascript
const event = eventStore.add({
    name: 'Constrained Event',
    startDate: '2024-01-10',
    duration: 5,
    constraintType: 'startnoearlierthan',
    constraintDate: '2024-01-15'
});

// Engine will schedule event to start on 2024-01-15
// (respecting SNET constraint even though startDate is earlier)
await project.commitAsync();
```

## Manual Scheduling

Events can be manually scheduled, ignoring automatic calculations:

```javascript
const event = eventStore.add({
    name: 'Manually Scheduled',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    manuallyScheduled: true  // Ignores dependencies and constraints
});

// Engine won't move this event even if predecessors change
```

## Inactive Events

Events can be marked inactive to exclude from scheduling:

```javascript
event.inactive = true;  // Event doesn't affect linked events
await project.commitAsync();

// Successors of inactive events ignore the dependency
```

## Early/Late Dates (Critical Path)

The engine calculates theoretical scheduling windows:

```javascript
// Read-only calculated fields
console.log(event.earlyStartDate);  // Earliest possible start
console.log(event.earlyEndDate);    // Earliest possible end
// (lateStartDate, lateEndDate available in Gantt)
```

## Calendar Integration

The scheduling engine respects calendars for all date calculations:

```javascript
const scheduler = new SchedulerPro({
    project: {
        // Project-level calendar
        calendar: 'business',

        calendarsData: [{
            id: 'business',
            name: 'Business Hours',
            intervals: [
                {
                    recurrentStartDate: 'at 9:00 am',
                    recurrentEndDate: 'at 5:00 pm',
                    isWorking: true
                },
                {
                    recurrentStartDate: 'on Saturday',
                    recurrentEndDate: 'on Monday at 00:00 am',
                    isWorking: false
                }
            ]
        }]
    }
});

// Event with 5 day duration spans only working days
const event = eventStore.add({
    name: 'Work Task',
    startDate: '2024-01-15',  // Monday
    duration: 5,
    durationUnit: 'day'
});
// endDate will be Friday (skipping weekend)
```

### Resource Calendar Interaction

```javascript
// Event can use resource calendars
const event = eventStore.add({
    name: 'Resource Task',
    startDate: '2024-01-15',
    duration: 40,
    durationUnit: 'hour',
    ignoreResourceCalendar: false  // Default - uses resource calendar
});

// If assigned resources have limited availability,
// event duration extends to accommodate

// To ignore resource calendars:
event.ignoreResourceCalendar = true;
await project.commitAsync();
```

## Conflict Detection and Resolution

The engine detects scheduling conflicts and cycles:

### Conflict Events

```javascript
project.on({
    // Scheduling conflict (e.g., constraint violations)
    schedulingConflict({ schedulingIssue, continueWithResolutionResult }) {
        console.log('Conflict:', schedulingIssue.getDescription());
        console.log('Intervals:', schedulingIssue.intervals);

        // Get available resolutions
        const resolutions = schedulingIssue.getResolutions();

        // Apply first resolution and continue
        resolutions[0].resolve();
        continueWithResolutionResult(EffectResolutionResult.Resume);
    },

    // Dependency cycle detected
    cycle({ schedulingIssue, continueWithResolutionResult }) {
        console.log('Cycle:', schedulingIssue.getDescription());
        console.log('Cycle info:', schedulingIssue.cycle);

        // Cancel changes to prevent cycle
        continueWithResolutionResult(EffectResolutionResult.Cancel);
    },

    // Empty calendar (no working time)
    emptyCalendar({ schedulingIssue, continueWithResolutionResult }) {
        console.log('Calendar issue:', schedulingIssue.getDescription());
        const calendar = schedulingIssue.getCalendar();

        // Apply resolution
        schedulingIssue.getResolutions()[0].resolve();
        continueWithResolutionResult(EffectResolutionResult.Resume);
    }
});
```

### Resolution Result Types

```typescript
enum EffectResolutionResult {
    Resume,  // Apply resolution and continue
    Cancel   // Cancel changes that caused the issue
}
```

### Visual Conflict Resolution

```javascript
const scheduler = new SchedulerPro({
    // Show popups for conflict resolution
    displaySchedulingIssueResolutionPopup: true,

    // Custom popup class
    cycleResolutionPopupClass: MyCycleResolutionPopup
});
```

## Engine Events

Monitor engine activity:

```javascript
project.on({
    // Engine finished calculating
    dataReady({ source, isInitialCommit, records }) {
        console.log('Calculations complete');
        console.log('Initial commit:', isInitialCommit);
        console.log('Modified records:', records);
    },

    // Progress during calculation (if enabled)
    progress({ total, remaining, phase }) {
        console.log(`${phase}: ${remaining}/${total} remaining`);
    }
});

// Enable progress notifications
const scheduler = new SchedulerPro({
    project: {
        enableProgressNotifications: true
    }
});
```

## Effort and Assignment

The engine calculates effort based on resource assignments:

```javascript
const event = eventStore.add({
    name: 'Team Task',
    startDate: '2024-01-15',
    duration: 5,
    durationUnit: 'day',
    effort: 80,
    effortUnit: 'hour'
});

// Assign resources with allocation units
assignmentStore.add([
    { eventId: event.id, resourceId: 1, units: 100 },  // Full time
    { eventId: event.id, resourceId: 2, units: 50 }   // Half time
]);

// Engine calculates work distribution
await project.commitAsync();
```

## Synchronous vs Asynchronous Mode

```javascript
// Default: Asynchronous mode
const scheduler = new SchedulerPro({
    project: {
        // Calculations are async, use commitAsync()
    }
});

// Synchronous mode (for smaller datasets)
const scheduler = new SchedulerPro({
    project: {
        propagateSync: true  // Calculations happen immediately
    }
});
```

## Complete Example

```javascript
import { SchedulerPro, DateHelper } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        autoLoad: true,
        loadUrl: '/api/project/load',

        // Calendar configuration
        calendar: 'business',
        calendarsData: [{
            id: 'business',
            name: 'Business Hours',
            intervals: [
                {
                    recurrentStartDate: 'at 8:00 am',
                    recurrentEndDate: 'at 6:00 pm',
                    isWorking: true
                }
            ]
        }],

        listeners: {
            // Handle conflicts programmatically
            schedulingConflict({ schedulingIssue, continueWithResolutionResult }) {
                // Auto-resolve using first available resolution
                const resolutions = schedulingIssue.getResolutions();
                if (resolutions.length > 0) {
                    resolutions[0].resolve();
                    continueWithResolutionResult(EffectResolutionResult.Resume);
                }
            },

            cycle({ continueWithResolutionResult }) {
                // Cancel changes that would cause cycle
                continueWithResolutionResult(EffectResolutionResult.Cancel);
            },

            dataReady({ isInitialCommit }) {
                if (!isInitialCommit) {
                    console.log('Schedule recalculated');
                }
            }
        }
    },

    // Show resolution popups for user interaction
    displaySchedulingIssueResolutionPopup: true,

    features: {
        dependencies: true
    }
});

// Programmatic scheduling operations
async function rescheduleFromDate(event, newStartDate) {
    // Set constraint to move event
    await event.setConstraint('muststarton', newStartDate);

    // Wait for engine to propagate changes
    await scheduler.project.commitAsync();

    // Check if any conflicts occurred
    console.log('Rescheduling complete');
}

// Link two events with dependency
async function linkEvents(predecessor, successor, type = 2) {
    scheduler.dependencyStore.add({
        fromEvent: predecessor.id,
        toEvent: successor.id,
        type,  // Finish-to-Start
        lag: 0
    });

    await scheduler.project.commitAsync();
}
```

## Performance Considerations

1. **Batch Changes**: Group multiple changes before commit
   ```javascript
   project.suspendChangeTracking();
   // Make multiple changes
   project.resumeChangeTracking();
   await project.commitAsync();
   ```

2. **Async Mode**: Use `propagateSync: false` for large datasets

3. **Inactive Events**: Mark non-essential events as inactive

4. **Dependency Limits**: Minimize circular dependency checks

## API Reference Links

- [ProjectModel](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/ProjectModel)
- [EventModel schedulingMode](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/EventModel#config-schedulingMode)
- [DependencyModel](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/DependencyModel)
- [ConstraintType](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/EventModel#field-constraintType)
- [CycleResolutionPopup](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/widget/CycleResolutionPopup)
- [SchedulingIssueResolutionPopup](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/widget/SchedulingIssueResolutionPopup)
