# TaskBoard Deep Dive: Column Features (Advanced)

> **Complete guide** voor geavanceerde column features in Bryntum TaskBoard - header menus, drag/resize, toolbars, filtering, sorting, en meer.

---

## Overzicht

TaskBoard biedt uitgebreide column functionaliteit:

| Feature | Beschrijving |
|---------|--------------|
| **ColumnHeaderMenu** | Context menu op column headers |
| **ColumnDrag** | Kolommen slepen/herordenen |
| **ColumnResize** | Kolom breedte aanpassen |
| **ColumnToolbars** | Top/bottom toolbars per kolom |
| **ColumnFilter** | Filter popup per kolom |
| **ColumnSort** | Sorting per kolom |
| **FilterBar** | Zoekbalk per kolom |
| **AutoColumns** | Automatische kolom generatie |
| **CatchAll** | Fallback column voor onbekende statussen |

---

## 1. Column Header Menu

### 1.1 Enable Column Header Menu

```javascript
const taskBoard = new TaskBoard({
    features: {
        columnHeaderMenu: true
    },

    columns: [
        { id: 'todo', text: 'Todo' },
        { id: 'doing', text: 'Doing' },
        { id: 'done', text: 'Done' }
    ]
});
```

### 1.2 Custom Menu Items

```javascript
features: {
    columnHeaderMenu: {
        items: {
            // Custom menu item
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

            // Separator
            customSeparator: {
                type: 'separator'
            },

            // Another item
            archiveAll: {
                text: 'Archive all tasks',
                icon: 'fa fa-fw fa-archive',
                onItem({ columnRecord }) {
                    columnRecord.tasks.forEach(task => {
                        task.archived = true;
                    });
                }
            }
        }
    }
}
```

### 1.3 processItems voor Conditionale Items

```javascript
features: {
    columnHeaderMenu: {
        items: {
            postpone: {
                text: 'Postpone',
                onItem({ columnRecord }) { /* ... */ }
            }
        },

        processItems({ columnRecord, items }) {
            // Verberg postpone voor specifieke kolom
            if (columnRecord.id === 'DevOps') {
                items.postpone = null;
            }

            // Voeg dynamisch item toe voor bepaalde kolom
            if (columnRecord.id === 'Developers') {
                items.removeAll = {
                    text: 'Remove all tasks',
                    icon: 'fa fa-fw fa-trash',
                    onItem({ columnRecord }) {
                        taskBoard.project.taskStore.remove(
                            columnRecord.tasks.filter(t => !t.readOnly)
                        );
                    }
                };
            }

            // Disable move options voor laatste kolom
            if (columnRecord === taskBoard.columns.last) {
                items.moveColumnRight.disabled = true;
            }
        }
    }
}
```

### 1.4 Default Menu Items

Standaard beschikbare items:
- `addTask` - Voeg nieuwe taak toe
- `moveColumnLeft` - Verplaats kolom naar links
- `moveColumnRight` - Verplaats kolom naar rechts
- `hideColumn` - Verberg kolom

```javascript
processItems({ items }) {
    // Disable/hide default items
    items.addTask.disabled = true;
    items.hideColumn = null;  // Verwijder volledig
}
```

---

## 2. Column Drag

### 2.1 Enable Column Drag

```javascript
features: {
    columnDrag: true
}
```

### 2.2 Drag Events

```javascript
const taskBoard = new TaskBoard({
    features: {
        columnDrag: true
    },

    listeners: {
        // Voorkom drag van specifieke kolommen
        beforeColumnDrag({ columnRecord }) {
            // Voorkom drag van "Done" kolom
            return columnRecord.id !== 'Done';
        },

        // Valideer drop locatie
        columnDrag({ beforeColumn }) {
            // Voorkom drop aan einde (voor null = na laatste)
            return beforeColumn != null;
        },

        // Bevestig drop met dialog
        async beforeColumnDrop({ columnRecord, beforeColumn }) {
            if (beforeColumn) {
                const result = await MessageDialog.confirm({
                    title: 'Verify drop',
                    message: `Move ${columnRecord.text} before ${beforeColumn.text}?`
                });
                return result === MessageDialog.okButton;
            }
        },

        // Na succesvolle drop
        columnDrop({ columnRecord, beforeColumn }) {
            Toast.show(`${columnRecord.text} moved`);
        },

        // Bij abort (ESC of invalid drop)
        columnDragAbort({ columnRecord }) {
            Toast.show(`Dragging ${columnRecord.text} aborted`);
        }
    }
});
```

