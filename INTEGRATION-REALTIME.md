# INTEGRATION-REALTIME.md

> **Realtime Synchronization Patterns** - WebSocket communicatie, State Tracking Manager (STM), Revisions, Multi-client synchronisatie en Conflict Resolution.

---

## Overzicht

Bryntum biedt uitgebreide realtime synchronisatie mogelijkheden:
- **WebSocket Integration** - Bi-directionele communicatie voor live updates
- **State Tracking Manager (STM)** - Undo/Redo met revision tracking
- **Revisions System** - Gedistribueerde change tracking
- **Conflict Resolution** - Automatische en handmatige conflict handling
- **Multi-Client Sync** - Meerdere clients synchroon houden

---

## ProjectWebSocketHandlerMixin

### Complete Mixin Implementatie

```typescript
import { Base, Events, ProjectModel } from '@bryntum/schedulerpro';

/**
 * Mixin die project WebSocket communicatie mogelijk maakt.
 * Synchroniseert changes automatisch naar andere clients.
 */
const ProjectWebSocketHandlerMixin = Target => class extends (Target || Base) {
    messages = [];

    static configurable = {
        /**
         * WebSocket server adres
         * @config {String}
         */
        wsAddress : null,

        /**
         * Username voor WebSocket connectie
         * @config {String}
         */
        wsUserName : '',

        /**
         * Automatisch dataset laden bij connectie
         * @config {Boolean}
         * @default true
         */
        wsAutoLoad : true,

        /**
         * WebSocket connectie timeout (ms)
         * @config {Number}
         * @default 60000
         */
        wsConnectionTimeout : 60000,

        /**
         * Project ID voor load/sync requests
         * @config {String|Number}
         */
        wsProjectId : null
    };

    doDestroy() {
        this.websocketManager?.destroy();
        super.doDestroy();
    }

    // Config handlers
    updateWsAddress(address) {
        const me = this;

        me.websocketManager?.destroy();
        me.detachListeners('websocket-listeners');

        if (address) {
            me.websocketManager = new WebSocketManager({
                address,
                userName          : me.wsUserName,
                internalListeners : {
                    message : 'handleWebsocketMessage',
                    close   : 'handleWebsocketClose',
                    error   : 'handleWebsocketError',
                    thisObj : me
                }
            });

            if (me.wsAutoLoad) {
                me.wsLoad().then();
            }

            me.ion({
                name                 : 'websocket-listeners',
                revisionNotification : 'handleRevisionNotification'
            });
        }
    }

    updateWsProjectId(value) {
        if (value != null && this.wsAutoLoad) {
            this.wsLoad().then();
        }
    }

    /**
     * Verstuur bericht via WebSocket
     * @param {String} command
     * @param {Object} data
     * @param {Boolean} silent - Voorkom event triggering
     * @returns {Promise<Boolean>}
     */
    async wsSend(command, data, silent = false) {
        const me = this;

        if (await me.wsOpen()) {
            if (command === 'project_change') {
                data.client = me.clientId;
            }

            if (me.LOGMESSAGES) {
                me.messages.push({ type : 'send', command, data });
            }

            me.websocketManager.send(command, data);

            if (!silent) {
                /**
                 * Fires na versturen van WebSocket bericht
                 * @event wsSendMessage
                 */
                me.trigger('wsSendMessage', { command, data });
            }
            return true;
        }

        return false;
    }

    /**
     * Template method voor custom message handling
     */
    wsReceive(data) { }

    handleWebsocketClose() {
        this.trigger('wsClose');
    }

    handleWebsocketError({ error }) {
        this.trigger('wsError', { error });
    }

    async handleWebsocketMessage({ data }) {
        const me = this;
        const { wsProjectId } = me;
        const { command, data : payload } = data;

        let project;

        if (me.LOGMESSAGES) {
            me.messages.push({ type : 'receive', ...data });
        }

        me.trigger('wsMessage', { data });

        if (command === 'error' || 'error' in data) {
            Toast.show(data.error || data.message);
            return;
        }

        if (command !== 'error') {
            project = payload.project;
        }

        // Handle project changes from other clients
        if (project === wsProjectId && command === 'project_change') {
            me.trigger('wsBeforeReceiveChanges');

            await me.applyRevisions(payload.revisions.map(r => ({
                revisionId            : r.revision,
                localRevisionId       : r.localRevision,
                conflictResolutionFor : r.conflictResolutionFor,
                clientId              : r.client,
                changes               : r.changes
            })));

            me.trigger('wsReceiveChanges');
        }
        // Handle initial dataset
        else if (project === wsProjectId && command === 'dataset') {
            await me.queue(async() => {
                me.stm.disable();
                me.stm.resetQueue();

                await me.loadInlineData(payload.dataset);

                me.stm.enable();
                me.initRevisions(me.clientId, 'base');
            });

            me.trigger('wsReceiveDataset');
        }
        // Handle version auto-save confirmation
        else if (project === wsProjectId && command === 'versionAutoSaveOK') {
            me.trigger('wsVersionAutoSaveOK');
        }
        // Handle version content loading
        else if (project === wsProjectId && command === 'loadVersionContent') {
            const { versionId, content } = payload;
            me.trigger('loadVersionContent', { versionId, project, content });
        }
        else {
            me.wsReceive(data);
        }
    }

    /**
     * Open WebSocket connectie
     */
    async wsOpen() {
        const { websocketManager } = this;

        if (websocketManager) {
            const trigger = !websocketManager.isOpened &&
                           await websocketManager.open();

            if (trigger) {
                this.trigger('wsOpen');
            }

            return websocketManager.isOpened;
        }

        return false;
    }

    /**
     * Laad data via WebSocket
     */
    async wsLoad() {
        const me = this;

        if (me.wsProjectId == null) {
            return;
        }

        // Request dataset
        await me.wsSend('dataset', { project : me.wsProjectId });

        // Wacht op wsReceiveDataset event
        await new Promise(resolve => {
            const detacher = me.ion({
                wsReceiveDataset() {
                    detacher();
                    resolve(true);
                },
                expires : {
                    delay : me.wsConnectionTimeout,
                    alt   : () => {
                        detacher();
                        resolve(false);
                    }
                }
            });
        });

        await me.commitAsync();
        me.trigger('wsLoad');
    }

    async handleRevisionNotification({ localRevisionId, conflictResolutionFor, clientId, changes }) {
        const me = this;
        const { wsProjectId } = me;

        if (wsProjectId == null) {
            return;
        }

        const revision = { revision : localRevisionId, clientId, changes };

        if (conflictResolutionFor) {
            revision.conflictResolutionFor = conflictResolutionFor;
        }

        if (me.isAutoSyncSuspended) {
            this._queuedRevisions = (this._queuedRevisions || []);
            this._queuedRevisions.push(revision);
            this.trigger('revisionQueued', { length : this._queuedRevisions.length });
        }
        else {
            const revisions = [];

            if (me._queuedRevisions?.length) {
                revisions.push(...me._queuedRevisions);
                delete me._queuedRevisions;
            }

            revisions.push(revision);
            await me.sendRevisions(revisions);
        }
    }

    async sendRevisions(revisions) {
        const me = this;
        const trigger = await me.wsSend('project_change', {
            project : me.wsProjectId,
            revisions
        });

        if (trigger) {
            me.trigger('wsSendChanges');
        }
    }

    /**
     * Sluit WebSocket connectie
     */
    wsClose() {
        this.websocketManager?.close();
    }

    resumeAutoSync() {
        const me = this;

        super.resumeAutoSync();

        if (!me.isAutoSyncSuspended && me._queuedRevisions?.length) {
            const revisions = me._queuedRevisions;
            delete me._queuedRevisions;

            me.sendRevisions(revisions).then();
            me.trigger('revisionQueueClear');
        }
    }
};
```

