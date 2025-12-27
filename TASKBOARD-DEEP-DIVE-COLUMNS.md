# TaskBoard Deep Dive: Columns & Swimlanes

> **Diepgaande analyse** van de Bryntum TaskBoard column- en swimlane-architectuur voor eigen implementatie.
> Dit document bevat uitgebreide TypeScript interfaces, code voorbeelden uit alle relevante examples, en interne werking.

---

## Overzicht

De TaskBoard organiseert taken in een Kanban-stijl layout met twee dimensies:
- **Columns**: Verticale containers die taakstatussen representeren (bijv. "Todo", "Doing", "Done")
- **Swimlanes**: Horizontale banen die taken groeperen op een tweede dimensie (bijv. prioriteit, team)

De combinatie creëert een 2D matrix waar elke cel taken bevat die aan beide criteria voldoen.

### Architectuur Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        TaskBoard                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │
│  │   Column 1   │   Column 2   │   Column 3   │   Column 4   │  │
│  │    (Todo)    │   (Doing)    │   (Review)   │    (Done)    │  │
│  ├──────────────┼──────────────┼──────────────┼──────────────┤  │
│  │              │              │              │              │  │
│  │  Swimlane 1  │  Swimlane 1  │  Swimlane 1  │  Swimlane 1  │  │
│  │   (High)     │   (High)     │   (High)     │   (High)     │  │
│  │   ┌─────┐    │   ┌─────┐    │              │   ┌─────┐    │  │
│  │   │Card │    │   │Card │    │              │   │Card │    │  │
│  │   └─────┘    │   └─────┘    │              │   └─────┘    │  │
│  ├──────────────┼──────────────┼──────────────┼──────────────┤  │
│  │              │              │              │              │  │
│  │  Swimlane 2  │  Swimlane 2  │  Swimlane 2  │  Swimlane 2  │  │
│  │  (Medium)    │  (Medium)    │  (Medium)    │  (Medium)    │  │
│  │   ┌─────┐    │              │   ┌─────┐    │              │  │
│  │   │Card │    │              │   │Card │    │              │  │
│  │   └─────┘    │              │   └─────┘    │              │  │
│  └──────────────┴──────────────┴──────────────┴──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. ColumnModel - Volledige API

> **Bron**: `taskboard.d.ts:130935-131136`

### Complete TypeScript Interface

```typescript
// Uit taskboard.d.ts - Volledige ColumnModel configuratie
interface ColumnModelConfig {
    // === IDENTIFICATIE ===
    id: string | number;                    // Unieke column ID (verplicht)
    text?: string;                          // Header tekst voor display
    tooltip?: string;                       // Tooltip bij hover over header

    // === DIMENSIES ===
    width?: number;                         // Vaste breedte in pixels
    minWidth?: number;                      // Minimale breedte bij resize
    flex?: number;                          // Flex-grow waarde (relatieve breedte)

    // === STATE MANAGEMENT ===
    collapsed?: boolean;                    // Start ingeklapt
    collapsible?: boolean;                  // Kan in-/uitgeklapt worden
    hidden?: boolean;                       // Verborgen (niet gerenderd)
    readOnly?: boolean;                     // Geen edits toegestaan

    // === STYLING ===
    color?: ColumnColor | string | null;    // Kleurcode uit palette
    htmlEncodeHeaderText?: boolean;         // HTML encoding (default: true)

    // === LAYOUT ===
    tasksPerRow?: number;                   // Aantal kaarten naast elkaar
    locked?: 'start' | 'end' | null;        // Vergrendelde positie (scrollt niet mee)
}

// Beschikbare kleuren uit het standaard palette
type ColumnColor =
    | 'red' | 'pink' | 'magenta' | 'purple' | 'violet'
    | 'deep-purple' | 'indigo' | 'blue' | 'light-blue' | 'cyan'
    | 'teal' | 'green' | 'light-green' | 'lime' | 'yellow'
    | 'orange' | 'amber' | 'deep-orange' | 'light-gray' | 'gray';
```

### ColumnModel Class Definition

```typescript
// Uit taskboard.d.ts - ColumnModel class
class ColumnModel extends Model {
    // === STATIC PROPERTIES ===
    static readonly isColumnModel: true;

    // === READ-ONLY PROPERTIES ===
    readonly collapsed: boolean;           // Huidige collapsed state
    readonly tasks: TaskModel[];           // Alle taken in deze column
    readonly isColumnModel: boolean;       // Type check helper

    // === CONFIGUREERBARE PROPERTIES ===
    collapsible: boolean;
    color: ColumnColor | string | null;
    flex: number;
    hidden: boolean;
    htmlEncodeHeaderText: boolean;
    id: string | number;
    locked: 'start' | 'end' | null;
    minWidth: number;
    tasksPerRow: number;
    text: string;
    tooltip: string;
    width: number;

    // === METHODES ===

    /**
     * Klapt de column in met animatie
     * @returns Promise die resolvet na animatie
     */
    collapse(): Promise<void>;

    /**
     * Klapt de column uit met animatie
     * @returns Promise die resolvet na animatie
     */
    expand(): Promise<void>;
}
```

