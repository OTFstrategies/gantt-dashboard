# IMPL-STATE-MANAGEMENT.md
## State Management and Persistence

**Purpose**: Implement persistent state management for UI preferences, layout configurations, and user settings across sessions.

**Products**: Grid, Calendar, Gantt, Scheduler, TaskBoard (state examples)

---

## Overview

Bryntum's State Management system automatically persists and restores widget state (column widths, sort order, filters, collapsed panels, etc.) across browser sessions. State can be stored locally in `localStorage` or remotely on a backend server.

---

## Core Concepts

### StateProvider

The `StateProvider` class manages state storage and retrieval:

```javascript
import { StateProvider } from '@bryntum/grid';

// Setup localStorage provider (default, recommended)
StateProvider.setup('local');

// Setup in-memory provider (for remote backend integration)
StateProvider.setup('memory');
```

### Stateful Widgets

Widgets become stateful by configuring:
- `stateId`: Unique identifier for the widget's state
- `stateful`: Array of properties to persist

```javascript
const grid = new Grid({
    stateId: 'mainGrid',  // Unique ID for state storage

    // Properties to persist
    stateful: ['columns', 'sort', 'filter', 'group'],

    // ... other config
});
```

---

## Local Storage State

### Basic Setup

```javascript
import { Grid, StateProvider } from '@bryntum/grid';

// Initialize localStorage provider
StateProvider.setup('local');

const grid = new Grid({
    appendTo: 'container',
    stateId: 'mainGrid',  // Key in localStorage

    features: {
        filter: true,
        group: false,
        regionResize: true
    },

    columns: [
        // Use id for column state persistence
        { id: 'first_name', text: 'First name', field: 'firstName', width: 180 },
        { id: 'surname', text: 'Surname', field: 'surName', width: 180 },
        { id: 'age', text: 'Age', field: 'age', width: 100, type: 'number' },
        { id: 'city', text: 'City', field: 'city', width: 180 }
    ],

    data: myData
});
```

### Toggle State Saving

```javascript
const stateId = 'mainGrid';

const grid = new Grid({
    stateId,

    tbar: [
        {
            type: 'slidetoggle',
            label: 'Auto save',
            value: true,
            onChange({ checked }) {
                // Toggle state persistence
                grid.stateId = checked ? stateId : null;
            }
        },
        {
            type: 'button',
            text: 'Reset to default',
            onAction() {
                // Reset to default state
                grid.resetDefaultState();
                grid.saveState();
                Toast.show('Default state restored');
            }
        }
    ]
});
```

---

## Calendar State

Calendar supports specific stateful properties:

```javascript
import { Calendar, StateProvider } from '@bryntum/calendar';

StateProvider.setup('local');

const calendar = new Calendar({
    date: new Date(2024, 9, 12),

    // Persist current date across sessions
    stateful: ['date'],
    stateId: 'mainCalendar',

    sidebar: {
        // Persist sidebar collapse state
        stateful: ['collapsed']
    },

    tbar: {
        items: {
            resetState: {
                text: 'Reset to default',
                onClick: 'up.onResetStateClicked'
            },
            toggleNonWorking: {
                type: 'slidetoggle',
                label: 'Hide non working days',
                onChange: 'up.onHideNonWorkingDaysToggle'
            }
        }
    },

    onResetStateClicked() {
        this.resetDefaultState();
        this.widgetMap.toggleNonWorking.checked = this.hideNonWorkingDays;
    },

    onHideNonWorkingDaysToggle({ checked }) {
        this.hideNonWorkingDays = checked;
    }
});
```

---

## Remote Backend State

### BackendState Class

For server-side state storage:

