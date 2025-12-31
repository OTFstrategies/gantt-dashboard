# CALENDAR-DEEP-DIVE-MIXINS.md
## Bryntum Calendar - Mixins Deep Dive

### Overzicht

Dit document beschrijft het mixin systeem van Bryntum Calendar. Mixins zijn een manier om functionaliteit te delen tussen classes zonder klassieke overerving. Ze zijn essentieel voor de modulaire architectuur van Bryntum en maken het mogelijk om functionaliteit te componeren.

---

## 1. Mixin Architectuur

### 1.1 Mixin Pattern in Bryntum

```typescript
/**
 * Bryntum gebruikt TypeScript generics voor type-safe mixins
 *
 * Pattern: (base: T) => AnyConstructor<InstanceType<T> & MixinClass>
 *
 * Dit betekent:
 * - base: De class die de mixin ontvangt
 * - Returns: Een nieuwe class die zowel base als mixin functionaliteit heeft
 */

// Voorbeeld van Bryntum's mixin export syntax:
// calendar.d.ts:11690
export const CalendarStores: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & CalendarStoresClass>

// calendar.d.ts:64891
export const CalendarMixin: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & CalendarMixinClass>

// calendar.d.ts:65033
export const DateRangeOwner: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & DateRangeOwnerClass>
```

### 1.2 Mixin Toepassen

```typescript
import { Base, Widget, CalendarStores, CalendarMixin } from '@bryntum/calendar';

// Eenvoudige mixin toepassing
class MyCalendar extends CalendarStores(CalendarMixin(Widget)) {
    // Nu heeft MyCalendar alle functionaliteit van:
    // - Widget (base class)
    // - CalendarMixin (event rendering, navigation)
    // - CalendarStores (data management)
}

// Of met meerdere mixins
class AdvancedCalendar extends CalendarStores(
    CalendarMixin(
        DateRangeOwner(
            EventSelection(Widget)
        )
    )
) {
    // Gecombineerde functionaliteit
}
```

---

## 2. CalendarStores Mixin

### 2.1 TypeScript Interface
```typescript
// calendar.d.ts:11508
type CalendarStoresClassConfig = {
    /**
     * AssignmentStore voor event-resource koppelingen
     */
    assignmentStore?: AssignmentStore | AssignmentStoreConfig

    /**
     * Inline assignments data
     */
    assignments?: AssignmentModel[] | AssignmentModelConfig[]

    /**
     * CrudManager voor server synchronisatie
     */
    crudManager?: CrudManagerConfig | SchedulerCrudManager

    /**
     * CrudManager class override
     */
    crudManagerClass?: SchedulerCrudManager

    /**
     * Default calendar/resource voor nieuwe events
     */
    defaultCalendar?: string | ResourceModel

    /**
     * Destroy stores bij component destroy
     */
    destroyStores?: boolean

    /**
     * EventStore voor calendar events
     */
    eventStore?: EventStore | EventStoreConfig

    /**
     * Inline events data
     */
    events?: EventModel[] | EventModelConfig[]

    /**
     * ProjectModel voor data management
     */
    project?: ProjectModel | ProjectModelConfig

    /**
     * ResourceStore voor resources/calendars
     */
    resourceStore?: ResourceStore | ResourceStoreConfig

    /**
     * ResourceTimeRangeStore
     */
    resourceTimeRangeStore?: ResourceTimeRangeStore | ResourceTimeRangeStoreConfig

    /**
     * Inline resource time ranges
     */
    resourceTimeRanges?: ResourceTimeRangeModel[] | ResourceTimeRangeModelConfig[]

    /**
     * Inline resources
     */
    resources?: ResourceModel[] | ResourceModelConfig[]

    /**
     * TimeRangeStore voor achtergrond markering
     */
    timeRangeStore?: TimeRangeStore | TimeRangeStoreConfig

    /**
     * Inline time ranges
     */
    timeRanges?: TimeRangeModel[] | TimeRangeModelConfig[]

    /**
     * Timezone configuratie
     */
    timeZone?: string | number

    /**
     * Data change event handler
     */
    onDataChange?: ((event: DataChangeEvent) => void) | string
}

// calendar.d.ts:11610
export class CalendarStoresClass extends ProjectConsumerClass {
    static readonly isCalendarStores: boolean
    readonly isCalendarStores: boolean

    // Store properties
    readonly assignmentStore: AssignmentStore
    readonly eventStore: EventStore
    readonly resourceStore: ResourceStore
    readonly resourceTimeRangeStore: ResourceTimeRangeStore
    readonly timeRangeStore: TimeRangeStore

    // Data properties
    assignments: AssignmentModel[] | AssignmentModelConfig[]
    events: EventModel[] | EventModelConfig[]
    resources: ResourceModel[] | ResourceModelConfig[]
    resourceTimeRanges: ResourceTimeRangeModel[] | ResourceTimeRangeModelConfig[]
    timeRanges: TimeRangeModel[] | TimeRangeModelConfig[]

    // Manager
    crudManager: SchedulerCrudManager
    defaultCalendar: ResourceModel

    // Events
    onDataChange: ((event: DataChangeEvent) => void) | string
}
```

