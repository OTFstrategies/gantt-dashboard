# Bryntum Calendar, SchedulerPro & TaskBoard - Complete Official Documentation

> **Bron**: Officiële Bryntum v7.1.0 documentatie

---

## Part 1: Bryntum Calendar

### Calendar Features

| Feature | Default | Description |
|---------|---------|-------------|
| **EventMenu** | Enabled | Context menu on right-click events |
| **ScheduleMenu** | Enabled | Context menu on empty schedule time |
| **CalendarDrag** | Enabled | Drag to create, move or resize events |
| **EventEdit** | Enabled | Editor popup for event data |
| **EventTooltip** | Enabled | Tooltip on event click/hover |
| **EventCopyPaste** | Enabled | Copy-paste via context menu and keyboard |
| **ExcelExporter** | Disabled | Export to Excel |
| **ExternalEventSource** | Disabled | Create events by dragging from external DOM |
| **LoadOnDemand** | Disabled | Load CrudManager on date range change |
| **Print** | Disabled | Print current calendar mode |
| **TimeRanges** | Disabled | Highlighted time ranges |
| **WeekExpander** | Disabled | Expand week rows in MonthView |
| **ScheduleTooltip** | Disabled | Time tooltip on hover |
| **EventBuffer** | Disabled | Show time before/after events |

### Feature Configuration

```javascript
const calendar = new Calendar({
    features : {
        // Disable default features
        drag : false,

        // Enable optional features
        weekExpander : true,

        // Configure features
        externalEventSource : {
            dragRootElement : '#mySourceElementId',
            dragItemSelector : '.my-item-class'
        }
    }
});
```

### Mode-Specific Features

When using Scheduler/EventList/AgendaView modes, configure features on the mode:

```javascript
const calendar = new Calendar({
    modes : {
        list : {
            features : {
                cellTooltip : {
                    hoverDelay : 200,
                    tooltipRenderer({ column, record }) {
                        if (column.field === 'name') {
                            return record.notes;
                        }
                    }
                }
            }
        }
    }
});
```

---

### Calendar Cookbook

#### Toolbar Items (Default)

| Item | Type | Weight | Description |
|------|------|--------|-------------|
| `toggleSidebar` | Button | 100 | Collapse/expand sidebar |
| `todayButton` | Button | 200 | Navigate to today |
| `prevButton` | Button | 300 | Previous time span |
| `nextButton` | Button | 400 | Next time span |
| `viewDescription` | Widget | 500 | Current date range display |
| `spacer` | Widget | 600 | Flexible spacer |
| `modeSelector` | ModeSelector | 700 | View switch buttons |

#### Add Custom Toolbar Button

```javascript
const calendar = new Calendar({
    tbar : {
        items : {
            addEventButton : {
                type    : 'button',
                text    : 'Add Event',
                icon    : 'b-icon-add',
                weight  : 150,
                onClick() {
                    calendar.createEvent(new Date());
                }
            }
        }
    }
});
```

#### Remove Toolbar Item

```javascript
const calendar = new Calendar({
    tbar : {
        items : {
            todayButton : null
        }
    }
});
```

#### Reorder Toolbar Items

```javascript
const calendar = new Calendar({
    tbar : {
        items : {
            modeSelector : { weight : 50 },
            todayButton : { weight : 800 }
        }
    }
});
```

---

#### Sidebar Items (Default)

| Item | Type | Weight | Description |
|------|------|--------|-------------|
| `datePicker` | CalendarDatePicker | 100 | Date selector |
| `eventFilter` | FilterField | 150 | Filter events by name |
| `resourceFilter` | ResourceFilter | 200 | Toggle resources |

#### Add Sidebar Field

```javascript
const calendar = new Calendar({
    sidebar : {
        items : {
            customFilter : {
                type        : 'textfield',
                label       : 'Custom Filter',
                placeholder : 'Filter by...',
                weight      : 250,
                listeners   : {
                    change({ value }) {
                        console.log('Filter:', value);
                    }
                }
            }
        }
    }
});
```

---

#### Event Editor Items (Default)

