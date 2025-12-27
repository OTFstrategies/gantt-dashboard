# Third-Party Integration: Salesforce

> **Enterprise integration guide** voor het embedden van Bryntum componenten in Salesforce Lightning: Lightning Web Components (LWC), Aura Components, static resources, en data binding met Apex.

---

## Overzicht

Salesforce integratie maakt het mogelijk om:
- **LWC Embedding** - Bryntum componenten als Lightning Web Components
- **Aura Wrapper** - Legacy Aura component integratie
- **Apex Data Binding** - Server-side data met Apex controllers
- **Platform Events** - Real-time updates via Salesforce events

---

## 1. Architectuur

### 1.1 Component Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    Salesforce Lightning                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Lightning Web Component                   │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │              Bryntum Gantt/Scheduler               │  │   │
│  │  │           (Loaded from Static Resource)            │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Apex Controller                        │   │
│  │    - getData()    - saveData()    - syncChanges()        │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                Salesforce Objects (sObjects)               │   │
│  │        Project__c  Task__c  Resource__c  Assignment__c    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 File Structure

```
force-app/
└── main/
    └── default/
        ├── lwc/
        │   └── bryntumGantt/
        │       ├── bryntumGantt.html
        │       ├── bryntumGantt.js
        │       ├── bryntumGantt.css
        │       └── bryntumGantt.js-meta.xml
        ├── staticresources/
        │   ├── bryntumGantt.resource
        │   ├── bryntumGantt.resource-meta.xml
        │   └── bryntumGanttStyles.resource
        └── classes/
            ├── GanttController.cls
            └── GanttController.cls-meta.xml
```

---

## 2. Static Resources Setup

### 2.1 Bundle Preparation

```bash
# Maak zip van Bryntum library
cd bryntum-gantt/build

# Noodzakelijke bestanden
# gantt.module.min.js
# gantt.stockholm.min.css
# fonts/

zip -r bryntumGantt.zip gantt.module.min.js gantt.stockholm.min.css fonts/
```

### 2.2 Meta XML

```xml
<!-- bryntumGantt.resource-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
    <cacheControl>Public</cacheControl>
    <contentType>application/zip</contentType>
</StaticResource>
```

---

## 3. Lightning Web Component

### 3.1 Component Template

```html
<!-- bryntumGantt.html -->
<template>
    <div class="gantt-container">
        <div lwc:dom="manual" class="gantt-wrapper"></div>
    </div>

    <template if:true={isLoading}>
        <lightning-spinner alternative-text="Loading..." size="medium">
        </lightning-spinner>
    </template>

    <template if:true={error}>
        <div class="error-message">
            {error}
        </div>
    </template>
</template>
```

### 3.2 JavaScript Controller

