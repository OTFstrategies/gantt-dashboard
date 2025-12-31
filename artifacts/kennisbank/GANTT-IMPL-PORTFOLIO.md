# Gantt Implementation: Portfolio Planning

> **Multi-project portfolio** beheer met cross-project dependencies, resource allocation, gecombineerde timeline, en project rollups.

---

## Overzicht

Portfolio planning combineert meerdere projecten in één overzicht voor strategisch resource- en tijdsbeheer. Elk project blijft onafhankelijk maar kan afhankelijkheden hebben met taken uit andere projecten.

```
┌──────────────────────────────────────────────────────────────────────┐
│ Portfolio: Q4 2024                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ ▼ Project Alpha (80%)                                                │
│   ├── Phase 1           ████████████████░░░░                         │
│   ├── Phase 2                          ████████░░░░                  │
│   └── Launch                                    ●                    │
├──────────────────────────────────────────────────────────────────────┤
│ ▼ Project Beta (45%)                                                 │
│   ├── Research          ████████████                                 │
│   ├── Development           ↑─────────████████████░░░░░░░░           │
│   └── Testing              (dependency)        ████████░░░░          │
├──────────────────────────────────────────────────────────────────────┤
│ ▼ Project Gamma (20%)                                                │
│   ├── Planning          ████████                                     │
│   └── Execution                 ████████████████░░░░░░░░             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basis Portfolio Setup

### 1.1 Multi-Project Model

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

// Portfolio bevat meerdere ProjectModels
class PortfolioModel {
    constructor(config) {
        this.projects = [];
        this.masterProject = new ProjectModel({
            // Combineert alle project data
            taskModelClass: PortfolioTaskModel
        });
    }

    async loadProjects(projectIds) {
        const projectData = await Promise.all(
            projectIds.map(id => this.fetchProject(id))
        );

        // Voeg elk project toe als top-level task
        projectData.forEach(data => {
            this.addProject(data);
        });
    }

    addProject(projectData) {
        // Project wordt een parent task
        const projectTask = this.masterProject.taskStore.add({
            id: `project-${projectData.id}`,
            name: projectData.name,
            projectId: projectData.id,
            isProject: true,
            expanded: true,
            children: projectData.tasks
        });

        this.projects.push({
            id: projectData.id,
            rootTask: projectTask,
            data: projectData
        });
    }
}
```

### 1.2 Portfolio Gantt

```javascript
const portfolio = new PortfolioModel();
await portfolio.loadProjects(['alpha', 'beta', 'gamma']);

const gantt = new Gantt({
    appendTo: 'container',
    project: portfolio.masterProject,

    viewPreset: 'monthAndYear',

    columns: [
        {
            type: 'name',
            width: 250,
            renderer({ record }) {
                if (record.isProject) {
                    return {
                        class: 'project-name',
                        children: [
                            { tag: 'i', class: 'fa fa-folder' },
                            record.name
                        ]
                    };
                }
                return record.name;
            }
        },
        {
            text: 'Progress',
            type: 'percentdone',
            width: 100
        },
        {
            text: 'Project',
            field: 'projectId',
            width: 100,
            renderer({ record }) {
                return record.isProject ? '' : record.project?.name;
            }
        }
    ],

    features: {
        rollups: true,
        progressLine: true,
        dependencies: true
    }
});
```

---

## 2. Cross-Project Dependencies

### 2.1 Dependency Configuratie

```javascript
const gantt = new Gantt({
    features: {
        dependencies: {
            // Sta cross-project dependencies toe
            allowCrossProjectDependencies: true
        }
    },

    // Dependency validation
    listeners: {
        beforeDependencyCreateFinalize({ source, target }) {
            // Check of cross-project dependency toegestaan is
            if (source.projectId !== target.projectId) {
                // Alleen finish-to-start voor cross-project
                return { type: 2 }; // FS
            }
        }
    }
});
```

### 2.2 Cross-Project Dependency Data

```javascript
// Dependencies met project-qualified IDs
const dependencies = [
    // Binnen project Alpha
    { fromTask: 'alpha-1', toTask: 'alpha-2', type: 2 },

    // Cross-project: Alpha phase 2 → Beta development
    {
        fromTask: 'alpha-2',
        toTask: 'beta-dev',
        type: 2,
        isCrossProject: true,
        cls: 'cross-project-dep'
    },

    // Cross-project: Beta testing → Gamma execution
    {
        fromTask: 'beta-test',
        toTask: 'gamma-exec',
        type: 2,
        isCrossProject: true
    }
];

// Custom styling voor cross-project dependencies
gantt.dependencyStore.on({
    add({ records }) {
        records.forEach(dep => {
            const fromTask = gantt.taskStore.getById(dep.fromTask);
            const toTask = gantt.taskStore.getById(dep.toTask);

            if (fromTask.projectId !== toTask.projectId) {
                dep.cls = 'cross-project-dep';
            }
        });
    }
});
```

