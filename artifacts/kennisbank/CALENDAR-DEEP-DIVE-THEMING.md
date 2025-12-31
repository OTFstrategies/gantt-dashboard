# CALENDAR-DEEP-DIVE-THEMING.md
## Bryntum Calendar - Theming & Styling Systeem (Deep Dive)

### Overzicht

Dit document beschrijft het complete theming systeem van Bryntum Calendar. Het systeem is gebaseerd op CSS Custom Properties (variabelen) en biedt meerdere ingebouwde thema's plus uitgebreide mogelijkheden voor customization.

---

## 1. Beschikbare Thema's

### 1.1 Ingebouwde Thema Bestanden
```
build/
├── stockholm-light.css      # Stockholm Light (standaard)
├── stockholm-dark.css       # Stockholm Dark
├── material3-light.css      # Material 3 Light
├── material3-dark.css       # Material 3 Dark
├── fluent2-light.css        # Fluent 2 Light
├── fluent2-dark.css         # Fluent 2 Dark
├── svalbard-light.css       # Svalbard Light
├── svalbard-dark.css        # Svalbard Dark
├── visby-light.css          # Visby Light
├── visby-dark.css           # Visby Dark
├── high-contrast-light.css  # High Contrast Light (a11y)
├── high-contrast-dark.css   # High Contrast Dark (a11y)
└── thin/                    # Thin bundles (zonder thema)
    └── calendar.thin.css
```

### 1.2 Thema Laden
```html
<!-- Één thema laden -->
<link rel="stylesheet" href="calendar.stockholm-light.css">

<!-- Of met JavaScript -->
<script>
import { DomHelper } from '@bryntum/calendar';

// Thema wisselen
DomHelper.setTheme('material3-dark');
</script>
```

---

## 2. CSS Custom Properties

### 2.1 Basis Variabelen (:root)
```css
:root:not(.b-nothing), :host(:not(.b-nothing)) {
    /* Primaire kleuren */
    --b-primary: var(--b-color-blue);
    --b-secondary: var(--b-color-orange);

    /* Kleurschema */
    --b-mix: #fff;
    --b-opposite: #000;
    --b-widget-color-scheme: light;

    /* Border radius */
    --b-widget-border-radius: .35em;
    --b-widget-border-radius-large: 1em;
    --b-widget-border-color: var(--b-neutral-60);

    /* Buttons */
    --b-button-font-weight: 400;
    --b-button-group-padded-background: var(--b-neutral-90);

    /* Checkbox */
    --b-checkbox-background: var(--b-primary-100);
    --b-checkbox-hover-background: var(--b-primary-100);
    --b-checkbox-checked-background: var(--b-neutral-100);

    /* Panel */
    --b-panel-background: var(--b-neutral-98);
    --b-popup-background: var(--b-panel-background);
    --b-popup-padding: var(--b-widget-padding);

    /* Grid */
    --b-grid-header-background: var(--b-neutral-97);
    --b-grid-header-font-weight: 400;
    --b-grid-cell-border-color: var(--b-neutral-85);
    --b-stripe-odd-color: var(--b-neutral-97);

    /* Text Field */
    --b-text-field-focus-border-width: 2px;
    --b-text-field-focus-border-color: var(--bi-primary-shade);

    /* Toolbar */
    --b-toolbar-background: var(--b-neutral-98);
}
```

### 2.2 Thema Info Variabelen
```css
.b-theme-info {
    --b-theme-name: "StockholmLight";
    --b-theme-filename: "stockholm-light";
    --b-theme-button-rendition: "outlined";
    --b-theme-label-position: "align-before";
    --b-theme-overlap-label: "false";
}
```

