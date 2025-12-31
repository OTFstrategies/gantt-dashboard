# Implementation Guide: Travel Time & Event Buffers

> **Implementatie guide** voor travel time visualisatie in Bryntum SchedulerPro: preamble/postamble buffers, route berekening, en field service scheduling.

---

## Overzicht

Travel time implementatie maakt het mogelijk om:
- **Visuele Buffers** - Toon reistijd voor/na events
- **Overlap Prevention** - Buffer tijd meetellen bij scheduling
- **Tooltip Integratie** - Toon reis-informatie in event tooltips
- **Map Integration** - Koppel aan kaart-tooltip met locatie

---

## 1. Event Buffer Feature

### 1.1 Basic Configuration

```javascript
const scheduler = new SchedulerPro({
    features: {
        eventBuffer: true  // Enable met defaults
    }
});
```

### 1.2 Advanced Configuration

```javascript
features: {
    eventBuffer: {
        // Buffer als unavailable time (voorkomt overlapping)
        bufferIsUnavailableTime: true,

        // Custom tooltip voor buffers
        tooltipTemplate: ({ duration }) =>
            `<i class="b-icon fa-car"></i>Travel time: ${duration}`,

        // Custom rendering
        renderer({ eventRecord, preambleConfig, postambleConfig }) {
            if (eventRecord.preamble) {
                preambleConfig.icon = eventRecord.preambleIcon;
                preambleConfig.cls = eventRecord.preambleCls;
                preambleConfig.text = eventRecord.preamble.toString(true) +
                    (eventRecord.preambleText ? ` (${eventRecord.preambleText})` : '');
            }

            if (eventRecord.postamble) {
                postambleConfig.icon = eventRecord.postambleIcon;
                postambleConfig.cls = eventRecord.postambleCls;
                postambleConfig.text = eventRecord.postamble.toString(true) +
                    (eventRecord.postambleText ? ` (${eventRecord.postambleText})` : '');
            }
        }
    }
}
```

---

## 2. Event Model met Travel Time

### 2.1 Extended Fields

```javascript
import { EventModel } from '@bryntum/schedulerpro';

class TravelEvent extends EventModel {
    static get fields() {
        return [
            // Core travel time fields
            { name: 'preamble', type: 'duration' },     // Reistijd erheen
            { name: 'postamble', type: 'duration' },    // Reistijd terug

            // UI customization fields
            { name: 'preambleText' },                   // "via A10"
            { name: 'preambleIcon', defaultValue: 'fa fa-car' },
            { name: 'preambleCls' },                    // CSS class

            { name: 'postambleText' },
            { name: 'postambleIcon', defaultValue: 'fa fa-car' },
            { name: 'postambleCls' },

            // Location data
            { name: 'address' },
            { name: 'durationUnit', defaultValue: 'h' }
        ];
    }
}
```

### 2.2 Data Format

```json
{
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Client Visit",
                "startDate": "2025-01-06T10:00:00",
                "duration": 2,
                "durationUnit": "h",
                "preamble": "30 min",
                "preambleText": "via A10",
                "preambleIcon": "fa fa-car",
                "postamble": "45 min",
                "postambleText": "rush hour",
                "postambleCls": "traffic-warning",
                "address": {
                    "name": "Client Office",
                    "lat": 52.3676,
                    "lon": 4.9041
                }
            }
        ]
    }
}
```

---

## 3. UI Controls

### 3.1 Toggle Controls

```javascript
const scheduler = new SchedulerPro({
    tbar: [
        {
            type: 'slidetoggle',
            label: 'Show travel time',
            ref: 'travel-time-toggle',
            color: 'b-blue',
            checked: true,
            onChange({ checked }) {
                scheduler.features.eventBuffer.disabled = !checked;
            }
        },
        {
            type: 'slidetoggle',
            label: 'Show duration label',
            ref: 'duration-toggle',
            color: 'b-blue',
            checked: true,
            onChange({ checked }) {
                scheduler.features.eventBuffer.showDuration = checked;
            }
        }
    ]
});
```

---

## 4. Leaflet Map Tooltip Integration

### 4.1 Event Tooltip met Mini-Map

