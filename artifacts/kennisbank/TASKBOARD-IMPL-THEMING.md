# TaskBoard Theming & Custom Themes - Implementation Guide

> **Reverse-engineered uit Bryntum TaskBoard 7.1.0**
> Volledige documentatie over thema's, CSS variabelen, custom themes en runtime theme switching.

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Beschikbare Thema's](#beschikbare-themas)
3. [Theme Loading](#theme-loading)
4. [DomHelper Theme API](#domhelper-theme-api)
5. [CSS Custom Properties](#css-custom-properties)
6. [TaskBoard-Specifieke Variabelen](#taskboard-specifieke-variabelen)
7. [Column & Card Colors](#column--card-colors)
8. [Custom Theme Maken](#custom-theme-maken)
9. [Runtime Theme Switching](#runtime-theme-switching)
10. [GlobalEvents Theme Event](#globalevents-theme-event)
11. [Dark/Light Mode Toggle](#darklight-mode-toggle)
12. [Web Components & Shadow DOM](#web-components--shadow-dom)
13. [Ripple Effects](#ripple-effects)
14. [Theme Metadata](#theme-metadata)
15. [Complete TypeScript Interfaces](#complete-typescript-interfaces)
16. [Best Practices](#best-practices)

---

## Overzicht

Bryntum TaskBoard biedt een volledig themeable architectuur met:

- **5 Theme Families**: Material3, Stockholm, Svalbard, Visby, High Contrast
- **Light/Dark Variants**: Elke familie heeft light en dark versies
- **CSS Custom Properties**: 100+ variabelen voor fine-grained control
- **Runtime Switching**: Dynamisch wisselen zonder page reload
- **Named Colors**: 20 semantische kleuren voor columns, cards, swimlanes

### Theme Architectuur

```
┌─────────────────────────────────────────────────────────────┐
│                     Global CSS Variables                     │
│   --b-primary, --b-secondary, --b-mix, --b-widget-*         │
├─────────────────────────────────────────────────────────────┤
│                   Core Widget Variables                      │
│   --b-button-*, --b-field-*, --b-panel-*, --b-popup-*       │
├─────────────────────────────────────────────────────────────┤
│                TaskBoard-Specific Variables                  │
│   --b-task-board-*, --b-swimlane-*, --b-card-*              │
├─────────────────────────────────────────────────────────────┤
│                  Named Color Classes                         │
│   .b-color-red, .b-color-blue, .b-color-green ...           │
└─────────────────────────────────────────────────────────────┘
```

---

## Beschikbare Thema's

### Theme Files (build folder)

```
build/
├── material3-light.css      # Google Material Design 3 - Light
├── material3-dark.css       # Google Material Design 3 - Dark
├── stockholm-light.css      # Stockholm theme - Light
├── stockholm-dark.css       # Stockholm theme - Dark
├── svalbard-light.css       # Svalbard theme - Light
├── svalbard-dark.css        # Svalbard theme - Dark
├── visby-light.css          # Visby theme - Light
├── visby-dark.css           # Visby theme - Dark
├── high-contrast-light.css  # WCAG High Contrast - Light
├── high-contrast-dark.css   # WCAG High Contrast - Dark
├── fluent2-light.css        # Microsoft Fluent 2 - Light
├── fluent2-dark.css         # Microsoft Fluent 2 - Dark
└── taskboard.css            # Base theme (used with custom themes)
```

### Theme Karakteristieken

| Theme | Font | Border Radius | Rendition | Best voor |
|-------|------|---------------|-----------|-----------|
| **Material3** | Roboto | Large (1.5em) | filled | Modern Material apps |
| **Stockholm** | System | Medium (0.4em) | outlined | Business applications |
| **Svalbard** | System | Medium (0.6em) | text | Clean minimalist look |
| **Visby** | Poppins | Small (0.3em) | outlined | Compact data-dense UIs |
| **High Contrast** | System | None | outlined | Accessibility (WCAG) |
| **Fluent2** | Segoe UI | Large (0.8em) | subtle | Microsoft ecosystem |

---

## Theme Loading

### HTML Link Tag (Statisch)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- FontAwesome icons (required) -->
    <link rel="stylesheet" href="build/fontawesome/css/fontawesome.css">
    <link rel="stylesheet" href="build/fontawesome/css/solid.css">

    <!-- Theme CSS -->
    <link rel="stylesheet" href="build/material3-light.css" data-bryntum-theme>
</head>
<body class="b-theme-material3-light">
    <div id="container"></div>
    <script type="module" src="app.js"></script>
</body>
</html>
```

### Dynamic Import (JavaScript)

```javascript
import { DomHelper } from '@bryntum/taskboard';

// Load theme at runtime
async function loadTheme(themeName) {
    await DomHelper.setTheme(themeName);
    console.log('Theme loaded:', DomHelper.themeInfo);
}

loadTheme('svalbard-dark');
```

### Custom Theme Loading

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Base taskboard CSS -->
    <link rel="stylesheet" href="build/taskboard.css">

    <!-- Custom theme overrides (must have data-bryntum-theme) -->
    <link rel="stylesheet" href="resources/custom.css" data-bryntum-theme>
</head>
<body class="b-theme-custom">
    <div id="container"></div>
</body>
</html>
```

---

## DomHelper Theme API

### ThemeInfo Type

```typescript
interface ThemeInfo {
    // Display name of current theme (e.g., "SvalbardDark")
    name: string;

    // Filename/identifier (e.g., "svalbard-dark")
    filename: string;

    // Button rendering style ("text", "outlined", "filled")
    buttonRendition?: string;

    // Label position for form fields
    labelPosition?: string;

    // Whether labels can overlap inputs
    overlapLabel?: string;
}
```

### Static Properties & Methods

```javascript
import { DomHelper } from '@bryntum/taskboard';

// === Properties ===

// Check if current theme is dark
const isDark = DomHelper.isDarkTheme;
// => true/false

// Get current theme info
const info = DomHelper.themeInfo;
// => { name: 'SvalbardLight', filename: 'svalbard-light', ... }

// Get primary color
const primary = DomHelper.primaryColor;
// => '#4285F4'

// Get scrollbar width (for layout calculations)
const scrollWidth = DomHelper.scrollBarWidth;
// => 17


// === Methods ===

// Change theme programmatically
await DomHelper.setTheme('material3-dark');

// Toggle between light/dark variants
DomHelper.toggleLightDarkTheme();

// Get theme info for specific element (Shadow DOM support)
const contextInfo = DomHelper.getThemeInfo(shadowRoot);
```

### setTheme Method

```javascript
// Returns a Promise that resolves when theme is loaded
static setTheme(newThemeName: string): Promise<any>

// Usage
DomHelper.setTheme('stockholm-dark')
    .then(() => {
        console.log('Theme applied:', DomHelper.themeInfo.name);
    })
    .catch(err => {
        console.error('Theme load failed:', err);
    });

// With async/await
async function switchTheme(name) {
    try {
        await DomHelper.setTheme(name);
        updateUIForTheme();
    } catch (error) {
        showThemeError(error);
    }
}
```

---

## CSS Custom Properties

### Global Variables (Root Level)

```css
:root:not(.b-nothing), :host(:not(.b-nothing)) {
    /* === Primary & Secondary Colors === */
    --b-primary                    : var(--b-color-blue);
    --b-secondary                  : var(--b-color-orange);

    /* === Light/Dark Mode Mixing === */
    --b-mix                        : #fff;      /* Light theme */
    --b-opposite                   : #000;
    --b-widget-color-scheme        : light;     /* or 'dark' */

    /* === Global Widget Styling === */
    --b-widget-border-radius       : 0.6em;
    --b-widget-border-radius-large : 1.2em;
    --b-widget-padding             : 1em;
    --b-widget-padding-large       : 1.5em;
    --b-widget-border-color        : var(--b-neutral-60);

    /* === Typography === */
    --b-font-family                : -apple-system, BlinkMacSystemFont, 'Segoe UI', ...;
    --b-font-size                  : 14px;
    --b-font-weight                : 400;

    /* === Neutral Palette === */
    --b-neutral-10                 : #1a1a1a;
    --b-neutral-20                 : #333333;
    --b-neutral-30                 : #4d4d4d;
    --b-neutral-40                 : #666666;
    --b-neutral-50                 : #808080;
    --b-neutral-60                 : #999999;
    --b-neutral-70                 : #b3b3b3;
    --b-neutral-80                 : #cccccc;
    --b-neutral-85                 : #d9d9d9;
    --b-neutral-90                 : #e6e6e6;
    --b-neutral-95                 : #f2f2f2;
    --b-neutral-98                 : #fafafa;
    --b-neutral-100                : #ffffff;
}
```

### Component-Specific Variables

```css
.b-bryntum:not(.b-nothing) {
    /* === Primary Shade (for hover states) === */
    --bi-primary-shade             : var(--b-primary-40);

    /* === Button === */
    --b-button-outlined-color              : var(--b-primary-25);
    --b-button-outlined-hover-border-color : var(--b-primary-80);
    --b-button-outlined-disabled-border-color : var(--b-neutral-80);

    /* === Checkbox === */
    --b-checkbox-checked-check-color       : var(--b-neutral-100);
    --b-checkbox-checked-background        : var(--bi-primary-shade);
    --b-checkbox-checked-border-color      : var(--b-checkbox-checked-background);
    --b-checkbox-hover-border-color        : var(--b-neutral-50);

    /* === Text Fields === */
    --b-text-field-focus-border-color      : var(--bi-primary-shade);
    --b-text-field-focus-border-width      : 2px;
    --b-text-field-outlined-border-color   : var(--b-border-6);
    --b-text-field-outlined-hover-border-color : var(--b-border-4);

    /* === Panels & Popups === */
    --b-panel-background           : var(--b-neutral-95);
    --b-popup-background           : var(--b-panel-background);
    --b-popup-padding              : var(--b-widget-padding);
    --b-menu-background            : var(--b-panel-background);

    /* === Slider === */
    --b-slider-color               : var(--bi-primary-shade);
    --b-slider-track-color         : var(--b-neutral-85);

    /* === Slide Toggle === */
    --b-slide-toggle-background         : var(--b-neutral-80);
    --b-slide-toggle-checked-background : var(--bi-primary-shade);
    --b-slide-toggle-thumb-background   : var(--b-neutral-100);
    --b-slide-toggle-height             : 1.5em;
    --b-slide-toggle-width              : 2.25em;

    /* === Tabs === */
    --b-tab-indicator-color        : var(--bi-primary-shade);

    /* === Splitter === */
    --b-splitter-color             : var(--b-neutral-80);
    --b-splitter-size              : 1px;
    --b-splitter-hover-size        : 5px;
    --b-splitter-hover-color       : var(--b-neutral-90);
}
```

---

## TaskBoard-Specifieke Variabelen

### TaskBoard CSS Variables

```css
:root:not(.b-nothing), :host(:not(.b-nothing)) {
    /* === Board Background === */
    --b-task-board-background                 : var(--b-neutral-100);

    /* === Column Headers === */
    --b-task-board-column-header-font-weight  : 600;
    --b-task-board-column-header-background   : transparent;
    --b-task-board-column-header-padding      : 0.75em 1em;

    /* === Column Separators === */
    --b-task-board-column-separator-border    : 1px solid var(--b-neutral-80);

    /* === Cards === */
    --b-task-board-card-border                : 1px solid var(--b-neutral-80);
    --b-task-board-card-background            : var(--b-neutral-100);
    --b-task-board-card-border-radius         : var(--b-widget-border-radius);
    --b-task-board-card-shadow                : 0 1px 3px rgba(0,0,0,0.08);
    --b-task-board-card-hover-shadow          : 0 4px 12px rgba(0,0,0,0.12);

    /* === Card Header === */
    --b-task-board-card-header-padding        : 0.75em;
    --b-task-board-card-header-font-weight    : 500;

    /* === Card Body === */
    --b-task-board-card-body-padding          : 0 0.75em;

    /* === Card Footer === */
    --b-task-board-card-footer-padding        : 0.5em 0.75em;
    --b-task-board-card-footer-border-top     : 1px solid var(--b-neutral-90);

    /* === Swimlanes === */
    --b-task-board-swimlane-background        : var(--b-neutral-98);
    --b-task-board-swimlane-header-padding    : 1em;
    --b-task-board-swimlane-border            : 1px solid var(--b-neutral-85);

    /* === Drag & Drop === */
    --b-task-board-drop-indicator-color       : var(--b-primary);
    --b-task-board-drag-proxy-opacity         : 0.8;

    /* === Selection === */
    --b-task-board-selected-card-outline      : 2px solid var(--b-primary);
    --b-task-board-selected-card-background   : var(--b-primary-95);
}
```

### Custom Theme Voorbeeld

```css
/* resources/custom.css */

:root:not(.b-nothing), :host(:not(.b-nothing)) {
    /* Primary brand color */
    --b-primary                               : #1a73e8;
    --b-secondary                             : #fbbc04;

    /* Light theme base */
    --b-mix                                   : #fff;
    --b-opposite                              : #000;
    --b-widget-color-scheme                   : light;

    /* Rounded corners */
    --b-widget-border-radius                  : 0.5em;
    --b-widget-border-radius-large            : 0.75em;

    /* Compact spacing */
    --b-widget-padding                        : 0.75em;

    /* === TaskBoard Customizations === */
    --b-task-board-background                 : #f5f7fa;
    --b-task-board-column-header-font-weight  : 700;
    --b-task-board-column-separator-border    : 2px dashed var(--b-neutral-80);
    --b-task-board-card-border                : none;
    --b-task-board-card-shadow                : 0 2px 8px rgba(0,0,0,0.1);
    --b-task-board-card-hover-shadow          : 0 8px 24px rgba(0,0,0,0.15);
    --b-task-board-card-border-radius         : 0.75em;
}

/* Primary shade per widget */
.b-bryntum:not(.b-nothing) {
    --bi-primary-shade                        : var(--b-primary-40);

    --b-checkbox-checked-background           : var(--bi-primary-shade);
    --b-slider-color                          : var(--bi-primary-shade);
    --b-tab-indicator-color                   : var(--bi-primary-shade);
}

/* Theme metadata (required for DomHelper) */
.b-theme-info {
    --b-theme-name             : "Custom";
    --b-theme-filename         : "custom";
    --b-theme-button-rendition : "outlined";
    --b-theme-label-position   : "align-before";
    --b-theme-overlap-label    : "false";
}
```

---

## Column & Card Colors

### Named Colors

Bryntum biedt 20 named colors die gebruikt kunnen worden voor columns, swimlanes en cards:

```typescript
type NamedColor =
    | 'red'          // #f44336
    | 'pink'         // #e91e63
    | 'magenta'      // #9c27b0
    | 'purple'       // #673ab7
    | 'violet'       // #7c4dff
    | 'deep-purple'  // #512da8
    | 'indigo'       // #3f51b5
    | 'blue'         // #2196f3
    | 'light-blue'   // #03a9f4
    | 'cyan'         // #00bcd4
    | 'teal'         // #009688
    | 'green'        // #4caf50
    | 'light-green'  // #8bc34a
    | 'lime'         // #cddc39
    | 'yellow'       // #ffeb3b
    | 'orange'       // #ff9800
    | 'amber'        // #ffc107
    | 'deep-orange'  // #ff5722
    | 'light-gray'   // #9e9e9e
    | 'gray';        // #607d8b
```

### Column Colors

```javascript
const taskBoard = new TaskBoard({
    columns: [
        {
            id: 'todo',
            text: 'Todo',
            color: 'yellow'  // Named color
        },
        {
            id: 'doing',
            text: 'In Progress',
            color: 'lime'
        },
        {
            id: 'review',
            text: 'Review',
            color: 'light-green'
        },
        {
            id: 'done',
            text: 'Done',
            color: 'green'
        }
    ]
});
```

### Hex/RGB Colors

```javascript
columns: [
    {
        id: 'todo',
        text: 'Todo',
        color: '#FF6B6B'  // Hex color
    },
    {
        id: 'doing',
        text: 'In Progress',
        color: 'rgb(100, 181, 246)'  // RGB
    },
    {
        id: 'done',
        text: 'Done',
        color: 'hsl(142, 71%, 45%)'  // HSL
    }
]
```

### Swimlane Colors

```javascript
const taskBoard = new TaskBoard({
    swimlaneField: 'priority',
    swimlanes: [
        {
            id: 'high',
            text: 'High Priority',
            color: 'red'
        },
        {
            id: 'medium',
            text: 'Medium Priority',
            color: 'orange'
        },
        {
            id: 'low',
            text: 'Low Priority',
            color: 'green'
        }
    ]
});
```

### Card Colors via taskRenderer

```javascript
const taskBoard = new TaskBoard({
    // Custom task renderer for card styling
    taskRenderer({ taskRecord, cardConfig }) {
        // Add priority-based color class
        if (taskRecord.priority) {
            cardConfig.class[`prio-${taskRecord.priority}`] = true;
        }

        // Or set inline style
        if (taskRecord.customColor) {
            cardConfig.style = {
                backgroundColor: taskRecord.customColor,
                borderLeftColor: taskRecord.customColor
            };
        }
    }
});
```

### CSS voor Priority Colors

```css
/* Custom priority styles */
.b-taskboard-card.prio-high {
    border-left: 4px solid var(--b-color-red);
}

.b-taskboard-card.prio-medium {
    border-left: 4px solid var(--b-color-orange);
}

.b-taskboard-card.prio-low {
    border-left: 4px solid var(--b-color-green);
}

/* Color band in header */
.b-taskboard-card.prio-critical .b-taskboard-card-header {
    background: linear-gradient(135deg,
        var(--b-color-red) 0%,
        var(--b-color-deep-orange) 100%
    );
    color: white;
}
```

---

## Custom Theme Maken

### Stap 1: HTML Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TaskBoard - Custom Theme</title>

    <!-- FontAwesome (required) -->
    <link rel="stylesheet" href="build/fontawesome/css/fontawesome.css">
    <link rel="stylesheet" href="build/fontawesome/css/solid.css">

    <!-- Base TaskBoard CSS (NOT a themed version) -->
    <link rel="stylesheet" href="build/taskboard.css">

    <!-- Your custom theme (must have data-bryntum-theme) -->
    <link rel="stylesheet" href="resources/my-theme.css" data-bryntum-theme>
</head>
<body class="b-theme-my-theme">
    <div id="container"></div>
    <script type="module" src="app.js"></script>
</body>
</html>
```

### Stap 2: Custom Theme CSS

```css
/* resources/my-theme.css */

/*
 * Custom Theme for Bryntum TaskBoard
 * Extends the base taskboard.css with custom styling
 */

:root:not(.b-nothing), :host(:not(.b-nothing)) {
    /* === Brand Colors === */
    --b-primary                    : #6366f1;  /* Indigo */
    --b-secondary                  : #ec4899;  /* Pink */

    /* === Light/Dark Base === */
    --b-mix                        : #fff;
    --b-opposite                   : #000;
    --b-widget-color-scheme        : light;

    /* === Border Radius === */
    --b-widget-border-radius       : 0.75em;
    --b-widget-border-radius-large : 1.25em;

    /* === Spacing === */
    --b-widget-padding             : 1em;
    --b-widget-padding-large       : 1.5em;

    /* === Borders === */
    --b-widget-border-color        : var(--b-neutral-70);

    /* === Panel & Popup === */
    --b-panel-background           : var(--b-neutral-98);
    --b-popup-background           : var(--b-neutral-100);
    --b-menu-background            : var(--b-neutral-100);

    /* === TextField === */
    --b-text-field-focus-border-width : 2px;
    --b-text-field-outlined-border-color : var(--b-neutral-75);

    /* === Slide Toggle === */
    --b-slide-toggle-border-color         : transparent;
    --b-slide-toggle-thumb-background     : var(--b-neutral-100);
    --b-slide-toggle-height               : 1.5em;
    --b-slide-toggle-width                : 2.5em;

    /* === Splitter === */
    --b-splitter-color             : var(--b-neutral-80);
    --b-splitter-hover-color       : var(--b-neutral-90);

    /* === TaskBoard Specific === */
    --b-task-board-background                 : #f8fafc;
    --b-task-board-column-header-font-weight  : 600;
    --b-task-board-column-separator-border    : 1px solid var(--b-neutral-85);
    --b-task-board-card-border                : 1px solid var(--b-neutral-85);
    --b-task-board-card-shadow                : 0 1px 3px rgba(0,0,0,0.06);
    --b-task-board-card-hover-shadow          : 0 4px 16px rgba(0,0,0,0.1);
}

/* Per-widget shade variables */
.b-bryntum:not(.b-nothing) {
    --bi-primary-shade                        : var(--b-primary-45);

    /* Button */
    --b-button-outlined-color                 : var(--b-primary-30);
    --b-button-outlined-hover-border-color    : var(--b-primary-75);

    /* Checkbox */
    --b-checkbox-checked-check-color          : var(--b-neutral-100);
    --b-checkbox-checked-background           : var(--bi-primary-shade);
    --b-checkbox-checked-border-color         : var(--bi-primary-shade);

    /* Radio */
    --b-radio-checked-color                   : var(--b-neutral-100);
    --b-radio-checked-background              : var(--bi-primary-shade);
    --b-radio-checked-border-color            : var(--bi-primary-shade);

    /* Slider */
    --b-slider-color                          : var(--bi-primary-shade);
    --b-slider-track-color                    : var(--b-neutral-80);

    /* Toggle */
    --b-slide-toggle-background               : var(--b-neutral-75);
    --b-slide-toggle-checked-background       : var(--bi-primary-shade);

    /* Tabs */
    --b-tab-indicator-color                   : var(--bi-primary-shade);

    /* TextField */
    --b-text-field-focus-border-color         : var(--bi-primary-shade);

    /* Toast */
    --b-toast-background                      : var(--b-neutral-100);
}

/* === Required Theme Metadata === */
.b-theme-info {
    --b-theme-name             : "MyTheme";
    --b-theme-filename         : "my-theme";
    --b-theme-button-rendition : "outlined";
    --b-theme-label-position   : "align-before";
    --b-theme-overlap-label    : "false";
}
```

### Stap 3: Extending Existing Theme

```css
/* Alternative: Extend svalbard-light instead of taskboard.css */

/* In HTML, load svalbard-light.css first */
/* <link rel="stylesheet" href="build/svalbard-light.css"> */
/* Then override with your custom CSS */

/* resources/theme-overrides.css */
:root:not(.b-nothing), :host(:not(.b-nothing)) {
    /* Only override what you need */
    --b-primary                   : #6366f1;
    --b-secondary                 : #ec4899;

    --b-task-board-card-border-radius : 1em;
    --b-task-board-card-shadow        : 0 2px 12px rgba(99, 102, 241, 0.15);
}

.b-bryntum:not(.b-nothing) {
    --bi-primary-shade            : #818cf8;
}

/* Don't need .b-theme-info if extending existing theme */
```

---

## Runtime Theme Switching

### Theme Switcher UI

```javascript
import { DomHelper, TaskBoard, GlobalEvents } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    appendTo: 'container',

    tbar: [
        {
            type: 'label',
            text: 'Theme'
        },
        {
            ref: 'themeName',
            type: 'buttonGroup',
            toggleGroup: true,
            rendition: 'padded',
            items: ['Material3', 'Stockholm', 'Svalbard', 'Visby', 'High Contrast'].map(name => {
                const value = name.toLowerCase().replaceAll(' ', '-');
                return {
                    id: value,
                    text: name,
                    value,
                    pressed: DomHelper.themeInfo.name.startsWith(name)
                };
            }),
            onAction() {
                changeTheme();
            }
        },
        {
            ref: 'themeVariant',
            type: 'buttonGroup',
            toggleGroup: true,
            rendition: 'padded',
            items: ['Light', 'Dark'].map(name => ({
                id: name.toLowerCase(),
                text: name,
                value: name.toLowerCase(),
                pressed: DomHelper.themeInfo.name.endsWith(name)
            })),
            onAction() {
                changeTheme();
            }
        }
    ],

    columns: [
        { id: 'todo', text: 'Todo', color: 'yellow' },
        { id: 'doing', text: 'Doing', color: 'lime' },
        { id: 'done', text: 'Done', color: 'green' }
    ],

    columnField: 'status',

    project: {
        loadUrl: 'data/data.json',
        autoLoad: true
    }
});

function changeTheme() {
    const themeName = taskBoard.widgetMap.themeName.value;
    const variant = taskBoard.widgetMap.themeVariant.value;
    DomHelper.setTheme(`${themeName}-${variant}`);
}
```

### Combo-based Theme Switcher

```javascript
tbar: [
    {
        type: 'combo',
        ref: 'themeCombo',
        label: 'Theme',
        editable: false,
        value: DomHelper.themeInfo.filename,
        items: [
            { value: 'material3-light', text: 'Material 3 Light' },
            { value: 'material3-dark', text: 'Material 3 Dark' },
            { value: 'stockholm-light', text: 'Stockholm Light' },
            { value: 'stockholm-dark', text: 'Stockholm Dark' },
            { value: 'svalbard-light', text: 'Svalbard Light' },
            { value: 'svalbard-dark', text: 'Svalbard Dark' },
            { value: 'visby-light', text: 'Visby Light' },
            { value: 'visby-dark', text: 'Visby Dark' },
            { value: 'high-contrast-light', text: 'High Contrast Light' },
            { value: 'high-contrast-dark', text: 'High Contrast Dark' }
        ],
        onChange({ value }) {
            DomHelper.setTheme(value);
        }
    }
]
```

---

## GlobalEvents Theme Event

### Listening for Theme Changes

```javascript
import { GlobalEvents, DomHelper } from '@bryntum/taskboard';

// Global theme change listener
GlobalEvents.on({
    theme(event) {
        console.log('Theme changed to:', event.theme);

        // Extract theme name and variant
        const themeName = event.theme.substring(0, event.theme.lastIndexOf('-'));
        const isDark = DomHelper.isDarkTheme;

        // Update UI to reflect new theme
        updateThemeUI(themeName, isDark);

        // Persist preference
        localStorage.setItem('preferredTheme', event.theme);
    }
});

function updateThemeUI(name, isDark) {
    // Update button states, icons, etc.
    document.body.classList.toggle('dark-mode', isDark);
}
```

### Synchronizing Multiple Widgets

```javascript
GlobalEvents.on({
    theme(themeChangeEvent) {
        const theme = themeChangeEvent.theme;

        // Update all theme-aware buttons
        const themeButtons = document.querySelectorAll('[data-theme-button]');
        themeButtons.forEach(btn => {
            btn.classList.toggle('pressed', btn.dataset.theme === theme);
        });

        // Notify other widgets
        notifyThemeChange(theme);
    }
});
```

---

## Dark/Light Mode Toggle

### Simple Toggle

```javascript
import { DomHelper } from '@bryntum/taskboard';

// Add toggle button to toolbar
tbar: [
    {
        type: 'button',
        icon: DomHelper.isDarkTheme ? 'b-fa-sun' : 'b-fa-moon',
        tooltip: 'Toggle dark/light mode',
        onClick({ source: button }) {
            DomHelper.toggleLightDarkTheme();

            // Update icon
            button.icon = DomHelper.isDarkTheme ? 'b-fa-sun' : 'b-fa-moon';
        }
    }
]
```

### System Preference Detection

```javascript
import { DomHelper } from '@bryntum/taskboard';

// Detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Set initial theme based on preference
const baseTheme = 'svalbard';
const variant = prefersDark ? 'dark' : 'light';
DomHelper.setTheme(`${baseTheme}-${variant}`);

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newVariant = event.matches ? 'dark' : 'light';
    const currentTheme = DomHelper.themeInfo.filename;
    const currentBase = currentTheme.substring(0, currentTheme.lastIndexOf('-'));

    DomHelper.setTheme(`${currentBase}-${newVariant}`);
});
```

### Persisted Theme Preference

```javascript
import { DomHelper, GlobalEvents } from '@bryntum/taskboard';

// Load saved preference or use system default
function getInitialTheme() {
    const saved = localStorage.getItem('preferredTheme');
    if (saved) return saved;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'svalbard-dark' : 'svalbard-light';
}

// Set initial theme
DomHelper.setTheme(getInitialTheme());

// Save preference on change
GlobalEvents.on({
    theme({ theme }) {
        localStorage.setItem('preferredTheme', theme);
    }
});
```

---

## Web Components & Shadow DOM

### Theme in Shadow Root

```javascript
import { DomHelper } from '@bryntum/taskboard';

// When using TaskBoard inside a web component
class MyTaskBoardElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // Import theme CSS into shadow root
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'build/svalbard-light.css';
        this.shadowRoot.appendChild(link);

        // Create TaskBoard container
        const container = document.createElement('div');
        container.id = 'taskboard-container';
        this.shadowRoot.appendChild(container);

        // Initialize TaskBoard
        this.taskBoard = new TaskBoard({
            appendTo: container
        });
    }

    // Get theme info for shadow context
    getThemeInfo() {
        return DomHelper.getThemeInfo(this.shadowRoot);
    }
}

customElements.define('my-taskboard', MyTaskBoardElement);
```

### TaskBoardTag Web Component

```javascript
// Bryntum provides built-in web component
import { TaskBoardTag } from '@bryntum/taskboard';

// Configure theme via attribute
const html = `
<bryntum-taskboard
    theme="svalbard-dark"
    stylesheet="build/svalbard-dark.css">
</bryntum-taskboard>
`;
```

### TaskBoardTag Config

```typescript
interface TaskBoardTagConfig {
    // Path to theme CSS
    theme?: string;

    // Path to stylesheet
    stylesheet?: string;
}
```

---

## Ripple Effects

### Ripple Configuration

Ripple effects zijn beschikbaar in Material theme en kunnen geconfigureerd worden per widget:

```javascript
const taskBoard = new TaskBoard({
    tbar: [
        {
            type: 'button',
            text: 'Add Task',
            // Enable ripple with custom config
            ripple: {
                delegate: '.b-button',  // Element to attach ripple to
                color: 'rgba(255,255,255,0.3)',  // Ripple color
                radius: 100,  // Max radius in px
                clip: 'button'  // Clip area
            }
        },
        {
            type: 'button',
            text: 'Delete',
            // Simple boolean enable
            ripple: true
        },
        {
            type: 'button',
            text: 'Cancel',
            // Disable ripple
            ripple: false
        }
    ]
});
```

### Ripple Config Interface

```typescript
interface RippleConfig {
    // CSS selector for ripple target
    delegate?: string;

    // Ripple color (default: theme primary with alpha)
    color?: string;

    // Maximum radius in pixels
    radius?: number;

    // Clip boundary ('button', 'element', etc.)
    clip?: string;
}
```

---

## Theme Metadata

### .b-theme-info Class

Elke theme CSS bevat metadata in de `.b-theme-info` class:

```css
.b-theme-info {
    /* Display name for UI */
    --b-theme-name             : "SvalbardLight";

    /* Filename/identifier for setTheme() */
    --b-theme-filename         : "svalbard-light";

    /* Default button rendition */
    --b-theme-button-rendition : "text";  /* "text" | "outlined" | "filled" */

    /* Default label position for form fields */
    --b-theme-label-position   : "align-before";  /* "before" | "above" | "align-before" */

    /* Whether labels can overlap inputs */
    --b-theme-overlap-label    : "false";  /* "true" | "false" */
}
```

### Reading Theme Metadata

```javascript
const info = DomHelper.themeInfo;

console.log('Theme:', info.name);
console.log('File:', info.filename);
console.log('Buttons:', info.buttonRendition);
console.log('Labels:', info.labelPosition);
```

---

## Complete TypeScript Interfaces

```typescript
// Theme info type
interface ThemeInfo {
    name: string;
    filename: string;
    buttonRendition?: 'text' | 'outlined' | 'filled';
    labelPosition?: 'before' | 'above' | 'align-before' | 'auto';
    overlapLabel?: 'true' | 'false';
}

// Named colors
type NamedColor =
    | 'red' | 'pink' | 'magenta' | 'purple' | 'violet'
    | 'deep-purple' | 'indigo' | 'blue' | 'light-blue' | 'cyan'
    | 'teal' | 'green' | 'light-green' | 'lime' | 'yellow'
    | 'orange' | 'amber' | 'deep-orange' | 'light-gray' | 'gray';

// Column model color
interface ColumnModelConfig {
    color?: NamedColor | string | null;
}

// Swimlane model color
interface SwimlaneModelConfig {
    color?: NamedColor | string | null;
}

// DomHelper theme methods
interface DomHelper {
    // Properties
    static readonly isDarkTheme: boolean;
    static readonly themeInfo: ThemeInfo;
    static readonly primaryColor: string;

    // Methods
    static setTheme(newThemeName: string): Promise<any>;
    static toggleLightDarkTheme(): void;
    static getThemeInfo(contextElement?: HTMLElement): ThemeInfo;
}

// GlobalEvents theme event
interface GlobalEventsListeners {
    theme?: (event: {
        source: typeof GlobalEvents;
        theme: string;
    }) => void;
}

// Ripple config
interface RippleConfig {
    delegate?: string;
    color?: string;
    radius?: number;
    clip?: string;
}

// Widget with ripple support
interface RippleableWidgetConfig {
    ripple?: boolean | RippleConfig;
}

// TaskBoardTag web component
interface TaskBoardTagConfig {
    theme?: string;
    stylesheet?: string;
}
```

---

## Best Practices

### 1. Theme Loading Order

```html
<!-- 1. FontAwesome (required for icons) -->
<link rel="stylesheet" href="build/fontawesome/css/fontawesome.css">
<link rel="stylesheet" href="build/fontawesome/css/solid.css">

<!-- 2. Theme CSS (with data-bryntum-theme attribute) -->
<link rel="stylesheet" href="build/svalbard-light.css" data-bryntum-theme>

<!-- 3. Your custom overrides (after theme) -->
<link rel="stylesheet" href="css/my-overrides.css">
```

### 2. Body Class Convention

```html
<!-- Match body class with theme name -->
<body class="b-theme-svalbard-light">
```

### 3. CSS Variable Scoping

```css
/* Always use the proper selector for variables */
:root:not(.b-nothing), :host(:not(.b-nothing)) {
    /* Global variables here */
}

.b-bryntum:not(.b-nothing) {
    /* Per-widget variables here */
}
```

### 4. Dark Mode Support

```javascript
// Detect and apply system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
await DomHelper.setTheme(`svalbard-${prefersDark ? 'dark' : 'light'}`);

// Listen for system changes
window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
        DomHelper.toggleLightDarkTheme();
    });
```

### 5. Theme Persistence

```javascript
// Save preference
GlobalEvents.on('theme', ({ theme }) => {
    localStorage.setItem('theme', theme);
});

// Restore on load
const savedTheme = localStorage.getItem('theme') || 'svalbard-light';
await DomHelper.setTheme(savedTheme);
```

### 6. Accessibility

```css
/* Ensure sufficient contrast in custom themes */
:root {
    /* WCAG AA requires 4.5:1 contrast ratio */
    --b-text-color: #1a1a1a;  /* On light backgrounds */
    --b-text-color-dark: #f0f0f0;  /* On dark backgrounds */
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    :root {
        --b-widget-border-color: #000;
        --b-text-color: #000;
    }
}
```

### 7. Performance

```javascript
// Pre-load alternate theme
const link = document.createElement('link');
link.rel = 'prefetch';
link.href = 'build/svalbard-dark.css';
document.head.appendChild(link);

// Theme switch is then faster
await DomHelper.setTheme('svalbard-dark');
```

---

## Zie Ook

- [TASKBOARD-DEEP-DIVE-CARDS.md](./TASKBOARD-DEEP-DIVE-CARDS.md) - Card rendering & styling
- [TASKBOARD-DEEP-DIVE-COLUMNS.md](./TASKBOARD-DEEP-DIVE-COLUMNS.md) - Column configuration
- [TASKBOARD-IMPL-RESPONSIVE.md](./TASKBOARD-IMPL-RESPONSIVE.md) - Responsive design
- [CSS-PATTERNS.md](./CSS-PATTERNS.md) - CSS patterns across Bryntum Suite

---

*Gegenereerd uit Bryntum TaskBoard 7.1.0 broncode analyse*
*Laatste update: December 2024*
