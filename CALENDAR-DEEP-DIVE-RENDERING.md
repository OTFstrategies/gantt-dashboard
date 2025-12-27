# CALENDAR-DEEP-DIVE-RENDERING.md
## Bryntum Calendar - Rendering Systeem (Deep Dive)

### Overzicht

Dit document beschrijft het rendering systeem van Bryntum Calendar. Het systeem is gebaseerd op custom renderers die volledige controle geven over hoe events, cellen en headers worden weergegeven. Het gebruikt een virtueel DOM-achtig systeem (DomConfig) voor efficiënte rendering.

---

## 1. TypeScript Interfaces

### 1.1 EventRenderData (regel 3092)
```typescript
type EventRenderData = {
    // Records
    eventRecord: EventModel
    resourceRecord: ResourceModel
    assignmentRecord: AssignmentModel

    // Timing (milliseconds)
    startMS: number
    endMS: number

    // Positie & Dimensies (pixels)
    height: number
    width: number
    top: number
    left: number
}
```

### 1.2 Calendar Event RenderData (regel 21055)
```typescript
interface CalendarEventRenderData {
    // Styling
    style: object               // Inline styles voor event element
    cls: object                 // CSS classes (truthy values = toegevoegd)
    iconStyle: object           // Icon inline styles
    iconCls: object             // Icon CSS classes

    // Kleuren
    eventColor: string          // Event kleur naam
    eventBackground: string     // Achtergrond (kan gradient zijn)
    textColor: string           // Tekst kleur
    bodyColor: string           // Body element kleur

    // Inner styling
    eventInnerStyle: object     // Inner element styles

    // Data attributes
    dataset: object             // data-* attributen

    // Display modes
    solidBar: boolean           // Solid kleur bar vs tonal
    showBullet: boolean         // Bullet point tonen
}
```

### 1.3 DomConfig Type
```typescript
type DomConfig = {
    tag?: string                // HTML tag (default: 'div')
    className?: string|object   // CSS classes
    style?: string|object       // Inline styles
    html?: string               // innerHTML
    text?: string               // textContent
    children?: DomConfig[]      // Child elements
    dataset?: object            // data-* attributen

    // Event handlers
    onClick?: Function
    onMouseenter?: Function
    onMouseleave?: Function

    // ARIA
    'aria-label'?: string
    'aria-describedby'?: string
    role?: string

    // Referentie
    reference?: string          // Widget referentie naam
}
```

---

## 2. Event Renderer

### 2.1 Basis eventRenderer
```typescript
const calendar = new Calendar({
    modeDefaults: {
        eventRenderer({ eventRecord, resourceRecord, renderData }) {
            // Return string voor simpele content
            return eventRecord.name;

            // Of: Return DomConfig voor complexe content
            return {
                tag: 'div',
                className: 'custom-event',
                children: [
                    {
                        tag: 'i',
                        className: `fa ${eventRecord.iconCls}`
                    },
                    {
                        tag: 'span',
                        className: 'event-name',
                        text: eventRecord.name
                    }
                ]
            };
        }
    }
});
```

### 2.2 RenderData Manipulatie
```typescript
const calendar = new Calendar({
    modeDefaults: {
        eventRenderer({ eventRecord, renderData, view }) {
            // CSS classes toevoegen
            renderData.cls['high-priority'] = eventRecord.priority === 'high';
            renderData.cls['completed'] = eventRecord.status === 'done';
            renderData.cls['tentative'] = eventRecord.tentative;

            // Inline styles aanpassen
            renderData.style.opacity = eventRecord.confirmed ? 1 : 0.6;
            renderData.style.borderWidth = '2px';

            // Event kleur overschrijven
            if (eventRecord.customColor) {
                renderData.eventColor = eventRecord.customColor;
                renderData.eventBackground = eventRecord.customColor;
            }

            // Gradient background
            if (eventRecord.resources?.length > 1) {
                const gradient = eventRecord.resources.map((r, i) => {
                    const color = view.createColorValue(r.eventColor);
                    return `${color} ${i * 25}px, ${color} ${(i + 1) * 25}px`;
                }).join(', ');
                renderData.eventBackground = `repeating-linear-gradient(135deg, ${gradient})`;
                renderData.textColor = '#333';
            }

            // Icon styling
            renderData.iconCls['fa'] = true;
            renderData.iconCls[eventRecord.iconCls || 'fa-calendar'] = true;

            // Data attributes voor JS/CSS hooks
            renderData.dataset.eventType = eventRecord.type;
            renderData.dataset.priority = eventRecord.priority;

            // Solid bar vs tonal
            renderData.solidBar = eventRecord.allDay;

            return eventRecord.name;
        }
    }
});
```