### 2.3 Drag Event Types

| Event | Beschrijving |
|-------|--------------|
| `beforeColumnDrag` | Voordat drag begint |
| `columnDragStart` | Drag is gestart |
| `columnDrag` | Tijdens drag (elke move) |
| `beforeColumnDrop` | Voordat drop wordt uitgevoerd |
| `columnDrop` | Na succesvolle drop |
| `columnDragAbort` | Bij abort |
| `columnDragEnd` | Einde van drag operatie |

---

## 3. Column Resize

### 3.1 Enable Column Resize

```javascript
features: {
    columnResize: true
}

// Of met opties
features: {
    columnResize: {
        minWidth: 200,
        maxWidth: 600
    }
}
```

### 3.2 Column Width Configuratie

```javascript
columns: [
    { id: 'todo', text: 'Todo', width: 350 },
    { id: 'doing', text: 'Doing', width: 400 },
    { id: 'done', text: 'Done', width: 300 }
]
```

---

## 4. Column Toolbars

### 4.1 Basic Toolbars

```javascript
features: {
    columnToolbars: true  // Toont bottom toolbar met add button
}
```

### 4.2 Custom Toolbars

```javascript
features: {
    columnToolbars: {
        // Top toolbar items
        topItems: {
            addTask: true  // Add button in top toolbar
        },

        // Bottom toolbar items
        bottomItems: {
            addTask: true,  // Default add button

            // Custom remove all button
            removeAll: {
                icon: 'fa-trash',
                rendition: 'text',
                tooltip: 'Remove all tasks in column',
                onClick: 'up.onRemoveAllClick'
            }
        },

        // Dynamische items
        processItems({ items, columnRecord, location }) {
            // location is 'top' of 'bottom'

            // Verberg add button in Done kolom
            if (columnRecord.id === 'done') {
                items.addTask = false;
            }
            else {
                // Verberg button text
                items.addTask.text = '';
            }
        }
    }
},

// Event handler
onRemoveAllClick({ source: button }) {
    taskBoard.project.taskStore.remove(
        button.columnRecord.tasks.filter(t => !t.readOnly)
    );
}
```

---

## 5. Column Filter

### 5.1 Enable Column Filter

```javascript
features: {
    columnFilter: true
}
```

### 5.2 Column Filter Configuratie

```javascript
features: {
    columnFilter: {
        // Maak filter popup draggable
        draggable: true
    }
}
```

### 5.3 FilterableTaskModel

Voor goede filter ondersteuning, definieer field types:

```javascript
class FilterableTaskModel extends TaskModel {
    static fields = [
        { name: 'name', label: 'Name', type: 'string' },
        { name: 'description', label: 'Description', type: 'string' },
        { name: 'prio', label: 'Priority', type: 'string' },
        { name: 'status', label: 'Status', type: 'string' },
        { name: 'progress', label: 'Progress', type: 'number' },
        { name: 'opened', label: 'Opened', type: 'date' },
        { name: 'approved', label: 'Approved', type: 'boolean' }
    ];
}

const taskBoard = new TaskBoard({
    project: {
        taskModelClass: FilterableTaskModel
    },

    features: {
        columnFilter: {
            draggable: true
        }
    }
});
```

### 5.4 Programmatische Filter

```javascript
// Voeg filter toe aan specifieke kolom
taskBoard.columns.todo.taskStore.addFilter({
    property: 'name',
    operator: 'startsWith',
    value: 'Fix'
});

// Filter verwijderen
taskBoard.columns.todo.taskStore.clearFilters();
```

---

## 6. Column Sort

### 6.1 Enable Column Sort

```javascript
features: {
    columnSort: true
}
```

### 6.2 Sortable Fields Configureren

```javascript
features: {
    columnSort: {
        sortableFields: [
            // Field names
            'approved',
            'category',
            'name',
            'opened',

            // Custom sorter function
            {
                label: 'Priority',
                fn: (a, b) => {
                    const prioMap = { low: 1, normal: 2, high: 3 };
                    return prioMap[b.prio] - prioMap[a.prio];
                }
            },

            // Nog een custom sorter
            {
                label: 'Longest name',
                fn: (a, b) => a.name.length - b.name.length
            }
        ],

        // Initiële sortering
        initialSorter: 'name',

        // Sluit menu na selectie
        closeOnItem: true
    }
}
```

### 6.3 Field Labels voor Sort Menu

```javascript
class Task extends TaskModel {
    static fields = [
        // Label wordt gebruikt in sort menu
        { name: 'opened', type: 'date', label: 'Ticket opened' },
        'category',
        { name: 'approved', type: 'boolean' }
    ];
}
```

