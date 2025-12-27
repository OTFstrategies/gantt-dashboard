# INTEGRATION-DASHBOARD.md

> **Multi-Widget Dashboard Patterns** - Layout management, responsive design, state persistence, theming en geavanceerde widget architectuur.

---

## Overzicht

Bryntum dashboards combineren meerdere widgets in een coherente interface:
- **Container layouts** - vbox, hbox, en responsive layouts
- **Splitter controls** - Resizable panels met collapse buttons
- **State persistence** - StateProvider voor localStorage en backend
- **Theme management** - Runtime theme switching
- **Custom Panel widgets** - Uitbreidbare sidebar en config panels
- **Nested widgets** - RowExpander voor detail views
- **Cross-widget data** - Store relations en propagation

---

## Container Layouts

### Basis Container Setup

```typescript
import { Container, Splitter, Panel } from '@bryntum/core';
import { Gantt, SchedulerPro, ProjectModel } from '@bryntum/gantt';
import { TaskBoard } from '@bryntum/taskboard';
import { Calendar } from '@bryntum/calendar';

const project = new ProjectModel({
    loadUrl  : 'data/project.json',
    autoLoad : true
});

const dashboard = new Container({
    appendTo : 'container',
    layout   : 'vbox',
    flex     : 1,

    items : {
        topRow : {
            type   : 'container',
            layout : 'hbox',
            flex   : 1,
            items  : {
                gantt : {
                    type    : 'gantt',
                    project,
                    flex    : 2
                },
                splitter : {
                    type : 'splitter'
                },
                taskBoard : {
                    type    : 'taskboard',
                    project,
                    flex    : 1
                }
            }
        },
        horizontalSplitter : {
            type        : 'splitter',
            showButtons : true
        },
        bottomRow : {
            type   : 'container',
            layout : 'hbox',
            flex   : 1,
            items  : {
                calendar : {
                    type    : 'calendar',
                    project,
                    flex    : 1
                },
                splitter : {
                    type : 'splitter'
                },
                scheduler : {
                    type    : 'schedulerpro',
                    project,
                    flex    : 1
                }
            }
        }
    }
});
```

### TypeScript Interfaces

```typescript
interface ContainerConfig {
    appendTo?: string | HTMLElement;
    layout?: 'vbox' | 'hbox' | 'box' | LayoutConfig;
    flex?: number;
    items?: Record<string, WidgetConfig>;
    cls?: string;
    style?: object;
    defaults?: Partial<WidgetConfig>;
    defaultType?: string;
    layoutStyle?: {
        flexShrink?: number;
        gap?: string;
    };
}

interface LayoutConfig {
    type: 'vbox' | 'hbox' | 'box';
}

interface SplitterConfig {
    type: 'splitter';
    showButtons?: boolean | 'start' | 'end';
}

interface WidgetMapAccess {
    widgetMap: Record<string, Widget>;
}

interface PanelConfig extends ContainerConfig {
    title?: string;
    collapsible?: boolean;
    collapsed?: boolean;
    scrollable?: boolean | object;
    tools?: Record<string, ToolConfig>;
    tbar?: ToolbarConfig;
    bbar?: ToolbarConfig;
}

interface ToolConfig {
    cls: string;
    tooltip: string;
    handler: string;
    text?: string;
}
```

---

## Layout Types

### Vertical Box Layout (vbox)

```typescript
const container = new Container({
    layout : 'vbox',
    items  : {
        header : {
            type : 'toolbar',
            flex : 0,  // Vaste hoogte
            items : [
                { type: 'button', text: 'Zoom In', icon: 'b-icon-search-plus' },
                { type: 'button', text: 'Zoom Out', icon: 'b-icon-search-minus' }
            ]
        },
        main : {
            type   : 'gantt',
            flex   : 1,  // Neemt beschikbare ruimte
            project
        },
        footer : {
            type : 'container',
            flex : 0,
            cls  : 'dashboard-footer',
            html : 'Footer content'
        }
    }
});
```

### Horizontal Box Layout (hbox)

```typescript
const container = new Container({
    layout : 'hbox',
    items  : {
        sidebar : {
            type     : 'container',
            width    : 250,
            minWidth : 200,
            maxWidth : 400,
            items    : {
                filter : {
                    type : 'filterbar'
                }
            }
        },
        splitter : {
            type : 'splitter'
        },
        main : {
            type    : 'gantt',
            flex    : 1,
            project
        }
    }
});
```

### Nested Layouts met Defaults

```typescript
const dashboard = new Container({
    layout : 'hbox',

    // Apply flex-shrink: 0 to all sub containers
    defaults : {
        layoutStyle : {
            flexShrink : 0,
            gap        : '1.5em'
        }
    },

    items : {
        leftPanel : {
            type   : 'container',
            layout : 'vbox',
            flex   : 2,
            items  : {
                gantt : {
                    type    : 'gantt',
                    project,
                    flex    : 1
                },
                splitter : { type: 'splitter' },
                utilization : {
                    type    : 'resourceutilization',
                    project,
                    partner : 'up.gantt',
                    flex    : 1
                }
            }
        },
        splitter : { type: 'splitter' },
        rightPanel : {
            type   : 'container',
            layout : 'vbox',
            flex   : 1,
            items  : {
                taskBoard : {
                    type    : 'taskboard',
                    project,
                    flex    : 1
                },
                splitter : { type: 'splitter' },
                calendar : {
                    type    : 'calendar',
                    project,
                    flex    : 1,
                    mode    : 'month'
                }
            }
        }
    }
});
```

---

## Panel Widget Architecture

### Basis Panel Configuratie

```typescript
const panel = new Panel({
    appendTo : 'container',
    cls      : 'demo-app',
    layout   : 'hbox',

    items : {
        mainWidget : {
            type : 'gantt',
            flex : 1,
            project
        },
        splitter : { type : 'splitter' },
        configPanel : {
            type        : 'panel',
            title       : 'Configuration',
            collapsible : true,
            scrollable  : true,
            width       : 300,

            // Panel tools (icons in header)
            tools : {
                delete : {
                    cls     : 'b-icon-trash',
                    tooltip : 'Clear',
                    handler : 'onClear'
                },
                refresh : {
                    cls     : 'b-icon-refresh',
                    tooltip : 'Refresh',
                    handler : 'onRefresh'
                }
            },

            // Top toolbar
            tbar : {
                items : {
                    filter : {
                        type        : 'textfield',
                        flex        : 1,
                        placeholder : 'Filter...',
                        triggers    : {
                            filter : {
                                cls   : 'fa fa-filter',
                                align : 'start'
                            }
                        }
                    }
                }
            },

            items : {
                content : {
                    type : 'container',
                    html : 'Panel content'
                }
            }
        }
    }
});
```

### Custom Panel Class

```typescript
import { Panel } from '@bryntum/core';

class ConfigPanel extends Panel {
    // Registratie naam voor Factory
    static $name = 'ConfigPanel';

    // Type voor declaratief gebruik
    static type = 'configpanel';

    // Configureerbare properties
    static configurable = {
        // Reference naar target widget
        taskBoard  : null,

        // Panel defaults
        title      : 'Configuration',
        cls        : 'config-panel',
        scrollable : true,
        layout     : 'vbox',

        // Items configuratie
        items : {
            features : {
                type          : 'container',
                labelPosition : 'above',
                defaultType   : 'slidetoggle',
                defaults      : {
                    cls          : 'b-blue',
                    value        : false,
                    bubbleEvents : {
                        change : true
                    }
                },
                items : {
                    label : {
                        type : 'label',
                        cls  : 'section-label',
                        text : 'Features'
                    },
                    taskDrag    : { text : 'Drag cards' },
                    columnDrag  : { text : 'Drag columns' },
                    taskEdit    : { text : 'Edit tasks' },
                    taskTooltip : { text : 'Tooltips' }
                },
                listeners : {
                    change({ source }) {
                        // Access parent panel via up()
                        const panel = this.up('configpanel');
                        panel.taskBoard.features[source.ref].disabled = !source.value;
                    }
                }
            },

            configs : {
                type     : 'container',
                defaults : {
                    labelPosition : 'above',
                    bubbleEvents  : { change : true }
                },
                items : {
                    tasksPerRow : {
                        type  : 'number',
                        label : 'Tasks per row',
                        value : 1,
                        min   : 1,
                        max   : 10
                    },
                    stickyHeaders : {
                        type  : 'slidetoggle',
                        cls   : 'b-blue',
                        text  : 'Sticky headers',
                        value : true
                    }
                },
                listeners : {
                    change({ source }) {
                        // Direct config update
                        this.up('configpanel').taskBoard[source.ref] = source.value;
                    }
                }
            }
        }
    };

    // Constructor hook
    construct(...args) {
        super.construct(...args);

        // Initialize feature toggles from current state
        this.widgetMap.features.eachWidget(widget => {
            if (widget.isSlideToggle) {
                widget.checked = !this.taskBoard.features[widget.ref].disabled;
            }
        });
    }
}

// Registreer bij Widget Factory
ConfigPanel.initClass();
```

