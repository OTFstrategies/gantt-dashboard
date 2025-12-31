# Grid Implementation: State Persistence

> **UI state opslaan en herstellen** met StateProvider, localStorage, backend storage, en column state management.

---

## Overzicht

Bryntum Grid/Gantt kan UI state automatisch opslaan en herstellen, inclusief column breedte, sortering, filtering, en meer.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                                    [Auto save: ON] [Reset to default]│
├──────────────────────────────────────────────────────────────────────────┤
│  First name ▼  │  Age  │  City         │  Food            │              │
│  (sorted)      │(width │(reordered)    │(filter: "Pizza") │              │
│                │changed)│               │                  │              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                    ┌────────────────────────────────┐                    │
│                    │      STATE PERSISTENCE         │                    │
│                    ├────────────────────────────────┤                    │
│                    │ ✓ Column widths                │                    │
│                    │ ✓ Column order                 │                    │
│                    │ ✓ Sort configuration           │                    │
│                    │ ✓ Filter settings              │                    │
│                    │ ✓ Group settings               │                    │
│                    │ ✓ Scroll position              │                    │
│                    │ ✓ Region sizes                 │                    │
│                    │ ✓ Collapsed state              │                    │
│                    └────────────────────────────────┘                    │
│                              ▼                                           │
│            ┌────────────────────────────────────────────┐               │
│            │  localStorage   │   Backend Server         │               │
│            │  (default)      │   (custom)               │               │
│            └────────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basic State Persistence (localStorage)

### 1.1 Simple Setup

```javascript
import { Grid, StateProvider, DataGenerator } from '@bryntum/grid';

// Setup state provider (call before creating widgets)
StateProvider.setup('local');

const grid = new Grid({
    appendTo: 'container',

    // Unique key for state storage
    stateId: 'mainGrid',

    features: {
        filter: true,
        group: false,
        regionResize: true
    },

    // Columns need IDs for state persistence
    columns: [
        { id: 'first_name', text: 'First name', field: 'firstName', width: 180, locked: true },
        { id: 'surname', text: 'Surname', field: 'surName', width: 180, locked: true },
        { id: 'age', text: 'Age', field: 'age', width: 100, type: 'number' },
        { id: 'city', text: 'City', field: 'city', width: 180 },
        { id: 'food', text: 'Food', field: 'food', width: 180 },
        { id: 'color', text: 'Color', field: 'color', width: 180 }
    ],

    data: DataGenerator.generateData(50)
});
```

### 1.2 Toggle Auto-Save

```javascript
const stateId = 'mainGrid';

const grid = new Grid({
    appendTo: 'container',
    stateId,

    tbar: [
        {
            type: 'slidetoggle',
            ref: 'autoSaveCheckbox',
            label: 'Auto save',
            value: true,
            onChange({ checked }) {
                // Toggle state persistence on/off
                grid.stateId = checked ? stateId : null;
            }
        }
    ]
});
```

### 1.3 Reset to Default State

```javascript
tbar: [
    {
        type: 'button',
        ref: 'resetButton',
        color: 'b-red',
        icon: 'fa fa-times',
        text: 'Reset to default',
        tooltip: 'Resets application to the default state',
        onAction() {
            // Restore default configuration
            grid.resetDefaultState();

            // Persist the reset state
            grid.saveState();

            Toast.show('Default state restored');
        }
    }
]
```

---

## 2. Backend State Storage

### 2.1 BackendState Class

