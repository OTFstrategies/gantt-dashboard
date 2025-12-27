# Integration Guide: Bryntum SchedulerPro + AG Grid

> **Implementatie guide** voor het combineren van AG Grid met Bryntum SchedulerPro: hybrid grids, drag & drop tussen systemen, en data synchronisatie.

---

## Overzicht

De AG Grid integratie maakt het mogelijk om:
- **Hybrid Layout** - AG Grid naast SchedulerPro in één UI
- **Cross-Library Drag** - Sleep taken van AG Grid naar Scheduler
- **Data Sync** - Automatische synchronisatie tussen stores
- **Theme Matching** - Consistente theming tussen beide libraries

---

## 1. AgGridPanel Wrapper

### 1.1 Bryntum Panel met AG Grid

```javascript
const agGrid = window.agGrid;

class AgGridPanel extends Panel {
    static type = 'aggridpanel';
    static $name = 'AgGridPanel';

    construct({ gridProps }) {
        const me = this;

        super.construct(...arguments);

        // Maak AG Grid instance in Panel content
        me.agGrid = agGrid.createGrid(me.contentElement, gridProps);

        // Theme sync met Bryntum
        GlobalEvents.on({
            theme: 'onThemeChange',
            thisObj: me
        });

        me.setThemeStyle();
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

---

## 2. AG Grid Configuration

### 2.1 Column Definitions

```javascript
const agGridPanel = new AgGridPanel({
    gridProps: {
        rowData: [],

        columnDefs: [
            {
                headerName: 'Unscheduled tasks',
                flex: 1,
                field: 'name',
                // Custom cell renderer met drag handle
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
                valueFormatter: ({ value }) => value?.toString() ?? '0 minutes'
            },
            {
                width: 120,
                field: 'preamble',
                valueFormatter: ({ value }) => value?.toString() ?? '0 minutes'
            },
            {
                width: 120,
                field: 'postamble',
                valueFormatter: ({ value }) => value?.toString() ?? '0 minutes'
            }
        ],

        // Row selection configuratie
        rowSelection: {
            mode: 'singleRow',
            enableClickSelection: true,
            checkboxes: false
        },

        suppressCellFocus: true,

        // Event handler voor selectie
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
    appendTo: 'content'
});

const unplannedGrid = agGridPanel.agGrid;
```

---

## 3. Cross-Library Drag & Drop

### 3.1 DragHelper voor AG Grid → Scheduler

```javascript
class Drag extends DragHelper {
    static configurable = {
        callOnFunctions: true,
        autoSizeClonedTarget: false,
        unifiedProxy: true,

        // Houd proxy na drop (Scheduler adopteert)
        removeProxyAfterDrop: false,

        // Clone row element
        cloneTarget: true,

        // Drop alleen op timeline
        dropTargetSelector: '.b-timeline-sub-grid',

        // Drag alleen AG Grid rows
        targetSelector: '.ag-row'
    };

    afterConstruct(config) {
        // Gebruik Scheduler's scroll manager
        this.scrollManager = this.schedule.scrollManager;
    }
}
```

### 3.2 Proxy Creation

```javascript
createProxy(grabbedElement) {
    const
        { context, schedule } = this,
        { timeAxisViewModel } = schedule,
        rowId = grabbedElement.getAttribute('row-id'),
        draggedTask = this.grid.getRowNode(rowId || ''),
        durationInPixels = timeAxisViewModel.getDistanceForDuration(
            draggedTask.data.durationMS
        ),
        preambleWidth = timeAxisViewModel.getDistanceForDuration(
            draggedTask.data.preamble.milliseconds
        ),
        postambleWidth = timeAxisViewModel.getDistanceForDuration(
            draggedTask.data.postamble.milliseconds
        ),
        proxy = document.createElement('div');

    proxy.classList.add('b-sch-horizontal', 'b-event-buffer');

    // Fake event bar met buffers
    proxy.innerHTML = StringHelper.xss`
        <div class="b-sch-event-wrap b-colorize b-color-gray b-style-bordered"
             style="width:${durationInPixels + preambleWidth + postambleWidth}px;
                    height:${schedule.rowHeight - 2 * schedule.resourceMargin}px">

            <div class="b-sch-event-buffer b-sch-event-buffer-before"
                 style="width: ${preambleWidth}px">
                <span class="b-buffer-label">${draggedTask.data.preamble.toString()}</span>
            </div>

            <div class="b-sch-event-buffer b-sch-event-buffer-after"
                 style="width: ${postambleWidth}px">
                <span class="b-buffer-label">${draggedTask.data.postamble.toString()}</span>
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

    // Store context info
    context.totalDuration = (
        draggedTask.data.durationMS +
        draggedTask.data.preamble.milliseconds +
        draggedTask.data.postamble.milliseconds
    ) / (1000 * 60 * 60);  // in hours

    context.task = draggedTask;

    return proxy;
}
```

### 3.3 Drag Events

```javascript
onDragStart({ context }) {
    const { schedule } = this;

    context.tasks = [context.task];

    // Enable edge scrolling
    schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

    // Disable tooltips tijdens drag
    schedule.features.eventTooltip.disabled = true;
}

onDrag({ context }) {
    const
        { schedule } = this,
        { task, totalDuration } = context,
        newStartDate = schedule.getDateFromCoordinate(context.newX, 'round'),
        endDate = newStartDate && DateHelper.add(
            newStartDate, totalDuration, task.data.durationUnit
        ),
        resourceRecord = context.target &&
            schedule.resolveResourceRecord(context.target),
        calendar = resourceRecord?.effectiveCalendar;

    // Valideer drop locatie
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
```

### 3.4 Drop Handler

```javascript
async onDrop({ context }) {
    const { schedule, grid } = this;

    if (context.valid) {
        const
            { task, element, resourceRecord } = context,
            coordinate = DomHelper.getTranslateX(element),
            bufferWidth = element.querySelector('.b-sch-event-buffer-before').offsetWidth,
            dropDate = schedule.getDateFromCoordinate(
                coordinate + bufferWidth, 'round', false
            );

        schedule.suspendAnimations();

        // Transfer naar Scheduler
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

    // Cleanup
    schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
    schedule.features.eventTooltip.disabled = false;
}
```

---

## 4. Data Synchronisatie

### 4.1 Unplanned Events Filter

```javascript
const formatUnplannedEvents = (eventStore, assignmentStore) => {
    if (!eventStore || !assignmentStore) return [];

    return eventStore.records.filter((event) => {
        // Check of event assignments heeft
        const hasAssignments = assignmentStore.records.some(
            (assignment) =>
                assignment.eventId === event.id ||
                assignment.event === event.id
        );
        return !hasAssignments;
    });
};
```

### 4.2 Store Change Listeners

```javascript
const updateTasks = () => {
    try {
        const formattedTasks = formatUnplannedEvents(
            schedule.project.eventStore,
            schedule.project.assignmentStore
        );
        unplannedGrid.setGridOption('rowData', formattedTasks);
    } catch {
        // Silently handle errors
    }
};

// Register listeners op beide stores
Object.entries({
    add: updateTasks,
    remove: updateTasks,
    update: updateTasks
}).forEach(([event, handler]) => {
    schedule.project.assignmentStore.on(event, handler);
    schedule.project.eventStore.on(event, handler);
});

// Initial load
schedule.project.on('load', updateTasks);
```

---

## 5. Layout Setup

### 5.1 Complete Layout

```javascript
// Main scheduler
const schedule = new Schedule({
    ref: 'schedule',
    insertFirst: 'main',
    startDate: new Date(2025, 11, 1, 8),
    endDate: new Date(2025, 11, 1, 20),
    minHeight: 0,
    flex: 5,
    collapsible: true,
    header: false,

    project: {
        autoLoad: true,
        eventStore: { modelClass: Task },
        loadUrl: 'data/data.json'
    },

    listeners: {
        // Toggle unplanned grid visibility
        unscheduledToggle({ value }) {
            agGridPanel.toggleCollapsed(!value);
        }
    }
});

// Vertical splitter
new Splitter({
    appendTo: 'content',
    showButtons: 'end',
    listeners: {
        splitterCollapseClick: () => {
            schedule.tbar.widgetMap.toggleUnscheduled.value = true;
        },
        splitterExpandClick: () => {
            schedule.tbar.widgetMap.toggleUnscheduled.value = false;
        }
    }
});

// AG Grid panel
const agGridPanel = new AgGridPanel({
    // ... config
    appendTo: 'content'
});

// Initialize drag helper
new Drag({
    grid: agGridPanel.agGrid,
    schedule,
    constrain: false,
    outerElement: document.querySelector('#content')
});
```

---

## 6. Task Model

### 6.1 Extended Event Model

```javascript
class Task extends EventModel {
    static get fields() {
        return [
            { name: 'address' },
            // Default duration: 1 uur
            { name: 'duration', defaultValue: 1 },
            { name: 'durationUnit', defaultValue: 'h' }
        ];
    }

    // Computed property voor kort adres
    get shortAddress() {
        return (this.address?.display_name || '').split(',')[0];
    }
}
```

---

## 7. Scheduler Configuration

### 7.1 Toolbar met Toggle

```javascript
tbar: [
    {
        text: 'Add task',
        icon: 'fa fa-plus',
        color: 'b-green',
        onClick: 'up.onNewEventClick'
    },
    '->',
    {
        type: 'datefield',
        ref: 'dateField',
        width: 190,
        editable: false,
        step: 1,
        onChange: 'up.onDateFieldChange'
    },
    {
        type: 'textfield',
        ref: 'filterByName',
        placeholder: 'Filter tasks',
        clearable: true,
        keyStrokeChangeDelay: 100,
        triggers: {
            filter: { align: 'start', cls: 'fa fa-filter' }
        },
        onChange: 'up.onFilterChange'
    },
    {
        type: 'slidetoggle',
        ref: 'toggleUnscheduled',
        label: 'Show unscheduled',
        value: true,
        height: 'auto',
        onChange: 'up.onToggleUnscheduled'
    }
]
```

### 7.2 Event Filtering

```javascript
onFilterChange({ value }) {
    value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    this.eventStore.filter({
        filters: event => new RegExp(value, 'i').test(event.name),
        replace: true
    });
}

onToggleUnscheduled({ value }) {
    this.trigger('unscheduledToggle', { value });
}
```

---

## 8. Event Buffer Feature

### 8.1 Configuration

```javascript
features: {
    eventBuffer: {
        // Buffer tijd als unavailable
        bufferIsUnavailableTime: true
    },

    taskEdit: {
        items: {
            generalTab: {
                items: {
                    resourcesField: { required: true },
                    addressField: {
                        type: 'addresssearchfield',
                        label: 'Address',
                        name: 'address',
                        weight: 100
                    },
                    preambleField: { label: 'Travel to' },
                    postambleField: { label: 'Travel from' }
                }
            }
        }
    }
}
```

---

## 9. Custom Event Renderer

### 9.1 Name + Location Display

```javascript
eventRenderer({ eventRecord }) {
    return [
        {
            tag: 'span',
            className: 'event-name',
            html: StringHelper.encodeHtml(eventRecord.name)
        },
        {
            tag: 'span',
            className: 'location',
            children: [
                eventRecord.shortAddress ? {
                    tag: 'i',
                    className: 'fa fa-map-marker-alt'
                } : null,
                eventRecord.shortAddress || '⠀'  // Empty braille space
            ]
        }
    ];
}
```

---

## 10. Styling

### 10.1 Drag Handle & Grid CSS

```css
/* AG Grid row styling */
.ag-row {
    cursor: grab;
}

.ag-row:active {
    cursor: grabbing;
}

/* Drag proxy */
.b-sch-horizontal.b-event-buffer {
    pointer-events: none;
    opacity: 0.9;
}

/* Event content */
.event-name {
    font-weight: 500;
}

.location {
    font-size: 0.9em;
    color: #666;
}

.location i {
    margin-right: 4px;
}
```

---

## 11. Map Integration

### 11.1 Row Selection → Map Tooltip

```javascript
// In AG Grid config
onSelectionChanged: ({ selectedNodes }) => {
    const eventRecord = selectedNodes[0]?.data;
    if (eventRecord) {
        mapPanel?.showTooltip(eventRecord, true);
    }
}

// In Scheduler config
listeners: {
    eventClick: ({ eventRecord }) => {
        if (eventRecord.marker) {
            mapPanel?.showTooltip(eventRecord, true);
        }
    }
}
```

---

## 12. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Theme Sync | Gebruik GlobalEvents.on('theme') voor consistentie |
| Drag Proxy | Toon realistische event weergave inclusief buffers |
| Data Sync | Luister naar beide stores (event + assignment) |
| Validation | Check overlap + working time bij drop |
| Performance | Suspend animations tijdens bulk operations |

---

## 13. Transaction Handling

### 13.1 AG Grid CRUD

```javascript
// Add
unplannedGrid.applyTransaction({ add: [newTask] });

// Update
unplannedGrid.applyTransaction({ update: [updatedTask] });

// Remove
unplannedGrid.applyTransaction({ remove: [taskToRemove] });

// Bulk set
unplannedGrid.setGridOption('rowData', allTasks);
```

---

## Zie Ook

- [MAPS-AG-GRID-COMBO.md](./MAPS-AG-GRID-COMBO.md) - Maps + AG Grid + Scheduler combo
- [IMPL-TRAVEL-TIME.md](./IMPL-TRAVEL-TIME.md) - Event buffer implementation
- [SCHEDULER-IMPL-DRAG-DROP.md](./SCHEDULER-IMPL-DRAG-DROP.md) - Drag & Drop fundamentals
- [SCHEDULER-IMPL-EVENTS.md](./SCHEDULER-IMPL-EVENTS.md) - Event handling

---

*Track C2.4 - Third-party Integraties - AG Grid*
