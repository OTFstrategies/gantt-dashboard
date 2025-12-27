# Calendar Internals: Layout Engine

> **Fase 6** - Interne werking van de Calendar layout engine: event positionering, overlap handling, cell calculations en rendering pipeline.

---

## Overzicht

De Bryntum Calendar gebruikt verschillende layout engines afhankelijk van het view type. Elke engine bepaalt hoe events worden gepositioneerd en gerenderd.

### Layout Engines per View Type

| View Type | Layout Engine | Beschrijving |
|-----------|---------------|--------------|
| DayView/WeekView | FluidDayLayout | Verticale tijdlijn, horizontale overlap |
| MonthView | CalendarRow | Horizontale bars, rij-overflow |
| YearView | DateCell | Compacte dots/counts |
| AgendaView | Grid RowManager | Virtual scrolling lijst |

---

## 1. DayCell Data Structure

Alle views gebruiken `DayCell` als basis data-eenheid.

### DayCell Interface

```typescript
// Bron: calendar.d.ts line 328-450
type DayCell = {
    // Identificatie
    view: CalendarView;
    date: Date;
    key: string;  // 'YYYY-MM-DD' format via DateHelper.makeKey()

    // Positie in grid
    cellIndex: number;        // Globale cel index
    columnIndex: number;      // Kolom in view
    visibleColumnIndex: number;
    row: number;              // Rij in MonthView
    day: number;              // 0-6 (zondag-zaterdag)

    // State flags
    visible: boolean;
    isNonWorking: boolean;    // Weekend of holiday
    isOtherMonth: boolean;    // MonthView: vorige/volgende maand
    isRowStart: boolean;      // Eerste cel van rij
    isRowEnd: boolean;        // Laatste cel van rij

    // Events in deze cel
    events: EventModel[];           // Alle events
    intraDayEvents: EventModel[];   // Timed events (niet all-day)
    allDayEvents: EventModel[];     // All-day events

    // Gerenderde event bars
    renderedEvents: EventBar[];
    hasOverflow: boolean;           // Meer events dan zichtbaar

    // Time ranges
    timeRanges: TimeRangeModel[];
    allDayTimeRanges: TimeRangeModel[];

    // Resource (voor ResourceView)
    resource?: ResourceModel;
    resourceDayEvents?: EventModel[];
};
```

### DayCell Berekening

```javascript
// Pseudo-code: DayCell collectie
class DayCellCollecter {
    // Cache van date key naar cell
    cellMap = new Map();

    collectDayCells(startDate, endDate, options) {
        const cells = [];

        for (let date = startDate; date < endDate; date = nextDay(date)) {
            const key = DateHelper.makeKey(date);

            // Check cache
            if (this.cellMap.has(key)) {
                cells.push(this.cellMap.get(key));
                continue;
            }

            // Creëer nieuwe cell
            const cell = {
                date,
                key,
                day: date.getDay(),
                isNonWorking: this.isNonWorkingDay(date),
                events: this.getEventsForDate(date),
                // ... meer properties
            };

            this.cellMap.set(key, cell);
            cells.push(cell);
        }

        return cells;
    }
}
```

---

## 2. FluidDayLayout (DayView/WeekView)

De FluidDayLayout beheert event positionering in tijdlijn-gebaseerde views.

### Layout Algoritme

```typescript
interface FluidDayLayoutConfig {
    // Minimum event breedte percentage
    minEventWidth: number;  // default: 30

    // Event sortering
    eventSorter: (a: EventModel, b: EventModel) => number;

    // Maximum overlappende events per kolom
    maxEventsPerColumn: number;
}
```

### Overlap Detectie

```javascript
// Stap 1: Verzamel overlappende events
function findOverlappingGroups(events) {
    const groups = [];
    let currentGroup = [];

    // Events gesorteerd op startDate
    const sorted = events.sort((a, b) => a.startDate - b.startDate);

    for (const event of sorted) {
        // Check overlap met huidige groep
        const overlaps = currentGroup.some(e =>
            event.startDate < e.endDate && event.endDate > e.startDate
        );

        if (overlaps) {
            currentGroup.push(event);
        } else {
            if (currentGroup.length > 0) {
                groups.push(currentGroup);
            }
            currentGroup = [event];
        }
    }

    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    return groups;
}
```

