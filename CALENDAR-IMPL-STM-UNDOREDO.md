# Calendar Implementation: STM & Undo/Redo

> **Fase 6** - Implementatiegids voor State Transaction Manager (STM) en Undo/Redo functionaliteit in Calendar: transacties, queue management, widget integratie.

---

## Overzicht

De Bryntum Calendar ondersteunt volledige undo/redo functionaliteit via de State Transaction Manager (STM). De STM trackt alle wijzigingen aan data stores en maakt het mogelijk om deze wijzigingen ongedaan te maken of opnieuw uit te voeren.

### STM Componenten

| Component | Beschrijving |
|-----------|-------------|
| **StateTrackingManager** | Core manager voor state tracking |
| **Transaction** | Container voor gerelateerde acties |
| **ActionBase** | Basis klasse voor undo/redo acties |
| **UndoRedo Widget** | UI component voor undo/redo |

---

## 1. TypeScript Interfaces

### StateTrackingManagerConfig (line 74381)

```typescript
// Bron: calendar.d.ts line 74381
type StateTrackingManagerConfig = {
    // Automatische transactie recording
    autoRecord?: boolean;

    // Merge model updates in één actie
    autoRecordMergeUpdateActions?: boolean;

    // Timeout voor auto-record (ms)
    autoRecordTransactionStopTimeout?: number;

    // Disabled state
    disabled?: boolean;

    // Custom transactie titel generator
    getTransactionTitle?: (transaction: Transaction) => string;

    // Event bubbling configuratie
    bubbleEvents?: object;

    // Event listeners
    listeners?: StateTrackingManagerListeners;

    // Revision tracking (Gantt feature)
    revisionsEnabled?: boolean;

    // Lifecycle events
    onRecordingStart?: ((event: {
        stm: StateTrackingManager;
        transaction: Transaction
    }) => void) | string;

    onRecordingStop?: ((event: {
        stm: StateTrackingManager;
        transaction: Transaction;
        reason: {
            stop: boolean;
            disabled: boolean;
            rejected: boolean
        }
    }) => void) | string;

    onRestoringStart?: ((event: { stm: StateTrackingManager }) => void) | string;
    onRestoringStop?: ((event: { stm: StateTrackingManager }) => void) | string;
    onQueueReset?: ((event: { stm: StateTrackingManager }) => void) | string;
    onDisabled?: ((event: {
        source: StateTrackingManager;
        disabled: boolean
    }) => void) | string;
};
```

### StateTrackingManager Class (line 74514)

```typescript
// Bron: calendar.d.ts line 74514
export class StateTrackingManager extends Base {
    // Static identifiers
    static readonly isEvents: boolean;
    static readonly isStateTrackingManager: boolean;

    // Properties
    autoRecord: boolean;
    canRedo: boolean;
    canUndo: boolean;
    disabled: boolean;
    readonly isReady: boolean;
    readonly isRecording: boolean;
    readonly isRestoring: boolean;
    length: number;
    position: number;
    readonly queue: string[];
    state: StateBase;
    stores: Store[];
    readonly transaction: Transaction;

    // Methods
    addStore(store: Store): void;
    removeStore(store: Store): void;
    hasStore(store: Store): boolean;

    enable(): void;
    disable(): void;

    startTransaction(title?: string): void;
    stopTransaction(title?: string): void;
    rejectTransaction(): void;
    mergeTransactionUpdateActions(): void;

    undo(steps?: number): Promise<any>;
    undoAll(): Promise<any>;
    redo(steps?: number): Promise<any>;
    redoAll(): Promise<any>;

    resetQueue(): void;
    resetUndoQueue(): void;
    resetRedoQueue(): void;
}
```

### Transaction Class (line 74816)

```typescript
// Bron: calendar.d.ts line 74816
type TransactionConfig = {
    title?: string;
};

export class Transaction {
    // Properties
    length: number;
    queue: ActionBase[];

    // Constructor
    constructor(config?: TransactionConfig);

    // Methods
    addAction(action: ActionBase | object): void;
    mergeUpdateModelActions(): void;
    redo(): void;
    undo(): void;
}
```

### ActionBase Class (line 74854)

```typescript
// Bron: calendar.d.ts line 74854
export abstract class ActionBase {
    readonly type: string;

    redo(): void;
    undo(): void;
}
```

### UndoRedoConfig (line 340830)

