# Bryntum React Integration - Official Guide

> **Bron**: Officiële Bryntum Gantt v7.1.0 documentatie - `docs/data/Gantt/guides/integration/react/guide.md`

---

## Version Requirements

### Minimum Supported
- React: `16.0.0` or higher
- TypeScript: `3.6.0` or higher
- Vite: `4.0.0` or higher

### Recommended
- React: `18.0.0` or higher
- TypeScript: `4.0.0` or higher
- Vite: `5.0.0` or higher

---

## NPM Package

```bash
npm install @bryntum/gantt-react
```

### Native API Import

```javascript
import { Gantt } from '@bryntum/gantt';
```

---

## Complete Wrapper Reference

### Core Gantt Components

| Wrapper Component | API Reference |
|-------------------|---------------|
| `<BryntumGantt/>` | Gantt |
| `<BryntumGanttBase/>` | GanttBase |
| `<BryntumGanttProjectModel/>` | ProjectModel |

### Grid Components

| Wrapper Component | API Reference |
|-------------------|---------------|
| `<BryntumGrid/>` | Grid |
| `<BryntumGridBase/>` | GridBase |
| `<BryntumTreeGrid/>` | TreeGrid |
| `<BryntumAssignmentGrid/>` | AssignmentGrid |
| `<BryntumResourceGrid/>` | ResourceGrid |

### Scheduler Components

| Wrapper Component | API Reference |
|-------------------|---------------|
| `<BryntumScheduler/>` | Scheduler |
| `<BryntumSchedulerBase/>` | SchedulerBase |
| `<BryntumSchedulerPro/>` | SchedulerPro |
| `<BryntumSchedulerProBase/>` | SchedulerProBase |
| `<BryntumResourceHistogram/>` | ResourceHistogram |
| `<BryntumResourceUtilization/>` | ResourceUtilization |
| `<BryntumTimelineHistogram/>` | TimelineHistogram |

### Form Fields

| Wrapper Component | API Reference |
|-------------------|---------------|
| `<BryntumTextField/>` | TextField |
| `<BryntumTextAreaField/>` | TextAreaField |
| `<BryntumTextAreaPickerField/>` | TextAreaPickerField |
| `<BryntumNumberField/>` | NumberField |
| `<BryntumDateField/>` | DateField |
| `<BryntumDateTimeField/>` | DateTimeField |
| `<BryntumTimeField/>` | TimeField |
| `<BryntumDurationField/>` | DurationField |
| `<BryntumPasswordField/>` | PasswordField |
| `<BryntumCheckbox/>` | Checkbox |
| `<BryntumCheckboxGroup/>` | CheckboxGroup |
| `<BryntumRadio/>` | Radio |
| `<BryntumRadioGroup/>` | RadioGroup |
| `<BryntumCombo/>` | Combo |
| `<BryntumColorField/>` | ColorField |
| `<BryntumFileField/>` | FileField |
| `<BryntumFilterField/>` | FilterField |
| `<BryntumDisplayField/>` | DisplayField |
| `<BryntumSlider/>` | Slider |
| `<BryntumSlideToggle/>` | SlideToggle |

### All Wrapper Components (Complete List)

