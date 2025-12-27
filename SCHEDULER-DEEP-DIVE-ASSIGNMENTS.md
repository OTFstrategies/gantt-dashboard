# SchedulerPro Deep Dive: Assignments

> **Uitgebreide analyse** van het Bryntum SchedulerPro AssignmentModel: multi-assignment, units, effort, scheduling modes, en assignment management.

---

## Overzicht

Het AssignmentModel in SchedulerPro vormt de koppeling tussen Events en Resources. Het biedt:
- **Event-Resource binding** - eventId, resourceId
- **Units (allocation)** - percentage van resource toewijzing
- **Effort** - werkuren per assignment
- **Scheduling modes** - Normal, FixedDuration
- **Time-phased assignments** - startDate/endDate per assignment
- **Costing** - rate tables, cost berekening

---

## 1. Assignment Basis

### 1.1 Core Fields

```javascript
{
    id         : 1,
    eventId    : 'e1',     // OF: event: 'e1'
    resourceId : 'r1',     // OF: resource: 'r1'
    units      : 100       // 100% toewijzing
}
```

### 1.2 Data Structuur

```javascript
{
    assignments : [
        // Eén resource per event
        { id: 1, event: 1, resource: 'r1' },

        // Multi-assignment: één event, meerdere resources
        { id: 2, event: 2, resource: 'r1' },
        { id: 3, event: 2, resource: 'r2' },

        // Met units (gedeeltelijke toewijzing)
        { id: 4, event: 3, resource: 'r1', units: 50 },
        { id: 5, event: 3, resource: 'r2', units: 50 }
    ]
}
```

### 1.3 Field Definities

```typescript
interface AssignmentModelFields {
    // Identificatie
    id: string | number;

    // Koppelingen
    eventId: string | number;
    resourceId: string | number;
    // Alternatief (niet persistent)
    event: EventModel | string | number;
    resource: ResourceModel | string | number;

    // Allocation
    units: number;              // Percentage (0-100+)

    // Effort
    effort: number;             // Werkuren

    // Time-phased (Gantt only)
    startDate: Date;
    endDate: Date;

    // Costing
    cost: number;
    rateTable: string | number;
    quantity: number;           // Material resources

    // Behavior
    drawDependencies: boolean;
}
```

---

## 2. Multi-Assignment

### 2.1 Meerdere Resources per Event

```javascript
// Data
{
    events : [
        { id: 1, name: 'Team Meeting', startDate: '2024-01-15', duration: 2 }
    ],
    assignments : [
        { id: 1, event: 1, resource: 'alice' },
        { id: 2, event: 1, resource: 'bob' },
        { id: 3, event: 1, resource: 'charlie' }
    ]
}
```

### 2.2 Programmatisch Toewijzen

```javascript
// Via event
await eventRecord.assign('r1');               // Single resource
await eventRecord.assign(['r1', 'r2', 'r3']); // Multiple resources

// Met vervanging
await eventRecord.assign('r2', true);         // Replace all existing

// Via resource
eventRecord.resource = resourceRecord;        // Set single
eventRecord.resources = [r1, r2, r3];         // Set multiple
```

### 2.3 Assignment Store API

```javascript
const store = scheduler.assignmentStore;

// Add assignment
store.add({
    eventId    : 'e1',
    resourceId : 'r1',
    units      : 100
});

// Bulk add
store.add([
    { eventId: 'e2', resourceId: 'r1' },
    { eventId: 'e2', resourceId: 'r2' }
]);

// Query
const eventAssignments = store.query(a => a.eventId === 'e1');
const resourceAssignments = store.getAssignmentsForResource('r1');
const forEvent = store.getAssignmentsForEvent('e1');
```

---

## 3. Units (Allocation Percentage)

### 3.1 Concept

Units geeft aan hoeveel van de resource's tijd aan het event wordt besteed:
- **100** = 100% (full-time)
- **50** = 50% (half-time)
- **200** = 200% (over-allocatie, 2 FTE equivalent)

```javascript
{
    id       : 1,
    event    : 'e1',
    resource : 'r1',
    units    : 50         // Resource werkt 50% van tijd aan dit event
}
```

### 3.2 Impact op Effort

In FixedDuration mode:
- `effort = duration * units / 100`

```javascript
// Event van 8 uur met 50% allocatie
// effort = 8 * 50 / 100 = 4 uur werk
{
    event  : { duration: 8, durationUnit: 'hour', schedulingMode: 'FixedDuration' },
    assignment : { units: 50 }
    // Resulteert in 4 uur effort voor deze assignment
}
```

### 3.3 Aanpassen Units

