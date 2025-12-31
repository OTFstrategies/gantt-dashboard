# Calendar Deep Dive: Filtering

> **Fase 6** - Uitgebreide gids voor filtering in Calendar: eventStore filters, resourceStore filters, CollectionFilter, sidebar widgets en custom filter UI.

---

## Overzicht

De Bryntum Calendar ondersteunt uitgebreide filtering via store-level filters. Events en resources kunnen gefilterd worden met filterBy functies, property-based filters en UI widgets zoals ResourceFilter en custom filter widgets.

### Filter Componenten

| Component | Beschrijving |
|-----------|-------------|
| **Store.filter()** | Basis filter methode |
| **CollectionFilter** | Filter configuratie object |
| **ResourceFilter** | Sidebar widget voor resource filtering |
| **EventFilter** | Sidebar tekstfield voor event filtering |
| **Custom Filters** | Custom filter widgets |

---

## 1. TypeScript Interfaces

### CollectionFilterConfig (line 81723)

```typescript
// Bron: calendar.d.ts line 81723
type CollectionFilterConfig = {
    // Filter identifier
    id?: string;

    // Property-based filtering
    property?: string;
    value?: any;
    operator?: CollectionCompareOperator;

    // Function-based filtering
    filterBy?: (data: any) => boolean;

    // Nested filters
    children?: CollectionFilter[] | CollectionFilterConfig[];

    // Options
    caseSensitive?: boolean;
    disabled?: boolean;
    internal?: boolean;

    // Value conversion
    convert?: (value: any) => any;
};
```

### CollectionCompareOperator (line 1686)

```typescript
// Bron: calendar.d.ts line 1686
type CollectionCompareOperator =
    | '='          // Equal
    | '!='         // Not equal
    | '>'          // Greater than
    | '>='         // Greater than or equal
    | '<'          // Less than
    | '<='         // Less than or equal
    | '*'          // Contains (string)
    | 'startsWith' // Starts with
    | 'endsWith'   // Ends with
    | 'isIncludedIn'     // Value is in array
    | 'isNotIncludedIn'  // Value is not in array
    | 'includes'         // Array includes value
    | 'doesNotInclude'   // Array doesn't include
    | 'between'          // Between two values
    | 'empty'            // Is empty/null
    | 'notEmpty'         // Is not empty/null
    | 'sameDay'          // Same calendar day
    | 'sameMonth'        // Same calendar month
    | 'sameYear'         // Same calendar year
    ;
```

### Store Filter Methods

```typescript
// Store filter methods
interface Store {
    // Filters collection
    filters: Collection;
    isFiltered: boolean;

    // Filter methods
    filter(filter: CollectionFilterConfig | CollectionFilterConfig[]): void;
    filter(property: string, value: any): void;
    addFilter(filter: CollectionFilterConfig): CollectionFilter;
    removeFilter(filter: string | CollectionFilter): void;
    clearFilters(): void;

    // Events
    onFilter: ((event: {
        source: Store;
        filters: Collection;
        removed: Model[];
        added: Model[];
        records: Model[]
    }) => void) | string;

    onBeforeFilter: ((event: {
        source: Store;
        filters: Collection
    }) => void) | string;
}
```

### ResourceFilterConfig (line 338218)

```typescript
// Bron: calendar.d.ts line 338218
type ResourceFilterConfig = {
    type?: 'resourceFilter' | 'resourcefilter';

    // Selection
    multiSelect?: boolean;
    selected?: (string | number | ResourceModel)[];
    allowGroupSelect?: boolean;
    clearSelectionOnEmptySpaceClick?: boolean;

    // Store
    store?: Store | ResourceModel[];
    displayField?: string;

    // Filtering behavior
    filterResources?: boolean;
    eventStore?: EventStore;

    // Visual
    activateOnMouseover?: boolean;
    collapsibleGroups?: boolean;
    cls?: string | object;
    color?: string;

    // Events
    onSelectionChange?: ((event: {
        source: ResourceFilter;
        selected: ResourceModel[];
        deselected: ResourceModel[];
        selection: ResourceModel[]
    }) => void) | string;
};
```

---

## 2. Event Store Filtering

### Basis Filter met FilterBy

```javascript
// Bron: examples/filtering/app.module.js
const calendar = new Calendar({
    appendTo: 'container',

    tbar: {
        items: {
            filterByName: {
                type: 'textfield',
                placeholder: 'Find tasks by name',
                clearable: true,
                keyStrokeChangeDelay: 100,
                onChange: 'up.onNameFilterChange'
            }
        }
    },

    onNameFilterChange({ value }) {
        // Escape regex special characters
        value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Filter met uniek id (vervangt vorige filter met zelfde id)
        calendar.eventStore.filter({
            id: 'eventNameFilter',
            filterBy: event => event.name.match(new RegExp(value, 'i'))
        });
    }
});
```