```typescript
// Bron: calendar.d.ts line 340830
type UndoRedoConfig = {
    type?: 'undoredo';

    // Widget configuratie
    adopt?: HTMLElement | string;
    appendTo?: HTMLElement | string;
    cls?: string | object;
    color?: string;
    disabled?: boolean | 'inert';
    hidden?: boolean;
    width?: string | number;

    // Layout
    dock?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'header' | 'pre-header' | object;
    flex?: number | string;
    weight?: number;

    // Accessibility
    ariaDescription?: string;
    ariaLabel?: string;

    // Event listeners
    listeners?: UndoRedoBaseListeners;
};
```

---

## 2. STM Setup in Calendar

### Basis Configuratie

```javascript
// Bron: examples/undoredo/app.module.js
const calendar = new Calendar({
    appendTo: 'container',
    date: new Date(2020, 9, 12),

    // CrudManager for data loading
    crudManager: {
        transport: {
            load: { url: 'data/data.json' }
        },
        autoLoad: true
    },

    // Project met STM configuratie
    project: {
        stm: {
            // Automatische transactie recording
            autoRecord: true,

            // Custom transactie titels
            getTransactionTitle(transaction) {
                return `Transaction ${this.position}`;
            }
        }
    },

    // UndoRedo widget in toolbar
    tbar: {
        items: {
            undoRedo: {
                type: 'undoredo',
                width: 350,
                weight: 650
            }
        }
    }
});
```

### Handmatige STM Configuratie

```javascript
const calendar = new Calendar({
    project: {
        stm: {
            // Niet automatisch recorden
            autoRecord: false,

            // Start disabled
            disabled: true,

            // Merge model updates
            autoRecordMergeUpdateActions: true,

            // Timeout voor auto-record
            autoRecordTransactionStopTimeout: 100
        }
    }
});

// Enable STM na data load
calendar.project.on('load', () => {
    calendar.project.stm.enable();
});
```

---

## 3. AutoRecord Modus

### Automatische Transactie Recording

```javascript
project: {
    stm: {
        // AutoRecord enabled
        autoRecord: true,

        // Tijd voordat transactie automatisch stopt (ms)
        autoRecordTransactionStopTimeout: 500,

        // Merge meerdere updates naar zelfde model
        autoRecordMergeUpdateActions: true
    }
}

// Met autoRecord: elke wijziging wordt automatisch getracked
// Transacties worden gestart/gestopt op basis van gebruikersinteractie
```

### AutoRecord Timeout

```javascript
project: {
    stm: {
        autoRecord: true,

        // Langere timeout voor complexe interacties
        autoRecordTransactionStopTimeout: 1000  // 1 seconde
    }
}

// Scenario: Gebruiker sleept event
// 1. Drag start → Transaction start
// 2. Elke muis beweging → Action toegevoegd
// 3. 1 seconde na laatste beweging → Transaction stopt
// 4. Dit wordt één undo stap
```

---

## 4. Handmatige Transacties

### Transaction Lifecycle

```javascript
const { stm } = calendar.project;

// Enable STM indien nodig
stm.enable();

// Start een nieuwe transactie
stm.startTransaction('Create event');

try {
    // Voer wijzigingen uit
    calendar.eventStore.add({
        name: 'New Event',
        startDate: new Date(2024, 0, 15, 9, 0),
        endDate: new Date(2024, 0, 15, 10, 0)
    });

    calendar.eventStore.getById(1).name = 'Updated Event';

    // Stop transactie (commit)
    stm.stopTransaction('Events modified');

} catch (error) {
    // Annuleer transactie bij error
    stm.rejectTransaction();
}
```

### Nested Operations

```javascript
const { stm } = calendar.project;

// Complexe operatie als één transactie
stm.startTransaction('Batch update');

// Meerdere events aanmaken
const events = [
    { name: 'Event 1', startDate: new Date(2024, 0, 15, 9, 0), endDate: new Date(2024, 0, 15, 10, 0) },
    { name: 'Event 2', startDate: new Date(2024, 0, 15, 10, 0), endDate: new Date(2024, 0, 15, 11, 0) },
    { name: 'Event 3', startDate: new Date(2024, 0, 15, 11, 0), endDate: new Date(2024, 0, 15, 12, 0) }
];

calendar.eventStore.add(events);

// Resources toewijzen
events.forEach((event, i) => {
    event.resourceId = calendar.resourceStore.first.id;
});

// Stop als één transactie
stm.stopTransaction('Created 3 events with resources');

// Undo ongedaan maken = alle 3 events + assignments weg
```

