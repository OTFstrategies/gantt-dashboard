# Calendar Implementation: State Persistence

> **Fase 6** - Implementatiegids voor state persistence in Calendar: StateProvider, stateful widgets, localStorage, backend state, en state events.

---

## Overzicht

De Bryntum Calendar ondersteunt automatische state persistence via de StateProvider. Widgets kunnen configureren welke properties opgeslagen moeten worden en automatisch hersteld worden bij volgende sessies.

### State Componenten

| Component | Beschrijving |
|-----------|-------------|
| **StateProvider** | Core manager voor state storage |
| **StateStorage** | Abstracte storage interface |
| **State Mixin** | Mixin voor stateful widgets |
| **LocalStorage** | Standaard browser localStorage |
| **MemoryStorage** | In-memory storage (voor backend) |

---

## 1. TypeScript Interfaces

### StateProviderConfig (line 81049)

```typescript
// Bron: calendar.d.ts line 81049
type StateProviderListeners = {
    // State opgeslagen
    save?: ((event: {
        source: StateProvider;
        stateIds: string[];
        saved: StateClass[]
    }) => void) | string;

    // Item toegevoegd/gewijzigd
    set?: ((event: {
        source: StateProvider;
        key: string;
        value: any;
        was: any
    }) => void) | string;

    // Item verwijderd
    remove?: ((event: {
        source: StateProvider;
        key: string;
        was: any
    }) => void) | string;
};
```

### StateProvider Class (line 81204)

```typescript
// Bron: calendar.d.ts line 81204
export class StateProvider {
    // Singleton instance
    static instance: StateProvider;
    static readonly isEvents: boolean;

    // Properties
    data: object;
    storage: StateStorage;
    readonly isEvents: boolean;

    // Static methods
    static setup(inst: 'local' | 'memory' | StateProvider): StateProvider;

    // Instance methods
    getValue(key: string): object;
    setValue(key: string, value: object): StateProvider;
    clear(): StateProvider;

    // Event methods
    addListener(config: BryntumListenerConfig | string, thisObj?: object | Function): Function;
    on(config: BryntumListenerConfig | string, thisObj?: object | Function): Function;
    removeListener(config: object | string, thisObj: object | Function): boolean;
    un(config: object | string, thisObj?: object | Function): boolean;

    // Events
    onSave: ((event: { source: StateProvider; stateIds: string[]; saved: StateClass[] }) => void) | string;
    onSet: ((event: { source: StateProvider; key: string; value: any; was: any }) => void) | string;
    onRemove: ((event: { source: StateProvider; key: string; was: any }) => void) | string;
}
```

### StateClassConfig (line 80886)

```typescript
// Bron: calendar.d.ts line 80886
type StateClassConfig = {
    // Unieke identifier voor state storage
    stateId?: string;

    // StateProvider instance (default: StateProvider.instance)
    stateProvider?: StateProvider;

    // Properties die opgeslagen worden
    // true = alle stateful properties
    // string[] = specifieke properties
    // object = property name → true/false
    stateful?: boolean | object | string[];

    // Events die state save triggeren
    statefulEvents?: object | string[];

    // Lifecycle events
    onBeforeStateApply?: ((event: { state: any }) => Promise<boolean> | boolean | void) | string;
    onBeforeStateSave?: ((event: { state: any }) => Promise<boolean> | boolean | void) | string;
};
```

### StateClass (line 80929)

```typescript
// Bron: calendar.d.ts line 80929
export class StateClass {
    static readonly isState: boolean;
    readonly isState: boolean;
    readonly isStateful: boolean;

    // State property
    state: any;

    // Methods
    getState(): object;
    applyState(state: object): void;
    loadState(stateId?: string, reload?: boolean): void;
    saveState(options?: { id?: string; immediate?: boolean } | string): void;
}
```

### StateStorage Class (line 81381)

```typescript
// Bron: calendar.d.ts line 81381
export class StateStorage {
    // Properties
    data: object;
    keys: string[];

    // Methods
    getItem(key: string): any;
    setItem(key: string, value: any): void;
    removeItem(key: string): void;
    clear(): void;
}
```

---

## 2. StateProvider Setup

### LocalStorage (Standaard)

