# Deep Dive: Bryntum Gantt Dependencies

## Overview

Dependencies in Bryntum Gantt represent the logical relationships between tasks that determine scheduling order. They define which tasks must complete (or start) before other tasks can begin (or finish). This document provides a comprehensive analysis of the dependency system based on the Bryntum Gantt TypeScript definitions.

---

## 1. DependencyModel Structure

The `DependencyModel` class extends `SchedulerProDependencyModel`, which itself extends `DependencyBaseModel`. This inheritance chain provides a rich set of properties for defining task relationships.

### Core Properties

```typescript
interface DependencyModelConfig {
  // Core relationship identifiers
  id?: string | number;
  from: string | number;              // Source task ID
  to: string | number;                // Target task ID
  fromTask: string | number | TaskModel;  // Resolved source task
  toTask: string | number | TaskModel;    // Resolved target task

  // Dependency characteristics
  type?: number;                      // Dependency type (0-3)
  lag?: number;                       // Time offset between tasks
  lagUnit?: DurationUnit;             // Unit for lag (default: 'day')

  // Behavior modifiers
  active?: boolean;                   // Set false to ignore in scheduling
  bidirectional?: boolean;            // Draw arrows in both directions

  // Visual properties
  cls?: string;                       // CSS class for dependency lines

  // Calendar reference
  calendar?: SchedulerProCalendarModel;  // Calendar for lag calculations
}
```

### Class Hierarchy

```
DependencyBaseModel (Scheduler)
    |
    +-- SchedulerProDependencyModel (SchedulerPro)
            |
            +-- DependencyModel (Gantt)
```

### Key Accessors

```typescript
class DependencyModel {
  // Static type identifier
  static readonly isDependencyModel: boolean;
  static readonly Type: DependencyType;

  // Instance properties
  readonly isDependencyModel: boolean;

  // Relationship accessors
  fromTask: string | number | TaskModel;
  toTask: string | number | TaskModel;
  fromEvent: string | number | SchedulerEventModel;  // Alias
  toEvent: string | number | SchedulerEventModel;    // Alias

  // Project context
  readonly project: SchedulerProProjectModel;
  readonly dependencyStore: SchedulerProDependencyStore;
  readonly eventStore: EventStore;
  readonly taskStore: EventStore;
  readonly assignmentStore: SchedulerProAssignmentStore;
  readonly calendarManagerStore: SchedulerProCalendarManagerStore;
  readonly resourceStore: SchedulerProResourceStore;
}
```

---

## 2. Dependency Types

Bryntum Gantt supports four standard dependency types, represented by numeric values:

### DependencyType Enumeration

```typescript
type DependencyType = {
  StartToStart: 0;   // SS - Successor cannot start before predecessor starts
  StartToEnd: 1;     // SF - Successor cannot finish before predecessor starts
  EndToStart: 2;     // FS - Successor cannot start before predecessor finishes (DEFAULT)
  EndToEnd: 3;       // FF - Successor cannot finish before predecessor finishes
}
```

### Type Constants

| Type | Value | Abbreviation | Description |
|------|-------|--------------|-------------|
| Start-to-Start | 0 | SS | Tasks start together |
| Start-to-Finish | 1 | SF | Predecessor's start triggers successor's finish |
| Finish-to-Start | 2 | FS | Sequential execution (most common) |
| Finish-to-Finish | 3 | FF | Tasks finish together |

### Using Dependency Types

```typescript
import { DependencyModel } from '@bryntum/gantt';

// Access the type enum
const FS_TYPE = DependencyModel.Type.EndToStart;  // 2
const SS_TYPE = DependencyModel.Type.StartToStart; // 0

// Create dependencies with specific types
const dependencies = [
  { id: 1, from: 'task1', to: 'task2', type: 2 },  // FS - Finish-to-Start
  { id: 2, from: 'task1', to: 'task3', type: 0 },  // SS - Start-to-Start
  { id: 3, from: 'task2', to: 'task4', type: 3 },  // FF - Finish-to-Finish
];

// Using the Type enum for clarity
const dependency = {
  from: 'designTask',
  to: 'developmentTask',
  type: DependencyModel.Type.EndToStart  // FS - most common
};
```

### Visual Representation

