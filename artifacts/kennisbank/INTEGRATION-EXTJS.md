# Integration Guide: Bryntum Gantt + Sencha Ext JS

> **Implementatie guide** voor het integreren van Bryntum Gantt in Ext JS Modern applicaties met wrapper componenten en event bridging.

---

## Overzicht

De Ext JS integratie maakt het mogelijk om:
- **Wrapper Component** - Bryntum Gantt als Ext.Panel child
- **Property Proxying** - Ext JS getters/setters voor Bryntum properties
- **Event Bridging** - Bryntum events als Ext JS events doorsturen
- **Data Binding** - ViewModel binding naar Gantt properties

---

## 1. Project Setup

### 1.1 Required Files

```
extjsmodern/
├── app.js                    # Application entry
├── app/
│   └── view/
│       ├── Main.js           # Main view met GanttPanel
│       └── MainController.js # View controller
└── Bryntum/
    ├── Compat.js             # Event compatibility fixes
    └── GanttPanel.js         # Ext.Panel wrapper
```

### 1.2 Application Bootstrap

```javascript
/* global Ext */

Ext.Loader.setPath('Bryntum', './Bryntum');

Ext.application({
    name: 'Main',

    requires: [
        'App.view.Main',
        'App.view.MainController',
        'Bryntum.Compat',      // Event fixes eerst
        'Bryntum.GanttPanel'   // Wrapper component
    ],

    launch() {
        Ext.Viewport.add({
            xtype: 'main-view'
        });
    }
});
```

---

## 2. GanttPanel Wrapper Component

### 2.1 Base Class Definition

```javascript
/* global Ext */

Ext.define('Bryntum.GanttPanel', {
    extend: 'Ext.Panel',
    xtype: 'ganttpanel',
    requires: ['Ext.panel.Resizer'],

    layout: 'fit',
    cls: 'bryntum-gantt',

    config: {
        // ProjectModel instance
        project: null,

        // SubGrid sizing
        subGridConfigs: {
            locked: { flex: 1 },
            normal: { flex: 2 }
        },

        // Column definitions
        columns: [],

        // Feature configurations
        features: null,

        // View preset string of config
        viewPreset: 'weekAndDayLetter',

        // Week start (from Ext.Date)
        weekStartDay: Ext.Date.firstDayOfWeek,

        // Row height (null = CSS controlled)
        rowHeight: null,

        // Dependency display field
        dependencyIdField: 'sequenceNumber'
    }
});
```

### 2.2 Property Export Configuration

```javascript
// Properties die naar Ext.Panel worden geproxied
exportedProperties: {
    // Read-only na creatie
    features: 0,
    subGridConfigs: 0,
    dependencyIdField: 0,
    viewPreset: 0,

    // Read/write properties
    barMargin: 1,
    columns: 1,
    endDate: 1,
    project: 1,
    rowHeight: 1,
    startDate: 1,
    weekStartDay: 1
}
```

---

## 3. Lazy Gantt Initialization

### 3.1 Painted Event Handler

```javascript
initialize: function() {
    const me = this;

    // Wacht tot panel is geschilderd
    me.on({
        single: true,
        painted: function() {
            me.getGantt().render(me.bodyElement.dom);
        }
    });

    me.callParent();
}
```

### 3.2 Gantt Instance Creation

```javascript
getGantt: function() {
    const
        me = this,
        exportedProperties = me.exportedProperties;

    let gantt = me._gantt,
        proto = me.self.prototype,
        cfg, name;

    if (!gantt) {
        // Merge prototype config met instance config
        cfg = Object.assign({}, proto.config, me.initialConfig);

        // Maak Bryntum Gantt instance
        me._gantt = gantt = new bryntum.gantt.Gantt(Ext.copy({
            // Zorgt voor correcte sizing in fit layout
            cls: 'x-layout-fit-item'
        }, cfg, Object.keys(exportedProperties)));

        // Bridge alle events naar Ext JS
        gantt.on({
            catchAll: me.onGanttEvent,
            thisObj: me,
            prio: 100
        });

        // Genereer getters/setters
        if (!me.propertiesExported) {
            for (name in exportedProperties) {
                me.createPropertyProxy(proto, name, exportedProperties[name]);
            }
            proto.propertiesExported = true;
        }
    }

    return gantt;
}
```

---

## 4. Property Proxying

### 4.1 Dynamic Getter/Setter Creation

