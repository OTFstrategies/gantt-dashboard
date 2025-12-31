# Deep-Dive: Bryntum Gantt Scheduling Engine

## Overview

The Bryntum Gantt scheduling engine is a sophisticated constraint-based scheduling system built on the Chronograph reactive computation engine. It manages task scheduling through a graph-based propagation model that automatically resolves dependencies, constraints, calendars, and resource allocations.

This document provides an in-depth analysis of the scheduling engine internals based on the Bryntum Gantt TypeScript definitions.

---

## 1. ProjectModel as Scheduling Container

The `ProjectModel` is the central container that orchestrates all scheduling operations. It holds all project data and manages the scheduling engine's computation graph.

### Key Configuration Options

```typescript
import { ProjectModel, ProjectModelConfig } from '@bryntum/gantt';

const projectConfig: ProjectModelConfig = {
    // Scheduling direction: Forward (ASAP) or Backward (ALAP)
    direction: 'Forward',

    // Project timeline boundaries
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),

    // Auto-add constraints when dates are set manually
    addConstraintOnDateSet: true,

    // Calendar configuration
    calendar: 'business',

    // Conflict handling
    allowPostponedConflicts: true,
    autoPostponeConflicts: false,

    // Scheduling behavior
    autoScheduleManualTasksOnSecondPass: true,
    autoSetConstraints: true,

    // Time unit conversions
    hoursPerDay: 8,
    daysPerWeek: 5,
    daysPerMonth: 20
};

const project = new ProjectModel(projectConfig);
```

### Core Stores Managed by ProjectModel

| Store | Purpose |
|-------|---------|
| `taskStore` | Contains all TaskModel instances |
| `dependencyStore` | Manages task dependencies |
| `assignmentStore` | Resource-to-task assignments |
| `resourceStore` | Resource definitions |
| `calendarManagerStore` | Calendar definitions |

### Project Data Loading Pattern

```typescript
const project = new ProjectModel({
    // Inline data approach
    tasks: [
        { id: 1, name: 'Task 1', startDate: '2024-01-15', duration: 5 },
        { id: 2, name: 'Task 2', duration: 3 }
    ],
    dependencies: [
        { fromTask: 1, toTask: 2, type: 2 } // Finish-to-Start
    ],
    calendars: [
        {
            id: 'business',
            name: 'Business Calendar',
            intervals: [
                { recurrentStartDate: 'on Sat at 0:00', recurrentEndDate: 'on Mon at 0:00', isWorking: false }
            ]
        }
    ]
});

// Or via CrudManager for server sync
const project = new ProjectModel({
    loadUrl: '/api/gantt/load',
    syncUrl: '/api/gantt/sync',
    autoLoad: true,
    autoSync: true
});
```

---

## 2. Forward vs Backward Scheduling (Direction)

The scheduling direction determines how tasks are positioned relative to the project timeline.

### Direction Types

| Direction | Alias | Behavior |
|-----------|-------|----------|
| `'Forward'` | ASAP (As-Soon-As-Possible) | Tasks stick to project start date |
| `'Backward'` | ALAP (As-Late-As-Possible) | Tasks stick to project end date |

### Configuration at Project Level

```typescript
const project = new ProjectModel({
    direction: 'Forward',  // Default: tasks scheduled ASAP
    startDate: new Date('2024-01-01')
});

// Backward scheduling
const backwardProject = new ProjectModel({
    direction: 'Backward',
    endDate: new Date('2024-12-31')  // Tasks work backward from this date
});
```

### Per-Task Direction Override

Individual tasks can override the project's scheduling direction:

```typescript
interface TaskModelConfig {
    direction?: 'Forward' | 'Backward';
    // The effective direction considers inheritance
    effectiveDirection?: EffectiveDirection;
}

// Task-level override
const task: TaskModelConfig = {
    id: 1,
    name: 'Critical Deliverable',
    direction: 'Backward',  // Schedule this task ALAP even in forward project
    duration: 10
};
```

