# Third-Party Integration: JointJS PERT Charts

> **Enterprise integration guide** voor het combineren van Bryntum Gantt met JointJS: PERT chart visualisatie, bidirectionele synchronisatie, en dual-view project management.

---

## Overzicht

De JointJS integratie maakt het mogelijk om:
- **PERT Chart View** - Netwerkdiagrammen van project taken
- **Bidirectionele Sync** - Gantt en PERT chart gesynchroniseerd
- **Dependency Visualization** - Visuele taak-afhankelijkheden
- **Resource Assignments** - Assignee tags op PERT nodes

---

## 1. Architectuur

### 1.1 Dual-View Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Project Dashboard                             │
├────────────────────────────────┬────────────────────────────────────┤
│       Bryntum Gantt           │        JointJS PERT Chart          │
│  ┌───────────┬─────────────┐  │  ┌──────────────────────────────┐  │
│  │ WBS │Name │  Timeline   │  │  │    ┌───┐    ┌───┐    ┌───┐  │  │
│  ├─────┼─────┼─────────────┤  │  │    │ 1 │───►│ 2 │───►│ 3 │  │  │
│  │ 1   │TaskA│ ████        │◄─┼──│    └───┘    └───┘    └───┘  │  │
│  │ 2   │TaskB│     ███     │  │  │      │                ▲     │  │
│  │ 3   │TaskC│        ████ │  │  │      └───────────────►│     │  │
│  └─────┴─────┴─────────────┘  │  └──────────────────────────────┘  │
└────────────────────────────────┴────────────────────────────────────┘
                                 │
                    Splitter (resizable)
```

### 1.2 Data Flow

```
Bryntum Gantt Project
        │
        ├─────────────────┐
        ▼                 ▼
   GanttChart ◄───────► PertPanel
        │                 │
        │   Sync Events   │
        │ ◄─────────────► │
        │                 │
        ▼                 ▼
   TaskStore ◄───────► JointJS Graph
```

---

## 2. JointJS Setup

### 2.1 Dependencies

```html
<!-- JointJS+ Library (licensed) -->
<script src="vendor/joint-plus.js"></script>
<link rel="stylesheet" href="vendor/joint-plus.css">

<!-- Bryntum Gantt -->
<script type="module" src="app.module.js"></script>
```

### 2.2 JointJS Namespace Imports

```javascript
const {
    dia,
    shapes,
    mvc,
    util,
    ui,
    highlighters,
    layout,
    anchors,
    connectors
} = window.joint;

// Verify JointJS+ is loaded
if (!shapes?.standard) {
    throw new Error('JointJS+ is required');
}

const { Record, RecordView } = shapes.standard;
```

---

## 3. Theme Configuration

### 3.1 Visual Theme Constants

```javascript
const Theme = {
    // Colors
    backgroundColor: 'transparent',
    disabledTextColor: '#95a5a6',
    dependencyColor: '#2c3e50',

    // Task dimensions
    TASK_WIDTH: 240,
    TASK_PADDING: 10,
    TASK_HEADER_HEIGHT: 40,
    TASK_ROW_MARGIN: 2,
    TASK_FONT_SIZE: 14,
    TASK_BORDER_RADIUS: 6,

    // Status colors
    TASK_COLORS: {
        'in-progress': { primary: '#E6F4FD', secondary: '#579FD6' },
        'done': { primary: '#E8F9E6', secondary: '#6BC262' },
        'todo': { primary: '#F3F5F7', secondary: '#A7BECF' }
    },

    // Progress bar
    PROGRESS_ROW_HEIGHT: 30,
    PROGRESS_MARGIN: 8,
    PROGRESS_FONT_SIZE: 12,

    // Assignees
    ASSIGNEE_ICON_WIDTH: 12,
    ASSIGNEE_FONT_SIZE: 12,
    ASSIGNEE_GAP: 6,

    // Dependencies
    DEPENDENCY_COLOR: '#B0B0B0'
};
```

---

## 4. TaskElement Shape

### 4.1 Custom JointJS Element

```javascript
class TaskElement extends Record {
    preinitialize() {
        this.markup = util.svg`
            <path @selector="body" />
            <path @selector="nameRow" @group-selector="rows"/>
            <rect @selector="progressBarBackground" />
            <rect @selector="progressBar" />
            <path @selector="assigneeRow" @group-selector="rows"/>
            <text @selector="name" @group-selector="labels"/>
            <text @selector="assignee" @group-selector="labels"/>
            <text @selector="progress" @group-selector="labels"/>
        `;
    }

