# INTEGRATION-SHARED-PROJECT.md

> **Eén ProjectModel voor meerdere views** - Data synchronisatie, shared stores, en cross-product data flow.

---

## Overzicht

Bryntum producten (Gantt, SchedulerPro, Calendar, TaskBoard) kunnen dezelfde `ProjectModel` delen voor naadloze data synchronisatie. Dit document beschrijft de architectuur, data structuren, en implementatie patronen voor cross-product integratie.

---

## Project Data Structuur (JSON)

### Volledige Data Schema

De server response bevat alle stores in een genormaliseerde structuur:

```json
{
  "success": true,
  "project": {
    "calendar": "general",
    "startDate": "2022-01-14",
    "hoursPerDay": 24,
    "daysPerWeek": 5,
    "daysPerMonth": 20
  },
  "calendars": {
    "rows": [
      {
        "id": "general",
        "name": "General",
        "intervals": [
          {
            "recurrentStartDate": "on Sat",
            "recurrentEndDate": "on Mon",
            "isWorking": false
          }
        ],
        "children": [
          {
            "id": "business",
            "name": "Business",
            "intervals": [
              {
                "recurrentStartDate": "every weekday at 12:00",
                "recurrentEndDate": "every weekday at 13:00",
                "isWorking": false
              },
              {
                "recurrentStartDate": "every weekday at 17:00",
                "recurrentEndDate": "every weekday at 08:00",
                "isWorking": false
              }
            ]
          },
          {
            "id": "night",
            "name": "Night shift",
            "intervals": [
              {
                "recurrentStartDate": "every weekday at 6:00",
                "recurrentEndDate": "every weekday at 22:00",
                "isWorking": false
              }
            ]
          }
        ]
      }
    ]
  },
  "tasks": {
    "rows": [
      {
        "id": 1000,
        "name": "Launch SaaS Product",
        "percentDone": 50,
        "startDate": "2022-01-14",
        "expanded": true,
        "children": [
          {
            "id": 11,
            "name": "Install Apache",
            "percentDone": 100,
            "startDate": "2022-01-14",
            "duration": 3,
            "color": "teal",
            "rollup": true,
            "status": "done",
            "weight": 1100
          },
          {
            "id": 12,
            "name": "Configure firewall",
            "percentDone": 50,
            "duration": 3,
            "showInTimeline": true,
            "status": "wip",
            "weight": 1200
          }
        ]
      }
    ]
  },
  "dependencies": {
    "rows": [
      {
        "id": 1,
        "fromTask": 11,
        "toTask": 15,
        "lag": 2
      }
    ]
  },
  "resources": {
    "rows": [
      {
        "id": 1,
        "name": "Celia",
        "city": "Barcelona",
        "calendar": null,
        "image": "celia.png"
      }
    ]
  },
  "assignments": {
    "rows": [
      {
        "id": 1,
        "event": 11,
        "resource": 1
      }
    ]
  },
  "timeRanges": {
    "rows": [
      {
        "id": 1,
        "name": "Important date",
        "startDate": "2022-01-30",
        "duration": 0,
        "cls": "fa fa-diamond"
      }
    ]
  }
}
```

### Cross-Product Task Fields

Voor integratie met TaskBoard zijn deze extra fields nodig:

| Field | Type | Beschrijving | Product |
|-------|------|--------------|---------|
| `status` | string | Kanban column identifier (todo, wip, review, done) | TaskBoard |
| `weight` | number | Sorteervolgorde binnen TaskBoard column | TaskBoard |
| `showInTimeline` | boolean | Tonen in timeline view | Gantt |
| `rollup` | boolean | Parent task rollup indicator | Gantt |
| `label` | string | Extra categorisatie label | TaskBoard |
| `prio` | string | Swimlane identifier (critical, high, medium, low) | TaskBoard |

---

## TypeScript Interfaces

### Core Interfaces

```typescript
interface ProjectConfig {
    // Timing
    startDate: Date | string;
    endDate?: Date | string;
    hoursPerDay?: number;
    daysPerWeek?: number;
    daysPerMonth?: number;

    // Calendar
    calendar?: string;

    // Constraints
    autoSetConstraints?: boolean;

    // Data transport
    transport?: TransportConfig;
    loadUrl?: string;
    syncUrl?: string;
    autoLoad?: boolean;
    autoSync?: boolean;

    // Development
    validateResponse?: boolean;

    // Store configurations
    taskStore?: TaskStoreConfig;
    resourceStore?: ResourceStoreConfig;
    assignmentStore?: AssignmentStoreConfig;
    dependencyStore?: DependencyStoreConfig;
    calendarStore?: CalendarStoreConfig;
}

interface TransportConfig {
    load?: {
        url: string;
        method?: 'GET' | 'POST';
        headers?: Record<string, string>;
        params?: Record<string, any>;
    };
    sync?: {
        url: string;
        method?: 'POST';
        headers?: Record<string, string>;
    };
}

interface TaskStoreConfig {
    tree?: boolean;
    fields?: FieldDefinition[];
    modelClass?: typeof TaskModel;
    listeners?: TaskStoreListeners;
}

interface FieldDefinition {
    name: string;
    type?: 'string' | 'number' | 'boolean' | 'date' | 'object';
    defaultValue?: any;
    persist?: boolean;
    convert?: (value: any, record: Model) => any;
}

interface ResourceStoreConfig {
    tree?: boolean;
    modelClass?: typeof ResourceModel;
    fields?: FieldDefinition[];
}

interface TaskStoreListeners {
    add?: (event: StoreAddEvent) => void;
    remove?: (event: StoreRemoveEvent) => void;
    update?: (event: StoreUpdateEvent) => void;
    change?: (event: StoreChangeEvent) => void;
}

interface StoreUpdateEvent {
    record: TaskModel;
    changes: Record<string, { oldValue: any; value: any }>;
    source: Store;
}
```

### Custom Model Classes

```typescript
// Custom TaskModel met project task detection
class Task extends TimePhasedTaskModel {
    static $name = 'Task';

    static fields = [
        { name: 'isProjectTask', type: 'boolean' }
    ];

    // Navigeer omhoog in de hiërarchie om het project te vinden
    get projectTask(): Task | null {
        let result: Task | null = null;

        this.bubbleWhile((task: Task) => {
            if (task.isProjectTask) {
                result = task;
            }
            // Stop als project gevonden of aan root
            return !result && task.parent && !task.parent.isRoot;
        });

        return result;
    }
}

// Custom ResourceModel met computed statistics
class TeamMember extends ResourceModel {
    static $name = 'TeamMember';

    get notStarted(): number {
        return this.events.reduce((count, event) => {
            return event.status === 'todo' ? count + 1 : count;
        }, 0);
    }

    get inProgress(): number {
        return this.events.reduce((count, event) => {
            return event.status === 'in-progress' ? count + 1 : count;
        }, 0);
    }

    get completed(): number {
        return this.events.reduce((count, event) => {
            return event.status === 'done' ? count + 1 : count;
        }, 0);
    }
}

// Initialiseer custom classes
Task.initClass();
TeamMember.initClass();
```

---

## Store Architectuur

### Store Hiërarchie

```
ProjectModel
├── taskStore (TaskStore)
│   ├── Tree structure (parent/children)
│   ├── Scheduling data (startDate, endDate, duration)
│   ├── Progress data (percentDone)
│   └── Cross-product fields (status, weight, label)
│
├── resourceStore (ResourceStore)
│   ├── Resource info (name, image, initials)
│   ├── Grouping fields (city, department)
│   └── Calendar reference
│
├── assignmentStore (AssignmentStore)
│   ├── Event/Task reference
│   ├── Resource reference
│   └── Units (allocation percentage)
│
├── dependencyStore (DependencyStore)
│   ├── fromTask / toTask
│   ├── Dependency type
│   └── Lag/lead time
│
├── calendarStore (CalendarStore)
│   ├── Working intervals
│   ├── Non-working intervals
│   └── Parent/child calendars
│
└── timeRangeStore (TimeRangeStore)
    ├── Date ranges
    └── Visual markers
```

### Store Chaining voor Gefilterde Views

