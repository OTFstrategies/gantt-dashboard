# CALENDAR-DEEP-DIVE-LAYOUT-ENGINE.md
## Bryntum Calendar - Layout Engine Deep Dive

### Overzicht

Dit document beschrijft de layout engine van Bryntum Calendar - het systeem dat bepaalt hoe events worden gepositioneerd, hoe overlapping wordt afgehandeld, en hoe de verschillende view types hun content renderen. Het layout systeem is essentieel voor een professionele kalenderweergave.

---

## 1. Layout Architectuur

### 1.1 Layout Class Hiërarchie

```
Base
└── DayLayout (abstract)                    // calendar.d.ts:11412
    └── FluidDayLayout                      // calendar.d.ts:11489
```

### 1.2 Layout Verantwoordelijkheden

```typescript
interface LayoutResponsibilities {
    // Primaire taken
    eventPositioning: 'Bepaal x/y positie van elk event'
    overlapResolution: 'Handel overlappende events af'
    widthCalculation: 'Bereken breedte van events'
    heightCalculation: 'Bereken hoogte obv tijdsduur'

    // Secundaire taken
    gutterManagement: 'Reserveer ruimte aan rand'
    staggering: 'Stapsgewijze breedte voor overlaps'
    clearanceMinutes: 'Minimale verticale afstand'
}
```

---

## 2. DayLayout Base Class

### 2.1 TypeScript Interface
```typescript
// calendar.d.ts:11383
type DayLayoutConfig = {
    /**
     * Schakel gutter (rechter rand ruimte) in/uit
     * Default: true
     */
    gutter?: boolean

    /**
     * Breedte van de gutter in pixels of proportie (0-1)
     * Proportie: 0.1 = 10% van dag breedte
     * Pixels: 10 = 10px vaste breedte
     */
    gutterWidth?: number

    /**
     * Ruimte buiten event area voor TimeRanges
     * Pixels of proportie van dag breedte
     */
    inset?: number
}

// calendar.d.ts:11412
export abstract class DayLayout extends Base {
    static readonly isDayLayout: boolean
    readonly isDayLayout: boolean
    constructor(config?: DayLayoutConfig)
}
```

### 2.2 Gutter Configuratie

```typescript
const calendar = new Calendar({
    modes: {
        week: {
            eventLayout: {
                // Gutter aan rechterkant van events
                gutter: true,

                // 10% van dag breedte als gutter
                gutterWidth: 0.1,

                // Of vaste pixels
                // gutterWidth: 15,

                // Ruimte voor TimeRanges markers
                inset: 5
            }
        }
    }
});
```

---

## 3. FluidDayLayout

### 3.1 TypeScript Interface
```typescript
// calendar.d.ts:11431
type FluidDayLayoutConfig = {
    /**
     * Minimale verticale vrijstelling in minuten voordat
     * horizontale overlap wordt toegestaan.
     * Default: 15
     *
     * Als event A minimaal clearanceMinutes voorbij event B
     * begint (verticaal), mag B event A overlappen (horizontaal)
     */
    clearanceMinutes?: number

    /**
     * Gutter inschakelen
     */
    gutter?: boolean

    /**
     * Gutter breedte
     */
    gutterWidth?: number

    /**
     * Inset ruimte
     */
    inset?: number

    /**
     * Minimale breedte waarnaar stagger kan reduceren
     * Default: 20 (pixels of percentage)
     *
     * Voorkomt dat events te smal worden bij veel overlaps
     */
    staggerMinimum?: number

    /**
     * Breedte vermindering per overlap niveau
     * - false/0: Uitgeschakeld
     * - true: Default waarde (ca. 20px)
     * - number: Specifieke pixels per niveau
     *
     * Bij 3 overlappende events: elk event wordt
     * staggerWidth smaller dan vorige
     */
    staggerWidth?: boolean | number

    /**
     * Gebruik volledige dag breedte voor events
     * Default: false
     *
     * true: Alle events vullen volledige breedte
     * false: Overlappende events delen breedte gelijk
     */
    stretch?: boolean
}

// calendar.d.ts:11489
export class FluidDayLayout extends DayLayout {
    static readonly isFluidDayLayout: boolean
    readonly isFluidDayLayout: boolean
    constructor(config?: FluidDayLayoutConfig)
}
```

