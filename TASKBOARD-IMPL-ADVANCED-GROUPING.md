# TaskBoard Implementation: Advanced Grouping

> **Implementatie guide** voor geavanceerde groepering in Bryntum TaskBoard: swimlanes, multi-level grouping, dynamic groupers, en nested hierarchies.

---

## Overzicht

Advanced Grouping biedt flexibele organisatie van taken:

- **Swimlanes** - Horizontale banen voor groepering
- **Multi-level Grouping** - Meerdere groeperings niveaus
- **Dynamic Groupers** - Runtime wijzigen van groepering
- **Custom Group Headers** - Eigen header rendering
- **Nested Hierarchies** - Subgroepen binnen groepen

---

## 1. Basic Swimlane Configuration

### 1.1 TaskBoard Setup

```javascript
import { TaskBoard } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    appendTo: 'container',

    project: {
        loadUrl: 'data/data.json',
        autoLoad: true
    },

    // Kolom configuratie
    columnField: 'status',
    columns: [
        { id: 'todo', text: 'To Do' },
        { id: 'doing', text: 'In Progress' },
        { id: 'done', text: 'Done' }
    ],

    // Swimlane configuratie
    swimlaneField: 'priority',
    swimlanes: [
        { id: 'critical', text: 'Critical', color: 'red' },
        { id: 'high', text: 'High', color: 'orange' },
        { id: 'medium', text: 'Medium', color: 'yellow' },
        { id: 'low', text: 'Low', color: 'gray' }
    ]
});
```

---

## 2. Swimlane Styling

### 2.1 Color Configuration

```javascript
swimlanes: [
    {
        id: 'urgent',
        text: 'Urgent',
        color: '#f44336',         // Achtergrond kleur
        style: {
            fontWeight: 'bold'
        }
    },
    {
        id: 'normal',
        text: 'Normal',
        color: '#4caf50',
        cls: 'normal-swimlane'    // CSS class
    }
]
```

### 2.2 Swimlane CSS

```css
/* Swimlane header styling */
.b-taskboard-swimlane-header {
    padding: 12px 16px;
    font-weight: 600;
    border-bottom: 2px solid currentColor;
}

/* Per swimlane styling */
.b-taskboard-swimlane[data-swimlane-id="critical"] {
    background: rgba(244, 67, 54, 0.05);
}

.b-taskboard-swimlane[data-swimlane-id="critical"] .b-taskboard-swimlane-header {
    background: #f44336;
    color: white;
}

/* Collapsed swimlane */
.b-taskboard-swimlane.b-collapsed {
    height: 40px;
    overflow: hidden;
}

.b-taskboard-swimlane.b-collapsed .b-taskboard-swimlane-body {
    display: none;
}
```

---

## 3. Dynamic Grouping

### 3.1 Change Grouping at Runtime

```javascript
// Wijzig swimlane veld
taskBoard.swimlaneField = 'category';

// Update swimlanes
taskBoard.swimlanes = [
    { id: 'frontend', text: 'Frontend' },
    { id: 'backend', text: 'Backend' },
    { id: 'design', text: 'Design' },
    { id: 'qa', text: 'QA' }
];

// Disable swimlanes
taskBoard.swimlaneField = null;
```

### 3.2 Group Selector

```javascript
tbar: {
    items: {
        groupBy: {
            type: 'combo',
            label: 'Group by',
            value: 'priority',
            items: [
                { value: null, text: 'None' },
                { value: 'priority', text: 'Priority' },
                { value: 'category', text: 'Category' },
                { value: 'assignee', text: 'Assignee' },
                { value: 'sprint', text: 'Sprint' }
            ],

            onChange({ value }) {
                this.up('taskboard').swimlaneField = value;
                this.up('taskboard').swimlanes = getSwimlanes(value);
            }
        }
    }
}

function getSwimlanes(field) {
    const configs = {
        priority: [
            { id: 'high', text: 'High Priority' },
            { id: 'medium', text: 'Medium Priority' },
            { id: 'low', text: 'Low Priority' }
        ],
        category: [
            { id: 'frontend', text: 'Frontend' },
            { id: 'backend', text: 'Backend' },
            { id: 'design', text: 'Design' }
        ],
        assignee: null,  // Dynamisch gegenereerd
        sprint: [
            { id: 'sprint-1', text: 'Sprint 1' },
            { id: 'sprint-2', text: 'Sprint 2' },
            { id: 'sprint-3', text: 'Sprint 3' }
        ]
    };

    return configs[field] || [];
}
```

