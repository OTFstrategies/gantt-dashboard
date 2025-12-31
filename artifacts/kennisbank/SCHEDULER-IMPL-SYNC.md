# SchedulerPro Implementation: Data Synchronization (CRUD)

## Overview

SchedulerPro provides comprehensive data synchronization via CrudManager:
- **Load**: Fetch all project data from server
- **Sync**: Send changes (create, update, delete) to server
- **AutoSync**: Automatic synchronization on changes
- **Lazy Loading**: Load data on demand
- **Transport**: Configurable HTTP transport layer

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CrudManager Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│  Project (CrudManager)                                           │
│  ├── load() - Fetch all data from loadUrl                       │
│  ├── sync() - Send changes to syncUrl                           │
│  ├── autoSync - Auto-sync on changes                            │
│  └── commitAsync() - Commit and sync                            │
├─────────────────────────────────────────────────────────────────┤
│  Managed Stores                                                  │
│  ├── resourceStore                                               │
│  ├── eventStore                                                  │
│  ├── assignmentStore                                            │
│  ├── dependencyStore                                            │
│  └── calendarManagerStore                                       │
├─────────────────────────────────────────────────────────────────┤
│  Transport Layer (AjaxTransport)                                 │
│  ├── load request configuration                                  │
│  ├── sync request configuration                                  │
│  └── Custom headers/params                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Basic Configuration

### Simple URLs

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        // Load URL for fetching data
        loadUrl: '/api/project/load',

        // Sync URL for saving changes
        syncUrl: '/api/project/sync',

        // Auto-load on creation
        autoLoad: true,

        // Auto-sync on changes
        autoSync: true,

        // Auto-sync delay (ms)
        autoSyncTimeout: 2000
    }
});
```

### Transport Configuration

```javascript
project: {
    transport: {
        load: {
            url: '/api/project/load',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer token123',
                'Content-Type': 'application/json'
            },
            params: {
                projectId: 123
            }
        },
        sync: {
            url: '/api/project/sync',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer token123',
                'Content-Type': 'application/json'
            }
        }
    },

    autoLoad: true,
    autoSync: true
}
```

## Load Request

### Request Format

```javascript
// GET /api/project/load
// Response format:
{
    "success": true,
    "project": {
        "calendar": "general",
        "startDate": "2024-01-01"
    },
    "calendars": {
        "rows": [
            { "id": "general", "name": "General" }
        ]
    },
    "resources": {
        "rows": [
            { "id": 1, "name": "John Smith" },
            { "id": 2, "name": "Jane Doe" }
        ]
    },
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Task 1",
                "startDate": "2024-01-02",
                "duration": 5,
                "resourceId": 1
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
            { "id": 1, "fromEvent": 1, "toEvent": 2 }
        ]
    }
}
```

### Manual Load

```javascript
// Load with default URL
await scheduler.project.load();

// Load with parameters
await scheduler.project.load({
    params: {
        projectId: 123,
        startDate: '2024-01-01'
    }
});

// Load from different URL
await scheduler.project.load({
    request: {
        url: '/api/project/123'
    }
});
```

### Load Events

```javascript
scheduler.project.on({
    // Before load request
    beforeLoad({ pack }) {
        // Modify request data
        pack.projectId = currentProjectId;
        // Return false to cancel
    },

    // Before applying loaded data
    beforeLoadApply({ response, options }) {
        // Transform response if needed
        console.log('Received:', response);
    },

    // After successful load
    load({ response }) {
        console.log('Data loaded successfully');
    },

    // Load cancelled
    loadCanceled({ pack }) {
        console.log('Load was cancelled');
    },

    // Load failed
    loadFail({ response, responseText }) {
        console.error('Load failed:', responseText);
    }
});
```

## Sync Request

### Request Format

```javascript
// POST /api/project/sync
// Request body:
{
    "type": "sync",
    "requestId": 12345,
    "resources": {
        "added": [
            { "$PhantomId": "phantom-1", "name": "New Resource" }
        ],
        "updated": [
            { "id": 1, "name": "Updated Name" }
        ],
        "removed": [
            { "id": 2 }
        ]
    },
    "events": {
        "added": [
            {
                "$PhantomId": "phantom-2",
                "name": "New Event",
                "startDate": "2024-01-10",
                "duration": 3,
                "resourceId": 1
            }
        ],
        "updated": [],
        "removed": []
    }
}
```

### Response Format

```javascript
// Server response:
{
    "success": true,
    "requestId": 12345,
    "resources": {
        "rows": [
            { "$PhantomId": "phantom-1", "id": 100 }  // Map phantom to real ID
        ]
    },
    "events": {
        "rows": [
            {
                "$PhantomId": "phantom-2",
                "id": 200,
                // Server may adjust dates based on constraints
                "startDate": "2024-01-10",
                "endDate": "2024-01-13"
            }
        ]
    }
}
```

### Manual Sync

```javascript
// Sync all changes
await scheduler.project.sync();

// Check for changes before sync
if (scheduler.project.changes) {
    await scheduler.project.sync();
}

