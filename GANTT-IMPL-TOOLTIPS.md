# Gantt Implementation: Tooltips

> **Custom tooltips** voor tasks, drag operations, resize, en resource avatars.

---

## Overzicht

Bryntum Gantt biedt uitgebreide tooltip configuratie voor verschillende interacties.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GANTT                                                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    Task Name     │ Resources              │        Timeline             │
│ ─────────────────┼────────────────────────┼────────────────────────────  │
│                  │                        │                              │
│    Development   │ [👤][👤][👤]  ─────────┼────> ┌─────────────────────┐ │
│                  │    ▲                   │      │ 📋 Task: Development│ │
│                  │    │                   │      │ 📁 Module: Phase 1  │ │
│                  │    │                   │      │ ⚠️ Critical: Yes     │ │
│                  │ ┌──┴───────────────┐   │      │ 📅 Start: Jan 15    │ │
│                  │ │ 👤 John Doe      │   │      │ ⏱️ Duration: 10 days │ │
│                  │ │ 📍 New York      │   │      │ 👥 Assigned to:     │ │
│                  │ │ 📊 100% assigned │   │      │    [👤][👤][👤]     │ │
│                  │ └──────────────────┘   │      └─────────────────────┘ │
│                  │  Avatar tooltip        │       Task tooltip           │
│                  │                        │                              │
├──────────────────┴────────────────────────┴──────────────────────────────┤
│                                                                          │
│  TOOLTIP TYPES:                                                          │
│  📋 Task Tooltip    👤 Avatar Tooltip    ✋ Drag Tooltip    ↔️ Resize    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Task Tooltip

### 1.1 Custom Task Tooltip Template

