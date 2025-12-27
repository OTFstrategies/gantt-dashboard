# SCHEDULER-DEEP-DIVE-CALENDARS.md

> **Diepgaande analyse** van het Calendar system in SchedulerPro - working time, resource/event calendars, intervals, recurrence en visualisatie via NonWorkingTime features.

---

## Overzicht

Calendars in SchedulerPro definiëren wanneer werk kan worden uitgevoerd. Ze bevatten intervals die bepalen welke tijden "working" of "non-working" zijn. Dit beïnvloedt de scheduling engine en kan visueel worden weergegeven.

### Kerncomponenten

| Component | Beschrijving |
|-----------|--------------|
| **CalendarModel** | Model voor een calendar met intervals |
| **CalendarIntervalModel** | Model voor een interval (working/non-working) |
| **CalendarManagerStore** | Store voor alle calendars |
| **NonWorkingTime Feature** | Visualisatie project-level non-working time |
| **ResourceNonWorkingTime Feature** | Visualisatie per-resource non-working time |
| **EventNonWorkingTime Feature** | Visualisatie per-event non-working time |
| **CalendarEditor Widget** | UI voor calendar editing |

---

## 1. CalendarModel

### Basis Structuur

```typescript
interface CalendarModelConfig {
    // Identity
    id?: string | number;
    name?: string;

    // Intervals
    intervals?: CalendarIntervalModel[] | CalendarIntervalModelConfig[];

    // Behavior
    unspecifiedTimeIsWorking?: boolean;  // Default: true

    // Styling
    cls?: string;           // CSS class for UI
    iconCls?: string;       // Icon CSS class

    // Error handling
    treatInconsistentIntervals?: 'Skip' | 'Throw';

    // Timezone
    ignoreTimeZone?: boolean;
}
```

### Data Format

```json
{
    "calendars" : {
        "rows" : [
            {
                "id"   : "general",
                "name" : "General Working Hours",
                "unspecifiedTimeIsWorking" : false,
                "intervals" : [
                    {
                        "recurrentStartDate" : "on Mon at 08:00",
                        "recurrentEndDate"   : "on Mon at 17:00",
                        "isWorking"          : true
                    },
                    {
                        "recurrentStartDate" : "on Tue at 08:00",
                        "recurrentEndDate"   : "on Tue at 17:00",
                        "isWorking"          : true
                    },
                    {
                        "startDate" : "2024-12-25",
                        "endDate"   : "2024-12-26",
                        "isWorking" : false,
                        "name"      : "Christmas"
                    }
                ]
            },
            {
                "id"   : "night-shift",
                "name" : "Night Shift",
                "unspecifiedTimeIsWorking" : false,
                "intervals" : [
                    {
                        "recurrentStartDate" : "on Mon at 22:00",
                        "recurrentEndDate"   : "on Tue at 06:00",
                        "isWorking"          : true
                    }
                ]
            }
        ]
    }
}
```

### Calendar Hiërarchie

```
Project Calendar (default)
    │
    ├── Resource Calendar (overrides project)
    │       │
    │       └── Event Calendar (overrides resource)
    │
    └── Dependency Calendar (for lag calculation)
```

---

## 2. CalendarIntervalModel

### Interval Types

```typescript
interface CalendarIntervalModelConfig {
    // Identity
    id?: string | number;
    name?: string;

    // Static dates (specific occurrence)
    startDate?: Date;
    endDate?: Date;

    // Recurrent dates (repeating pattern)
    recurrentStartDate?: string;    // RRULE-like format
    recurrentEndDate?: string;

    // Working status
    isWorking?: boolean;    // true = working time, false = non-working

    // Priority (higher wins in overlap)
    priority?: number;

    // Styling
    cls?: string;
    iconCls?: string;

    // Timezone
    recurrentTimezone?: string;
}
```

### Static Intervals

```typescript
// Specific holiday
{
    name      : 'Christmas Day',
    startDate : '2024-12-25',
    endDate   : '2024-12-26',
    isWorking : false,
    cls       : 'holiday'
}

// Specific working block
{
    name      : 'Overtime',
    startDate : '2024-12-21T18:00',
    endDate   : '2024-12-21T22:00',
    isWorking : true,
    cls       : 'overtime'
}
```

### Recurrent Intervals

Recurrent dates gebruiken een "pseudo-RRULE" syntax:

```typescript
// Every Monday 9:00-17:00
{
    recurrentStartDate : 'on Mon at 09:00',
    recurrentEndDate   : 'on Mon at 17:00',
    isWorking          : true
}

// Every weekday 8:00-12:00 and 13:00-17:00
[
    {
        recurrentStartDate : 'on weekdays at 08:00',
        recurrentEndDate   : 'on weekdays at 12:00',
        isWorking          : true
    },
    {
        recurrentStartDate : 'on weekdays at 13:00',
        recurrentEndDate   : 'on weekdays at 17:00',
        isWorking          : true
    }
]

// Every Saturday 10:00-14:00
{
    recurrentStartDate : 'on Sat at 10:00',
    recurrentEndDate   : 'on Sat at 14:00',
    isWorking          : true,
    name               : 'Saturday shift'
}
```

### Recurrence Syntax

```
"on <day> at <time>"

Days:
- Mon, Tue, Wed, Thu, Fri, Sat, Sun
- weekdays (Mon-Fri)
- weekend (Sat-Sun)

Time:
- HH:MM (24-hour format)
- HH:MM:SS

Examples:
- "on Mon at 09:00"
- "on weekdays at 08:30"
- "on Sat at 10:00"
- "every week on Mon,Wed,Fri at 09:00"
```

---

## 3. Calendar Assignment

### Project Calendar

```typescript
const project = new ProjectModel({
    calendar : 'general',  // Calendar ID

    // Or inline calendar
    calendar : {
        id   : 'project-calendar',
        name : 'Project Hours',
        unspecifiedTimeIsWorking : false,
        intervals : [
            {
                recurrentStartDate : 'on weekdays at 09:00',
                recurrentEndDate   : 'on weekdays at 18:00',
                isWorking          : true
            }
        ]
    }
});

// Access effective calendar
const effectiveCalendar = project.effectiveCalendar;
```

### Resource Calendar

```typescript
// In data
{
    "resources" : {
        "rows" : [
            {
                "id"       : 1,
                "name"     : "John",
                "calendar" : "night-shift"
            },
            {
                "id"       : 2,
                "name"     : "Jane"
                // Uses project calendar (no override)
            }
        ]
    }
}

// Programmatisch
resource.calendar = 'night-shift';
resource.calendar = calendarRecord;

// Get effective calendar (resource or inherited from project)
const effectiveCalendar = resource.effectiveCalendar;
```

### Event Calendar

```typescript
// In data
{
    "events" : {
        "rows" : [
            {
                "id"       : 1,
                "name"     : "Special Task",
                "calendar" : "24-hour",
                "startDate" : "2024-03-23",
                "duration"  : 2
            }
        ]
    }
}

// Programmatisch
event.calendar = '24-hour';

// Get effective calendar
const effectiveCalendar = event.effectiveCalendar;
```

---

## 4. Calendar Calculations

### Working Time Check

```typescript
const calendar = project.effectiveCalendar;

// Check if specific time is working
const isWorking = calendar.isWorkingTime(
    new Date(2024, 2, 25, 10, 0),  // Monday 10:00
    new Date(2024, 2, 25, 11, 0)   // Monday 11:00
);

// Check single point in time
const isWorkingNow = calendar.isWorkingTime(new Date());
```

### Duration Calculation

```typescript
const calendar = project.effectiveCalendar;

// Calculate working duration between two dates
const workingMs = calendar.calculateDurationMs(
    new Date(2024, 2, 25, 9, 0),   // Start
    new Date(2024, 2, 26, 17, 0)   // End
);

const workingHours = workingMs / (1000 * 60 * 60);
```

### End Date Calculation

```typescript
const calendar = project.effectiveCalendar;

// Calculate end date given start and working duration
const endDate = calendar.calculateEndDate(
    new Date(2024, 2, 25, 9, 0),  // Start
    8 * 60 * 60 * 1000            // 8 working hours in ms
);
```

### Start Date Calculation

```typescript
const calendar = project.effectiveCalendar;

// Calculate start date given end and working duration
const startDate = calendar.calculateStartDate(
    new Date(2024, 2, 26, 17, 0),  // End
    8 * 60 * 60 * 1000             // 8 working hours in ms
);
```

---

## 5. NonWorkingTime Feature

Visualiseert non-working time van de **project calendar** over de hele timeline.

### Configuratie

```typescript
const scheduler = new SchedulerPro({
    features : {
        nonWorkingTime : {
            // Enabled by default, can disable
            disabled : false,

            // Max zoom level at which to show (for performance)
            maxTimeAxisUnit : 'week'
        }
    }
});

// Toggle at runtime
scheduler.features.nonWorkingTime.disabled = true;
```

