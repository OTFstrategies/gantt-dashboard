# CALENDAR-IMPL-ACCESSIBILITY.md
## Bryntum Calendar - Accessibility (A11y) Implementatie

### Overzicht

Dit document beschrijft de accessibility features van Bryntum Calendar. De Calendar is ontworpen met WCAG 2.1 AA compliance in gedachten en ondersteunt keyboard navigatie, screen readers en high-contrast modi.

---

## 1. ARIA Attributen

### 1.1 TypeScript Interface
```typescript
interface AccessibilityConfig {
    // Beschrijving voor screen readers
    ariaDescription?: string    // Wordt gekoppeld via aria-describedby

    // Label voor screen readers
    ariaLabel?: string          // Wordt aria-label attribuut

    // Role override
    role?: string               // ARIA role (button, grid, etc.)
}
```

### 1.2 Widget ARIA Configuratie
```typescript
const calendar = new Calendar({
    // Beschrijving voor hele calendar
    ariaDescription: 'Bedrijfskalender met afspraken en taken',
    ariaLabel: 'Hoofd kalender',

    modes: {
        week: {
            ariaLabel: 'Week weergave'
        },
        month: {
            ariaLabel: 'Maand weergave'
        }
    }
});
```

### 1.3 Event ARIA
```typescript
const calendar = new Calendar({
    modeDefaults: {
        eventRenderer({ eventRecord, renderData }) {
            // Toegankelijke event beschrijving
            renderData.ariaLabel =
                `${eventRecord.name}, ${DateHelper.format(eventRecord.startDate, 'LLL')} tot ${DateHelper.format(eventRecord.endDate, 'LLL')}`;

            return eventRecord.name;
        }
    }
});
```

---

## 2. Keyboard Navigatie

### 2.1 Standaard KeyMap
```typescript
// calendar.d.ts:15046
type KeyMapConfig = string | number | Function | Record<string, string | number | Function> | null;

interface CalendarKeyMap {
    // View navigatie
    'Ctrl+ArrowLeft': 'shiftPrevious'      // Vorige periode
    'Ctrl+ArrowRight': 'shiftNext'         // Volgende periode
    'Ctrl+Home': 'navigateToday'           // Naar vandaag

    // View switching
    'd': 'activateDayView'                 // Dag weergave
    'w': 'activateWeekView'                // Week weergave
    'm': 'activateMonthView'               // Maand weergave
    'y': 'activateYearView'                // Jaar weergave
    'a': 'activateAgendaView'              // Agenda weergave

    // Event navigatie
    'ArrowUp': 'navigatePrevEvent'         // Vorig event
    'ArrowDown': 'navigateNextEvent'       // Volgend event
    'Enter': 'activateEvent'               // Event openen/bewerken
    'Delete': 'deleteEvent'                // Event verwijderen

    // Algemeen
    'Escape': 'closePopup'                 // Popup sluiten
    'Tab': 'focusNext'                     // Volgende element
    'Shift+Tab': 'focusPrevious'           // Vorige element
}
```

### 2.2 Custom KeyMap Configuratie
```typescript
const calendar = new Calendar({
    keyMap: {
        // Standaard shortcuts overschrijven
        'Ctrl+ArrowLeft': 'shiftPrevious',
        'Ctrl+ArrowRight': 'shiftNext',

        // Custom shortcuts toevoegen
        'Ctrl+n': () => {
            calendar.createEvent({
                startDate: calendar.date,
                duration: 1,
                durationUnit: 'hour',
                name: 'Nieuw event'
            });
        },

        // Shortcut uitschakelen
        'Delete': null,

        // Functie-referentie
        'Ctrl+s': 'up.saveCalendar'
    },

    saveCalendar() {
        this.crudManager.sync();
    }
});
```

