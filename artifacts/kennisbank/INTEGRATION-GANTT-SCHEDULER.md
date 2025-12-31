# INTEGRATION-GANTT-SCHEDULER.md

> **Gantt + SchedulerPro Synchronisatie** - Partner widgets, resource drag, ResourceHistogram, en ResourceUtilization.

---

## Overzicht

Gantt en SchedulerPro bieden verschillende views op dezelfde projectdata:
- **Gantt**: Task-centric view met hiërarchie, dependencies, en critical path
- **SchedulerPro**: Resource-centric view met workload per resource
- **ResourceHistogram**: Grafische resource allocation bars
- **ResourceUtilization**: Gedetailleerde time-phased allocation data

Dit document beschrijft de integratiepatronen tussen deze widgets.

---

## Partner Widget Configuratie

### Basis Partner Setup

```typescript
import {
    Gantt,
    SchedulerPro,
    ProjectModel,
    Splitter,
    Container
} from '@bryntum/gantt';

const project = new ProjectModel({
    startDate          : '2024-01-16',
    endDate            : '2024-02-13',
    autoSetConstraints : true,
    calendar           : 'general',
    loadUrl            : 'data/launch-saas.json',
    autoLoad           : true,
    validateResponse   : true
});

// Gantt als primary widget
const gantt = new Gantt({
    project,
    appendTo    : 'container',
    flex        : 1,
    collapsible : true,
    header      : false,
    minHeight   : 0,

    viewPreset  : 'weekAndDayLetter',
    columnLines : true,

    dependencyIdField : 'sequenceNumber',
    resourceImagePath : '../_shared/images/users/',

    columns : [
        { type: 'sequence', width: 50 },
        { type: 'name', width: 280 },
        { type: 'percent', field: 'percentDone', width: 170 },
        { type: 'resourceassignment', showAvatars: true, width: 170 }
    ]
});

// Splitter met collapse buttons
new Splitter({
    appendTo    : 'container',
    showButtons : true
});

// SchedulerPro als partner
const scheduler = new SchedulerPro({
    project,
    appendTo  : 'container',
    flex      : 1,
    minHeight : 0,

    // Partner relationship voor scroll sync
    partner     : gantt,
    hideHeaders : true,  // Gebruik headers van partner

    rowHeight  : 45,
    eventColor : 'green',
    eventStyle : 'gantt',

    features : {
        dependencies : true,
        percentBar   : true
    },

    columns : [
        {
            type           : 'resourceInfo',
            field          : 'name',
            text           : 'Resource',
            showEventCount : false,
            width          : 330
        },
        {
            text   : 'Assigned tasks',
            field  : 'events.length',
            width  : 170,
            editor : false,
            align  : 'right',
            renderer({ value }) {
                return `${value} task${value !== 1 ? 's' : ''}`;
            }
        },
        {
            text   : 'Assigned work days',
            width  : 170,
            editor : false,
            align  : 'right',
            renderer({ record }) {
                const totalDays = record.events.reduce(
                    (total, task) => total + task.duration,
                    0
                );
                return `${totalDays} days`;
            }
        }
    ]
});
```

### TypeScript Interfaces

```typescript
interface PartnerConfig {
    partner?: Gantt | SchedulerPro | Grid | ResourceHistogram | ResourceUtilization;
    hideHeaders?: boolean;
}

interface GanttSchedulerIntegration {
    gantt: Gantt;
    scheduler: SchedulerPro;
    project: ProjectModel;
    splitter?: Splitter;

    // Partner methods
    addPartner(widget: Widget): void;
    removePartner(widget: Widget): void;
}

interface ScrollSyncConfig {
    scrollManager: ScrollManager;
    enableScrollingCloseToEdges(subGrid: SubGrid): void;
    disableScrollingCloseToEdges(subGrid: SubGrid): void;
}

interface ZoomConfig {
    zoomLevel: number;
    minZoomLevel: number;
    maxZoomLevel: number;

    zoomIn(levels?: number): number;
    zoomOut(levels?: number): number;
    zoomToLevel(level: number): number;
    zoomToFit(options?: ZoomToFitOptions): void;
    zoomToSpan(options: ZoomToSpanOptions): void;
}

interface ZoomToFitOptions {
    leftMargin?: number;
    rightMargin?: number;
}

interface ZoomToSpanOptions {
    startDate: Date;
    endDate: Date;
    leftMargin?: number;
    rightMargin?: number;
}
```

---

## DragHelper voor Resource Assignment

### Drag Resources van Grid naar Gantt Tasks

```typescript
import { DragHelper, Toast, TreeGrid, AvatarRendering, Container, ProjectModel } from '@bryntum/gantt';

class ResourceDrag extends DragHelper {
    static $name = 'ResourceDrag';

    static configurable = {
        callOnFunctions      : true,
        // Clone ipv actual element draggen
        cloneTarget          : true,
        // Sizing via CSS
        autoSizeClonedTarget : false,
        // Stack alle proxy nodes
        unifiedProxy         : true,
        // Drop targets
        dropTargetSelector   : '.b-gantt-task-wrap,.b-gantt .b-grid-row',
        // Wat kan worden gedragged
        targetSelector       : '.b-grid-row',
        // Drag alleen de avatar
        proxySelector        : '.b-resource-avatar',

        gantt : null,
        grid  : null
    };

    onDragStart({ context }) {
        const { grid, gantt } = this;
        const { grabbed } = context;

        // Bewaar resource reference
        context.resourceRecord = grid.getRecordFromElement(grabbed);

        // Multi-select support
        context.relatedElements = grid.selectedRecords
            .map(rec => rec !== context.resourceRecord &&
                grid.rowManager.getRowFor(rec).element)
            .filter(el => el);

        // Enable edge scrolling
        gantt.enableScrollingCloseToEdges(gantt.timeAxisSubGrid);

        // CSS class voor hover effect
        gantt.element.classList.add('b-dragging-resource');
    }

    onDrag({ context, event }) {
        const targetTask = context.taskRecord = this.gantt.resolveTaskRecord(event.target);

        // Valid als task bestaat en resource nog niet assigned
        context.valid = Boolean(
            targetTask && !targetTask.resources.includes(context.resourceRecord)
        );
    }

    async onDrop({ context }) {
        const { gantt, grid } = this;
        const { taskRecord, resourceRecord } = context;

        if (context.valid) {
            // Animeer naar assignment cell
            const resourceAssignmentCell = gantt.getCell({
                column : gantt.columns.get('assignments'),
                record : taskRecord
            });
            const avatarContainer = resourceAssignmentCell?.querySelector(
                '.b-resource-avatar-container'
            );

            if (avatarContainer) {
                await this.animateProxyTo(avatarContainer, {
                    align : 'l0-r0'
                });
            }

            // Assign alle geselecteerde resources
            grid.selectedRecords.forEach(resourceRecord => {
                if (!taskRecord.resources.includes(resourceRecord)) {
                    taskRecord.assign(resourceRecord);
                }
            });
        }
        else if (taskRecord?.resources.includes(resourceRecord)) {
            Toast.show(`Task is already assigned to ${resourceRecord.name}`);
        }

        // Cleanup
        gantt.element.classList.remove('b-dragging-resource');
        gantt.disableScrollingCloseToEdges(gantt.timeAxisSubGrid);
    }

    updateGantt(gantt) {
        // Configureer scrollManager
        this.scrollManager = gantt.scrollManager;
        this.outerElement = this.grid.element;
    }
}
```

