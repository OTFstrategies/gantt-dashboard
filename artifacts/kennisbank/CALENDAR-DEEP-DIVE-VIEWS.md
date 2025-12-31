# Calendar Deep Dive: Views

> **Fase 6.1** - Diepgaande analyse van alle Calendar view types: DayView, WeekView, MonthView, YearView, AgendaView en view switching.

---

## Overzicht

De Bryntum Calendar ondersteunt meerdere view types die elk een andere manier bieden om events te visualiseren. Alle views erven van een gemeenschappelijke `CalendarMixin` die gedeelde functionaliteit biedt.

### View Type Hiërarchie

```
Panel
├── DayView (extends Panel)
│   └── WeekView (extends DayView)
├── CalendarPanel (extends Panel)
│   └── MonthView (extends CalendarPanel)
├── YearView (extends Panel)
└── EventList (extends Grid)
    └── AgendaView (extends EventList)
```

### TypeScript Referenties

| Class | Line in calendar.d.ts |
|-------|----------------------|
| Calendar | 16771 |
| DayView | 36096 |
| WeekView | 61613 |
| MonthView | 52644 |
| YearView | 63651 |
| AgendaView | 22904 |
| CalendarRow | 26681 |

---

## 1. Calendar (Main Container)

De `Calendar` class is de hoofdcontainer die alle views beheert en view switching mogelijk maakt.

### Basis Configuratie

```typescript
interface CalendarConfig {
    // Start datum
    date: Date | string;

    // Actieve view mode
    mode: 'day' | 'week' | 'month' | 'year' | 'agenda' | string;

    // View configuraties
    modes: {
        day?: DayViewConfig | null;
        week?: WeekViewConfig | null;
        month?: MonthViewConfig | null;
        year?: YearViewConfig | null;
        agenda?: AgendaViewConfig | null;
        [customMode: string]: CalendarViewConfig | null;
    };

    // Default settings voor alle views
    modeDefaults: object;

    // Sidebar configuratie
    sidebar: SidebarConfig | null;

    // Niet-werkdagen
    nonWorkingDays: Record<number, boolean>;  // 0=Sunday, 6=Saturday
    hideNonWorkingDays: boolean;

    // Datum limieten
    minDate: Date;
    maxDate: Date;
}
```

### View Switching

```typescript
// Programmatisch wisselen van view
calendar.mode = 'week';

// Actieve view opvragen
const activeView: CalendarView = calendar.activeView;

// Itereren over alle views
calendar.eachView(view => {
    if (view.isDayView) {
        view.compactHeader = true;
    }
});
```

### Example: Basic Calendar Setup

```javascript
// Bron: examples/basic/app.module.js
const calendar = new Calendar({
    date: new Date(2020, 9, 12),
    mode: 'week',

    crudManager: {
        autoLoad: true,
        loadUrl: 'data/data.json'
    },

    sidebar: {
        items: {
            datePicker: {
                highlightSelectedWeek: true
            }
        }
    },

    features: {
        eventTooltip: {
            align: 'l-r'
        }
    }
});
```

---

## 2. DayView

De `DayView` toont events voor één of meerdere dagen in een verticale tijdlijn.

### TypeScript Interface

```typescript
interface DayViewConfig {
    // Tijdsbereik
    dayStartTime: string | number;  // '08:00' of milliseconds
    dayEndTime: string | number;    // '18:00' of milliseconds

    // Uur rendering
    fitHours: boolean | { minHeight?: number };
    hourHeight: number;

    // Core working hours highlight
    coreHours: object | ((date: Date) => object[]) | string;

    // All-day header
    showAllDayHeader: boolean;
    allDayEvents: CalendarRow;  // readonly

    // Layout
    compactHeader: boolean;
    animateTimeShift: boolean;

    // Drag & Drop
    allowDragCreate: boolean;
    allowDragMove: boolean;
    allowDragResize: boolean;

    // Auto create events
    autoCreate: {
        gesture?: string;          // 'dblclick'
        newName?: Function | string;
        step?: string;             // '15 minutes'
        snapType?: 'round' | 'ceil' | 'floor';
        duration?: string;         // '1 hour'
        startHour?: number;
    } | string | boolean;

    // Time ticks styling
    dashedSubticks: boolean;
}
```

