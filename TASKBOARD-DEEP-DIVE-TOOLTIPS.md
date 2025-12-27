# TaskBoard Deep Dive: Tooltips

> **Complete guide** voor TaskTooltip feature, custom templates, async tooltips, en tooltip configuratie in Bryntum TaskBoard.

---

## Overzicht

TaskBoard biedt uitgebreide tooltip ondersteuning via de TaskTooltip feature:

| Aspect | Beschrijving |
|--------|--------------|
| **TaskTooltip Feature** | Automatische tooltips bij hover over tasks |
| **Custom Templates** | HTML/DomConfig rendering |
| **Async Content** | Lazy loading van tooltip data |
| **Styling** | CSS classes voor custom styling |

---

## 1. TaskTooltip Feature Basics

### 1.1 Enable TaskTooltip

TaskTooltip is standaard uitgeschakeld. Enable via features:

```javascript
const taskBoard = new TaskBoard({
    features: {
        // Simple enable
        taskTooltip: true
    }
});
```

### 1.2 Default Tooltip Content

Standaard toont de tooltip:
- Task naam
- Task beschrijving
- Assigned resources

---

## 2. Custom Tooltip Templates

### 2.1 String Template

```javascript
features: {
    taskTooltip: {
        template({ taskRecord, columnRecord, swimlaneRecord }) {
            return `
                <h1>${taskRecord.name}</h1>
                <p>${taskRecord.description || 'No description'}</p>
                <div class="status">Status: ${columnRecord.text}</div>
            `;
        }
    }
}
```

### 2.2 XSS-Safe Templates

Gebruik `StringHelper.xss` voor veilige templates:

```javascript
import { StringHelper, DateHelper } from '@bryntum/taskboard';

features: {
    taskTooltip: {
        template({ taskRecord }) {
            // XSS-safe encoding
            return StringHelper.xss`
                <h1>${taskRecord.name}</h1>
                <label>Deadline</label>
                <div>${DateHelper.format(taskRecord.deadline, 'LL')}</div>
                <label>Priority</label>
                <div class="${taskRecord.prio}">
                    ${StringHelper.capitalize(taskRecord.prio)}
                </div>
            `;
        }
    }
}
```

### 2.3 Mixed Content (Safe + HTML)

```javascript
features: {
    taskTooltip: {
        template({ taskRecord }) {
            // Safe encoded content
            const safeContent = StringHelper.xss`
                <h1>${taskRecord.name}</h1>
                <label>Priority</label>
                <div>${taskRecord.prio}</div>
            `;

            // Unsafe but controlled HTML
            const icon = taskRecord.readOnly
                ? '<i class="fa fa-lock"></i> Read only'
                : '';

            return safeContent + icon;
        }
    }
}
```

### 2.4 DomConfig Template

Return een DomConfig object voor complexe templates:

```javascript
features: {
    taskTooltip: {
        template({ taskRecord, columnRecord }) {
            return {
                tag: 'div',
                class: 'custom-tooltip-content',
                children: [
                    {
                        tag: 'h3',
                        text: taskRecord.name
                    },
                    {
                        tag: 'div',
                        class: 'task-info',
                        children: [
                            {
                                tag: 'span',
                                class: 'label',
                                text: 'Column:'
                            },
                            {
                                tag: 'span',
                                class: 'value',
                                text: columnRecord.text
                            }
                        ]
                    },
                    {
                        tag: 'div',
                        class: 'resources',
                        children: taskRecord.resources.map(r => ({
                            tag: 'img',
                            src: `images/${r.image}`,
                            alt: r.name,
                            title: r.name
                        }))
                    }
                ]
            };
        }
    }
}
```

---

## 3. Tooltip Styling

### 3.1 Custom CSS Class

```javascript
features: {
    taskTooltip: {
        cls: 'custom-tooltip',

        template({ taskRecord }) {
            return StringHelper.xss`
                <h1>${taskRecord.name}</h1>
                <div class="${taskRecord.prio}">${taskRecord.prio}</div>
            `;
        }
    }
}
```

### 3.2 CSS Styling

