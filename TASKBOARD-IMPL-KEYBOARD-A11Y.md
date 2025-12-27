# TaskBoard Implementation: Keyboard Navigation & Accessibility

> **Complete guide** voor keyboard navigatie, focus management, en ARIA accessibility in Bryntum TaskBoard.

---

## Overzicht

TaskBoard biedt uitgebreide keyboard navigatie en accessibility ondersteuning:

| Aspect | Ondersteuning |
|--------|---------------|
| **Keyboard Navigation** | Pijltoetsen, Tab, Enter, Escape |
| **Focus Management** | focusIn/focusOut events, programmatic focus |
| **ARIA Attributes** | ariaLabel, ariaDescription, roles |
| **Screen Readers** | Live regions, accessible labels |
| **High Contrast** | Theme ondersteuning |

---

## 1. Keyboard Navigation Basics

### 1.1 Standaard Keyboard Shortcuts

| Toets | Actie |
|-------|-------|
| `Tab` | Navigeer naar volgende focusable element |
| `Shift+Tab` | Navigeer naar vorige focusable element |
| `Enter` | Activeer/open geselecteerd item |
| `Escape` | Annuleer huidige actie, sluit popup |
| `Space` | Toggle selectie |
| Arrow Keys | Navigeer tussen cards/columns |

### 1.2 TaskBoard KeyMap Configuratie

```javascript
const taskBoard = new TaskBoard({
    // Custom keyboard shortcuts
    keyMap: {
        // Quick task creation
        'Insert': 'addNewTask',
        'Ctrl+N': 'addNewTask',

        // Delete selected
        'Delete': 'deleteSelectedTasks',

        // Navigation
        'Home': 'navigateToFirst',
        'End': 'navigateToLast',

        // Undo/Redo
        'Ctrl+Z': 'undo',
        'Ctrl+Y': 'redo',
        'Ctrl+Shift+Z': 'redo',

        // Disable default shortcut
        'Escape': null,

        // Function handler
        'Ctrl+S': () => {
            taskBoard.project.sync();
        }
    },

    // Custom methods referenced by keyMap
    addNewTask() {
        const firstColumn = this.columns[0];
        this.project.taskStore.add({
            name: 'New Task',
            [this.columnField]: firstColumn.id
        });
    },

    deleteSelectedTasks() {
        const selected = this.selectedTasks;
        if (selected.length > 0) {
            this.project.taskStore.remove(selected);
        }
    }
});
```

### 1.3 KeyMapConfig Type

```typescript
type KeyMapConfig =
    | string           // Method naam
    | number           // Key code
    | Function         // Handler function
    | Record<string, string | number | Function>  // Nested config
    | null;            // Disable shortcut

// Gebruik
const keyMap: Record<string, KeyMapConfig> = {
    'Ctrl+A': 'selectAll',           // Method name
    'F2': () => { /* handler */ },   // Function
    'Escape': null,                  // Disabled
    'Enter': {
        handler: 'onEnterKey',
        weight: 100                  // Priority
    }
};
```

---

## 2. SimpleTaskEdit Keyboard Shortcuts

### 2.1 Default Shortcuts

```javascript
features: {
    simpleTaskEdit: {
        // Custom keyMap voor inline editing
        keyMap: {
            'Enter': 'completeEdit',     // Confirm edit
            'Escape': 'cancelEdit',      // Cancel edit
            'Tab': 'editNextField',      // Next editable field
            'Shift+Tab': 'editPrevField' // Previous editable field
        }
    }
}
```

### 2.2 Inline Editor Keyboard Behavior

```javascript
// Text field editor
headerItems: {
    text: {
        field: 'name',
        editor: {
            type: 'text',
            // Escape reverts changes
            revertOnEscape: true
        }
    }
},

// Combo editor met keyboard
footerItems: {
    status: {
        type: 'text',
        editor: {
            type: 'combo',
            items: ['todo', 'doing', 'done'],
            // Arrow keys navigeren door opties
            editable: true
        }
    }
}
```

---

## 3. TaskEdit Popup Keyboard

### 3.1 Popup Keyboard Behavior

```javascript
features: {
    taskEdit: {
        editorConfig: {
            // Close on Escape
            closeOnEscape: true,

            // Save and close on Enter
            saveAndCloseOnEnter: true,

            // Modal keyboard trapping
            modal: true,

            // Custom keyMap
            keyMap: {
                'Ctrl+Enter': 'saveAndClose',
                'Escape': 'close'
            }
        }
    }
}
```

### 3.2 Form Field Navigation

```javascript
features: {
    taskEdit: {
        items: {
            name: {
                type: 'text',
                tabIndex: 1  // Tab order
            },
            description: {
                type: 'textarea',
                tabIndex: 2
            },
            priority: {
                type: 'combo',
                tabIndex: 3
            }
        }
    }
}
```