```
BryntumAIFilterField, BryntumAssignmentField, BryntumAssignmentGrid,
BryntumButton, BryntumButtonGroup, BryntumCalendarEditor, BryntumCalendarField,
BryntumCalendarPicker, BryntumChatPanel, BryntumCheckbox, BryntumCheckboxGroup,
BryntumChecklistFilterCombo, BryntumChipView, BryntumCodeEditor, BryntumColorField,
BryntumCombo, BryntumConstraintTypePicker, BryntumContainer, BryntumCostAccrualField,
BryntumDateField, BryntumDatePicker, BryntumDateRangeField, BryntumDateTimeField,
BryntumDemoCodeEditor, BryntumDependencyField, BryntumDependencyTypePicker,
BryntumDisplayField, BryntumDurationField, BryntumEditor, BryntumEffortField,
BryntumEndDateField, BryntumEventColorField, BryntumFieldFilterPicker,
BryntumFieldFilterPickerGroup, BryntumFieldSet, BryntumFileField, BryntumFilePicker,
BryntumFilterField, BryntumGantt, BryntumGanttBase, BryntumGrid, BryntumGridBase,
BryntumGridChartDesigner, BryntumGridFieldFilterPicker, BryntumGridFieldFilterPickerGroup,
BryntumGroupBar, BryntumHint, BryntumLabel, BryntumList, BryntumMenu, BryntumModelCombo,
BryntumMonthPicker, BryntumNumberField, BryntumPagingToolbar, BryntumPanel,
BryntumPasswordField, BryntumProjectCombo, BryntumGanttProjectModel, BryntumRadio,
BryntumRadioGroup, BryntumRateTableField, BryntumResourceCombo, BryntumResourceEditor,
BryntumResourceFilter, BryntumResourceGrid, BryntumResourceHistogram,
BryntumResourceTypeField, BryntumResourceUtilization, BryntumScheduler,
BryntumSchedulerBase, BryntumSchedulerDatePicker, BryntumSchedulerPro,
BryntumSchedulerProBase, BryntumSchedulingDirectionPicker, BryntumSchedulingModePicker,
BryntumSlider, BryntumSlideToggle, BryntumSplitter, BryntumStartDateField,
BryntumTabPanel, BryntumTextAreaField, BryntumTextAreaPickerField, BryntumTextField,
BryntumTimeField, BryntumTimeline, BryntumTimelineHistogram, BryntumTimePicker,
BryntumToolbar, BryntumTreeCombo, BryntumTreeGrid, BryntumUndoRedo, BryntumVersionGrid,
BryntumViewPresetCombo, BryntumWidget, BryntumYearPicker
```

---

## Basic Usage

### App.js

```javascript
import React from 'react';
import { BryntumGantt } from '@bryntum/gantt-react';
import { ganttProps } from './AppConfig';

export const App = () => {
    return (
        <BryntumGantt
            {...ganttProps}
            // other props, event handlers, etc
        />
    );
};
```

### AppConfig.js

```javascript
export const ganttProps = {
    tooltip: "My cool Bryntum Gantt component"
    // Bryntum Gantt config options
};
```

---

## TypeScript Usage

### AppConfig.ts

```typescript
import { BryntumGanttProps } from '@bryntum/gantt-react';

const ganttProps: BryntumGanttProps = {
    // Wrapper configuration
};
```

### App.tsx

```typescript
import React, { FunctionComponent, useRef } from 'react';
import { BryntumGantt } from '@bryntum/gantt-react';
import { Gantt } from '@bryntum/gantt';
import { ganttProps } from './AppConfig';

const App: FunctionComponent = () => {
    const ganttRef = useRef<BryntumGantt>(null);
    const ganttInstance = () => ganttRef.current?.instance as Gantt;

    return (
        <>
            <BryntumGantt
                ref={ganttRef}
                {...ganttProps}
            />
        </>
    );
};

export default App;
```

---

## CSS/Theme Imports

### In App.js

```javascript
// FontAwesome for icons
import '@bryntum/gantt/fontawesome/css/fontawesome.css';
import '@bryntum/gantt/fontawesome/css/solid.css';

// Structural CSS
import '@bryntum/gantt/gantt.css';

// Theme (pick one)
import '@bryntum/gantt/svalbard-light.css';
// import '@bryntum/gantt/svalbard-dark.css';
// import '@bryntum/gantt/visby-light.css';
// import '@bryntum/gantt/visby-dark.css';
// import '@bryntum/gantt/stockholm-light.css';
// import '@bryntum/gantt/stockholm-dark.css';
// import '@bryntum/gantt/material3-light.css';
// import '@bryntum/gantt/material3-dark.css';
```

### In App.scss

```scss
@import '@bryntum/gantt/fontawesome/css/fontawesome.css';
@import '@bryntum/gantt/fontawesome/css/solid.css';
@import '@bryntum/gantt/gantt.css';
@import '@bryntum/gantt/svalbard-light.css';
```

---

