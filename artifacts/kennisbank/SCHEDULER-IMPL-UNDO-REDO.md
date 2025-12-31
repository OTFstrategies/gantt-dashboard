# SchedulerPro Implementation: Undo/Redo (STM)

## Overview

SchedulerPro uses the State Transaction Manager (STM) for undo/redo functionality:
- **Automatic Recording**: Track all data changes automatically
- **Transaction-Based**: Group related changes into single undo steps
- **Store Integration**: All project stores participate in STM
- **Keyboard Support**: Ctrl+Z / Ctrl+Y shortcuts

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                State Transaction Manager (STM)                   │
├─────────────────────────────────────────────────────────────────┤
│  Transaction Queue                                               │
│  ├── Undo queue (past transactions)                             │
│  ├── Redo queue (future transactions)                           │
│  └── Current recording transaction                              │
├─────────────────────────────────────────────────────────────────┤
│  Actions                                                         │
│  ├── AddAction (record added)                                   │
│  ├── RemoveAction (record removed)                              │
│  ├── UpdateAction (record modified)                             │
│  └── InsertChildAction (tree operations)                        │
├─────────────────────────────────────────────────────────────────┤
│  Registered Stores                                               │
│  ├── eventStore                                                  │
│  ├── resourceStore                                               │
│  ├── assignmentStore                                            │
│  ├── dependencyStore                                            │
│  └── calendarManagerStore                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Basic Configuration

### Enable STM in Project

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        // Enable STM with auto-recording
        stm: {
            autoRecord: true
        }
    }
});
```

### Access STM Instance

```javascript
// Access via project
const stm = scheduler.project.stm;

// Or directly
const stm = scheduler.stm;

// Check availability
if (stm) {
    console.log('STM is configured');
}
```

## STM Configuration Options

```javascript
project: {
    stm: {
        // Automatically record changes
        autoRecord: true,

        // Title generator for transactions
        getTransactionTitle(transaction) {
            return `Changes at ${new Date().toLocaleTimeString()}`;
        }
    },

    // Ignore remote changes in STM (useful with sync)
    ignoreRemoteChangesInSTM: true
}
```

## Basic Undo/Redo Operations

### Undo/Redo Methods

```javascript
// Undo last change
await scheduler.project.stm.undo();

// Undo multiple steps
await scheduler.project.stm.undo(3);

// Undo all
await scheduler.project.stm.undoAll();

// Redo last undone change
await scheduler.project.stm.redo();

// Redo multiple steps
await scheduler.project.stm.redo(3);

// Redo all
await scheduler.project.stm.redoAll();
```

### Check Availability

```javascript
const stm = scheduler.project.stm;

// Check if undo is available
if (stm.canUndo) {
    console.log('Can undo');
}

// Check if redo is available
if (stm.canRedo) {
    console.log('Can redo');
}

// Get queue length
console.log('Undo steps:', stm.length);
console.log('Current position:', stm.position);

// Get transaction titles
console.log('Transactions:', stm.queue);
```

## Keyboard Shortcuts

```javascript
const scheduler = new SchedulerPro({
    features: {
        cellEdit: {
            // Enable Ctrl+Z/Y in grid
            undoRedoOnKey: true
        }
    },

    // Global keyboard handling
    keyMap: {
        'Ctrl+Z': () => scheduler.project.stm.undo(),
        'Ctrl+Y': () => scheduler.project.stm.redo(),
        'Ctrl+Shift+Z': () => scheduler.project.stm.redo()
    }
});
```

## Manual Transaction Control

### Start/Stop Recording

```javascript
const stm = scheduler.project.stm;

// Start a transaction manually
stm.startTransaction('Batch Update');

// Make multiple changes...
event1.name = 'Updated 1';
event2.name = 'Updated 2';
event3.remove();

// Stop and commit the transaction
stm.stopTransaction();

// Now all changes are one undo step
```

### Reject Transaction

```javascript
stm.startTransaction('Tentative Changes');

// Make changes...
event.name = 'New Name';

// Decide to cancel
stm.rejectTransaction();  // Changes are reverted
```

### Disable/Enable STM

```javascript
// Disable temporarily
stm.disable();

// Make changes that won't be tracked
event.name = 'Not tracked';

// Re-enable
stm.enable();

// Check disabled state
console.log('Disabled:', stm.disabled);
```

## Queue Management

### Reset Queue

```javascript
// Reset entire queue
stm.resetQueue();

