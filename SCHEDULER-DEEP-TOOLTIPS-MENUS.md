# SchedulerPro Deep Dive: Tooltips & Context Menus

## Overview

SchedulerPro provides comprehensive tooltip and context menu systems for displaying information and actions. Key features include:

- **EventTooltip** - Tooltip when hovering events
- **ScheduleTooltip** - Tooltip when hovering empty schedule areas
- **EventMenu** - Context menu for events
- **ScheduleMenu** - Context menu for empty schedule areas
- **TimeAxisHeaderMenu** - Context menu for time axis header

## EventTooltip Feature

### Basic Configuration

```typescript
const scheduler = new SchedulerPro({
    features: {
        eventTooltip: true  // Enable with defaults
    }
});
```

### Full Configuration

```typescript
features: {
    eventTooltip: {
        // Positioning
        align: 'b-t',           // Align bottom of tooltip to top of event
        anchorToTarget: true,   // Anchor to event (vs follow mouse)
        anchor: true,           // Show arrow pointer

        // Behavior
        allowOver: true,        // Keep open when mouse enters tooltip
        autoHide: true,         // Hide when mouse leaves
        autoUpdate: false,      // Update on mouse move

        // Timing
        hoverDelay: 300,        // Delay before showing (ms)
        hideDelay: 100,         // Delay before hiding (ms)
        showOnHover: true,      // Show on hover

        // Appearance
        cls: 'my-event-tooltip',
        closable: false,        // No close button
        header: false,          // No header

        // Content
        template: ({ eventRecord, resourceRecord, startDate, endDate }) => `
            <div class="event-tooltip">
                <h3>${eventRecord.name}</h3>
                <p>Resource: ${resourceRecord.name}</p>
                <p>Duration: ${eventRecord.duration} ${eventRecord.durationUnit}</p>
                <p>${DateHelper.format(startDate, 'LLL')} - ${DateHelper.format(endDate, 'LLL')}</p>
            </div>
        `
    }
}
```

### Template Function

The `template` config receives context with event data:

```typescript
template: (context) => {
    const {
        eventRecord,        // SchedulerEventModel
        resourceRecord,     // SchedulerResourceModel
        assignmentRecord,   // SchedulerAssignmentModel
        startDate,          // Date
        endDate,            // Date
        startClockHtml,     // Pre-formatted start time HTML
        endClockHtml        // Pre-formatted end time HTML
    } = context;

    return `
        <div class="tooltip-content">
            <div class="title">${eventRecord.name}</div>
            <div class="times">${startClockHtml} - ${endClockHtml}</div>
            <div class="resource">Assigned to: ${resourceRecord.name}</div>
            ${eventRecord.description ? `<p>${eventRecord.description}</p>` : ''}
        </div>
    `;
}
```

### Using DomConfig

```typescript
template: ({ eventRecord }) => ({
    tag: 'div',
    class: 'event-tooltip',
    children: [
        { tag: 'h3', text: eventRecord.name },
        { tag: 'p', class: 'description', text: eventRecord.description },
        {
            tag: 'div',
            class: 'status',
            children: [
                { tag: 'span', class: `status-badge ${eventRecord.status}` },
                { tag: 'span', text: eventRecord.status }
            ]
        }
    ]
})
```

### Rich Tooltip with Widgets

```typescript
features: {
    eventTooltip: {
        // Use a container with child widgets
        items: {
            nameField: {
                type: 'displayfield',
                label: 'Task',
                template: ({ record }) => record.name
            },
            progressBar: {
                type: 'progressbar',
                label: 'Progress',
                template: ({ record }) => record.percentDone
            },
            resourceField: {
                type: 'displayfield',
                label: 'Resource',
                template: ({ resourceRecord }) => resourceRecord.name
            }
        }
    }
}
```

## ScheduleTooltip Feature

Shows tooltip when hovering empty schedule areas.

```typescript
features: {
    scheduleTooltip: {
        // Show date under cursor
        template: ({ date, resourceRecord }) => `
            <div class="schedule-tooltip">
                <strong>${resourceRecord.name}</strong><br>
                ${DateHelper.format(date, 'LLLL')}
            </div>
        `
    }
}
```

## EventMenu Feature

Context menu for events.

### Basic Configuration

```typescript
features: {
    eventMenu: true  // Enable with defaults
}
```

### Custom Items