```css
/* Custom tooltip styling */
.custom-tooltip {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    padding: 16px;
    color: white;
    min-width: 200px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.custom-tooltip h1 {
    margin: 0 0 8px 0;
    font-size: 1.2em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    padding-bottom: 8px;
}

.custom-tooltip label {
    display: block;
    font-size: 0.8em;
    opacity: 0.8;
    margin-top: 8px;
}

.custom-tooltip .high {
    color: #ff6b6b;
    font-weight: bold;
}

.custom-tooltip .medium {
    color: #feca57;
}

.custom-tooltip .low {
    color: #1dd1a1;
}
```

---

## 4. Tooltip Widget Configuration

### 4.1 Tooltip Config Overrides

```javascript
features: {
    taskTooltip: {
        // Custom template
        template({ taskRecord }) {
            return `<h1>${taskRecord.name}</h1>`;
        },

        // Tooltip widget config
        tooltip: {
            // Delay before showing (ms)
            hoverDelay: 500,

            // Delay before hiding (ms)
            hideDelay: 100,

            // Positioning
            align: 'l-r',  // Left of tooltip to Right of target
            anchorToTarget: true,

            // Animation
            showAnimation: {
                opacity: { from: 0, to: 1 }
            },
            hideAnimation: {
                opacity: { from: 1, to: 0 }
            },

            // Size constraints
            maxWidth: 400,
            maxHeight: 300,

            // Scrollable content
            scrollable: true
        }
    }
}
```

### 4.2 Alignment Options

```javascript
tooltip: {
    // Common alignments
    align: 't-b',    // Top of tooltip to Bottom of target
    align: 'b-t',    // Bottom to Top
    align: 'l-r',    // Left to Right
    align: 'r-l',    // Right to Left

    // With offset
    align: {
        align: 't-b',
        offset: [0, 10]  // [x, y] offset in pixels
    }
}
```

---

## 5. Async Tooltip Content

### 5.1 Async Template

```javascript
features: {
    taskTooltip: {
        // Async template function
        async template({ taskRecord }) {
            // Fetch additional data
            const details = await fetch(`/api/tasks/${taskRecord.id}/details`)
                .then(r => r.json());

            return StringHelper.xss`
                <h1>${taskRecord.name}</h1>
                <div class="details">
                    <p>Comments: ${details.commentCount}</p>
                    <p>Attachments: ${details.attachmentCount}</p>
                    <p>Last updated: ${details.lastUpdated}</p>
                </div>
            `;
        },

        // Show loading indicator while fetching
        tooltip: {
            loadingMsg: 'Loading task details...'
        }
    }
}
```

### 5.2 Cached Async Data

```javascript
// Cache voor tooltip data
const tooltipCache = new Map();

features: {
    taskTooltip: {
        async template({ taskRecord }) {
            let details = tooltipCache.get(taskRecord.id);

            if (!details) {
                details = await fetch(`/api/tasks/${taskRecord.id}/details`)
                    .then(r => r.json());
                tooltipCache.set(taskRecord.id, details);
            }

            return StringHelper.xss`
                <h1>${taskRecord.name}</h1>
                <div>${details.description}</div>
            `;
        }
    }
}
```

---

## 6. Conditional Tooltips

### 6.1 Disable voor Specifieke Tasks

```javascript
features: {
    taskTooltip: {
        template({ taskRecord }) {
            // Return null/false om tooltip te verbergen
            if (taskRecord.noTooltip) {
                return null;
            }

            return StringHelper.xss`<h1>${taskRecord.name}</h1>`;
        }
    }
}
```

### 6.2 Verschillende Templates per Context

```javascript
features: {
    taskTooltip: {
        template({ taskRecord, columnRecord, swimlaneRecord }) {
            // Different template based on column
            if (columnRecord.id === 'done') {
                return StringHelper.xss`
                    <h1>✅ ${taskRecord.name}</h1>
                    <p>Completed!</p>
                `;
            }

            // Different template based on swimlane
            if (swimlaneRecord?.id === 'high') {
                return StringHelper.xss`
                    <h1>🔥 ${taskRecord.name}</h1>
                    <p class="urgent">High priority task!</p>
                `;
            }

            // Default template
            return StringHelper.xss`<h1>${taskRecord.name}</h1>`;
        }
    }
}
```

