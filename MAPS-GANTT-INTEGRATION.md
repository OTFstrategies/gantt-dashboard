# Maps Integration: Gantt Geographic Project Planning

> **Enterprise integration guide** voor het combineren van Bryntum Gantt met kaartvisualisatie: geografische project context, locatie-aware planning, en interactieve map markers.

---

## Overzicht

Geografische project planning combineert Gantt-functionaliteit met kaartweergaven:
- **Project Location Context** - Visualiseer waar projecttaken plaatsvinden
- **Resource Locations** - Toon resource bases en werklocaties
- **Milestone Mapping** - Plaats milestones op geografische posities
- **Travel Time Integration** - Bereken reistijden tussen locaties

> **Architectuur Noot:** Bryntum Gantt heeft geen ingebouwde maps-integratie, maar kan worden gecombineerd met elke mapping library (Mapbox, Leaflet, Google Maps, OpenLayers).

---

## 1. Architectuur Concepten

### 1.1 Data Model Extension

```javascript
// Extend TaskModel met locatie velden
class GeoTask extends TaskModel {
    static get fields() {
        return [
            { name: 'location', type: 'object' },  // { lat, lon, name }
            { name: 'address', type: 'string' },
            { name: 'siteCode', type: 'string' },
            { name: 'region', type: 'string' }
        ];
    }

    // Computed property voor kaart-integratie
    get coordinates() {
        return this.location ? [this.location.lon, this.location.lat] : null;
    }

    get hasLocation() {
        return this.location?.lat && this.location?.lon;
    }
}
```

### 1.2 Dual-View Layout Pattern

```javascript
import { Gantt, Panel, Splitter } from '@bryntum/gantt';

// Container layout met Gantt + Map
const container = new Panel({
    layout: 'hbox',
    items: [
        {
            type: 'gantt',
            ref: 'gantt',
            flex: 3,
            // Gantt configuratie
        },
        {
            type: 'splitter'
        },
        {
            type: 'widget',
            ref: 'mapPanel',
            flex: 2,
            html: '<div id="map-container"></div>'
        }
    ]
});
```

---

## 2. Mapbox GL JS Integratie

### 2.1 MapPanel Widget

```javascript
import { Panel, GlobalEvents, DomHelper } from '@bryntum/gantt';

// Custom MapPanel voor Gantt integratie
class MapPanel extends Panel {
    static type = 'mappanel';

    static configurable = {
        monitorResize: true,
        zoom: 10,
        lat: 52.3676,      // Amsterdam default
        lon: 4.9041,
        textContent: false,

        tbar: [
            {
                type: 'widget',
                html: 'Project Locations',
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

    construct() {
        super.construct(...arguments);

        // Mapbox GL initialisatie
        mapboxgl.accessToken = 'YOUR_ACCESS_TOKEN';

        this.map = new mapboxgl.Map({
            container: this.contentElement,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [this.lon, this.lat],
            zoom: this.zoom
        });

        // Theme-aware styling
        GlobalEvents.on({
            theme: 'onThemeChange',
            thisObj: this
        });

        this.setMapStyle();
    }

    setMapStyle() {
        const style = DomHelper.isDarkTheme ? 'dark-v10' : 'streets-v11';
        this.map.setStyle(`mapbox://styles/mapbox/${style}`);
    }

    onThemeChange() {
        this.setMapStyle();
    }

    onZoomIn() {
        this.map.zoomIn();
    }

    onZoomOut() {
        this.map.zoomOut();
    }

    onResize() {
        this.map?.resize();
    }
}

MapPanel.initClass();
```

### 2.2 Task Markers Synchronisatie

```javascript
class GanttMapSync {
    constructor(gantt, mapPanel) {
        this.gantt = gantt;
        this.mapPanel = mapPanel;
        this.markers = new Map();

        this.setupListeners();
    }

    setupListeners() {
        const { taskStore } = this.gantt.project;

        taskStore.on({
            add: this.onTasksAdd,
            remove: this.onTasksRemove,
            update: this.onTaskUpdate,
            thisObj: this
        });

        // Initial render na project load
        this.gantt.project.on('load', () => {
            this.syncAllMarkers();
        });
    }

