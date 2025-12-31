# Bryntum Angular Integration - Official Guide

> **Bron**: Officiële Bryntum Gantt v7.1.0 documentatie - `docs/data/Gantt/guides/integration/angular/guide.md`

---

## Version Requirements

### Minimum Supported
- Angular: `9.0.0` or higher
- TypeScript: `3.6.0` or higher
- Vite: `4.0.0` or higher

### Recommended
- Angular: `12.0.0` or higher
- TypeScript: `4.0.0` or higher
- Vite: `5.0.0` or higher

---

## NPM Packages

### IVY Package (Angular 12+) - Recommended

```bash
npm install @bryntum/gantt-angular@7.1.0
```

```typescript
import { BryntumGanttComponent } from '@bryntum/gantt-angular';
```

### View Engine Package (Angular 9-11)

```bash
npm install @bryntum/gantt-angular-view@7.1.0
```

```typescript
import { BryntumGanttComponent } from '@bryntum/gantt-angular-view';
```

### NPM Aliasing (View Engine met @bryntum/gantt-angular import)

```bash
npm install @bryntum/gantt-angular@npm@bryntum/gantt-angular-view@7.1.0
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
| `<bryntum-text-area-picker-field/>` | TextAreaPickerField |
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

### Gantt-Specific Fields

| Wrapper Tag | API Reference |
|-------------|---------------|
| `<bryntum-assignment-field/>` | AssignmentField |
| `<bryntum-dependency-field/>` | DependencyField |
| `<bryntum-calendar-picker/>` | CalendarPicker |

### Scheduler/SchedulerPro Fields

| Wrapper Tag | API Reference |
|-------------|---------------|
| `<bryntum-calendar-editor/>` | CalendarEditor |
| `<bryntum-calendar-field/>` | CalendarField |
| `<bryntum-constraint-type-picker/>` | ConstraintTypePicker |
| `<bryntum-cost-accrual-field/>` | CostAccrualField |
| `<bryntum-dependency-type-picker/>` | DependencyTypePicker |
| `<bryntum-effort-field/>` | EffortField |
| `<bryntum-end-date-field/>` | EndDateField |
| `<bryntum-start-date-field/>` | StartDateField |
| `<bryntum-event-color-field/>` | EventColorField |
| `<bryntum-model-combo/>` | ModelCombo |
| `<bryntum-project-combo/>` | ProjectCombo |
| `<bryntum-rate-table-field/>` | RateTableField |
| `<bryntum-resource-combo/>` | ResourceCombo |
| `<bryntum-resource-editor/>` | ResourceEditor |
| `<bryntum-resource-filter/>` | ResourceFilter |
| `<bryntum-resource-type-field/>` | ResourceTypeField |
| `<bryntum-scheduling-direction-picker/>` | SchedulingDirectionPicker |
| `<bryntum-scheduling-mode-picker/>` | SchedulingModePicker |

### Pickers

| Wrapper Tag | API Reference |
|-------------|---------------|
| `<bryntum-date-picker/>` | DatePicker |
| `<bryntum-date-range-field/>` | DateRangeField |
| `<bryntum-month-picker/>` | MonthPicker |
| `<bryntum-year-picker/>` | YearPicker |
| `<bryntum-time-picker/>` | TimePicker |
| `<bryntum-scheduler-date-picker/>` | SchedulerDatePicker |

### Layout & Container

| Wrapper Tag | API Reference |
|-------------|---------------|
| `<bryntum-container/>` | Container |
| `<bryntum-panel/>` | Panel |
| `<bryntum-tab-panel/>` | TabPanel |
| `<bryntum-toolbar/>` | Toolbar |
| `<bryntum-field-set/>` | FieldSet |
| `<bryntum-splitter/>` | Splitter |

### Buttons & Controls

| Wrapper Tag | API Reference |
|-------------|---------------|
| `<bryntum-button/>` | Button |
| `<bryntum-button-group/>` | ButtonGroup |
| `<bryntum-undo-redo/>` | UndoRedo |
| `<bryntum-view-preset-combo/>` | ViewPresetCombo |

### Advanced Widgets

| Wrapper Tag | API Reference |
|-------------|---------------|
| `<bryntum-a-i-filter-field/>` | AIFilterField |
| `<bryntum-chat-panel/>` | ChatPanel |
| `<bryntum-chip-view/>` | ChipView |
| `<bryntum-code-editor/>` | CodeEditor |
| `<bryntum-demo-code-editor/>` | DemoCodeEditor |
| `<bryntum-editor/>` | Editor |
| `<bryntum-file-picker/>` | FilePicker |
| `<bryntum-grid-chart-designer/>` | GridChartDesigner |
| `<bryntum-group-bar/>` | GroupBar |
| `<bryntum-hint/>` | Hint |
| `<bryntum-label/>` | Label |
| `<bryntum-list/>` | List |
| `<bryntum-menu/>` | Menu |
| `<bryntum-paging-toolbar/>` | PagingToolbar |
| `<bryntum-timeline/>` | Timeline |
| `<bryntum-tree-combo/>` | TreeCombo |
| `<bryntum-version-grid/>` | VersionGrid |
| `<bryntum-widget/>` | Widget |

### Filter Components

| Wrapper Tag | API Reference |
|-------------|---------------|
| `<bryntum-field-filter-picker/>` | FieldFilterPicker |
| `<bryntum-field-filter-picker-group/>` | FieldFilterPickerGroup |
| `<bryntum-grid-field-filter-picker/>` | GridFieldFilterPicker |
| `<bryntum-grid-field-filter-picker-group/>` | GridFieldFilterPickerGroup |
| `<bryntum-checklist-filter-combo/>` | ChecklistFilterCombo |

---

## Module Setup

### app.module.ts

```typescript
import { BryntumGanttModule } from '@bryntum/gantt-angular';