### 2.3 Cross-Project Styling

```css
/* Cross-project dependency lijn */
.cross-project-dep .b-sch-dependency {
    stroke: #ff5722;
    stroke-width: 2;
    stroke-dasharray: 5, 3;
}

.cross-project-dep .b-sch-dependency-arrow {
    fill: #ff5722;
}
```

---

## 3. Project Rollups

### 3.1 Rollup Configuratie

```javascript
features: {
    rollups: {
        // Toon milestones in project row
        showMilestonesInParent: true
    }
}
```

### 3.2 Custom Project Summary

```javascript
// Bereken project-level metrics
class PortfolioTaskModel extends TaskModel {
    static fields = [
        'projectId',
        'isProject',
        {
            name: 'projectProgress',
            persist: false
        },
        {
            name: 'projectBudget',
            persist: false
        }
    ];

    // Override percentDone voor projects
    get percentDone() {
        if (this.isProject) {
            // Bereken van alle children
            const children = this.children || [];
            if (children.length === 0) return 0;

            const totalDuration = children.reduce((sum, t) => sum + t.duration, 0);
            const completedDuration = children.reduce((sum, t) => {
                return sum + (t.duration * (t.percentDone / 100));
            }, 0);

            return totalDuration > 0 ? (completedDuration / totalDuration) * 100 : 0;
        }
        return this._percentDone;
    }
}
```

---

## 4. Resource Allocation Across Projects

### 4.1 Unified Resource Pool

```javascript
// Eén resource pool voor alle projecten
const resourceStore = new ResourceStore({
    data: [
        { id: 'r1', name: 'John', role: 'Developer', capacity: 40 },
        { id: 'r2', name: 'Jane', role: 'Designer', capacity: 40 },
        { id: 'r3', name: 'Mike', role: 'Manager', capacity: 40 }
    ]
});

// Alle projecten delen dezelfde resources
portfolio.masterProject.resourceStore = resourceStore;
```

### 4.2 Cross-Project Resource View

```javascript
// Toon resource allocation over projecten
columns: [
    // ... andere columns
    {
        text: 'Assigned Resources',
        type: 'resourceassignment',
        width: 200
    },
    {
        text: 'Resource Conflict',
        width: 120,
        renderer({ record }) {
            const conflicts = checkResourceConflicts(record);
            if (conflicts.length > 0) {
                return {
                    class: 'conflict-indicator',
                    html: `<i class="fa fa-warning"></i> ${conflicts.length} conflicts`
                };
            }
            return '';
        }
    }
]

function checkResourceConflicts(task) {
    const conflicts = [];
    const assignments = task.assignments || [];

    assignments.forEach(assignment => {
        const resource = assignment.resource;

        // Vind overlappende taken met dezelfde resource
        const overlapping = gantt.taskStore.query(t => {
            if (t === task) return false;
            return t.assignments?.some(a => a.resourceId === resource.id) &&
                   dateRangesOverlap(task, t);
        });

        if (overlapping.length > 0) {
            conflicts.push({ resource, tasks: overlapping });
        }
    });

    return conflicts;
}
```

### 4.3 Resource Histogram

```javascript
// Resource load per project
const histogram = new ResourceHistogram({
    appendTo: 'histogram-container',
    project: portfolio.masterProject,

    columns: [
        { type: 'resourceInfo', width: 200 },
        {
            text: 'Total Assigned',
            width: 100,
            renderer({ record }) {
                return `${record.assignmentCount} tasks`;
            }
        }
    ],

    // Toon project-kleur in bars
    barRenderer({ assignment }) {
        const task = assignment.event;
        const project = findProjectForTask(task);

        return {
            style: {
                background: project.color
            }
        };
    }
});
```

---

## 5. Portfolio Timeline Views

### 5.1 View Presets