```
Start-to-Start (SS = 0):
  Task A: |=======>
  Task B:   |=======>
          (B can start when A starts)

Start-to-Finish (SF = 1):
  Task A: |=======>
  Task B:       <======|
          (B finishes when A starts - rare)

Finish-to-Start (FS = 2):
  Task A: |=======>
  Task B:           |=======>
          (B starts when A finishes - most common)

Finish-to-Finish (FF = 3):
  Task A: |=======>
  Task B:     |=======>
          (B finishes when A finishes)
```

---

## 3. Lag and LagUnit

Lag represents a time delay (positive) or lead (negative) between dependent tasks.

### Lag Properties

```typescript
interface DependencyLagConfig {
  lag: number;                           // Numeric value
  lagUnit: DurationUnit | DurationUnitShort;  // Time unit
}

// DurationUnit values:
type DurationUnit =
  | 'millisecond' | 'second' | 'minute' | 'hour'
  | 'day' | 'week' | 'month' | 'quarter' | 'year';

// DurationUnitShort values:
type DurationUnitShort =
  | 'ms' | 's' | 'mi' | 'h' | 'd' | 'w' | 'mo' | 'q' | 'y';
```

### Setting Lag Values

```typescript
// Using the setLag method
dependency.setLag(2, 'd');        // 2 days lag
dependency.setLag(-1, 'w');       // 1 week lead (negative lag)
dependency.setLag('3 hours');     // String format

// Direct property assignment
dependency.lag = 5;
dependency.lagUnit = 'day';

// In configuration
const dependency = {
  from: 'task1',
  to: 'task2',
  type: 2,      // FS
  lag: 3,       // 3 days delay between task1 finish and task2 start
  lagUnit: 'd'
};
```

### Lag Conversion

```typescript
class SchedulerProDependencyModel {
  // Convert lag between time units (generator function for Engine integration)
  convertLagGen(
    lag: number,
    fromUnit: DurationUnit,
    toUnit: DurationUnit
  ): number;
}

// The conversion respects the dependency's calendar for working time
```

### Practical Examples

```typescript
// Finish-to-Start with 2-day lag
// Task B starts 2 days AFTER Task A finishes
{
  from: 'foundationWork',
  to: 'framingWork',
  type: 2,  // FS
  lag: 2,
  lagUnit: 'd'
}

// Start-to-Start with 1-week lag
// Task B starts 1 week AFTER Task A starts
{
  from: 'design',
  to: 'prototyping',
  type: 0,  // SS
  lag: 1,
  lagUnit: 'w'
}

// Finish-to-Start with negative lag (lead time)
// Task B starts 3 days BEFORE Task A finishes (overlap)
{
  from: 'coding',
  to: 'testing',
  type: 2,  // FS
  lag: -3,
  lagUnit: 'd'
}
```

---

## 4. How Dependencies Affect Scheduling

Dependencies drive the scheduling engine to calculate task dates based on constraints and relationships.

### Scheduling Direction

```typescript
type SchedulingMode = 'forward' | 'backward';

// Forward scheduling: Calculates end dates from start dates
// Backward scheduling: Calculates start dates from end dates
```

### Impact on Task Dates

```typescript
interface TaskSchedulingFields {
  // Early dates (forward pass)
  earlyStartDate: Date;   // Earliest possible start
  earlyEndDate: Date;     // Earliest possible end

  // Late dates (backward pass)
  lateStartDate: Date;    // Latest possible start without delaying project
  lateEndDate: Date;      // Latest possible end without delaying project

  // Slack/Float
  totalSlack: number;     // Difference between early and late dates

  // Critical path
  critical: boolean;      // True if task has zero slack
}
```

### Constraint Types

Dependencies interact with task constraints:

```typescript
type ConstraintType =
  | 'muststarton'         // MSO - Must Start On
  | 'mustfinishon'        // MFO - Must Finish On
  | 'startnoearlierthan'  // SNET - Start No Earlier Than
  | 'startnolaterthan'    // SNLT - Start No Later Than
  | 'finishnoearlierthan' // FNET - Finish No Earlier Than
  | 'finishnolaterthan'   // FNLT - Finish No Later Than
  | null;                 // As Soon As Possible (ASAP)
```

### Active/Inactive Dependencies

```typescript
// Set active to false to ignore dependency in scheduling
const dependency = {
  from: 'task1',
  to: 'task2',
  type: 2,
  active: false  // This dependency won't affect task2's scheduling
};

// Toggle at runtime
dependencyRecord.active = false;
await project.commitAsync();
```