@NgModule({
    imports: [
        BryntumGanttModule
    ]
})
export class AppModule { }
```

---

## Basic Usage

### app.component.html

```html
<bryntum-gantt
    #gantt
    tooltip="My cool Bryntum Gantt component"
    (onCatchAll)="onGanttEvents($event)"
></bryntum-gantt>
```

### CSS/SCSS Imports (src/styles.scss)

```scss
// FontAwesome for icons
@import "@bryntum/gantt/fontawesome/css/fontawesome.css";
@import "@bryntum/gantt/fontawesome/css/solid.css";

// Structural CSS
@import "@bryntum/gantt/gantt.css";

// Theme (choose one)
@import "@bryntum/gantt/material3-light.css";
// @import "@bryntum/gantt/material3-dark.css";
// @import "@bryntum/gantt/stockholm-light.css";
// @import "@bryntum/gantt/stockholm-dark.css";
// @import "@bryntum/gantt/svalbard-light.css";
// @import "@bryntum/gantt/svalbard-dark.css";
// @import "@bryntum/gantt/visby-light.css";
// @import "@bryntum/gantt/visby-dark.css";
```

---

## TypeScript Support

### Store Creation with Types

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

## Embedding Toolbar in Gantt

### app.component.ts

```typescript
export class AppComponent {
    tbarConfig = {
        items: {
            myButton: {
                type: 'button',
                text: 'My button'
            }
        }
    };
}
```

### app.component.html

```html
<bryntum-gantt
    #gantt
    [tbar]="tbarConfig"
></bryntum-gantt>
```

---

## View Encapsulation

### ViewEncapsulation.None (Full Support)

Easiest approach - no CSS class modifications. Import theme anywhere.

### ViewEncapsulation.Emulated (Partial Support)

Default Angular encapsulation. **Must import theme in global `styles.scss`** because Bryntum generates HTML outside Angular's control.

### ViewEncapsulation.ShadowDom (Full Support with Font Config)

Theme **must** be imported in component's SCSS file. Fonts need special handling.

#### Method 1: Font Faces in styles.scss

```scss
@font-face {
    font-family: Roboto;
    font-style: normal;
    font-weight: 400;
    src:
        url("../node_modules/@bryntum/gantt/fonts/Roboto-Regular.woff2") format("woff2"),
        url("../node_modules/@bryntum/gantt/fonts/Roboto-Regular.woff") format("woff");
}

