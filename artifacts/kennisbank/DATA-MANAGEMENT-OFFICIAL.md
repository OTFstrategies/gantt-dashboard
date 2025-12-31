# Bryntum Data Management - Official Guide

> **Bron**: Officiële Bryntum Gantt v7.1.0 documentatie - `docs/data/Gantt/guides/data/`

---

## 1. Project Data Structuur

### Logische Structuur

Bryntum Gantt werkt met een top-level "Project" entiteit bestaande uit meerdere collecties:

| Store | Model | Beschrijving |
|-------|-------|--------------|
| `calendarManagerStore` | CalendarModel | Calendars collectie |
| `resourceStore` | ResourceModel | Resources collectie |
| `taskStore` | TaskModel | Tasks collectie |
| `assignmentStore` | AssignmentModel | Assignments collectie |
| `dependencyStore` | DependencyModel | Dependencies collectie |

### Project Aanmaken

```javascript
const project = new bryntum.gantt.ProjectModel({
    startDate: '2017-01-01',

    tasks: [
        { id: 1, name: 'Proof-read docs', startDate: '2017-01-02', endDate: '2017-01-09' },
        { id: 2, name: 'Release docs', startDate: '2017-01-09', endDate: '2017-01-10' }
    ],

    dependencies: [
        { fromTask: 1, toTask: 2 }
    ]
});
```

---

## 2. Inline Data Werken

### Data Ophalen

```javascript
const data = gantt.project.inlineData;

// Structure:
// {
//     resources: [...],
//     events: [...],
//     dependencies: [...],
//     assignments: [...]
// }
```

### Data Instellen

```javascript
// Get data from server manually
const data = await axios.get('/project?id=12345');

// Feed it to the project
gantt.project.inlineData = data;
```

### Changes Ophalen

```javascript
const changes = project.changes;

// Returns:
// {
//     tasks: {
//         updated: [{ name: 'My task', id: 12 }]
//     },
//     assignments: {
//         added: [{ event: 12, resource: 7, units: 100, $PhantomId: 'abc123' }]
//     }
// }
```

---

## 3. Remote Data (CrudManager)

### Basis Configuratie

```javascript
const project = new ProjectModel({
    loadUrl: 'php/load.php',
    syncUrl: 'php/sync.php',
    autoLoad: true,
    autoSync: true
});
```

### Load Request Structuur

```json
{
    "requestId": 123,
    "type": "load",
    "stores": [
        { "id": "resources", "someParam": "abc" },
        "events",
        "assignments"
    ]
}
```

### Load Response Structuur

```json
{
    "success": true,
    "requestId": 123,
    "revision": 5,
    "events": {
        "rows": [
            { "id": 65, "name": "Meeting", "startDate": "2024-02-05T10:00:00.000Z", "endDate": "2024-02-05T11:30:00.000Z" }
        ],
        "total": 5
    },
    "resources": {
        "rows": [
            { "id": 1, "name": "Leo" },
            { "id": 2, "name": "James" }
        ],
        "total": 2
    },
    "assignments": {
        "rows": [
            { "id": 1, "eventId": 65, "resourceId": 2, "assignedDT": "2024-02-06T07:47:33.345Z" }
        ],
        "total": 1
    }
}
```

### Sync Request Structuur

```json
{
    "requestId": 124,
    "type": "sync",
    "revision": 5,
    "events": {
        "updated": [
            { "id": 65, "name": "Updated Meeting", "endDate": "2024-02-05T12:30:00.000Z" }
        ],
        "removed": [
            { "id": 9000 }
        ]
    },
    "assignments": {
        "added": [
            { "$PhantomId": "assignment-321", "resourceId": 3, "eventId": 9001 }
        ],
        "removed": [
            { "id": 3 },
            { "id": 4 }
        ]
    }
}
```

### Sync Response (Short Format - Default)

```json
{
    "success": true,
    "requestId": 124,
    "revision": 6,
    "assignments": {
        "rows": [
            { "$PhantomId": "assignment-321", "id": 17, "assignedDT": "2024-02-15T08:47:33.345Z" }
        ]
    }
}
```

### Minimale Sync Response

```json
{
    "requestId": 576,
    "revision": 61
}
```

---

## 4. Custom Fields Toevoegen

### Custom Model Definieren

```javascript
class MyResourceModel extends ResourceModel {
    static get fields() {
        return [
            { name: 'company', type: 'string' }
        ];
    }
}
```

### Gebruiken in Project

```javascript
const project = new ProjectModel({
    resourceModelClass: MyResourceModel,
    // andere configs...
});
```

---

## 5. Custom Store Configuratie

### Inline Configuratie

```javascript
const project = {
    assignmentStore: {
        allowNoId: false,
        writeAllFields: true,
        listeners: {
            remove: () => {
                // Listener na record verwijdering
            }
        }
    }
};
```

### Custom Store Class

```javascript
class CustomTaskStore extends TaskStore {
    static $name = 'CustomTaskStore';
    static configurable = {
        allowNoId: false,
        writeAllFields: true,
        tree: true
    };
}

const gantt = new Gantt({
    project: {
        taskStore: new CustomTaskStore()
    }
});
```

---

## 6. Changes Propagation

### Async Setters

**BELANGRIJK**: Setter methods die scheduling beïnvloeden zijn asynchronous.