### Unscheduled Tasks

```typescript
interface TaskModel {
  // When true, task is not rendered and doesn't affect successors
  unscheduled?: boolean;
}

// Unscheduled tasks don't propagate constraints to their successors
```

---

## 5. Dependency Validation and Cycles

The scheduling engine validates dependencies and detects circular references.

### Validation Methods

```typescript
class DependencyStoreMixinClass {
  /**
   * Validates an existing dependency
   * @returns Promise<boolean> - true if valid
   */
  isValidDependency(
    dependencyOrFromId: SchedulerDependencyModel | TimeSpan | number | string,
    toId?: TimeSpan | number | string,
    type?: number
  ): Promise<boolean>;

  /**
   * Validates a dependency before creation
   * @returns Promise<boolean> - true if valid to create
   */
  isValidDependencyToCreate(
    fromId: TimeSpan | number | string,
    toId: TimeSpan | number | string,
    type: number
  ): Promise<boolean>;
}
```

### Cycle Detection

The Engine detects computation cycles and fires the `cycle` event:

```typescript
interface CycleEvent {
  schedulingIssue: {
    getDescription(): string;       // Human-readable cycle description
    cycle: object;                  // Cycle information
    getResolutions(): Resolution[]; // Possible resolutions
  };
  continueWithResolutionResult(result: EffectResolutionResult): void;
}

// Handling cycles
project.on('cycle', ({ schedulingIssue, continueWithResolutionResult }) => {
  console.log('Cycle detected:', schedulingIssue.getDescription());

  // Cancel the change that caused the cycle
  continueWithResolutionResult(EffectResolutionResult.Cancel);

  // Or show user options from getResolutions()
});
```

### EffectResolutionResult Options

```typescript
enum EffectResolutionResult {
  Cancel,    // Cancel the change that caused the issue
  Resume,    // Continue with default resolution
  // Additional resolution options available
}
```

### Validation Example

```typescript
const dependencyStore = project.dependencyStore;

// Check before creating
async function createDependencyIfValid(from: string, to: string, type: number) {
  const isValid = await dependencyStore.isValidDependencyToCreate(from, to, type);

  if (isValid) {
    dependencyStore.add({
      from,
      to,
      type
    });
    await project.commitAsync();
    return true;
  } else {
    console.warn('Invalid dependency: would create cycle or invalid relationship');
    return false;
  }
}

// Validate existing dependency
async function checkDependency(dependency: DependencyModel) {
  const isValid = await dependencyStore.isValidDependency(dependency);
  return isValid;
}
```

---

## 6. Visual Rendering of Dependency Lines

The Dependencies feature handles visual rendering of dependency connections.

### Dependencies Feature Configuration

```typescript
type DependenciesConfig = {
  type?: 'dependencies';

  // Creation settings
  allowCreate?: boolean;                // Enable dependency creation
  allowDropOnEventBar?: boolean;        // Allow dropping on event bar
  allowCreateOnlyParent?: boolean;      // Only parent events (nested events)

  // Visual settings
  clickWidth?: number;                  // Clickable width of lines (px)
  radius?: number;                      // Corner radius for line segments

  // Drawing behavior
  drawOnScroll?: boolean;               // Redraw during scroll
  drawOnEventInteraction?: boolean;     // Redraw during drag/resize
  drawAroundParents?: boolean;          // Draw around parent events

  // Interaction
  enableDelete?: boolean;               // Allow click-to-delete
  highlightDependenciesOnEventHover?: boolean;  // Highlight on hover
  showTooltip?: boolean;                // Show dependency tooltip

  // Terminal visibility
  showTerminals?: boolean | string[];   // Show connection terminals
  terminalSide?: 'top' | 'right' | 'bottom' | 'left';
  terminalsVisibleTimeout?: number;     // Hide delay in ms

  // Tooltip templates
  creationTooltipTemplate?: (data: CreationTooltipData) => string | DomConfig;
}

interface CreationTooltipData {
  source: TimeSpan;
  target: TimeSpan;
  fromSide: 'start' | 'end' | 'top' | 'bottom';
  toSide: 'start' | 'end' | 'top' | 'bottom';
  valid: boolean;
}
```

### Custom Renderer