---

## 2. Column Configuratie Patterns

### Pattern 1: String Shorthand

```javascript
// Simpelste vorm - string wordt zowel ID als tekst
// Bron: examples/basic/app.module.js
const taskBoard = new TaskBoard({
    columns: [
        'todo',      // { id: 'todo', text: 'Todo' }
        'doing',     // { id: 'doing', text: 'Doing' }
        'review',    // { id: 'review', text: 'Review' }
        'done'       // { id: 'done', text: 'Done' }
    ],
    columnField: 'status'
});
```

### Pattern 2: Object Configuratie

```javascript
// Volledig uitgeschreven configuratie
// Bron: examples/columns/app.module.js
const taskBoard = new TaskBoard({
    columns: [
        {
            id: 'todo',
            text: 'Todo',
            color: 'orange',
            tooltip: 'Items waiting to be started'
        },
        {
            id: 'doing',
            text: 'In Progress',
            color: 'violet',
            tooltip: 'Items currently being worked on'
        },
        {
            id: 'done',
            text: 'Completed',
            color: 'green'
        }
    ],
    columnField: 'status'
});
```

### Pattern 3: Mixed Configuratie

```javascript
// Combinatie van strings en objecten
// Bron: examples/responsive/app.module.js
const taskBoard = new TaskBoard({
    columns: [
        { id: 'todo', text: 'Todo', color: 'indigo' },
        { id: 'considering', text: 'Considering', color: 'teal' },
        'doing',  // Gebruikt primary color
        { id: 'done', text: 'Done', color: 'lime' }
    ],
    columnField: 'status'
});
```

### Pattern 4: Geavanceerde Opties

```javascript
// Bron: examples/locked-column/app.module.js
const taskBoard = new TaskBoard({
    columns: [
        {
            id: 'unplanned',
            text: 'Unplanned',
            width: 350,           // Vaste breedte
            color: '#3bc9db'      // Custom hex kleur
        },
        {
            id: 'asap',
            text: 'ASAP',
            width: 350,
            color: '#fa5252'
        },
        {
            id: 'q1',
            text: 'Quarter 1',
            width: 350,
            color: '#f76707'
        },
        {
            id: 'q4',
            text: 'Quarter 4',
            width: 350,
            color: '#ffe8cc',
            locked: 'end'         // Altijd rechts, scrollt niet mee
        },
        {
            id: 'finished',
            text: 'Finished',
            width: 350,
            color: '#82c91e'
        }
    ],
    columnField: 'when',

    // Extra opties voor locked columns
    stickyHeaders: true,
    showCountInHeader: false,

    features: {
        columnHeaderMenu: true,
        columnLock: true          // Enables lock/unlock via context menu
    }
});
```

---

## 3. Column Header Customization

### columnTitleRenderer

```javascript
// Bron: examples/catch-all-column/app.module.js
const taskBoard = new TaskBoard({
    // Disable HTML encoding voor custom HTML
    htmlEncodeHeaderText: false,

    // Custom renderer voor column headers met avatars
    columnTitleRenderer({ columnRecord }) {
        const { avatar, text } = columnRecord;

        // Return DomConfig object voor veilige rendering
        return {
            class: 'avatar-header',
            children: {
                // Conditioneel avatar tonen
                ...(avatar ? {
                    avatar: {
                        tag: 'img',
                        class: 'avatar',
                        alt: StringHelper.xss`Avatar for ${text}`,
                        src: StringHelper.xss`images/users/${avatar.toLowerCase()}.jpg`
                    }
                } : {}),
                name: { text }
            }
        };
    },

    columns: [
        { id: 'emilia', text: 'Emilia', avatar: 'emilia' },
        { id: 'mark', text: 'Mark', avatar: 'mark' },
        { id: 'lisa', text: 'Lisa', avatar: 'lisa' },
        { id: '*', text: 'Other & Unassigned' }  // Catch-all
    ],

    columnField: 'assignee'
});
```

### WIP Counter in Header

