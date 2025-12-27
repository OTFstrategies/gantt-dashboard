# BRYNTUM CODE PATTERNS - Complete Reference

> Extracted from 13 key demo files across Gantt, SchedulerPro, and Grid

---

## 1. CONFIGURATION OBJECT PATTERNS

### Primary Widget Configuration Structure

```javascript
const widget = new Widget({
    // Positioning & Layout
    appendTo : 'container',
    flex     : '1 1 50%',
    minHeight: 0,

    // Data Management
    project  : { ... },
    store    : { ... },

    // Display Configuration
    startDate      : new Date(...),
    endDate        : new Date(...),
    viewPreset     : 'hourAndDay',
    rowHeight      : 70,
    barMargin      : 15,
    eventStyle     : 'tonal',

    // Features (organized sub-object)
    features : {
        featureName : {
            disabled   : false,
            // feature-specific config
        }
    },

    // UI Elements
    columns : [...],
    tbar    : [...],
    bbar    : [...],

    // Behavioral Configuration
    selectionMode : {
        cell       : true,
        dragSelect : true
    },

    // Event Handling
    listeners : {...},

    // Custom Renderers
    renderer : function() {...}
});
```

### Nested Configuration

```javascript
features : {
    taskEdit : {
        editorConfig : {
            width : '50em'
        },
        items : {
            subTaskTab : {
                type   : 'subtasktab',
                weight : 110
            }
        }
    },
    eventTooltip : {
        template : data => `...`
    }
}
```

---

## 2. FEATURE CONFIGURATION PATTERNS

### Dependencies Feature

```javascript
features : {
    dependencies : {
        radius                             : 10,
        clickWidth                         : 5,
        showLagInTooltip                   : true,
        highlightDependenciesOnEventHover  : true,
        terminalOffset                     : 0,
        terminalSize                       : 12,
        terminalShowDelay                  : 100,
        terminalHideDelay                  : 300,
        drawOnScroll                       : true,
        drawOnEventInteraction             : true,
        enableDependencyDelete             : true,
        showTooltip                        : false
    }
}
```

### Labels Feature

```javascript
features : {
    labels : {
        before : {
            field  : 'name',
            editor : { type : 'textfield' }
        },
        top : {
            renderer({ taskRecord }) {
                return {
                    tag     : 'div',
                    dataset : { btip : `${taskRecord.totalHoursWorked}h` },
                    children : [
                        taskRecord.name,
                        { tag : 'i', class : 'fa fa-clock' },
                        String(taskRecord.totalHoursWorked) + 'h'
                    ]
                };
            }
        }
    }
}
```

### RowExpander Feature (Grid)

```javascript
features : {
    rowExpander : {
        widget : {
            cls        : 'custom-class',
            type       : 'grid',
            autoHeight : true,
            columns    : [...],
            bbar       : [...]
        },
        dataField : 'relatedRecordField'
    }
}
```

### Dynamic Feature Toggle

```javascript
gantt.features.dependencies.disabled = !gantt.features.dependencies.disabled;
gantt.features.cellEdit.disabled = !gantt.features.cellEdit.disabled;
```

---

## 3. COLUMN DEFINITIONS

### Basic Columns

```javascript
columns : [
    { type : 'name', width : 250 },
    { type : 'sequence', text : '#' },
    { type : 'predecessor', width : 112 },
    { type : 'successor', width : 112 },
    { type : 'startdate' },
    { type : 'duration' },
    { type : 'resourceassignment', width : 120, showAvatars : true },
    { type : 'percentdone', mode : 'circle', width : 70 }
]
```

### Custom Renderer Columns

```javascript
columns : [
    {
        text       : 'Name',
        field      : 'name',
        flex       : 1,
        htmlEncode : false,
        renderer   : ({ value, record, row }) => {
            return `<div>${StringHelper.encodeHtml(value)}</div>`;
        },
        headerRenderer : () => {
            return `<label>Name</label><button>ADD</button>`;
        }
    },
    {
        text       : 'Resource',
        field      : 'name',
        htmlEncode : false,
        renderer   : ({ record }) => ({
            children : [
                record.icon ? {
                    tag       : 'i',
                    className : `fa fa-fw ${record.icon}`,
                    style     : 'margin-right: .5em'
                } : null,
                record.name
            ]
        })
    }
]
```