---

## 4. Focus Management

### 4.1 Focus Events

```javascript
taskBoard.on({
    // When focus enters the TaskBoard
    focusIn({ fromElement, toElement, fromWidget, toWidget, backwards }) {
        console.log('Focus entered TaskBoard');
        console.log('From:', fromWidget?.type);
        console.log('To:', toWidget?.type);
        console.log('Direction:', backwards ? 'backwards' : 'forwards');
    },

    // When focus leaves the TaskBoard
    focusOut({ fromElement, toElement, fromWidget, toWidget, backwards }) {
        console.log('Focus left TaskBoard');
    }
});
```

### 4.2 Programmatic Focus

```javascript
// Focus op specifieke task card
const task = taskBoard.project.taskStore.getById(5);
const cardElement = taskBoard.getTaskElement(task);
if (cardElement) {
    cardElement.focus();
}

// Focus op TaskBoard zelf
taskBoard.focus();

// Check of element focusable is
const isFocusable = taskBoard.isFocusable(element);
```

### 4.3 Focus Trapping in Modals

```javascript
features: {
    taskEdit: {
        editorConfig: {
            modal: true,  // Traps focus within popup

            // Focus handling
            defaultFocus: 'name',  // First focused field

            // Tab cycling within popup
            trapFocus: true
        }
    }
}
```

---

## 5. Task Activation

### 5.1 activateTask Event

```javascript
const taskBoard = new TaskBoard({
    // Welk event activeert een task
    activateTaskEvent: 'taskClick',  // of 'taskDblClick' of null

    listeners: {
        activateTask({ taskRecord, event }) {
            console.log('Task activated:', taskRecord.name);

            // Custom activation logic
            if (event.ctrlKey) {
                // Open in new panel
                openTaskInPanel(taskRecord);
            } else {
                // Normal activation
                taskBoard.editTask(taskRecord);
            }
        }
    }
});
```

### 5.2 Keyboard Activation

```javascript
// Enter key activeert geselecteerde task
keyMap: {
    'Enter': () => {
        const selected = taskBoard.selectedTasks[0];
        if (selected) {
            taskBoard.trigger('activateTask', {
                taskRecord: selected,
                event: new KeyboardEvent('keydown')
            });
        }
    }
}
```

---

## 6. Task Selection via Keyboard

### 6.1 Selection Shortcuts

```javascript
const taskBoard = new TaskBoard({
    // Multi-select enabled
    selectedTasks: [],

    keyMap: {
        // Select all
        'Ctrl+A': () => {
            taskBoard.selectedTasks = taskBoard.project.taskStore.records;
        },

        // Deselect all
        'Escape': () => {
            taskBoard.selectedTasks = [];
        },

        // Toggle selection
        'Space': ({ event }) => {
            const task = taskBoard.resolveTaskRecord(event.target);
            if (task) {
                const index = taskBoard.selectedTasks.indexOf(task);
                if (index >= 0) {
                    taskBoard.selectedTasks.splice(index, 1);
                } else {
                    taskBoard.selectedTasks.push(task);
                }
            }
        }
    }
});
```

### 6.2 Selection State

```javascript
// Get selected tasks
const selected = taskBoard.selectedTasks;

// Set selected tasks
taskBoard.selectedTasks = [task1, task2];

// Clear selection
taskBoard.selectedTasks = [];
```

---

## 7. ARIA Attributes

### 7.1 Widget ARIA Configuration

```javascript
const taskBoard = new TaskBoard({
    // ARIA label voor de TaskBoard
    ariaLabel: 'Project Task Board',

    // ARIA description
    ariaDescription: 'Kanban board with tasks organized by status'
});
```

### 7.2 Column ARIA

```javascript
columns: [
    {
        id: 'todo',
        text: 'To Do',
        // Implicit aria-label from text
    },
    {
        id: 'doing',
        text: 'In Progress',
        // Custom aria attributes via DomConfig
    }
]
```

### 7.3 Task Card ARIA

TaskBoard genereert automatisch ARIA attributes voor cards:

```html
<!-- Generated card structure -->
<div class="b-taskboard-card"
     role="listitem"
     aria-label="Task: Book flight"
     tabindex="0">
    <!-- Card content -->
</div>
```

### 7.4 Custom ARIA via taskRenderer

```javascript
taskRenderer({ taskRecord, cardConfig }) {
    // Add custom ARIA attributes
    cardConfig.ariaLabel = `Task: ${taskRecord.name}, Priority: ${taskRecord.priority}`;
    cardConfig.ariaDescribedBy = 'task-help-text';

    return cardConfig;
}
```

