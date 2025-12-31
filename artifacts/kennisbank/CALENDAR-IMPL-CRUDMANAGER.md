# CALENDAR-IMPL-CRUDMANAGER.md

## Overzicht

Dit document beschrijft het CrudManager systeem in Bryntum Calendar. De CrudManager is verantwoordelijk voor:

1. **Data Loading** - Laden van events, resources en andere data
2. **Data Synchronization** - Opslaan van wijzigingen naar de server
3. **Store Management** - Beheer van meerdere gekoppelde stores
4. **Auto Sync** - Automatische synchronisatie van wijzigingen

---

## TypeScript Interfaces

### CrudManagerConfig (regel 5015)

```typescript
// calendar.d.ts:5015
type CrudManagerConfig = {
    // Stores
    eventStore?: EventStore|EventStoreConfig
    resourceStore?: ResourceStore|ResourceStoreConfig
    assignmentStore?: AssignmentStore|AssignmentStoreConfig
    dependencyStore?: DependencyStore|DependencyStoreConfig
    resourceTimeRangeStore?: ResourceTimeRangeStore|ResourceTimeRangeStoreConfig

    // Custom stores
    crudStores?: Store[]|string[]|CrudManagerStoreDescriptor[]|StoreConfig[]
    stores?: Store[]|string[]|CrudManagerStoreDescriptor[]|StoreConfig[]

    // Loading
    loadUrl?: string
    autoLoad?: boolean
    lazyLoad?: boolean|{
        chunkSize?: number,
        bufferUnit?: DurationUnit,
        bufferAmount?: number
    }
    remotePaging?: boolean
    pageSize?: number

    // Syncing
    syncUrl?: string
    autoSync?: boolean
    autoSyncTimeout?: number
    forceSync?: boolean
    writeAllFields?: boolean

    // Transport configuratie
    transport?: {
        load?: {
            url?: string
            method?: string
            headers?: object
            params?: object
            paramName?: string
            credentials?: string
        }
        sync?: {
            url?: string
            method?: string
            headers?: object
            params?: object
            credentials?: string
        }
    }

    // Response handling
    validateResponse?: boolean
    skipSuccessProperty?: boolean
    supportShortSyncResponse?: boolean
    trackResponseType?: boolean

    // Encoder
    encoder?: {
        requestData?: object
    }

    // ID handling
    phantomIdField?: string
    phantomParentIdField?: string
    resetIdsBeforeSync?: boolean

    // Project
    project?: SchedulerProjectModel

    // STM integration
    ignoreRemoteChangesInSTM?: boolean

    // Store sync order
    syncApplySequence?: string[]|CrudManagerStoreDescriptor[]

    // Event handlers
    listeners?: CrudManagerListeners
    onBeforeLoad?: ((event: { source, pack }) => Promise<boolean>|boolean|void)|string
    onLoad?: ((event: { source, response, rawResponse }) => void)|string
    onLoadFail?: ((event: { source, response, responseText }) => void)|string
    onBeforeSync?: ((event: { source, pack }) => Promise<boolean>|boolean|void)|string
    onSync?: ((event: { source, response, rawResponse }) => void)|string
    onSyncFail?: ((event: { source, response, responseText }) => void)|string
    onHasChanges?: ((event: { source }) => void)|string
    onNoChanges?: ((event: { source }) => void)|string
}
```

### CrudManager Class (regel 5426)

```typescript
// calendar.d.ts:5426
export class CrudManager extends SchedulerCrudManager {
    static readonly isCrudManager: boolean
    readonly isCrudManager: boolean

    // Properties
    changes: object              // Huidige wijzigingen
    isSyncing: boolean           // Bezig met sync
    isLoading: boolean           // Bezig met laden

    // Methods
    load(options?: object): Promise<any>;
    sync(options?: object): Promise<any>;
    cancelRequest(request: Promise<any>): void;
    acceptChanges(): void;
    revertChanges(): void;

    // Store access
    getStore(storeId: string): Store;

    // Events
    onBeforeLoad: ((event) => Promise<boolean>|boolean|void)|string
    onLoad: ((event) => void)|string
    onLoadFail: ((event) => void)|string
    onBeforeSync: ((event) => Promise<boolean>|boolean|void)|string
    onSync: ((event) => void)|string
    onSyncFail: ((event) => void)|string
}
```

