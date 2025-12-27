# Gantt Implementation: Undo/Redo

> **Undo/Redo** voor het ongedaan maken en opnieuw toepassen van wijzigingen.

---

## Overzicht

Bryntum Gantt's State Tracking Manager (STM) biedt volledige undo/redo functionaliteit.

```
+--------------------------------------------------------------------------+
| GANTT VIEW                                       [Undo] [Redo] [v]       |
+--------------------------------------------------------------------------+
|  WBS  |  Name              | Start    | Duration | Predecessors          |
+--------------------------------------------------------------------------+
|  1    |  Project Setup     | Jan 15   | 5 days   |                       |
|  1.1  |  Planning          | Jan 15   | 3 days   |                       |
|  1.2  |  Design            | Jan 18   | 2 days   | 1.1                   |
|  2    |  Development       | Jan 20   | 10 days  | 1.2                   |
|                                                                          |
+========================+                                                 |
| ACTIONS VIEW          |                                                  |
+========================+                                                 |
| #  | Action              | Changes                                       |
+----+---------------------+---------------------------------------------+
| 0  | Initial state       |                                              |
| 1  | Edit task Planning  | {"duration": 3}                             |
|    |  └ Update project   | {"startDate": "2024-01-15"}                  |
| 2  | Add task Design     |                                              |
|    |  └ Insert task...   | at 1 position                                |
| 3  | Link 1.1 -> 1.2     |                                              |
+----+---------------------+---------------------------------------------+
|                                                                          |
|  UNDO/REDO:                                                              |
|    [Undo] = Go back one transaction                                      |
|    [Redo] = Go forward one transaction                                   |
|    Click on action row to jump to that state                             |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Undo/Redo Setup

### 1.1 Enable State Tracking

```javascript
import { Gantt, ProjectModel, Container, TreeGrid, Collection, StringHelper, TaskModel, DependencyModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    loadUrl: '../_datasets/launch-saas.json',
    autoLoad: true,

    // State Tracking Manager configuration
    stm: {
        // Enable auto-recording of changes
        // Note: This does not enable STM itself, that's done by undoredo widget
        autoRecord: true
    },

    validateResponse: true
});

const { stm, taskStore } = project;
```

### 1.2 Gantt with UndoRedo Widget

```javascript
new Container({
    appendTo: 'container',
    layout: 'hbox',
    flex: 1,
    items: {
        gantt: {
            type: 'gantt',
            enableUndoRedoKeys: true,  // Ctrl+Z / Ctrl+Y
            flex: 3,
            dependencyIdField: 'wbsCode',
            project,

            columns: [
                { type: 'wbs' },
                { type: 'name', field: 'name', text: 'Name', width: 250 },
                { type: 'startdate', text: 'Start date' },
                { type: 'duration', text: 'Duration' },
                { type: 'predecessor', text: 'Predecessors', width: 112 },
                { type: 'successor', text: 'Successors', width: 112 },
                { type: 'addnew' }
            ],

            subGridConfigs: {
                locked: { width: 420 }
            },

            loadMask: 'Loading tasks...',

            tbar: [
                'Gantt view',
                '->',
                {
                    ref: 'undoredoTool',
                    type: 'undoredo',
                    text: true,
                    items: {
                        transactionsCombo: null  // Hide transactions dropdown
                    }
                }
            ]
        }
    }
});
```

---

## 2. Custom Actions Grid

### 2.1 ActionsCollection Class

```javascript
// Collection that allows only single top-level item selection
class ActionsCollection extends Collection {
    splice(index = 0, toRemove = [], toAdd = []) {
        const me = this;
        const lengthAfter = me.count - (Array.isArray(toRemove) ? toRemove.length : toRemove) + toAdd.length;

        // Collection must always have 1 action selected
        if (lengthAfter === 1) {
            if (toAdd.length === 0 || (toAdd.length === 1 && (toAdd[0].id === -1 || toAdd[0].isParent))) {
                super.splice(index, toRemove, ...toAdd);
            }
        }
    }
}
```

### 2.2 ActionsGrid Class

```javascript
class ActionsGrid extends TreeGrid {
    static $name = 'ActionsGrid';
    static type = 'actionsgrid';