---

## 8. Screen Reader Support

### 8.1 Live Regions voor Updates

```javascript
// Announce task movements
taskBoard.on({
    taskDrop({ taskRecord, targetColumn }) {
        // Create live region announcement
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.textContent = `Task "${taskRecord.name}" moved to ${targetColumn.text}`;

        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => announcement.remove(), 1000);
    }
});
```

### 8.2 Beschrijvende Labels

```javascript
// TaskItems met screen reader support
headerItems: {
    text: {
        type: 'text',
        field: 'name',
        // Screen reader ziet dit als task naam
        ariaLabel: 'Task name'
    }
},

footerItems: {
    resourceAvatars: {
        type: 'resourceAvatars',
        // Screen reader krijgt assigned resources
        ariaLabel: ({ taskRecord }) => {
            const resources = taskRecord.resources;
            if (resources.length === 0) return 'No assignees';
            return `Assigned to: ${resources.map(r => r.name).join(', ')}`;
        }
    }
}
```

---

## 9. High Contrast & Themes

### 9.1 Theme Selection voor Accessibility

```javascript
import { DomHelper } from '@bryntum/taskboard';

// Check current theme
const isDark = DomHelper.isDarkTheme;

// Switch to high contrast theme
DomHelper.setTheme('material3-dark');

// Theme event
GlobalEvents.on({
    theme({ theme, prev }) {
        console.log(`Theme changed from ${prev} to ${theme}`);
    }
});
```

### 9.2 Custom High Contrast Styles

```css
/* High contrast overrides */
.b-taskboard.b-high-contrast {
    --b-task-board-card-border: 2px solid #000;
    --b-task-board-column-header-font-weight: 700;
}

/* Focus indicators */
.b-taskboard-card:focus {
    outline: 3px solid var(--b-focus-color, #0066cc);
    outline-offset: 2px;
}

/* Hover states met duidelijk contrast */
.b-taskboard-card:hover {
    box-shadow: 0 0 0 2px var(--b-primary);
}
```

---

## 10. Context Menu Keyboard

### 10.1 Menu Navigation

```javascript
features: {
    taskMenu: {
        // Keyboard shortcuts voor menu
        keyMap: {
            'ArrowDown': 'focusNext',
            'ArrowUp': 'focusPrev',
            'Enter': 'activateItem',
            'Escape': 'close'
        }
    },

    columnHeaderMenu: {
        keyMap: {
            'ArrowDown': 'focusNext',
            'ArrowUp': 'focusPrev',
            'Enter': 'activateItem',
            'Escape': 'close'
        }
    }
}
```

### 10.2 Menu Item Accessibility

```javascript
features: {
    taskMenu: {
        items: {
            editTask: {
                text: 'Edit task',
                icon: 'b-icon-edit',
                // Keyboard shortcut hint
                shortcut: 'Enter',
                // ARIA
                ariaLabel: 'Edit this task'
            },
            deleteTask: {
                text: 'Delete task',
                icon: 'b-icon-trash',
                shortcut: 'Delete',
                ariaLabel: 'Delete this task permanently'
            }
        }
    }
}
```

---

## 11. Drag & Drop Keyboard Alternatives

### 11.1 Move Tasks via Keyboard

```javascript
const taskBoard = new TaskBoard({
    keyMap: {
        // Move task to next/previous column
        'Ctrl+ArrowRight': () => {
            const task = taskBoard.selectedTasks[0];
            if (task) {
                const columns = taskBoard.columns;
                const currentIndex = columns.findIndex(
                    c => c.id === task[taskBoard.columnField]
                );
                const nextColumn = columns[currentIndex + 1];
                if (nextColumn) {
                    task[taskBoard.columnField] = nextColumn.id;
                }
            }
        },

        'Ctrl+ArrowLeft': () => {
            const task = taskBoard.selectedTasks[0];
            if (task) {
                const columns = taskBoard.columns;
                const currentIndex = columns.findIndex(
                    c => c.id === task[taskBoard.columnField]
                );
                const prevColumn = columns[currentIndex - 1];
                if (prevColumn) {
                    task[taskBoard.columnField] = prevColumn.id;
                }
            }
        },

        // Move task up/down in swimlane
        'Ctrl+ArrowUp': 'moveTaskUp',
        'Ctrl+ArrowDown': 'moveTaskDown'
    }
});
```

### 11.2 Reorder Tasks

```javascript
// Move task within column (reorder)
moveTaskUp() {
    const task = this.selectedTasks[0];
    if (!task) return;

    const store = this.project.taskStore;
    const siblings = store.query(t =>
        t[this.columnField] === task[this.columnField] &&
        (!this.swimlaneField || t[this.swimlaneField] === task[this.swimlaneField])
    );

    const index = siblings.indexOf(task);
    if (index > 0) {
        // Swap with previous
        const prevTask = siblings[index - 1];
        const tempOrder = task.order;
        task.order = prevTask.order;
        prevTask.order = tempOrder;
    }
}
```

