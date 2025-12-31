# TypeScript Interfaces Reference

> **Reference Document** - Alle belangrijke TypeScript type definitions voor Bryntum Gantt.

---

## Overzicht

Bryntum Gantt heeft ~500.000 regels TypeScript definitions. Dit document bevat de meest relevante interfaces voor eigen implementatie.

```
Type Categories:
┌─────────────────────────────────────────────────────────────┐
│ 1. Model Types      - Task, Resource, Dependency, etc.     │
│ 2. Store Types      - TaskStore, ResourceStore, etc.       │
│ 3. Config Types     - GanttConfig, ProjectConfig, etc.     │
│ 4. Event Types      - Listener types per class             │
│ 5. Enum Types       - SchedulingMode, ConstraintType, etc. │
│ 6. Helper Types     - Duration, Rectangle, etc.            │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Core Enums & Constants

### 1.1 SchedulingMode

```typescript
type SchedulingMode =
    | 'Normal'         // Duration + effort flex, units fixed
    | 'FixedDuration'  // Duration fixed, effort + units flex
    | 'FixedEffort'    // Effort fixed, duration + units flex
    | 'FixedUnits';    // Units fixed (same as Normal)
```

### 1.2 ConstraintType

```typescript
type ConstraintType =
    | 'muststarton'           // Must start on specific date
    | 'mustfinishon'          // Must finish on specific date
    | 'startnoearlierthan'    // Start no earlier than date
    | 'startnolaterthan'      // Start no later than date
    | 'finishnoearlierthan'   // Finish no earlier than date
    | 'finishnolaterthan'     // Finish no later than date
    | null;                   // No constraint
```

### 1.3 DependencyType

```typescript
interface DependencyType {
    StartToStart: 0;   // SS - Successor starts when predecessor starts
    EndToStart: 1;     // ES - Successor starts when predecessor ends (default)
    EndToEnd: 2;       // EE - Successor ends when predecessor ends
    StartToEnd: 3;     // SE - Successor ends when predecessor starts
}

// Values
const DependencyType = {
    StartToStart: 0,
    EndToStart: 1,
    EndToEnd: 2,
    StartToEnd: 3
};
```

### 1.4 DurationUnit

```typescript
type DurationUnit =
    | 'millisecond' | 'ms'
    | 'second' | 's'
    | 'minute' | 'mi'
    | 'hour' | 'h'
    | 'day' | 'd'
    | 'week' | 'w'
    | 'month' | 'mo'
    | 'quarter' | 'q'
    | 'year' | 'y';
```

### 1.5 SchedulingDirection

```typescript
type SchedulingDirection = 'Forward' | 'Backward';
```

---

## 2. Model Interfaces

### 2.1 TaskModel

```typescript
interface TaskModelConfig {
    // Identity
    id?: string | number;
    name?: string;

    // Timing
    startDate?: Date | string;
    endDate?: Date | string;
    duration?: number;
    durationUnit?: DurationUnit;

    // Effort & Resources
    effort?: number;
    effortUnit?: DurationUnit;
    effortDriven?: boolean;

    // Scheduling
    schedulingMode?: SchedulingMode;
    manuallyScheduled?: boolean;
    inactive?: boolean;
    ignoreResourceCalendar?: boolean;

    // Constraints
    constraintType?: ConstraintType;
    constraintDate?: Date | string;

    // Progress
    percentDone?: number;

    // Hierarchy
    parentId?: string | number;
    parentIndex?: number;
    children?: TaskModelConfig[];
    expanded?: boolean;

    // Calendar
    calendar?: string | number;

    // Segments (split tasks)
    segments?: TaskSegmentConfig[];

    // Rollup
    rollup?: boolean;

    // Deadlines
    deadlineDate?: Date | string;

    // Baselines
    baselines?: BaselineConfig[];

    // Custom fields
    [key: string]: any;
}

interface TaskModel extends TaskModelConfig {
    // Computed properties
    readonly isLeaf: boolean;
    readonly isParent: boolean;
    readonly isMilestone: boolean;
    readonly isCompleted: boolean;
    readonly isStarted: boolean;
    readonly critical: boolean;
    readonly totalSlack: number;
    readonly earlyStartDate: Date;
    readonly earlyEndDate: Date;
    readonly lateStartDate: Date;
    readonly lateEndDate: Date;