    static get configurable() {
        return {
            stm: null,
            readOnly: true,
            features: { cellEdit: false },
            recordCollection: new ActionsCollection(),

            store: {
                fields: ['idx', 'title', 'changes'],
                data: [{
                    id: -1,
                    idx: 0,
                    title: 'Initial state',
                    changes: ''
                }]
            },

            columns: [
                { text: '#', field: 'idx', width: '1em', sortable: false },
                { text: 'Action', field: 'title', flex: 0.4, type: 'tree', sortable: false },
                { text: 'Changes', field: 'changes', flex: 0.6, sortable: false }
            ]
        };
    }

    // Navigate to selected transaction
    onSelectionChange() {
        const { stm } = this;
        const action = this.selectedRecord;

        if (action && action.parent.isRoot) {
            const idx = action.idx;

            if (stm.position < idx) {
                stm.redo(idx - stm.position);
            }
            else if (stm.position > idx) {
                stm.undo(stm.position - idx);
            }
        }
    }

    updateStm(stm) {
        stm.on({
            recordingStop: 'onRecordingStop',
            restoringStop: 'onRestoringStop',
            thisObj: this
        });
    }

    onRecordingStop({ stm, transaction, reason }) {
        if (reason.rejected) return;

        const actionStore = this.store;
        const toRemove = actionStore.rootNode.children.slice(stm.position);

        const action = actionStore.rootNode.insertChild({
            idx: stm.position,
            title: transaction.title,
            changes: transaction.length > 1 ? `${transaction.length} steps` : `${transaction.length} step`,
            expanded: false,
            children: transaction.queue.map((action, idx) => {
                let { type, parentModel, model, modelList, newData } = action;
                let title = '', changes = '';

                if (!model) {
                    model = parentModel || modelList[modelList.length - 1];
                }

                if (type === 'UpdateAction' && model instanceof ProjectModel) {
                    title = 'Update project';
                    changes = StringHelper.safeJsonStringify(newData);
                }
                else if (type === 'EventUpdateAction') {
                    title = 'Edit task ' + model.name;
                    changes = StringHelper.safeJsonStringify(newData);
                }
                else if (type === 'AddAction' && model instanceof TaskModel) {
                    title = 'Add task ' + model.name;
                }
                else if (type === 'RemoveAction' && model instanceof TaskModel) {
                    title = 'Remove task ' + model.name;
                }
                else if (type === 'UpdateAction' && model instanceof DependencyModel) {
                    if (model.fromEvent && model.toEvent) {
                        title = `Edit link ${model.fromEvent.name} -> ${model.toEvent.name}`;
                    }
                    changes = StringHelper.safeJsonStringify(newData);
                }
                else if (type === 'AddAction' && model instanceof DependencyModel) {
                    title = `Link ${model.fromEvent?.name} -> ${model.toEvent?.name}`;
                }
                else if (type === 'RemoveAction' && model instanceof DependencyModel) {
                    title = 'Unlink tasks';
                }
                else if (type === 'InsertChildAction') {
                    title = `Insert task ${model.name} at ${action.insertIndex} position`;
                }

                return { idx: `${stm.position}.${idx + 1}`, title, changes };
            })
        }, toRemove[0]);

        this.selectedRecord = action;

        if (toRemove.length) {
            actionStore.rootNode.removeChild(toRemove);
        }
    }

    onRestoringStop({ stm }) {
        const action = this.store.rootNode.children[stm.position];
        this.selectedRecord = action;
    }
}

ActionsGrid.initClass();
```

---

## 3. Feature Configuration

### 3.1 STM Configuration

```javascript
project: {
    stm: {
        // Auto-record changes into transactions
        autoRecord: true,

        // Transaction title generator
        getTransactionTitle(transaction) {
            return transaction.title || 'User action';
        }
    }
}
```

### 3.2 Programmatic Control

```javascript
// Get STM instance
const { stm } = gantt.project;

// Enable STM (if not using undoredo widget)
stm.enable();

// Start recording a transaction manually
stm.startTransaction('My custom action');

// Make changes...
task.name = 'New Name';
task.duration = 5;

// Stop recording
stm.stopTransaction();

// Undo last transaction
stm.undo();

// Undo multiple transactions
stm.undo(3);

// Redo
stm.redo();

// Redo multiple
stm.redo(2);