### 2.3 View-Specifieke Renderers
```typescript
const calendar = new Calendar({
    modes: {
        week: {
            eventRenderer({ eventRecord, renderData }) {
                // Week-specifieke rendering
                const duration = DateHelper.diff(
                    eventRecord.startDate,
                    eventRecord.endDate,
                    'minute'
                );

                if (duration < 30) {
                    // Compacte weergave voor korte events
                    renderData.cls['compact-event'] = true;
                    return eventRecord.name;
                }

                // Volledige weergave
                return {
                    children: [
                        { tag: 'div', className: 'event-time',
                          text: DateHelper.format(eventRecord.startDate, 'HH:mm') },
                        { tag: 'div', className: 'event-name',
                          text: eventRecord.name }
                    ]
                };
            }
        },

        month: {
            eventRenderer({ eventRecord }) {
                // Month view: compacter
                return {
                    tag: 'span',
                    className: 'month-event',
                    text: eventRecord.name
                };
            }
        },

        agenda: {
            eventRenderer({ eventRecord, resourceRecord }) {
                // Agenda: meer detail
                return {
                    children: [
                        {
                            tag: 'div',
                            className: 'event-header',
                            children: [
                                { tag: 'span', className: 'time',
                                  text: DateHelper.format(eventRecord.startDate, 'HH:mm') },
                                { tag: 'span', className: 'duration',
                                  text: DateHelper.formatDelta(eventRecord.durationMS) }
                            ]
                        },
                        { tag: 'div', className: 'event-name', text: eventRecord.name },
                        resourceRecord ? {
                            tag: 'div',
                            className: 'event-resource',
                            text: resourceRecord.name
                        } : null
                    ].filter(Boolean)
                };
            }
        }
    }
});
```

---

## 3. Cell Renderer

### 3.1 MonthView Cell Renderer
```typescript
const calendar = new Calendar({
    modes: {
        month: {
            cellRenderer({ cell, date, events, allDayEvents, renderData }) {
                const total = events.length + allDayEvents.length;

                // Cell styling op basis van content
                if (total > 5) {
                    cell.classList.add('busy-day');
                }

                if (DateHelper.isWeekend(date)) {
                    cell.classList.add('weekend');
                }

                // Custom cell content
                return {
                    tag: 'div',
                    className: 'cell-content',
                    children: [
                        {
                            tag: 'span',
                            className: 'date-number',
                            text: date.getDate()
                        },
                        total > 0 ? {
                            tag: 'span',
                            className: 'event-count',
                            text: `${total} events`
                        } : null
                    ].filter(Boolean)
                };
            }
        }
    }
});
```

### 3.2 CalendarDatePicker Cell Renderer
```typescript
const calendar = new Calendar({
    sidebar: {
        items: {
            datePicker: {
                cellRenderer({ cell, date, events }) {
                    // Dots voor events
                    if (events?.length) {
                        const dotCount = Math.min(events.length, 3);
                        const dots = Array(dotCount).fill({
                            tag: 'span',
                            className: 'event-dot'
                        });

                        return {
                            children: [
                                { tag: 'span', text: date.getDate() },
                                { tag: 'div', className: 'dots', children: dots }
                            ]
                        };
                    }

                    return date.getDate();
                }
            }
        }
    }
});
```

