# Gantt Implementation: Task Editor

> **Task Editor** voor het aanpassen van de taak-editor met custom tabs en velden.

---

## Overzicht

Bryntum Gantt's Task Editor kan uitgebreid worden met custom tabs, velden en widgets.

```
+--------------------------------------------------------------------------+
| TASK EDITOR                                                    [X]       |
+--------------------------------------------------------------------------+
| [Common] [Notes] [Files] [Resources] [Predecessors] [Successors]         |
+--------------------------------------------------------------------------+
|                                                                          |
|  Name:        [Install Apache                    ]                       |
|  Start Date:  [2024-01-15     ] End Date: [2024-01-20     ]             |
|  Duration:    [5 days         ] % Done:   [███████ 70%    ]             |
|                                                                          |
|  ─────────────────── Custom fields ───────────────────                  |
|                                                                          |
|  Deadline:    [2024-01-25     ]                                         |
|  Priority:    (●) High  ( ) Medium  ( ) Low                             |
|                                                                          |
|  Color:       [████ Blue ▼]                                             |
|                                                                          |
+--------------------------------------------------------------------------+
|                                        [Delete]  [Cancel]  [Save]        |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Task Editor Customization

### 1.1 Custom Fields and Tabs

```javascript
import { Gantt, ProjectModel, TaskModel, StringHelper } from '@bryntum/gantt';

// Custom Task Model with extra field
class MyModel extends TaskModel {
    static fields = [
        { name: 'deadline', type: 'date' },
        { name: 'priority', type: 'string', defaultValue: 'med' }
    ];
}

const project = new ProjectModel({
    autoSetConstraints: true,
    taskModelClass: MyModel,
    loadUrl: 'data/tasks.json'
});

const gantt = new Gantt({
    appendTo: 'container',

    // Shows color picker in task editor and context menu
    showTaskColorPickers: true,

    features: {
        taskEdit: {
            editorConfig: {
                width: '48em',
                modal: {
                    closeOnMaskTap: true
                }
            },
            items: {
                generalTab: {
                    // Change title of General tab
                    title: 'Common',
                    items: {
                        // Add custom divider
                        customDivider: {
                            html: '',
                            dataset: { text: 'Custom fields' },
                            cls: 'b-divider'
                        },
                        // Add deadline field
                        deadlineField: {
                            type: 'datefield',
                            name: 'deadline',
                            label: 'Deadline'
                        },
                        // Add priority radio group
                        priority: {
                            type: 'radiogroup',
                            name: 'priority',
                            label: 'Priority',
                            inline: true,
                            options: {
                                high: 'High',
                                med: 'Medium',
                                low: 'Low'
                            }
                        }
                    }
                },
                // Customize Notes tab with rich text editor
                notesTab: {
                    items: {
                        noteField: {
                            type: 'tinymcefield',
                            width: '100%',
                            height: '30em',
                            tinyMceConfig: {
                                menubar: true
                            }
                        }
                    }
                }
            }
        }
    },

    columns: [
        { type: 'name', width: 350 },
        { type: 'date', field: 'deadline', text: 'Deadline', width: 110 },
        { type: 'eventColor', text: 'Color' }
    ],

    project
});

project.load();
```

---

## 2. Custom Tabs

### 2.1 Files Tab

```javascript
import { Grid, StringHelper } from '@bryntum/gantt';

// Custom Files Tab as Grid
class FilesTab extends Grid {
    static type = 'filestab';

    static configurable = {
        title: 'Files',
        defaults: { labelWidth: 200 },
        columns: [{
            text: 'Files attached to task',
            field: 'name',
            type: 'template',
            template: data => StringHelper.xss`
                <i class="fa fa-fw fa-${data.record.data.icon}"></i>
                ${data.record.data.name}
            `
        }]
    };

    // Called by TaskEditor when task is loaded
    loadEvent(eventRecord) {
        const files = this.generateFiles(eventRecord);
        this.store.data = files;
    }

    generateFiles(task) {
        // Generate sample files based on task
        const fileTypes = [
            { name: 'Document.pdf', icon: 'file-pdf' },
            { name: 'Spreadsheet.xlsx', icon: 'file-excel' },
            { name: 'Presentation.pptx', icon: 'file-powerpoint' },
            { name: 'Image.png', icon: 'image' }
        ];

        return fileTypes.slice(0, Math.floor(Math.random() * 4) + 1);
    }
}

FilesTab.initClass();

// Add to task editor
features: {
    taskEdit: {
        items: {
            filesTab: {
                type: 'filestab',
                weight: 110  // Position after Notes
            }
        }
    }
}
```

### 2.2 Resources Tab

```javascript
import { List, StringHelper } from '@bryntum/gantt';

class ResourceList extends List {
    static type = 'resourcelist';

    static get configurable() {
        return {
            cls: 'b-inline-list',
            items: [],
            itemTpl: resource => StringHelper.xss`
                <img src="images/users/${resource.name.toLowerCase()}.png">
                <div class="b-resource-detail">
                    <div class="b-resource-name">${resource.name}</div>
                    <div class="b-resource-city">
                        ${resource.city}
                        <i data-btip="Deassign resource" class="b-icon b-icon-trash"></i>
                    </div>
                </div>
            `
        };
    }

    // Called by TaskEditor when task is loaded
    loadEvent(taskRecord) {
        this.taskRecord = taskRecord;
        this.store.data = taskRecord.resources;
    }

    // Handle click on trash icon
    onItem({ event, record }) {
        if (event.target.matches('.b-icon-trash')) {
            this.taskRecord.unassign(record);
            this.store.data = this.taskRecord.resources;
        }
    }
}

