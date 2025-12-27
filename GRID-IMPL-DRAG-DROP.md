# Grid Implementation: Drag & Drop

> **Cross-grid drag & drop**, row reordering, tree drag, en custom DragHelper voor Gantt integratie.

---

## Overzicht

Bryntum Grid biedt uitgebreide drag & drop functionaliteit:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DRAG & DROP PATTERNS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    DRAG    ┌─────────────────┐                        │
│  │ Stockholm Team  │ =========> │  Miami Team     │                        │
│  │ ┌─────────────┐ │            │ ┌─────────────┐ │                        │
│  │ │ John Doe    │─┼────────────┼>│ John Doe    │ │                        │
│  │ │ Jane Smith  │ │            │ │ Ethan Taylor│ │                        │
│  │ │ Bob Wilson  │ │            │ │ Mia Wilson  │ │                        │
│  │ └─────────────┘ │            │ └─────────────┘ │                        │
│  └─────────────────┘            └─────────────────┘                        │
│                                                                             │
│  ┌─────────────────┐    DRAG    ┌─────────────────────────────────────────┐│
│  │ Unplanned Tasks │ =========> │ GANTT                                   ││
│  │ ┌─────────────┐ │            │ ├── Planning         ████               ││
│  │ │ ○ New Task  │─┼────────────┼>├── New Task         ████████           ││
│  │ │ ○ Review    │ │            │ └── Testing          ████████████       ││
│  │ └─────────────┘ │            └─────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────┐    DRAG    ┌─────────────────────────────────────────┐│
│  │ Resources       │ =========> │ GANTT - Task Bar                        ││
│  │ ┌───┐           │            │ ┌──────────────────────────────┐        ││
│  │ │ 👤│ John  ────┼────────────┼>│ Development   ████ 👤 John   │        ││
│  │ └───┘           │            │ └──────────────────────────────┘        ││
│  └─────────────────┘            └─────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Row Reorder (Binnen Grid)

### 1.1 Basic Row Reordering

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        rowReorder: {
            showGrip: true  // Toon drag grip icon
        }
    },

    columns: [
        { text: 'Name', field: 'name', flex: 2 },
        { text: 'Age', field: 'age', width: 100 }
    ],

    data: [
        { id: 1, name: 'John Doe', age: 30 },
        { id: 2, name: 'Jane Smith', age: 25 },
        { id: 3, name: 'Bob Wilson', age: 35 }
    ]
});
```

---

## 2. Cross-Grid Drag & Drop

### 2.1 Custom Grid Class met Cross-Grid Support

```javascript
import { Grid } from '@bryntum/grid';

// Custom Grid class met cross-grid drag
class TeamGrid extends Grid {
    static $name = 'TeamGrid';
    static type = 'teamgrid';

    static configurable = {
        features: {
            rowReorder: {
                showGrip: true,
                allowCrossGridDrag: true  // Enable cross-grid dragging
            }
        },

        columns: [
            {
                text: 'Name',
                field: 'name',
                flex: 2,
                editor: {
                    type: 'textfield',
                    required: true
                }
            },
            {
                text: 'Age',
                field: 'age',
                width: 100,
                type: 'number'
            },
            {
                type: 'color',
                text: 'Color',
                field: 'color',
                width: 80,
                colors: [
                    'Black', 'Orange', 'Blue', 'Green', 'Yellow',
                    'Purple', 'Pink', 'Grey', 'Red', 'Brown'
                ],
                afterRenderCell({ cellElement, record }) {
                    cellElement.setAttribute(
                        'aria-label',
                        `${record.color || 'No'} color`
                    );
                }
            }
        ]
    };
}

// Register widget type
TeamGrid.initClass();
```

### 2.2 Multiple Grid Instances

```javascript
// Grid 1: Stockholm Team
const stockholmGrid = new TeamGrid({
    appendTo: 'main',
    title: 'Stockholm Team',
    data: [
        { id: 1, name: 'Don Taylor', age: 30, color: 'Black' },
        { id: 2, name: 'John Adams', age: 65, color: 'Orange' },
        { id: 3, name: 'John Doe', age: 40, color: 'Blue' },
        { id: 4, name: 'Maria Garcia', age: 28, color: 'Green' }
    ]
});

// Grid 2: Miami Team
const miamiGrid = new TeamGrid({
    appendTo: 'main',
    title: 'Miami Team',
    data: [
        { id: 14, name: 'Ethan Taylor', age: 29, color: 'Cyan' },
        { id: 15, name: 'Olivia Brown', age: 37, color: 'Red' },
        { id: 16, name: 'Mia Wilson', age: 26, color: 'Green' }
    ]
});