### Property-Based Filter

```javascript
// Simpele property filter
calendar.eventStore.filter('status', 'confirmed');

// Met operator
calendar.eventStore.filter({
    property: 'duration',
    operator: '>=',
    value: 60  // Minimaal 60 minuten
});

// Case-insensitive string filter
calendar.eventStore.filter({
    property: 'name',
    value: 'meeting',
    operator: '*',  // Contains
    caseSensitive: false
});
```

### Meerdere Filters

```javascript
// Voeg meerdere filters toe
calendar.eventStore.filter([
    {
        id: 'statusFilter',
        property: 'status',
        value: 'confirmed'
    },
    {
        id: 'typeFilter',
        property: 'eventType',
        value: 'Meeting'
    }
]);

// Filters worden gecombineerd met AND logica
// Event moet aan BEIDE condities voldoen
```

### Complex FilterBy

```javascript
// Complex filter functie
calendar.eventStore.filter({
    id: 'complexFilter',
    filterBy: event => {
        // Alleen toekomstige events
        if (event.startDate < new Date()) {
            return false;
        }

        // Met minimaal 1 resource
        if (!event.resources.length) {
            return false;
        }

        // Niet de hele dag
        if (event.allDay) {
            return false;
        }

        return true;
    }
});
```

---

## 3. Resource Store Filtering

### Basis Resource Filter

```javascript
// Filter resources op naam
calendar.resourceStore.filter({
    id: 'nameFilter',
    property: 'name',
    value: 'John',
    operator: '*'
});

// Filter resources met events
calendar.resourceStore.filter({
    id: 'hasEventsFilter',
    filterBy: resource => resource.events.length > 0
});
```

### Filter Resources op Project

```javascript
// Bron: examples/filtering-advanced/app.module.js
// Filter resources die events hebben in geselecteerde projecten
resourceStore.filter({
    id: 'resourceFilter',
    filterBy: resource => resource.events.some(
        eventRecord => selected.includes(eventRecord.projectInstance)
    )
});
```

---

## 4. Sidebar Filter Widgets

### Event Filter (Standaard)

```javascript
const calendar = new Calendar({
    sidebar: {
        items: {
            // Standaard event filter textfield
            eventFilter: {
                // Configureer of verwijder
                // false = verbergen
                // null = verwijderen
                placeholder: 'Search events...',
                clearable: true
            }
        }
    }
});

// Of uitschakelen
sidebar: {
    items: {
        eventFilter: false  // Verberg standaard filter
    }
}
```

### Resource Filter Widget

```javascript
const calendar = new Calendar({
    sidebar: {
        items: {
            // Standaard ResourceFilter
            resourceFilter: {
                // Configuratie opties
                title: 'Resources',
                multiSelect: true,

                // Initial selection
                selected: [1, 2],  // Resource IDs

                // Filter ook resources (niet alleen events)
                filterResources: true,

                // Allow group selection
                allowGroupSelect: true
            }
        }
    }
});
```

### Custom Project Filter

```javascript
// Bron: examples/filtering-advanced/app.module.js
// Custom List subclass voor project filtering
class ProjectFilter extends List {
    static $name = 'ProjectFilter';
    static type = 'projectfilter';

    static configurable = {
        cls: 'b-resource-filter',
        multiSelect: true,
        displayField: 'name'
    };

    itemIconTpl(record, i) {
        // Custom icon template
        return List.prototype.itemIconTpl.call(this, ...arguments) +
            `<i class="${record.icon}"></i>`;
    }
}

// Registreer widget type
ProjectFilter.initClass();

// Gebruik in sidebar
sidebar: {
    items: {
        projects: {
            type: 'projectfilter',
            weight: 150,  // Volgorde
            store: projectStore,
            title: 'Projects',
            selected: [1],

            onSelectionChange({ selected }) {
                const { eventStore, resourceStore } = calendar;

                // Filter events op geselecteerde projecten
                eventStore.filter({
                    id: 'eventFilter',
                    filterBy: eventRecord =>
                        selected.includes(eventRecord.projectInstance)
                });

                // Filter resources met events in projecten
                resourceStore.filter({
                    id: 'resourceFilter',
                    filterBy: resource =>
                        resource.events.some(e =>
                            selected.includes(e.projectInstance)
                        )
                });
            }
        }
    }
}
```

---

## 5. Highlighting vs Filtering

### Event Highlighting