### ResourceGrid Widget

```typescript
class ResourceGrid extends TreeGrid {
    static $name = 'ResourceGrid';
    static type = 'resourcegrid';

    avatarRendering: AvatarRendering;

    static configurable = {
        resourceImagePath : '../_shared/images/users/',

        selectionMode : {
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
        this.avatarRendering = new AvatarRendering({
            element : this.element
        });
    }
}

ResourceGrid.initClass();
```

### Container Setup met Drag

```typescript
const container = new Container({
    appendTo : 'container',
    layout   : 'hbox',
    flex     : 1,

    items : {
        gantt : {
            type              : 'gantt',
            project,
            flex              : 1,
            dependencyIdField : 'sequenceNumber',
            resourceImagePath : '../_shared/images/users/',

            features : {
                taskTooltip : false
            },

            columns : [
                { type: 'name', minWidth: 200 },
                {
                    type                   : 'resourceassignment',
                    width                  : 200,
                    showAvatars            : true,
                    enableResourceDragging : true
                }
            ]
        },

        splitter : {
            type        : 'splitter',
            showButtons : 'end'
        },

        resourceGrid : {
            type        : 'resourcegrid',
            collapsible : true,
            header      : false,
            width       : 270,
            store       : project.resourceStore
        }
    }
});

// Initialiseer drag helper
const drag = new ResourceDrag({
    grid      : container.widgetMap.resourceGrid,
    gantt     : container.widgetMap.gantt,
    constrain : false
});
```

---

## Drag Resources van ResourceUtilization

```typescript
import { DragHelper, Gantt, ResourceUtilization, ProjectModel, Splitter } from '@bryntum/gantt';

class UtilizationDrag extends DragHelper {
    static configurable = {
        callOnFunctions      : true,
        cloneTarget          : true,
        autoSizeClonedTarget : false,
        unifiedProxy         : true,
        dropTargetSelector   : '.b-gantt-task-wrap,.b-gantt .b-grid-row',
        // Alleen resource rows in locked subgrid
        targetSelector       : '.b-grid-sub-grid-locked .b-resource-row',
        proxySelector        : '.b-resource-avatar',
        gantt                : null,
        grid                 : null
    };

    onDragStart({ context }) {
        const { grid, gantt } = this;
        const { grabbed } = context;

        // ResourceUtilization rows hebben .origin property
        context.resourceRecord = grid.getRecordFromElement(grabbed).origin;

        gantt.enableScrollingCloseToEdges(gantt.timeAxisSubGrid);
        gantt.element.classList.add('b-dragging-resource');
    }

    onDrag({ context, event }) {
        const targetTask = context.taskRecord = this.gantt.resolveTaskRecord(event.target);
        context.valid = Boolean(
            targetTask && !targetTask.resources.includes(context.resourceRecord)
        );
    }

    async onDrop({ context }) {
        const { gantt, grid } = this;
        const { taskRecord, resourceRecord } = context;

        if (context.valid) {
            const cell = gantt.getCell({
                column : gantt.columns.get('assignments'),
                record : taskRecord
            });
            const container = cell.querySelector('.b-resource-avatar-container');

            if (container) {
                await this.animateProxyTo(container, { align: 'l0-r0' });
            }

            // Assign geselecteerde resources
            grid.selectedRecords.forEach(({ origin: resourceRecord }) => {
                if (!taskRecord.resources.includes(resourceRecord)) {
                    taskRecord.assign(resourceRecord);
                }
            });
        }
        else if (taskRecord?.resources.includes(resourceRecord)) {
            Toast.show(`Task is already assigned to ${resourceRecord.name}`);
        }

        gantt.element.classList.remove('b-dragging-resource');
        gantt.disableScrollingCloseToEdges(gantt.timeAxisSubGrid);
    }

    updateGantt(gantt) {
        this.scrollManager = gantt.scrollManager;
        this.outerElement = this.grid.element;
    }
}
```

---

## ResourceHistogram

### Histogram Configuratie

```typescript
import { Gantt, ResourceHistogram, ProjectModel, Splitter } from '@bryntum/gantt';

const project = new ProjectModel({
    startDate : '2024-01-16',
    endDate   : '2024-02-13',
    transport : {
        load : { url: 'data/data.json' }
    },
    autoSetConstraints : true,
    autoLoad           : true,
    validateResponse   : true
});

const gantt = new Gantt({
    project,
    appendTo    : 'container',
    collapsible : true,
    header      : false,
    minHeight   : 0,
    viewPreset  : 'weekAndDayLetter',
    columnLines : true,

    features : {
        labels : {
            before : {
                field  : 'name',
                editor : { type: 'textfield' }
            }
        }
    },

    columns : [
        { type: 'name', width: 280 },
        { type: 'resourceassignment', showAvatars: true, width: 170 }
    ],

    startDate : '2024-01-11'
});

new Splitter({
    appendTo    : 'container',
    showButtons : true
});

const histogram = new ResourceHistogram({
    appendTo          : 'container',
    project,
    hideHeaders       : true,
    partner           : gantt,
    rowHeight         : 50,
    collapsible       : true,
    header            : false,
    minHeight         : 0,
    showBarTip        : true,
    resourceImagePath : '../_shared/images/users/',

    features : {
        scheduleTooltip : false,
        group           : {
            field : 'city'  // Groepeer per city
        }
    },

    columns : [
        {
            type           : 'resourceInfo',
            field          : 'name',
            showEventCount : false,
            flex           : 1
        }
    ],

    tbar : {
        cls   : 'histogram-toolbar',
        items : {
            showBarText : {
                type     : 'slidetoggle',
                text     : 'Show bar texts',
                tooltip  : 'Check to show resource allocation in the bars',
                checked  : false,
                onAction : 'up.onShowBarTextToggle'
            },
            showMaxEffort : {
                type     : 'slidetoggle',
                text     : 'Show max allocation',
                tooltip  : 'Check to display max resource allocation line',
                checked  : true,
                onAction : 'up.onShowMaxAllocationToggle'
            },
            showBarTip : {
                type     : 'slidetoggle',
                text     : 'Enable bar tooltip',
                tooltip  : 'Check to show tooltips when moving mouse over bars',
                checked  : true,
                onAction : 'up.onShowBarTipToggle'
            }
        }
    },

    onShowBarTextToggle({ source }) {
        histogram.showBarText = source.checked;
    },

    onShowMaxAllocationToggle({ source }) {
        histogram.showMaxEffort = source.checked;
    },

    onShowBarTipToggle({ source }) {
        histogram.showBarTip = source.checked;
    }
});
```

