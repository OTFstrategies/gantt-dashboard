# Gantt Implementation: Web Components

> **Custom Elements** wrapping voor Bryntum Gantt, Shadow DOM encapsulation, attribute binding, en framework-agnostic integratie.

---

## Overzicht

Web Components stellen je in staat om Bryntum Gantt als native HTML custom element te gebruiken. Dit maakt framework-agnostic integratie mogelijk met volledige encapsulation.

```html
<!-- Gebruik als native HTML element -->
<bryntum-gantt
    project="./data/project.json"
    columns='[{"type":"name"},{"type":"startdate"},{"type":"enddate"}]'
    view-preset="weekAndDay"
    row-height="45">
</bryntum-gantt>
```

---

## 1. Web Component Wrapper

### 1.1 Basis Custom Element

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

class BryntumGanttElement extends HTMLElement {
    static get observedAttributes() {
        return [
            'project',
            'columns',
            'view-preset',
            'row-height',
            'bar-margin',
            'read-only'
        ];
    }

    constructor() {
        super();

        // Shadow DOM voor encapsulation
        this.attachShadow({ mode: 'open' });

        // Container voor Gantt
        this.container = document.createElement('div');
        this.container.className = 'gantt-container';
        this.shadowRoot.appendChild(this.container);

        // Styles
        this.injectStyles();
    }

    connectedCallback() {
        // Element is toegevoegd aan DOM
        this.initGantt();
    }

    disconnectedCallback() {
        // Cleanup bij verwijdering
        this.gantt?.destroy();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        // Update Gantt config
        this.updateConfig(name, newValue);
    }

    initGantt() {
        const config = this.buildConfig();

        this.gantt = new Gantt({
            appendTo: this.container,
            ...config
        });

        // Dispatch ready event
        this.dispatchEvent(new CustomEvent('gantt-ready', {
            detail: { gantt: this.gantt }
        }));
    }

    buildConfig() {
        return {
            project: this.parseProject(this.getAttribute('project')),
            columns: this.parseJSON(this.getAttribute('columns')) || [
                { type: 'name', width: 250 }
            ],
            viewPreset: this.getAttribute('view-preset') || 'weekAndDay',
            rowHeight: parseInt(this.getAttribute('row-height')) || 45,
            barMargin: parseInt(this.getAttribute('bar-margin')) || 10,
            readOnly: this.hasAttribute('read-only')
        };
    }
}

// Registreer custom element
customElements.define('bryntum-gantt', BryntumGanttElement);
```

### 1.2 Shadow DOM Styles

```javascript
injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }

        .gantt-container {
            width: 100%;
            height: 100%;
        }
    `;
    this.shadowRoot.appendChild(style);

    // Importeer Bryntum CSS
    const bryntumStyles = document.createElement('link');
    bryntumStyles.rel = 'stylesheet';
    bryntumStyles.href = '/node_modules/@bryntum/gantt/gantt.stockholm.css';
    this.shadowRoot.appendChild(bryntumStyles);
}
```

---

## 2. Attribute Parsing

### 2.1 Type Conversions

```javascript
class BryntumGanttElement extends HTMLElement {

    parseJSON(value) {
        if (!value) return null;

        try {
            return JSON.parse(value);
        }
        catch (e) {
            console.warn('Invalid JSON attribute:', value);
            return null;
        }
    }

    parseProject(value) {
        if (!value) return {};

        // URL naar project data
        if (value.startsWith('http') || value.startsWith('./') || value.startsWith('/')) {
            return new ProjectModel({
                loadUrl: value,
                autoLoad: true
            });
        }

        // JSON object
        return this.parseJSON(value);
    }

    parseBoolean(value) {
        return value !== null && value !== 'false';
    }

    parseNumber(value, defaultValue = 0) {
        const num = parseInt(value, 10);
        return isNaN(num) ? defaultValue : num;
    }
}
```

### 2.2 Dynamic Attribute Updates

```javascript
updateConfig(attrName, value) {
    if (!this.gantt) return;

    const configMap = {
        'view-preset': () => {
            this.gantt.viewPreset = value;
        },
        'row-height': () => {
            this.gantt.rowHeight = this.parseNumber(value, 45);
        },
        'bar-margin': () => {
            this.gantt.barMargin = this.parseNumber(value, 10);
        },
        'read-only': () => {
            this.gantt.readOnly = this.parseBoolean(value);
        },
        'columns': () => {
            const columns = this.parseJSON(value);
            if (columns) {
                this.gantt.columns = columns;
            }
        },
        'project': () => {
            const project = this.parseProject(value);
            if (project) {
                this.gantt.project = project;
            }
        }
    };

    const updater = configMap[attrName];
    if (updater) {
        updater();
    }
}
```

