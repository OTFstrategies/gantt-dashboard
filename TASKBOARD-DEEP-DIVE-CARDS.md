# TaskBoard Deep Dive: Cards & Task Items

> **Diepgaande analyse** van card rendering, custom fields, avatars, templates, task editor en alle item types.
> Dit document bevat uitgebreide TypeScript interfaces, code voorbeelden uit alle relevante examples, en interne werking.

---

## Overzicht

Elke taak op de TaskBoard wordt weergegeven als een **card** met drie secties:
- **Header**: Taaknaam, collapse button, avatars, custom items
- **Body**: Beschrijving, progress bar, afbeeldingen, charts
- **Footer**: Tags, deadline, team info, resource avatars

De inhoud van elke sectie wordt bepaald door **TaskItems** - lichtgewicht componenten die data uit het TaskModel visualiseren.

### Card Architectuur

```
┌─────────────────────────────────────────────────────┐
│                      CARD                            │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │                   HEADER                         │ │
│ │  [collapse] [icon] Task Name     [resourceAvatars]│ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │                    BODY                          │ │
│ │  [description]                                   │ │
│ │  [progress bar ████████░░ 80%]                   │ │
│ │  [image]                                         │ │
│ │  [chart]                                         │ │
│ │  [todoList]                                      │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │                   FOOTER                         │ │
│ │  [tags: #urgent #backend]   [deadline: Jan 15]  │ │
│ │  [team: Dev]                [resourceAvatars]    │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 1. TaskModel - Volledige API

> **Bron**: `taskboard.d.ts:132882-133135`

### Complete TypeScript Interface

```typescript
// Uit taskboard.d.ts - TaskModel configuratie
interface TaskModelConfig {
    // === IDENTIFICATIE ===
    id?: string | number;
    name?: string;
    description?: string;

    // === KANBAN MAPPING ===
    status?: string;           // Voor column mapping (columnField)
    prio?: string | number;    // Voor swimlane mapping (swimlaneField)
    weight?: number;           // Sorteervolgorde binnen column

    // === STATE ===
    collapsed?: boolean;       // Card body ingeklapt
    readOnly?: boolean;        // Niet bewerkbaar
    draggable?: boolean;       // Kan versleept worden (default: true)

    // === STYLING ===
    eventColor?: TaskColor | string | null;
    eventStyle?: EventStyle | null;
    cls?: DomClassList | string | string[] | object;
    style?: string;
    iconCls?: string;

    // === RESOURCES ===
    resourceId?: string | number;           // Enkele resource
    resourceIds?: string[] | number[];      // Meerdere resources
    resources?: ResourceModel[];            // Resource instances

    // === TIMING (optioneel) ===
    startDate?: string | Date;
    endDate?: string | Date;
    duration?: number;
    durationUnit?: DurationUnit;
    allDay?: boolean;

    // === RECURRENCE ===
    recurrenceRule?: string;
    exceptionDates?: string | string[];
}

type TaskColor =
    | 'red' | 'pink' | 'magenta' | 'purple' | 'violet'
    | 'deep-purple' | 'indigo' | 'blue' | 'light-blue' | 'cyan'
    | 'teal' | 'green' | 'light-green' | 'lime' | 'yellow'
    | 'orange' | 'amber' | 'deep-orange' | 'light-gray' | 'gray';

type EventStyle = 'plain' | 'border' | 'colored' | 'line' | 'dashed' |
    'minimal' | 'rounded' | 'calendar' | 'interday' | 'hollow';
```

### TaskModel Class

```typescript
class TaskModel extends EventModel {
    // === STATIC PROPERTIES ===
    static readonly isTaskModel: true;

    // === READ-ONLY PROPERTIES ===
    readonly isEvent: boolean;
    readonly resources: ResourceModel[];
    readonly assignments: AssignmentModel[];

    // === CONFIGUREERBARE PROPERTIES ===
    collapsed: boolean;
    color: TaskColor | string | null;
    draggable: boolean;
    iconCls: string;
    name: string;
    description: string;
    prio: string | number;
    readOnly: boolean;
    status: string;
    weight: number;

    // === METHODES ===

    /**
     * Assign resource to task
     */
    assign(resource: ResourceModel | string | number): AssignmentModel;

    /**
     * Unassign resource from task
     */
    unassign(resource: ResourceModel | string | number): void;

    /**
     * Check if resource is assigned
     */
    isAssignedTo(resource: ResourceModel | string | number): boolean;
}
```

### Custom TaskModel

```javascript
// Bron: examples/task-items/app.module.js
import { TaskModel } from '@bryntum/taskboard';

class CustomTask extends TaskModel {
    // Methode 1: static fields array
    static fields = [
        'team',
        'progress',
        'image',
        'imageDescription',
        'rating',
        { name: 'deadline', type: 'date' },
        { name: 'todo', type: 'array' },
        { name: 'activity', type: 'array' }
    ];

