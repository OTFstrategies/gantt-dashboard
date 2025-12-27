# SchedulerPro Deep Dive: Features Catalog

## Overview

SchedulerPro is a feature-rich scheduling component. Features are modular capabilities that can be enabled, disabled, and configured independently. This document catalogs all available features organized by category.

## Feature Configuration Pattern

All features follow a consistent configuration pattern:

```typescript
const scheduler = new SchedulerPro({
    features: {
        // Boolean: Enable with defaults
        eventDrag: true,

        // Boolean: Disable
        eventResize: false,

        // Object: Enable with custom config
        eventTooltip: {
            template: ({ eventRecord }) => eventRecord.name
        },

        // String 'true'/'false': Alternative syntax
        dependencies: 'true'
    }
});
```

## Feature Categories

### Event Interaction Features

| Feature | Description | Default |
|---------|-------------|---------|
| `eventDrag` | Drag events to reschedule | Enabled |
| `eventResize` | Resize events to change duration | Enabled |
| `eventDragCreate` | Create events by dragging on schedule | Enabled |
| `eventDragSelect` | Select events by dragging marquee | Disabled |
| `eventCopyPaste` | Copy/paste events | Enabled |
| `eventBuffer` | Visual buffer zones around events | Disabled |

### Event Editing Features

| Feature | Description | Default |
|---------|-------------|---------|
| `eventEdit` | Full event editor popup | Enabled |
| `simpleEventEdit` | Simple inline event name editing | Disabled |
| `taskEdit` | SchedulerPro task editor | Enabled |

### Event Display Features

| Feature | Description | Default |
|---------|-------------|---------|
| `eventTooltip` | Tooltip on event hover | Enabled |
| `labels` | Text labels on events | Disabled |
| `percentBar` | Progress bar on events | Disabled |
| `stickyEvents` | Keep events visible when scrolling | Disabled |
| `nestedEvents` | Events within events | Disabled |
| `eventSegments` | Segmented events | Disabled |

### Menu Features

| Feature | Description | Default |
|---------|-------------|---------|
| `eventMenu` | Right-click menu on events | Enabled |
| `scheduleMenu` | Right-click menu on schedule | Enabled |
| `resourceMenu` | Right-click menu on resources | Enabled |
| `timeAxisHeaderMenu` | Right-click menu on time axis | Enabled |
| `headerMenu` | Right-click menu on column headers | Enabled |
| `cellMenu` | Right-click menu on cells | Enabled |
| `dependencyMenu` | Right-click menu on dependencies | Enabled |

### Dependency Features

| Feature | Description | Default |
|---------|-------------|---------|
| `dependencies` | Display/create dependencies | Enabled |
| `dependencyEdit` | Edit dependency properties | Enabled |

### Time Range Features

| Feature | Description | Default |
|---------|-------------|---------|
| `timeRanges` | Global time range highlights | Disabled |
| `resourceTimeRanges` | Per-resource time ranges | Disabled |
| `nonWorkingTime` | Highlight non-working time | Disabled |
| `resourceNonWorkingTime` | Per-resource non-working time | Disabled |
| `eventNonWorkingTime` | Event-specific non-working time | Disabled |
| `timeSpanHighlight` | Highlight time spans on hover | Disabled |
| `timeSelection` | Select time ranges | Disabled |

### Tooltip Features

| Feature | Description | Default |
|---------|-------------|---------|
| `scheduleTooltip` | Tooltip on empty schedule | Disabled |
| `cellTooltip` | Tooltip on cells | Disabled |

### Grid Features

| Feature | Description | Default |
|---------|-------------|---------|
| `cellEdit` | Edit cells inline | Enabled |
| `columnResize` | Resize columns | Enabled |
| `columnReorder` | Reorder columns | Enabled |
| `columnPicker` | Column visibility picker | Enabled |
| `columnRename` | Rename column headers | Disabled |
| `columnAutoWidth` | Auto-fit column widths | Disabled |
| `columnLines` | Vertical column lines | Enabled |
| `columnDragToolbar` | Toolbar for column drag | Disabled |
| `pinColumns` | Pin columns left/right | Disabled |
| `mergeCells` | Merge matching cells | Disabled |
| `stickyCells` | Keep cells visible when scrolling | Disabled |

