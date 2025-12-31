# Gantt Implementation: Dependencies & Undo/Redo

> **Dependency management** met terminals, custom markers, delete dialogs, en undo/redo functionaliteit met StateTrackingManager.

---

## Overzicht

Bryntum Gantt biedt uitgebreide dependency management met visuele terminals, edit dialogs, en complete undo/redo ondersteuning.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GANTT                                                [Undo] [Redo]       │
├──────────────────────────────────────────────────────────────────────────┤
│  #  │ Task Name    │ Predecessors │ Successors │                        │
│  1  │ Planning     │              │ 2          │ ████●───┐              │
│  2  │ Design       │ 1            │ 3, 4       │         └──>████●───┐  │
│  3  │ Development  │ 2            │ 5          │                     │  │
│  4  │ Testing      │ 2            │ 5          │              ┌──────┘  │
│  5  │ Deployment   │ 3, 4         │            │              └──>████  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  DEPENDENCY TERMINALS                        MARKER TYPES                │
│  ┌─────────────────┐                        ┌───────────────────┐       │
│  │    ████████●────┼──> Arrow              │ Default: ▶        │       │
│  │ ●──────────●    │                        │ Thin:    >        │       │
│  │ Left/Right      │                        │ Circle:  ●        │       │
│  │ terminals       │                        └───────────────────┘       │
│  └─────────────────┘                                                    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Dependencies Feature Setup

### 1.1 Basic Configuration

```javascript
import { Gantt } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',
    dependencyIdField: 'sequenceNumber',
    rowHeight: 30,
    tickSize: 45,
    barMargin: 6,

    features: {
        dependencies: {
            // Disable default tooltip
            showTooltip: false,

            // Make lines easier to click (width in px)
            clickWidth: 5,

            // Round corners of dependency lines
            radius: 10,

            // Terminal offset from task bar edge
            // (negative = further out, positive = inside)
            terminalOffset: 0,

            // Size of terminals in px
            terminalSize: 12,

            // Delay before showing terminals (ms)
            terminalShowDelay: 100,

            // Delay before hiding terminals (ms)
            terminalHideDelay: 300
        },

        dependencyEdit: {
            // Disable click-to-edit (use custom dialog)
            triggerEvent: null
        }
    },

    columns: [
        { type: 'sequence', text: '#' },
        { type: 'name', width: 250 },
        { type: 'predecessor', width: 112 },
        { type: 'successor', width: 112 }
    ],

    project: {
        autoSetConstraints: true,
        autoLoad: true,
        loadUrl: '/api/project'
    }
});
```

### 1.2 Dynamic Configuration

```javascript
tbar: [
    {
        type: 'button',
        text: 'Line settings',
        menu: {
            items: {
                radius: {
                    type: 'slider',
                    min: 0,
                    max: 10,
                    value: 10,
                    showValue: 'thumb',
                    text: 'Radius',
                    onInput({ value }) {
                        gantt.features.dependencies.radius = value;
                    }
                },
                clickWidth: {
                    type: 'slider',
                    min: 1,
                    max: 10,
                    value: 5,
                    showValue: 'thumb',
                    text: 'Click width',
                    onInput({ value }) {
                        gantt.features.dependencies.clickWidth = value;

                        // Visual feedback
                        DomHelper.addTemporaryClass(
                            gantt.element,
                            'b-highlight-click-area',
                            1000
                        );
                    }
                }
            }
        }
    },
    {
        type: 'slidetoggle',
        text: 'Show hover tooltip',
        onChange({ checked }) {
            gantt.features.dependencies.showTooltip = checked;
        }
    }
]
```

---

## 2. Custom Dependency Markers

### 2.1 Marker Button Group

```javascript
tbar: [
    { type: 'label', text: 'Marker' },
    {
        type: 'buttongroup',
        rendition: 'padded',
        toggleGroup: true,
        items: [
            {
                text: 'Default',
                pressed: true,
                markerDef: null  // Use default arrow
            },
            {
                text: 'Thin',
                // SVG path for thin arrow
                markerDef: 'M3,0 L8,3 L3,6'
            },
            {
                text: 'Circle',
                // SVG path for circle marker
                markerDef: 'M2,3 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0'
            }
        ],
        onToggle({ source }) {
            if (source.pressed) {
                gantt.features.dependencies.markerDef = source.markerDef;
            }

            // Add CSS class for additional styling
            gantt.element.classList.toggle(
                `marker-${source.text.toLowerCase()}`,
                source.pressed
            );
        }
    }
]
```

