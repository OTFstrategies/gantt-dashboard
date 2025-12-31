# TaskBoard Deep Dive: Menus

> **Volledige documentatie** voor TaskMenu, ColumnHeaderMenu, context menus, menu items en menu customization.

---

## Overzicht

De TaskBoard bevat twee hoofdtypen van context menus:
- **TaskMenu**: Context menu voor individuele taakkaarten
- **ColumnHeaderMenu**: Context menu voor column headers

Beide zijn features die standaard beschikbaar zijn en uitgebreid kunnen worden gecustomized.

### Architectuur

```
┌─────────────────────────────────────────────────────────────────┐
│                    TaskBoard Menu System                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ContextMenuBase                        │   │
│  │              (Bryntum Core Base Class)                    │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                        │
│           ┌─────────────┴─────────────┐                         │
│           │                           │                         │
│           ▼                           ▼                         │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │    TaskMenu     │         │ColumnHeaderMenu │               │
│  │    Feature      │         │    Feature      │               │
│  └────────┬────────┘         └────────┬────────┘               │
│           │                           │                         │
│           ▼                           ▼                         │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │    Menu Widget  │         │   Menu Widget   │               │
│  │                 │         │                 │               │
│  │  ┌───────────┐  │         │  ┌───────────┐  │               │
│  │  │ MenuItem  │  │         │  │ MenuItem  │  │               │
│  │  │ MenuItem  │  │         │  │ MenuItem  │  │               │
│  │  │ MenuItem  │  │         │  │ MenuItem  │  │               │
│  │  │   ...     │  │         │  │   ...     │  │               │
│  │  └───────────┘  │         │  └───────────┘  │               │
│  └─────────────────┘         └─────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Menu Trigger Points

| Menu Type | Default Trigger | Alternative Triggers |
|-----------|-----------------|---------------------|
| TaskMenu | Right-click op kaart | `taskClick`, `taskDblClick`, menu button |
| ColumnHeaderMenu | Right-click op header | Click op hamburger icon |

---

## 1. TaskMenu Feature

> **Bron**: `taskboard.d.ts:130514-130690`

### TypeScript Interface

```typescript
/**
 * TaskMenu Feature Configuration
 * Bron: taskboard.d.ts:130516-130683
 */
type TaskMenuConfig = {
    type?: 'taskMenu' | 'taskmenu';

    /**
     * Feature disabled state
     */
    disabled?: boolean | 'inert';

    /**
     * Preconfigured menu items
     * Keys zijn item refs, values zijn MenuItem configs
     */
    items?: Record<string, MenuItemConfig | boolean | null>;

    /**
     * Toon avatars/initialen in de resource picker menu
     * @default true
     */
    showAvatars?: boolean;

    /**
     * De mouse/touch gesture die het menu triggert
     * - 'taskContextMenu' (default): right-click
     * - 'taskClick': normal click
     * - 'taskDblClick': double-click
     * - false: alleen via API
     */
    triggerEvent?: string | boolean;

    /**
     * Function die wordt aangeroepen voordat het menu wordt getoond
     * Retourneer false om het menu te voorkomen
     */
    processItems?: (context: TaskMenuContext) => boolean | void;

    /**
     * Event listeners
     */
    listeners?: TaskMenuListeners;
};

/**
 * Context object voor processItems en events
 */
interface TaskMenuContext {
    /** Reference naar de TaskMenu feature */
    feature: TaskMenu;

    /** Het originele DOM event */
    domEvent: Event;

    /** Mouse positie [x, y] */
    point: number[];

    /** Het target element */
    targetElement: HTMLElement;

    /** De taak waarvoor het menu wordt getoond */
    taskRecord: TaskModel;

    /** De column waar de taak in zit */
    columnRecord: ColumnModel;

    /** De menu items (kan worden gemodificeerd) */
    items: Record<string, MenuItemConfig | boolean>;
}

/**
 * TaskMenu Feature class
 */
export class TaskMenu extends ContextMenuBase {
    static readonly isTaskMenu: boolean;
    readonly isTaskMenu: boolean;