```typescript
import { Store } from '@bryntum/core';

const project = new ProjectModel({
    loadUrl  : 'data/data.json',
    autoLoad : true
});

// Chain voor team statistics grid
const teamGridStore = project.resourceStore.chain(
    undefined,  // Geen filter
    undefined,  // Geen sorter
    { tree: null }  // Flatten tree structure
);

// Chain voor gefilterde TaskBoard
const filteredTaskStore = project.taskStore.chain(
    // Filter alleen leaf tasks (geen parents)
    task => task.isLeaf,
    // Sorteer op weight
    { field: 'weight', ascending: true }
);

// Gebruik in widgets
const taskBoard = new TaskBoard({
    project,
    chainFilters : true,  // Propageer filters naar chained store
    // ...
});
```

### Store.StopBranch voor Tree Grouping

Bij ResourceUtilization wordt `Store.StopBranch` gebruikt om grouping te stoppen:

```typescript
import { Store, ResourceUtilization } from '@bryntum/gantt';

const treeGroupLevels = [
    // Eerste niveau: groepeer per resource
    ({ origin }) => {
        // Als origin een resource is zonder assignments, stop grouping
        if (origin.isResourceModel) {
            return Store.StopBranch;
        }
        // origin kan een array van time-phased assignments zijn
        origin = origin[0] || origin;
        return origin.resource;
    },

    // Tweede niveau: groepeer per project
    ({ origin }) => {
        if (origin.isResourceModel) {
            return Store.StopBranch;
        }
        origin = origin[0] || origin;
        return origin.event?.projectTask || 'No Project';
    }
];

const resourceUtilization = new ResourceUtilization({
    project,
    partner : gantt,

    features : {
        treeGroup : {
            levels : treeGroupLevels
        }
    },

    // Dynamisch grouping wijzigen
    tbar : {
        items : {
            groupButtons : {
                type        : 'buttongroup',
                toggleGroup : true,
                items       : [
                    {
                        text    : 'Resource, Project',
                        pressed : true,
                        onAction() {
                            resourceUtilization.group(treeGroupLevels);
                        }
                    },
                    {
                        text    : 'City, Resource',
                        onAction() {
                            resourceUtilization.group([
                                // Groepeer per city
                                ({ origin }) => origin.isResourceModel
                                    ? origin.city
                                    : origin.resource.city,
                                // Dan per resource
                                ({ origin }) => origin.isResourceModel
                                    ? Store.StopBranch
                                    : origin.resource
                            ]);
                        }
                    },
                    {
                        text    : 'Default',
                        onAction() {
                            resourceUtilization.clearGroups();
                        }
                    }
                ]
            }
        }
    }
});
```

---

## AvatarRendering Helper

Voor consistente resource avatar weergave across products:

```typescript
import { AvatarRendering, TreeGrid } from '@bryntum/gantt';

class ResourceGrid extends TreeGrid {
    static $name = 'ResourceGrid';
    static type = 'resourcegrid';

    avatarRendering: AvatarRendering;

    static configurable = {
        resourceImagePath : '../_shared/images/users/',
        selectionMode     : {
            row         : true,
            multiSelect : true
        },

        columns : [
            {
                type   : 'tree',
                text   : 'Resources',
                field  : 'name',
                flex   : 1,
                renderer({ record, grid, value }) {
                    return {
                        class    : 'b-resource-info',
                        children : [
                            grid.avatarRendering.getResourceAvatar({
                                initials : record.initials,
                                color    : record.eventColor,
                                iconCls  : record.iconCls,
                                imageUrl : record.image
                                    ? `${grid.resourceImagePath}${record.image}`
                                    : null
                            }),
                            value
                        ]
                    };
                }
            }
        ]
    };

    afterConstruct() {
        // Initialiseer AvatarRendering met grid element
        this.avatarRendering = new AvatarRendering({
            element : this.element
        });
    }
}

ResourceGrid.initClass();
```

### Avatar in ResourceUtilization Column

```typescript
const resourceUtilization = new ResourceUtilization({
    project,
    partner           : gantt,
    resourceImagePath : '../_shared/images/users/',

    columns : [
        {
            type  : 'tree',
            field : 'name',
            width : 280,
            text  : 'Resource / Task',

            renderer({ record, grid, value, row }) {
                // Resolve naar origin record
                record = grid.resolveRecordToOrigin(record);

                if (record.key?.isResourceModel) {
                    record = record.key;
                }
                else if (Array.isArray(record)) {
                    record = record[0];
                }

                // Resource row met avatar
                if (record.isResourceModel) {
                    row.assignCls('b-resource-row');

                    if (!this.avatarRendering) {
                        this.avatarRendering = new AvatarRendering({
                            element : grid.element
                        });
                    }

                    return {
                        class    : 'b-resource-info',
                        children : [
                            this.avatarRendering.getResourceAvatar({
                                initials : record.initials,
                                color    : record.eventColor,
                                iconCls  : record.iconCls,
                                imageUrl : record.image
                                    ? `${grid.resourceImagePath}${record.image}`
                                    : null
                            }),
                            value
                        ]
                    };
                }

                // Assignment row
                if (record.isAssignmentModel) {
                    return StringHelper.encodeHtml(record.event?.name);
                }

                // Group row
                return record.key?.name || record.key;
            }
        }
    ]
});
```

---

## ResourceAssignment Column met Avatar Tooltip

De `resourceassignment` column ondersteunt interactieve avatar tooltips:

```typescript
const gantt = new Gantt({
    project,
    resourceImagePath : '../_shared/images/users/',

    columns : [
        { type: 'name', minWidth: 200 },
        {
            type                   : 'resourceassignment',
            width                  : 200,
            showAvatars            : true,
            enableResourceDragging : true,  // Drag resources naar andere tasks

            avatarTooltip : {
                allowOver        : true,
                autoUpdateFields : true,

                items : {
                    name           : { name: 'name' },
                    units          : { name: 'units' },
                    label          : { html: ' % assigned ' },
                    minusButton    : {
                        type      : 'button',
                        rendition : 'text',
                        icon      : 'fa-minus-circle',
                        onClick   : 'up.onMinusClick'
                    },
                    plusButton     : {
                        type      : 'button',
                        rendition : 'text',
                        icon      : 'fa-plus-circle',
                        onClick   : 'up.onPlusClick'
                    },
                    unassignButton : {
                        type      : 'button',
                        rendition : 'text',
                        icon      : 'fa-trash',
                        tooltip   : 'Unassign',
                        onClick   : 'up.onUnassignClick'
                    }
                },

                onMinusClick() {
                    this.record.units = Math.max(0, this.record.units - 10);
                    if (this.record.units === 0) {
                        this.record.remove();
                        this.hide();
                    }
                },

                onPlusClick() {
                    this.record.units = Math.min(100, this.record.units + 10);
                },

                onUnassignClick() {
                    this.record.remove();
                    this.hide();
                }
            },

            avatarTooltipTemplate({ assignmentRecord, resourceRecord, tooltip }) {
                tooltip.record = assignmentRecord;
                tooltip.widgetMap.name.html = resourceRecord.name + ' is&nbsp;';
            }
        }
    ]
});
```

---

## CrudManager met Extra Stores

Voor Calendar met externe event source:

```typescript
import { Calendar, Grid, GridRowModel, Duration } from '@bryntum/calendar';

const calendar = new Calendar({
    date : new Date(2020, 9, 12),

    crudManager : {
        loadUrl  : 'data/data.json',
        autoLoad : true,

        // Extra stores naast standaard event/resource stores
        stores : {
            id         : 'unplanned',
            modelClass : class extends GridRowModel {
                // Computed field voor duration weergave
                get fullDuration() {
                    return new Duration({
                        unit      : this.durationUnit,
                        magnitude : this.duration
                    });
                }
            }
        }
    },

    features : {
        externalEventSource : {
            grid      : 'unscheduled',
            droppable : true
        }
    },

    // Grid in sidebar voor unplanned events
    sidebar : {
        items : {
            externalEvents : {
                type   : 'grid',
                id     : 'unscheduled',
                weight : 250,
                store  : 'unplanned',  // Referentie naar CrudManager store

                features : {
                    stripe   : true,
                    sort     : 'name',
                    cellEdit : false
                },

                columns : [{
                    text  : 'Unassigned tasks',
                    flex  : 1,
                    field : 'name'
                }, {
                    type            : 'duration',
                    width           : 80,
                    align           : 'right',
                    abbreviatedUnit : true
                }]
            }
        }
    },

    listeners : {
        beforeDropExternal({ eventRecord, dropOnCalendar }) {
            // Verwijder uit calendar als buiten gedropt
            if (!dropOnCalendar) {
                calendar.eventStore.remove(eventRecord);
            }
        }
    }
});

// Toegang tot de unplanned store
const unplannedStore = calendar.crudManager.getStore('unplanned');
```

