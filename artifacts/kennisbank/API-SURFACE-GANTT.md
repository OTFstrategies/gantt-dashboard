# BRYNTUM GANTT API SURFACE

> Complete API reference extracted from gantt.d.ts (504,612 lines)

---

## 1. MAIN CLASSES

| Class | Purpose |
|-------|---------|
| `Gantt` | Main Gantt component view |
| `GanttBase` | Base class with core functionality |
| `TaskModel` | Task/Event model |
| `DependencyModel` | Dependency relationships |
| `ResourceModel` | Resources |
| `AssignmentModel` | Task-Resource assignments |
| `CalendarModel` | Working time calendars |
| `ProjectModel` | Project container & scheduling engine |

---

## 2. TASKMODEL

### Static Properties

```typescript
static readonly isPartOfProject: boolean
static readonly isPercentDoneMixin: boolean
static readonly isTaskModel: boolean
static convertEmptyParentToLeaf: boolean|ConvertEmptyParentToLeafOptions
```

### Core Scheduling Properties

```typescript
duration: number
durationUnit: DurationUnit  // 'day'|'hour'|'minute'|...
effort: number
effortUnit: DurationUnit
effortDriven: boolean
startDate: string|Date      // ISO 8601
endDate: string|Date
```

### Scheduling Control

```typescript
schedulingMode: 'Normal'|'FixedDuration'|'FixedEffort'|'FixedUnits'
manuallyScheduled: boolean
direction: 'Forward'|'Backward'
inactive: boolean
```

### Calculated Fields (Read-only)

```typescript
readonly earlyStartDate: Date
readonly earlyEndDate: Date
readonly lateStartDate: Date
readonly lateEndDate: Date
readonly totalSlack: number
readonly critical: boolean
readonly durationMS: number
```

### Constraints

```typescript
constraintType: 'finishnoearlierthan'|'finishnolaterthan'|
                'mustfinishon'|'muststarton'|
                'startnoearlierthan'|'startnolaterthan'|null
constraintDate: string|Date|null
projectConstraintResolution: 'honor'|'ignore'|'conflict'
```

### Calendar & Resources

```typescript
calendar: CalendarModel
effectiveCalendar: CalendarModel       // Read-only
ignoreResourceCalendar: boolean
assigned: Set<any>                     // Read-only
assignments: AssignmentModel[]         // Read-only
```

### UI & Display

```typescript
name: string
percentDone: number                    // 0-100
eventColor: EventColor
iconCls: string
taskIconCls: string
cls: DomClassList|string
children: boolean|object[]|TaskModel[]
rollup: boolean
showInTimeline: boolean
```

### Baselines & Segments

```typescript
baselines: BaselineConfig[]|Store
segments: EventSegmentModel[]
```

### Other Properties

```typescript
cost: number
deadlineDate: string|Date
note: string
draggable: boolean
resizable: boolean|'start'|'end'
postponedConflict: object
```

### Key Methods

```typescript
// Resource Assignment
assign(resource, units?, rateTable?, cost?): Promise<void>
unassign(resource): Promise<void>
getAssignmentFor(resource): AssignmentModel|null

// Scheduling
setStartDate(date, keepDuration?): Promise<void>
setEndDate(date, keepDuration?): Promise<void>
setDuration(duration, unit?): Promise<void>
setEffort(effort, unit?): Promise<void>
setConstraint(type, date?): Promise<void>
setInactive(inactive): Promise<void>
setCalendar(calendar): Promise<void>

// Milestones
convertToMilestone(): Promise<void>
convertToRegular(): Promise<void>

// Baselines
getBaseline(version): Baseline
setBaseline(version): void
getPlannedPercentDone(statusDate, baselineVersion?): number

// Segments
splitToSegments(from, lag?, lagUnit?): Promise<any>
mergeSegments(segment1?, segment2?): Promise<any>

// Utilities
commitAsync(): Promise<void>
isEditable(fieldName): boolean
refreshWbs(options?, index?): void
```

### Relationships (Read-only)

```typescript
readonly predecessors: DependencyModel[]
readonly successors: DependencyModel[]
readonly predecessorTasks: TaskModel[]
readonly successorTasks: TaskModel[]
readonly incomingDeps: Set<any>
readonly outgoingDeps: Set<any>
readonly allDependencies: DependencyModel[]

readonly project: SchedulerProProjectModel
readonly taskStore: EventStore
readonly isStarted: boolean
readonly isInProgress: boolean
readonly isCompleted: boolean
readonly unscheduled: boolean
readonly wbsValue: Wbs|string
readonly sequenceNumber: number
```

---

## 3. PROJECTMODEL

### Core Configuration

```typescript
name: string
description: string
startDate: string|Date
endDate: string|Date               // Calculated
calendar: CalendarModel
statusDate: Date
```

### Store References