### Slot Toewijzing

```javascript
// Stap 2: Wijs slots toe aan overlappende events
function assignSlots(overlapGroup) {
    const slots = [];

    for (const event of overlapGroup) {
        // Vind eerste beschikbare slot
        let slotIndex = 0;
        while (slots[slotIndex]?.some(e => overlaps(e, event))) {
            slotIndex++;
        }

        // Voeg event toe aan slot
        if (!slots[slotIndex]) {
            slots[slotIndex] = [];
        }
        slots[slotIndex].push(event);

        event._slot = slotIndex;
        event._slotCount = Math.max(slots.length, event._slotCount || 0);
    }

    // Update slot count voor alle events
    const totalSlots = slots.length;
    overlapGroup.forEach(e => e._slotCount = totalSlots);

    return slots;
}
```

### Positie Berekening

```javascript
// Stap 3: Bereken CSS posities
function calculateEventPosition(event, dayCell, hourHeight) {
    const { startDate, endDate, _slot, _slotCount } = event;

    // Verticale positie (tijd)
    const dayStart = dayCell.view.dayStartTime * 60;  // minuten
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const top = ((startMinutes - dayStart) / 60) * hourHeight;

    // Hoogte
    const duration = (endDate - startDate) / 60000;  // minuten
    const height = (duration / 60) * hourHeight;

    // Horizontale positie (overlap)
    const slotWidth = 100 / _slotCount;  // percentage
    const left = _slot * slotWidth;

    return {
        top: `${top}px`,
        height: `${height}px`,
        left: `${left}%`,
        width: `${slotWidth}%`
    };
}
```

---

## 3. CalendarRow Layout (MonthView)

CalendarRow beheert de horizontale event bars in MonthView.

### Row Layout

```typescript
interface CalendarRowConfig {
    // Event bar hoogte
    eventHeight: number | string;  // pixels of CSS

    // Spacing tussen events
    eventSpacing: number;

    // Maximum rijen in overflow
    maxEventRows: number;
}
```

### Multi-Day Event Spanning

```javascript
// Stap 1: Bepaal spanning segments
function createEventSegments(event, weekStart, weekEnd) {
    const segments = [];

    let segStart = Math.max(event.startDate, weekStart);
    let segEnd = Math.min(event.endDate, weekEnd);

    // Bereken aantal dagen dat event overspant
    const span = DateHelper.diff(segStart, segEnd, 'day') + 1;

    segments.push({
        event,
        startDate: segStart,
        endDate: segEnd,
        span,
        continuesLeft: event.startDate < weekStart,
        continuesRight: event.endDate > weekEnd
    });

    return segments;
}
```

### Row Slot Algoritme

```javascript
// Stap 2: Pak segments in rijen
function packSegmentsIntoRows(segments, maxRows) {
    const rows = [];

    for (const segment of segments) {
        // Vind rij waar segment past
        let rowIndex = 0;
        while (rowIndex < rows.length) {
            const row = rows[rowIndex];
            const fits = !row.some(s => datesOverlap(s, segment));
            if (fits) break;
            rowIndex++;
        }

        // Check overflow
        if (rowIndex >= maxRows) {
            segment.isOverflow = true;
            continue;
        }

        // Voeg segment toe aan rij
        if (!rows[rowIndex]) {
            rows[rowIndex] = [];
        }
        rows[rowIndex].push(segment);
        segment.rowIndex = rowIndex;
    }

    return rows;
}
```

### CSS Grid Positionering

```javascript
// Stap 3: Genereer CSS grid posities
function generateGridPosition(segment, cellStartColumn) {
    return {
        gridRow: segment.rowIndex + 2,  // +2 voor header
        gridColumnStart: cellStartColumn + 1,
        gridColumnEnd: `span ${segment.span}`
    };
}
```

---

## 4. EventBar Rendering

### EventBar Interface

