# Calendar Deep Dive: Scheduling Engine Integratie

> **Fase 6** - Diepgaande analyse van hoe Bryntum Calendar de scheduling engine gebruikt voor event management, recurrence, en resource planning.

---

## Inhoudsopgave

1. [Overzicht](#1-overzicht)
2. [ProjectModel Architectuur](#2-projectmodel-architectuur)
3. [Event Scheduling](#3-event-scheduling)
4. [Recurrence Engine](#4-recurrence-engine)
5. [Resource & Assignment Model](#5-resource--assignment-model)
6. [Calendar (Working Time)](#6-calendar-working-time)
7. [Data Stores](#7-data-stores)
8. [CrudManager Integratie](#8-crudmanager-integratie)
9. [Conflict Handling](#9-conflict-handling)
10. [State Tracking (STM)](#10-state-tracking-stm)
11. [Performance Optimalisatie](#11-performance-optimalisatie)
12. [Cross-References](#12-cross-references)

---

## 1. Overzicht

### 1.1 Scheduling Engine in Calendar Context

De Bryntum Calendar gebruikt een vereenvoudigde versie van de scheduling engine vergeleken met Gantt/SchedulerPro. De focus ligt op:

- Event time management (start, end, duration)
- Recurrence rule processing (RRULE)
- Resource assignment
- Working time calendars
- Multi-resource scheduling

```
┌─────────────────────────────────────────────────────────────────┐
│                    Calendar Component                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   ProjectModel                            │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │   │
│  │  │ EventStore  │  │ResourceStore│  │AssignmentStr│       │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │   │
│  │         │                │                │               │   │
│  │         └────────────────┼────────────────┘               │   │
│  │                          ▼                                │   │
│  │              ┌─────────────────────┐                      │   │
│  │              │  Scheduling Logic   │                      │   │
│  │              │ - Duration calc     │                      │   │
│  │              │ - Recurrence expand │                      │   │
│  │              │ - Assignment link   │                      │   │
│  │              └─────────────────────┘                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Calendar vs Gantt/SchedulerPro Scheduling

| Feature | Calendar | SchedulerPro | Gantt |
|---------|----------|--------------|-------|
| Dependencies | ❌ | ✅ | ✅ |
| Critical Path | ❌ | ❌ | ✅ |
| Constraints | ❌ | ✅ | ✅ |
| Effort Calculation | ❌ | ✅ | ✅ |
| ChronoGraph Engine | ❌ | ✅ | ✅ |
| Recurrence | ✅ | ✅ | ❌ |
| Multi-Resource | ✅ | ✅ | ✅ |
| Working Time | ✅ | ✅ | ✅ |

---

## 2. ProjectModel Architectuur

### 2.1 Calendar ProjectModel

```typescript
// Calendar's ProjectModel erft van SchedulerProjectModel
class CalendarProjectModel extends SchedulerProjectModel {
    // Event management
    eventStore: EventStore;
    events: EventModel[];

    // Resource management
    resourceStore: ResourceStore;
    resources: ResourceModel[];

    // Assignment management
    assignmentStore: AssignmentStore;
    assignments: AssignmentModel[];

    // Time ranges
    timeRangeStore: Store;
    timeRanges: TimeRangeModel[];

    // Resource-specifieke time ranges
    resourceTimeRangeStore: Store;
    resourceTimeRanges: ResourceTimeRangeModel[];
}
```

### 2.2 ProjectModel Configuratie

```typescript
const calendar = new Calendar({
    project: {
        // Event Store configuratie
        eventStore: {
            modelClass: CustomEventModel,
            sorters: [{ field: 'startDate', ascending: true }]
        },

        // Resource Store configuratie
        resourceStore: {
            modelClass: CustomResourceModel
        },

        // Assignment Store configuratie
        assignmentStore: {
            modelClass: CustomAssignmentModel
        },

        // Calendar voor working time
        calendar: 'business',

        // Timezone handling
        timeZone: 'Europe/Amsterdam',

        // Data
        events: [],
        resources: [],
        assignments: []
    }
});
```

### 2.3 Standalone ProjectModel

```typescript
// Creëer project apart van calendar
const project = new ProjectModel({
    events: eventsData,
    resources: resourcesData,
    assignments: assignmentsData,

    listeners: {
        // Luister naar data changes
        change({ store, action, records }) {
            console.log(`${store.id}: ${action}`);
        }
    }
});

// Gebruik in calendar
const calendar = new Calendar({
    project: project
});

// Of meerdere calendars met dezelfde data
const calendar2 = new Calendar({
    project: project // Zelfde project instance
});
```

---

## 3. Event Scheduling

### 3.1 EventModel Scheduling Fields

```typescript
interface EventModel {
    // Core timing
    startDate: Date;           // Start datum/tijd
    endDate: Date;             // Eind datum/tijd
    duration: number;          // Duratie magnitude
    durationUnit: DurationUnit; // 'hour', 'day', 'week', etc.

    // All-day events
    allDay: boolean;           // Is dit een hele-dag event?

    // Computed
    readonly fullDuration: Duration; // duration + unit gecombineerd
    readonly isScheduled: boolean;   // Heeft valid timing

    // Methods
    setStartDate(date: Date, keepDuration?: boolean): void;
    setEndDate(date: Date, keepDuration?: boolean): void;
    setDuration(duration: number, unit?: DurationUnit): void;
    shift(amount: number, unit?: DurationUnit): void;
}

type DurationUnit =
    | 'millisecond' | 'ms'
    | 'second' | 's'
    | 'minute' | 'mi'
    | 'hour' | 'h'
    | 'day' | 'd'
    | 'week' | 'w'
    | 'month' | 'mo'
    | 'quarter' | 'q'
    | 'year' | 'y';
```

### 3.2 Duration Berekeningen

```typescript
// Automatische endDate berekening
event.startDate = new Date('2024-01-15T10:00');
event.duration = 2;
event.durationUnit = 'hour';
// → endDate wordt automatisch 2024-01-15T12:00

// Duration aanpassen behoudt startDate
event.duration = 3;
// → endDate wordt 2024-01-15T13:00

// EndDate wijzigen past duration aan
event.endDate = new Date('2024-01-15T14:00');
// → duration wordt 4 uur

// Shift event in tijd
event.shift(1, 'day');
// → Beide start en end schuiven 1 dag op
```

### 3.3 All-Day Events

```typescript
// All-day event
const allDayEvent = eventStore.add({
    name: 'Conferentie',
    startDate: '2024-01-15',
    endDate: '2024-01-17',
    allDay: true
});

// All-day events hebben speciale gedrag:
// - Tijdcomponent wordt genegeerd
// - Gerenderd in de all-day zone
// - Spanning meerdere dagen wordt correct weergegeven

// Multi-day detection
if (event.isInterDay) {
    console.log('Event spans multiple days');
}
```

### 3.4 Event Validation

```typescript
const calendar = new Calendar({
    project: {
        eventStore: {
            listeners: {
                beforeAdd({ records }) {
                    // Valideer nieuwe events
                    for (const event of records) {
                        if (event.startDate >= event.endDate) {
                            Toast.show('End must be after start');
                            return false;
                        }
                    }
                },

                beforeUpdate({ record, changes }) {
                    // Valideer wijzigingen
                    if (changes.startDate || changes.endDate) {
                        const start = changes.startDate?.value ?? record.startDate;
                        const end = changes.endDate?.value ?? record.endDate;

                        if (start >= end) {
                            return false;
                        }
                    }
                }
            }
        }
    }
});
```

---

## 4. Recurrence Engine

### 4.1 Recurrence Model

```typescript
interface RecurrenceConfig {
    // Frequentie
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

    // Interval (elke N keer)
    interval: number; // default: 1

    // Eind conditie
    count?: number;           // Na N occurrences
    endDate?: Date | string;  // Tot datum

    // Day-of-week (voor WEEKLY)
    days?: string[];  // ['MO', 'TU', 'WE', 'TH', 'FR']

    // Month-day (voor MONTHLY)
    monthDays?: number[];  // [1, 15] = 1e en 15e van maand

    // Positie (voor MONTHLY/YEARLY)
    positions?: number[];  // [1, -1] = eerste en laatste
}
```

### 4.2 RRULE Formaat

```typescript
// Dagelijks
event.recurrenceRule = 'FREQ=DAILY;COUNT=10';

// Wekelijks op maandag en woensdag
event.recurrenceRule = 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE';

// Maandelijks op de 15e
event.recurrenceRule = 'FREQ=MONTHLY;BYMONTHDAY=15';

// Maandelijks op de eerste maandag
event.recurrenceRule = 'FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1';

// Jaarlijks op 25 december
event.recurrenceRule = 'FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25';

// Tot specifieke datum
event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO,FR;UNTIL=20241231T235959Z';
```

### 4.3 Recurrence Occurrences

```typescript
// Check of event recurring is
if (event.isRecurring) {
    // Dit is de master event

    // Haal occurrences op voor een bepaalde periode
    const occurrences = event.getOccurrencesForDateRange(
        new Date('2024-01-01'),
        new Date('2024-12-31')
    );

    // Elke occurrence is een tijdelijke EventModel
    occurrences.forEach(occurrence => {
        console.log(occurrence.startDate, occurrence.endDate);
        console.log(occurrence.recurringTimeSpan); // → master event
        console.log(occurrence.isOccurrence); // → true
    });
}

// Check of dit een occurrence is
if (event.isOccurrence) {
    const master = event.recurringTimeSpan;
    console.log('Master event:', master.name);
}
```

### 4.4 Exception Handling

```typescript
// Voeg exception datum toe (skip occurrence)
event.addExceptionDate(new Date('2024-06-15'));

// Of via exceptionDates property
event.exceptionDates = ['2024-06-15', '2024-07-04'];

// Wijzig individuele occurrence
// Dit creëert automatisch een exception
const occurrence = event.getOccurrenceForDate(new Date('2024-03-15'));
occurrence.startDate = new Date('2024-03-15T14:00'); // Was 10:00
// Nu is 15 maart een exception met eigen timing

// Verwijder enkele occurrence
calendar.eventStore.remove(occurrence);
// Master event krijgt exceptionDate voor die dag
```

### 4.5 Recurrence UI

```typescript
const calendar = new Calendar({
    features: {
        eventEdit: {
            items: {
                // Recurrence combo (standaard enabled)
                recurrenceCombo: {
                    label: 'Herhalen',
                    weight: 800
                },

                // Recurrence editor button
                editRecurrenceButton: {
                    weight: 810
                }
            }
        }
    },

    listeners: {
        // Vraag bij edit van recurring event
        beforeEventEdit({ eventRecord }) {
            if (eventRecord.isOccurrence) {
                return new Promise(resolve => {
                    MessageDialog.confirm({
                        title: 'Herhaling bewerken',
                        message: 'Wil je alleen deze of alle events bewerken?',
                        okButton: 'Alleen deze',
                        cancelButton: 'Alle events'
                    }).then(result => {
                        if (result === MessageDialog.yesButton) {
                            // Edit only this occurrence
                            resolve(true);
                        } else {
                            // Edit master
                            this.editEvent(eventRecord.recurringTimeSpan);
                            resolve(false);
                        }
                    });
                });
            }
        }
    }
});
```

---

## 5. Resource & Assignment Model

### 5.1 Resource Model

```typescript
interface ResourceModel {
    id: string | number;
    name: string;

    // Optioneel
    eventColor?: string;
    eventStyle?: string;
    image?: string;
    imageUrl?: string;

    // Calendar assignment
    calendar?: CalendarModel | string;

    // Computed
    readonly events: EventModel[];
    readonly assignments: AssignmentModel[];

    // Methods
    getEvents(startDate?: Date, endDate?: Date): EventModel[];
    isAvailable(date: Date): boolean;
}
```

### 5.2 Assignment Model

```typescript
interface AssignmentModel {
    id: string | number;
    eventId: string | number;
    resourceId: string | number;

    // Resolved references
    readonly event: EventModel;
    readonly resource: ResourceModel;
}
```

### 5.3 Multi-Resource Events

```typescript
// Event met meerdere resources
const event = eventStore.add({
    id: 1,
    name: 'Team Meeting',
    startDate: '2024-01-15T10:00',
    endDate: '2024-01-15T11:00'
});

// Assign aan meerdere resources
assignmentStore.add([
    { eventId: 1, resourceId: 'resource1' },
    { eventId: 1, resourceId: 'resource2' },
    { eventId: 1, resourceId: 'resource3' }
]);

// Of via event
event.resources = [resource1, resource2, resource3];

// Check assignments
console.log(event.resources); // Array van ResourceModels
console.log(event.assignments); // Array van AssignmentModels
```

### 5.4 Single-Resource Mode (resourceId)

```typescript
// Eenvoudige mode: direct resourceId op event
const event = eventStore.add({
    id: 1,
    name: 'Personal Task',
    startDate: '2024-01-15T10:00',
    endDate: '2024-01-15T11:00',
    resourceId: 'user1'  // Direct assignment
});

// Of via project config
const calendar = new Calendar({
    project: {
        eventStore: {
            // Events gebruiken resourceId field
            useResourceIdsAsDefaultResourceId: true
        }
    }
});
```

---

## 6. Calendar (Working Time)

### 6.1 Calendar Model

```typescript
interface CalendarModel {
    id: string | number;
    name: string;

    // Intervals definitie
    intervals: CalendarIntervalConfig[];

    // Methods
    isWorkingTime(date: Date): boolean;
    getWorkingTime(startDate: Date, endDate: Date): number;
    skipNonWorkingTime(date: Date, isForward?: boolean): Date;
}

interface CalendarIntervalConfig {
    // Recurrence (welke dagen)
    recurrentStartDate: string;  // 'on Mon at 0:00'
    recurrentEndDate: string;    // 'on Mon at 8:00'

    // Of specifieke datum
    startDate?: Date;
    endDate?: Date;

    // Is dit werktijd?
    isWorking: boolean;

    // Naam
    name?: string;
}
```

### 6.2 Business Calendar

```typescript
const calendar = new Calendar({
    project: {
        // Standaard business calendar
        calendar: {
            id: 'business',
            name: 'Business Hours',
            intervals: [
                // Maandag - Vrijdag: 09:00 - 17:00
                {
                    recurrentStartDate: 'on Mon at 9:00',
                    recurrentEndDate: 'on Mon at 17:00',
                    isWorking: true
                },
                {
                    recurrentStartDate: 'on Tue at 9:00',
                    recurrentEndDate: 'on Tue at 17:00',
                    isWorking: true
                },
                {
                    recurrentStartDate: 'on Wed at 9:00',
                    recurrentEndDate: 'on Wed at 17:00',
                    isWorking: true
                },
                {
                    recurrentStartDate: 'on Thu at 9:00',
                    recurrentEndDate: 'on Thu at 17:00',
                    isWorking: true
                },
                {
                    recurrentStartDate: 'on Fri at 9:00',
                    recurrentEndDate: 'on Fri at 17:00',
                    isWorking: true
                },

                // Specifieke feestdag
                {
                    startDate: new Date('2024-12-25'),
                    endDate: new Date('2024-12-26'),
                    isWorking: false,
                    name: 'Christmas'
                }
            ]
        }
    }
});
```

### 6.3 Resource-Specifieke Calendars

```typescript
const project = new ProjectModel({
    calendarsData: [
        {
            id: 'fulltime',
            name: 'Full-time',
            intervals: [
                // 9-5 Ma-Vr
            ]
        },
        {
            id: 'parttime',
            name: 'Part-time',
            intervals: [
                // 9-13 Ma-Wo
            ]
        }
    ],

    resourcesData: [
        {
            id: 1,
            name: 'John',
            calendar: 'fulltime'
        },
        {
            id: 2,
            name: 'Jane',
            calendar: 'parttime'
        }
    ]
});
```

---

## 7. Data Stores

### 7.1 EventStore

```typescript
const eventStore = calendar.eventStore;

// CRUD Operations
const event = eventStore.add({
    name: 'New Event',
    startDate: new Date(),
    duration: 1,
    durationUnit: 'hour'
})[0];

eventStore.remove(event);

// Query
const eventsOnDate = eventStore.getEventsForDate(new Date('2024-01-15'));

const eventsInRange = eventStore.getEventsInTimeSpan(
    new Date('2024-01-01'),
    new Date('2024-01-31')
);

// Filter
eventStore.filter({
    property: 'resourceId',
    value: 'resource1'
});

// Sort
eventStore.sort('startDate', true);

// Group
eventStore.group('resourceId');
```

### 7.2 ResourceStore

```typescript
const resourceStore = calendar.resourceStore;

// CRUD
const resource = resourceStore.add({
    id: 'r1',
    name: 'Meeting Room A',
    eventColor: 'blue'
})[0];

// Query
const availableResources = resourceStore.query(r =>
    r.isAvailable(new Date())
);

// Hierarchical resources (tree)
const parentResource = resourceStore.add({
    id: 'dept1',
    name: 'Engineering',
    children: [
        { id: 'team1', name: 'Frontend' },
        { id: 'team2', name: 'Backend' }
    ]
})[0];
```

### 7.3 Store Events

```typescript
eventStore.on({
    // Before changes
    beforeAdd({ records }) {
        console.log('Adding:', records);
    },

    beforeRemove({ records }) {
        return confirm('Delete these events?');
    },

    beforeUpdate({ record, changes }) {
        console.log('Updating:', record.name, changes);
    },

    // After changes
    add({ records }) {
        records.forEach(r => console.log('Added:', r.id));
    },

    remove({ records }) {
        console.log('Removed:', records.length, 'events');
    },

    update({ record, changes }) {
        if (changes.startDate) {
            console.log('Event moved:', record.name);
        }
    },

    // Batch change
    change({ action, records }) {
        console.log(`Store ${action}:`, records.length);
    }
});
```

---

## 8. CrudManager Integratie

### 8.1 Basis Setup

```typescript
const calendar = new Calendar({
    crudManager: {
        autoLoad: true,
        autoSync: true,

        transport: {
            load: {
                url: '/api/calendar/load',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer token'
                }
            },
            sync: {
                url: '/api/calendar/sync',
                method: 'POST'
            }
        }
    }
});
```

### 8.2 Load Response Format

```typescript
// Server response format
{
    "success": true,
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Meeting",
                "startDate": "2024-01-15T10:00:00",
                "endDate": "2024-01-15T11:00:00",
                "resourceId": "r1",
                "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO"
            }
        ]
    },
    "resources": {
        "rows": [
            {
                "id": "r1",
                "name": "Conference Room"
            }
        ]
    },
    "assignments": {
        "rows": [
            {
                "id": "a1",
                "eventId": 1,
                "resourceId": "r1"
            }
        ]
    },
    "timeRanges": {
        "rows": [
            {
                "id": "lunch",
                "name": "Lunch",
                "startDate": "2024-01-15T12:00:00",
                "endDate": "2024-01-15T13:00:00",
                "recurrenceRule": "FREQ=DAILY"
            }
        ]
    }
}
```

### 8.3 Sync Request Format

```typescript
// Client sync request
{
    "type": "sync",
    "requestId": "sync-123",
    "events": {
        "added": [
            { "$PhantomId": "new-1", "name": "New Event", ... }
        ],
        "updated": [
            { "id": 1, "name": "Updated Name" }
        ],
        "removed": [
            { "id": 2 }
        ]
    },
    "assignments": {
        "added": [...],
        "updated": [...],
        "removed": [...]
    }
}

// Server sync response
{
    "success": true,
    "requestId": "sync-123",
    "events": {
        "rows": [
            { "$PhantomId": "new-1", "id": 100 }  // Real ID returned
        ]
    }
}
```

### 8.4 CrudManager Events

```typescript
calendar.crudManager.on({
    beforeLoad() {
        console.log('Loading data...');
    },

    load() {
        console.log('Data loaded');
    },

    loadFail({ response }) {
        console.error('Load failed:', response);
    },

    beforeSync() {
        console.log('Syncing changes...');
    },

    sync() {
        console.log('Changes synced');
    },

    syncFail({ response }) {
        console.error('Sync failed:', response);
    },

    hasChanges() {
        console.log('Has unsaved changes:', calendar.crudManager.hasChanges);
    }
});
```

---

## 9. Conflict Handling

### 9.1 Overlap Detection

```typescript
// Check voor overlappende events
function hasConflicts(event: EventModel): EventModel[] {
    const eventStore = calendar.eventStore;

    return eventStore.query(other => {
        if (other === event) return false;
        if (other.resourceId !== event.resourceId) return false;

        // Check overlap
        return !(other.endDate <= event.startDate ||
                 other.startDate >= event.endDate);
    });
}

// Gebruik in beforeAdd/beforeUpdate
eventStore.on({
    beforeAdd({ records }) {
        for (const event of records) {
            const conflicts = hasConflicts(event);
            if (conflicts.length > 0) {
                Toast.show(`Conflict met: ${conflicts[0].name}`);
                return false;
            }
        }
    },

    beforeUpdate({ record, changes }) {
        if (changes.startDate || changes.endDate) {
            const conflicts = hasConflicts(record);
            if (conflicts.length > 0) {
                return false;
            }
        }
    }
});
```

### 9.2 Double-Booking Prevention

```typescript
const calendar = new Calendar({
    features: {
        drag: {
            // Valideer bij drag
            validateFn({ eventRecord, startDate, endDate, resourceRecord }) {
                const events = calendar.eventStore.getEventsInTimeSpan(
                    startDate,
                    endDate
                ).filter(e =>
                    e !== eventRecord &&
                    e.resourceId === resourceRecord?.id
                );

                if (events.length > 0) {
                    return {
                        valid: false,
                        message: 'Time slot is already booked'
                    };
                }
                return true;
            }
        }
    }
});
```

---

## 10. State Tracking (STM)

### 10.1 StateTrackingManager

```typescript
const calendar = new Calendar({
    project: {
        // Enable state tracking
        stm: {
            autoRecord: true,
            disabled: false
        }
    }
});

const stm = calendar.project.stm;

// Manual transaction
stm.startTransaction('Batch update');
eventStore.add({ name: 'Event 1' });
eventStore.add({ name: 'Event 2' });
stm.stopTransaction();

// Undo/Redo
stm.undo();  // Verwijdert beide events
stm.redo();  // Voegt beide weer toe

// Check state
console.log('Can undo:', stm.canUndo);
console.log('Can redo:', stm.canRedo);
console.log('Undo queue:', stm.queue.length);
```

### 10.2 UndoRedo Widget

```typescript
const calendar = new Calendar({
    tbar: {
        items: {
            undoRedo: {
                type: 'undoredo',
                project: 'up.project'  // Referentie naar project
            }
        }
    }
});
```

---

## 11. Performance Optimalisatie

### 11.1 Batch Operations

```typescript
// SLECHT: Individuele adds triggeren meerdere re-renders
events.forEach(e => eventStore.add(e));

// GOED: Batch add
eventStore.add(events);

// GOED: Suspend events tijdens bulk operaties
eventStore.suspendEvents();
events.forEach(e => eventStore.add(e));
eventStore.resumeEvents();
calendar.refresh();

// GOED: Gebruik data setter
eventStore.data = events;
```

### 11.2 LoadOnDemand

```typescript
// Laad alleen zichtbare data
const calendar = new Calendar({
    features: {
        loadOnDemand: {
            // Buffer rondom zichtbare range
            buffer: { month: 1 }
        }
    },

    crudManager: {
        transport: {
            load: {
                url: '/api/events'
                // startDate/endDate worden automatisch toegevoegd
            }
        }
    }
});
```

### 11.3 Large Dataset Tips

```typescript
const calendar = new Calendar({
    project: {
        eventStore: {
            // Gebruik raw data (geen cloning)
            useRawData: true,

            // Disable sync tracking voor read-only
            syncDataOnLoad: false
        }
    },

    // Beperk visible events
    modes: {
        month: {
            // Toon max 5 events per dag, rest als "+N more"
            overflowButtonCount: 5
        }
    },

    // Lazy view loading
    lazyModes: true
});
```

---

## 12. Cross-References

### Gerelateerde Documenten

| Document | Beschrijving |
|----------|--------------|
| [IMPL-SCHEDULING-ENGINE.md](./IMPL-SCHEDULING-ENGINE.md) | ChronoGraph engine (Gantt) |
| [CALENDAR-IMPL-CRUDMANAGER.md](./CALENDAR-IMPL-CRUDMANAGER.md) | Data loading/sync |
| [CALENDAR-IMPL-RECURRENCE.md](./CALENDAR-IMPL-RECURRENCE.md) | Recurrence details |
| [CALENDAR-DEEP-DIVE-STORES.md](./CALENDAR-DEEP-DIVE-STORES.md) | Store operaties |
| [CALENDAR-IMPL-STM-UNDOREDO.md](./CALENDAR-IMPL-STM-UNDOREDO.md) | State tracking |
| [DEEP-DIVE-DATA-FLOW.md](./DEEP-DIVE-DATA-FLOW.md) | Algemene data flow |

### Demo Referenties

| Demo | Beschrijving |
|------|--------------|
| `examples/recurring-events/` | Recurrence configuratie |
| `examples/multiassign/` | Multi-resource events |
| `examples/load-on-demand/` | Lazy data loading |
| `examples/undoredo/` | Undo/Redo functionaliteit |
| `examples/bigdataset/` | Performance met veel data |
| `examples/working-time/` | Calendar/working time |

### API Classes

| Class | Beschrijving |
|-------|--------------|
| `Calendar.model.ProjectModel` | Calendar project model |
| `Scheduler.model.EventModel` | Event model |
| `Scheduler.model.ResourceModel` | Resource model |
| `Scheduler.model.AssignmentModel` | Assignment model |
| `Scheduler.data.EventStore` | Event store |
| `Scheduler.data.ResourceStore` | Resource store |
| `Scheduler.data.CrudManager` | CRUD operaties |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
