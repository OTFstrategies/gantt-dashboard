# Calendar Implementation: Month Grid

> **Implementatie guide** voor jaar-overzicht in Bryntum Calendar: 12-maanden grid, event grouping, custom rendering, en compact display.

---

## Overzicht

Month Grid toont een jaar-overzicht met alle maanden in een grid:

- **12-Month Grid** - Alle maanden zichtbaar in één view
- **Event Grouping** - Events gegroepeerd per resource
- **Collapsed Groups** - Compacte weergave met uitklap
- **Custom Renderer** - Event datum en tijd in lijst
- **Responsive Height** - Minimum maand hoogte configuratie

---

## 1. Basic Configuration

### 1.1 Calendar Setup

```javascript
import { Calendar, DomHelper, DateHelper, StringHelper } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo: 'container',
    date: '2025-01-15',
    mode: 'monthgrid',

    crudManager: {
        autoLoad: true,
        loadUrl: 'data/data.json'
    },

    modes: {
        year: null,  // Disable standaard year view

        monthgrid: {
            // Verberg scrollbar indien platform die toont
            hideEventScroll: Boolean(DomHelper.scrollBarWidth),

            // Read-only mode
            readOnly: true,

            // Minimum hoogte per maand
            minMonthHeight: 190
        }
    }
});
```

---

## 2. Event Grouping

### 2.1 Group by Resource

```javascript
modes: {
    monthgrid: {
        // Configureer de maand event store
        monthEventStore: {
            // Start met ingeklapte groepen
            startGroupsCollapsed: true,

            // Groepeer op resource naam
            groupers: [{
                field: 'resource.name'
            }]
        }
    }
}
```

### 2.2 Custom Grouper

```javascript
monthEventStore: {
    startGroupsCollapsed: true,

    groupers: [{
        field: 'resource.name',

        // Custom group header renderer
        groupHeaderRenderer({ groupRowFor, record }) {
            const count = record.groupChildren.length;
            return `${groupRowFor} (${count} events)`;
        }
    }]
}
```

---

## 3. Event Renderer

### 3.1 Custom Event Display

```javascript
modes: {
    monthgrid: {
        eventRenderer({ eventRecord }) {
            const { name, startDate } = eventRecord;

            return StringHelper.xss`
                <span>${name}</span>
                <span>${DateHelper.format(startDate, 'Do{ at }HH:mm')}</span>
            `;
        }
    }
}
```

### 3.2 Rich Event Renderer

```javascript
eventRenderer({ eventRecord, resourceRecord }) {
    const { name, startDate, endDate, duration } = eventRecord;
    const isMultiDay = duration > 24;

    return {
        children: [
            {
                className: 'event-name',
                text: name
            },
            {
                className: 'event-time',
                text: isMultiDay
                    ? `${DateHelper.format(startDate, 'MMM D')} - ${DateHelper.format(endDate, 'MMM D')}`
                    : DateHelper.format(startDate, 'HH:mm')
            },
            resourceRecord && {
                className: 'event-resource',
                text: resourceRecord.name
            }
        ]
    };
}
```

---

## 4. Sidebar Configuration

### 4.1 DatePicker met Week Highlight

```javascript
sidebar: {
    items: {
        datePicker: {
            // Highlight de geselecteerde week
            highlightSelectedWeek: true
        }
    }
}
```

### 4.2 Custom Sidebar Items

```javascript
sidebar: {
    items: {
        datePicker: {
            highlightSelectedWeek: true
        },

        // Year selector
        yearSelector: {
            type: 'numberfield',
            label: 'Year',
            value: 2025,
            min: 2000,
            max: 2100,
            step: 1,
            weight: 50,

            onChange({ value }) {
                this.up('calendar').date = new Date(value, 0, 1);
            }
        },

        // Quick navigation
        quickNav: {
            type: 'buttongroup',
            weight: 60,
            items: [
                {
                    text: 'Today',
                    onClick() {
                        this.up('calendar').date = new Date();
                    }
                },
                {
                    text: 'This Month',
                    onClick() {
                        const now = new Date();
                        this.up('calendar').date = new Date(now.getFullYear(), now.getMonth(), 1);
                    }
                }
            ]
        }
    }
}
```

---

## 5. Styling

### 5.1 Month Grid CSS

```css
/* Month grid container */
.b-monthgrid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 8px;
    padding: 8px;
}

/* Individual month block */
.b-monthgrid-month {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

/* Month header */
.b-monthgrid-month-header {
    background: #f5f5f5;
    padding: 8px;
    font-weight: bold;
    text-align: center;
    border-bottom: 1px solid #e0e0e0;
}

/* Event list */
.b-monthgrid-event-list {
    padding: 4px;
    max-height: 150px;
    overflow-y: auto;
}

/* Hide scrollbar unless hovered */
.b-monthgrid-event-list:not(:hover) {
    overflow-y: hidden;
}

/* Individual event */
.b-monthgrid-event {
    display: flex;
    justify-content: space-between;
    padding: 4px 8px;
    margin: 2px 0;
    background: var(--event-color, #e3f2fd);
    border-radius: 4px;
    font-size: 0.85em;
}

.event-name {
    font-weight: 500;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.event-time {
    color: #666;
    margin-left: 8px;
}

/* Group header */
.b-group-header {
    background: #fafafa;
    padding: 4px 8px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.b-group-header::before {
    content: '\25BC';
    margin-right: 8px;
    font-size: 0.7em;
    transition: transform 0.2s;
}

.b-group-header.b-collapsed::before {
    transform: rotate(-90deg);
}
```