---

## Basis Configuratie

### Simpele Load URL

```javascript
import { Calendar } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo : 'container',

    crudManager : {
        loadUrl  : '/api/calendar/load',
        autoLoad : true
    }
});
```

### Load en Sync URLs

```javascript
const calendar = new Calendar({
    crudManager : {
        loadUrl  : '/api/calendar/load',
        syncUrl  : '/api/calendar/sync',
        autoLoad : true,
        autoSync : true,
        autoSyncTimeout : 2000  // Wacht 2 seconden na wijziging
    }
});
```

### Volledige Transport Configuratie

```javascript
const calendar = new Calendar({
    crudManager : {
        transport : {
            load : {
                url         : '/api/calendar/load',
                method      : 'GET',
                credentials : 'include',
                headers     : {
                    'Authorization' : 'Bearer ' + token,
                    'Content-Type'  : 'application/json'
                },
                params : {
                    userId : currentUser.id
                }
            },
            sync : {
                url         : '/api/calendar/sync',
                method      : 'POST',
                credentials : 'include',
                headers     : {
                    'Authorization' : 'Bearer ' + token,
                    'Content-Type'  : 'application/json'
                }
            }
        },
        autoLoad : true
    }
});
```

---

## Data Formaat

### Load Response

```json
{
    "success": true,
    "resources": {
        "rows": [
            {
                "id": 1,
                "name": "John Smith",
                "eventColor": "#2196f3"
            },
            {
                "id": 2,
                "name": "Jane Doe",
                "eventColor": "#4caf50"
            }
        ]
    },
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Meeting",
                "startDate": "2025-01-06T09:00:00",
                "endDate": "2025-01-06T10:00:00",
                "resourceId": 1
            },
            {
                "id": 2,
                "name": "Lunch",
                "startDate": "2025-01-06T12:00:00",
                "endDate": "2025-01-06T13:00:00",
                "resourceId": 2
            }
        ]
    }
}
```

### Sync Request

```json
{
    "type": "sync",
    "requestId": 12345,
    "events": {
        "added": [
            {
                "$PhantomId": "_generated_1",
                "name": "New Event",
                "startDate": "2025-01-07T14:00:00",
                "endDate": "2025-01-07T15:00:00",
                "resourceId": 1
            }
        ],
        "updated": [
            {
                "id": 1,
                "name": "Updated Meeting",
                "startDate": "2025-01-06T10:00:00"
            }
        ],
        "removed": [
            { "id": 2 }
        ]
    }
}
```

### Sync Response

```json
{
    "success": true,
    "requestId": 12345,
    "events": {
        "rows": [
            {
                "$PhantomId": "_generated_1",
                "id": 100
            }
        ]
    }
}
```

---

## Custom Stores

### Extra Store Toevoegen

```javascript
const calendar = new Calendar({
    crudManager : {
        loadUrl  : '/api/calendar/load',
        autoLoad : true,

        // Extra stores naast events en resources
        stores : [
            {
                id         : 'categories',
                modelClass : CategoryModel
            },
            {
                id         : 'rooms',
                modelClass : RoomModel
            }
        ]
    }
});

// Toegang tot custom store
const categoriesStore = calendar.crudManager.getStore('categories');
```

### CrudStores met Prioriteit

```javascript
const calendar = new Calendar({
    crudManager : {
        crudStores : [
            {
                store         : roomsStore,
                storeId       : 'rooms',
                loadPriority  : 1,  // Laad eerst
                syncPriority  : 2   // Sync als tweede
            },
            {
                store         : equipmentStore,
                storeId       : 'equipment',
                loadPriority  : 2,
                syncPriority  : 1
            }
        ]
    }
});
```

---

## Event Handlers

### Load Events

