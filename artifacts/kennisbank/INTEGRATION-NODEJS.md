# Integration Guide: Bryntum Gantt + Node.js

> **Implementatie guide** voor server-side processing met Bryntum Gantt in Node.js omgevingen.

---

## Overzicht

De Node.js integratie maakt het mogelijk om:
- **Server-side Scheduling** - Project berekeningen op de server
- **Headless Processing** - Gantt scheduling zonder browser
- **API Endpoints** - REST/GraphQL backends met Gantt logica
- **Batch Processing** - Bulk project updates

---

## 1. Node.js Bundles

### 1.1 Beschikbare Bundles

| Bundle | Format | Gebruik |
|--------|--------|---------|
| `gantt.node.cjs` | CommonJS | `require()` syntax |
| `gantt.node.mjs` | ES Modules | `import` syntax |

**Locatie:** `@bryntum/gantt/` of `build/` folder in distributie

### 1.2 Beperkingen

- **Geen UI** - Alleen data/scheduling classes
- **Licensed Only** - Niet in trial versie
- **ProjectModel Focus** - Scheduling engine beschikbaar

---

## 2. CommonJS Setup

### 2.1 Installation

```bash
npm install @bryntum/gantt
```

### 2.2 Basic Usage

```javascript
const { ProjectModel } = require('@bryntum/gantt/gantt.node.cjs');

const project = new ProjectModel({
    startDate: '2024-01-15',
    hoursPerDay: 8,
    daysPerWeek: 5,

    tasksData: [
        {
            id: 1,
            name: 'Phase 1',
            startDate: '2024-01-15',
            duration: 5,
            children: [
                { id: 2, name: 'Task 1.1', duration: 2 },
                { id: 3, name: 'Task 1.2', duration: 3 }
            ]
        }
    ],

    dependenciesData: [
        { fromTask: 2, toTask: 3, type: 2 }  // FS
    ]
});

// Wait for calculations
await project.commitAsync();

// Access calculated values
project.taskStore.forEach(task => {
    console.log(`${task.name}: ${task.startDate} - ${task.endDate}`);
});
```

---

## 3. ES Modules Setup

### 3.1 package.json

```json
{
    "type": "module"
}
```

### 3.2 Basic Usage

```javascript
import { ProjectModel } from '@bryntum/gantt/gantt.node.mjs';

const project = new ProjectModel({
    // Configuration
});

await project.commitAsync();
```

---

## 4. REST API Integration

### 4.1 Express.js Example

```javascript
const express = require('express');
const { ProjectModel } = require('@bryntum/gantt/gantt.node.cjs');

const app = express();
app.use(express.json());

// Calculate project schedule
app.post('/api/schedule', async (req, res) => {
    try {
        const { tasks, dependencies, resources, assignments } = req.body;

        const project = new ProjectModel({
            tasksData: tasks,
            dependenciesData: dependencies,
            resourcesData: resources,
            assignmentsData: assignments,
            hoursPerDay: 8
        });

        await project.commitAsync();

        // Return calculated schedule
        res.json({
            success: true,
            tasks: project.taskStore.allRecords.map(task => ({
                id: task.id,
                name: task.name,
                startDate: task.startDate,
                endDate: task.endDate,
                duration: task.duration,
                percentDone: task.percentDone,
                totalSlack: task.totalSlack,
                critical: task.critical
            }))
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add task and recalculate
app.post('/api/tasks', async (req, res) => {
    const { projectData, newTask } = req.body;

    const project = new ProjectModel(projectData);
    await project.commitAsync();

    // Add new task
    const task = project.taskStore.add(newTask);
    await project.commitAsync();

    res.json({
        success: true,
        task: {
            id: task.id,
            startDate: task.startDate,
            endDate: task.endDate
        }
    });
});

app.listen(3000);
```

---

## 5. Batch Processing

### 5.1 Multiple Projects

```javascript
const { ProjectModel } = require('@bryntum/gantt/gantt.node.cjs');

async function processProjects(projectsData) {
    const results = [];

    for (const data of projectsData) {
        const project = new ProjectModel({
            tasksData: data.tasks,
            dependenciesData: data.dependencies
        });

        await project.commitAsync();

        results.push({
            projectId: data.id,
            endDate: project.endDate,
            criticalPath: project.taskStore.query(t => t.critical).map(t => t.id)
        });

        // Cleanup
        project.destroy();
    }

    return results;
}
```

### 5.2 What-if Analysis

```javascript
async function whatIfAnalysis(baseProject, scenarios) {
    const results = [];

    for (const scenario of scenarios) {
        // Clone project data
        const projectData = {
            tasksData: JSON.parse(JSON.stringify(baseProject.tasks)),
            dependenciesData: baseProject.dependencies
        };

        // Apply scenario modifications
        scenario.modifications.forEach(mod => {
            const task = projectData.tasksData.find(t => t.id === mod.taskId);
            if (task) {
                Object.assign(task, mod.changes);
            }
        });

        const project = new ProjectModel(projectData);
        await project.commitAsync();

        results.push({
            scenarioId: scenario.id,
            projectEndDate: project.endDate,
            totalDuration: project.duration
        });

        project.destroy();
    }

    return results;
}
```

