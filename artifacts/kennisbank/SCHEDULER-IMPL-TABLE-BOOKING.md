# SchedulerPro Implementation: Table Booking

> **Implementatie guide** voor restaurant/venue table booking in Bryntum SchedulerPro: reserveringen, cleanup buffers, conflict detectie, date strip navigatie, en custom event rendering.

---

## Overzicht

Table booking scheduling visualiseert reserveringen per tafel met:

- **Reservation Model** - Gasten, aantal personen, VIP/birthday flags, allergieën
- **Cleanup Buffer** - Postamble voor schoonmaaktijd na reservering
- **Conflict Detection** - Overlappende reserveringen detecteren en highlighten
- **Date Strip** - Week-navigatie met conflict indicators
- **Custom Columns** - Aankomende gasten, starttijd, aantal personen
- **Grouping** - Tafels per ruimte gegroepeerd
- **Time Headers** - Aantal gasten per tijdslot in header

---

## 1. Data Model

### 1.1 Reservation (Event) Model

```javascript
import { EventModel, Duration } from '@bryntum/schedulerpro';

const statuses = [
    'not_arrived',
    'arrived',
    'in_bar',
    'all_seated',
    'paid',
    'all_guests_left'
];

class Reservation extends EventModel {
    static $name = 'Reservation';

    static fields = [
        { name: 'reservedBy' },                                    // Naam van gast
        { name: 'durationUnit', defaultValue: 'h' },
        { name: 'nbrGuests', defaultValue: 2 },                    // Aantal gasten
        { name: 'isBirthday', type: 'boolean', defaultValue: false },
        { name: 'isVip', type: 'boolean', defaultValue: false },
        { name: 'tags', type: 'array', defaultValue: [] },         // Tags
        { name: 'allergies', type: 'array', defaultValue: [] },    // Allergieën
        { name: 'status', defaultValue: 'not_arrived' },
        { name: 'isNewGuest', type: 'boolean' },                   // Nieuwe gast
        { name: 'creditCard', type: 'boolean' },                   // CC geregistreerd

        // Cleanup buffer (postamble)
        {
            name: 'postamble',
            dataSource: 'cleanupBuffer',
            convert: value => value
                ? new Duration(typeof value === 'number' ? value + 'min' : value)
                : null
        }
    ];
}
```

### 1.2 Table (Resource) Model

```javascript
import { ResourceModel, DateHelper } from '@bryntum/schedulerpro';

class Table extends ResourceModel {
    static $name = 'Table';

    static fields = [
        { name: 'seats' },        // Aantal stoelen
        { name: 'room' },         // Ruimte voor grouping
        { name: 'name', convert: (val, data) => data?.id }
    ];

    // Vind lopende of volgende reservering
    getOngoingOrNextEvent(options = {}) {
        const
            { eventStore } = this,
            now = new Date(),
            {
                startDate = now,
                endDate = DateHelper.add(startDate, 1, 'year'),
                ignoreOngoing = false
            } = options;

        if (!this.events.length) {
            return null;
        }

        if (!ignoreOngoing) {
            // Check lopende events
            const ongoing = eventStore.getEvents({
                resourceRecord: this,
                startDate,
                endDate,
                includeOccurrences: false,
                allowPartial: true
            });

            if (ongoing.length) {
                return ongoing.sort((a, b) => a.endDate - b.endDate)[0];
            }
        }

        // Anders dichtstbijzijnde toekomstige start
        const upcomingEvents = eventStore.getEvents({
            resourceRecord: this,
            startDate,
            endDate,
            includeOccurrences: false,
            allowPartial: false
        }).sort((a, b) => a.startDate - b.startDate);

        return upcomingEvents[0] || null;
    }

    get ongoingOrNextReservation() {
        const { referenceDate } = this;
        return this.getOngoingOrNextEvent({
            startDate: referenceDate,
            endDate: DateHelper.getStartOfNextDay(referenceDate, true)
        });
    }

    // Getters voor column display
    get nextGuestName() {
        return this.ongoingOrNextReservation?.reservedBy;
    }

    get nextReservationNbrGuests() {
        return this.ongoingOrNextReservation?.nbrGuests;
    }

    get nextReservationStart() {
        return this.ongoingOrNextReservation?.startDate;
    }

    get nextGuestCC() {
        return this.ongoingOrNextReservation?.creditCard;
    }

    get referenceDate() {
        return this.stores[0].eventStore.crudManager.timeRangeStore.first.startDate;
    }
}
```

---