```javascript
// Bron: examples/state/app.module.js
import { Calendar, StateProvider } from '@bryntum/calendar';

// Setup StateProvider met localStorage
StateProvider.setup('local');

const calendar = new Calendar({
    appendTo: 'container',
    date: new Date(2024, 0, 15),

    // Sla datum op tussen sessies
    stateful: ['date'],
    stateId: 'mainCalendar'
});
```

### Memory Storage (Backend)

```javascript
// Voor server-side state persistence
StateProvider.setup('memory');

// Of met custom instance
const provider = StateProvider.setup('memory');

// Laad state van server
const response = await fetch('/api/state');
provider.data = await response.json();

// Nu Calendar creëren
const calendar = new Calendar({
    stateful: ['date', 'mode'],
    stateId: 'mainCalendar'
});
```

### Custom StateProvider

```javascript
// Custom state provider met custom storage
const customProvider = new StateProvider({
    storage: new CustomStorage()  // Eigen storage implementatie
});

StateProvider.instance = customProvider;

// Of per widget
const calendar = new Calendar({
    stateProvider: customProvider,
    stateful: true
});
```

---

## 3. Stateful Calendar Configuratie

### Basis Stateful Setup

```javascript
// Bron: examples/state/app.module.js
const calendar = new Calendar({
    date: new Date(2024, 0, 15),

    // Properties die opgeslagen worden
    stateful: ['date'],

    // Unieke key voor deze calendar
    stateId: 'mainCalendar',

    // Sidebar ook stateful
    sidebar: {
        stateful: ['collapsed']
    }
});
```

### Uitgebreide Stateful Configuratie

```javascript
const calendar = new Calendar({
    stateId: 'myCalendar',

    // Alle beschikbare stateful properties
    stateful: [
        'date',              // Huidige datum
        'mode',              // Actieve view mode
        'hideNonWorkingDays',// Weekend verbergen
        'autoCreate'         // Auto-create instellingen
    ],

    // Events die state save triggeren
    statefulEvents: [
        'dateChange',
        'modeChange',
        'changeHideNonWorkingDays'
    ],

    // Sidebar state
    sidebar: {
        stateId: 'calendarSidebar',
        stateful: ['collapsed', 'width']
    },

    // Per-view state
    modes: {
        week: {
            stateId: 'weekView',
            stateful: ['dayStartTime', 'dayEndTime', 'hourHeight']
        },
        month: {
            stateId: 'monthView',
            stateful: ['sixWeeks', 'showWeekColumn']
        }
    }
});
```

### Object-Based Stateful

```javascript
const calendar = new Calendar({
    stateId: 'calendar',

    // Object syntax voor fijne controle
    stateful: {
        date: true,
        mode: true,
        hideNonWorkingDays: true,
        // Expliciet uitsluiten
        sidebar: false
    }
});
```

---

## 4. State Opslaan en Laden

### Automatisch Opslaan

```javascript
// State wordt automatisch opgeslagen bij:
// 1. Property wijziging (als in stateful)
// 2. Event uit statefulEvents

const calendar = new Calendar({
    stateful: ['date', 'mode'],
    statefulEvents: ['dateChange', 'modeChange']
});

// Wijziging triggert auto-save
calendar.date = new Date(2024, 0, 20);  // → State saved
calendar.mode = 'month';                 // → State saved
```

### Handmatig Opslaan

```javascript
// Forceer state save
calendar.saveState();

// Met custom stateId
calendar.saveState({ id: 'backup-state' });

// Immediate (skip debounce)
calendar.saveState({ immediate: true });
```

### State Laden

```javascript
// Herlaad state van provider
calendar.loadState();

// Met andere stateId
calendar.loadState('backup-state');

// Force reload (ook als al geladen)
calendar.loadState(null, true);
```

### State Resetten

```javascript
// Bron: examples/state/app.module.js
const calendar = new Calendar({
    tbar: {
        items: {
            resetState: {
                text: 'Reset to default',
                onClick: 'up.onResetStateClicked'
            }
        }
    },

    onResetStateClicked() {
        // Reset naar default waarden
        this.resetDefaultState();

        // Update UI indien nodig
        this.widgetMap.toggleNonWorking.checked = this.hideNonWorkingDays;
    }
});

// Of programmatisch
StateProvider.instance.clear();  // Verwijder alle state
calendar.loadState(null, true);  // Herlaad (krijgt defaults)
```

---

## 5. Backend State Persistence

### Backend State Class