### Key Properties

| Property | Type | Beschrijving |
|----------|------|--------------|
| `allDayEvents` | CalendarRow | Header met all-day events |
| `cellMap` | Map | Date → DayCell mapping |
| `firstVisibleCell` | HTMLElement | Eerste zichtbare cel |
| `firstVisibleDate` | Date | Datum van eerste cel |
| `duration` | number | Aantal dagen in view |

### Example: Day View Configuratie

```javascript
// Bron: examples/day-agenda/app.module.js
const calendar = new Calendar({
    date: '2024-05-27',
    mode: 'day',

    modeDefaults: {
        dayStartTime: 8,
        dayEndTime: 18,
        showAllDayHeader: false,
        hideBorders: true
    },

    modes: {
        day: {
            type: 'dayagenda',
            hideNonWorkingDays: false
        },
        week: {
            type: 'dayagenda',
            title: 'Week Agenda',
            range: '1 w',
            syncHourHeights: true
        }
    }
});
```

---

## 3. WeekView

De `WeekView` is een uitbreiding van `DayView` die automatisch 7 dagen toont.

### TypeScript Interface

```typescript
interface WeekViewConfig extends DayViewConfig {
    // WeekView specifiek - erft alle DayView configs
    // Range wordt automatisch op 1 week gezet
}
```

### Verschil met DayView

```javascript
// WeekView is simpelweg een DayView met range: '1 week'
modes: {
    week: {
        // Inherits van DayView
        dayStartTime: 7,
        dayEndTime: 20,
        hideNonWorkingDays: true
    }
}
```

---

## 4. MonthView

De `MonthView` toont een maandoverzicht met event bars.

### TypeScript Interface

```typescript
interface MonthViewConfig {
    // Event rendering
    eventHeight: number | string;  // pixels of CSS units
    eventSpacing: number;          // pixels tussen events

    // Week rows
    autoRowHeight: boolean;        // Flex rows to share height
    showWeekColumn: boolean;       // Week number column

    // Overflow handling
    overflowClickAction: 'popup' | 'shrinkwrap';

    // Layout
    animateTimeShift: boolean;

    // Drag & Drop
    allowDragCreate: boolean;
    allowDragMove: boolean;
    allowDragResize: boolean;
}
```

### Overflow Handling

```javascript
// Bron: examples/sidebar-customization/app.module.js
modes: {
    month: {
        // Custom overflow button
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

### Week Row Expansion

```javascript
// Collapse expanded weeks programmatically
for (let i = 0; i < 6; i++) {
    calendar.activeView.flexWeekRow(i);
}
```

---

## 5. YearView

De `YearView` toont een compact jaaroverzicht met 12 mini-maanden.

### TypeScript Interface

```typescript
interface YearViewConfig {
    // Event visualization
    showEvents: 'dots' | 'count' | false;
    eventDots: {
        marginTop?: number;
        max?: number;
        gap?: number;
        size?: number;
        stripe?: boolean;
    };

    // Hover behavior
    eventCountTip: boolean | Record<string, boolean | string>;
    overflowPopupTrigger: 'click' | 'hover';

    // Layout
    showWeekColumn: boolean;

    // Drag & Drop
    allowDragCreate: boolean;
    allowDragMove: boolean;
    allowDragResize: boolean;
}
```

### Event Dots Configuratie

```javascript
modes: {
    year: {
        showEvents: 'dots',
        eventDots: {
            max: 5,
            size: 6,
            gap: 2,
            stripe: true  // Striped pattern for overflow
        }
    }
}
```

---

## 6. AgendaView

De `AgendaView` toont events als een gesorteerde lijst, gegroepeerd op datum.

### TypeScript Interface

```typescript
interface AgendaViewConfig {
    // Date filtering
    dateFilter: ((context: DayCell) => boolean) | string;