---

## Status Synchronisatie tussen Views

### Automatische Status -> PercentDone Mapping

```typescript
const project = new ProjectModel({
    taskStore : {
        fields : [
            { name: 'status', defaultValue: 'todo' },
            'weight'
        ],

        listeners : {
            update({ record: task, changes }) {
                // Alleen reageren op status changes
                if (!changes.status) return;

                // Map status naar percentDone
                const statusToPercent: Record<string, number> = {
                    'todo'        : 0,
                    'wip'         : 50,
                    'in-progress' : 50,
                    'review'      : 90,
                    'done'        : 100
                };

                const newPercent = statusToPercent[task.status];
                if (newPercent !== undefined) {
                    task.percentDone = newPercent;
                }
            }
        }
    }
});
```

### Bidirectionele Sync (PercentDone -> Status)

```typescript
const project = new ProjectModel({
    taskStore : {
        fields : ['status', 'weight'],

        listeners : {
            update({ record: task, changes }) {
                // Status -> PercentDone
                if (changes.status) {
                    const map = { todo: 0, wip: 50, review: 90, done: 100 };
                    task.percentDone = map[task.status] ?? task.percentDone;
                }

                // PercentDone -> Status (alleen bij expliciete percentDone change)
                if (changes.percentDone && !changes.status) {
                    const percent = task.percentDone;

                    if (percent === 0) {
                        task.status = 'todo';
                    }
                    else if (percent === 100) {
                        task.status = 'done';
                    }
                    else if (percent >= 90) {
                        task.status = 'review';
                    }
                    else {
                        task.status = 'wip';
                    }
                }
            }
        }
    }
});
```

---

## Cross-View Selection & Scroll Sync

### Selection Change Handlers

```typescript
// Gantt -> TaskBoard
gantt.on('selectionChange', ({ selected }) => {
    if (selected.length) {
        taskBoard.scrollToTask(selected[0]);
    }
});

// TaskBoard -> Gantt
taskBoard.on('selectionChange', async ({ select }) => {
    if (select.length) {
        await gantt.scrollTaskIntoView(select[0], {
            animate   : true,
            highlight : true
        });
    }
});

// Scheduler -> Gantt (highlight tasks van geselecteerde resources)
scheduler.on('selectionChange', ({ selection }) => {
    const tasks = gantt.taskStore.query(
        task => selection.some(resource => task.resources.includes(resource))
    );
    gantt.highlightTasks({
        tasks,
        unhighlightOthers : true
    });
});
```

### Hover Synchronisatie

```typescript
// Calendar -> TaskBoard hover
calendar.on({
    eventMouseEnter({ eventRecord }) {
        const el = taskBoard.getTaskElement(eventRecord);
        el?.classList.add('b-hovered');
    },

    eventMouseLeave({ eventRecord }) {
        const el = taskBoard.getTaskElement(eventRecord);
        el?.classList.remove('b-hovered');
    }
});

// TaskBoard -> Calendar hover
taskBoard.on({
    taskMouseEnter({ taskRecord }) {
        // Niet highlighten tijdens drag
        if (this.features.taskDrag.isDragging) return;

        const el = calendar.getElementFromEventRecord(taskRecord);
        el?.classList.add('b-hovered');
    },

    taskMouseLeave({ taskRecord }) {
        if (this.features.taskDrag.isDragging) return;

        const el = calendar.getElementFromEventRecord(taskRecord);
        el?.classList.remove('b-hovered');
    }
});
```

---

## TimePhasedProjectModel

Voor resource utilization met time-phased data:

```typescript
import {
    TimePhasedProjectModel,
    TimePhasedTaskModel,
    Gantt,
    ResourceUtilization,
    Splitter
} from '@bryntum/gantt';

class Task extends TimePhasedTaskModel {
    static $name = 'Task';

    static fields = [
        { name: 'isProjectTask', type: 'boolean' }
    ];

    get projectTask(): Task | null {
        let result: Task | null = null;

        this.bubbleWhile((task: Task) => {
            if (task.isProjectTask) {
                result = task;
            }
            return !result && task.parent && !task.parent.isRoot;
        });

        return result;
    }
}

const project = new TimePhasedProjectModel({
    taskModelClass     : Task,
    loadUrl            : 'data/load.json',
    autoLoad           : true,
    autoSetConstraints : true,
    validateResponse   : true
});

const gantt = new Gantt({
    project,
    appendTo    : 'container',
    collapsible : true,
    header      : false,
    minHeight   : 0,
    viewPreset  : 'weekAndDay',
    tickSize    : 40,
    columnLines : true,

    columns : [
        { type: 'name', width: 280 },
        { type: 'resourceassignment', showAvatars: true, width: 170 }
    ]
});

new Splitter({
    appendTo    : 'container',
    showButtons : true
});

const resourceUtilization = new ResourceUtilization({
    appendTo          : 'container',
    project,
    partner           : gantt,
    rowHeight         : 45,
    collapsible       : true,
    header            : false,
    minHeight         : 0,
    showBarTip        : true,
    resourceImagePath : '../_shared/images/users/',

    // Series configuratie
    series : {
        effort   : { disabled: false },
        cost     : { disabled: true },
        quantity : { disabled: true }
    },

    features : {
        treeGroup : {
            levels : [
                ({ origin }) => origin.isResourceModel
                    ? Store.StopBranch
                    : (origin[0] || origin).resource,
                ({ origin }) => origin.isResourceModel
                    ? Store.StopBranch
                    : (origin[0] || origin).event?.projectTask || 'No Project'
            ]
        },
        scheduleContext     : { keyNavigation: true, multiSelect: true },
        allocationCellEdit  : true,
        allocationCopyPaste : true
    }
});
```

---

## Best Practices

### 1. Project Initialisatie Pattern

```typescript
// Maak project aan vóór widgets
const project = new ProjectModel({
    loadUrl          : '/api/project/load',
    autoLoad         : true,
    validateResponse : process.env.NODE_ENV !== 'production'
});

// Wacht optioneel op data loading
await project.load();

// Maak widgets aan met shared project
const gantt = new Gantt({ project, appendTo: 'gantt' });
const taskBoard = new TaskBoard({ project, appendTo: 'board' });
```

### 2. Cross-Product Field Declaratie

```typescript
const project = new ProjectModel({
    taskStore : {
        fields : [
            // TaskBoard integration
            { name: 'status', defaultValue: 'todo' },
            { name: 'weight', type: 'number', defaultValue: 0 },
            { name: 'prio', defaultValue: 'medium' },

            // UI enhancement
            { name: 'label' },
            { name: 'showInTimeline', type: 'boolean' },

            // Grouping
            { name: 'isProjectTask', type: 'boolean' }
        ]
    },

    resourceStore : {
        tree   : true,  // Voor hiërarchische teams
        fields : [
            { name: 'city' },
            { name: 'department' }
        ]
    }
});
```

### 3. Widget Cross-References

```typescript
const container = new Container({
    items : {
        gantt     : { type: 'gantt', project },
        taskBoard : { type: 'taskboard', project },
        calendar  : { type: 'calendar', project }
    }
});

const { gantt, taskBoard, calendar } = container.widgetMap;

// Setup cross-references voor renderers en event handlers
gantt.taskBoard = taskBoard;
gantt.calendar = calendar;
taskBoard.gantt = gantt;
taskBoard.calendar = calendar;
calendar.gantt = gantt;
calendar.taskBoard = taskBoard;

// Debug access
Object.assign(window, { gantt, taskBoard, calendar, project });
```

### 4. Cleanup bij Unmount

```typescript
function cleanup() {
    // Clear cross-references
    gantt.taskBoard = null;
    gantt.calendar = null;
    taskBoard.gantt = null;
    calendar.taskBoard = null;

    // Destroy widgets (in volgorde)
    gantt.destroy();
    taskBoard.destroy();
    calendar.destroy();

    // Destroy project als laatste
    project.destroy();
}
```

### 5. Batch Updates voor Performance

```typescript
// Bij bulk operaties, batch updates
project.taskStore.beginBatch();

tasks.forEach(task => {
    task.status = 'done';
    task.percentDone = 100;
});

project.taskStore.endBatch();

// Of suspend refresh
gantt.suspendRefresh = true;
// ... bulk operations
gantt.suspendRefresh = false;
gantt.refresh();
```