    syncAllMarkers() {
        this.clearAllMarkers();

        this.gantt.project.taskStore.forEach(task => {
            if (task.hasLocation) {
                this.addMarker(task);
            }
        });

        this.fitBounds();
    }

    addMarker(task) {
        const { coordinates } = task;
        if (!coordinates) return;

        const el = document.createElement('div');
        el.className = 'gantt-task-marker';
        el.style.backgroundColor = task.eventColor || '#4a90d9';
        el.dataset.taskId = task.id;

        const marker = new mapboxgl.Marker(el)
            .setLngLat(coordinates)
            .setPopup(this.createPopup(task))
            .addTo(this.mapPanel.map);

        // Click handler voor marker -> gantt selectie
        el.addEventListener('click', () => {
            this.gantt.scrollTaskIntoView(task, {
                animate: true,
                highlight: true
            });
            this.gantt.selectedRecord = task;
        });

        this.markers.set(task.id, marker);
    }

    createPopup(task) {
        return new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
                <strong>${task.name}</strong><br>
                <span>Start: ${task.startDate?.toLocaleDateString()}</span><br>
                <span>Duration: ${task.duration} ${task.durationUnit}</span><br>
                <span>${task.address || ''}</span>
            `);
    }

    removeMarker(taskId) {
        const marker = this.markers.get(taskId);
        if (marker) {
            marker.remove();
            this.markers.delete(taskId);
        }
    }

    clearAllMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers.clear();
    }

    fitBounds() {
        if (this.markers.size === 0) return;

        const bounds = new mapboxgl.LngLatBounds();

        this.markers.forEach(marker => {
            bounds.extend(marker.getLngLat());
        });

        this.mapPanel.map.fitBounds(bounds, { padding: 50 });
    }

    onTasksAdd({ records }) {
        records.forEach(task => {
            if (task.hasLocation) {
                this.addMarker(task);
            }
        });
    }

    onTasksRemove({ records }) {
        records.forEach(task => {
            this.removeMarker(task.id);
        });
    }

    onTaskUpdate({ record, changes }) {
        if ('location' in changes) {
            this.removeMarker(record.id);
            if (record.hasLocation) {
                this.addMarker(record);
            }
        }
    }
}
```

---

## 3. Gantt-to-Map Interactie

### 3.1 Task Selection Sync

```javascript
const gantt = new Gantt({
    listeners: {
        // Gantt selectie -> Map focus
        selectionchange({ selected }) {
            const task = selected[0];
            if (task?.hasLocation) {
                const marker = mapSync.markers.get(task.id);
                if (marker) {
                    mapPanel.map.flyTo({
                        center: marker.getLngLat(),
                        zoom: 14,
                        duration: 1000
                    });
                    marker.togglePopup();
                }
            }
        },

        // Task click -> Map highlight
        taskClick({ taskRecord }) {
            mapSync.highlightMarker(taskRecord.id);
        }
    }
});
```

### 3.2 Map-to-Gantt Navigation

```javascript
// In GanttMapSync class
highlightMarker(taskId) {
    // Reset alle markers
    this.markers.forEach((marker, id) => {
        marker.getElement().classList.remove('highlighted');
    });

    // Highlight geselecteerde
    const marker = this.markers.get(taskId);
    if (marker) {
        marker.getElement().classList.add('highlighted');
    }
}

// Map click listener
this.mapPanel.map.on('click', (e) => {
    // Check of click op een marker was
    const features = this.mapPanel.map.queryRenderedFeatures(e.point);
    // Handle feature click
});
```

---

## 4. Locatie Editor in TaskEditor

### 4.1 Address Search Field

```javascript
import { Combo, Model } from '@bryntum/gantt';

class Address extends Model {
    static idField = 'place_id';
    static fields = ['display_name', 'lat', 'lon'];
}

class AddressSearchField extends Combo {
    static type = 'addresssearchfield';

    static configurable = {
        clearable: true,
        displayField: 'display_name',
        valueField: null,  // Return hele record
        filterOnEnter: true,
        store: {
            modelClass: Address,
            readUrl: 'https://nominatim.openstreetmap.org/search',
            encodeFilterParams(filters) {
                return filters[0].value;
            },
            params: { format: 'json' },
            fetchOptions: { credentials: 'omit' }
        },
        pickerWidth: 450,
        listItemTpl: addr => `
            <i class="fa fa-map-marker-alt"></i>
            <div class="address-container">
                <span>${addr.display_name}</span>
                <span class="coords">${addr.lat}°, ${addr.lon}°</span>
            </div>
        `
    };
}

AddressSearchField.initClass();
```

### 4.2 TaskEditor Configuratie

```javascript
const gantt = new Gantt({
    features: {
        taskEdit: {
            items: {
                generalTab: {
                    items: {
                        // Voeg locatie veld toe aan General tab
                        locationField: {
                            type: 'addresssearchfield',
                            label: 'Location',
                            name: 'location',
                            weight: 400,  // Na duration
                            onChange({ value }) {
                                if (value) {
                                    this.record.location = {
                                        lat: parseFloat(value.lat),
                                        lon: parseFloat(value.lon),
                                        name: value.display_name
                                    };
                                }
                            }
                        },
                        addressField: {
                            type: 'textfield',
                            label: 'Address',
                            name: 'address',
                            weight: 410,
                            readOnly: true
                        }
                    }
                }
            }
        }
    }
});
```

---

## 5. Region-Based Filtering

### 5.1 Map Bounds Filter

```javascript
// Filter Gantt taken gebaseerd op zichtbare kaartregio
function filterByMapBounds() {
    const bounds = mapPanel.map.getBounds();

    gantt.project.taskStore.filter({
        id: 'mapBounds',
        filterBy: task => {
            if (!task.hasLocation) return true;  // Toon taken zonder locatie

            const { lat, lon } = task.location;
            return bounds.contains([lon, lat]);
        }
    });
}

// Trigger bij map move
mapPanel.map.on('moveend', () => {
    if (filterByMapEnabled) {
        filterByMapBounds();
    }
});
```

### 5.2 Region Grouping

```javascript
// Groepeer taken per regio
const gantt = new Gantt({
    features: {
        group: {
            field: 'region',
            renderer: ({ groupRowFor }) => `
                <i class="fa fa-map-marker"></i>
                ${groupRowFor || 'No Region'}
            `
        }
    }
});
```

---

## 6. Milestone Markers

### 6.1 Visuele Differentiatie

```javascript
addMarker(task) {
    const el = document.createElement('div');

    // Verschillende marker types
    if (task.isMilestone) {
        el.className = 'milestone-marker';
        el.innerHTML = '<i class="fa fa-flag"></i>';
    } else if (task.isParent) {
        el.className = 'summary-marker';
        el.innerHTML = '<i class="fa fa-folder"></i>';
    } else {
        el.className = 'task-marker';
    }

    // Status-based kleuren
    if (task.percentDone === 100) {
        el.classList.add('completed');
    } else if (task.percentDone > 0) {
        el.classList.add('in-progress');
    }

    // ... marker creation
}
```

### 6.2 CSS Styling

```css
.gantt-task-marker {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    transition: transform 0.2s ease;
}

.gantt-task-marker:hover,
.gantt-task-marker.highlighted {
    transform: scale(1.3);
    z-index: 1000 !important;
}

.milestone-marker {
    width: 32px;
    height: 32px;
    background: #f5a623;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.task-marker.completed {
    background: #27ae60 !important;
}

.task-marker.in-progress {
    background: #3498db !important;
}
```

---

## 7. Project Timeline Visualisatie

### 7.1 Animated Route Lines

```javascript
// Toon geplande route tussen taken
function drawProjectRoute(tasks) {
    const sortedTasks = tasks
        .filter(t => t.hasLocation)
        .sort((a, b) => a.startDate - b.startDate);

    const coordinates = sortedTasks.map(t => t.coordinates);

    // Voeg route lijn toe
    if (!mapPanel.map.getSource('route')) {
        mapPanel.map.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates
                }
            }
        });

        mapPanel.map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3498db',
                'line-width': 3,
                'line-dasharray': [2, 2]
            }
        });
    } else {
        mapPanel.map.getSource('route').setData({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates
            }
        });
    }
}
```

---

## 8. Complete Implementatie Voorbeeld

### 8.1 Full Setup

```javascript
import { Gantt, Panel, Splitter, ProjectModel } from '@bryntum/gantt';

// Custom Task Model
class GeoTask extends TaskModel {
    static fields = [
        { name: 'location', type: 'object' },
        { name: 'address', type: 'string' }
    ];

    get coordinates() {
        return this.location ? [this.location.lon, this.location.lat] : null;
    }

    get hasLocation() {
        return Boolean(this.location?.lat && this.location?.lon);
    }
}

// Project met geo-taken
const project = new ProjectModel({
    taskModelClass: GeoTask,
    autoLoad: true,
    loadUrl: 'data/geo-project.json'
});

// Gantt instance
const gantt = new Gantt({
    appendTo: 'gantt-container',
    project,
    columns: [
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'duration' },
        {
            text: 'Location',
            field: 'address',
            width: 200,
            renderer: ({ record }) =>
                record.hasLocation
                    ? `<i class="fa fa-map-marker-alt"></i> ${record.address}`
                    : ''
        }
    ],
    features: {
        taskEdit: {
            items: {
                generalTab: {
                    items: {
                        locationField: {
                            type: 'addresssearchfield',
                            label: 'Location',
                            name: 'location',
                            weight: 500
                        }
                    }
                }
            }
        }
    }
});

// Map Panel
const mapPanel = new MapPanel({
    appendTo: 'map-container',
    zoom: 12
});

// Sync instance
const mapSync = new GanttMapSync(gantt, mapPanel);

// Splitter voor resize
new Splitter({
    appendTo: 'main-container'
});
```

---

## 9. Best Practices

### 9.1 Performance

| Aspect | Recommendation |
|--------|----------------|
| Marker count | Cluster markers bij > 100 taken |
| Updates | Batch marker updates bij bulk changes |
| Map resize | Debounce resize events |
| Popups | Lazy-load popup content |

### 9.2 UX Guidelines

1. **Consistente kleuren** - Gebruik zelfde kleuren als Gantt bars
2. **Feedback** - Highlight marker bij task hover in Gantt
3. **Navigation** - Double-click op marker scrollt Gantt naar task
4. **Context** - Toon task details in marker popup

### 9.3 Data Structuur

```json
{
    "tasks": {
        "rows": [
            {
                "id": 1,
                "name": "Site Survey",
                "startDate": "2025-01-15",
                "duration": 2,
                "location": {
                    "lat": 52.3676,
                    "lon": 4.9041,
                    "name": "Amsterdam Central"
                },
                "address": "Stationsplein 1, Amsterdam"
            }
        ]
    }
}
```

---

## 10. Alternatieven

### 10.1 Leaflet.js

```javascript
// Leaflet in plaats van Mapbox
const map = L.map('map-container').setView([52.37, 4.90], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Marker toevoegen
L.marker([task.location.lat, task.location.lon])
    .bindPopup(task.name)
    .addTo(map);
```

### 10.2 Google Maps

```javascript
const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 52.37, lng: 4.90 },
    zoom: 13
});

new google.maps.Marker({
    position: { lat: task.location.lat, lng: task.location.lon },
    map,
    title: task.name
});
```

---

## Zie Ook

- [MAPS-SCHEDULER-INTEGRATION.md](./MAPS-SCHEDULER-INTEGRATION.md) - SchedulerPro + Maps
- [MAPS-AG-GRID-COMBO.md](./MAPS-AG-GRID-COMBO.md) - AG Grid + Maps
- [IMPL-TRAVEL-TIME.md](./IMPL-TRAVEL-TIME.md) - Reistijd berekening
- [IMPL-GEOGRAPHIC-RESOURCES.md](./IMPL-GEOGRAPHIC-RESOURCES.md) - Locatie-gebaseerde resources

---

*Track C1.1 - Maps & Geografische integratie*
