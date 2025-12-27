# IMPL-ACCESSIBILITY-ADVANCED.md
## Advanced Accessibility Implementation

**Purpose**: Implement comprehensive accessibility features including ARIA attributes, keyboard navigation, screen reader support, and WCAG compliance.

**Products**: All Bryntum products

---

## Overview

Bryntum components include built-in accessibility features that comply with WCAG 2.1 guidelines. This document covers customization and advanced implementation patterns for:
- ARIA attributes and landmarks
- Keyboard navigation and shortcuts
- Screen reader optimization
- Focus management
- High contrast and reduced motion support

---

## ARIA Configuration

### Column ARIA Labels

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    columns: [
        {
            field: 'name',
            text: 'Task Name',
            // Header element aria-label
            ariaLabel: 'Task name column header',
            // Cell aria-label (can use template)
            cellAriaLabel: ({ record }) => `Task: ${record.name}`
        },
        {
            field: 'status',
            text: 'Status',
            ariaLabel: 'Task status column',
            cellAriaLabel: ({ record }) => `Status: ${record.status}`
        },
        {
            type: 'check',
            field: 'done',
            text: 'Complete',
            // Checkbox-specific aria-label
            checkAriaLabel: ({ record }) => `Mark ${record.name} as complete`
        },
        {
            type: 'action',
            actions: [
                {
                    cls: 'b-fa b-fa-edit',
                    tooltip: 'Edit task',
                    // Action button aria-label
                    ariaLabel: 'Edit this task'
                },
                {
                    cls: 'b-fa b-fa-trash',
                    tooltip: 'Delete task',
                    ariaLabel: 'Delete this task'
                }
            ]
        }
    ]
});
```

### Feature ARIA Descriptions

```javascript
const grid = new Grid({
    features: {
        cellTooltip: {
            // Describes the feature for screen readers
            ariaDescription: 'Press F2 to show tooltip for current cell',
            ariaLabel: 'Cell tooltip information'
        },
        filter: {
            ariaDescription: 'Use column header menu to filter data'
        },
        sort: {
            ariaDescription: 'Click column headers to sort, Shift-click for multi-sort'
        }
    }
});
```

---

## Keyboard Navigation

### Built-in Keyboard Shortcuts

Bryntum components support extensive keyboard navigation out of the box:

| Key | Action |
|-----|--------|
| Arrow keys | Navigate cells/events |
| Enter | Edit cell / Open event editor |
| Escape | Cancel edit / Close popup |
| Tab | Move to next cell |
| Shift+Tab | Move to previous cell |
| Space | Toggle selection / Expand node |
| Home | First cell/row |
| End | Last cell/row |
| Page Up/Down | Scroll one page |
| Ctrl+A | Select all |
| Ctrl+C | Copy |
| Ctrl+V | Paste |
| Delete | Delete selected |

### Custom KeyMap Configuration

```javascript
const grid = new Grid({
    features: {
        cellEdit: {
            keyMap: {
                // Custom shortcuts for cell editing
                'Ctrl+Enter': 'finishEditing',
                'Ctrl+Shift+Enter': 'finishEditingAndGoUp',
                'F2': 'startEditing'
            }
        },
        cellCopyPaste: {
            keyMap: {
                'Ctrl+C': 'copy',
                'Ctrl+X': 'cut',
                'Ctrl+V': 'paste',
                // Add custom duplicate shortcut
                'Ctrl+D': {
                    handler: 'duplicate',
                    weight: 100
                }
            }
        }
    },

    // Grid-level keyMap
    keyMap: {
        // Custom navigation
        'Ctrl+Home': 'navigateFirstCell',
        'Ctrl+End': 'navigateLastCell',
        // Custom actions
        'Ctrl+N': {
            handler: 'addNewRecord',
            description: 'Add new record'
        },
        'Ctrl+Shift+F': {
            handler: 'focusSearchField',
            description: 'Focus search input'
        }
    },

    // Handler implementations
    addNewRecord() {
        this.store.add({});
        this.editCell(this.store.last, this.columns.first);
    },

    focusSearchField() {
        this.widgetMap.search?.focus();
    }
});
```

### Gantt-Specific Keyboard Shortcuts

```javascript
import { Gantt } from '@bryntum/gantt';

