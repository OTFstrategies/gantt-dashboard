# CALENDAR-IMPL-RESOURCES.md
## Bryntum Calendar - Resources & Assignments Systeem

### Overzicht

Dit document beschrijft het Resource en Assignment systeem in Bryntum Calendar. Resources representeren personen, kamers, apparatuur of andere entiteiten waaraan events kunnen worden toegewezen. Het systeem ondersteunt zowel single-assignment als multi-assignment scenarios.

---

## 1. TypeScript Interfaces

### 1.1 ResourceModelConfig (regel 264494)
```typescript
type ResourceModelConfig = {
    // Identificatie
    id?: string|number                          // Unieke identifier
    name?: string                               // Resource naam

    // Visuele eigenschappen
    eventColor?: EventColor                     // Kleur voor events van deze resource
    eventStyle?: 'tonal'|'filled'|'bordered'|'traced'|'outlined'|
                 'indented'|'line'|'dashed'|'minimal'|'rounded'|
                 'calendar'|'interday'|'gantt'|null
    iconCls?: string                            // Icon class voor tree/list

    // Avatar/Image
    image?: string|boolean                      // Relative image path of false om uit te schakelen
    imageUrl?: string                           // Absolute image URL
    showAvatar?: boolean                        // Avatar tonen (default: true)

    // Layout
    allowOverlap?: boolean                      // Overlappende events toestaan (default: true)
    barMargin?: number                          // Marge tussen event bars (px)
    columnWidth?: number                        // Breedte in vertical mode (px)
    resourceMargin?: number|ResourceMarginConfig // Marge rond events
    rowHeight?: number                          // Hoogte van resource row (px)

    // Event layout
    eventLayout?: 'stack'|'pack'|'mixed'|'none' // Event layout mode

    // Hiërarchie (voor tree)
    children?: boolean|object[]|Model[]|ModelConfig[]
    expanded?: boolean                          // Start expanded (tree)
    parentId?: string|number|null               // Parent node ID

    // Status
    readOnly?: boolean                          // UI read-only
    cls?: string                                // CSS classes voor row

    // Link
    href?: string                               // Link URL
    target?: '_self'|'_blank'|'_parent'|'_top'|null
}
```

### 1.2 ResourceModel Class (regel 264653)
```typescript
export class ResourceModel extends GridRowModel {
    static readonly isResourceModel: boolean
    static readonly isResourceModelMixin: boolean

    // Properties
    allowOverlap: boolean
    assignments: AssignmentModel[]              // Alle assignments (readonly)
    barMargin: number
    columnWidth: number
    eventColor: EventColor
    eventLayout: 'stack'|'pack'|'mixed'|'none'
    eventStore: EventStore                      // Gekoppelde EventStore (readonly)
    events: EventModel[]                        // Alle toegewezen events (readonly)
    image: string|boolean
    imageUrl: string
    isPersistable: boolean
    name: string

    // Methods
    getEvents(): EventModel[]
    isAbove(otherResource: ResourceModel): boolean
    isAvailable(start: Date, end: Date, excludeEvent?: EventModel): boolean
    unassign(event: EventModel): void
    unassignAll(): void
}
```

### 1.3 ResourceStoreConfig (regel 236162)
```typescript
type ResourceStoreConfig = {
    // Data
    data?: object[]|Model[]|ModelConfig[]       // Initiële data
    modelClass?: typeof ResourceModel           // Model class

    // CRUD URLs
    createUrl?: string                          // POST URL voor nieuwe resources
    readUrl?: string                            // GET URL voor laden
    updateUrl?: string                          // PUT/PATCH URL voor updates
    deleteUrl?: string                          // DELETE URL

    // Auto behavior
    autoLoad?: boolean                          // Auto laden bij init
    autoCommit?: boolean                        // Auto opslaan
    autoCommitTimeout?: number                  // Delay voor auto commit (ms)
    autoTree?: boolean                          // Auto tree detectie

    // Filtering
    filters?: CollectionFilterConfig|CollectionFilterConfig[]
    filterParamName?: string                    // Query param naam voor filters

    // Sorting
    sorters?: object[]|string[]
    sortParamName?: string

    // Tree
    tree?: boolean                              // Tree mode
    rootNode?: object                           // Root node data

    // Chaining
    chainFilters?: boolean
    chainedFilterFn?: (record: Model) => boolean
    masterStore?: Store                         // Master store voor chaining

    // Listeners
    listeners?: object
}
```