```javascript
// Custom WIP limiet implementatie
const WIP_LIMITS = {
    todo: 10,
    doing: 5,
    review: 3,
    done: null
};

const taskBoard = new TaskBoard({
    htmlEncodeHeaderText: false,

    columnTitleRenderer({ columnRecord }) {
        const count = columnRecord.tasks.length;
        const limit = WIP_LIMITS[columnRecord.id];

        let indicator = '';
        if (limit) {
            const pct = (count / limit) * 100;
            let colorClass = 'wip-ok';
            if (pct >= 100) colorClass = 'wip-exceeded';
            else if (pct >= 80) colorClass = 'wip-warning';

            indicator = StringHelper.xss`
                <span class="wip-counter ${colorClass}">
                    ${count}/${limit}
                </span>
            `;
        }

        return StringHelper.xss`
            <span class="column-title">${columnRecord.text}</span>
            ${indicator}
        `;
    },

    listeners: {
        // Voorkom drop als WIP limiet bereikt
        beforeTaskDrop({ targetColumn, taskRecords }) {
            const limit = WIP_LIMITS[targetColumn.id];
            if (limit) {
                const currentCount = targetColumn.tasks.length;
                const incoming = taskRecords.filter(
                    t => t.status !== targetColumn.id
                ).length;

                if (currentCount + incoming > limit) {
                    Toast.show({
                        html: `WIP limit (${limit}) would be exceeded!`,
                        type: 'error'
                    });
                    return false;
                }
            }
        }
    }
});
```

---

## 4. Column Toolbars

> **Bron**: `taskboard.d.ts:128594-128756`, `examples/column-toolbars/app.module.js`

### ColumnToolbars Feature Interface

```typescript
interface ColumnToolbarsConfig {
    // Items boven de kaarten
    topItems?: Record<string, ToolbarItemConfig | boolean>;

    // Items onder de kaarten
    bottomItems?: Record<string, ToolbarItemConfig | boolean>;

    // Dynamische item processing
    processItems?: (context: {
        items: Record<string, ToolbarItemConfig>;
        location: 'top' | 'bottom';
        columnRecord: ColumnModel;
        swimlaneRecord?: SwimlaneModel;
    }) => void;
}

interface ToolbarItemConfig {
    type?: string;           // Widget type
    icon?: string;           // Font Awesome icon class
    text?: string;           // Button text
    tooltip?: string;        // Hover tooltip
    rendition?: 'text' | 'icon';  // Display mode
    onClick?: string | Function;   // Click handler
}
```

### Complete Toolbar Configuratie

```javascript
// Bron: examples/column-toolbars/app.module.js
const taskBoard = new TaskBoard({
    features: {
        columnDrag: true,

        columnToolbars: {
            // Top toolbar - boven de kaarten
            topItems: {
                // Standaard "add task" button
                addTask: true,

                // Custom button
                settings: {
                    icon: 'fa-cog',
                    tooltip: 'Column settings',
                    onClick: 'up.onSettingsClick'
                }
            },

            // Bottom toolbar - onder de kaarten
            bottomItems: {
                // Custom "remove all" button
                removeAll: {
                    icon: 'fa-trash',
                    rendition: 'text',
                    tooltip: 'Remove tasks in the column',
                    onClick: 'up.onRemoveAllClick'
                },

                // Task counter widget
                taskCount: {
                    type: 'widget',
                    html: ({ columnRecord }) =>
                        `${columnRecord.tasks.length} task(s)`
                }
            },

            // Dynamisch items aanpassen per column
            processItems({ items, columnRecord, location }) {
                // Verberg add button in Done column
                if (columnRecord.id === 'done') {
                    items.addTask = false;
                }
                // Verberg tekst van add button in andere columns
                else if (items.addTask) {
                    items.addTask.text = '';
                }

                // Alleen removeAll in top toolbar voor specifieke column
                if (location === 'bottom' && columnRecord.id === 'todo') {
                    items.removeAll = false;
                }
            }
        }
    },

    // Handler methods
    onRemoveAllClick({ source: button }) {
        const tasks = button.columnRecord.tasks.filter(t => !t.readOnly);
        this.project.taskStore.remove(tasks);
    },

    onSettingsClick({ source: button }) {
        console.log('Settings for:', button.columnRecord.text);
    }
});
```

---

## 5. Auto-Generated Columns

> **Bron**: `examples/auto-columns/app.module.js`

### Dynamische Column Generatie