    // Methode 2: static get (voor dynamische velden)
    static get fields() {
        return [
            'category',
            'team',
            'quarter'
        ];
    }
}

const taskBoard = new TaskBoard({
    project: {
        taskModelClass: CustomTask,
        loadUrl: 'data/data.json',
        autoLoad: true
    }
});

// Alternatief: Lazy field definitie zonder subclassing
const taskBoard = new TaskBoard({
    project: {
        taskStore: {
            fields: [
                'team',
                'progress',
                { name: 'deadline', type: 'date' },
                { name: 'todo', type: 'array' }
            ]
        }
    }
});
```

---

## 2. Task Items Systeem

> **Bron**: `taskboard.d.ts:1665-1744, 142638-143437`

### TaskItemOptions Interface

```typescript
interface TaskItemOptions {
    // === TYPE DEFINITIE ===
    type?: TaskItemType;

    // === VELD BINDING ===
    field?: string;            // Veld op TaskModel (default: item key)

    // === STYLING ===
    style?: string | object;   // Inline CSS
    cls?: string;              // CSS class

    // === ORDERING ===
    order?: number;            // Flex order voor positionering
    hidden?: boolean;          // Verbergen

    // === EDITOR ===
    editor?: string | object | null;  // Editor configuratie of false

    // === TYPE-SPECIFIEKE OPTIES ===
    // Voor 'image'
    baseUrl?: string;
    altField?: string;

    // Voor 'template'
    template?: TemplateFunction;
    renderNull?: boolean;

    // Voor 'progress'
    max?: number;              // Maximum waarde (default: 100)

    // Voor 'rating'
    max?: number;              // Aantal sterren (default: 5)

    // Voor 'resourceAvatars'
    maxAvatars?: number;
    overlap?: boolean;

    // Voor 'todoList'
    textField?: string;
    checkedField?: string;

    // Voor 'tags'
    separator?: string;
    textProperty?: string;
    clsProperty?: string;

    // Voor 'jsx' (React)
    jsx?: ReactElement;
}

type TaskItemType =
    | 'text'            // Tekst weergave (XSS-safe)
    | 'template'        // Custom template/DomConfig
    | 'image'           // Afbeelding
    | 'progress'        // Voortgangsbalk
    | 'rating'          // Sterren rating
    | 'resourceAvatars' // Resource avatars
    | 'tags'            // Tags/labels
    | 'separator'       // Scheidingslijn
    | 'collapse'        // In-/uitklap button
    | 'taskMenu'        // Context menu button
    | 'chart'           // Chart.js grafiek
    | 'todoList'        // Checkbox lijst
    | 'jsx';            // React component

type TemplateFunction = (context: {
    value: any;
    taskRecord: TaskModel;
}) => string | DomConfig;
```

---

## 3. Header, Body & Footer Items

### Volledige Configuratie Voorbeeld

```javascript
// Bron: examples/task-items/app.module.js
const taskBoard = new TaskBoard({
    // === HEADER ITEMS ===
    headerItems: {
        // Collapse button (links)
        collapsed: { type: 'collapse' },

        // Custom icon template
        'icon > name': {
            type: 'template',
            template: ({ taskRecord }) =>
                `<i class="fa fa-${taskRecord.iconCls || 'tasks'}"></i>`
        },

        // Resource avatars (rechts)
        resourceAvatars: { type: 'resourceAvatars', maxAvatars: 3 },

        // Custom priority indicator
        prio: {
            type: 'template',
            template: ({ taskRecord }) => {
                const colors = {
                    critical: 'red',
                    high: 'orange',
                    medium: 'yellow',
                    low: 'green'
                };
                const color = colors[taskRecord.prio] || 'gray';
                return `<span class="prio-badge" style="background:${color}">
                    ${taskRecord.prio}
                </span>`;
            }
        }
    },

    // === BODY ITEMS ===
    bodyItems: {
        // Beschrijving als tekst
        description: { type: 'text' },

        // Progress bar (0-100)
        progress: {
            type: 'progress',
            max: 100,
            style: 'height: 8px; margin: 8px 0'
        },

        // Afbeelding
        image: {
            type: 'image',
            baseUrl: 'resources/images/',
            altField: 'imageDescription'
        },

        // Scheidingslijn
        separator: { type: 'separator' },

        // Rating (sterren)
        rating: {
            type: 'rating',
            max: 5
        },

        // Todo lijst
        todo: {
            type: 'todoList',
            textField: 'text',
            checkedField: 'done'
        },

        // Chart
        activity: {
            type: 'chart',
            chartType: 'line',
            chartConfig: {
                showPoints: false,
                max: 8
            }
        }
    },

    // === FOOTER ITEMS ===
    footerItems: {
        // Tags/labels
        tags: {
            type: 'tags',
            separator: ','
        },

        // Team indicator
        team: {
            type: 'template',
            template: ({ value }) =>
                value ? `<i class="fa fa-users"></i> ${value}` : ''
        },

        // Deadline
        deadline: {
            type: 'template',
            template: ({ value }) => {
                if (!value) return '';
                const date = new Date(value);
                const isOverdue = date < new Date();
                return `<span class="${isOverdue ? 'overdue' : ''}">
                    <i class="fa fa-calendar"></i>
                    ${DateHelper.format(date, 'MMM D')}
                </span>`;
            }
        },

        // Resource avatars (overlappend)
        resourceAvatars: {
            type: 'resourceAvatars',
            overlap: true,
            maxAvatars: 5
        }
    }
});
```

---

## 4. Item Positionering

### Flex Order

```javascript
footerItems: {
    // Positionering via order property
    deadline: { type: 'text', order: 100 },   // Eerste
    tags: { type: 'tags', order: 200 },       // Midden
    team: { type: 'text', order: 300 },       // Laatste
}
```

### Relatieve Positionering

```javascript
footerItems: {
    // Syntax: 'newItem > existingItem' = newItem VOOR existingItem
    // Syntax: 'newItem < existingItem' = newItem NA existingItem

    resourceAvatars: { type: 'resourceAvatars' },

    // Tags vóór resourceAvatars plaatsen
    'tags > resourceAvatars': {
        type: 'tags',
        style: 'flex: 1'
    },

    // Deadline na tags (en vóór resourceAvatars)
    'deadline > resourceAvatars': {
        type: 'template',
        template: ({ value }) => DateHelper.format(value, 'MMM D')
    }
}