const gantt = new Gantt({
    features: {
        taskEdit: {
            keyMap: {
                'Enter': 'editEvent',
                'Delete': 'deleteSelectedEvents',
                'Ctrl+Shift+Left': 'indentTask',
                'Ctrl+Shift+Right': 'outdentTask'
            }
        }
    },

    keyMap: {
        // Zoom controls
        'Ctrl+Plus': 'zoomIn',
        'Ctrl+Minus': 'zoomOut',
        'Ctrl+0': 'zoomToFit',

        // Navigation
        'Ctrl+Left': 'scrollToEarliest',
        'Ctrl+Right': 'scrollToLatest',
        'Ctrl+T': 'scrollToToday',

        // Task operations
        'Alt+Up': 'moveTaskUp',
        'Alt+Down': 'moveTaskDown'
    },

    scrollToToday() {
        this.scrollToDate(new Date(), { animate: true });
    },

    moveTaskUp() {
        const selected = this.selectedRecords[0];
        if (selected) {
            const parent = selected.parent;
            const index = parent.children.indexOf(selected);
            if (index > 0) {
                parent.insertChild(selected, parent.children[index - 1]);
            }
        }
    }
});
```

---

## Screen Reader Support

### Live Regions

```javascript
class AccessibleGrid extends Grid {
    static configurable = {
        // Announce changes to screen readers
        ariaLiveRegion: true
    };

    construct(config) {
        super.construct(config);

        // Create live region for announcements
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('role', 'status');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'b-sr-only';
        this.element.appendChild(this.liveRegion);
    }

    announce(message) {
        // Clear and set to ensure screen reader picks up change
        this.liveRegion.textContent = '';
        setTimeout(() => {
            this.liveRegion.textContent = message;
        }, 100);
    }

    onStoreChange({ action, records }) {
        switch (action) {
            case 'add':
                this.announce(`${records.length} items added`);
                break;
            case 'remove':
                this.announce(`${records.length} items removed`);
                break;
            case 'update':
                this.announce('Item updated');
                break;
        }
    }
}
```

### Row Descriptions

```javascript
const grid = new Grid({
    columns: [
        {
            field: 'name',
            text: 'Name',
            // Provide context for screen readers
            cellAriaLabel: ({ record, rowIndex }) =>
                `Row ${rowIndex + 1}: ${record.name}, ` +
                `Status: ${record.status}, ` +
                `Priority: ${record.priority}`
        }
    ],

    // Row-level accessibility
    getRowCls({ record }) {
        return {
            'b-important': record.priority === 'high'
        };
    }
});
```

### Accessible Tooltips

```javascript
const gantt = new Gantt({
    features: {
        taskTooltip: {
            template: ({ taskRecord }) => `
                <div role="tooltip" aria-label="Task details for ${taskRecord.name}">
                    <h4>${taskRecord.name}</h4>
                    <dl>
                        <dt>Start Date</dt>
                        <dd>${DateHelper.format(taskRecord.startDate, 'MMMM D, YYYY')}</dd>
                        <dt>End Date</dt>
                        <dd>${DateHelper.format(taskRecord.endDate, 'MMMM D, YYYY')}</dd>
                        <dt>Progress</dt>
                        <dd>${taskRecord.percentDone}% complete</dd>
                    </dl>
                </div>
            `
        }
    }
});
```

---

## Focus Management

### Focus Trap for Modals

```javascript
class AccessiblePopup extends Popup {
    show() {
        super.show();

        // Store previous focus
        this._previousFocus = document.activeElement;

        // Focus first focusable element
        const firstFocusable = this.element.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();

        // Trap focus within popup
        this.element.addEventListener('keydown', this.trapFocus.bind(this));
    }

