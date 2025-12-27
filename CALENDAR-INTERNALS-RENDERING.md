# Calendar Internals: Rendering Engine

> **Fase 6** - Interne werking van de Calendar rendering engine: DomSync, renderers, templates en paint cycle.

---

## Overzicht

De Bryntum Calendar gebruikt een declaratieve rendering aanpak via DomSync. In plaats van directe DOM manipulatie worden DOM configuratie objecten (DomConfig) gecreëerd die efficiënt worden gesynchroniseerd.

### Rendering Stack

```
EventModel / DayCell Data
        ↓
    Renderers (eventRenderer, dayCellRenderer, etc.)
        ↓
    DomConfig Objects
        ↓
    DomSync Engine
        ↓
    DOM Updates (efficient diffing)
```

---

## 1. DomConfig Systeem

### DomConfig Interface

```typescript
type DomConfig = {
    // Element type
    tag?: string;  // 'div', 'span', 'button', etc.

    // Attributes
    id?: string;
    className?: string | object;  // Object: { 'class-name': boolean }
    style?: object;
    dataset?: Record<string, string>;

    // Content
    text?: string;
    html?: string;  // Gebruik StringHelper.encodeHtml!

    // Children
    children?: (DomConfig | string | null)[];

    // Event handlers (niet aanbevolen - gebruik listeners)
    onClick?: Function;
};
```

### DomConfig Voorbeelden

```javascript
// Simpel element
const simple = {
    tag: 'div',
    className: 'my-class',
    text: 'Hello World'
};

// Complex element
const complex = {
    tag: 'div',
    className: {
        'b-cal-event-wrap': 1,
        'b-allday': event.allDay,
        'custom-class': isCustom
    },
    style: {
        backgroundColor: event.eventColor,
        top: '50px',
        height: '100px'
    },
    dataset: {
        eventId: event.id,
        resourceId: event.resourceId
    },
    children: [
        {
            tag: 'i',
            className: 'b-icon b-icon-calendar'
        },
        {
            tag: 'span',
            className: 'b-event-name',
            text: StringHelper.encodeHtml(event.name)
        }
    ]
};
```

---

## 2. Event Renderers

### eventRenderer Interface

```typescript
interface EventRendererParams {
    eventRecord: EventModel;
    renderData: EventRenderData;
    view: CalendarView;
}

interface EventRenderData {
    // CSS classes (object voor toggle)
    cls: DomClassList;
    iconCls: DomClassList;

    // Styling
    style: object;
    bodyColor?: string;

    // Metadata
    startText: string;
    endText: string;

    // Layout hints
    eventHeight?: number | 'auto';
}

type eventRenderer = (params: EventRendererParams) =>
    string | DomConfig | DomConfig[] | null;
```

### Basis Event Renderer

```javascript
// Bron: examples/custom-rendering/app.module.js
modes: {
    week: {
        eventRenderer({ eventRecord, renderData }) {
            // Voeg CSS classes toe
            if (eventRecord.important) {
                renderData.iconCls['fa fa-exclamation'] = 1;
                renderData.bodyColor = '#ffd9d9';
            }

            // Return custom content
            return {
                tag: 'div',
                className: 'b-event-content',
                children: [
                    {
                        tag: 'span',
                        className: 'b-event-name',
                        text: StringHelper.encodeHtml(eventRecord.name)
                    },
                    eventRecord.image && {
                        tag: 'img',
                        src: eventRecord.image,
                        alt: eventRecord.name,
                        className: 'b-event-image'
                    }
                ].filter(Boolean)
            };
        }
    }
}
```

### Advanced Event Renderer met Avatars

