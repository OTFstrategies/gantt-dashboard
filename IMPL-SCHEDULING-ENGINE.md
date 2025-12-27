# IMPL: Scheduling Engine (Chronograph)

> **Implementation Guide** - Hoe Bryntum's scheduling engine werkt en kernconcepten voor eigen implementatie.

---

## Overzicht

De Bryntum scheduling engine is gebaseerd op **ChronoGraph**, een reactive computation engine die een directed acyclic graph (DAG) van berekeningen beheert.

```
┌─────────────────────────────────────────────────────────────────┐
│                      ProjectModel                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   ChronoGraph Engine                      │   │
│  │                                                           │   │
│  │  [startDate] ──→ [duration] ──→ [endDate]                │   │
│  │       ↑              ↑              │                     │   │
│  │       │         [calendar]          ↓                     │   │
│  │  [constraint]        │        [dependencies]              │   │
│  │                      ↓              │                     │   │
│  │                 [effort] ←── [assignments]                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Core Concepts

### 1.1 Reactive Graph

```typescript
// Elk field is een "Identifier" in de graph
interface TaskFields {
    startDate: Date;       // Input of computed
    endDate: Date;         // Computed from startDate + duration
    duration: number;      // Input of computed
    effort: number;        // Computed from assignments
    percentDone: number;   // Input
    calendar: Calendar;    // Reference
    constraint: Constraint;
}

// Dependencies worden automatisch getrackt
// Als startDate verandert → endDate herberekenen
// Als duration verandert → endDate herberekenen
// Als calendar verandert → duration/endDate herberekenen
```

### 1.2 Scheduling Direction

```typescript
type SchedulingDirection = 'Forward' | 'Backward';

// Forward: startDate → endDate
// - Start bij project startDate
// - Bereken endDate = startDate + duration

// Backward: endDate → startDate
// - Start bij project endDate
// - Bereken startDate = endDate - duration
```

### 1.3 Scheduling Modes

```typescript
type SchedulingMode =
    | 'Normal'        // Default
    | 'FixedDuration' // Duration blijft vast
    | 'FixedEffort'   // Effort blijft vast
    | 'FixedUnits';   // Assignment units blijft vast

// Relatie: duration × units = effort
//
// FixedDuration: effort en units passen zich aan
// FixedEffort: duration en units passen zich aan
// FixedUnits: duration en effort passen zich aan
```

---

## 2. Constraint Types

### 2.1 Beschikbare Constraints

```typescript
type ConstraintType =
    // Soft constraints (voorkeur)
    | 'startnoearlierthan'   // Start niet eerder dan
    | 'startnolaterthan'     // Start niet later dan
    | 'finishnoearlierthan'  // Eindig niet eerder dan
    | 'finishnolaterthan'    // Eindig niet later dan

    // Hard constraints (must)
    | 'muststarton'          // Moet starten op
    | 'mustfinishon';        // Moet eindigen op

interface Constraint {
    type: ConstraintType;
    date: Date;
}
```

### 2.2 Constraint Prioriteit

```
1. Hard constraints (muststarton, mustfinishon)
2. Dependencies
3. Soft constraints
4. Calendar restrictions
```

### 2.3 Auto Constraints

```javascript
const project = new ProjectModel({
    // Automatisch constraints toevoegen
    autoSetConstraints: true
});

// Dit voegt 'startnoearlierthan' toe aan tasks die:
// - Geen predecessors hebben
// - Geen constraint hebben
// - Niet manuallyScheduled zijn
```

---

## 3. Dependencies

### 3.1 Dependency Types

```typescript
type DependencyType =
    | 0  // Start-to-Start (SS)
    | 1  // Start-to-End (SE)
    | 2  // End-to-Start (ES) - Default
    | 3; // End-to-End (EE)

interface Dependency {
    fromTask: Task;
    toTask: Task;
    type: DependencyType;
    lag: number;           // Delay in working time units
    lagUnit: DurationUnit;
}
```

### 3.2 Dependency Effect op Scheduling

```
ES (End-to-Start):
  Task A: |████████|
  Task B:           |████████|

  B.startDate >= A.endDate + lag

SS (Start-to-Start):
  Task A: |████████|
  Task B: |████████|

  B.startDate >= A.startDate + lag

EE (End-to-End):
  Task A: |████████|
  Task B:     |████████|

  B.endDate >= A.endDate + lag