```javascript
createPropertyProxy: function(proto, name, writable) {
    const capName = Ext.String.capitalize(name);

    // Getter: getRowHeight(), getColumns(), etc.
    proto['get' + capName] = function() {
        return (this._gantt || this.getGantt())[name];
    };

    // Setter (alleen voor writable properties)
    if (writable) {
        proto['set' + capName] = function(value) {
            (this._gantt || this.getGantt())[name] = value;
        };
    }
}
```

### 4.2 Gebruik in Ext JS

```javascript
// Via ViewModel binding
bind: {
    rowHeight: '{rowHeight}'
},

// Programmatisch
const ganttPanel = me.lookup('ganttPanel');
ganttPanel.setRowHeight(50);
console.log(ganttPanel.getStartDate());
```

---

## 5. Event Bridging

### 5.1 CatchAll Event Handler

```javascript
onGanttEvent: function(event) {
    // Forward Bryntum event naar Ext JS event system
    return this.fireEvent(event.type, event);
}
```

### 5.2 Event Listening in Controller

```javascript
Ext.define('App.view.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    listen: {
        component: {
            'ganttpanel': {
                // Bryntum events als Ext JS events
                taskclick: 'onTaskClick',
                taskdblclick: 'onTaskDblClick',
                beforetaskedit: 'onBeforeTaskEdit'
            }
        }
    },

    onTaskClick(event) {
        console.log('Task clicked:', event.taskRecord.name);
    },

    onTaskDblClick(event) {
        // Open custom editor
    },

    onBeforeTaskEdit(event) {
        // Return false to prevent default editor
    }
});
```

---

## 6. Compatibility Layer

### 6.1 Event Name Mapping Fix

```javascript
Ext.define('Bryntum.Compat', {
    override: 'Ext.dom.Element'
},
function(Element) {
    var eventMap = Element.prototype.eventMap;

    if (eventMap) {
        // Fix voor Chrome 79+: gebruik standard events
        // i.p.v. webkit-prefixed events
        delete eventMap.transitionend;
        delete eventMap.animationstart;
        delete eventMap.animationend;
    }
});
```

---

## 7. Main View Implementation

### 7.1 Complete View Definition

```javascript
Ext.define('App.view.Main', {
    extend: 'Ext.Panel',
    alias: 'widget.main-view',
    controller: 'main',
    layout: 'hbox',
    id: 'main-view',

    viewModel: {
        data: {
            rowHeight: 45
        }
    },

    items: [
        // Ext JS Modern List (sidebar)
        {
            xtype: 'panel',
            title: 'Ext JS Modern List',
            width: 250,
            cls: 'ext-list',
            layout: 'fit',
            resizable: {
                split: true,
                edges: 'east'
            },
            items: {
                xtype: 'list',
                itemTpl: '<div class="contact">{firstName} <b>{lastName}</b></div>',
                grouped: true,
                store: {
                    grouper: { property: 'lastName' },
                    data: [
                        { firstName: 'Peter', lastName: 'Venkman' },
                        { firstName: 'Raymond', lastName: 'Stantz' }
                    ]
                }
            }
        },

        // Bryntum Gantt Panel
        {
            title: 'Bryntum Gantt',
            xtype: 'ganttpanel',
            reference: 'ganttPanel',
            flex: 1,
            startDate: new Date(2019, 0, 6),

            project: new bryntum.gantt.ProjectModel({
                autoSetConstraints: true,
                autoLoad: true,
                transport: {
                    load: { url: 'data/project.json' }
                },
                validateResponse: true
            }),

            header: {
                items: [
                    {
                        xtype: 'spinnerfield',
                        label: 'Row height',
                        width: '12.5em',
                        bind: '{rowHeight}',
                        minValue: 20
                    },
                    {
                        xtype: 'button',
                        iconCls: 'fa fa-plus',
                        text: 'Add Task',
                        ui: 'action',
                        handler: 'addTask',
                        cls: 'b-add-task'
                    }
                ]
            },

            // ViewModel binding
            bind: {
                rowHeight: '{rowHeight}'
            },

            // Bryntum features
            features: {
                taskMenu: {
                    items: { convertToMilestone: true },
                    processItems({ taskRecord, items }) {
                        if (taskRecord.isMilestone) {
                            items.convertToMilestone = false;
                        }
                    }
                },
                filter: true,
                dependencyEdit: true,
                timeRanges: {
                    showCurrentTimeLine: true
                },
                labels: {
                    before: {
                        field: 'name',
                        editor: { type: 'textfield' }
                    }
                }
            },

            // Gantt columns
            columns: [
                { type: 'wbs' },
                { type: 'name', width: 250 },
                { type: 'startdate' },
                { type: 'duration' },
                { type: 'percentdone', width: 70 },
                { type: 'successor', width: 112 },
                { type: 'schedulingmodecolumn' },
                { type: 'calendar' },
                { type: 'constrainttype' },
                { type: 'constraintdate' },
                { type: 'date', text: 'Deadline', field: 'deadline' },
                { type: 'addnew' }
            ]
        }
    ]
});
```