```javascript
features: {
    eventTooltip: {
        allowOver: true,  // Niet auto-hiden bij hover

        // Initialiseer map wanneer tooltip toont
        onShow({ source: tooltip }) {
            const
                { eventRecord } = tooltip,
                { lat, lon } = eventRecord?.address || {};

            // Cleanup vorige map
            if (tooltip.map) {
                tooltip.map.remove();
                tooltip.map = null;
            }

            if (lat && lon) {
                const map = tooltip.map = window.L.map('eventmap', {
                    zoomControl: false,
                    zoom: 13,
                    center: [lat, lon]
                });

                window.L.tileLayer(
                    `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${token}`,
                    {
                        attribution: '© OpenStreetMap, Mapbox',
                        id: 'mapbox/streets-v11',
                        tileSize: 512,
                        zoomOffset: -1
                    }
                ).addTo(map);

                window.L.marker([lat, lon]).addTo(tooltip.map);
            }
        },

        // Custom HTML template
        template: ({ eventRecord }) => {
            eventRecord = eventRecord.event || eventRecord;

            return `
                <header>
                    ${eventRecord.resource.image
                        ? `<img class="resource-image" src="users/${eventRecord.resource.image}.png"/>`
                        : ''
                    }
                    <div class="resource-info">
                        <span class="resource-name">${eventRecord.resource.name}</span>
                        <span class="resource-role">${eventRecord.resource.role}</span>
                    </div>
                </header>
                <div class="event-info">
                    <div class="event-details">
                        <strong><i class="b-icon fa-calendar"></i>${eventRecord.name}</strong>
                        ${DateHelper.format(eventRecord.startDate, 'LT')} -
                        ${DateHelper.format(eventRecord.endDate, 'LT')}

                        <strong><i class="b-icon fa-map-marker"></i>Address</strong>
                        <span>${eventRecord.address?.name || ''}</span>

                        <strong><i class="b-icon fa-car-side"></i>Travel time</strong>
                        <span>
                            ${eventRecord.preamble || ''}
                            <i class="b-icon fa-arrow-right"></i>
                        </span>
                        <span>
                            ${eventRecord.postamble || ''}
                            <i class="b-icon fa-arrow-left"></i>
                        </span>
                    </div>
                    <div id="eventmap"></div>
                </div>
            `;
        }
    }
}
```

---

## 5. TaskEdit Dialog Customization

### 5.1 Travel Time Fields

```javascript
features: {
    taskEdit: {
        items: {
            generalTab: {
                items: {
                    percentDoneField: { label: '% Done' },

                    // Travel time velden hernoemen
                    preambleField: {
                        label: 'Drive to',
                        type: 'duration',
                        name: 'preamble',
                        weight: 500
                    },
                    postambleField: {
                        label: 'Drive back',
                        type: 'duration',
                        name: 'postamble',
                        weight: 510
                    }
                }
            }
        }
    }
}
```

---

## 6. Styling

### 6.1 Buffer CSS

```css
/* Buffer element styling */
.b-sch-event-buffer {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
}

.b-sch-event-buffer-before {
    background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 5px,
        rgba(0,0,0,0.1) 5px,
        rgba(0,0,0,0.1) 10px
    );
    border-right: 1px dashed rgba(0,0,0,0.2);
}

.b-sch-event-buffer-after {
    background: repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 5px,
        rgba(0,0,0,0.1) 5px,
        rgba(0,0,0,0.1) 10px
    );
    border-left: 1px dashed rgba(0,0,0,0.2);
}

/* Buffer labels */
.b-buffer-label {
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 4px;
}

/* Traffic warning styling */
.traffic-warning {
    background: repeating-linear-gradient(
        45deg,
        #f39c12,
        #f39c12 5px,
        #e67e22 5px,
        #e67e22 10px
    );
}

/* Tooltip map container */
#eventmap {
    width: 200px;
    height: 150px;
    border-radius: 4px;
    margin-top: 8px;
}

.event-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.event-details strong {
    margin-top: 8px;
}

.event-details strong i {
    margin-right: 6px;
    color: #7f8c8d;
}
```

---

## 7. Route Calculation Integration

### 7.1 OSRM API voor Travel Time

```javascript
class TravelTimeCalculator {
    static apiUrl = 'https://router.project-osrm.org/route/v1/driving';

    static async calculateRoute(fromCoords, toCoords) {
        const url = `${this.apiUrl}/${fromCoords.join(',')};${toCoords.join(',')}?overview=false`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 'Ok' && data.routes.length > 0) {
                const route = data.routes[0];
                return {
                    duration: Math.round(route.duration / 60),  // Minuten
                    distance: Math.round(route.distance / 1000)  // Kilometers
                };
            }
        } catch (error) {
            console.error('Route calculation failed:', error);
        }

        return null;
    }

    // Bereken travel time tussen events
    static async calculateEventTravel(fromEvent, toEvent) {
        if (!fromEvent.address || !toEvent.address) return null;

        const fromCoords = [fromEvent.address.lon, fromEvent.address.lat];
        const toCoords = [toEvent.address.lon, toEvent.address.lat];

        return this.calculateRoute(fromCoords, toCoords);
    }
}
```

