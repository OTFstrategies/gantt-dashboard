# SchedulerPro Deep Dive: Nested Events

## Overview

The NestedEvents feature renders child events inside their parent events, creating a hierarchical visual structure. This is useful for:
- Breaking down work packages into subtasks
- Showing phases of a project with detailed activities
- Expedition/trip planning with stages
- Any scenario requiring parent-child event relationships

Nested events require a tree-based event store and are mutually exclusive with the standard Dependencies feature.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Event Store (Tree)                        │
├─────────────────────────────────────────────────────────────────┤
│  Parent Event                                                   │
│  ├── isParent: true                                             │
│  ├── children: EventModel[]                                     │
│  └── Nested Events                                              │
│      ├── Child Event 1 (isLeaf)                                │
│      ├── Child Event 2 (isLeaf)                                │
│      └── Child Event 3 (may have children → deeper nesting)    │
├─────────────────────────────────────────────────────────────────┤
│  NestedEvents Feature                                           │
│  ├── eventLayout: 'stack' | 'pack' | 'none'                    │
│  ├── constrainDragToParent                                      │
│  ├── constrainResizeToParent                                    │
│  ├── allowNestingOnDrop                                         │
│  └── allowDeNestingOnDrop                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Feature Configuration

```typescript
interface NestedEventsConfig {
    type?: 'nestedEvents' | 'nestedevents';

    // Layout mode for overlapping nested events
    eventLayout?: 'stack' | 'pack' | 'none';

    // Fixed height for nested events (used with 'stack' layout)
    eventHeight?: number | number[];

    // Space reserved for parent header
    headerHeight?: number;

    // Space between nested event bars
    barMargin?: number;

    // Margins within parent event
    resourceMargin?: number | ResourceMarginConfig;

    // Maximum nesting depth (default: 1)
    maxNesting?: number;

    // Drag constraints
    constrainDragToParent?: boolean;   // Default: false
    allowNestingOnDrop?: boolean;      // Default: true
    allowDeNestingOnDrop?: boolean;    // Default: true

    // Resize constraints
    constrainResizeToParent?: boolean; // Default: true

    // Standard feature options
    disabled?: boolean | 'inert';
}

interface ResourceMarginConfig {
    start?: number;  // Top margin (left in vertical mode)
    end?: number;    // Bottom margin (right in vertical mode)
}
```

## NestedEvents Class

```typescript
class NestedEvents extends InstancePlugin {
    static readonly isNestedEvents: boolean;
    readonly isNestedEvents: boolean;

    // Runtime-modifiable properties
    eventLayout: 'stack' | 'pack' | 'none';
    eventHeight: number | number[];
    headerHeight: number;
    barMargin: number;
    resourceMargin: number | ResourceMarginConfig;
    maxNesting: number;

    constrainDragToParent: boolean;
    constrainResizeToParent: boolean;
    allowNestingOnDrop: boolean;
    allowDeNestingOnDrop: boolean;
}
```

## Event Layout Modes

### Stack Layout
Events are arranged in rows, each with fixed height:
```javascript
features: {
    nestedEvents: {
        eventLayout: 'stack',
        eventHeight: 35,  // Fixed height per row
        barMargin: 5      // Gap between rows
    }
}
```

### Pack Layout
Events are packed to use minimum vertical space:
```javascript
features: {
    nestedEvents: {
        eventLayout: 'pack'
        // eventHeight is calculated dynamically
    }
}
```

### None (Overlap)
Events can overlap each other:
```javascript
features: {
    nestedEvents: {
        eventLayout: 'none'
        // Useful when events don't overlap in time
    }
}
```

