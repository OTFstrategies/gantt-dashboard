# Gantt Implementation: MS Project Import/Export

> **Microsoft Project integratie** met MPP import via MPXJ, XML export, en complete data mapping.

---

## Overzicht

Bryntum Gantt ondersteunt import van Microsoft Project bestanden (.mpp, .mpx, .xml) en export naar MS Project XML formaat.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GANTT                     [Pick a project file] [Import data] [Export]  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────┐        ┌────────────────────┐                   │
│  │                    │        │    BRYNTUM         │                   │
│  │  Microsoft Project │ ─────> │    GANTT           │ ─────> MSP XML   │
│  │  .mpp / .mpx       │ Import │                    │ Export            │
│  │                    │        │  ┌──────────────┐  │                   │
│  └────────────────────┘        │  │ Tasks        │  │                   │
│                                │  │ Resources    │  │                   │
│        MPXJ Library            │  │ Dependencies │  │                   │
│        (Server-side)           │  │ Calendars    │  │                   │
│                                │  │ Assignments  │  │                   │
│                                │  └──────────────┘  │                   │
│                                └────────────────────┘                   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. MS Project Export

### 1.1 Basic Export Setup

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    transport: {
        load: { url: '/api/project' }
    }
});

const gantt = new Gantt({
    appendTo: 'container',
    project,

    features: {
        mspExport: true  // Enable MS Project export
    },

    columns: [
        { type: 'wbs' },
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'duration' },
        { type: 'effort' },
        { type: 'resourceassignment' },
        { type: 'percentdone', width: 70 },
        { type: 'predecessor' },
        { type: 'successor' },
        { type: 'schedulingmodecolumn' },
        { type: 'calendar' },
        { type: 'constrainttype' },
        { type: 'constraintdate' }
    ],

    tbar: [
        {
            type: 'button',
            text: 'Export to MSP',
            icon: 'fa-file-export',
            onAction() {
                // Filename based on project name
                const filename = gantt.project.taskStore.first
                    ? `${gantt.project.taskStore.first.name}.xml`
                    : 'project.xml';

                gantt.features.mspExport.export({ filename });
            }
        }
    ]
});

project.load();
```

### 1.2 Export Configuration Options

```javascript
features: {
    mspExport: {
        // Include all task fields
        includeAllFields: true,

        // Custom filename generator
        filename: (project) => `export_${Date.now()}.xml`
    }
}

// Programmatic export
gantt.features.mspExport.export({
    filename: 'my-project.xml',
    // Additional options
});
```

---

## 2. MS Project Import

### 2.1 Server-Side Component (MPXJ)

MS Project import vereist server-side processing met de MPXJ library. Dit is een Java/PHP library die .mpp bestanden kan parsen.

```javascript
// PHP loader script endpoint
const projectLoaderScript = 'php/load.php';

const gantt = new Gantt({
    appendTo: 'container',
    emptyText: 'Drop a project file here to import it',
    startDate: '2024-01-08',
    endDate: '2024-04-01',

    features: {
        baselines: true,
        fileDrop: true  // Enable drag & drop import
    },

    tbar: [
        {
            type: 'filepicker',
            ref: 'input',
            buttonConfig: {
                text: 'Pick a project file',
                icon: 'fa-folder-open'
            },
            fileFieldConfig: {
                // Restrict to specific file types
                accept: '.mpp,.mpx,.xml'
            },
            listeners: {
                change: ({ files }) => {
                    sendBtn.disabled = files.length === 0;
                },
                clear: () => {
                    sendBtn.disable();
                }
            }
        },
        {
            type: 'button',
            ref: 'sendBtn',
            text: 'Import data',
            cls: 'b-load-button b-blue',
            icon: 'fa-file-import',
            disabled: true,
            onClick: 'up.onImportButtonClick'
        },
        {
            type: 'button',
            href: 'sampleproject.mpp',
            target: '_blank',
            text: 'Download sample MPP',
            icon: 'fa-file-download'
        }
    ],

    onFileDrop({ file }) {
        this.importFile(file);
    },

    onImportButtonClick() {
        const { files } = this.widgetMap.input;
        if (files) {
            this.importFile(files[0]);
        }
    },

    async importFile(file) {
        const formData = new FormData();
        formData.append('mpp-file', file);

        this.maskBody('Importing project ...');

        try {
            const { parsedJson } = await AjaxHelper.post(
                projectLoaderScript,
                formData,
                { parseJson: true }
            );

            if (parsedJson.success && parsedJson.data) {
                const { project } = this;

                // Import data
                await importer.importData(parsedJson.data);

                // Destroy old project
                project.destroy();

                // Update view
                this.setStartDate(this.project.startDate);
                await this.scrollToDate(this.project.startDate, { block: 'start' });

                this.widgetMap.input.clear();
                this.unmaskBody();

                Toast.show('File imported successfully!');
            }
            else {
                onError(`Import error: ${parsedJson.msg}`);
            }
        }
        catch (error) {
            onError(`Import error: ${error.error?.message || 'Import failed'}`);
        }
    }
});
```

### 2.2 Importer Class

```javascript
import { ArrayHelper } from '@bryntum/gantt';