---

## 7. Resource Avatars in Tooltip

### 7.1 Show Assigned Resources

```javascript
features: {
    taskTooltip: {
        template({ taskRecord }) {
            const resources = taskRecord.resources || [];
            const avatarHtml = resources.map(r =>
                `<img src="images/${r.image}" alt="${r.name}" title="${r.name}" class="avatar"/>`
            ).join('');

            return StringHelper.xss`
                <h1>${taskRecord.name}</h1>
            ` + `
                <div class="assignees">
                    <label>Assigned to:</label>
                    <div class="avatars">${avatarHtml || 'Unassigned'}</div>
                </div>
            `;
        }
    }
}
```

### 7.2 Avatar Styling

```css
.custom-tooltip .avatars {
    display: flex;
    gap: 4px;
    margin-top: 8px;
}

.custom-tooltip .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

---

## 8. Programmatic Tooltip Control

### 8.1 Show/Hide Programmatically

```javascript
const tooltipFeature = taskBoard.features.taskTooltip;

// Access underlying tooltip widget
const tooltip = tooltipFeature.tooltip;

// Manually show for a task
function showTooltipForTask(task) {
    const element = taskBoard.getTaskElement(task);
    if (element) {
        tooltip.showBy(element);
    }
}

// Hide tooltip
function hideTooltip() {
    tooltip.hide();
}
```

### 8.2 Enable/Disable Feature

```javascript
// Disable tooltips
taskBoard.features.taskTooltip.disabled = true;

// Enable tooltips
taskBoard.features.taskTooltip.disabled = false;
```

---

## 9. Touch Device Handling

### 9.1 Touch Configuration

```javascript
features: {
    taskTooltip: {
        tooltip: {
            // Disable on touch devices
            showOnHover: true,

            // Or show on long press
            // (custom implementation needed)
        }
    }
}
```

### 9.2 Custom Touch Handler

```javascript
// Show tooltip on long press for touch devices
if ('ontouchstart' in window) {
    let pressTimer;

    taskBoard.on({
        taskMouseDown({ taskRecord, event }) {
            if (event.type === 'touchstart') {
                pressTimer = setTimeout(() => {
                    const element = taskBoard.getTaskElement(taskRecord);
                    taskBoard.features.taskTooltip.tooltip.showBy(element);
                }, 500);
            }
        },

        taskMouseUp() {
            clearTimeout(pressTimer);
        }
    });
}
```

---

## 10. TypeScript Interfaces

```typescript
// TaskTooltip Feature Config
interface TaskTooltipConfig {
    type?: 'taskTooltip' | 'tasktooltip';
    disabled?: boolean | 'inert';

    // Custom template function
    template?: (tipData: {
        taskRecord: TaskModel;
        columnRecord: ColumnModel;
        swimlaneRecord: SwimlaneModel;
    }) => string | DomConfig | Promise<string | DomConfig>;

    // Tooltip widget overrides
    tooltip?: TooltipConfig;

    // CSS class for tooltip
    cls?: string;

    // Listeners
    listeners?: TaskTooltipListeners;
}

// TaskTooltip Listeners
interface TaskTooltipListeners {
    thisObj?: object;
    beforeDestroy?: (event: { source: Base }) => void;
    destroy?: (event: { source: Base }) => void;
    disable?: (event: { source: InstancePlugin }) => void;
    enable?: (event: { source: InstancePlugin }) => void;
}

// Tooltip Widget Config (subset)
interface TooltipConfig {
    // Timing
    hoverDelay?: number;
    hideDelay?: number | boolean;

    // Positioning
    align?: string | AlignConfig;
    anchorToTarget?: boolean;
    constrainTo?: HTMLElement | Window;

    // Size
    maxWidth?: number | string;
    maxHeight?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;

    // Behavior
    showOnHover?: boolean;
    dismissDelay?: number;
    trackMouse?: boolean;

