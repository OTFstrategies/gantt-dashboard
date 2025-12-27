# TaskBoard Backend Synchronization - Implementation Guide

> **Uitgebreide documentatie** voor backend synchronisatie, CrudManager, en server-side integratie in Bryntum TaskBoard.

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Architectuur](#architectuur)
3. [Project Configuration](#project-configuration)
4. [CrudManager TypeScript Interfaces](#crudmanager-typescript-interfaces)
5. [Request/Response Formaat](#requestresponse-formaat)
6. [Event Lifecycle](#event-lifecycle)
7. [Store Configuratie](#store-configuratie)
8. [Error Handling](#error-handling)
9. [Revision Management](#revision-management)
10. [PHP Backend Implementatie](#php-backend-implementatie)
11. [Database Schema](#database-schema)
12. [Node.js Backend Alternatieven](#nodejs-backend-alternatieven)
13. [Optimistisch vs Pessimistisch Sync](#optimistisch-vs-pessimistisch-sync)
14. [Real-time Updates](#real-time-updates)
15. [Best Practices](#best-practices)

---

## Overzicht

TaskBoard gebruikt de **CrudManager** voor alle backend communicatie. Dit is een centrale manager die meerdere stores beheert en hun wijzigingen bundelt in enkele HTTP requests.

### Kernconcepten

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TaskBoard                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      Project                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │  TaskStore  │  │ResourceStore│  │  AssignmentStore    │  │   │
│  │  │  (tasks)    │  │ (resources) │  │  (assignments)      │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────┬───────────┘  │   │
│  │         │                │                    │              │   │
│  │         └────────────────┼────────────────────┘              │   │
│  │                          │                                    │   │
│  │                 ┌────────▼────────┐                          │   │
│  │                 │   CrudManager   │                          │   │
│  │                 │  ┌───────────┐  │                          │   │
│  │                 │  │  loadUrl  │  │                          │   │
│  │                 │  │  syncUrl  │  │                          │   │
│  │                 │  │  autoSync │  │                          │   │
│  │                 │  └───────────┘  │                          │   │
│  │                 └────────┬────────┘                          │   │
│  └──────────────────────────┼───────────────────────────────────┘   │
│                             │                                        │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   HTTP Requests   │
                    │  ┌─────────────┐  │
                    │  │ load.php    │  │
                    │  │ sync.php    │  │
                    │  └─────────────┘  │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │     Backend       │
                    │   (PHP/Node.js)   │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │     Database      │
                    │  (MySQL/Postgres) │
                    └───────────────────┘
```

### Sync Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────►│   Server    │────►│  Database   │
│  (Browser)  │◄────│ (PHP/Node)  │◄────│   (MySQL)   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │
      │  1. load()        │                    │
      │──────────────────►│                    │
      │                   │  2. SELECT         │
      │                   │───────────────────►│
      │                   │  3. rows           │
      │                   │◄───────────────────│
      │  4. JSON response │                    │
      │◄──────────────────│                    │
      │                   │                    │
      │  5. User edits    │                    │
      │                   │                    │
      │  6. sync()        │                    │
      │──────────────────►│                    │
      │                   │  7. INSERT/UPDATE  │
      │                   │───────────────────►│
      │                   │  8. affected IDs   │
      │                   │◄───────────────────│
      │  9. sync response │                    │
      │◄──────────────────│                    │
```

---

## Architectuur

### CrudManager Inheritance Chain

```
┌───────────────────────────────────────┐
│       AbstractCrudManagerMixin        │
│  - load(), sync()                     │
│  - autoSync, autoLoad                 │
│  - crudStores management              │
│  - transport configuration            │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│         AbstractCrudManager           │
│  - Request/response handling          │
│  - JSON encoding/decoding             │
│  - Error handling                     │
│  - Revision management                │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│       TaskBoardProjectModel           │
│  - TaskBoard specific stores          │
│  - taskStore, resourceStore           │
│  - assignmentStore, columnStore       │
│  - swimlaneStore                      │
└───────────────────────────────────────┘
```

### Store Types in TaskBoard

| Store | Default storeId | Model | Beschrijving |
|-------|-----------------|-------|--------------|
| **TaskStore** | `tasks` | TaskModel | Alle kaarten/taken |
| **ResourceStore** | `resources` | ResourceModel | Teamleden/gebruikers |
| **AssignmentStore** | `assignments` | AssignmentModel | Task-Resource koppelingen |
| **ColumnStore** | `columns` | ColumnModel | Kanban kolommen |
| **SwimlaneStore** | `swimlanes` | SwimlaneModel | Horizontale banen |

---

## Project Configuration

### Basis Configuratie

```javascript
const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Project met backend sync
    project: {
        // Convenience shortcuts
        loadUrl: 'api/load',
        syncUrl: 'api/sync',

        // Auto behavior
        autoLoad: true,      // Laad automatisch bij creatie
        autoSync: true,      // Sync automatisch na wijzigingen
        autoSyncTimeout: 500 // Wacht 500ms voor batching
    }
});
```

### Uitgebreide Transport Configuratie

```javascript
const taskBoard = new TaskBoard({
    project: {
        // Volledige transport configuratie
        transport: {
            load: {
                url: 'api/load',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                fetchOptions: {
                    credentials: 'include',
                    mode: 'cors'
                },
                // Query parameters
                params: {
                    includeArchived: false
                },
                // Timeout in ms
                timeout: 30000
            },
            sync: {
                url: 'api/sync',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                fetchOptions: {
                    credentials: 'include'
                }
            }
        },

        // Alternatief: form data i.p.v. JSON
        sendAsFormData: false,

        // Velden configuratie
        writeAllFields: false,  // Alleen gewijzigde velden versturen

        // Phantom ID handling
        phantomIdField: '$PhantomId',
        phantomParentIdField: '$PhantomParentId',
        resetIdsBeforeSync: true,

        // Revision tracking
        supportShortSyncResponse: true
    }
});
```

### Custom Store Configuratie

```javascript
const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'api/load',
        syncUrl: 'api/sync',

        // Custom TaskStore configuratie
        taskStore: {
            // Custom model class
            modelClass: class extends TaskModel {
                static fields = [
                    { name: 'name', defaultValue: 'New task' },
                    { name: 'description', defaultValue: '' },
                    { name: 'deadline', type: 'date' },
                    { name: 'priority', defaultValue: 'medium' },
                    // Custom field met alwaysWrite
                    {
                        name: 'lastModified',
                        type: 'date',
                        alwaysWrite: true  // Altijd meesturen bij sync
                    }
                ];
            },

            // Listener voor changes
            onChange({ action, records }) {
                console.log(`Store changed: ${action}`, records);
            }
        },

        // Custom ResourceStore
        resourceStore: {
            fields: [
                { name: 'name' },
                { name: 'email' },
                { name: 'image' },
                { name: 'role' }
            ]
        },

        // Custom AssignmentStore
        assignmentStore: {
            fields: [
                { name: 'event', dataSource: 'taskId' },  // Map naar backend veld
                { name: 'resource', dataSource: 'resourceId' }
            ]
        }
    }
});
```

---

## CrudManager TypeScript Interfaces

### AbstractCrudManagerConfig

```typescript
interface AbstractCrudManagerConfig {
    /**
     * Automatisch laden bij creatie
     */
    autoLoad?: boolean;

    /**
     * Automatisch synchroniseren na wijzigingen
     */
    autoSync?: boolean;

    /**
     * Timeout voor auto-sync batching (ms)
     */
    autoSyncTimeout?: number;

    /**
     * Shortcut voor load URL
     */
    loadUrl?: string;

    /**
     * Shortcut voor sync URL
     */
    syncUrl?: string;

    /**
     * Stores beheerd door CrudManager
     */
    crudStores?: Store[] | string[] | CrudManagerStoreDescriptor[];

    /**
     * Veld voor phantom record IDs
     */
    phantomIdField?: string;

    /**
     * Veld voor phantom parent IDs
     */
    phantomParentIdField?: string;

    /**
     * Reset phantom IDs voor sync
     */
    resetIdsBeforeSync?: boolean;

    /**
     * Verstuur alle velden bij updates
     */
    writeAllFields?: boolean;

    /**
     * Forceer sync ook zonder wijzigingen
     */
    forceSync?: boolean;

    /**
     * Accepteer responses zonder success property
     */
    skipSuccessProperty?: boolean;

    /**
     * Verstuur payload als form data
     */
    sendAsFormData?: boolean;

    /**
     * Transport configuratie
     */
    transport?: CrudManagerTransportConfig;

    /**
     * Event listeners
     */
    listeners?: AbstractCrudManagerListeners;
}
```

### CrudManagerTransportConfig

```typescript
interface CrudManagerTransportConfig {
    load?: {
        url?: string;
        method?: 'GET' | 'POST' | 'PUT';
        headers?: Record<string, string>;
        params?: Record<string, any>;
        paramName?: string;
        fetchOptions?: FetchOptions;
        timeout?: number;
    };

    sync?: {
        url?: string;
        method?: 'POST' | 'PUT' | 'PATCH';
        headers?: Record<string, string>;
        fetchOptions?: FetchOptions;
        timeout?: number;
    };
}

interface FetchOptions {
    credentials?: 'include' | 'same-origin' | 'omit';
    mode?: 'cors' | 'no-cors' | 'same-origin';
    cache?: 'default' | 'no-cache' | 'reload' | 'force-cache';
    redirect?: 'follow' | 'error' | 'manual';
}
```

### CrudManagerStoreDescriptor

```typescript
interface CrudManagerStoreDescriptor {
    /**
     * Unieke store identifier
     */
    storeId: string;

    /**
     * De store instance
     */
    store: Store;

    /**
     * Veld voor phantom record IDs
     */
    phantomIdField?: string;

    /**
     * ID veld naam
     */
    idField?: string;

    /**
     * Schrijf alle velden bij modificatie
     */
    writeAllFields?: boolean;
}
```

### AbstractCrudManagerListeners

```typescript
interface AbstractCrudManagerListeners {
    /**
     * Voordat load request wordt verstuurd
     */
    beforeLoad?: (event: {
        source: AbstractCrudManager;
        pack: object;
    }) => Promise<boolean> | boolean | void;

    /**
     * Voordat load data wordt toegepast
     */
    beforeLoadApply?: (event: {
        source: AbstractCrudManager;
        response: object;
        options: object;
    }) => Promise<boolean> | boolean | void;

    /**
     * Na succesvolle load
     */
    load?: (event: {
        source: AbstractCrudManager;
        response: object;
        requestOptions: object;
        rawResponse: Response;
    }) => void;

    /**
     * Bij load fout
     */
    loadFail?: (event: {
        source: AbstractCrudManager;
        response: object;
        responseText: string;
        requestOptions: object;
        rawResponse: Response;
    }) => void;

    /**
     * Als load is geannuleerd
     */
    loadCanceled?: (event: {
        source: AbstractCrudManager;
        pack: object;
    }) => void;

    /**
     * Voordat sync request wordt verstuurd
     */
    beforeSync?: (event: {
        source: AbstractCrudManager;
        pack: object;
    }) => Promise<boolean> | boolean | void;

    /**
     * Voordat sync data wordt toegepast
     */
    beforeSyncApply?: (event: {
        source: AbstractCrudManager;
        response: object;
    }) => Promise<boolean> | boolean | void;

    /**
     * Na succesvolle sync
     */
    sync?: (event: {
        source: AbstractCrudManager;
        response: object;
        requestOptions: object;
        rawResponse: Response;
    }) => void;

    /**
     * Bij sync fout
     */
    syncFail?: (event: {
        source: AbstractCrudManager;
        response: object;
        responseText: string;
        requestOptions: object;
        rawResponse: Response;
    }) => void;

    /**
     * Als sync is vertraagd door lopende sync
     */
    syncDelayed?: (event: {
        source: AbstractCrudManager;
        arguments: object;
    }) => void;

    /**
     * Als er wijzigingen zijn
     */
    hasChanges?: (event: {
        source: AbstractCrudManager;
    }) => void;

    /**
     * Als alle wijzigingen zijn gesynchroniseerd
     */
    noChanges?: (event: {
        source: AbstractCrudManager;
    }) => void;

    /**
     * Na elke succesvolle request (load of sync)
     */
    requestDone?: (event: {
        source: AbstractCrudManager;
        requestType: 'sync' | 'load';
        response: object;
        requestOptions: object;
        rawResponse: Response;
    }) => void;

    /**
     * Bij elke request fout
     */
    requestFail?: (event: {
        source: AbstractCrudManager;
        requestType: 'sync' | 'load';
        response: object;
        responseText: string;
        requestOptions: object;
        rawResponse: Response;
    }) => void;
}
```

### CrudManager Methods

```typescript
interface AbstractCrudManagerMixin {
    /**
     * Laad data van server
     */
    load(options?: {
        request?: object;
        [key: string]: any;
    }): Promise<any>;

    /**
     * Synchroniseer wijzigingen naar server
     */
    sync(): Promise<any>;

    /**
     * Annuleer lopende request
     */
    cancelRequest(promise: Promise<any>, reject: Function): void;

    /**
     * Laad CrudManager data handmatig
     */
    loadCrudManagerData(response: object, options?: object): void;

    /**
     * Check of er wijzigingen zijn
     */
    readonly changes: object | null;

    /**
     * Check of er een load gaande is
     */
    readonly isLoading: boolean;

    /**
     * Check of er een sync gaande is
     */
    readonly isSyncing: boolean;

    /**
     * Voeg store toe aan CrudManager
     */
    addCrudStore(
        store: Store | string | CrudManagerStoreDescriptor,
        position?: number,
        fromStore?: Store
    ): void;

    /**
     * Verwijder store uit CrudManager
     */
    removeCrudStore(store: Store | string): void;

    /**
     * Haal store descriptor op
     */
    getCrudStore(storeId: string): CrudManagerStoreDescriptor;

    /**
     * Accepteer wijzigingen (commit)
     */
    acceptChanges(): void;

    /**
     * Reject wijzigingen (rollback)
     */
    rejectChanges(): void;

    /**
     * Exporteer data als JSON
     */
    toJSON(): object;

    /**
     * Pas changeset toe
     */
    applyChangeset(
        changes: object,
        transformFn?: Function,
        phantomIdField?: string,
        clearChanges?: boolean
    ): void;
}
```

---

## Request/Response Formaat

### Load Request

```javascript
// GET request parameters
{
    "requestId": 1703680000000,
    "stores": [
        "tasks",
        "resources",
        "assignments",
        "columns"
    ]
}
```

### Load Response

```javascript
{
    "success": true,
    "requestId": 1703680000000,
    "revision": 42,

    // Taken
    "tasks": {
        "rows": [
            {
                "id": 1,
                "name": "Bug with rendering",
                "description": "Try it on any demo",
                "status": "review",
                "prio": "medium",
                "deadline": "2024-03-30"
            },
            {
                "id": 2,
                "name": "Add button to toolbar",
                "status": "done",
                "prio": "low"
            }
        ],
        "total": 22  // Optioneel: totaal aantal records
    },

    // Resources
    "resources": {
        "rows": [
            {
                "id": 1,
                "name": "Angelo",
                "image": "angelo.png"
            },
            {
                "id": 2,
                "name": "Celia",
                "image": "celia.png"
            }
        ],
        "total": 7
    },

    // Assignments
    "assignments": {
        "rows": [
            { "id": 1, "event": 1, "resource": 1 },
            { "id": 2, "event": 1, "resource": 5 },
            { "id": 3, "event": 2, "resource": 2 }
        ]
    },

    // Kolommen (optioneel - kan ook client-side zijn)
    "columns": {
        "rows": [
            { "id": "todo", "text": "Backlog", "color": "purple" },
            { "id": "doing", "text": "In Progress", "color": "orange" },
            { "id": "review", "text": "Review", "color": "blue" },
            { "id": "done", "text": "Done", "color": "green" }
        ]
    }
}
```

### Sync Request

```javascript
// POST body
{
    "requestId": 1703680001000,
    "revision": 42,  // Huidige client revision

    // Taken wijzigingen
    "tasks": {
        // Nieuwe records (phantom IDs)
        "added": [
            {
                "$PhantomId": "_generated-1",
                "name": "New Task",
                "status": "todo",
                "prio": "medium"
            }
        ],

        // Gewijzigde records
        "updated": [
            {
                "id": 1,
                "status": "done",
                "progress": 100
            },
            {
                "id": 3,
                "name": "Updated name"
            }
        ],

        // Verwijderde records
        "removed": [
            { "id": 5 },
            { "id": 8 }
        ]
    },

    // Assignment wijzigingen
    "assignments": {
        "added": [
            {
                "$PhantomId": "_generated-2",
                "event": "_generated-1",  // Referentie naar phantom task
                "resource": 3
            }
        ],
        "removed": [
            { "id": 10 }
        ]
    }
}
```

### Sync Response

```javascript
{
    "success": true,
    "requestId": 1703680001000,
    "revision": 43,  // Nieuwe server revision

    // Bevestiging + nieuwe IDs
    "tasks": {
        "rows": [
            {
                // Map phantom ID naar echte ID
                "$PhantomId": "_generated-1",
                "id": 23
            }
        ]
    },

    "assignments": {
        "rows": [
            {
                "$PhantomId": "_generated-2",
                "id": 45,
                "event": 23  // Nu met echte task ID
            }
        ]
    }
}
```

### Error Response

```javascript
{
    "success": false,
    "requestId": 1703680001000,
    "message": "Validation failed",
    "code": 400,

    // Optioneel: per-record errors
    "tasks": {
        "rows": [
            {
                "id": 1,
                "error": "Cannot move task to Done without approval"
            }
        ]
    }
}
```

---

## Event Lifecycle

### Load Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LOAD LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐                                                   │
│  │ project.load()│                                                   │
│  └──────┬───────┘                                                   │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────────────┐                                           │
│  │  beforeLoad event    │◄─── Return false to cancel                │
│  │  (cancelable)        │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│      ┌──────┴──────┐                                                │
│      │   Canceled? │                                                │
│      └──────┬──────┘                                                │
│        No   │   Yes                                                  │
│             │    └────► loadCanceled event ────► END                │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │    loadStart event   │                                           │
│  │ (isCrudManagerLoading│                                           │
│  │  = true)             │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │   HTTP Request       │────► Server                               │
│  │   (loadUrl)          │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│      ┌──────┴──────┐                                                │
│      │  Success?   │                                                │
│      └──────┬──────┘                                                │
│       Yes   │   No                                                   │
│             │    └────► loadFail event ────► END                    │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │ beforeLoadApply      │◄─── Modify response before applying       │
│  │ (cancelable)         │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │ Apply data to stores │                                           │
│  │ (loadApplySequence)  │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │     load event       │                                           │
│  │ (isCrudManagerLoading│                                           │
│  │  = false)            │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │   requestDone event  │                                           │
│  └──────────────────────┘                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Sync Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SYNC LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────┐             │
│  │               Change Detection                      │             │
│  │  Store.onChange → hasChanges event                 │             │
│  │  (if autoSync: schedules sync after timeout)       │             │
│  └────────────────────────┬───────────────────────────┘             │
│                           │                                          │
│                           ▼                                          │
│  ┌──────────────┐                                                   │
│  │ project.sync()│                                                   │
│  └──────┬───────┘                                                   │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────────────┐                                           │
│  │  Sync already        │                                           │
│  │  in progress?        │                                           │
│  └──────────┬───────────┘                                           │
│        Yes  │   No                                                   │
│             │    └────► syncDelayed event ────► Queue               │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │  beforeSync event    │◄─── Return false to cancel                │
│  │  (cancelable)        │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│      ┌──────┴──────┐                                                │
│      │   Canceled? │                                                │
│      └──────┬──────┘                                                │
│        No   │   Yes                                                  │
│             │    └────► syncCanceled event ────► END                │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │    syncStart event   │                                           │
│  │ (isCrudManagerSyncing│                                           │
│  │  = true)             │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │   Collect changes    │                                           │
│  │   from all stores    │                                           │
│  │   (crudStores)       │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │   HTTP Request       │────► Server                               │
│  │   (syncUrl)          │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│      ┌──────┴──────┐                                                │
│      │  Success?   │                                                │
│      └──────┬──────┘                                                │
│       Yes   │   No                                                   │
│             │    └────► syncFail event ────► END                    │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │ beforeSyncApply      │◄─── Modify response before applying       │
│  │ (cancelable)         │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │ Apply response       │                                           │
│  │ - Map phantom IDs    │                                           │
│  │ - Update records     │                                           │
│  │ (syncApplySequence)  │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │     sync event       │                                           │
│  │ (isCrudManagerSyncing│                                           │
│  │  = false)            │                                           │
│  └──────────┬───────────┘                                           │
│             │                                                        │
│             ▼                                                        │
│  ┌──────────────────────┐                                           │
│  │   noChanges event    │ (if all synced)                           │
│  └──────────────────────┘                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Event Listeners Voorbeeld

```javascript
const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'api/load',
        syncUrl: 'api/sync',
        autoSync: true,

        // Event listeners
        onLoadStart() {
            showSpinner('Loading...');
        },

        onLoad({ response }) {
            hideSpinner();
            showToast(`Loaded ${response.tasks.rows.length} tasks`);
        },

        onLoadFail({ response, responseText }) {
            hideSpinner();
            showError(response?.message || 'Load failed');
        },

        onSyncStart() {
            showSpinner('Saving...');
        },

        onSync({ response }) {
            hideSpinner();
            showToast('Changes saved');
        },

        onSyncFail({ response }) {
            hideSpinner();
            showError(response?.message || 'Sync failed');

            // Optioneel: rollback
            this.rejectChanges();
        },

        onHasChanges() {
            setUnsavedIndicator(true);
        },

        onNoChanges() {
            setUnsavedIndicator(false);
        }
    }
});
```

---

## Store Configuratie

### TaskStore met Custom Fields

```javascript
import { TaskModel } from '@bryntum/taskboard';

class CustomTask extends TaskModel {
    static fields = [
        // Basis velden
        { name: 'name', type: 'string', defaultValue: 'New task' },
        { name: 'description', type: 'string', defaultValue: '' },

        // Status/workflow
        { name: 'status', type: 'string', defaultValue: 'todo' },
        { name: 'prio', type: 'string', defaultValue: 'medium' },

        // Dates
        {
            name: 'deadline',
            type: 'date',
            format: 'YYYY-MM-DD'
        },
        {
            name: 'createdAt',
            type: 'date',
            persist: false  // Niet naar server sturen
        },

        // Numeriek
        { name: 'progress', type: 'number', defaultValue: 0 },
        { name: 'storyPoints', type: 'integer', defaultValue: 1 },

        // Relaties
        { name: 'parentId', type: 'string' },
        { name: 'labels', type: 'string' },  // Comma-separated

        // Tracking
        {
            name: 'lastModifiedBy',
            type: 'string',
            alwaysWrite: true  // Altijd meesturen
        },

        // Read-only
        { name: 'readOnly', type: 'boolean', defaultValue: false }
    ];

    // Computed property
    get isOverdue() {
        return this.deadline && new Date(this.deadline) < new Date();
    }

    // Custom method
    markAsComplete() {
        this.status = 'done';
        this.progress = 100;
    }
}

const taskBoard = new TaskBoard({
    project: {
        taskStore: {
            modelClass: CustomTask
        }
    }
});
```

### Field Mapping met dataSource

```javascript
// Backend gebruikt andere veldnamen
class BackendTask extends TaskModel {
    static fields = [
        // Map client veld naar server veld
        { name: 'name', dataSource: 'title' },
        { name: 'description', dataSource: 'desc' },
        { name: 'status', dataSource: 'workflow_status' },
        { name: 'deadline', dataSource: 'due_date', type: 'date' },

        // Assignment mappings
        { name: 'event', dataSource: 'task_id' },
        { name: 'resource', dataSource: 'user_id' }
    ];
}
```

### Store onChange Handler

```javascript
const taskBoard = new TaskBoard({
    project: {
        taskStore: {
            onChange({ action, records, changes }) {
                console.log('TaskStore changed:', action);

                switch (action) {
                    case 'add':
                        console.log('Tasks added:', records.map(r => r.name));
                        break;
                    case 'remove':
                        console.log('Tasks removed:', records.map(r => r.id));
                        break;
                    case 'update':
                        console.log('Tasks updated:', changes);
                        break;
                }

                // Update UI
                updateStatusIndicator();
            }
        },

        assignmentStore: {
            onChange({ action, records }) {
                if (action === 'add') {
                    console.log('New assignments:', records);
                }
            }
        }
    }
});
```

---

## Error Handling

### Basis Error Handling

```javascript
const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'api/load',
        syncUrl: 'api/sync',

        onLoadFail({ response, responseText, rawResponse }) {
            // HTTP error
            if (rawResponse.status === 401) {
                redirectToLogin();
                return;
            }

            // Server error
            if (response?.code === 'MAINTENANCE') {
                showMaintenanceModal();
                return;
            }

            // Generic error
            showErrorToast(response?.message || 'Failed to load data');
        },

        onSyncFail({ response, responseText, rawResponse }) {
            // Conflict detection
            if (response?.code === 'CONFLICT') {
                showConflictResolver(response.conflicts);
                return;
            }

            // Validation error
            if (response?.code === 'VALIDATION_ERROR') {
                highlightInvalidRecords(response.errors);
                return;
            }

            // Rollback bij fatale error
            if (rawResponse.status >= 500) {
                this.rejectChanges();
                showErrorToast('Server error - changes reverted');
                return;
            }

            showErrorToast(response?.message || 'Failed to save changes');
        }
    }
});
```

### Retry Logic

```javascript
class RetryableCrudManager {
    constructor(taskBoard, maxRetries = 3) {
        this.taskBoard = taskBoard;
        this.maxRetries = maxRetries;
        this.retryCount = 0;

        taskBoard.project.on({
            syncFail: this.handleSyncFail.bind(this),
            sync: this.handleSyncSuccess.bind(this)
        });
    }

    async handleSyncFail({ rawResponse }) {
        // Alleen retry bij network/server errors
        if (rawResponse.status >= 500 || !navigator.onLine) {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                const delay = Math.pow(2, this.retryCount) * 1000;

                showToast(`Retrying in ${delay/1000}s... (${this.retryCount}/${this.maxRetries})`);

                await this.delay(delay);
                this.taskBoard.project.sync();
            } else {
                showError('Failed after multiple retries');
                this.retryCount = 0;
            }
        }
    }

    handleSyncSuccess() {
        this.retryCount = 0;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

### Per-Record Error Handling

```javascript
// Server response met per-record errors
{
    "success": false,
    "tasks": {
        "rows": [
            {
                "id": 1,
                "success": false,
                "error": "Cannot change status without approval"
            },
            {
                "id": 2,
                "success": true
            }
        ]
    }
}

// Client handling
const taskBoard = new TaskBoard({
    project: {
        onBeforeSyncApply({ response }) {
            // Check per-record errors
            if (response.tasks?.rows) {
                const errors = response.tasks.rows.filter(r => !r.success);

                if (errors.length > 0) {
                    errors.forEach(error => {
                        const task = this.taskStore.getById(error.id);

                        // Mark als invalid
                        task.set('_validationError', error.error);

                        // Rollback deze specifieke record
                        task.revertChanges();
                    });

                    showValidationErrors(errors);
                }
            }

            // Laat succesvolle records door
            return true;
        }
    }
});
```

---

## Revision Management

### Server-side Revision Tracking

```javascript
// PHP: Revision tracking
class RevisionManager {
    private $db;

    public function getRevision(): int {
        $stmt = $this->db->query("SELECT value FROM options WHERE name = 'revision'");
        return (int)$stmt->fetchColumn();
    }

    public function incrementRevision(): int {
        $this->db->exec("UPDATE options SET value = value + 1 WHERE name = 'revision'");
        return $this->getRevision();
    }

    public function checkRevision(int $clientRevision): void {
        $serverRevision = $this->getRevision();

        if ($clientRevision < $serverRevision) {
            throw new Exception(
                'Data has been modified by another user. Please reload.',
                409  // Conflict
            );
        }
    }
}
```

### Client-side Conflict Detection

```javascript
const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'api/load',
        syncUrl: 'api/sync',

        onBeforeSync({ pack }) {
            // Stuur huidige revision mee
            pack.revision = this.revision;
            return true;
        },

        onSyncFail({ response }) {
            if (response?.code === 409) {
                // Conflict - data is gewijzigd door anderen
                showConflictDialog({
                    message: response.message,
                    onReload: () => {
                        this.rejectChanges();
                        this.load();
                    },
                    onForce: () => {
                        // Force sync (gevaarlijk!)
                        this.forceSync = true;
                        this.sync();
                        this.forceSync = false;
                    }
                });
            }
        },

        onLoad({ response }) {
            // Update client revision
            this.revision = response.revision;
        },

        onSync({ response }) {
            // Update client revision
            if (response.revision) {
                this.revision = response.revision;
            }
        }
    }
});
```

---

## PHP Backend Implementatie

### Project Structuur

```
backend-sync/
├── php/
│   ├── config.template.php
│   ├── config.php          (git ignored)
│   ├── init.php
│   ├── load.php
│   ├── sync.php
│   ├── setup.php
│   └── lib/
│       ├── TaskBoard.php
│       ├── TaskSyncHandler.php
│       ├── ResourceSyncHandler.php
│       └── AssignmentSyncHandler.php
├── sql/
│   └── setup.sql
└── data/
    └── data.json            (fallback)
```

### config.php

```php
<?php

const DBHOST = 'localhost';
const DBUSERNAME = 'root';
const DBUSERPASSWORD = 'password';
const DBNAME = 'taskboard';

const DSN = 'mysql:host=' . DBHOST . ';dbname=' . DBNAME . ';charset=utf8mb4';
```

### init.php

```php
<?php

namespace Bryntum\TaskBoard;

require_once './config.php';
require_once './lib/TaskBoard.php';
require_once './lib/TaskSyncHandler.php';
require_once './lib/ResourceSyncHandler.php';
require_once './lib/AssignmentSyncHandler.php';

ini_set('session.gc_maxlifetime', 14400);

if (!session_id()) {
    session_start();
}

$app = new TaskBoard(DSN, DBUSERNAME, DBUSERPASSWORD);

if (!isset($app)) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => 'Database connection error'
    ]));
}
```

### load.php

```php
<?php

namespace Bryntum\TaskBoard;

header('Content-Type: application/json');

try {
    require 'init.php';

    // Decode request
    $requestData = $_GET['data'] ?? '{}';
    $request = json_decode($requestData, true);

    $response = [
        'success' => true,
        'requestId' => $request['requestId'] ?? null
    ];

    // Handle reset option (for demo purposes)
    if (isset($request['reset']) && $request['reset']) {
        $app->resetDatabase();
        $response['reset'] = true;
    }

    // Parse requested stores
    $storeParams = [];
    foreach (($request['stores'] ?? []) as $store) {
        if (is_array($store)) {
            $storeParams[$store['storeId']] = $store;
        } else {
            $storeParams[$store] = $store;
        }
    }

    // Load resources
    if (isset($storeParams['resources'])) {
        $response['resources'] = [
            'rows' => $app->getResources(),
            'total' => $app->getFoundRows()
        ];
    }

    // Load tasks
    if (isset($storeParams['tasks'])) {
        $response['tasks'] = [
            'rows' => $app->getTasks(),
            'total' => $app->getFoundRows()
        ];
    }

    // Load assignments
    if (isset($storeParams['assignments'])) {
        $response['assignments'] = [
            'rows' => $app->getAssignments()
        ];
    }

    // Load columns (if stored in DB)
    if (isset($storeParams['columns'])) {
        $response['columns'] = [
            'rows' => $app->getColumns()
        ];
    }

    // Return current revision
    $response['revision'] = $app->getRevision();

    echo json_encode($response);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
}
```

### sync.php

```php
<?php

namespace Bryntum\TaskBoard;

use const Bryntum\CRUD\ADDED_ROWS;
use const Bryntum\CRUD\UPDATED_ROWS;
use const Bryntum\CRUD\REMOVED_ROWS;

header('Content-Type: application/json');

try {
    require 'init.php';

    // Read POST body
    $input = file_get_contents('php://input');
    $request = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new \Exception('Invalid JSON in request body', 400);
    }

    $response = [
        'success' => true,
        'requestId' => $request['requestId'] ?? null
    ];

    // Begin transaction
    $app->db->beginTransaction();

    try {
        // Check revision (optimistic locking)
        if (isset($request['revision'])) {
            $app->checkRevision($request['revision']);
        }

        // Initialize handlers
        $resourceHandler = null;
        $taskHandler = null;
        $assignmentHandler = null;

        // Process resources (add/update first)
        if (isset($request['resources'])) {
            $resourceHandler = new ResourceSyncHandler($app);
            $response['resources'] = $resourceHandler->handle(
                $request['resources'],
                ADDED_ROWS | UPDATED_ROWS
            );
        }

        // Process tasks
        if (isset($request['tasks'])) {
            $taskHandler = new TaskSyncHandler($app);
            $response['tasks'] = $taskHandler->handle(
                $request['tasks'],
                ADDED_ROWS | UPDATED_ROWS
            );
        }

        // Process assignments
        if (isset($request['assignments'])) {
            $assignmentHandler = new AssignmentSyncHandler($app);
            $response['assignments'] = $assignmentHandler->handle(
                $request['assignments'],
                ADDED_ROWS | UPDATED_ROWS
            );
        }

        // Process removals (in reverse order)
        if ($assignmentHandler) {
            $assignmentHandler->handle($request['assignments'], REMOVED_ROWS, $response['assignments']);
        }

        if ($taskHandler) {
            $taskHandler->handle($request['tasks'], REMOVED_ROWS, $response['tasks']);
        }

        if ($resourceHandler) {
            $resourceHandler->handle($request['resources'], REMOVED_ROWS, $response['resources']);
        }

        // Cleanup empty responses
        foreach (['resources', 'tasks', 'assignments'] as $store) {
            if (isset($response[$store]) && empty($response[$store])) {
                unset($response[$store]);
            }
        }

        // Commit transaction
        $app->db->commit();

        // Return new revision
        $response['revision'] = $app->incrementRevision();

        echo json_encode($response);

    } catch (\Exception $e) {
        $app->db->rollBack();
        throw $e;
    }

} catch (\Exception $e) {
    $code = $e->getCode() ?: 500;
    http_response_code($code);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'code' => $code
    ]);
}
```

### TaskSyncHandler.php

```php
<?php

namespace Bryntum\TaskBoard;

use const Bryntum\CRUD\ADDED_ROWS;
use const Bryntum\CRUD\UPDATED_ROWS;
use const Bryntum\CRUD\REMOVED_ROWS;

class TaskSyncHandler {

    private $app;
    private $db;
    private $phantomIdMap = [];

    public function __construct(TaskBoard $app) {
        $this->app = $app;
        $this->db = $app->db;
    }

    public function handle(array $data, int $mode, array &$response = []): array {

        // Process additions
        if ($mode & ADDED_ROWS && isset($data['added'])) {
            foreach ($data['added'] as $row) {
                $result = $this->addTask($row);
                $response['rows'][] = $result;

                // Track phantom ID mapping
                if (isset($row['$PhantomId'])) {
                    $this->phantomIdMap[$row['$PhantomId']] = $result['id'];
                }
            }
        }

        // Process updates
        if ($mode & UPDATED_ROWS && isset($data['updated'])) {
            foreach ($data['updated'] as $row) {
                $this->updateTask($row);
            }
        }

        // Process removals
        if ($mode & REMOVED_ROWS && isset($data['removed'])) {
            foreach ($data['removed'] as $row) {
                $this->removeTask($row['id']);
            }
        }

        return $response;
    }

    private function addTask(array $data): array {
        $stmt = $this->db->prepare("
            INSERT INTO tasks (name, description, status, prio, deadline, weight)
            VALUES (:name, :description, :status, :prio, :deadline, :weight)
        ");

        $stmt->execute([
            ':name' => $data['name'] ?? 'New Task',
            ':description' => $data['description'] ?? '',
            ':status' => $data['status'] ?? 'todo',
            ':prio' => $data['prio'] ?? 'medium',
            ':deadline' => $data['deadline'] ?? null,
            ':weight' => $data['weight'] ?? 0
        ]);

        $newId = $this->db->lastInsertId();

        $result = ['id' => (int)$newId];

        // Return phantom ID mapping
        if (isset($data['$PhantomId'])) {
            $result['$PhantomId'] = $data['$PhantomId'];
        }

        return $result;
    }

    private function updateTask(array $data): void {
        $id = $data['id'];
        unset($data['id']);

        // Filter alleen toegestane velden
        $allowedFields = ['name', 'description', 'status', 'prio', 'deadline', 'weight', 'eventColor', 'cls', 'iconCls'];

        $updates = [];
        $params = [':id' => $id];

        foreach ($data as $field => $value) {
            if (in_array($field, $allowedFields)) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $value;
            }
        }

        if (empty($updates)) {
            return;
        }

        $sql = "UPDATE tasks SET " . implode(', ', $updates) . " WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
    }

    private function removeTask(int $id): void {
        // Cascade delete is handled by foreign keys
        $stmt = $this->db->prepare("DELETE FROM tasks WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }

    public function getPhantomIdMap(): array {
        return $this->phantomIdMap;
    }
}
```

---

## Database Schema

### MySQL Schema

```sql
-- Tasks table
CREATE TABLE IF NOT EXISTS `tasks` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL DEFAULT 'New Task',
    `description` TEXT DEFAULT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'todo',
    `prio` VARCHAR(20) DEFAULT 'medium',
    `weight` INT(11) DEFAULT 0,
    `deadline` DATETIME DEFAULT NULL,
    `eventColor` VARCHAR(50) DEFAULT NULL,
    `cls` VARCHAR(255) DEFAULT NULL,
    `iconCls` VARCHAR(255) DEFAULT NULL,
    `parentId` INT(11) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_prio` (`prio`),
    INDEX `idx_parent` (`parentId`),
    CONSTRAINT `fk_task_parent` FOREIGN KEY (`parentId`)
        REFERENCES `tasks`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Resources table
CREATE TABLE IF NOT EXISTS `resources` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `image` VARCHAR(255) DEFAULT NULL,
    `role` VARCHAR(50) DEFAULT NULL,
    `active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Assignments table (many-to-many)
CREATE TABLE IF NOT EXISTS `assignments` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `event` INT(11) NOT NULL,    -- task_id
    `resource` INT(11) NOT NULL, -- resource_id
    `units` DECIMAL(5,2) DEFAULT 100.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_event_resource` (`event`, `resource`),
    INDEX `idx_event` (`event`),
    INDEX `idx_resource` (`resource`),
    CONSTRAINT `fk_assignment_task` FOREIGN KEY (`event`)
        REFERENCES `tasks`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_assignment_resource` FOREIGN KEY (`resource`)
        REFERENCES `resources`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Columns table (optioneel - voor dynamische kolommen)
CREATE TABLE IF NOT EXISTS `columns` (
    `id` VARCHAR(50) NOT NULL,
    `text` VARCHAR(100) NOT NULL,
    `color` VARCHAR(50) DEFAULT NULL,
    `collapsed` TINYINT(1) DEFAULT 0,
    `weight` INT(11) DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Swimlanes table (optioneel)
CREATE TABLE IF NOT EXISTS `swimlanes` (
    `id` VARCHAR(50) NOT NULL,
    `text` VARCHAR(100) NOT NULL,
    `color` VARCHAR(50) DEFAULT NULL,
    `collapsed` TINYINT(1) DEFAULT 0,
    `weight` INT(11) DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Options table (voor revision tracking)
CREATE TABLE IF NOT EXISTS `options` (
    `name` VARCHAR(50) NOT NULL,
    `value` VARCHAR(255) DEFAULT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initialize revision
INSERT INTO `options` (`name`, `value`) VALUES ('revision', '1')
ON DUPLICATE KEY UPDATE `value` = `value`;
```

### Sample Data

```sql
-- Resources
INSERT INTO `resources` (`id`, `name`, `email`, `image`, `role`) VALUES
(1, 'Angelo', 'angelo@example.com', 'angelo.png', 'Developer'),
(2, 'Celia', 'celia@example.com', 'celia.png', 'Designer'),
(3, 'Dave', 'dave@example.com', 'dave.png', 'Developer'),
(4, 'Emilia', 'emilia@example.com', 'emilia.png', 'Manager'),
(5, 'Gloria', 'gloria@example.com', 'gloria.png', 'QA'),
(6, 'Henrik', 'henrik@example.com', 'henrik.png', 'DevOps'),
(7, 'Kate', 'kate@example.com', 'kate.png', 'Developer');

-- Tasks
INSERT INTO `tasks` (`id`, `name`, `description`, `status`, `prio`, `deadline`, `weight`) VALUES
(1, 'Bug with rendering', 'Try it on any demo, reproduces easily', 'review', 'medium', '2024-05-30', 100),
(2, 'Add button to toolbar', 'Should look like a proper button', 'done', 'low', '2024-08-29', 200),
(3, 'Remove overflow', 'It is overflowing everywhere', 'doing', 'medium', '2024-03-30', 300),
(4, 'Write tests', 'Test coverage is approximately 5%', 'done', 'high', '2024-03-30', 400),
(5, 'Refactor base class', 'It is currently a mess', 'todo', 'low', '2024-05-30', 500);

-- Assignments
INSERT INTO `assignments` (`event`, `resource`) VALUES
(1, 1), (1, 5),
(2, 2), (2, 6),
(3, 3), (3, 7),
(4, 1), (4, 4),
(5, 2), (5, 3);

-- Columns
INSERT INTO `columns` (`id`, `text`, `color`, `weight`) VALUES
('todo', 'Backlog', 'purple', 0),
('doing', 'In Progress', 'orange', 1),
('review', 'Review', 'blue', 2),
('done', 'Done', 'green', 3);
```

---

## Node.js Backend Alternatieven

### Express.js Implementation

```javascript
// server.js
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';  // of mysql2

const app = express();
const pool = new Pool({
    host: 'localhost',
    database: 'taskboard',
    user: 'root',
    password: 'password'
});

app.use(cors());
app.use(express.json());

// Revision management
let revision = 1;

// Load endpoint
app.get('/api/load', async (req, res) => {
    try {
        const requestData = JSON.parse(req.query.data || '{}');
        const stores = requestData.stores || ['tasks', 'resources', 'assignments'];

        const response = {
            success: true,
            requestId: requestData.requestId
        };

        if (stores.includes('tasks')) {
            const { rows } = await pool.query('SELECT * FROM tasks ORDER BY weight');
            response.tasks = { rows };
        }

        if (stores.includes('resources')) {
            const { rows } = await pool.query('SELECT * FROM resources WHERE active = true');
            response.resources = { rows };
        }

        if (stores.includes('assignments')) {
            const { rows } = await pool.query('SELECT * FROM assignments');
            response.assignments = { rows };
        }

        response.revision = revision;

        res.json(response);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Sync endpoint
app.post('/api/sync', async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const request = req.body;
        const response = {
            success: true,
            requestId: request.requestId
        };

        // Check revision
        if (request.revision && request.revision < revision) {
            throw new Error('Data has been modified. Please reload.');
        }

        // Process tasks
        if (request.tasks) {
            response.tasks = { rows: [] };

            // Added
            for (const task of request.tasks.added || []) {
                const { rows } = await client.query(
                    `INSERT INTO tasks (name, description, status, prio, weight)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id`,
                    [task.name, task.description, task.status, task.prio, task.weight || 0]
                );

                response.tasks.rows.push({
                    '$PhantomId': task['$PhantomId'],
                    id: rows[0].id
                });
            }

            // Updated
            for (const task of request.tasks.updated || []) {
                const { id, ...fields } = task;
                const updates = Object.keys(fields)
                    .filter(k => !k.startsWith('$'))
                    .map((k, i) => `${k} = $${i + 2}`)
                    .join(', ');

                if (updates) {
                    const values = Object.values(fields).filter((v, i) =>
                        !Object.keys(fields)[i].startsWith('$')
                    );
                    await client.query(
                        `UPDATE tasks SET ${updates} WHERE id = $1`,
                        [id, ...values]
                    );
                }
            }

            // Removed
            for (const task of request.tasks.removed || []) {
                await client.query('DELETE FROM tasks WHERE id = $1', [task.id]);
            }
        }

        // Process assignments similarly...

        await client.query('COMMIT');

        revision++;
        response.revision = revision;

        res.json(response);

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(error.message.includes('modified') ? 409 : 500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
});

app.listen(3000, () => {
    console.log('TaskBoard API running on port 3000');
});
```

---

## Optimistisch vs Pessimistisch Sync

### Optimistisch (Default)

```javascript
// Wijzigingen worden direct in UI getoond
// Backend sync gebeurt asynchroon

const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'api/load',
        syncUrl: 'api/sync',
        autoSync: true,

        // Bij sync fail: rollback of retry
        onSyncFail({ response }) {
            if (response?.code === 409) {
                // Conflict - rollback + reload
                this.rejectChanges();
                this.load();
            }
        }
    }
});

// Gebruiker ziet wijziging direct
taskBoard.taskStore.getById(1).status = 'done';
// Sync gebeurt automatisch na autoSyncTimeout
```

### Pessimistisch

```javascript
// Wijzigingen worden pas getoond na backend bevestiging

const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'api/load',
        syncUrl: 'api/sync',
        autoSync: false,  // Handmatige sync

        taskStore: {
            // Blokkeer lokale wijzigingen tot sync
            autoCommit: false
        }
    }
});

// Custom update functie
async function updateTask(taskId, changes) {
    const task = taskBoard.taskStore.getById(taskId);

    // Toon loading state
    showTaskLoading(taskId);

    try {
        // Maak wijziging
        task.set(changes);

        // Sync en wacht op bevestiging
        await taskBoard.project.sync();

        // Commit lokaal na succes
        taskBoard.taskStore.commit();

        showSuccess('Task updated');

    } catch (error) {
        // Rollback bij fout
        task.revertChanges();
        showError(error.message);

    } finally {
        hideTaskLoading(taskId);
    }
}
```

### Hybrid Approach

```javascript
// Snelle operaties optimistisch, kritieke pessimistisch

const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'api/load',
        syncUrl: 'api/sync',
        autoSync: true,

        onBeforeSync({ pack }) {
            // Check voor kritieke operaties
            if (hasCriticalChanges(pack)) {
                // Toon bevestigingsdialoog
                return showConfirmationDialog(pack);
            }
            return true;
        }
    }
});

function hasCriticalChanges(pack) {
    // Check voor deletes of status changes naar 'done'
    const hasDeletes = pack.tasks?.removed?.length > 0;
    const hasCompletes = pack.tasks?.updated?.some(t => t.status === 'done');

    return hasDeletes || hasCompletes;
}
```

---

## Real-time Updates

### Polling

```javascript
const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'api/load',
        syncUrl: 'api/sync',
        autoSync: true
    }
});