    /**
     * Toon menu voor een specifieke taak
     * @param taskRecord - Taak om menu voor te tonen
     * @param selector - Optional CSS selector voor alignment
     */
    showMenuFor(taskRecord: TaskModel, selector?: string): void;
}
```

### Basis Configuratie

```javascript
const taskBoard = new TaskBoard({
    features: {
        // Boolean: default settings
        taskMenu: true,

        // Of met configuratie
        taskMenu: {
            disabled: false,
            showAvatars: true,
            triggerEvent: 'taskContextMenu'  // right-click
        }
    }
});
```

### Default Menu Items

Het TaskMenu bevat standaard de volgende items:

| Item Ref | Beschrijving | Weight |
|----------|--------------|--------|
| `editTask` | Open task editor | 100 |
| `removeTask` | Verwijder taak | 200 |
| `resources` | Submenu voor resource assignment | 300 |
| `moveColumnRight` | Verplaats naar volgende column | 400 |
| `moveColumnLeft` | Verplaats naar vorige column | 410 |

### Custom Menu Items Toevoegen

```javascript
// Bron: examples/task-menu/app.module.js
const taskBoard = new TaskBoard({
    features: {
        taskMenu: {
            items: {
                // Custom color picker met submenu
                color: {
                    icon: 'fa fa-fw fa-square',
                    text: 'Color',
                    weight: 150,  // Positie in menu
                    cls: 'b-separator',  // Separator lijn erboven

                    // Submenu met kleuren
                    menu: {
                        red: { text: 'Red', icon: 'fa fa-fw fa-square b-color-red' },
                        blue: { text: 'Blue', icon: 'fa fa-fw fa-square b-color-blue' },
                        green: { text: 'Green', icon: 'fa fa-fw fa-square b-color-green' },
                        orange: { text: 'Orange', icon: 'fa fa-fw fa-square b-color-orange' },
                        purple: { text: 'Purple', icon: 'fa fa-fw fa-square b-color-purple' }
                    },

                    // Handler wanneer kleur wordt gekozen
                    onItem({ item, taskRecord }) {
                        if (item.ref !== 'color') {
                            taskRecord.eventColor = item.ref;
                        }
                    }
                },

                // Labels picker met checkboxes
                labels: {
                    icon: 'fa fa-fw fa-tags',
                    text: 'Labels',
                    weight: 160,

                    // Submenu met checkbox items
                    menu: [
                        { text: 'Bug', checked: false },
                        { text: 'Feature', checked: false },
                        { text: 'Enhancement', checked: false },
                        { text: 'Documentation', checked: false }
                    ],

                    onItem({ item, taskRecord }) {
                        // Verzamel alle checked labels
                        const checkedLabels = [];
                        item.parent.items.forEach(menuItem => {
                            if (menuItem.checked) {
                                checkedLabels.push(menuItem.text);
                            }
                        });

                        // Update task met comma-separated labels
                        taskRecord.labels = checkedLabels.join(',');
                    }
                },

                // Simpel action item
                duplicate: {
                    icon: 'fa fa-fw fa-copy',
                    text: 'Duplicate',
                    weight: 170,
                    onItem({ taskRecord }) {
                        const clone = taskRecord.copy();
                        clone.name = `${taskRecord.name} (copy)`;
                        taskBoard.project.taskStore.add(clone);
                    }
                },

                // Item met async confirmation
                archive: {
                    icon: 'fa fa-fw fa-archive',
                    text: 'Archive',
                    weight: 180,
                    async onItem({ taskRecord }) {
                        const result = await MessageDialog.confirm({
                            title: 'Archive Task',
                            message: `Archive "${taskRecord.name}"?`
                        });

                        if (result === MessageDialog.okButton) {
                            taskRecord.archived = true;
                            taskRecord.status = 'archived';
                        }
                    }
                }
            }
        }
    }
});
```

### Default Items Verbergen/Aanpassen

```javascript
features: {
    taskMenu: {
        items: {
            // Verberg edit item
            editTask: false,

            // Verberg remove item
            removeTask: null,

            // Aanpassen van bestaand item
            resources: {
                text: 'Assign Team Members',  // Andere tekst
                icon: 'fa fa-fw fa-users'     // Ander icon
            },

            // Move items uitschakelen
            moveColumnRight: {
                disabled: true
            }
        }
    }
}
```

### processItems - Dynamische Menu Customization

```javascript
features: {
    taskMenu: {
        items: {
            color: {
                icon: 'fa fa-fw fa-square',
                text: 'Color',
                menu: {
                    red: { text: 'Red', icon: 'fa fa-fw fa-square b-color-red' },
                    blue: { text: 'Blue', icon: 'fa fa-fw fa-square b-color-blue' },
                    green: { text: 'Green', icon: 'fa fa-fw fa-square b-color-green' }
                }
            },
            labels: {
                icon: 'fa fa-fw fa-tags',
                text: 'Labels',
                menu: availableLabels.map(label => ({ text: label, checked: false }))
            }
        },

        // Dynamische customization voordat menu wordt getoond
        processItems({ taskRecord, columnRecord, items }) {
            // === READ-ONLY HANDLING ===
            if (taskRecord.readOnly) {
                // Disable custom items voor read-only tasks
                items.color.disabled = true;
                items.labels.disabled = true;
                items.removeTask.disabled = true;
                return;
            }

            // === COLOR PICKER STATE ===
            const currentColor = taskRecord.eventColor || columnRecord.color;

            // Update icon kleur
            items.color.icon = `fa fa-fw fa-square b-color-${currentColor}`;

            // Check mark op huidige kleur in submenu
            if (items.color.menu[currentColor]) {
                items.color.menu[currentColor].icon =
                    items.color.menu[currentColor].icon.replace('square', 'check-square');
            }

            // === LABELS STATE ===
            const currentLabels = taskRecord.labels?.split(',') || [];

            // Check huidige labels in submenu
            currentLabels.forEach(label => {
                const menuItem = items.labels.menu.find(item => item.text === label);
                if (menuItem) {
                    menuItem.checked = true;
                }
            });

            // === CONDITIONAL ITEMS ===

            // Voeg "Escalate" toe alleen voor non-critical tasks
            if (taskRecord.priority !== 'critical') {
                items.escalate = {
                    icon: 'fa fa-fw fa-exclamation-triangle',
                    text: 'Escalate to Critical',
                    weight: 175,
                    onItem({ taskRecord }) {
                        taskRecord.priority = 'critical';
                    }
                };
            }

            // Verberg "Move Right" als al in laatste column
            const lastColumn = taskBoard.columns.last;
            if (columnRecord === lastColumn) {
                items.moveColumnRight = null;
            }

            // Verberg "Move Left" als al in eerste column
            const firstColumn = taskBoard.columns.first;
            if (columnRecord === firstColumn) {
                items.moveColumnLeft = null;
            }

            // === PREVENT MENU ===
            // Return false om menu volledig te voorkomen
            if (taskRecord.locked) {
                return false;
            }
        }
    }
}
```

### Menu Button in Kaart

```javascript
const taskBoard = new TaskBoard({
    features: {
        taskMenu: true
    },

    // Voeg menu button toe aan card header
    headerItems: {
        menu: { type: 'taskMenu' }
    }
});
```

### Programmatisch Menu Tonen

```javascript
// Toon menu voor specifieke task
const task = taskBoard.project.taskStore.getById(1);
taskBoard.features.taskMenu.showMenuFor(task);

