# TaskBoard Implementation: Undo/Redo (STM)

> **Complete guide** voor State Tracking Manager (STM), transactions, en de UndoRedo widget in Bryntum TaskBoard.

---

## Overzicht

TaskBoard gebruikt het State Tracking Manager (STM) systeem voor undo/redo functionaliteit:

| Component | Beschrijving |
|-----------|--------------|
| **StateTrackingManager** | Core engine voor state tracking |
| **Transaction** | Bundel van gerelateerde actions |
| **Action** | Individuele wijziging (Add, Update, Remove) |
| **UndoRedo Widget** | UI component voor undo/redo controls |

---

## 1. STM Basis Configuratie

### 1.1 Enable STM via Project

```javascript
const taskBoard = new TaskBoard({
    project: {
        // STM configuratie
        stm: {
            // Automatisch transacties opnemen
            autoRecord: true,

            // STM ingeschakeld
            disabled: false,

            // Merge meerdere updates naar zelfde model
            autoRecordMergeUpdateActions: true,

            // Timeout voor auto-record transactie (ms)
            autoRecordTransactionStopTimeout: 100
        },

        loadUrl: 'data/data.json',
        autoLoad: true
    }
});
```

### 1.2 Minimale Setup

```javascript
const taskBoard = new TaskBoard({
    project: {
        stm: {
            autoRecord: true,
            disabled: false
        }
    },

    // UndoRedo widget in toolbar
    tbar: [
        { type: 'taskboardundoredo' }
    ]
});
```

---

## 2. UndoRedo Widget

### 2.1 Standaard UndoRedo Widget

```javascript
tbar: [
    {
        type: 'taskboardundoredo',
        // Widget items configuratie
        items: {
            // Transactions dropdown
            transactionsCombo: {
                width: '20em'
            }
        }
    }
]
```

### 2.2 Custom UndoRedo Buttons

```javascript
tbar: [
    {
        type: 'button',
        icon: 'b-icon-undo',
        tooltip: 'Undo',
        onClick() {
            taskBoard.project.stm.undo();
        }
    },
    {
        type: 'button',
        icon: 'b-icon-redo',
        tooltip: 'Redo',
        onClick() {
            taskBoard.project.stm.redo();
        }
    }
]
```

### 2.3 Keyboard Shortcuts voor Undo/Redo

```javascript
const taskBoard = new TaskBoard({
    keyMap: {
        'Ctrl+Z': () => taskBoard.project.stm.undo(),
        'Ctrl+Y': () => taskBoard.project.stm.redo(),
        'Ctrl+Shift+Z': () => taskBoard.project.stm.redo()
    }
});
```

---

## 3. Transaction Titles

### 3.1 Custom Transaction Titles

```javascript
project: {
    stm: {
        autoRecord: true,
        disabled: false,

        // Custom transaction titles
        getTransactionTitle(transaction) {
            const lastAction = transaction.queue[transaction.queue.length - 1];
            let { type, model, newData } = lastAction;

            // Handle modelList (batch operations)
            if (lastAction.modelList && lastAction.modelList.length) {
                model = lastAction.modelList[0];
            }

            let title = 'Transaction ' + this.position;

            // Task-specific titles
            if (model.isEventModel) {
                if (type === 'UpdateAction') {
                    if (newData.status) {
                        title = `Set task "${model.name}" status to ${newData.status}`;
                    }
                    else if (newData.prio) {
                        title = `Set task "${model.name}" priority to ${newData.prio}`;
                    }
                    else {
                        title = `Edit task "${model.name}"`;
                    }
                }
                else if (type === 'RemoveAction') {
                    title = `Remove task "${model.name}"`;
                }
                else if (type === 'AddAction') {
                    title = `Add task "${model.name}"`;
                }
            }
            // Assignment-specific titles
            else if (model.isAssignmentModel) {
                if (type === 'RemoveAction') {
                    title = `Unassigned ${model.resource.name} from ${model.event.name}`;
                }
                else if (type === 'AddAction') {
                    title = `Assigned ${model.resource.name} to ${model.event.name}`;
                }
            }

            return title;
        }
    }
}
```

