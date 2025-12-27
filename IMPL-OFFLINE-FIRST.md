# IMPL-OFFLINE-FIRST.md
## Offline-First Architecture

**Purpose**: Implement offline-capable applications using IndexedDB, Service Workers, and local storage with synchronization strategies.

**Products**: All Bryntum products (sparse-index example, CrudManager patterns)

---

## Overview

Offline-first architecture ensures applications work without network connectivity by:
1. Storing data locally in IndexedDB
2. Using Service Workers to intercept network requests
3. Syncing changes when connectivity is restored
4. Handling conflicts between local and remote data

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Bryntum Application                       │
│  ┌─────────────────┐    ┌──────────────────────────────────┐   │
│  │  Grid/Gantt/    │    │  CrudManager                      │   │
│  │  Calendar       │◄──►│  - Load/Sync URLs                 │   │
│  └─────────────────┘    │  - Auto-sync                      │   │
│                          └──────────────┬───────────────────┘   │
└──────────────────────────────────────────┼──────────────────────┘
                                           │ fetch()
                    ┌──────────────────────▼──────────────────────┐
                    │            Service Worker                    │
                    │  ┌─────────────────────────────────────────┐│
                    │  │  Request Interceptor                    ││
                    │  │  - Route to IndexedDB for /store URLs   ││
                    │  │  - Pass through other requests          ││
                    │  └─────────────────────────────────────────┘│
                    │  ┌─────────────────────────────────────────┐│
                    │  │  IndexedDB Manager                      ││
                    │  │  - CRUD operations                      ││
                    │  │  - Data persistence                     ││
                    │  └─────────────────────────────────────────┘│
                    └──────────────────────────────────────────────┘
```

---

## Service Worker Implementation

### Configuration

```javascript
// service-worker-config.js
const SW_CONFIG = {
    dbName: 'BryntumOfflineDB',
    dbVersion: 1,
    initialDataUrl: 'data/initial-data.json',
    storeDefs: [
        { name: 'tasks', indexes: [] },
        { name: 'resources', indexes: [] },
        { name: 'assignments', indexes: [] },
        { name: 'dependencies', indexes: [] }
    ]
};
```

### Service Worker Core

```javascript
// service-worker.js
importScripts('./service-worker-config.js');

const { dbName, storeDefs, dbVersion, initialDataUrl } = SW_CONFIG;

// Lifecycle Events
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const db = await openDB();
        db.close();
        self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Request Interception
self.addEventListener('fetch', event => {
    const { method, url: _url } = event.request;
    const url = new URL(_url);
    const { pathname } = url;
    const storeName = pathname.substring(1);

    // Database management endpoints
    if (pathname === '/db/status') {
        event.respondWith(dbStatusHandler());
        return;
    }

    if (pathname === '/db/seed' && method === 'POST') {
        event.respondWith(dbSeedHandler());
        return;
    }

    if (pathname === '/db/reset' && method === 'POST') {
        event.respondWith(dbResetHandler());
        return;
    }

    // Store CRUD endpoints
    if (getStoreDefs().find(def => def.name === storeName)) {
        event.respondWith(handleRequest(storeName, event.request));
    }
});
```

---

## IndexedDB Operations

### Database Setup

```javascript
// Helper functions
function promisifyRequest(req) {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function promisifyTransaction(tx, result) {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('aborted'));
    });
}

// Open database with version upgrade handling
async function openDB() {
    const req = indexedDB.open(dbName, dbVersion);

    req.onupgradeneeded = event => {
        const db = event.target.result;

        getStoreDefs().forEach(storeDef => {
            if (!db.objectStoreNames.contains(storeDef.name)) {
                initStore(db, storeDef);
            }
        });
    };

    return promisifyRequest(req);
}

// Initialize object store with indexes
function initStore(db, { name, indexes = [] }) {
    const store = db.createObjectStore(name, {
        keyPath: 'id',
        autoIncrement: true
    });

    // Standard indexes for tree structures
    store.createIndex('parentId', 'parentId', { unique: false });
    store.createIndex('hasParent', 'hasParent', { unique: false });

    // Custom indexes
    indexes.forEach(({ name, keyPath, options = {} }) => {
        store.createIndex(name, keyPath, options);
    });
}
```

### Database Context Helpers

```javascript
// Execute function with database connection
async function withDB(fn) {
    const db = await openDB();

    try {
        return await fn(db);
    }
    finally {
        db.close();
    }
}