```javascript
// Bron: examples/filtering/app.module.js
tbar: {
    items: {
        highlight: {
            type: 'textfield',
            placeholder: 'Highlight tasks',
            clearable: true,
            onChange: 'up.onNameSearchChange'
        }
    }
},

onNameSearchChange({ value }) {
    value = value.toLowerCase();

    // Loop door alle events
    calendar.eventStore.forEach(task => {
        // cls is een DomClassList met add/remove methods
        if (value !== '' && task.name.toLowerCase().includes(value)) {
            task.cls.add('b-match');
        } else {
            task.cls.remove('b-match');
        }
    });

    // Refresh UI
    calendar.refresh();

    // Toggle highlighting class op calendar
    calendar.element.classList[value.length > 0 ? 'add' : 'remove']('b-highlighting');
}
```

### CSS voor Highlighting

```css
/* Highlight styling */
.b-cal-event-wrap.b-match {
    box-shadow: 0 0 0 2px var(--b-primary);
    z-index: 100;
}

/* Dim non-matching events */
.b-highlighting .b-cal-event-wrap:not(.b-match) {
    opacity: 0.3;
}

/* Animate highlight */
.b-cal-event-wrap.b-match {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
}
```

---

## 6. Filter Events

### Store Filter Event

```javascript
calendar.eventStore.on({
    // Voordat filter wordt toegepast
    beforeFilter({ filters }) {
        console.log('About to filter with:', filters.values);

        // Return false om te annuleren
        // return false;
    },

    // Na filter
    filter({ filters, removed, added, records }) {
        console.log('Filtered results:', records.length);
        console.log('Removed by filter:', removed.length);
        console.log('Added by filter:', added.length);

        // Update UI
        updateFilterStatus(records.length, removed.length);
    }
});
```

### Calendar-Level Filter Event

```javascript
const calendar = new Calendar({
    listeners: {
        // Data change event bevat filter actions
        dataChange({ store, action }) {
            if (action === 'filter') {
                console.log('Store filtered:', store.id);
                updateFilterIndicator();
            }
        }
    }
});
```

---

## 7. Filter Operators

### Comparison Operators

```javascript
// Gelijk aan
calendar.eventStore.filter({
    property: 'status',
    operator: '=',
    value: 'confirmed'
});

// Niet gelijk aan
calendar.eventStore.filter({
    property: 'status',
    operator: '!=',
    value: 'cancelled'
});

// Groter/kleiner dan
calendar.eventStore.filter({
    property: 'duration',
    operator: '>=',
    value: 30  // Min 30 minuten
});

// Tussen waarden
calendar.eventStore.filter({
    property: 'priority',
    operator: 'between',
    value: [1, 5]  // Priority 1-5
});
```

### String Operators

```javascript
// Contains (case-insensitive)
calendar.eventStore.filter({
    property: 'name',
    operator: '*',
    value: 'meeting',
    caseSensitive: false
});

// Starts with
calendar.eventStore.filter({
    property: 'name',
    operator: 'startsWith',
    value: 'Team'
});

// Ends with
calendar.eventStore.filter({
    property: 'name',
    operator: 'endsWith',
    value: 'Review'
});
```

### Array Operators

```javascript
// Value is in array
calendar.eventStore.filter({
    property: 'status',
    operator: 'isIncludedIn',
    value: ['confirmed', 'tentative']
});

// Value is NOT in array
calendar.eventStore.filter({
    property: 'eventType',
    operator: 'isNotIncludedIn',
    value: ['Holiday', 'Personal']
});

// Array property includes value
calendar.eventStore.filter({
    property: 'tags',
    operator: 'includes',
    value: 'urgent'
});
```

### Date Operators

```javascript
// Same day
calendar.eventStore.filter({
    property: 'startDate',
    operator: 'sameDay',
    value: new Date()  // Vandaag
});

// Same month
calendar.eventStore.filter({
    property: 'startDate',
    operator: 'sameMonth',
    value: new Date(2024, 5, 1)  // Juni 2024
});

// Same year
calendar.eventStore.filter({
    property: 'startDate',
    operator: 'sameYear',
    value: new Date()
});
```

### Empty/NotEmpty Operators

```javascript
// Has notes
calendar.eventStore.filter({
    property: 'notes',
    operator: 'notEmpty'
});

// No location set
calendar.eventStore.filter({
    property: 'location',
    operator: 'empty'
});
```

---

## 8. Nested Filters (AND/OR)

### OR Filter

```javascript
// Events die Meeting OF Workshop zijn
calendar.eventStore.filter({
    id: 'typeFilter',
    children: [
        { property: 'eventType', value: 'Meeting' },
        { property: 'eventType', value: 'Workshop' }
    ],
    operator: 'or'  // Default is 'and'
});
```