    // Relationships
    readonly predecessors: DependencyModel[];
    readonly successors: DependencyModel[];
    readonly assignments: AssignmentModel[];
    readonly resources: ResourceModel[];

    // Methods
    setConstraint(type: ConstraintType, date?: Date): Promise<void>;
    setStartDate(date: Date, keepDuration?: boolean): Promise<void>;
    setEndDate(date: Date, keepDuration?: boolean): Promise<void>;
    setDuration(duration: number, unit?: DurationUnit): Promise<void>;
    splitTask(splitDate: Date): Promise<void>;
    link(toTask: TaskModel, type?: number, lag?: number): Promise<DependencyModel>;
    unlink(fromTask: TaskModel): Promise<void>;
    assign(resource: ResourceModel, units?: number): Promise<AssignmentModel>;
    unassign(resource: ResourceModel): Promise<void>;
}
```

### 2.2 ResourceModel

```typescript
interface ResourceModelConfig {
    id?: string | number;
    name?: string;
    calendar?: string | number;

    // Resource-specific
    eventColor?: string;
    image?: string;

    // Custom fields
    [key: string]: any;
}

interface ResourceModel extends ResourceModelConfig {
    readonly assignments: AssignmentModel[];
    readonly events: TaskModel[];
}
```

### 2.3 AssignmentModel

```typescript
interface AssignmentModelConfig {
    id?: string | number;
    event?: string | number;      // Task ID
    resource?: string | number;   // Resource ID
    units?: number;               // Allocation percentage (100 = 100%)

    // Time-phased (7.0+)
    startDate?: Date | string;
    endDate?: Date | string;
    effort?: number;
}

interface AssignmentModel extends AssignmentModelConfig {
    readonly eventRecord: TaskModel;
    readonly resourceRecord: ResourceModel;
}
```

### 2.4 DependencyModel

```typescript
interface DependencyModelConfig {
    id?: string | number;
    fromTask?: string | number;   // Predecessor ID
    toTask?: string | number;     // Successor ID
    type?: number;                // DependencyType value
    lag?: number;                 // Lag in days
    lagUnit?: DurationUnit;
    active?: boolean;
}

interface DependencyModel extends DependencyModelConfig {
    readonly sourceTask: TaskModel;
    readonly targetTask: TaskModel;
    readonly fromSide: 'start' | 'end';
    readonly toSide: 'start' | 'end';
}
```

### 2.5 CalendarModel

```typescript
interface CalendarModelConfig {
    id?: string | number;
    name?: string;
    unspecifiedTimeIsWorking?: boolean;
    intervals?: CalendarIntervalConfig[];
    children?: CalendarModelConfig[];
}

interface CalendarIntervalConfig {
    // Recurrent interval
    recurrentStartDate?: string;  // Later.js syntax
    recurrentEndDate?: string;

    // Static interval
    startDate?: Date | string;
    endDate?: Date | string;

    // Properties
    isWorking?: boolean;
    name?: string;
}
```

### 2.6 TaskSegment

```typescript
interface TaskSegmentConfig {
    name?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    duration?: number;
    durationUnit?: DurationUnit;
}

interface EventSegmentModel extends TaskSegmentConfig {
    readonly event: TaskModel;
    readonly isEventSegment: boolean;
    readonly eventColor: string;
    draggable: boolean;
    resizable: boolean | 'start' | 'end';
}
```

---

## 3. Store Interfaces

### 3.1 TaskStore

```typescript
interface TaskStoreConfig {
    modelClass?: typeof TaskModel;
    data?: TaskModelConfig[];
    tree?: boolean;
    autoLoad?: boolean;
    readUrl?: string;
    useRawData?: boolean;
    wbsMode?: 'auto' | 'manual';
}

interface TaskStore extends Store {
    readonly rootNode: TaskModel;

    // Tree operations
    getById(id: string | number): TaskModel | null;
    query(fn: (task: TaskModel) => boolean): TaskModel[];
    forEach(fn: (task: TaskModel) => void): void;