---

## 8. Controller Actions

### 8.1 Task Management

```javascript
Ext.define('App.view.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    addTask() {
        const
            ganttPanel = this.lookup('ganttPanel'),
            gantt = ganttPanel.getGantt(),
            project = gantt.project;

        // Voeg task toe aan root
        project.taskStore.rootNode.appendChild({
            name: 'New Task',
            duration: 5,
            durationUnit: 'd'
        });
    },

    removeSelectedTasks() {
        const
            ganttPanel = this.lookup('ganttPanel'),
            gantt = ganttPanel.getGantt(),
            selectedRecords = gantt.selectedRecords;

        if (selectedRecords.length > 0) {
            selectedRecords.forEach(task => task.remove());
        }
    },

    expandAll() {
        const ganttPanel = this.lookup('ganttPanel');
        ganttPanel.getGantt().expandAll();
    },

    collapseAll() {
        const ganttPanel = this.lookup('ganttPanel');
        ganttPanel.getGantt().collapseAll();
    }
});
```

---

## 9. RTL Support

### 9.1 RTL Detection

```javascript
// app.js
if (location.search.split(/[?&]/).includes('rtl')) {
    document.body.classList.add('b-rtl');
}

// Main.js
const rtl = location.search.split(/[?&]/).includes('rtl');

Ext.define('App.view.Main', {
    // ...
    rtl,  // Property shorthand

    items: [
        {
            xtype: 'panel',
            rtl,  // Propagate naar children
            // ...
        },
        {
            xtype: 'ganttpanel',
            rtl,
            // ...
        }
    ]
});
```

---

## 10. Cleanup

### 10.1 Destroy Handler

```javascript
destroy: function() {
    // Destroy Gantt alleen als het al gemaakt is
    this._gantt && this._gantt.destroy();
    this.callParent();
}
```

---

## 11. Styling Integration

### 11.1 CSS Considerations

```css
/* Ensure Gantt fills panel */
.bryntum-gantt {
    height: 100%;
}

/* Fix for fit layout */
.bryntum-gantt .x-layout-fit-item {
    width: 100%;
    height: 100%;
}

/* Title styling */
.title-link {
    text-decoration: none;
}

.title-link h1 {
    color: #333;
    margin: 0;
    font-size: 1.2em;
}
```

---

## 12. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Initialization | Wacht op `painted` event voor render |
| Properties | Gebruik exportedProperties voor type-safe toegang |
| Events | Gebruik catchAll voor complete event forwarding |
| Cleanup | Destroy Gantt in panel destroy handler |
| Compatibility | Laad Compat.js voor Chrome 79+ fixes |
| RTL | Propageer rtl flag naar alle children |

---

## 13. Migration Notes

### 13.1 Classic vs Modern

| Aspect | Classic Toolkit | Modern Toolkit |
|--------|----------------|----------------|
| Base class | `Ext.panel.Panel` | `Ext.Panel` |
| Body element | `body.dom` | `bodyElement.dom` |
| Initialization | `afterRender` | `painted` event |
| Layout | `layout: 'fit'` | `layout: 'fit'` |

---

## 14. Ext JS Gantt naar Bryntum Gantt Migratie

### 14.1 Architectuur Verschillen

| Ext JS Gantt | Bryntum Gantt | Toelichting |
|--------------|---------------|-------------|
| `Ext.Application` | Geen framework | Bryntum is framework-agnostisch |
| `Ext.Viewport` | CSS flexbox | Layout via standaard CSS |
| Plugins & Features | Alleen Features | Alles is nu een feature |
| `TaskStore` scheduling | `ProjectModel` | Project orchestreert berekeningen |
| `xtype` | `type` | Widget type aanduiding |

### 14.2 Config Migratie