```javascript
// Columns worden automatisch gemaakt op basis van unieke waarden in columnField
const taskBoard = new TaskBoard({
    // Geen columns array nodig!
    autoGenerateColumns: true,

    // Field op TaskModel dat columns bepaalt
    columnField: 'quarter',

    // Headers blijven sticky bij scrollen
    stickyHeaders: true,

    // Verberg column titels bij collapse
    collapseTitle: true,

    // Task editor voor custom velden
    features: {
        columnDrag: true,
        taskEdit: {
            items: {
                column: false,  // Verberg standaard column picker
                color: false,   // Verberg color picker

                // Custom velden
                category: {
                    type: 'combo',
                    name: 'category',
                    label: 'Category',
                    editable: false,
                    items: ['Bug', 'Internal task', 'Feature request']
                },
                quarter: {
                    type: 'combo',
                    name: 'quarter',
                    label: 'Quarter',
                    editable: false,
                    items: ['Q1', 'Q2', 'Q3', 'Q4']
                }
            }
        }
    },

    // Toolbar om columnField dynamisch te wijzigen
    tbar: [
        {
            type: 'combo',
            label: 'Group by',
            editable: false,
            inputWidth: '8.5em',
            items: [
                ['category', 'Category'],
                ['team', 'Team'],
                ['quarter', 'Quarter'],
                ['status', 'Status'],
                ['prio', 'Priority']
            ],
            value: 'quarter',
            onChange({ value }) {
                // Verander groupering dynamisch
                taskBoard.columnField = value;
            }
        }
    ],

    project: {
        taskModelClass: CustomTask,
        loadUrl: 'data/data.json',
        autoLoad: true
    }
});
```

### Group-By met Voorgedefinieerde Columns

```javascript
// Bron: examples/group-by/app.module.js
const categories = ['Internal task', 'Bug', 'Feature request'];
const teams = ['Developers', 'DevOps', 'QA', 'UX'];
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
const statuses = ['Todo', 'Doing', 'Review', 'Done'];
const prios = ['Critical', 'High', 'Medium', 'Low'];

const taskBoard = new TaskBoard({
    columnField: 'quarter',
    columns: quarters,  // Initiële columns

    tbar: [
        {
            type: 'combo',
            label: 'Group by',
            editable: false,
            inputWidth: '8.5em',
            valueField: 'id',
            displayField: 'title',
            items: [
                { id: 'category', title: 'Category', columns: categories },
                { id: 'team', title: 'Team', columns: teams },
                { id: 'quarter', title: 'Quarter', columns: quarters },
                { id: 'status', title: 'Status', columns: statuses },
                { id: 'prio', title: 'Prio', columns: prios }
            ],
            value: 'quarter',
            onSelect({ record }) {
                // Update beide columnField EN columns
                taskBoard.columnField = record.id;
                taskBoard.columns = record.columns;
            }
        }
    ]
});
```

---

## 6. Catch-All Column

> **Bron**: `examples/catch-all-column/app.module.js`

```javascript
// Catch-all column vangt taken met onbekende of lege column waarde
const taskBoard = new TaskBoard({
    columnField: 'assignee',

    columns: [
        { id: 'emilia', text: 'Emilia', avatar: 'emilia' },
        { id: 'mark', text: 'Mark', avatar: 'mark' },
        { id: 'lisa', text: 'Lisa', avatar: 'lisa' },

        // Catch-all: id: '*' vangt alle andere waarden
        { id: '*', text: 'Other colleagues & Unassigned' }
    ],

    // Conditional rendering gebaseerd op column type
    processItems({ taskRecord, headerItems }) {
        // Verberg assignee avatar in named columns
        if (['emilia', 'mark', 'lisa'].includes(taskRecord.assignee)) {
            headerItems.assignee = null;
        }
        // Toon assignee avatar alleen in catch-all column
    },

    headerItems: {
        assignee: {
            type: 'template',
            template({ value }) {
                const img = value && value !== '*'
                    ? `${value.toLowerCase()}.jpg`
                    : 'none.png';
                return `<img class="avatar" src="images/users/${img}">`;
            }
        }
    }
});
```

---

## 7. Locked Columns

> **Bron**: `examples/locked-column/app.module.js`

### Configuratie

```javascript
const taskBoard = new TaskBoard({
    columns: [
        // Normale columns - scrollen horizontaal mee
        { id: 'q1', text: 'Quarter 1', width: 350, color: '#f76707' },
        { id: 'q2', text: 'Quarter 2', width: 350, color: '#ff922b' },
        { id: 'q3', text: 'Quarter 3', width: 350, color: '#ffc078' },

        // End-locked: altijd zichtbaar aan de rechterkant
        {
            id: 'q4',
            text: 'Quarter 4',
            width: 350,
            color: '#ffe8cc',
            locked: 'end'  // Of 'start' voor links
        },

        { id: 'later', text: 'Later', width: 350, color: '#da77f2' }
    ],

    columnField: 'when',

    // Headers blijven sticky
    stickyHeaders: true,

    features: {
        columnHeaderMenu: true,
        // Feature om columns via menu te locken/unlocken
        columnLock: true
    }
});
```

### Lock Behavior