---

## 4. Column Header Renderer

### 4.1 DayView/WeekView Header
```typescript
const calendar = new Calendar({
    modes: {
        week: {
            columnHeaderRenderer({ date, events, allDayEvents }) {
                const dayName = DateHelper.format(date, 'ddd');
                const dayNum = date.getDate();
                const isToday = DateHelper.isToday(date);
                const eventCount = events.length + allDayEvents.length;

                return {
                    tag: 'div',
                    className: {
                        'column-header': true,
                        'is-today': isToday
                    },
                    children: [
                        {
                            tag: 'span',
                            className: 'day-name',
                            text: dayName
                        },
                        {
                            tag: 'span',
                            className: 'day-number',
                            text: dayNum
                        },
                        eventCount > 0 ? {
                            tag: 'span',
                            className: 'event-badge',
                            text: eventCount
                        } : null
                    ].filter(Boolean)
                };
            }
        }
    }
});
```

---

## 5. Overflow Button Renderer

### 5.1 MonthView Overflow
```typescript
const calendar = new Calendar({
    modes: {
        month: {
            overflowButtonRenderer(buttonConfig, count) {
                // Pas de standaard "+3 more" button aan
                buttonConfig.style.justifyContent = 'flex-start';
                buttonConfig.className['custom-overflow'] = true;

                if (this.overflowClickAction === 'shrinkwrap') {
                    buttonConfig.className['fa'] = true;
                    buttonConfig.className['fa-arrow-down'] = true;
                    buttonConfig.text = 'Toon alle';
                } else {
                    buttonConfig.className['fa'] = true;
                    buttonConfig.className['fa-window-maximize'] = true;
                    buttonConfig.text = `Nog ${count} events`;
                }

                return buttonConfig;
            }
        }
    }
});
```

---

## 6. Resource Avatar Rendering

### 6.1 Resource Avatars op Events
```typescript
const calendar = new Calendar({
    // Path naar avatar images
    resourceImagePath: '../images/users/',

    modes: {
        week: {
            // Avatars tonen
            showResourceAvatars: 'last',  // 'first', 'last', false

            // Max aantal avatars
            maxResourceAvatars: 3
        }
    }
});
```

### 6.2 Custom Avatar Rendering
```typescript
const calendar = new Calendar({
    modeDefaults: {
        eventRenderer({ eventRecord, resourceRecord, renderData }) {
            // Handmatige avatar rendering
            const avatars = eventRecord.resources?.map(r => ({
                tag: 'img',
                className: 'resource-avatar',
                src: r.imageUrl || `${this.resourceImagePath}${r.image}`,
                alt: r.name,
                title: r.name
            })) || [];

            return {
                children: [
                    { tag: 'span', text: eventRecord.name },
                    {
                        tag: 'div',
                        className: 'avatar-container',
                        children: avatars.slice(0, 3)
                    }
                ]
            };
        }
    }
});
```

---

## 7. Time Range Rendering

### 7.1 TimeRangeRenderData (regel 477)
```typescript
type TimeRangeRenderData = {
    // Styling
    style?: object
    cls?: object
    iconCls?: object

    // Onderdelen
    outer?: TimeRangeRenderData
    header?: TimeRangeRenderData
    body?: TimeRangeRenderData
    footer?: TimeRangeRenderData
}
```

### 7.2 Custom Time Range Rendering
```typescript
const calendar = new Calendar({
    features: {
        timeRanges: {
            showCurrentTimeLine: true,
            showHeaderElements: true,

            // Custom rendering
            renderer({ timeRangeRecord, renderData }) {
                if (timeRangeRecord.type === 'lunch') {
                    renderData.cls['lunch-break'] = true;
                    renderData.body.style.background =
                        'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #fff 10px, #fff 20px)';
                }

                return timeRangeRecord.name;
            }
        }
    },

    timeRanges: [
        {
            id: 'lunch',
            name: 'Lunch',
            type: 'lunch',
            startDate: '2024-01-15T12:00',
            endDate: '2024-01-15T13:00',
            recurring: true,
            recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
        }
    ]
});
```

