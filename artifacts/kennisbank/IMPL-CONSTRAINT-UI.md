# IMPL: Constraint & Conflict Resolution UI

> **Implementation Guide** - Hoe Bryntum's constraint/conflict dialogs werken.

---

## Overzicht

Bryntum Gantt detecteert scheduling conflicten en biedt interactieve dialogen om deze op te lossen.

```
Conflict Types:
┌─────────────────────────────────────────────────────────────┐
│ 1. Scheduling Conflict   - Constraint vs dependency clash   │
│ 2. Cycle                 - Circular dependency detected     │
│ 3. Empty Calendar        - No working time available        │
│ 4. Invalid Dependency    - Self-referencing dependency      │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Constraint Types

### 1.1 Beschikbare Constraint Types

| Type | Beschrijving | Effect |
|------|--------------|--------|
| `muststarton` | Moet starten op datum | Hard constraint |
| `mustfinishon` | Moet eindigen op datum | Hard constraint |
| `startnoearlierthan` | Start niet eerder dan | Soft constraint |
| `startnolaterthan` | Start niet later dan | Soft constraint |
| `finishnoearlierthan` | Eindig niet eerder dan | Soft constraint |
| `finishnolaterthan` | Eindig niet later dan | Soft constraint |

### 1.2 Data Structuur

```json
{
    "id": 2,
    "name": "Task B",
    "duration": 3,
    "constraintType": "muststarton",
    "constraintDate": "2024-01-05"
}
```

### 1.3 Task Methods

```javascript
// Set constraint
await task.setConstraint('startnoearlierthan', new Date('2024-01-10'));

// Remove constraint
await task.setConstraint(null);

// Check constraint
const type = task.constraintType;      // 'startnoearlierthan'
const date = task.constraintDate;      // Date object
```

---

## 2. Project Conflict Settings

### 2.1 Basis Configuratie

```javascript
const project = new ProjectModel({
    // Automatisch constraints toevoegen aan taken zonder predecessors
    autoSetConstraints: true,

    // Display conflict resolution popup
    // (default: true via Gantt.displaySchedulingIssueResolutionPopup)
});
```

### 2.2 Postponed Conflicts

```javascript
const project = new ProjectModel({
    // Optie 1: Handmatig postponen via dialog
    allowPostponedConflicts: true,

    // Optie 2: Automatisch postponen (geen dialog)
    autoPostponeConflicts: true,

    // Fine-tune scheduling
    autoScheduleManualTasksOnSecondPass: false,
    ignoreConstraintsOnConflictDuringSecondPass: false
});
```

---

## 3. Conflict Events

### 3.1 Event Types

```javascript
project.on({
    // Dependency cycle detected
    cycle({ schedulingIssue, continueWithResolutionResult }) {
        const description = schedulingIssue.getDescription();
        const resolutions = schedulingIssue.getResolutions();

        // Show custom UI or apply resolution
        continueWithResolutionResult(EffectResolutionResult.Cancel);
    },

    // Constraint vs dependency conflict
    schedulingConflict({ schedulingIssue, continueWithResolutionResult }) {
        const description = schedulingIssue.getDescription();
        const intervals = schedulingIssue.intervals;
        const resolutions = schedulingIssue.getResolutions();

        // Apply first resolution
        resolutions[0].resolve();
        continueWithResolutionResult(EffectResolutionResult.Resume);
    },

    // Calendar has no working time
    emptyCalendar({ schedulingIssue, continueWithResolutionResult }) {
        const calendar = schedulingIssue.getCalendar();
        const resolutions = schedulingIssue.getResolutions();

        // Fix calendar or cancel
        continueWithResolutionResult(EffectResolutionResult.Cancel);
    }
});
```

### 3.2 EffectResolutionResult

```javascript
import { EffectResolutionResult } from '@bryntum/gantt';

// Options:
EffectResolutionResult.Resume  // Doorgaan met scheduling
EffectResolutionResult.Cancel  // Wijzigingen annuleren
```

---

## 4. Resolution Popups

### 4.1 SchedulingIssueResolutionPopup

```javascript
const gantt = new Gantt({
    // Display popup for conflicts (default: true)
    displaySchedulingIssueResolutionPopup: true,

    // Custom popup class
    schedulingIssueResolutionPopupClass: MyCustomResolutionPopup
});
```

### 4.2 CycleResolutionPopup

```javascript
const gantt = new Gantt({
    // Custom cycle resolution popup
    cycleResolutionPopupClass: MyCycleResolutionPopup
});
```

### 4.3 Popup Structuur

```javascript
// SchedulingIssueResolutionPopup extends Popup
class SchedulingIssueResolutionPopup extends Popup {
    // Shows:
    // - Conflict description
    // - List of possible resolutions
    // - Apply/Cancel buttons
}