---

## State Tracking Manager (STM) - Undo/Redo

### STM Configuratie

```typescript
import { ProjectModel, TaskModel, DependencyModel, StringHelper } from '@bryntum/gantt';

const project = new ProjectModel({
    loadUrl  : 'data/project.json',
    autoLoad : true,

    // State Tracking Manager configuratie
    stm : {
        // Auto-record elke wijziging
        autoRecord : true,

        // Enable revisions voor WebSocket sync
        revisionsEnabled : true
    },

    validateResponse : process.env.NODE_ENV !== 'production'
});

// STM is pas actief na enable()
// UndoRedo widget doet dit automatisch
// Anders handmatig: project.stm.enable()
```

### Transaction Types

```typescript
// STM registreert verschillende action types
type STMActionType =
    | 'UpdateAction'         // Record field update
    | 'EventUpdateAction'    // Task/Event specific update
    | 'AddAction'            // Record toegevoegd
    | 'RemoveAction'         // Record verwijderd
    | 'InsertChildAction';   // Child inserted in tree

interface STMAction {
    type: STMActionType;
    model?: Model;
    parentModel?: Model;
    modelList?: Model[];
    newData?: object;
    insertIndex?: number;
}

interface STMTransaction {
    title: string;
    queue: STMAction[];
    length: number;
}
```

### Custom Actions Grid

```typescript
import { TreeGrid, Collection } from '@bryntum/core';

// Prevent deselecting last item
class ActionsCollection extends Collection {
    splice(index = 0, toRemove = [], toAdd = []) {
        const lengthAfter = this.count -
            (Array.isArray(toRemove) ? toRemove.length : toRemove) +
            toAdd.length;

        if (lengthAfter === 1) {
            if (toAdd.length === 0 ||
                (toAdd.length === 1 && (toAdd[0].id === -1 || toAdd[0].isParent))) {
                super.splice(index, toRemove, ...toAdd);
            }
        }
    }
}

class ActionsGrid extends TreeGrid {
    static $name = 'ActionsGrid';
    static type = 'actionsgrid';

    static configurable = {
        stm      : null,
        readOnly : true,

        features : {
            cellEdit : false
        },

        recordCollection : new ActionsCollection(),

        store : {
            fields : ['idx', 'title', 'changes'],
            data   : [{
                id      : -1,
                idx     : 0,
                title   : 'Initial state',
                changes : ''
            }]
        },

        columns : [
            { text : '#', field : 'idx', width : '1em', sortable : false },
            { text : 'Action', field : 'title', flex : 0.4, type : 'tree', sortable : false },
            { text : 'Changes', field : 'changes', flex : 0.6, sortable : false }
        ]
    };

    // Navigate to selected transaction
    onSelectionChange() {
        const { stm } = this;
        const action = this.selectedRecord;

        if (action && action.parent.isRoot) {
            const idx = action.idx;

            if (stm.position < idx) {
                stm.redo(idx - stm.position);
            }
            else if (stm.position > idx) {
                stm.undo(stm.position - idx);
            }
        }
    }

    updateStm(stm) {
        stm.on({
            recordingStop : 'onRecordingStop',
            restoringStop : 'onRestoringStop',
            thisObj       : this
        });
    }

    onRecordingStop({ stm, transaction, reason }) {
        if (reason.rejected) return;

        const actionStore = this.store;
        const toRemove = actionStore.rootNode.children.slice(stm.position);

        const action = actionStore.rootNode.insertChild({
            idx      : stm.position,
            title    : transaction.title,
            changes  : `${transaction.length} step${transaction.length > 1 ? 's' : ''}`,
            expanded : false,

            // Transaction details as children
            children : transaction.queue.map((action, idx) => {
                let { type, model, parentModel, modelList, newData } = action;
                let title = '', changes = '';

                if (!model) {
                    model = parentModel || modelList?.[modelList.length - 1];
                }

                // Action-specific titles
                if (type === 'EventUpdateAction') {
                    title = `Edit task ${model.name}`;
                    changes = StringHelper.safeJsonStringify(newData);
                }
                else if (type === 'AddAction' && model instanceof TaskModel) {
                    title = `Add task ${model.name}`;
                }
                else if (type === 'RemoveAction' && model instanceof TaskModel) {
                    title = `Remove task ${model.name}`;
                }
                else if (type === 'AddAction' && model instanceof DependencyModel) {
                    title = `Link ${model.fromEvent?.name} -> ${model.toEvent?.name}`;
                }
                else if (type === 'InsertChildAction') {
                    title = `Insert ${model.name} at position ${action.insertIndex}`;
                }

                return { idx: `${stm.position}.${idx + 1}`, title, changes };
            })
        }, toRemove[0]);

        this.selectedRecord = action;

        if (toRemove.length) {
            actionStore.rootNode.removeChild(toRemove);
        }
    }

    onRestoringStop({ stm }) {
        this.selectedRecord = this.store.rootNode.children[stm.position];
    }
}

ActionsGrid.initClass();
```

### UndoRedo Widget Integratie

```typescript
const gantt = new Gantt({
    project,

    // Keyboard shortcuts Ctrl+Z, Ctrl+Y
    enableUndoRedoKeys : true,

    tbar : [
        {
            type  : 'undoredo',
            text  : true,
            items : {
                // Verberg transactions combo
                transactionsCombo : null
            }
        }
    ]
});
```

---

## WebSocket Realtime Synchronization

### WebSocket Project Mixin

```typescript
import { ProjectModel, Base, Events, Toast } from '@bryntum/schedulerpro';

const ProjectWebSocketHandlerMixin = Target => class extends (Target || Base) {
    static configurable = {
        wsAddress           : null,
        wsUserName          : '',
        wsAutoLoad          : true,
        wsConnectionTimeout : 60000,
        wsProjectId         : null
    };

    // Send message via WebSocket
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

        this.trigger('wsMessage', { data });

        if (command === 'error' || 'error' in data) {
            Toast.show(data.error || data.message);
            return;
        }

        if (command === 'project_change') {
            this.trigger('wsBeforeReceiveChanges');

            // Apply revisions from other clients
            await this.applyRevisions(payload.revisions.map(r => ({
                revisionId            : r.revision,
                localRevisionId       : r.localRevision,
                conflictResolutionFor : r.conflictResolutionFor,
                clientId              : r.client,
                changes               : r.changes
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

    // Open connection
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

    // Load data via WebSocket
    async wsLoad() {
        if (this.wsProjectId == null) return;

        await this.wsSend('dataset', { project: this.wsProjectId });

        // Wait for dataset response
        await new Promise(resolve => {
            const detacher = this.ion({
                wsReceiveDataset() {
                    detacher();
                    resolve(true);
                },
                expires : {
                    delay : this.wsConnectionTimeout,
                    alt   : () => {
                        detacher();
                        resolve(false);
                    }
                }
            });
        });

        await this.commitAsync();
        this.trigger('wsLoad');
    }

    // Handle revision notifications
    async handleRevisionNotification({
        localRevisionId,
        conflictResolutionFor,
        clientId,
        changes
    }) {
        if (this.wsProjectId == null) return;

        const revision = {
            revision: localRevisionId,
            clientId,
            changes
        };

        if (conflictResolutionFor) {
            revision.conflictResolutionFor = conflictResolutionFor;
        }

        if (this.isAutoSyncSuspended) {
            this._queuedRevisions = this._queuedRevisions || [];
            this._queuedRevisions.push(revision);
            this.trigger('revisionQueued', {
                length: this._queuedRevisions.length
            });
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

    wsClose() {
        this.websocketManager?.close();
    }
};

// Create WebSocket-enabled ProjectModel
class WebSocketProjectModel extends ProjectWebSocketHandlerMixin(ProjectModel) {
    static $name = 'WebsocketProjectModel';
}
```

### WebSocket Manager

