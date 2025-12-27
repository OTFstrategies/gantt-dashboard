# Integration Guide: Bryntum Gantt + SAP

> **Implementatie guide** voor SAP integratie met Bryntum Gantt: SAP UI5 embedding, OData services, S/4HANA connectivity, en PS/PPM data synchronisatie.

---

## Overzicht

De SAP integratie maakt het mogelijk om:
- **SAP UI5 Component** - Bryntum Gantt in Fiori applicaties
- **OData v2/v4** - Connectie met SAP backend services
- **PS Module** - Project System data synchronisatie
- **PPM** - Portfolio en Project Management koppeling

---

## 1. SAP UI5 Component

### 1.1 Component Definition

```javascript
// Component.js
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v2/ODataModel"
], function(UIComponent, ODataModel) {
    "use strict";

    return UIComponent.extend("bryntum.gantt.Component", {

        metadata: {
            manifest: "json"
        },

        init: function() {
            UIComponent.prototype.init.apply(this, arguments);

            // Initialize OData model
            var oModel = new ODataModel("/sap/opu/odata/sap/ZPM_PROJECT_SRV/", {
                useBatch: true,
                defaultBindingMode: "TwoWay"
            });

            this.setModel(oModel);
            this.getRouter().initialize();
        }
    });
});
```

### 1.2 manifest.json

```json
{
    "sap.app": {
        "id": "bryntum.gantt",
        "type": "application",
        "title": "Bryntum Gantt Chart",
        "dataSources": {
            "mainService": {
                "uri": "/sap/opu/odata/sap/ZPM_PROJECT_SRV/",
                "type": "OData",
                "settings": {
                    "odataVersion": "2.0"
                }
            }
        }
    },
    "sap.ui5": {
        "dependencies": {
            "libs": {
                "sap.m": {},
                "sap.ui.layout": {}
            }
        },
        "models": {
            "": {
                "dataSource": "mainService"
            }
        }
    }
}
```

---

## 2. Gantt Wrapper Control

### 2.1 Custom Control

```javascript
// control/GanttChart.js
sap.ui.define([
    "sap/ui/core/Control",
    "@bryntum/gantt/gantt.module"
], function(Control, BryntumGantt) {
    "use strict";

    return Control.extend("bryntum.gantt.control.GanttChart", {

        metadata: {
            properties: {
                viewPreset: { type: "string", defaultValue: "weekAndDayLetter" },
                rowHeight: { type: "int", defaultValue: 45 },
                projectId: { type: "string" }
            },
            aggregations: {
                // Hidden aggregation voor data binding
                _tasks: { type: "sap.ui.base.ManagedObject", multiple: true, visibility: "hidden" }
            },
            events: {
                taskChange: {
                    parameters: {
                        task: { type: "object" },
                        action: { type: "string" }
                    }
                }
            }
        },

        init: function() {
            this._gantt = null;
        },

        onAfterRendering: function() {
            if (!this._gantt) {
                this._initGantt();
            }
        },

        _initGantt: function() {
            var that = this;
            var oDomRef = this.getDomRef();

            this._gantt = new BryntumGantt.Gantt({
                appendTo: oDomRef,

                viewPreset: this.getViewPreset(),
                rowHeight: this.getRowHeight(),

                project: new BryntumGantt.ProjectModel(),

                columns: [
                    { type: 'wbs' },
                    { type: 'name', width: 250 },
                    { type: 'startdate' },
                    { type: 'duration' },
                    { type: 'percentdone', width: 70 }
                ],

                listeners: {
                    dataChange: function(event) {
                        that.fireTaskChange({
                            task: event.record.data,
                            action: event.action
                        });
                    }
                }
            });

            // Load initial data
            this._loadProjectData();
        },

        _loadProjectData: function() {
            var that = this;
            var sProjectId = this.getProjectId();

            if (!sProjectId) return;

            var oModel = this.getModel();

            // Read project tasks
            oModel.read("/ProjectTaskSet", {
                filters: [
                    new sap.ui.model.Filter("ProjectId", "EQ", sProjectId)
                ],
                success: function(oData) {
                    that._loadTasks(oData.results);
                }
            });
        },

        _loadTasks: function(aTasks) {
            var aGanttTasks = aTasks.map(function(oTask) {
                return {
                    id: oTask.TaskId,
                    name: oTask.TaskName,
                    startDate: oTask.StartDate,
                    endDate: oTask.EndDate,
                    duration: oTask.Duration,
                    percentDone: oTask.PercentComplete,
                    parentId: oTask.ParentTaskId
                };
            });

            this._gantt.project.loadInlineData({
                tasksData: aGanttTasks
            });
        },

        renderer: function(oRm, oControl) {
            oRm.openStart("div", oControl);
            oRm.class("bryntum-gantt-container");
            oRm.style("height", "600px");
            oRm.style("width", "100%");
            oRm.openEnd();
            oRm.close("div");
        },

        exit: function() {
            if (this._gantt) {
                this._gantt.destroy();
            }
        }
    });
});
```

