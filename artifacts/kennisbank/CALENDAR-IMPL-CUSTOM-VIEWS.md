# CALENDAR-IMPL-CUSTOM-VIEWS.md
## Bryntum Calendar - Custom Views Implementatie

### Overzicht

Dit document beschrijft hoe custom views worden gemaakt in Bryntum Calendar. Het systeem ondersteunt zowel configuratie van ingebouwde views als het maken van volledig nieuwe view types.

---

## 1. View Types Overzicht

### 1.1 Ingebouwde View Types
```typescript
// calendar.d.ts:583
type CalendarView =
    | AgendaView       // Agenda lijst
    | DayView          // Enkele dag
    | WeekView         // Week weergave
    | MonthView        // Maand grid
    | YearView         // Jaar overzicht
    | ResourceView     // Resource kolommen
    | DayResourceView  // Dag per resource
    | DayAgendaView    // Dag + agenda
    | MonthAgendaView  // Maand + agenda
    | MonthGrid        // Alternatief maand grid
    | CalendarRow      // Horizontale rij
    | Scheduler        // Scheduler integratie
    | Widget           // Basis widget

// calendar.d.ts:592
type CalendarViewConfig =
    | AgendaViewConfig
    | DayViewConfig
    | WeekViewConfig
    | MonthViewConfig
    | YearViewConfig
    | ResourceViewConfig
    | DayResourceViewConfig
    | DayAgendaViewConfig
    | MonthAgendaViewConfig
    | MonthGridConfig
    | CalendarRowConfig
    | SchedulerConfig
    | ContainerItemConfig
```

### 1.2 Modes Configuratie
```typescript
// calendar.d.ts:15188
interface CalendarModesConfig {
    [mode: string]: ContainerItemConfig | boolean | null | undefined

    // Ingebouwde modes
    agenda?: AgendaViewConfig | boolean | null
    year?: YearViewConfig | boolean | null
    month?: MonthViewConfig | boolean | null
    week?: WeekViewConfig | boolean | null
    day?: DayViewConfig | boolean | null
    list?: EventListConfig | boolean | null
    resource?: ResourceViewConfig | boolean | null
    dayresourceview?: DayResourceViewConfig | boolean | null
    dayagenda?: DayAgendaViewConfig | boolean | null
    monthagenda?: MonthAgendaViewConfig | boolean | null
}
```

---

## 2. Ingebouwde Views Configureren

### 2.1 Basis Mode Configuratie

```typescript
const calendar = new Calendar({
    // Initiële mode
    mode: 'week',

    // Mode defaults voor alle views
    modeDefaults: {
        // Gedeelde configuratie
        eventHeight: 25,
        showResourceAvatars: true,
        autoRowHeight: true
    },

    // Individuele mode configuratie
    modes: {
        // Week view configuratie
        week: {
            dayStartTime: 8,
            dayEndTime: 18,
            hourHeight: 60,
            visibleStartTime: 8,
            showAllDayHeader: true
        },

        // Day view configuratie
        day: {
            dayStartTime: 7,
            dayEndTime: 20,
            hourHeight: 80
        },

        // Month view configuratie
        month: {
            minRowHeight: 120,
            sixWeeks: true,
            showWeekColumn: true
        },

        // Disable year view
        year: false,

        // Disable agenda view
        agenda: false
    }
});
```

### 2.2 View Specifieke Opties