### How Direction Affects Scheduling

**Forward Scheduling:**
- Tasks without predecessors start at project start date
- Successors are pushed forward based on dependencies
- Early dates are calculated first

**Backward Scheduling:**
- Tasks without successors end at project end date
- Predecessors are pulled backward based on dependencies
- Late dates are calculated first

---

## 3. Scheduling Modes

The `schedulingMode` field determines how the duration-effort-units triangle is resolved when changes occur.

### Available Scheduling Modes

```typescript
type SchedulingMode = 'Normal' | 'FixedDuration' | 'FixedEffort' | 'FixedUnits';
```

### Mode Behaviors

| Mode | Fixed Values | Computed Value | Use Case |
|------|--------------|----------------|----------|
| `Normal` | Duration | Effort | Standard scheduling, duration-based |
| `FixedDuration` | Duration | Effort | Duration cannot change |
| `FixedEffort` | Effort | Duration | Total work remains constant |
| `FixedUnits` | Units (assignment %) | Duration or Effort | Resource allocation is fixed |

### The Duration-Effort-Units Formula

```
Effort = Duration x Units
```

Where:
- **Effort**: Total work required (e.g., 40 hours)
- **Duration**: Calendar time span (e.g., 5 days)
- **Units**: Resource allocation percentage (e.g., 100%)

### Configuration Examples

```typescript
// Normal mode: duration is provided, effort is calculated
const normalTask: TaskModelConfig = {
    name: 'Normal Task',
    schedulingMode: 'Normal',
    duration: 5,
    durationUnit: 'day'
};

// Fixed Duration: adding resources reduces individual effort
const fixedDurationTask: TaskModelConfig = {
    name: 'Fixed Duration Task',
    schedulingMode: 'FixedDuration',
    duration: 10,
    effort: 80  // 80 hours total work
};

// Fixed Effort: adding resources shortens duration
const fixedEffortTask: TaskModelConfig = {
    name: 'Fixed Effort Task',
    schedulingMode: 'FixedEffort',
    effort: 40,
    effortUnit: 'hour'
};

// Fixed Units: effortDriven flag determines behavior
const fixedUnitsTask: TaskModelConfig = {
    name: 'Fixed Units Task',
    schedulingMode: 'FixedUnits',
    effortDriven: true  // Keep effort intact, adjust duration
};
```

### The effortDriven Flag

In `FixedUnits` mode, the `effortDriven` boolean determines behavior:

```typescript
interface TaskModelConfig {
    schedulingMode?: 'FixedUnits';
    effortDriven?: boolean;
    // true: effort is kept intact, duration is updated
    // false: duration is kept intact, effort is updated
}
```

---

## 4. Constraint Types

Constraints limit when tasks can be scheduled relative to specific dates.

### Available Constraint Types

| Constraint | Description | Behavior |
|------------|-------------|----------|
| `startnoearlierthan` | Start No Earlier Than | Task cannot start before date |
| `startnolaterthan` | Start No Later Than | Task cannot start after date |
| `finishnoearlierthan` | Finish No Earlier Than | Task cannot finish before date |
| `finishnolaterthan` | Finish No Later Than | Task cannot finish after date |
| `muststarton` | Must Start On | Task must start exactly on date |
| `mustfinishon` | Must Finish On | Task must finish exactly on date |
| `assoonaspossible` | As Soon As Possible | No constraint (forward scheduling default) |
| `aslateaspossible` | As Late As Possible | No constraint (backward scheduling default) |

### Constraint Configuration

```typescript
interface TaskModelConfig {
    constraintType?: string;    // e.g., 'startnoearlierthan'
    constraintDate?: string | Date;  // The constraint date
}

// Example: Task must not start before a specific date
const constrainedTask: TaskModelConfig = {
    id: 1,
    name: 'Review Meeting',
    constraintType: 'startnoearlierthan',
    constraintDate: '2024-03-15',
    duration: 2
};

// Hard constraint: must start on exact date
const mustStartTask: TaskModelConfig = {
    id: 2,
    name: 'Product Launch',
    constraintType: 'muststarton',
    constraintDate: '2024-06-01',
    duration: 1
};
```