// Drag rows between Stockholm and Miami grids
```

---

## 3. Tree Grid Drag & Drop

### 3.1 Cross-Tree Drag met Nesting

```javascript
import { TreeGrid } from '@bryntum/grid';

class TeamTreeGrid extends TreeGrid {
    static $name = 'TeamTreeGrid';
    static type = 'teamtreegrid';

    static configurable = {
        features: {
            rowReorder: {
                showGrip: true,
                allowCrossGridDrag: true,
                dropOnLeaf: true  // Allow dropping on leaf nodes
            }
        },

        columns: [
            {
                type: 'tree',
                text: 'Name',
                field: 'name',
                flex: 2,
                leafIconCls: 'b-icon fa-user',
                editor: {
                    type: 'textfield',
                    required: true
                }
            },
            { text: 'Age', field: 'age', width: 100, type: 'number' },
            { type: 'color', text: 'Color', field: 'color', width: 80 }
        ]
    };

    construct() {
        super.construct(...arguments);

        // Track store changes for member count
        this.store.on({
            change: 'onStoreDataChanged',
            thisObj: this
        });

        this.onStoreDataChanged();
    }

    onStoreDataChanged() {
        const nbrMembers = this.store.leaves.length;
        this.title = `${this.initialConfig.title}
            <span class="b-count" data-btip="${nbrMembers} members">
                <i class="fa fa-user"></i>${nbrMembers}
            </span>`;
    }
}

TeamTreeGrid.initClass();
```

### 3.2 Tree Data Structure

```javascript
const stockholmTree = new TeamTreeGrid({
    appendTo: 'main',
    title: 'Stockholm Team',

    store: {
        data: [
            {
                id: 101,
                name: 'Sales',
                expanded: true,
                children: [
                    {
                        id: 1001,
                        name: 'Inbound sales',
                        expanded: true,
                        children: [
                            { id: 1, name: 'Don Taylor', age: 30, color: 'Black' },
                            { id: 2, name: 'John Adams', age: 65, color: 'Orange' }
                        ]
                    },
                    {
                        id: 1002,
                        name: 'Outbound sales',
                        expanded: true,
                        children: [
                            { id: 5, name: 'Li Wei', age: 35, color: 'Yellow' },
                            { id: 6, name: 'Sara Johnson', age: 32, color: 'Purple' }
                        ]
                    }
                ]
            },
            {
                id: 102,
                name: 'Marketing',
                expanded: true,
                children: [
                    { id: 8, name: 'Emma Wilson', age: 27, color: 'Pink' },
                    { id: 9, name: 'Ivan Petrov', age: 45, color: 'Gray' }
                ]
            }
        ]
    }
});
```

---

## 4. Drag from External Grid to Gantt

### 4.1 Custom DragHelper Class

```javascript
import { DragHelper, Grid, StringHelper, Container, ProjectModel } from '@bryntum/gantt';

class Drag extends DragHelper {
    static configurable = {
        // Clone the dragged element
        cloneTarget: true,

        // Only allow drops on gantt area
        dropTargetSelector: '.b-gantt .b-grid-sub-grid',

        // Only drag row elements (not group rows)
        targetSelector: '.b-grid-row:not(.b-group-row)',

        // Enable callback functions
        callOnFunctions: true,

        // Widget references
        gantt: null,
        grid: null,

        // Positioning mode
        positioning: 'absolute'
    };

    afterConstruct() {
        // Use gantt's scroll manager for edge scrolling
        this.scrollManager = this.gantt.scrollManager;
    }

    onDragStart() {
        const { grid, gantt } = this;

        // Stop any cell editing
        grid.features.cellEdit.finishEditing();

        // Enable edge scrolling
        gantt.enableScrollingCloseToEdges(gantt.subGrids.locked);

        // Disable tooltips during drag
        gantt.features.taskTooltip.disabled = true;
    }

    onDrag({ event, context }) {
        const { gantt } = this;
        const overRow = context.valid && context.target &&
                       gantt.getRowFromElement(context.target);

        // Clear previous highlight
        context.highlightRow?.removeCls('drag-target-before');

        if (!context.valid) return;

        if (overRow) {
            const verticalMiddle = overRow.getRectangle('normal').center.y;
            const dataIndex = overRow.dataIndex;

            // Determine insert position based on mouse Y
            const after = event.clientY > verticalMiddle;
            const overTask = gantt.taskStore.getAt(dataIndex);

            context.insertBefore = after
                ? gantt.taskStore.getAt(dataIndex + 1)
                : overTask;
            context.parent = (context.insertBefore || overTask).parent;

            // Highlight drop target
            if (context.insertBefore) {
                const highlightRow = gantt.rowManager.getRowFor(context.insertBefore);
                context.highlightRow = highlightRow;
                highlightRow.addCls('drag-target-before');
            }
        }
        else {
            context.parent = gantt.taskStore.rootNode;
        }
    }

