# INTEGRATION-CALENDAR-TASKBOARD.md

> **Calendar + TaskBoard Combinatie** - Drag between views, external event sources, equipment assignment, en workflow integratie.

---

## Overzicht

Calendar en TaskBoard kunnen samen een krachtige workflow interface vormen:
- **Calendar**: Tijdsplanning - wanneer taken plaatsvinden
- **TaskBoard**: Status workflow - waar taken in de pipeline staan
- **Scheduler Mode**: Calendar met resource timeline view
- **External Event Source**: Drag events van/naar externe grids
- **Equipment Assignment**: Drag items naar calendar events

Dit document beschrijft de integratiepatronen en drag & drop implementaties.

---

## Calendar met Scheduler Mode

### Scheduler als Calendar View Mode

```typescript
import { Calendar, StringHelper, DomClassList, DateHelper, Toast } from '@bryntum/calendar';

const tickWidth = 70;

const calendar = new Calendar({
    appendTo : 'container',
    date     : new Date(2023, 9, 12, 7),

    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },

    // Sidebar met resource filtering
    sidebar : {
        resourceFilter : {
            filterResources : true  // Filter resourceStore mee
        }
    },

    // Toolbar met scale slider
    tbar : {
        items : {
            scale : {
                type      : 'slider',
                label     : 'Scale',
                showValue : 'thumb',
                min       : 25,
                max       : 100,
                value     : tickWidth,
                weight    : 650,
                onInput   : ({ value }) => calendar.modes.timeline.tickSize = value
            }
        }
    },

    // Start met timeline mode
    mode : 'timeline',

    modes : {
        day : {
            dayStartTime : 7,
            dayEndTime   : 22
        },

        week : {
            dayStartTime : 7,
            dayEndTime   : 22
        },

        // Scheduler widget als calendar mode
        timeline : {
            type  : 'scheduler',
            title : 'Timeline',

            resourceImagePath   : '../_shared/images/users/',
            eventStyle          : 'calendar',
            useInitialAnimation : false,

            columns : [
                {
                    type  : 'resourceInfo',
                    field : 'name',
                    text  : 'Staff/Resource',
                    width : 175
                }
            ],

            features : {
                nonWorkingTime     : true,
                timeRanges         : true,
                resourceTimeRanges : true
            },

            workingTime : {
                fromHour : 7,
                toHour   : 22
            },

            barMargin  : 3,
            viewPreset : {
                base      : 'hourAndDay',
                tickWidth,
                headers   : [{
                    unit       : 'day',
                    dateFormat : 'ddd MM/DD'
                }, {
                    unit       : 'hour',
                    dateFormat : 'h a'
                }]
            },

            // Custom event renderer matching Calendar style
            eventRenderer({ eventRecord, renderData }) {
                if (eventRecord.isInterDay) {
                    renderData.eventStyle = 'interday';
                    return StringHelper.encodeHtml(eventRecord.name);
                }

                renderData.style = 'align-items: start';

                const { eventColor, iconCls } = renderData;
                const noIcon     = !iconCls?.length;
                const isRecurring = eventRecord.isRecurring || eventRecord.isOccurrence;

                return {
                    class    : 'b-cal-event-body',
                    children : [
                        {
                            class    : 'b-event-header',
                            children : [
                                {
                                    class : 'b-event-time',
                                    text  : DateHelper.format(eventRecord.startDate, 'LST')
                                },
                                isRecurring && {
                                    tag   : 'i',
                                    class : {
                                        'b-icon'                : 1,
                                        'b-fw-icon'             : 1,
                                        'b-cal-event-icon'      : !noIcon,
                                        'b-cal-recurrence-icon' : noIcon,
                                        'b-icon-recurring'      : noIcon,
                                        ...DomClassList.normalize(iconCls, 'object')
                                    }
                                }
                            ]
                        },
                        {
                            class : 'b-cal-event-desc',
                            text  : eventRecord.name
                        }
                    ]
                };
            }
        }
    }
});
```

---

## Drag Between Calendars

### Multi-Calendar Setup met Scroll Sync

```typescript
import { Container } from '@bryntum/calendar';

const container = new Container({
    appendTo : 'container',
    layout   : 'hbox',
    flex     : 1,

    defaults : {
        responsive        : false,
        resourceImagePath : '../_shared/images/users/',

        modes : {
            dayresource : {
                minResourceWidth : '10em',
                range            : '3d',
                dayStartTime     : 8,
                dayEndTime       : 19,
                hourHeight       : 70
            },
            day    : null,
            week   : null,
            month  : null,
            year   : null,
            agenda : null
        },

        tbar : {
            items : {
                todayButton : { rendition: 'text' }
            }
        },

        sidebar : {
            collapsed      : true,
            resourceFilter : { filterResources: true }
        },

        // Sync hourHeight en scroll tussen calendars
        listeners : {
            layoutUpdate({ source }) {
                const otherId = source.calendar.ref === 'stockholmCalendar'
                    ? 'miamiCalendar'
                    : 'stockholmCalendar';

                const other = container.widgetMap[otherId];

                // Sync hour height
                other.activeView.hourHeight = source.hourHeight;

                // Sync vertical scroll
                other.activeView.scrollable.y = source.scrollable.y;
            }
        }
    },

    items : {
        stockholmCalendar : {
            type  : 'calendar',
            title : 'Team Stockholm',
            date  : new Date(2025, 8, 1),
            flex  : 1,

            tools : {
                summaryPeople : {
                    cls  : 'fa fa-user b-title-summary',
                    type : 'widget'
                },
                summaryEvents : {
                    cls  : 'fa fa-list-check b-title-summary',
                    type : 'widget'
                }
            },

            crudManager : {
                autoLoad : true,
                loadUrl  : 'data/stockholm.json'
            },

            onDataChange() {
                const { summaryPeople, summaryEvents } = this.widgetMap;
                const resourceCount = this.resourceStore.count;
                const eventCount = this.eventStore.count;
                const tooltip = `${resourceCount} team members, ${eventCount} tasks`;

                summaryPeople.html = resourceCount;
                summaryEvents.html = eventCount;
                summaryPeople.tooltip = summaryEvents.tooltip = tooltip;
            }
        },

        split : { type: 'splitter' },

        miamiCalendar : {
            type  : 'calendar',
            title : 'Team Miami',
            date  : new Date(2025, 8, 1),
            flex  : 1,

            tools : {
                summaryPeople : {
                    cls  : 'fa fa-user b-title-summary',
                    type : 'widget'
                },
                summaryEvents : {
                    cls  : 'fa fa-list-check b-title-summary',
                    type : 'widget'
                }
            },

            crudManager : {
                autoLoad : true,
                loadUrl  : 'data/miami.json'
            },

            onDataChange() {
                const { summaryPeople, summaryEvents } = this.widgetMap;
                const resourceCount = this.resourceStore.count;
                const eventCount = this.eventStore.count;

                summaryPeople.html = resourceCount;
                summaryEvents.html = eventCount;
                summaryPeople.tooltip = summaryEvents.tooltip =
                    `${resourceCount} team members, ${eventCount} tasks`;
            }
        }
    }
});
```

