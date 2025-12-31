# Calendar Deep Dive: Tooltips

> **Fase 6** - Uitgebreide gids voor Calendar tooltips: EventTooltip, ScheduleTooltip, custom renderers, tools, styling en async content.

---

## Overzicht

De Bryntum Calendar biedt twee tooltip features: `EventTooltip` voor event-specifieke informatie en `ScheduleTooltip` voor lege schedule gebieden. Beide features zijn uitgebreid configureerbaar met custom renderers, tools en interactieve content.

### Tooltip Componenten

| Component | Beschrijving |
|-----------|-------------|
| **EventTooltip** | Feature voor tooltips op events |
| **ScheduleTooltip** | Feature voor tooltips op schedule gebieden |
| **EventTip** | Widget klasse voor event tooltips |
| **Tooltip** | Basis widget klasse |

---

## 1. TypeScript Interfaces

### EventTooltipConfig (line 9193)

```typescript
// Bron: calendar.d.ts line 9193
type EventTooltipConfig = {
    type?: 'eventTooltip' | 'eventtooltip';

    // Alignment configuratie
    align?: AlignSpec | string;
    alignToDomEvent?: boolean;

    // Timing
    clickDelay?: number;

    // Rendering
    renderer?: ((context: {
        eventRecord: EventModel;
        tip: Tooltip;
        element: HTMLElement;
        activeTarget: HTMLElement;
        event: Event;
    }) => string | Promise<any> | DomConfig) | string;

    // Title rendering
    titleRenderer?: ((record: EventModel) => string | DomConfig) | string;

    // Trigger gedrag
    showOn?: 'click' | 'contextmenu' | 'mouseover' | 'hover';

    // All-day events
    extendAllDayEndDay?: boolean;

    // Cluster handling
    revealEventsInCluster?: boolean;

    // Disabled state
    disabled?: boolean | 'inert';

    // Direct tooltip configuratie
    tooltip?: EventTipConfig;

    // Event listeners
    listeners?: EventTooltipListeners;

    // Events
    onBeforeDestroy?: ((event: { source: Base }) => void) | string;
    onCatchAll?: ((event: { [key: string]: any; type: string }) => void) | string;
    onDestroy?: ((event: { source: Base }) => void) | string;
    onDisable?: ((event: { source: InstancePlugin }) => void) | string;
    onEnable?: ((event: { source: InstancePlugin }) => void) | string;
};
```

### ScheduleTooltipConfig (line 10330)

```typescript
// Bron: calendar.d.ts line 10330
type ScheduleTooltipConfig = {
    type?: 'scheduleTooltip' | 'scheduletooltip';

    // Anchoring
    anchorToDayCell?: boolean;

    // Precision
    precise?: boolean;

    // Renderer functie
    renderer?: ((
        view: CalendarMixinClass,
        date: Date,
        preciseDate: Date,
        events: EventModel[],
        timeRanges: TimeRangeModel[],
        resource?: ResourceModel
    ) => string | DomConfig) | string;

    // Visibility configuratie
    showOnEvents?: boolean;
    showScheduleTip?: ((view: CalendarMixinClass, date: Date) => boolean) | string;

    // Tooltip widget config
    tooltip?: TooltipConfig;

    // Disabled state
    disabled?: boolean | 'inert';

    // Event listeners
    listeners?: ScheduleTooltipListeners;
};
```

### EventTipConfig (line 43750)