// CycleResolutionPopup extends SchedulingIssueResolutionPopup
class CycleResolutionPopup extends SchedulingIssueResolutionPopup {
    // Shows:
    // - Cycle path (tasks and dependencies)
    // - Option to deactivate or remove dependency
}
```

---

## 5. TaskInfoColumn

### 5.1 Conflict Indicator

```javascript
const gantt = new Gantt({
    columns: [
        // Shows warning icon for postponed conflicts
        { type: 'info', width: 50 },
        { type: 'name', width: 200 },
        { type: 'constrainttype' },
        { type: 'constraintdate' }
    ]
});
```

### 5.2 Resolve Postponed Conflict

```javascript
// Taak met postponed conflict
const task = gantt.taskStore.getById(2);

if (task.postponedConflict) {
    // Start resolution dialog
    await task.resolvePostponedConflict();
}
```

---

## 6. Indicators Feature

### 6.1 Constraint Indicators

```javascript
const gantt = new Gantt({
    features: {
        indicators: {
            items: {
                // Built-in indicators
                constraintDate: true,   // Show constraint icon
                deadlineDate: false,    // Hide deadline icon
                earlyDates: false,      // Hide early start/finish
                lateDates: false        // Hide late start/finish
            }
        }
    }
});
```

### 6.2 Custom Indicators

```javascript
const gantt = new Gantt({
    features: {
        indicators: {
            items: {
                constraintDate: true,

                // Custom indicator
                conflictWarning: {
                    shouldRender({ taskRecord }) {
                        return taskRecord.postponedConflict != null;
                    },
                    getDate({ taskRecord }) {
                        return taskRecord.startDate;
                    },
                    cls: 'b-fa b-fa-exclamation-triangle',
                    tooltip: 'Has postponed conflict'
                }
            }
        }
    }
});
```

---

## 7. Triggering Conflicts (Demo)

### 7.1 Invalid Dependency

```javascript
// Self-referencing dependency
gantt.dependencyStore.add({
    fromTask: 11,
    toTask: 11
});
// Triggers: schedulingConflict event
```

### 7.2 Dependency Cycle

```javascript
// Task A → Task B already exists
// Adding Task B → Task A creates cycle
gantt.dependencyStore.add({
    fromTask: 15,
    toTask: 14
});
// Triggers: cycle event
```

### 7.3 Constraint Conflict

```javascript
// Task has MustStartOn constraint
// But predecessor pushes it later
const task = gantt.taskStore.getById(11);
task.startDate = new Date('2024-01-15');
// Triggers: schedulingConflict event
```

### 7.4 Empty Calendar

```javascript
// Calendar with no working time
const [calendar] = gantt.calendarManagerStore.add({
    name: 'Empty Calendar',
    unspecifiedTimeIsWorking: false
    // No working intervals defined!
});

gantt.taskStore.getById(11).calendar = calendar;
// Triggers: emptyCalendar event
```

---

## 8. Eigen Implementatie

### 8.1 Conflict Detection

```typescript
interface Constraint {
    type: ConstraintType;
    date: Date;
}

type ConstraintType =
    | 'muststarton'
    | 'mustfinishon'
    | 'startnoearlierthan'
    | 'startnolaterthan'
    | 'finishnoearlierthan'
    | 'finishnolaterthan';

interface ConflictResult {
    hasConflict: boolean;
    description: string;
    resolutions: Resolution[];
}

interface Resolution {
    description: string;
    resolve: () => void;
}

class ConstraintValidator {
    validateTask(task: Task): ConflictResult | null {
        if (!task.constraint) return null;

        const { type, date } = task.constraint;

        switch (type) {
            case 'muststarton':
                if (!this.datesEqual(task.startDate, date)) {
                    return {
                        hasConflict: true,
                        description: `Task must start on ${date} but starts on ${task.startDate}`,
                        resolutions: [
                            {
                                description: 'Move task to constraint date',
                                resolve: () => { task.startDate = date; }
                            },
                            {
                                description: 'Remove constraint',
                                resolve: () => { task.constraint = null; }
                            }
                        ]
                    };
                }
                break;

            case 'startnoearlierthan':
                if (task.startDate < date) {
                    return {
                        hasConflict: true,
                        description: `Task starts before allowed date`,
                        resolutions: [
                            {
                                description: 'Move task to constraint date',
                                resolve: () => { task.startDate = date; }
                            },
                            {
                                description: 'Remove constraint',
                                resolve: () => { task.constraint = null; }
                            }
                        ]
                    };
                }
                break;

            // ... other constraint types
        }

        return null;
    }

    private datesEqual(a: Date, b: Date): boolean {
        return a.getTime() === b.getTime();
    }
}
```

### 8.2 Cycle Detection

```typescript
class CycleDetector {
    private graph: Map<string, Set<string>> = new Map();

    addDependency(from: string, to: string): void {
        if (!this.graph.has(from)) {
            this.graph.set(from, new Set());
        }
        this.graph.get(from)!.add(to);
    }

