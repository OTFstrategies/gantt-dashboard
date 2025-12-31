# Integration Guide: Bryntum Gantt + Microsoft SharePoint

> **Implementatie guide** voor het embedden van Bryntum Gantt in SharePoint: SPFx webparts, REST API integratie, en Microsoft Graph connectivity.

---

## Overzicht

De SharePoint integratie maakt het mogelijk om:
- **SPFx WebPart** - Bryntum Gantt als SharePoint component
- **List Integration** - Gebruik SharePoint Lists als data source
- **Graph API** - Koppel met Microsoft 365 services
- **Authentication** - Azure AD/Entra ID integratie

---

## 1. SPFx WebPart Setup

### 1.1 Project Scaffolding

```bash
# Maak nieuw SPFx project
yo @microsoft/sharepoint

# Selecties:
# - Solution name: bryntum-gantt-webpart
# - Component type: WebPart
# - Framework: No JavaScript framework

# Installeer Bryntum
npm install @bryntum/gantt
```

### 1.2 Folder Structure

```
bryntum-gantt-webpart/
├── src/
│   └── webparts/
│       └── ganttChart/
│           ├── GanttChartWebPart.ts
│           ├── GanttChartWebPart.module.scss
│           ├── components/
│           │   ├── GanttChart.ts
│           │   └── IGanttChartProps.ts
│           └── loc/
│               └── strings.d.ts
├── config/
│   └── package-solution.json
└── package.json
```

---

## 2. WebPart Implementation

### 2.1 Main WebPart Class

```typescript
// GanttChartWebPart.ts
import { Version } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    PropertyPaneTextField,
    PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

import styles from './GanttChartWebPart.module.scss';
import { GanttChart } from './components/GanttChart';
import { IGanttChartProps } from './components/IGanttChartProps';

export interface IGanttChartWebPartProps {
    listName: string;
    viewPreset: string;
    rowHeight: number;
}

export default class GanttChartWebPart
    extends BaseClientSideWebPart<IGanttChartWebPartProps> {

    private ganttChart: GanttChart;

    public async render(): Promise<void> {
        // Container HTML
        this.domElement.innerHTML = `
            <div class="${styles.ganttChart}">
                <div id="gantt-container" class="${styles.container}"></div>
            </div>
        `;

        // Laad data en initialiseer Gantt
        const data = await this.loadProjectData();

        this.ganttChart = new GanttChart({
            container: this.domElement.querySelector('#gantt-container'),
            data,
            viewPreset: this.properties.viewPreset || 'weekAndDayLetter',
            rowHeight: this.properties.rowHeight || 45,
            spHttpClient: this.context.spHttpClient,
            siteUrl: this.context.pageContext.web.absoluteUrl,
            listName: this.properties.listName
        });
    }

    private async loadProjectData(): Promise<any> {
        const listName = this.properties.listName;

        if (!listName) {
            return { tasks: [], resources: [], assignments: [] };
        }

        const endpoint = `${this.context.pageContext.web.absoluteUrl}` +
            `/_api/web/lists/getbytitle('${listName}')/items`;

        const response = await this.context.spHttpClient.get(
            endpoint,
            SPHttpClient.configurations.v1
        );

        const data = await response.json();

        return this.transformSharePointData(data.value);
    }

    private transformSharePointData(items: any[]): any {
        return {
            tasks: items.map(item => ({
                id: item.Id,
                name: item.Title,
                startDate: item.StartDate,
                endDate: item.DueDate,
                duration: item.Duration,
                percentDone: item.PercentComplete * 100,
                parentId: item.ParentTaskId
            }))
        };
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [{
                header: { description: 'Gantt Chart Settings' },
                groups: [{
                    groupName: 'Data Source',
                    groupFields: [
                        PropertyPaneTextField('listName', {
                            label: 'SharePoint List Name'
                        }),
                        PropertyPaneDropdown('viewPreset', {
                            label: 'View Preset',
                            options: [
                                { key: 'weekAndDayLetter', text: 'Week & Day' },
                                { key: 'monthAndYear', text: 'Month & Year' },
                                { key: 'weekAndMonth', text: 'Week & Month' }
                            ]
                        })
                    ]
                }]
            }]
        };
    }
}
```

### 2.2 Gantt Component

