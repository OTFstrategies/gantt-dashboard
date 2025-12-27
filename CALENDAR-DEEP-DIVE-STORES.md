# CALENDAR-DEEP-DIVE-STORES.md
## Bryntum Calendar - Data Stores Systeem (Deep Dive)

### Overzicht

Dit document beschrijft het data store systeem van Bryntum Calendar. Het systeem bestaat uit drie primaire stores die samenwerken: EventStore, ResourceStore en AssignmentStore. Deze stores beheren alle data en bieden uitgebreide CRUD operaties, filtering, sorting en synchronisatie mogelijkheden.

---

## 1. Store Architectuur

### 1.1 Store Hiërarchie
```
Store (Core)
├── AjaxStore
│   ├── EventStore
│   ├── ResourceStore
│   └── AssignmentStore
└── TreeStore
    └── ResourceStore (tree mode)
```

### 1.2 Store Relaties
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   EventStore    │────▶│ AssignmentStore  │◀────│  ResourceStore  │
│                 │     │                  │     │                 │
│  - events       │     │  - eventId       │     │  - resources    │
│  - recurrence   │     │  - resourceId    │     │  - eventColor   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        └───────────────────────┼────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │    CrudManager        │
                    │                       │
                    │  - sync all stores    │
                    │  - batch operations   │
                    └───────────────────────┘
```

---

## 2. EventStore

### 2.1 EventStoreConfig (regel 233976)
```typescript
type EventStoreConfig = {
    // Data
    data?: object[] | Model[] | ModelConfig[]
    modelClass?: typeof EventModel

    // CRUD URLs
    createUrl?: string
    readUrl?: string
    updateUrl?: string
    deleteUrl?: string

    // Auto behavior
    autoLoad?: boolean
    autoCommit?: boolean
    autoCommitTimeout?: number
    autoTree?: boolean

    // Recurrence
    autoAdjustRecurrence?: boolean          // Pas recurrence aan bij reschedule

    // Filtering & Sorting
    filters?: CollectionFilterConfig | CollectionFilterConfig[]
    sorters?: object[] | string[]
    filterParamName?: string
    sortParamName?: string

    // Chaining
    chainFilters?: boolean
    chainedFilterFn?: (record: Model) => boolean
    chainedFields?: string[]
    masterStore?: Store

    // Lazy loading
    lazyLoad?: boolean | {
        bufferUnit: DurationUnit
        bufferAmount: number
        dateFormat: string
        loadFullResourceRange: boolean
        useResourceIds: boolean
    }

    // Fetch options
    fetchOptions?: object                   // Credentials, headers, etc.

    // Fields
    fields?: (string | ModelFieldConfig | DataField)[]

    // Listeners
    listeners?: object
}
```

### 2.2 EventStore Class (regel 234908)
```typescript
export class EventStore extends AjaxStore {
    // Type identifiers
    static readonly isEventStore: boolean
    static readonly isEventStoreMixin: boolean
    static readonly isGetEventsMixin: boolean
    static readonly isRecurringEventsMixin: boolean

    // Linked stores
    readonly assignmentStore: AssignmentStore
    readonly resourceStore: ResourceStore
    readonly dependencyStore: DependencyStore
    readonly project: SchedulerProjectModel

    // Properties
    data: EventModelConfig[]
    modelClass: typeof EventModel
    autoAdjustRecurrence: boolean
    lazyLoad: boolean | object

    // Methods
    getEvents(options: GetEventsOptions): EventModel[]
    getEventsForResource(resource: ResourceModel, startDate?: Date, endDate?: Date): EventModel[]
    getEventsByStartDate(startDate: Date): EventModel[]
    isEventAvailable(event: EventModel): boolean
    getRecurringEvents(): EventModel[]
    getOccurrencesForEvent(event: EventModel, startDate: Date, endDate: Date): EventModel[]
}
```

### 2.3 EventStore Events
```typescript
// Store lifecycle events
interface EventStoreEvents {
    // CRUD Events
    add: (event: { records: Model[], index: number }) => void
    beforeAdd: (event: { records: Model[] }) => boolean | void
    remove: (event: { records: Model[] }) => void
    beforeRemove: (event: { records: Model[] }) => boolean | void
    update: (event: { record: Model, changes: object }) => void
    beforeUpdate: (event: { record: Model, changes: object }) => boolean | void