// Periodieke refresh
class Poller {
    constructor(taskBoard, interval = 30000) {
        this.taskBoard = taskBoard;
        this.interval = interval;
        this.timerId = null;
    }

    start() {
        this.poll();
        this.timerId = setInterval(() => this.poll(), this.interval);
    }

    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    async poll() {
        // Skip als er lokale wijzigingen zijn
        if (this.taskBoard.project.changes) {
            return;
        }

        // Skip als er een sync gaande is
        if (this.taskBoard.project.isSyncing) {
            return;
        }

        try {
            await this.taskBoard.project.load();
        } catch (error) {
            console.warn('Polling failed:', error);
        }
    }
}

const poller = new Poller(taskBoard);
poller.start();

// Stop bij page unload
window.addEventListener('beforeunload', () => poller.stop());
```

### WebSocket

```javascript
// Client
class RealtimeSync {
    constructor(taskBoard, wsUrl) {
        this.taskBoard = taskBoard;
        this.ws = new WebSocket(wsUrl);

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };

        this.ws.onclose = () => {
            // Reconnect na 5 seconden
            setTimeout(() => this.reconnect(), 5000);
        };
    }

    handleMessage(message) {
        switch (message.type) {
            case 'taskCreated':
                this.taskBoard.taskStore.add(message.task);
                break;

            case 'taskUpdated':
                const task = this.taskBoard.taskStore.getById(message.task.id);
                if (task) {
                    task.set(message.task, { silent: true });
                }
                break;

            case 'taskDeleted':
                const toRemove = this.taskBoard.taskStore.getById(message.taskId);
                if (toRemove) {
                    this.taskBoard.taskStore.remove(toRemove, { silent: true });
                }
                break;

            case 'reload':
                // Volledige reload gevraagd door server
                this.taskBoard.project.load();
                break;
        }
    }

    reconnect() {
        this.ws = new WebSocket(this.wsUrl);
        // Re-attach handlers...
    }
}