```typescript
const calendar = new Calendar({
    modes: {
        week: {
            // Tijd configuratie
            dayStartTime: 8,        // Start om 08:00
            dayEndTime: 18,         // Eind om 18:00
            visibleStartTime: 9,    // Scroll naar 09:00

            // Layout
            hourHeight: 60,         // 60px per uur
            hourSpacing: 0,         // Geen ruimte tussen uren
            eventSpacing: 2,        // 2px tussen events

            // All-day header
            showAllDayHeader: true,
            allDayMaxHeight: 100,   // Max hoogte all-day sectie

            // Week opties
            hideNonWorkingDays: false,
            nonWorkingDays: { 0: true, 6: true },

            // Custom rendering
            eventRenderer({ eventRecord, renderData }) {
                renderData.cls.add('week-event');
                return eventRecord.name;
            },

            // Keyboard shortcuts
            keyMap: {
                'Ctrl+n': 'createEvent',
                'Delete': 'deleteEvent'
            }
        },

        month: {
            // Grid configuratie
            minRowHeight: 100,
            sixWeeks: true,         // Altijd 6 weken tonen
            showWeekColumn: true,   // Week nummer kolom
            weekColumnTitle: 'Wk',

            // Overflow
            overflowClickAction: 'popup',  // 'popup' of 'expand'

            // Cell rendering
            dayCellRenderer({ date, events, cls }) {
                if (events.length > 3) {
                    cls.add('busy-day');
                }
            }
        },

        day: {
            // Geavanceerde day opties
            range: '1 day',
            shiftIncrement: '1 day',
            showAllDayHeader: true,

            // Layout
            hourHeightBreakpoints: [40, 60, 100],

            // Interactie
            autoCreate: true,
            interDayDrag: false,    // Geen drag naar andere dagen
            interDayResize: false
        }
    }
});
```

---

## 3. Custom View Class Maken

### 3.1 Extend Bestaande View

```typescript
import {
    WeekView,
    DateHelper,
    CalendarMixin,
    DateRangeOwner
} from '@bryntum/calendar';

class BiWeeklyView extends WeekView {
    static type = 'biweekly';

    static configurable = {
        ...WeekView.configurable,

        // 2 weken range
        range: '2 weeks',
        shiftIncrement: '2 weeks',

        // Custom titel
        titleRenderer(startDate: Date, endDate: Date) {
            return `${DateHelper.format(startDate, 'D MMM')} - ${DateHelper.format(endDate, 'D MMM YYYY')}`;
        }
    };

    // Override header rendering
    get columnHeaders(): string[] {
        const headers: string[] = [];
        const current = new Date(this.startDate);

        while (current < this.endDate) {
            headers.push(DateHelper.format(current, 'ddd D/M'));
            current.setDate(current.getDate() + 1);
        }

        return headers;
    }
}

// Registreer de view
WeekView.register(BiWeeklyView);

// Gebruik in Calendar
const calendar = new Calendar({
    modes: {
        biweekly: {
            type: 'biweekly',
            title: '2 Weken'
        }
    }
});
```

### 3.2 Volledig Nieuwe View

```typescript
import {
    Widget,
    CalendarMixin,
    DateRangeOwner,
    EventRenderer,
    DayCellCollecter
} from '@bryntum/calendar';

class TimelineView extends CalendarMixin(
    DateRangeOwner(
        EventRenderer(
            DayCellCollecter(Widget)
        )
    )
) {
    static type = 'timeline';

    static configurable = {
        // View identificatie
        cls: 'b-timeline-view',

        // Range configuratie
        range: '1 month',
        shiftIncrement: '1 month',

        // Custom opties
        rowHeight: 40,
        showWeekends: true,
        showToday: true,

        // Template voor rendering
        template: null
    };

    // Initialisatie
    construct(config: object) {
        super.construct(config);

        // Setup event listeners
        this.on({
            paint: this.onPaint,
            rangeChange: this.onRangeChange
        });
    }

    // Render de view
    compose() {
        const { startDate, endDate, eventStore } = this;

        return {
            tag: 'div',
            className: 'b-timeline-container',
            children: [
                // Header met datums
                this.composeHeader(),
                // Body met events
                this.composeBody()
            ]
        };
    }

    composeHeader() {
        const days = this.getDaysInRange();

        return {
            tag: 'div',
            className: 'b-timeline-header',
            children: days.map(day => ({
                tag: 'div',
                className: {
                    'b-timeline-day-header': true,
                    'b-weekend': this.isWeekend(day),
                    'b-today': this.isToday(day)
                },
                text: DateHelper.format(day, 'D'),
                dataset: { date: day.toISOString() }
            }))
        };
    }

    composeBody() {
        const resources = this.resourceStore?.records || [];

        return {
            tag: 'div',
            className: 'b-timeline-body',
            children: resources.map(resource => this.composeResourceRow(resource))
        };
    }

    composeResourceRow(resource: ResourceModel) {
        const days = this.getDaysInRange();
        const events = this.eventStore.getEventsForResource(resource);

        return {
            tag: 'div',
            className: 'b-timeline-row',
            dataset: { resourceId: resource.id },
            children: [
                // Resource label
                {
                    tag: 'div',
                    className: 'b-timeline-resource-label',
                    text: resource.name
                },
                // Dag cellen
                ...days.map(day => this.composeDayCell(day, events, resource))
            ]
        };
    }

    composeDayCell(day: Date, events: EventModel[], resource: ResourceModel) {
        const dayEvents = events.filter(e =>
            e.startDate <= day &&
            e.endDate > day
        );

        return {
            tag: 'div',
            className: {
                'b-timeline-cell': true,
                'b-has-events': dayEvents.length > 0
            },
            dataset: {
                date: day.toISOString(),
                resourceId: resource.id
            },
            children: dayEvents.map(event => this.renderEvent(event))
        };
    }

    // Helper methodes
    getDaysInRange(): Date[] {
        const days: Date[] = [];
        const current = new Date(this.startDate);

        while (current < this.endDate) {
            if (this.showWeekends || !this.isWeekend(current)) {
                days.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }

        return days;
    }

    isWeekend(date: Date): boolean {
        const day = date.getDay();
        return day === 0 || day === 6;
    }

    isToday(date: Date): boolean {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // Event handlers
    onPaint({ firstPaint }: { firstPaint: boolean }) {
        if (firstPaint) {
            this.refresh();
        }
    }

    onRangeChange() {
        this.refresh();
    }
}

// Registreer
Widget.register(TimelineView);
```

