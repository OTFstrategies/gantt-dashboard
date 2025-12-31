# Gantt Implementation: Task Menu

> **Task Menu** voor het aanpassen van het taak context menu.

---

## Overzicht

Bryntum Gantt's Task Menu kan worden uitgebreid met custom acties en conditionele items.

```
+--------------------------------------------------------------------------+
| GANTT                                                                     |
+--------------------------------------------------------------------------+
|  Name              |        Timeline                                      |
+--------------------------------------------------------------------------+
|  Planning          |  ████████                                            |
|  Design            |       ████████  [Right-click]                        |
|  Development       |            ████████████                              |
+--------------------------------------------------------------------------+
                            +-------------------------+
                            | ✏️ Edit task            |
                            | 📋 Copy task            |
                            | ✂️ Cut task             |
                            |-------------------------|
                            | 📅 Move to next day     |  <-- Custom
                            | 🦛 Milestone action     |  <-- Conditional
                            |-------------------------|
                            | 🎨 Task color       ▶  |
                            | 🗑️ Delete task          |
                            +-------------------------+
```

---

## 1. Basic Task Menu Customization

### 1.1 Add Custom Menu Items

```javascript
import { Gantt, Toast, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    loadUrl: 'data/tasks.json'
});

const gantt = new Gantt({
    appendTo: 'container',

    // Show color picker in context menu
    showTaskColorPickers: true,

    features: {
        taskMenu: {
            items: {
                // Add custom item with separator
                moveToNextDay: {
                    icon: 'fa fa-calendar',
                    text: 'Move to next day',
                    cls: 'b-separator',  // Add separator before this item
                    onItem({ taskRecord }) {
                        taskRecord.shift(1, 'day');
                    }
                },

                // Add conditional item
                milestoneAction: {
                    icon: 'fa fa-flag',
                    text: 'Milestone action',
                    onItem() {
                        Toast.show('Performed milestone action');
                    }
                },

                // Customize built-in item
                editTask: {
                    icon: 'fa fa-edit'  // Change icon
                }
            },

            // Dynamically show/hide items
            processItems({ taskRecord, items }) {
                // Hide "Delete task" for parent tasks
                if (taskRecord.isParent) {
                    items.deleteTask = false;
                }

                // Hide milestone action for non-milestones
                if (!taskRecord.isMilestone) {
                    items.milestoneAction = false;
                }
            }
        }
    },

    columns: [
        { type: 'name', width: 250 }
    ],

    project
});

project.load();
```

---

## 2. Advanced Menu Configuration

### 2.1 Submenus

```javascript
features: {
    taskMenu: {
        items: {
            prioritySubmenu: {
                text: 'Set Priority',
                icon: 'fa fa-exclamation',
                menu: {
                    items: {
                        high: {
                            text: 'High',
                            icon: 'fa fa-arrow-up',
                            cls: 'priority-high',
                            onItem({ taskRecord }) {
                                taskRecord.priority = 'high';
                            }
                        },
                        medium: {
                            text: 'Medium',
                            icon: 'fa fa-minus',
                            onItem({ taskRecord }) {
                                taskRecord.priority = 'medium';
                            }
                        },
                        low: {
                            text: 'Low',
                            icon: 'fa fa-arrow-down',
                            cls: 'priority-low',
                            onItem({ taskRecord }) {
                                taskRecord.priority = 'low';
                            }
                        }
                    }
                }
            }
        }
    }
}
```

### 2.2 Checkable Items

```javascript
features: {
    taskMenu: {
        items: {
            toggleCritical: {
                text: 'Mark as Critical',
                icon: 'fa fa-star',
                checked: false,  // Makes it checkable
                onItem({ taskRecord, item }) {
                    taskRecord.critical = !taskRecord.critical;
                    item.checked = taskRecord.critical;
                }
            }
        },

        processItems({ taskRecord, items }) {
            // Set initial checked state
            if (items.toggleCritical) {
                items.toggleCritical.checked = taskRecord.critical;
            }
        }
    }
}
```

### 2.3 Disabled Items

```javascript
features: {
    taskMenu: {
        processItems({ taskRecord, items }) {
            // Disable delete for certain tasks
            if (taskRecord.name === 'Important Task') {
                items.deleteTask = {
                    disabled: true,
                    tooltip: 'Cannot delete important tasks'
                };
            }

            // Disable move if task has dependencies
            if (taskRecord.predecessors.length > 0) {
                items.moveToNextDay = {
                    disabled: true,
                    tooltip: 'Task has dependencies'
                };
            }
        }
    }
}
```

---

## 3. Built-in Menu Items

### 3.1 Default Items Reference

```javascript
// Built-in items that can be customized or hidden
features: {
    taskMenu: {
        items: {
            // Task editing
            editTask: true,           // Edit task dialog
            cut: true,                // Cut task
            copy: true,               // Copy task
            paste: true,              // Paste task

            // Task manipulation
            add: true,                // Add submenu (successor, predecessor, etc.)
            deleteTask: true,         // Delete task

            // Color (when showTaskColorPickers: true)
            taskColor: true,          // Color picker submenu

            // Hide specific items
            convertToMilestone: false // Hide convert to milestone
        }
    }
}
```

---