    defaults() {
        return {
            ...super.defaults,
            type: 'task',
            z: 2,
            size: { width: Theme.TASK_WIDTH },
            itemHeight: 30,
            itemIcon: { width: 16, height: 16, padding: Theme.TASK_PADDING },
            attrs: util.defaultsDeep({
                root: {
                    magnetSelector: 'body',
                    cursor: 'pointer'
                },
                body: {
                    d: this.createBodyPath(),
                    stroke: '#F2F2F2',
                    strokeWidth: 1,
                    filter: { name: 'dropShadow', args: { dx: 2, dy: 2, color: '#ccc' } }
                },
                nameRow: {
                    d: this.createHeaderPath()
                },
                progressBarBackground: {
                    x: Theme.PROGRESS_MARGIN,
                    y: `calc(h - ${Theme.PROGRESS_ROW_HEIGHT - Theme.PROGRESS_MARGIN})`,
                    rx: 6,
                    width: `calc(w - ${2 * Theme.PROGRESS_MARGIN + 40})`,
                    height: Theme.PROGRESS_ROW_HEIGHT - 2 * Theme.PROGRESS_MARGIN,
                    fill: '#EBF1F5'
                },
                progressBar: {
                    x: Theme.PROGRESS_MARGIN,
                    y: `calc(h - ${Theme.PROGRESS_ROW_HEIGHT - Theme.PROGRESS_MARGIN})`,
                    rx: 6,
                    height: Theme.PROGRESS_ROW_HEIGHT - 2 * Theme.PROGRESS_MARGIN
                },
                name: {
                    y: Theme.TASK_HEADER_HEIGHT / 2,
                    fontWeight: 'bold',
                    textWrap: { width: 'calc(w - 20)', maxLineCount: 2, ellipsis: true }
                },
                labels: {
                    x: 'calc(w / 2)',
                    fontSize: Theme.TASK_FONT_SIZE,
                    fontFamily: 'Arial, sans-serif',
                    textAnchor: 'middle',
                    textVerticalAnchor: 'middle'
                }
            }, super.defaults.attrs)
        };
    }

    createBodyPath() {
        const r = Theme.TASK_BORDER_RADIUS;
        return `M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 L calc(w - ${r}) 0 A ${r} ${r} 0 0 1 calc(w) ${r} L calc(w) calc(h - ${r}) A ${r} ${r} 0 0 1 calc(w - ${r}) calc(h) L ${r} calc(h) A ${r} ${r} 0 0 1 0 calc(h - ${r}) Z`;
    }

    createHeaderPath() {
        const r = Theme.TASK_BORDER_RADIUS;
        const h = Theme.TASK_HEADER_HEIGHT;
        return `M 0 ${h} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 L calc(w - ${r}) 0 A ${r} ${r} 0 0 1 calc(w) ${r} L calc(w) ${h} Z`;
    }

    // Factory method voor task data
    static fromData(data) {
        const {
            id, name = '', percentDone = 0, startDate, duration,
            assignees = [], color: userColor
        } = data;

        let color, secondaryColor;
        if (userColor) {
            secondaryColor = userColor;
            color = blendWithWhite(userColor, 0.3);
        } else {
            const state = percentDone === 100 ? 'done' :
                          percentDone === 0 ? 'todo' : 'in-progress';
            color = Theme.TASK_COLORS[state].primary;
            secondaryColor = Theme.TASK_COLORS[state].secondary;
        }

        return new TaskElement({
            id: `${id}`,
            assignees,
            color,
            secondaryColor,
            attrs: {
                name: { text: name },
                assignee: { text: assignees.length > 0 ? '' : 'No assignees' },
                progress: { text: `${percentDone.toFixed(0)}%` },
                progressBar: {
                    width: `calc(${percentDone/100} * w - ${percentDone/100 * 60})`,
                    fill: secondaryColor
                },
                nameRow: { fill: color }
            },
            items: [
                [{ id: 'task_id', label: `${id}`, icon: getIcon('id', secondaryColor) },
                 { id: 'start_date', label: formatDate(startDate), icon: getIcon('start', secondaryColor) }],
                [{ id: 'duration', label: `${duration} days`, icon: getIcon('duration', secondaryColor) },
                 { id: 'end_date', label: formatDate(getEndDate(startDate, duration)), icon: getIcon('end', secondaryColor) }]
            ]
        });
    }
}
```

---

## 5. DependencyLink Shape

### 5.1 Styled Link

```javascript
class DependencyLink extends shapes.standard.Link {
    defaults() {
        return {
            ...super.defaults,
            type: 'dependency',
            z: 1,
            attrs: util.defaultsDeep({
                line: {
                    stroke: Theme.DEPENDENCY_COLOR,
                    strokeWidth: 2,
                    targetMarker: {
                        type: 'path',
                        d: 'M 10 -5 -2 0 10 5'
                    }
                }
            }, super.defaults.attrs)
        };
    }
}
```

---

## 6. PertChart Class

### 6.1 Main Chart Component

```javascript
class PertChart extends mvc.View {
    preinitialize() {
        this.zoomSettings = { padding: 20, min: 0.2, max: 4, step: 0.05 };
        this.className = 'pert-chart';
    }

