# Bryntum Gantt 7.1.0 - Official Guides Summary

> **Reference Document** - Samenvatting van 89 officiële Bryntum Gantt guides.

---

## Overzicht Guides Structuur

```
docs/data/Gantt/guides/
├── advanced/            # Accessibility
├── basics/              # Calendars, events, features, sizing
├── customization/       # Styling, TaskEdit, localization
├── data/                # CrudManager, stores, project data
├── dragdrop/            # Drag from external grids
├── gettingstarted/      # Bundle setup, sources
├── integration/         # React, Vue, Angular, Ionic, backends
├── migration/           # From ExtJS, DHTMLX, Syncfusion, DevExpress
├── quick-start/         # Framework quick starts
├── revisions/           # Real-time, WebSocket protocol
├── understanding-data/  # Data structure, stores
├── upgrades/            # Version upgrade guides
└── whats-new/           # New features per version
```

**Totaal: 89 guides**

---

## 1. Calendars (basics/calendars.md)

### Kern Concepten

| Concept | Beschrijving |
|---------|--------------|
| CalendarModel | Individuele kalender |
| CalendarManagerStore | Boom-gestructureerde kalender store |
| Intervals | Working/non-working time intervals |
| Recurrent | Herhalende intervallen (Later.js syntax) |
| Static | Eenmalige intervallen met vaste datums |

### Calendar Interval Syntax (Later.js)

```javascript
// Recurrent interval: weekend
{
    recurrentStartDate: "on Sat",
    recurrentEndDate: "on Mon",
    isWorking: false
}

// Recurrent interval: 8h workday met lunch
{
    recurrentStartDate: "every weekday at 12:00",
    recurrentEndDate: "every weekday at 13:00",
    isWorking: false
},
{
    recurrentStartDate: "every weekday at 17:00",
    recurrentEndDate: "every weekday at 08:00",
    isWorking: false
}

// Static interval: vakantie
{
    startDate: "2024-08-14",
    endDate: "2024-09-14",
    isWorking: false,
    name: "Vacation 2024"
}
```

### Duration Conversie Settings

```javascript
const project = new ProjectModel({
    calendar: 9999,
    hoursPerDay: 8,    // 1 day = 8 hours
    daysPerWeek: 5,    // 1 week = 5 days
    daysPerMonth: 20   // 1 month = 20 days
});
```

### Calendar Hiërarchie

- Parent calendars geven intervals door aan children
- Child intervals overschrijven parent intervals
- `unspecifiedTimeIsWorking` wordt NIET geërfd

### Resource Calendar Intersectie

Wanneer een task resources heeft:
1. Task kan alleen werken als task calendar EN resource calendar toestaan
2. Effectieve werktijd = intersectie van alle calendars
3. Kan uitgeschakeld worden met `ignoreResourceCalendar: true`

---

## 2. Time-Phased Assignments (data/time_phased_assignments.md)

### Nieuw in 7.0.0

```javascript
const project = new TimePhasedProjectModel({
    assignmentsData: [
        // Zelfde resource, meerdere assignments
        {
            id: 'a1',
            resource: 'r1',
            event: 'e1',
            startDate: '2024-01-01',
            endDate: '2024-01-04',
            effort: 24
        },
        {
            id: 'a2',
            resource: 'r1',
            event: 'e1',
            startDate: '2024-01-07',
            endDate: '2024-01-10',
            effort: 48
        }
    ]
});
```

### Kenmerken

- Assignments kunnen eigen start/end dates hebben
- Relative offset wordt bewaard bij task verplaatsing
- Effort wordt per assignment getrackt (nieuw in 7.0.0)
- Scheduling mode erft van parent event

### UI Integratie

```javascript
new ResourceUtilization({
    features: {
        scheduleContext: {
            keyNavigation: true,
            multiSelect: true
        },
        allocationCellEdit: true,     // Effort editing
        allocationCopyPaste: true     // Copy/paste support
    }
});
```