    onDrop({ context }) {
        const { gantt, grid } = this;
        const { valid, highlightRow, parent, insertBefore, grabbed } = context;

        if (valid) {
            // Get task record from grid
            const unplannedTask = grid.getRecordFromElement(grabbed);

            // Remove from source grid
            grid.store.remove(unplannedTask);

            // Insert into Gantt task store
            parent.insertChild(unplannedTask, insertBefore);
        }

        // Cleanup
        gantt.disableScrollingCloseToEdges(gantt.timeAxisSubGrid);
        highlightRow?.removeCls('drag-target-before');
        gantt.features.taskTooltip.disabled = false;
    }
}
```

### 4.2 Unplanned Tasks Grid

```javascript
class UnplannedGrid extends Grid {
    static $name = 'UnplannedGrid';
    static type = 'unplannedgrid';

    static get configurable() {
        return {
            rowHeight: 50,
            cls: 'unplannedTasks',
            flex: 1,
            minWidth: 195,

            features: {
                stripe: true,
                sort: 'name'
            },

            columns: [
                {
                    text: 'Unscheduled tasks',
                    flex: 2,
                    minWidth: 195,
                    field: 'name',
                    htmlEncode: false,
                    renderer: ({ record }) => StringHelper.xss`
                        <i class="unplanned-icon ${record.iconCls}"></i>
                        ${record.name}
                    `
                },
                {
                    type: 'duration',
                    flex: 1,
                    align: 'right'
                }
            ]
        };
    }
}

UnplannedGrid.initClass();
```

### 4.3 Container Setup met Gantt en Grid

```javascript
const project = new ProjectModel({
    autoSetConstraints: true,
    autoLoad: true,
    loadUrl: '/api/project'
});

const container = new Container({
    appendTo: 'container',
    layout: 'hbox',
    flex: 1,
    cls: 'demo-app',

    items: {
        gantt: {
            type: 'gantt',
            project,
            flex: 4,
            dependencyIdField: 'sequenceNumber',
            subGridConfigs: {
                locked: { flex: 1 },
                normal: { flex: 2 }
            },
            columns: [
                { type: 'name', width: 250 },
                { type: 'startdate' },
                { type: 'duration' }
            ]
        },

        splitter: { type: 'splitter' },

        unplannedGrid: {
            type: 'unplannedgrid',
            store: {
                // Use same model as Gantt
                modelClass: project.taskStore.modelClass,
                readUrl: '/api/unplanned',
                autoLoad: true
            }
        }
    }
});

// Initialize drag helper
const { gantt, unplannedGrid } = container.widgetMap;

const drag = new Drag({
    grid: unplannedGrid,
    gantt,
    scrollManager: gantt.scrollManager,
    outerElement: unplannedGrid.element
});
```

---

## 5. Resource Drag to Gantt Tasks

### 5.1 Resource Drag Helper

```javascript
import { DragHelper, Toast, TreeGrid, AvatarRendering } from '@bryntum/gantt';

class ResourceDrag extends DragHelper {
    static get configurable() {
        return {
            callOnFunctions: true,

            // Clone the avatar element
            cloneTarget: true,
            autoSizeClonedTarget: false,

            // Stack all dragged elements
            unifiedProxy: true,

            // Allow drops on task bars or rows
            dropTargetSelector: '.b-gantt-task-wrap,.b-gantt .b-grid-row',

            // Drag from grid rows
            targetSelector: '.b-grid-row',

            // Use avatar as drag proxy
            proxySelector: '.b-resource-avatar',

            gantt: null,
            grid: null
        };
    }

    onDragStart({ context }) {
        const { grid, gantt } = this;
        const { grabbed } = context;

        // Save resource reference
        context.resourceRecord = grid.getRecordFromElement(grabbed);

        // Get related selected elements
        context.relatedElements = grid.selectedRecords
            .map(rec => rec !== context.resourceRecord &&
                 grid.rowManager.getRowFor(rec).element)
            .filter(el => el);

        // Enable edge scrolling
        gantt.enableScrollingCloseToEdges(gantt.timeAxisSubGrid);

        // Add visual feedback
        gantt.element.classList.add('b-dragging-resource');
    }

