# TaskBoard Deep Dive: Task Editing

> **Complete guide** voor task editing in Bryntum TaskBoard - SimpleTaskEdit vs TaskEdit, custom fields, validation, en rich text editors.

---

## Overzicht

TaskBoard biedt twee verschillende benaderingen voor task editing:

| Feature | Beschrijving | Use Case |
|---------|--------------|----------|
| **SimpleTaskEdit** | Inline editing direct op de kaart | Snelle edits, inline aanpassingen |
| **TaskEdit** | Popup editor met formulier | Uitgebreide editing, meerdere velden |

Beide features zijn standaard beschikbaar en kunnen geconfigureerd of uitgeschakeld worden.

---

## 1. SimpleTaskEdit Feature

### 1.1 Basis Concept

SimpleTaskEdit maakt inline editing mogelijk door direct op TaskItems te klikken:

```javascript
const taskBoard = new TaskBoard({
    features: {
        simpleTaskEdit: true  // Standaard aan
    },

    // TaskItems met inline editors
    headerItems: {
        text: {
            field: 'name',
            // Configure inline editor
            editor: {
                type: 'text',
                required: true
            }
        }
    },

    footerItems: {
        team: {
            type: 'text',
            editor: {
                type: 'combo',
                items: ['Dev', 'QA', 'UX']
            }
        }
    }
});
```

### 1.2 Editor Types voor TaskItems

Elk TaskItem kan zijn eigen editor type hebben:

```javascript
headerItems: {
    // Text editor (default)
    name: {
        type: 'text',
        field: 'name',
        editor: { type: 'text', required: true }
    }
},

bodyItems: {
    // Number editor
    progress: {
        type: 'progress',
        editor: { type: 'number', min: 0, max: 100 }
    }
},

footerItems: {
    // Combo editor
    status: {
        type: 'text',
        field: 'status',
        editor: {
            type: 'combo',
            items: ['todo', 'doing', 'done']
        }
    },

    // Date editor
    deadline: {
        type: 'text',
        field: 'deadline',
        editor: { type: 'date' }
    },

    // Tags editor (special)
    tags: {
        type: 'tags',
        editor: { type: 'combo', multiSelect: true }
    }
}
```

### 1.3 SimpleTaskEdit Events

```javascript
taskBoard.on({
    // Before editing starts - return false to prevent
    beforeSimpleTaskEdit({ simpleTaskEdit, taskRecord, field }) {
        console.log(`Editing field: ${field} on task: ${taskRecord.name}`);

        // Prevent editing for read-only tasks
        if (taskRecord.readOnly) {
            return false;
        }
    },

    // When editing completes successfully
    simpleTaskEditComplete({ simpleTaskEdit, taskRecord, field }) {
        console.log(`Completed editing: ${taskRecord.name}`);
    },

    // When editing is cancelled
    simpleTaskEditCancel({ simpleTaskEdit, taskRecord, field }) {
        console.log('Edit cancelled');
    }
});
```

### 1.4 New Task Defaults

Configureer standaardwaarden voor nieuwe tasks:

```javascript
const taskBoard = new TaskBoard({
    features: {
        simpleTaskEdit: true
    },

    // Defaults voor nieuwe tasks
    newTaskDefaults: {
        name: 'Add title',
        description: 'Add description',
        team: 'Pick team',
        priority: 'medium'
    }
});
```

---

## 2. TaskEdit Feature (Popup Editor)

### 2.1 Basis Configuratie

TaskEdit toont een popup editor bij dubbelklik:

```javascript
const taskBoard = new TaskBoard({
    features: {
        taskEdit: {
            // Editor configuratie
            editorConfig: {
                modal: true,
                width: '35em',
                autoUpdateRecord: true,  // Live update
                labelPosition: 'align-before'
            }
        }
    }
});
```

### 2.2 Custom Items Toevoegen

```javascript
features: {
    taskEdit: {
        items: {
            // Verander bestaand veld label
            name: {
                label: 'Task Title'
            },

            // Rich text editor voor description
            description: {
                type: 'textarea',
                height: '10em'
            },

            // Nieuw custom veld
            department: {
                type: 'radiogroup',
                name: 'department',
                label: 'Department',
                inline: true,
                clearable: true,
                weight: 550,  // Positionering
                options: {
                    marketing: 'Marketing',
                    sales: 'Sales',
                    support: 'Support'
                }
            },

            // Date picker
            deadline: {
                type: 'date',
                name: 'deadline',
                label: 'Deadline',
                weight: 250
            }
        }
    }
}
```

