# Maps Integration: SchedulerPro Geographic Scheduling

> **Enterprise implementation guide** voor Bryntum SchedulerPro met Mapbox GL JS: real-time kaartweergave, resource locaties, bidirectionele synchronisatie, en interactieve marker management.

---

## Overzicht

De SchedulerPro Maps integratie biedt een complete field service scheduling oplossing:
- **Dual-View Interface** - Scheduler en kaart naast elkaar
- **Real-time Synchronisatie** - Events automatisch op kaart tonen
- **Unplanned Tasks Grid** - Drag-and-drop van taken naar scheduler
- **Address Search** - OpenStreetMap geocoding integratie
- **Theme-Aware** - Automatische dark/light mode switching

---

## 1. Architectuur

### 1.1 Component Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Schedule                         │ Splitter │      MapPanel        │
│  ┌─────────────────────────────┐  │    ║     │  ┌─────────────────┐ │
│  │ Resource    │ Timeline      │  │    ║     │  │                 │ │
│  │ Column      │               │  │    ║     │  │   Mapbox GL     │ │
│  ├─────────────┼───────────────┤  │    ║     │  │     Map         │ │
│  │ Technician 1│ ▓▓▓▓░░▓▓▓     │  │    ║     │  │                 │ │
│  │ Technician 2│ ░░▓▓▓▓▓░░░    │  │    ║     │  │    📍 📍 📍      │ │
│  └─────────────┴───────────────┘  │    ║     │  └─────────────────┘ │
├───────────────────────────────────┼────╨─────┼─────────────────────-┤
│  UnplannedGrid (AG Grid / Bryntum Grid)                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Task Name    │ Location           │ Duration │ Travel Time  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
Project Store (EventStore)
       │
       ├──────────────────┐
       ▼                  ▼
   Scheduler           MapPanel
       │                  │
       │    onStoreChange │
       │◄─────────────────┤
       │                  │
       ▼                  ▼
  Event Rendering    Marker Rendering
```

---

## 2. Core Data Models

### 2.1 Address Model

```javascript
import { Model } from '@bryntum/schedulerpro';

// OpenStreetMap Nominatim response model
class Address extends Model {
    static idField = 'place_id';

    static fields = [
        'display_name',
        'lat',
        'lon'
    ];
}
```

### 2.2 Task Model met Locatie

```javascript
import { EventModel } from '@bryntum/schedulerpro';

class Task extends EventModel {
    static get fields() {
        return [
            { name: 'address' },           // Address object
            { name: 'duration', defaultValue: 1 },
            { name: 'durationUnit', defaultValue: 'h' }
        ];
    }

    // Computed: verkorte adres voor display
    get shortAddress() {
        return (this.address?.display_name || '').split(',')[0];
    }
}
```

---

## 3. AddressSearchField Component

### 3.1 Remote Search Combo

```javascript
import { Combo } from '@bryntum/schedulerpro';

class AddressSearchField extends Combo {
    static type = 'addresssearchfield';
    static $name = 'AddressSearchField';

    static configurable = {
        clearWhenInputEmpty: true,
        clearable: true,
        displayField: 'display_name',
        valueField: null,           // Return hele Address record
        filterOnEnter: true,
        filterParamName: 'q',

        store: {
            modelClass: Address,
            readUrl: 'https://nominatim.openstreetmap.org/search',
            encodeFilterParams(filters) {
                return filters[0].value;
            },
            params: {
                format: 'json'
            },
            fetchOptions: {
                credentials: 'omit'
            }
        },

        pickerWidth: 450,
        validateFilter: false,
        listCls: 'address-results',

        // Custom dropdown item template
        listItemTpl: address => `
            <i class="fa fa-map-marker-alt"></i>
            <div class="address-container">
                <span class="address-name">${address.display_name}</span>
                <span class="lat-long">${address.lat}°, ${address.lon}°</span>
            </div>
        `
    };
}

AddressSearchField.initClass();
```

### 3.2 Styling

```css
.address-results .b-list-item {
    display: flex;
    align-items: flex-start;
    padding: 8px 12px;
}

.address-results .fa-map-marker-alt {
    margin-right: 10px;
    color: #e74c3c;
    margin-top: 4px;
}

.address-container {
    display: flex;
    flex-direction: column;
}

.address-name {
    font-weight: 500;
}

.lat-long {
    font-size: 0.85em;
    color: #7f8c8d;
}
```

---

## 4. MapPanel Widget

### 4.1 Complete Implementation

```javascript
import { Panel, GlobalEvents, DomHelper, StringHelper } from '@bryntum/schedulerpro';

