# Maps Integration: AG Grid + Bryntum SchedulerPro Combo

> **Enterprise integration guide** voor het combineren van AG Grid, Bryntum SchedulerPro en Mapbox: multi-library orchestratie, data synchronisatie, en unified drag-and-drop.

---

## Overzicht

De AG Grid + Maps combo combineert drie powerful libraries:
- **AG Grid** - Feature-rich data grid voor unplanned tasks
- **Bryntum SchedulerPro** - Timeline-based resource scheduling
- **Mapbox GL JS** - Interactive geographic visualization

### Use Case

```
┌──────────────────────────────────────────────────────────────────────┐
│  SchedulerPro (Timeline)              │           MapPanel           │
│  ┌──────────────────────────────────┐ │ ┌─────────────────────────┐  │
│  │ Resources │    Timeline Events   │ │ │                         │  │
│  ├───────────┼──────────────────────┤ │ │      Mapbox GL JS       │  │
│  │ Tech 1    │ ████░░░████          │◄┼►│        📍 📍 📍          │  │
│  │ Tech 2    │ ░░████░░░░           │ │ │                         │  │
│  └───────────┴──────────────────────┘ │ └─────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│  AG Grid (Unscheduled Tasks)                                         │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │ Name          │ Location          │ Duration │ Travel To/From   ││
│  │ Install AC    │ 123 Main St       │ 2h       │ 30m / 15m        ││
│  │ Repair Heater │ 456 Oak Ave       │ 1h       │ 20m / 20m        ││
│  └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

---

## 1. AG Grid Panel Wrapper

### 1.1 Bryntum-Compatible AG Grid Panel

```javascript
import { Panel, GlobalEvents, DomHelper, Toast } from '@bryntum/schedulerpro';

const agGrid = window.agGrid;

class AgGridPanel extends Panel {
    static type = 'aggridpanel';
    static $name = 'AgGridPanel';

    construct({ gridProps }) {
        super.construct(...arguments);

        // AG Grid initialisatie
        this.agGrid = agGrid.createGrid(this.contentElement, gridProps);

        // Theme synchronisatie
        GlobalEvents.on({
            theme: 'onThemeChange',
            thisObj: this
        });

        this.setThemeStyle();

        Toast.show({
            html: `
                <p>This demo uses <b>AG Grid Community Edition</b></p>
                <p>It is a separately licensed 3rd party library.</p>
            `,
            timeout: 10000
        });
    }

    setThemeStyle() {
        const colorScheme = DomHelper.isDarkTheme
            ? 'colorSchemeDark'
            : 'colorSchemeLight';

        this.agGrid.setGridOption(
            'theme',
            agGrid.themeQuartz.withPart(agGrid[colorScheme])
        );
    }

    onThemeChange() {
        this.setThemeStyle();
    }
}

AgGridPanel.initClass();
```

### 1.2 AG Grid Column Definitions

```javascript
const valueFormatter = ({ value }) => value?.toString() ?? '0 minutes';

const columnDefs = [
    {
        headerName: 'Unscheduled tasks',
        flex: 1,
        field: 'name',
        cellRenderer: ({ value }) => `
            <i style="margin-inline-end: 10px;" class="fa fa-grip"></i>
            ${StringHelper.encodeHtml(value) || ''}
        `
    },
    {
        headerName: 'Location',
        flex: 1,
        field: 'address.display_name',
        editable: false
    },
    {
        width: 120,
        field: 'fullDuration',
        valueFormatter
    },
    {
        width: 120,
        field: 'preamble',
        valueFormatter
    },
    {
        width: 120,
        field: 'postamble',
        valueFormatter
    }
];
```

---

## 2. Cross-Library Data Synchronisatie

### 2.1 Unplanned Events Filter

```javascript
// Sync functie: filter unassigned events
const formatUnplannedEvents = (eventStore, assignmentStore) => {
    if (!eventStore || !assignmentStore) return [];

    return eventStore.records.filter(event => {
        const hasAssignments = assignmentStore.records.some(
            assignment =>
                assignment.eventId === event.id ||
                assignment.event === event.id
        );
        return !hasAssignments;
    });
};

// Update AG Grid data
const updateTasks = () => {
    try {
        const formattedTasks = formatUnplannedEvents(
            schedule.project.eventStore,
            schedule.project.assignmentStore
        );
        unplannedGrid.setGridOption('rowData', formattedTasks);
    } catch (e) {
        console.error('Sync error:', e);
    }
};
```

### 2.2 Store Listeners

```javascript
// Registreer listeners op beide stores
Object.entries({
    add: updateTasks,
    remove: updateTasks,
    update: updateTasks
}).forEach(([event, handler]) => {
    schedule.project.assignmentStore.on(event, handler);
    schedule.project.eventStore.on(event, handler);
});