---

## External Event Source Feature

### Drag van Sidebar Grid naar Calendar

```typescript
import { Calendar, Grid, GridRowModel, Duration, StringHelper } from '@bryntum/calendar';

const calendar = new Calendar({
    date     : new Date(2025, 4, 12),
    appendTo : 'container',

    crudManager : {
        loadUrl  : 'data/data.json',
        autoLoad : true,

        // Extra store voor unplanned events
        stores : {
            id         : 'unplanned',
            modelClass : class extends GridRowModel {
                // Computed property voor duration display
                get fullDuration() {
                    return new Duration({
                        unit      : this.durationUnit,
                        magnitude : this.duration
                    });
                }
            }
        }
    },

    modes : {
        agenda : null
    },

    features : {
        eventTooltip : {
            align : 'l-r'
        },

        // Enable external event source drag
        externalEventSource : {
            grid      : 'unscheduled',  // Grid id
            droppable : true            // Kan terug naar grid
        }
    },

    // Grid in sidebar
    sidebar : {
        flex : '0 0 300px',

        items : {
            externalEvents : {
                type   : 'grid',
                id     : 'unscheduled',
                flex   : '1 1 0',
                weight : 250,

                // Store uit CrudManager
                store : 'unplanned',

                features : {
                    stripe   : true,
                    sort     : 'name',
                    cellEdit : false,
                    group    : false
                },

                columns : [{
                    text       : 'Unassigned tasks',
                    flex       : 1,
                    field      : 'name',
                    htmlEncode : false,
                    renderer   : (data) => StringHelper.xss`
                        <i class="${data.record.iconCls}"></i>${data.record.name}
                    `
                }, {
                    text            : 'Duration',
                    type            : 'duration',
                    width           : 80,
                    align           : 'right',
                    editor          : false,
                    abbreviatedUnit : true
                }],

                rowHeight : 50
            },

            resourceFilter : {
                flex : '0 1 auto'
            }
        }
    },

    listeners : {
        // Handle drag uit calendar terug naar grid
        beforeDropExternal({ eventRecord, dropOnCalendar }) {
            if (!dropOnCalendar) {
                // Verwijder uit calendar
                calendar.eventStore.remove(eventRecord);
            }
        }
    }
});
```

---

## Equipment/Items Drag naar Events

### Custom DragHelper voor Item Assignment

```typescript
import { DragHelper, Toast, Grid, Calendar, Store, StringHelper } from '@bryntum/calendar';

class EquipmentDrag extends DragHelper {
    static configurable = {
        callOnFunctions      : true,
        cloneTarget          : true,
        autoSizeClonedTarget : false,

        // Drop alleen op calendar events
        dropTargetSelector : '.b-cal-event',
        // Drag alleen icon in grid cell
        proxySelector      : 'i',
        // Drag van grid rows (niet group rows)
        targetSelector     : '.b-grid-row:not(.b-group-row) .b-grid-cell'
    };

    onDragStart({ event, context }) {
        // Bewaar equipment reference
        context.equipment = this.grid.getRecordFromElement(context.grabbed);

        // Disable tooltips tijdens drag
        this.calendar.features.eventTooltip.disabled = true;
    }

    async onDrop({ context }) {
        if (context.valid) {
            const equipmentItem = context.equipment;
            const eventRecord = this.calendar.resolveEventRecord(context.target);

            // Check of al assigned
            if (eventRecord.equipment.includes(equipmentItem)) {
                context.valid = false;
                Toast.show(`${equipmentItem.name} is already assigned to ${eventRecord.name}`);
            }
            else {
                // Animeer naar equipment wrap
                const equipmentWrap = context.target
                    .closest('.b-cal-event')
                    .querySelector('.b-event-equipment-wrap');

                const animTarget = equipmentWrap?.lastElementChild || equipmentWrap;

                if (animTarget) {
                    await this.animateProxyTo(animTarget, {
                        align  : 'l0-r14',
                        offset : [
                            equipmentWrap?.lastElementChild
                                ? parseInt(getComputedStyle(equipmentWrap.lastElementChild).marginInlineEnd)
                                : 0
                        ]
                    });
                }

                // Add equipment to event
                eventRecord.equipment = eventRecord.equipment.concat(equipmentItem);
                Toast.show(`Added ${equipmentItem.name} to ${eventRecord.name}`);
            }
        }

        this.calendar.features.eventTooltip.disabled = false;
    }
}
```

### EquipmentGrid Widget

```typescript
class EquipmentGrid extends Grid {
    static $name = 'EquipmentGrid';
    static type = 'equipmentgrid';

    static configurable = {
        disableGridRowModelWarning : true,
        ui                         : 'toolbar',
        collapsible                : true,

        features : {
            filterBar : { compactMode: true },
            cellEdit  : false
        },

        rowHeight : 100,

        columns : [{
            text       : 'Type to filter...',
            field      : 'name',
            htmlEncode : false,
            cellCls    : 'b-equipment',
            renderer   : ({ record }) => StringHelper.xss`
                <i class="b-equipment-icon ${record.iconCls}"></i>${record.name}
            `
        }]
    };
}

EquipmentGrid.initClass();
```