// Server (Node.js)
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('close', () => {
        clients.delete(ws);
    });
});

// Broadcast changes
function broadcastChange(message) {
    const data = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// In sync endpoint:
app.post('/api/sync', async (req, res) => {
    // ... process changes ...

    // Broadcast to other clients
    broadcastChange({
        type: 'taskUpdated',
        task: updatedTask,
        userId: req.user.id  // Exclude sender
    });
});
```

### Server-Sent Events (SSE)

```javascript
// Server
app.get('/api/events', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Register client
    const clientId = Date.now();
    clients.set(clientId, sendEvent);

    // Heartbeat
    const heartbeat = setInterval(() => {
        res.write(':heartbeat\n\n');
    }, 30000);

    req.on('close', () => {
        clearInterval(heartbeat);
        clients.delete(clientId);
    });
});

// Client
const eventSource = new EventSource('/api/events');

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'taskUpdated') {
        const task = taskBoard.taskStore.getById(data.task.id);
        if (task) {
            task.set(data.task, { silent: true });
        }
    }
};

eventSource.onerror = () => {
    // Reconnect automatisch door browser
    console.warn('SSE connection lost, reconnecting...');
};
```

---

## Best Practices

### 1. Batch Changes

```javascript
// Slecht: Elke wijziging triggert sync
tasks.forEach(task => {
    task.status = 'done';  // Sync!
    task.progress = 100;   // Sync!
});