```typescript
const gantt = new Gantt({
  features: {
    dependencies: {
      radius: 5,

      // Custom dependency line renderer
      renderer: ({
        domConfig,
        dependencyRecord,
        fromAssignmentRecord,
        toAssignmentRecord,
        points,
        fromBox,
        toBox,
        fromSide,
        toSide
      }) => {
        // Modify the domConfig for custom styling
        const isCritical = dependencyRecord.fromTask?.critical &&
                          dependencyRecord.toTask?.critical;

        if (isCritical) {
          domConfig.class['b-critical-dependency'] = true;
        }

        // Add custom attributes
        domConfig.dataset = {
          dependencyType: dependencyRecord.type,
          lag: dependencyRecord.lag
        };
      }
    }
  }
});
```

### CSS Styling

```css
/* Base dependency line */
.b-sch-dependency {
  stroke: #666;
  stroke-width: 1px;
  fill: none;
}

/* Dependency arrow marker */
.b-sch-dependency-arrow {
  fill: #666;
}

/* Highlighted state */
.b-sch-dependency.b-highlight {
  stroke: #3183fe;
  stroke-width: 2px;
}

/* Custom CSS class from dependency record */
.b-sch-dependency.my-custom-class {
  stroke: #ff6b6b;
  stroke-dasharray: 5, 5;
}

/* Critical path dependencies */
.b-sch-dependency.b-critical-dependency {
  stroke: #e74c3c;
  stroke-width: 2px;
}

/* Inactive dependencies */
.b-sch-dependency.b-inactive {
  stroke: #ccc;
  stroke-dasharray: 3, 3;
  opacity: 0.6;
}
```

### Resolving Dependency from DOM

```typescript
const gantt = new Gantt({ ... });

// Get dependency record from clicked element
gantt.on('dependencyclick', ({ event, dependency }) => {
  console.log('Clicked dependency:', dependency);
});

// Programmatically resolve
const element = document.querySelector('.b-sch-dependency');
const dependency = gantt.features.dependencies.resolveDependencyRecord(element);
```

---

## 7. Dependency Creation Feature

The DependencyCreation mixin enables interactive dependency creation by dragging.

### Configuration

```typescript
type DependencyCreationConfig = {
  // Visual terminals
  showTerminals?: boolean | string[];   // Show connection points
  terminalSide?: 'top' | 'right' | 'bottom' | 'left';
  terminalsVisibleTimeout?: number;     // Ms before hiding

  // Behavior
  allowDropOnEventBar?: boolean;        // Create on bar drop

  // Tooltip customization
  creationTooltip?: TooltipConfig;
  creationTooltipTemplate?: (data: TooltipData) => string | DomConfig;
}
```

### Creation Events

```typescript
interface DependencyCreationEvents {
  // Before drag starts
  beforeDependencyCreateDrag: (event: {
    source: TimeSpan;
  }) => boolean | void;

  // During drag
  dependencyCreateDrag: (event: {
    source: TimeSpan;
    target: TimeSpan;
    fromSide: string;
    toSide: string;
  }) => void;

  // Before finalizing
  beforeDependencyCreateFinalize: (event: {
    source: TimeSpan;
    target: TimeSpan;
    fromSide: 'start' | 'end' | 'top' | 'bottom';
    toSide: 'start' | 'end' | 'top' | 'bottom';
  }) => boolean | void;

  // After creation
  dependencyCreate: (event: {
    dependencyRecord: DependencyModel;
  }) => void;
}
```

### Handling Creation

```typescript
const gantt = new Gantt({
  features: {
    dependencies: {
      allowCreate: true,
      showTerminals: true,

      creationTooltipTemplate: ({ source, target, fromSide, toSide, valid }) => {
        return `
          <div class="creation-tooltip">
            <div>From: ${source.name} (${fromSide})</div>
            <div>To: ${target?.name || 'Drop on task'} (${toSide})</div>
            <div class="${valid ? 'valid' : 'invalid'}">
              ${valid ? 'Release to create' : 'Invalid dependency'}
            </div>
          </div>
        `;
      }
    }
  },

  listeners: {
    beforeDependencyCreateFinalize({ source, target, fromSide, toSide }) {
      // Validate or prevent creation
      if (source.id === target.id) {
        return false; // Prevent self-dependency
      }

      // Log the creation attempt
      console.log(`Creating: ${source.name} -> ${target.name}`);
    },

    dependencyCreate({ dependencyRecord }) {
      console.log('Created dependency:', dependencyRecord.id);
    }
  }
});
```

