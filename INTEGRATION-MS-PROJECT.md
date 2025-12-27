# Integration Guide: Bryntum Gantt + Microsoft Project

> **Implementatie guide** voor MS Project import/export met Bryntum Gantt: MPP file parsing via MPXJ, XML export, en data mapping.

---

## Overzicht

De MS Project integratie maakt het mogelijk om:
- **Import** - Lees MPP/MPX/XML bestanden via MPXJ library
- **Export** - Genereer MS Project XML vanuit Gantt data
- **Data Mapping** - Converteer tussen Bryntum en MSP formaten
- **Calendar Sync** - Importeer werkdagen en uitzonderingen

---

## 1. Export Feature

### 1.1 Basic Export Setup

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    transport: {
        load: { url: 'data/project.json' }
    }
});

const gantt = new Gantt({
    appendTo: 'container',
    project,

    features: {
        mspExport: true  // Enable MS Project export
    },

    dependencyIdField: 'sequenceNumber',

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
    ]
});

project.load();
```

### 1.2 Export Button

```javascript
tbar: [
    {
        type: 'button',
        text: 'Export to MSP',
        ref: 'mspExportBtn',
        icon: 'fa-file-export',
        onAction() {
            // Bestandsnaam op basis van project naam
            const filename = gantt.project.taskStore.first &&
                `${gantt.project.taskStore.first.name}.xml`;

            // Trigger download
            gantt.features.mspExport.export({
                filename
            });
        }
    }
]
```

---

## 2. Import Setup

### 2.1 Server-Side MPXJ Integration

```javascript
const gantt = new Gantt({
    appendTo: 'container',
    emptyText: 'Drop a project file here to import it',
    startDate: '2019-01-08',
    endDate: '2019-04-01',

    features: {
        baselines: true,
        fileDrop: true  // Enable drag & drop import
    },

    dependencyIdField: 'sequenceNumber',

    columns: [
        { type: 'name', field: 'name', text: 'Name', width: 250 },
        { type: 'startdate' },
        { type: 'duration' },
        { type: 'addnew' }
    ]
});
```

### 2.2 File Picker Toolbar

```javascript
tbar: [
    {
        type: 'filepicker',
        ref: 'input',
        buttonConfig: {
            text: 'Pick a project file',
            icon: 'fa-folder-open'
        },
        fileFieldConfig: {
            // Beperk tot MPP files
            // accept: '.mpp'
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
        text: 'Download a sample MPP file',
        icon: 'fa-file-download'
    }
]
```

---

## 3. Importer Class

### 3.1 Core Structure

```javascript
class Importer {
    constructor(config) {
        const me = this;

        me.gantt = config.gantt;
        me.defaultColumns = config.defaultColumns;

        // Bind methods voor map/flatMap calls
        me.processAssignment = me.processAssignment.bind(me);
        me.processResource = me.processResource.bind(me);
        me.processDependency = me.processDependency.bind(me);
        me.processTask = me.processTask.bind(me);
        me.processCalendar = me.processCalendar.bind(me);
        me.processColumn = me.processColumn.bind(me);
    }

    async importData(data) {
        const me = this;

        // Maak nieuw project
        const project = new me.gantt.projectModelClass({
            autoSetConstraints: true,
            silenceInitialCommit: false,
            // Handhaaf datums voor gestarte taken
            startedTaskScheduling: 'Manual',
            skipNonWorkingTimeInDurationWhenSchedulingManually: true
        });

        me.project = project;
        me.calendarManager = project.calendarManagerStore;
        me.taskStore = project.taskStore;
        me.assignmentStore = project.assignmentStore;
        me.resourceStore = project.resourceStore;
        me.dependencyStore = project.dependencyStore;

        // ID mappings: MSProject ID => Bryntum ID
        me.calendarMap = {};
        me.resourceMap = {};
        me.taskMap = {};

        // Import in volgorde van dependencies
        me.importCalendars(data.calendars);

        me.taskStore.rootNode.appendChild(
            ArrayHelper.asArray(data.tasks).map(me.processTask)[0]?.children
        );

        me.importResources(data.resources);
        me.importAssignments(data.assignments);
        me.importDependencies(data.dependencies);
        me.importProject(data.project);

        // Assign project before commit
        me.gantt.project = project;

        await project.commitAsync();

        me.importColumns(data.columns);

        return project;
    }
}
```

### 3.2 Calendar Import

```javascript
processCalendarChildren(children) {
    return children.map(this.processCalendar);
}

processCalendar(data) {
    const
        me = this,
        { id, children } = data,
        intervals = data.intervals;

    delete data.children;
    delete data.id;

    const calendar = new me.calendarManager.modelClass(
        Object.assign(data, { intervals })
    );

    if (children) {
        calendar.appendChild(me.processCalendarChildren(children));
    }

    calendar._importedId = id;
    me.calendarMap[id] = calendar;

    return calendar;
}

importCalendars(calendars) {
    this.calendarManager.add(
        this.processCalendarChildren(calendars.children)
    );
}
```

### 3.3 Task Import

```javascript
processTask(taskData) {
    const
        me = this,
        { id, children } = taskData;

    // Verwijder MSP-specifieke velden
    delete taskData.children;
    delete taskData.id;
    delete taskData.milestone;

    // Map calendar reference
    taskData.calendar = me.calendarMap[taskData.calendar];

    const task = new me.taskStore.modelClass(taskData);

    // Recursief children importeren
    if (children) {
        task.appendChild(children.map(me.processTask));
    }

    // Bewaar MSP ID voor dependency mapping
    task._importedId = id;
    me.taskMap[id] = task;

    return task;
}
```

### 3.4 Resource Import

```javascript
importResources(resources) {
    this.resourceStore.add(resources.map(this.processResource));
}

processResource(resourceData) {
    const { id } = resourceData;

    delete resourceData.id;

    // Map calendar reference
    resourceData.calendar = this.calendarMap[resourceData.calendar];

    const resource = new this.resourceStore.modelClass(resourceData);

    this.resourceMap[id] = resource;

    return resource;
}
```

### 3.5 Assignment Import

```javascript
importAssignments(assignments) {
    this.assignmentStore.add(assignments.map(this.processAssignment));
}

processAssignment(assignmentData) {
    const me = this;

    delete assignmentData.id;

    return new me.assignmentStore.modelClass({
        units: assignmentData.units,
        event: me.taskMap[assignmentData.event],
        resource: me.resourceMap[assignmentData.resource]
    });
}
```

### 3.6 Dependency Import

```javascript
importDependencies(dependencies) {
    this.dependencyStore.add(dependencies.map(this.processDependency));
}

processDependency(dependencyData) {
    const
        me = this,
        { fromEvent, toEvent } = dependencyData;

    delete dependencyData.id;

    const dependency = new me.dependencyStore.modelClass(dependencyData);

    // Map MSP task IDs naar Bryntum IDs
    dependency.fromEvent = me.taskMap[fromEvent].id;
    dependency.toEvent = me.taskMap[toEvent].id;

    return dependency;
}
```

### 3.7 Column Import

```javascript
importColumns(columns) {
    columns = columns.flatMap(this.processColumn);

    // Fallback naar default columns
    columns = columns.length ? columns : this.defaultColumns || [];

    if (columns.length) {
        const columnStore = this.gantt.subGrids.locked.columns;

        columnStore.removeAll(true);
        columnStore.add(columns);
    }
}

processColumn(data) {
    const columnClass = this.gantt.columns.constructor.getColumnClass(data.type);

    // Skip unknown column types
    if (columnClass) {
        return Object.assign({ region: 'locked' }, data);
    }

    return [];
}
```

---

## 4. File Import Handler

### 4.1 Drag & Drop Import

```javascript
onFileDrop({ file }) {
    this.importFile(file);
}
```

### 4.2 Button Import

```javascript
onImportButtonClick() {
    const { files } = input;

    if (files) {
        this.importFile(files[0]);
    }
}
```

### 4.3 Import Process

```javascript
async importFile(file) {
    const formData = new FormData();

    formData.append('mpp-file', file);

    gantt.maskBody('Importing project ...');

    try {
        const { parsedJson } = await AjaxHelper.post(
            'php/load.php',  // MPXJ endpoint
            formData,
            { parseJson: true }
        );

        if (parsedJson.success && parsedJson.data) {
            const { project } = gantt;

            // Import data (creates new project)
            await importer.importData(parsedJson.data);

            // Destroy old project
            project.destroy();

            // Scroll naar project start
            gantt.setStartDate(gantt.project.startDate);
            await gantt.scrollToDate(gantt.project.startDate, {
                block: 'start'
            });

            input.clear();
            gantt.unmaskBody();

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
```

---

## 5. Server-Side MPXJ

### 5.1 PHP Example

```php
<?php
// load.php - MPXJ integration

require_once 'vendor/autoload.php';

use MPXJ\Reader\MPPReader;

header('Content-Type: application/json');

if ($_FILES['mpp-file']['error'] === UPLOAD_ERR_OK) {
    $tmpFile = $_FILES['mpp-file']['tmp_name'];

    try {
        $reader = new MPPReader();
        $project = $reader->read($tmpFile);

        // Convert to Bryntum format
        $data = [
            'calendars' => convertCalendars($project),
            'tasks' => convertTasks($project),
            'resources' => convertResources($project),
            'assignments' => convertAssignments($project),
            'dependencies' => convertDependencies($project),
            'columns' => getDefaultColumns(),
            'project' => [
                'startDate' => $project->getStartDate()->format('Y-m-d'),
                'calendar' => $project->getDefaultCalendar()->getUniqueID()
            ]
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
}
```

### 5.2 Java Example

```java
// MPXJ Java integration
import net.sf.mpxj.*;
import net.sf.mpxj.reader.*;

public class MPXJConverter {

    public String convertProject(File mppFile) throws Exception {
        ProjectReader reader = new MPPReader();
        ProjectFile project = reader.read(mppFile);

        JSONObject result = new JSONObject();

        result.put("calendars", convertCalendars(project));
        result.put("tasks", convertTasks(project));
        result.put("resources", convertResources(project));
        result.put("assignments", convertAssignments(project));
        result.put("dependencies", convertDependencies(project));

        return new JSONObject()
            .put("success", true)
            .put("data", result)
            .toString();
    }

    private JSONObject convertTasks(ProjectFile project) {
        JSONObject root = new JSONObject();
        JSONArray children = new JSONArray();

        for (Task task : project.getTasks()) {
            if (task.getParentTask() == null) {
                children.put(convertTask(task));
            }
        }

        root.put("children", children);
        return root;
    }

    private JSONObject convertTask(Task task) {
        JSONObject obj = new JSONObject();

        obj.put("id", task.getUniqueID());
        obj.put("name", task.getName());
        obj.put("startDate", formatDate(task.getStart()));
        obj.put("endDate", formatDate(task.getFinish()));
        obj.put("duration", task.getDuration().getDuration());
        obj.put("durationUnit", convertDurationUnit(task.getDuration()));
        obj.put("percentDone", task.getPercentageComplete());

        if (task.getChildTasks().size() > 0) {
            JSONArray children = new JSONArray();
            for (Task child : task.getChildTasks()) {
                children.put(convertTask(child));
            }
            obj.put("children", children);
        }

        return obj;
    }
}
```

---

## 6. Data Format Reference

### 6.1 Import JSON Structure

```json
{
    "success": true,
    "data": {
        "calendars": {
            "children": [
                {
                    "id": 1,
                    "name": "Standard",
                    "intervals": [
                        {
                            "recurrentStartDate": "on Mon at 0:00",
                            "recurrentEndDate": "on Mon at 8:00",
                            "isWorking": false
                        }
                    ]
                }
            ]
        },
        "tasks": [
            {
                "id": 1,
                "name": "Project Start",
                "startDate": "2024-01-15",
                "duration": 0,
                "children": [
                    {
                        "id": 2,
                        "name": "Phase 1",
                        "duration": 10,
                        "durationUnit": "d"
                    }
                ]
            }
        ],
        "resources": [
            {
                "id": 1,
                "name": "John Doe",
                "calendar": 1
            }
        ],
        "assignments": [
            {
                "event": 2,
                "resource": 1,
                "units": 100
            }
        ],
        "dependencies": [
            {
                "fromEvent": 1,
                "toEvent": 2,
                "type": 2,
                "lag": 0,
                "lagUnit": "d"
            }
        ],
        "project": {
            "startDate": "2024-01-15",
            "calendar": 1
        }
    }
}
```

---

## 7. Field Mapping

### 7.1 Task Fields

| MS Project | Bryntum Gantt | Notes |
|------------|---------------|-------|
| UID | id | Unique identifier |
| Name | name | Task name |
| Start | startDate | Start date |
| Finish | endDate | End date |
| Duration | duration | Duration value |
| DurationFormat | durationUnit | d/h/w/M |
| PercentComplete | percentDone | 0-100 |
| ConstraintType | constraintType | Constraint |
| ConstraintDate | constraintDate | Constraint date |
| CalendarUID | calendar | Calendar reference |
| WBS | wbsCode | WBS code |

### 7.2 Dependency Types

| MS Project Type | Bryntum Type |
|-----------------|--------------|
| FF (0) | 0 |
| FS (1) | 2 |
| SF (2) | 3 |
| SS (3) | 1 |

---

## 8. Error Handling

### 8.1 Error Display

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
```

---

## 9. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| File Size | Limit upload size voor grote projecten |
| Server | Gebruik async processing voor grote files |
| Calendars | Import altijd eerst (dependencies) |
| ID Mapping | Bewaar MSP→Bryntum mappings |
| Validation | Valideer data na import |
| Cleanup | Destroy oude project na succesvolle import |

---

## 10. MPXJ Library

### 10.1 Ondersteunde Formaten

| Format | Extension | Read | Write |
|--------|-----------|------|-------|
| MS Project | .mpp | ✓ | - |
| MS Project XML | .xml | ✓ | ✓ |
| MSPDI | .xml | ✓ | ✓ |
| Primavera P6 | .xer | ✓ | ✓ |
| Primavera XML | .xml | ✓ | ✓ |
| Planner | .planner | ✓ | - |

### 10.2 License

MPXJ is beschikbaar onder LGPL licentie. Zie [mpxj.org](https://www.mpxj.org) voor details.

---

## 11. Bryntum Java Project Reader

### 11.1 Architecture Overview

De Bryntum Project Reader is een complete Java applicatie voor het converteren van MS Project files naar Bryntum JSON formaat.

```
projectreader/
├── pom.xml                    # Maven build configuratie
└── src/main/java/bryntum/gantt/projectreader/
    ├── Main.java              # CLI entry point
    ├── JSONBuilder.java       # Interface voor builders
    ├── MainJSONBuilder.java   # Hoofdorchestrator
    ├── TasksJSONBuilder.java  # Task extractie
    ├── DependenciesJSONBuilder.java
    ├── ResourcesJSONBuilder.java
    ├── AssignmentsJSONBuilder.java
    ├── ColumnsJSONBuilder.java
    ├── ExtCalendarsJSONBuilder.java
    └── VanillaCalendarsJSONBuilder.java
```

### 11.2 Maven Dependencies

```xml
<dependencies>
    <!-- MPXJ v14.5.1 voor MS Project parsing -->
    <dependency>
        <groupId>net.sf.mpxj</groupId>
        <artifactId>mpxj</artifactId>
        <version>14.5.1</version>
    </dependency>
    <!-- JSON library voor output -->
    <dependency>
        <groupId>org.json</groupId>
        <artifactId>json</artifactId>
        <version>20250517</version>
    </dependency>
</dependencies>
```

### 11.3 CLI Usage

```bash
# Build the JAR
mvn package

# Run conversion
java -jar bryntum-project-reader.jar <mpp-file> <output-file> [indent] [dateFormat] [dateTimeFormat]

# Output to stdout
java -jar bryntum-project-reader.jar project.mpp 1

# With custom indent (default: 4)
java -jar bryntum-project-reader.jar project.mpp output.json 2
```

### 11.4 Main Entry Point

```java
public class Main {
    static DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    static DateTimeFormatter dateTimeFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    static DateTimeFormatter timeFormat = DateTimeFormatter.ofPattern("HH:mm");

    public static void main(String[] args) {
        // UniversalProjectReader auto-detecteert bestandsformaat
        UniversalProjectReader universalReader = new UniversalProjectReader();
        ProjectReaderProxy proxy = universalReader.getProjectReaderProxy(sourceFile);
        ProjectReader projectReader = proxy.getProjectReader();

        // Speciale handling voor MPX files
        boolean isMpx = projectReader instanceof MPXReader;

        ProjectFile projectFile = projectReader.read(sourceFile);

        // Convert naar JSON
        String result = new MainJSONBuilder(properties, dateFormat, timeFormat, dateTimeFormat, isMpx)
            .buildJSON(projectFile)
            .toString(indentFactor);
    }
}
```

### 11.5 MainJSONBuilder - Orchestration

```java
public class MainJSONBuilder implements JSONBuilder<JSONObject> {

    public JSONObject buildJSON(ProjectFile projectFile) {
        ProjectProperties props = projectFile.getProjectProperties();
        JSONObject result = new JSONObject();

        // Project container met duration conversie ratios
        if (useProjectContainer) {
            JSONObject projectJSON = new JSONObject();

            // Duration conversie
            projectJSON.put("daysPerWeek", props.getMinutesPerWeek() / props.getMinutesPerDay());
            projectJSON.put("daysPerMonth", props.getMinutesPerMonth() / props.getMinutesPerDay());
            projectJSON.put("hoursPerDay", props.getMinutesPerDay() / 60);
            projectJSON.put("calendar", projectFile.getDefaultCalendar().getUniqueID());

            // Dependency calendar mapping
            String dependencyCalendar = switch (props.getRelationshipLagCalendar()) {
                case PREDECESSOR -> "FromEvent";
                case SUCCESSOR -> "ToEvent";
                case PROJECT_DEFAULT -> "Project";
                case TWENTY_FOUR_HOUR -> "AllWorking";
            };
            projectJSON.put("dependenciesCalendar", dependencyCalendar);

            // Project direction
            if (props.getScheduleFrom() == ScheduleFrom.START) {
                projectJSON.put("startDate", formatDate(props.getStartDate()));
                projectJSON.put("direction", "Forward");
            } else {
                projectJSON.put("endDate", formatDate(props.getFinishDate()));
                projectJSON.put("direction", "Backward");
            }

            result.put("project", projectJSON);
        }

        // Kies calendar builder (Ext of Vanilla formaat)
        JSONBuilder<JSONObject> calendarsBuilder = useVanillaCalendars
            ? new VanillaCalendarsJSONBuilder(...)
            : new ExtCalendarsJSONBuilder(...);

        result.put("calendars", calendarsBuilder.buildJSON(projectFile));
        result.put("tasks", new TasksJSONBuilder(...).buildJSON(projectFile));
        result.put("dependencies", new DependenciesJSONBuilder(...).buildJSON(projectFile));
        result.put("assignments", new AssignmentsJSONBuilder(...).buildJSON(projectFile));
        result.put("resources", new ResourcesJSONBuilder(...).buildJSON(projectFile));
        result.put("columns", new ColumnsJSONBuilder(...).buildJSON(projectFile));

        return result;
    }
}
```

### 11.6 TasksJSONBuilder - Complete Task Extraction

```java
public class TasksJSONBuilder implements JSONBuilder<JSONObject> {

    public JSONObject getTaskJSON(Task task) {
        JSONObject taskJSON = new JSONObject();

        // Basis velden
        taskJSON.put("Id", task.getUniqueID());
        taskJSON.put("Name", task.getName());
        taskJSON.put("StartDate", formatDate(task.getStart()));
        taskJSON.put("EndDate", formatDate(task.getFinish()));

        // Duration met unit
        Duration duration = task.getDuration();
        if (duration != null) {
            taskJSON.put("Duration", duration.getDuration());
            taskJSON.put("DurationUnit", getUnitByTimeUnit(duration.getUnits()));
        }

        // Effort (work)
        Duration work = task.getWork();
        if (work != null) {
            taskJSON.put("Effort", work.getDuration());
            taskJSON.put("EffortUnit", getUnitByTimeUnit(work.getUnits()));
        }

        // Calendar reference
        if (task.getCalendar() != null) {
            taskJSON.put("CalendarId", task.getCalendar().getUniqueID());
        }

        // Progress en flags
        taskJSON.put("PercentDone", task.getPercentageComplete());
        taskJSON.put("Milestone", task.getMilestone());
        taskJSON.put("Rollup", task.getRollup());
        taskJSON.put("ManuallyScheduled", task.getTaskMode() == TaskMode.MANUALLY_SCHEDULED);
        taskJSON.put("SchedulingMode", getTaskType(task));

        // Constraints
        if (task.getConstraintDate() != null) {
            taskJSON.put("ConstraintDate", formatDate(task.getConstraintDate()));
        }
        taskJSON.put("ConstraintType", getConstraintType(task.getConstraintType()));

        // Baselines (als array voor multiple baselines)
        JSONArray baselines = new JSONArray();
        for (int i = 0; i <= 10; i++) {
            LocalDateTime start = i == 0 ? task.getBaselineStart() : task.getBaselineStart(i);
            LocalDateTime finish = i == 0 ? task.getBaselineFinish() : task.getBaselineFinish(i);
            if (start != null || finish != null) {
                JSONObject baseline = new JSONObject();
                if (start != null) baseline.put("StartDate", formatDate(start));
                if (finish != null) baseline.put("EndDate", formatDate(finish));
                baselines.put(baseline);
            }
        }
        if (baselines.length() > 0) {
            taskJSON.put("baselines", baselines);
        }

        // Split tasks / Segments
        List<LocalDateTimeRange> splits = task.getSplits();
        if (splits == null && task.getSuspendDate() != null && task.getResume() != null) {
            // Converteer suspend/resume naar segments
            splits = Arrays.asList(
                new LocalDateTimeRange(task.getStart(), task.getSuspendDate()),
                new LocalDateTimeRange(task.getResume(), task.getFinish())
            );
        }
        if (splits != null) {
            JSONArray segments = new JSONArray();
            for (LocalDateTimeRange split : splits) {
                segments.put(new JSONObject()
                    .put("StartDate", formatDate(split.getStart()))
                    .put("EndDate", formatDate(split.getEnd())));
            }
            taskJSON.put("Segments", segments);
        }

        // Recursieve children
        JSONArray children = new JSONArray();
        for (Task child : task.getChildTasks()) {
            children.put(getTaskJSON(child));
        }
        if (children.length() > 0) {
            taskJSON.put("children", children);
            taskJSON.put("expanded", task.getExpanded());
            taskJSON.put("leaf", false);
        } else {
            taskJSON.put("leaf", true);
        }

        return taskJSON;
    }

    // Task type mapping
    private String getTaskType(Task task) {
        // Parent tasks geforceerd naar "Normal"
        if (task.hasChildTasks() && summaryTaskType != null) {
            return summaryTaskType;
        }

        // DynamicAssignment = FixedDuration + EffortDriven
        if (task.getType() == TaskType.FIXED_DURATION && task.getEffortDriven()) {
            return "DynamicAssignments";
        }

        return switch (task.getType()) {
            case FIXED_DURATION -> "FixedDuration";
            case FIXED_WORK -> "EffortDriven";
            default -> null;
        };
    }
}
```

### 11.7 DependenciesJSONBuilder

```java
public class DependenciesJSONBuilder implements JSONBuilder<JSONArray> {

    public JSONObject getDependencyJSON(Relation dependency, int dependencyId) {
        JSONObject result = new JSONObject();

        result.put("Id", dependencyId);
        result.put("To", dependency.getSuccessorTask().getUniqueID());
        result.put("From", dependency.getPredecessorTask().getUniqueID());

        double lag = dependency.getLag().getDuration();
        TimeUnit lagUnit = dependency.getLag().getUnits();

        // Percentage lag naar fixed value
        if (lagUnit == TimeUnit.PERCENT && fixLagPercentage) {
            Duration predecessorDuration = dependency.getPredecessorTask().getDuration();
            if (predecessorDuration != null) {
                lagUnit = predecessorDuration.getUnits();
                lag = predecessorDuration.getDuration() * lag * 0.01;
            }
        }

        result.put("Lag", lag);
        result.put("LagUnit", getUnitByTimeUnit(lagUnit));

        // Type mapping: FF=3, FS=2, SF=1, SS=0
        result.put("Type", switch (dependency.getType()) {
            case FINISH_FINISH -> 3;
            case FINISH_START -> 2;
            case START_FINISH -> 1;
            case START_START -> 0;
        });

        return result;
    }
}
```

### 11.8 ResourcesJSONBuilder

```java
public class ResourcesJSONBuilder implements JSONBuilder<JSONArray> {

    public JSONObject getResourceJSON(Resource resource) {
        JSONObject result = new JSONObject();

        result.put("Id", resource.getUniqueID());
        result.put("Name", resource.getName() != null ? resource.getName() : "New resource");
        result.put("CalendarId", resource.getBaseCalendar());

        // Resource type: work, material, cost
        result.put("type", switch (resource.getType()) {
            case WORK -> "work";
            case MATERIAL -> "material";
            case COST -> "cost";
        });

        result.put("materialLabel", resource.getMaterialLabel());
        result.put("maxUnits", resource.getMaxUnits());

        // Accrue type: prorated, start, end
        if (resource.getAccrueAt() != null) {
            result.put("accrueAt", switch (resource.getAccrueAt()) {
                case PRORATED -> "prorated";
                case START -> "start";
                case END -> "end";
            });
        }

        return result;
    }
}
```

### 11.9 AssignmentsJSONBuilder

```java
public class AssignmentsJSONBuilder implements JSONBuilder<JSONArray> {

    public JSONObject getAssignmentJSON(ResourceAssignment assignment) {
        JSONObject result = new JSONObject();

        result.put("Id", assignment.getUniqueID());
        result.put("ResourceId", assignment.getResourceUniqueID());
        result.put("TaskId", assignment.getTaskUniqueID());
        result.put("rateTable", assignment.getCostRateTableIndex());

        // Verschillende velden per resource type
        switch (assignment.getResource().getType()) {
            case MATERIAL -> result.put("quantity", assignment.getUnits());
            case COST -> result.put("cost", assignment.getCost());
            case WORK -> result.put("Units", assignment.getUnits());
        }

        return result;
    }
}
```

### 11.10 VanillaCalendarsJSONBuilder - Recurrence Rules

```java
public class VanillaCalendarsJSONBuilder implements JSONBuilder<JSONObject> {

    // Later.js recurrence rule syntax
    public String getRecurrenceRule(RecurringData data) {
        Integer frequency = data.getFrequency() != null ? data.getFrequency() : 1;
        String rule = "every " + frequency;

        switch (data.getRecurrenceType()) {
            case DAILY -> rule += " day ";

            case WEEKLY -> {
                rule += " week on ";
                for (int i = 1; i <= 7; i++) {
                    DayOfWeek day = DayOfWeek.of(i);
                    if (data.getWeeklyDay(day)) {
                        rule += day + ", ";
                    }
                }
            }

            case MONTHLY -> {
                rule += " month ";
                if (data.getRelative()) {
                    // "on Mon on the 3rd day instance"
                    String ordinal = data.getDayNumber() == 5 ? "last" : data.getDayNumber().toString();
                    rule += "on " + data.getDayOfWeek() + " on the " + ordinal + " day instance ";
                } else {
                    rule += "on the " + data.getDayNumber() + " day ";
                }
            }

            case YEARLY -> {
                rule += " year ";
                Month month = Month.of(data.getMonthNumber());
                if (data.getRelative()) {
                    String ordinal = data.getDayNumber() == 5 ? "last" : data.getDayNumber().toString();
                    rule += "on " + data.getDayOfWeek() + " on the " + ordinal + " day instance of " + month;
                } else {
                    rule += "on the " + data.getDayNumber() + " day of " + month;
                }
            }
        }

        // Date range
        rule += " after " + formatDate(data.getStartDate());
        rule += " before " + formatDate(data.getFinishDate());

        return rule;
    }

    // Calendar intervals in Bryntum formaat
    public JSONObject getCalendarJSON(ProjectCalendar calendar) {
        JSONObject calendarJSON = new JSONObject();

        calendarJSON.put("Id", calendar.getUniqueID());
        calendarJSON.put("Name", calendar.getName());

        if (calendar.getParent() != null) {
            calendarJSON.put("parentId", calendar.getParent().getUniqueID());
        }

        JSONArray intervalsJSON = new JSONArray();

        // Default week intervals
        fillDefaultWeekIntervalsJSON(intervalsJSON, calendar);

        // Week overrides
        for (ProjectCalendarWeek week : calendar.getWorkWeeks()) {
            fillWeekOverrideIntervalsJSON(intervalsJSON, calendar, week);
        }

        // Calendar exceptions
        for (ProjectCalendarException exception : calendar.getCalendarExceptions()) {
            fillCalendarExceptionIntervalsJSON(intervalsJSON, exception);
        }

        calendarJSON.put("Days", intervalsJSON);
        calendarJSON.put("unspecifiedTimeIsWorking", false);

        // Children calendars
        JSONArray childrenJSON = new JSONArray();
        for (ProjectCalendar child : calendar.getDerivedCalendars()) {
            childrenJSON.put(getCalendarJSON(child));
        }
        if (childrenJSON.length() > 0) {
            calendarJSON.put("children", childrenJSON);
            calendarJSON.put("expanded", true);
        }

        return calendarJSON;
    }
}
```

### 11.11 Configuration Properties

Het systeem is volledig configureerbaar via `projectreader.default.properties`:

```properties
# Date formats
date.format=yyyy-MM-dd
dateTime.format=yyyy-MM-dd'T'HH:mm:ss
time.format=HH:mm

# JSON indent
indent.size=4

# Parent task scheduling
force.summaryTask.type=Normal

# Task field mappings
task.UNIQUE_ID=Id
task.NAME=Name
task.START=StartDate
task.FINISH=EndDate
task.DURATION=Duration
task.DURATION_UNIT=DurationUnit
task.PERCENT_COMPLETE=PercentDone
task.MILESTONE=Milestone
task.ROLLUP=Rollup
task.MODE=ManuallyScheduled
task.CONSTRAINT_DATE=ConstraintDate
task.CONSTRAINT_TYPE=ConstraintType
task.WORK=Effort
task.WORK_UNIT=EffortUnit
task.TYPE=SchedulingMode
task.CALENDAR=CalendarId
task.CHILDREN=children
task.SEGMENTS=Segments
task.BASELINES=baselines

# Constraint type mappings
constraintType.AS_SOON_AS_POSSIBLE=assoonaspossible
constraintType.AS_LATE_AS_POSSIBLE=aslateaspossible
constraintType.MUST_START_ON=muststarton
constraintType.MUST_FINISH_ON=mustfinishon
constraintType.START_NO_EARLIER_THAN=startnoearlierthan
constraintType.START_NO_LATER_THAN=startnolaterthan
constraintType.FINISH_NO_EARLIER_THAN=finishnoearlierthan
constraintType.FINISH_NO_LATER_THAN=finishnolaterthan

# Time unit mappings
timeUnit.m=mi
timeUnit.em=mi
timeUnit.eh=h
timeUnit.ed=d
timeUnit.ew=w
timeUnit.emo=mo
timeUnit.ey=y

# Dependency type mappings
dependencyType.FF=3
dependencyType.FS=2
dependencyType.SF=1
dependencyType.SS=0

# Column xtype mappings
columnXType.Task\ Name=namecolumn
columnXType.Duration=durationcolumn
columnXType.Start=startdatecolumn
columnXType.Finish=enddatecolumn
columnXType.%\ Complete=percentdonecolumn
```

---

## 12. Build & Deployment

### 12.1 Maven Build

```bash
cd projectreader

# Clean build
mvn clean package

# Build met dependencies (fat JAR)
mvn package -P shade

# Run tests
mvn test
```

### 12.2 Server Integration

```php
<?php
// PHP wrapper voor Java JAR

$jarPath = '/path/to/bryntum-project-reader.jar';
$inputFile = $_FILES['mpp-file']['tmp_name'];
$outputFile = tempnam(sys_get_temp_dir(), 'msp');

// Execute Java
$cmd = "java -jar $jarPath " . escapeshellarg($inputFile) . " " . escapeshellarg($outputFile);
exec($cmd, $output, $returnCode);

if ($returnCode === 0) {
    $json = file_get_contents($outputFile);
    unlink($outputFile);

    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'data' => json_decode($json)
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'msg' => 'Conversion failed']);
}
```

---

## Zie Ook

- [INTEGRATION-PRIMAVERA.md](./INTEGRATION-PRIMAVERA.md) - Primavera P6 integratie
- [GANTT-API-PROJECTMODEL.md](./GANTT-API-PROJECTMODEL.md) - Project data management
- [GANTT-IMPL-DEPENDENCIES.md](./GANTT-IMPL-DEPENDENCIES.md) - Dependency configuratie
- [GANTT-IMPL-CALENDARS.md](./GANTT-IMPL-CALENDARS.md) - Calendar setup

---

*Track C2.7 - Third-party Integraties - MS Project*