```javascript
import { AjaxHelper, AsyncHelper, StateProvider } from '@bryntum/grid';

class BackendState {
    constructor(stateProvider) {
        this.stateProvider = stateProvider;
    }

    async init() {
        // Load state from server
        const response = await AjaxHelper.get('api/state.json');
        this.stateProvider.data = await response.json();

        // Start listening for changes after loading
        this.stateProvider.on({
            save: this.onSave.bind(this)
        });
    }

    onSave() {
        // Capture state data for saving
        this.stateData = this.stateProvider.data;

        if (!this.saving) {
            this.save().catch(err => console.warn('Failed to persist state', err));
        }
    }

    async save() {
        this.saving = true;

        try {
            while (this.stateData) {
                // Save pending changes
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
        // POST to your backend
        await AjaxHelper.post('api/state', data);

        // Or with debounce
        await AsyncHelper.sleep(250);
    }
}
```

### Initialization with Remote State

```javascript
function launch() {
    const grid = new Grid({
        stateId: 'mainGrid',
        // ... grid config
    });
}

// Check for remote state mode
const url = new URL(window.location);
if (url.searchParams.get('state') === 'remote') {
    // Remote state: load before creating widgets
    const backendState = new BackendState(StateProvider.setup('memory'));
    backendState.init().then(launch);
}
else {
    // Local state: simple setup
    StateProvider.setup('local');
    launch();
}
```

---

## Stateful Properties by Component

### Grid

```javascript
const grid = new Grid({
    stateId: 'dataGrid',
    stateful: [
        'columns',      // Column widths, order, visibility
        'sort',         // Sort configuration
        'filter',       // Active filters
        'group',        // Grouping configuration
        'subGrids',     // Locked/normal region widths
        'scroll'        // Scroll position
    ]
});
```

### Gantt

```javascript
const gantt = new Gantt({
    stateId: 'projectGantt',
    stateful: [
        'columns',      // Column configuration
        'zoomLevel',    // Timeline zoom
        'viewPreset',   // View preset
        'scroll',       // Scroll position
        'subGrids'      // Panel sizes
    ]
});
```

### Calendar

```javascript
const calendar = new Calendar({
    stateId: 'teamCalendar',
    stateful: [
        'date',         // Current date
        'mode',         // View mode (day, week, month)
        'sidebar'       // Sidebar state
    ],
    sidebar: {
        stateful: ['collapsed']
    }
});
```

### Scheduler

```javascript
const scheduler = new Scheduler({
    stateId: 'resourceScheduler',
    stateful: [
        'columns',
        'zoomLevel',
        'viewPreset',
        'barMargin',
        'resourceMargin'
    ]
});
```

---

## Column State Requirements

For column state to persist, columns need unique identifiers:

```javascript
columns: [
    // Use 'id' for state tracking
    { id: 'name', field: 'name', text: 'Name', width: 200 },
    { id: 'status', field: 'status', text: 'Status', width: 120 },

    // Without id, state won't persist for this column
    { field: 'temporary', text: 'Temporary' }  // No persistence
]
```

---

## State Events

### StateProvider Events

```javascript
const stateProvider = StateProvider.instance;

stateProvider.on({
    // Fired when any widget saves state
    save({ stateIds }) {
        console.log('State saved for:', stateIds);
    },

    // Fired when state is cleared
    clear() {
        console.log('State cleared');
    }
});
```

### Widget State Events

```javascript
grid.on({
    // Before state is saved
    beforeSaveState({ state }) {
        console.log('Saving state:', state);
        // Can modify state before saving
    },

    // After state is restored
    restoreState({ state }) {
        console.log('State restored:', state);
    }
});
```

---

## URL-Based State

Combine state with URL parameters:

```javascript
import { StateProvider } from '@bryntum/grid';

class UrlStateProvider {
    constructor(stateProvider) {
        this.stateProvider = stateProvider;
        this.syncFromUrl();

        // Listen for state changes
        this.stateProvider.on({
            save: () => this.syncToUrl()
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => this.syncFromUrl());
    }

    syncFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const state = params.get('state');

        if (state) {
            try {
                this.stateProvider.data = JSON.parse(atob(state));
            }
            catch (e) {
                console.warn('Invalid state in URL');
            }
        }
    }

    syncToUrl() {
        const stateData = this.stateProvider.data;
        const encoded = btoa(JSON.stringify(stateData));

        const url = new URL(window.location);
        url.searchParams.set('state', encoded);

        history.replaceState(null, '', url);
    }
}
```