```typescript
class WebSocketManager extends Events(Base) {
    static webSocketImplementation = WebSocket;

    static configurable = {
        address     : '',
        userName    : 'User',
        autoConnect : true
    };

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

    async open() {
        if (this._openPromise) return this._openPromise;
        if (!this.address) {
            console.warn('Server address cannot be empty');
            return;
        }
        if (this.isOpened) return true;

        this.connector = new WebSocket(this.address);
        this.attachSocketListeners(this.connector);

        let detacher;

        this._openPromise = new Promise(resolve => {
            detacher = this.ion({
                open()  { resolve(true); },
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

    send(command, data = {}) {
        this.connector?.send(JSON.stringify({ command, data }));
    }

    close() {
        if (this.connector) {
            this.detachSocketListeners(this.connector);
            this.connector.close();
            this.connector = null;
            this.trigger('close');
        }
    }

    attachSocketListeners(connector) {
        connector.addEventListener('open', this.onWsOpen);
        connector.addEventListener('close', this.onWsClose);
        connector.addEventListener('message', this.onWsMessage);
        connector.addEventListener('error', this.onWsError);
    }

    onWsMessage = (message) => {
        try {
            const data = JSON.parse(message.data);
            this.trigger('message', { data });
        }
        catch (error) {
            this.trigger('error', { error });
        }
    };
}
```

### Realtime Dashboard Setup

```typescript
const project = new WebSocketProjectModel({
    stm : {
        revisionsEnabled : true
    }
});

const scheduler = new SchedulerPro({
    project,

    enableTransactionalFeatures : true,

    tbar : {
        items : {
            undoRedo : {
                type : 'undoredo'
            },
            autoSync : {
                type  : 'slidetoggle',
                text  : 'Auto-sync',
                value : true,
                onChange({ checked }) {
                    project[checked ? 'resumeAutoSync' : 'suspendAutoSync']();
                }
            },
            triggerSync : {
                type   : 'button',
                text   : 'Sync',
                hidden : true,
                onClick() {
                    project.resumeAutoSync();
                    project.suspendAutoSync();
                }
            }
        }
    }
});

// Badge voor queued revisions
project.on({
    revisionQueued({ length }) {
        scheduler.tbar.widgetMap.triggerSync.badge = length;
    },
    revisionQueueClear() {
        scheduler.tbar.widgetMap.triggerSync.badge = null;
    }
});

// Login
await project.wsSend('login', { login: username, password: '' });
project.wsProjectId = 1;
```

---

## Model Relations

### Foreign Key Relations

```typescript
import { Model, Store, TaskModel } from '@bryntum/gantt';

// Related model
class Color extends Model {
    static $name = 'Color';

    static fields = ['name'];
}

// Related store
const colorStore = new Store({
    modelClass : Color,
    data       : [
        { id: 1, name: 'Red' },
        { id: 2, name: 'Green' },
        { id: 3, name: 'Blue' }
    ]
});

// Task with relation
class Task extends TaskModel {
    static $name = 'Task';

    static fields = [
        { name: 'colorId', type: 'number' }
    ];

    static relations = {
        color : {
            foreignKey   : 'colorId',
            foreignStore : colorStore
        }
    };
}

// CRITICAL: Expose relations voor property access
Task.exposeRelations();

// Nu werkt: task.color.name
```

### Bi-directional Relations

```typescript
class TimeRow extends Model {
    static $name = 'TimeRow';

    static fields = [
        'id',
        'employeeId',
        'project',
        'hours',
        'attested'
    ];

    static relations = {
        employee : {
            foreignKey             : 'employeeId',
            foreignStore           : 'employeeStore',
            relatedCollectionName  : 'timeRows',
            // Propagate changes to parent
            propagateRecordChanges : true
        }
    };
}

// Parent model with calculated fields
class Employee extends Model {
    static $name = 'Employee';

    static fields = [
        'id', 'firstName', 'name',
        { name: 'start', type: 'date' },
        'email'
    ];

    // Calculated from related records
    get unattested() {
        return this.timeRows?.reduce(
            (acc, r) => acc + (r.attested ? 0 : 1),
            0
        );
    }

    get totalTime() {
        return this.timeRows?.reduce(
            (acc, r) => acc + r.hours,
            0
        );
    }
}

// Setup stores with relation
const employeeStore = new Store({
    modelClass : Employee,
    data       : employees
});

const timeRowStore = new Store({
    modelClass    : TimeRow,
    employeeStore,  // Required for relation
    data          : timeRows
});
```

### Attaching Extra Stores

```typescript
const project = new ProjectModel({
    taskModelClass : Task,

    taskStore : {
        // Extra store attached for relations
        colorStore
    },

    autoLoad : true,
    loadUrl  : 'data/project.json',

    listeners : {
        load({ source }) {
            // Set relations after load
            source.taskStore.forEach(task => {
                task.color = colorStore.getAt(
                    Math.floor(Math.random() * colorStore.count)
                );
            }, this, { includeFilteredOutRecords: true });

            // Re-apply filters
            source.taskStore.filter();
        }
    }
});
```

---

## Infinite Scroll & Lazy Loading

### CrudManager Lazy Load

```typescript
const scheduler = new SchedulerPro({
    viewPreset : 'dayAndMonth',

    // Center on specific date
    visibleDate : new Date(2024, 1, 6),

    // Enable infinite timeline
    infiniteScroll  : true,
    bufferCoef      : 20,
    bufferThreshold : 0.01,

    // Prevent too large date ranges
    minZoomLevel : 11,
    tickSize     : 30,

    project : {
        autoLoad       : true,
        autoSync       : true,
        lazyLoad       : true,  // KEY: Enable lazy loading
        loadUrl        : 'php/read.php',
        syncUrl        : 'php/sync.php',
        phantomIdField : 'phantomId',

        // Disable sync on load for lazy-loaded stores
        assignmentStore : {
            syncDataOnLoad : false
        },
        resourceStore : {
            syncDataOnLoad : false,
            fields         : [
                // Non-persisted fields
                { name: 'calendar', persist: false },
                { name: 'maxUnit', persist: false },
                { name: 'parentId', persist: false }
            ]
        },
        eventStore : {
            syncDataOnLoad : false,
            fields         : [
                { name: 'duration', persist: false },
                { name: 'effort', persist: false },
                { name: 'constraintDate', persist: false }
            ]
        }
    },

    features : {
        // Not supported with lazyLoad
        group  : false,
        filter : false
    },

    columns : [
        {
            text       : 'Resource',
            field      : 'name',
            width      : 200,
            sortable   : false,
            filterable : false
        }
    ],

    tbar : [
        {
            type : 'button',
            text : 'Reset data',
            onClick() {
                scheduler.project.load({ reset: true });
            }
        }
    ]
});
```

### Server Response Format voor Lazy Load

```json
{
    "success": true,
    "total": 5000,
    "resources": {
        "rows": [...],
        "total": 100
    },
    "events": {
        "rows": [...],
        "total": 2500
    },
    "assignments": {
        "rows": [...]
    }
}
```

---

## Filter Persistence

### LocalStorage Filters

```typescript
import { BrowserHelper, Duration } from '@bryntum/gantt';

const FILTERS_STORAGE_KEY = 'app-gantt-filters';

// Load saved filters
function loadFilters(): object[] | undefined {
    const savedJSON = BrowserHelper.getLocalStorageItem(FILTERS_STORAGE_KEY);

    if (savedJSON) {
        try {
            return JSON.parse(savedJSON, function(key, value) {
                // Revive date values
                if (key === 'value' && this.type === 'date') {
                    return Array.isArray(value)
                        ? value.map(v => new Date(v))
                        : new Date(value);
                }
                // Revive duration values
                if (key === 'value' && this.type === 'duration') {
                    return Array.isArray(value)
                        ? value.map(v => new Duration(v))
                        : new Duration(value);
                }
                return value;
            });
        }
        catch (e) {
            console.error('Failed to parse filters:', e);
        }
    }
    return undefined;
}

// Save filters
function saveFilters(filters: object[]) {
    BrowserHelper.setLocalStorageItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify(filters)
    );
}

// Filter picker configuration
const filterPickers = {
    type    : 'gridfieldfilterpickergroup',
    grid    : gantt,
    filters : loadFilters() ?? [{
        id       : 'default-filter',
        property : 'percentDone',
        operator : '<',
        value    : 100
    }],
    listeners : {
        change({ filters }) {
            saveFilters(filters);
        }
    }
};
```

### Filter Picker Fields

```typescript
// Override field configs for relations
const filterPickerFields = {
    colorId : {
        // Show related record names in filter dropdown
        relatedDisplayField : 'name'
    }
};

// Locked filters
const canDeleteFilter = filter => filter.id !== 'permanent-filter';

const getFieldFilterPickerConfig = filter =>
    filter.id === 'permanent-filter'
        ? { propertyLocked: true, operatorLocked: true }
        : undefined;

gantt.features.filter = {
    pickerConfig : {
        canDeleteFilter,
        getFieldFilterPickerConfig,
        fields : filterPickerFields
    }
};
```

