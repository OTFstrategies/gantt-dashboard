# Bryntum TypeScript API Reference

> **Bron**: Officiële Bryntum Gantt v7.1.0 TypeScript definitions (`gantt.d.ts` - 504K lines)

---

## Core Types & Enums

### DurationUnit

```typescript
type DurationUnit =
    | 'millisecond' | 'ms'
    | 'second' | 's'
    | 'minute' | 'min'
    | 'hour' | 'h'
    | 'day' | 'd'
    | 'week' | 'w'
    | 'month' | 'M'
    | 'quarter' | 'q'
    | 'year' | 'y';
```

### EventColor

```typescript
type EventColor =
    | 'red' | 'pink' | 'magenta' | 'purple' | 'violet'
    | 'deep-purple' | 'indigo' | 'blue' | 'light-blue'
    | 'cyan' | 'teal' | 'green' | 'light-green' | 'lime'
    | 'yellow' | 'orange' | 'amber' | 'deep-orange'
    | 'light-gray' | 'gray' | 'black'
    | string | null;
```

### ConstraintType

```typescript
type ConstraintType =
    | 'finishnoearlierthan'
    | 'finishnolaterthan'
    | 'mustfinishon'
    | 'muststarton'
    | 'startnoearlierthan'
    | 'startnolaterthan'
    | null;
```

### SchedulingDirection

```typescript
type Direction = 'Forward' | 'Backward';
```

### HttpMethods

```typescript
type HttpMethods = {
    create: 'POST' | 'PUT';
    read: 'GET' | 'POST';
    update: 'PATCH' | 'POST' | 'PUT';
    delete: 'DELETE' | 'POST';
}
```

---

## TaskModel

Het centrale model voor taken in Gantt.

### Core Fields

```typescript
export class TaskModel extends TimeSpan {
    // Identification
    id: string | number;
    name: string;

    // Scheduling
    startDate: string | Date;
    endDate: string | Date;
    duration: number;
    durationUnit: DurationUnit;
    readonly durationMS: number;

    // Progress
    percentDone: number;
    readonly renderedPercentDone: number;
    readonly isCompleted: boolean;
    readonly isInProgress: boolean;
    readonly isStarted: boolean;

    // Effort
    effort: number;
    effortUnit: DurationUnit;
    effortDriven: boolean;
    fullEffort: Duration;
    readonly actualEffort: number;

    // Constraints
    constraintType: ConstraintType;
    constraintDate: string | Date | null;
    manuallyScheduled: boolean;

    // Direction & Scheduling
    direction: 'Forward' | 'Backward';
    effectiveDirection: EffectiveDirection;

    // Resources
    readonly assigned: Set<any>;
    readonly assignments: AssignmentModel[];

    // Dependencies
    allDependencies: DependencyModel[];
    readonly incomingDeps: Set<any>;
    readonly outgoingDeps: Set<any>;
    predecessorTasks: TaskModel[];
    readonly predecessors: DependencyModel[];

    // Critical Path
    readonly critical: boolean;
    readonly earlyStartDate: Date;
    readonly earlyEndDate: Date;
    readonly lateStartDate: Date;
    readonly lateEndDate: Date;

    // Calendar
    calendar: CalendarModel;
    readonly effectiveCalendar: CalendarModel;
    ignoreResourceCalendar: boolean;

    // Hierarchy
    children: boolean | object[] | TaskModel[] | TaskModelConfig[];

    // Visual
    cls: DomClassList | string;
    eventColor: EventColor;
    iconCls: string;

    // Behavior
    draggable: boolean;
    resizable: boolean | string;
    inactive: boolean;

    // Cost
    cost: number;

    // Misc
    note: string;
    deadlineDate: string | Date;
    baselines: BaselineConfig[] | Store;
}
```

### Key Methods

```typescript
export class TaskModel {
    // Calendar
    setCalendar(calendar: CalendarModel): Promise<void>;

    // Inactive
    setInactive(value: boolean): Promise<void>;

    // Dependencies
    linkTo(toTask: TaskModel, type?: number, lag?: number): void;
    unlinkFrom(fromTask: TaskModel): void;

    // Resources
    assign(resource: ResourceModel, units?: number): AssignmentModel;
    unassign(resource: ResourceModel): void;

    // Scheduling
    setStartDate(date: Date, keepDuration?: boolean): Promise<void>;
    setEndDate(date: Date, keepDuration?: boolean): Promise<void>;
    setDuration(duration: number, unit?: DurationUnit): Promise<void>;

    // Segments
    splitToSegments(splitPoints: Date[]): EventSegmentModel[];

    // Progress
    setPercentDone(value: number): Promise<void>;
}
```