// Resultaat: [tags] [deadline] [resourceAvatars]
```

---

## 5. Ingebouwde Item Types - Detail

### TextItem

```javascript
// Simpele tekst weergave, automatisch XSS-safe
footerItems: {
    // Veld 'id' weergeven
    id: { type: 'text' },

    // Veld 'department' niet bewerkbaar
    department: { type: 'text', editor: null },

    // Custom styling
    status: {
        type: 'text',
        cls: 'status-badge',
        style: 'font-weight: bold'
    }
}
```

### TemplateItem

> **Bron**: `taskboard.d.ts:143327-143396`

```javascript
headerItems: {
    prio: {
        type: 'template',

        // Template functie - ontvangt { value, taskRecord }
        template({ value, taskRecord }) {
            // Return string
            return StringHelper.xss`<span class="prio-${value}">${value}</span>`;

            // Of DomConfig object (veiliger voor complexe HTML)
            return {
                tag: 'span',
                class: { [`prio-${value}`]: true, 'overdue': taskRecord.isOverdue },
                children: [
                    { tag: 'i', class: 'fa fa-flag' },
                    { text: value }
                ]
            };
        },

        // Render ook als value null/undefined is
        renderNull: true
    }
}

// Bron: examples/catch-all-column/app.module.js
headerItems: {
    assignee: {
        type: 'template',
        template({ value }) {
            const v = value && value !== '*'
                ? `${value.toLowerCase()}.jpg`
                : 'none.png';
            return StringHelper.xss`
                <img class="avatar"
                     alt="Avatar for ${value}"
                     src="../_shared/images/users/${v}">
            `;
        }
    }
}
```

### ImageItem

> **Bron**: `taskboard.d.ts:142768-142830`

```javascript
bodyItems: {
    image: {
        type: 'image',
        baseUrl: 'resources/images/',    // Prefix voor URL
        altField: 'imageDescription',    // Veld voor alt attribuut

        // Styling
        style: 'max-height: 150px; object-fit: cover'
    }
}

// Data in TaskModel
{
    id: 1,
    name: 'Task with image',
    image: 'screenshot.png',           // Wordt: resources/images/screenshot.png
    imageDescription: 'Screenshot of feature'
}
```

### ProgressItem

> **Bron**: `taskboard.d.ts:142904-142962`

```javascript
bodyItems: {
    progress: {
        type: 'progress',
        max: 100,              // Default: 100
        style: 'height: 8px'
    }
}

// Data: progress: 75 toont 75% gevulde balk

// Bron: examples/charts/app.module.js
features: {
    taskEdit: {
        items: {
            progress: {
                type: 'slider',        // Editor widget
                min: 0,
                max: 100,
                showValue: 'thumb',
                label: 'Progress'
            }
        }
    }
}
```

### RatingItem

> **Bron**: `taskboard.d.ts:142968-143026`

```javascript
bodyItems: {
    rating: {
        type: 'rating',
        max: 5             // 5 sterren (default)
    }
}

