# SchedulerPro Implementation: Tooltips

## Overview

SchedulerPro provides several tooltip features for displaying contextual information:
- **EventTooltip**: Shows information when hovering events
- **ScheduleTooltip**: Shows time information when hovering empty schedule areas
- **CellTooltip**: Shows information when hovering grid cells
- **DependencyTooltip**: Shows dependency information (part of Dependencies feature)

## EventTooltip

The primary tooltip for event information.

### Configuration

```typescript
interface EventTooltipConfig {
    type?: 'eventTooltip' | 'eventtooltip';

    // Template function
    template?: (data: {
        eventRecord: EventModel;
        assignmentRecord: AssignmentModel;
        resourceRecord: ResourceModel;
        startDate: Date;
        endDate: Date;
        startText: string;
        endText: string;
        tip: Tooltip;
        startClockHtml: string;
        endClockHtml: string;
    }) => DomConfig | string | void;

    // Positioning
    align?: AlignSpec | string;
    anchor?: boolean;
    anchorToTarget?: boolean;

    // Behavior
    allowOver?: boolean;     // Keep open when mouse over tooltip
    autoClose?: boolean;     // Close on outside click
    autoHide?: boolean;      // Hide when leaving target
    autoUpdate?: boolean;    // Update on mouse move

    // Appearance
    cls?: string | object;
    closable?: boolean;
    header?: string | object;

    // Timing
    showOnHover?: boolean;
    hoverDelay?: number;
    hideDelay?: number;

    // Standard feature options
    disabled?: boolean | 'inert';
}
```

### Basic Usage

```javascript
const scheduler = new SchedulerPro({
    features: {
        eventTooltip: true  // Enable with defaults
    }
});
```

### Custom Template

```javascript
features: {
    eventTooltip: {
        template: ({ eventRecord, startClockHtml, endClockHtml }) => `
            <div class="event-tooltip">
                <h3>${eventRecord.name}</h3>
                <div class="times">
                    ${startClockHtml} - ${endClockHtml}
                </div>
                <div class="duration">
                    Duration: ${eventRecord.duration} ${eventRecord.durationUnit}s
                </div>
            </div>
        `
    }
}
```

### DomConfig Template

For better performance, return DomConfig objects:

```javascript
features: {
    eventTooltip: {
        template: ({ eventRecord, startClockHtml, endClockHtml }) => ({
            children: [
                {
                    tag: 'h3',
                    className: 'tooltip-title',
                    text: eventRecord.name
                },
                {
                    tag: 'div',
                    className: 'tooltip-times',
                    html: `${startClockHtml} - ${endClockHtml}`
                },
                eventRecord.percentDone ? {
                    tag: 'div',
                    className: 'tooltip-progress',
                    children: [
                        { tag: 'span', text: 'Progress: ' },
                        { tag: 'strong', text: `${eventRecord.percentDone}%` }
                    ]
                } : null
            ].filter(Boolean)
        })
    }
}
```

### Tooltip with Nested Events

```javascript
features: {
    eventTooltip: {
        template: ({ eventRecord, startClockHtml, endClockHtml }) => {
            let html = `
                <div class="event-title">${eventRecord.name}</div>
                ${startClockHtml} - ${endClockHtml}
            `;

            // Add children info for parent events
            if (eventRecord.children?.length) {
                html += '<hr><strong>Subtasks:</strong>';
                const sortedChildren = eventRecord.children
                    .slice()
                    .sort((a, b) => a.startDate - b.startDate);

                for (const child of sortedChildren) {
                    html += `
                        <div class="subtask">
                            ${child.name}:
                            ${DateHelper.format(child.startDate, 'LT')} -
                            ${DateHelper.format(child.endDate, 'LT')}
                        </div>
                    `;
                }
            }

            return html;
        }
    }
}
```

### Tooltip with Constraint Info