---

## ProjectModel

Het hoofd container model voor alle project data.

### Core Fields

```typescript
export class ProjectModel extends Model {
    // Stores
    assignmentStore: AssignmentStore;
    calendarManagerStore: CalendarManagerStore;
    dependencyStore: DependencyStore;
    eventStore: TaskStore;
    resourceStore: ResourceStore;

    // Data shortcuts
    assignments: AssignmentModel[] | AssignmentModelConfig[];
    calendars: CalendarModel[] | CalendarModelConfig[];
    dependencies: DependencyModel[] | DependencyModelConfig[];
    resources: ResourceModel[] | ResourceModelConfig[];
    tasks: TaskModel[] | TaskModelConfig[];

    // Scheduling
    calendar: CalendarModel;
    direction: 'Forward' | 'Backward';
    startDate: string | Date;
    endDate: string | Date;

    // Duration settings
    hoursPerDay: number;
    daysPerWeek: number;
    daysPerMonth: number;

    // Calendar source for dependencies
    dependenciesCalendar: 'ToEvent' | 'FromEvent' | 'Project' | 'AllWorking';

    // Critical Path
    criticalPaths: any[];

    // Auto behaviors
    autoCalculatePercentDoneForParentTasks: boolean;
    autoMergeAdjacentSegments: boolean;
    autoPostponeConflicts: boolean;
    autoScheduleManualTasksOnSecondPass: boolean;
    addConstraintOnDateSet: boolean;
    allowPostponedConflicts: boolean;

    // CrudManager
    readonly changes: object;
    readonly crudRevision: number;
    crudStores: CrudManagerStoreDescriptor[];
    forceSync: boolean;

    // Misc
    description: string;
    enableProgressNotifications: boolean;
}
```

### CrudManager Config

```typescript
interface ProjectCrudConfig {
    loadUrl?: string;
    syncUrl?: string;
    autoLoad?: boolean;
    autoSync?: boolean;
    validateResponse?: boolean;

    transport?: {
        load?: { url: string; headers?: object };
        sync?: { url: string; headers?: object };
    };
}
```

---

## ResourceModel

```typescript
export class ResourceModel {
    id: string | number;
    name: string;

    // Cost
    type: 'work' | 'cost' | 'material';
    costAccrual: 'prorated' | 'start' | 'end';
    defaultRateTable: number | RateTableModel;

    // Calendar
    calendar: CalendarModel;

    // Assignments
    readonly assignments: AssignmentModel[];
    readonly events: TaskModel[];

    // Visual
    eventColor: EventColor;
    iconCls: string;
}
```

---

## DependencyModel

```typescript
export class DependencyModel {
    id: string | number;

    // Relationship
    fromEvent: string | number | TaskModel;
    toEvent: string | number | TaskModel;

    // Type (0: SS, 1: SF, 2: FS, 3: FF)
    type: 0 | 1 | 2 | 3;

    // Lag
    lag: number;
    lagUnit: DurationUnit;

    // State
    active: boolean;

    // Resolved references
    readonly sourceEvent: TaskModel;
    readonly targetEvent: TaskModel;
}
```

### Dependency Types

```typescript
type DependencyType = {
    SS: 0;  // Start-to-Start
    SF: 1;  // Start-to-Finish
    FS: 2;  // Finish-to-Start (default)
    FF: 3;  // Finish-to-Finish
}
```

---

## AssignmentModel

```typescript
export class AssignmentModel {
    id: string | number;

    // References
    event: string | number | TaskModel;
    resource: string | number | ResourceModel;

    // Units (percentage, 100 = full-time)
    units: number;

    // Cost
    cost: number;
    rateTable: RateTableModel;

    // Resolved references
    readonly eventRecord: TaskModel;
    readonly resourceRecord: ResourceModel;

    // Methods
    setRateTable(table: RateTableModel): Promise<void>;
}
```

---

## CalendarModel

