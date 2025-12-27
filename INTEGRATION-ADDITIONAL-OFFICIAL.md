# Bryntum Additional Integrations - Official Guide

> **Bron**: Officiële Bryntum Gantt v7.1.0 documentatie

---

## 1. Ionic Integration

### Version Requirements

- Ionic: `5.0.0` or higher
- Angular: `9.0.0` or higher (Ionic uses Angular)

### NPM Package

```bash
npm install -g ionic
npm install @bryntum/gantt-angular
```

### Create Ionic App

```bash
ionic start IonicApp blank
cd IonicApp
ionic serve
```

### Module Setup

**app.module.ts:**

```typescript
import { BryntumGanttModule } from '@bryntum/gantt-angular';

@NgModule({
    imports: [
        BryntumGanttModule
    ]
})
```

### Usage in Template

```html
<ion-header>...</ion-header>

<ion-content>
    <bryntum-gantt
        #gantt
        tooltip="My cool Bryntum Gantt component"
        (onTaskClick)="onGanttTaskClick($event)"
    ></bryntum-gantt>
</ion-content>
```

### CSS Imports (styles.scss)

```scss
@import "~@bryntum/gantt/fontawesome/css/fontawesome.css";
@import "~@bryntum/gantt/fontawesome/css/solid.css";
@import "@bryntum/gantt/gantt.css";
@import "@bryntum/gantt/svalbard-light.css";
```

### Instance Access

```typescript
import { BryntumGanttComponent } from '@bryntum/gantt-angular';
import { Gantt } from '@bryntum/gantt';

export class AppComponent implements AfterViewInit {
    @ViewChild(BryntumGanttComponent, { static: false }) ganttComponent: BryntumGanttComponent;
    private gantt: Gantt;

    ngAfterViewInit(): void {
        this.gantt = this.ganttComponent.instance;
    }
}
```

---

## 2. Express + SQLite Backend

### Project Structure

```
project/
├── config/
│   └── database.js      # Sequelize config
├── models/
│   ├── Task.js          # Task model
│   ├── Dependency.js    # Dependency model
│   └── index.js         # Model exports
├── public/
│   ├── index.html       # Frontend
│   ├── index.js         # Gantt config
│   └── style.css        # Styles
├── initialData/
│   ├── tasks.json       # Seed data
│   └── dependencies.json
├── server.js            # Express server
└── addExampleData.js    # DB seed script
```

### Install Dependencies

```bash
npm install express body-parser sequelize sqlite3
```

### Database Configuration (config/database.js)

```javascript
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite3'
});

export default sequelize;
```

### Task Model (models/Task.js)

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'tasks', key: 'id' },
        onDelete: 'CASCADE'
    },
    name: { type: DataTypes.STRING, allowNull: true },
    startDate: { type: DataTypes.DATE, allowNull: true },
    endDate: { type: DataTypes.DATE, allowNull: true },
    effort: { type: DataTypes.FLOAT, allowNull: true },
    effortUnit: { type: DataTypes.STRING, defaultValue: 'hour' },
    duration: { type: DataTypes.FLOAT, allowNull: true },
    durationUnit: { type: DataTypes.STRING, defaultValue: 'day' },
    percentDone: { type: DataTypes.FLOAT, defaultValue: 0 },
    schedulingMode: { type: DataTypes.STRING, defaultValue: 'Normal' },
    note: { type: DataTypes.TEXT, allowNull: true },
    constraintType: { type: DataTypes.STRING, allowNull: true },
    constraintDate: { type: DataTypes.DATE, allowNull: true },
    manuallyScheduled: { type: DataTypes.BOOLEAN, defaultValue: false },
    expanded: { type: DataTypes.BOOLEAN, defaultValue: false },
    parentIndex: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    tableName: 'tasks',
    timestamps: false,
    indexes: [{ fields: ['parentId'] }]
});

