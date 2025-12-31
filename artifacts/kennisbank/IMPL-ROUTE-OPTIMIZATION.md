# Implementation Guide: Route Optimization

> **Implementatie guide** voor route optimalisatie in field service scheduling: multi-stop planning, travel time minimalisatie, en scheduling constraints.

---

## Overzicht

Route Optimization maakt het mogelijk om:
- **Multi-Stop Routes** - Optimale volgorde van bezoeken berekenen
- **Travel Time Minimalisatie** - Totale reistijd per resource minimaliseren
- **Time Windows** - Rekening houden met afspraaktijden
- **Capacity Constraints** - Resource werkduur en pauzes respecteren

---

## 1. Route Planning Concepten

### 1.1 Vehicle Routing Problem (VRP)

```
                    ┌─────────────────────────────────────────┐
                    │         Route Optimization Input         │
                    └─────────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │   Resources   │       │    Events     │       │  Constraints  │
    │   (Vehicles)  │       │   (Stops)     │       │   (Rules)     │
    ├───────────────┤       ├───────────────┤       ├───────────────┤
    │ Home location │       │ Location      │       │ Time windows  │
    │ Max work time │       │ Duration      │       │ Max distance  │
    │ Skills        │       │ Required skills│       │ Break times   │
    └───────────────┘       └───────────────┘       └───────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │          Optimized Schedule             │
                    │  Resource → Ordered list of events      │
                    │  with calculated travel times           │
                    └─────────────────────────────────────────┘
```

### 1.2 Key Metrics

| Metric | Beschrijving |
|--------|--------------|
| Total Travel Time | Som van alle reistijden |
| Total Distance | Som van alle afstanden |
| Utilization | % tijd besteed aan daadwerkelijk werk |
| On-time Rate | % events binnen time window |

---

## 2. OSRM Integration

### 2.1 Route Matrix Service

```javascript
class RouteMatrixService {
    static apiUrl = 'https://router.project-osrm.org';

    // Bereken afstand/tijd matrix tussen alle locaties
    static async calculateMatrix(locations) {
        const coords = locations.map(l => `${l.lon},${l.lat}`).join(';');
        const url = `${this.apiUrl}/table/v1/driving/${coords}?annotations=duration,distance`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 'Ok') {
                return {
                    durations: data.durations,  // Seconden
                    distances: data.distances    // Meters
                };
            }
        } catch (error) {
            console.error('Matrix calculation failed:', error);
        }

        return null;
    }

    // Bereken optimale route via waypoints
    static async calculateRoute(waypoints) {
        const coords = waypoints.map(w => `${w.lon},${w.lat}`).join(';');
        const url = `${this.apiUrl}/route/v1/driving/${coords}?overview=full&steps=true`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 'Ok' && data.routes.length > 0) {
                return {
                    duration: data.routes[0].duration,
                    distance: data.routes[0].distance,
                    geometry: data.routes[0].geometry,
                    legs: data.routes[0].legs
                };
            }
        } catch (error) {
            console.error('Route calculation failed:', error);
        }

        return null;
    }
}
```

### 2.2 Trip Optimization (OSRM Trip Service)

```javascript
class TripOptimizer {
    static apiUrl = 'https://router.project-osrm.org';

    // Optimale volgorde berekenen (Traveling Salesman)
    static async optimizeOrder(stops, options = {}) {
        const {
            roundtrip = true,
            source = 'first',  // 'first' | 'last' | 'any'
            destination = 'last'
        } = options;

        const coords = stops.map(s => `${s.lon},${s.lat}`).join(';');
        const url = `${this.apiUrl}/trip/v1/driving/${coords}?` +
            `roundtrip=${roundtrip}&source=${source}&destination=${destination}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 'Ok' && data.trips.length > 0) {
                const trip = data.trips[0];

                // Waypoint indices geven optimale volgorde
                const optimizedOrder = data.waypoints
                    .sort((a, b) => a.trips_index - b.trips_index ||
                                    a.waypoint_index - b.waypoint_index)
                    .map(wp => wp.waypoint_index);

                return {
                    order: optimizedOrder,
                    duration: trip.duration,
                    distance: trip.distance,
                    geometry: trip.geometry
                };
            }
        } catch (error) {
            console.error('Trip optimization failed:', error);
        }

        return null;
    }
}
```

---

## 3. Scheduler Integration

### 3.1 Route Optimizer Class

```javascript
class ScheduleRouteOptimizer {
    constructor(scheduler) {
        this.scheduler = scheduler;
    }