```typescript
export class CalendarModel {
    id: string | number;
    name: string;

    // Parent calendar (inheritance)
    parent: CalendarModel;

    // Intervals
    intervals: CalendarIntervalConfig[];

    // Default behavior
    unspecifiedTimeIsWorking: boolean;

    // Methods
    addInterval(config: CalendarIntervalConfig): void;
    addIntervals(configs: CalendarIntervalConfig[]): void;
    removeInterval(interval: CalendarIntervalModel): void;
}
```

### CalendarIntervalConfig

```typescript
interface CalendarIntervalConfig {
    // Static interval
    startDate?: string | Date;
    endDate?: string | Date;

    // Recurrent interval (Later.js syntax)
    recurrentStartDate?: string;
    recurrentEndDate?: string;

    // Working/non-working
    isWorking: boolean;

    // Priority for overlap resolution
    priority?: number;

    // Name
    name?: string;
}
```

---

## Gantt View

```typescript
export class Gantt extends GanttBase {
    static readonly isGantt: boolean;
    readonly isGantt: boolean;

    // Features object
    features: GanttFeaturesType;

    // Project reference
    project: ProjectModel;

    // Stores (shortcuts)
    taskStore: TaskStore;
    resourceStore: ResourceStore;
    assignmentStore: AssignmentStore;
    dependencyStore: DependencyStore;
}
```

### GanttConfig

```typescript
interface GanttConfig {
    appendTo: HTMLElement | string;

    // Columns
    columns: ColumnConfig[];

    // View preset
    viewPreset: string | ViewPresetConfig;

    // Timeline range
    startDate?: Date;
    endDate?: Date;

    // Project
    project?: ProjectModel | ProjectModelConfig;

    // Features
    features?: {
        baselines?: boolean | BaselinesConfig;
        cellEdit?: boolean | CellEditConfig;
        criticalPaths?: boolean | CriticalPathsConfig;
        dependencies?: boolean | DependenciesConfig;
        labels?: boolean | LabelsConfig;
        percentBar?: boolean | PercentBarConfig;
        progressLine?: boolean | ProgressLineConfig;
        rollups?: boolean | RollupsConfig;
        taskDrag?: boolean | TaskDragConfig;
        taskEdit?: boolean | TaskEditConfig;
        taskResize?: boolean | TaskResizeConfig;
        taskTooltip?: boolean | TaskTooltipConfig;
        timeRanges?: boolean | TimeRangesConfig;
        // ... more features
    };

    // Bar styling
    barMargin?: number;
    rowHeight?: number;

    // Sizing
    width?: number | string;
    height?: number | string;
    autoHeight?: boolean;

    // Listeners
    listeners?: object;
}
```

---

## Key Events

### Task Events

```typescript
interface GanttEvents {
    // Click events
    onTaskClick: (event: {
        taskRecord: TaskModel;
        event: MouseEvent;
    }) => void;

    onTaskDblClick: (event: {
        taskRecord: TaskModel;
        event: MouseEvent;
    }) => void;

    // Drag events
    onBeforeTaskDrag: (event: {
        taskRecord: TaskModel;
        context: object;
    }) => boolean | void;

    onTaskDrop: (event: {
        taskRecord: TaskModel;
        startDate: Date;
        endDate: Date;
    }) => void;

    // Edit events
    onBeforeTaskEdit: (event: {
        taskRecord: TaskModel;
        taskElement: HTMLElement;
    }) => boolean | void;

    // Delete events
    onBeforeEventDelete: (event: {
        eventRecords: TaskModel[];
        context: { finalize: Function };
    }) => Promise<boolean> | boolean | void;
}
```

### Cell Events

```typescript
interface GridEvents {
    onCellClick: (event: {
        grid: Grid;
        record: Model;
        column: Column;
        cellElement: HTMLElement;
        event: MouseEvent;
    }) => void;

    onCellDblClick: (event: {
        grid: Grid;
        record: Model;
        column: Column;
        cellElement: HTMLElement;
        event: MouseEvent;
    }) => void;

    onCellMouseEnter: (event: {
        source: Grid;
        record: Model;
        column: Column;
        cellElement: HTMLElement;
    }) => void;
}
```

### Selection Events

```typescript
interface SelectionEvents {
    onBeforeSelectionChange: (event: {
        action: 'select' | 'deselect';
        mode: 'row' | 'cell';
        selected: Model[];
        deselected: Model[];
        selection: Model[];
    }) => boolean | void;

    onSelectionChange: (event: {
        action: 'select' | 'deselect';
        mode: 'row' | 'cell';
        selected: Model[];
        deselected: Model[];
        selection: Model[];
    }) => void;
}
```