### 2.3 Kleurenpalet Variabelen
```css
:root {
    /* Neutrale kleuren (0-100 schaal) */
    --b-neutral-0: #000000;
    --b-neutral-10: #1a1a1a;
    --b-neutral-20: #333333;
    --b-neutral-30: #4d4d4d;
    --b-neutral-40: #666666;
    --b-neutral-50: #808080;
    --b-neutral-60: #999999;
    --b-neutral-70: #b3b3b3;
    --b-neutral-80: #cccccc;
    --b-neutral-85: #d9d9d9;
    --b-neutral-90: #e5e5e5;
    --b-neutral-95: #f2f2f2;
    --b-neutral-97: #f7f7f7;
    --b-neutral-98: #fafafa;
    --b-neutral-100: #ffffff;

    /* Primaire kleur varianten */
    --b-primary-20: /* donker */;
    --b-primary-30: /* medium-donker */;
    --b-primary-50: /* basis */;
    --b-primary-65: /* medium-licht */;
    --b-primary-85: /* licht */;
    --b-primary-90: /* lichter */;
    --b-primary-92: /* nog lichter */;
    --b-primary-94: /* bijna wit */;
    --b-primary-95: /* heel licht */;
    --b-primary-96: /* bijna wit */;
    --b-primary-97: /* bijna wit */;
    --b-primary-100: /* wit */;
}
```

---

## 3. Calendar-Specifieke Variabelen

### 3.1 Event Kleuren
```css
:root {
    /* Voorgedefinieerde event kleuren */
    --b-color-red: #e53935;
    --b-color-pink: #ec407a;
    --b-color-purple: #9c27b0;
    --b-color-violet: #673ab7;
    --b-color-indigo: #3f51b5;
    --b-color-blue: #2196f3;
    --b-color-cyan: #00bcd4;
    --b-color-teal: #009688;
    --b-color-green: #43a047;
    --b-color-lime: #7cb342;
    --b-color-yellow: #fdd835;
    --b-color-orange: #fb8c00;
    --b-color-deep-orange: #ff5722;
    --b-color-gray: #757575;
    --b-color-magenta: #e91e63;
}
```

### 3.2 Event Styling Variabelen
```css
.b-calendar {
    /* Event block styling */
    --b-cal-event-border-radius: 4px;
    --b-cal-event-padding: 0.3em 0.5em;
    --b-cal-event-font-size: 0.85em;

    /* All-day events */
    --b-cal-allday-event-height: 1.6em;
    --b-cal-allday-event-margin: 1px;

    /* Time axis */
    --b-cal-time-axis-width: 4em;
    --b-cal-hour-height: 42px;

    /* Day header */
    --b-cal-day-header-height: 2.5em;

    /* Resource avatar */
    --b-cal-resource-avatar-size: 1.5em;
}
```

---

## 4. Event Colors & Styles

### 4.1 EventColor Type
```typescript
type EventColor =
    | 'red' | 'pink' | 'purple' | 'violet' | 'indigo'
    | 'blue' | 'cyan' | 'teal' | 'green' | 'lime'
    | 'yellow' | 'orange' | 'deep-orange' | 'gray' | 'magenta';
```

### 4.2 EventStyle Type
```typescript
type EventStyle =
    | 'tonal'      // Zachte achtergrondkleur
    | 'filled'     // Volle achtergrondkleur
    | 'bordered'   // Border met transparante achtergrond
    | 'traced'     // Lijn aan linkerzijde
    | 'outlined'   // Dunne border rondom
    | 'indented'   // Ingesprongen effect
    | 'line'       // Lijn aan bovenzijde
    | 'dashed'     // Gestippelde border
    | 'minimal'    // Minimale styling
    | 'rounded'    // Extra ronde hoeken
    | 'calendar'   // Standaard calendar stijl
    | 'interday'   // Multi-day event stijl
    | 'gantt'      // Gantt-achtige stijl
    | null;
```

### 4.3 Configuratie
```typescript
const calendar = new Calendar({
    // Globale event kleur
    eventColor: 'blue',

    // Globale event stijl
    eventStyle: 'tonal',

    // Per resource
    crudManager: {
        resourceStore: {
            data: [
                {
                    id: 1,
                    name: 'Meeting Room A',
                    eventColor: 'green',
                    eventStyle: 'filled'
                }
            ]
        }
    }
});
```