```typescript
// Bron: calendar.d.ts line 841-880
type EventBar = {
    // Event data
    eventRecord: EventModel;

    // Slot informatie
    slot: number;           // Verticale positie (rij index)

    // Spanning flags
    continue: boolean;      // Loopt door van vorige cel
    ends: boolean;          // Eindigt in deze cel
    continueRight: boolean; // Loopt door naar volgende cel

    // Styling
    cls: DomClassList;
    style: object;

    // Resource binding
    resource?: ResourceModel;
};
```

### EventBar DOM Generatie

```javascript
// Pseudo-code: Event bar rendering
function renderEventBar(eventBar, view) {
    const { eventRecord, slot, continue: continues, ends, continueRight } = eventBar;

    const domConfig = {
        tag: 'div',
        className: {
            'b-cal-event-wrap': 1,
            'b-allday': eventRecord.allDay,
            'b-continues-left': continues,
            'b-continues-right': continueRight,
            [`b-cal-event-${eventRecord.eventStyle || 'colored'}`]: 1
        },
        style: {
            backgroundColor: eventRecord.eventColor,
            ...calculatePosition(eventBar, view)
        },
        dataset: {
            eventId: eventRecord.id,
            resourceId: eventRecord.resourceId
        },
        children: [
            // Icon
            eventRecord.iconCls && {
                tag: 'i',
                className: eventRecord.iconCls
            },
            // Content
            {
                className: 'b-cal-event-body',
                children: [
                    {
                        className: 'b-event-name',
                        text: eventRecord.name
                    }
                ]
            }
        ].filter(Boolean)
    };

    return domConfig;
}
```

---

## 5. Hour Height & Fit Hours

### Hour Height Berekening

```typescript
interface DayViewConfig {
    // Vaste hoogte per uur
    hourHeight: number;  // pixels

    // Of: fit uren in beschikbare ruimte
    fitHours: boolean | {
        minHeight?: number;  // Minimum hoogte per uur
    };

    // Tijd range
    dayStartTime: number;  // 0-23
    dayEndTime: number;    // 0-24
}
```

### Fit Hours Algoritme

```javascript
// Bereken hourHeight dynamisch
function calculateFitHourHeight(view) {
    const { dayStartTime, dayEndTime, element, fitHours } = view;

    // Beschikbare hoogte
    const availableHeight = element.offsetHeight - headerHeight;

    // Aantal uren
    const hours = dayEndTime - dayStartTime;

    // Bereken hoogte
    let hourHeight = availableHeight / hours;

    // Respecteer minimum
    if (fitHours.minHeight) {
        hourHeight = Math.max(hourHeight, fitHours.minHeight);
    }

    return hourHeight;
}
```

### Example: Fit Hours

```javascript
// Bron: examples/fit-hours/app.module.js
modes: {
    week: {
        hourHeight: 70,  // Fallback als fitHours uit is

        fitHours: {
            minHeight: 21  // Voorkom te kleine uren
        },

        dayStartTime: 7,
        dayEndTime: 18
    }
}
```

---

## 6. All-Day Events Header

### Header Layout

```javascript
// CalendarRow voor all-day events
class AllDayHeader extends CalendarRow {
    static configurable = {
        // Maximum zichtbare rijen
        maxEventRows: 3,

        // Overflow button
        showOverflowButton: true,

        // Event height
        eventHeight: 24
    };

    // Bereken hoogte gebaseerd op events
    calculateHeight() {
        const rowCount = Math.min(
            this.maxEventRows,
            this.calculateRequiredRows()
        );

        return (rowCount * this.eventHeight) +
               (rowCount - 1) * this.eventSpacing +
               this.padding;
    }
}
```

### Overflow Handling

```javascript
// Overflow button rendering
function renderOverflowButton(count, cell) {
    return {
        tag: 'button',
        className: 'b-cal-cell-overflow',
        text: `+${count} more`,
        dataset: {
            date: cell.key
        }
    };
}
```

---

## 7. Non-Working Days

### Configuratie

```typescript
interface CalendarConfig {
    // Niet-werkdagen (dag index → boolean)
    nonWorkingDays: Record<number, boolean>;  // 0=Sunday, 6=Saturday

    // Verberg niet-werkdagen
    hideNonWorkingDays: boolean;
}
```