```typescript
// components/GanttChart.ts
import { Gantt, ProjectModel } from '@bryntum/gantt';
import { SPHttpClient } from '@microsoft/sp-http';
import { IGanttChartProps } from './IGanttChartProps';

export class GanttChart {
    private gantt: Gantt;
    private project: ProjectModel;
    private spHttpClient: SPHttpClient;
    private siteUrl: string;
    private listName: string;

    constructor(props: IGanttChartProps) {
        this.spHttpClient = props.spHttpClient;
        this.siteUrl = props.siteUrl;
        this.listName = props.listName;

        this.project = new ProjectModel({
            tasksData: props.data.tasks,
            resourcesData: props.data.resources,
            assignmentsData: props.data.assignments
        });

        this.gantt = new Gantt({
            appendTo: props.container,
            project: this.project,

            viewPreset: props.viewPreset,
            rowHeight: props.rowHeight,

            columns: [
                { type: 'wbs' },
                { type: 'name', width: 250 },
                { type: 'startdate' },
                { type: 'duration' },
                { type: 'percentdone', width: 70 }
            ],

            features: {
                taskEdit: {
                    items: {
                        generalTab: {
                            items: {
                                // Verberg niet-relevante velden
                                effortField: false,
                                calendarField: false
                            }
                        }
                    }
                }
            },

            listeners: {
                dataChange: this.onDataChange.bind(this)
            }
        });
    }

    private async onDataChange({ store, action, records }) {
        // Sync changes terug naar SharePoint
        for (const record of records) {
            if (store.id === 'tasks') {
                await this.syncTaskToSharePoint(record, action);
            }
        }
    }

    private async syncTaskToSharePoint(task: any, action: string): Promise<void> {
        const endpoint = `${this.siteUrl}/_api/web/lists/` +
            `getbytitle('${this.listName}')/items`;

        const body = JSON.stringify({
            Title: task.name,
            StartDate: task.startDate,
            DueDate: task.endDate,
            Duration: task.duration,
            PercentComplete: task.percentDone / 100
        });

        if (action === 'add') {
            await this.spHttpClient.post(
                endpoint,
                SPHttpClient.configurations.v1,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body
                }
            );
        }
        else if (action === 'update') {
            await this.spHttpClient.post(
                `${endpoint}(${task.id})`,
                SPHttpClient.configurations.v1,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'IF-MATCH': '*',
                        'X-HTTP-Method': 'MERGE'
                    },
                    body
                }
            );
        }
    }

    public destroy(): void {
        this.gantt?.destroy();
    }
}
```

---

## 3. SharePoint List Schema

### 3.1 Tasks List Columns

| Column Name | Type | Required |
|-------------|------|----------|
| Title | Single line | Yes |
| StartDate | Date | Yes |
| DueDate | Date | Yes |
| Duration | Number | No |
| PercentComplete | Number | No |
| ParentTaskId | Lookup (self) | No |
| AssignedTo | Person | No |
| Priority | Choice | No |

### 3.2 List Creation via PnP

```typescript
import { sp } from '@pnp/sp';
import '@pnp/sp/lists';
import '@pnp/sp/fields';

async function createTasksList(): Promise<void> {
    // Maak lijst
    await sp.web.lists.add('ProjectTasks', '', 100, false);

    const list = sp.web.lists.getByTitle('ProjectTasks');

    // Voeg columns toe
    await list.fields.addDateTime('StartDate', {
        DisplayFormat: 1,
        Required: true
    });

    await list.fields.addDateTime('DueDate', {
        DisplayFormat: 1,
        Required: true
    });

    await list.fields.addNumber('Duration', {
        MinimumValue: 0
    });

    await list.fields.addNumber('PercentComplete', {
        MinimumValue: 0,
        MaximumValue: 1
    });

    // Parent task lookup
    const tasksList = await list.select('Id')();
    await list.fields.addLookup('ParentTaskId', {
        LookupListId: tasksList.Id,
        LookupFieldName: 'Title'
    });
}
```

---

## 4. Microsoft Graph Integration

### 4.1 Planner Tasks

```typescript
import { MSGraphClient } from '@microsoft/sp-http';

class GraphTasksProvider {
    private graphClient: MSGraphClient;

    constructor(graphClient: MSGraphClient) {
        this.graphClient = graphClient;
    }

    async getPlannerTasks(planId: string): Promise<any[]> {
        const response = await this.graphClient
            .api(`/planner/plans/${planId}/tasks`)
            .get();

        return response.value.map(task => ({
            id: task.id,
            name: task.title,
            startDate: task.startDateTime,
            endDate: task.dueDateTime,
            percentDone: task.percentComplete
        }));
    }

    async updatePlannerTask(taskId: string, updates: any): Promise<void> {
        await this.graphClient
            .api(`/planner/tasks/${taskId}`)
            .header('If-Match', updates['@odata.etag'])
            .patch({
                title: updates.name,
                startDateTime: updates.startDate,
                dueDateTime: updates.endDate,
                percentComplete: updates.percentDone
            });
    }
}
```