---

## PDF Export

### Export Configuratie

```typescript
import { Gantt, DateHelper } from '@bryntum/gantt';

const headerTpl = ({ currentPage, totalPages }) => `
    <img alt="Logo" src="resources/logo.svg"/>
    <dl>
        <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
        <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
    </dl>
`;

const footerTpl = () => `
    <h3>© ${new Date().getFullYear()} Company Name</h3>
`;

const gantt = new Gantt({
    project,

    features : {
        pdfExport : {
            // Export server URL
            exportServer : 'http://localhost:8080/',

            // Convert relative URLs to absolute
            translateURLsToAbsolute : 'http://localhost:8080/resources/',

            // Filter out problematic styles
            filterStyles : styles => styles.filter(item =>
                !item.match(/<style .+monaco-colors/) &&
                !item.match(/<link .+monaco/)
            ),

            // Custom headers/footers
            headerTpl,
            footerTpl,

            // Binary download (vs URL)
            sendAsBinary : true
        }
    },

    tbar : [
        {
            type : 'button',
            text : 'Export to PDF',
            icon : 'fa-file-export',
            onClick() {
                gantt.features.pdfExport.showExportDialog();
            }
        },
        {
            type  : 'slidetoggle',
            label : 'Use WebSocket',
            value : true,
            onChange({ value }) {
                gantt.features.pdfExport.webSocketAvailable = value;
            }
        }
    ]
});
```

---

## StateProvider - Backend State Persistence

### Local Storage StateProvider

```typescript
import { StateProvider, Gantt, Toast } from '@bryntum/gantt';

// Simple localStorage provider
StateProvider.setup('local');

const stateId = 'mainGantt';

const gantt = new Gantt({
    appendTo          : 'container',
    dependencyIdField : 'sequenceNumber',

    // Unique key for state persistence
    stateId,

    // Provide explicit dates to avoid overriding restored state
    startDate : new Date(2019, 0, 13),
    endDate   : new Date(2019, 2, 24),

    features : {
        filter : true
    },

    project : {
        autoSetConstraints : true,
        autoLoad           : true,
        transport          : {
            load : { url : 'data/project.json' }
        }
    },

    tbar : [
        {
            type  : 'slidetoggle',
            label : 'Auto save',
            value : true,
            onChange({ checked }) {
                // Toggle state tracking
                gantt.stateId = checked ? stateId : null;
            }
        },
        {
            type : 'button',
            text : 'Reset to default',
            onClick() {
                gantt.resetDefaultState();
                Toast.show('Default state restored');
            }
        }
    ],

    columns : [
        // Explicit IDs for column state persistence
        { id : 'name', type : 'name', width : 250 },
        { id : 'startDate', type : 'startdate', width : 150 },
        { id : 'duration', type : 'duration', width : 150 },
        { id : 'predecessors', type : 'predecessor', width : 150 }
    ]
});
```

### Backend State Persistence

```typescript
import { AjaxHelper, AsyncHelper, StateProvider } from '@bryntum/gantt';

class BackendState {
    constructor(stateProvider) {
        this.stateProvider = stateProvider;
    }

    async init() {
        // Load state from backend
        const response = await AjaxHelper.get('api/state');
        this.stateProvider.data = await response.json();

        // Start listening for changes AFTER loading
        this.stateProvider.on({
            save : this.onSave.bind(this)
        });
    }

    onSave() {
        this.stateData = this.stateProvider.data;

        if (!this.saving) {
            this.save().catch(err =>
                console.warn('Failed to persist state', err)
            );
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
        await AjaxHelper.post('api/state', {
            body : JSON.stringify(data)
        });
        // Throttle to avoid too many requests
        await AsyncHelper.sleep(250);
    }
}

// Usage with memory provider for server sync
async function launch() {
    const stateProvider = StateProvider.setup('memory');
    await new BackendState(stateProvider).init();

    // Now create widgets...
    const gantt = new Gantt({
        stateId : 'mainGantt',
        // ...
    });
}

// Check URL for state source
if (new URL(window.location).searchParams.get('state') === 'remote') {
    launch();
}
else {
    StateProvider.setup('local');
    // Create widgets directly...
}
```

### State Persistence Caveats

```typescript
/**
 * Server-side state considerations:
 *
 * 1. State must be ready at app launch time
 *    - Widgets consume state during construction
 *    - Can't be done asynchronously without flicker
 *    - Either AJAX before widgets, or server-rendered state
 *
 * 2. State is not always the same as settings
 *    - Users may use different devices
 *    - Desktop vs tablet vs phone experience should differ
 *    - Consider device-specific state keys
 *
 * 3. Undesired state is harder to clear
 *    - Won't be cleared by browser cache clear
 *    - Follows user to other browsers
 *    - Consider reset functionality
 */
```

---

## Custom Columns Pattern

### ComplexityColumn met Custom Renderer

```typescript
import { Column, ColumnStore, Combo } from '@bryntum/gantt';

// Custom Combo for cell editor
class ComplexityCombo extends Combo {
    static type = 'complexitycombo';

    static configurable = {
        items : [
            { value : 0, text : 'Easy' },
            { value : 1, text : 'Normal' },
            { value : 2, text : 'Hard' },
            { value : 3, text : 'Impossible' }
        ],
        picker : {
            minWidth : '8em'
        },
        listItemTpl : ({ text }) => `
            <div>
                <i class="fa fa-square ${text}"></i>
                <small>${text}</small>
            </div>
        `
    };

    syncInputFieldValue(...args) {
        const complexity = this.store.getById(this.value)?.text;
        this.icon.className = `fa fa-square ${complexity}`;
        super.syncInputFieldValue(...args);
    }

    get innerElements() {
        return [
            {
                reference : 'icon',
                tag       : 'i',
                style     : {
                    marginInlineStart : '.8em',
                    marginInlineEnd   : '-.3em'
                }
            },
            ...super.innerElements
        ];
    }
}

ComplexityCombo.initClass();

// Custom column
class ComplexityColumn extends Column {
    static $name         = 'ComplexityColumn';
    static type          = 'complexitycolumn';
    static isGanttColumn = true;

    static defaults = {
        field   : 'complexity',
        text    : 'Complexity',
        cellCls : 'b-complexity-column-cell',
        editor  : { type : 'complexitycombo' }
    };

    renderer({ column, value }) {
        const
            { store } = column.editor,
            complexity = store.getById(value)?.text;

        return complexity ? [{
            tag       : 'i',
            className : `fa fa-square ${complexity}`
        }, complexity] : '';
    }
}

ColumnStore.registerColumnType(ComplexityColumn);
```

### StatusColumn met Computed Field

```typescript
import { Column, ColumnStore, TaskModel } from '@bryntum/gantt';

// Extend TaskModel with computed status
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
        return !this.isCompleted &&
               this.deadlineDate &&
               Date.now() > this.deadlineDate;
    }

    // Computed status based on multiple conditions
    get status() {
        let status = 'Not started';

        if (this.isCompleted) {
            status = 'Completed';
        }
        else if (this.isLate) {
            status = 'Late';
        }
        else if (this.isStarted) {
            status = 'Started';
        }

        return status;
    }
}

// Status column with filter support
class StatusColumn extends Column {
    static $name = 'StatusColumn';
    static type = 'statuscolumn';

    static get isGanttColumn() {
        return true;
    }

    static get defaults() {
        return {
            field      : 'status',
            text       : 'Status',
            editor     : false,
            readOnly   : true,
            cellCls    : 'b-status-column-cell',
            htmlEncode : false,
            width      : 120,
            filterable : {
                filterField : {
                    type  : 'combo',
                    items : ['Not Started', 'Started', 'Completed', 'Late']
                }
            }
        };
    }

    renderer({ record }) {
        const status = record.status;

        return status ? [{
            tag       : 'i',
            className : `fa fa-circle ${status}`
        }, status] : '';
    }
}

ColumnStore.registerColumnType(StatusColumn);
```

---

## Custom Toolbars

### GanttToolbar met Feature Toggles