class Importer {
    constructor(config) {
        this.gantt = config.gantt;
        this.defaultColumns = config.defaultColumns;

        // Bind processing functions
        this.processAssignment = this.processAssignment.bind(this);
        this.processResource = this.processResource.bind(this);
        this.processDependency = this.processDependency.bind(this);
        this.processTask = this.processTask.bind(this);
        this.processCalendar = this.processCalendar.bind(this);
        this.processColumn = this.processColumn.bind(this);
    }

    async importData(data) {
        const project = new this.gantt.projectModelClass({
            autoSetConstraints: true,
            silenceInitialCommit: false,
            // Preserve dates for started tasks
            startedTaskScheduling: 'Manual',
            skipNonWorkingTimeInDurationWhenSchedulingManually: true
        });

        this.project = project;
        this.calendarManager = project.calendarManagerStore;
        this.taskStore = project.taskStore;
        this.assignmentStore = project.assignmentStore;
        this.resourceStore = project.resourceStore;
        this.dependencyStore = project.dependencyStore;

        // ID mappings: MSProject ID => Gantt record
        this.calendarMap = {};
        this.resourceMap = {};
        this.taskMap = {};

        // Import in correct order
        this.importCalendars(data.calendars);

        this.taskStore.rootNode.appendChild(
            ArrayHelper.asArray(data.tasks).map(this.processTask)[0]?.children
        );

        this.importResources(data.resources);
        this.importAssignments(data.assignments);
        this.importDependencies(data.dependencies);
        this.importProject(data.project);

        // Assign project before commit
        this.gantt.project = project;

        await project.commitAsync();

        this.importColumns(data.columns);

        return project;
    }

    // Resource processing
    importResources(resources) {
        this.resourceStore.add(resources.map(this.processResource));
    }

    processResource(resourceData) {
        const { id } = resourceData;
        delete resourceData.id;

        resourceData.calendar = this.calendarMap[resourceData.calendar];

        const resource = new this.resourceStore.modelClass(resourceData);
        this.resourceMap[id] = resource;

        return resource;
    }

    // Dependency processing
    importDependencies(dependencies) {
        this.dependencyStore.add(dependencies.map(this.processDependency));
    }

    processDependency(dependencyData) {
        const { fromEvent, toEvent } = dependencyData;
        delete dependencyData.id;

        const dep = new this.dependencyStore.modelClass(dependencyData);
        dep.fromEvent = this.taskMap[fromEvent].id;
        dep.toEvent = this.taskMap[toEvent].id;

        return dep;
    }

    // Assignment processing
    importAssignments(assignments) {
        this.assignmentStore.add(assignments.map(this.processAssignment));
    }

    processAssignment(assignmentData) {
        delete assignmentData.id;

        return new this.assignmentStore.modelClass({
            units: assignmentData.units,
            event: this.taskMap[assignmentData.event],
            resource: this.resourceMap[assignmentData.resource]
        });
    }

    // Task processing (recursive for children)
    processTask(taskData) {
        const { id, children } = taskData;

        delete taskData.children;
        delete taskData.id;
        delete taskData.milestone;

        taskData.calendar = this.calendarMap[taskData.calendar];

        const task = new this.taskStore.modelClass(taskData);

        if (children) {
            task.appendChild(children.map(this.processTask));
        }

        task._importedId = id;
        this.taskMap[id] = task;

        return task;
    }

    // Calendar processing
    processCalendarChildren(children) {
        return children.map(this.processCalendar);
    }

    processCalendar(data) {
        const { id, children, intervals } = data;

        delete data.children;
        delete data.id;

        const calendar = new this.calendarManager.modelClass({
            ...data,
            intervals
        });

        if (children) {
            calendar.appendChild(this.processCalendarChildren(children));
        }

        calendar._importedId = id;
        this.calendarMap[id] = calendar;

        return calendar;
    }