### Histogram vs Utilization Vergelijking

| Feature | ResourceHistogram | ResourceUtilization |
|---------|-------------------|---------------------|
| **View type** | Bar chart per tick | Detailed allocation bars |
| **Grouping** | Simple field grouping | TreeGroup met levels |
| **Editing** | View only | AllocationCellEdit |
| **Series** | Effort only | Effort, Cost, Quantity |
| **Copy/Paste** | Nee | AllocationCopyPaste |
| **Best for** | Overview | Detailed management |

---

## ResourceUtilization met TreeGroup

### Volledige Configuratie

```typescript
import {
    Gantt,
    ResourceUtilization,
    Splitter,
    Store,
    AvatarRendering,
    DateHelper,
    ProjectModel
} from '@bryntum/gantt';

// Variabele voor grouping richting
let isGroupByResourceToCity = true;

const project = new ProjectModel({
    loadUrl          : 'data/data.json',
    autoLoad         : true,
    validateResponse : true
});

const scheduler = new SchedulerPro({
    appendTo  : 'container',
    minHeight : 0,
    flex      : '1 1 50%',

    collapsible : true,
    header      : false,
    project,

    startDate  : new Date(2024, 3, 28),
    endDate    : new Date(2024, 4, 30),
    viewPreset : 'dayAndWeek',
    eventStyle : 'tonal',
    tickSize   : 50,

    resourceImages : {
        path      : '../_shared/images/users/',
        extension : '.png'
    },

    columns : [
        { type: 'resourceInfo', text: 'Name', field: 'name', width: 170 },
        { text: 'City', field: 'city', width: 110 }
    ],

    tbar : [
        {
            type     : 'button',
            icon     : 'b-icon-search-plus',
            text     : 'Zoom in',
            onAction : () => scheduler.zoomIn()
        },
        {
            type     : 'button',
            icon     : 'b-icon-search-minus',
            text     : 'Zoom out',
            onAction : () => scheduler.zoomOut()
        }
    ]
});

new Splitter({
    appendTo    : 'container',
    showButtons : true
});

// TreeGroup level functies
const treeGroupLevels = [
    // Level 1: Groepeer per resource
    ({ origin }) => {
        if (origin.isResourceModel) {
            return Store.StopBranch;
        }
        return origin.resource;
    },
    // Level 2: Groepeer per resource city
    ({ origin }) => origin.isResourceModel
        ? origin.city
        : origin.resource.city
];

const resourceUtilization = new ResourceUtilization({
    project,
    hideHeaders : true,
    partner     : scheduler,
    appendTo    : 'container',
    rowHeight   : 50,
    minHeight   : 0,
    collapsible : true,
    header      : false,
    flex        : '1 1 50%',
    showBarTip  : true,

    features : {
        treeGroup : {
            levels : treeGroupLevels
        },
        nonWorkingTime : false
    },

    columns : [
        {
            cellCls : 'tree-resource-event',
            type    : 'tree',
            text    : 'Resource/Event',
            width   : 240,
            flex    : 1,

            renderer({ record, grid }) {
                record = grid.resolveRecordToOrigin(record);

                // Assignment row
                if (record.isAssignmentModel) {
                    const { event } = record;
                    return {
                        children : [
                            {
                                tag      : 'dl',
                                class    : 'b-assignment-info',
                                children : [
                                    { tag: 'dt', text: event.name },
                                    {
                                        tag  : 'dd',
                                        text : DateHelper.format(event.startDate, 'L') +
                                               ' - ' +
                                               DateHelper.format(event.endDate, 'L')
                                    }
                                ]
                            }
                        ]
                    };
                }

                // Resource row
                if (record.isResourceModel) {
                    return record.name;
                }

                // Group row
                return record.key?.name || record.key;
            }
        }
    ],

    tbar : [
        {
            type    : 'checkbox',
            ref     : 'showBarTip',
            text    : 'Enable bar tooltip',
            checked : true,
            onAction({ source }) {
                resourceUtilization.showBarTip = source.checked;
            }
        },
        '->',
        { type: 'label', text: 'Group by' },
        {
            type        : 'buttongroup',
            rendition   : 'padded',
            toggleGroup : true,
            cls         : 'group-buttons',
            items       : [
                {
                    text                 : 'Resource - City',
                    pressed              : true,
                    supportsPressedClick : true,
                    onAction() {
                        if (!isGroupByResourceToCity) {
                            treeGroupLevels.reverse();
                        }
                        isGroupByResourceToCity = true;
                        resourceUtilization.group(treeGroupLevels);
                    }
                },
                {
                    text                 : 'City - Resource',
                    supportsPressedClick : true,
                    onAction() {
                        if (isGroupByResourceToCity) {
                            treeGroupLevels.reverse();
                        }
                        isGroupByResourceToCity = false;
                        resourceUtilization.group(treeGroupLevels);
                    }
                },
                {
                    text : 'Default',
                    onAction() {
                        if (!isGroupByResourceToCity) {
                            treeGroupLevels.reverse();
                            isGroupByResourceToCity = true;
                        }
                        resourceUtilization.clearGroups();
                    }
                }
            ]
        }
    ]
});
```

### Series Configuratie

```typescript
const resourceUtilization = new ResourceUtilization({
    project,
    partner : gantt,

    // Configureer welke series actief zijn
    series : {
        effort   : { disabled: false },  // Uren/effort
        cost     : { disabled: true },   // Kosten
        quantity : { disabled: true }    // Materialen
    },

    tbar : {
        items : {
            seriesButtonGroup : {
                type      : 'buttongroup',
                rendition : 'padded',
                defaults  : { toggleable: true },
                onAction  : 'up.onSeriesButtonToggle',

                items : [
                    {
                        text     : 'Effort',
                        icon     : 'b-icon-user',
                        seriesId : 'effort',
                        pressed  : true
                    },
                    {
                        text     : 'Cost',
                        icon     : 'b-icon-cost',
                        seriesId : 'cost',
                        pressed  : false
                    },
                    {
                        text     : 'Material',
                        icon     : 'b-icon-material',
                        seriesId : 'quantity',
                        pressed  : false
                    }
                ]
            }
        }
    },

    onSeriesButtonToggle({ source }) {
        const { seriesId, pressed } = source;
        this.series[seriesId].disabled = !pressed;
    }
});
```