---

## 5. Thema Wisseling

### 5.1 Programmatisch
```typescript
import { DomHelper } from '@bryntum/calendar';

// Beschikbare thema's ophalen
const themes = [
    'stockholm-light', 'stockholm-dark',
    'material3-light', 'material3-dark',
    'fluent2-light', 'fluent2-dark',
    'svalbard-light', 'svalbard-dark',
    'visby-light', 'visby-dark',
    'high-contrast-light', 'high-contrast-dark'
];

// Thema wisselen
DomHelper.setTheme('material3-dark');

// Huidige thema opvragen
const currentTheme = DomHelper.themeInfo.name;
```

### 5.2 Thema Switcher UI
```typescript
const calendar = new Calendar({
    tbar: {
        items: {
            themeSelector: {
                type: 'combo',
                label: 'Theme',
                value: 'stockholm-light',
                items: [
                    { value: 'stockholm-light', text: 'Stockholm Light' },
                    { value: 'stockholm-dark', text: 'Stockholm Dark' },
                    { value: 'material3-light', text: 'Material 3 Light' },
                    { value: 'material3-dark', text: 'Material 3 Dark' }
                ],
                onChange({ value }) {
                    DomHelper.setTheme(value);
                }
            }
        }
    }
});
```

### 5.3 Dark Mode Toggle
```typescript
const calendar = new Calendar({
    tbar: {
        items: {
            darkMode: {
                type: 'slidetoggle',
                label: 'Dark Mode',
                checked: false,
                onChange({ checked }) {
                    const base = DomHelper.themeInfo.filename.replace('-dark', '').replace('-light', '');
                    DomHelper.setTheme(`${base}-${checked ? 'dark' : 'light'}`);
                }
            }
        }
    }
});
```

---

## 6. Custom CSS

### 6.1 CSS Variables Overschrijven
```css
/* Custom primaire kleur */
:root {
    --b-primary: #8e44ad;
    --b-secondary: #2ecc71;
}

/* Calendar specifiek */
.b-calendar {
    --b-cal-event-border-radius: 8px;
    --b-cal-hour-height: 60px;
}

/* Event kleuren aanpassen */
.b-cal-event[data-event-color="purple"] {
    --b-sch-event-color: #8e44ad;
}
```

### 6.2 Component Styling
```css
/* Calendar container */
.b-calendar {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Header styling */
.b-calendar .b-panel-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

/* Event blocks */
.b-cal-event {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.b-cal-event:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Today highlighting */
.b-calendar .b-cal-cell-header.b-today {
    background-color: var(--b-primary);
    color: white;
    border-radius: 50%;
}
```

### 6.3 View-Specifieke Styling
```css
/* DayView specifiek */
.b-dayview .b-cal-event {
    border-left-width: 4px;
}

/* MonthView specifiek */
.b-monthview .b-cal-event {
    padding: 2px 6px;
    font-size: 0.8em;
}

/* AgendaView specifiek */
.b-agendaview .b-grid-row {
    border-bottom: 1px solid var(--b-neutral-90);
}

/* All-day events */
.b-calendarrow .b-cal-event {
    border-radius: 4px 4px 0 0;
}
```

---

## 7. Event Renderer Styling

### 7.1 Custom Event Colors
```typescript
const calendar = new Calendar({
    modeDefaults: {
        eventRenderer({ eventRecord, renderData }) {
            // Custom kleuren op basis van event type
            switch (eventRecord.type) {
                case 'meeting':
                    renderData.style.backgroundColor = '#3498db';
                    renderData.style.borderColor = '#2980b9';
                    break;
                case 'deadline':
                    renderData.style.backgroundColor = '#e74c3c';
                    renderData.style.borderColor = '#c0392b';
                    break;
                case 'task':
                    renderData.style.backgroundColor = '#2ecc71';
                    renderData.style.borderColor = '#27ae60';
                    break;
            }

            return eventRecord.name;
        }
    }
});
```