### 2.3 processItems voor Dynamische Configuratie

```javascript
features: {
    taskEdit: {
        processItems({ items, taskRecord, columnRecord, swimlaneRecord }) {
            // Hide resource picker voor completed tasks
            if (taskRecord.status === 'done') {
                items.resources = null;
            }

            // Voeg deadline toe voor andere tasks
            else {
                items.deadline = {
                    type: 'date',
                    name: 'deadline',
                    label: 'Deadline',
                    weight: 250
                };
            }

            // Pas items aan op basis van swimlane
            if (swimlaneRecord?.id === 'high') {
                items.urgentNote = {
                    type: 'textarea',
                    label: 'Urgent Notes',
                    weight: 300
                };
            }

            // Return false om editor te blokkeren
            // return false;
        }
    }
}
```

### 2.4 TaskEdit Events

```javascript
taskBoard.on({
    // Before editor is created - return false to prevent
    beforeTaskEdit({ taskRecord }) {
        // Prevent editing specific tasks
        if (taskRecord.id === 11) {
            return false;
        }
    },

    // After editor is created, before task is loaded
    beforeTaskEditShow({ taskRecord, editor }) {
        // Customize editor title
        editor.title = `Editing "${taskRecord.name}"`;

        // Access and modify editor fields
        const nameField = editor.widgetMap.name;
        if (nameField) {
            nameField.readOnly = taskRecord.locked;
        }
    }
});
```

### 2.5 Auto Update vs Save/Cancel Buttons

```javascript
features: {
    taskEdit: {
        editorConfig: {
            // Live updating (geen Save/Cancel buttons)
            autoUpdateRecord: true
        }
    }
}

// Of met buttons
features: {
    taskEdit: {
        editorConfig: {
            autoUpdateRecord: false  // Toont Save/Cancel
        }
    }
}
```

Runtime toggle:

```javascript
// Toggle via toolbar
tbar: [
    {
        type: 'slidetoggle',
        text: 'Auto update',
        checked: true,
        onChange({ checked }) {
            taskBoard.features.taskEdit.editorConfig.autoUpdateRecord = checked;
        }
    }
]
```

---

## 3. TinyMCE Rich Text Editor Integratie

### 3.1 Custom TinyMceField Widget

```javascript
import { RichTextField, Delayable, DomHelper, GlobalEvents } from '@bryntum/taskboard';

class TinyMceField extends RichTextField.mixin(Delayable) {
    static $name = 'TinyMceField';
    static type = 'tinymcefield';

    tinymce = null;

    static configurable = {
        // TinyMCE config passthrough
        tinyMceConfig: {},

        // License key
        licenseKey: '',

        // Inline mode
        inline: false,

        // Resize options
        resize: false,

        // Menubar
        menubar: false,

        // Auto focus
        autoFocus: true,

        // Root block element
        rootBlock: 'div',

        inputAttributes: {
            tag: 'textarea'
        }
    };

    construct(config = {}) {
        super.construct(config);

        GlobalEvents.ion({
            theme: 'destroyEditor',
            thisObj: this
        });

        this.ion({
            paint: 'internalOnPaint',
            thisObj: this
        });
    }

    doDestroy() {
        this.destroyEditor();
        super.doDestroy();
    }

    destroyEditor() {
        this.detachListeners('popup-hide');
        this.editor?.destroy();
        this.editor = null;
    }

    setupEditor(editor) {
        const me = this;

        editor.on('NodeChange', event => me.onEditorNodeChange(event));

        if (!me.inline) {
            editor.on('keydown', event => me.onEditorKeyDown(event));
        }

        // Handle popup closing
        const popup = me.up('popup', true);
        popup?.ion({
            name: 'popup-hide',
            hide: 'destroyEditor',
            once: true,
            thisObj: me
        });
    }

    internalOnPaint() {
        const me = this;

        if (me.editor) {
            me.destroyEditor();
        }

        globalThis.tinymce.init({
            ...me.tinyMceConfig,
            license_key: me.licenseKey,
            auto_focus: me.autoFocus,
            inline: me.inline,
            forced_root_block: me.rootBlock,
            menubar: me.menubar,
            resize: me.resize,
            height: me.height,
            target: me.input,
            content_css: !me.inline && DomHelper.isDarkTheme ? 'dark' : null,
            skin: DomHelper.isDarkTheme ? 'oxide-dark' : 'oxide',
            ui_mode: 'split',
            setup: editor => me.setupEditor(editor)
        }).then(allEditors => me.editor = allEditors.at(-1));
    }

    // Escape key handling
    onEditorKeyDown(event) {
        if (event.key === 'Escape') {
            const newEvent = new KeyboardEvent('keydown', { ...event });
            this.element.dispatchEvent(newEvent);
            return false;
        }
    }

    onEditorNodeChange({ target }) {
        if (this.isDestroying) return;

        const oldValue = this.value;
        const value = target.getContent();

        if (value === oldValue) return;

        this.richText = value;
        this.triggerFieldChange({
            value,
            oldValue,
            userAction: true
        });
    }

    owns(target) {
        return super.owns(target) || Boolean(target?.closest('.tox-tinymce'));
    }
}

TinyMceField.initClass();
```

