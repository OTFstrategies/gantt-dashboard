# Bryntum What's New - Complete Official Documentation

> **Bron**: Officiële Bryntum Gantt v7.1.0 documentatie - `docs/data/Gantt/guides/whats-new/`

---

## Version 6.3.0

### New Chart Module

Bryntum products now ship with a `Chart` module for Chart.js integration:

```javascript
// Vanilla JS
import 'PATH_TO_DISTRIBUTION_FOLDER/build/thin/chart.module.thin.js';

// React
import '@bryntum/chart-thin';
import { BryntumChart } from '@bryntum/chart-react-thin';

// Angular
import '@bryntum/chart-thin';
import { BryntumChart } from '@bryntum/chart-angular-thin';

// Vue 3
import '@bryntum/chart-thin';
import { BryntumChart } from '@bryntum/chart-vue-3-thin';
```

### Streamed PDF Export

PdfExport feature now supports WebSocket streaming for large datasets:
- Improved performance
- Reduced memory usage
- Better handling of large exports

### Manual FixedEffort Tasks

```javascript
class MyTask extends TaskModel {
    static preserveSEDFieldsIfManual = true;
}
```

---

## Version 6.2.0

### Task Highlighting API

```javascript
// Highlight tasks and scroll into view
gantt.highlightTasks([1, 2, 3]);

// Highlight without scrolling, manual unhighlight
gantt.highlightTasks(taskRecord, false, false);
setTimeout(() => gantt.unhighlightTasks(taskRecord), 5000);
```

### Project Edit Feature

```javascript
new Gantt({
    features: {
        projectEdit: true
    }
});

// Open the editor
gantt.editProject(gantt.project);
// Or simply
gantt.editProject();
```

### S-Curve Chart Feature

```javascript
new Gantt({
    features: {
        timelineChart: true
    }
});
```

### Charts Feature

```javascript
new Gantt({
    features: { charts: true }
});
```

### ChartColumn

```javascript
columns: [{
    type: 'chart',
    chart: {
        chartType: 'line',
        series: [
            { field: 'price' },
            { field: 'changePct' }
        ],
        labels: { field: 'symbol' }
    }
}]
```

### SparklineColumn

```javascript
columns: [{
    type: 'sparkline',
    field: 'monthlySales'  // Array of numbers
}]
```

### ResourceHistogram Filters

```javascript
new ResourceHistogram({
    respectStoreFilters: true,
    *assignmentFilterFn(assignment, allocationInfo) {
        const task = yield assignment.$.event;
        if (task) {
            const type = yield* allocationInfo.readField(task, 'type');
            return type === 'Meeting';
        }
    }
});
```

---

## Version 6.1.0

### Unscheduled Tasks Display

```javascript
new Gantt({
    showUnscheduledTasks: true  // Default
});
```

Unscheduled tasks (no startDate or duration+endDate) are rendered as icons.

### Postponed Conflict Resolution

```javascript
new Gantt({
    project: {
        allowPostponedConflicts: true,
        autoPostponedConflicts: true
    }
});
```

### Multi-Task Dragging

```javascript
new Gantt({
    features: {
        taskDrag: {
            dragAllSelectedTasks: true
        }
    }
});
```

### Elapsed Duration Units

| Unit | Description |
|------|-------------|
| `eminute` | Elapsed minute (60 seconds) |
| `ehour` | Elapsed hour (60 minutes) |
| `eday` | Elapsed day (24 hours) |
| `eweek` | Elapsed week (7 days) |
| `emonth` | Elapsed month (30 days) |
| `equarter` | Elapsed quarter (3 months) |
| `eyear` | Elapsed year (12 months) |

```javascript
new TaskModel({
    startDate: '2024-09-10',
    endDate: '2024-09-17',
    duration: 7,
    durationUnit: 'ed'  // elapsed days
});
```

Elapsed durations ignore non-working time (24/7 scheduling).

### Thin Trial NPM Packages

Trial versions of thin NPM packages available for multi-product evaluation.

### is{{ClassName}} Property

```javascript
taskRenderer({ taskRecord }) {
    if (taskRecord.isEventSegmentModel) {
        // Render segment
    } else {
        // Render task
    }
}
```

### Segment Model Support

```javascript
class MySegment extends EventSegmentModel {
    static fields = [
        { name: 'responsiblePerson' }
    ];
}

new Gantt({
    project: {
        segmentModelClass: MySegment
    }
});
```