### Panel Gebruik met String Reference

```typescript
const panel = new Panel({
    appendTo : 'container',
    layout   : 'hbox',

    items : {
        taskBoard : {
            type : 'taskboard',
            flex : 1,
            project
        },
        splitter : { type : 'splitter' },
        configPanel : {
            type        : 'configpanel',
            collapsible : true,
            // String reference naar sibling widget
            taskBoard   : 'up.widgetMap.taskBoard'
        }
    }
});
```

---

## Event Log Panel Pattern

```typescript
import { Panel, DomHelper, EventHelper, Rectangle } from '@bryntum/core';

class EventLog extends Panel {
    static $name = 'EventLog';
    static type = 'eventlog';

    static configurable = {
        scrollable : true,

        tools : {
            delete : {
                cls     : 'b-icon-trash',
                tooltip : 'Clear event log',
                handler : 'clear'
            },
            pause : {
                cls     : 'fa',
                tooltip : 'Pause logging',
                text    : '\f28b',
                handler : 'toggleLogPaused'
            }
        },

        tbar : {
            items : {
                eventNameFilter : {
                    flex        : 1,
                    type        : 'textfield',
                    placeholder : 'Filter',
                    triggers    : {
                        filter : {
                            cls   : 'fa fa-filter',
                            align : 'start'
                        }
                    }
                }
            }
        }
    };

    onPaint({ firstPaint }) {
        if (firstPaint) {
            // Subscribe to all events via catchAll
            this.setTimeout(() => {
                this.up('calendar').on({
                    catchAll : 'onCalendarEvent',
                    thisObj  : this
                });
            }, 500);
        }

        // Click handler for element links
        EventHelper.on({
            element     : this.contentElement,
            forSelector : '.element-link',
            click       : 'onLogTargetClick',
            thisObj     : this
        });
    }

    onCalendarEvent({ eventName, domEvent, eventRecord, date }) {
        const filter = this.widgetMap.eventNameFilter.value;

        // Apply filter
        if (filter && !eventName.match(new RegExp(filter, 'i'))) {
            return;
        }

        this.log(eventName, `${eventRecord?.name || ''} ${date || ''}`);
    }

    log(eventName, message) {
        if (!this.paused) {
            DomHelper.createElement({
                parent   : this.contentElement,
                children : [{
                    tag       : 'span',
                    className : 'event-name',
                    text      : eventName
                }, {
                    className : 'log-message',
                    text      : message
                }]
            });

            // Auto-scroll to bottom
            this.contentElement.scrollTop = Number.MAX_SAFE_INTEGER;
        }
    }

    toggleLogPaused() {
        this.paused = !this.paused;
        this.widgetMap.pause.element.classList.toggle('b-pressed', this.paused);
    }

    clear() {
        this.contentElement.innerHTML = '';
    }
}

EventLog.initClass();
```

---

## Sidebar Customization

### Calendar Sidebar Configuratie

```typescript
const calendar = new Calendar({
    date : new Date(2020, 9, 12),

    crudManager : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    },

    appendTo : 'container',

    // Sidebar configuratie
    sidebar : {
        width : '20em',

        items : {
            // Verwijder standaard widgets
            datePicker : null,

            // Voeg nieuwe items toe met weight voor ordering
            addNew : {
                weight    : 0,  // Eerste positie
                type      : 'button',
                text      : 'Create',
                icon      : 'fa fa-plus',
                rendition : 'filled',

                listeners : {
                    // Ownership hierarchy call
                    click : 'up.createEvent',
                    args  : [undefined]
                }
            },

            filterTitle : {
                type   : 'toolbar',
                weight : 199,  // Net voor resourceFilter
                cls    : 'resource-filter-title',
                items  : {
                    title : {
                        tag  : 'strong',
                        type : 'widget',
                        html : 'My calendars'
                    },
                    spacer : '->',
                    addNew : {
                        type    : 'button',
                        cls     : 'b-add-calendar b-transparent',
                        icon    : 'fa fa-plus',
                        tooltip : 'Add calendar',
                        onClick : 'up.onAddCalendarClick'
                    }
                }
            },

            resourceFilter : {
                flex          : '0 0 auto',
                selectAllItem : true
            },

            eventLog : {
                weight : 250,  // Laatste positie
                type   : 'eventlog',
                cls    : 'calendar-event-log',
                title  : 'Interaction log'
            }
        }
    },

    // Custom method voor sidebar
    onAddCalendarClick() {
        const { resourceFilter } = this.widgetMap;
        const [newCalendar] = this.resourceStore.add({ name : 'New calendar' });

        // Start inline editing
        const calendarEditor = Editor.new({
            owner      : this,
            appendTo   : this.sidebar.element,
            inputField : {
                type       : 'textfield',
                autoSelect : true
            },
            internalListeners : {
                afterEdit : () => {
                    calendarEditor.destroy();
                    resourceFilter.getItem(newCalendar).focus();
                }
            }
        });

        calendarEditor.startEdit({
            target : resourceFilter.getItem(newCalendar),
            record : newCalendar,
            field  : 'name'
        });
    }
});
```

### Sidebar State Persistence

```typescript
const calendar = new Calendar({
    stateId : 'mainCalendar',

    // Sidebar met stateful collapsed
    sidebar : {
        stateful : ['collapsed']
    },

    // Calendar-level stateful properties
    stateful : ['date']
});
```

---

## State Management

### StateProvider Setup

```typescript
import { StateProvider, AjaxHelper, AsyncHelper } from '@bryntum/core';

// LocalStorage (default)
StateProvider.setup('local');

// Memory-based (voor server-side state)
StateProvider.setup('memory');
```

### Backend State Pattern

```typescript
class BackendState {
    constructor(stateProvider) {
        this.stateProvider = stateProvider;
    }

    async init() {
        // Load state van server
        const response = await AjaxHelper.get('data/state.json');
        this.stateProvider.data = await response.json();

        // Start listening na data load
        this.stateProvider.on({
            save : this.onSave.bind(this)
        });
    }

    onSave() {
        // Debounced save
        this.stateData = this.stateProvider.data;

        if (!this.saving) {
            this.save().catch(err => console.warn('Failed to persist state', err));
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
        // Simulate network delay
        await AsyncHelper.sleep(250);

        // POST to server
        await AjaxHelper.post('api/state', data);
    }
}

// Initialization
async function launch() {
    const gantt = new Gantt({
        appendTo : 'container',

        // State key
        stateId : 'mainGantt',

        // Explicit start/end dates (override state)
        startDate : new Date(2019, 0, 13),
        endDate   : new Date(2019, 2, 24),

        project : {
            autoLoad : true,
            loadUrl  : 'data/project.json'
        },

        // Columns met explicit IDs voor state persistence
        columns : [
            { id : 'name', type : 'name', width : 250 },
            { id : 'startDate', type : 'startdate', width : 150 },
            { id : 'duration', type : 'duration', width : 150 }
        ],

        tbar : [
            {
                type  : 'slidetoggle',
                label : 'Auto save',
                value : true,
                onChange({ checked }) {
                    gantt.stateId = checked ? 'mainGantt' : null;
                }
            },
            {
                type : 'button',
                text : 'Reset to default',
                onAction() {
                    gantt.resetDefaultState();
                }
            }
        ]
    });
}

// Remote state initialization
if (new URL(window.location).searchParams.get('state') === 'remote') {
    (new BackendState(StateProvider.setup('memory'))).init().then(launch);
}
else {
    StateProvider.setup('local');
    launch();
}
```

### Stateful Properties

```typescript
const calendar = new Calendar({
    stateId : 'mainCalendar',

    // Specifieke properties die bewaard worden
    stateful : ['date', 'mode'],

    sidebar : {
        // Sidebar-specifieke state
        stateful : ['collapsed', 'width']
    },

    tbar : {
        items : {
            resetState : {
                text    : 'Reset to default',
                onClick : 'up.onResetStateClicked'
            }
        }
    },

    onResetStateClicked() {
        this.resetDefaultState();
    }
});
```

---

## Theme Management

### DomHelper Theme Switching

