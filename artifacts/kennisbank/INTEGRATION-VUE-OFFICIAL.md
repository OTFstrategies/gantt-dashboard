# Bryntum Vue Integration - Official Guide

> **Bron**: Officiële Bryntum Gantt v7.1.0 documentatie - `docs/data/Gantt/guides/integration/vue/guide.md`

---

## Version Requirements

### Minimum Supported
- Vue: `3.0.0` or higher
- TypeScript: `3.6.0` or higher
- Vite: `4.0.0` or higher

### Recommended
- Vue: `3.0.0` or higher
- TypeScript: `4.0.0` or higher
- Vite: `5.0.0` or higher

**Note**: Vue 2 has reached end of life. Bryntum no longer maintains guides or components for Vue 2.

---

## NPM Package

### Vue 3

```bash
npm install @bryntum/gantt-vue
```

### Native API Import

```javascript
import { Gantt } from '@bryntum/gantt';
```

---

## Complete Wrapper Tag Reference

### Core Gantt Components

| Wrapper Tag | API Reference |
|-------------|---------------|
| `<bryntum-gantt/>` | Gantt |
| `<bryntum-gantt-base/>` | GanttBase |
| `<bryntum-gantt-project-model/>` | ProjectModel |

### Grid Components

| Wrapper Tag | API Reference |
|-------------|---------------|
| `<bryntum-grid/>` | Grid |
| `<bryntum-grid-base/>` | GridBase |
| `<bryntum-tree-grid/>` | TreeGrid |
| `<bryntum-assignment-grid/>` | AssignmentGrid |
| `<bryntum-resource-grid/>` | ResourceGrid |

### Scheduler Components

| Wrapper Tag | API Reference |
|-------------|---------------|
| `<bryntum-scheduler/>` | Scheduler |
| `<bryntum-scheduler-base/>` | SchedulerBase |
| `<bryntum-scheduler-pro/>` | SchedulerPro |
| `<bryntum-scheduler-pro-base/>` | SchedulerProBase |
| `<bryntum-resource-histogram/>` | ResourceHistogram |
| `<bryntum-resource-utilization/>` | ResourceUtilization |
| `<bryntum-timeline-histogram/>` | TimelineHistogram |

### Form Fields

| Wrapper Tag | API Reference |
|-------------|---------------|
| `<bryntum-text-field/>` | TextField |
| `<bryntum-text-area-field/>` | TextAreaField |
| `<bryntum-number-field/>` | NumberField |
| `<bryntum-date-field/>` | DateField |
| `<bryntum-date-time-field/>` | DateTimeField |
| `<bryntum-time-field/>` | TimeField |
| `<bryntum-duration-field/>` | DurationField |
| `<bryntum-password-field/>` | PasswordField |
| `<bryntum-checkbox/>` | Checkbox |
| `<bryntum-checkbox-group/>` | CheckboxGroup |
| `<bryntum-radio/>` | Radio |
| `<bryntum-radio-group/>` | RadioGroup |
| `<bryntum-combo/>` | Combo |
| `<bryntum-color-field/>` | ColorField |
| `<bryntum-file-field/>` | FileField |
| `<bryntum-filter-field/>` | FilterField |
| `<bryntum-display-field/>` | DisplayField |
| `<bryntum-slider/>` | Slider |
| `<bryntum-slide-toggle/>` | SlideToggle |

### Complete Wrapper List