## 4. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { Toast } from '@bryntum/gantt';
import { useMemo, useCallback } from 'react';

function GanttWithTaskMenu({ projectData }) {
    const handleMoveToNextDay = useCallback(({ taskRecord }) => {
        taskRecord.shift(1, 'day');
        Toast.show(`Moved "${taskRecord.name}" to next day`);
    }, []);

    const handleSetPriority = useCallback((priority) => {
        return ({ taskRecord }) => {
            taskRecord.priority = priority;
            Toast.show(`Set "${taskRecord.name}" priority to ${priority}`);
        };
    }, []);

    const processMenuItems = useCallback(({ taskRecord, items }) => {
        // Hide delete for parents
        if (taskRecord.isParent) {
            items.deleteTask = false;
        }

        // Show milestone action only for milestones
        if (!taskRecord.isMilestone) {
            items.milestoneAction = false;
        }

        // Disable move for tasks with dependencies
        if (taskRecord.predecessors.length > 0) {
            items.moveToNextDay = {
                ...items.moveToNextDay,
                disabled: true,
                tooltip: 'Cannot move - has dependencies'
            };
        }
    }, []);

    const ganttConfig = useMemo(() => ({
        showTaskColorPickers: true,

        features: {
            taskMenu: {
                items: {
                    moveToNextDay: {
                        icon: 'fa fa-calendar-plus',
                        text: 'Move to Next Day',
                        cls: 'b-separator',
                        onItem: handleMoveToNextDay
                    },
                    milestoneAction: {
                        icon: 'fa fa-flag',
                        text: 'Milestone Action',
                        onItem: () => Toast.show('Milestone action executed')
                    },
                    prioritySubmenu: {
                        text: 'Set Priority',
                        icon: 'fa fa-exclamation-circle',
                        menu: {
                            items: {
                                high: {
                                    text: 'High',
                                    icon: 'fa fa-arrow-up',
                                    onItem: handleSetPriority('high')
                                },
                                medium: {
                                    text: 'Medium',
                                    icon: 'fa fa-minus',
                                    onItem: handleSetPriority('medium')
                                },
                                low: {
                                    text: 'Low',
                                    icon: 'fa fa-arrow-down',
                                    onItem: handleSetPriority('low')
                                }
                            }
                        }
                    }
                },
                processItems: processMenuItems
            }
        },

        columns: [
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'duration' }
        ]
    }), [handleMoveToNextDay, handleSetPriority, processMenuItems]);

    return (
        <BryntumGantt
            project={projectData}
            {...ganttConfig}
        />
    );
}
```

---

## 5. Styling

```css
/* Menu container */
.b-menu {
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Menu items */
.b-menuitem {
    padding: 8px 16px;
    transition: background 0.2s;
}

.b-menuitem:hover {
    background: #f5f5f5;
}

/* Separator */
.b-menuitem.b-separator {
    border-top: 1px solid #e0e0e0;
    margin-top: 4px;
    padding-top: 12px;
}

/* Icon styling */
.b-menuitem .b-icon {
    width: 20px;
    margin-right: 12px;
    color: #666;
}

/* Priority colors */
.b-menuitem.priority-high .b-icon {
    color: #f44336;
}

.b-menuitem.priority-low .b-icon {
    color: #4caf50;
}

/* Disabled item */
.b-menuitem.b-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Checkable item */
.b-menuitem.b-checked::before {
    content: '✓';
    margin-right: 8px;
    color: #1976d2;
}

/* Submenu indicator */
.b-menuitem.b-has-submenu::after {
    content: '▶';
    font-size: 10px;
    margin-left: auto;
    color: #999;
}

/* Delete item */
.b-menuitem[data-ref="deleteTask"] .b-icon {
    color: #f44336;
}

/* Edit item */
.b-menuitem[data-ref="editTask"] .b-icon {
    color: #1976d2;
}

/* Custom menu item */
.b-menuitem[data-ref="moveToNextDay"] {
    color: #2e7d32;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Menu item niet zichtbaar | processItems return false | Check condition logic |
| Icon niet weergegeven | Incorrect icon class | Check Font Awesome class |
| onItem niet aangeroepen | Item disabled | Check disabled state |
| Submenu opent niet | menu config fout | Check menu.items structure |

---

## API Reference

### TaskMenu Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `items` | Object | Menu item definitions |
| `processItems` | Function | Dynamic item processor |

### Menu Item Config

| Property | Type | Description |
|----------|------|-------------|
| `text` | String | Item label |
| `icon` | String | Icon CSS class |
| `cls` | String | CSS class(es) |
| `disabled` | Boolean | Disable item |
| `checked` | Boolean | Checkable state |
| `tooltip` | String | Tooltip text |
| `menu` | Object | Submenu config |
| `onItem` | Function | Click handler |

### processItems Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `taskRecord` | TaskModel | Clicked task |
| `items` | Object | Menu items to modify |

### Task Record Methods

| Method | Description |
|--------|-------------|
| `shift(amount, unit)` | Move task by amount |
| `setStartDate(date)` | Set start date |
| `setEndDate(date)` | Set end date |

---

## Bronnen

- **Example**: `examples/taskmenu/`
- **TaskMenu Feature**: `Gantt.feature.TaskMenu`

---

*Priority 2: Medium Priority Features*