    // Optimaliseer route voor een resource op specifieke dag
    async optimizeResourceRoute(resource, date) {
        const events = this.getResourceEvents(resource, date);
        if (events.length < 2) return events;

        // Bouw locatie lijst: home -> events -> home
        const locations = [
            resource.homeLocation,
            ...events.map(e => e.location),
            resource.homeLocation
        ];

        // Haal optimale volgorde op
        const result = await TripOptimizer.optimizeOrder(locations, {
            roundtrip: true,
            source: 'first',
            destination: 'last'
        });

        if (result) {
            // Herorder events volgens optimale route
            const optimizedEvents = result.order
                .slice(1, -1)  // Excludeer home locaties
                .map(idx => events[idx - 1]);

            return this.rescheduleEvents(optimizedEvents, resource, date);
        }

        return events;
    }

    getResourceEvents(resource, date) {
        const startOfDay = DateHelper.startOf(date, 'day');
        const endOfDay = DateHelper.add(startOfDay, 1, 'day');

        return this.scheduler.eventStore.query(event =>
            event.resourceId === resource.id &&
            event.startDate >= startOfDay &&
            event.startDate < endOfDay &&
            event.location
        ).sort((a, b) => a.startDate - b.startDate);
    }

    async rescheduleEvents(orderedEvents, resource, date) {
        if (orderedEvents.length === 0) return [];

        const workStart = DateHelper.startOf(date, 'day');
        DateHelper.set(workStart, 'hour', 8);  // 08:00 start

        let currentTime = workStart;
        let currentLocation = resource.homeLocation;

        for (const event of orderedEvents) {
            // Bereken travel time van vorige locatie
            const route = await RouteMatrixService.calculateMatrix([
                currentLocation,
                event.location
            ]);

            if (route) {
                const travelMinutes = Math.ceil(route.durations[0][1] / 60);

                // Update event timing
                event.preamble = `${travelMinutes} min`;

                // Nieuwe start tijd = current time + travel
                const newStart = DateHelper.add(currentTime, travelMinutes, 'minute');

                // Check time window constraints
                if (event.timeWindowStart && newStart < event.timeWindowStart) {
                    event.startDate = event.timeWindowStart;
                } else {
                    event.startDate = newStart;
                }
            }

            currentTime = event.endDate;
            currentLocation = event.location;
        }

        // Commit changes
        await this.scheduler.project.commitAsync();

        return orderedEvents;
    }
}
```

### 3.2 UI Integration

```javascript
const scheduler = new SchedulerPro({
    tbar: [
        {
            type: 'button',
            text: 'Optimize Routes',
            icon: 'fa fa-route',
            onClick: async () => {
                const date = scheduler.startDate;

                scheduler.maskBody('Optimizing routes...');

                try {
                    const optimizer = new ScheduleRouteOptimizer(scheduler);

                    // Optimaliseer voor alle resources
                    for (const resource of scheduler.resourceStore.records) {
                        await optimizer.optimizeResourceRoute(resource, date);
                    }

                    Toast.show({
                        html: 'Routes optimized!',
                        color: 'b-green'
                    });
                } finally {
                    scheduler.unmaskBody();
                }
            }
        }
    ]
});
```

---

## 4. Greedy Assignment Algorithm

### 4.1 Simple Nearest-First Assignment

```javascript
class GreedyAssigner {
    constructor(resourceStore, eventStore) {
        this.resourceStore = resourceStore;
        this.eventStore = eventStore;
    }

    // Wijs unassigned events toe aan dichtstbijzijnde beschikbare resource
    async assignUnscheduled(date, unassignedEvents) {
        const assignments = [];

        // Sorteer events op prioriteit/deadline
        const sortedEvents = [...unassignedEvents].sort((a, b) => {
            if (a.priority !== b.priority) return b.priority - a.priority;
            if (a.timeWindowEnd && b.timeWindowEnd) {
                return a.timeWindowEnd - b.timeWindowEnd;
            }
            return 0;
        });

        for (const event of sortedEvents) {
            const bestFit = await this.findBestResourceForEvent(event, date);

            if (bestFit) {
                assignments.push({
                    event,
                    resource: bestFit.resource,
                    startTime: bestFit.startTime,
                    travelTime: bestFit.travelTime
                });

                // Update resource availability
                this.markResourceBusy(bestFit.resource, bestFit.startTime, event.duration);
            }
        }

        return assignments;
    }

