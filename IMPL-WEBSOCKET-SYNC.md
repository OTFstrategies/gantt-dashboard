# IMPL-WEBSOCKET-SYNC.md
## Real-Time WebSocket Synchronization

**Purpose**: Implement real-time multi-user synchronization using WebSocket connections with revision-based conflict resolution.

**Products**: Gantt, SchedulerPro (realtime-updates example)

---

## Overview

WebSocket synchronization enables multiple users to collaborate on the same project in real-time. Changes made by one user are immediately broadcast to all connected clients, with automatic conflict resolution through revision tracking.

---

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌──────────────────────────────────┐   │
│  │  Gantt/Scheduler │◄──►│  WebSocketProjectModel           │   │
│  │  Component       │    │  (ProjectWebSocketHandlerMixin)  │   │
│  └─────────────────┘    └──────────────┬───────────────────┘   │
│                                         │                        │
│                          ┌──────────────▼───────────────────┐   │
│                          │  WebSocketManager                 │   │
│                          │  - Connection management          │   │
│                          │  - Message serialization          │   │
│                          │  - Event dispatching              │   │
│                          └──────────────┬───────────────────┘   │
└──────────────────────────────────────────┼──────────────────────┘
                                           │ WebSocket
                    ┌──────────────────────▼──────────────────────┐
                    │            WebSocket Server                  │
                    │  - Session management                        │
                    │  - Revision tracking                         │
                    │  - Change broadcasting                       │
                    │  - Conflict resolution                       │
                    └──────────────────────────────────────────────┘
```

---

## WebSocketManager Class

The `WebSocketManager` handles low-level WebSocket communication:

```javascript
import { Events, Base } from '@bryntum/gantt';

class WebSocketManager extends Events(Base) {
    // Use native WebSocket, allow override for testing
    static webSocketImplementation = typeof WebSocket === 'undefined' ? null : WebSocket;

    static configurable = {
        // WebSocket server address
        address: '',

        // Username for client identification
        userName: 'User',

        // Auto-connect on instantiation
        autoConnect: true
    };

    construct(config = {}) {
        super.construct(config);

        // Bind event handlers
        this.onWsOpen = this.onWsOpen.bind(this);
        this.onWsClose = this.onWsClose.bind(this);
        this.onWsMessage = this.onWsMessage.bind(this);
        this.onWsError = this.onWsError.bind(this);

        if (this.autoConnect && this.address) {
            this.open();
        }
    }

    // Connection state getters
    get isConnecting() {
        return this.connector?.readyState === WebSocket.CONNECTING;
    }

    get isOpened() {
        return this.connector?.readyState === WebSocket.OPEN;
    }

    get isClosing() {
        return this.connector?.readyState === WebSocket.CLOSING;
    }

    get isClosed() {
        return this.connector?.readyState === WebSocket.CLOSED;
    }

    // Create WebSocket connection
    createWebSocketConnector() {
        const connector = this.connector = new this.constructor.webSocketImplementation(this.address);
        this.attachSocketListeners(connector);
    }

    // Attach event listeners
    attachSocketListeners(connector) {
        connector.addEventListener('open', this.onWsOpen);
        connector.addEventListener('close', this.onWsClose);
        connector.addEventListener('message', this.onWsMessage);
        connector.addEventListener('error', this.onWsError);
    }

    // Detach event listeners
    detachSocketListeners(connector) {
        connector.removeEventListener('open', this.onWsOpen);
        connector.removeEventListener('close', this.onWsClose);
        connector.removeEventListener('message', this.onWsMessage);
        connector.removeEventListener('error', this.onWsError);
    }

    // Open connection with promise
    async open() {
        if (this._openPromise) {
            return this._openPromise;
        }

        if (!this.address) {
            console.warn('Server address cannot be empty');
            return;
        }

        if (this.isOpened) {
            return true;
        }

        this.createWebSocketConnector();

        let detacher;

        this._openPromise = new Promise(resolve => {
            detacher = this.ion({
                open() { resolve(true); },
                error() { resolve(false); }
            });
        }).then(value => {
            detacher();
            this._openPromise = null;

            if (!value) {
                this.destroyWebSocketConnector();
            }
            return value;
        });

        return this._openPromise;
    }

    // Close connection
    close() {
        if (this.connector) {
            this.destroyWebSocketConnector();
            this.trigger('close');
        }
    }

    // Send JSON message
    send(command, data = {}) {
        this.connector?.send(JSON.stringify({ command, data }));
    }

    // Event handlers
    onWsOpen(event) {
        this.trigger('open', { event });
    }