---

## 3. Properties & Methods

### 3.1 JavaScript Properties

```javascript
class BryntumGanttElement extends HTMLElement {

    // Getter/setters voor JavaScript access
    get project() {
        return this.gantt?.project;
    }

    set project(value) {
        if (this.gantt) {
            this.gantt.project = value;
        }
        else {
            this._pendingProject = value;
        }
    }

    get tasks() {
        return this.gantt?.taskStore.records || [];
    }

    set tasks(value) {
        if (this.gantt) {
            this.gantt.taskStore.data = value;
        }
    }

    get selectedTasks() {
        return this.gantt?.selectedRecords || [];
    }

    get viewPreset() {
        return this.gantt?.viewPreset;
    }

    set viewPreset(value) {
        if (this.gantt) {
            this.gantt.viewPreset = value;
        }
        this.setAttribute('view-preset', value);
    }
}
```

### 3.2 Public Methods

```javascript
class BryntumGanttElement extends HTMLElement {

    // Scroll naar taak
    scrollToTask(taskId) {
        const task = this.gantt?.taskStore.getById(taskId);
        if (task) {
            this.gantt.scrollRowIntoView(task);
        }
    }

    // Zoom controls
    zoomIn() {
        this.gantt?.zoomIn();
    }

    zoomOut() {
        this.gantt?.zoomOut();
    }

    zoomToFit() {
        this.gantt?.zoomToFit();
    }

    // Expand/collapse
    expandAll() {
        this.gantt?.expandAll();
    }

    collapseAll() {
        this.gantt?.collapseAll();
    }

    // Export
    async exportToPdf(config = {}) {
        return this.gantt?.features.pdfExport.export(config);
    }

    // Refresh
    refresh() {
        this.gantt?.refresh();
    }
}
```

---

## 4. Custom Events

### 4.1 Event Dispatching

```javascript
class BryntumGanttElement extends HTMLElement {

    initGantt() {
        this.gantt = new Gantt({
            appendTo: this.container,
            ...this.buildConfig(),

            listeners: {
                taskClick: this.onTaskClick.bind(this),
                taskDblClick: this.onTaskDblClick.bind(this),
                dependencyClick: this.onDependencyClick.bind(this),
                selectionChange: this.onSelectionChange.bind(this),
                beforeTaskEdit: this.onBeforeTaskEdit.bind(this),
                afterTaskEdit: this.onAfterTaskEdit.bind(this)
            }
        });
    }

    onTaskClick({ taskRecord, event }) {
        this.dispatchEvent(new CustomEvent('task-click', {
            detail: {
                task: taskRecord.data,
                taskId: taskRecord.id,
                originalEvent: event
            },
            bubbles: true,
            composed: true // Cross shadow boundary
        }));
    }

    onTaskDblClick({ taskRecord, event }) {
        this.dispatchEvent(new CustomEvent('task-dblclick', {
            detail: {
                task: taskRecord.data,
                taskId: taskRecord.id
            },
            bubbles: true,
            composed: true
        }));
    }

    onSelectionChange({ selection }) {
        this.dispatchEvent(new CustomEvent('selection-change', {
            detail: {
                selectedTasks: selection.map(r => r.data),
                selectedIds: selection.map(r => r.id)
            },
            bubbles: true,
            composed: true
        }));
    }

    onBeforeTaskEdit({ taskRecord }) {
        const event = new CustomEvent('before-task-edit', {
            detail: { task: taskRecord.data },
            bubbles: true,
            composed: true,
            cancelable: true
        });

        this.dispatchEvent(event);

        // Return false als event gecancelled
        return !event.defaultPrevented;
    }
}
```

### 4.2 Event Listening

```html
<bryntum-gantt id="myGantt"></bryntum-gantt>

<script>
    const gantt = document.getElementById('myGantt');

    gantt.addEventListener('task-click', (e) => {
        console.log('Task clicked:', e.detail.task);
    });

    gantt.addEventListener('selection-change', (e) => {
        console.log('Selection:', e.detail.selectedTasks);
    });

    gantt.addEventListener('before-task-edit', (e) => {
        // Cancel edit voor bepaalde taken
        if (e.detail.task.locked) {
            e.preventDefault();
        }
    });
</script>
```

---

## 5. Slots

### 5.1 Toolbar Slot