### 2.2 CalendarStores Gebruik

```typescript
import { Calendar, CalendarStores, Widget } from '@bryntum/calendar';

// Eigen component met CalendarStores
class EventDashboard extends CalendarStores(Widget) {
    static configurable = {
        // CalendarStores configs automatisch beschikbaar
        events: [],
        resources: []
    };

    construct(config) {
        super.construct(config);

        // Stores zijn nu beschikbaar
        console.log('Events:', this.eventStore.count);
        console.log('Resources:', this.resourceStore.count);

        // Luister naar data changes
        this.on('dataChange', this.onDataChange);
    }

    onDataChange({ store, action, records }) {
        console.log(`${store.id}: ${action}`, records);
    }
}
```

---

## 3. CalendarMixin

### 3.1 TypeScript Interface
```typescript
// CalendarMixinClass bevat de core Calendar view functionaliteit
export class CalendarMixinClass {
    // Identificatie
    static readonly isCalendarMixin: boolean
    readonly isCalendarMixin: boolean

    // View configuratie
    autoCreate: boolean | AutoCreateConfig
    autoRowHeight: boolean
    dateFormat: string
    eventHeight: number
    eventRenderer: EventRendererFn
    eventSorter: (a: EventModel, b: EventModel) => number
    showResourceAvatars: boolean

    // Navigation
    date: Date
    readonly startDate: Date
    readonly endDate: Date

    // Events ophalen
    getEventsForDate(date: Date): EventModel[]
    getEventsInRange(start: Date, end: Date): EventModel[]

    // Event creatie
    createEvent(eventData: object): EventModel
    editEvent(eventRecord: EventModel): void

    // Scrolling
    scrollTo(target: Date | EventModel, options?: ScrollOptions): Promise<void>
}

// calendar.d.ts:64891
export const CalendarMixin: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & CalendarMixinClass>
```

### 3.2 AutoCreate Configuratie

```typescript
interface AutoCreateConfig {
    // Activeer auto-create bij dblclick/drag
    enabled: boolean

    // Snap naar tijdsinterval
    autoSnap: boolean | number     // true = 15 min, number = minuten

    // Initiële event duur
    duration: number               // Minuten
    durationUnit: string           // 'minute', 'hour', etc.

    // Open editor na creatie
    editOnCreate: boolean
}

const calendar = new Calendar({
    autoCreate: {
        enabled: true,
        autoSnap: 30,           // Snap naar 30 minuten
        duration: 60,           // 1 uur events
        durationUnit: 'minute',
        editOnCreate: true
    },

    listeners: {
        // Vang auto-create voor custom logic
        beforeAutoCreate({ date, resourceRecord }) {
            // Return false om te annuleren
            if (resourceRecord.readOnly) {
                return false;
            }
        },

        eventAutoCreated({ eventRecord }) {
            console.log('Event created:', eventRecord.name);
        }
    }
});
```

---

## 4. DateRangeOwner Mixin

