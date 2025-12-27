# Gantt Implementation: Highlighting

> **Highlighting** voor het markeren van taken, tijdsperiodes en kritieke elementen.

---

## Overzicht

Bryntum Gantt ondersteunt diverse highlighting opties voor visuele nadruk.

```
+--------------------------------------------------------------------------+
| GANTT                                         [Highlight: Critical Path] |
+--------------------------------------------------------------------------+
|  Name              | Start       |        Timeline                       |
+--------------------------------------------------------------------------+
|  Project Alpha     | Jan 15      |  ████████████████████████████████████ |
|    Task A          | Jan 15      |  ████████████    ← Critical (red)     |
|    Task B          | Jan 20      |      ████████████████                 |
|    Task C          | Jan 28      |               ████████████ ← Critical |
|                    |             |              ↓                        |
|                    |             |     Today line highlighted            |
+--------------------------------------------------------------------------+
|                                                                          |
|  HIGHLIGHTING FEATURES:                                                  |
|    - Critical path highlighting                                          |
|    - Today line / Current date                                           |
|    - Selected time ranges                                                |
|    - Task hover effects                                                  |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Highlighting Setup

### 1.1 Enable Highlighting Features

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    transport: {
        load: { url: 'data/tasks.json' }
    }
});

const gantt = new Gantt({
    appendTo: 'container',
    project,

    features: {
        // Critical path highlighting
        criticalPaths: {
            highlight: true
        },

        // Task highlighting on hover/selection
        taskHighlighting: true,

        // Non-working time
        nonWorkingTime: true
    },

    columns: [
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'duration' }
    ]
});
```

---

## 2. Critical Path Highlighting

### 2.1 Configure Critical Path

```javascript
features: {
    criticalPaths: {
        // Enable highlighting
        highlight: true,

        // Custom styling
        cls: 'b-critical-task'
    }
}

// Toggle critical path highlighting
function toggleCriticalPath() {
    const feature = gantt.features.criticalPaths;
    feature.disabled = !feature.disabled;
}
```

### 2.2 Custom Critical Path Styling

```css
/* Critical task bar */
.b-gantt-task.b-critical .b-gantt-task-bar {
    background: #f44336 !important;
    border-color: #c62828 !important;
}

/* Critical dependency line */
.b-sch-dependency.b-critical {
    stroke: #f44336 !important;
    stroke-width: 2px;
}

/* Critical milestone */
.b-gantt-task.b-critical.b-milestone .b-gantt-task-bar {
    background: #f44336 !important;
}
```

---

## 3. Time Highlighting

### 3.1 Today Line

```javascript
const gantt = new Gantt({
    appendTo: 'container',
    project,

    // Current time indicator
    features: {
        timeRanges: {
            showCurrentTimeLine: true,
            currentTimeLineUpdateInterval: 60000  // Update every minute
        }
    }
});
```

### 3.2 Highlight Time Spans

```javascript
const gantt = new Gantt({
    appendTo: 'container',
    project,

    features: {
        timeRanges: true
    }
});

// Add highlighted time range
function highlightTimeRange(startDate, endDate, name, cls) {
    gantt.timeRangeStore.add({
        startDate,
        endDate,
        name,
        cls: cls || 'highlighted-range'
    });
}

// Example: Highlight deadline
highlightTimeRange(
    new Date('2024-02-15'),
    new Date('2024-02-16'),
    'Deadline',
    'deadline-highlight'
);

// Remove highlight
function removeHighlight(id) {
    gantt.timeRangeStore.remove(id);
}
```

---

## 4. Task Highlighting

### 4.1 Programmatic Task Highlighting

```javascript
// Highlight specific task
function highlightTask(taskId, cls = 'highlighted') {
    const task = gantt.taskStore.getById(taskId);
    if (task) {
        task.cls = cls;
        gantt.refreshRows();
    }
}

// Highlight multiple tasks
function highlightTasks(filter, cls = 'highlighted') {
    gantt.taskStore.query(filter).forEach(task => {
        task.cls = cls;
    });
    gantt.refreshRows();
}

// Example: Highlight overdue tasks
function highlightOverdue() {
    const today = new Date();
    highlightTasks(
        task => task.endDate < today && task.percentDone < 100,
        'overdue-task'
    );
}

// Clear highlights
function clearHighlights() {
    gantt.taskStore.forEach(task => {
        task.cls = '';
    });
    gantt.refreshRows();
}
```

### 4.2 Hover Highlighting

```javascript
gantt.on({
    taskMouseEnter({ taskRecord }) {
        // Highlight related tasks
        const dependencies = gantt.dependencyStore.getDependencies(taskRecord);
        dependencies.forEach(dep => {
            const related = dep.from === taskRecord ? dep.to : dep.from;
            related.cls = 'related-highlight';
        });
        gantt.refreshRows();
    },

    taskMouseLeave({ taskRecord }) {
        // Clear highlights
        gantt.taskStore.forEach(task => {
            if (task.cls === 'related-highlight') {
                task.cls = '';
            }
        });
        gantt.refreshRows();
    }
});
```

---

## 5. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useRef, useMemo, useCallback, useState } from 'react';