### 1.4 AssignmentModelConfig
```typescript
type AssignmentModelConfig = {
    id?: string|number
    eventId: string|number                      // Reference naar EventModel
    resourceId: string|number                   // Reference naar ResourceModel
}
```

---

## 2. Data Structuur

### 2.1 JSON Data Format
```json
{
  "success": true,
  "resources": {
    "rows": [
      {
        "id": "r1",
        "name": "Meeting Room A",
        "eventColor": "blue",
        "image": "room-a.png"
      },
      {
        "id": "r2",
        "name": "Meeting Room B",
        "eventColor": "green"
      }
    ]
  },
  "events": {
    "rows": [
      {
        "id": 1,
        "startDate": "2024-01-15T09:00",
        "endDate": "2024-01-15T10:00",
        "name": "Team Meeting",
        "resourceId": "r1"
      }
    ]
  }
}
```

### 2.2 Multi-Assignment Data Format
```json
{
  "resources": {
    "rows": [
      { "id": "r1", "name": "Alice", "eventColor": "red" },
      { "id": "r2", "name": "Bob", "eventColor": "blue" },
      { "id": "r3", "name": "Carol", "eventColor": "green" }
    ]
  },
  "events": {
    "rows": [
      {
        "id": 1,
        "startDate": "2024-01-15T09:00",
        "endDate": "2024-01-15T10:00",
        "name": "Group Meeting"
      }
    ]
  },
  "assignments": {
    "rows": [
      { "id": 1, "eventId": 1, "resourceId": "r1" },
      { "id": 2, "eventId": 1, "resourceId": "r2" },
      { "id": 3, "eventId": 1, "resourceId": "r3" }
    ]
  }
}
```

---

## 3. Calendar Resource Configuratie

### 3.1 ResourceImagePath
```typescript
const calendar = new Calendar({
    // Basis path voor resource avatars
    resourceImagePath: '../images/users/',

    crudManager: {
        loadUrl: 'data/data.json',
        autoLoad: true
    }
});
```

### 3.2 Resource Filter in Sidebar
```typescript
const calendar = new Calendar({
    sidebar: {
        items: {
            resourceFilter: {
                // Titel boven filter
                title: 'Resources',

                // Initieel geselecteerde resource IDs
                selected: [2, 3, 4],

                // Custom filter functie
                filter: resource => resource.active !== false
            }
        }
    }
});
```

### 3.3 Multi-assign Configuratie
```typescript
const calendar = new Calendar({
    // Event kleur baseren op eerste gefilterde resource
    filterEventResources: true,

    modes: {
        week: {
            // Resource avatars tonen op events
            showResourceAvatars: 'last'     // 'first', 'last', of false
        }
    },

    modeDefaults: {
        eventRenderer({ renderData, eventRecord, view }) {
            // Custom rendering voor multi-assigned events
            if (eventRecord.resources?.length > 1) {
                // Gradient background met alle resource kleuren
                const gradient = eventRecord.resources.map((r, i) => {
                    const color = view.createColorValue(r.eventColor);
                    return `${color} ${i * 20}px, ${color} ${i * 20 + 20}px`;
                }).join(', ');

                renderData.eventBackground =
                    `repeating-linear-gradient(135deg, ${gradient})`;
                renderData.textColor = '#606060';
            }
        }
    }
});
```

---

## 4. Resource Filtering

