# Gantt Implementation: Realtime Updates

> **WebSocket synchronisatie** voor live multi-user editing, met ProjectWebSocketHandlerMixin, revision tracking, en conflict resolution.

---

## Overzicht

Realtime updates stellen meerdere gebruikers in staat om gelijktijdig aan hetzelfde Gantt project te werken. Alle wijzigingen worden automatisch gesynchroniseerd via WebSocket.

```
User A                    Server                    User B
   │                         │                         │
   ├──[edit task]────────────►                         │
   │                         ├──[broadcast]───────────►│
   │                         │                 [task updated]
   │◄────[ack + revision]────┤                         │
   │                         │                         │
   │                         │◄────[edit task]─────────┤
   │◄─────[broadcast]────────┤                         │
[task updated]               ├──[ack + revision]──────►│
```

---

## 1. ProjectWebSocketHandlerMixin

### 1.1 Basis Implementatie

```javascript
import { Gantt, ProjectModel, Base } from '@bryntum/gantt';

// Mixin voor WebSocket handling
class WebSocketManager extends Base.mixin(ProjectModel.ProjectWebSocketHandlerMixin) {

    static configurable = {
        project: null,
        url: null
    };

    construct(config) {
        super.construct(config);

        // Maak WebSocket connectie
        this.socket = new WebSocket(this.url);

        // Luister naar server messages
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.onMessage(data);
        };

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.requestFullSync();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
            console.log('WebSocket closed');
            this.reconnect();
        };
    }
}
```

### 1.2 Message Handlers

```javascript
class WebSocketManager extends Base.mixin(ProjectModel.ProjectWebSocketHandlerMixin) {

    onMessage(data) {
        const { type, payload, revision, sender } = data;

        switch (type) {
            case 'sync':
                // Volledige project sync
                this.handleFullSync(payload);
                break;

            case 'changes':
                // Incrementele changes van andere users
                this.handleChanges(payload, revision, sender);
                break;

            case 'ack':
                // Acknowledgement van onze changes
                this.handleAck(payload, revision);
                break;

            case 'conflict':
                // Conflict met andere user
                this.handleConflict(payload);
                break;
        }
    }

    handleFullSync(projectData) {
        // Stop luisteren naar project events tijdens sync
        this.suspendSync = true;

        // Laad volledige project data
        this.project.loadCrudManagerData(projectData);

        // Bewaar server revision
        this.serverRevision = projectData.revision;

        this.suspendSync = false;
    }

    handleChanges(changes, revision, sender) {
        // Negeer eigen changes
        if (sender === this.clientId) return;

        // Check revision order
        if (revision <= this.serverRevision) return;

        this.suspendSync = true;

        // Apply server changes
        this.applyChangeset(changes);

        this.serverRevision = revision;
        this.suspendSync = false;
    }
}
```

---

## 2. Client-Side Change Tracking

### 2.1 Project Event Listeners

```javascript
class WebSocketManager extends Base.mixin(ProjectModel.ProjectWebSocketHandlerMixin) {

    setupProjectListeners() {
        // Luister naar alle data changes
        this.project.on({
            change: this.onProjectChange,
            thisObj: this
        });

        // Specifieke store events
        this.project.taskStore.on({
            add: this.onTaskAdd,
            remove: this.onTaskRemove,
            update: this.onTaskUpdate,
            thisObj: this
        });

        this.project.dependencyStore.on({
            add: this.onDependencyAdd,
            remove: this.onDependencyRemove,
            thisObj: this
        });
    }

    onProjectChange({ action, records, changes }) {
        if (this.suspendSync) return;

        // Verzamel changes in batch
        this.pendingChanges.push({
            action,
            records: records.map(r => r.id),
            changes
        });

        // Debounce send
        this.scheduleSend();
    }

    scheduleSend() {
        if (this.sendTimer) return;

        this.sendTimer = setTimeout(() => {
            this.sendChanges();
            this.sendTimer = null;
        }, 100); // 100ms debounce
    }
}
```

