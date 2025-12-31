# SchedulerPro Deep Dive: TaskEdit & Task Editor

## Overview

The TaskEdit feature provides a rich, tabbed popup editor for modifying event/task data. It supports:
- Multiple configurable tabs (General, Resources, Predecessors, Successors, Notes)
- Custom fields and tabs
- Form validation
- STM (State Transaction Manager) integration for undo/redo

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TaskEdit Feature                            │
├─────────────────────────────────────────────────────────────────┤
│  editEvent()                                                    │
│  save() / cancel()                                              │
├─────────────────────────────────────────────────────────────────┤
│                   SchedulerTaskEditor                           │
│  ├── generalTab (FormTab)                                       │
│  │   ├── nameField, startDateField, endDateField               │
│  │   ├── durationField, percentDoneField, effortField          │
│  │   └── resourcesField                                         │
│  ├── predecessorsTab (EditorTab)                                │
│  ├── successorsTab (EditorTab)                                  │
│  ├── resourcesTab (EditorTab)                                   │
│  ├── advancedTab (FormTab)                                      │
│  └── notesTab (FormTab)                                         │
└─────────────────────────────────────────────────────────────────┘
```

## TaskEdit Feature Configuration

```typescript
interface TaskEditConfig {
    type?: 'taskEdit' | 'taskedit';

    // Behavior
    triggerEvent?: string;           // Default: 'eventdblclick'
    blurAction?: 'cancel' | 'save';  // Action on click outside
    saveAndCloseOnEnter?: boolean;   // Save on Enter key
    confirmDelete?: boolean;         // Confirm before delete
    scrollIntoView?: boolean;        // Scroll event into view

    // Editor configuration
    editorClass?: typeof Widget;     // Custom editor class
    editorConfig?: TaskEditorBaseConfig;

    // Tab configuration
    items?: {
        generalTab?: TabConfig | false;
        predecessorsTab?: TabConfig | false;
        successorsTab?: TabConfig | false;
        resourcesTab?: TabConfig | false;
        advancedTab?: TabConfig | false;
        notesTab?: TabConfig | false;
        [customTabName: string]: TabConfig | false;
    };

    // Other options
    weekStartDay?: number;           // 0-6, affects date fields
    minEditSize?: number;            // Min visible size for editing
    suspendHasChangesEvent?: boolean;

    // Disabled state
    disabled?: boolean | 'inert';
}
```

## TaskEdit Class

```typescript
class TaskEdit extends TaskEditBase {
    static readonly isTaskEdit: boolean;
    readonly isTaskEdit: boolean;

    // The editor widget
    editor: SchedulerTaskEditor;

    // Current editing state
    readonly isEditing: boolean;

    // Min visible size to trigger edit
    minEditSize: number;

    // Methods
    editEvent(
        taskRecord: EventModel | Function,
        resourceRecord?: ResourceModel,
        element?: HTMLElement
    ): Promise<any>;

    save(): Promise<any>;
    cancel(): Promise<any>;
}
```

## Basic Usage

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    features: {
        taskEdit: true  // Enable with defaults
    }
});

// Programmatic edit
scheduler.editEvent(scheduler.eventStore.first);
```

## Customizing the Editor

### Hiding Tabs

```javascript
features: {
    taskEdit: {
        items: {
            // Hide these tabs
            notesTab: false,
            predecessorsTab: false,
            successorsTab: false
        }
    }
}
```

### Customizing General Tab

```javascript
features: {
    taskEdit: {
        items: {
            generalTab: {
                title: 'Event Details',  // Change tab title
                items: {
                    // Hide fields
                    endDateField: false,
                    percentDoneField: false,

                    // Configure existing field
                    startDateField: {
                        timeField: {
                            hidden: true  // Hide time picker
                        }
                    },

                    // Add custom field
                    priorityField: {
                        type: 'combo',
                        name: 'priority',
                        label: 'Priority',
                        weight: 200,  // Position after default fields
                        items: ['Low', 'Medium', 'High', 'Critical']
                    }
                }
            }
        }
    }
}
```

### Adding Custom Tabs

```javascript
features: {
    taskEdit: {
        items: {
            // Custom tab
            jobTab: {
                title: 'Job Details',
                weight: 150,  // Position after generalTab (100)
                labelPosition: 'align-before',
                items: {
                    costField: {
                        type: 'number',
                        name: 'cost',
                        label: 'Cost ($)'
                    },
                    contactField: {
                        type: 'text',
                        name: 'contact',
                        label: 'Contact'
                    },
                    phoneField: {
                        type: 'text',
                        name: 'phone',
                        label: 'Phone'
                    },
                    notesField: {
                        type: 'textarea',
                        name: 'notes',
                        label: 'Notes',
                        height: 100
                    }
                }
            }
        }
    }
}
```

### Radio Group Fields