    // Data events
    change: (event: {
        action: 'remove' | 'removeAll' | 'add' | 'clearchanges' | 'filter' | 'update' | 'dataset' | 'replace'
        records: Model[]
        changes?: object
    }) => void

    // Load/Sync events
    beforeLoad: (event: { params: object }) => boolean | void
    load: (event: { data: object[] }) => void
    beforeSync: (event: { changes: object }) => boolean | void
    sync: (event: { response: object }) => void

    // Filter/Sort events
    filter: (event: { filters: Collection }) => void
    beforeFilter: (event: { filters: Collection }) => void
    sort: (event: { sorters: Sorter[] }) => void
    beforeSort: (event: { sorters: Sorter[] }) => void

    // Commit events
    beforeCommit: (event: { changes: object }) => void
    commit: (event: { changes: object }) => void
}
```

---

## 3. ResourceStore

### 3.1 ResourceStoreConfig (regel 236162)
```typescript
type ResourceStoreConfig = {
    // Data
    data?: object[] | Model[] | ModelConfig[]
    modelClass?: typeof ResourceModel

    // CRUD URLs
    createUrl?: string
    readUrl?: string
    updateUrl?: string
    deleteUrl?: string

    // Auto behavior
    autoLoad?: boolean
    autoCommit?: boolean
    autoCommitTimeout?: number

    // Tree support
    tree?: boolean
    rootNode?: object
    autoTree?: boolean

    // Filtering & Sorting
    filters?: CollectionFilterConfig | CollectionFilterConfig[]
    sorters?: object[] | string[]

    // Chaining
    chainFilters?: boolean
    chainedFilterFn?: (record: Model) => boolean
    masterStore?: Store

    // Listeners
    listeners?: object
}
```

### 3.2 ResourceStore Class (regel 236988)
```typescript
export class ResourceStore extends AjaxStore {
    // Type identifiers
    static readonly isResourceStore: boolean

    // Linked stores
    readonly eventStore: EventStore
    readonly assignmentStore: AssignmentStore

    // Methods
    getEvents(resource: ResourceModel): EventModel[]
    getAssignments(resource: ResourceModel): AssignmentModel[]
    isAvailable(resource: ResourceModel, startDate: Date, endDate: Date): boolean
}
```

---

## 4. AssignmentStore

### 4.1 AssignmentStoreConfig (regel 228666)
```typescript
type AssignmentStoreConfig = {
    // Data
    data?: object[] | Model[] | ModelConfig[]
    modelClass?: typeof AssignmentModel

    // CRUD URLs
    createUrl?: string
    readUrl?: string
    updateUrl?: string
    deleteUrl?: string

    // Auto behavior
    autoLoad?: boolean
    autoCommit?: boolean
    autoCommitTimeout?: number

    // Listeners
    listeners?: object
}
```

### 4.2 AssignmentStore Class (regel 229567)
```typescript
export class AssignmentStore extends AjaxStore {
    // Type identifiers
    static readonly isAssignmentStore: boolean

    // Linked stores
    readonly eventStore: EventStore
    readonly resourceStore: ResourceStore

    // Methods
    getAssignmentsForEvent(event: EventModel): AssignmentModel[]
    getAssignmentsForResource(resource: ResourceModel): AssignmentModel[]
    getResourcesForEvent(event: EventModel): ResourceModel[]
    getEventsForResource(resource: ResourceModel): EventModel[]

    // Assignment methods
    assignEventToResource(event: EventModel, resource: ResourceModel): AssignmentModel
    unassignEventFromResource(event: EventModel, resource: ResourceModel): void
    isEventAssignedToResource(event: EventModel, resource: ResourceModel): boolean
}
```

---

## 5. Store Operaties

### 5.1 CRUD Operaties
```typescript
const { eventStore, resourceStore, assignmentStore } = calendar;

