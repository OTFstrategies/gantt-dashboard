# TaskBoard Implementation: Scrolling & Navigation

> **Complete guide** voor scroll APIs, navigation methods, en scroll widgets in Bryntum TaskBoard.

---

## Overzicht

TaskBoard biedt uitgebreide scroll- en navigatiemogelijkheden:

| Component | Beschrijving |
|-----------|--------------|
| **scrollToTask()** | Scroll specifieke task in view |
| **scrollToColumn()** | Scroll specifieke kolom in view |
| **scrollToSwimlane()** | Scroll specifieke swimlane in view |
| **scrollToIntersection()** | Scroll swimlane/column kruispunt |
| **ColumnScrollButton** | Widget met column dropdown |
| **SwimlaneScrollButton** | Widget met swimlane dropdown |
| **stickyHeaders** | Headers blijven zichtbaar |

---

## 1. Scroll Methods

### 1.1 scrollToTask

Scroll een specifieke task in view:

```javascript
// Scroll naar task by ID
taskBoard.scrollToTask(404);

// Scroll naar task by record
const task = taskBoard.project.taskStore.getById(404);
taskBoard.scrollToTask(task);

// Met scroll options
taskBoard.scrollToTask(404, {
    block: 'center',    // 'start', 'center', 'end', 'nearest'
    animate: true       // Smooth scroll
});
```

### 1.2 scrollToColumn

Scroll een specifieke kolom in view:

```javascript
// Scroll naar column by ID
taskBoard.scrollToColumn('done');

// Scroll naar column record
const column = taskBoard.columns.getById('done');
taskBoard.scrollToColumn(column);

// Met options
taskBoard.scrollToColumn('done', {
    animate: {
        duration: 300
    }
});
```

### 1.3 scrollToSwimlane

Scroll een specifieke swimlane in view:

```javascript
// Scroll naar swimlane by ID
taskBoard.scrollToSwimlane('hr');

// Scroll naar swimlane record
const swimlane = taskBoard.swimlanes.getById('hr');
taskBoard.scrollToSwimlane(swimlane);
```

### 1.4 scrollToIntersection

Scroll naar het kruispunt van een swimlane en column:

```javascript
// Scroll naar HR swimlane, Q4 column
taskBoard.scrollToIntersection('hr', 'q4');

// Met records
const swimlane = taskBoard.swimlanes.getById('hr');
const column = taskBoard.columns.getById('q4');
taskBoard.scrollToIntersection(swimlane, column);

// Async with await
await taskBoard.scrollToIntersection('hr', 'q4');
console.log('Scroll complete');
```

---

## 2. Scroll Widgets in Toolbar

### 2.1 SwimlaneScrollButton

Een button met dropdown menu om swimlanes te selecteren:

```javascript
const taskBoard = new TaskBoard({
    tbar: [
        { type: 'swimlaneScrollButton' }
    ],

    swimlanes: [
        { id: 'devs', text: 'Developers' },
        { id: 'sales', text: 'Sales' },
        { id: 'mrkt', text: 'Marketing' },
        { id: 'hr', text: 'Human Relations' },
        { id: 'mgmt', text: 'Management' }
    ],

    swimlaneField: 'team'
});
```

### 2.2 ColumnScrollButton

Een button met dropdown menu om columns te selecteren:

```javascript
const taskBoard = new TaskBoard({
    tbar: [
        { type: 'columnScrollButton' }
    ],

    columns: [
        { id: 'unplanned', text: 'Unplanned' },
        { id: 'q1', text: 'Quarter 1' },
        { id: 'q2', text: 'Quarter 2' },
        { id: 'q3', text: 'Quarter 3' },
        { id: 'q4', text: 'Quarter 4' },
        { id: 'finished', text: 'Finished' }
    ]
});
```

### 2.3 Gecombineerde Navigation Toolbar

```javascript
tbar: [
    { type: 'swimlaneScrollButton' },
    { type: 'columnScrollButton' },
    {
        type: 'button',
        text: 'Scroll to HR/Q4',
        onClick: 'up.onScrollToIntersectionClick'
    },
    {
        type: 'button',
        text: 'Scroll to Conference Task',
        onClick: 'up.onScrollToTaskClick'
    }
],

onScrollToIntersectionClick() {
    taskBoard.scrollToIntersection('hr', 'q4');
},

onScrollToTaskClick() {
    taskBoard.scrollToTask(404);
}
```

---

## 3. Sticky Headers

### 3.1 Enable Sticky Headers

```javascript
const taskBoard = new TaskBoard({
    stickyHeaders: true,  // Headers blijven zichtbaar bij scrollen

    columns: [
        { id: 'todo', text: 'Todo' },
        { id: 'doing', text: 'In Progress' },
        { id: 'done', text: 'Done' }
    ]
});
```

### 3.2 Met Swimlanes

```javascript
const taskBoard = new TaskBoard({
    stickyHeaders: true,

    swimlanes: [
        { id: 'dev', text: 'Development', collapsible: false },
        { id: 'qa', text: 'QA', collapsible: false }
    ],

    swimlaneField: 'department'
});
```

