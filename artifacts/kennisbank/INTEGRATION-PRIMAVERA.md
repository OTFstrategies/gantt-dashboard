# Integration Guide: Bryntum Gantt + Oracle Primavera P6

> **Implementatie guide** voor Oracle Primavera P6 integratie met Bryntum Gantt: XER/XML import, P6 Web Services, en EPPM API connectivity.

---

## Overzicht

De Primavera integratie maakt het mogelijk om:
- **XER Import** - Lees Primavera XER bestanden via MPXJ
- **XML Export** - Genereer P6 XML vanuit Gantt data
- **P6 EPPM API** - Real-time synchronisatie met cloud
- **Data Mapping** - Converteer tussen P6 en Bryntum formaten

---

## 1. File-Based Integration

### 1.1 XER Import via MPXJ

```javascript
// Server-side XER parsing (Node.js example)
const mpxj = require('mpxj');

class PrimaveraImporter {

    async importXER(filePath) {
        const reader = new mpxj.UniversalProjectReader();
        const project = await reader.read(filePath);

        return {
            project: this.extractProjectInfo(project),
            calendars: this.extractCalendars(project),
            tasks: this.extractActivities(project),
            resources: this.extractResources(project),
            assignments: this.extractAssignments(project),
            dependencies: this.extractRelationships(project)
        };
    }

    extractProjectInfo(project) {
        return {
            id: project.projectProperties.projectID,
            name: project.projectProperties.name,
            startDate: project.projectProperties.startDate,
            finishDate: project.projectProperties.finishDate,
            dataDate: project.projectProperties.statusDate
        };
    }

    extractActivities(project) {
        const tasks = [];

        for (const task of project.tasks) {
            if (task.summary) continue; // Skip WBS summaries

            tasks.push({
                id: task.activityID || task.uniqueID,
                name: task.name,
                startDate: task.start,
                endDate: task.finish,
                duration: task.duration?.duration,
                durationUnit: this.mapDurationUnit(task.duration?.units),
                percentDone: task.percentComplete || 0,
                parentId: task.parentTask?.uniqueID,
                // P6-specific fields
                activityType: task.activityType,
                calendarId: task.calendar?.uniqueID,
                constraintType: task.constraintType,
                constraintDate: task.constraintDate,
                actualStart: task.actualStart,
                actualFinish: task.actualFinish
            });
        }

        return tasks;
    }

    extractRelationships(project) {
        const dependencies = [];

        for (const task of project.tasks) {
            for (const predecessor of task.predecessors || []) {
                dependencies.push({
                    from: predecessor.predecessorTask.uniqueID,
                    to: task.uniqueID,
                    type: this.mapRelationType(predecessor.type),
                    lag: predecessor.lag?.duration || 0,
                    lagUnit: this.mapDurationUnit(predecessor.lag?.units)
                });
            }
        }

        return dependencies;
    }

    mapRelationType(p6Type) {
        const mapping = {
            'FINISH_FINISH': 0,
            'START_START': 1,
            'FINISH_START': 2,
            'START_FINISH': 3
        };
        return mapping[p6Type] ?? 2;
    }

    mapDurationUnit(p6Unit) {
        const mapping = {
            'HOURS': 'h',
            'DAYS': 'd',
            'WEEKS': 'w',
            'MONTHS': 'M'
        };
        return mapping[p6Unit] ?? 'd';
    }
}
```

### 1.2 Client-Side Import Handler

