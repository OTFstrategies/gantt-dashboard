# Bryntum CSS Migration Guide v7.0 - Official Reference

> **Bron**: Officiële Bryntum Gantt v7.1.0 documentatie - migration guides

---

## Overzicht Major Changes v7.0

De v7.0 release bevat een complete CSS rewrite met moderne technieken:

1. **Geen SASS meer**: Themes gebouwd met plain CSS met nesting en CSS variables
2. **CSS Variables**: Alle kleuren, spacing, properties via CSS variables
3. **Kebab-case class names**: `.b-button-group` ipv `.b-buttongroup`
4. **Structural CSS gescheiden**: Themes zijn nu veel dunner
5. **FontAwesome apart**: Moet apart worden geïmporteerd

---

## CSS Includes (Nieuw)

### Oude Situatie (v6.x)

```html
<!-- Alles in één bestand -->
<link rel="stylesheet" href="build/gantt.stockholm.css" data-bryntum-theme>
```

### Nieuwe Situatie (v7.0+)

```html
<!-- 1. FontAwesome apart -->
<link rel="stylesheet" href="build/fontawesome/css/fontawesome.css">
<link rel="stylesheet" href="build/fontawesome/css/solid.css">

<!-- 2. Structural CSS -->
<link rel="stylesheet" href="build/gantt.css">

<!-- 3. Theme (lightweight, shared tussen alle producten) -->
<link rel="stylesheet" href="build/stockholm-light.css">
```

---

## Custom Styles Migratie Stappenplan

### Stap 1: Kebab-case Class Names

Hernoem alle Bryntum selectors naar kebab-case:

```css
/* OUD */
.b-buttongroup { }
.b-datepicker { }
.b-taskboard { }

/* NIEUW */
.b-button-group { }
.b-date-picker { }
.b-task-board { }
```

### Stap 2: Specificiteit Controleren

Sommige selectors hebben gewijzigde specificiteit. Verhoog indien nodig:

```css
/* Als dit niet meer werkt: */
.b-gantt .b-task { color: red; }

/* Probeer: */
.b-gantt.b-gantt .b-task { color: red; }
```

### Stap 3: DOM Structuur Wijzigingen

Controleer DOM structuur voor widgets die zijn gewijzigd:

**TextField (en andere form fields)**:
- Border is nu op pseudo van `.b-field-inner`, niet direct op element

**Slider**:
- Volledig herimplementeerd, structuur significant gewijzigd

**List (en ChipView)**:
- Items wrappen nu text in `.b-list-item-content`

### Stap 4: Button Classes

`.b-raised` en `.b-transparent` zijn vervangen:

```javascript
// OUD
new Button({
    cls: 'b-raised',
    text: 'Important'
});

// NIEUW
new Button({
    rendition: 'filled',  // of 'text', 'outlined'
    text: 'Important'
});
```

### Stap 5: CSS Variables Gebruiken

Prefer CSS variables boven selector overrides:

```css
/* In plaats van: */
.b-gantt .b-grid-cell {
    border-color: #e9eaeb;
}

/* Gebruik: */
:root {
    --b-grid-cell-border-color: #e9eaeb;
}
```

---

## Custom Theme Migratie

### Van SASS naar CSS Variables

**Oud (SASS vars)**:
```scss
$grid-cell-border-color: #e9eaeb;
$grid-header-font-weight: $stockholm-font-weight;
```

**Nieuw (CSS vars)**:
```css
:root:not(.b-nothing), :host(:not(.b-nothing)) {
    --b-grid-cell-border-color: var(--b-neutral-85);
    --b-grid-header-font-weight: 400;
}
```

De selector `:root:not(.b-nothing)` verhoogt specificiteit om default values te overriden.

---

## Automatische Migratie Script

Bryntum levert een `migrate.js` script in de product root:

```bash
node migrate.js path/to/your/styles.css
```

Dit hernoemt automatisch de meeste selectors. **Verifieer output voor commit!**

---

## Complete Selector Mapping

### Core Widgets