### 3.2 Action Types

| Type | Beschrijving |
|------|--------------|
| `AddAction` | Record toegevoegd aan store |
| `RemoveAction` | Record verwijderd uit store |
| `UpdateAction` | Record data gewijzigd |

---

## 4. STM Events

### 4.1 Recording Events

```javascript
const stm = taskBoard.project.stm;

stm.on({
    // Transaction recording gestart
    recordingStart({ stm, transaction }) {
        console.log('Recording started:', transaction);
    },

    // Transaction recording gestopt
    recordingStop({ stm, transaction, reason }) {
        console.log('Recording stopped:', transaction);

        if (reason.rejected) {
            console.log('Transaction was rejected');
        }
        if (reason.disabled) {
            console.log('STM was disabled');
        }
    }
});
```

### 4.2 Restore Events

```javascript
stm.on({
    // Undo/Redo operatie gestart
    restoringStart({ stm }) {
        console.log('Restoring state...');
        // Toon loading indicator
    },

    // Undo/Redo operatie gestopt
    restoringStop({ stm }) {
        console.log('State restored');
        // Verberg loading indicator
    }
});
```

### 4.3 Queue Events

```javascript
stm.on({
    // Queue is gereset
    queueReset({ stm }) {
        console.log('Undo/redo queue cleared');
    },

    // Disabled state changed
    disabled({ source, disabled }) {
        console.log(`STM ${disabled ? 'disabled' : 'enabled'}`);
    }
});
```

---

## 5. Programmatic STM Control

### 5.1 Undo/Redo Methods

```javascript
const stm = taskBoard.project.stm;

// Undo laatste transactie
stm.undo();

// Redo volgende transactie
stm.redo();

// Undo tot specifiek punt
stm.undoAll();

// Redo alles
stm.redoAll();

// Check of undo mogelijk is
if (stm.canUndo) {
    console.log('Can undo');
}

// Check of redo mogelijk is
if (stm.canRedo) {
    console.log('Can redo');
}
```

### 5.2 Enable/Disable STM

```javascript
const stm = taskBoard.project.stm;

// Disable STM (stop recording)
stm.disable();

// Enable STM
stm.enable();

// Check disabled state
if (stm.disabled) {
    console.log('STM is disabled');
}
```

### 5.3 Manual Transaction Control

```javascript
const stm = taskBoard.project.stm;

// Start manual recording
stm.startTransaction('My custom transaction');

// Voer wijzigingen uit
taskBoard.project.taskStore.getById(1).name = 'New Name';
taskBoard.project.taskStore.add({ name: 'New Task' });

// Stop recording
stm.stopTransaction();

// Of reject transaction
stm.rejectTransaction();
```

---

## 6. Ignoring Changes

### 6.1 Ignore Remote Changes

```javascript
project: {
    // Ignore remote changes in STM
    ignoreRemoteChangesInSTM: true,

    stm: {
        autoRecord: true
    }
}
```

### 6.2 Temporary Disable Recording

```javascript
const stm = taskBoard.project.stm;

// Disable tijdelijk
stm.disable();

// Voer wijzigingen uit die niet tracked moeten worden
taskBoard.project.taskStore.getById(1).internalField = 'value';

// Enable weer
stm.enable();
```

### 6.3 Suspend/Resume

```javascript
const stm = taskBoard.project.stm;

// Suspend recording
stm.suspendEvents();

// Wijzigingen worden niet getracked
taskBoard.project.taskStore.add({ name: 'Temp Task' });

// Resume recording
stm.resumeEvents();
```

---

## 7. Queue Management

### 7.1 Queue Properties