### 3.2 Overlap Algoritme Uitleg

```typescript
/**
 * FluidDayLayout positioneert events door:
 *
 * 1. Events sorteren op startDate, dan endDate
 * 2. Overlap groepen identificeren (events die elkaar raken)
 * 3. Binnen groep: kolommen toewijzen
 * 4. Breedte berekenen op basis van kolom positie
 * 5. Stagger toepassen voor visuele diepte
 */

const calendar = new Calendar({
    modes: {
        day: {
            eventLayout: {
                // Events moeten 30 min verticaal gescheiden zijn
                // voordat horizontale overlap mag
                clearanceMinutes: 30,

                // Elke overlap niveau: 15px smaller
                staggerWidth: 15,

                // Minimaal 50px breed
                staggerMinimum: 50,

                // Events niet stretchen naar volledige breedte
                stretch: false
            }
        }
    }
});
```

### 3.3 Stagger Visualisatie

```
Zonder stagger (stretch: true):
┌─────────────────────────┐
│ Event A (10:00-11:00)   │
├─────────────────────────┤
│ Event B (10:30-11:30)   │
└─────────────────────────┘

Met stagger (default):
┌──────────────────┐
│ Event A          │
│   ┌──────────────┴─────┐
│   │ Event B            │
└───┤                    │
    └────────────────────┘

Met stagger + staggerWidth: 20:
┌────────────────────┐
│ Event A            │
│     ┌──────────────┴───┐
│     │ Event B          │
│     │    ┌─────────────┴┐
│     │    │ Event C      │
└─────┴────┴──────────────┘
```

---

## 4. Scheduler Event Layout Modes

### 4.1 Layout Types
```typescript
// calendar.d.ts:277036
eventLayout?: 'stack' | 'pack' | 'mixed' | 'none' | {
    type?: 'stack' | 'pack' | 'mixed' | 'none'
}
```

### 4.2 Stack Mode

```typescript
/**
 * Stack: Events worden verticaal gestapeld
 * Elke event krijgt eigen rij binnen resource
 *
 * Voordelen:
 * - Alle events volledig zichtbaar
 * - Duidelijke visuele scheiding
 *
 * Nadelen:
 * - Veel verticale ruimte nodig
 * - Resource rijen kunnen hoog worden
 */
const calendar = new Calendar({
    modes: {
        week: {
            eventLayout: 'stack'
        }
    }
});

// Visueel:
// Resource A:
// ┌────────────────────────────┐
// │ Event 1                    │
// ├────────────────────────────┤
// │ Event 2 (overlaps)         │
// ├────────────────────────────┤
// │ Event 3 (overlaps)         │
// └────────────────────────────┘
```

### 4.3 Pack Mode

```typescript
/**
 * Pack: Events worden horizontaal naast elkaar geplaatst
 * Overlappende events delen de beschikbare breedte
 *
 * Voordelen:
 * - Compacte weergave
 * - Vaste rij hoogte
 *
 * Nadelen:
 * - Events kunnen smal worden
 * - Bij veel overlaps: minder leesbaarheid
 */
const calendar = new Calendar({
    modes: {
        week: {
            eventLayout: 'pack'
        }
    }
});

// Visueel:
// Resource A:
// ┌─────────┬─────────┬────────┐
// │ Event 1 │ Event 2 │ Event 3│
// │         │         │        │
// └─────────┴─────────┴────────┘
```

### 4.4 Mixed Mode

```typescript
/**
 * Mixed: Combineert stack en pack strategieën
 * Niet-overlappende events naast elkaar
 * Overlappende events gestapeld
 *
 * Best of both worlds voor complexe scenario's
 */
const calendar = new Calendar({
    modes: {
        week: {
            eventLayout: 'mixed'
        }
    }
});
```

### 4.5 None Mode

```typescript
/**
 * None: Geen automatische layout
 * Events worden exact op hun positie gerenderd
 * Overlapping wordt niet opgelost
 *
 * Gebruik alleen met custom layout logica
 */
const calendar = new Calendar({
    modes: {
        week: {
            eventLayout: 'none'
        }
    }
});
```