    onWsClose(event) {
        this.trigger('close', { event });
    }

    onWsMessage(message) {
        try {
            const data = JSON.parse(message.data);
            this.trigger('message', { data });
        }
        catch (error) {
            this.trigger('error', { error });
        }
    }

    onWsError(error) {
        this.trigger('error', { error });
    }
}
```

---

## ProjectWebSocketHandlerMixin

This mixin extends the project model with WebSocket synchronization capabilities:

```javascript
import { Base } from '@bryntum/gantt';

const ProjectWebSocketHandlerMixin = Target => class extends (Target || Base) {
    messages = [];

    static configurable = {
        // WebSocket server address
        wsAddress: null,

        // Username for the connection
        wsUserName: '',

        // Auto-load dataset when connected
        wsAutoLoad: true,

        // Connection timeout (ms)
        wsConnectionTimeout: 60000,

        // Project ID for load/sync requests
        wsProjectId: null
    };

    doDestroy() {
        this.websocketManager?.destroy();
        super.doDestroy();
    }

    // Initialize WebSocket when address changes
    updateWsAddress(address) {
        this.websocketManager?.destroy();
        this.detachListeners('websocket-listeners');

        if (address) {
            this.websocketManager = new WebSocketManager({
                address,
                userName: this.wsUserName,
                internalListeners: {
                    message: 'handleWebsocketMessage',
                    close: 'handleWebsocketClose',
                    error: 'handleWebsocketError',
                    thisObj: this
                }
            });

            if (this.wsAutoLoad) {
                this.wsLoad().then();
            }

            this.ion({
                name: 'websocket-listeners',
                revisionNotification: 'handleRevisionNotification'
            });
        }
    }

    // Auto-load when project ID changes
    updateWsProjectId(value) {
        if (value != null && this.wsAutoLoad) {
            this.wsLoad().then();
        }
    }

    // Send message over WebSocket
    async wsSend(command, data, silent = false) {
        if (await this.wsOpen()) {
            if (command === 'project_change') {
                data.client = this.clientId;
            }

            this.websocketManager.send(command, data);

            if (!silent) {
                this.trigger('wsSendMessage', { command, data });
            }
            return true;
        }
        return false;
    }

    // Handle incoming messages
    async handleWebsocketMessage({ data }) {
        const { wsProjectId } = this;
        const { command, data: payload } = data;

        this.trigger('wsMessage', { data });

        if (command === 'error' || 'error' in data) {
            Toast.show(data.error || data.message);
            return;
        }

        const project = payload.project;

        // Handle project changes (revisions from other clients)
        if (project === wsProjectId && command === 'project_change') {
            this.trigger('wsBeforeReceiveChanges');

            await this.applyRevisions(payload.revisions.map(r => ({
                revisionId: r.revision,
                localRevisionId: r.localRevision,
                conflictResolutionFor: r.conflictResolutionFor,
                clientId: r.client,
                changes: r.changes
            })));

            this.trigger('wsReceiveChanges');
        }
        // Handle dataset load
        else if (project === wsProjectId && command === 'dataset') {
            await this.queue(async () => {
                this.stm.disable();
                this.stm.resetQueue();

                await this.loadInlineData(payload.dataset);

                this.stm.enable();
                this.initRevisions(this.clientId, 'base');
            });

            this.trigger('wsReceiveDataset');
        }
    }

    // Open WebSocket connection
    async wsOpen() {
        const { websocketManager } = this;

        if (websocketManager) {
            const trigger = !websocketManager.isOpened && await websocketManager.open();

            if (trigger) {
                this.trigger('wsOpen');
            }
            return websocketManager.isOpened;
        }
        return false;
    }

    // Load project data
    async wsLoad() {
        if (this.wsProjectId == null) {
            return;
        }

        // Request dataset
        await this.wsSend('dataset', { project: this.wsProjectId });

        // Wait for response
        await new Promise(resolve => {
            const detacher = this.ion({
                wsReceiveDataset() {
                    detacher();
                    resolve(true);
                },
                expires: {
                    delay: this.wsConnectionTimeout,
                    alt: () => {
                        detacher();
                        resolve(false);
                    }
                }
            });
        });

        await this.commitAsync();
        this.trigger('wsLoad');
    }

    // Handle local revision notification
    async handleRevisionNotification({ localRevisionId, conflictResolutionFor, clientId, changes }) {
        if (this.wsProjectId == null) {
            return;
        }

        const revision = { revision: localRevisionId, clientId, changes };

        if (conflictResolutionFor) {
            revision.conflictResolutionFor = conflictResolutionFor;
        }

        // Queue if auto-sync is suspended
        if (this.isAutoSyncSuspended) {
            this._queuedRevisions = (this._queuedRevisions || []);
            this._queuedRevisions.push(revision);
            this.trigger('revisionQueued', { length: this._queuedRevisions.length });
        }
        else {
            const revisions = [];

            if (this._queuedRevisions?.length) {
                revisions.push(...this._queuedRevisions);
                delete this._queuedRevisions;
            }

            revisions.push(revision);
            await this.sendRevisions(revisions);
        }
    }

    // Send revisions to server
    async sendRevisions(revisions) {
        const trigger = await this.wsSend('project_change', {
            project: this.wsProjectId,
            revisions
        });

        if (trigger) {
            this.trigger('wsSendChanges');
        }
    }

    // Close WebSocket connection
    wsClose() {
        this.websocketManager?.close();
    }

    // Resume auto-sync and flush queued revisions
    resumeAutoSync() {
        super.resumeAutoSync();

        if (!this.isAutoSyncSuspended && this._queuedRevisions?.length) {
            const revisions = this._queuedRevisions;
            delete this._queuedRevisions;

            this.sendRevisions(revisions).then();
            this.trigger('revisionQueueClear');
        }
    }
};
```

---

## WebSocket Project Model

Combine the mixin with ProjectModel:

```javascript
import { ProjectModel } from '@bryntum/gantt';

