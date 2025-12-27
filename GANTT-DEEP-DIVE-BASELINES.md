# Gantt Deep Dive: Baselines, Versions & Progress Tracking

> **Complete gids voor project baselines, versie management en progress tracking**

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Baselines Feature](#baselines-feature)
3. [Baseline Columns](#baseline-columns)
4. [Baseline Rendering](#baseline-rendering)
5. [Versions Feature](#versions-feature)
6. [Version Grid](#version-grid)
7. [Progress Line](#progress-line)
8. [Planned Percent Done](#planned-percent-done)
9. [Effort Tracking](#effort-tracking)
10. [Best Practices](#best-practices)

---

## Overzicht

Bryntum Gantt biedt uitgebreide ondersteuning voor project tracking via baselines, versions en progress lines. Dit stelt projectmanagers in staat om:
- Geplande vs. actuele planning te vergelijken
- Historische project snapshots te beheren
- Voortgang visueel te monitoren

### Concepten

```
┌─────────────────────────────────────────────────────────────────┐
│                     PROJECT TRACKING                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BASELINES                 VERSIONS                PROGRESS      │
│  ─────────                 ────────                ────────      │
│  • Snapshot van           • Volledige project     • Status Date  │
│    task dates               state opslag          • Progress Line│
│  • Tot 3 baselines        • Restore/Compare       • Planned %    │
│  • Variance tracking      • Change log                          │
│                           • User attribution                     │
│                                                                  │
│  ┌──────────┐            ┌──────────┐            ┌──────────┐   │
│  │ Baseline │            │ Version  │            │ Progress │   │
│  │ ══════   │            │ [Save]   │            │    │     │   │
│  │ [Task]   │            │ [Restore]│            │ ───┼─►   │   │
│  └──────────┘            │ [Compare]│            │    │     │   │
│                          └──────────┘            └──────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Baselines Feature

### Basis Configuratie

```typescript
import { Gantt, ProjectModel, DateHelper, StringHelper } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints : true,
    loadUrl            : '/api/project'
});

const gantt = new Gantt({
    appendTo : 'container',
    project,

    // Extra ruimte voor baseline bars
    rowHeight : 60,

    features : {
        baselines : {
            // Feature enabled
            disabled : false
        }
    }
});
```

### Baseline Data Schema

```json
{
  "tasks": {
    "rows": [
      {
        "id": 11,
        "name": "Install Apache",
        "startDate": "2019-01-14",
        "duration": 3,
        "percentDone": 50,
        "baselines": [
          {
            "startDate": "2019-01-13T23:00:00",
            "endDate": "2019-01-16T23:00:00"
          },
          {
            "startDate": "2019-01-12T23:00:00",
            "endDate": "2019-01-15T23:00:00"
          },
          {
            "startDate": "2019-01-11T23:00:00",
            "endDate": "2019-01-14T23:00:00"
          }
        ]
      }
    ]
  }
}
```

### Set Baseline Programmatisch

```typescript
// Set baseline voor alle taken
function setBaseline(index: number) {
    gantt.taskStore.setBaseline(index);
}

// Set baseline 1
setBaseline(1);

// Set baseline 2
setBaseline(2);

// Set baseline 3
setBaseline(3);
```

### Toggle Baseline Visibility

```typescript
// Toggle baseline visibility via CSS class
function toggleBaselineVisible(index: number, visible: boolean) {
    gantt.element.classList[visible ? 'remove' : 'add'](`b-hide-baseline-${index}`);
}

// Verberg baseline 2 en 3
gantt.element.classList.add('b-hide-baseline-2', 'b-hide-baseline-3');

// Toolbar met toggle buttons
tbar : {
    items : {
        setBaseline : {
            type : 'button',
            text : 'Set baseline',
            menu : [
                { text : 'Set baseline 1', onItem : () => setBaseline(1) },
                { text : 'Set baseline 2', onItem : () => setBaseline(2) },
                { text : 'Set baseline 3', onItem : () => setBaseline(3) }
            ]
        },
        showBaseline : {
            type : 'button',
            text : 'Show baseline',
            menu : [
                {
                    checked : true,
                    text : 'Baseline 1',
                    onToggle({ checked }) {
                        toggleBaselineVisible(1, checked);
                    }
                },
                {
                    checked : false,
                    text : 'Baseline 2',
                    onToggle({ checked }) {
                        toggleBaselineVisible(2, checked);
                    }
                },
                {
                    checked : false,
                    text : 'Baseline 3',
                    onToggle({ checked }) {
                        toggleBaselineVisible(3, checked);
                    }
                }
            ]
        },
        showBaselines : {
            type    : 'slidetoggle',
            text    : 'Show baselines',
            checked : true,
            onAction({ checked }) {
                gantt.features.baselines.disabled = !checked;
            }
        }
    }
}
```

---

## Baseline Columns

### Standard Baseline Columns

```typescript
columns : [
    { type : 'wbs' },
    { type : 'name', width : 300 },
    { type : 'startdate' },
    { type : 'enddate' },
    { type : 'duration' },
    { type : 'effort' },
    { type : 'actualeffort' },

    // Baseline 1 columns (collapsed group)
    {
        text        : 'Baseline 1',
        collapsible : true,
        children    : [
            { type : 'baselinestartdate', text : 'Start', field : 'baselines[0].startDate' },
            { type : 'baselineenddate', text : 'Finish', field : 'baselines[0].endDate' },
            { type : 'baselineduration', text : 'Duration', field : 'baselines[0].fullDuration' },
            { type : 'baselineeffort', text : 'Effort', field : 'baselines[0].fullEffort' },
            { type : 'baselinestartvariance', field : 'baselines[0].startVariance' },
            { type : 'baselineendvariance', field : 'baselines[0].endVariance' },
            { type : 'baselinedurationvariance', field : 'baselines[0].durationVariance' }
        ]
    },

    // Baseline 2 columns (initially collapsed)
    {
        text        : 'Baseline 2',
        collapsible : true,
        collapsed   : true,
        children    : [
            { type : 'baselinestartdate', text : 'Start', field : 'baselines[1].startDate' },
            { type : 'baselineenddate', text : 'Finish', field : 'baselines[1].endDate' },
            { type : 'baselineduration', text : 'Duration', field : 'baselines[1].fullDuration' },
            { type : 'baselinestartvariance', field : 'baselines[1].startVariance' },
            { type : 'baselineendvariance', field : 'baselines[1].endVariance' },
            { type : 'baselinedurationvariance', field : 'baselines[1].durationVariance' }
        ]
    }
]
```

### Variance Columns

De variance columns tonen het verschil tussen baseline en actuele planning:

| Column Type | Beschrijving |
|-------------|--------------|
| baselinestartvariance | Start date verschil (dagen) |
| baselineendvariance | End date verschil (dagen) |
| baselinedurationvariance | Duration verschil (dagen) |

---

## Baseline Rendering

### Custom Baseline Renderer

```typescript
// Renderer functie voor baseline styling
const baselineRenderer = ({ baselineRecord, taskRecord, renderData }) => {
    // Check of baseline data aanwezig is
    if (!baselineRecord.isScheduled || !taskRecord.isScheduled) {
        return;
    }

    // Task is achter op schema (>1 dag)
    if (baselineRecord.endDate.getTime() + 24 * 3600 * 1000 < taskRecord.endDate.getTime()) {
        renderData.className['b-baseline-behind'] = 1;
    }
    // Task is voor op schema
    else if (taskRecord.endDate < baselineRecord.endDate) {
        renderData.className['b-baseline-ahead'] = 1;
    }
    // Task is op schema
    else {
        renderData.className['b-baseline-on-time'] = 1;
    }
};

const gantt = new Gantt({
    features : {
        baselines : {
            renderer : baselineRenderer
        }
    }
});
```

### Baseline Renderer Toggle

```typescript
// Toggle renderer dynamisch
tbar : {
    items : {
        enableRenderer : {
            type    : 'slidetoggle',
            text    : 'Enable baseline renderer',
            checked : false,
            onAction({ checked }) {
                gantt.features.baselines.renderer = checked
                    ? baselineRenderer
                    : () => {};
            }
        }
    }
}
```

### Custom Baseline Tooltip

```typescript
features : {
    baselines : {
        template(data) {
            const
                me           = this,
                { baseline } = data,
                { task }     = baseline,
                delayed      = task.startDate > baseline.startDate,
                overrun      = task.durationMS > baseline.durationMS;

            let { decimalPrecision } = me;
            if (decimalPrecision == null) {
                decimalPrecision = me.client.durationDisplayPrecision;
            }

            const
                multiplier      = Math.pow(10, decimalPrecision),
                displayDuration = Math.round(baseline.duration * multiplier) / multiplier;

            return `
                <div class="b-gantt-task-title">
                    ${StringHelper.encodeHtml(task.name)}
                    (${me.L('baseline')} ${baseline.parentIndex + 1})
                </div>
                <table>
                    <tr>
                        <td>${me.L('Start')}:</td>
                        <td>${data.startClockHtml}</td>
                    </tr>
                    ${baseline.milestone ? '' : `
                        <tr>
                            <td>${me.L('End')}:</td>
                            <td>${data.endClockHtml}</td>
                        </tr>
                        <tr>
                            <td>${me.L('Duration')}:</td>
                            <td class="b-right">
                                ${displayDuration} ${DateHelper.getLocalizedNameOfUnit(
                                    baseline.durationUnit,
                                    baseline.duration !== 1
                                )}
                            </td>
                        </tr>
                    `}
                </table>
                ${delayed ? `
                    <h4 class="statusmessage b-baseline-delay">
                        <i class="statusicon fa fa-exclamation-triangle"></i>
                        ${me.L('Delayed start by')} ${DateHelper.formatDelta(task.startDate - baseline.startDate)}
                    </h4>
                ` : ''}
                ${overrun ? `
                    <h4 class="statusmessage b-baseline-overrun">
                        <i class="statusicon fa fa-exclamation-triangle"></i>
                        ${me.L('Overrun by')} ${DateHelper.formatDelta(task.durationMS - baseline.durationMS)}
                    </h4>
                ` : ''}
            `;
        }
    }
}
```

### Baseline Styling CSS

```css
/* Baseline status styling */
.b-baseline-behind {
    background-color: #f44336 !important;  /* Rood - achter */
}

.b-baseline-ahead {
    background-color: #4caf50 !important;  /* Groen - voor */
}

.b-baseline-on-time {
    background-color: #2196f3 !important;  /* Blauw - op tijd */
}

/* Baseline bar styling */
.b-gantt-baseline {
    opacity: 0.7;
    border-radius: 3px;
}

/* Tooltip styling */
.b-baseline-delay,
.b-baseline-overrun {
    color: #f44336;
    margin-top: 8px;
}
```

---

## Versions Feature

### Version Feature Configuratie

```typescript
import {
    Gantt, ProjectModel, VersionModel,
    ChangeLogTransactionModel, StringHelper, DateHelper
} from '@bryntum/gantt';

// Custom VersionModel met user tracking
class VersionModelWithUser extends VersionModel {
    static $name = 'VersionModelWithUser';

    static fields = [
        { name : 'username', type : 'string' }
    ];

    onBeforeSave() {
        this.username = currentUserName;
    }

    get defaultDescription() {
        const savedAt = this.savedAt;
        return `${this.isAutosave ? 'Auto-saved' : `Saved by ${StringHelper.capitalize(this.username)}`} on
            ${DateHelper.format(savedAt, 'MMM D YYYY')} at ${DateHelper.format(savedAt, 'h:mm a')}`;
    }
}

// Custom TransactionModel met user tracking
class TransactionModelWithUser extends ChangeLogTransactionModel {
    static $name = 'TransactionModelWithUser';

    static fields = [
        { name : 'username', type : 'string' }
    ];

    construct(config) {
        super.construct({
            username : currentUserName,
            ...config
        });
    }
}

const gantt = new Gantt({
    enableUndoRedoKeys : true,

    project : {
        autoSetConstraints : true,
        loadUrl            : '/api/project',
        autoLoad           : true,
        stm                : {
            autoRecord : true
        }
    },

    features : {
        baselines : {
            disabled : true  // Disable tot comparison
        },
        versions : {
            versionModelClass     : VersionModelWithUser,
            transactionModelClass : TransactionModelWithUser
        },
        dependencies   : true,
        dependencyEdit : true
    },

    tbar : [
        'Gantt view',
        '->',
        {
            ref   : 'undoredoTool',
            type  : 'undoredo',
            text  : true,
            items : {
                transactionsCombo : null
            }
        }
    ],

    listeners : {
        // Custom transaction descriptions
        taskDrop({ taskRecords }) {
            this.features.versions.transactionDescription = taskRecords.length === 1
                ? `Dragged task ${taskRecords[0].name}`
                : `Dragged ${taskRecords.length} tasks`;
        },

        taskResizeEnd({ taskRecord }) {
            this.features.versions.transactionDescription = `Resized task ${taskRecord.name}`;
        },

        afterDependencyCreateDrop() {
            this.features.versions.transactionDescription = 'Drew a link';
        },

        transactionChange({ hasUnattachedTransactions }) {
            // Enable/disable save button
            this.owner.widgetMap.saveButton.disabled = !hasUnattachedTransactions;
        }
    }
});
```

### Version Operaties

```typescript
const { versions, baselines } = gantt.features;

// Save huidige state als nieuwe version
await versions.saveVersion();

// Save met description
await versions.saveVersion('Release 1.0 milestone');

// Stop current transaction
versions.stopTransaction();

// Restore een version
async function restoreVersion(version) {
    await versions.restoreVersion(version);
    baselines.disabled = true;
    project.stm.resetQueue();
}

// Compare version (toont als baseline)
async function compareVersion(version) {
    baselines.disabled = false;
    await versions.compareVersion(version);
    gantt.refreshRows();
}

// Stop comparing
async function stopComparing() {
    baselines.disabled = true;
    await versions.stopComparing();
}

// Get version content
const content = await versions.getVersionContent(versionModel);
```

---

## Version Grid

### VersionGrid Widget

```typescript
import { VersionGrid, Container } from '@bryntum/gantt';

// Custom VersionGrid met user avatars
class MyVersionGrid extends VersionGrid {
    static $name = 'MyVersionGrid';
    static type = 'myversiongrid';

    static configurable = {
        columns : [
            {
                type      : 'tree',
                text      : 'Description',
                field     : 'description',
                flex      : 3,
                groupable : false,
                renderer(event) {
                    const { record, grid } = event;
                    if (record.transactionModel) {
                        const { description, transactionModel: { username } } = record;
                        return {
                            children : [
                                {
                                    tag   : 'img',
                                    class : 'user-avatar',
                                    src   : `/images/users/${username}.png`,
                                    alt   : username
                                },
                                {
                                    tag  : 'span',
                                    html : StringHelper.encodeHtml(description)
                                }
                            ]
                        };
                    }
                    return grid.renderDescription(event);
                },
                autoHeight : true
            },
            {
                text      : 'Occurred At',
                field     : 'occurredAt',
                type      : 'date',
                format    : 'M/D/YY h:mm a',
                flex      : 1,
                groupable : false
            }
        ]
    };
}

MyVersionGrid.initClass();

// Container met Gantt en VersionGrid
const app = new Container({
    appendTo : 'container',
    layout   : 'hbox',
    flex     : 1,
    items    : {
        gantt,
        splitter    : { type : 'splitter' },
        versionGrid : {
            type                       : MyVersionGrid.type,
            flex                       : 1,
            emptyText                  : 'No versions to display',
            project                    : gantt.project,
            showUnattachedTransactions : true,
            selectionMode              : {
                row  : true,
                cell : false
            },
            features : {
                cellMenu : {
                    items : {
                        duplicateButton : {
                            text   : 'Duplicate',
                            icon   : 'fa fa-copy',
                            async onItem({ record }) {
                                const result = await MessageDialog.confirm({
                                    title   : 'Duplicate Version?',
                                    message : 'Create a new project from this version?'
                                });
                                if (result === MessageDialog.yesButton) {
                                    await gantt.features.versions.getVersionContent(record.versionModel);
                                    gantt.project = new ProjectModel(record.versionModel.content);
                                }
                            }
                        }
                    }
                }
            },
            tbar : {
                items : {
                    saveButton : {
                        text : 'Save Version',
                        icon : 'fa fa-plus',
                        onClick : () => gantt.features.versions.saveVersion()
                    },
                    spacer          : '->',
                    onlyNamedToggle : {
                        type : 'slidetoggle',
                        text : 'Named only',
                        onChange({ checked }) {
                            app.widgetMap.versionGrid.showNamedVersionsOnly = checked;
                        }
                    },
                    showVersionsToggle : {
                        type    : 'slidetoggle',
                        text    : 'Changes only',
                        checked : false,
                        onChange({ checked }) {
                            app.widgetMap.versionGrid.showVersions = !checked;
                        }
                    }
                }
            },
            listeners : {
                async restore({ version }) {
                    const result = await MessageDialog.confirm({
                        title   : 'Restore Version?',
                        message : 'Replace current project with this version?'
                    });
                    if (result === MessageDialog.yesButton) {
                        await gantt.features.versions.restoreVersion(version);
                        gantt.features.baselines.disabled = true;
                        project.stm.resetQueue();
                    }
                },

                async compare({ source, version }) {
                    gantt.features.baselines.disabled = false;
                    await gantt.features.versions.compareVersion(version);
                    source.comparingVersionId = version.id;
                    gantt.refreshRows();
                },

                async stopCompare({ source }) {
                    gantt.features.baselines.disabled = true;
                    await gantt.features.versions.stopComparing();
                    source.comparingVersionId = null;
                }
            }
        }
    }
});
```

---

## Progress Line

### Progress Line Feature

De Progress Line toont visueel de voortgang van het project op een bepaalde status datum:

```typescript
const statusDate = new Date(2019, 0, 27);

const gantt = new Gantt({
    appendTo : 'container',

    startDate : '2019-01-08',
    endDate   : '2019-04-01',

    project : {
        autoSetConstraints : true,
        loadUrl            : '/api/project'
    },

    features : {
        progressLine : {
            statusDate
        }
    },

    viewPreset : 'weekAndDayLetter',

    tbar : [
        {
            type      : 'slidetoggle',
            label     : 'Show project line',
            checked   : true,
            listeners : {
                change({ checked }) {
                    gantt.features.progressLine.disabled = !checked;
                }
            }
        },
        {
            type       : 'datefield',
            label      : 'Project status date',
            value      : statusDate,
            step       : '1d',
            inputWidth : '13em',
            listeners  : {
                change({ value }) {
                    gantt.features.progressLine.statusDate = value;
                }
            }
        },
        '->',
        {
            icon      : 'fa-angle-left',
            rendition : 'text',
            onAction() {
                this.up('gantt').shiftPrevious();
            }
        },
        {
            type       : 'viewpresetcombo',
            inputWidth : '9.5em'
        },
        {
            icon      : 'fa-angle-right',
            rendition : 'text',
            onAction() {
                this.up('gantt').shiftNext();
            }
        }
    ]
});
```

### Progress Line Styling

```css
/* Progress line styling */
.b-gantt-progress-line {
    stroke: #ff5722;
    stroke-width: 2;
    stroke-dasharray: 5, 3;
}

/* Progress line marker */
.b-gantt-progress-line-marker {
    fill: #ff5722;
}
```

---

## Planned Percent Done

### PlannedPercentDone Column

```typescript
const project = new ProjectModel({
    autoSetConstraints : true,
    statusDate         : new Date(2019, 0, 28),
    loadUrl            : '/api/project'
});

const gantt = new Gantt({
    project,
    rowHeight : 60,

    columns : [
        { type : 'name', width : 250 },
        {
            text        : 'Baseline 1',
            collapsible : true,
            children    : [
                { type : 'baselinestartdate', text : 'Start', field : 'baselines[0].startDate' },
                { type : 'baselineenddate', text : 'Finish', field : 'baselines[0].endDate' },

                // Planned Percent Done - vergelijkt met baseline
                {
                    type            : 'plannedpercentdone',
                    baselineVersion : 1,
                    mode            : 'circle',  // 'circle' of 'bar'
                    id              : 'ppd1'
                }
            ]
        },
        {
            text        : 'Baseline 2',
            collapsible : true,
            children    : [
                { type : 'baselinestartdate', text : 'Start', field : 'baselines[1].startDate' },
                { type : 'baselineenddate', text : 'Finish', field : 'baselines[1].endDate' },
                {
                    type            : 'plannedpercentdone',
                    baselineVersion : 2,
                    mode            : 'circle',
                    id              : 'ppd2'
                }
            ]
        }
    ]
});
```

### Planned Percent Done Berekening

```
Planned % Done = (Status Date - Baseline Start) / Baseline Duration * 100

Als Status Date = 28 jan
   Baseline Start = 14 jan
   Baseline Duration = 10 dagen

Dan: Planned % = (14 dagen) / 10 * 100 = 140% (capped at 100%)
```

---

## Effort Tracking

### Effort Columns

```typescript
columns : [
    { type : 'name', width : 250 },

    // Geplande effort
    { type : 'effort', text : 'Effort' },

    // Actuele effort
    { type : 'actualeffort', text : 'Actual Effort' },

    // Baseline effort
    {
        type  : 'baselineeffort',
        text  : 'Baseline Effort',
        field : 'baselines[0].fullEffort'
    }
]
```

### Effort Data Schema

```json
{
  "tasks": {
    "rows": [
      {
        "id": 11,
        "name": "Install Apache",
        "duration": 3,
        "effort": 24,
        "effortUnit": "hour",
        "baselines": [
          {
            "startDate": "2019-01-13",
            "endDate": "2019-01-16",
            "effort": 20,
            "effortUnit": "hour"
          }
        ]
      }
    ]
  }
}
```

---

## Best Practices

### 1. Baseline Strategie

```typescript
// Definieer baseline momenten
const BASELINE_MILESTONES = {
    1 : 'Initial Plan',
    2 : 'After Requirements',
    3 : 'After Design'
};

function setBaseline(index: number) {
    if (confirm(`Set ${BASELINE_MILESTONES[index]}?`)) {
        gantt.taskStore.setBaseline(index);
        Toast.show(`Baseline ${index} set: ${BASELINE_MILESTONES[index]}`);
    }
}
```

### 2. Version Autosave

```typescript
project : {
    stm : {
        autoRecord : true
    }
},

features : {
    versions : {
        // Auto-save elke 5 minuten
        autoSaveInterval : 5 * 60 * 1000
    }
}
```

### 3. Progress Tracking Dashboard

```typescript
function getProgressStats() {
    const tasks = gantt.taskStore.allRecords;
    const baseline = 1;

    let ahead = 0, behind = 0, onTime = 0;

    tasks.forEach(task => {
        if (task.isLeaf && task.baselines?.[baseline - 1]) {
            const baselineEnd = task.baselines[baseline - 1].endDate;
            const actualEnd = task.endDate;
            const threshold = 24 * 3600 * 1000; // 1 dag

            if (actualEnd.getTime() > baselineEnd.getTime() + threshold) {
                behind++;
            } else if (actualEnd < baselineEnd) {
                ahead++;
            } else {
                onTime++;
            }
        }
    });

    return { ahead, behind, onTime, total : ahead + behind + onTime };
}
```

### 4. Export met Baselines

```typescript
async function exportWithBaselines() {
    // Enable baselines voor export
    gantt.features.baselines.disabled = false;

    await gantt.features.pdfExport.export({
        fileName   : 'project-with-baselines.pdf',
        exporterType : 'singlepage'
    });

    // Herstel vorige state indien nodig
}
```

---

## Samenvatting

### Feature Vergelijking

| Feature | Doel | Opslag | UI Component |
|---------|------|--------|--------------|
| Baselines | Snapshot van dates | Per task (max 3) | Timeline bars |
| Versions | Complete project state | Centraal | VersionGrid |
| Progress Line | Visuele status | StatusDate | Line op timeline |
| Planned % | Verwachte voortgang | Berekend | Column |

### Veelgebruikte Kolom Types

| Type | Beschrijving |
|------|--------------|
| baselinestartdate | Baseline start datum |
| baselineenddate | Baseline eind datum |
| baselineduration | Baseline duur |
| baselineeffort | Baseline effort |
| baselinestartvariance | Verschil start |
| baselineendvariance | Verschil eind |
| baselinedurationvariance | Verschil duur |
| plannedpercentdone | Geplande voortgang |

---

## Gerelateerde Documenten

- [GANTT-DEEP-DIVE-CONSTRAINTS.md](./GANTT-DEEP-DIVE-CONSTRAINTS.md) - Scheduling & Constraints
- [GANTT-DEEP-DIVE-CRITICAL-PATH.md](./GANTT-DEEP-DIVE-CRITICAL-PATH.md) - Critical Path Analysis
- [INTEGRATION-REALTIME.md](./INTEGRATION-REALTIME.md) - WebSocket & STM
- [DEEP-DIVE-STM.md](./DEEP-DIVE-STM.md) - State Tracking Manager

---

*Bryntum Gantt 7.1.0 - Baselines & Versions Deep Dive*