```javascript
import { AjaxHelper, AsyncHelper, StateProvider } from '@bryntum/grid';

class BackendState {
    constructor(stateProvider) {
        this.stateProvider = stateProvider;
        this.saving = false;
        this.stateData = null;
    }

    async init() {
        // Load state from server
        const response = await AjaxHelper.get('/api/state');
        this.stateProvider.data = await response.json();

        // Start listening for changes after data is loaded
        this.stateProvider.on({
            save: this.onSave.bind(this)
        });
    }

    onSave() {
        // Capture data to save
        this.stateData = this.stateProvider.data;

        // Start save if not already running
        if (!this.saving) {
            this.save().catch(err =>
                console.warn('Failed to persist state', err)
            );
        }
    }

    async save() {
        this.saving = true;

        try {
            // Keep saving until all changes are persisted
            while (this.stateData) {
                const data = this.stateData;
                this.stateData = null;
                await this.saveChanges(data);
            }
        }
        finally {
            this.saving = false;
        }
    }

    async saveChanges(data) {
        // Save to backend
        await AjaxHelper.post('/api/state', {
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
```

### 2.2 Remote State Initialization

```javascript
function launch() {
    const grid = new Grid({
        appendTo: 'container',
        stateId: 'mainGrid',
        // ... configuration
    });
}

// Check URL parameter for remote state mode
const url = new URL(window.location);
const useRemoteState = url.searchParams.get('state') === 'remote';

if (useRemoteState) {
    // For server-side state: load state before creating widgets
    const stateProvider = StateProvider.setup('memory');
    const backendState = new BackendState(stateProvider);

    backendState.init().then(launch);
}
else {
    // For localStorage (default)
    StateProvider.setup('local');
    launch();
}
```

---

## 3. Gantt State Persistence

### 3.1 Gantt Setup met State

```javascript
import { Gantt, StateProvider, Toast } from '@bryntum/gantt';

StateProvider.setup('local');

const stateId = 'mainGantt';

const gantt = new Gantt({
    appendTo: 'container',
    dependencyIdField: 'sequenceNumber',

    // State ID for persistence
    stateId,

    // Fixed dates to prevent state override
    startDate: new Date(2024, 0, 13),
    endDate: new Date(2024, 2, 24),

    features: {
        filter: true
    },

    project: {
        autoSetConstraints: true,
        autoLoad: true,
        transport: {
            load: { url: '/api/project' }
        }
    },

    // Columns need IDs for state persistence
    columns: [
        { id: 'name', type: 'name', width: 250 },
        { id: 'startDate', type: 'startdate', width: 150 },
        { id: 'duration', type: 'duration', width: 150 },
        { id: 'predecessors', type: 'predecessor', width: 150 }
    ],

    tbar: [
        {
            type: 'slidetoggle',
            label: 'Auto save',
            value: true,
            onChange({ checked }) {
                gantt.stateId = checked ? stateId : null;
            }
        },
        {
            type: 'button',
            icon: 'fa fa-times',
            text: 'Reset to default',
            onAction() {
                gantt.resetDefaultState();
                Toast.show('Default state restored');
            }
        }
    ]
});
```

---

## 4. State Provider Types

### 4.1 LocalStorage Provider (Default)

```javascript
import { StateProvider } from '@bryntum/grid';

// Uses browser localStorage
StateProvider.setup('local');

// State is persisted to:
// localStorage['bryntum-state'] = { "mainGrid": {...} }
```

### 4.2 Memory Provider (for Backend)

```javascript
// Uses in-memory storage (no automatic persistence)
const stateProvider = StateProvider.setup('memory');

// You must handle persistence manually
stateProvider.on({
    save({ stateIds }) {
        // stateIds: array of changed state keys
        const data = stateProvider.data;
        saveToBackend(data);
    }
});
```

### 4.3 Custom Provider

```javascript
import { StateProvider } from '@bryntum/grid';

class CustomStateProvider extends StateProvider {
    constructor(config) {
        super(config);
        this.storageKey = config.storageKey || 'app-state';
    }

    // Override to load from custom storage
    getValue(stateId) {
        const stored = sessionStorage.getItem(this.storageKey);
        if (stored) {
            const data = JSON.parse(stored);
            return data[stateId];
        }
        return null;
    }

    // Override to save to custom storage
    setValue(stateId, value) {
        const stored = sessionStorage.getItem(this.storageKey);
        const data = stored ? JSON.parse(stored) : {};
        data[stateId] = value;
        sessionStorage.setItem(this.storageKey, JSON.stringify(data));
    }
}

// Use custom provider
const provider = new CustomStateProvider({
    storageKey: 'my-app-state'
});
StateProvider.instance = provider;
```

