# Gantt Implementation: Resource Assignment

> **Resource toewijzing** met ResourceAssignmentColumn, AssignmentField editor, assignment units, filtering op resources, en effort-driven scheduling.

---

## Overzicht

Resource Assignment beheert de koppeling tussen taken en resources. Elke assignment kan units (percentage beschikbaarheid) en effort specificeren.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Task               │ Resources              │ Units │ Effort │ Duration │
├──────────────────────────────────────────────────────────────────────────┤
│ Development        │ 👤 John, 👤 Jane       │  150% │  120h  │   10d    │
│ Code Review        │ 👤 Mike (50%)          │   50% │   20h  │    5d    │
│ Testing            │ 👤 Sarah               │  100% │   40h  │    5d    │
│ Documentation      │ 👤 John (25%), 👤 Jane │  125% │   50h  │    5d    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Basis Configuratie

### 1.1 ResourceAssignment Column

```javascript
import { Gantt, ProjectModel, AssignmentField } from '@bryntum/gantt';

const project = new ProjectModel({
    loadUrl: '/api/project',
    autoLoad: true
});

const gantt = new Gantt({
    appendTo: 'container',
    project,

    resourceImagePath: '/images/users/',

    columns: [
        { type: 'name', field: 'name', width: 250 },
        {
            type: 'resourceassignment',
            text: 'Resources',
            width: 250,
            showAvatars: true
        }
    ]
});
```

### 1.2 Column Opties

```javascript
{
    type: 'resourceassignment',
    text: 'Assigned To',
    width: 300,

    // Avatar opties
    showAvatars: true,
    avatarSize: 32,

    // Toon units naast naam
    showUnits: true,

    // Editor configuratie
    editor: {
        type: AssignmentField.type,
        picker: {
            height: 350,
            width: 450
        }
    }
}
```

---

## 2. AssignmentField Editor

### 2.1 Editor Configuratie

```javascript
{
    type: 'resourceassignment',
    editor: {
        type: AssignmentField.type,
        picker: {
            height: 400,
            width: 500,

            features: {
                filterBar: true,        // Filter resources
                group: 'resource.city', // Groepeer op veld
                headerMenu: false,      // Geen header context menu
                cellMenu: false         // Geen cell context menu
            },

            items: {
                // Extra kolommen in picker
                workTab: {
                    columns: [
                        {
                            text: 'Calendar',
                            field: 'resource.calendar.name',
                            filterable: false,
                            editor: false,
                            width: 100
                        },
                        {
                            text: 'Department',
                            field: 'resource.department',
                            width: 120
                        }
                    ]
                }
            }
        }
    }
}
```

### 2.2 Multi-Tab Picker

```javascript
// AssignmentField heeft tabs voor verschillende resource types
picker: {
    items: {
        // Work resources tab
        workTab: {
            title: 'Team Members',
            columns: [
                { text: 'Name', field: 'resource.name' },
                { text: 'Role', field: 'resource.role' },
                { text: 'Units', field: 'units', type: 'percent', editor: true }
            ]
        },

        // Material resources tab
        materialTab: {
            title: 'Equipment',
            hidden: false
        }
    }
}
```

---

## 3. Data Model

### 3.1 Resource Data

```javascript
resourcesData: [
    {
        id: 'r1',
        name: 'John Smith',
        role: 'Developer',
        city: 'Amsterdam',
        calendar: 'standard',
        image: 'john.jpg'  // Avatar image
    },
    {
        id: 'r2',
        name: 'Jane Doe',
        role: 'Designer',
        city: 'Rotterdam',
        calendar: 'standard',
        image: 'jane.jpg'
    },
    {
        id: 'r3',
        name: 'Mike Wilson',
        role: 'Tester',
        city: 'Amsterdam',
        calendar: 'part-time'
    }
]
```

### 3.2 Assignment Data

```javascript
assignmentsData: [
    {
        id: 'a1',
        event: 1,        // Task ID (of 'task')
        resource: 'r1',  // Resource ID
        units: 100       // 100% toegewezen
    },
    {
        id: 'a2',
        event: 1,
        resource: 'r2',
        units: 50        // 50% toegewezen
    },
    {
        id: 'a3',
        event: 2,
        resource: 'r1',
        units: 25        // 25% voor deze taak
    }
]
```