---

## 4. Custom Swimlane Headers

### 4.1 Header Renderer

```javascript
swimlaneRenderer({ swimlaneRecord, taskRecords }) {
    const count = taskRecords.length;
    const completed = taskRecords.filter(t => t.status === 'done').length;
    const progress = count > 0 ? Math.round((completed / count) * 100) : 0;

    return {
        class: 'custom-swimlane-header',
        children: [
            {
                class: 'swimlane-title',
                children: [
                    { tag: 'span', class: 'swimlane-name', text: swimlaneRecord.text },
                    { tag: 'span', class: 'task-count', text: `(${count} tasks)` }
                ]
            },
            {
                class: 'swimlane-progress',
                children: [
                    {
                        class: 'progress-bar',
                        style: { width: `${progress}%` }
                    },
                    { tag: 'span', text: `${progress}%` }
                ]
            }
        ]
    };
}
```

### 4.2 Header CSS

```css
.custom-swimlane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
}

.swimlane-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.swimlane-name {
    font-weight: bold;
    font-size: 1.1em;
}

.task-count {
    color: #666;
    font-size: 0.9em;
}

.swimlane-progress {
    display: flex;
    align-items: center;
    gap: 8px;
}

.progress-bar {
    width: 100px;
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
}

.progress-bar::after {
    content: '';
    display: block;
    height: 100%;
    background: #4caf50;
    width: inherit;
}
```

---

## 5. Multi-level Grouping

### 5.1 Nested Swimlanes

```javascript
// Simuleer nested grouping met custom data
const taskBoard = new TaskBoard({
    appendTo: 'container',

    project: {
        loadUrl: 'data/data.json',
        autoLoad: true
    },

    columnField: 'status',
    columns: [
        { id: 'todo', text: 'To Do' },
        { id: 'doing', text: 'In Progress' },
        { id: 'done', text: 'Done' }
    ],

    // Primary grouping
    swimlaneField: 'team',
    swimlanes: [
        {
            id: 'frontend-team',
            text: 'Frontend Team',
            children: [
                { id: 'frontend-senior', text: 'Senior Devs' },
                { id: 'frontend-junior', text: 'Junior Devs' }
            ]
        },
        {
            id: 'backend-team',
            text: 'Backend Team',
            children: [
                { id: 'backend-api', text: 'API Team' },
                { id: 'backend-db', text: 'Database Team' }
            ]
        }
    ]
});
```

### 5.2 Composite Key Grouping

```javascript
// Creëer composite group key in data
project: {
    taskStore: {
        listeners: {
            load({ source: store }) {
                store.forEach(task => {
                    // Composite key voor nested grouping
                    task.groupKey = `${task.team}|${task.priority}`;
                });
            }
        }
    }
},

swimlaneField: 'groupKey',
swimlanes: generateCompositeSwimlanes()

function generateCompositeSwimLanes() {
    const teams = ['Frontend', 'Backend', 'Design'];
    const priorities = ['High', 'Medium', 'Low'];
    const swimlanes = [];

    teams.forEach(team => {
        priorities.forEach(priority => {
            swimlanes.push({
                id: `${team}|${priority}`,
                text: `${team} - ${priority} Priority`,
                team,
                priority
            });
        });
    });

    return swimlanes;
}
```

---

## 6. Collapsible Swimlanes

### 6.1 Collapse Control

```javascript
// Collapse specifieke swimlane
const swimlane = taskBoard.swimlanes.find(s => s.id === 'low');
swimlane.collapsed = true;

// Toggle collapse
function toggleSwimlane(taskBoard, swimlaneId) {
    const swimlane = taskBoard.swimlanes.find(s => s.id === swimlaneId);
    if (swimlane) {
        swimlane.collapsed = !swimlane.collapsed;
    }
}

// Collapse alle
function collapseAll(taskBoard) {
    taskBoard.swimlanes.forEach(sl => sl.collapsed = true);
}

// Expand alle
function expandAll(taskBoard) {
    taskBoard.swimlanes.forEach(sl => sl.collapsed = false);
}
```

### 6.2 Collapse Toolbar