### 7.2 Gradient Background
```typescript
const calendar = new Calendar({
    modeDefaults: {
        eventRenderer({ eventRecord, renderData, view }) {
            // Multi-resource gradient
            if (eventRecord.resources?.length > 1) {
                const gradient = eventRecord.resources.map((r, i) => {
                    const color = view.createColorValue(r.eventColor);
                    return `${color} ${i * 25}px, ${color} ${(i + 1) * 25}px`;
                }).join(', ');

                renderData.eventBackground =
                    `repeating-linear-gradient(135deg, ${gradient})`;
            }

            return eventRecord.name;
        }
    }
});
```

### 7.3 Priority Styling
```typescript
const calendar = new Calendar({
    modeDefaults: {
        eventRenderer({ eventRecord, renderData }) {
            // Priority indicators
            if (eventRecord.priority === 'high') {
                renderData.cls['high-priority'] = true;
                renderData.iconCls = 'fa fa-exclamation-triangle';
            }

            // Status styling
            if (eventRecord.status === 'completed') {
                renderData.cls['completed'] = true;
                renderData.style.opacity = '0.6';
                renderData.style.textDecoration = 'line-through';
            }

            return eventRecord.name;
        }
    }
});
```

---

## 8. Thin Bundle & Custom Theming

### 8.1 Thin Bundle Structuur
```html
<!-- Thin bundle bevat geen thema -->
<link rel="stylesheet" href="calendar.thin.css">

<!-- Custom thema toevoegen -->
<link rel="stylesheet" href="my-custom-theme.css">
```

### 8.2 Custom Thema Bouwen
```scss
// my-custom-theme.scss
@import 'bryntum-calendar-thin';

:root {
    // Basis kleuren
    --b-primary: #8e44ad;
    --b-secondary: #27ae60;
    --b-mix: #ffffff;
    --b-opposite: #000000;

    // Neutralen
    --b-neutral-95: #f5f5f5;
    --b-neutral-98: #fafafa;
    --b-neutral-100: #ffffff;

    // Widget styling
    --b-widget-border-radius: 8px;
    --b-widget-border-color: #e0e0e0;

    // Panel
    --b-panel-background: #ffffff;
    --b-panel-header-background: var(--b-primary);
    --b-panel-header-color: white;

    // Grid/Calendar
    --b-grid-header-background: #f8f9fa;
    --b-grid-cell-border-color: #dee2e6;
}

// Custom component styles
.b-calendar {
    font-family: 'Inter', sans-serif;

    .b-panel-header {
        border-radius: 8px 8px 0 0;
    }

    .b-cal-event {
        border-radius: 6px;
        font-weight: 500;
    }
}
```

---

## 9. Responsive Styling

### 9.1 Media Queries
```css
/* Compact mode voor kleine schermen */
@media (max-width: 768px) {
    .b-calendar {
        --b-cal-hour-height: 30px;
        --b-cal-event-font-size: 0.75em;
        --b-cal-time-axis-width: 3em;
    }

    .b-calendar .b-panel-header {
        padding: 0.5em;
    }

    .b-calendar .b-toolbar {
        flex-wrap: wrap;
    }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
    .b-calendar {
        --b-cal-hour-height: 40px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .b-calendar {
        --b-cal-hour-height: 50px;
    }
}
```

### 9.2 Responsive Config
```typescript
const calendar = new Calendar({
    responsive: {
        small: {
            when: 500,
            modeDefaults: {
                compactHeader: true
            },
            sidebar: {
                collapsed: true
            }
        },
        medium: {
            when: 900,
            modeDefaults: {
                compactHeader: false
            }
        },
        large: {
            when: '*'
        }
    }
});
```

---

## 10. Implementatie Richtlijnen