// Data: rating: 3 toont 3 gevulde sterren van 5
```

### ResourceAvatarsItem

> **Bron**: `taskboard.d.ts:143032-143098`

```javascript
// Globale instelling voor avatar afbeeldingen
const taskBoard = new TaskBoard({
    resourceImagePath: '../images/users/',

    headerItems: {
        resourceAvatars: {
            type: 'resourceAvatars',
            maxAvatars: 3,       // Max 3 avatars tonen
            overlap: false       // Geen overlap
        }
    },

    footerItems: {
        resourceAvatars: {
            type: 'resourceAvatars',
            maxAvatars: 5,
            overlap: true        // Avatars overlappen (space saver)
        }
    }
});

// Verplaats avatars van footer naar header
// Bron: examples/undo-redo/app.module.js
headerItems: {
    resourceAvatars: { type: 'resourceAvatars' }
},
footerItems: {
    resourceAvatars: null   // Verwijder uit footer
}
```

### TagsItem

> **Bron**: `taskboard.d.ts:143151-143224`

```javascript
footerItems: {
    // String met separator
    tags: {
        type: 'tags',
        separator: ','     // Split 'bug,urgent,backend' op komma
    },

    // Array van strings
    labels: {
        type: 'tags'       // ['bug', 'urgent', 'backend']
    },

    // Array van objecten
    categories: {
        type: 'tags',
        textProperty: 'name',    // Pluk text van object.name
        clsProperty: 'color'     // CSS class van object.color
    }
}

// Data voorbeelden:
{
    tags: 'bug,urgent,backend',           // String
    labels: ['bug', 'urgent', 'backend'], // Array strings
    categories: [                          // Array objecten
        { name: 'Bug', color: 'red' },
        { name: 'Urgent', color: 'orange' }
    ]
}
```

### CollapseItem

> **Bron**: `taskboard.d.ts:142708-142762`

```javascript
headerItems: {
    collapsed: {
        type: 'collapse',
        collapseIconCls: 'b-fa-chevron-up',    // Custom icon ingeklapt
        expandIconCls: 'b-fa-chevron-down'     // Custom icon uitgeklapt
    }
}

// Globaal verbergen
const taskBoard = new TaskBoard({
    showCollapseInHeader: false
});
```

### TaskMenuItem

```javascript
headerItems: {
    menu: { type: 'taskMenu' }  // ... context menu button
}

// Bron: examples/bigdataset/app.module.js
headerItems: {
    menu: { type: 'taskMenu' }
}
```

### SeparatorItem

```javascript
bodyItems: {
    separator: { type: 'separator' }  // Horizontale lijn
}
```

### ChartItem

> **Bron**: `taskboard.d.ts:142638-142702`, `examples/charts/app.module.js`

```javascript
// Vereist Chart.js library
headerItems: {
    // Line chart voor activity over tijd
    activity: {
        type: 'chart',
        chartType: 'line',
        chartConfig: {
            showPoints: false,
            max: 8
        }
    }
},

bodyItems: {
    // Bar chart
    bars: {
        type: 'chart',
        chartType: 'bar',
        chartConfig: {
            showAxes: true,
            series: [
                {
                    field: 'value',
                    fillColor: '#96c3e8',
                    strokeColor: 'transparent'
                }
            ]
        }
    }
}

// Data:
{
    activity: [2, 4, 3, 7, 5, 6, 4],  // Line chart data
    bars: [                            // Bar chart data
        { label: 'Jan', value: 10 },
        { label: 'Feb', value: 15 },
        { label: 'Mar', value: 8 }
    ]
}
```

### TodoListItem

> **Bron**: `examples/todo-list/app.module.js`

```javascript
// Custom TaskModel met todo array
class CustomTask extends TaskModel {
    static fields = [
        { name: 'todo', type: 'array' }
    ];
}

const taskBoard = new TaskBoard({
    bodyItems: {
        todo: {
            type: 'todoList',
            textField: 'text',
            checkedField: 'done'
        }
    },

    footerItems: {
        // Custom counter
        todo: {
            type: 'template',
            cls: 'todo-counter',
            template({ taskRecord }) {
                const { todo } = taskRecord;
                if (!todo) return '';

                const done = todo.filter(t => t.done).length;
                return `<i class="fa fa-tasks"></i> ${done}/${todo.length}`;
            }
        }
    },

    features: {
        taskEdit: {
            items: {
                todo: {
                    type: 'todolist',
                    label: 'Todo',
                    name: 'todo',
                    textField: 'text',
                    checkedField: 'done'
                }
            }
        }
    }
});

// Data:
{
    todo: [
        { text: 'Setup environment', done: true },
        { text: 'Write tests', done: false },
        { text: 'Deploy to staging', done: false }
    ]
}
```

### JsxItem (React)

> **Bron**: `taskboard.d.ts:142836-142898`

```jsx
// React component
const CustomComponent = ({ taskRecord, value }) => (
    <div className="custom-component">
        <span>{taskRecord.name}</span>
        <span>{value}</span>
    </div>
);