```javascript
const gantt = new Gantt({
    viewPreset: 'quarterAndYear',

    tbar: [
        {
            type: 'buttonGroup',
            items: [
                {
                    text: 'Month',
                    pressed: false,
                    onClick: () => gantt.viewPreset = 'monthAndYear'
                },
                {
                    text: 'Quarter',
                    pressed: true,
                    onClick: () => gantt.viewPreset = 'quarterAndYear'
                },
                {
                    text: 'Year',
                    pressed: false,
                    onClick: () => gantt.viewPreset = 'year'
                }
            ]
        }
    ]
});
```

### 5.2 Project Filtering

```javascript
tbar: [
    {
        type: 'combo',
        label: 'Show Projects',
        multiSelect: true,
        store: {
            data: portfolio.projects.map(p => ({
                id: p.id,
                text: p.data.name
            }))
        },
        onChange({ value }) {
            if (value.length === 0) {
                gantt.taskStore.clearFilters();
            }
            else {
                gantt.taskStore.filter({
                    id: 'project-filter',
                    filterBy: task => {
                        // Toon taak als het in geselecteerde project zit
                        const projectId = getProjectId(task);
                        return value.includes(projectId);
                    }
                });
            }
        }
    }
]

function getProjectId(task) {
    // Navigeer naar top om project te vinden
    let current = task;
    while (current.parent && !current.isProject) {
        current = current.parent;
    }
    return current.projectId;
}
```

---

## 6. Project Status Dashboard

### 6.1 Summary Panel

```javascript
const dashboardPanel = new Panel({
    appendTo: 'dashboard-container',

    items: portfolio.projects.map(project => ({
        type: 'container',
        cls: 'project-card',
        html: `
            <div class="project-header">
                <h3>${project.data.name}</h3>
                <span class="status-badge ${getStatusClass(project)}">
                    ${getStatus(project)}
                </span>
            </div>
            <div class="progress-bar">
                <div class="fill" style="width: ${project.rootTask.percentDone}%"></div>
            </div>
            <div class="metrics">
                <div>Tasks: ${project.data.tasks.length}</div>
                <div>Due: ${formatDate(project.rootTask.endDate)}</div>
            </div>
        `
    }))
});

function getStatus(project) {
    const endDate = project.rootTask.endDate;
    const progress = project.rootTask.percentDone;

    if (progress >= 100) return 'Completed';
    if (endDate < new Date() && progress < 100) return 'Overdue';
    if (progress < getExpectedProgress(project)) return 'At Risk';
    return 'On Track';
}
```

### 6.2 Critical Path per Project

```javascript
features: {
    criticalPaths: {
        // Bereken critical path per project
        multipleProjectsSupport: true
    }
}

// Highlight critical path
gantt.on({
    criticalPathsCalculated({ criticalPaths }) {
        // criticalPaths bevat een array per project
        criticalPaths.forEach(path => {
            path.tasks.forEach(task => {
                task.cls = 'critical-task';
            });
        });
    }
});
```

---

## 7. Project CRUD Operations

### 7.1 Add New Project

```javascript
async function addProjectToPortfolio(projectData) {
    // Creëer project task
    const projectTask = gantt.taskStore.add({
        id: `project-${projectData.id}`,
        name: projectData.name,
        projectId: projectData.id,
        isProject: true,
        expanded: true,
        startDate: projectData.startDate,
        children: projectData.tasks || []
    });

    // Track in portfolio
    portfolio.projects.push({
        id: projectData.id,
        rootTask: projectTask,
        data: projectData
    });

    // Refresh views
    gantt.refreshRows();
    updateDashboard();
}
```

### 7.2 Remove Project

```javascript
function removeProjectFromPortfolio(projectId) {
    const projectIndex = portfolio.projects.findIndex(p => p.id === projectId);

    if (projectIndex > -1) {
        const project = portfolio.projects[projectIndex];

        // Verwijder dependencies eerst
        const depsToRemove = gantt.dependencyStore.query(dep => {
            const fromProject = getProjectId(dep.fromTask);
            const toProject = getProjectId(dep.toTask);
            return fromProject === projectId || toProject === projectId;
        });

        gantt.dependencyStore.remove(depsToRemove);

        // Verwijder project task (en children)
        gantt.taskStore.remove(project.rootTask);

        // Update tracking
        portfolio.projects.splice(projectIndex, 1);
    }
}
```

---

## 8. Export & Reporting

### 8.1 Portfolio Export