export default Task;
```

### Dependency Model (models/Dependency.js)

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Dependency = sequelize.define('Dependency', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fromEvent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'tasks', key: 'id' },
        onDelete: 'CASCADE'
    },
    toEvent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'tasks', key: 'id' },
        onDelete: 'CASCADE'
    },
    type: { type: DataTypes.INTEGER, defaultValue: 2 },
    lag: { type: DataTypes.FLOAT, defaultValue: 0 },
    lagUnit: { type: DataTypes.STRING, defaultValue: 'day' },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'dependencies',
    timestamps: false,
    indexes: [
        { fields: ['fromEvent'] },
        { fields: ['toEvent'] }
    ]
});

export default Dependency;
```

### Express Server (server.js)

```javascript
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { Dependency, Task } from './models/index.js';

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/@bryntum/gantt')));

// Load endpoint
app.get('/load', async (req, res) => {
    try {
        const [tasks, dependencies] = await Promise.all([
            Task.findAll(),
            Dependency.findAll()
        ]);

        res.send({
            success: true,
            tasks: { rows: tasks },
            dependencies: { rows: dependencies }
        });
    } catch (error) {
        res.send({ success: false, message: 'Load failed' });
    }
});

// Sync endpoint
app.post('/sync', async (req, res) => {
    const { requestId, tasks, dependencies } = req.body;
    try {
        const response = { requestId, success: true };

        if (tasks) {
            const rows = await applyTableChanges('tasks', tasks);
            if (rows) response.tasks = { rows };
        }
        if (dependencies) {
            const rows = await applyTableChanges('dependencies', dependencies);
            if (rows) response.dependencies = { rows };
        }

        res.send(response);
    } catch (error) {
        res.send({ requestId, success: false, message: 'Sync failed' });
    }
});

async function applyTableChanges(table, changes) {
    let rows;
    if (changes.added) rows = await createRecords(changes.added, table);
    if (changes.updated) await updateRecords(changes.updated, table);
    if (changes.removed) await deleteRecords(changes.removed, table);
    return rows;
}

async function createRecords(added, table) {
    const Model = table === 'tasks' ? Task : Dependency;
    return Promise.all(added.map(async ({ $PhantomId, ...data }) => {
        const result = await Model.create(data);
        return { $PhantomId, id: result.id };
    }));
}

async function updateRecords(updated, table) {
    const Model = table === 'tasks' ? Task : Dependency;
    return Promise.all(updated.map(({ id, $PhantomId, ...data }) =>
        Model.update(data, { where: { id } })
    ));
}

async function deleteRecords(deleted, table) {
    const Model = table === 'tasks' ? Task : Dependency;
    const ids = deleted.map(({ id }) => id);
    return Model.destroy({ where: { id: ids } });
}

app.listen(1337, () => console.log('Server listening on port 1337'));
```

### Frontend Gantt (public/index.js)

```javascript
import { Gantt } from './gantt.module.js';

const gantt = new Gantt({
    appendTo: 'app',
    columns: [{ type: 'name', field: 'name', width: 250 }],
    viewPreset: 'weekAndDayLetter',
    barMargin: 10,
    project: {
        taskStore: {
            transformFlatData: true
        },
        loadUrl: 'http://localhost:1337/load',
        autoLoad: true,
        syncUrl: 'http://localhost:1337/sync',
        autoSync: true,
        validateResponse: true
    }
});
```

### Seed Script (addExampleData.js)

```javascript
import { readFileSync } from 'fs';
import sequelize from './config/database.js';
import { Dependency, Task } from './models/index.js';

async function setupDatabase() {
    await sequelize.sync();

    const tasksData = JSON.parse(readFileSync('./initialData/tasks.json'));
    const dependenciesData = JSON.parse(readFileSync('./initialData/dependencies.json'));

    await sequelize.transaction(async (t) => {
        await Task.bulkCreate(tasksData, { transaction: t });
        await Dependency.bulkCreate(dependenciesData, { transaction: t });
    });

    console.log('Database seeded successfully.');
}

setupDatabase();
```

**Run commands:**
```bash
node addExampleData.js  # Seed database
npm start               # Start server
```

---

## 3. Salesforce Lightning Web Components

### Overview

Bryntum Gantt ondersteunt Salesforce Lightning Web Components (LWC) met specifieke aanpassingen voor Lightning Locker security.