```javascript
tbar: {
    items: {
        collapseAll: {
            type: 'button',
            icon: 'b-icon-collapse-all',
            tooltip: 'Collapse all swimlanes',
            onClick() {
                this.up('taskboard').swimlanes.forEach(sl => sl.collapsed = true);
            }
        },
        expandAll: {
            type: 'button',
            icon: 'b-icon-expand-all',
            tooltip: 'Expand all swimlanes',
            onClick() {
                this.up('taskboard').swimlanes.forEach(sl => sl.collapsed = false);
            }
        }
    }
}
```

---

## 7. Sorting Swimlanes

### 7.1 Sort by Task Count

```javascript
function sortSwimlanesByCount(taskBoard, ascending = false) {
    const swimlanes = [...taskBoard.swimlanes];

    swimlanes.sort((a, b) => {
        const countA = taskBoard.project.taskStore.query(
            t => t[taskBoard.swimlaneField] === a.id
        ).length;
        const countB = taskBoard.project.taskStore.query(
            t => t[taskBoard.swimlaneField] === b.id
        ).length;

        return ascending ? countA - countB : countB - countA;
    });

    taskBoard.swimlanes = swimlanes;
}
```

### 7.2 Custom Sort Order

```javascript
function sortSwimlanes(taskBoard, field, direction = 'asc') {
    const swimlanes = [...taskBoard.swimlanes];

    swimlanes.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];

        if (direction === 'asc') {
            return valA < valB ? -1 : valA > valB ? 1 : 0;
        } else {
            return valA > valB ? -1 : valA < valB ? 1 : 0;
        }
    });

    taskBoard.swimlanes = swimlanes;
}

// Sort by priority order
const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
swimlanes.sort((a, b) => priorityOrder[a.id] - priorityOrder[b.id]);
```

---

## 8. Dynamic Swimlane Generation

### 8.1 Generate from Data

```javascript
listeners: {
    load({ source: taskStore }) {
        // Verzamel unieke waarden
        const uniqueValues = new Set();

        taskStore.forEach(task => {
            if (task.assignee) {
                uniqueValues.add(task.assignee);
            }
        });

        // Genereer swimlanes
        taskBoard.swimlanes = Array.from(uniqueValues).map(value => ({
            id: value,
            text: value
        }));
    }
}
```

### 8.2 Auto-update Swimlanes

```javascript
project: {
    taskStore: {
        listeners: {
            // Update swimlanes wanneer data wijzigt
            change({ action, records }) {
                if (action === 'add' || action === 'update') {
                    updateSwimlanes();
                }
            }
        }
    }
}

function updateSwimlanes() {
    const { taskStore, swimlaneField, swimlanes } = taskBoard;
    const currentIds = new Set(swimlanes.map(s => s.id));
    const dataIds = new Set();

    taskStore.forEach(task => {
        const value = task[swimlaneField];
        if (value) dataIds.add(value);
    });

    // Voeg nieuwe swimlanes toe
    dataIds.forEach(id => {
        if (!currentIds.has(id)) {
            taskBoard.swimlanes = [
                ...taskBoard.swimlanes,
                { id, text: id }
            ];
        }
    });
}
```

---

## 9. Empty Swimlane Handling

### 9.1 Hide Empty Swimlanes

```javascript
const taskBoard = new TaskBoard({
    // ... config

    // Verberg lege swimlanes
    hideEmptySwimlanes: true
});

// Of programmatisch
function toggleEmptySwimlanes(show) {
    taskBoard.swimlanes.forEach(swimlane => {
        const taskCount = taskBoard.project.taskStore.query(
            t => t[taskBoard.swimlaneField] === swimlane.id
        ).length;

        swimlane.hidden = !show && taskCount === 0;
    });
}
```

### 9.2 Empty State Message

```javascript
swimlaneRenderer({ swimlaneRecord, taskRecords }) {
    if (taskRecords.length === 0) {
        return {
            class: 'empty-swimlane',
            children: [
                { tag: 'span', class: 'swimlane-name', text: swimlaneRecord.text },
                { tag: 'span', class: 'empty-message', text: 'No tasks' }
            ]
        };
    }

    return {
        class: 'swimlane-header',
        children: [
            { tag: 'span', class: 'swimlane-name', text: swimlaneRecord.text },
            { tag: 'span', class: 'task-count', text: `${taskRecords.length} tasks` }
        ]
    };
}
```

---

## 10. TypeScript Interfaces