    hide() {
        // Restore focus
        this._previousFocus?.focus();
        super.hide();
    }

    trapFocus(e) {
        if (e.key !== 'Tab') return;

        const focusableElements = this.element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
        else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
}
```

### Skip Links

```javascript
function addSkipLinks(grid) {
    const skipLink = document.createElement('a');
    skipLink.href = '#' + grid.id;
    skipLink.className = 'b-skip-link';
    skipLink.textContent = 'Skip to data grid';
    skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        grid.focusCell(grid.store.first, grid.columns.first);
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
}

// CSS for skip link
const skipLinkStyles = `
.b-skip-link {
    position: absolute;
    left: -9999px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

.b-skip-link:focus {
    position: fixed;
    left: 10px;
    top: 10px;
    width: auto;
    height: auto;
    padding: 10px 20px;
    background: var(--b-primary-color);
    color: white;
    z-index: 9999;
    text-decoration: none;
    border-radius: 4px;
}
`;
```

---

## High Contrast Mode

### Detect High Contrast

```javascript
function detectHighContrastMode() {
    // Windows High Contrast detection
    const mediaQuery = window.matchMedia('(forced-colors: active)');

    return mediaQuery.matches;
}

function applyHighContrastStyles(grid) {
    if (detectHighContrastMode()) {
        grid.element.classList.add('b-high-contrast');
    }

    // Listen for changes
    window.matchMedia('(forced-colors: active)').addEventListener('change', (e) => {
        grid.element.classList.toggle('b-high-contrast', e.matches);
    });
}
```

### High Contrast CSS

```css
/* High contrast mode overrides */
@media (forced-colors: active) {
    .b-grid-cell {
        border: 1px solid CanvasText !important;
    }

    .b-grid-header {
        border: 2px solid CanvasText !important;
        background: Canvas !important;
        color: CanvasText !important;
    }

    .b-gantt-task {
        border: 2px solid CanvasText !important;
        background: Highlight !important;
        color: HighlightText !important;
    }

    .b-selected .b-grid-cell {
        background: Highlight !important;
        color: HighlightText !important;
    }

    .b-focused .b-grid-cell {
        outline: 3px solid Highlight !important;
        outline-offset: -3px;
    }
}
```

---

## Reduced Motion

### Detect Reduced Motion Preference

```javascript
function respectReducedMotion(grid) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
        // Disable animations
        grid.transitionDuration = 0;
        grid.scrollOptions = { animate: false };
    }

    prefersReducedMotion.addEventListener('change', (e) => {
        grid.transitionDuration = e.matches ? 0 : 300;
    });
}
```

### Reduced Motion CSS

```css
@media (prefers-reduced-motion: reduce) {
    .b-grid,
    .b-gantt,
    .b-calendar {
        /* Disable all transitions */
        * {
            transition: none !important;
            animation: none !important;
        }
    }

    /* Maintain visibility changes without animation */
    .b-grid-cell,
    .b-gantt-task {
        transition: opacity 0s !important;
    }
}
```

---

## WCAG Compliance Checklist

### Level A (Minimum)

```javascript
const wcagConfig = {
    // 1.1.1 Non-text Content
    columns: [{
        field: 'status',
        renderer: ({ value }) => ({
            tag: 'span',
            className: `status-${value}`,
            // Provide text alternative
            children: value,
            'aria-label': `Status: ${value}`
        })
    }],

    // 1.3.1 Info and Relationships
    features: {
        group: {
            // Proper ARIA for grouped content
            renderer: ({ groupTitle }) => ({
                tag: 'h3',
                role: 'heading',
                'aria-level': 3,
                children: groupTitle
            })
        }
    },

    // 2.1.1 Keyboard
    keyMap: {
        // All functionality accessible via keyboard
    },

    // 2.4.1 Bypass Blocks
    // Skip links provided

    // 4.1.2 Name, Role, Value
    // ARIA attributes on interactive elements
};
```

### Level AA (Standard)

```javascript
const wcagAAConfig = {
    // 1.4.3 Contrast (Minimum)
    cls: 'b-accessible-theme',

    // 1.4.4 Resize text
    // Use relative units in CSS

    // 2.4.6 Headings and Labels
    columns: [{
        ariaLabel: 'Descriptive column name'
    }],

    // 2.4.7 Focus Visible
    // Built-in focus styles

    // 3.2.3 Consistent Navigation
    // Consistent keyboard patterns across components
};
```

---

## Testing Accessibility

### Automated Testing

```javascript
import axe from 'axe-core';

