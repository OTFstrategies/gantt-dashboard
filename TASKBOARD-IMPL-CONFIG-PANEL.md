# TaskBoard Implementation: Config Panel

> **Implementatie guide** voor configuratiepanelen in Bryntum TaskBoard: feature toggles, swimlane configuratie, column settings, en runtime aanpassingen.

---

## Overzicht

Config Panel biedt runtime configuratie mogelijkheden:

- **Feature Toggles** - In/uitschakelen van features
- **Swimlane Config** - Swimlane weergave aanpassen
- **Column Settings** - Kolom breedte en collapsed state
- **Visual Settings** - Kaart styling en layout
- **Persistence** - Configuratie opslaan/herstellen

---

## 1. Basic Configuration

### 1.1 TaskBoard Setup

```javascript
import { TaskBoard, Panel } from '@bryntum/taskboard';

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

    swimlaneField: 'prio',
    swimlanes: [
        { id: 'high', text: 'High Priority' },
        { id: 'medium', text: 'Medium Priority' },
        { id: 'low', text: 'Low Priority' }
    ]
});
```

---

## 2. ConfigPanel Widget

### 2.1 Custom Panel Class

```javascript
import { Panel, Checkbox, Slider, Combo } from '@bryntum/taskboard';

class ConfigPanel extends Panel {
    static $name = 'ConfigPanel';
    static type = 'configpanel';

    static configurable = {
        title: 'Settings',
        collapsible: true,
        collapsed: false,
        width: 280,
        cls: 'config-panel',

        defaults: {
            labelWidth: '8em'
        },

        items: {
            // Feature toggles
            featuresGroup: {
                type: 'container',
                title: 'Features',
                items: {
                    columnDrag: {
                        type: 'checkbox',
                        label: 'Column Drag',
                        checked: true,
                        onChange: 'up.onFeatureToggle'
                    },
                    taskDrag: {
                        type: 'checkbox',
                        label: 'Task Drag',
                        checked: true,
                        onChange: 'up.onFeatureToggle'
                    },
                    columnToolbars: {
                        type: 'checkbox',
                        label: 'Column Toolbars',
                        checked: true,
                        onChange: 'up.onFeatureToggle'
                    },
                    taskMenu: {
                        type: 'checkbox',
                        label: 'Task Menu',
                        checked: true,
                        onChange: 'up.onFeatureToggle'
                    }
                }
            },

            // Swimlane settings
            swimlaneGroup: {
                type: 'container',
                title: 'Swimlanes',
                items: {
                    showSwimlanes: {
                        type: 'checkbox',
                        label: 'Show Swimlanes',
                        checked: true,
                        onChange: 'up.onSwimlaneToggle'
                    },
                    collapseSwimlanes: {
                        type: 'checkbox',
                        label: 'Collapse All',
                        checked: false,
                        onChange: 'up.onCollapseSwimlanes'
                    }
                }
            },

            // Visual settings
            visualGroup: {
                type: 'container',
                title: 'Visual',
                items: {
                    columnWidth: {
                        type: 'slider',
                        label: 'Column Width',
                        min: 200,
                        max: 500,
                        value: 300,
                        onInput: 'up.onColumnWidthChange'
                    },
                    cardHeight: {
                        type: 'slider',
                        label: 'Card Height',
                        min: 60,
                        max: 200,
                        value: 100,
                        onInput: 'up.onCardHeightChange'
                    }
                }
            }
        }
    };

    construct(config) {
        super.construct(config);
        this.taskBoard = config.taskBoard;
    }

    onFeatureToggle({ source, checked }) {
        const featureName = source.ref;
        this.taskBoard.features[featureName].disabled = !checked;
    }

    onSwimlaneToggle({ checked }) {
        if (checked) {
            this.taskBoard.swimlaneField = 'prio';
        } else {
            this.taskBoard.swimlaneField = null;
        }
    }

    onCollapseSwimlanes({ checked }) {
        this.taskBoard.swimlanes.forEach(swimlane => {
            swimlane.collapsed = checked;
        });
    }

    onColumnWidthChange({ value }) {
        this.taskBoard.columns.forEach(column => {
            column.width = value;
        });
    }

    onCardHeightChange({ value }) {
        this.taskBoard.taskHeight = value;
    }
}

ConfigPanel.initClass();
```

---

## 3. Feature Toggles

### 3.1 Individual Feature Control

```javascript
// Toggle specific feature
function toggleFeature(taskBoard, featureName, enabled) {
    const feature = taskBoard.features[featureName];

    if (feature) {
        feature.disabled = !enabled;
    }
}

// Voorbeeld
toggleFeature(taskBoard, 'taskDrag', false);     // Disable drag
toggleFeature(taskBoard, 'columnDrag', true);    // Enable column drag
toggleFeature(taskBoard, 'taskMenu', false);     // Disable context menu
```