---

## WebSocketManager Class

### Volledige WebSocket Wrapper

```typescript
import { Base, Events } from '@bryntum/core';

/**
 * WebSocket manager voor JSON message protocol
 */
class WebSocketManager extends Events(Base) {
    static webSocketImplementation = typeof WebSocket === 'undefined' ? null : WebSocket;

    static configurable = {
        address     : '',
        userName    : 'User',
        autoConnect : true
    };

    construct(config = {}) {
        const me = this;

        super.construct(config);

        me.onWsOpen = me.onWsOpen.bind(me);
        me.onWsClose = me.onWsClose.bind(me);
        me.onWsMessage = me.onWsMessage.bind(me);
        me.onWsError = me.onWsError.bind(me);

        if (me.autoConnect && me.address) {
            me.open();
        }
    }

    doDestroy() {
        const me = this;

        if (me.connector) {
            me.detachSocketListeners(me.connector);
            me.connector.close();
            me.connector = null;
        }
        super.doDestroy();
    }

    // State getters
    get isConnecting() {
        return this.connector?.readyState ===
               this.constructor.webSocketImplementation.CONNECTING;
    }

    get isOpened() {
        return this.connector?.readyState ===
               this.constructor.webSocketImplementation.OPEN;
    }

    get isClosing() {
        return this.connector?.readyState ===
               this.constructor.webSocketImplementation.CLOSING;
    }

    get isClosed() {
        return this.connector?.readyState ===
               this.constructor.webSocketImplementation.CLOSED;
    }

    // WebSocket lifecycle
    createWebSocketConnector() {
        const connector = this.connector =
            new this.constructor.webSocketImplementation(this.address);
        this.attachSocketListeners(connector);
    }

    destroyWebSocketConnector() {
        this.detachSocketListeners(this.connector);
        this.connector.close();
        this.connector = null;
    }

    attachSocketListeners(connector) {
        const me = this;
        connector.addEventListener('open', me.onWsOpen);
        connector.addEventListener('close', me.onWsClose);
        connector.addEventListener('message', me.onWsMessage);
        connector.addEventListener('error', me.onWsError);
    }

    detachSocketListeners(connector) {
        const me = this;
        connector.removeEventListener('open', me.onWsOpen);
        connector.removeEventListener('close', me.onWsClose);
        connector.removeEventListener('message', me.onWsMessage);
        connector.removeEventListener('error', me.onWsError);
    }

    /**
     * Open WebSocket connectie
     * @returns {Promise<Boolean>}
     */
    async open() {
        const me = this;

        if (me._openPromise) {
            return me._openPromise;
        }

        if (!me.address) {
            console.warn('Server address cannot be empty');
            return;
        }

        if (me.isOpened) {
            return true;
        }

        me.createWebSocketConnector();

        let detacher;

        me._openPromise = new Promise(resolve => {
            detacher = me.ion({
                open() { resolve(true); },
                error() { resolve(false); }
            });
        }).then(value => {
            detacher();
            me._openPromise = null;

            if (!value) {
                me.destroyWebSocketConnector();
            }

            return value;
        }).catch(() => {
            me._openPromise = null;
            me.destroyWebSocketConnector();
        });

        return me._openPromise;
    }

    /**
     * Sluit WebSocket connectie
     */
    close() {
        if (this.connector) {
            this.destroyWebSocketConnector();
            this.trigger('close');
        }
    }

    /**
     * Verstuur data naar server
     */
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

## WebSocket Project Model

### Extended ProjectModel met WebSocket

```typescript
class WebSocketProjectModel extends ProjectWebSocketHandlerMixin(ProjectModel) {
    static $name = 'WebsocketProjectModel';
}