```javascript
// Met Promise
event.setStartDate(new Date(2019, 3, 25)).then(() => {
    // continue na update
});

// Met async/await
const updateStartDate = async () => {
    const event = eventStore.getById(1);
    await event.setStartDate(new Date(2019, 3, 25));
    // continue na update
};
```

### Handmatige Propagation

```javascript
const event = eventStore.add({
    name: 'New task',
    startDate: new Date(2019, 3, 1),
    duration: 1
});

// Trigger propagation
project.commitAsync().then(() => {
    // continue na propagation
});
```

---

## 7. Data Changes Monitoring

### Store Level

```javascript
project.taskStore.on({
    change: ({ action, record, changes }) => {
        if (action === 'update' && changes?.percentDone && !record.project.stm.isRestoring) {
            record.predecessorTasks.forEach(task =>
                task.percentDone = changes.percentDone.value === 100 ? 100 : 0
            );
        }
    }
});
```

### Project Level (Centralized)

```javascript
const gantt = new Gantt({
    project: {
        listeners: {
            change({ store, action, records }) {
                const { $name } = store.constructor;

                if (action === 'add') {
                    externalDataModel.add($name, records);
                }

                if (action === 'remove') {
                    externalDataModel.remove($name, records);
                }
            }
        }
    }
});
```

### hasChanges Event

```javascript
const gantt = new Gantt({
    project: {
        listeners: {
            hasChanges() {
                const { changes } = this;
                // Process changes
            }
        }
    }
});
```

---

## 8. CrudManager Advanced

### Custom Request Data

```javascript
new CrudManager({
    encoder: {
        requestData: {
            foo: 'Bar'
        }
    }
});
```

### HTTP Request Parameters

```javascript
crudManager.load({
    request: {
        params: {
            startDate: '2024-02-01',
            endDate: '2024-02-29'
        }
    }
});
```

### Static Parameters

```javascript
new Scheduler({
    crudManager: {
        autoLoad: true,
        transport: {
            load: {
                url: 'loadDataUrl',
                method: 'POST',
                params: {
                    accessLevel: 'full',
                    userIdentifier: 'et13'
                }
            }
        }
    }
});
```

---

## 9. Data Revisions

Server kan revision stamp gebruiken voor concurrency control:

```json
{
    "success": true,
    "requestId": 123,
    "revision": 190
}
```

Client stuurt `revision` mee bij sync requests. Server kan oudere revisions afwijzen.

---

## 10. Error Handling

### Error Response

```json
{
    "success": false,
    "requestId": 123890,
    "message": "Error description",
    "code": 13
}
```

### Error Handling Code

```javascript
crudManager.load()
    .catch(response => {
        Toast.show(response?.message || 'Unknown error');
    })
    .then(() => {
        // Success handling
    });
```

### Event Listeners

```javascript
const crudManager = new CrudManager({
    listeners: {
        loadFail: processError,
        syncFail: processError
    }
});

function processError(event) {
    const { response } = event;
    if (response?.code === 13) {
        crudManager.load(); // Reload
    } else {
        Toast.show(response?.message || 'Unknown error');
    }
}
```

---

## 11. Data Polling

### Setup

```javascript
const crudManager = new CrudManager({
    syncUrl: 'sync',
    autoLoad: true,
    autoSync: true,
    forceSync: true
});

// Poll elke 10 seconden
setInterval(async () => {
    await scheduler.crudManager.sync();
}, 10000);
```

---

## 12. Response Validatie

### Inschakelen

```javascript
new CrudManager({
    validateResponse: true // Development only!
});
```

Console output bij validation errors:
```
CrudManager sync response error(s):
- "events" store "rows" section should mention added record(s) #XXX...
```

---

## 13. Duration Units Conversie

### Project Level Configs

```javascript
const project = new ProjectModel({
    hoursPerDay: 24,   // default
    daysPerWeek: 7,    // default
    daysPerMonth: 30   // default
});
```

---

## 14. Dynamic Response Type

Server kan `load` of `sync` response type dynamisch kiezen:

```javascript
const crudManager = new CrudManager({
    trackResponseType: true
});
```

Response moet `type` bevatten:
```json
{
    "type": "load",
    "success": true
}
```

---

## 15. Partial Failure Handling

Bij gedeeltelijk falen sync request:

**Optie 1**: Return current database state voor gefaalde records

**Optie 2**: Full sync response mode
```javascript
new CrudManager({
    supportShortSyncResponse: false
});
```

---

## Quick Reference

### Key Configs

| Config | Type | Default | Beschrijving |
|--------|------|---------|--------------|
| `autoLoad` | Boolean | false | Auto-load bij init |
| `autoSync` | Boolean | false | Auto-sync bij changes |
| `loadUrl` | String | - | URL voor load requests |
| `syncUrl` | String | - | URL voor sync requests |
| `writeAllFields` | Boolean | false | Stuur alle velden bij sync |
| `validateResponse` | Boolean | false | Valideer responses (dev) |
| `supportShortSyncResponse` | Boolean | true | Korte sync responses |
| `skipSuccessProperty` | Boolean | false | Success property optioneel |
| `trackResponseType` | Boolean | false | Dynamic response type |
| `forceSync` | Boolean | false | Force sync ook zonder changes |

### Key Events

| Event | Beschrijving |
|-------|--------------|
| `load` | Load completed |
| `sync` | Sync completed |
| `loadFail` | Load failed |
| `syncFail` | Sync failed |
| `change` | Data changed |
| `hasChanges` | Persistable changes exist |

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