### 3.2 Feature State Sync

```javascript
class ConfigPanel extends Panel {
    syncWithTaskBoard() {
        const { taskBoard, widgetMap } = this;

        // Sync checkboxes met huidige feature states
        Object.keys(widgetMap).forEach(key => {
            const widget = widgetMap[key];

            if (widget.type === 'checkbox' && taskBoard.features[key]) {
                widget.suspendEvents();
                widget.checked = !taskBoard.features[key].disabled;
                widget.resumeEvents();
            }
        });
    }
}
```

---

## 4. Swimlane Configuration

### 4.1 Dynamic Swimlane Control

```javascript
// Swimlane field wijzigen
taskBoard.swimlaneField = 'category';

// Swimlanes configureren
taskBoard.swimlanes = [
    { id: 'frontend', text: 'Frontend', color: 'blue' },
    { id: 'backend', text: 'Backend', color: 'green' },
    { id: 'design', text: 'Design', color: 'purple' }
];

// Uitschakelen
taskBoard.swimlaneField = null;
```

### 4.2 Swimlane Collapse State

```javascript
// Collapse specifieke swimlane
taskBoard.swimlanes.find(s => s.id === 'low').collapsed = true;

// Collapse/expand alle swimlanes
function toggleAllSwimlanes(taskBoard, collapsed) {
    taskBoard.swimlanes.forEach(swimlane => {
        swimlane.collapsed = collapsed;
    });
}

// Toggle met animatie
async function animatedCollapseAll(taskBoard) {
    for (const swimlane of taskBoard.swimlanes) {
        swimlane.collapsed = true;
        await new Promise(r => setTimeout(r, 100));
    }
}
```

---

## 5. Column Configuration

### 5.1 Column Width Control

```javascript
// Set column width
taskBoard.columns.forEach(column => {
    column.width = 350;
});

// Per kolom
taskBoard.columns.find(c => c.id === 'done').width = 250;

// Flex sizing
taskBoard.columns.forEach(column => {
    column.flex = 1;
    column.minWidth = 200;
    column.maxWidth = 500;
});
```

### 5.2 Column Collapse

```javascript
// Collapse kolom
taskBoard.columns.find(c => c.id === 'done').collapsed = true;

// Toggle
function toggleColumn(taskBoard, columnId) {
    const column = taskBoard.columns.find(c => c.id === columnId);
    column.collapsed = !column.collapsed;
}
```

---

## 6. Visual Settings

### 6.1 Card Configuration

```javascript
// Task card height
taskBoard.taskHeight = 120;

// Card renderer
taskBoard.taskRenderer = ({ taskRecord }) => {
    return {
        class: {
            'high-priority': taskRecord.prio === 1,
            'low-priority': taskRecord.prio === 3
        },
        children: [
            { tag: 'div', class: 'task-name', text: taskRecord.name },
            { tag: 'div', class: 'task-desc', text: taskRecord.description }
        ]
    };
};
```

### 6.2 Theme Switching

```javascript
items: {
    themeSelector: {
        type: 'combo',
        label: 'Theme',
        value: 'material',
        items: [
            'classic', 'classic-light', 'classic-dark',
            'material', 'stockholm'
        ],
        onChange({ value }) {
            document.body.className = `b-theme-${value}`;
        }
    }
}
```

---

## 7. Settings Persistence

### 7.1 Save Configuration

```javascript
function saveConfig(taskBoard) {
    const config = {
        // Feature states
        features: {},

        // Column settings
        columns: taskBoard.columns.map(col => ({
            id: col.id,
            width: col.width,
            collapsed: col.collapsed
        })),

        // Swimlane settings
        swimlaneField: taskBoard.swimlaneField,
        swimlanes: taskBoard.swimlanes?.map(sl => ({
            id: sl.id,
            collapsed: sl.collapsed
        })),

        // Visual settings
        taskHeight: taskBoard.taskHeight
    };

    // Capture feature states
    Object.keys(taskBoard.features).forEach(name => {
        config.features[name] = !taskBoard.features[name].disabled;
    });

    localStorage.setItem('taskBoardConfig', JSON.stringify(config));
}
```

### 7.2 Restore Configuration