class WebSocketProjectModel extends ProjectWebSocketHandlerMixin(ProjectModel) {
    static $name = 'WebSocketProjectModel';
}
```

---

## Complete Integration Example

### Project Setup with STM Revisions

```javascript
import { Gantt, TaskModel, ProjectModel } from '@bryntum/gantt';

// Custom Task model with date formats
class Task extends TaskModel {
    static fields = [
        { name: 'startDate', format: 'YYYY-MM-DDTHH:mm:ss' },
        { name: 'endDate', format: 'YYYY-MM-DDTHH:mm:ss' },
        { name: 'constraintDate', format: 'YYYY-MM-DDTHH:mm:ss' },
        { name: 'parentIndex', persist: true },
        { name: 'orderedParentIndex', persist: true }
    ];
}

// WebSocket-enabled project
class WebSocketProjectModel extends ProjectWebSocketHandlerMixin(ProjectModel) {
    static $name = 'WebSocketProjectModel';
}

function createProject(id) {
    return new WebSocketProjectModel({
        id,
        autoSetConstraints: true,
        wsAutoLoad: true,
        taskModelClass: Task,
        taskStore: {
            sorters: [
                { field: 'wbsValue', ascending: true }
            ],
            useOrderedTreeForWbs: true
        },
        // Enable STM with revisions
        stm: {
            revisionsEnabled: true
        }
    });
}
```

### Gantt with WebSocket UI

```javascript
const project = createProject('gantt1');

const gantt = new Gantt({
    appendTo: 'container',
    project,

    // Enable transactional features for revision tracking
    enableTransactionalFeatures: true,

    columns: [
        { type: 'wbs' },
        { type: 'name', width: 250 }
    ],

    features: {
        taskCopyPaste: true,
        // Event segments not yet supported with revisions
        eventSegments: false
    },

    tbar: {
        items: {
            undoRedo: {
                type: 'undoredo',
                items: { transactionsCombo: null }
            },
            loginWidget: {
                type: 'loginwidget',
                host: 'wss://your-server:8080',
                project,
                listeners: {
                    login() {
                        gantt.tbar.widgetMap.undoRedo.hidden = false;
                        gantt.tbar.widgetMap.reset.hidden = false;
                        gantt.tbar.widgetMap.autoSync.hidden = false;
                    },
                    logout() {
                        gantt.tbar.widgetMap.undoRedo.hidden = true;
                        gantt.tbar.widgetMap.reset.hidden = true;
                        gantt.tbar.widgetMap.autoSync.hidden = true;
                    }
                }
            },
            reset: {
                type: 'button',
                text: 'Reset',
                hidden: true,
                onClick() {
                    if (project.wsProjectId) {
                        project.wsSend('reset', { project: project.wsProjectId });
                    }
                }
            },
            autoSync: {
                type: 'slidetoggle',
                text: 'Auto-sync',
                hidden: true,
                value: true,
                onChange({ checked }) {
                    project[checked ? 'resumeAutoSync' : 'suspendAutoSync']();
                    gantt.tbar.widgetMap.triggerSync.hidden = checked;
                }
            },
            triggerSync: {
                type: 'button',
                text: 'Sync',
                hidden: true,
                onClick() {
                    // Manual sync: resume and immediately suspend
                    project.resumeAutoSync();
                    project.suspendAutoSync();
                }
            }
        }
    },

    bbar: {
        items: {
            usersContainer: {
                type: 'userscontainer',
                project
            }
        }
    }
});