```javascript
const calendar = new Calendar({
    crudManager : {
        loadUrl : '/api/calendar/load',

        listeners : {
            // Voor het laden
            beforeLoad({ source, pack }) {
                console.log('Starting load...');
                // Return false om te annuleren
            },

            // Voor data apply
            beforeLoadApply({ source, response }) {
                console.log('About to apply:', response);
                // Mogelijkheid om response te wijzigen
                if (response.events) {
                    response.events.rows = response.events.rows.filter(
                        e => e.status !== 'cancelled'
                    );
                }
            },

            // Na succesvol laden
            load({ source, response }) {
                console.log('Loaded successfully:', response);
                Toast.show(`${response.events.rows.length} events geladen`);
            },

            // Bij fout
            loadFail({ source, response, responseText }) {
                console.error('Load failed:', response);
                MessageDialog.alert({
                    title   : 'Laad fout',
                    message : response.message || 'Kon data niet laden'
                });
            },

            // Geannuleerd
            loadCanceled({ source }) {
                console.log('Load was canceled');
            }
        }
    }
});
```

### Sync Events

```javascript
const calendar = new Calendar({
    crudManager : {
        syncUrl : '/api/calendar/sync',

        listeners : {
            // Voor sync
            beforeSync({ source, pack }) {
                console.log('Syncing changes:', pack);

                // Validatie voor sync
                if (pack.events?.added?.some(e => !e.name)) {
                    Toast.show('Events moeten een naam hebben');
                    return false;  // Annuleer sync
                }
            },

            // Voor sync request versturen
            beforeSend({ params, requestType, requestConfig }) {
                // Voeg extra parameters toe
                params.timestamp = Date.now();
                params.userId = currentUser.id;
            },

            // Na succesvolle sync
            sync({ source, response }) {
                console.log('Sync successful:', response);
                Toast.show('Wijzigingen opgeslagen');
            },

            // Bij sync fout
            syncFail({ source, response, responseText }) {
                console.error('Sync failed:', response);

                // Toon foutmelding
                MessageDialog.alert({
                    title   : 'Opslaan mislukt',
                    message : response.message || 'Kon wijzigingen niet opslaan'
                });

                // Optioneel: herstel wijzigingen
                // source.revertChanges();
            },

            // Sync uitgesteld (vorige nog bezig)
            syncDelayed({ source }) {
                console.log('Sync delayed - previous sync still in progress');
            }
        }
    }
});
```

### Change Tracking

```javascript
const calendar = new Calendar({
    crudManager : {
        listeners : {
            // Er zijn onopgeslagen wijzigingen
            hasChanges({ source }) {
                console.log('Has unsaved changes');
                document.title = '* Calendar';  // Indicator in title

                // Toon save button
                saveButton.disabled = false;
            },

            // Geen onopgeslagen wijzigingen meer
            noChanges({ source }) {
                console.log('All changes saved');
                document.title = 'Calendar';

                // Hide save button
                saveButton.disabled = true;
            }
        }
    }
});
```

---

## Programmatisch Laden en Syncen

### Handmatig Laden

```javascript
// Basis load
await calendar.crudManager.load();

// Met opties
await calendar.crudManager.load({
    request : {
        params : {
            startDate : '2025-01-01',
            endDate   : '2025-01-31'
        }
    }
});

// Forceer reload
await calendar.crudManager.load({
    force : true  // Negeer cache
});
```

### Handmatig Syncen

```javascript
// Basis sync
await calendar.crudManager.sync();

// Check of sync nodig is
if (calendar.crudManager.changes) {
    await calendar.crudManager.sync();
}

// Force sync (ook zonder wijzigingen)
await calendar.crudManager.sync({
    force : true
});
```

### Wijzigingen Ophalen

```javascript
// Alle wijzigingen
const changes = calendar.crudManager.changes;

console.log(changes);
// {
//     events: {
//         added: [...],
//         updated: [...],
//         removed: [...]
//     },
//     resources: {
//         updated: [...]
//     }
// }

// Check voor specifieke store
if (changes?.events?.added?.length > 0) {
    console.log('Nieuwe events:', changes.events.added);
}
```