// Usage
const project = new WebSocketProjectModel({
    autoSetConstraints   : true,
    wsAutoLoad           : true,
    eventModelClass      : MyEventModel,
    assignmentModelClass : MyAssignmentModel,

    // STM met revisions
    stm : {
        revisionsEnabled : true
    }
});

// Connect to WebSocket server
project.wsAddress = 'wss://myserver.com:8080';
await project.wsSend('login', { login : 'user@example.com' });
project.wsProjectId = 1;
```

---

## State Tracking Manager (STM)

### Undo/Redo Configuratie

```typescript
const project = new ProjectModel({
    stm : {
        // Enable STM
        disabled : false,

        // Auto-record changes
        autoRecord : true,

        // Enable revisions voor multi-client sync
        revisionsEnabled : true,

        // Custom transaction titles
        getTransactionTitle(transaction) {
            const lastAction = transaction.queue[transaction.queue.length - 1];
            let { type, model, newData } = lastAction;

            if (lastAction.modelList?.length) {
                model = lastAction.modelList[0];
            }

            let title = 'Transaction ' + this.position;

            if (model.isEventModel) {
                switch (type) {
                    case 'UpdateAction':
                        if (newData.status) {
                            title = `Set task ${model.name} status to ${newData.status}`;
                        }
                        else if (newData.name) {
                            title = `Rename task to ${newData.name}`;
                        }
                        else {
                            title = `Edit task ${model.name}`;
                        }
                        break;
                    case 'RemoveAction':
                        title = `Remove task ${model.name}`;
                        break;
                    case 'AddAction':
                        title = `Add task ${model.name}`;
                        break;
                }
            }
            else if (model.isAssignmentModel) {
                if (type === 'RemoveAction') {
                    title = `Unassigned ${model.resource.name} from ${model.event.name}`;
                }
                else if (type === 'UpdateAction') {
                    title = `Assigned ${model.resource.name} to ${model.event.name}`;
                }
            }

            return title;
        }
    }
});
```

### STM Events

```typescript
project.stm.on({
    // Recording started
    recordingStart({ stm }) {
        console.log('Recording started');
    },

    // Recording stopped
    recordingStop({ stm, transaction }) {
        console.log('Recording stopped, transaction:', transaction);
    },

    // Undo/Redo in progress
    restoringStart({ stm }) {
        console.log('Restoring started');
    },

    restoringStop({ stm }) {
        console.log('Restoring stopped');
    },

    // Queue reset
    queueReset({ stm }) {
        console.log('Transaction queue reset');
    },

    // STM disabled
    disabled({ stm }) {
        console.log('STM disabled');
    }
});
```

### Programmatische STM Control

```typescript
// Start recording explicitly
project.stm.startTransaction('My Custom Transaction');