### 2.2 Change Batching

```javascript
sendChanges() {
    if (this.pendingChanges.length === 0) return;

    const changeset = this.buildChangeset(this.pendingChanges);
    this.pendingChanges = [];

    // Stuur naar server met lokale revision
    this.socket.send(JSON.stringify({
        type: 'changes',
        payload: changeset,
        revision: this.localRevision++,
        clientId: this.clientId
    }));

    // Bewaar voor mogelijke retry/conflict resolution
    this.unackedChanges.push({
        changeset,
        revision: this.localRevision - 1
    });
}

buildChangeset(changes) {
    return {
        tasks: {
            added: [],
            updated: [],
            removed: []
        },
        dependencies: {
            added: [],
            updated: [],
            removed: []
        },
        resources: {
            added: [],
            updated: [],
            removed: []
        },
        assignments: {
            added: [],
            updated: [],
            removed: []
        }
    };
}
```

---

## 3. Server-Side Implementation

### 3.1 Node.js WebSocket Server

```javascript
const WebSocket = require('ws');

class ProjectSyncServer {
    constructor() {
        this.wss = new WebSocket.Server({ port: 8080 });
        this.clients = new Map();
        this.projectState = null;
        this.revision = 0;

        this.wss.on('connection', (ws) => this.onConnection(ws));
    }

    onConnection(ws) {
        const clientId = this.generateClientId();
        this.clients.set(clientId, ws);

        ws.on('message', (data) => {
            const message = JSON.parse(data);
            this.handleMessage(clientId, message, ws);
        });

        ws.on('close', () => {
            this.clients.delete(clientId);
            this.broadcast({
                type: 'user_left',
                payload: { clientId }
            });
        });

        // Stuur client ID en huidige state
        ws.send(JSON.stringify({
            type: 'init',
            payload: {
                clientId,
                project: this.projectState,
                revision: this.revision
            }
        }));
    }

    handleMessage(clientId, message, ws) {
        switch (message.type) {
            case 'changes':
                this.handleChanges(clientId, message, ws);
                break;
            case 'request_sync':
                this.sendFullSync(ws);
                break;
        }
    }
}
```

### 3.2 Change Broadcasting

```javascript
handleChanges(clientId, message, senderWs) {
    const { payload: changeset, revision: clientRevision } = message;

    // Valideer en apply changes
    const result = this.applyChangeset(changeset);

    if (result.success) {
        // Verhoog server revision
        this.revision++;

        // Acknowledge naar sender
        senderWs.send(JSON.stringify({
            type: 'ack',
            payload: {
                clientRevision,
                serverRevision: this.revision
            }
        }));

        // Broadcast naar alle andere clients
        this.broadcast({
            type: 'changes',
            payload: result.normalized,
            revision: this.revision,
            sender: clientId
        }, clientId); // Exclude sender
    }
    else {
        // Conflict detected
        senderWs.send(JSON.stringify({
            type: 'conflict',
            payload: {
                clientRevision,
                conflicts: result.conflicts,
                currentState: this.getConflictingRecords(result.conflicts)
            }
        }));
    }
}

broadcast(message, excludeClientId = null) {
    const data = JSON.stringify(message);

    this.clients.forEach((ws, clientId) => {
        if (clientId !== excludeClientId && ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    });
}
```

---

## 4. Conflict Resolution

### 4.1 Conflict Detection

```javascript
applyChangeset(changeset) {
    const conflicts = [];

    // Check task updates
    for (const taskUpdate of changeset.tasks.updated) {
        const currentTask = this.findTask(taskUpdate.id);

        if (!currentTask) {
            conflicts.push({
                type: 'task_not_found',
                id: taskUpdate.id
            });
            continue;
        }

        // Check voor concurrent modification
        if (taskUpdate.baseRevision < currentTask.revision) {
            // Potentieel conflict - check veld-level
            const fieldConflicts = this.detectFieldConflicts(
                taskUpdate.changes,
                currentTask.pendingChanges
            );

            if (fieldConflicts.length > 0) {
                conflicts.push({
                    type: 'concurrent_edit',
                    id: taskUpdate.id,
                    fields: fieldConflicts
                });
            }
        }
    }

    if (conflicts.length > 0) {
        return { success: false, conflicts };
    }

    // Apply changes
    return { success: true, normalized: this.normalizeChangeset(changeset) };
}
```