---

## 5. Undo/Redo Operaties

### Programmatische Undo/Redo

```javascript
const { stm } = calendar.project;

// Controleer of undo/redo mogelijk is
if (stm.canUndo) {
    // Laatste transactie ongedaan maken
    await stm.undo();
}

if (stm.canRedo) {
    // Opnieuw uitvoeren
    await stm.redo();
}

// Meerdere stappen
await stm.undo(3);  // 3 transacties undo
await stm.redo(2);  // 2 transacties redo

// Alle transacties
await stm.undoAll();
await stm.redoAll();
```

### Undo/Redo Status

```javascript
const { stm } = calendar.project;

// Huidige positie in queue
console.log('Position:', stm.position);
console.log('Queue length:', stm.length);
console.log('Queue titles:', stm.queue);

// States
console.log('Can undo:', stm.canUndo);
console.log('Can redo:', stm.canRedo);
console.log('Is recording:', stm.isRecording);
console.log('Is restoring:', stm.isRestoring);
console.log('Is ready:', stm.isReady);
```

---

## 6. UndoRedo Widget

### Toolbar Configuratie

```javascript
// Bron: examples/undoredo/app.module.js
tbar: {
    items: {
        undoRedo: {
            type: 'undoredo',
            width: 350,
            weight: 650,  // Positie in toolbar

            // Button kleuren
            color: 'b-blue'
        }
    }
}
```

### Widget Structuur

```javascript
// De UndoRedo widget bestaat uit:
// - Undo button
// - Transaction dropdown (combo)
// - Redo button

// De widget zoekt automatisch naar een STM in de ownership hierarchy
// via calendar → project → stm
```

### Custom Styling

```css
/* UndoRedo widget styling */
.b-undoredo {
    display: flex;
    align-items: center;
    gap: 4px;
}

.b-undoredo .b-button {
    min-width: 80px;
}

.b-undoredo .b-combo {
    flex: 1;
}

/* Disabled state */
.b-undoredo .b-button.b-disabled {
    opacity: 0.5;
    pointer-events: none;
}
```

---

## 7. Transaction Titles

### Custom Title Generator

```javascript
project: {
    stm: {
        autoRecord: true,

        getTransactionTitle(transaction) {
            // Analyseer de acties in de transactie
            const actions = transaction.queue;

            if (actions.length === 0) {
                return 'Empty transaction';
            }

            // Tel actie types
            const types = {};
            actions.forEach(action => {
                types[action.type] = (types[action.type] || 0) + 1;
            });

            // Genereer beschrijvende titel
            const parts = [];
            if (types.AddAction) parts.push(`Added ${types.AddAction} items`);
            if (types.UpdateAction) parts.push(`Updated ${types.UpdateAction} items`);
            if (types.RemoveAction) parts.push(`Removed ${types.RemoveAction} items`);

            return parts.join(', ') || `Transaction ${this.position}`;
        }
    }
}
```

### Event-Based Titles

```javascript
project: {
    stm: {
        autoRecord: true,

        getTransactionTitle(transaction) {
            const actions = transaction.queue;
            const firstAction = actions[0];

            if (!firstAction) return 'No changes';

            // Bepaal type wijziging
            switch (firstAction.type) {
                case 'AddAction':
                    const addedRecord = firstAction.record;
                    return `Added: ${addedRecord.name || 'New item'}`;

                case 'UpdateAction':
                    const updatedRecord = firstAction.record;
                    const fields = Object.keys(firstAction.newData || {});
                    return `Modified: ${updatedRecord.name} (${fields.join(', ')})`;

                case 'RemoveAction':
                    return 'Deleted item(s)';

                default:
                    return `Action: ${firstAction.type}`;
            }
        }
    }
}
```

---

## 8. STM Events

### Event Listeners

