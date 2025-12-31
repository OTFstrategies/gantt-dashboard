# SchedulerPro Implementation: Features Overview

## Overview

SchedulerPro provides a comprehensive set of features that extend and enhance the base scheduling functionality. Features are modular plugins that can be enabled, disabled, and configured independently.

## Feature Categories

### Scheduling Core Features

| Feature | Description | Default |
|---------|-------------|---------|
| `dependencies` | Draw dependency lines between events | Enabled |
| `dependencyEdit` | Edit dependencies via popup | Enabled |
| `dependencyMenu` | Context menu for dependencies | Disabled |
| `nestedEvents` | Child events inside parent events | Disabled |
| `eventSegments` | Split events into segments | Disabled |
| `eventSegmentDrag` | Drag event segments | Enabled (with segments) |
| `eventSegmentResize` | Resize event segments | Enabled (with segments) |
| `percentBar` | Show progress percentage on events | Disabled |
| `taskEdit` | Rich tabbed editor for events | Enabled |

### Event Interaction Features

| Feature | Description | Default |
|---------|-------------|---------|
| `eventDrag` | Drag events to reschedule | Enabled |
| `eventDragCreate` | Create events by dragging | Enabled |
| `eventDragSelect` | Marquee selection of events | Disabled |
| `eventResize` | Resize event duration | Enabled |
| `eventCopyPaste` | Copy/paste events | Enabled |
| `eventMenu` | Right-click menu on events | Enabled |
| `eventTooltip` | Tooltip on event hover | Enabled |
| `eventFilter` | Filter visible events | Disabled |
| `simpleEventEdit` | Simple inline editor | Disabled |
| `eventBuffer` | Buffer zones before/after events | Disabled |

### Time & Calendar Features

| Feature | Description | Default |
|---------|-------------|---------|
| `timeRanges` | Global time range highlights | Enabled |
| `resourceTimeRanges` | Per-resource time ranges | Disabled |
| `nonWorkingTime` | Highlight non-working time | Enabled |
| `resourceNonWorkingTime` | Per-resource non-working time | Disabled |
| `eventNonWorkingTime` | Per-event non-working time | Disabled |
| `calendarHighlight` | Highlight calendar intervals | Disabled |
| `timeSpanHighlight` | Dynamic time span highlighting | Disabled |
| `timeSelection` | Select time ranges | Disabled |

### Grid/Column Features

| Feature | Description | Default |
|---------|-------------|---------|
| `columnLines` | Vertical lines between columns | Enabled |
| `columnAutoWidth` | Auto-size columns | Disabled |
| `columnDragToolbar` | Drag columns to toolbar | Disabled |
| `columnPicker` | Show/hide columns UI | Enabled |
| `columnRename` | Rename columns inline | Disabled |
| `columnReorder` | Drag to reorder columns | Enabled |
| `columnResize` | Resize column width | Enabled |
| `pinColumns` | Pin columns left/right | Disabled |
| `stickyCells` | Keep cells visible when scrolling | Disabled |
| `mergeCells` | Merge adjacent cells | Disabled |

### Row Features

| Feature | Description | Default |
|---------|-------------|---------|
| `rowReorder` | Drag to reorder rows | Disabled |
| `rowResize` | Resize row height | Disabled |
| `rowExpander` | Expand rows for details | Disabled |
| `rowCopyPaste` | Copy/paste rows | Disabled |
| `rowEdit` | Edit rows inline | Disabled |
| `lockRows` | Lock rows in place | Disabled |
| `stripe` | Alternate row colors | Enabled |

### Data Features

| Feature | Description | Default |
|---------|-------------|---------|
| `filter` | Filter store data | Enabled |
| `filterBar` | Filter bar in header | Disabled |
| `sort` | Sort by columns | Enabled |
| `group` | Group rows | Enabled |
| `groupSummary` | Summary rows in groups | Disabled |
| `tree` | Tree structure support | Enabled |
| `treeGroup` | Tree with grouping | Disabled |
| `treeSummary` | Tree with summaries | Disabled |
| `search` | Search/find in grid | Enabled |
| `quickFind` | Quick find popup | Disabled |

### Cell Features