### Row Features

| Feature | Description | Default |
|---------|-------------|---------|
| `rowReorder` | Drag to reorder rows | Disabled |
| `rowResize` | Resize row heights | Disabled |
| `rowExpander` | Expand rows for details | Disabled |
| `rowEdit` | Edit row in popup | Disabled |
| `rowCopyPaste` | Copy/paste rows | Disabled |
| `lockRows` | Lock rows from editing | Disabled |

### Resource Features

| Feature | Description | Default |
|---------|-------------|---------|
| `resourceEdit` | Edit resource in popup | Disabled |

### Filtering & Sorting

| Feature | Description | Default |
|---------|-------------|---------|
| `filter` | Column filtering | Enabled |
| `filterBar` | Filter bar below headers | Disabled |
| `eventFilter` | Filter events | Disabled |
| `aiFilter` | AI-powered filtering | Disabled |
| `sort` | Column sorting | Enabled |
| `search` | Search in grid | Disabled |
| `quickFind` | Quick find field | Disabled |

### Grouping & Summary

| Feature | Description | Default |
|---------|-------------|---------|
| `group` | Group rows | Disabled |
| `groupSummary` | Summary rows per group | Disabled |
| `summary` | Summary row at bottom | Disabled |
| `treeSummary` | Summary in tree structure | Disabled |

### Tree Features

| Feature | Description | Default |
|---------|-------------|---------|
| `tree` | Tree structure for resources | Disabled |
| `treeGroup` | Group as tree | Disabled |

### Navigation Features

| Feature | Description | Default |
|---------|-------------|---------|
| `pan` | Pan the schedule by dragging | Disabled |
| `headerZoom` | Zoom via header interaction | Disabled |
| `scrollButtons` | Scroll navigation buttons | Disabled |
| `regionResize` | Resize scheduler regions | Enabled |
| `split` | Split scheduler view | Disabled |

### Export Features

| Feature | Description | Default |
|---------|-------------|---------|
| `pdfExport` | Export to PDF | Disabled |
| `excelExporter` | Export to Excel | Disabled |
| `print` | Print scheduler | Disabled |

### Other Features

| Feature | Description | Default |
|---------|-------------|---------|
| `calendarHighlight` | Highlight calendar events | Disabled |
| `cellCopyPaste` | Copy/paste cells | Enabled |
| `charts` | Inline charts | Disabled |
| `fileDrop` | Drag/drop files | Disabled |
| `fillHandle` | Fill cells by dragging | Disabled |
| `scheduleContext` | Context info for schedule | Disabled |
| `stripe` | Alternate row stripes | Disabled |
| `versions` | Version history | Disabled |

## Key Feature Details

### EventDrag

```typescript
type EventDragConfig = {
    // Allow dragging
    disabled?: boolean

    // Allow moving between resources
    constrainDragToResource?: boolean

    // Time snapping
    showExactDropPosition?: boolean

    // Drag all selected events together
    unifiedDrag?: boolean

    // Tooltip during drag
    showTooltip?: boolean

    // Validation function
    validatorFn?: (context) => boolean | { valid: boolean, message?: string }

    // Drag proxy settings
    dragHelperConfig?: object
}

features: {
    eventDrag: {
        constrainDragToResource: false,
        unifiedDrag: true,
        validatorFn({ eventRecords, newResource }) {
            // Only allow drag to same department
            return eventRecords.every(e =>
                e.resource.department === newResource.department
            );
        }
    }
}
```

### EventResize