```typescript
eventStore: TaskStore              // alias: taskStore
resourceStore: ResourceStore
assignmentStore: AssignmentStore
dependencyStore: DependencyStore
calendarManagerStore: CalendarManagerStore
timeRangeStore: Store
```

### Data Arrays

```typescript
tasks: TaskModel[]|TaskModelConfig[]
resources: ResourceModel[]|ResourceModelConfig[]
assignments: AssignmentModel[]|AssignmentModelConfig[]
dependencies: DependencyModel[]|DependencyModelConfig[]
calendars: CalendarModel[]|CalendarModelConfig[]
timeRanges: TimeRangeModel[]|TimeRangeModelConfig[]
```

### Scheduling Configuration

```typescript
direction: 'Forward'|'Backward'
daysPerWeek: number
daysPerMonth: number
hoursPerDay: number
dependenciesCalendar: 'ToEvent'|'FromEvent'|'Project'|'AllWorking'
```

### Scheduling Logic

```typescript
addConstraintOnDateSet: boolean
autoCalculatePercentDoneForParentTasks: boolean
autoMergeAdjacentSegments: boolean
autoPostponeConflicts: boolean
allowPostponedConflicts: boolean
```

### Data Management

```typescript
loadUrl: string
syncUrl: string
forceSync: boolean
crudStores: CrudManagerStoreDescriptor[]
maxCriticalPathsCount: number
criticalPaths: any[]
json: string
inlineData: object
```

### Key Methods

```typescript
// CRUD
load(options?): Promise<any>
loadInlineData(dataPackage): Promise<void>
sync(): Promise<any>
addCrudStore(store, position?, fromStore?): void
removeCrudStore(store): void
getCrudStore(storeId): Store
crudStoreHasChanges(storeId?): boolean

// Changes
acceptChanges(): void
revertChanges(): void
clearChanges(): void
applyChangeset(changes, transformFn?, phantomIdField?, clearChanges?): void
applyProjectChanges(changes): Promise<any>

// Scheduling
propagate(): Promise<void>
commitAsync(): Promise<void>
queue(fn, handleReject): void

// Events
on(config, thisObj?, oldThisObj?): Function
addListener(config, thisObj?, oldThisObj?): Function
removeListener(config, thisObj, oldThisObj): boolean
trigger(eventName, param?): Promise<boolean|any>
suspendEvents(queue?): void
resumeEvents(): boolean

// Propagation Control
suspendPropagate(): void
resumePropagate(trigger?): Promise<void>
suspendAutoSync(): void
resumeAutoSync(doSync?): void
```

### Key Events

```typescript
// Data Sync
beforeLoad(event: {source, pack})
load(event: {source, response, requestOptions, rawResponse})
loadFail(event: {source, response, responseText, requestOptions})
beforeSync(event: {source, pack})
sync(event: {source, response, requestOptions})
syncFail(event: {source, response, responseText})

// Scheduling
dataReady(event: {source, isInitialCommit, records})
change(event: {source, store, action, record, records, changes})
hasChanges(event: {source})
noChanges(event: {source})
progress(event: {source, total, remaining, phase})

// Conflicts
cycle(event: {schedulingIssue, continueWithResolutionResult})
schedulingConflict(event: {schedulingIssue, continueWithResolutionResult})
emptyCalendar(event: {schedulingIssue, continueWithResolutionResult})
```

---

## 4. DEPENDENCYMODEL

```typescript
fromTask: string|number|TaskModel
toTask: string|number|TaskModel
type: number                  // 0=SS, 1=SF, 2=FS, 3=FF
lag: number
lagUnit: DurationUnit
calendar: CalendarModel

static readonly isDependencyModel: boolean
```

---

## 5. RESOURCEMODEL

```typescript
name: string
calendar: CalendarModel

readonly events: EventModel[]  // Assigned tasks
```

---

## 6. ASSIGNMENTMODEL

```typescript
event: string|number|TaskModel
resource: string|number|ResourceModel
units: number                  // 0-100
startDate: Date
endDate: Date
duration: number
durationUnit: DurationUnit
effort: number
effortUnit: DurationUnit
```

---

## 7. CALENDARMODEL

```typescript
name: string
intervals: CalendarIntervalModel[]
```

---

## 8. GANTT & GANTTBASE (VIEW)

### Gantt Static

```typescript
static readonly isGantt: boolean
```

### GanttBase Configuration

```typescript
project: ProjectModel
taskStore: TaskStore
readOnly: boolean
eventColor: EventColor
allowDropOnEventBar: boolean
scrollTaskIntoViewOnCellClick: boolean|BryntumScrollOptions
toggleParentTasksOnClick: boolean
showUnscheduledTasks: boolean
showTooltip: boolean
```

### Terminal Configuration

```typescript
terminalSize: number|string
terminalOffset: number
terminalShowDelay: number
terminalHideDelay: number
```

### Templates

