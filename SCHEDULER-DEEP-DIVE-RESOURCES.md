# SchedulerPro Deep Dive: Resources

> **Uitgebreide analyse** van het Bryntum SchedulerPro ResourceModel: resource eigenschappen, grouping, time ranges, calendars, en resource columns.

---

## Overzicht

Het ResourceModel in SchedulerPro representeert de entiteiten waaraan events toegewezen worden (mensen, machines, ruimtes). Het biedt:
- **Identificatie** - id, name, image/avatar
- **Styling** - eventColor, eventStyle per resource
- **Layout** - rowHeight, eventLayout, barMargin
- **Calendars** - work schedules per resource
- **Types** - work, material, cost resources
- **Costing** - rate tables, cost accrual

---

## 1. ResourceModel Basis

### 1.1 Core Fields

```javascript
{
    id         : 'r1',
    name       : 'John Smith',
    image      : 'john.png',          // Relatief aan resourceImagePath
    // OF
    imageUrl   : '/images/john.png',  // Absolute URL

    // Styling
    eventColor : 'green',
    eventStyle : 'rounded',

    // Optioneel
    calendar   : 'day-shift',         // Calendar ID
    type       : 'Operators'          // Voor grouping
}
```

### 1.2 Field Definities

```typescript
interface ResourceModelFields {
    // Identificatie
    id: string | number;
    name: string;

    // Images
    image: string | boolean;          // false = geen image
    imageUrl: string;
    showAvatar: boolean;

    // Styling
    eventColor: EventColor;
    eventStyle: EventStyle;
    iconCls: string;

    // Layout
    rowHeight: number;
    columnWidth: number;              // Vertical mode
    barMargin: number;
    resourceMargin: number | ResourceMarginConfig;
    eventLayout: 'stack' | 'pack' | 'mixed' | 'none';
    allowOverlap: boolean;

    // Calendar
    calendar: CalendarModel | string;

    // Type
    type: 'work' | 'material' | 'cost';
    materialLabel: string;

    // Capacity
    maxUnits: number;                 // Max allocation %

    // Costing
    defaultRateTable: string | number;
    costAccrual: 'start' | 'prorated' | 'end';
}
```

---

## 2. Resource Images

### 2.1 Image Configuratie

```javascript
const scheduler = new SchedulerPro({
    // Global image path
    resourceImagePath : 'images/users/',

    // Of via resourceImages
    resourceImages : {
        path      : 'images/users/',
        extension : '.png'
    }
});

// Resource data
{
    id    : 1,
    name  : 'John',
    image : 'john'           // Wordt: images/users/john.png
}

// Absolute URL
{
    id       : 2,
    name     : 'Jane',
    imageUrl : 'https://example.com/jane.jpg'
}

// Geen image
{
    id    : 3,
    name  : 'Robot',
    image : false,
    iconCls : 'fa fa-robot'  // Icon in plaats van image
}
```

### 2.2 ResourceInfoColumn

```javascript
columns : [
    {
        type               : 'resourceInfo',
        text               : 'Name',
        width              : 200,
        showEventCount     : true,    // Toon aantal events
        showImage          : true,    // Toon avatar
        showRole           : true,    // Toon role field
        useNameAsImageName : true     // Gebruik name als image filename
    }
]
```

### 2.3 Initials

```javascript
// Automatisch gegenereerd uit name
const initials = resource.initials;  // "JS" voor "John Smith"

// Custom initials in subclass
class MyResource extends ResourceModel {
    get initials() {
        return this.employeeCode?.substring(0, 2) || super.initials;
    }
}
```

---

## 3. Resource Styling

### 3.1 Per-Resource Event Color

```javascript
// In data
{
    id         : 1,
    name       : 'George',
    eventColor : 'green'      // Alle events van George zijn groen
}

// Hiërarchie:
// 1. Event.eventColor (hoogste prioriteit)
// 2. Resource.eventColor
// 3. Scheduler.eventColor (laagste)
```

### 3.2 Per-Resource Event Style

```javascript
{
    id         : 'machine1',
    name       : 'Electric Forklift',
    eventStyle : 'filled',    // Andere style dan default
    eventColor : 'indigo'
}

// Beschikbare styles
type EventStyle =
    'tonal' | 'filled' | 'bordered' | 'traced' |
    'outlined' | 'indented' | 'line' | 'dashed' |
    'minimal' | 'rounded' | 'calendar' | 'interday' |
    'gantt' | null;
```

---

## 4. Resource Layout