async function runAccessibilityAudit(container) {
    const results = await axe.run(container, {
        rules: {
            // Bryntum-specific rules to ignore (false positives)
            'color-contrast': { enabled: true },
            'duplicate-id': { enabled: true }
        }
    });

    if (results.violations.length > 0) {
        console.error('Accessibility violations:', results.violations);
        return false;
    }

    console.log('Accessibility audit passed!');
    return true;
}

// Run audit after component renders
grid.on({
    paint() {
        runAccessibilityAudit(grid.element);
    }
});
```

### Screen Reader Testing Script

```javascript
// Helper to simulate screen reader navigation
class ScreenReaderSimulator {
    constructor(container) {
        this.container = container;
        this.position = 0;
    }

    getAccessibleElements() {
        return Array.from(this.container.querySelectorAll(
            '[role], [aria-label], [aria-describedby], button, input, select, a'
        ));
    }

    readCurrent() {
        const elements = this.getAccessibleElements();
        const current = elements[this.position];

        if (!current) return null;

        return {
            role: current.getAttribute('role') || current.tagName.toLowerCase(),
            name: current.getAttribute('aria-label') ||
                  current.getAttribute('aria-labelledby') ||
                  current.textContent.trim(),
            description: current.getAttribute('aria-describedby'),
            state: {
                expanded: current.getAttribute('aria-expanded'),
                selected: current.getAttribute('aria-selected'),
                checked: current.getAttribute('aria-checked')
            }
        };
    }

    next() {
        this.position++;
        return this.readCurrent();
    }

    previous() {
        this.position--;
        return this.readCurrent();
    }
}
```

---

## Dashboard Integration

### Accessible Dashboard Layout

```javascript
const dashboard = {
    init() {
        // Create main landmark regions
        document.querySelector('#container').innerHTML = `
            <a href="#main-content" class="b-skip-link">Skip to main content</a>
            <nav role="navigation" aria-label="Main navigation">
                <!-- Navigation content -->
            </nav>
            <main id="main-content" role="main" aria-label="Dashboard">
                <div id="gantt-container" role="region" aria-label="Project timeline"></div>
                <div id="grid-container" role="region" aria-label="Task list"></div>
            </main>
        `;

        // Initialize accessible components
        this.gantt = new Gantt({
            appendTo: 'gantt-container',
            ariaLabel: 'Project Gantt chart',
            ...this.ganttConfig
        });

        this.grid = new Grid({
            appendTo: 'grid-container',
            ariaLabel: 'Task list grid',
            ...this.gridConfig
        });
    }
};
```

---

## Best Practices

1. **Always provide text alternatives** for icons and images
2. **Use semantic HTML** where possible (headings, lists, landmarks)
3. **Maintain logical tab order** through proper DOM structure
4. **Provide visible focus indicators** that meet contrast requirements
5. **Announce dynamic changes** through ARIA live regions
6. **Test with real screen readers** (NVDA, VoiceOver, JAWS)
7. **Support keyboard-only operation** for all functionality
8. **Respect user preferences** for motion and contrast

---

## Related Documentation

- **IMPL-CUSTOMIZATION.md**: Theme and styling customization
- **CORE-LOCALIZATION.md**: Internationalization for accessibility
- **BRYNTUM-KEYBOARD-NAV.md**: Complete keyboard shortcut reference