```javascript
const exportBtn = {
    type: 'button',
    text: 'Export Portfolio',
    menu: {
        items: [
            {
                text: 'PDF Report',
                onClick: () => exportToPDF()
            },
            {
                text: 'Excel',
                onClick: () => exportToExcel()
            },
            {
                text: 'Project Files',
                onClick: () => exportIndividualProjects()
            }
        ]
    }
};

async function exportToPDF() {
    await gantt.features.pdfExport.export({
        exportServer: '/api/export',
        paperFormat: 'A3',
        orientation: 'landscape',
        columns: ['name', 'startDate', 'endDate', 'percentDone'],
        fileName: `portfolio-${Date.now()}.pdf`
    });
}

function exportIndividualProjects() {
    portfolio.projects.forEach(project => {
        const projectData = extractProjectData(project);

        downloadJSON(projectData, `${project.data.name}.json`);
    });
}
```

---

## 9. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useEffect, useMemo, useCallback } from 'react';

function PortfolioGantt({ projectIds }) {
    const [projects, setProjects] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const ganttRef = useRef();

    // Load projects
    useEffect(() => {
        async function loadProjects() {
            const loaded = await Promise.all(
                projectIds.map(id => fetchProject(id))
            );
            setProjects(loaded);
        }
        loadProjects();
    }, [projectIds]);

    // Convert projects to Gantt tasks
    const tasks = useMemo(() => {
        return projects
            .filter(p => selectedProjects.length === 0 || selectedProjects.includes(p.id))
            .map(project => ({
                id: `project-${project.id}`,
                name: project.name,
                isProject: true,
                expanded: true,
                children: project.tasks
            }));
    }, [projects, selectedProjects]);

    return (
        <div className="portfolio-container">
            <div className="controls">
                <ProjectFilter
                    projects={projects}
                    selected={selectedProjects}
                    onChange={setSelectedProjects}
                />
            </div>

            <BryntumGantt
                ref={ganttRef}
                tasks={tasks}
                columns={portfolioColumns}
                features={{
                    rollups: true,
                    dependencies: true,
                    criticalPaths: true
                }}
            />

            <PortfolioDashboard projects={projects} />
        </div>
    );
}
```

---

## 10. Styling

```css
/* Project row styling */
.project-name {
    font-weight: 600;
    font-size: 1.1em;
}

.project-name .fa-folder {
    margin-right: 0.5em;
    color: var(--b-primary-color);
}

/* Project task bar */
.b-gantt-task.is-project {
    background: var(--b-primary-color);
    border-radius: 4px;
    opacity: 0.8;
}

/* Conflict indicator */
.conflict-indicator {
    color: #f44336;
}

/* Dashboard cards */
.project-card {
    background: white;
    border-radius: 8px;
    padding: 1em;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-badge {
    padding: 0.25em 0.75em;
    border-radius: 1em;
    font-size: 0.85em;
}

.status-badge.on-track { background: #e8f5e9; color: #2e7d32; }
.status-badge.at-risk { background: #fff3e0; color: #ef6c00; }
.status-badge.overdue { background: #ffebee; color: #c62828; }
.status-badge.completed { background: #e3f2fd; color: #1565c0; }

.progress-bar {
    height: 8px;
    background: #eee;
    border-radius: 4px;
    margin: 0.5em 0;
}

.progress-bar .fill {
    height: 100%;
    background: var(--b-primary-color);
    border-radius: 4px;
    transition: width 0.3s;
}
```

---

## 11. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Cross-project deps niet zichtbaar | allowCrossProjectDependencies false | Enable in features |
| Resource conflicts niet gedetecteerd | Geen overlap check | Implement dateRangesOverlap |
| Project progress incorrect | Children niet geladen | Expand project eerst |
| Performance issues | Te veel projecten | Implement lazy loading |

---

## 12. API Reference

### PortfolioModel Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `loadProjects` | projectIds[] | Laad meerdere projecten |
| `addProject` | projectData | Voeg project toe |
| `removeProject` | projectId | Verwijder project |
| `getProjectForTask` | task | Vind parent project |

### Cross-Project Dependency Properties

| Property | Type | Description |
|----------|------|-------------|
| `isCrossProject` | Boolean | Is cross-project dependency |
| `fromProjectId` | String | Source project ID |
| `toProjectId` | String | Target project ID |

---

## Bronnen

- **Example**: `examples/portfolio-planning/`
- **ProjectModel**: `Gantt.model.ProjectModel`
- **Rollups Feature**: `Gantt.feature.Rollups`

---

*Track A: Foundation - Gantt Extensions (A2.2)*