```typescript
import { DomHelper, GlobalEvents } from '@bryntum/core';

const gantt = new Gantt({
    appendTo : 'container',
    project,

    tbar : {
        items : {
            label : {
                type : 'label',
                text : 'Theme'
            },
            themeName : {
                type        : 'buttongroup',
                toggleGroup : true,
                rendition   : 'padded',
                items       : ['Material3', 'Stockholm', 'Svalbard', 'Visby', 'High Contrast'].map(name => {
                    const value = name.toLowerCase().replaceAll(' ', '-');
                    return {
                        id      : value,
                        text    : name,
                        value,
                        pressed : DomHelper.themeInfo.name.startsWith(name)
                    };
                }),
                onAction() {
                    changeTheme();
                }
            },
            themeVariant : {
                type        : 'buttongroup',
                toggleGroup : true,
                rendition   : 'padded',
                items       : ['Light', 'Dark'].map(name => {
                    return {
                        id      : name.toLowerCase(),
                        text    : name,
                        value   : name.toLowerCase(),
                        pressed : DomHelper.themeInfo.name.endsWith(name)
                    };
                }),
                onAction() {
                    changeTheme();
                }
            }
        }
    }
});

function changeTheme() {
    const themeName = gantt.widgetMap.themeName.value;
    const variant = gantt.widgetMap.themeVariant.value;
    DomHelper.setTheme(`${themeName}-${variant}`);
}

// Listen to theme changes
GlobalEvents.on({
    theme(themeChangeEvent) {
        const name = themeChangeEvent.theme.substring(
            0,
            themeChangeEvent.theme.lastIndexOf('-')
        );
        const variant = DomHelper.isDarkTheme ? 'dark' : 'light';

        // Update button states
        Gantt.getById(name).pressed = true;
        Gantt.getById(variant).pressed = true;
    }
});
```

### Theme Info API

```typescript
// Huidige theme informatie
const themeInfo = DomHelper.themeInfo;
// { name: 'stockholm-light', ... }

// Check dark mode
const isDark = DomHelper.isDarkTheme;

// Programmatisch theme wijzigen
DomHelper.setTheme('material3-dark');
```

---

## Collapsible Columns

### Column Groups met Collapse

```typescript
const gantt = new Gantt({
    appendTo : 'container',
    project,

    columns : [
        {
            type  : 'name',
            width : 250
        },
        {
            text         : 'Scheduled',
            collapsible  : true,
            collapseMode : 'toggleAll',
            collapsed    : true,  // Start collapsed

            children : [
                { type : 'startdate' },
                { type : 'duration' },
                { type : 'enddate' },

                // Column die zichtbaar is wanneer collapsed
                {
                    field           : 'startDate',
                    toggleAllHidden : true,  // Alleen visible bij collapsed
                    text            : 'Dates',
                    width           : 140,
                    editor          : false,
                    htmlEncode      : false,
                    renderer({ record }) {
                        return `
                            <div class="calendar">
                                <div class="date">${DateHelper.format(record.startDate, 'D')}</div>
                                <div class="month">${DateHelper.format(record.startDate, 'MMM')}</div>
                            </div>
                            ${record.duration ?? 0} ${DateHelper.getLocalizedNameOfUnit(record.durationUnit, record.duration !== 1)}
                        `;
                    }
                }
            ]
        },
        {
            text        : 'Dependencies',
            collapsible : true,
            children    : [
                { type : 'predecessor', width : 155 },
                { type : 'successor', width : 155 }
            ]
        }
    ],

    subGridConfigs : {
        locked : { flex : 1 },
        normal : { flex : 1 }
    }
});
```

---

## Nested Widgets (RowExpander)

### Grid met Nested Grid

```typescript
import { Grid, GridRowModel, Store } from '@bryntum/grid';

// Parent model
class Employee extends GridRowModel {
    static fields = [
        'id',
        'firstName',
        'name',
        { name : 'start', type : 'date' },
        'email'
    ];

    // Calculated field from related records
    get unattested() {
        return this.timeRows?.reduce((acc, r) => acc + (r.attested ? 0 : 1), 0);
    }

    get totalTime() {
        return this.timeRows?.reduce((acc, r) => acc + r.hours, 0);
    }
}

// Child model met relations
class TimeRow extends GridRowModel {
    static fields = ['id', 'employeeId', 'project', 'hours', 'attested'];

    static relations = {
        employee : {
            foreignKey             : 'employeeId',
            foreignStore           : 'employeeStore',
            relatedCollectionName  : 'timeRows',
            propagateRecordChanges : true  // Outer grid reacts to nested changes
        }
    };
}

// Stores met relation
const employeeStore = new Store({
    modelClass : Employee,
    data       : getEmployees()
});

const timeRowStore = new Store({
    modelClass    : TimeRow,
    employeeStore,  // Required for relation
    data          : getTimeRows()
});

const grid = new Grid({
    appendTo : 'container',
    store    : employeeStore,

    features : {
        rowExpander : {
            // Nested widget configuratie
            widget : {
                cls        : 'timerow-grid',
                type       : 'grid',
                autoHeight : true,

                columns : [
                    { text : 'Project', field : 'name', flex : 1 },
                    { text : 'Hours spent', field : 'hours', width : 135, type : 'number' },
                    { text : 'Attested', field : 'attested', width : 110, type : 'check' }
                ],

                // Bottom toolbar in nested grid
                bbar : [
                    {
                        text      : 'Add',
                        icon      : 'b-icon-add',
                        rendition : 'text',
                        onClick   : ({ source }) => {
                            const grid = source.up('grid');
                            const expandedRecord = grid.owner.features.rowExpander.getExpandedRecord(grid);
                            const [newRecord] = grid.store.add({
                                name       : null,
                                hours      : 0,
                                employeeId : expandedRecord.id
                            });
                            grid.startEditing(newRecord);
                        }
                    },
                    '->',
                    {
                        text      : 'Attest all',
                        icon      : 'b-icon-check',
                        rendition : 'text',
                        onClick   : ({ source }) => {
                            source.up('grid').store.forEach(r => r.attested = true);
                        }
                    }
                ]
            },

            // Data field voor nested data
            dataField : 'timeRows'
        }
    },

    columns : [
        { text : 'Employee#', field : 'id', width : 130 },
        { text : 'Name', field : 'name', flex : 1 },
        { text : 'Start date', field : 'start', type : 'date' },
        { text : 'Attested', field : 'unattested', width : 110, editor : false },
        { text : 'Total time', field : 'totalTime', width : 120, editor : false }
    ],

    listeners : {
        renderRows : ({ source }) => {
            // Auto-expand row on first render
            source.features.rowExpander.expand(source.store.getAt(2));
        },
        once : true
    }
});
```

---

## Cross-Widget Drag & Drop

### Custom Grid met Cross-Grid Drag

```typescript
class TeamGrid extends Grid {
    static $name = 'TeamGrid';
    static type = 'teamgrid';

    static configurable = {
        features : {
            rowReorder : {
                showGrip           : true,
                allowCrossGridDrag : true  // Enable cross-widget drag
            }
        },

        columns : [
            {
                text   : 'Name',
                field  : 'name',
                flex   : 2,
                editor : {
                    type     : 'textfield',
                    required : true
                }
            },
            {
                text  : 'Age',
                field : 'age',
                width : 100,
                type  : 'number'
            },
            {
                type   : 'color',
                text   : 'Color',
                field  : 'color',
                width  : 80
            }
        ]
    };
}

TeamGrid.initClass();

// Multiple instances share drag & drop
const stockholmTeam = new TeamGrid({
    appendTo : 'main',
    title    : 'Stockholm Team',
    data     : stockholmData
});

const miamiTeam = new TeamGrid({
    appendTo : 'main',
    title    : 'Miami Team',
    data     : miamiData
});
```

---

## Event Layout Patterns

### Grouped Event Layout

```typescript
const eventLayout = {
    type    : 'stack',  // 'stack' | 'pack' | 'none'

    // Order of groups
    weights : {
        true  : 1,
        false : 2,
        high  : 1,
        low   : 2
    },

    // Group by field
    groupBy : 'priority'
};

const scheduler = new SchedulerPro({
    appendTo    : 'container',
    eventLayout,

    eventRenderer({ eventRecord, renderData }) {
        const { groupBy } = eventLayout;

        // Color by group
        if (groupBy) {
            if (eventRecord[groupBy] === 'high' || eventRecord[groupBy] === true) {
                renderData.eventColor = 'red';
            }
            else {
                renderData.eventColor = 'blue';
            }
        }

        return eventRecord.name;
    },

    tbar : [
        {
            type        : 'buttongroup',
            toggleGroup : true,
            items : [
                { id : 'stack', text : 'Stack', pressed : true },
                { id : 'pack', text : 'Pack' },
                { id : 'none', text : 'Overlap' }
            ],
            onAction({ source : button }) {
                eventLayout.type = button.id;
                scheduler.eventLayout = Object.assign({}, eventLayout);
            }
        },
        {
            type      : 'combo',
            label     : 'Group by',
            editable  : false,
            clearable : true,
            value     : 'priority',
            items     : ['priority', 'confirmed'],
            onChange  : ({ value }) => {
                eventLayout.groupBy = value;
                scheduler.eventLayout = Object.assign({}, eventLayout);
            }
        }
    ]
});
```