### 7.2 Automatische Preamble Update

```javascript
// Update preamble wanneer event wordt ingepland
scheduler.on({
    async beforeEventDropFinalize({ context, eventRecords }) {
        const event = eventRecords[0];
        const resource = context.resourceRecord;

        if (event.address && resource) {
            // Zoek voorgaand event van dezelfde resource
            const prevEvent = findPreviousEvent(resource, event.startDate);

            if (prevEvent?.address) {
                const travel = await TravelTimeCalculator.calculateEventTravel(
                    prevEvent,
                    event
                );

                if (travel) {
                    event.preamble = `${travel.duration} min`;
                    event.preambleText = `${travel.distance} km`;
                }
            }
        }
    }
});

function findPreviousEvent(resource, beforeDate) {
    return resource.events
        .filter(e => e.endDate <= beforeDate)
        .sort((a, b) => b.endDate - a.endDate)[0];
}
```

---

## 8. Drag Considerations

### 8.1 Drag Proxy met Buffers

```javascript
class TravelDrag extends DragHelper {
    createProxy(grabbedElement) {
        const
            { schedule, grid } = this,
            { timeAxisViewModel } = schedule,
            task = grid.getRecordFromElement(grabbedElement),
            eventWidth = timeAxisViewModel.getDistanceForDuration(task.durationMS),
            preambleWidth = timeAxisViewModel.getDistanceForDuration(
                task.preamble?.milliseconds || 0
            ),
            postambleWidth = timeAxisViewModel.getDistanceForDuration(
                task.postamble?.milliseconds || 0
            ),
            totalWidth = eventWidth + preambleWidth + postambleWidth,
            proxy = document.createElement('div');

        proxy.classList.add('b-sch-horizontal', 'b-event-buffer');

        proxy.innerHTML = `
            <div class="b-sch-event-wrap"
                 style="width: ${totalWidth}px; height: ${schedule.rowHeight - 10}px">
                <div class="b-sch-event-buffer b-sch-event-buffer-before"
                     style="width: ${preambleWidth}px">
                    <span class="b-buffer-label">${task.preamble?.toString() || ''}</span>
                </div>
                <div class="b-sch-event-buffer b-sch-event-buffer-after"
                     style="width: ${postambleWidth}px">
                    <span class="b-buffer-label">${task.postamble?.toString() || ''}</span>
                </div>
                <div class="b-sch-event">
                    <div class="b-sch-event-content">${task.name}</div>
                </div>
            </div>
        `;

        return proxy;
    }
}
```

---

## 9. Data Scenario's

### 9.1 Various Transport Modes

```json
{
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Bike Delivery",
                "preamble": "15 min",
                "preambleIcon": "fa fa-bicycle",
                "preambleCls": "transport-bike"
            },
            {
                "id": 2,
                "name": "Truck Delivery",
                "preamble": "45 min",
                "preambleIcon": "fa fa-truck",
                "preambleCls": "transport-truck"
            },
            {
                "id": 3,
                "name": "Walk-in Service",
                "preamble": "5 min",
                "preambleIcon": "fa fa-walking",
                "preambleCls": "transport-walk"
            }
        ]
    }
}
```

---

## 10. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Buffer tijd | Gebruik realistische schattingen (niet te optimistisch) |
| Rush hour | Overweeg tijdafhankelijke travel times |
| Overlap | Zet `bufferIsUnavailableTime: true` voor field service |
| UI | Toon buffer labels alleen bij voldoende ruimte |
| Caching | Cache route berekeningen voor herhaalde routes |

---

## Zie Ook

- [MAPS-SCHEDULER-INTEGRATION.md](./MAPS-SCHEDULER-INTEGRATION.md) - Volledige maps integratie
- [IMPL-GEOGRAPHIC-RESOURCES.md](./IMPL-GEOGRAPHIC-RESOURCES.md) - Locatie-gebaseerde resources
- [IMPL-ROUTE-OPTIMIZATION.md](./IMPL-ROUTE-OPTIMIZATION.md) - Route optimalisatie
- [SCHEDULER-IMPL-DRAG-DROP.md](./SCHEDULER-IMPL-DRAG-DROP.md) - Drag & Drop details

---

*Track C1.4 - Maps & Geografische integratie - Travel Time*