```typescript
creationTooltipTemplate: (data) => string|DomConfig
tooltipTemplate: (dependency) => string|DomConfig
```

### Key Events

```typescript
// Task Drag/Drop
beforeTaskDrag(event)
beforeTaskDropFinalize(event)
afterTaskDrop(event)

// Task Creation
beforeDragCreate(event)
dragCreateStart(event)
dragCreateEnd(event)

// Task Resize
beforeTaskResize(event)
beforeTaskResizeFinalize(event)

// Task Editing
beforeTaskAdd(event)
beforeTaskEdit(event)
beforeTaskSave(event)
afterTaskSave(event)

// Task Rendering
renderTask(event)
releaseTask(event)

// Dependency Creation
beforeDependencyCreateDrag(event)
beforeDependencyCreateFinalize(event)
afterDependencyCreateDrop(event)

// Dependency Editing
beforeDependencyEdit(event)
beforeDependencySave(event)
afterDependencySave(event)

// Click Events
taskClick(event)
taskContextMenu(event)
taskDblClick(event)
cellClick(event)

// Critical Path
criticalPathsHighlighted()
criticalPathsUnhighlighted()

// Percent Bar
percentBarDrag(event)

// Selection
beforeSelectionChange(event)
selectionChange(event)
```

---

## 9. FEATURES

Available via `gantt.features`:

| Feature | Purpose |
|---------|---------|
| `TaskDrag` | Drag tasks in timeline |
| `TaskResize` | Resize task bars |
| `DependencyCreation` | Create dependencies by dragging |
| `DependencyEdit` | Edit dependency properties |
| `NonWorkingTime` | Highlight non-working periods |
| `TimeRanges` | Display time ranges |
| `ProjectEdit` | Edit project properties |
| `TaskEdit` | Edit task properties |
| `CellEdit` | Edit grid cells |
| `RowEdit` | Edit entire rows |
| `Search` | Search functionality |
| `Sort` | Column sorting |
| `Filter` | Data filtering |
| `ColumnReorder` | Drag column reordering |
| `ColumnResize` | Column resizing |
| `ColumnPicker` | Show/hide columns |
| `HeaderMenu` | Column context menu |
| `CellMenu` | Cell context menu |
| `TreeGroup` | Tree grouping |
| `Export` | CSV/Excel export |
| `Print` | Print functionality |
| `CriticalPaths` | Critical path highlighting |
| `ProgressLine` | Project progress line |

---

## 10. ENUMS & TYPES

### DurationUnit

```typescript
'millisecond' | 'second' | 'minute' | 'hour' |
'day' | 'week' | 'month' | 'quarter' | 'year'
```

### EventColor

```typescript
'red' | 'orange' | 'yellow' | 'green' | 'blue' |
'indigo' | 'violet' | 'lime' | 'pink' | 'purple' |
'teal' | 'cyan' | 'gray' | 'black' | 'white' |
// Or custom: '#hexcolor' | 'rgb(r,g,b)'
```

### SchedulingMode

```typescript
'Normal' | 'FixedDuration' | 'FixedEffort' | 'FixedUnits'
```

### Direction

```typescript
'Forward' | 'Backward'
```

### ConstraintType

```typescript
'finishnoearlierthan' | 'finishnolaterthan' |
'mustfinishon' | 'muststarton' |
'startnoearlierthan' | 'startnolaterthan' | null
```

### Dependency Type

```typescript
0 = Start-to-Start (SS)
1 = Start-to-Finish (SF)
2 = Finish-to-Start (FS) // Default
3 = Finish-to-Finish (FF)
```

---

## 11. USAGE PATTERNS

### Project Initialization

```typescript
const project = new ProjectModel({
    startDate: new Date(),
    loadUrl: '/api/project',
    autoLoad: true,
    stm: { autoRecord: true }
});
```

### Gantt Initialization

```typescript
const gantt = new Gantt({
    appendTo: '#container',
    project,
    columns: [
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'duration' }
    ],
    features: {
        taskDrag: true,
        taskResize: true,
        dependencyCreation: true,
        criticalPaths: { disabled: false }
    }
});
```

### Async Operations

```typescript
const task = project.taskStore.getById(1);
await task.setStartDate(new Date('2025-01-15'));
await task.setDuration(5, 'day');
await project.commitAsync();
```

### Event Listening

```typescript
gantt.on({
    beforeTaskEdit({ taskRecord }) {
        return taskRecord.isEditable('name');
    },
    taskClick({ taskRecord, event }) {
        console.log('Clicked:', taskRecord.name);
    }
});
```

---

## SUMMARY

| Metric | Count |
|--------|-------|
| Model Classes | 10+ |
| Config Options | 50+ per class |
| Public Methods | 30+ |
| Events | 40+ |
| Features | 15+ |

**Source:** `gantt.d.ts` - 504,612 lines