---

## Scroll Synchronisatie

### Automatische Partner Sync

```typescript
// Bij partner config wordt scroll automatisch gesynchroniseerd
const scheduler = new SchedulerPro({
    project,
    partner : gantt  // Horizontale scroll sync
});

// Dynamisch toevoegen/verwijderen
const syncToggle = {
    type    : 'slidetoggle',
    checked : true,
    text    : 'Sync scrolling',

    onChange({ value }) {
        scheduler.hideHeaders = value;

        if (value) {
            gantt.addPartner(scheduler);
        }
        else {
            gantt.removePartner(scheduler);
        }
    }
};
```

### Edge Scroll tijdens Drag

```typescript
// In DragHelper
onDragStart({ context }) {
    // Enable scrolling wanneer cursor dicht bij edge komt
    gantt.enableScrollingCloseToEdges(gantt.timeAxisSubGrid);
}

onDrop({ context }) {
    // Disable edge scrolling
    gantt.disableScrollingCloseToEdges(gantt.timeAxisSubGrid);
}

// Configure DragHelper met scrollManager
updateGantt(gantt) {
    this.scrollManager = gantt.scrollManager;
}
```

---

## Cross-Widget Selection

### Resource Selection -> Task Highlighting

```typescript
const scheduler = new SchedulerPro({
    project,
    partner : gantt,

    listeners : {
        selectionChange({ selection }) {
            // Vind alle tasks van geselecteerde resources
            const tasks = gantt.taskStore.query(
                task => selection.some(
                    resource => task.resources.includes(resource)
                )
            );

            // Highlight in Gantt
            gantt.highlightTasks({
                tasks,
                unhighlightOthers : true
            });
        }
    }
});

// Clear highlights
gantt.unhighlightTasks();
```

### Task Selection -> Resource Scroll

```typescript
gantt.on('selectionChange', async ({ selected }) => {
    if (selected.length) {
        const task = selected[0];
        const resources = task.resources;

        if (resources.length) {
            await scheduler.scrollResourceIntoView(resources[0], {
                animate : true
            });
        }
    }
});
```

---

## Multiple Gantt Charts

### Cross-Gantt Synchronisatie

```typescript
const container = new Container({
    appendTo : 'container',
    layout   : 'vbox',
    flex     : 1,

    items : {
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
            partner     : 'up.topGantt',  // Partner referentie
            project     : {
                loadUrl  : 'data/project2.json',
                autoLoad : true
            },
            features : {
                rowReorder : {
                    showGrip           : true,
                    allowCrossGridDrag : true
                }
            }
        }
    }
});
```

---

## Zoom Synchronisatie

```typescript
// Zoom controls die partner widgets beïnvloeden
const tbar = {
    items : {
        zoomLabel : {
            type : 'widget',
            html : 'Zoom:'
        },
        zoomIn : {
            icon     : 'b-icon-search-plus',
            tooltip  : 'Zoom in',
            onAction : () => gantt.zoomIn()
            // Partner widget zoomt automatisch mee
        },
        zoomOut : {
            icon     : 'b-icon-search-minus',
            tooltip  : 'Zoom out',
            onAction : () => gantt.zoomOut()
        },
        zoomToFit : {
            text     : 'Fit',
            tooltip  : 'Zoom to fit all tasks',
            onAction : () => gantt.zoomToFit({
                leftMargin  : 50,
                rightMargin : 50
            })
        }
    }
};
```

---

## Collapsible Panels

```typescript
const gantt = new Gantt({
    project,
    appendTo    : 'container',
    collapsible : true,
    header      : false,
    minHeight   : 0,
    flex        : 1
});

const resourceUtilization = new ResourceUtilization({
    project,
    partner     : gantt,
    collapsible : true,
    header      : false,
    minHeight   : 0,
    flex        : 1
});

// Programmatisch in/uitklappen
gantt.collapse();
gantt.expand();
```

---

## Best Practices

### 1. Partner Setup Order

```typescript
// Primary widget eerst
const gantt = new Gantt({ project, appendTo: 'container' });

// Dan partner met referentie naar bestaande widget
const scheduler = new SchedulerPro({
    project,
    partner  : gantt,
    appendTo : 'container'
});
```

### 2. ScrollManager Configuratie

```typescript
// Bij custom DragHelper, altijd scrollManager configureren
updateGantt(gantt) {
    this.scrollManager = gantt.scrollManager;
    this.outerElement = this.grid.element;
}
```

### 3. Resource Image Path Consistentie

```typescript
// Zelfde path gebruiken in alle widgets
const resourceImagePath = '../_shared/images/users/';

const gantt = new Gantt({ project, resourceImagePath });
const histogram = new ResourceHistogram({ project, resourceImagePath });
const utilization = new ResourceUtilization({ project, resourceImagePath });
```

### 4. Partner Cleanup

```typescript
function cleanup() {
    // Verwijder partner relaties eerst
    gantt.removePartner(scheduler);
    gantt.removePartner(histogram);

    // Dan widgets destroyen
    scheduler.destroy();
    histogram.destroy();
    gantt.destroy();
    project.destroy();
}
```

---

## Multiple Gantt Charts

### Cross-Gantt Row Dragging

```typescript
import { Container, Gantt } from '@bryntum/gantt';

const dashboard = new Container({
    appendTo : 'container',
    layout   : 'vbox',

    items : {
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

            project : {
                loadUrl  : 'data/project1.json',
                autoLoad : true
            },

            features : {
                rowReorder : {
                    showGrip           : true,
                    // KEY: Allow drag between gantts
                    allowCrossGridDrag : true
                }
            },

            style : {
                marginBottom            : 0,
                borderBottom            : 'none',
                borderBottomLeftRadius  : 0,
                borderBottomRightRadius : 0
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

            project : {
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
                marginTop            : 0,
                borderTop            : 'none',
                borderTopLeftRadius  : 0,
                borderTopRightRadius : 0
            }
        }
    }
});
```

### Style voor Naadloze Overgang

```css
/* Verberg border tussen charts */
.b-gantt:first-of-type {
    margin-bottom: 0;
    border-bottom: none;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.b-gantt:last-of-type {
    margin-top: 0;
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}

/* Synchronize row heights */
.b-gantt .b-grid-row {
    min-height: 40px;
}
```

---

## Undo/Redo Integration

### EnableUndoRedoKeys