---

## 4. Scroll Options (BryntumScrollOptions)

### 4.1 Block Positioning

```javascript
// Scroll task naar top van viewport
taskBoard.scrollToTask(1, { block: 'start' });

// Scroll task naar center van viewport
taskBoard.scrollToTask(1, { block: 'center' });

// Scroll task naar bottom van viewport
taskBoard.scrollToTask(1, { block: 'end' });

// Scroll minimaal (alleen als nodig)
taskBoard.scrollToTask(1, { block: 'nearest' });
```

### 4.2 Animatie Options

```javascript
// Smooth scroll met animatie
taskBoard.scrollToTask(1, {
    animate: true
});

// Custom animatie duration
taskBoard.scrollToTask(1, {
    animate: {
        duration: 500  // ms
    }
});

// Geen animatie (instant)
taskBoard.scrollToTask(1, {
    animate: false
});
```

### 4.3 Highlight After Scroll

```javascript
// Scroll en highlight task
await taskBoard.scrollToTask(1);
const task = taskBoard.project.taskStore.getById(1);
taskBoard.selectTask(task);
```

---

## 5. Programmatic Navigation

### 5.1 Navigate to First/Last Task

```javascript
// Scroll naar eerste task
function scrollToFirstTask() {
    const firstTask = taskBoard.project.taskStore.first;
    if (firstTask) {
        taskBoard.scrollToTask(firstTask, { block: 'start' });
    }
}

// Scroll naar laatste task
function scrollToLastTask() {
    const lastTask = taskBoard.project.taskStore.last;
    if (lastTask) {
        taskBoard.scrollToTask(lastTask, { block: 'end' });
    }
}
```

### 5.2 Navigate to Tasks in Column

```javascript
function scrollToFirstTaskInColumn(columnId) {
    const column = taskBoard.columns.getById(columnId);
    const tasks = column.tasks;

    if (tasks.length > 0) {
        taskBoard.scrollToTask(tasks[0]);
    }
}
```

### 5.3 Keyboard Navigation Integration

```javascript
const taskBoard = new TaskBoard({
    keyMap: {
        'Home': () => scrollToFirstTask(),
        'End': () => scrollToLastTask(),
        'Ctrl+Home': () => taskBoard.scrollToColumn(taskBoard.columns.first),
        'Ctrl+End': () => taskBoard.scrollToColumn(taskBoard.columns.last)
    }
});
```

---

## 6. Scroll Events

### 6.1 Listen to Scroll

```javascript
taskBoard.on({
    scroll({ x, y, source }) {
        console.log(`Scrolled to x: ${x}, y: ${y}`);
    }
});
```

### 6.2 Scroll Position Tracking

```javascript
// Get current scroll position
const scrollable = taskBoard.scrollable;
console.log('X:', scrollable.x, 'Y:', scrollable.y);

// Monitor scroll
taskBoard.scrollable.on({
    scroll({ x, y }) {
        updateScrollIndicator(x, y);
    }
});
```

---

## 7. Large Datasets & Virtual Scrolling

### 7.1 Optimized Column Widths

```javascript
const taskBoard = new TaskBoard({
    columns: [
        { id: 'todo', text: 'Todo', width: 350 },
        { id: 'doing', text: 'In Progress', width: 350 },
        { id: 'review', text: 'Review', width: 350 },
        { id: 'done', text: 'Done', width: 350 }
    ]
});
```

### 7.2 Performance met Veel Swimlanes

```javascript
// Disable collapsible voor betere scroll performance
swimlanes: [
    { id: 'devs', text: 'Developers', collapsible: false },
    { id: 'sales', text: 'Sales', collapsible: false },
    { id: 'mrkt', text: 'Marketing', collapsible: false }
]
```

---

## 8. TypeScript Interfaces