---

## 3. OData Service Integration

### 3.1 Custom OData Service (ABAP)

```abap
CLASS zcl_pm_project_dpc_ext DEFINITION
  PUBLIC
  INHERITING FROM zcl_pm_project_dpc
  CREATE PUBLIC.

  PUBLIC SECTION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~get_entityset
        REDEFINITION.

  PROTECTED SECTION.
    METHODS projecttaskset_get_entityset
      IMPORTING
        iv_project_id TYPE prps-posid
      EXPORTING
        et_entityset  TYPE zcl_pm_project_mpc=>tt_projecttask.

ENDCLASS.

CLASS zcl_pm_project_dpc_ext IMPLEMENTATION.

  METHOD projecttaskset_get_entityset.
    DATA: lt_prps TYPE TABLE OF prps,
          ls_task TYPE zcl_pm_project_mpc=>ts_projecttask.

    " Read WBS elements
    SELECT * FROM prps
      INTO TABLE lt_prps
      WHERE posid LIKE iv_project_id.

    LOOP AT lt_prps INTO DATA(ls_prps).
      CLEAR ls_task.

      ls_task-taskid        = ls_prps-pspnr.
      ls_task-taskname      = ls_prps-post1.
      ls_task-startdate     = ls_prps-pstrt.
      ls_task-enddate       = ls_prps-pende.
      ls_task-parenttaskid  = ls_prps-psphi.
      ls_task-wbscode       = ls_prps-posid.

      " Calculate percent complete from confirmations
      ls_task-percentcomplete = calculate_progress( ls_prps-pspnr ).

      APPEND ls_task TO et_entityset.
    ENDLOOP.
  ENDMETHOD.

ENDCLASS.
```

### 3.2 OData Entity Type

```xml
<!-- ZPM_PROJECT_SRV metadata -->
<EntityType Name="ProjectTask">
    <Key>
        <PropertyRef Name="TaskId"/>
    </Key>
    <Property Name="TaskId" Type="Edm.String" Nullable="false"/>
    <Property Name="ProjectId" Type="Edm.String"/>
    <Property Name="TaskName" Type="Edm.String"/>
    <Property Name="WbsCode" Type="Edm.String"/>
    <Property Name="StartDate" Type="Edm.DateTime"/>
    <Property Name="EndDate" Type="Edm.DateTime"/>
    <Property Name="Duration" Type="Edm.Decimal"/>
    <Property Name="DurationUnit" Type="Edm.String"/>
    <Property Name="PercentComplete" Type="Edm.Decimal"/>
    <Property Name="ParentTaskId" Type="Edm.String"/>
    <Property Name="ResponsiblePerson" Type="Edm.String"/>
    <Property Name="ActualStart" Type="Edm.DateTime"/>
    <Property Name="ActualEnd" Type="Edm.DateTime"/>
</EntityType>
```

---

## 4. SAP PS Data Mapping

### 4.1 WBS Element Mapping

| SAP PS Field | Bryntum Field | Table |
|--------------|---------------|-------|
| POSID | wbsCode | PRPS |
| POST1 | name | PRPS |
| PSTRT | startDate | PRPS |
| PENDE | endDate | PRPS |
| PSPHI | parentId | PRPS |
| STUFE | level | PRPS |
| VERNR | responsible | PRPS |

### 4.2 Network Activity Mapping