### 2.2 Custom Marker Styling

```css
/* Thin marker styling */
.marker-thin .b-sch-dependency-arrow {
    fill: #2196F3;
}

/* Circle marker styling */
.marker-circle .b-sch-dependency-arrow {
    fill: #4CAF50;
    stroke: #2E7D32;
    stroke-width: 1;
}

/* Custom dependency line colors */
.b-sch-dependency {
    stroke: #666;
    stroke-width: 1;
}

.b-sch-dependency.b-sch-dependency-highlighted {
    stroke: #2196F3;
    stroke-width: 2;
}
```

---

## 3. Dependency Delete Dialog

### 3.1 Custom Delete Popup

```javascript
import { MessageDialog, StringHelper } from '@bryntum/gantt';

const gantt = new Gantt({
    // ... config

    features: {
        dependencyEdit: {
            // Disable default edit on click
            triggerEvent: null
        }
    },

    tbar: [
        {
            ref: 'useDeletePopup',
            type: 'slidetoggle',
            text: 'Use simple delete popup',
            checked: true
        }
    ],

    async onDependencyClick({ dependency, event }) {
        // Check if simple popup is enabled
        if (!this.widgetMap.useDeletePopup.checked) {
            return;
        }

        // Show confirmation dialog
        const result = await MessageDialog.confirm({
            modal: false,
            title: 'Delete dependency',
            message: StringHelper.xss`
                Delete link between
                <span class="dep-name">${dependency.fromTask.name}</span>
                and
                <span class="dep-name">${dependency.toTask.name}</span>?
            `,
            align: {
                target: event,
                anchor: true,
                align: 'b-t'
            }
        });

        if (result === MessageDialog.okButton) {
            dependency.remove();
        }
    }
});
```

### 3.2 Toggle Between Edit Modes

```javascript
tbar: [
    {
        type: 'slidetoggle',
        text: 'Use simple delete popup',
        checked: true,
        onChange({ checked }) {
            // Toggle between custom popup and default editor
            gantt.features.dependencyEdit.triggerEvent =
                checked ? null : 'dependencyClick';
        }
    }
]
```

---

## 4. Undo/Redo Functionality

### 4.1 StateTrackingManager Setup

```javascript
import { ProjectModel, Gantt, Container } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    loadUrl: '/api/project',
    autoLoad: true,

    // Configure State Tracking Manager
    stm: {
        // Auto-record transactions
        autoRecord: true
    }
});

const { stm, taskStore } = project;

const gantt = new Gantt({
    appendTo: 'container',
    project,

    // Enable keyboard shortcuts (Ctrl+Z, Ctrl+Y)
    enableUndoRedoKeys: true,

    tbar: [
        '->',
        {
            ref: 'undoredoTool',
            type: 'undoredo',
            text: true,
            items: {
                // Hide transactions dropdown
                transactionsCombo: null
            }
        }
    ]
});
```

### 4.2 Actions Grid (Transaction History)