```javascript
import { Gantt, ProjectModel, DateHelper, StringHelper } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',

    features: {
        taskTooltip: {
            // Disable default text content
            textContent: false,

            // Custom HTML template
            template({ taskRecord }) {
                return `
                    <div class="field">
                        <label>Task</label>
                        <span>${StringHelper.encodeHtml(taskRecord.name)}</span>
                    </div>
                    <div class="field">
                        <label>Module</label>
                        <span>${StringHelper.encodeHtml(taskRecord.parent?.name) || 'N/A'}</span>
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
                        <label>Assigned to</label>
                        <div class="b-avatar-container">
                            ${taskRecord.resources.map(resource => `
                                <img class="b-resource-avatar b-resource-image"
                                    alt="${StringHelper.encodeHtml(resource.name)}"
                                    src="${gantt.resourceImagePath}${resource.image || 'none.png'}"
                                />
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        }
    },

    project: new ProjectModel({
        loadUrl: '/api/project'
    }),

    resourceImagePath: '/images/users/'
});
```

### 1.2 Localized Task Tooltip

```javascript
features: {
    taskTooltip: {
        textContent: false,
        template({ taskRecord }) {
            const me = this;  // Access to feature for localization

            return `
                <div class="field">
                    <label>${me.L('Task')}</label>
                    <span>${StringHelper.encodeHtml(taskRecord.name)}</span>
                </div>
                <div class="field">
                    <label>${me.L('Critical')}</label>
                    <span>${taskRecord.critical ? me.L('Yes') : me.L('No')}</span>
                </div>
            `;
        }
    }
}
```

---

## 2. Drag Tooltip

### 2.1 Custom Drag Drop Tooltip

```javascript
features: {
    taskDrag: {
        // Custom tooltip during drag
        tooltipTemplate({ taskRecord, startDate }) {
            return StringHelper.xss`
                <h4 style="margin:0 0 1em 0">Moving Task</h4>
                ${taskRecord.name}: ${DateHelper.format(startDate, 'MMM D')}
            `;
        }
    }
}
```

### 2.2 Detailed Drag Tooltip

```javascript
features: {
    taskDrag: {
        tooltipTemplate({ taskRecord, startDate, endDate, duration }) {
            return `
                <div class="drag-tooltip">
                    <div class="task-name">${StringHelper.encodeHtml(taskRecord.name)}</div>
                    <div class="dates">
                        <span>Start: ${DateHelper.format(startDate, 'MMM D, YYYY')}</span>
                        <span>End: ${DateHelper.format(endDate, 'MMM D, YYYY')}</span>
                    </div>
                    <div class="duration">Duration: ${duration} days</div>
                </div>
            `;
        }
    }
}
```

---

## 3. Resize Tooltip

### 3.1 Minimal Resize Tooltip

```javascript
features: {
    taskResize: {
        // Simple end date tooltip
        tooltipTemplate({ endDate }) {
            return DateHelper.format(endDate, 'MMM D');
        }
    }
}
```

### 3.2 Detailed Resize Tooltip

```javascript
features: {
    taskResize: {
        tooltipTemplate({ taskRecord, startDate, endDate, duration }) {
            const originalDuration = taskRecord.duration;
            const change = duration - originalDuration;
            const changeText = change >= 0 ? `+${change}` : change;

            return `
                <div class="resize-tooltip">
                    <div class="task-name">${StringHelper.encodeHtml(taskRecord.name)}</div>
                    <div class="new-end">New end: ${DateHelper.format(endDate, 'MMM D')}</div>
                    <div class="duration">
                        Duration: ${duration} days
                        <span class="change ${change >= 0 ? 'increase' : 'decrease'}">
                            (${changeText})
                        </span>
                    </div>
                </div>
            `;
        }
    }
}
```

---

## 4. Resource Avatar Tooltip

### 4.1 Custom Avatar Tooltip

```javascript
columns: [
    {
        type: 'resourceassignment',
        width: 220,
        showAvatars: true,

        avatarTooltipTemplate({
            resourceRecord,
            assignmentRecord,
            overflowCount
        }) {
            const image = resourceRecord.image || 'none.png';

            const baseContent = StringHelper.xss`
                <strong>${resourceRecord.name}</strong>
                <img class="b-resource-avatar b-resource-image"
                     src="${gantt.resourceImagePath}${image}"/>
                <div class="data">
                    <div><i class="fa fa-fw fa-map-marker"></i>${resourceRecord.city}</div>
                    <div><i class="fa fa-fw fa-bars-progress"></i>${assignmentRecord.units} %</div>
                </div>
            `;

            // Show overflow count if more resources than can be displayed
            return overflowCount > 0
                ? baseContent + StringHelper.xss`<div class="overflow">+${overflowCount} more</div>`
                : baseContent;
        }
    }
]
```

### 4.2 Detailed Avatar Tooltip

```javascript
avatarTooltipTemplate({
    resourceRecord,
    assignmentRecord,
    taskRecord,
    overflowCount
}) {
    return `
        <div class="avatar-tooltip">
            <div class="header">
                <img src="${gantt.resourceImagePath}${resourceRecord.image || 'none.png'}"
                     alt="${StringHelper.encodeHtml(resourceRecord.name)}" />
                <div class="name">${StringHelper.encodeHtml(resourceRecord.name)}</div>
            </div>
            <div class="details">
                <div class="row">
                    <i class="fa fa-briefcase"></i>
                    <span>${resourceRecord.role || 'Team Member'}</span>
                </div>
                <div class="row">
                    <i class="fa fa-envelope"></i>
                    <span>${resourceRecord.email || 'N/A'}</span>
                </div>
                <div class="row">
                    <i class="fa fa-percent"></i>
                    <span>${assignmentRecord.units}% allocation</span>
                </div>
            </div>
            ${overflowCount > 0 ? `
                <div class="overflow-notice">
                    +${overflowCount} more resources assigned
                </div>
            ` : ''}
        </div>
    `;
}
```

---

## 5. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { DateHelper, StringHelper } from '@bryntum/gantt';

function GanttWithTooltips({ projectData }) {
    const ganttConfig = {
        resourceImagePath: '/images/users/',

        features: {
            taskTooltip: {
                textContent: false,
                template: ({ taskRecord }) => `
                    <div class="custom-tooltip">
                        <div class="tooltip-header">
                            <strong>${StringHelper.encodeHtml(taskRecord.name)}</strong>
                        </div>
                        <div class="tooltip-body">
                            <div class="row">
                                <span class="label">Status:</span>
                                <span class="value ${taskRecord.critical ? 'critical' : ''}">
                                    ${taskRecord.critical ? 'Critical' : 'Normal'}
                                </span>
                            </div>
                            <div class="row">
                                <span class="label">Progress:</span>
                                <span class="value">${taskRecord.percentDone}%</span>
                            </div>
                            <div class="row">
                                <span class="label">Duration:</span>
                                <span class="value">${taskRecord.fullDuration}</span>
                            </div>
                            <div class="row">
                                <span class="label">Start:</span>
                                <span class="value">
                                    ${DateHelper.format(taskRecord.startDate, 'MMM D, YYYY')}
                                </span>
                            </div>
                            <div class="row">
                                <span class="label">End:</span>
                                <span class="value">
                                    ${DateHelper.format(taskRecord.endDate, 'MMM D, YYYY')}
                                </span>
                            </div>
                        </div>
                    </div>
                `
            },

            taskDrag: {
                tooltipTemplate: ({ taskRecord, startDate }) =>
                    `<strong>${taskRecord.name}</strong><br/>New start: ${DateHelper.format(startDate, 'MMM D')}`
            },

            taskResize: {
                tooltipTemplate: ({ endDate }) =>
                    DateHelper.format(endDate, 'MMM D, YYYY')
            }
        },

        columns: [
            { type: 'name', width: 200 },
            {
                type: 'resourceassignment',
                width: 200,
                showAvatars: true,
                avatarTooltipTemplate: ({
                    resourceRecord,
                    assignmentRecord
                }) => `
                    <div class="resource-tooltip">
                        <strong>${resourceRecord.name}</strong>
                        <div>${assignmentRecord.units}% assigned</div>
                    </div>
                `
            }
        ]
    };

    return (
        <BryntumGantt
            project={projectData}
            {...ganttConfig}
        />
    );
}
```

---

## 6. Styling

```css
/* Task Tooltip */
.b-tasktooltip {
    background: #333;
    color: white;
    border-radius: 8px;
    padding: 12px;
    min-width: 200px;
}

.b-tasktooltip .field {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.b-tasktooltip .field:last-child {
    border-bottom: none;
}

.b-tasktooltip label {
    color: #999;
    font-size: 12px;
}

.b-tasktooltip .b-avatar-container {
    display: flex;
    gap: 4px;
}

.b-tasktooltip .b-resource-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
}

/* Drag Tooltip */
.drag-tooltip {
    background: #2196F3;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
}

.drag-tooltip .task-name {
    font-weight: bold;
    margin-bottom: 4px;
}

.drag-tooltip .dates {
    display: flex;
    gap: 12px;
    font-size: 12px;
}

/* Resize Tooltip */
.resize-tooltip {
    background: #4CAF50;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
}

.resize-tooltip .change {
    font-size: 12px;
}

.resize-tooltip .change.increase {
    color: #ff9800;
}

.resize-tooltip .change.decrease {
    color: #ff5722;
}

/* Avatar Tooltip */
.avatar-tooltip {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 12px;
    min-width: 180px;
}

.avatar-tooltip .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.avatar-tooltip .header img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
}

.avatar-tooltip .header .name {
    font-weight: bold;
    font-size: 14px;
}

.avatar-tooltip .details .row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
}

