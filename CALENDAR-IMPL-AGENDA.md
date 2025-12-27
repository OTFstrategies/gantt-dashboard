# Calendar Implementation: Agenda View

> **Fase 6.4** - Implementatie guide voor Agenda view, list mode, event grouping by date en virtual scrolling.

---

## Overzicht

De Agenda/List views tonen events in een scrollbare lijst, gegroepeerd op datum. Dit biedt een alternatieve weergave die ideaal is voor het overzien van veel events.

### View Types

| View | Class | Beschrijving |
|------|-------|--------------|
| **AgendaView** | `AgendaView` | Datum-gegroepeerde event lijst |
| **EventList** | `EventList` | Grid-based event lijst |
| **ListView** | Mode alias | Standaard list mode |

### Hiërarchie

```
Grid
└── EventList (extends Grid)
    └── AgendaView (extends EventList)
```

---

## 1. Basis EventList Setup

### Configuratie

```typescript
interface EventListConfig {
    // Date range
    startDate: Date | string;
    endDate: Date | string;
    range: string;  // '1 week', '2 months', etc.

    // Columns
    columns: ColumnConfig[];

    // Features (Grid features)
    features: {
        group?: GroupConfig;
        sort?: SortConfig;
        filter?: FilterConfig;
        columnPicker?: ColumnPickerConfig;
    };

    // Date grouping
    dateFormat: string;

    // Empty state
    showEmptyDates: boolean;
    alwaysShowCurrentDate: boolean;

    // Range menu
    listRangeMenu: MenuConfig | null;
}
```

### Basic List Mode

```javascript
// Bron: examples/listview/app.module.js
const calendar = new Calendar({
    date: new Date(2020, 9, 12),
    mode: 'list',

    modes: {
        list: {
            weight: 1,  // Show first (lowest weight)

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
            }]
        }
    }
});
```

---

## 2. Event Grouping by Date

### Default Grouping

Events worden automatisch gegroepeerd op startdatum.

### Custom Grouping Field

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

    // Custom getter voor grouping (datum zonder tijd)
    get eventStartDate() {
        return this.getData('eventStartDate') ||
               DateHelper.startOf(this.startDate);
    }
}

