# Calendar Deep Dive: Sidebar

> **Fase 6.3** - Diepgaande analyse van Calendar sidebar componenten: mini calendar, resource filter, date picker en sidebar widgets.

---

## Overzicht

De Calendar sidebar bevat standaard drie hoofdcomponenten:
1. **CalendarDatePicker** - Mini calendar voor navigatie
2. **ResourceFilter** - Checklist voor resource filtering
3. **Custom Widgets** - Uitbreidbare widget container

### Component Hiërarchie

```
Sidebar (extends Panel)
├── CalendarDatePicker (datePicker)
├── ResourceFilter (resourceFilter)
└── Custom Widgets (items)
```

### TypeScript Referenties

| Class | Line in calendar.d.ts |
|-------|----------------------|
| Sidebar | 59358 |
| CalendarDatePicker | 24852 |
| ResourceFilter | 338967 |
| DatePicker (base) | 101784 |

---

## 1. Sidebar Container

De `Sidebar` is een `Panel` die alle navigatie widgets bevat.

### TypeScript Interface

```typescript
interface SidebarConfig {
    // Layout
    width: string | number;  // default: '18em'
    collapsed: boolean;

    // Multi-select highlighting
    highlightMultiSelectSpan: boolean;
    snapMultiSelectNavigation: boolean;

    // Child widgets
    items: {
        datePicker?: CalendarDatePickerConfig | null;
        resourceFilter?: ResourceFilterConfig | null;
        [customWidget: string]: WidgetConfig | null;
    };
}
```

### Sidebar Properties

```typescript
interface Sidebar {
    // Resource filter access
    resourceFilter: ResourceFilter;

    // Responsive states
    isResponsive: boolean;
    responsiveState: string;
}
```

### Basis Sidebar Setup

```javascript
const calendar = new Calendar({
    sidebar: {
        width: '20em',

        items: {
            datePicker: {
                highlightSelectedWeek: true
            },
            resourceFilter: {
                title: 'My Calendars'
            }
        }
    }
});
```

### Sidebar Verbergen

```javascript
// Volledig verbergen
sidebar: null

// Conditioneel collapsed
sidebar: {
    collapsed: window.innerWidth < 768
}
```

---

## 2. CalendarDatePicker (Mini Calendar)

De mini calendar in de sidebar voor datum navigatie.

### TypeScript Interface

```typescript
interface CalendarDatePickerConfig {
    // Event indicators
    showEvents: boolean | 'count' | 'dots' | 'heatmap';
    eventCountTip: boolean;
    eventDots: {
        marginTop?: number;
        max?: number;
        gap?: number;
        size?: number;
        stripe?: boolean;
    };

    // Multi-select
    multiSelect: boolean | 'range';
    highlightSelectedWeek: boolean;

    // Resource filtering
    filterEventResources: boolean;

    // Date range
    minDate: Date;
    maxDate: Date;

    // Week configuration
    weekStartDay: number;  // 0-6
    showWeekNumber: boolean;
}
```

### Event Indicators

```javascript
sidebar: {
    items: {
        datePicker: {
            // Toon event presence als dots
            showEvents: 'dots',
            eventDots: {
                max: 3,
                size: 6,
                gap: 2,
                stripe: true
            },

            // Of als count
            showEvents: 'count',

            // Of als heatmap
            showEvents: 'heatmap',

            // Tooltip met count bij hover
            eventCountTip: true
        }
    }
}
```

### Week Highlighting

```javascript
// Bron: examples/basic/app.module.js
sidebar: {
    items: {
        datePicker: {
            // Highlight de hele week rij
            highlightSelectedWeek: true
        }
    }
}
```

### Multi-Select Mode

```javascript
sidebar: {
    items: {
        datePicker: {
            // Selecteer meerdere datums
            multiSelect: true,

            // Of selecteer date range
            multiSelect: 'range'
        }
    },

    // Highlight multi-select span
    highlightMultiSelectSpan: true,

    // Navigeer per week bij multi-select
    snapMultiSelectNavigation: true
}
```

### DatePicker Toegang