```typescript
// Bron: calendar.d.ts line 43750
type EventTipConfig = {
    type?: 'eventTooltip' | 'eventtooltip';

    // Positioning
    align?: AlignSpec | string;
    anchor?: boolean;
    anchorToTarget?: boolean;
    centered?: boolean;

    // Mouse behavior
    allowOver?: boolean;
    autoClose?: boolean;
    autoHide?: boolean;
    autoShow?: boolean;

    // Timing
    dismissDelay?: number;
    hoverDelay?: number;

    // Content
    html?: string;
    getHtml?: ((context: {
        tip: Tooltip;
        element: HTMLElement;
        activeTarget: HTMLElement;
        event: Event;
    }) => string | Promise<any>) | string;

    // Date formatting
    dateFormat?: string | ((date: Date) => string);

    // Target selector
    forSelector?: string;

    // Visual
    closable?: boolean;
    closeAction?: 'hide' | 'destroy';
    closeOnEscape?: boolean;
    cls?: string | object;
    bodyCls?: string | object;

    // Tools
    tools?: Record<string, ToolConfig>;

    // Bars
    tbar?: ToolbarConfig | (ContainerItemConfig | string)[];
    bbar?: ToolbarConfig | (ContainerItemConfig | string)[];

    // Events
    onBeforeShow?: ((event: { source: Tooltip }) => Promise<boolean> | boolean | void) | string;
    onPointerOver?: ((event: { source: Tooltip; event: Event }) => Promise<boolean> | boolean | void) | string;
};
```

### Tooltip Base Class (line 158692)

```typescript
// Bron: calendar.d.ts line 158692
export class Tooltip extends Popup {
    // Static properties
    static readonly currentOverElement: HTMLElement;
    static readonly isTooltip: boolean;
    static showOverflow: boolean;

    // Instance properties
    readonly activeTarget: HTMLElement;
    hoverDelay: number;
    html: string;
    readonly isTooltip: boolean;
    rendition: 'plain' | 'rich' | string | null;
    readonly triggeredByEvent: Event;

    // Methods
    showAsyncMessage(message: string): void;
}
```

---

## 2. EventTooltip Feature

### Basis Configuratie

```javascript
// Bron: examples/tooltips/app.module.js
const calendar = new Calendar({
    appendTo: 'container',

    features: {
        eventTooltip: {
            // Trigger gedrag
            showOn: BrowserHelper.isTouchDevice ? 'click' : 'hover',

            // Alignment
            align: {
                align: 't-b',  // Top van tooltip naar bottom van event
                minHeight: null  // Geen minimum height
            },

            // Custom renderer
            renderer: ({ eventRecord }) => `<dl>
                <dt>Time:</dt>
                <dd>${DateHelper.format(eventRecord.startDate, 'LT')} -
                    ${DateHelper.format(eventRecord.endDate, 'LT')}</dd>
                ${eventRecord.note ? `<dt>Note:</dt>
                    <dd>${StringHelper.encodeHtml(eventRecord.note)}</dd>` : ''}
            </dl>`
        }
    }
});
```

### ShowOn Opties

```javascript
features: {
    eventTooltip: {
        // Option 1: Click (default)
        showOn: 'click',
        clickDelay: 300,  // Delay voor double-click detectie

        // Option 2: Hover
        showOn: 'hover',  // of 'mouseover'

        // Option 3: Context menu
        showOn: 'contextmenu',

        // Touch device detectie
        showOn: BrowserHelper.isTouchDevice ? 'click' : 'hover'
    }
}
```

### Alignment Configuratie

```javascript
features: {
    eventTooltip: {
        align: {
            // Align tooltip top to event bottom
            align: 't-b',

            // Fallback alignments
            alignFallbacks: ['t-t', 'b-b', 'l-r', 'r-l'],

            // Offset van target
            offset: 10,

            // Constraint
            constrainTo: document.body,

            // Minimum dimensions
            minHeight: null,
            minWidth: 200
        },

        // Of align naar muis positie
        alignToDomEvent: true
    }
}
```

---

## 3. Custom Renderer

### HTML Template Renderer