### Auto-Constraint Behavior

When `addConstraintOnDateSet` is enabled (default), manually setting a start/end date automatically adds a constraint:

```typescript
const project = new ProjectModel({
    addConstraintOnDateSet: true  // Default: true
});

// When user drags task to new date:
// - Forward project: adds 'startnoearlierthan' constraint
// - Backward project: adds 'finishnolaterthan' constraint
```

### Project Constraint Resolution

The `projectConstraintResolution` field controls how tasks interact with project boundaries:

```typescript
interface TaskModelConfig {
    projectConstraintResolution?: 'honor' | 'ignore' | 'conflict';
    // 'honor': Respect project start/end dates
    // 'ignore': Allow scheduling outside project bounds
    // 'conflict': Trigger conflict resolution dialog
}
```

---

## 5. Calendar Integration and Working Time

Calendars define working and non-working time periods, affecting duration calculations and scheduling.

### CalendarModel Structure

```typescript
import { CalendarModel, CalendarModelConfig } from '@bryntum/gantt';

interface CalendarModelConfig {
    id?: string | number;
    name?: string;
    intervals?: CalendarIntervalModelConfig[] | Store;
    adjustDurationToDST?: boolean;  // Handle daylight saving time
}
```

### CalendarIntervalModel Configuration

```typescript
interface CalendarIntervalModelConfig {
    // For recurring intervals (weekly patterns)
    recurrentStartDate?: string;  // e.g., 'on Sat at 0:00'
    recurrentEndDate?: string;    // e.g., 'on Mon at 0:00'

    // For specific date ranges
    startDate?: string | Date;
    endDate?: string | Date;

    // Working status
    isWorking?: boolean;  // true = working time, false = non-working

    // Optional metadata
    name?: string;
    cls?: string;
}
```

### Calendar Examples

```typescript
const calendars: CalendarModelConfig[] = [
    {
        id: 'business',
        name: 'Standard Business Calendar',
        intervals: [
            // Weekend: non-working
            {
                recurrentStartDate: 'on Sat at 0:00',
                recurrentEndDate: 'on Mon at 0:00',
                isWorking: false
            },
            // Specific holiday
            {
                startDate: '2024-12-25',
                endDate: '2024-12-26',
                isWorking: false,
                name: 'Christmas'
            }
        ]
    },
    {
        id: '24x7',
        name: '24/7 Calendar',
        intervals: []  // No non-working intervals
    },
    {
        id: 'night-shift',
        name: 'Night Shift Calendar',
        intervals: [
            // Working hours: 10 PM to 6 AM
            {
                recurrentStartDate: 'every weekday at 06:00',
                recurrentEndDate: 'every weekday at 22:00',
                isWorking: false
            }
        ]
    }
];
```

### Calendar Hierarchy

Tasks can use their own calendar or inherit from the project:

```typescript
interface TaskModelConfig {
    calendar?: string | CalendarModel;  // Task-specific calendar
    effectiveCalendar?: CalendarModel;  // Computed: own or project calendar
    ignoreResourceCalendar?: boolean;   // Don't consider assigned resource calendars
}

// Task using specific calendar
const nightShiftTask: TaskModelConfig = {
    name: 'Server Maintenance',
    calendar: 'night-shift',
    duration: 4
};
```

### Dependency Calendar Source

The project can configure which calendar is used for dependency lag calculations:

```typescript
const project = new ProjectModel({
    dependenciesCalendar: 'ToEvent'  // or 'FromEvent', 'Project', 'AllWorking'
});
```

---

## 6. Critical Path Calculation

The critical path identifies tasks that directly affect the project completion date.

