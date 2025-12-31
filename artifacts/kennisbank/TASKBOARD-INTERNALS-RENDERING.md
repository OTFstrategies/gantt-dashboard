# TaskBoard Internals: DOM Architecture & Rendering

> **Reverse-engineered uit Bryntum TaskBoard 7.1.0**
> Gedetailleerde documentatie over de DOM structuur, DomSync rendering, en TaskBoard mixins.

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [DOM Structuur](#dom-structuur)
3. [TaskBoard Mixins Architectuur](#taskboard-mixins-architectuur)
4. [DomConfig & DomSync](#domconfig--domsync)
5. [Card Rendering Pipeline](#card-rendering-pipeline)
6. [Swimlane Rendering](#swimlane-rendering)
7. [Column Rendering](#column-rendering)
8. [TaskItems System](#taskitems-system)
9. [Card Sizes & Responsive Rendering](#card-sizes--responsive-rendering)
10. [Virtualization](#virtualization)
11. [DOM Transition Animations](#dom-transition-animations)
12. [DOM Element Resolution](#dom-element-resolution)
13. [Recompose & Refresh](#recompose--refresh)
14. [Complete TypeScript Interfaces](#complete-typescript-interfaces)

---

## Overzicht

TaskBoard gebruikt een declaratieve rendering architectuur gebouwd op:

- **DomSync**: Virtual DOM-achtige reconciliatie per element
- **DomConfig**: Declaratieve DOM beschrijving objecten
- **Renderers**: Callback functies voor custom rendering
- **TaskItems**: Configureerbare card content items

### Rendering Pipeline

```
Data Change (TaskStore)
        │
        ▼
┌─────────────────────┐
│   Store Listeners   │
│  (refresh, change)  │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│   Generate DomConfig │
│   (per swimlane/    │
│   column/card)      │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│   Call Renderers    │
│   (taskRenderer,    │
│   swimlaneRenderer) │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│     DomSync.sync()  │
│   (diff & patch)    │
└─────────────────────┘
        │
        ▼
    DOM Updated
```

---

## DOM Structuur

### Complete DOM Hierarchie

```html
<!-- TaskBoard root element -->
<div class="b-taskboard b-panel b-widget">
    <!-- Panel header (optional) -->
    <div class="b-panel-header">
        <div class="b-header-title">TaskBoard Title</div>
        <div class="b-toolbar">...</div>
    </div>

    <!-- Body wrapper -->
    <div class="b-panel-body-wrap">
        <!-- Column headers (buiten swimlanes) -->
        <div class="b-taskboard-column-headers">
            <div class="b-taskboard-column-header b-color-yellow" data-column="todo">
                <div class="b-taskboard-column-header-text">Todo</div>
                <div class="b-taskboard-column-header-count">5</div>
                <div class="b-taskboard-column-header-collapse">
                    <i class="b-icon b-icon-collapse"></i>
                </div>
            </div>
            <!-- More column headers... -->
        </div>

        <!-- Swimlane container -->
        <div class="b-taskboard-swimlanes">
            <!-- Single swimlane -->
            <div class="b-taskboard-swimlane b-color-blue" data-swimlane="high-priority">
                <!-- Swimlane header -->
                <div class="b-taskboard-swimlane-header">
                    <div class="b-taskboard-swimlane-title">High Priority</div>
                    <div class="b-taskboard-swimlane-collapse">
                        <i class="b-icon b-icon-collapse"></i>
                    </div>
                </div>

                <!-- Swimlane body (contains columns) -->
                <div class="b-taskboard-swimlane-body">
                    <!-- Column within swimlane -->
                    <div class="b-taskboard-column" data-column="todo">
                        <!-- Card container -->
                        <div class="b-taskboard-card-container">
                            <!-- Task card -->
                            <div class="b-taskboard-card b-selected" data-task-id="1">
                                <div class="b-taskboard-card-header">
                                    <div class="b-taskboard-card-title">Task Name</div>
                                    <div class="b-taskboard-resource-avatars">
                                        <img class="b-resource-avatar" />
                                    </div>
                                </div>
                                <div class="b-taskboard-card-body">
                                    <div class="b-taskboard-progress">...</div>
                                </div>
                                <div class="b-taskboard-card-footer">
                                    <div class="b-taskboard-resource-avatars">...</div>
                                </div>
                            </div>
                            <!-- More cards... -->
                        </div>
                    </div>
                    <!-- More columns... -->
                </div>
            </div>
            <!-- More swimlanes... -->
        </div>
    </div>
</div>
```

### CSS Classes Reference

| Class | Beschrijving |
|-------|-------------|
| `.b-taskboard` | Root TaskBoard element |
| `.b-taskboard-column-headers` | Container voor column headers |
| `.b-taskboard-column-header` | Individuele column header |
| `.b-taskboard-swimlanes` | Container voor alle swimlanes |
| `.b-taskboard-swimlane` | Individuele swimlane |
| `.b-taskboard-swimlane-header` | Swimlane header met titel |
| `.b-taskboard-swimlane-body` | Swimlane body met columns |
| `.b-taskboard-column` | Column binnen swimlane |
| `.b-taskboard-card-container` | Container voor cards in column |
| `.b-taskboard-card` | Task card element |
| `.b-taskboard-card-header` | Card header sectie |
| `.b-taskboard-card-body` | Card body sectie |
| `.b-taskboard-card-footer` | Card footer sectie |
| `.b-selected` | Geselecteerde card |
| `.b-collapsed` | Collapsed column/swimlane |
| `.b-color-{name}` | Color class (yellow, blue, etc.) |

---

## TaskBoard Mixins Architectuur

TaskBoard is opgebouwd uit meerdere mixins die elk een specifiek aspect van de functionaliteit afhandelen:

### Mixin Hierarchy

```
TaskBoard
    └── TaskBoardBase (extends Panel)
            ├── TaskBoardDom
            ├── TaskBoardDomEvents
            ├── TaskBoardColumns
            ├── TaskBoardSwimlanes
            ├── TaskBoardStores
            ├── TaskBoardScroll
            ├── TaskBoardVirtualization
            ├── ResponsiveCards
            └── ExpandCollapse
```

### TaskBoardDom Mixin

Verantwoordelijk voor alle DOM operaties:

```typescript
export class TaskBoardDomClass {
    // Element getters
    getColumnElement(columnRecord: ColumnModel): HTMLElement;
    getColumnElements(columnRecord: ColumnModel): HTMLElement[];  // Meerdere per swimlane
    getColumnHeaderElement(columnRecord: ColumnModel): HTMLElement;
    getSwimlaneElement(swimlaneRecord: SwimlaneModel): HTMLElement;
    getSwimlaneColumnElement(swimlaneRecord: SwimlaneModel, columnRecord: ColumnModel): HTMLElement;
    getTaskElement(taskRecord: TaskModel): HTMLElement;
    getTaskColumnElement(taskRecord: TaskModel): HTMLElement;
    getTaskSwimlaneElement(taskRecord: TaskModel): HTMLElement;

    // Record resolution from DOM elements
    resolveColumnRecord(element: HTMLElement): ColumnModel;
    resolveSwimlaneRecord(element: HTMLElement): SwimlaneModel;
    resolveTaskRecord(element: HTMLElement): TaskModel;
}
```

### TaskBoardStores Mixin

Beheert data stores:

```typescript
export class TaskBoardStoresClass {
    // Data properties
    project: ProjectModel;
    tasks: TaskModel[];
    resources: ResourceModel[];
    assignments: AssignmentModel[];

    // Methods
    removeTask(taskRecord: TaskModel | TaskModel[]): Promise<boolean>;
}
```

### TaskBoardColumns Mixin

Column management:

```typescript
export class TaskBoardColumnsClass {
    columnField: string;      // Field op TaskModel voor column mapping
    columns: Store;           // ColumnStore
    autoGenerateColumns: boolean;
    chainFilters: boolean;
}
```

### TaskBoardSwimlanes Mixin

Swimlane management:

```typescript
export class TaskBoardSwimlanesClass {
    swimlaneField: string;    // Field op TaskModel voor swimlane mapping
    swimlanes: Store;         // SwimlaneStore
    autoGenerateSwimlanes: boolean;
}
```

---

## DomConfig & DomSync

### DomConfig Type

```typescript
type DomConfig = Record<string, any> & {
    // Element type
    tag?: string;              // Default: 'div', special: '#fragment'

    // Positioning
    parent?: HTMLElement;
    nextSibling?: HTMLElement;

    // Styling
    class?: string | Record<string, boolean>;
    className?: string | Record<string, boolean>;
    style?: string | Record<string, string>;

    // Content
    text?: string;             // XSS-safe text content
    html?: string;             // Raw HTML (mutually exclusive with text/children)
    children?: DomConfig[] | Record<string, DomConfig>;

    // Data
    elementData?: object;      // Custom data stored on element
    dataset?: Record<string, string>;  // data-* attributes

    // Special
    ns?: string;               // XML namespace (for SVG)
    tooltip?: TooltipConfig | string;

    // Sync identification
    syncId?: string;           // Unique ID for DomSync tracking
}
```

### DomSync API

```typescript
export class DomSync {
    // Sync a DomConfig to target element
    static sync(options: {
        domConfig: DomConfig;
        targetElement: HTMLElement;
        strict?: boolean;          // Throw on mismatched children
        syncIdField?: string;      // Field to use as syncId
        syncOwner?: string;        // Owner identifier
        affected?: string | string[];
        callback?: Function;
        configEquality?: boolean;
    }): HTMLElement;

    // Add child without syncing
    static addChild(
        parentElement: HTMLElement,
        childElement: HTMLElement,
        syncId: string | number
    ): void;

    // Remove child and cleanup sync data
    static removeChild(
        parentElement: HTMLElement,
        childElement: HTMLElement
    ): void;
}
```

### DomSync Usage in TaskBoard

```javascript
// Internal TaskBoard rendering pseudocode
class TaskBoardBase {
    composeCard(taskRecord) {
        const cardConfig = {
            tag: 'div',
            class: {
                'b-taskboard-card': true,
                'b-selected': this.isSelected(taskRecord)
            },
            dataset: {
                taskId: taskRecord.id
            },
            elementData: {
                taskRecord
            },
            children: {
                header: this.composeCardHeader(taskRecord),
                body: this.composeCardBody(taskRecord),
                footer: this.composeCardFooter(taskRecord)
            }
        };

        // Allow customization via renderer
        this.taskRenderer?.({
            taskRecord,
            columnRecord: this.getTaskColumn(taskRecord),
            swimlaneRecord: this.getTaskSwimlane(taskRecord),
            cardConfig
        });

        return cardConfig;
    }

    render() {
        const domConfig = this.composeBoard();

        DomSync.sync({
            domConfig,
            targetElement: this.bodyElement,
            syncIdField: 'id'
        });
    }
}
```

---

## Card Rendering Pipeline

### 1. Card Composition

```javascript
// Card wordt samengesteld uit drie delen
composeCard(taskRecord) {
    return {
        tag: 'div',
        class: 'b-taskboard-card',
        children: {
            header: this.composeCardHeader(taskRecord),
            body: this.composeCardBody(taskRecord),
            footer: this.composeCardFooter(taskRecord)
        }
    };
}

composeCardHeader(taskRecord) {
    const headerItems = this.getHeaderItems(taskRecord);
    return {
        class: 'b-taskboard-card-header',
        children: this.renderTaskItems(headerItems, taskRecord)
    };
}

composeCardBody(taskRecord) {
    const bodyItems = this.getBodyItems(taskRecord);
    return {
        class: 'b-taskboard-card-body',
        children: this.renderTaskItems(bodyItems, taskRecord)
    };
}

composeCardFooter(taskRecord) {
    const footerItems = this.getFooterItems(taskRecord);
    return {
        class: 'b-taskboard-card-footer',
        children: this.renderTaskItems(footerItems, taskRecord)
    };
}
```

### 2. taskRenderer Callback

```javascript
const taskBoard = new TaskBoard({
    taskRenderer({ taskRecord, columnRecord, swimlaneRecord, cardConfig }) {
        // Modify card classes
        cardConfig.class['priority-high'] = taskRecord.priority === 'high';

        // Add custom element to header
        cardConfig.children.header.children.customIcon = {
            tag: 'i',
            class: `fa fa-${taskRecord.iconCls}`
        };

        // Modify body
        if (taskRecord.status === 'done') {
            cardConfig.children.body.class['completed'] = true;
        }

        // Add inline styles
        if (taskRecord.customColor) {
            cardConfig.style = {
                borderLeftColor: taskRecord.customColor
            };
        }
    }
});
```

### 3. processItems Callback

```javascript
const taskBoard = new TaskBoard({
    headerItems: {
        text: { type: 'text' },
        collapse: { type: 'collapse' }
    },
    bodyItems: {
        progress: { type: 'progress' },
        image: { type: 'image' }
    },
    footerItems: {
        resourceAvatars: { type: 'resourceAvatars' }
    },

    // Called before rendering each task's items
    processItems({ taskRecord, headerItems, bodyItems, footerItems }) {
        // Hide progress for completed tasks
        if (taskRecord.status === 'done') {
            bodyItems.progress = null;
        }

        // Show/hide items conditionally
        if (!taskRecord.image) {
            bodyItems.image = null;
        }

        // Return false to prevent card from rendering entirely
        if (taskRecord.hidden) {
            return false;
        }
    }
});
```

---

## Swimlane Rendering

### swimlaneRenderer Callback

```javascript
const taskBoard = new TaskBoard({
    swimlanes: ['High', 'Medium', 'Low'],
    swimlaneField: 'priority',

    swimlaneRenderer({ swimlaneRecord, swimlaneConfig }) {
        // swimlaneConfig structure:
        // {
        //     class: { 'b-taskboard-swimlane': true, ... },
        //     children: {
        //         header: { ... },
        //         body: { children: [...columns] }
        //     }
        // }

        const taskCount = swimlaneRecord.tasks.length;

        // Add info to header
        swimlaneConfig.children.header.children.info = {
            class: 'swimlane-info',
            text: `${taskCount} tasks`
        };

        // Add custom element before columns
        swimlaneConfig.children.body.children.unshift({
            class: 'swimlane-sidebar',
            children: [
                { tag: 'span', text: swimlaneRecord.text }
            ]
        });

        // Modify swimlane classes
        if (taskCount === 0) {
            swimlaneConfig.class['empty-swimlane'] = true;
        }
    }
});
```

### Swimlane DOM Structure

```javascript
// swimlaneConfig structure
{
    tag: 'div',
    class: {
        'b-taskboard-swimlane': true,
        'b-collapsed': swimlaneRecord.collapsed,
        [`b-color-${swimlaneRecord.color}`]: !!swimlaneRecord.color
    },
    dataset: {
        swimlane: swimlaneRecord.id
    },
    elementData: {
        swimlaneRecord
    },
    children: {
        header: {
            class: 'b-taskboard-swimlane-header',
            children: {
                title: { class: 'b-taskboard-swimlane-title', text: swimlaneRecord.text },
                collapse: { ... }
            }
        },
        body: {
            class: 'b-taskboard-swimlane-body',
            children: [
                // Column elements (array because order matters)
                { class: 'b-taskboard-column', dataset: { column: 'todo' }, ... },
                { class: 'b-taskboard-column', dataset: { column: 'doing' }, ... },
                { class: 'b-taskboard-column', dataset: { column: 'done' }, ... }
            ]
        }
    }
}
```

---

## Column Rendering

### Column Header Element

```javascript
composeColumnHeader(columnRecord) {
    return {
        tag: 'div',
        class: {
            'b-taskboard-column-header': true,
            'b-collapsed': columnRecord.collapsed,
            [`b-color-${columnRecord.color}`]: !!columnRecord.color
        },
        dataset: {
            column: columnRecord.id
        },
        elementData: {
            columnRecord
        },
        children: {
            text: {
                class: 'b-taskboard-column-header-text',
                text: columnRecord.text
            },
            count: this.showCountInHeader ? {
                class: 'b-taskboard-column-header-count',
                text: String(columnRecord.tasks.length)
            } : null,
            collapse: this.showCollapseInHeader ? {
                class: 'b-taskboard-column-header-collapse',
                children: [{
                    tag: 'i',
                    class: 'b-icon b-icon-collapse'
                }]
            } : null
        }
    };
}
```

### Column Configuration

```javascript
const taskBoard = new TaskBoard({
    columnField: 'status',
    columns: [
        {
            id: 'todo',
            text: 'Todo',
            color: 'yellow',
            collapsible: true,
            flex: 1,
            width: 300,            // Or fixed width
            tasksPerRow: 2,        // Override global setting
            tooltip: 'Tasks to be started'
        },
        {
            id: 'doing',
            text: 'In Progress',
            color: 'blue',
            hidden: false
        },
        {
            id: 'done',
            text: 'Done',
            color: 'green'
        }
    ],

    // Global column settings
    showCountInHeader: true,
    showCollapseInHeader: true,
    autoGenerateColumns: false
});
```

---

## TaskItems System

### Built-in Task Item Types

| Type | Beschrijving | Field |
|------|-------------|-------|
| `text` | Task naam/titel | `name` |
| `template` | Custom template functie | - |
| `progress` | Progress bar | `progress` |
| `resourceAvatars` | Assigned resources | - |
| `image` | Task afbeelding | `image` |
| `separator` | Visuele scheidingslijn | - |
| `rating` | Sterren rating | `rating` |
| `collapse` | Collapse button | `collapsed` |
| `chart` | Mini chart | custom |

### TaskItem Configuration

```typescript
interface TaskItemOptions {
    // Item type
    type: 'text' | 'template' | 'progress' | 'resourceAvatars' |
          'image' | 'separator' | 'rating' | 'collapse' | 'chart' | string;

    // Common options
    cls?: string;
    style?: string | object;
    weight?: number;  // Ordering

    // Type-specific options
    field?: string;           // For text, progress, rating
    template?: (context) => string;  // For template type
    max?: number;             // For progress, rating
    baseUrl?: string;         // For image
    altField?: string;        // For image
    chartType?: string;       // For chart
    chartConfig?: object;     // For chart
    editor?: object | null;   // Editor config or null to disable
}
```

### Configuring Items per Section

```javascript
const taskBoard = new TaskBoard({
    // Card header items
    headerItems: {
        text: {
            type: 'text',
            field: 'name',   // Read from taskRecord.name
            cls: 'task-title'
        },
        collapse: {
            type: 'collapse'
        }
    },

    // Card body items
    bodyItems: {
        description: {
            type: 'template',
            template: ({ taskRecord }) => StringHelper.xss`
                <div class="description">${taskRecord.description}</div>
            `
        },
        progress: {
            type: 'progress',
            max: 100
        },
        image: {
            type: 'image',
            baseUrl: 'images/',
            altField: 'imageDescription'
        }
    },

    // Card footer items
    footerItems: {
        resourceAvatars: {
            type: 'resourceAvatars'
        },
        dueDate: {
            type: 'template',
            template: ({ taskRecord }) => taskRecord.dueDate ?
                DateHelper.format(taskRecord.dueDate, 'MMM D') : ''
        }
    }
});
```

### Custom TaskItem Type

```javascript
// Register custom task item type
TaskBoard.registerTaskItemType({
    type: 'tags',

    render({ taskRecord, itemConfig }) {
        const tags = taskRecord.tags || [];

        return {
            class: 'task-tags',
            children: tags.map(tag => ({
                tag: 'span',
                class: 'task-tag',
                text: tag,
                dataset: { tag }
            }))
        };
    }
});

// Usage
const taskBoard = new TaskBoard({
    bodyItems: {
        tags: { type: 'tags' }
    }
});
```

---

## Card Sizes & Responsive Rendering

### CardSize Configuration

```typescript
type CardSize = {
    name: string;              // Applied as CSS class 'b-[name]-cards'
    maxWidth?: number;         // Max width in px for this level
    maxAvatars?: number;       // Max avatars to show
    headerItems?: Record<string, TaskItemOptions>;
    bodyItems?: Record<string, TaskItemOptions>;
    footerItems?: Record<string, TaskItemOptions>;
}
```

### Usage

```javascript
const taskBoard = new TaskBoard({
    cardSizes: [
        {
            name: 'small',
            maxWidth: 200,
            maxAvatars: 2,
            // Hide body items for small cards
            bodyItems: {
                progress: null,
                image: null
            }
        },
        {
            name: 'medium',
            maxWidth: 350,
            maxAvatars: 4,
            bodyItems: {
                image: null  // Still hide image
            }
        },
        {
            name: 'large',
            // No maxWidth = applies to all larger sizes
            maxAvatars: 8
            // All items shown
        }
    ],

    tasksPerRow: 3  // Controls card width, thus which size applies
});
```

### CSS for Card Sizes

```css
/* Small cards */
.b-small-cards .b-taskboard-card {
    font-size: 12px;
}

.b-small-cards .b-taskboard-card-header {
    padding: 0.5em;
}

/* Medium cards */
.b-medium-cards .b-taskboard-card {
    font-size: 14px;
}

/* Large cards */
.b-large-cards .b-taskboard-card {
    font-size: 16px;
}

.b-large-cards .b-taskboard-card-body {
    padding: 1em;
}
```

---

## Virtualization

### TaskBoardVirtualization Mixin

```typescript
type TaskBoardVirtualizationClassConfig = {
    // Enable partial virtualized rendering
    virtualize?: boolean;

    // Draw cards during scroll or only after scroll ends
    drawOnScroll?: boolean;

    // Custom height calculation for virtualization
    getTaskHeight?: (taskRecord: TaskModel) => number;
}
```

### Usage

```javascript
const taskBoard = new TaskBoard({
    // Enable virtualization for large datasets
    virtualize: true,

    // Draw while scrolling (smoother but slower)
    drawOnScroll: true,

    // Provide task heights for better estimation
    getTaskHeight(taskRecord) {
        // Return estimated height in pixels
        if (taskRecord.hasImage) {
            return 250;
        }
        if (taskRecord.description?.length > 100) {
            return 150;
        }
        return 100;
    }
});
```

### Virtualization Behavior

```
┌─────────────────────────────────────┐
│     Viewport (visible area)         │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ Rendered Card 1             │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Rendered Card 2             │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Rendered Card 3             │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│     Buffer zone (pre-rendered)      │
│  ┌─────────────────────────────┐    │
│  │ Rendered Card 4             │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│     Not rendered (placeholders)     │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│  │ Placeholder height: 100px   │    │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│  │ Placeholder height: 150px   │    │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
└─────────────────────────────────────┘
```

---

## DOM Transition Animations

### useDomTransition Config

```javascript
const taskBoard = new TaskBoard({
    // Enable experimental DOM transitions
    useDomTransition: true
});
```

### Wat Wordt Geanimeerd

Met `useDomTransition: true`:

1. **Card Movement**: Cards animeren naar nieuwe posities bij:
   - Drag & drop tussen columns/swimlanes
   - Sorting changes
   - Filter changes

2. **Column Reordering**: Columns animeren bij drag

3. **Expand/Collapse**: Smooth transitions bij in-/uitklappen

### CSS Animations

```css
/* Card transition animation */
.b-taskboard-card {
    transition:
        transform 200ms ease-out,
        opacity 200ms ease-out;
}

/* Animating card */
.b-taskboard-card.b-animating {
    pointer-events: none;
}

/* Entering card */
.b-taskboard-card.b-entering {
    opacity: 0;
    transform: scale(0.9);
}

/* Leaving card */
.b-taskboard-card.b-leaving {
    opacity: 0;
    transform: scale(0.9);
}
```

---

## DOM Element Resolution

### Van Element naar Record

```javascript
// Click handler voorbeeld
taskBoard.on({
    element: taskBoard.element,
    click(event) {
        // Resolve task from clicked element
        const taskRecord = taskBoard.resolveTaskRecord(event.target);
        if (taskRecord) {
            console.log('Clicked task:', taskRecord.name);
        }

        // Resolve column
        const columnRecord = taskBoard.resolveColumnRecord(event.target);
        if (columnRecord) {
            console.log('Clicked in column:', columnRecord.text);
        }

        // Resolve swimlane
        const swimlaneRecord = taskBoard.resolveSwimlaneRecord(event.target);
        if (swimlaneRecord) {
            console.log('Clicked in swimlane:', swimlaneRecord.text);
        }
    }
});
```

### Van Record naar Element

```javascript
// Get DOM elements from records
const taskElement = taskBoard.getTaskElement(taskRecord);
const columnElement = taskBoard.getColumnElement(columnRecord);
const swimlaneElement = taskBoard.getSwimlaneElement(swimlaneRecord);

// Get column header
const headerElement = taskBoard.getColumnHeaderElement(columnRecord);

// Get intersection element
const intersectionElement = taskBoard.getSwimlaneColumnElement(
    swimlaneRecord,
    columnRecord
);

// Get task's containing elements
const taskColumnElement = taskBoard.getTaskColumnElement(taskRecord);
const taskSwimlaneElement = taskBoard.getTaskSwimlaneElement(taskRecord);
```

### ElementData Access

```javascript
// Cards store their record in elementData
const cardElement = document.querySelector('.b-taskboard-card');
const taskRecord = cardElement.elementData.taskRecord;

// Swimlanes
const swimlaneElement = document.querySelector('.b-taskboard-swimlane');
const swimlaneRecord = swimlaneElement.elementData.swimlaneRecord;

// Columns
const columnElement = document.querySelector('.b-taskboard-column');
const columnRecord = columnElement.elementData.columnRecord;
```

---

## Recompose & Refresh

### Widget Recompose

```javascript
// Force full recompose of TaskBoard
taskBoard.recompose();

// Listen for recompose events
taskBoard.on({
    recompose() {
        console.log('TaskBoard DOM has been recomposed');
    }
});
```

### Store Refresh

```javascript
// TaskStore refresh triggers board update
taskBoard.project.taskStore.on({
    refresh({ action }) {
        console.log('Store refreshed due to:', action);
        // action: 'dataset', 'sort', 'filter', 'create', 'update', 'delete', 'group'
    }
});
```

### Manual Refresh

```javascript
// Refresh single task
taskBoard.refreshTask(taskRecord);

// Refresh column
taskBoard.refreshColumn(columnRecord);

// Refresh swimlane
taskBoard.refreshSwimlane(swimlaneRecord);

// Full board refresh
taskBoard.refresh();
```

---

## Complete TypeScript Interfaces

```typescript
// DomConfig type
type DomConfig = Record<string, any> & {
    tag?: string;
    parent?: HTMLElement;
    nextSibling?: HTMLElement;
    class?: string | Record<string, boolean>;
    className?: string | Record<string, boolean>;
    style?: string | Record<string, string>;
    text?: string;
    html?: string;
    children?: DomConfig[] | Record<string, DomConfig>;
    elementData?: object;
    dataset?: Record<string, string>;
    ns?: string;
    tooltip?: TooltipConfig | string;
    syncId?: string;
}

// Card size type
type CardSize = {
    name: string;
    maxWidth?: number;
    maxAvatars?: number;
    headerItems?: Record<string, TaskItemOptions>;
    bodyItems?: Record<string, TaskItemOptions>;
    footerItems?: Record<string, TaskItemOptions>;
}

// TaskItem options
interface TaskItemOptions {
    type: string;
    field?: string;
    cls?: string;
    style?: string | object;
    weight?: number;
    template?: (context: TaskItemContext) => string | DomConfig;
    max?: number;
    baseUrl?: string;
    altField?: string;
    chartType?: string;
    chartConfig?: object;
    editor?: object | null;
}

// Renderer context
interface TaskRendererContext {
    taskRecord: TaskModel;
    columnRecord: ColumnModel;
    swimlaneRecord: SwimlaneModel;
    cardConfig: DomConfig;
}

interface SwimlaneRendererContext {
    swimlaneRecord: SwimlaneModel;
    swimlaneConfig: DomConfig;
}

interface ProcessItemsContext {
    taskRecord: TaskModel;
    headerItems: Record<string, TaskItemOptions>;
    bodyItems: Record<string, TaskItemOptions>;
    footerItems: Record<string, TaskItemOptions>;
}

// TaskBoardDom mixin
interface TaskBoardDomClass {
    getColumnElement(columnRecord: ColumnModel): HTMLElement;
    getColumnElements(columnRecord: ColumnModel): HTMLElement[];
    getColumnHeaderElement(columnRecord: ColumnModel): HTMLElement;
    getSwimlaneElement(swimlaneRecord: SwimlaneModel): HTMLElement;
    getSwimlaneColumnElement(swimlaneRecord: SwimlaneModel, columnRecord: ColumnModel): HTMLElement;
    getTaskElement(taskRecord: TaskModel): HTMLElement;
    getTaskColumnElement(taskRecord: TaskModel): HTMLElement;
    getTaskSwimlaneElement(taskRecord: TaskModel): HTMLElement;
    resolveColumnRecord(element: HTMLElement): ColumnModel;
    resolveSwimlaneRecord(element: HTMLElement): SwimlaneModel;
    resolveTaskRecord(element: HTMLElement): TaskModel;
}

// TaskBoardVirtualization mixin
interface TaskBoardVirtualizationClassConfig {
    virtualize?: boolean;
    drawOnScroll?: boolean;
    getTaskHeight?: (taskRecord: TaskModel) => number;
}

// Rendering configs
interface TaskBoardBaseConfig {
    taskRenderer?: (context: TaskRendererContext) => void;
    swimlaneRenderer?: (context: SwimlaneRendererContext) => void;
    processItems?: (context: ProcessItemsContext) => boolean | void;
    headerItems?: Record<string, TaskItemOptions>;
    bodyItems?: Record<string, TaskItemOptions>;
    footerItems?: Record<string, TaskItemOptions>;
    cardSizes?: CardSize[];
    useDomTransition?: boolean;
    virtualize?: boolean;
}

// DomSync static methods
interface DomSyncStatic {
    sync(options: {
        domConfig: DomConfig;
        targetElement: HTMLElement;
        strict?: boolean;
        syncIdField?: string;
        syncOwner?: string;
        affected?: string | string[];
        callback?: Function;
        configEquality?: boolean;
    }): HTMLElement;

    addChild(
        parentElement: HTMLElement,
        childElement: HTMLElement,
        syncId: string | number
    ): void;

    removeChild(
        parentElement: HTMLElement,
        childElement: HTMLElement
    ): void;
}
```

---

## Zie Ook

- [INTERNALS-DOMSYNC.md](./INTERNALS-DOMSYNC.md) - Core DomSync werking
- [TASKBOARD-DEEP-DIVE-CARDS.md](./TASKBOARD-DEEP-DIVE-CARDS.md) - Card configuratie
- [TASKBOARD-DEEP-DIVE-COLUMNS.md](./TASKBOARD-DEEP-DIVE-COLUMNS.md) - Column configuratie
- [DEEP-DIVE-RENDERING.md](./DEEP-DIVE-RENDERING.md) - Bryntum rendering algemeen

---

*Gegenereerd uit Bryntum TaskBoard 7.1.0 broncode analyse*
*Laatste update: December 2024*
