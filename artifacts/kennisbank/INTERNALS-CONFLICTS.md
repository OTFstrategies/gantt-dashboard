# Bryntum Gantt Conflict and Cycle Detection/Resolution

## Table of Contents
1. [Overview](#overview)
2. [Types of Scheduling Issues](#types-of-scheduling-issues)
3. [Conflict Detection Algorithm](#conflict-detection-algorithm)
4. [Cycle Detection](#cycle-detection)
5. [Resolution Mechanism](#resolution-mechanism)
6. [EffectResolutionResult Enum](#effectresolutionresult-enum)
7. [Postponed Conflicts](#postponed-conflicts)
8. [Calendar Conflicts](#calendar-conflicts)
9. [Project Constraint Conflicts](#project-constraint-conflicts)
10. [Conflict UI Components](#conflict-ui-components)
11. [Programmatic Conflict Handling](#programmatic-conflict-handling)
12. [Configuration Options](#configuration-options)

---

## Overview

The Bryntum Gantt scheduling engine uses constraint-based propagation to calculate schedules. When constraints cannot all be satisfied simultaneously, the engine detects these as "scheduling issues" and provides mechanisms for resolution.

### Conceptual Flow

```
Data Change (user edits task, dependency added, etc.)
        |
        v
Scheduling Engine Triggered
        |
        v
Constraint Propagation
  - Evaluates dependencies, task constraints, calendars
  - Calculates early/late dates
  - Propagates changes through dependency network
        |
        v
Conflict Detection
  - Identifies scheduling conflicts (mutually exclusive constraints)
  - Detects dependency cycles
  - Checks calendar validity
        |
        v
Resolution Phase
  - Shows resolution popup (SchedulingIssueResolutionPopup / CycleResolutionPopup) OR
  - Auto-postpones conflicts OR
  - Fires events for programmatic handling
        |
        v
Commit or Cancel Changes
```

---

## Types of Scheduling Issues

### 1. Scheduling Conflicts (ConstraintConflict)

Occurs when constraints on a task are mutually exclusive. For example:
- A dependency requires Task A to finish before Task B starts
- BUT a constraint requires Task B to start before Task A finishes

**Event**: `schedulingConflict`

```typescript
schedulingConflict: (event: {
    schedulingIssue: {
        getDescription: Function,      // Human-readable description
        intervals: object[],           // Conflicting intervals
        getResolutions: Function       // Available resolution options
    },
    continueWithResolutionResult: Function
}) => void
```

**Locale Key**: `ConflictEffectDescription.descriptionTpl`
- Message: `"A scheduling conflict has been found: {0} is conflicting with {1}"`

### 2. Dependency Cycles

Occurs when dependencies form a circular reference (A -> B -> C -> A).

**Event**: `cycle`

```typescript
cycle: (event: {
    schedulingIssue: {
        getDescription: Function,
        cycle: object,                 // The detected cycle details
        getResolutions: Function
    },
    continueWithResolutionResult: Function
}) => void
```

**Locale Key**: `CycleEffectDescription.descriptionTpl`
- Message: `"A cycle has been found, formed by: {0}"`

### 3. Empty Calendar (Calendar Misconfiguration)

Occurs when a calendar has no working time defined, making scheduling impossible.

**Event**: `emptyCalendar`

```typescript
emptyCalendar: (event: {
    schedulingIssue: {
        getDescription: Function,
        getCalendar: Function,         // The problematic calendar
        getResolutions: Function
    },
    continueWithResolutionResult: Function
}) => void
```

**Locale Keys** for `EmptyCalendarEffectDescription`:
- `descriptionTpl`: `'"{2}" task cannot be performed. "{0}" calendar does not provide any working time intervals.'`
- `forwardDescriptionTpl`: `'"{2}" task cannot be performed. "{0}" calendar has no working time after {1}.'`
- `backwardDescriptionTpl`: `'"{2}" task cannot be performed. "{0}" calendar has no working time before {1}.'`
- `noIntersectionDescriptionTpl`: `'"{2}" task cannot be performed. Its "{0}" calendar and its resource calendars have no common working time.'`

### 4. Project Constraint Conflicts

Occurs when a task violates the project's fixed border (start or end date).

**Event**: Uses `schedulingConflict` event

**Locale Keys** for `ProjectConstraintConflictEffectDescription`:
- `startDescriptionTpl`: `'You moved "{0}" task to start on {1}. This is before the project start date {2}.'`
- `endDescriptionTpl`: `'You moved "{0}" task to finish on {1}. This is after the project end date {2}.'`

---

## Conflict Detection Algorithm

### Constraint Interval System

The engine represents each constraint as an "interval" on a task's timeline:

1. **DependencyConstraintInterval**: Created from task dependencies
   - `descriptionTpl`: `'Dependency ({2}) from "{3}" to "{4}"'`

2. **DateConstraintInterval**: Created from explicit task constraints
   - Start/Finish No Earlier Than, Start/Finish No Later Than, Must Start/Finish On
   - `startDateDescriptionTpl`: `'Task "{2}" {3} {0} constraint'`
   - `endDateDescriptionTpl`: `'Task "{2}" {3} {1} constraint'`

3. **ProjectConstraintInterval**: Created from project start/end dates
   - `startDateDescriptionTpl`: `'Project start date {0}'`
   - `endDateDescriptionTpl`: `'Project end date {0}'`

4. **ManuallyScheduledParentConstraintInterval**: Created from parent task scheduling
   - `startDescriptionTpl`: `'Manually scheduled "{2}" forces its children to start no earlier than {0}'`
   - `endDescriptionTpl`: `'Manually scheduled "{2}" forces its children to finish no later than {1}'`

### Detection Process

```
For each task in the project:
    1. Collect all constraint intervals affecting the task
    2. For each constraint:
       - Calculate the allowed time window
       - Check if windows overlap with other constraints
    3. If no valid time window exists:
       - Create a SchedulingConflict with the conflicting intervals
       - Pause calculation and request resolution
```

---

## Cycle Detection

### Algorithm

The engine performs cycle detection during dependency graph traversal:

```
1. Build dependency graph from all dependencies
2. Perform topological sort
3. If topological sort fails (back edge detected):
   - Identify the cycle path
   - Create CycleEffect with cycle information
   - Pause and request resolution
```

### Cycle Object Structure

```typescript
{
    cycle: {
        // Array of dependency records forming the cycle
        dependencies: DependencyModel[],
        // Tasks involved in the cycle
        tasks: TaskModel[]
    }
}
```

---

## Resolution Mechanism

### Resolution Object Interface

Each scheduling issue provides resolution options via `getResolutions()`:

```typescript
interface Resolution {
    // Apply this resolution
    resolve(): void;

    // Description of what this resolution does
    getDescription(): string;
}
```

### Resolution Workflow

```typescript
project.on('schedulingConflict', ({ schedulingIssue, continueWithResolutionResult }) => {
    // Step 1: Get available resolutions
    const resolutions = schedulingIssue.getResolutions();

    // Step 2: Choose and apply a resolution
    resolutions[0].resolve();

    // Step 3: Continue with the scheduling calculation
    continueWithResolutionResult(EffectResolutionResult.Resume);
});
```

---

## EffectResolutionResult Enum

The `EffectResolutionResult` enum controls what happens after handling a scheduling issue:

| Value | Description |
|-------|-------------|
| `EffectResolutionResult.Cancel` | Cancel the changes that caused the conflict. Reverts to previous state. |
| `EffectResolutionResult.Resume` | Continue calculation after applying a resolution. |

### Usage Examples

```typescript
// Cancel changes (reject the operation that caused the conflict)
project.on('cycle', ({ continueWithResolutionResult }) => {
    continueWithResolutionResult(EffectResolutionResult.Cancel);
});

// Apply resolution and continue
project.on('emptyCalendar', ({ schedulingIssue, continueWithResolutionResult }) => {
    schedulingIssue.getResolutions()[0].resolve();
    continueWithResolutionResult(EffectResolutionResult.Resume);
});
```

---

## All Resolution Types

### Cycle Resolutions

| Resolution Class | Description (Locale Key) |
|-----------------|-------------------------|
| `RemoveDependencyCycleEffectResolution` | "Remove dependency" |
| `DeactivateDependencyCycleEffectResolution` | "Deactivate dependency" |

### Scheduling Conflict Resolutions

| Resolution Class | Description (Locale Key) |
|-----------------|-------------------------|
| `RemoveDependencyResolution` | `'Remove dependency from "{1}" to "{2}"'` |
| `DeactivateDependencyResolution` | `'Deactivate dependency from "{1}" to "{2}"'` |
| `RemoveDateConstraintConflictResolution` | `'Remove "{1}" constraint of task "{0}"'` |
| `PostponeDateConstraintConflictResolution` | `'Postpone resolution and flag task "{0}" with conflict marker'` |
| `DisableManuallyScheduledConflictResolution` | `'Disable manual scheduling for "{0}"'` |

### Calendar Resolutions

| Resolution Class | Description (Locale Key) |
|-----------------|-------------------------|
| `Use24hrsEmptyCalendarEffectResolution` | "Use 24-hour calendar with non-working Saturdays and Sundays." |
| `Use8hrsEmptyCalendarEffectResolution` | "Use 8-hour calendar (08:00-12:00, 13:00-17:00) with non-working Saturdays and Sundays." |
| `IgnoreResourceCalendarEmptyCalendarEffectResolution` | "Ignore resource calendars and schedule the task using its own calendar only." |

### Project Constraint Resolutions

| Resolution Class | Description (Locale Key) |
|-----------------|-------------------------|
| `IgnoreProjectConstraintResolution` | "Ignore the project border and proceed with the change." |
| `HonorProjectConstraintResolution` | "Adjust the task to honor the project border." |

---

## Postponed Conflicts

When a conflict is postponed rather than immediately resolved, it's stored on the task for later resolution.

### TaskModel Fields

```typescript
// Field to store postponed conflict information
postponedConflict?: object

// Deprecated alias
hasPostponedOwnConstraintConflict: object  // Read-only alias for postponedConflict
```

### TaskModel Methods

```typescript
// Restart conflict resolution for a postponed conflict
resolvePostponedConflict(): Promise<void>
```

### ProjectModel Configuration

```typescript
// Allow conflicts to be postponed
allowPostponedConflicts?: boolean  // Default: false

// Automatically postpone conflicts instead of showing popup
autoPostponeConflicts?: boolean  // Default: false

// Deprecated - use autoPostponeConflicts
autoPostponedConflicts?: boolean
```

### TaskInfoColumn

The `TaskInfoColumn` displays conflict indicators for tasks with postponed conflicts:

```typescript
// Tooltip shown for tasks with postponed conflicts
postponedConflictTooltip: "There is an unresolved scheduling conflict with this task. Click to resolve it."
```

### Postpone Resolution

```typescript
// Resolution that postpones instead of immediately resolving
PostponeDateConstraintConflictResolution: {
    descriptionTpl: 'Postpone resolution and flag task "{0}" with conflict marker'
}
```

### Starting Postponed Conflict Resolution

```typescript
// Programmatically trigger resolution of a postponed conflict
const task = gantt.taskStore.getById(123);
if (task.postponedConflict) {
    await task.resolvePostponedConflict();
}
```

---

## Calendar Conflicts

### Working Time Conflicts

Calendar conflicts occur when:

1. **Empty Calendar**: No working intervals defined at all
2. **No Working Time After/Before Date**: Calendar has no working time in the required direction
3. **No Intersection**: Task calendar and resource calendars have no common working time

### Calendar Resolution Options

```typescript
// Switch to 24-hour calendar
Use24hrsEmptyCalendarEffectResolution

// Switch to standard 8-hour calendar
Use8hrsEmptyCalendarEffectResolution

// Ignore resource calendars
IgnoreResourceCalendarEmptyCalendarEffectResolution
```

### Ignore Resource Calendar Field

```typescript
// TaskModel field to ignore resource calendars
ignoreResourceCalendar?: boolean  // Default: false

// When true, task schedules only by its own calendar,
// ignoring assigned resource calendars
```

---

## Project Constraint Conflicts

### projectConstraintResolution Field

Controls how tasks treat project boundaries:

```typescript
// TaskModel field
projectConstraintResolution?: 'honor' | 'ignore' | 'conflict'
```

| Value | Behavior |
|-------|----------|
| `'honor'` | Task respects project border (default) |
| `'ignore'` | Task ignores project border, schedules freely |
| `'conflict'` | Triggers `schedulingConflict` event when violated |

### Configuration Example

```typescript
class CustomTask extends TaskModel {
    static fields = [
        { name: 'projectConstraintResolution', defaultValue: 'conflict' }
    ];
}

new Gantt({
    project: {
        taskModelClass: CustomTask
    }
});
```

### Second Pass Handling

```typescript
// Ignore constraints during the second scheduling pass
// (for slack calculation)
ignoreConstraintsOnConflictDuringSecondPass?: boolean  // Now default behavior
```

---

## Conflict UI Components

### SchedulingIssueResolutionPopup

Handles scheduling conflicts and calendar misconfigurations.

```typescript
// Enable/disable the popup
displaySchedulingIssueResolutionPopup?: boolean  // Default: true

// Custom popup class
schedulingIssueResolutionPopupClass?: typeof SchedulingIssueResolutionPopup
```

**Popup Locale Keys**:
```typescript
SchedulingIssueResolutionPopup: {
    'Cancel changes': 'Cancel the change and do nothing',
    schedulingConflict: 'Scheduling conflict',
    emptyCalendar: 'Calendar configuration error',
    cycle: 'Scheduling cycle',
    Apply: 'Apply'
}
```

### CycleResolutionPopup

Specialized popup for dependency cycle resolution.

```typescript
// Custom cycle popup class
cycleResolutionPopupClass?: typeof CycleResolutionPopup
```

**Popup Locale Keys**:
```typescript
CycleResolutionPopup: {
    dependencyLabel: 'Please select a dependency:',
    invalidDependencyLabel: 'There are invalid dependencies involved that need to be addressed:'
}
```

### Popup Features

Both popups extend `Popup` and include:
- List of conflicting items with descriptions
- Resolution options as selectable items
- Apply/Cancel buttons
- Automatic positioning near the affected task

---

## Programmatic Conflict Handling

### Disable Popup and Handle Programmatically

```typescript
const gantt = new Gantt({
    // Disable automatic popup display
    displaySchedulingIssueResolutionPopup: false,

    project: {
        listeners: {
            // Handle scheduling conflicts
            schedulingConflict({ schedulingIssue, continueWithResolutionResult }) {
                console.log('Conflict:', schedulingIssue.getDescription());

                const resolutions = schedulingIssue.getResolutions();

                // Auto-apply first resolution
                resolutions[0].resolve();
                continueWithResolutionResult(EffectResolutionResult.Resume);
            },

            // Handle cycles
            cycle({ schedulingIssue, continueWithResolutionResult }) {
                console.log('Cycle detected:', schedulingIssue.getDescription());

                // Cancel the change that caused the cycle
                continueWithResolutionResult(EffectResolutionResult.Cancel);
            },

            // Handle calendar issues
            emptyCalendar({ schedulingIssue, continueWithResolutionResult }) {
                console.log('Calendar issue:', schedulingIssue.getDescription());

                const resolutions = schedulingIssue.getResolutions();
                resolutions[0].resolve();
                continueWithResolutionResult(EffectResolutionResult.Resume);
            }
        }
    }
});
```

### Custom Resolution Logic

```typescript
project.on('schedulingConflict', ({ schedulingIssue, continueWithResolutionResult }) => {
    const resolutions = schedulingIssue.getResolutions();
    const intervals = schedulingIssue.intervals;

    // Find resolution that removes a dependency (preferred)
    const removeDepResolution = resolutions.find(r =>
        r.getDescription().includes('Remove dependency')
    );

    if (removeDepResolution) {
        removeDepResolution.resolve();
        continueWithResolutionResult(EffectResolutionResult.Resume);
    } else {
        // Fall back to first available resolution
        resolutions[0].resolve();
        continueWithResolutionResult(EffectResolutionResult.Resume);
    }
});
```

### Async Resolution with User Confirmation

```typescript
project.on('schedulingConflict', async ({ schedulingIssue, continueWithResolutionResult }) => {
    const resolutions = schedulingIssue.getResolutions();

    // Show custom dialog and wait for user choice
    const userChoice = await showCustomResolutionDialog(
        schedulingIssue.getDescription(),
        resolutions.map(r => r.getDescription())
    );

    if (userChoice >= 0) {
        resolutions[userChoice].resolve();
        continueWithResolutionResult(EffectResolutionResult.Resume);
    } else {
        continueWithResolutionResult(EffectResolutionResult.Cancel);
    }
});
```

---

## Configuration Options

### ProjectModel Configuration

```typescript
interface ProjectModelConfig {
    // Show resolution popup for scheduling issues
    displaySchedulingIssueResolutionPopup?: boolean;  // Default: true

    // Allow postponing conflicts
    allowPostponedConflicts?: boolean;  // Default: false

    // Auto-postpone conflicts (skip popup)
    autoPostponeConflicts?: boolean;  // Default: false

    // Custom popup classes
    schedulingIssueResolutionPopupClass?: typeof SchedulingIssueResolutionPopup;
    cycleResolutionPopupClass?: typeof CycleResolutionPopup;
}
```

### TaskModel Configuration

```typescript
interface TaskModelConfig {
    // How to handle project border constraints
    projectConstraintResolution?: 'honor' | 'ignore' | 'conflict';

    // Ignore resource calendars
    ignoreResourceCalendar?: boolean;

    // Stored postponed conflict
    postponedConflict?: object;
}
```

### Gantt Configuration

```typescript
const gantt = new Gantt({
    // Scheduling conflict popup settings
    displaySchedulingIssueResolutionPopup: true,
    schedulingIssueResolutionPopupClass: CustomSchedulingPopup,
    cycleResolutionPopupClass: CustomCyclePopup,

    project: {
        allowPostponedConflicts: true,
        autoPostponeConflicts: false,

        listeners: {
            schedulingConflict: handler,
            cycle: handler,
            emptyCalendar: handler
        }
    },

    // TaskInfoColumn shows postponed conflict indicators
    columns: [
        { type: 'taskinfo' }  // Shows conflict marker
    ]
});
```

---

## Example: Conflicts Demo

The Bryntum Gantt trial includes a conflicts demo that demonstrates all conflict types:

```javascript
// From examples/conflicts/app.umd.js

const gantt = new Gantt({
    appendTo: 'container',
    project: {
        autoSetConstraints: true,
        autoLoad: true,
        loadUrl: '../_datasets/constraints.json'
    },
    features: {
        indicators: {
            items: {
                constraintDate: true  // Show constraint indicators
            }
        }
    },
    tbar: {
        items: {
            // Add invalid self-referencing dependency
            addInvalid: {
                text: 'Add invalid dependency',
                onClick() {
                    gantt.dependencyStore.add({
                        fromTask: 11,
                        toTask: 11  // Self-reference - invalid!
                    });
                }
            },

            // Add circular dependency
            addCycle: {
                text: 'Add dependency cycle',
                onClick() {
                    gantt.dependencyStore.add({
                        fromTask: 15,
                        toTask: 14  // Creates cycle with existing dependency
                    });
                }
            },

            // Use invalid calendar (no working time)
            useInvalidCalendar: {
                text: 'Use invalid calendar',
                onClick() {
                    const [calendar] = gantt.calendarManagerStore.add({
                        name: 'My Calendar',
                        unspecifiedTimeIsWorking: false
                        // No working intervals = empty calendar
                    });
                    gantt.taskStore.getById(11).calendar = calendar;
                }
            }
        }
    }
});
```

---

## Summary

| Issue Type | Event | Key Resolutions |
|------------|-------|-----------------|
| Scheduling Conflict | `schedulingConflict` | Remove dependency, Deactivate dependency, Remove constraint, Postpone |
| Dependency Cycle | `cycle` | Remove dependency, Deactivate dependency |
| Empty Calendar | `emptyCalendar` | Use 24h calendar, Use 8h calendar, Ignore resource calendars |
| Project Constraint | `schedulingConflict` | Honor project border, Ignore project border |

| Resolution Result | Effect |
|-------------------|--------|
| `EffectResolutionResult.Cancel` | Reject the changes, revert to previous state |
| `EffectResolutionResult.Resume` | Continue calculation after applying resolution |

| Configuration | Default | Purpose |
|---------------|---------|---------|
| `displaySchedulingIssueResolutionPopup` | `true` | Show built-in resolution popup |
| `allowPostponedConflicts` | `false` | Allow postponing conflicts for later |
| `autoPostponeConflicts` | `false` | Automatically postpone all conflicts |

---

*Generated from Bryntum Gantt 7.1.0 TypeScript definitions and documentation*