| Oud | Nieuw |
|-----|-------|
| `.b-buttongroup` | `.b-button-group` |
| `.b-datepicker` | `.b-date-picker` |
| `.b-datefield` | `.b-date-field` |
| `.b-datetimefield` | `.b-date-time-field` |
| `.b-displayfield` | `.b-display-field` |
| `.b-durationfield` | `.b-duration-field` |
| `.b-fieldcontainer` | `.b-field-container` |
| `.b-fieldset` | `.b-field-set` |
| `.b-filepicker` | `.b-file-picker` |
| `.b-menuitem` | `.b-menu-item` |
| `.b-messagedialog` | `.b-message-dialog` |
| `.b-monthpicker` | `.b-month-picker` |
| `.b-multiselect` | `.b-multi-select` |
| `.b-numberfield` | `.b-number-field` |
| `.b-pickerfield` | `.b-picker-field` |
| `.b-radiogroup` | `.b-radio-group` |
| `.b-slidetoggle` | `.b-slide-toggle` |
| `.b-tabbar` | `.b-tab-bar` |
| `.b-tabpanel` | `.b-tab-panel` |
| `.b-textfield` | `.b-text-field` |
| `.b-textareafield` | `.b-text-area-field` |
| `.b-timefield` | `.b-time-field` |
| `.b-timepicker` | `.b-time-picker` |
| `.b-undoredo` | `.b-undo-redo` |
| `.b-yearpicker` | `.b-year-picker` |

### Grid

| Oud | Nieuw |
|-----|-------|
| `.b-actioncolumn` | `.b-action-column` |
| `.b-celltooltip` | `.b-cell-tooltip` |
| `.b-columnresize` | `.b-column-resize` |
| `.b-exportdialog` | `.b-export-dialog` |
| `.b-grid-subgrid` | `.b-grid-sub-grid` |
| `.b-grid-treegroup` | `.b-grid-tree-group` |
| `.b-gridbase` | `.b-grid-base` |
| `.b-groupbar` | `.b-group-bar` |
| `.b-mergecells` | `.b-merge-cells` |
| `.b-percentdone` | `.b-percent-done` |
| `.b-rowexpander` | `.b-row-expander` |
| `.b-rownumber-cell` | `.b-row-number-cell` |
| `.b-rowresize` | `.b-row-resize` |
| `.b-stickycells` | `.b-sticky-cells` |
| `.b-treesummary` | `.b-tree-summary` |

### Scheduler/Timeline

| Oud | Nieuw |
|-----|-------|
| `.b-columnlines` | `.b-column-lines` |
| `.b-dependencyeditor` | `.b-dependency-editor` |
| `.b-dragcreating` | `.b-drag-creating` |
| `.b-dragselect` | `.b-drag-select` |
| `.b-eventdrag` | `.b-event-drag` |
| `.b-eventeditor` | `.b-event-editor` |
| `.b-eventresize` | `.b-event-resize` |
| `.b-eventtip` | `.b-event-tip` |
| `.b-horizontaltimeaxis` | `.b-horizontal-time-axis` |
| `.b-resourceheader` | `.b-resource-header` |
| `.b-schedulerbase` | `.b-scheduler-base` |
| `.b-scrollbuttons` | `.b-scroll-buttons` |
| `.b-stickyevents` | `.b-sticky-events` |
| `.b-timeaxissubgrid` | `.b-time-axis-sub-grid` |
| `.b-timelinebase` | `.b-timeline-base` |
| `.b-timeranges` | `.b-time-ranges` |
| `.b-verticaltimeaxis` | `.b-vertical-time-axis` |

### Gantt

| Oud | Nieuw |
|-----|-------|
| `.b-assignmentfield` | `.b-assignment-field` |
| `.b-assignmentgrid` | `.b-assignment-grid` |
| `.b-assignmentpicker` | `.b-assignment-picker` |
| `.b-calendareditor` | `.b-calendar-editor` |
| `.b-calendarfield` | `.b-calendar-field` |
| `.b-dependencytab` | `.b-dependency-tab` |
| `.b-gantt-taskdrag` | `.b-gantt-task-drag` |
| `.b-ganttbase` | `.b-gantt-base` |
| `.b-notestab` | `.b-notes-tab` |
| `.b-projecteditor` | `.b-project-editor` |
| `.b-resourceassignment` | `.b-resource-assignment` |
| `.b-resourceeditor` | `.b-resource-editor` |
| `.b-resourcegrid` | `.b-resource-grid` |
| `.b-resourcestab` | `.b-resources-tab` |
| `.b-taskeditor` | `.b-task-editor` |
| `.b-taskeditorbase` | `.b-task-editor-base` |
| `.b-tasknonworkingtime` | `.b-task-non-working-time` |

### SchedulerPro

