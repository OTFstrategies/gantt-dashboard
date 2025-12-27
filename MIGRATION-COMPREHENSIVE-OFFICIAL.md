# Bryntum Migration Guides - Complete Official Documentation

> **Bron**: Officiële Bryntum Gantt v7.1.0 documentatie - `docs/data/Gantt/guides/migration/`

---

## Overview

Dit document bevat alle officiële Bryntum migration guides voor het migreren van andere Gantt-producten naar Bryntum Gantt.

---

## 1. Migrate from Ext JS Gantt

### Introduction

Bryntum Gantt is de moderne opvolger van Ext JS Gantt. De migratie richt zich op het Advanced Example dat veel complexiteit en features bevat.

### Key Differences

| Aspect | Ext JS Gantt | Bryntum Gantt |
|--------|--------------|---------------|
| Application concept | `Ext.Application` | Geen - plain JS widget |
| Sizing | JS-based layout | CSS flexbox |
| Package manager | Sencha Cmd | npm/Vite |
| Project Model | `Gnt.model.Project` | `ProjectModel` wrapper class |
| Plugins vs Features | Both | Only features |
| State tracking | External | Built-in STM |

### Config Migration

**Ext JS Config:**
```javascript
Ext.define('Gnt.examples.advanced.view.Gantt', {
    showTodayLine: true,
    loadMask: true,
    enableProgressBarResize: true,
    showRollupTasks: true,
    rowHeight: 30,
    viewPreset: 'weekAndDayLetter',
    lockedGridConfig: { width: 400 }
});
```

**Bryntum Config:**
```javascript
{
    type: 'gantt',
    flex: 1,
    project,
    rowHeight: 30,
    barMargin: 3,
    viewPreset: 'weekAndDayLetter',
    features: {
        timeRanges: { showCurrentTimeLine: true },
        rollups: true,
        labels: { left: { field: 'name' } },
        pan: true,
        progressLine: { disabled: true },
        dependencyEdit: true
    },
    subGridConfigs: { locked: { width: 400 } }
}
```

### Field Name Changes (camelCase)

| Ext JS | Bryntum |
|--------|---------|
| `Id` | `id` |
| `Name` | `name` |
| `StartDate` | `startDate` |
| `EndDate` | `endDate` |
| `Duration` | `duration` |
| `PercentDone` | `percentDone` |
| `TaskId` | `taskId` |
| `ResourceId` | `resourceId` |
| `From` | `fromTask` |
| `To` | `toTask` |

### Data Package Changes

- **Baselines**: Now an array structure
- **TaskType**: No longer supported
- **leaf field**: Not required
- **Calendars**: New `intervals` syntax
- **Dependencies**: `From/To` → `fromTask/toTask`
- **Assignments**: `TaskId/ResourceId` → `event/resource`

### Scheduling Modes

| Ext JS | Bryntum |
|--------|---------|
| `EffortDriven` | `FixedEffort` |
| `DynamicAssignment` | `FixedDuration` + `effortDriven: true` |
| - | `FixedUnits` (new) |

### Calendar Data Format

**New Bryntum Format:**
```json
{
    "calendars": {
        "rows": [{
            "id": "general",
            "name": "General",
            "intervals": [
                {
                    "recurrentStartDate": "on Sat",
                    "recurrentEndDate": "on Mon",
                    "isWorking": false
                },
                {
                    "name": "Holiday",
                    "startDate": "2017-02-01",
                    "endDate": "2017-02-02",
                    "isWorking": false,
                    "cls": "holiday"
                }
            ]
        }]
    }
}
```

### Localization Setup

```javascript
// Create locale files
import { LocaleHelper } from '@bryntum/gantt';
import '@bryntum/gantt/locales/gantt.locale.Es';

const locale = {
    localeName: 'Es',
    localeDesc: 'Español',
    localeCode: 'es',
    // Custom translations
    Button: { Settings: 'Ajustes' }
};

export default LocaleHelper.publishLocale(locale);
```

---

## 2. Migrate from DevExpress Gantt

### Overview Steps

1. Set up frontend app (React + Bryntum template)
2. Set up backend API (Fastify + Prisma + MySQL)
3. Prepare DevExpress API for data export
4. Import data from DevExpress to Bryntum

### Database Schema

**Bryntum Tasks Table:**
```sql
CREATE TABLE Task (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parentId INT NULL,
    name VARCHAR(255),
    startDate DATETIME,
    endDate DATETIME,
    effort FLOAT DEFAULT NULL,
    effortUnit VARCHAR(255) DEFAULT 'hour',
    duration FLOAT,
    durationUnit VARCHAR(255) DEFAULT 'day',
    percentDone FLOAT DEFAULT 0,
    schedulingMode VARCHAR(255),
    note TEXT,
    constraintType VARCHAR(255),
    constraintDate DATETIME,
    manuallyScheduled TINYINT DEFAULT 0,
    expanded TINYINT DEFAULT 0
);
```

**Bryntum Dependencies Table:**
```sql
CREATE TABLE Dependency (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fromEvent INT,
    toEvent INT,
    type INT DEFAULT 2,
    lag FLOAT DEFAULT 0,
    lagUnit VARCHAR(255) DEFAULT 'day',
    active BOOLEAN DEFAULT TRUE
);
```

### API Endpoints

**Load Endpoint:**
```typescript
server.get("/load", async (_req, _res) => {
    const tasks = await prisma.task.findMany();
    const dependencies = await prisma.dependency.findMany();
    const resources = await prisma.resource.findMany();
    const assignments = await prisma.resourceAssignment.findMany();

    _res.send({
        success: true,
        tasks: { rows: tasks },
        dependencies: { rows: dependencies },
        resources: { rows: resources },
        assignments: { rows: assignments }
    });
});
```