```javascript
items: {
    generalTab: {
        items: {
            priority: {
                type: 'radiogroup',
                name: 'priority',
                label: 'Priority',
                inline: true,
                span: 3,  // Full width
                weight: 150,
                options: {
                    high: 'High',
                    medium: 'Medium',
                    low: 'Low'
                }
            }
        }
    }
}
```

### Editor Configuration

```javascript
features: {
    taskEdit: {
        editorConfig: {
            title: 'Edit Task',
            width: '50em',
            height: 500,
            closable: true,
            cls: 'custom-editor'
        }
    }
}
```

## Custom Model Fields

The task editor automatically works with custom fields defined on your EventModel:

```javascript
import { EventModel, SchedulerPro } from '@bryntum/schedulerpro';

class CustomEvent extends EventModel {
    static get fields() {
        return [
            { name: 'durationUnit', defaultValue: 'hour' },
            { name: 'priority', defaultValue: 'medium' },
            'cost',
            'contact',
            'phone',
            'notes'
        ];
    }
}

const scheduler = new SchedulerPro({
    project: {
        eventModelClass: CustomEvent
    },

    features: {
        taskEdit: {
            items: {
                generalTab: {
                    items: {
                        priorityField: {
                            type: 'combo',
                            name: 'priority',  // Matches field name
                            label: 'Priority',
                            items: ['low', 'medium', 'high']
                        }
                    }
                }
            }
        }
    }
});
```

## Custom Tab Classes

### EditorTab (Non-Form)

For tabs that don't use standard form binding:

```javascript
import { EditorTab, Grid, EventModel } from '@bryntum/schedulerpro';

class SubtaskTab extends EditorTab {
    static type = 'subtasktab';

    static configurable = {
        title: 'Subtasks',
        autoUpdateRecord: false,
        items: {
            grid: {
                type: 'grid',
                flex: '1 1 auto',
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
                        icon: 'b-fa b-fa-plus',
                        onClick: 'up.onAddClick'
                    },
                    remove: {
                        type: 'button',
                        icon: 'b-fa b-fa-trash',
                        onClick: 'up.onRemoveClick'
                    }
                }
            }
        }
    };

    set record(record) {
        super.record = record;
        if (record?.children) {
            this.widgetMap.grid.store.loadData(record.children);
        }
    }

    get record() {
        return super.record;
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
            subtaskTab: {
                type: 'subtasktab',
                weight: 110
            }
        }
    }
}
```

### FormTab (With Fields)

For tabs with standard form fields:

```javascript
import { FormTab } from '@bryntum/schedulerpro';

class BillingTab extends FormTab {
    static type = 'billingtab';

    static configurable = {
        title: 'Billing',
        items: {
            rateField: {
                type: 'number',
                name: 'hourlyRate',
                label: 'Hourly Rate'
            },
            hoursField: {
                type: 'number',
                name: 'estimatedHours',
                label: 'Estimated Hours'
            },
            totalField: {
                type: 'displayfield',
                label: 'Total',
                template: ({ record }) =>
                    `$${(record.hourlyRate || 0) * (record.estimatedHours || 0)}`
            }
        }
    };
}

BillingTab.initClass();
```

## Events

### Before Show

```javascript
listeners: {
    beforeTaskEditShow({ taskRecord, editor }) {
        // Customize editor before showing
        editor.widgetMap.customTab.disabled = !taskRecord.isParent;

        // Or prevent showing
        if (taskRecord.readOnly) {
            return false;
        }
    }
}
```

### Task Saved

```javascript
listeners: {
    beforeTaskSave({ taskRecord, values }) {
        // Validate before save
        if (!values.name) {
            Toast.show('Name is required');
            return false;
        }
    },

    afterTaskSave({ taskRecord }) {
        Toast.show(`Saved: ${taskRecord.name}`);
    }
}
```

### Task Deleted

```javascript
features: {
    taskEdit: {
        confirmDelete: true,
        listeners: {
            beforeTaskDelete({ taskRecord }) {
                if (taskRecord.children?.length) {
                    Toast.show('Cannot delete parent with children');
                    return false;
                }
            }
        }
    }
}
```

## Programmatic Control

### Open Editor

```javascript
// Edit first event on first resource
scheduler.editEvent(
    scheduler.eventStore.first,
    scheduler.resourceStore.first
);

// Edit with custom element anchor
scheduler.editEvent(
    event,
    resource,
    scheduler.getElementFromEventRecord(event)
);

// Create new event and edit
scheduler.editEvent(() => {
    const newEvent = new EventModel({
        name: 'New Task',
        startDate: new Date(),
        duration: 2
    });
    scheduler.eventStore.add(newEvent);
    return newEvent;
}, resource);
```

### Save/Cancel

```javascript
// Save and close
await scheduler.features.taskEdit.save();

// Cancel and close
await scheduler.features.taskEdit.cancel();

// Check if editing
if (scheduler.features.taskEdit.isEditing) {
    // ...
}
```

### Access Editor Widgets