    async findBestResourceForEvent(event, date) {
        const candidates = [];

        for (const resource of this.resourceStore.records) {
            // Check skills
            if (event.requiredSkills && !this.hasRequiredSkills(resource, event.requiredSkills)) {
                continue;
            }

            // Check service area
            if (!resource.canService(event.location.lat, event.location.lon)) {
                continue;
            }

            // Find earliest available slot
            const slot = this.findAvailableSlot(resource, date, event.duration);
            if (!slot) continue;

            // Calculate travel time from previous location
            const prevLocation = this.getResourceLocationAtTime(resource, slot.start);
            const travelTime = await this.calculateTravelTime(prevLocation, event.location);

            // Adjust slot start for travel time
            const actualStart = DateHelper.add(slot.start, travelTime, 'minute');

            // Check time window
            if (event.timeWindowEnd && actualStart > event.timeWindowEnd) {
                continue;
            }

            candidates.push({
                resource,
                startTime: actualStart,
                travelTime,
                score: this.calculateFitScore(resource, event, travelTime)
            });
        }

        // Return beste candidate (laagste score = beste fit)
        candidates.sort((a, b) => a.score - b.score);
        return candidates[0] || null;
    }

    calculateFitScore(resource, event, travelTime) {
        // Simpele scoring: travel time + afstand van home
        const homeDistance = resource.distanceTo(event.location.lat, event.location.lon);
        return travelTime * 2 + homeDistance;
    }

    hasRequiredSkills(resource, requiredSkills) {
        return requiredSkills.every(skill =>
            resource.skills?.includes(skill)
        );
    }

    findAvailableSlot(resource, date, duration) {
        // Vereenvoudigde implementatie
        // In productie: gebruik resource calendar en bestaande events
        const workStart = DateHelper.startOf(date, 'day');
        DateHelper.set(workStart, 'hour', 8);

        return { start: workStart };
    }

    getResourceLocationAtTime(resource, time) {
        // Vind laatste event voor dit tijdstip
        const prevEvent = this.eventStore.query(e =>
            e.resourceId === resource.id &&
            e.endDate <= time
        ).sort((a, b) => b.endDate - a.endDate)[0];

        return prevEvent?.location || resource.homeLocation;
    }

    async calculateTravelTime(from, to) {
        if (!from || !to) return 0;

        const matrix = await RouteMatrixService.calculateMatrix([from, to]);
        return matrix ? Math.ceil(matrix.durations[0][1] / 60) : 30; // Default 30 min
    }

    markResourceBusy(resource, start, duration) {
        // Track in-memory voor deze optimization run
        // In productie: check actual eventStore
    }
}
```

---

## 5. Time Window Constraints

### 5.1 Event Model met Time Windows

```javascript
class TimeWindowEvent extends EventModel {
    static get fields() {
        return [
            { name: 'timeWindowStart', type: 'date' },
            { name: 'timeWindowEnd', type: 'date' },
            { name: 'priority', type: 'number', defaultValue: 5 },
            { name: 'isFlexible', type: 'boolean', defaultValue: true }
        ];
    }

    // Check of event op gegeven tijd gescheduled kan worden
    canScheduleAt(startTime) {
        if (this.timeWindowStart && startTime < this.timeWindowStart) {
            return false;
        }
        if (this.timeWindowEnd) {
            const endTime = DateHelper.add(startTime, this.duration, this.durationUnit);
            return endTime <= this.timeWindowEnd;
        }
        return true;
    }
}
```

### 5.2 Visualization

```javascript
// Toon time windows als time ranges
const scheduler = new SchedulerPro({
    features: {
        timeRanges: {
            showHeaderElements: true,
            enableResizing: false
        }
    }
});

// Voeg time window indicators toe
function showTimeWindows(events) {
    const timeRanges = events
        .filter(e => e.timeWindowStart || e.timeWindowEnd)
        .map(e => ({
            id: `tw-${e.id}`,
            resourceId: e.resourceId,
            startDate: e.timeWindowStart || e.startDate,
            endDate: e.timeWindowEnd || e.endDate,
            name: `Window: ${e.name}`,
            cls: 'time-window-indicator'
        }));

    scheduler.timeRangeStore.add(timeRanges);
}
```

---

## 6. Map Route Visualization

### 6.1 Polyline Route Display

```javascript
class RouteVisualizer {
    constructor(map) {
        this.map = map;
        this.routeLayers = new Map();
    }