```javascript
// EXT JS GANTT CONFIG
Ext.define('Gnt.examples.advanced.view.Gantt', {
    showTodayLine           : true,           // → TimeRanges feature
    loadMask                : true,           // Ongewijzigd
    enableProgressBarResize : true,           // → PercentBar feature (default true)
    showRollupTasks         : true,           // → Rollups feature
    rowHeight               : 30,             // Ongewijzigd
    viewPreset              : 'weekAndDayLetter', // Ongewijzigd
    allowDeselect           : true,           // Altijd enabled in Bryntum

    lockedGridConfig : {                      // → subGridConfigs
        width : 400
    },

    taskBodyTemplate : '...',                 // Vervallen, gebruik taskRenderer

    leftLabelField : {                        // → Labels feature
        dataIndex : 'Name',
        editor    : { xtype : 'textfield' }
    }
});

// BRYNTUM GANTT CONFIG
const gantt = new Gantt({
    rowHeight : 30,
    barMargin : 3,  // Default verschilt van Ext Gantt
    viewPreset : 'weekAndDayLetter',

    features : {
        timeRanges : { showCurrentTimeLine : true },
        rollups : true,
        labels : {
            left : {
                field  : 'name',
                editor : { type : 'textfield' }
            }
        }
    },

    subGridConfigs : {
        locked : { width : 400 }
    }
});
```

### 14.3 Plugin naar Feature Mapping

| Ext JS Plugin | Bryntum Feature | Status |
|---------------|-----------------|--------|
| `advanced_taskcontextmenu` | `taskMenu` | Default enabled |
| `scheduler_pan` | `pan` | Moet expliciet enabled |
| `gantt_taskeditor` | `taskEdit` | Default enabled |
| `gantt_projecteditor` | - | Vervallen |
| `gridfilters` | `filter` | Default enabled |
| `gantt_progressline` | `progressLine` | Beschikbaar |
| `gantt_dependencyeditor` | `dependencyEdit` | Beschikbaar |
| `scheduler_treecellediting` | `cellEdit` | Default enabled |
| `gantt_clipboard` | `cellCopyPaste` / `taskCopyPaste` | Beschikbaar |

### 14.4 Data Formaat Wijzigingen

```javascript
// VELD NAAM MAPPING - Ext JS → Bryntum
const fieldMapping = {
    'Id'                : 'id',
    'Name'              : 'name',
    'StartDate'         : 'startDate',
    'EndDate'           : 'endDate',
    'Duration'          : 'duration',
    'PercentDone'       : 'percentDone',
    'TaskId'            : 'event',        // Assignments
    'ResourceId'        : 'resource',     // Assignments
    'From'              : 'fromTask',     // Dependencies
    'To'                : 'toTask'        // Dependencies
};
```

### 14.5 Scheduling Modes

| Ext JS Mode | Bryntum Mode | Equivalent |
|-------------|--------------|------------|
| `Normal` | `Normal` | Gelijk |
| `EffortDriven` | `FixedEffort` | Hernoemd |
| `DynamicAssignment` | `FixedDuration` + `effortDriven: true` | Gecombineerd |
| - | `FixedUnits` | Nieuw in Bryntum |

### 14.6 Calendar Formaat

```json
// EXT JS CALENDAR FORMAT
{
    "Days": [
        { "Weekday": 0, "IsWorkingDay": false },
        { "Weekday": 6, "IsWorkingDay": false }
    ],
    "DefaultAvailability": ["08:00-12:00", "13:00-17:00"]
}

// BRYNTUM CALENDAR FORMAT
{
    "id": "general",
    "name": "General",
    "intervals": [
        {
            "recurrentStartDate": "on Sat",
            "recurrentEndDate": "on Mon",
            "isWorking": false
        },
        {
            "name": "Holiday",
            "startDate": "2024-12-25",
            "endDate": "2024-12-26",
            "isWorking": false
        }
    ]
}
```

### 14.7 Baselines Formaat

```json
// EXT JS FORMAT
{
    "id": 1,
    "name": "Task 1",
    "BaselineStartDate": "2024-01-15",
    "BaselineEndDate": "2024-01-30"
}

// BRYNTUM FORMAT
{
    "id": 1,
    "name": "Task 1",
    "baselines": [
        {
            "startDate": "2024-01-15",
            "endDate": "2024-01-30"
        }
    ]
}
```

### 14.8 Custom TaskModel

```javascript
// BRYNTUM CUSTOM TASK MODEL
import { TaskModel } from '@bryntum/gantt';

class CustomTaskModel extends TaskModel {
    static $name = 'CustomTaskModel';

    static fields = [{
        name: 'customField',
        type: 'string'
    }];
}

// Gebruik in Project
const project = new ProjectModel({
    taskModelClass: CustomTaskModel,
    // ...
});

// Task Editor Customization
features: {
    taskEdit: {
        items: {
            generalTab: {
                items: {
                    customField: {
                        type: 'textfield',
                        label: 'Custom',
                        name: 'customField',
                        weight: 150
                    }
                }
            }
        }
    }
}
```

### 14.9 Localisatie Setup