### 4.1 Row Height

```javascript
// Global default
const scheduler = new SchedulerPro({
    rowHeight : 50
});

// Per-resource override
{
    id        : 1,
    name      : 'John',
    rowHeight : 80            // Hogere rij voor deze resource
}
```

### 4.2 Event Layout Mode

```javascript
{
    id          : 1,
    name        : 'Resource',
    eventLayout : 'stack'     // Events stapelen verticaal
    // OF
    eventLayout : 'pack'      // Events naast elkaar indien ruimte
    // OF
    eventLayout : 'mixed'     // Combinatie
    // OF
    eventLayout : 'none'      // Overlappen toestaan
}
```

### 4.3 Margins

```javascript
{
    id             : 1,
    name           : 'Resource',
    barMargin      : 5,        // Ruimte tussen gestapelde events
    resourceMargin : 10        // Ruimte boven/onder eerste/laatste event
}

// ResourceMargin als object
{
    resourceMargin : {
        start : 5,            // Top margin
        end   : 10            // Bottom margin
    }
}
```

### 4.4 Allow Overlap

```javascript
{
    id           : 1,
    name         : 'Shared Room',
    allowOverlap : true        // Events mogen overlappen
}

{
    id           : 2,
    name         : 'Machine',
    allowOverlap : false       // Geen overlapping toegestaan
}
```

---

## 5. Resource Calendars

### 5.1 Calendar Toewijzing

```javascript
// In resource data
{
    id       : 1,
    name     : 'Mike',
    calendar : 'early-shift'  // Calendar ID
}

// Programmatisch
await resource.setCalendar(calendarModel);
await resource.setCalendar(null);  // Gebruik project calendar
```

### 5.2 Calendar Definities

```javascript
{
    calendars : [
        {
            id                       : 'day',
            name                     : 'Day Shift',
            unspecifiedTimeIsWorking : false,
            intervals                : [
                {
                    recurrentStartDate : 'at 8:00',
                    recurrentEndDate   : 'at 17:00',
                    isWorking          : true
                }
            ]
        },
        {
            id                       : 'night',
            name                     : 'Night Shift',
            unspecifiedTimeIsWorking : false,
            intervals                : [
                {
                    recurrentStartDate : 'at 22:00',
                    recurrentEndDate   : 'at 6:00',
                    isWorking          : true
                }
            ]
        }
    ],
    resources : [
        { id: 1, name: 'Mike', calendar: 'day' },
        { id: 2, name: 'Rob', calendar: 'night' }
    ]
}
```

### 5.3 Effective Calendar

```javascript
// Krijg de effectieve calendar (eigen of project default)
const calendar = resource.effectiveCalendar;

// Krijg de toegewezen calendar
const ownCalendar = resource.calendar;
```

### 5.4 ResourceCalendarColumn

```javascript
columns : [
    {
        type  : 'resourceCalendar',
        text  : 'Shift',
        width : 120
        // Toont calendar name en laat wijzigen via dropdown
    }
]
```

---

## 6. Resource Grouping

### 6.1 Feature Configuratie

```javascript
const scheduler = new SchedulerPro({
    features : {
        group : 'type'        // Groepeer op 'type' field
    }
});

// Of dynamisch
scheduler.features.group.field = 'department';
```

### 6.2 Data met Groups

```javascript
{
    resources : [
        { id: 1, name: 'George', type: 'Operators' },
        { id: 2, name: 'Rob', type: 'Operators' },
        { id: 3, name: 'Forklift', type: 'Machines' },
        { id: 4, name: 'Robot', type: 'Machines' }
    ]
}

// Result:
// - Operators (group header)
//   - George
//   - Rob
// - Machines (group header)
//   - Forklift
//   - Robot
```

### 6.3 Multiple Group Levels

```javascript
features : {
    group : {
        field   : ['department', 'team'],  // Multi-level
        compact : false                     // Aparte groep headers
    }
}
```

---

## 7. Resource Types

### 7.1 Work Resource (Default)

```javascript
{
    id   : 1,
    name : 'John Developer',
    type : 'work',
    maxUnits : 100            // 100% capacity
}
```

### 7.2 Material Resource

```javascript
{
    id            : 'concrete',
    name          : 'Concrete',
    type          : 'material',
    materialLabel : 'm³'      // Unit of measure
}
```

### 7.3 Cost Resource

```javascript
{
    id   : 'travel',
    name : 'Travel Expenses',
    type : 'cost'
}
```

---

## 8. Resource Capacity & Costing