### Programmatic Creation

```typescript
// Using DependencyStore.add()
const newDependencies = project.dependencyStore.add([
  { from: 'task1', to: 'task2', type: 2 },
  { from: 'task2', to: 'task3', type: 2, lag: 1, lagUnit: 'd' }
]);

// Wait for calculations
await project.commitAsync();

// Using addAsync for immediate calculation
const added = await project.dependencyStore.addAsync({
  from: 'taskA',
  to: 'taskB',
  type: DependencyModel.Type.EndToStart
});

console.log('Added dependency:', added[0].id);
```

---

## 8. Dependency Editing

The DependencyEdit feature provides a popup editor for modifying dependencies.

### DependencyEdit Configuration

```typescript
type DependencyEditConfig = {
  type?: 'dependencyEdit' | 'dependencyedit';

  // Behavior
  autoClose?: boolean;           // Close on outside click
  saveAndCloseOnEnter?: boolean; // Enter key saves

  // UI options
  showDeleteButton?: boolean;    // Show delete button
  showLagField?: boolean;        // Show lag field

  // Trigger
  triggerEvent?: string;         // Default: 'dependencydblclick'

  // Editor popup config
  editorConfig?: PopupConfig;
}
```

### Edit Events

```typescript
interface DependencyEditEvents {
  // Before showing editor
  beforeDependencyEdit: (event: {
    source: Scheduler | Gantt;
    dependencyEdit: SchedulerDependencyEdit;
    dependencyRecord: DependencyModel;
  }) => boolean | void;

  // Before editor shows (for field manipulation)
  beforeDependencyEditShow: (event: {
    source: Scheduler | Gantt;
    dependencyEdit: SchedulerDependencyEdit;
    dependencyRecord: DependencyModel;
    editor: Popup;
  }) => void;

  // Before saving
  beforeDependencySave: (event: {
    source: Scheduler | Gantt;
    dependencyRecord: DependencyModel;
    values: object;
  }) => boolean | void;

  // After save
  afterDependencySave: (event: {
    source: Scheduler | Gantt;
    dependencyRecord: DependencyModel;
  }) => void;

  // Before delete
  beforeDependencyDelete: (event: {
    source: Scheduler | Gantt;
    dependencyRecord: DependencyModel;
  }) => boolean | void;

  // Before add (from editor)
  beforeDependencyAdd: (event: {
    source: Scheduler | Gantt;
    dependencyEdit: SchedulerDependencyEdit;
    dependencyRecord: DependencyModel;
  }) => boolean | void;
}
```

### Custom Editor Example

```typescript
const gantt = new Gantt({
  features: {
    dependencyEdit: {
      autoClose: true,
      showDeleteButton: true,
      showLagField: true,
      triggerEvent: 'dependencydblclick',

      editorConfig: {
        title: 'Edit Dependency',
        width: 400,

        items: {
          fromField: {
            type: 'combo',
            label: 'From Task',
            name: 'from',
            // Custom store/configuration
          },
          toField: {
            type: 'combo',
            label: 'To Task',
            name: 'to'
          },
          typeField: {
            type: 'dependencytypepicker',
            label: 'Type',
            name: 'type'
          },
          lagField: {
            type: 'durationfield',
            label: 'Lag',
            name: 'lag'
          },
          activeField: {
            type: 'checkbox',
            label: 'Active',
            name: 'active'
          }
        }
      }
    }
  },

  listeners: {
    beforeDependencyEdit({ dependencyRecord, dependencyEdit }) {
      console.log('Editing:', dependencyRecord.id);
      // Return false to cancel edit
    },

    beforeDependencySave({ dependencyRecord, values }) {
      console.log('Saving values:', values);
      // Validate before save
      if (values.lag < 0 && values.type === 2) {
        // Confirm negative lag
        return confirm('Allow negative lag (lead time)?');
      }
    },

    beforeDependencyDelete({ dependencyRecord }) {
      return confirm(`Delete dependency from ${dependencyRecord.fromTask.name}?`);
    }
  }
});
```

### DependencyTypePicker Widget