### 10.1 Thema Manager
```typescript
interface ThemeConfig {
    name: string;
    primary: string;
    secondary: string;
    isDark: boolean;
    customVars?: Record<string, string>;
}

class ThemeManager {
    private themes: Map<string, ThemeConfig> = new Map();
    private currentTheme: string = 'default';

    registerTheme(config: ThemeConfig): void {
        this.themes.set(config.name, config);
    }

    applyTheme(name: string): void {
        const theme = this.themes.get(name);
        if (!theme) {
            console.warn(`Theme ${name} not found`);
            return;
        }

        const root = document.documentElement;

        // Basis variabelen
        root.style.setProperty('--b-primary', theme.primary);
        root.style.setProperty('--b-secondary', theme.secondary);

        // Color scheme
        root.style.setProperty(
            '--b-widget-color-scheme',
            theme.isDark ? 'dark' : 'light'
        );

        // Custom variabelen
        if (theme.customVars) {
            Object.entries(theme.customVars).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }

        // Class toggle voor dark mode
        document.body.classList.toggle('b-dark', theme.isDark);

        this.currentTheme = name;
        this.emit('themeChange', { theme });
    }

    getCurrentTheme(): ThemeConfig | undefined {
        return this.themes.get(this.currentTheme);
    }
}
```

### 10.2 Event Color Manager
```typescript
type EventColor =
    | 'red' | 'pink' | 'purple' | 'violet' | 'indigo'
    | 'blue' | 'cyan' | 'teal' | 'green' | 'lime'
    | 'yellow' | 'orange' | 'deep-orange' | 'gray' | 'magenta';

class EventColorManager {
    private colorMap: Record<EventColor, string> = {
        red: '#e53935',
        pink: '#ec407a',
        purple: '#9c27b0',
        violet: '#673ab7',
        indigo: '#3f51b5',
        blue: '#2196f3',
        cyan: '#00bcd4',
        teal: '#009688',
        green: '#43a047',
        lime: '#7cb342',
        yellow: '#fdd835',
        orange: '#fb8c00',
        'deep-orange': '#ff5722',
        gray: '#757575',
        magenta: '#e91e63'
    };

    getColor(name: EventColor): string {
        return this.colorMap[name] || this.colorMap.blue;
    }

    getContrastColor(name: EventColor): string {
        const darkColors: EventColor[] = ['purple', 'violet', 'indigo', 'blue', 'teal', 'green'];
        return darkColors.includes(name) ? '#ffffff' : '#333333';
    }

    lighten(color: string, amount: number = 0.2): string {
        // Color lightening logic
        return `color-mix(in srgb, ${color}, #fff ${amount * 100}%)`;
    }

    darken(color: string, amount: number = 0.2): string {
        return `color-mix(in srgb, ${color}, #000 ${amount * 100}%)`;
    }
}
```

---

## 11. Gerelateerde Bestanden

### Bryntum Theme Files
- `build/stockholm-light.css` - Stockholm Light thema
- `build/stockholm-dark.css` - Stockholm Dark thema
- `build/material3-light.css` - Material 3 Light thema
- `build/material3-dark.css` - Material 3 Dark thema
- `build/thin/calendar.thin.css` - Thin bundle (geen thema)

### CSS Variabelen
- `:root` - Globale variabelen
- `.b-bryntum` - Bryntum component variabelen
- `.b-calendar` - Calendar-specifieke variabelen
- `.b-theme-info` - Thema metadata

---

## 12. Samenvatting

Het Bryntum Calendar theming systeem biedt:

1. **12 Ingebouwde Thema's**: Light/Dark varianten van 6 thema families
2. **CSS Custom Properties**: Volledig aanpasbaar via variabelen
3. **Event Colors**: 15 voorgedefinieerde kleuren + custom opties
4. **Event Styles**: 13 stijlen voor event rendering
5. **Thin Bundle**: Themaloos voor custom implementaties
6. **Dark Mode**: Eenvoudige toggle tussen light/dark
7. **Responsive**: Media query ondersteuning

Implementatie-aandachtspunten:
- Gebruik CSS variabelen voor consistente theming
- Thin bundle + custom CSS voor volledige controle
- eventRenderer voor dynamische event styling
- DomHelper.setTheme() voor runtime thema wisseling