### 8.1 Max Units (Capacity)

```javascript
{
    id       : 1,
    name     : 'Senior Developer',
    maxUnits : 100            // 100% = full-time
}

{
    id       : 2,
    name     : 'Part-time Consultant',
    maxUnits : 50             // 50% capacity
}

// Over-allocation wordt getoond in ResourceHistogram
```

### 8.2 Rate Tables

```javascript
{
    id               : 1,
    name             : 'Consultant',
    defaultRateTable : 'standard',
    rateTables       : [
        {
            id   : 'standard',
            name : 'Standard Rate',
            rate : 100         // Per hour
        },
        {
            id   : 'overtime',
            name : 'Overtime Rate',
            rate : 150
        }
    ]
}

// API
resource.addRateTable({ id: 'weekend', rate: 200 });
resource.removeRateTable('overtime');
```

### 8.3 Cost Accrual

```javascript
{
    id          : 1,
    name        : 'Contractor',
    costAccrual : 'start'     // Kosten bij start event
    // OF
    costAccrual : 'prorated'  // Kosten gespreid over duration
    // OF
    costAccrual : 'end'       // Kosten bij einde event
}
```

---

## 9. Resource Time Ranges

### 9.1 Feature Activeren

```javascript
const scheduler = new SchedulerPro({
    features : {
        resourceTimeRanges : true
    }
});
```

### 9.2 Time Range Data

```javascript
{
    resources : [
        { id: 1, name: 'John' }
    ],
    resourceTimeRanges : [
        {
            id           : 1,
            resourceId   : 1,
            name         : 'Vacation',
            startDate    : '2024-01-15',
            endDate      : '2024-01-20',
            timeRangeColor : 'red'
        },
        {
            id           : 2,
            resourceId   : 1,
            name         : 'Training',
            startDate    : '2024-01-25',
            duration     : 2,
            durationUnit : 'day'
        }
    ]
}
```

### 9.3 Access Time Ranges

```javascript
// Via resource
const timeRanges = resource.timeRanges;

// Via store
const store = scheduler.project.resourceTimeRangeStore;
```

---

## 10. Resource API

### 10.1 Getters

```javascript
// Events en assignments
resource.events;           // Alle gekoppelde events
resource.assignments;      // Alle assignment records

// Calendar
resource.calendar;         // Toegewezen calendar
resource.effectiveCalendar; // Effectief (fallback naar project)

// Time ranges
resource.timeRanges;       // Resource-specifieke time ranges

// Berekend
resource.initials;         // "JS" voor "John Smith"
resource.cost;             // Totale berekende kosten

// Status
resource.isPersistable;    // Kan opgeslagen worden
resource.isResourceModel;  // Type check
```

### 10.2 Methods

```javascript
// Calendar
await resource.setCalendar(calendarModel);
const calendar = resource.getCalendar();

// Rate tables
resource.addRateTable({ id: 'weekend', rate: 200 });
resource.removeRateTable('weekend');

// Unassign
resource.unassignAll();    // Verwijder alle assignments

// Async set
await resource.setAsync('name', 'New Name');
await resource.setAsync({
    name       : 'New Name',
    eventColor : 'red'
});
```

---

## 11. ResourceStore

### 11.1 Configuratie

```javascript
const scheduler = new SchedulerPro({
    project : {
        resourceStore : {
            modelClass : CustomResourceModel,
            sorters    : [{ field: 'name', ascending: true }],
            filters    : [{ property: 'active', value: true }]
        }
    }
});
```

### 11.2 Tree Resources

```javascript
// Hierarchische resources
{
    resources : [
        {
            id       : 'dept1',
            name     : 'Engineering',
            expanded : true,
            children : [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' }
            ]
        },
        {
            id       : 'dept2',
            name     : 'Marketing',
            children : [
                { id: 3, name: 'Bob' }
            ]
        }
    ]
}
```

### 11.3 API

```javascript
const store = scheduler.resourceStore;

// CRUD
store.add({ name: 'New Resource' });
store.remove(resource);

// Querying
store.getById('r1');
store.findRecord('name', 'John');
store.query(r => r.type === 'work');

// Copy resource
const copy = resource.copy({
    name : resource.name + ' (copy)'
});
store.add(copy);
```

---

## 12. Resource Columns

### 12.1 ResourceInfoColumn

```javascript
{
    type               : 'resourceInfo',
    text               : 'Resource',
    width              : 200,
    showEventCount     : true,     // "(5 events)"
    showImage          : true,
    showRole           : true,     // Toont 'role' field
    field              : 'name',   // Editable field
    validNames         : ['John', 'Jane']  // Autocomplete suggesties
}
```

