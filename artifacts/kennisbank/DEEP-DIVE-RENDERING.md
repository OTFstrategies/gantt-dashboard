# Deep Dive: Rendering in Bryntum Gantt

## Level 2 Technical Analysis

This document provides an in-depth exploration of how rendering works in Bryntum Gantt 7.1.0, covering task bar rendering, column renderers, the DomConfig pattern, CSS class management, styling, and refresh patterns.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Task Bar Rendering](#2-task-bar-rendering)
3. [Column Renderers and Cell Rendering](#3-column-renderers-and-cell-rendering)
4. [DomConfig Pattern](#4-domconfig-pattern)
5. [Template Strings vs Renderer Functions](#5-template-strings-vs-renderer-functions)
6. [CSS Class Management](#6-css-class-management)
7. [Event/Task Bar Styling](#7-eventtask-bar-styling)
8. [Refresh Patterns](#8-refresh-patterns)
9. [Render Events](#9-render-events)
10. [Practical Patterns](#10-practical-patterns)

---

## 1. Architecture Overview

Bryntum Gantt uses a virtual rendering architecture where only visible rows and task bars are rendered in the DOM. This provides excellent performance for large datasets. The rendering system is built around several key concepts:

- **Declarative DOM via DomConfig**: Define DOM structure as JavaScript objects
- **Renderer Functions**: Transform data into visual representation
- **DomClassList**: Efficient CSS class management
- **Virtual Scrolling**: Only render visible elements
- **Render/Release Lifecycle**: Events for custom rendering integration

### Rendering Flow

```
TaskStore Data
      |
      v
Row Rendering (Grid)
      |
      v
Task Bar Rendering (Timeline)
      |
      v
DomConfig Processing
      |
      v
DOM Synchronization
      |
      v
Render Events (renderTask)
```

---

## 2. Task Bar Rendering

### The taskRenderer Config

The primary way to customize task bar rendering is through the `taskRenderer` configuration on the Gantt:

```typescript
// Type Definition
taskRenderer?: (
  detail: {
    taskRecord: TaskModel;
    renderData: {
      cls: DomClassList | string;
      style: string | Record<string, string>;
      wrapperCls: DomClassList | string;
      iconCls: DomClassList | string;
    };
  },
  indicators: TimeSpan[] | TimeSpanConfig[]
) => string | DomConfig | DomConfig[];
```

### Basic Task Renderer Example

```typescript
const gantt = new Gantt({
  taskRenderer({ taskRecord, renderData }) {
    // Modify CSS classes on the task bar
    renderData.cls['my-custom-task'] = true;
    renderData.cls['high-priority'] = taskRecord.priority === 'high';

    // Add icon to task
    renderData.iconCls['b-fa-star'] = taskRecord.isImportant;

    // Return content to display inside task bar
    return taskRecord.name;
  }
});
```

### Advanced Task Renderer with DomConfig

```typescript
const gantt = new Gantt({
  taskRenderer({ taskRecord, renderData }) {
    // Add custom styling
    renderData.style = {
      borderLeft: `4px solid ${taskRecord.priorityColor}`
    };

    // Return complex DOM structure
    return {
      tag: 'div',
      class: 'task-content',
      children: [
        {
          tag: 'span',
          class: 'task-icon',
          html: '<i class="b-fa b-fa-tasks"></i>'
        },
        {
          tag: 'span',
          class: 'task-name',
          text: taskRecord.name  // XSS-safe text
        },
        {
          tag: 'span',
          class: 'task-progress',
          text: `${taskRecord.percentDone}%`
        }
      ]
    };
  }
});
```

### RenderData Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `cls` | DomClassList | CSS classes for the task bar element |
| `wrapperCls` | DomClassList | CSS classes for the wrapper element |
| `iconCls` | DomClassList | CSS classes for the task icon |
| `style` | string \| object | Inline styles for the task bar |

### Adding Indicators

The `taskRenderer` receives an `indicators` array that can be populated with TimeSpan records:

```typescript
const gantt = new Gantt({
  taskRenderer({ taskRecord }, indicators) {
    // Add milestone indicators
    if (taskRecord.milestones) {
      taskRecord.milestones.forEach(milestone => {
        indicators.push({
          startDate: milestone.date,
          name: milestone.name,
          cls: 'milestone-indicator'
        });
      });
    }

    return taskRecord.name;
  }
});
```

---

## 3. Column Renderers and Cell Rendering

### Column Renderer Signature

```typescript
renderer?: (renderData: {
  cellElement: HTMLElement;
  value: any;
  record: Model;
  column: Column;
  grid: Grid;
  row: Row;
  size: {
    height: number;
    configuredHeight: number;
  };
  isExport: boolean;
  isMeasuring: boolean;
}) => string | DomConfig | DomConfig[] | HTMLElement | void;
```

### Basic Column Renderer

```typescript
const gantt = new Gantt({
  columns: [
    {
      field: 'name',
      text: 'Task Name',
      renderer({ value, record }) {
        // Simple text modification
        return `<strong>${value}</strong>`;
      }
    }
  ]
});
```

### Column Renderer with DomConfig

```typescript
const gantt = new Gantt({
  columns: [
    {
      field: 'status',
      text: 'Status',
      renderer({ value, record, cellElement }) {
        // Modify cell element directly
        cellElement.classList.add(`status-${value.toLowerCase()}`);

        // Return DomConfig
        return {
          tag: 'div',
          class: 'status-badge',
          children: [
            {
              tag: 'i',
              class: `b-fa b-fa-${value === 'done' ? 'check' : 'clock'}`
            },
            {
              tag: 'span',
              text: value
            }
          ]
        };
      }
    }
  ]
});
```

### Group Renderer

For grouped data, use `groupRenderer`:

```typescript
groupRenderer?: (renderData: {
  cellElement: HTMLElement;
  groupRowFor: any;
  record: Model;
  groupRecords: Model[];
  column: Column;
  groupColumn: Column;
  count: number;
  grid: Grid;
}) => DomConfig | string | void;
```

```typescript
{
  field: 'department',
  groupRenderer({ groupRowFor, count, groupRecords }) {
    const totalDuration = groupRecords.reduce(
      (sum, r) => sum + r.duration, 0
    );

    return {
      tag: 'div',
      class: 'group-header',
      children: [
        { tag: 'span', text: groupRowFor },
        { tag: 'span', text: ` (${count} tasks, ${totalDuration} days)` }
      ]
    };
  }
}
```

### Summary Renderer

```typescript
summaryRenderer?: (data: { sum: number | any }) => string | DomConfig | void;
```

```typescript
{
  field: 'cost',
  sum: 'sum',
  summaryRenderer({ sum }) {
    return {
      tag: 'div',
      class: 'summary-total',
      text: `Total: $${sum.toLocaleString()}`
    };
  }
}
```

### Tooltip Renderer

```typescript
tooltipRenderer?: (renderData: {
  cellElement: HTMLElement;
  record: Model;
  column: Column;
  cellTooltip: CellTooltip;
  event: MouseEvent;
}) => string | DomConfig | void;
```

```typescript
{
  field: 'name',
  tooltipRenderer({ record }) {
    return {
      tag: 'div',
      class: 'task-tooltip',
      children: [
        { tag: 'h4', text: record.name },
        { tag: 'p', text: `Duration: ${record.duration} days` },
        { tag: 'p', text: `Progress: ${record.percentDone}%` }
      ]
    };
  }
}
```

---

## 4. DomConfig Pattern

### Type Definition

```typescript
type DomConfig = Record<string, any> & {
  tag?: string;                    // HTML tag name, e.g., 'div', 'span'
  parent?: HTMLElement;            // Parent element
  nextSibling?: HTMLElement;       // Sibling positioning
  class?: string | object;         // CSS classes
  className?: string | object;     // Alias for 'class'
  style?: string | object;         // Inline styles
  elementData?: object;            // Data stored on element
  dataset?: object;                // data-* attributes
  children?: DomConfig[] | Record<string, DomConfig> | string[] | HTMLElement[];
  html?: string;                   // innerHTML (use with caution)
  text?: string;                   // XSS-safe text content
  tooltip?: TooltipConfig | string;
  id?: string;
  href?: string;
  ns?: string;                     // Namespace (for SVG)
  src?: string;
};
```

### DomConfig Examples

#### Simple Element

```typescript
const config: DomConfig = {
  tag: 'div',
  class: 'my-container',
  text: 'Hello World'
};
```

#### Nested Structure

```typescript
const config: DomConfig = {
  tag: 'div',
  class: 'card',
  children: [
    {
      tag: 'header',
      class: 'card-header',
      text: 'Title'
    },
    {
      tag: 'div',
      class: 'card-body',
      children: [
        { tag: 'p', text: 'Content here' }
      ]
    }
  ]
};
```

#### With Styles and Dataset

```typescript
const config: DomConfig = {
  tag: 'div',
  class: {
    'task-bar': true,
    'is-milestone': record.isMilestone,
    'is-critical': record.critical
  },
  style: {
    backgroundColor: record.color,
    opacity: record.inactive ? '0.5' : '1'
  },
  dataset: {
    taskId: record.id,
    priority: record.priority
  }
};
```

### Using DomHelper.createElement

```typescript
import { DomHelper } from '@bryntum/gantt';

const element = DomHelper.createElement({
  tag: 'div',
  class: 'custom-element',
  children: [
    { tag: 'span', text: 'Child 1' },
    { tag: 'span', text: 'Child 2' }
  ]
});

// Append to DOM
DomHelper.append(parentElement, element);
```

### Fragment Creation

```typescript
// Create a DocumentFragment
const fragment: DomConfig = {
  tag: '#fragment',
  children: [
    { tag: 'div', text: 'Item 1' },
    { tag: 'div', text: 'Item 2' },
    { tag: 'div', text: 'Item 3' }
  ]
};
```

---

## 5. Template Strings vs Renderer Functions

### When to Use Template Strings

Template strings are simpler for static or semi-static content:

```typescript
// Simple template approach
{
  field: 'name',
  renderer: ({ value }) => `<span class="name">${value}</span>`
}
```

**Advantages:**
- Familiar HTML syntax
- Quick to write
- Good for simple formatting

**Disadvantages:**
- XSS vulnerability with user data
- String concatenation overhead
- Harder to maintain complex structures

### When to Use Renderer Functions with DomConfig

```typescript
// DomConfig approach
{
  field: 'name',
  renderer: ({ value, record }) => ({
    tag: 'span',
    class: 'name',
    text: value  // XSS-safe
  })
}
```

**Advantages:**
- XSS-safe with `text` property
- Better performance for complex structures
- Easier to conditionally include elements
- Type-safe with TypeScript
- Integrates with Bryntum's DOM sync

**Disadvantages:**
- More verbose
- Learning curve

### Hybrid Approach

```typescript
{
  field: 'description',
  renderer({ value, record }) {
    // Use DomConfig for structure, html for trusted content
    return {
      tag: 'div',
      class: 'description-cell',
      children: [
        {
          tag: 'span',
          class: 'label',
          text: 'Description:'  // Safe
        },
        {
          tag: 'span',
          class: 'value',
          // Only use html for trusted/sanitized content
          html: sanitizeHtml(value)
        }
      ]
    };
  }
}
```

---

## 6. CSS Class Management

### DomClassList Class

Bryntum provides `DomClassList` for efficient class management:

```typescript
import { DomClassList } from '@bryntum/gantt';

// Creating a DomClassList
const classList = new DomClassList('base-class another-class');

// Adding classes
classList.add('new-class');

// Removing classes
classList.remove('another-class');

// Setting multiple classes
classList.set('class1', 'class2', 'class3');

// Object syntax for conditional classes
classList.set({
  'active': true,
  'disabled': false,
  'highlighted': someCondition
});

// Clone the list
const cloned = classList.clone();

// Compare lists
classList.isEqual('class1 class2');

// Get string value
const classString = classList.trim();
```

### Using cls in Renderers

```typescript
taskRenderer({ taskRecord, renderData }) {
  // renderData.cls is a DomClassList
  renderData.cls['task-custom'] = true;
  renderData.cls['task-milestone'] = taskRecord.isMilestone;
  renderData.cls['task-critical'] = taskRecord.critical;
  renderData.cls['task-overdue'] = taskRecord.endDate < new Date();

  // Remove a class
  renderData.cls['b-gantt-task'] = false;  // Not recommended

  return taskRecord.name;
}
```

### wrapperCls vs cls vs iconCls

| Property | Target Element | Use Case |
|----------|---------------|----------|
| `cls` | Task bar element | Main task styling |
| `wrapperCls` | Outer wrapper | Layout, positioning |
| `iconCls` | Icon element | Task icons |

```typescript
taskRenderer({ taskRecord, renderData }) {
  // Style the task bar itself
  renderData.cls['priority-high'] = taskRecord.priority === 'high';

  // Style the wrapper (affects layout)
  renderData.wrapperCls['has-dependencies'] = taskRecord.dependencies.length > 0;

  // Set icon classes
  renderData.iconCls['b-fa'] = true;
  renderData.iconCls['b-fa-star'] = taskRecord.starred;
  renderData.iconCls['b-fa-flag'] = taskRecord.flagged;

  return taskRecord.name;
}
```

### DomHelper Class Methods

```typescript
import { DomHelper } from '@bryntum/gantt';

// Add temporary class (removes after duration)
DomHelper.addTemporaryClass(element, 'flash', 1000);

// Update class list from object
DomHelper.updateClassList(element, {
  'active': true,
  'inactive': false
});
```

---

## 7. Event/Task Bar Styling

### EventColor

The `eventColor` property provides predefined color schemes:

```typescript
type EventColor =
  | 'red' | 'pink' | 'magenta' | 'purple' | 'violet'
  | 'deep-purple' | 'indigo' | 'blue' | 'light-blue'
  | 'cyan' | 'teal' | 'green' | 'light-green' | 'lime'
  | 'yellow' | 'orange' | 'amber' | 'deep-orange'
  | 'light-gray' | 'gray' | 'black'
  | string   // Custom CSS color
  | null;    // No color (inherit)
```

### Applying EventColor

#### At Task Level

```typescript
const task = {
  id: 1,
  name: 'Critical Task',
  eventColor: 'red'  // Predefined color
};

// Or custom color
const task2 = {
  id: 2,
  name: 'Custom Task',
  eventColor: '#FF5733'  // CSS color
};
```

#### At Gantt Level (Default)

```typescript
const gantt = new Gantt({
  eventColor: 'blue',  // Default for all tasks
  // ...
});
```

#### At Resource Level

```typescript
const resource = {
  id: 1,
  name: 'John',
  eventColor: 'green'  // All tasks for this resource
};
```

### EventStyle

The `eventStyle` property controls the visual style:

```typescript
type EventStyle =
  | 'tonal'      // Subtle background with darker text
  | 'filled'     // Solid background
  | 'bordered'   // Border with light fill
  | 'traced'     // Thin border, transparent fill
  | 'outlined'   // Thicker outline
  | 'indented'   // 3D indented effect
  | 'line'       // Simple line
  | 'dashed'     // Dashed style
  | 'minimal'    // Minimalist
  | 'rounded'    // Rounded corners
  | 'calendar'   // Calendar-like
  | 'interday'   // Multi-day style
  | 'gantt'      // Classic Gantt style
  | null;
```

### Combining Color and Style

```typescript
const gantt = new Gantt({
  eventColor: 'indigo',
  eventStyle: 'tonal',

  taskRenderer({ taskRecord, renderData }) {
    // Override based on conditions
    if (taskRecord.isCritical) {
      // These will be applied as CSS classes
      renderData.cls['b-sch-color-red'] = true;
      renderData.cls['b-sch-style-filled'] = true;
    }

    return taskRecord.name;
  }
});
```

### Dynamic Styling in TaskRenderer

```typescript
taskRenderer({ taskRecord, renderData }) {
  // Apply inline styles
  renderData.style = {
    // Custom gradient based on progress
    background: `linear-gradient(90deg,
      var(--b-primary) ${taskRecord.percentDone}%,
      var(--b-primary-light) ${taskRecord.percentDone}%
    )`,
    // Custom border
    borderLeft: taskRecord.critical ? '4px solid red' : 'none'
  };

  return taskRecord.name;
}
```

### CSS Variables

Bryntum uses CSS variables for theming:

```css
.b-gantt {
  /* Primary color */
  --b-primary: #4a90d9;
  --b-primary-light: #6ba8e5;
  --b-primary-dark: #3a7bc8;

  /* Task colors */
  --b-sch-event-color: var(--b-primary);
  --b-sch-event-text-color: white;

  /* Override for specific tasks */
  .my-custom-task {
    --b-sch-event-color: #FF5733;
  }
}
```

---

## 8. Refresh Patterns

### Row-Level Refresh

```typescript
// Refresh specific rows
gantt.refreshRows(records?: Model[]): void;

// Example: Refresh changed tasks
const changedTasks = [task1, task2, task3];
gantt.refreshRows(changedTasks);
```

### Full Refresh

```typescript
// General refresh method
gantt.refresh(): void;

// Repaint events for a specific resource
gantt.repaintEventsForResource(resourceRecord: ResourceModel): void;
```

### When Refresh Happens Automatically

Bryntum automatically refreshes when:

1. **Store Changes**: Adding, removing, updating records
2. **Scroll**: Virtual rendering updates visible rows
3. **Resize**: Window/container resize
4. **Filter/Sort**: Data reorganization
5. **Zoom**: Timeline scale changes

### Manual Refresh Triggers

```typescript
// After batch updates
gantt.taskStore.beginBatch();
// ... make multiple changes
gantt.taskStore.endBatch();  // Triggers single refresh

// Force layout recalculation
gantt.rowManager.refresh();

// Refresh specific task element
const taskElement = gantt.getElementFromTaskRecord(task);
if (taskElement) {
  // Element exists, can manipulate directly
}
```

### Suspending and Resuming Refresh

```typescript
// Suspend rendering during bulk operations
gantt.suspendRefresh();

// Make many changes
tasks.forEach(task => {
  task.percentDone = 100;
});

// Resume and refresh once
gantt.resumeRefresh(true);  // true = trigger refresh
```

### isRepaint Flag

In render events, check if it's a repaint:

```typescript
gantt.on('renderTask', ({ taskRecord, element, isRepaint }) => {
  if (!isRepaint) {
    // First time render - set up one-time things
    initializeTaskElement(element);
  }
  // Always update dynamic content
  updateTaskContent(element, taskRecord);
});
```

---

## 9. Render Events

### renderTask Event

Fired when a task is rendered and its element is in the DOM:

```typescript
gantt.on('renderTask', ({
  source,      // Gantt instance
  renderData,  // Render configuration object
  taskRecord,  // The task being rendered
  element      // The DOM element
}) => {
  // Add custom DOM elements
  const badge = document.createElement('div');
  badge.className = 'priority-badge';
  badge.textContent = taskRecord.priority;
  element.appendChild(badge);

  // Store reference for cleanup
  element._customBadge = badge;
});
```

### releaseTask Event

Fired when a task element is being recycled or removed:

```typescript
gantt.on('releaseTask', ({
  source,      // Gantt instance
  renderData,  // Render configuration
  taskRecord,  // The task being released
  element      // The DOM element
}) => {
  // Clean up custom elements/listeners
  if (element._customBadge) {
    element._customBadge.remove();
    delete element._customBadge;
  }

  // Remove event listeners
  if (element._clickHandler) {
    element.removeEventListener('click', element._clickHandler);
    delete element._clickHandler;
  }
});
```

### renderRow Event

```typescript
gantt.on('renderRow', ({
  source,       // Grid instance
  row,          // Row object
  record,       // Record for the row
  recordIndex   // Zero-based index
}) => {
  // Apply alternating row styles
  row.cls.add(recordIndex % 2 === 0 ? 'even-row' : 'odd-row');
});
```

### renderRows Event

```typescript
gantt.on('renderRows', ({ source }) => {
  // All rows have been rendered
  console.log('Rendering complete');

  // Good place for post-render operations
  updateSummaryPanel();
});
```

### Render Event Order

1. `beforeRenderRows` - Before row rendering starts
2. `renderRow` - For each row (multiple times)
3. `renderTask` - For each visible task (multiple times)
4. `renderRows` - After all rows rendered

---

## 10. Practical Patterns

### Pattern 1: Progress Bar Inside Task

```typescript
const gantt = new Gantt({
  taskRenderer({ taskRecord, renderData }) {
    const percent = taskRecord.percentDone || 0;

    return {
      tag: 'div',
      class: 'task-with-progress',
      children: [
        {
          tag: 'div',
          class: 'progress-bar',
          style: { width: `${percent}%` }
        },
        {
          tag: 'span',
          class: 'task-label',
          text: `${taskRecord.name} (${percent}%)`
        }
      ]
    };
  }
});
```

### Pattern 2: Resource Avatars in Column

```typescript
{
  type: 'resourceassignment',
  text: 'Assigned',
  itemTpl(assignment, index) {
    const resource = assignment.resource;
    return {
      tag: 'div',
      class: 'resource-chip',
      children: [
        {
          tag: 'img',
          class: 'avatar',
          src: resource.imageUrl || 'default-avatar.png'
        },
        {
          tag: 'span',
          text: resource.name
        }
      ]
    };
  }
}
```

### Pattern 3: Conditional Task Styling

```typescript
taskRenderer({ taskRecord, renderData }) {
  // Multiple conditional classes
  Object.assign(renderData.cls, {
    'task-milestone': taskRecord.isMilestone,
    'task-summary': taskRecord.isParent,
    'task-leaf': taskRecord.isLeaf,
    'task-critical': taskRecord.critical,
    'task-overdue': new Date() > taskRecord.endDate && taskRecord.percentDone < 100,
    'task-complete': taskRecord.percentDone === 100
  });

  // Conditional icon
  if (taskRecord.hasWarning) {
    renderData.iconCls['b-fa'] = true;
    renderData.iconCls['b-fa-exclamation-triangle'] = true;
  }

  return taskRecord.name;
}
```

### Pattern 4: Custom Baseline Renderer

```typescript
const gantt = new Gantt({
  features: {
    baselines: {
      renderer({ taskRecord, baselineRecord, renderData }) {
        const variance = taskRecord.endDate - baselineRecord.endDate;
        const days = Math.round(variance / (1000 * 60 * 60 * 24));

        return {
          tag: 'div',
          class: {
            'baseline-content': true,
            'on-track': days <= 0,
            'delayed': days > 0
          },
          children: [
            {
              tag: 'span',
              class: 'baseline-label',
              text: days > 0 ? `+${days}d` : days < 0 ? `${days}d` : 'On track'
            }
          ]
        };
      }
    }
  }
});
```

### Pattern 5: Dependency Renderer

```typescript
const gantt = new Gantt({
  features: {
    dependencies: {
      renderer({ domConfig, dependencyRecord, fromSide, toSide }) {
        // Modify the dependency line appearance
        domConfig.class['critical-path'] = dependencyRecord.critical;
        domConfig.class['lag-dependency'] = dependencyRecord.lag > 0;

        // Add custom data attributes
        domConfig.dataset = {
          depId: dependencyRecord.id,
          type: dependencyRecord.type
        };
      }
    }
  }
});
```

### Pattern 6: Integrated Render + Release Pattern

```typescript
// Complete lifecycle management
const gantt = new Gantt({
  taskRenderer({ taskRecord, renderData }) {
    // Store data for later access
    renderData._customData = {
      tooltipInstance: null,
      chartInstance: null
    };

    return {
      tag: 'div',
      class: 'complex-task',
      children: [
        { tag: 'div', class: 'task-chart-container' },
        { tag: 'span', text: taskRecord.name }
      ]
    };
  },

  listeners: {
    renderTask({ element, taskRecord, renderData }) {
      // Initialize chart after DOM is ready
      const container = element.querySelector('.task-chart-container');
      if (container && !renderData._customData.chartInstance) {
        renderData._customData.chartInstance = new MiniChart(container, {
          data: taskRecord.chartData
        });
      }
    },

    releaseTask({ element, renderData }) {
      // Cleanup
      if (renderData._customData?.chartInstance) {
        renderData._customData.chartInstance.destroy();
        renderData._customData.chartInstance = null;
      }
    }
  }
});
```

---

## 11. Row Height Management

Bryntum Gantt uses virtual scrolling with configurable row heights.

### Basic Row Height Configuration

```typescript
const gantt = new Gantt({
    // Fixed row height for all rows
    rowHeight: 50,

    // Minimum bar margin from row edges
    barMargin: 5
});
```

### Per-Record Row Height

Individual records can override the default row height:

```typescript
// In task data
const tasks = [
    { id: 1, name: 'Normal Task', duration: 5 },
    { id: 2, name: 'Tall Task', duration: 3, rowHeight: 80 },  // Custom height
    { id: 3, name: 'Short Task', duration: 2, rowHeight: 30 }
];

// Or set programmatically
task.rowHeight = 60;
```

### Auto Height for Columns

Columns can automatically adjust row height based on content:

```typescript
const gantt = new Gantt({
    columns: [
        {
            field: 'notes',
            text: 'Notes',
            // Auto-adjust row height for content
            autoHeight: true,
            // Limit the auto height calculation
            autoHeightMax: 200
        }
    ]
});
```

### Dynamic Row Height Pattern

```typescript
const gantt = new Gantt({
    // Calculate height based on task data
    getRowHeight: (record: TaskModel): number => {
        // Base height
        let height = 40;

        // Add height for subtasks shown inline
        if (record.showSubtasksInline) {
            height += record.children.length * 20;
        }

        // Add height for baselines
        if (record.baselines?.length > 0) {
            height += record.baselines.length * 15;
        }

        return height;
    }
});
```

### Row Height with Milestones

```typescript
// Milestones typically need less height
const gantt = new Gantt({
    rowHeight: 45,

    taskRenderer({ taskRecord, renderData }) {
        if (taskRecord.milestone) {
            // Milestones use diamond shape, need less vertical space
            renderData.wrapperCls['b-milestone-row'] = true;
        }
        return taskRecord.name;
    }
});
```

---

## 12. Tooltip Rendering

### TaskTooltip Feature

```typescript
const gantt = new Gantt({
    features: {
        taskTooltip: {
            // Template function for tooltip content
            template: ({ taskRecord }) => `
                <div class="task-tooltip">
                    <h3>${taskRecord.name}</h3>
                    <dl>
                        <dt>Start:</dt>
                        <dd>${DateHelper.format(taskRecord.startDate, 'MMM D, YYYY')}</dd>
                        <dt>End:</dt>
                        <dd>${DateHelper.format(taskRecord.endDate, 'MMM D, YYYY')}</dd>
                        <dt>Progress:</dt>
                        <dd>${taskRecord.percentDone}%</dd>
                    </dl>
                </div>
            `,

            // Delay before showing
            showDelay: 300,

            // Delay before hiding
            hideDelay: 100,

            // Position relative to task
            align: 't-b'  // Top of tooltip to bottom of task
        }
    }
});
```

### CellTooltip for Grid Cells

```typescript
const gantt = new Gantt({
    features: {
        cellTooltip: {
            // Show tooltip for cells with truncated content
            showTooltipForTextSelection: true,

            // Custom tooltip per column
            getHtml: ({ record, column }) => {
                if (column.field === 'resources') {
                    const resources = record.resources;
                    return resources.map(r => r.name).join('<br>');
                }
                return null;  // Use default behavior
            }
        }
    }
});
```

### Custom Tooltip Widget

```typescript
import { Tooltip, TaskModel } from '@bryntum/gantt';

// Create reusable tooltip
const customTooltip = new Tooltip({
    forSelector: '.b-gantt-task',
    cls: 'custom-task-tooltip',

    // Async content loading
    getHtml: async ({ activeTarget }) => {
        const taskId = activeTarget.dataset.taskId;
        const details = await fetchTaskDetails(taskId);

        return `
            <div class="tooltip-content">
                <img src="${details.thumbnail}" />
                <div class="tooltip-info">
                    <h4>${details.name}</h4>
                    <p>${details.description}</p>
                </div>
            </div>
        `;
    },

    // Show/hide animations
    showAnimation: { opacity: [0, 1], duration: 200 },
    hideAnimation: { opacity: [1, 0], duration: 150 }
});
```

### Tooltip Configuration Reference

```typescript
interface TooltipConfig {
    // Timing
    showDelay?: number;          // ms before showing
    hideDelay?: number;          // ms before hiding
    dismissDelay?: number;       // ms before auto-dismiss

    // Positioning
    align?: string;              // Alignment spec (e.g., 't-b', 'l-r')
    anchor?: boolean;            // Show connector arrow
    anchorToTarget?: boolean;    // Anchor to target element

    // Content
    html?: string;               // Static HTML
    template?: Function;         // Dynamic template
    getHtml?: Function;          // Async content

    // Behavior
    allowOver?: boolean;         // Allow mouse over tooltip
    trackMouse?: boolean;        // Follow mouse movement
    forSelector?: string;        // CSS selector for targets

    // Styling
    cls?: string;                // Additional CSS classes
    maxWidth?: number | string;  // Maximum width
}
```

### Dependency Tooltip

```typescript
const gantt = new Gantt({
    features: {
        dependencies: {
            // Tooltip for dependency lines
            showTooltip: true,
            tooltip: {
                template: ({ dependency }) => `
                    <b>Dependency</b><br>
                    From: ${dependency.fromTask.name}<br>
                    To: ${dependency.toTask.name}<br>
                    Type: ${getDependencyTypeName(dependency.type)}<br>
                    Lag: ${dependency.lag} ${dependency.lagUnit}
                `
            }
        }
    }
});

function getDependencyTypeName(type: number): string {
    const types = ['Start-to-Start', 'Start-to-Finish', 'Finish-to-Start', 'Finish-to-Finish'];
    return types[type] || 'Unknown';
}
```

---

## 13. Cross-References

### Related Deep-Dive Documents

| Document | Relationship |
|----------|--------------|
| [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) | Widget rendering, Tooltip widget |
| [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) | Date calculations for task positioning |
| [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) | Render lifecycle events |
| [DEEP-DIVE-DEPENDENCIES](./DEEP-DIVE-DEPENDENCIES.md) | Dependency line rendering |
| [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) | JSX rendering via React Portals |
| [DEEP-DIVE-DEMO-PATTERNS](./DEEP-DIVE-DEMO-PATTERNS.md) | taskRenderer and label examples |

### Key API References (Level 1)

- `GanttConfig.taskRenderer` - Task bar customization
- `ColumnConfig.renderer` - Cell customization
- `TooltipConfig` - Tooltip options
- `DomConfig` - DOM structure definition

---

## Summary

Bryntum Gantt's rendering system is built around:

1. **DomConfig Pattern**: Declarative DOM definition with type safety
2. **taskRenderer**: Primary customization point for task bars
3. **Column Renderers**: Cell-level customization
4. **DomClassList**: Efficient, object-based CSS class management
5. **EventColor/EventStyle**: Built-in styling system
6. **Render Events**: Lifecycle hooks for advanced customization
7. **Refresh Methods**: Control over when and what to re-render

The key to effective rendering is understanding when to use each approach:
- Use **DomConfig** for structure and safe content
- Use **renderData.cls** for conditional styling
- Use **render events** for DOM manipulation after render
- Use **release events** for cleanup

This architecture provides both flexibility and performance for complex Gantt chart applications.
