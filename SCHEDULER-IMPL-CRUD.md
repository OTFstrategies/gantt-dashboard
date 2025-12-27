# SchedulerPro Implementation: CRUD Operations & Data Management

## Overview

SchedulerPro uses a CrudManager for centralized data loading and saving. The CrudManager batches all store operations into single requests, providing:
- Single load request for all stores
- Single sync request for all changes
- Revision tracking for conflict detection
- Lazy loading support

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Project                                  │
├─────────────────────────────────────────────────────────────────┤
│  CrudManager (ProjectCrudManager)                               │
│  ├── eventStore                                                  │
│  ├── resourceStore                                               │
│  ├── assignmentStore                                             │
│  ├── dependencyStore                                             │
│  ├── calendarManagerStore                                        │
│  ├── timeRangeStore                                              │
│  └── resourceTimeRangeStore                                      │
├─────────────────────────────────────────────────────────────────┤
│  Transport                                                       │
│  ├── AjaxTransport (HTTP)                                       │
│  └── JsonEncoder                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Project Configuration

The ProjectModel integrates CrudManager functionality:

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        // Load URL
        loadUrl: '/api/project/load',

        // Sync URL
        syncUrl: '/api/project/sync',

        // Auto-load on creation
        autoLoad: true,

        // Auto-sync on changes
        autoSync: false,

        // Sync delay (ms)
        autoSyncTimeout: 100
    }
});
```

## Load Request

### Client Request

```javascript
// Trigger load
await scheduler.project.load();

// Load with parameters
await scheduler.project.load({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    resourceId: 123
});
```

### Server Response Format

```json
{
    "success": true,
    "revision": 1,
    "resources": {
        "rows": [
            { "id": 1, "name": "Resource 1" },
            { "id": 2, "name": "Resource 2" }
        ]
    },
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Task 1",
                "startDate": "2024-01-05",
                "endDate": "2024-01-10",
                "duration": 5,
                "durationUnit": "day"
            }
        ]
    },
    "assignments": {
        "rows": [
            { "id": 1, "eventId": 1, "resourceId": 1 }
        ]
    },
    "dependencies": {
        "rows": [
            { "id": 1, "fromEvent": 1, "toEvent": 2, "type": 2 }
        ]
    },
    "calendars": {
        "rows": [
            {
                "id": "general",
                "name": "General",
                "intervals": [...]
            }
        ]
    },
    "timeRanges": {
        "rows": [
            { "id": 1, "name": "Lunch", "startDate": "...", "endDate": "..." }
        ]
    }
}
```

## Sync Request

### Client Request

```javascript
// Manual sync
await scheduler.project.sync();

// Enable auto-sync
scheduler.project.autoSync = true;
```

### Sync Request Format

```json
{
    "type": "sync",
    "revision": 1,
    "events": {
        "added": [
            {
                "$PhantomId": "phantom-1",
                "name": "New Event",
                "startDate": "2024-01-15",
                "duration": 3,
                "durationUnit": "day"
            }
        ],
        "updated": [
            {
                "id": 1,
                "name": "Updated Name"
            }
        ],
        "removed": [
            { "id": 2 }
        ]
    },
    "assignments": {
        "added": [
            {
                "$PhantomId": "phantom-2",
                "eventId": "$phantom-1",
                "resourceId": 1
            }
        ]
    }
}
```

### Server Response Format

```json
{
    "success": true,
    "revision": 2,
    "events": {
        "rows": [
            {
                "$PhantomId": "phantom-1",
                "id": 100
            }
        ]
    },
    "assignments": {
        "rows": [
            {
                "$PhantomId": "phantom-2",
                "id": 200,
                "eventId": 100
            }
        ]
    }
}
```

## Inline Data Loading

For static or preloaded data:

```javascript
const scheduler = new SchedulerPro({
    project: {
        // Inline data
        resourcesData: [
            { id: 1, name: 'Resource 1' },
            { id: 2, name: 'Resource 2' }
        ],
        eventsData: [
            { id: 1, name: 'Task 1', startDate: '2024-01-05', duration: 5 }
        ],
        assignmentsData: [
            { id: 1, eventId: 1, resourceId: 1 }
        ],
        dependenciesData: [
            { id: 1, fromEvent: 1, toEvent: 2, type: 2 }
        ],
        calendarsData: [...],
        timeRangesData: [...],
        resourceTimeRangesData: [...]
    }
});
```

## Store Access

```javascript
// Access stores
const { eventStore, resourceStore, assignmentStore, dependencyStore } = scheduler.project;