```javascript
features: {
    eventTooltip: {
        renderer({ eventRecord, tip, activeTarget }) {
            const resource = eventRecord.resource;
            const duration = DateHelper.diff(
                eventRecord.startDate,
                eventRecord.endDate,
                'hour'
            );

            return `
                <div class="custom-tooltip">
                    <div class="tooltip-header">
                        <img src="${resource.image}" alt="${resource.name}" />
                        <h3>${StringHelper.encodeHtml(eventRecord.name)}</h3>
                    </div>
                    <div class="tooltip-body">
                        <div class="row">
                            <span class="label">Time:</span>
                            <span class="value">
                                ${DateHelper.format(eventRecord.startDate, 'LT')} -
                                ${DateHelper.format(eventRecord.endDate, 'LT')}
                            </span>
                        </div>
                        <div class="row">
                            <span class="label">Duration:</span>
                            <span class="value">${duration} hours</span>
                        </div>
                        <div class="row">
                            <span class="label">Status:</span>
                            <span class="value status-${eventRecord.status}">
                                ${eventRecord.status}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}
```

### DomConfig Renderer

```javascript
features: {
    eventTooltip: {
        renderer({ eventRecord }) {
            return {
                tag: 'dl',
                className: 'event-details',
                children: [
                    { tag: 'dt', text: 'Event:' },
                    { tag: 'dd', text: eventRecord.name },
                    { tag: 'dt', text: 'Time:' },
                    {
                        tag: 'dd',
                        children: [
                            {
                                tag: 'span',
                                className: 'time-start',
                                text: DateHelper.format(eventRecord.startDate, 'LT')
                            },
                            { tag: 'span', text: ' - ' },
                            {
                                tag: 'span',
                                className: 'time-end',
                                text: DateHelper.format(eventRecord.endDate, 'LT')
                            }
                        ]
                    },
                    eventRecord.location && {
                        tag: 'dt',
                        text: 'Location:'
                    },
                    eventRecord.location && {
                        tag: 'dd',
                        children: [
                            { tag: 'i', className: 'b-icon b-icon-location' },
                            { tag: 'span', text: eventRecord.location }
                        ]
                    }
                ].filter(Boolean)  // Filter null/undefined items
            };
        }
    }
}
```

### Named Renderer Function

```javascript
const calendar = new Calendar({
    features: {
        eventTooltip: {
            // Referentie naar methode op Calendar
            renderer: 'up.renderEventTooltip'
        }
    },

    renderEventTooltip({ eventRecord }) {
        // 'this' is de Calendar instance
        const resource = this.resourceStore.getById(eventRecord.resourceId);
        return this.formatEventDetails(eventRecord, resource);
    },

    formatEventDetails(event, resource) {
        return `<div class="tooltip-content">
            <h4>${event.name}</h4>
            <p>Assigned to: ${resource?.name || 'Unassigned'}</p>
        </div>`;
    }
});
```

---

## 4. Title Renderer

### Custom Title

```javascript
features: {
    eventTooltip: {
        // Custom title renderer
        titleRenderer(eventRecord) {
            return `${eventRecord.name} - ${eventRecord.resource?.name}`;
        },

        renderer({ eventRecord }) {
            // Body content only (title handled separately)
            return `<div class="tooltip-body">
                <p>${eventRecord.description || 'No description'}</p>
            </div>`;
        }
    }
}
```

### DomConfig Title

```javascript
features: {
    eventTooltip: {
        titleRenderer(eventRecord) {
            return {
                className: 'custom-title',
                children: [
                    {
                        tag: 'span',
                        className: 'event-icon',
                        style: `background-color: ${eventRecord.eventColor}`
                    },
                    {
                        tag: 'span',
                        text: eventRecord.name
                    },
                    eventRecord.isRecurring && {
                        tag: 'i',
                        className: 'b-icon b-icon-recurring'
                    }
                ].filter(Boolean)
            };
        }
    }
}
```

---

## 5. Tools Configuratie

### Tooltip Tools

```javascript
// Bron: examples/tooltips/app.module.js
features: {
    eventTooltip: {
        tools: {
            // Left navigation tool
            left: {
                cls: 'b-icon-previous',
                weight: 20,  // Tool ordering
                tooltip: {
                    getHtml: 'up.moveEarlierTooltip'
                },
                handler: 'up.moveEarlier'
            },

            // Right navigation tool
            right: {
                cls: 'b-icon-next',
                weight: 10,
                tooltip: {
                    getHtml: 'up.moveLaterTooltip'
                },
                handler: 'up.moveLater'
            },

            // Edit tool
            edit: {
                cls: 'b-icon-edit',
                weight: 30,
                tooltip: 'Edit event',
                handler: 'up.onEditClick'
            },

            // Delete tool (built-in)
            delete: {
                // Default delete tool kan verborgen worden
                hidden: false
            }
        }
    }
},