```
Normale layout (geen horizontal scroll):
┌──────────────────────────────────────────────┐
│ Q1 │ Q2 │ Q3 │ Q4 (locked) │ Later │
└──────────────────────────────────────────────┘

Bij horizontal scroll naar rechts:
┌──────────────────────────────────────────────┐
│ Q2 │ Q3 │ Later │ Q4 (locked) │  <-- Q4 blijft rechts
└──────────────────────────────────────────────┘

locked: 'start' werkt omgekeerd (blijft links bij LTR)
```

---

## 8. Column Features

### ColumnDrag Feature

```javascript
// Bron: examples/column-drag/app.module.js
const taskBoard = new TaskBoard({
    features: {
        columnDrag: true
    },

    listeners: {
        // Voorkom drag van bepaalde columns
        beforeColumnDrag({ columnRecord }) {
            // Locked columns niet verslepen
            if (columnRecord.locked) {
                return false;
            }
            // Of specifieke columns
            return columnRecord.id !== 'done';
        },

        columnDragStart({ columnRecord }) {
            console.log('Started dragging:', columnRecord.text);
        },

        columnDrag({ columnRecord, beforeColumn }) {
            // beforeColumn = waar het gedropt zou worden
            console.log(`Would drop before: ${beforeColumn?.text || 'end'}`);
        },

        beforeColumnDrop({ columnRecord, beforeColumn }) {
            // Validatie - return false om te voorkomen
            if (beforeColumn?.id === 'done') {
                Toast.show('Cannot drop before Done column');
                return false;
            }
        },

        columnDrop({ columnRecord, beforeColumn }) {
            console.log(`Dropped ${columnRecord.text} before ${beforeColumn?.text || 'end'}`);
        },

        columnDragAbort({ columnRecord }) {
            console.log('Column drag cancelled');
        },

        columnDragEnd({ columnRecord }) {
            console.log('Column drag operation ended');
        }
    }
});
```

### ColumnResize Feature

```javascript
features: {
    columnResize: true
}

listeners: {
    beforeColumnResize({ column, domEvent }) {
        // Voorkom resize van bepaalde columns
        if (column.locked) {
            return false;
        }
    },

    columnResizeStart({ column, domEvent }) {
        console.log('Resize started:', column.text);
    },

    columnResize({ column, domEvent }) {
        console.log('Resized to:', column.width, 'px');
    }
}
```

### ColumnHeaderMenu Feature

```javascript
// Bron: examples/column-header-menu/app.module.js
features: {
    columnHeaderMenu: true
}

listeners: {
    columnHeaderMenuBeforeShow({ menu, items, columnRecord }) {
        // Bestaande items aanpassen
        if (items.hideColumn) {
            items.hideColumn.text = `Hide ${columnRecord.text}`;
        }

        // Custom items toevoegen
        items.customAction = {
            text: 'Custom Action',
            icon: 'b-fa-star',
            weight: 100,  // Positie in menu
            onItem: () => {
                Toast.show(`Action on ${columnRecord.text}`);
            }
        };

        // Items verwijderen
        if (columnRecord.id === 'done') {
            items.addTask = false;
            items.removeColumn = false;
        }
    }
}
```

### ColumnRename Feature

```javascript
features: {
    columnRename: true   // Dubbelklik op header om te hernoemen
}
```

---

## 9. SwimlaneModel - Volledige API

> **Bron**: `taskboard.d.ts:132817-132877`

### TypeScript Interface

```typescript
interface SwimlaneModelConfig {
    // === IDENTIFICATIE ===
    id: string | number;               // Unieke swimlane ID
    text?: string;                     // Header tekst

    // === DIMENSIES ===
    height?: number;                   // Vaste hoogte in pixels
    flex?: number;                     // Flex-grow waarde

    // === STATE ===
    collapsed?: boolean;               // Start ingeklapt
    collapsible?: boolean;             // Kan in-/uitgeklapt worden
    hidden?: boolean;                  // Verborgen

    // === STYLING ===
    color?: SwimlaneColor | string | null;

    // === LAYOUT ===
    tasksPerRow?: number;              // Override per swimlane
}

class SwimlaneModel extends Model {
    readonly collapsed: boolean;
    readonly tasks: TaskModel[];       // Alle taken in deze swimlane
    readonly isSwimlaneModel: boolean;

    collapsible: boolean;
    color: string | null;
    flex: number;
    height: number;
    hidden: boolean;
    id: string | number;
    tasksPerRow: number;
    text: string;

    collapse(): Promise<void>;
    expand(): Promise<void>;
}
```

### Swimlane Configuratie