```typescript
type EventResizeConfig = {
    disabled?: boolean

    // Which ends can be resized
    leftHandle?: boolean
    rightHandle?: boolean

    // Show tooltip during resize
    showTooltip?: boolean

    // Minimum duration
    minDuration?: number
    minDurationUnit?: string

    // Validation
    validatorFn?: (context) => boolean | { valid: boolean, message?: string }
}

features: {
    eventResize: {
        leftHandle: true,
        rightHandle: true,
        minDuration: 30,
        minDurationUnit: 'minute'
    }
}
```

### EventDragCreate

```typescript
type EventDragCreateConfig = {
    disabled?: boolean

    // Show tooltip during creation
    showTooltip?: boolean

    // Validation
    validatorFn?: (context) => boolean | { valid: boolean, message?: string }
}

features: {
    eventDragCreate: {
        showTooltip: true,
        validatorFn({ resourceRecord, startDate }) {
            // Don't allow creation on weekends
            const day = startDate.getDay();
            return day !== 0 && day !== 6;
        }
    }
}
```

### Labels

```typescript
type LabelsConfig = {
    // Label positions
    top?: LabelConfig
    bottom?: LabelConfig
    left?: LabelConfig
    right?: LabelConfig

    // Label config
    labelCls?: string
}

type LabelConfig = {
    field?: string          // Field name to display
    renderer?: Function     // Custom renderer
    editor?: FieldConfig    // Enable editing
}

features: {
    labels: {
        top: {
            field: 'name',
            renderer: ({ eventRecord }) => eventRecord.name.toUpperCase()
        },
        bottom: {
            renderer: ({ eventRecord }) => `${eventRecord.duration}h`
        }
    }
}
```

### PercentBar

```typescript
type PercentBarConfig = {
    disabled?: boolean
    allowResize?: boolean  // Allow drag to change percent
}

features: {
    percentBar: {
        allowResize: true
    }
}
```

### NestedEvents

```typescript
type NestedEventsConfig = {
    disabled?: boolean

    // Bar margin within parent
    barMargin?: number

    // Event height
    eventHeight?: number
}

features: {
    nestedEvents: {
        barMargin: 2,
        eventHeight: 30
    }
}
```

### TimeRanges

```typescript
type TimeRangesConfig = {
    disabled?: boolean
    showCurrentTimeLine?: boolean
    showHeaderElements?: boolean
    enableResizing?: boolean
    showTooltip?: boolean
    currentDateFormat?: string
}

features: {
    timeRanges: {
        showCurrentTimeLine: true,
        enableResizing: true,
        showTooltip: true
    }
}
```

### NonWorkingTime

```typescript
type NonWorkingTimeConfig = {
    disabled?: boolean
    highlightWeekends?: boolean  // Highlight Saturday/Sunday
    maxTimeAxisUnit?: string     // Max unit to show highlights
}

features: {
    nonWorkingTime: {
        highlightWeekends: true
    }
}
```

### Dependencies

```typescript
type DependenciesConfig = {
    disabled?: boolean

    // Allow creating dependencies by drag
    allowCreate?: boolean

    // Show tooltip on hover
    showTooltip?: boolean

    // Highlight related events on click
    highlightDependenciesOnEventHover?: boolean

    // Line style
    radius?: number
    markerSize?: number
}

features: {
    dependencies: {
        allowCreate: true,
        showTooltip: true,
        highlightDependenciesOnEventHover: true,
        radius: 10
    }
}
```

### Pan

```typescript
type PanConfig = {
    disabled?: boolean
    vertical?: boolean    // Allow vertical pan
    horizontal?: boolean  // Allow horizontal pan
}

features: {
    pan: {
        horizontal: true,
        vertical: false
    }
}
```

### Filter

```typescript
type FilterConfig = {
    disabled?: boolean
    prioritizeColumns?: boolean
}

features: {
    filter: true
}
```

### FilterBar

```typescript
type FilterBarConfig = {
    disabled?: boolean
    compactMode?: boolean
    prioritizeColumns?: boolean
}

features: {
    filterBar: {
        compactMode: true
    }
}
```

### Group