### Custom Layout Function

```typescript
const customEventLayout = {
    layoutFn : items => {
        let bottom = 50;

        items.forEach((item, i) => {
            // Custom height based on data
            item.height = item.confirmed ? 60 : 30;

            // Position every event 10px further down
            item.top = i * 10;

            bottom = Math.max(bottom, item.top + item.height);
        });

        // Return row height in pixels
        return bottom;
    }
};

scheduler.eventLayout = customEventLayout;
```

---

## Splitter Component

### Splitter Configuratie

```typescript
const splitter = new Splitter({
    appendTo    : 'container',
    showButtons : true  // Collapse buttons tonen
});

// Splitter tussen widgets
const container = new Container({
    layout : 'hbox',
    items  : {
        left     : { type: 'gantt', flex: 1 },
        splitter : {
            type        : 'splitter',
            showButtons : 'end'  // Button alleen aan einde
        },
        right    : { type: 'taskboard', flex: 1 }
    }
});
```

### Collapsible Panels

```typescript
const gantt = new Gantt({
    project,
    flex        : 1,
    collapsible : true,
    header      : false,
    minHeight   : 0
});

const scheduler = new SchedulerPro({
    project,
    partner     : gantt,
    flex        : 1,
    collapsible : true,
    header      : false,
    minHeight   : 0
});
```

---

## Widget Map Access

### Toegang tot Child Widgets

```typescript
const container = new Container({
    appendTo : 'container',
    items    : {
        gantt     : { type: 'gantt', project },
        taskBoard : { type: 'taskboard', project },
        calendar  : { type: 'calendar', project }
    }
});

// Via widgetMap
const { gantt, taskBoard, calendar } = container.widgetMap;

// Cross-referenties opzetten
gantt.taskBoard = taskBoard;
gantt.calendar = calendar;
```

### Parent Referentie met 'up.'

```typescript
const container = new Container({
    items : {
        scheduler : {
            type    : 'schedulerpro',
            project,
            // Referentie naar sibling widget
            partner : 'up.gantt'
        },
        splitter : { type: 'splitter' },
        gantt : {
            type    : 'gantt',
            project
        }
    }
});

// Toolbar met up() access
tbar : {
    items : {
        zoomIn : {
            icon    : 'b-icon-search-plus',
            onAction() {
                const { gantt } = this.up('container').widgetMap;
                gantt.zoomIn();
            }
        }
    }
}
```

---

## Responsive Dashboard

### Breakpoint Configuratie

```typescript
const dashboard = new Container({
    layout : { type: 'box' },

    responsive : {
        small : {
            when    : 600,
            layout  : 'vbox',
            configs : {
                gantt     : { flex: 1, minHeight: 200 },
                taskBoard : { flex: 1, minHeight: 200 }
            }
        },
        medium : {
            when    : 1200,
            layout  : 'hbox',
            configs : {
                gantt     : { flex: 2 },
                taskBoard : { flex: 1 }
            }
        },
        large : {
            when    : '*',
            layout  : 'hbox',
            configs : {
                gantt     : { flex: 3 },
                taskBoard : { flex: 1 }
            }
        }
    },

    items : {
        gantt     : { type: 'gantt', project },
        splitter  : { type: 'splitter' },
        taskBoard : { type: 'taskboard', project }
    }
});
```

### Widget-Level Responsive

```typescript
const calendar = new Calendar({
    project,

    responsive : {
        small : {
            when : 400,
            mode : 'list'
        },
        medium : {
            when : 600,
            mode : 'week'
        },
        large : {
            when : '*',
            mode : 'month'
        }
    }
});

const taskBoard = new TaskBoard({
    project,

    responsive : {
        small : {
            when   : 500,
            config : {
                columns : [
                    { id: 'todo', text: 'Todo' },
                    { id: 'done', text: 'Done' }
                ]
            }
        },
        large : {
            when   : '*',
            config : {
                columns : [
                    { id: 'todo', text: 'Todo' },
                    { id: 'wip', text: 'In Progress' },
                    { id: 'review', text: 'Review' },
                    { id: 'done', text: 'Done' }
                ]
            }
        }
    }
});
```

---

## Cross-Widget State Sync

### Selection Synchronization

```typescript
const dashboard = new Container({
    items : {
        gantt     : { type: 'gantt', project },
        taskBoard : { type: 'taskboard', project }
    }
});

const { gantt, taskBoard } = dashboard.widgetMap;

// Gantt selectie -> TaskBoard scroll
gantt.on('selectionChange', ({ selected }) => {
    if (selected.length) {
        taskBoard.scrollToTask(selected[0]);
    }
});

// TaskBoard selectie -> Gantt scroll
taskBoard.on('selectionChange', async ({ select }) => {
    if (select.length) {
        await gantt.scrollTaskIntoView(select[0], {
            animate   : true,
            highlight : true
        });
    }
});
```

### Highlight Synchronization

```typescript
scheduler.on('selectionChange', ({ selection }) => {
    const tasks = gantt.taskStore.query(
        task => selection.some(
            resource => task.resources.includes(resource)
        )
    );

    gantt.highlightTasks({
        tasks,
        unhighlightOthers : true
    });
});
```

### Hover State Sync

```typescript
// Gantt -> TaskBoard hover
gantt.on('taskMouseEnter', ({ taskRecord }) => {
    const taskEl = taskBoard.getTaskElement(taskRecord);
    taskEl?.classList.add('b-hovered');
});

gantt.on('taskMouseLeave', ({ taskRecord }) => {
    const taskEl = taskBoard.getTaskElement(taskRecord);
    taskEl?.classList.remove('b-hovered');
});
```

---

## Toolbar Integration

### Shared Toolbar Controls

```typescript
const dashboard = new Container({
    layout : 'vbox',
    items  : {
        toolbar : {
            type  : 'toolbar',
            flex  : 0,
            items : {
                zoom : {
                    type : 'widget',
                    html : 'Zoom:'
                },
                zoomIn : {
                    icon    : 'b-icon-search-plus',
                    tooltip : 'Zoom in',
                    onAction() {
                        const { gantt } = this.up('container').widgetMap;
                        gantt.zoomIn();
                    }
                },
                zoomOut : {
                    icon    : 'b-icon-search-minus',
                    tooltip : 'Zoom out',
                    onAction() {
                        const { gantt } = this.up('container').widgetMap;
                        gantt.zoomOut();
                    }
                },
                spacer : '->',
                syncScroll : {
                    type    : 'slidetoggle',
                    text    : 'Sync scrolling',
                    checked : true,
                    onChange({ checked }) {
                        const { gantt, scheduler } = this.up('container').widgetMap;

                        if (checked) {
                            gantt.addPartner(scheduler);
                        }
                        else {
                            gantt.removePartner(scheduler);
                        }
                    }
                }
            }
        },
        content : {
            type   : 'container',
            layout : 'hbox',
            flex   : 1,
            items  : {
                gantt     : { type: 'gantt', project, flex: 1 },
                splitter  : { type: 'splitter' },
                scheduler : { type: 'schedulerpro', project, flex: 1 }
            }
        }
    }
});
```

### View Switcher

```typescript
const tbar = {
    items : {
        viewSwitcher : {
            type        : 'buttongroup',
            toggleGroup : true,
            items       : [
                {
                    text    : 'Timeline',
                    icon    : 'b-icon-gantt',
                    pressed : true,
                    onAction() {
                        showView('gantt');
                    }
                },
                {
                    text    : 'Kanban',
                    icon    : 'b-icon-taskboard',
                    onAction() {
                        showView('taskboard');
                    }
                },
                {
                    text    : 'Calendar',
                    icon    : 'b-icon-calendar',
                    onAction() {
                        showView('calendar');
                    }
                }
            ]
        }
    }
};

function showView(viewName) {
    const { gantt, taskBoard, calendar } = dashboard.widgetMap;

    gantt.hidden = viewName !== 'gantt';
    taskBoard.hidden = viewName !== 'taskboard';
    calendar.hidden = viewName !== 'calendar';
}
```

---

## Partner Widget Pattern

### Multiple Gantt Charts