SE (Start-to-End):
  Task A:     |████████|
  Task B: |████████|

  B.endDate >= A.startDate + lag
```

---

## 4. Calendar System

### 4.1 Calendar Structure

```typescript
interface Calendar {
    id: string;
    name: string;
    intervals: CalendarInterval[];
    parent?: Calendar;  // Inheritance
    unspecifiedTimeIsWorking: boolean;
}

interface CalendarInterval {
    // Recurrent (Later.js syntax)
    recurrentStartDate?: string;  // "on Mon at 09:00"
    recurrentEndDate?: string;    // "on Mon at 17:00"

    // Static
    startDate?: Date;
    endDate?: Date;

    isWorking: boolean;
    priority?: number;
}
```

### 4.2 Working Time Berekening

```javascript
// Duration = working time tussen start en end
function calculateDuration(startDate, endDate, calendar) {
    let duration = 0;

    for (const interval of calendar.getWorkingIntervals(startDate, endDate)) {
        duration += interval.duration;
    }

    return duration;
}

// EndDate = startDate + duration (in working time)
function calculateEndDate(startDate, duration, calendar) {
    let remaining = duration;
    let current = startDate;

    while (remaining > 0) {
        const interval = calendar.getNextWorkingInterval(current);
        const available = Math.min(remaining, interval.duration);
        remaining -= available;
        current = interval.end;
    }

    return current;
}
```

### 4.3 Duration Units

```javascript
const project = new ProjectModel({
    hoursPerDay: 8,    // 1 day = 8 hours
    daysPerWeek: 5,    // 1 week = 5 days
    daysPerMonth: 20   // 1 month = 20 days
});

// Conversie: 2 days → 16 hours → millisecondes in calendar
```

---

## 5. Conflict Resolution

### 5.1 Conflict Types

```typescript
type ConflictType =
    | 'SchedulingConflict'     // Constraint vs dependency
    | 'DependencyCycle'        // Circular dependencies
    | 'InvalidDependency'      // Self-reference
    | 'EmptyCalendar';         // Calendar zonder working time

interface SchedulingConflict {
    type: ConflictType;
    task?: Task;
    dependency?: Dependency;
    resolutions: Resolution[];
}
```

### 5.2 Resolutions

```javascript
project.on('schedulingConflict', ({ conflict, continueWithResolutionResult }) => {
    console.log('Conflict:', conflict.type);

    // Beschikbare resolutions
    conflict.resolutions.forEach(resolution => {
        console.log('Option:', resolution.type);
    });

    // Automatisch eerste resolution kiezen
    continueWithResolutionResult(conflict.resolutions[0]);

    // Of: toon UI aan gebruiker
    showConflictDialog(conflict).then(chosenResolution => {
        continueWithResolutionResult(chosenResolution);
    });
});
```

### 5.3 Resolution Types

```typescript
type ResolutionType =
    | 'RemoveDependency'       // Dependency verwijderen
    | 'DeactivateConstraint'   // Constraint uitzetten
    | 'MoveTask'               // Task verplaatsen
    | 'Honor';                 // Negeer conflict
```

---

## 6. Propagation Cycle

### 6.1 Hoe Propagation Werkt

```
1. User wijzigt task.startDate
2. Engine markeert afhankelijke fields als "stale"
3. Engine berekent nieuwe waarden in topologische volgorde:
   - task.endDate = calculateEndDate(startDate, duration, calendar)
   - successorTask.startDate = task.endDate + lag
   - ...
4. Conflicts worden gedetecteerd
5. UI wordt ge-update
```

### 6.2 Batching

```javascript
// SLECHT: Elke wijziging triggert volledige propagation
tasks.forEach(task => {
    task.duration = 5;  // Propagate!
});

// GOED: Batch alle wijzigingen
project.beginBatch();
tasks.forEach(task => {
    task.duration = 5;
});
await project.endBatch();  // Eén propagation
```

### 6.3 Project Queue

```javascript
// Complex operations via queue
await project.queue(async () => {
    // Alle wijzigingen in deze functie worden gebatched
    task1.startDate = new Date();
    task2.duration = 10;

    await task3.setCalendar(newCalendar);
});
```

---

## 7. Eigen Scheduling Engine Implementatie

### 7.1 Minimal Scheduler

```typescript
interface Task {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    duration: number;  // in days
    predecessors: string[];  // task IDs
    constraint?: {
        type: 'startnoearlierthan' | 'muststarton';
        date: Date;
    };
}