### 2.3 View-Specifieke KeyMap
```typescript
const calendar = new Calendar({
    modes: {
        week: {
            keyMap: {
                // Week-specifieke shortcuts
                'ArrowLeft': 'navigatePrevDay',
                'ArrowRight': 'navigateNextDay',
                'Home': 'navigateStartOfWeek',
                'End': 'navigateEndOfWeek'
            }
        },

        month: {
            keyMap: {
                // Maand-specifieke shortcuts
                'ArrowUp': 'navigatePrevWeek',
                'ArrowDown': 'navigateNextWeek',
                'PageUp': 'shiftPrevious',
                'PageDown': 'shiftNext'
            }
        }
    }
});
```

---

## 3. Focus Management

### 3.1 Focus Configuratie
```typescript
const calendar = new Calendar({
    // Initiële focus
    focusOnToday: true,

    // Focus trap in modals
    features: {
        eventEdit: {
            // Focus blijft in editor
            trapFocus: true
        }
    }
});
```

### 3.2 Programmatische Focus
```typescript
// Focus op specifieke datum
calendar.scrollTo(new Date(), { focus: true });

// Focus op specifiek event
const event = calendar.eventStore.first;
calendar.scrollTo(event, { focus: true });

// Focus op view
calendar.activeView.focus();
```

### 3.3 Focus Events
```typescript
const calendar = new Calendar({
    listeners: {
        focusIn({ source }) {
            console.log('Focus entered:', source.element);
        },

        focusOut({ source }) {
            console.log('Focus left:', source.element);
        },

        eventFocus({ eventRecord }) {
            console.log('Event focused:', eventRecord.name);
        }
    }
});
```

---

## 4. High Contrast Themes

### 4.1 Beschikbare High Contrast Thema's
```
build/
├── high-contrast-light.css   # High contrast licht
└── high-contrast-dark.css    # High contrast donker
```

### 4.2 High Contrast Activeren
```html
<!-- Statisch laden -->
<link rel="stylesheet" href="calendar.high-contrast-light.css">

<!-- of: Dynamisch wisselen -->
<script>
import { DomHelper } from '@bryntum/calendar';
DomHelper.setTheme('high-contrast-dark');
</script>
```

### 4.3 Detecteren OS High Contrast
```typescript
// Detecteer Windows High Contrast Mode
const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;

// Detecteer prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const calendar = new Calendar({
    // Pas thema aan op basis van OS settings
    onConstruct() {
        if (prefersHighContrast) {
            DomHelper.setTheme('high-contrast-light');
        }

        if (prefersReducedMotion) {
            // Animaties uitschakelen
            this.modeDefaults.animateTimeShift = false;
        }
    }
});
```

### 4.4 Custom High Contrast CSS
```css
/* Extra contrast voor events */
@media (prefers-contrast: more) {
    .b-cal-event {
        border-width: 2px;
        font-weight: bold;
    }

    .b-cal-event:focus {
        outline: 3px solid #000;
        outline-offset: 2px;
    }

    /* Duidelijkere hover states */
    .b-cal-event:hover {
        transform: scale(1.05);
        box-shadow: 0 0 0 3px #000;
    }
}

/* Verminder beweging */
@media (prefers-reduced-motion: reduce) {
    .b-calendar,
    .b-calendar * {
        animation: none !important;
        transition: none !important;
    }
}
```

---

## 5. Screen Reader Ondersteuning

### 5.1 Live Regions
```typescript
const calendar = new Calendar({
    // Live region voor updates
    liveRegion: {
        ariaLive: 'polite',
        ariaAtomic: true
    },

    listeners: {
        // Aankondiging bij view wisseling
        modeChange({ mode }) {
            this.announce(`Weergave gewisseld naar ${mode}`);
        },

        // Aankondiging bij navigatie
        dateChange({ date }) {
            this.announce(`Navigatie naar ${DateHelper.format(date, 'LLLL')}`);
        },

        // Aankondiging bij event wijziging
        eventChange({ eventRecord, changes }) {
            if (changes.startDate) {
                this.announce(`${eventRecord.name} verplaatst naar ${DateHelper.format(eventRecord.startDate, 'LLL')}`);
            }
        }
    },

    announce(message) {
        // Update ARIA live region
        const liveRegion = this.element.querySelector('[aria-live]');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }
});
```

