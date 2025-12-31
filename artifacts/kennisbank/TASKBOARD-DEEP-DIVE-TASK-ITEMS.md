# TaskBoard Deep Dive: Task Items

> **Complete guide** voor alle TaskItem types in Bryntum TaskBoard - van TextItem tot TodoListItem, plus configuratie en custom rendering.

---

## Overzicht

TaskItems zijn lichtgewicht "widgets" die aan task cards kunnen worden toegevoegd via headerItems, bodyItems en footerItems:

| Item Type | Beschrijving |
|-----------|--------------|
| **TextItem** | Simpele tekst display (XSS-safe) |
| **TemplateItem** | Custom HTML via template functie |
| **ProgressItem** | Progress bar (0-100 of custom max) |
| **ImageItem** | Afbeelding met baseUrl support |
| **RatingItem** | Sterren rating display |
| **CollapseItem** | Expand/collapse knop voor cards |
| **TagsItem** | Tags/labels met styling |
| **ResourceAvatarsItem** | Team member avatars |
| **SeparatorItem** | Horizontale scheiding lijn |
| **TaskMenuItem** | Menu knop (···) |
| **ChartItem** | Mini charts (line/bar/pie) |
| **TodoListItem** | Checklist met toggle items |
| **JsxItem** | React JSX content |

---

## 1. TaskItem Base Configuration

### 1.1 Common Properties

Alle TaskItems erven van de base TaskItem class:

```typescript
interface TaskItemConfig {
    // CSS class
    cls?: string;

    // Field dat de waarde bevat
    field?: string;

    // Verberg het item
    hidden?: boolean;

    // Flex order voor sortering
    order?: number;

    // Inline styling
    style?: string | object;

    // Editor configuratie voor inline editing
    editor?: string | object | null;
}
```

### 1.2 Placement Locations

```javascript
const taskBoard = new TaskBoard({
    // Items in de card header (naast titel)
    headerItems: {
        collapsed: { type: 'collapse' },
        menu: { type: 'taskMenu' }
    },

    // Items in de card body
    bodyItems: {
        progress: { type: 'progress' },
        image: { type: 'image' }
    },

    // Items in de card footer
    footerItems: {
        tags: { type: 'tags' },
        resourceAvatars: { type: 'resourceAvatars' }
    }
});
```

---

## 2. TextItem

### 2.1 Basic Usage

Displays de waarde van een field met XSS protection:

```javascript
headerItems: {
    // Simpele text display
    name: { type: 'text' },

    // Met custom field
    priority: {
        type: 'text',
        field: 'prio',
        cls: 'priority-badge'
    }
}
```

### 2.2 TextItemConfig

```typescript
interface TextItemConfig extends TaskItemConfig {
    type?: 'text';

    // Field om te tonen (default: key naam)
    field?: string;

    // Editor configuratie
    editor?: string | object | null;
}
```

---

## 3. TemplateItem

### 3.1 Basic Template

```javascript
footerItems: {
    team: {
        type: 'template',
        template: ({ taskRecord, value }) =>
            StringHelper.xss`<i class="fa fa-users"></i>${value}`
    }
}
```

### 3.2 Rich Template met Icons

```javascript
const teamIcons = {
    Architects: 'pen-fancy',
    Developers: 'code',
    Designers: 'paint-brush',
    Finance: 'coins'
};

bodyItems: {
    team: {
        type: 'template',
        template: ({ value }) => StringHelper.xss`
            <i class="fa fa-${teamIcons[value] || 'users'}"></i>
            ${value}
        `
    }
}
```

### 3.3 Template met Datum Formatting

```javascript
bodyItems: {
    deadline: {
        type: 'template',
        template: ({ value }) => {
            const formatted = DateHelper.format(value, 'MMMM DD');
            return `<i class="fa fa-calendar"></i> ${formatted}`;
        }
    }
}
```

### 3.4 Template met Conditional Rendering

```javascript
headerItems: {
    approved: {
        type: 'template',
        template: ({ value }) => `
            <i class="fa fa-${value ? 'check' : 'times'}"
               data-btip="${value ? 'Approved' : 'Pending'}"></i>
        `
    }
}
```