// In TaskBoard config
bodyItems: {
    customComponent: {
        type: 'jsx',
        jsx: ({ taskRecord, value }) => (
            <CustomComponent task={taskRecord} data={value} />
        )
    }
}
```

---

## 6. processItems Callback

Dynamisch items aanpassen per taak:

```javascript
// Bron: examples/task-items/app.module.js
const taskBoard = new TaskBoard({
    bodyItems: {
        progress: { type: 'progress', max: 100 },
        image: { type: 'image' }
    },

    // Callback voor elke taak
    processItems({ taskRecord, headerItems, bodyItems, footerItems }) {
        // === CONDITIONALLY HIDE ITEMS ===

        // Verberg progress voor 'done' taken
        if (taskRecord.status === 'Done') {
            bodyItems.progress = null;
        }

        // Verberg image als niet aanwezig
        if (!taskRecord.image) {
            bodyItems.image = null;
        }

        // === CONDITIONALLY ADD ITEMS ===

        // Voeg deadline toe voor niet-voltooide taken
        if (taskRecord.status !== 'Done' && taskRecord.deadline) {
            footerItems.deadline = {
                type: 'template',
                template: ({ value }) => {
                    const isOverdue = new Date(value) < new Date();
                    return `<span class="${isOverdue ? 'overdue' : ''}">
                        ${DateHelper.format(value, 'MMM D')}
                    </span>`;
                }
            };
        }

        // === MODIFY EXISTING ITEMS ===

        // Pas resource avatars aan voor voltooide taken
        if (taskRecord.status === 'Done') {
            if (footerItems.resourceAvatars) {
                footerItems.resourceAvatars.maxAvatars = 2;
            }
        }

        // === HIDE ENTIRE CARD ===

        // Return false om hele card te verbergen
        if (taskRecord.hidden) {
            return false;
        }

        // === DYNAMIC STYLING ===

        // Voeg warning indicator toe
        if (taskRecord.prio === 'critical') {
            headerItems.warning = {
                type: 'template',
                order: -100,  // Eerst
                template: () => '<i class="fa fa-exclamation-triangle warning"></i>'
            };
        }
    }
});
```

### processItems voor Catch-All Logic

```javascript
// Bron: examples/catch-all-column/app.module.js
processItems({ taskRecord, headerItems }) {
    // Verberg assignee avatar in named columns
    if (['emilia', 'mark', 'lisa'].includes(taskRecord.assignee)) {
        headerItems.assignee = null;
    }
    // In catch-all column wordt assignee WEL getoond
}
```

---

## 7. Task Renderer

Directe toegang tot de card DOM configuratie:

```javascript
// Bron: examples/tooltips/app.module.js
const taskBoard = new TaskBoard({
    taskRenderer({ taskRecord, cardConfig }) {
        // === CSS CLASSES ===
        cardConfig.class[taskRecord.prio] = true;
        cardConfig.class['overdue'] = taskRecord.isOverdue;
        cardConfig.class['done'] = taskRecord.status === 'Done';

        // === INLINE STYLES ===
        if (taskRecord.urgent) {
            cardConfig.style = 'border-left: 4px solid red';
        }

        // === HEADER MODIFICATIE ===
        const headerChildren = cardConfig.children.header.children;

        // Icon toevoegen
        if (taskRecord.iconCls) {
            headerChildren.icon = {
                tag: 'i',
                class: `fa fa-${taskRecord.iconCls}`
            };
        }

        // === BODY MODIFICATIE ===
        const bodyChildren = cardConfig.children.body.children;

        // Custom details sectie toevoegen
        bodyChildren.details = {
            class: 'details',
            children: [
                { tag: 'label', text: 'Category' },
                { tag: 'div', text: taskRecord.category || 'None' },
                { tag: 'label', text: 'Team' },
                { tag: 'div', text: taskRecord.team || 'None' }
            ]
        };

        // === CSS CUSTOM PROPERTIES ===
        const prioColors = {
            critical: 'red',
            high: 'orange',
            medium: 'yellow',
            low: 'green'
        };

        cardConfig.style['--b-primary'] =
            `var(--b-color-${prioColors[taskRecord.prio] || 'blue'})`;
    }
});
```

### cardConfig Structuur

```javascript
{
    tag: 'div',
    class: {
        'b-taskboard-card': true,
        'b-selected': false,
        'b-collapsed': false
    },
    style: '',
    dataset: {
        taskId: 1
    },
    children: {
        header: {
            class: 'b-taskboard-card-header',
            children: {
                text: {
                    class: 'b-taskboard-card-header-text',
                    text: 'Task Name'
                },
                // + headerItems
            }
        },
        body: {
            class: 'b-taskboard-card-body',
            children: {
                // bodyItems
            }
        },
        footer: {
            class: 'b-taskboard-card-footer',
            children: {
                // footerItems
            }
        }
    }
}
```

---

## 8. Task Editor

> **Bron**: `taskboard.d.ts:130387-130600, 164218+`

### TaskEdit Feature Configuratie

```javascript
// Bron: examples/task-edit/app.module.js
const taskBoard = new TaskBoard({
    features: {
        taskEdit: {
            // === EDITOR POPUP CONFIG ===
            editorConfig: {
                modal: { closeOnMaskTap: true },
                autoUpdateRecord: true,  // Live updates
                width: '35em',
                labelPosition: 'align-before'
            },

            // === VELDEN IN EDITOR ===
            items: {
                // Bestaand veld aanpassen
                name: {
                    label: 'Title',
                    required: true
                },

                // Rich text editor voor description
                description: {
                    type: 'textareafield',
                    height: '10em'
                },

                // Color picker verbergen
                color: false,

                // Nieuw veld toevoegen
                department: {
                    type: 'radiogroup',
                    name: 'department',
                    label: 'Department',
                    inline: true,
                    weight: 550,  // Positie (vóór priority = 600)
                    options: {
                        marketing: 'Marketing',
                        sales: 'Sales',
                        support: 'Support',
                        dev: 'Development'
                    }
                },

                // Combo voor team
                team: {
                    type: 'combo',
                    name: 'team',
                    label: 'Team',
                    editable: false,
                    items: ['Developers', 'DevOps', 'QA', 'UX']
                },

                // Date picker
                deadline: {
                    type: 'date',
                    name: 'deadline',
                    label: 'Deadline',
                    weight: 700
                },

                // Slider voor progress
                progress: {
                    type: 'slider',
                    name: 'progress',
                    label: 'Progress',
                    min: 0,
                    max: 100,
                    showValue: 'thumb'
                },

                // Todo lijst
                todo: {
                    type: 'todolist',
                    name: 'todo',
                    label: 'Checklist',
                    textField: 'text',
                    checkedField: 'done'
                }
            },

            // === DYNAMISCH ITEMS AANPASSEN ===
            processItems({ items, taskRecord }) {
                // Resource picker verbergen voor 'done' taken
                if (taskRecord.status === 'done') {
                    items.resources = null;
                }

                // Extra veld voor specifieke categorieën
                if (taskRecord.category === 'Bug') {
                    items.severity = {
                        type: 'combo',
                        name: 'severity',
                        label: 'Severity',
                        items: ['Critical', 'Major', 'Minor', 'Trivial'],
                        weight: 400
                    };
                }
            }
        }
    }
});
```

### Editor Events

```javascript
const taskBoard = new TaskBoard({
    listeners: {
        // === BEFORE EDIT ===
        beforeTaskEdit({ taskRecord }) {
            // Voorkom bewerken van bepaalde taken
            if (taskRecord.locked) {
                Toast.show('This task is locked');
                return false;
            }
        },

        // === EDITOR SHOWN ===
        beforeTaskEditShow({ taskRecord, editor }) {
            // Custom title
            editor.title = `Editing "${taskRecord.name}"`;

            // Focus op specifiek veld
            editor.widgetMap.description?.focus();
        },

        // === AFTER SAVE ===
        afterTaskEdit({ taskRecord }) {
            console.log('Saved:', taskRecord.name);
            Toast.show(`"${taskRecord.name}" saved`);
        },

        // === AFTER CANCEL ===
        cancelTaskEdit({ taskRecord }) {
            console.log('Cancelled editing:', taskRecord.name);
        }
    }
});
```

### Programmatisch Openen

```javascript
// Via TaskBoard
const task = taskBoard.project.taskStore.getById(16);
taskBoard.editTask(task);