### Editor Configuration

```javascript
{
    type  : 'resourceassignment',
    width : 250,
    editor : {
        type   : AssignmentField.type,
        picker : {
            height   : 350,
            width    : 450,
            features : {
                filterBar  : true,
                group      : 'resource.city',
                headerMenu : false
            }
        }
    }
}
```

### Column with Styling

```javascript
{
    text            : 'Color',
    field           : 'color',
    flex            : 1,
    htmlEncode      : false,
    alwaysClearCell : false,
    renderer        : ({ value = '', cellElement }) => {
        cellElement.innerHTML = StringHelper.xss`<div class="color-box"></div>${value}`;
        cellElement.firstElementChild.style.setProperty(
            '--b-primary',
            `var(--b-color-${value.toLowerCase()})`
        );
    }
}
```

---

## 4. EVENT LISTENERS

### Inline Listener Configuration

```javascript
listeners : {
    async scheduleClick({ taskRecord, event }) {
        if (taskRecord.isLeaf && event.target.matches('.b-day-hours')) {
            this.hourEditor.onHourCellClick(taskRecord, event.target);
        }
    },

    visibleDateRangeChange() {
        if (this.hourEditor?.isVisible) {
            this.hourEditor.cancelEdit();
        }
    },

    paint({ firstPaint }) {
        if (firstPaint) {
            // Initialize on first paint
        }
    },

    renderRows : ({ source }) => {
        source.features.rowExpander.expand(source.store.getAt(2));
    },

    once : true // Execute only once
}
```

### String Reference Handlers

```javascript
tbar : {
    items : {
        addTaskButton : {
            onAction : 'up.onAddTaskClick'
        },
        expandAllButton : {
            onAction : 'up.onExpandAllClick'
        }
    }
}
```

### Feature Listeners

```javascript
features : {
    taskEdit : {
        listeners : {
            beforeTaskEditShow({ taskRecord, editor }) {
                editor.widgetMap.subTaskTab.disabled = !taskRecord.isParent;
            }
        }
    }
}
```

### Store Event Listeners

```javascript
this.grid.store.on({
    change  : 'onStoreChange',
    thisObj : this
});
```

---

## 5. CUSTOM RENDERERS

### String Renderer (Simple)

```javascript
renderer({ record }) {
    const status = record.status;
    return status ? [{
        tag       : 'i',
        className : `fa fa-circle ${status}`
    }, status] : '';
}
```

### DOM Config Object (Performant)

```javascript
renderer : ({ record }) => ({
    children : [
        record.icon ? {
            tag       : 'i',
            className : `fa fa-fw ${record.icon}`,
            style     : 'margin-right: .5em'
        } : null,
        record.name
    ]
})
```

### XSS-Safe Template

```javascript
renderer : ({ value = '' }) => StringHelper.xss`<div class="badge">${value}</div>`
```

### Event Renderer (SchedulerPro)

```javascript
eventRenderer({ eventRecord, renderData }) {
    renderData.cls.highlight = eventRecord.highlight;
    return StringHelper.encodeHtml(eventRecord.name);
}
```

### TreeGrid Renderer with Conditional Logic

```javascript
renderer({ value, record, row }) {
    if (record instanceof Terminal) {
        row.addCls('terminal');
        return `${StringHelper.encodeHtml(value)}<div class="lounge-list">
            <div>Lounges</div>
            <ul>
                ${record.lounges?.map(name => `<li>
                    <i class="fa fa-martini-glass"></i>${StringHelper.encodeHtml(name)}
                </li>`).join('')}
            </ul>
        </div>`;
    }
    return `<div>${StringHelper.encodeHtml(value)}</div>`;
}
```

---

## 6. CUSTOM MODELS

### Custom TaskModel (Gantt)

```javascript
class Task extends TaskModel {
    static $name = 'Task';

    static get fields() {
        return [
            { name : 'projectConstraintResolution', defaultValue : 'conflict' },
            'status',
            { name : 'complexity', type : 'number' }
        ];
    }

    get isLate() {
        return !this.isCompleted && this.deadlineDate && Date.now() > this.deadlineDate;
    }

    get status() {
        if (this.isCompleted) return 'Completed';
        if (this.isLate) return 'Late';
        if (this.isStarted) return 'Started';
        return 'Not started';
    }
}

// Use in project
const project = new ProjectModel({
    taskModelClass : Task
});
```