// Toon menu aligned aan specifiek element in de kaart
taskBoard.features.taskMenu.showMenuFor(task, '.task-actions-button');
```

---

## 2. ColumnHeaderMenu Feature

> **Bron**: `taskboard.d.ts:127433-127591`

### TypeScript Interface

```typescript
/**
 * ColumnHeaderMenu Feature Configuration
 * Bron: taskboard.d.ts:127435-127591
 */
type ColumnHeaderMenuConfig = {
    type?: 'columnHeaderMenu' | 'columnheadermenu';

    /**
     * Feature disabled state
     */
    disabled?: boolean | 'inert';

    /**
     * Preconfigured menu items
     */
    items?: Record<string, MenuItemConfig | boolean | null>;

    /**
     * Function die wordt aangeroepen voordat het menu wordt getoond
     */
    processItems?: (context: ColumnHeaderMenuContext) => boolean | void;

    /**
     * Event listeners
     */
    listeners?: ColumnHeaderMenuListeners;
};

/**
 * Context object voor processItems en events
 */
interface ColumnHeaderMenuContext {
    /** Reference naar de feature */
    feature: ColumnHeaderMenu;

    /** Het originele DOM event */
    domEvent: Event;

    /** Mouse positie [x, y] */
    point: number[];

    /** Het target element */
    targetElement: HTMLElement;

    /** De column waarvoor het menu wordt getoond */
    columnRecord: ColumnModel;

