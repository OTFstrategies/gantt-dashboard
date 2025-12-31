# Bryntum Upgrade Guides - Complete Official Documentation

> **Bron**: Officiële Bryntum Gantt v7.1.0 documentatie - `docs/data/Gantt/guides/upgrades/`

---

## Version 7.0.0

### New Themes & Styling Changes

Major styling overhaul across all Bryntum products. Custom themes and app styling need updates.

### Assignment Field Picker Changed to TabPanel

The assignment field picker now uses `TabPanel` with separate tabs per resource type: "Work", "Material", "Cost".

**Old Code (Grid-based):**
```javascript
new Gantt({
    columns: [{
        type: 'resourceassignment',
        editor: {
            type: 'assignmentfield',
            picker: {
                columns: [{
                    text: 'Calendar',
                    field: 'resource.calendar.name'
                }]
            }
        }
    }]
});
```

**New Code (TabPanel-based):**
```javascript
new Gantt({
    columns: [{
        type: 'resourceassignment',
        editor: {
            type: 'assignmentfield',
            picker: {
                items: {
                    workTab: {
                        columns: [{
                            text: 'Calendar',
                            field: 'resource.calendar.name'
                        }]
                    }
                }
            }
        }
    }]
});
```

### TaskDrag Now Drags All Selected Tasks

**Revert to Single Task Drag:**
```javascript
new Gantt({
    features: {
        taskDrag: {
            dragAllSelectedTasks: false
        }
    }
});
```

### Project Settings Tracked by Default

**Disable Tracking:**
```javascript
new Gantt({
    project: {
        syncUrl: 'someUrl',
        trackProjectSettings: false
    }
});
```

### Resizable Task Editor

Task editor is now resizable by default.

**Disable Resizing:**
```javascript
new Gantt({
    features: {
        taskEdit: {
            editorConfig: {
                resizable: false
            }
        }
    }
});
```

### DatePicker cellRenderer Context Change

```javascript
// Old
cellRenderer({ cell, date }) {
    cell.innerHTML += `<b>$${getValueForDate(date)}</b>`;
}

// New
cellRenderer({ innerCell, date }) {
    innerCell.innerHTML += `<b>$${getValueForDate(date)}</b>`;
}
```

### Renamed: autoPostponedConflicts → autoPostponeConflicts

```javascript
// Old
project: { autoPostponedConflicts: true }

// New
project: { autoPostponeConflicts: true }
```

---

## Version 6.0.0+

### Manually Scheduled Tasks No Longer Extend Over Non-Working Time

**Enable Old Behavior:**
```javascript
const gantt = new Gantt({
    project: {
        skipNonWorkingTimeInDurationWhenSchedulingManually: true
    }
});
```

### Calendar Editor Support

Validate calendar data for the new editor:
```javascript
calendarManagerStore.validateAllRecordsForCalendarEditor();
```

### toJSON Format Change

```javascript
// Old format
{ eventsData: [...] }

// New format
{ tasksData: [...] }
```

### BryntumProjectModel → BryntumGanttProjectModel

**Angular:**
```typescript
import { BryntumGanttProjectModelComponent } from '@bryntum/gantt-angular';
```

**React:**
```typescript
import { BryntumGanttProjectModelComponent } from '@bryntum/gantt-react';
```

### Filter Feature Multi-Filter Default

**Revert to Legacy Mode:**
```javascript
{
    features: {
        filter: { legacyMode: true }
    }
}
```

### TaskCopyPaste Made Asynchronous

```javascript
// Old
function copyPaste() {
    gantt.copyRows();
    gantt.pasteRows();
}

// New
async function copyPaste() {
    await gantt.copyRows();
    await gantt.pasteRows();
}
```

### Localization API Changes

```javascript
// Old
LocaleManager.registerLocale('Es', { locale: {...} });

// New
LocaleHelper.publishLocale({
    localeName: 'Es',
    localeDesc: 'Spanish',
    localeCode: 'es'
});
```

### Wbs Class Moved to Core

```javascript
// Old
import Wbs from 'Gantt/data/Wbs.js';

// New
import Wbs from 'Core/data/Wbs.js';
```

### New Angular Module Bundle

```javascript
// Old
import { Gantt } from '@bryntum/gantt/gantt.lite.umd.js';

// New
import { Gantt } from '@bryntum/gantt';
```