class SimpleScheduler {
    private tasks: Map<string, Task> = new Map();

    addTask(task: Task): void {
        this.tasks.set(task.id, task);
    }

    schedule(): void {
        // Topologische sortering
        const sorted = this.topologicalSort();

        for (const task of sorted) {
            this.scheduleTask(task);
        }
    }

    private scheduleTask(task: Task): void {
        // 1. Bepaal vroegst mogelijke start
        let earliestStart = new Date(0);

        // Check predecessors
        for (const predId of task.predecessors) {
            const pred = this.tasks.get(predId)!;
            if (pred.endDate > earliestStart) {
                earliestStart = new Date(pred.endDate);
            }
        }

        // Check constraint
        if (task.constraint) {
            const { type, date } = task.constraint;

            if (type === 'muststarton') {
                earliestStart = date;
            } else if (type === 'startnoearlierthan' && date > earliestStart) {
                earliestStart = date;
            }
        }

        // 2. Set start date
        task.startDate = earliestStart;

        // 3. Calculate end date (simple: add days)
        task.endDate = new Date(earliestStart);
        task.endDate.setDate(task.endDate.getDate() + task.duration);
    }

    private topologicalSort(): Task[] {
        const visited = new Set<string>();
        const result: Task[] = [];

        const visit = (taskId: string) => {
            if (visited.has(taskId)) return;
            visited.add(taskId);

            const task = this.tasks.get(taskId)!;
            for (const predId of task.predecessors) {
                visit(predId);
            }
            result.push(task);
        };

        for (const taskId of this.tasks.keys()) {
            visit(taskId);
        }

        return result;
    }
}
```

### 7.2 Calendar-Aware Scheduler

```typescript
interface WorkingInterval {
    start: Date;
    end: Date;
}

class CalendarAwareScheduler extends SimpleScheduler {
    private calendar: Calendar;

    private calculateEndDate(startDate: Date, durationHours: number): Date {
        let remaining = durationHours;
        let current = new Date(startDate);

        while (remaining > 0) {
            // Vind volgende working interval
            const interval = this.calendar.getNextWorkingInterval(current);

            if (!interval) {
                throw new Error('No working time available');
            }

            // Skip naar start van interval
            if (current < interval.start) {
                current = new Date(interval.start);
            }

            // Bereken beschikbare tijd in dit interval
            const intervalHours = this.getHours(current, interval.end);
            const useHours = Math.min(remaining, intervalHours);

            remaining -= useHours;
            current = this.addHours(current, useHours);
        }

        return current;
    }

    private getHours(start: Date, end: Date): number {
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }

    private addHours(date: Date, hours: number): Date {
        return new Date(date.getTime() + hours * 60 * 60 * 1000);
    }
}
```

### 7.3 Reactive Field System

```typescript
// Simplified reactive field implementation
type FieldGetter<T> = () => T;
type FieldSetter<T> = (value: T) => void;

class ReactiveTask {
    private _startDate: Date;
    private _duration: number;
    private _endDate: Date;
    private listeners: Map<string, Function[]> = new Map();

    get startDate(): Date {
        return this._startDate;
    }

    set startDate(value: Date) {
        this._startDate = value;
        this.propagate('startDate');
    }

    get duration(): number {
        return this._duration;
    }

    set duration(value: number) {
        this._duration = value;
        this.propagate('duration');
    }

    get endDate(): Date {
        return this._endDate;
    }

    private propagate(changedField: string): void {
        // Bereken afhankelijke fields
        if (changedField === 'startDate' || changedField === 'duration') {
            this._endDate = this.calculateEndDate();
            this.notify('endDate');
        }

        this.notify(changedField);
    }

    private calculateEndDate(): Date {
        const end = new Date(this._startDate);
        end.setDate(end.getDate() + this._duration);
        return end;
    }

    on(field: string, callback: Function): void {
        if (!this.listeners.has(field)) {
            this.listeners.set(field, []);
        }
        this.listeners.get(field)!.push(callback);
    }

    private notify(field: string): void {
        this.listeners.get(field)?.forEach(cb => cb(this));
    }
}
```

---

## 8. Critical Path Method (CPM)

### 8.1 Critical Path Berekening

```typescript
interface CriticalPathTask extends Task {
    earlyStart: Date;
    earlyFinish: Date;
    lateStart: Date;
    lateFinish: Date;
    totalSlack: number;  // days
    isCritical: boolean;
}

