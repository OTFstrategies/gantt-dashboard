# Calendar Deep Dive: Time Navigation

> **Fase 6** - Diepgaande analyse van Calendar tijd navigatie: date picker, view switching, date range management, LoadOnDemand en scroll behaviour.

---

## Overzicht

De Calendar biedt uitgebreide navigatiemogelijkheden om door de tijd te navigeren, views te wisselen en datumbereiken te beheren.

### Navigatie Componenten

| Component | Beschrijving |
|-----------|--------------|
| **Date Picker** | Mini calendar in sidebar |
| **Prev/Next Buttons** | Navigeer per periode |
| **Today Button** | Spring naar vandaag |
| **Mode Selector** | Wissel tussen views |
| **Range Controls** | Custom datum bereik |

---

## 1. Date Property

### Basis Navigatie

```typescript
interface Calendar {
    // Huidige datum
    date: Date;

    // Date limieten
    minDate: Date;
    maxDate: Date;

    // Navigatie methodes
    previous(): void;
    next(): void;
    today(): void;
}
```

### Programmatic Navigation

```javascript
const calendar = new Calendar({
    date: new Date(2024, 5, 15)  // 15 juni 2024
});

// Navigeer naar specifieke datum
calendar.date = new Date(2024, 6, 1);

// Navigeer met DateHelper
calendar.date = DateHelper.add(calendar.date, 1, 'week');

// Spring naar vandaag
calendar.today();

// Vorige/volgende periode
calendar.previous();  // Vorige week/maand/etc.
calendar.next();      // Volgende week/maand/etc.
```

---

## 2. Date Picker (Sidebar)

### Configuratie

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

    // Selection
    multiSelect: boolean | 'range';
    highlightSelectedWeek: boolean;

    // Resource filtering
    filterEventResources: boolean;

    // Week configuratie
    weekStartDay: number;  // 0-6
    showWeekNumber: boolean;
}
```

### Date Picker Setup

```javascript
const calendar = new Calendar({
    sidebar: {
        items: {
            datePicker: {
                // Toon events als dots
                showEvents: 'dots',
                eventDots: {
                    max: 4,
                    size: 6,
                    gap: 2
                },

                // Week highlighting
                highlightSelectedWeek: true,

                // Multi-select
                multiSelect: 'range'
            }
        }
    }
});
```

### Date Picker Events

```javascript
calendar.datePicker.on({
    // Datum selectie
    dateSelect({ date }) {
        console.log('Selected:', date);
    },

    // Bij multi-select range
    selectionChange({ selection }) {
        console.log('Range:', selection[0], 'to', selection[1]);
    },

    // Maand navigatie
    monthChange({ month, year }) {
        console.log('Viewing:', month, year);
    }
});
```

---

## 3. View Range

### Per-View Range

```javascript
modes: {
    day: {
        // 1 dag standaard
        range: '1 d'
    },
    week: {
        // 1 week standaard
        range: '1 w'
    },
    month: {
        // 1 maand standaard
    },
    // Custom multi-day view
    threeDays: {
        type: 'dayview',
        range: '3 d',
        title: '3 Days'
    }
}
```

### Dynamic Range

```javascript
// Bron: examples/sliding-day-range/app.module.js
modes: {
    week: {
        // Range wijzigen
        range: '5 d'  // Werk week
    }
}

// Programmatisch
calendar.activeView.range = '2 w';
```

### Range Events

```javascript
calendar.on({
    rangeChange({ new: newRange, old: oldRange }) {
        console.log('Range changed:', {
            start: newRange.startDate,
            end: newRange.endDate
        });
    }
});
```

---

## 4. LoadOnDemand Feature

### Configuratie

```typescript
// Bron: calendar.d.ts line 9920
interface LoadOnDemandConfig {
    type?: 'loadOnDemand';

    // Altijd laden bij range change
    alwaysLoadNewRange: boolean;  // default: false

