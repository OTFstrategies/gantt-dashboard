# Bryntum Examples - Comprehensive Patterns

> **Bron**: Officiële Bryntum Gantt v7.1.0 examples (92 examples)

---

## Example Categories

| Categorie | Aantal | Beschrijving |
|-----------|--------|--------------|
| **Core** | 15 | Basic, Advanced, Custom rendering |
| **Data** | 12 | Big data, Lazy loading, State |
| **Features** | 25 | Dependencies, Baselines, Critical paths |
| **Integration** | 18 | Frameworks, External libs, Export |
| **Scheduling** | 12 | Calendars, Constraints, Conflicts |
| **UI/UX** | 10 | Responsive, Themes, Accessibility |

---

## Part 1: Big Data & Performance

### Large Dataset Handling (bigdataset)

```javascript
import { Gantt, ProjectModel, AsyncHelper, ProjectGenerator } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',

    // Performance optimizations
    columns: [
        { type: 'name', width: 200 },
        { type: 'startdate' },
        { type: 'duration' }
    ],
    columnLines: false,  // Disable for better performance

    async generateDataset(count = 5000) {
        if (count > 1000) {
            gantt.mask('Generating tasks');
        }

        // Allow browser to update DOM before generation
        await AsyncHelper.sleep(100);

        const config = await ProjectGenerator.generateAsync(count, 50);

        await AsyncHelper.sleep(10);

        // Replace entire project (cleanest approach)
        gantt.project?.destroy();
        gantt.project = new ProjectModel({
            // Speed up record creation by not cloning data
            taskStore: { useRawData: true },
            dependencyStore: { useRawData: true },
            ...config
        });

        gantt.startDate = gantt.project.startDate;
        gantt.unmask();
    }
});
```

### Performance Tips

1. **useRawData**: Skip cloning data objects
2. **columnLines: false**: Reduce DOM elements
3. **AsyncHelper.sleep()**: Allow UI updates between heavy operations
4. **Destroy old project**: Clean memory before replacing

---

## Part 2: Infinite Scroll

```javascript
const gantt = new Gantt({
    appendTo: 'container',

    project: {
        loadUrl: 'data/tasks.json',
        validateResponse: true
    },

    // Enable infinite scroll
    infiniteScroll: true,

    // Buffer coefficient (higher = more preloaded content)
    // Touch devices need more buffer for smooth scrolling
    bufferCoef: globalThis.matchMedia('(any-pointer:coarse)').matches ? 10 : 5,

    // Initial visible date
    visibleDate: {
        date: new Date(2024, 0, 15),
        block: 'center'
    },

    viewPreset: {
        base: 'weekAndDay',
        tickSize: 60
    },

    // Custom task content
    taskRenderer({ taskRecord }) {
        if (taskRecord.isLeaf && !taskRecord.isMilestone) {
            return StringHelper.encodeHtml(taskRecord.name);
        }
    },

    listeners: {
        horizontalScroll() {
            // Sync UI with visible date
            this.widgetMap.scrollTo.value =
                this.timeAxis.floorDate(this.viewportCenterDate);
        }
    }
});
```

---

## Part 3: State Management

### Backend State Persistence

```javascript
import { StateProvider, Gantt, AjaxHelper } from '@bryntum/gantt';

// Custom state handler for backend persistence
class BackendState {
    constructor(stateProvider) {
        this.stateProvider = stateProvider;
    }

    async init() {
        // Load state from backend
        const response = await AjaxHelper.get('api/state');
        this.stateProvider.data = await response.json();

        // Listen for changes
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
                await AjaxHelper.post('api/state', { data });
            }
        } finally {
            this.saving = false;
        }
    }
}

// Gantt with state persistence
const gantt = new Gantt({
    appendTo: 'container',

    // State ID for automatic persistence
    stateId: 'mainGantt',

    // Fixed dates to prevent override from restored state
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 31),

    features: {
        filter: true
    },

    tbar: [
        {
            type: 'slidetoggle',
            label: 'Auto save',
            value: true,
            onChange({ checked }) {
                // Toggle state saving
                gantt.stateId = checked ? 'mainGantt' : null;
            }
        },
        {
            type: 'button',
            text: 'Reset state',
            onClick() {
                StateProvider.instance.clear('mainGantt');
                location.reload();
            }
        }
    ]
});
```

---

## Part 4: Custom Columns

### Complexity Column with Custom Combo Editor

```javascript
import { Column, ColumnStore, Combo } from '@bryntum/gantt';

// Custom combo for complexity selection
class ComplexityCombo extends Combo {
    static type = 'complexitycombo';

    static configurable = {
        items: [
            { value: 0, text: 'Easy' },
            { value: 1, text: 'Normal' },
            { value: 2, text: 'Hard' },
            { value: 3, text: 'Impossible' }
        ],
        picker: { minWidth: '8em' },
        listItemTpl: ({ text }) => `
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
            { reference: 'icon', tag: 'i', style: { marginInlineStart: '.8em' } },
            ...super.innerElements
        ];
    }
}