```typescript
features: {
    eventMenu: {
        items: {
            // Override default items
            deleteEvent: {
                text: 'Remove Event',
                icon: 'b-fa b-fa-trash',
                weight: 100  // Sort order
            },

            // Add custom items
            duplicateEvent: {
                text: 'Duplicate',
                icon: 'b-fa b-fa-copy',
                weight: 50,
                onItem({ eventRecord }) {
                    const clone = eventRecord.copy();
                    clone.startDate = DateHelper.add(eventRecord.startDate, 1, 'day');
                    scheduler.eventStore.add(clone);
                }
            },

            // Submenu
            changeStatus: {
                text: 'Status',
                icon: 'b-fa b-fa-flag',
                menu: {
                    items: [
                        {
                            text: 'Pending',
                            onItem: ({ eventRecord }) => eventRecord.status = 'pending'
                        },
                        {
                            text: 'Active',
                            onItem: ({ eventRecord }) => eventRecord.status = 'active'
                        },
                        {
                            text: 'Completed',
                            onItem: ({ eventRecord }) => eventRecord.status = 'completed'
                        }
                    ]
                }
            },

            // Disable default item
            editEvent: false,

            // Hide conditionally (via processItems)
            copyEvent: true
        },

        // Process items before display
        processItems({ eventRecord, items }) {
            // Hide copy for milestones
            if (eventRecord.isMilestone) {
                items.copyEvent = false;
            }

            // Disable delete for locked events
            if (eventRecord.locked) {
                items.deleteEvent.disabled = true;
            }
        }
    }
}
```

### Default Event Menu Items

| Item Name | Description |
|-----------|-------------|
| `editEvent` | Open event editor |
| `deleteEvent` | Delete event |
| `copyEvent` | Copy event |
| `cutEvent` | Cut event |

### Menu Context

```typescript
processItems({
    feature,           // EventMenu instance
    domEvent,          // Original DOM event
    point,             // [x, y] coordinates
    targetElement,     // Clicked element
    eventRecord,       // SchedulerEventModel
    resourceRecord,    // SchedulerResourceModel
    assignmentRecord,  // SchedulerAssignmentModel
    items              // Menu items object
}) {
    // Modify items based on context
}
```

## ScheduleMenu Feature

Context menu for empty schedule areas.

### Configuration

```typescript
features: {
    scheduleMenu: {
        items: {
            // Default item
            addEvent: {
                text: 'Add Event',
                icon: 'b-fa b-fa-plus',
                onItem({ date, resourceRecord }) {
                    scheduler.eventStore.add({
                        name: 'New Event',
                        startDate: date,
                        duration: 1,
                        resourceId: resourceRecord.id
                    });
                }
            },

            // Custom items
            blockTime: {
                text: 'Block Time',
                icon: 'b-fa b-fa-ban',
                onItem({ date, resourceRecord }) {
                    scheduler.resourceTimeRangeStore.add({
                        resourceId: resourceRecord.id,
                        startDate: date,
                        duration: 1,
                        durationUnit: 'hour',
                        name: 'Blocked',
                        cls: 'blocked-time'
                    });
                }
            },

            // Separator
            separator: {
                type: 'separator'  // Or just: separator: true
            },

            viewResource: {
                text: 'View Resource Details',
                onItem({ resourceRecord }) {
                    showResourceDetails(resourceRecord);
                }
            }
        },

        processItems({ resourceRecord, date, items }) {
            // Only show block time during work hours
            const hour = date.getHours();
            items.blockTime.hidden = hour < 8 || hour >= 18;
        }
    }
}
```

### Schedule Menu Context

```typescript
processItems({
    feature,           // ScheduleMenu instance
    domEvent,          // Original DOM event
    point,             // [x, y] coordinates
    targetElement,     // Clicked element
    resourceRecord,    // SchedulerResourceModel
    date,              // Date at click position
    items              // Menu items object
}) {
    // Return false to prevent menu from showing
}
```

## TimeAxisHeaderMenu

Context menu for the time axis header.

```typescript
features: {
    timeAxisHeaderMenu: {
        items: {
            // Custom header items
            zoomIn: {
                text: 'Zoom In',
                icon: 'b-fa b-fa-search-plus',
                onItem() {
                    scheduler.zoomIn();
                }
            },
            zoomOut: {
                text: 'Zoom Out',
                icon: 'b-fa b-fa-search-minus',
                onItem() {
                    scheduler.zoomOut();
                }
            },
            goToDate: {
                text: 'Go to Date...',
                onItem() {
                    // Show date picker
                    showDatePicker();
                }
            }
        }
    }
}
```

## Feature-Specific Tooltips

### EventDrag Tooltip