### 3.2 Gebruik in TaskEdit

```javascript
features: {
    taskEdit: {
        editorConfig: {
            // Modal nodig voor rich text editor focus
            modal: {
                closeOnMaskTap: true
            },
            autoUpdateRecord: true,
            width: '35em'
        },

        items: {
            name: { label: 'Title' },

            // TinyMCE voor description
            description: {
                type: 'tinymcefield',
                height: '14em',
                tinyMceConfig: {
                    toolbar_mode: 'sliding'
                }
            }
        }
    }
}
```

---

## 4. Programmatic Task Editing

### 4.1 editTask() Method

```javascript
// Open editor voor specifieke task
const task = taskBoard.project.taskStore.getById(16);
taskBoard.editTask(task);

// Met custom element alignment
const cardElement = taskBoard.getTaskElement(task);
taskBoard.editTask(task, cardElement);
```

### 4.2 Na Data Load

```javascript
project: {
    loadUrl: 'data/data.json',
    autoLoad: true,

    listeners: {
        load() {
            // Wacht even voor rendering
            setTimeout(() => {
                if (!taskBoard.isDestroyed) {
                    const task = taskBoard.project.taskStore.getById(16);
                    if (task) {
                        taskBoard.editTask(task);
                    }
                }
            }, 500);
        }
    }
}
```

---

## 5. Custom TaskEditor Widget

### 5.1 Extending TaskEditor

```javascript
import { TaskEditor } from '@bryntum/taskboard';

class MyTaskEditor extends TaskEditor {
    static type = 'mytaskeditor';

    static configurable = {
        // Custom default items
        items: {
            customSection: {
                type: 'container',
                weight: 600,
                items: {
                    customField1: { type: 'text', label: 'Custom 1' },
                    customField2: { type: 'number', label: 'Custom 2' }
                }
            }
        }
    };

    // Override save behavior
    async save() {
        // Custom validation
        if (!this.isValid()) {
            return false;
        }

        await super.save();

        // Custom post-save logic
        this.trigger('customSave', { record: this.record });
    }
}

MyTaskEditor.initClass();
```

### 5.2 Gebruik Custom Editor

```javascript
features: {
    taskEdit: {
        editorType: 'mytaskeditor',
        editorConfig: {
            // Config voor custom editor
        }
    }
}
```

---

## 6. TaskEditor Widget Configuratie

### 6.1 Alle Beschikbare Configs

```javascript
editorConfig: {
    // Positioning
    modal: true,                    // Als modal tonen
    centered: true,                 // Gecentreerd op scherm
    draggable: true,                // Versleepbaar

    // Sizing
    width: '35em',
    height: 'auto',
    maxHeight: '80vh',

    // Behavior
    autoUpdateRecord: true,         // Live updates
    autoClose: true,                // Sluit bij click buiten
    closeAction: 'hide',            // 'hide' of 'destroy'
    saveAndCloseOnEnter: true,      // Enter = save

    // Layout
    labelPosition: 'align-before',  // Label positie

    // Appearance
    cls: 'my-task-editor',
    title: 'Edit Task',

    // Tools (header buttons)
    tools: {
        close: { cls: 'b-icon-close', handler: 'close' }
    },

    // Bottom bar
    bbar: {
        items: {
            saveBtn: { text: 'Save', handler: 'save' },
            cancelBtn: { text: 'Cancel', handler: 'cancel' }
        }
    }
}
```

### 6.2 Default Editor Items

De TaskEditor bevat standaard:

| Item Ref | Type | Beschrijving |
|----------|------|--------------|
| `name` | TextField | Task naam |
| `description` | TextAreaField | Beschrijving |
| `resources` | ResourcesCombo | Assigned resources |
| `color` | ColorField | Task kleur |

```javascript
items: {
    // Verberg standaard item
    color: null,

    // Wijzig standaard item
    name: {
        label: 'Task Title',
        required: true
    },

    // Voeg nieuw item toe
    priority: {
        type: 'combo',
        name: 'priority',
        label: 'Priority',
        weight: 200,
        items: ['low', 'medium', 'high']
    }
}
```

---

## 7. Validation

### 7.1 Field Level Validation

```javascript
items: {
    name: {
        type: 'text',
        label: 'Title',
        required: true,
        minLength: 3,
        maxLength: 100
    },

    deadline: {
        type: 'date',
        label: 'Deadline',
        min: new Date(),  // Niet in het verleden
        required: true
    },

    estimate: {
        type: 'number',
        label: 'Estimate (hours)',
        min: 0,
        max: 1000
    }
}
```

### 7.2 Custom Validators

```javascript
items: {
    email: {
        type: 'text',
        label: 'Contact Email',
        validators: [
            {
                fn: value => {
                    if (!value) return true;
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(value) || 'Invalid email format';
                }
            }
        ]
    },

    customField: {
        type: 'text',
        label: 'Custom',
        validators: [
            'required',
            {
                fn: (value, field) => {
                    // Access other fields via field.owner
                    const editor = field.owner;
                    const otherValue = editor.values.otherField;
                    return value !== otherValue || 'Must be different';
                }
            }
        ]
    }
}
```

---

## 8. Custom Field Types

### 8.1 Gebruik Bryntum Widget Types

```javascript
items: {
    // Slider
    progress: {
        type: 'slider',
        name: 'progress',
        label: 'Progress',
        min: 0,
        max: 100,
        showValue: true
    },

    // Checkbox
    urgent: {
        type: 'checkbox',
        name: 'urgent',
        label: 'Urgent'
    },

    // Radio group
    priority: {
        type: 'radiogroup',
        name: 'priority',
        label: 'Priority',
        inline: true,
        options: {
            low: 'Low',
            medium: 'Medium',
            high: 'High'
        }
    },

    // Combo (dropdown)
    assignee: {
        type: 'combo',
        name: 'assignee',
        label: 'Assignee',
        editable: false,
        store: resourceStore,
        displayField: 'name',
        valueField: 'id'
    },

    // Duration
    duration: {
        type: 'duration',
        name: 'duration',
        label: 'Duration'
    },

    // Time
    startTime: {
        type: 'time',
        name: 'startTime',
        label: 'Start Time'
    }
}
```

---

## 9. TypeScript Interfaces

