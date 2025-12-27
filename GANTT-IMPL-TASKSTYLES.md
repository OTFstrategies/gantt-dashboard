# Gantt Implementation: Task Styles

> **Task Styles** voor het aanpassen van taskbar kleuren en styling.

---

## Overzicht

Bryntum Gantt biedt uitgebreide mogelijkheden om taskbars te stylen met kleuren en icons.

```
+--------------------------------------------------------------------------+
| GANTT                                                                     |
+--------------------------------------------------------------------------+
|  Name              |  Color     |        Timeline                        |
+--------------------------------------------------------------------------+
|  Welding 1         |  [████]    |  ████████ (red)                        |
|  Welding 2         |  [████]    |     ███████60%███ (pink)               |
|  Welding 3         |  [████]    |          ◆ (purple milestone)          |
|  ▼ Floor           |  [████]    |  ════════════════════════ (violet)     |
|    ⚙ Foundation    |  [████]    |     ████ (indigo + icon)               |
|    Paint           |  [████]    |        ███25%██████████ (blue)         |
|    Drying          |  [████]    |             ███ (cyan)                 |
|  Walls             |  [████]    |  ▊ ▊ ▊ (split task, varied colors)     |
+--------------------------------------------------------------------------+
|                                                                          |
|  TASK COLORS:                                                            |
|    eventColor: 'red'           - Named color                             |
|    eventColor: '#8B4513'       - Hex color                               |
|    eventColor: 'rgb(96,125,139)' - RGB color                             |
|    eventColor: 'rgba(255,0,0,0.14)' - RGBA with opacity                  |
|    taskIconCls: 'fa fa-gear'   - Task icon                               |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Task Styling

### 1.1 Task Colors Configuration

```javascript
import { Gantt, StringHelper } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',
    startDate: '2023-05-15',
    endDate: '2023-07-15',
    tickSize: 70,

    // Shows color picker in task menu and task editor
    showTaskColorPickers: true,

    project: {
        autoSetConstraints: true,
        tasks: [
            // Named colors
            { id: 1, startDate: '2023-05-15', duration: 5, name: 'Welding 1', eventColor: 'red' },
            { id: 2, duration: 10, name: 'Welding 2', eventColor: 'pink', percentDone: 60 },
            { id: 3, duration: 0, name: 'Milestone', eventColor: 'purple' },

            // Parent with children
            {
                id: 4,
                name: 'Floor',
                eventColor: 'violet',
                expanded: true,
                children: [
                    // With task icon
                    { id: 5, duration: 5, name: 'Foundation', eventColor: 'indigo', taskIconCls: 'fa fa-gear' },
                    { id: 6, duration: 15, name: 'Paint', eventColor: 'blue', percentDone: 25 },
                    { id: 7, duration: 2.5, name: 'Drying', eventColor: 'cyan' }
                ]
            },

            // Split task with segment colors
            {
                id: 8,
                name: 'Walls',
                startDate: '2023-05-15',
                segments: [
                    { startDate: '2023-05-15', duration: 3, name: 'Build scaffold', eventColor: 'magenta' },
                    { startDate: '2023-05-19', duration: 4.5, name: 'Climb scaffold', eventColor: 'teal' },
                    { startDate: '2023-05-24', duration: 4, name: 'Stabilize', eventColor: 'green' }
                ]
            },

            // Various color formats
            {
                id: 16,
                name: 'Bathrooms',
                expanded: true,
                eventColor: '#000',  // Hex black
                children: [
                    { id: 18, name: 'Plumbing', duration: 3, eventColor: '#8B4513' },  // Hex brown
                    { id: 19, name: 'Fix leak', duration: 0.5, eventColor: '#F5F5F5' },  // Hex white
                    { id: 20, name: 'Faucet', duration: 3.5, eventColor: 'rgba(255, 0, 0, 0.14)' },  // RGBA
                    { id: 21, name: 'Mirror', duration: 0, eventColor: 'rgb(96, 125, 139)' },  // RGB
                    { id: 22, name: 'Bidet', duration: 3.5, eventColor: 'rgba(112, 113, 114)' }
                ]
            }
        ],

        dependencies: [
            { from: 1, to: 2 },
            { from: 2, to: 3 },
            { from: 5, to: 6 },
            { from: 6, to: 7 }
        ]
    },

    columns: [
        { type: 'name', field: 'name', text: 'Name', width: 250 },
        { type: 'eventColor', text: 'Task color', width: 150 }
    ],

    // Custom task content
    taskRenderer({ taskRecord }) {
        if (taskRecord.isLeaf && !taskRecord.isMilestone) {
            return StringHelper.encodeHtml(taskRecord.name);
        }
    }
});
```

---

## 2. Available Named Colors

### 2.1 Built-in Color Palette

```javascript
// Standard named colors
const namedColors = [
    'red',
    'pink',
    'purple',
    'deep-purple',
    'indigo',
    'blue',
    'light-blue',
    'cyan',
    'teal',
    'green',
    'light-green',
    'lime',
    'yellow',
    'amber',
    'orange',
    'deep-orange',
    'gray',
    'light-gray',
    'gantt-green'
];