// CREATE
const newEvent = eventStore.add({
    name: 'New Meeting',
    startDate: new Date(),
    endDate: DateHelper.add(new Date(), 1, 'hour'),
    resourceId: 'r1'
});

// READ
const event = eventStore.getById(1);
const events = eventStore.records;
const filteredEvents = eventStore.query(e => e.name.includes('Meeting'));

// UPDATE
event.set('name', 'Updated Meeting');
event.set({
    startDate: new Date(),
    duration: 2,
    durationUnit: 'hour'
});

// DELETE
eventStore.remove(event);
// of
event.remove();

// Bulk operaties
eventStore.add([event1, event2, event3]);
eventStore.remove([event1, event2]);
```

### 5.2 Filtering
```typescript
// Simpele filter
eventStore.filter({
    property: 'name',
    value: 'Meeting',
    operator: 'includes'
});

// Filter met ID (vervangbaar)
eventStore.filter({
    id: 'nameFilter',
    filterBy: event => event.name.includes('Meeting')
});

// Meerdere filters
eventStore.filter([
    { property: 'status', value: 'active' },
    { filterBy: e => e.duration > 60 }
]);

// Filter verwijderen
eventStore.removeFilter('nameFilter');

// Alle filters clearen
eventStore.clearFilters();

// Filtered records
const visible = eventStore.records;           // Gefilterde records
const all = eventStore.allRecords;            // Alle records (incl. gefilterde)
```

### 5.3 Sorting
```typescript
// Simpele sort
eventStore.sort('startDate');

// Descending
eventStore.sort('startDate', false);

// Meerdere sorters
eventStore.sort([
    { field: 'startDate', ascending: true },
    { field: 'name', ascending: true }
]);

// Custom sort function
eventStore.sort({
    fn: (a, b) => {
        // Prioriteit eerst, dan datum
        if (a.priority !== b.priority) {
            return a.priority - b.priority;
        }
        return a.startDate - b.startDate;
    }
});
```

### 5.4 Grouping
```typescript
// Groeperen op veld
eventStore.group('resourceId');

// Custom grouper
eventStore.group({
    field: 'startDate',
    fn: (a, b) => {
        // Groepeer op maand
        const monthA = DateHelper.format(a.startDate, 'YYYY-MM');
        const monthB = DateHelper.format(b.startDate, 'YYYY-MM');
        return monthA.localeCompare(monthB);
    }
});

// Groep records ophalen
const groups = eventStore.getGroupRecords('r1');
```

---

## 6. Store Synchronisatie

### 6.1 Auto Sync
```typescript
const calendar = new Calendar({
    crudManager: {
        autoSync: true,
        autoSyncTimeout: 500,  // ms delay

        eventStore: {
            autoCommit: true,
            autoCommitTimeout: 100
        }
    }
});
```

### 6.2 Manual Sync
```typescript
// Sync alle stores via CrudManager
await calendar.crudManager.sync();

// Check for changes
if (calendar.crudManager.hasChanges) {
    await calendar.crudManager.sync();
}

// Commit changes per store
await eventStore.commit();
```

### 6.3 Change Tracking
```typescript
// Check wijzigingen
const changes = eventStore.changes;
// { added: [], modified: [], removed: [] }

// Per record
const record = eventStore.first;
const isModified = record.isModified;
const modifications = record.modifications;
const originalData = record.originalData;

// Wijzigingen ongedaan maken
record.revertChanges();

// Of voor hele store
eventStore.revertChanges();
```

---

## 7. Store Chaining

### 7.1 Chained Store Aanmaken
```typescript
// Master store
const masterEventStore = new EventStore({
    data: allEvents
});

// Chained store (gefilterde view)
const activeEventsStore = masterEventStore.chain(
    event => event.status === 'active'
);

// Wijzigingen in master propageren naar chain
masterEventStore.add({ name: 'New', status: 'active' });
// ^ Automatisch zichtbaar in activeEventsStore