### 3.5 Render Null Values

```javascript
bodyItems: {
    description: {
        type: 'template',
        renderNull: true,  // Render ook bij null/undefined
        template: ({ value }) =>
            value ? StringHelper.xss`${value}` : '<em>No description</em>'
    }
}
```

### 3.6 TemplateItemConfig

```typescript
interface TemplateItemConfig extends TaskItemConfig {
    type?: 'template';

    // Template functie
    template?: (
        taskRecord: TaskModel,
        config: TemplateItemConfig,
        value: any
    ) => string | DomConfig | DomConfig[];

    // Render bij null waarden
    renderNull?: boolean;
}
```

---

## 4. ProgressItem

### 4.1 Basic Progress Bar

```javascript
bodyItems: {
    progress: {
        type: 'progress',
        max: 100  // 0-100 schaal
    }
}
```

### 4.2 Custom Max Value

```javascript
bodyItems: {
    points: {
        type: 'progress',
        field: 'storyPoints',
        max: 13  // Fibonacci schaal
    }
}
```

### 4.3 ProgressItemConfig

```typescript
interface ProgressItemConfig extends TaskItemConfig {
    type?: 'progress';

    // Maximum waarde (default 100)
    max?: number;

    // Editor configuratie
    editor?: string | object;
}
```

---

## 5. ImageItem

### 5.1 Basic Image

```javascript
bodyItems: {
    image: {
        type: 'image',
        baseUrl: 'resources/images/',
        altField: 'imageDescription'
    }
}
```

### 5.2 Data Format

```json
{
    "id": 1,
    "name": "Task 1",
    "image": "screenshot.png",
    "imageDescription": "Screenshot of feature"
}
```

### 5.3 ImageItemConfig

```typescript
interface ImageItemConfig extends TaskItemConfig {
    type?: 'image';

    // URL prefix
    baseUrl?: string;

    // Field voor alt attribuut
    altField?: string;

    // Editor configuratie
    editor?: string | object;
}
```

---

## 6. RatingItem

### 6.1 Star Rating

```javascript
bodyItems: {
    rating: {
        type: 'rating',
        max: 5  // Aantal sterren
    }
}
```

### 6.2 Priority Rating

```javascript
headerItems: {
    priority: {
        type: 'rating',
        field: 'priorityLevel',
        max: 3  // Low/Medium/High
    }
}
```

### 6.3 RatingItemConfig

```typescript
interface RatingItemConfig extends TaskItemConfig {
    type?: 'rating';

    // Maximum sterren
    max?: number;

    // Editor configuratie
    editor?: string | object;
}
```

---

## 7. CollapseItem

### 7.1 Enable Card Collapse

```javascript
headerItems: {
    collapsed: {
        type: 'collapse'
    }
}
```

### 7.2 Custom Icons

```javascript
headerItems: {
    collapsed: {
        type: 'collapse',
        collapseIconCls: 'fa-chevron-up',
        expandIconCls: 'fa-chevron-down'
    }
}
```

### 7.3 CollapseItemConfig

```typescript
interface CollapseItemConfig extends TaskItemConfig {
    type?: 'collapse';

    // Icon voor collapsed state
    collapseIconCls?: string;

    // Icon voor expanded state
    expandIconCls?: string;
}
```

### 7.4 Data Format

```json
{
    "id": 1,
    "name": "Task 1",
    "collapsed": true
}
```

---

## 8. TagsItem

### 8.1 Simple String Tags

```javascript
footerItems: {
    tags: { type: 'tags' }
}

// Data: { "tags": "frontend, backend, urgent" }
// Of: { "tags": ["frontend", "backend", "urgent"] }
```

### 8.2 Object Array Tags

```javascript
footerItems: {
    tags: {
        type: 'tags',
        textProperty: 'label',
        clsProperty: 'color'
    }
}

// Data:
// {
//     "tags": [
//         { "label": "Bug", "color": "red" },
//         { "label": "Feature", "color": "blue" }
//     ]
// }
```

### 8.3 Custom Separator

```javascript
footerItems: {
    skills: {
        type: 'tags',
        field: 'skillSet',
        separator: '|'  // Split "React|Vue|Angular"
    }
}
```