## Embedding Toolbar

### AppConfig.js

```javascript
export const ganttProps = {
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

## JSX Cell Renderers

### Simple Inline JSX

```javascript
renderer: ({ value }) => <CustomComponent>{value}</CustomComponent>
```

### With Record Data

```javascript
renderer: (renderData) => {
    return (
        <CustomComponent dataProperty={renderData}>
            <b>{renderData.value}</b>/{renderData.record.city}
        </CustomComponent>
    );
}
```

### Custom React Component

```javascript
// DemoButton.js
import React from 'react';

const DemoButton = props => {
    return <button {...props}>{props.text}</button>;
};

export default DemoButton;
```

### Using in Column Renderer

```javascript
import DemoButton from '../components/DemoButton';

handleCellButtonClick = (record) => {
    alert('Go ' + record.team + '!');
};

return (
    <BryntumGantt
        columns={[
            {
                renderer: ({ record }) =>
                    <DemoButton
                        text={'Go ' + record.team + '!'}
                        onClick={() => handleCellButtonClick(record)}
                    />,
                // other column props
            }
        ]}
    />
);
```

---

## React Cell Editors

### Basic Editor

Cell editors activate on double-click by default.

### Custom Editors with Pickers

For editors with pickers/popups that shouldn't close on blur:

```typescript
{
    text: 'Start',
    type: 'date',
    field: 'start',
    width: '11em',
    editor: (ref: any) => <DateEditor ref={ref} />,
    managedCellEditing: false
}
```

**Important**: Pass `ref` to React editor for it to work.

### Floating Popup Editors

```typescript
import ColorEditor from './components/ColorEditor';

export const gridProps: BryntumGridProps = {
    columns: [
        {
            text: 'Color',
            field: 'color',
            editor: (ref: any) => <ColorEditor ref={ref} />,
            cellEditor: {
                floating: true,
                align: {
                    minHeight: 300
                }
            }
        }
    ]
};
```

**Editor requirements**: Must implement `getValue`, `setValue`, `isValid`, and `focus` methods.

---

## React Components in Tooltips

### Cell Tooltip

```javascript
const ganttProps = {
    cellTooltipFeature: {
        tooltipRenderer: ({ record }) => (
            <React.StrictMode>
                <DemoTooltip record={record}/>
            </React.StrictMode>
        )
    }
};

return <BryntumGantt {...ganttProps} />;
```

### DemoTooltip Component

```javascript
import React from 'react';

const DemoTooltip = props => {
    const { record } = props;
    return (
        <div>
            React component: <b>{record.name}</b>
        </div>
    );
};

export default DemoTooltip;
```

---

## React Components in Widgets

```javascript
const ganttProps = {
    bbar: {
        items: {
            demoWidget: {
                type: 'widget',
                html: <DemoWidget/>
            }
        }
    }
};
```

### DemoWidget Component

```javascript
import React from 'react';

const DemoWidget = props => {
    const title = 'Click me and watch the console output';
    const style = { cursor: 'pointer' };
    const handleClick = event => {
        console.log(event);
    };

    return (
        <div title={title} style={style} onClick={handleClick}>
            React Demo Widget
        </div>
    );
};

export default DemoWidget;
```

---

## Header Renderers

### Using headerWidgets

```javascript
const ganttProps = {
    columns: [{
        field: 'name',
        text: 'Name',
        headerWidgets: [{
            type: 'widget',
            html: <Component />
        }]
    }]
};
```

### Using headerRenderer

```javascript
const ganttProps = {
    columns: [{
        type: 'column',
        text: 'Name',
        field: 'name',
        headerRenderer: ({ column }) => <Component column={column} />
    }]
};
```

---

## Data Binding

### syncDataOnLoad

Stores used by wrapper enable `syncDataOnLoad` by default for two-way binding. Without it, each state change applies as completely new dataset. With it, differences are calculated and applied.

---

## Feature Configuration

### Complete Feature List (with `Feature` suffix)

All features from Angular guide apply here with same naming convention:

| Feature Name | API Reference |
|--------------|---------------|
| `aiFilterFeature` | AIFilter |
| `baselinesFeature` | Baselines |
| `cellEditFeature` | CellEdit |
| `criticalPathsFeature` | CriticalPaths |
| `dependenciesFeature` | Dependencies |
| `labelsFeature` | Labels |
| `taskEditFeature` | TaskEdit |
| ... | (see Angular guide for complete list) |

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

```javascript
const ganttRef = useRef();