```typescript
features: {
    eventDrag: {
        showTooltip: true,
        tooltipTemplate: ({
            eventRecord,
            newResource,
            valid,
            startDate,
            endDate
        }) => `
            <div class="drag-tooltip ${valid ? '' : 'invalid'}">
                <strong>${eventRecord.name}</strong><br>
                ${DateHelper.format(startDate, 'LLL')} - ${DateHelper.format(endDate, 'LLL')}<br>
                ${newResource ? `Resource: ${newResource.name}` : ''}
                ${!valid ? '<span class="error">Invalid drop position</span>' : ''}
            </div>
        `
    }
}
```

### EventResize Tooltip

```typescript
features: {
    eventResize: {
        showTooltip: true,
        tooltipTemplate: ({
            startDate,
            endDate,
            record,
            startClockHtml,
            endClockHtml
        }) => `
            <div class="resize-tooltip">
                ${startClockHtml} - ${endClockHtml}<br>
                Duration: ${record.duration} ${record.durationUnit}
            </div>
        `
    }
}
```

### Dependency Tooltip

```typescript
features: {
    dependencies: {
        showTooltip: true,
        tooltipTemplate: (dependency) => `
            <div class="dep-tooltip">
                <strong>From:</strong> ${dependency.fromEvent?.name}<br>
                <strong>To:</strong> ${dependency.toEvent?.name}<br>
                <strong>Type:</strong> ${['SS', 'SF', 'FS', 'FF'][dependency.type]}<br>
                ${dependency.lag ? `<strong>Lag:</strong> ${dependency.lag} ${dependency.lagUnit}` : ''}
            </div>
        `
    }
}
```

### TimeRanges Tooltip

```typescript
features: {
    timeRanges: {
        showTooltip: true,
        tooltipTemplate: ({ timeRange, startClockHtml, endClockHtml }) => `
            <div class="timerange-tooltip">
                <strong>${timeRange.name}</strong><br>
                ${startClockHtml} - ${endClockHtml}
            </div>
        `
    }
}
```

## Menu Item Configuration

### MenuItemConfig

```typescript
type MenuItemConfig = {
    // Identity
    ref?: string                    // Unique reference
    name?: string                   // Alternative to ref

    // Display
    text?: string                   // Label text
    icon?: string                   // CSS class for icon
    iconAlign?: 'start' | 'end'     // Icon position
    cls?: string                    // CSS class

    // Behavior
    disabled?: boolean              // Disabled state
    hidden?: boolean                // Hidden state
    checked?: boolean               // Checkbox state (for toggle items)
    toggleGroup?: string            // Radio group name

    // Hierarchy
    weight?: number                 // Sort order (lower = first)
    separator?: boolean             // Show as separator

    // Submenu
    menu?: MenuConfig | MenuItem[]  // Submenu configuration

    // Actions
    onItem?: (context: object) => void   // Click handler
    onToggle?: (context: object) => void // Toggle handler (for checked items)

    // Conditions
    onBeforeShow?: (context: object) => boolean  // Show condition
}
```

### Dynamic Menu Items

```typescript
processItems({ eventRecord, items }) {
    // Add dynamic items
    if (eventRecord.resources.length > 1) {
        items.unassignResource = {
            text: 'Unassign from resource',
            icon: 'b-fa b-fa-user-minus',
            menu: eventRecord.resources.map(resource => ({
                text: resource.name,
                onItem: () => eventRecord.unassign(resource)
            }))
        };
    }

    // Modify existing items
    items.deleteEvent.text = `Delete "${eventRecord.name}"`;

    // Conditionally hide
    items.copyEvent.hidden = !canCopy(eventRecord);

    // Add separator before custom items
    items.customSeparator = { separator: true, weight: 90 };

    return items;
}
```

## Tooltip Widget Configuration

The tooltip is a Popup widget with additional tooltip behavior:

```typescript
features: {
    eventTooltip: {
        // Popup/Widget configs
        width: 300,
        maxHeight: 400,

        // Tooltip-specific
        hoverDelay: 500,
        hideDelay: 100,
        dismissDelay: 3000,      // Auto-hide after 3s

        // Alignment
        align: {
            align: 'l-r',        // Left of tooltip to right of event
            offset: [10, 0]      // 10px gap
        },

        // Animation
        showAnimation: {
            opacity: { from: 0, to: 1 }
        },
        hideAnimation: {
            opacity: { from: 1, to: 0 }
        },

        // Custom header
        header: {
            title: 'Event Details',
            cls: 'custom-header'
        },

        // Tools in header
        tools: {
            close: {
                handler() { this.hide(); }
            },
            edit: {
                cls: 'b-fa b-fa-edit',
                handler() {
                    scheduler.editEvent(this.eventRecord);
                    this.hide();
                }
            }
        }
    }
}
```