### 4.1 Programmatische Resource Filtering
```typescript
// Filter op resource eigenschap
calendar.resourceStore.filter({
    id: 'activeFilter',
    filterBy: resource => resource.active === true
});

// Filter op resource naam
calendar.resourceStore.filter({
    id: 'nameFilter',
    filterBy: resource => resource.name.toLowerCase().includes(searchTerm)
});

// Filter verwijderen
calendar.resourceStore.removeFilter('activeFilter');

// Alle filters clearen
calendar.resourceStore.clearFilters();
```

### 4.2 Sidebar Resource Filter
```typescript
const calendar = new Calendar({
    sidebar: {
        items: {
            resourceFilter: {
                // Welke resources initieel geselecteerd zijn
                selected: ['r1', 'r2', 'r3'],

                // Selection change handler
                onSelectionChange({ selected }) {
                    console.log('Selected resources:', selected);
                }
            }
        }
    }
});

// Programmatisch selecteren/deselecteren
const { resourceFilter } = calendar.widgetMap;

// Resource toevoegen aan selectie
resourceFilter.selected.add(resource);

// Resource verwijderen uit selectie
resourceFilter.selected.remove(resource);

// Alle selecteren
resourceFilter.selectAll();

// Alle deselecteren
resourceFilter.deselectAll();
```

### 4.3 Event Filtering op Resource
```typescript
// Filter events op specifieke resources
calendar.eventStore.filter({
    id: 'resourceEventFilter',
    filterBy: event => {
        // Single assignment check
        if (event.resourceId) {
            return selectedResourceIds.includes(event.resourceId);
        }
        // Multi-assignment check
        return event.resources?.some(r =>
            selectedResourceIds.includes(r.id)
        );
    }
});
```

---

## 5. Custom ResourceModel

### 5.1 Extended ResourceModel
```typescript
class CustomResource extends ResourceModel {
    static get fields() {
        return [
            // Extra velden
            { name: 'department', type: 'string' },
            { name: 'email', type: 'string' },
            { name: 'phone', type: 'string' },
            { name: 'skills', type: 'array' },
            { name: 'hourlyRate', type: 'number', defaultValue: 0 },
            { name: 'active', type: 'boolean', defaultValue: true },

            // Computed field
            {
                name: 'displayName',
                persist: false,
                calculate: (data) => `${data.name} (${data.department})`
            }
        ];
    }

    // Custom method
    hasSkill(skill: string): boolean {
        return this.skills?.includes(skill) ?? false;
    }

    // Availability check met business logic
    isAvailableFor(event: EventModel): boolean {
        if (!this.active) return false;
        return this.isAvailable(event.startDate, event.endDate, event);
    }
}

// Gebruik in Calendar
const calendar = new Calendar({
    crudManager: {
        resourceStore: {
            modelClass: CustomResource
        }
    }
});
```

### 5.2 Resource met Tree Structuur
```typescript
class HierarchicalResource extends ResourceModel {
    static get fields() {
        return [
            { name: 'level', type: 'string' },    // 'department', 'team', 'person'
            { name: 'managerId', type: 'auto' },
            { name: 'capacity', type: 'number', defaultValue: 100 }
        ];
    }
}

// Tree data
const resourceData = [
    {
        id: 'dept1',
        name: 'Engineering',
        level: 'department',
        expanded: true,
        children: [
            {
                id: 'team1',
                name: 'Frontend Team',
                level: 'team',
                children: [
                    { id: 'p1', name: 'Alice', level: 'person' },
                    { id: 'p2', name: 'Bob', level: 'person' }
                ]
            }
        ]
    }
];
```

---

## 6. ResourceView Integratie

### 6.1 Resource per Column
```typescript
const calendar = new Calendar({
    modes: {
        day: null,
        week: null,
        month: null,
        year: null,
        agenda: null,

        resourceWeek: {
            type: 'resource',
            title: 'Resources',
            resourceWidth: '30em',

            // Configuratie voor elke resource subview
            view: {
                type: 'week',
                dayStartTime: 8,
                dayEndTime: 18
            },

            // Extra info onder resource naam
            meta: resource => resource.department
        }
    }
});
```