```javascript
// Via calendar
const datePicker = calendar.datePicker;

// Huidige datum ophalen
const selectedDate = datePicker.date;

// Datum programmatisch wijzigen
datePicker.date = new Date(2024, 5, 15);

// Selection ophalen bij multi-select
const selection = datePicker.selection;  // Date[]
```

---

## 3. ResourceFilter

Checkbox lijst voor resource filtering.

### TypeScript Interface

```typescript
interface ResourceFilterConfig {
    // Selection mode
    multiSelect: boolean;  // default: true

    // Initial selection
    selected: (string | number)[];  // Resource IDs

    // Select all checkbox
    selectAllItem: boolean;

    // Title
    title: string;

    // Store binding
    store: ResourceStore;
}
```

### Properties

```typescript
interface ResourceFilter {
    // Selected resources
    readonly value: ResourceModel[];
    selected: Collection<ResourceModel>;

    // Check if resource is selected
    isSelected(resource: ResourceModel): boolean;
}
```

### Basis Configuratie

```javascript
// Bron: examples/resourceview/app.module.js
sidebar: {
    items: {
        resourceFilter: {
            title: 'Resources',
            // Initieel geselecteerde resources
            selected: [2, 3, 4],
            // Toon "Select All" checkbox
            selectAllItem: true
        }
    }
}
```

### Custom Resource Filter

```javascript
// Bron: examples/sidebar-customization/app.module.js
sidebar: {
    items: {
        filterTitle: {
            type: 'toolbar',
            weight: 199,  // Net boven resourceFilter
            cls: 'resource-filter-title',
            items: {
                title: {
                    tag: 'strong',
                    type: 'widget',
                    html: 'My calendars'
                },
                spacer: '->',
                addNew: {
                    type: 'button',
                    cls: 'b-add-calendar b-transparent',
                    icon: 'fa fa-plus',
                    tooltip: 'Add calendar',
                    onClick: 'up.onAddCalendarClick'
                }
            }
        },
        resourceFilter: {
            flex: '0 0 auto',
            selectAllItem: true
        }
    }
}
```

### Programmatic Selection

```javascript
const { resourceFilter } = calendar.widgetMap;

// Alle resources selecteren
resourceFilter.selectAll();

// Alle resources deselecteren
resourceFilter.deselectAll();

// Specifieke resource togglen
resourceFilter.selected.toggle(resourceModel);

// Resource uit selectie verwijderen
resourceFilter.selected.remove(resourceModel);

// Check of resource geselecteerd is
const isSelected = resourceFilter.selected.includes(resourceModel);
```

### Resource Filter Events

```javascript
calendar.widgetMap.resourceFilter.on({
    change({ value, oldValue }) {
        console.log('Selection changed:', value.map(r => r.name));
    }
});
```

---

## 4. Custom Sidebar Widgets

De sidebar kan uitgebreid worden met custom widgets.

### Widget Weights

Standaard widget weights:
- `datePicker`: 100
- `resourceFilter`: 200

```javascript
sidebar: {
    items: {
        // Boven datePicker
        customTop: {
            weight: 50,
            type: 'widget',
            html: 'Top widget'
        },

        // Tussen datePicker en resourceFilter
        customMiddle: {
            weight: 150,
            type: 'widget',
            html: 'Middle widget'
        },

        // Onder resourceFilter
        customBottom: {
            weight: 300,
            type: 'widget',
            html: 'Bottom widget'
        }
    }
}
```

### Create Event Button

```javascript
// Bron: examples/sidebar-customization/app.module.js
sidebar: {
    items: {
        addNew: {
            weight: 0,  // Top position
            type: 'button',
            text: 'Create',
            icon: 'fa fa-plus',
            rendition: 'filled',

            listeners: {
                click: 'up.createEvent',
                args: [undefined]  // Use default date
            }
        }
    }
}
```

### Toggle Widgets

```javascript
sidebar: {
    items: {
        compactHeader: {
            weight: 100,
            type: 'slidetoggle',
            text: 'Show compact header',

            // "up." resolves to owner hierarchy
            onChange: 'up.onToggleCompactHeader'
        }
    }
},

onToggleCompactHeader({ checked }) {
    this.eachView(v => {
        if (v.isDayView) {
            v.compactHeader = checked;
        }
    });
}
```