    importCalendars(calendars) {
        this.calendarManager.add(
            this.processCalendarChildren(calendars.children)
        );
    }

    // Column processing
    importColumns(columns) {
        columns = columns.flatMap(this.processColumn);

        // Use default columns if none imported
        columns = columns.length ? columns : this.defaultColumns || [];

        if (columns.length) {
            const columnStore = this.gantt.subGrids.locked.columns;
            columnStore.removeAll(true);
            columnStore.add(columns);
        }
    }

    processColumn(data) {
        const columnClass = this.gantt.columns.constructor.getColumnClass(data.type);

        // Ignore unknown column types
        if (columnClass) {
            return { region: 'locked', ...data };
        }

        return [];
    }

    importProject(project) {
        if ('calendar' in project) {
            project.calendar = this.calendarMap[project.calendar];
        }
        Object.assign(this.project, project);
    }
}

// Usage
const importer = new Importer({
    gantt,
    defaultColumns: [
        { type: 'name', field: 'name', width: 250 },
        { type: 'addnew' }
    ]
});
```

---

## 3. Server-Side Setup (PHP Example)

### 3.1 PHP Load Script

```php
<?php
// php/load.php

require_once 'vendor/autoload.php'; // MPXJ via Composer

use MPXJ\MPXJ;

header('Content-Type: application/json');

try {
    if (!isset($_FILES['mpp-file'])) {
        throw new Exception('No file uploaded');
    }

    $file = $_FILES['mpp-file'];
    $tempPath = $file['tmp_name'];

    // Parse using MPXJ
    $project = MPXJ::read($tempPath);

    // Extract data
    $data = [
        'project' => extractProjectData($project),
        'calendars' => extractCalendars($project),
        'tasks' => extractTasks($project),
        'resources' => extractResources($project),
        'assignments' => extractAssignments($project),
        'dependencies' => extractDependencies($project),
        'columns' => extractColumns($project)
    ];

    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
}
catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'msg' => $e->getMessage()
    ]);
}

function extractProjectData($project) {
    return [
        'startDate' => $project->getStartDate()->format('Y-m-d'),
        'calendar' => $project->getCalendar()->getUniqueID()
    ];
}

function extractTasks($project) {
    $tasks = [];
    foreach ($project->getTasks() as $task) {
        $tasks[] = [
            'id' => $task->getUniqueID(),
            'name' => $task->getName(),
            'startDate' => $task->getStart()->format('Y-m-d'),
            'endDate' => $task->getFinish()->format('Y-m-d'),
            'duration' => $task->getDuration()->getDuration(),
            'percentDone' => $task->getPercentComplete(),
            'calendar' => $task->getCalendar()?->getUniqueID(),
            'children' => [] // Populate recursively
        ];
    }
    return $tasks;
}

// ... similar functions for other entities
```

---

## 4. Data Mapping

### 4.1 MS Project to Bryntum Field Mapping

| MS Project Field | Bryntum Field | Notes |
|------------------|---------------|-------|
| Task.UniqueID | Task.id | Auto-mapped |
| Task.Name | Task.name | Direct |
| Task.Start | Task.startDate | Date conversion |
| Task.Finish | Task.endDate | Date conversion |
| Task.Duration | Task.duration | Unit conversion |
| Task.PercentComplete | Task.percentDone | 0-100 |
| Task.Milestone | Task.milestone | Boolean |
| Task.Calendar | Task.calendar | Reference mapping |
| Task.Children | Task.children | Recursive |

### 4.2 Dependency Type Mapping

| MS Project Type | Bryntum Type |
|-----------------|--------------|
| FS | 0 (Finish-to-Start) |
| SS | 1 (Start-to-Start) |
| FF | 2 (Finish-to-Finish) |
| SF | 3 (Start-to-Finish) |

---

## 5. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useRef, useCallback } from 'react';
import { AjaxHelper, Toast } from '@bryntum/gantt';

function MSProjectGantt() {
    const ganttRef = useRef(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    const handleExport = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            const filename = gantt.project.taskStore.first?.name || 'project';
            gantt.features.mspExport.export({
                filename: `${filename}.xml`
            });
        }
    }, []);

    const handleImport = useCallback(async (file) => {
        const gantt = ganttRef.current?.instance;
        if (!gantt || !file) return;

        setImporting(true);

        const formData = new FormData();
        formData.append('mpp-file', file);

        try {
            const response = await AjaxHelper.post(
                '/api/import-msp',
                formData,
                { parseJson: true }
            );

            if (response.parsedJson.success) {
                // Create new project from imported data
                await importer.importData(response.parsedJson.data);
                Toast.show('Import successful!');
            }
            else {
                Toast.show({
                    html: `Import failed: ${response.parsedJson.msg}`,
                    color: 'b-red'
                });
            }
        }
        catch (error) {
            Toast.show({
                html: `Import error: ${error.message}`,
                color: 'b-red'
            });
        }
        finally {
            setImporting(false);
        }
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImport(file);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleImport(file);
        }
    };

    const ganttConfig = {
        features: {
            mspExport: true,
            fileDrop: true,
            baselines: true
        },

        columns: [
            { type: 'wbs' },
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'duration' },
            { type: 'percentdone' },
            { type: 'predecessor' },
            { type: 'successor' }
        ],

        listeners: {
            fileDrop: ({ file }) => handleImport(file)
        }
    };

    return (
        <div
            className="msp-gantt-wrapper"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <div className="toolbar">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mpp,.mpx,.xml"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                >
                    {importing ? 'Importing...' : 'Import MPP'}
                </button>
                <button onClick={handleExport}>
                    Export to XML
                </button>
            </div>

            <BryntumGantt
                ref={ganttRef}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 6. Styling

```css
/* Import/Export toolbar */
.msp-toolbar {
    display: flex;
    gap: 8px;
    padding: 8px;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
}