---

## 6. Interactivity

### 6.1 Event Click Handler

```javascript
listeners: {
    eventClick({ eventRecord, resourceRecord }) {
        // Open event detail view
        this.showEventDetails(eventRecord);
    }
}

showEventDetails(eventRecord) {
    // Custom detail panel
    new Panel({
        title: eventRecord.name,
        floating: true,
        centered: true,
        width: 400,
        closable: true,
        items: {
            details: {
                type: 'container',
                html: `
                    <p><strong>Start:</strong> ${DateHelper.format(eventRecord.startDate, 'LLL')}</p>
                    <p><strong>End:</strong> ${DateHelper.format(eventRecord.endDate, 'LLL')}</p>
                    <p><strong>Duration:</strong> ${eventRecord.fullDuration}</p>
                `
            }
        }
    }).show();
}
```

### 6.2 Month Click Navigation

```javascript
listeners: {
    monthClick({ date }) {
        // Switch naar month view voor geselecteerde maand
        this.mode = 'month';
        this.date = date;
    }
}
```

---

## 7. Data Display Options

### 7.1 Event Count Indicator

```javascript
modes: {
    monthgrid: {
        // Toon event count in month header
        monthHeaderRenderer({ month, eventCount }) {
            return {
                children: [
                    {
                        className: 'month-name',
                        text: DateHelper.format(new Date(month.year, month.month, 1), 'MMMM')
                    },
                    eventCount > 0 && {
                        className: 'event-count',
                        text: `${eventCount} events`
                    }
                ]
            };
        }
    }
}
```

### 7.2 Show Only Busy Months

```javascript
modes: {
    monthgrid: {
        // Filter maanden zonder events
        monthFilter(month) {
            const events = this.eventStore.getEvents({
                startDate: DateHelper.startOf(month, 'month'),
                endDate: DateHelper.endOf(month, 'month')
            });

            return events.length > 0;
        }
    }
}
```

---

## 8. TypeScript Interfaces

```typescript
import { Calendar, DateHelper, Model } from '@bryntum/calendar';

// MonthGrid Mode Config
interface MonthGridConfig {
    hideEventScroll?: boolean;
    readOnly?: boolean;
    minMonthHeight?: number;
    monthEventStore?: MonthEventStoreConfig;
    eventRenderer?: MonthGridEventRenderer;
    monthHeaderRenderer?: MonthHeaderRenderer;
    monthFilter?: MonthFilter;
}

// Month Event Store Config
interface MonthEventStoreConfig {
    startGroupsCollapsed?: boolean;
    groupers?: GrouperConfig[];
}

interface GrouperConfig {
    field: string;
    groupHeaderRenderer?: (context: GroupHeaderContext) => string;
}

interface GroupHeaderContext {
    groupRowFor: string;
    record: Model;
}

// Event Renderer
type MonthGridEventRenderer = (context: MonthEventRenderContext) => string | DomConfig;

interface MonthEventRenderContext {
    eventRecord: EventModel;
    resourceRecord?: ResourceModel;
}

// Month Header Renderer
type MonthHeaderRenderer = (context: MonthHeaderContext) => string | DomConfig;

interface MonthHeaderContext {
    month: { year: number; month: number };
    eventCount: number;
}

// Month Filter
type MonthFilter = (month: Date) => boolean;

// Sidebar Config
interface MonthGridSidebarConfig {
    datePicker?: {
        highlightSelectedWeek?: boolean;
    };
}
```

---

## 9. Complete Example

```javascript
import { Calendar, DomHelper, DateHelper, StringHelper } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo: 'container',
    date: '2025-01-15',
    mode: 'monthgrid',

    crudManager: {
        autoLoad: true,
        loadUrl: 'data/data.json'
    },

    modes: {
        year: null,

        monthgrid: {
            hideEventScroll: Boolean(DomHelper.scrollBarWidth),
            readOnly: true,
            minMonthHeight: 190,

            // Event grouping per resource
            monthEventStore: {
                startGroupsCollapsed: true,
                groupers: [{
                    field: 'resource.name'
                }]
            },

            // Custom event renderer
            eventRenderer({ eventRecord }) {
                const { name, startDate } = eventRecord;

                return StringHelper.xss`
                    <span class="event-name">${name}</span>
                    <span class="event-time">${DateHelper.format(startDate, 'Do{ at }HH:mm')}</span>
                `;
            }
        }
    },

    sidebar: {
        items: {
            datePicker: {
                highlightSelectedWeek: true
            },

            yearSelector: {
                type: 'numberfield',
                label: 'Year',
                value: 2025,
                min: 2000,
                max: 2100,
                weight: 50,
                onChange({ value }) {
                    this.up('calendar').date = new Date(value, 0, 1);
                }
            }
        }
    },

    listeners: {
        eventClick({ eventRecord }) {
            console.log('Event clicked:', eventRecord.name);
        }
    }
});
```

---

## Referenties

- Examples: `calendar-7.1.0-trial/examples/monthgrid/`
- View: MonthGridView
- API: monthEventStore
- API: eventRenderer
- Config: minMonthHeight

---

*Document gegenereerd: December 2024*
*Bryntum Calendar versie: 7.1.0*