---

## 3. WebSocket Real-time Sync (integration/websockets.md)

### Server Setup

```bash
git clone https://github.com/bryntum/gantt-websocket-server
cd gantt-websocket-server
npm i && npm run start
```

### Client Configuratie

```javascript
const project = new ProjectModel({
    wsAddress: 'ws://localhost:8080'
});

// Authenticeren
project.wsSend('login', { login: 'user' });

// Project laden
project.wsProjectId = 1;
```

### Protocol Commands

| Command | Richting | Beschrijving |
|---------|----------|--------------|
| `login` | C → S | Authenticatie |
| `projects` | C → S | Lijst beschikbare projecten |
| `dataset` | C ↔ S | Project data laden |
| `projectChange` | C ↔ S | Wijzigingen synchroniseren |
| `reset` | C ↔ S | Data resetten |
| `requestVersionAutoSave` | C → S | Versie auto-save request |
| `loadVersionContent` | C ↔ S | Versie content laden |

### projectChange Format

```json
{
    "command": "projectChange",
    "project": 1,
    "changes": {
        "tasks": {
            "added": [{ "$PhantomId": "_gen1", "name": "New" }],
            "updated": [{ "id": 1, "name": "Updated" }],
            "removed": [{ "id": 2 }]
        }
    }
}
```

---

## 4. Revisions System (revisions/overview.md)

### Concept

Een **revision** is een complete set wijzigingen die project van state A naar state B transformeert.

### Setup

```javascript
// 1. Enable revisions in STM
const project = new ProjectModel({
    stm: {
        revisionsEnabled: true
    }
});

// 2. Enable transactional features
const gantt = new Gantt({
    enableTransactionalFeatures: true,
    project
});

// 3. Initialize after load
project.load().then(() => {
    project.stm.enable();
    project.initRevisions('client-unique-id');
});
```

### Event Handling

```javascript
// Sturen van revisions
project.on('revisionNotification', revision => {
    const { localRevisionId, conflictResolutionFor, changes, clientId } = revision;
    websocket.sendRevision(revision);
});

// Ontvangen van revisions
websocket.on('revision', revision => {
    project.applyRevisions(revision);
});
```

### WBS Synchronisatie

```javascript
class MyTaskModel extends TaskModel {
    static fields = [
        { name: 'parentIndex', persist: true },
        { name: 'orderedParentIndex', persist: true }
    ];
}

const project = new ProjectModel({
    taskStore: {
        useOrderedTreeForWbs: true
    }
});
```

---

## 5. Framework Integration

### React/Next.js (integration/react/guide.md)

```javascript
import { BryntumGantt, BryntumGanttProjectModel } from '@bryntum/gantt-react';

function GanttApp() {
    const projectRef = useRef(null);
    const ganttRef = useRef(null);

    return (
        <>
            <BryntumGanttProjectModel
                ref={projectRef}
                tasks={tasksData}
            />
            <BryntumGantt
                ref={ganttRef}
                project={projectRef}
                columns={columns}
            />
        </>
    );
}
```

### Next.js SSR

```javascript
import dynamic from 'next/dynamic';

const BryntumGantt = dynamic(
    () => import('@bryntum/gantt-react').then(mod => mod.BryntumGantt),
    { ssr: false }
);
```

### Vue 3 (integration/vue/guide.md)

```vue
<template>
    <bryntum-gantt
        :columns="columns"
        :project="project"
    />
</template>

<script setup>
import { BryntumGantt } from '@bryntum/gantt-vue-3';
</script>
```

### Angular (integration/angular/guide.md)

```typescript
@Component({
    template: `<bryntum-gantt [columns]="columns" [project]="project" />`
})
export class GanttComponent {
    columns = [...];
    project = new ProjectModel({ ... });
}
```

---

## 6. CrudManager Protocol (data/crud_manager_project.md)

