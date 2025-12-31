# Implementation Guide: Geographic Resources

> **Implementatie guide** voor locatie-gebaseerde resource toewijzing: resource home bases, service areas, proximity-based scheduling, en geographic constraints.

---

## Overzicht

Geographic Resources maakt het mogelijk om:
- **Resource Locaties** - Home bases en werkgebieden definiëren
- **Proximity Matching** - Dichtstbijzijnde resource toewijzen
- **Service Areas** - Geografische beperkingen per resource
- **Travel Optimization** - Minimaliseer totale reistijd

---

## 1. Resource Model Extensions

### 1.1 Location-Aware Resource

```javascript
import { ResourceModel } from '@bryntum/schedulerpro';

class GeoResource extends ResourceModel {
    static get fields() {
        return [
            // Home base locatie
            { name: 'homeLocation', type: 'object' },  // { lat, lon, address }

            // Service area
            { name: 'serviceArea', type: 'object' },    // GeoJSON polygon
            { name: 'maxTravelDistance', type: 'number', defaultValue: 50 },  // km
            { name: 'maxTravelTime', type: 'number', defaultValue: 60 },      // min

            // Current location (voor real-time tracking)
            { name: 'currentLocation', type: 'object' },
            { name: 'lastLocationUpdate', type: 'date' }
        ];
    }

    // Bereken afstand naar een punt
    distanceTo(lat, lon) {
        if (!this.homeLocation) return Infinity;
        return GeoUtils.haversineDistance(
            this.homeLocation.lat,
            this.homeLocation.lon,
            lat,
            lon
        );
    }

    // Check of punt binnen service area valt
    canService(lat, lon) {
        if (this.serviceArea) {
            return GeoUtils.pointInPolygon([lon, lat], this.serviceArea);
        }
        // Fallback: check max travel distance
        return this.distanceTo(lat, lon) <= this.maxTravelDistance;
    }
}
```

### 1.2 GeoUtils Helper Class

```javascript
class GeoUtils {
    // Haversine formula voor afstandsberekening
    static haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Aarde radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    static toRad(deg) {
        return deg * (Math.PI / 180);
    }

    // Check of punt in polygon valt (ray casting)
    static pointInPolygon(point, polygon) {
        const [x, y] = point;
        const coords = polygon.coordinates[0];
        let inside = false;

        for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
            const [xi, yi] = coords[i];
            const [xj, yj] = coords[j];

            if (((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }

        return inside;
    }

    // Bereken centroid van polygon
    static polygonCentroid(polygon) {
        const coords = polygon.coordinates[0];
        let x = 0, y = 0;

        coords.forEach(([lon, lat]) => {
            x += lon;
            y += lat;
        });

        return {
            lon: x / coords.length,
            lat: y / coords.length
        };
    }
}
```

---

## 2. Proximity-Based Resource Assignment

### 2.1 Nearest Resource Finder

```javascript
class ResourceFinder {
    constructor(resourceStore) {
        this.resourceStore = resourceStore;
    }

    // Vind dichtstbijzijnde beschikbare resource
    findNearest(eventLocation, options = {}) {
        const {
            excludeResources = [],
            requiredSkills = [],
            preferredResources = [],
            maxDistance = Infinity
        } = options;

        const { lat, lon } = eventLocation;
        let candidates = [];

        this.resourceStore.forEach(resource => {
            // Skip excluded
            if (excludeResources.includes(resource.id)) return;

            // Check service area
            if (!resource.canService(lat, lon)) return;

            // Check skills (indien vereist)
            if (requiredSkills.length > 0) {
                const hasSkills = requiredSkills.every(skill =>
                    resource.skills?.includes(skill)
                );
                if (!hasSkills) return;
            }

            const distance = resource.distanceTo(lat, lon);
            if (distance <= maxDistance) {
                candidates.push({
                    resource,
                    distance,
                    isPreferred: preferredResources.includes(resource.id)
                });
            }
        });

        // Sorteer: preferred eerst, dan op afstand
        candidates.sort((a, b) => {
            if (a.isPreferred !== b.isPreferred) {
                return b.isPreferred ? 1 : -1;
            }
            return a.distance - b.distance;
        });

        return candidates[0]?.resource || null;
    }

    // Vind alle resources binnen bereik
    findWithinRange(eventLocation, maxDistance) {
        const { lat, lon } = eventLocation;
        const results = [];

        this.resourceStore.forEach(resource => {
            const distance = resource.distanceTo(lat, lon);
            if (distance <= maxDistance) {
                results.push({ resource, distance });
            }
        });

        return results.sort((a, b) => a.distance - b.distance);
    }
}
```

