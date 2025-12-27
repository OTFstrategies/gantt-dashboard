# Calendar Implementation: Dual Day View

> **Implementatie guide** voor side-by-side dag weergaven in Bryntum Calendar: source store voor externe events, drag & drop tussen views, en synchronized scrolling.

---

## Overzicht

Dual Day View toont twee gekoppelde dag weergaven naast elkaar:

- **Primary View** - Reguliere calendar events (project store)
- **Source View** - Externe/unscheduled events (source store)
- **Drag & Drop** - Events verplaatsen van source naar primary
- **Synchronized Scroll** - Beide views scrollen samen
- **Shared Configuration** - Gedeelde settings voor beide views

---

## 1. DualDayView Widget

### 1.1 Custom View Class

```javascript
import { Panel, CalendarMixin, DaySelectable, DayTime, Month } from '@bryntum/calendar';

class DualDayView extends Panel.mixin(CalendarMixin, DaySelectable) {
    static $name = 'DualDayView';
    static type = 'dualdayview';

    static configurable = {
        layout: 'hbox',

        // Datum voor beide views
        date: {
            $config: { equal: 'date' },
            value: null
        },

        month: true,
        dayTime: 0,
        daySelector: true,

        // Source store voor externe events
        sourceStore: null,

        // Config overrides voor source view
        sourceView: {},

        dragZoneConfig: {}
    };

    // Gedeelde configs voor beide views
    static sharedConfigs = [
        'date', 'dateFormat', 'includeTimeRanges', 'allowOverlap',
        'timeFormat', 'coreHours', 'fitHours', 'hourHeight',
        'visibleStartTime', 'dayStartTime', 'dayEndTime',
        'hideNonWorkingDays', 'nonWorkingDays', 'readOnly',
        'zoomOnMouseWheel', 'filterEventResources'
    ];

    construct(config) {
        // Creëer twee DayViews
        config.items = [
            {
                ...config,
                ...config.primaryView,
                parent: this,
                type: 'dayview',
                header: false,
                showAllDayHeader: false,
                allDayEvents: false,
                scrollable: {
                    overflowY: 'hidden-scroll'
                }
            },
            {
                ...config,
                ...config.sourceView,
                parent: this,
                type: 'dayview',
                header: false,
                showAllDayHeader: false,
                allDayEvents: false,
                autoCreate: false,

                // Source view gebruikt eigen project
                project: {
                    eventStore: config.sourceStore
                },

                // Source view is read-only (alleen drag)
                dragZoneConfig: {
                    resizable: false,
                    creatable: false,
                    hoverEdges: ''
                }
            }
        ];

        super.construct(config);

        [this.primaryView, this.sourceView] = this.items;

        // Synchroniseer scrolling
        this.primaryView.scrollable.addPartner(this.sourceView.scrollable, 'y');
    }
}

DualDayView.initClass();
```

---

## 2. Feature Integration

### 2.1 Tooltip en Menu Handling

```javascript
onPaint({ firstPaint }) {
    if (firstPaint) {
        const { features } = this.calendar;

        // Verberg edit/delete tools in source view tooltip
        features.eventTooltip?.tooltip.on({
            beforeAlign({ source }) {
                const isSourceView =
                    DualDayView.fromElement(source.activeTarget) === this.sourceView;

                source.tools.edit && (source.tools.edit.hidden = isSourceView);
                source.tools.delete && (source.tools.delete.hidden = isSourceView);
            }
        });

        // Voorkom schedule menu in source view
        features.scheduleMenu?.menu.on({
            beforeShow() {
                return DualDayView.fromElement(
                    features.scheduleMenu.menuContext.targetElement
                ) !== this.sourceView;
            }
        });
    }
}
```

---

## 3. Calendar Configuration

### 3.1 Setup met Dual View