### 8.4 TagsItemConfig

```typescript
interface TagsItemConfig extends TaskItemConfig {
    type?: 'tags';

    // Property voor tag tekst
    textProperty?: string;

    // Property voor CSS class
    clsProperty?: string;

    // Separator voor string splitting
    separator?: string;

    // Editor configuratie
    editor?: string | object;
}
```

---

## 9. ResourceAvatarsItem

### 9.1 Basic Avatars

```javascript
footerItems: {
    resourceAvatars: {
        type: 'resourceAvatars'
    }
}

// TaskBoard config
resourceImagePath: 'resources/users/'
```

### 9.2 Overlapping Avatars

```javascript
footerItems: {
    resourceAvatars: {
        type: 'resourceAvatars',
        overlap: true,
        maxAvatars: 3
    }
}
```

### 9.3 ResourceAvatarsItemConfig

```typescript
interface ResourceAvatarsItemConfig extends TaskItemConfig {
    type?: 'resourceAvatars' | 'resourceavatars';

    // Overlappen van avatars
    overlap?: boolean;

    // Maximum aantal te tonen
    maxAvatars?: number;
}
```

---

## 10. SeparatorItem

### 10.1 Horizontal Divider

```javascript
bodyItems: {
    info: { type: 'template', template: '...' },
    separator: { type: 'separator' },
    details: { type: 'template', template: '...' }
}
```

### 10.2 SeparatorItemConfig

```typescript
interface SeparatorItemConfig extends TaskItemConfig {
    type?: 'separator';
}
```

---

## 11. TaskMenuItem

### 11.1 Menu Button

```javascript
headerItems: {
    menu: { type: 'taskMenu' }
}

// Requires TaskMenu feature
features: {
    taskMenu: true
}
```

### 11.2 TaskMenuItemConfig

```typescript
interface TaskMenuItemConfig extends TaskItemConfig {
    type?: 'taskMenu' | 'taskmenu';
}
```

---

## 12. ChartItem

### 12.1 Line Chart

```javascript
headerItems: {
    activity: {
        type: 'chart',
        chartType: 'line',
        chartConfig: {
            showPoints: false,
            max: 10
        }
    }
}

// Data: { "activity": [3, 5, 2, 7, 4, 6, 8] }
```

### 12.2 Bar Chart

```javascript
bodyItems: {
    metrics: {
        type: 'chart',
        chartType: 'bar',
        chartConfig: {
            showAxes: true,
            series: [{
                field: 'value',
                fillColor: '#4a90d9'
            }]
        }
    }
}

// Data:
// {
//     "metrics": [
//         { "label": "New", "value": 5 },
//         { "label": "Done", "value": 8 }
//     ]
// }
```

### 12.3 ChartItemConfig

```typescript
interface ChartItemConfig extends TaskItemConfig {
    type?: 'chart';

    // Chart type
    chartType?: 'line' | 'bar' | 'pie';

    // Chart configuratie
    chartConfig?: {
        showPoints?: boolean;
        showAxes?: boolean;
        max?: number;
        min?: number;
        series?: SeriesConfig[];
    };
}
```

---

## 13. TodoListItem

### 13.1 Checklist Display

```javascript
bodyItems: {
    todos: {
        type: 'todoList',
        textField: 'text',
        checkedField: 'done',
        clsField: 'priority'
    }
}

// Data:
// {
//     "todos": [
//         { "text": "Review code", "done": true, "priority": "high" },
//         { "text": "Write tests", "done": false, "priority": "normal" }
//     ]
// }
```

### 13.2 TodoListItemConfig

```typescript
interface TodoListItemConfig extends TaskItemConfig {
    type?: 'todoList' | 'todolist';

    // Property voor checkbox state
    checkedField?: string;

    // Property voor item tekst
    textField?: string;

    // Property voor CSS class
    clsField?: string;
}
```

### 13.3 TodoListField Editor

```javascript
features: {
    taskEdit: {
        items: {
            todos: {
                type: 'todolistfield',
                label: 'Todo Items'
            }
        }
    }
}
```

---

## 14. JsxItem (React)

### 14.1 React Component