```javascript
const gantt = new Gantt({
    appendTo: 'container',
    emptyText: 'Drop a Primavera XER file here',

    features: {
        fileDrop: true
    },

    async onFileDrop({ file }) {
        if (!file.name.endsWith('.xer')) {
            Toast.show({ html: 'Please drop a .xer file', color: 'b-orange' });
            return;
        }

        await this.importPrimaveraFile(file);
    },

    async importPrimaveraFile(file) {
        const formData = new FormData();
        formData.append('xer-file', file);

        this.maskBody('Importing Primavera project...');

        try {
            const response = await fetch('/api/primavera/import', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                await this.loadPrimaveraData(data);
                Toast.show('Project imported successfully!');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            Toast.show({ html: `Import failed: ${error.message}`, color: 'b-red' });
        } finally {
            this.unmaskBody();
        }
    },

    async loadPrimaveraData(data) {
        const project = new ProjectModel({
            calendar: data.project.calendar,
            startDate: data.project.startDate
        });

        // Load calendars first
        project.calendarManagerStore.add(data.calendars);

        // Load inline data
        await project.loadInlineData({
            tasksData: data.tasks,
            resourcesData: data.resources,
            assignmentsData: data.assignments,
            dependenciesData: data.dependencies
        });

        this.project.destroy();
        this.project = project;
    }
});
```

---

## 2. P6 EPPM Web Services

### 2.1 API Client