```typescript
import { Toolbar, CSSHelper, DateHelper } from '@bryntum/gantt';

class GanttToolbar extends Toolbar {
    static type = 'gantttoolbar';
    static $name = 'GanttToolbar';

    static configurable = {
        items : {
            views : {
                type        : 'buttongroup',
                toggleGroup : true,
                rendition   : 'padded',
                items       : {
                    ganttButton : {
                        icon    : 'fa fa-chart-gantt',
                        text    : 'Gantt',
                        tooltip : 'Gantt view',
                        pressed : true
                    },
                    resourceViewButton : {
                        icon     : 'fa fa-users',
                        text     : 'Resources',
                        onAction : 'up.onResourceViewButtonClick'
                    }
                }
            },
            addTaskButton : {
                color    : 'b-green',
                icon     : 'fa fa-plus',
                text     : 'Create',
                onAction : 'up.onAddTaskClick'
            },
            undoRedo : {
                type  : 'undoredo',
                items : {
                    transactionsCombo : null
                }
            },
            zoomButtons : {
                type  : 'buttonGroup',
                items : {
                    zoomInButton  : { icon : 'fa fa-search-plus', onAction : 'up.onZoomInClick' },
                    zoomOutButton : { icon : 'fa fa-search-minus', onAction : 'up.onZoomOutClick' },
                    zoomToFitButton : { icon : 'fa fa-compress-arrows-alt', onAction : 'up.onZoomToFitClick' }
                }
            },
            projectSelector : {
                type         : 'combo',
                label        : 'Choose project',
                editable     : false,
                displayField : 'name',
                value        : 1,
                store        : {
                    data : [
                        { id : 1, name : 'Project A', url : 'data/project-a.json' },
                        { id : 2, name : 'Project B', url : 'data/project-b.json' }
                    ]
                },
                listeners : {
                    select : 'up.onProjectSelected'
                }
            },
            featuresButton : {
                type : 'button',
                icon : 'fa fa-tasks',
                text : 'Settings',
                menu : {
                    onItem       : 'up.onFeaturesClick',
                    onBeforeShow : 'up.onFeaturesShow',
                    items : {
                        settings : {
                            text : 'UI settings',
                            menu : {
                                defaults : { type : 'slider', showValue : true },
                                items : {
                                    rowHeight : { text : 'Row height', min : 30, max : 70, onInput : 'up.onRowHeightChange' },
                                    barMargin : { text : 'Bar margin', min : 0, max : 10, onInput : 'up.onBarMarginChange' }
                                }
                            }
                        },
                        drawDeps     : { text : 'Dependencies', feature : 'dependencies', checked : false },
                        criticalPaths: { text : 'Critical paths', feature : 'criticalPaths', checked : false },
                        baselines    : { text : 'Show baselines', feature : 'baselines', checked : false },
                        rollups      : { text : 'Show rollups', feature : 'rollups', checked : false },
                        progressLine : { text : 'Progress line', feature : 'progressLine', checked : false }
                    }
                }
            }
        }
    };

    get gantt() {
        return this._gantt || (this._gantt = this.owner);
    }

    onFeaturesClick({ source : item }) {
        const { gantt } = this;

        if (item.feature) {
            const feature = gantt.features[item.feature];
            feature.disabled = !feature.disabled;
        }
    }

    onFeaturesShow({ source : menu }) {
        const { gantt } = this;

        menu.items.map(item => {
            const { feature } = item;

            if (feature && gantt.features[feature]) {
                item.checked = !gantt.features[feature].disabled;
            }
        });
    }

    async onProjectSelected({ record, userAction }) {
        if (userAction) {
            await this.gantt.project.load(record.url);
            this.gantt.zoomToFit();
        }
    }

    onRowHeightChange({ value }) {
        this.gantt.rowHeight = value;
    }

    onZoomInClick() { this.gantt.zoomIn(); }
    onZoomOutClick() { this.gantt.zoomOut(); }
    onZoomToFitClick() {
        this.gantt.zoomToFit({ leftMargin : 50, rightMargin : 50 });
    }
}

GanttToolbar.initClass();
```

---

## S-Curve / Timeline Chart

### TimelineChart Feature

```typescript
import { DateHelper, DomHelper, Gantt, ProjectModel } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo : 'container',
    project  : new ProjectModel({
        autoLoad         : true,
        loadUrl          : 'data/project.json',
        validateResponse : true
    }),

    features : {
        timelineChart : {
            dataProvider : {
                meta : {
                    // Override default series color
                    duration : { color : 'green' },

                    // Add custom series
                    effort : {
                        text     : 'Effort',
                        color    : '#FFCCCC',
                        callback : (task, start, end, durationDoneToDate, doneDuration, durationInInterval) => {
                            let value = 0;

                            if (durationInInterval > 0) {
                                if (task.isMilestone) {
                                    value = DateHelper.as('ms', task.effort, task.effortUnit);
                                }
                                else {
                                    value = Math.round(
                                        DateHelper.as('ms', task.effort, task.effortUnit) *
                                        (durationInInterval / task.durationMS)
                                    );
                                }
                            }

                            return value;
                        }
                    }
                }
            },
            chartProvider : {
                tooltipTemplate({ dataset, date }) {
                    return `
                        <div>${dataset.label}: ${Math.round(DateHelper.as('d', parseInt(dataset.value)) * 100) / 100} days</div>
                        <div>${DateHelper.format(date, this.gantt.displayDateFormat)}</div>
                    `;
                }
            }
        }
    },

    tbar : [
        {
            type         : 'combo',
            label        : 'S-Curve fields',
            multiSelect  : true,
            valueField   : 'name',
            displayField : 'text',
            width        : '38em',
            chipView     : {
                iconTpl({ color }) {
                    return `<div class="b-series-icon" style="${color ? `background-color:${color}` : ''}"></div>`;
                }
            },
            onChange({ value }) {
                this.up('gantt').features.timelineChart.selectedDatasets = value;
            }
        },
        {
            type    : 'slidetoggle',
            text    : 'Show s-curve',
            checked : true,
            onChange({ checked }) {
                gantt.features.timelineChart.disabled = !checked;
            }
        },
        {
            type    : 'slidetoggle',
            text    : 'Show tasks',
            checked : true,
            onChange({ checked }) {
                DomHelper.toggleClasses(gantt.element, ['b-hide-tasks'], !checked);
            }
        }
    ],

    listeners : {
        paint() {
            const { datasets } = this.features.timelineChart;

            this.widgetMap.datasetCombo.items = datasets;
            this.widgetMap.datasetCombo.value = datasets.slice(0, 2).map(ds => ds.name);
        }
    }
});
```

---

## Cross-Project Dependencies

### Portfolio Planning met Cross-Project Links

```typescript
import { Gantt, TaskModel, DependencyModel, DateHelper, StringHelper } from '@bryntum/gantt';

// Custom Task with project tracking
class Task extends TaskModel {
    static $name = 'Task';

    static fields = [
        'isProject',
        'prio'
    ];

    // Inherit color from first-level parent
    get eventColor() {
        return super.eventColor || this.parent.eventColor;
    }

    // Find ancestor project
    findAncestor(fn) {
        let result;

        this.bubbleWhile(t => {
            if (fn(t)) {
                result = t;
                return false;
            }
        }, !this.isProject);

        return result;
    }
}

// Custom Dependency for cross-project detection
class Dependency extends DependencyModel {
    static $name = 'Dependency';

    get isCrossProject() {
        const
            fromTaskProject = this.fromTask.findAncestor(task => task.isProject),
            toTaskProject   = this.toTask.findAncestor(task => task.isProject);

        return fromTaskProject && toTaskProject &&
               fromTaskProject !== toTaskProject;
    }
}

const gantt = new Gantt({
    appendTo          : 'container',
    dependencyIdField : 'sequenceNumber',
    viewPreset        : 'monthAndYear',

    project : {
        autoLoad             : true,
        loadUrl              : 'data/portfolio.json',
        taskModelClass       : Task,
        dependencyModelClass : Dependency
    },

    features : {
        rollups : true,
        dependencies : {
            radius : 10,
            // Custom renderer for cross-project deps
            renderer({ domConfig, dependencyRecord }) {
                domConfig.class.crossProject = dependencyRecord.isCrossProject;
            },
            // Custom tooltip
            tooltipTemplate(dependencyRecord) {
                return [
                    { tag : 'label', text : 'From' },
                    { text : dependencyRecord.fromEvent.name },
                    { tag : 'label', text : 'To' },
                    { text : dependencyRecord.toEvent.name },
                    { tag : 'label', text : 'Lag' },
                    { text : `${dependencyRecord.lag || 0} ${DateHelper.getLocalizedNameOfUnit(dependencyRecord.lagUnit)}` },
                    dependencyRecord.isCrossProject
                        ? { tag : 'label', text : 'Cross project dependency' }
                        : undefined
                ];
            }
        },
        labels : {
            right : {
                field : 'name',
                renderer({ taskRecord, domConfig }) {
                    domConfig.children = [taskRecord.name];

                    // Show priority tag
                    if (taskRecord.prio) {
                        domConfig.children.push({
                            class   : 'b-prio-tag',
                            dataset : { btip : 'Priority ' + taskRecord.prio },
                            text    : taskRecord.prio
                        });
                    }
                }
            }
        }
    },

    columns : [
        { type : 'wbs' },
        { type : 'name', width : 350 },
        { type : 'startdate' },
        { type : 'duration', abbreviatedUnit : true },
        { type : 'percentdone', mode : 'circle', width : 70 },
        { type : 'resourceassignment', width : 120, showAvatars : true }
    ]
});
```

