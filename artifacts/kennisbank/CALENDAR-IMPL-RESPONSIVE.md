# Calendar Implementation: Responsive Design

> **Fase 6** - Implementatiegids voor Calendar responsive design: breakpoints, state management, adaptive layouts en mobile optimalisaties.

---

## Overzicht

De Bryntum Calendar ondersteunt responsive design via de `Responsive` mixin. Dit maakt automatische aanpassingen mogelijk op basis van schermgrootte, met configureerbare breakpoints en state-specifieke instellingen.

### Responsive Components

| Component | Beschrijving |
|-----------|--------------|
| **Responsive Mixin** | Core responsive functionaliteit |
| **Breakpoints** | Width-based state triggers |
| **responsiveState** | Huidige responsive state |
| **responsiveStateChange** | Event bij state wijziging |

---

## 1. Responsive Mixin

### TypeScript Interface

```typescript
// Bron: calendar.d.ts line 166501
export class ResponsiveClass {
    static readonly isResponsive: boolean;
    readonly isResponsive: boolean;

    // Events
    onBeforeResponsiveStateChange: ((event: {
        source: Widget,
        state: string,
        oldState: string
    }) => void) | string;

    onResponsiveStateChange: ((event: {
        source: Widget,
        state: string,
        oldState: string
    }) => void) | string;
}

interface ResponsiveConfig {
    // Responsive breakpoint configuratie
    responsive?: {
        // State naam → configuratie
        [stateName: string]: {
            when?: number;  // Max width in pixels
            // Elke widget config kan hier overschreven worden
            [configKey: string]: any;
        };
    };

    // Huidige responsive state (readonly)
    responsiveState?: string;
}
```

### Basis Responsive Setup

```javascript
// Bron: examples/responsive/app.module.js
const calendar = new Calendar({
    date: new Date(2023, 5, 12),
    appendTo: 'container',

    // Default responsive configuratie
    responsive: {
        small: {
            when: 500  // Width <= 500px
        },
        medium: {
            when: 900  // Width <= 900px
        },
        large: {
            // Width > 900px (geen 'when' = default)
        }
    },

    listeners: {
        responsiveStateChange: 'onResponsiveStateChange'
    },

    onResponsiveStateChange({ state }) {
        console.log('Responsive state:', state);
    }
});
```

---

## 2. Breakpoint Configuration

### Custom Breakpoints

```javascript
const calendar = new Calendar({
    responsive: {
        // Mobile
        mobile: {
            when: 480,
            modes: {
                day: true,
                week: null,    // Disable week view
                month: true,
                year: null,    // Disable year view
                agenda: true
            },
            sidebar: false  // Verberg sidebar
        },

        // Tablet
        tablet: {
            when: 768,
            modes: {
                day: true,
                week: true,
                month: true,
                year: null,
                agenda: true
            },
            sidebar: {
                collapsed: true
            }
        },

        // Desktop (default)
        desktop: {
            // Alle features enabled
        }
    }
});
```

### Breakpoint Berekening

```javascript
// Calendar bepaalt state op basis van element width
function determineResponsiveState() {
    const width = calendar.element.parentElement.offsetWidth;
    const { responsive } = calendar;

    // Sorteer states op 'when' waarde (ascending)
    const states = Object.entries(responsive)
        .filter(([_, config]) => config.when !== undefined)
        .sort((a, b) => a[1].when - b[1].when);

    // Vind eerste state waar width <= when
    for (const [stateName, config] of states) {
        if (width <= config.when) {
            return stateName;
        }
    }

    // Return default state (state zonder 'when')
    return Object.keys(responsive).find(s => responsive[s].when === undefined);
}
```

---

## 3. Mode Selector Responsive

### Toolbar Responsive Configuratie

```javascript
// Bron: examples/responsive/app.module.js
tbar: {
    items: {
        modeSelector: {
            responsive: {
                // Desktop: volledige tekst
                '*': {
                    minified: false
                },
                // Tablet: alleen icons
                medium: {
                    minified: true
                },
                // Mobile: alleen icons
                small: {
                    minified: true
                }
            }
        }
    }
}
```

### Custom Responsive Toolbar

```javascript
tbar: {
    items: {
        // Responsive size picker demo
        responsiveSizePicker: {
            weight: 650,
            minWidth: '13ch',
            width: '13ch',
            type: 'combo',
            editable: false,
            valueField: 'value',
            ariaLabel: 'Responsive size',

            store: {
                data: [
                    { id: 0, value: 'small', text: 'Small' },
                    { id: 1, value: 'medium', text: 'Medium' },
                    { id: 2, value: 'large', text: 'Normal' }
                ],

                // Filter beschikbare opties op huidige width
                filters: {
                    filterBy: rec => {
                        if (calendar) {
                            const { responsive } = calendar;
                            const uiWidth = calendar.element.parentElement.offsetWidth;
                            const state = uiWidth <= responsive.small.when ? 0
                                : uiWidth <= responsive.medium.when ? 1 : 2;
                            return rec.id <= state;
                        }
                        return true;
                    }
                }
            },

            listeners: {
                change: 'up.onResponsivePickerChange'
            }
        }
    }
},

onResponsivePickerChange({ userAction, value }) {
    if (userAction) {
        const newWidth = calendar.responsive[value].when;
        this.maxWidth = newWidth ? `${newWidth}px` : '100%';
    }
}
```