### Critical Path Concepts

| Term | Definition |
|------|------------|
| **Critical Path** | Longest sequence of dependent tasks determining minimum project duration |
| **Critical Task** | Task on the critical path; delaying it delays the project |
| **Total Slack** | Time a task can be delayed without affecting project end date |
| **Early Start/End** | Earliest possible dates based on predecessors |
| **Late Start/End** | Latest possible dates based on successors |

### Enabling Critical Path Feature

```typescript
import { Gantt, GanttConfig } from '@bryntum/gantt';

const ganttConfig: GanttConfig = {
    features: {
        criticalPaths: true  // Enable critical path highlighting
    },
    project: {
        maxCriticalPaths: 10  // Limit number of paths to calculate
    }
};
```

### Critical Path Fields on TaskModel

```typescript
interface TaskModel {
    // Read-only calculated fields
    readonly critical: boolean;        // Is task on critical path?
    readonly totalSlack: number;       // Slack in slackUnit
    readonly slackUnit: string;        // Unit for totalSlack
    readonly earlyStartDate: Date;     // Earliest possible start
    readonly earlyEndDate: Date;       // Earliest possible end
    readonly lateStartDate: Date;      // Latest possible start
    readonly lateEndDate: Date;        // Latest possible end
}
```

### Accessing Critical Path Data

```typescript
// Get all critical paths from project
const criticalPaths: any[] = project.criticalPaths;

// Check if specific task is critical
const isCritical = task.critical;

// Get task slack
const slack = task.totalSlack;  // e.g., 0 for critical tasks
const unit = task.slackUnit;     // e.g., 'day'

// Listen for critical path changes
gantt.on({
    criticalPathsHighlighted: () => {
        console.log('Critical paths highlighted');
    },
    criticalPathsUnhighlighted: () => {
        console.log('Critical paths hidden');
    }
});
```

### Critical Path Configuration

```typescript
interface ProjectModelConfig {
    // Maximum number of critical paths to calculate
    maxCriticalPaths?: number;  // Default: prevents browser overload
}
```

---

## 7. Effort-Driven Scheduling

Effort-driven scheduling maintains total work hours when resources are added or removed.

### Core Concept

When `effortDriven` is true:
- Adding resources shortens task duration
- Removing resources lengthens task duration
- Total effort (work hours) remains constant

### Configuration

```typescript
interface TaskModelConfig {
    effort?: number;           // Total work required
    effortUnit?: DurationUnit; // Unit for effort (e.g., 'hour')
    effortDriven?: boolean;    // Maintain effort when resources change
    schedulingMode?: 'FixedUnits';  // Required for effortDriven to apply
}

const effortDrivenTask: TaskModelConfig = {
    name: 'Development Sprint',
    schedulingMode: 'FixedUnits',
    effortDriven: true,
    effort: 160,        // 160 hours of work
    effortUnit: 'hour',
    duration: 10        // Initial: 2 resources at 100% = 16h/day
};
```

### Effort Calculation Example

```typescript
// Initial state: 1 resource at 100%
// Effort: 40h, Duration: 5 days (8h/day)

// After adding second resource at 100%:
// Effort: 40h (unchanged because effortDriven=true)
// Duration: 2.5 days (40h / (2 * 8h/day))
```

### Assignment-Level Effort

Assignments can track effort contributed by each resource:

```typescript
interface AssignmentModel {
    effort: number;         // Effort for this assignment
    effortUnit: number;     // Unit for assignment effort
    units: number;          // Allocation percentage (e.g., 100)
}
```

---

## 8. Propagation and commitAsync()

The scheduling engine uses asynchronous propagation to resolve changes through the dependency graph.

### Understanding Propagation

When data changes (task dates, dependencies, constraints), the engine:
1. Detects affected nodes in the computation graph
2. Recalculates derived values
3. Propagates changes to dependent nodes
4. Resolves conflicts if any