### Load Request

```json
{
    "type": "load",
    "requestId": 12345,
    "stores": ["tasks", "dependencies", "resources", "assignments", "calendars"]
}
```

### Load Response

```json
{
    "success": true,
    "requestId": 12345,
    "project": {
        "calendar": 1,
        "startDate": "2024-01-01",
        "hoursPerDay": 8
    },
    "tasks": { "rows": [...] },
    "dependencies": { "rows": [...] },
    "resources": { "rows": [...] },
    "assignments": { "rows": [...] },
    "calendars": { "rows": [...] }
}
```

### Sync Request (changes)

```json
{
    "type": "sync",
    "requestId": 12346,
    "tasks": {
        "added": [{ "$PhantomId": "_gen1", "name": "New Task" }],
        "updated": [{ "id": 1, "startDate": "2024-01-15" }],
        "removed": [{ "id": 2 }]
    }
}
```

### Sync Response

```json
{
    "success": true,
    "requestId": 12346,
    "tasks": {
        "rows": [{ "$PhantomId": "_gen1", "id": 123 }]
    }
}
```

---

## 7. TaskEdit Customization (customization/taskedit.md)

### Tabs Toevoegen

```javascript
new Gantt({
    features: {
        taskEdit: {
            items: {
                generalTab: {
                    items: {
                        customField: {
                            type: 'textfield',
                            label: 'Custom',
                            name: 'customField'
                        }
                    }
                },
                customTab: {
                    type: 'formtab',
                    title: 'Custom Tab',
                    items: {
                        // Tab content
                    }
                }
            }
        }
    }
});
```

### Tabs Verwijderen

```javascript
features: {
    taskEdit: {
        items: {
            notesTab: false,    // Remove notes tab
            advancedTab: false  // Remove advanced tab
        }
    }
}
```

---

## 8. Styling & Theming (customization/styling.md)

### Thema's

| Thema | Bestanden |
|-------|-----------|
| Stockholm | `gantt.stockholm.css`, `stockholm-light.css`, `stockholm-dark.css` |
| Material3 | `material3-light.css`, `material3-dark.css` |
| Svalbard | `svalbard-light.css`, `svalbard-dark.css` |
| Fluent2 | `fluent2-light.css`, `fluent2-dark.css` |

### CSS Variabelen

```css
:root {
    --b-primary: #4287f5;
    --b-secondary: #f59b42;
    --b-gantt-task-bar-background: var(--b-primary);
    --b-gantt-milestone-color: var(--b-primary);
}
```

### taskRenderer

```javascript
new Gantt({
    taskRenderer({ taskRecord, renderData }) {
        // Pas styling aan
        renderData.cls.urgent = taskRecord.priority === 'high';

        // Return custom content
        return taskRecord.name;
    }
});
```

---

## 9. Localization (customization/localization.md)

### Locale Laden

```javascript
import { LocaleManager } from '@bryntum/gantt';
import nlLocale from '@bryntum/gantt/locales/gantt.locale.Nl.js';

LocaleManager.registerLocale('Nl', { locale: nlLocale });
LocaleManager.applyLocale('Nl');
```

### Custom Strings

```javascript
LocaleManager.extendLocale('Nl', {
    Gantt: {
        customFeature: 'Aangepaste tekst'
    }
});
```

---

## 10. Migration Guides

### Van ExtJS (migration/migrating_from_extjs.md)

| ExtJS | Bryntum |
|-------|---------|
| `Ext.define()` | ES6 classes |
| `store.load()` | `project.load()` |
| `listeners: {}` | `on: {}` of `listeners: {}` |

### Van DHTMLX (migration/migrate-dhtmlx-to-bryntum.md)

| DHTMLX | Bryntum |
|--------|---------|
| `gantt.init()` | `new Gantt()` |
| `gantt.load()` | `project.loadInlineData()` |
| `gantt.parse()` | `project.inlineData = {...}` |