    /** De menu items (kan worden gemodificeerd) */
    items: Record<string, MenuItemConfig | boolean>;
}
```

### Default Menu Items

| Item Ref | Beschrijving | Weight |
|----------|--------------|--------|
| `addTask` | Voeg nieuwe taak toe | 100 |
| `moveColumnLeft` | Verplaats column naar links | 200 |
| `moveColumnRight` | Verplaats column naar rechts | 210 |
| `hideColumn` | Verberg column | 300 |

### Basis Configuratie

```javascript
const taskBoard = new TaskBoard({
    features: {
        columnHeaderMenu: true
    }
});
```

### Custom Column Header Menu

```javascript
// Bron: examples/column-header-menu/app.module.js
const taskBoard = new TaskBoard({
    features: {
        columnDrag: true,
        columnResize: true,

        columnHeaderMenu: {
            items: {
                // Custom item: postpone all tasks
                postpone: {
                    text: 'Postpone to next quarter',
                    icon: 'fa fa-fw fa-calendar-plus',
                    onItem({ columnRecord }) {
                        columnRecord.tasks.forEach(taskRecord => {
                            if (!taskRecord.readOnly) {
                                const quarter = Math.min(
                                    parseInt(taskRecord.quarter.substr(1)) + 1,
                                    4
                                );
                                taskRecord.quarter = `Q${quarter}`;
                            }
                        });
                    }
                },

                // Custom item: mark all as done
                markAllDone: {
                    text: 'Mark all as done',
                    icon: 'fa fa-fw fa-check-double',
                    onItem({ columnRecord }) {
                        columnRecord.tasks.forEach(task => {
                            task.status = 'done';
                        });
                    }
                },

                // Custom item: export column
                exportColumn: {
                    text: 'Export to CSV',
                    icon: 'fa fa-fw fa-download',
                    onItem({ columnRecord }) {
                        exportColumnToCSV(columnRecord);
                    }
                }
            },

            // Dynamic customization
            processItems({ columnRecord, items }) {
                // Verberg postpone voor DevOps column
                if (columnRecord.id === 'DevOps') {
                    items.postpone = null;
                }

                // Voeg "Remove all" toe alleen voor Developers
                if (columnRecord.id === 'Developers') {
                    items.removeAll = {
                        text: 'Remove all tasks',
                        icon: 'fa fa-fw fa-trash',
                        cls: 'b-separator',
                        onItem({ columnRecord }) {
                            const tasksToRemove = columnRecord.tasks.filter(
                                t => !t.readOnly
                            );
                            taskBoard.project.taskStore.remove(tasksToRemove);
                        }
                    };
                }

                // Disable hide voor laatste column
                if (taskBoard.columns.count === 1) {
                    items.hideColumn.disabled = true;
                }

                // Prevent menu voor locked columns
                if (columnRecord.locked) {
                    return false;
                }
            }
        }
    }
});
```

---

## 3. MenuItem Configuration

### Complete MenuItem Interface

```typescript
/**
 * MenuItem Configuration
 * Bron: Core widget/MenuItem
 */
interface MenuItemConfig {
    /** Unieke identifier */
    ref?: string;

    /** Weergave tekst */
    text?: string;

    /** Icon CSS class */
    icon?: string;

    /** Disabled state */
    disabled?: boolean;

    /** Hidden state */
    hidden?: boolean;

    /** Checkbox item */
    checked?: boolean;

    /** CSS class voor separator lijn */
    cls?: string;  // 'b-separator' voor lijn erboven

    /** Positie in menu (lager = hoger in menu) */
    weight?: number;

    /** Submenu items */
    menu?: MenuItemConfig[] | Record<string, MenuItemConfig>;

    /** Toggle group (voor radio-style items) */
    toggleGroup?: string;

    /** Click handler */
    onItem?: (context: MenuItemContext) => void | Promise<void>;

    /** Tooltip */
    tooltip?: string;

    /** Keyboard shortcut display */
    keyMap?: string;
}

interface MenuItemContext {
    /** Het geklikte menu item */
    item: MenuItem;

    /** De taak (bij TaskMenu) */
    taskRecord?: TaskModel;

    /** De column */
    columnRecord?: ColumnModel;

    /** De swimlane */
    swimlaneRecord?: SwimlaneModel;
}
```

### MenuItem Types

```javascript
// 1. Simple action item
{
    text: 'Delete',
    icon: 'fa fa-trash',
    onItem({ taskRecord }) {
        taskBoard.project.taskStore.remove(taskRecord);
    }
}

// 2. Checkbox item
{
    text: 'Flag as important',
    checked: false,
    onItem({ item, taskRecord }) {
        taskRecord.important = item.checked;
    }
}

// 3. Radio group items
{
    text: 'High Priority',
    toggleGroup: 'priority',
    onItem({ taskRecord }) {
        taskRecord.priority = 'high';
    }
},
{
    text: 'Low Priority',
    toggleGroup: 'priority',
    onItem({ taskRecord }) {
        taskRecord.priority = 'low';
    }
}

// 4. Submenu
{
    text: 'Move to',
    icon: 'fa fa-arrow-right',
    menu: {
        todo: { text: 'Todo' },
        doing: { text: 'Doing' },
        done: { text: 'Done' }
    },
    onItem({ item, taskRecord }) {
        if (item.ref !== 'moveTo') {  // Skip parent item
            taskRecord.status = item.ref;
        }
    }
}

// 5. Separator
{
    text: 'Danger Zone',
    cls: 'b-separator b-danger',
    icon: 'fa fa-exclamation-triangle'
}

// 6. Disabled item
{
    text: 'Premium Feature',
    icon: 'fa fa-lock',
    disabled: true,
    tooltip: 'Upgrade to access this feature'
}

// 7. Dynamic submenu
{
    text: 'Assign to',
    icon: 'fa fa-user-plus',
    menu: () => {
        // Dynamically generate items from resources
        return taskBoard.project.resourceStore.records.map(resource => ({
            text: resource.name,
            icon: resource.imageUrl
                ? `<img src="${resource.imageUrl}" class="avatar" />`
                : 'fa fa-user',
            onItem({ taskRecord }) {
                taskRecord.assign(resource);
            }
        }));
    }
}
```

### Weight System

```javascript
// Weight bepaalt volgorde (lager = hoger in menu)
items: {
    critical: { text: 'Mark Critical', weight: 50 },   // Bovenaan
    edit: { text: 'Edit', weight: 100 },               // Default edit positie
    duplicate: { text: 'Duplicate', weight: 150 },     // Na edit
    archive: { text: 'Archive', weight: 190 },         // Voor delete
    delete: { text: 'Delete', weight: 200 }            // Default delete positie
}