### CSS Styling

```css
/* Non-working time overlay */
.b-sch-nonworkingtime {
    background-color: rgba(200, 200, 200, 0.3);
}

/* With pattern */
.b-sch-nonworkingtime {
    background: repeating-linear-gradient(
        45deg,
        rgba(200, 200, 200, 0.2),
        rgba(200, 200, 200, 0.2) 10px,
        rgba(180, 180, 180, 0.2) 10px,
        rgba(180, 180, 180, 0.2) 20px
    );
}
```

---

## 6. ResourceNonWorkingTime Feature

Visualiseert non-working time per **resource** (resource calendar).

### Configuratie

```typescript
const scheduler = new SchedulerPro({
    features : {
        // Disable project-level non-working time
        nonWorkingTime : false,

        // Enable resource-level non-working time
        resourceNonWorkingTime : {
            enableMouseEvents : true,  // Enable click/hover events
            maxTimeAxisUnit   : 'day'
        }
    }
});
```

### Mouse Events

```typescript
const scheduler = new SchedulerPro({
    features : {
        resourceNonWorkingTime : {
            enableMouseEvents : true
        }
    },

    listeners : {
        resourceNonWorkingTimeClick({ resourceTimeRangeRecord, resourceRecord }) {
            console.log('Clicked non-working time:', resourceTimeRangeRecord.name);
            console.log('For resource:', resourceRecord.name);
        },

        resourceNonWorkingTimeDblClick({ resourceTimeRangeRecord }) {
            // Open editor
        },

        resourceNonWorkingTimeContextMenu({ resourceTimeRangeRecord, domEvent }) {
            // Show context menu
            domEvent.preventDefault();
        }
    }
});
```

### Tooltip

```typescript
// Custom tooltip for resource non-working time
scheduler.rangeTooltip = new Tooltip({
    forSelector : '.b-sch-resource-non-working-time',
    getHtml({ event }) {
        const rangeRecord = scheduler.features.resourceNonWorkingTime
            .resolveResourceNonWorkingTimeInterval(event.target);

        const hours = DateHelper.as('hour', rangeRecord.duration, rangeRecord.durationUnit);

        return `
            <strong>${rangeRecord.name || 'Non-working time'}</strong><br>
            Duration: ${hours} hours
        `;
    }
});
```

### CSS Styling

```css
/* Resource non-working time blocks */
.b-sch-resource-non-working-time {
    background-color: rgba(150, 150, 150, 0.4);
    border-left: 3px solid #999;
}

/* Different styles per interval type */
.b-sch-resource-non-working-time.vacation {
    background-color: rgba(100, 200, 100, 0.3);
    border-left-color: #4CAF50;
}

.b-sch-resource-non-working-time.sick-leave {
    background-color: rgba(255, 150, 150, 0.3);
    border-left-color: #f44336;
}
```

---

## 7. EventNonWorkingTime Feature

Visualiseert non-working time binnen events.

### Configuratie

```typescript
const scheduler = new SchedulerPro({
    features : {
        eventNonWorkingTime : true
    }
});
```

---

## 8. CalendarEditor Widget

UI component voor het bewerken van calendars.

### Basis Gebruik

```typescript
import { CalendarEditor } from '@bryntum/schedulerpro';

const calendarEditor = new CalendarEditor({
    calendar   : project.effectiveCalendar,
    activeDate : new Date(),
    modal      : true,

    listeners : {
        save({ calendar }) {
            console.log('Calendar saved:', calendar.name);
        },
        cancel() {
            console.log('Edit cancelled');
        }
    }
});

calendarEditor.show();
```

### In Toolbar

```typescript
const scheduler = new SchedulerPro({
    tbar : [
        {
            text : 'Edit Calendar',
            icon : 'b-fa b-fa-calendar',
            onAction() {
                const editor = new CalendarEditor({
                    calendar   : scheduler.project.effectiveCalendar,
                    activeDate : scheduler.startDate,
                    modal      : true
                });
                editor.show();
            }
        }
    ]
});
```

### Met Resource Calendar Selectie