### 4.2 Project for the Web

```typescript
class ProjectForWebProvider {
    private graphClient: MSGraphClient;

    async getProjects(): Promise<any[]> {
        const response = await this.graphClient
            .api('/solutions/businessApplicationProjects')
            .get();

        return response.value;
    }

    async getProjectTasks(projectId: string): Promise<any[]> {
        const response = await this.graphClient
            .api(`/solutions/businessApplicationProjects/${projectId}/tasks`)
            .get();

        return response.value.map(this.transformTask);
    }

    private transformTask(task: any): any {
        return {
            id: task.id,
            name: task.name,
            startDate: task.scheduledStart,
            endDate: task.scheduledEnd,
            duration: task.duration,
            percentDone: task.percentComplete,
            parentId: task.parentTaskId
        };
    }
}
```

---

## 5. Authentication

### 5.1 Azure AD Permissions

```json
// config/package-solution.json
{
    "solution": {
        "webApiPermissionRequests": [
            {
                "resource": "Microsoft Graph",
                "scope": "Tasks.ReadWrite"
            },
            {
                "resource": "Microsoft Graph",
                "scope": "Group.Read.All"
            }
        ]
    }
}
```

### 5.2 AadHttpClient Usage

```typescript
import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';

class SecureApiClient {
    private aadClient: AadHttpClient;

    async initialize(context: WebPartContext): Promise<void> {
        this.aadClient = await context.aadHttpClientFactory
            .getClient('https://graph.microsoft.com');
    }

    async callGraphApi(endpoint: string): Promise<any> {
        const response = await this.aadClient.get(
            `https://graph.microsoft.com/v1.0${endpoint}`,
            AadHttpClient.configurations.v1
        );

        return response.json();
    }
}
```

---

## 6. Styling for SharePoint

### 6.1 SCSS Module

```scss
// GanttChartWebPart.module.scss
@import '~@bryntum/gantt/gantt.material.css';

.ganttChart {
    .container {
        height: 600px;
        width: 100%;

        // SharePoint theme integration
        --b-gantt-bar-color: "[theme:themePrimary, default:#0078d4]";
        --b-gantt-bar-selected-color: "[theme:themeDark, default:#005a9e]";
    }

    // Responsive
    @media (max-width: 768px) {
        .container {
            height: 400px;
        }
    }
}
```

### 6.2 Theme Sync

```typescript
import { ThemeProvider, ThemeChangedEventArgs } from '@microsoft/sp-component-base';

protected onInit(): Promise<void> {
    // Luister naar theme changes
    this.context.serviceScope.whenFinished(() => {
        const themeProvider = this.context.serviceScope.consume(
            ThemeProvider.serviceKey
        );

        if (themeProvider) {
            themeProvider.themeChangedEvent.add(
                this,
                this.handleThemeChange
            );
        }
    });

    return super.onInit();
}

private handleThemeChange(args: ThemeChangedEventArgs): void {
    // Update Gantt kleuren op basis van SharePoint theme
    const theme = args.theme;

    this.ganttChart?.gantt.element.style.setProperty(
        '--b-gantt-bar-color',
        theme.semanticColors.primaryButtonBackground
    );
}
```

---

## 7. Property Pane

### 7.1 List Picker

```typescript
import { PropertyFieldListPicker } from '@pnp/spfx-property-controls';

protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
        pages: [{
            groups: [{
                groupFields: [
                    PropertyFieldListPicker('listId', {
                        label: 'Select Task List',
                        selectedList: this.properties.listId,
                        includeHidden: false,
                        orderBy: PropertyFieldListPickerOrderBy.Title,
                        disabled: false,
                        onPropertyChange: this.onPropertyPaneFieldChanged,
                        properties: this.properties,
                        context: this.context,
                        deferredValidationTime: 0,
                        key: 'listPickerField'
                    })
                ]
            }]
        }]
    };
}
```

---

## 8. Deployment

### 8.1 Package Solution

```bash
# Build
gulp bundle --ship

