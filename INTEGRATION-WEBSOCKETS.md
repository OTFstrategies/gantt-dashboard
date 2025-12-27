# Integration Guide: Bryntum Gantt + WebSockets

> **Implementatie guide** voor real-time multi-user synchronisatie via WebSockets met Bryntum Gantt ProjectModel.

---

## Overzicht

De WebSocket integratie maakt het mogelijk om:
- **Real-time Sync** - Wijzigingen direct naar alle clients broadcasten
- **Multi-user Editing** - Meerdere gebruikers tegelijk in hetzelfde project
- **Conflict Resolution** - Server-managed ID generatie voor nieuwe records
- **Live Updates** - Automatische UI updates bij wijzigingen van anderen

---

## 1. Architectuur

### 1.1 Component Diagram

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   Client A      │◄──────────────────►│                 │
│   (ProjectModel)│                    │   WebSocket     │
└─────────────────┘                    │   Server        │
                                       │   (Node.js)     │
┌─────────────────┐     WebSocket      │                 │
│   Client B      │◄──────────────────►│                 │
│   (ProjectModel)│                    └─────────────────┘
└─────────────────┘                           │
                                              ▼
                                       ┌─────────────────┐
                                       │   Database      │
                                       │   (JSON/SQL)    │
                                       └─────────────────┘
```

### 1.2 Mixins

- **ProjectChangeHandlerMixin** - Detecteert en verwerkt project wijzigingen
- **ProjectWebSocketHandlerMixin** - WebSocket communicatie (demo folder)

---

## 2. Client Setup

### 2.1 Basic Connection

```javascript
import { ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    // WebSocket server address
    wsAddress: 'ws://localhost:8080'
});

// Authenticate
project.wsSend('login', { login: 'user', password: 'secret' });

// Set project ID (triggers load)
project.wsProjectId = 1;
```

### 2.2 Connection Events

```javascript
project.on({
    wsOpen() {
        console.log('WebSocket connected');
    },

    wsClose() {
        console.log('WebSocket disconnected');
    },

    wsMessage({ data }) {
        console.log('Received:', data);
    },

    wsError({ error }) {
        console.error('WebSocket error:', error);
    }
});
```

---

## 3. Protocol Reference

### 3.1 Authentication

```json
// Request
{ "command": "login", "login": "user", "password": "password" }

// Response (success)
{ "command": "login", "success": true, "userName": "Charlie" }
```

### 3.2 List Projects

```json
// Request
{ "command": "projects" }

// Response
{
    "command": "projects",
    "projects": [
        { "id": 1, "name": "Project 1" },
        { "id": 2, "name": "Project 2" }
    ]
}
```

### 3.3 Load Dataset

```json
// Request
{ "command": "dataset", "project": 1 }

// Response
{
    "command": "dataset",
    "project": 1,
    "dataset": {
        "tasksData": [],
        "resourcesData": [],
        "dependenciesData": [],
        "assignmentsData": [],
        "calendarsData": [],
        "projectMeta": {}
    }
}
```

### 3.4 Project Changes

```json
// Client sends changes
{
    "command": "projectChange",
    "project": 1,
    "changes": {
        "tasks": {
            "added": [{
                "$PhantomId": "_generatedModel1",
                "name": "New task"
            }],
            "updated": [{
                "id": 1,
                "name": "Updated name"
            }],
            "removed": [{
                "id": 2
            }]
        },
        "resources": {},
        "dependencies": {},
        "assignments": {}
    }
}
```

### 3.5 Server Response (New Records)

```json
// Server assigns real IDs to phantom records
{
    "command": "projectChange",
    "project": 1,
    "changes": {
        "tasks": {
            "added": [{
                "$PhantomId": "_generatedModel1",
                "id": 10
            }]
        }
    }
}
```

### 3.6 Broadcast to Other Clients

```json
// Same projectChange message sent to all connected clients
// Allows them to apply the same changes
{
    "command": "projectChange",
    "project": 1,
    "changes": { ... }
}
```

---

## 4. Server Implementation

### 4.1 Node.js Server (Demo)

Bryntum biedt een demo server: https://github.com/bryntum/gantt-websocket-server

```bash
git clone https://github.com/bryntum/gantt-websocket-server
cd gantt-websocket-server
npm install
npm run start
```

### 4.2 Server Features

| Feature | Beschrijving |
|---------|--------------|
| Multi-project | Meerdere projecten beheren |
| Authentication | Eenvoudige login/password |
| ID Generation | Phantom IDs omzetten naar real IDs |
| Broadcasting | Wijzigingen naar alle clients sturen |
| Auto-reset | Data reset elke 30 minuten (demo) |

### 4.3 Custom Server Implementation

```javascript
// Minimal WebSocket server (Node.js)
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.command) {
            case 'login':
                clients.set(ws, { user: data.login });
                ws.send(JSON.stringify({
                    command: 'login',
                    success: true,
                    userName: data.login
                }));
                break;

            case 'dataset':
                // Load project data from database
                const projectData = loadProject(data.project);
                ws.send(JSON.stringify({
                    command: 'dataset',
                    project: data.project,
                    dataset: projectData
                }));
                break;

            case 'projectChange':
                // Process changes, assign real IDs
                const processed = processChanges(data.changes);

                // Send back to originator with real IDs
                ws.send(JSON.stringify({
                    command: 'projectChange',
                    project: data.project,
                    changes: processed
                }));

                // Broadcast to other clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            command: 'projectChange',
                            project: data.project,
                            changes: processed
                        }));
                    }
                });
                break;
        }
    });
});
```

---

## 5. Phantom ID Handling

### 5.1 Concept

Nieuwe records krijgen tijdelijke "phantom" IDs op de client. De server vervangt deze door echte IDs.

```javascript
// Client creates new task
const task = project.taskStore.add({
    name: 'New Task'
});
// task.id = "_generatedClassModelUID_1" (phantom ID)