### 4.1 TypeScript Interface
```typescript
// calendar.d.ts:64896
type DateRangeOwnerClassConfig = {
    /**
     * Centrale datum voor de view
     */
    date?: Date

    /**
     * Eind datum van de range
     */
    endDate?: Date

    /**
     * Vaste duur (niet aanpasbaar door date picker)
     */
    fixedDuration?: boolean

    /**
     * Range rond de date ('1 week', '1 month', etc.)
     */
    range?: string | DurationConfig

    /**
     * Increment voor next/previous navigatie
     */
    shiftIncrement?: string | DurationConfig

    /**
     * Start datum van de range
     */
    startDate?: Date

    /**
     * Range change handler
     */
    onRangeChange?: ((event: RangeChangeEvent) => void) | string
}

// calendar.d.ts:64958
export class DateRangeOwnerClass {
    static readonly isDateRangeOwner: boolean
    readonly isDateRangeOwner: boolean

    // Properties
    date: Date
    readonly endDate: Date
    readonly startDate: Date
    fixedDuration: boolean
    range: string | DurationConfig
    shiftIncrement: string | DurationConfig

    // Methods
    next(): void
    previous(): void

    // Events
    onRangeChange: ((event: RangeChangeEvent) => void) | string
    onShiftIncrementChange: ((event: object) => void) | string
}
```

### 4.2 DateRangeOwner Gebruik

```typescript
import { Widget, DateRangeOwner } from '@bryntum/calendar';

class CustomDateView extends DateRangeOwner(Widget) {
    static configurable = {
        date: new Date(),
        range: '1 week',
        shiftIncrement: '1 week'
    };

    construct(config) {
        super.construct(config);

        // Luister naar range changes
        this.on('rangeChange', ({ old, new: newRange }) => {
            console.log('Range changed:', {
                from: `${old.startDate} - ${old.endDate}`,
                to: `${newRange.startDate} - ${newRange.endDate}`
            });
        });
    }

    // Implementeer navigatie buttons
    onNextClick() {
        this.next();  // Van DateRangeOwner
    }

    onPreviousClick() {
        this.previous();  // Van DateRangeOwner
    }

    // Ga naar specifieke datum
    goToDate(date: Date) {
        this.date = date;  // Triggert rangeChange
    }
}
```

---

## 5. DayCellCollecter Mixin

### 5.1 DayCell Data Structure
```typescript
// calendar.d.ts:738
// De DayCell wordt gecreëerd door DayCellCollecter views

interface DayCell {
    // Basis datum info
    date: Date
    day: number              // Dag van de week (0-6)
    week: number             // Week nummer
    isToday: boolean
    isWeekend: boolean
    isOtherMonth: boolean    // Voor maand view

    // Events voor deze cel
    events: EventModel[]
    allEvents: EventModel[]          // Inclusief all-day
    intraDayEvents: EventModel[]     // Alleen tijd-gebaseerd
    allDayEvents: EventModel[]       // Alleen all-day

    // Event bars (gerenderde representaties)
    renderedEvents: EventBar[]
    resourceDayEvents: EventModel[]  // Per resource

    // Overflow
    overflowCount: number
    hasOverflow: boolean
}

interface EventBar {
    eventRecord: EventModel
    startDate: Date
    endDate: Date
    isStart: boolean         // Start in deze cel
    isEnd: boolean           // Eindigt in deze cel
    column: number           // Kolom positie (voor overlap)
    row: number              // Rij positie
    span: number             // Aantal dagen (multi-day)
}
```

### 5.2 DayCellCollecter Implementatie
```typescript
// calendar.d.ts:65137
export const DayCellCollecter: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & DayCellCollecterClass>

// Eigen implementatie
class CustomMonthView extends DayCellCollecter(CalendarMixin(Widget)) {
    // Collecteer cells voor de huidige maand
    collectDayCells(startDate: Date, endDate: Date): DayCell[] {
        const cells: DayCell[] = [];
        const current = new Date(startDate);

        while (current < endDate) {
            cells.push(this.createDayCell(current));
            current.setDate(current.getDate() + 1);
        }

        return cells;
    }

    createDayCell(date: Date): DayCell {
        const events = this.getEventsForDate(date);
        const today = new Date();

        return {
            date: new Date(date),
            day: date.getDay(),
            week: this.getWeekNumber(date),
            isToday: this.isSameDay(date, today),
            isWeekend: date.getDay() === 0 || date.getDay() === 6,
            isOtherMonth: date.getMonth() !== this.date.getMonth(),
            events,
            allEvents: events,
            intraDayEvents: events.filter(e => !e.allDay),
            allDayEvents: events.filter(e => e.allDay),
            renderedEvents: [],
            resourceDayEvents: [],
            overflowCount: 0,
            hasOverflow: false
        };
    }

    private getWeekNumber(date: Date): number {
        const firstJan = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor(
            (date.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000)
        );
        return Math.ceil((days + firstJan.getDay() + 1) / 7);
    }
}
```