// Execute function with store transaction
async function withStore(storeName, writable, fn) {
    return withDB(async db => {
        const tx = db.transaction(storeName, writable ? 'readwrite' : 'readonly');
        const store = tx.objectStore(storeName);

        try {
            return promisifyTransaction(tx, fn(store));
        }
        catch (error) {
            tx.abort();
            throw error;
        }
    });
}
```

---

## CRUD Request Handlers

### Read Handler (GET)

```javascript
function readHandler(storeName, urlParams) {
    return withStore(storeName, false, async store => {
        const parentIdIndex = store.index('parentId');
        const hasParentIndex = store.index('hasParent');
        const results = [];
        const parentId = urlParams.get('parentId');
        const isLazyLoad = parentId === 'root';
        const pid = Number(parentId) || null;

        // Recursive child fetching for tree structures
        async function fetchChildren(parentId) {
            const req = parentId
                ? parentIdIndex.getAll(parentId)
                : hasParentIndex.getAll(0);

            const children = await promisifyRequest(req);

            for (const child of children) {
                results.push(stripHelpers(child));

                // Expand children if node is expanded (not lazy loading)
                if (child.expanded && !isLazyLoad) {
                    await fetchChildren(child.id);
                }
            }
        }

        await fetchChildren(pid);
        return results;
    });
}
```

### Create Handler (POST)

```javascript
async function createHandler(storeName, { data }) {
    const insertedIds = [];

    for (const item of data) {
        // Let autoIncrement assign ID if not numeric
        if (Number.isNaN(Number(item.id))) {
            delete item.id;
        }

        // Track parent relationship
        item.hasParent = Number(Boolean(Number(item.parentId)));

        await withStore(storeName, true, async store => {
            const result = await promisifyRequest(store.add(item));
            insertedIds.push(result);
        });
    }

    // Return created records
    return fetchRecordsInOrder(storeName, insertedIds);
}
```

### Update Handler (PUT)

```javascript
function updateHandler(storeName, { data }) {
    return withStore(storeName, true, store => {
        const updatedIds = [];

        for (const item of data) {
            const id = Number(item.id);
            if (Number.isNaN(id)) continue;

            const req = store.get(id);
            req.onsuccess = () => {
                const existing = req.result;
                const hasParent = Number(Boolean(Number(
                    Object.hasOwn(item, 'parentId')
                        ? item.parentId
                        : existing.parentId
                )));

                if (existing) {
                    store.put({
                        ...existing,
                        ...item,
                        hasParent
                    });
                }
            };

            updatedIds.push(id);
        }

        return fetchRecordsInOrder(storeName, updatedIds);
    });
}
```

### Delete Handler (DELETE)

```javascript
function deleteHandler(storeName, { ids }) {
    return withStore(storeName, true, async store => {
        const deletedIds = [];

        for (const unsafeId of ids) {
            const id = Number(unsafeId);
            if (Number.isNaN(id)) continue;

            const req = store.delete(id);
            req.onsuccess = () => deletedIds.push(id);
        }

        return { deleted: deletedIds.length };
    });
}
```

---

## Request Router

```javascript
async function handleRequest(storeName, request) {
    try {
        const method = request.method;
        const body = method === 'GET' ? null : await request.json();
        const url = new URL(request.url);
        const params = url.searchParams || {};

        let result;

        switch (method) {
            case 'POST':
                result = await createHandler(storeName, body);
                break;
            case 'GET':
                result = await readHandler(storeName, params);
                break;
            case 'PUT':
                result = await updateHandler(storeName, body);
                break;
            case 'DELETE':
                result = await deleteHandler(storeName, body);
                break;
            default:
                return new Response('Method Not Allowed', { status: 405 });
        }

        return jsonResponse(result);
    }
    catch (err) {
        return jsonResponse({ error: err.message }, 500);
    }
}

function jsonResponse(obj = {}, status = 200) {
    return new Response(
        JSON.stringify({ ...obj, success: status === 200 }),
        {
            status,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            }
        }
    );
}
```

---

## Database Management

### Status Check

```javascript
async function dbStatusHandler() {
    try {
        const stores = await Promise.all(
            getStoreDefs().map(({ name }) =>
                withStore(name, false, async store => {
                    const count = await promisifyRequest(store.count());
                    return { name, hasData: count > 0, count };
                })
            )
        );

        return jsonResponse({ stores });
    }
    catch (error) {
        return jsonResponse({ message: error.message }, 500);
    }
}
```

### Seed Database

```javascript
async function dbSeedHandler() {
    const data = await loadInitialData();
    const results = [];

    for (const storeDef of getStoreDefs()) {
        await ensureStoreExists(storeDef);

        const { name } = storeDef;
        const seeded = await withStore(name, true, async store => {
            const count = await promisifyRequest(store.count());

            if (count > 0) return false;

            if (Array.isArray(data[name])) {
                for (const item of data[name]) {
                    if (Number.isNaN(Number(item.id))) {
                        delete item.id;
                    }
                    item.hasParent = Number(Boolean(Number(item.parentId)));
                    store.add(item);
                }
            }
            return true;
        });

        results.push({
            store: name,
            seeded,
            message: seeded
                ? `Seeded ${name} with ${data[name]?.length ?? 0} items`
                : `${name} already has data`
        });
    }

    return jsonResponse({ results });
}