### Van Syncfusion (migration/migrate-syncfusion-to-bryntum.md)

| Syncfusion | Bryntum |
|------------|---------|
| `dataSource` | `project.tasksData` |
| `editSettings` | `features.taskEdit` |
| `taskFields` | `TaskModel.fields` |

---

## 11. What's New in 7.0.0+ (whats-new/7.0.0.md)

### Nieuwe Features

- **Time-phased assignments** - Assignments met eigen tijdsperiodes
- **Per-assignment effort tracking** - Effort per assignment
- **TimePhasedProjectModel** - Speciale project model
- **AllocationCellEdit** - Effort editing in utilization view
- **AllocationCopyPaste** - Copy/paste in utilization view
- **Enhanced ResourceUtilization** - Verbeterde resource views

### Breaking Changes

- Assignment effort nu per-assignment (was event-level)
- Nieuwe model classes voor time-phased data
- Sommige API signatures gewijzigd

---

## 12. Quick Reference Patterns

### Inline Data Laden

```javascript
const project = new ProjectModel({
    tasksData: [...],
    dependenciesData: [...],
    resourcesData: [...],
    assignmentsData: [...]
});
```

### Remote Data Laden

```javascript
const project = new ProjectModel({
    transport: {
        load: { url: '/api/load' },
        sync: { url: '/api/sync' }
    },
    autoLoad: true,
    autoSync: true
});
```

### Event Handling

```javascript
gantt.on({
    taskClick({ taskRecord }) {
        console.log('Clicked:', taskRecord.name);
    },
    beforeTaskEdit({ taskRecord }) {
        return taskRecord.editable !== false;
    }
});
```

### Store Manipulatie

```javascript
// Add task
const newTask = project.taskStore.add({
    name: 'New Task',
    startDate: new Date()
});

// Update task
taskRecord.set('duration', 5);

// Remove task
project.taskStore.remove(taskRecord);

// Batch updates
project.beginBatch();
// ... multiple changes
await project.endBatch();
```

---

## Cross-References naar Onze Documentatie

| Official Guide | Ons Document |
|----------------|--------------|
| calendars.md | [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) |
| websockets.md | [DEEP-DIVE-CRITICAL-FEATURES](./DEEP-DIVE-CRITICAL-FEATURES.md) |
| revisions/*.md | [DEEP-DIVE-CRITICAL-FEATURES](./DEEP-DIVE-CRITICAL-FEATURES.md) |
| time_phased_assignments.md | [DEEP-DIVE-CRITICAL-FEATURES](./DEEP-DIVE-CRITICAL-FEATURES.md) |
| styling.md | [DEEP-DIVE-THEMING](./DEEP-DIVE-THEMING.md) |
| localization.md | [DEEP-DIVE-LOCALIZATION](./DEEP-DIVE-LOCALIZATION.md) |
| taskedit.md | [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) |
| crud_manager*.md | [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md) |
| react/*.md | [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) |
| storebasics.md | [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) |
| events.md | [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) |

---

## Nog Te Verwerken Guides

### Prioriteit 1 - Kernfunctionaliteit

- [ ] basics/features.md - Feature configuratie
- [ ] basics/sizing.md - Component sizing
- [ ] data/sparseindex.md - Large dataset handling
- [ ] advanced/a11y.md - Accessibility

### Prioriteit 2 - Integraties

- [ ] integration/nodejs.md - Node.js backend
- [ ] integration/sharepoint.md - SharePoint integratie
- [ ] integration/salesforce/readme.md - Salesforce LWC

### Prioriteit 3 - Overige

- [ ] dragdrop/*.md - External drag & drop
- [ ] customization/responsive.md - Responsive design
- [ ] customization/scurve.md - S-curve charts

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Bryntum Gantt versie: 7.1.0*
*Aantal verwerkte guides: 15 van 89*
*Laatste update: December 2024*