### 3.3 Task met Inline Assignments

```javascript
tasksData: [
    {
        id: 1,
        name: 'Development',
        startDate: '2024-02-01',
        duration: 10,

        // Inline assignment definitie
        assignments: [
            { resource: 'r1', units: 100 },
            { resource: 'r2', units: 50 }
        ]
    }
]
```

---

## 4. Resource Filtering

### 4.1 Filter op Resource

```javascript
tbar: [
    {
        type: 'resourcecombo',
        placeholder: 'Filter by resource...',
        width: 250,
        multiSelect: true,
        store: project.resourceStore.chain(),

        onChange({ source }) {
            const selectedResources = source.records;

            if (selectedResources.length === 0) {
                // Verwijder filter
                gantt.taskStore.removeFilter('resource');
            }
            else {
                // Filter taken op geselecteerde resources
                gantt.taskStore.filter({
                    id: 'resource',
                    filterBy: task => {
                        return task.resources.some(resource =>
                            selectedResources.includes(resource)
                        );
                    }
                });
            }
        }
    }
]
```

### 4.2 Resource Combo Widget

```javascript
{
    type: 'resourcecombo',
    label: 'Assigned to',
    width: 300,
    multiSelect: true,

    // Custom display
    chipView: {
        iconTpl: resource => `<img src="${resource.image}" class="avatar"/>`,
        closable: true
    },

    // Picker customization
    picker: {
        features: {
            group: 'role'  // Groepeer op rol
        }
    }
}
```

---

## 5. Assignment Units

### 5.1 Units Column

```javascript
{
    text: 'Total Units',
    width: 100,
    renderer({ record }) {
        // Bereken totale toewijzing
        const totalUnits = record.assignments?.reduce(
            (sum, a) => sum + (a.units || 100),
            0
        ) || 0;

        const cls = totalUnits > 100 ? 'over-allocated' : '';

        return {
            class: cls,
            text: `${totalUnits}%`
        };
    }
}
```

### 5.2 Assignment Units Editing

```javascript
// In task editor
features: {
    taskEdit: {
        items: {
            resourcesTab: {
                items: {
                    // Resources grid met units editing
                    resources: {
                        type: 'grid',
                        columns: [
                            { text: 'Resource', field: 'resource.name', flex: 1 },
                            {
                                text: 'Units',
                                field: 'units',
                                type: 'percent',
                                width: 80,
                                editor: {
                                    type: 'number',
                                    min: 0,
                                    max: 100,
                                    step: 25
                                }
                            }
                        ]
                    }
                }
            }
        }
    }
}
```

---

## 6. Effort-Driven Scheduling

### 6.1 Scheduling Modes

```javascript
// Fixed Duration: duur blijft constant, units bepalen effort
{
    name: 'Fixed Duration Task',
    duration: 10,
    schedulingMode: 'FixedDuration'
}

// Fixed Effort: effort blijft constant, meer resources = kortere duur
{
    name: 'Fixed Effort Task',
    effort: 80,              // 80 uur werk
    effortUnit: 'hour',
    schedulingMode: 'FixedEffort'
}

// Fixed Units: units blijven constant
{
    name: 'Fixed Units Task',
    duration: 10,
    schedulingMode: 'FixedUnits'
}
```

### 6.2 Effort Calculation

```javascript
// Effort = Duration × Units
// Bij 2 resources van 100%: 10 dagen × 200% = 160 uur effort

class EffortTaskModel extends TaskModel {
    // Bereken effort uit duration en assignments
    get calculatedEffort() {
        if (!this.assignments?.length) return 0;

        const totalUnits = this.assignments.reduce(
            (sum, a) => sum + (a.units || 100),
            0
        ) / 100;

        const hoursPerDay = this.project?.hoursPerDay || 8;

        return this.duration * totalUnits * hoursPerDay;
    }
}
```

---

## 7. Resource Visualization

### 7.1 Resource Avatars in Task Bar