```typescript
const gantt = new Gantt({
    project,

    // Enable Ctrl+Z / Ctrl+Y keyboard shortcuts
    enableUndoRedoKeys : true,

    tbar : [
        {
            type  : 'undoredo',
            text  : true,
            items : {
                // Hide dropdown if not needed
                transactionsCombo : null
            }
        }
    ]
});

// STM is enabled by UndoRedo widget
// Otherwise enable manually:
// project.stm.enable();
```

### STM Project Configuration

```typescript
const project = new ProjectModel({
    loadUrl  : 'data/project.json',
    autoLoad : true,

    stm : {
        // Auto-record changes
        autoRecord : true,

        // For WebSocket sync
        revisionsEnabled : true
    }
});

// Listen to STM events
project.stm.on({
    recordingStop({ transaction }) {
        console.log(`Recorded: ${transaction.title} (${transaction.length} steps)`);
    },
    restoringStop({ stm }) {
        console.log(`Restored to position: ${stm.position}`);
    }
});
```

---

## WalkHelper for Data Processing

### Pre-processing Task Data

```typescript
import { WalkHelper, ProjectModel, TaskModel } from '@bryntum/gantt';

class Task extends TaskModel {
    static $name = 'Task';

    static fields = [
        'status',
        { name: 'priority', defaultValue: 'Medium' },
        { name: 'eventColor', defaultValue: 'green' }
    ];

    get isLate() {
        return !this.isCompleted &&
            this.deadlineDate &&
            Date.now() > this.deadlineDate;
    }

    get status() {
        if (this.isCompleted) return 'Completed';
        if (this.isLate) return 'Late';
        if (this.isStarted) return 'Started';
        return 'Not started';
    }
}

const project = new ProjectModel({
    taskModelClass : Task,
    loadUrl        : 'data/project.json',

    listeners : {
        beforeLoadApply({ response }) {
            // Walk all tasks including children
            WalkHelper.preWalk(
                response.tasks.rows[0],
                node => node.children,
                task => {
                    // Add random colors and priorities
                    task.eventColor = ['orange', 'lime', 'gray', 'violet'][
                        Math.floor(Math.random() * 4)
                    ];
                    task.priority = ['High', 'Low', 'Medium'][
                        Math.floor(Math.random() * 3)
                    ];
                }
            );
        }
    }
});
```

### WalkHelper Methods

```typescript
import { WalkHelper } from '@bryntum/core';

// Pre-order walk (parent first, then children)
WalkHelper.preWalk(rootNode, node => node.children, node => {
    console.log('Visiting:', node.name);
});

// Post-order walk (children first, then parent)
WalkHelper.postWalk(rootNode, node => node.children, node => {
    console.log('Visiting:', node.name);
});

// Walk with depth tracking
let depth = 0;
WalkHelper.preWalk(rootNode, node => {
    depth++;
    return node.children;
}, node => {
    console.log(`${'  '.repeat(depth)}${node.name}`);
    depth--;
});
```

---

## Transport Configuration

### Alternative Load Configuration

```typescript
const project = new ProjectModel({
    // Alternative to loadUrl
    transport : {
        load : {
            url : 'api/project/load',
            method : 'GET',
            headers : {
                'Authorization' : 'Bearer token123'
            }
        },
        sync : {
            url : 'api/project/sync',
            method : 'POST',
            headers : {
                'Authorization' : 'Bearer token123'
            }
        }
    },

    autoLoad : true,
    autoSync : true,

    // Validation in development
    validateResponse : process.env.NODE_ENV !== 'production'
});
```

### Load with Parameters

```typescript
// Load with query parameters
project.load({
    projectId : 123,
    includeArchived : false
});

// Load with request config
project.load({
    request : {
        body : JSON.stringify({ customParam: 'value' }),
        credentials : 'include'
    }
});

// Reset and reload
project.load({ reset: true });
```

---

## Column Reorder Feature

### Stretched Drag Proxy

```typescript
const gantt = new Gantt({
    project,

    features : {
        columnReorder : {
            // Proxy stretches to show full column
            stretchedDragProxy : true
        }
    }
});
```

---

## SubGrid Configuration

### Locked and Normal Areas

```typescript
const gantt = new Gantt({
    project,

    subGridConfigs : {
        locked : {
            // Fixed width or flex
            width : 420,
            // Or use flex
            // flex : 3
        },
        normal : {
            flex : 5
        }
    },

    columns : [
        // Locked columns (left side)
        { type : 'wbs' },
        { type : 'name', width : 250 },
        { type : 'startdate', width : 170 },
        { type : 'duration', align : 'center' },

        // These will be in normal region if configured
        { type : 'predecessor', width : 112 }
    ]
});
```

---

## Load Mask Configuration

```typescript
const gantt = new Gantt({
    project,

    // Custom load mask text
    loadMask : 'Loading tasks...',

    // Or with detailed configuration
    loadMask : {
        text   : 'Loading project data...',
        icon   : 'b-icon-spinner',
        anchor : true
    }
});

// Programmatic masking
gantt.maskBody('Processing...');
gantt.unmask();
```

---

## Dependency Field Configuration

```typescript
const gantt = new Gantt({
    project,

    // Use wbsCode instead of id for dependencies
    dependencyIdField : 'wbsCode',

    columns : [
        { type : 'wbs' },
        { type : 'name', width : 250 },
        {
            text  : 'Predecessors',
            type  : 'predecessor',
            width : 112
        },
        {
            text  : 'Successors',
            type  : 'successor',
            width : 112
        },
        {
            // AddNew column for quick task creation
            type : 'addnew'
        }
    ]
});
```

---

## Project Commit and Propagation

### Waiting for Calculation

```typescript
const project = new ProjectModel({
    loadUrl  : 'data/project.json',
    autoLoad : true
});

// Wait for project calculation to complete
await project.commitAsync();

// Now safe to access calculated values
const gantt = new Gantt({
    appendTo : 'container',
    project
});
```

### Batch Changes

```typescript
// Suspend propagation during batch changes
project.taskStore.beginBatch();

const tasks = project.taskStore.getRange();
tasks.forEach(task => {
    task.percentDone = 100;
    task.status = 'done';
});

// Resume propagation and trigger single recalculation
project.taskStore.endBatch();
```

---

## Gerelateerde Documenten

- [INTEGRATION-SHARED-PROJECT.md](./INTEGRATION-SHARED-PROJECT.md) - Shared ProjectModel patterns
- [INTEGRATION-DASHBOARD.md](./INTEGRATION-DASHBOARD.md) - Multi-widget dashboards
- [IMPL-TIMELINE.md](./IMPL-TIMELINE.md) - TimeAxis en ViewPresets
- [DEEP-DIVE-SCHEDULING.md](./DEEP-DIVE-SCHEDULING.md) - Scheduling engine