---

## 12. TypeScript Interfaces

```typescript
// Focus Events
interface FocusInEvent {
    source: Widget;
    fromElement: HTMLElement;
    toElement: HTMLElement;
    fromWidget: Widget;
    toWidget: Widget;
    backwards: boolean;
}

interface FocusOutEvent extends FocusInEvent {}

// KeyMap Configuration
type KeyMapConfig =
    | string
    | number
    | Function
    | Record<string, string | number | Function>
    | null;

interface KeyMapOptions {
    handler: string | Function;
    weight?: number;
    preventDefault?: boolean;
    stopPropagation?: boolean;
}

// ARIA Configuration
interface AriaConfig {
    ariaLabel?: string;
    ariaDescription?: string;
    ariaDescribedBy?: string;
    ariaLabelledBy?: string;
    role?: string;
}

// Widget Accessibility Props
interface WidgetA11yConfig extends AriaConfig {
    tabIndex?: number;
    keyMap?: Record<string, KeyMapConfig>;
}

// TaskBoard Keyboard Events
interface TaskBoardKeyboardListeners {
    focusIn?: (event: FocusInEvent) => void;
    focusOut?: (event: FocusOutEvent) => void;
}

// SimpleTaskEdit Keyboard Config
interface SimpleTaskEditConfig {
    keyMap?: Record<string, KeyMapConfig>;
    editorConfig?: {
        revertOnEscape?: boolean;
    };
}

// TaskEdit Keyboard Config
interface TaskEditEditorConfig {
    closeOnEscape?: boolean;
    saveAndCloseOnEnter?: boolean;
    modal?: boolean;
    trapFocus?: boolean;
    defaultFocus?: string;
    keyMap?: Record<string, KeyMapConfig>;
}

// Task Activation
interface ActivateTaskEvent {
    source: TaskBoard;
    taskRecord: TaskModel;
    event: MouseEvent | KeyboardEvent;
}

interface TaskBoardConfig {
    activateTaskEvent?: 'taskClick' | 'taskDblClick' | null;
    selectedTasks?: TaskModel[];
    keyMap?: Record<string, KeyMapConfig>;
    ariaLabel?: string;
    ariaDescription?: string;
}
```

---

## 13. Best Practices

### 13.1 Keyboard Navigation Checklist

- [ ] Alle interactieve elementen bereikbaar via Tab
- [ ] Enter/Space activeert elementen
- [ ] Escape annuleert/sluit
- [ ] Arrow keys voor navigatie binnen componenten
- [ ] Focus visible indicators
- [ ] Logische tab volgorde

### 13.2 Screen Reader Checklist

- [ ] Beschrijvende ARIA labels
- [ ] Live regions voor dynamic updates
- [ ] Proper heading hierarchy
- [ ] Form field labels
- [ ] Error messages accessible

### 13.3 Performance Tips

```javascript
// Batch focus operations
taskBoard.suspendEvents();
// ... multiple operations
taskBoard.resumeEvents();

// Efficient keyboard handler
keyMap: {
    'Ctrl+F': {
        handler: 'onSearch',
        // Prevent default browser behavior
        preventDefault: true,
        // Stop event bubbling
        stopPropagation: true
    }
}
```

---

## 14. Testing Accessibility

### 14.1 Keyboard Testing

```javascript
// Test keyboard navigation
async function testKeyboardNav(taskBoard) {
    // Focus first card
    const firstCard = taskBoard.element.querySelector('.b-taskboard-card');
    firstCard.focus();

    // Simulate Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    firstCard.dispatchEvent(enterEvent);

    // Verify action taken
    assert(taskBoard.features.taskEdit.isEditing);
}
```

### 14.2 Screen Reader Testing Tips

1. Test met NVDA (Windows) of VoiceOver (Mac)
2. Verify alle interacties worden aangekondigd
3. Check focus order logisch is
4. Test met alleen keyboard (geen muis)

---

## Samenvatting

| Aspect | Implementation |
|--------|----------------|
| **Keyboard Shortcuts** | Via `keyMap` config |
| **Focus Events** | `focusIn`, `focusOut` |
| **ARIA** | `ariaLabel`, `ariaDescription` |
| **Task Activation** | `activateTaskEvent` config |
| **Selection** | `selectedTasks` property |
| **Modal Focus** | `trapFocus`, `modal` config |

---

*Laatst bijgewerkt: December 2024*
*Bryntum TaskBoard v7.1.0*
