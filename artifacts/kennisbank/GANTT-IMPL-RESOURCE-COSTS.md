# Bryntum Gantt: Resource Costs Implementation

> **Implementatie guide** voor kostenberekening in Bryntum Gantt: resource types, rate tables, cost accrual, en cost rollup.

---

## Overzicht

Het kostensysteem in Bryntum Gantt biedt:
- **Multi-level Costs** - Assignment → Task → Resource → Project
- **Resource Types** - Work, Material, Cost
- **Rate Tables** - Meerdere tarieven per resource
- **Cost Accrual** - Prorated, Start, End timing
- **Automatic Rollup** - Kosten rollen automatisch op naar parents

---

## 1. Resource Types

### 1.1 Type Overzicht

| Type | Beschrijving | Kosten Basis |
|------|--------------|--------------|
| `work` | Arbeider of equipment | Effort × Rate |
| `material` | Materiaal verbruik | Quantity × Rate |
| `cost` | Fixed cost item | Direct bedrag |

### 1.2 Resource Type Definition

```javascript
project.resourceStore.add([
    {
        id: 1,
        name: 'Developer',
        type: 'work'  // default
    },
    {
        id: 2,
        name: 'Cement',
        type: 'material'
    },
    {
        id: 3,
        name: 'Airfare',
        type: 'cost'
    }
]);
```

---

## 2. Cost Resources

### 2.1 Simple Cost Assignment

```javascript
// Create cost resources
const [airfare, lodging] = project.resourceStore.add([
    { type: 'cost', name: 'Airfare' },
    { type: 'cost', name: 'Lodging' }
]);

// Assign with cost values
project.assignmentStore.add([
    { event: task1, resource: airfare, cost: 250 },
    { event: task1, resource: lodging, cost: 1000 }
]);

await project.commitAsync();

// Task cost is sum of assignments
console.log(task1.cost);  // 1250
```

### 2.2 Cost Resources voor Totals

```javascript
// Get total airfare across project
console.log(airfare.cost);  // Sum of all airfare assignments

// Get total lodging
console.log(lodging.cost);
```

---

## 3. Rate Tables

### 3.1 Concept

Rate tables bevatten tarieven met ingangsdatums:
- Resource kan meerdere rate tables hebben
- Elke table kan meerdere rates hebben (historisch)
- Assignment kiest welke table te gebruiken

### 3.2 Data Structure

```json
{
    "resources": {
        "rows": [{
            "id": 1,
            "name": "Celia",
            "type": "work",
            "defaultRateTable": 101,
            "costAccrual": "start",
            "rateTables": [
                {
                    "id": 101,
                    "name": "Default",
                    "rates": [{
                        "id": 1,
                        "startDate": "2025-01-01",
                        "standardRate": 40,
                        "standardRateEffortUnit": "hour",
                        "perUseCost": 5
                    }]
                },
                {
                    "id": 199,
                    "name": "20% off",
                    "rates": [{
                        "id": 2,
                        "startDate": "2025-01-01",
                        "standardRate": 32,
                        "standardRateEffortUnit": "hour",
                        "perUseCost": 4
                    }]
                }
            ]
        }]
    }
}
```

### 3.3 Rate Table API

```javascript
// Add rate table to resource
const rateTable = worker.addRateTable({
    name: 'Holiday rates',
    rates: [{
        startDate: new Date(),
        standardRate: 50
    }]
})[0];

// Add rate to existing table
rateTable.addRate({
    startDate: new Date(2025, 6, 1),
    standardRate: 55
});

// Or via rates store
rateTable.rates.add({
    startDate: new Date(2025, 6, 1),
    standardRate: 55
});
```

### 3.4 Assign Rate Table to Assignment

```javascript
// Use specific rate table
assignment.rateTable = rateTable;

// Or via setter (returns Promise)
await assignment.setRateTable(rateTable);

// Remove rate table (no cost calculation)
assignment.rateTable = null;
```

### 3.5 Default Rate Table

```javascript
// Set default for future assignments
resource.defaultRateTable = rateTable;

// New assignments will use this table automatically
```

---

## 4. Work Resources

### 4.1 Cost Calculation

```
Cost = Effort × Rate + Per Use Cost
```

### 4.2 Example

```javascript
// Resource: $20/hour, $10 per use
// Task: 8 hours effort
// Cost = (8 × $20) + $10 = $170
```

### 4.3 Effort-based Rate

```json
{
    "standardRate": 40,
    "standardRateEffortUnit": "hour",
    "perUseCost": 5
}
```

---

## 5. Material Resources

### 5.1 Cost Calculation

```
Cost = Quantity × Rate + Per Use Cost
```

### 5.2 Example

```javascript
// Resource: Cement at $155/ton, $20 per delivery
// Assignment: 2 tons
// Cost = (2 × $155) + $20 = $330
```

### 5.3 Assignment Quantity

```json
{
    "event": 1,
    "resource": 2,
    "quantity": 2.5
}
```

---

## 6. Cost Accrual

### 6.1 Accrual Types

| Type | Beschrijving |
|------|--------------|
| `prorated` | Kosten verdeeld over task duration (default) |
| `start` | Alle kosten bij task start |
| `end` | Alle kosten bij task end |

### 6.2 Resource Level Setting

```javascript
resource.costAccrual = 'start';
```

### 6.3 Effect op Resource Utilization

