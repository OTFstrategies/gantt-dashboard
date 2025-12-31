# DEEP-DIVE: Critical Features (Gaps Filled)

> **Level 2** - Documentatie voor eerder ontbrekende kritieke features: AI Integration, MS Project, Resource Views, Real-time, Revisions, en Export.

---

## Inhoudsopgave

1. [MS Project Import/Export](#1-ms-project-importexport)
2. [Resource Histogram](#2-resource-histogram)
3. [Resource Utilization](#3-resource-utilization)
4. [Real-time/WebSocket Synchronization](#4-real-timewebsocket-synchronization)
5. [Versions & Revisions System](#5-versions--revisions-system)
6. [PDF Export](#6-pdf-export)
7. [Excel/CSV Export](#7-excelcsv-export)
8. [AI Integration](#8-ai-integration)

---

## 1. MS Project Import/Export

### 1.1 Overzicht

Bryntum Gantt kan MS Project bestanden (.mpp, .xer) importeren via de MPXJ library.

```
┌─────────────────────────────────────────────────────────────┐
│                    MS Project Import Flow                    │
├─────────────────────────────────────────────────────────────┤
│  .mpp/.xer file                                              │
│       │                                                      │
│       ▼                                                      │
│  PHP/Java Backend (MPXJ Library)                             │
│       │                                                      │
│       ▼                                                      │
│  JSON Response                                               │
│       │                                                      │
│       ▼                                                      │
│  Importer Class → ProjectModel                               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Features

| Feature | Type | Beschrijving |
|---------|------|--------------|
| `fileDrop` | Feature | Drag & drop import |
| `MspExport` | Feature | Export naar MS Project formaat |

### 1.3 Importer Class Pattern

```javascript
import { Gantt, AjaxHelper, Toast, ArrayHelper } from '@bryntum/gantt';

class Importer {
    constructor(config) {
        this.gantt = config.gantt;
        this.defaultColumns = config.defaultColumns;

        // ID mappings voor import
        this.calendarMap = {};
        this.resourceMap = {};
        this.taskMap = {};
    }

    async importData(data) {
        // Maak nieuw project
        const project = new this.gantt.projectModelClass({
            autoSetConstraints: true,
            silenceInitialCommit: false,
            startedTaskScheduling: 'Manual'
        });

        // Import in volgorde
        this.importCalendars(data.calendars);
        this.importTasks(data.tasks);
        this.importResources(data.resources);
        this.importAssignments(data.assignments);
        this.importDependencies(data.dependencies);
        this.importProject(data.project);

        // Assign en commit
        this.gantt.project = project;
        await project.commitAsync();

        this.importColumns(data.columns);

        return project;
    }

    // ID Mapping - MS Project ID → Gantt ID
    processTask(taskData) {
        const { id, children } = taskData;
        delete taskData.id;

        taskData.calendar = this.calendarMap[taskData.calendar];

        const task = new this.taskStore.modelClass(taskData);
        task._importedId = id;
        this.taskMap[id] = task;

        if (children) {
            task.appendChild(children.map(this.processTask));
        }

        return task;
    }
}
```

### 1.4 FileDrop Feature

```javascript
const gantt = new Gantt({
    features: {
        fileDrop: true  // Enable drag & drop import
    },

    onFileDrop({ file }) {
        this.importFile(file);
    },

    async importFile(file) {
        const formData = new FormData();
        formData.append('mpp-file', file);

        gantt.maskBody('Importing project...');

        try {
            const { parsedJson } = await AjaxHelper.post(
                'php/load.php',
                formData,
                { parseJson: true }
            );

            if (parsedJson.success) {
                await importer.importData(parsedJson.data);
                gantt.setStartDate(gantt.project.startDate);
                Toast.show('File imported successfully!');
            }
        } finally {
            gantt.unmaskBody();
        }
    }
});
```

### 1.5 MspExport Feature

```javascript
const gantt = new Gantt({
    features: {
        mspExport: true
    },

    tbar: [{
        type: 'button',
        text: 'Export to MS Project',
        onClick() {
            gantt.features.mspExport.export({
                filename: 'project.xml'
            });
        }
    }]
});
```

---

## 2. Resource Histogram

### 2.1 Overzicht

ResourceHistogram toont resource allocatie over tijd als staafdiagram.

```javascript
import { Gantt, ProjectModel, ResourceHistogram, Splitter } from '@bryntum/gantt';

const project = new ProjectModel({
    transport: { load: { url: 'data/data.json' } },
    autoLoad: true
});

const gantt = new Gantt({
    project,
    appendTo: 'container',
    // Gantt config...
});

new Splitter({
    appendTo: 'container',
    showButtons: true
});

const histogram = new ResourceHistogram({
    appendTo: 'container',
    project,
    partner: gantt,  // Synchroniseert scroll

    // Configuratie
    rowHeight: 50,
    showBarTip: true,
    showBarText: false,
    showMaxEffort: true,

    resourceImagePath: 'images/users/',

    columns: [
        { type: 'resourceInfo', field: 'name', showEventCount: false }
    ],

    features: {
        scheduleTooltip: false,
        group: { field: 'city' }
    }
});
```

### 2.2 Configuratie Opties

| Config | Type | Beschrijving |
|--------|------|--------------|
| `partner` | Gantt | Synchroniseert scrolling met Gantt |
| `showBarTip` | Boolean | Tooltips op bars |
| `showBarText` | Boolean | Tekst in bars |
| `showMaxEffort` | Boolean | Max allocatie lijn |
| `rowHeight` | Number | Hoogte van resource rows |

### 2.3 Toolbar Voorbeeld

```javascript
tbar: {
    items: {
        showBarText: {
            type: 'slidetoggle',
            text: 'Show bar texts',
            checked: false,
            onAction({ source }) {
                histogram.showBarText = source.checked;
            }
        },
        showMaxEffort: {
            type: 'slidetoggle',
            text: 'Show max allocation',
            checked: true,
            onAction({ source }) {
                histogram.showMaxEffort = source.checked;
            }
        }
    }
}
```

---

## 3. Resource Utilization

### 3.1 Overzicht

ResourceUtilization is een geavanceerdere view dan Histogram met:
- Effort, Cost, en Material series
- Grouping opties
- Cell editing
- Copy/paste

```javascript
import {
    Gantt,
    TimePhasedProjectModel,
    TimePhasedTaskModel,
    ResourceUtilization,
    Splitter,
    Store
} from '@bryntum/gantt';

// Custom TaskModel met project tracking
class Task extends TimePhasedTaskModel {
    static fields = [
        { name: 'isProjectTask', type: 'boolean' }
    ];

    get projectTask() {
        let result = null;
        this.bubbleWhile(task => {
            if (task.isProjectTask) result = task;
            return !result && task.parent && !task.parent.isRoot;
        });
        return result;
    }
}

const project = new TimePhasedProjectModel({
    taskModelClass: Task,
    loadUrl: 'data/load.json',
    autoLoad: true
});
```

### 3.2 ResourceUtilization Component

```javascript
const resourceUtilization = new ResourceUtilization({
    appendTo: 'container',
    project,
    partner: gantt,

    rowHeight: 45,
    showBarTip: true,

    // Series configuratie
    series: {
        effort: { disabled: false },   // Default: enabled
        cost: { disabled: true },      // Uitgeschakeld
        quantity: { disabled: true }   // Material
    },

    features: {
        treeGroup: {
            levels: [
                // Group by resource
                ({ origin }) => {
                    if (origin.isResourceModel) return Store.StopBranch;
                    origin = origin[0] || origin;
                    return origin.resource;
                },
                // Group by project
                ({ origin }) => {
                    if (origin.isResourceModel) return Store.StopBranch;
                    origin = origin[0] || origin;
                    return origin.event?.projectTask || 'No Project';
                }
            ]
        },
        scheduleContext: {
            keyNavigation: true,
            multiSelect: true
        },
        allocationCellEdit: true,
        allocationCopyPaste: true
    }
});
```

### 3.3 Series Toggle

```javascript
// Toggle series visibility
resourceUtilization.series.cost.disabled = false;
resourceUtilization.series.effort.disabled = true;

// Of via toolbar
onSeriesButtonToggle({ source }) {
    resourceUtilization.series[source.seriesId].disabled = !source.pressed;
}
```

---

## 4. Real-time/WebSocket Synchronization

### 4.1 Architectuur

```
┌─────────────────────────────────────────────────────────────┐
│                    WebSocket Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Client A              WebSocket Server            Client B  │
│  ┌───────┐              ┌─────────┐               ┌───────┐ │
│  │ Gantt │◄────────────►│  Node   │◄─────────────►│ Gantt │ │
│  │Project│   Revisions  │ Server  │   Revisions   │Project│ │
│  └───────┘              └─────────┘               └───────┘ │
│                                                              │
│  Commands: login, logout, dataset, project_change, reset    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 WebSocketProjectModel

```javascript
import { ProjectModel, Base, Events } from '@bryntum/gantt';

// Mixin voor WebSocket support
const ProjectWebSocketHandlerMixin = Target => class extends (Target || Base) {
    static configurable = {
        wsAddress: null,           // WebSocket server URL
        wsUserName: '',            // Username
        wsAutoLoad: true,          // Auto-load dataset
        wsConnectionTimeout: 60000, // Timeout
        wsProjectId: null          // Project ID
    };

    // Send message
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
        const { command, data: payload } = data;

        if (command === 'project_change') {
            this.trigger('wsBeforeReceiveChanges');

            await this.applyRevisions(payload.revisions.map(r => ({
                revisionId: r.revision,
                localRevisionId: r.localRevision,
                clientId: r.client,
                changes: r.changes
            })));

            this.trigger('wsReceiveChanges');
        }
        else if (command === 'dataset') {
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

    // Load data via WebSocket
    async wsLoad() {
        if (this.wsProjectId == null) return;

        await this.wsSend('dataset', { project: this.wsProjectId });

        await new Promise(resolve => {
            const detacher = this.ion({
                wsReceiveDataset() {
                    detacher();
                    resolve(true);
                },
                expires: {
                    delay: this.wsConnectionTimeout,
                    alt: () => { detacher(); resolve(false); }
                }
            });
        });

        await this.commitAsync();
        this.trigger('wsLoad');
    }
};

// Extended ProjectModel
class WebSocketProjectModel extends ProjectWebSocketHandlerMixin(ProjectModel) {
    static $name = 'WebsocketProjectModel';
}
```

### 4.3 WebSocketManager

```javascript
class WebSocketManager extends Events(Base) {
    static webSocketImplementation = WebSocket;

    static configurable = {
        address: '',        // ws://localhost:8080
        userName: 'User',
        autoConnect: true
    };

    get isOpened() {
        return this.connector?.readyState === WebSocket.OPEN;
    }

    async open() {
        if (this.isOpened) return true;

        this.connector = new WebSocket(this.address);
        this.attachSocketListeners(this.connector);

        return new Promise(resolve => {
            const detacher = this.ion({
                open: () => resolve(true),
                error: () => resolve(false)
            });
        });
    }

    send(command, data = {}) {
        this.connector?.send(JSON.stringify({ command, data }));
    }

    close() {
        this.connector?.close();
    }
}
```

### 4.4 Events

| Event | Beschrijving |
|-------|--------------|
| `wsOpen` | WebSocket connection opened |
| `wsClose` | Connection closed |
| `wsError` | Connection error |
| `wsMessage` | Message received |
| `wsLoad` | Dataset loaded |
| `wsSendMessage` | Message sent |
| `wsSendChanges` | Changes sent |
| `wsReceiveChanges` | Changes received |
| `wsBeforeReceiveChanges` | Before applying changes |
| `wsReceiveDataset` | Dataset received |

### 4.5 Gantt met WebSocket

```javascript
const project = new WebSocketProjectModel({
    autoSetConstraints: true,
    wsAutoLoad: true,
    stm: {
        revisionsEnabled: true
    }
});

const gantt = new Gantt({
    project,
    enableTransactionalFeatures: true,

    tbar: {
        items: {
            loginWidget: {
                type: 'loginwidget',
                host: 'wss://server:8080',
                project
            },
            autoSync: {
                type: 'slidetoggle',
                text: 'Auto-sync',
                value: true,
                onChange({ checked }) {
                    project[checked ? 'resumeAutoSync' : 'suspendAutoSync']();
                }
            }
        }
    }
});

// Connect
project.wsAddress = 'wss://server:8080';
await project.wsSend('login', { login: 'user', password: '' });
project.wsProjectId = 1;
```

---

## 5. Versions & Revisions System

### 5.1 Overzicht

Het Versions systeem biedt:
- Automatische versie-opslag
- Handmatige versie-opslag
- Vergelijken van versies (met baselines)
- Herstellen van versies

### 5.2 Configuratie

```javascript
const gantt = new Gantt({
    project: {
        stm: {
            autoRecord: true  // Auto-record changes
        }
    },

    features: {
        versions: {
            // Custom models voor user tracking
            versionModelClass: VersionModelWithUser,
            transactionModelClass: TransactionModelWithUser
        },
        baselines: {
            disabled: true  // Enable voor versie vergelijking
        }
    }
});
```

### 5.3 Custom Version Model

```javascript
import { VersionModel, ChangeLogTransactionModel, DateHelper, StringHelper } from '@bryntum/gantt';

class VersionModelWithUser extends VersionModel {
    static $name = 'VersionModelWithUser';

    static fields = [
        { name: 'username', type: 'string' }
    ];

    onBeforeSave() {
        this.username = currentUserName;
    }

    get defaultDescription() {
        return `${this.isAutosave ? 'Auto-saved' : `Saved by ${this.username}`} on
            ${DateHelper.format(this.savedAt, 'MMM D YYYY')}`;
    }
}

class TransactionModelWithUser extends ChangeLogTransactionModel {
    static $name = 'TransactionModelWithUser';

    static fields = [
        { name: 'username', type: 'string' }
    ];

    construct(config) {
        super.construct({
            username: currentUserName,
            ...config
        });
    }
}
```

### 5.4 VersionGrid Component

```javascript
import { VersionGrid } from '@bryntum/gantt';

class MyVersionGrid extends VersionGrid {
    static $name = 'MyVersionGrid';
    static type = 'myversiongrid';

    static configurable = {
        columns: [
            {
                type: 'tree',
                text: 'Description',
                field: 'description',
                renderer({ record, grid }) {
                    if (record.transactionModel) {
                        const { description, transactionModel: { username } } = record;
                        return {
                            children: [
                                {
                                    tag: 'img',
                                    class: 'user-avatar',
                                    src: `images/${username}.png`
                                },
                                { tag: 'span', html: description }
                            ]
                        };
                    }
                    return grid.renderDescription(event);
                }
            },
            {
                text: 'Occurred At',
                field: 'occurredAt',
                type: 'date',
                format: 'M/D/YY h:mm a'
            }
        ]
    };
}

MyVersionGrid.initClass();
```

### 5.5 Versie Operaties

```javascript
const { versions, baselines } = gantt.features;

// Save version
versions.saveVersion();

// Custom transaction description
versions.transactionDescription = `Moved task ${taskRecord.name}`;
versions.stopTransaction();

// Restore version
await versions.restoreVersion(versionRecord);

// Compare version (shows baseline)
baselines.disabled = false;
await versions.compareVersion(versionRecord);

// Stop comparing
baselines.disabled = true;
await versions.stopComparing();

// Get version content
const content = await versions.getVersionContent(versionModel);
```

### 5.6 Events

```javascript
gantt.on({
    // Custom transaction descriptions
    taskDrop({ taskRecords }) {
        this.features.versions.transactionDescription =
            `Dragged ${taskRecords.length} tasks`;
    },

    taskResizeEnd({ taskRecord }) {
        this.features.versions.transactionDescription =
            `Resized task ${taskRecord.name}`;
    },

    transactionChange({ hasUnattachedTransactions }) {
        saveButton.disabled = !hasUnattachedTransactions;
    }
});
```

---

## 6. PDF Export

### 6.1 Configuratie

```javascript
import { Gantt, ProjectModel, DateHelper } from '@bryntum/gantt';

const gantt = new Gantt({
    project,

    features: {
        pdfExport: {
            exportServer: 'http://localhost:8080/',
            translateURLsToAbsolute: 'http://localhost:8080/resources/',
            sendAsBinary: true,

            // Custom header/footer templates
            headerTpl: ({ currentPage, totalPages }) => `
                <img src="logo.svg"/>
                <dl>
                    <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
                    <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
                </dl>
            `,

            footerTpl: () => `<h3>© ${new Date().getFullYear()} Company</h3>`,

            // Filter out styles
            filterStyles: styles => styles.filter(item =>
                !item.match(/<style .+monaco-colors/)
            )
        }
    },

    tbar: [{
        type: 'button',
        text: 'Export to PDF',
        icon: 'fa-file-export',
        onClick() {
            gantt.features.pdfExport.showExportDialog();
        }
    }]
});
```

### 6.2 Export Options

| Option | Type | Beschrijving |
|--------|------|--------------|
| `exportServer` | String | URL van export server |
| `translateURLsToAbsolute` | String | Base URL voor resources |
| `sendAsBinary` | Boolean | Direct downloaden |
| `headerTpl` | Function | Header template |
| `footerTpl` | Function | Footer template |
| `filterStyles` | Function | Filter CSS |
| `webSocketAvailable` | Boolean | Gebruik WebSocket |

### 6.3 Export Dialog

```javascript
// Toon standaard export dialog
gantt.features.pdfExport.showExportDialog();

// Of programmatisch exporteren
await gantt.features.pdfExport.export({
    columns: gantt.columns.visibleColumns.map(c => c.id),
    exporterType: 'singlepage',
    orientation: 'landscape',
    paperFormat: 'A4'
});
```

---

## 7. Excel/CSV Export

### 7.1 Configuratie

```javascript
import { Gantt, ProjectModel, WriteExcelFileProvider } from '@bryntum/gantt';

const gantt = new Gantt({
    project,

    features: {
        excelExporter: {
            dateFormat: null,  // Gebruik standaard datum format
            xlsProvider: WriteExcelFileProvider  // write-excel-file library
        }
    },

    tbar: [
        {
            type: 'button',
            text: 'Export as XLSX',
            icon: 'fa-file-export',
            onAction() {
                gantt.features.excelExporter.export({
                    filename: project.taskStore.first?.name
                });
            }
        },
        {
            type: 'button',
            text: 'Export as CSV',
            icon: 'fa-file-csv',
            onAction() {
                gantt.features.excelExporter.export({
                    filename: 'export',
                    csv: {
                        delimiter: ','
                    }
                });
            }
        }
    ]
});
```

### 7.2 Export Options

```javascript
gantt.features.excelExporter.export({
    filename: 'project-export',

    // Voor Excel
    // (geen extra opties nodig)

    // Voor CSV
    csv: {
        delimiter: ',',     // Of ';' voor EU
        encoding: 'utf-8'
    }
});
```

---

## 8. AI Integration

### 8.1 Overzicht

Bryntum Gantt 7.1 heeft ingebouwde AI plugins voor:
- OpenAI (ChatGPT)
- Anthropic (Claude)
- Google (Gemini)

### 8.2 Beschikbare Plugins

```javascript
// Classes uit TypeScript definitions
export class AnthropicPlugin extends AbstractApiPlugin { }
export class GooglePlugin extends AbstractApiPlugin { }
export class OpenAIPlugin extends AbstractApiPlugin { }
```

### 8.3 AI Gantt Demo Structuur

De `ai-gantt` demo vereist een backend (PHP) voor API communicatie:

```
examples/ai-gantt/
└── php/
    └── config.php   # API key configuratie
```

### 8.4 Gebruik (Conceptueel)

```javascript
// AI-assisted task creation
const gantt = new Gantt({
    features: {
        aiAssistant: {
            provider: 'openai',  // of 'anthropic', 'google'
            apiKey: 'your-api-key',

            // AI kan helpen met:
            // - Task breakdown suggesties
            // - Duration estimates
            // - Resource assignment
            // - Dependency detection
        }
    }
});
```

> **Note**: AI integratie is een nieuwe feature in Bryntum Gantt 7.1.0.
> Raadpleeg de officiële documentatie voor de meest recente implementatiedetails.

---

## Cross-References

| Document | Relevante Secties |
|----------|-------------------|
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | ProjectModel, Stores |
| [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md) | Server sync |
| [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) | Event handling |
| [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) | Baselines |
| [INTERNALS-SOURCE-CODE](./INTERNALS-SOURCE-CODE.md) | STM, Revisions |

---

## Demo Locaties

| Feature | Demo |
|---------|------|
| MS Project Import | `examples/msprojectimport/` |
| MS Project Export | `examples/msprojectexport/` |
| Resource Histogram | `examples/resourcehistogram/` |
| Resource Utilization | `examples/resourceutilization/` |
| Real-time Updates | `examples/realtime-updates/` |
| Versions | `examples/versions/` |
| PDF Export | `examples/export/` |
| Excel Export | `examples/exporttoexcel/` |
| AI Gantt | `examples/ai-gantt/` |

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