```javascript
project: {
    stm: {
        autoRecord: true,

        listeners: {
            // Transactie recording gestart
            recordingStart({ stm, transaction }) {
                console.log('Recording started:', transaction);
                showRecordingIndicator();
            },

            // Transactie recording gestopt
            recordingStop({ stm, transaction, reason }) {
                console.log('Recording stopped:', reason);
                hideRecordingIndicator();

                if (reason.rejected) {
                    console.log('Transaction was rejected');
                }
            },

            // Restoring (undo/redo) gestart
            restoringStart({ stm }) {
                console.log('Restoring state...');
                showSpinner();
            },

            // Restoring afgerond
            restoringStop({ stm }) {
                console.log('State restored');
                hideSpinner();
                refreshUI();
            },

            // Queue gereset
            queueReset({ stm }) {
                console.log('Undo/redo queue was reset');
                updateUndoRedoButtons();
            },

            // Disabled state gewijzigd
            disabled({ source, disabled }) {
                console.log(`STM ${disabled ? 'disabled' : 'enabled'}`);
            }
        }
    }
}
```

### External Event Binding

```javascript
const calendar = new Calendar({
    project: {
        stm: { autoRecord: true }
    }
});

// Bind events na creatie
calendar.project.stm.on({
    recordingStart({ transaction }) {
        updateStatusBar(`Recording: ${transaction.title || 'New transaction'}`);
    },

    recordingStop({ transaction }) {
        updateStatusBar(`Saved: ${transaction.title}`);

        // Auto-save na elke transactie
        calendar.crudManager.sync();
    }
});
```

---

## 9. Queue Management

### Queue Manipulatie

```javascript
const { stm } = calendar.project;

// Reset volledige queue
stm.resetQueue();

// Reset alleen undo queue (behoud redo)
stm.resetUndoQueue();

// Reset alleen redo queue
stm.resetRedoQueue();

// Check queue status
console.log('Queue:', stm.queue);       // Transactie titels
console.log('Length:', stm.length);     // Totaal aantal transacties
console.log('Position:', stm.position); // Huidige positie
```

### Queue na Data Sync

```javascript
// Na sync met server: reset queue
calendar.crudManager.on('sync', () => {
    // Data is gesaved, reset undo history
    calendar.project.stm.resetQueue();
});

// Of behoud queue maar markeer als saved point
let savedPosition = 0;

calendar.crudManager.on('sync', () => {
    savedPosition = calendar.project.stm.position;
});

function hasUnsavedChanges() {
    return calendar.project.stm.position !== savedPosition;
}
```

---

## 10. Keyboard Shortcuts

### Enable Keyboard Undo/Redo

```javascript
const calendar = new Calendar({
    // Enable Ctrl+Z / Ctrl+Y
    enableUndoRedoKeys: true,

    project: {
        stm: { autoRecord: true }
    }
});
```

### Custom Keyboard Handling

```javascript
const calendar = new Calendar({
    project: {
        stm: { autoRecord: true }
    },

    listeners: {
        // Custom keymap
        keyMap: {
            'Ctrl+Z': 'onUndo',
            'Ctrl+Y': 'onRedo',
            'Ctrl+Shift+Z': 'onRedo',  // Mac style redo
            'Meta+Z': 'onUndo',         // Mac Command
            'Meta+Shift+Z': 'onRedo'    // Mac Command+Shift
        }
    },

    onUndo() {
        if (this.project.stm.canUndo) {
            this.project.stm.undo();
        }
    },

    onRedo() {
        if (this.project.stm.canRedo) {
            this.project.stm.redo();
        }
    }
});
```

---

## 11. Disabling STM

### Tijdelijk Uitschakelen

```javascript
const { stm } = calendar.project;

// Disable tijdens bulk operaties
stm.disable();

// Voer bulk operaties uit (worden niet getracked)
calendar.eventStore.add([...manyEvents]);
calendar.eventStore.removeAll();

// Enable weer
stm.enable();

// Alternatief: suspend/resume
stm.suspendEvents();
// ... operaties ...
stm.resumeEvents();
```

### Conditionele Tracking

```javascript
// Track alleen bepaalde wijzigingen
function trackableUpdate(callback) {
    const { stm } = calendar.project;
    const wasRecording = stm.isRecording;

    if (!wasRecording) {
        stm.startTransaction();
    }

    callback();

    if (!wasRecording) {
        stm.stopTransaction();
    }
}

// Gebruik
trackableUpdate(() => {
    calendar.eventStore.getById(1).name = 'New Name';
});
```

---

## 12. Store Registratie

### Handmatige Store Registratie

```javascript
const { stm } = calendar.project;

// Registreer een store
stm.addStore(calendar.eventStore);
stm.addStore(calendar.resourceStore);

// Check of store geregistreerd is
if (stm.hasStore(myCustomStore)) {
    console.log('Store is being tracked');
}

// Verwijder store uit tracking
stm.removeStore(myCustomStore);

// Alle geregistreerde stores
console.log('Tracked stores:', stm.stores);
```