```typescript
// The DependencyTypePicker is a combo box for selecting dependency types
type DependencyTypePickerConfig = {
  type?: 'dependencytypepicker';
  name?: string;
  label?: string;
  value?: number;  // 0, 1, 2, or 3
  // Inherits from Combo
}

// Usage in custom forms
const typePicker = new DependencyTypePicker({
  label: 'Dependency Type',
  value: 2, // Default to FS
  listeners: {
    change({ value }) {
      console.log('Selected type:', value);
    }
  }
});
```

---

## 9. Predecessors/Successors on TaskModel

Tasks provide direct access to their dependencies through predecessor and successor relationships.

### Task Dependency Properties

While the TaskModel type definitions focus on scheduling dates, predecessor/successor relationships are accessed through the dependency system:

```typescript
// These are calculated based on dependencies pointing to/from the task
interface TaskSchedulingDates {
  // Calculated from predecessors
  earlyStartDate: Date;   // Based on predecessor end dates + lag
  earlyEndDate: Date;     // earlyStartDate + duration

  // Calculated from successors
  lateStartDate: Date;    // lateEndDate - duration
  lateEndDate: Date;      // Based on successor start dates - lag

  // Float/Slack
  totalSlack: number;     // lateStartDate - earlyStartDate

  // Critical path indicator
  critical: boolean;      // true if totalSlack === 0
}
```

### Accessing Dependencies from Task

```typescript
const task = project.taskStore.getById('task1');

// Get all dependencies for a task
const allDependencies = project.dependencyStore.getEventDependencies(task);

// Filter incoming dependencies (where task is the target)
const incomingDeps = allDependencies.filter(dep => dep.toTask === task);

// Filter outgoing dependencies (where task is the source)
const outgoingDeps = allDependencies.filter(dep => dep.fromTask === task);

// Get predecessor tasks
const predecessors = incomingDeps.map(dep => dep.fromTask);

// Get successor tasks
const successors = outgoingDeps.map(dep => dep.toTask);
```

### Utility for Task Dependencies

```typescript
function getTaskPredecessors(task: TaskModel, dependencyStore: DependencyStore) {
  return dependencyStore.records
    .filter(dep => dep.to === task.id || dep.toTask === task)
    .map(dep => ({
      task: dep.fromTask,
      dependency: dep,
      type: dep.type,
      lag: dep.lag,
      lagUnit: dep.lagUnit
    }));
}

function getTaskSuccessors(task: TaskModel, dependencyStore: DependencyStore) {
  return dependencyStore.records
    .filter(dep => dep.from === task.id || dep.fromTask === task)
    .map(dep => ({
      task: dep.toTask,
      dependency: dep,
      type: dep.type,
      lag: dep.lag,
      lagUnit: dep.lagUnit
    }));
}

// Usage
const predecessors = getTaskPredecessors(myTask, project.dependencyStore);
console.log('Predecessor tasks:', predecessors.map(p => p.task.name));

const successors = getTaskSuccessors(myTask, project.dependencyStore);
console.log('Successor tasks:', successors.map(s => s.task.name));
```

### Finding Dependencies Between Tasks

```typescript
// Check if dependency exists between two tasks
function getDependencyBetween(
  fromTask: TaskModel,
  toTask: TaskModel,
  store: DependencyStore
): DependencyModel | null {
  return store.getDependencyForSourceAndTargetEvents(fromTask, toTask);
}

// Get any dependency linking two tasks (either direction)
function getAnyLinkBetween(
  task1: TaskModel,
  task2: TaskModel,
  store: DependencyStore
): DependencyModel | null {
  return store.getEventsLinkingDependency(task1, task2);
}
```

---

## 10. DependencyStore Operations

The DependencyStore manages all dependency records and provides CRUD operations.

### Store Configuration

```typescript
type DependencyStoreConfig = {
  // Model class
  modelClass?: typeof DependencyModel;

  // Data
  data?: DependencyModelConfig[];

  // Sync/Load URLs (if using AjaxStore)
  readUrl?: string;
  createUrl?: string;
  updateUrl?: string;
  deleteUrl?: string;
}
```

### CRUD Operations