## Basic Usage

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31),
    rowHeight: 150,  // Need larger rows for nested events

    project: {
        // Tree structure is auto-detected from children
        eventsData: [
            {
                id: 1,
                name: 'Project Alpha',
                startDate: '2024-01-05',
                endDate: '2024-01-20',
                children: [
                    {
                        id: 11,
                        name: 'Research',
                        startDate: '2024-01-05',
                        endDate: '2024-01-10'
                    },
                    {
                        id: 12,
                        name: 'Development',
                        startDate: '2024-01-10',
                        endDate: '2024-01-18'
                    },
                    {
                        id: 13,
                        name: 'Testing',
                        startDate: '2024-01-18',
                        endDate: '2024-01-20'
                    }
                ]
            }
        ],
        assignmentsData: [
            { id: 1, eventId: 1, resourceId: 'r1' },
            // Children inherit parent's resource assignment
            { id: 11, eventId: 11, resourceId: 'r1' },
            { id: 12, eventId: 12, resourceId: 'r1' },
            { id: 13, eventId: 13, resourceId: 'r1' }
        ]
    },

    features: {
        nestedEvents: {
            eventLayout: 'stack',
            eventHeight: 30,
            headerHeight: 25,
            barMargin: 5,
            constrainDragToParent: true
        },
        // Dependencies cannot be used with nested events
        dependencies: false
    }
});
```

## Forcing Tree Store

If starting with no children, force tree mode:

```javascript
project: {
    eventStore: {
        tree: true,  // Force tree mode
        fields: [
            // Custom fields
            { name: 'durationUnit', defaultValue: 'day' }
        ]
    }
}
```

## Deep Nesting

Enable multiple nesting levels:

```javascript
features: {
    nestedEvents: {
        maxNesting: 2,  // Allow grandchildren
        eventLayout: 'pack'
    }
}

// Event renderer can check nesting level
eventRenderer({ eventRecord, renderData }) {
    if (eventRecord.childLevel === 0) {
        renderData.eventColor = 'indigo';
    } else if (eventRecord.childLevel === 1) {
        renderData.eventColor = 'blue';
    } else if (eventRecord.childLevel === 2) {
        renderData.eventColor = 'cyan';
    }
    return eventRecord.name;
}
```

## Nested Events with Dependencies

While the standard Dependencies feature is disabled, you can use dependencies between nested events with special configuration:

```javascript
features: {
    nestedEvents: {
        eventLayout: 'stack',
        allowDeNestingOnDrop: false,
        constrainResizeToParent: false
    },
    dependencies: {
        // Draw dependency lines around parent events
        drawAroundParents: true,
        radius: 5,
        terminalSize: 16
    },
    dependencyEdit: true
}
```

## Event Model Tree Methods

```javascript
// Check if event is a parent
event.isParent  // true if has children
event.isLeaf    // true if no children

// Access parent/children
event.parent    // Parent event (null for top-level)
event.children  // Array of child events
event.childLevel // 0 for top-level, 1 for first level children, etc.

// Add children
const child = event.appendChild({
    name: 'New subtask',
    startDate: event.startDate,
    duration: 1,
    durationUnit: 'day'
});
child.assign(event.resource);  // Assign to same resource

// Remove children
event.removeChild(child);

// Convert leaf to parent
event.convertToParent();

// Convert empty parent back to leaf
EventModel.convertEmptyParentToLeaf = true;  // Static setting
```

## Drag & Drop Configuration

### Constrain to Parent
```javascript
features: {
    nestedEvents: {
        // Keep nested events inside parent
        constrainDragToParent: true
    }
}
```

### Nesting on Drop
```javascript
features: {
    nestedEvents: {
        // Allow dropping events onto others to nest them
        allowNestingOnDrop: true,

        // Allow dropping nested events on resource to de-nest
        allowDeNestingOnDrop: true
    }
}
```

### Dynamic Configuration
```javascript
// Change at runtime
scheduler.features.nestedEvents.constrainDragToParent = false;
scheduler.features.nestedEvents.allowNestingOnDrop = true;
```

## Resize Configuration

```javascript
features: {
    nestedEvents: {
        // Prevent nested events from expanding parent
        constrainResizeToParent: true
    }
}