```javascript
class P6EPPMClient {

    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.username = config.username;
        this.password = config.password;
        this.token = null;
    }

    async authenticate() {
        const response = await fetch(`${this.baseUrl}/api/restapi/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                username: this.username,
                password: this.password
            })
        });

        const data = await response.json();
        this.token = data.token;

        return this.token;
    }

    async request(endpoint, options = {}) {
        if (!this.token) {
            await this.authenticate();
        }

        const response = await fetch(`${this.baseUrl}/api/restapi${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (response.status === 401) {
            // Token expired, re-authenticate
            await this.authenticate();
            return this.request(endpoint, options);
        }

        return response.json();
    }

    // Projects
    async getProjects() {
        return this.request('/project');
    }

    async getProject(projectId) {
        return this.request(`/project/${projectId}`);
    }

    // Activities
    async getActivities(projectId) {
        return this.request(`/activity?projectId=${projectId}`);
    }

    async updateActivity(activityId, data) {
        return this.request(`/activity/${activityId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async createActivity(data) {
        return this.request('/activity', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Relationships
    async getRelationships(projectId) {
        return this.request(`/relationship?projectId=${projectId}`);
    }

    // Resources
    async getResources() {
        return this.request('/resource');
    }

    async getResourceAssignments(projectId) {
        return this.request(`/resourceassignment?projectId=${projectId}`);
    }
}
```

### 2.2 Data Transformer

```javascript
class P6DataTransformer {

    // P6 → Bryntum
    transformActivities(p6Activities) {
        return p6Activities.map(activity => ({
            id: activity.Id,
            name: activity.Name,
            startDate: this.parseDate(activity.PlannedStartDate),
            endDate: this.parseDate(activity.PlannedFinishDate),
            duration: activity.PlannedDuration,
            durationUnit: 'h',  // P6 uses hours
            percentDone: activity.PhysicalPercentComplete || 0,
            parentId: activity.WBSObjectId,

            // P6-specific stored as custom fields
            activityId: activity.Id,
            activityType: activity.Type,
            primaryConstraint: activity.PrimaryConstraintType,
            primaryConstraintDate: activity.PrimaryConstraintDate,
            actualStart: activity.ActualStartDate,
            actualFinish: activity.ActualFinishDate,
            remainingDuration: activity.RemainingDuration
        }));
    }

    transformRelationships(p6Relationships) {
        return p6Relationships.map(rel => ({
            from: rel.PredecessorActivityObjectId,
            to: rel.SuccessorActivityObjectId,
            type: this.mapRelationType(rel.Type),
            lag: rel.Lag,
            lagUnit: 'h'
        }));
    }

    transformResources(p6Resources) {
        return p6Resources.map(res => ({
            id: res.ObjectId,
            name: res.Name,
            email: res.EmailAddress,
            role: res.Title,
            calendar: res.CalendarObjectId
        }));
    }

    // Bryntum → P6
    toP6Activity(bryntumTask) {
        return {
            Name: bryntumTask.name,
            PlannedStartDate: this.formatDate(bryntumTask.startDate),
            PlannedFinishDate: this.formatDate(bryntumTask.endDate),
            PlannedDuration: bryntumTask.duration,
            PhysicalPercentComplete: bryntumTask.percentDone,
            WBSObjectId: bryntumTask.parentId,
            Type: bryntumTask.activityType || 'TaskDependent'
        };
    }

    toP6Relationship(bryntumDep) {
        return {
            PredecessorActivityObjectId: bryntumDep.from,
            SuccessorActivityObjectId: bryntumDep.to,
            Type: this.toP6RelationType(bryntumDep.type),
            Lag: bryntumDep.lag || 0
        };
    }

    mapRelationType(p6Type) {
        const mapping = {
            'FinishToFinish': 0,
            'StartToStart': 1,
            'FinishToStart': 2,
            'StartToFinish': 3
        };
        return mapping[p6Type] ?? 2;
    }

    toP6RelationType(bryntumType) {
        const mapping = {
            0: 'FinishToFinish',
            1: 'StartToStart',
            2: 'FinishToStart',
            3: 'StartToFinish'
        };
        return mapping[bryntumType] ?? 'FinishToStart';
    }

    parseDate(dateString) {
        return dateString ? new Date(dateString) : null;
    }

    formatDate(date) {
        return date ? date.toISOString() : null;
    }
}
```

---

## 3. Sync Service

### 3.1 Bi-Directional Sync

```javascript
class PrimaveraSyncService {

    constructor(gantt, p6Client) {
        this.gantt = gantt;
        this.p6Client = p6Client;
        this.transformer = new P6DataTransformer();
        this.projectId = null;

        this.setupListeners();
    }

    setupListeners() {
        const { project } = this.gantt;

        project.taskStore.on({
            add: this.onTaskAdd.bind(this),
            update: this.onTaskUpdate.bind(this),
            remove: this.onTaskRemove.bind(this)
        });

        project.dependencyStore.on({
            add: this.onDependencyAdd.bind(this),
            remove: this.onDependencyRemove.bind(this)
        });
    }

    async loadProject(projectId) {
        this.projectId = projectId;

        // Parallel fetch
        const [activities, relationships, resources, assignments] = await Promise.all([
            this.p6Client.getActivities(projectId),
            this.p6Client.getRelationships(projectId),
            this.p6Client.getResources(),
            this.p6Client.getResourceAssignments(projectId)
        ]);

        await this.gantt.project.loadInlineData({
            tasksData: this.transformer.transformActivities(activities),
            dependenciesData: this.transformer.transformRelationships(relationships),
            resourcesData: this.transformer.transformResources(resources),
            assignmentsData: this.transformer.transformAssignments(assignments)
        });
    }

    async onTaskAdd({ records }) {
        for (const task of records) {
            const p6Activity = this.transformer.toP6Activity(task);
            p6Activity.ProjectObjectId = this.projectId;

            const result = await this.p6Client.createActivity(p6Activity);

            // Update local task with P6 ObjectId
            task.set('activityId', result.ObjectId, true);
        }
    }

    async onTaskUpdate({ record, changes }) {
        if (!record.activityId) return;

        const p6Updates = {};

        if ('name' in changes) p6Updates.Name = changes.name.value;
        if ('startDate' in changes) p6Updates.PlannedStartDate = this.transformer.formatDate(changes.startDate.value);
        if ('endDate' in changes) p6Updates.PlannedFinishDate = this.transformer.formatDate(changes.endDate.value);
        if ('duration' in changes) p6Updates.PlannedDuration = changes.duration.value;
        if ('percentDone' in changes) p6Updates.PhysicalPercentComplete = changes.percentDone.value;

        if (Object.keys(p6Updates).length > 0) {
            await this.p6Client.updateActivity(record.activityId, p6Updates);
        }
    }

    async onTaskRemove({ records }) {
        for (const task of records) {
            if (task.activityId) {
                await this.p6Client.deleteActivity(task.activityId);
            }
        }
    }

    async onDependencyAdd({ records }) {
        for (const dep of records) {
            const p6Rel = this.transformer.toP6Relationship(dep);
            await this.p6Client.createRelationship(p6Rel);
        }
    }

    async onDependencyRemove({ records }) {
        for (const dep of records) {
            if (dep.p6Id) {
                await this.p6Client.deleteRelationship(dep.p6Id);
            }
        }
    }
}
```

---

## 4. Field Mapping Reference

### 4.1 Activity Fields

| Primavera P6 | Bryntum Gantt | Notes |
|--------------|---------------|-------|
| ObjectId | id | Unique identifier |
| Id | activityId | Activity code |
| Name | name | Activity name |
| PlannedStartDate | startDate | Planned start |
| PlannedFinishDate | endDate | Planned finish |
| PlannedDuration | duration | Original duration |
| RemainingDuration | remainingDuration | Remaining work |
| PhysicalPercentComplete | percentDone | Progress |
| Type | activityType | TaskDependent, etc. |
| PrimaryConstraintType | constraintType | ASAP, ALAP, etc. |
| PrimaryConstraintDate | constraintDate | Constraint date |
| ActualStartDate | actualStart | Actual start |
| ActualFinishDate | actualFinish | Actual finish |
| WBSObjectId | parentId | WBS reference |

### 4.2 Relationship Types

| P6 Type | Bryntum Type | Code |
|---------|--------------|------|
| FinishToFinish | 0 | FF |
| StartToStart | 1 | SS |
| FinishToStart | 2 | FS |
| StartToFinish | 3 | SF |

### 4.3 Constraint Types

| P6 Constraint | Bryntum Constraint |
|---------------|-------------------|
| As Soon As Possible | startnoearlierthan |
| As Late As Possible | finishnolaterthan |
| Start On | muststarton |
| Start On or Before | startnolaterthan |
| Start On or After | startnoearlierthan |
| Finish On | mustfinishon |
| Finish On or Before | finishnolaterthan |
| Finish On or After | finishnoearlierthan |

---

## 5. WBS Hierarchy

### 5.1 WBS to Task Tree

```javascript
class WBSTransformer {

    buildTaskTree(activities, wbsElements) {
        // Create WBS nodes first
        const wbsNodes = wbsElements.map(wbs => ({
            id: `wbs_${wbs.ObjectId}`,
            name: wbs.Name,
            wbsCode: wbs.Code,
            parentId: wbs.ParentObjectId ? `wbs_${wbs.ParentObjectId}` : null,
            expanded: true,
            // Mark as summary
            leaf: false
        }));

        // Add activities under their WBS
        const activityNodes = activities.map(activity => ({
            id: activity.ObjectId,
            name: activity.Name,
            startDate: activity.PlannedStartDate,
            endDate: activity.PlannedFinishDate,
            duration: activity.PlannedDuration,
            percentDone: activity.PhysicalPercentComplete,
            parentId: activity.WBSObjectId ? `wbs_${activity.WBSObjectId}` : null,
            leaf: true
        }));

        return [...wbsNodes, ...activityNodes];
    }
}
```

---

## 6. Calendar Integration

### 6.1 P6 Calendar to Bryntum

```javascript
class CalendarTransformer {

    transformCalendar(p6Calendar) {
        const intervals = [];

        // Standard work week
        for (const workWeek of p6Calendar.StandardWorkWeek || []) {
            if (!workWeek.WorkHours?.length) {
                // Non-working day
                intervals.push({
                    recurrentStartDate: `on ${workWeek.DayOfWeek} at 0:00`,
                    recurrentEndDate: `on ${workWeek.DayOfWeek} at 24:00`,
                    isWorking: false
                });
            }
        }

        // Holiday exceptions
        for (const exception of p6Calendar.HolidayOrExceptions || []) {
            intervals.push({
                startDate: exception.Date,
                endDate: DateHelper.add(exception.Date, 1, 'day'),
                isWorking: false,
                name: exception.Name
            });
        }

        return {
            id: p6Calendar.ObjectId,
            name: p6Calendar.Name,
            intervals
        };
    }
}
```

---

## 7. Baseline Comparison

### 7.1 Load Baselines

```javascript
async loadBaselines(projectId, baselineNumber) {
    const baselineActivities = await this.p6Client.request(
        `/activity?projectId=${projectId}&baselineNumber=${baselineNumber}`
    );

    const baselines = baselineActivities.map(activity => ({
        id: activity.ObjectId,
        startDate: activity.PlannedStartDate,
        endDate: activity.PlannedFinishDate,
        duration: activity.PlannedDuration
    }));

    // Apply to Gantt
    this.gantt.project.taskStore.forEach(task => {
        const baseline = baselines.find(b => b.id === task.activityId);
        if (baseline) {
            task.baselines = [baseline];
        }
    });

    // Enable baseline feature
    this.gantt.features.baselines.disabled = false;
}
```

---

## 8. Export to P6 XML

### 8.1 PMXML Generation

```javascript
class PMXMLExporter {

    export(gantt) {
        const project = gantt.project;

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<APIBusinessObjects xmlns="http://xmlns.oracle.com/Primavera/P6/V8/API/BusinessObjects">
    <Project>
        <Name>${project.name}</Name>
        <PlannedStartDate>${this.formatDate(project.startDate)}</PlannedStartDate>
        ${this.exportActivities(project.taskStore.records)}
        ${this.exportRelationships(project.dependencyStore.records)}
    </Project>
</APIBusinessObjects>`;

        return xml;
    }

    exportActivities(tasks) {
        return tasks.filter(t => t.isLeaf).map(task => `
        <Activity>
            <Name>${this.escapeXml(task.name)}</Name>
            <PlannedStartDate>${this.formatDate(task.startDate)}</PlannedStartDate>
            <PlannedFinishDate>${this.formatDate(task.endDate)}</PlannedFinishDate>
            <PlannedDuration>${task.duration}</PlannedDuration>
            <PhysicalPercentComplete>${task.percentDone}</PhysicalPercentComplete>
        </Activity>`).join('');
    }

    exportRelationships(dependencies) {
        return dependencies.map(dep => `
        <Relationship>
            <PredecessorActivityObjectId>${dep.from}</PredecessorActivityObjectId>
            <SuccessorActivityObjectId>${dep.to}</SuccessorActivityObjectId>
            <Type>${this.getRelationType(dep.type)}</Type>
            <Lag>${dep.lag || 0}</Lag>
        </Relationship>`).join('');
    }

    getRelationType(type) {
        const types = ['FinishToFinish', 'StartToStart', 'FinishToStart', 'StartToFinish'];
        return types[type] || 'FinishToStart';
    }

    formatDate(date) {
        return date ? date.toISOString() : '';
    }

    escapeXml(str) {
        return str.replace(/[<>&'"]/g, c => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
        }[c]));
    }
}
```

---

## 9. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Import | Gebruik MPXJ voor betrouwbare XER parsing |
| API | Cache P6 API token, refresh bij 401 |
| Sync | Batch updates voor performance |
| Calendars | Importeer calendars vóór activities |
| WBS | Behoud WBS hierarchy in parentId |
| Baselines | Laad baselines on-demand |

---

## 10. Supported Formats

| Format | Extension | Import | Export |
|--------|-----------|--------|--------|
| XER | .xer | ✓ (MPXJ) | - |
| PMXML | .xml | ✓ | ✓ |
| P6 Web | API | ✓ | ✓ |
| XLS | .xls | ✓ (MPXJ) | - |

---

## Zie Ook

- [INTEGRATION-MS-PROJECT.md](./INTEGRATION-MS-PROJECT.md) - MS Project integratie
- [INTEGRATION-SAP.md](./INTEGRATION-SAP.md) - SAP PS integratie
- [GANTT-IMPL-DEPENDENCIES.md](./GANTT-IMPL-DEPENDENCIES.md) - Dependency types
- [GANTT-IMPL-CALENDARS.md](./GANTT-IMPL-CALENDARS.md) - Calendar configuratie

---

*Track C2.8 - Third-party Integraties - Primavera P6*
