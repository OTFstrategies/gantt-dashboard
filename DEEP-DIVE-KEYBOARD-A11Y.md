# Deep Dive: Keyboard Navigation and Accessibility in Bryntum Gantt

## Level 2 Technical Analysis

This document provides an in-depth analysis of keyboard navigation and accessibility features in Bryntum Gantt 7.1.0, based on the TypeScript definitions and API structure.

---

## Table of Contents

1. [Keyboard Navigation Overview](#1-keyboard-navigation-overview)
2. [Grid Cell Navigation](#2-grid-cell-navigation)
3. [KeyMap Configuration](#3-keymap-configuration)
4. [Focus Management](#4-focus-management)
5. [ARIA Attributes and Roles](#5-aria-attributes-and-roles)
6. [Screen Reader Support](#6-screen-reader-support)
7. [Theme and High Contrast Mode](#7-theme-and-high-contrast-mode)
8. [Keyboard Shortcuts for Common Operations](#8-keyboard-shortcuts-for-common-operations)
9. [Focus Trapping in Dialogs](#9-focus-trapping-in-dialogs)
10. [Accessibility Configuration Patterns](#10-accessibility-configuration-patterns)

---

## 1. Keyboard Navigation Overview

Bryntum Gantt provides comprehensive keyboard navigation support through its widget system. The navigation model is built on a hierarchical focus management system that extends from the base `Widget` class through to specialized grid and scheduling components.

### Core Navigation Principles

- Arrow keys navigate between cells in the grid
- Tab key moves between focusable elements and widgets
- Enter key activates cell editing or confirms actions
- Escape key cancels operations and closes dialogs
- Focus follows a logical order based on visual layout

### Key Navigation Components

```typescript
// The Gantt inherits keyboard navigation from Grid and Widget
interface GanttKeyboardConfig {
  // Tab index controls keyboard accessibility order
  tabIndex?: number;

  // KeyMap defines custom keyboard shortcuts
  keyMap?: Record<string, KeyMapConfig>;
}
```

---

## 2. Grid Cell Navigation

The grid component in Gantt provides built-in navigation through cells using arrow keys.

### Cell Navigation Methods

```typescript
// Scroll a specific cell into view (useful for keyboard navigation)
gantt.scrollCellIntoView(cellContext: GridLocationConfig | GridLocation): Promise<any>;

// Scroll a column into view
gantt.scrollColumnIntoView(
  column: Column | string | number,
  options?: BryntumScrollOptions
): Promise<any>;

// Scroll a row into view
gantt.scrollRowIntoView(
  recordOrId: Model | string | number,
  options?: GridScrollOptions
): Promise<any>;
```

### GridLocation Configuration

```typescript
interface GridLocationConfig {
  // Record or record ID
  id?: string | number;

  // Column reference by id, field, or column object
  columnId?: string;
  column?: Column | string;
  field?: string;

  // Optional: focus the cell when scrolled into view
  focus?: boolean;
}
```

### Practical Cell Navigation Example

```typescript
const gantt = new Gantt({
  appendTo: 'container',

  listeners: {
    // Handle custom navigation needs
    navigate({ source, location }) {
      console.log('Navigated to:', location.record?.name, location.column?.field);
    }
  }
});

// Programmatically navigate to a specific cell
async function navigateToCell(taskId: string, columnField: string) {
  await gantt.scrollCellIntoView({
    id: taskId,
    field: columnField,
    focus: true
  });
}

// Navigate to the first task's name cell
navigateToCell('task-1', 'name');
```

---

## 3. KeyMap Configuration

The KeyMap system allows customization of keyboard shortcuts throughout the Gantt component.

### KeyMapConfig Type Definition

```typescript
// From Core/widget/mixin/KeyMap
type KeyMapConfig =
  | string           // Method name to call
  | number           // Key code
  | Function         // Direct handler function
  | Record<string, string | number | Function>  // Nested config
  | null;            // Disable the key
```

### Configuring KeyMaps

```typescript
const gantt = new Gantt({
  appendTo: 'container',

  // Widget-level keyMap configuration
  keyMap: {
    // Arrow keys with modifier for custom navigation
    'Ctrl+ArrowUp': 'onMoveTaskUp',
    'Ctrl+ArrowDown': 'onMoveTaskDown',

    // Quick actions
    'Delete': 'onDeleteTask',
    'Insert': 'onAddTask',

    // Navigation shortcuts
    'Home': 'navigateToStart',
    'End': 'navigateToEnd',

    // Disable a default shortcut
    'Escape': null,

    // Function handler
    'Ctrl+S': () => {
      gantt.project.sync();
    },

    // Nested configuration with conditions
    'Enter': {
      handler: 'onEnterKey',
      weight: 100  // Priority when multiple handlers exist
    }
  },

  // Instance methods referenced by keyMap
  onMoveTaskUp() {
    const selected = this.selectedRecord;
    if (selected) {
      selected.parent?.insertChild(selected, selected.previousSibling);
    }
  },

  onMoveTaskDown() {
    const selected = this.selectedRecord;
    if (selected && selected.nextSibling) {
      selected.parent?.insertChild(selected, selected.nextSibling.nextSibling);
    }
  }
});
```

### Modifier Key Combinations

KeyMap supports standard modifier prefixes (case-insensitive):
- `Ctrl+` - Control key
- `Alt+` - Alt/Option key
- `Meta+` - Meta/Command key (Mac)
- `Shift+` - Shift key

```typescript
const keyMapExamples: Record<string, KeyMapConfig> = {
  // Single modifier
  'Ctrl+A': 'selectAll',
  'Alt+N': 'newTask',

  // Multiple modifiers
  'Ctrl+Shift+Z': 'redo',
  'Ctrl+Alt+Delete': 'clearAll',

  // Function keys
  'F2': 'startEditing',
  'F5': 'refresh'
};
```

---

## 4. Focus Management

Bryntum Gantt implements a sophisticated focus management system with events and properties for tracking focus state.

### Focus Events

```typescript
interface FocusEventData {
  source: Widget;
  fromElement: HTMLElement;
  toElement: HTMLElement;
  fromWidget: Widget;
  toWidget: Widget;
  backwards: boolean;  // True if focus moved backwards in document order
}

const gantt = new Gantt({
  listeners: {
    // Fired when focus enters the widget
    focusIn(event: FocusEventData) {
      console.log('Focus entered from:', event.fromWidget?.id);
    },

    // Fired when focus exits the widget's ownership tree
    focusOut(event: FocusEventData) {
      console.log('Focus exited to:', event.toWidget?.id);
    }
  }
});
```

### Focus Properties

```typescript
interface WidgetFocusProperties {
  // The primary focusable element within the widget
  readonly focusElement: HTMLElement;

  // The currently focusable element (may differ from focusElement)
  readonly focusableElement: HTMLElement;

  // Tab index for keyboard navigation order
  tabIndex: number;
}
```

### TabIndex Configuration

```typescript
const gantt = new Gantt({
  // Control tab order position
  // Use -1 to remove from tab order but allow programmatic focus
  tabIndex: 0,

  columns: [
    {
      field: 'name',
      text: 'Task Name',
      // Columns don't have individual tabIndex but cells do participate in navigation
    }
  ]
});

// Programmatically focus the Gantt
gantt.focus();
```

### Focus Utility Methods

```typescript
// Check if an element is focusable
import { DomHelper } from '@bryntum/gantt';

const isFocusable = DomHelper.isFocusable(element);

// The widget provides a focus() method
const toolbar = gantt.widgetMap.toolbar;
toolbar?.focus();
```

---

## 5. ARIA Attributes and Roles

Bryntum Gantt provides ARIA support for accessibility through configurable labels and automatic role assignment.

### Column ARIA Configuration

```typescript
interface ColumnAriaConfig {
  // ARIA label for the column header
  ariaLabel?: string;

  // ARIA label for cells in this column
  cellAriaLabel?: string;
}

const gantt = new Gantt({
  columns: [
    {
      field: 'name',
      text: 'Task Name',
      // Custom ARIA labels for better screen reader support
      ariaLabel: 'Task name column header',
      cellAriaLabel: 'Task name'
    },
    {
      field: 'startDate',
      text: 'Start Date',
      ariaLabel: 'Start date column header',
      cellAriaLabel: 'Task start date'
    },
    {
      field: 'duration',
      text: 'Duration',
      ariaLabel: 'Task duration column header',
      cellAriaLabel: 'Duration in days'
    },
    {
      field: 'percentDone',
      text: 'Progress',
      ariaLabel: 'Completion percentage column header',
      cellAriaLabel: 'Percent complete'
    }
  ]
});
```

### Widget ARIA Labels

```typescript
interface WidgetAriaConfig {
  // Direct ARIA label
  ariaLabel?: string;

  // ARIA description (uses aria-describedby)
  ariaDescription?: string;
}

// Button with ARIA configuration
const addTaskButton: ButtonConfig = {
  text: 'Add Task',
  icon: 'b-icon-add',
  ariaLabel: 'Add a new task to the project',
  ariaDescription: 'Opens a dialog to create a new task'
};
```

### Gantt-Specific ARIA Patterns

```typescript
const gantt = new Gantt({
  columns: [
    // Name column with tree structure
    {
      type: 'name',
      field: 'name',
      ariaLabel: 'Task hierarchy and name',
      cellAriaLabel: 'Task name with expand/collapse control'
    },

    // Checkbox columns
    {
      type: 'check',
      field: 'milestone',
      text: 'Milestone',
      ariaLabel: 'Milestone indicator',
      // Checkbox widget within cell has its own ARIA config
      widgets: [{
        type: 'checkbox',
        ariaLabel: 'Mark as milestone'
      }]
    },

    // Date columns
    {
      type: 'date',
      field: 'endDate',
      text: 'End Date',
      ariaLabel: 'Task end date',
      cellAriaLabel: 'End date value'
    }
  ],

  // Timeline features may have their own ARIA descriptions
  features: {
    taskTooltip: {
      // Tooltips can provide additional context for screen readers
    }
  }
});
```

---

## 6. Screen Reader Support

While Bryntum Gantt doesn't have a dedicated screen reader API, it supports accessibility through proper semantic markup and ARIA attributes.

### Best Practices for Screen Reader Compatibility

```typescript
const gantt = new Gantt({
  // Use descriptive column texts
  columns: [
    {
      field: 'name',
      text: 'Task Name',
      ariaLabel: 'Task name with hierarchy controls',

      // Custom renderer can include accessible text
      renderer({ record, value }) {
        return {
          tag: 'span',
          children: [
            {
              tag: 'span',
              className: 'visually-hidden',
              text: `Level ${record.childLevel + 1}: `
            },
            value
          ]
        };
      }
    }
  ],

  // Configure features for accessibility
  features: {
    cellTooltip: {
      // Provide context that screen readers can access
      getHtml: ({ record, column }) => {
        return `${column.text}: ${record.get(column.field)}`;
      }
    }
  }
});
```

### Accessible Status Announcements

```typescript
// Pattern for announcing status changes to screen readers
function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = document.getElementById('sr-announcer')
    || createScreenReaderAnnouncer();

  announcer.setAttribute('aria-live', priority);
  announcer.textContent = message;
}

function createScreenReaderAnnouncer(): HTMLElement {
  const div = document.createElement('div');
  div.id = 'sr-announcer';
  div.setAttribute('role', 'status');
  div.setAttribute('aria-live', 'polite');
  div.className = 'visually-hidden';
  document.body.appendChild(div);
  return div;
}

// Use with Gantt events
gantt.on({
  taskAdd({ taskRecord }) {
    announceToScreenReader(`Task "${taskRecord.name}" added`);
  },

  taskRemove({ taskRecord }) {
    announceToScreenReader(`Task "${taskRecord.name}" removed`);
  },

  selectionChange({ selection }) {
    if (selection.length === 1) {
      announceToScreenReader(`Selected: ${selection[0].name}`);
    } else if (selection.length > 1) {
      announceToScreenReader(`${selection.length} tasks selected`);
    }
  }
});
```

---

## 7. Theme and High Contrast Mode

Bryntum provides theme management utilities that support accessibility, including dark mode detection.

### Theme Detection and Management

```typescript
import { DomHelper } from '@bryntum/gantt';

// Check if current theme is dark
const isDark = DomHelper.isDarkTheme;

// Get detailed theme information
const themeInfo = DomHelper.themeInfo;
// Returns: { name: string, fileName: string, buttonRenditionStyle: string }

// Get theme info for a specific context (useful in Shadow DOM)
const contextThemeInfo = DomHelper.getThemeInfo(element);

// Change theme programmatically
await DomHelper.setTheme('stockholm-dark');

// Toggle between light and dark versions of current theme
DomHelper.toggleLightDarkTheme();
```

### Theme Information Type

```typescript
interface ThemeInfo {
  // Display name (e.g., "SvalbardDark")
  name: string;

  // Filename/identifier (e.g., "svalbard-dark")
  fileName: string;

  // Button rendering style (e.g., "text", "outlined", "filled")
  buttonRenditionStyle: string;
}
```

### High Contrast Support Pattern

```typescript
// Custom high contrast mode support
const gantt = new Gantt({
  appendTo: 'container',

  // React to system preference changes
  listeners: {
    paint() {
      // Check for high contrast mode using media query
      const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;

      if (prefersHighContrast) {
        this.element.classList.add('high-contrast-mode');
      }
    }
  }
});

// Listen for contrast preference changes
window.matchMedia('(prefers-contrast: more)').addEventListener('change', (e) => {
  gantt.element.classList.toggle('high-contrast-mode', e.matches);
});
```

### Available Themes

Bryntum provides multiple built-in themes including:
- Classic / Classic Dark
- Stockholm / Stockholm Dark
- Material
- Svalbard / Svalbard Dark

```typescript
// Example theme switching for accessibility
class AccessibilityManager {
  private gantt: Gantt;

  constructor(gantt: Gantt) {
    this.gantt = gantt;
    this.setupPreferenceListeners();
  }

  private setupPreferenceListeners() {
    // Dark mode preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (e.matches) {
        DomHelper.setTheme('stockholm-dark');
      } else {
        DomHelper.setTheme('stockholm');
      }
    });

    // Reduced motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      // Disable animations if user prefers reduced motion
      this.gantt.transitionDuration = e.matches ? 0 : 300;
    });
  }
}
```

---

## 8. Keyboard Shortcuts for Common Operations

### Cell Editing Shortcuts

```typescript
const gantt = new Gantt({
  features: {
    cellEdit: {
      // Cell editing is controlled by the CellEdit feature
      // Default keys:
      // - Enter: Start editing / Finish editing
      // - Tab: Move to next cell while editing
      // - Escape: Cancel editing
      // - F2: Start editing (alternative)
    }
  }
});

// CellEdit feature methods
interface CellEditFeature {
  // Start editing a specific cell
  startEditing(cellContext: GridLocationConfig): Promise<any>;

  // Finish current edit
  finishEditing(): Promise<any>;

  // Cancel current edit
  cancelEditing(silent?: boolean): boolean;
}
```

### Task Editing Shortcuts

```typescript
// TaskEdit feature for task dialog
interface TaskEditConfig {
  type?: 'taskEdit';
  disabled?: boolean;

  // Configuration for the TaskEditor popup
  editorConfig?: TaskEditorBaseConfig;
}

const gantt = new Gantt({
  features: {
    taskEdit: {
      // Double-click or Enter on task bar opens editor
      editorConfig: {
        // TaskEditor inherits keyboard handling from Popup
      }
    }
  }
});

// Programmatically edit a task
gantt.editTask(taskRecord);
```

### Common Keyboard Shortcuts Reference

| Shortcut | Action | Context |
|----------|--------|---------|
| Arrow Keys | Navigate cells | Grid |
| Enter | Start/finish editing, confirm | Grid, Dialogs |
| Escape | Cancel editing, close dialogs | All |
| Tab | Move to next field/cell | Forms, Grid |
| Shift+Tab | Move to previous field/cell | Forms, Grid |
| F2 | Start cell editing | Grid |
| Delete | Delete selected task | Grid (with handler) |
| Ctrl+Z | Undo | Global (with STM) |
| Ctrl+Shift+Z | Redo | Global (with STM) |
| Home | Navigate to first row | Grid |
| End | Navigate to last row | Grid |
| Page Up/Down | Scroll page | Grid, Timeline |

### Custom Shortcut Implementation

```typescript
const gantt = new Gantt({
  keyMap: {
    // Zoom controls
    'Ctrl+Plus': 'zoomIn',
    'Ctrl+Minus': 'zoomOut',
    'Ctrl+0': 'zoomToFit',

    // Task operations
    'Ctrl+N': 'addNewTask',
    'Ctrl+D': 'duplicateTask',
    'Ctrl+Shift+Delete': 'deleteTask',

    // Navigation
    'Ctrl+Home': 'scrollToProjectStart',
    'Ctrl+End': 'scrollToProjectEnd',
    'Ctrl+T': 'scrollToToday',

    // Expand/Collapse
    'Ctrl+ArrowRight': 'expandAll',
    'Ctrl+ArrowLeft': 'collapseAll'
  },

  zoomIn() {
    this.zoomIn();
  },

  zoomOut() {
    this.zoomOut();
  },

  zoomToFit() {
    this.zoomToFit();
  },

  addNewTask() {
    const parent = this.selectedRecord || this.taskStore.rootNode;
    parent.appendChild({ name: 'New Task' });
  },

  duplicateTask() {
    const task = this.selectedRecord;
    if (task) {
      const clone = task.copy();
      clone.name = `${task.name} (Copy)`;
      task.parent?.appendChild(clone);
    }
  },

  scrollToToday() {
    this.scrollToDate(new Date(), { block: 'center' });
  },

  expandAll() {
    this.expandAll();
  },

  collapseAll() {
    this.collapseAll();
  }
});
```

---

## 9. Focus Trapping in Dialogs

Bryntum provides focus trapping in modal dialogs through the `trapFocus` configuration.

### trapFocus Configuration

```typescript
interface PanelTrapFocusConfig {
  // Trap focus within the panel
  trapFocus?: boolean;
}

// TaskEditor is a Popup that can trap focus
const gantt = new Gantt({
  features: {
    taskEdit: {
      editorConfig: {
        // Enable focus trapping in task editor
        trapFocus: true,

        // Modal backdrop blocks interaction with background
        modal: true
      }
    }
  }
});
```

### Modal Dialog Configuration

```typescript
interface ModalConfig {
  // Show modal backdrop
  modal?: boolean | {
    // Close when backdrop is clicked
    closeOnMaskTap?: boolean;

    // Use transparent backdrop
    transparent?: boolean;
  };

  // Trap focus within the dialog
  trapFocus?: boolean;
}

// Example: Custom accessible dialog
import { Popup } from '@bryntum/gantt';

const accessibleDialog = new Popup({
  title: 'Task Details',

  // Accessibility settings
  modal: {
    closeOnMaskTap: false  // Prevent accidental dismissal
  },
  trapFocus: true,  // Keep focus within dialog

  // ARIA configuration
  ariaLabel: 'Task details dialog',
  ariaDescription: 'Edit task properties in this dialog',

  items: [
    {
      type: 'textfield',
      name: 'name',
      label: 'Task Name',
      ariaLabel: 'Task name input'
    },
    {
      type: 'datefield',
      name: 'startDate',
      label: 'Start Date',
      ariaLabel: 'Task start date picker'
    }
  ],

  bbar: [
    {
      text: 'Cancel',
      onClick: 'up.close',
      ariaLabel: 'Cancel and close dialog'
    },
    {
      text: 'Save',
      onClick: 'up.onSave',
      ariaLabel: 'Save changes and close dialog'
    }
  ]
});
```

### Carousel Focus Trapping

```typescript
interface CarouselConfig {
  // Use trapFocus to enable carousel navigation via Tab key
  carouselTabKey?: boolean;
}

// Example with tab-based carousel navigation
const carousel: CarouselConfig = {
  type: 'carousel',
  carouselTabKey: true  // Tab navigates between slides
};
```

### Focus Restoration Pattern

```typescript
// Pattern for restoring focus when dialogs close
class FocusManager {
  private previousFocus: HTMLElement | null = null;

  saveFocus() {
    this.previousFocus = document.activeElement as HTMLElement;
  }

  restoreFocus() {
    if (this.previousFocus && document.contains(this.previousFocus)) {
      this.previousFocus.focus();
    }
    this.previousFocus = null;
  }
}

// Usage with Gantt dialogs
const focusManager = new FocusManager();

gantt.on({
  beforeTaskEditShow() {
    focusManager.saveFocus();
  },

  taskEditCanceled() {
    focusManager.restoreFocus();
  }
});
```

---

## 10. Accessibility Configuration Patterns

### Complete Accessible Gantt Configuration

```typescript
import { Gantt, DomHelper } from '@bryntum/gantt';

const gantt = new Gantt({
  appendTo: 'container',

  // Base accessibility
  tabIndex: 0,

  // Keyboard configuration
  keyMap: {
    'F1': 'showHelp',
    'Ctrl+?': 'showKeyboardShortcuts',
    'Escape': 'handleEscape',
    'Delete': 'deleteSelectedTask',
    'Ctrl+Z': 'undo',
    'Ctrl+Shift+Z': 'redo'
  },

  // Accessible columns
  columns: [
    {
      type: 'name',
      field: 'name',
      text: 'Task Name',
      width: 250,
      ariaLabel: 'Task name and hierarchy column',
      cellAriaLabel: 'Task name'
    },
    {
      type: 'date',
      field: 'startDate',
      text: 'Start',
      ariaLabel: 'Start date column',
      cellAriaLabel: 'Start date'
    },
    {
      type: 'date',
      field: 'endDate',
      text: 'End',
      ariaLabel: 'End date column',
      cellAriaLabel: 'End date'
    },
    {
      type: 'duration',
      field: 'duration',
      text: 'Duration',
      ariaLabel: 'Task duration column',
      cellAriaLabel: 'Duration value'
    },
    {
      type: 'percentdone',
      field: 'percentDone',
      text: '% Complete',
      ariaLabel: 'Completion percentage column',
      cellAriaLabel: 'Completion percentage'
    }
  ],

  // Accessible features
  features: {
    cellEdit: {
      // Cell editing with keyboard support
    },

    taskEdit: {
      editorConfig: {
        modal: true,
        trapFocus: true,
        ariaLabel: 'Task editor dialog'
      }
    },

    taskTooltip: {
      // Tooltips provide additional context
    }
  },

  // Focus management
  listeners: {
    focusIn({ source, fromWidget }) {
      source.element.setAttribute('aria-activedescendant',
        source.focusElement?.id || '');
    },

    selectionChange({ selection }) {
      // Announce selection to screen readers
      this.announceSelection(selection);
    }
  },

  // Helper methods
  showHelp() {
    // Show help dialog with keyboard shortcuts
  },

  showKeyboardShortcuts() {
    // Display keyboard shortcut reference
  },

  handleEscape() {
    if (this.features.cellEdit.isEditing) {
      this.features.cellEdit.cancelEditing();
    } else {
      this.deselectAll();
    }
  },

  announceSelection(selection: any[]) {
    const message = selection.length === 0
      ? 'No tasks selected'
      : selection.length === 1
        ? `Selected: ${selection[0].name}`
        : `${selection.length} tasks selected`;

    // Use live region for screen reader announcement
    const announcer = document.querySelector('[role="status"]');
    if (announcer) {
      announcer.textContent = message;
    }
  }
});

// Apply system accessibility preferences
function applyAccessibilityPreferences(gantt: Gantt) {
  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    gantt.transitionDuration = 0;
  }

  // Respect color scheme preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark && !DomHelper.isDarkTheme) {
    DomHelper.toggleLightDarkTheme();
  }
}

applyAccessibilityPreferences(gantt);
```

### Accessibility Testing Checklist

When implementing keyboard navigation and accessibility:

1. **Keyboard Navigation**
   - [ ] All interactive elements reachable via Tab
   - [ ] Arrow key navigation works in grid
   - [ ] Enter activates focused elements
   - [ ] Escape closes dialogs and cancels edits
   - [ ] Custom shortcuts don't conflict with browser/OS shortcuts

2. **Focus Management**
   - [ ] Focus visible indicator present
   - [ ] Focus order logical and predictable
   - [ ] Focus trapped in modal dialogs
   - [ ] Focus restored when dialogs close

3. **ARIA Implementation**
   - [ ] All columns have appropriate ARIA labels
   - [ ] Interactive elements have aria-label or aria-labelledby
   - [ ] Dynamic content changes announced via live regions
   - [ ] Roles accurately represent element purpose

4. **Visual Accessibility**
   - [ ] Color contrast meets WCAG AA (4.5:1 for text)
   - [ ] UI works in high contrast mode
   - [ ] Information not conveyed by color alone
   - [ ] Focus indicators visible in all themes

5. **Screen Reader Compatibility**
   - [ ] Important actions announced
   - [ ] Navigation landmarks present
   - [ ] Form fields properly labeled
   - [ ] Error messages announced

---

## Cross-References

### Related Deep-Dive Documents

| Document | Relationship |
|----------|--------------|
| [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) | Widget keyboard handling, focus management |
| [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) | Keyboard events, navigation events |
| [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) | Focus styling, ARIA in DOM |

### Key API References (Level 1)

- `GanttConfig.keyMap` - Keyboard shortcut configuration
- `WidgetConfig.ariaLabel` - ARIA label configuration
- `GridConfig.cellAriaLabel` - Cell ARIA labels
- `ContainerConfig.trapFocus` - Focus trapping

---

## Summary

Bryntum Gantt provides a comprehensive accessibility infrastructure through:

- **KeyMap configuration** for customizable keyboard shortcuts
- **Focus management events** (focusIn, focusOut) for tracking focus state
- **ARIA support** through ariaLabel and cellAriaLabel properties
- **Focus trapping** via trapFocus for modal dialogs
- **Theme utilities** including dark mode detection and switching
- **Navigation methods** for programmatic scrolling and focus

Implementing accessible Gantt applications requires combining these built-in features with proper ARIA labeling, screen reader announcements, and respect for user preferences like reduced motion and color scheme.

---

## References

- Bryntum Gantt 7.1.0 TypeScript Definitions
- Source: `C:\Users\Mick\Projects\gantt-dashboard\vendor\gantt\gantt.d.ts`
- API Documentation: https://bryntum.com/products/gantt/docs/