@font-face {
    font-family: "Font Awesome 6 Free";
    font-style: normal;
    font-weight: 900;
    font-display: block;
    src:
        url("../node_modules/@bryntum/gantt/fonts/fa-solid-900.woff2") format("woff2"),
        url("../node_modules/@bryntum/gantt/fonts/fa-solid-900.ttf") format("truetype");
}
```

#### Method 2: Runtime Font Loading in ngAfterViewInit

```typescript
ngAfterViewInit(): void {
    document.fonts.add(new FontFace('FontAwesome6Free', `url(assets/fonts/fa-solid-900.woff2)`));
    document.fonts.add(new FontFace('Roboto', `url(assets/fonts/Roboto-Regular.woff2)`));
}
```

**tsconfig.json adjustment:**

```json
{
    "compilerOptions": {
        "lib": ["ES2022", "dom", "DOM.Iterable"]
    }
}
```

**angular.json assets config:**

```json
{
    "assets": [
        "src/assets",
        {
            "glob": "**/*",
            "input": "node_modules/@bryntum/gantt/fonts",
            "output": "assets/fonts"
        }
    ]
}
```

---

## Angular Component Renderers

### 1. Create Renderer Component

```typescript
// tooltip-renderer.component.ts
import { Component, Input } from '@angular/core';