---

## 5. Tijd-gebaseerde Positionering

### 5.1 Verticale Positionering (DayView)

```typescript
// Uur hoogte bepaalt pixels per minuut
interface TimePositioning {
    hourHeight: number      // Pixels per uur
    minuteHeight: number    // hourHeight / 60

    // Event positie berekening
    calculateTop(startDate: Date): number
    calculateHeight(startDate: Date, endDate: Date): number
}

const calendar = new Calendar({
    modes: {
        day: {
            // calendar.d.ts:28483
            hourHeight: 60,     // 60px per uur = 1px per minuut

            // Breakpoints voor subticks
            // calendar.d.ts:28491
            hourHeightBreakpoints: [
                40,     // Onder 40px: geen subticks
                60,     // 40-60px: 30 min subticks
                100     // Boven 100px: 15 min subticks
            ]
        }
    }
});
```

### 5.2 Event Hoogte Berekening

```typescript
class EventPositionCalculator {
    constructor(
        private hourHeight: number,
        private dayStart: number,    // Uur (bijv. 8 voor 08:00)
        private dayEnd: number       // Uur (bijv. 18 voor 18:00)
    ) {}

    /**
     * Bereken top positie van event
     */
    calculateTop(startDate: Date): number {
        const startHour = startDate.getHours();
        const startMinute = startDate.getMinutes();

        // Minuten vanaf dagstart
        const minutesFromStart =
            (startHour - this.dayStart) * 60 + startMinute;

        // Convert naar pixels
        return minutesFromStart * (this.hourHeight / 60);
    }

    /**
     * Bereken hoogte van event
     */
    calculateHeight(startDate: Date, endDate: Date): number {
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationMinutes = durationMs / (1000 * 60);

        return durationMinutes * (this.hourHeight / 60);
    }

    /**
     * Minimale hoogte voor korte events
     */
    ensureMinHeight(height: number, minEventHeight: number): number {
        return Math.max(height, minEventHeight);
    }
}

// Voorbeeld gebruik
const calc = new EventPositionCalculator(60, 8, 18);

const event = {
    startDate: new Date('2024-01-15T10:30:00'),
    endDate: new Date('2024-01-15T11:45:00')
};

const top = calc.calculateTop(event.startDate);      // 150px (2.5 uur * 60)
const height = calc.calculateHeight(                  // 75px (75 min * 1)
    event.startDate,
    event.endDate
);
```

---

## 6. Horizontale Positionering (Overlap)

### 6.1 Overlap Groep Detectie

```typescript
interface OverlapGroup {
    events: EventModel[]
    startTime: number       // Earliest start
    endTime: number         // Latest end
    columns: number         // Max simultane events
}

class OverlapDetector {
    /**
     * Detecteer overlap groepen
     */
    findOverlapGroups(events: EventModel[]): OverlapGroup[] {
        // Sorteer op startDate
        const sorted = [...events].sort((a, b) =>
            a.startDate.getTime() - b.startDate.getTime()
        );

        const groups: OverlapGroup[] = [];
        let currentGroup: OverlapGroup | null = null;

        for (const event of sorted) {
            if (!currentGroup) {
                currentGroup = this.createGroup(event);
            } else if (this.overlaps(currentGroup, event)) {
                this.addToGroup(currentGroup, event);
            } else {
                groups.push(currentGroup);
                currentGroup = this.createGroup(event);
            }
        }

        if (currentGroup) {
            groups.push(currentGroup);
        }

        return groups;
    }

    private overlaps(group: OverlapGroup, event: EventModel): boolean {
        return event.startDate.getTime() < group.endTime;
    }

    private createGroup(event: EventModel): OverlapGroup {
        return {
            events: [event],
            startTime: event.startDate.getTime(),
            endTime: event.endDate.getTime(),
            columns: 1
        };
    }

    private addToGroup(group: OverlapGroup, event: EventModel): void {
        group.events.push(event);
        group.endTime = Math.max(group.endTime, event.endDate.getTime());
        group.columns = this.calculateColumns(group.events);
    }

    /**
     * Bereken maximaal aantal simultane events
     */
    private calculateColumns(events: EventModel[]): number {
        // Maak lijst van alle start/end punten
        const points: { time: number; isStart: boolean }[] = [];

        for (const event of events) {
            points.push({ time: event.startDate.getTime(), isStart: true });
            points.push({ time: event.endDate.getTime(), isStart: false });
        }

        // Sorteer op tijd
        points.sort((a, b) => a.time - b.time);

        let current = 0;
        let max = 0;

        for (const point of points) {
            if (point.isStart) {
                current++;
                max = Math.max(max, current);
            } else {
                current--;
            }
        }

        return max;
    }
}
```