---

## Store Types

### TaskStore

```typescript
export class TaskStore extends AjaxStore {
    // Tree operations
    transformFlatData: boolean;

    // Query
    getById(id: string | number): TaskModel;
    query(fn: (record: TaskModel) => boolean): TaskModel[];

    // Manipulation
    add(records: TaskModelConfig[]): TaskModel[];
    remove(records: TaskModel[]): void;

    // Filtering
    filter(config: FilterConfig): void;
    clearFilters(): void;

    // Sorting
    sort(field: string, ascending?: boolean): void;
}
```

### AjaxStore Config

```typescript
interface AjaxStoreConfig {
    // URLs for individual store operations
    createUrl?: string;
    readUrl?: string;
    updateUrl?: string;
    deleteUrl?: string;

    // Auto behaviors
    autoLoad?: boolean;
    autoCommit?: boolean;

    // Request config
    headers?: object;
    params?: object;
}
```

---

## Data Field Types

```typescript
// Field definitions for custom models
type DataFieldConfig = {
    name: string;
    type?: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    defaultValue?: any;
    persist?: boolean;
    internal?: boolean;
}

// Common field types
export class StringDataField extends DataField {}
export class NumberDataField extends DataField {}
export class IntegerDataField extends DataField {}
export class BooleanDataField extends DataField {}
export class DateDataField extends DataField {}
export class ObjectDataField extends DataField {}
export class ArrayDataField extends DataField {}
```

---

## Utility Types

### DurationConfig

```typescript
type DurationConfig = {
    magnitude: number;
    unit: DurationUnit;
}
```

### RelationConfig

```typescript
type RelationConfig = {
    foreignKey: string;
    foreignStore: string | Store;
    relatedCollectionName?: string;
    propagateRecordChanges?: boolean;
}
```

### LazyLoadRequestParams

```typescript
type LazyLoadRequestParams = {
    startIndex: number;
    count: number;
    sorters?: Sorter[];
    filters?: CollectionFilterConfig[];
    startDate?: Date;
    endDate?: Date;
    parentId?: string | number;
    resourceIds?: (string | number)[];
}
```

---

## Framework Wrappers

### React

```typescript
import { BryntumGantt, BryntumGanttProps } from '@bryntum/gantt-react';

const ganttProps: BryntumGanttProps = {
    columns: [...],
    project: {...},
    features: {...}
};

<BryntumGantt {...ganttProps} ref={ganttRef} />
```

### Angular

```typescript
import { BryntumGanttModule, BryntumGanttComponent } from '@bryntum/gantt-angular';

@ViewChild(BryntumGanttComponent) ganttComponent: BryntumGanttComponent;
```

### Vue

```typescript
import { BryntumGantt } from '@bryntum/gantt-vue-3';

<bryntum-gantt
    :columns="columns"
    :project="projectConfig"
    ref="gantt"
/>
```

---

## Type Guards

```typescript
// Check model types
if (record.isTaskModel) { /* TaskModel specific code */ }
if (record.isResourceModel) { /* ResourceModel specific code */ }
if (record.isDependencyModel) { /* DependencyModel specific code */ }
if (record.isAssignmentModel) { /* AssignmentModel specific code */ }

// Check project membership
if (record.isPartOfProject) { /* Record belongs to a project */ }
```

---

## Generic Patterns

### Custom TaskModel

```typescript
class MyTaskModel extends TaskModel {
    static fields = [
        { name: 'customField', type: 'string' },
        { name: 'priority', type: 'number', defaultValue: 1 }
    ];

    get formattedName(): string {
        return `[${this.priority}] ${this.name}`;
    }
}

// Usage in project
const project = new ProjectModel({
    taskModelClass: MyTaskModel
});
```

### Event Handler Typing

```typescript
const gantt = new Gantt({
    listeners: {
        taskClick(event: { taskRecord: TaskModel; event: MouseEvent }) {
            console.log(event.taskRecord.name);
        },

        beforeTaskEdit(event: { taskRecord: TaskModel }): boolean {
            return event.taskRecord.percentDone < 100;
        }
    }
});
```

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
*TypeScript definitions: 504,612 lines geëxtraheerd*