    // Modifications
    add(data: TaskModelConfig | TaskModelConfig[]): TaskModel[];
    remove(records: TaskModel | TaskModel[]): TaskModel[];
    insert(index: number, data: TaskModelConfig): TaskModel;

    // Filtering
    filter(config: FilterConfig | FilterConfig[]): void;
    clearFilters(): void;
}
```

### 3.2 ResourceStore

```typescript
interface ResourceStoreConfig {
    modelClass?: typeof ResourceModel;
    data?: ResourceModelConfig[];
}

interface ResourceStore extends Store {
    getById(id: string | number): ResourceModel | null;
    add(data: ResourceModelConfig | ResourceModelConfig[]): ResourceModel[];
}
```

### 3.3 DependencyStore

```typescript
interface DependencyStoreConfig {
    modelClass?: typeof DependencyModel;
    data?: DependencyModelConfig[];
}

interface DependencyStore extends Store {
    getById(id: string | number): DependencyModel | null;
    add(data: DependencyModelConfig | DependencyModelConfig[]): DependencyModel[];
    getDependency(from: TaskModel, to: TaskModel): DependencyModel | null;
}
```

### 3.4 AssignmentStore

```typescript
interface AssignmentStoreConfig {
    modelClass?: typeof AssignmentModel;
    data?: AssignmentModelConfig[];
}

interface AssignmentStore extends Store {
    getById(id: string | number): AssignmentModel | null;
    getAssignmentForEventAndResource(
        event: TaskModel,
        resource: ResourceModel
    ): AssignmentModel | null;
}
```

---

## 4. Project Interface

### 4.1 ProjectModel

```typescript
interface ProjectModelConfig {
    // Stores
    taskStore?: TaskStoreConfig | TaskStore;
    resourceStore?: ResourceStoreConfig | ResourceStore;
    assignmentStore?: AssignmentStoreConfig | AssignmentStore;
    dependencyStore?: DependencyStoreConfig | DependencyStore;
    calendarManagerStore?: CalendarManagerStoreConfig;

    // Inline data
    tasksData?: TaskModelConfig[];
    resourcesData?: ResourceModelConfig[];
    assignmentsData?: AssignmentModelConfig[];
    dependenciesData?: DependencyModelConfig[];
    calendarsData?: CalendarModelConfig[];

    // Project settings
    calendar?: string | number;
    startDate?: Date | string;
    hoursPerDay?: number;
    daysPerWeek?: number;
    daysPerMonth?: number;

    // Scheduling
    direction?: SchedulingDirection;
    autoSetConstraints?: boolean;

    // Conflict handling
    allowPostponedConflicts?: boolean;
    autoPostponeConflicts?: boolean;

    // STM
    stm?: StateTrackingManagerConfig;

    // Transport
    transport?: {
        load?: { url: string };
        sync?: { url: string };
    };
    autoLoad?: boolean;
    autoSync?: boolean;
}

interface ProjectModel extends ProjectModelConfig {
    // Store accessors
    readonly taskStore: TaskStore;
    readonly resourceStore: ResourceStore;
    readonly assignmentStore: AssignmentStore;
    readonly dependencyStore: DependencyStore;
    readonly calendarManagerStore: CalendarManagerStore;

    // STM
    readonly stm: StateTrackingManager;

    // Methods
    load(): Promise<void>;
    sync(): Promise<void>;
    commitAsync(): Promise<void>;
    propagate(): Promise<void>;
    loadInlineData(data: ProjectDataConfig): Promise<void>;

    // Batch operations
    beginBatch(): void;
    endBatch(): Promise<void>;
}
```

---

## 5. Gantt Interface

### 5.1 GanttConfig

```typescript
interface GanttConfig {
    // Container
    appendTo?: string | HTMLElement;
    height?: string | number;
    width?: string | number;

    // Project
    project?: ProjectModel | ProjectModelConfig;

    // Columns
    columns?: ColumnConfig[];

    // Timeline
    startDate?: Date | string;
    endDate?: Date | string;
    viewPreset?: string | ViewPresetConfig;
    infiniteScroll?: boolean;
    bufferCoef?: number;

    // Rows
    rowHeight?: number;