### Custom EventModel (SchedulerPro)

```javascript
class FixedDurationEvent extends EventModel {
    static fields = [
        { name : 'schedulingMode', defaultValue : 'FixedDuration' }
    ];
}

const project = new ProjectModel({
    eventModelClass : FixedDurationEvent
});
```

### Custom GridRowModel with Relations

```javascript
class Employee extends GridRowModel {
    static fields = [
        'id', 'firstName', 'name',
        { name : 'start', type : 'date' },
        'email'
    ];

    get unattested() {
        return this.timeRows?.reduce((acc, r) => acc + (r.attested ? 0 : 1), 0);
    }

    get totalTime() {
        return this.timeRows?.reduce((acc, r) => acc + r.hours, 0);
    }
}

class TimeRow extends GridRowModel {
    static fields = ['id', 'employeeId', 'project', 'hours', 'attested'];

    static relations = {
        employee : {
            foreignKey             : 'employeeId',
            foreignStore           : 'employeeStore',
            relatedCollectionName  : 'timeRows',
            propagateRecordChanges : true
        }
    };
}
```

### Model with Complex Calculated Fields

```javascript
class MyTask extends TaskModel {
    static fields = [
        'totalHoursWorked',
        { name : 'hoursWorked', type : 'array' }
    ];

    get workedHoursByDay() {
        const { startDate, endDate, isParent, duration } = this;
        const { calendar } = this.project;

        if (!startDate || !endDate || !duration || !calendar) {
            return [];
        }

        // Cache by start + duration
        if (!isParent && this._workedHoursByDay?.duration === duration) {
            return this._workedHoursByDay;
        }

        const durationInDays = DateHelper.getDurationInUnit(startDate, endDate, 'd');
        const workedHoursByDay = Array(durationInDays || 0).fill(0);

        // Calculate...
        this._workedHoursByDay = workedHoursByDay;
        return workedHoursByDay;
    }

    setHoursWorked(dayIndex, hours) {
        const newValue = this._workedHoursByDay.slice();
        newValue[dayIndex] = hours;
        this._workedHoursByDay = null;
        this.hoursWorked = newValue;
    }

    get totalHoursWorked() {
        return this.workedHoursByDay.reduce((total, value) => total + (value || 0), 0);
    }
}
```

---

## 7. STORE CONFIGURATION

### Basic Store (Gantt/SchedulerPro)

```javascript
const project = new ProjectModel({
    autoLoad           : true,
    loadUrl            : '../_datasets/launch-saas.json',
    validateResponse   : true,
    autoSetConstraints : true,
    taskStore : {
        wbsMode : 'auto'
    }
});
```

### Store with Custom Fields

```javascript
project : {
    autoLoad   : true,
    loadUrl    : './data/data.json',
    eventStore : {
        fields : ['highlight']
    }
}
```

### Store Chain for Filtering

```javascript
const resourceCombo = {
    type        : 'resourcecombo',
    placeholder : 'Show tasks assigned to:',
    multiSelect : true,
    store       : project.resourceStore.chain(), // Filtered chain
    onChange({ source }) {
        const selectedResources = source.records;
        if (selectedResources.length === 0) {
            gantt.taskStore.removeFilter('resource');
        }
        else {
            gantt.taskStore.filter({
                id       : 'resource',
                filterBy : task => task.resources.some(
                    resource => selectedResources.includes(resource)
                )
            });
        }
    }
};
```

### Store with Dynamic Model Creation

```javascript
const store = {
    modelClass : Gate,
    readUrl    : 'data/kastrup-airport.json',
    autoLoad   : true,
    createRecord(data) {
        let modelClass = this.modelClass;
        if (data.type === 'terminal') {
            modelClass = Terminal;
        }
        return new modelClass(data, this);
    }
};
```

### Project with STM (Undo/Redo)

```javascript
const project = new ProjectModel({
    autoSetConstraints : true,
    taskModelClass     : Task,
    loadUrl            : '../_datasets/launch-saas-advanced.json',
    autoLoad           : true,
    stm : {
        autoRecord : true
    },
    resetUndoRedoQueuesAfterLoad : true
});
```