---

## 6. Critical Path Analysis

### 6.1 Server-side Critical Path

```javascript
async function analyzeCriticalPath(projectData) {
    const project = new ProjectModel({
        tasksData: projectData.tasks,
        dependenciesData: projectData.dependencies
    });

    await project.commitAsync();

    const criticalTasks = project.taskStore.query(task => task.critical);

    return {
        criticalPath: criticalTasks.map(task => ({
            id: task.id,
            name: task.name,
            startDate: task.startDate,
            endDate: task.endDate,
            duration: task.duration,
            totalSlack: task.totalSlack
        })),
        projectDuration: project.duration,
        projectEndDate: project.endDate
    };
}
```

---

## 7. Resource Leveling

### 7.1 Check Resource Conflicts

```javascript
async function checkResourceConflicts(projectData) {
    const project = new ProjectModel({
        tasksData: projectData.tasks,
        resourcesData: projectData.resources,
        assignmentsData: projectData.assignments
    });

    await project.commitAsync();

    const conflicts = [];

    project.resourceStore.forEach(resource => {
        const assignments = resource.assignments;

        // Simple overlap detection
        for (let i = 0; i < assignments.length; i++) {
            for (let j = i + 1; j < assignments.length; j++) {
                const a1 = assignments[i];
                const a2 = assignments[j];

                if (a1.event.startDate < a2.event.endDate &&
                    a1.event.endDate > a2.event.startDate) {
                    conflicts.push({
                        resource: resource.name,
                        task1: a1.event.name,
                        task2: a2.event.name
                    });
                }
            }
        }
    });

    return conflicts;
}
```

---

## 8. Import/Export Processing

### 8.1 MS Project Import (with MPXJ)

```javascript
const { ProjectModel } = require('@bryntum/gantt/gantt.node.cjs');
const { execSync } = require('child_process');
const fs = require('fs');

async function importMSProject(mppFilePath) {
    // Use Java MPXJ converter
    const outputPath = `/tmp/${Date.now()}.json`;

    execSync(`java -jar bryntum-project-reader.jar "${mppFilePath}" "${outputPath}"`);

    const jsonData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

    const project = new ProjectModel({
        tasksData: jsonData.tasks,
        dependenciesData: jsonData.dependencies,
        resourcesData: jsonData.resources,
        assignmentsData: jsonData.assignments,
        calendarsData: jsonData.calendars
    });

    await project.commitAsync();

    fs.unlinkSync(outputPath);

    return project;
}
```

### 8.2 Export to JSON

```javascript
async function exportProject(projectId) {
    const project = await loadProjectFromDatabase(projectId);

    return {
        project: {
            startDate: project.startDate,
            endDate: project.endDate,
            calendar: project.calendar?.id
        },
        tasks: project.taskStore.allRecords.map(t => t.data),
        dependencies: project.dependencyStore.allRecords.map(d => d.data),
        resources: project.resourceStore.allRecords.map(r => r.data),
        assignments: project.assignmentStore.allRecords.map(a => a.data)
    };
}
```

---

## 9. Scheduling Scenarios

### 9.1 Forward Scheduling

```javascript
const project = new ProjectModel({
    direction: 'Forward',
    startDate: '2024-01-15',
    tasksData: [...]
});
```

### 9.2 Backward Scheduling

```javascript
const project = new ProjectModel({
    direction: 'Backward',
    endDate: '2024-06-30',
    tasksData: [...]
});
```

---

## 10. Memory Management

### 10.1 Cleanup

```javascript
async function processAndCleanup(data) {
    const project = new ProjectModel(data);

    try {
        await project.commitAsync();
        return extractResults(project);
    }
    finally {
        // Always destroy to prevent memory leaks
        project.destroy();
    }
}
```

### 10.2 Batch with Cleanup

```javascript
async function processBatch(items, batchSize = 10) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        for (const item of batch) {
            const project = new ProjectModel(item);
            await project.commitAsync();
            results.push(extractResults(project));
            project.destroy();
        }

        // Force garbage collection if available
        if (global.gc) global.gc();
    }

    return results;
}
```

---

## 11. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Memory | Destroy projects na gebruik |
| Async | Gebruik altijd `commitAsync()` |
| Error Handling | Wrap in try/catch |
| Batch Size | Limiteer concurrent projects |
| Cleanup | Verwijder temp files |

---

## Zie Ook

- [INTEGRATION-WEBSOCKETS.md](./INTEGRATION-WEBSOCKETS.md) - Real-time sync
- [INTEGRATION-MS-PROJECT.md](./INTEGRATION-MS-PROJECT.md) - MPP import
- [GANTT-API-PROJECTMODEL.md](./GANTT-API-PROJECTMODEL.md) - ProjectModel API

---

*Track C - Integraties - Node.js Server-side*