    // Content
    loadingMsg?: string;
    scrollable?: boolean | ScrollableConfig;

    // Animation
    showAnimation?: object | boolean;
    hideAnimation?: object | boolean;

    // Styling
    cls?: string;
}

// DomConfig for templates
interface DomConfig {
    tag?: string;
    class?: string | object;
    style?: string | object;
    text?: string;
    html?: string;
    children?: DomConfig[];
    [attribute: string]: any;
}

// TaskTooltip Feature
interface TaskTooltip extends TaskBoardFeature {
    readonly isTaskTooltip: boolean;
    tooltip: Tooltip;
    disabled: boolean;
}
```

---

## 11. Best Practices

### 11.1 Performance

```javascript
features: {
    taskTooltip: {
        tooltip: {
            // Delay om onnodige renders te voorkomen
            hoverDelay: 300,

            // Snel verbergen bij mouseout
            hideDelay: 0
        },

        // Lightweight template
        template({ taskRecord }) {
            // Vermijd zware berekeningen
            return StringHelper.xss`<h1>${taskRecord.name}</h1>`;
        }
    }
}
```

### 11.2 Security

```javascript
// ALTIJD XSS-safe templates gebruiken
template({ taskRecord }) {
    // GOED: Encoded
    return StringHelper.xss`<h1>${taskRecord.name}</h1>`;

    // SLECHT: Unencoded user content
    // return `<h1>${taskRecord.name}</h1>`;
}
```

### 11.3 Accessibility

```javascript
features: {
    taskTooltip: {
        tooltip: {
            // Accessible hiding delay
            hideDelay: 200,

            // Keyboard accessible
            focusable: true
        },

        template({ taskRecord }) {
            return {
                tag: 'div',
                'aria-label': `Task: ${taskRecord.name}`,
                children: [
                    { tag: 'h1', text: taskRecord.name }
                ]
            };
        }
    }
}
```

---

## 12. Common Patterns

### 12.1 Rich Task Details

```javascript
features: {
    taskTooltip: {
        cls: 'rich-tooltip',

        template({ taskRecord, columnRecord }) {
            const progress = taskRecord.progress || 0;
            const deadline = taskRecord.deadline
                ? DateHelper.format(taskRecord.deadline, 'MMM D, YYYY')
                : 'No deadline';

            return StringHelper.xss`
                <div class="tooltip-header">
                    <h2>${taskRecord.name}</h2>
                    <span class="status-badge ${columnRecord.id}">
                        ${columnRecord.text}
                    </span>
                </div>

                <div class="tooltip-body">
                    <p>${taskRecord.description || 'No description'}</p>

                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                        <span class="progress-label">${progress}%</span>
                    </div>

                    <div class="meta">
                        <span><i class="icon-calendar"></i> ${deadline}</span>
                    </div>
                </div>
            `;
        }
    }
}
```

### 12.2 Mini Preview Card

```javascript
features: {
    taskTooltip: {
        cls: 'preview-tooltip',

        template({ taskRecord }) {
            return {
                tag: 'div',
                class: 'preview-card',
                children: [
                    {
                        tag: 'div',
                        class: 'preview-header',
                        style: `background-color: ${taskRecord.eventColor || '#3498db'}`,
                        children: [
                            { tag: 'span', class: 'task-name', text: taskRecord.name }
                        ]
                    },
                    {
                        tag: 'div',
                        class: 'preview-content',
                        text: taskRecord.description || 'No description'
                    }
                ]
            };
        }
    }
}
```

---

## Samenvatting

| Aspect | Implementation |
|--------|----------------|
| **Enable** | `features: { taskTooltip: true }` |
| **Custom Template** | `template: ({ taskRecord }) => html` |
| **XSS Safety** | `StringHelper.xss\`...\`` |
| **Styling** | `cls: 'custom-tooltip'` |
| **Async Content** | `async template() { ... }` |
| **Timing** | `tooltip: { hoverDelay: 300 }` |

---

*Laatst bijgewerkt: December 2024*
*Bryntum TaskBoard v7.1.0*