```javascript
// Bron: examples/state/app.module.js
class BackendState {
    constructor(stateProvider) {
        this.stateProvider = stateProvider;
    }

    async init() {
        // Laad state van backend
        const response = await AjaxHelper.get('/api/state');
        this.stateProvider.data = await response.json();

        // Luister naar wijzigingen
        this.stateProvider.on({
            save: this.onSave.bind(this)
        });
    }

    onSave({ stateIds }) {
        // Buffer wijzigingen
        this.stateData = this.stateProvider.data;

        if (!this.saving) {
            this.save().catch(err => console.warn('Failed to persist state', err));
        }
    }

    async save() {
        this.saving = true;

        try {
            while (this.stateData) {
                const data = this.stateData;
                this.stateData = null;

                await this.saveChanges(data);
            }
        } finally {
            this.saving = false;
        }
    }

    async saveChanges(data) {
        await fetch('/api/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
}
```

### Backend State Gebruik

```javascript
// Initialisatie met backend state
async function launch() {
    // Setup memory provider
    const provider = StateProvider.setup('memory');

    // Laad state van server
    const backendState = new BackendState(provider);
    await backendState.init();

    // Nu Calendar creëren
    const calendar = new Calendar({
        stateful: ['date', 'mode'],
        stateId: 'mainCalendar'
    });
}

launch();
```

### Conditional Storage

```javascript
// Kies storage type op basis van URL parameter
const url = new URL(window.location);
const useRemoteState = url.searchParams.get('state') === 'remote';

if (useRemoteState) {
    // Server-side state
    const provider = StateProvider.setup('memory');
    await loadStateFromServer(provider);
} else {
    // Local storage
    StateProvider.setup('local');
}

// Dan Calendar creëren
createCalendar();
```

---

## 6. State Events

### StateProvider Events

```javascript
const provider = StateProvider.setup('local');

provider.on({
    // State item opgeslagen
    set({ key, value, was }) {
        console.log(`State '${key}' changed from`, was, 'to', value);
    },

    // State item verwijderd
    remove({ key, was }) {
        console.log(`State '${key}' removed, was:`, was);
    },

    // Meerdere items opgeslagen
    save({ stateIds, saved }) {
        console.log('Saved state for:', stateIds);

        // Sync met backend
        syncToBackend(stateIds, saved);
    }
});
```

### Widget State Events

```javascript
const calendar = new Calendar({
    stateful: ['date', 'mode'],
    stateId: 'calendar',

    listeners: {
        // Voor state wordt toegepast
        beforeStateApply({ state }) {
            console.log('About to apply state:', state);

            // Modificeer state indien nodig
            if (!state.date) {
                state.date = new Date();
            }

            // Return false om te annuleren
            if (state.invalid) {
                return false;
            }
        },

        // Voor state wordt opgeslagen
        beforeStateSave({ state }) {
            console.log('About to save state:', state);

            // Voeg extra data toe
            state.savedAt = new Date().toISOString();

            // Of annuleer save
            // return false;
        }
    }
});
```

---

## 7. Custom State Properties

### Uitbreiding van Stateful Properties

```javascript
class MyCalendar extends Calendar {
    // Custom property die stateful moet zijn
    static configurable = {
        customSetting: {
            value: 'default',

            // Markeer als stateful
            $config: {
                merge: 'replace'
            }
        }
    };

    // Override getState voor custom properties
    getState() {
        const state = super.getState();

        // Voeg custom state toe
        state.customSetting = this.customSetting;

        return state;
    }

    // Override applyState voor custom properties
    applyState(state) {
        super.applyState(state);

        if (state.customSetting !== undefined) {
            this.customSetting = state.customSetting;
        }
    }
}
```

### Complex State Objects

```javascript
const calendar = new Calendar({
    stateId: 'calendar',
    stateful: true,

    // Override getState
    getState() {
        const state = this.constructor.prototype.getState.call(this);

        // Voeg view-specifieke state toe
        state.viewSettings = {
            week: {
                hourHeight: this.modes.week.hourHeight,
                dayStartTime: this.modes.week.dayStartTime
            },
            month: {
                sixWeeks: this.modes.month.sixWeeks
            }
        };

        // Voeg filter state toe
        state.filters = this.eventStore.filters.map(f => ({
            id: f.id,
            property: f.property,
            value: f.value
        }));

        return state;
    },

    // Override applyState
    applyState(state) {
        this.constructor.prototype.applyState.call(this, state);

        // Restore view settings
        if (state.viewSettings) {
            Object.assign(this.modes.week, state.viewSettings.week);
            Object.assign(this.modes.month, state.viewSettings.month);
        }

        // Restore filters
        if (state.filters) {
            state.filters.forEach(f => {
                this.eventStore.filter(f);
            });
        }
    }
});
```

