# Gantt Implementation: WBS Column

> **Work Breakdown Structure (WBS)** kolom voor hiërarchische taak nummering.

---

## Overzicht

Bryntum Gantt's WBS column toont automatisch gegenereerde WBS codes.

```
+--------------------------------------------------------------------------+
| GANTT         [x] Auto update WBS    [x] Use ordered tree for WBS        |
+--------------------------------------------------------------------------+
|                                                                          |
|  WBS    |  Name                    | Start    | Duration                 |
+--------------------------------------------------------------------------+
|  1      |  Project Setup           | Jan 15   | 20 days                  |
|  1.1    |    Planning              | Jan 15   | 5 days                   |
|  1.2    |    Design                | Jan 20   | 5 days                   |
|  1.2.1  |      UI Design           | Jan 20   | 3 days                   |
|  1.2.2  |      Database Design     | Jan 23   | 2 days                   |
|  2      |  Development             | Jan 25   | 30 days                  |
|  2.1    |    Frontend              | Jan 25   | 15 days                  |
|  2.2    |    Backend               | Feb 09   | 15 days                  |
|  3      |  Testing                 | Feb 24   | 10 days                  |
|  3.1    |    Unit Tests            | Feb 24   | 5 days                   |
|  3.2    |    Integration Tests     | Mar 01   | 5 days                   |
|                                                                          |
|  WBS MODES:                                                              |
|    manual: WBS only updates on explicit call                             |
|    auto: WBS updates automatically on add/remove/sort                    |
+--------------------------------------------------------------------------+
```

---

## 1. Basic WBS Setup

### 1.1 Add WBS Column

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    autoLoad: true,
    loadUrl: '../_datasets/launch-saas.json'
});

new Gantt({
    appendTo: 'container',
    dependencyIdField: 'sequenceNumber',

    project,

    columns: [
        { type: 'wbs' },  // Add WBS column
        { type: 'name', width: 320 }
    ],

    features: {
        taskMenu: {
            items: {
                add: {
                    menu: {
                        subtask: {
                            // New subtasks will be last child
                            at: 'end'
                        }
                    }
                }
            }
        }
    }
});
```

---

## 2. WBS Modes

### 2.1 Manual vs Auto Mode

```javascript
tbar: [
    {
        type: 'slidetoggle',
        label: 'Auto update WBS',
        checked: false,
        tooltip: 'Automatically update WBS values when adding or removing tasks, or when the tree is sorted',
        onAction({ checked }) {
            project.taskStore.wbsMode = checked ? 'auto' : 'manual';
        }
    },
    {
        type: 'slidetoggle',
        label: 'Use ordered tree to calculate WBS',
        checked: true,
        tooltip: 'When checked, the project tree maintains its original order. Sorting is only done for display',
        onAction({ checked }) {
            project.taskStore.useOrderedTreeForWbs = checked;
        }
    }
]
```

---

## 3. WBS Configuration

### 3.1 TaskStore WBS Settings

```javascript
project: {
    taskStore: {
        // WBS update mode: 'manual' or 'auto'
        wbsMode: 'manual',

        // Use ordered tree for WBS calculation
        useOrderedTreeForWbs: true
    }
}
```

### 3.2 Programmatic WBS Control

```javascript
// Get task's WBS code
const task = gantt.taskStore.getById(1);
console.log('WBS:', task.wbsCode);  // e.g., "1.2.1"

// Manual WBS refresh
gantt.taskStore.updateWbsValues();

// Change WBS mode
gantt.project.taskStore.wbsMode = 'auto';

// Toggle ordered tree
gantt.project.taskStore.useOrderedTreeForWbs = false;
```

---

## 4. WBS Column Configuration

### 4.1 Column Options

```javascript
columns: [
    {
        type: 'wbs',
        text: 'WBS',
        width: 100,

        // Custom WBS formatting
        renderer({ record }) {
            return record.wbsCode;
        }
    }
]
```

### 4.2 Custom WBS Format

```javascript
// Custom WBS display
{
    type: 'wbs',
    renderer({ record }) {
        // Add prefix to WBS
        return `PRJ-${record.wbsCode}`;
    }
}