```javascript
const constraintNames = {
    muststarton: 'Must start on',
    mustfinishon: 'Must finish on',
    startnoearlierthan: 'Start no earlier than',
    startnolaterthan: 'Start no later than',
    finishnoearlierthan: 'Finish no earlier than',
    finishnolaterthan: 'Finish no later than'
};

features: {
    eventTooltip: {
        template: ({ eventRecord }) => ({
            children: [
                {
                    tag: 'dl',
                    children: [
                        { tag: 'dt', text: 'Start' },
                        { tag: 'dd', text: DateHelper.format(eventRecord.startDate, 'll LT') },
                        { tag: 'dt', text: 'Duration' },
                        { tag: 'dd', text: `${eventRecord.duration} ${eventRecord.durationUnit}` },
                        eventRecord.constraintType ? { tag: 'dt', text: 'Constraint' } : null,
                        eventRecord.constraintType ? {
                            tag: 'dd',
                            text: `${constraintNames[eventRecord.constraintType]} ${
                                DateHelper.format(eventRecord.constraintDate, 'll')
                            }`
                        } : null
                    ].filter(Boolean)
                }
            ]
        })
    }
}
```

### Positioning

```javascript
features: {
    eventTooltip: {
        // Align tooltip to the left of the event
        align: 'l-r',  // tooltip left to event right

        // Show anchor arrow
        anchor: true,

        // Anchor to event (not mouse)
        anchorToTarget: true
    }
}
```

### Hover Behavior

```javascript
features: {
    eventTooltip: {
        // Allow mouse to enter tooltip without hiding
        allowOver: true,

        // Delay before showing
        hoverDelay: 500,

        // Delay before hiding
        hideDelay: 300,

        // Close on outside click
        autoClose: true
    }
}
```

## ScheduleTooltip

Shows time information when hovering empty schedule areas.

### Configuration

```typescript
interface ScheduleTooltipConfig {
    type?: 'scheduleTooltip' | 'scheduletooltip';

    // Custom content generator
    generateTipContent?: (context: {
        date: Date;
        event: Event;
        resourceRecord: ResourceModel;
    }) => string;

    // Date format
    dateFormat?: string;

    // Standard options
    disabled?: boolean | 'inert';
}
```

### Basic Usage

```javascript
features: {
    scheduleTooltip: true  // Shows date/time at cursor
}
```

### Custom Content

```javascript
features: {
    scheduleTooltip: {
        generateTipContent({ date, resourceRecord }) {
            return `
                <div class="schedule-tooltip">
                    <strong>${resourceRecord.name}</strong><br>
                    ${DateHelper.format(date, 'llll')}
                </div>
            `;
        }
    }
}
```

### Override getText

```javascript
class CustomScheduleTooltip extends ScheduleTooltip {
    getText(date, event, resourceRecord) {
        // Custom formatting
        return `${resourceRecord.name}: ${DateHelper.format(date, 'HH:mm')}`;
    }
}

const scheduler = new SchedulerPro({
    features: {
        scheduleTooltip: {
            type: 'customScheduleTooltip'
        }
    }
});
```

## CellTooltip

Shows tooltips for grid cells.

### Configuration

```javascript
features: {
    cellTooltip: {
        // Column-specific tooltips
        tooltipRenderer: ({ record, column, cellElement }) => {
            if (column.field === 'status') {
                return `Status: ${record.status}`;
            }
            return null;  // No tooltip
        }
    }
}
```

### Per-Column Configuration

```javascript
columns: [
    {
        field: 'name',
        text: 'Name',
        // Column-specific tooltip
        tooltipRenderer: ({ record }) => `Full name: ${record.name}`
    },
    {
        field: 'role',
        text: 'Role',
        // Simple tooltip from field
        tooltip: 'The team role'
    }
]
```

## Dependency Tooltip

Configured through the Dependencies feature:

```javascript
features: {
    dependencies: {
        showTooltip: true,
        showLagInTooltip: true,

        // Custom tooltip template
        tooltipTemplate: ({ fromEvent, toEvent, type, lag }) => `
            <div class="dep-tooltip">
                <strong>${fromEvent.name}</strong>
                →
                <strong>${toEvent.name}</strong>
                <br>
                Type: ${['SS', 'SF', 'FS', 'FF'][type]}
                ${lag ? `<br>Lag: ${lag} days` : ''}
            </div>
        `
    }
}
```

## Data Attributes for Tooltips

Use `data-btip` attribute for simple tooltips:

```javascript
eventRenderer({ eventRecord, renderData }) {
    return [
        eventRecord.name,
        {
            tag: 'i',
            className: 'fa fa-info-circle',
            dataset: {
                // Quick tooltip
                btip: `Created: ${DateHelper.format(eventRecord.createdAt, 'lll')}`
            }
        }
    ];
}
```

## Styling