### 2.2 Auto-Assignment Integration

```javascript
const scheduler = new SchedulerPro({
    listeners: {
        // Auto-assign bij nieuwe events
        beforeEventAdd({ eventRecord }) {
            if (!eventRecord.resourceId && eventRecord.location) {
                const finder = new ResourceFinder(scheduler.resourceStore);
                const nearest = finder.findNearest(eventRecord.location, {
                    requiredSkills: eventRecord.requiredSkills
                });

                if (nearest) {
                    eventRecord.resourceId = nearest.id;
                }
            }
        },

        // Valideer assignment gebaseerd op locatie
        beforeEventDropFinalize({ context, eventRecords }) {
            const event = eventRecords[0];
            const resource = context.resourceRecord;

            if (event.location && !resource.canService(
                event.location.lat,
                event.location.lon
            )) {
                Toast.show({
                    html: `${resource.name} cannot service this area`,
                    color: 'b-orange'
                });
                return false;
            }
        }
    }
});
```

---

## 3. Service Area Visualization

### 3.1 Map Layer voor Service Areas

```javascript
class ServiceAreaLayer {
    constructor(map, resourceStore) {
        this.map = map;
        this.resourceStore = resourceStore;

        this.initLayer();
        this.setupListeners();
    }

    initLayer() {
        // GeoJSON source voor service areas
        this.map.addSource('service-areas', {
            type: 'geojson',
            data: this.buildGeoJSON()
        });

        // Fill layer
        this.map.addLayer({
            id: 'service-areas-fill',
            type: 'fill',
            source: 'service-areas',
            paint: {
                'fill-color': ['get', 'color'],
                'fill-opacity': 0.2
            }
        });

        // Border layer
        this.map.addLayer({
            id: 'service-areas-border',
            type: 'line',
            source: 'service-areas',
            paint: {
                'line-color': ['get', 'color'],
                'line-width': 2,
                'line-dasharray': [2, 2]
            }
        });
    }

    buildGeoJSON() {
        const features = [];

        this.resourceStore.forEach(resource => {
            if (resource.serviceArea) {
                features.push({
                    type: 'Feature',
                    properties: {
                        resourceId: resource.id,
                        name: resource.name,
                        color: resource.eventColor || '#3498db'
                    },
                    geometry: resource.serviceArea
                });
            }
        });

        return {
            type: 'FeatureCollection',
            features
        };
    }

    refresh() {
        this.map.getSource('service-areas').setData(this.buildGeoJSON());
    }

    setupListeners() {
        this.resourceStore.on('change', () => this.refresh());
    }

    // Highlight specifieke resource area
    highlightResource(resourceId) {
        this.map.setPaintProperty('service-areas-fill', 'fill-opacity', [
            'case',
            ['==', ['get', 'resourceId'], resourceId],
            0.4,
            0.1
        ]);
    }

    clearHighlight() {
        this.map.setPaintProperty('service-areas-fill', 'fill-opacity', 0.2);
    }
}
```

### 3.2 Resource Home Base Markers