```javascript
// bryntumGantt.js
import { LightningElement, api, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Static Resources
import GANTT_JS from '@salesforce/resourceUrl/bryntumGantt';
import GANTT_STYLES from '@salesforce/resourceUrl/bryntumGanttStyles';

// Apex Methods
import getProjectData from '@salesforce/apex/GanttController.getProjectData';
import saveProjectData from '@salesforce/apex/GanttController.saveProjectData';

export default class BryntumGantt extends LightningElement {
    @api recordId;  // Project record ID
    @track isLoading = true;
    @track error = null;

    gantt = null;
    libraryLoaded = false;

    async connectedCallback() {
        try {
            await this.loadBryntumLibrary();
            await this.initializeGantt();
        } catch (error) {
            this.handleError(error);
        }
    }

    async loadBryntumLibrary() {
        if (this.libraryLoaded) return;

        await Promise.all([
            loadScript(this, GANTT_JS + '/gantt.module.min.js'),
            loadStyle(this, GANTT_STYLES + '/gantt.stockholm.min.css')
        ]);

        this.libraryLoaded = true;
    }

    async initializeGantt() {
        // Haal project data op via Apex
        const data = await getProjectData({ projectId: this.recordId });

        // Container element
        const container = this.template.querySelector('.gantt-wrapper');

        // Bryntum Gantt instantie
        this.gantt = new bryntum.gantt.Gantt({
            appendTo: container,

            project: {
                tasksData: data.tasks,
                resourcesData: data.resources,
                assignmentsData: data.assignments,
                dependenciesData: data.dependencies
            },

            columns: [
                { type: 'wbs' },
                { type: 'name', width: 250 },
                { type: 'startdate' },
                { type: 'duration' },
                { type: 'percentdone' }
            ],

            features: {
                taskEdit: true,
                dependencies: true,
                progressLine: true
            },

            listeners: {
                // Sync bij data changes
                dataChange: this.handleDataChange.bind(this)
            }
        });

        this.isLoading = false;
    }

    async handleDataChange({ store, action, records }) {
        // Alleen sync bij echte wijzigingen
        if (!['add', 'update', 'remove'].includes(action)) return;

        try {
            const changes = this.gantt.project.changes;

            if (Object.keys(changes).length > 0) {
                await saveProjectData({
                    projectId: this.recordId,
                    changes: JSON.stringify(changes)
                });

                // Accept changes na succesvolle save
                this.gantt.project.acceptChanges();

                this.showToast('Success', 'Changes saved', 'success');
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    handleError(error) {
        this.error = error.message || 'An error occurred';
        this.isLoading = false;

        this.showToast('Error', this.error, 'error');
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant
        }));
    }

    disconnectedCallback() {
        // Cleanup
        if (this.gantt) {
            this.gantt.destroy();
            this.gantt = null;
        }
    }
}
```

### 3.3 CSS Styling

```css
/* bryntumGantt.css */
.gantt-container {
    position: relative;
    width: 100%;
    height: 600px;
}

.gantt-wrapper {
    width: 100%;
    height: 100%;
}

.error-message {
    color: #c23934;
    padding: 16px;
    background: #fef0ef;
    border-radius: 4px;
}

/* Salesforce Lightning Design System overrides */
:host {
    --lwc-colorBackground: var(--b-gantt-background-color);
}
```

### 3.4 Meta Configuration

```xml
<!-- bryntumGantt.js-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__RecordPage</target>
        <target>lightning__AppPage</target>
        <target>lightning__HomePage</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__RecordPage">
            <objects>
                <object>Project__c</object>
            </objects>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
```

---

## 4. Apex Controller

### 4.1 Data Retrieval