// When false, resizing nested events can change parent dates
```

## Custom Rendering

### Parent Event Renderer
```javascript
eventRenderer({ eventRecord, resourceRecord, renderData }) {
    if (eventRecord.isParent) {
        return [
            eventRecord.name,
            {
                tag: 'i',
                className: 'add-button fa fa-plus-circle',
                dataset: { btip: 'Add subtask' }
            }
        ];
    }
    return eventRecord.name;
}
```

### Different Styles per Level
```javascript
eventRenderer({ eventRecord, renderData }) {
    // Style based on nesting level
    const colors = ['indigo', 'blue', 'cyan', 'green'];
    renderData.eventColor = colors[eventRecord.childLevel] || 'gray';

    // Add icons for leaf vs parent
    if (eventRecord.isParent) {
        return [
            { tag: 'i', className: 'fa fa-folder' },
            eventRecord.name
        ];
    }
    return [
        { tag: 'i', className: 'fa fa-file' },
        eventRecord.name
    ];
}
```

## Tooltip with Nested Events

```javascript
features: {
    eventTooltip: {
        template: ({ eventRecord, startClockHtml, endClockHtml }) => {
            let html = `
                <div class="b-sch-event-title">${eventRecord.name}</div>
                ${startClockHtml}
                ${endClockHtml}
            `;

            // Add children info for parent events
            if (eventRecord.children?.length) {
                const sortedChildren = eventRecord.children
                    .slice()
                    .sort((a, b) => a.startDate - b.startDate);

                html += '<hr>';
                for (const child of sortedChildren) {
                    html += `
                        <div class="subtask">
                            <strong>${child.name}</strong>
                            <span>${DateHelper.format(child.startDate, 'LT')} -
                                  ${DateHelper.format(child.endDate, 'LT')}</span>
                        </div>
                    `;
                }
            }

            return html;
        }
    }
}
```

## Task Editor with Subtasks Tab

```javascript
import { EditorTab, EventModel } from '@bryntum/schedulerpro';

class SubtaskTab extends EditorTab {
    static type = 'subtasktab';

    static configurable = {
        title: 'Subtasks',
        items: {
            grid: {
                type: 'grid',
                store: { modelClass: EventModel },
                columns: [
                    { field: 'name', text: 'Name', flex: 1 },
                    { field: 'startDate', type: 'date', text: 'Start' },
                    { field: 'endDate', type: 'date', text: 'End' }
                ]
            },
            toolbar: {
                type: 'toolbar',
                items: {
                    add: {
                        type: 'button',
                        icon: 'fa fa-plus',
                        onClick: 'up.onAddClick'
                    },
                    remove: {
                        type: 'button',
                        icon: 'fa fa-trash',
                        onClick: 'up.onRemoveClick'
                    }
                }
            }
        }
    };

    set record(record) {
        super.record = record;
        if (record) {
            this.widgetMap.grid.store.loadData(record.children || []);
        }
    }

    onAddClick() {
        const child = this.record.appendChild({
            name: 'New subtask',
            startDate: this.record.startDate,
            duration: 1
        });
        child.assign(this.record.resource);
    }

    onRemoveClick() {
        const selected = this.widgetMap.grid.selectedRecord;
        if (selected) {
            this.record.removeChild(selected);
        }
    }
}
SubtaskTab.initClass();

// Usage
features: {
    taskEdit: {
        items: {
            subTaskTab: {
                type: 'subtasktab',
                weight: 110  // After other tabs
            }
        }
    }
}
```

## Dynamic Row Height

Calculate row height based on capacity:

```javascript
columns: [
    {
        text: 'Resource',
        field: 'name',
        renderer({ record, size }) {
            const { nestedEvents } = scheduler.features;
            const capacity = record.capacity || 3;

            // Calculate height for capacity events
            size.height = capacity * (nestedEvents.eventHeight + nestedEvents.barMargin)
                + 2 * nestedEvents.resourceMargin
                + nestedEvents.headerHeight
                + scheduler.resourceMargin * 2;

            return record.name;
        }
    }
]
```

## Capacity Checking

```javascript
function isOverCapacity(parentEvent, capacity) {
    const hours = DateHelper.as('h', parentEvent.duration, parentEvent.durationUnit);

    for (let i = 0; i < hours; i++) {
        const time = DateHelper.add(parentEvent.startDate, i, 'h');
        let overlaps = 0;

        for (const child of parentEvent.children) {
            if (time >= child.startDate && time < child.endDate) {
                overlaps++;
            }
        }

        if (overlaps > capacity) {
            return true;
        }
    }
    return false;
}