/* global mapboxgl */

// NOTE: Gebruik je eigen Mapbox access token!
mapboxgl.accessToken = 'pk.xxx...';

class MapPanel extends Panel {
    static type = 'mappanel';
    static $name = 'MapPanel';

    static configurable = {
        monitorResize: true,
        zoom: 11,
        lat: 40.7128,
        lon: -74.0060,
        textContent: false,

        tbar: [
            {
                type: 'widget',
                cls: 'widget-title',
                html: 'Map View',
                flex: 1
            },
            {
                type: 'buttongroup',
                items: [
                    { icon: 'fa fa-plus', onClick: 'up.onZoomIn' },
                    { icon: 'fa fa-minus', onClick: 'up.onZoomOut' }
                ]
            }
        ]
    };

    onZoomIn() {
        this.map.zoomIn();
    }

    onZoomOut() {
        this.map.zoomOut();
    }

    composeBody() {
        const result = super.composeBody();

        // Delegate click events voor markers
        result.listeners = {
            click: 'onMapClick',
            delegate: '.mapboxgl-marker'
        };

        return result;
    }

    construct() {
        super.construct(...arguments);

        // WebGL check
        if (!this.detectWebGL()) {
            this.showError('WebGL is not supported!');
            return;
        }

        this.map = new mapboxgl.Map({
            container: this.contentElement,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [this.lon, this.lat],
            zoom: this.zoom
        });

        this.map.on('load', async () => {
            if (this.isDestroying) return;

            this.contentElement.classList.add('maploaded');

            // Wacht op project commit voor complete data
            await this.eventStore.project.commitAsync();

            // Initial markers renderen
            this.onStoreChange({
                action: 'dataset',
                records: this.eventStore.records
            });
        });

        // Store listeners
        this.eventStore.on('change', this.onStoreChange, this);
        this.timeAxis.on('reconfigure', this.onTimeAxisReconfigure, this);

        // Theme switching
        GlobalEvents.on({
            theme: 'onThemeChange',
            thisObj: this
        });

        this.setMapStyle();
    }

    detectWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return Boolean(canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    }

    setMapStyle() {
        const mapStyle = DomHelper.isDarkTheme ? 'dark-v10' : 'streets-v11';
        this.map.setStyle('mapbox://styles/mapbox/' + mapStyle);
    }

    // Store change handler - core synchronisatie logica
    async onStoreChange(event) {
        await this.eventStore.project.commitAsync();

        switch (event.action) {
            case 'add':
            case 'dataset':
                if (event.action === 'dataset') {
                    this.removeAllMarkers();
                }
                event.records.forEach(rec => this.addEventMarker(rec));
                break;

            case 'remove':
                event.records.forEach(rec => this.removeEventMarker(rec));
                break;

            case 'update': {
                const eventRecord = event.record;
                this.removeEventMarker(eventRecord);
                this.addEventMarker(eventRecord);
                break;
            }

            case 'filter': {
                const renderedMarkers = [];

                this.eventStore.query(rec => rec.marker, true).forEach(rec => {
                    if (!event.records.includes(rec)) {
                        this.removeEventMarker(rec);
                    } else {
                        renderedMarkers.push(rec);
                    }
                });

                event.records.forEach(rec => {
                    if (!renderedMarkers.includes(rec)) {
                        this.addEventMarker(rec);
                    }
                });
                break;
            }
        }
    }

    // TimeAxis change - update visible markers
    onTimeAxisReconfigure({ source: timeAxis }) {
        this.eventStore.forEach(rec => {
            this.removeEventMarker(rec);
            this.addEventMarker(rec);
        });
    }

    // Marker toevoegen
    addEventMarker(eventRecord) {
        if (!eventRecord.address) return;

        const { lat, lon } = eventRecord.address;

        // Alleen tonen als binnen zichtbare timeaxis
        if (lat && lon && (!eventRecord.isScheduled ||
            this.timeAxis.isTimeSpanInAxis(eventRecord))) {

            const color = eventRecord.eventColor ||
                          eventRecord.resource?.eventColor ||
                          'var(--b-neutral-90)';

            const marker = new mapboxgl.Marker({ color })
                .setLngLat([lon, lat]);

            marker.getElement().id = eventRecord.id;
            eventRecord.marker = marker;
            marker.eventRecord = eventRecord;
            marker.addTo(this.map);
        }
    }