---

## 4. View-Specific Responsive

### Per-View Responsive Config

```javascript
modes: {
    day: {
        // Day view responsive
        responsive: {
            small: {
                hourHeight: 40,
                dayStartTime: 6,
                dayEndTime: 22
            },
            medium: {
                hourHeight: 50
            },
            '*': {
                hourHeight: 60
            }
        }
    },

    week: {
        // Week view responsive
        responsive: {
            small: {
                hourHeight: 35,
                hideNonWorkingDays: true  // Toon alleen werkdagen
            },
            medium: {
                hourHeight: 45
            },
            '*': {
                hourHeight: 55
            }
        }
    },

    month: {
        // Month view responsive
        responsive: {
            small: {
                showWeekColumn: false,
                sixWeeks: false
            },
            '*': {
                showWeekColumn: true,
                sixWeeks: true
            }
        }
    }
}
```

### Event Layout Responsive

```javascript
modes: {
    week: {
        // Event layout afhankelijk van schermgrootte
        responsive: {
            small: {
                eventLayout: {
                    type: 'stack',
                    maxEventsPerCell: 2
                }
            },
            '*': {
                eventLayout: {
                    type: 'fluid'
                }
            }
        }
    }
}
```

---

## 5. Sidebar Responsive

### Collapsible Sidebar

```javascript
sidebar: {
    // Responsive sidebar
    responsive: {
        small: {
            hidden: true  // Volledig verborgen op mobile
        },
        medium: {
            collapsed: true,
            collapsible: true
        },
        '*': {
            collapsed: false,
            collapsible: true
        }
    },

    items: {
        datePicker: {
            responsive: {
                small: {
                    hidden: true
                },
                '*': {
                    hidden: false
                }
            }
        },
        resourceFilter: {
            responsive: {
                small: {
                    maxHeight: 150
                },
                '*': {
                    maxHeight: 300
                }
            }
        }
    }
}
```

### Mobile Sidebar als Overlay

```javascript
const calendar = new Calendar({
    sidebar: {
        responsive: {
            small: {
                floating: true,
                modal: true,
                width: '80%',
                maxWidth: 300
            },
            '*': {
                floating: false,
                modal: false
            }
        }
    },

    tbar: {
        items: {
            // Toggle button voor mobile sidebar
            sidebarToggle: {
                type: 'button',
                icon: 'fa fa-bars',
                responsive: {
                    small: { hidden: false },
                    '*': { hidden: true }
                },
                onClick() {
                    calendar.sidebar.show();
                }
            }
        }
    }
});
```

---

## 6. Responsive Events

### State Change Handling

```javascript
// Bron: calendar.d.ts line 13205
interface ResponsiveStateChangeEvent {
    source: Widget;
    state: string;
    oldState: string;
}

const calendar = new Calendar({
    listeners: {
        // Sync UI met responsive state
        responsiveStateChange({ state, oldState }) {
            console.log(`Changed from ${oldState} to ${state}`);

            // Update UI elements
            this.widgetMap.responsiveSizePicker.value = state;

            // Analytics
            trackResponsiveChange(state);
        },

        // Prevent state change
        beforeResponsiveStateChange({ state }) {
            // Optioneel: voorkom bepaalde transities
            if (state === 'small' && !isMobileOptimized()) {
                return false;
            }
        }
    }
});
```

### Programmatic State Control

```javascript
// Forceer specifieke responsive state
calendar.responsiveState = 'small';

// Reset naar auto-detect
calendar.responsiveState = null;

// Check huidige state
if (calendar.responsiveState === 'mobile') {
    showMobileUI();
}
```

---

## 7. Touch Optimalisaties

### Touch-Friendly Configuratie

```javascript
const calendar = new Calendar({
    responsive: {
        touch: {
            when: 1024,  // Behandel als touch device

            // Grotere touch targets
            modes: {
                day: {
                    hourHeight: 80
                },
                week: {
                    hourHeight: 70
                }
            },

            // Touch-specific features
            features: {
                calendarDrag: {
                    touchStartDelay: 300,
                    dragThreshold: 15
                }
            }
        }
    }
});

// Detect touch device
if ('ontouchstart' in window) {
    calendar.element.classList.add('b-touch-device');
}
```

### Swipe Navigation

```javascript
// Custom swipe handling voor navigatie
let touchStartX = 0;

calendar.element.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
}, { passive: true });

calendar.element.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    if (Math.abs(diff) > 50) {  // Minimum swipe distance
        if (diff > 0) {
            calendar.previous();  // Swipe right = previous
        } else {
            calendar.next();      // Swipe left = next
        }
    }
}, { passive: true });
```

---