---

## WBS Management

### Auto WBS Mode

```typescript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoLoad : true,
    loadUrl  : 'data/project.json'
});

const gantt = new Gantt({
    appendTo          : 'container',
    dependencyIdField : 'sequenceNumber',
    project,

    columns : [
        { type : 'wbs' },  // WBS column
        { type : 'name', width : 320 }
    ],

    features : {
        taskMenu : {
            items : {
                add : {
                    menu : {
                        subtask : {
                            // New sub-tasks at end of parent
                            at : 'end'
                        }
                    }
                }
            }
        }
    },

    tbar : [
        {
            type    : 'slidetoggle',
            label   : 'Auto update WBS',
            checked : false,
            tooltip : 'Automatically update WBS on add/remove/sort',
            onAction({ checked }) {
                project.taskStore.wbsMode = checked ? 'auto' : 'manual';
            }
        },
        {
            type    : 'slidetoggle',
            label   : 'Use ordered tree for WBS',
            checked : true,
            tooltip : 'Maintain original order, sort only for display',
            onAction({ checked }) {
                project.taskStore.useOrderedTreeForWbs = checked;
            }
        }
    ]
});
```

---

## Task Editor Customization

### Custom Tabs & TinyMCE Integration

```typescript
import {
    Grid, List, GlobalEvents, DomHelper,
    RichTextField, Delayable,
    Gantt, ProjectModel, TaskModel, StringHelper
} from '@bryntum/gantt';

// Custom Files Tab
class FilesTab extends Grid {
    static type = 'filestab';

    static configurable = {
        title    : 'Files',
        columns  : [{
            text     : 'Files attached to task',
            field    : 'name',
            type     : 'template',
            template : data => StringHelper.xss`
                <i class="fa fa-fw fa-${data.record.data.icon}"></i>
                ${data.record.data.name}
            `
        }]
    };

    loadEvent(eventRecord) {
        // Load files for task
        this.store.data = eventRecord.files || [];
    }
}

FilesTab.initClass();

// Custom Resource List
class ResourceList extends List {
    static type = 'resourcelist';

    static configurable = {
        cls     : 'b-inline-list',
        itemTpl : resource => StringHelper.xss`
            <img src="images/users/${resource.name.toLowerCase()}.png">
            <div class="b-resource-detail">
                <div class="b-resource-name">${resource.name}</div>
                <div class="b-resource-city">
                    ${resource.city}
                    <i data-btip="Deassign" class="b-icon b-icon-trash"></i>
                </div>
            </div>
        `
    };

    loadEvent(taskRecord) {
        this.taskRecord = taskRecord;
        this.store.data = taskRecord.resources;
    }

    onItem({ event, record }) {
        if (event.target.matches('.b-icon-trash')) {
            this.taskRecord.unassign(record);
            this.store.data = this.taskRecord.resources;
        }
    }
}

ResourceList.initClass();

// TinyMCE Field (RichTextField wrapper)
class TinyMceField extends RichTextField.mixin(Delayable) {
    static $name = 'TinyMceField';
    static type = 'tinymcefield';

    static configurable = {
        tinyMceConfig : {},
        licenseKey    : '',
        inline        : false,
        resize        : false,
        menubar       : false,
        autoFocus     : true,
        rootBlock     : 'div',
        inputAttributes : { tag : 'textarea' }
    };

    internalOnPaint() {
        if (this.editor) {
            this.destroyEditor();
        }

        globalThis.tinymce.init({
            ...this.tinyMceConfig,
            license_key : this.licenseKey,
            auto_focus  : this.autoFocus,
            inline      : this.inline,
            menubar     : this.menubar,
            resize      : this.resize,
            height      : this.height,
            target      : this.input,
            content_css : !this.inline && DomHelper.isDarkTheme ? 'dark' : null,
            skin        : DomHelper.isDarkTheme ? 'oxide-dark' : 'oxide',
            setup       : editor => this.setupEditor(editor)
        }).then(allEditors => this.editor = allEditors.at(-1));
    }
}

TinyMceField.initClass();

// Extended Task Model
class MyModel extends TaskModel {
    static fields = [
        { name : 'deadline', type : 'date' }
    ];
}

const gantt = new Gantt({
    appendTo : 'container',
    showTaskColorPickers : true,

    features : {
        taskEdit : {
            editorConfig : {
                width : '48em',
                modal : { closeOnMaskTap : true }
            },
            items : {
                generalTab : {
                    title : 'Common',
                    items : {
                        customDivider : {
                            html    : '',
                            dataset : { text : 'Custom fields' },
                            cls     : 'b-divider'
                        },
                        deadlineField : {
                            type  : 'datefield',
                            name  : 'deadline',
                            label : 'Deadline'
                        },
                        priority : {
                            type    : 'radiogroup',
                            name    : 'priority',
                            label   : 'Priority',
                            inline  : true,
                            options : { high : 'High', med : 'Medium', low : 'Low' }
                        }
                    }
                },
                notesTab : {
                    items : {
                        noteField : {
                            type   : 'tinymcefield',
                            width  : '100%',
                            height : '30em',
                            tinyMceConfig : { menubar : true }
                        }
                    }
                },
                filesTab : {
                    type   : 'filestab',
                    weight : 110
                },
                resourcesTab : {
                    type   : 'container',
                    weight : 120,
                    title  : 'Resources',
                    items  : {
                        resources : { type : 'resourcelist' }
                    }
                },
                predecessorsTab : {
                    items : {
                        grid : {
                            columns : {
                                data : {
                                    name : {
                                        renderer({ record : dependency }) {
                                            const task = dependency.fromTask;
                                            return task
                                                ? StringHelper.xss`${task.name} (${task.id})`
                                                : '';
                                        },
                                        editor : {
                                            displayValueRenderer(taskRecord) {
                                                return taskRecord
                                                    ? StringHelper.xss`${taskRecord.name} (${taskRecord.id})`
                                                    : '';
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
    },

    project : new ProjectModel({
        taskModelClass : MyModel,
        loadUrl        : 'data/project.json'
    })
});
```

---

## Gerelateerde Documenten

- [INTEGRATION-GANTT-SCHEDULER.md](./INTEGRATION-GANTT-SCHEDULER.md) - Partner widgets en ResourceUtilization
- [INTEGRATION-CALENDAR-TASKBOARD.md](./INTEGRATION-CALENDAR-TASKBOARD.md) - Calendar + TaskBoard patterns
- [INTEGRATION-DASHBOARD.md](./INTEGRATION-DASHBOARD.md) - Multi-widget dashboard layouts
- [INTEGRATION-EXPORT.md](./INTEGRATION-EXPORT.md) - PDF, Excel, MS Project export
- [INTEGRATION-REALTIME.md](./INTEGRATION-REALTIME.md) - WebSocket, STM, realtime sync
- [INTEGRATION-FRAMEWORKS.md](./INTEGRATION-FRAMEWORKS.md) - React, Vue, Angular integratie
- [INTEGRATION-PERFORMANCE.md](./INTEGRATION-PERFORMANCE.md) - Big datasets, lazy loading
- [DEEP-DIVE-CRUDMANAGER.md](./DEEP-DIVE-CRUDMANAGER.md) - Data loading en syncing
- [INTERNALS-STORE.md](./INTERNALS-STORE.md) - Store internals

---

*Bryntum Suite 7.1.0 - Cross-Product Integration*