const calendar = new Calendar({
    modes: {
        list: {
            features: {
                group: {
                    field: 'eventStartDate',

                    // Custom group header renderer
                    renderer({ grid, rowElement, isFirstColumn, groupRowFor }) {
                        if (isFirstColumn) {
                            // Data attribute voor styling
                            rowElement.dataset.date =
                                DateHelper.format(groupRowFor, 'YYYY-MM-DD');

                            return DateHelper.format(groupRowFor, grid.dateFormat);
                        }
                        return '';
                    }
                }
            }
        }
    },

    crudManager: {
        eventStore: {
            modelClass: AppEvent
        }
    }
});
```

### Disable Grouping Menu

```javascript
modes: {
    list: {
        features: {
            headerMenu: {
                items: {
                    groupAsc: false,
                    groupDesc: false,
                    groupRemove: false
                }
            },
            group: {
                field: 'eventStartDate',
                populateHeaderMenu: () => {}  // Empty - no menu items
            }
        }
    }
}
```

---

## 3. Column Configuration

### Default Columns

EventList genereert automatisch kolommen voor:
- `name` - Event naam
- `startDate` - Start tijd
- `endDate` - Eind tijd
- `duration` - Duur

### Custom Columns

```javascript
modes: {
    list: {
        columns: [
            // Override bestaande kolom
            {
                field: 'name',
                flex: null,
                width: '14em',
                renderer({ record }) {
                    return [{
                        tag: 'i',
                        className: 'b-icon b-icon-circle',
                        style: `color:${record.resource?.eventColor}`
                    }, {
                        text: record.name
                    }];
                }
            },

            // Nieuwe custom kolom
            {
                field: 'important',
                text: 'Priority',
                width: 80,
                renderer({ value }) {
                    return value ? '🔴 High' : '⚪ Normal';
                }
            },

            // Tijd kolom met custom format
            {
                field: 'startDate',
                text: 'Start',
                width: 100,
                renderer({ value }) {
                    return DateHelper.format(value, 'HH:mm');
                }
            }
        ]
    }
}
```

### Auto-generate Columns from Model

```javascript
modes: {
    list: {
        features: {
            columnPicker: {
                createColumnsFromModel: true
            }
        }
    }
}
```

---

## 4. Date Range Control

### Range Configuratie

```javascript
// Bron: examples/list-range/app.module.js
const calendar = new Calendar({
    modeDefaults: {
        startDate: '2023-10-09',
        endDate: '2023-10-23',

        // Disable ingebouwde range picker
        listRangeMenu: null
    },

    modes: {
        list: {
            // Expliciete range
            range: '2 weeks'
        }
    }
});
```

### Custom Range Controls

```javascript
// Bron: examples/list-range/app.module.js
sidebar: {
    items: {
        rangeDisplay: {
            type: 'container',
            layout: 'hbox',
            weight: 0,
            defaults: {
                editable: false,
                triggers: { expand: null },
                step: '1d',
                labelPosition: 'above',
                flex: 1,
                listeners: {
                    change: 'up.onRangeFieldChanged'
                }
            },
            items: {
                startDate: {
                    label: 'Start',
                    type: 'datefield',
                    value: startDate,
                    format: 'MMM DD'
                },
                endDate: {
                    label: 'End',
                    type: 'datefield',
                    value: endDate,
                    format: 'MMM DD'
                }
            }
        },
        datePicker: {
            weight: 0,
            type: 'datepicker',
            multiSelect: 'range',
            dragSelect: true,
            selection: [startDate, endDate],
            listeners: {
                selectionChange: 'up.onDatePickerRangeSelected'
            }
        }
    }
},

// Range change handler
onRangeFieldChanged() {
    this.datePicker.selection = [
        this.widgetMap.startDate.value,
        this.widgetMap.endDate.value
    ];
},

// DatePicker range selected
onDatePickerRangeSelected({ source, selection: [startDate, endDate] }) {
    if (source.multiSelect === 'range') {
        this.widgetMap.startDate.value = startDate;
        this.widgetMap.endDate.value = endDate;
    }
},

// View range changed
listeners: {
    rangeChange: 'this.onViewRangeChanged'
},

onViewRangeChanged({ new: { startDate, endDate } }) {
    this.widgetMap.startDate.value = startDate;
    this.widgetMap.endDate.value = endDate;
}
```

---

## 5. AgendaView Specifics

### AgendaView vs EventList

| Feature | EventList | AgendaView |
|---------|-----------|------------|
| Grid-based | ✓ | ✓ |
| Date grouping | Optioneel | Default |
| Settings button | ✗ | ✓ |
| Empty dates | Configurabel | Configurabel |
| Virtual scrolling | ✓ | ✓ |

### AgendaView Configuratie

```typescript
interface AgendaViewConfig extends EventListConfig {
    // Date filtering
    dateFilter: ((context: DayCell) => boolean) | string;

    // Empty state
    showEmptyDates: boolean;      // Show days without events
    alwaysShowCurrentDate: boolean;  // Always show today

    // Event display
    offsetStartsBeforeEvents: boolean;
    hideEventOverflow: boolean;

    // Settings
    settingsButton: ButtonConfig | Button;
}
```

### AgendaView Setup

```javascript
modes: {
    agenda: {
        showEmptyDates: false,
        alwaysShowCurrentDate: true,

        // Date filter
        dateFilter(context) {
            // Hide weekends
            return context.day !== 0 && context.day !== 6;
        }
    }
}
```

---

## 6. Virtual Scrolling

### Automatische Virtual Scrolling

EventList/AgendaView gebruikt automatisch virtual scrolling via Grid's RowManager.

### Performance Configuratie

```javascript
modes: {
    list: {
        // Buffer rows boven/onder viewport
        rowBuffer: 5,

        // Lazy event loading
        features: {
            lazyItems: true
        }
    }
}
```

### Scroll naar Datum

```javascript
// Scroll naar specifieke datum
calendar.activeView.scrollTo(new Date(2024, 5, 15));