```typescript
class DependencyStoreMixinClass {
  // Add dependencies
  add(
    records: DependencyModel | DependencyModel[] | DependencyModelConfig | DependencyModelConfig[],
    silent?: boolean
  ): DependencyModel[];

  // Add with async calculation
  addAsync(
    records: DependencyModel | DependencyModel[] | DependencyModelConfig | DependencyModelConfig[],
    silent?: boolean
  ): Promise<DependencyModel[]>;

  // Load data
  data: DependencyModelConfig[];

  // Load with async calculation
  loadDataAsync(data: DependencyModelConfig[]): Promise<void>;

  // Query methods
  getDependencyForSourceAndTargetEvents(
    sourceEvent: SchedulerEventModel | string,
    targetEvent: SchedulerEventModel | string
  ): DependencyModel;

  getEventsLinkingDependency(
    sourceEvent: SchedulerEventModel | string,
    targetEvent: SchedulerEventModel | string
  ): DependencyModel;

  getEventDependencies(event: SchedulerEventModel): DependencyModel[];

  getHighlightedDependencies(cls: string): DependencyModel[];

  // Validation
  isValidDependency(
    dependency: DependencyModel | TimeSpan | number | string,
    toId?: TimeSpan | number | string,
    type?: number
  ): Promise<boolean>;

  isValidDependencyToCreate(
    fromId: TimeSpan | number | string,
    toId: TimeSpan | number | string,
    type: number
  ): Promise<boolean>;
}
```

### Common Operations

```typescript
const dependencyStore = project.dependencyStore;

// 1. Add single dependency
const [newDep] = dependencyStore.add({
  from: 'task1',
  to: 'task2',
  type: 2
});

// 2. Add multiple dependencies
const newDeps = dependencyStore.add([
  { from: 'task1', to: 'task2', type: 2 },
  { from: 'task2', to: 'task3', type: 2 },
  { from: 'task1', to: 'task3', type: 0, lag: 2, lagUnit: 'd' }
]);

// 3. Wait for engine calculations
await project.commitAsync();

// 4. Update dependency
const dep = dependencyStore.getById(1);
dep.type = 0;  // Change to Start-to-Start
dep.lag = 1;
dep.lagUnit = 'w';
await project.commitAsync();

// 5. Remove dependency
dependencyStore.remove(dep);
await project.commitAsync();

// 6. Remove multiple
dependencyStore.remove([dep1, dep2, dep3]);

// 7. Clear all dependencies
dependencyStore.removeAll();

// 8. Query dependencies for a task
const task = project.taskStore.getById('task2');
const taskDeps = dependencyStore.getEventDependencies(task);

// 9. Check for existing link
const existing = dependencyStore.getDependencyForSourceAndTargetEvents('task1', 'task2');
if (!existing) {
  dependencyStore.add({ from: 'task1', to: 'task2', type: 2 });
}

// 10. Filter dependencies
const fsDependencies = dependencyStore.query(dep => dep.type === 2);
const laggingDeps = dependencyStore.query(dep => dep.lag > 0);
const activeDeps = dependencyStore.query(dep => dep.active !== false);
```

### Store Events

```typescript
dependencyStore.on({
  add({ records }) {
    console.log('Dependencies added:', records.length);
  },

  remove({ records }) {
    console.log('Dependencies removed:', records.length);
  },

  update({ record, changes }) {
    console.log('Dependency updated:', record.id, changes);
  },

  beforeAdd({ records }) {
    // Validate before adding
    for (const rec of records) {
      if (rec.from === rec.to) {
        console.warn('Self-dependency attempted');
        return false;
      }
    }
  },

  beforeRemove({ records }) {
    // Confirm deletion
    return confirm(`Delete ${records.length} dependencies?`);
  }
});
```

### Bulk Operations with Validation

```typescript
async function createDependenciesWithValidation(
  dependencies: DependencyModelConfig[],
  store: DependencyStore
): Promise<{ created: DependencyModel[]; rejected: DependencyModelConfig[] }> {
  const created: DependencyModel[] = [];
  const rejected: DependencyModelConfig[] = [];

  for (const dep of dependencies) {
    const isValid = await store.isValidDependencyToCreate(
      dep.from,
      dep.to,
      dep.type ?? 2
    );

    if (isValid) {
      const [added] = store.add(dep);
      created.push(added);
    } else {
      rejected.push(dep);
    }
  }

  if (created.length > 0) {
    await store.project.commitAsync();
  }

  return { created, rejected };
}
```

---

## Practical Patterns

### Pattern 1: Building a Dependency Chain