## 2. Scheduler Configuration

### 2.1 Basic Setup

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

class TableScheduler extends SchedulerPro {
    static configurable = {
        rowHeight: 30,
        tickSize: 45,
        barMargin: 2,
        eventColor: 'blue',
        eventLayout: 'none',
        snap: true,
        zoomOnMouseWheel: false,
        zoomOnTimeAxisDoubleClick: false,

        dayStartHour: 17,  // Restaurant open 17:00
        dayEndHour: 24,    // Tot middernacht

        subGridConfigs: {
            locked: { minWidth: 150 }
        },

        selectionMode: {
            deselectOnClick: true
        },

        timeResolution: {
            increment: 15,
            unit: 'min'
        }
    };
}
```

### 2.2 Custom Columns

```javascript
columns: [
    {
        collapsible: true,
        collapseMode: 'toggleAll',
        text: 'Restaurant Tables',
        children: [
            // Creditcard indicator
            {
                width: 40,
                ariaLabel: 'Credit card provided',
                field: 'nextGuestCC',
                htmlEncode: false,
                renderer: ({ value }) => value
                    ? '<i class="fa fa-credit-card" data-btip="Credit card supplied"></i>'
                    : ''
            },

            // Starttijd
            {
                type: 'date',
                text: 'Start',
                width: 100,
                field: 'nextReservationStart',
                renderer: ({ value }) => value && DateHelper.format(value, 'LST')
            },

            // Aantal gasten
            {
                text: '#',
                width: 50,
                align: 'center',
                ariaLabel: 'Number of guests',
                field: 'nextReservationNbrGuests'
            },

            // Gastnaam
            {
                text: 'Name',
                width: 160,
                field: 'nextGuestName'
            },

            // Volgende reservering na huidige
            {
                text: 'Next',
                type: 'date',
                width: 100,
                renderer: ({ record, grid: scheduler }) => {
                    const refEvent = record.getOngoingOrNextEvent({
                        startDate: scheduler.referenceDate,
                        endDate: scheduler.timeAxis.endDate
                    });

                    const nextEvent = record.getOngoingOrNextEvent({
                        startDate: refEvent?.endDate,
                        endDate: scheduler.timeAxis.endDate,
                        ignoreOngoing: true
                    });

                    return nextEvent
                        ? DateHelper.format(nextEvent.startDate, 'LST')
                        : '';
                }
            },

            // Tafel met aantal stoelen
            {
                text: 'Table',
                width: 80,
                field: 'id',
                htmlEncode: false,
                renderer: ({ record }) => `
                    ${record.id}
                    <span class="b-table-seats" data-btip="${record.seats} seats">
                        <i class="fa fa-chair"></i>${record.seats}
                    </span>
                `
            }
        ]
    }
]
```

---

## 3. Features Configuration

### 3.1 Event Buffer & Cleanup Time

```javascript
features: {
    // Cleanup buffer visualisatie
    eventBuffer: {
        showDuration: false  // Verberg duratie label in buffer
    },

    // Alleen resize aan rechterkant
    eventResize: {
        leftHandle: false
    },

    // Drag in één richting
    eventDrag: {
        singleDirection: true
    }
}
```

### 3.2 Grouping per Room

```javascript
features: {
    group: {
        headerHeight: 30,
        field: 'room',
        renderer: ({ groupRowFor, isFirstColumn }) =>
            isFirstColumn && groupRowFor
    }
}
```

### 3.3 Time Ranges (Reference Line)

```javascript
features: {
    timeRanges: {
        showTooltip: false,
        showHeaderElements: true,
        enableResizing: true,

        headerRenderer({ timeRange }) {
            return DateHelper.format(timeRange.startDate, 'LST');
        }
    }
},