@Component({
    selector: 'event-tooltip-renderer',
    template: `
        <h3>Custom tooltip</h3>
        <p>Destination: {{ destination }}</p>
    `
})
export class ToolTipRenderer {
    @Input() destination: string;
}
```

### 2. Register as Custom Element (app.module.ts)

```typescript
import { ToolTipRenderer } from './tooltip-renderer/tooltip-renderer.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
    declarations: [
        AppComponent,
        ToolTipRenderer
    ],
    entryComponents: [
        ToolTipRenderer
    ],
    imports: [
        BrowserModule,
        BryntumGanttModule
    ]
})
export class AppModule {
    constructor(injector: Injector) {
        customElements.define('tooltip-renderer', createCustomElement(ToolTipRenderer, { injector }));
    }
}
```

### 3. Use in Feature Config

```typescript
features: {
    cellTooltip: {
        tooltipRenderer: ({ record, column }) => {
            return `
                <tooltip-renderer
                    destination="${record.destination}">
                </tooltip-renderer>
            `;
        }
    }
}
```

### Column Renderer Example

```typescript
columns: [
    {
        text: 'Angular Component',
        field: 'color',
        htmlEncode: false,
        renderer(data: any) {
            const { record, value } = data;
            return `<color-renderer value="${value.toLowerCase()}" name="${record.name}"></color-renderer>`;
        }
    }
]
```

---

## Feature Configuration

### Complete Feature List (with `Feature` suffix)

| Feature Name | API Reference |
|--------------|---------------|
| `aiFilterFeature` | AIFilter |
| `baselinesFeature` | Baselines |
| `cellCopyPasteFeature` | CellCopyPaste |
| `cellEditFeature` | CellEdit |
| `cellMenuFeature` | CellMenu |
| `cellTooltipFeature` | CellTooltip |
| `chartsFeature` | Charts |
| `columnAutoWidthFeature` | ColumnAutoWidth |
| `columnDragToolbarFeature` | ColumnDragToolbar |
| `columnLinesFeature` | ColumnLines |
| `columnPickerFeature` | ColumnPicker |
| `columnRenameFeature` | ColumnRename |
| `columnReorderFeature` | ColumnReorder |
| `columnResizeFeature` | ColumnResize |
| `criticalPathsFeature` | CriticalPaths |
| `dependenciesFeature` | Dependencies |
| `dependencyEditFeature` | DependencyEdit |
| `eventFilterFeature` | EventFilter |
| `eventSegmentsFeature` | EventSegments |
| `excelExporterFeature` | ExcelExporter (experimental) |
| `fileDropFeature` | FileDrop (experimental) |
| `fillHandleFeature` | FillHandle |
| `filterFeature` | Filter |
| `filterBarFeature` | FilterBar |
| `groupFeature` | Group |
| `groupSummaryFeature` | GroupSummary |
| `headerMenuFeature` | HeaderMenu |
| `headerZoomFeature` | HeaderZoom |
| `indicatorsFeature` | Indicators |
| `labelsFeature` | Labels |
| `lockRowsFeature` | LockRows |
| `mergeCellsFeature` | MergeCells |
| `mspExportFeature` | MspExport |
| `nonWorkingTimeFeature` | NonWorkingTime |
| `panFeature` | Pan |
| `parentAreaFeature` | ParentArea |
| `pdfExportFeature` | PdfExport |
| `percentBarFeature` | PercentBar |
| `pinColumnsFeature` | PinColumns |
| `printFeature` | Print |
| `progressLineFeature` | ProgressLine |
| `projectEditFeature` | ProjectEdit |
| `projectLinesFeature` | ProjectLines |
| `quickFindFeature` | QuickFind |
| `regionResizeFeature` | RegionResize |
| `rollupsFeature` | Rollups |
| `rowCopyPasteFeature` | RowCopyPaste |
| `rowEditFeature` | RowEdit |
| `rowExpanderFeature` | RowExpander |
| `rowReorderFeature` | RowReorder |
| `rowResizeFeature` | RowResize |
| `scheduleMenuFeature` | ScheduleMenu |
| `scheduleTooltipFeature` | ScheduleTooltip |
| `scrollButtonsFeature` | ScrollButtons |
| `searchFeature` | Search |
| `sortFeature` | Sort |
| `splitFeature` | Split |
| `stickyCellsFeature` | StickyCells |
| `stripeFeature` | Stripe |
| `summaryFeature` | Summary |
| `taskCopyPasteFeature` | TaskCopyPaste |
| `taskDragFeature` | TaskDrag |
| `taskDragCreateFeature` | TaskDragCreate |
| `taskEditFeature` | TaskEdit |
| `taskMenuFeature` | TaskMenu |
| `taskNonWorkingTimeFeature` | TaskNonWorkingTime |
| `taskResizeFeature` | TaskResize |
| `taskSegmentDragFeature` | TaskSegmentDrag |
| `taskSegmentResizeFeature` | TaskSegmentResize |
| `taskTooltipFeature` | TaskTooltip |
| `timeAxisHeaderMenuFeature` | TimeAxisHeaderMenu |
| `timelineChartFeature` | TimelineChart |
| `timeRangesFeature` | TimeRanges |
| `timeSpanHighlightFeature` | TimeSpanHighlight |
| `treeFeature` | Tree |
| `treeGroupFeature` | TreeGroup |
| `versionsFeature` | Versions |

### Disabling Features

```typescript
const ganttProps = {
    columnLinesFeature: false
};
```

### Enabling Features with Config

```typescript
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

### app.component.html

```html
<bryntum-gantt
    #gantt
    tooltip="My cool Bryntum Gantt component"
></bryntum-gantt>
```

### app.component.ts

```typescript
import { BryntumGanttComponent } from '@bryntum/gantt-angular';
import { Gantt } from '@bryntum/gantt';

export class AppComponent implements AfterViewInit {
    @ViewChild(BryntumGanttComponent, { static: false }) ganttComponent: BryntumGanttComponent;

    private gantt: Gantt;

    ngAfterViewInit(): void {
        // Store Bryntum Gantt instance
        this.gantt = this.ganttComponent.instance;
    }
}
```

---

## Build Commands

### Development

```bash
npm install
npm run start
```

Local server at http://localhost:4200

### Production

```bash
npm install
npm run build
```

Output in `dist` folder.

---

## Demo Locations

Angular demos in distribution: `examples/frameworks/angular/`

Online demos: https://bryntum.com/products/gantt/examples/?framework=angular

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
