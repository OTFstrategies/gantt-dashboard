# Gantt Deep Dive: WBS, Rollups & Summary Tasks

> **Complete gids voor Work Breakdown Structure, rollups en summary task management**

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [WBS Column](#wbs-column)
3. [WBS Modes](#wbs-modes)
4. [Rollups Feature](#rollups-feature)
5. [Summary Tasks](#summary-tasks)
6. [Split Tasks](#split-tasks)
7. [Task Hierarchy](#task-hierarchy)
8. [Best Practices](#best-practices)

---

## Overzicht

Work Breakdown Structure (WBS) is een fundamenteel concept in projectmanagement. Bryntum Gantt biedt:
- **WBS Column**: Automatische hiërarchische nummering
- **Rollups**: Visuele weergave van child tasks op parent
- **Summary Tasks**: Automatische berekening van parent task dates

### WBS Concepten

```
┌─────────────────────────────────────────────────────────────────┐
│                  WORK BREAKDOWN STRUCTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Launch SaaS Product                    (Summary Task)        │
│  │                                                               │
│  ├── 1.1 Setup web server                  (Summary Task)        │
│  │   ├── 1.1.1 Install Apache              (Leaf Task)          │
│  │   ├── 1.1.2 Configure firewall          (Leaf Task)          │
│  │   ├── 1.1.3 Setup load balancer         (Leaf Task)          │
│  │   └── 1.1.4 Run tests                   (Leaf Task)          │
│  │                                                               │
│  ├── 1.2 Website Design                    (Summary Task)        │
│  │   ├── 1.2.1 Contact designers           (Leaf Task)          │
│  │   ├── 1.2.2 Create shortlist            (Leaf Task)          │
│  │   └── 1.2.3 Apply design                (Leaf Task)          │
│  │                                                               │
│  └── 1.3 Application Implementation        (Summary Task)        │
│      ├── 1.3.1 Phase #1                    (Summary Task)        │
│      │   └── 1.3.1.1 Authentication        (Leaf Task)          │
│      └── 1.3.2 Phase #2                    (Summary Task)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## WBS Column

### Basic WBS Column

```typescript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints : true,
    autoLoad           : true,
    loadUrl            : '/api/project'
});

const gantt = new Gantt({
    appendTo          : 'container',
    dependencyIdField : 'sequenceNumber',
    project,

    columns : [
        { type : 'wbs' },  // WBS Column
        { type : 'name', width : 320 }
    ]
});
```

### WBS Column Configuratie

```typescript
columns : [
    {
        type          : 'wbs',
        text          : 'WBS Code',
        width         : 100,
        align         : 'right',

        // Custom WBS separator (default: '.')
        wbsSeparator  : '.',

        // Toon leading zeros
        leadingZeros  : false
    },
    { type : 'name', width : 320 }
]
```

### WBS in Dependencies

```typescript
const gantt = new Gantt({
    // Gebruik WBS code voor dependency identificatie
    dependencyIdField : 'wbsCode',

    project : {
        loadUrl : '/api/project'
    }
});

// Data schema met WBS-based dependencies
{
    "dependencies": {
        "rows": [
            { "id": 1, "fromTask": "1.1.1", "toTask": "1.1.4" },
            { "id": 2, "fromTask": "1.1.4", "toTask": "1.2.1" }
        ]
    }
}
```

---

## WBS Modes

### Manual vs Auto Mode

```typescript
const project = new ProjectModel({
    taskStore : {
        // 'auto': WBS wordt automatisch bijgewerkt
        // 'manual': WBS blijft statisch
        wbsMode : 'manual'  // default
    }
});

// Toggle via toolbar
tbar : [
    {
        type    : 'slidetoggle',
        label   : 'Auto update WBS',
        checked : false,
        tooltip : 'Automatisch WBS bijwerken bij wijzigingen',
        onAction({ checked }) {
            project.taskStore.wbsMode = checked ? 'auto' : 'manual';
        }
    }
]
```

### Ordered Tree voor WBS

```typescript
const project = new ProjectModel({
    taskStore : {
        // Behoud originele volgorde voor WBS berekening
        // Sorting is alleen visueel
        useOrderedTreeForWbs : true
    }
});

// Toggle
tbar : [
    {
        type    : 'slidetoggle',
        label   : 'Use ordered tree for WBS',
        checked : true,
        tooltip : 'Project tree behoudt originele volgorde',
        onAction({ checked }) {
            project.taskStore.useOrderedTreeForWbs = checked;
        }
    }
]
```

### WBS Update Triggers

In **auto** mode wordt WBS bijgewerkt bij:
- Task toevoegen
- Task verwijderen
- Task verplaatsen (drag & drop)
- Tree sortering

In **manual** mode moet je WBS handmatig bijwerken:

```typescript
// Force WBS recalculation
project.taskStore.updateWBS();

// Update single task WBS
task.updateWBSCode();
```

---

## Rollups Feature

### Basic Rollups

Rollups tonen de positie van child tasks op de parent task bar:

```typescript
const gantt = new Gantt({
    project : {
        autoSetConstraints : true,
        loadUrl            : '/api/project',
        autoLoad           : true
    },

    columns : [
        { type : 'wbs' },
        { type : 'name' },
        { type : 'rollup' }  // Rollup column
    ],

    // Extra ruimte voor rollups
    rowHeight : 50,
    barMargin : 11,

    features : {
        rollups : true  // Enable rollups feature
    }
});
```

### Rollup Column

```typescript
columns : [
    { type : 'wbs' },
    { type : 'name', width : 250 },
    {
        type  : 'rollup',
        text  : 'Rollup',
        width : 80,
        // Toon checkbox om rollup per task te togglen
        editor : {
            type : 'checkbox'
        }
    }
]
```

### Rollup Toggle

```typescript
tbar : [
    {
        type    : 'slidetoggle',
        label   : 'Show Rollups',
        checked : true,
        onAction({ checked }) {
            gantt.features.rollups.disabled = !checked;
        }
    }
]
```

### Rollup Data Schema

```json
{
  "tasks": {
    "rows": [
      {
        "id": 3,
        "name": "Setup Test Strategy",
        "rollup": true,
        "expanded": true,
        "children": [
          {
            "id": 31,
            "name": "Hire QA staff",
            "startDate": "2019-01-02",
            "duration": 5
          }
        ]
      }
    ]
  }
}
```

---

## Summary Tasks

### Summary Task Berekening

Summary tasks (parent tasks) worden automatisch berekend:

```
Summary Start Date = Min(Child Start Dates)
Summary End Date = Max(Child End Dates)
Summary Duration = Calculated from Start/End
Summary Percent Done = Gewogen gemiddelde van children
```

```typescript
// Programmatic access
const summaryTask = gantt.taskStore.getById(1);

console.log('Start:', summaryTask.startDate);  // Berekend
console.log('End:', summaryTask.endDate);      // Berekend
console.log('Duration:', summaryTask.duration); // Berekend
console.log('Progress:', summaryTask.percentDone); // Gewogen gemiddelde
```

### Summary Task Styling

```css
/* Summary task bar styling */
.b-gantt-task-parent {
    background-color: #9e9e9e;
    height: 6px;
    border-radius: 3px;
}

.b-gantt-task-parent .b-task-percent-bar {
    height: 6px;
    background-color: #616161;
}

/* Summary task arrows */
.b-gantt-task-parent::before,
.b-gantt-task-parent::after {
    content: '';
    position: absolute;
    bottom: 0;
    border-style: solid;
}

.b-gantt-task-parent::before {
    left: 0;
    border-width: 0 4px 6px 0;
    border-color: transparent #333 transparent transparent;
}

.b-gantt-task-parent::after {
    right: 0;
    border-width: 0 0 6px 4px;
    border-color: transparent transparent transparent #333;
}
```

---

## Split Tasks

### Split Task Concept

Split tasks zijn onderbroken taken met gaps:

```json
{
  "tasks": {
    "rows": [
      {
        "id": 1,
        "name": "Split Task",
        "segments": [
          {
            "startDate": "2024-01-15",
            "duration": 3
          },
          {
            "startDate": "2024-01-22",
            "duration": 2
          }
        ]
      }
    ]
  }
}
```

### Split Tasks Feature

```typescript
const gantt = new Gantt({
    features : {
        taskSplit : true  // Enable task splitting
    }
});
```

### Split Task UI

```typescript
// Split via context menu
features : {
    taskMenu : {
        items : {
            splitTask : {
                text : 'Split task',
                icon : 'fa fa-cut',
                onItem({ taskRecord }) {
                    // Split at midpoint
                    const midDate = new Date(
                        taskRecord.startDate.getTime() +
                        (taskRecord.endDate - taskRecord.startDate) / 2
                    );
                    taskRecord.split(midDate);
                }
            }
        }
    }
}
```

---

## Task Hierarchy

### Parent/Child Relationships

```typescript
// Navigatie door hierarchy
const task = gantt.taskStore.getById(11);

// Parent access
const parent = task.parent;
const root = task.root;

// Child access
const children = task.children;
const allDescendants = task.allChildren;

// Sibling navigation
const previousSibling = task.previousSibling;
const nextSibling = task.nextSibling;

// Type checks
const isLeaf = task.isLeaf;
const isParent = task.isParent;
const isRoot = task.isRoot;
```

### Task Indenting

```typescript
// Indent task (maak child van previous sibling)
task.indent();

// Outdent task (maak sibling van parent)
task.outdent();

// Programmatic hierarchy change
task.parentId = newParentId;

// Via TaskStore
gantt.taskStore.indent(task);
gantt.taskStore.outdent(task);
```

### Task Menu voor Hierarchy

```typescript
features : {
    taskMenu : {
        items : {
            add : {
                menu : {
                    subtask : {
                        // Nieuwe subtasks als laatste child
                        at : 'end'
                    },
                    taskAbove : {
                        // Nieuwe task boven
                        at : 'before'
                    },
                    taskBelow : {
                        // Nieuwe task onder
                        at : 'after'
                    }
                }
            }
        }
    }
}
```

---

## Best Practices

### 1. WBS Performance

```typescript
// Bij bulk operaties: suspend WBS updates
project.taskStore.suspendAutoUpdate();

try {
    // Bulk adds
    project.taskStore.add([task1, task2, task3]);
} finally {
    project.taskStore.resumeAutoUpdate();
    project.taskStore.updateWBS();  // Single update
}
```

### 2. Rollup Optimization

```typescript
// Alleen rollups voor bepaalde levels
features : {
    rollups : {
        // Custom filter
        filter : (task) => {
            // Alleen eerste 2 levels
            return task.wbsLevel <= 2;
        }
    }
}
```

### 3. Summary Task Validation

```typescript
// Listener voor summary task changes
gantt.on({
    beforeTaskEdit({ taskRecord }) {
        if (taskRecord.isParent) {
            // Prevent editing summary task dates
            return {
                readOnly : ['startDate', 'endDate', 'duration']
            };
        }
    }
});
```

### 4. Export met WBS

```typescript
async function exportWithWBS() {
    // Ensure WBS is up to date
    if (project.taskStore.wbsMode === 'manual') {
        project.taskStore.updateWBS();
    }

    await gantt.features.pdfExport.export({
        columns : [
            { type : 'wbs' },
            { type : 'name' },
            { type : 'startdate' },
            { type : 'enddate' }
        ],
        fileName : 'project-wbs.pdf'
    });
}
```

---

## Samenvatting

### WBS Mode Vergelijking

| Mode | WBS Update | Gebruik |
|------|-----------|---------|
| manual | Bij expliciete call | Stabiele projecten |
| auto | Bij elke wijziging | Dynamische projecten |

### Columns & Features

```typescript
// Minimale setup voor WBS + Rollups
const gantt = new Gantt({
    columns : [
        { type : 'wbs' },
        { type : 'name' },
        { type : 'rollup' }
    ],
    features : {
        rollups : true
    },
    rowHeight : 50,
    barMargin : 11
});
```

### Task Hierarchy Properties

| Property | Type | Beschrijving |
|----------|------|--------------|
| parent | TaskModel | Parent task |
| children | TaskModel[] | Direct children |
| allChildren | TaskModel[] | All descendants |
| isLeaf | boolean | Geen children |
| isParent | boolean | Heeft children |
| wbsCode | string | WBS code (1.2.3) |
| wbsLevel | number | Depth level |

---

## Gerelateerde Documenten

- [GANTT-DEEP-DIVE-BASELINES.md](./GANTT-DEEP-DIVE-BASELINES.md) - Summary progress
- [GANTT-DEEP-DIVE-CRITICAL-PATH.md](./GANTT-DEEP-DIVE-CRITICAL-PATH.md) - CPM & slack
- [GANTT-DEEP-DIVE-CUSTOMIZATION.md](./GANTT-DEEP-DIVE-CUSTOMIZATION.md) - Custom rendering
- [INTEGRATION-EXPORT.md](./INTEGRATION-EXPORT.md) - WBS export

---

*Bryntum Gantt 7.1.0 - WBS & Rollups Deep Dive*