| Item | Type | Weight | Description |
|------|------|--------|-------------|
| `nameField` | TextField | 100 | Event name |
| `resourceField` | ResourceField | 200 | Resource dropdown |
| `allDay` | SlideToggle | 250 | All-day toggle |
| `startDateField` | DateField | 300 | Start date |
| `startTimeField` | TimeField | 400 | Start time |
| `endDateField` | DateField | 500 | End date |
| `endTimeField` | TimeField | 600 | End time |
| `recurrenceCombo` | RecurrenceCombo | 700 | Recurrence dropdown |
| `editRecurrenceButton` | Button | 800 | Open recurrence editor |

#### Add Custom Event Editor Field

```javascript
class MyEvent extends EventModel {
    static fields = [
        { name: 'location', type: 'string' }
    ];
}

const calendar = new Calendar({
    project : {
        eventStore : {
            modelClass : MyEvent,
            data : [/*...*/]
        }
    },
    features : {
        eventEdit : {
            items : {
                locationField : {
                    type  : 'textfield',
                    name  : 'location',
                    label : 'Location'
                }
            }
        }
    }
});
```

---

#### Event Rendering Customization

```javascript
const calendar = new Calendar({
    modes : {
        week : {
            eventRenderer({ eventRecord, renderData }) {
                renderData.iconCls['fa fa-star'] = eventRecord.isImportant;
            }
        }
    }
});
```

#### Scheduler as Calendar Mode

```javascript
const calendar = new Calendar({
    modes : {
        myScheduler : {
            weight  : -10,
            type    : 'scheduler',
            title   : 'Timeline',
            columns : [
                { type : 'resourceInfo', text : 'Staff', field : 'name' }
            ]
        }
    },
    mode : 'myScheduler'
});
```

---

#### Event Creation Validation

```javascript
const calendar = new Calendar({
    features : {
        drag : {
            validateCreateFn({ eventRecord }) {
                for (const date = DateHelper.startOf(eventRecord.startDate);
                     date < eventRecord.endDate;
                     date.setDate(date.getDate() + 1)) {
                    const day = date.getDay();
                    if (day === 0 || day === 6) return false;
                }
                return true;
            },

            validateResizeFn({ eventRecord : { startDate, endDate } }) {
                const durationHours = (endDate - startDate) / (1000 * 60 * 60);
                return durationHours >= 1;
            }
        }
    },

    onBeforeAutoCreate({ view, startDate, endDate }) {
        const day = startDate.getDay();
        return !(day === 0 || day === 6);
    }
});
```

---

## Part 2: Bryntum SchedulerPro

SchedulerPro extends Scheduler which extends Grid. Inherits all features from both.

### SchedulerPro-Specific Features

| Feature | Default | Description |
|---------|---------|-------------|
| **AllocationCellEdit** | Disabled | Edit time-phased effort in ResourceUtilization |
| **AllocationCopyPaste** | Disabled | Copy-paste effort values |
| **CalendarHighlight** | Disabled | Visualize event/resource calendars |
| **CellEdit** | Enabled | Enhanced cell editing |
| **Dependencies** | Enabled | Project transaction support |
| **DependencyEdit** | Disabled | Popup for dependency editing |
| **EventBuffer** | Disabled | Show travel time before/after events |
| **EventResize** | Enabled | Resize events by dragging |
| **EventSegmentDrag** | Enabled | Drag event segments |
| **EventSegmentResize** | Enabled | Resize event segments |
| **EventSegments** | Enabled | Segmented events support |
| **NestedEvents** | Disabled | Nested child events inside parents |
| **PercentBar** | Disabled | Progress bar on events |
| **ResourceEdit** | Enabled | Resource editing popup |
| **ResourceNonWorkingTime** | Disabled | Highlight non-working intervals |
| **TaskEdit** | Enabled | Customizable task editor |
| **TimeSpanHighlight** | Disabled | Highlight time spans |
| **Versions** | Disabled | Project versioning/snapshots |

### SchedulerPro Configuration