| SAP PS Field | Bryntum Field | Table |
|--------------|---------------|-------|
| VORNR | id | AFVC |
| LTXA1 | name | AFVC |
| FSAVD | startDate | AFVV |
| FSSAD | endDate | AFVV |
| DAESSION | duration | AFVV |
| ARBEI | effort | AFVV |

---

## 5. Two-Way Sync

### 5.1 Task Update Handler

```javascript
// controller/Gantt.controller.js
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function(Controller, MessageToast) {
    "use strict";

    return Controller.extend("bryntum.gantt.controller.Gantt", {

        onTaskChange: function(oEvent) {
            var oTask = oEvent.getParameter("task");
            var sAction = oEvent.getParameter("action");
            var oModel = this.getView().getModel();

            switch (sAction) {
                case "update":
                    this._updateTask(oModel, oTask);
                    break;
                case "add":
                    this._createTask(oModel, oTask);
                    break;
                case "remove":
                    this._deleteTask(oModel, oTask);
                    break;
            }
        },

        _updateTask: function(oModel, oTask) {
            var sPath = "/ProjectTaskSet('" + oTask.id + "')";

            oModel.update(sPath, {
                TaskName: oTask.name,
                StartDate: this._formatDate(oTask.startDate),
                EndDate: this._formatDate(oTask.endDate),
                Duration: oTask.duration,
                PercentComplete: oTask.percentDone
            }, {
                success: function() {
                    MessageToast.show("Task updated");
                },
                error: function(oError) {
                    MessageToast.show("Update failed");
                }
            });
        },

        _createTask: function(oModel, oTask) {
            oModel.create("/ProjectTaskSet", {
                ProjectId: this._sProjectId,
                TaskName: oTask.name,
                StartDate: this._formatDate(oTask.startDate),
                EndDate: this._formatDate(oTask.endDate),
                ParentTaskId: oTask.parentId
            }, {
                success: function(oData) {
                    // Update local task with SAP-generated ID
                    oTask.id = oData.TaskId;
                    MessageToast.show("Task created");
                }
            });
        },

        _deleteTask: function(oModel, oTask) {
            var sPath = "/ProjectTaskSet('" + oTask.id + "')";

            oModel.remove(sPath, {
                success: function() {
                    MessageToast.show("Task deleted");
                }
            });
        },

        _formatDate: function(oDate) {
            if (!oDate) return null;
            return "/Date(" + oDate.getTime() + ")/";
        }
    });
});
```

---

## 6. S/4HANA Cloud Integration

### 6.1 Communication Arrangement

```javascript
// S/4HANA Cloud API integration
class S4HanaProjectClient {

    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.credentials = config.credentials;
    }

    async getProjects() {
        const response = await fetch(
            `${this.baseUrl}/sap/opu/odata/sap/API_PROJECT_V2/A_Project`,
            {
                headers: {
                    'Authorization': `Basic ${btoa(this.credentials)}`,
                    'Accept': 'application/json'
                }
            }
        );

        const data = await response.json();
        return data.d.results;
    }

    async getProjectTasks(projectId) {
        const response = await fetch(
            `${this.baseUrl}/sap/opu/odata/sap/API_PROJECT_V2/A_Project('${projectId}')/to_WBSElement`,
            {
                headers: {
                    'Authorization': `Basic ${btoa(this.credentials)}`,
                    'Accept': 'application/json'
                }
            }
        );

        const data = await response.json();
        return this.transformWBSElements(data.d.results);
    }

    transformWBSElements(elements) {
        return elements.map(el => ({
            id: el.WBSElement,
            name: el.WBSDescription,
            wbsCode: el.WBSElementExternalID,
            startDate: this.parseDate(el.PlannedStartDate),
            endDate: this.parseDate(el.PlannedEndDate),
            parentId: el.WBSElementParent || null,
            responsible: el.ResponsibleCostCenter
        }));
    }

    parseDate(sapDate) {
        if (!sapDate) return null;
        // SAP date format: /Date(1234567890000)/
        const match = sapDate.match(/\/Date\((\d+)\)\//);
        return match ? new Date(parseInt(match[1])) : null;
    }
}
```

---

## 7. SAP PPM Integration

### 7.1 Project Portfolio Data