// Goed: Batch alle wijzigingen
taskBoard.project.autoSync = false;

tasks.forEach(task => {
    task.set({
        status: 'done',
        progress: 100
    });
});

taskBoard.project.sync();
taskBoard.project.autoSync = true;
```

### 2. Gebruik Field Defaults

```javascript
// Voorkom null/undefined in database
class Task extends TaskModel {
    static fields = [
        { name: 'name', defaultValue: 'New Task' },
        { name: 'status', defaultValue: 'todo' },
        { name: 'prio', defaultValue: 'medium' },
        { name: 'progress', type: 'number', defaultValue: 0 }
    ];
}
```

### 3. Valideer Server-side

```php
// Valideer ALLE input
function validateTask($data) {
    $errors = [];

    if (empty($data['name'])) {
        $errors[] = 'Name is required';
    }

    if (strlen($data['name'] ?? '') > 255) {
        $errors[] = 'Name too long';
    }

    $validStatuses = ['todo', 'doing', 'review', 'done'];
    if (!in_array($data['status'] ?? '', $validStatuses)) {
        $errors[] = 'Invalid status';
    }

    if (!empty($errors)) {
        throw new ValidationException($errors);
    }
}
```

### 4. Indexeer Database

```sql
-- Voeg indexes toe voor performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_prio ON tasks(prio);
CREATE INDEX idx_tasks_weight ON tasks(weight);
CREATE INDEX idx_assignments_event ON assignments(event);
CREATE INDEX idx_assignments_resource ON assignments(resource);
```

### 5. Handle Offline

```javascript
// Detect offline status
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
    isOnline = true;
    // Sync queued changes
    taskBoard.project.sync();
});

