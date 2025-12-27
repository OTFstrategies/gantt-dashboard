# DEEP-DIVE: Theming & CSS System

> **Level 2** - CSS variabelen, thema's en styling patronen voor Bryntum Gantt.

---

## Inhoudsopgave

1. [Beschikbare Thema's](#1-beschikbare-themas)
2. [CSS Variabelen Systeem](#2-css-variabelen-systeem)
3. [Thema Switching](#3-thema-switching)
4. [Custom Thema Maken](#4-custom-thema-maken)
5. [Dark Mode Support](#5-dark-mode-support)
6. [Component-Specifieke Styling](#6-component-specifieke-styling)
7. [CSS Class Conventies](#7-css-class-conventies)
8. [Responsive Design](#8-responsive-design)
9. [Cross-References](#9-cross-references)

---

## 1. Beschikbare Thema's

### 1.1 Standaard Thema's

Bryntum Gantt 7.1.0 bevat de volgende thema's:

| Thema | Light | Dark | Kenmerken |
|-------|-------|------|-----------|
| **Stockholm** | `stockholm-light.css` | `stockholm-dark.css` | Default, modern, clean |
| **Material3** | `material3-light.css` | `material3-dark.css` | Google Material Design 3 |
| **Svalbard** | `svalbard-light.css` | `svalbard-dark.css` | Scandinavisch, minimaal |
| **Visby** | `visby-light.css` | `visby-dark.css` | Compact, professioneel |
| **Fluent2** | `fluent2-light.css` | `fluent2-dark.css` | Microsoft Fluent Design |
| **High Contrast** | `high-contrast-light.css` | `high-contrast-dark.css` | Accessibility |

### 1.2 Thin Variant

Voor projecten die alleen Grid/Gantt gebruiken (zonder Scheduler features):

```
build/thin/
├── gantt.stockholm.thin.css
├── gantt.material3.thin.css
└── ...
```

### 1.3 Thema Laden

```html
<!-- Standaard thema -->
<link rel="stylesheet" href="gantt.stockholm.css">

<!-- Of specifiek light/dark -->
<link rel="stylesheet" href="gantt.stockholm-light.css">
```

```javascript
// JavaScript import
import '@bryntum/gantt/gantt.stockholm.css';

// Of in React/Next.js
import '@bryntum/gantt/gantt.material3-dark.css';
```

---

## 2. CSS Variabelen Systeem

### 2.1 Basis Variabelen

```css
:root {
    /* Primaire kleuren */
    --b-primary: #4287f5;
    --b-secondary: #f59b42;

    /* Light/Dark basis */
    --b-mix: #fff;              /* Light theme */
    --b-opposite: #000;
    --b-widget-color-scheme: light;

    /* Neutrale tinten (0-100 schaal) */
    --b-neutral-0: #000;
    --b-neutral-50: #808080;
    --b-neutral-100: #fff;
}
```

### 2.2 Widget Variabelen

```css
:root {
    /* Algemene widget styling */
    --b-widget-border-radius: 0.5em;
    --b-widget-border-radius-large: 0.75em;
    --b-widget-padding: 0.75em;
    --b-widget-border-color: var(--b-neutral-70);

    /* Buttons */
    --b-button-outlined-border-color: var(--b-neutral-85);
    --b-button-outlined-hover-border-color: var(--b-primary-80);

    /* Text fields */
    --b-text-field-focus-border-width: 2px;
    --b-text-field-focus-border-color: var(--b-primary);

    /* Panels */
    --b-panel-background: var(--b-neutral-95);
    --b-popup-background: var(--b-panel-background);
}
```

### 2.3 Grid/Gantt Variabelen

```css
:root {
    /* Grid header */
    --b-grid-header-background: var(--b-neutral-100);
    --b-grid-header-border-color: var(--b-neutral-80);
    --b-grid-header-font-weight: 400;

    /* Grid cells */
    --b-grid-cell-font-weight: 300;
    --b-tree-parent-font-weight: 300;

    /* Gantt specific */
    --b-scroll-button-border-width: 1px;

    /* Task bars */
    --b-gantt-task-bar-background: var(--b-primary);
    --b-gantt-milestone-color: var(--b-primary);
}
```

### 2.4 Color Shades

Bryntum genereert automatisch kleurschakeringen:

```css
/* Primaire kleur schakeringen */
--b-primary-10   /* Donkerste */
--b-primary-20
--b-primary-30
--b-primary-40
--b-primary-50
--b-primary-60
--b-primary-70
--b-primary-80
--b-primary-90
--b-primary-95
--b-primary-100  /* Lichtste */

/* Neutrale schakeringen */
--b-neutral-0 tot --b-neutral-100
```

---

## 3. Thema Switching

### 3.1 Runtime Thema Switch

```javascript
import { DomHelper } from '@bryntum/gantt';

// Switch naar ander thema
DomHelper.setTheme('material3-dark');

// Of met volledige naam
DomHelper.setTheme('stockholm-light');
```

### 3.2 Thema Detectie

```javascript
import { DomHelper } from '@bryntum/gantt';

// Huidige thema info
const themeInfo = DomHelper.themeInfo;
console.log(themeInfo.name);      // 'Stockholm Light'
console.log(themeInfo.filename);   // 'stockholm-light'

// Is het een dark theme?
const isDark = DomHelper.isDarkTheme;
```

### 3.3 Thema Switch Event

```javascript
import { GlobalEvents } from '@bryntum/gantt';

GlobalEvents.on({
    theme(event) {
        console.log('Theme changed to:', event.theme);

        // Update custom styling
        updateCustomStyles(event.theme);
    }
});
```

### 3.4 Thema Picker UI

```javascript
// Uit theme demo: app.module.js
const gantt = new Gantt({
    tbar: {
        items: {
            themeName: {
                type: 'buttonGroup',
                toggleGroup: true,
                items: ['Material3', 'Stockholm', 'Svalbard'].map(name => ({
                    id: name.toLowerCase(),
                    text: name,
                    pressed: DomHelper.themeInfo.name.startsWith(name),
                    onAction() {
                        DomHelper.setTheme(`${name.toLowerCase()}-light`);
                    }
                }))
            }
        }
    }
});
```

---

## 4. Custom Thema Maken

### 4.1 Basis Custom Thema

Maak een `custom.css` bestand:

```css
/**
 * Custom theme extending svalbard-light
 */

:root:not(.b-nothing), :host(:not(.b-nothing)) {
    /* Primaire kleur aanpassen */
    --b-primary: #3a86ff;
    --b-secondary: #ff006e;

    /* Light/dark basis */
    --b-mix: #fff;
    --b-opposite: #000;
    --b-widget-color-scheme: light;

    /* Widget aanpassingen */
    --b-widget-border-radius: 8px;
    --b-widget-padding: 1em;

    /* Grid aanpassingen */
    --b-grid-header-background: #f8f9fa;
    --b-grid-header-font-weight: 600;
}

/* Thema metadata */
.b-theme-info {
    --b-theme-name: "Custom Blue";
    --b-theme-filename: "custom-blue";
    --b-theme-button-rendition: "outlined";
}
```

### 4.2 Extend Bestaand Thema

```html
<!-- Laad basis thema -->
<link rel="stylesheet" href="gantt.stockholm-light.css">

<!-- Override met custom -->
<link rel="stylesheet" href="custom-overrides.css">
```

```css
/* custom-overrides.css */
:root {
    --b-primary: #e63946;
    --b-grid-header-background: #f1faee;
}

/* Task bar styling */
.b-gantt-task-wrap .b-gantt-task {
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

### 4.3 Per-Widget Styling

Sommige variabelen moeten per widget scope gezet worden:

```css
/* Widget-scoped variabelen */
.b-bryntum:not(.b-nothing) {
    --bi-primary-shade: var(--b-primary-40);

    --b-button-outlined-color: var(--b-primary-25);
    --b-checkbox-checked-background: var(--bi-primary-shade);
    --b-slide-toggle-checked-background: var(--bi-primary-shade);
}
```

---

## 5. Dark Mode Support

### 5.1 Automatische Dark Mode Detectie

```javascript
// Check systeem preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Set thema op basis van preference
DomHelper.setTheme(prefersDark ? 'stockholm-dark' : 'stockholm-light');
```

### 5.2 Dark Mode Variabelen

```css
/* Dark theme basis */
:root {
    --b-mix: #000;              /* Inverse van light */
    --b-opposite: #fff;
    --b-widget-color-scheme: dark;

    /* Neutrale tinten zijn omgekeerd in dark mode */
    --b-neutral-0: #fff;
    --b-neutral-100: #000;

    /* Achtergronden */
    --b-panel-background: var(--b-neutral-10);
    --b-grid-header-background: var(--b-neutral-15);
}
```

### 5.3 Dark Mode Toggle

```javascript
function toggleDarkMode() {
    const current = DomHelper.themeInfo.filename;
    const isDark = current.includes('-dark');

    const newTheme = isDark
        ? current.replace('-dark', '-light')
        : current.replace('-light', '-dark');

    DomHelper.setTheme(newTheme);
}
```

---

## 6. Component-Specifieke Styling

### 6.1 Task Bar Styling

```css
/* Task bar basis */
.b-gantt-task-wrap .b-gantt-task {
    background-color: var(--b-gantt-task-bar-background);
    border-radius: 4px;
}

/* Per event color */
.b-gantt-task.b-gantt-task-red {
    background-color: var(--b-color-red);
}

.b-gantt-task.b-gantt-task-blue {
    background-color: var(--b-color-blue);
}

/* Milestone */
.b-gantt-task.b-milestone {
    background-color: var(--b-gantt-milestone-color);
}

/* Parent task */
.b-gantt-task.b-gantt-task-parent {
    background-color: var(--b-gantt-parent-bar-background);
}
```

### 6.2 Dependency Lijnen

```css
/* Dependency arrows */
.b-sch-dependency {
    stroke: var(--b-dependency-line-color, #888);
    stroke-width: var(--b-dependency-line-width, 1px);
}

.b-sch-dependency.b-critical {
    stroke: var(--b-critical-path-color, #e63946);
    stroke-width: 2px;
}

/* Dependency terminals */
.b-sch-terminal {
    fill: var(--b-dependency-terminal-color);
}
```

### 6.3 Timeline Styling

```css
/* Time axis header */
.b-sch-header-timeaxis-cell {
    background-color: var(--b-timeaxis-header-background);
    border-color: var(--b-timeaxis-header-border-color);
}

/* Weekend highlighting */
.b-sch-nonworkingtime {
    background-color: var(--b-nonworking-time-background, rgba(0,0,0,0.05));
}

/* Today marker */
.b-sch-current-time {
    background-color: var(--b-current-time-color, #e63946);
    width: 2px;
}
```

### 6.4 Row Styling

```css
/* Alternating rows */
.b-grid-row.b-odd {
    background-color: var(--b-grid-odd-row-background);
}

/* Selected row */
.b-grid-row.b-selected {
    background-color: var(--b-grid-selected-row-background);
}

/* Hover */
.b-grid-row:hover {
    background-color: var(--b-grid-row-hover-background);
}
```

---

## 7. CSS Class Conventies

### 7.1 Naming Conventions

```
b-{component}                    Component root
b-{component}-{element}          Component element
b-{component}-{element}-{state}  Element met state

Voorbeelden:
b-gantt                          Gantt root
b-gantt-task                     Task bar
b-gantt-task-selected            Selected task
b-gantt-task-wrap                Task wrapper
```

### 7.2 State Classes

| Class | Betekenis |
|-------|-----------|
| `.b-selected` | Item is geselecteerd |
| `.b-focused` | Item heeft focus |
| `.b-hover` | Mouse hover state |
| `.b-disabled` | Item is disabled |
| `.b-hidden` | Item is verborgen |
| `.b-collapsed` | Item is ingeklapt |
| `.b-expanded` | Item is uitgeklapt |
| `.b-dirty` | Record heeft ongesavede wijzigingen |
| `.b-invalid` | Validatie gefaald |

### 7.3 Modifier Classes

```css
/* Size modifiers */
.b-small { font-size: 0.875em; }
.b-medium { font-size: 1em; }
.b-large { font-size: 1.25em; }

/* Color modifiers */
.b-blue { --b-widget-color: var(--b-color-blue); }
.b-red { --b-widget-color: var(--b-color-red); }
.b-green { --b-widget-color: var(--b-color-green); }
.b-orange { --b-widget-color: var(--b-color-orange); }

/* Layout modifiers */
.b-content-element { }
.b-outer-element { }
```

---

## 8. Responsive Design

### 8.1 Responsive Feature

```javascript
const gantt = new Gantt({
    features: {
        responsive: {
            // Breakpoints
            levels: {
                small: 400,
                medium: 600,
                large: '*'
            }
        }
    },

    // Responsive config per level
    responsiveLevels: {
        small: {
            columns: [
                { type: 'name', width: 150 }
            ],
            rowHeight: 35
        },
        medium: {
            columns: [
                { type: 'name', width: 200 },
                { type: 'startdate' }
            ]
        },
        large: {
            columns: [
                { type: 'name', width: 250 },
                { type: 'startdate' },
                { type: 'duration' }
            ]
        }
    }
});
```

### 8.2 CSS Media Queries

```css
/* Responsive task bars */
@media (max-width: 768px) {
    .b-gantt-task {
        min-height: 24px;
    }

    .b-gantt-task .b-gantt-task-content {
        font-size: 11px;
    }
}

/* Hide columns on small screens */
@media (max-width: 480px) {
    .b-grid-header[data-column="duration"],
    .b-grid-cell[data-column="duration"] {
        display: none;
    }
}
```

---

## 9. Cross-References

### Gerelateerde Documenten

| Document | Relevante Secties |
|----------|-------------------|
| [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) | DomConfig, taskRenderer |
| [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) | Widget styling |
| [DEEP-DIVE-DEMO-PATTERNS](./DEEP-DIVE-DEMO-PATTERNS.md) | custom-theme demo |
| [INTERNALS-SOURCE-CODE](./INTERNALS-SOURCE-CODE.md) | DomSync |

### Demo Locaties

```
examples/theme/              - Thema switching demo
examples/custom-theme/       - Custom thema voorbeeld
    └── resources/custom.css - Custom thema bestand
```

### CSS Bestanden

```
build/
├── gantt.stockholm.css          # Default combined
├── stockholm-light.css          # Light variant
├── stockholm-dark.css           # Dark variant
├── material3-light.css
├── material3-dark.css
├── svalbard-light.css
├── svalbard-dark.css
├── visby-light.css
├── visby-dark.css
├── fluent2-light.css
├── fluent2-dark.css
├── high-contrast-light.css
└── high-contrast-dark.css
```

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