    // Empty state
    showEmptyDates: boolean;
    alwaysShowCurrentDate: boolean;

    // Event display
    offsetStartsBeforeEvents: boolean;
    hideEventOverflow: boolean;

    // Settings button
    settingsButton: ButtonConfig | Button;

    // Features (Grid-based)
    features: AgendaViewFeaturesType;
}
```

### Example: List View Configuratie

```javascript
// Bron: examples/listview/app.module.js
class AppEvent extends EventModel {
    static fields = [{
        name: 'notes',
        column: {
            width: '20em',
            editor: { type: 'textareapickerfield' }
        }
    }, {
        name: 'important',
        type: 'boolean'
    }];

    get eventStartDate() {
        return this.getData('eventStartDate') ||
               DateHelper.startOf(this.startDate);
    }
}

const calendar = new Calendar({
    modes: {
        list: {
            weight: 1,  // Show first
            columns: [{
                field: 'name',
                flex: '0 0 12em',
                renderer({ record }) {
                    return [{
                        tag: 'i',
                        className: 'b-icon b-icon-circle',
                        style: `color:${record.resource?.eventColor}`
                    }, {
                        text: record.name
                    }];
                }
            }],
            features: {
                columnPicker: {
                    createColumnsFromModel: true
                },
                group: {
                    field: 'eventStartDate',
                    renderer({ grid, rowElement, isFirstColumn, groupRowFor }) {
                        if (isFirstColumn) {
                            rowElement.dataset.date =
                                DateHelper.format(groupRowFor, 'YYYY-MM-DD');
                            return DateHelper.format(groupRowFor, grid.dateFormat);
                        }
                        return '';
                    }
                }
            }
        }
    }
});
```

---

## 7. ResourceView

De `ResourceView` toont meerdere resource-specifieke subviews naast elkaar.

### TypeScript Interface

```typescript
interface ResourceViewConfig {
    // Resource layout
    resourceWidth: string;  // '30em'

    // Subview configuratie
    view: {
        type?: 'dayview' | 'weekview' | 'monthview';
        // + all view type configs
        tools?: Record<string, ToolConfig>;
        strips?: Record<string, StripConfig>;
    };

    // Resource meta info
    meta: (resource: ResourceModel) => string;
}
```

### Example: Resource View Setup

```javascript
// Bron: examples/resourceview/app.module.js
const calendar = new Calendar({
    modes: {
        day: null,
        week: null,
        month: null,
        year: null,
        agenda: null,

        weekResources: {
            type: 'resource',
            title: 'Week',
            resourceWidth: '30em',
            hideNonWorkingDays: true,

            view: {
                dayStartTime: 8,
                tools: {
                    close: {
                        cls: 'fa fa-times',
                        tooltip: 'Filter out this resource',
                        handler: 'up.onSubviewCloseClick'
                    }
                },
                strips: {
                    resourceInfo: {
                        type: 'widget',
                        dock: 'header',
                        cls: 'b-resource-location',
                        html: 'up.getSubViewHeader'
                    }
                }
            },

            meta: resource => resource.title
        },

        monthResources: {
            type: 'resource',
            title: 'Month',
            resourceWidth: '30em',
            hideNonWorkingDays: true,

            view: {
                type: 'monthview'
            },

            meta: resource => resource.title
        }
    },

    tbar: {
        items: {
            viewWidth: {
                type: 'slider',
                label: 'Resource width',
                min: 12,
                max: 100,
                value: 30,
                unit: 'em',
                onInput({ value }) {
                    calendar.eachView(v => v.resourceWidth = value + 'em');
                }
            }
        }
    },

    getSubViewHeader(widget) {
        const resource = widget.owner.resource;
        return `<span class="city">${resource.city}</span>`;
    },

    onSubviewCloseClick(domEvent, view) {
        this.widgetMap.resourceFilter.selected.remove(view.resource);
    }
});
```

---

## 8. View Switching

### Mode Button Bar

De Calendar heeft standaard een button bar voor view switching:

```javascript
// Beschikbare modes aanpassen
modes: {
    day: null,      // Verberg day view
    week: true,     // Default week view
    month: true,    // Default month view
    year: null,     // Verberg year view
    agenda: null    // Verberg agenda view
}
```

### Custom Mode Buttons

```javascript
tbar: {
    items: {
        // Mode buttons worden automatisch gegenereerd
        // maar kunnen worden aangepast:
        dayShowButton: {
            weight: 100  // Volgorde aanpassen
        },
        weekShowButton: {
            hidden: true  // Verbergen
        }
    }
}
```

### Programmatic View Switching

```javascript
// Direct mode wisselen
calendar.mode = 'month';