// Gebruik cls: 'b-separator' voor visuele groepering
items: {
    edit: { text: 'Edit', weight: 100 },
    duplicate: { text: 'Duplicate', weight: 150 },

    // Separator voor danger zone
    archive: {
        text: 'Archive',
        weight: 190,
        cls: 'b-separator'  // Lijn boven dit item
    },
    delete: { text: 'Delete', weight: 200 }
}
```

---

## 4. Menu Events

### TaskMenu Events

```javascript
const taskBoard = new TaskBoard({
    features: {
        taskMenu: {
            listeners: {
                // Voor menu wordt getoond
                beforeShow({ taskRecord, columnRecord, items }) {
                    console.log(`Showing menu for ${taskRecord.name}`);

                    // Laatste moment om items aan te passen
                    if (taskRecord.priority === 'critical') {
                        items.escalate = null;
                    }

                    // Return false om te voorkomen
                    if (taskRecord.locked) {
                        return false;
                    }
                },

                // Na menu wordt getoond
                show({ menu }) {
                    console.log('Menu is now visible');
                },

                // Menu item wordt geklikt
                item({ item, taskRecord }) {
                    console.log(`Clicked: ${item.text} for ${taskRecord.name}`);
                },

                // Menu wordt gesloten
                hide({ menu }) {
                    console.log('Menu closed');
                }
            }
        }
    },

    // Of via TaskBoard listeners
    listeners: {
        taskMenuBeforeShow({ taskRecord, items }) {
            console.log('Task menu about to show');
        },

        taskMenuItem({ item, taskRecord }) {
            // Analytics tracking
            analytics.track('menu_action', {
                action: item.ref,
                taskId: taskRecord.id
            });
        }
    }
});
```

### ColumnHeaderMenu Events

```javascript
const taskBoard = new TaskBoard({
    features: {
        columnHeaderMenu: {
            listeners: {
                beforeShow({ columnRecord, items }) {
                    console.log(`Showing menu for ${columnRecord.text}`);
                },

                show({ menu }) {
                    console.log('Column menu visible');
                },

                item({ item, columnRecord }) {
                    console.log(`Clicked: ${item.text} for ${columnRecord.text}`);
                },

                hide({ menu }) {
                    console.log('Column menu closed');
                }
            }
        }
    },

    listeners: {
        columnHeaderMenuBeforeShow({ columnRecord, items }) {
            console.log('Column header menu about to show');
        },

        columnHeaderMenuItem({ item, columnRecord }) {
            // Log action
            console.log(`Column action: ${item.ref}`);
        }
    }
});
```

---

## 5. Async Menu Actions

```javascript
features: {
    taskMenu: {
        items: {
            // Async action met loading state
            sync: {
                text: 'Sync with Server',
                icon: 'fa fa-sync',
                async onItem({ item, taskRecord }) {
                    // Toon loading state
                    const originalIcon = item.icon;
                    item.icon = 'fa fa-spinner fa-spin';

                    try {
                        await syncTaskToServer(taskRecord);

                        Toast.show({
                            html: 'Task synced successfully',
                            type: 'success'
                        });
                    } catch (error) {
                        Toast.show({
                            html: 'Sync failed: ' + error.message,
                            type: 'error'
                        });
                    } finally {
                        item.icon = originalIcon;
                    }
                }
            },

            // Async met confirmation
            delete: {
                text: 'Delete',
                icon: 'fa fa-trash',
                async onItem({ taskRecord }) {
                    const result = await MessageDialog.confirm({
                        title: 'Confirm Delete',
                        message: `Delete "${taskRecord.name}"?`
                    });

                    if (result === MessageDialog.okButton) {
                        await taskBoard.project.taskStore.remove(taskRecord);

                        Toast.show({
                            html: 'Task deleted'
                        });
                    }
                }
            }
        }
    }
}
```

---

## 6. Remove Task Confirmation

```javascript
// Via beforeTaskRemove listener
const taskBoard = new TaskBoard({
    features: {
        taskMenu: true
    },

    listeners: {
        // Confirmation dialog voordat tasks worden verwijderd
        async beforeTaskRemove({ taskRecords }) {
            // Formatter voor lijst van namen
            const formatter = new Intl.ListFormat('en', {
                style: 'long',
                type: 'conjunction'
            });

            const names = formatter.format(
                taskRecords.map(t => `"${t.name}"`)
            );

            const result = await MessageDialog.confirm({
                title: `Remove task${taskRecords.length > 1 ? 's' : ''}?`,
                message: `Please confirm removal of ${names}`
            });

            // Return false om removal te voorkomen
            return result === MessageDialog.okButton;
        }
    }
});
```

---

## 7. Context-Aware Menus

### Role-Based Menu Items

```javascript
const currentUser = {
    role: 'developer',
    permissions: ['edit', 'comment'],
    isAdmin: false
};