```javascript
// Bron: examples/event-items/app.module.js
const eventRenderer = ({ eventRecord, renderData, view }) => {
    const calendar = view.up('calendar');
    const guestsStore = calendar.crudManager.getStore('guests');
    const guestList = guestsStore.getRange()
        .filter(r => eventRecord.guests.includes(r.id));

    // Avatar rendering helper
    if (!calendar.avatarRendering) {
        calendar.avatarRendering = new AvatarRendering({
            element: calendar.element
        });
    }

    // Icon voor belangrijke events
    if (eventRecord.important) {
        renderData.iconCls['fa fa-exclamation'] = 1;
    }

    return {
        tag: 'div',
        className: 'b-event-content',
        children: [
            {
                tag: 'span',
                className: 'b-event-name',
                text: eventRecord.name
            },
            {
                tag: 'div',
                className: 'b-avatars-container',
                children: guestList.map(r =>
                    calendar.avatarRendering.getResourceAvatar({
                        initials: r.initials,
                        dataset: { btip: r.name }
                    })
                )
            }
        ]
    };
};
```

---

## 3. Day Cell Renderers

### dayCellRenderer Interface

```typescript
type dayCellRenderer = (
    cellData: DayCell
) => string | DomConfig | void;

// Voor MonthView (andere signature)
type monthDayCellRenderer = (
    dayEvents: DayCell,
    cellDomConfig: DomConfig
) => string | void;
```

### MonthView Day Cell Renderer

```javascript
// Bron: examples/custom-rendering/app.module.js
modes: {
    month: {
        dayCellRenderer(cellData) {
            // Special date highlighting
            if (DateHelper.isEqual(cellData.date, new Date(2020, 9, 14), 'day')) {
                cellData.cls['hackathon-dayoff'] = true;
                cellData.headerStyle.fontWeight = 'bold';
                cellData.isNonWorking = true;

                return `${cellData.date.getDate()} Day off yay!`;
            }
        }
    }
}
```

### YearView Day Cell Renderer

```javascript
// Bron: examples/custom-rendering/app.module.js
modes: {
    year: {
        dayCellRenderer({ cellConfig, events, date }) {
            if (date.getMonth() === 4 && date.getDate() === 25) {
                // Speciale datum markeren
                cellConfig.dataset.btip = 'Happy birthday Dave!';
                cellConfig.style.backgroundColor = 'transparent';
                return '<i class="b-icon fa-birthday-cake"></i>';
            }
            else if (date.getDate() === 25) {
                // Paycheck day
                cellConfig.style.fontWeight = '700';
            }
        }
    }
}
```

---

## 4. Header Renderers

### Day Header Renderer

```typescript
type dayHeaderRenderer = (
    dayHeaderDomConfig: DomConfig,
    cellData: DayCell
) => void;
```

```javascript
// Bron: examples/custom-rendering/app.module.js
modes: {
    week: {
        dayHeaderRenderer(dayHeaderDomConfig, cellData) {
            // Add content to special dates
            if (DateHelper.isEqual(cellData.date, new Date(2020, 9, 14), 'day')) {
                dayHeaderDomConfig.className['b-highlight-day'] = 1;
                dayHeaderDomConfig.children.push('\ud83c\udf89 Day off');
            }
        }
    }
}
```

### Column Header Renderer

```typescript
type columnHeaderRenderer = (params: {
    events: EventModel[];
    date: Date;
}) => string | DomConfig;
```

```javascript
modes: {
    week: {
        columnHeaderRenderer({ events }) {
            // Toon totale uren per dag
            const hours = events.reduce((total, event) => {
                return total + DateHelper.as('h', event.fullDuration);
            }, 0);

            return `${hours} hours`;
        }
    }
}
```

### Week Renderer (MonthView)

```javascript
// Bron: examples/custom-rendering/app.module.js
modes: {
    month: {
        showWeekColumn: true,

        weekRenderer(targetElement, [year, week]) {
            DomSync.sync({
                targetElement,
                domConfig: {
                    children: [{
                        className: 'b-week-name',
                        html: `Week ${week}`
                    }],
                    dataset: {
                        btip: 'Click to view week in detail'
                    }
                }
            });
        }
    }
}
```

---

## 5. Event Header Renderer

### Voor DayView/WeekView

```typescript
type eventHeaderRenderer = (params: {
    eventRecord: EventModel;
}) => DomConfig;
```