```javascript
const editor = scheduler.features.taskEdit.editor;

// Access specific fields
const nameField = editor.widgetMap.nameField;
nameField.value = 'New Name';

// Access tabs
const generalTab = editor.widgetMap.generalTab;
generalTab.title = 'Updated Title';

// Custom widgets
const customField = editor.widgetMap.myCustomField;
```

## Field Weights (Ordering)

Default field weights in generalTab:
- nameField: 100
- resourcesField: 200
- startDateField: 300
- endDateField: 400
- durationField: 500
- effortField: 600
- percentDoneField: 700

Use weights to position custom fields:

```javascript
items: {
    generalTab: {
        items: {
            // Before name
            codeField: { weight: 50, ... },

            // After name, before resources
            categoryField: { weight: 150, ... },

            // At the end
            customField: { weight: 800, ... }
        }
    }
}
```

## Validation

```javascript
items: {
    generalTab: {
        items: {
            nameField: {
                required: true,
                minLength: 3
            },
            costField: {
                type: 'number',
                name: 'cost',
                label: 'Cost',
                min: 0,
                max: 10000,
                required: true
            },
            emailField: {
                type: 'text',
                name: 'email',
                label: 'Email',
                inputType: 'email'
            }
        }
    }
}
```

## Styling

```css
/* Custom editor styling */
.b-schedulertaskeditor {
    --popup-background-color: #f5f5f5;
}

/* Tab styling */
.b-schedulertaskeditor .b-tabpanel-tab.b-active {
    background-color: #3498db;
    color: white;
}

/* Field styling */
.b-schedulertaskeditor .b-field {
    margin-bottom: 1em;
}

/* Custom tab */
.b-schedulertaskeditor .b-tab-job {
    background: #e8f4f8;
}

/* Read-only appearance */
.b-schedulertaskeditor.b-readonly .b-field {
    opacity: 0.7;
}
```

## Complete Example

```javascript
import { SchedulerPro, EventModel, EditorTab } from '@bryntum/schedulerpro';

// Custom event model
class ProjectEvent extends EventModel {
    static fields = [
        { name: 'durationUnit', defaultValue: 'hour' },
        { name: 'priority', defaultValue: 'medium' },
        'cost',
        'contact',
        'department'
    ];
}

// Custom tab
class ContactTab extends EditorTab {
    static type = 'contacttab';

    static configurable = {
        title: 'Contact',
        items: {
            contactField: {
                type: 'text',
                name: 'contact',
                label: 'Name'
            },
            departmentField: {
                type: 'combo',
                name: 'department',
                label: 'Department',
                items: ['Engineering', 'Sales', 'Marketing', 'Support']
            }
        }
    };
}
ContactTab.initClass();

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        eventModelClass: ProjectEvent,
        autoLoad: true,
        loadUrl: '/api/project'
    },

    features: {
        taskEdit: {
            // Editor settings
            editorConfig: {
                title: 'Edit Project Task',
                width: '45em'
            },

            // Tabs configuration
            items: {
                // Customize general tab
                generalTab: {
                    title: 'Task',
                    items: {
                        // Hide some fields
                        endDateField: false,
                        effortField: false,

                        // Add priority
                        priorityField: {
                            type: 'radiogroup',
                            name: 'priority',
                            label: 'Priority',
                            weight: 150,
                            inline: true,
                            options: {
                                low: 'Low',
                                medium: 'Medium',
                                high: 'High'
                            }
                        },

                        // Add cost
                        costField: {
                            type: 'number',
                            name: 'cost',
                            label: 'Budget ($)',
                            weight: 600,
                            min: 0
                        }
                    }
                },

                // Hide unused tabs
                predecessorsTab: false,
                successorsTab: false,

                // Add custom tab
                contactTab: {
                    type: 'contacttab',
                    weight: 150
                }
            }
        }
    },

    listeners: {
        beforeTaskEditShow({ taskRecord, editor }) {
            // Dynamic customization
            const priorityField = editor.widgetMap.priorityField;
            if (taskRecord.isParent) {
                priorityField.hidden = true;
            }
        },

        afterTaskSave({ taskRecord }) {
            console.log('Saved:', taskRecord.toJSON());
        }
    }
});
```

## Best Practices

1. **Use weights for ordering** - Don't rely on declaration order
2. **Register custom tabs** - Call `initClass()` before using
3. **Bind to model fields** - Use `name` property matching field names
4. **Validate input** - Use field validation options
5. **Handle events** - Use beforeTaskEditShow for dynamic customization
6. **Test STM integration** - Ensure undo/redo works with custom tabs

## API Reference Links

- [TaskEdit Feature](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/feature/TaskEdit)
- [SchedulerTaskEditor Widget](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/widget/SchedulerTaskEditor)
- [EditorTab Base Class](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/widget/taskeditor/EditorTab)
- [FormTab Base Class](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/widget/taskeditor/FormTab)