```javascript
// Bron: examples/swimlanes/app.module.js
const taskBoard = new TaskBoard({
    swimlanes: [
        { id: 'critical', text: 'Critical!!', color: 'red' },
        { id: 'high', text: 'High', color: 'deep-orange' },
        { id: 'medium', text: 'Medium', color: 'orange' },
        {
            id: 'low',
            text: 'Low',
            color: 'light-green',
            tasksPerRow: 3,        // Meer kaarten per rij voor lage prio
            collapsible: true
        }
    ],

    swimlaneField: 'prio',

    // Kaarten vullen beschikbare ruimte
    stretchCards: true
});
```

---

## 10. Swimlane Renderer

> **Bron**: `examples/swimlanes-content/app.module.js`

### Custom Swimlane Content

```javascript
const taskBoard = new TaskBoard({
    swimlaneField: 'team',
    swimlanes: [
        'Architects',
        'Bricklayers',
        'Carpenters',
        'Painters',
        'Finance',
        'Consultants'
    ],

    features: {
        swimlaneDrag: true
    },

    // Custom swimlane markup
    swimlaneRenderer({ swimlaneRecord, swimlaneConfig }) {
        const team = swimlaneRecord.id;
        const members = taskBoard.project.resourceStore.query(
            r => r.team === team
        );
        const memberCount = members.length;
        const taskCount = swimlaneRecord.tasks.length;

        // Info toevoegen aan header
        swimlaneConfig.children.header.children.info = {
            class: 'team-info',
            text: `${memberCount} member${memberCount !== 1 ? 's' : ''}, ` +
                  `${taskCount} task${taskCount !== 1 ? 's' : ''}`
        };

        // Team members toevoegen vóór eerste column
        swimlaneConfig.children.body.children.unshift({
            class: 'team-members',
            children: members.map(member => ({
                class: 'member',
                elementData: { member },  // Data koppelen aan element
                children: [
                    {
                        tag: 'img',
                        src: `images/users/${member.image || 'none.png'}`,
                        alt: member.name
                    },
                    `${member.name} (${member.events.length})`
                ]
            }))
        });
    }
});

// Click handler voor member elements
EventHelper.on({
    element: taskBoard.element,
    delegate: '.member',
    click(event) {
        const memberElement = event.target.closest('.member');
        const member = memberElement.elementData.member;

        // Selecteer alle taken van deze member
        taskBoard.selectedTasks = taskBoard.project.taskStore.query(
            t => t.resources.includes(member)
        );
    }
});
```

---

## 11. Responsive Columns

> **Bron**: `examples/responsive/app.module.js`

### Responsive Configuratie

```javascript
const taskBoard = new TaskBoard({
    responsive: {
        // Mobile: <= 375px
        small: {
            when: 375,

            // Configs voor deze state
            features: {
                columnToolbars: { disabled: true }
            },
            showCountInHeader: false,
            footerItems: {
                'tags > resourceAvatars': { hidden: true }
            },

            // Callback voor complexe aanpassingen
            callback({ source }) {
                source.columns.done.hidden = true;
                source.columns.considering.hidden = true;
            }
        },

        // Narrow: <= 600px
        narrow: {
            when: 600,
            showCountInHeader: false,
            footerItems: {
                'tags > resourceAvatars': { hidden: true }
            },
            callback({ source }) {
                source.columns.done.hidden = true;
                source.columns.considering.hidden = false;
            }
        },

        // Medium: <= 850px
        medium: {
            when: 850,
            callback({ source }) {
                source.columns.done.hidden = true;
                source.columns.considering.hidden = false;
            }
        },

        // Large: > 850px (default state)
        large: {
            callback({ source }) {
                source.columns.done.hidden = false;
                source.columns.considering.hidden = false;
            }
        },

        // Defaults voor alle states
        '*': {
            features: {
                columnToolbars: { disabled: false }
            },
            showCountInHeader: true,
            footerItems: {
                'tags > resourceAvatars': { hidden: false }
            }
        }
    },

    listeners: {
        responsiveStateChange({ source, state }) {
            console.log(`Responsive state changed to: ${state}`);
            // state is 'small', 'narrow', 'medium', of 'large'
        }
    }
});
```

---

## 12. Zooming & TasksPerRow

> **Bron**: `examples/zooming/app.module.js`

### Zoom Configuratie

```javascript
const taskBoard = new TaskBoard({
    // Initieel aantal kaarten per rij
    tasksPerRow: 3,

    tbar: [
        // Ingebouwde zoom slider
        { type: 'zoomslider' }
    ],

    // Programmatisch aanpassen
    listeners: {
        paint() {
            // Pas tasksPerRow aan op basis van viewport
            const width = this.element.offsetWidth;
            if (width < 600) {
                this.tasksPerRow = 1;
            } else if (width < 900) {
                this.tasksPerRow = 2;
            } else {
                this.tasksPerRow = 3;
            }
        }
    }
});

// Runtime aanpassen
taskBoard.tasksPerRow = 4;

// Per column override
taskBoard.columns.getById('done').tasksPerRow = 2;
```