## Common Patterns

### Pattern 1: Async Tooltip Content

```typescript
features: {
    eventTooltip: {
        template: async ({ eventRecord }) => {
            // Show loading state initially
            setTimeout(async () => {
                const details = await fetchEventDetails(eventRecord.id);
                // Update tooltip content
                scheduler.features.eventTooltip.tooltip.html = `
                    <div class="loaded-content">
                        ${details.description}
                    </div>
                `;
            }, 0);

            return '<div class="loading">Loading...</div>';
        }
    }
}
```

### Pattern 2: Confirm Before Delete

```typescript
features: {
    eventMenu: {
        items: {
            deleteEvent: {
                text: 'Delete',
                async onItem({ eventRecord }) {
                    const confirmed = await MessageDialog.confirm({
                        title: 'Confirm Delete',
                        message: `Delete "${eventRecord.name}"?`
                    });

                    if (confirmed === MessageDialog.yesButton) {
                        eventRecord.remove();
                    }
                }
            }
        }
    }
}
```

### Pattern 3: Role-Based Menu Items

```typescript
const userRole = getCurrentUserRole();

features: {
    eventMenu: {
        processItems({ eventRecord, items }) {
            // Admin only items
            if (userRole !== 'admin') {
                items.deleteEvent = false;
                items.editEvent.disabled = true;
            }

            // Owner only
            if (eventRecord.ownerId !== currentUserId) {
                items.editEvent.disabled = true;
            }
        }
    }
}
```

### Pattern 4: Quick Actions in Tooltip

```typescript
features: {
    eventTooltip: {
        // Use items for interactive content
        items: {
            header: {
                type: 'widget',
                html: '',
                listeners: {
                    paint({ source }) {
                        const record = source.up('eventtooltip').eventRecord;
                        source.html = `<h3>${record.name}</h3>`;
                    }
                }
            },
            completeButton: {
                type: 'button',
                text: 'Mark Complete',
                icon: 'b-fa b-fa-check',
                onClick() {
                    const tooltip = this.up('eventtooltip');
                    tooltip.eventRecord.status = 'completed';
                    tooltip.hide();
                }
            },
            editButton: {
                type: 'button',
                text: 'Edit',
                icon: 'b-fa b-fa-edit',
                onClick() {
                    const tooltip = this.up('eventtooltip');
                    scheduler.editEvent(tooltip.eventRecord);
                    tooltip.hide();
                }
            }
        }
    }
}
```

### Pattern 5: Context-Sensitive Submenus

```typescript
features: {
    eventMenu: {
        processItems({ eventRecord, items }) {
            // Dynamic submenu based on event type
            items.actions = {
                text: 'Actions',
                menu: getActionsForEventType(eventRecord.type).map(action => ({
                    text: action.label,
                    icon: action.icon,
                    onItem: () => action.execute(eventRecord)
                }))
            };
        }
    }
}
```

## Styling

### Tooltip CSS

```css
/* Custom tooltip styling */
.b-tooltip.my-event-tooltip {
    background: #1a1a2e;
    color: #eee;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.b-tooltip.my-event-tooltip .b-panel-content {
    padding: 12px 16px;
}

/* Tooltip arrow */
.b-tooltip.my-event-tooltip .b-anchor-tip {
    fill: #1a1a2e;
}
```

### Menu CSS

```css
/* Custom menu styling */
.b-menu.custom-event-menu {
    min-width: 200px;
}

.b-menu.custom-event-menu .b-menuitem {
    padding: 8px 12px;
}

.b-menu.custom-event-menu .b-menuitem:hover {
    background: #f0f0f0;
}

.b-menu.custom-event-menu .b-menuitem.danger {
    color: #dc3545;
}
```

## Integration Notes

1. **Template Return Types**: Templates can return string HTML or DomConfig objects.

2. **Async Templates**: Use setTimeout for async content loading, then update tooltip.html.

3. **processItems**: Returns false to prevent menu/tooltip from showing.

4. **Weight Property**: Controls item order; lower values appear first.

5. **Widget Items**: Tooltips can contain interactive widgets, not just static content.

6. **Context Object**: Contains all relevant records (event, resource, assignment) and DOM info.

7. **Keyboard Support**: Menus support keyboard navigation out of the box.

8. **Disable vs Hide**: Use `disabled: true` to gray out, `hidden: true` to remove from view.