```javascript
// Bron: examples/timezone/app.module.js
const eventHeaderRenderer = function({ eventRecord }) {
    if (!eventRecord.allDay) {
        // Voeg UTC tijd toe aan header
        const utcString = TimeZoneHelper
            .fromTimeZone(eventRecord.startDate, calendar.project.timeZone)
            .toISOString()
            .substring(11, 16);

        const result = this.defaultEventHeaderRenderer(...arguments);

        result.children.push({
            className: 'b-event-utc',
            text: `${utcString} UTC`
        });

        return result;
    }
};

modes: {
    day: { eventHeaderRenderer },
    week: { eventHeaderRenderer }
}
```

---

## 6. Description Renderer

### View Description

```javascript
modes: {
    month: {
        descriptionRenderer() {
            const eventsInView = this.eventStore.records.filter(event =>
                DateHelper.intersectSpans(
                    this.startDate,
                    this.endDate,
                    event.startDate,
                    event.endDate
                )
            ).length;

            const startWeek = this.month.getWeekNumber(this.startDate);
            const endWeek = this.month.getWeekNumber(this.endDate);

            return `Week ${startWeek[1]} ${startWeek[0]} - ` +
                   `${endWeek[1]} ${endWeek[0]} ` +
                   `(${eventsInView} event${eventsInView === 1 ? '' : 's'})`;
        }
    }
}
```

---

## 7. Overflow Button Renderer

### Custom Overflow Button

```javascript
// Bron: examples/sidebar-customization/app.module.js
modes: {
    month: {
        overflowButtonRenderer(buttonConfig, count) {
            buttonConfig.style.justifyContent = 'unset';
            buttonConfig.className['fa'] = 1;

            if (this.overflowClickAction === 'shrinkwrap') {
                buttonConfig.className['fa-arrow-down'] = 1;
                buttonConfig.text = 'Expand';
            } else {
                buttonConfig.className['fa-window-maximize'] = 1;
                buttonConfig.text = `Show ${count} more`;
            }

            return buttonConfig;
        }
    }
}
```

---

## 8. Time Range Renderer

### TimeRanges Feature Renderer

```typescript
type TimeRangeRenderer = {
    outer?: (info: TimeRangeRenderInfo) => DomConfig | void;
    header?: (info: TimeRangeRenderInfo) => DomConfig | void;
    body?: (info: TimeRangeRenderInfo) => DomConfig | void;
    footer?: (info: TimeRangeRenderInfo) => DomConfig | void;
};
```

```javascript
// Bron: examples/timeranges/app.module.js
features: {
    timeRanges: {
        headerWidth: 42,

        renderer: {
            outer({ domConfig, renderData, timeRange }) {
                // Lijnen (zero duration ranges)
                if (renderData.isLine) {
                    renderData.cls['my-time-range'] = 1;
                    domConfig.dataset.content =
                        `${timeRange.name} : ` +
                        DateHelper.format(timeRange.endDate, 'HH:mm');
                }
            }
        }
    }
}
```

---

## 9. DomSync Engine

### Sync Mechanisme

```javascript
import { DomSync } from '@bryntum/calendar';

// Basic sync
DomSync.sync({
    targetElement: container,
    domConfig: newDomConfig
});

// Met callbacks
DomSync.sync({
    targetElement: container,
    domConfig: newDomConfig,

    callback({ action, domConfig, targetElement, lastDomConfig }) {
        switch (action) {
            case 'newElement':
                // Element is nieuw gecreëerd
                onElementCreated(targetElement, domConfig);
                break;

            case 'reuseElement':
                // Element wordt hergebruikt
                onElementReused(targetElement, domConfig, lastDomConfig);
                break;

            case 'removeElement':
                // Element wordt verwijderd
                onElementRemoved(targetElement);
                break;
        }
    }
});
```

### Sync Options