```javascript
function restoreConfig(taskBoard) {
    const saved = localStorage.getItem('taskBoardConfig');

    if (!saved) return;

    const config = JSON.parse(saved);

    // Restore features
    Object.entries(config.features).forEach(([name, enabled]) => {
        if (taskBoard.features[name]) {
            taskBoard.features[name].disabled = !enabled;
        }
    });

    // Restore columns
    config.columns.forEach(colConfig => {
        const column = taskBoard.columns.find(c => c.id === colConfig.id);
        if (column) {
            column.width = colConfig.width;
            column.collapsed = colConfig.collapsed;
        }
    });

    // Restore swimlanes
    if (config.swimlaneField) {
        taskBoard.swimlaneField = config.swimlaneField;
        config.swimlanes?.forEach(slConfig => {
            const swimlane = taskBoard.swimlanes.find(s => s.id === slConfig.id);
            if (swimlane) {
                swimlane.collapsed = slConfig.collapsed;
            }
        });
    }

    // Restore visual
    if (config.taskHeight) {
        taskBoard.taskHeight = config.taskHeight;
    }
}
```

---

## 8. Sidebar Integration

### 8.1 Config in Sidebar

```javascript
const taskBoard = new TaskBoard({
    appendTo: 'main-area',

    // ... taskboard config

    tbar: {
        items: {
            settingsButton: {
                type: 'button',
                icon: 'b-icon-settings',
                tooltip: 'Settings',
                onClick() {
                    configPanel.collapsed = !configPanel.collapsed;
                }
            }
        }
    }
});

const configPanel = new ConfigPanel({
    appendTo: 'sidebar',
    taskBoard,
    collapsed: true
});
```

### 8.2 Floating Config Panel

```javascript
const configPanel = new ConfigPanel({
    appendTo: document.body,
    taskBoard,
    floating: true,
    centered: true,
    modal: true,
    closable: true,
    width: 350,
    height: 500
});

// Show panel
taskBoard.tbar.widgetMap.settingsButton.on('click', () => {
    configPanel.show();
});
```

---

## 9. Preset Configurations

### 9.1 Preset Manager

```javascript
const presets = {
    compact: {
        taskHeight: 60,
        columnWidth: 250,
        features: {
            taskMenu: false,
            columnToolbars: false
        }
    },

    detailed: {
        taskHeight: 150,
        columnWidth: 400,
        features: {
            taskMenu: true,
            columnToolbars: true
        }
    },

    minimal: {
        taskHeight: 80,
        columnWidth: 300,
        swimlaneField: null,
        features: {
            taskDrag: true,
            columnDrag: false,
            taskMenu: false
        }
    }
};

function applyPreset(taskBoard, presetName) {
    const preset = presets[presetName];

    if (!preset) return;

    // Apply settings
    if (preset.taskHeight) taskBoard.taskHeight = preset.taskHeight;
    if (preset.columnWidth) {
        taskBoard.columns.forEach(c => c.width = preset.columnWidth);
    }
    if (preset.swimlaneField !== undefined) {
        taskBoard.swimlaneField = preset.swimlaneField;
    }

    // Apply features
    Object.entries(preset.features || {}).forEach(([name, enabled]) => {
        if (taskBoard.features[name]) {
            taskBoard.features[name].disabled = !enabled;
        }
    });
}
```

### 9.2 Preset Selector

```javascript
items: {
    presetSelector: {
        type: 'combo',
        label: 'Preset',
        value: 'detailed',
        items: ['compact', 'detailed', 'minimal'],
        onChange({ value }) {
            applyPreset(this.taskBoard, value);
            this.syncWithTaskBoard();
        }
    }
}
```

---

## 10. TypeScript Interfaces

```typescript
import { Panel, TaskBoard, Feature } from '@bryntum/taskboard';

// Config Panel Configuration
interface ConfigPanelConfig {
    taskBoard: TaskBoard;
    title?: string;
    collapsible?: boolean;
    collapsed?: boolean;
    width?: number;
}

// Feature Toggle Config
interface FeatureToggleConfig {
    type: 'checkbox';
    label: string;
    checked: boolean;
    onChange: string | ((event: CheckboxChangeEvent) => void);
}

interface CheckboxChangeEvent {
    source: Checkbox;
    checked: boolean;
}

// Saved Configuration
interface SavedConfig {
    features: Record<string, boolean>;
    columns: ColumnConfig[];
    swimlaneField?: string;
    swimlanes?: SwimlaneConfig[];
    taskHeight?: number;
}

interface ColumnConfig {
    id: string;
    width?: number;
    collapsed?: boolean;
}

interface SwimlaneConfig {
    id: string;
    collapsed?: boolean;
}

// Preset Configuration
interface PresetConfig {
    taskHeight?: number;
    columnWidth?: number;
    swimlaneField?: string | null;
    features?: Record<string, boolean>;
}

// ConfigPanel Class
interface ConfigPanel extends Panel {
    taskBoard: TaskBoard;
    syncWithTaskBoard(): void;
    onFeatureToggle(event: CheckboxChangeEvent): void;
    onSwimlaneToggle(event: CheckboxChangeEvent): void;
    onColumnWidthChange(event: SliderInputEvent): void;
}
```