---

## Nested Events

### Hierarchical Events Configuration

```typescript
import { SchedulerPro, EventModel, StringHelper } from '@bryntum/schedulerpro';

// Custom Event with parent-child relationship
class Task extends EventModel {
    static $name = 'Task';

    static fields = [
        'startDate',
        'endDate',
        'name',
        'eventColor'
    ];

    // Computed: is this a parent?
    get isParent() {
        return Boolean(this.children?.length);
    }

    get eventStyle() {
        return this.isParent ? 'plain' : 'colored';
    }
}

const scheduler = new SchedulerPro({
    appendTo : 'container',
    startDate : new Date(2022, 2, 20),
    endDate   : new Date(2022, 2, 27),

    // CRITICAL: Enable nested events rendering
    nestedEvents : true,

    project : {
        eventModelClass : Task,
        autoLoad        : true,
        loadUrl         : 'data/data.json'
    },

    columns : [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            width : 180
        }
    ],

    // Custom rendering for parent vs child
    eventRenderer({ eventRecord }) {
        // Parent events show summary
        if (eventRecord.isParent) {
            return {
                class    : 'parent-event',
                children : [
                    { tag : 'span', class : 'count', text : eventRecord.children.length },
                    { text : eventRecord.name }
                ]
            };
        }

        // Child events show details
        return {
            children : [
                { tag : 'i', class : eventRecord.iconCls },
                { text : eventRecord.name }
            ]
        };
    }
});
```

### Nested Events Data Structure

```json
{
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Parent Event",
                "startDate": "2022-03-21",
                "endDate": "2022-03-25",
                "children": [
                    {
                        "id": 101,
                        "name": "Child Event 1",
                        "startDate": "2022-03-21",
                        "endDate": "2022-03-22"
                    },
                    {
                        "id": 102,
                        "name": "Child Event 2",
                        "startDate": "2022-03-23",
                        "endDate": "2022-03-24"
                    }
                ]
            }
        ]
    }
}
```

---

## Skill Matching

### Resource-Event Skill Validation

```typescript
import { SchedulerPro, EventModel, ResourceModel } from '@bryntum/schedulerpro';

// Resource with skills
class TeamMember extends ResourceModel {
    static fields = [
        { name: 'skills', type: 'array', defaultValue: [] }
    ];

    hasSkill(skill) {
        return this.skills.includes(skill);
    }

    hasAllSkills(requiredSkills) {
        return requiredSkills.every(skill => this.hasSkill(skill));
    }
}

// Event with required skills
class JobTask extends EventModel {
    static fields = [
        { name: 'requiredSkills', type: 'array', defaultValue: [] }
    ];

    // Check if resource can perform this task
    canBePerformedBy(resource) {
        return resource.hasAllSkills(this.requiredSkills);
    }
}

const scheduler = new SchedulerPro({
    appendTo : 'container',

    project : {
        resourceModelClass : TeamMember,
        eventModelClass    : JobTask,
        autoLoad           : true,
        loadUrl            : 'data/data.json'
    },

    features : {
        eventDrag : {
            // Validate during drag
            validatorFn({ eventRecord, newResource }) {
                const valid = eventRecord.canBePerformedBy(newResource);

                return {
                    valid,
                    message : valid ? '' : `Missing skills: ${eventRecord.requiredSkills.join(', ')}`
                };
            }
        },

        eventResize : {
            validatorFn({ eventRecord }) {
                // Custom resize validation
                return { valid: true };
            }
        }
    },

    // Visual feedback for skill match
    eventRenderer({ eventRecord, resourceRecord }) {
        const canPerform = eventRecord.canBePerformedBy(resourceRecord);

        return {
            class : canPerform ? '' : 'skill-mismatch',
            children : [
                { text : eventRecord.name },
                !canPerform ? {
                    tag   : 'i',
                    class : 'fa fa-exclamation-triangle warning-icon'
                } : null
            ].filter(Boolean)
        };
    },

    columns : [
        { type : 'resourceInfo', text : 'Resource' },
        {
            text   : 'Skills',
            field  : 'skills',
            width  : 200,
            renderer({ value }) {
                return value.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
            }
        }
    ]
});
```

---

## Travel Time / Event Buffer

### Automatic Buffer Calculation

```typescript
import {
    SchedulerPro, EventModel, AssignmentModel,
    DateHelper, DurationHelper
} from '@bryntum/schedulerpro';

// Event with location for travel calculation
class ServiceCall extends EventModel {
    static fields = [
        'location',
        { name: 'travelTimeBefore', type: 'number', defaultValue: 0 },
        { name: 'travelTimeAfter', type: 'number', defaultValue: 0 }
    ];

    // Get display start/end including travel
    get displayStartDate() {
        return DateHelper.add(
            this.startDate,
            -this.travelTimeBefore,
            'minute'
        );
    }

    get displayEndDate() {
        return DateHelper.add(
            this.endDate,
            this.travelTimeAfter,
            'minute'
        );
    }
}

const scheduler = new SchedulerPro({
    appendTo   : 'container',
    viewPreset : 'hourAndDay',

    project : {
        eventModelClass : ServiceCall,
        autoLoad        : true,
        loadUrl         : 'data/data.json',

        listeners : {
            // Calculate travel time on drop
            beforeEventDropFinalize({ context }) {
                const { eventRecord } = context;

                // Get previous event for this resource
                const prevEvent = eventRecord.resource?.events
                    .filter(e => e !== eventRecord && e.endDate <= eventRecord.startDate)
                    .sort((a, b) => b.endDate - a.endDate)[0];

                if (prevEvent) {
                    // Calculate travel time based on locations
                    const travelMinutes = calculateTravelTime(
                        prevEvent.location,
                        eventRecord.location
                    );

                    eventRecord.travelTimeBefore = travelMinutes;
                }
            }
        }
    },

    features : {
        eventBuffer : {
            // Show buffer zones
            renderer({ eventRecord, type }) {
                if (type === 'before' && eventRecord.travelTimeBefore) {
                    return {
                        class : 'travel-buffer',
                        text  : `${eventRecord.travelTimeBefore}m travel`
                    };
                }
                if (type === 'after' && eventRecord.travelTimeAfter) {
                    return {
                        class : 'travel-buffer after',
                        text  : `${eventRecord.travelTimeAfter}m cleanup`
                    };
                }
            }
        }
    },

    eventRenderer({ eventRecord }) {
        return [
            eventRecord.travelTimeBefore ? {
                class : 'travel-indicator before',
                text  : `🚗 ${eventRecord.travelTimeBefore}m`
            } : null,
            { class : 'event-content', text : eventRecord.name },
            eventRecord.travelTimeAfter ? {
                class : 'travel-indicator after',
                text  : `${eventRecord.travelTimeAfter}m 🧹`
            } : null
        ].filter(Boolean);
    }
});

// Example travel time calculator
function calculateTravelTime(from, to) {
    // Simplified - in real app would use mapping API
    const distances = {
        'Office-Client A': 30,
        'Client A-Client B': 15,
        'Office-Client B': 25
    };

    const key = `${from}-${to}`;
    return distances[key] || distances[`${to}-${from}`] || 20;
}
```

