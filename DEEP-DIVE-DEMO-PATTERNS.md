# DEEP-DIVE: Demo Patterns

> **Level 2** - Patronen en technieken geëxtraheerd uit 80+ officiële Bryntum Gantt demos.

---

## Inhoudsopgave

1. [Demo Overzicht](#1-demo-overzicht)
2. [Custom TaskModel Patterns](#2-custom-taskmodel-patterns)
3. [TaskEditor Customization](#3-taskeditor-customization)
4. [Custom Column Patterns](#4-custom-column-patterns)
5. [Custom Widget Registration](#5-custom-widget-registration)
6. [Toolbar Patterns](#6-toolbar-patterns)
7. [Filter en Search Patterns](#7-filter-en-search-patterns)
8. [State Persistence Patterns](#8-state-persistence-patterns)
9. [Multi-Component Patterns](#9-multi-component-patterns)
10. [Data Loading Patterns](#10-data-loading-patterns)
11. [Rendering Customization](#11-rendering-customization)
12. [Cross-References](#12-cross-references)

---

## 1. Demo Overzicht

### 1.1 Demo Categorieën

De Bryntum Gantt trial bevat 82 demos, gecategoriseerd als:

| Categorie | Voorbeelden | Focus |
|-----------|-------------|-------|
| **Basic** | `basic`, `advanced` | Standaard setup |
| **Data** | `bigdataset`, `infinite-scroll` | Performance |
| **Editing** | `taskeditor`, `custom-taskmenu` | User interaction |
| **Rendering** | `custom-taskbar`, `custom-rendering` | Visuele aanpassing |
| **Dependencies** | `dependencies`, `criticalpaths` | Relaties |
| **Resources** | `resourceassignment`, `resourcehistogram` | Capaciteit |
| **Export** | `export`, `print`, `msprojectexport` | Output |
| **Integration** | `gantt-taskboard`, `charts` | Third-party |
| **State** | `state`, `undoredo` | Persistence |

### 1.2 Demo Structuur

```
examples/
├── [demo-name]/
│   ├── app.module.js      # ESM versie (primary)
│   ├── app.umd.js         # UMD versie (legacy)
│   ├── index.html         # HTML wrapper
│   ├── resources/         # Demo assets
│   └── lib/               # Custom classes
└── frameworks/
    ├── react/
    │   ├── javascript/
    │   └── typescript/
    ├── angular/
    └── vue/
```

---

## 2. Custom TaskModel Patterns

### 2.1 Extra Velden Toevoegen

**Bron: `taskeditor/app.module.js`**

```javascript
class MyTask extends TaskModel {
    static fields = [
        { name: 'deadline', type: 'date' },
        { name: 'priority', type: 'string', defaultValue: 'medium' },
        { name: 'customNote', type: 'string' }
    ];
}

const project = new ProjectModel({
    taskModelClass: MyTask,
    loadUrl: 'data/tasks.json'
});
```

### 2.2 Computed Fields

**Bron: `custom-taskbar/app.module.js`**

```javascript
class MyTask extends TaskModel {
    static fields = [
        { name: 'hoursWorked', type: 'number', defaultValue: 0 }
    ];

    // Computed getter
    get hoursRemaining() {
        const totalHours = this.duration * 8; // 8 uur per dag
        return totalHours - this.hoursWorked;
    }

    // Computed met dependencies
    get isOverdue() {
        return this.endDate < new Date() && this.percentDone < 100;
    }
}
```

### 2.3 Validation

```javascript
class ValidatedTask extends TaskModel {
    static fields = [
        {
            name: 'estimatedHours',
            type: 'number',
            // Validatie in field definitie
            convert(value) {
                return Math.max(0, Math.min(value, 1000));
            }
        }
    ];

    // Custom validatie methode
    isValid() {
        if (this.duration <= 0) return false;
        if (!this.name || this.name.trim() === '') return false;
        return true;
    }
}
```

---

## 3. TaskEditor Customization

### 3.1 Tabs Toevoegen

**Bron: `taskeditor/app.module.js`**

```javascript
const gantt = new Gantt({
    features: {
        taskEdit: {
            editorConfig: {
                width: '48em',
                modal: { closeOnMaskTap: true }
            },
            items: {
                // Bestaande tab aanpassen
                generalTab: {
                    title: 'Details',  // Rename
                    items: {
                        // Custom divider toevoegen
                        customDivider: {
                            html: '',
                            dataset: { text: 'Custom Fields' },
                            cls: 'b-divider'
                        },
                        // Custom field toevoegen
                        deadlineField: {
                            type: 'datefield',
                            name: 'deadline',
                            label: 'Deadline'
                        },
                        // Radio group
                        priority: {
                            type: 'radiogroup',
                            name: 'priority',
                            label: 'Priority',
                            inline: true,
                            options: {
                                high: 'High',
                                med: 'Medium',
                                low: 'Low'
                            }
                        }
                    }
                },

                // Nieuwe tab toevoegen
                filesTab: {
                    type: 'filestab',  // Custom widget type
                    weight: 110        // Positie (hoger = later)
                },

                // Container tab met nested content
                resourcesTab: {
                    type: 'container',
                    weight: 120,
                    title: 'Resources',
                    items: {
                        resources: {
                            type: 'resourcelist'  // Custom widget
                        }
                    }
                }
            }
        }
    }
});
```

### 3.2 Predecessors Grid Aanpassen

```javascript
features: {
    taskEdit: {
        items: {
            predecessorsTab: {
                items: {
                    grid: {
                        columns: {
                            data: {
                                name: {
                                    // Custom renderer voor cel
                                    renderer({ record: dependency }) {
                                        const task = dependency.fromTask;
                                        if (task) {
                                            return StringHelper.xss`${task.name} (${task.id})`;
                                        }
                                        return '';
                                    },
                                    // Custom editor
                                    editor: {
                                        displayValueRenderer(taskRecord) {
                                            return taskRecord
                                                ? StringHelper.xss`${taskRecord.name} (${taskRecord.id})`
                                                : '';
                                        },
                                        listItemTpl(taskRecord) {
                                            return StringHelper.xss`${taskRecord.name} (${taskRecord.id})`;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
```

### 3.3 Rich Text Editor (TinyMCE)

**Bron: `taskeditor/app.module.js`**

```javascript
// TinyMCE field als custom widget
class TinyMceField extends RichTextField.mixin(Delayable) {
    static $name = 'TinyMceField';
    static type = 'tinymcefield';

    static configurable = {
        tinyMceConfig: {},
        licenseKey: '',
        inline: false,
        resize: false,
        menubar: false,
        autoFocus: true,
        rootBlock: 'div',
        inputAttributes: {
            tag: 'textarea'
        }
    };

    internalOnPaint() {
        globalThis.tinymce.init({
            ...this.tinyMceConfig,
            license_key: this.licenseKey,
            target: this.input,
            setup: editor => this.setupEditor(editor)
        });
    }
}

TinyMceField.initClass();

// Gebruik in TaskEditor
features: {
    taskEdit: {
        items: {
            notesTab: {
                items: {
                    noteField: {
                        type: 'tinymcefield',
                        width: '100%',
                        height: '30em',
                        tinyMceConfig: { menubar: true }
                    }
                }
            }
        }
    }
}
```

---

## 4. Custom Column Patterns

### 4.1 Template Column

```javascript
columns: [
    {
        text: 'Status',
        field: 'status',
        type: 'template',
        template: ({ record }) => StringHelper.xss`
            <div class="status-${record.status}">
                <i class="fa fa-circle"></i>
                ${record.status}
            </div>
        `
    }
]
```

### 4.2 Resource Assignment Column

**Bron: `resourceassignment/app.module.js`**

```javascript
columns: [
    {
        type: 'resourceassignment',
        width: 250,
        showAvatars: true,
        editor: {
            type: AssignmentField.type,
            picker: {
                height: 350,
                width: 450,
                features: {
                    filterBar: true,
                    group: 'resource.city',
                    headerMenu: false,
                    cellMenu: false
                },
                items: {
                    workTab: {
                        columns: [{
                            text: 'Calendar',
                            field: 'resource.calendar.name',
                            filterable: false,
                            editor: false,
                            width: 85
                        }]
                    }
                }
            }
        }
    }
]
```

### 4.3 Aggregation Column

**Bron: `aggregation-column/app.module.js`**

```javascript
columns: [
    {
        type: 'aggregate',
        text: 'Total Cost',
        field: 'cost',
        sum: 'sum',  // 'sum', 'avg', 'min', 'max', 'count'
        renderer: ({ value }) => `$${value.toFixed(2)}`
    }
]
```

### 4.4 Color Picker Column

```javascript
columns: [
    {
        type: 'eventColor',
        text: 'Color',
        width: 80
    }
]

// Of met showTaskColorPickers config
const gantt = new Gantt({
    showTaskColorPickers: true  // Toont color field in editor en menu
});
```

---

## 5. Custom Widget Registration

### 5.1 Custom Grid Tab

**Bron: `taskeditor/app.module.js`**

```javascript
class FilesTab extends Grid {
    // Factoryable type name - BELANGRIJK voor registratie
    static type = 'filestab';

    static configurable = {
        title: 'Files',
        defaults: {
            labelWidth: 200
        },
        columns: [{
            text: 'Files attached to task',
            field: 'name',
            type: 'template',
            template: data => StringHelper.xss`
                <i class="fa fa-fw fa-${data.record.data.icon}"></i>
                ${data.record.data.name}
            `
        }]
    };

    // Wordt aangeroepen door TaskEditor bij task load
    loadEvent(eventRecord) {
        this.store.data = this.generateFiles(eventRecord);
    }

    generateFiles(task) {
        // Generate mock files voor demo
        return [
            { name: 'Document.pdf', icon: 'file-pdf' },
            { name: 'Image.png', icon: 'image' }
        ];
    }
}

// KRITIEK: Registreer widget bij Factory
FilesTab.initClass();
```

### 5.2 Custom List Widget

```javascript
class ResourceList extends List {
    static type = 'resourcelist';

    static get configurable() {
        return {
            cls: 'b-inline-list',
            items: [],
            itemTpl: resource => StringHelper.xss`
                <img src="images/${resource.name.toLowerCase()}.png">
                <div class="b-resource-detail">
                    <div class="b-resource-name">${resource.name}</div>
                    <div class="b-resource-city">
                        ${resource.city}
                        <i data-btip="Remove" class="b-icon b-icon-trash"></i>
                    </div>
                </div>
            `
        };
    }

    // Load data when TaskEditor loads a task
    loadEvent(taskRecord) {
        this.taskRecord = taskRecord;
        this.store.data = taskRecord.resources;
    }

    // Handle item clicks
    onItem({ event, record }) {
        if (event.target.matches('.b-icon-trash')) {
            this.taskRecord.unassign(record);
            this.store.data = this.taskRecord.resources;
        }
    }
}

ResourceList.initClass();
```

### 5.3 Custom Editor Widget

**Bron: `custom-taskbar/app.module.js`**

```javascript
class HourEditor extends Widget {
    static type = 'houreditor';

    static configurable = {
        tag: 'input',
        attributes: {
            type: 'number',
            min: 0,
            step: 0.5
        }
    };

    get value() {
        return parseFloat(this.element.value) || 0;
    }

    set value(val) {
        this.element.value = val;
    }

    // Focus handling voor cell editing
    focus() {
        this.element.focus();
        this.element.select();
    }
}

HourEditor.initClass();

// Gebruik als cell editor
columns: [
    {
        text: 'Hours Worked',
        field: 'hoursWorked',
        editor: {
            type: 'houreditor'
        }
    }
]
```

---

## 6. Toolbar Patterns

### 6.1 Standaard Toolbar

```javascript
const gantt = new Gantt({
    tbar: [
        // Zoom controls
        {
            type: 'button',
            icon: 'fa fa-search-plus',
            tooltip: 'Zoom in',
            onAction() {
                gantt.zoomIn();
            }
        },
        {
            type: 'button',
            icon: 'fa fa-search-minus',
            tooltip: 'Zoom out',
            onAction() {
                gantt.zoomOut();
            }
        },

        // Separator
        '|',

        // Toggle switches
        {
            type: 'slidetoggle',
            label: 'Critical path',
            checked: false,
            onChange({ checked }) {
                gantt.features.criticalPaths.disabled = !checked;
            }
        },

        // Spacer pushes items naar rechts
        '->',

        // Right-aligned items
        {
            type: 'button',
            text: 'Export PDF',
            onAction() {
                gantt.features.pdfExport.export();
            }
        }
    ]
});
```

### 6.2 Resource Filter Toolbar

**Bron: `resourceassignment/app.module.js`**

```javascript
tbar: [
    {
        type: 'resourcecombo',
        placeholder: 'Show tasks assigned to:',
        width: 250,
        multiSelect: true,
        store: project.resourceStore.chain(),  // Chained store

        onChange({ source }) {
            const selectedResources = source.records;

            if (selectedResources.length === 0) {
                gantt.taskStore.removeFilter('resource');
            }
            else {
                gantt.taskStore.filter({
                    id: 'resource',
                    filterBy: task => task.resources.some(
                        resource => selectedResources.includes(resource)
                    )
                });
            }
        }
    }
]
```

### 6.3 State Toggle Toolbar

**Bron: `state/app.module.js`**

```javascript
tbar: [
    {
        type: 'slidetoggle',
        ref: 'autoSaveCheckbox',
        label: 'Auto save',
        value: true,
        onChange({ checked }) {
            gantt.stateId = checked ? 'mainGantt' : null;
        }
    },
    {
        type: 'button',
        ref: 'resetButton',
        icon: 'fa fa-times',
        rendition: 'outlined',
        text: 'Reset to default',
        tooltip: 'Resets application to the default state',
        onAction() {
            gantt.resetDefaultState();
            Toast.show('Default state restored');
        }
    }
]
```

---

## 7. Filter en Search Patterns

### 7.1 FilterBar Feature

```javascript
const gantt = new Gantt({
    features: {
        filterBar: true  // Adds filter row under header
    }
});
```

### 7.2 Custom Filter Function

```javascript
// Filter op meerdere velden
gantt.taskStore.filter({
    id: 'customFilter',
    filterBy: task => {
        const searchTerm = searchInput.value.toLowerCase();

        return task.name.toLowerCase().includes(searchTerm) ||
               task.note?.toLowerCase().includes(searchTerm) ||
               task.resources.some(r =>
                   r.name.toLowerCase().includes(searchTerm)
               );
    }
});

// Remove filter
gantt.taskStore.removeFilter('customFilter');
```

### 7.3 Chained Store voor Filter UI

```javascript
// Maak chained store voor combo/list
const filteredResources = project.resourceStore.chain({
    // Automatisch sync met parent
    chainedFields: ['name', 'city'],

    // Custom filter
    filters: [{
        property: 'active',
        value: true
    }]
});

// Gebruik in combo
{
    type: 'combo',
    store: filteredResources,
    displayField: 'name',
    valueField: 'id'
}
```

---

## 8. State Persistence Patterns

### 8.1 LocalStorage State

**Bron: `state/app.module.js`**

```javascript
import { StateProvider, Gantt } from '@bryntum/gantt';

// Setup state provider
StateProvider.setup('local');  // 'local' = localStorage

const gantt = new Gantt({
    // Unieke ID voor state opslag
    stateId: 'mainGantt',

    // Welke state opslaan
    stateful: [
        'columns',      // Column widths, order, visibility
        'subGrids',     // Subgrid widths
        'scroll',       // Scroll position
        'zoomLevel',    // Current zoom
        'selectedCell'  // Selection
    ],

    // Explicit column IDs voor stabiele state
    columns: [
        { id: 'name', type: 'name', width: 250 },
        { id: 'startDate', type: 'startdate', width: 150 },
        { id: 'duration', type: 'duration', width: 150 }
    ]
});
```

### 8.2 Backend State

```javascript
class BackendState {
    constructor(stateProvider) {
        this.stateProvider = stateProvider;
    }

    async init() {
        // Laad state van server
        const response = await AjaxHelper.get('/api/state');
        this.stateProvider.data = await response.json();

        // Luister naar changes
        this.stateProvider.on({
            save: this.onSave.bind(this)
        });
    }

    async onSave() {
        this.stateData = this.stateProvider.data;

        if (!this.saving) {
            await this.save();
        }
    }

    async save() {
        this.saving = true;
        try {
            while (this.stateData) {
                const data = this.stateData;
                this.stateData = null;
                await this.saveChanges(data);
            }
        }
        finally {
            this.saving = false;
        }
    }

    async saveChanges(data) {
        await AjaxHelper.post('/api/state', { data });
    }
}

// Gebruik
const stateProvider = StateProvider.setup('memory');
await new BackendState(stateProvider).init();
```

### 8.3 Reset State

```javascript
// Reset naar defaults
gantt.resetDefaultState();

// Of clear alle state
StateProvider.instance.clear();
```

---

## 9. Multi-Component Patterns

### 9.1 Gantt + TaskBoard

**Bron: `gantt-taskboard/app.module.js`**

```javascript
import { Gantt, TaskBoard, ProjectModel } from '@bryntum/gantt';

// Gedeeld project
const project = new ProjectModel({
    loadUrl: 'data/tasks.json'
});

const gantt = new Gantt({
    appendTo: 'gantt-container',
    project,  // Zelfde project
    // ...
});

const taskBoard = new TaskBoard({
    appendTo: 'taskboard-container',
    project,  // Zelfde project - automatisch sync

    columnField: 'status',
    columns: [
        { id: 'todo', text: 'To Do' },
        { id: 'inprogress', text: 'In Progress' },
        { id: 'done', text: 'Done' }
    ]
});

// Wijzigingen in TaskBoard reflecteren automatisch in Gantt
```

### 9.2 Gantt + Resource Histogram

```javascript
const gantt = new Gantt({
    appendTo: 'gantt',
    project,
    // ...
});

const histogram = new ResourceHistogram({
    appendTo: 'histogram',
    project,  // Zelfde project

    // Koppel scroll en zoom
    partner: gantt
});

// Of handmatig koppelen
histogram.addPartner(gantt);
```

### 9.3 Gantt + Scheduler Pro

**Bron: `gantt-schedulerpro/app.module.js`**

```javascript
// Synchroniseer twee scheduling views
const schedulerPro = new SchedulerPro({
    project: gantt.project,  // Deel project
    partner: gantt,          // Sync scroll/zoom

    // Map task store to event store
    eventStore: gantt.taskStore
});
```

---

## 10. Data Loading Patterns

### 10.1 Auto Load

```javascript
const project = new ProjectModel({
    autoLoad: true,
    transport: {
        load: {
            url: '/api/gantt/load'
        }
    }
});
```

### 10.2 Manual Load

```javascript
const project = new ProjectModel({
    transport: {
        load: { url: '/api/gantt/load' }
    }
});

// Later laden
await project.load();

// Of met specifieke data
await project.loadInlineData({
    tasksData: [...],
    dependenciesData: [...],
    resourcesData: [...]
});
```

### 10.3 Lazy Loading (Infinite Scroll)

**Bron: `infinite-scroll/app.module.js`**

```javascript
const gantt = new Gantt({
    infiniteScroll: true,
    bufferCoef: 5,

    project: {
        transport: {
            load: {
                url: '/api/tasks',
                // Server-side paging
                paramName: 'filter'
            }
        }
    },

    listeners: {
        // Trigger load bij scroll
        visibleDateRangeChange({ new: range }) {
            this.project.load({
                startDate: range.startDate,
                endDate: range.endDate
            });
        }
    }
});
```

### 10.4 Response Validation

```javascript
const project = new ProjectModel({
    // Development helper - log validation errors
    validateResponse: true,

    loadUrl: '/api/gantt/load'
});
```

---

## 11. Rendering Customization

### 11.1 Task Renderer

**Bron: `custom-taskbar/app.module.js`**

```javascript
const gantt = new Gantt({
    taskRenderer({ taskRecord, renderData }) {
        // renderData bevat task bar styling
        renderData.style = `background: ${taskRecord.eventColor}`;

        // Return DomConfig of string
        return {
            tag: 'div',
            class: 'custom-task-content',
            children: [
                {
                    tag: 'span',
                    class: 'task-name',
                    text: taskRecord.name
                },
                {
                    tag: 'span',
                    class: 'task-progress',
                    text: `${taskRecord.percentDone}%`
                }
            ]
        };
    }
});
```

### 11.2 Labels Feature

```javascript
features: {
    labels: {
        left: {
            field: 'name',
            renderer: ({ taskRecord }) =>
                StringHelper.xss`<b>${taskRecord.name}</b>`
        },
        right: {
            field: 'percentDone',
            renderer: ({ taskRecord }) =>
                `${taskRecord.percentDone}%`
        },
        top: {
            renderer: ({ taskRecord }) =>
                taskRecord.resources.map(r => r.name).join(', ')
        }
    }
}
```

### 11.3 Milestone Renderer

```javascript
taskRenderer({ taskRecord, renderData }) {
    if (taskRecord.isMilestone) {
        renderData.iconCls = 'fa fa-flag';
        return {
            tag: 'div',
            class: 'milestone-content',
            html: `<i class="fa fa-star"></i> ${taskRecord.name}`
        };
    }
    return taskRecord.name;
}
```

---

## 12. Cross-References

### Gerelateerde Documenten

| Document | Relevante Secties |
|----------|-------------------|
| [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) | Widget types, TaskEditor |
| [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) | DomConfig, renderers |
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | Store operations |
| [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) | React patterns |
| [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md) | Data sync |

### Demo Locaties

```
C:\Users\Mick\Downloads\bryntum-gantt-trial\gantt-7.1.0-trial\examples\

Belangrijke demos:
├── taskeditor/           # Custom TaskEditor tabs en widgets
├── custom-taskbar/       # Custom TaskModel en renderers
├── resourceassignment/   # Resource filtering en columns
├── state/                # State persistence
├── gantt-taskboard/      # Multi-component sync
├── infinite-scroll/      # Lazy loading
└── frameworks/react/     # React patterns
```

### Code Patronen Samenvatting

| Pattern | Demo | Kern Techniek |
|---------|------|---------------|
| Custom TaskModel | `custom-taskbar` | `extends TaskModel`, `static fields` |
| Custom Tab | `taskeditor` | `extends Grid`, `static type`, `loadEvent()` |
| Widget Registration | Alle | `WidgetClass.initClass()` |
| Store Chaining | `resourceassignment` | `store.chain()` |
| State Persistence | `state` | `stateId`, `StateProvider` |
| Multi-View Sync | `gantt-taskboard` | Shared `project` |

---

## Samenvatting Best Practices

### Widget Development

1. **Altijd `static type` definiëren** - Vereist voor Factory registration
2. **Altijd `initClass()` aanroepen** - Registreert widget type
3. **`loadEvent()` implementeren** - Voor TaskEditor integratie
4. **`configurable` gebruiken** - Voor declaratieve config

### Data Patterns

1. **Chained stores voor filters** - Voorkomt mutatie van originele data
2. **Response validation aanzetten** - In development
3. **Explicit column IDs** - Voor stabiele state persistence

### Performance

1. **Lazy loading voor grote datasets**
2. **Buffer coefficients tunen**
3. **Alleen noodzakelijke features enablen**

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