---

## 5. What State is Persisted

### 5.1 Grid State Properties

| Property | Description |
|----------|-------------|
| `columns` | Width, hidden, locked, order |
| `sorters` | Sort configuration |
| `filters` | Filter settings per column |
| `groupers` | Group configuration |
| `scroll` | Scroll position (x, y) |
| `subGrids` | Region widths |
| `selectedCell` | Current cell selection |
| `store.groupers` | Store-level grouping |

### 5.2 Gantt Additional State

| Property | Description |
|----------|-------------|
| `timeAxis` | Visible date range |
| `zoomLevel` | Current zoom preset |
| `subGrids` | Locked/normal region sizes |

### 5.3 Column State Requirements

```javascript
// Columns MUST have id for state persistence
columns: [
    // Good: explicit id
    { id: 'first_name', text: 'First name', field: 'firstName', width: 180 },

    // Bad: no id (state won't persist correctly)
    { text: 'Age', field: 'age', width: 100 }
]
```

---

## 6. Programmatic State Control

### 6.1 Manual State Operations

```javascript
// Save current state
grid.saveState();

// Get current state as object
const state = grid.state;
console.log('Current state:', state);

// Set state programmatically
grid.state = {
    columns: [
        { id: 'first_name', width: 200 },
        { id: 'age', hidden: true }
    ],
    sorters: [
        { field: 'firstName', ascending: true }
    ]
};

// Reset to defaults
grid.resetDefaultState();
```

### 6.2 State Events

```javascript
const stateProvider = StateProvider.instance;

stateProvider.on({
    save({ stateIds }) {
        console.log('State changed for:', stateIds);
        // stateIds = ['mainGrid'] when grid state changes
    }
});

// Widget-level state change
grid.on({
    stateChange({ state }) {
        console.log('Grid state changed:', state);
    }
});
```

---

## 7. Important Considerations

### 7.1 State Must Be Ready at Launch

```javascript
/*
 * IMPORTANT: State must be available before widgets are created.
 * Widgets consume state during construction.
 */

// WRONG: Loading state after widget creation
const grid = new Grid({ stateId: 'mainGrid' });
loadStateFromServer().then(state => {
    grid.state = state;  // This causes flicker!
});

// CORRECT: Load state before widget creation
loadStateFromServer().then(state => {
    StateProvider.instance.data = state;
    const grid = new Grid({ stateId: 'mainGrid' });
});
```

### 7.2 Device-Specific State

```javascript
// Different state per device type
function getStateId(baseId) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isTablet = window.matchMedia('(max-width: 1024px)').matches;

    if (isMobile) return `${baseId}-mobile`;
    if (isTablet) return `${baseId}-tablet`;
    return `${baseId}-desktop`;
}

const grid = new Grid({
    stateId: getStateId('mainGrid'),
    // ...
});
```

### 7.3 Clearing Problematic State

```javascript
// Clear all stored state
localStorage.removeItem('bryntum-state');

// Clear state for specific widget
const stateProvider = StateProvider.instance;
delete stateProvider.data.mainGrid;

// Or reset via widget
grid.resetDefaultState();
grid.saveState();
```

---

## 8. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { StateProvider } from '@bryntum/grid';
import { useState, useEffect } from 'react';

// Setup provider once at app start
StateProvider.setup('local');