```
bryntum-a-i-filter-field, bryntum-assignment-field, bryntum-assignment-grid,
bryntum-button, bryntum-button-group, bryntum-calendar-editor, bryntum-calendar-field,
bryntum-calendar-picker, bryntum-chat-panel, bryntum-checkbox, bryntum-checkbox-group,
bryntum-checklist-filter-combo, bryntum-chip-view, bryntum-code-editor, bryntum-color-field,
bryntum-combo, bryntum-constraint-type-picker, bryntum-container, bryntum-cost-accrual-field,
bryntum-date-field, bryntum-date-picker, bryntum-date-range-field, bryntum-date-time-field,
bryntum-demo-code-editor, bryntum-dependency-field, bryntum-dependency-type-picker,
bryntum-display-field, bryntum-duration-field, bryntum-editor, bryntum-effort-field,
bryntum-end-date-field, bryntum-event-color-field, bryntum-field-filter-picker,
bryntum-field-filter-picker-group, bryntum-field-set, bryntum-file-field, bryntum-file-picker,
bryntum-filter-field, bryntum-gantt, bryntum-gantt-base, bryntum-grid, bryntum-grid-base,
bryntum-grid-chart-designer, bryntum-grid-field-filter-picker, bryntum-grid-field-filter-picker-group,
bryntum-group-bar, bryntum-hint, bryntum-label, bryntum-list, bryntum-menu, bryntum-model-combo,
bryntum-month-picker, bryntum-number-field, bryntum-paging-toolbar, bryntum-panel,
bryntum-password-field, bryntum-project-combo, bryntum-gantt-project-model, bryntum-radio,
bryntum-radio-group, bryntum-rate-table-field, bryntum-resource-combo, bryntum-resource-editor,
bryntum-resource-filter, bryntum-resource-grid, bryntum-resource-histogram,
bryntum-resource-type-field, bryntum-resource-utilization, bryntum-scheduler,
bryntum-scheduler-base, bryntum-scheduler-date-picker, bryntum-scheduler-pro,
bryntum-scheduler-pro-base, bryntum-scheduling-direction-picker, bryntum-scheduling-mode-picker,
bryntum-slider, bryntum-slide-toggle, bryntum-splitter, bryntum-start-date-field,
bryntum-tab-panel, bryntum-text-area-field, bryntum-text-area-picker-field, bryntum-text-field,
bryntum-time-field, bryntum-timeline, bryntum-timeline-histogram, bryntum-time-picker,
bryntum-toolbar, bryntum-tree-combo, bryntum-tree-grid, bryntum-undo-redo, bryntum-version-grid,
bryntum-view-preset-combo, bryntum-widget, bryntum-year-picker
```

---

## Basic Usage

### App.vue

```html
<template>
    <bryntum-gantt
        ref="gantt"
        tooltip="ganttConfig.tooltip"
        v-bind="ganttConfig"
        @click="onClick"
    />
</template>

<script>
import { BryntumGantt } from '@bryntum/gantt-vue';
import { ganttConfig } from './AppConfig';
import './components/ColorColumn.js';

export default {
    name: 'app',
    components: {
        BryntumGantt
    },
    data() {
        return { ganttConfig };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
```

### AppConfig.js

```javascript
export const ganttConfig = {
    tooltip: "My cool Bryntum Gantt component"
    // Bryntum Gantt config options
};
```

---

## CSS Imports (App.scss)

```scss
/* FontAwesome for icons */
@import "~@bryntum/gantt/fontawesome/css/fontawesome.css";
@import "~@bryntum/gantt/fontawesome/css/solid.css";

/* Structural CSS */
@import "~@bryntum/gantt/gantt.css";

/* Theme (pick one) */
@import "~@bryntum/gantt/svalbard-light.css";
```

**Note**: Add `sass-loader` to package.json for SCSS support.

---

## Embedding Toolbar

### AppConfig.js

```javascript
export const ganttConfig = {
    tbar: {
        items: {
            myButton: {
                type: 'button',
                text: 'My button'
            }
        }
    }
    // Bryntum Gantt config options
};
```

---

## Data Binding

### syncDataOnLoad

Wrapper stores enable `syncDataOnLoad` by default for Vue column renderer updates.

**Important for Vue 3**: Avoid using `ref` to access any store (eventStore, resourceStore, etc.). Vue 3 wraps objects in JavaScript Proxy, causing unexpected issues. Instead, access higher-level component (Grid, Scheduler, Gantt) first, then access the store.

---

## Vue Components in Cells

### 1. Register Component Globally (main.js)

```javascript
import Vue from 'vue';
import App from './App.vue';

import BlueButton from './components/BlueButton.vue';
import RedButton from './components/RedButton.vue';
import PercentBar from './components/PercentBar.vue';

// Register components globally for renderers
Vue.component('BlueButton', BlueButton);
Vue.component('RedButton', RedButton);
Vue.component('PercentBar', PercentBar);
```

### BlueButton.vue Example

```html
<template>
    <button class="b-button b-blue" @click="click($event)">
        <span>{{ htmlText }}</span>
    </button>
</template>

<script>
import { StringHelper } from '@bryntum/gantt';

export default {
    name: 'BlueButton',
    props: ['record', 'clickHandler'],
    computed: {
        htmlText() {
            return StringHelper.encodeHtml(this.record.city);
        }
    },
    methods: {
        click() {
            this.clickHandler(this.htmlText, 'b-blue');
        }
    }
};
</script>
```

### 2. Configure Column Renderer

```javascript
{
    text: 'Button',
    field: 'city',
    vue: true,  // Required flag
    renderer({ grid: { extraData: { clickHandler } }, record }) {
        return {
            is: 'BlueButton',  // Required: component name from main.js
            record,
            clickHandler
        };
    }
}
```

**Required**: `vue: true` flag and `is` property.

### 3. Implement Handler Methods

