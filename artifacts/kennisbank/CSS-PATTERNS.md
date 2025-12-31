# BRYNTUM CSS PATTERNS - Theme Reference

> Extracted from svalbard-light, material3-light, stockholm-light themes

---

## 1. CSS CUSTOM PROPERTIES (VARIABLES)

### Naming Convention
All Bryntum variables follow `--b-*` pattern.

### Core Variables

```css
:root {
    --b-primary: var(--b-color-blue);
    --b-secondary: var(--b-color-orange);
    --b-mix: #fff;
    --b-opposite: #000;
    --b-widget-color-scheme: light;
}
```

### Color Shades (Primary)

```css
--b-primary-20    /* Darkest */
--b-primary-25
--b-primary-30
--b-primary-40
--b-primary-45
--b-primary-50    /* Medium */
--b-primary-65
--b-primary-85
--b-primary-90
--b-primary-92
--b-primary-94
--b-primary-95
--b-primary-96
--b-primary-97
--b-primary-98
--b-primary-99
--b-primary-100   /* Lightest */
```

### Neutral Shades

```css
--b-neutral-20
--b-neutral-25
--b-neutral-30
--b-neutral-50
--b-neutral-60
--b-neutral-80
--b-neutral-85
--b-neutral-90
--b-neutral-95
--b-neutral-97
--b-neutral-98
--b-neutral-100
```

### Border Variables

```css
--b-border-1
--b-border-2
--b-border-3
--b-border-4
--b-border-5
--b-border-6
--b-border-7
--b-widget-border-color
--b-widget-border-radius
--b-widget-border-radius-large
```

---

## 2. CLASS NAME PATTERNS

### Naming Convention
All classes follow `.b-*` pattern.

### Layout & Structure

```css
.b-bryntum              /* Root component */
.b-container
.b-content-element
.b-float-root
.b-panel-*
.b-popup
.b-dialog
.b-toolbar
.b-bottom-toolbar
```

### Component States

```css
.b-active
.b-disabled
.b-readonly
.b-focused
.b-contains-focus
.b-dragging
.b-hidden
.b-collapsed
.b-expanding
```

### Interactive Elements

```css
/* Buttons */
.b-button
.b-button-text
.b-button-outlined
.b-button-filled
.b-button-tonal
.b-button-elevated

/* Button Groups */
.b-button-group
.b-button-group-padded
.b-button-group-text
.b-button-group-outlined
.b-button-group-filled
.b-button-group-tonal

/* Form Elements */
.b-checkbox
.b-checkbox-group
.b-radio
.b-slide-toggle
.b-field
.b-text-field
.b-combo
.b-editor
```

### Color Classes

```css
.b-color-amber
.b-color-black
.b-color-blue
.b-color-brown
.b-color-cyan
.b-color-deep-orange
.b-color-deep-purple
.b-color-gray
.b-color-green
.b-color-indigo
.b-color-light-blue
.b-color-light-gray
.b-color-light-green
.b-color-lime
.b-color-magenta
.b-color-orange
.b-color-pink
.b-color-purple
.b-color-red
.b-color-teal
.b-color-violet
.b-color-yellow
```

---

## 3. COMPONENT-SPECIFIC CLASSES

### Gantt Component

```css
.b-gantt                     /* Main container */
.b-gantt-base                /* Base styling */
.b-gantt-task                /* Task element */
.b-gantt-task-wrap           /* Task wrapper */
.b-gantt-task-content        /* Content area */
.b-gantt-task-parent         /* Parent task */
.b-gantt-task-title          /* Title element */
.b-gantt-task-withicon       /* With icons */
.b-gantt-task-hover          /* Hover state */
.b-gantt-task-tooltip        /* Tooltip */
.b-gantt-task-drag-tooltip   /* Drag tooltip */
.b-gantt-critical-paths      /* Critical path */
.b-gantt-progress-line       /* Progress line */
.b-gantt-rollups-tooltip     /* Rollup info */
```

### Grid Component

```css
.b-grid                      /* Main container */
.b-grid-base                 /* Base styling */
.b-grid-header               /* Header */
.b-grid-header-*             /* Header variants */
.b-grid-cell                 /* Cell */
.b-grid-cell-align-*         /* Alignment */
.b-grid-row                  /* Row */
.b-grid-row-updating         /* Updating state */
.b-grid-body-*               /* Body structure */
.b-grid-footer               /* Footer */
.b-grid-footer-*             /* Footer variants */
.b-grid-splitter             /* Splitter */
.b-grid-splitter-*           /* Splitter variants */
.b-grid-group-*              /* Group headers */
.b-grid-sub-grid             /* Sub-grid */
.b-grid-sub-grid-*           /* Sub-grid variants */
.b-grid-summary-*            /* Summary rows */
.b-stripe-odd-color          /* Striping */
```