```typescript
const dashboard = new Container({
    layout : 'vbox',
    items  : {
        toolbar : {
            type  : 'toolbar',
            items : {
                syncScroll : {
                    type    : 'slidetoggle',
                    checked : true,
                    text    : 'Sync scrolling',
                    onChange({ value }) {
                        const { topGantt, bottomGantt } = this.up('container').widgetMap;

                        bottomGantt.hideHeaders = value;

                        if (value) {
                            topGantt.addPartner(bottomGantt);
                        }
                        else {
                            topGantt.removePartner(bottomGantt);
                        }
                    }
                },
                rowDrag : {
                    type    : 'slidetoggle',
                    checked : true,
                    text    : 'Enable row dragging',
                    onChange({ value }) {
                        const { topGantt, bottomGantt } = this.up('container').widgetMap;

                        topGantt.features.rowReorder.disabled = !value;
                        bottomGantt.features.rowReorder.disabled = !value;
                    }
                }
            }
        },
        topGantt : {
            type       : 'gantt',
            eventColor : 'blue',
            flex       : 1,
            project    : {
                loadUrl  : 'data/project1.json',
                autoLoad : true
            },
            features : {
                rowReorder : {
                    showGrip           : true,
                    allowCrossGridDrag : true
                }
            },
            style : {
                marginBottom           : 0,
                borderBottom           : 'none',
                borderBottomLeftRadius : 0,
                borderBottomRightRadius: 0
            }
        },
        splitter : {
            type        : 'splitter',
            showButtons : true
        },
        bottomGantt : {
            type        : 'gantt',
            hideHeaders : true,
            eventColor  : 'green',
            flex        : 1,
            partner     : 'up.topGantt',
            project     : {
                loadUrl  : 'data/project2.json',
                autoLoad : true
            },
            features : {
                rowReorder : {
                    showGrip           : true,
                    allowCrossGridDrag : true
                }
            },
            style : {
                marginTop           : 0,
                borderTop           : 'none',
                borderTopLeftRadius : 0,
                borderTopRightRadius: 0
            }
        }
    }
});
```

---

## KeyMap Integration

```typescript
const calendar = new Calendar({
    project,

    keyMap : {
        'Ctrl+P' : function() {
            this.widgetMap.eventLog.toggleLogPaused();
        },
        'Ctrl+K' : function() {
            this.widgetMap.eventLog.clear();
        },
        'Ctrl+N' : function() {
            this.createEvent();
        },
        'Ctrl+S' : function() {
            this.project.commitAsync();
        }
    }
});
```

---

## Dashboard CSS Patterns

### Layout Styling

```css
/* Dashboard container */
.dashboard-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

/* Panel borders */
.dashboard-container .b-gantt,
.dashboard-container .b-taskboard,
.dashboard-container .b-calendar {
    border: 1px solid var(--border-color);
    border-radius: 4px;
}

/* Splitter styling */
.dashboard-container .b-splitter {
    background: var(--panel-background);
}

/* Hover states */
.dashboard-container .b-hovered {
    box-shadow: 0 0 0 2px var(--primary-color);
}

/* Config panel */
.config-panel {
    background: var(--panel-background);
    border-left: 1px solid var(--border-color);
}

.config-panel .section-label {
    font-weight: bold;
    margin-bottom: 0.5em;
    color: var(--text-color);
}

/* Event log */
.calendar-event-log {
    font-family: monospace;
    font-size: 0.85em;
}

.calendar-event-log .event-name {
    color: var(--primary-color);
    font-weight: bold;
}
```

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 600px) {
    .dashboard-container {
        flex-direction: column;
    }

    .dashboard-container .b-splitter {
        display: none;
    }
}

/* Tablet */
@media (min-width: 601px) and (max-width: 1200px) {
    .dashboard-container {
        flex-direction: row;
    }
}

/* Desktop */
@media (min-width: 1201px) {
    .dashboard-container .b-gantt {
        flex: 2;
    }

    .dashboard-container .b-taskboard {
        flex: 1;
    }
}
```

---

## Best Practices

### 1. Project Eerst Laden

```typescript
const project = new ProjectModel({
    loadUrl  : 'data/project.json',
    autoLoad : true
});

await project.load();

const dashboard = new Container({
    items : {
        gantt     : { type: 'gantt', project },
        taskBoard : { type: 'taskboard', project }
    }
});
```

### 2. Widget References Cachen

```typescript
const widgets = dashboard.widgetMap;
const { gantt, taskBoard, calendar } = widgets;

// GOOD: gantt.doSomething()
// BAD: dashboard.widgetMap.gantt.doSomething()
```

### 3. Event Cleanup

```typescript
function cleanup() {
    gantt.removePartner(scheduler);
    dashboard.destroy();
    project.destroy();
}
```

### 4. Performance Optimalisatie

```typescript
// Batch updates
project.taskStore.beginBatch();
// ... multiple changes
project.taskStore.endBatch();

// Suspend refresh
gantt.suspendRefresh = true;
// ... operations
gantt.suspendRefresh = false;
gantt.refresh();

// Recompose TaskBoard na bulk changes
taskBoard.recompose();
```

### 5. Error Handling

```typescript
const project = new ProjectModel({
    loadUrl          : 'data/project.json',
    validateResponse : process.env.NODE_ENV !== 'production',

    listeners : {
        loadFail({ response }) {
            console.error('Load failed:', response);
            showErrorNotification('Could not load project data');
        },
        syncFail({ response }) {
            console.error('Sync failed:', response);
            showErrorNotification('Could not save changes');
        }
    }
});
```

### 6. Custom Widget Registratie

```typescript
// Altijd deze pattern voor custom widgets
class MyWidget extends Panel {
    static $name = 'MyWidget';
    static type = 'mywidget';
    static configurable = { /* ... */ };
}

MyWidget.initClass();
```

### 7. State Provider Initialization

```typescript
// CRITICAL: State moet klaar zijn VOOR widget creatie
// Anders flicker door default -> state values

// Option 1: Sync (localStorage)
StateProvider.setup('local');
launchApp();

// Option 2: Async (server)
const backend = new BackendState(StateProvider.setup('memory'));
await backend.init();
launchApp();
```

---

## Facet Filter Pattern

### Custom Facet Filter Widget

```typescript
import { Panel, Widget, StringHelper } from '@bryntum/core';
import { TaskModel, Gantt } from '@bryntum/gantt';

class GanttTaskFacetFilter extends Panel {
    static $name = 'GanttTaskFacetFilter';
    static type = 'gantttaskfacetfilter';

    static configurable = {
        layout      : 'vbox',
        ui          : 'toolbar',
        collapsible : {
            direction : 'up'
        },
        gantt     : null,
        fieldName : null
    };

    // Extract unique field values from store
    static getFieldValues(dataStore, fieldName) {
        const field = dataStore.modelClass.getFieldDefinition(fieldName);
        const uniqueValues = dataStore.getDistinctValues(fieldName, true)
            .filter(v => v);

        if (field.type === 'number') {
            uniqueValues.sort((a, b) => a - b);
        }
        else if (field.type === 'boolean') {
            return [true, false];
        }
        else {
            uniqueValues.sort((a, b) =>
                String(a).localeCompare(String(b))
            );
        }
        return uniqueValues;
    }

    refreshOptions() {
        const { fieldName, gantt: { taskStore, columns } } = this;
        const column = columns.get(fieldName);
        const values = GanttTaskFacetFilter.getFieldValues(taskStore, fieldName);
        const fieldType = taskStore.modelClass.getFieldDefinition(fieldName).type;
        const useStringValues = !['number', 'boolean'].includes(fieldType);

        // Preserve checked state
        const checked = new Set(
            this.items?.filter(item => item.checked)
                .map(item => item.checkedValue) ?? []
        );

        const hasIds = Array.isArray(values?.[0]);

        this.title = StringHelper.encodeHtml(column.text);

        // Generate checkbox items
        this.items = values.map(value => {
            let checkedValue = hasIds ? value[0] : value;

            if (useStringValues) {
                checkedValue = StringHelper.encodeHtml(checkedValue);
            }

            return {
                type      : 'checkbox',
                checkedValue,
                text      : StringHelper.capitalize(
                    StringHelper.encodeHtml(String(hasIds ? value[1] : value))
                ),
                fieldName,
                checked   : checked.has(checkedValue),
                listeners : {
                    change : 'up.onCheckboxChange'
                }
            };
        });
    }

    // React to gantt config changes
    updateGantt(gantt) {
        this.refreshOptions();

        // Refresh when store changes
        gantt.taskStore.on({
            add     : 'refreshOptions',
            update  : 'refreshOptions',
            remove  : 'refreshOptions',
            load    : 'refreshOptions',
            thisObj : this
        });
    }