// Make changes
taskRecord.name = 'Updated Name';
taskRecord.duration = 5;

// Stop recording
project.stm.stopTransaction();

// Undo last transaction
project.stm.undo();

// Redo
project.stm.redo();

// Check state
console.log('Can undo:', project.stm.canUndo);
console.log('Can redo:', project.stm.canRedo);
console.log('Position:', project.stm.position);
console.log('Length:', project.stm.length);

// Reset undo history
project.stm.resetQueue();

// Disable temporarily
project.stm.disable();
// ... make changes without recording
project.stm.enable();
```

---

## Revisions System

### Revision Tracking

```typescript
// Enable revisions
const project = new ProjectModel({
    stm : {
        revisionsEnabled : true
    }
});

// Initialize revisions after data load
project.on('load', () => {
    project.initRevisions(clientId, 'base');
});

// Listen for revision notifications
project.on('revisionNotification', ({
    localRevisionId,
    conflictResolutionFor,
    clientId,
    changes
}) => {
    console.log('Revision:', localRevisionId);
    console.log('Changes:', changes);
});

// Apply revisions from other clients
await project.applyRevisions([{
    revisionId            : 'rev-123',
    localRevisionId       : 'local-456',
    conflictResolutionFor : null,
    clientId              : 'client-789',
    changes               : {
        tasks : {
            updated : [{ id : 1, name : 'Updated Task' }]
        }
    }
}]);
```

---

## Login Widget Pattern

### User Authentication UI

```typescript
import { Container, StringHelper, DataGenerator } from '@bryntum/core';

class LoginWidget extends ProjectWebSocketSubscriberMixin(Container) {
    static $name = 'LoginWidget';
    static type = 'loginwidget';