### Custom Store Tracking

```javascript
// Extra store toevoegen aan STM
const customStore = new Store({
    data: [...]
});

// Registreer bij STM
calendar.project.stm.addStore(customStore);

// Nu worden wijzigingen aan customStore ook getracked
customStore.add({ id: 1, name: 'New Item' });

// Undo maakt ook deze wijziging ongedaan
```

---

## 13. Action Types

### Ingebouwde Action Types

```typescript
// Standaard actie types
type ActionType =
    | 'AddAction'          // Record toegevoegd
    | 'UpdateAction'       // Record gewijzigd
    | 'RemoveAction'       // Record verwijderd
    | 'InsertChildAction'  // Child record ingevoegd (tree)
    | 'RemoveChildAction'  // Child record verwijderd (tree)
    | 'ReorderChildAction' // Child records herordend (tree)
    ;
```

### Action Analyse

```javascript
project: {
    stm: {
        autoRecord: true,

        getTransactionTitle(transaction) {
            // Analyseer alle acties
            transaction.queue.forEach(action => {
                console.log('Action type:', action.type);
                console.log('Affected record:', action.record);

                if (action.type === 'UpdateAction') {
                    console.log('Old data:', action.oldData);
                    console.log('New data:', action.newData);
                }
            });

            return `${transaction.queue.length} changes`;
        }
    }
}
```

---

## 14. Integration met CrudManager

### Sync na Transactie

```javascript
const calendar = new Calendar({
    crudManager: {
        autoLoad: true,
        autoSync: false,  // Handmatige sync
        loadUrl: '/api/load',
        syncUrl: '/api/sync'
    },

    project: {
        stm: {
            autoRecord: true,

            listeners: {
                recordingStop() {
                    // Auto-sync na elke transactie
                    calendar.crudManager.sync();
                }
            }
        }
    }
});
```

### Conflict Resolution

```javascript
calendar.crudManager.on({
    syncFail({ response }) {
        // Server sync mislukt
        MessageDialog.confirm({
            title: 'Sync Failed',
            message: 'Would you like to undo the last change and try again?'
        }).then(result => {
            if (result === MessageDialog.okButton) {
                // Undo laatste wijziging
                calendar.project.stm.undo();
            }
        });
    }
});
```

---

## 15. UI Feedback

### Undo/Redo Status Indicator

```javascript
const calendar = new Calendar({
    project: {
        stm: {
            autoRecord: true,

            listeners: {
                recordingStart: 'up.onRecordingStart',
                recordingStop: 'up.onRecordingStop',
                restoringStart: 'up.onRestoringStart',
                restoringStop: 'up.onRestoringStop'
            }
        }
    },

    onRecordingStart() {
        this.widgetMap.statusLabel.html = 'Recording changes...';
    },

    onRecordingStop({ transaction }) {
        this.widgetMap.statusLabel.html = `Saved: ${transaction.title || 'Changes'}`;
        this.updateUndoRedoState();
    },

    onRestoringStart() {
        this.widgetMap.statusLabel.html = 'Restoring state...';
        this.mask('Restoring...');
    },

    onRestoringStop() {
        this.widgetMap.statusLabel.html = 'State restored';
        this.unmask();
        this.updateUndoRedoState();
    },

    updateUndoRedoState() {
        const { stm } = this.project;

        this.widgetMap.undoButton.disabled = !stm.canUndo;
        this.widgetMap.redoButton.disabled = !stm.canRedo;
        this.widgetMap.queueInfo.html = `${stm.position}/${stm.length}`;
    },

    tbar: {
        items: {
            statusLabel: {
                type: 'widget',
                html: 'Ready',
                weight: 100
            },
            queueInfo: {
                type: 'widget',
                html: '0/0',
                weight: 200
            }
        }
    }
});
```

---

## 16. Performance Considerations

### Merge Update Actions

```javascript
project: {
    stm: {
        autoRecord: true,

        // Merge meerdere updates naar zelfde model
        // in één actie per transactie
        autoRecordMergeUpdateActions: true
    }
}

// Scenario: Drag event
// Zonder merge: elke pixel beweging = aparte actie
// Met merge: alleen start en eind positie opgeslagen
```

### Memory Management