```css
/* Event tooltip */
.b-sch-event-tooltip {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 12px;
}

.b-sch-event-tooltip .b-sch-event-title {
    font-weight: bold;
    margin-bottom: 8px;
}

/* Clock icons */
.b-sch-event-tooltip .b-icon-clock {
    color: #666;
    margin-right: 4px;
}

/* Schedule tooltip */
.b-sch-schedule-tooltip {
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

/* Custom tooltip classes */
.event-tooltip {
    min-width: 200px;
}

.event-tooltip h3 {
    margin: 0 0 8px 0;
    color: #333;
}

.event-tooltip .times {
    color: #666;
}

.event-tooltip .duration {
    margin-top: 8px;
    font-style: italic;
}

/* Anchor arrow */
.b-tooltip.b-anchor-top::before {
    border-bottom-color: white;
}
```

## Complete Example

```javascript
import { SchedulerPro, DateHelper, StringHelper } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    features: {
        // Event tooltip with rich content
        eventTooltip: {
            align: 'l-r',
            anchor: true,
            allowOver: true,
            hoverDelay: 300,

            template: ({
                eventRecord,
                resourceRecord,
                startClockHtml,
                endClockHtml
            }) => ({
                className: 'custom-event-tooltip',
                children: [
                    // Header with event name and color
                    {
                        className: 'tooltip-header',
                        style: `background: ${eventRecord.eventColor || '#3498db'}`,
                        children: [
                            { tag: 'h3', text: eventRecord.name },
                            {
                                tag: 'span',
                                className: 'resource-name',
                                text: resourceRecord.name
                            }
                        ]
                    },
                    // Time info
                    {
                        className: 'tooltip-times',
                        html: `${startClockHtml} - ${endClockHtml}`
                    },
                    // Duration
                    {
                        className: 'tooltip-duration',
                        text: `Duration: ${eventRecord.duration} ${eventRecord.durationUnit}${eventRecord.duration > 1 ? 's' : ''}`
                    },
                    // Progress bar if applicable
                    eventRecord.percentDone !== undefined ? {
                        className: 'tooltip-progress',
                        children: [
                            { tag: 'label', text: 'Progress:' },
                            {
                                className: 'progress-bar',
                                children: [{
                                    className: 'progress-fill',
                                    style: `width: ${eventRecord.percentDone}%`
                                }]
                            },
                            { tag: 'span', text: `${eventRecord.percentDone}%` }
                        ]
                    } : null,
                    // Custom fields
                    eventRecord.note ? {
                        className: 'tooltip-note',
                        children: [
                            { tag: 'strong', text: 'Note: ' },
                            { text: StringHelper.encodeHtml(eventRecord.note) }
                        ]
                    } : null
                ].filter(Boolean)
            })
        },

        // Schedule tooltip for empty areas
        scheduleTooltip: {
            generateTipContent({ date, resourceRecord }) {
                return `
                    <div class="schedule-hint">
                        <strong>${resourceRecord.name}</strong><br>
                        ${DateHelper.format(date, 'dddd, MMMM D')}<br>
                        ${DateHelper.format(date, 'h:mm A')}
                    </div>
                `;
            }
        },

        // Dependencies with tooltip
        dependencies: {
            showTooltip: true,
            showLagInTooltip: true
        }
    },

    // Column tooltips
    columns: [
        {
            type: 'resourceInfo',
            text: 'Resource',
            tooltipRenderer: ({ record }) =>
                `${record.name} - ${record.role || 'Team Member'}`
        }
    ]
});
```

## Best Practices

1. **Keep tooltips concise** - Show key information, not everything
2. **Use DomConfig for performance** - Especially for complex tooltips
3. **Enable allowOver for interactive content** - If tooltip contains links/buttons
4. **Set appropriate delays** - 300-500ms hover delay feels natural
5. **Provide visual hierarchy** - Use headers, formatting for scannability
6. **Handle missing data** - Check fields exist before rendering
7. **Use semantic HTML** - dl/dt/dd for key-value pairs

## API Reference Links

- [EventTooltip Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/EventTooltip)
- [ScheduleTooltip Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/ScheduleTooltip)
- [CellTooltip Feature](https://bryntum.com/products/schedulerpro/docs/api/Grid/feature/CellTooltip)
- [Tooltip Widget](https://bryntum.com/products/schedulerpro/docs/api/Core/widget/Tooltip)