### Custom Calendar met Equipment Support

```typescript
// Event renderer met equipment icons
const eventRenderer = ({ eventRecord }) => ({
    class    : 'b-event-name',
    children : [
        eventRecord.name || '',
        {
            tag      : 'ul',
            class    : 'b-event-equipment-wrap',
            children : eventRecord.equipment.map(item => ({
                tag     : 'i',
                dataset : { btip: item.name },
                class   : item.iconCls
            }))
        }
    ]
});

class MyCalendar extends Calendar {
    static $name = 'MyCalendar';
    static type = 'mycalendar';

    static configurable = {
        modes : {
            agenda : null,
            day    : { eventRenderer },
            week   : { eventRenderer }
        },

        features : {
            eventEdit : {
                items : {
                    // Equipment multiselect combo in editor
                    equipment : {
                        type         : 'combo',
                        weight       : 900,
                        editable     : false,
                        multiSelect  : true,
                        valueField   : 'id',
                        displayField : 'name',
                        ref          : 'equipment',
                        name         : 'equipment',
                        label        : 'Equipment'
                    }
                }
            }
        }
    };

    construct(config) {
        super.construct(config);

        // Koppel equipment store aan combo
        const equipmentCombo = this.features.eventEdit.editor.widgetMap.equipment;
        equipmentCombo.store = this.equipmentStore.chain();
    }
}

MyCalendar.initClass();
```

### Setup met Equipment Store

```typescript
const equipmentStore = new Store({
    id     : 'equipment',
    fields : ['name', 'iconCls'],
    sorters : [{ field: 'name', ascending: true }]
});

const calendar = new MyCalendar({
    date     : new Date(2023, 9, 12),
    appendTo : 'container',
    equipmentStore,

    crudManager : {
        crudStores : [equipmentStore],
        loadUrl    : 'data/data.json',
        autoLoad   : true,

        eventStore : {
            fields : [{
                name : 'equipment',
                // Convert IDs naar equipment records
                convert(data) {
                    return (data || []).map(id => equipmentStore.getById(id));
                }
            }]
        }
    },

    // Grid als sibling van viewContainer
    items : {
        splitter : {
            type   : 'splitter',
            weight : 110
        },
        equipment : {
            type   : 'equipmentgrid',
            weight : 120,
            title  : 'Equipment',
            // Chained store om filtering te isoleren
            store  : equipmentStore.chain()
        }
    }
});

// Initialiseer drag helper
const drag = new EquipmentDrag({
    grid         : calendar.widgetMap.equipment,
    calendar,
    outerElement : calendar.widgetMap.equipment.contentElement
});
```

---

## Calendar + TaskBoard Integratie

### Custom Widget Classes

```typescript
import { Container, DateHelper, StringHelper } from '@bryntum/core';
import { Calendar, ResourceModel, ProjectModel } from '@bryntum/calendar';
import { TaskBoard } from '@bryntum/taskboard';

// Status configuratie
const statusOrder = {
    'todo'        : 0,
    'in-progress' : 1,
    'done'        : 2
};

const statusName = {
    'todo'        : 'Backlog',
    'in-progress' : 'In progress',
    'done'        : 'Done'
};

// Custom Calendar met status support
class TeamCalendar extends Calendar {
    static $name = 'TeamCalendar';
    static type = 'teamcalendar';

    static configurable = {
        sidebar : false,

        modes : {
            day    : null,
            year   : null,
            agenda : null,

            list : {
                range    : 'decade',
                features : {
                    group : {
                        field : 'status',
                        groupSortFn(a, b) {
                            return statusOrder[a.status] - statusOrder[b.status];
                        },
                        renderer({ record, isFirstColumn }) {
                            return isFirstColumn
                                ? `<span class="b-status-title">${statusName[record.status]}</span>`
                                : '';
                        }
                    },
                    rowReorder : true
                }
            },

            month : { showWeekColumn: false },

            week : {
                dayStartTime : 7,
                dayEndTime   : 22,
                fitHours     : { minHeight: 50 }
            }
        },

        features : {
            eventEdit : {
                items : {
                    status : {
                        type    : 'radiogroup',
                        label   : 'Status',
                        name    : 'status',
                        weight  : 290,
                        style   : 'margin:.5em 0',
                        options : {
                            'todo'        : 'Not started',
                            'in-progress' : 'In progress',
                            'done'        : 'Done'
                        }
                    }
                }
            }
        },

        tbar : {
            items : {
                modeSelector : { icon: null, minified: true },
                todayButton  : { icon: null, weight: 1000, cls: 'b-transparent' }
            }
        }
    };
}

TeamCalendar.initClass();
```

### Custom TaskBoard (Kanban)