---

## 8. Performance Optimalisatie

### 8.1 Lazy Rendering
```typescript
const calendar = new Calendar({
    modes: {
        agenda: {
            // Alleen zichtbare rijen renderen
            virtualScrolling: true,

            // Buffer grootte
            bufferCoef: 2
        }
    }
});
```

### 8.2 Efficiënte Renderers
```typescript
const calendar = new Calendar({
    modeDefaults: {
        eventRenderer({ eventRecord, renderData }) {
            // GOED: Simpele string return
            if (!eventRecord.needsCustomRender) {
                return eventRecord.name;
            }

            // GOED: Gecachte DomConfig
            return this.cachedConfigs.get(eventRecord.type) || eventRecord.name;
        }
    },

    construct() {
        // Pre-cache common configs
        this.cachedConfigs = new Map([
            ['meeting', {
                children: [
                    { tag: 'i', className: 'fa fa-users' },
                    { tag: 'span', reference: 'nameEl' }
                ]
            }],
            ['task', {
                children: [
                    { tag: 'i', className: 'fa fa-check' },
                    { tag: 'span', reference: 'nameEl' }
                ]
            }]
        ]);
    }
});
```

### 8.3 Batch Updates
```typescript
// Batch meerdere updates
calendar.suspendRefresh();
try {
    events.forEach(event => {
        event.set('status', 'completed');
    });
} finally {
    calendar.resumeRefresh();
}

// Of: silent updates + manual refresh
events.forEach(event => {
    event.set('status', 'completed', true);  // silent
});
calendar.refresh();
```

---

## 9. DomSync & DomHelper

### 9.1 DomSync voor Efficiënte Updates
```typescript
import { DomSync, DomHelper } from '@bryntum/calendar';

// DomSync update alleen gewijzigde elementen
const config = {
    tag: 'div',
    className: 'container',
    children: events.map(e => ({
        tag: 'div',
        className: 'event',
        dataset: { id: e.id },
        text: e.name
    }))
};

// Initiële render
const element = DomHelper.createElement(config);

// Update met minimale DOM manipulatie
DomSync.sync({
    targetElement: element,
    domConfig: newConfig
});
```

### 9.2 DomHelper Utilities
```typescript
import { DomHelper } from '@bryntum/calendar';

// Element creëren
const el = DomHelper.createElement({
    tag: 'div',
    className: 'my-element',
    style: { backgroundColor: 'blue' }
});

// Classes manipuleren
DomHelper.addClasses(el, 'class1', 'class2');
DomHelper.removeClasses(el, 'class1');
DomHelper.toggleClasses(el, { active: true, disabled: false });

// Styles
DomHelper.setStyle(el, 'opacity', 0.5);
DomHelper.applyStyle(el, { opacity: 1, transform: 'scale(1)' });

// Positie
const rect = DomHelper.getTranslateXY(el);
DomHelper.setTranslateXY(el, 100, 200);
```

---

## 10. Implementatie Richtlijnen