```javascript
features: {
    taskTooltip: {
        template({ taskRecord }) {
            const resources = taskRecord.resources;

            return `
                <div class="task-tooltip">
                    <h4>${taskRecord.name}</h4>
                    <div class="resources">
                        ${resources.map(r => `
                            <div class="resource">
                                <img src="${r.image}" class="avatar"/>
                                <span>${r.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
}
```

### 7.2 Task Bar Labels

```javascript
// Toon resource namen in taakbalk
taskRenderer({ taskRecord }) {
    const resources = taskRecord.resources;

    return {
        children: [
            {
                class: 'task-content',
                children: [
                    { tag: 'span', class: 'task-name', text: taskRecord.name },
                    {
                        class: 'task-resources',
                        text: resources.map(r => r.name).join(', ')
                    }
                ]
            }
        ]
    };
}
```

---

## 8. Assignment Events

### 8.1 Listen naar Changes

```javascript
project.assignmentStore.on({
    add({ records }) {
        records.forEach(assignment => {
            console.log(
                `${assignment.resource.name} assigned to ${assignment.event.name}`
            );
        });
    },

    remove({ records }) {
        records.forEach(assignment => {
            console.log(
                `${assignment.resource.name} removed from ${assignment.event.name}`
            );
        });
    },

    update({ record, changes }) {
        if ('units' in changes) {
            console.log(
                `${record.resource.name} units changed to ${record.units}%`
            );
        }
    }
});
```

### 8.2 Validation

```javascript
project.on({
    beforeAssignmentAdd({ assignmentRecord }) {
        const task = assignmentRecord.event;
        const resource = assignmentRecord.resource;

        // Check resource beschikbaarheid
        const existingLoad = calculateResourceLoad(resource, task.startDate, task.endDate);

        if (existingLoad + assignmentRecord.units > 100) {
            Toast.show({
                html: `${resource.name} would be over-allocated`,
                color: 'b-amber'
            });

            // Return false om assignment te blokkeren
            return false;
        }
    }
});

function calculateResourceLoad(resource, startDate, endDate) {
    // Bereken huidige load voor periode
    const overlappingAssignments = project.assignmentStore.query(a => {
        if (a.resourceId !== resource.id) return false;

        const task = a.event;
        return task.startDate < endDate && task.endDate > startDate;
    });

    return overlappingAssignments.reduce((sum, a) => sum + a.units, 0);
}
```

---

## 9. Resource Histogram

### 9.1 Histogram Widget

```javascript
import { ResourceHistogram } from '@bryntum/gantt';

const histogram = new ResourceHistogram({
    appendTo: 'histogram-container',
    project,

    columns: [
        { type: 'resourceInfo', width: 200 },
        {
            text: 'Assignments',
            width: 80,
            renderer({ record }) {
                return record.assignments?.length || 0;
            }
        }
    ],

    // Toon overallocatie
    showBarTip: true,

    // Click op bar toont taken
    onBarClick({ resourceRecord, startDate, endDate }) {
        showAssignmentsForPeriod(resourceRecord, startDate, endDate);
    }
});
```

### 9.2 Histogram Styling

```css
/* Normal allocation */
.b-histogram-bar {
    fill: #4CAF50;
}

/* Over-allocated */
.b-histogram-bar.over-allocated {
    fill: #F44336;
}

/* Under-utilized */
.b-histogram-bar.under-utilized {
    fill: #FFC107;
}
```

---

## 10. Programmatic Assignment

### 10.1 CRUD Operations

```javascript
// Assign resource aan taak
function assignResource(taskId, resourceId, units = 100) {
    const task = project.taskStore.getById(taskId);
    const resource = project.resourceStore.getById(resourceId);

    // Methode 1: Via assignment store
    project.assignmentStore.add({
        event: taskId,
        resource: resourceId,
        units
    });

    // Methode 2: Via task
    task.assign(resource, units);
}

// Verwijder assignment
function unassignResource(taskId, resourceId) {
    const task = project.taskStore.getById(taskId);
    const resource = project.resourceStore.getById(resourceId);

    task.unassign(resource);
}

// Update units
function updateAssignmentUnits(taskId, resourceId, newUnits) {
    const assignment = project.assignmentStore.find(a =>
        a.eventId === taskId && a.resourceId === resourceId
    );

    if (assignment) {
        assignment.units = newUnits;
    }
}
```

### 10.2 Bulk Assignment

```javascript
// Assign zelfde resource aan meerdere taken
function assignToMultipleTasks(resourceId, taskIds, units = 100) {
    project.beginBatch();

    taskIds.forEach(taskId => {
        project.assignmentStore.add({
            event: taskId,
            resource: resourceId,
            units
        });
    });

    project.endBatch();
}

// Kopieer assignments naar andere taak
function copyAssignments(fromTaskId, toTaskId) {
    const fromTask = project.taskStore.getById(fromTaskId);
    const toTask = project.taskStore.getById(toTaskId);

    project.beginBatch();

    fromTask.assignments.forEach(assignment => {
        toTask.assign(assignment.resource, assignment.units);
    });

    project.endBatch();
}
```

---

## 11. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useCallback, useMemo } from 'react';

function ResourceGantt({ projectData }) {
    const [selectedResources, setSelectedResources] = useState([]);
    const ganttRef = useRef();

    const columns = useMemo(() => [
        { type: 'name', width: 200 },
        {
            type: 'resourceassignment',
            width: 250,
            showAvatars: true,
            editor: {
                picker: {
                    features: {
                        filterBar: true,
                        group: 'resource.role'
                    }
                }
            }
        },
        { type: 'duration' }
    ], []);

    const handleResourceFilter = useCallback((resources) => {
        setSelectedResources(resources);

        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        if (resources.length === 0) {
            gantt.taskStore.clearFilters();
        }
        else {
            gantt.taskStore.filter({
                id: 'resource',
                filterBy: task => task.resources.some(r =>
                    resources.includes(r.id)
                )
            });
        }
    }, []);

    return (
        <div className="gantt-container">
            <ResourceFilter
                resources={projectData.resources}
                selected={selectedResources}
                onChange={handleResourceFilter}
            />

            <BryntumGantt
                ref={ganttRef}
                columns={columns}
                projectConfig={projectData}
                resourceImagePath="/images/users/"
            />
        </div>
    );
}
```

---

## 12. Styling

```css
/* Resource assignment cell */
.b-resourceassignment-cell {
    display: flex;
    align-items: center;
    gap: 0.5em;
}

/* Resource avatar */
.b-resource-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
}

/* Resource chip */
.b-resource-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25em;
    padding: 0.125em 0.5em;
    background: var(--b-gray-200);
    border-radius: 1em;
    font-size: 0.85em;
}