    detectCycle(): string[] | null {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        const path: string[] = [];

        for (const node of this.graph.keys()) {
            const cycle = this.dfs(node, visited, recursionStack, path);
            if (cycle) return cycle;
        }

        return null;
    }

    private dfs(
        node: string,
        visited: Set<string>,
        recursionStack: Set<string>,
        path: string[]
    ): string[] | null {
        if (recursionStack.has(node)) {
            // Found cycle - extract cycle path
            const cycleStart = path.indexOf(node);
            return [...path.slice(cycleStart), node];
        }

        if (visited.has(node)) return null;

        visited.add(node);
        recursionStack.add(node);
        path.push(node);

        const neighbors = this.graph.get(node) || new Set();
        for (const neighbor of neighbors) {
            const cycle = this.dfs(neighbor, visited, recursionStack, path);
            if (cycle) return cycle;
        }

        path.pop();
        recursionStack.delete(node);

        return null;
    }
}
```

### 8.3 Resolution Dialog Component

```typescript
interface ResolutionDialogProps {
    conflict: ConflictResult;
    onResolve: (resolution: Resolution) => void;
    onCancel: () => void;
}

// React Component
function ConflictResolutionDialog({ conflict, onResolve, onCancel }: ResolutionDialogProps) {
    return (
        <div className="conflict-dialog">
            <div className="dialog-header">
                <h3>Scheduling Conflict</h3>
            </div>

            <div className="dialog-body">
                <p className="conflict-description">
                    {conflict.description}
                </p>

                <div className="resolutions">
                    <h4>Choose a resolution:</h4>
                    {conflict.resolutions.map((resolution, index) => (
                        <button
                            key={index}
                            className="resolution-option"
                            onClick={() => onResolve(resolution)}
                        >
                            {resolution.description}
                        </button>
                    ))}
                </div>
            </div>

            <div className="dialog-footer">
                <button onClick={onCancel}>Cancel Changes</button>
            </div>
        </div>
    );
}
```

### 8.4 Conflict Manager

```typescript
class ConflictManager {
    private validator = new ConstraintValidator();
    private cycleDetector = new CycleDetector();
    private postponedConflicts: Map<string, ConflictResult> = new Map();

    async validateAndResolve(
        task: Task,
        showDialog: (conflict: ConflictResult) => Promise<Resolution | null>
    ): Promise<boolean> {
        // Check for constraint conflict
        const conflict = this.validator.validateTask(task);

        if (!conflict) return true;

        // Show dialog and get user choice
        const resolution = await showDialog(conflict);

        if (resolution) {
            resolution.resolve();
            return true;
        }

        return false; // Cancelled
    }

    postponeConflict(taskId: string, conflict: ConflictResult): void {
        this.postponedConflicts.set(taskId, conflict);
    }

    hasPostponedConflict(taskId: string): boolean {
        return this.postponedConflicts.has(taskId);
    }

    async resolvePostponedConflict(
        taskId: string,
        showDialog: (conflict: ConflictResult) => Promise<Resolution | null>
    ): Promise<boolean> {
        const conflict = this.postponedConflicts.get(taskId);
        if (!conflict) return true;

        const resolution = await showDialog(conflict);

        if (resolution) {
            resolution.resolve();
            this.postponedConflicts.delete(taskId);
            return true;
        }

        return false;
    }
}
```

---

## 9. CSS Styling

```css
/* Conflict indicator in TaskInfoColumn */
.b-task-info-column .b-conflict-indicator {
    color: #e74c3c;
    cursor: pointer;
}

.b-task-info-column .b-conflict-indicator:hover {
    color: #c0392b;
}

/* Resolution popup */
.b-scheduling-issue-resolution-popup {
    min-width: 400px;
}

.b-scheduling-issue-resolution-popup .b-description {
    margin-bottom: 16px;
    padding: 12px;
    background: #fff3cd;
    border-radius: 4px;
}

.b-scheduling-issue-resolution-popup .b-resolutions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.b-scheduling-issue-resolution-popup .b-resolution-option {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
}

.b-scheduling-issue-resolution-popup .b-resolution-option:hover {
    background: #f0f0f0;
}

/* Cycle popup */
.b-cycle-resolution-popup .b-cycle-path {
    font-family: monospace;
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
}

.b-cycle-resolution-popup .b-cycle-arrow {
    color: #666;
    margin: 0 8px;
}
```

---

## 10. Cross-References

| Document | Relevante Secties |
|----------|-------------------|
| [IMPL-SCHEDULING-ENGINE](./IMPL-SCHEDULING-ENGINE.md) | Constraint handling |
| [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) | Scheduling logic |
| [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) | Popup widgets |
| [OFFICIAL-GUIDES-SUMMARY](./OFFICIAL-GUIDES-SUMMARY.md) | Calendar configuration |

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