### 5.2 Beschrijvende Labels
```typescript
const calendar = new Calendar({
    modeDefaults: {
        // Column headers met volledige datum
        columnHeaderRenderer({ date }) {
            return {
                tag: 'div',
                'aria-label': DateHelper.format(date, 'full'),
                children: [
                    { tag: 'span', className: 'day-name', text: DateHelper.format(date, 'ddd') },
                    { tag: 'span', className: 'day-num', text: date.getDate() }
                ]
            };
        },

        // Events met volledige beschrijving
        eventRenderer({ eventRecord, renderData }) {
            const start = DateHelper.format(eventRecord.startDate, 'LT');
            const end = DateHelper.format(eventRecord.endDate, 'LT');

            renderData.ariaLabel = `${eventRecord.name}, van ${start} tot ${end}`;

            if (eventRecord.resource) {
                renderData.ariaLabel += `, toegewezen aan ${eventRecord.resource.name}`;
            }

            return eventRecord.name;
        }
    }
});
```

---

## 6. Form Accessibility

### 6.1 EventEditor Accessibility
```typescript
const calendar = new Calendar({
    features: {
        eventEdit: {
            items: {
                nameField: {
                    label: 'Naam',
                    ariaLabel: 'Event naam',
                    required: true,
                    ariaRequired: true
                },

                startDateField: {
                    label: 'Start datum',
                    ariaLabel: 'Start datum en tijd',
                    ariaDescribedBy: 'start-date-help'
                },

                endDateField: {
                    label: 'Eind datum',
                    ariaLabel: 'Eind datum en tijd'
                },

                resourceField: {
                    label: 'Toegewezen aan',
                    ariaLabel: 'Selecteer resource'
                }
            }
        }
    }
});
```

### 6.2 Form Validatie Feedback
```typescript
const calendar = new Calendar({
    features: {
        eventEdit: {
            items: {
                nameField: {
                    required: true,
                    invalidMessage: 'Voer een naam in',
                    listeners: {
                        invalid({ source }) {
                            // Announce error to screen reader
                            source.ariaInvalid = true;
                            source.ariaErrorMessage = source.invalidMessage;
                        },
                        valid({ source }) {
                            source.ariaInvalid = false;
                            source.ariaErrorMessage = null;
                        }
                    }
                }
            }
        }
    }
});
```

---

## 7. Reduced Motion

### 7.1 Animaties Uitschakelen
```typescript
const calendar = new Calendar({
    // Globaal animaties uitschakelen
    modeDefaults: {
        animateTimeShift: false
    },

    // Of per view
    modes: {
        week: {
            animateTimeShift: false
        }
    }
});
```

### 7.2 CSS Reduced Motion
```css
/* Respecteer OS preference */
@media (prefers-reduced-motion: reduce) {
    .b-calendar {
        --b-animation-duration: 0s;
    }

    .b-cal-event {
        transition: none;
    }

    .b-calendar-view-animate {
        animation: none;
    }
}
```

---

## 8. Color Blindness

### 8.1 Niet alleen op kleur vertrouwen
```typescript
const calendar = new Calendar({
    modeDefaults: {
        eventRenderer({ eventRecord, renderData }) {
            // Voeg patronen/icons toe naast kleur
            if (eventRecord.type === 'meeting') {
                renderData.iconCls = 'fa fa-users';
            } else if (eventRecord.type === 'deadline') {
                renderData.iconCls = 'fa fa-exclamation-triangle';
            } else if (eventRecord.type === 'task') {
                renderData.iconCls = 'fa fa-check';
            }

            return eventRecord.name;
        }
    }
});
```

### 8.2 Colorblind-Safe Palette
```css
/* Deuteranopia/Protanopia-safe kleuren */
.b-calendar {
    --b-color-primary: #0072B2;    /* Blue */
    --b-color-warning: #E69F00;    /* Orange */
    --b-color-danger: #D55E00;     /* Vermillion */
    --b-color-success: #009E73;    /* Bluish green */
    --b-color-info: #56B4E9;       /* Sky blue */
    --b-color-secondary: #CC79A7;  /* Reddish purple */
}
```