```jsx
bodyItems: {
    reactContent: {
        type: 'jsx',
        jsx: (taskRecord) => (
            <div className="task-details">
                <Badge status={taskRecord.status} />
                <span>{taskRecord.name}</span>
            </div>
        )
    }
}
```

### 14.2 JsxItemConfig

```typescript
interface JsxItemConfig extends TaskItemConfig {
    type?: 'jsx';

    // JSX render functie
    jsx?: (
        taskRecord: TaskModel,
        config: JsxItemConfig,
        value: any
    ) => ReactElement;
}
```

---

## 15. Item Ordering met order Property

### 15.1 Custom Order

```javascript
footerItems: {
    tags: {
        type: 'tags',
        order: 1
    },
    resourceAvatars: {
        type: 'resourceAvatars',
        order: 2
    }
}
```

### 15.2 Relative Ordering

```javascript
// Plaats tags VOOR resourceAvatars
footerItems: {
    'tags > resourceAvatars': {
        type: 'tags',
        style: 'flex: 1'
    },
    resourceAvatars: {
        overlap: true
    }
}
```

---

## 16. processItems Callback

### 16.1 Conditional Item Rendering

```javascript
const taskBoard = new TaskBoard({
    bodyItems: {
        progress: { type: 'progress' },
        image: { type: 'image' }
    },

    // Dynamisch items tonen/verbergen
    processItems({ taskRecord, bodyItems }) {
        // Verberg progress voor completed tasks
        if (taskRecord.status === 'Done') {
            bodyItems.progress = null;
        }

        // Verberg image als geen afbeelding
        if (!taskRecord.image) {
            bodyItems.image = null;
        }
    }
});
```

### 16.2 Per Location Processing

```javascript
processItems({ taskRecord, headerItems, bodyItems, footerItems, location }) {
    // location is 'header', 'body', of 'footer'

    if (location === 'header' && taskRecord.isUrgent) {
        headerItems.name.cls = 'urgent-task';
    }

    if (location === 'footer' && !taskRecord.resources?.length) {
        footerItems.resourceAvatars = null;
    }
}
```

---

## 17. Custom Item Styling

### 17.1 Inline Styles

```javascript
bodyItems: {
    priority: {
        type: 'template',
        style: {
            fontWeight: 'bold',
            color: 'red',
            padding: '4px 8px'
        },
        template: ({ value }) => value
    }
}
```

### 17.2 CSS Classes

```javascript
bodyItems: {
    status: {
        type: 'text',
        cls: 'status-badge status-${value}'
    }
}
```

### 17.3 CSS Styling

```css
/* Task items container */
.b-taskboard-card-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* Progress item */
.b-taskboard-card .b-taskboard-progress {
    height: 8px;
    border-radius: 4px;
}

/* Image item */
.b-taskboard-card .b-taskboard-image {
    max-width: 100%;
    border-radius: 4px;
}

/* Tags item */
.b-taskboard-card .b-taskboard-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.b-taskboard-card .b-taskboard-tag {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
}

/* Rating item */
.b-taskboard-card .b-taskboard-rating {
    color: #ffc107;
}

/* ResourceAvatars item */
.b-taskboard-card .b-resource-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
}
```

---

## 18. Editor Integration

### 18.1 Default Editors

```javascript
bodyItems: {
    // TextItem → TextField
    name: { type: 'text' },

    // ProgressItem → SliderField
    progress: { type: 'progress' },

    // TagsItem → TagsField
    tags: { type: 'tags' }
}
```

### 18.2 Custom Editor

```javascript
bodyItems: {
    priority: {
        type: 'text',
        editor: {
            type: 'combo',
            items: ['Low', 'Medium', 'High']
        }
    }
}
```

### 18.3 Disable Editor

```javascript
bodyItems: {
    status: {
        type: 'text',
        editor: null  // Niet bewerkbaar
    }
}
```

---

## 19. TypeScript Interfaces