---

## Split Events

### Event Splitting Configuration

```typescript
import { SchedulerPro, EventModel } from '@bryntum/schedulerpro';

class SplittableEvent extends EventModel {
    static fields = [
        { name: 'segments', type: 'array' }
    ];

    // Check if event is split
    get isSplit() {
        return this.segments?.length > 1;
    }

    // Get all segments
    getSegments() {
        return this.segments || [{
            startDate : this.startDate,
            endDate   : this.endDate
        }];
    }
}

const scheduler = new SchedulerPro({
    appendTo   : 'container',
    viewPreset : 'weekAndDay',

    project : {
        eventModelClass : SplittableEvent,
        autoLoad        : true,
        loadUrl         : 'data/data.json'
    },

    features : {
        // Enable event splitting
        eventSegments : true,

        eventMenu : {
            items : {
                splitEvent : {
                    text   : 'Split Event',
                    icon   : 'fa fa-cut',
                    onItem({ eventRecord, date }) {
                        // Split at clicked date
                        eventRecord.split(date);
                    }
                },
                mergeSegments : {
                    text   : 'Merge Segments',
                    icon   : 'fa fa-compress',
                    weight : 210,
                    onItem({ eventRecord }) {
                        // Merge all segments back
                        eventRecord.merge();
                    }
                }
            }
        }
    },

    // Visual differentiation for segments
    eventRenderer({ eventRecord, isSegment, segmentIndex }) {
        if (isSegment) {
            return {
                class : 'event-segment',
                text  : `${eventRecord.name} (Part ${segmentIndex + 1})`
            };
        }
        return eventRecord.name;
    }
});
```

---

## Conflict Resolution

### Postponed Conflicts Handling

```typescript
import { Gantt, ProjectModel, TaskModel } from '@bryntum/gantt';

class Task extends TaskModel {
    static $name = 'Task';

    static fields = [
        // How to handle conflicts
        { name: 'projectConstraintResolution', defaultValue: 'conflict' }
    ];
}

const project = new ProjectModel({
    taskModelClass     : Task,
    loadUrl            : 'data/project.json',
    autoLoad           : true,

    // Postpone conflict resolution to be handled manually
    delayCalculation   : true,

    listeners : {
        // Handle conflicts when they occur
        conflict({ conflict }) {
            console.log('Conflict detected:', conflict);

            // Options:
            // 1. Auto-resolve
            conflict.resolve();

            // 2. Cancel the change
            // conflict.cancel();

            // 3. Show dialog for user decision
            // showConflictDialog(conflict);
        }
    }
});

const gantt = new Gantt({
    appendTo : 'container',
    project,

    features : {
        // Show conflicts in UI
        taskEdit : {
            items : {
                generalTab : {
                    items : {
                        constraintResolution : {
                            type    : 'combo',
                            label   : 'Conflict Resolution',
                            name    : 'projectConstraintResolution',
                            items   : [
                                { value : 'conflict', text : 'Show Conflict' },
                                { value : 'honor', text : 'Honor Constraint' },
                                { value : 'ignore', text : 'Ignore Constraint' }
                            ]
                        }
                    }
                }
            }
        }
    },

    tbar : [
        {
            type : 'button',
            text : 'Process Conflicts',
            onClick() {
                project.calculateProject();
            }
        },
        {
            type : 'button',
            text : 'Clear All Conflicts',
            onClick() {
                project.conflicts.forEach(c => c.resolve());
            }
        }
    ]
});
```

---

## Resource Histogram Advanced

### Multi-Series Histogram

```typescript
import { ResourceHistogram, Gantt, ProjectModel } from '@bryntum/gantt';

const histogram = new ResourceHistogram({
    appendTo          : 'container',
    project,
    partner           : gantt,
    resourceImagePath : '../_shared/images/users/',

    // Multiple data series
    showMaxEffort : true,
    showBarText   : true,
    showBarTip    : true,

    // Bar configuration
    barMargin  : 2,
    barSpacing : 1,

    // Custom bar colors based on utilization
    getBarConfig({ resource, startDate, endDate, allocationTotal }) {
        const utilizationPercent = allocationTotal / resource.maxUnits * 100;

        return {
            cls : utilizationPercent > 100
                ? 'overallocated'
                : utilizationPercent > 80
                    ? 'high-allocation'
                    : 'normal-allocation'
        };
    },

    // Bar tip template
    barTipTemplate({ startDate, endDate, allocationTotal, resource }) {
        return `
            <div class="histogram-tip">
                <strong>${resource.name}</strong>
                <div>Allocated: ${allocationTotal}%</div>
                <div>${DateHelper.format(startDate, 'MMM D')} - ${DateHelper.format(endDate, 'MMM D')}</div>
            </div>
        `;
    },

    columns : [
        {
            type           : 'resourceInfo',
            field          : 'name',
            showEventCount : true,
            width          : 220
        },
        {
            text   : 'Max Units',
            field  : 'maxUnits',
            width  : 100,
            align  : 'right',
            renderer({ value }) {
                return `${value}%`;
            }
        }
    ],

    tbar : [
        {
            type    : 'slidetoggle',
            text    : 'Show % text',
            checked : true,
            onChange({ checked }) {
                histogram.showBarText = checked;
            }
        },
        {
            type    : 'slidetoggle',
            text    : 'Show max line',
            checked : true,
            onChange({ checked }) {
                histogram.showMaxEffort = checked;
            }
        }
    ]
});
```

---

## Cross-Grid Row Dragging

### Drag Between Multiple Grids

```typescript
import { Grid, DragHelper, Store } from '@bryntum/grid';

class TeamGrid extends Grid {
    static $name = 'TeamGrid';
    static type = 'teamgrid';

    static configurable = {
        features : {
            rowReorder : {
                showGrip           : true,
                // CRITICAL: Enable cross-grid dragging
                allowCrossGridDrag : true
            }
        },
        columns : [
            { text : 'Name', field : 'name', flex : 2 },
            { text : 'Age', field : 'age', width : 100 },
            {
                type   : 'color',
                text   : 'Color',
                field  : 'color',
                width  : 80,
                colors : ['Black', 'Orange', 'Blue', 'Green', 'Yellow', 'Purple']
            }
        ]
    };
}

TeamGrid.initClass();

// Create two grids that can share rows
const stockholmGrid = new TeamGrid({
    appendTo : 'main',
    title    : 'Stockholm Team',
    data     : stockholmTeamData
});

const miamiGrid = new TeamGrid({
    appendTo : 'main',
    title    : 'Miami Team',
    data     : miamiTeamData
});

// Rows can now be dragged between stockholmGrid and miamiGrid
```