```typescript
// Column met calendar editor button
{
    type    : 'widget',
    text    : 'Calendar',
    width   : 180,
    widgets : [{
        type     : 'button',
        text     : 'Edit calendar',
        icon     : 'b-fa b-fa-calendar',
        onAction({ source }) {
            const resource = source.cellInfo.record;

            // Create calendar if resource doesn't have one
            let calendar = resource.calendar;
            if (!calendar) {
                const projectCalendar = scheduler.project.effectiveCalendar;
                calendar = projectCalendar.copy({
                    name : `${resource.name}'s Calendar`
                });
            }

            const editor = new CalendarEditor({
                calendar,
                activeDate : scheduler.startDate,
                modal      : true,
                listeners  : {
                    save({ calendar }) {
                        resource.calendar = calendar;
                    }
                }
            });
            editor.show();
        }
    }]
}
```

---

## 9. ResourceCalendar Column

Built-in column type voor calendar weergave.

```typescript
const scheduler = new SchedulerPro({
    columns : [
        { type : 'resourceInfo', text : 'Name' },
        {
            type  : 'resourceCalendar',
            text  : 'Calendar',
            width : 150
        }
    ]
});
```

### Custom Rendering

```typescript
{
    type       : 'resourceCalendar',
    text       : 'Shift',
    width      : 140,
    htmlEncode : false,
    renderer({ record }) {
        const calendar = record.calendar;

        if (calendar) {
            return StringHelper.encodeHtml(calendar.name);
        }

        return `<span class="inherited">${record.effectiveCalendar?.name} (inherited)</span>`;
    }
}
```

---

## 10. Time Axis Filtering

Filter de time axis om non-working time te verbergen.

```typescript
const scheduler = new SchedulerPro({
    tbar : [
        {
            type    : 'checkbox',
            text    : 'Hide non-working time',
            checked : false,
            onChange({ checked }) {
                if (checked) {
                    // Filter to only show working time ticks
                    scheduler.timeAxis.filter(tick =>
                        scheduler.project.calendar.isWorkingTime(tick.startDate, tick.endDate)
                    );
                }
                else {
                    // Restore all ticks
                    scheduler.timeAxis.clearFilters();
                }
            }
        }
    ]
});
```

---

## 11. Custom Calendar Creation

### Programmatic Calendar

```typescript
import { CalendarModel, CalendarIntervalModel } from '@bryntum/schedulerpro';

// Create calendar
const businessHours = new CalendarModel({
    id   : 'business',
    name : 'Business Hours',
    unspecifiedTimeIsWorking : false
});

// Add intervals
businessHours.addIntervals([
    // Monday - Friday 9:00-12:00
    {
        recurrentStartDate : 'on weekdays at 09:00',
        recurrentEndDate   : 'on weekdays at 12:00',
        isWorking          : true
    },
    // Monday - Friday 13:00-17:00 (lunch break)
    {
        recurrentStartDate : 'on weekdays at 13:00',
        recurrentEndDate   : 'on weekdays at 17:00',
        isWorking          : true
    }
]);

// Add to project
project.calendarManagerStore.add(businessHours);

// Assign to resource
resource.calendar = businessHours;
```

### Calendar met Holidays

```typescript
const calendar = new CalendarModel({
    id   : 'with-holidays',
    name : 'Standard with Holidays',
    unspecifiedTimeIsWorking : false,
    intervals : [
        // Regular working hours
        {
            recurrentStartDate : 'on weekdays at 09:00',
            recurrentEndDate   : 'on weekdays at 17:00',
            isWorking          : true
        },
        // Christmas (non-working)
        {
            startDate : '2024-12-25',
            endDate   : '2024-12-26',
            isWorking : false,
            name      : 'Christmas Day',
            cls       : 'holiday christmas'
        },
        // New Year (non-working)
        {
            startDate : '2025-01-01',
            endDate   : '2025-01-02',
            isWorking : false,
            name      : "New Year's Day",
            cls       : 'holiday newyear'
        }
    ]
});
```

### 24-Hour Calendar

```typescript
const twentyFourSeven = new CalendarModel({
    id   : '24-7',
    name : '24/7 Operations',
    unspecifiedTimeIsWorking : true  // Everything is working time
});
```

### Night Shift Calendar

```typescript
const nightShift = new CalendarModel({
    id   : 'night-shift',
    name : 'Night Shift (22:00 - 06:00)',
    unspecifiedTimeIsWorking : false,
    intervals : [
        // Night shift spans midnight
        {
            recurrentStartDate : 'on Sun at 22:00',
            recurrentEndDate   : 'on Mon at 06:00',
            isWorking          : true
        },
        {
            recurrentStartDate : 'on Mon at 22:00',
            recurrentEndDate   : 'on Tue at 06:00',
            isWorking          : true
        },
        // ... etc for each day
    ]
});
```

---

## 12. Priority Handling

Wanneer intervals overlappen, bepaalt priority welke wint.

```typescript
{
    intervals : [
        // Base working hours (lower priority)
        {
            recurrentStartDate : 'on weekdays at 09:00',
            recurrentEndDate   : 'on weekdays at 17:00',
            isWorking          : true,
            priority           : 1
        },
        // Lunch break (higher priority overrides)
        {
            recurrentStartDate : 'on weekdays at 12:00',
            recurrentEndDate   : 'on weekdays at 13:00',
            isWorking          : false,
            priority           : 2,
            name               : 'Lunch Break'
        },
        // Holiday (highest priority)
        {
            startDate : '2024-12-25',
            endDate   : '2024-12-26',
            isWorking : false,
            priority  : 10,
            name      : 'Christmas'
        }
    ]
}
```

---

## 13. Timezone Support

```typescript
const calendar = new CalendarModel({
    id   : 'timezone-aware',
    name : 'EU Timezone Calendar',
    intervals : [
        {
            recurrentStartDate : 'on weekdays at 09:00',
            recurrentEndDate   : 'on weekdays at 17:00',
            isWorking          : true,
            recurrentTimezone  : 'Europe/Amsterdam'
        }
    ]
});