### The commitAsync() Method

```typescript
class ProjectModel {
    /**
     * Commits pending changes to the scheduling engine.
     * Project changes are automatically committed on a buffer.
     * Use this to force immediate propagation.
     */
    commitAsync(): Promise<void>;

    /**
     * Triggers full recalculation of task data and constraints.
     */
    propagate(): Promise<void>;
}
```

### Usage Patterns

```typescript
// Pattern 1: Direct property changes (auto-batched)
task.startDate = new Date('2024-03-15');
task.duration = 10;
// Changes are automatically committed after a buffer

// Pattern 2: Forcing immediate propagation
async function moveTask(task: TaskModel, newDate: Date) {
    task.startDate = newDate;
    await project.commitAsync();  // Wait for scheduling to complete
    console.log('New end date:', task.endDate);
}

// Pattern 3: Batching multiple changes
async function batchChanges() {
    project.taskStore.beginBatch();

    task1.duration = 5;
    task2.startDate = new Date('2024-04-01');
    task3.constraintType = 'muststarton';

    project.taskStore.endBatch();
    await project.commitAsync();
}
```

### The queue() Method for Transactions

```typescript
// Use queue() for sequential operations that depend on each other
await project.queue(async () => {
    task.duration = 10;
    await project.commitAsync();

    // Now safe to read calculated values
    const newEndDate = task.endDate;

    // Make dependent changes
    successor.constraintDate = newEndDate;
    await project.commitAsync();
});
```

### Propagation Events

```typescript
project.on({
    // Before propagation starts
    beforeCommit: ({ project }) => {
        console.log('About to propagate changes');
    },

    // After propagation completes
    dataReady: ({ project }) => {
        console.log('Scheduling complete');
    },

    // Progress for long calculations
    progress: ({ progress }) => {
        console.log(`Calculation ${progress}% complete`);
    }
});
```

---

## 9. Scheduling Conflicts and Resolution

Conflicts occur when constraints, dependencies, or dates create impossible scheduling scenarios.

### Types of Conflicts

1. **Dependency vs Constraint**: Predecessor pushes task past its constraint date
2. **Circular Dependencies**: Tasks depend on each other in a cycle
3. **Resource Overallocation**: More work assigned than available time
4. **Project Boundary Violation**: Task scheduled outside project dates

### Conflict Detection Event

```typescript
project.on({
    schedulingConflict: (event) => {
        const { schedulingIssue, continueWithResolutionResult } = event;

        // Get conflict description
        const description = schedulingIssue.getDescription();

        // Get conflicting intervals
        const intervals = schedulingIssue.intervals;

        // Get possible resolutions
        const resolutions = schedulingIssue.getResolutions();

        // Apply a resolution
        continueWithResolutionResult(resolutions[0]);
    }
});
```

### Conflict Resolution Options

```typescript
interface ProjectModelConfig {
    // Show "postpone" option in conflict dialog
    allowPostponedConflicts?: boolean;

    // Auto-postpone instead of showing dialog
    autoPostponeConflicts?: boolean;
}
```

### Postponed Conflicts

When conflicts are postponed, they're stored on the task for later resolution:

```typescript
interface TaskModel {
    postponedConflict?: object;  // Stored conflict data

    // Resolve postponed conflict
    resolvePostponedConflict(): Promise<void>;
}

// Visualize postponed conflicts with TaskInfoColumn
const gantt = new Gantt({
    columns: [
        { type: 'name' },
        { type: 'taskinfo' }  // Shows conflict indicators
    ]
});
```

### Conflict Resolution Pattern

```typescript
async function handleConflicts(project: ProjectModel) {
    project.on({
        schedulingConflict: async ({ schedulingIssue, continueWithResolutionResult }) => {
            const resolutions = schedulingIssue.getResolutions();

            // Example: Show custom dialog
            const userChoice = await showConflictDialog({
                description: schedulingIssue.getDescription(),
                options: resolutions.map(r => r.getDescription())
            });

            if (userChoice !== null) {
                continueWithResolutionResult(resolutions[userChoice]);
            } else {
                // User cancelled - postpone the conflict
                continueWithResolutionResult(null);
            }
        }
    });
}
```