    onCheckboxChange({ source }) {
        // Visual feedback
        source.cls = {
            [`b-${this.type}-item-active`]: source.checked
        };

        const filters = {};
        const { taskStore } = this.gantt;

        // Collect all checked checkboxes across all facet filters
        for (const checkBox of Widget.queryAll('checkbox')
            .filter(cb => cb.checked && cb.fieldName)) {
            filters[checkBox.fieldName] = [
                ...filters[checkBox.fieldName] ?? [],
                checkBox.checkedValue
            ];
        }

        // Apply filters
        taskStore.clearFilters();

        for (const fieldName in filters) {
            taskStore.filter({
                id       : fieldName,
                property : fieldName,
                operator : 'isIncludedIn',
                value    : filters[fieldName]
            });
        }
    }
}

GanttTaskFacetFilter.initClass();
```

### Facet Filter Dashboard

```typescript
const gantt = new Gantt({
    flex              : 1,
    dependencyIdField : 'sequenceNumber',

    project : {
        taskModelClass : Task,
        autoLoad       : true,
        loadUrl        : 'data/project.json'
    },

    columns : [
        { type : 'name', width : 250 },
        { type : 'eventColor', width : 100, text : 'Color', field : 'eventColor' },
        { type : 'check', width : 100, text : 'Critical', field : 'critical' },
        { width : 100, text : 'Status', field : 'status', readOnly : true },
        {
            field    : 'priority',
            text     : 'Priority',
            type     : 'template',
            align    : 'center',
            width    : 120,
            template : ({ value = '' }) => StringHelper.xss`
                <div class="b-prio b-prio-${value.toLowerCase()}">${value}</div>
            `,
            editor : {
                type  : 'dropdown',
                items : ['Low', 'Medium', 'High']
            }
        }
    ],

    tbar : [{
        icon      : 'fa-bars',
        rendition : 'text',
        tooltip   : 'Toggle filter panel',
        onClick() {
            container.widgetMap.facetFilters.toggleCollapsed();
        }
    }]
});

const container = new Container({
    appendTo : 'container',
    layout   : 'hbox',
    flex     : 1,

    items : {
        facetFilters : {
            type        : 'panel',
            layout      : 'vbox',
            cls         : 'filters-panel',
            collapsible : true,
            header      : false,
            width       : '15em',

            defaults : {
                type : 'gantttaskfacetfilter',
                gantt
            },

            items : {
                status     : { fieldName : 'status' },
                critical   : { fieldName : 'critical' },
                priority   : { fieldName : 'priority' },
                eventColor : { fieldName : 'eventColor' }
            }
        },
        splitter : { type : 'splitter' },
        gantt
    }
});
```

### Facet Filter CSS

```css
.filters-panel {
    background: var(--panel-background);
    border-right: 1px solid var(--border-color);
}

.filters-panel .b-gantttaskfacetfilter {
    margin-bottom: 0.5em;
}

.b-gantttaskfacetfilter-item-active {
    font-weight: bold;
    color: var(--primary-color);
}

.b-prio {
    padding: 0.25em 0.5em;
    border-radius: 3px;
    font-size: 0.85em;
}

.b-prio-high {
    background: #f44336;
    color: white;
}

.b-prio-medium {
    background: #ff9800;
    color: white;
}

.b-prio-low {
    background: #4caf50;
    color: white;
}
```

---

## Custom Context Menu

### Task Menu Customization

```typescript
import { Gantt, DomHelper, Point } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo : 'container',
    project,

    listeners : {
        // Intercept built-in task menu
        taskMenuBeforeShow({ taskRecord, event }) {
            const menuEl = document.getElementById('customTaskMenu');

            // Hide any visible menus
            document.querySelectorAll('.dropdown-menu:visible')
                .forEach(el => el.style.display = 'none');

            // Store task reference
            menuEl.dataset.taskId = taskRecord.id;
            menuEl.style.display = 'block';

            // Position at click point, constrained to viewport
            DomHelper.alignTo(menuEl, new Point(event.x, event.y), {
                align            : 't0-b0',
                constrainTo      : document.body,
                constrainPadding : 10
            });

            // Prevent built-in menu
            return false;
        }
    }
});

// Menu action handlers
document.querySelectorAll('#customTaskMenu button').forEach(button => {
    button.addEventListener('click', function() {
        const taskId = this.parentElement.dataset.taskId;
        const taskRecord = gantt.taskStore.getById(taskId);
        const action = this.dataset.ref;

        switch (action) {
            case 'move':
                taskRecord.shift(1, 'day');
                break;

            case 'edit':
                gantt.editTask(taskRecord);
                break;

            case 'remove':
                gantt.taskStore.remove(taskId);
                break;
        }
    });
});

// Close menu on outside click
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu')
        .forEach(el => el.style.display = 'none');
});
```

### Custom Menu HTML

```html
<div id="customTaskMenu" class="dropdown-menu" style="display: none;">
    <button data-ref="move">
        <i class="fa fa-arrow-right"></i> Move 1 day ahead
    </button>
    <button data-ref="edit">
        <i class="fa fa-edit"></i> Edit task
    </button>
    <hr>
    <button data-ref="remove" class="danger">
        <i class="fa fa-trash"></i> Remove task
    </button>
</div>
```

### Built-in Menu Customization

```typescript
const gantt = new Gantt({
    project,

    features : {
        taskMenu : {
            items : {
                // Remove built-in items
                cut       : false,
                copy      : false,
                paste     : false,

                // Add custom items
                customAction : {
                    text   : 'Custom Action',
                    icon   : 'fa fa-star',
                    weight : 100,  // Position in menu
                    onItem({ taskRecord }) {
                        console.log('Custom action on:', taskRecord.name);
                    }
                },

                // Conditional item
                approveTask : {
                    text   : 'Approve Task',
                    icon   : 'fa fa-check',
                    weight : 110,
                    onItem({ taskRecord }) {
                        taskRecord.status = 'approved';
                    },
                    // Only show for pending tasks
                    disabled({ taskRecord }) {
                        return taskRecord.status !== 'pending';
                    }
                }
            },

            // Process menu before show
            processItems({ taskRecord, items }) {
                // Dynamic item modification
                if (taskRecord.isMilestone) {
                    items.convertToTask = {
                        text   : 'Convert to Task',
                        onItem : () => {
                            taskRecord.duration = 1;
                        }
                    };
                }
            }
        }
    }
});
```

---

## Field Filter Picker Group

### Advanced Filter UI

```typescript
import { Container, BrowserHelper } from '@bryntum/core';

const FILTERS_STORAGE_KEY = 'app-dashboard-filters';

// Lock certain filters
const canDeleteFilter = filter => filter.id !== 'permanent-filter';

const getFieldFilterPickerConfig = filter =>
    filter.id === 'permanent-filter'
        ? { propertyLocked: true, operatorLocked: true }
        : undefined;

// Field overrides for relations
const filterPickerFields = {
    colorId : {
        relatedDisplayField : 'name'
    }
};

const app = new Container({
    layout   : 'box',
    appendTo : 'container',

    items : {
        gantt,
        splitter : { type : 'splitter' },

        filtersPanel : {
            type        : 'panel',
            title       : 'Filters',
            collapsible : true,
            layout      : 'vbox',
            flex        : 1,
            minWidth    : '25em',
            maxWidth    : '35em',

            items : {
                enableAllCheckbox : {
                    type    : 'checkbox',
                    text    : 'Enable/disable all',
                    checked : true,
                    listeners : {
                        change({ checked }) {
                            const pickers = app.widgetMap.filterPickers;
                            checked
                                ? pickers.activateAll()
                                : pickers.deactivateAll();
                        }
                    }
                },

                filterPickers : {
                    type   : 'gridfieldfilterpickergroup',
                    width  : '100%',
                    ref    : 'filterPickers',

                    // Use grid's columns as filter properties
                    grid   : gantt,
                    fields : filterPickerFields,

                    // Restrict available fields
                    // allowedFieldNames : ['name', 'startDate', 'percentDone'],

                    // Initial filters (or load from storage)
                    filters : loadFilters() ?? [{
                        id            : 'permanent-filter',
                        property      : 'percentDone',
                        operator      : '<',
                        value         : 100,
                        caseSensitive : false
                    }],

                    listeners : {
                        change({ filters }) {
                            // Persist to localStorage
                            BrowserHelper.setLocalStorageItem(
                                FILTERS_STORAGE_KEY,
                                JSON.stringify(filters)
                            );
                        }
                    },

                    canDeleteFilter,
                    getFieldFilterPickerConfig
                }
            }
        }
    }
});