// Scroll naar event
calendar.activeView.scrollTo(eventRecord);

// Met opties
calendar.activeView.scrollTo(date, {
    animate: true,
    highlight: true
});
```

---

## 7. Event Sorting

### Default Sorting

Events zijn standaard gesorteerd op startDate.

### Custom Sorting

```javascript
modes: {
    list: {
        features: {
            sort: {
                field: 'startDate',
                ascending: true
            }
        },

        // Multi-sort
        store: {
            sorters: [
                { field: 'important', ascending: false },
                { field: 'startDate', ascending: true }
            ]
        }
    }
}
```

### UI Sorting

```javascript
// Enable column header sorting
modes: {
    list: {
        columns: [{
            field: 'name',
            sortable: true
        }, {
            field: 'startDate',
            sortable: true
        }]
    }
}
```

---

## 8. Filtering

### Filter Configuratie

```javascript
modes: {
    list: {
        features: {
            filter: true,
            filterBar: true  // Show filter row
        }
    }
}
```

### Programmatic Filtering

```javascript
// Filter op resource
calendar.eventStore.filter({
    property: 'resourceId',
    value: 'r1'
});

// Filter op datum range
calendar.eventStore.filter(event => {
    return event.startDate >= startDate &&
           event.endDate <= endDate;
});

// Combineer met ResourceFilter
calendar.widgetMap.resourceFilter.on('change', ({ value }) => {
    const resourceIds = value.map(r => r.id);
    calendar.eventStore.filter({
        id: 'resourceFilter',
        filterBy: event =>
            resourceIds.includes(event.resourceId)
    });
});
```

---

## 9. List Range Menu

### Default Range Menu

AgendaView toont een "settings" button met range opties:
- Day
- Week
- Month
- Year

### Custom Range Menu

```javascript
modes: {
    agenda: {
        settingsButton: {
            menu: {
                items: {
                    today: {
                        text: 'Today',
                        onItem: 'up.setRangeToday'
                    },
                    thisWeek: {
                        text: 'This Week',
                        onItem: 'up.setRangeWeek'
                    },
                    thisMonth: {
                        text: 'This Month',
                        onItem: 'up.setRangeMonth'
                    }
                }
            }
        }
    }
},

setRangeToday() {
    const today = DateHelper.clearTime(new Date());
    this.activeView.setConfig({
        startDate: today,
        endDate: DateHelper.add(today, 1, 'day')
    });
},

setRangeWeek() {
    const today = new Date();
    const weekStart = DateHelper.startOf(today, 'week');
    this.activeView.setConfig({
        startDate: weekStart,
        endDate: DateHelper.add(weekStart, 1, 'week')
    });
}
```

### Disable Range Menu

```javascript
modes: {
    agenda: {
        listRangeMenu: null,
        settingsButton: null
    }
}
```

---

## 10. Styling

### CSS Classes

```css
/* Agenda/List view container */
.b-eventlist,
.b-agendaview {
    /* Grid styling */
}

/* Group header (date) */
.b-group-row {
    background: var(--group-header-bg);
    font-weight: 600;
}

/* Today's date group */
.b-group-row[data-date="2024-01-15"] {
    background: var(--today-bg);
}

/* Event row */
.b-eventlist .b-grid-row {
    border-bottom: 1px solid var(--border-color);
}

/* Event name cell */
.b-eventlist .b-grid-cell[data-column="name"] {
    font-weight: 500;
}