.msp-toolbar button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}

.msp-toolbar button.import {
    background: #4CAF50;
    color: white;
}

.msp-toolbar button.export {
    background: #2196F3;
    color: white;
}

.msp-toolbar button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Drop zone styling */
.b-gantt.b-dragover {
    outline: 3px dashed #4CAF50;
    outline-offset: -3px;
}

/* Import mask */
.b-mask.importing {
    background: rgba(0, 0, 0, 0.5);
}

.b-mask.importing .b-mask-text {
    color: white;
    font-size: 18px;
}

/* File picker button */
.b-filepicker .b-button {
    background: #4CAF50;
    color: white;
}

/* Empty state */
.b-gantt[data-empty="true"]::after {
    content: 'Drop a project file here to import';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    color: #999;
}
```

---

## 7. Error Handling

```javascript
function onError(text) {
    gantt.unmaskBody();
    console.error(text);

    Toast.show({
        html: text,
        color: 'b-red',
        style: 'color:white',
        timeout: 3000
    });
}

// Common error scenarios
const errorHandlers = {
    fileNotFound: 'The uploaded file could not be found.',
    invalidFormat: 'The file format is not supported. Please use .mpp, .mpx, or .xml.',
    parseError: 'Failed to parse the project file. It may be corrupted.',
    serverError: 'Server error occurred during import. Please try again.',
    networkError: 'Network error. Please check your connection.'
};
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Import fails | MPXJ niet geïnstalleerd | Installeer MPXJ library server-side |
| Dates verkeerd | Timezone mismatch | Check date format conversie |
| Calendars niet gekoppeld | ID mapping fout | Controleer calendarMap |
| Resources missen | Assignment data incompleet | Check resource/assignment import |
| Export leeg | Feature niet enabled | Zet mspExport: true |
| Dependencies fout | Task ID mapping | Check taskMap correctheid |

---

## API Reference

### MspExport Feature

| Method | Description |
|--------|-------------|
| `export(config)` | Export project to XML |

| Config | Type | Description |
|--------|------|-------------|
| `filename` | String | Output filename |
| `includeAllFields` | Boolean | Include all fields |

### Importer Class

| Method | Description |
|--------|-------------|
| `importData(data)` | Import parsed MSP data |

| Property | Description |
|----------|-------------|
| `calendarMap` | MSP calendar ID to Gantt record |
| `resourceMap` | MSP resource ID to Gantt record |
| `taskMap` | MSP task ID to Gantt record |

### FileDrop Feature

| Event | Description |
|-------|-------------|
| `fileDrop` | Fired when file is dropped |

---

## Bronnen

- **Import Example**: `examples/msprojectimport/`
- **Export Example**: `examples/msprojectexport/`
- **MPXJ Library**: [https://github.com/joniles/mpxj](https://github.com/joniles/mpxj) (LGPL License)
- **MspExport Feature**: `Gantt.feature.export.MspExport`
- **FileDrop Feature**: `Gantt.feature.FileDrop`

---

*Priority 1: Missing Core Functionality*