function loadFilters() {
    const saved = BrowserHelper.getLocalStorageItem(FILTERS_STORAGE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        }
        catch (e) {
            console.error('Failed to parse filters:', e);
        }
    }
    return undefined;
}
```

---

## FilterBar Feature

### Quick Column Filtering

```typescript
const gantt = new Gantt({
    project,

    features : {
        filterBar : {
            // Debounce keystroke filtering
            keyStrokeFilterDelay : 100
        }
    },

    subGridConfigs : {
        locked : { flex : 3 },
        normal : { flex : 5 }
    },

    columns : [
        { type : 'wbs' },
        { type : 'name', width : 250 },
        { type : 'startdate', width : 170 },
        { type : 'duration', align : 'center' },
        { type : 'resourceassignment', width : 120, showAvatars : true },
        { type : 'percentdone', mode : 'circle', width : 100 },
        { type : 'predecessor', width : 112 }
    ]
});
```

### Filter Feature Configuration

```typescript
features : {
    filter : {
        // FieldFilterPickerGroup configuration
        pickerConfig : {
            canDeleteFilter,
            getFieldFilterPickerConfig,
            fields : filterPickerFields
        }
    }
}
```

---

## DomHelper Utilities

### Element Alignment

```typescript
import { DomHelper, Point, Rectangle } from '@bryntum/core';

// Align element to a point
DomHelper.alignTo(element, new Point(event.x, event.y), {
    align            : 't0-b0',  // Top of element to bottom of point
    constrainTo      : document.body,
    constrainPadding : 10
});

// Align to another element
DomHelper.alignTo(popup, targetElement, {
    align       : 'l0-r0',  // Left of popup to right of target
    axisLock    : true,
    matchSize   : true,
    offset      : [10, 0]   // Horizontal, vertical offset
});

// Get element rectangle
const rect = Rectangle.from(element);
console.log(rect.x, rect.y, rect.width, rect.height);
```

### Theme Utilities

```typescript
// Current theme info
const themeInfo = DomHelper.themeInfo;
// { name: 'stockholm-light', ... }

// Check if dark theme
const isDark = DomHelper.isDarkTheme;

// Change theme programmatically
DomHelper.setTheme('material3-dark');
```

### DOM Creation

```typescript
// Create element with children
DomHelper.createElement({
    parent    : container,
    tag       : 'div',
    className : 'my-class',
    style     : { padding: '10px' },
    children  : [
        {
            tag       : 'span',
            className : 'title',
            text      : 'Hello'
        },
        {
            tag       : 'button',
            className : 'action-btn',
            text      : 'Click me',
            dataset   : { action: 'submit' }
        }
    ]
});
```

---

## Widget Querying

### Widget.queryAll

```typescript
import { Widget } from '@bryntum/core';

// Find all checkboxes
const checkboxes = Widget.queryAll('checkbox');

// Find all checked checkboxes with specific property
const checkedFilters = Widget.queryAll('checkbox')
    .filter(cb => cb.checked && cb.fieldName);

// Find widget by ref
const myWidget = Widget.getById('myWidgetId');

// Find by type in container
const buttons = container.queryAll('button');
```

### Container eachWidget

```typescript
container.eachWidget(widget => {
    if (widget.isSlideToggle) {
        widget.checked = true;
    }
});

// With filter
container.eachWidget(widget => {
    console.log(widget.ref);
}, widget => widget.isButton);
```

---

## Responsive Container Pattern

### Breakpoint-Based Layout

```typescript
import { Container, ResizeObserver } from '@bryntum/core';

class ResponsiveContainer extends Container {
    static $name = 'ResponsiveContainer';
    static type = 'responsivecontainer';

    static configurable = {
        breakpoints : {
            small  : 600,
            medium : 900,
            large  : 1200
        },

        layouts : {
            small  : 'vbox',
            medium : 'vbox',
            large  : 'hbox'
        }
    };

    construct(config) {
        super.construct(config);

        // Observe size changes
        this.resizeObserver = new ResizeObserver(entries => {
            this.onResize(entries[0].contentRect.width);
        });
        this.resizeObserver.observe(this.element);
    }

    onResize(width) {
        const { breakpoints, layouts } = this;
        let newLayout;

        if (width < breakpoints.small) {
            newLayout = layouts.small;
        }
        else if (width < breakpoints.medium) {
            newLayout = layouts.medium;
        }
        else {
            newLayout = layouts.large;
        }

        if (this.layout !== newLayout) {
            this.layout = newLayout;
            this.trigger('breakpointChange', { width, layout: newLayout });
        }
    }

    doDestroy() {
        this.resizeObserver?.disconnect();
        super.doDestroy();
    }
}

ResponsiveContainer.initClass();

// Usage
const dashboard = new ResponsiveContainer({
    appendTo : 'container',

    items : {
        gantt : {
            type    : 'gantt',
            project,
            flex    : 1
        },
        splitter : { type : 'splitter' },
        taskBoard : {
            type    : 'taskboard',
            project,
            flex    : 1
        }
    },

    listeners : {
        breakpointChange({ layout }) {
            console.log('Layout changed to:', layout);
        }
    }
});
```

---

## Dynamic Widget Creation

### Runtime Widget Adding/Removing

```typescript
import { Container, Panel, Widget } from '@bryntum/core';

const dashboard = new Container({
    appendTo : 'container',
    layout   : 'hbox',

    items : {
        mainPanel : {
            type   : 'container',
            flex   : 1,
            layout : 'vbox',
            items  : {}
        }
    }
});

// Add widget dynamically
function addWidget(type, config) {
    const mainPanel = dashboard.widgetMap.mainPanel;
    const id = `widget_${Date.now()}`;

    const widget = Widget.create({
        ...config,
        id,
        type,
        flex : 1
    });

    mainPanel.add(widget);

    return widget;
}

// Remove widget
function removeWidget(widgetId) {
    const widget = Widget.getById(widgetId);
    if (widget) {
        widget.destroy();
    }
}

// Replace widget
function replaceWidget(oldWidgetId, newType, newConfig) {
    const oldWidget = Widget.getById(oldWidgetId);
    const parent = oldWidget?.parent;
    const index = parent?.items.indexOf(oldWidget);

    if (oldWidget && parent) {
        oldWidget.destroy();

        const newWidget = Widget.create({
            ...newConfig,
            type : newType,
            flex : 1
        });

        parent.insert(newWidget, index);
        return newWidget;
    }
}

// Example: Toggle between Gantt and Scheduler
function toggleMainView() {
    const { mainPanel } = dashboard.widgetMap;
    const current = mainPanel.items[0];

    if (current.isGantt) {
        replaceWidget(current.id, 'schedulerpro', { project });
    }
    else {
        replaceWidget(current.id, 'gantt', { project });
    }
}
```

---

## Dashboard State Export/Import

### Complete State Serialization

```typescript
import { Container, StateProvider, Widget } from '@bryntum/core';

class DashboardStateManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
    }

    // Export current state
    exportState() {
        const state = {
            version   : '1.0',
            timestamp : Date.now(),
            widgets   : {},
            layout    : this.dashboard.layout
        };

        this.dashboard.eachWidget(widget => {
            if (widget.stateId) {
                state.widgets[widget.stateId] = widget.state;
            }
        });

        return state;
    }

    // Import state
    async importState(state) {
        if (state.version !== '1.0') {
            throw new Error('Incompatible state version');
        }

        // Apply layout
        this.dashboard.layout = state.layout;

        // Apply widget states
        this.dashboard.eachWidget(widget => {
            if (widget.stateId && state.widgets[widget.stateId]) {
                widget.state = state.widgets[widget.stateId];
            }
        });
    }

    // Save to localStorage
    saveToLocal(key = 'dashboardState') {
        const state = this.exportState();
        localStorage.setItem(key, JSON.stringify(state));
    }

    // Load from localStorage
    loadFromLocal(key = 'dashboardState') {
        const stateJson = localStorage.getItem(key);
        if (stateJson) {
            const state = JSON.parse(stateJson);
            return this.importState(state);
        }
    }

    // Download as file
    downloadState(filename = 'dashboard-state.json') {
        const state = this.exportState();
        const blob = new Blob([JSON.stringify(state, null, 2)], {
            type : 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import from file
    async importFromFile(file) {
        const text = await file.text();
        const state = JSON.parse(text);
        return this.importState(state);
    }
}

// Usage
const dashboard = new Container({
    appendTo : 'container',
    layout   : 'hbox',

    items : {
        gantt : {
            type    : 'gantt',
            stateId : 'gantt',
            flex    : 1
        },
        taskBoard : {
            type    : 'taskboard',
            stateId : 'taskBoard',
            flex    : 1
        }
    },

    tbar : [
        {
            type : 'button',
            text : 'Save State',
            onClick() {
                stateManager.saveToLocal();
            }
        },
        {
            type : 'button',
            text : 'Load State',
            onClick() {
                stateManager.loadFromLocal();
            }
        },
        {
            type : 'button',
            text : 'Download',
            onClick() {
                stateManager.downloadState();
            }
        }
    ]
});

const stateManager = new DashboardStateManager(dashboard);
```

---

## Widget Lifecycle Management

### Proper Destroy and Refresh

```typescript
import { Container, Widget } from '@bryntum/core';

class ManagedDashboard extends Container {
    static $name = 'ManagedDashboard';
    static type = 'manageddashboard';

    static configurable = {
        project : null
    };

    // Called when project changes
    updateProject(project, oldProject) {
        // Update all widgets with new project
        this.eachWidget(widget => {
            if ('project' in widget) {
                widget.project = project;
            }
        });
    }

    // Refresh all widgets
    async refresh() {
        // Mask during refresh
        this.mask('Refreshing...');

        try {
            // Reload project data
            await this.project.load();

            // Trigger refresh on all widgets
            this.eachWidget(widget => {
                if (widget.refresh) {
                    widget.refresh();
                }
            });
        }
        finally {
            this.unmask();
        }
    }

    // Clean shutdown
    doDestroy() {
        // Clean up resources
        this.eachWidget(widget => {
            if (widget.project === this.project) {
                // Don't destroy shared project
                widget.project = null;
            }
        });

        super.doDestroy();
    }
}

ManagedDashboard.initClass();
```

---

## Cross-Widget Event Broadcasting

### EventBus Pattern

```typescript
import { Events, Container } from '@bryntum/core';

// Global event bus
class DashboardEventBus {
    #listeners = new Map();

    on(event, callback) {
        if (!this.#listeners.has(event)) {
            this.#listeners.set(event, new Set());
        }
        this.#listeners.get(event).add(callback);

        // Return unsubscribe function
        return () => this.#listeners.get(event)?.delete(callback);
    }

    emit(event, data) {
        this.#listeners.get(event)?.forEach(callback => callback(data));
    }

    clear() {
        this.#listeners.clear();
    }
}

const eventBus = new DashboardEventBus();

// Gantt widget broadcasting selection
const gantt = new Gantt({
    project,

    listeners : {
        selectionChange({ selected }) {
            eventBus.emit('taskSelected', { tasks : selected });
        }
    }
});

// TaskBoard listening
const taskBoard = new TaskBoard({
    project
});

eventBus.on('taskSelected', ({ tasks }) => {
    // Highlight corresponding cards
    taskBoard.deselectAll();
    tasks.forEach(task => {
        const el = taskBoard.getTaskElement(task);
        el?.classList.add('b-highlighted');
    });
});

// Calendar listening
const calendar = new Calendar({
    project
});

eventBus.on('taskSelected', ({ tasks }) => {
    if (tasks.length) {
        calendar.scrollEventIntoView(tasks[0]);
    }
});
```

---

## Performance Optimization

### Lazy Widget Initialization

```typescript
import { Container, Widget } from '@bryntum/core';

class LazyContainer extends Container {
    static $name = 'LazyContainer';
    static type = 'lazycontainer';

    static configurable = {
        // Widgets to create lazily
        lazyItems : null
    };

    // Create widget when needed
    getOrCreateWidget(key) {
        let widget = this.widgetMap[key];

        if (!widget && this.lazyItems?.[key]) {
            const config = this.lazyItems[key];
            widget = this.add({
                ...config,
                ref : key
            });
        }

        return widget;
    }

    // Show widget (create if needed)
    showWidget(key) {
        const widget = this.getOrCreateWidget(key);
        if (widget) {
            widget.show();
        }
        return widget;
    }
}

LazyContainer.initClass();

// Usage
const dashboard = new LazyContainer({
    appendTo : 'container',

    // Always visible
    items : {
        gantt : {
            type    : 'gantt',
            project,
            flex    : 1
        }
    },

    // Created on demand
    lazyItems : {
        histogram : {
            type    : 'resourcehistogram',
            project,
            partner : 'up.gantt',
            hidden  : true,
            flex    : 1
        },
        utilization : {
            type    : 'resourceutilization',
            project,
            partner : 'up.gantt',
            hidden  : true,
            flex    : 1
        }
    },

    tbar : [
        {
            type : 'button',
            text : 'Show Histogram',
            onClick() {
                dashboard.showWidget('histogram');
            }
        },
        {
            type : 'button',
            text : 'Show Utilization',
            onClick() {
                dashboard.showWidget('utilization');
            }
        }
    ]
});
```

---

## Tab-Based Dashboard

### TabPanel for Multiple Views

```typescript
import { TabPanel, Container } from '@bryntum/core';

const dashboard = new TabPanel({
    appendTo : 'container',

    tabBar : {
        items : {
            newTab : {
                type    : 'button',
                icon    : 'b-icon-add',
                tooltip : 'Add new tab',
                weight  : 1000,
                onClick() {
                    dashboard.add({
                        title : `Tab ${dashboard.items.length + 1}`,
                        items : {
                            content : {
                                type : 'container',
                                html : 'New tab content'
                            }
                        }
                    });
                }
            }
        }
    },

    items : {
        ganttTab : {
            title : 'Gantt Chart',
            items : {
                gantt : {
                    type    : 'gantt',
                    project,
                    flex    : 1
                }
            }
        },
        scheduleTab : {
            title : 'Schedule',
            items : {
                scheduler : {
                    type    : 'schedulerpro',
                    project,
                    flex    : 1
                }
            }
        },
        boardTab : {
            title    : 'Task Board',
            closable : true,  // Allow closing this tab
            items    : {
                taskBoard : {
                    type    : 'taskboard',
                    project,
                    flex    : 1
                }
            }
        }
    },

    listeners : {
        beforeActiveItemChange({ prevActiveItem, activeItem }) {
            console.log(`Switching from ${prevActiveItem?.title} to ${activeItem?.title}`);
        },
        tabClose({ source }) {
            console.log(`Tab ${source.title} closed`);
        }
    }
});

// Programmatic tab switching
dashboard.activeTab = 1;  // Switch to Schedule tab

// Or by reference
dashboard.activeTab = dashboard.widgetMap.boardTab;
```

---

## Popup Widget Dashboard

### Floating Panels

```typescript
import { Popup, Widget, DomHelper } from '@bryntum/core';

class DashboardPopup extends Popup {
    static $name = 'DashboardPopup';
    static type = 'dashboardpopup';

    static configurable = {
        modal       : false,
        centered    : true,
        closable    : true,
        maximizable : true,
        draggable   : true,
        scrollable  : true,
        width       : '80%',
        height      : '80%'
    };

    afterMaximize() {
        // Refresh contained widgets after maximize
        this.eachWidget(widget => {
            if (widget.refresh) {
                widget.refresh();
            }
        });
    }
}

DashboardPopup.initClass();

// Usage
function showDetailPopup(taskRecord) {
    const popup = new DashboardPopup({
        title : `Task Details: ${taskRecord.name}`,

        items : {
            details : {
                type   : 'container',
                layout : 'vbox',
                items  : {
                    info : {
                        type : 'displayfield',
                        label : 'Duration',
                        value : taskRecord.fullDuration
                    },
                    chart : {
                        type   : 'container',
                        flex   : 1,
                        html   : '<canvas id="detailChart"></canvas>'
                    }
                }
            }
        },

        bbar : {
            items : {
                edit : {
                    type     : 'button',
                    text     : 'Edit Task',
                    onAction : () => gantt.editTask(taskRecord)
                },
                close : {
                    type     : 'button',
                    text     : 'Close',
                    onAction : () => popup.close()
                }
            }
        }
    });

    popup.show();
}
```

---

## Gerelateerde Documenten

- [INTEGRATION-SHARED-PROJECT.md](./INTEGRATION-SHARED-PROJECT.md) - Shared ProjectModel patterns
- [INTEGRATION-GANTT-SCHEDULER.md](./INTEGRATION-GANTT-SCHEDULER.md) - Gantt + Scheduler patterns
- [INTEGRATION-CALENDAR-TASKBOARD.md](./INTEGRATION-CALENDAR-TASKBOARD.md) - Calendar + TaskBoard patterns
- [INTEGRATION-EXPORT.md](./INTEGRATION-EXPORT.md) - PDF, Excel, MS Project export
- [INTEGRATION-REALTIME.md](./INTEGRATION-REALTIME.md) - WebSocket, STM, realtime sync
- [INTEGRATION-FRAMEWORKS.md](./INTEGRATION-FRAMEWORKS.md) - React, Vue, Angular integratie
- [INTEGRATION-PERFORMANCE.md](./INTEGRATION-PERFORMANCE.md) - Big datasets, lazy loading
- [DEEP-DIVE-WIDGETS.md](./DEEP-DIVE-WIDGETS.md) - Widget system basics

---

*Bryntum Suite 7.1.0 - Multi-Widget Dashboard Integration*