function StatefulGrid({ data }) {
    const [autoSave, setAutoSave] = useState(true);
    const stateId = 'mainGrid';

    const handleReset = () => {
        const grid = document.querySelector('.b-grid')?.bryntum;
        if (grid) {
            grid.resetDefaultState();
            grid.saveState();
        }
    };

    const gridConfig = {
        stateId: autoSave ? stateId : null,

        features: {
            filter: true,
            regionResize: true
        },

        columns: [
            { id: 'name', text: 'Name', field: 'name', width: 200 },
            { id: 'age', text: 'Age', field: 'age', width: 100, type: 'number' },
            { id: 'city', text: 'City', field: 'city', width: 150 }
        ]
    };

    return (
        <div className="stateful-grid-wrapper">
            <div className="toolbar">
                <label>
                    <input
                        type="checkbox"
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                    />
                    Auto save state
                </label>
                <button onClick={handleReset}>
                    Reset to default
                </button>
            </div>

            <BryntumGrid
                data={data}
                {...gridConfig}
            />
        </div>
    );
}

export default StatefulGrid;
```

### 8.1 Backend State with React

```jsx
import { StateProvider, AjaxHelper } from '@bryntum/grid';
import { useState, useEffect } from 'react';

function App() {
    const [stateLoaded, setStateLoaded] = useState(false);

    useEffect(() => {
        async function loadState() {
            // Use memory provider for backend state
            const provider = StateProvider.setup('memory');

            try {
                const response = await AjaxHelper.get('/api/state');
                const state = await response.json();
                provider.data = state;

                // Subscribe to changes
                provider.on({
                    save: async () => {
                        await AjaxHelper.post('/api/state', {
                            body: JSON.stringify(provider.data),
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                });
            }
            catch (error) {
                console.warn('Failed to load state, using defaults');
            }

            setStateLoaded(true);
        }

        loadState();
    }, []);

    if (!stateLoaded) {
        return <div>Loading...</div>;
    }

    return <StatefulGrid data={gridData} />;
}
```

---

## 9. Styling

```css
/* Toolbar styling */
.b-toolbar .b-slidetoggle {
    margin-right: 16px;
}

/* Reset button styling */
.b-toolbar .b-button.b-red {
    background: #f44336;
    color: white;
}

.b-toolbar .b-button.b-red:hover {
    background: #d32f2f;
}

/* State indicator */
.state-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 16px;
    background: #4CAF50;
    color: white;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
}

.state-indicator.visible {
    opacity: 1;
}
```

---

## 10. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| State niet opgeslagen | StateProvider niet gesetup | Call `StateProvider.setup()` voor widget creatie |
| Columns state niet persisted | Geen column id | Voeg expliciete `id` toe aan alle columns |
| Flicker bij laden | Async state loading | Load state voor widget creatie |
| State niet cleared | localStorage issue | `localStorage.removeItem('bryntum-state')` |
| State overrules config | stateId actief | Zet `stateId: null` of reset state |
| Backend save fails | CORS/network | Check endpoint en headers |

---

## API Reference

### StateProvider

| Method | Description |
|--------|-------------|
| `StateProvider.setup(type)` | Initialize provider ('local', 'memory') |
| `StateProvider.instance` | Get current provider instance |
| `provider.data` | Get/set all state data |
| `provider.getValue(stateId)` | Get state for specific widget |
| `provider.setValue(stateId, value)` | Set state for specific widget |

### Widget State Methods

| Method | Description |
|--------|-------------|
| `widget.stateId` | Get/set state key |
| `widget.state` | Get/set current state |
| `widget.saveState()` | Manually save state |
| `widget.resetDefaultState()` | Reset to default configuration |

### StateProvider Events

| Event | Description |
|-------|-------------|
| `save` | Fired when state changes (debounced) |

---

## Bronnen

- **Grid Example**: `examples/state/`
- **Gantt Example**: `examples/state/`
- **StateProvider**: `Core.state.StateProvider`
- **LocalStateProvider**: `Core.state.LocalStateProvider`

---

*Priority 1: Missing Core Functionality*
