# IMPL: Undo/Redo & State Tracking Manager (STM)

> **Implementation Guide** - Hoe Bryntum's STM werkt en hoe je dit zelf kunt implementeren.

---

## Overzicht

Het State Tracking Manager (STM) systeem is een transaction-based undo/redo systeem dat alle wijzigingen in stores trackt en de mogelijkheid biedt om naar eerdere states terug te keren.

```
┌─────────────────────────────────────────────────────────────────┐
│                    StateTrackingManager                          │
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │ Trans 1  │ → │ Trans 2  │ → │ Trans 3  │ → │ Trans 4  │     │
│  │ (undo)   │   │ (undo)   │   │ (current)│   │ (redo)   │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│                                     ↑                            │
│                                 position                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Core Classes

### 1.1 StateTrackingManager

```typescript
class StateTrackingManager extends Base {
    // State
    autoRecord: boolean;      // Auto-record na elke wijziging
    disabled: boolean;        // STM aan/uit
    isReady: boolean;         // Klaar voor gebruik
    isRecording: boolean;     // Bezig met opnemen
    isRestoring: boolean;     // Bezig met restore

    // Queue
    length: number;           // Aantal transactions
    position: number;         // Huidige positie in queue
    queue: string[];          // Transaction titles
    transaction: Transaction; // Huidige transaction

    // Capabilities
    canUndo: boolean;
    canRedo: boolean;

    // Registered stores
    stores: Store[];

    // Methods
    enable(): void;
    disable(): void;
    undo(steps?: number): void;
    redo(steps?: number): void;
    resetQueue(): void;
    startTransaction(title?: string): void;
    stopTransaction(title?: string): void;
    rejectTransaction(): void;
}
```

### 1.2 Transaction

```typescript
class Transaction {
    length: number;           // Aantal actions
    queue: ActionBase[];      // Action queue
    title: string;            // Transaction titel

    addAction(action: ActionBase): void;
    mergeUpdateModelActions(): void;
    undo(): void;
    redo(): void;
}
```

### 1.3 Action Types

```typescript
// Base action
abstract class ActionBase {
    type: string;  // 'AddAction', 'UpdateAction', etc.
    undo(): void;
    redo(): void;
}

// Specifieke actions
class AddAction extends ActionBase {
    model: Model;
    modelList: Model[];
}

class RemoveAction extends ActionBase {
    model: Model;
    modelList: Model[];
}

class UpdateAction extends ActionBase {
    model: Model;
    newData: Record<string, any>;
    oldData: Record<string, any>;
}

class InsertAction extends ActionBase {
    model: Model;
    insertIndex: number;
}

class InsertChildAction extends ActionBase {
    parentModel: Model;
    model: Model;
    insertIndex: number;
}

class RemoveChildAction extends ActionBase {
    parentModel: Model;
    model: Model;
}

// SchedulerPro specifiek
class EventUpdateAction extends UpdateAction {
    // Extra handling voor events met propagation
}
```

---

## 2. Basis Implementatie

### 2.1 STM Configureren

```javascript
import { ProjectModel, Gantt } from '@bryntum/gantt';

const project = new ProjectModel({
    stm: {
        autoRecord: true  // Automatisch transactions opnemen
    }
});

const gantt = new Gantt({
    project,
    // Keyboard shortcuts: Ctrl+Z, Ctrl+Y
    enableUndoRedoKeys: true
});

// STM moet expliciet enabled worden NA data loading
project.load().then(() => {
    project.stm.enable();
});
```

### 2.2 Handmatige Transactions

```javascript
const { stm } = project;

// Start transaction
stm.startTransaction('Bulk update');

// Doe wijzigingen
task1.name = 'Updated';
task2.duration = 5;
project.taskStore.add({ name: 'New Task' });

// Stop transaction
stm.stopTransaction();

// Of reject
stm.rejectTransaction(); // Alle wijzigingen ongedaan
```

### 2.3 Undo/Redo

```javascript
// Check of mogelijk
if (stm.canUndo) {
    stm.undo();     // 1 stap terug
    stm.undo(3);    // 3 stappen terug
}