    // Features
    features?: GanttFeaturesConfig;

    // Toolbar
    tbar?: ToolbarConfig | object[];

    // Rendering
    taskRenderer?: (data: TaskRenderData) => string | DomConfig;

    // Event handlers
    listeners?: GanttListeners;

    // Subgrid configuration
    subGridConfigs?: {
        locked?: { flex?: number; width?: number };
        normal?: { flex?: number; width?: number };
    };
}
```

### 5.2 GanttFeaturesConfig

```typescript
interface GanttFeaturesConfig {
    // Core features
    taskEdit?: boolean | TaskEditConfig;
    taskTooltip?: boolean | TaskTooltipConfig;
    taskDrag?: boolean | TaskDragConfig;
    taskResize?: boolean | TaskResizeConfig;
    taskDragCreate?: boolean | TaskDragCreateConfig;
    dependencyEdit?: boolean | DependencyEditConfig;

    // UI features
    filterBar?: boolean | FilterBarConfig;
    indicators?: boolean | IndicatorsConfig;
    labels?: boolean | LabelsConfig;
    progressLine?: boolean | ProgressLineConfig;
    projectLines?: boolean | ProjectLinesConfig;
    nonWorkingTime?: boolean | NonWorkingTimeConfig;
    baselines?: boolean | BaselinesConfig;
    rollups?: boolean | RollupsConfig;
    criticalPaths?: boolean | CriticalPathsConfig;

    // Export features
    pdfExport?: boolean | PdfExportConfig;
    excelExporter?: boolean | ExcelExporterConfig;
    mspExport?: boolean | MspExportConfig;
    print?: boolean | PrintConfig;

    // Segments
    taskSegmentDrag?: boolean | TaskSegmentDragConfig;
    taskSegmentResize?: boolean | TaskSegmentResizeConfig;
}
```

### 5.3 Gantt Class

```typescript
interface Gantt extends GanttConfig {
    // Store accessors
    readonly project: ProjectModel;
    readonly taskStore: TaskStore;
    readonly resourceStore: ResourceStore;
    readonly assignmentStore: AssignmentStore;
    readonly dependencyStore: DependencyStore;

    // Feature accessors
    readonly features: {
        taskEdit: TaskEdit;
        pdfExport: PdfExport;
        // ... other features
    };

    // Navigation
    scrollToDate(date: Date, options?: ScrollOptions): Promise<void>;
    scrollRowIntoView(record: TaskModel): Promise<void>;
    scrollTaskIntoView(task: TaskModel): Promise<void>;

    // Zoom
    zoomIn(): void;
    zoomOut(): void;
    zoomToFit(options?: ZoomToFitOptions): void;
    zoomToLevel(level: number): void;

    // Expand/Collapse
    expandAll(): Promise<void>;
    collapseAll(): Promise<void>;
    expand(record: TaskModel): Promise<void>;
    collapse(record: TaskModel): Promise<void>;

    // Refresh
    refresh(): void;
    refreshRows(): void;
}
```

---

## 6. Column Interfaces

### 6.1 ColumnConfig

```typescript
interface ColumnConfig {
    type?: string;
    field?: string;
    text?: string;
    width?: number;
    minWidth?: number;
    flex?: number;
    align?: 'left' | 'center' | 'right';
    renderer?: (data: CellRenderData) => string | DomConfig;
    editor?: boolean | EditorConfig;
    filterable?: boolean | FilterableConfig;
    sortable?: boolean;
    hidden?: boolean;
    locked?: boolean;
}
```

### 6.2 Built-in Column Types

```typescript
// Available column types
type GanttColumnType =
    | 'name'              // Task name
    | 'wbs'               // WBS code
    | 'startdate'         // Start date
    | 'enddate'           // End date
    | 'duration'          // Duration
    | 'effort'            // Effort
    | 'percentdone'       // Progress
    | 'resourceassignment'// Assigned resources
    | 'predecessor'       // Predecessors
    | 'successor'         // Successors
    | 'constrainttype'    // Constraint type
    | 'constraintdate'    // Constraint date
    | 'calendar'          // Calendar
    | 'schedulingmodecolumn' // Scheduling mode
    | 'earlystart'        // Early start
    | 'earlyend'          // Early end
    | 'latestart'         // Late start
    | 'lateend'           // Late end
    | 'totalslack'        // Total slack
    | 'sequence'          // Sequence number
    | 'addnew'            // Add new column
    | 'info';             // Task info (conflict indicator)