    removeEventMarker(eventRecord) {
        const marker = eventRecord.marker;

        if (marker) {
            marker.popup?.remove();
            marker.popup = null;
            marker.remove();
        }
        eventRecord.marker = null;
    }

    removeAllMarkers() {
        this.eventStore.forEach(rec => this.removeEventMarker(rec));
    }

    scrollMarkerIntoView(eventRecord) {
        const marker = eventRecord.marker;
        this.map.easeTo({ center: marker.getLngLat() });
    }

    showTooltip(eventRecord, centerAtMarker) {
        const marker = eventRecord.marker;

        this.popup?.remove();

        if (centerAtMarker) {
            this.scrollMarkerIntoView(eventRecord);
        }

        const popup = this.popup = marker.popup = new mapboxgl.Popup({
            offset: [0, -21]
        });

        popup.setLngLat(marker.getLngLat());
        popup.setHTML(StringHelper.xss`
            <span class="event-name">${eventRecord.name}</span>
            <span class="resource">
                <i class="fa fa-fw fa-user"></i>
                ${eventRecord.resource?.name || 'Unassigned'}
            </span>
            <span class="location">
                <i class="fa fa-fw fa-map-marker-alt"></i>
                ${eventRecord.shortAddress}
            </span>
        `);
        popup.addTo(this.map);
    }

    onMapClick({ target }) {
        const markerEl = target.closest('.mapboxgl-marker');

        if (markerEl) {
            const eventRecord = this.eventStore.getById(markerEl.id);

            this.showTooltip(eventRecord);
            this.trigger('markerclick', {
                marker: eventRecord.marker,
                eventRecord
            });
        }
    }

    onResize() {
        this.map?.resize();
    }

    onThemeChange() {
        this.setMapStyle();
    }
}

MapPanel.initClass();
```

---

## 5. Schedule Component

### 5.1 Extended SchedulerPro

```javascript
import { SchedulerPro, DateHelper, StringHelper } from '@bryntum/schedulerpro';

class Schedule extends SchedulerPro {
    static type = 'schedule';
    static $name = 'Schedule';

    static configurable = {
        allowOverlap: false,

        viewPreset: {
            tickWidth: 20,
            displayDateFormat: 'LST',
            shiftIncrement: 1,
            shiftUnit: 'day',
            timeResolution: {
                unit: 'minute',
                increment: 30
            },
            headers: [{
                unit: 'hour',
                dateFormat: 'LST'
            }]
        },

        features: {
            stripe: true,
            eventBuffer: {
                bufferIsUnavailableTime: true
            },
            taskEdit: {
                items: {
                    generalTab: {
                        items: {
                            resourcesField: { required: true },
                            // Address search field
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
        },

        rowHeight: 80,
        barMargin: 4,
        eventStyle: 'traced',

        columns: [
            {
                type: 'resourceInfo',
                text: 'Name',
                width: 200,
                showEventCount: false,
                showRole: true
            }
        ],

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
                height: 'auto',
                onChange: 'up.onToggleUnscheduled'
            }
        ]
    };

    construct(...args) {
        super.construct(...args);
        this.widgetMap.dateField.value = this.startDate;
    }

    onFilterChange({ value }) {
        value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        this.eventStore.filter({
            filters: event => new RegExp(value, 'i').test(event.name),
            replace: true
        });
    }

    onDateFieldChange({ value, userAction }) {
        if (userAction) {
            this.setTimeSpan(
                DateHelper.add(value, 8, 'hour'),
                DateHelper.add(value, 20, 'hour')
            );
        }
    }

    onNewEventClick() {
        const newTask = new this.eventStore.modelClass({
            startDate: this.startDate
        });
        this.editEvent(newTask);
    }

    onToggleUnscheduled({ value }) {
        this.trigger('unscheduledToggle', { value });
    }

    // Custom event renderer met locatie
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
                    eventRecord.shortAddress || ' '
                ]
            }
        ];
    }
}

Schedule.initClass();
```

---

## 6. UnplannedGrid voor Ongeassigneerde Taken

### 6.1 Chained Store Pattern

```javascript
import { Grid } from '@bryntum/schedulerpro';

class UnplannedGrid extends Grid {
    static type = 'unplannedgrid';
    static $name = 'UnplannedGrid';

