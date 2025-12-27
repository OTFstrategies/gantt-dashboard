# Deep Dive: Bryntum Gantt Widgets

## Level 2 Technical Reference

This document provides a comprehensive analysis of the Bryntum Widget system based on the Bryntum Gantt 7.1.0 TypeScript definitions. It covers the widget hierarchy, configuration patterns, and practical usage examples.

---

## Table of Contents

1. [Widget Base Class and Lifecycle](#1-widget-base-class-and-lifecycle)
2. [Container and Panel Patterns](#2-container-and-panel-patterns)
3. [Common Widgets](#3-common-widgets)
4. [Widget Configuration Pattern](#4-widget-configuration-pattern)
5. [Toolbar Configuration](#5-toolbar-configuration)
6. [Menu and MenuItem](#6-menu-and-menuitem)
7. [Popup and Dialog](#7-popup-and-dialog)
8. [Widget Events and Handlers](#8-widget-events-and-handlers)
9. [Form Fields and Validation](#9-form-fields-and-validation)
10. [Creating Custom Widgets](#10-creating-custom-widgets)

---

## 1. Widget Base Class and Lifecycle

### Widget Class Overview

The `Widget` class is the foundation of all Bryntum UI components. It extends `Base` and provides core functionality for rendering, positioning, and interaction.

```typescript
import { Widget, WidgetConfig } from '@bryntum/gantt';

// Widget hierarchy:
// Base -> Widget -> Container -> Panel -> Popup -> Dialog
//                            -> Panel -> Menu
//                            -> Toolbar
//               -> Field -> TextField
//                        -> DateField
//                        -> Combo
//               -> Button
//               -> MenuItem
```

### Key Static Properties

```typescript
class Widget extends Base {
    static $name: string;              // Class name for minified builds
    static type: string;               // Widget type alias for items config
    static readonly isWidget: boolean; // Type guard
    static readonly tooltip: Tooltip;  // Shared tooltip instance
}
```

### Widget Lifecycle

```typescript
// 1. CONSTRUCTION
const widget = new Widget({
    appendTo: 'container',
    html: 'Hello World'
});

// 2. ELEMENT CREATION
// - Element is created but may not be in DOM yet
// - onElementCreated event fires

// 3. RENDERING / PAINT
// - Widget is added to DOM
// - onPaint event fires (firstPaint: true for initial paint)

// 4. VISIBILITY CHANGES
// - onBeforeShow / onShow
// - onBeforeHide / onHide

// 5. FOCUS MANAGEMENT
// - onFocusIn / onFocusOut

// 6. DESTRUCTION
// - onBeforeDestroy
// - onDestroy
widget.destroy();
```

### Core Properties

```typescript
interface WidgetConfig {
    // Identification
    id?: string;
    ref?: string;                    // Registration key in widgetMap

    // Rendering
    appendTo?: HTMLElement | string;
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    adopt?: HTMLElement | string;    // Use existing element

    // Content
    html?: string | DomConfig | DomConfig[];
    content?: string;                // HTML that coexists with plugins

    // Visibility
    hidden?: boolean;
    disabled?: boolean | 'inert';

    // Styling
    cls?: string | object;
    style?: string;
    color?: string;                  // Sets --b-primary CSS variable
    ui?: string | object;            // CSS class suffixes

    // Sizing
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
    flex?: number | string;

    // Layout
    margin?: number | string;        // TRBL format supported
    alignSelf?: string;              // Flexbox align-self

    // Positioning
    floating?: boolean;
    centered?: boolean;
    positioned?: boolean;
    x?: number;
    y?: number;
    draggable?: boolean | { handleSelector?: string };

    // Constraints
    constrainTo?: HTMLElement | Widget | Rectangle;

    // Scrolling
    scrollable?: boolean | ScrollerConfig | Scroller;
    scrollAction?: 'hide' | 'realign' | null;

    // Accessibility
    ariaLabel?: string;
    ariaDescription?: string;

    // Interaction
    readOnly?: boolean;
    tooltip?: string | TooltipConfig | null;
    ripple?: boolean | RippleConfig;
}
```

### Key Methods

```typescript
class Widget {
    // Visibility
    show(): Promise<void>;
    hide(): Promise<void>;

    // Focus
    focus(): void;

    // DOM
    render(appendTo?: HTMLElement): void;

    // Destruction
    destroy(): void;

    // Position (for floating widgets)
    showBy(target: AlignSpec): void;
    alignTo(target: AlignSpec): AlignResult;

    // Utility
    up(selector: string | Function): Widget;  // Find ancestor
    owns(widget: Widget): boolean;            // Check ownership
}
```

---

## 2. Container and Panel Patterns

### Container

Container is the base class for widgets that hold child widgets.

```typescript
import { Container, ContainerConfig, ContainerItemConfig } from '@bryntum/gantt';

interface ContainerConfig extends WidgetConfig {
    type?: 'container';

    // Child widgets
    items?: Record<string, ContainerItemConfig> | ContainerItemConfig[];
    lazyItems?: ContainerItemConfig[];    // Rendered on first show
    defaults?: ContainerItemConfig;        // Applied to all children
    namedItems?: Record<string, ContainerItemConfig>; // Reusable configs

    // Layout
    layout?: string | ContainerLayoutConfig;
    layoutStyle?: object;                  // CSS for contentElement

    // Field handling
    autoUpdateRecord?: boolean;
    record?: Model;                        // Populates form fields
    labelPosition?: 'before' | 'above' | 'align-before' | 'auto';
    inputFieldAlign?: 'start' | 'end';

    // Behavior
    hideWhenEmpty?: boolean;
    defaultFocus?: ((widget: Widget) => boolean) | string;
}

// Container items can be specified as array or object
const container = new Container({
    items: [
        { type: 'textfield', label: 'Name', ref: 'nameField' },
        { type: 'datefield', label: 'Date', ref: 'dateField' },
        { type: 'button', text: 'Submit' }
    ]
});

// Or as object for named access
const container2 = new Container({
    items: {
        nameField: { type: 'textfield', label: 'Name' },
        dateField: { type: 'datefield', label: 'Date' },
        submitBtn: { type: 'button', text: 'Submit' }
    }
});

// Access widgets via widgetMap
container.widgetMap.nameField.value = 'John';
```

### Container Layout Options

```typescript
// Available layouts: 'default' | 'box' | 'card' | 'fit' | 'form' | 'grid' | 'vbox' | 'hbox'

const container = new Container({
    layout: 'vbox',  // Vertical flexbox
    items: [/* ... */]
});

// Grid layout with columns
const gridContainer = new Container({
    layout: {
        type: 'grid',
        columns: 3,
        gap: '1em'
    },
    items: [/* ... */]
});

// Form layout with labels
const formContainer = new Container({
    layout: 'form',
    labelPosition: 'above',
    items: [
        { type: 'textfield', label: 'First Name', span: 1 },
        { type: 'textfield', label: 'Last Name', span: 1 }
    ]
});
```

### Panel

Panel extends Container with header, toolbars, and collapsible features.

```typescript
import { Panel, PanelConfig, PanelHeader } from '@bryntum/gantt';

interface PanelConfig extends ContainerConfig {
    type?: 'panel';

    // Header
    title?: string;
    header?: string | boolean | PanelHeader;
    icon?: string | DomConfig;

    // Toolbars
    tbar?: ToolbarConfig | ContainerItemConfig[];  // Top toolbar
    bbar?: ToolbarConfig | ContainerItemConfig[];  // Bottom toolbar

    // Strips (docked widgets)
    strips?: Record<string, ContainerItemConfig>;

    // Styling
    bodyCls?: string | object;

    // Footer
    footer?: { dock?: string; html?: string; cls?: string } | string;

    // Collapsible
    collapsible?: boolean | PanelCollapserConfig;
    collapsed?: boolean;

    // Drawer mode
    drawer?: boolean | DrawerConfig;
}

// Panel with header and toolbars
const panel = new Panel({
    title: 'Task Details',
    icon: 'b-fa b-fa-tasks',

    header: {
        dock: 'top',
        titleAlign: 'center',
        cls: 'custom-header'
    },

    tbar: [
        { type: 'button', icon: 'b-fa b-fa-plus', text: 'Add' },
        { type: 'button', icon: 'b-fa b-fa-trash', text: 'Delete' }
    ],

    bbar: [
        '->',  // Filler - pushes following items to the right
        { type: 'button', text: 'Cancel' },
        { type: 'button', text: 'Save', cls: 'b-raised' }
    ],

    items: [
        { type: 'textfield', label: 'Task Name' }
    ],

    collapsible: true,
    collapsed: false
});
```

### Panel Header Configuration

```typescript
interface PanelHeader {
    cls?: string | object;
    dock?: 'top' | 'right' | 'bottom' | 'left';
    title: string;
    iconCls: string;
    titleAlign?: 'start' | 'center' | 'end';
    style?: Record<string, string | number> | string;
}
```

---

## 3. Common Widgets

### Button

```typescript
import { Button, ButtonConfig } from '@bryntum/gantt';

interface ButtonConfig extends WidgetConfig {
    type?: 'button';

    // Content
    text?: string;
    icon?: string;                        // CSS class for icon
    iconAlign?: 'start' | 'end';
    badge?: string;                       // Badge text

    // Link behavior
    href?: string;
    target?: string;

    // Button type
    behaviorType?: 'button' | 'submit' | 'reset';

    // Toggle behavior
    toggleable?: boolean;
    pressed?: boolean;
    toggleGroup?: string;

    // Menu
    menu?: MenuConfig | MenuItemConfig[];
    menuIcon?: string;

    // Styling
    color?: string;
    pressed?: boolean;
}

// Button examples
const saveButton = new Button({
    text: 'Save',
    icon: 'b-fa b-fa-save',
    cls: 'b-raised b-blue',
    onClick: () => console.log('Saved!')
});

// Toggle button
const toggleButton = new Button({
    text: 'Toggle View',
    toggleable: true,
    pressed: false,
    onToggle: ({ pressed }) => console.log('Pressed:', pressed)
});

// Button with menu
const menuButton = new Button({
    text: 'Actions',
    icon: 'b-fa b-fa-cog',
    menu: [
        { text: 'Edit', icon: 'b-fa b-fa-edit' },
        { text: 'Delete', icon: 'b-fa b-fa-trash' }
    ]
});

// Button group
const buttonGroup = new Container({
    cls: 'b-button-group',
    items: [
        { type: 'button', text: 'Day', toggleable: true, toggleGroup: 'view', pressed: true },
        { type: 'button', text: 'Week', toggleable: true, toggleGroup: 'view' },
        { type: 'button', text: 'Month', toggleable: true, toggleGroup: 'view' }
    ]
});
```

### TextField

```typescript
import { TextField, TextFieldConfig } from '@bryntum/gantt';

interface TextFieldConfig extends FieldConfig {
    type?: 'textfield' | 'text';

    // Value
    value?: string;

    // Input attributes
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    autoComplete?: string;
    inputType?: string;                   // 'text', 'password', 'email', etc.

    // Behavior
    autoSelect?: boolean;                 // Select all on focus
    editable?: boolean;

    // Triggers
    clearable?: boolean | FieldTriggerConfig;
    triggers?: Record<string, FieldTriggerConfig>;

    // Validation
    required?: boolean;

    // Label
    label?: string;
    labelPosition?: 'before' | 'above' | 'align-before';
    labelWidth?: string | number;
}

// TextField examples
const nameField = new TextField({
    label: 'Name',
    placeholder: 'Enter your name',
    required: true,
    clearable: true,

    onChange: ({ value, oldValue }) => {
        console.log(`Changed from ${oldValue} to ${value}`);
    }
});

// Password field
const passwordField = new TextField({
    label: 'Password',
    inputType: 'password',
    required: true,
    minLength: 8,

    triggers: {
        reveal: {
            cls: 'b-fa b-fa-eye',
            handler: 'onRevealPassword'
        }
    }
});

// Search field with custom trigger
const searchField = new TextField({
    placeholder: 'Search...',
    clearable: true,

    triggers: {
        search: {
            cls: 'b-fa b-fa-search',
            align: 'end',
            handler: 'onSearch'
        }
    }
});
```

### Combo (Dropdown)

```typescript
import { Combo, ComboConfig } from '@bryntum/gantt';

interface ComboConfig extends PickerFieldConfig {
    type?: 'combo' | 'combobox' | 'dropdown';

    // Data
    items?: any[];                        // Array of options
    store?: Store | StoreConfig;          // Or use a store
    valueField?: string;                  // Field for value (default: 'value')
    displayField?: string;                // Field for display (default: 'text')

    // Value
    value?: any;
    multiSelect?: boolean;

    // Filtering
    editable?: boolean;                   // Allow typing
    filterOnEnter?: boolean;
    caseSensitive?: boolean;
    filterOperator?: string;              // 'includes', 'startsWith', etc.

    // Picker
    picker?: ListConfig;
    pickerWidth?: string | number;

    // Behavior
    autoExpand?: boolean;                 // Expand on focus
    clearTextOnPickerHide?: boolean;
    createOnUnmatched?: boolean | Function;

    // Multi-select
    chipView?: ChipViewConfig;
    multiValueSeparator?: string;
}

// Simple combo
const statusCombo = new Combo({
    label: 'Status',
    items: ['Not Started', 'In Progress', 'Completed'],
    value: 'Not Started'
});

// Combo with value/text objects
const priorityCombo = new Combo({
    label: 'Priority',
    items: [
        { value: 1, text: 'Low' },
        { value: 2, text: 'Medium' },
        { value: 3, text: 'High' }
    ],
    valueField: 'value',
    displayField: 'text',
    value: 2
});

// Multi-select combo
const assigneesCombo = new Combo({
    label: 'Assignees',
    multiSelect: true,
    items: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Bob Wilson' }
    ],
    valueField: 'id',
    displayField: 'name',
    chipView: {
        closable: true
    }
});

// Combo with store
const resourceCombo = new Combo({
    label: 'Resource',
    store: gantt.resourceStore,
    valueField: 'id',
    displayField: 'name',
    editable: true,
    filterOperator: 'startsWith'
});
```

### DateField

```typescript
import { DateField, DateFieldConfig } from '@bryntum/gantt';

interface DateFieldConfig extends PickerFieldConfig {
    type?: 'datefield' | 'date';

    // Value
    value?: Date | string;

    // Format
    format?: string;                      // Display format

    // Constraints
    min?: Date | string;
    max?: Date | string;

    // Picker
    picker?: DatePickerConfig;
    pickerFormat?: string;

    // Week
    weekStartDay?: number;                // 0-6

    // Behavior
    editable?: boolean;
    step?: string | number | object;      // Step for spinner
}

// DateField examples
const startDateField = new DateField({
    label: 'Start Date',
    value: new Date(),
    format: 'YYYY-MM-DD',
    min: new Date(),                      // No past dates

    onChange: ({ value }) => {
        console.log('Selected date:', value);
    }
});

// DateField with picker config
const dueDateField = new DateField({
    label: 'Due Date',
    format: 'MMM D, YYYY',
    picker: {
        showWeekNumber: true,
        multiSelect: false
    }
});

// Date range example
const startField = new DateField({ label: 'Start', ref: 'startDate' });
const endField = new DateField({
    label: 'End',
    ref: 'endDate',
    listeners: {
        change: ({ source }) => {
            const start = source.owner.widgetMap.startDate.value;
            if (source.value < start) {
                source.value = start;
            }
        }
    }
});
```

---

## 4. Widget Configuration Pattern

### Type-Based Widget Resolution

Bryntum uses a `type` property to resolve widget classes from configuration objects:

```typescript
// The 'type' property maps to registered widget classes
const items = [
    { type: 'button', text: 'Click Me' },     // -> Button
    { type: 'textfield', label: 'Name' },     // -> TextField
    { type: 'combo', items: [] },             // -> Combo
    { type: 'datefield', format: 'YYYY' },    // -> DateField
    { type: 'container', items: [] },         // -> Container
    { type: 'panel', title: 'Panel' },        // -> Panel
    { type: 'toolbar', items: [] },           // -> Toolbar
    { type: 'menu', items: [] },              // -> Menu
    { type: 'menuitem', text: 'Item' },       // -> MenuItem
    { type: 'popup', html: 'Content' },       // -> Popup
    { type: 'widget', html: 'Basic' }         // -> Widget
];
```

### Common Configuration Properties

```typescript
// All widgets share these common patterns

interface CommonWidgetPatterns {
    // Identification
    type: string;                           // Widget type
    ref: string;                            // Reference in widgetMap
    id: string;                             // DOM id

    // Content
    text: string;                           // Button, MenuItem text
    icon: string;                           // Icon CSS class
    iconCls: string;                        // Alternative icon property
    html: string;                           // HTML content

    // Styling
    cls: string | object;                   // CSS classes
    style: string | object;                 // Inline styles
    ui: string;                             // UI variant suffix
    color: string;                          // Primary color

    // Size
    width: string | number;
    height: string | number;
    flex: number | string;

    // State
    hidden: boolean;
    disabled: boolean | 'inert';
    readOnly: boolean;

    // Weight for ordering
    weight: number;

    // Events (callback style)
    onClick: Function;
    onChange: Function;
    onAction: Function;
}
```

### Widget Defaults Pattern

```typescript
// Apply defaults to all child widgets
const form = new Container({
    defaults: {
        labelWidth: 120,
        labelPosition: 'before',
        required: true
    },
    items: [
        { type: 'textfield', label: 'Name' },     // Inherits defaults
        { type: 'textfield', label: 'Email' },    // Inherits defaults
        { type: 'button', text: 'Submit' }        // Also gets defaults (ignored if not applicable)
    ]
});
```

### Named Items Pattern

```typescript
// Define reusable widget configurations
class MyMenu extends Menu {
    static namedItems = {
        editItem: { text: 'Edit', icon: 'b-fa b-fa-edit' },
        deleteItem: { text: 'Delete', icon: 'b-fa b-fa-trash' },
        separator: null  // Creates separator
    };
}

const menu = new MyMenu({
    items: {
        editItem: true,      // Uses named config
        separator: true,     // Creates separator
        deleteItem: true     // Uses named config
    }
});
```

---

## 5. Toolbar Configuration

### Toolbar Structure

```typescript
import { Toolbar, ToolbarConfig, ToolbarItems } from '@bryntum/gantt';

interface ToolbarConfig extends ContainerConfig {
    type?: 'toolbar';

    // Special toolbar items
    items?: ToolbarItems[];

    // Behavior
    enableReordering?: boolean;
    overflow?: object;                    // Overflow menu config
}

// Toolbar items support special string values
type ToolbarItems =
    | '|'                                 // Separator
    | '->'                                // Flex filler
    | ContainerItemConfig;
```

### Panel tbar/bbar

```typescript
const panel = new Panel({
    title: 'Task Editor',

    // Top toolbar - shortcuts for common patterns
    tbar: [
        { type: 'button', text: 'New', icon: 'b-fa b-fa-plus' },
        '|',                              // Separator
        { type: 'button', text: 'Edit', icon: 'b-fa b-fa-edit' },
        { type: 'button', text: 'Delete', icon: 'b-fa b-fa-trash' },
        '->',                             // Filler
        { type: 'textfield', placeholder: 'Search...', width: 200 }
    ],

    // Bottom toolbar
    bbar: [
        { type: 'widget', html: 'Status: Ready' },
        '->',
        { type: 'button', text: 'Cancel', onClick: 'onCancel' },
        { type: 'button', text: 'Save', cls: 'b-raised', onClick: 'onSave' }
    ],

    items: [/* form fields */]
});
```

### Standalone Toolbar

```typescript
const toolbar = new Toolbar({
    appendTo: 'toolbar-container',

    items: [
        {
            type: 'buttongroup',
            items: [
                { icon: 'b-fa b-fa-bold', toggleable: true },
                { icon: 'b-fa b-fa-italic', toggleable: true },
                { icon: 'b-fa b-fa-underline', toggleable: true }
            ]
        },
        '|',
        {
            type: 'combo',
            items: ['Arial', 'Times New Roman', 'Courier'],
            value: 'Arial',
            width: 150
        },
        {
            type: 'numberfield',
            value: 12,
            min: 8,
            max: 72,
            width: 60
        },
        '->',
        {
            type: 'button',
            text: 'Help',
            icon: 'b-fa b-fa-question-circle'
        }
    ]
});
```

### Toolbar Overflow

```typescript
// Configure overflow behavior for responsive toolbars
const toolbar = new Toolbar({
    overflow: {
        type: 'menu',                     // Overflow items go to menu
        button: {
            icon: 'b-fa b-fa-ellipsis-h'
        }
    },

    items: [
        { text: 'Item 1', weight: 100 },  // Higher weight = overflow first
        { text: 'Item 2', weight: 200 },
        { text: 'Item 3', weight: 300 }
    ]
});
```

---

## 6. Menu and MenuItem

### Menu

```typescript
import { Menu, MenuConfig, MenuItem, MenuItemConfig } from '@bryntum/gantt';

interface MenuConfig extends PopupConfig {
    type?: 'menu';

    // Items
    items?: (MenuItemConfig | string)[];  // String creates separator

    // Behavior
    autoClose?: boolean;
    anchor?: boolean;

    // Scroll configuration
    scrollable?: boolean | ScrollerConfig;
}

interface MenuItemConfig extends WidgetConfig {
    type?: 'menuitem';

    // Content
    text?: string;
    icon?: string;

    // State
    checked?: boolean | string;           // Creates checkbox item
    disabled?: boolean;

    // Behavior
    closeParent?: boolean;                // Close menu on click

    // Submenu
    menu?: MenuConfig | MenuItemConfig[];

    // Handler
    onItem?: Function;
}
```

### Menu Examples

```typescript
// Simple context menu
const contextMenu = new Menu({
    items: [
        { text: 'Cut', icon: 'b-fa b-fa-cut' },
        { text: 'Copy', icon: 'b-fa b-fa-copy' },
        { text: 'Paste', icon: 'b-fa b-fa-paste' },
        null,                             // Separator
        { text: 'Delete', icon: 'b-fa b-fa-trash', cls: 'b-red' }
    ],

    onItem: ({ item }) => {
        console.log('Selected:', item.text);
    }
});

// Show context menu
element.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.showBy({
        target: e,
        align: 't-b'
    });
});

// Menu with checkboxes
const viewMenu = new Menu({
    items: [
        { text: 'Show Grid', checked: true },
        { text: 'Show Dependencies', checked: true },
        { text: 'Show Baselines', checked: false },
        null,
        {
            text: 'Zoom',
            menu: [
                { text: 'Fit', checked: 'zoom', closeParent: false },
                { text: '50%', checked: 'zoom', closeParent: false },
                { text: '100%', checked: 'zoom', closeParent: false },
                { text: '200%', checked: 'zoom', closeParent: false }
            ]
        }
    ],

    onItem: ({ item }) => {
        if (item.checked !== undefined) {
            item.checked = !item.checked;
        }
    }
});

// Nested submenus
const fileMenu = new Menu({
    items: [
        { text: 'New', icon: 'b-fa b-fa-file' },
        { text: 'Open', icon: 'b-fa b-fa-folder-open' },
        null,
        {
            text: 'Recent',
            icon: 'b-fa b-fa-history',
            menu: [
                { text: 'project1.gantt' },
                { text: 'project2.gantt' },
                { text: 'project3.gantt' }
            ]
        },
        null,
        { text: 'Save', icon: 'b-fa b-fa-save' },
        {
            text: 'Export',
            icon: 'b-fa b-fa-download',
            menu: [
                { text: 'PDF', icon: 'b-fa b-fa-file-pdf' },
                { text: 'Excel', icon: 'b-fa b-fa-file-excel' },
                { text: 'PNG', icon: 'b-fa b-fa-file-image' }
            ]
        }
    ]
});
```

---

## 7. Popup and Dialog

### Popup

```typescript
import { Popup, PopupConfig } from '@bryntum/gantt';

interface PopupConfig extends PanelConfig {
    type?: 'popup';

    // Appearance
    anchor?: boolean;                     // Show connector arrow
    closable?: boolean;                   // Show close button

    // Behavior
    autoClose?: boolean;                  // Close on outside click
    autoShow?: boolean;                   // Show on hover
    closeAction?: 'hide' | 'destroy';
    closeOnEscape?: boolean;
    modal?: boolean;

    // Animation
    showAnimation?: boolean | object;
    hideAnimation?: boolean | object;

    // Tools (header buttons)
    tools?: Record<string, ToolConfig>;
}
```

### Popup Examples

```typescript
// Simple popup
const popup = new Popup({
    title: 'Information',
    html: 'This is a popup message',
    closable: true,
    autoClose: true,
    width: 300
});

popup.showBy(targetElement);

// Popup with form
const formPopup = new Popup({
    title: 'Quick Edit',
    width: 400,
    closable: true,

    items: [
        { type: 'textfield', label: 'Name', name: 'name' },
        { type: 'datefield', label: 'Date', name: 'date' }
    ],

    bbar: [
        '->',
        { text: 'Cancel', onClick: () => formPopup.close() },
        { text: 'Apply', cls: 'b-raised', onClick: 'onApply' }
    ]
});

// Modal popup
const modalPopup = new Popup({
    title: 'Confirm Action',
    modal: true,
    centered: true,
    width: 350,

    html: 'Are you sure you want to proceed?',

    bbar: [
        '->',
        { text: 'No', onClick: () => modalPopup.close() },
        { text: 'Yes', cls: 'b-raised', onClick: 'onConfirm' }
    ]
});
```

### Dialog (MessageDialog)

```typescript
import { MessageDialog } from '@bryntum/gantt';

// Confirmation dialog
const result = await MessageDialog.confirm({
    title: 'Delete Task',
    message: 'Are you sure you want to delete this task?',
    okButton: 'Delete',
    cancelButton: 'Cancel'
});

if (result === MessageDialog.okButton) {
    // User clicked Delete
}

// Alert dialog
await MessageDialog.alert({
    title: 'Error',
    message: 'An error occurred while saving.',
    icon: 'b-fa b-fa-exclamation-triangle'
});

// Custom dialog with input
const popup = new Popup({
    title: 'Enter Value',
    modal: true,
    centered: true,
    width: 350,

    items: [
        { type: 'textfield', label: 'Value', ref: 'valueField', required: true }
    ],

    bbar: [
        '->',
        { text: 'Cancel', onClick() { this.up('popup').close(); } },
        {
            text: 'OK',
            cls: 'b-raised',
            onClick() {
                const popup = this.up('popup');
                const field = popup.widgetMap.valueField;
                if (field.isValid) {
                    popup.close();
                    console.log('Value:', field.value);
                }
            }
        }
    ]
});

popup.show();
```

---

## 8. Widget Events and Handlers

### Event Listener Patterns

```typescript
// Pattern 1: Config-based listeners
const button = new Button({
    text: 'Click Me',

    // Direct callback
    onClick: (event) => {
        console.log('Clicked!', event);
    },

    // Method name string (resolved on owner)
    onClick: 'onButtonClick',

    // Listeners config object
    listeners: {
        click: (event) => console.log('Clicked'),

        // With options
        mouseover: {
            fn: (event) => console.log('Hover'),
            once: true
        }
    }
});

// Pattern 2: on() method
button.on('click', (event) => {
    console.log('Clicked!');
});

// With options
button.on({
    click: {
        fn: this.onClick,
        thisObj: this,
        once: true
    },
    hide: this.onHide
});

// Pattern 3: Event delegation
container.on('click', 'button', (event, widget) => {
    console.log('Button clicked:', widget);
});
```

### Common Widget Events

```typescript
interface WidgetEvents {
    // Lifecycle
    beforeDestroy: { source: Widget };
    destroy: { source: Widget };
    elementCreated: { element: HTMLElement };
    paint: { source: Widget; firstPaint: boolean };

    // Visibility
    beforeShow: { source: Widget };
    show: { source: Widget };
    beforeHide: { source: Widget };
    hide: { source: Widget };

    // Focus
    focusIn: {
        source: Widget;
        fromElement: HTMLElement;
        toElement: HTMLElement;
        fromWidget: Widget;
        toWidget: Widget;
        backwards: boolean;
    };
    focusOut: { /* same as focusIn */ };

    // State
    readOnly: { readOnly: boolean };
    resize: { source: Widget; width: number; height: number };

    // DOM
    render: { source: Widget };
}
```

### Field Events

```typescript
interface FieldEvents {
    // Value changes
    change: {
        source: Field;
        value: any;
        oldValue: any;
        valid: boolean;
        userAction: boolean;
    };

    input: {
        source: Field;
        value: string;
    };

    // Interaction
    clear: { source: Field };
    trigger: { source: Field; trigger: string };

    // Validation
    action: { source: Field; value: any; event: Event };
}

// Example field with events
const textField = new TextField({
    label: 'Name',

    onChange: ({ value, oldValue, valid }) => {
        console.log(`Changed: ${oldValue} -> ${value}, Valid: ${valid}`);
    },

    onInput: ({ value }) => {
        console.log('Input:', value);
    },

    onClear: () => {
        console.log('Field cleared');
    },

    onAction: ({ value }) => {
        console.log('Enter pressed, value:', value);
    }
});
```

### Container Events

```typescript
interface ContainerEvents {
    // Child management
    beforeAdd: { source: Container; widget: Widget };
    add: { source: Container; widget: Widget };
    beforeRemove: { source: Container; widget: Widget };
    remove: { source: Container; widget: Widget };

    // Child events bubble up
    change: { source: Field; /* ... */ };
    click: { source: Widget; event: MouseEvent };
}

// Event bubbling example
const form = new Container({
    items: [
        { type: 'textfield', ref: 'name', label: 'Name' },
        { type: 'textfield', ref: 'email', label: 'Email' }
    ],

    // Catches change events from all child fields
    onChange: ({ source, value }) => {
        console.log(`${source.ref} changed to ${value}`);
    }
});
```

### Removing Listeners

```typescript
// Store handler reference
const handler = (event) => console.log('Clicked');
button.on('click', handler);

// Remove later
button.un('click', handler);

// Or use detacher
const detacher = button.on('click', handler);
detacher();  // Removes listener

// Remove all listeners
button.un('click');
```

---

## 9. Form Fields and Validation

### Field Base Configuration

```typescript
interface FieldConfig extends WidgetConfig {
    // Value
    value?: any;
    name?: string;                        // Form field name

    // Label
    label?: string;
    labelPosition?: 'before' | 'above' | 'align-before';
    labelWidth?: string | number;
    labelCls?: string;

    // Input
    placeholder?: string;
    inputWidth?: string | number;
    inputAlign?: 'start' | 'end';
    inputAttributes?: object;

    // Validation
    required?: boolean;
    requiredError?: string;               // Custom error message

    // Triggers
    clearable?: boolean | FieldTriggerConfig;
    triggers?: Record<string, FieldTriggerConfig>;

    // Behavior
    editable?: boolean;
    readOnly?: boolean;
    revertOnEscape?: boolean;
    highlightExternalChange?: boolean;
}
```

### Validation

```typescript
// Required field
const requiredField = new TextField({
    label: 'Required Field',
    required: true,
    requiredError: 'This field is required'
});

// Check validity
console.log(requiredField.isValid);       // boolean
console.log(requiredField.errors);        // string[] of error messages

// Numeric validation
const ageField = new NumberField({
    label: 'Age',
    required: true,
    min: 0,
    max: 150
});

// Custom validation via events
const emailField = new TextField({
    label: 'Email',
    required: true,

    onChange: ({ source, value }) => {
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

        if (!isValidEmail && value) {
            source.setError('Please enter a valid email');
        } else {
            source.clearError();
        }
    }
});

// Field error handling
field.setError('Custom error message');
field.clearError();
field.clearError('specificError');
```

### Form Values

```typescript
// Get/set form values via Container
const form = new Container({
    items: [
        { type: 'textfield', name: 'firstName', label: 'First Name' },
        { type: 'textfield', name: 'lastName', label: 'Last Name' },
        { type: 'datefield', name: 'birthDate', label: 'Birth Date' },
        { type: 'combo', name: 'country', label: 'Country', items: ['USA', 'UK', 'Canada'] }
    ]
});

// Get all values
const values = form.values;
// { firstName: '', lastName: '', birthDate: null, country: null }

// Set values
form.values = {
    firstName: 'John',
    lastName: 'Doe',
    birthDate: new Date('1990-01-15'),
    country: 'USA'
};

// Get validity of all fields
console.log(form.isValid);

// Use with record
form.record = taskRecord;  // Populates fields from record
// Changes are auto-applied if autoUpdateRecord: true
```

### Triggers

```typescript
interface FieldTriggerConfig {
    cls: string;                          // CSS class for icon
    handler: string | Function;           // Handler method
    align?: 'start' | 'end';              // Position
    weight?: number;                      // Sort order
    key?: string;                         // Keyboard shortcut
}

// Custom triggers
const searchField = new TextField({
    placeholder: 'Search...',

    triggers: {
        clear: {
            cls: 'b-fa b-fa-times',
            align: 'end',
            weight: 100,
            handler: () => searchField.clear()
        },
        search: {
            cls: 'b-fa b-fa-search',
            align: 'end',
            weight: 200,
            key: 'Enter',
            handler: () => performSearch(searchField.value)
        }
    }
});

// Access triggers
searchField.triggers.clear.hidden = true;
```

---

## 10. Creating Custom Widgets

### Basic Custom Widget

```typescript
import { Widget, WidgetConfig } from '@bryntum/gantt';

interface MyWidgetConfig extends WidgetConfig {
    type?: 'mywidget';
    customProp?: string;
}

class MyWidget extends Widget {
    // Required for minified builds
    static $name = 'MyWidget';

    // Type for items config
    static type = 'mywidget';

    // Declare configurable properties
    static configurable = {
        customProp: null,

        // With default value
        mode: 'default'
    };

    // Template for widget content
    compose() {
        return {
            class: 'my-widget',
            children: [
                {
                    class: 'my-widget-header',
                    reference: 'headerElement',
                    text: this.customProp
                },
                {
                    class: 'my-widget-body',
                    reference: 'bodyElement'
                }
            ]
        };
    }

    // Property change handler (auto-detected by name)
    updateCustomProp(value) {
        if (this.headerElement) {
            this.headerElement.textContent = value;
        }
    }
}

// Register the widget type
Widget.register(MyWidget);

// Use in config
const container = new Container({
    items: [
        { type: 'mywidget', customProp: 'Hello!' }
    ]
});
```

### Custom Field Widget

```typescript
import { TextField, TextFieldConfig } from '@bryntum/gantt';

interface PhoneFieldConfig extends TextFieldConfig {
    type?: 'phonefield';
    countryCode?: string;
}

class PhoneField extends TextField {
    static $name = 'PhoneField';
    static type = 'phonefield';

    static configurable = {
        countryCode: '+1',
        placeholder: '(555) 555-5555',

        // Configure input
        inputType: 'tel',

        // Add phone icon
        triggers: {
            phone: {
                cls: 'b-fa b-fa-phone',
                align: 'start'
            }
        }
    };

    // Format phone number on change
    changeValue(value, was) {
        // Format the value
        const formatted = this.formatPhone(value);
        return super.changeValue(formatted, was);
    }

    formatPhone(value) {
        if (!value) return '';

        // Remove non-digits
        const digits = value.replace(/\D/g, '');

        // Format as (XXX) XXX-XXXX
        if (digits.length >= 10) {
            return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`;
        }

        return value;
    }

    get fullNumber() {
        return `${this.countryCode} ${this.value}`;
    }
}

Widget.register(PhoneField);
```

### Custom Container Widget

```typescript
import { Panel, PanelConfig } from '@bryntum/gantt';

interface CardConfig extends PanelConfig {
    type?: 'card';
    image?: string;
    description?: string;
}

class Card extends Panel {
    static $name = 'Card';
    static type = 'card';

    static configurable = {
        image: null,
        description: null,

        // Override Panel defaults
        cls: 'my-card',
        collapsible: false,

        // Default tools
        tools: {
            close: {
                cls: 'b-fa b-fa-times',
                handler: 'onCloseClick'
            }
        }
    };

    compose() {
        const result = super.compose();

        // Add image before body content
        if (this.image) {
            result.children = [
                {
                    tag: 'img',
                    class: 'my-card-image',
                    src: this.image
                },
                ...result.children
            ];
        }

        return result;
    }

    // Generate items from description
    get items() {
        return [
            {
                type: 'widget',
                html: this.description,
                cls: 'my-card-description'
            },
            ...super.items
        ];
    }

    onCloseClick() {
        this.destroy();
    }
}

Widget.register(Card);

// Usage
const card = new Card({
    title: 'Project Update',
    image: '/images/project.png',
    description: 'Latest project status...',

    items: [
        { type: 'button', text: 'View Details' }
    ]
});
```

### Widget Mixins

```typescript
import { Widget, Delayable } from '@bryntum/gantt';

// Create a mixin
const AutoRefreshable = (Target) => class extends Target {
    static configurable = {
        ...Target.configurable,
        autoRefreshInterval: 30000
    };

    afterConstruct() {
        super.afterConstruct?.();

        if (this.autoRefreshInterval) {
            this.startAutoRefresh();
        }
    }

    startAutoRefresh() {
        this.refreshTimer = this.setInterval(
            () => this.refresh(),
            this.autoRefreshInterval
        );
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            this.clearInterval(this.refreshTimer);
        }
    }

    refresh() {
        // Override in subclass
    }

    doDestroy() {
        this.stopAutoRefresh();
        super.doDestroy();
    }
};

// Apply mixin
class LiveDataWidget extends AutoRefreshable(Panel) {
    static $name = 'LiveDataWidget';
    static type = 'livedatawidget';

    refresh() {
        console.log('Refreshing data...');
        // Fetch and update data
    }
}

Widget.register(LiveDataWidget);
```

---

## 11. Gantt-Specific Widgets

### TaskEditor

The TaskEditor is a specialized Popup for editing task properties.

```typescript
const gantt = new Gantt({
    features: {
        taskEdit: {
            // TaskEditor configuration
            editorConfig: {
                title: 'Edit Task',
                width: 500,
                height: 'auto',

                // Modal behavior
                modal: true,
                trapFocus: true,

                // Tabs configuration
                items: {
                    generalTab: {
                        title: 'General',
                        items: {
                            nameField: { type: 'textfield', label: 'Name', name: 'name' },
                            startDateField: { type: 'datefield', label: 'Start', name: 'startDate' },
                            endDateField: { type: 'datefield', label: 'End', name: 'endDate' },
                            durationField: { type: 'durationfield', label: 'Duration', name: 'duration' },
                            percentDoneField: { type: 'percentfield', label: 'Complete', name: 'percentDone' }
                        }
                    },
                    notesTab: {
                        title: 'Notes',
                        items: {
                            noteField: { type: 'textarea', label: 'Notes', name: 'note', height: 200 }
                        }
                    }
                }
            },

            // Control which tabs are visible
            items: {
                generalTab: true,
                dependencyTab: true,
                predecessorsTab: true,
                successorsTab: true,
                resourcesTab: true,
                advancedTab: true,
                notesTab: true
            }
        }
    }
});
```

### TaskEditor Events

```typescript
gantt.on({
    // Before editor shows
    beforeTaskEditShow: ({ taskRecord, editor }) => {
        // Customize editor before display
        if (taskRecord.milestone) {
            editor.widgetMap.durationField.hidden = true;
        }
    },

    // After save
    afterTaskSave: ({ taskRecord, editor }) => {
        console.log('Task saved:', taskRecord.name);
    },

    // After any edit completion (save, cancel, or delete)
    afterTaskEdit: ({ taskRecord, editor }) => {
        // Cleanup or refresh
    },

    // Before delete from editor
    beforeTaskDelete: ({ taskRecord }) => {
        // Return false to prevent deletion
        return confirm(`Delete task "${taskRecord.name}"?`);
    }
});
```

### Custom TaskEditor Tabs

```typescript
const gantt = new Gantt({
    features: {
        taskEdit: {
            editorConfig: {
                items: {
                    // Add custom tab
                    customTab: {
                        type: 'container',
                        title: 'Custom',
                        weight: 600,  // Position after built-in tabs
                        items: {
                            customField: {
                                type: 'textfield',
                                label: 'Custom Field',
                                name: 'customField'
                            },
                            externalLink: {
                                type: 'button',
                                text: 'Open in External System',
                                onClick: async ({ source }) => {
                                    const editor = source.up('taskeditor');
                                    const task = editor.record;
                                    window.open(`https://system.com/task/${task.id}`);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
});
```

### ResourceCombo Widget

Used for assigning resources to tasks:

```typescript
const gantt = new Gantt({
    features: {
        taskEdit: {
            editorConfig: {
                items: {
                    resourcesTab: {
                        items: {
                            resources: {
                                type: 'combo',
                                label: 'Assigned To',
                                multiSelect: true,
                                store: gantt.resourceStore,
                                valueField: 'id',
                                displayField: 'name',
                                chipView: {
                                    closable: true
                                }
                            }
                        }
                    }
                }
            }
        }
    }
});
```

### DurationField Widget

Specialized field for entering durations:

```typescript
import { DurationField, DurationFieldConfig } from '@bryntum/gantt';

interface DurationFieldConfig extends FieldConfig {
    // Value is a Duration object with magnitude and unit
    value?: Duration | number;

    // Default unit when entering just a number
    unit?: DurationUnit;

    // Allow negative durations
    allowNegative?: boolean;

    // Show unit picker
    unitPickerVisible?: boolean;

    // Available units
    allowedUnits?: DurationUnit[];
}

// Usage
const durationField = new DurationField({
    label: 'Duration',
    value: { magnitude: 5, unit: 'day' },
    unit: 'day',
    allowedUnits: ['hour', 'day', 'week'],
    min: 1,
    max: 365
});
```

### PercentField Widget

For entering percentage values:

```typescript
import { PercentField, PercentFieldConfig } from '@bryntum/gantt';

const percentField = new PercentField({
    label: 'Complete',
    value: 50,
    min: 0,
    max: 100,
    step: 5,
    showSlider: true,
    sliderConfig: {
        showTooltip: true
    }
});
```

### TimeField Widget

For time-only input:

```typescript
import { TimeField, TimeFieldConfig } from '@bryntum/gantt';

const timeField = new TimeField({
    label: 'Start Time',
    value: '09:00',
    format: 'HH:mm',
    step: '30m',  // 30-minute increments
    min: '08:00',
    max: '18:00'
});
```

### UndoRedo Widget

Add undo/redo buttons to toolbar:

```typescript
const gantt = new Gantt({
    tbar: [
        {
            type: 'undoredo',
            ref: 'undoRedo',
            // Link to project's STM (StateTrackingManager)
            project: gantt.project
        }
    ],

    project: {
        stm: {
            // Enable state tracking
            autoRecord: true
        }
    }
});

// Programmatic access
const undoButton = gantt.widgetMap.undoRedo;
undoButton.undo();  // Undo last action
undoButton.redo();  // Redo last undone action
```

### ViewPreset Widget

Quick zoom level selection:

```typescript
const gantt = new Gantt({
    tbar: [
        {
            type: 'viewpresetcombo',
            ref: 'viewPreset',
            value: 'weekAndDay',
            presets: [
                'hourAndDay',
                'dayAndWeek',
                'weekAndDay',
                'weekAndMonth',
                'monthAndYear',
                'year'
            ]
        }
    ]
});
```

---

## 12. Gantt Toolbar Patterns

### Standard Gantt Toolbar

```typescript
const gantt = new Gantt({
    tbar: [
        // Add task button
        {
            type: 'button',
            icon: 'b-fa b-fa-plus',
            text: 'Add Task',
            onClick: () => {
                gantt.taskStore.rootNode.appendChild({
                    name: 'New Task',
                    duration: 1
                });
            }
        },
        '|',
        // Expand/Collapse
        {
            type: 'button',
            icon: 'b-fa b-fa-expand-alt',
            tooltip: 'Expand All',
            onClick: () => gantt.expandAll()
        },
        {
            type: 'button',
            icon: 'b-fa b-fa-compress-alt',
            tooltip: 'Collapse All',
            onClick: () => gantt.collapseAll()
        },
        '|',
        // Zoom controls
        {
            type: 'button',
            icon: 'b-fa b-fa-search-minus',
            tooltip: 'Zoom Out',
            onClick: () => gantt.zoomOut()
        },
        {
            type: 'button',
            icon: 'b-fa b-fa-search-plus',
            tooltip: 'Zoom In',
            onClick: () => gantt.zoomIn()
        },
        {
            type: 'button',
            icon: 'b-fa b-fa-compress-arrows-alt',
            tooltip: 'Zoom to Fit',
            onClick: () => gantt.zoomToFit()
        },
        '->',
        // Search
        {
            type: 'textfield',
            ref: 'searchField',
            placeholder: 'Search tasks...',
            clearable: true,
            width: 200,
            triggers: {
                search: {
                    cls: 'b-fa b-fa-search',
                    align: 'end'
                }
            },
            onChange: ({ value }) => {
                gantt.taskStore.filter({
                    id: 'search',
                    filterBy: record => record.name.toLowerCase().includes(value.toLowerCase())
                });
            }
        }
    ]
});
```

### Feature Toggle Buttons

```typescript
const gantt = new Gantt({
    tbar: [
        {
            type: 'button',
            icon: 'b-fa b-fa-project-diagram',
            text: 'Dependencies',
            toggleable: true,
            pressed: true,
            onToggle: ({ pressed }) => {
                gantt.features.dependencies.disabled = !pressed;
            }
        },
        {
            type: 'button',
            icon: 'b-fa b-fa-chart-line',
            text: 'Baselines',
            toggleable: true,
            pressed: false,
            onToggle: ({ pressed }) => {
                gantt.features.baselines.disabled = !pressed;
            }
        },
        {
            type: 'button',
            icon: 'b-fa b-fa-route',
            text: 'Critical Path',
            toggleable: true,
            pressed: false,
            onToggle: ({ pressed }) => {
                if (pressed) {
                    gantt.features.criticalPaths.highlightPaths();
                } else {
                    gantt.features.criticalPaths.unhighlightPaths();
                }
            }
        }
    ]
});
```

---

## 13. Cross-References

### Related Deep-Dive Documents

| Document | Relationship |
|----------|--------------|
| [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) | Widget events, event patterns |
| [DEEP-DIVE-KEYBOARD-A11Y](./DEEP-DIVE-KEYBOARD-A11Y.md) | Widget keyboard navigation |
| [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) | Custom widget rendering |
| [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) | TaskEditor and scheduling fields |
| [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) | React wrapper components |
| [DEEP-DIVE-DEMO-PATTERNS](./DEEP-DIVE-DEMO-PATTERNS.md) | Custom widget examples from demos |

### Key API References (Level 1)

- `WidgetConfig` - Base widget configuration
- `ContainerConfig` - Container with child widgets
- `TaskEditConfig` - TaskEditor feature
- `ToolbarConfig` - Toolbar setup

---

## Summary

The Bryntum Widget system provides a comprehensive, hierarchical component architecture:

1. **Widget** - Base class with lifecycle, rendering, and event handling
2. **Container** - Holds child widgets with layout management
3. **Panel** - Adds headers, toolbars, and collapsible features
4. **Field** - Input fields with validation and data binding
5. **Button** - Action triggers with toggle and menu support
6. **Menu/MenuItem** - Context menus and dropdowns
7. **Popup** - Floating panels and modals

Key patterns:
- Use `type` property for declarative widget creation
- Use `ref` property for easy widget access via `widgetMap`
- Configure via object literals or class extensions
- Events use on-prefixed properties or `listeners` config
- Custom widgets extend base classes and register with `Widget.register()`

For complete API documentation, refer to the Bryntum Gantt documentation at https://bryntum.com/products/gantt/docs/.