features: {
    taskMenu: {
        processItems({ taskRecord, items }) {
            // Admin-only items
            if (!currentUser.isAdmin) {
                items.forceDelete = null;
                items.changeOwner = null;
            }

            // Role-based items
            if (currentUser.role === 'viewer') {
                // Viewers can only view
                Object.keys(items).forEach(key => {
                    if (key !== 'viewDetails') {
                        items[key] = null;
                    }
                });
            }

            // Permission-based items
            if (!currentUser.permissions.includes('edit')) {
                items.editTask.disabled = true;
                items.editTask.tooltip = 'You do not have edit permission';
            }

            // Task owner privileges
            if (taskRecord.ownerId !== currentUser.id) {
                items.transfer = null;
                items.archive = null;
            }
        }
    }
}
```

### Status-Based Menu Items

```javascript
features: {
    taskMenu: {
        processItems({ taskRecord, columnRecord, items }) {
            const status = taskRecord.status;

            // Status-specifieke acties
            switch (status) {
                case 'todo':
                    items.start = {
                        text: 'Start Working',
                        icon: 'fa fa-play',
                        weight: 50,
                        onItem() {
                            taskRecord.status = 'doing';
                        }
                    };
                    break;

                case 'doing':
                    items.complete = {
                        text: 'Mark Complete',
                        icon: 'fa fa-check',
                        weight: 50,
                        onItem() {
                            taskRecord.status = 'done';
                        }
                    };
                    items.pause = {
                        text: 'Pause',
                        icon: 'fa fa-pause',
                        weight: 55,
                        onItem() {
                            taskRecord.status = 'todo';
                        }
                    };
                    break;

                case 'done':
                    items.reopen = {
                        text: 'Reopen',
                        icon: 'fa fa-undo',
                        weight: 50,
                        onItem() {
                            taskRecord.status = 'todo';
                        }
                    };
                    // Hide edit for completed tasks
                    items.editTask.disabled = true;
                    break;

                case 'blocked':
                    items.unblock = {
                        text: 'Remove Blocker',
                        icon: 'fa fa-lock-open',
                        weight: 50,
                        onItem() {
                            taskRecord.blocked = false;
                            taskRecord.status = 'todo';
                        }
                    };
                    break;
            }

            // Prevent moving completed tasks back
            if (status === 'done') {
                items.moveColumnLeft = null;
            }
        }
    }
}
```

---

## 8. Keyboard Shortcuts in Menus

```javascript
features: {
    taskMenu: {
        items: {
            editTask: {
                text: 'Edit',
                icon: 'fa fa-edit',
                keyMap: 'E',  // Display "E" als shortcut hint
                onItem({ taskRecord }) {
                    taskBoard.editTask(taskRecord);
                }
            },
            duplicate: {
                text: 'Duplicate',
                icon: 'fa fa-copy',
                keyMap: 'Ctrl+D',
                onItem({ taskRecord }) {
                    duplicateTask(taskRecord);
                }
            },
            delete: {
                text: 'Delete',
                icon: 'fa fa-trash',
                keyMap: 'Del',
                onItem({ taskRecord }) {
                    deleteTask(taskRecord);
                }
            }
        }
    }
}