```javascript
import { TreeGrid, Collection, StringHelper, TaskModel, DependencyModel, ProjectModel } from '@bryntum/gantt';

// Custom collection that only allows single selection
class ActionsCollection extends Collection {
    splice(index = 0, toRemove = [], toAdd = []) {
        const lengthAfter = this.count -
            (Array.isArray(toRemove) ? toRemove.length : toRemove) +
            toAdd.length;

        // Collection must always have 1 action selected
        if (lengthAfter === 1) {
            if (toAdd.length === 0 ||
                (toAdd.length === 1 && (toAdd[0].id === -1 || toAdd[0].isParent))) {
                super.splice(index, toRemove, ...toAdd);
            }
        }
    }
}

class ActionsGrid extends TreeGrid {
    static $name = 'ActionsGrid';
    static type = 'actionsgrid';

    static get configurable() {
        return {
            stm: null,
            readOnly: true,

            features: {
                cellEdit: false
            },

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

    // Restore state when selection changes
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

        // Create action record with child steps
        const action = actionStore.rootNode.insertChild({
            idx: stm.position,
            title: transaction.title,
            changes: `${transaction.length} step${transaction.length > 1 ? 's' : ''}`,
            expanded: false,
            children: transaction.queue.map((action, idx) =>
                this.createActionRecord(action, stm.position, idx)
            )
        }, toRemove[0]);

        this.selectedRecord = action;

        if (toRemove.length) {
            actionStore.rootNode.removeChild(toRemove);
        }
    }

    createActionRecord(action, position, idx) {
        let { type, parentModel, model, modelList, newData } = action;
        let title = '', changes = '';

        if (!model) {
            model = parentModel || modelList[modelList.length - 1];
        }

        // Generate human-readable action titles
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
            title = model.fromEvent && model.toEvent
                ? `Edit link ${model.fromEvent.name} -> ${model.toEvent.name}`
                : 'Edit link';
            changes = StringHelper.safeJsonStringify(newData);
        }
        else if (type === 'AddAction' && model instanceof DependencyModel) {
            title = `Link ${model.fromEvent?.name} -> ${model.toEvent?.name}`;
        }
        else if (type === 'RemoveAction' && model instanceof DependencyModel) {
            const fromEvent = model.fromEvent || this.taskStore.getById(model.from);
            const toEvent = model.toEvent || this.taskStore.getById(model.to);
            title = fromEvent && toEvent
                ? `Unlink ${fromEvent.name} -> ${toEvent.name}`
                : 'Unlink tasks';
        }
        else if (type === 'InsertChildAction') {
            title = `Insert task ${model.name} at position ${action.insertIndex}`;
        }

        return {
            idx: `${position}.${idx + 1}`,
            title,
            changes
        };
    }

    onRestoringStop({ stm }) {
        const action = this.store.rootNode.children[stm.position];
        this.selectedRecord = action;
    }
}

ActionsGrid.initClass();
```

### 4.3 Complete Container Setup

```javascript
new Container({
    appendTo: 'container',
    layout: 'hbox',
    flex: 1,

    items: {
        gantt: {
            type: 'gantt',
            enableUndoRedoKeys: true,
            flex: 3,
            project,

            columns: [
                { type: 'wbs' },
                { type: 'name', width: 250 },
                { type: 'startdate' },
                { type: 'duration' },
                { type: 'predecessor', width: 112 },
                { type: 'successor', width: 112 },
                { type: 'addnew' }
            ],

            tbar: [
                'Gantt view',
                '->',
                {
                    ref: 'undoredoTool',
                    type: 'undoredo',
                    text: true,
                    items: {
                        transactionsCombo: null
                    }
                }
            ]
        },

        splitter: { type: 'splitter' },

        actionsGrid: {
            type: 'actionsgrid',
            flex: 1,
            tbar: ['Actions view'],
            stm,
            taskStore
        }
    }
});
```

---

## 5. Dependency Types

### 5.1 Available Types

| Type | Code | Description |
|------|------|-------------|
| Finish-to-Start | 0 or 'FS' | Default: Task B starts after Task A finishes |
| Start-to-Start | 1 or 'SS' | Task B starts when Task A starts |
| Finish-to-Finish | 2 or 'FF' | Task B finishes when Task A finishes |
| Start-to-Finish | 3 or 'SF' | Task B finishes when Task A starts |

### 5.2 Creating Dependencies Programmatically

```javascript
// Add dependency via store
project.dependencyStore.add({
    fromTask: 1,
    toTask: 2,
    type: 0,  // Finish-to-Start
    lag: 1,
    lagUnit: 'd'  // days
});

// Or via task model
const task = project.taskStore.getById(1);
task.addSuccessor(project.taskStore.getById(2));

// With specific type
task.addSuccessor(project.taskStore.getById(3), {
    type: 'SS',
    lag: 2
});
```

---

## 6. Predecessor/Successor Columns

### 6.1 Column Configuration

```javascript
columns: [
    { type: 'name', width: 250 },
    {
        type: 'predecessor',
        width: 112,
        text: 'Predecessors'
    },
    {
        type: 'successor',
        width: 112,
        text: 'Successors'
    }
]
```

### 6.2 Display Format

```javascript
// Dependencies are displayed as:
// "1" - simple reference
// "1FS" - with type
// "1FS+2d" - with type and lag

// Predecessor column shows incoming dependencies
// Successor column shows outgoing dependencies
```

---

## 7. React Integration