class CriticalPathCalculator {
    calculateCriticalPath(tasks: Task[]): CriticalPathTask[] {
        const cptasks = tasks.map(t => this.initCPTask(t));

        // Forward pass: calculate early dates
        const sorted = this.topologicalSort(cptasks);
        for (const task of sorted) {
            this.forwardPass(task, cptasks);
        }

        // Backward pass: calculate late dates
        const reversed = [...sorted].reverse();
        for (const task of reversed) {
            this.backwardPass(task, cptasks);
        }

        // Calculate slack and critical path
        for (const task of cptasks) {
            task.totalSlack = this.daysBetween(task.earlyStart, task.lateStart);
            task.isCritical = task.totalSlack === 0;
        }

        return cptasks;
    }

    private forwardPass(task: CriticalPathTask, all: CriticalPathTask[]): void {
        // Early start = max(predecessor early finish)
        let earlyStart = new Date(0);

        for (const pred of this.getPredecessors(task, all)) {
            if (pred.earlyFinish > earlyStart) {
                earlyStart = new Date(pred.earlyFinish);
            }
        }

        task.earlyStart = earlyStart;
        task.earlyFinish = this.addDays(earlyStart, task.duration);
    }

    private backwardPass(task: CriticalPathTask, all: CriticalPathTask[]): void {
        // Late finish = min(successor late start)
        const successors = this.getSuccessors(task, all);

        if (successors.length === 0) {
            // Laatste task: late finish = early finish
            task.lateFinish = task.earlyFinish;
        } else {
            let lateFinish = new Date(8640000000000000); // Max date

            for (const succ of successors) {
                if (succ.lateStart < lateFinish) {
                    lateFinish = new Date(succ.lateStart);
                }
            }

            task.lateFinish = lateFinish;
        }

        task.lateStart = this.subtractDays(task.lateFinish, task.duration);
    }
}
```

---

## 9. Performance Optimizations

### 9.1 Lazy Calculation

```javascript
// Bryntum gebruikt lazy evaluation
// Fields worden alleen berekend als ze gelezen worden

class LazyTask {
    private _endDateStale = true;
    private _endDateCached: Date;

    get endDate(): Date {
        if (this._endDateStale) {
            this._endDateCached = this.calculateEndDate();
            this._endDateStale = false;
        }
        return this._endDateCached;
    }

    set startDate(value: Date) {
        this._startDate = value;
        this.markStale('endDate');  // Mark, not calculate
    }

    private markStale(field: string): void {
        this[`_${field}Stale`] = true;
        // Propagate staleness to dependents
        this.dependents.forEach(d => d.markStale());
    }
}
```

### 9.2 Incremental Updates

```javascript
// Alleen ge-affected tasks herberekenen
class IncrementalScheduler {
    updateTask(taskId: string, changes: Partial<Task>): void {
        const task = this.tasks.get(taskId)!;

        // Apply changes
        Object.assign(task, changes);

        // Collect affected tasks (successors + their successors)
        const affected = this.collectAffected(task);

        // Re-schedule only affected tasks
        const sorted = this.topologicalSort(affected);
        for (const t of sorted) {
            this.scheduleTask(t);
        }
    }

    private collectAffected(task: Task): Task[] {
        const affected = new Set<Task>();
        const queue = [task];

        while (queue.length > 0) {
            const current = queue.shift()!;
            affected.add(current);

            // Add successors
            for (const succ of this.getSuccessors(current)) {
                if (!affected.has(succ)) {
                    queue.push(succ);
                }
            }
        }

        return Array.from(affected);
    }
}
```

---

## 10. Cross-References

| Document | Relevante Secties |
|----------|-------------------|
| [INTERNALS-CHRONOGRAPH](./INTERNALS-CHRONOGRAPH.md) | Graph engine details |
| [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) | Scheduling patterns |
| [DEEP-DIVE-DEPENDENCIES](./DEEP-DIVE-DEPENDENCIES.md) | Dependency handling |
| [OFFICIAL-GUIDES-SUMMARY](./OFFICIAL-GUIDES-SUMMARY.md) | Calendars |
| [INTERNALS-CONFLICTS](./INTERNALS-CONFLICTS.md) | Conflict resolution |

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