---

## 7. FilterBar (Column Search)

### 7.1 Enable FilterBar

```javascript
features: {
    filterBar: true
}
```

### 7.2 FilterBar Configuratie

```javascript
features: {
    filterBar: {
        // Welke velden doorzoeken
        fields: ['id', 'name', 'description', 'prio', 'owner', 'category'],

        // Delay voor keystroke filtering (ms)
        keyStrokeChangeDelay: 100,

        // Sta RegExp toe in literal mode
        allowRegExp: true,

        // Toon match mode toggle (literal, and, or)
        showMatchModeTrigger: true,

        // Default match mode
        matchMode: 'and',  // 'literal', 'and', 'or'

        // Highlight matches in task cards
        highlightMatches: true
    }
}
```

### 7.3 Highlight Matches in Templates

```javascript
bodyItems: {
    owner: {
        type: 'template',
        template: ({ taskRecord }) => `
            <!-- data-field nodig voor highlighting -->
            <div data-field="owner">${taskRecord.owner}</div>
        `
    }
}
```

### 7.4 Programmatische Filter

```javascript
// Vind filterBar widget
const filterBar = Widget.fromSelector(
    '[data-column="done"] [data-ref="filterBar"]'
);

// Set filter value
filterBar.value = 'search term';
```

---

## 8. Auto Columns

### 8.1 Automatische Kolom Generatie

```javascript
const taskBoard = new TaskBoard({
    // Columns worden automatisch gegenereerd
    // op basis van unieke waarden in columnField
    autoGenerateColumns: true,

    columnField: 'status',

    project: {
        loadUrl: 'data/data.json',
        autoLoad: true
    }
});
```

### 8.2 Column Configuratie voor Auto Columns

```javascript
autoGenerateColumns: true,

// Default configuratie voor gegenereerde columns
columnDefaults: {
    width: 300,
    color: 'blue'
}
```

---

## 9. Catch-All Column

### 9.1 Fallback Column

```javascript
const taskBoard = new TaskBoard({
    columns: [
        { id: 'todo', text: 'Todo' },
        { id: 'doing', text: 'Doing' },
        { id: 'done', text: 'Done' },

        // Catch-all voor onbekende statussen
        {
            id: 'unknown',
            text: 'Unknown Status',
            color: 'gray',

            // Kolom vangt alle onbekende waarden
            catchAll: true
        }
    ],

    columnField: 'status'
});
```

---

## 10. Locked Column

### 10.1 Column Locking

```javascript
columns: [
    {
        id: 'backlog',
        text: 'Backlog',
        locked: true  // Kolom kan niet verplaatst worden
    },
    { id: 'todo', text: 'Todo' },
    { id: 'doing', text: 'Doing' },
    { id: 'done', text: 'Done' }
]
```

---

## 11. Column Collapse

### 11.1 Collapsible Columns

```javascript
columns: [
    { id: 'todo', text: 'Todo' },
    { id: 'doing', text: 'Doing' },
    {
        id: 'done',
        text: 'Done',
        collapsed: true  // Start ingeklapt
    }
]

// Toggle collapse
taskBoard.columns.done.collapsed = !taskBoard.columns.done.collapsed;
```

### 11.2 Collapse in Header

```javascript
const taskBoard = new TaskBoard({
    showCollapseInHeader: true,  // Toon collapse icon in header

    columns: [...]
});
```

---

## 12. Column Renderers

### 12.1 Column Header Renderer

```javascript
columns: [
    {
        id: 'todo',
        text: 'Todo',

        // Custom header renderer
        headerRenderer({ columnRecord, headerConfig }) {
            // Voeg task count toe aan header
            return `${columnRecord.text} (${columnRecord.tasks.length})`;
        }
    }
]
```

### 12.2 Swimlane Column Renderer

```javascript
swimlaneRenderer({ swimlaneRecord, columnRecord, cellConfig }) {
    // Customize cell voor specifieke swimlane/column combinatie
    if (swimlaneRecord.id === 'urgent' && columnRecord.id === 'todo') {
        cellConfig.class.highlight = true;
    }
}
```

---

## 13. TypeScript Interfaces