if (stm.canRedo) {
    stm.redo();     // 1 stap vooruit
    stm.redo(2);    // 2 stappen vooruit
}

// Naar specifieke positie
const targetPosition = 5;
if (stm.position < targetPosition) {
    stm.redo(targetPosition - stm.position);
} else {
    stm.undo(stm.position - targetPosition);
}

// Reset queue
stm.resetQueue();
```

---

## 3. Events

### 3.1 STM Events

```javascript
stm.on({
    // Transaction opname gestart
    recordingStart({ stm }) {
        console.log('Started recording');
    },

    // Transaction opname gestopt
    recordingStop({ stm, transaction, reason }) {
        if (reason.rejected) {
            console.log('Transaction rejected');
            return;
        }

        console.log(`Recorded: ${transaction.title}`);
        console.log(`Actions: ${transaction.length}`);

        // Analyseer actions
        transaction.queue.forEach(action => {
            console.log(`- ${action.type}:`, action.model?.name);
        });
    },

    // Restore gestart (undo/redo)
    restoringStart({ stm }) {
        console.log('Restoring state...');
    },

    // Restore gestopt
    restoringStop({ stm }) {
        console.log(`Restored to position ${stm.position}`);
    },

    // Queue reset
    queueReset({ stm }) {
        console.log('Queue was reset');
    },

    // Disabled state change
    disabled({ stm, disabled }) {
        console.log(`STM ${disabled ? 'disabled' : 'enabled'}`);
    }
});
```

---

## 4. UndoRedo Widget

### 4.1 Toolbar Integratie

```javascript
const gantt = new Gantt({
    project,

    tbar: {
        items: [
            {
                type: 'undoredo',
                // Toon text labels
                text: true,
                // Verberg transactions dropdown
                items: {
                    transactionsCombo: null
                }
            }
        ]
    }
});
```

### 4.2 Custom UndoRedo UI

```javascript
// Custom undo button
const undoButton = new Button({
    icon: 'b-fa-undo',
    disabled: true,
    onClick() {
        project.stm.undo();
    }
});

// Custom redo button
const redoButton = new Button({
    icon: 'b-fa-redo',
    disabled: true,
    onClick() {
        project.stm.redo();
    }
});

// Update button states
stm.on({
    recordingStop: updateButtons,
    restoringStop: updateButtons,
    queueReset: updateButtons
});

function updateButtons() {
    undoButton.disabled = !stm.canUndo;
    redoButton.disabled = !stm.canRedo;
}
```

---

## 5. Actions Grid (Geschiedenis View)

### 5.1 Transaction Geschiedenis

```javascript
import { TreeGrid, Collection } from '@bryntum/gantt';

// Custom collection die altijd 1 item selected houdt
class ActionsCollection extends Collection {
    splice(index, toRemove, toAdd) {
        const lengthAfter = this.count - toRemove.length + toAdd.length;
        if (lengthAfter === 1) {
            if (toAdd.length === 0 || toAdd[0].isParent) {
                super.splice(index, toRemove, ...toAdd);
            }
        }
    }
}