### 6.2 Kolom Toewijzing

```typescript
class ColumnAssigner {
    /**
     * Wijs kolommen toe aan events binnen overlap groep
     */
    assignColumns(group: OverlapGroup): Map<EventModel, number> {
        const assignments = new Map<EventModel, number>();
        const columnEndTimes: number[] = [];

        // Sorteer events op startDate
        const sorted = [...group.events].sort((a, b) =>
            a.startDate.getTime() - b.startDate.getTime()
        );

        for (const event of sorted) {
            // Vind eerste beschikbare kolom
            let column = this.findAvailableColumn(
                columnEndTimes,
                event.startDate.getTime()
            );

            // Update kolom eind tijd
            columnEndTimes[column] = event.endDate.getTime();

            assignments.set(event, column);
        }

        return assignments;
    }

    private findAvailableColumn(
        columnEndTimes: number[],
        startTime: number
    ): number {
        for (let i = 0; i < columnEndTimes.length; i++) {
            if (columnEndTimes[i] <= startTime) {
                return i;
            }
        }
        // Nieuwe kolom nodig
        return columnEndTimes.length;
    }

    /**
     * Bereken breedte en left positie
     */
    calculateHorizontalPosition(
        column: number,
        totalColumns: number,
        containerWidth: number,
        gutterWidth: number
    ): { left: number; width: number } {
        const availableWidth = containerWidth - gutterWidth;
        const columnWidth = availableWidth / totalColumns;

        return {
            left: column * columnWidth,
            width: columnWidth - 2  // 2px gap tussen events
        };
    }
}
```

---

## 7. MonthView Layout

### 7.1 Cell-based Layout

```typescript
interface MonthViewLayoutConfig {
    // calendar.d.ts:51841
    minRowHeight?: number | string      // Minimum week rij hoogte

    // calendar.d.ts:52128
    sixWeeks?: boolean                  // Altijd 6 weken tonen

    // Overflow handling
    maxEventsPerCell?: number           // Max zichtbare events per dag
    overflowClickAction?: 'popup' | 'expand'
}

const calendar = new Calendar({
    modes: {
        month: {
            minRowHeight: 100,
            sixWeeks: true,

            // Events per cel
            modeDefaults: {
                // Beperkt events per dag cel
                maxEventsPerCell: 3
            }
        }
    }
});
```

### 7.2 All-Day vs Intra-Day Events

```typescript
interface MonthCellLayout {
    // All-day events bovenaan
    allDayEvents: EventModel[]

    // Reguliere events (met tijd)
    intraDayEvents: EventModel[]

    // Overflow indicator
    overflowCount: number
}

class MonthCellRenderer {
    /**
     * Bepaal welke events in cel passen
     */
    layoutCell(
        events: EventModel[],
        maxVisible: number
    ): MonthCellLayout {
        // Scheid all-day van intra-day
        const allDay = events.filter(e => e.allDay);
        const intraDay = events.filter(e => !e.allDay);

        // Sorteer op startDate
        const sorted = [...allDay, ...intraDay].sort((a, b) =>
            a.startDate.getTime() - b.startDate.getTime()
        );

        // Bereken wat past
        const visible = sorted.slice(0, maxVisible);
        const overflow = sorted.length - maxVisible;

        return {
            allDayEvents: visible.filter(e => e.allDay),
            intraDayEvents: visible.filter(e => !e.allDay),
            overflowCount: Math.max(0, overflow)
        };
    }
}
```