    static configurable = {
        cls: 'no-demo-app-style',
        rowHeight: 40,
        disableGridRowModelWarning: true,
        collapsible: true,
        header: false,
        minHeight: 0,

        selectionMode: { cell: false },

        features: {
            stripe: true,
            sort: 'name'
        },

        columns: [
            {
                text: 'Unscheduled tasks',
                flex: 1,
                field: 'name',
                cellCls: 'unscheduledNameCell',
                htmlEncode: false,
                tooltip: 'Drag and drop to schedule',
                renderer: ({ value }) =>
                    `<i class="fa fa-grip"></i>${StringHelper.encodeHtml(value) || ''}`
            },
            {
                text: 'Location',
                icon: 'fa fa-map-marker-alt',
                flex: 1,
                field: 'address.display_name',
                readOnly: true
            },
            {
                type: 'duration',
                icon: 'fa fa-clock',
                text: '',
                width: 120,
                align: 'center',
                field: 'fullDuration'
            },
            {
                type: 'duration',
                icon: 'fa fa-car-side',
                text: '<i class="fa fa-arrow-right"></i>',
                tooltip: 'Travel to site',
                width: 120,
                htmlEncodeHeaderText: false,
                align: 'center',
                field: 'preamble'
            },
            {
                type: 'duration',
                icon: 'fa fa-arrow-left',
                text: '<i class="fa fa-car-side"></i>',
                tooltip: 'Return trip',
                width: 120,
                htmlEncodeHeaderText: false,
                align: 'center',
                field: 'postamble'
            }
        ]
    };

    // Project setter - creëer chained store
    set project(project) {
        // Filter alleen events zonder assignments
        this.store = project.eventStore.chain(
            eventRecord => !eventRecord.assignments.length
        );

        // Update bij assignment changes
        project.assignmentStore.on({
            change: () => this.store.fillFromMaster(),
            thisObj: this
        });
    }
}

UnplannedGrid.initClass();
```

---

## 7. Drag & Drop Handler

### 7.1 DragHelper Implementation

```javascript
import { DragHelper, DomHelper, DateHelper, StringHelper } from '@bryntum/schedulerpro';

class Drag extends DragHelper {
    static configurable = {
        callOnFunctions: true,
        autoSizeClonedTarget: false,
        unifiedProxy: true,
        removeProxyAfterDrop: false,
        cloneTarget: true,
        dropTargetSelector: '.b-timeline-sub-grid',
        targetSelector: '.b-grid-row:not(.b-group-row)'
    };