    initialize() {
        const cellNamespace = {
            ...shapes,
            task: TaskElement,
            taskView: RecordView,
            dependency: DependencyLink
        };

        const graph = new dia.SearchGraph({}, { cellNamespace });

        const paper = new dia.Paper({
            model: graph,
            cellViewNamespace: cellNamespace,
            drawGrid: true,
            gridSize: 10,
            overflow: true,
            interactive: false,
            async: true,
            autoFreeze: true,
            viewManagement: true,

            // Custom anchors en connectors
            defaultAnchor: this.createAnchor.bind(this),
            defaultConnector: this.createConnector.bind(this)
        });

        const scroller = new ui.PaperScroller({
            autoResizePaper: true,
            paper,
            borderless: true,
            cursor: 'grab',
            inertia: true,
            virtualRendering: true
        });

        scroller.lock();
        this.el.appendChild(scroller.render().el);

        this.paper = paper;
        this.scroller = scroller;
        this.graph = graph;

        this.setupEventListeners();
    }

    createAnchor(view, magnet, refPoint, options, endType, linkView) {
        return anchors.midSide.call(linkView, view, magnet, refPoint, {
            ...options,
            mode: 'horizontal',
            padding: endType === 'source' ? 25 : 30
        }, endType, linkView);
    }

    createConnector(sourcePoint, targetPoint, routePoints, opt, linkView) {
        const midPoints = [sourcePoint, ...routePoints];
        const sourceTip = sourcePoint.clone().move(linkView.sourceBBox.center(), -25);
        const targetTip = targetPoint.clone();

        if (linkView.model.getTargetCell()) {
            targetTip.move(linkView.targetBBox.center(), -25);
            midPoints.push(targetPoint);
        }

        return connectors.straight(sourceTip, targetTip, midPoints, {
            cornerType: 'cubic',
            cornerRadius: 10
        });
    }

    update(data = []) {
        this.resetCells(this.createCells(data));
        this.layoutCells();
        return this;
    }

    createCells(data) {
        const tasks = data.map(task => TaskElement.fromData(task));
        const dependencies = [];

        data.forEach(task => {
            task.dependencies.forEach(targetId => {
                dependencies.push(new DependencyLink({
                    source: { id: `${task.id}` },
                    target: { id: `${targetId}` }
                }));
            });
        });

        return [...tasks, ...dependencies];
    }

    layoutCells() {
        return layout.DirectedGraph.layout(this.graph, {
            rankDir: 'LR',           // Left to Right
            setLinkVertices: true,
            nodeSep: 60,
            rankSep: 100,
            edgeSep: 10
        });
    }

    resetCells(cells) {
        const currentCells = this.graph.getCells();
        const cellsMap = {};

        cells.forEach(cell => {
            cellsMap[cell.id] = cell;
            const existing = this.graph.getCell(cell.id);

            if (existing) {
                const { markup, ...attrs } = cell.attributes;
                existing.set(attrs);
            } else {
                this.graph.addCell(cell);
            }
        });

        // Remove cells no longer in data
        currentCells.forEach(cell => {
            if (!cellsMap[cell.id]) {
                cell.remove();
            }
        });
    }

    // Zoom controls
    zoom(step) {
        this.scroller.zoom(step, {
            min: this.zoomSettings.min,
            max: this.zoomSettings.max
        });
        return this.scroller.zoom();
    }