### 7.3 Spanning Events (Multi-day)

```typescript
/**
 * Multi-day events in maandweergave
 * Moeten over meerdere cellen gespanned worden
 */
interface SpanningEventLayout {
    eventRecord: EventModel
    startColumn: number     // Dag in week (0-6)
    spanDays: number        // Aantal dagen
    row: number            // Verticale positie in cel
    isStart: boolean       // Begint in deze week
    isEnd: boolean         // Eindigt in deze week
}

class MonthSpanningLayout {
    /**
     * Bereken spanning voor multi-day event
     */
    calculateSpan(
        event: EventModel,
        weekStart: Date,
        weekEnd: Date
    ): SpanningEventLayout {
        // Clip event aan week grenzen
        const displayStart = event.startDate < weekStart
            ? weekStart
            : event.startDate;

        const displayEnd = event.endDate > weekEnd
            ? weekEnd
            : event.endDate;

        // Bereken kolom en span
        const startColumn = displayStart.getDay();
        const endColumn = displayEnd.getDay();
        const spanDays = endColumn - startColumn + 1;

        return {
            eventRecord: event,
            startColumn,
            spanDays,
            row: 0,  // Te bepalen door row-packing algoritme
            isStart: event.startDate >= weekStart,
            isEnd: event.endDate <= weekEnd
        };
    }

    /**
     * Pack spanning events in rijen
     */
    packSpanningEvents(
        spans: SpanningEventLayout[]
    ): SpanningEventLayout[] {
        // Sorteer op start, dan op duur (langste eerst)
        const sorted = [...spans].sort((a, b) => {
            if (a.startColumn !== b.startColumn) {
                return a.startColumn - b.startColumn;
            }
            return b.spanDays - a.spanDays;
        });

        // Greedy row assignment
        const rowEndColumns: number[] = [];

        for (const span of sorted) {
            // Vind beschikbare rij
            let row = 0;
            for (let r = 0; r < rowEndColumns.length; r++) {
                if (rowEndColumns[r] < span.startColumn) {
                    row = r;
                    break;
                }
                row = r + 1;
            }

            span.row = row;
            rowEndColumns[row] = span.startColumn + span.spanDays;
        }

        return sorted;
    }
}
```

---

## 8. Event Spacing & Margins

### 8.1 Event Spacing Configuratie

```typescript
// calendar.d.ts:32631
eventSpacing?: number

// calendar.d.ts:28495
hourSpacing?: number | string

const calendar = new Calendar({
    modes: {
        day: {
            // Ruimte tussen events
            eventSpacing: 2,

            // Ruimte tussen uur rijen
            hourSpacing: 0
        },

        week: {
            eventSpacing: 2
        }
    }
});
```

### 8.2 CSS Spacing Variables

```css
.b-dayview {
    --b-event-spacing: 2px;
    --b-hour-spacing: 0;
    --b-event-margin: 1px;
}

.b-cal-event {
    margin: var(--b-event-margin);
}

/* Overlap gap */
.b-cal-event-overlap {
    margin-left: 2px;
}
```

---

## 9. Responsive Layout

### 9.1 Hour Height Breakpoints

```typescript
// calendar.d.ts:28491
hourHeightBreakpoints?: number[]

const calendar = new Calendar({
    modes: {
        day: {
            hourHeight: 80,

            /**
             * Breakpoints bepalen wanneer subticks verschijnen
             *
             * Onder breakpoints[0]: geen subticks
             * breakpoints[0] - breakpoints[1]: 30 min subticks
             * breakpoints[1] - breakpoints[2]: 15 min subticks
             * Boven breakpoints[2]: 10 min subticks
             */
            hourHeightBreakpoints: [40, 60, 100]
        }
    }
});
```

### 9.2 Minimum Day Width

```typescript
const calendar = new Calendar({
    modes: {
        week: {
            // Minimum breedte per dag kolom
            minDayWidth: 100,

            // Bij kleinere container: horizontaal scrollen
            overflowX: 'scroll'
        }
    }
});
```

### 9.3 Event Height Constraints