```html
<template>
    <div id="container">
        <bryntum-gantt
            v-bind="ganttConfig"
            :extraData="extraData"
        />
    </div>
</template>

<script>
import { BryntumGantt } from '@bryntum/gantt-vue';
import { Toast } from '@bryntum/gantt';
import { ganttConfig } from './AppConfig';

export default {
    name: 'App',
    components: { BryntumGantt },
    data() {
        return {
            ganttConfig,
            extraData: { clickHandler: this.clickHandler }
        };
    },
    methods: {
        clickHandler: (html, color) => {
            Toast.show({ html, color, timeout: 3000 });
        }
    }
};
</script>
```

---

## Vue Components in Widgets & Tooltips

### Cell Tooltip

```javascript
cellTooltipFeature: {
    tooltipRenderer({ record }) {
        return {
            vue: true,   // Required flag
            is: 'VueTooltip',
            bind: { record }
        };
    }
}
```

### Widget with Vue Component

```javascript
const propHello = ref('Hello');
const propWorld = ref('world!');

function handleMyClick() {
    // ...
}

const bbar = {
    items: {
        myWidget: {
            type: 'widget',
            html: {
                vue: true,     // Required flag
                is: 'VueWidget',
                bind: { propHello, propWorld },
                on: { myclick: handleMyClick }
            }
        }
    }
};
```

Properties passed via `bind` are reactive. Custom events are bound via `on`.

---

## Using dataChange Event

```html
<template>
    <div>
        <bryntum-gantt
            ref="gantt"
            v-bind="ganttConfig"
            @datachange="syncData"
        />
    </div>
</template>

<script>
import { BryntumGantt } from "@bryntum/gantt-vue";
import { ganttConfig } from "./AppConfig.js";

export default {
    name: "App",
    components: { BryntumGantt },
    methods: {
        syncData({ store, action, records }) {
            console.log(`${store.id} changed. Action: ${action}. Records:`, records);
            // Sync logic here
        }
    },
    data() {
        return { ganttConfig };
    }
};
</script>
```

### Wrapper Config

- `relayStoreEvents`: Set to `true` to relay store events to Gantt instance. Note: `dataChange` fires twice if true. Defaults to `false`.

---

## Feature Configuration (Vue Syntax)

### Feature List (kebab-case with `:` prefix)

| Vue Feature | API Reference |
|-------------|---------------|
| `:ai-filter-feature` | AIFilter |
| `:baselines-feature` | Baselines |
| `:cell-copy-paste-feature` | CellCopyPaste |
| `:cell-edit-feature` | CellEdit |
| `:cell-menu-feature` | CellMenu |
| `:cell-tooltip-feature` | CellTooltip |
| `:charts-feature` | Charts |
| `:column-auto-width-feature` | ColumnAutoWidth |
| `:column-drag-toolbar-feature` | ColumnDragToolbar |
| `:column-lines-feature` | ColumnLines |
| `:column-picker-feature` | ColumnPicker |
| `:column-rename-feature` | ColumnRename |
| `:column-reorder-feature` | ColumnReorder |
| `:column-resize-feature` | ColumnResize |
| `:critical-paths-feature` | CriticalPaths |
| `:dependencies-feature` | Dependencies |
| `:dependency-edit-feature` | DependencyEdit |
| `:event-filter-feature` | EventFilter |
| `:event-segments-feature` | EventSegments |
| `:excel-exporter-feature` | ExcelExporter |
| `:file-drop-feature` | FileDrop |
| `:fill-handle-feature` | FillHandle |
| `:filter-feature` | Filter |
| `:filter-bar-feature` | FilterBar |
| `:group-feature` | Group |
| `:group-summary-feature` | GroupSummary |
| `:header-menu-feature` | HeaderMenu |
| `:header-zoom-feature` | HeaderZoom |
| `:indicators-feature` | Indicators |
| `:labels-feature` | Labels |
| `:lock-rows-feature` | LockRows |
| `:merge-cells-feature` | MergeCells |
| `:msp-export-feature` | MspExport |
| `:non-working-time-feature` | NonWorkingTime |
| `:pan-feature` | Pan |
| `:parent-area-feature` | ParentArea |
| `:pdf-export-feature` | PdfExport |
| `:percent-bar-feature` | PercentBar |
| `:pin-columns-feature` | PinColumns |
| `:print-feature` | Print |
| `:progress-line-feature` | ProgressLine |
| `:project-edit-feature` | ProjectEdit |
| `:project-lines-feature` | ProjectLines |
| `:quick-find-feature` | QuickFind |
| `:region-resize-feature` | RegionResize |
| `:rollups-feature` | Rollups |
| `:row-copy-paste-feature` | RowCopyPaste |
| `:row-edit-feature` | RowEdit |
| `:row-expander-feature` | RowExpander |
| `:row-reorder-feature` | RowReorder |
| `:row-resize-feature` | RowResize |
| `:schedule-menu-feature` | ScheduleMenu |
| `:schedule-tooltip-feature` | ScheduleTooltip |
| `:scroll-buttons-feature` | ScrollButtons |
| `:search-feature` | Search |
| `:sort-feature` | Sort |
| `:split-feature` | Split |
| `:sticky-cells-feature` | StickyCells |
| `:stripe-feature` | Stripe |
| `:summary-feature` | Summary |
| `:task-copy-paste-feature` | TaskCopyPaste |
| `:task-drag-feature` | TaskDrag |
| `:task-drag-create-feature` | TaskDragCreate |
| `:task-edit-feature` | TaskEdit |
| `:task-menu-feature` | TaskMenu |
| `:task-non-working-time-feature` | TaskNonWorkingTime |
| `:task-resize-feature` | TaskResize |
| `:task-segment-drag-feature` | TaskSegmentDrag |
| `:task-segment-resize-feature` | TaskSegmentResize |
| `:task-tooltip-feature` | TaskTooltip |
| `:time-axis-header-menu-feature` | TimeAxisHeaderMenu |
| `:timeline-chart-feature` | TimelineChart |
| `:time-ranges-feature` | TimeRanges |
| `:time-span-highlight-feature` | TimeSpanHighlight |
| `:tree-feature` | Tree |
| `:tree-group-feature` | TreeGroup |
| `:versions-feature` | Versions |