### 3.3 CSS voor Custom View

```css
.b-timeline-view {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.b-timeline-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
}

.b-timeline-header {
    display: flex;
    position: sticky;
    top: 0;
    background: var(--b-panel-header-background);
    border-bottom: 1px solid var(--b-border-color);
    z-index: 10;
}

.b-timeline-day-header {
    flex: 1;
    min-width: 40px;
    padding: 8px 4px;
    text-align: center;
    font-weight: 500;
}

.b-timeline-day-header.b-weekend {
    background: rgba(0, 0, 0, 0.03);
}

.b-timeline-day-header.b-today {
    background: var(--b-color-primary-10);
    color: var(--b-color-primary);
}

.b-timeline-body {
    flex: 1;
}

.b-timeline-row {
    display: flex;
    border-bottom: 1px solid var(--b-border-color);
    min-height: 40px;
}

.b-timeline-resource-label {
    width: 150px;
    padding: 8px;
    background: var(--b-panel-header-background);
    position: sticky;
    left: 0;
    z-index: 5;
}

.b-timeline-cell {
    flex: 1;
    min-width: 40px;
    border-left: 1px solid var(--b-border-color-subtle);
    position: relative;
}

.b-timeline-cell.b-has-events {
    background: var(--b-color-primary-10);
}
```

---

## 4. View Registratie en Gebruik

### 4.1 Registreren bij Widget System

```typescript
import { Widget, Calendar } from '@bryntum/calendar';

// Custom view class
class CustomView extends Widget {
    static type = 'customview';

    // ... implementatie
}

// Registreer bij Widget systeem
Widget.register(CustomView);

// Nu beschikbaar in modes
const calendar = new Calendar({
    modes: {
        customview: {
            type: 'customview',
            title: 'Custom View'
        }
    }
});
```

### 4.2 Factory Pattern

```typescript
// View factory
class ViewFactory {
    private static views = new Map<string, typeof Widget>();

    static register(type: string, viewClass: typeof Widget): void {
        this.views.set(type, viewClass);
        Widget.register(viewClass);
    }

    static create(type: string, config: object): Widget {
        const ViewClass = this.views.get(type);
        if (!ViewClass) {
            throw new Error(`Unknown view type: ${type}`);
        }
        return new ViewClass(config);
    }

    static has(type: string): boolean {
        return this.views.has(type);
    }
}

// Registreer views
ViewFactory.register('timeline', TimelineView);
ViewFactory.register('biweekly', BiWeeklyView);
ViewFactory.register('kanban', KanbanView);

// Gebruik
const calendar = new Calendar({
    modes: {
        timeline: {
            type: 'timeline',
            title: 'Timeline',
            rowHeight: 50
        }
    }
});
```