/* Over-allocated indicator */
.over-allocated {
    color: #f44336;
    font-weight: 600;
}

/* Assignment picker */
.b-assignmentfield-picker {
    .b-grid-row.assigned {
        background: rgba(76, 175, 80, 0.1);
    }
}

/* Units percentage */
.units-badge {
    font-size: 0.75em;
    color: #666;
    margin-left: 0.25em;
}
```

---

## 13. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Resources niet in picker | Store niet geladen | Check resourceStore.data |
| Avatars niet zichtbaar | Pad incorrect | Zet resourceImagePath |
| Assignment niet opgeslagen | Geen persist | Check assignmentStore sync |
| Units reset naar 100 | Default value | Expliciete units in data |
| Filter werkt niet | Verkeerde property | Gebruik task.resources |

---

## API Reference

### ResourceAssignmentColumn

| Property | Type | Description |
|----------|------|-------------|
| `showAvatars` | Boolean | Toon resource avatars |
| `showUnits` | Boolean | Toon assignment units |
| `avatarSize` | Number | Avatar grootte in pixels |

### Assignment Properties

| Property | Type | Description |
|----------|------|-------------|
| `event` / `eventId` | String | Task ID |
| `resource` / `resourceId` | String | Resource ID |
| `units` | Number | Toewijzingspercentage |

### Task Assignment Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `assign` | resource, units | Wijs resource toe |
| `unassign` | resource | Verwijder toewijzing |
| `resources` | - | Array van toegewezen resources |
| `assignments` | - | Array van assignments |

---

## Bronnen

- **Example**: `examples/resourceassignment/`
- **Column**: `Gantt.column.ResourceAssignmentColumn`
- **AssignmentField**: `Gantt.widget.AssignmentField`
- **AssignmentModel**: `Gantt.model.AssignmentModel`

---

*Track A: Foundation - Gantt Extensions (A2.7)*