### 4.2 Client-Side Conflict Handling

```javascript
handleConflict(conflictData) {
    const { conflicts, currentState } = conflictData;

    // UI tonen voor conflict resolution
    this.showConflictDialog(conflicts, currentState);
}

showConflictDialog(conflicts, serverState) {
    // Voor elke conflict, toon opties
    conflicts.forEach(conflict => {
        if (conflict.type === 'concurrent_edit') {
            const task = this.project.taskStore.getById(conflict.id);
            const serverTask = serverState.tasks.find(t => t.id === conflict.id);

            // Toon conflict UI
            new ConflictDialog({
                title: `Conflict: ${task.name}`,
                localChanges: task.modifications,
                serverState: serverTask,
                onResolve: (resolution) => {
                    this.resolveConflict(conflict.id, resolution);
                }
            });
        }
    });
}

resolveConflict(taskId, resolution) {
    const task = this.project.taskStore.getById(taskId);

    switch (resolution.strategy) {
        case 'keep_local':
            // Forceer lokale versie naar server
            this.forcePush(task);
            break;

        case 'accept_server':
            // Accepteer server versie
            this.suspendSync = true;
            task.set(resolution.serverState);
            this.suspendSync = false;
            break;

        case 'merge':
            // Manuele merge
            this.suspendSync = true;
            task.set(resolution.mergedState);
            this.suspendSync = false;
            this.sendChanges();
            break;
    }
}
```

---

## 5. Reconnection Handling

### 5.1 Automatic Reconnect

```javascript
class WebSocketManager {

    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.showOfflineMode();
            return;
        }

        this.reconnectAttempts++;

        const delay = Math.min(
            this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
            this.maxReconnectDelay
        );

        console.log(`Reconnecting in ${delay}ms...`);

        setTimeout(() => {
            this.socket = new WebSocket(this.url);
            this.setupSocketListeners();
        }, delay);
    }

    onReconnected() {
        this.reconnectAttempts = 0;

        // Request delta sync
        this.socket.send(JSON.stringify({
            type: 'request_delta',
            payload: {
                lastRevision: this.serverRevision
            }
        }));
    }
}
```

### 5.2 Offline Queue

```javascript
class OfflineQueue {
    constructor() {
        this.queue = [];
        this.isOnline = navigator.onLine;

        window.addEventListener('online', () => this.onOnline());
        window.addEventListener('offline', () => this.onOffline());
    }

    enqueue(changeset) {
        this.queue.push({
            changeset,
            timestamp: Date.now()
        });

        // Persist naar localStorage
        this.persist();
    }

    onOnline() {
        this.isOnline = true;
        this.flush();
    }

    async flush() {
        while (this.queue.length > 0) {
            const item = this.queue.shift();

            try {
                await this.send(item.changeset);
            }
            catch (error) {
                // Put back en stop
                this.queue.unshift(item);
                break;
            }
        }

        this.persist();
    }

    persist() {
        localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
    }
}
```

---

## 6. Optimistic Updates

### 6.1 Immediate UI Feedback

```javascript
class OptimisticUpdateManager {

    applyOptimistic(changeset) {
        // Apply changes lokaal direct
        this.suspendSync = true;

        const appliedChanges = [];

        for (const taskUpdate of changeset.tasks.updated) {
            const task = this.project.taskStore.getById(taskUpdate.id);

            // Bewaar originele state voor rollback
            appliedChanges.push({
                id: taskUpdate.id,
                original: task.data
            });

            // Apply update
            task.set(taskUpdate.changes);
        }

        this.suspendSync = false;

        // Return rollback function
        return () => this.rollback(appliedChanges);
    }

    rollback(appliedChanges) {
        this.suspendSync = true;

        for (const change of appliedChanges) {
            const task = this.project.taskStore.getById(change.id);
            task.set(change.original);
        }

        this.suspendSync = false;
    }
}
```