```typescript
const calendar = new Calendar({
    modes: {
        day: {
            // Minimum event hoogte (korte events)
            // calendar.d.ts:32940
            minEventHeight: 20,

            // Event blijft leesbaar ongeacht duur
            modeDefaults: {
                eventRenderer({ eventRecord, renderData }) {
                    // Forceer minimum hoogte
                    if (renderData.height < 20) {
                        renderData.height = 20;
                    }
                    return eventRecord.name;
                }
            }
        }
    }
});
```

---

## 10. Custom Layout Implementatie

### 10.1 Eigen Layout Class

```typescript
import { DayLayout, DayLayoutConfig } from '@bryntum/calendar';

interface CustomLayoutConfig extends DayLayoutConfig {
    maxColumns?: number
    columnGap?: number
}

class CustomDayLayout extends DayLayout {
    static readonly isCustomDayLayout = true;

    maxColumns: number = 3;
    columnGap: number = 4;

    constructor(config?: CustomLayoutConfig) {
        super(config);

        if (config?.maxColumns) {
            this.maxColumns = config.maxColumns;
        }
        if (config?.columnGap !== undefined) {
            this.columnGap = config.columnGap;
        }
    }

    /**
     * Layout events voor een dag
     */
    layoutEvents(
        events: EventModel[],
        dayWidth: number,
        hourHeight: number
    ): Map<EventModel, EventLayoutResult> {
        const results = new Map<EventModel, EventLayoutResult>();

        // Detecteer overlap groepen
        const groups = this.findOverlapGroups(events);

        for (const group of groups) {
            // Beperk tot max kolommen
            const columns = Math.min(group.columns, this.maxColumns);
            const columnWidth = (dayWidth - this.columnGap * (columns - 1)) / columns;

            // Wijs posities toe
            const assignments = this.assignColumns(group.events, columns);

            for (const [event, column] of assignments) {
                results.set(event, {
                    left: column * (columnWidth + this.columnGap),
                    width: columnWidth,
                    top: this.calculateTop(event, hourHeight),
                    height: this.calculateHeight(event, hourHeight)
                });
            }
        }

        return results;
    }

    private calculateTop(event: EventModel, hourHeight: number): number {
        const minuteHeight = hourHeight / 60;
        const startMinutes = event.startDate.getHours() * 60 +
                            event.startDate.getMinutes();
        return startMinutes * minuteHeight;
    }

    private calculateHeight(event: EventModel, hourHeight: number): number {
        const minuteHeight = hourHeight / 60;
        const duration = (event.endDate.getTime() - event.startDate.getTime()) / 60000;
        return duration * minuteHeight;
    }
}

interface EventLayoutResult {
    left: number
    width: number
    top: number
    height: number
}
```

### 10.2 Registreren Custom Layout

```typescript
// Layout registreren
const calendar = new Calendar({
    modes: {
        day: {
            eventLayout: new CustomDayLayout({
                maxColumns: 4,
                columnGap: 2,
                gutter: true,
                gutterWidth: 0.1
            })
        }
    }
});
```

---

## 11. Overlapping Event Sortering

### 11.1 Custom Sort Function

```typescript
// calendar.d.ts:277484
overlappingEventSorter?: (a: EventModel, b: EventModel) => number

const calendar = new Calendar({
    // Custom sortering voor overlappende events
    overlappingEventSorter(a: EventModel, b: EventModel): number {
        // Langere events eerst (meer zichtbaar links)
        const durationA = a.endDate.getTime() - a.startDate.getTime();
        const durationB = b.endDate.getTime() - b.startDate.getTime();

        if (durationA !== durationB) {
            return durationB - durationA;  // Langste eerst
        }

        // Bij gelijke duur: priority veld
        const priorityA = a.getData('priority') || 0;
        const priorityB = b.getData('priority') || 0;

        return priorityB - priorityA;  // Hoogste priority eerst
    }
});
```

### 11.2 Resource-specifieke Layout

```typescript
// calendar.d.ts:264535
// Per resource layout mode
const calendar = new Calendar({
    resourceStore: {
        data: [
            {
                id: 1,
                name: 'Resource A',
                // Pack events voor deze resource
                eventLayout: 'pack'
            },
            {
                id: 2,
                name: 'Resource B',
                // Stack events voor deze resource
                eventLayout: 'stack'
            },
            {
                id: 3,
                name: 'Resource C',
                // Geen overlap toegestaan
                eventLayout: 'none'
            }
        ]
    }
});
```