### 6.2 Resource Header Customization
```typescript
const calendar = new Calendar({
    modeDefaults: {
        view: {
            strips: {
                resourceInfo: {
                    type: 'widget',
                    dock: 'header',
                    cls: 'b-resource-info',
                    html: 'up.getResourceHeader'
                }
            }
        }
    },

    getResourceHeader(widget) {
        const resource = widget.owner.resource;
        return `
            <div class="resource-details">
                <img src="${resource.imageUrl}" alt="${resource.name}"/>
                <span class="name">${resource.name}</span>
                <span class="dept">${resource.department}</span>
            </div>
        `;
    }
});
```

---

## 7. Resource Store Operaties

### 7.1 CRUD Operaties
```typescript
const { resourceStore } = calendar;

// Create
const newResource = resourceStore.add({
    name: 'New Employee',
    eventColor: 'blue',
    department: 'Sales'
});

// Read
const resource = resourceStore.getById('r1');
const allResources = resourceStore.records;

// Update
resource.name = 'Updated Name';
resource.set({
    department: 'Marketing',
    eventColor: 'red'
});

// Delete
resourceStore.remove(resource);
// of
resource.remove();

// Bulk operaties
resourceStore.add([
    { name: 'Resource A' },
    { name: 'Resource B' }
]);

resourceStore.remove([resource1, resource2]);
```

### 7.2 Events & Listeners
```typescript
const calendar = new Calendar({
    crudManager: {
        resourceStore: {
            listeners: {
                // Resource toegevoegd
                add({ records }) {
                    console.log('Added:', records);
                },

                // Resource verwijderd
                remove({ records }) {
                    console.log('Removed:', records);
                },

                // Resource gewijzigd
                update({ record, changes }) {
                    console.log('Updated:', record.name, changes);
                },

                // Store geladen
                load({ source }) {
                    console.log('Loaded', source.count, 'resources');
                },

                // Filtering gewijzigd
                filter({ filters }) {
                    console.log('Filters applied:', filters);
                }
            }
        }
    }
});
```

---

## 8. Resource Availability

### 8.1 Availability Check
```typescript
// Check of resource beschikbaar is
const resource = calendar.resourceStore.getById('r1');
const isAvailable = resource.isAvailable(
    new Date('2024-01-15T09:00'),
    new Date('2024-01-15T10:00'),
    excludeEvent  // Optioneel: event om te negeren
);

if (!isAvailable) {
    console.log('Resource is niet beschikbaar');
}
```

### 8.2 Events ophalen
```typescript
// Alle events voor resource
const events = resource.events;

// Of via method
const events = resource.getEvents();

// Gefilterd op datum
const eventsInRange = events.filter(e =>
    e.startDate >= rangeStart && e.endDate <= rangeEnd
);
```

---

## 9. Implementatie Richtlijnen

