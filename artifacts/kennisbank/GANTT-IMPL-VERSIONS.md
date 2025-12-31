# Gantt Implementation: Versions

> **Versions** voor het beheren van project versies met save, restore en compare.

---

## Overzicht

Bryntum Gantt's Versions feature biedt versioning met save, restore en compare functionaliteit.

```
+--------------------------------------------------------------------------+
| GANTT                                           [Undo] [Redo]            |
+--------------------------------------------------------------------------+
|  WBS  |  Name              |        Timeline                             |
+--------------------------------------------------------------------------+
|  1    |  Project           |  ════════════════════════                   |
|  1.1  |    Install Apache  |     ████████ (moved)                        |
|  1.2  |    Configure       |         ████████                            |
+--------------------------------------------------------------------------+
|                                                                          |
| VERSION GRID                    [Save Version] [Named only] [Changes]    |
+--------------------------------------------------------------------------+
|  [img] Description                               |  Occurred At          |
+--------------------------------------------------------------------------+
|  ▼ Saved by Dan on Dec 25 2024 at 2:30 PM       |  12/25/24 2:30 PM     |
|       ├─ Moved task Install Apache              |  12/25/24 2:28 PM     |
|       └─ Moved task Install Apache              |  12/25/24 2:25 PM     |
|  ▼ Auto-saved on Dec 25 2024 at 2:00 PM         |  12/25/24 2:00 PM     |
|       └─ Dragged task Configure                 |  12/25/24 1:55 PM     |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Versions Setup

### 1.1 Enable Versions Feature

```javascript
import { Gantt, ProjectModel, VersionModel, ChangeLogTransactionModel, DateHelper, StringHelper } from '@bryntum/gantt';

// Custom Version Model with username
class VersionModelWithUser extends VersionModel {
    static $name = 'VersionModelWithUser';

    static fields = [
        { name: 'username', type: 'string' }
    ];

    onBeforeSave() {
        this.username = currentUserName;
    }

    get defaultDescription() {
        return `${this.isAutosave ? 'Auto-saved' : `Saved by ${StringHelper.capitalize(this.username)}`} on
        ${DateHelper.format(this.savedAt, 'MMM D YYYY')} at ${DateHelper.format(this.savedAt, 'h:mm a')}`;
    }
}

// Custom Transaction Model with username
class TransactionModelWithUser extends ChangeLogTransactionModel {
    static $name = 'TransactionModelWithUser';

    static fields = [
        { name: 'username', type: 'string' }
    ];

    construct(config) {
        super.construct({
            username: currentUserName,
            ...config
        });
    }
}

const currentUserName = 'dan';

const project = new ProjectModel({
    autoSetConstraints: true,
    loadUrl: 'data/tasks.json',
    autoLoad: true,
    stm: {
        autoRecord: true
    }
});

const gantt = new Gantt({
    appendTo: 'container',
    enableUndoRedoKeys: true,
    project,

    features: {
        versions: {
            versionModelClass: VersionModelWithUser,
            transactionModelClass: TransactionModelWithUser
        }
    },

    columns: [
        { type: 'wbs' },
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'duration' }
    ],

    listeners: {
        // Set custom transaction description for task drag
        taskDrop({ taskRecords }) {
            this.features.versions.transactionDescription = taskRecords.length === 1
                ? `Dragged task ${taskRecords[0].name}`
                : `Dragged ${taskRecords.length} tasks`;
        },

        taskResizeEnd({ taskRecord }) {
            this.features.versions.transactionDescription = `Resized task ${taskRecord.name}`;
        },

        afterDependencyCreateDrop() {
            this.features.versions.transactionDescription = `Drew a link`;
        }
    }
});
```

---

## 2. Version Grid Widget

### 2.1 Custom Version Grid

```javascript
import { VersionGrid, Container } from '@bryntum/gantt';

// Custom VersionGrid with user avatars
class MyVersionGrid extends VersionGrid {
    static $name = 'MyVersionGrid';
    static type = 'myversiongrid';