| Oud | Nieuw |
|-----|-------|
| `.b-nestedevents` | `.b-nested-events` |
| `.b-percentbar` | `.b-percent-bar` |
| `.b-resourcehistogram` | `.b-resource-histogram` |
| `.b-resourceutilization` | `.b-resource-utilization` |
| `.b-schedulerprobase` | `.b-scheduler-pro-base` |
| `.b-schedulerpro-taskeditor` | `.b-scheduler-pro-task-editor` |

### TaskBoard

| Oud | Nieuw |
|-----|-------|
| `.b-columnlock` | `.b-column-lock` |
| `.b-resourcescombo` | `.b-resources-combo` |
| `.b-tagcombo` | `.b-tag-combo` |
| `.b-taskboard` | `.b-task-board` |
| `.b-taskboard-taskitem` | `.b-task-board-task-item` |
| `.b-taskboardbase` | `.b-task-board-base` |
| `.b-todolistfield` | `.b-todo-list-field` |

### Calendar

| Oud | Nieuw |
|-----|-------|
| `.b-agendaview` | `.b-agenda-view` |
| `.b-calendarmixin` | `.b-calendar-mixin` |
| `.b-calendarrow` | `.b-calendar-row` |
| `.b-dayagendaview` | `.b-day-agenda-view` |
| `.b-dayresourceview` | `.b-day-resource-view` |
| `.b-dayselector` | `.b-day-selector` |
| `.b-dayview` | `.b-day-view` |
| `.b-dayview-allday` | `.b-day-view-all-day` |
| `.b-eventlist` | `.b-event-list` |
| `.b-modeselector` | `.b-mode-selector` |
| `.b-monthagendaview` | `.b-month-agenda-view` |
| `.b-monthview` | `.b-month-view` |
| `.b-multidayview` | `.b-multi-day-view` |
| `.b-resourceview` | `.b-resource-view` |
| `.b-weekview` | `.b-week-view` |
| `.b-yearview` | `.b-year-view` |

### Misc

| Oud | Nieuw |
|-----|-------|
| `.b-autoheight` | `.b-auto-height` |
| `.b-colorbox` | `.b-color-box` |
| `.b-colorpicker` | `.b-color-picker` |
| `.b-draghelper` | `.b-drag-helper` |
| `.b-nonworkingday` | `.b-non-working-day` |
| `.b-sch-nonworkingtime` | `.b-sch-non-working-time` |
| `.b-sch-timeaxis-cell` | `.b-sch-time-axis-cell` |
| `.b-sch-timerange` | `.b-sch-time-range` |
| `.b-timeline-startdate` | `.b-timeline-start-date` |
| `.b-timeline-enddate` | `.b-timeline-end-date` |
| `.b-versiongrid` | `.b-version-grid` |

---

## Beschikbare Themes v7.0

**Light Themes**:
- `svalbard-light.css` (nieuw)
- `visby-light.css` (nieuw)
- `material3-light.css` (nieuw)
- `stockholm-light.css`
- `classic-light.css`

**Dark Themes**:
- `svalbard-dark.css` (nieuw)
- `visby-dark.css` (nieuw)
- `material3-dark.css` (nieuw)
- `stockholm-dark.css`
- `classic-dark.css`

**High Contrast**:
- `high-contrast.css` (nieuw - WCAG compliant)

---

## Color System

Nieuwe color system met semantische variabelen:

```css
:root {
    /* Neutral palette */
    --b-neutral-0: #ffffff;
    --b-neutral-10: #f5f5f5;
    --b-neutral-85: #e9eaeb;
    --b-neutral-100: #000000;

    /* Primary colors */
    --b-primary: #007bff;
    --b-primary-light: #66b3ff;
    --b-primary-dark: #0056b3;

    /* Status colors */
    --b-success: #28a745;
    --b-warning: #ffc107;
    --b-danger: #dc3545;
    --b-info: #17a2b8;
}
```

---

## Best Practices

1. **Test CSS Migratie in Stappen**
   - Eerst structural CSS
   - Dan theme
   - Dan custom overrides

2. **Gebruik Browser DevTools**
   - Controleer welke selectors niet meer matchen
   - Inspect DOM voor structuur wijzigingen

3. **CSS Variables Preference**
   - Gebruik waar mogelijk CSS variables
   - Minder specificity issues
   - Makkelijker theme switching

4. **Backup Oude Styles**
   - Bewaar v6.x styles als referentie
   - Vergelijk side-by-side

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