```typescript
// Scroll Options
interface BryntumScrollOptions {
    // Where to position the element in the viewport
    block?: 'start' | 'center' | 'end' | 'nearest';

    // Animate the scroll
    animate?: boolean | {
        duration?: number;
    };
}

// ColumnScrollButton Config
interface ColumnScrollButtonConfig {
    type?: 'columnScrollButton' | 'columnscrollbutton';

    // Auto-detected TaskBoard reference
    taskBoard?: TaskBoard;

    // Standard Button configs
    text?: string;
    icon?: string;
    tooltip?: string;
    disabled?: boolean;
}

// SwimlaneScrollButton Config
interface SwimlaneScrollButtonConfig {
    type?: 'swimlaneScrollButton' | 'swimlanescrollbutton';

    // Auto-detected TaskBoard reference
    taskBoard?: TaskBoard;

    // Standard Button configs
    text?: string;
    icon?: string;
    tooltip?: string;
    disabled?: boolean;
}

// Scroll Methods
interface TaskBoardScroll {
    // Scroll to task
    scrollToTask(
        taskOrId: TaskModel | number | string,
        options?: BryntumScrollOptions
    ): Promise<void>;

    // Scroll to column
    scrollToColumn(
        columnOrId: ColumnModel | number | string,
        options?: BryntumScrollOptions
    ): Promise<void>;

    // Scroll to swimlane
    scrollToSwimlane(
        swimlaneOrId: SwimlaneModel | number | string,
        options?: BryntumScrollOptions
    ): Promise<void>;

    // Scroll to intersection
    scrollToIntersection(
        swimlaneOrId: SwimlaneModel | number | string,
        columnOrId: ColumnModel | number | string,
        options?: BryntumScrollOptions
    ): Promise<void>;
}

// Scroller Class
interface Scroller {
    // Current positions
    readonly x: number;
    readonly y: number;

    // Maximum scroll positions
    readonly maxX: number;
    readonly maxY: number;

    // Last scroll positions
    readonly lastScrollTop: number;
    readonly lastScrollLeft: number;

    // Overflow settings
    overflowX: boolean | string;
    overflowY: boolean | string;

    // Scroll to position
    scrollTo(
        toX?: number,
        toY?: number,
        options?: { animate?: boolean | AnimateScrollOptions }
    ): Promise<any>;
}

// Sticky Headers Config
interface TaskBoardConfig {
    stickyHeaders?: boolean;
}
```

---

## 9. Complete Example

```javascript
import { TaskBoard } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Enable sticky headers
    stickyHeaders: true,
    showCountInHeader: false,

    // Columns with fixed widths
    columns: [
        { id: 'unplanned', text: 'Unplanned', width: 350, color: '#3bc9db' },
        { id: 'asap', text: 'ASAP', width: 350, color: '#fa5252' },
        { id: 'q1', text: 'Quarter 1', width: 350, color: '#f76707' },
        { id: 'q2', text: 'Quarter 2', width: 350, color: '#ff922b' },
        { id: 'q3', text: 'Quarter 3', width: 350, color: '#ffc078' },
        { id: 'q4', text: 'Quarter 4', width: 350, color: '#ffe8cc' },
        { id: 'later', text: 'Later', width: 350, color: '#da77f2' },
        { id: 'finished', text: 'Finished', width: 350, color: '#82c91e' }
    ],
    columnField: 'when',

    // Swimlanes
    swimlanes: [
        { id: 'devs', text: 'Developers', collapsible: false },
        { id: 'sales', text: 'Sales', collapsible: false },
        { id: 'mrkt', text: 'Marketing', collapsible: false },
        { id: 'hr', text: 'Human Relations', collapsible: false },
        { id: 'mgmt', text: 'Management', collapsible: false }
    ],
    swimlaneField: 'team',

    // Navigation toolbar
    tbar: [
        { type: 'swimlaneScrollButton' },
        { type: 'columnScrollButton' },
        {
            type: 'button',
            text: 'Scroll to HR/Q4',
            onClick: 'up.onScrollToIntersectionClick'
        },
        {
            type: 'button',
            text: 'Scroll to Conference',
            onClick: 'up.onScrollToTaskClick'
        }
    ],

    // Event handlers
    onScrollToIntersectionClick() {
        taskBoard.scrollToIntersection('hr', 'q4');
    },

    onScrollToTaskClick() {
        taskBoard.scrollToTask(404);
    },

    project: {
        loadUrl: 'data/data.json',
        autoLoad: true
    }
});
```

---

## 10. Best Practices

### 10.1 Async Scroll Handling

```javascript
// Gebruik await voor sequentiële acties
async function navigateAndSelect(taskId) {
    await taskBoard.scrollToTask(taskId);
    const task = taskBoard.project.taskStore.getById(taskId);
    taskBoard.selectTask(task);
}
```

### 10.2 Debounce Scroll Updates

```javascript
let scrollTimeout;
taskBoard.scrollable.on({
    scroll() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateUI();
        }, 100);
    }
});
```

### 10.3 Scroll State Persistence

```javascript
// Save scroll position
function saveScrollState() {
    localStorage.setItem('taskboard-scroll', JSON.stringify({
        x: taskBoard.scrollable.x,
        y: taskBoard.scrollable.y
    }));
}

// Restore scroll position
function restoreScrollState() {
    const saved = localStorage.getItem('taskboard-scroll');
    if (saved) {
        const { x, y } = JSON.parse(saved);
        taskBoard.scrollable.scrollTo(x, y);
    }
}
```

---

## Samenvatting

| Method/Widget | Beschrijving |
|---------------|--------------|
| `scrollToTask()` | Scroll task in view |
| `scrollToColumn()` | Scroll column in view |
| `scrollToSwimlane()` | Scroll swimlane in view |
| `scrollToIntersection()` | Scroll kruispunt in view |
| `SwimlaneScrollButton` | Dropdown voor swimlane navigatie |
| `ColumnScrollButton` | Dropdown voor column navigatie |
| `stickyHeaders` | Headers blijven zichtbaar |

---

*Laatst bijgewerkt: December 2024*
*Bryntum TaskBoard v7.1.0*