---

## 6. DayCellRenderer Mixin

### 6.1 TypeScript Interface
```typescript
// calendar.d.ts:65295
export const DayCellRenderer: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & DayCellRendererClass>

interface DayCellRendererClass {
    // Overflow popup voor "more" events
    overflowPopup: Popup

    // Render een dag cel
    renderDayCell(dayCell: DayCell): DomConfig

    // Render events in cel
    renderEventsForCell(dayCell: DayCell): DomConfig[]

    // Handle overflow
    showOverflowPopup(date: Date): void
    hideOverflowPopup(): void
}
```

### 6.2 DayCellRenderer Implementatie
```typescript
class CustomCellRenderer extends DayCellRenderer(DayCellCollecter(Widget)) {
    static configurable = {
        maxEventsPerCell: 3
    };

    renderDayCell(dayCell: DayCell): DomConfig {
        const visibleEvents = dayCell.events.slice(0, this.maxEventsPerCell);
        const overflowCount = Math.max(0,
            dayCell.events.length - this.maxEventsPerCell
        );

        return {
            tag: 'div',
            className: {
                'b-day-cell': true,
                'b-today': dayCell.isToday,
                'b-weekend': dayCell.isWeekend,
                'b-other-month': dayCell.isOtherMonth,
                'b-has-overflow': overflowCount > 0
            },
            dataset: {
                date: dayCell.date.toISOString()
            },
            children: [
                // Dag nummer
                {
                    tag: 'div',
                    className: 'b-day-number',
                    text: dayCell.date.getDate()
                },
                // Events container
                {
                    tag: 'div',
                    className: 'b-day-events',
                    children: visibleEvents.map(event =>
                        this.renderEvent(event, dayCell)
                    )
                },
                // Overflow indicator
                overflowCount > 0 ? {
                    tag: 'div',
                    className: 'b-overflow-indicator',
                    text: `+${overflowCount} meer`,
                    dataset: {
                        date: dayCell.date.toISOString(),
                        count: overflowCount
                    }
                } : null
            ].filter(Boolean)
        };
    }

    renderEvent(event: EventModel, dayCell: DayCell): DomConfig {
        return {
            tag: 'div',
            className: {
                'b-cal-event': true,
                'b-allday': event.allDay,
                [`b-${event.eventColor}`]: true
            },
            text: event.name,
            dataset: {
                eventId: event.id
            }
        };
    }
}
```

---

## 7. EventSelection Mixin

### 7.1 TypeScript Interface
```typescript
// calendar.d.ts:18307
export const EventSelection: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & EventSelectionClass>

interface EventSelectionClassConfig {
    // Selectie modus
    selectionMode?: 'single' | 'multi'

    // Allow deselect
    deselectOnClick?: boolean

    // Disable selectie
    eventSelectionDisabled?: boolean

    // Initiële selectie
    selectedEvents?: EventModel[]
}

interface EventSelectionClass {
    // Geselecteerde events
    selectedEvents: EventModel[]

    // Laatste geselecteerde event
    readonly selectedEvent: EventModel | null

    // Selectie methodes
    selectEvent(eventRecord: EventModel, preserveSelection?: boolean): void
    deselectEvent(eventRecord: EventModel): void
    deselectAllEvents(): void
    isEventSelected(eventRecord: EventModel): boolean

    // Events
    onEventSelectionChange: (event: SelectionChangeEvent) => void
}
```

### 7.2 EventSelection Gebruik