### 9.1 Eigen Resource Systeem
```typescript
interface Resource {
    id: string | number;
    name: string;
    eventColor?: string;
    image?: string;
    department?: string;
    active: boolean;
}

interface Assignment {
    id: string | number;
    eventId: string | number;
    resourceId: string | number;
}

class ResourceManager {
    private resources: Map<string, Resource> = new Map();
    private assignments: Map<string, Assignment> = new Map();

    addResource(resource: Resource): void {
        this.resources.set(String(resource.id), resource);
        this.emit('resourceAdd', { resource });
    }

    removeResource(id: string): void {
        const resource = this.resources.get(id);
        if (resource) {
            // Verwijder gerelateerde assignments
            this.getAssignmentsForResource(id).forEach(a => {
                this.assignments.delete(String(a.id));
            });
            this.resources.delete(id);
            this.emit('resourceRemove', { resource });
        }
    }

    assignEventToResource(eventId: string, resourceId: string): Assignment {
        const id = `${eventId}-${resourceId}`;
        const assignment = { id, eventId, resourceId };
        this.assignments.set(id, assignment);
        this.emit('assign', { assignment });
        return assignment;
    }

    unassign(eventId: string, resourceId: string): void {
        const id = `${eventId}-${resourceId}`;
        const assignment = this.assignments.get(id);
        if (assignment) {
            this.assignments.delete(id);
            this.emit('unassign', { assignment });
        }
    }

    getResourcesForEvent(eventId: string): Resource[] {
        return [...this.assignments.values()]
            .filter(a => a.eventId === eventId)
            .map(a => this.resources.get(String(a.resourceId))!)
            .filter(Boolean);
    }

    getAssignmentsForResource(resourceId: string): Assignment[] {
        return [...this.assignments.values()]
            .filter(a => a.resourceId === resourceId);
    }

    isResourceAvailable(
        resourceId: string,
        start: Date,
        end: Date,
        excludeEventId?: string
    ): boolean {
        const events = this.getEventsForResource(resourceId);
        return !events.some(event => {
            if (excludeEventId && event.id === excludeEventId) return false;
            return event.startDate < end && event.endDate > start;
        });
    }
}
```

### 9.2 Resource Color System
```typescript
type EventColor = 'red'|'pink'|'purple'|'violet'|'indigo'|'blue'|
                  'cyan'|'teal'|'green'|'lime'|'yellow'|'orange'|
                  'deep-orange'|'gray'|'magenta';

class ResourceColorManager {
    private defaultColors: EventColor[] = [
        'blue', 'green', 'red', 'purple', 'orange',
        'teal', 'cyan', 'indigo', 'pink', 'lime'
    ];

    private colorIndex = 0;

    getNextColor(): EventColor {
        const color = this.defaultColors[this.colorIndex];
        this.colorIndex = (this.colorIndex + 1) % this.defaultColors.length;
        return color;
    }

    getContrastColor(eventColor: EventColor): string {
        const darkColors = ['purple', 'indigo', 'blue', 'deep-orange'];
        return darkColors.includes(eventColor) ? '#ffffff' : '#333333';
    }

    createGradient(colors: EventColor[]): string {
        if (colors.length === 1) {
            return this.toHex(colors[0]);
        }

        const stops = colors.map((c, i) => {
            const percent = (i / (colors.length - 1)) * 100;
            return `${this.toHex(c)} ${percent}%`;
        });

        return `linear-gradient(135deg, ${stops.join(', ')})`;
    }
}
```

---

## 10. Gerelateerde Bestanden

### Bryntum Source Files
- `calendar.d.ts` regel 264494-264646: ResourceModelConfig
- `calendar.d.ts` regel 264653-264689: ResourceModel class
- `calendar.d.ts` regel 236162-236307: ResourceStoreConfig
- `calendar.d.ts` regel 56396: ResourceViewConfig

### Example Folders
- `examples/filtering/` - Event en resource filtering
- `examples/multiassign/` - Multi-assignment configuratie
- `examples/resourceview/` - ResourceView met meerdere resources
- `examples/basic/` - Standaard resource configuratie

---

## 11. Samenvatting

Het Resource systeem biedt:

1. **ResourceModel**: Uitbreidbaar model met eigenschappen voor naam, kleur, avatar, layout
2. **Multi-assignment**: Via AssignmentModel voor events met meerdere resources
3. **ResourceStore**: CRUD operaties, filtering, sorting, tree support
4. **Sidebar Filter**: Ingebouwde UI voor resource selectie
5. **ResourceView**: Parallelle weergave per resource
6. **Availability**: isAvailable() voor beschikbaarheidscontrole
7. **Custom Fields**: Eenvoudig uitbreidbaar via static fields

Belangrijke implementatie-aspecten:
- Resources zijn standalone en worden gekoppeld via assignments of direct resourceId
- EventColor propagates naar events tenzij event eigen kleur heeft
- filterEventResources bepaalt welke resource kleur wordt gebruikt bij multi-assign
- showResourceAvatars toont avatars op event blocks