timeRanges: [{
    id: 1,
    duration: 0,
    startDate: new Date(2025, 10, 10, 17, 45),
    endDate: new Date(2025, 10, 10, 17, 45)
}]
```

---

## 4. Custom View Preset

### 4.1 Time Headers met Guest Count

```javascript
viewPreset: {
    base: 'hourAndDay',
    headers: [
        {
            unit: 'minute',
            increment: 15,
            // Toon totaal aantal gasten dat arriveert
            renderer: (startDate, endDate, cellData, i, scheduler) => {
                let totalGuestsArriving = 0;

                scheduler.eventStore.forEach(event => {
                    if (event.startDate - startDate === 0) {
                        totalGuestsArriving += event.nbrGuests;
                    }
                });

                return totalGuestsArriving || '';
            }
        },
        {
            unit: 'minute',
            increment: 15,
            renderer(startDate, end, cellData) {
                const minutes = startDate.getMinutes();

                // Styling verschil voor uren vs minuten
                cellData.headerCellCls = minutes === 0 ? 'hour' : 'minute';

                return minutes === 0
                    ? DateHelper.format(startDate, 'h')
                    : minutes;
            }
        }
    ]
}
```

---

## 5. Event Rendering

### 5.1 Custom Event Renderer

```javascript
eventRenderer({ eventRecord, resourceRecord, renderData }) {
    const labels = [
        ...eventRecord.tags,
        ...eventRecord.allergies
    ];

    if (eventRecord.isVip) labels.push('VIP');
    if (eventRecord.isBirthday) labels.push('BDAY');

    renderData.cls['b-new-guest'] = eventRecord.isNewGuest;

    return [
        {
            class: 'b-guest-count',
            text: eventRecord.nbrGuests
        },
        {
            class: 'b-name-ct',
            children: [
                eventRecord.isVip && {
                    tag: 'i',
                    class: 'fa fa-star',
                    dataset: { btip: 'VIP Guest' }
                },
                eventRecord.isBirthday && {
                    tag: 'i',
                    class: 'fa fa-cake',
                    dataset: { btip: 'Birthday event' }
                },
                eventRecord.tags.length > 0 && {
                    tag: 'i',
                    class: 'fa fa-tag'
                },
                eventRecord.allergies.length > 0 && {
                    tag: 'i',
                    class: 'fa fa-hand-dots',
                    dataset: { btip: 'Allergies: ' + eventRecord.allergies.join(', ') }
                },
                {
                    class: 'b-reserved-by',
                    text: eventRecord.reservedBy
                }
            ]
        },
        {
            class: 'b-times',
            text: `${DateHelper.format(eventRecord.startDate, 'LST')} - ${DateHelper.format(eventRecord.endDate, 'LST')}`
        },
        {
            class: 'b-label-ct',
            children: labels.map(tag => ({
                class: 'b-reservation-label',
                text: tag
            }))
        }
    ];
}
```

### 5.2 Event CSS

```css
.b-sch-event {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    padding: 4px 8px;
}

.b-guest-count {
    grid-row: span 2;
    font-size: 1.5em;
    font-weight: bold;
    padding-right: 8px;
    border-right: 1px solid rgba(255,255,255,0.3);
    margin-right: 8px;
}

.b-name-ct {
    display: flex;
    align-items: center;
    gap: 4px;
}

.b-name-ct i {
    opacity: 0.8;
}

.b-reserved-by {
    font-weight: bold;
}

.b-times {
    font-size: 0.85em;
    opacity: 0.8;
}

.b-label-ct {
    grid-column: span 2;
    display: flex;
    gap: 4px;
    margin-top: 4px;
}

.b-reservation-label {
    font-size: 0.75em;
    padding: 1px 4px;
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
}

.b-new-guest {
    border-left: 3px solid gold;
}
```

---

## 6. Date Strip Navigation Widget

### 6.1 Custom DateStrip Widget

```javascript
import { ButtonGroup, DateHelper, Duration } from '@bryntum/schedulerpro';

class DateStrip extends ButtonGroup {
    static $name = 'DateStrip';
    static type = 'datestrip';

    static configurable = {
        startDate: null,
        selectedDate: null,
        duration: 7,           // Aantal dagen
        shiftIncrement: 1,     // Dagen per shift

        toggleGroup: true,
        rendition: 'padded',

        items: {
            dateMenuButton: {
                icon: 'fa fa-calendar-days',
                menuIcon: null,
                weight: 100,
                menu: {
                    type: 'datepicker',
                    showEvents: 'count',
                    listeners: {
                        selectionChange: 'up.onDateMenuSelect'
                    }
                }
            },
            previousButton: {
                weight: 200,
                icon: 'b-icon-previous',
                onClick: 'up.shiftPrevious',
                toggleable: false
            },
            nextButton: {
                weight: 20000,
                icon: 'b-icon-next',
                onClick: 'up.shiftNext',
                toggleable: false
            }
        }
    };

    construct(config) {
        super.construct(config);

        if (!this.startDate) this.startDate = new Date();
        if (!this.selectedDate) this.selectedDate = this.startDate;
    }

    changeItems(items) {
        items = { ...items, ...this.buildDayItems(300) };
        return super.changeItems(items);
    }