```typescript
class Kanban extends TaskBoard {
    static $name = 'Kanban';
    static type = 'kanban';

    static configurable = {
        resourceImagePath    : '../_shared/images/users/',
        showCountInHeader    : false,
        useDomTransition     : true,
        showCollapseInHeader : false,

        columnField : 'status',

        columns : [
            { id: 'todo', text: 'Backlog' },
            { id: 'in-progress', text: 'In progress' },
            { id: 'done', text: 'Done' }
        ],

        features : {
            columnToolbars   : false,
            columnHeaderMenu : false
        },

        headerItems : {
            label : {
                type     : 'template',
                template : ({ taskRecord }) => taskRecord.label ? ({
                    class : { label: 1, [taskRecord.label]: 1 },
                    text  : StringHelper.xss`${taskRecord.label}`
                }) : ''
            },
            startDate : {
                type     : 'template',
                cls      : 'time',
                template : ({ taskRecord }) =>
                    DateHelper.format(taskRecord.startDate, 'h A')
            }
        },

        footerItems : {
            duration : {
                type     : 'template',
                cls      : 'duration',
                template : ({ taskRecord }) =>
                    `<i class="fa fa-clock"></i> ${Math.round(taskRecord.duration)}${taskRecord.durationUnit[0] || ''}`
            }
        },

        tbar : {
            items : {
                title   : { type: 'widget', cls: 'title', html: 'Tasks' },
                spacer  : '->',
                teamGrid : {
                    type      : 'treecombo',
                    store     : 'up.teamGridStore',
                    clearable : true,
                    editable  : false,
                    width     : '20em',
                    onSelect  : 'up.onTeamFilterChange'
                },
                showAll : {
                    type : 'slidetoggle',
                    text : 'Hide completed',
                    onChange({ checked }) {
                        const taskBoard = this.up('kanban');
                        const doneColumn = taskBoard.columns.getById('done');
                        taskBoard.toggleCollapse(doneColumn);
                    }
                }
            }
        }
    };

    onTeamFilterChange({ source, records }) {
        const { taskStore } = this.project;

        if (records.length === 0) {
            taskStore.clearFilters();
        }
        else {
            taskStore.filter({
                filters : {
                    filterBy : task => task.resources.some(
                        resource => records.includes(resource)
                    )
                },
                replace : true
            });
        }
    }
}

Kanban.initClass();
```

### Custom ResourceModel met Statistics

```typescript
class TeamMember extends ResourceModel {
    static $name = 'TeamMember';

    get notStarted(): number {
        return this.events.filter(e => e.status === 'todo').length;
    }

    get inProgress(): number {
        return this.events.filter(e => e.status === 'in-progress').length;
    }

    get completed(): number {
        return this.events.filter(e => e.status === 'done').length;
    }
}

TeamMember.initClass();
```

---

## Cross-View Hover Synchronisatie

### Calendar -> TaskBoard Hover

```typescript
class TeamCalendar extends Calendar {
    // ... andere config

    static configurable = {
        // Event handlers als class methods
        onEventMouseEnter({ eventRecord }) {
            const kanbanTaskEl = this.owner.widgetMap.kanban.getTaskElement(eventRecord);
            kanbanTaskEl?.classList.add('b-hovered');
        },

        onEventMouseLeave({ eventRecord }) {
            const kanbanTaskEl = this.owner.widgetMap.kanban.getTaskElement(eventRecord);
            kanbanTaskEl?.classList.remove('b-hovered');
        }
    };
}
```

### TaskBoard -> Calendar Hover

```typescript
class Kanban extends TaskBoard {
    static configurable = {
        listeners : {
            taskMouseEnter : 'onTaskMouseEnterLeave',
            taskMouseLeave : 'onTaskMouseEnterLeave'
        }
    };

    onTaskMouseEnterLeave({ taskRecord, type }) {
        // Niet highlighten tijdens drag
        if (this.features.taskDrag.isDragging) return;

        const calendarEventEl = this.owner.widgetMap.calendar
            .getElementFromEventRecord(taskRecord);

        calendarEventEl?.classList.toggle(
            'b-hovered',
            type === 'taskmouseenter'
        );
    }
}
```

---

## TaskBoard Drag Events

### Volledige Drag Event Cycle

```typescript
import { MessageDialog, Toast, StringHelper } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    appendTo : 'container',

    useDomTransition : true,

    columns : [
        { id: 'backlog', text: 'Backlog', color: 'purple' },
        { id: 'doing', text: 'Doing', color: 'orange' },
        { id: 'review', text: 'Review', color: 'blue' },
        { id: 'done', text: 'Done', color: 'green' }
    ],

    columnField : 'status',

    listeners : {
        // Before drag starts
        beforeTaskDrag({ taskRecords }) {
            console.log('About to drag:', taskRecords.map(t => t.name));
            // Return false to prevent drag
        },

        // Drag started
        taskDragStart({ taskRecords }) {
            console.log('Drag started');
        },

        // During drag
        taskDrag({ taskRecords, targetColumn }) {
            // Return false to prevent drop on this column
            if (targetColumn.id === 'backlog') {
                return taskRecords.every(task => task.status === 'backlog');
            }
        },

        // Before drop
        async beforeTaskDrop({ taskRecords, targetColumn }) {
            const result = await MessageDialog.confirm({
                title   : 'Verify drop',
                message : StringHelper.xss`
                    Confirm moving ${taskRecords.map(t => `"${t.name}"`).join(', ')}
                    to ${targetColumn.text}?
                `
            });

            return result === MessageDialog.okButton;
        },

        // After successful drop
        taskDrop({ taskRecords, targetColumn }) {
            Toast.show(
                `${taskRecords.map(t => StringHelper.xss`"${t.name}"`).join(', ')}
                 moved to ${targetColumn.text}`
            );
        },

        // Drag aborted (cancelled or invalid)
        taskDragAbort({ taskRecords }) {
            Toast.show(StringHelper.xss`
                Dragging ${taskRecords.map(t => `"${t.name}"`).join(', ')} aborted
            `);
        },

        // Drag ended (always fires)
        taskDragEnd({ taskRecords }) {
            console.log('Drag ended');
        }
    }
});
```

### Drag Event Logging

```typescript
let shouldLog = false;

function log({ type }) {
    if (type === 'beforetaskdrag') {
        console.log('%c**** START ****', 'color:orange');
    }
    console.log(type);
    if (type === 'taskdragend') {
        console.log('%c****  END  ****', 'color:orange');
    }
}

// Toggle logging
taskBoard[shouldLog ? 'on' : 'un']({
    beforeTaskDrag : log,
    taskDragStart  : log,
    taskDrag       : log,
    beforeTaskDrop : log,
    taskDrop       : log,
    taskDragAbort  : log,
    taskDragEnd    : log
});
```

---

## Swimlanes Configuratie

### TaskBoard met Priority Swimlanes