### Lightning Locker Support

Lightning Locker isoleert componenten voor security. Bryntum biedt speciale LWC bundles:

```
gantt.lwc.module.js  // Alleen voor LWC omgeving
```

### Ondersteunde Features

- Grouping
- Sorting
- Editing
- Tooltips
- Drag & drop (rows, columns)
- Popup editors
- Key navigation

### Installation

Gebruik de Bryntum Salesforce Showcase repository:

```
https://github.com/bryntum/bryntum-salesforce-showcase
```

### Known Issues

**1. Custom Bundle Problems**
- Sources bevatten incompatibele code voor Locker Service
- Verwijder code binnen `<remove-on-lwc-release>` tags bij custom bundling

**2. CSS Collisions**
- Meerdere Bryntum producten kunnen CSS conflicts veroorzaken
- Gebruik één static resource per product family

**3. Modified APIs**
- Lightning Locker wijzigt native Web APIs
- `gantt.lwc.module.js` werkt ALLEEN met Lightning Locker enabled
- Override entry: `lib/Gantt/override/salesforce/AllOverrides.js`

### Browser Support

LWC bundle ondersteunt alleen moderne browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge Chromium (latest)

**Niet ondersteund:**
- IE11
- Legacy Edge (non-Chromium)

### Demo URLs

| Product | Salesforce Demo |
|---------|-----------------|
| Gantt | https://bryntum-dev-ed.develop.my.site.com/demo/gantt |
| Grid | https://bryntum-dev-ed.develop.my.site.com/demo/grid |
| SchedulerPro | https://bryntum-dev-ed.develop.my.site.com/demo/schedulerpro |
| Calendar | https://bryntum-dev-ed.develop.my.site.com/demo/calendar |
| TaskBoard | https://bryntum-dev-ed.develop.my.site.com/demo/taskboard |

---

## 4. WebSockets Integration

### Pattern Overview

WebSocket integratie voor real-time updates:

```javascript
const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    gantt.project.inlineData = data;
};

// Changes naar server sturen
gantt.project.on('dataChange', ({ store, action, records }) => {
    socket.send(JSON.stringify({
        store: store.id,
        action,
        records: records.map(r => r.data)
    }));
});
```

### Server-Side (Node.js + ws)

```javascript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    // Initial data sturen
    ws.send(JSON.stringify(projectData));

    // Changes ontvangen
    ws.on('message', (message) => {
        const change = JSON.parse(message);
        // Update database
        // Broadcast naar andere clients
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});
```

---

## 5. SharePoint Integration

### Embedding Approach

Bryntum Gantt kan in SharePoint worden geëmbed via:

1. **SharePoint Framework (SPFx) Web Part**
2. **Content Editor Web Part** met script links
3. **Custom Page met iframe**

### SPFx Setup

```bash
yo @microsoft/sharepoint
npm install @bryntum/gantt
```

### Module Loading

```typescript
import { Gantt } from '@bryntum/gantt';

export default class GanttWebPart extends BaseClientSideWebPart<IGanttWebPartProps> {
    public render(): void {
        new Gantt({
            appendTo: this.domElement,
            project: {
                loadUrl: `${this.context.pageContext.web.absoluteUrl}/_api/gantt/load`,
                syncUrl: `${this.context.pageContext.web.absoluteUrl}/_api/gantt/sync`
            }
        });
    }
}
```

---

## Quick Reference: Integration Comparison

| Platform | Package | Wrapper Type | Special Bundle |
|----------|---------|--------------|----------------|
| Angular | `@bryntum/gantt-angular` | Native Angular | - |
| React | `@bryntum/gantt-react` | React Component | - |
| Vue | `@bryntum/gantt-vue` | Vue Component | - |
| Ionic | `@bryntum/gantt-angular` | Angular (Ionic uses Angular) | - |
| Salesforce | Static Resource | LWC | `gantt.lwc.module.js` |
| Express | `@bryntum/gantt` | Vanilla JS | - |
| SharePoint | `@bryntum/gantt` | SPFx | - |

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