    // Clear store bij nieuwe range
    clearOnNewRange: boolean;  // default: false

    // Request mutatie
    beforeRequest: (options: {
        dateRangeRequested: {
            startDate: Date;
            endDate: Date;
        };
        request: {
            params: object;
        };
    }) => void;
}
```

### LoadOnDemand Setup

```javascript
// Bron: examples/load-on-demand/app.module.js
const calendar = new Calendar({
    crudManager: {
        loadUrl: 'api/events',
        autoLoad: false,  // LoadOnDemand handles loading
        autoSync: true
    },

    features: {
        loadOnDemand: {
            clearOnNewRange: true,

            // Custom request params
            beforeRequest({ dateRangeRequested, request }) {
                request.params.startDate = DateHelper.format(
                    dateRangeRequested.startDate, 'YYYY-MM-DD'
                );
                request.params.endDate = DateHelper.format(
                    dateRangeRequested.endDate, 'YYYY-MM-DD'
                );
            }
        }
    },

    listeners: {
        dateRangeLoad({ response }) {
            Toast.show(`Loaded ${response.events.rows.length} events`);
        }
    }
});
```

### Server-side Paging

```javascript
// Server response format
{
    "success": true,
    "events": {
        "rows": [...events for requested range...],
        "append": true  // Add to existing, don't replace
    }
}
```

### Refresh LoadOnDemand

```javascript
// Force reload current range
calendar.features.loadOnDemand.refresh();
```

---

## 5. Toolbar Navigation

### Prev/Next/Today Buttons

```javascript
tbar: {
    items: {
        // Standaard buttons
        prevButton: {
            weight: 100,
            rendition: 'outlined'
        },
        nextButton: {
            weight: 110,
            rendition: 'outlined'
        },
        todayButton: {
            weight: 120,
            rendition: 'text'
        }
    }
}
```

### Custom Navigation Buttons

```javascript
tbar: {
    items: {
        // Go to specific date
        goToDate: {
            type: 'datefield',
            weight: 130,
            label: 'Go to',
            onChange({ value }) {
                calendar.date = value;
            }
        },

        // Quick jump buttons
        thisWeek: {
            type: 'button',
            text: 'This Week',
            weight: 140,
            onClick() {
                calendar.date = DateHelper.startOf(new Date(), 'week');
                calendar.mode = 'week';
            }
        },
        thisMonth: {
            type: 'button',
            text: 'This Month',
            weight: 150,
            onClick() {
                calendar.date = DateHelper.startOf(new Date(), 'month');
                calendar.mode = 'month';
            }
        }
    }
}
```

---

## 6. Mode Switching

### Mode Selector

```javascript
tbar: {
    items: {
        modeSelector: {
            weight: 700,
            // Responsive minified mode
            responsive: {
                '*': { minified: false },
                medium: { minified: true },
                small: { minified: true }
            }
        }
    }
}
```

### Programmatic Mode Switch

```javascript
// Direct mode switch
calendar.mode = 'week';

// Met datum
calendar.date = new Date(2024, 5, 1);
calendar.mode = 'month';

// Conditional switch
calendar.on('beforeActiveItemChange', ({ activeItem }) => {
    // Prevent week view on small screens
    if (calendar.responsiveState === 'small' &&
        activeItem === calendar.modes.week) {
        return false;
    }
});
```

### Mode Events

```javascript
calendar.on({
    beforeActiveItemChange({ activeItem, prevActiveItem }) {
        console.log('Switching from', prevActiveItem?.type, 'to', activeItem?.type);
        // Return false to prevent
    },

    activeItemChange({ activeItem }) {
        console.log('Now viewing:', activeItem.type);
    }
});
```

---

## 7. Scroll Navigation

### scrollTo Method

```javascript
// Scroll naar datum
calendar.activeView.scrollTo(new Date(2024, 5, 15));

// Scroll naar event
calendar.activeView.scrollTo(eventRecord);