```typescript
const taskBoard = new TaskBoard({
    appendTo         : 'container',
    useDomTransition : true,

    features : {
        columnDrag   : true,
        swimlaneDrag : true,
        taskTooltip  : true
    },

    columns : ['todo', 'doing', 'review', 'done'],
    columnField : 'status',

    swimlanes : [
        { id: 'critical', text: 'Critical!!', color: 'red' },
        { id: 'high', text: 'High', color: 'deep-orange' },
        { id: 'medium', text: 'Medium', color: 'orange' },
        // Meer tasks per rij in Low lane
        { id: 'low', text: 'Low', color: 'light-green', tasksPerRow: 3 }
    ],

    swimlaneField : 'prio',

    // Expand cards om ruimte te vullen
    stretchCards : true,

    tbar : [
        {
            type    : 'button',
            text    : 'Add swimlane',
            icon    : 'fa-plus-circle',
            onClick : 'up.onAddClick'
        },
        {
            type     : 'button',
            ref      : 'removeButton',
            text     : 'Remove swimlane',
            icon     : 'fa-trash',
            onClick  : 'up.onRemoveClick',
            disabled : true
        },
        '->',
        { type: 'swimlanefilterfield' },
        { type: 'swimlanepickerbutton' }
    ],

    headerItems : {
        id : { type: 'text' }
    },

    taskRenderer({ taskRecord, cardConfig }) {
        const headerContent = cardConfig.children.header.children;

        if (taskRecord.prio === 'critical') {
            headerContent.icon = {
                tag   : 'i',
                class : 'fa fa-exclamation-triangle'
            };
        }
    },

    project : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    },

    onAddClick() {
        const id = taskBoard.swimlanes.count;
        taskBoard.swimlanes.add({ id, text: `Swimlane #${id}` });
        taskBoard.scrollToSwimlane(id);
        taskBoard.widgetMap.removeButton.disabled = false;
    },

    onRemoveClick() {
        taskBoard.swimlanes.last.remove();
        taskBoard.widgetMap.removeButton.disabled = taskBoard.swimlanes.count < 5;
    }
});
```

---

## Container Setup

### Calendar + TaskBoard Dashboard

```typescript
const project = new ProjectModel({
    loadUrl : 'data/data.json',
    autoLoad : true,

    resourceStore : {
        tree       : true,
        modelClass : TeamMember
    },

    taskStore : {
        fields : [
            { name: 'status', defaultValue: 'todo' },
            { name: 'label' }
        ]
    }
});

// Chained store voor team grid
const teamGridStore = project.resourceStore.chain(
    undefined,
    undefined,
    { tree: null }
);

const container = new Container({
    appendTo : 'container',
    flex     : 1,
    layout   : { type: 'box' },

    items : {
        calendar : {
            type      : 'teamcalendar',
            mode      : 'month',
            date      : '2024-06-03',
            minHeight : 490,
            flex      : 1,
            project
        },

        splitter : { type: 'splitter' },

        kanban : {
            type : 'kanban',
            flex : 1,
            project,
            teamGridStore
        }
    }
});

// Expose voor debugging
const { calendar, kanban } = container.widgetMap;
Object.assign(window, { calendar, kanban, project });
```

---

## CSS Styling

```css
/* Hover state styling */
.b-taskboard-card.b-hovered,
.b-cal-event.b-hovered {
    box-shadow: 0 0 0 2px var(--primary-color);
}

/* Status kleuren in calendar */
.b-cal-event[data-status="todo"] {
    --event-color: var(--blue-500);
}

.b-cal-event[data-status="in-progress"] {
    --event-color: var(--amber-500);
}

.b-cal-event[data-status="done"] {
    --event-color: var(--green-500);
}

/* Equipment icons in events */
.b-event-equipment-wrap {
    display: flex;
    gap: 4px;
    padding: 0;
    margin: 4px 0 0 0;
    list-style: none;
}

.b-event-equipment-wrap i {
    font-size: 14px;
    opacity: 0.8;
}
```

---

## Best Practices

### 1. Shared Project Initialisatie

```typescript
const project = new ProjectModel({
    taskStore : {
        fields : [
            { name: 'status', defaultValue: 'todo' },
            { name: 'label' }
        ]
    }
});

// Beide widgets gebruiken hetzelfde project
const calendar = new Calendar({ project });
const taskBoard = new TaskBoard({ project });
```

### 2. Hover State Check tijdens Drag

```typescript
onTaskMouseEnterLeave({ taskRecord, type }) {
    // Voorkom highlights tijdens drag
    if (this.features.taskDrag.isDragging) return;

    // ... highlight logic
}
```

### 3. Store Chaining voor Isolated Filtering

```typescript
// Chain store om filtering te isoleren
const equipmentCombo.store = this.equipmentStore.chain();

// Of voor grid met eigen filters
const teamGridStore = project.resourceStore.chain(
    undefined,
    undefined,
    { tree: null }  // Flatten tree
);
```

### 4. Element Methods

```typescript
// Calendar element lookup
calendar.getElementFromEventRecord(eventRecord);

// TaskBoard element lookup
taskBoard.getTaskElement(taskRecord);

// Resolve record from element
calendar.resolveEventRecord(element);
taskBoard.getRecordFromElement(element);
```

---

## Calendar State Persistence

### Sidebar en Date State

```typescript
import { StateProvider, Calendar } from '@bryntum/calendar';

// Setup localStorage state provider
StateProvider.setup('local');