window.addEventListener('offline', () => {
    isOnline = false;
    showOfflineIndicator();
});

// Intercept sync bij offline
taskBoard.project.on('beforeSync', () => {
    if (!isOnline) {
        showToast('Changes will be synced when online');
        return false;  // Cancel sync
    }
});
```

### 6. Gebruik Transactions

```php
try {
    $db->beginTransaction();

    // Alle operaties
    $this->updateTasks($request['tasks']);
    $this->updateAssignments($request['assignments']);
    $this->updateResources($request['resources']);

    $db->commit();

} catch (Exception $e) {
    $db->rollBack();
    throw $e;
}
```

---

## Complete Implementatie Voorbeeld

### Client Setup

```javascript
import { TaskBoard, TaskModel } from '@bryntum/taskboard';

// Custom Task model
class ProjectTask extends TaskModel {
    static fields = [
        { name: 'name', defaultValue: 'New Task' },
        { name: 'description', defaultValue: '' },
        { name: 'status', defaultValue: 'todo' },
        { name: 'prio', defaultValue: 'medium' },
        { name: 'deadline', type: 'date' },
        { name: 'progress', type: 'number', defaultValue: 0 },
        { name: 'storyPoints', type: 'integer', defaultValue: 1 },
        { name: 'labels', type: 'string', defaultValue: '' }
    ];
}