```typescript
// Column Header Menu Config
interface ColumnHeaderMenuConfig {
    // Menu items
    items?: Record<string, MenuItemConfig | null>;

    // Process items dynamically
    processItems?: (params: {
        columnRecord: ColumnModel;
        items: Record<string, MenuItemConfig | null>;
    }) => void;
}

// Column Drag Config
interface ColumnDragConfig {
    disabled?: boolean;
}

// Column Resize Config
interface ColumnResizeConfig {
    disabled?: boolean;
    minWidth?: number;
    maxWidth?: number;
}

// Column Toolbars Config
interface ColumnToolbarsConfig {
    topItems?: Record<string, ToolbarItemConfig | boolean>;
    bottomItems?: Record<string, ToolbarItemConfig | boolean>;

    processItems?: (params: {
        items: Record<string, ToolbarItemConfig>;
        columnRecord: ColumnModel;
        location: 'top' | 'bottom';
    }) => void;
}

// Column Filter Config
interface ColumnFilterConfig {
    draggable?: boolean;
}

// Column Sort Config
interface ColumnSortConfig {
    sortableFields?: (string | SorterConfig)[];
    initialSorter?: string;
    closeOnItem?: boolean;
}

interface SorterConfig {
    label: string;
    fn: (a: TaskModel, b: TaskModel) => number;
}

// FilterBar Config
interface FilterBarConfig {
    fields?: string[];
    keyStrokeChangeDelay?: number;
    allowRegExp?: boolean;
    showMatchModeTrigger?: boolean;
    matchMode?: 'literal' | 'and' | 'or';
    highlightMatches?: boolean;
}

// Column Model
interface ColumnModel {
    id: string | number;
    text: string;
    color?: string;
    width?: number;
    hidden?: boolean;
    collapsed?: boolean;
    locked?: boolean;
    catchAll?: boolean;
    tasksPerRow?: number;

    // Read-only properties
    readonly tasks: TaskModel[];
    readonly taskStore: Store<TaskModel>;

    // Methods
    headerRenderer?: (params: {
        columnRecord: ColumnModel;
        headerConfig: object;
    }) => string;
}

// Column Drag Events
interface ColumnDragEvents {
    beforeColumnDrag: (event: {
        columnRecord: ColumnModel;
    }) => boolean | void;

    columnDragStart: (event: {
        columnRecord: ColumnModel;
    }) => void;

    columnDrag: (event: {
        columnRecord: ColumnModel;
        beforeColumn: ColumnModel | null;
    }) => boolean | void;

    beforeColumnDrop: (event: {
        columnRecord: ColumnModel;
        beforeColumn: ColumnModel | null;
    }) => boolean | Promise<boolean> | void;

    columnDrop: (event: {
        columnRecord: ColumnModel;
        beforeColumn: ColumnModel | null;
    }) => void;

    columnDragAbort: (event: {
        columnRecord: ColumnModel;
    }) => void;

    columnDragEnd: (event: {
        columnRecord: ColumnModel;
    }) => void;
}
```

---

## 14. Best Practices

### 14.1 Menu Performance

```javascript
features: {
    columnHeaderMenu: {
        // Gebruik processItems voor dynamische items
        // i.p.v. alles statisch definiëren
        processItems({ columnRecord, items }) {
            // Alleen items toevoegen die nodig zijn
            if (columnRecord.tasks.length > 0) {
                items.archiveAll = { /* ... */ };
            }
        }
    }
}
```

### 14.2 Filter Optimalisatie

```javascript
// Definieer field types voor efficiënte filtering
class Task extends TaskModel {
    static fields = [
        { name: 'progress', type: 'number' },  // Numerieke filter
        { name: 'approved', type: 'boolean' }, // Boolean filter
        { name: 'opened', type: 'date' }       // Date filter
    ];
}
```

### 14.3 Drag Feedback

```javascript
listeners: {
    columnDragStart({ columnRecord }) {
        // Visuele feedback bij start
        showDragIndicator(columnRecord);
    },

    columnDragEnd() {
        // Cleanup
        hideDragIndicator();
    }
}
```

---

## Samenvatting

| Feature | Config |
|---------|--------|
| **Header Menu** | `columnHeaderMenu: { items, processItems }` |
| **Drag** | `columnDrag: true` |
| **Resize** | `columnResize: true` |
| **Toolbars** | `columnToolbars: { topItems, bottomItems }` |
| **Filter** | `columnFilter: true` |
| **Sort** | `columnSort: { sortableFields }` |
| **FilterBar** | `filterBar: { fields, highlightMatches }` |
| **Auto Columns** | `autoGenerateColumns: true` |
| **Catch All** | `{ catchAll: true }` |
| **Locked** | `{ locked: true }` |

---

*Laatst bijgewerkt: December 2024*
*Bryntum TaskBoard v7.1.0*