```java
// GanttController.cls
public with sharing class GanttController {

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getProjectData(Id projectId) {
        Map<String, Object> result = new Map<String, Object>();

        // Tasks ophalen
        List<Task__c> tasks = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Duration__c,
                   Percent_Complete__c, Parent_Task__c, WBS__c
            FROM Task__c
            WHERE Project__c = :projectId
            ORDER BY WBS__c
        ];

        // Resources ophalen
        List<Resource__c> resources = [
            SELECT Id, Name, Role__c, Email__c
            FROM Resource__c
            WHERE Active__c = true
        ];

        // Assignments ophalen
        List<Assignment__c> assignments = [
            SELECT Id, Task__c, Resource__c, Units__c
            FROM Assignment__c
            WHERE Task__r.Project__c = :projectId
        ];

        // Dependencies ophalen
        List<Dependency__c> dependencies = [
            SELECT Id, From_Task__c, To_Task__c, Type__c, Lag__c
            FROM Dependency__c
            WHERE From_Task__r.Project__c = :projectId
        ];

        result.put('tasks', transformTasks(tasks));
        result.put('resources', transformResources(resources));
        result.put('assignments', transformAssignments(assignments));
        result.put('dependencies', transformDependencies(dependencies));

        return result;
    }

    private static List<Map<String, Object>> transformTasks(List<Task__c> tasks) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();

        for (Task__c task : tasks) {
            Map<String, Object> t = new Map<String, Object>();
            t.put('id', task.Id);
            t.put('name', task.Name);
            t.put('startDate', task.Start_Date__c);
            t.put('endDate', task.End_Date__c);
            t.put('duration', task.Duration__c);
            t.put('percentDone', task.Percent_Complete__c);
            t.put('parentId', task.Parent_Task__c);
            result.add(t);
        }

        return result;
    }

    private static List<Map<String, Object>> transformResources(List<Resource__c> resources) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();

        for (Resource__c res : resources) {
            Map<String, Object> r = new Map<String, Object>();
            r.put('id', res.Id);
            r.put('name', res.Name);
            r.put('role', res.Role__c);
            result.add(r);
        }

        return result;
    }

    private static List<Map<String, Object>> transformAssignments(List<Assignment__c> assignments) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();

        for (Assignment__c assign : assignments) {
            Map<String, Object> a = new Map<String, Object>();
            a.put('id', assign.Id);
            a.put('event', assign.Task__c);
            a.put('resource', assign.Resource__c);
            a.put('units', assign.Units__c);
            result.add(a);
        }

        return result;
    }

    private static List<Map<String, Object>> transformDependencies(List<Dependency__c> deps) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();

        for (Dependency__c dep : deps) {
            Map<String, Object> d = new Map<String, Object>();
            d.put('id', dep.Id);
            d.put('fromEvent', dep.From_Task__c);
            d.put('toEvent', dep.To_Task__c);
            d.put('type', getDependencyType(dep.Type__c));
            d.put('lag', dep.Lag__c);
            result.add(d);
        }

        return result;
    }

    private static Integer getDependencyType(String sfType) {
        if (sfType == 'Start-to-Start') return 0;
        if (sfType == 'Start-to-Finish') return 1;
        if (sfType == 'Finish-to-Start') return 2;
        if (sfType == 'Finish-to-Finish') return 3;
        return 2; // Default: FS
    }

    @AuraEnabled
    public static void saveProjectData(Id projectId, String changes) {
        Map<String, Object> changeMap = (Map<String, Object>) JSON.deserializeUntyped(changes);

        Savepoint sp = Database.setSavepoint();

        try {
            // Process task changes
            if (changeMap.containsKey('tasks')) {
                processTaskChanges((Map<String, Object>) changeMap.get('tasks'));
            }

            // Process assignment changes
            if (changeMap.containsKey('assignments')) {
                processAssignmentChanges((Map<String, Object>) changeMap.get('assignments'));
            }

            // Process dependency changes
            if (changeMap.containsKey('dependencies')) {
                processDependencyChanges((Map<String, Object>) changeMap.get('dependencies'));
            }

        } catch (Exception e) {
            Database.rollback(sp);
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static void processTaskChanges(Map<String, Object> taskChanges) {
        List<Task__c> toUpdate = new List<Task__c>();
        List<Task__c> toInsert = new List<Task__c>();
        List<Id> toDelete = new List<Id>();

        if (taskChanges.containsKey('updated')) {
            List<Object> updated = (List<Object>) taskChanges.get('updated');
            for (Object obj : updated) {
                Map<String, Object> t = (Map<String, Object>) obj;
                Task__c task = new Task__c(
                    Id = (Id) t.get('id'),
                    Name = (String) t.get('name'),
                    Start_Date__c = Date.valueOf((String) t.get('startDate')),
                    Duration__c = (Decimal) t.get('duration'),
                    Percent_Complete__c = (Decimal) t.get('percentDone')
                );
                toUpdate.add(task);
            }
        }

        if (taskChanges.containsKey('added')) {
            // Handle new tasks
        }

        if (taskChanges.containsKey('removed')) {
            // Handle removed tasks
        }

        if (!toUpdate.isEmpty()) update toUpdate;
        if (!toInsert.isEmpty()) insert toInsert;
        if (!toDelete.isEmpty()) delete [SELECT Id FROM Task__c WHERE Id IN :toDelete];
    }
}
```

---

## 5. Platform Events (Real-time Updates)

### 5.1 Event Definition