// Chain met specifieke filters
const meetingsStore = masterEventStore.chain({
    filters: [
        { property: 'type', value: 'meeting' }
    ],
    chainFilters: true  // Ook master filters toepassen
});
```

### 7.2 Chained Fields
```typescript
const chainedStore = masterStore.chain({
    // Herfilter bij wijziging van deze velden
    chainedFields: ['status', 'priority', 'resourceId'],

    chainedFilterFn: record => {
        return record.status === 'active' &&
               record.priority > 0;
    }
});
```

---

## 8. Lazy Loading

### 8.1 Lazy Load Configuratie
```typescript
const calendar = new Calendar({
    crudManager: {
        eventStore: {
            lazyLoad: {
                bufferUnit: 'day',
                bufferAmount: 7,
                dateFormat: 'YYYY-MM-DD',
                loadFullResourceRange: true,
                useResourceIds: true
            }
        }
    }
});
```

### 8.2 Custom Lazy Load
```typescript
class CustomEventStore extends EventStore {
    async requestData({ startDate, endDate, resourceIds }) {
        const response = await fetch('/api/events', {
            method: 'POST',
            body: JSON.stringify({
                start: DateHelper.format(startDate, 'YYYY-MM-DD'),
                end: DateHelper.format(endDate, 'YYYY-MM-DD'),
                resources: resourceIds
            })
        });

        const data = await response.json();
        return data.events;
    }
}
```

---

## 9. Store Indices

### 9.1 Automatische Indices
```typescript
// EventStore heeft automatische indices voor:
// - id (primary key)
// - startDate
// - endDate
// - resourceId

// Snel opzoeken via index
const event = eventStore.getById(123);
const eventsOnDate = eventStore.getEventsByStartDate(new Date());
```

### 9.2 Custom Indices
```typescript
class CustomEventStore extends EventStore {
    static configurable = {
        // Custom index op type veld
        indices: {
            type: {
                unique: false,
                property: 'type'
            }
        }
    };

    getEventsByType(type) {
        return this.storage.findItem('type', type);
    }
}
```

---

## 10. Store Events Listeners

### 10.1 Inline Listeners
```typescript
const calendar = new Calendar({
    crudManager: {
        eventStore: {
            listeners: {
                add({ records }) {
                    console.log('Events added:', records);
                },

                update({ record, changes }) {
                    console.log('Event updated:', record.name, changes);
                },

                remove({ records }) {
                    console.log('Events removed:', records);
                },

                load({ data }) {
                    console.log('Store loaded:', data.length, 'records');
                }
            }
        }
    }
});
```

### 10.2 Dynamic Listeners
```typescript
// Listener toevoegen
const detacher = eventStore.on({
    add({ records }) {
        // Handle add
    },

    update({ record, changes }) {
        // Handle update
    }
});

// Listener verwijderen
detacher();

// Of met un()
eventStore.un('add', handler);
```

### 10.3 beforeXxx Events (Vetoable)
```typescript
eventStore.on({
    beforeAdd({ records }) {
        // Valideer nieuwe events
        for (const record of records) {
            if (!record.name) {
                Toast.show('Event moet een naam hebben');
                return false;  // Annuleer toevoegen
            }
        }
    },

    beforeRemove({ records }) {
        // Voorkom verwijderen van recurring base
        for (const record of records) {
            if (record.isRecurring && record.isRecurrenceBase) {
                Toast.show('Kan recurring event niet verwijderen');
                return false;
            }
        }
    },

    beforeUpdate({ record, changes }) {
        // Valideer wijzigingen
        if (changes.startDate && changes.startDate < new Date()) {
            Toast.show('Kan event niet in verleden plaatsen');
            return false;
        }
    }
});
```

---

## 11. Implementatie Richtlijnen

### 11.1 Eigen Store Systeem
```typescript
interface StoreConfig<T> {
    data?: T[];
    modelClass?: new (data: any) => T;
    autoLoad?: boolean;
    filters?: FilterConfig[];
    sorters?: SorterConfig[];
}

class Store<T extends Model> extends EventEmitter {
    private records: Map<string | number, T> = new Map();
    private filteredRecords: T[] = [];
    private filters: Filter[] = [];
    private sorters: Sorter[] = [];