```typescript
// SimpleTaskEdit Config
interface SimpleTaskEditConfig {
    type?: 'simpleTaskEdit';
    disabled?: boolean | 'inert';
    bubbleEvents?: object;
    listeners?: SimpleTaskEditListeners;
}

// SimpleTaskEdit Events
interface SimpleTaskEditListeners {
    beforeSimpleTaskEdit?: (event: {
        source: TaskBoard;
        simpleTaskEdit: SimpleTaskEdit;
        taskRecord: TaskModel;
        field: string;
    }) => Promise<boolean> | boolean | void;

    simpleTaskEditComplete?: (event: {
        source: TaskBoard;
        simpleTaskEdit: SimpleTaskEdit;
        taskRecord: TaskModel;
        field: string;
    }) => void;

    simpleTaskEditCancel?: (event: {
        source: TaskBoard;
        simpleTaskEdit: SimpleTaskEdit;
        taskRecord: TaskModel;
        field: string;
    }) => void;
}

// TaskEdit Config
interface TaskEditConfig {
    type?: 'taskEdit' | 'taskedit';
    disabled?: boolean | 'inert';
    editorConfig?: TaskEditorConfig;
    editorType?: string;
    items?: Record<string, ContainerItemConfig | boolean | null>;
    listeners?: TaskEditListeners;
    processItems?: (context: {
        feature: TaskEdit;
        items: Record<string, ContainerItemConfig>;
        taskRecord: TaskModel;
        columnRecord: ColumnModel;
        swimlaneRecord: SwimlaneModel;
    }) => boolean | void;
}

// TaskEditor Config
interface TaskEditorConfig {
    adopt?: HTMLElement | string;
    align?: object | string;
    autoClose?: boolean;
    autoUpdateRecord?: boolean;
    bbar?: object;
    bodyCls?: string;
    bubbleEvents?: object;
    centered?: boolean;
    closeAction?: 'hide' | 'destroy';
    cls?: string;
    collapsible?: boolean | object;
    color?: string;
    disabled?: boolean;
    dock?: 'top' | 'right' | 'bottom' | 'left' | 'header';
    draggable?: boolean | object;
    drawer?: boolean;
    footer?: object | string;
    header?: object | string | boolean;
    height?: string | number;
    hideAnimation?: object | boolean;
    html?: string | object;
    items?: object | object[];
    labelPosition?: 'before' | 'above' | 'inline';
    layout?: string | object;
    listeners?: TaskEditorListeners;
    maximizeOnMobile?: boolean;
    modal?: boolean | object;
    monitorResize?: boolean;
    positioned?: boolean;
    readOnly?: boolean;
    record?: TaskModel;
    resizable?: boolean | object;
    saveAndCloseOnEnter?: boolean;
    scrollable?: boolean | object;
    showAnimation?: object | boolean;
    tbar?: object;
    title?: string;
    tools?: object;
    tooltip?: string | object;
    width?: string | number;
}

// TaskEditor Events
interface TaskEditorListeners {
    beforeCancel?: (event: {
        source: TaskBoard;
        editor: TaskEditor;
    }) => Promise<boolean> | boolean | void;

    cancel?: (event: {
        source: TaskBoard;
        editor: TaskEditor;
    }) => void;

    paint?: (event: { source: TaskEditor }) => void;
}

// TaskBoard Edit Events
interface TaskBoardEditEvents {
    beforeTaskEdit?: (event: {
        source: TaskBoard;
        taskRecord: TaskModel;
    }) => Promise<boolean> | boolean | void;

    beforeTaskEditShow?: (event: {
        source: TaskBoard;
        taskRecord: TaskModel;
        editor: TaskEditor;
    }) => void;
}

// TaskEdit Feature
interface TaskEdit extends TaskBoardFeature {
    readonly isTaskEdit: boolean;
    editTask(taskRecord: TaskModel, element?: HTMLElement): Promise<void>;
}

// SimpleTaskEdit Feature
interface SimpleTaskEdit extends TaskBoardFeature {
    readonly isSimpleTaskEdit: boolean;
    editTask(taskRecord: TaskModel, element?: HTMLElement): boolean;
}

// TaskItem Editor Config
interface TaskItemEditorConfig {
    type: string;  // 'text', 'number', 'combo', 'date', etc.
    required?: boolean;
    items?: any[];  // For combo
    min?: number;
    max?: number;
    multiSelect?: boolean;
}

// TaskItem with Editor
interface TaskItemWithEditor extends TaskItemOptions {
    editor?: TaskItemEditorConfig | false;
}
```

---

## 10. Best Practices

### 10.1 Kies de Juiste Approach

| Scenario | Aanbevolen |
|----------|------------|
| Snelle naam edit | SimpleTaskEdit |
| Status wijzigen | SimpleTaskEdit met combo |
| Meerdere velden | TaskEdit |
| Rich text | TaskEdit + TinyMCE |
| Complex formulier | Custom TaskEditor |

### 10.2 Performance Tips

```javascript
// Lazy loading van editor
features: {
    taskEdit: {
        editorConfig: {
            lazyItems: true  // Items pas bij tonen laden
        }
    }
}

// Cleanup bij theme switch
GlobalEvents.ion({
    theme: () => {
        // Rich text editors opnieuw initialiseren
    }
});
```

### 10.3 UX Guidelines

1. **Auto-update voor live feedback** - Gebruikers zien direct resultaat
2. **Modal voor focus** - Bij rich text editors
3. **Validation feedback** - Directe foutmeldingen
4. **Consistent labeling** - Dezelfde labels als op cards

---

## Samenvatting

| Aspect | SimpleTaskEdit | TaskEdit |
|--------|----------------|----------|
| **Trigger** | Klik op TaskItem | Dubbelklik op card |
| **UI** | Inline editor | Popup formulier |
| **Velden** | Één tegelijk | Meerdere tegelijk |
| **Customization** | Via TaskItem editor config | Via items config |
| **Rich content** | Beperkt | Volledig (TinyMCE) |
| **Validation** | Basis | Uitgebreid |

---

*Laatst bijgewerkt: December 2024*
*Bryntum TaskBoard v7.1.0*