function HighlightingGantt({ projectData }) {
    const ganttRef = useRef(null);
    const [highlightMode, setHighlightMode] = useState('none');

    const highlightCritical = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        gantt.features.criticalPaths.disabled = false;
        setHighlightMode('critical');
    }, []);

    const highlightOverdue = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        const today = new Date();
        gantt.taskStore.forEach(task => {
            if (task.endDate < today && task.percentDone < 100) {
                task.cls = 'overdue-highlight';
            } else {
                task.cls = '';
            }
        });
        gantt.refreshRows();
        setHighlightMode('overdue');
    }, []);

    const highlightMilestones = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        gantt.taskStore.forEach(task => {
            if (task.isMilestone) {
                task.cls = 'milestone-highlight';
            } else {
                task.cls = '';
            }
        });
        gantt.refreshRows();
        setHighlightMode('milestones');
    }, []);

    const clearHighlights = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        gantt.features.criticalPaths.disabled = true;
        gantt.taskStore.forEach(task => {
            task.cls = '';
        });
        gantt.refreshRows();
        setHighlightMode('none');
    }, []);

    const ganttConfig = useMemo(() => ({
        features: {
            criticalPaths: {
                disabled: true
            },
            timeRanges: {
                showCurrentTimeLine: true
            },
            nonWorkingTime: true
        },

        columns: [
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'duration' },
            { type: 'percentdone', width: 100 }
        ]
    }), []);

    return (
        <div className="highlighting-gantt">
            <div className="toolbar">
                <span>Highlight:</span>
                <button
                    className={highlightMode === 'critical' ? 'active' : ''}
                    onClick={highlightCritical}
                >
                    Critical Path
                </button>
                <button
                    className={highlightMode === 'overdue' ? 'active' : ''}
                    onClick={highlightOverdue}
                >
                    Overdue Tasks
                </button>
                <button
                    className={highlightMode === 'milestones' ? 'active' : ''}
                    onClick={highlightMilestones}
                >
                    Milestones
                </button>
                <button onClick={clearHighlights}>
                    Clear
                </button>
            </div>

            <BryntumGantt
                ref={ganttRef}
                project={projectData}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 6. Styling

```css
/* Critical path */
.b-gantt-task.b-critical .b-gantt-task-bar {
    background: linear-gradient(to bottom, #ef5350, #c62828) !important;
    border: 1px solid #b71c1c !important;
    box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.3);
}

/* Overdue highlight */
.b-gantt-task.overdue-highlight .b-gantt-task-bar {
    background: #ff9800 !important;
    border: 2px dashed #e65100 !important;
}

.b-gantt-task.overdue-highlight .b-gantt-task-content {
    color: #fff;
    font-weight: bold;
}

/* Milestone highlight */
.b-gantt-task.milestone-highlight .b-gantt-task-bar {
    background: #9c27b0 !important;
    box-shadow: 0 0 8px rgba(156, 39, 176, 0.5);
}

/* Related task highlight (on hover) */
.b-gantt-task.related-highlight .b-gantt-task-bar {
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.5);
}

/* Today line */
.b-sch-current-time {
    border-left: 2px solid #f44336 !important;
}

.b-sch-current-time::before {
    content: 'Today';
    position: absolute;
    top: 4px;
    left: 4px;
    padding: 2px 8px;
    background: #f44336;
    color: white;
    font-size: 11px;
    border-radius: 3px;
}

/* Time range highlight */
.highlighted-range {
    background: rgba(33, 150, 243, 0.1) !important;
    border-left: 3px solid #2196F3;
}

.deadline-highlight {
    background: rgba(244, 67, 54, 0.15) !important;
    border-left: 3px solid #f44336;
}

/* Toolbar */
.toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.toolbar button {
    padding: 8px 16px;
    border: 1px solid #e0e0e0;
    background: white;
    cursor: pointer;
    border-radius: 4px;
}

.toolbar button.active {
    background: #1976d2;
    color: white;
    border-color: #1976d2;
}

.toolbar button:hover:not(.active) {
    background: #f0f0f0;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Critical path niet zichtbaar | Feature disabled | Enable criticalPaths |
| Highlighting verdwijnt | refreshRows niet aangeroepen | Roep refreshRows aan |
| Stijl niet toegepast | CSS specificity te laag | Gebruik !important |
| Today line mist | timeRanges niet enabled | Enable timeRanges feature |

---

## API Reference

### Critical Paths Config

| Property | Type | Description |
|----------|------|-------------|
| `highlight` | Boolean | Enable highlighting |
| `disabled` | Boolean | Disable feature |
| `cls` | String | CSS class for critical tasks |

### Time Ranges Config

| Property | Type | Description |
|----------|------|-------------|
| `showCurrentTimeLine` | Boolean | Show today line |
| `currentTimeLineUpdateInterval` | Number | Update interval (ms) |

### Task Properties

| Property | Type | Description |
|----------|------|-------------|
| `cls` | String | CSS class for task |
| `critical` | Boolean | Is on critical path |

### Methods

| Method | Description |
|--------|-------------|
| `refreshRows()` | Refresh task rendering |
| `taskStore.query(fn)` | Find tasks by filter |

---

## Bronnen

- **Critical Paths**: `Gantt.feature.CriticalPaths`
- **Time Ranges**: `Scheduler.feature.TimeRanges`

---

*Priority 2: Medium Priority Features*