| Feature | Description | Default |
|---------|-------------|---------|
| `cellEdit` | Edit cells inline | Enabled |
| `cellMenu` | Right-click menu on cells | Enabled |
| `cellTooltip` | Tooltip on cells | Disabled |
| `cellCopyPaste` | Copy/paste cells | Enabled |
| `fillHandle` | Fill cell values | Disabled |

### Menu Features

| Feature | Description | Default |
|---------|-------------|---------|
| `headerMenu` | Column header menu | Enabled |
| `scheduleMenu` | Right-click on schedule | Enabled |
| `scheduleContext` | Schedule context info | Disabled |
| `resourceMenu` | Resource row menu | Disabled |
| `resourceEdit` | Edit resource popup | Disabled |
| `timeAxisHeaderMenu` | Time header menu | Enabled |

### Navigation Features

| Feature | Description | Default |
|---------|-------------|---------|
| `pan` | Pan by dragging | Disabled |
| `headerZoom` | Zoom via header drag | Disabled |
| `regionResize` | Resize regions (locked/normal) | Enabled |
| `scrollButtons` | Scroll navigation buttons | Disabled |
| `split` | Split view | Disabled |
| `stickyEvents` | Keep events visible on scroll | Enabled |

### Export Features

| Feature | Description | Default |
|---------|-------------|---------|
| `pdfExport` | Export to PDF | Disabled |
| `excelExporter` | Export to Excel | Disabled |
| `print` | Print schedule | Disabled |

### Utility Features

| Feature | Description | Default |
|---------|-------------|---------|
| `summary` | Summary row | Disabled |
| `versions` | Version history | Disabled |
| `labels` | Event labels | Disabled |
| `fileDrop` | File drop handling | Disabled |
| `charts` | Inline charts | Disabled |
| `aiFilter` | AI-powered filtering | Disabled |

## Feature Configuration

### Enable/Disable

```javascript
const scheduler = new SchedulerPro({
    features: {
        // Enable with defaults
        dependencies: true,

        // Disable
        eventTooltip: false,

        // Configure
        eventDrag: {
            constrainDragToResource: true,
            showExactDropPosition: true
        }
    }
});
```

### Runtime Toggle

```javascript
// Disable
scheduler.features.dependencies.disabled = true;

// Enable
scheduler.features.dependencies.disabled = false;

// Check state
if (scheduler.features.dependencies.disabled) {
    // ...
}
```

### Access Feature Instance

```javascript
// Get feature
const deps = scheduler.features.dependencies;

// Call methods
deps.drawDependency(from, to);

// Access properties
console.log(deps.radius);
```

## Commonly Used Feature Configurations

### Dependencies

```javascript
features: {
    dependencies: {
        radius: 10,
        clickWidth: 5,
        drawOnScroll: false,
        showTooltip: true,
        showLagInTooltip: true
    },
    dependencyEdit: {
        showDeleteButton: true,
        showLagField: true
    }
}
```

### Event Drag

```javascript
features: {
    eventDrag: {
        constrainDragToResource: false,
        constrainDragToTimeSlot: false,
        showTooltip: true,
        showExactDropPosition: true,
        dragTouchStartDelay: 300,
        unifiedDrag: true  // Multi-event drag
    }
}
```

### Event Resize

```javascript
features: {
    eventResize: {
        showTooltip: true,
        showExactResizePosition: true,
        allowResizeToZero: false
    }
}
```

### Time Ranges

```javascript
features: {
    timeRanges: {
        showCurrentTimeLine: true,
        currentTimeLineUpdateInterval: 10000,
        enableResizing: true,
        showHeaderElements: true
    }
}
```

### Non-Working Time

```javascript
features: {
    nonWorkingTime: {
        maxTimeAxisUnit: 'day'
    },
    resourceNonWorkingTime: {
        enableMouseEvents: true
    }
}
```

### Event Tooltip

```javascript
features: {
    eventTooltip: {
        align: 'l-r',
        anchor: true,
        template: ({ eventRecord, startClockHtml, endClockHtml }) => `
            <div class="event-tooltip">
                <h3>${eventRecord.name}</h3>
                ${startClockHtml} - ${endClockHtml}
            </div>
        `
    }
}
```