---

## 5. Mode Selector Integratie

### 5.1 Custom Mode Button

```typescript
const calendar = new Calendar({
    tbar: {
        items: {
            // Custom mode selector
            modeSelector: {
                type: 'buttongroup',
                items: [
                    { text: 'Dag', mode: 'day' },
                    { text: 'Week', mode: 'week' },
                    { text: 'Maand', mode: 'month' },
                    { text: 'Timeline', mode: 'timeline' }
                ],
                onClick({ source }) {
                    if (source.mode) {
                        this.owner.mode = source.mode;
                    }
                }
            }
        }
    },

    modes: {
        day: true,
        week: true,
        month: true,
        timeline: {
            type: 'timeline'
        }
    }
});
```

### 5.2 Dynamisch Modes Toevoegen

```typescript
const calendar = new Calendar({
    modes: {
        week: true,
        month: true
    }
});

// Later: voeg nieuwe mode toe
calendar.modes.timeline = {
    type: 'timeline',
    title: 'Timeline View'
};

// Activeer nieuwe mode
calendar.mode = 'timeline';

// Verwijder mode
calendar.modes.month = false;
```

---

## 6. View State Management

### 6.1 State Persistentie

```typescript
class StatefulView extends WeekView {
    static type = 'statefulweek';

    // State key voor localStorage
    stateId = 'calendar-week-view';

    construct(config: object) {
        super.construct(config);

        // Herstel state
        this.restoreState();

        // Luister naar changes
        this.on({
            rangeChange: this.saveState,
            hourHeightChange: this.saveState
        });
    }

    saveState(): void {
        const state = {
            date: this.date.toISOString(),
            hourHeight: this.hourHeight,
            dayStartTime: this.dayStartTime,
            dayEndTime: this.dayEndTime
        };

        localStorage.setItem(this.stateId, JSON.stringify(state));
    }

    restoreState(): void {
        const saved = localStorage.getItem(this.stateId);
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.setConfig({
                    date: new Date(state.date),
                    hourHeight: state.hourHeight,
                    dayStartTime: state.dayStartTime,
                    dayEndTime: state.dayEndTime
                });
            } catch (e) {
                console.warn('Failed to restore view state:', e);
            }
        }
    }
}
```

### 6.2 URL State Sync

```typescript
class URLSyncedCalendar extends Calendar {
    construct(config: object) {
        super.construct(config);

        // Sync met URL bij mode/date change
        this.on({
            modeChange: this.syncToURL,
            dateChange: this.syncToURL
        });

        // Initiële sync van URL
        this.syncFromURL();

        // Browser history
        window.addEventListener('popstate', () => this.syncFromURL());
    }

    syncToURL(): void {
        const params = new URLSearchParams(window.location.search);
        params.set('mode', this.mode);
        params.set('date', this.date.toISOString().split('T')[0]);

        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newURL);
    }

    syncFromURL(): void {
        const params = new URLSearchParams(window.location.search);

        const mode = params.get('mode');
        if (mode && this.modes[mode]) {
            this.mode = mode;
        }

        const date = params.get('date');
        if (date) {
            this.date = new Date(date);
        }
    }
}
```

---

## 7. Responsive Views

### 7.1 Breakpoint-based Mode Switching

```typescript
const calendar = new Calendar({
    modes: {
        day: true,
        week: true,
        month: true
    },

    listeners: {
        resize({ width }) {
            // Automatisch naar day view op kleine schermen
            if (width < 600 && this.mode !== 'day') {
                this.mode = 'day';
            } else if (width >= 600 && width < 1024 && this.mode === 'month') {
                this.mode = 'week';
            }
        }
    }
});
```

### 7.2 Responsive View Configuration