### 6.2 Confirmation Handling

```javascript
async sendWithOptimistic(changeset) {
    // Apply lokaal direct
    const rollback = this.applyOptimistic(changeset);

    try {
        // Stuur naar server
        const ack = await this.sendAndWaitAck(changeset);

        // Success - update lokale revision
        this.serverRevision = ack.serverRevision;
    }
    catch (error) {
        if (error.type === 'conflict') {
            // Rollback en toon conflict UI
            rollback();
            this.handleConflict(error.conflictData);
        }
        else {
            // Network error - queue voor later
            rollback();
            this.offlineQueue.enqueue(changeset);
        }
    }
}
```

---

## 7. Presence & Cursors

### 7.1 User Presence

```javascript
class PresenceManager {

    constructor(wsManager) {
        this.wsManager = wsManager;
        this.activeUsers = new Map();

        // Stuur heartbeat
        setInterval(() => this.sendHeartbeat(), 30000);
    }

    sendHeartbeat() {
        this.wsManager.send({
            type: 'heartbeat',
            payload: {
                clientId: this.clientId,
                activeTask: this.currentSelection?.id
            }
        });
    }

    handlePresenceUpdate(users) {
        this.activeUsers = new Map(
            users.map(u => [u.clientId, u])
        );

        this.updateUI();
    }

    updateUI() {
        // Toon actieve users in header
        const userList = [...this.activeUsers.values()];

        this.gantt.widgetMap.userPresence.items = userList.map(user => ({
            html: `<img src="${user.avatar}" title="${user.name}"/>`
        }));
    }
}
```

### 7.2 Selection Highlighting

```javascript
// Toon waar andere users werken
handleSelectionUpdate({ clientId, taskId, userName }) {
    // Verwijder oude highlight
    const oldHighlight = this.gantt.element.querySelector(
        `.remote-selection[data-client="${clientId}"]`
    );
    oldHighlight?.remove();

    if (taskId) {
        const taskEl = this.gantt.getRowFor(taskId)?.element;

        if (taskEl) {
            const highlight = document.createElement('div');
            highlight.className = 'remote-selection';
            highlight.dataset.client = clientId;
            highlight.style.borderColor = this.getColorForUser(clientId);
            highlight.title = `${userName} is editing`;
            taskEl.appendChild(highlight);
        }
    }
}
```

---

## 8. Complete Integration

### 8.1 Full Setup

```javascript
import { Gantt, ProjectModel, Base } from '@bryntum/gantt';

// WebSocket Manager met alle features
class GanttWebSocketManager extends Base.mixin(ProjectModel.ProjectWebSocketHandlerMixin) {

    static configurable = {
        project: null,
        wsUrl: 'wss://api.example.com/gantt-sync',
        clientId: null,
        userName: 'Anonymous'
    };

    construct(config) {
        super.construct(config);

        this.clientId = this.clientId || crypto.randomUUID();
        this.serverRevision = 0;
        this.pendingChanges = [];
        this.unackedChanges = [];

        this.offlineQueue = new OfflineQueue();
        this.presence = new PresenceManager(this);

        this.connect();
        this.setupProjectListeners();
    }

    // ... alle methods van boven
}

// Gantt met realtime
const project = new ProjectModel({
    loadUrl: '/api/project/123'
});

const wsManager = new GanttWebSocketManager({
    project,
    wsUrl: 'wss://api.example.com/gantt-sync?project=123',
    userName: currentUser.name
});

const gantt = new Gantt({
    appendTo: 'container',
    project,

    tbar: [
        {
            ref: 'userPresence',
            type: 'container',
            cls: 'user-avatars'
        },
        {
            type: 'widget',
            ref: 'connectionStatus',
            html: '<span class="status-dot connected"></span> Live'
        }
    ]
});

// Update connection status
wsManager.on({
    connected() {
        gantt.widgetMap.connectionStatus.html =
            '<span class="status-dot connected"></span> Live';
    },
    disconnected() {
        gantt.widgetMap.connectionStatus.html =
            '<span class="status-dot disconnected"></span> Offline';
    }
});
```