---

## 12. Performance Optimalisaties

### 12.1 Layout Caching

```typescript
class CachedLayoutEngine {
    private cache = new Map<string, EventLayoutResult>();

    /**
     * Cache key voor event layout
     */
    private getCacheKey(event: EventModel, viewDate: Date): string {
        return `${event.id}_${viewDate.toISOString()}_${event.startDate.getTime()}_${event.endDate.getTime()}`;
    }

    /**
     * Haal gecachte layout of bereken nieuw
     */
    getLayout(
        event: EventModel,
        viewDate: Date,
        compute: () => EventLayoutResult
    ): EventLayoutResult {
        const key = this.getCacheKey(event, viewDate);

        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }

        const result = compute();
        this.cache.set(key, result);
        return result;
    }

    /**
     * Invalideer cache voor specifiek event
     */
    invalidate(event: EventModel): void {
        for (const [key] of this.cache) {
            if (key.startsWith(`${event.id}_`)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear hele cache
     */
    clear(): void {
        this.cache.clear();
    }
}
```

### 12.2 Incremental Layout

```typescript
class IncrementalLayoutEngine {
    private layoutResults = new Map<string, EventLayoutResult>();

    /**
     * Update layout voor alleen gewijzigde events
     */
    updateLayout(
        allEvents: EventModel[],
        changedEvents: Set<EventModel>,
        dayWidth: number,
        hourHeight: number
    ): void {
        // Vind affected overlap groups
        const affectedGroups = this.findAffectedGroups(
            allEvents,
            changedEvents
        );

        // Re-layout alleen affected groups
        for (const group of affectedGroups) {
            this.layoutGroup(group, dayWidth, hourHeight);
        }
    }

    private findAffectedGroups(
        allEvents: EventModel[],
        changedEvents: Set<EventModel>
    ): OverlapGroup[] {
        const groups = this.findOverlapGroups(allEvents);

        return groups.filter(group =>
            group.events.some(e => changedEvents.has(e))
        );
    }
}
```

---

## 13. Gerelateerde Bestanden

### Bryntum Source Files
- `calendar.d.ts` regel 11383: DayLayoutConfig
- `calendar.d.ts` regel 11412: DayLayout class
- `calendar.d.ts` regel 11431: FluidDayLayoutConfig
- `calendar.d.ts` regel 11489: FluidDayLayout class
- `calendar.d.ts` regel 277036: eventLayout types
- `calendar.d.ts` regel 277484: overlappingEventSorter
- `calendar.d.ts` regel 28483: hourHeight config
- `calendar.d.ts` regel 28491: hourHeightBreakpoints
- `calendar.d.ts` regel 32631: eventSpacing
- `calendar.d.ts` regel 264535: ResourceModel eventLayout

### Voorbeelden
- `examples/day-zoom/` - Hour height en zoom
- `examples/resourceview/` - Resource-specifieke layout
- `examples/visible-hours/` - Aangepaste dag uren

---

## 14. Samenvatting

De Calendar Layout Engine beheert:

1. **DayLayout**: Basis class voor dag-gebaseerde layouts
   - Gutter configuratie
   - Inset ruimte voor markers

2. **FluidDayLayout**: Intelligente overlap handling
   - Stagger width voor visuele diepte
   - Clearance minutes voor overlap regels
   - Stretch mode voor volledige breedte

3. **Event Layout Modes** (Scheduler):
   - `stack`: Verticaal stapelen
   - `pack`: Horizontaal naast elkaar
   - `mixed`: Combinatie
   - `none`: Geen automatische layout

4. **Positionering**:
   - Verticaal via hourHeight
   - Horizontaal via kolom algoritme
   - Overlap groep detectie

5. **MonthView specifiek**:
   - Cell-based layout
   - Spanning voor multi-day events
   - Overflow handling

6. **Performance**:
   - Layout caching
   - Incremental updates
   - Breakpoints voor responsive gedrag