// Add records
eventStore.add({
    name: 'New Task',
    startDate: new Date(),
    duration: 3,
    durationUnit: 'day'
});

// Update records
const event = eventStore.first;
event.name = 'Updated Name';

// Remove records
eventStore.remove(event);

// Get changes
const changes = scheduler.project.changes;
console.log(changes);

// Commit to trigger sync
await scheduler.project.sync();
```

## Change Tracking

```javascript
// Check for changes
if (scheduler.project.changes) {
    console.log('Has changes:', scheduler.project.changes);
}

// Listen for changes
scheduler.project.on({
    hasChanges() {
        console.log('Project has unsaved changes');
    }
});

// Suspend change tracking
scheduler.project.suspendChangeTracking();
// ... make bulk changes
scheduler.project.resumeChangeTracking();
```

## Events

```javascript
scheduler.project.on({
    // Before load
    beforeLoad({ pack }) {
        console.log('Loading...');
        // Modify pack.params to add request parameters
        pack.params = { ...pack.params, customParam: 'value' };
    },

    // After load
    load() {
        console.log('Data loaded');
    },

    // Load error
    loadFail({ response }) {
        console.error('Load failed:', response);
    },

    // Before sync
    beforeSync({ pack }) {
        console.log('Syncing changes...');
    },

    // After sync
    sync() {
        console.log('Changes synced');
    },

    // Sync error
    syncFail({ response }) {
        console.error('Sync failed:', response);
    },

    // Before applying load response
    beforeLoadApply({ response }) {
        // Preprocess server response
        return true;  // Return false to cancel
    },

    // Before applying sync response
    beforeSyncApply({ response }) {
        // Preprocess server response
        return true;
    },

    // Request/response
    requestDone({ response, responseText }) {
        console.log('Request complete');
    },

    requestFail({ response }) {
        console.error('Request failed');
    }
});
```

## Transport Configuration

```javascript
project: {
    transport: {
        load: {
            url: '/api/project/load',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer token'
            },
            params: {
                projectId: 123
            },
            paramName: 'data',
            credentials: 'include'
        },
        sync: {
            url: '/api/project/sync',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer token'
            }
        }
    }
}
```

## Custom Encoders

```javascript
project: {
    encoder: {
        // Custom request encoding
        encode(request) {
            return JSON.stringify(request);
        },

        // Custom response decoding
        decode(response) {
            return JSON.parse(response);
        }
    }
}
```

## Lazy Loading

For large datasets:

```javascript
project: {
    lazyLoad: {
        chunkSize: 100,
        bufferUnit: 'day',
        bufferAmount: 7
    },

    loadUrl: '/api/project/load'
}
```

Server receives date range parameters and returns only needed records.

## Error Handling

```javascript
try {
    await scheduler.project.load();
} catch (error) {
    console.error('Load failed:', error);
}

try {
    await scheduler.project.sync();
} catch (error) {
    console.error('Sync failed:', error);
    // Reload to recover
    await scheduler.project.load();
}
```

## Validation

```javascript
project: {
    // Validate before sync
    beforeSync({ pack }) {
        // Check for invalid data
        for (const event of pack.events?.added || []) {
            if (!event.name) {
                return false;  // Cancel sync
            }
        }
        return true;
    }
}
```

## STM (State Transaction Manager) Integration

```javascript
project: {
    // Ignore remote changes in undo/redo
    ignoreRemoteChangesInSTM: true,

    stm: {
        autoRecord: true
    }
}

// Undo last change
scheduler.project.stm.undo();

// Redo
scheduler.project.stm.redo();

// Check undo/redo availability
console.log('Can undo:', scheduler.project.stm.canUndo);
console.log('Can redo:', scheduler.project.stm.canRedo);
```

## Manual Store Management

```javascript
// Add store to CRUD manager
scheduler.project.addCrudStore({
    store: myCustomStore,
    storeId: 'customData'
});