// Ignore timezone conversion for specific calendar
calendar.ignoreTimeZone = true;
```

---

## TypeScript Interfaces

```typescript
interface CalendarModel {
    // Identity
    id: string | number;
    name: string;

    // Intervals
    intervals: CalendarIntervalModel[];
    readonly intervalStore: Store;

    // Configuration
    unspecifiedTimeIsWorking: boolean;
    treatInconsistentIntervals: 'Skip' | 'Throw';
    ignoreTimeZone: boolean;

    // Styling
    cls: string;
    iconCls: string;

    // Methods
    addInterval(interval: CalendarIntervalModelConfig): CalendarIntervalModel[];
    addIntervals(intervals: CalendarIntervalModelConfig[]): CalendarIntervalModel[];

    isWorkingTime(startDate: Date, endDate?: Date): boolean;
    calculateDurationMs(startDate: Date, endDate: Date): number;
    calculateEndDate(startDate: Date, durationMs: number): Date;
    calculateStartDate(endDate: Date, durationMs: number): Date;

    copy(config?: object): CalendarModel;
}

interface CalendarIntervalModel {
    // Identity
    id: string | number;
    name: string;

    // Dates
    startDate: Date;
    endDate: Date;
    recurrentStartDate: string;
    recurrentEndDate: string;
    recurrentTimezone: string;

    // Working status
    isWorking: boolean;

    // Priority
    priority: number;

    // Styling
    cls: string;
    iconCls: string;
}

interface NonWorkingTimeConfig {
    disabled?: boolean;
    maxTimeAxisUnit?: string;
}

interface ResourceNonWorkingTimeConfig {
    disabled?: boolean;
    enableMouseEvents?: boolean;
    maxTimeAxisUnit?: string;
}
```

---

## Complete Example

```typescript
import {
    SchedulerPro,
    ProjectModel,
    CalendarEditor,
    Tooltip,
    DateHelper,
    Toast
} from '@bryntum/schedulerpro';

const project = new ProjectModel({
    autoLoad : true,
    loadUrl  : 'data/data.json',

    // Project-level calendar
    calendar : {
        id   : 'project-calendar',
        name : 'Standard Business Hours',
        unspecifiedTimeIsWorking : false,
        intervals : [
            // Working hours
            {
                recurrentStartDate : 'on weekdays at 09:00',
                recurrentEndDate   : 'on weekdays at 12:00',
                isWorking          : true
            },
            {
                recurrentStartDate : 'on weekdays at 13:00',
                recurrentEndDate   : 'on weekdays at 17:00',
                isWorking          : true
            },
            // Christmas holiday
            {
                startDate : '2024-12-25',
                endDate   : '2024-12-26',
                isWorking : false,
                name      : 'Christmas Day',
                cls       : 'holiday'
            }
        ]
    }
});