### Wijzigingen Terugdraaien

```javascript
// Alle wijzigingen terugdraaien
calendar.crudManager.revertChanges();

// Of accepteer huidige state als basis
calendar.crudManager.acceptChanges();
```

---

## Auto Sync Configuratie

### Basis Auto Sync

```javascript
const calendar = new Calendar({
    crudManager : {
        syncUrl         : '/api/calendar/sync',
        autoSync        : true,
        autoSyncTimeout : 3000  // 3 seconden delay
    }
});
```

### Conditionele Auto Sync

```javascript
const calendar = new Calendar({
    crudManager : {
        syncUrl  : '/api/calendar/sync',
        autoSync : false,  // Start disabled

        listeners : {
            hasChanges() {
                // Enable auto sync alleen tijdens werkuren
                const hour = new Date().getHours();
                if (hour >= 9 && hour < 18) {
                    this.autoSync = true;
                }
            }
        }
    }
});
```

### Debounced Sync

```javascript
const calendar = new Calendar({
    crudManager : {
        syncUrl         : '/api/calendar/sync',
        autoSync        : true,
        autoSyncTimeout : 5000,  // 5 seconden

        listeners : {
            beforeSync({ pack }) {
                // Batch kleine wijzigingen
                const totalChanges =
                    (pack.events?.added?.length || 0) +
                    (pack.events?.updated?.length || 0) +
                    (pack.events?.removed?.length || 0);

                // Wacht op meer wijzigingen als er maar 1 is
                if (totalChanges === 1) {
                    return false;  // Probeer later opnieuw
                }
            }
        }
    }
});
```

---

## Lazy Loading

### Basis Lazy Load

```javascript
const calendar = new Calendar({
    crudManager : {
        loadUrl  : '/api/calendar/load',
        lazyLoad : true  // Laad alleen zichtbare data
    }
});
```

### Lazy Load met Configuratie

```javascript
const calendar = new Calendar({
    crudManager : {
        loadUrl : '/api/calendar/load',

        lazyLoad : {
            chunkSize    : 50,      // Records per request
            bufferUnit   : 'week',  // Buffer periode
            bufferAmount : 2        // 2 weken buffer
        }
    }
});
```

### Custom Data Fetching

```javascript
const calendar = new Calendar({
    crudManager : {
        lazyLoad : true,

        // Custom data fetcher
        async requestData(params) {
            const response = await fetch('/api/calendar/events', {
                method  : 'POST',
                headers : { 'Content-Type': 'application/json' },
                body    : JSON.stringify({
                    startDate : params.startDate,
                    endDate   : params.endDate,
                    page      : params.page,
                    pageSize  : params.pageSize
                })
            });

            return response.json();
        }
    }
});
```

---

## Remote Paging

```javascript
const calendar = new Calendar({
    crudManager : {
        loadUrl      : '/api/calendar/load',
        remotePaging : true,
        pageSize     : 100
    }
});
```

De load requests bevatten dan:

```
GET /api/calendar/load?page=1&pageSize=100&startDate=2025-01-01&endDate=2025-01-31
```

---

## Error Handling

### Globale Error Handler

```javascript
const calendar = new Calendar({
    crudManager : {
        loadUrl : '/api/calendar/load',
        syncUrl : '/api/calendar/sync',

        listeners : {
            requestFail({ source, requestType, response, responseText }) {
                console.error(`${requestType} failed:`, response);

                // Generieke error handling
                let message = 'Er is een fout opgetreden';

                if (response?.message) {
                    message = response.message;
                } else if (response?.status === 401) {
                    message = 'Sessie verlopen. Log opnieuw in.';
                    window.location = '/login';
                } else if (response?.status === 403) {
                    message = 'Geen toegang tot deze actie.';
                } else if (response?.status >= 500) {
                    message = 'Serverfout. Probeer later opnieuw.';
                }

                Toast.show({
                    html    : message,
                    cls     : 'b-toast-error',
                    timeout : 5000
                });
            }
        }
    }
});
```