/* Hover state */
.b-eventlist .b-grid-row:hover {
    background: var(--hover-bg);
}
```

### Custom Date Group Styling

```javascript
features: {
    group: {
        renderer({ rowElement, groupRowFor }) {
            const isToday = DateHelper.isEqual(
                groupRowFor,
                DateHelper.clearTime(new Date()),
                'day'
            );

            rowElement.classList.toggle('b-today', isToday);

            // Weekend styling
            const day = groupRowFor.getDay();
            rowElement.classList.toggle(
                'b-weekend',
                day === 0 || day === 6
            );

            return DateHelper.format(groupRowFor, 'dddd, MMMM D');
        }
    }
}
```

---

## 11. Events & Callbacks

### Selection

```javascript
calendar.on({
    // Event selected in list
    eventClick({ eventRecord }) {
        console.log('Clicked:', eventRecord.name);
    },

    // Selection changed
    selectionChange({ selection }) {
        console.log('Selected:', selection.map(e => e.name));
    }
});
```

### Row Expansion

```javascript
modes: {
    list: {
        features: {
            rowExpander: {
                widget: {
                    type: 'container',
                    items: {
                        description: {
                            type: 'widget',
                            html: ({ record }) =>
                                `<p>${record.notes || 'No notes'}</p>`
                        }
                    }
                }
            }
        }
    }
}
```

---

## 12. Complete Implementation Example

```javascript
import { Calendar, EventModel, DateHelper } from '@bryntum/calendar';

class AppEvent extends EventModel {
    static fields = [
        { name: 'notes', column: { width: '20em' } },
        { name: 'important', type: 'boolean' },
        { name: 'location' }
    ];

    get eventStartDate() {
        return this.getData('eventStartDate') ||
               DateHelper.startOf(this.startDate);
    }

    get displayDuration() {
        const mins = this.duration;
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        const remainMins = mins % 60;
        return remainMins ? `${hours}h ${remainMins}m` : `${hours}h`;
    }
}

const calendar = new Calendar({
    appendTo: 'container',
    date: new Date(),
    mode: 'list',

    crudManager: {
        eventStore: { modelClass: AppEvent },
        loadUrl: 'data/events.json',
        autoLoad: true
    },

    sidebar: {
        items: {
            datePicker: {
                multiSelect: 'range',
                showEvents: 'dots'
            }
        }
    },

    modes: {
        // Hide other views
        day: null,
        week: null,
        month: null,
        year: null,

        list: {
            weight: 1,
            showEmptyDates: false,

            columns: [{
                field: 'name',
                text: 'Event',
                flex: 1,
                renderer({ record }) {
                    return {
                        children: [
                            {
                                tag: 'i',
                                className: `b-icon b-icon-circle`,
                                style: `color:${record.resource?.eventColor}`
                            },
                            { text: record.name }
                        ]
                    };
                }
            }, {
                field: 'startDate',
                text: 'Time',
                width: 80,
                renderer({ value }) {
                    return DateHelper.format(value, 'HH:mm');
                }
            }, {
                field: 'duration',
                text: 'Duration',
                width: 80,
                renderer({ record }) {
                    return record.displayDuration;
                }
            }, {
                field: 'important',
                text: '',
                width: 40,
                renderer({ value }) {
                    return value ? '⭐' : '';
                }
            }],

            features: {
                group: {
                    field: 'eventStartDate',
                    renderer({ rowElement, isFirstColumn, groupRowFor }) {
                        if (isFirstColumn) {
                            const isToday = DateHelper.isEqual(
                                groupRowFor,
                                DateHelper.clearTime(new Date()),
                                'day'
                            );
                            rowElement.classList.toggle('b-today', isToday);
                            return DateHelper.format(
                                groupRowFor,
                                'dddd, MMMM D, YYYY'
                            );
                        }
                        return '';
                    }
                },
                sort: {
                    field: 'startDate',
                    ascending: true
                }
            }
        }
    }
});
```

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `listview/` | Basic list view setup |
| `list-range/` | Custom date range controls |
| `month-agenda/` | Month + Agenda combined |
| `day-agenda/` | Day + Agenda combined |
| `filtering-advanced/` | Advanced event filtering |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