    afterConstruct() {
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(grabbedElement) {
        const
            { context, schedule, grid } = this,
            { timeAxisViewModel } = schedule,
            draggedTask = grid.getRecordFromElement(grabbedElement),
            durationInPixels = timeAxisViewModel.getDistanceForDuration(draggedTask.durationMS),
            proxy = document.createElement('div'),
            preambleWidth = timeAxisViewModel.getDistanceForDuration(
                draggedTask.preamble?.milliseconds || 0
            ),
            postambleWidth = timeAxisViewModel.getDistanceForDuration(
                draggedTask.postamble?.milliseconds || 0
            );

        proxy.classList.add('b-sch-horizontal', 'b-event-buffer');

        proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event-wrap b-colorize b-color-gray b-style-bordered
                        b-unassigned-class b-sch-horizontal b-event-buffer
                        ${schedule.timeAxisSubGrid.width < durationInPixels ? 'b-exceeds-axis-width' : ''}"
                 role="presentation"
                 style="width:${durationInPixels + preambleWidth + postambleWidth}px;
                        max-width:${schedule.timeAxisSubGrid.width}px;
                        height:${schedule.rowHeight - 2 * schedule.resourceMargin}px">
                <div class="b-sch-event-buffer b-sch-event-buffer-before"
                     style="width: ${preambleWidth}px;">
                    <span class="b-buffer-label">${draggedTask.preamble?.toString() || ''}</span>
                </div>
                <div class="b-sch-event-buffer b-sch-event-buffer-after"
                     style="width: ${postambleWidth}px;">
                    <span class="b-buffer-label">${draggedTask.postamble?.toString() || ''}</span>
                </div>
                <div class="b-sch-event b-has-content b-sch-event-with-icon">
                    <div class="b-sch-event-content">
                        <span class="event-name">${draggedTask.name}</span>
                        <span class="location">
                            <i class="fa fa-map-marker-alt"></i>
                            ${draggedTask.shortAddress || ''}
                        </span>
                    </div>
                </div>
            </div>
        `;

        context.totalDuration = grid.selectedRecords.reduce(
            (total, task) => total + task.duration,
            0
        );

        return proxy;
    }

    onDragStart({ context }) {
        const { schedule, grid } = this;
        context.task = grid.getRecordFromElement(context.grabbed);

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
                task.durationUnit
            ),
            resourceRecord = context.target && schedule.resolveResourceRecord(context.target),
            calendar = resourceRecord?.effectiveCalendar;

        // Validatie
        context.valid = Boolean(
            resourceRecord &&
            newStartDate &&
            (schedule.allowOverlap || schedule.isDateRangeAvailable(
                newStartDate,
                endDate,
                null,
                resourceRecord
            )) &&
            (!calendar || calendar.isWorkingTime(newStartDate, endDate, true))
        );

        context.resourceRecord = resourceRecord;
    }

    async onDrop({ context }) {
        const { schedule } = this;

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

            await schedule.scheduleEvent({
                eventRecord: task,
                startDate: dropDate,
                resourceRecord,
                element
            });

            schedule.resumeAnimations();
        }

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = false;
    }
}
```

---

## 8. Complete Application Setup

### 8.1 Main Application

```javascript
import { Splitter } from '@bryntum/schedulerpro';

// Scheduler instance
const schedule = new Schedule({
    ref: 'schedule',
    insertFirst: 'main',
    startDate: new Date(2025, 0, 6, 8),
    endDate: new Date(2025, 0, 6, 20),
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
        eventClick({ eventRecord }) {
            if (eventRecord.marker) {
                mapPanel?.showTooltip(eventRecord, true);
            }
        },

        afterEventSave({ eventRecord }) {
            if (eventRecord.marker) {
                mapPanel?.scrollMarkerIntoView(eventRecord);
            }
        },

        unscheduledToggle({ value }) {
            unplannedGrid.toggleCollapsed(!value);
        }
    }
});

// Horizontal splitter
new Splitter({
    appendTo: 'main',
    showButtons: true
});

// Vertical splitter
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

// Unplanned grid
const unplannedGrid = new UnplannedGrid({
    ref: 'unplanned',
    flex: '0 1 400px',
    appendTo: 'content',
    project: schedule.project,
    collapsed: true,

    listeners: {
        cellClick({ record }) {
            if (record.marker) {
                mapPanel?.showTooltip(record, true);
            }
        }
    }
});

// Drag handler
const drag = new Drag({
    grid: unplannedGrid,
    schedule,
    constrain: false,
    outerElement: unplannedGrid.element
});

// Map Panel
const mapPanel = new MapPanel({
    ref: 'map',
    appendTo: 'main',
    flex: 2,
    minHeight: 0,
    collapsible: true,
    header: false,
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
                await unplannedGrid.expand();
                schedule.tbar.widgetMap.toggleUnscheduled.value = true;
                unplannedGrid.scrollRowIntoView(eventRecord, {
                    animate: true,
                    highlight: true
                });
            }
        }
    }
});
```

---

## 9. Data Format

### 9.1 JSON Structure

```json
{
    "success": true,
    "resources": {
        "rows": [
            {
                "id": 1,
                "name": "John Smith",
                "role": "Senior Technician",
                "image": "john.jpg",
                "eventColor": "#3498db"
            }
        ]
    },
    "events": {
        "rows": [
            {
                "id": 101,
                "name": "HVAC Maintenance",
                "startDate": "2025-01-06T09:00:00",
                "duration": 2,
                "durationUnit": "h",
                "address": {
                    "place_id": 12345,
                    "display_name": "123 Main Street, New York, NY",
                    "lat": "40.7128",
                    "lon": "-74.0060"
                },
                "preamble": "30 min",
                "postamble": "15 min"
            }
        ]
    },
    "assignments": {
        "rows": [
            { "id": 1, "event": 101, "resource": 1 }
        ]
    }
}
```

---

## 10. Performance Tips

| Aspect | Recommendation |
|--------|----------------|
| Markers | Gebruik marker clustering bij > 50 events |
| Store sync | Batch updates met `project.commitAsync()` |
| Map resize | Debounce met `monitorResize: true` |
| Filter | Filter server-side bij grote datasets |
| Proxy | Gebruik lightweight proxy bij drag |

---

## Zie Ook

- [MAPS-GANTT-INTEGRATION.md](./MAPS-GANTT-INTEGRATION.md) - Gantt + Maps
- [MAPS-AG-GRID-COMBO.md](./MAPS-AG-GRID-COMBO.md) - AG Grid variant
- [IMPL-TRAVEL-TIME.md](./IMPL-TRAVEL-TIME.md) - Travel time feature
- [SCHEDULER-IMPL-DRAG-DROP.md](./SCHEDULER-IMPL-DRAG-DROP.md) - Drag & Drop details

---

*Track C1.2 - Maps & Geografische integratie - SchedulerPro*