```javascript
// Direct
assignment.units = 75;

// Async (triggers recalculation)
await assignment.setAsync('units', 75);
```

---

## 4. Effort

### 4.1 Effort Field

Effort is het werkelijke aantal werkuren voor de assignment:

```javascript
{
    id       : 1,
    event    : 'e1',
    resource : 'r1',
    effort   : 16         // 16 werkuren
}
```

### 4.2 Effort Berekening

```javascript
// Event met effort
{
    id             : 1,
    name           : 'Development',
    duration       : 4,              // 4 dagen
    effort         : 144,            // 144 uur totaal
    schedulingMode : 'FixedDuration'
}

// Assignments die effort delen
{
    assignments : [
        { event: 1, resource: 'r1', units: 50 },  // 72 uur
        { event: 1, resource: 'r2', units: 50 }   // 72 uur
    ]
}
```

### 4.3 effortDriven Events

```javascript
// Als effortDriven = true:
// - Voeg resource toe → duration daalt
// - Verwijder resource → duration stijgt
// - Effort blijft constant

{
    id           : 1,
    effort       : 80,
    effortDriven : true,
    schedulingMode : 'FixedDuration'
}
```

---

## 5. Scheduling Modes

### 5.1 Normal Mode (Default)

```javascript
{
    id             : 1,
    name           : 'Task',
    startDate      : '2024-01-15',
    duration       : 5,
    schedulingMode : 'Normal'       // Of niet specificeren
}
```

In Normal mode:
- Duration is vast
- Effort wordt niet berekend
- Units hebben geen effect op duration

### 5.2 FixedDuration Mode

```javascript
{
    id             : 1,
    name           : 'Task',
    duration       : 4,
    effort         : 144,
    schedulingMode : 'FixedDuration'
}
```

In FixedDuration mode:
- Duration is vast
- Effort wordt verdeeld over resources
- Units beïnvloeden effort per resource

### 5.3 Custom EventModel met Default Mode

```javascript
import { EventModel } from '@bryntum/schedulerpro';

class FixedDurationEvent extends EventModel {
    static fields = [
        { name: 'schedulingMode', defaultValue: 'FixedDuration' }
    ];
}

const scheduler = new SchedulerPro({
    project : {
        eventModelClass : FixedDurationEvent
    }
});
```

---

## 6. Resources Tab (Task Editor)

### 6.1 Activeren

```javascript
const scheduler = new SchedulerPro({
    features : {
        taskEdit : {
            items : {
                // Resources combo op General tab uitschakelen
                generalTab : {
                    items : {
                        resourcesField : false
                    }
                },
                // Resources tab toevoegen
                resourcesTab : {
                    type      : 'resourcestab',
                    weight    : 400,
                    showUnits : true     // Toon Units kolom
                }
            }
        }
    }
});
```

### 6.2 Resources Tab Features

- Grid met alle assignments voor het event
- Add/Remove resources
- Edit units per resource
- Effort berekening zichtbaar

---

## 7. Assignment API

### 7.1 Properties

```javascript
// References
assignment.event;          // Event model
assignment.resource;       // Resource model
assignment.eventId;        // Event ID
assignment.resourceId;     // Resource ID

// Convenience
assignment.eventName;      // Event name (read-only)
assignment.resourceName;   // Resource name (read-only)

// Values
assignment.units;          // Allocation percentage
assignment.effort;         // Work hours
assignment.cost;           // Calculated cost

// State
assignment.isPersistable;  // Can be saved
assignment.isAssignmentModel; // Type check
```

### 7.2 Methods

```javascript
// Get resource
const resource = assignment.getResource();

// Async update
await assignment.setAsync('units', 75);
await assignment.setAsync({
    units  : 75,
    effort : 40
});

// String representation
console.log(assignment.toString()); // "Mike 50%"
```

---

## 8. Assignment Store

### 8.1 Configuratie

```javascript
const scheduler = new SchedulerPro({
    project : {
        assignmentStore : {
            modelClass : CustomAssignmentModel,
            listeners  : {
                add({ records }) {
                    console.log('Assignments added:', records);
                },
                remove({ records }) {
                    console.log('Assignments removed:', records);
                }
            }
        }
    }
});
```

### 8.2 API Methods

```javascript
const store = scheduler.assignmentStore;

// Queries
store.getAssignmentsForEvent(eventRecord);
store.getAssignmentsForResource(resourceRecord);

// CRUD
store.add({ eventId: 1, resourceId: 'r1', units: 100 });
store.remove(assignment);

// Unassign all from resource
resourceRecord.unassignAll();

// Unassign event from resource
eventRecord.unassign(resourceRecord);
```