// Actual keyboard handler (menu shortcuts zijn alleen visueel)
taskBoard.on('keydown', ({ event, taskRecords }) => {
    if (taskRecords.length === 0) return;

    const task = taskRecords[0];

    switch (event.key) {
        case 'e':
            taskBoard.editTask(task);
            break;
        case 'd':
            if (event.ctrlKey) {
                duplicateTask(task);
                event.preventDefault();
            }
            break;
        case 'Delete':
            deleteTask(task);
            break;
    }
});
```

---

## 9. Styling

### CSS voor Menu Customization

```css
/* Menu container styling */
.b-menu {
    --menu-background-color: #ffffff;
    --menu-border-radius: 8px;
    --menu-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* MenuItem styling */
.b-menuitem {
    padding: 8px 16px;
    transition: background-color 0.15s ease;
}

.b-menuitem:hover {
    background-color: var(--hover-color, #f5f5f5);
}

/* Disabled items */
.b-menuitem.b-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Separator styling */
.b-menuitem.b-separator {
    border-top: 1px solid #e0e0e0;
    margin-top: 4px;
    padding-top: 12px;
}

/* Danger items (like delete) */
.b-menuitem.b-danger {
    color: #f44336;
}

.b-menuitem.b-danger:hover {
    background-color: #ffebee;
}

/* Checked items */
.b-menuitem.b-checked::before {
    content: '\f00c';  /* Font Awesome check */
    font-family: 'Font Awesome 5 Free';
    font-weight: 900;
    margin-right: 8px;
    color: var(--primary-color);
}

/* Submenu indicator */
.b-menuitem.b-has-submenu::after {
    content: '\f054';  /* Font Awesome chevron-right */
    font-family: 'Font Awesome 5 Free';
    font-weight: 900;
    position: absolute;
    right: 12px;
    font-size: 10px;
    opacity: 0.5;
}

/* Keyboard shortcut display */
.b-menuitem .b-menu-shortcut {
    margin-left: auto;
    padding-left: 24px;
    opacity: 0.5;
    font-size: 0.85em;
}

/* Color picker submenu */
.b-colorize {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: inline-block;
}

/* Dark theme */
.b-theme-dark .b-menu {
    --menu-background-color: #2d2d2d;
    --menu-border-color: #404040;
}

.b-theme-dark .b-menuitem:hover {
    background-color: #404040;
}
```

---

## 10. Complete Voorbeeld

```javascript
import { TaskBoard, MessageDialog, Toast, StringHelper } from '@bryntum/taskboard';

// Beschikbare labels
const LABELS = ['Bug', 'Feature', 'Enhancement', 'Documentation', 'Urgent', 'Review'];

// Beschikbare kleuren
const COLORS = {
    red: 'Red',
    orange: 'Orange',
    yellow: 'Yellow',
    green: 'Green',
    blue: 'Blue',
    purple: 'Purple',
    gray: 'Gray'
};

const taskBoard = new TaskBoard({
    appendTo: 'container',

    features: {
        columnDrag: true,

        taskMenu: {
            showAvatars: true,

            items: {
                // === QUICK ACTIONS ===
                quickComplete: {
                    text: 'Quick Complete',
                    icon: 'fa fa-fw fa-check',
                    weight: 50,
                    onItem({ taskRecord }) {
                        taskRecord.status = 'done';
                        Toast.show({ html: `"${taskRecord.name}" completed!` });
                    }
                },

                // === COLOR PICKER ===
                color: {
                    icon: 'fa fa-fw fa-palette',
                    text: 'Color',
                    weight: 150,
                    cls: 'b-separator',
                    menu: Object.entries(COLORS).reduce((acc, [key, text]) => {
                        acc[key] = {
                            text,
                            icon: `fa fa-fw fa-circle b-color-${key}`
                        };
                        return acc;
                    }, {}),
                    onItem({ item, taskRecord }) {
                        if (item.ref !== 'color') {
                            taskRecord.eventColor = item.ref;
                        }
                    }
                },

                // === LABELS ===
                labels: {
                    icon: 'fa fa-fw fa-tags',
                    text: 'Labels',
                    weight: 160,
                    menu: LABELS.map(label => ({
                        text: label,
                        checked: false
                    })),
                    onItem({ item, taskRecord }) {
                        const checkedLabels = [];
                        item.parent.items.forEach(menuItem => {
                            if (menuItem.checked) {
                                checkedLabels.push(menuItem.text);
                            }
                        });
                        taskRecord.labels = checkedLabels.join(',');
                    }
                },

                // === PRIORITY ===
                priority: {
                    icon: 'fa fa-fw fa-flag',
                    text: 'Priority',
                    weight: 170,
                    menu: {
                        critical: { text: 'Critical', icon: 'fa fa-fw fa-fire b-color-red' },
                        high: { text: 'High', icon: 'fa fa-fw fa-arrow-up b-color-orange' },
                        normal: { text: 'Normal', icon: 'fa fa-fw fa-minus b-color-blue' },
                        low: { text: 'Low', icon: 'fa fa-fw fa-arrow-down b-color-gray' }
                    },
                    onItem({ item, taskRecord }) {
                        if (item.ref !== 'priority') {
                            taskRecord.priority = item.ref;
                        }
                    }
                },

                // === ACTIONS ===
                duplicate: {
                    icon: 'fa fa-fw fa-copy',
                    text: 'Duplicate',
                    weight: 175,
                    onItem({ taskRecord }) {
                        const clone = taskRecord.copy();
                        clone.name = `${taskRecord.name} (copy)`;
                        taskBoard.project.taskStore.add(clone);
                    }
                }
            },

            processItems({ taskRecord, columnRecord, items }) {
                // === READ-ONLY ===
                if (taskRecord.readOnly) {
                    items.quickComplete.disabled = true;
                    items.color.disabled = true;
                    items.labels.disabled = true;
                    items.priority.disabled = true;
                    items.editTask.disabled = true;
                    items.removeTask.disabled = true;
                    return;
                }

                // === COLOR STATE ===
                const currentColor = taskRecord.eventColor || columnRecord.color || 'blue';
                items.color.icon = `fa fa-fw fa-palette b-color-${currentColor}`;

                if (items.color.menu[currentColor]) {
                    items.color.menu[currentColor].icon =
                        items.color.menu[currentColor].icon + ' b-checked';
                }

                // === LABELS STATE ===
                const currentLabels = taskRecord.labels?.split(',').filter(Boolean) || [];
                items.labels.menu.forEach(item => {
                    item.checked = currentLabels.includes(item.text);
                });

                // === PRIORITY STATE ===
                const currentPriority = taskRecord.priority || 'normal';
                if (items.priority.menu[currentPriority]) {
                    items.priority.menu[currentPriority].icon += ' b-checked';
                }

                // === QUICK COMPLETE ===
                if (taskRecord.status === 'done') {
                    items.quickComplete.text = 'Reopen';
                    items.quickComplete.icon = 'fa fa-fw fa-undo';
                    items.quickComplete.onItem = ({ taskRecord }) => {
                        taskRecord.status = 'todo';
                    };
                }

                // === MOVE RESTRICTIONS ===
                const isFirstColumn = columnRecord === taskBoard.columns.first;
                const isLastColumn = columnRecord === taskBoard.columns.last;

                if (isFirstColumn) items.moveColumnLeft = null;
                if (isLastColumn) items.moveColumnRight = null;
            }
        },

        columnHeaderMenu: {
            items: {
                collapseAll: {
                    text: 'Collapse All Cards',
                    icon: 'fa fa-fw fa-compress-alt',
                    weight: 50,
                    onItem({ columnRecord }) {
                        columnRecord.tasks.forEach(task => {
                            task.collapsed = true;
                        });
                    }
                },
                expandAll: {
                    text: 'Expand All Cards',
                    icon: 'fa fa-fw fa-expand-alt',
                    weight: 55,
                    onItem({ columnRecord }) {
                        columnRecord.tasks.forEach(task => {
                            task.collapsed = false;
                        });
                    }
                },
                clearCompleted: {
                    text: 'Clear Completed',
                    icon: 'fa fa-fw fa-broom',
                    weight: 100,
                    cls: 'b-separator',
                    async onItem({ columnRecord }) {
                        const completed = columnRecord.tasks.filter(
                            t => t.status === 'done'
                        );

                        if (completed.length === 0) {
                            Toast.show({ html: 'No completed tasks' });
                            return;
                        }

                        const result = await MessageDialog.confirm({
                            title: 'Clear Completed',
                            message: `Remove ${completed.length} completed task(s)?`
                        });

                        if (result === MessageDialog.okButton) {
                            taskBoard.project.taskStore.remove(completed);
                        }
                    }
                }
            },

            processItems({ columnRecord, items }) {
                // Disable hide if only one column
                if (taskBoard.columns.count <= 1) {
                    items.hideColumn.disabled = true;
                }

                // Show task count
                const taskCount = columnRecord.tasks.length;
                items.taskCount = {
                    text: `${taskCount} task${taskCount !== 1 ? 's' : ''}`,
                    disabled: true,
                    weight: 0,
                    cls: 'b-menu-header'
                };
            }
        }
    },

    headerItems: {
        menu: { type: 'taskMenu' }
    },

    bodyItems: {
        labels: { type: 'tags' }
    },

    listeners: {
        async beforeTaskRemove({ taskRecords }) {
            const names = taskRecords.map(t => `"${t.name}"`).join(', ');

            const result = await MessageDialog.confirm({
                title: 'Remove Task(s)',
                message: `Remove ${names}?`
            });

            return result === MessageDialog.okButton;
        }
    },

    columns: ['Todo', 'Doing', 'Review', 'Done'],
    columnField: 'status',

    project: {
        taskStore: {
            fields: ['labels', 'priority']
        },
        loadUrl: 'data/data.json',
        autoLoad: true
    }
});
```

---

## Referenties

| Item | Locatie |
|------|---------|
| TaskMenu Feature | `taskboard.d.ts:130514-130690` |
| TaskMenuConfig | `taskboard.d.ts:130516-130683` |
| ColumnHeaderMenu | `taskboard.d.ts:127433-127591` |
| ColumnHeaderMenuConfig | `taskboard.d.ts:127435-127591` |
| MenuItemConfig | Core widget/MenuItem |
| MenuContext | `taskboard.d.ts:639-654` |
| processItems (TaskMenu) | `taskboard.d.ts:130585-130597` |
| processItems (ColumnHeaderMenu) | `taskboard.d.ts:127504-127515` |
| Task Menu Example | `examples/task-menu/app.module.js` |
| Column Header Menu Example | `examples/column-header-menu/app.module.js` |

---

*Laatst bijgewerkt: December 2024*