// After server response
// task.id = 10 (real ID from server)
```

### 5.2 $PhantomId Field

```json
// In projectChange message
{
    "added": [{
        "$PhantomId": "_generatedClassModelUID_1",
        "name": "New Task"
    }]
}

// Server response maps phantom to real
{
    "added": [{
        "$PhantomId": "_generatedClassModelUID_1",
        "id": 10
    }]
}
```

---

## 6. User Presence

### 6.1 User List Updates

```json
// Server broadcasts when user joins
{
    "command": "login",
    "userName": "Charlie"
}

// Full user list update
{
    "command": "users",
    "users": ["Charlie", "Bob", "Alice"]
}
```

### 6.2 UI Integration

```javascript
project.on({
    wsMessage({ data }) {
        const message = JSON.parse(data);

        if (message.command === 'users') {
            updateUserList(message.users);
        }

        if (message.command === 'login') {
            showToast(`${message.userName} joined`);
        }
    }
});
```

---

## 7. Versions Feature (SchedulerPro)

### 7.1 Auto-save Request

```json
// Request permission for auto-save
{ "command": "requestVersionAutoSave", "project": 1 }

// Server permits
{ "command": "versionAutoSaveOK", "project": 1 }
```

### 7.2 Load Version Content

```json
// Request
{
    "command": "loadVersionContent",
    "project": 1,
    "versionId": 15
}

// Response
{
    "command": "loadVersionContent",
    "project": 1,
    "versionId": 15,
    "content": { ... }
}
```

---

## 8. Reset Command

### 8.1 Server Auto-reset

```json
// Server resets data (every 30 min in demo)
{
    "command": "dataset",
    "dataset": { ... }
}

// Followed by
{
    "command": "reset",
    "userName": "Server"
}
```

### 8.2 Client-triggered Reset

```json
// Client requests reset
{ "command": "reset" }
```

---

## 9. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Transport | Kies WebSocket OF CrudManager, niet beide |
| Reconnection | Implementeer auto-reconnect logica |
| Conflict Resolution | Server is authoritative voor IDs |
| Error Handling | Toon WebSocket errors aan gebruiker |
| Authentication | Gebruik secure tokens in productie |
| SSL | Gebruik wss:// in productie |

---

## 10. CrudManager vs WebSocket

| Aspect | CrudManager | WebSocket |
|--------|-------------|-----------|
| Protocol | HTTP REST | WebSocket |
| Real-time | Polling (optioneel) | Push |
| Multi-user | Handmatig | Ingebouwd |
| Complexity | Laag | Medium |
| Server Load | Per-request | Persistent connection |

**Waarschuwing**: Gebruik niet beide tegelijk. Kies één approach.

---

## 11. Example: Full Client Setup

```javascript
import { Gantt, ProjectModel, Toast } from '@bryntum/gantt';

const project = new ProjectModel({
    wsAddress: 'wss://your-server.com/ws'
});

// Connection handling
project.on({
    wsOpen() {
        project.wsSend('login', {
            login: currentUser.name,
            password: currentUser.token
        });
    },

    wsClose() {
        Toast.show('Connection lost. Reconnecting...');
        setTimeout(() => project.wsConnect(), 3000);
    },

    wsMessage({ data }) {
        const msg = JSON.parse(data);

        switch (msg.command) {
            case 'login':
                if (msg.success) {
                    project.wsProjectId = currentProjectId;
                }
                break;

            case 'reset':
                Toast.show(`Data reset by ${msg.userName}`);
                break;

            case 'users':
                updateOnlineUsers(msg.users);
                break;
        }
    }
});

const gantt = new Gantt({
    appendTo: 'container',
    project,

    tbar: [
        {
            type: 'button',
            text: 'Reset Data',
            onClick() {
                project.wsSend('reset');
            }
        }
    ]
});
```

---

## Zie Ook

- [GANTT-API-PROJECTMODEL.md](./GANTT-API-PROJECTMODEL.md) - Project data management
- [INTEGRATION-NODEJS.md](./INTEGRATION-NODEJS.md) - Server-side processing
- [GANTT-IMPL-CRUD.md](./GANTT-IMPL-CRUD.md) - CrudManager alternatief

---

*Track C - Integraties - Real-time WebSockets*