### Checkbox Groups

```javascript
// Bron: examples/day-agenda/app.module.js
sidebar: {
    items: {
        datePicker: {
            highlightSelectedWeek: true
        },
        checkboxes: {
            flex: '0 0 auto',
            type: 'container',
            weight: 100,
            defaults: { type: 'checkbox' },
            items: {
                hideEmptyHours: {
                    text: 'Hide empty hours',
                    onChange: 'up.onToggleHideEmptyHours'
                },
                hideBorders: {
                    text: 'Hide borders',
                    checked: true,
                    onChange: 'up.onToggleHideBorders'
                },
                hideTimeAxis: {
                    text: 'Hide time axes',
                    onChange: 'up.onToggleHideTimeAxis'
                }
            }
        }
    }
},

onToggleHideEmptyHours({ checked }) {
    this.eachView(v => {
        v.hideEmptyHours = checked;
    });
}
```

### Event Log Widget

```javascript
// Bron: examples/sidebar-customization/app.module.js
class EventLog extends Panel {
    static $name = 'EventLog';
    static type = 'eventlog';

    static configurable = {
        scrollable: true,
        tools: {
            delete: {
                cls: 'b-icon-trash',
                tooltip: 'Clear event log',
                handler: 'clear'
            },
            pause: {
                cls: 'fa',
                tooltip: 'Pause logging',
                text: '\f28b',
                handler: 'toggleLogPaused'
            }
        },
        tbar: {
            items: {
                eventNameFilter: {
                    flex: 1,
                    type: 'textfield',
                    placeholder: 'Filter',
                    triggers: {
                        filter: {
                            cls: 'fa fa-filter',
                            align: 'start'
                        }
                    }
                }
            }
        }
    };

    onPaint({ firstPaint }) {
        if (firstPaint) {
            this.setTimeout(() => {
                this.up('calendar').on({
                    catchAll: 'onCalendarEvent',
                    thisObj: this
                });
            }, 500);
        }
    }

    log(eventName, message) {
        // Log event to panel
    }
}

EventLog.initClass();

// Usage
sidebar: {
    items: {
        eventLog: {
            weight: 250,
            type: 'eventlog',
            cls: 'calendar-event-log',
            title: 'Interaction log'
        }
    }
}
```

---

## 5. Sidebar Removal

### Verwijder Specifieke Items

```javascript
sidebar: {
    items: {
        // Verwijder datePicker
        datePicker: null,

        // Behoud resourceFilter
        resourceFilter: {
            title: 'Calendars'
        }
    }
}
```

### Volledig Verbergen

```javascript
// Geen sidebar
sidebar: null

// Of dynamisch
calendar.sidebar.hidden = true;

// Collapse/expand
calendar.sidebar.collapsed = true;
```

---

## 6. Toolbar (tbar) Customization

De top toolbar kan ook worden aangepast.

### TypeScript Interface

```typescript
interface CalendarTbarConfig {
    items: {
        // Standaard items
        prevButton?: ButtonConfig;
        nextButton?: ButtonConfig;
        todayButton?: ButtonConfig;
        spacer?: object;
        modeSelector?: object;

        // Custom items
        [customItem: string]: WidgetConfig;
    };
}
```

### Custom Toolbar Items

```javascript
// Bron: examples/sidebar-customization/app.module.js
tbar: {
    items: {
        settings: {
            type: 'button',
            icon: 'fa fa-cog',
            tooltip: 'Settings',
            weight: 800,  // At the end

            menu: {
                align: 't100-b100',
                items: {
                    hideEventOverflow: {
                        text: 'Hide event overflow',
                        checked: false,
                        onToggle: ({ checked }) =>
                            calendar.modes.agenda.hideEventOverflow = checked
                    },
                    toggleShowWeek: {
                        text: 'Week column',
                        checked: true,
                        onToggle({ checked }) {
                            calendar.activeView.showWeekColumn = checked;
                        }
                    },
                    toggleNonWorkingDays: {
                        text: 'Nonworking days',
                        checked: true,
                        onToggle({ checked }) {
                            calendar.activeView.hideNonWorkingDays = !checked;
                        }
                    }
                }
            }
        }
    }
}
```