```javascript
class BryntumGanttElement extends HTMLElement {

    connectedCallback() {
        // Setup slots
        this.setupSlots();
        this.initGantt();
    }

    setupSlots() {
        // Toolbar slot
        const toolbarSlot = document.createElement('slot');
        toolbarSlot.name = 'toolbar';
        this.shadowRoot.insertBefore(toolbarSlot, this.container);

        // Listen voor slotted content
        toolbarSlot.addEventListener('slotchange', () => {
            this.handleToolbarSlot(toolbarSlot);
        });
    }

    handleToolbarSlot(slot) {
        const elements = slot.assignedElements();

        elements.forEach(el => {
            // Connect toolbar buttons naar Gantt
            el.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    this.handleAction(action);
                });
            });
        });
    }

    handleAction(action) {
        const actions = {
            'zoom-in': () => this.zoomIn(),
            'zoom-out': () => this.zoomOut(),
            'zoom-fit': () => this.zoomToFit(),
            'expand-all': () => this.expandAll(),
            'collapse-all': () => this.collapseAll(),
            'export-pdf': () => this.exportToPdf()
        };

        actions[action]?.();
    }
}
```

### 5.2 Slot Usage

```html
<bryntum-gantt project="./project.json">
    <div slot="toolbar" class="custom-toolbar">
        <button data-action="zoom-in">Zoom In</button>
        <button data-action="zoom-out">Zoom Out</button>
        <button data-action="zoom-fit">Fit</button>
        <span class="separator"></span>
        <button data-action="expand-all">Expand All</button>
        <button data-action="collapse-all">Collapse All</button>
    </div>
</bryntum-gantt>
```

---

## 6. Features Configuration

### 6.1 Feature Attributes

```javascript
class BryntumGanttElement extends HTMLElement {
    static get observedAttributes() {
        return [
            'project',
            'columns',
            // Feature toggles
            'feature-dependencies',
            'feature-filter-bar',
            'feature-critical-paths',
            'feature-baselines',
            'feature-rollups',
            'feature-percent-bar'
        ];
    }

    buildConfig() {
        return {
            // ... basis config

            features: {
                dependencies: this.parseBoolean(this.getAttribute('feature-dependencies')),
                filterBar: this.parseBoolean(this.getAttribute('feature-filter-bar')),
                criticalPaths: this.parseBoolean(this.getAttribute('feature-critical-paths')),
                baselines: this.parseBoolean(this.getAttribute('feature-baselines')),
                rollups: this.parseBoolean(this.getAttribute('feature-rollups')),
                percentBar: this.parseBoolean(this.getAttribute('feature-percent-bar'))
            }
        };
    }
}
```

### 6.2 Feature Usage

```html
<bryntum-gantt
    project="./project.json"
    feature-dependencies
    feature-filter-bar
    feature-critical-paths
    feature-baselines>
</bryntum-gantt>
```

---

## 7. Styling via CSS Custom Properties

### 7.1 Exposed Custom Properties

```javascript
injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        :host {
            --gantt-primary-color: var(--primary-color, #4CAF50);
            --gantt-bar-color: var(--bar-color, #2196F3);
            --gantt-milestone-color: var(--milestone-color, #FF5722);
            --gantt-critical-color: var(--critical-color, #F44336);
            --gantt-row-height: var(--row-height, 45px);
            --gantt-font-family: var(--font-family, inherit);

            display: block;
            width: 100%;
            height: 100%;
        }

        .gantt-container {
            --b-primary-color: var(--gantt-primary-color);
            font-family: var(--gantt-font-family);
        }

        .gantt-container .b-gantt-task {
            background-color: var(--gantt-bar-color);
        }

        .gantt-container .b-milestone {
            background-color: var(--gantt-milestone-color);
        }

        .gantt-container .b-critical .b-gantt-task {
            background-color: var(--gantt-critical-color);
        }
    `;
    this.shadowRoot.appendChild(style);
}
```

### 7.2 Custom Property Usage

```html
<style>
    bryntum-gantt {
        --primary-color: #673AB7;
        --bar-color: #9C27B0;
        --milestone-color: #E91E63;
        --row-height: 50px;
    }

    bryntum-gantt.dark-theme {
        --primary-color: #BB86FC;
        --bar-color: #03DAC6;
    }
</style>

<bryntum-gantt class="dark-theme" project="./project.json">
</bryntum-gantt>
```

---

## 8. Form Association

### 8.1 Form-Associated Custom Element

```javascript
class BryntumGanttElement extends HTMLElement {
    static formAssociated = true;

    constructor() {
        super();

        // Form internals voor form participation
        this.internals = this.attachInternals();
    }