// Listen for dataset load
project.on({
    wsReceiveDataset() {
        gantt.widgetMap.reset.hidden = false;
    },
    revisionQueued({ length }) {
        gantt.tbar.widgetMap.triggerSync.badge = length;
    },
    revisionQueueClear() {
        gantt.tbar.widgetMap.triggerSync.badge = null;
    }
});
```

---

## Login Widget Implementation

Track login state and manage authentication:

```javascript
import { Container, Toast, DataGenerator, StringHelper } from '@bryntum/gantt';

const ProjectWebSocketSubscriberMixin = Target => class extends Target {
    static configurable = {
        loggedIn: false,
        project: null
    };

    updateProject(project) {
        this.detachListeners('projectListeners');

        project.on({
            name: 'projectListeners',
            wsMessage: this.handleWebSocketMessage,
            wsClose: this.handleWebSocketClose,
            thisObj: this
        });
    }

    handleWebSocketMessage({ data }) {
        const { command, error } = data;

        if (command === 'login' && !this.loggedIn && !error) {
            this.handleLogin();
        }
        else if (command === 'logout' && !data.data.userName && this.loggedIn) {
            this.handleLogout();
        }
    }

    handleLogin() {
        this.loggedIn = true;
        this.trigger('login');
    }

    handleLogout() {
        this.loggedIn = false;
        this.trigger('logout');
    }
};

class LoginWidget extends ProjectWebSocketSubscriberMixin(Container) {
    static type = 'loginwidget';

    static configurable = {
        host: '',
        layout: 'hbox',
        items: {
            loginLabel: { type: 'widget', hidden: true },
            userName: {
                type: 'textfield',
                label: 'Username',
                flex: 1,
                minWidth: '20em'
            },
            serverAddress: {
                type: 'textfield',
                label: 'Server address',
                flex: 1,
                minWidth: '25em'
            },
            loginButton: {
                type: 'button',
                text: 'Login',
                onClick: 'up.login'
            },
            logoutButton: {
                type: 'button',
                text: 'Logout',
                hidden: true,
                onClick: 'up.logout'
            }
        }
    };

    updateHost(value) {
        this.widgetMap.serverAddress.value = value;
        this.widgetMap.userName.value = DataGenerator.generateName();
    }

    updateLoggedIn(value) {
        const { loginLabel, loginButton, logoutButton, userName, serverAddress } = this.widgetMap;

        [userName, serverAddress, loginButton].forEach(cmp => cmp.hidden = value);
        [loginLabel, logoutButton].forEach(cmp => cmp.hidden = !value);

        loginLabel.html = StringHelper.xss`${value ? `Logged in as ${userName.value}` : ''}`;
    }

    async login() {
        const { serverAddress, userName } = this.values;

        this.project.wsAddress = serverAddress;

        await this.project.wsSend('login', { login: userName, password: '' });
        await this.project.wsSend('projects');
        this.project.wsProjectId = 1;
    }

    logout() {
        this.project.wsSend('logout');
        this.project.wsProjectId = null;
    }
}

LoginWidget.initClass();
```

---

## Online Users Display

Show connected users in real-time:

```javascript
class UsersContainer extends ProjectWebSocketSubscriberMixin(Container) {
    static type = 'userscontainer';

    static configurable = {
        layout: 'hbox',
        users: []
    };

    updateUsers(users, previousUsers) {
        const newUsers = users.filter(user =>
            previousUsers ? !previousUsers.includes(user) : true
        );
        const goneUsers = previousUsers ?
            previousUsers.filter(user => !users.includes(user)) : [];

        if (newUsers.length) {
            Toast.show(`${newUsers.join()} just connected`);
        }
        if (goneUsers.length) {
            Toast.show(`${goneUsers.join()} just disconnected`);
        }
    }

    handleWebSocketMessage({ data }) {
        if (data.command === 'users') {
            this.removeAll();
            this.users = data.data.users;

            for (const user of data.data.users) {
                if (!user) continue;

                const name = user.split(' ')[0];
                const imageUrl = DataGenerator.namesWithAvatars.includes(name)
                    ? `images/users/${name.toLowerCase()}.png`
                    : 'images/users/default.png';

                this.add({
                    type: 'widget',
                    cls: 'ws-online-user',
                    html: StringHelper.xss`
                        <img class="b-resource-avatar" src="${imageUrl}">
                        <label>${name}</label>
                    `
                });
            }
        }
    }