```javascript
import SchedulerPro from 'PATH_TO_SOURCE/SchedulerPro/view/SchedulerPro.js';
import 'PATH_TO_SOURCE/SchedulerPro/feature/Baselines.js';

const schedulerPro = new SchedulerPro({
    features : {
        baselines : {
            // feature config
        },
        percentBar : true,
        eventBuffer : {
            renderer : ({ eventRecord }) => eventRecord.travelTime
        }
    }
});
```

### Event Segments

```javascript
// Split event into segments
eventRecord.splitAtDate(new Date('2025-01-15'));

// Access segments
eventRecord.segments.forEach(segment => {
    console.log(segment.startDate, segment.endDate);
});
```

### Nested Events

```javascript
const schedulerPro = new SchedulerPro({
    features : {
        nestedEvents : true
    },
    project : {
        eventsData : [
            {
                id: 1,
                name: 'Parent',
                children: [
                    { id: 11, name: 'Child 1' },
                    { id: 12, name: 'Child 2' }
                ]
            }
        ]
    }
});
```

---

## Part 3: Bryntum TaskBoard

### TaskBoard Features

| Feature | Default | Description |
|---------|---------|-------------|
| **ColumnDrag** | Disabled | Drag-reorder columns |
| **ColumnFilter** | Disabled | Filter tasks per column |
| **ColumnHeaderMenu** | Enabled | Column header menu |
| **ColumnLock** | Disabled | Lock columns left/right |
| **ColumnRename** | Disabled | Rename columns |
| **ColumnResize** | Disabled | Resize column widths |
| **ColumnSort** | Disabled | Sort tasks per column |
| **ColumnToolbars** | Enabled | Toolbars per column/swimlane |
| **FilterBar** | Disabled | Text filter in header |
| **SimpleTaskEdit** | Disabled | Inline task editing |
| **SwimlaneDrag** | Disabled | Drag-reorder swimlanes |
| **TaskDrag** | Enabled | Drag-drop tasks |
| **TaskDragSelect** | Enabled | Marquee selection |
| **TaskEdit** | Enabled | Popup task editor |
| **TaskMenu** | Enabled | Task context menu |
| **TaskTooltip** | Disabled | Task hover tooltip |

### TaskBoard Configuration

```javascript
const taskBoard = new TaskBoard({
    features : {
        // Disable defaults
        columnToolbars : false,
        taskDrag       : false,

        // Enable optional
        columnDrag  : true,
        taskTooltip : true,

        // Configure
        columnToolbars : {
            topItems : {
                // ...
            }
        }
    }
});
```

### Runtime Feature Access

```javascript
taskBoard.features.taskEdit.editTask(taskRecord);
```

---

## Quick Reference

### Common Patterns Across Products

#### Feature Toggle

```javascript
// Disable
features : { featureName : false }

// Enable
features : { featureName : true }

// Configure
features : { featureName : { option: value } }
```

#### Importing Features (Thin Bundles)

```javascript
import Product from 'PATH_TO_SOURCE/Product/view/Product.js';
import 'PATH_TO_SOURCE/Product/feature/FeatureName.js';
```

#### CrudManager Setup

```javascript
project : {
    autoLoad : true,
    autoSync : true,
    loadUrl  : '/api/load',
    syncUrl  : '/api/sync'
}
```

### Key Events

| Event | Products | Description |
|-------|----------|-------------|
| `beforeEventEdit` | Cal, SPro | Before event editor opens |
| `beforeEventSave` | Cal, SPro | Before event is saved |
| `eventClick` | Cal, SPro | Event clicked |
| `taskClick` | TB | Task clicked |
| `beforeTaskEdit` | TB | Before task editor opens |
| `columnDrop` | TB | Column reordered |
| `taskDrop` | TB | Task moved |

### Framework Wrapper Notes

Features must be configured via `featureNameFeature` properties:

```javascript
// React
<BryntumCalendar eventEditFeature={{ items: {...} }} />

// Vue
<bryntum-calendar :event-edit-feature="{ items: {...} }" />

// Angular
[eventEditFeature]="{ items: {...} }"
```

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