### Retry Logica

```javascript
class RetryableCrudManager {
    constructor(calendar, maxRetries = 3) {
        this.calendar = calendar;
        this.maxRetries = maxRetries;

        calendar.crudManager.on({
            syncFail : ({ source }) => this.handleSyncFail(source),
            loadFail : ({ source }) => this.handleLoadFail(source)
        });
    }

    async handleSyncFail(crudManager, attempt = 1) {
        if (attempt <= this.maxRetries) {
            console.log(`Retry sync attempt ${attempt}/${this.maxRetries}`);

            // Exponential backoff
            await this.delay(1000 * Math.pow(2, attempt - 1));

            try {
                await crudManager.sync();
            } catch (e) {
                this.handleSyncFail(crudManager, attempt + 1);
            }
        } else {
            Toast.show('Kon wijzigingen niet opslaan na meerdere pogingen');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

---

## Response Validation

### Validatie Inschakelen

```javascript
const calendar = new Calendar({
    crudManager : {
        loadUrl          : '/api/calendar/load',
        validateResponse : true  // Waarschuw bij ongeldige responses
    }
});
```

### Custom Validatie

```javascript
const calendar = new Calendar({
    crudManager : {
        listeners : {
            beforeLoadApply({ response }) {
                // Valideer response structuur
                if (!response.events?.rows) {
                    console.error('Invalid response: missing events.rows');
                    return false;
                }

                // Valideer data integriteit
                const invalidEvents = response.events.rows.filter(
                    e => !e.startDate || !e.endDate
                );

                if (invalidEvents.length > 0) {
                    console.warn('Events zonder datums:', invalidEvents);
                    // Filter ze eruit
                    response.events.rows = response.events.rows.filter(
                        e => e.startDate && e.endDate
                    );
                }
            },

            beforeSyncApply({ response }) {
                // Valideer sync response
                if (response.success === false) {
                    console.error('Server reported failure:', response.message);
                    return false;
                }
            }
        }
    }
});
```

---

## Offline Support

### Offline Detection

```javascript
const calendar = new Calendar({
    crudManager : {
        syncUrl  : '/api/calendar/sync',
        autoSync : true,

        listeners : {
            beforeSync() {
                if (!navigator.onLine) {
                    Toast.show('Geen internetverbinding');
                    return false;  // Cancel sync
                }
            },

            syncFail({ response }) {
                if (!navigator.onLine) {
                    // Queue for later
                    this.offlineQueue = this.changes;
                    Toast.show('Wijzigingen worden opgeslagen zodra online');
                }
            }
        }
    }
});

// Sync wanneer weer online
window.addEventListener('online', () => {
    if (calendar.crudManager.changes) {
        calendar.crudManager.sync();
    }
});
```

### Local Storage Fallback

```javascript
class OfflineCrudManager {
    constructor(calendar, storageKey = 'calendar_offline_changes') {
        this.calendar = calendar;
        this.storageKey = storageKey;

        // Restore pending changes on init
        this.restoreOfflineChanges();

        calendar.crudManager.on({
            beforeSync : () => this.saveOfflineChanges(),
            sync       : () => this.clearOfflineChanges(),
            syncFail   : () => this.saveOfflineChanges()
        });
    }

    saveOfflineChanges() {
        const changes = this.calendar.crudManager.changes;
        if (changes) {
            localStorage.setItem(this.storageKey, JSON.stringify(changes));
        }
    }

    restoreOfflineChanges() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            // Apply saved changes to stores
            console.log('Restoring offline changes');
        }
    }

    clearOfflineChanges() {
        localStorage.removeItem(this.storageKey);
    }
}
```

---

## Conflict Resolution

### Server-side Conflict Detection

```javascript
const calendar = new Calendar({
    crudManager : {
        listeners : {
            beforeSyncApply({ response }) {
                if (response.conflicts) {
                    // Server detected conflicts
                    return this.handleConflicts(response.conflicts);
                }
            }
        }
    }
});