### AND Filter met OR Children

```javascript
// (Meeting OF Workshop) EN (status confirmed)
calendar.eventStore.filter({
    id: 'complexFilter',
    children: [
        {
            children: [
                { property: 'eventType', value: 'Meeting' },
                { property: 'eventType', value: 'Workshop' }
            ],
            operator: 'or'
        },
        { property: 'status', value: 'confirmed' }
    ],
    operator: 'and'
});
```

---

## 9. Filter Management

### Filter Toevoegen/Verwijderen

```javascript
// Voeg filter toe
const filter = calendar.eventStore.addFilter({
    id: 'myFilter',
    filterBy: event => event.priority > 3
});

// Verwijder filter op id
calendar.eventStore.removeFilter('myFilter');

// Of verwijder filter instance
calendar.eventStore.removeFilter(filter);

// Verwijder alle filters
calendar.eventStore.clearFilters();
```

### Filter Status Controleren

```javascript
// Check of store gefilterd is
if (calendar.eventStore.isFiltered) {
    console.log('Events are filtered');
    console.log('Active filters:', calendar.eventStore.filters.count);
}

// Haal alle filters op
calendar.eventStore.filters.forEach(filter => {
    console.log('Filter:', filter.id, filter);
});

// Haal specifieke filter op
const filter = calendar.eventStore.filters.get('myFilter');
if (filter) {
    filter.disabled = true;  // Disable filter
    calendar.eventStore.filter();  // Re-apply filters
}
```

### Disable/Enable Filter

```javascript
// Disable filter tijdelijk
const filter = calendar.eventStore.filters.get('myFilter');
filter.disabled = true;
calendar.eventStore.filter();  // Re-apply

// Enable weer
filter.disabled = false;
calendar.eventStore.filter();
```

---

## 10. Internal Filters

### Permanente Interne Filters

```javascript
// Internal filter wordt niet verwijderd door clearFilters()
calendar.eventStore.filter({
    id: 'internalFilter',
    internal: true,  // Markeer als internal
    filterBy: event => !event.cancelled
});

// clearFilters() verwijdert deze NIET
calendar.eventStore.clearFilters();

// Alleen expliciet verwijderen werkt
calendar.eventStore.removeFilter('internalFilter');
```

---

## 11. Filter UI Patterns

### Filter Toolbar

```javascript
const calendar = new Calendar({
    tbar: {
        items: {
            // Status filter dropdown
            statusFilter: {
                type: 'combo',
                weight: 600,
                label: 'Status',
                editable: false,
                clearable: true,
                store: {
                    data: [
                        { id: 'all', text: 'All' },
                        { id: 'confirmed', text: 'Confirmed' },
                        { id: 'tentative', text: 'Tentative' },
                        { id: 'cancelled', text: 'Cancelled' }
                    ]
                },
                onChange({ value }) {
                    if (!value || value === 'all') {
                        calendar.eventStore.removeFilter('statusFilter');
                    } else {
                        calendar.eventStore.filter({
                            id: 'statusFilter',
                            property: 'status',
                            value
                        });
                    }
                }
            },

            // Date range filter
            dateFilter: {
                type: 'daterangefield',
                weight: 610,
                label: 'Date range',
                onChange({ value }) {
                    if (!value || !value.startDate) {
                        calendar.eventStore.removeFilter('dateFilter');
                    } else {
                        calendar.eventStore.filter({
                            id: 'dateFilter',
                            filterBy: event =>
                                event.startDate >= value.startDate &&
                                event.endDate <= value.endDate
                        });
                    }
                }
            },

            // Clear all filters button
            clearFilters: {
                type: 'button',
                weight: 620,
                icon: 'b-icon-clear',
                tooltip: 'Clear all filters',
                onClick() {
                    calendar.eventStore.clearFilters();
                    // Reset UI
                    calendar.widgetMap.statusFilter.value = 'all';
                    calendar.widgetMap.dateFilter.value = null;
                }
            }
        }
    }
});
```

### Filter Indicator

```javascript
// Toon filter indicator
function updateFilterIndicator() {
    const { eventStore } = calendar;
    const indicator = calendar.widgetMap.filterIndicator;

    if (eventStore.isFiltered) {
        const total = eventStore.originalCount || eventStore.count;
        const filtered = eventStore.count;
        indicator.html = `Showing ${filtered} of ${total} events`;
        indicator.hidden = false;
    } else {
        indicator.hidden = true;
    }
}

// Luister naar filter changes
calendar.eventStore.on('filter', updateFilterIndicator);
```

