# Bryntum Calendar - Real-Time Synchronisatie & WebSocket Integratie

Dit document beschrijft de real-time synchronisatie mechanismen van Bryntum Calendar, inclusief de CrudManager architectuur, transport configuraties, en WebSocket integratie patronen.

## Inhoudsopgave

1. [CrudManager Architectuur](#crudmanager-architectuur)
2. [Transport Configuratie](#transport-configuratie)
3. [Auto-Sync & Polling](#auto-sync--polling)
4. [Event Lifecycle](#event-lifecycle)
5. [Request/Response Formaten](#requestresponse-formaten)
6. [WebSocket Integratie](#websocket-integratie)
7. [Conflict Resolution](#conflict-resolution)
8. [Implementatie Richtlijnen](#implementatie-richtlijnen)

---

## CrudManager Architectuur

### CrudManager Class Hiërarchie

```
calendar.d.ts:5426
```

```typescript
// calendar.d.ts:5426
export class CrudManager extends SchedulerCrudManager {
    static readonly isCrudManager: boolean
    readonly isCrudManager: boolean

    // Event handlers
    onBeforeDestroy: ((event: { source: Base }) => void)|string
    onBeforeLoad: ((event: { source: AbstractCrudManager, pack: object }) => Promise<boolean>|boolean|void)|string
    onBeforeSync: ((event: { source: AbstractCrudManager, pack: object }) => Promise<boolean>|boolean|void)|string
    onSync: ((event: { source: AbstractCrudManager, response: object, ... }) => void)|string
    onSyncFail: ((event: { source: AbstractCrudManager, response: object, ... }) => void)|string
}
```

### CrudManagerConfig Type

```
calendar.d.ts:5021-5239
```

```typescript
// calendar.d.ts:5021
type CrudManagerConfig = {
    // Automatisch laden bij creatie
    autoLoad?: boolean                    // :5025

    // Automatisch synchroniseren na wijzigingen
    autoSync?: boolean                    // :5031

    // Timeout voor auto-sync (ms)
    autoSyncTimeout?: number              // :5036

    // Forceer sync zelfs zonder wijzigingen (voor polling)
    forceSync?: boolean                   // :5083

    // Stores beheerd door CrudManager
    crudStores?: Store[]|string[]|CrudManagerStoreDescriptor[]|StoreConfig[]  // :5062

    // Convenience URL configuraties
    loadUrl?: string                      // :5118
    syncUrl?: string                      // :5207

    // Transport configuratie
    transport?: {                         // :5220
        load?: object
        sync?: object
    }

    // Listeners
    listeners?: CrudManagerListeners      // :5111

    // Lazy loading ondersteuning
    lazyLoad?: boolean|{                  // :5105
        lazyLoad: { chunkSize: number }
        bufferUnit: DurationUnit
        bufferAmount: number
    }

    // Remote paging
    remotePaging?: boolean                // :5142
    pageSize?: number                     // :5122

    // Response handling
    validateResponse?: boolean            // :5231
    supportShortSyncResponse?: boolean    // :5192
    trackResponseType?: boolean           // :5214

    // Field synchronisatie
    writeAllFields?: boolean              // :5239
    resetIdsBeforeSync?: boolean          // :5157
}
```

### CrudManagerStoreDescriptor Type

```
calendar.d.ts:2642-2663
```

```typescript
// calendar.d.ts:2642
type CrudManagerStoreDescriptor = {
    // Unieke store identifier voor requests/responses
    storeId: string                       // :2646

    // De store zelf
    store: Store                          // :2650

    // Phantom record ID veld
    phantomIdField?: string               // :2654

    // ID veld naam
    idField?: string                      // :2658

    // Alle velden schrijven bij modificatie
    writeAllFields?: boolean              // :2662
}
```

---

## Transport Configuratie

### FetchOptions Type

```
calendar.d.ts:1243-1289
```

```typescript
// calendar.d.ts:1243
type FetchOptions = {
    // HTTP methode
    method?: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'  // :1247

    // Query parameters
    queryParams?: object                          // :1251

    // Headers
    headers?: object                              // :1256

    // Request body
    body?: object                                 // :1262

    // Query params in body
    addQueryParamsToBody?: boolean                // :1268

    // CORS mode
    mode?: 'cors'|'no-cors'|'same-origin'         // :1273

    // Credentials
    credentials?: 'omit'|'same-origin'|'include'  // :1279

    // JSON parsing
    parseJson?: boolean                           // :1284

    // Abort controller voor cancellation
    abortController?: AbortController             // :1288
}
```

### AjaxHelper Class

```
calendar.d.ts:76750-76787
```

```typescript
// calendar.d.ts:76750
export class AjaxHelper {
    // Default fetch opties
    static DEFAULT_FETCH_OPTIONS: FetchOptions        // :76756

    // Basis fetch methode
    static fetch(url: string, options?: FetchOptions): Promise<any>  // :76762

    // GET request
    static get(url: string, options?: FetchOptions): Promise<any>    // :76768

    // POST request
    static post(url: string, payload: string|object|FormData, options?: FetchOptions): Promise<any>  // :76786

    // Mock URL voor testing
    static mockUrl(url: string, response: {           // :76775
        responseText: string
        synchronous?: boolean
        delay?: number
    }|Function): void
}
```

### Transport Configuratie Voorbeeld

```typescript
const calendar = new Calendar({
    crudManager: {
        transport: {
            load: {
                url: '/api/calendar/load',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer token',
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                paramName: 'data'  // Request data parameter naam
            },
            sync: {
                url: '/api/calendar/sync',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer token',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            }
        }
    }
});
```

---

## Auto-Sync & Polling

### Auto-Sync Configuratie

```typescript
// Auto-sync na elke wijziging
const calendar = new Calendar({
    crudManager: {
        autoSync: true,          // Automatisch syncen
        autoSyncTimeout: 1000,   // Wacht 1 seconde na laatste wijziging
        loadUrl: '/api/load',
        syncUrl: '/api/sync'
    }
});
```

### Polling Patroon

```
calendar.d.ts:5080-5083
```

```typescript
// forceSync voor polling scenario's
// calendar.d.ts:5080
// Specify as `true` to force sync requests to be sent when calling `sync()`,
// even if there are no local changes. Useful in a polling scenario.
forceSync?: boolean
```

**Polling Implementatie:**

```typescript
const calendar = new Calendar({
    crudManager: {
        forceSync: true,  // Sync ook zonder lokale wijzigingen
        loadUrl: '/api/load',
        syncUrl: '/api/sync'
    }
});

// Polling interval
let pollInterval: number;

function startPolling(intervalMs: number = 5000): void {
    pollInterval = window.setInterval(() => {
        calendar.crudManager.sync().catch(error => {
            console.error('Polling sync failed:', error);
        });
    }, intervalMs);
}

function stopPolling(): void {
    if (pollInterval) {
        window.clearInterval(pollInterval);
    }
}

// Start polling
startPolling(5000);

// Stop bij unmount
window.addEventListener('beforeunload', stopPolling);
```

### Suspend/Resume Auto-Sync

```
calendar.d.ts:226402-226374
```

```typescript
// Suspend auto-sync
suspendAutoSync(): void              // :226404

// Resume auto-sync
resumeAutoSync(doSync?: boolean): void  // :226374
```

**Gebruik:**

```typescript
// Batch operaties zonder tussentijdse syncs
calendar.crudManager.suspendAutoSync();

try {
    // Voer meerdere wijzigingen uit
    eventStore.add([event1, event2, event3]);
    resourceStore.modify(resource);
} finally {
    // Resume en sync alle wijzigingen in één keer
    calendar.crudManager.resumeAutoSync(true);
}
```

---

## Event Lifecycle

### CrudManagerListenersTypes

```
calendar.d.ts:4641-4821
```

```typescript
// calendar.d.ts:4641
type CrudManagerListenersTypes = {
    // === LOAD EVENTS ===

    // Vóór load request wordt verzonden
    beforeLoad: (event: {                     // :4654
        source: AbstractCrudManager
        pack: object
    }) => Promise<boolean>|boolean|void

    // Vóór load response wordt toegepast
    beforeLoadApply: (event: {                // :4663
        source: AbstractCrudManager
        response: object
        options: object
    }) => Promise<boolean>|boolean|void

    // Load succesvol afgerond
    load: (event: {                           // :4733
        source: AbstractCrudManager
        response: object
        requestOptions: object
        rawResponse: Response
    }) => void

    // Load geannuleerd
    loadCanceled: (event: {                   // :4741
        source: AbstractCrudManager
        pack: object
    }) => void

    // Load gefaald
    loadFail: (event: {                       // :4752
        source: AbstractCrudManager
        response: object
        responseText: string
        requestOptions: object
        rawResponse: Response
    }) => void

    // === SYNC EVENTS ===

    // Vóór sync request wordt verzonden
    beforeSync: (event: {                     // :4692
        source: AbstractCrudManager
        pack: object
    }) => Promise<boolean>|boolean|void

    // Vóór sync response wordt toegepast
    beforeSyncApply: (event: {                // :4700
        source: AbstractCrudManager
        response: object
    }) => Promise<boolean>|boolean|void

    // Vóór request wordt verzonden (load of sync)
    beforeSend: (event: {                     // :4683
        crudManager: AbstractCrudManager
        params: object
        requestType: 'sync'|'load'
        requestConfig: object
    }) => Promise<void>

    // Sync succesvol afgerond
    sync: (event: {                           // :4795
        source: AbstractCrudManager
        response: object
        requestOptions: object
        rawResponse: Response
    }) => void

    // Sync geannuleerd
    syncCanceled: (event: {                   // :4802
        source: AbstractCrudManager
        pack: object
    }) => void

    // Sync vertraagd (vorige nog bezig)
    syncDelayed: (event: {                    // :4809
        source: AbstractCrudManager
        arguments: object
    }) => void

    // Sync gefaald
    syncFail: (event: {                       // :4820
        source: AbstractCrudManager
        response: object
        responseText: string
        requestOptions: object
        rawResponse: Response
    }) => void

    // === CHANGE TRACKING ===

    // Data heeft wijzigingen
    hasChanges: (event: {                     // :4723
        source: AbstractCrudManager
    }) => void

    // Geen wijzigingen meer
    noChanges: (event: {                      // :4762
        source: AbstractCrudManager
    }) => void

    // === GENERIC EVENTS ===

    // Vóór response wordt toegepast (load of sync)
    beforeResponseApply: (event: {            // :4672
        source: AbstractCrudManager
        requestType: 'sync'|'load'
        response: object
    }) => Promise<boolean>|boolean|void

    // Request afgerond (load of sync)
    requestDone: (event: {                    // :4773
        source: AbstractCrudManager
        requestType: 'sync'|'load'
        response: object
        requestOptions: object
        rawResponse: Response
    }) => void

    // Request gefaald (load of sync)
    requestFail: (event: {                    // :4785
        source: AbstractCrudManager
        requestType: 'sync'|'load'
        response: object
        responseText: string
        requestOptions: object
        rawResponse: Response
    }) => void
}
```

### Event Handler Voorbeeld

```typescript
const calendar = new Calendar({
    crudManager: {
        loadUrl: '/api/load',
        syncUrl: '/api/sync',

        listeners: {
            // Voeg authenticatie toe aan elke request
            beforeSend({ requestConfig, requestType }) {
                requestConfig.headers = {
                    ...requestConfig.headers,
                    'Authorization': `Bearer ${getToken()}`,
                    'X-Request-Type': requestType
                };
            },

            // Pre-process server response
            beforeLoadApply({ response }) {
                // Transform data indien nodig
                if (response.events?.rows) {
                    response.events.rows = response.events.rows.map(
                        event => transformEventFromServer(event)
                    );
                }
            },

            // Pre-process sync response
            beforeSyncApply({ response }) {
                // Voeg extra processing toe
                console.log('Sync response:', response);
            },

            // Success handlers
            load({ response }) {
                console.log('Data loaded successfully');
                showNotification('Gegevens geladen');
            },

            sync({ response }) {
                console.log('Data synced successfully');
                showNotification('Wijzigingen opgeslagen');
            },

            // Error handlers
            loadFail({ response, responseText }) {
                console.error('Load failed:', responseText);
                showError('Laden mislukt');
            },

            syncFail({ response, responseText }) {
                console.error('Sync failed:', responseText);
                showError('Opslaan mislukt');
            },

            // Change tracking
            hasChanges() {
                enableSaveButton();
            },

            noChanges() {
                disableSaveButton();
            }
        }
    }
});
```

---

## Request/Response Formaten

### Load Request/Response

**Request:**
```typescript
// GET /api/load?requestId=12345
```

**Response:**
```typescript
interface LoadResponse {
    success: boolean;
    requestId?: string;

    // Calendar-specifieke data
    events?: {
        rows: EventModel[];
    };
    resources?: {
        rows: ResourceModel[];
    };
    assignments?: {
        rows: AssignmentModel[];
    };
    resourceTimeRanges?: {
        rows: ResourceTimeRangeModel[];
    };
    timeRanges?: {
        rows: TimeRangeModel[];
    };
    calendars?: {
        rows: CalendarModel[];
    };
}
```

### Sync Request/Response

**Request:**
```typescript
interface SyncRequest {
    requestId: string;
    type: 'sync';

    events?: {
        added?: EventModel[];      // Nieuwe records
        updated?: EventModel[];    // Gewijzigde records
        removed?: { id: string|number }[];  // Verwijderde records
    };
    resources?: {
        added?: ResourceModel[];
        updated?: ResourceModel[];
        removed?: { id: string|number }[];
    };
    assignments?: {
        added?: AssignmentModel[];
        updated?: AssignmentModel[];
        removed?: { id: string|number }[];
    };
}
```

**Response:**
```typescript
interface SyncResponse {
    success: boolean;
    requestId?: string;

    events?: {
        rows?: Array<{
            $PhantomId?: string;  // Client-side phantom ID
            id: string|number;     // Server-side ID
            // Andere server-gegenereerde velden
        }>;
        removed?: { id: string|number }[];
    };
    resources?: {
        rows?: Array<{
            $PhantomId?: string;
            id: string|number;
        }>;
        removed?: { id: string|number }[];
    };
}
```

### LazyLoad Request Parameters

```
calendar.d.ts:2670-2695
```

```typescript
// calendar.d.ts:2670
type LazyLoadCrudManagerRequestParams = {
    // Start index voor paginering
    startIndex: number                    // :2674

    // Aantal records
    count: number                         // :2678

    // Datum range (optioneel)
    startDate?: Date                      // :2682
    endDate?: Date                        // :2686

    // Parent ID voor tree data
    parentId?: string|number              // :2690

    // Store IDs waarvoor data wordt gevraagd
    stores?: string[]                     // :2694
}
```

### CrudManagerRequestResponse Type

```
calendar.d.ts:2702-2709
```

```typescript
// calendar.d.ts:2702
type CrudManagerRequestResponse = {
    resources?: { data: { rows?: object[], total?: number } }
    events?: { data: { rows?: object[] } }
    assignments?: { data: { rows?: object[] } }
    resourceTimeRanges?: { data: { rows?: object[] } }
    timeRanges?: { data: { rows?: object[] } }
    calendars?: { data: { rows?: object[] } }
}
```

---

## WebSocket Integratie

Bryntum Calendar heeft geen ingebouwde WebSocket ondersteuning. Je moet een custom integratie bouwen die WebSocket berichten vertaalt naar CrudManager operaties.

### WebSocket Manager Klasse

```typescript
/**
 * WebSocket Manager voor Bryntum Calendar real-time updates
 */
class CalendarWebSocketManager {
    private socket: WebSocket | null = null;
    private calendar: Calendar;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 1000;
    private messageQueue: any[] = [];

    constructor(calendar: Calendar, private wsUrl: string) {
        this.calendar = calendar;
        this.connect();
    }

    /**
     * Verbind met WebSocket server
     */
    connect(): void {
        try {
            this.socket = new WebSocket(this.wsUrl);

            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
                this.flushMessageQueue();
                this.requestInitialData();
            };

            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };

            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                this.attemptReconnect();
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.attemptReconnect();
        }
    }

    /**
     * Verwerk inkomende berichten
     */
    private handleMessage(message: WebSocketMessage): void {
        switch (message.type) {
            case 'sync':
                this.applyRemoteChanges(message.data);
                break;
            case 'load':
                this.loadData(message.data);
                break;
            case 'conflict':
                this.handleConflict(message.data);
                break;
            case 'error':
                this.handleError(message.data);
                break;
        }
    }

    /**
     * Pas remote wijzigingen toe op de stores
     */
    private applyRemoteChanges(data: SyncData): void {
        const { eventStore, resourceStore, assignmentStore } = this.calendar;

        // Suspend events om loops te voorkomen
        eventStore.suspendEvents();
        resourceStore.suspendEvents();
        assignmentStore.suspendEvents();

        try {
            // Events verwerken
            if (data.events) {
                if (data.events.added) {
                    eventStore.add(data.events.added, { silent: true });
                }
                if (data.events.updated) {
                    data.events.updated.forEach(eventData => {
                        const event = eventStore.getById(eventData.id);
                        if (event) {
                            event.set(eventData, { silent: true });
                        }
                    });
                }
                if (data.events.removed) {
                    data.events.removed.forEach(({ id }) => {
                        const event = eventStore.getById(id);
                        if (event) {
                            eventStore.remove(event, { silent: true });
                        }
                    });
                }
            }

            // Resources verwerken
            if (data.resources) {
                // Vergelijkbare logica...
            }

            // Assignments verwerken
            if (data.assignments) {
                // Vergelijkbare logica...
            }
        } finally {
            // Resume events en trigger refresh
            eventStore.resumeEvents();
            resourceStore.resumeEvents();
            assignmentStore.resumeEvents();

            // Trigger UI refresh
            this.calendar.refresh();
        }
    }

    /**
     * Stuur lokale wijzigingen naar server
     */
    sendChanges(changes: object): void {
        const message = {
            type: 'sync',
            data: changes,
            timestamp: Date.now()
        };

        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            // Queue message voor wanneer verbinding hersteld is
            this.messageQueue.push(message);
        }
    }

    /**
     * Reconnect logica
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

            console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

            setTimeout(() => this.connect(), delay);
        } else {
            console.error('Max reconnect attempts reached');
            this.notifyConnectionLost();
        }
    }

    /**
     * Flush queued messages na reconnect
     */
    private flushMessageQueue(): void {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.socket?.send(JSON.stringify(message));
        }
    }

    /**
     * Disconnect
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

// Types
interface WebSocketMessage {
    type: 'sync' | 'load' | 'conflict' | 'error';
    data: any;
    timestamp?: number;
}

interface SyncData {
    events?: {
        added?: object[];
        updated?: object[];
        removed?: { id: string|number }[];
    };
    resources?: {
        added?: object[];
        updated?: object[];
        removed?: { id: string|number }[];
    };
    assignments?: {
        added?: object[];
        updated?: object[];
        removed?: { id: string|number }[];
    };
}
```

### Store Change Listener voor WebSocket

```typescript
/**
 * Koppel store wijzigingen aan WebSocket
 */
function setupWebSocketSync(calendar: Calendar, wsManager: CalendarWebSocketManager): void {
    const { eventStore, resourceStore, assignmentStore } = calendar;

    // Event store wijzigingen
    eventStore.on({
        add: ({ records }) => {
            wsManager.sendChanges({
                events: {
                    added: records.map(r => r.data)
                }
            });
        },

        update: ({ record, changes }) => {
            wsManager.sendChanges({
                events: {
                    updated: [{
                        id: record.id,
                        ...changes
                    }]
                }
            });
        },

        remove: ({ records }) => {
            wsManager.sendChanges({
                events: {
                    removed: records.map(r => ({ id: r.id }))
                }
            });
        }
    });

    // Vergelijkbare listeners voor andere stores...
}
```

### Socket.IO Integratie

```typescript
import { io, Socket } from 'socket.io-client';

class CalendarSocketIOManager {
    private socket: Socket;
    private calendar: Calendar;

    constructor(calendar: Calendar, serverUrl: string) {
        this.calendar = calendar;

        this.socket = io(serverUrl, {
            auth: {
                token: getAuthToken()
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        this.setupListeners();
    }

    private setupListeners(): void {
        this.socket.on('connect', () => {
            console.log('Socket.IO connected');
            this.socket.emit('calendar:subscribe', {
                calendarId: this.calendar.id
            });
        });

        // Server pushes updates
        this.socket.on('calendar:update', (data: SyncData) => {
            this.applyRemoteChanges(data);
        });

        // Conflict notification
        this.socket.on('calendar:conflict', (data: ConflictData) => {
            this.handleConflict(data);
        });

        // Presence updates (wie is aan het editen)
        this.socket.on('calendar:presence', (users: PresenceData[]) => {
            this.updatePresenceIndicators(users);
        });
    }

    /**
     * Emit local changes
     */
    emitChanges(changes: object): void {
        this.socket.emit('calendar:change', changes);
    }

    /**
     * Lock record voor editing
     */
    lockRecord(recordType: string, recordId: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.socket.emit('calendar:lock',
                { type: recordType, id: recordId },
                (response: { success: boolean }) => {
                    resolve(response.success);
                }
            );
        });
    }

    /**
     * Unlock record
     */
    unlockRecord(recordType: string, recordId: string): void {
        this.socket.emit('calendar:unlock', {
            type: recordType,
            id: recordId
        });
    }

    disconnect(): void {
        this.socket.disconnect();
    }
}

interface ConflictData {
    recordType: string;
    recordId: string;
    serverVersion: object;
    clientVersion: object;
}

interface PresenceData {
    userId: string;
    userName: string;
    recordType?: string;
    recordId?: string;
    action: 'viewing' | 'editing';
}
```

---

## Conflict Resolution

### Conflict Detection

```typescript
interface ConflictResolver {
    /**
     * Detecteer conflicten tussen lokale en server versies
     */
    detectConflict(localRecord: object, serverRecord: object): ConflictInfo | null;

    /**
     * Resolve conflict met strategie
     */
    resolveConflict(conflict: ConflictInfo, strategy: ConflictStrategy): object;
}

type ConflictStrategy = 'server-wins' | 'client-wins' | 'merge' | 'manual';

interface ConflictInfo {
    recordId: string;
    recordType: string;
    localChanges: Record<string, { old: any, new: any }>;
    serverChanges: Record<string, { old: any, new: any }>;
    conflictingFields: string[];
}

class CalendarConflictResolver implements ConflictResolver {
    detectConflict(localRecord: object, serverRecord: object): ConflictInfo | null {
        const localChanges: Record<string, any> = {};
        const serverChanges: Record<string, any> = {};
        const conflictingFields: string[] = [];

        // Vergelijk velden
        for (const key of Object.keys(serverRecord)) {
            if (localRecord[key] !== serverRecord[key]) {
                // Check of lokaal ook gewijzigd
                if (localRecord[`$original_${key}`] !== localRecord[key]) {
                    conflictingFields.push(key);
                }
                serverChanges[key] = serverRecord[key];
            }
        }

        if (conflictingFields.length === 0) {
            return null;
        }

        return {
            recordId: localRecord['id'],
            recordType: 'event', // Bepaal dynamisch
            localChanges,
            serverChanges,
            conflictingFields
        };
    }

    resolveConflict(conflict: ConflictInfo, strategy: ConflictStrategy): object {
        switch (strategy) {
            case 'server-wins':
                return conflict.serverChanges;

            case 'client-wins':
                return conflict.localChanges;

            case 'merge':
                // Merge strategie: laatste wijziging wint per veld
                return this.mergeChanges(conflict);

            case 'manual':
                // Return conflict voor user resolutie
                throw new ManualResolutionRequired(conflict);
        }
    }

    private mergeChanges(conflict: ConflictInfo): object {
        const merged: Record<string, any> = {};

        // Non-conflicting fields van beide
        for (const [key, value] of Object.entries(conflict.serverChanges)) {
            if (!conflict.conflictingFields.includes(key)) {
                merged[key] = value;
            }
        }

        // Conflicting fields: neem server versie (of implementeer timestamp-based)
        for (const key of conflict.conflictingFields) {
            merged[key] = conflict.serverChanges[key];
        }

        return merged;
    }
}
```

### Conflict UI Component

```typescript
class ConflictResolutionDialog {
    private dialog: Dialog;
    private conflict: ConflictInfo;
    private onResolve: (result: object) => void;

    show(conflict: ConflictInfo): Promise<object> {
        return new Promise((resolve) => {
            this.conflict = conflict;
            this.onResolve = resolve;

            this.dialog = new Dialog({
                title: 'Conflict Gedetecteerd',
                modal: true,
                closable: false,
                width: 600,

                items: [
                    {
                        type: 'widget',
                        html: this.renderConflictTable()
                    }
                ],

                bbar: [
                    {
                        text: 'Mijn Versie Behouden',
                        onClick: () => this.resolveWith('client-wins')
                    },
                    {
                        text: 'Server Versie Gebruiken',
                        onClick: () => this.resolveWith('server-wins')
                    },
                    {
                        text: 'Samenvoegen',
                        onClick: () => this.showMergeEditor()
                    }
                ]
            });

            this.dialog.show();
        });
    }

    private renderConflictTable(): string {
        let html = '<table class="conflict-table">';
        html += '<tr><th>Veld</th><th>Mijn Versie</th><th>Server Versie</th></tr>';

        for (const field of this.conflict.conflictingFields) {
            html += `<tr>
                <td>${field}</td>
                <td>${this.conflict.localChanges[field]?.new ?? '-'}</td>
                <td>${this.conflict.serverChanges[field] ?? '-'}</td>
            </tr>`;
        }

        html += '</table>';
        return html;
    }

    private resolveWith(strategy: ConflictStrategy): void {
        const resolver = new CalendarConflictResolver();
        const result = resolver.resolveConflict(this.conflict, strategy);
        this.dialog.close();
        this.onResolve(result);
    }
}
```

---

## Implementatie Richtlijnen

### 1. Basis Synchronisatie Setup

```typescript
// Minimale setup met HTTP polling
const calendar = new Calendar({
    appendTo: document.body,

    crudManager: {
        autoLoad: true,
        autoSync: true,
        autoSyncTimeout: 2000,

        loadUrl: '/api/calendar/load',
        syncUrl: '/api/calendar/sync',

        listeners: {
            loadFail({ response }) {
                showError('Laden mislukt: ' + response.message);
            },
            syncFail({ response }) {
                showError('Opslaan mislukt: ' + response.message);
            }
        }
    }
});
```

### 2. Real-Time Setup met WebSocket

```typescript
// Complete setup met WebSocket real-time updates
async function initializeCalendar(): Promise<void> {
    const calendar = new Calendar({
        appendTo: document.body,

        crudManager: {
            autoLoad: true,
            autoSync: false,  // We gebruiken WebSocket
            loadUrl: '/api/calendar/load'
        }
    });

    // Wacht tot initiële data geladen is
    await calendar.crudManager.load();

    // Start WebSocket verbinding
    const wsManager = new CalendarWebSocketManager(
        calendar,
        'wss://api.example.com/calendar'
    );

    // Koppel store events aan WebSocket
    setupWebSocketSync(calendar, wsManager);

    // Cleanup bij unmount
    window.addEventListener('beforeunload', () => {
        wsManager.disconnect();
    });
}
```

### 3. Optimistic Updates met Rollback

```typescript
class OptimisticUpdateManager {
    private pendingChanges: Map<string, object> = new Map();
    private calendar: Calendar;

    constructor(calendar: Calendar) {
        this.calendar = calendar;
    }

    /**
     * Voer update uit met automatische rollback bij fout
     */
    async applyUpdate(
        recordType: 'event' | 'resource' | 'assignment',
        recordId: string,
        changes: object
    ): Promise<void> {
        const store = this.getStore(recordType);
        const record = store.getById(recordId);

        if (!record) {
            throw new Error(`Record ${recordId} not found`);
        }

        // Bewaar originele waarden voor rollback
        const originalValues: Record<string, any> = {};
        for (const key of Object.keys(changes)) {
            originalValues[key] = record.get(key);
        }

        const changeId = `${recordType}-${recordId}-${Date.now()}`;
        this.pendingChanges.set(changeId, originalValues);

        try {
            // Optimistic update - pas direct toe
            record.set(changes);

            // Sync naar server
            await this.syncToServer(recordType, recordId, changes);

            // Success - verwijder pending change
            this.pendingChanges.delete(changeId);

        } catch (error) {
            // Rollback
            console.error('Update failed, rolling back:', error);
            record.set(originalValues);
            this.pendingChanges.delete(changeId);

            throw error;
        }
    }

    private getStore(type: string): Store {
        switch (type) {
            case 'event': return this.calendar.eventStore;
            case 'resource': return this.calendar.resourceStore;
            case 'assignment': return this.calendar.assignmentStore;
            default: throw new Error(`Unknown store type: ${type}`);
        }
    }

    private async syncToServer(
        type: string,
        id: string,
        changes: object
    ): Promise<void> {
        const response = await fetch('/api/calendar/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                [type + 's']: {
                    updated: [{ id, ...changes }]
                }
            })
        });

        if (!response.ok) {
            throw new Error('Sync failed');
        }
    }
}
```

### 4. Presence Indicators

```typescript
/**
 * Toon wie welke events aan het bewerken is
 */
class PresenceManager {
    private presenceData: Map<string, PresenceInfo> = new Map();
    private calendar: Calendar;

    constructor(calendar: Calendar) {
        this.calendar = calendar;
    }

    updatePresence(userId: string, recordId: string | null, action: 'editing' | 'viewing' | 'left'): void {
        if (action === 'left') {
            this.presenceData.delete(userId);
        } else {
            this.presenceData.set(userId, { recordId, action, userId });
        }

        this.renderPresenceIndicators();
    }

    private renderPresenceIndicators(): void {
        // Verwijder oude indicators
        document.querySelectorAll('.presence-indicator').forEach(el => el.remove());

        // Voeg nieuwe toe
        for (const [userId, info] of this.presenceData) {
            if (info.recordId && info.action === 'editing') {
                const eventElement = this.calendar.getEventElement(info.recordId);
                if (eventElement) {
                    const indicator = document.createElement('div');
                    indicator.className = 'presence-indicator';
                    indicator.title = `${userId} is aan het bewerken`;
                    indicator.style.backgroundColor = this.getUserColor(userId);
                    eventElement.appendChild(indicator);
                }
            }
        }
    }

    private getUserColor(userId: string): string {
        // Genereer consistente kleur per user
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${hash % 360}, 70%, 60%)`;
    }
}

interface PresenceInfo {
    userId: string;
    recordId: string | null;
    action: 'editing' | 'viewing';
}
```

---

## Samenvatting

| Aspect | Mechanisme | Locatie |
|--------|------------|---------|
| **CrudManager** | Centrale sync controller | `calendar.d.ts:5426` |
| **Transport** | HTTP via fetch API | `calendar.d.ts:5220` |
| **Auto-sync** | Debounced sync na wijzigingen | `calendar.d.ts:5031` |
| **Polling** | forceSync + interval | `calendar.d.ts:5083` |
| **Events** | beforeLoad, sync, syncFail, etc. | `calendar.d.ts:4641` |
| **Lazy Load** | On-demand data loading | `calendar.d.ts:2670` |
| **WebSocket** | Custom integratie vereist | - |

### Aanbevelingen voor Eigen Implementatie

1. **HTTP Polling**: Gebruik `forceSync: true` met een interval van 5-10 seconden voor eenvoudige real-time updates
2. **WebSocket**: Implementeer een custom WebSocket manager die store wijzigingen doorstuurt
3. **Conflict Resolution**: Implementeer server-side versioning (timestamp of version number)
4. **Optimistic Updates**: Pas wijzigingen direct toe met rollback bij server errors
5. **Presence**: Gebruik WebSocket rooms per calendar voor presence tracking