// Calendar methods voor tools
moveEarlier(domEvent, { eventRecord }) {
    const step = DateHelper.parseDuration(this.autoCreate.step);
    eventRecord.shift(-step.magnitude, step.unit);
},

moveLater(domEvent, { eventRecord }) {
    const step = DateHelper.parseDuration(this.autoCreate.step);
    eventRecord.shift(step.magnitude, step.unit);
},

moveEarlierTooltip() {
    return `Move event earlier by ${this.autoCreate.step}`;
},

moveLaterTooltip() {
    return `Move event later by ${this.autoCreate.step}`;
},

onEditClick(domEvent, { eventRecord }) {
    this.editEvent(eventRecord);
}
```

### Conditional Tool Visibility

```javascript
features: {
    eventTooltip: {
        tools: {
            delete: {
                handler: 'up.onDeleteEvent'
            },

            duplicate: {
                cls: 'b-icon-copy',
                tooltip: 'Duplicate event',
                handler: 'up.onDuplicateEvent'
            }
        },

        // Use onBeforeShow to conditionally show/hide tools
        onBeforeShow() {
            const { eventRecord } = this;

            // Hide delete for recurring occurrences
            this.tools.delete.hidden = eventRecord?.isOccurrence;

            // Hide duplicate for all-day events
            this.tools.duplicate.hidden = eventRecord?.allDay;

            // Update header color
            const color = this.activeTarget &&
                getComputedStyle(this.activeTarget)
                    .getPropertyValue('--cal-event-color');
            this.headerElement.style.setProperty('background-color', color);
        }
    }
}
```

---

## 6. ScheduleTooltip Feature

### Basis Configuratie

```javascript
const calendar = new Calendar({
    features: {
        // Eenvoudig enablen
        scheduleTooltip: true,

        // Of met configuratie
        scheduleTooltip: {
            // Anchor naar dag cel
            anchorToDayCell: true,

            // Precise time of rounded
            precise: false,

            // Toon ook op events
            showOnEvents: false,

            // Custom renderer
            renderer: 'up.renderScheduleTooltip'
        }
    },

    renderScheduleTooltip({ date, view, events, timeRanges }) {
        return `
            <div class="schedule-tip">
                <div class="date">${DateHelper.format(date, 'LLLL')}</div>
                <div class="view-type">${view.type}</div>
                ${events.length > 0
                    ? `<div class="events-count">${events.length} events nearby</div>`
                    : ''}
            </div>
        `;
    }
});
```

### ScheduleTooltip Renderer Parameters

```javascript
features: {
    scheduleTooltip: {
        renderer({
            view,        // CalendarMixinClass - actieve view
            date,        // Date - gesnapped naar increment
            preciseDate, // Date - exacte muis positie
            events,      // EventModel[] - events op deze positie
            timeRanges,  // TimeRangeModel[] - time ranges
            resource     // ResourceModel - resource (indien aanwezig)
        }) {
            // Format based on view type
            let dateFormat;
            if (view.isDayView) {
                dateFormat = 'LT';  // Time only
            } else if (view.isMonthView) {
                dateFormat = 'LL';  // Full date
            } else {
                dateFormat = 'LLLL';  // Full date and time
            }

            return `
                <div class="schedule-tooltip">
                    <strong>${DateHelper.format(date, dateFormat)}</strong>
                    ${resource ? `<br>Resource: ${resource.name}` : ''}
                    ${timeRanges.length > 0
                        ? `<br>In: ${timeRanges[0].name}`
                        : ''}
                </div>
            `;
        }
    }
}
```

### Conditional ScheduleTooltip

```javascript
features: {
    scheduleTooltip: {
        // Control wanneer tooltip wordt getoond
        showScheduleTip(view, date) {
            // Alleen tonen in DayView en WeekView
            if (!view.isDayView && !view.isWeekView) {
                return false;
            }

            // Niet tonen buiten werktijden
            const hour = date.getHours();
            if (hour < 8 || hour > 18) {
                return false;
            }

            // Niet tonen in het weekend
            const day = date.getDay();
            if (day === 0 || day === 6) {
                return false;
            }

            return true;
        },

        renderer({ date, view }) {
            return `Click to create event at ${DateHelper.format(date, 'LT')}`;
        }
    }
}
```

---

## 7. Async Tooltip Content

### Promise-Based Renderer

```javascript
features: {
    eventTooltip: {
        async renderer({ eventRecord, tip }) {
            // Toon loading indicator
            tip.showAsyncMessage('Loading details...');

            try {
                // Fetch extra data
                const response = await fetch(`/api/events/${eventRecord.id}/details`);
                const details = await response.json();

                return `
                    <div class="event-details">
                        <h4>${eventRecord.name}</h4>
                        <p><strong>Created by:</strong> ${details.createdBy}</p>
                        <p><strong>Last modified:</strong> ${details.lastModified}</p>
                        <p><strong>Attendees:</strong> ${details.attendees.join(', ')}</p>
                        ${details.notes ? `<p><strong>Notes:</strong> ${details.notes}</p>` : ''}
                    </div>
                `;
            } catch (error) {
                return `<div class="error">Failed to load details</div>`;
            }
        }
    }
}
```

### GetHtml Alternative

```javascript
features: {
    eventTooltip: {
        tooltip: {
            getHtml: async ({ tip, activeTarget, event }) => {
                // Extract event ID from target
                const eventId = activeTarget.dataset.eventId;

                if (!eventId) {
                    return 'No event selected';
                }

                tip.showAsyncMessage('Loading...');

                const details = await fetchEventDetails(eventId);
                return formatDetails(details);
            }
        }
    }
}
```

---

## 8. Tooltip Styling

### CSS Klassen

```css
/* Main tooltip container */
.b-sch-event-tooltip {
    min-width: 190px;
}

