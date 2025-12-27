# Gantt Deep Dive: Customization & Rendering

> **Complete gids voor custom task rendering, themes, features en UI customization**

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Task Renderer](#task-renderer)
3. [Column Renderers](#column-renderers)
4. [Custom Task Model](#custom-task-model)
5. [Custom Features](#custom-features)
6. [Labels Feature](#labels-feature)
7. [Tooltips](#tooltips)
8. [View Presets](#view-presets)
9. [Styling & CSS Variables](#styling--css-variables)
10. [Best Practices](#best-practices)

---

## Overzicht

Bryntum Gantt biedt uitgebreide customization mogelijkheden via:
- **Task Renderer**: Custom HTML in task bars
- **Column Renderers**: Custom cell content
- **Features**: Pluggable feature system
- **CSS Variables**: Dynamische theming
- **View Presets**: Timeline configuratie

### Rendering Architectuur

```
┌─────────────────────────────────────────────────────────────────┐
│                     RENDERING PIPELINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Data Model          Renderer           DOM Output               │
│  ──────────          ────────           ──────────               │
│                                                                  │
│  ┌──────────┐       taskRenderer()      ┌───────────────┐       │
│  │ TaskModel│ ────► Returns DomConfig ─►│ Task Element  │       │
│  └──────────┘                           └───────────────┘       │
│                                                                  │
│  ┌──────────┐       column.renderer()   ┌───────────────┐       │
│  │  Column  │ ────► Returns DomConfig ─►│  Cell Element │       │
│  └──────────┘                           └───────────────┘       │
│                                                                  │
│  DomConfig: { tag, class, children, text, html, dataset, ... }  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Task Renderer

### Basic Task Renderer

```typescript
import { Gantt, StringHelper } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo          : 'container',
    resourceImagePath : '/images/users/',

    // Custom task content renderer
    taskRenderer({ taskRecord, renderData }) {
        // Alleen voor leaf tasks (geen parents of milestones)
        if (taskRecord.isLeaf && !taskRecord.isMilestone) {
            // Return DomConfig object(en)
            return [
                {
                    tag   : 'div',
                    class : 'task-name',
                    html  : StringHelper.encodeHtml(taskRecord.name)
                },
                {
                    tag      : 'div',
                    class    : 'b-avatar-container',
                    children : taskRecord.resources.map(resource => ({
                        tag     : 'img',
                        class   : 'b-resource-avatar',
                        src     : `/images/users/${resource.name.toLowerCase()}.png`,
                        alt     : 'User avatar',
                        dataset : {
                            resourceId : resource.id
                        }
                    }))
                }
            ];
        }

        // Return undefined voor default rendering
    }
});
```

### Conditional Rendering

```typescript
taskRenderer({ taskRecord, renderData }) {
    // Milestone: geen custom content
    if (taskRecord.isMilestone) {
        return;
    }

    // Parent tasks: toon child count
    if (taskRecord.isParent) {
        return {
            tag   : 'span',
            class : 'parent-label',
            text  : `${taskRecord.children.length} subtasks`
        };
    }

    // Leaf tasks: custom content
    return [
        {
            tag   : 'div',
            class : 'task-name',
            text  : taskRecord.name
        },
        {
            tag   : 'div',
            class : 'progress-indicator',
            style : {
                width : `${taskRecord.percentDone}%`
            }
        }
    ];
}
```

### RenderData Modificatie

```typescript
taskRenderer({ taskRecord, renderData }) {
    // Voeg CSS classes toe aan de task element
    renderData.cls['b-priority-high'] = taskRecord.priority === 'high';
    renderData.cls['b-delayed'] = taskRecord.startDate < new Date();

    // Wijzig icon class
    if (taskRecord.critical) {
        renderData.iconCls = 'fa fa-exclamation-triangle';
    }

    // Style aanpassingen
    renderData.style = {
        ...renderData.style,
        '--task-border-color' : taskRecord.eventColor
    };

    return {
        tag  : 'span',
        text : taskRecord.name
    };
}
```

---

## Column Renderers

### Name Column Renderer

```typescript
columns : [
    {
        type     : 'name',
        text     : 'Customized Name Column',
        width    : 320,
        renderer : ({ record }) => ({
            // DomConfig met nested elements
            children : [
                {
                    tag  : 'span',
                    text : record.name
                },
                // Badge met child count
                record.children?.length > 0 ? {
                    class : 'b-child-count',
                    text  : record.children.length
                } : null
            ]
        })
    }
]
```

### Custom Column Types

```typescript
columns : [
    { type : 'name', width : 250 },

    // PercentDone met circle mode
    {
        type  : 'percentdone',
        mode  : 'circle',  // 'bar' of 'circle'
        width : 100,
        align : 'center'
    },

    // Duration
    { type : 'duration' },

    // Action column met custom buttons
    {
        type    : 'action',
        width   : 45,
        actions : [
            {
                tag     : 'i',
                cls     : 'menu fa fa-fw fa-ellipsis-h',
                tooltip : 'Task menu'
            }
        ]
    }
]
```

### Resource Avatar Column

```typescript
{
    type  : 'resourceassignment',
    width : 170,
    showAvatars : true,
    renderer({ record, value }) {
        // value bevat de assigned resources
        return {
            class    : 'resource-cell',
            children : record.resources.map(res => ({
                tag   : 'img',
                class : 'avatar',
                src   : `/images/users/${res.image}`,
                title : res.name
            }))
        };
    }
}
```

---

## Custom Task Model

### Extending TaskModel

```typescript
import { TaskModel } from '@bryntum/gantt';

class Task extends TaskModel {
    // Stable class name (overleeft minification)
    static $name = 'Task';

    // Custom fields
    static get fields() {
        return [
            { name : 'priority', type : 'string', defaultValue : 'normal' },
            { name : 'hoursWorked', type : 'array' },
            { name : 'isProjectTask', type : 'boolean' }
        ];
    }

    // Computed property: inherit color from parent
    get eventColor() {
        if (!this.get('eventColor')) {
            return this.parent?.eventColor;
        }
        return super.eventColor;
    }

    // Custom method
    get projectTask() {
        let result = null;
        this.bubbleWhile(task => {
            if (task.isProjectTask) {
                result = task;
            }
            return !result && task.parent && !task.parent.isRoot;
        });
        return result;
    }

    // Computed total
    get totalHoursWorked() {
        return (this.hoursWorked || []).reduce((sum, h) => sum + (h || 0), 0);
    }
}

// Gebruik in project
const project = new ProjectModel({
    taskModelClass     : Task,
    autoSetConstraints : true,
    loadUrl            : '/api/project'
});
```

### Time-Phased Task Model

```typescript
import { TimePhasedTaskModel, DateHelper } from '@bryntum/gantt';

class MyTask extends TimePhasedTaskModel {
    static $name = 'MyTask';

    static fields = [
        'totalHoursWorked',
        { name : 'hoursWorked', type : 'array' }
    ];

    get workedHoursByDay() {
        const
            { startDate, endDate, isParent, duration } = this,
            { calendar } = this.project;

        if (!startDate || !endDate || !duration || !calendar) {
            return [];
        }

        const
            durationInDays = DateHelper.getDurationInUnit(startDate, endDate, 'd', false),
            workedHoursByDay = Array(durationInDays || 0).fill(0),
            hoursWorked = this.hoursWorked || [];

        let index = 0;

        for (let i = 0; i < durationInDays; i++) {
            const
                intervalStart = DateHelper.add(startDate, i, 'd'),
                intervalEnd = DateHelper.add(intervalStart, 1, 'd');

            if (calendar.isWorkingTime(intervalStart, intervalEnd)) {
                if (isParent) {
                    // Rollup from children
                    workedHoursByDay[i] = this.children.reduce((total, child) => {
                        if (DateHelper.intersectSpans(
                            child.startDate, child.endDate,
                            intervalStart, intervalEnd
                        )) {
                            const startDiff = DateHelper.getDurationInUnit(startDate, child.startDate, 'd');
                            return total + (child.workedHoursByDay[i - startDiff] || 0);
                        }
                        return total;
                    }, 0);
                }
                else {
                    workedHoursByDay[i] = hoursWorked[index];
                }
                index++;
            }
        }

        return workedHoursByDay;
    }

    setHoursWorked(dayIndex, hours) {
        const newValue = [...this.workedHoursByDay];
        newValue[dayIndex] = hours;
        this.hoursWorked = newValue;
    }
}
```

---

## Custom Features

### Creating a Feature

```typescript
import { InstancePlugin, GridFeatureManager, DomHelper, EventHelper, DateHelper } from '@bryntum/gantt';

class TimelineScrollButtons extends InstancePlugin {
    static $name = 'TimelineScrollButtons';

    scrollAmount = 4;

    construct(client, config) {
        super.construct(client, config);

        // Inject buttons via headerRenderer
        client.columns.last.headerRenderer = this.timeAxisHeaderRender.bind(this);
    }

    timeAxisHeaderRender({ headerElement }) {
        const parent = headerElement.closest('.b-scheduler-header');

        if (parent.querySelector('.b-scroll-button')) {
            return;
        }

        // Create scroll buttons
        DomHelper.createElement({
            parent,
            className : 'b-scroll-button b-scroll-button-previous fa fa-chevron-left'
        });

        DomHelper.createElement({
            parent,
            className : 'b-scroll-button b-scroll-button-next fa fa-chevron-right'
        });

        // Event listener
        EventHelper.on({
            element  : parent,
            click    : this.onClick,
            thisObj  : this,
            delegate : '.b-scroll-button'
        });
    }

    onClick({ target }) {
        const
            { client } = this,
            { visibleDateRange } = client,
            unit = client.viewPreset.headers[0].unit;

        let date;
        if (target.matches('.b-scroll-button-next')) {
            date = DateHelper.add(visibleDateRange.endDate, this.scrollAmount, unit);
        }
        else {
            date = DateHelper.add(visibleDateRange.startDate, -this.scrollAmount, unit);
        }

        client.scrollToDate(date, {
            animate : { duration : 600, easing : 'easeInOutSine' }
        });
    }
}

// Register feature
GridFeatureManager.registerFeature(TimelineScrollButtons, false, 'Gantt');

// Usage
const gantt = new Gantt({
    features : {
        timelineScrollButtons : true
    }
});
```

### Custom Editor

```typescript
import { Editor } from '@bryntum/gantt';

class HourEditor extends Editor {
    static configurable = {
        hideTarget           : true,
        appendToTargetParent : true,
        cls                  : 'b-hour-editor',
        inputField           : {
            type       : 'numberfield',
            autoSelect : true,
            triggers   : null,
            min        : 0,
            minWidth   : 0
        }
    };

    async onHourCellClick(taskRecord, target) {
        if (target.matches('.b-day-hours')) {
            await this.completeEdit();
            this._taskRecord = taskRecord;
            this._hourIndex = Array.from(target.parentElement.children).indexOf(target);
            this._target = target;

            await this.startEdit({
                target,
                value : target.innerText
            });
        }
    }

    async onKeyDown({ event }) {
        if (event.key === 'Tab') {
            // Handle tab navigation between hour cells
            event.preventDefault();
            event.stopImmediatePropagation();
            // ... navigation logic
        }
    }

    onComplete({ value }) {
        this._taskRecord.setHoursWorked(this._hourIndex, value);
    }
}

// Gebruik
gantt.hourEditor = new HourEditor({
    owner     : gantt,
    listeners : {
        complete() {
            gantt.refreshRows();
        }
    }
});
```

---

## Labels Feature

### Top & Bottom Labels

```typescript
features : {
    labels : {
        // Label boven de task bar
        top : {
            renderer({ taskRecord }) {
                return {
                    tag      : 'div',
                    dataset  : {
                        btip : `${taskRecord.totalHoursWorked} hours worked`
                    },
                    children : [
                        taskRecord.name,
                        { tag : 'i', class : 'fa fa-clock' },
                        `${taskRecord.totalHoursWorked}h`
                    ]
                };
            }
        },

        // Label onder de task bar
        bottom : {
            renderer({ taskRecord }) {
                const workedHoursByDay = taskRecord.workedHoursByDay || [];
                return {
                    tag      : 'div',
                    class    : 'hoursWorked',
                    children : workedHoursByDay.map(hours => ({
                        class : 'b-day-hours',
                        text  : hours
                    }))
                };
            }
        },

        // Label links/voor de task
        before : {
            field  : 'name',
            editor : {
                type : 'textfield'
            }
        }
    }
}
```

### Labels Toggle

```typescript
tbar : [
    {
        type    : 'slidetoggle',
        ref     : 'showLabels',
        label   : 'Show labels',
        checked : true,
        onChange({ value }) {
            gantt.suspendRefresh();
            gantt.features.labels.disabled = !value;
            gantt.rowHeight = value ? 70 : 40;
            gantt.resumeRefresh(true);
        }
    }
]
```

---

## Tooltips

### Custom Task Tooltip

```typescript
features : {
    taskTooltip : {
        textContent : false,  // Disable default text
        template({ taskRecord }) {
            return `
                <div class="field">
                    <label>Task</label>
                    <span>${StringHelper.encodeHtml(taskRecord.name)}</span>
                </div>
                <div class="field">
                    <label>Module</label>
                    <span>${StringHelper.encodeHtml(taskRecord.parent?.name) || ''}</span>
                </div>
                <div class="field">
                    <label>Critical</label>
                    <span>${taskRecord.critical ? 'Yes' : 'No'}</span>
                </div>
                <div class="field">
                    <label>Start</label>
                    <span>${DateHelper.format(taskRecord.startDate, 'MMM DD')}</span>
                </div>
                <div class="field">
                    <label>Duration</label>
                    <span>${taskRecord.fullDuration}</span>
                </div>
                <div class="field">
                    <label>Assigned</label>
                    <div class="b-avatar-container">
                        ${taskRecord.resources.map(r =>
                            `<img class="b-resource-avatar" src="/images/${r.name.toLowerCase()}.png"/>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
    }
}
```

### Schedule Tooltip

```typescript
features : {
    scheduleTooltip : {
        disabled : false,
        template({ date }) {
            return `Click to add task on ${DateHelper.format(date, 'MMM D')}`;
        }
    }
}
```

---

## View Presets

### Custom View Preset

```typescript
const gantt = new Gantt({
    viewPreset : {
        base           : 'weekAndDayLetter',
        columnLinesFor : 1,  // Column lines voor header level 1
        headers        : [
            {
                unit       : 'week',
                align      : 'start',
                dateFormat : '{W}W MMM YYYY'  // Week number
            },
            {
                unit       : 'day',
                dateFormat : 'DD'
            },
            {
                unit       : 'day',
                dateFormat : 'ddd'  // Day name
            }
        ]
    },

    tickSize   : 40,
    rowHeight  : 50,
    barMargin  : 10
});
```

### View Preset met Time

```typescript
viewPreset : {
    base      : 'hourAndDay',
    tickWidth : 30,
    headers   : [
        {
            unit       : 'day',
            dateFormat : 'ddd DD MMM'
        },
        {
            unit       : 'hour',
            dateFormat : 'HH'
        }
    ]
}
```

---

## Styling & CSS Variables

### CSS Variables

```css
/* Task styling */
.b-gantt {
    --task-border-radius: 5px;
    --task-color: #2196f3;
    --milestone-color: #ff9800;
}

.b-gantt-task {
    border-radius: var(--task-border-radius);
}

/* Row styling */
.b-grid-row {
    --row-height: 50px;
}

/* Header styling */
.b-sch-header-row {
    --header-font-size: 12px;
}
```

### Dynamic CSS Variables

```typescript
const gantt = new Gantt({
    strips : {
        right : {
            type   : 'panel',
            dock   : 'right',
            width  : '22em',
            cls    : 'b-sidebar',
            items  : {
                borderRadiusSlider : {
                    type      : 'slider',
                    text      : 'Task border radius',
                    min       : 0,
                    max       : 15,
                    value     : 5,
                    showValue : 'thumb',
                    onInput({ value }) {
                        gantt.element.style.setProperty('--task-border-radius', `${value}px`);
                    }
                }
            }
        }
    }
});
```

### Hide Weekends via CSS

```typescript
onHideWeekendsChange({ value }) {
    const { timeAxis } = this;
    const date = this.visibleDateRange.startDate;

    this.element.classList.toggle('b-hide-weekends', value);

    this.runWithTransition(() => {
        if (value) {
            timeAxis.filterBy(tick =>
                timeAxis.unit !== 'day' ||
                (tick.startDate.getDay() !== 6 && tick.startDate.getDay() !== 0)
            );
        }
        else {
            timeAxis.clearFilters();
        }
    });

    // Maintain visible date
    this.visibleDate = { date, block : 'start' };
}
```

---

## Best Practices

### 1. Performance-Aware Rendering

```typescript
taskRenderer({ taskRecord, renderData }) {
    // Vermijd zware berekeningen in renderer
    // Gebruik gecachte waarden waar mogelijk

    if (!this._avatarCache) {
        this._avatarCache = new Map();
    }

    const avatars = taskRecord.resources.map(r => {
        if (!this._avatarCache.has(r.id)) {
            this._avatarCache.set(r.id, {
                tag : 'img',
                src : `/images/${r.name.toLowerCase()}.png`
            });
        }
        return this._avatarCache.get(r.id);
    });

    return { class : 'avatars', children : avatars };
}
```

### 2. Transition Management

```typescript
async onShowAvatarsChange({ checked }) {
    // Scroll naar top voor smooth transition
    await this.scrollable.scrollTo(0, 0, true);

    this.element.classList.toggle('b-show-avatars-in-task', checked);

    // Disable conflicting controls
    this.widgetMap.rowHeightSlider.readOnly = checked;

    // Run layout change met transition
    this.runWithTransition(() => {
        this.widgetMap.rowHeightSlider.value = this.rowHeight = checked ? 80 : 50;
    });
}
```

### 3. Feature Coordination

```typescript
// Combineer meerdere features changes
suspendRefresh();
try {
    features.labels.disabled = !showLabels;
    features.columnLines.disabled = !showLines;
    this.rowHeight = newHeight;
} finally {
    resumeRefresh(true);  // Single refresh
}
```

### 4. Responsive Design

```css
/* Responsive task content */
@media (max-width: 768px) {
    .b-gantt-task .task-name {
        font-size: 11px;
    }

    .b-gantt-task .b-avatar-container {
        display: none;
    }
}

/* Print optimization */
@media print {
    .b-gantt-task {
        background: #333 !important;
        -webkit-print-color-adjust: exact;
    }
}
```

---

## Samenvatting

### Renderer Return Types

| Type | Gebruik |
|------|---------|
| `undefined` | Default rendering |
| `string` | Plain text |
| `DomConfig` | Object met { tag, class, children, ... } |
| `DomConfig[]` | Array van elementen |

### Key DomConfig Properties

```typescript
interface DomConfig {
    tag?      : string;           // HTML tag (default: 'div')
    class?    : string | object;  // CSS classes
    text?     : string;           // Text content (escaped)
    html?     : string;           // Raw HTML (not escaped!)
    children? : DomConfig[];      // Child elements
    dataset?  : object;           // data-* attributes
    style?    : object | string;  // Inline styles
}
```

---

## Gerelateerde Documenten

- [GANTT-DEEP-DIVE-RESOURCES.md](./GANTT-DEEP-DIVE-RESOURCES.md) - Resource rendering
- [GANTT-DEEP-DIVE-WBS.md](./GANTT-DEEP-DIVE-WBS.md) - WBS & Rollups
- [INTEGRATION-FRAMEWORKS.md](./INTEGRATION-FRAMEWORKS.md) - Framework integration
- [INTEGRATION-EXPORT.md](./INTEGRATION-EXPORT.md) - Export styling

---

*Bryntum Gantt 7.1.0 - Customization Deep Dive*