```javascript
class ResourceMarkers {
    constructor(map, resourceStore) {
        this.map = map;
        this.resourceStore = resourceStore;
        this.markers = new Map();

        this.render();
    }

    render() {
        this.resourceStore.forEach(resource => {
            if (resource.homeLocation) {
                this.addMarker(resource);
            }
        });
    }

    addMarker(resource) {
        const { lat, lon } = resource.homeLocation;

        const el = document.createElement('div');
        el.className = 'resource-home-marker';
        el.innerHTML = `
            <i class="fa fa-home"></i>
            <span class="marker-label">${resource.name}</span>
        `;
        el.style.setProperty('--resource-color', resource.eventColor || '#3498db');

        const marker = new mapboxgl.Marker(el)
            .setLngLat([lon, lat])
            .setPopup(new mapboxgl.Popup().setHTML(`
                <strong>${resource.name}</strong><br>
                <span>Home Base</span><br>
                <small>Max range: ${resource.maxTravelDistance} km</small>
            `))
            .addTo(this.map);

        this.markers.set(resource.id, marker);
    }

    showRange(resourceId) {
        const resource = this.resourceStore.getById(resourceId);
        if (!resource?.homeLocation) return;

        const { lat, lon } = resource.homeLocation;
        const radius = resource.maxTravelDistance;

        // Teken cirkel voor max range
        this.map.addLayer({
            id: 'range-circle',
            type: 'fill',
            source: {
                type: 'geojson',
                data: this.createCircle([lon, lat], radius)
            },
            paint: {
                'fill-color': resource.eventColor || '#3498db',
                'fill-opacity': 0.15
            }
        });
    }

    hideRange() {
        if (this.map.getLayer('range-circle')) {
            this.map.removeLayer('range-circle');
            this.map.removeSource('range-circle');
        }
    }

    createCircle(center, radiusKm, points = 64) {
        const coords = [];
        const km = radiusKm;

        for (let i = 0; i < points; i++) {
            const angle = (i / points) * 2 * Math.PI;
            const dx = km * Math.cos(angle);
            const dy = km * Math.sin(angle);

            const lat = center[1] + (dy / 111.32);
            const lon = center[0] + (dx / (111.32 * Math.cos(center[1] * Math.PI / 180)));

            coords.push([lon, lat]);
        }
        coords.push(coords[0]); // Close polygon

        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [coords]
            }
        };
    }
}
```

---

## 4. Geographic Constraints in Scheduling

### 4.1 Drag Validation

```javascript
features: {
    eventDrag: {
        validatorFn({ eventRecords, newResource }) {
            const event = eventRecords[0];

            if (!event.location) return true;

            if (!newResource.canService(event.location.lat, event.location.lon)) {
                return {
                    valid: false,
                    message: `${newResource.name} cannot service this location`
                };
            }

            // Check travel time constraint
            const distance = newResource.distanceTo(
                event.location.lat,
                event.location.lon
            );
            const estimatedTime = distance / 50 * 60; // 50 km/h average

            if (estimatedTime > newResource.maxTravelTime) {
                return {
                    valid: false,
                    message: `Travel time exceeds ${newResource.maxTravelTime} min limit`
                };
            }

            return true;
        }
    }
}
```

### 4.2 Resource Filter by Location

```javascript
// Filter resources die een specifieke locatie kunnen bedienen
function filterResourcesForLocation(scheduler, location) {
    scheduler.resourceStore.filter({
        id: 'locationFilter',
        filterBy: resource => resource.canService(location.lat, location.lon)
    });
}

// Clear filter
function clearLocationFilter(scheduler) {
    scheduler.resourceStore.removeFilter('locationFilter');
}

// UI integratie
const scheduler = new SchedulerPro({
    tbar: [
        {
            type: 'addresssearchfield',
            label: 'Filter by location',
            width: 300,
            onChange({ value }) {
                if (value) {
                    filterResourcesForLocation(scheduler, {
                        lat: parseFloat(value.lat),
                        lon: parseFloat(value.lon)
                    });
                } else {
                    clearLocationFilter(scheduler);
                }
            }
        }
    ]
});
```

---

## 5. Data Structure

### 5.1 JSON Format

```json
{
    "resources": {
        "rows": [
            {
                "id": 1,
                "name": "John Smith",
                "role": "Senior Technician",
                "eventColor": "#3498db",
                "homeLocation": {
                    "lat": 52.3676,
                    "lon": 4.9041,
                    "address": "Amsterdam Office"
                },
                "maxTravelDistance": 30,
                "maxTravelTime": 45,
                "serviceArea": {
                    "type": "Polygon",
                    "coordinates": [[
                        [4.7, 52.2],
                        [5.1, 52.2],
                        [5.1, 52.5],
                        [4.7, 52.5],
                        [4.7, 52.2]
                    ]]
                },
                "skills": ["HVAC", "Electrical"]
            },
            {
                "id": 2,
                "name": "Jane Doe",
                "role": "Field Engineer",
                "eventColor": "#e74c3c",
                "homeLocation": {
                    "lat": 52.0907,
                    "lon": 5.1214,
                    "address": "Utrecht Office"
                },
                "maxTravelDistance": 50,
                "maxTravelTime": 60,
                "skills": ["Plumbing", "HVAC"]
            }
        ]
    }
}
```