```

---

## 7. Event Interfaces

### 7.1 Task Events

```typescript
interface GanttListeners {
    // Task events
    taskClick?: (event: TaskClickEvent) => void;
    taskDblClick?: (event: TaskDblClickEvent) => void;
    beforeTaskEdit?: (event: BeforeTaskEditEvent) => boolean | void;
    taskEditComplete?: (event: TaskEditCompleteEvent) => void;

    // Drag events
    beforeTaskDrag?: (event: BeforeTaskDragEvent) => boolean | void;
    taskDragStart?: (event: TaskDragStartEvent) => void;
    taskDrop?: (event: TaskDropEvent) => void;

    // Resize events
    beforeTaskResize?: (event: BeforeTaskResizeEvent) => boolean | void;
    taskResizeStart?: (event: TaskResizeStartEvent) => void;
    taskResizeEnd?: (event: TaskResizeEndEvent) => void;

    // Dependency events
    beforeDependencyAdd?: (event: BeforeDependencyAddEvent) => boolean | void;
    dependencyClick?: (event: DependencyClickEvent) => void;

    // Scroll events
    horizontalScroll?: (event: ScrollEvent) => void;
    verticalScroll?: (event: ScrollEvent) => void;

    // Render events
    renderRows?: () => void;
    beforeRenderRow?: (event: BeforeRenderRowEvent) => void;
}

interface TaskClickEvent {
    taskRecord: TaskModel;
    event: MouseEvent;
    source: Gantt;
}

interface BeforeTaskEditEvent {
    taskRecord: TaskModel;
    source: Gantt;
}

interface TaskDropEvent {
    taskRecords: TaskModel[];
    startDate: Date;
    source: Gantt;
    valid: boolean;
}
```

### 7.2 Project Events

```typescript
interface ProjectListeners {
    // Scheduling events
    cycle?: (event: CycleEvent) => void;
    schedulingConflict?: (event: SchedulingConflictEvent) => void;
    emptyCalendar?: (event: EmptyCalendarEvent) => void;

    // Data events
    load?: (event: LoadEvent) => void;
    sync?: (event: SyncEvent) => void;
    dataReady?: () => void;
    change?: (event: ChangeEvent) => void;
}

interface CycleEvent {
    schedulingIssue: {
        getDescription(): string;
        cycle: object;
        getResolutions(): Resolution[];
    };
    continueWithResolutionResult: (result: EffectResolutionResult) => void;
}

interface SchedulingConflictEvent {
    schedulingIssue: {
        getDescription(): string;
        intervals: object[];
        getResolutions(): Resolution[];
    };
    continueWithResolutionResult: (result: EffectResolutionResult) => void;
}

enum EffectResolutionResult {
    Resume = 'Resume',
    Cancel = 'Cancel'
}
```

---

## 8. Helper Types

### 8.1 Duration

```typescript
interface DurationConfig {
    magnitude: number;
    unit: DurationUnit;
}

class Duration {
    constructor(config: DurationConfig | string | number);

    magnitude: number;
    unit: DurationUnit;

    static from(value: any): Duration;
    toString(): string;
    toMilliseconds(): number;
}
```

### 8.2 Rectangle

```typescript
interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    // Computed
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
    readonly center: Point;

    // Methods
    contains(point: Point): boolean;
    intersect(rect: Rectangle): Rectangle | null;
    union(rect: Rectangle): Rectangle;
}
```

### 8.3 DateHelper

```typescript
interface DateHelper {
    // Parsing
    parse(dateString: string, format?: string): Date;

    // Formatting
    format(date: Date, format: string): string;

    // Manipulation
    add(date: Date, amount: number, unit: DurationUnit): Date;
    diff(start: Date, end: Date, unit: DurationUnit): number;
    startOf(date: Date, unit: DurationUnit): Date;
    endOf(date: Date, unit: DurationUnit): Date;