---

## 9. Touch & Mobile Accessibility

### 9.1 Touch Target Grootte
```css
/* Minimum 44x44px touch targets */
.b-cal-event {
    min-height: 44px;
}

.b-toolbar .b-button {
    min-width: 44px;
    min-height: 44px;
}

/* Grotere hit areas voor drag handles */
.b-cal-event-resize-handle {
    width: 24px;
    height: 24px;
}
```

### 9.2 Gesture Alternativen
```typescript
const calendar = new Calendar({
    // Context menu via long press
    features: {
        eventMenu: {
            triggerEvent: 'contextmenu',  // Werkt met long press
            items: {
                editEvent: { text: 'Bewerken' },
                deleteEvent: { text: 'Verwijderen' }
            }
        }
    }
});
```

---

## 10. Implementatie Richtlijnen

### 10.1 WCAG 2.1 Checklist
```typescript
interface A11yChecklist {
    // Perceivable
    textAlternatives: boolean       // 1.1 Alt text voor images
    adaptable: boolean              // 1.3 Structuur behouden
    distinguishable: boolean        // 1.4 Contrast ratio >= 4.5:1

    // Operable
    keyboardAccessible: boolean     // 2.1 Volledig keyboard toegankelijk
    enoughTime: boolean             // 2.2 Genoeg tijd voor interactie
    seizureSafe: boolean            // 2.3 Geen flashing content
    navigable: boolean              // 2.4 Skip links, focus zichtbaar

    // Understandable
    readable: boolean               // 3.1 Taal aangegeven
    predictable: boolean            // 3.2 Consistente navigatie
    inputAssistance: boolean        // 3.3 Foutpreventie, labels

    // Robust
    compatible: boolean             // 4.1 Werkt met assistive tech
}
```

### 10.2 Test Script
```typescript
class AccessibilityTester {
    testKeyboardNavigation(calendar: Calendar): boolean {
        // Test Tab navigatie
        const focusableElements = calendar.element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        return focusableElements.length > 0;
    }

    testColorContrast(element: HTMLElement): number {
        const styles = getComputedStyle(element);
        const fg = this.parseColor(styles.color);
        const bg = this.parseColor(styles.backgroundColor);

        return this.calculateContrastRatio(fg, bg);
    }

    testAriaLabels(calendar: Calendar): string[] {
        const issues: string[] = [];

        // Check events voor aria-label
        const events = calendar.element.querySelectorAll('.b-cal-event');
        events.forEach((event, i) => {
            if (!event.getAttribute('aria-label')) {
                issues.push(`Event ${i} mist aria-label`);
            }
        });

        return issues;
    }
}
```

---

## 11. Gerelateerde Bestanden

### Bryntum Source Files
- `calendar.d.ts` regel 14613-14620: ariaDescription, ariaLabel
- `calendar.d.ts` regel 15046: keyMap configuration
- `calendar.d.ts` regel 2021-2023: KeyMapConfig type

### Theme Files
- `build/high-contrast-light.css`
- `build/high-contrast-dark.css`

---

## 12. Samenvatting

De Calendar accessibility features omvatten:

1. **ARIA Attributen**: ariaLabel, ariaDescription, aria-live regions
2. **Keyboard Navigatie**: Volledig configureerbare keyMap
3. **Focus Management**: trapFocus, programmatische focus, focus events
4. **High Contrast**: Ingebouwde thema's, OS detection
5. **Screen Readers**: Live regions, beschrijvende labels
6. **Reduced Motion**: animateTimeShift, CSS media queries
7. **Color Blindness**: Icons/patronen naast kleuren
8. **Mobile**: 44px touch targets, gesture alternatieven

WCAG 2.1 AA richtlijnen:
- Contrast ratio >= 4.5:1
- Volledig keyboard accessible
- Focus indicator zichtbaar
- Consistent navigatie patroon