---

## 8. TOOLBAR CONFIGURATION

### Simple Toolbar

```javascript
tbar : [
    {
        type    : 'button',
        icon    : 'fa fa-plus',
        text    : 'Create',
        tooltip : 'Create new task',
        onAction: 'up.onAddTaskClick'
    },
    {
        type       : 'buttongroup',
        toggleGroup: true,
        items : {
            ganttButton: { text: 'Gantt', pressed: true }
        }
    }
]
```

### Toolbar with Menu

```javascript
items : {
    featuresButton : {
        type    : 'button',
        icon    : 'fa fa-tasks',
        text    : 'Settings',
        menu    : {
            onItem       : 'up.onFeaturesClick',
            onBeforeShow : 'up.onFeaturesShow',
            items : {
                drawDeps : {
                    text    : 'Draw dependencies',
                    feature : 'dependencies',
                    checked : false
                },
                settings : {
                    text : 'UI settings',
                    menu : {
                        items : {
                            rowHeight : {
                                type    : 'slider',
                                text    : 'Row height',
                                min     : 30,
                                max     : 70,
                                onInput : 'up.onRowHeightChange'
                            }
                        }
                    }
                }
            }
        }
    }
}
```

---

## 9. CUSTOM WIDGETS

### Custom Column Class

```javascript
class ComplexityColumn extends Column {
    static $name         = 'ComplexityColumn';
    static type          = 'complexitycolumn';
    static isGanttColumn = true;
    static defaults      = {
        field   : 'complexity',
        text    : 'Complexity',
        cellCls : 'b-complexity-column-cell',
        editor  : { type : 'complexitycombo' }
    };

    renderer({ column, value }) {
        const { store } = column.editor;
        const complexity = store.getById(value)?.text;
        return complexity ? [{
            tag       : 'i',
            className : `fa fa-square ${complexity}`
        }, complexity] : '';
    }
}

ColumnStore.registerColumnType(ComplexityColumn);
```

### Custom Combo Widget

```javascript
class ComplexityCombo extends Combo {
    static type = 'complexitycombo';

    static configurable = {
        items : [
            { value : 0, text : 'Easy' },
            { value : 1, text : 'Normal' }
        ],
        picker : { minWidth : '8em' },
        listItemTpl : ({ text }) => `<div>
            <i class="fa fa-square ${text}"></i>
            <small>${text}</small>
        </div>`
    };

    get innerElements() {
        return [
            {
                reference : 'icon',
                tag       : 'i',
                style     : { marginInlineStart : '.8em' }
            },
            ...super.innerElements
        ];
    }
}

ComplexityCombo.initClass();
```

### Custom EditorTab Widget

```javascript
class SubtaskTab extends EditorTab {
    static $name = 'SubtaskTab';
    static type = 'subtasktab';

    static configurable = {
        title            : 'Subtasks',
        autoUpdateRecord : false,
        items : {
            subEvents : {
                type  : 'grid',
                name  : 'subEvents',
                flex  : '1 1 auto',
                columns : [
                    { field : 'name', text : 'Name', flex : 1 },
                    { field : 'startDate', text : 'Start', type : 'date' }
                ]
            },
            toolbar : {
                type       : 'toolbar',
                namedItems : {
                    add : {
                        type    : 'button',
                        icon    : 'b-icon b-icon-add',
                        onClick : 'up.onAddClick'
                    }
                }
            }
        }
    };

    set record(record) {
        super.record = record;
        if (record) {
            this.grid.store.loadData(record.children || []);
        }
    }
}

SubtaskTab.initClass();
```

---

## 10. COMMON PATTERNS & BEST PRACTICES

### Suspending/Resuming Refresh

```javascript
onChange({ value }) {
    gantt.suspendRefresh();
    gantt.features.labels.disabled = !value;
    gantt.resourceMargin = value ? 4 : 8;
    gantt.rowHeight = value ? 70 : 40;
    gantt.resumeRefresh(true);
}
```

### Dynamic Store Filtering