    handleWebSocketClose() {
        this.removeAll();
    }
}

UsersContainer.initClass();
```

---

## WebSocket Helper

Manage connection state and UI feedback:

```javascript
class WebSocketHelper {
    constructor(client, host) {
        this.client = client;
        this.project = client.project;
        this.setConnectedState(false);
    }

    set project(project) {
        this._project = project;

        project.on({
            wsError: () => this.client.maskBody('Error connecting to server'),
            wsMessage: ({ data }) => this.wsReceive(data),
            wsOpen: () => this.setConnectedState(true),
            wsClose: () => this.setConnectedState(false)
        });
    }

    get project() {
        return this._project;
    }

    wsReceive(data) {
        const userName = data?.data?.userName;

        switch (data.command) {
            case 'login':
                if (data.error) {
                    Toast.show(`Error: ${data.error}`);
                }
                break;
            case 'reset':
                Toast.show(`${userName} reset the data`);
                break;
            case 'error':
                Toast.show(data.error);
                break;
        }
    }

    setConnectedState(connected) {
        if (connected) {
            this.client.unmask();
        }
        else {
            this.client.maskBody('<div style="text-align: center">OFFLINE</div>');
        }
    }
}
```

---

## WebSocket Events

### Project Events

| Event | Description |
|-------|-------------|
| `wsOpen` | WebSocket connection opened |
| `wsClose` | WebSocket connection closed |
| `wsError` | Connection or message error |
| `wsMessage` | Message received from server |
| `wsSendMessage` | Message sent to server |
| `wsLoad` | Dataset loaded from server |
| `wsReceiveDataset` | Dataset received and applied |
| `wsBeforeReceiveChanges` | Before applying remote changes |
| `wsReceiveChanges` | After applying remote changes |
| `wsSendChanges` | Changes sent to server |
| `revisionQueued` | Revision queued (auto-sync suspended) |
| `revisionQueueClear` | Queued revisions sent |

---

## Message Protocol

### Commands

```javascript
// Login
{ command: 'login', data: { login: 'username', password: '' } }

// Request project list
{ command: 'projects', data: {} }

// Request dataset
{ command: 'dataset', data: { project: 1 } }

// Send changes
{
    command: 'project_change',
    data: {
        project: 1,
        client: 'client-uuid',
        revisions: [
            {
                revision: 5,
                clientId: 'client-uuid',
                changes: { /* STM changes */ },
                conflictResolutionFor: null
            }
        ]
    }
}

// Logout
{ command: 'logout', data: {} }

// Reset project
{ command: 'reset', data: { project: 1 } }
```

---

## Conflict Resolution

The revision system handles concurrent edits:

```javascript
// Revision structure
{
    revisionId: 5,              // Server revision ID
    localRevisionId: 3,         // Client's local revision
    conflictResolutionFor: null, // Previous revision if resolving conflict
    clientId: 'abc-123',        // Originating client
    changes: {                  // STM change set
        tasks: {
            updated: [{ id: 1, name: 'Updated Task' }]
        }
    }
}
```

### Auto-Sync Control

```javascript
// Suspend auto-sync for batch operations
project.suspendAutoSync();

// Make multiple changes...
task1.name = 'New Name';
task2.startDate = new Date();

// Resume and sync all changes
project.resumeAutoSync();
```

---

## Secure Connection Setup

```javascript
// Determine protocol based on page protocol
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const host = `${protocol}://${window.location.hostname}:8080`;

// Or use dedicated secure endpoint
const secureHost = 'wss://realtime.example.com';

project.wsAddress = secureHost;
```

---

## Best Practices

1. **Enable Revisions**: Always enable `stm.revisionsEnabled: true` for conflict resolution
2. **Transactional Features**: Use `enableTransactionalFeatures: true` on the component
3. **Handle Disconnection**: Show offline state and queue changes
4. **Secure Connections**: Use WSS in production
5. **Client ID**: Ensure unique client IDs for multi-tab scenarios
6. **Timeout Handling**: Configure appropriate `wsConnectionTimeout`

---

## Dashboard Integration

```javascript
// Multiple Gantt instances sharing a server
const gantt1 = createGantt('gantt1');
const gantt2 = createGantt('gantt2');

// Both connect to same WebSocket server
// Changes in one are reflected in the other
```

---

## Related Documentation

- **IMPL-STATE-MANAGEMENT.md**: Local state persistence
- **IMPL-OFFLINE-FIRST.md**: Offline sync strategies
- **CORE-CRUD-MANAGER.md**: Data synchronization basics