// Commit and sync in one call
await scheduler.project.commitAsync();
```

### Sync Events

```javascript
scheduler.project.on({
    // Before sync request
    beforeSync({ pack }) {
        // Modify sync data
        console.log('Changes to sync:', pack);
        // Return false to cancel
    },

    // Before applying sync response
    beforeSyncApply({ response }) {
        console.log('Sync response:', response);
    },

    // After successful sync
    sync({ response }) {
        console.log('Changes saved successfully');
    },

    // Sync cancelled
    syncCanceled({ pack }) {
        console.log('Sync was cancelled');
    },

    // Sync delayed (previous sync in progress)
    syncDelayed({ arguments: args }) {
        console.log('Sync delayed, will retry');
    },

    // Sync failed
    syncFail({ response, responseText }) {
        console.error('Sync failed:', responseText);
    }
});
```

## Auto-Sync Configuration

```javascript
const scheduler = new SchedulerPro({
    project: {
        loadUrl: '/api/project/load',
        syncUrl: '/api/project/sync',

        // Enable auto-sync
        autoSync: true,

        // Delay before auto-sync (ms)
        autoSyncTimeout: 2000,

        // Track changes
        trackRawChanges: true
    }
});

// Disable auto-sync temporarily
scheduler.project.autoSync = false;

// Make changes...
event.name = 'New Name';

// Re-enable and sync
scheduler.project.autoSync = true;
await scheduler.project.sync();
```

## Change Tracking

### Get Changes

```javascript
const project = scheduler.project;

// Check if there are changes
if (project.changes) {
    console.log('Has unsaved changes');
}

// Get detailed changes
const changes = project.changes;
/*
{
    resources: { added: [], updated: [], removed: [] },
    events: { added: [], updated: [], removed: [] },
    assignments: { added: [], updated: [], removed: [] },
    dependencies: { added: [], updated: [], removed: [] }
}
*/

// Check specific store changes
if (project.eventStore.changes) {
    console.log('Event changes:', project.eventStore.changes);
}
```

### Clear Changes

```javascript
// Accept all current values as "unchanged"
project.acceptChanges();

// Revert all changes to last synced state
project.revertChanges();

// Reject specific record changes
eventRecord.rejectChanges();
```

### Change Events

```javascript
scheduler.project.on({
    // Changes detected
    hasChanges() {
        console.log('Project has unsaved changes');
        updateSaveButton(true);
    },

    // No changes remaining
    noChanges() {
        console.log('All changes saved');
        updateSaveButton(false);
    }
});
```

## Error Handling

### Request/Response Events

```javascript
scheduler.project.on({
    // Any request completed
    requestDone({ requestType, response }) {
        console.log(`${requestType} completed:`, response);
    },

    // Any request failed
    requestFail({ requestType, response, responseText }) {
        console.error(`${requestType} failed:`, responseText);

        // Show user-friendly error
        Toast.show({
            html: 'Failed to save changes. Please try again.',
            cls: 'error-toast'
        });
    }
});
```

### Validation Response

```javascript
// Server can return validation errors:
{
    "success": false,
    "message": "Validation failed",
    "events": {
        "rows": [
            {
                "id": 1,
                "error": "Event overlaps with existing event"
            }
        ]
    }
}
```

## Before Send Hook

```javascript
project: {
    transport: {
        load: { url: '/api/load' },
        sync: { url: '/api/sync' }
    },

    listeners: {
        // Add auth token before each request
        beforeSend({ params, requestConfig }) {
            requestConfig.headers = requestConfig.headers || {};
            requestConfig.headers['Authorization'] = `Bearer ${getToken()}`;

            // Add timestamp
            params.timestamp = Date.now();
        }
    }
}
```

## Store-Level Sync

Individual stores can also sync independently:

```javascript
// Configure store URLs
const scheduler = new SchedulerPro({
    project: {
        eventStore: {
            readUrl: '/api/events',
            createUrl: '/api/events',
            updateUrl: '/api/events',
            deleteUrl: '/api/events'
        }
    }
});