const calendar = new Calendar({
    appendTo : 'container',

    // State key
    stateId : 'mainCalendar',

    // Properties die bewaard worden
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

### Remote State voor Calendar

```typescript
import { StateProvider, AjaxHelper, AsyncHelper } from '@bryntum/core';

class BackendState {
    constructor(stateProvider) {
        this.stateProvider = stateProvider;
    }

    async init() {
        const response = await AjaxHelper.get('api/state');
        this.stateProvider.data = await response.json();

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

                await AsyncHelper.sleep(250);
                await AjaxHelper.post('api/state', data);
            }
        }
        finally {
            this.saving = false;
        }
    }
}

// Initialize
const backend = new BackendState(StateProvider.setup('memory'));
await backend.init();

const calendar = new Calendar({
    stateId  : 'mainCalendar',
    stateful : ['date', 'mode']
});
```

---

## TaskBoard Feature Toggling

### Dynamic Feature Disable

```typescript
const taskBoard = new TaskBoard({
    project,

    features : {
        taskDrag    : true,
        columnDrag  : true,
        taskEdit    : true,
        taskTooltip : true
    }
});

// Toggle feature at runtime
function toggleFeature(featureName, enabled) {
    taskBoard.features[featureName].disabled = !enabled;
}

// Example: Disable drag during editing
taskBoard.on('beforeTaskEdit', () => {
    taskBoard.features.taskDrag.disabled = true;
});

taskBoard.on('afterTaskEdit', () => {
    taskBoard.features.taskDrag.disabled = false;
});
```

### TaskBoard Recompose

```typescript
// After bulk changes, force TaskBoard re-render
function bulkUpdate() {
    project.taskStore.beginBatch();

    // ... many changes

    project.taskStore.endBatch();

    // Force TaskBoard to re-render
    taskBoard.recompose();
}
```

---

## TaskBoard Task Renderer

### Custom Card Configuration

```typescript
const taskBoard = new TaskBoard({
    project,

    taskRenderer({ taskRecord, cardConfig }) {
        // Add dataset for styling/selection
        cardConfig.dataset = {
            priority : taskRecord.priority,
            status   : taskRecord.status
        };

        // Add custom class
        cardConfig.class = {
            [`priority-${taskRecord.priority}`] : true,
            'overdue' : taskRecord.isOverdue
        };

        // Custom children
        cardConfig.children = {
            body : {
                children : {
                    progress : {
                        tag  : 'div',
                        class : 'progress-bar',
                        style : {
                            width : `${taskRecord.percentDone}%`
                        }
                    }
                }
            }
        };
    }
});
```

### Card CSS

```css
/* Priority styling via data attribute */
[data-priority="high"] {
    border-left: 4px solid #f44336;
}

[data-priority="medium"] {
    border-left: 4px solid #ff9800;
}

[data-priority="low"] {
    border-left: 4px solid #4caf50;
}

/* Overdue styling */
.b-taskboard-card.overdue {
    background: rgba(244, 67, 54, 0.1);
}

/* Progress bar */
.progress-bar {
    height: 4px;
    background: var(--primary-color);
    border-radius: 2px;
    margin-top: 8px;
}
```

---

## TaskBoard Header/Body/Footer Items

### Custom Card Sections

```typescript
const taskBoard = new TaskBoard({
    project,

    // Items boven de card body
    headerItems : {
        priority : {
            type : 'template',
            template : ({ taskRecord }) => `
                <span class="priority priority-${taskRecord.priority}">
                    ${taskRecord.priority}
                </span>
            `
        }
    },

    // Items in de card body
    bodyItems : {
        description : {
            type  : 'text',
            field : 'description'
        },
        progress : {
            type : 'template',
            template : ({ taskRecord }) => `
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${taskRecord.percentDone}%"></div>
                </div>
            `
        }
    },

    // Items onder de card body
    footerItems : {
        dueDate : {
            type : 'template',
            template : ({ taskRecord }) =>
                taskRecord.dueDate
                    ? `Due: ${DateHelper.format(taskRecord.dueDate, 'MMM D')}`
                    : ''
        },
        assignee : {
            type  : 'resourceavatar',
            field : 'resources'
        }
    }
});
```

---

## Calendar Mode Configuration

### Scheduler Mode

```typescript
const calendar = new Calendar({
    project,

    // Default mode
    mode : 'week',

    modes : {
        // Week view with custom hours
        week : {
            dayStartTime : 8,
            dayEndTime   : 18,
            hourHeight   : 50
        },

        // Resource mode (scheduler-like)
        resource : {
            type : 'resource',
            title : 'Team Schedule'
        },

        // List mode for agenda
        list : {
            range : 'week'
        },

        // Agenda with custom range
        agenda : {
            range : 'month',
            eventRenderer({ eventRecord, renderData }) {
                renderData.iconCls = `fa fa-${eventRecord.iconCls}`;
            }
        }
    }
});
```

### Mode Switching

```typescript
// Programmatic mode change
calendar.mode = 'month';

// With animation
calendar.setConfig({
    mode : 'week',
    date : new Date()
}, { animate: true });

// Listen to mode changes
calendar.on('modeChange', ({ mode }) => {
    console.log('Switched to:', mode);
});
```

---

## Calendar Event Creation

### Create Event Methods

```typescript
const calendar = new Calendar({
    project,

    // Custom method referenced in sidebar
    createEvent(date) {
        const eventRecord = this.eventStore.add({
            startDate  : date || this.date,
            duration   : 1,
            durationUnit : 'hour',
            name       : 'New Event',
            resourceId : this.activeResource?.id
        })[0];

        // Open editor for new event
        this.editEvent(eventRecord);
    },

    sidebar : {
        items : {
            addNew : {
                type      : 'button',
                text      : 'Create Event',
                icon      : 'fa fa-plus',
                listeners : {
                    click : 'up.createEvent',
                    args  : [undefined]
                }
            }
        }
    }
});
```

### Double-Click to Create

```typescript
calendar.on('scheduleClick', ({ date, resourceRecord }) => {
    const [event] = calendar.eventStore.add({
        startDate  : date,
        endDate    : DateHelper.add(date, 1, 'hour'),
        name       : 'New Event',
        resourceId : resourceRecord?.id
    });

    calendar.editEvent(event);
});
```

---

## ResourceFilter Customization

### SelectAllItem

```typescript
const calendar = new Calendar({
    project,

    sidebar : {
        items : {
            resourceFilter : {
                // Show "Select All" checkbox
                selectAllItem : true,

                // Or with custom text
                selectAllItem : {
                    text : 'Show all calendars'
                },

                flex : '0 0 auto'
            }
        }
    }
});
```

### Custom Resource Filter

```typescript
const calendar = new Calendar({
    project,

    sidebar : {
        items : {
            resourceFilter : {
                type  : 'list',
                store : project.resourceStore,

                itemTpl : resource => `
                    <div class="resource-item">
                        <div class="color-dot" style="background: ${resource.eventColor}"></div>
                        <span>${resource.name}</span>
                        <span class="event-count">${resource.events?.length || 0}</span>
                    </div>
                `,

                onSelectionChange({ selected }) {
                    calendar.resourceStore.filter({
                        id       : 'resourceFilter',
                        filterBy : r => selected.includes(r)
                    });
                }
            }
        }
    }
});
```

---

## Calendar Event Styling

### EventRenderer

```typescript
const calendar = new Calendar({
    project,

    eventRenderer({ eventRecord, renderData }) {
        // Custom icon
        renderData.iconCls = eventRecord.type === 'meeting'
            ? 'fa fa-users'
            : 'fa fa-calendar';

        // Custom color
        if (eventRecord.priority === 'high') {
            renderData.eventColor = 'red';
        }

        // Custom style
        renderData.style = {
            borderLeft : `4px solid ${eventRecord.categoryColor}`
        };

        // Custom body content
        return `
            <div class="event-title">${eventRecord.name}</div>
            <div class="event-time">${DateHelper.format(eventRecord.startDate, 'LT')}</div>
        `;
    }
});
```

---

## Cross-View Synchronization

### Calendar + TaskBoard Highlight

```typescript
const calendar = new Calendar({ project });
const taskBoard = new TaskBoard({ project });

// Calendar selection -> TaskBoard highlight
calendar.on('eventClick', ({ eventRecord }) => {
    const taskEl = taskBoard.getTaskElement(eventRecord);

    if (taskEl) {
        // Remove previous highlights
        document.querySelectorAll('.b-highlighted')
            .forEach(el => el.classList.remove('b-highlighted'));

        // Add highlight
        taskEl.classList.add('b-highlighted');

        // Scroll into view
        taskEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

// TaskBoard selection -> Calendar scroll
taskBoard.on('taskClick', async ({ taskRecord }) => {
    await calendar.scrollEventIntoView(taskRecord, {
        animate   : true,
        highlight : true
    });
});
```

### Hover Synchronization

```typescript
// Calendar -> TaskBoard hover
calendar.on({
    eventMouseEnter({ eventRecord }) {
        const taskEl = taskBoard.getTaskElement(eventRecord);
        taskEl?.classList.add('b-hovered');
    },
    eventMouseLeave({ eventRecord }) {
        const taskEl = taskBoard.getTaskElement(eventRecord);
        taskEl?.classList.remove('b-hovered');
    }
});

// TaskBoard -> Calendar hover
taskBoard.on({
    taskMouseEnter({ taskRecord }) {
        const eventEl = calendar.getElementFromEventRecord(taskRecord);
        eventEl?.classList.add('b-hovered');
    },
    taskMouseLeave({ taskRecord }) {
        const eventEl = calendar.getElementFromEventRecord(taskRecord);
        eventEl?.classList.remove('b-hovered');
    }
});
```

---

## CrudManager Integration

### Shared CrudManager

```typescript
const crudManager = {
    loadUrl  : 'api/load',
    syncUrl  : 'api/sync',
    autoLoad : true,
    autoSync : true,

    // Validate in development
    validateResponse : process.env.NODE_ENV !== 'production',

    listeners : {
        loadFail({ response }) {
            Toast.show({
                html    : 'Failed to load data',
                color   : 'red',
                timeout : 3000
            });
        },
        syncFail({ response }) {
            Toast.show({
                html    : 'Failed to save changes',
                color   : 'red',
                timeout : 3000
            });
        }
    }
};

const calendar = new Calendar({
    crudManager
});

const taskBoard = new TaskBoard({
    project : calendar.project
});
```

---

## Load On Demand Feature

### Calendar Lazy Loading

```typescript
import { Calendar, DateHelper, Toast, AjaxHelper } from '@bryntum/calendar';

// Mock 100,000 events for testing
const sourceRecords = new Array(100000);
for (let i = 0; i < 100000; i++) {
    sourceRecords[i] = {
        id         : i,
        name       : eventNames[Math.floor(Math.random() * eventNames.length)],
        startDate  : new Date(year, month, day, hour),
        endDate    : new Date(year, month, day, hour + durationHours),
        eventColor : eventColors[Math.floor(Math.random() * eventColors.length)],
        resourceId : Math.floor(Math.random() * 4)
    };
}

// Mock AJAX endpoint
AjaxHelper.mockUrl('dynamic-load', (url, urlParams, { queryParams }) => {
    const
        startDate = DateHelper.parseKey(queryParams.startDate),
        endDate   = DateHelper.parseKey(queryParams.endDate);

    const events = startDate && endDate
        ? sourceRecords.filter(e =>
            !e.removed &&
            DateHelper.intersectSpans(startDate, endDate, e.startDate, e.endDate)
        )
        : [];

    Toast.show(`Server request: ${DateHelper.format(startDate, 'Do MMMM YYYY')} to ${DateHelper.format(endDate, 'Do MMMM YYYY')}`);

    return {
        delay        : 100,
        responseText : JSON.stringify({
            success   : true,
            resources : { rows : [] },
            events    : { rows : events }
        })
    };
});

const calendar = new Calendar({
    appendTo : 'container',
    date     : new Date(),

    crudManager : {
        loadUrl  : 'dynamic-load',
        syncUrl  : 'dynamic-load-sync',
        autoLoad : false,
        autoSync : true
    },

    features : {
        loadOnDemand : {
            // Clear store when range changes for clean UI
            clearOnNewRange : true
        }
    },

    onDateRangeLoad({ response }) {
        Toast.show(`Loaded ${response.events.rows.length} events`);
    }
});
```

---

## Advanced Filtering with Custom ProjectFilter

### Custom Filter Widget

```typescript
import { Model, List, EventModel, Store, Calendar, StringHelper } from '@bryntum/calendar';

// Custom Project model
class Project extends Model {
    static $name = 'Project';

    static fields = [
        { name : 'icon' },
        { name : 'name' }
    ];
}

// Custom ProjectFilter List widget
class ProjectFilter extends List {
    static $name = 'ProjectFilter';
    static type = 'projectfilter';

    static configurable = {
        cls          : 'b-resource-filter',  // Use existing styling
        multiSelect  : true,
        displayField : 'name'
    };

    itemIconTpl(record, i) {
        return List.prototype.itemIconTpl.call(this, ...arguments) +
               `<i class="${record.icon}"></i>`;
    }
}

ProjectFilter.initClass();

// Custom Task with project relation
class Task extends EventModel {
    static $name = 'Task';

    static fields = [
        { name : 'projectId' }
    ];

    static relations = {
        projectInstance : {
            foreignKey            : 'projectId',
            foreignStore          : 'projectStore',
            relatedCollectionName : 'events'
        }
    };
}

// Setup
const projectStore = new Store({
    id         : 'projects',
    modelClass : Project
});

const calendar = new Calendar({
    date     : new Date(2024, 6, 21),
    appendTo : 'container',

    crudManager : {
        autoLoad   : true,
        loadUrl    : 'data/data.json',
        stores     : [projectStore],
        eventStore : {
            modelClass : Task,
            projectStore
        }
    },

    sidebar : {
        items : {
            // Project filter in sidebar
            projects : {
                type     : 'projectfilter',
                weight   : 150,  // Above ResourceFilter
                store    : projectStore,
                title    : 'Projects',
                selected : [1],

                onSelectionChange({ selected }) {
                    const resourceStore = calendar.resourceStore;
                    const eventStore    = calendar.eventStore;

                    // Filter resources by project
                    resourceStore.filter({
                        id       : 'resourceFilter',
                        filterBy : resource => resource.events.some(
                            eventRecord => selected.includes(eventRecord.projectInstance)
                        )
                    });

                    // Filter events by project
                    eventStore.filter({
                        id       : 'eventFilter',
                        filterBy : eventRecord => selected.includes(eventRecord.projectInstance)
                    });
                }
            },
            resourceFilter : { title : 'Resources' },
            eventFilter    : false
        }
    },

    features : {
        eventEdit : {
            items : {
                projectField : {
                    type         : 'combo',
                    name         : 'projectId',
                    displayField : 'name',
                    valueField   : 'id',
                    label        : 'Project',
                    store        : projectStore,
                    required     : true
                }
            }
        }
    },

    listeners : {
        beforeEventEditShow({ eventRecord, editor }) {
            // Make project read-only for existing events
            editor.widgetMap.projectField.readOnly = !eventRecord.isCreating;
        }
    }
});
```

---

## TaskBoard UndoRedo

### Custom Transaction Titles

```typescript
import { TaskBoard } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    appendTo : 'container',

    tbar : [
        {
            type  : 'taskboardundoredo',
            items : {
                transactionsCombo : { width : '20em' }
            }
        }
    ],

    project : {
        stm : {
            autoRecord : true,
            disabled   : false,

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
                            else if (newData.prio) {
                                title = `Set task ${model.name} prio to ${newData.prio}`;
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
        },

        loadUrl  : 'data/data.json',
        autoLoad : true
    }
});
```

---

## TaskBoard Column & Swimlane Drag

### Enable Reordering

```typescript
const taskBoard = new TaskBoard({
    appendTo : 'container',

    features : {
        // Allow dragging columns to reorder
        columnDrag : true,

        // Allow dragging swimlanes to reorder
        swimlaneDrag : true,

        // Task drag enabled by default
        taskDrag : {
            // Show grip handle
            showGrip : true
        }
    },

    columns : [
        { id : 'todo', text : 'Todo', color : 'pink' },
        { id : 'doing', text : 'Doing', color : 'lime' },
        { id : 'done', text : 'Done', color : 'green' }
    ],

    swimlanes : [
        { id : 'high', text : 'High', color : 'red' },
        { id : 'medium', text : 'Medium', color : 'orange' },
        { id : 'low', text : 'Low', color : 'green' }
    ],

    // Toolbar widgets
    tbar : [
        { type : 'swimlanefilterfield' },
        { type : 'swimlanepickerbutton' },
        { type : 'columnpickerbutton' }
    ],

    listeners : {
        columnDrop({ column, before }) {
            console.log(`Column ${column.text} moved before ${before?.text || 'end'}`);
        },
        swimlaneDrop({ swimlane, before }) {
            console.log(`Swimlane ${swimlane.text} moved before ${before?.text || 'end'}`);
        }
    }
});
```

---

## Gerelateerde Documenten

- [INTEGRATION-SHARED-PROJECT.md](./INTEGRATION-SHARED-PROJECT.md) - Shared ProjectModel
- [INTEGRATION-DASHBOARD.md](./INTEGRATION-DASHBOARD.md) - Multi-widget dashboards
- [INTEGRATION-EXPORT.md](./INTEGRATION-EXPORT.md) - PDF, Excel, MS Project export
- [INTEGRATION-REALTIME.md](./INTEGRATION-REALTIME.md) - WebSocket, STM, realtime sync
- [INTEGRATION-FRAMEWORKS.md](./INTEGRATION-FRAMEWORKS.md) - React, Vue, Angular integratie
- [INTEGRATION-PERFORMANCE.md](./INTEGRATION-PERFORMANCE.md) - Big datasets, lazy loading
- [CALENDAR-DEEP-DIVE-VIEWS.md](./CALENDAR-DEEP-DIVE-VIEWS.md) - Calendar view modes
- [TASKBOARD-IMPL-DRAG-DROP.md](./TASKBOARD-IMPL-DRAG-DROP.md) - TaskBoard drag details

---

*Bryntum Suite 7.1.0 - Calendar + TaskBoard Integration*
