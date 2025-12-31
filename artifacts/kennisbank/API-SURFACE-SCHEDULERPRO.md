# BRYNTUM SCHEDULERPRO API SURFACE

> Advanced scheduling with effort, constraints, and nested events (410,870 lines)

---

## 1. MAIN CLASSES

| Class | Purpose |
|-------|---------|
| `SchedulerPro` | Main view component |
| `EventModel` | Scheduled events/tasks |
| `ResourceModel` | Resources (people, equipment) |
| `AssignmentModel` | Resource-Event links |
| `DependencyModel` | Task dependencies |
| `ProjectModel` | Data container & engine |

---

## 2. EVENTMODEL

### Core Properties

```typescript
// Scheduling
startDate: Date
endDate: Date
duration: number
durationUnit: DurationUnit
effort: number
effortDriven: boolean
effortUnit: DurationUnit
schedulingMode: 'Normal' | 'FixedDuration'

// Constraints
constraintType: ConstraintType
constraintDate: Date
earlyStartDate: Date  // readonly
earlyEndDate: Date    // readonly

// Resources
resourceId: string | number
resources: ResourceModel[]        // readonly
assignments: AssignmentModel[]    // readonly

// UI
name: string
eventColor: EventColor
draggable: boolean
resizable: boolean | 'start' | 'end'

// Segments & Nesting
segments: EventSegmentModel[]
delayFromParent: number           // For nested events
```

### Key Methods

```typescript
// Assignment
assign(resource, units?): Promise<void>
unassign(resource?): Promise<void>

// Segmentation
splitToSegments(from, lag?, unit?): Promise<any>
setSegments(segments): Promise<any>
mergeSegments(segment1, segment2): Promise<any>

// Recurrence
addExceptionDate(date): void
setRecurrence(config, interval?, end?): void

// Utilities
isEditable(fieldName): boolean
setAsync(field, value?, silent?): Promise<void>
shift(amount, unit): Promise<any>
```

---

## 3. RESOURCEMODEL

### Properties

```typescript
name: string
type: 'work' | 'material' | 'cost'
calendar: CalendarModel
maxUnits: number
allowOverlap: boolean
rateTables: ResourceRateTableModel[]
costAccrual: 'start' | 'prorated' | 'end'
```

### Key Methods

```typescript
addRateTable(rateTable): ResourceRateModel[]
removeRateTable(rateTable): ResourceRateModel[]
setCalendar(calendar): Promise<void>
unassignAll(): void
```

---

## 4. ASSIGNMENTMODEL

```typescript
event: EventModel
resource: ResourceModel
units: number              // 0-100 allocation %
effort: number
startDate: Date
endDate: Date
cost: number
```

---

## 5. DEPENDENCYMODEL

```typescript
fromEvent: string | number | EventModel
toEvent: string | number | EventModel
type: number               // 0=SS, 1=SF, 2=FS, 3=FF
lag: number
lagUnit: DurationUnit
calendar: CalendarModel
active: boolean
```

---

## 6. PROJECTMODEL

### Stores

```typescript
eventStore: EventStore
resourceStore: ResourceStore
assignmentStore: AssignmentStore
dependencyStore: DependencyStore
calendarManagerStore: CalendarManagerStore
```

### Key Methods

```typescript
load(): Promise<any>
sync(): Promise<any>
getChanges(): object
resetToCurrentRevision(): Promise<any>
commitAsync(): Promise<void>
```

---

## 7. FEATURES (60+)

### Unique to SchedulerPro

| Feature | Purpose |
|---------|---------|
| `nestedEvents` | Parent-child event hierarchies |
| `eventSegments` | Split events into segments |
| `percentBar` | Progress indicator |
| `eventBuffer` | Buffer time around events |
| `resourceHistogram` | Utilization chart |
| `resourceUtilization` | Capacity tracking |
| `calendarHighlight` | Working time visualization |

### Event Interaction

| Feature | Purpose |
|---------|---------|
| `eventDrag` | Drag events |
| `eventDragCreate` | Create by dragging |
| `eventDragSelect` | Select by dragging |
| `eventResize` | Resize events |
| `eventSegmentDrag` | Drag segments |
| `eventSegmentResize` | Resize segments |
| `dependencyCreation` | Create dependencies |
| `dependencyEdit` | Edit dependencies |

### Visualization

| Feature | Purpose |
|---------|---------|
| `nonWorkingTime` | Show non-working periods |
| `eventNonWorkingTime` | Event-specific |
| `resourceNonWorkingTime` | Resource-specific |
| `timeRanges` | Time range display |
| `resourceTimeRanges` | Resource time ranges |
| `labels` | Event labels |
| `stickyEvents` | Sticky headers |

### Data Management

| Feature | Purpose |
|---------|---------|
| `taskEdit` | Task editor dialog |
| `simpleEventEdit` | Simple editor |
| `cellEdit` | Cell editing |
| `rowEdit` | Row editing |
| `eventCopyPaste` | Copy/paste events |
| `fileDrop` | File drop handling |

### Export

| Feature | Purpose |
|---------|---------|
| `excelExporter` | Excel export |
| `pdfExport` | PDF export |
| `print` | Print support |

---

## 8. CONFIGURATION

### Key Options

```typescript
allowOverlap: boolean
allowCreate: boolean
barMargin: number
eventLayout: 'stack' | 'pack' | 'mixed' | 'none'
startDate: Date
endDate: Date
viewPreset: ViewPreset
resourceColumns: ColumnConfig[]
```

---

## 9. EVENTS

### Scheduling Events

```typescript
// Data
onDataReady
onProgress
onCycle
onSchedulingConflict
onEmptyCalendar

// CRUD
onBeforeLoad / onLoad / onLoadFail
onBeforeSync / onSync / onSyncFail
```

### Interaction Events

```typescript
// Segments
onBeforeEventSegmentDrag
onAfterEventSegmentDrop
onBeforeEventSegmentResize

// Tasks
onBeforeTaskEdit
onAfterTaskEdit
onBeforeEventDelete

// Selection
onEventSelectionChange
onAssignmentSelectionChange
```

---

## 10. DIFFERENCES FROM GANTT

| Feature | SchedulerPro | Gantt |
|---------|--------------|-------|
| **Event Segmentation** | Full support | Limited |
| **Nested Events** | Native feature | Not primary |
| **Effort Tracking** | FixedDuration mode | Basic |
| **Resource Constraints** | MaxUnits, allocation | Basic |
| **Recurring Events** | RFC-5545 support | Basic |
| **Rate Tables** | Resource pricing | Not featured |
| **Cost Accrual** | start/prorated/end | Basic |

---

## SUMMARY

| Metric | Count |
|--------|-------|
| Main Classes | 5 + 40 supporting |
| Features | 60+ |
| Events | 80+ |
| Config Options | 200+ |

**Source:** `schedulerpro.d.ts` - 410,870 lines