// Use in renderer
eventRenderer({ eventRecord, resourceRecord, renderData }) {
    if (eventRecord.isParent) {
        const exceeded = isOverCapacity(eventRecord, resourceRecord.capacity);
        renderData.wrapperCls.toggle('exceeded', exceeded);

        if (exceeded) {
            return [
                eventRecord.name,
                { tag: 'i', className: 'fa fa-exclamation-circle warning' }
            ];
        }
    }
    return eventRecord.name;
}
```

## Adding Nested Events Programmatically

```javascript
// Click handler for add button
EventHelper.on({
    element: scheduler.element,
    delegate: '.add-button',
    click(event) {
        const parentEvent = scheduler.resolveEventRecord(event);
        const resource = scheduler.resolveResourceRecord(event);

        // Find available time slot
        const slot = findAvailableSlot(parentEvent);

        if (slot) {
            const child = parentEvent.appendChild({
                name: 'New subtask',
                startDate: slot.startDate,
                endDate: slot.endDate
            });
            child.assign(resource);
        }
    }
});

function findAvailableSlot(parent) {
    let startDate = parent.startDate;
    const sortedChildren = parent.children.slice().sort((a, b) => a.startDate - b.startDate);

    for (const child of sortedChildren) {
        if (child.startDate > startDate) {
            // Gap found
            return {
                startDate,
                endDate: DateHelper.min(
                    DateHelper.add(startDate, 1, 'hour'),
                    child.startDate
                )
            };
        }
        startDate = DateHelper.max(startDate, child.endDate);
    }

    // Check remaining space
    if (startDate < parent.endDate) {
        return {
            startDate,
            endDate: DateHelper.min(
                DateHelper.add(startDate, 1, 'hour'),
                parent.endDate
            )
        };
    }

    return null;  // No space available
}
```

## Styling

```css
/* Parent events */
.b-sch-event.b-nested-events-parent {
    background: linear-gradient(to bottom, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
}

/* Parent header area */
.b-sch-event.b-nested-events-parent .b-sch-event-content {
    padding: 4px 8px;
    font-weight: bold;
    color: white;
}

/* Nested events container */
.b-nested-events-container {
    padding: 4px;
}

/* Nested event bars */
.b-sch-event.b-nested-event {
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* Exceeded capacity indicator */
.b-sch-event-wrap.exceeded .b-sch-event {
    border: 2px solid #e74c3c;
}

.b-sch-event-wrap.exceeded .warning {
    color: #e74c3c;
}

/* Different styles per nesting level */
.b-sch-event[data-child-level="0"] {
    background-color: #6366f1;
}

.b-sch-event[data-child-level="1"] {
    background-color: #3b82f6;
}

.b-sch-event[data-child-level="2"] {
    background-color: #06b6d4;
}
```

## Marquee Selection

Include nested events in marquee selection:

```javascript
features: {
    eventDragSelect: {
        includeNested: true
    }
}
```

## Best Practices

1. **Row Height**: Use sufficient row height (100-200px) for nested events
2. **Assignment**: Assign children to same resource as parent
3. **Layout Mode**: Use 'stack' for consistent height, 'pack' for space efficiency
4. **Dependencies**: Use `drawAroundParents` when combining with dependencies
5. **Performance**: Limit `maxNesting` to needed depth
6. **UX**: Provide visual distinction between parent/child events
7. **Constraints**: Enable `constrainDragToParent` for structured workflows

## Limitations

1. Standard Dependencies feature is disabled (use with special config)
2. Each nesting level adds visual complexity
3. Small parent events may not fit many children
4. Assignment must be explicit for children

## API Reference Links

- [NestedEvents Feature](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/feature/NestedEvents)
- [EventModel Tree Methods](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/EventModel)
- [Dependencies with Nested Events](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/feature/Dependencies#config-drawAroundParents)