```xml
<!-- Project_Update__e.event-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <deploymentStatus>Deployed</deploymentStatus>
    <eventType>HighVolume</eventType>
    <fields>
        <fullName>Project_Id__c</fullName>
        <type>Text</type>
        <length>18</length>
    </fields>
    <fields>
        <fullName>Change_Type__c</fullName>
        <type>Text</type>
        <length>50</length>
    </fields>
    <fields>
        <fullName>Payload__c</fullName>
        <type>LongTextArea</type>
        <length>131072</length>
    </fields>
</CustomObject>
```

### 5.2 LWC Event Subscription

```javascript
import { subscribe, unsubscribe, onError } from 'lightning/empApi';

export default class BryntumGantt extends LightningElement {
    subscription = null;
    channelName = '/event/Project_Update__e';

    connectedCallback() {
        // Subscribe to platform events
        this.subscribeToEvents();
    }

    async subscribeToEvents() {
        const messageCallback = (response) => {
            const event = response.data.payload;

            if (event.Project_Id__c === this.recordId) {
                this.handleExternalUpdate(event);
            }
        };

        this.subscription = await subscribe(
            this.channelName,
            -1,
            messageCallback
        );
    }

    handleExternalUpdate(event) {
        const payload = JSON.parse(event.Payload__c);

        // Update Gantt data zonder full reload
        switch (event.Change_Type__c) {
            case 'TASK_UPDATE':
                this.gantt.taskStore.applyChangeset(payload);
                break;
            case 'ASSIGNMENT_UPDATE':
                this.gantt.assignmentStore.applyChangeset(payload);
                break;
        }
    }

    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription);
        }
    }
}
```

---

## 6. Security Considerations

### 6.1 CRUD/FLS Enforcement

```java
public with sharing class GanttController {

    @AuraEnabled
    public static List<Task__c> getTasks(Id projectId) {
        // with sharing ensures record-level security
        // Field-level security check
        if (!Schema.sObjectType.Task__c.isAccessible()) {
            throw new AuraHandledException('Insufficient permissions');
        }

        // Check individual fields
        Map<String, Schema.SObjectField> fieldMap =
            Schema.SObjectType.Task__c.fields.getMap();

        if (!fieldMap.get('Start_Date__c').getDescribe().isAccessible()) {
            throw new AuraHandledException('Cannot access Start Date field');
        }

        return [SELECT Id, Name, Start_Date__c FROM Task__c WHERE Project__c = :projectId];
    }
}
```

### 6.2 CSP Configuration

```xml
<!-- Static resource moet CORS headers hebben -->
<!-- Salesforce CSP settings in Setup > Security > Content Security Policy -->

<!-- Trusted Sites voor externe APIs -->
<!-- Setup > Security > Trusted URLs -->
```

---

## 7. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Library Loading | Gebruik `loadScript`/`loadStyle` voor async loading |
| Data Caching | Set `cacheable=true` op read-only Apex methods |
| Error Handling | Wrap Apex calls in try-catch, toon toast messages |
| Cleanup | Destroy Bryntum instance in `disconnectedCallback` |
| Large Data | Implementeer pagination of lazy loading |

---

## 8. Troubleshooting

### 8.1 Common Issues

| Issue | Solution |
|-------|----------|
| Library not loading | Check Static Resource path en CSP |
| Data not syncing | Verify Apex method permissions |
| Styling conflicts | Use component-scoped CSS |
| Memory leaks | Ensure proper cleanup in disconnectedCallback |

---

## Zie Ook

- [INTEGRATION-FRAMEWORKS.md](./INTEGRATION-FRAMEWORKS.md) - Framework integratie patterns
- [DEEP-DIVE-CRUDMANAGER.md](./DEEP-DIVE-CRUDMANAGER.md) - Data sync patterns
- [Bryntum Salesforce Guide](https://bryntum.com/docs/gantt/guide/Gantt/integration/salesforce)

---

*Track C2.1 - Third-Party Integraties - Salesforce*