useEffect(() => {
    console.log(ganttRef.current.instance);
}, []);

return <BryntumGantt ref={ganttRef} {...ganttProps} />;
```

---

## Theme Switching

### Using BryntumThemeCombo

```javascript
import { BryntumThemeCombo } from '@bryntum/gantt-react';

return (
    // ... other components
    <BryntumThemeCombo/>
    // ... other components
);
```

### Setup for Theme Switching

**package.json postinstall:**

```json
{
    "scripts": {
        "postinstall": "postinstall"
    },
    "postinstall": {
        "node_modules/@bryntum/gantt/*.css*": "copy public/themes/",
        "node_modules/@bryntum/gantt/fonts": "copy public/themes/fonts"
    },
    "devDependencies": {
        "postinstall": "~0.7.0"
    }
}
```

**public/index.html:**

```html
<head>
    <link rel="stylesheet" href="%PUBLIC_URL%/themes/fontawesome/css/fontawesome.css" />
    <link rel="stylesheet" href="%PUBLIC_URL%/themes/fontawesome/css/solid.css" />
    <link rel="stylesheet" href="%PUBLIC_URL%/themes/gantt.css" />
    <link rel="stylesheet" href="%PUBLIC_URL%/themes/svalbard-light.css" data-bryntum-theme />
</head>
```

**Note**: `data-bryntum-theme` is mandatory for BryntumThemeCombo.

---

## Next.js Integration

### Dynamic Loading (SSR Disabled)

Bryntum components are client-side only.

**components/Gantt.js:**

```javascript
import { BryntumGantt } from '@bryntum/gantt-react';

export default function Gantt({ ganttRef, ...props }) {
    return <BryntumGantt {...props} ref={ganttRef}/>;
}
```

**Usage:**

```javascript
import dynamic from "next/dynamic";
import { useRef } from 'react';

const Gantt = dynamic(
    () => import("../components/Gantt.js"), { ssr: false }
);

const MyComponent = () => {
    const ganttRef = useRef();

    const clickHandler = function(e) {
        console.log(ganttRef.current?.instance);
    };

    return (
        <>
            <button onClick={clickHandler}>ref test</button>
            <Gantt
                ganttRef={ganttRef}
                // other props
            />
        </>
    );
};
```

---

## Best Practices

### Configuration Management

#### External Configuration (Static Settings)

```javascript
// AppConfig.js
export const ganttConfig = {
    tooltip: "My cool Bryntum Gantt component"
};

// App.js
import { ganttConfig } from './AppConfig';

export const App = () => {
    return <BryntumGantt {...ganttConfig} />;
};
```

#### State-Managed Configuration (Dynamic Settings)

```javascript
import React, { useState } from 'react';
import { BryntumGantt } from '@bryntum/gantt-react';

export const App = () => {
    const [start, setStart] = useState(new Date());

    const [ganttConfig] = useState({
        startDate: start
    });

    return <BryntumGantt {...ganttConfig} />;
};
```

---

## React 18+ Strict Mode

React 18+ uses mount-unmount-mount cycle in development for Strict mode:

1. Mounts component, triggers `useEffect`
2. Immediately unmounts, triggers cleanup
3. Mounts again

This may cause data loading issues. Consider waiting for data before rendering component.

---

## Build Commands

### Development (Vite)

```bash
npm install
npm start        # Bryntum examples
npm run dev      # Default Vite
```

Local server at http://localhost:5173

### Production

```bash
npm install
npm run build
```

Output in `build` folder.

---

## Demo Locations

React demos in distribution: `examples/frameworks/react/`

Online demos: https://bryntum.com/products/gantt/examples/?framework=react

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