// Via Feature
taskBoard.features.taskEdit.editTask(task);

// Met custom config
taskBoard.editTask(task, {
    title: 'Custom Edit Dialog'
});
```

---

## 9. SimpleTaskEdit Feature

Inline editing zonder popup:

```javascript
// Bron: examples/simple-task-edit/app.module.js
const taskBoard = new TaskBoard({
    features: {
        simpleTaskEdit: true
    },

    // Defaults voor nieuwe taken
    newTaskDefaults: {
        name: 'Add title',
        description: 'Add description',
        team: 'Pick team'
    },

    headerItems: {
        text: {
            field: 'name',
            // Configure inline editor
            editor: {
                type: 'text',
                required: true
            }
        },
        resources: { type: 'resourceAvatars' }
    },

    footerItems: {
        team: {
            type: 'text',
            // Combo editor voor team
            editor: {
                type: 'combo',
                items: ['Developers', 'DevOps', 'QA', 'UX']
            }
        }
    }
});

// Events
taskBoard.on({
    beforeSimpleTaskEdit({ taskRecord, field }) {
        console.log(`Editing ${field} on ${taskRecord.name}`);
        // Return false om te voorkomen
    },

    simpleTaskEditComplete({ taskRecord, field }) {
        console.log(`Completed editing ${field}`);
    },

    simpleTaskEditCancel({ taskRecord, field }) {
        console.log(`Cancelled editing ${field}`);
    }
});
```

---

## 10. Responsive Cards

> **Bron**: `taskboard.d.ts:1747-1779`

### Card Sizes

```javascript
// Bron: examples/charts/app.module.js
const taskBoard = new TaskBoard({
    cardSizes: [
        {
            maxWidth: 250,
            name: 'small',
            maxAvatars: 2
        },
        {
            maxWidth: 400,
            name: 'medium',
            maxAvatars: 4
        },
        {
            name: 'large',    // Default (geen maxWidth)
            maxAvatars: 7
        }
    ],

    responsive: {
        small: {
            when: 600,
            footerItems: {
                tags: { hidden: true }
            }
        }
    }
});
```

### stretchCards

```javascript
const taskBoard = new TaskBoard({
    // Kaarten vullen beschikbare breedte
    stretchCards: true,

    // Met tasksPerRow
    tasksPerRow: 2  // 2 kaarten per rij, elk stretched
});
```

---

## 11. Task Selection

> **Bron**: `taskboard.d.ts:144583-144665`

```javascript
const taskBoard = new TaskBoard({
    // Initial selection
    selectedTasks: [],

    // Validation callback
    isTaskSelectable(taskRecord) {
        // Alleen niet-voltooide taken selecteerbaar
        return taskRecord.status !== 'Done' && !taskRecord.readOnly;
    }
});

