# Calendar Deep Dive: Resource View

> **Fase 6** - Diepgaande analyse van Calendar resource views: DayResourceView, ResourceView, multi-resource layouts en resource filtering.

---

## Overzicht

De Calendar biedt meerdere manieren om events per resource te visualiseren, van side-by-side subviews tot geïntegreerde resource kolommen.

### Resource View Types

| Type | Class | Beschrijving |
|------|-------|--------------|
| **ResourceView** | ResourceView | Meerdere subviews naast elkaar |
| **DayResourceView** | DayResourceView | Dag met resource kolommen |
| **DateResourceView** | DateResourceView | Datum-resource matrix |

---

## 1. ResourceView (Side-by-Side)

### Configuratie

```typescript
interface ResourceViewConfig {
    type: 'resource';

    // Breedte per resource
    resourceWidth: string;  // '30em'

    // Subview configuratie
    view: {
        type?: 'dayview' | 'weekview' | 'monthview';
        dayStartTime?: number;
        dayEndTime?: number;
        hourHeight?: number;
        tools?: Record<string, ToolConfig>;
        strips?: Record<string, StripConfig>;
    };

    // Resource metadata
    meta: (resource: ResourceModel) => string;
}
```

### ResourceView Setup

```javascript
// Bron: examples/resourceview/app.module.js
const calendar = new Calendar({
    modes: {
        // Disable standaard views
        day: null,
        week: null,
        month: null,
        year: null,
        agenda: null,

        // Week met resources
        weekResources: {
            type: 'resource',
            title: 'Week',
            resourceWidth: '30em',
            hideNonWorkingDays: true,

            view: {
                dayStartTime: 8,

                // Tools per subview
                tools: {
                    close: {
                        cls: 'fa fa-times',
                        tooltip: 'Filter out this resource',
                        handler: 'up.onSubviewCloseClick'
                    }
                },

                // Header strips
                strips: {
                    resourceInfo: {
                        type: 'widget',
                        dock: 'header',
                        cls: 'b-resource-location',
                        html: 'up.getSubViewHeader'
                    }
                }
            },

            // Resource metadata
            meta: resource => resource.title
        },

        // Month met resources
        monthResources: {
            type: 'resource',
            title: 'Month',
            resourceWidth: '30em',

            view: {
                type: 'monthview'
            },

            meta: resource => resource.title
        }
    },

    // Subview header content
    getSubViewHeader(widget) {
        const resource = widget.owner.resource;
        return `<span class="city">${resource.city}</span>`;
    },

    // Close button handler
    onSubviewCloseClick(domEvent, view) {
        this.widgetMap.resourceFilter.selected.remove(view.resource);
    }
});
```

### Resource Width Slider

```javascript
tbar: {
    items: {
        viewWidth: {
            type: 'slider',
            label: 'Resource width',
            weight: 640,
            min: 12,
            max: 100,
            value: 30,
            unit: 'em',
            showValue: false,
            showTooltip: true,
            onInput({ value }) {
                calendar.eachView(v => {
                    if (v.resourceWidth !== undefined) {
                        v.resourceWidth = value + 'em';
                    }
                });
            }
        }
    }
}
```

---

## 2. DayResourceView

### Configuratie

```typescript
interface DayResourceViewConfig extends DayViewConfig {
    type: 'dayresource';

    // Resource kolom breedte
    minResourceWidth: string;  // '10em'

    // Range
    range: string;  // '1 d', '3 d', '1 w'

    // Event layout
    eventLayout: FluidDayLayoutConfig;
}
```

### DayResourceView Setup

```javascript
// Bron: examples/drag-between-calendars/app.module.js
modes: {
    dayresource: {
        minResourceWidth: '10em',
        range: '3d',
        dayStartTime: 8,
        dayEndTime: 19,
        hourHeight: 70
    }
}
```

---

## 3. DateResourceView

### Configuratie

```typescript
interface DateResourceViewConfig {
    type: 'dateresource';

    // Non-consecutive dates ondersteuning
    nonConsecutiveDates: boolean;

    // Dates array
    dates: Date[];

    // Resource configuratie
    resourceWidth: string;
}
```

### DateResourceView Setup

```javascript
// Bron: examples/date-resource-non-consecutive-dates/app.module.js
modes: {
    dateResource: {
        type: 'dateresource',
        nonConsecutiveDates: true,
        dates: [
            new Date(2024, 5, 1),
            new Date(2024, 5, 5),
            new Date(2024, 5, 10),
            new Date(2024, 5, 15)
        ]
    }
}
```

---

## 4. Resource Filtering

### ResourceFilter Widget

```typescript
interface ResourceFilterConfig {
    multiSelect: boolean;  // default: true
    selected: (string | number)[];
    selectAllItem: boolean;
    title: string;
    filterResources: boolean;
}
```

### ResourceFilter Setup

```javascript
sidebar: {
    items: {
        resourceFilter: {
            title: 'Team Members',
            selectAllItem: true,

            // Filter resources in view
            filterResources: true,

            // Initial selection
            selected: ['r1', 'r2', 'r3']
        }
    }
}
```

### Programmatic Filtering

```javascript
const { resourceFilter } = calendar.widgetMap;

// Get selected resources
const selected = resourceFilter.selected;

// Select specific resources
resourceFilter.selected.set(['r1', 'r2']);

// Toggle resource
resourceFilter.selected.toggle(resourceModel);

// Select all
resourceFilter.selectAll();

// Deselect all
resourceFilter.deselectAll();
```

### Filter Events