---

## 8. State Debugging

### Debug State

```javascript
// Bekijk huidige state
console.log('Calendar state:', calendar.getState());

// Bekijk alle opgeslagen state
console.log('All state:', StateProvider.instance.data);

// Bekijk specifieke state
console.log('Calendar saved state:', StateProvider.instance.getValue('mainCalendar'));
```

### State Inspector

```javascript
// Helper functie voor debugging
window.debugState = () => {
    const provider = StateProvider.instance;
    return {
        storage: provider.storage.constructor.name,
        keys: Object.keys(provider.data),
        data: JSON.parse(JSON.stringify(provider.data))
    };
};

// Gebruik in console
// > debugState()
```

### Clear State voor Testing

```javascript
// Clear alle state
StateProvider.instance.clear();

// Clear specifieke widget state
const data = StateProvider.instance.data;
delete data.mainCalendar;
StateProvider.instance.data = data;
```

---

## 9. Multi-Device Considerations

### Device-Specific State

```javascript
// Detecteer device type
const deviceType = BrowserHelper.isMobile ? 'mobile' : 'desktop';

const calendar = new Calendar({
    // Device-specific stateId
    stateId: `calendar-${deviceType}`,

    stateful: ['date', 'mode'],

    // Verschillende defaults per device
    ...(deviceType === 'mobile' ? {
        mode: 'day',
        sidebar: false
    } : {
        mode: 'week',
        sidebar: true
    })
});
```

### State Versioning

```javascript
const STATE_VERSION = 2;

const calendar = new Calendar({
    stateId: 'calendar',
    stateful: true,

    listeners: {
        beforeStateApply({ state }) {
            // Check state version
            if (!state.version || state.version < STATE_VERSION) {
                console.log('Outdated state, using defaults');
                return false;  // Skip applying old state
            }
        },

        beforeStateSave({ state }) {
            // Add version to state
            state.version = STATE_VERSION;
        }
    }
});
```

---

## 10. Performance Optimizations

### Debounced Saving

```javascript
// StateProvider heeft ingebouwde debounce
// State changes worden gecoalesced

calendar.date = new Date(2024, 0, 15);
calendar.date = new Date(2024, 0, 16);
calendar.date = new Date(2024, 0, 17);
// → Slechts één save operatie
```

### Immediate Save

```javascript
// Forceer immediate save (skip debounce)
calendar.saveState({ immediate: true });

// Nuttig bij page unload
window.addEventListener('beforeunload', () => {
    calendar.saveState({ immediate: true });
});
```

### Selective State

```javascript
// Sla alleen essentiële properties op
const calendar = new Calendar({
    stateful: [
        'date',  // Klein, belangrijk
        'mode'   // Klein, belangrijk
        // Niet: complexe view settings
    ]
});

// View settings apart opslaan met lagere frequentie
let saveViewSettingsTimeout;

calendar.on('viewSettingChange', () => {
    clearTimeout(saveViewSettingsTimeout);
    saveViewSettingsTimeout = setTimeout(() => {
        saveViewSettings(calendar);
    }, 5000);  // 5 seconden debounce
});
```

---

## 11. Security Considerations

### State Sanitization

```javascript
const calendar = new Calendar({
    stateId: 'calendar',
    stateful: true,

    listeners: {
        beforeStateApply({ state }) {
            // Sanitize state data
            if (state.date) {
                const date = new Date(state.date);
                if (isNaN(date.getTime())) {
                    delete state.date;  // Invalid date
                }
            }

            // Validate mode
            const validModes = ['day', 'week', 'month', 'year', 'agenda'];
            if (state.mode && !validModes.includes(state.mode)) {
                delete state.mode;
            }
        }
    }
});
```

### Encrypted State