### Task-Specific

```css
.b-task-baseline             /* Baseline */
.b-task-baseline-milestone   /* Milestone baseline */
.b-task-percent-bar          /* Progress bar */
.b-task-percent-bar-*        /* Bar variants */
.b-task-percent-bar-handle   /* Drag handle */
.b-task-resize               /* Resize indicator */
.b-task-rollup               /* Rollup */
.b-task-rollup-wrap          /* Rollup wrapper */
.b-task-non-working-time     /* Non-working time */
```

### Dependencies

```css
.b-dependency-list-filter    /* Filter */
.b-dependency-only-parent    /* Parent-only */
```

---

## 4. SIZING & SPACING VARIABLES

### Widget Sizing

```css
--b-widget-padding
--b-widget-padding-large
--b-widget-border-radius           /* 0.35em - 0.6em */
--b-widget-border-radius-large     /* 1em - 1.5em */
```

### Button Sizing

```css
--b-button-height
--b-button-padding
--b-button-icon-padding
--b-button-end-icon-padding
--b-button-gap
--b-button-border-radius           /* 3em on Material3 */
```

### Text Field Sizing

```css
--b-text-field-outlined-input-padding
--b-text-field-filled-input-padding
--b-text-field-focus-border-width  /* 2px */
```

### Panel Sizing

```css
--b-panel-padding
--b-panel-with-header-padding
```

### Toggle Sizing

```css
--b-slide-toggle-width
--b-slide-toggle-height
--b-slide-toggle-thumb-size
--b-slide-toggle-checked-thumb-size
```

### Splitter Sizing

```css
--b-splitter-size        /* 1px */
--b-splitter-hover-size  /* 5px */
```

---

## 5. ANIMATION KEYFRAMES

### Slide Animations

```css
@keyframes b-anim-slide-in-from-left
@keyframes b-anim-slide-in-from-right
@keyframes b-anim-slide-in-from-above
@keyframes b-anim-slide-in-from-below
```

### Card Animations

```css
@keyframes b-anim-card-slide-in-left
@keyframes b-anim-card-slide-out-left
@keyframes b-anim-card-slide-in-right
@keyframes b-anim-card-slide-out-right
```

### Expand/Collapse

```css
@keyframes b-anim-expand-downwards
@keyframes b-anim-expand-upwards
@keyframes b-anim-collapse-upwards
@keyframes b-anim-collapse-downwards
```

### Fade Animations

```css
@keyframes b-anim-fade-in
@keyframes b-anim-fade-out
```

### Utility Animations

```css
@keyframes b-anim-rotate              /* 360deg rotation */
@keyframes b-anim-toggle-add
@keyframes b-anim-toggle-task-add
@keyframes b-anim-jumping-dots        /* Loading dots */
@keyframes b-anim-line-loop
@keyframes b-anim-hint-highlighter-ping
@keyframes b-anim-fx-highlight        /* Flash effect */
@keyframes b-shrink-width
@keyframes b-toast-progress
```

### Dependency Animations

```css
@keyframes b-anim-show-dependency-remove-icon
@keyframes b-anim-hide-dependency-remove-icon
```

### Animation Classes

```css
.b-animate                    /* Enable animations */
.b-slide-in-next
.b-slide-in-previous
.b-slide-vertical
.b-transition-expand-collapse
.b-theme-transition
```

---

## 6. THEME COMPARISON

| Aspect | Svalbard | Material3 | Stockholm |
|--------|----------|-----------|-----------|
| **Button Style** | Text (flat) | Tonal (filled) | Outlined |
| **Label Position** | Before | Above | Before |
| **Border Radius** | 0.6em | 0.35em | 0.35em |
| **Large Radius** | 1.2em | 1.5em | 1em |
| **Ripple Effect** | No | Yes | No |
| **Color Shades** | Limited | Extensive | Moderate |

### Theme Variables

```css
/* Svalbard */
--b-theme-button-rendition: "text";
--b-theme-label-position: "align-before";
--b-theme-overlap-label: false;

/* Material3 */
--b-theme-button-rendition: "tonal";
--b-theme-label-position: "above";
--b-theme-overlap-label: true;
--b-theme-ripple: "true";
--b-ripple-background: ...;
--b-ripple-blend-mode: ...;
--b-elevation-1: ...;

/* Stockholm */
--b-theme-button-rendition: "outlined";
--b-theme-label-position: "align-before";
--b-theme-overlap-label: false;
--b-grid-cell-hover-background: ...;
--b-grid-cell-selected-background: ...;
--b-panel-header-background: ...;
--b-panel-header-color: ...;
```