// Met datum
calendar.date = new Date(2024, 5, 15);
calendar.mode = 'week';

// Event-based
calendar.on('beforeActiveItemChange', ({ activeItem }) => {
    // Voorkom wisselen naar week op kleine schermen
    if (this.responsiveState !== 'large' && activeItem === this.modes.week) {
        this.queueMicrotask(() => this.mode = 'day');
        return false;
    }
});
```

---

## 9. Responsive Design

### Responsive States

```javascript
const calendar = new Calendar({
    responsive: {
        small: {
            when: 500,
            sidebar: {
                collapsed: true
            }
        },
        medium: {
            when: 900
        },
        large: {
            when: '*'
        }
    },

    onResponsiveStateChange({ state }) {
        if (state === 'large') {
            this.widgetMap.weekShowButton.show();
        } else {
            this.widgetMap.weekShowButton.hide();
            if (this.mode === 'week') {
                this.mode = 'day';
            }
        }
    }
});
```

---

## 10. Shared View Mixins

### CalendarMixin

Gedeelde functionaliteit voor alle views:

```typescript
interface CalendarMixin {
    // Navigation
    scrollTo(target: Date | EventModel, options?: BryntumScrollOptions): Promise<void>;

    // Event access
    getEventElement(eventRecord: EventModel): HTMLElement;
    getEventRecord(element: HTMLElement): EventModel;

    // Date utilities
    cellMap: Map<string, DayCell>;  // 'YYYY-MM-DD' → cell data
    firstVisibleDate: Date;

    // Configuration
    hideNonWorkingDays: boolean;
    nonWorkingDays: Record<number, boolean>;
}
```

### DayCellCollecter

Verzamelt cell data voor alle datum-gebaseerde views:

```typescript
interface DayCell {
    view: CalendarView;
    date: Date;
    key: string;  // 'YYYY-MM-DD'
    day: number;  // 0-6 (Sunday-Saturday)
    isNonWorking: boolean;
    visible: boolean;
    events: EventModel[];
    renderedEvents: EventBar[];
    timeRanges: TimeRangeModel[];
}
```

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `basic/` | Standaard Calendar setup |
| `day-agenda/` | DayAgenda view variant |
| `listview/` | Custom list/agenda view |
| `resourceview/` | Resource-based multi-view |
| `sidebar-customization/` | Custom sidebar en tbar |
| `responsive/` | Responsive layout |
| `fit-hours/` | Hour fitting configuratie |
| `day-zoom/` | Day view zooming |

---

## Implementatie Notities

### View Lifecycle

1. **Constructie**: View wordt gecreëerd bij Calendar init
2. **Activatie**: `activeView` property wordt gezet
3. **Rendering**: Events worden gepositioneerd via layout engine
4. **Navigatie**: Date changes triggeren re-render
5. **Cleanup**: Niet-actieve views blijven in memory

### Performance Overwegingen

- Views worden niet destroyed bij mode switch
- Virtual scrolling voor grote datasets (AgendaView)
- Event batching bij bulk updates
- Lazy rendering voor off-screen content

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