```jsx
import { BryntumGantt, BryntumSplitter, BryntumTreeGrid } from '@bryntum/gantt-react';
import { useState, useRef, useEffect } from 'react';
import { ProjectModel } from '@bryntum/gantt';

function GanttWithUndoRedo() {
    const ganttRef = useRef(null);
    const actionsGridRef = useRef(null);
    const projectRef = useRef(null);

    useEffect(() => {
        projectRef.current = new ProjectModel({
            autoSetConstraints: true,
            loadUrl: '/api/project',
            autoLoad: true,
            stm: {
                autoRecord: true
            }
        });

        return () => projectRef.current?.destroy();
    }, []);

    const ganttConfig = {
        project: projectRef.current,
        enableUndoRedoKeys: true,

        features: {
            dependencies: {
                showTooltip: true,
                clickWidth: 5,
                radius: 10,
                terminalSize: 12
            }
        },

        columns: [
            { type: 'name', width: 250 },
            { type: 'predecessor', width: 112 },
            { type: 'successor', width: 112 }
        ],

        tbar: [
            {
                type: 'undoredo',
                text: true
            }
        ]
    };

    return (
        <div className="gantt-undo-wrapper">
            <BryntumGantt
                ref={ganttRef}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 8. Styling

```css
/* Dependency line styling */
.b-sch-dependency {
    stroke: #999;
    stroke-width: 1;
    fill: none;
}

.b-sch-dependency:hover {
    stroke: #2196F3;
    stroke-width: 2;
}

/* Dependency arrow marker */
.b-sch-dependency-arrow {
    fill: #999;
}

.b-sch-dependency:hover .b-sch-dependency-arrow {
    fill: #2196F3;
}

/* Terminal styling */
.b-sch-terminal {
    width: 12px;
    height: 12px;
    background: #4CAF50;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.b-sch-terminal:hover {
    background: #2196F3;
    transform: scale(1.2);
}

/* Delete popup styling */
.dep-name {
    font-weight: bold;
    color: #2196F3;
}

/* Click area highlight */
.b-highlight-click-area .b-sch-dependency {
    stroke-width: 5;
    stroke: rgba(33, 150, 243, 0.3);
}

/* Undo/Redo toolbar */
.b-undoredo {
    display: flex;
    gap: 4px;
}

.b-undoredo .b-button:disabled {
    opacity: 0.5;
}

/* Actions grid styling */
.b-actionsgrid .b-tree-cell {
    font-size: 12px;
}

.b-actionsgrid .b-tree-cell.b-changes-cell {
    color: #666;
    font-family: monospace;
}
```

---

## 9. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Terminals niet zichtbaar | terminalSize: 0 | Verhoog terminalSize |
| Klikken op lines moeilijk | clickWidth te klein | Verhoog clickWidth |
| Undo werkt niet | STM niet enabled | Enable stm.autoRecord of stm.enable() |
| Dependency types fout | Verkeerd type nummer | Gebruik 0-3 of 'FS', 'SS', 'FF', 'SF' |
| Delete dialog niet zichtbaar | dependencyEdit actief | Zet triggerEvent: null |
| Actions grid leeg | Events niet gekoppeld | Check stm.on bindings |

---

## API Reference

### Dependencies Feature

| Property | Type | Description |
|----------|------|-------------|
| `showTooltip` | Boolean | Show hover tooltip |
| `clickWidth` | Number | Click area width in px |
| `radius` | Number | Corner radius of lines |
| `terminalOffset` | Number | Offset from task edge |
| `terminalSize` | Number | Size of terminals |
| `terminalShowDelay` | Number | Delay before showing (ms) |
| `terminalHideDelay` | Number | Delay before hiding (ms) |
| `markerDef` | String | SVG path for arrow marker |

### DependencyEdit Feature

| Property | Type | Description |
|----------|------|-------------|
| `triggerEvent` | String/null | Event to trigger edit dialog |

### StateTrackingManager

| Property | Type | Description |
|----------|------|-------------|
| `autoRecord` | Boolean | Auto-record transactions |
| `position` | Number | Current position in history |

| Method | Description |
|--------|-------------|
| `enable()` | Start tracking changes |
| `disable()` | Stop tracking changes |
| `undo(steps)` | Undo specified steps |
| `redo(steps)` | Redo specified steps |

---

## Bronnen

- **Dependencies Example**: `examples/dependencies/`
- **Undo/Redo Example**: `examples/undoredo/`
- **Dependencies Feature**: `Gantt.feature.Dependencies`
- **DependencyEdit Feature**: `Gantt.feature.DependencyEdit`
- **StateTrackingManager**: `Core.data.stm.StateTrackingManager`
- **UndoRedo Widget**: `Gantt.widget.UndoRedo`

---

*Priority 1: Missing Core Functionality*