    static configurable = {
        columns: [
            {
                type: 'tree',
                text: 'Description',
                field: 'description',
                flex: 3,
                groupable: false,
                renderer(event) {
                    const { record, grid } = event;
                    if (record.transactionModel) {
                        const { description, transactionModel: { username } } = record;
                        return {
                            children: [
                                {
                                    tag: 'img',
                                    class: 'user-avatar',
                                    src: `images/users/${username}.png`,
                                    alt: username
                                },
                                {
                                    tag: 'span',
                                    html: StringHelper.encodeHtml(description)
                                }
                            ]
                        };
                    }
                    return grid.renderDescription(event);
                },
                autoHeight: true
            },
            {
                text: 'Occurred At',
                field: 'occurredAt',
                type: 'date',
                format: 'M/D/YY h:mm a',
                flex: 1
            }
        ]
    };
}

MyVersionGrid.initClass();

// Create app layout
const app = new Container({
    appendTo: 'container',
    layout: 'hbox',
    items: {
        gantt,
        splitter: { type: 'splitter' },
        versionGrid: {
            type: 'myversiongrid',
            flex: 1,
            emptyText: 'No versions to display',
            project: gantt.project,
            showUnattachedTransactions: true,

            tbar: {
                items: {
                    saveButton: {
                        text: 'Save Version',
                        icon: 'fa fa-plus',
                        listeners: {
                            click: () => gantt.features.versions.saveVersion()
                        }
                    },
                    spacer: '->',
                    onlyNamedToggle: {
                        type: 'slidetoggle',
                        text: 'Named only',
                        listeners: {
                            change: ({ checked }) => {
                                app.widgetMap.versionGrid.showNamedVersionsOnly = checked;
                            }
                        }
                    }
                }
            },

            listeners: {
                // Handle restore version
                restore: async ({ version }) => {
                    const result = await MessageDialog.confirm({
                        title: 'Restore Version?',
                        message: 'Are you sure? You will lose unsaved changes.'
                    });
                    if (result === MessageDialog.yesButton) {
                        await gantt.features.versions.restoreVersion(version);
                    }
                },

                // Handle compare version
                compare: async ({ source, version }) => {
                    gantt.features.baselines.disabled = false;
                    await gantt.features.versions.compareVersion(version);
                    source.comparingVersionId = version.id;
                    gantt.refreshRows();
                },

                stopCompare: async ({ source }) => {
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

## 3. Version Operations

### 3.1 Save Version

```javascript
// Save current state as version
gantt.features.versions.saveVersion();

// Save with custom description
gantt.features.versions.saveVersion('Release 1.0');

// Stop current transaction before saving
gantt.features.versions.stopTransaction();
gantt.features.versions.saveVersion();
```

### 3.2 Restore Version

```javascript
// Get version content
const content = await gantt.features.versions.getVersionContent(version);

// Restore version
await gantt.features.versions.restoreVersion(version);

// Reset STM after restore
project.stm.resetQueue();
```

### 3.3 Compare Versions

```javascript
// Enable baselines for comparison
gantt.features.baselines.disabled = false;

// Compare with a version
await gantt.features.versions.compareVersion(version);

// Stop comparing
await gantt.features.versions.stopComparing();
gantt.features.baselines.disabled = true;
```

---

## 4. React Integration

```jsx
import { BryntumGantt, BryntumSplitter } from '@bryntum/gantt-react';
import { VersionGrid, Container, MessageDialog, StringHelper, DateHelper } from '@bryntum/gantt';
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// Register custom VersionGrid
class MyVersionGrid extends VersionGrid {
    static type = 'myversiongrid';
    static configurable = {
        columns: [
            {
                type: 'tree',
                text: 'Description',
                field: 'description',
                flex: 2,
                autoHeight: true
            },
            {
                text: 'Date',
                field: 'occurredAt',
                type: 'date',
                format: 'M/D/YY h:mm a',
                flex: 1
            }
        ]
    };
}
MyVersionGrid.initClass();

function GanttWithVersions({ projectData }) {
    const ganttRef = useRef(null);
    const [versions, setVersions] = useState([]);
    const [comparing, setComparing] = useState(false);

    const saveVersion = useCallback(async () => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.features.versions.stopTransaction();
            await gantt.features.versions.saveVersion();
        }
    }, []);

    const restoreVersion = useCallback(async (version) => {
        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        const result = await MessageDialog.confirm({
            title: 'Restore Version?',
            message: 'Are you sure? You will lose unsaved changes.'
        });

        if (result === MessageDialog.yesButton) {
            await gantt.features.versions.restoreVersion(version);
            gantt.project.stm.resetQueue();
        }
    }, []);

    const compareVersion = useCallback(async (version) => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.features.baselines.disabled = false;
            await gantt.features.versions.compareVersion(version);
            setComparing(true);
        }
    }, []);

    const stopComparing = useCallback(async () => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            await gantt.features.versions.stopComparing();
            gantt.features.baselines.disabled = true;
            setComparing(false);
        }
    }, []);

    const ganttConfig = useMemo(() => ({
        enableUndoRedoKeys: true,

        features: {
            versions: true,
            baselines: { disabled: true }
        },

        columns: [
            { type: 'wbs' },
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'duration' }
        ],

        listeners: {
            taskDrop({ taskRecords }) {
                this.features.versions.transactionDescription =
                    `Moved ${taskRecords.length} task(s)`;
            }
        }
    }), []);

    return (
        <div className="gantt-versions-wrapper">
            <BryntumGantt
                ref={ganttRef}
                project={projectData}
                {...ganttConfig}
            />

            <div className="version-panel">
                <div className="version-toolbar">
                    <button onClick={saveVersion}>Save Version</button>
                    {comparing && (
                        <button onClick={stopComparing}>Stop Comparing</button>
                    )}
                </div>

                <div className="version-list">
                    {/* Version list would be rendered here */}
                </div>
            </div>
        </div>
    );
}
```

---

## 5. Styling

```css
/* Version Grid */
.b-versiongrid {
    border-left: 1px solid #e0e0e0;
}

/* User avatar */
.user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 8px;
    vertical-align: middle;
}

/* Version row */
.b-versiongrid .b-tree-cell {
    display: flex;
    align-items: center;
}

/* Transaction row (indented) */
.b-versiongrid .b-tree-cell .b-tree-cell-inner {
    display: flex;
    align-items: center;
}

/* Toolbar */
.b-versiongrid .b-toolbar {
    background: #f5f5f5;
    padding: 8px;
}

/* Save button */
.b-versiongrid .b-button {
    margin-right: 8px;
}

/* Compare indicator */
.b-versiongrid .comparing {
    background: #e3f2fd;
}

/* Version description */
.b-versiongrid .b-version-description {
    font-weight: 500;
}

/* Transaction description */
.b-versiongrid .b-transaction-description {
    color: #666;
    font-size: 13px;
}

/* Date column */
.b-versiongrid .b-date-cell {
    color: #888;
    font-size: 12px;
}

/* Empty state */
.b-versiongrid .b-empty-text {
    color: #888;
    text-align: center;
    padding: 40px;
}

/* Context menu */
.b-versiongrid .b-menu-item .fa-copy {
    color: #1976d2;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Versions niet opgeslagen | STM niet enabled | Enable STM met stm.enable() |
| Transaction descriptions missen | Niet ingesteld | Set transactionDescription in listeners |
| Compare werkt niet | Baselines disabled | Enable baselines feature |
| Custom models niet geladen | Niet geregistreerd | Check class registration |

---

## API Reference

### Versions Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `versionModelClass` | Class | Custom version model |
| `transactionModelClass` | Class | Custom transaction model |

### Versions Feature Methods

| Method | Description |
|--------|-------------|
| `saveVersion(description)` | Save current state |
| `restoreVersion(version)` | Restore a version |
| `compareVersion(version)` | Compare with version |
| `stopComparing()` | Stop comparison |
| `getVersionContent(version)` | Get version data |
| `stopTransaction()` | Stop current transaction |

### Versions Feature Properties

| Property | Type | Description |
|----------|------|-------------|
| `transactionDescription` | String | Description for current transaction |

### VersionGrid Config

| Property | Type | Description |
|----------|------|-------------|
| `project` | ProjectModel | Project to track |
| `showUnattachedTransactions` | Boolean | Show unsaved changes |
| `showNamedVersionsOnly` | Boolean | Filter named versions |

---

## Bronnen

- **Example**: `examples/versions/`
- **Versions Feature**: `Gantt.feature.Versions`
- **VersionGrid**: `Gantt.widget.VersionGrid`

---

*Priority 2: Medium Priority Features*