```typescript
interface DomSyncOptions {
    targetElement: HTMLElement;
    domConfig: DomConfig | DomConfig[];

    // Callbacks
    callback?: (info: DomSyncCallbackInfo) => void;
    releaseThreshold?: number;

    // Strictness
    strict?: boolean;

    // Namespace (voor SVG)
    ns?: string;
}
```

---

## 10. Paint Cycle

### viewPaint Event

```javascript
const calendar = new Calendar({
    listeners: {
        // Algemene paint event
        paint({ source, firstPaint }) {
            if (firstPaint) {
                console.log('Calendar first paint');
            }
        },

        // View-specifieke paint
        viewPaint({ source }) {
            // Sync UI state met active view
            this.widgetMap.showWeekColumn[
                this.mode === 'month' ? 'show' : 'hide'
            ]();
        }
    },

    // Of als method op Calendar
    onViewPaint() {
        // Called when any view paints
    }
});
```

### Refresh Control

```javascript
// Suspend refreshes voor batch updates
calendar.suspendRefresh();

// Voer wijzigingen uit
eventStore.add([...events]);
resourceStore.add([...resources]);
calendar.date = new Date();

// Resume (triggert één refresh)
calendar.resumeRefresh();

// Force refresh
calendar.refresh();

// Refresh specifieke view
calendar.activeView.refresh();
```

---

## 11. String Encoding

### XSS Preventie

```javascript
import { StringHelper } from '@bryntum/calendar';

// ALTIJD encoden van user input
const safeName = StringHelper.encodeHtml(userInput);

// Template literal helper
const html = StringHelper.xss`
    <div class="event-name">${eventRecord.name}</div>
    <div class="event-notes">${eventRecord.notes}</div>
`;

// In renderer
eventRenderer({ eventRecord }) {
    return {
        tag: 'span',
        // Gebruik 'text' voor automatische encoding
        text: eventRecord.name,

        // Of 'html' met expliciete encoding
        html: StringHelper.encodeHtml(eventRecord.description)
    };
}
```

---

## 12. CSS Class Management

### DomClassList

```javascript
// Object notation voor conditionele classes
const className = {
    'b-cal-event-wrap': 1,           // Altijd aan
    'b-allday': event.allDay,        // Conditie
    'b-selected': isSelected,         // Boolean
    'b-dragging': 0,                  // Altijd uit
    [`b-priority-${event.priority}`]: event.priority  // Dynamic
};

// In renderData
eventRenderer({ eventRecord, renderData }) {
    // Voeg classes toe
    renderData.cls['my-custom-class'] = 1;
    renderData.cls['conditional-class'] = eventRecord.important;

    // Voeg icon classes toe
    renderData.iconCls['fa fa-star'] = eventRecord.starred;
}
```

---

## 13. Rendering Optimalisaties

### Memoization

```javascript
// Cache renderer resultaten
const rendererCache = new Map();

function cachedEventRenderer({ eventRecord, renderData }) {
    const cacheKey = `${eventRecord.id}-${eventRecord.version}`;

    if (rendererCache.has(cacheKey)) {
        return rendererCache.get(cacheKey);
    }

    const result = expensiveRenderCalculation(eventRecord);
    rendererCache.set(cacheKey, result);

    return result;
}

// Clear cache on data change
eventStore.on('change', () => rendererCache.clear());
```

### Lazy Rendering

```javascript
modes: {
    agenda: {
        // Render alleen zichtbare events
        eventRenderer({ eventRecord, renderData }) {
            // Defer heavy content voor niet-zichtbare items
            if (!this.isEventVisible(eventRecord)) {
                return eventRecord.name;  // Simpele content
            }

            // Full render voor zichtbare items
            return createFullEventContent(eventRecord);
        }
    }
}
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| EventRenderData | varies by view |
| DomSync | Core module |
| StringHelper | Core module |
| AvatarRendering | 100084 |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `custom-rendering/` | Uitgebreide renderer voorbeelden |
| `event-items/` | Custom event content met avatars |
| `timeranges/` | Time range rendering |
| `custom-theme/` | Custom styling |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
