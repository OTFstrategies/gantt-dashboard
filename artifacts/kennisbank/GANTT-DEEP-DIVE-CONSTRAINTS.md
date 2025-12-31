# Gantt Deep Dive: Constraints & Scheduling Engine

> **Complete gids voor task scheduling, constraints, conflicts en de scheduling engine**

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Constraint Types](#constraint-types)
3. [Auto Constraints](#auto-constraints)
4. [Scheduling Direction](#scheduling-direction)
5. [Conflict Detection](#conflict-detection)
6. [Conflict Resolution](#conflict-resolution)
7. [Postponed Conflicts](#postponed-conflicts)
8. [Inactive Tasks](#inactive-tasks)
9. [Pin Successors](#pin-successors)
10. [Scheduling Engine Internals](#scheduling-engine-internals)
11. [Columns & Indicators](#columns--indicators)
12. [Best Practices](#best-practices)

---

## Overzicht

De Bryntum Gantt scheduling engine is een krachtig systeem dat automatisch taken plant op basis van dependencies, constraints, calendars en resources. Dit document beschrijft alle aspecten van het scheduling systeem.

### Core Concepten

```
┌─────────────────────────────────────────────────────────────┐
│                    SCHEDULING ENGINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Dependencies│    │ Constraints │    │  Calendars  │      │
│  │             │    │             │    │             │      │
│  │ FS, SS, FF, │    │ SNET, SNLT  │    │ Working     │      │
│  │ SF + lag    │    │ FNET, FNLT  │    │ intervals   │      │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            ▼                                 │
│                  ┌─────────────────┐                         │
│                  │  Task Dates     │                         │
│                  │  Calculation    │                         │
│                  └─────────────────┘                         │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Early Dates │    │ Late Dates  │    │ Total Slack │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Constraint Types

### Alle Constraint Types

Bryntum ondersteunt 8 constraint types, gegroepeerd in flexible en inflexible constraints:

```typescript
import { ConstraintType } from '@bryntum/gantt';

// Flexible Constraints (kunnen verschuiven op basis van dependencies)
ConstraintType.StartNoEarlierThan     // 'startnoearlierthan' - SNET
ConstraintType.StartNoLaterThan       // 'startnolaterthan'   - SNLT
ConstraintType.FinishNoEarlierThan    // 'finishnoearlierthan' - FNET
ConstraintType.FinishNoLaterThan      // 'finishnolaterthan'   - FNLT

// Inflexible Constraints (vast, kunnen conflicten veroorzaken)
ConstraintType.MustStartOn            // 'muststarton'  - MSO
ConstraintType.MustFinishOn           // 'mustfinishon' - MFO

// Special Types
ConstraintType.AsSoonAsPossible       // 'assoonaspossible' - ASAP (default)
ConstraintType.AsLateAsPossible       // 'aslateaspossible' - ALAP
```

### Constraint Data Schema

```json
{
  "tasks": {
    "rows": [
      {
        "id": 11,
        "name": "Install Apache",
        "startDate": "2019-01-14",
        "duration": 3,
        "constraintType": "finishnoearlierthan",
        "constraintDate": "2019-01-17"
      },
      {
        "id": 12,
        "name": "Configure firewall",
        "constraintType": "finishnolaterthan",
        "constraintDate": "2019-01-17"
      },
      {
        "id": 13,
        "name": "Setup load balancer",
        "constraintType": "startnolaterthan",
        "constraintDate": "2019-01-28"
      },
      {
        "id": 22,
        "name": "Create shortlist",
        "constraintType": "mustfinishon",
        "constraintDate": "2019-01-31"
      },
      {
        "id": 23,
        "name": "Select & review",
        "constraintType": "muststarton",
        "constraintDate": "2019-01-31",
        "deadlineDate": "2019-02-04"
      }
    ]
  }
}
```

### Constraint Columns

```typescript
const gantt = new Gantt({
    columns : [
        { type : 'name', width : 200 },
        { type : 'startdate' },
        { type : 'duration' },

        // Constraint columns
        { type : 'constrainttype', width : 170 },
        { type : 'constraintdate', width : 100 },

        // Deadline column
        { type : 'deadline', width : 100 }
    ]
});
```

### Programmatic Constraint Setting

```typescript
// Set constraint op een task
const task = gantt.taskStore.getById(11);

// Via direct assignment
task.constraintType = ConstraintType.MustStartOn;
task.constraintDate = new Date(2024, 0, 15);

// Of via set method
task.set({
    constraintType : 'startnoearlierthan',
    constraintDate : '2024-01-20'
});

// Verwijder constraint
task.constraintType = null;
task.constraintDate = null;

// Wacht op recalculatie
await gantt.project.commitAsync();
```

---

## Auto Constraints

### autoSetConstraints

De `autoSetConstraints` optie voegt automatisch een `StartNoEarlierThan` constraint toe aan taken die:
- Geen predecessors hebben
- Nog geen constraint hebben
- Niet `manuallyScheduled` zijn

```typescript
const gantt = new Gantt({
    project : {
        // Automatisch SNET constraints voor root tasks
        autoSetConstraints : true,

        autoLoad : true,
        loadUrl  : '/api/project'
    },

    tbar : [
        {
            type     : 'slidetoggle',
            text     : 'Auto-set constraints',
            checked  : true,
            onChange({ value }) {
                // Toggle en herlaad data
                this.up('gantt').project.autoSetConstraints = value;
                this.up('gantt').project.load();
            }
        }
    ]
});
```

### Waarom Auto Constraints?

Zonder auto constraints kan een taak zonder predecessors onverwacht naar het verleden verschuiven wanneer:
- De project startDate verandert
- Dependencies worden verwijderd
- De scheduling engine herberekent

```typescript
// Voorbeeld: Task zonder constraint
{
    id        : 1,
    name      : 'Task A',
    startDate : '2024-01-15',  // Kan verschuiven!
    duration  : 5
}

// Met autoSetConstraints krijgt deze automatisch:
{
    id             : 1,
    name           : 'Task A',
    startDate      : '2024-01-15',
    duration       : 5,
    constraintType : 'startnoearlierthan',
    constraintDate : '2024-01-15'  // Kan niet eerder starten
}
```

---

## Scheduling Direction

### Forward vs Backward Scheduling

```typescript
const gantt = new Gantt({
    columns : [
        { type : 'name', width : 250 },
        { type : 'constrainttype', width : 170 },

        // Scheduling direction column
        { type : 'schedulingdirection', width : 150, hidden : true }
    ],

    project : {
        autoSetConstraints : true,
        autoLoad           : true,
        loadUrl            : '/api/project'
    }
});

// Set task direction programmatisch
project.on('load', () => {
    const task = project.getEventById(14);
    task.direction = 'Backward';  // of 'Forward'
});
```

### Direction Enum

```typescript
// Task scheduling direction
type SchedulingDirection = 'Forward' | 'Backward';

// Forward (default): Taken starten zo vroeg mogelijk
// Backward: Taken eindigen zo laat mogelijk (vanuit deadline)
```

---

## Conflict Detection

### Conflict Types

De scheduling engine detecteert automatisch vier types conflicten:

```typescript
// 1. Invalid Dependency - Task linkt naar zichzelf
gantt.dependencyStore.add({ fromTask : 11, toTask : 11 });

// 2. Cyclic Dependency - Circulaire dependency chain
gantt.dependencyStore.add({ fromTask : 15, toTask : 14 });
// Terwijl er al bestaat: { fromTask : 14, toTask : 15 }

// 3. Constraint Conflict - Conflicterende constraints
const task = gantt.taskStore.getById(11);
task.startDate = new Date(task.startDate.getTime() + 2 * 24 * 3600 * 1000);
// Kan conflicteren met een SNLT constraint

// 4. Invalid Calendar - Calendar zonder working time
const [calendar] = gantt.calendarManagerStore.add({
    name                     : 'Invalid Calendar',
    unspecifiedTimeIsWorking : false  // Geen working intervals!
});
gantt.taskStore.getById(11).calendar = calendar;
```

### Conflict Detection Setup

```typescript
const gantt = new Gantt({
    project : {
        autoSetConstraints : true,
        autoLoad           : true,
        loadUrl            : '/api/project'
    },

    features : {
        indicators : {
            items : {
                deadlineDate   : false,
                earlyDates     : false,
                lateDates      : false,
                // Display constraint indicators
                constraintDate : true
            }
        },
        dependencyEdit : true
    },

    tbar : {
        items : {
            addInvalid : {
                text : 'Add invalid dependency',
                icon : 'fa fa-bug',
                onClick() {
                    // Trigger invalid dependency conflict
                    gantt.dependencyStore.add({
                        fromTask : 11,
                        toTask   : 11
                    });
                }
            },
            addCycle : {
                text : 'Add dependency cycle',
                icon : 'fa fa-bug',
                onClick() {
                    // Trigger cyclic dependency conflict
                    gantt.dependencyStore.add({
                        fromTask : 15,
                        toTask   : 14
                    });
                }
            }
        }
    }
});
```

---

## Conflict Resolution

### Automatische Conflict Dialog

Bij conflicten toont Bryntum automatisch een resolution dialog:

```typescript
// Conflict resolution options worden automatisch gepresenteerd:
// - Remove the dependency
// - Remove the constraint
// - Cancel (revert changes)

// Custom conflict handling via event
gantt.project.on({
    schedulingConflict({ conflict, continueWithResolutionResult }) {
        console.log('Conflict detected:', conflict);

        // Optie 1: Laat default dialog zien
        return;

        // Optie 2: Auto-resolve
        continueWithResolutionResult(ConflictResolutionResult.Cancel);
    }
});
```

### Resolution Results

```typescript
import { ConflictResolutionResult } from '@bryntum/gantt';

// Mogelijke resoluties
ConflictResolutionResult.Cancel      // Annuleer de wijziging
ConflictResolutionResult.Remove      // Verwijder de constraint/dependency
ConflictResolutionResult.Continue    // Forceer de wijziging
```

---

## Postponed Conflicts

### Uitgestelde Conflict Resolution

In plaats van direct een conflict op te lossen, kun je conflicts postponen voor later:

```typescript
const gantt = new Gantt({
    project : {
        autoSetConstraints : true,

        // Option 1: Voeg "Postpone" optie toe aan dialog
        allowPostponedConflicts : true,

        // Option 2: Automatisch postponen zonder dialog
        autoPostponeConflicts : true,

        // STM voor undo/redo
        stm : {
            autoRecord : true
        },
        resetUndoRedoQueuesAfterLoad : true,

        // Fine-tune scheduling
        autoScheduleManualTasksOnSecondPass : false
    },

    columns : [
        // Info column toont postponed conflict indicator
        { type : 'info', width : 50 },
        { type : 'name', width : 120 },
        { type : 'startdate' },
        { type : 'duration' },
        { type : 'constrainttype' },
        { type : 'constraintdate' },
        { type : 'totalslack' },
        { type : 'addnew' }
    ],

    features : {
        indicators : {
            items : {
                constraintDate : true
            }
        },
        dependencyEdit : true
    }
});
```

### Postponed Conflict Field

```typescript
// Check of een task een postponed conflict heeft
const task = gantt.taskStore.getById(11);

if (task.postponedConflict) {
    console.log('Task has postponed conflict:', task.postponedConflict);

    // Resolve later via indicator click of programmatisch
    task.resolvePostponedConflict();
}
```

---

## Inactive Tasks

### Inactive Task Concept

Inactive tasks worden niet meegenomen in de scheduling engine:

```json
{
  "tasks": {
    "rows": [
      {
        "id": 1,
        "name": "Setup web server",
        "inactive": true,
        "expanded": true,
        "children": [
          {
            "id": 11,
            "name": "Install Apache",
            "inactive": true
          }
        ]
      },
      {
        "id": 2,
        "name": "Website Design",
        "inactive": false
      }
    ]
  }
}
```

### Inactive Column & Configuratie

```typescript
const gantt = new Gantt({
    project : {
        autoSetConstraints : true,
        autoLoad           : true,
        loadUrl            : '/api/inactive-tasks',

        // Validate responses in development
        validateResponse   : true
    },

    columns : [
        { type : 'name', width : 250 },
        { type : 'startdate' },

        // Inactive toggle column
        { type : 'inactive' }
    ]
});
```

### Programmatic Inactive Toggle

```typescript
// Maak task inactive
const task = gantt.taskStore.getById(11);
task.inactive = true;

// Dit zorgt ervoor dat:
// 1. De task wordt niet meer gescheduled
// 2. Dependencies vanuit deze task hebben geen effect
// 3. De task wordt visueel anders weergegeven
// 4. Child tasks erven de inactive status

await gantt.project.commitAsync();
```

---

## Pin Successors

### Wat is Pin Successors?

Normaal verschuiven successors mee wanneer een predecessor wordt verplaatst. Met pinSuccessors kan de user met CTRL/CMD de successors op hun plek houden:

```typescript
const gantt = new Gantt({
    project : {
        autoSetConstraints : true,
        transport          : {
            load : { url : '/api/project' }
        },
        validateResponse : true
    },

    dependencyIdField : 'sequenceNumber',

    tbar : {
        items : {
            textLabel : {
                type : 'label',
                html : 'Press <div class="keycap">ctrl</div> (Win) or ' +
                       '<div class="keycap">cmd</div> (Mac) to pin successors'
            }
        }
    },

    columns : [
        { type : 'name', width : 250 }
    ],

    features : {
        taskDrag : {
            // Enable pinSuccessors voor drag
            pinSuccessors : true
        },
        taskResize : {
            // Enable pinSuccessors voor resize
            pinSuccessors : true
        }
    }
});

project.load();
```

### Hoe Pin Successors Werkt

```
Normaal (zonder CTRL):
  Predecessor [====]────►Successor [====]
  Na drag:
  Predecessor     [====]────►Successor     [====]

Met CTRL (pin successors):
  Predecessor [====]────►Successor [====]
  Na drag:           lag wordt aangepast
  Predecessor     [====]──►Successor [====]
```

De lag op de dependency wordt automatisch herberekend zodat de successor op dezelfde positie blijft.

---

## Scheduling Engine Internals

### Early & Late Dates

De scheduling engine berekent voor elke taak:

```typescript
const gantt = new Gantt({
    columns : [
        { type : 'name' },

        // Early dates - vroegst mogelijke planning
        { type : 'earlystartdate' },
        { type : 'earlyenddate' },

        // Late dates - laatst mogelijke planning
        { type : 'latestartdate' },
        { type : 'lateenddate' },

        // Slack - verschil tussen early en late
        { type : 'totalslack' }
    ]
});
```

### Slack Berekening

```
Total Slack = Late Start - Early Start
            = Late Finish - Early Finish

Als Total Slack = 0 → Task is op Critical Path
```

### commitAsync Pattern

```typescript
// Na elke wijziging moet de engine recalculeren
async function modifyTask() {
    const task = gantt.taskStore.getById(11);

    // Wijzig task
    task.startDate = new Date(2024, 0, 15);
    task.duration = 5;

    // Wacht op engine herberekening
    await gantt.project.commitAsync();

    // Nu zijn alle derived fields correct
    console.log('Early Start:', task.earlyStartDate);
    console.log('Late Start:', task.lateStartDate);
    console.log('Total Slack:', task.totalSlack);
}
```

---

## Columns & Indicators

### Constraint Indicator Feature

```typescript
const gantt = new Gantt({
    features : {
        indicators : {
            items : {
                // Constraint indicator
                constraintDate : true,

                // Deadline indicator
                deadlineDate : true,

                // Early/late date indicators
                earlyDates : false,
                lateDates  : false
            }
        }
    }
});
```

### Custom Indicator Styling

```css
/* Constraint indicator styling */
.b-gantt-task-indicator.b-constraint {
    background-color: #ff9800;
}

/* Deadline indicator styling */
.b-gantt-task-indicator.b-deadline {
    background-color: #f44336;
}

/* Postponed conflict indicator */
.b-gantt-task-indicator.b-postponed-conflict {
    background-color: #e91e63;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
```

### Info Column

De InfoColumn toont task informatie en postponed conflicts:

```typescript
columns : [
    {
        type  : 'info',
        width : 50,
        // Toont automatisch:
        // - Constraint icons
        // - Deadline warnings
        // - Postponed conflict indicators
    },
    { type : 'name', width : 200 }
]
```

---

## Best Practices

### 1. Project Configuratie

```typescript
const project = new ProjectModel({
    // Altijd autoSetConstraints voor voorspelbaar gedrag
    autoSetConstraints : true,

    // Validate tijdens development
    validateResponse : process.env.NODE_ENV === 'development',

    // STM voor undo/redo support
    stm : {
        autoRecord : true
    },

    // Reset undo queue na load
    resetUndoRedoQueuesAfterLoad : true
});
```

### 2. Conflict Handling Strategie

```typescript
// Development: Toon conflicts
project.allowPostponedConflicts = false;

// Production: Postpone voor user review
project.autoPostponeConflicts = true;
```

### 3. Performance bij Bulk Updates

```typescript
async function bulkUpdateConstraints(tasks) {
    // Suspend events
    gantt.taskStore.suspendEvents();

    try {
        for (const { id, constraintType, constraintDate } of tasks) {
            const task = gantt.taskStore.getById(id);
            task.constraintType = constraintType;
            task.constraintDate = constraintDate;
        }
    } finally {
        // Resume en single commit
        gantt.taskStore.resumeEvents();
    }

    // Single recalculation
    await gantt.project.commitAsync();
}
```

### 4. Constraint Validation

```typescript
function validateConstraint(task, constraintType, constraintDate) {
    // Check voor logische conflicten vooraf
    switch (constraintType) {
        case ConstraintType.MustStartOn:
            // Check tegen dependencies
            const predecessors = task.predecessors;
            for (const dep of predecessors) {
                if (dep.fromTask.endDate > constraintDate) {
                    return {
                        valid   : false,
                        message : `Predecessor ${dep.fromTask.name} ends after constraint date`
                    };
                }
            }
            break;

        case ConstraintType.MustFinishOn:
            const duration = task.duration;
            const startNeeded = DateHelper.add(constraintDate, -duration, 'day');
            // Validate start date is possible
            break;
    }

    return { valid : true };
}
```

---

## Samenvatting

### Constraint Type Cheatsheet

| Type | Afkorting | Gedrag |
|------|-----------|--------|
| StartNoEarlierThan | SNET | Start >= constraintDate |
| StartNoLaterThan | SNLT | Start <= constraintDate |
| FinishNoEarlierThan | FNET | End >= constraintDate |
| FinishNoLaterThan | FNLT | End <= constraintDate |
| MustStartOn | MSO | Start = constraintDate (hard) |
| MustFinishOn | MFO | End = constraintDate (hard) |
| AsSoonAsPossible | ASAP | Vroegst mogelijke start |
| AsLateAsPossible | ALAP | Laatst mogelijke start |

### Conflict Resolution Flow

```
Change Detected
      │
      ▼
Engine Recalculates
      │
      ▼
Conflict Found? ─── No ──► Done
      │
     Yes
      │
      ▼
autoPostponeConflicts? ─── Yes ──► Postpone & Mark Task
      │
     No
      │
      ▼
Show Resolution Dialog
      │
      ├── Cancel ──► Revert Change
      ├── Remove ──► Delete Constraint/Dependency
      └── Postpone ─► Mark for Later
```

---

## Gerelateerde Documenten

- [GANTT-DEEP-DIVE-BASELINES.md](./GANTT-DEEP-DIVE-BASELINES.md) - Baselines en versions
- [GANTT-DEEP-DIVE-CRITICAL-PATH.md](./GANTT-DEEP-DIVE-CRITICAL-PATH.md) - Critical path analysis
- [INTEGRATION-SHARED-PROJECT.md](./INTEGRATION-SHARED-PROJECT.md) - ProjectModel patterns
- [DEEP-DIVE-CRUDMANAGER.md](./DEEP-DIVE-CRUDMANAGER.md) - Data loading/saving

---

*Bryntum Gantt 7.1.0 - Constraints & Scheduling Deep Dive*