---

## 9. Time-Phased Assignments (Gantt)

### 9.1 Concept

Assignments kunnen een eigen startDate/endDate hebben, onafhankelijk van het event:

```javascript
{
    id         : 1,
    event      : 'e1',
    resource   : 'r1',
    startDate  : '2024-01-15',  // Begint later dan event start
    endDate    : '2024-01-18'   // Eindigt eerder dan event end
}
```

### 9.2 Use Cases

- Resource werkt slechts deel van de event duration
- Resource komt later bij het project
- Resource vertrekt voor event einde

---

## 10. Assignment Costing

### 10.1 Cost Berekening

Cost wordt automatisch berekend op basis van:
- Resource rate table
- Assignment units
- Event duration

```javascript
{
    id        : 1,
    event     : 'e1',
    resource  : 'consultant',  // Heeft rate table
    rateTable : 'overtime'     // Specifieke rate table
}
```

### 10.2 Rate Table Override

```javascript
// Per-assignment rate table
{
    id        : 1,
    event     : 'e1',
    resource  : 'r1',
    rateTable : 'weekend-rate'  // Override resource default
}
```

### 10.3 Material Quantity

```javascript
// Voor material resources
{
    id        : 1,
    event     : 'e1',
    resource  : 'concrete',     // Material resource
    quantity  : 50              // 50 m³
}
```

---

## 11. Event Assignment Methods

### 11.1 Via EventModel

```javascript
// Get assignments
const assignments = eventRecord.assignments;

// Assign
await eventRecord.assign('r1');
await eventRecord.assign(['r1', 'r2']);
await eventRecord.assign('r2', true);       // Replace all

// Unassign
await eventRecord.unassign('r1');
await eventRecord.unassign();               // All

// Reassign
eventRecord.reassign('r1', 'r2');           // From r1 to r2

// Check
eventRecord.isAssignedTo('r1');             // Returns boolean

// Get resources
eventRecord.resource;                        // First resource
eventRecord.resources;                       // All resources
eventRecord.getResource('r1');               // Specific
```

---

## 12. Resource Assignment Methods

### 12.1 Via ResourceModel

```javascript
// Get assignments
const assignments = resourceRecord.assignments;

// Get events
const events = resourceRecord.events;

// Unassign all
resourceRecord.unassignAll();
```

---

## 13. ResourceUtilization View

### 13.1 Configuratie

```javascript
import { ResourceUtilization, SchedulerPro } from '@bryntum/schedulerpro';

const resourceUtilization = new ResourceUtilization({
    project     : scheduler.project,
    partner     : scheduler,
    appendTo    : 'container',
    showBarTip  : true,
    rowHeight   : 50,

    columns : [
        {
            type     : 'tree',
            field    : 'name',
            text     : 'Resource/Event',
            renderer({ record, value }) {
                if (record.origin.isAssignmentModel) {
                    const event = record.origin.event;
                    return {
                        children : [
                            { tag: 'dt', html: value },
                            { tag: 'dd', html: `${event.startDate} - ${event.endDate}` }
                        ]
                    };
                }
                return value;
            }
        }
    ]
});
```

### 13.2 Allocation Bars

ResourceUtilization toont:
- Resource rijen met totale allocatie
- Geneste assignment rijen
- Over-allocatie indicatie (> maxUnits)

---

## 14. Custom Assignment Model

```javascript
import { AssignmentModel } from '@bryntum/schedulerpro';

class ProjectAssignment extends AssignmentModel {
    static $name = 'ProjectAssignment';

    static fields = [
        { name: 'role', type: 'string' },
        { name: 'hourlyRate', type: 'number' },
        { name: 'notes', type: 'string' },

        // Computed
        {
            name      : 'calculatedCost',
            persist   : false,
            calculate : record => record.effort * record.hourlyRate
        }
    ];

    // Custom validation
    get isValidAssignment() {
        return this.units > 0 && this.units <= 100;
    }
}

// Gebruik
const scheduler = new SchedulerPro({
    project : {
        assignmentModelClass : ProjectAssignment
    }
});
```

---

## 15. TypeScript Interfaces