```typescript
import { TaskBoard, Model } from '@bryntum/taskboard';

// Swimlane Configuration
interface SwimlaneConfig {
    id: string;
    text: string;
    color?: string;
    cls?: string;
    collapsed?: boolean;
    hidden?: boolean;
    style?: Partial<CSSStyleDeclaration>;
    children?: SwimlaneConfig[];
}

// Swimlane Renderer Context
interface SwimlaneRendererContext {
    swimlaneRecord: SwimlaneRecord;
    taskRecords: TaskModel[];
}

interface SwimlaneRecord extends Model {
    id: string;
    text: string;
    color?: string;
    collapsed: boolean;
}

// Swimlane Render Result
type SwimlaneRenderResult = string | DomConfig;

interface DomConfig {
    tag?: string;
    class?: string | Record<string, boolean>;
    style?: Record<string, string>;
    text?: string;
    children?: DomConfig[];
}

// Dynamic Grouping Config
interface GroupingConfig {
    field: string;
    swimlanes: SwimlaneConfig[];
    renderer?: SwimlaneRenderer;
}

type SwimlaneRenderer = (context: SwimlaneRendererContext) => SwimlaneRenderResult;

// TaskBoard with Grouping
interface GroupableTaskBoard extends TaskBoard {
    swimlaneField: string | null;
    swimlanes: SwimlaneConfig[];
    hideEmptySwimlanes?: boolean;
    swimlaneRenderer?: SwimlaneRenderer;
}
```

---

## 11. Complete Example

```javascript
import { TaskBoard } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    appendTo: 'container',

    project: {
        loadUrl: 'data/data.json',
        autoLoad: true
    },

    columnField: 'status',
    columns: [
        { id: 'todo', text: 'To Do', color: 'blue' },
        { id: 'doing', text: 'In Progress', color: 'orange' },
        { id: 'review', text: 'Review', color: 'purple' },
        { id: 'done', text: 'Done', color: 'green' }
    ],

    swimlaneField: 'priority',
    swimlanes: [
        { id: 'critical', text: 'Critical', color: '#f44336' },
        { id: 'high', text: 'High', color: '#ff9800' },
        { id: 'medium', text: 'Medium', color: '#ffeb3b' },
        { id: 'low', text: 'Low', color: '#9e9e9e' }
    ],

    // Custom swimlane header renderer
    swimlaneRenderer({ swimlaneRecord, taskRecords }) {
        const total = taskRecords.length;
        const done = taskRecords.filter(t => t.status === 'done').length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        return {
            class: 'swimlane-header',
            children: [
                {
                    class: 'swimlane-info',
                    children: [
                        { tag: 'span', class: 'name', text: swimlaneRecord.text },
                        { tag: 'span', class: 'count', text: `${total} tasks` }
                    ]
                },
                {
                    class: 'swimlane-progress',
                    children: [
                        {
                            class: 'progress-bar',
                            style: { '--progress': `${progress}%` }
                        },
                        { tag: 'span', class: 'progress-text', text: `${progress}%` }
                    ]
                }
            ]
        };
    },

    tbar: {
        items: {
            groupBy: {
                type: 'combo',
                label: 'Group by',
                value: 'priority',
                items: [
                    { value: null, text: 'None' },
                    { value: 'priority', text: 'Priority' },
                    { value: 'category', text: 'Category' },
                    { value: 'assignee', text: 'Assignee' }
                ],
                onChange({ value }) {
                    const tb = this.up('taskboard');
                    tb.swimlaneField = value;

                    if (value) {
                        tb.swimlanes = generateSwimlanes(tb, value);
                    }
                }
            },
            '|': null,
            collapseAll: {
                type: 'button',
                icon: 'b-icon-collapse-all',
                onClick() {
                    this.up('taskboard').swimlanes.forEach(s => s.collapsed = true);
                }
            },
            expandAll: {
                type: 'button',
                icon: 'b-icon-expand-all',
                onClick() {
                    this.up('taskboard').swimlanes.forEach(s => s.collapsed = false);
                }
            }
        }
    }
});

function generateSwimlanes(taskBoard, field) {
    const values = new Set();

    taskBoard.project.taskStore.forEach(task => {
        if (task[field]) values.add(task[field]);
    });

    return Array.from(values).map(value => ({
        id: value,
        text: value
    }));
}
```

---

## Referenties

- API: TaskBoard.swimlaneField
- API: TaskBoard.swimlanes
- API: swimlaneRenderer
- Config: hideEmptySwimlanes

---

*Document gegenereerd: December 2024*
*Bryntum TaskBoard versie: 7.1.0*