```typescript
// Base TaskItem
interface TaskItemConfig {
    cls?: string;
    field?: string;
    hidden?: boolean;
    order?: number;
    style?: string | object;
    editor?: string | object | null;
}

// Text Item
interface TextItemConfig extends TaskItemConfig {
    type?: 'text';
}

// Template Item
interface TemplateItemConfig extends TaskItemConfig {
    type?: 'template';
    template?: (
        taskRecord: TaskModel,
        config: TemplateItemConfig,
        value: any
    ) => string | DomConfig | DomConfig[];
    renderNull?: boolean;
}

// Progress Item
interface ProgressItemConfig extends TaskItemConfig {
    type?: 'progress';
    max?: number;
}

// Image Item
interface ImageItemConfig extends TaskItemConfig {
    type?: 'image';
    baseUrl?: string;
    altField?: string;
}

// Rating Item
interface RatingItemConfig extends TaskItemConfig {
    type?: 'rating';
    max?: number;
}

// Collapse Item
interface CollapseItemConfig extends TaskItemConfig {
    type?: 'collapse';
    collapseIconCls?: string;
    expandIconCls?: string;
}

// Tags Item
interface TagsItemConfig extends TaskItemConfig {
    type?: 'tags';
    textProperty?: string;
    clsProperty?: string;
    separator?: string;
}

// ResourceAvatars Item
interface ResourceAvatarsItemConfig extends TaskItemConfig {
    type?: 'resourceAvatars' | 'resourceavatars';
    overlap?: boolean;
    maxAvatars?: number;
}

// Separator Item
interface SeparatorItemConfig extends TaskItemConfig {
    type?: 'separator';
}

// TaskMenu Item
interface TaskMenuItemConfig extends TaskItemConfig {
    type?: 'taskMenu' | 'taskmenu';
}

// Chart Item
interface ChartItemConfig extends TaskItemConfig {
    type?: 'chart';
    chartType?: 'line' | 'bar' | 'pie';
    chartConfig?: ChartConfig;
}

// TodoList Item
interface TodoListItemConfig extends TaskItemConfig {
    type?: 'todoList' | 'todolist';
    checkedField?: string;
    textField?: string;
    clsField?: string;
}

// JSX Item (React)
interface JsxItemConfig extends TaskItemConfig {
    type?: 'jsx';
    jsx?: (taskRecord: TaskModel, config: JsxItemConfig, value: any) => any;
}

// processItems callback
interface ProcessItemsParams {
    taskRecord: TaskModel;
    headerItems: Record<string, TaskItemConfig | null>;
    bodyItems: Record<string, TaskItemConfig | null>;
    footerItems: Record<string, TaskItemConfig | null>;
    location: 'header' | 'body' | 'footer';
}
```

---

## 20. Best Practices

### 20.1 Performance

```javascript
// Gebruik Text over Template waar mogelijk
bodyItems: {
    // GOED - lichtgewicht
    name: { type: 'text' },

    // VERMIJD - overhead voor simpele text
    name: {
        type: 'template',
        template: ({ value }) => value
    }
}
```

### 20.2 XSS Protection

```javascript
// ALTIJD StringHelper.xss gebruiken voor user input
template: ({ value }) => StringHelper.xss`${value}`

// NOOIT direct interpoleren
template: ({ value }) => `<div>${value}</div>`  // ONVEILIG
```

### 20.3 Conditional Rendering

```javascript
// Gebruik processItems voor complexe logica
processItems({ taskRecord, bodyItems }) {
    // Verberg items basend op task state
    if (taskRecord.isCompleted) {
        bodyItems.progress = null;
        bodyItems.deadline = null;
    }
}
```

---

## Samenvatting

| Item Type | Use Case |
|-----------|----------|
| **TextItem** | Simpele text values |
| **TemplateItem** | Custom HTML/icons |
| **ProgressItem** | Voortgang percentage |
| **ImageItem** | Task afbeeldingen |
| **RatingItem** | Sterren ratings |
| **CollapseItem** | Card expand/collapse |
| **TagsItem** | Labels en categories |
| **ResourceAvatarsItem** | Team members |
| **SeparatorItem** | Visuele scheiding |
| **TaskMenuItem** | Context menu |
| **ChartItem** | Mini visualisaties |
| **TodoListItem** | Checklists |
| **JsxItem** | React componenten |

---

*Laatst bijgewerkt: December 2024*
*Bryntum TaskBoard v7.1.0*