# Package
gulp package-solution --ship
```

### 8.2 App Catalog Deployment

1. Upload `.sppkg` naar App Catalog
2. Deploy solution
3. Approve API permissions in SharePoint Admin
4. Voeg WebPart toe aan pagina

---

## 9. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Data Sync | Gebruik batched updates voor performance |
| Caching | Cache list data lokaal |
| Permissions | Minimale Graph scopes |
| Error Handling | Graceful fallbacks bij API errors |
| Responsive | Pas hoogte aan op schermgrootte |
| Theme | Sync met SharePoint Fluent UI theme |

---

## 10. Considerations

### 10.1 SharePoint Limitations

| Limitation | Workaround |
|------------|------------|
| List item limit (5000) | Gebruik indexed columns + paging |
| Complex queries | Gebruik Search API of custom API |
| Real-time updates | Poll of gebruik webhooks |
| Large files | Stream via Azure Blob |

---

## 11. Official Bryntum TaskListModel Pattern

### 11.1 Custom ProjectModel Override

```typescript
// Override CrudManager voor SharePoint integration
class TaskListModel extends ProjectModel {
    private service: Service;

    // Bypass Ajax response decoding
    public decode(response: any): any {
        return response;
    }

    // Bypass Ajax request encoding
    public encode(requestConfig: any): string {
        return requestConfig;
    }

    // Custom request handler via pnpjs
    public sendRequest(request: any): Promise<any> {
        return new Promise((resolve, reject) => {
            switch (request.type) {
                case 'load':
                    return this.service.load(request);
                case 'sync':
                    return this.service.sync(request);
            }
        });
    }
}
```

### 11.2 Service Layer met pnpjs

```typescript
import { sp } from '@pnp/sp';

class TaskListService {
    private proxy: ITaskList;
    private listId: string;

    public load(request: any): Promise<Response> {
        return new Promise((resolve, reject) => {
            this.proxy.getTaskListItems(this.listId).then(response => {
                this.finish(request, response);
                resolve(response);
            }).catch(handleFail);
        });
    }

    public getTaskListItems(listId: string): Promise<Response> {
        const response = new Response();

        return new Promise((resolve, reject) => {
            sp.web.lists.getById(listId).items
                .select('*,ParentIDId')
                .getAll()
                .then((tasks) => {
                    response.tasks.rows = tasks.map(this.transformTask);

                    // Get site users for resources
                    sp.web.siteUsers().then((users) => {
                        response.resources.rows = users;
                        resolve(response);
                    });
                }).catch(reject);
        });
    }
}
```

### 11.3 Extended Task Model Fields

```typescript
class SharePointTask extends TaskModel {
    // Fields beyond default SharePoint TaskList
    static get additionalFields() {
        return [
            { name: 'constraintDate', dataSource: 'ConstraintDate', type: 'date' },
            { name: 'constraintType', dataSource: 'ConstraintType' },
            { name: 'effort', dataSource: 'Effort', type: 'number' },
            { name: 'duration', dataSource: 'Duration', type: 'number', allowNull: true },
            { name: 'manuallyScheduled', dataSource: 'ManuallyScheduled', type: 'boolean' },
            { name: 'rollup', dataSource: 'Rollup', type: 'boolean' },
            { name: 'schedulingMode', dataSource: 'SchedulingMode' },
            { name: 'effortDriven', dataSource: 'EffortDriven' }
        ];
    }
}
```

---

## 12. Troubleshooting

### 12.1 Development Certificate

```bash
# Als "No development certificate found" error
npx gulp trust-dev-cert
```

### 12.2 Babel Loader voor Bryntum

```javascript
// gulpfile.js - Transpile Bryntum source
build.configureWebpack.mergeConfig({
    additionalConfiguration: (generatedConfiguration) => {
        generatedConfiguration.module.rules.push({
            test: /\.js$/,
            include: /node_modules[\\/]+@bryntum[\\/]+\w+-thin[\\/]+lib/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['@babel/preset-env', {
                            targets: { chrome: '71' }
                        }]
                    ]
                }
            }
        });
        return generatedConfiguration;
    }
});
```

### 12.3 Required Babel Packages

```json
{
    "@babel/core": "7.26.9",
    "@babel/preset-env": "7.26.9",
    "babel-loader": "8.4.1"
}
```

---

## Zie Ook

- [INTEGRATION-MS-PROJECT.md](./INTEGRATION-MS-PROJECT.md) - MS Project integratie
- [GANTT-API-CRUD.md](./GANTT-API-CRUD.md) - CRUD operaties
- [GANTT-IMPL-TOOLBAR.md](./GANTT-IMPL-TOOLBAR.md) - Toolbar customization
- [UI-THEMING.md](./UI-THEMING.md) - Theme configuratie

---

*Track C2.5 - Third-party Integraties - SharePoint*
*Bijgewerkt met officiële Bryntum SharePoint guide content*