---

## 11. Styling

```css
/* Config Panel */
.config-panel {
    background: #fff;
    border-left: 1px solid #e0e0e0;
}

.config-panel .b-panel-header {
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

/* Section groups */
.config-panel .b-container {
    padding: 12px;
    border-bottom: 1px solid #eee;
}

.config-panel .b-container:last-child {
    border-bottom: none;
}

/* Group titles */
.config-panel .b-container::before {
    content: attr(title);
    display: block;
    font-weight: bold;
    margin-bottom: 8px;
    color: #666;
    font-size: 0.85em;
    text-transform: uppercase;
}

/* Checkboxes */
.config-panel .b-checkbox {
    margin: 8px 0;
}

/* Sliders */
.config-panel .b-slider {
    margin: 12px 0;
}

/* Combo boxes */
.config-panel .b-combo {
    margin: 8px 0;
}

/* Collapsed state */
.config-panel.b-collapsed {
    width: 40px;
}

.config-panel.b-collapsed .b-panel-content {
    display: none;
}
```

---

## 12. Complete Example

```javascript
import { TaskBoard, Panel } from '@bryntum/taskboard';

// Config Panel Widget
class ConfigPanel extends Panel {
    static $name = 'ConfigPanel';
    static type = 'configpanel';

    static configurable = {
        title: 'Configuration',
        width: 280,
        collapsible: true,

        items: {
            features: {
                type: 'fieldset',
                title: 'Features',
                items: {
                    taskDrag: { type: 'checkbox', label: 'Task Drag', checked: true, onChange: 'up.onFeatureChange' },
                    columnDrag: { type: 'checkbox', label: 'Column Drag', checked: true, onChange: 'up.onFeatureChange' },
                    taskMenu: { type: 'checkbox', label: 'Task Menu', checked: true, onChange: 'up.onFeatureChange' },
                    taskEdit: { type: 'checkbox', label: 'Task Edit', checked: true, onChange: 'up.onFeatureChange' }
                }
            },
            visual: {
                type: 'fieldset',
                title: 'Visual',
                items: {
                    columnWidth: {
                        type: 'slider',
                        label: 'Column Width',
                        min: 200, max: 500, value: 300,
                        onInput: 'up.onColumnWidth'
                    },
                    showSwimlanes: {
                        type: 'checkbox',
                        label: 'Show Swimlanes',
                        checked: true,
                        onChange: 'up.onSwimlanesToggle'
                    }
                }
            },
            presets: {
                type: 'fieldset',
                title: 'Presets',
                items: {
                    preset: {
                        type: 'buttongroup',
                        items: [
                            { text: 'Compact', onClick: 'up.applyCompact' },
                            { text: 'Detailed', onClick: 'up.applyDetailed' }
                        ]
                    }
                }
            }
        }
    };

    construct(config) {
        super.construct(config);
        this.taskBoard = config.taskBoard;
    }

    onFeatureChange({ source, checked }) {
        this.taskBoard.features[source.ref].disabled = !checked;
    }

    onColumnWidth({ value }) {
        this.taskBoard.columns.forEach(col => col.width = value);
    }

    onSwimlanesToggle({ checked }) {
        this.taskBoard.swimlaneField = checked ? 'prio' : null;
    }

    applyCompact() {
        this.taskBoard.taskHeight = 60;
        this.taskBoard.columns.forEach(c => c.width = 250);
        this.widgetMap.columnWidth.value = 250;
    }

    applyDetailed() {
        this.taskBoard.taskHeight = 120;
        this.taskBoard.columns.forEach(c => c.width = 400);
        this.widgetMap.columnWidth.value = 400;
    }
}

ConfigPanel.initClass();

// TaskBoard
const taskBoard = new TaskBoard({
    appendTo: 'main',

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

    swimlaneField: 'prio',
    swimlanes: [
        { id: 'high', text: 'High' },
        { id: 'medium', text: 'Medium' },
        { id: 'low', text: 'Low' }
    ],

    tbar: {
        items: {
            settings: {
                type: 'button',
                icon: 'b-icon-settings',
                text: 'Settings',
                onClick() {
                    configPanel.collapsed = !configPanel.collapsed;
                }
            }
        }
    }
});

// Config Panel
const configPanel = new ConfigPanel({
    appendTo: 'sidebar',
    taskBoard,
    collapsed: true
});
```

---

## Referenties

- Examples: `taskboard-7.1.0-trial/examples/config-panel/`
- Widget: Panel
- API: TaskBoard.features
- Config: swimlaneField, columns, taskHeight

---

*Document gegenereerd: December 2024*
*Bryntum TaskBoard versie: 7.1.0*