async function loadInitialData() {
    const res = await fetch(initialDataUrl, { cache: 'no-store' });

    if (!res.ok) {
        throw new Error(`Failed to load ${initialDataUrl}`);
    }
    return res.json();
}
```

### Reset Database

```javascript
async function dbResetHandler() {
    await dbDropHandler();
    await dbSeedHandler();
    return jsonResponse({ message: 'Database reset' });
}

async function dbDropHandler() {
    await new Promise((resolve, reject) => {
        const req = indexedDB.deleteDatabase(dbName);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error('Database deletion blocked'));
    });
    return jsonResponse({ message: 'Database dropped' });
}
```

---

## Application Integration

### Register Service Worker

```javascript
// main.js
async function initOfflineSupport() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register(
                './service-worker.js',
                { scope: './' }
            );

            console.log('Service Worker registered:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // New version available
                            showUpdateNotification();
                        }
                    }
                });
            });

            // Initial data seeding
            await seedDatabase();

        }
        catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

async function seedDatabase() {
    const statusResponse = await fetch('/db/status');
    const status = await statusResponse.json();

    const needsSeeding = status.stores.some(store => !store.hasData);

    if (needsSeeding) {
        await fetch('/db/seed', { method: 'POST' });
    }
}
```

### Configure CrudManager

```javascript
import { Gantt } from '@bryntum/gantt';

// Initialize offline support first
await initOfflineSupport();

// CrudManager points to Service Worker endpoints
const gantt = new Gantt({
    appendTo: 'container',

    project: {
        taskStore: {
            // Matches store name in service worker config
        },
        transport: {
            load: {
                url: '/tasks'  // Intercepted by Service Worker
            },
            sync: {
                url: '/tasks'  // Intercepted by Service Worker
            }
        },
        autoLoad: true,
        autoSync: true
    }
});
```

---

## Online/Offline Detection

### Network Status Handler

```javascript
class NetworkStatusHandler {
    constructor(project) {
        this.project = project;
        this.pendingChanges = [];

        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    handleOnline() {
        console.log('Back online - syncing pending changes');

        // Resume auto-sync
        this.project.resumeAutoSync();

        // Notify user
        Toast.show({
            html: 'Connection restored - syncing changes',
            timeout: 3000
        });
    }

    handleOffline() {
        console.log('Going offline - queuing changes');

        // Suspend remote sync (local storage continues)
        this.project.suspendAutoSync();

        Toast.show({
            html: 'Working offline - changes will sync when connected',
            timeout: 3000
        });
    }

    get isOnline() {
        return navigator.onLine;
    }
}
```

### Visual Offline Indicator

```javascript
class OfflineIndicator {
    constructor(container) {
        this.element = document.createElement('div');
        this.element.className = 'offline-indicator';
        this.element.innerHTML = '🔌 Offline';
        this.element.style.display = 'none';

        container.appendChild(this.element);

        window.addEventListener('online', () => this.hide());
        window.addEventListener('offline', () => this.show());

        // Initial state
        if (!navigator.onLine) this.show();
    }

    show() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }
}

// CSS
const styles = `
.offline-indicator {
    position: fixed;
    top: 10px;
    right: 10px;
    background: #f44336;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    z-index: 9999;
    font-weight: bold;
}
`;
```

---

## Sync Strategies

### Optimistic Updates

```javascript
class OptimisticSyncStrategy {
    constructor(project) {
        this.project = project;
        this.pendingOperations = new Map();
    }

    async create(storeName, data) {
        // Generate temporary ID
        const tempId = `temp_${Date.now()}`;
        data.id = tempId;
        data._pending = true;

        // Apply locally immediately
        this.project[storeName].add(data);

        // Queue for remote sync
        this.pendingOperations.set(tempId, {
            type: 'create',
            storeName,
            data
        });

        // Attempt remote sync
        if (navigator.onLine) {
            await this.syncOperation(tempId);
        }

        return data;
    }