// Project load event
schedule.project.on('load', updateTasks);
```

---

## 3. AG Grid naar SchedulerPro Drag

### 3.1 Aangepaste DragHelper

```javascript
import { DragHelper, DomHelper, DateHelper, StringHelper } from '@bryntum/schedulerpro';

class AgGridDrag extends DragHelper {
    static configurable = {
        callOnFunctions: true,
        autoSizeClonedTarget: false,
        unifiedProxy: true,
        removeProxyAfterDrop: false,
        cloneTarget: true,
        dropTargetSelector: '.b-timeline-sub-grid',
        // AG Grid specific selector
        targetSelector: '.ag-row'
    };

    afterConstruct() {
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(grabbedElement) {
        const
            { context, schedule } = this,
            { timeAxisViewModel } = schedule,
            // AG Grid row ID ophalen
            rowId = grabbedElement.getAttribute('row-id'),
            draggedTask = this.grid.getRowNode(rowId || ''),
            durationInPixels = timeAxisViewModel.getDistanceForDuration(
                draggedTask.data.durationMS
            ),
            proxy = document.createElement('div'),
            preambleWidth = timeAxisViewModel.getDistanceForDuration(
                draggedTask.data.preamble?.milliseconds || 0
            ),
            postambleWidth = timeAxisViewModel.getDistanceForDuration(
                draggedTask.data.postamble?.milliseconds || 0
            );

        proxy.classList.add('b-sch-horizontal', 'b-event-buffer');

        proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event-wrap b-colorize b-color-gray b-style-bordered
                        b-unassigned-class b-sch-horizontal b-event-buffer
                        ${schedule.timeAxisSubGrid.width < durationInPixels ? 'b-exceeds-axis-width' : ''}"
                 style="width:${durationInPixels + preambleWidth + postambleWidth}px;
                        max-width:${schedule.timeAxisSubGrid.width}px;
                        height:${schedule.rowHeight - 2 * schedule.resourceMargin}px">
                <div class="b-sch-event-buffer b-sch-event-buffer-before"
                     style="width: ${preambleWidth}px;">
                    <span class="b-buffer-label">
                        ${draggedTask.data.preamble?.toString() || ''}
                    </span>
                </div>
                <div class="b-sch-event-buffer b-sch-event-buffer-after"
                     style="width: ${postambleWidth}px;">
                    <span class="b-buffer-label">
                        ${draggedTask.data.postamble?.toString() || ''}
                    </span>
                </div>
                <div class="b-sch-event b-has-content">
                    <div class="b-sch-event-content">
                        <span class="event-name">${draggedTask.data.name}</span>
                        <span class="location">
                            <i class="fa fa-map-marker-alt"></i>
                            ${draggedTask.data.shortAddress || ''}
                        </span>
                    </div>
                </div>
            </div>
        `;

        context.totalDuration = (
            draggedTask.data.durationMS +
            (draggedTask.data.preamble?.milliseconds || 0) +
            (draggedTask.data.postamble?.milliseconds || 0)
        ) / (1000 * 60 * 60);

        context.task = draggedTask;

        return proxy;
    }

    onDragStart({ context }) {
        const { schedule } = this;
        context.tasks = [context.task];

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ context }) {
        const
            { schedule } = this,
            { task, totalDuration } = context,
            newStartDate = schedule.getDateFromCoordinate(context.newX, 'round'),
            endDate = newStartDate && DateHelper.add(
                newStartDate,
                totalDuration,
                task.data.durationUnit
            ),
            resourceRecord = context.target && schedule.resolveResourceRecord(context.target),
            calendar = resourceRecord?.effectiveCalendar;

        context.valid = Boolean(
            resourceRecord &&
            newStartDate &&
            (schedule.allowOverlap || (
                schedule.isDateRangeAvailable(newStartDate, endDate, null, resourceRecord) &&
                (!calendar || calendar.isWorkingTime(newStartDate, endDate, true))
            ))
        );

        context.resourceRecord = resourceRecord;
    }

    async onDrop({ context }) {
        const { schedule, grid } = this;

        if (context.valid) {
            const
                { task, element, resourceRecord } = context,
                coordinate = DomHelper.getTranslateX(element),
                bufferEl = element.querySelector('.b-sch-event-buffer-before'),
                dropDate = schedule.getDateFromCoordinate(
                    coordinate + bufferEl.offsetWidth,
                    'round',
                    false
                );

            schedule.suspendAnimations();

            // Schedule in Bryntum
            await schedule.scheduleEvent({
                eventRecord: task.data,
                startDate: dropDate,
                resourceRecord,
                element
            });

            // Verwijder uit AG Grid
            const gridRowNode = grid.getRowNode(task.id.toString());

            if (gridRowNode?.data) {
                grid.applyTransaction({ remove: [gridRowNode.data] });
            }

            schedule.resumeAnimations();
        }

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = false;
    }
}
```

---

## 4. AG Grid Selection naar Map

### 4.1 Selection Handler

```javascript
const agGridPanel = new AgGridPanel({
    gridProps: {
        rowData: [],
        columnDefs,

        rowSelection: {
            mode: 'singleRow',
            enableClickSelection: true,
            checkboxes: false
        },

        suppressCellFocus: true,

        // Map synchronisatie bij selectie
        onSelectionChanged: ({ selectedNodes }) => {
            const eventRecord = selectedNodes[0]?.data;
            if (eventRecord) {
                mapPanel?.showTooltip(eventRecord, true);
            }
        }
    },

    collapsible: true,
    header: false,
    minHeight: 0,
    flex: '0 1 300px',
    appendTo: 'content',
    cls: 'no-demo-app-style'
});
```

---

## 5. Map Marker naar AG Grid Scroll

### 5.1 Marker Click Handler

```javascript
const mapPanel = new MapPanel({
    ref: 'map',
    appendTo: 'main',
    flex: 2,
    eventStore: schedule.eventStore,
    timeAxis: schedule.timeAxis,

    listeners: {
        async markerclick({ eventRecord }) {
            // Scheduled event -> scroll in SchedulerPro
            if (eventRecord.resources.length > 0) {
                await schedule.scrollEventIntoView(eventRecord, {
                    animate: true,
                    highlight: true
                });
                schedule.selectedEvents = [eventRecord];
            }
            // Unscheduled event -> focus in AG Grid
            else {
                await agGridPanel.expand();
                schedule.tbar.widgetMap.toggleUnscheduled.value = true;

                // AG Grid row selecteren
                const rowNode = unplannedGrid.getRowNode(eventRecord.id.toString());
                if (rowNode) {
                    rowNode.setSelected(true);
                    unplannedGrid.ensureNodeVisible(rowNode, {
                        position: 'middle'
                    });
                }
            }
        }
    }
});
```

---

## 6. Complete Application

### 6.1 Full Setup Code

```javascript
import { SchedulerPro, Panel, Splitter, EventModel, StringHelper } from '@bryntum/schedulerpro';

// Task Model
class Task extends EventModel {
    static get fields() {
        return [
            { name: 'address' },
            { name: 'duration', defaultValue: 1 },
            { name: 'durationUnit', defaultValue: 'h' }
        ];
    }

    get shortAddress() {
        return (this.address?.display_name || '').split(',')[0];
    }
}

// Schedule
const schedule = new Schedule({
    ref: 'schedule',
    insertFirst: 'main',
    startDate: new Date(2025, 0, 6, 8),
    endDate: new Date(2025, 0, 6, 20),
    flex: 5,

    project: {
        autoLoad: true,
        eventStore: { modelClass: Task },
        loadUrl: 'data/data.json'
    },

    listeners: {
        eventClick({ eventRecord }) {
            if (eventRecord.marker) {
                mapPanel?.showTooltip(eventRecord, true);
            }
        },

        unscheduledToggle({ value }) {
            agGridPanel.toggleCollapsed(!value);
        }
    }
});

// Splitter tussen Schedule en Map
new Splitter({
    appendTo: 'main',
    showButtons: true
});

// Splitter voor AG Grid
new Splitter({
    appendTo: 'content',
    showButtons: 'end',
    listeners: {
        splitterCollapseClick() {
            schedule.tbar.widgetMap.toggleUnscheduled.value = true;
        },
        splitterExpandClick() {
            schedule.tbar.widgetMap.toggleUnscheduled.value = false;
        }
    }
});

// AG Grid Panel
const agGridPanel = new AgGridPanel({
    gridProps: {
        rowData: [],
        columnDefs,
        rowSelection: {
            mode: 'singleRow',
            enableClickSelection: true,
            checkboxes: false
        },
        suppressCellFocus: true,
        onSelectionChanged: ({ selectedNodes }) => {
            const eventRecord = selectedNodes[0]?.data;
            if (eventRecord) {
                mapPanel?.showTooltip(eventRecord, true);
            }
        }
    },
    collapsible: true,
    header: false,
    minHeight: 0,
    flex: '0 1 300px',
    appendTo: 'content',
    cls: 'no-demo-app-style'
});

const unplannedGrid = agGridPanel.agGrid;

// Drag Handler
new AgGridDrag({
    grid: unplannedGrid,
    schedule,
    constrain: false,
    outerElement: document.querySelector('#content')
});

// Map Panel
const mapPanel = new MapPanel({
    ref: 'map',
    appendTo: 'main',
    flex: 2,
    eventStore: schedule.eventStore,
    timeAxis: schedule.timeAxis,
    listeners: {
        async markerclick({ eventRecord }) {
            if (eventRecord.resources.length > 0) {
                await schedule.scrollEventIntoView(eventRecord, {
                    animate: true,
                    highlight: true
                });
                schedule.selectedEvents = [eventRecord];
            } else {
                await agGridPanel.expand();
                schedule.tbar.widgetMap.toggleUnscheduled.value = true;
                const rowNode = unplannedGrid.getRowNode(eventRecord.id.toString());
                if (rowNode) {
                    rowNode.setSelected(true);
                    unplannedGrid.ensureNodeVisible(rowNode);
                }
            }
        }
    }
});

// Data sync setup
const updateTasks = () => {
    try {
        const formattedTasks = formatUnplannedEvents(
            schedule.project.eventStore,
            schedule.project.assignmentStore
        );
        unplannedGrid.setGridOption('rowData', formattedTasks);
    } catch (e) {}
};

['add', 'remove', 'update'].forEach(event => {
    schedule.project.assignmentStore.on(event, updateTasks);
    schedule.project.eventStore.on(event, updateTasks);
});

schedule.project.on('load', updateTasks);
```

---

## 7. Styling

### 7.1 CSS Layout

```css
#main {
    display: flex;
    flex-direction: row;
    height: 70%;
}

#content {
    display: flex;
    flex-direction: column;
    height: 30%;
}

.aggridpanel {
    min-height: 200px;
}

/* AG Grid row styling tijdens drag */
.ag-row-dragging {
    opacity: 0.5;
}

/* Marker hover states */
.mapboxgl-marker:hover {
    cursor: pointer;
    transform: scale(1.2);
}

/* Event buffer styling */
.b-sch-event-buffer .b-buffer-label {
    font-size: 11px;
    white-space: nowrap;
}
```

---

## 8. Performance Optimalisaties

| Aspect | AG Grid | SchedulerPro | Map |
|--------|---------|--------------|-----|
| Virtualisatie | Ingebouwd | Ingebouwd | N/A |
| Row buffering | rowBuffer: 10 | renderBuffer: 3 | - |
| Data updates | applyTransaction | Batch commits | Marker pooling |
| Rendering | DOM recycling | DomSync | WebGL |

### 8.1 Batch Updates

```javascript
// Efficiënte AG Grid updates
const batchRemoveFromAgGrid = (eventIds) => {
    const transaction = {
        remove: eventIds.map(id => {
            const node = unplannedGrid.getRowNode(id.toString());
            return node?.data;
        }).filter(Boolean)
    };

    unplannedGrid.applyTransaction(transaction);
};
```

---

## 9. Error Handling

### 9.1 Library Availability Checks

```javascript
// AG Grid check
if (typeof agGrid === 'undefined') {
    Toast.show({
        html: 'AG Grid is not loaded!',
        color: 'b-red',
        timeout: 0
    });
    return;
}

// Mapbox check
if (typeof mapboxgl === 'undefined') {
    console.warn('Mapbox GL JS not available - map features disabled');
}
```

---

## Zie Ook

- [MAPS-SCHEDULER-INTEGRATION.md](./MAPS-SCHEDULER-INTEGRATION.md) - Pure Bryntum version
- [INTEGRATION-AG-GRID.md](./INTEGRATION-AG-GRID.md) - AG Grid interoperability details
- [IMPL-TRAVEL-TIME.md](./IMPL-TRAVEL-TIME.md) - Travel time calculations
- [SCHEDULER-IMPL-DRAG-DROP.md](./SCHEDULER-IMPL-DRAG-DROP.md) - Drag & Drop internals

---

*Track C1.3 - Maps & Geografische integratie - AG Grid Combo*