    async showResourceRoute(resource, events) {
        // Bouw waypoints: home -> events (in volgorde) -> home
        const waypoints = [
            resource.homeLocation,
            ...events.sort((a, b) => a.startDate - b.startDate).map(e => e.location),
            resource.homeLocation
        ];

        const route = await RouteMatrixService.calculateRoute(waypoints);
        if (!route) return;

        const routeId = `route-${resource.id}`;

        // Verwijder bestaande route
        this.removeRoute(routeId);

        // Voeg nieuwe route toe
        this.map.addSource(routeId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: polyline.toGeoJSON(route.geometry)
            }
        });

        this.map.addLayer({
            id: routeId,
            type: 'line',
            source: routeId,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': resource.eventColor || '#3498db',
                'line-width': 4,
                'line-opacity': 0.8
            }
        });

        // Voeg waypoint markers toe
        this.addWaypointMarkers(routeId, waypoints, resource.eventColor);

        this.routeLayers.set(routeId, true);
    }

    addWaypointMarkers(routeId, waypoints, color) {
        waypoints.forEach((wp, idx) => {
            const el = document.createElement('div');
            el.className = 'waypoint-marker';
            el.textContent = idx === 0 || idx === waypoints.length - 1 ? 'H' : idx;
            el.style.backgroundColor = color;

            new mapboxgl.Marker(el)
                .setLngLat([wp.lon, wp.lat])
                .addTo(this.map);
        });
    }

    removeRoute(routeId) {
        if (this.map.getLayer(routeId)) {
            this.map.removeLayer(routeId);
            this.map.removeSource(routeId);
        }
    }

    clearAllRoutes() {
        this.routeLayers.forEach((_, id) => this.removeRoute(id));
        this.routeLayers.clear();
    }
}
```

---

## 7. Performance Considerations

### 7.1 Caching Strategy

```javascript
class RouteCache {
    constructor(ttl = 3600000) {  // 1 hour default TTL
        this.cache = new Map();
        this.ttl = ttl;
    }

    getKey(from, to) {
        return `${from.lat},${from.lon}-${to.lat},${to.lon}`;
    }

    get(from, to) {
        const key = this.getKey(from, to);
        const cached = this.cache.get(key);

        if (cached && Date.now() - cached.timestamp < this.ttl) {
            return cached.value;
        }

        return null;
    }

    set(from, to, value) {
        const key = this.getKey(from, to);
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    clear() {
        this.cache.clear();
    }
}

// Gebruik in RouteMatrixService
const routeCache = new RouteCache();

async function getCachedRoute(from, to) {
    const cached = routeCache.get(from, to);
    if (cached) return cached;

    const result = await RouteMatrixService.calculateMatrix([from, to]);
    if (result) {
        routeCache.set(from, to, result);
    }
    return result;
}
```

### 7.2 Batch Processing

```javascript
// Batch route calculations voor efficiency
async function batchCalculateRoutes(locationPairs) {
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < locationPairs.length; i += batchSize) {
        const batch = locationPairs.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(([from, to]) => getCachedRoute(from, to))
        );
        results.push(...batchResults);

        // Rate limiting: wacht 100ms tussen batches
        if (i + batchSize < locationPairs.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}
```

---

## 8. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| API Calls | Gebruik caching en batch requests |
| Fallback | Haversine distance als routing API faalt |
| Time Windows | Prioriteer events met strakke deadlines |
| Real-time | Herbereken routes bij significante wijzigingen |
| UI Feedback | Toon loading indicator tijdens optimalisatie |

---

## Zie Ook

- [IMPL-GEOGRAPHIC-RESOURCES.md](./IMPL-GEOGRAPHIC-RESOURCES.md) - Resource locaties
- [IMPL-TRAVEL-TIME.md](./IMPL-TRAVEL-TIME.md) - Travel time buffers
- [MAPS-SCHEDULER-INTEGRATION.md](./MAPS-SCHEDULER-INTEGRATION.md) - Maps integratie
- [SCHEDULER-DEEP-DIVE-SCHEDULING-ENGINE.md](./SCHEDULER-DEEP-DIVE-SCHEDULING-ENGINE.md) - Scheduling engine

---

*Track C1.6 - Maps & Geografische integratie - Route Optimization*