### Default Non-Working Days

```javascript
// Default: weekend
const defaultNonWorkingDays = {
    0: true,  // Sunday
    6: true   // Saturday
};

// Custom: andere dagen
calendar.nonWorkingDays = {
    0: true,  // Sunday
    5: true,  // Friday (bijv. voor andere culturen)
    6: true   // Saturday
};
```

### Filtering

```javascript
// Filter cellen bij hideNonWorkingDays: true
function filterVisibleCells(cells) {
    if (!this.hideNonWorkingDays) return cells;

    return cells.filter(cell => !cell.isNonWorking);
}
```

---

## 8. Time Ticks & Grid Lines

### Sub-Hour Ticks

```typescript
interface DayViewConfig {
    // Stippellijn voor halve uren
    dashedSubticks: boolean;  // default: true

    // Tick interval
    tickHeight: number;  // 30 minuten default
}
```

### Grid Line Rendering

```javascript
// Genereer grid lines
function renderTimeGrid(view) {
    const { dayStartTime, dayEndTime, hourHeight } = view;
    const lines = [];

    for (let hour = dayStartTime; hour < dayEndTime; hour++) {
        // Uur lijn
        lines.push({
            tag: 'div',
            className: 'b-hour-line',
            style: {
                top: `${(hour - dayStartTime) * hourHeight}px`
            }
        });

        // Half-uur lijn
        if (view.dashedSubticks) {
            lines.push({
                tag: 'div',
                className: 'b-half-hour-line b-dashed',
                style: {
                    top: `${(hour - dayStartTime) * hourHeight + hourHeight / 2}px`
                }
            });
        }
    }

    return lines;
}
```

---

## 9. Rendering Pipeline

### Render Cycle

```
1. Data Change Detected
   ↓
2. DayCells Collected (DayCellCollecter)
   ↓
3. Events Filtered per Cell
   ↓
4. Layout Calculated (FluidDayLayout / CalendarRow)
   ↓
5. EventBars Created
   ↓
6. DOM Config Generated
   ↓
7. DomSync Applied
   ↓
8. Paint Complete
```

### DomSync Integration

```javascript
// Efficiënte DOM updates via DomSync
import { DomSync } from '@bryntum/calendar';

function updateView(newConfig) {
    DomSync.sync({
        targetElement: this.bodyElement,
        domConfig: newConfig,

        // Callbacks voor specifieke elementen
        callback({ action, domConfig, targetElement }) {
            if (action === 'newElement' && domConfig.className['b-cal-event-wrap']) {
                // Event element created
                this.onEventRender(targetElement);
            }
        }
    });
}
```

---

## 10. Performance Optimalisaties

### Virtual Rendering

```javascript
// Alleen zichtbare events renderen
function getVisibleEvents(allEvents, viewport) {
    return allEvents.filter(event => {
        const eventTop = calculateEventTop(event);
        const eventBottom = eventTop + calculateEventHeight(event);

        return eventBottom >= viewport.top &&
               eventTop <= viewport.bottom;
    });
}
```

### Event Batching

```javascript
// Batch multiple updates
calendar.suspendRefresh();

// Voer meerdere wijzigingen uit
eventStore.add([...]);
eventStore.remove([...]);
calendar.date = newDate;

// Resume en render eenmalig
calendar.resumeRefresh();
```

### Lazy Cell Creation

```javascript
// Cellen alleen creëren wanneer nodig
class LazyDayCellCollecter {
    getCellForDate(date) {
        const key = DateHelper.makeKey(date);

        if (!this.cellMap.has(key)) {
            this.cellMap.set(key, this.createCell(date));
        }

        return this.cellMap.get(key);
    }
}
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| DayCell | 328 |
| EventBar | 841 |
| DayCellCollecter | 401 |
| FluidDayLayout | 34971 |
| CalendarRow | 26681 |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `fit-hours/` | Dynamic hour height |
| `custom-rendering/` | Custom event rendering |
| `day-time-ticks/` | Time grid customization |
| `bigdataset/` | Performance met grote datasets |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