```typescript
async function createSequentialChain(taskIds: string[], project: ProjectModel) {
  const dependencies: DependencyModelConfig[] = [];

  for (let i = 0; i < taskIds.length - 1; i++) {
    dependencies.push({
      from: taskIds[i],
      to: taskIds[i + 1],
      type: 2  // Finish-to-Start
    });
  }

  project.dependencyStore.add(dependencies);
  await project.commitAsync();
}

// Usage
await createSequentialChain(['design', 'develop', 'test', 'deploy'], project);
```

### Pattern 2: Parallel Start Dependencies

```typescript
async function createParallelStart(
  triggerTaskId: string,
  parallelTaskIds: string[],
  project: ProjectModel
) {
  const dependencies = parallelTaskIds.map(id => ({
    from: triggerTaskId,
    to: id,
    type: 0  // Start-to-Start
  }));

  project.dependencyStore.add(dependencies);
  await project.commitAsync();
}

// Usage: When 'kickoff' starts, all phase tasks start too
await createParallelStart('kickoff', ['phase1', 'phase2', 'phase3'], project);
```

### Pattern 3: Finish Together Dependencies

```typescript
async function createSyncFinish(
  controllingTaskId: string,
  dependentTaskIds: string[],
  project: ProjectModel
) {
  const dependencies = dependentTaskIds.map(id => ({
    from: controllingTaskId,
    to: id,
    type: 3  // Finish-to-Finish
  }));

  project.dependencyStore.add(dependencies);
  await project.commitAsync();
}

// Usage: All cleanup tasks finish when main work finishes
await createSyncFinish('mainWork', ['cleanup1', 'cleanup2', 'cleanup3'], project);
```

### Pattern 4: Highlight Critical Dependencies

```typescript
function highlightCriticalPath(gantt: Gantt) {
  const { dependencyStore, taskStore } = gantt.project;

  // Find critical tasks
  const criticalTasks = taskStore.query(task => task.critical);
  const criticalIds = new Set(criticalTasks.map(t => t.id));

  // Highlight dependencies between critical tasks
  dependencyStore.forEach(dep => {
    const fromCritical = criticalIds.has(dep.fromTask?.id);
    const toCritical = criticalIds.has(dep.toTask?.id);

    if (fromCritical && toCritical) {
      dep.highlight('b-critical-path');
    } else {
      dep.unhighlight('b-critical-path');
    }
  });
}
```

### Pattern 5: Export/Import Dependencies

```typescript
function exportDependencies(store: DependencyStore): DependencyModelConfig[] {
  return store.records.map(dep => ({
    id: dep.id,
    from: dep.from,
    to: dep.to,
    type: dep.type,
    lag: dep.lag,
    lagUnit: dep.lagUnit,
    active: dep.active,
    cls: dep.cls
  }));
}

async function importDependencies(
  data: DependencyModelConfig[],
  project: ProjectModel,
  clearExisting: boolean = false
) {
  if (clearExisting) {
    project.dependencyStore.removeAll();
  }

  await project.dependencyStore.loadDataAsync(data);
}
```

---

## Cross-References

### Related Deep-Dive Documents

| Document | Relationship |
|----------|--------------|
| [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) | How dependencies affect scheduling calculations |
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | DependencyStore in ProjectModel |
| [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) | Dependency line rendering |
| [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) | Dependency creation/editing events |

### Key API References (Level 1)

- `DependencyModelConfig` - Dependency model fields
- `DependencyStoreConfig` - Dependency store setup
- `DependenciesConfig` - Dependencies feature configuration
- `DependencyEditConfig` - Dependency editor configuration

---

## Summary

Dependencies are the backbone of project scheduling in Bryntum Gantt:

1. **DependencyModel** encapsulates task relationships with from/to references
2. **Four dependency types** (SS, SF, FS, FF) define timing relationships
3. **Lag** adds positive or negative offsets between linked tasks
4. **The scheduling engine** calculates dates based on dependencies and constraints
5. **Cycle detection** prevents invalid circular references
6. **Visual rendering** draws SVG lines with customizable styling
7. **Interactive creation** allows drag-and-drop dependency creation
8. **Edit popup** provides a UI for modifying dependency properties
9. **Task relationships** can be queried for predecessors/successors
10. **DependencyStore** provides CRUD operations and validation

Understanding these components enables building sophisticated project schedules with proper task sequencing and automatic date calculation.