### EventModeColumn Removed

```javascript
// Old
columns: [{ type: 'eventmode' }]

// New
columns: [{ type: 'manuallyscheduled' }]
```

### RowNumberColumn → SequenceColumn

```javascript
// Old
rowResize: { cellSelector: '.b-rownumber-cell' }

// New
rowResize: { cellSelector: '.b-sequence-cell' }
```

---

## Version 6.1.x - 6.3.x

### AjaxHelper.fetch Credentials Default Change (v6.2.0)

```javascript
// Restore old behavior
AjaxHelper.DEFAULT_FETCH_OPTIONS = { credentials: 'include' };
```

### Naming Simplification (v6.3.0)

```javascript
// Old
project: {
    tasksData: [...],
    resourcesData: [...],
    assignmentsData: [...]
}

// New
project: {
    tasks: [...],
    resources: [...],
    assignments: [...]
}
```

### Critical Paths Feature Enhancement (v6.3.0)

```javascript
// Old (custom implementation)
class Task extends TaskModel {
    get cls() {
        return Object.assign(super.cls, { 'b-critical': this.critical });
    }
}

// New (built-in)
new Gantt({
    features: {
        criticalPaths: {
            disabled: false,
            highlightCriticalRows: true
        }
    }
});
```

---

## Version 5.0.x - 5.6.x

### validateResponse Default Changed

```javascript
const gantt = new Gantt({
    project: {
        validateResponse: false  // Disable in production
    }
});
```

### Vue relayStoreEvents Config

```html
<bryntum-gantt :relayStoreEvents="true" />
```

### Store useRawData Default

```javascript
const gantt = new Gantt({
    project: {
        taskStore: { useRawData: false }
    }
});
```

### Transport Config Simplification

```javascript
// Old
transport: {
    load: {
        fetchOptions: { credentials: 'include' }
    }
}

// New
transport: {
    load: { credentials: 'include' }
}
```

---

## CSS Migration

### Grid Header Border Styling

```css
/* Old */
.b-grid-header-container {
    border-bottom: none;
}

/* New */
.b-gantt {
    .b-header:not(.b-grid-header-scroller-normal) .b-grid-headers,
    .b-horizontaltimeaxis {
        border-bottom: none;
    }
}
```

### Task Bar CSS Grid Layout (v5.6.0)

Task bar wrapper (`.b-gantt-task-wrap`) now uses CSS grid layout instead of flexbox.

### eventColor Field (v5.4.0)

These SASS variables are no longer used:
- `$gantt-task-hover-background-color`
- `$gantt-task-parent-hover-background`

---

## TypeScript Changes

### ScrollOptions Renamed

```typescript
// Old
import { ScrollOptions } from '@bryntum/gantt';

// New
import { BryntumScrollOptions } from '@bryntum/gantt';
```

### Point Class Location

```javascript
// Old
import Point from 'path-to-lib/Core/helper/util/Point.js';

// New
import { Point } from 'path-to-lib/Core/helper/util/Rectangle.js';
```

---

## Feature Restructuring

### Moved Features (v5.5.0)

| Old Location | New Location |
|--------------|--------------|
| `Grid.feature.RowReorder` | `Scheduler.feature.RowReorder` |
| `Grid.feature.CellEdit` | `SchedulerPro.feature.CellEdit` |
| `Scheduler.feature.Dependencies` | `SchedulerPro.feature.Dependencies` |

---

## Quick Upgrade Checklist

### v6.x → v7.0

- [ ] Update theme imports
- [ ] Check AssignmentField picker customizations
- [ ] Review TaskDrag multi-select behavior
- [ ] Update autoPostponedConflicts to autoPostponeConflicts
- [ ] Check DatePicker cellRenderer for cell→innerCell

### v5.x → v6.0

- [ ] Update LocaleManager to LocaleHelper
- [ ] Change eventsData to tasksData in toJSON
- [ ] Update BryntumProjectModel to BryntumGanttProjectModel
- [ ] Check Filter feature for multi-filter
- [ ] Make TaskCopyPaste calls async
- [ ] Update imports for moved classes

### v4.x → v5.0

- [ ] Enable validateResponse: false for production
- [ ] Update Angular bundle imports
- [ ] Check useRawData store settings
- [ ] Simplify transport config

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