// Usage in task data
tasks: [
    { id: 1, name: 'Task 1', eventColor: 'red' },
    { id: 2, name: 'Task 2', eventColor: 'blue' },
    { id: 3, name: 'Task 3', eventColor: 'gantt-green' }
]
```

---

## 3. Color Column

### 3.1 Event Color Column

```javascript
columns: [
    { type: 'name', width: 250 },
    {
        type: 'eventColor',
        text: 'Task Color',
        width: 150,
        // Optionally customize the color field
        field: 'eventColor'
    }
]
```

---

## 4. Custom Task Rendering

### 4.1 Task Renderer with Styles

```javascript
taskRenderer({ taskRecord, renderData }) {
    // Add custom CSS class
    renderData.cls.add('custom-task');

    // Modify style based on task properties
    if (taskRecord.percentDone >= 100) {
        renderData.cls.add('completed');
    }

    // Return content for task bar
    if (taskRecord.isLeaf && !taskRecord.isMilestone) {
        return {
            children: [
                taskRecord.taskIconCls && {
                    tag: 'i',
                    className: taskRecord.taskIconCls,
                    style: 'margin-right: 4px'
                },
                { text: taskRecord.name }
            ].filter(Boolean)
        };
    }
}
```

---

## 5. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { StringHelper } from '@bryntum/gantt';
import { useMemo, useCallback } from 'react';

function StyledGantt({ projectData }) {
    const taskRenderer = useCallback(({ taskRecord, renderData }) => {
        // Add completion class
        if (taskRecord.percentDone >= 100) {
            renderData.cls.add('completed');
        }

        // Return task name for leaf tasks
        if (taskRecord.isLeaf && !taskRecord.isMilestone) {
            return StringHelper.encodeHtml(taskRecord.name);
        }
    }, []);

    const ganttConfig = useMemo(() => ({
        showTaskColorPickers: true,
        tickSize: 70,

        columns: [
            { type: 'name', width: 250 },
            { type: 'eventColor', text: 'Color', width: 120 },
            { type: 'percentdone', width: 100 }
        ],

        taskRenderer
    }), [taskRenderer]);

    const projectConfig = useMemo(() => ({
        autoSetConstraints: true,
        tasks: [
            { id: 1, name: 'Design', duration: 5, eventColor: 'blue', percentDone: 100 },
            { id: 2, name: 'Develop', duration: 10, eventColor: 'green', percentDone: 60, taskIconCls: 'fa fa-code' },
            { id: 3, name: 'Test', duration: 5, eventColor: 'orange', percentDone: 0 },
            { id: 4, name: 'Deploy', duration: 0, eventColor: 'purple' }
        ],
        dependencies: [
            { from: 1, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 4 }
        ]
    }), []);

    return (
        <BryntumGantt
            project={projectConfig}
            {...ganttConfig}
        />
    );
}
```

---

## 6. Styling

```css
/* Custom task colors */
.b-gantt-task-bar {
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Completed task */
.b-gantt-task.completed .b-gantt-task-bar {
    opacity: 0.7;
}

.b-gantt-task.completed .b-gantt-task-bar::after {
    content: '✓';
    position: absolute;
    right: 4px;
    color: white;
}

/* Task with icon */
.b-gantt-task-bar .fa {
    margin-right: 4px;
    opacity: 0.8;
}

/* Milestone styling */
.b-milestone .b-gantt-task-bar {
    transform: rotate(45deg);
    border-radius: 0;
}

/* Parent task (summary) */
.b-gantt-task.b-gantt-task-parent .b-gantt-task-bar {
    background: transparent;
    border-bottom: 3px solid currentColor;
}

/* Progress bar within task */
.b-gantt-task-percent {
    border-radius: 4px 0 0 4px;
    opacity: 0.3;
}

/* Split task segments */
.b-gantt-task-segment {
    border-radius: 2px;
    margin: 0 1px;
}

/* Color picker column */
.b-eventcolor-cell .b-color-picker {
    display: flex;
    align-items: center;
    gap: 8px;
}

.b-eventcolor-cell .b-color-box {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
}

/* Custom task class */
.custom-task .b-gantt-task-bar {
    transition: transform 0.2s, box-shadow 0.2s;
}

.custom-task:hover .b-gantt-task-bar {
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Task name text */
.b-gantt-task-bar {
    font-size: 12px;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    padding: 0 8px;
    display: flex;
    align-items: center;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Kleur niet zichtbaar | eventColor niet correct | Check color name/format |
| Color picker mist | showTaskColorPickers: false | Zet op true |
| Icon niet zichtbaar | taskIconCls niet correct | Check CSS class naam |
| Kleur wordt niet opgeslagen | Field niet in model | Voeg eventColor field toe |

---

## API Reference

### Task Model Color Properties

| Property | Type | Description |
|----------|------|-------------|
| `eventColor` | String | Task bar color |
| `taskIconCls` | String | Icon CSS class |

### Color Formats

| Format | Example |
|--------|---------|
| Named | `'red'`, `'blue'`, `'gantt-green'` |
| Hex | `'#FF5733'`, `'#8B4513'` |
| RGB | `'rgb(255, 87, 51)'` |
| RGBA | `'rgba(255, 87, 51, 0.5)'` |

### Gantt Config

| Property | Type | Description |
|----------|------|-------------|
| `showTaskColorPickers` | Boolean | Show color pickers |
| `taskRenderer` | Function | Custom task rendering |

### EventColor Column

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | 'eventColor' |
| `field` | String | Color field name |

---

## Bronnen

- **Example**: `examples/taskstyles/`
- **TaskModel**: `Gantt.model.TaskModel`
- **EventColorColumn**: `Gantt.column.EventColorColumn`

---

*Priority 2: Medium Priority Features*
