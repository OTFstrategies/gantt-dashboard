# Gantt Implementation: Task Copy/Paste

> **Task Copy/Paste** voor het kopiëren en plakken van taken met dependencies.

---

## Overzicht

Bryntum Gantt ondersteunt kopiëren en plakken van taken met hun structuur en relaties.

```
+--------------------------------------------------------------------------+
| GANTT                                        [Ctrl+C Copy] [Ctrl+V Paste]|
+--------------------------------------------------------------------------+
|  Name              | Start       |        Timeline                       |
+--------------------------------------------------------------------------+
|  Project Alpha     | Jan 15      |  ████████████████████████████████████ |
|    [Task A]        | Jan 15      |  ████████████                ← Copy   |
|    [Task B]        | Jan 22      |          ████████████████             |
|  Project Beta      | Feb 01      |                    ████████████████   |
|    Task A (Copy)   | Feb 01      |                    ████████████       |
|    Task B (Copy)   | Feb 08      |                         ████████████  |
+--------------------------------------------------------------------------+
|                                                                          |
|  COPY/PASTE FEATURES:                                                    |
|    - Copy single or multiple tasks                                       |
|    - Preserve task hierarchy                                             |
|    - Copy dependencies between tasks                                     |
|    - Generate new IDs                                                    |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Task Copy/Paste Setup

### 1.1 Enable Copy/Paste

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
        taskCopyPaste: true  // Enable task copy/paste
    },

    columns: [
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'duration' }
    ]
});
```

---

## 2. Advanced Configuration

### 2.1 Copy/Paste Options

```javascript
features: {
    taskCopyPaste: {
        // Generate new IDs for pasted tasks
        generateNewId: true,

        // Copy dependencies between pasted tasks
        copyDependencies: true,

        // Rename copied tasks
        nameField: 'name',
        copyNameSuffix: ' (Copy)',

        // Deep copy (include children)
        deep: true,

        // Process pasted tasks
        processPastedRecords(records) {
            return records.map(record => {
                // Modify pasted task
                return {
                    ...record.data,
                    name: `${record.name} (Copy)`,
                    percentDone: 0  // Reset progress
                };
            });
        }
    }
}
```

### 2.2 Custom Paste Behavior

```javascript
features: {
    taskCopyPaste: {
        // Validate paste location
        isValidPasteLocation({ targetTask, copiedTasks }) {
            // Don't allow paste inside copied tasks
            if (copiedTasks.includes(targetTask)) {
                return false;
            }

            // Don't paste under leaf tasks
            if (targetTask && targetTask.isLeaf) {
                return false;
            }

            return true;
        },

        // Adjust dates after paste
        adjustDates({ pastedTasks, targetTask }) {
            if (targetTask) {
                const targetStart = targetTask.startDate;
                pastedTasks.forEach(task => {
                    // Shift dates relative to target
                    const offset = targetStart - task.startDate;
                    task.startDate = new Date(task.startDate.getTime() + offset);
                });
            }
        }
    }
}
```

---

## 3. Programmatic Control

### 3.1 Copy and Paste Methods

```javascript
const copyPaste = gantt.features.taskCopyPaste;

// Copy selected tasks
function copySelection() {
    const selected = gantt.selectedRecords;
    if (selected.length > 0) {
        copyPaste.copyTasks(selected);
        console.log('Copied', selected.length, 'tasks');
    }
}

// Cut selected tasks
function cutSelection() {
    const selected = gantt.selectedRecords;
    if (selected.length > 0) {
        copyPaste.cutTasks(selected);
        console.log('Cut', selected.length, 'tasks');
    }
}

// Paste at target
function pasteAtTarget(targetTask) {
    const pasted = copyPaste.pasteTasks(targetTask);
    console.log('Pasted', pasted.length, 'tasks');
    return pasted;
}

// Paste at root
function pasteAtRoot() {
    return copyPaste.pasteTasks(null);
}

// Get clipboard content
function getClipboard() {
    return copyPaste.clipboard;
}

// Clear clipboard
function clearClipboard() {
    copyPaste.clear();
}
```

### 3.2 Event Handling

```javascript
gantt.on({
    beforeTaskCopy({ tasks }) {
        console.log('Copying tasks:', tasks.map(t => t.name));
        // Return false to prevent copy
        return true;
    },

    taskCopy({ tasks }) {
        console.log('Tasks copied:', tasks.length);
    },

    beforeTaskCut({ tasks }) {
        console.log('Cutting tasks:', tasks.map(t => t.name));
        return true;
    },

    taskCut({ tasks }) {
        console.log('Tasks cut:', tasks.length);
    },

    beforeTaskPaste({ tasks, targetTask }) {
        console.log('Pasting', tasks.length, 'tasks');
        console.log('Target:', targetTask?.name || 'root');
        return true;
    },

    taskPaste({ tasks }) {
        console.log('Tasks pasted:', tasks.map(t => t.name));
    }
});
```

---

## 4. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useRef, useMemo, useCallback, useState } from 'react';