```javascript
class EncryptedStorage extends StateStorage {
    constructor(key) {
        super();
        this.encryptionKey = key;
    }

    setItem(key, value) {
        const encrypted = this.encrypt(JSON.stringify(value));
        localStorage.setItem(key, encrypted);
    }

    getItem(key) {
        const encrypted = localStorage.getItem(key);
        if (encrypted) {
            return JSON.parse(this.decrypt(encrypted));
        }
        return null;
    }

    encrypt(data) {
        // Implementeer encryptie
        return btoa(data);  // Simpel voorbeeld
    }

    decrypt(data) {
        // Implementeer decryptie
        return atob(data);  // Simpel voorbeeld
    }
}

// Gebruik
const provider = new StateProvider({
    storage: new EncryptedStorage('secret-key')
});
StateProvider.instance = provider;
```

---

## 12. Testing State

### Unit Test Pattern

```javascript
describe('State Persistence', () => {
    let calendar, provider;

    beforeEach(() => {
        // Gebruik memory storage voor tests
        provider = StateProvider.setup('memory');

        calendar = new Calendar({
            appendTo: document.body,
            date: new Date(2024, 0, 15),
            stateful: ['date', 'mode'],
            stateId: 'testCalendar'
        });
    });

    afterEach(() => {
        calendar.destroy();
        provider.clear();
    });

    it('should save date changes', () => {
        const newDate = new Date(2024, 1, 20);
        calendar.date = newDate;

        const state = provider.getValue('testCalendar');
        expect(new Date(state.date)).toEqual(newDate);
    });

    it('should restore state on reload', () => {
        // Set initial state
        provider.setValue('testCalendar', {
            date: '2024-03-15',
            mode: 'month'
        });

        // Create new calendar
        const newCalendar = new Calendar({
            stateful: ['date', 'mode'],
            stateId: 'testCalendar'
        });

        expect(newCalendar.date).toEqual(new Date(2024, 2, 15));
        expect(newCalendar.mode).toBe('month');

        newCalendar.destroy();
    });

    it('should handle invalid state gracefully', () => {
        provider.setValue('testCalendar', {
            date: 'invalid-date',
            mode: 'invalid-mode'
        });

        // Should not throw
        expect(() => {
            calendar.loadState(null, true);
        }).not.toThrow();
    });
});
```

---

## 13. Migration Patterns

### State Migration

```javascript
const CURRENT_VERSION = 3;

function migrateState(state) {
    if (!state.version) {
        // v0 → v1: date was stored differently
        if (state.currentDate) {
            state.date = state.currentDate;
            delete state.currentDate;
        }
        state.version = 1;
    }

    if (state.version === 1) {
        // v1 → v2: mode names changed
        if (state.mode === 'weekly') {
            state.mode = 'week';
        }
        state.version = 2;
    }

    if (state.version === 2) {
        // v2 → v3: sidebar became object
        if (typeof state.sidebarCollapsed === 'boolean') {
            state.sidebar = { collapsed: state.sidebarCollapsed };
            delete state.sidebarCollapsed;
        }
        state.version = 3;
    }

    return state;
}

const calendar = new Calendar({
    stateId: 'calendar',
    stateful: true,

    listeners: {
        beforeStateApply({ state }) {
            // Migrate old state formats
            migrateState(state);
        }
    }
});
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| StateClassConfig | 80886 |
| StateClass | 80929 |
| StateProviderListenersTypes | 80994 |
| StateProviderListeners | 81049 |
| StateProvider class | 81204 |
| StateStorage class | 81381 |

---

## Relevante Examples

| Example | Beschrijving |
|---------|-------------|
| `state/` | Complete state persistence demo |
| `basic/` | Basis setup (bevat state config) |

---

## Best Practices

### Do's

```javascript
// 1. Gebruik unieke stateIds
stateId: 'myApp-calendar-main'

// 2. Sla alleen essentiële properties op
stateful: ['date', 'mode']  // Niet alles

// 3. Valideer state voor toepassing
beforeStateApply({ state }) {
    return isValidState(state);
}

// 4. Handle page unload
window.addEventListener('beforeunload', () => {
    calendar.saveState({ immediate: true });
});

// 5. Gebruik versioning voor backwards compatibility
state.version = CURRENT_VERSION;
```

### Don'ts

```javascript
// 1. Sla geen sensitive data op in localStorage
stateful: ['apiKey']  // FOUT!

// 2. Geen ongelimiteerde state objecten
stateful: true  // Kan groot worden

// 3. Geen circulaire references
state.self = state;  // Error!

// 4. Geen non-serializable data
state.callback = () => {};  // Lost in JSON.stringify
```

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