```javascript
// 1. Maak locale bestanden aan
// locales/locale.Nl.js
import { LocaleHelper } from '@bryntum/gantt';
import '@bryntum/gantt/locales/gantt.locale.Nl';

const locale = {
    localeName: 'Nl',
    localeDesc: 'Nederlands',
    localeCode: 'nl-NL',

    // Applicatie-specifieke vertalingen
    GanttToolbar: {
        'Add task': 'Taak toevoegen',
        'Remove task': 'Taak verwijderen'
    }
};

export default LocaleHelper.publishLocale(locale);

// 2. Import in applicatie
import './locales/locale.Nl';

// 3. Locale wisselen
LocaleManager.applyLocale('Nl');
```

### 14.10 Theming

```css
/* Beschikbare thema's */
@import '@bryntum/gantt/svalbard-light.css';  /* Default */
@import '@bryntum/gantt/svalbard-dark.css';
@import '@bryntum/gantt/visby-light.css';
@import '@bryntum/gantt/visby-dark.css';
@import '@bryntum/gantt/stockholm-light.css';
@import '@bryntum/gantt/stockholm-dark.css';
@import '@bryntum/gantt/material2-light.css';
@import '@bryntum/gantt/material2-dark.css';
@import '@bryntum/gantt/fluent2-light.css';
@import '@bryntum/gantt/fluent2-dark.css';

/* Runtime theme switching */
DomHelper.setTheme('visby-dark');
```

### 14.11 Calendar Duration Conversion Restore

```javascript
// Restore per-calendar duration conversion (Ext Gantt gedrag)
import { DurationConverterMixin, CalendarModel, DependencyModel, TaskModel } from '@bryntum/gantt';

class MyCalendarModel extends DurationConverterMixin.derive(CalendarModel) {}

class MyDependencyModel extends DependencyModel {
    *convertLagGen(duration, fromUnit, toUnit) {
        const converter = yield this.$.calendar;
        return yield* converter.$convertDuration(duration, fromUnit, toUnit);
    }
}

class MyTaskModel extends TaskModel {
    *convertDurationGen(duration, fromUnit, toUnit) {
        const converter = yield this.$.effectiveCalendar;
        return yield* converter.$convertDuration(duration, fromUnit, toUnit);
    }
}

new Gantt({
    project: {
        calendarModelClass: MyCalendarModel,
        taskModelClass: MyTaskModel,
        dependencyModelClass: MyDependencyModel
    }
});
```

### 14.12 Event Renderer Migratie

```javascript
// EXT JS EVENT RENDERER
eventRenderer: function(task, tplData) {
    if (task.get('Color')) {
        return {
            style: `background-color: #${task.get('Color')}`
        };
    }
}

// BRYNTUM TASK RENDERER
taskRenderer({ taskRecord, renderData }) {
    if (taskRecord.color) {
        renderData.style = `background-color: ${taskRecord.color}`;
    }
    return taskRecord.name;
}
```

---

## 15. Vite Build Setup

### 15.1 Project Creatie

```bash
# Maak Vite project
npm create vite@latest ext-migration
cd ext-migration

# Selecteer: Vanilla + JavaScript

# Installeer Bryntum
npm i @bryntum/gantt
```

### 15.2 Main.js Entry Point

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';
import './style.css';

const project = new ProjectModel({
    transport: {
        load: { url: 'data/load.json' }
    },
    autoLoad: true,
    stm: { autoRecord: true }  // Undo/Redo support
});

const gantt = new Gantt({
    appendTo: 'app',
    project,
    startDate: '2024-01-08',

    features: {
        labels: {
            left: { field: 'name' }
        }
    },

    columns: [
        { type: 'wbs' },
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'enddate' },
        { type: 'duration' }
    ]
});
```

### 15.3 Style.css

```css
@import './node_modules/@bryntum/gantt/gantt.css';
@import './node_modules/@bryntum/gantt/svalbard-light.css';

body {
    padding: 0;
    margin: 0;
    font-family: sans-serif;
}

#app {
    height: 100vh;
}
```

---

## Zie Ook

- [INTEGRATION-AG-GRID.md](./INTEGRATION-AG-GRID.md) - AG Grid interoperability
- [GANTT-IMPL-COLUMNS.md](./GANTT-IMPL-COLUMNS.md) - Column configuratie
- [GANTT-API-PROJECTMODEL.md](./GANTT-API-PROJECTMODEL.md) - Project data management
- [SCHEDULER-IMPL-EVENTS.md](./SCHEDULER-IMPL-EVENTS.md) - Event handling

---

*Track C2.3 - Third-party Integraties - ExtJS Modern*