```typescript
import { Calendar, EventSelection, Widget } from '@bryntum/calendar';

class SelectableCalendar extends EventSelection(CalendarMixin(Widget)) {
    static configurable = {
        selectionMode: 'multi',
        deselectOnClick: true
    };

    construct(config) {
        super.construct(config);

        // Luister naar selectie changes
        this.on('eventSelectionChange', this.onSelectionChange);
    }

    onSelectionChange({ selection, deselected, selected }) {
        console.log('Selection changed:');
        console.log('  Total selected:', selection.length);
        console.log('  Newly selected:', selected);
        console.log('  Deselected:', deselected);

        // Update UI
        this.updateSelectionIndicator();
    }

    updateSelectionIndicator() {
        const count = this.selectedEvents.length;
        if (count > 0) {
            this.showMessage(`${count} event(s) geselecteerd`);
        }
    }

    // Batch selectie
    selectEventsForDate(date: Date) {
        const events = this.getEventsForDate(date);
        events.forEach((event, index) => {
            this.selectEvent(event, index > 0); // Preserve na eerste
        });
    }

    // Verwijder geselecteerde
    deleteSelected() {
        const toDelete = [...this.selectedEvents];
        this.deselectAllEvents();
        toDelete.forEach(event => this.eventStore.remove(event));
    }
}
```

---

## 8. EventNavigation Mixin

### 8.1 TypeScript Interface
```typescript
// calendar.d.ts:18119
export const EventNavigation: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & EventNavigationClass>

interface EventNavigationClass {
    // Huidige focus
    readonly activeEvent: EventModel | null

    // Navigatie
    navigateToEvent(eventRecord: EventModel): void
    navigatePrevEvent(): void
    navigateNextEvent(): void

    // Focus
    focusEvent(eventRecord: EventModel): void
    blurEvent(): void
}
```

### 8.2 Keyboard Navigation Implementatie

```typescript
class NavigableCalendar extends EventNavigation(EventSelection(CalendarMixin(Widget))) {
    static configurable = {
        keyMap: {
            'ArrowUp': 'navigatePrevEvent',
            'ArrowDown': 'navigateNextEvent',
            'Enter': 'activateEvent',
            'Delete': 'deleteActiveEvent',
            'Escape': 'deselectAllEvents'
        }
    };

    activateEvent() {
        if (this.activeEvent) {
            this.editEvent(this.activeEvent);
        }
    }

    deleteActiveEvent() {
        if (this.activeEvent) {
            const event = this.activeEvent;
            this.navigateNextEvent() || this.navigatePrevEvent();
            this.eventStore.remove(event);
        }
    }

    // Custom navigatie
    navigateToNextWeek() {
        if (this.activeEvent) {
            const nextWeekDate = new Date(this.activeEvent.startDate);
            nextWeekDate.setDate(nextWeekDate.getDate() + 7);

            const events = this.getEventsForDate(nextWeekDate);
            if (events.length > 0) {
                this.navigateToEvent(events[0]);
            }
        }
    }
}
```

---

## 9. EventRenderer Mixin

### 9.1 TypeScript Interface
```typescript
// calendar.d.ts:65428
export const EventRenderer: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & EventRendererClass>

interface EventRendererClass {
    // Render een event
    renderEvent(eventRecord: EventModel, renderData: EventRenderData): DomConfig

    // Event renderer functie
    eventRenderer: (detail: EventRendererDetail) => string | DomConfig

    // Event sortering
    eventSorter: (a: EventModel, b: EventModel) => number
}

interface EventRendererDetail {
    eventRecord: EventModel
    resourceRecord: ResourceModel
    assignmentRecord: AssignmentModel
    renderData: EventRenderData
}

interface EventRenderData {
    event: EventModel
    cls: DomClassList
    wrapperCls: DomClassList
    iconCls: DomClassList | null
    left: number
    width: number
    height: number
    style: Record<string, string>
    wrapperStyle: Record<string, string>
    eventStyle: EventStyle
    eventColor: string
    ariaLabel: string
    children: DomConfig[]
}
```

### 9.2 Custom EventRenderer