---

## 9. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useEffect, useRef, useState } from 'react';

function RealtimeGantt({ projectId, currentUser }) {
    const ganttRef = useRef();
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [activeUsers, setActiveUsers] = useState([]);

    useEffect(() => {
        const project = ganttRef.current.instance.project;

        const wsManager = new GanttWebSocketManager({
            project,
            wsUrl: `wss://api.example.com/gantt-sync?project=${projectId}`,
            userName: currentUser.name
        });

        wsManager.on({
            connected: () => setConnectionStatus('connected'),
            disconnected: () => setConnectionStatus('disconnected'),
            presenceUpdate: ({ users }) => setActiveUsers(users)
        });

        return () => {
            wsManager.destroy();
        };
    }, [projectId, currentUser]);

    return (
        <div className="realtime-gantt">
            <div className="header">
                <div className={`status ${connectionStatus}`}>
                    {connectionStatus === 'connected' ? 'Live' : 'Offline'}
                </div>
                <div className="active-users">
                    {activeUsers.map(user => (
                        <img
                            key={user.clientId}
                            src={user.avatar}
                            title={user.name}
                        />
                    ))}
                </div>
            </div>

            <BryntumGantt
                ref={ganttRef}
                projectConfig={{
                    loadUrl: `/api/project/${projectId}`
                }}
            />
        </div>
    );
}
```

---

## 10. Styling

```css
/* Connection status */
.status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.5em;
}

.status-dot.connected {
    background: #4caf50;
    box-shadow: 0 0 4px #4caf50;
}

.status-dot.disconnected {
    background: #f44336;
}

/* User avatars */
.user-avatars {
    display: flex;
    gap: -8px;
}

.user-avatars img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid white;
}

/* Remote user selection */
.remote-selection {
    position: absolute;
    inset: 0;
    border: 2px dashed;
    border-radius: 4px;
    pointer-events: none;
    opacity: 0.6;
}

/* Conflict dialog */
.conflict-dialog {
    .field-comparison {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1em;
    }

    .local-value {
        background: #fff3e0;
    }

    .server-value {
        background: #e3f2fd;
    }
}
```

---

## 11. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Changes niet synced | suspendSync actief | Check suspendSync state |
| Duplicate updates | Geen sender check | Filter op clientId |
| Out of sync | Gemiste revisions | Force full sync |
| Memory leak | Event listeners | Cleanup bij destroy |
| Reconnect loop | Server down | Implement max attempts |

---

## 12. Performance Tips

### 12.1 Change Batching

```javascript
// Batch meerdere changes samen
scheduleSend() {
    clearTimeout(this.sendTimer);

    this.sendTimer = setTimeout(() => {
        // Coalesce changes
        const coalesced = this.coalesceChanges(this.pendingChanges);
        this.sendChanges(coalesced);
    }, 150); // Iets langere debounce
}

coalesceChanges(changes) {
    // Combineer meerdere updates voor dezelfde record
    const byRecord = new Map();

    for (const change of changes) {
        const key = `${change.type}-${change.id}`;

        if (byRecord.has(key)) {
            // Merge changes
            Object.assign(byRecord.get(key).changes, change.changes);
        }
        else {
            byRecord.set(key, { ...change });
        }
    }

    return [...byRecord.values()];
}
```

---

## Bronnen

- **Example**: `examples/realtime-updates/`
- **Mixin**: `ProjectModel.ProjectWebSocketHandlerMixin`
- **ProjectModel API**: `Gantt.model.ProjectModel`

---

*Track A: Foundation - Gantt Extensions (A2.1)*