    zoomToFit() {
        this.scroller.zoomToFit({
            minScale: this.zoomSettings.min,
            maxScale: this.zoomSettings.max,
            padding: this.zoomSettings.padding,
            useModelGeometry: true
        });
    }

    // Selection
    selectNode(id) {
        highlighters.stroke.removeAll(this.paper, 'selection');

        if (!id) return;

        const taskView = this.paper.findViewByModel(id);
        if (!taskView) return;

        highlighters.stroke.add(taskView, 'body', 'selection', {
            layer: dia.Paper.Layers.BACK,
            padding: 10,
            attrs: {
                stroke: taskView.model.get('secondaryColor') || '#000',
                strokeWidth: 3
            }
        });

        if (!this.scroller.isElementVisible(taskView.model, { strict: true })) {
            this.scroller.scrollToElement(taskView.model, { animation: true });
        }
    }

    setupEventListeners() {
        // Pan with mouse drag
        this.paper.on('blank:pointerdown', evt => {
            this.scroller.startPanning(evt);
        });

        // Zoom with pinch
        this.paper.on('paper:pinch', (evt, ox, oy, scale) => {
            evt.preventDefault();
            this.scroller.zoom(scale - 1, {
                min: this.zoomSettings.min,
                max: this.zoomSettings.max,
                ox, oy
            });
        });
    }

    onRemove() {
        this.paper.remove();
        this.scroller.remove();
    }
}
```

---

## 7. PertPanel Wrapper

### 7.1 Bryntum Panel Integration

```javascript
import { Panel } from '@bryntum/gantt';

class PertPanel extends Panel {
    static type = 'pertpanel';
    static $name = 'PertPanel';

    static configurable = {
        monitorResize: true,
        textContent: false,
        zoomRatio: 0.4,

        tbar: [
            { type: 'widget', html: '<i class="fa fa-diagram-project"></i> PERT Chart', flex: 1 },
            { ref: 'autoFit', type: 'slidetoggle', text: 'Auto Fit', onChange: 'up.onAutoFitChange' },
            {
                type: 'buttongroup',
                items: [
                    { icon: 'fa fa-compress-arrows-alt', tooltip: 'Fit', onClick: 'up.zoomToFit' },
                    { icon: 'fa fa-search-plus', onClick: 'up.onZoomIn' },
                    { icon: 'fa fa-search-minus', onClick: 'up.onZoomOut' }
                ]
            },
            { type: 'button', icon: 'fa fa-map', tooltip: 'Navigator', onClick: 'up.toggleNavigator' }
        ]
    };

    construct(...args) {
        super.construct(...args);

        this.pertChart = new PertChart({
            target: this.contentElement
        });
    }

    // Data extraction from Gantt stores
    extractTasks(rawTasks, data) {
        return rawTasks.map(task => ({
            id: task.id,
            name: task.name,
            startDate: task.startDate,
            duration: task.duration,
            percentDone: task.percentDone,
            dependencies: data.dependencies[task.id] || [],
            assignees: (data.assignments[task.id] || [])
                .map(resId => data.resources[resId])
                .filter(Boolean)
        }));
    }

    update(resourceImagePath, data) {
        const tasks = this.extractTasks(data.tasks, {
            dependencies: this.extractDependencyMap(data.dependencies),
            resources: this.extractResourceMap(resourceImagePath, data.resources),
            assignments: this.extractAssignmentMap(data.assignments)
        });
        this.pertChart.update(tasks);
    }

    extractDependencyMap(deps) {
        return deps.reduce((map, dep) => {
            (map[dep.fromTask] ||= []).push(dep.toTask);
            return map;
        }, {});
    }

    extractResourceMap(imagePath, resources) {
        return resources.reduce((map, res) => {
            map[res.id] = {
                id: res.id,
                name: res.name,
                city: res.city,
                icon: `${imagePath}${res.image || 'none.png'}`
            };
            return map;
        }, {});
    }

    extractAssignmentMap(assignments) {
        return assignments.reduce((map, a) => {
            (map[a.event] ||= []).push(a.resource);
            return map;
        }, {});
    }

    // Zoom methods
    zoomToFit() { this.pertChart.zoomToFit(); }
    onZoomIn() { this.pertChart.zoom(this.zoomRatio); }
    onZoomOut() { this.pertChart.zoom(-this.zoomRatio); }

    selectNode(id) { this.pertChart.selectNode(id); }