// Reset only redo queue
stm.resetRedoQueue();

// Reset only undo queue
stm.resetUndoQueue();
```

### Merge Update Actions

```javascript
// Merge multiple updates to same model into one action
stm.mergeTransactionUpdateActions();
```

## STM Events

```javascript
const stm = scheduler.project.stm;

stm.on({
    // Recording started
    recordingStart({ stm, transaction }) {
        console.log('Started recording:', transaction);
    },

    // Recording stopped
    recordingStop({ stm, transaction, reason }) {
        console.log('Stopped recording:', transaction);
        console.log('Reason:', reason);  // stop, disabled, rejected
    },

    // Restoring started (undo/redo in progress)
    restoringStart({ stm }) {
        console.log('Restoring state...');
    },

    // Restoring completed
    restoringStop({ stm }) {
        console.log('State restored');
    },

    // Queue was reset
    queueReset({ stm }) {
        console.log('Queue reset');
    },

    // Disabled state changed
    disabled({ stm, disabled }) {
        console.log('STM disabled:', disabled);
    }
});
```

## Store Registration

### Auto-Registration

ProjectModel automatically registers its stores:

```javascript
// These stores are automatically registered
console.log(stm.stores);
// eventStore, resourceStore, assignmentStore, dependencyStore, etc.
```

### Manual Store Registration

```javascript
// Add custom store
stm.addStore(myCustomStore);

// Check if store is registered
if (stm.hasStore(myCustomStore)) {
    console.log('Store is tracked');
}

// Remove store
stm.removeStore(myCustomStore);

// Iterate all stores
stm.forEachStore((store, id) => {
    console.log(`Store ${id}:`, store);
});
```

## Integration with Sync

```javascript
project: {
    loadUrl: '/api/project/load',
    syncUrl: '/api/project/sync',

    // Don't track server-applied changes
    ignoreRemoteChangesInSTM: true,

    stm: {
        autoRecord: true
    },

    listeners: {
        // Clear undo queue after sync
        sync() {
            scheduler.project.stm.resetQueue();
        }
    }
}
```

## Toolbar Integration

```javascript
const scheduler = new SchedulerPro({
    project: {
        stm: { autoRecord: true }
    },

    tbar: [
        {
            type: 'button',
            ref: 'undoBtn',
            icon: 'b-icon b-icon-undo',
            text: 'Undo',
            disabled: true,
            onClick() {
                scheduler.project.stm.undo();
            }
        },
        {
            type: 'button',
            ref: 'redoBtn',
            icon: 'b-icon b-icon-redo',
            text: 'Redo',
            disabled: true,
            onClick() {
                scheduler.project.stm.redo();
            }
        }
    ],

    listeners: {
        // Keep buttons synced with STM state
        stmChange() {
            const stm = scheduler.project.stm;
            scheduler.widgetMap.undoBtn.disabled = !stm.canUndo;
            scheduler.widgetMap.redoBtn.disabled = !stm.canRedo;
        }
    }
});