### 10.1 Custom Renderer Pattern
```typescript
interface RenderContext {
    eventRecord: EventModel;
    resourceRecord?: ResourceModel;
    view: CalendarView;
    renderData: CalendarEventRenderData;
}

type EventRenderer = (context: RenderContext) => string | DomConfig | DomConfig[] | void;

class EventRendererManager {
    private renderers: Map<string, EventRenderer> = new Map();

    registerRenderer(type: string, renderer: EventRenderer): void {
        this.renderers.set(type, renderer);
    }

    render(context: RenderContext): string | DomConfig {
        const type = context.eventRecord.type || 'default';
        const renderer = this.renderers.get(type) || this.defaultRenderer;
        return renderer(context) || context.eventRecord.name;
    }

    private defaultRenderer(context: RenderContext): string {
        return context.eventRecord.name;
    }
}

// Gebruik
const manager = new EventRendererManager();

manager.registerRenderer('meeting', ({ eventRecord, renderData }) => {
    renderData.iconCls['fa-users'] = true;
    return {
        children: [
            { tag: 'span', className: 'time', text: DateHelper.format(eventRecord.startDate, 'HH:mm') },
            { tag: 'span', className: 'name', text: eventRecord.name }
        ]
    };
});

manager.registerRenderer('deadline', ({ eventRecord, renderData }) => {
    renderData.cls['urgent'] = true;
    renderData.iconCls['fa-exclamation-triangle'] = true;
    return eventRecord.name;
});
```

### 10.2 Virtual DOM Pattern
```typescript
interface VNode {
    tag: string;
    props?: Record<string, any>;
    children?: (VNode | string)[];
}

class VirtualDOM {
    createElement(vnode: VNode): HTMLElement {
        const el = document.createElement(vnode.tag);

        if (vnode.props) {
            Object.entries(vnode.props).forEach(([key, value]) => {
                if (key === 'className') {
                    el.className = typeof value === 'object'
                        ? Object.keys(value).filter(k => value[k]).join(' ')
                        : value;
                } else if (key === 'style') {
                    Object.assign(el.style, value);
                } else if (key.startsWith('on')) {
                    el.addEventListener(key.slice(2).toLowerCase(), value);
                } else if (key.startsWith('data-')) {
                    el.dataset[key.slice(5)] = value;
                } else {
                    el.setAttribute(key, value);
                }
            });
        }

        vnode.children?.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else {
                el.appendChild(this.createElement(child));
            }
        });

        return el;
    }

    diff(oldVNode: VNode, newVNode: VNode, parent: HTMLElement, index: number = 0): void {
        const oldEl = parent.childNodes[index] as HTMLElement;

        if (!oldVNode) {
            parent.appendChild(this.createElement(newVNode));
        } else if (!newVNode) {
            parent.removeChild(oldEl);
        } else if (oldVNode.tag !== newVNode.tag) {
            parent.replaceChild(this.createElement(newVNode), oldEl);
        } else {
            this.updateProps(oldEl, oldVNode.props || {}, newVNode.props || {});
            this.updateChildren(oldEl, oldVNode.children || [], newVNode.children || []);
        }
    }
}
```

---

## 11. Gerelateerde Bestanden

### Bryntum Source Files
- `calendar.d.ts` regel 3092-3129: EventRenderData
- `calendar.d.ts` regel 477-522: TimeRangeRenderData
- `calendar.d.ts` regel 21055: eventRenderer signature
- `calendar.d.ts` regel 23771: cellRenderer signature

### Example Folders
- `examples/tooltips/` - Custom event rendering
- `examples/multiassign/` - Multi-resource rendering
- `examples/sidebar-customization/` - Overflow button rendering
- `examples/resourceview/` - Resource header rendering

---

## 12. Samenvatting

Het rendering systeem biedt:

1. **eventRenderer**: Volledige controle over event weergave
2. **cellRenderer**: Custom cell content in month/date views
3. **columnHeaderRenderer**: Day/week header customization
4. **overflowButtonRenderer**: "+N more" button styling
5. **RenderData Object**: Manipuleer styles, classes, kleuren
6. **DomConfig**: Declaratieve DOM structuur definitie
7. **DomSync**: Efficiënte DOM updates
8. **Virtual Scrolling**: Performance voor grote datasets

Implementatie-aandachtspunten:
- Return string voor simpele content, DomConfig voor complex
- Manipuleer renderData voor styling in plaats van inline styles
- Gebruik view.createColorValue() voor consistente kleuren
- Cache DomConfig objecten waar mogelijk
- Gebruik suspendRefresh/resumeRefresh voor batch updates