**Sync Endpoint:**
```typescript
server.post("/sync", async (_req, _res) => {
    const { requestId, tasks, dependencies, resources, assignments } = _req.body;

    const response = { requestId, success: true };

    if (tasks) {
        const rows = await applyTableChanges(prisma.task, tasks);
        if (rows) response.tasks = { rows };
    }
    // Similar for dependencies, resources, assignments

    _res.send(response);
});
```

### Data Mapping

```javascript
const mappedTasks = tasks.map(task => ({
    id: task.id,
    parentId: task.parent_id,
    name: task.title,
    startDate: task.start,
    endDate: task.end,
    percentDone: task.progress,
    note: task.description,
    constraintType: "startnoearlierthan",
    constraintDate: task.start
}));
```

---

## 3. Migrate from Syncfusion Gantt

### Database Migration

**Create Bryntum Tables:**
```sql
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parentId INT DEFAULT NULL,
    name VARCHAR(255),
    startDate DATETIME,
    endDate DATETIME,
    effort FLOAT(11,2),
    effortUnit VARCHAR(255) DEFAULT 'hour',
    duration FLOAT(11,2) UNSIGNED,
    durationUnit VARCHAR(255) DEFAULT 'day',
    percentDone FLOAT(11,2) UNSIGNED DEFAULT 0,
    schedulingMode VARCHAR(255) DEFAULT 'Normal',
    constraintType VARCHAR(255),
    constraintDate DATETIME,
    manuallyScheduled TINYINT DEFAULT 0,
    expanded TINYINT DEFAULT 0,
    CONSTRAINT fk_tasks_tasks FOREIGN KEY (parentId) REFERENCES tasks(id) ON DELETE CASCADE
);
```

### Predecessor Parsing (Syncfusion → Bryntum)

```javascript
const predecessorRegExp = /\s*(\d+)\s*(?:(SS|SF|FS|FF)(?:\s*([-+]?\d+)\s*)?)?,?/g;
const typeMap = { SS: 0, SF: 1, FS: 2, FF: 3 };

for (const { TaskID, Predecessor } of tasks) {
    while (parts = predecessorRegExp.exec(Predecessor)) {
        await db.query('INSERT INTO dependencies SET ?', {
            fromEvent: parseInt(parts[1]),
            toEvent: TaskID,
            type: typeMap[parts[2]] || 2,
            lag: parseFloat(parts[3] || 0)
        });
    }
}
```

### Data Migration Script

```javascript
await db.query(`
    INSERT INTO tasks (id, parentId, name, startDate, endDate, effort, duration, percentDone, constraintType, constraintDate, parentIndex, expanded)
    SELECT
        TaskID,
        IF(ParentID = 0, NULL, ParentID),
        TaskName,
        StartDate,
        DATE_ADD(StartDate, INTERVAL Duration DAY),
        Duration * 24,
        Duration,
        Progress * 100,
        'startnoearlierthan',
        StartDate,
        ParentID,
        1
    FROM syncTasks
`);
```

---

## 4. Migrate from DHTMLX Gantt

### Key Differences

| DHTMLX | Bryntum |
|--------|---------|
| URL encoded data | JSON POST body |
| `gantt_tasks` table | `tasks` table |
| `gantt_links` table | `dependencies` table |
| Separate CRUD endpoints | Single `/sync` endpoint |

### Dependency Type Mapping

```sql
INSERT INTO dependencies (id, fromEvent, toEvent, type)
SELECT id, source, target,
    CASE type
        WHEN 'finish_to_start' THEN 2
        WHEN 'start_to_start' THEN 0
        WHEN 'finish_to_finish' THEN 3
        WHEN 'start_to_finish' THEN 1
        ELSE 2
    END
FROM gantt_links;
```

### Client Setup

```javascript
import { Gantt, ProjectModel } from './gantt/gantt.module.js';

const project = new ProjectModel({
    taskStore: { transformFlatData: true },
    loadUrl: '/load',
    syncUrl: '/sync',
    autoLoad: true,
    autoSync: true
});

const gantt = new Gantt({
    appendTo: document.body,
    project,
    columns: [
        { type: 'name', width: 250, text: 'Tasks' },
        { type: 'startdate' },
        { type: 'duration' }
    ]
});
```

---

## 5. Common Migration Patterns

### PhantomId Handling

Nieuwe records hebben een client-side `$PhantomId` die wordt vervangen door server `id`:

```javascript
function createOperation(added, table) {
    return Promise.all(
        added.map(async record => {
            const { $PhantomId, baselines, from, to, segments, ...data } = record;
            const [result] = await db.query('INSERT INTO ?? SET ?', [table, data]);
            return { $PhantomId, id: result.insertId };
        })
    );
}
```

### Sync Response Format

```json
{
    "requestId": 124,
    "success": true,
    "tasks": {
        "rows": [
            { "$PhantomId": "task-321", "id": 17 }
        ]
    }
}
```

### Error Handling

```javascript
try {
    // ... operations
    res.send({ requestId, success: true });
} catch (error) {
    res.send({
        requestId,
        success: false,
        message: error.message
    });
}
```

---

## Quick Reference

### NPM Setup

```bash
npm config set @bryntum:registry https://npm.bryntum.com
npm login --registry=https://npm.bryntum.com
npm install @bryntum/gantt
```

### React Template

```bash
npx create-react-app my-app --template @bryntum/cra-template-javascript-gantt
```

### Vite Setup

```bash
npm create vite@latest gantt-app
cd gantt-app
npm install @bryntum/gantt
```

### CSS Import

```css
@import './node_modules/@bryntum/gantt/gantt.css';
@import './node_modules/@bryntum/gantt/svalbard-light.css';
```

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