    buildDayItems(weight) {
        const items = {};

        for (let i = 0; i < this.duration; i++, weight += 10) {
            const date = DateHelper.add(this.startDate, i, 'd');

            items[`day-${i}`] = {
                weight,
                dayIndex: i,
                date,
                cls: 'b-date-strip-day',
                text: [
                    {
                        class: 'b-date-strip-day-label',
                        children: [
                            DateHelper.format(date, 'ddd'),
                            { tag: 'i', class: 'b-conflict-indicator fa fa-triangle-exclamation' }
                        ]
                    },
                    { class: 'b-date-strip-date', text: DateHelper.format(date, 'DD MMM') }
                ],
                pressed: DateHelper.isSameDate(date, this.selectedDate)
            };
        }

        return items;
    }

    shiftNext() {
        this.shiftRange(this.shiftIncrement);
    }

    shiftPrevious() {
        this.shiftRange(-this.shiftIncrement);
    }

    shiftRange(days) {
        const pressedIndex = this.pressed[0]?.dayIndex || 0;
        this.startDate = DateHelper.add(this.startDate, days, 'd');
        this.selectedDate = DateHelper.add(this.startDate, pressedIndex, 'd');
    }

    // Highlight conflicts op dag buttons
    highlightConflicts(conflictMap) {
        this.items.forEach(btn => {
            if (btn.date) {
                const dateConflicts = conflictMap.get(DateHelper.format(btn.date, 'YYYY-MM-DD'));
                btn.toggleCls('b-date-conflicts', dateConflicts?.size > 0);
            }
        });
    }

    updateSelectedDate(selectedDate) {
        // Zorg dat datum in range valt
        if (!DateHelper.betweenLesser(selectedDate, this.startDate,
            DateHelper.add(this.startDate, this.duration, 'd'))) {
            this.startDate = selectedDate;
        }

        this.items.forEach(btn => {
            if (typeof btn.dayIndex === 'number') {
                btn.pressed = DateHelper.isSameDate(btn.date, selectedDate);
            }
        });

        if (!this.isConfiguring) {
            this.trigger('select', { date: selectedDate });
        }
    }

    onChange({ source, event }) {
        if (event.source.date) {
            this.selectedDate = event.source.date;
        }
    }
}

DateStrip.initClass();
```

---

## 7. Conflict Detection

### 7.1 Overlapping Reservations Detection

```javascript
getConflictingEventsMap() {
    const overlappingEventsByDate = new Map();

    for (let d = 0; d < 7; d++) {
        const
            date = DateHelper.add(this.widgetMap.dateStrip.startDate, d, 'd'),
            dayEvents = this.eventStore.getEvents({
                startDate: DateHelper.startOf(date, 'd'),
                endDate: DateHelper.endOf(date, 'd')
            }),
            dateKey = DateHelper.format(date, 'YYYY-MM-DD');

        overlappingEventsByDate.set(dateKey, new Set());

        // Check alle event paren voor overlaps
        dayEvents.forEach(eventA => {
            dayEvents.forEach(eventB => {
                if (eventA !== eventB &&
                    eventA.resourceId === eventB.resourceId &&
                    DateHelper.intersectSpans(
                        eventA.startDate, eventA.endDate,
                        eventB.startDate, eventB.endDate
                    )
                ) {
                    overlappingEventsByDate.get(dateKey).add(eventA);
                    overlappingEventsByDate.get(dateKey).add(eventB);
                }
            });
        });
    }

    return overlappingEventsByDate;
}

highlightConflictingEvents() {
    const conflictingEventIds = Object.keys(this.getConflictingEventIdMap());

    if (conflictingEventIds.length === 0) {
        Toast.show('No conflicting reservations found');
    } else {
        this.highlightEvents({
            events: conflictingEventIds,
            scroll: false,
            unhighlightOnClick: false
        });
    }

    return conflictingEventIds;
}
```

### 7.2 Conflict Toggle in Toolbar

```javascript
tbar: {
    items: [
        {
            type: 'slidetoggle',
            text: 'Highlight conflicts',
            ref: 'toggleShowConflicts',
            onChange: 'up.onEventConflictsToggle'
        },
        {
            type: 'datestrip',
            ref: 'dateStrip',
            startDate: new Date(2025, 10, 10, 17, 30),
            selectedDate: new Date(2025, 10, 10, 17),
            onSelect: 'up.onDateSelection'
        }
    ]
},