    async syncOperation(tempId) {
        const operation = this.pendingOperations.get(tempId);
        if (!operation) return;

        try {
            const response = await fetch(`/${operation.storeName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [operation.data] })
            });

            const result = await response.json();

            // Update local record with server ID
            const record = this.project[operation.storeName].getById(tempId);
            if (record && result[0]) {
                record.id = result[0].id;
                delete record._pending;
            }

            this.pendingOperations.delete(tempId);

        }
        catch (error) {
            console.warn('Sync failed, will retry:', error);
        }
    }

    async syncAll() {
        for (const [tempId] of this.pendingOperations) {
            await this.syncOperation(tempId);
        }
    }
}
```

### Background Sync API

```javascript
// In Service Worker
self.addEventListener('sync', event => {
    if (event.tag === 'sync-changes') {
        event.waitUntil(syncPendingChanges());
    }
});

async function syncPendingChanges() {
    const pendingChanges = await getPendingChanges();

    for (const change of pendingChanges) {
        try {
            await syncChange(change);
            await markChangeSynced(change.id);
        }
        catch (error) {
            console.error('Background sync failed:', error);
        }
    }
}

// In main application
async function requestBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-changes');
    }
}
```

---

## Conflict Resolution

### Last-Write-Wins

```javascript
function resolveConflict(local, remote) {
    // Compare timestamps
    const localTime = new Date(local.lastModified).getTime();
    const remoteTime = new Date(remote.lastModified).getTime();

    return remoteTime > localTime ? remote : local;
}
```

### Merge Strategy

```javascript
function mergeChanges(local, remote, base) {
    const merged = { ...base };

    // For each field, determine which version to use
    for (const field of Object.keys({ ...local, ...remote })) {
        const localChanged = local[field] !== base[field];
        const remoteChanged = remote[field] !== base[field];

        if (localChanged && !remoteChanged) {
            merged[field] = local[field];
        }
        else if (remoteChanged && !localChanged) {
            merged[field] = remote[field];
        }
        else if (localChanged && remoteChanged) {
            // Both changed - need resolution strategy
            if (local[field] === remote[field]) {
                merged[field] = local[field];
            }
            else {
                // Custom resolution or user prompt
                merged[field] = remote[field];
                merged._conflicts = merged._conflicts || [];
                merged._conflicts.push({
                    field,
                    local: local[field],
                    remote: remote[field]
                });
            }
        }
    }

    return merged;
}
```

---

## Storage Quota Management

```javascript
async function checkStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const percentUsed = (estimate.usage / estimate.quota * 100).toFixed(2);

        console.log(`Storage: ${formatBytes(estimate.usage)} / ${formatBytes(estimate.quota)} (${percentUsed}%)`);

        if (estimate.usage / estimate.quota > 0.9) {
            // Approaching quota limit
            await cleanupOldData();
        }

        return estimate;
    }
}

async function requestPersistentStorage() {
    if ('storage' in navigator && 'persist' in navigator.storage) {
        const isPersisted = await navigator.storage.persisted();

        if (!isPersisted) {
            const result = await navigator.storage.persist();
            console.log(`Persistent storage: ${result ? 'granted' : 'denied'}`);
            return result;
        }
        return true;
    }
    return false;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
```

---

## Dashboard Integration

### Toolbar with Sync Controls

```javascript
const gantt = new Gantt({
    tbar: {
        items: {
            offlineIndicator: {
                type: 'widget',
                cls: 'offline-badge',
                html: '🔌 Offline',
                hidden: navigator.onLine
            },
            syncButton: {
                type: 'button',
                icon: 'b-fa-sync',
                text: 'Sync Now',
                onClick() {
                    gantt.project.sync();
                }
            },
            resetData: {
                type: 'button',
                text: 'Reset Local Data',
                async onClick() {
                    await fetch('/db/reset', { method: 'POST' });
                    gantt.project.load();
                }
            }
        }
    }
});

// Update indicator on network status change
window.addEventListener('online', () => {
    gantt.widgetMap.offlineIndicator.hidden = true;
});

window.addEventListener('offline', () => {
    gantt.widgetMap.offlineIndicator.hidden = false;
});
```

---

## Best Practices

1. **Seed Data on First Load**: Pre-populate IndexedDB with initial data
2. **Handle Quota**: Monitor storage usage and clean up old data
3. **Request Persistence**: Ask for persistent storage to prevent eviction
4. **Visual Feedback**: Show sync status and offline indicators
5. **Graceful Degradation**: Application works without Service Worker
6. **Conflict Resolution**: Choose appropriate strategy for your data

---

## Related Documentation

- **IMPL-WEBSOCKET-SYNC.md**: Real-time multi-user sync
- **IMPL-STATE-MANAGEMENT.md**: UI state persistence
- **CORE-CRUD-MANAGER.md**: Data loading and syncing