// Met opties
calendar.activeView.scrollTo(date, {
    animate: true,
    block: 'center',  // 'start', 'center', 'end'
    highlight: true
});
```

### Scroll Events

```javascript
calendar.activeView.on({
    scroll({ scrollTop, scrollLeft }) {
        // Track scroll position
    }
});
```

### Sync Scroll Between Views

```javascript
// Bron: examples/drag-between-calendars/app.module.js
calendar1.activeView.on({
    scroll({ scrollTop }) {
        // Sync scroll to other calendar
        calendar2.activeView.scrollable.y = scrollTop;
    }
});
```

---

## 8. Week Number Navigation

### Week Number Click

```javascript
modes: {
    month: {
        showWeekColumn: true,

        // Custom week number click handler
        onWeekNumberClick({ weekNumber, year }) {
            // Navigate to week view
            calendar.date = DateHelper.getWeekStart(year, weekNumber);
            calendar.mode = 'week';
        }
    },
    year: {
        showWeekColumn: true
    }
}
```

### Week Start Day

```javascript
const calendar = new Calendar({
    // Week starts on Monday
    weekStartDay: 1,  // 0=Sunday, 1=Monday, etc.

    sidebar: {
        items: {
            datePicker: {
                weekStartDay: 1
            }
        }
    }
});
```

---

## 9. List Range Controls

### Custom Range Picker

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
            multiSelect: 'range',
            dragSelect: true,
            selection: [startDate, endDate],
            listeners: {
                selectionChange: 'up.onDatePickerRangeSelected'
            }
        }
    }
},

onRangeFieldChanged() {
    this.datePicker.selection = [
        this.widgetMap.startDate.value,
        this.widgetMap.endDate.value
    ];
},

onDatePickerRangeSelected({ selection: [startDate, endDate] }) {
    this.widgetMap.startDate.value = startDate;
    this.widgetMap.endDate.value = endDate;
}
```

---

## 10. Animation & Transitions

### View Transition Animation

```javascript
modes: {
    day: {
        animateTimeShift: true
    },
    week: {
        animateTimeShift: true
    },
    month: {
        animateTimeShift: true
    }
}
```

### Disable Animation

```javascript
// Disable voor performance
calendar.eachView(view => {
    view.animateTimeShift = false;
});
```

---

## 11. Date Constraints

### Min/Max Date

```javascript
const calendar = new Calendar({
    minDate: new Date(2024, 0, 1),
    maxDate: new Date(2024, 11, 31),

    // Disable navigation buiten range
    listeners: {
        beforeRangeChange({ new: newRange }) {
            if (newRange.startDate < this.minDate ||
                newRange.endDate > this.maxDate) {
                Toast.show('Cannot navigate outside allowed range');
                return false;
            }
        }
    }
});
```

### Dynamic Constraints

```javascript
// Update constraints dynamisch
calendar.minDate = new Date();  // Geen navigatie naar verleden
calendar.maxDate = DateHelper.add(new Date(), 1, 'year');
```

---

## 12. Current Time Indicator

### Configuratie

```javascript
// Bron: examples/current-time-options/app.module.js
modes: {
    day: {
        // Toon huidige tijd lijn
        showCurrentTimeLine: true,

        // Update interval (ms)
        currentTimeLineUpdateInterval: 60000  // 1 minuut
    },
    week: {
        showCurrentTimeLine: true
    }
}
```

### Styling

```css
/* Current time line */
.b-current-time-indicator {
    border-top: 2px solid red;
}

.b-current-time-indicator::before {
    content: '';
    position: absolute;
    left: 0;
    top: -6px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: red;
}
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| LoadOnDemand | 9920 |
| CalendarDatePicker | 24852 |
| Calendar (navigation) | 16771 |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `load-on-demand/` | Dynamic data loading |
| `list-range/` | Custom range controls |
| `sliding-day-range/` | Sliding window navigation |
| `current-time-options/` | Current time indicator |
| `responsive/` | Responsive navigation |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
