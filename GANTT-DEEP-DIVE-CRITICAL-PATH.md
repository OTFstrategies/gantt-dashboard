# Gantt Deep Dive: Critical Path Analysis

> **Complete gids voor Critical Path Method (CPM), Early/Late dates en Total Slack**

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Critical Path Feature](#critical-path-feature)
3. [Early & Late Dates](#early--late-dates)
4. [Total Slack](#total-slack)
5. [Critical Path Columns](#critical-path-columns)
6. [Styling & Highlighting](#styling--highlighting)
7. [Programmatic Access](#programmatic-access)
8. [Best Practices](#best-practices)

---

## Overzicht

De Critical Path Method (CPM) is een fundamentele techniek in projectmanagement. Bryntum Gantt berekent automatisch:
- **Early Dates**: Vroegst mogelijke start/eind
- **Late Dates**: Laatst mogelijke start/eind (zonder project te vertragen)
- **Total Slack**: Flexibiliteit in planning
- **Critical Path**: Taken waarbij vertraging direct het project vertraagt

### CPM Concepten

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CRITICAL PATH METHOD                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Forward Pass (Early Dates)          Backward Pass (Late Dates)     │
│  ─────────────────────────          ───────────────────────────     │
│                                                                      │
│  Start ──► ES1 ──► EF1 ──►          LS4 ◄── LF4 ◄── End             │
│            │              │          │              │                │
│            ▼              ▼          ▼              ▼                │
│       [Task 1]  ───►  [Task 3] ───► [Task 4]                        │
│            │              │          │                               │
│            └───► [Task 2] ┘          └──────────────┘                │
│                                                                      │
│  Total Slack = LS - ES = LF - EF                                     │
│                                                                      │
│  If Total Slack = 0 → Task is on CRITICAL PATH                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Critical Path Feature

### Basis Configuratie

```typescript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    loadUrl          : '/api/project',
    validateResponse : true
});

const gantt = new Gantt({
    appendTo : 'container',
    project,

    dependencyIdField : 'sequenceNumber',

    columns : [
        { type : 'name' },
        { type : 'earlystartdate' },
        { type : 'earlyenddate' },
        { type : 'latestartdate' },
        { type : 'lateenddate' },
        { type : 'totalslack' }
    ],

    features : {
        // Critical paths feature is always included
        // but starts disabled by default
        criticalPaths : {
            disabled              : false,  // Enable feature
            highlightCriticalRows : true    // Highlight row backgrounds
        }
    },

    tbar : [
        {
            type    : 'slidetoggle',
            color   : 'b-red',
            ref     : 'criticalPathsButton',
            text    : 'Highlight Critical Paths',
            checked : true,
            onChange({ checked }) {
                // Toggle critical paths feature
                gantt.features.criticalPaths.disabled = !checked;
            }
        }
    ]
});

project.load();
```

### Feature Opties

```typescript
features : {
    criticalPaths : {
        // Feature aan/uit (default: true = disabled)
        disabled : false,

        // Highlight ook de rijen, niet alleen de task bars
        highlightCriticalRows : true,

        // Custom class voor critical tasks
        cls : 'my-critical-task'
    }
}
```

---

## Early & Late Dates

### Berekening Forward Pass (Early Dates)

```
Early Start (ES) = Max(Early Finish van alle predecessors + lag)
Early Finish (EF) = Early Start + Duration

Voor taken zonder predecessors:
ES = Project Start Date (of constraint date)
```

### Berekening Backward Pass (Late Dates)

```
Late Finish (LF) = Min(Late Start van alle successors - lag)
Late Start (LS) = Late Finish - Duration

Voor taken zonder successors:
LF = Project End Date (of constraint date)
```

### Voorbeeld Berekening

```
Project: Jan 2 - Mar 6

Task Hierarchy:
├── Setup web server (5 days)
│   ├── Install Apache (3 days)    ES: Jan 2  EF: Jan 5
│   ├── Configure firewall (3 days) ES: Jan 2  EF: Jan 5
│   ├── Setup load balancer (3 days) ES: Jan 2  EF: Jan 5
│   ├── Configure ports (2 days)    ES: Jan 2  EF: Jan 4
│   └── Run tests (2 days)          ES: Jan 7  EF: Jan 9  ← Depends on all above
│
└── Website Design (15 days)
    ├── Contact designers (5 days)  ES: Jan 9  EF: Jan 16 ← Depends on "Run tests"
    └── ...

Critical Path:
Install Apache → Run tests → Contact designers → ... → Project End
```

---

## Total Slack

### Slack Berekening

```typescript
// Total Slack (ook wel Float genoemd)
Total Slack = Late Start - Early Start
            = Late Finish - Early Finish

// Free Slack (lokale flexibiliteit)
Free Slack = Min(Early Start van successors) - Early Finish
```

### Slack Interpretatie

| Total Slack | Betekenis |
|-------------|-----------|
| 0 | Critical task - geen flexibiliteit |
| > 0 | Non-critical - kan verschuiven zonder project te vertragen |
| < 0 | Overschrijding - project deadline wordt niet gehaald |

### Slack Kolom

```typescript
columns : [
    { type : 'name', width : 250 },

    // Total Slack column
    {
        type  : 'totalslack',
        text  : 'Total Slack',
        width : 100
    }
]
```

---

## Critical Path Columns

### Alle Beschikbare Kolom Types

```typescript
columns : [
    { type : 'name' },

    // Early Dates
    {
        type : 'earlystartdate',
        text : 'Early Start'
    },
    {
        type : 'earlyenddate',
        text : 'Early Finish'
    },

    // Late Dates
    {
        type : 'latestartdate',
        text : 'Late Start'
    },
    {
        type : 'lateenddate',
        text : 'Late Finish'
    },

    // Slack
    {
        type : 'totalslack',
        text : 'Total Slack'
    },

    // Free Slack (niet standaard, custom)
    {
        text   : 'Free Slack',
        field  : 'freeSlack',
        width  : 100,
        renderer({ value }) {
            return value ? `${value} days` : '-';
        }
    }
]
```

### Kolom Data Schema

De kolommen lezen direct van de task records die door de scheduling engine worden berekend:

```typescript
// Automatisch berekende task fields
interface TaskCriticalPathFields {
    earlyStartDate : Date;    // Vroegst mogelijke start
    earlyEndDate   : Date;    // Vroegst mogelijke eind
    lateStartDate  : Date;    // Laatst mogelijke start
    lateEndDate    : Date;    // Laatst mogelijke eind
    totalSlack     : number;  // Slack in durationUnit
    critical       : boolean; // Is op critical path
}
```

---

## Styling & Highlighting

### CSS Styling voor Critical Path

```css
/* Critical task bar styling */
.b-gantt-task.b-critical {
    background-color: #f44336 !important;
    border-color: #d32f2f !important;
}

/* Critical task bar progress */
.b-gantt-task.b-critical .b-gantt-task-percent {
    background-color: #b71c1c;
}

/* Critical dependency line */
.b-sch-dependency.b-critical {
    stroke: #f44336 !important;
    stroke-width: 2px;
}

/* Critical row highlighting (when highlightCriticalRows: true) */
.b-grid-row.b-critical {
    background-color: rgba(244, 67, 54, 0.1);
}

/* Custom critical class */
.b-gantt-task.my-critical-task {
    background: linear-gradient(135deg, #f44336, #ff7043);
    box-shadow: 0 2px 4px rgba(244, 67, 54, 0.3);
}
```

### Dynamische Styling

```typescript
const gantt = new Gantt({
    features : {
        criticalPaths : {
            disabled : false
        }
    },

    // Custom task renderer voor extra styling
    taskRenderer({ taskRecord, renderData }) {
        if (taskRecord.critical) {
            renderData.cls['b-priority-high'] = true;

            // Voeg extra info toe
            if (taskRecord.totalSlack === 0) {
                return {
                    tag      : 'div',
                    class    : 'critical-indicator',
                    children : [
                        { tag : 'i', class : 'fa fa-exclamation-triangle' },
                        { tag : 'span', text : taskRecord.name }
                    ]
                };
            }
        }
    }
});
```

### Toggle Button Styling

```css
/* Toggle button styling */
.b-slidetoggle.b-red {
    --toggle-active-bg: #f44336;
}

.b-slidetoggle.b-red:hover {
    --toggle-active-bg: #d32f2f;
}
```

---

## Programmatic Access

### Task Critical Path Properties

```typescript
// Check of een task critical is
const task = gantt.taskStore.getById(11);

if (task.critical) {
    console.log('Task is on critical path');
    console.log('Total Slack:', task.totalSlack);
}

// Early/Late dates uitlezen
console.log('Early Start:', task.earlyStartDate);
console.log('Early End:', task.earlyEndDate);
console.log('Late Start:', task.lateStartDate);
console.log('Late End:', task.lateEndDate);
```

### Alle Critical Tasks Ophalen

```typescript
function getCriticalTasks() {
    return gantt.taskStore.allRecords.filter(task => task.critical);
}

function getCriticalPath() {
    const criticalTasks = getCriticalTasks();

    // Sorteer op early start date
    return criticalTasks.sort((a, b) =>
        a.earlyStartDate - b.earlyStartDate
    );
}

// Voorbeeld gebruik
const criticalPath = getCriticalPath();
console.log('Critical Path Tasks:', criticalPath.map(t => t.name));
console.log('Total Critical Tasks:', criticalPath.length);
```

### Critical Path Statistieken

```typescript
function getCriticalPathStats() {
    const allTasks = gantt.taskStore.allRecords.filter(t => t.isLeaf);
    const criticalTasks = allTasks.filter(t => t.critical);

    const stats = {
        totalTasks         : allTasks.length,
        criticalTasks      : criticalTasks.length,
        criticalPercentage : (criticalTasks.length / allTasks.length * 100).toFixed(1),
        averageSlack       : 0,
        maxSlack           : 0,
        tasksWithZeroSlack : 0
    };

    let totalSlack = 0;
    allTasks.forEach(task => {
        totalSlack += task.totalSlack || 0;
        stats.maxSlack = Math.max(stats.maxSlack, task.totalSlack || 0);
        if (task.totalSlack === 0) stats.tasksWithZeroSlack++;
    });

    stats.averageSlack = (totalSlack / allTasks.length).toFixed(1);

    return stats;
}
```

### Critical Path Event Listeners

```typescript
gantt.on({
    // Wanneer critical path mogelijk verandert
    dataChange({ store, action }) {
        if (['add', 'remove', 'update'].includes(action)) {
            // Wacht op herberekening
            gantt.project.commitAsync().then(() => {
                const criticalTasks = getCriticalTasks();
                console.log('Critical path updated:', criticalTasks.length, 'tasks');
            });
        }
    }
});

// Monitor critical path changes
let previousCriticalIds = new Set();

gantt.project.on({
    async dataReady() {
        const currentCritical = getCriticalTasks();
        const currentIds = new Set(currentCritical.map(t => t.id));

        // Detect changes
        const newCritical = currentCritical.filter(t => !previousCriticalIds.has(t.id));
        const removedFromCritical = [...previousCriticalIds].filter(id => !currentIds.has(id));

        if (newCritical.length || removedFromCritical.length) {
            console.log('Critical path changed!');
            console.log('New critical:', newCritical.map(t => t.name));
            console.log('Removed from critical:', removedFromCritical);
        }

        previousCriticalIds = currentIds;
    }
});
```

---

## Best Practices

### 1. Project Setup voor CPM

```typescript
const project = new ProjectModel({
    // Dependencies zijn essentieel voor critical path
    autoSetConstraints : true,

    // Validate data
    validateResponse : true,

    loadUrl : '/api/project'
});
```

### 2. Visualisatie Dashboard

```typescript
function renderCriticalPathDashboard() {
    const stats = getCriticalPathStats();
    const criticalPath = getCriticalPath();

    return `
        <div class="cpm-dashboard">
            <div class="stat">
                <span class="value">${stats.criticalPercentage}%</span>
                <span class="label">Critical Tasks</span>
            </div>
            <div class="stat">
                <span class="value">${stats.averageSlack} days</span>
                <span class="label">Average Slack</span>
            </div>
            <div class="critical-path-list">
                ${criticalPath.map(t => `
                    <div class="path-item">
                        ${t.name}
                        <span class="dates">
                            ${DateHelper.format(t.startDate, 'MMM D')} -
                            ${DateHelper.format(t.endDate, 'MMM D')}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
```

### 3. Critical Path Export

```typescript
async function exportCriticalPath() {
    const criticalTasks = getCriticalTasks();

    // Focus op critical path voor export
    gantt.features.criticalPaths.disabled = false;

    // Filter om alleen critical tasks te tonen
    gantt.taskStore.filter({
        id       : 'criticalFilter',
        filterBy : task => task.critical || !task.isLeaf
    });

    // Export
    await gantt.features.pdfExport.export({
        fileName     : 'critical-path.pdf',
        exporterType : 'singlepage'
    });

    // Herstel filter
    gantt.taskStore.removeFilter('criticalFilter');
}
```

### 4. Performance Monitoring

```typescript
function monitorCriticalPath() {
    const checks = [];

    getCriticalTasks().forEach(task => {
        // Check op risico's
        if (task.percentDone < 50 && task.endDate < new Date()) {
            checks.push({
                task    : task,
                risk    : 'high',
                message : `${task.name} is behind schedule on critical path`
            });
        }

        // Check op resource issues
        if (task.resources.length === 0) {
            checks.push({
                task    : task,
                risk    : 'medium',
                message : `${task.name} has no assigned resources`
            });
        }
    });

    return checks;
}
```

---

## Dependency Data voor Critical Path

### Data Schema met Dependencies

```json
{
  "tasks": {
    "rows": [
      {
        "id": 31,
        "name": "Hire QA staff",
        "startDate": "2019-01-02",
        "duration": 5
      },
      {
        "id": 33,
        "name": "Write test specs",
        "startDate": "2019-01-09",
        "duration": 10
      }
    ]
  },
  "dependencies": {
    "rows": [
      {
        "id": 11,
        "fromTask": 31,
        "toTask": 33,
        "type": 2,
        "lag": 0
      }
    ]
  }
}
```

### Dependency Types

| Type | Naam | Beschrijving |
|------|------|--------------|
| 0 | SS | Start-to-Start |
| 1 | SF | Start-to-Finish |
| 2 | FS | Finish-to-Start (default) |
| 3 | FF | Finish-to-Finish |

---

## Samenvatting

### CPM Formules

```
Forward Pass:
ES = Max(EF of predecessors + lag)
EF = ES + Duration

Backward Pass:
LF = Min(LS of successors - lag)
LS = LF - Duration

Slack:
Total Slack = LS - ES = LF - EF
Free Slack = Min(ES of successors) - EF

Critical Path:
Tasks where Total Slack = 0
```

### Quick Reference

```typescript
// Enable critical paths
gantt.features.criticalPaths.disabled = false;

// Check if task is critical
task.critical // boolean

// Get slack
task.totalSlack // number (in durationUnit)

// Get early/late dates
task.earlyStartDate
task.earlyEndDate
task.lateStartDate
task.lateEndDate

// Get all critical tasks
gantt.taskStore.allRecords.filter(t => t.critical)
```

---

## Gerelateerde Documenten

- [GANTT-DEEP-DIVE-CONSTRAINTS.md](./GANTT-DEEP-DIVE-CONSTRAINTS.md) - Constraints & Scheduling
- [GANTT-DEEP-DIVE-BASELINES.md](./GANTT-DEEP-DIVE-BASELINES.md) - Baselines & Progress
- [GANTT-DEEP-DIVE-RESOURCES.md](./GANTT-DEEP-DIVE-RESOURCES.md) - Resource Management
- [INTEGRATION-EXPORT.md](./INTEGRATION-EXPORT.md) - PDF Export

---

*Bryntum Gantt 7.1.0 - Critical Path Deep Dive*