// UI helpers
const updateSyncStatus = (taskBoard) => {
    const { isCrudManagerLoading, isCrudManagerSyncing, changes } = taskBoard.project;
    const indicator = document.getElementById('sync-status');

    if (isCrudManagerLoading) {
        indicator.textContent = '🔄 Loading...';
        indicator.className = 'loading';
    } else if (isCrudManagerSyncing) {
        indicator.textContent = '💾 Saving...';
        indicator.className = 'syncing';
    } else if (changes) {
        indicator.textContent = '⚠️ Unsaved changes';
        indicator.className = 'unsaved';
    } else {
        indicator.textContent = '✅ All saved';
        indicator.className = 'saved';
    }
};

// TaskBoard instantie
const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Kolommen
    columns: [
        { id: 'todo', text: 'Backlog', color: 'purple' },
        { id: 'doing', text: 'In Progress', color: 'orange' },
        { id: 'review', text: 'Review', color: 'blue' },
        { id: 'done', text: 'Done', color: 'green' }
    ],

    columnField: 'status',

    // Swimlanes
    swimlanes: [
        { id: 'high', text: 'High Priority', color: 'red' },
        { id: 'medium', text: 'Medium Priority', color: 'orange' },
        { id: 'low', text: 'Low Priority', color: 'green' }
    ],

    swimlaneField: 'prio',

    // Features
    features: {
        columnDrag: true,
        taskDrag: true,
        taskEdit: true,
        taskMenu: true
    },

    // Resource images
    resourceImagePath: '/images/users/',

    // Footer met avatars
    footerItems: {
        resourceAvatars: { overlap: true }
    },

    // Toolbar
    tbar: [
        {
            type: 'button',
            text: 'Reload',
            icon: 'fa fa-sync',
            onClick: () => taskBoard.project.load()
        },
        {
            type: 'button',
            text: 'Save',
            icon: 'fa fa-save',
            onClick: () => taskBoard.project.sync()
        },
        '->',
        {
            type: 'widget',
            html: '<span id="sync-status">✅ All saved</span>'
        }
    ],

    // Project met backend sync
    project: {
        loadUrl: '/api/load',
        syncUrl: '/api/sync',

        autoLoad: true,
        autoSync: true,
        autoSyncTimeout: 1000,

        taskStore: {
            modelClass: ProjectTask,
            onChange: () => updateSyncStatus(taskBoard)
        },

        // Event handlers
        onLoadStart() {
            updateSyncStatus(taskBoard);
        },

        onLoad({ response }) {
            updateSyncStatus(taskBoard);
            console.log(`Loaded ${response.tasks?.rows?.length || 0} tasks`);
        },

        onLoadFail({ response }) {
            updateSyncStatus(taskBoard);
            alert(response?.message || 'Failed to load data');
        },

        onSyncStart() {
            updateSyncStatus(taskBoard);
        },

        onSync({ response }) {
            updateSyncStatus(taskBoard);
            console.log('Changes saved successfully');
        },

        onSyncFail({ response }) {
            updateSyncStatus(taskBoard);

            if (response?.code === 409) {
                if (confirm('Data was modified. Reload?')) {
                    this.rejectChanges();
                    this.load();
                }
            } else {
                alert(response?.message || 'Failed to save changes');
            }
        },

        onHasChanges() {
            updateSyncStatus(taskBoard);
        },

        onNoChanges() {
            updateSyncStatus(taskBoard);
        }
    }
});

// Warn before leaving with unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (taskBoard.project.changes) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes.';
    }
});

export { taskBoard };
```

---

## Gerelateerde Documentatie

- [TASKBOARD-DEEP-DIVE-COLUMNS.md](./TASKBOARD-DEEP-DIVE-COLUMNS.md) - Column configuratie
- [TASKBOARD-DEEP-DIVE-CARDS.md](./TASKBOARD-DEEP-DIVE-CARDS.md) - TaskModel en cards
- [TASKBOARD-IMPL-DRAG-DROP.md](./TASKBOARD-IMPL-DRAG-DROP.md) - Drag & drop
- [TASKBOARD-IMPL-FILTERING.md](./TASKBOARD-IMPL-FILTERING.md) - Filtering
- [DEEP-DIVE-CRUDMANAGER.md](./DEEP-DIVE-CRUDMANAGER.md) - Algemene CrudManager docs

---

*Laatst bijgewerkt: December 2024*
*Document versie: 1.0*
*Bryntum TaskBoard versie: 7.1.0*