---

## 12. Remote Filtering

### Server-Side Filtering

```javascript
const calendar = new Calendar({
    crudManager: {
        loadUrl: '/api/events',
        autoLoad: true,

        eventStore: {
            // Remote filtering
            remoteFilter: true,

            // Filter parameter naam
            filterParamName: 'filter'
        }
    }
});

// Filter wordt naar server gestuurd
calendar.eventStore.filter({
    property: 'status',
    value: 'confirmed'
});

// Request: /api/events?filter=[{"property":"status","value":"confirmed"}]
```

### Custom Filter Encoding

```javascript
eventStore: {
    remoteFilter: true,

    // Custom filter encoding
    encodeFilterParams(filters) {
        // Custom format voor backend
        return filters.map(f => ({
            field: f.property,
            op: f.operator,
            val: f.value
        }));
    }
}
```

---

## 13. Performance Optimizations

### Batch Filtering

```javascript
// Suspend events during batch updates
calendar.eventStore.suspendEvents();

// Voeg meerdere filters toe
calendar.eventStore.addFilter({ id: 'filter1', ... });
calendar.eventStore.addFilter({ id: 'filter2', ... });
calendar.eventStore.addFilter({ id: 'filter3', ... });

// Resume en trigger één filter event
calendar.eventStore.resumeEvents();
calendar.eventStore.filter();
```

### Debounced Filtering

```javascript
// Debounce filter bij text input
let filterTimeout;

function debouncedFilter(value) {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        calendar.eventStore.filter({
            id: 'searchFilter',
            filterBy: event => event.name.toLowerCase().includes(value.toLowerCase())
        });
    }, 300);  // 300ms debounce
}

// TextField met keyStrokeChangeDelay
{
    type: 'textfield',
    keyStrokeChangeDelay: 300,  // Ingebouwde debounce
    onChange: ({ value }) => {
        // Wordt pas getriggerd na 300ms inactiviteit
        applyFilter(value);
    }
}
```

---

## 14. Custom Relations Filtering

### Filter op Gerelateerde Records

```javascript
// Bron: examples/filtering-advanced/app.module.js
// Custom Task model met project relatie
class Task extends EventModel {
    static $name = 'Task';

    static fields = [
        { name: 'projectId' }
    ];

    static relations = {
        projectInstance: {
            foreignKey: 'projectId',
            foreignStore: 'projectStore',
            relatedCollectionName: 'events'
        }
    };
}

// Filter events op gerelateerde projecten
eventStore.filter({
    id: 'projectFilter',
    filterBy: eventRecord => selectedProjects.includes(eventRecord.projectInstance)
});
```

---

## 15. Testing Filters

### Unit Test Pattern

```javascript
describe('Event Filtering', () => {
    let calendar, eventStore;

    beforeEach(() => {
        calendar = new Calendar({
            events: [
                { id: 1, name: 'Meeting A', status: 'confirmed' },
                { id: 2, name: 'Meeting B', status: 'tentative' },
                { id: 3, name: 'Workshop', status: 'confirmed' }
            ]
        });
        eventStore = calendar.eventStore;
    });

    afterEach(() => {
        calendar.destroy();
    });

    it('should filter by property', () => {
        eventStore.filter('status', 'confirmed');

        expect(eventStore.count).toBe(2);
        expect(eventStore.isFiltered).toBe(true);
    });

    it('should filter by filterBy function', () => {
        eventStore.filter({
            filterBy: event => event.name.includes('Meeting')
        });

        expect(eventStore.count).toBe(2);
    });

    it('should clear filters', () => {
        eventStore.filter('status', 'confirmed');
        eventStore.clearFilters();

        expect(eventStore.count).toBe(3);
        expect(eventStore.isFiltered).toBe(false);
    });

    it('should replace filter with same id', () => {
        eventStore.filter({ id: 'statusFilter', property: 'status', value: 'confirmed' });
        expect(eventStore.count).toBe(2);

        eventStore.filter({ id: 'statusFilter', property: 'status', value: 'tentative' });
        expect(eventStore.count).toBe(1);
    });
});
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| CollectionFilterConfig | 81723 |
| CollectionCompareOperator | 1686 |
| Store.filter event | 66402 |
| ResourceFilterConfig | 338218 |
| ResourceFilter class | 339144 |

---

## Relevante Examples

| Example | Beschrijving |
|---------|-------------|
| `filtering/` | Basis event filtering met highlight |
| `filtering-advanced/` | Custom ProjectFilter, relaties |
| `sidebar-customization/` | Sidebar filter widgets |
| `resourceview/` | Resource filtering in ResourceView |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