```javascript
class PPMDataProvider {

    constructor(oDataModel) {
        this.model = oDataModel;
    }

    async getPortfolioProjects(portfolioId) {
        return new Promise((resolve, reject) => {
            this.model.read("/PortfolioProjectSet", {
                filters: [
                    new sap.ui.model.Filter("PortfolioId", "EQ", portfolioId)
                ],
                success: (oData) => {
                    resolve(this.transformProjects(oData.results));
                },
                error: reject
            });
        });
    }

    transformProjects(projects) {
        return projects.map(p => ({
            id: p.ProjectGuid,
            name: p.ProjectName,
            startDate: p.PlannedStart,
            endDate: p.PlannedFinish,
            budget: p.TotalBudget,
            status: p.ProjectStatus,
            priority: p.Priority,
            portfolioId: p.PortfolioId
        }));
    }

    async getProjectPhases(projectId) {
        return new Promise((resolve, reject) => {
            this.model.read("/ProjectPhaseSet", {
                filters: [
                    new sap.ui.model.Filter("ProjectGuid", "EQ", projectId)
                ],
                success: (oData) => {
                    resolve(oData.results.map(phase => ({
                        id: phase.PhaseGuid,
                        name: phase.PhaseName,
                        startDate: phase.PlannedStart,
                        endDate: phase.PlannedFinish,
                        parentId: projectId,
                        percentDone: phase.PercentComplete
                    })));
                },
                error: reject
            });
        });
    }
}
```

---

## 8. Fiori View

### 8.1 XML View

```xml
<!-- view/Gantt.view.xml -->
<mvc:View
    controllerName="bryntum.gantt.controller.Gantt"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:gantt="bryntum.gantt.control">

    <Page
        id="ganttPage"
        title="{i18n>ganttTitle}"
        showNavButton="true"
        navButtonPress="onNavBack">

        <customHeader>
            <Bar>
                <contentLeft>
                    <Button
                        icon="sap-icon://navigation-left-arrow"
                        press="onNavBack"/>
                    <Title text="{/ProjectName}"/>
                </contentLeft>
                <contentRight>
                    <Button
                        text="{i18n>refresh}"
                        icon="sap-icon://refresh"
                        press="onRefresh"/>
                    <Button
                        text="{i18n>export}"
                        icon="sap-icon://excel-attachment"
                        press="onExport"/>
                </contentRight>
            </Bar>
        </customHeader>

        <content>
            <gantt:GanttChart
                id="ganttChart"
                projectId="{/ProjectId}"
                viewPreset="weekAndDayLetter"
                rowHeight="45"
                taskChange="onTaskChange"/>
        </content>

    </Page>

</mvc:View>
```

---

## 9. Error Handling

### 9.1 OData Error Handler

```javascript
_handleODataError: function(oError) {
    var sMessage = "An error occurred";

    try {
        var oResponse = JSON.parse(oError.responseText);
        sMessage = oResponse.error.message.value;
    } catch (e) {
        sMessage = oError.message || sMessage;
    }

    sap.m.MessageBox.error(sMessage, {
        title: "Error",
        actions: [sap.m.MessageBox.Action.CLOSE]
    });
}
```

---

## 10. Best Practices

| Aspect | Recommendation |
|--------|----------------|
| Batch | Gebruik OData batch voor bulk updates |
| Caching | Cache project data lokaal |
| Auth | Gebruik SAP OAuth2 voor cloud |
| Error | Toon SAP-specifieke foutmeldingen |
| Performance | Lazy load grote projecten |
| i18n | Gebruik SAP i18n framework |

---

## 11. Deployment

### 11.1 Deploy naar SAP

```bash
# Build UI5 app
ui5 build --all

# Deploy via SAP BTP
cf push bryntum-gantt

# Of via ABAP Repository
/UI5/UI5_REPOSITORY_LOAD
```

---

## Zie Ook

- [INTEGRATION-MS-PROJECT.md](./INTEGRATION-MS-PROJECT.md) - MS Project integratie
- [INTEGRATION-PRIMAVERA.md](./INTEGRATION-PRIMAVERA.md) - Primavera integratie
- [GANTT-API-CRUD.md](./GANTT-API-CRUD.md) - CRUD operaties
- [GANTT-IMPL-CALENDARS.md](./GANTT-IMPL-CALENDARS.md) - Calendar setup

---

*Track C2.6 - Third-party Integraties - SAP*