// Listen to STM events for button state
scheduler.project.stm.on({
    recordingStop: () => scheduler.trigger('stmChange'),
    restoringStop: () => scheduler.trigger('stmChange'),
    queueReset: () => scheduler.trigger('stmChange')
});
```

## UndoRedo Widget

Bryntum provides a built-in UndoRedo widget:

```javascript
const scheduler = new SchedulerPro({
    tbar: [
        {
            type: 'undoredo',
            // Widget automatically binds to project.stm
            project: 'up.project',

            // Show transaction count badges
            showZeroActionBadge: true,

            // Button customization
            items: {
                undoBtn: {
                    color: 'b-blue'
                },
                redoBtn: {
                    color: 'b-green'
                }
            }
        }
    ]
});
```

## Complete Example

```javascript
import { SchedulerPro, DateHelper } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        loadUrl: '/api/project/load',
        syncUrl: '/api/project/sync',
        autoLoad: true,

        // Enable STM
        stm: {
            autoRecord: true,

            // Custom transaction titles
            getTransactionTitle(transaction) {
                const actions = transaction.actions || [];
                if (actions.length === 1) {
                    const action = actions[0];
                    if (action.type === 'UpdateAction') {
                        return `Update ${action.model.name}`;
                    }
                    if (action.type === 'AddAction') {
                        return `Add ${action.model.name}`;
                    }
                    if (action.type === 'RemoveAction') {
                        return `Delete ${action.model.name}`;
                    }
                }
                return `${actions.length} changes`;
            }
        },

        // Ignore server changes
        ignoreRemoteChangesInSTM: true
    },

    tbar: [
        // Built-in UndoRedo widget
        {
            type: 'undoredo',
            project: 'up.project',
            showZeroActionBadge: false,
            items: {
                transactionsBtn: {
                    // Show transaction history dropdown
                    hidden: false
                }
            }
        },
        '-',
        {
            type: 'button',
            text: 'Group Changes',
            onClick() {
                groupedEdit();
            }
        },
        {
            type: 'button',
            text: 'Clear History',
            onClick() {
                scheduler.project.stm.resetQueue();
            }
        }
    ],

    // Keyboard shortcuts
    keyMap: {
        'Ctrl+Z': {
            handler: () => scheduler.project.stm.undo(),
            description: 'Undo last change'
        },
        'Ctrl+Y': {
            handler: () => scheduler.project.stm.redo(),
            description: 'Redo last undone change'
        },
        'Ctrl+Shift+Z': {
            handler: () => scheduler.project.stm.redo(),
            description: 'Redo (alternative)'
        }
    },

    listeners: {
        // Log undo/redo activity
        afterEventEdit({ eventRecord }) {
            console.log('Event edited:', eventRecord.name);
        }
    }
});

// Group multiple changes into single undo step
async function groupedEdit() {
    const stm = scheduler.project.stm;
    const events = scheduler.eventStore.records.slice(0, 5);

    // Start transaction
    stm.startTransaction('Batch Status Update');

    try {
        // Make multiple changes
        for (const event of events) {
            event.status = 'completed';
        }

        // Commit
        stm.stopTransaction();
    } catch (error) {
        // Rollback on error
        stm.rejectTransaction();
        console.error('Batch update failed:', error);
    }
}

// Monitor STM state
scheduler.project.stm.on({
    recordingStart({ transaction }) {
        console.log('Recording:', transaction);
    },

    recordingStop({ transaction, reason }) {
        if (reason.stop) {
            console.log('Recorded:', transaction.title || 'Untitled');
        } else if (reason.rejected) {
            console.log('Transaction rejected');
        }
    },

    restoringStart() {
        // Show loading indicator
        scheduler.maskBody('Restoring...');
    },

    restoringStop() {
        scheduler.unmaskBody();
        updateStatusBar();
    }
});

function updateStatusBar() {
    const stm = scheduler.project.stm;
    document.getElementById('stmStatus').textContent =
        `Undo: ${stm.position} | Redo: ${stm.length - stm.position}`;
}
```

## CSS for UndoRedo

```css
/* UndoRedo widget styling */
.b-undoredo .b-button {
    min-width: 80px;
}

.b-undoredo .b-badge {
    background-color: #007bff;
    color: white;
    font-size: 10px;
}

/* Disabled state */
.b-undoredo .b-button:disabled {
    opacity: 0.5;
}

/* Transaction history dropdown */
.b-transactions-menu {
    max-height: 300px;
    overflow-y: auto;
}

.b-transactions-menu .b-menuitem {
    font-size: 12px;
}

/* Current position indicator */
.b-transactions-menu .b-current {
    font-weight: bold;
    background-color: rgba(0, 123, 255, 0.1);
}
```

## Best Practices

1. **Enable autoRecord**: Most use cases benefit from automatic recording
2. **Use Transactions**: Group related changes into logical units
3. **ignoreRemoteChangesInSTM**: Prevent server data from being undoable
4. **Keyboard Shortcuts**: Always provide Ctrl+Z/Y support
5. **Visual Feedback**: Update UI to reflect undo/redo availability
6. **Reset After Sync**: Consider clearing queue after saving to server
7. **Error Handling**: Use rejectTransaction() for failed operations

## API Reference Links

- [StateTrackingManager](https://bryntum.com/products/schedulerpro/docs/api/Core/data/stm/StateTrackingManager)
- [Transaction](https://bryntum.com/products/schedulerpro/docs/api/Core/data/stm/Transaction)
- [ProjectModel stm config](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/ProjectModel#config-stm)
- [UndoRedo Widget](https://bryntum.com/products/schedulerpro/docs/api/Core/widget/UndoRedo)