```typescript
import { AssignmentModel, EventModel, ResourceModel } from '@bryntum/schedulerpro';

// AssignmentModelConfig
interface AssignmentModelConfig {
    id: string | number;

    // Links (use either id or model)
    eventId?: string | number;
    resourceId?: string | number;
    event?: EventModel | string | number;
    resource?: ResourceModel | string | number;

    // Allocation
    units?: number;
    effort?: number;

    // Time-phased
    startDate?: Date;
    endDate?: Date;

    // Costing
    cost?: number;
    rateTable?: string | number;
    quantity?: number;

    // Behavior
    drawDependencies?: boolean;
}

// AssignmentModel interface
interface IAssignmentModel {
    // Properties
    id: string | number;
    event: EventModel;
    resource: ResourceModel;
    eventId: string | number;
    resourceId: string | number;
    eventName: string;           // Read-only
    resourceName: string;        // Read-only
    units: number;
    effort: number;
    cost: number;
    isPersistable: boolean;
    isAssignmentModel: boolean;

    // Methods
    getResource(): ResourceModel;
    setAsync(field: string | object, value?: any): Promise<void>;
    toString(): string;
}

// AssignmentStore interface
interface IAssignmentStore {
    getAssignmentsForEvent(event: EventModel): AssignmentModel[];
    getAssignmentsForResource(resource: ResourceModel): AssignmentModel[];
    add(data: AssignmentModelConfig | AssignmentModelConfig[]): AssignmentModel[];
    remove(assignment: AssignmentModel | AssignmentModel[]): AssignmentModel[];
}
```

---

## 16. Complete Example

```javascript
import { SchedulerPro, EventModel, AssignmentModel, Splitter, ResourceUtilization } from '@bryntum/schedulerpro';

// Custom event met FixedDuration default
class ProjectEvent extends EventModel {
    static fields = [
        { name: 'schedulingMode', defaultValue: 'FixedDuration' }
    ];
}

// Custom assignment
class ProjectAssignment extends AssignmentModel {
    static fields = [
        { name: 'role', type: 'string' }
    ];
}

const scheduler = new SchedulerPro({
    appendTo : 'scheduler-container',

    startDate  : new Date(2024, 0, 1),
    endDate    : new Date(2024, 0, 31),
    viewPreset : 'dayAndWeek',
    rowHeight  : 50,

    features : {
        taskEdit : {
            items : {
                generalTab : {
                    items : {
                        resourcesField : false
                    }
                },
                resourcesTab : {
                    type      : 'resourcestab',
                    weight    : 400,
                    showUnits : true
                }
            }
        }
    },

    project : {
        eventModelClass      : ProjectEvent,
        assignmentModelClass : ProjectAssignment,

        resources : [
            { id: 'r1', name: 'Alice' },
            { id: 'r2', name: 'Bob' },
            { id: 'r3', name: 'Charlie' }
        ],

        events : [
            {
                id       : 1,
                name     : 'Team Project',
                startDate: '2024-01-08',
                duration : 5,
                effort   : 120
            },
            {
                id       : 2,
                name     : 'Solo Task',
                startDate: '2024-01-15',
                duration : 3
            }
        ],

        assignments : [
            // Multi-assignment met units
            { id: 1, event: 1, resource: 'r1', units: 50 },
            { id: 2, event: 1, resource: 'r2', units: 50 },
            { id: 3, event: 1, resource: 'r3', units: 100 },

            // Single assignment
            { id: 4, event: 2, resource: 'r1', units: 100 }
        ]
    },

    columns : [
        { type: 'resourceInfo', text: 'Resource', width: 150 }
    ],

    listeners : {
        beforeEventDropFinalize({ context }) {
            const { newResource, eventRecords } = context;

            // Check of nieuwe assignment geldig is
            for (const event of eventRecords) {
                const totalUnits = event.assignments
                    .filter(a => a.resourceId !== newResource.id)
                    .reduce((sum, a) => sum + a.units, 0);

                if (totalUnits + 100 > 300) {
                    // Max 300% totale allocatie
                    return false;
                }
            }
        }
    }
});

// ResourceUtilization view
new Splitter({
    appendTo : 'container'
});

const utilization = new ResourceUtilization({
    project    : scheduler.project,
    partner    : scheduler,
    appendTo   : 'utilization-container',
    showBarTip : true,

    columns : [
        {
            type  : 'tree',
            field : 'name',
            text  : 'Resource / Assignment',
            flex  : 1
        }
    ]
});
```

---

## Referenties

- Examples: `schedulerpro-7.1.0-trial/examples/effort/`
- Examples: `schedulerpro-7.1.0-trial/examples/resourceutilization/`
- Examples: `schedulerpro-7.1.0-trial/examples/percent-done/`
- TypeScript: `schedulerpro.d.ts` lines 309893+ (AssignmentModel)
- TypeScript: `schedulerpro.d.ts` lines 203110+ (AssignmentModelMixin)

---

*Document gegenereerd: December 2024*
*Bryntum SchedulerPro versie: 7.1.0*