### StartDateField/EndDateField keepTime Modes

- `StartDateField`: `keepTime: 'sod'` (start of day)
- `EndDateField`: `keepTime: 'eod'` (end of day)

### EventSegments roundedSplit

```javascript
features: {
    eventSegments: {
        roundedSplit: false  // Exact clicked date
    }
}
```

### Duration Conversion Hooks

```javascript
class MyTaskModel extends TaskModel {
    *convertDurationGen(duration, fromUnit, toUnit) {
        const converter = yield this.$.effectiveCalendar;
        return yield* converter.$convertDuration(duration, fromUnit, toUnit);
    }

    canConvertDuration(duration, fromUnit, toUnit) {
        const calendar = this.effectiveCalendar;
        return typeof duration === 'number' &&
            calendar?.unitsInMs?.[fromUnit] && calendar.unitsInMs[toUnit];
    }
}
```

---

## Version 6.0.0

### Calendar Editor Widget

```javascript
const editor = new CalendarEditor({
    autoShow: true,
    calendar: calendarToEdit,
    modal: true,
    autoClose: true
});
```

### CalendarField with Editor

```javascript
new CalendarField({
    value: task1.calendar,
    calendarConsumerRecord: task1,
    calendarEditor: {
        centered: true
    }
});

// Disable editor
new CalendarField({
    value: task1.calendar,
    calendarEditor: false
});
```

### Project statusDate Field

```javascript
project: {
    statusDate: new Date(2024, 5, 15)
}
```

Used by ProgressLine and PlannedPercentDoneColumn.

### PlannedPercentDoneColumn

```javascript
columns: [
    { type: 'plannedpercentdone' }
]
```

Calculation:
- If baseline end < statusDate → 100%
- If baseline start > statusDate → 0%
- Otherwise: (statusDate - baselineStart) / (baselineEnd - baselineStart)

### Started Tasks Scheduling

```javascript
project: {
    startedTaskScheduling: 'Manual'  // or 'Auto' (default)
}
```

Started tasks (percentDone > 0) treated as manually scheduled.

### ResourceHistogram DOM Hooks

```javascript
new ResourceHistogram({
    getBarDOMConfig(series, domConfig) {
        const xMargin = 0.1 * domConfig.width;
        domConfig.x += xMargin;
        domConfig.width -= 2 * xMargin;
        return domConfig;
    },
    getBarTextDOMConfig(domConfig, datum, index) {
        domConfig.y = `${100 * (1 - datum.effort / this.topValue)}%`;
        domConfig.style = 'writing-mode: lr';
        return domConfig;
    }
});
```

### CellEditing scrollAction

```javascript
features: {
    cellEdit: {
        scrollAction: 'cancel'  // or 'complete' or null
    }
}
```

### FixedEffort Effort Normalization

```javascript
class MyTask extends TaskModel {
    static normalizeEffortIfUnassigned = false;
}
```

### Recurrent Dates Timezone

```json
{
    "intervals": [{
        "recurrentStartDate": "on Sat",
        "recurrentEndDate": "on Mon",
        "recurrentDatesTimeZone": "+06:00",
        "isWorking": false
    }]
}
```

### maxCriticalPathsCount

```javascript
project: {
    maxCriticalPathsCount: 100  // Limit critical paths collection
}
```

---

## Feature Timeline

| Version | Key Features |
|---------|--------------|
| **6.3.0** | Chart module, Streamed PDF, Manual FixedEffort |
| **6.2.0** | Task highlighting, Project editor, S-Curve, Charts feature |
| **6.1.0** | Unscheduled tasks, Conflict postpone, Multi-drag, Elapsed units |
| **6.0.0** | Calendar editor, statusDate, PlannedPercentDone, Started scheduling |

---

## Quick Reference: New Features by Category

### UI Features
- Calendar Editor Widget
- Project Editor
- Task Highlighting
- S-Curve Chart
- Charts Feature
- SparklineColumn
- Unscheduled Tasks Display

### Data Management
- statusDate Field
- maxCriticalPathsCount
- startedTaskScheduling
- Conflict Postponing

### Scheduling
- Elapsed Duration Units
- FixedEffort Normalization
- Duration Conversion Hooks
- Recurrent Dates Timezone

### Performance
- Streamed PDF Export
- Chart Module
- ResourceHistogram Filters

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