function CopyPasteGantt({ projectData }) {
    const ganttRef = useRef(null);
    const [clipboardCount, setClipboardCount] = useState(0);

    const handleCopy = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        const selected = gantt.selectedRecords;
        if (selected.length > 0) {
            gantt.features.taskCopyPaste.copyTasks(selected);
            setClipboardCount(selected.length);
        }
    }, []);

    const handleCut = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        const selected = gantt.selectedRecords;
        if (selected.length > 0) {
            gantt.features.taskCopyPaste.cutTasks(selected);
            setClipboardCount(selected.length);
        }
    }, []);

    const handlePaste = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        const target = gantt.selectedRecord;
        const pasted = gantt.features.taskCopyPaste.pasteTasks(target);

        if (pasted.length > 0) {
            // Select pasted tasks
            gantt.selectedRecords = pasted;
        }
    }, []);

    const handleDuplicate = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        const selected = gantt.selectedRecords;
        if (selected.length > 0) {
            // Copy and immediately paste
            gantt.features.taskCopyPaste.copyTasks(selected);

            // Paste after selected task's parent
            const parent = selected[0].parent;
            gantt.features.taskCopyPaste.pasteTasks(parent);
        }
    }, []);

    const ganttConfig = useMemo(() => ({
        features: {
            taskCopyPaste: {
                generateNewId: true,
                copyDependencies: true,
                copyNameSuffix: ' (Copy)',

                processPastedRecords(records) {
                    return records.map(record => ({
                        ...record.data,
                        percentDone: 0
                    }));
                }
            }
        },

        columns: [
            { type: 'wbs', width: 60 },
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'enddate' },
            { type: 'duration' }
        ],

        selectionMode: {
            row: true,
            multiSelect: true
        },

        listeners: {
            taskCopy({ tasks }) {
                setClipboardCount(tasks.length);
            },
            taskCut({ tasks }) {
                setClipboardCount(tasks.length);
            },
            taskPaste() {
                // Keep clipboard after paste
            }
        }
    }), []);

    return (
        <div className="copy-paste-gantt">
            <div className="toolbar">
                <button onClick={handleCopy} title="Ctrl+C">
                    <i className="fa fa-copy"></i> Copy
                </button>
                <button onClick={handleCut} title="Ctrl+X">
                    <i className="fa fa-cut"></i> Cut
                </button>
                <button onClick={handlePaste} disabled={clipboardCount === 0} title="Ctrl+V">
                    <i className="fa fa-paste"></i> Paste
                </button>
                <button onClick={handleDuplicate}>
                    <i className="fa fa-clone"></i> Duplicate
                </button>

                {clipboardCount > 0 && (
                    <span className="clipboard-info">
                        {clipboardCount} task(s) in clipboard
                    </span>
                )}
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

## 5. Styling

```css
/* Cut task indicator */
.b-gantt-task.b-cut {
    opacity: 0.5;
}

.b-gantt-task.b-cut .b-gantt-task-bar {
    border: 2px dashed #ff9800 !important;
}

/* Paste target indicator */
.b-gantt-task.b-paste-target .b-gantt-task-bar {
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.5);
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
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid #e0e0e0;
    background: white;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
}

.toolbar button:hover:not(:disabled) {
    background: #e3f2fd;
    border-color: #2196F3;
}

.toolbar button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.clipboard-info {
    margin-left: auto;
    padding: 6px 12px;
    background: #e8f5e9;
    color: #2e7d32;
    border-radius: 4px;
    font-size: 13px;
}

/* Pasted task highlight */
.b-gantt-task.b-just-pasted .b-gantt-task-bar {
    animation: paste-highlight 1s ease-out;
}

@keyframes paste-highlight {
    0% {
        box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.6);
    }
    100% {
        box-shadow: none;
    }
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Paste werkt niet | Clipboard leeg | Kopieer eerst taken |
| Dependencies missen | copyDependencies: false | Enable copyDependencies |
| Dubbele IDs | generateNewId: false | Enable generateNewId |
| Keyboard werkt niet | Focus niet op Gantt | Klik eerst op Gantt |

---

## API Reference

### Task Copy/Paste Config

| Property | Type | Description |
|----------|------|-------------|
| `generateNewId` | Boolean | Generate new IDs |
| `copyDependencies` | Boolean | Copy dependencies |
| `copyNameSuffix` | String | Suffix for copied names |
| `deep` | Boolean | Include children |
| `processPastedRecords` | Function | Process pasted data |

### Methods

| Method | Description |
|--------|-------------|
| `copyTasks(tasks)` | Copy tasks to clipboard |
| `cutTasks(tasks)` | Cut tasks to clipboard |
| `pasteTasks(target)` | Paste from clipboard |
| `clear()` | Clear clipboard |

### Events

| Event | Description |
|-------|-------------|
| `beforeTaskCopy` | Before copying |
| `taskCopy` | After copying |
| `beforeTaskCut` | Before cutting |
| `taskCut` | After cutting |
| `beforeTaskPaste` | Before pasting |
| `taskPaste` | After pasting |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+C` | Copy selected |
| `Ctrl+X` | Cut selected |
| `Ctrl+V` | Paste at selection |

---

## Bronnen

- **Feature**: `Gantt.feature.TaskCopyPaste`

---

*Priority 2: Medium Priority Features*