// Remove store
scheduler.project.removeCrudStore(myCustomStore);

// Get store descriptor
const descriptor = scheduler.project.getCrudStore('customData');
```

## Revision Management

```javascript
// Get current revision
console.log('Revision:', scheduler.project.crudRevision);

// Server should increment revision on each change
// Client sends revision in sync requests
// Server can detect conflicts by comparing revisions
```

## Complete Example

```javascript
import { SchedulerPro, MessageDialog } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        loadUrl: '/api/project/load',
        syncUrl: '/api/project/sync',
        autoLoad: true,
        autoSync: false,
        autoSyncTimeout: 1000,

        transport: {
            load: {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            },
            sync: {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            }
        },

        listeners: {
            hasChanges() {
                document.getElementById('saveBtn').disabled = false;
            },

            beforeLoad({ pack }) {
                showLoadingIndicator();
            },

            load() {
                hideLoadingIndicator();
            },

            loadFail({ response }) {
                hideLoadingIndicator();
                MessageDialog.alert({
                    title: 'Error',
                    message: 'Failed to load data'
                });
            },

            beforeSync({ pack }) {
                showSavingIndicator();
            },

            sync() {
                hideSavingIndicator();
                document.getElementById('saveBtn').disabled = true;
            },

            syncFail({ response }) {
                hideSavingIndicator();
                MessageDialog.confirm({
                    title: 'Error',
                    message: 'Failed to save changes. Reload data?',
                    onOk: () => scheduler.project.load()
                });
            }
        }
    },

    tbar: [
        {
            id: 'saveBtn',
            text: 'Save',
            icon: 'b-fa b-fa-save',
            disabled: true,
            onClick: () => scheduler.project.sync()
        },
        {
            text: 'Reload',
            icon: 'b-fa b-fa-refresh',
            onClick: () => scheduler.project.load()
        },
        {
            text: 'Undo',
            icon: 'b-fa b-fa-undo',
            onClick: () => scheduler.project.stm.undo()
        },
        {
            text: 'Redo',
            icon: 'b-fa b-fa-redo',
            onClick: () => scheduler.project.stm.redo()
        }
    ]
});
```

## Server Implementation (Node.js Example)

```javascript
// Express server example
app.post('/api/project/load', async (req, res) => {
    const { startDate, endDate } = req.body;

    const resources = await db.getResources();
    const events = await db.getEvents(startDate, endDate);
    const assignments = await db.getAssignments(events.map(e => e.id));
    const dependencies = await db.getDependencies(events.map(e => e.id));

    res.json({
        success: true,
        revision: await db.getRevision(),
        resources: { rows: resources },
        events: { rows: events },
        assignments: { rows: assignments },
        dependencies: { rows: dependencies }
    });
});

app.post('/api/project/sync', async (req, res) => {
    const { events, assignments, dependencies, revision } = req.body;

    // Check revision for conflicts
    const currentRevision = await db.getRevision();
    if (revision !== currentRevision) {
        return res.json({
            success: false,
            message: 'Data has been modified by another user'
        });
    }

    const result = { success: true };

    // Process events
    if (events?.added) {
        result.events = { rows: [] };
        for (const event of events.added) {
            const id = await db.insertEvent(event);
            result.events.rows.push({
                $PhantomId: event.$PhantomId,
                id
            });
        }
    }

    // Process updates and deletes...

    // Increment revision
    result.revision = await db.incrementRevision();

    res.json(result);
});
```

## Best Practices

1. **Use loadUrl/syncUrl shortcuts** - Simpler than full transport config
2. **Enable autoSync carefully** - Consider debouncing and user expectations
3. **Handle errors gracefully** - Provide recovery options
4. **Use STM for undo/redo** - Better user experience
5. **Implement revision checking** - Detect concurrent modifications
6. **Validate before sync** - Prevent invalid data from reaching server

## API Reference Links

- [ProjectModel](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/ProjectModel)
- [CrudManager](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/data/CrudManager)
- [AbstractCrudManagerMixin](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/crud/AbstractCrudManagerMixin)
- [AjaxTransport](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/crud/transport/AjaxTransport)