```typescript
const calendar = new Calendar({
    modes: {
        week: {
            // Desktop configuratie
            hideNonWorkingDays: false,
            hourHeight: 60,

            // Responsive aanpassingen
            responsive: {
                small: {
                    hideNonWorkingDays: true,
                    hourHeight: 40
                },
                medium: {
                    hideNonWorkingDays: false,
                    hourHeight: 50
                }
            }
        }
    },

    // Breakpoint definities
    responsiveLevels: {
        small: { levelWidth: 0, levelHeight: 0 },
        medium: { levelWidth: 600, levelHeight: 0 },
        large: { levelWidth: 1024, levelHeight: 0 }
    }
});
```

---

## 8. View Compositie

### 8.1 Meerdere Views Combineren

```typescript
import { Container, Calendar } from '@bryntum/calendar';

class DualCalendarView extends Container {
    static type = 'dualcalendar';

    static configurable = {
        layout: 'hbox',

        items: {
            mainCalendar: {
                type: 'calendar',
                flex: 2,
                modes: {
                    week: true
                },
                mode: 'week'
            },

            miniCalendar: {
                type: 'calendar',
                flex: 1,
                modes: {
                    month: true
                },
                mode: 'month',
                sidebar: false,
                tbar: false
            }
        }
    };

    construct(config: object) {
        super.construct(config);

        // Sync de calendars
        this.widgetMap.miniCalendar.on({
            dateClick: ({ date }) => {
                this.widgetMap.mainCalendar.date = date;
            }
        });
    }
}

Widget.register(DualCalendarView);
```

### 8.2 Master-Detail Pattern

```typescript
class MasterDetailView extends Container {
    static type = 'masterdetail';

    static configurable = {
        layout: 'hbox',

        items: {
            calendar: {
                type: 'calendar',
                flex: 2,
                mode: 'month'
            },

            detail: {
                type: 'container',
                flex: 1,
                cls: 'event-detail-panel',
                html: 'Selecteer een event'
            }
        }
    };

    construct(config: object) {
        super.construct(config);

        // Toon event details bij selectie
        this.widgetMap.calendar.on({
            eventClick: ({ eventRecord }) => {
                this.showEventDetail(eventRecord);
            }
        });
    }

    showEventDetail(event: EventModel): void {
        this.widgetMap.detail.html = `
            <h2>${event.name}</h2>
            <p><strong>Start:</strong> ${event.startDate.toLocaleString()}</p>
            <p><strong>Eind:</strong> ${event.endDate.toLocaleString()}</p>
            <p>${event.description || 'Geen beschrijving'}</p>
        `;
    }
}
```

---

## 9. Gerelateerde Bestanden

### Bryntum Source Files
- `calendar.d.ts` regel 583: CalendarView type
- `calendar.d.ts` regel 592: CalendarViewConfig type
- `calendar.d.ts` regel 15178: mode config
- `calendar.d.ts` regel 15182: modeDefaults config
- `calendar.d.ts` regel 15188: modes config
- `calendar.d.ts` regel 64891: CalendarMixin
- `calendar.d.ts` regel 65033: DateRangeOwner
- `calendar.d.ts` regel 65137: DayCellCollecter
- `calendar.d.ts` regel 65428: EventRenderer

### Voorbeelden
- `examples/custom-view/`
- `examples/calendar-taskboard/`
- `examples/resourceview/`

---

## 10. Samenvatting

Custom views in Bryntum Calendar:

1. **Ingebouwde Views Configureren**
   - `modes` object voor view configuratie
   - `modeDefaults` voor gedeelde settings
   - `mode` voor initiële selectie

2. **Extend Bestaande Views**
   - Extend `WeekView`, `MonthView`, etc.
   - Override `compose()` voor custom rendering
   - Registreer met `Widget.register()`

3. **Nieuwe Views Maken**
   - Combineer mixins: `CalendarMixin`, `DateRangeOwner`, etc.
   - Implementeer `compose()` voor rendering
   - Voeg custom CSS toe

4. **Registratie**
   - `Widget.register(ViewClass)`
   - Beschikbaar via `type` in modes config

5. **State Management**
   - localStorage voor persistentie
   - URL sync voor shareable links
   - Event listeners voor state changes

6. **Responsive**
   - Breakpoint-based mode switching
   - Responsive configuratie per view

7. **Compositie**
   - Combineer meerdere views
   - Master-detail patterns
   - Dual calendar views