### 12.2 ResourceCalendarColumn

```javascript
{
    type  : 'resourceCalendar',
    text  : 'Calendar',
    width : 120
    // Dropdown om calendar te kiezen
}
```

### 12.3 ActionColumn

```javascript
{
    type    : 'action',
    text    : 'Actions',
    width   : 90,
    actions : [
        {
            cls     : 'fa fa-plus',
            tooltip : 'Add task',
            onClick : async ({ record }) => {
                const [event] = scheduler.eventStore.add({
                    name      : 'New task',
                    startDate : scheduler.startDate,
                    duration  : 4
                });
                event.assign(record);
                await scheduler.project.commitAsync();
            }
        },
        {
            cls     : 'fa fa-copy',
            tooltip : 'Duplicate',
            onClick : ({ record }) => {
                scheduler.resourceStore.add(record.copy({
                    name : record.name + ' (copy)'
                }));
            }
        }
    ]
}
```

---

## 13. Custom Resource Model

```javascript
import { ResourceModel } from '@bryntum/schedulerpro';

class EmployeeModel extends ResourceModel {
    static $name = 'EmployeeModel';

    static fields = [
        { name: 'employeeId', type: 'string' },
        { name: 'department', type: 'string' },
        { name: 'team', type: 'string' },
        { name: 'skills', type: 'array' },
        { name: 'hourlyRate', type: 'number', defaultValue: 50 },
        { name: 'active', type: 'boolean', defaultValue: true },

        // Computed field
        {
            name      : 'displayName',
            persist   : false,
            calculate : record => `${record.name} (${record.department})`
        }
    ];

    // Custom initials
    get initials() {
        return this.employeeId?.substring(0, 3).toUpperCase() ||
               super.initials;
    }

    // Custom availability check
    isAvailableOn(date) {
        return this.effectiveCalendar.isWorkingDay(date);
    }
}

// Gebruik
const scheduler = new SchedulerPro({
    project : {
        resourceModelClass : EmployeeModel
    }
});
```

---

## 14. TypeScript Interfaces

```typescript
import { ResourceModel, CalendarModel, EventModel } from '@bryntum/schedulerpro';

// EventColor (gedeeld met EventModel)
type EventColor =
    'red' | 'pink' | 'magenta' | 'purple' | 'violet' |
    'deep-purple' | 'indigo' | 'blue' | 'light-blue' |
    'cyan' | 'teal' | 'green' | 'light-green' | 'lime' |
    'yellow' | 'orange' | 'amber' | 'deep-orange' |
    'light-gray' | 'gray' | 'black' | string | null;

// EventStyle
type EventStyle =
    'tonal' | 'filled' | 'bordered' | 'traced' |
    'outlined' | 'indented' | 'line' | 'dashed' |
    'minimal' | 'rounded' | 'calendar' | 'interday' |
    'gantt' | null;

// ResourceMarginConfig
interface ResourceMarginConfig {
    start?: number;
    end?: number;
}

// ResourceModelConfig
interface ResourceModelConfig {
    id: string | number;
    name?: string;

    // Images
    image?: string | boolean;
    imageUrl?: string;
    showAvatar?: boolean;
    iconCls?: string;

    // Styling
    eventColor?: EventColor;
    eventStyle?: EventStyle;

    // Layout
    rowHeight?: number;
    columnWidth?: number;
    barMargin?: number;
    resourceMargin?: number | ResourceMarginConfig;
    eventLayout?: 'stack' | 'pack' | 'mixed' | 'none';
    allowOverlap?: boolean;

    // Calendar
    calendar?: CalendarModel | string;

    // Type
    type?: 'work' | 'material' | 'cost';
    materialLabel?: string;
    maxUnits?: number;

    // Costing
    defaultRateTable?: string | number;
    costAccrual?: 'start' | 'prorated' | 'end';

    // Tree
    children?: ResourceModelConfig[];
    expanded?: boolean;
}

// ResourceModel interface
interface IResourceModel {
    // Properties
    id: string | number;
    name: string;
    events: EventModel[];
    assignments: AssignmentModel[];
    calendar: CalendarModel;
    effectiveCalendar: CalendarModel;
    timeRanges: ResourceTimeRangeModel[];
    initials: string;
    cost: number;
    isPersistable: boolean;
    isResourceModel: boolean;

    // Methods
    setCalendar(calendar: CalendarModel): Promise<void>;
    getCalendar(): CalendarModel;
    unassignAll(): void;
    setAsync(field: string | object, value?: any): Promise<void>;
    addRateTable(rateTable: RateTableConfig): ResourceRateModel[];
    removeRateTable(rateTable: ResourceRateModel): ResourceRateModel[];
}
```