---

## 7. CUSTOMIZATION PATTERNS

### Overriding Primary Color

```css
:root {
    --b-primary: #your-brand-color;
    /* Or reference a predefined color */
    --b-primary: var(--b-color-purple);
}
```

### Custom Color Shades

```css
:root {
    --b-primary-50: color-mix(in srgb, var(--b-primary) 50%, var(--b-mix));
    --b-primary-90: color-mix(in srgb, var(--b-primary) 10%, var(--b-mix));
}
```

### Task Bar Styling

```css
.b-gantt-task {
    --b-gantt-task-background: var(--b-primary);
    --b-gantt-task-color: white;
    border-radius: var(--b-widget-border-radius);
}
```

### Grid Cell Styling

```css
.b-grid-cell {
    --b-grid-cell-padding: 0.5em 1em;
    --b-grid-cell-background: var(--b-neutral-98);
}

.b-grid-cell:hover {
    --b-grid-cell-background: var(--b-primary-95);
}
```

### Custom Button Rendition

```css
/* Force outlined buttons */
.b-button {
    --b-button-background: transparent;
    --b-button-border: 1px solid var(--b-primary);
    --b-button-color: var(--b-primary);
}
```

---

## 8. RESPONSIVE PATTERNS

### Breakpoint Detection

```css
/* Bryntum uses JS for responsive, but CSS can complement */
.b-responsive-small .b-toolbar {
    flex-wrap: wrap;
}

.b-responsive-medium .b-gantt-task-title {
    display: none;
}
```

### Mobile Adaptations

```css
@media (max-width: 768px) {
    .b-grid-header {
        display: none;
    }

    .b-gantt-task {
        height: 30px;
    }
}
```

---

## 9. DARK THEME VARIABLES

For dark themes, these variables are inverted:

```css
:root {
    --b-widget-color-scheme: dark;
    --b-mix: #000;       /* Was #fff */
    --b-opposite: #fff;  /* Was #000 */

    /* Neutral shades invert */
    --b-neutral-20: /* lighter in dark mode */
    --b-neutral-100: /* darker in dark mode */
}
```

---

## 10. BEST PRACTICES

### Use CSS Variables for Theming

```css
/* Good: Uses variables */
.my-custom-task {
    background: var(--b-primary);
    color: var(--b-opposite);
    border-radius: var(--b-widget-border-radius);
}

/* Avoid: Hard-coded values */
.my-custom-task {
    background: #2196F3;
    color: #000;
    border-radius: 4px;
}
```

### Follow Naming Conventions

```css
/* Follow .b-* pattern for consistency */
.b-my-custom-component { }
.b-my-custom-component-header { }
.b-my-custom-component-content { }
```

### Use Color-Mix for Shades

```css
/* Modern approach using color-mix */
--b-custom-light: color-mix(in srgb, var(--b-primary) 20%, var(--b-mix));
--b-custom-dark: color-mix(in srgb, var(--b-primary) 80%, var(--b-opposite));
```

### Respect Theme Renditions

```css
/* Check theme rendition before styling */
[data-theme-button-rendition="text"] .b-button {
    /* Text button specific styles */
}

[data-theme-button-rendition="tonal"] .b-button {
    /* Tonal button specific styles */
}
```

---

## 11. QUICK REFERENCE

### Essential Variables for Customization

```css
:root {
    /* Brand */
    --b-primary: #your-color;
    --b-secondary: #your-accent;

    /* Sizing */
    --b-widget-border-radius: 0.5em;
    --b-widget-padding: 1em;

    /* Grid */
    --b-grid-cell-padding: 0.5em;
    --b-grid-row-height: 40px;

    /* Gantt */
    --b-gantt-task-height: 28px;
    --b-gantt-bar-margin: 8px;
}
```

### Essential Classes to Know

| Class | Purpose |
|-------|---------|
| `.b-gantt` | Main Gantt container |
| `.b-grid` | Main Grid container |
| `.b-gantt-task` | Task bar element |
| `.b-grid-cell` | Grid cell |
| `.b-grid-row` | Grid row |
| `.b-button` | Button element |
| `.b-field` | Form field |
| `.b-popup` | Popup/modal |
| `.b-toolbar` | Toolbar |
| `.b-disabled` | Disabled state |
| `.b-focused` | Focus state |
| `.b-hidden` | Hidden element |