---

## 13. Sorting

> **Bron**: `examples/sorting/app.module.js`

### Column Sorting

```javascript
const prioOrder = {
    high: 1,
    medium: 2,
    low: 3
};

const taskBoard = new TaskBoard({
    features: {
        columnDrag: true,
        taskDrag: {
            // Enable store reordering bij drag
            reorderTaskRecords: true
        }
    },

    tbar: [
        { type: 'label', text: 'Sort by' },
        {
            type: 'buttongroup',
            rendition: 'padded',
            toggleGroup: true,
            items: [
                {
                    text: 'Prio',
                    ref: 'sortByPrio',
                    onToggle: 'up.sortByPrio'
                },
                {
                    text: 'Name',
                    ref: 'sortByName',
                    onToggle: 'up.sortByName'
                }
            ]
        }
    ],

    project: {
        taskStore: {
            listeners: {
                // Reset sort buttons bij manual move
                move() {
                    const { sortByPrio, sortByName } = taskBoard.widgetMap;
                    sortByPrio.pressed = sortByName.pressed = false;
                }
            }
        }
    },

    // Custom sortering op prioriteit
    sortByPrio({ pressed }) {
        if (pressed) {
            this.project.taskStore.sort(
                (a, b) => prioOrder[a.prio] - prioOrder[b.prio]
            );
        }
    },

    // Alphabetische sortering
    sortByName({ pressed }) {
        if (pressed) {
            this.project.taskStore.sort('name');
        }
    }
});
```

---

## 14. Performance: Virtualisatie

> **Bron**: `examples/bigdataset/app.module.js`

### Grote Datasets

```javascript
const taskBoard = new TaskBoard({
    // Partiële virtualisatie inschakelen
    virtualize: true,

    // Geschatte hoogte voor niet-gerenderde kaarten
    getTaskHeight: () => 142,

    // Render tijdens scrollen (vs wacht tot scroll stopt)
    drawOnScroll: true,

    // Optimaliseer card sizes voor grote datasets
    cardSizes: [
        { maxWidth: 300, name: 'medium', maxAvatars: 3 },
        { name: 'large', maxAvatars: 7 }
    ],

    project: {
        taskStore: {
            // Skip data cloning en validatie
            useRawData: true
        },
        resourceStore: {
            useRawData: true
        },
        assignmentStore: {
            useRawData: true
        },

        // 5000 taken inline genereren
        tasks: ArrayHelper.populate(5000, i => ({
            id: i + 1,
            name: `Task ${i + 1}`,
            description: `Description of task #${i + 1}`,
            status: states[Math.floor(Math.random() * 3)],
            eventColor: colors[Math.floor(Math.random() * 3)]
        }))
    },

    tbar: [
        {
            type: 'slidetoggle',
            checked: true,
            text: 'Use partial virtualization',
            onChange({ checked }) {
                taskBoard.virtualize = checked;
            }
        },
        {
            type: 'slidetoggle',
            checked: true,
            text: 'Draw on scroll',
            onChange({ checked }) {
                taskBoard.drawOnScroll = checked;
            }
        }
    ]
});
```

---

## 15. Programmatisch Beheer

### Column Store API

```javascript
// Toegang tot column store
const columnStore = taskBoard.columns;

// Columns toevoegen
columnStore.add({ id: 'new', text: 'New Column', color: 'purple' });

// Meerdere toevoegen
columnStore.add([
    { id: 'col1', text: 'Column 1' },
    { id: 'col2', text: 'Column 2' }
]);

// Column verwijderen
columnStore.remove(columnStore.getById('old'));

// Column vinden
const doingColumn = columnStore.getById('doing');

// Query uitvoeren
const visibleColumns = columnStore.query(c => !c.hidden);

// Alle columns itereren
columnStore.forEach(column => {
    console.log(column.text, column.tasks.length);
});

// Column in-/uitklappen
await doingColumn.collapse();
await doingColumn.expand();

// Column properties wijzigen
doingColumn.text = 'In Progress';
doingColumn.color = 'blue';
doingColumn.hidden = true;

// Naar column scrollen
taskBoard.scrollToColumn('done');

// Column volgorde wijzigen
columnStore.move(doingColumn, columnStore.indexOf('todo'));
```

### Swimlane Store API

```javascript
// Analoog aan columns
const swimlaneStore = taskBoard.swimlanes;

swimlaneStore.add({ id: 'urgent', text: 'Urgent', color: 'red' });