class ActionsGrid extends TreeGrid {
    static configurable = {
        stm: null,
        readOnly: true,
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
            { text: '#', field: 'idx', width: 50 },
            { text: 'Action', field: 'title', type: 'tree', flex: 1 },
            { text: 'Changes', field: 'changes', flex: 1 }
        ]
    };

    // Navigeer naar geselecteerde transaction
    onSelectionChange() {
        const { stm } = this;
        const action = this.selectedRecord;

        if (action?.parent?.isRoot) {
            const idx = action.idx;

            if (stm.position < idx) {
                stm.redo(idx - stm.position);
            } else if (stm.position > idx) {
                stm.undo(stm.position - idx);
            }
        }
    }

    updateStm(stm) {
        stm.on({
            recordingStop: this.onRecordingStop,
            restoringStop: this.onRestoringStop,
            thisObj: this
        });
    }

    onRecordingStop({ stm, transaction, reason }) {
        if (reason.rejected) return;

        const actionStore = this.store;
        const toRemove = actionStore.rootNode.children.slice(stm.position);

        // Voeg nieuwe transaction toe
        const action = actionStore.rootNode.insertChild({
            idx: stm.position,
            title: transaction.title,
            changes: `${transaction.length} steps`,
            expanded: false,
            // Sub-actions als children
            children: transaction.queue.map((action, idx) => ({
                idx: `${stm.position}.${idx + 1}`,
                title: this.getActionTitle(action),
                changes: JSON.stringify(action.newData || {})
            }))
        }, toRemove[0]);

        this.selectedRecord = action;

        // Verwijder "toekomstige" transactions
        if (toRemove.length) {
            actionStore.rootNode.removeChild(toRemove);
        }
    }

    onRestoringStop({ stm }) {
        const action = this.store.rootNode.children[stm.position];
        this.selectedRecord = action;
    }

    getActionTitle(action) {
        const { type, model, newData } = action;

        switch (type) {
            case 'AddAction':
                return `Add: ${model?.name}`;
            case 'RemoveAction':
                return `Remove: ${model?.name}`;
            case 'UpdateAction':
            case 'EventUpdateAction':
                return `Update: ${model?.name}`;
            case 'InsertChildAction':
                return `Insert: ${model?.name}`;
            default:
                return type;
        }
    }
}
```

---

## 6. Eigen STM Implementatie

### 6.1 Minimal State Manager

```typescript
interface Action {
    type: 'add' | 'remove' | 'update';
    store: string;
    recordId: string | number;
    oldData?: Record<string, any>;
    newData?: Record<string, any>;
}

interface Transaction {
    id: string;
    title: string;
    timestamp: Date;
    actions: Action[];
}

class SimpleStateManager {
    private transactions: Transaction[] = [];
    private position: number = 0;
    private currentTransaction: Transaction | null = null;
    private isRecording: boolean = false;

    get canUndo(): boolean {
        return this.position > 0;
    }

    get canRedo(): boolean {
        return this.position < this.transactions.length;
    }

    startTransaction(title: string): void {
        this.currentTransaction = {
            id: crypto.randomUUID(),
            title,
            timestamp: new Date(),
            actions: []
        };
        this.isRecording = true;
    }

    addAction(action: Action): void {
        if (!this.isRecording || !this.currentTransaction) {
            throw new Error('No active transaction');
        }
        this.currentTransaction.actions.push(action);
    }

    stopTransaction(): void {
        if (!this.currentTransaction) return;

        // Verwijder "toekomstige" transactions
        this.transactions = this.transactions.slice(0, this.position);

        // Voeg nieuwe toe
        this.transactions.push(this.currentTransaction);
        this.position = this.transactions.length;

        this.currentTransaction = null;
        this.isRecording = false;

        this.emit('transactionRecorded', this.transactions[this.position - 1]);
    }

    rejectTransaction(): void {
        // Voer undo uit voor alle actions in huidige transaction
        if (this.currentTransaction) {
            this.undoActions(this.currentTransaction.actions);
        }
        this.currentTransaction = null;
        this.isRecording = false;
    }

    undo(steps: number = 1): void {
        for (let i = 0; i < steps && this.canUndo; i++) {
            this.position--;
            const transaction = this.transactions[this.position];
            this.undoActions(transaction.actions);
        }
        this.emit('stateRestored', this.position);
    }

    redo(steps: number = 1): void {
        for (let i = 0; i < steps && this.canRedo; i++) {
            const transaction = this.transactions[this.position];
            this.redoActions(transaction.actions);
            this.position++;
        }
        this.emit('stateRestored', this.position);
    }

    private undoActions(actions: Action[]): void {
        // Undo in reverse order
        for (let i = actions.length - 1; i >= 0; i--) {
            const action = actions[i];
            this.undoAction(action);
        }
    }

    private redoActions(actions: Action[]): void {
        for (const action of actions) {
            this.redoAction(action);
        }
    }