```javascript
const stm = taskBoard.project.stm;

// Huidige positie in queue
console.log('Position:', stm.position);

// Lengte van undo queue
console.log('Undo steps available:', stm.length);

// Check of queue leeg is
if (stm.isReady) {
    console.log('No pending transactions');
}
```

### 7.2 Reset Queue

```javascript
const stm = taskBoard.project.stm;

// Clear hele queue
stm.resetQueue();

// Queue is nu leeg
console.log('Queue cleared');
```

---

## 8. Integration met TaskBoard Features

### 8.1 Undo na Drag & Drop

Drag & drop acties worden automatisch getracked:

```javascript
taskBoard.on({
    taskDrop({ taskRecord, targetColumn }) {
        // Deze actie is automatisch undo-able
        console.log(`Moved ${taskRecord.name} to ${targetColumn.text}`);
    }
});

// User kan Ctrl+Z gebruiken om move ongedaan te maken
```

### 8.2 Undo na Task Edit

```javascript
taskBoard.on({
    beforeTaskEditShow({ taskRecord, editor }) {
        // Editor changes worden automatisch getracked
    }
});

// Alle edits zijn undo-able
```

### 8.3 Batch Operations

```javascript
const stm = taskBoard.project.stm;
const store = taskBoard.project.taskStore;

// Start een transactie voor batch operatie
stm.startTransaction('Batch update');

// Meerdere wijzigingen
store.forEach(task => {
    if (task.status === 'todo') {
        task.priority = 'high';
    }
});

// Stop transactie - alles is één undo stap
stm.stopTransaction();
```

---

## 9. UI Feedback

### 9.1 Undo/Redo State in UI

```javascript
const stm = taskBoard.project.stm;

// Update UI buttons based on state
function updateUndoRedoButtons() {
    const undoBtn = taskBoard.widgetMap.undoBtn;
    const redoBtn = taskBoard.widgetMap.redoBtn;

    if (undoBtn) undoBtn.disabled = !stm.canUndo;
    if (redoBtn) redoBtn.disabled = !stm.canRedo;
}

stm.on({
    recordingStop: updateUndoRedoButtons,
    restoringStop: updateUndoRedoButtons,
    queueReset: updateUndoRedoButtons
});
```

### 9.2 Transaction History Display

```javascript
function getTransactionHistory() {
    const stm = taskBoard.project.stm;
    const history = [];

    for (let i = 0; i < stm.length; i++) {
        const transaction = stm.queue[i];
        history.push({
            index: i,
            title: stm.getTransactionTitle(transaction),
            isCurrent: i === stm.position - 1,
            actionCount: transaction.queue.length
        });
    }

    return history;
}
```

---

## 10. TypeScript Interfaces