async function handleConflicts(conflicts) {
    for (const conflict of conflicts) {
        const result = await MessageDialog.confirm({
            title   : 'Conflict gedetecteerd',
            message : `${conflict.eventName} is gewijzigd door ${conflict.modifiedBy}. Overschrijven?`
        });

        if (result !== MessageDialog.okButton) {
            // User chose to keep server version
            conflict.useServer = true;
        }
    }

    // Continue with resolved conflicts
    return true;
}
```

### Optimistic Locking

```javascript
// Server response met versienummers
{
    "events": {
        "rows": [
            { "id": 1, "name": "Event", "version": 5 }
        ]
    }
}

// Bij sync, stuur versie mee
const calendar = new Calendar({
    crudManager : {
        listeners : {
            beforeSync({ pack }) {
                // Voeg versienummers toe aan updates
                pack.events?.updated?.forEach(event => {
                    const record = calendar.eventStore.getById(event.id);
                    event.version = record.version;
                });
            }
        }
    }
});
```

---

## Best Practices

### 1. Gebruik autoLoad en autoSync Samen

```javascript
const calendar = new Calendar({
    crudManager : {
        loadUrl         : '/api/calendar/load',
        syncUrl         : '/api/calendar/sync',
        autoLoad        : true,
        autoSync        : true,
        autoSyncTimeout : 2000,

        // Response validatie
        validateResponse : true
    }
});
```

### 2. Error Feedback voor Gebruikers

```javascript
const calendar = new Calendar({
    crudManager : {
        listeners : {
            loadFail() {
                Toast.show({
                    html : '<i class="b-fa b-fa-exclamation"></i> Laden mislukt',
                    cls  : 'b-toast-error'
                });
            },

            syncFail() {
                Toast.show({
                    html : '<i class="b-fa b-fa-exclamation"></i> Opslaan mislukt',
                    cls  : 'b-toast-error'
                });
            },

            sync() {
                Toast.show({
                    html    : '<i class="b-fa b-fa-check"></i> Opgeslagen',
                    timeout : 2000
                });
            }
        }
    }
});
```

### 3. Loading Indicators

```javascript
const calendar = new Calendar({
    crudManager : {
        listeners : {
            beforeLoad() {
                calendar.maskBody('Laden...');
            },

            load() {
                calendar.unmaskBody();
            },

            loadFail() {
                calendar.unmaskBody();
            }
        }
    }
});
```

---

## TypeScript Referenties

| Interface | Regel | Beschrijving |
|-----------|-------|--------------|
| `CrudManagerConfig` | 5015 | Volledige CrudManager configuratie |
| `CrudManager` | 5426 | CrudManager class |
| `onBeforeLoad` | 5252 | Event voor load start |
| `onLoad` | 5331 | Event na succesvol laden |
| `onLoadFail` | 5350 | Event bij load fout |
| `onBeforeSync` | 5290 | Event voor sync start |
| `onSync` | 5393 | Event na succesvolle sync |
| `onSyncFail` | 5418 | Event bij sync fout |
| `onHasChanges` | 5321 | Event bij onopgeslagen wijzigingen |
| `onNoChanges` | 5360 | Event wanneer alles opgeslagen |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `examples/php/` | PHP backend integratie |
| `examples/load-on-demand/` | Lazy loading setup |
| `examples/bigdataset/` | Large dataset handling |

---

## Samenvatting

Het Bryntum CrudManager systeem biedt:

1. **Unified Data Management** - Events, resources, en custom stores in één manager
2. **Automatic Sync** - autoSync met configureerbare timeout
3. **Lazy Loading** - Laad alleen wat nodig is
4. **Rich Event System** - beforeLoad, load, sync, fail events
5. **Response Validation** - Automatische validatie van server responses
6. **Conflict Handling** - Support voor optimistic locking

Key patterns:
- `loadUrl` + `syncUrl` voor eenvoudige setup
- `transport` object voor volledige controle
- `beforeLoadApply` / `beforeSyncApply` voor data transformatie
- `hasChanges` / `noChanges` voor UI feedback
- `changes` property voor toegang tot wijzigingen