### Resource Width Slider

```javascript
// Bron: examples/resourceview/app.module.js
tbar: {
    items: {
        viewWidth: {
            type: 'slider',
            label: 'Resource width',
            weight: 640,
            min: 12,
            max: 100,
            value: 30,
            unit: 'em',
            showValue: false,
            showTooltip: true,
            onInput({ value }) {
                calendar.eachView(v => v.resourceWidth = value + 'em');
            }
        }
    }
}
```

---

## 7. Responsive Sidebar

### Responsive Configuration

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
            when: 900,
            sidebar: {
                width: '15em'
            }
        },
        large: {
            when: '*',
            sidebar: {
                width: '20em'
            }
        }
    }
});
```

### Manual Collapse

```javascript
// Toggle collapse
calendar.sidebar.collapsed = !calendar.sidebar.collapsed;

// Check state
if (calendar.sidebar.collapsed) {
    // Show expand button
}
```

---

## 8. Widget Toegang

### Via widgetMap

```javascript
// Sidebar widgets
const { resourceFilter, datePicker } = calendar.widgetMap;

// Toolbar widgets
const { settings, viewWidth } = calendar.tbar.widgetMap;

// Custom widgets
const { eventLog, checkboxes } = calendar.widgetMap;
```

### Via Referentie

```javascript
// Direct via Calendar property
const datePicker = calendar.datePicker;
const sidebar = calendar.sidebar;
const tbar = calendar.tbar;
```

---

## 9. Event Handling

### Sidebar Events

```javascript
calendar.sidebar.on({
    collapse() {
        console.log('Sidebar collapsed');
    },
    expand() {
        console.log('Sidebar expanded');
    }
});
```

### Date Selection

```javascript
calendar.datePicker.on({
    selectionChange({ selection }) {
        console.log('Selected dates:', selection);
    },
    dateChange({ date, oldDate }) {
        console.log('Date changed from', oldDate, 'to', date);
    }
});
```

### Resource Selection

```javascript
calendar.widgetMap.resourceFilter.on({
    change({ value }) {
        console.log('Selected resources:', value.map(r => r.name));

        // Update external UI
        updateResourceList(value);
    }
});
```

---

## 10. Styling

### Sidebar CSS Variables

```css
/* Sidebar width */
.b-calendar {
    --sidebar-width: 18em;
}

/* DatePicker styling */
.b-calendar-datepicker {
    --event-dot-size: 6px;
    --event-dot-gap: 2px;
}

/* ResourceFilter styling */
.b-resourcefilter {
    --item-height: 2.5em;
}
```

### Custom Widget Styling

```css
/* Custom widget in sidebar */
.b-calendar .b-sidebar .custom-widget {
    padding: 1em;
    border-top: 1px solid var(--border-color);
}

/* Event log styling */
.calendar-event-log {
    flex: 1;
    min-height: 200px;
}

.calendar-event-log .event-name {
    color: var(--primary-color);
    font-weight: 600;
}
```

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `basic/` | Standaard sidebar configuratie |
| `sidebar-customization/` | Uitgebreide sidebar aanpassingen |
| `resourceview/` | ResourceFilter met custom filtering |
| `day-agenda/` | Checkbox containers in sidebar |
| `customized-resourcefilter/` | Custom resource filter UI |
| `filtering/` | Advanced filtering via sidebar |

---

## Implementatie Notities

### Widget Lifecycle

1. Sidebar wordt gecreëerd bij Calendar initialisatie
2. Widgets worden gesorteerd op `weight`
3. `datePicker` en `resourceFilter` worden automatisch gekoppeld
4. Custom widgets krijgen toegang via `widgetMap`

### Best Practices

- Gebruik `weight` voor widget ordering
- Gebruik `up.methodName` voor event handlers naar Calendar
- Verwijder ongebruikte widgets met `null`
- Test responsive gedrag bij verschillende schermgroottes
- Cache widget references voor performance

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