ComplexityCombo.initClass();

// Custom column using the combo
class ComplexityColumn extends Column {
    static $name = 'ComplexityColumn';
    static type = 'complexitycolumn';
    static isGanttColumn = true;

    static defaults = {
        field: 'complexity',
        text: 'Complexity',
        cellCls: 'b-complexity-column-cell',
        editor: { type: 'complexitycombo' }
    };

    renderer({ column, value }) {
        const complexity = column.editor.store.getById(value)?.text;
        return complexity ? [
            { tag: 'i', className: `fa fa-square ${complexity}` },
            complexity
        ] : '';
    }
}

ColumnStore.registerColumnType(ComplexityColumn);

// Usage
const gantt = new Gantt({
    columns: [
        { type: 'name', width: 200 },
        { type: 'complexitycolumn', width: 120 }
    ]
});
```

---

## Part 5: Custom Toolbar

```javascript
import { Toolbar } from '@bryntum/gantt';

class GanttToolbar extends Toolbar {
    static type = 'gantttoolbar';

    static configurable = {
        items: {
            // View toggle group
            views: {
                type: 'buttongroup',
                toggleGroup: true,
                rendition: 'padded',
                items: {
                    ganttButton: {
                        icon: 'fa fa-chart-gantt',
                        text: 'Gantt',
                        tooltip: 'Gantt view',
                        pressed: true,
                        toggleable: true
                    },
                    resourceButton: {
                        icon: 'fa fa-users',
                        text: 'Resources',
                        tooltip: 'Resource grid',
                        onAction: 'up.onResourceViewClick'
                    }
                }
            },

            // Action buttons
            addTask: {
                color: 'b-green',
                icon: 'fa fa-plus',
                text: 'Create',
                onAction: 'up.onAddTaskClick'
            },

            // Undo/Redo
            undoRedo: {
                type: 'undoredo',
                items: { transactionsCombo: null }
            },

            // Expand/Collapse
            toggleButtons: {
                type: 'buttonGroup',
                items: {
                    expandAll: {
                        icon: 'fa fa-angle-double-down',
                        tooltip: 'Expand all',
                        onAction: 'up.onExpandAllClick'
                    },
                    collapseAll: {
                        icon: 'fa fa-angle-double-up',
                        tooltip: 'Collapse all',
                        onAction: 'up.onCollapseAllClick'
                    }
                }
            },

            // Zoom controls
            zoomControls: {
                type: 'buttonGroup',
                items: {
                    zoomIn: {
                        icon: 'fa fa-search-plus',
                        onAction: 'up.onZoomIn'
                    },
                    zoomOut: {
                        icon: 'fa fa-search-minus',
                        onAction: 'up.onZoomOut'
                    },
                    zoomToFit: {
                        icon: 'fa fa-compress-arrows-alt',
                        onAction: 'up.onZoomToFit'
                    }
                }
            },

            // Spacer
            spacer: '->',

            // Filter
            filterField: {
                type: 'textfield',
                placeholder: 'Find tasks...',
                clearable: true,
                onChange: 'up.onFilterChange'
            }
        }
    };
}

GanttToolbar.initClass();
```

---

## Part 6: Real-time Updates

### WebSocket Integration Pattern

```javascript
class RealtimeGantt {
    constructor() {
        this.socket = new WebSocket('ws://localhost:8080');
        this.setupListeners();
    }

    setupListeners() {
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleServerUpdate(data);
        };