// Sync single store
await scheduler.eventStore.commit();
```

## Complete Example

```javascript
import { SchedulerPro, Toast, MessageDialog } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        // API endpoints
        loadUrl: '/api/project/load',
        syncUrl: '/api/project/sync',

        // Transport configuration
        transport: {
            load: {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            },
            sync: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        },

        // Auto settings
        autoLoad: true,
        autoSync: false,  // Manual sync with save button
        autoSyncTimeout: 3000,

        // Ignore server changes in undo/redo
        ignoreRemoteChangesInSTM: true,

        // Track all changes
        trackRawChanges: true,

        listeners: {
            // Before any request
            beforeSend({ requestConfig }) {
                // Add authorization
                requestConfig.headers['Authorization'] = `Bearer ${getAuthToken()}`;
            },

            // Loading started
            beforeLoad() {
                scheduler.maskBody('Loading project...');
            },

            // Load completed
            load({ response }) {
                scheduler.unmaskBody();
                Toast.show('Project loaded');
                updateLastSyncTime();
            },

            // Load failed
            loadFail({ responseText }) {
                scheduler.unmaskBody();
                MessageDialog.alert({
                    title: 'Load Failed',
                    message: `Could not load project: ${responseText}`
                });
            },

            // Sync started
            beforeSync() {
                scheduler.maskBody('Saving changes...');
            },

            // Sync completed
            sync({ response }) {
                scheduler.unmaskBody();
                Toast.show('Changes saved');
                updateLastSyncTime();
            },

            // Sync failed
            syncFail({ response, responseText }) {
                scheduler.unmaskBody();

                // Handle validation errors
                if (response && !response.success) {
                    handleValidationErrors(response);
                } else {
                    MessageDialog.alert({
                        title: 'Save Failed',
                        message: `Could not save changes: ${responseText}`
                    });
                }
            },

            // Track change state
            hasChanges() {
                scheduler.widgetMap.saveBtn.badge = '•';
                updateUnsavedIndicator(true);
            },

            noChanges() {
                scheduler.widgetMap.saveBtn.badge = null;
                updateUnsavedIndicator(false);
            }
        }
    },

    tbar: [
        {
            type: 'button',
            ref: 'saveBtn',
            text: 'Save',
            icon: 'b-icon b-icon-save',
            async onClick() {
                if (scheduler.project.changes) {
                    await scheduler.project.sync();
                } else {
                    Toast.show('No changes to save');
                }
            }
        },
        {
            type: 'button',
            text: 'Reload',
            icon: 'b-icon b-icon-refresh',
            async onClick() {
                if (scheduler.project.changes) {
                    const result = await MessageDialog.confirm({
                        title: 'Unsaved Changes',
                        message: 'You have unsaved changes. Reload anyway?'
                    });

                    if (result === MessageDialog.okButton) {
                        await scheduler.project.load();
                    }
                } else {
                    await scheduler.project.load();
                }
            }
        },
        '|',
        {
            type: 'button',
            text: 'Revert',
            icon: 'b-icon b-icon-undo',
            onClick() {
                scheduler.project.revertChanges();
                Toast.show('Changes reverted');
            }
        },
        '->',
        {
            type: 'widget',
            ref: 'syncStatus',
            html: '<span class="sync-status">Synced</span>'
        }
    ],

    // Warn before leaving with unsaved changes
    beforeDestroy() {
        if (scheduler.project.changes) {
            return confirm('You have unsaved changes. Leave anyway?');
        }
    }
});

// Helper functions
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function updateLastSyncTime() {
    const time = new Date().toLocaleTimeString();
    scheduler.widgetMap.syncStatus.html = `Last saved: ${time}`;
}

function updateUnsavedIndicator(hasChanges) {
    document.title = hasChanges ? '• Scheduler' : 'Scheduler';
}

function handleValidationErrors(response) {
    const errors = [];

    // Collect errors from all stores
    ['events', 'resources', 'assignments'].forEach(storeName => {
        if (response[storeName]?.rows) {
            response[storeName].rows.forEach(row => {
                if (row.error) {
                    errors.push(row.error);
                }
            });
        }
    });

    if (errors.length > 0) {
        MessageDialog.alert({
            title: 'Validation Errors',
            message: errors.join('<br>')
        });
    }
}

// Prevent leaving with unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (scheduler.project.changes) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Auto-save on interval
setInterval(async () => {
    if (scheduler.project.changes && scheduler.project.autoSync) {
        await scheduler.project.sync();
    }
}, 60000);  // Every minute
```

## CSS for Sync States

```css
/* Loading mask */
.b-mask {
    background: rgba(255, 255, 255, 0.9);
}

.b-mask-text {
    font-size: 14px;
    color: #333;
}

/* Sync status indicator */
.sync-status {
    font-size: 12px;
    color: #666;
}

.sync-status.unsaved {
    color: #ff6600;
    font-weight: bold;
}

/* Save button badge */
.b-button .b-badge {
    background-color: #ff4444;
    color: white;
    font-size: 18px;
    line-height: 1;
}

/* Error toast */
.error-toast {
    background-color: #ff4444;
    color: white;
}

/* Dirty record indicator */
.b-grid-row.b-dirty .b-grid-cell:first-child::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 100%;
    background-color: #ff6600;
}
```

## Best Practices

1. **Use AutoSync Wisely**: Disable for forms, enable for direct manipulation
2. **Handle Errors**: Always handle load/sync failures gracefully
3. **Track Changes**: Show unsaved changes indicator to users
4. **Confirm Reload**: Warn users before discarding unsaved changes
5. **Validate Server-Side**: Return validation errors from server
6. **Use Transactions**: Group related changes together
7. **Optimize Requests**: Batch changes with autoSyncTimeout
8. **Add Auth Headers**: Use beforeSend for authentication

## API Reference Links

- [CrudManager](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/data/CrudManager)
- [AbstractCrudManager](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/crud/AbstractCrudManager)
- [AjaxTransport](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/crud/transport/AjaxTransport)
- [ProjectModel](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/ProjectModel)
- [load Method](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-load)
- [sync Method](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-sync)