```javascript
calendar.widgetMap.resourceFilter.on({
    change({ value }) {
        console.log('Selected resources:', value.map(r => r.name));

        // Custom filtering logic
        updateExternalUI(value);
    }
});
```

---

## 5. Resource Avatars

### Avatar Rendering

```javascript
// Bron: examples/resource-avatars/app.module.js
const calendar = new Calendar({
    resourceImagePath: '../_shared/images/users/',

    modes: {
        week: {
            eventRenderer({ eventRecord, renderData }) {
                const resource = eventRecord.resource;

                return {
                    children: [
                        {
                            tag: 'img',
                            className: 'b-resource-avatar',
                            src: `${calendar.resourceImagePath}${resource.image}`,
                            alt: resource.name
                        },
                        {
                            className: 'b-event-name',
                            text: eventRecord.name
                        }
                    ]
                };
            }
        }
    }
});
```

### AvatarRendering Helper

```javascript
import { AvatarRendering } from '@bryntum/calendar';

// Initialize once
if (!calendar.avatarRendering) {
    calendar.avatarRendering = new AvatarRendering({
        element: calendar.element
    });
}

// Use in renderer
eventRenderer({ eventRecord }) {
    const resource = eventRecord.resource;

    return {
        children: [
            calendar.avatarRendering.getResourceAvatar({
                initials: resource.initials,
                color: resource.eventColor,
                dataset: {
                    btip: resource.name
                }
            }),
            { text: eventRecord.name }
        ]
    };
}
```

---

## 6. Resource Modes

### Per-Resource View Configuratie

```javascript
// Bron: examples/resource-modes/app.module.js
modes: {
    resourceDay: {
        type: 'resource',
        title: 'Day',
        view: {
            type: 'dayview',
            dayStartTime: 8,
            dayEndTime: 18
        }
    },
    resourceWeek: {
        type: 'resource',
        title: 'Week',
        view: {
            type: 'weekview',
            dayStartTime: 8,
            dayEndTime: 18
        }
    },
    resourceMonth: {
        type: 'resource',
        title: 'Month',
        view: {
            type: 'monthview'
        }
    }
}
```

---

## 7. Resource Time Capacity

### Time Capacity Configuratie

```javascript
// Bron: examples/resource-time-capacity/app.module.js
modes: {
    week: {
        // Toon resource capaciteit
        showResourceCapacity: true,

        resourceCapacityRenderer({ resource, date, capacity }) {
            const hours = capacity / 60;
            return `${hours}h available`;
        }
    }
}
```

---

## 8. Multi-Assignment

### Event met Multiple Resources

```javascript
// Bron: examples/multiassign/app.module.js
const event = {
    id: 1,
    name: 'Team Meeting',
    startDate: '2024-06-15T10:00',
    endDate: '2024-06-15T11:00',

    // Meerdere resources
    resourceIds: ['r1', 'r2', 'r3']
};

// Of via assignment store
assignments: [
    { eventId: 1, resourceId: 'r1' },
    { eventId: 1, resourceId: 'r2' },
    { eventId: 1, resourceId: 'r3' }
]
```

### ResourceIds Direct

```javascript
// Bron: examples/multiassign-resourceids/app.module.js
crudManager: {
    eventStore: {
        // Gebruik resourceIds array
        useResourceIds: true
    }
}

// Event data
{
    "id": 1,
    "name": "Multi-resource Event",
    "resourceIds": ["r1", "r2"]
}
```

---

## 9. Resource Model

### ResourceModel Interface

```typescript
interface ResourceModel {
    id: string | number;
    name: string;

    // Styling
    eventColor: string;
    image: string;

    // Calendar specific
    calendar: CalendarModel;

    // Computed
    readonly initials: string;
}
```

### Custom Resource Fields

```javascript
class CustomResource extends ResourceModel {
    static fields = [
        { name: 'department' },
        { name: 'title' },
        { name: 'city' },
        {
            name: 'initials',
            persist: false,
            calculate(data) {
                return data.name.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase();
            }
        }
    ];
}

crudManager: {
    resourceStore: {
        modelClass: CustomResource
    }
}
```

---

## 10. Resource Grouping

### Grouped Resources

```javascript
sidebar: {
    items: {
        resourceFilter: {
            // Group resources by department
            groupField: 'department'
        }
    }
}
```

---

## 11. Resource Colors

### Event Color per Resource

```javascript
// Resource met color
const resource = {
    id: 'r1',
    name: 'John',
    eventColor: '#ff5722'
};

// Event erft color van resource
const event = {
    id: 1,
    name: 'Meeting',
    resourceId: 'r1'
    // eventColor wordt automatisch #ff5722
};

// Override op event niveau
const customEvent = {
    id: 2,
    name: 'Special Meeting',
    resourceId: 'r1',
    eventColor: '#2196f3'  // Override
};
```

---

## 12. Resource Store

### ResourceStore Operaties

```javascript
const resourceStore = calendar.resourceStore;

// Add resource
resourceStore.add({
    id: 'r4',
    name: 'New Team Member',
    eventColor: '#4caf50'
});

// Remove resource
resourceStore.remove('r4');

// Filter resources
resourceStore.filter({
    property: 'department',
    value: 'Engineering'
});

// Clear filters
resourceStore.clearFilters();
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| ResourceView | 338967+ |
| DayResourceView | 32171 |
| ResourceFilter | 338967 |
| ResourceModel | varies |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `resourceview/` | Side-by-side resource views |
| `date-resource/` | Date-resource matrix |
| `resource-avatars/` | Resource avatars |
| `multiassign/` | Multi-resource events |
| `customized-resourcefilter/` | Custom resource filter |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