```typescript
class StyledCalendar extends EventRenderer(CalendarMixin(Widget)) {
    static configurable = {
        // Custom renderer
        eventRenderer({ eventRecord, resourceRecord, renderData }) {
            // Custom styling
            renderData.cls.add('my-custom-event');

            // Status-based styling
            if (eventRecord.getData('completed')) {
                renderData.cls.add('completed');
                renderData.iconCls = 'fa fa-check';
            }

            // Priority indicator
            const priority = eventRecord.getData('priority');
            if (priority) {
                renderData.cls.add(`priority-${priority}`);
            }

            // Custom content
            return {
                tag: 'div',
                className: 'event-content',
                children: [
                    {
                        tag: 'span',
                        className: 'event-time',
                        text: this.formatTime(eventRecord.startDate)
                    },
                    {
                        tag: 'span',
                        className: 'event-name',
                        text: eventRecord.name
                    },
                    resourceRecord ? {
                        tag: 'span',
                        className: 'event-resource',
                        text: resourceRecord.name
                    } : null
                ].filter(Boolean)
            };
        },

        // Custom sortering
        eventSorter(a, b) {
            // Priority eerst (hoog naar laag)
            const priorityA = a.getData('priority') || 0;
            const priorityB = b.getData('priority') || 0;

            if (priorityB !== priorityA) {
                return priorityB - priorityA;
            }

            // Dan op startDate
            return a.startDate.getTime() - b.startDate.getTime();
        }
    };

    formatTime(date: Date): string {
        return date.toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
```

---

## 10. Store Mixins

### 10.1 Beschikbare Store Mixins

```typescript
// Data manipulation
export const StoreCRUD: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & StoreCRUDClass>

// Filtering
export const StoreFilter: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & StoreFilterClass>

// Sortering
export const StoreSort: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & StoreSortClass>

// Groupering
export const StoreGroup: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & StoreGroupClass>

// Chaining (gelinkte stores)
export const StoreChained: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & StoreChainedClass>

// Change tracking
export const StoreChanges: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & StoreChangesClass>

// Zoeken
export const StoreSearch: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & StoreSearchClass>

// Paginering
export const StorePaging: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & StorePagingClass>

// Relaties
export const StoreRelation: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & StoreRelationClass>
```

### 10.2 Custom Store met Mixins

```typescript
import { Store, StoreCRUD, StoreFilter, StoreSort, StoreSearch } from '@bryntum/calendar';

// Combineer store mixins
class AdvancedEventStore extends StoreCRUD(
    StoreFilter(
        StoreSort(
            StoreSearch(Store)
        )
    )
) {
    static configurable = {
        modelClass: EventModel,

        // Standaard sortering
        sorters: [
            { field: 'startDate', direction: 'ASC' }
        ],

        // Standaard filters
        filters: [
            { property: 'cancelled', value: false }
        ]
    };

    // Custom methodes
    searchEvents(query: string): EventModel[] {
        return this.search(query, ['name', 'description']);
    }

    getUpcomingEvents(days: number = 7): EventModel[] {
        const now = new Date();
        const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        return this.query(record =>
            record.startDate >= now && record.startDate <= future
        );
    }

    getPriorityEvents(): EventModel[] {
        this.addFilter({
            id: 'priority',
            filterBy: record => record.getData('priority') === 'high'
        });

        const results = this.records.slice();

        this.removeFilter('priority');

        return results;
    }
}
```

---

## 11. Model Mixins

### 11.1 ModelLink Mixin
```typescript
// calendar.d.ts:72664
export const ModelLink: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & ModelLinkClass>

interface ModelLinkClass {
    // Linked records
    linkedRecords: Map<string, Model>

    // Link management
    link(key: string, record: Model): void
    unlink(key: string): void
    getLinked(key: string): Model | null
}

// Gebruik
class LinkedEventModel extends ModelLink(EventModel) {
    // Link event aan externe systemen
    linkToTicket(ticketRecord: TicketModel) {
        this.link('ticket', ticketRecord);
    }

    get ticket(): TicketModel | null {
        return this.getLinked('ticket') as TicketModel;
    }
}
```

---

## 12. Eigen Mixins Maken

### 12.1 Mixin Factory Pattern

```typescript
// Definieer mixin factory
function Schedulable<T extends AnyConstructor<Model>>(base: T) {
    return class extends base {
        static configurable = {
            ...base.configurable,

            // Nieuwe velden
            scheduledBy: null,
            scheduledAt: null,
            scheduleStatus: 'pending'
        };

        static fields = [
            ...(base.fields || []),
            { name: 'scheduledBy', type: 'string' },
            { name: 'scheduledAt', type: 'date' },
            { name: 'scheduleStatus', type: 'string', defaultValue: 'pending' }
        ];

        // Mixin methodes
        schedule(userId: string): void {
            this.set({
                scheduledBy: userId,
                scheduledAt: new Date(),
                scheduleStatus: 'scheduled'
            });
        }

        unschedule(): void {
            this.set({
                scheduledBy: null,
                scheduledAt: null,
                scheduleStatus: 'pending'
            });
        }

        get isScheduled(): boolean {
            return this.scheduleStatus === 'scheduled';
        }
    };
}

// Toepassen
class SchedulableEvent extends Schedulable(EventModel) {
    // Extra event-specifieke logica
}
```