    onDrag({ context, event }) {
        // Resolve target task
        const targetTask = context.taskRecord =
            this.gantt.resolveTaskRecord(event.target);

        // Valid if task exists and resource not already assigned
        context.valid = Boolean(targetTask &&
            !targetTask.resources.includes(context.resourceRecord));
    }

    async onDrop({ context }) {
        const { gantt, grid } = this;
        const { taskRecord, resourceRecord } = context;

        if (context.valid) {
            // Animate to target cell
            const resourceCell = gantt.getCell({
                column: gantt.columns.get('assignments'),
                record: taskRecord
            });
            const avatarContainer = resourceCell?.querySelector(
                '.b-resource-avatar-container'
            );

            if (avatarContainer) {
                await this.animateProxyTo(avatarContainer, {
                    align: 'l0-r0'
                });
            }

            // Assign selected resources to task
            grid.selectedRecords.forEach(resource => {
                if (!taskRecord.resources.includes(resource)) {
                    taskRecord.assign(resource);
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
        this.scrollManager = gantt.scrollManager;
        this.outerElement = this.grid.element;
    }
}
```

### 5.2 Resource Grid met Avatars

```javascript
class ResourceGrid extends TreeGrid {
    static $name = 'ResourceGrid';
    static type = 'resourcegrid';

    static get configurable() {
        return {
            resourceImagePath: '/images/users/',

            selectionMode: {
                row: true,
                multiSelect: true  // Allow multi-select for bulk assign
            },

            columns: [
                {
                    type: 'tree',
                    text: 'Resources',
                    showEventCount: false,
                    field: 'name',
                    flex: 1,
                    renderer: ({ record, grid, value }) => ({
                        class: 'b-resource-info',
                        children: [
                            grid.avatarRendering.getResourceAvatar({
                                initials: record.initials,
                                color: record.eventColor,
                                iconCls: record.iconCls,
                                imageUrl: record.image
                                    ? `${grid.resourceImagePath}${record.image}`
                                    : null
                            }),
                            value
                        ]
                    })
                }
            ]
        };
    }

    afterConstruct() {
        this.avatarRendering = new AvatarRendering({
            element: this.element
        });
    }
}

ResourceGrid.initClass();
```

### 5.3 Complete Container Setup

```javascript
const project = new ProjectModel({
    autoSetConstraints: true,
    resourceStore: {
        tree: true  // Hierarchical resources
    },
    loadUrl: '/api/project'
});

const container = new Container({
    appendTo: 'container',
    layout: 'hbox',
    flex: 1,

    items: {
        gantt: {
            type: 'gantt',
            project,
            flex: 1,
            resourceImagePath: '/images/users/',

            features: {
                taskTooltip: false
            },

            columns: [
                { type: 'name', minWidth: 200 },
                {
                    type: 'resourceassignment',
                    width: 200,
                    showAvatars: true,
                    enableResourceDragging: true,

                    // Tooltip with assignment controls
                    avatarTooltip: {
                        allowOver: true,
                        autoUpdateFields: true,
                        items: {
                            name: { name: 'name' },
                            units: { name: 'units' },
                            label: { html: ' % assigned ' },
                            minusButton: {
                                type: 'button',
                                icon: 'fa-minus-circle',
                                onClick: 'up.onMinusClick'
                            },
                            plusButton: {
                                type: 'button',
                                icon: 'fa-plus-circle',
                                onClick: 'up.onPlusClick'
                            },
                            unassignButton: {
                                type: 'button',
                                icon: 'fa-trash',
                                tooltip: 'Unassign',
                                onClick: 'up.onUnassignClick'
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

                    avatarTooltipTemplate: ({ assignmentRecord, resourceRecord, tooltip }) => {
                        tooltip.record = assignmentRecord;
                        tooltip.widgetMap.name.html = resourceRecord.name + ' is&nbsp;';
                    }
                },
                { type: 'startdate' },
                { type: 'duration' }
            ]
        },

        splitter: {
            type: 'splitter',
            showButtons: 'end'
        },

        resourceGrid: {
            type: 'resourcegrid',
            collapsible: true,
            header: false,
            width: 270,
            store: project.resourceStore
        }
    }
});

project.load();

// Initialize resource drag
const drag = new ResourceDrag({
    grid: container.widgetMap.resourceGrid,
    gantt: container.widgetMap.gantt,
    constrain: false
});
```

---

## 6. Styling

```css
/* Drop target highlight */
.b-grid-row.drag-target-before::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #2196F3;
    z-index: 10;
}

/* Dragging state */
.b-dragging-resource .b-gantt-task-wrap:hover {
    outline: 2px solid #4CAF50;
    outline-offset: 2px;
}

/* Unplanned tasks grid */
.unplannedTasks {
    background: #fafafa;
    border-left: 1px solid #ddd;
}

.unplannedTasks .unplanned-icon {
    margin-right: 8px;
    color: #666;
}

/* Drag proxy styling */
.b-drag-proxy {
    opacity: 0.9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Resource avatar container */
.b-resource-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.b-resource-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
}

/* Row reorder grip */
.b-row-reorder-handle {
    cursor: grab;
    color: #999;
}

.b-row-reorder-handle:hover {
    color: #333;
}

/* Cross-grid drag visual */
.b-grid-row.b-dragging {
    opacity: 0.5;
}

.b-grid-row.b-drag-over {
    background: rgba(33, 150, 243, 0.1);
}
```

---

## 7. React Integration

```jsx
import { BryntumGantt, BryntumGrid, BryntumSplitter } from '@bryntum/gantt-react';
import { useRef, useEffect } from 'react';

function GanttWithDragDrop({ projectData, unplannedTasks }) {
    const ganttRef = useRef(null);
    const gridRef = useRef(null);
    const dragRef = useRef(null);

    useEffect(() => {
        // Initialize drag helper when components are ready
        if (ganttRef.current?.instance && gridRef.current?.instance) {
            dragRef.current = new Drag({
                grid: gridRef.current.instance,
                gantt: ganttRef.current.instance,
                scrollManager: ganttRef.current.instance.scrollManager,
                outerElement: gridRef.current.instance.element
            });
        }

        return () => {
            dragRef.current?.destroy();
        };
    }, []);

    return (
        <div className="gantt-drag-wrapper">
            <BryntumGantt
                ref={ganttRef}
                project={projectData}
                columns={[
                    { type: 'name', width: 250 },
                    { type: 'startdate' },
                    { type: 'duration' }
                ]}
            />

            <BryntumSplitter />

            <BryntumGrid
                ref={gridRef}
                data={unplannedTasks}
                features={{
                    stripe: true,
                    sort: 'name'
                }}
                columns={[
                    { text: 'Unscheduled', field: 'name', flex: 2 },
                    { type: 'duration', flex: 1 }
                ]}
            />
        </div>
    );
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Drag werkt niet tussen grids | allowCrossGridDrag: false | Enable in rowReorder feature |
| Drop op leaf nodes faalt | dropOnLeaf: false | Enable dropOnLeaf voor trees |
| Scroll stopt tijdens drag | scrollManager niet geconfigureerd | Koppel gantt.scrollManager |
| Tooltip verschijnt tijdens drag | Feature niet disabled | Disable tooltip in onDragStart |
| Clone element styling fout | autoSizeClonedTarget issue | Zet autoSizeClonedTarget: false |
| Multi-select drag werkt niet | relatedElements niet gevuld | Track selectedRecords in context |
| Drop indicator niet zichtbaar | CSS niet geladen | Voeg highlight CSS toe |

---

## API Reference

### RowReorder Feature

| Property | Type | Description |
|----------|------|-------------|
| `showGrip` | Boolean | Toon drag handle icon |
| `allowCrossGridDrag` | Boolean | Enable cross-grid dragging |
| `dropOnLeaf` | Boolean | Allow drop on leaf nodes (tree) |

### DragHelper Class

| Property | Type | Description |
|----------|------|-------------|
| `cloneTarget` | Boolean | Clone element vs move |
| `dropTargetSelector` | String | CSS selector voor drop targets |
| `targetSelector` | String | CSS selector voor drag sources |
| `proxySelector` | String | Selector voor drag proxy |
| `unifiedProxy` | Boolean | Stack multi-select into one proxy |
| `scrollManager` | ScrollManager | For edge scrolling |

### DragHelper Callbacks

| Method | Description |
|--------|-------------|
| `onDragStart({ context })` | Called when drag starts |
| `onDrag({ event, context })` | Called during drag |
| `onDrop({ context })` | Called on drop |
| `animateProxyTo(element, config)` | Animate proxy to target |

---

## Bronnen

- **Grid Examples**: `examples/drag-between-grids/`
- **Tree Examples**: `examples/drag-between-trees/`
- **Gantt Task Drag**: `examples/drag-from-grid/`
- **Resource Drag**: `examples/drag-resources-from-grid/`
- **DragHelper**: `Core.helper.DragHelper`
- **RowReorder Feature**: `Grid.feature.RowReorder`

---

*Priority 1: Missing Core Functionality*