// === PROGRAMMATISCH ===

// Selecteer één task
taskBoard.selectTask(task);

// Voeg toe aan selectie
taskBoard.selectTask(task2, true);

// Deselecteer
taskBoard.deselectTask(task);

// Alles deselecteren
taskBoard.deselectAll();

// Check selectie
if (taskBoard.isSelected(task)) {
    console.log('Task is selected');
}

// Get alle geselecteerde
const selected = taskBoard.selectedTasks;
console.log(`${selected.length} tasks selected`);

// Set selectie
taskBoard.selectedTasks = [task1, task2, task3];

// === EVENTS ===
taskBoard.on('selectionChange', ({
    action,      // 'select', 'deselect', 'update'
    selection,   // Alle geselecteerde taken
    select,      // Nieuw geselecteerde taken
    deselect     // Gedeselecteerde taken
}) => {
    console.log(`${action}: ${select.length} selected, ${deselect.length} deselected`);
    console.log('Total selected:', selection.length);
});
```

---

## 12. Task Events

```typescript
interface TaskBoardTaskEvents {
    // === MOUSE EVENTS ===
    onTaskClick: (event: TaskClickEvent) => void;
    onTaskDblClick: (event: TaskClickEvent) => void;
    onTaskContextMenu: (event: TaskClickEvent) => void;

    // === HOVER EVENTS ===
    onTaskMouseEnter: (event: TaskMouseEvent) => void;
    onTaskMouseLeave: (event: TaskMouseEvent) => void;

    // === ACTIVATION ===
    onActivateTask: (event: { taskRecord: TaskModel }) => void;

    // === RENDERING ===
    onRenderTask: (event: {
        taskRecord: TaskModel,
        isRefresh: boolean,
        element: HTMLElement
    }) => void;
    onRenderTasks: (event: { taskRecords: TaskModel[] }) => void;
    onRemoveTaskElement: (event: {
        taskId: string | number,
        element: HTMLElement
    }) => void;

    // === REMOVAL ===
    onBeforeTaskRemove: (event: { taskRecords: TaskModel[] }) => void;
}