.avatar-tooltip .details .row i {
    color: #666;
    width: 16px;
}

.avatar-tooltip .overflow-notice {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #eee;
    color: #666;
    font-size: 12px;
}

/* Custom tooltip */
.custom-tooltip {
    min-width: 200px;
}

.custom-tooltip .tooltip-header {
    padding: 8px 12px;
    background: #2196F3;
    color: white;
    border-radius: 4px 4px 0 0;
}

.custom-tooltip .tooltip-body {
    padding: 12px;
}

.custom-tooltip .row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
}

.custom-tooltip .label {
    color: #666;
}

.custom-tooltip .value.critical {
    color: #f44336;
    font-weight: bold;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Tooltip niet zichtbaar | Feature disabled | Enable taskTooltip feature |
| HTML niet gerenderd | textContent: true | Zet textContent: false |
| XSS vulnerability | Geen encoding | Gebruik StringHelper.encodeHtml() |
| Avatar tooltip leeg | Template functie error | Check template return value |
| Drag tooltip niet zichtbaar | taskDrag config mist | Voeg tooltipTemplate toe aan taskDrag |

---

## API Reference

### TaskTooltip Feature

| Property | Type | Description |
|----------|------|-------------|
| `textContent` | Boolean | Use text vs HTML |
| `template` | Function | Tooltip template function |

### TaskDrag Feature

| Property | Type | Description |
|----------|------|-------------|
| `tooltipTemplate` | Function | Drag tooltip template |

### TaskResize Feature

| Property | Type | Description |
|----------|------|-------------|
| `tooltipTemplate` | Function | Resize tooltip template |

### ResourceAssignment Column

| Property | Type | Description |
|----------|------|-------------|
| `showAvatars` | Boolean | Show resource avatars |
| `avatarTooltipTemplate` | Function | Avatar tooltip template |

### Template Parameters

| Parameter | Available In | Description |
|-----------|--------------|-------------|
| `taskRecord` | All | Task model |
| `startDate` | Drag | New start date |
| `endDate` | Drag, Resize | New end date |
| `duration` | Drag, Resize | New duration |
| `resourceRecord` | Avatar | Resource model |
| `assignmentRecord` | Avatar | Assignment model |
| `overflowCount` | Avatar | Hidden avatar count |

---

## Bronnen

- **Example**: `examples/tooltips/`
- **TaskTooltip Feature**: `Gantt.feature.TaskTooltip`
- **TaskDrag Feature**: `Gantt.feature.TaskDrag`
- **TaskResize Feature**: `Gantt.feature.TaskResize`
- **StringHelper**: `Core.helper.StringHelper`

---

*Priority 2: Medium Priority Features*