---

## 10. Manual vs Automatic Scheduling

Tasks can be excluded from automatic scheduling calculations.

### The manuallyScheduled Field

```typescript
interface TaskModelConfig {
    manuallyScheduled?: boolean;
    // When true: startDate is NOT changed by dependencies or constraints
}

const manualTask: TaskModelConfig = {
    name: 'Fixed Milestone',
    manuallyScheduled: true,
    startDate: '2024-06-15',
    duration: 0
};
```

### Behavior Differences

| Aspect | Automatic (`false`) | Manual (`true`) |
|--------|---------------------|-----------------|
| Dependencies | Respect predecessor finish dates | Ignored |
| Constraints | Enforced | Ignored |
| Project direction | Follows ASAP/ALAP | Fixed position |
| Drag & drop | Triggers recalculation | Simple move |
| Successors | Pushed accordingly | Still affected |

### Second Pass Scheduling

Manual tasks can still participate in late date calculations:

```typescript
const project = new ProjectModel({
    // Enable second pass for manual tasks
    autoScheduleManualTasksOnSecondPass: true
    // Manual tasks get calculated late dates (slack calculation)
});
```

### The inactive Field

Completely excludes a task from scheduling:

```typescript
interface TaskModelConfig {
    inactive?: boolean;
    // When true: Task doesn't affect or get affected by scheduling
}

// Programmatic control
async function toggleTaskActive(task: TaskModel, active: boolean) {
    await task.setInactive(!active);
}
```

### Practical Patterns

```typescript
// Pattern 1: External milestone (fixed date from outside)
const externalMilestone: TaskModelConfig = {
    name: 'Client Approval Deadline',
    manuallyScheduled: true,
    constraintType: 'mustfinishon',
    constraintDate: '2024-09-30',
    duration: 0
};

// Pattern 2: Placeholder task (not yet scheduled)
const placeholderTask: TaskModelConfig = {
    name: 'Future Phase',
    inactive: true,
    duration: 20
};

// Pattern 3: What-if scenario (temp disable)
async function runWhatIfScenario(task: TaskModel) {
    const originalManual = task.manuallyScheduled;

    task.manuallyScheduled = true;
    task.startDate = new Date('2024-08-01');
    await project.commitAsync();

    // Analyze impact on successors
    const impactedTasks = task.allDependencies
        .filter(dep => dep.fromTask === task)
        .map(dep => dep.toTask);

    // Restore
    task.manuallyScheduled = originalManual;
    await project.commitAsync();

    return impactedTasks;
}
```

---

## 11. Baselines (Project Snapshots)

Baselines allow you to capture a snapshot of the project schedule at a specific point in time, enabling comparison between planned and actual progress.

### Baseline Model Structure

```typescript
import { Baseline, BaselineConfig } from '@bryntum/gantt';

interface BaselineConfig {
    // Core dates
    startDate?: string | Date;
    endDate?: string | Date;

    // Duration
    duration?: number;
    durationUnit?: DurationUnit;

    // Effort (for effort-driven tasks)
    effort?: number;
    effortUnit?: DurationUnit;

    // Styling
    cls?: string;
    style?: string;

    // Reference to parent task
    task?: TaskModel;

    // Index for multiple baselines
    parentIndex?: number;
}
```

### Baseline Properties on TaskModel

```typescript
interface TaskModel {
    // Store of baselines for this task
    baselines?: BaselineConfig[] | Store;

    // Calculated variance fields
    readonly durationVariance: Duration;  // Baseline vs actual duration
    readonly startVariance: Duration;     // Baseline vs actual start
    readonly endVariance: Duration;       // Baseline vs actual end
}
```