const highSwimlane = swimlaneStore.getById('high');
await highSwimlane.collapse();

swimlaneStore.forEach(swimlane => {
    console.log(swimlane.text, swimlane.tasks.length);
});
```

---

## 16. Events Overzicht

### Column Events

```typescript
interface TaskBoardColumnEvents {
    // Header clicks
    onColumnHeaderClick: (event: ColumnHeaderEvent) => void;
    onColumnHeaderDblClick: (event: ColumnHeaderEvent) => void;
    onColumnHeaderContextMenu: (event: ColumnHeaderEvent) => void;

    // Title clicks (specifiek op tekst)
    onColumnTitleClick: (event: ColumnTitleEvent) => void;
    onColumnTitleDblClick: (event: ColumnTitleEvent) => void;
    onColumnTitleContextMenu: (event: ColumnTitleEvent) => void;

    // Collapse/Expand
    onColumnCollapse: (event: { columnRecord: ColumnModel }) => void;
    onColumnExpand: (event: { columnRecord: ColumnModel }) => void;
    onColumnToggle: (event: {
        columnRecord: ColumnModel,
        collapse: boolean
    }) => void;

    // Drag events
    onBeforeColumnDrag: (event: ColumnDragEvent) => boolean | void;
    onColumnDragStart: (event: ColumnDragEvent) => void;
    onColumnDrag: (event: ColumnDragMoveEvent) => void;
    onBeforeColumnDrop: (event: ColumnDropEvent) => boolean | void;
    onColumnDrop: (event: ColumnDropEvent) => void;
    onColumnDragAbort: (event: ColumnDragEvent) => void;
    onColumnDragEnd: (event: ColumnDragEvent) => void;

    // Resize events
    onBeforeColumnResize: (event: ColumnResizeEvent) => boolean | void;
    onColumnResizeStart: (event: ColumnResizeEvent) => void;
    onColumnResize: (event: ColumnResizeEvent) => void;
}

interface ColumnHeaderEvent {
    source: TaskBoard;
    columnRecord: ColumnModel;
    event: MouseEvent;
}
```

### Swimlane Events

```typescript
interface TaskBoardSwimlaneEvents {
    // Header events (analoog aan columns)
    onSwimlaneHeaderClick: (event: SwimlaneHeaderEvent) => void;
    onSwimlaneHeaderDblClick: (event: SwimlaneHeaderEvent) => void;
    onSwimlaneHeaderContextMenu: (event: SwimlaneHeaderEvent) => void;

    // Collapse/Expand
    onSwimlaneCollapse: (event: { swimlaneRecord: SwimlaneModel }) => void;
    onSwimlaneExpand: (event: { swimlaneRecord: SwimlaneModel }) => void;
    onSwimlaneToggle: (event: {
        swimlaneRecord: SwimlaneModel,
        collapse: boolean
    }) => void;

    // Drag events (analoog aan columns)
    onBeforeSwimlaneDrag: (event: SwimlaneDragEvent) => boolean | void;
    onSwimlaneDragStart: (event: SwimlaneDragEvent) => void;
    onSwimlaneDrag: (event: SwimlaneDragMoveEvent) => void;
    onBeforeSwimlaneDrop: (event: SwimlaneDropEvent) => boolean | void;
    onSwimlaneDrop: (event: SwimlaneDropEvent) => void;
    onSwimlaneDragAbort: (event: SwimlaneDragEvent) => void;
    onSwimlaneDragEnd: (event: SwimlaneDragEvent) => void;
}
```

---

## Referenties

| Item | Locatie |
|------|---------|
| ColumnModel | `taskboard.d.ts:130935-131136` |
| SwimlaneModel | `taskboard.d.ts:132817-132877` |
| ColumnToolbars | `taskboard.d.ts:128594-128756` |
| ColumnDrag Feature | `taskboard.d.ts:127452-127600` |
| Basic Example | `examples/basic/app.module.js` |
| Columns Example | `examples/columns/app.module.js` |
| Swimlanes Example | `examples/swimlanes/app.module.js` |
| Column Toolbars | `examples/column-toolbars/app.module.js` |
| Locked Column | `examples/locked-column/app.module.js` |
| Auto Columns | `examples/auto-columns/app.module.js` |
| Catch-all Column | `examples/catch-all-column/app.module.js` |
| Group By | `examples/group-by/app.module.js` |
| Responsive | `examples/responsive/app.module.js` |
| Zooming | `examples/zooming/app.module.js` |
| Sorting | `examples/sorting/app.module.js` |
| Swimlanes Content | `examples/swimlanes-content/app.module.js` |
| Big Dataset | `examples/bigdataset/app.module.js` |

---

*Laatst bijgewerkt: December 2024*