```javascript
onChange({ source }) {
    const selectedResources = source.records;
    if (selectedResources.length === 0) {
        gantt.taskStore.removeFilter('resource');
    }
    else {
        gantt.taskStore.filter({
            id       : 'resource',
            filterBy : task => task.resources.some(
                resource => selectedResources.includes(resource)
            )
        });
    }
}
```

### Feature Toggle Pattern

```javascript
// In menu handler
onFeaturesClick({ source : item }) {
    if (item.feature) {
        const feature = gantt.features[item.feature];
        feature.disabled = !feature.disabled;
    }
}

// Sync menu state
onFeaturesShow({ source : menu }) {
    menu.items.forEach(item => {
        if (item.feature && gantt.features[item.feature]) {
            item.checked = !gantt.features[item.feature].disabled;
        }
    });
}
```

### Async Data Loading

```javascript
async onProjectSelected({ record, userAction }) {
    if (userAction) {
        const { gantt } = this;
        await gantt.project.load(record.url);
        gantt.zoomToFit();
        gantt.visibleDate = {
            date  : DateHelper.add(gantt.project.startDate, -1, 'week'),
            block : 'start'
        };
    }
}
```

### Security: String Encoding

```javascript
// Always use StringHelper for user content
renderer : ({ value }) => StringHelper.encodeHtml(value)

// Template literal version
renderer : ({ value }) => StringHelper.xss`<div>${value}</div>`
```

### Splitter Layout

```javascript
new Splitter({
    appendTo    : 'container',
    showButtons : true
});

const scheduler = new SchedulerPro({
    appendTo    : 'container',
    flex        : '1 1 50%',
    collapsible : true
});

const resourceUtil = new ResourceUtilization({
    appendTo    : 'container',
    flex        : '1 1 50%',
    collapsible : true,
    partner     : scheduler
});
```

---

## 11. COMPLETE EXAMPLE

```javascript
import { Gantt, ProjectModel, TaskModel } from '../../build/gantt.module.js';

// 1. Custom Task Model
class Task extends TaskModel {
    static get fields() {
        return [
            'status',
            { name : 'complexity', type : 'number' }
        ];
    }

    get status() {
        if (this.isCompleted) return 'Completed';
        if (this.isStarted) return 'Started';
        return 'Not started';
    }
}

// 2. Project Setup
const project = new ProjectModel({
    autoSetConstraints : true,
    taskModelClass     : Task,
    loadUrl            : '../_datasets/launch-saas.json',
    autoLoad           : true,
    stm : { autoRecord : true }
});

// 3. Gantt Configuration
const gantt = new Gantt({
    appendTo          : 'container',
    project,
    dependencyIdField : 'sequenceNumber',
    startDate         : '2025-01-05',
    endDate           : '2025-03-24',

    columns : [
        { type : 'name', width : 250 },
        {
            text  : 'Status',
            field : 'status',
            renderer({ record }) {
                return record.status ? [{
                    tag       : 'i',
                    className : `fa fa-circle ${record.status.toLowerCase()}`
                }, record.status] : '';
            }
        },
        { type : 'resourceassignment', width : 120, showAvatars : true },
        { type : 'addnew' }
    ],

    features : {
        dependencies : { radius : 3, clickWidth : 5 },
        labels       : { before : { field : 'name' } },
        cellEdit     : true,
        filter       : true
    },

    tbar : [
        {
            type     : 'button',
            icon     : 'fa fa-plus',
            text     : 'Create',
            onAction : 'up.onAddTaskClick'
        }
    ],

    listeners : {
        async dependencyCreate({ dependency }) {
            await project.commitAsync();
        }
    }
});

// 4. Handler Methods
gantt.onAddTaskClick = async function() {
    const added = this.taskStore.rootNode.appendChild({
        name     : 'New task',
        duration : 1
    });
    await this.project.commitAsync();
    await this.scrollRowIntoView(added);
};
```

---

## KEY TAKEAWAYS

| Pattern | Best Practice |
|---------|---------------|
| Configuration | Hierarchical objects with features sub-object |
| Renderers | DOM Config objects for performance |
| Models | Extend base class, use static fields |
| Security | Always use StringHelper.encodeHtml() |
| Events | String references ('up.methodName') |
| Features | Access via widget.features.name.disabled |
| Stores | Use chain() for filtered views |
| Performance | suspendRefresh() for batch updates |