```typescript
type GroupConfig = {
    disabled?: boolean
    field?: string  // Initial grouping field
}

features: {
    group: {
        field: 'department'
    }
}
```

### Tree

```typescript
type TreeConfig = {
    disabled?: boolean
    expandOnCellClick?: boolean
}

features: {
    tree: {
        expandOnCellClick: true
    }
}
```

### PdfExport

```typescript
type PdfExportConfig = {
    disabled?: boolean
    exportServer?: string
    fileFormat?: 'pdf' | 'png'
    orientation?: 'portrait' | 'landscape'
    paperFormat?: 'A4' | 'A3' | 'Letter' | 'Legal'
}

features: {
    pdfExport: {
        exportServer: 'https://your-server.com/export',
        orientation: 'landscape',
        paperFormat: 'A4'
    }
}
```

### ExcelExporter

```typescript
type ExcelExporterConfig = {
    disabled?: boolean
    exporterClass?: typeof ExcelExporter
}

features: {
    excelExporter: true
}
```

## Feature Access at Runtime

```typescript
// Access feature instance
const eventDragFeature = scheduler.features.eventDrag;

// Enable/disable at runtime
eventDragFeature.disabled = true;

// Access feature config
console.log(eventDragFeature.constrainDragToResource);

// Modify feature config
eventDragFeature.unifiedDrag = true;
```

## Feature Events

Most features fire events that can be listened to:

```typescript
scheduler.on({
    // EventDrag events
    beforeEventDrag({ eventRecords }) { },
    eventDrag({ context }) { },
    afterEventDrop({ eventRecords }) { },

    // EventResize events
    beforeEventResize({ eventRecord }) { },
    eventResizeEnd({ eventRecord }) { },

    // Dependencies events
    beforeDependencyAdd({ data }) { },
    dependencyClick({ dependency }) { },

    // TimeRanges events
    timeRangeHeaderClick({ timeRangeRecord }) { },

    // And many more...
});
```

## Custom Features

Create custom features by extending InstancePlugin:

```typescript
import { InstancePlugin } from '@bryntum/schedulerpro';

class MyCustomFeature extends InstancePlugin {
    static $name = 'myFeature';

    construct(scheduler, config) {
        super.construct(scheduler, config);
        // Initialize feature
    }

    doDestroy() {
        // Cleanup
        super.doDestroy();
    }
}

// Register feature
SchedulerPro.featureClass['myFeature'] = MyCustomFeature;

// Use feature
const scheduler = new SchedulerPro({
    features: {
        myFeature: {
            // config
        }
    }
});
```

## Feature Combinations

Some features work together:

```typescript
// Dependencies + DependencyEdit
features: {
    dependencies: true,
    dependencyEdit: true  // Edit dialog for dependencies
}

// Tree + TreeGroup
features: {
    tree: true,
    treeGroup: {
        field: 'department'
    }
}

// TimeRanges + ResourceTimeRanges
features: {
    timeRanges: true,      // Global ranges
    resourceTimeRanges: true  // Per-resource ranges
}

// EventDrag + EventDragSelect
features: {
    eventDrag: true,
    eventDragSelect: true  // Marquee selection
}
```

## Performance Considerations

1. **Disable unused features**: Each feature has overhead. Disable those you don't need.

2. **Feature loading**: Features are loaded when the scheduler initializes. Heavy features like `pdfExport` add to initial load time.

3. **Event handling**: Features with many event listeners (like drag features) can impact performance with many events.

4. **Tooltips**: Tooltip features trigger on hover which can be expensive with many elements.

## Integration Notes

1. **Feature Order**: Features are initialized in a specific order. Some depend on others.

2. **Feature Conflicts**: Some features are mutually exclusive (e.g., `simpleEventEdit` vs `eventEdit`).

3. **Grid vs Scheduler Features**: Grid features work on the locked grid portion, Scheduler features on the schedule area.

4. **Pro Features**: Some features are only available in SchedulerPro (not basic Scheduler).