    add(data: Partial<T> | Partial<T>[]): T[] {
        const items = Array.isArray(data) ? data : [data];
        const added: T[] = [];

        for (const item of items) {
            const record = new this.modelClass(item);
            this.records.set(record.id, record);
            added.push(record);
        }

        this.applyFiltersAndSort();
        this.emit('add', { records: added });
        return added;
    }

    remove(records: T | T[]): void {
        const items = Array.isArray(records) ? records : [records];
        const removed: T[] = [];

        for (const record of items) {
            if (this.records.delete(record.id)) {
                removed.push(record);
            }
        }

        this.applyFiltersAndSort();
        this.emit('remove', { records: removed });
    }

    filter(config: FilterConfig): void {
        const filter = new Filter(config);
        const existingIndex = this.filters.findIndex(f => f.id === filter.id);

        if (existingIndex >= 0) {
            this.filters[existingIndex] = filter;
        } else {
            this.filters.push(filter);
        }

        this.applyFiltersAndSort();
        this.emit('filter', { filters: this.filters });
    }

    private applyFiltersAndSort(): void {
        let records = [...this.records.values()];

        // Apply filters
        for (const filter of this.filters) {
            records = records.filter(r => filter.match(r));
        }

        // Apply sorters
        for (const sorter of this.sorters.reverse()) {
            records.sort((a, b) => sorter.compare(a, b));
        }

        this.filteredRecords = records;
    }

    get data(): T[] {
        return this.filteredRecords;
    }

    get allRecords(): T[] {
        return [...this.records.values()];
    }
}
```

### 11.2 Store Relatie Manager
```typescript
class StoreRelationManager {
    private eventStore: Store<EventModel>;
    private resourceStore: Store<ResourceModel>;
    private assignmentStore: Store<AssignmentModel>;

    getEventsForResource(resourceId: string): EventModel[] {
        const assignments = this.assignmentStore.data.filter(
            a => a.resourceId === resourceId
        );
        return assignments.map(a =>
            this.eventStore.getById(a.eventId)
        ).filter(Boolean);
    }

    getResourcesForEvent(eventId: string): ResourceModel[] {
        const assignments = this.assignmentStore.data.filter(
            a => a.eventId === eventId
        );
        return assignments.map(a =>
            this.resourceStore.getById(a.resourceId)
        ).filter(Boolean);
    }

    assignEventToResource(eventId: string, resourceId: string): void {
        const existing = this.assignmentStore.data.find(
            a => a.eventId === eventId && a.resourceId === resourceId
        );

        if (!existing) {
            this.assignmentStore.add({
                eventId,
                resourceId
            });
        }
    }

    unassignEventFromResource(eventId: string, resourceId: string): void {
        const assignment = this.assignmentStore.data.find(
            a => a.eventId === eventId && a.resourceId === resourceId
        );

        if (assignment) {
            this.assignmentStore.remove(assignment);
        }
    }
}
```

---

## 12. Gerelateerde Bestanden

### Bryntum Source Files
- `calendar.d.ts` regel 233976-234117: EventStoreConfig
- `calendar.d.ts` regel 234908-235055: EventStore class
- `calendar.d.ts` regel 236162-236307: ResourceStoreConfig
- `calendar.d.ts` regel 228666-228759: AssignmentStoreConfig
- `calendar.d.ts` regel 229567: AssignmentStore class

---

## 13. Samenvatting

Het Store systeem biedt:

1. **Drie Primaire Stores**: EventStore, ResourceStore, AssignmentStore
2. **Relatie Management**: Via AssignmentStore of directe resourceId
3. **CRUD Operaties**: add, remove, update met events
4. **Filtering & Sorting**: Flexibele filter/sort configuratie
5. **Store Chaining**: Gefilterde views op master store
6. **Lazy Loading**: On-demand data loading
7. **Change Tracking**: modifications, originalData, revertChanges
8. **Auto Sync**: Via CrudManager met configurable delays
9. **Indices**: Snelle lookups via automatische indices

Implementatie-aandachtspunten:
- Stores zijn onderling gekoppeld via project reference
- beforeXxx events zijn vetoable (return false)
- Chain stores voor gefilterde views zonder data duplicatie
- Gebruik indices voor performance bij grote datasets