    // Form callbacks
    formAssociatedCallback(form) {
        console.log('Associated with form:', form);
    }

    formDisabledCallback(disabled) {
        if (this.gantt) {
            this.gantt.readOnly = disabled;
        }
    }

    formResetCallback() {
        // Reset naar initial state
        this.gantt?.project.revertChanges();
    }

    // Submit project data met form
    get value() {
        return JSON.stringify(this.gantt?.project.toJSON());
    }

    set value(val) {
        const data = JSON.parse(val);
        this.gantt?.project.loadCrudManagerData(data);
    }
}
```

### 8.2 Form Integration

```html
<form id="projectForm">
    <bryntum-gantt name="projectData" project="./project.json">
    </bryntum-gantt>

    <button type="submit">Save Project</button>
    <button type="reset">Reset Changes</button>
</form>

<script>
    document.getElementById('projectForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const projectData = formData.get('projectData');

        console.log('Project data:', JSON.parse(projectData));
    });
</script>
```

---

## 9. Lazy Loading

### 9.1 Intersection Observer

```javascript
class BryntumGanttElement extends HTMLElement {

    connectedCallback() {
        // Lazy init wanneer zichtbaar
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.initGantt();
                            this.observer.disconnect();
                        }
                    });
                },
                { threshold: 0.1 }
            );

            this.observer.observe(this);
        }
        else {
            // Fallback: direct init
            this.initGantt();
        }
    }

    disconnectedCallback() {
        this.observer?.disconnect();
        this.gantt?.destroy();
    }
}
```

---

## 10. Complete Implementation

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

class BryntumGanttElement extends HTMLElement {
    static get observedAttributes() {
        return [
            'project', 'columns', 'view-preset', 'row-height', 'bar-margin',
            'read-only', 'feature-dependencies', 'feature-filter-bar',
            'feature-critical-paths', 'feature-baselines'
        ];
    }

    static formAssociated = true;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.internals = this.attachInternals();

        this.container = document.createElement('div');
        this.container.className = 'gantt-container';

        this.injectStyles();
        this.setupSlots();

        this.shadowRoot.appendChild(this.container);
    }

    connectedCallback() {
        this.initGantt();
    }

    disconnectedCallback() {
        this.gantt?.destroy();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateConfig(name, newValue);
        }
    }

    // ... alle methods van boven

    // Expose Gantt instance
    get instance() {
        return this.gantt;
    }
}

// Registreer
customElements.define('bryntum-gantt', BryntumGanttElement);

// Export voor module gebruik
export { BryntumGanttElement };
```

---

## 11. Usage Examples

### 11.1 Basic HTML

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module" src="./bryntum-gantt-element.js"></script>
</head>
<body>
    <bryntum-gantt
        project="./data/project.json"
        view-preset="weekAndDay"
        feature-dependencies
        feature-critical-paths>
    </bryntum-gantt>

    <script>
        const gantt = document.querySelector('bryntum-gantt');

        gantt.addEventListener('gantt-ready', () => {
            console.log('Gantt is ready!');
        });

        gantt.addEventListener('task-click', (e) => {
            alert(`Clicked: ${e.detail.task.name}`);
        });
    </script>
</body>
</html>
```

### 11.2 Vue Integration

```vue
<template>
    <bryntum-gantt
        ref="gantt"
        :project="projectUrl"
        view-preset="weekAndDay"
        feature-dependencies
        @task-click="onTaskClick"
        @selection-change="onSelectionChange">
    </bryntum-gantt>
</template>

<script>
import './bryntum-gantt-element.js';

export default {
    data() {
        return {
            projectUrl: '/api/project/123'
        };
    },

    methods: {
        onTaskClick(e) {
            console.log('Task clicked:', e.detail.task);
        },

        onSelectionChange(e) {
            this.$emit('selection', e.detail.selectedTasks);
        }
    }
};
</script>
```

---

## 12. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Styles niet geladen | Shadow DOM isolatie | Import styles in shadow root |
| Events niet bubbling | composed: false | Zet composed: true |
| Attributes niet reactive | Niet in observedAttributes | Voeg toe aan static getter |
| Memory leak | Geen cleanup | Implement disconnectedCallback |

---

## Bronnen

- **Example**: `examples/webcomponents/`
- **MDN Web Components**: https://developer.mozilla.org/en-US/docs/Web/Web_Components
- **Custom Elements Spec**: https://html.spec.whatwg.org/multipage/custom-elements.html

---

*Track A: Foundation - Gantt Extensions (A2.3)*