const scheduler = new SchedulerPro({
    appendTo : 'container',
    project,

    startDate  : new Date(2024, 2, 23, 7, 0),
    endDate    : new Date(2024, 2, 23, 23, 0),
    rowHeight  : 70,
    eventStyle : 'outlined',

    viewPreset : {
        tickWidth      : 20,
        shiftIncrement : 1,
        shiftUnit      : 'day',
        headers        : [
            { unit : 'day', dateFormat : 'ddd DD/MM' },
            { unit : 'hour', dateFormat : 'HH' }
        ]
    },

    features : {
        // Disable project-level (we use resource-level)
        nonWorkingTime : false,

        // Enable resource-specific non-working time
        resourceNonWorkingTime : {
            enableMouseEvents : true
        },

        timeRanges : {
            showCurrentTimeLine : true
        }
    },

    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Worker',
            showEventCount : false
        },
        {
            type  : 'resourceCalendar',
            text  : 'Shift',
            width : 140
        },
        {
            type    : 'widget',
            text    : '',
            width   : 50,
            widgets : [{
                type : 'button',
                icon : 'b-fa b-fa-edit',
                cls  : 'b-transparent',
                onAction({ source }) {
                    const resource = source.cellInfo.record;
                    let calendar = resource.calendar;

                    if (!calendar) {
                        calendar = project.effectiveCalendar.copy({
                            name : `${resource.name}'s Calendar`
                        });
                    }

                    const editor = new CalendarEditor({
                        calendar,
                        activeDate : scheduler.startDate,
                        modal      : true,
                        listeners  : {
                            save({ calendar }) {
                                resource.calendar = calendar;
                                Toast.show(`Calendar updated for ${resource.name}`);
                            }
                        }
                    });
                    editor.show();
                }
            }]
        }
    ],

    listeners : {
        paint() {
            // Tooltip for non-working time blocks
            this.rangeTooltip = new Tooltip({
                forSelector : '.b-sch-resource-non-working-time',
                getHtml     : ({ event }) => {
                    const range = this.features.resourceNonWorkingTime
                        .resolveResourceNonWorkingTimeInterval(event.target);
                    const hours = DateHelper.as('hour', range.duration, range.durationUnit);

                    return `
                        <strong>${range.name || 'Non-working time'}</strong><br>
                        Duration: ${hours} hour(s)
                    `;
                }
            });
        },

        resourceNonWorkingTimeClick({ resourceTimeRangeRecord, resourceRecord }) {
            Toast.show(`${resourceRecord.name}: ${resourceTimeRangeRecord.name || 'Non-working time'}`);
        },

        destroy() {
            this.rangeTooltip?.destroy();
        }
    },

    tbar : [
        {
            type  : 'buttongroup',
            items : [
                {
                    icon     : 'b-fa b-fa-chevron-left',
                    onAction : () => scheduler.shiftPrevious()
                },
                {
                    text     : 'Today',
                    onAction : () => {
                        const today = DateHelper.clearTime(new Date());
                        today.setHours(7);
                        scheduler.startDate = today;
                    }
                },
                {
                    icon     : 'b-fa b-fa-chevron-right',
                    onAction : () => scheduler.shiftNext()
                }
            ]
        },
        {
            type    : 'checkbox',
            text    : 'Show non-working time',
            checked : true,
            onChange({ checked }) {
                scheduler.features.resourceNonWorkingTime.disabled = !checked;
            }
        },
        '->',
        {
            text : 'Edit Project Calendar',
            icon : 'b-fa b-fa-calendar',
            onAction() {
                const editor = new CalendarEditor({
                    calendar   : project.effectiveCalendar,
                    activeDate : scheduler.startDate,
                    modal      : true
                });
                editor.show();
            }
        }
    ]
});
```

### CSS

```css
/* Non-working time styling */
.b-sch-resource-non-working-time {
    background-color: rgba(150, 150, 150, 0.3);
    border-left: 2px solid #999;
}

/* Holiday styling */
.b-sch-resource-non-working-time.holiday {
    background-color: rgba(255, 200, 200, 0.4);
    border-left-color: #f44336;
}

/* Current time line */
.b-sch-current-time {
    border-left: 2px dashed #f44336;
}

/* Inherited calendar indicator */
.inherited {
    color: #888;
    font-style: italic;
}
```

---

## Referenties

- **CalendarModel**: `schedulerpro.d.ts:310369`
- **CalendarIntervalModel**: `schedulerpro.d.ts:310156`
- **NonWorkingTime**: `schedulerpro.d.ts:189411`
- **ResourceNonWorkingTime**: `schedulerpro.d.ts:308528`
- **Example non-working-time**: `examples/non-working-time/app.module.js`
- **Example resource-non-working-time**: `examples/resource-non-working-time/app.module.js`
- **Example calendar-editor**: `examples/calendar-editor/app.module.js`

---

*Laatst bijgewerkt: December 2024*