### Task Edit

```javascript
features: {
    taskEdit: {
        editorConfig: {
            title: 'Edit Task',
            width: '40em'
        },
        items: {
            generalTab: {
                items: {
                    customField: {
                        type: 'text',
                        name: 'custom',
                        label: 'Custom'
                    }
                }
            },
            notesTab: false  // Hide
        }
    }
}
```

### Nested Events

```javascript
features: {
    nestedEvents: {
        eventLayout: 'stack',
        eventHeight: 30,
        headerHeight: 25,
        barMargin: 5,
        constrainDragToParent: true,
        maxNesting: 2
    },
    dependencies: false  // Required
}
```

### Percent Bar

```javascript
features: {
    percentBar: {
        showPercentage: true,
        allowResize: true
    }
}
```

### Labels

```javascript
features: {
    labels: {
        left: {
            field: 'name',
            renderer: ({ eventRecord }) => eventRecord.name
        },
        right: {
            field: 'percentDone',
            renderer: ({ eventRecord }) => `${eventRecord.percentDone}%`
        },
        top: null,
        bottom: null
    }
}
```

### Grouping

```javascript
features: {
    group: {
        field: 'department',
        renderer: ({ groupRowFor }) => `Department: ${groupRowFor}`
    }
}
```

### Filter Bar

```javascript
features: {
    filterBar: {
        compactMode: true,
        prioritizeColumns: ['name', 'status']
    }
}
```

### PDF Export

```javascript
features: {
    pdfExport: {
        exportServer: 'https://export.bryntum.com/',
        translateURLsToAbsolute: true,
        clientURL: window.location.href,
        paperFormat: 'A4',
        orientation: 'landscape'
    }
}
```

### Excel Export

```javascript
features: {
    excelExporter: {
        zipcelx: window.zipcelx  // Library reference
    }
}
```

## Feature Combinations

### Event Editing Suite
```javascript
features: {
    eventDrag: true,
    eventDragCreate: true,
    eventResize: true,
    eventCopyPaste: true,
    eventMenu: true,
    taskEdit: true,
    eventTooltip: true
}
```

### Resource Management
```javascript
features: {
    resourceMenu: true,
    resourceEdit: true,
    resourceTimeRanges: true,
    resourceNonWorkingTime: true,
    group: 'team'
}
```

### Visualization
```javascript
features: {
    timeRanges: true,
    nonWorkingTime: true,
    dependencies: true,
    percentBar: true,
    labels: true,
    columnLines: true,
    stripe: true
}
```

### Data Grid
```javascript
features: {
    cellEdit: true,
    cellMenu: true,
    filter: true,
    filterBar: true,
    sort: true,
    group: true,
    search: true
}
```

### Export Suite
```javascript
features: {
    pdfExport: {
        exportServer: 'https://export.bryntum.com/'
    },
    excelExporter: {
        zipcelx: window.zipcelx
    },
    print: true
}
```

## Feature Events

Many features fire events that can be listened to:

```javascript
const scheduler = new SchedulerPro({
    listeners: {
        // Event drag
        beforeEventDrag({ eventRecords }) { },
        eventDragStart({ eventRecords }) { },
        eventDrag({ eventRecords }) { },
        afterEventDrop({ eventRecords }) { },

        // Dependencies
        dependencyClick({ dependency }) { },
        beforeDependencyDelete({ dependencies }) { },

        // Task edit
        beforeTaskEditShow({ taskRecord }) { },
        afterTaskSave({ taskRecord }) { },

        // Time ranges
        timeRangeHeaderClick({ timeRange }) { }
    }
});
```

## Best Practices

1. **Only enable needed features** - Disabled features have zero overhead
2. **Configure at creation** - Changing features at runtime can be costly
3. **Use events for integration** - Features fire events for customization
4. **Check compatibility** - Some features are mutually exclusive (e.g., nestedEvents and dependencies)
5. **Provide UI feedback** - Enable tooltips and menus for user guidance

## API Reference Links

- [SchedulerPro Features](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/view/SchedulerPro#config-features)
- [All Feature Classes](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/feature)