onEventConflictsToggle({ value, source }) {
    if (value) {
        const ids = this.highlightConflictingEvents();
        if (ids.length === 0) {
            source.value = false;
        }
    } else {
        this.unhighlightEvents();
    }
}
```

---

## 8. Drop Handling - Swap Logic

### 8.1 Swap Overlapping Reservations

```javascript
// Bij drop: swap reserveringen indien overlap
onBeforeEventDropFinalize({ context }) {
    const
        eventRecord = context.eventRecords[0],
        { newResource } = context,
        overlappingBookings = this.eventStore.getEvents({
            resourceRecord: newResource,
            startDate: context.startDate,
            endDate: DateHelper.add(context.endDate, eventRecord.postamble)
        });

    // Verplaats overlappende reserveringen naar oorspronkelijke tafel
    overlappingBookings.forEach(overlappingBooking => {
        overlappingBooking.resourceId = eventRecord.resourceId;
    });
}
```

### 8.2 Resize met Conflict Confirmation

```javascript
async onBeforeEventResizeFinalize({ context }) {
    const { startDate, endDate, eventRecord, resourceRecord } = context;

    if (!this.isDateRangeAvailable(startDate, endDate, eventRecord, resourceRecord, false)) {
        const result = await MessageDialog.confirm({
            title: 'Please confirm',
            message: 'Reservation overlaps, continue?'
        });

        // true om te accepteren, false om te annuleren
        context.finalize(result === MessageDialog.yesButton);
    }
}
```

---

## 9. Event Editor

### 9.1 Slide-in Editor Configuration

```javascript
features: {
    eventEdit: {
        triggerEvent: 'eventclick',
        ignoreSelector: '.b-status-indicator',

        items: {
            resourceField: { label: 'Table' },
            nameField: { label: 'Guest', name: 'reservedBy' },
            startDateField: { label: 'Date / time' },
            endDateField: null,
            endTimeField: null,

            durationField: {
                type: 'duration',
                label: 'Duration',
                name: 'fullDuration'
            },
            cleanupField: {
                type: 'duration',
                label: 'Clean up time after',
                name: 'postamble',
                unit: 'min',
                step: 5
            }
        },

        // Slide-in overlay editor
        editorConfig: {
            title: 'Edit reservation',
            drawer: {
                autoCloseDelay: null
            }
        }
    }
}
```

---

## 10. Settings Panel

### 10.1 Custom Settings Panel

```javascript
import { Panel } from '@bryntum/schedulerpro';

class SettingsPanel extends Panel {
    static configurable = {
        drawer: { autoClose: true },
        title: 'Settings',
        width: 400,

        items: {
            container: {
                type: 'container',
                items: {
                    rowHeight: {
                        type: 'radiogroup',
                        label: 'Row height',
                        inline: true,
                        value: '30',
                        options: {
                            30: 'Small',
                            70: 'Medium',
                            100: 'Large'
                        },
                        onChange: 'up.onRowHeightChange'
                    },
                    tickWidth: {
                        type: 'slider',
                        label: 'Time Cell Width',
                        min: 40,
                        max: 100,
                        showValue: true,
                        unit: 'px',
                        onInput: 'up.onTickWidthSliderChange'
                    },
                    seatingLength: {
                        type: 'radiogroup',
                        label: 'Seating length',
                        inline: true,
                        items: [
                            { text: 'Two hours', checkedValue: 2 },
                            { text: 'One hour', checkedValue: 1 }
                        ],
                        onChange: 'up.onSeatingLengthChange'
                    }
                }
            }
        }
    };

    onRowHeightChange({ value }) {
        this.scheduler.rowHeight = Number(value);
    }

    onTickWidthSliderChange({ value }) {
        this.scheduler.tickSize = value;
    }
}
```

---

## 11. TypeScript Interfaces

```typescript
import { EventModel, ResourceModel, Duration } from '@bryntum/schedulerpro';

type ReservationStatus =
    | 'not_arrived'
    | 'arrived'
    | 'in_bar'
    | 'all_seated'
    | 'paid'
    | 'all_guests_left';

interface ReservationData {
    id: string | number;
    reservedBy: string;
    nbrGuests: number;
    isBirthday?: boolean;
    isVip?: boolean;
    tags?: string[];
    allergies?: string[];
    status?: ReservationStatus;
    isNewGuest?: boolean;
    creditCard?: boolean;
    cleanupBuffer?: string | number;
    startDate: Date | string;
    endDate: Date | string;
    resourceId: string | number;
}