interface TaskClickEvent {
    source: TaskBoard;
    taskRecord: TaskModel;
    columnRecord: ColumnModel;
    swimlaneRecord: SwimlaneModel;
    event: MouseEvent;
}
```

### Event Handling

```javascript
const taskBoard = new TaskBoard({
    listeners: {
        taskClick({ taskRecord, columnRecord, event }) {
            console.log(`Clicked ${taskRecord.name} in ${columnRecord.text}`);

            // Check modifier keys
            if (event.ctrlKey) {
                taskBoard.selectTask(taskRecord, true);
            }
        },

        taskDblClick({ taskRecord }) {
            // Open editor op dubbelklik
            taskBoard.editTask(taskRecord);
        },

        taskMouseEnter({ taskRecord, event }) {
            // Highlight related tasks
            taskRecord.resources.forEach(r => {
                r.events.forEach(e => {
                    e.cls = 'highlighted';
                });
            });
        },

        taskMouseLeave({ taskRecord }) {
            taskRecord.resources.forEach(r => {
                r.events.forEach(e => {
                    delete e.cls;
                });
            });
        },

        activateTask({ taskRecord }) {
            // Enter key of dubbelklik op geselecteerde task
            taskBoard.editTask(taskRecord);
        }
    }
});
```

---

## 13. Task Tooltips

> **Bron**: `examples/tooltips/app.module.js`

```javascript
const taskBoard = new TaskBoard({
    features: {
        taskTooltip: {
            cls: 'custom-tooltip',

            // Custom tooltip template
            template({ taskRecord }) {
                return StringHelper.xss`
                    <h1>${taskRecord.name}</h1>
                    <label>Deadline</label>
                    <div>${DateHelper.format(taskRecord.deadline, 'LL')}</div>
                    <label>Prio</label>
                    <div class="${taskRecord.prio}">
                        ${StringHelper.capitalize(taskRecord.prio)}
                    </div>
                ` + (taskRecord.readOnly
                    ? '<i class="fa fa-lock"></i> Read only'
                    : '');
            }
        }
    }
});
```

### Custom Tooltip met Store Query

```javascript
// Bron: examples/catch-all-column/app.module.js
const commentsTooltip = new Tooltip({
    cls: 'comments-tooltip',
    forSelector: '.b-task-board-task-item[data-field="comments"]',

    getHtml({ activeTarget }) {
        const card = activeTarget.closest('.b-taskboard-card');
        const task = taskboard.resolveTaskRecord(card);

        if (!task.comments?.count) {
            return null;  // Geen tooltip
        }

        return task.comments.map(comment => StringHelper.xss`
            <div class="comment">
                <div class="author">
                    <img class="avatar"
                         alt="${comment.author}"
                         src="images/users/${comment.author.toLowerCase()}.jpg">
                </div>
                <div class="text">${comment.text}</div>
                <div class="date">
                    ${DateHelper.format(comment.timestamp, 'ddd HH:mm')}
                </div>
            </div>
        `).join('\n');
    }
});
```

---

## 14. Undo/Redo voor Tasks

> **Bron**: `examples/undo-redo/app.module.js`

```javascript
const taskBoard = new TaskBoard({
    tbar: [
        // Ingebouwde undo/redo widget met dropdown
        {
            type: 'taskboardundoredo',
            items: {
                transactionsCombo: { width: '20em' }
            }
        }
    ],

    project: {
        stm: {
            autoRecord: true,
            disabled: false,

            // Custom transaction titles
            getTransactionTitle(transaction) {
                const lastAction = transaction.queue[transaction.queue.length - 1];
                let { type, model, newData } = lastAction;

                if (lastAction.modelList?.length) {
                    model = lastAction.modelList[0];
                }

                if (model.isEventModel) {
                    if (type === 'UpdateAction') {
                        if (newData.status) {
                            return `Set task "${model.name}" status to ${newData.status}`;
                        }
                        if (newData.prio) {
                            return `Set task "${model.name}" prio to ${newData.prio}`;
                        }
                        return `Edit task "${model.name}"`;
                    }
                    if (type === 'RemoveAction') {
                        return `Remove task "${model.name}"`;
                    }
                    if (type === 'AddAction') {
                        return `Add task "${model.name}"`;
                    }
                }

                if (model.isAssignmentModel) {
                    if (type === 'RemoveAction') {
                        return `Unassign ${model.resource.name} from ${model.event.name}`;
                    }
                    if (type === 'AddAction') {
                        return `Assign ${model.resource.name} to ${model.event.name}`;
                    }
                }

                return `Transaction ${this.position}`;
            }
        }
    }
});

// Programmatisch
taskBoard.project.stm.undo();
taskBoard.project.stm.redo();
taskBoard.project.stm.canUndo;  // boolean
taskBoard.project.stm.canRedo;  // boolean
```

---

## Referenties

| Item | Locatie |
|------|---------|
| TaskModel | `taskboard.d.ts:132882-133135` |
| TaskItemOptions | `taskboard.d.ts:1665-1744` |
| Item Types | `taskboard.d.ts:142638-143437` |
| TaskItems Mixin | `taskboard.d.ts:144487-144550` |
| TaskEdit Feature | `taskboard.d.ts:130387-130600` |
| TaskEditor Widget | `taskboard.d.ts:164218+` |
| Basic Example | `examples/basic/app.module.js` |
| Task Items Example | `examples/task-items/app.module.js` |
| Task Edit Example | `examples/task-edit/app.module.js` |
| Simple Task Edit | `examples/simple-task-edit/app.module.js` |
| Todo List | `examples/todo-list/app.module.js` |
| Charts | `examples/charts/app.module.js` |
| Tooltips | `examples/tooltips/app.module.js` |
| Undo Redo | `examples/undo-redo/app.module.js` |
| Catch-all Column | `examples/catch-all-column/app.module.js` |

---

*Laatst bijgewerkt: December 2024*