```javascript
// Utilization view shows cost distribution
new ResourceUtilization({
    series: {
        cost: { disabled: false },
        quantity: { disabled: false }
    },
    rowHeight: 45
});
```

---

## 7. Cost Rollup

### 7.1 Automatic Rollup Chain

```
Assignment.cost
    → Task.cost (sum of assignment costs)
        → Parent Task.cost (sum of children costs)
            → Project.cost (sum of all task costs)

Assignment.cost
    → Resource.cost (sum of all resource assignments)
```

### 7.2 Access Cost Values

```javascript
await project.commitAsync();

// Assignment level
console.log(assignment.cost);

// Task level
console.log(task.cost);

// Resource level (total for resource)
console.log(resource.cost);

// Project level (total)
console.log(project.cost);
```

---

## 8. UI Integration

### 8.1 Resource Editor

```javascript
const resourceGrid = new ResourceGrid({
    features: {
        resourceEdit: true  // Enable resource editor popup
    }
});
```

Resource editor heeft "Costs" tab voor rate table beheer.

### 8.2 Task Editor Resources Tab

Task editor toont:
- Rate Table column (voor work/material)
- Cost column (voor cost resources)
- Quantity column (voor material resources)

### 8.3 Rate Table Editor Trigger

In task editor kan "Edit rate table" icon rate table editor openen.

---

## 9. Rate Table Editor Widget

```javascript
import { ResourceRateTableEditor } from '@bryntum/gantt';

const editor = new ResourceRateTableEditor({
    record: rateTable
});
```

---

## 10. Multiple Rates Over Time

### 10.1 Historical Rates

```json
{
    "name": "Developer rates",
    "rates": [
        {
            "startDate": "2024-01-01",
            "standardRate": 40
        },
        {
            "startDate": "2024-07-01",
            "standardRate": 45
        },
        {
            "startDate": "2025-01-01",
            "standardRate": 50
        }
    ]
}
```

### 10.2 Rate Selection

Gantt selecteert automatisch de juiste rate op basis van task datum.

---

## 11. Cost Columns

### 11.1 Task Cost Column

```javascript
columns: [
    { type: 'cost', field: 'cost', text: 'Cost' }
]
```

### 11.2 Resource Cost Column

```javascript
// In ResourceGrid
columns: [
    { field: 'cost', text: 'Total Cost' }
]
```

---

## 12. Async Cost Updates

### 12.1 Wait for Calculation

```javascript
// Set rate table
assignment.rateTable = rateTable1;

// Kosten zijn nog niet berekend!
// Wacht op commitAsync
await project.commitAsync();

// Nu zijn kosten beschikbaar
console.log('Assignment cost:', assignment.cost);
console.log('Task cost:', task.cost);
console.log('Project cost:', project.cost);
```

### 12.2 Alternative: setRateTable

```javascript
// setRateTable returns Promise
await assignment.setRateTable(rateTable1);

// Kosten zijn nu berekend
console.log(assignment.cost);
```

---

## 13. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Default Rate Table | Stel in voor consistente nieuwe assignments |
| Cost Resources | Gebruik voor fixed costs (travel, permits) |
| Material Quantity | Vergeet niet quantity in te vullen |
| Accrual | Kies juiste type voor financiële rapportage |
| Async | Wacht altijd op commitAsync voor cost reads |

---

## 14. Example: Complete Cost Setup

```javascript
import { ProjectModel, Gantt } from '@bryntum/gantt';

const project = new ProjectModel({
    resourcesData: [
        {
            id: 1,
            name: 'Developer',
            type: 'work',
            costAccrual: 'prorated',
            defaultRateTable: 101,
            rateTables: [{
                id: 101,
                name: 'Standard',
                rates: [{
                    startDate: '2024-01-01',
                    standardRate: 75,
                    standardRateEffortUnit: 'hour'
                }]
            }]
        },
        {
            id: 2,
            name: 'Concrete',
            type: 'material',
            rateTables: [{
                id: 201,
                name: 'Supplier A',
                rates: [{
                    startDate: '2024-01-01',
                    standardRate: 120,
                    perUseCost: 50
                }]
            }]
        },
        {
            id: 3,
            name: 'Permits',
            type: 'cost'
        }
    ],

    tasksData: [{
        id: 1,
        name: 'Foundation',
        startDate: '2024-03-01',
        duration: 5
    }],

    assignmentsData: [
        { event: 1, resource: 1, units: 100 },
        { event: 1, resource: 2, quantity: 10, rateTable: 201 },
        { event: 1, resource: 3, cost: 500 }
    ]
});

await project.commitAsync();

// Developer: 5 days × 8 hours × $75 = $3,000
// Concrete: 10 units × $120 + $50 = $1,250
// Permits: $500
// Total task cost: $4,750
console.log('Task cost:', project.taskStore.getById(1).cost);
```

---

## Zie Ook

- [GANTT-IMPL-RESOURCES.md](./GANTT-IMPL-RESOURCES.md) - Resource management
- [GANTT-IMPL-ASSIGNMENTS.md](./GANTT-IMPL-ASSIGNMENTS.md) - Assignment configuration
- [SCHEDULERPRO-IMPL-UTILIZATION.md](./SCHEDULERPRO-IMPL-UTILIZATION.md) - Resource utilization view

---

*Track A - Gantt Implementation - Resource Costs*