interface Reservation extends EventModel {
    reservedBy: string;
    nbrGuests: number;
    isBirthday: boolean;
    isVip: boolean;
    tags: string[];
    allergies: string[];
    status: ReservationStatus;
    isNewGuest: boolean;
    creditCard: boolean;
    postamble: Duration | null;
}

interface TableData {
    id: string | number;
    name?: string;
    seats: number;
    room: string;
}

interface Table extends ResourceModel {
    seats: number;
    room: string;
    nextGuestName: string | undefined;
    nextReservationNbrGuests: number | undefined;
    nextReservationStart: Date | undefined;
    nextGuestCC: boolean | undefined;
    ongoingOrNextReservation: Reservation | null;
    getOngoingOrNextEvent(options?: {
        startDate?: Date;
        endDate?: Date;
        ignoreOngoing?: boolean;
    }): Reservation | null;
}

interface ConflictMap extends Map<string, Set<Reservation>> {}
```

---

## 12. Complete Example

```javascript
import {
    SchedulerPro, EventModel, ResourceModel, Duration,
    DateHelper, StringHelper, Panel, ButtonGroup, Toast, MessageDialog
} from '@bryntum/schedulerpro';

// Models
class Reservation extends EventModel {
    static fields = [
        { name: 'reservedBy' },
        { name: 'nbrGuests', defaultValue: 2 },
        { name: 'isBirthday', type: 'boolean' },
        { name: 'isVip', type: 'boolean' },
        { name: 'tags', type: 'array', defaultValue: [] },
        { name: 'allergies', type: 'array', defaultValue: [] },
        {
            name: 'postamble',
            dataSource: 'cleanupBuffer',
            convert: v => v ? new Duration(typeof v === 'number' ? v + 'min' : v) : null
        }
    ];
}

class Table extends ResourceModel {
    static fields = [
        { name: 'seats' },
        { name: 'room' }
    ];

    get ongoingOrNextReservation() {
        return this.events
            .filter(e => e.endDate > new Date())
            .sort((a, b) => a.startDate - b.startDate)[0] || null;
    }

    get nextGuestName() {
        return this.ongoingOrNextReservation?.reservedBy;
    }
}

// Scheduler
const scheduler = new SchedulerPro({
    appendTo: 'container',
    startDate: new Date(2025, 10, 10, 17),
    endDate: new Date(2025, 10, 11),
    rowHeight: 30,
    tickSize: 45,
    eventLayout: 'none',
    snap: true,

    project: {
        autoLoad: true,
        loadUrl: 'data/data.json',
        resourceStore: { modelClass: Table },
        eventStore: { modelClass: Reservation }
    },

    columns: [
        {
            text: 'Tables',
            children: [
                { text: '#', field: 'seats', width: 40 },
                { text: 'Next Guest', field: 'nextGuestName', width: 150 },
                { text: 'Table', field: 'id', width: 60 }
            ]
        }
    ],

    features: {
        eventBuffer: { showDuration: false },
        eventResize: { leftHandle: false },
        eventDrag: { singleDirection: true },
        group: { field: 'room' },
        stripe: true
    },

    viewPreset: {
        base: 'hourAndDay',
        headers: [
            {
                unit: 'minute',
                increment: 15,
                renderer(start, end, cellData) {
                    const mins = start.getMinutes();
                    cellData.headerCellCls = mins === 0 ? 'hour' : 'minute';
                    return mins === 0 ? DateHelper.format(start, 'h') : mins;
                }
            }
        ]
    },

    eventRenderer({ eventRecord, renderData }) {
        return [
            { class: 'b-guest-count', text: eventRecord.nbrGuests },
            {
                class: 'b-name-ct',
                children: [
                    eventRecord.isVip && { tag: 'i', class: 'fa fa-star' },
                    { class: 'b-name', text: eventRecord.reservedBy }
                ]
            }
        ];
    },

    onBeforeEventDropFinalize({ context }) {
        const event = context.eventRecords[0];
        const overlapping = scheduler.eventStore.getEvents({
            resourceRecord: context.newResource,
            startDate: context.startDate,
            endDate: context.endDate
        });

        // Swap overlapping to original table
        overlapping.forEach(e => {
            if (e !== event) e.resourceId = event.resourceId;
        });
    }
});
```

---

## Referenties

- Examples: `schedulerpro-7.1.0-trial/examples/table-booking/`
- Feature: Event Buffer (postamble)
- Feature: Grouping
- Feature: Time Ranges
- Widget: ButtonGroup (DateStrip basis)

---

*Document gegenereerd: December 2024*
*Bryntum SchedulerPro versie: 7.1.0*