```typescript
// STM Configuration
interface StateTrackingManagerConfig {
    autoRecord?: boolean;
    autoRecordMergeUpdateActions?: boolean;
    autoRecordTransactionStopTimeout?: number;
    disabled?: boolean;
    getTransactionTitle?: (transaction: Transaction) => string;
    revisionsEnabled?: boolean;
    listeners?: StateTrackingManagerListeners;
}

// STM Events
interface StateTrackingManagerListeners {
    recordingStart?: (event: {
        stm: StateTrackingManager;
        transaction: Transaction;
    }) => void;

    recordingStop?: (event: {
        stm: StateTrackingManager;
        transaction: Transaction;
        reason: {
            stop: boolean;
            disabled: boolean;
            rejected: boolean;
        };
    }) => void;

    restoringStart?: (event: {
        stm: StateTrackingManager;
    }) => void;

    restoringStop?: (event: {
        stm: StateTrackingManager;
    }) => void;

    queueReset?: (event: {
        stm: StateTrackingManager;
    }) => void;

    disabled?: (event: {
        source: StateTrackingManager;
        disabled: boolean;
    }) => void;
}

// StateTrackingManager Class
interface StateTrackingManager extends Base {
    readonly isStateTrackingManager: boolean;

    // Properties
    autoRecord: boolean;
    disabled: boolean;
    isReady: boolean;
    isRecording: boolean;
    isRestoring: boolean;
    canUndo: boolean;
    canRedo: boolean;
    position: number;
    length: number;
    queue: Transaction[];

    // Methods
    enable(): void;
    disable(): void;
    undo(steps?: number): void;
    redo(steps?: number): void;
    undoAll(): void;
    redoAll(): void;
    startTransaction(title?: string): void;
    stopTransaction(title?: string): void;
    rejectTransaction(): void;
    resetQueue(): void;
    getTransactionTitle(transaction: Transaction): string;

    // Store management
    addStore(store: Store): void;
    removeStore(store: Store): void;
    hasStore(store: Store): boolean;
}

// Transaction
interface Transaction {
    queue: Action[];
    title?: string;
}

// Action Types
interface Action {
    type: 'AddAction' | 'RemoveAction' | 'UpdateAction';
    model?: Model;
    modelList?: Model[];
    oldData?: object;
    newData?: object;
}

// UndoRedo Widget Config
interface UndoRedoConfig {
    type: 'taskboardundoredo';
    items?: {
        transactionsCombo?: {
            width?: string | number;
        };
        undoBtn?: object;
        redoBtn?: object;
    };
}

// Project STM Config
interface ProjectConfig {
    stm?: StateTrackingManagerConfig | boolean;
    ignoreRemoteChangesInSTM?: boolean;
}
```

---

## 11. Best Practices

### 11.1 Performance

```javascript
project: {
    stm: {
        autoRecord: true,
        // Merge updates voor betere performance
        autoRecordMergeUpdateActions: true,
        // Langere timeout voor batch edits
        autoRecordTransactionStopTimeout: 200
    }
}
```

### 11.2 Memory Management

```javascript
const stm = taskBoard.project.stm;

// Beperk queue grootte
const MAX_UNDO_STEPS = 50;

stm.on({
    recordingStop() {
        while (stm.length > MAX_UNDO_STEPS) {
            // Remove oldest transaction
            stm.queue.shift();
        }
    }
});
```

### 11.3 Server Sync

```javascript
project: {
    // Ignore remote changes
    ignoreRemoteChangesInSTM: true,

    stm: {
        autoRecord: true
    },

    listeners: {
        // Reset queue after successful sync
        sync() {
            this.stm.resetQueue();
        }
    }
}
```

---

## 12. Common Patterns

### 12.1 Undo Confirmation Dialog

```javascript
async function undoWithConfirmation() {
    const stm = taskBoard.project.stm;

    if (!stm.canUndo) return;

    const result = await MessageDialog.confirm({
        title: 'Undo',
        message: 'Are you sure you want to undo the last action?'
    });

    if (result === MessageDialog.yesButton) {
        stm.undo();
    }
}
```

### 12.2 Transactie Grouping

```javascript
// Group related changes in one transaction
async function moveTasksToColumn(tasks, targetColumn) {
    const stm = taskBoard.project.stm;

    stm.startTransaction(`Move ${tasks.length} tasks to ${targetColumn.text}`);

    try {
        tasks.forEach(task => {
            task[taskBoard.columnField] = targetColumn.id;
        });

        stm.stopTransaction();
    } catch (e) {
        stm.rejectTransaction();
        throw e;
    }
}
```

---

## Samenvatting

| Aspect | Implementation |
|--------|----------------|
| **Enable STM** | `project.stm.autoRecord: true` |
| **UndoRedo Widget** | `type: 'taskboardundoredo'` |
| **Undo Shortcut** | `Ctrl+Z` via keyMap |
| **Custom Titles** | `stm.getTransactionTitle()` |
| **Batch Operations** | `startTransaction()` / `stopTransaction()` |
| **Remote Ignore** | `ignoreRemoteChangesInSTM: true` |

---

*Laatst bijgewerkt: December 2024*
*Bryntum TaskBoard v7.1.0*