```javascript
import { Calendar, EventStore } from '@bryntum/calendar';

// Externe events store
const sourceStore = new EventStore({
    data: [
        {
            id: 'ext1',
            name: 'Unscheduled Meeting',
            startDate: '2025-01-27T09:00',
            endDate: '2025-01-27T10:00'
        },
        {
            id: 'ext2',
            name: 'Pending Review',
            startDate: '2025-01-27T14:00',
            endDate: '2025-01-27T15:30'
        }
    ]
});

const calendar = new Calendar({
    appendTo: 'container',
    date: '2025-01-27',

    crudManager: {
        autoLoad: true,
        loadUrl: 'data/data.json'
    },

    modes: {
        day: null,
        week: null,
        month: null,
        year: null,
        agenda: null,

        dualdayview: {
            type: 'dualdayview',
            sourceStore,
            dayStartTime: 8,
            dayEndTime: 18,
            hourHeight: 60,

            // Primary view styling
            primaryView: {
                title: 'Scheduled',
                flex: 1
            },

            // Source view styling
            sourceView: {
                title: 'Unscheduled',
                flex: 1,
                cls: 'source-view'
            }
        }
    }
});
```

---

## 4. Drag & Drop Integration

### 4.1 Drag van Source naar Primary

```javascript
// In DualDayView class
afterConstruct() {
    super.afterConstruct();

    // Listen voor drops op primary view
    this.primaryView.element.addEventListener('drop', this.onDrop.bind(this));
}

onDrop(event) {
    const eventRecord = this.sourceView.resolveEventRecord(event.target);

    if (eventRecord) {
        // Verwijder uit source store
        this.sourceStore.remove(eventRecord);

        // Voeg toe aan calendar project
        this.calendar.eventStore.add({
            ...eventRecord.data,
            id: undefined // Nieuwe ID laten genereren
        });
    }
}
```

### 4.2 Custom Drag Helper

```javascript
import { DragHelper, DateHelper } from '@bryntum/calendar';

class DualViewDrag extends DragHelper {
    static configurable = {
        cloneTarget: true,
        mode: 'translateXY',
        dropTargetSelector: '.b-dayview:first-child .b-dayview-day-container',
        targetSelector: '.b-cal-event-wrap'
    };

    createProxy(element) {
        const proxy = element.cloneNode(true);
        proxy.style.width = '200px';
        return proxy;
    }

    onDragStart({ context }) {
        const view = DualDayView.fromElement(context.grabbed);
        context.eventRecord = view.resolveEventRecord(context.grabbed);
    }

    onDrag({ context }) {
        const { primaryView } = this.dualView;
        const date = primaryView.getDateFromXY([context.pageX, context.pageY]);

        context.valid = Boolean(date);
        context.dropDate = date;
    }

    async onDrop({ context }) {
        if (context.valid && context.eventRecord) {
            const { eventRecord, dropDate } = context;
            const duration = eventRecord.endDate - eventRecord.startDate;

            // Verwijder uit source
            this.dualView.sourceStore.remove(eventRecord);

            // Voeg toe aan primary met nieuwe datum
            this.dualView.calendar.eventStore.add({
                name: eventRecord.name,
                startDate: dropDate,
                endDate: DateHelper.add(dropDate, duration, 'ms')
            });
        }
    }
}
```

---

## 5. Synchronized Updates

### 5.1 Date Synchronization

```javascript
// In DualDayView class
changeDate(date) {
    return DateHelper.clearTime(date);
}

updateDate(date) {
    // Update beide views
    if (this.primaryView) {
        this.primaryView.date = date;
    }
    if (this.sourceView) {
        this.sourceView.date = date;
    }
}
```

### 5.2 Time Range Sync

```javascript
// Sync dayStartTime/dayEndTime wijzigingen
updateDayStartTime(time) {
    this.primaryView.dayStartTime = time;
    this.sourceView.dayStartTime = time;
}

updateDayEndTime(time) {
    this.primaryView.dayEndTime = time;
    this.sourceView.dayEndTime = time;
}

updateHourHeight(height) {
    this.primaryView.hourHeight = height;
    this.sourceView.hourHeight = height;
}
```

---

## 6. Styling

### 6.1 View CSS

```css
/* Container */
.b-dualdayview {
    display: flex;
    gap: 16px;
}

/* View headers */
.b-dualdayview .b-dayview {
    flex: 1;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
}

/* Source view styling */
.b-dualdayview .source-view {
    background: #fafafa;
}

.b-dualdayview .source-view .b-cal-event {
    opacity: 0.8;
    border-style: dashed;
}

/* Drag proxy */
.b-dragging-source .b-cal-event-wrap {
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* Drop indicator */
.b-dayview.b-drop-target {
    background: rgba(33, 150, 243, 0.1);
}
```