### 12.2 View Mixin Factory

```typescript
// View mixin voor analytics
function Analytics<T extends AnyConstructor<Widget>>(base: T) {
    return class extends base {
        static configurable = {
            ...base.configurable,
            trackingEnabled: true,
            analyticsEndpoint: null
        };

        construct(config: object) {
            super.construct(config);

            if (this.trackingEnabled) {
                this.initTracking();
            }
        }

        initTracking(): void {
            // Track view changes
            this.on('modeChange', this.trackModeChange);

            // Track event interactions
            this.on('eventClick', this.trackEventClick);
            this.on('eventCreate', this.trackEventCreate);
        }

        trackModeChange({ mode }: { mode: string }): void {
            this.sendAnalytics('view_change', { mode });
        }

        trackEventClick({ eventRecord }: { eventRecord: EventModel }): void {
            this.sendAnalytics('event_click', {
                eventId: eventRecord.id,
                eventType: eventRecord.getData('type')
            });
        }

        trackEventCreate({ eventRecord }: { eventRecord: EventModel }): void {
            this.sendAnalytics('event_create', {
                eventId: eventRecord.id
            });
        }

        sendAnalytics(event: string, data: object): void {
            if (this.analyticsEndpoint) {
                fetch(this.analyticsEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event, data, timestamp: Date.now() })
                }).catch(console.error);
            }
        }
    };
}

// Gebruik
class TrackedCalendar extends Analytics(Calendar) {
    static configurable = {
        trackingEnabled: true,
        analyticsEndpoint: '/api/analytics'
    };
}
```

---

## 13. Gerelateerde Bestanden

### Bryntum Source Files
- `calendar.d.ts` regel 11508: CalendarStoresClassConfig
- `calendar.d.ts` regel 11610: CalendarStoresClass
- `calendar.d.ts` regel 11690: CalendarStores export
- `calendar.d.ts` regel 64891: CalendarMixin export
- `calendar.d.ts` regel 64896: DateRangeOwnerClassConfig
- `calendar.d.ts` regel 64958: DateRangeOwnerClass
- `calendar.d.ts` regel 65033: DateRangeOwner export
- `calendar.d.ts` regel 65137: DayCellCollecter export
- `calendar.d.ts` regel 65295: DayCellRenderer export
- `calendar.d.ts` regel 65428: EventRenderer export
- `calendar.d.ts` regel 18119: EventNavigation export
- `calendar.d.ts` regel 18307: EventSelection export

### Store Mixins
- `calendar.d.ts` regel 72935: StoreCRUD
- `calendar.d.ts` regel 73051: StoreChained
- `calendar.d.ts` regel 73100: StoreChanges
- `calendar.d.ts` regel 73235: StoreFilter
- `calendar.d.ts` regel 73339: StoreGroup
- `calendar.d.ts` regel 73458: StorePaging
- `calendar.d.ts` regel 73555: StoreSearch
- `calendar.d.ts` regel 73696: StoreSort

---

## 14. Samenvatting

Bryntum Calendar gebruikt mixins voor:

1. **CalendarStores**: Data management (stores, CRUD)
2. **CalendarMixin**: Core view functionaliteit
3. **DateRangeOwner**: Datum navigatie en ranges
4. **DayCellCollecter**: Verzamelen van dag data
5. **DayCellRenderer**: Renderen van dag cellen
6. **EventSelection**: Event selectie management
7. **EventNavigation**: Keyboard navigatie
8. **EventRenderer**: Custom event rendering
9. **Store Mixins**: Filter, sort, group, search
10. **Model Mixins**: Record linking

Mixin pattern:
```typescript
export const MixinName: <T extends AnyConstructor<Base>>(base: T) =>
    AnyConstructor<InstanceType<T> & MixinClass>
```

Toepassen:
```typescript
class MyClass extends Mixin1(Mixin2(Mixin3(BaseClass))) {}
```