---

## 6. Real-Time Location Tracking

### 6.1 Current Location Updates

```javascript
class LocationTracker {
    constructor(resourceStore, mapPanel) {
        this.resourceStore = resourceStore;
        this.mapPanel = mapPanel;
        this.markers = new Map();

        this.startTracking();
    }

    startTracking() {
        // Poll voor updates elke 30 seconden
        this.intervalId = setInterval(() => {
            this.fetchLocations();
        }, 30000);
    }

    async fetchLocations() {
        try {
            const response = await fetch('/api/resource-locations');
            const locations = await response.json();

            locations.forEach(({ resourceId, lat, lon, timestamp }) => {
                const resource = this.resourceStore.getById(resourceId);
                if (resource) {
                    resource.currentLocation = { lat, lon };
                    resource.lastLocationUpdate = new Date(timestamp);
                    this.updateMarker(resource);
                }
            });
        } catch (error) {
            console.error('Failed to fetch locations:', error);
        }
    }

    updateMarker(resource) {
        const { lat, lon } = resource.currentLocation;
        let marker = this.markers.get(resource.id);

        if (!marker) {
            const el = document.createElement('div');
            el.className = 'current-location-marker';
            el.innerHTML = '<i class="fa fa-user"></i>';
            el.style.backgroundColor = resource.eventColor;

            marker = new mapboxgl.Marker(el)
                .setLngLat([lon, lat])
                .addTo(this.mapPanel.map);

            this.markers.set(resource.id, marker);
        } else {
            marker.setLngLat([lon, lat]);
        }
    }

    stopTracking() {
        clearInterval(this.intervalId);
    }
}
```

---

## 7. Column Configuration

### 7.1 Location Column

```javascript
const scheduler = new SchedulerPro({
    columns: [
        {
            type: 'resourceInfo',
            text: 'Resource',
            width: 200
        },
        {
            text: 'Base',
            field: 'homeLocation.address',
            width: 150,
            renderer: ({ value, record }) =>
                value ? `<i class="fa fa-home"></i> ${value}` : ''
        },
        {
            text: 'Range',
            width: 80,
            renderer: ({ record }) =>
                `${record.maxTravelDistance || '-'} km`
        },
        {
            text: 'Status',
            width: 100,
            renderer: ({ record }) => {
                const lastUpdate = record.lastLocationUpdate;
                if (!lastUpdate) return 'Offline';

                const minutes = Math.round((Date.now() - lastUpdate) / 60000);
                return minutes < 5
                    ? '<span class="status-online">Online</span>'
                    : `<span class="status-stale">${minutes}m ago</span>`;
            }
        }
    ]
});
```

---

## 8. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Service Areas | Definieer als GeoJSON polygons voor flexibiliteit |
| Distance calc | Gebruik haversine voor korte afstanden, routing API voor accuratere resultaten |
| Updates | Cache afstandsberekeningen waar mogelijk |
| Real-time | Batch location updates om server load te beperken |
| Fallback | Altijd een fallback als geen resource beschikbaar is |

---

## Zie Ook

- [MAPS-SCHEDULER-INTEGRATION.md](./MAPS-SCHEDULER-INTEGRATION.md) - Scheduler + Maps basis
- [IMPL-TRAVEL-TIME.md](./IMPL-TRAVEL-TIME.md) - Travel time berekening
- [IMPL-ROUTE-OPTIMIZATION.md](./IMPL-ROUTE-OPTIMIZATION.md) - Route optimalisatie
- [SCHEDULER-DEEP-DIVE-RESOURCES.md](./SCHEDULER-DEEP-DIVE-RESOURCES.md) - Resource model details

---

*Track C1.5 - Maps & Geografische integratie - Geographic Resources*