---

## 7. Source Store Management

### 7.1 API voor Source Store

```javascript
// Helper methods in DualDayView
addToSource(eventData) {
    return this.sourceStore.add(eventData);
}

removeFromSource(eventRecord) {
    this.sourceStore.remove(eventRecord);
}

moveToScheduled(eventRecord, startDate) {
    const duration = eventRecord.duration;

    this.sourceStore.remove(eventRecord);

    return this.calendar.eventStore.add({
        name: eventRecord.name,
        startDate,
        duration,
        durationUnit: eventRecord.durationUnit
    });
}

moveToUnscheduled(eventRecord) {
    this.calendar.eventStore.remove(eventRecord);

    return this.sourceStore.add({
        name: eventRecord.name,
        startDate: eventRecord.startDate,
        endDate: eventRecord.endDate
    });
}
```

---

## 8. TypeScript Interfaces

```typescript
import { Panel, EventStore, EventModel, Calendar } from '@bryntum/calendar';

// DualDayView Config
interface DualDayViewConfig {
    date?: Date | string;
    sourceStore: EventStore;
    primaryView?: Partial<DayViewConfig>;
    sourceView?: Partial<DayViewConfig>;
    dayStartTime?: number;
    dayEndTime?: number;
    hourHeight?: number;
}

interface DayViewConfig {
    title?: string;
    flex?: number;
    cls?: string;
}

// DualDayView Instance
interface DualDayView extends Panel {
    primaryView: DayView;
    sourceView: DayView;
    sourceStore: EventStore;
    calendar: Calendar;

    addToSource(data: Partial<EventModel>): EventModel;
    removeFromSource(record: EventModel): void;
    moveToScheduled(record: EventModel, startDate: Date): EventModel;
    moveToUnscheduled(record: EventModel): EventModel;
}

// Drag Context
interface DualDragContext {
    eventRecord: EventModel;
    valid: boolean;
    dropDate: Date | null;
}
```

---

## 9. Complete Example

```javascript
import { Calendar, EventStore, Panel, DaySelectable, CalendarMixin, DateHelper } from '@bryntum/calendar';

// DualDayView Widget
class DualDayView extends Panel.mixin(CalendarMixin, DaySelectable) {
    static $name = 'DualDayView';
    static type = 'dualdayview';

    static configurable = {
        layout: 'hbox',
        date: null,
        sourceStore: null
    };

    construct(config) {
        config.items = [
            {
                ...config,
                type: 'dayview',
                flex: 1,
                title: 'Scheduled'
            },
            {
                ...config,
                type: 'dayview',
                flex: 1,
                title: 'Unscheduled',
                project: { eventStore: config.sourceStore },
                dragZoneConfig: { resizable: false, creatable: false }
            }
        ];

        super.construct(config);
        [this.primaryView, this.sourceView] = this.items;

        // Sync scrolling
        this.primaryView.scrollable.addPartner(this.sourceView.scrollable, 'y');
    }

    updateDate(date) {
        this.primaryView.date = date;
        this.sourceView.date = date;
    }
}

DualDayView.initClass();

// Source Store
const sourceStore = new EventStore({
    data: [
        { id: 'u1', name: 'Review Meeting', startDate: '2025-01-27T10:00', endDate: '2025-01-27T11:00' },
        { id: 'u2', name: 'Planning Session', startDate: '2025-01-27T14:00', endDate: '2025-01-27T15:00' }
    ]
});

// Calendar
const calendar = new Calendar({
    appendTo: 'container',
    date: '2025-01-27',

    crudManager: {
        autoLoad: true,
        loadUrl: 'data/data.json'
    },

    modes: {
        day: null, week: null, month: null, year: null, agenda: null,
        dualdayview: {
            type: 'dualdayview',
            sourceStore,
            dayStartTime: 8,
            dayEndTime: 18,
            hourHeight: 60
        }
    }
});
```

---

## Referenties

- Examples: `calendar-7.1.0-trial/examples/dual-dayview/`
- Mixin: CalendarMixin
- Mixin: DaySelectable
- API: EventStore

---

*Document gegenereerd: December 2024*
*Bryntum Calendar versie: 7.1.0*