/* Event tooltip specifiek */
.b-cal-event-tooltip {
    /* Custom styling */
}

/* Tooltip header */
.b-tooltip .b-header {
    background-color: var(--cal-event-color);
    color: white;
    padding: 8px 12px;
}

/* Tooltip body */
.b-tooltip .b-panel-content {
    padding: 12px;
}

/* Definition list styling */
.b-sch-event-tooltip dl,
.b-sch-event-tooltip dt,
.b-sch-event-tooltip dd {
    padding: 0;
    margin: 0;
}

.b-sch-event-tooltip dt {
    font-weight: bold;
}

.b-sch-event-tooltip dt:not(:first-child) {
    margin-top: 1em;
}

.b-sch-event-tooltip dd {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 0.3em;
    line-height: 1em;
}
```

### Custom CSS Klasse

```javascript
features: {
    eventTooltip: {
        tooltip: {
            cls: 'my-custom-tooltip',
            bodyCls: 'my-tooltip-body'
        }
    }
}
```

```css
.my-custom-tooltip {
    --tooltip-bg: #2c3e50;
    --tooltip-text: #ecf0f1;

    background-color: var(--tooltip-bg);
    color: var(--tooltip-text);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.my-custom-tooltip .b-header {
    background-color: #3498db;
    border-radius: 8px 8px 0 0;
}

.my-tooltip-body {
    padding: 16px;
}

/* Rich tooltip rendition */
.b-tooltip.b-rich-tooltip {
    /* Uses default rich styling */
}

/* Plain tooltip rendition */
.b-tooltip.b-plain-tooltip {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: none;
}
```

### Responsive Tooltip Styling

```css
/* Bron: examples/tooltips/resources/app.css */
@media (max-height: 800px) {
    .b-sch-event-tooltip dd .image {
        height: 150px;
    }
}

@media (max-width: 320px) {
    .b-sch-event-tooltip dd .image {
        height: 100px;
    }
}

/* Touch device optimalisaties */
.b-touch-device .b-tooltip {
    font-size: 16px;
    min-width: 200px;
}

.b-touch-device .b-tooltip .b-tool {
    width: 44px;
    height: 44px;
}
```

---

## 9. Tooltip Events

### EventTooltip Events

```javascript
features: {
    eventTooltip: {
        listeners: {
            beforeDestroy({ source }) {
                console.log('Tooltip being destroyed');
            },

            catchAll({ event }) {
                console.log('Tooltip event:', event.type);
            }
        }
    }
}
```

### Tooltip Widget Events

```javascript
features: {
    eventTooltip: {
        tooltip: {
            listeners: {
                beforeShow({ source }) {
                    // Prevent show under certain conditions
                    if (someCondition) {
                        return false;
                    }
                },

                show({ source }) {
                    console.log('Tooltip shown for:', source.eventRecord?.name);
                },

                hide({ source }) {
                    console.log('Tooltip hidden');
                },

                pointerOver({ source, event }) {
                    // Custom hover handling
                }
            }
        }
    }
}
```

### Calendar-Level Tooltip Events

```javascript
const calendar = new Calendar({
    listeners: {
        // Listen to tooltip events at calendar level
        eventTooltipShow({ source, eventRecord }) {
            console.log('Showing tooltip for:', eventRecord.name);
        },

        eventTooltipHide({ source }) {
            console.log('Tooltip hidden');
        }
    }
});
```

---

## 10. All-Day Event Handling

### ExtendAllDayEndDay Config

```javascript
features: {
    eventTooltip: {
        // Display end date as last day event falls on
        // instead of exclusive end date
        extendAllDayEndDay: true,

        renderer({ eventRecord }) {
            if (eventRecord.allDay) {
                // Format for all-day events
                const startStr = DateHelper.format(eventRecord.startDate, 'LL');
                const endStr = DateHelper.format(
                    DateHelper.add(eventRecord.endDate, -1, 'day'),
                    'LL'
                );

                return `
                    <div class="all-day-tooltip">
                        <strong>${eventRecord.name}</strong>
                        <p>${startStr} - ${endStr}</p>
                    </div>
                `;
            }

            // Regular event format
            return `
                <div class="event-tooltip">
                    <strong>${eventRecord.name}</strong>
                    <p>${DateHelper.format(eventRecord.startDate, 'LT')} -
                       ${DateHelper.format(eventRecord.endDate, 'LT')}</p>
                </div>
            `;
        }
    }
}
```

---

## 11. Recurring Event Tooltips

### Occurrence-Specific Content

```javascript
features: {
    eventTooltip: {
        renderer({ eventRecord }) {
            let recurringInfo = '';

            if (eventRecord.isOccurrence) {
                recurringInfo = `
                    <div class="recurring-badge">
                        <i class="b-icon b-icon-recurring"></i>
                        Recurring event (occurrence)
                    </div>
                    <div class="occurrence-date">
                        This occurrence: ${DateHelper.format(eventRecord.startDate, 'LL')}
                    </div>
                `;
            } else if (eventRecord.isRecurring) {
                recurringInfo = `
                    <div class="recurring-badge">
                        <i class="b-icon b-icon-recurring"></i>
                        Recurring event (master)
                    </div>
                    <div class="recurrence-rule">
                        ${eventRecord.recurrenceRule}
                    </div>
                `;
            }

            return `
                <div class="event-tooltip">
                    <h4>${eventRecord.name}</h4>
                    ${recurringInfo}
                    <div class="time">
                        ${DateHelper.format(eventRecord.startDate, 'LT')} -
                        ${DateHelper.format(eventRecord.endDate, 'LT')}
                    </div>
                </div>
            `;
        },

        onBeforeShow() {
            // Hide delete for occurrences (use different UX)
            this.tools.delete.hidden = Boolean(this.eventRecord?.isOccurrence);
        }
    }
}
```

---

## 12. Cluster Event Handling

### RevealEventsInCluster

```javascript
features: {
    eventTooltip: {
        // Expand clustered events when showing tooltip
        revealEventsInCluster: true,

        renderer({ eventRecord }) {
            return `
                <div class="event-tooltip">
                    <h4>${eventRecord.name}</h4>
                    <p>${DateHelper.format(eventRecord.startDate, 'LT')} -
                       ${DateHelper.format(eventRecord.endDate, 'LT')}</p>
                </div>
            `;
        }
    }
}
```

---

## 13. Tooltip Positioning

### Anchor Configuration

```javascript
features: {
    eventTooltip: {
        tooltip: {
            // Show anchor arrow
            anchor: true,

            // Anchor to target element (not mouse)
            anchorToTarget: true,

            // Constraint within viewport
            constrainTo: document.body
        }
    }
}
```

### Follow Mouse

```javascript
features: {
    eventTooltip: {
        tooltip: {
            // Don't anchor to target
            anchorToTarget: false,
            anchor: false,

            // Update position on mouse move
            trackMouse: true
        }
    }
}
```

---

## 14. Tooltip Timing

### Hover Delay

```javascript
features: {
    eventTooltip: {
        showOn: 'hover',

        tooltip: {
            // Delay before showing (ms)
            hoverDelay: 500,

            // Time before auto-hide (ms)
            dismissDelay: 3000,

            // Keep visible when mouse over tooltip
            allowOver: true,

            // Auto hide when mouse leaves
            autoHide: true,

            // Close on click outside
            autoClose: true
        }
    }
}
```

### Click Delay

```javascript
features: {
    eventTooltip: {
        showOn: 'click',

        // Delay to allow double-click detection
        clickDelay: 200
    }
}
```

---

## 15. Tooltip Widget Direct Access

### Accessing the Tooltip

```javascript
const calendar = new Calendar({
    features: {
        eventTooltip: true
    }
});

// Access the tooltip instance
const tooltip = calendar.features.eventTooltip.tooltip;

// Show programmatically
tooltip.show({
    target: someElement,
    html: 'Custom content'
});

// Hide
tooltip.hide();

// Check if visible
if (tooltip.isVisible) {
    // Do something
}

// Get current event
const eventRecord = tooltip.eventRecord;
```

### Creating Standalone Tooltip

```javascript
const tooltip = new Tooltip({
    forElement: calendar.element,
    forSelector: '.b-cal-event',

    getHtml({ activeTarget }) {
        const eventId = activeTarget.dataset.eventId;
        const event = calendar.eventStore.getById(eventId);
        return `Event: ${event.name}`;
    },

    hoverDelay: 300,
    dismissDelay: 2000
});
```

---

## 16. Localization

### Tooltip Localisatie

```javascript
// locale/nl.js
const locale = {
    EventTooltip: {
        'Delete event': 'Verwijder afspraak',
        'Edit event': 'Bewerk afspraak'
    },
    ScheduleTooltip: {
        'Click to create': 'Klik om te maken'
    }
};

LocaleManager.applyLocale(locale);
```

### Custom Localized Content

```javascript
features: {
    eventTooltip: {
        renderer({ eventRecord }) {
            return `
                <dl>
                    <dt>${L('EventTooltip.time')}</dt>
                    <dd>${DateHelper.format(eventRecord.startDate, 'LT')}</dd>
                    <dt>${L('EventTooltip.resource')}</dt>
                    <dd>${eventRecord.resource?.name}</dd>
                </dl>
            `;
        }
    }
}
```

---

## 17. Accessibility

### ARIA Attributes

```javascript
features: {
    eventTooltip: {
        tooltip: {
            // ARIA label
            ariaLabel: 'Event details',

            // ARIA description
            ariaDescription: 'Shows detailed information about the selected event',

            // Focusable
            focusable: true,

            // Focus on show
            focusOnToFront: true
        }
    }
}
```

### Keyboard Navigation

```javascript
features: {
    eventTooltip: {
        showOn: 'click',

        tooltip: {
            // Close on Escape
            closeOnEscape: true,

            // Tab through tools
            tabbable: true
        }
    }
}

// Keyboard shortcuts voor tooltip
calendar.element.addEventListener('keydown', e => {
    if (e.key === 'i' && e.ctrlKey) {
        // Show tooltip for focused event
        const focusedEvent = calendar.activeView.focusedEvent;
        if (focusedEvent) {
            calendar.features.eventTooltip.showTip(focusedEvent);
        }
    }
});
```

---

## 18. Integration Patterns

### Met EventEdit

```javascript
const calendar = new Calendar({
    features: {
        eventTooltip: {
            tools: {
                edit: {
                    cls: 'b-icon-edit',
                    tooltip: 'Edit event',
                    handler() {
                        const eventRecord = this.owner.eventRecord;
                        calendar.editEvent(eventRecord);
                        this.owner.hide();
                    }
                }
            }
        },

        eventEdit: {
            items: {
                // Edit form configuration
            }
        }
    }
});
```

### Met Context Menu

```javascript
const calendar = new Calendar({
    features: {
        eventTooltip: {
            showOn: 'hover'  // Tooltip on hover
        },

        eventMenu: {
            // Context menu on right-click
            items: {
                editEvent: {
                    text: 'Edit',
                    icon: 'b-icon-edit',
                    onItem: ({ eventRecord }) => calendar.editEvent(eventRecord)
                }
            }
        }
    }
});
```

---

## 19. Performance Optimalisaties

### Lazy Loading Content

```javascript
features: {
    eventTooltip: {
        renderer({ eventRecord, tip }) {
            // Return basic content immediately
            const basicContent = `<h4>${eventRecord.name}</h4>`;

            // Load extra details lazily
            setTimeout(async () => {
                if (tip.isVisible && tip.eventRecord === eventRecord) {
                    const details = await fetchDetails(eventRecord.id);
                    tip.html = basicContent + formatDetails(details);
                }
            }, 100);

            return basicContent;
        }
    }
}
```

### Caching Tooltip Content

```javascript
const tooltipCache = new Map();

features: {
    eventTooltip: {
        renderer({ eventRecord }) {
            const cacheKey = `${eventRecord.id}-${eventRecord.modificationDate}`;

            if (tooltipCache.has(cacheKey)) {
                return tooltipCache.get(cacheKey);
            }

            const content = generateTooltipContent(eventRecord);
            tooltipCache.set(cacheKey, content);

            return content;
        }
    }
}

// Clear cache when events change
calendar.eventStore.on({
    update() {
        tooltipCache.clear();
    }
});
```

---

## 20. Debugging

### Debug Mode

```javascript
features: {
    eventTooltip: {
        tooltip: {
            // Keep visible for debugging
            dismissDelay: 999999,
            autoHide: false,
            autoClose: false
        },

        onBeforeShow() {
            console.log('Showing tooltip for:', this.eventRecord);
            console.log('Active target:', this.activeTarget);
            console.log('Trigger event:', this.triggeredByEvent);
        }
    }
}
```

### Tooltip Inspector

```javascript
// Add to browser console
window.debugTooltip = () => {
    const tip = calendar.features.eventTooltip.tooltip;
    return {
        isVisible: tip.isVisible,
        eventRecord: tip.eventRecord,
        element: tip.element,
        config: tip.initialConfig
    };
};
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| EventTooltipConfig | 9193 |
| EventTooltip class | 9361 |
| ScheduleTooltipConfig | 10330 |
| ScheduleTooltip class | 10475 |
| EventTipConfig | 43750 |
| EventTip class | 44817 |
| TooltipConfig | 157673 |
| Tooltip class | 158692 |

---

## Relevante Examples

| Example | Beschrijving |
|---------|-------------|
| `tooltips/` | Custom event tooltip met tools |
| `custom-menus/` | Context menu + tooltip combinatie |
| `resourceview/` | Resource-aware tooltips |
| `custom-rendering/` | Custom event rendering met tooltips |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
