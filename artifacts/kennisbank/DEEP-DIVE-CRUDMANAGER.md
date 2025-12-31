# Deep Dive: CrudManager in Bryntum Gantt

## Level 2 Technical Documentation

This document provides an in-depth analysis of the CrudManager functionality in Bryntum Gantt, covering its architecture, configuration, and practical implementation patterns.

---

## Table of Contents

1. [CrudManager Overview](#1-crudmanager-overview)
2. [Load and Sync Operations](#2-load-and-sync-operations)
3. [URL Configuration (loadUrl and syncUrl)](#3-url-configuration-loadurl-and-syncurl)
4. [Request/Response Format](#4-requestresponse-format)
5. [Auto-Sync vs Manual Sync](#5-auto-sync-vs-manual-sync)
6. [Handling Sync Conflicts](#6-handling-sync-conflicts)
7. [Phantom Records and ID Mapping](#7-phantom-records-and-id-mapping)
8. [Batch Operations](#8-batch-operations)
9. [Error Handling (loadFail, syncFail)](#9-error-handling-loadfail-syncfail)
10. [Custom Transport (sendRequest)](#10-custom-transport-sendrequest)

---

## 1. CrudManager Overview

### What is CrudManager?

The CrudManager is a mixin that provides centralized data persistence for Bryntum Gantt. It batches all CRUD (Create, Read, Update, Delete) operations across multiple stores into single HTTP requests, simplifying server communication and reducing network overhead.

### Architecture

```
ProjectModel (with CrudManager mixin)
    |
    +-- TaskStore
    +-- ResourceStore
    +-- DependencyStore
    +-- AssignmentStore
    +-- CalendarManagerStore
```

### Key Interfaces

```typescript
// Store descriptor for CrudManager registration
type CrudManagerStoreDescriptor = {
    storeId: string;           // Unique store identifier
    store: Store;              // The store instance
    phantomIdField?: string;   // Field for phantom record IDs
    idField?: string;          // ID field name
    writeAllFields?: boolean;  // Whether to send all fields
};

// ProjectModel includes CrudManager functionality
interface ProjectModelConfig {
    // CrudManager configuration
    loadUrl?: string;
    syncUrl?: string;
    autoSync?: boolean;
    autoSyncTimeout?: number;
    autoLoad?: boolean;

    // Store configurations
    crudStores?: Store[] | string[] | CrudManagerStoreDescriptor[];
    syncApplySequence?: string[] | CrudManagerStoreDescriptor[];

    // Behavior options
    writeAllFields?: boolean;
    supportShortSyncResponse?: boolean;
    validateResponse?: boolean;
    trackResponseType?: boolean;
    forceSync?: boolean;
}
```

### Basic Setup

```typescript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    loadUrl: '/api/gantt/load',
    syncUrl: '/api/gantt/sync',
    autoLoad: true,
    autoSync: true,
    autoSyncTimeout: 500
});

const gantt = new Gantt({
    appendTo: 'container',
    project,
    // ... other config
});
```

---

## 2. Load and Sync Operations

### The load() Method

The `load()` method fetches data from the server and populates all registered stores.

```typescript
// Signature
load(options?: {
    request?: object;
} | string): Promise<any>;
```

#### Basic Load

```typescript
// Simple load
await project.load();

// Load with custom parameters
await project.load({
    request: {
        params: {
            projectId: 123,
            startDate: '2024-01-01',
            endDate: '2024-12-31'
        }
    }
});

// Load from a different URL
await project.load('/api/gantt/load-project/123');
```

#### Load with Static Data

```typescript
// Load data without server request
project.loadCrudManagerData({
    success: true,
    tasks: {
        rows: [
            { id: 1, name: 'Task 1', startDate: '2024-01-15', duration: 5 },
            { id: 2, name: 'Task 2', startDate: '2024-01-20', duration: 3 }
        ]
    },
    resources: {
        rows: [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' }
        ]
    },
    assignments: {
        rows: [
            { id: 1, eventId: 1, resourceId: 1 }
        ]
    }
});
```

#### Load Inline Data

```typescript
// Using loadInlineData for a complete data package
await project.loadInlineData({
    tasksData: [
        { id: 1, name: 'Project Setup', startDate: '2024-01-01', duration: 10 }
    ],
    resourcesData: [
        { id: 1, name: 'Developer' }
    ],
    dependenciesData: [],
    assignmentsData: []
});
```

### The sync() Method

The `sync()` method persists all pending changes to the server.

```typescript
// Signature
sync(): Promise<any>;
```

#### Basic Sync

```typescript
// Persist all changes
await project.sync();

// Force sync even without changes (useful for polling)
project.forceSync = true;
await project.sync();
```

#### Checking for Changes Before Sync

```typescript
// Check if there are pending changes
if (project.changes) {
    console.log('Pending changes:', project.changes);
    await project.sync();
}

// Using hasChanges for individual stores
if (project.crudStoreHasChanges('tasks')) {
    console.log('Task store has changes');
}
```

### Key Properties

```typescript
// Check loading/syncing state
const isLoading: boolean = project.isCrudManagerLoading;
const isSyncing: boolean = project.isCrudManagerSyncing;

// Get the changes object
const changes: object | null = project.changes;
// Returns: { tasks: { added: [], modified: [], removed: [] }, ... }

// Get the server revision stamp
const revision: number = project.crudRevision;
```

---

## 3. URL Configuration (loadUrl and syncUrl)

### Simple URL Configuration

```typescript
const project = new ProjectModel({
    loadUrl: '/api/gantt/load',
    syncUrl: '/api/gantt/sync'
});
```

### Advanced Transport Configuration

```typescript
const project = new ProjectModel({
    transport: {
        load: {
            url: '/api/gantt/load',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer token123',
                'Content-Type': 'application/json'
            },
            params: {
                projectId: 123
            },
            // Request credentials
            credentials: 'include'
        },
        sync: {
            url: '/api/gantt/sync',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer token123',
                'Content-Type': 'application/json'
            }
        }
    }
});
```

### Dynamic URL Configuration

```typescript
// Using beforeSend to modify request
project.on('beforeSend', ({ requestConfig, requestType, params }) => {
    // Add dynamic headers
    requestConfig.headers = {
        ...requestConfig.headers,
        'X-Request-Time': Date.now().toString()
    };

    // Modify URL based on request type
    if (requestType === 'load') {
        params.timestamp = Date.now();
    }
});
```

---

## 4. Request/Response Format

### Load Request Format

The load request is typically a POST with optional parameters:

```typescript
// Request body (JSON)
{
    "type": "load",
    "requestId": 1234567890,
    "stores": ["tasks", "resources", "dependencies", "assignments"]
}
```

### Load Response Format

```typescript
// Expected server response
{
    "success": true,
    "revision": 1,
    "tasks": {
        "rows": [
            {
                "id": 1,
                "name": "Project Planning",
                "startDate": "2024-01-15",
                "duration": 10,
                "percentDone": 50,
                "children": [
                    {
                        "id": 2,
                        "name": "Requirements",
                        "startDate": "2024-01-15",
                        "duration": 5
                    }
                ]
            }
        ]
    },
    "resources": {
        "rows": [
            { "id": 1, "name": "John Doe", "role": "Developer" }
        ]
    },
    "dependencies": {
        "rows": [
            { "id": 1, "fromTask": 2, "toTask": 3, "type": 2 }
        ]
    },
    "assignments": {
        "rows": [
            { "id": 1, "eventId": 1, "resourceId": 1, "units": 100 }
        ]
    },
    "project": {
        "startDate": "2024-01-15",
        "calendar": "general"
    }
}
```

### Sync Request Format

```typescript
// Sync request body (JSON)
{
    "type": "sync",
    "requestId": 1234567891,
    "revision": 1,
    "tasks": {
        "added": [
            {
                "$PhantomId": "_generated1",
                "name": "New Task",
                "startDate": "2024-02-01",
                "duration": 5,
                "parentId": 1
            }
        ],
        "updated": [
            {
                "id": 2,
                "name": "Updated Task Name",
                "duration": 7
            }
        ],
        "removed": [
            { "id": 5 }
        ]
    },
    "assignments": {
        "added": [
            {
                "$PhantomId": "_generated2",
                "eventId": "_generated1",
                "resourceId": 1
            }
        ]
    }
}
```

### Sync Response Format

```typescript
// Standard sync response
{
    "success": true,
    "revision": 2,
    "tasks": {
        "rows": [
            {
                "$PhantomId": "_generated1",
                "id": 100,
                "name": "New Task"
            }
        ],
        "removed": [
            { "id": 5 }
        ]
    },
    "assignments": {
        "rows": [
            {
                "$PhantomId": "_generated2",
                "id": 200,
                "eventId": 100
            }
        ]
    }
}

// Short sync response (when supportShortSyncResponse is true)
{
    "success": true,
    "revision": 2,
    "tasks": {
        "rows": [
            { "$PhantomId": "_generated1", "id": 100 }
        ]
    }
}
```

### Response Validation

```typescript
const project = new ProjectModel({
    loadUrl: '/api/gantt/load',
    syncUrl: '/api/gantt/sync',

    // Enable response validation (logs warnings for invalid responses)
    validateResponse: true,

    // Skip success property requirement
    skipSuccessProperty: false  // default
});
```

---

## 5. Auto-Sync vs Manual Sync

### Auto-Sync Configuration

```typescript
const project = new ProjectModel({
    loadUrl: '/api/gantt/load',
    syncUrl: '/api/gantt/sync',

    // Enable auto-sync
    autoSync: true,

    // Delay before sync (default: 100ms)
    autoSyncTimeout: 500
});
```

### Auto-Sync Behavior

When `autoSync` is enabled:
1. Any change to a registered store triggers a timer
2. After `autoSyncTimeout` milliseconds, a sync request is made
3. Multiple rapid changes are batched into a single request

### Controlling Auto-Sync

```typescript
// Temporarily disable auto-sync
project.suspendAutoSync();

// Make multiple changes without triggering sync
task1.name = 'Updated Name';
task2.duration = 10;
task3.remove();

// Re-enable auto-sync
project.resumeAutoSync(true);  // true = trigger sync if there are changes

// Alternatively, resume without triggering sync
project.resumeAutoSync(false);
```

### Manual Sync Pattern

```typescript
const project = new ProjectModel({
    loadUrl: '/api/gantt/load',
    syncUrl: '/api/gantt/sync',
    autoSync: false  // Disable auto-sync
});

// Create a save button handler
async function saveChanges() {
    if (!project.changes) {
        console.log('No changes to save');
        return;
    }

    try {
        await project.sync();
        console.log('Changes saved successfully');
    } catch (error) {
        console.error('Failed to save changes:', error);
    }
}

// Warn user about unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (project.changes) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes';
    }
});
```

### Change Tracking Events

```typescript
// Listen for changes
project.on('hasChanges', () => {
    console.log('There are pending changes');
    document.getElementById('saveBtn').disabled = false;
});

project.on('noChanges', () => {
    console.log('All changes have been saved');
    document.getElementById('saveBtn').disabled = true;
});
```

---

## 6. Handling Sync Conflicts

### Revision-Based Conflict Detection

```typescript
// Server tracks revision numbers
// Client sends current revision with sync request
// Server rejects if revision mismatch

// Example server-side logic (pseudo-code):
// if (request.revision !== currentRevision) {
//     return { success: false, message: 'Conflict detected' };
// }
```

### Client-Side Conflict Handling

```typescript
project.on('syncFail', async ({ response, responseText }) => {
    if (response?.conflict) {
        // Handle conflict
        const userChoice = await showConflictDialog({
            message: 'Another user has made changes.',
            options: ['Reload', 'Force Save', 'Cancel']
        });

        switch (userChoice) {
            case 'Reload':
                // Discard local changes and reload
                await project.load();
                break;
            case 'Force Save':
                // Force sync (server must support this)
                await project.sync({ force: true });
                break;
            case 'Cancel':
                // Do nothing
                break;
        }
    }
});
```

### Optimistic Locking Pattern

```typescript
// Include version field in your models
class CustomTaskModel extends TaskModel {
    static fields = [
        { name: 'version', type: 'number', defaultValue: 0 }
    ];
}

// Server increments version on each update
// Client sends version with updates
// Server rejects if version mismatch
```

### Using trackResponseType for Smart Responses

```typescript
const project = new ProjectModel({
    loadUrl: '/api/gantt/load',
    syncUrl: '/api/gantt/sync',

    // Allow server to respond with load data instead of sync data
    trackResponseType: true
});

// Server can respond to sync with full dataset if conflicts detected
// Response with type: 'load' will replace all data
```

---

## 7. Phantom Records and ID Mapping

### Understanding Phantom Records

A "phantom" record is a newly created record that hasn't been saved to the server yet. It has a temporary client-side ID (phantom ID) that gets replaced with a real server-assigned ID after sync.

### Phantom ID Configuration

```typescript
const project = new ProjectModel({
    loadUrl: '/api/gantt/load',
    syncUrl: '/api/gantt/sync',

    // Field name for phantom IDs in requests/responses
    phantomIdField: '$PhantomId',  // default

    // Field name for phantom parent IDs (for tree structures)
    phantomParentIdField: '$PhantomParentId',

    // Reset phantom IDs before sending to server
    resetIdsBeforeSync: false  // default
});
```

### How Phantom Records Work

```typescript
// 1. Create a new task
const newTask = project.taskStore.add({
    name: 'New Task',
    startDate: '2024-01-15',
    duration: 5
});

console.log(newTask.id);          // '_generated123' (phantom ID)
console.log(newTask.isPhantom);   // true

// 2. Sync request includes phantom ID
// {
//     "tasks": {
//         "added": [{
//             "$PhantomId": "_generated123",
//             "name": "New Task",
//             ...
//         }]
//     }
// }

// 3. Server response maps phantom to real ID
// {
//     "tasks": {
//         "rows": [{
//             "$PhantomId": "_generated123",
//             "id": 500
//         }]
//     }
// }

// 4. After sync
console.log(newTask.id);          // 500 (real ID)
console.log(newTask.isPhantom);   // false
```

### Handling Phantom References

When a phantom record references another phantom record:

```typescript
// Create a phantom task
const parentTask = project.taskStore.add({
    name: 'Parent Task',
    startDate: '2024-01-15',
    duration: 10
});

// Create a child task referencing the phantom parent
const childTask = project.taskStore.add({
    name: 'Child Task',
    parentId: parentTask.id,  // References phantom ID
    startDate: '2024-01-15',
    duration: 5
});

// Sync request handles this correctly:
// {
//     "tasks": {
//         "added": [
//             {
//                 "$PhantomId": "_generated1",
//                 "name": "Parent Task",
//                 ...
//             },
//             {
//                 "$PhantomId": "_generated2",
//                 "$PhantomParentId": "_generated1",
//                 "name": "Child Task",
//                 ...
//             }
//         ]
//     }
// }
```

### Custom ID Generation

```typescript
// Customize phantom ID generation
class CustomStore extends Store {
    generateId(record) {
        // Custom ID generation logic
        return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
```

---

## 8. Batch Operations

### Understanding Batched Requests

CrudManager batches all store changes into a single request:

```typescript
// Multiple operations become one request
project.taskStore.add({ name: 'Task 1' });
project.taskStore.add({ name: 'Task 2' });
project.resourceStore.add({ name: 'Resource 1' });
project.dependencyStore.add({ fromTask: 1, toTask: 2 });

// Single sync request with all changes
await project.sync();
```

### Store Registration Order

```typescript
// Control the order stores are processed
const project = new ProjectModel({
    loadUrl: '/api/gantt/load',
    syncUrl: '/api/gantt/sync',

    // Custom store order for apply sequence
    syncApplySequence: [
        'resources',    // Apply resources first
        'tasks',        // Then tasks
        'assignments',  // Then assignments
        'dependencies'  // Finally dependencies
    ]
});
```

### Adding Custom Stores

```typescript
// Register additional stores with CrudManager
const customStore = new Store({
    id: 'customStore',
    modelClass: CustomModel
});

// Add to CrudManager
project.addCrudStore({
    storeId: 'custom',
    store: customStore,
    phantomIdField: '$PhantomId',
    writeAllFields: true
});

// Insert at specific position
project.addCrudStore(customStore, 0, 'tasks');  // Insert before tasks
```

### Controlling What Gets Sent

```typescript
// Store-level configuration
const project = new ProjectModel({
    taskStore: {
        // Only send modified fields (default)
        writeAllFields: false
    }
});

// Model-level field configuration
class CustomTaskModel extends TaskModel {
    static fields = [
        // This field always gets sent, even if not modified
        { name: 'priority', type: 'number', alwaysWrite: true },

        // This field never gets persisted
        { name: 'tempCalculation', type: 'number', persist: false }
    ];
}
```

### Batch Operation Events

```typescript
// Before batch is sent
project.on('beforeSync', ({ pack }) => {
    console.log('About to sync:', pack);
    // Return false to cancel sync
    return true;
});

// Before response is applied
project.on('beforeSyncApply', ({ response }) => {
    console.log('Applying sync response:', response);
    // Modify response if needed
    // Return false to prevent applying
});

// After sync completes
project.on('sync', ({ response }) => {
    console.log('Sync completed:', response);
});
```

---

## 9. Error Handling (loadFail, syncFail)

### Load Error Handling

```typescript
project.on('loadFail', ({
    response,      // Parsed response object
    responseText,  // Raw response text
    requestOptions,
    rawResponse    // Native Response object
}) => {
    console.error('Load failed:', response);

    // Check HTTP status
    if (rawResponse?.status === 401) {
        // Redirect to login
        window.location.href = '/login';
        return;
    }

    if (rawResponse?.status === 404) {
        showError('Project not found');
        return;
    }

    // Generic error handling
    showError(response?.message || 'Failed to load data');
});
```

### Sync Error Handling

```typescript
project.on('syncFail', ({
    response,
    responseText,
    requestOptions,
    rawResponse
}) => {
    console.error('Sync failed:', response);

    // Handle validation errors
    if (response?.errors) {
        response.errors.forEach(error => {
            const record = project.taskStore.getById(error.recordId);
            if (record) {
                record.set('errorMessage', error.message);
            }
        });
        showValidationErrors(response.errors);
        return;
    }

    // Handle network errors
    if (!rawResponse) {
        showError('Network error. Please check your connection.');
        return;
    }

    // Handle server errors
    showError(response?.message || 'Failed to save changes');
});
```

### Generic Request Error Handling

```typescript
// Handle both load and sync failures
project.on('requestFail', ({
    requestType,  // 'load' or 'sync'
    response,
    responseText,
    rawResponse
}) => {
    console.error(`${requestType} request failed:`, response);

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
        console.log('Response text:', responseText);
        console.log('Raw response:', rawResponse);
    }
});
```

### Retry Pattern

```typescript
class RetryableCrudManager {
    private retryCount = 0;
    private maxRetries = 3;
    private retryDelay = 1000;

    constructor(private project: ProjectModel) {
        this.setupRetryHandling();
    }

    private setupRetryHandling() {
        this.project.on('syncFail', async ({ rawResponse }) => {
            // Only retry on network/server errors
            if (!rawResponse || rawResponse.status >= 500) {
                if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    console.log(`Retry attempt ${this.retryCount}/${this.maxRetries}`);

                    await this.delay(this.retryDelay * this.retryCount);
                    await this.project.sync();
                } else {
                    this.retryCount = 0;
                    showError('Failed to save after multiple attempts');
                }
            }
        });

        this.project.on('sync', () => {
            this.retryCount = 0;
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

### Reverting Changes on Error

```typescript
project.on('syncFail', () => {
    // Ask user if they want to revert changes
    if (confirm('Failed to save. Revert changes?')) {
        project.revertChanges();
    }
});

// Manual revert
function discardChanges() {
    if (project.changes && confirm('Discard all unsaved changes?')) {
        project.revertChanges();
    }
}
```

---

## 10. Custom Transport (sendRequest)

### Understanding sendRequest

The `sendRequest` method is the core transport mechanism. Override it to implement custom communication:

```typescript
// sendRequest signature
sendRequest(request: {
    type: 'load' | 'sync';
    url: string;
    data: string;
    params: object;
    success: Function;
    failure: Function;
    thisObj: object;
}): Promise<any>;
```

### Custom Transport Implementation

```typescript
class CustomProjectModel extends ProjectModel {
    sendRequest(request) {
        const { type, data, params, success, failure, thisObj } = request;

        // Custom fetch implementation
        return fetch(this.getUrl(type), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
                'X-CSRF-Token': getCsrfToken()
            },
            body: data,
            credentials: 'include'
        })
        .then(async response => {
            const text = await response.text();
            const json = this.decode(text);

            if (response.ok && json?.success !== false) {
                success.call(thisObj, json, text, request);
            } else {
                failure.call(thisObj, json, text, request);
            }

            return { response: json, rawResponse: response };
        })
        .catch(error => {
            failure.call(thisObj, null, error.message, request);
            throw error;
        });
    }

    private getUrl(type: 'load' | 'sync'): string {
        return type === 'load' ? this.loadUrl : this.syncUrl;
    }
}
```

### WebSocket Transport

```typescript
class WebSocketProjectModel extends ProjectModel {
    private ws: WebSocket;
    private pendingRequests: Map<number, {
        resolve: Function;
        reject: Function;
        success: Function;
        failure: Function;
        thisObj: object;
    }> = new Map();
    private requestId = 0;

    constructor(config: ProjectModelConfig) {
        super(config);
        this.initWebSocket();
    }

    private initWebSocket() {
        this.ws = new WebSocket('wss://api.example.com/gantt');

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const pending = this.pendingRequests.get(data.requestId);

            if (pending) {
                if (data.success !== false) {
                    pending.success.call(pending.thisObj, data, event.data, {});
                    pending.resolve(data);
                } else {
                    pending.failure.call(pending.thisObj, data, event.data, {});
                    pending.reject(new Error(data.message));
                }
                this.pendingRequests.delete(data.requestId);
            }
        };
    }

    sendRequest(request) {
        return new Promise((resolve, reject) => {
            const requestId = ++this.requestId;
            const payload = {
                requestId,
                type: request.type,
                data: JSON.parse(request.data)
            };

            this.pendingRequests.set(requestId, {
                resolve,
                reject,
                success: request.success,
                failure: request.failure,
                thisObj: request.thisObj
            });

            this.ws.send(JSON.stringify(payload));
        });
    }
}
```

### GraphQL Transport

```typescript
class GraphQLProjectModel extends ProjectModel {
    private graphqlEndpoint = '/graphql';

    sendRequest(request) {
        const { type, data, success, failure, thisObj } = request;
        const parsedData = JSON.parse(data);

        const mutation = type === 'load'
            ? this.buildLoadQuery(parsedData)
            : this.buildSyncMutation(parsedData);

        return fetch(this.graphqlEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ query: mutation })
        })
        .then(async response => {
            const result = await response.json();

            if (result.errors) {
                failure.call(thisObj, result, JSON.stringify(result), request);
                return { response: result, rawResponse: response };
            }

            const transformedData = this.transformGraphQLResponse(result.data, type);
            success.call(thisObj, transformedData, JSON.stringify(transformedData), request);
            return { response: transformedData, rawResponse: response };
        })
        .catch(error => {
            failure.call(thisObj, null, error.message, request);
            throw error;
        });
    }

    private buildLoadQuery(data: any): string {
        return `
            query LoadGanttData {
                tasks {
                    id
                    name
                    startDate
                    duration
                    percentDone
                    parentId
                }
                resources {
                    id
                    name
                    role
                }
                dependencies {
                    id
                    fromTask
                    toTask
                    type
                }
                assignments {
                    id
                    eventId
                    resourceId
                    units
                }
            }
        `;
    }

    private buildSyncMutation(data: any): string {
        // Build GraphQL mutation from sync data
        return `
            mutation SyncGanttData($input: GanttSyncInput!) {
                syncGantt(input: $input) {
                    success
                    tasks { id $PhantomId }
                    resources { id $PhantomId }
                    dependencies { id $PhantomId }
                    assignments { id $PhantomId }
                }
            }
        `;
    }

    private transformGraphQLResponse(data: any, type: 'load' | 'sync') {
        return {
            success: true,
            tasks: { rows: data.tasks || [] },
            resources: { rows: data.resources || [] },
            dependencies: { rows: data.dependencies || [] },
            assignments: { rows: data.assignments || [] }
        };
    }
}
```

### Custom Encoder/Decoder

```typescript
class CustomEncodingProjectModel extends ProjectModel {
    // Custom request encoding
    encode(requestData: object): string {
        // Example: Add metadata to every request
        const enhanced = {
            ...requestData,
            metadata: {
                clientVersion: '1.0.0',
                timestamp: Date.now(),
                userId: getCurrentUserId()
            }
        };
        return JSON.stringify(enhanced);
    }

    // Custom response decoding
    decode(responseText: string): object | null {
        try {
            const data = JSON.parse(responseText);

            // Example: Handle wrapped responses
            if (data.result) {
                return data.result;
            }

            return data;
        } catch (e) {
            console.error('Failed to decode response:', e);
            return null;
        }
    }
}
```

### Request Interception with beforeSend

```typescript
project.on('beforeSend', async ({
    crudManager,
    params,
    requestType,
    requestConfig
}) => {
    // Add dynamic headers
    requestConfig.headers = {
        ...requestConfig.headers,
        'X-Correlation-ID': generateCorrelationId(),
        'X-Request-Time': new Date().toISOString()
    };

    // Add query parameters
    params.clientId = getClientId();

    // Log request for debugging
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${requestType}] Sending request:`, requestConfig);
    }

    // Wait for async operations if needed
    await ensureValidToken();
});
```

---

## 11. Offline Mode and Local Storage

### Basic Offline Pattern

```typescript
import { ProjectModel } from '@bryntum/gantt';

class OfflineProjectModel extends ProjectModel {
    private offlineQueue: any[] = [];
    private isOnline: boolean = navigator.onLine;

    constructor(config: ProjectModelConfig) {
        super(config);
        this.setupOfflineHandling();
    }

    private setupOfflineHandling() {
        // Monitor online/offline status
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Override sync to queue when offline
        this.on('beforeSync', ({ source }) => {
            if (!this.isOnline) {
                this.queueChanges();
                return false;  // Cancel server sync
            }
        });
    }

    private handleOnline() {
        this.isOnline = true;
        this.flushOfflineQueue();
    }

    private handleOffline() {
        this.isOnline = false;
        this.saveToLocalStorage();
    }

    private queueChanges() {
        const changes = this.changes;
        if (changes) {
            this.offlineQueue.push({
                timestamp: Date.now(),
                changes
            });
            this.saveToLocalStorage();
        }
    }

    private saveToLocalStorage() {
        const data = {
            stores: this.getStoreData(),
            queue: this.offlineQueue
        };
        localStorage.setItem('gantt-offline-data', JSON.stringify(data));
    }

    private getStoreData() {
        return {
            tasks: this.taskStore.records.map(r => r.data),
            dependencies: this.dependencyStore.records.map(r => r.data),
            resources: this.resourceStore.records.map(r => r.data),
            assignments: this.assignmentStore.records.map(r => r.data)
        };
    }

    private async flushOfflineQueue() {
        if (this.offlineQueue.length === 0) return;

        for (const item of this.offlineQueue) {
            try {
                await this.applyChanges(item.changes);
            } catch (e) {
                console.error('Failed to sync offline change:', e);
            }
        }

        this.offlineQueue = [];
        localStorage.removeItem('gantt-offline-data');
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('gantt-offline-data');
        if (stored) {
            const data = JSON.parse(stored);
            this.loadStoreData(data.stores);
            this.offlineQueue = data.queue || [];
        }
    }

    private loadStoreData(stores: any) {
        if (stores.tasks) this.taskStore.data = stores.tasks;
        if (stores.dependencies) this.dependencyStore.data = stores.dependencies;
        if (stores.resources) this.resourceStore.data = stores.resources;
        if (stores.assignments) this.assignmentStore.data = stores.assignments;
    }
}
```

### IndexedDB Storage Pattern

For larger projects, use IndexedDB instead of localStorage:

```typescript
class IndexedDBStorage {
    private db: IDBDatabase | null = null;
    private dbName = 'gantt-offline';
    private version = 1;

    async open(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object stores for each data type
                if (!db.objectStoreNames.contains('tasks')) {
                    db.createObjectStore('tasks', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('dependencies')) {
                    db.createObjectStore('dependencies', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('resources')) {
                    db.createObjectStore('resources', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('assignments')) {
                    db.createObjectStore('assignments', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('queue')) {
                    db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async saveStore(storeName: string, records: any[]): Promise<void> {
        if (!this.db) await this.open();

        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        // Clear existing data
        await this.promisify(store.clear());

        // Add all records
        for (const record of records) {
            await this.promisify(store.put(record));
        }
    }

    async loadStore(storeName: string): Promise<any[]> {
        if (!this.db) await this.open();

        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);

        return this.promisify(store.getAll());
    }

    private promisify<T>(request: IDBRequest<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}
```

### Conflict Resolution Pattern

```typescript
interface ConflictResolution {
    strategy: 'server-wins' | 'client-wins' | 'merge' | 'manual';
    conflicts: ConflictItem[];
}

interface ConflictItem {
    recordId: string | number;
    storeName: string;
    clientValue: any;
    serverValue: any;
}

async function resolveConflicts(conflicts: ConflictItem[], strategy: string): Promise<any[]> {
    const resolved: any[] = [];

    for (const conflict of conflicts) {
        switch (strategy) {
            case 'server-wins':
                resolved.push(conflict.serverValue);
                break;

            case 'client-wins':
                resolved.push(conflict.clientValue);
                break;

            case 'merge':
                resolved.push(mergeRecords(conflict.clientValue, conflict.serverValue));
                break;

            case 'manual':
                const resolution = await showConflictDialog(conflict);
                resolved.push(resolution);
                break;
        }
    }

    return resolved;
}

function mergeRecords(client: any, server: any): any {
    const merged = { ...server };

    // Client modifications take precedence for user-editable fields
    const userEditableFields = ['name', 'note', 'percentDone'];

    for (const field of userEditableFields) {
        if (client[field] !== undefined && client._modifiedFields?.includes(field)) {
            merged[field] = client[field];
        }
    }

    return merged;
}
```

---

## 12. Cross-References

### Related Deep-Dive Documents

| Document | Relationship |
|----------|--------------|
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | Store structure and data loading |
| [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) | Sync events (beforeSync, syncSuccess, syncFail) |
| [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) | ProjectModel and commitAsync() |

### Key API References (Level 1)

- `ProjectModelConfig.loadUrl` - Load endpoint
- `ProjectModelConfig.syncUrl` - Sync endpoint
- `CrudManagerConfig.transport` - Custom transport
- `CrudManagerConfig.encoder` - Request encoding
- `CrudManagerConfig.decoder` - Response decoding

---

## Summary

The CrudManager provides a powerful and flexible data persistence layer for Bryntum Gantt applications. Key takeaways:

1. **Centralized Data Management**: All stores are managed through a single interface
2. **Batched Operations**: Multiple changes are sent in single requests
3. **Phantom ID Handling**: Automatic mapping of client-side IDs to server-assigned IDs
4. **Flexible Transport**: Override `sendRequest` for custom communication protocols
5. **Robust Error Handling**: Comprehensive events for handling failures
6. **Auto-Sync Support**: Automatic persistence with configurable debouncing

For production applications, consider implementing:
- Retry logic for transient failures
- Optimistic UI updates with rollback capability
- Conflict resolution strategies
- Request/response logging for debugging
- Token refresh handling for authentication