// With level indication
{
    text: 'WBS',
    field: 'wbsCode',
    renderer({ record }) {
        const level = record.childLevel;
        const indent = '  '.repeat(level);
        return `${indent}${record.wbsCode}`;
    }
}
```

---

## 5. Task Menu with WBS

### 5.1 Add Subtask Configuration

```javascript
features: {
    taskMenu: {
        items: {
            add: {
                menu: {
                    // Add subtask at end of children
                    subtask: {
                        at: 'end'
                    },
                    // Add sibling above
                    taskAbove: {
                        text: 'Task above'
                    },
                    // Add sibling below
                    taskBelow: {
                        text: 'Task below'
                    }
                }
            }
        }
    }
}
```

---

## 6. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useRef, useCallback } from 'react';

function GanttWithWBS({ projectData }) {
    const ganttRef = useRef(null);
    const [autoUpdate, setAutoUpdate] = useState(false);
    const [orderedTree, setOrderedTree] = useState(true);

    const toggleAutoUpdate = useCallback((checked) => {
        setAutoUpdate(checked);
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.project.taskStore.wbsMode = checked ? 'auto' : 'manual';
        }
    }, []);

    const toggleOrderedTree = useCallback((checked) => {
        setOrderedTree(checked);
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.project.taskStore.useOrderedTreeForWbs = checked;
        }
    }, []);

    const refreshWBS = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.project.taskStore.updateWbsValues();
        }
    }, []);

    const ganttConfig = {
        columns: [
            { type: 'wbs', width: 80 },
            { type: 'name', width: 280 },
            { type: 'startdate' },
            { type: 'duration' },
            { type: 'predecessor', width: 120 },
            { type: 'successor', width: 120 }
        ],

        features: {
            taskMenu: {
                items: {
                    add: {
                        menu: {
                            subtask: { at: 'end' }
                        }
                    }
                }
            }
        }
    };

    return (
        <div className="gantt-wbs-wrapper">
            <div className="toolbar">
                <label>
                    <input
                        type="checkbox"
                        checked={autoUpdate}
                        onChange={(e) => toggleAutoUpdate(e.target.checked)}
                    />
                    Auto update WBS
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={orderedTree}
                        onChange={(e) => toggleOrderedTree(e.target.checked)}
                    />
                    Use ordered tree
                </label>
                <button onClick={refreshWBS} disabled={autoUpdate}>
                    Refresh WBS
                </button>
            </div>

            <BryntumGantt
                ref={ganttRef}
                project={projectData}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 7. Styling

```css
/* WBS column */
.b-wbs-column {
    font-family: 'Consolas', monospace;
    font-weight: 500;
}

/* WBS by level */
.b-tree-parent-row .b-wbs-column {
    font-weight: bold;
}

/* Level 1 WBS */
.b-tree-parent-row[data-depth="0"] .b-wbs-column {
    color: #1976d2;
    font-size: 14px;
}

/* Level 2 WBS */
.b-tree-parent-row[data-depth="1"] .b-wbs-column {
    color: #388E3C;
}

/* Level 3+ WBS */
.b-tree-parent-row[data-depth="2"] .b-wbs-column,
.b-tree-parent-row[data-depth="3"] .b-wbs-column {
    color: #666;
}

/* Leaf task WBS */
.b-grid-row:not(.b-tree-parent-row) .b-wbs-column {
    color: #999;
    font-size: 12px;
}

/* Custom WBS with prefix */
.wbs-custom {
    display: flex;
    align-items: center;
    gap: 4px;
}

.wbs-prefix {
    color: #1976d2;
    font-weight: bold;
}

.wbs-code {
    color: #666;
}

/* Toolbar styling */
.gantt-wbs-wrapper .toolbar {
    display: flex;
    gap: 16px;
    padding: 8px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.gantt-wbs-wrapper .toolbar label {
    display: flex;
    align-items: center;
    gap: 4px;
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| WBS niet zichtbaar | Column niet toegevoegd | Voeg { type: 'wbs' } toe |
| WBS update niet | wbsMode: 'manual' | Gebruik auto of call updateWbsValues() |
| Volgorde incorrect | useOrderedTreeForWbs: false | Zet useOrderedTreeForWbs: true |
| Lege WBS | Task niet in tree | Voeg task toe aan store |

---

## API Reference

### WBS Column Config

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | 'wbs' |
| `text` | String | Column header |
| `width` | Number | Column width |
| `renderer` | Function | Custom renderer |

### TaskStore WBS Config

| Property | Type | Description |
|----------|------|-------------|
| `wbsMode` | String | 'manual' or 'auto' |
| `useOrderedTreeForWbs` | Boolean | Use ordered tree |

### TaskStore WBS Methods

| Method | Description |
|--------|-------------|
| `updateWbsValues()` | Manual WBS refresh |

### Task WBS Properties

| Property | Type | Description |
|----------|------|-------------|
| `wbsCode` | String | WBS code (e.g., "1.2.1") |
| `childLevel` | Number | Nesting level (0-based) |

---

## Bronnen

- **Example**: `examples/wbs/`
- **WBSColumn**: `Gantt.column.WBSColumn`
- **TaskStore**: `Gantt.data.TaskStore`

---

*Priority 2: Medium Priority Features*