    static configurable = {
        host   : '',
        layout : 'hbox',

        layoutStyle : {
            flexFlow   : 'row',
            alignItems : 'center'
        },

        items : {
            loginLabel : {
                type   : 'widget',
                hidden : true
            },
            userName : {
                type     : 'textfield',
                label    : 'Username',
                flex     : 1,
                minWidth : '20em'
            },
            serverAddress : {
                type     : 'textfield',
                label    : 'Server address',
                flex     : 1,
                minWidth : '25em'
            },
            loginButton : {
                type    : 'button',
                text    : 'Login',
                onClick : 'up.login'
            },
            logoutButton : {
                type   : 'button',
                text   : 'Logout',
                hidden : true,
                onClick : 'up.logout'
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

    handleWebSocketMessage(event) {
        const { command, data, error } = event.data;

        super.handleWebSocketMessage(event);

        if (command === 'login') {
            if (error) {
                Toast.show(error);
            }
            else if ('client' in data) {
                this.project.clientId = data.client;
                this.loggedIn = data.userName;
            }
        }
    }

    async login() {
        const { serverAddress, userName } = this.values;

        this.project.wsAddress = serverAddress;
        this.userName = userName;

        await this.project.wsSend('login', { login : userName, password : '' });
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

## Online Users Widget

### Connected Users Display

```typescript
class UsersContainer extends ProjectWebSocketSubscriberMixin(Container) {
    static $name = 'UsersContainer';
    static type = 'userscontainer';

    static configurable = {
        layout : 'hbox',
        users  : []
    };

    updateUsers(users, previousUsers) {
        const newUsers = users.filter(user =>
            previousUsers ? !previousUsers.includes(user) : true
        );
        const goneUsers = previousUsers
            ? previousUsers.filter(user => !users.includes(user))
            : [];

        if (newUsers.length) {
            Toast.show(`${newUsers.join()} just connected`);
        }

        if (goneUsers.length) {
            Toast.show(`${goneUsers.join()} just disconnected`);
        }
    }

    handleWebSocketMessage({ data }) {
        const { command } = data;

        if (command === 'users') {
            this.removeAll();

            const { users } = data.data;
            this.users = users;

            for (const user of users) {
                if (!user) continue;

                const name = user.split(' ')[0];
                const imageUrl = DataGenerator.namesWithAvatars.includes(name)
                    ? `images/users/${name.toLowerCase()}.png`
                    : 'images/users/none.png';

                this.add({
                    type : 'widget',
                    cls  : 'ws-online-user',
                    html : StringHelper.xss`
                        <img class="b-resource-avatar" src="${imageUrl}">
                        <label>${name}</label>
                    `
                });
            }
        }
        else if (command === 'logout' && !data.userName) {
            this.removeAll();
        }
    }

    handleWebSocketClose() {
        this.removeAll();
    }
}

UsersContainer.initClass();
```

---

## Complete Realtime Demo Setup

### Full Application Structure

```typescript
import { SchedulerPro, BrowserHelper, DataGenerator } from '@bryntum/schedulerpro';

const
    protocol  = window.location.protocol === 'https' ? 'wss' : 'ws',
    host      = BrowserHelper.searchParam('wsHost',
                    `${protocol}://${window.location.hostname}:8080`),
    autoLogin = BrowserHelper.searchParam('auto');

function createProject(id) {
    return new WebSocketProjectModel({
        autoSetConstraints   : true,
        wsAutoLoad           : true,
        assignmentModelClass : Assignment,
        eventModelClass      : Event,
        eventStore           : { id : 'tasks' },
        stm                  : { revisionsEnabled : true }
    });
}

function createSchedulerPro(id) {
    const project = createProject(id);

    const schedulerPro = new SchedulerPro({
        appendTo : 'container',
        id,
        project,

        enableTransactionalFeatures : true,

        features : {
            eventSegments : false  // Not yet supported with revisions
        },

        columns : [
            { text : 'Name', field : 'name', width : 250 }
        ],

        tbar : {
            items : {
                undoRedo : {
                    type   : 'undoredo',
                    hidden : true,
                    items  : { transactionsCombo : null }
                },
                loginWidget : {
                    type      : 'loginwidget',
                    host,
                    project,
                    listeners : {
                        login() {
                            schedulerPro.tbar.widgetMap.undoRedo.hidden = false;
                            schedulerPro.tbar.widgetMap.reset.hidden = false;
                        },
                        logout() {
                            schedulerPro.tbar.widgetMap.undoRedo.hidden = true;
                            schedulerPro.tbar.widgetMap.reset.hidden = true;
                        }
                    }
                },
                reset : {
                    type   : 'button',
                    text   : 'Reset',
                    hidden : true,
                    onClick() {
                        if (schedulerPro.project.wsProjectId) {
                            schedulerPro.project.wsSend('reset', {
                                project : schedulerPro.project.wsProjectId
                            });
                        }
                    }
                },
                autoSync : {
                    type   : 'slidetoggle',
                    text   : 'Auto-sync',
                    hidden : true,
                    value  : true,
                    onChange({ checked }) {
                        schedulerPro.project[checked ? 'resumeAutoSync' : 'suspendAutoSync']();
                        schedulerPro.tbar.widgetMap.triggerSync.hidden = checked;
                    }
                },
                triggerSync : {
                    type   : 'button',
                    text   : 'Sync',
                    hidden : true,
                    onClick() {
                        schedulerPro.project.resumeAutoSync();
                        schedulerPro.project.suspendAutoSync();
                    }
                }
            }
        },

        bbar : {
            items : {
                wsPanel : {
                    type  : 'container',
                    cls   : 'ws-online',
                    items : {
                        onlineUsers : {
                            type  : 'container',
                            cls   : 'ws-online-users',
                            items : {
                                label : {
                                    type : 'widget',
                                    html : '<label>Who is online:</label>'
                                },
                                usersContainer : {
                                    type : 'userscontainer',
                                    project
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Track revision queue
    schedulerPro.project.on({
        revisionQueued({ length }) {
            schedulerPro.tbar.widgetMap.triggerSync.badge = length;
        },
        revisionQueueClear() {
            schedulerPro.tbar.widgetMap.triggerSync.badge = null;
        }
    });

    return schedulerPro;
}

// Create two instances for testing
createSchedulerPro('scheduler1');
createSchedulerPro('scheduler2');
```

---

## Conflict Resolution

### Automatische Conflict Handling

```typescript
const project = new ProjectModel({
    // Postpone calculation for manual conflict resolution
    delayCalculation : true,

    listeners : {
        conflict({ conflict }) {
            console.log('Conflict detected:', conflict);

            // Options:
            // 1. Auto-resolve
            conflict.resolve();

            // 2. Cancel the change
            // conflict.cancel();

            // 3. Show dialog
            // showConflictDialog(conflict);
        }
    }
});
```

### Conflict Resolution Dialog

```typescript
import { MessageDialog } from '@bryntum/core';

async function showConflictDialog(conflict) {
    const result = await MessageDialog.confirm({
        title   : 'Scheduling Conflict',
        message : `A scheduling conflict was detected.
                   Would you like to resolve it automatically?`,
        buttons : {
            ok     : { text : 'Resolve' },
            cancel : { text : 'Revert' }
        }
    });

    if (result === MessageDialog.okButton) {
        conflict.resolve();
    }
    else {
        conflict.cancel();
    }
}
```

---

## Best Practices

### 1. Connection Error Handling

```typescript
project.on({
    wsError({ error }) {
        Toast.show({
            html    : 'Connection lost. Reconnecting...',
            color   : 'red',
            timeout : 5000
        });

        // Retry connection
        setTimeout(() => {
            project.wsOpen().then(connected => {
                if (connected) {
                    project.wsLoad();
                }
            });
        }, 3000);
    },

    wsClose() {
        gantt.maskBody('OFFLINE');
    },

    wsOpen() {
        gantt.unmask();
    }
});
```

### 2. Optimistic Updates

```typescript
// Immediately apply changes locally
taskRecord.name = 'New Name';

// Then sync in background
project.on('wsSendChanges', () => {
    console.log('Changes synced to server');
});
```

### 3. Suspend During Bulk Operations

```typescript
// Suspend auto-sync for bulk operations
project.suspendAutoSync();

try {
    for (const task of tasksToUpdate) {
        task.duration = 5;
    }
}
finally {
    // Resume and send all changes at once
    project.resumeAutoSync();
}
```

---

## Gerelateerde Documenten

- [INTEGRATION-SHARED-PROJECT.md](./INTEGRATION-SHARED-PROJECT.md) - ProjectModel patterns
- [INTEGRATION-EXPORT.md](./INTEGRATION-EXPORT.md) - Export integration
- [INTEGRATION-FRAMEWORKS.md](./INTEGRATION-FRAMEWORKS.md) - React, Vue, Angular integratie
- [INTEGRATION-PERFORMANCE.md](./INTEGRATION-PERFORMANCE.md) - Big datasets, lazy loading
- [DEEP-DIVE-STM.md](./DEEP-DIVE-STM.md) - State Tracking Manager details

---

*Bryntum Suite 7.1.0 - Realtime Synchronization*