        // Listen for local changes
        this.gantt.project.on('dataChange', ({ store, action, records }) => {
            this.sendToServer({
                store: store.id,
                action,
                records: records.map(r => r.data)
            });
        });
    }

    handleServerUpdate(data) {
        // Suspend events to prevent echo
        this.gantt.project.suspendEvents();

        switch (data.action) {
            case 'add':
                this.gantt.project[data.store].add(data.records);
                break;
            case 'update':
                data.records.forEach(record => {
                    const existing = this.gantt.project[data.store].getById(record.id);
                    existing?.set(record);
                });
                break;
            case 'remove':
                const ids = data.records.map(r => r.id);
                this.gantt.project[data.store].remove(ids);
                break;
        }

        this.gantt.project.resumeEvents();
    }

    sendToServer(data) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
}
```

---

## Part 7: Export Patterns

### PDF Export

```javascript
const gantt = new Gantt({
    features: {
        pdfExport: {
            exportServer: 'https://your-export-server.com',
            // OR use client-side export
            clientURL: 'https://cdn.bryntum.com/pdf-export/'
        }
    },

    tbar: [
        {
            type: 'button',
            text: 'Export PDF',
            icon: 'fa fa-file-pdf',
            async onClick() {
                await gantt.features.pdfExport.export({
                    filename: 'project-schedule',
                    format: 'A4',
                    orientation: 'landscape',
                    exporterType: 'multipagevertical',
                    columns: gantt.columns.map(c => c.id),
                    repeatHeader: true
                });
            }
        }
    ]
});
```

### Excel Export

```javascript
const gantt = new Gantt({
    features: {
        excelExporter: true
    },

    tbar: [
        {
            type: 'button',
            text: 'Export Excel',
            icon: 'fa fa-file-excel',
            onClick() {
                gantt.features.excelExporter.export({
                    filename: 'project-data',
                    exporterConfig: {
                        columns: [
                            { text: 'Name', field: 'name' },
                            { text: 'Start', field: 'startDate', type: 'date' },
                            { text: 'End', field: 'endDate', type: 'date' },
                            { text: 'Duration', field: 'duration' },
                            { text: '% Done', field: 'percentDone' }
                        ]
                    }
                });
            }
        }
    ]
});
```

---

## Part 8: Multi-Gantt / Portfolio

```javascript
// Portfolio view with multiple projects
const portfolio = new Container({
    appendTo: 'container',
    layout: 'vbox',

    items: [
        {
            type: 'gantt',
            ref: 'project1Gantt',
            flex: 1,
            project: {
                loadUrl: 'data/project1.json'
            }
        },
        {
            type: 'splitter'
        },
        {
            type: 'gantt',
            ref: 'project2Gantt',
            flex: 1,
            project: {
                loadUrl: 'data/project2.json'
            }
        }
    ]
});

// Synchronized scrolling
const gantt1 = portfolio.widgetMap.project1Gantt;
const gantt2 = portfolio.widgetMap.project2Gantt;

gantt1.on('scroll', ({ scrollLeft }) => {
    gantt2.scrollable.x = scrollLeft;
});

gantt2.on('scroll', ({ scrollLeft }) => {
    gantt1.scrollable.x = scrollLeft;
});
```

---

## Part 9: Task Drag from External Grid

```javascript
import { Gantt, Grid, DragHelper } from '@bryntum/gantt';

const backlogGrid = new Grid({
    appendTo: 'backlog',
    columns: [
        { field: 'name', text: 'Task' },
        { field: 'duration', text: 'Duration' }
    ],
    data: [
        { id: 'b1', name: 'Backlog Item 1', duration: 3 },
        { id: 'b2', name: 'Backlog Item 2', duration: 5 }
    ]
});

const gantt = new Gantt({
    appendTo: 'gantt',
    // ... config
});

// Enable drag from backlog to Gantt
new DragHelper({
    cloneTarget: true,
    mode: 'translateXY',
    dropTargetSelector: '.b-gantt',
    targetSelector: '.b-grid-row',
    constrain: false,

    createProxy(element) {
        const proxy = element.cloneNode(true);
        proxy.style.width = '200px';
        return proxy;
    },

    listeners: {
        drop({ context }) {
            const
                { target } = context,
                record = backlogGrid.getRecordFromElement(context.grabbed),
                date = gantt.getDateFromCoordinate(context.newX);

            if (target?.closest('.b-timeline-subgrid')) {
                // Add task to project
                gantt.taskStore.add({
                    name: record.name,
                    duration: record.duration,
                    startDate: date
                });

                // Remove from backlog
                backlogGrid.store.remove(record);
            }
        }
    }
});
```

---

## Part 10: Critical Path Highlighting

```javascript
const gantt = new Gantt({
    features: {
        criticalPaths: {
            // Enable by default
            disabled: false
        }
    },

    tbar: [
        {
            type: 'slidetoggle',
            label: 'Show Critical Path',
            checked: true,
            onChange({ checked }) {
                gantt.features.criticalPaths.disabled = !checked;
            }
        }
    ],

    // Custom styling for critical tasks
    taskRenderer({ taskRecord, renderData }) {
        if (taskRecord.critical) {
            renderData.cls.add('critical-task');
        }
    }
});

// CSS
// .critical-task .b-gantt-task {
//     --b-primary: #e74c3c;
// }
```

---

## Quick Reference: Common Patterns

| Pattern | Key Config | Example |
|---------|------------|---------|
| **Performance** | `useRawData: true` | Big datasets |
| **Infinite scroll** | `infiniteScroll: true` | Long timelines |
| **State persistence** | `stateId: 'myGantt'` | Remember layout |
| **Custom columns** | `ColumnStore.registerColumnType()` | Extend columns |
| **Real-time** | `project.on('dataChange')` | WebSocket sync |
| **Export** | `features.pdfExport` | PDF/Excel |
| **Drag from external** | `DragHelper` | Backlog integration |
| **Critical path** | `features.criticalPaths` | Highlight delays |

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
*Extracted from: 92 official examples*