    // Comparison
    isSame(date1: Date, date2: Date, unit?: DurationUnit): boolean;
    isBefore(date1: Date, date2: Date): boolean;
    isAfter(date1: Date, date2: Date): boolean;
    isEqual(date1: Date, date2: Date): boolean;

    // Working time
    getNext(date: Date, unit: DurationUnit, increment?: number): Date;
    getStartOfNextDay(date: Date): Date;
}
```

---

## 9. Filter Types

### 9.1 FilterConfig

```typescript
interface FilterConfig {
    id?: string;
    property?: string;
    operator?: FilterOperator;
    value?: any;
    filterBy?: (record: any) => boolean;
    caseSensitive?: boolean;
    disabled?: boolean;
}

type FilterOperator =
    | '=' | '!=' | '>' | '>=' | '<' | '<='
    | '*' | 'startsWith' | 'endsWith' | 'includes' | 'doesNotInclude'
    | 'isIncludedIn' | 'isNotIncludedIn'
    | 'empty' | 'notEmpty'
    | 'between' | 'notBetween'
    | 'sameDay' | 'isToday' | 'isTomorrow' | 'isYesterday'
    | 'isThisWeek' | 'isLastWeek' | 'isNextWeek'
    | 'isThisMonth' | 'isLastMonth' | 'isNextMonth'
    | 'isThisYear' | 'isLastYear' | 'isNextYear' | 'isYearToDate'
    | 'isTrue' | 'isFalse'
    | 'or' | 'and';
```

---

## 10. State Tracking (STM)

### 10.1 StateTrackingManager

```typescript
interface StateTrackingManagerConfig {
    disabled?: boolean;
    autoRecord?: boolean;
    revisionsEnabled?: boolean;
}

interface StateTrackingManager {
    disabled: boolean;
    isRecording: boolean;
    isRestoring: boolean;
    position: number;
    length: number;

    // Queue info
    readonly canUndo: boolean;
    readonly canRedo: boolean;
    readonly undoQueue: Transaction[];
    readonly redoQueue: Transaction[];

    // Methods
    enable(): void;
    disable(): void;
    undo(steps?: number): void;
    redo(steps?: number): void;
    startTransaction(title?: string): void;
    stopTransaction(title?: string): void;
    rejectTransaction(): void;
    resetQueue(): void;

    // Events
    on(listeners: STMListeners): void;
}

interface STMListeners {
    recordingStart?: () => void;
    recordingStop?: (event: { transaction: Transaction }) => void;
    restoringStart?: () => void;
    restoringStop?: () => void;
    queueReset?: () => void;
}

interface Transaction {
    title: string;
    actions: Action[];
}
```

---

## 11. Transport & CrudManager

### 11.1 Transport Config

```typescript
interface TransportConfig {
    load?: {
        url: string;
        method?: 'GET' | 'POST';
        params?: object;
        headers?: object;
    };
    sync?: {
        url: string;
        method?: 'POST';
        params?: object;
        headers?: object;
    };
}
```

### 11.2 Load/Sync Response

```typescript
interface LoadResponse {
    success: boolean;
    requestId?: number;
    project?: ProjectDataConfig;
    tasks?: { rows: TaskModelConfig[] };
    resources?: { rows: ResourceModelConfig[] };
    assignments?: { rows: AssignmentModelConfig[] };
    dependencies?: { rows: DependencyModelConfig[] };
    calendars?: { rows: CalendarModelConfig[] };
}

interface SyncResponse {
    success: boolean;
    requestId?: number;
    tasks?: {
        rows?: { $PhantomId: string; id: string | number }[];
    };
    // Similar for other stores
}
```

---

## 12. Cross-References

| Document | Relevante Secties |
|----------|-------------------|
| [CLASS-INVENTORY](./CLASS-INVENTORY.md) | Class descriptions |
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | Store patterns |
| [IMPL-SCHEDULING-ENGINE](./IMPL-SCHEDULING-ENGINE.md) | Scheduling types |
| [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md) | Transport types |

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Bryntum Gantt versie: 7.1.0*
*Totaal ~500.000 regels TypeScript definitions*
*Laatste update: December 2024*