---

## 15. Complete Example

```javascript
import { SchedulerPro, ResourceModel, Toast } from '@bryntum/schedulerpro';

// Custom resource model
class TeamMember extends ResourceModel {
    static fields = [
        { name: 'department', type: 'string' },
        { name: 'skills', type: 'array', defaultValue: [] },
        { name: 'hourlyRate', type: 'number', defaultValue: 75 }
    ];
}

const scheduler = new SchedulerPro({
    appendTo : 'container',

    startDate : new Date(2024, 0, 1),
    endDate   : new Date(2024, 0, 31),
    rowHeight : 60,

    resourceImages : {
        path      : 'images/users/',
        extension : '.png'
    },

    features : {
        group                  : 'department',
        resourceNonWorkingTime : true,
        resourceTimeRanges     : true,
        filter                 : true,
        sort                   : 'name'
    },

    project : {
        resourceModelClass : TeamMember,

        calendars : [
            {
                id                       : 'day',
                name                     : 'Day Shift (8-17)',
                unspecifiedTimeIsWorking : false,
                intervals : [{
                    recurrentStartDate : 'at 8:00',
                    recurrentEndDate   : 'at 17:00',
                    isWorking          : true
                }]
            },
            {
                id                       : 'night',
                name                     : 'Night Shift (22-6)',
                unspecifiedTimeIsWorking : false,
                intervals : [{
                    recurrentStartDate : 'at 22:00',
                    recurrentEndDate   : 'at 6:00',
                    isWorking          : true
                }]
            }
        ],

        resources : [
            {
                id         : 1,
                name       : 'George',
                department : 'Engineering',
                calendar   : 'day',
                eventColor : 'green',
                skills     : ['JavaScript', 'React']
            },
            {
                id         : 2,
                name       : 'Mike',
                department : 'Engineering',
                calendar   : 'day',
                eventColor : 'blue'
            },
            {
                id         : 3,
                name       : 'Robot AT4',
                department : 'Automation',
                calendar   : 'night',
                image      : false,
                iconCls    : 'fa fa-robot',
                eventStyle : 'filled',
                eventColor : 'indigo'
            }
        ],

        resourceTimeRanges : [
            {
                id             : 1,
                resourceId     : 1,
                name           : 'Vacation',
                startDate      : '2024-01-15',
                endDate        : '2024-01-20',
                timeRangeColor : 'red'
            }
        ]
    },

    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Team Member',
            width          : 200,
            showEventCount : true
        },
        {
            type  : 'resourceCalendar',
            text  : 'Shift',
            width : 120
        },
        {
            field : 'department',
            text  : 'Department',
            width : 120
        },
        {
            type    : 'action',
            width   : 60,
            actions : [{
                cls     : 'fa fa-plus',
                tooltip : 'Add event',
                async onClick({ record }) {
                    const [event] = scheduler.eventStore.add({
                        name      : 'New Task',
                        startDate : scheduler.startDate,
                        duration  : 4,
                        durationUnit : 'hour'
                    });
                    event.assign(record);
                    await scheduler.project.commitAsync();
                    scheduler.editEvent(event);
                }
            }]
        }
    ],

    listeners : {
        beforeEventDropFinalize({ context }) {
            const resource = context.newResource;

            // Voorkom drop op machines als het geen machine-task is
            if (resource.department === 'Automation' &&
                !context.eventRecords[0].isMachineTask) {
                Toast.show('Cannot assign non-machine task to robot');
                return false;
            }
        }
    }
});
```

---

## Referenties

- Examples: `schedulerpro-7.1.0-trial/examples/grouping/`
- Examples: `schedulerpro-7.1.0-trial/examples/highlight-resource-calendars/`
- Examples: `schedulerpro-7.1.0-trial/examples/resource-histogram/`
- TypeScript: `schedulerpro.d.ts` lines 314360+ (ResourceModel)
- TypeScript: `schedulerpro.d.ts` lines 203934+ (ResourceModelMixin)
- TypeScript: `schedulerpro.d.ts` lines 172954+ (ResourceStore)

---

*Document gegenereerd: December 2024*
*Bryntum SchedulerPro versie: 7.1.0*