---

## Best Practices

### 1. State Must Be Ready at Launch

```javascript
// WRONG - state loaded after widget creation causes flicker
StateProvider.setup('memory');
const grid = new Grid({ stateId: 'grid' });
fetchState().then(data => StateProvider.instance.data = data);

// RIGHT - load state before creating widgets
async function init() {
    const stateProvider = StateProvider.setup('memory');
    const response = await fetch('api/state');
    stateProvider.data = await response.json();

    // Now create widgets
    const grid = new Grid({ stateId: 'grid' });
}
```

### 2. Device-Specific State

```javascript
// Use device type in stateId for device-specific settings
function getStateId(base) {
    const device = /Mobile|Android/.test(navigator.userAgent) ? 'mobile' : 'desktop';
    return `${base}_${device}`;
}

const grid = new Grid({
    stateId: getStateId('mainGrid')
});
```

### 3. Versioned State

Handle state schema changes:

```javascript
const STATE_VERSION = 2;

class VersionedStateProvider {
    constructor(stateProvider) {
        this.stateProvider = stateProvider;
    }

    async init() {
        const data = this.stateProvider.data;

        if (!data || data._version !== STATE_VERSION) {
            // Clear outdated state
            this.stateProvider.clear();
            this.stateProvider.data = { _version: STATE_VERSION };
        }
    }
}
```

### 4. Selective State Clearing

```javascript
// Clear state for specific widget
function clearWidgetState(stateId) {
    const data = StateProvider.instance.data;
    delete data[stateId];
    StateProvider.instance.data = data;
}

// Clear all state
StateProvider.instance.clear();
```

---

## Caveats and Considerations

### 1. State Must Be Synchronous at Widget Creation

Widgets consume state during construction, which cannot be async. Load state before creating widgets.

### 2. State vs. Settings/Preferences

State is typically device-specific (column widths may differ on mobile vs desktop). Consider storing user preferences separately.

### 3. Clearing State for Troubleshooting

Remote state won't be cleared by clearing browser data. Provide a "Reset to Default" option:

```javascript
{
    text: 'Reset to Default',
    onClick() {
        grid.resetDefaultState();
        grid.saveState();
    }
}
```

---

## Dashboard Integration

### Multi-Widget State

```javascript
StateProvider.setup('local');

const dashboard = {
    gantt: new Gantt({
        stateId: 'dashboard-gantt',
        stateful: ['columns', 'zoomLevel']
    }),

    grid: new Grid({
        stateId: 'dashboard-grid',
        stateful: ['columns', 'sort', 'filter']
    }),

    calendar: new Calendar({
        stateId: 'dashboard-calendar',
        stateful: ['date', 'mode']
    }),

    // Reset all dashboard state
    resetAll() {
        Object.values(this).forEach(widget => {
            if (widget.resetDefaultState) {
                widget.resetDefaultState();
                widget.saveState();
            }
        });
    }
};
```

### Synchronized State Updates

```javascript
// Sync zoom level across components
gantt.on({
    beforeSaveState({ state }) {
        // Also update scheduler zoom
        if (state.zoomLevel !== undefined) {
            scheduler.zoomLevel = state.zoomLevel;
        }
    }
});
```

---

## API Reference

### StateProvider Methods

| Method | Description |
|--------|-------------|
| `setup(type)` | Initialize provider ('local' or 'memory') |
| `clear()` | Clear all stored state |
| `getValue(key)` | Get specific state value |
| `setValue(key, value)` | Set specific state value |

### Widget State Methods

| Method | Description |
|--------|-------------|
| `saveState()` | Manually save current state |
| `resetDefaultState()` | Reset to initial configuration |
| `restoreState(state)` | Restore from state object |

---

## Related Documentation

- **IMPL-WEBSOCKET-SYNC.md**: Real-time state sync
- **IMPL-OFFLINE-FIRST.md**: Offline state handling
- **CORE-CUSTOMIZATION.md**: Configuration patterns