    onClickNode(callback) {
        this.pertChart.paper.on('element:pointerclick', (view) => callback(view.model.id));
        this.pertChart.paper.on('blank:pointerclick', () => callback(null));
    }

    toggleNavigator() {
        if (this.pertChart.isNavigatorVisible()) {
            this.pertChart.hideNavigator();
        } else {
            this.pertChart.showNavigator();
        }
    }
}

PertPanel.initClass();
```

---

## 8. Gantt + PERT Synchronisatie

### 8.1 Complete Application

```javascript
import { Gantt, Splitter, StringHelper } from '@bryntum/gantt';

// Custom Gantt
class GanttChart extends Gantt {
    static type = 'ganttchart';

    static configurable = {
        rowHeight: 45,
        barMargin: 8,
        resourceImagePath: '../images/users/',

        tbar: {
            items: {
                title: { type: 'widget', html: '<i class="fa fa-chart-gantt"></i> Gantt View', flex: 1 },
                addTask: { type: 'button', text: 'Add Task', icon: 'fa-plus', color: 'b-green', onClick: 'up.onAddTask' }
            }
        },

        columns: [
            { type: 'name', width: 250 },
            { type: 'resourceassignment', width: 180, showAvatars: true }
        ],

        taskRenderer({ taskRecord }) {
            if (taskRecord.isLeaf && !taskRecord.isMilestone) {
                return StringHelper.encodeHtml(taskRecord.name);
            }
        }
    };

    async onAddTask() {
        const task = { id: Date.now(), name: 'New Task', duration: 1, startDate: this.project.startDate };
        this.project.appendChild(task);
        await this.project.commitAsync();
    }
}

GanttChart.initClass();

// Application setup
let currentFocus = null;

const gantt = new GanttChart({
    appendTo: 'container',
    project: {
        autoSetConstraints: true,
        autoLoad: true,
        loadUrl: 'data/data.json'
    }
});

new Splitter({ appendTo: 'container' });

const pertPanel = new PertPanel({
    appendTo: 'container',
    cls: 'demo-app'
});

// Sync: Update PERT when Gantt data changes
const updatePertPanel = () => {
    const { project, resourceImagePath } = gantt;
    pertPanel.update(resourceImagePath, {
        tasks: project.eventStore.toJSON(),
        dependencies: project.dependencyStore.toJSON(),
        resources: project.resourceStore.toJSON(),
        assignments: project.assignmentStore.toJSON()
    });
};

// PERT node click -> Gantt scroll
pertPanel.onClickNode(id => {
    if (id == null) {
        pertPanel.selectNode(currentFocus);
    } else {
        gantt.scrollTaskIntoView(gantt.taskStore.getById(id), { animate: true, highlight: true });
        currentFocus = id;
    }
});

// Gantt task click -> PERT highlight
gantt.on({
    taskClick: ({ row }) => pertPanel.selectNode(row.id),
    cellClick: ({ record }) => pertPanel.selectNode(record.id)
});

// Data sync events
gantt.project.on({
    load: () => {
        updatePertPanel();
        pertPanel.zoomToFit();
    },
    hasChanges: updatePertPanel
});
```

---

## 9. Styling

```css
.pert-chart {
    width: 100%;
    height: 100%;
    background: #fafafa;
}

.joint-paper {
    background: linear-gradient(90deg, #f5f5f5 1px, transparent 1px),
                linear-gradient(#f5f5f5 1px, transparent 1px);
    background-size: 10px 10px;
}

/* Task element styling via JointJS */
.joint-element .body {
    filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.2));
}

/* Navigator */
.joint-navigator {
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
}
```

---

## 10. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Updates | Batch Gantt changes, update PERT on commit |
| Layout | Use DirectedGraph for automatic positioning |
| Performance | Enable virtualRendering for large graphs |
| Selection | Sync selection state bidirectionally |
| Zoom | Provide zoom-to-fit after layout changes |

---

## Zie Ook

- [INTEGRATION-FRAMEWORKS.md](./INTEGRATION-FRAMEWORKS.md) - Framework integration
- [GANTT-DEEP-DIVE-CRITICAL-PATH.md](./GANTT-DEEP-DIVE-CRITICAL-PATH.md) - Critical path analysis
- [JointJS Documentation](https://www.jointjs.com/docs)

---

*Track C2.2 - Third-Party Integraties - JointJS*