// Check position
console.log('Current position:', stm.position);
console.log('Can undo:', stm.canUndo);
console.log('Can redo:', stm.canRedo);
```

---

## 4. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useRef, useCallback, useState, useEffect } from 'react';

function GanttWithUndoRedo({ projectData }) {
    const ganttRef = useRef(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [position, setPosition] = useState(0);

    useEffect(() => {
        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        const { stm } = gantt.project;

        const updateState = () => {
            setCanUndo(stm.canUndo);
            setCanRedo(stm.canRedo);
            setPosition(stm.position);
        };

        stm.on({
            recordingStop: updateState,
            restoringStop: updateState
        });

        return () => stm.un('recordingStop', updateState);
    }, []);

    const handleUndo = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        gantt?.project.stm.undo();
    }, []);

    const handleRedo = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        gantt?.project.stm.redo();
    }, []);

    const ganttConfig = {
        enableUndoRedoKeys: true,

        columns: [
            { type: 'wbs' },
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'duration' },
            { type: 'predecessor', width: 120 },
            { type: 'successor', width: 120 }
        ]
    };

    const projectConfig = {
        stm: {
            autoRecord: true
        }
    };

    return (
        <div className="gantt-undoredo-wrapper">
            <div className="toolbar">
                <button onClick={handleUndo} disabled={!canUndo}>
                    Undo
                </button>
                <button onClick={handleRedo} disabled={!canRedo}>
                    Redo
                </button>
                <span className="position-info">
                    Position: {position}
                </span>
            </div>

            <BryntumGantt
                ref={ganttRef}
                project={{ ...projectData, ...projectConfig }}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 5. Styling

```css
/* Undo/Redo widget */
.b-undoredo {
    display: flex;
    gap: 4px;
}

.b-undoredo .b-button {
    padding: 4px 12px;
}

.b-undoredo .b-button:disabled {
    opacity: 0.5;
}

/* Actions grid */
.actionsgrid .b-tree-cell {
    padding-left: 8px;
}

.actionsgrid .b-grid-row.b-selected {
    background: #e3f2fd;
}

/* Changes column */
.actionsgrid .b-grid-cell:last-child {
    font-family: monospace;
    font-size: 11px;
    color: #666;
}

/* Transaction row */
.actionsgrid .b-grid-row.b-parent {
    font-weight: bold;
}

/* Child action row */
.actionsgrid .b-grid-row:not(.b-parent) {
    font-size: 12px;
    color: #555;
}

/* Position indicator */
.position-info {
    padding: 4px 12px;
    background: #e3f2fd;
    border-radius: 4px;
    font-size: 14px;
}

/* Keyboard shortcut hints */
.b-undoredo .b-button::after {
    content: attr(data-shortcut);
    font-size: 10px;
    opacity: 0.7;
    margin-left: 4px;
}

.b-undoredo .b-undo-button::after {
    content: 'Ctrl+Z';
}

.b-undoredo .b-redo-button::after {
    content: 'Ctrl+Y';
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Undo werkt niet | STM niet enabled | Enable STM of gebruik undoredo widget |
| Transactions leeg | autoRecord: false | Zet autoRecord: true |
| Keyboard shortcuts | enableUndoRedoKeys: false | Zet enableUndoRedoKeys: true |
| Position niet bijgewerkt | Events niet gelistend | Voeg recordingStop listener toe |

---

## API Reference

### STM Configuration

| Property | Type | Description |
|----------|------|-------------|
| `autoRecord` | Boolean | Auto-record changes |
| `disabled` | Boolean | Disable STM |

### STM Methods

| Method | Description |
|--------|-------------|
| `enable()` | Enable STM |
| `disable()` | Disable STM |
| `undo(steps)` | Undo transactions |
| `redo(steps)` | Redo transactions |
| `startTransaction(title)` | Start manual transaction |
| `stopTransaction()` | Stop recording |
| `rejectTransaction()` | Reject current transaction |

### STM Properties

| Property | Type | Description |
|----------|------|-------------|
| `position` | Number | Current position |
| `canUndo` | Boolean | Can undo |
| `canRedo` | Boolean | Can redo |
| `length` | Number | Total transactions |

### STM Events

| Event | Description |
|-------|-------------|
| `recordingStart` | Transaction started |
| `recordingStop` | Transaction completed |
| `restoringStart` | Undo/redo started |
| `restoringStop` | Undo/redo completed |

---

## Bronnen

- **Example**: `examples/undoredo/`
- **StateTrackingManager**: `Core.data.stm.StateTrackingManager`
- **UndoRedo Widget**: `Core.widget.UndoRedo`

---

*Priority 2: Medium Priority Features*