## 8. CSS Media Queries

### Responsive Styling

```css
/* Base styles */
.b-calendar {
    --event-font-size: 14px;
    --event-padding: 8px 12px;
    --hour-height: 60px;
}

/* Tablet */
@media (max-width: 900px) {
    .b-calendar {
        --event-font-size: 13px;
        --event-padding: 6px 10px;
        --hour-height: 50px;
    }

    /* Compactere sidebar */
    .b-calendar-sidebar {
        width: 200px !important;
    }

    /* Kleinere toolbar buttons */
    .b-toolbar .b-button {
        padding: 6px 12px;
    }
}

/* Mobile */
@media (max-width: 500px) {
    .b-calendar {
        --event-font-size: 12px;
        --event-padding: 4px 8px;
        --hour-height: 40px;
    }

    /* Stack toolbar items */
    .b-toolbar {
        flex-wrap: wrap;
    }

    /* Full width date picker */
    .b-toolbar .b-datefield {
        flex: 1 1 100%;
        margin-top: 8px;
    }

    /* Verberg labels */
    .b-toolbar .b-label {
        display: none;
    }

    /* Grotere touch targets */
    .b-cal-event-wrap {
        min-height: 32px;
    }
}
```

### Print Responsive

```css
@media print {
    /* Override responsive voor print */
    .b-calendar {
        --event-font-size: 10px;
        --hour-height: 40px;
    }

    .b-calendar-sidebar {
        display: none !important;
    }

    .b-toolbar {
        display: none !important;
    }
}
```

---

## 9. Dynamic Responsive Config

### Runtime Breakpoint Changes

```javascript
// Wijzig breakpoints dynamisch
calendar.responsive = {
    ...calendar.responsive,
    small: {
        when: 600  // Nieuwe breakpoint
    }
};

// Trigger re-evaluation
calendar.updateResponsive();
```

### Conditional Features

```javascript
const calendar = new Calendar({
    responsive: {
        small: {
            when: 500,
            features: {
                // Disable drag op mobile
                calendarDrag: {
                    disabled: true
                },
                // Simplify tooltips
                eventTooltip: {
                    showOn: 'click'  // Tap instead of hover
                }
            }
        },
        '*': {
            features: {
                calendarDrag: {
                    disabled: false
                },
                eventTooltip: {
                    showOn: 'hover'
                }
            }
        }
    }
});
```

---

## 10. Container Queries (Modern)

### Element-Based Responsive

```javascript
// Moderne browsers ondersteunen container queries
// Calendar respecteert parent container width

const calendar = new Calendar({
    appendTo: 'calendar-container',

    // Responsive gebaseerd op container, niet viewport
    responsive: {
        small: { when: 400 },
        medium: { when: 700 },
        large: {}
    }
});

// CSS container queries
/*
.calendar-container {
    container-type: inline-size;
}

@container (max-width: 500px) {
    .b-calendar-sidebar {
        display: none;
    }
}
*/
```

### Resize Observer Integration

```javascript
// Custom resize handling
const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const width = entry.contentRect.width;

        // Update calendar responsive state
        if (width <= 500) {
            calendar.responsiveState = 'small';
        } else if (width <= 900) {
            calendar.responsiveState = 'medium';
        } else {
            calendar.responsiveState = 'large';
        }
    }
});

resizeObserver.observe(calendar.element.parentElement);
```

---

## 11. Accessibility Responsive

### Keyboard Navigation Enhancement

```javascript
responsive: {
    small: {
        // Verbeterde keyboard focus op mobile
        tbar: {
            items: {
                prevButton: {
                    focusable: true,
                    tabIndex: 0
                },
                nextButton: {
                    focusable: true,
                    tabIndex: 0
                }
            }
        }
    }
}
```

### Screen Reader Optimalisaties

```javascript
modes: {
    week: {
        responsive: {
            small: {
                // Meer descriptieve aria labels op mobile
                ariaLabel: 'Weekly calendar view, showing current week events'
            }
        }
    }
}
```

---

## 12. Performance Responsive

### Lazy Loading op Mobile

```javascript
responsive: {
    small: {
        features: {
            loadOnDemand: {
                // Laad minder data op mobile
                rangeBuffer: 1  // Dagen buffer
            }
        },
        modes: {
            month: {
                // Minder events tonen
                maxEventsPerCell: 2
            }
        }
    },
    '*': {
        features: {
            loadOnDemand: {
                rangeBuffer: 7
            }
        }
    }
}
```

### Render Optimalisaties

```javascript
responsive: {
    small: {
        modes: {
            week: {
                // Simplere rendering op mobile
                eventRenderer({ eventRecord }) {
                    // Alleen naam, geen extra content
                    return eventRecord.name;
                }
            }
        }
    }
}
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| ResponsiveClass | 166501 |
| responsiveStateChange | 13205 |
| Responsive mixin | 166533 |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `responsive/` | Complete responsive implementatie |
| `sidebar-customization/` | Responsive sidebar |
| `fit-hours/` | Responsive hour height |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