### Enabling the Baselines Feature

```typescript
const gantt = new Gantt({
    features: {
        baselines: {
            // Show baselines below task bars
            disabled: false,

            // Tooltip template for baseline bars
            template: ({ baseline }) => `
                Baseline ${baseline.parentIndex + 1}:
                ${DateHelper.format(baseline.startDate, 'MMM D')} -
                ${DateHelper.format(baseline.endDate, 'MMM D')}
            `
        }
    },

    columns: [
        { type: 'name' },
        // Baseline-specific columns
        { type: 'baselinestartdate', text: 'Baseline Start' },
        { type: 'baselineenddate', text: 'Baseline End' },
        { type: 'baselineduration', text: 'Baseline Duration' },
        // Variance columns
        { type: 'baselinestartvariance', text: 'Start Variance' },
        { type: 'baselineendvariance', text: 'End Variance' },
        { type: 'baselinedurationvariance', text: 'Duration Variance' }
    ]
});
```

### Creating a Baseline Snapshot

```typescript
// Add a baseline to a single task
async function addBaseline(task: TaskModel) {
    task.baselines = [
        ...(task.baselines || []),
        {
            startDate: task.startDate,
            endDate: task.endDate,
            duration: task.duration,
            durationUnit: task.durationUnit
        }
    ];
    await project.commitAsync();
}

// Create baselines for all tasks (project snapshot)
async function createProjectBaseline(project: ProjectModel) {
    const baselineIndex = getNextBaselineIndex(project);

    project.taskStore.forEach(task => {
        if (!task.isRoot) {
            const baselines = task.baselines || [];
            baselines.push({
                parentIndex: baselineIndex,
                startDate: task.startDate,
                endDate: task.endDate,
                duration: task.duration,
                effort: task.effort
            });
            task.baselines = baselines;
        }
    });

    await project.commitAsync();
}

function getNextBaselineIndex(project: ProjectModel): number {
    let maxIndex = -1;
    project.taskStore.forEach(task => {
        if (task.baselines) {
            task.baselines.forEach(b => {
                if (b.parentIndex > maxIndex) {
                    maxIndex = b.parentIndex;
                }
            });
        }
    });
    return maxIndex + 1;
}
```

### Baseline Column Configuration

```typescript
// Display a specific baseline (default is index 0)
const columns = [
    // First baseline (index 0)
    { type: 'baselinestartdate', baselineIndex: 0, text: 'Original Start' },
    { type: 'baselineenddate', baselineIndex: 0, text: 'Original End' },

    // Second baseline (index 1)
    { type: 'baselinestartdate', baselineIndex: 1, text: 'Rev. 1 Start' },
    { type: 'baselineenddate', baselineIndex: 1, text: 'Rev. 1 End' }
];
```

---

## 12. Progress Calculation (percentDone)

The `percentDone` field tracks task completion and can be calculated automatically for parent tasks.

### Progress Configuration

```typescript
interface TaskModelConfig {
    // Manual progress percentage (0-100)
    percentDone?: number;

    // Show milestone at 100%
    showMilestoneAtComplete?: boolean;
}

interface ProjectModelConfig {
    // Calculate parent progress from children
    autoCalculatePercentDone?: boolean;

    // What to calculate: 'percentDone' | 'effort' | 'duration'
    calculateWhat?: string;
}
```

### Progress Calculation Strategies

```typescript
const project = new ProjectModel({
    // Auto-calculate parent percentDone based on children
    autoCalculatePercentDone: true
});

// For parent tasks, percentDone is calculated as:
// Sum of (child.percentDone * child.duration) / Sum of (child.duration)
// This gives duration-weighted average
```

### Progress Visual Rendering