---

## Master-Detail Pattern

### Nested Grid with Row Expander

```typescript
import { Grid, GridRowModel, Store, MessageDialog } from '@bryntum/grid';

// Define nested model hierarchy
class LineItem extends GridRowModel {
    static fields = [
        'product_name',
        'quantity',
        { name: 'price', type: 'number' }
    ];

    get lineTotal() {
        return this.price * this.quantity;
    }
}

class Order extends GridRowModel {
    static fields = [
        { name: 'order_date', type: 'date' },
        // Nested store field
        {
            name       : 'order_lines',
            type       : 'store',
            storeClass : Store,
            modelClass : LineItem
        }
    ];

    get orderTotal() {
        return this.order_lines?.sum('lineTotal') || 0;
    }

    get lineCount() {
        return this.order_lines.count;
    }
}

class Customer extends GridRowModel {
    static fields = [
        'name',
        'location',
        {
            name       : 'orders',
            type       : 'store',
            storeClass : Store,
            modelClass : Order
        }
    ];

    get total() {
        return this.orders?.sum('orderTotal') || 0;
    }
}

// Custom nested grid widgets
class LineItemGrid extends Grid {
    static type = 'lineitemgrid';

    static configurable = {
        autoHeight : true,
        store      : { modelClass : LineItem },

        columns : [
            { text : 'Product', field : 'product_name', flex : 3 },
            {
                type    : 'widget',
                text    : 'Quantity',
                field   : 'quantity',
                widgets : [
                    {
                        type     : 'button',
                        icon     : 'fa fa-minus',
                        onAction({ source }) {
                            const { record } = source.cellInfo;
                            if (record.quantity > 0) record.quantity--;
                        }
                    },
                    { name : 'quantity' },
                    {
                        type     : 'button',
                        icon     : 'fa fa-plus',
                        onAction({ source }) {
                            source.cellInfo.record.quantity++;
                        }
                    }
                ]
            },
            {
                type   : 'number',
                text   : 'Price',
                field  : 'price',
                format : { style : 'currency', currency : 'USD' }
            }
        ]
    };
}

LineItemGrid.initClass();

class OrderGrid extends Grid {
    static type = 'ordergrid';

    static configurable = {
        autoHeight : true,
        store      : { modelClass : Order },

        features : {
            rowExpander : {
                widget    : { type : 'lineitemgrid' },
                dataField : 'order_lines'
            }
        },

        columns : [
            { text : 'Order #', field : 'id', flex : 1 },
            { text : 'Items', field : 'lineCount', editor : false },
            { type : 'date', text : 'Date', field : 'order_date' },
            {
                type   : 'number',
                text   : 'Total',
                field  : 'orderTotal',
                editor : false,
                format : { style : 'currency', currency : 'USD' }
            }
        ]
    };
}

OrderGrid.initClass();

// Main grid
const grid = new Grid({
    appendTo : 'container',

    features : {
        rowExpander : {
            widget    : { type : 'ordergrid' },
            dataField : 'orders'
        }
    },

    columns : [
        { text : 'Customer', field : 'name', flex : 1 },
        { text : 'Location', field : 'location', flex : 1 },
        {
            type   : 'number',
            text   : 'Total',
            field  : 'total',
            format : { style : 'currency', currency : 'USD' }
        }
    ],

    store : {
        modelClass : Customer,
        readUrl    : 'data/customers.json',
        autoLoad   : true
    }
});
```

---

## Merge Cells Feature

### Grid Cell Merging

```typescript
import { Grid, DataGenerator } from '@bryntum/grid';

const grid = new Grid({
    appendTo : 'container',

    features : {
        mergeCells : {
            // Allow pointer events through merged cells
            passthrough : true,

            // Only merge in sorted columns (better performance)
            sortedOnly : false,

            // Custom merge logic
            shouldMerge({ column, record, previousRecord }) {
                // Only merge city cells with matching food
                if (column.field === 'city') {
                    return record.food === previousRecord.food;
                }
                // Default merge behavior
                return true;
            }
        },

        filterBar : { compactMode : true },
        rowReorder : true
    },

    store : {
        sorters : [
            { field : 'city' },
            { field : 'food' }
        ]
    },

    columns : [
        // Enable merging on this column
        { text : 'City', field : 'city', flex : 1, mergeCells : true },

        // Disable merge toggle in header menu
        { text : 'Chef', field : 'name', flex : 1, mergeable : false },

        // Merged with custom renderer
        {
            text       : 'Cooks',
            field      : 'food',
            flex       : 1,
            mergeCells : true,
            renderer({ value }) {
                return [
                    { tag : 'i', className : `fa ${foodIcons[value]}` },
                    value
                ];
            }
        }
    ],

    data : DataGenerator.generateData(50),

    tbar : [
        {
            type    : 'slidetoggle',
            text    : 'Merge cells',
            checked : true,
            onChange({ checked }) {
                grid.features.mergeCells.disabled = !checked;
            }
        }
    ]
});
```

---

## Gerelateerde Documenten

- [INTEGRATION-SHARED-PROJECT.md](./INTEGRATION-SHARED-PROJECT.md) - Shared ProjectModel patterns
- [INTEGRATION-DASHBOARD.md](./INTEGRATION-DASHBOARD.md) - Multi-widget dashboards
- [INTEGRATION-CALENDAR-TASKBOARD.md](./INTEGRATION-CALENDAR-TASKBOARD.md) - Calendar + TaskBoard patterns
- [INTEGRATION-EXPORT.md](./INTEGRATION-EXPORT.md) - PDF, Excel, MS Project export
- [INTEGRATION-REALTIME.md](./INTEGRATION-REALTIME.md) - WebSocket, STM, realtime sync
- [INTEGRATION-FRAMEWORKS.md](./INTEGRATION-FRAMEWORKS.md) - React, Vue, Angular integratie
- [INTEGRATION-PERFORMANCE.md](./INTEGRATION-PERFORMANCE.md) - Big datasets, lazy loading
- [IMPL-TIMELINE.md](./IMPL-TIMELINE.md) - TimeAxis en ViewPresets
- [DEEP-DIVE-SCHEDULING.md](./DEEP-DIVE-SCHEDULING.md) - Scheduling engine

---

*Bryntum Suite 7.1.0 - Gantt + SchedulerPro Integration*