ResourceList.initClass();

// Add to task editor
features: {
    taskEdit: {
        items: {
            resourcesTab: {
                type: 'container',
                weight: 120,
                title: 'Resources',
                items: {
                    resources: {
                        type: 'resourcelist'
                    }
                }
            }
        }
    }
}
```

---

## 3. Customizing Built-in Tabs

### 3.1 Customize Predecessors Grid

```javascript
features: {
    taskEdit: {
        items: {
            predecessorsTab: {
                items: {
                    grid: {
                        columns: {
                            data: {
                                // Customize the name column
                                name: {
                                    // Custom cell renderer
                                    renderer({ record: dependency }) {
                                        const predecessorTask = dependency.fromTask;
                                        if (predecessorTask) {
                                            return StringHelper.xss`
                                                ${predecessorTask.name} (${predecessorTask.id})
                                            `;
                                        }
                                        return '';
                                    },
                                    // Custom editor dropdown
                                    editor: {
                                        displayValueRenderer(taskRecord) {
                                            return taskRecord
                                                ? StringHelper.xss`${taskRecord.name} (${taskRecord.id})`
                                                : '';
                                        },
                                        listItemTpl(taskRecord) {
                                            return StringHelper.xss`
                                                ${taskRecord.name} (${taskRecord.id})
                                            `;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
```

---

## 4. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { Grid, List, StringHelper } from '@bryntum/gantt';
import { useMemo, useEffect } from 'react';

// Register custom widgets before component
class FilesTab extends Grid {
    static type = 'filestab';
    static configurable = {
        title: 'Files',
        columns: [{
            text: 'Files',
            field: 'name',
            type: 'template',
            template: data => StringHelper.xss`
                <i class="fa fa-${data.record.data.icon}"></i>
                ${data.record.data.name}
            `
        }]
    };

    loadEvent(record) {
        this.store.data = [
            { name: 'Spec.pdf', icon: 'file-pdf' },
            { name: 'Budget.xlsx', icon: 'file-excel' }
        ];
    }
}
FilesTab.initClass();

function GanttWithCustomEditor({ projectData }) {
    const ganttConfig = useMemo(() => ({
        showTaskColorPickers: true,

        features: {
            taskEdit: {
                editorConfig: {
                    width: '48em',
                    modal: { closeOnMaskTap: true }
                },
                items: {
                    generalTab: {
                        title: 'Details',
                        items: {
                            customDivider: {
                                html: '',
                                dataset: { text: 'Custom Fields' },
                                cls: 'b-divider'
                            },
                            priorityField: {
                                type: 'combo',
                                name: 'priority',
                                label: 'Priority',
                                items: ['Low', 'Medium', 'High', 'Critical']
                            },
                            deadlineField: {
                                type: 'datefield',
                                name: 'deadline',
                                label: 'Deadline'
                            }
                        }
                    },
                    filesTab: {
                        type: 'filestab',
                        weight: 110
                    }
                }
            }
        },

        columns: [
            { type: 'name', width: 300 },
            { type: 'startdate' },
            { type: 'duration' },
            { type: 'eventColor', text: 'Color' }
        ]
    }), []);

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
/* Task Editor */
.b-taskeditor {
    max-height: 90vh;
}

/* Custom divider */
.b-taskeditor .b-divider {
    margin: 16px 0 8px;
    padding: 8px 0;
    border-top: 1px solid #e0e0e0;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    color: #666;
}

.b-taskeditor .b-divider::before {
    content: attr(data-text);
}

/* Priority radio group */
.b-radiogroup.inline .b-radio-container {
    display: inline-flex;
    margin-right: 16px;
}

/* Files tab */
.b-filestab .b-grid-row {
    padding: 8px;
}

.b-filestab .fa {
    margin-right: 8px;
    color: #1976d2;
}

/* Resource list */
.b-resourcelist .b-list-item {
    display: flex;
    align-items: center;
    padding: 8px;
}

.b-resourcelist img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 12px;
}

.b-resource-detail {
    flex: 1;
}

.b-resource-name {
    font-weight: 500;
}

.b-resource-city {
    font-size: 12px;
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.b-resource-city .b-icon-trash {
    cursor: pointer;
    opacity: 0.5;
}

.b-resource-city .b-icon-trash:hover {
    opacity: 1;
    color: #f44336;
}

/* Color picker field */
.b-eventcolor-field .b-color-box {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    margin-right: 8px;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Custom field niet opgeslagen | Field niet in TaskModel | Voeg field toe aan TaskModel.fields |
| Tab niet zichtbaar | Weight niet ingesteld | Voeg weight property toe |
| loadEvent niet aangeroepen | Widget niet correct geregistreerd | Check initClass() aanroep |
| Validatie faalt | Required fields missen | Voeg validation toe aan field config |

---

## API Reference

### TaskEdit Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `editorConfig` | Object | Editor popup config |
| `items` | Object | Tab/field definitions |

### Tab Config

| Property | Type | Description |
|----------|------|-------------|
| `title` | String | Tab title |
| `weight` | Number | Tab order (lower = first) |
| `items` | Object | Field definitions |
| `type` | String | Widget type |

### Field Config

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | Field type |
| `name` | String | Model field name |
| `label` | String | Field label |

### Custom Widget Methods

| Method | Description |
|--------|-------------|
| `loadEvent(record)` | Called when task is loaded |
| `initClass()` | Register widget type |

---

## Bronnen

- **Example**: `examples/taskeditor/`
- **TaskEdit Feature**: `Gantt.feature.TaskEdit`

---

*Priority 2: Medium Priority Features*