```typescript
// Custom renderer showing progress bar
const gantt = new Gantt({
    taskRenderer: ({ taskRecord, renderData }) => {
        const percent = taskRecord.percentDone || 0;

        // Add progress indicator inside task bar
        renderData.children.push({
            class: 'progress-indicator',
            style: `width: ${percent}%`,
            children: [
                { tag: 'span', text: `${Math.round(percent)}%` }
            ]
        });

        return renderData;
    },

    columns: [
        { type: 'name' },
        { type: 'percentdone', text: '% Complete', width: 100 }
    ]
});
```

### Updating Progress

```typescript
// Direct update
task.percentDone = 50;
await project.commitAsync();

// Via drag on progress bar (built-in feature)
const gantt = new Gantt({
    features: {
        percentBar: {
            // Enable drag-to-update progress
            disabled: false,

            // Show tooltip while dragging
            showTooltip: true
        }
    }
});
```

---

## 13. Cross-References

### Related Deep-Dive Documents

| Document | Relationship |
|----------|--------------|
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | ProjectModel data structure, Store hierarchy |
| [DEEP-DIVE-DEPENDENCIES](./DEEP-DIVE-DEPENDENCIES.md) | How dependencies affect scheduling |
| [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) | Scheduling events (beforeCommit, dataReady) |
| [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) | Visual representation of scheduled tasks |
| [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md) | Persisting schedule changes |

### Key API References (Level 1)

- `ProjectModelConfig` - Project scheduling configuration
- `TaskModelConfig` - Task scheduling fields
- `CalendarModelConfig` - Working time definitions
- `DependencyModelConfig` - Dependency scheduling impact

---

## Summary: Scheduling Engine Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ProjectModel                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   TaskStore  │  │ Dependency   │  │ CalendarManager      │   │
│  │              │  │   Store      │  │      Store           │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         └────────────┬────┴──────────────────────┘               │
│                      │                                           │
│              ┌───────▼───────┐                                   │
│              │  Chronograph  │                                   │
│              │    Engine     │◄──── Reactive Computation Graph   │
│              └───────┬───────┘                                   │
│                      │                                           │
│         ┌────────────┼────────────────────┐                      │
│         │            │                    │                      │
│    ┌────▼────┐  ┌────▼────┐         ┌────▼────┐                 │
│    │ Forward │  │ Backward│         │Conflict │                 │
│    │  Pass   │  │  Pass   │         │Resolution│                │
│    │(Early)  │  │ (Late)  │         │         │                 │
│    └────┬────┘  └────┬────┘         └────┬────┘                 │
│         │            │                    │                      │
│         └────────────┴────────────────────┘                      │
│                      │                                           │
│              ┌───────▼───────┐                                   │
│              │ commitAsync() │                                   │
│              │   Promise     │                                   │
│              └───────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Integration Points

1. **Data Entry**: Tasks, dependencies, calendars loaded into stores
2. **Graph Building**: Chronograph builds reactive computation graph
3. **Forward Pass**: Calculate early dates (earliest possible)
4. **Backward Pass**: Calculate late dates (latest possible)
5. **Conflict Detection**: Identify unsolvable constraints
6. **Resolution**: Apply user-selected or automatic resolution
7. **Commit**: Finalize changes and update UI

---

## Quick Reference: Essential Types

```typescript
// Scheduling modes
type SchedulingMode = 'Normal' | 'FixedDuration' | 'FixedEffort' | 'FixedUnits';

// Directions
type Direction = 'Forward' | 'Backward';

// Common constraint types
type ConstraintType =
    | 'startnoearlierthan'
    | 'startnolaterthan'
    | 'finishnoearlierthan'
    | 'finishnolaterthan'
    | 'muststarton'
    | 'mustfinishon'
    | 'assoonaspossible'
    | 'aslateaspossible';

// Dependency types (standard values)
// 0 = Start-to-Start
// 1 = Start-to-Finish
// 2 = Finish-to-Start (most common)
// 3 = Finish-to-Finish

// Duration units
type DurationUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
```

---

*Document generated from Bryntum Gantt type definitions analysis.*