```javascript
// Beperk queue grootte
const MAX_QUEUE_SIZE = 50;

calendar.project.stm.on('recordingStop', () => {
    const { stm } = calendar.project;

    // Verwijder oude transacties
    while (stm.length > MAX_QUEUE_SIZE) {
        stm.resetUndoQueue();
    }
});
```

---

## 17. Testing Undo/Redo

### Unit Test Pattern

```javascript
describe('Undo/Redo', () => {
    let calendar, stm;

    beforeEach(() => {
        calendar = new Calendar({
            project: {
                stm: { autoRecord: true }
            },
            events: [
                { id: 1, name: 'Event 1', startDate: '2024-01-15T09:00', endDate: '2024-01-15T10:00' }
            ]
        });
        stm = calendar.project.stm;
    });

    afterEach(() => {
        calendar.destroy();
    });

    it('should undo event creation', async () => {
        // Add event
        calendar.eventStore.add({
            name: 'New Event',
            startDate: '2024-01-15T11:00',
            endDate: '2024-01-15T12:00'
        });

        // Wait for transaction to complete
        await new Promise(resolve => setTimeout(resolve, 600));

        expect(calendar.eventStore.count).toBe(2);
        expect(stm.canUndo).toBe(true);

        // Undo
        await stm.undo();

        expect(calendar.eventStore.count).toBe(1);
        expect(stm.canRedo).toBe(true);
    });

    it('should redo undone changes', async () => {
        // Make change
        calendar.eventStore.first.name = 'Modified';

        await new Promise(resolve => setTimeout(resolve, 600));

        // Undo
        await stm.undo();
        expect(calendar.eventStore.first.name).toBe('Event 1');

        // Redo
        await stm.redo();
        expect(calendar.eventStore.first.name).toBe('Modified');
    });
});
```

---

## 18. Debugging

### Debug Logging

```javascript
const calendar = new Calendar({
    project: {
        stm: {
            autoRecord: true,

            listeners: {
                recordingStart({ transaction }) {
                    console.group('STM Transaction Started');
                    console.log('Transaction:', transaction);
                },

                recordingStop({ transaction, reason }) {
                    console.log('Actions recorded:', transaction.queue.length);
                    transaction.queue.forEach((action, i) => {
                        console.log(`  ${i + 1}. ${action.type}:`, action);
                    });
                    console.log('Stop reason:', reason);
                    console.groupEnd();
                }
            }
        }
    }
});

// Debug commands
window.debugSTM = () => {
    const { stm } = calendar.project;
    return {
        position: stm.position,
        length: stm.length,
        queue: stm.queue,
        canUndo: stm.canUndo,
        canRedo: stm.canRedo,
        isRecording: stm.isRecording,
        isRestoring: stm.isRestoring,
        currentTransaction: stm.transaction,
        stores: stm.stores.map(s => s.id)
    };
};
```

---

## 19. Best Practices

### Do's

```javascript
// 1. Gebruik autoRecord voor standaard interacties
project: { stm: { autoRecord: true } }

// 2. Merge update actions voor betere performance
project: { stm: { autoRecordMergeUpdateActions: true } }

// 3. Geef duidelijke transactie titels
getTransactionTitle(transaction) {
    return describeChanges(transaction.queue);
}

// 4. Reset queue na server sync
crudManager.on('sync', () => stm.resetQueue());

// 5. Check canUndo/canRedo voor UI state
button.disabled = !stm.canUndo;
```

### Don'ts

```javascript
// 1. Niet te veel stores registreren
// Alleen stores die undo/redo nodig hebben

// 2. Geen infinite loops
stm.on('restoringStop', () => {
    // FOUT: Dit triggert weer een transactie
    calendar.eventStore.add({});
});

// 3. Transacties niet te lang open laten
// AutoRecord met timeout is beter

// 4. Queue niet onbeperkt laten groeien
// Implementeer max queue size
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| StateTrackingManagerListeners | 74237 |
| StateTrackingManagerConfig | 74381 |
| StateTrackingManager class | 74514 |
| TransactionConfig | 74804 |
| Transaction class | 74816 |
| ActionBase class | 74854 |
| UndoRedoConfig | 340830 |
| UndoRedo class | 341544 |
| UndoRedoBase class | 162546 |

---

## Relevante Examples

| Example | Beschrijving |
|---------|-------------|
| `undoredo/` | Complete undo/redo implementatie |
| `state/` | State persistence met STM |
| `basic/` | Basis setup met STM |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