### Disabling Features

```javascript
const ganttProps = {
    columnLinesFeature: false
};
```

### Enabling with Config

```javascript
const ganttProps = {
    labelsFeature: {
        before: {
            field: 'name',
            editor: {
                type: 'textfield'
            }
        }
    }
};
```

---

## Accessing Bryntum Instance

### Vue 2

```html
<template>
    <bryntum-gantt ref="gantt" v-bind="ganttProps" />
</template>

<script>
import { BryntumGantt } from '@bryntum/gantt-vue';
import { ganttConfig } from './GanttConfig';

export default {
    name: 'App',
    components: { BryntumGantt },
    data() {
        return { ganttConfig };
    },
    methods: {
        doSomething() {
            // Access instance
            const ganttInstance = this.$refs.gantt.instance;

            // WARNING: Do NOT assign to this.ganttInstance
            // Vue wraps with Proxy, causing issues
        }
    }
};
</script>
```

### Vue 3

```html
<template>
    <bryntum-gantt ref="gantt" v-bind="ganttConfig" />
</template>

<script>
import { ref, reactive } from 'vue';
import { BryntumGantt } from '@bryntum/gantt-vue-3';
import { useGanttProps } from './GanttConfig';

export default {
    name: 'App',
    components: { BryntumGantt },
    setup() {
        const gantt = ref(null);
        const ganttProps = reactive(useGanttProps());

        function doSomething() {
            // Access instance in Vue 3
            const ganttInstance = gantt.value.instance.value;

            // WARNING: Do NOT assign to this.ganttInstance
            // Vue wraps with Proxy, causing issues
        }

        return {
            gantt,
            ganttProps,
            doSomething
        };
    }
};
</script>
```

---

## TypeScript Support

### Store Creation

```typescript
import { Store, StoreConfig, ModelConfig } from '@bryntum/gantt';

const storeConfig: StoreConfig = {
    tree: true,
    data: [
        {
            id: 1,
            children: [
                { id: 2 }
            ] as ModelConfig[]
        }
    ] as ModelConfig[]
};

new Store(storeConfig);
```

---

## Build Commands

### Development

```bash
npm install
npm run start
```

Local server at http://127.0.0.1:8080

### Production

```bash
npm install
npm run build
```

---

## Demo Locations

Vue demos in distribution:
- Vue 2: `examples/frameworks/vue/`
- Vue 3: `examples/frameworks/vue-3/`

Online demos: https://bryntum.com/products/gantt/examples/?framework=vue

---

## Key Differences: Vue 2 vs Vue 3

| Aspect | Vue 2 | Vue 3 |
|--------|-------|-------|
| Package | `@bryntum/gantt-vue` | `@bryntum/gantt-vue-3` |
| Instance Access | `this.$refs.gantt.instance` | `gantt.value.instance.value` |
| Composition API | Options API | `setup()` with `ref()`, `reactive()` |
| Component Registration | `Vue.component()` | `app.component()` |

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