    private undoAction(action: Action): void {
        const store = this.getStore(action.store);

        switch (action.type) {
            case 'add':
                store.remove(action.recordId);
                break;
            case 'remove':
                store.add({ id: action.recordId, ...action.oldData });
                break;
            case 'update':
                store.update(action.recordId, action.oldData);
                break;
        }
    }

    private redoAction(action: Action): void {
        const store = this.getStore(action.store);

        switch (action.type) {
            case 'add':
                store.add({ id: action.recordId, ...action.newData });
                break;
            case 'remove':
                store.remove(action.recordId);
                break;
            case 'update':
                store.update(action.recordId, action.newData);
                break;
        }
    }

    // Event emitter (simplified)
    private listeners = new Map<string, Function[]>();

    on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    private emit(event: string, data: any): void {
        this.listeners.get(event)?.forEach(cb => cb(data));
    }
}
```

### 6.2 Store Integration

```typescript
class TrackedStore {
    private stm: SimpleStateManager;
    private records: Map<string | number, Record<string, any>> = new Map();

    constructor(stm: SimpleStateManager) {
        this.stm = stm;
    }

    add(record: Record<string, any>): void {
        const id = record.id;
        this.records.set(id, record);

        this.stm.addAction({
            type: 'add',
            store: this.name,
            recordId: id,
            newData: { ...record }
        });
    }

    remove(id: string | number): void {
        const oldData = this.records.get(id);
        this.records.delete(id);

        this.stm.addAction({
            type: 'remove',
            store: this.name,
            recordId: id,
            oldData: { ...oldData }
        });
    }

    update(id: string | number, data: Record<string, any>): void {
        const record = this.records.get(id);
        const oldData = { ...record };

        Object.assign(record, data);

        this.stm.addAction({
            type: 'update',
            store: this.name,
            recordId: id,
            oldData,
            newData: { ...data }
        });
    }
}
```

---

## 7. Revisions Integratie

### 7.1 STM + Revisions

```javascript
const project = new ProjectModel({
    stm: {
        revisionsEnabled: true,  // Enable revisions
        autoRecord: true
    }
});

// Na loading
project.load().then(() => {
    project.stm.enable();
    project.initRevisions('client-unique-id');
});

// Luister naar revisions
project.on('revisionNotification', revision => {
    // Stuur naar server
    websocket.send(JSON.stringify({
        command: 'projectChange',
        ...revision
    }));
});
```

---

## 8. Best Practices

### 8.1 STM Enablement

```javascript
// GOED: Enable na data loading
project.load().then(() => {
    project.stm.enable();
});

// FOUT: Enable voor data loading
project.stm.enable();  // Initial load wordt ook getracked!
project.load();
```

### 8.2 Batch Updates

```javascript
// GOED: Eén transaction voor gerelateerde wijzigingen
stm.startTransaction('Move task with dependencies');
task.startDate = newDate;
task.dependencies.forEach(dep => dep.lag = 0);
stm.stopTransaction();

// FOUT: Meerdere losse transactions
task.startDate = newDate;  // Transaction 1
dep1.lag = 0;              // Transaction 2
dep2.lag = 0;              // Transaction 3
```

### 8.3 React Integration

```javascript
function useUndoRedo(project) {
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    useEffect(() => {
        const stm = project.stm;

        const updateState = () => {
            setCanUndo(stm.canUndo);
            setCanRedo(stm.canRedo);
        };

        stm.on({
            recordingStop: updateState,
            restoringStop: updateState,
            queueReset: updateState
        });

        return () => stm.un('recordingStop', updateState);
    }, [project]);

    return {
        canUndo,
        canRedo,
        undo: () => project.stm.undo(),
        redo: () => project.stm.redo()
    };
}
```

---

## 9. Cross-References

| Document | Relevante Secties |
|----------|-------------------|
| [DEEP-DIVE-CRITICAL-FEATURES](./DEEP-DIVE-CRITICAL-FEATURES.md) | Versions & Revisions |
| [OFFICIAL-GUIDES-SUMMARY](./OFFICIAL-GUIDES-SUMMARY.md) | Revisions protocol |
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | Store operations |
| [CLASS-INVENTORY](./CLASS-INVENTORY.md) | STM classes |

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
