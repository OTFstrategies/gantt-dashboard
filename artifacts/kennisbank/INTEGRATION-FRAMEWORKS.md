# Framework Integration Patterns

Dit document beschrijft de integratie van Bryntum componenten met moderne JavaScript frameworks.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [React Integratie](#react-integratie)
3. [Vue Integratie](#vue-integratie)
4. [Angular Integratie](#angular-integratie)
5. [Cross-Framework Patterns](#cross-framework-patterns)
6. [Custom Widgets in Frameworks](#custom-widgets-in-frameworks)

---

## Overzicht

### Packages per Framework

```typescript
// React
import { BryntumGantt, BryntumGanttProjectModel } from '@bryntum/gantt-react';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import { BryntumCalendar } from '@bryntum/calendar-react';
import { BryntumTaskBoard } from '@bryntum/taskboard-react';
import { BryntumGrid } from '@bryntum/grid-react';

// Vue 2
import { BryntumGantt } from '@bryntum/gantt-vue';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-vue';

// Vue 3
import { BryntumGantt, BryntumGanttProjectModel } from '@bryntum/gantt-vue-3';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';
import { BryntumCalendar } from '@bryntum/calendar-vue-3';

// Angular
import { BryntumGanttModule } from '@bryntum/gantt-angular';
import { BryntumSchedulerProModule } from '@bryntum/schedulerpro-angular';
import { BryntumCalendarModule } from '@bryntum/calendar-angular';
```

### Thin Bundle Alternative

Voor kleinere bundle sizes:

```typescript
// React Thin
import { BryntumGantt } from '@bryntum/gantt-react-thin';
import '@bryntum/gantt/gantt.stockholm.css';

// Vue 3 Thin
import { BryntumGantt } from '@bryntum/gantt-vue-3-thin';

// Angular Thin
import { BryntumGanttModule } from '@bryntum/gantt-angular-thin';
```

---

## React Integratie

### Basic Setup (Vite - Aanbevolen)

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@bryntum/gantt/gantt.stockholm.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

### Component met Props

```tsx
// GanttProps.tsx
import { BryntumGanttProps } from '@bryntum/gantt-react';

export const ganttProps: BryntumGanttProps = {
    startDate : '2025-01-07',
    endDate   : '2025-03-24',

    dependencyIdField : 'wbsCode',

    selectionMode : {
        cell       : true,
        dragSelect : true,
        rowNumber  : true
    },

    resourceImagePath : 'users/',

    columns : [
        { type : 'wbs', hidden : true },
        { type : 'name', width : 250, showWbs : true },
        { type : 'startdate' },
        { type : 'duration' },
        { type : 'resourceassignment', width : 120, showAvatars : true },
        { type : 'percentdone', mode : 'circle', width : 70 },
        { type : 'predecessor', width : 112 },
        { type : 'successor', width : 112 }
    ],

    subGridConfigs : {
        locked : { flex : 3 },
        normal : { flex : 4 }
    },

    // Features
    rollupsFeature      : { disabled : true },
    baselinesFeature    : { disabled : true },
    filterFeature       : true,
    dependencyEditFeature : true,
    projectEditFeature    : true,

    timeRangesFeature : {
        showCurrentTimeLine : true
    },

    labelsFeature : {
        before : {
            field  : 'name',
            editor : { type : 'textfield' }
        }
    }
};
```

### Component met Project Model

```tsx
// Gantt.tsx
import { useRef } from 'react';
import { BryntumGantt, BryntumGanttProjectModel, BryntumGanttProps } from '@bryntum/gantt-react';
import { projectProps } from './GanttProjectProps';
import { ganttProps } from './GanttProps';

const Gantt = (props: BryntumGanttProps) => {
    const projectRef = useRef<BryntumGanttProjectModel>(null);

    return <>
        <BryntumGanttProjectModel
            ref={projectRef}
            {...projectProps}
        />
        <BryntumGantt
            {...ganttProps}
            {...props}
            project={projectRef}
        />
    </>;
};

export default Gantt;
```

### Project Props

```tsx
// GanttProjectProps.tsx
import { BryntumGanttProjectModelProps } from '@bryntum/gantt-react';
import Task from '../lib/Task';

export const projectProps: BryntumGanttProjectModelProps = {
    autoSetConstraints : true,
    taskModelClass     : Task,
    loadUrl            : 'data/launch-saas.json',
    autoLoad           : true,

    taskStore : {
        wbsMode : 'auto'
    },

    stm : {
        autoRecord : true
    },

    resetUndoRedoQueuesAfterLoad : true
};
```

### Redux Integration

```tsx
// Gantt.tsx met Redux
import React, { useEffect, useRef } from 'react';
import { BryntumGantt, BryntumGanttProjectModel } from '@bryntum/gantt-react';
import { useDispatch, useSelector } from 'react-redux';
import { ganttProps } from '../GanttConfig';
import { dataApi } from '../services/data';
import { uiActions } from '../store/uiSlice';

function Gantt() {
    const ganttRef = useRef();
    const projectRef = useRef();
    const dispatch = useDispatch();

    // Redux state
    const zoomAction = useSelector(state => state.ui.zoomAction);
    const dataset = useSelector(state => state.ganttData.dataset);

    // RTK Query
    const [trigger, { data, isLoading, isError }] = dataApi.useLazyGetDataByNameQuery();

    useEffect(() => {
        trigger(dataset);
    }, [trigger, dataset]);

    // Handle zoom actions
    useEffect(() => {
        if (zoomAction) {
            const gantt = ganttRef.current.instance;
            gantt[zoomAction]();
            dispatch(uiActions.zoom(null));
        }
    }, [dispatch, zoomAction]);

    if (isLoading) {
        return <h2>Loading...</h2>;
    }

    const { resources, tasks, dependencies, timeRanges, assignments, calendars, project } = data;

    // Copy data voor Redux immutability
    const copy = data => data.map(item => ({ ...item }));

    return (
        <>
            <BryntumGanttProjectModel
                ref={projectRef}
                {...project}
                calendars={copy(calendars)}
                tasks={copy(tasks)}
                assignments={copy(assignments)}
                dependencies={copy(dependencies)}
                resources={copy(resources)}
                timeRanges={copy(timeRanges)}
            />
            <BryntumGantt
                ref={ganttRef}
                {...ganttProps}
                project={projectRef}
            />
        </>
    );
}

export default Gantt;
```

### Redux Toolbar

```tsx
// Toolbar.tsx
import React from 'react';
import { BryntumButton } from '@bryntum/gantt-react';
import { useDispatch } from 'react-redux';
import { uiActions } from '../store/uiSlice';

export default function Toolbar() {
    const dispatch = useDispatch();

    return (
        <div className="demo-toolbar align-right">
            <BryntumButton
                icon="b-icon-search-minus"
                tooltip="Zoom Out"
                onAction={() => dispatch(uiActions.zoom('Out'))}
            />
            <BryntumButton
                icon="b-icon-search-plus"
                tooltip="Zoom In"
                onAction={() => dispatch(uiActions.zoom('In'))}
            />
        </div>
    );
}
```

### Instance Access Pattern

```tsx
// Toegang tot Bryntum instance
const ganttRef = useRef<BryntumGantt>(null);

useEffect(() => {
    // Instance beschikbaar na mount
    const gantt = ganttRef.current?.instance;

    if (gantt) {
        gantt.zoomIn();
        gantt.scrollTaskIntoView(gantt.taskStore.first);
    }
}, []);

return <BryntumGantt ref={ganttRef} {...ganttProps} />;
```

### Event Handlers

```tsx
// Event handling in React
const ganttProps: BryntumGanttProps = {
    // Direct event props
    onTaskClick : ({ taskRecord }) => {
        console.log('Task clicked:', taskRecord.name);
    },

    onCellClick : ({ record, column }) => {
        console.log('Cell clicked:', record.name, column.field);
    },

    onDataChange : ({ store, action, records }) => {
        console.log('Data changed:', action, records.length);
    }
};

// Of via listeners object
const ganttProps: BryntumGanttProps = {
    listeners : {
        taskClick : ({ taskRecord }) => {
            console.log('Task clicked:', taskRecord.name);
        },
        beforeTaskEdit : ({ taskRecord }) => {
            // Return false to prevent edit
            return taskRecord.percentDone < 100;
        }
    }
};
```

---

## Vue Integratie

### Vue 3 Composition API (Aanbevolen)

```vue
<!-- App.vue -->
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { BryntumGantt, BryntumGanttProjectModel } from '@bryntum/gantt-vue-3';
import { useGanttProps } from './AppConfig';

const ganttProps = reactive(useGanttProps());
const ganttRef = ref<typeof BryntumGantt | null>(null);

// Instance accessor
const getGantt = () => ganttRef?.value?.instance.value;

onMounted(() => {
    const gantt = getGantt();
    if (gantt) {
        console.log('Gantt mounted:', gantt.taskStore.count);
    }
});
</script>

<template>
    <div class="demo-app">
        <bryntum-gantt
            ref="ganttRef"
            v-bind="ganttProps"
        />
    </div>
</template>

<style lang="scss">
@import './App.scss';
</style>
```

### Vue 3 met Inline Data

```vue
<template>
    <bryntum-demo-header />
    <div class="demo-app">
        <div class="demo-toolbar align-right">
            <bryntum-button
                text="Change Data"
                @action="dataChangeHandler"
            />
        </div>
        <bryntum-gantt-project-model
            ref="project"
            v-bind="projectProps"
            :calendars="calendars"
            :tasks="tasks"
            :dependencies="dependencies"
            :resources="resources"
            :assignments="assignments"
            :time-ranges="timeRanges"
        />
        <bryntum-gantt
            ref="gantt"
            v-bind="ganttProps"
            :project="project"
        />
    </div>
</template>

<script>
import { ref } from 'vue';
import { DateHelper } from '@bryntum/gantt';
import {
    BryntumButton,
    BryntumDemoHeader,
    BryntumGantt,
    BryntumGanttProjectModel
} from '@bryntum/gantt-vue-3';
import { ganttProps, projectProps } from '@/AppConfig';
import * as initialData from '@/initialData';

export default {
    name : 'App',

    components : {
        BryntumDemoHeader,
        BryntumGanttProjectModel,
        BryntumGantt,
        BryntumButton
    },

    setup() {
        const project = ref(null);
        const dataSet = ref(0);

        // Reactive data
        const calendars = ref(initialData.calendars);
        const tasks = ref(initialData.tasks);
        const dependencies = ref(initialData.dependencies);
        const resources = ref(initialData.resources);
        const assignments = ref(initialData.assignments);
        const timeRanges = ref(initialData.timeRanges);

        const dataChangeHandler = () => {
            if (dataSet.value === 0) {
                // Update reactive data
                tasks.value = [
                    {
                        id       : 1,
                        name     : 'Task 1',
                        expanded : true,
                        children : [
                            { id : 11, name : 'Subtask 11', percentDone : 30, duration : 10 }
                        ]
                    }
                ];
                dependencies.value = [
                    { id : 1, from : 11, to : 12 }
                ];
                dataSet.value = 1;
            }
            else {
                // Reset to initial data
                tasks.value = initialData.tasks;
                dependencies.value = initialData.dependencies;
                dataSet.value = 0;
            }
        };

        return {
            project,
            projectProps,
            ganttProps,
            dataChangeHandler,
            calendars,
            tasks,
            dependencies,
            resources,
            assignments,
            timeRanges
        };
    },

    mounted() {
        // Access instance after mount
        console.log(this.$refs.gantt.instance.value.project.timeRangeStore);
    }
};
</script>
```

### Vue 3 met STM (Undo/Redo)

```vue
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import {
    DependencyModel,
    ProjectModel,
    TaskModel,
    StringHelper
} from '@bryntum/gantt';
import {
    BryntumGantt,
    BryntumSplitter,
    BryntumTreeGrid
} from '@bryntum/gantt-vue-3';
import { useGanttProps, useTreeGridProps } from './AppConfig';

const ganttProps = reactive(useGanttProps());
const treeGridProps = reactive(useTreeGridProps());
const ganttRef = ref<typeof BryntumGantt | null>(null);
const treeGridRef = ref<typeof BryntumTreeGrid | null>(null);

const getGantt = () => ganttRef?.value?.instance.value;
const getTreeGrid = () => treeGridRef?.value?.instance.value;

onMounted(() => {
    const gantt = getGantt();
    const treeGrid = getTreeGrid();

    // STM Event Handlers
    const onRecordingStop = ({ stm, transaction }) => {
        const actionStore = treeGrid.store;
        const toRemove = actionStore.rootNode.children.slice(stm.position);

        // Add transaction to action tree
        const action = actionStore.rootNode.insertChild({
            idx      : stm.position,
            title    : transaction.title,
            changes  : `${transaction.length} steps`,
            expanded : false,
            children : transaction.queue.map((action, idx) => {
                let { type, model, newData } = action;
                let title = '';

                if (type === 'EventUpdateAction') {
                    title = 'Edit task ' + model.name;
                }
                else if (type === 'AddAction' && model instanceof TaskModel) {
                    title = 'Add task ' + model.name;
                }
                else if (type === 'RemoveAction' && model instanceof TaskModel) {
                    title = 'Remove task ' + model.name;
                }

                return {
                    idx   : `${stm.position}.${idx + 1}`,
                    title,
                    changes : StringHelper.safeJsonStringify(newData)
                };
            })
        }, toRemove[0]);

        treeGrid.selectedRecord = action;

        if (toRemove.length) {
            actionStore.rootNode.removeChild(toRemove);
        }
    };

    const onRestoringStop = ({ stm }) => {
        const action = treeGrid.store.rootNode.children[stm.position];
        treeGrid.selectedRecord = action;
    };

    // Attach STM listeners
    gantt.project.stm.on({
        recordingStop : onRecordingStop,
        restoringStop : onRestoringStop,
        thisObj       : treeGrid
    });

    // TreeGrid selection -> STM navigation
    treeGrid.on({
        selectionchange() {
            const { stm } = gantt.project;
            const action = treeGrid.selectedRecord;

            if (action && action.parent.isRoot) {
                const idx = action.idx;
                if (stm.position < idx) {
                    stm.redo(idx - stm.position);
                }
                else if (stm.position > idx) {
                    stm.undo(stm.position - idx);
                }
            }
        },
        thisObj : treeGrid
    });
});
</script>

<template>
    <div class="demo-app">
        <bryntum-gantt
            ref="ganttRef"
            v-bind="ganttProps"
        />
        <bryntum-splitter/>
        <bryntum-tree-grid
            ref="treeGridRef"
            v-bind="treeGridProps"
        />
    </div>
</template>
```

### Vue 2 Options API

```vue
<template>
    <div id="app">
        <bryntum-gantt
            ref="gantt"
            :columns="columns"
            :tasks="tasks"
            :dependencies="dependencies"
            @taskclick="onTaskClick"
        />
    </div>
</template>

<script>
import { BryntumGantt } from '@bryntum/gantt-vue';

export default {
    name: 'App',

    components: {
        BryntumGantt
    },

    data() {
        return {
            columns: [
                { type: 'name', width: 250 },
                { type: 'startdate' },
                { type: 'duration' }
            ],
            tasks: [],
            dependencies: []
        };
    },

    methods: {
        onTaskClick({ taskRecord }) {
            console.log('Task clicked:', taskRecord.name);
        }
    },

    mounted() {
        // Access instance
        const gantt = this.$refs.gantt.instance;
        console.log('Gantt ready:', gantt.taskStore.count);
    }
};
</script>
```

---

## Angular Integratie

### Module Setup

```typescript
// app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppErrorHandler } from './error.handler';
import { AppComponent } from './app.component';
import { GanttComponent } from './gantt/gantt.component';
import { BryntumGanttModule } from '@bryntum/gantt-angular';

@NgModule({
    declarations : [
        AppComponent,
        GanttComponent
    ],
    imports : [
        BrowserModule,
        BryntumGanttModule
    ],
    providers : [{ provide : ErrorHandler, useClass : AppErrorHandler }],
    bootstrap : [AppComponent]
})
export class AppModule { }
```

### Component

```typescript
// gantt.component.ts
import { Component, OnInit } from '@angular/core';
import { ganttProps } from './gantt.config';

@Component({
    selector    : 'app-gantt',
    templateUrl : './gantt.component.html'
})
export class GanttComponent implements OnInit {
    ganttProps = ganttProps;

    ngOnInit() { }
}
```

### Config

```typescript
// gantt.config.ts
import { BryntumGanttProps } from '@bryntum/gantt-angular';
import '../lib/GanttToolbar.js';
import '../lib/StatusColumn.js';
import Task from '../lib/Task.js';

export const ganttProps: BryntumGanttProps = {
    dependencyIdField : 'wbsCode',
    showDirty         : true,

    selectionMode : {
        cell       : true,
        dragSelect : true,
        rowNumber  : true
    },

    project : {
        autoSetConstraints : true,
        taskModelClass     : Task,
        loadUrl            : 'assets/data/launch-saas.json',
        autoLoad           : true,
        taskStore          : {
            wbsMode : 'auto'
        },
        stm : {
            autoRecord : true
        },
        resetUndoRedoQueuesAfterLoad : true
    },

    startDate                     : '2025-01-05',
    endDate                       : '2025-03-24',
    resourceImagePath             : 'assets/users/',
    scrollTaskIntoViewOnCellClick : true,

    columns : [
        { type : 'wbs', hidden : true },
        { type : 'name', width : 250, showWbs : true },
        { type : 'startdate' },
        { type : 'duration' },
        { type : 'resourceassignment', width : 120, showAvatars : true },
        { type : 'percentdone', mode : 'circle', width : 70 },
        { type : 'predecessor', width : 112 },
        { type : 'successor', width : 112 },
        { type : 'schedulingmodecolumn' },
        { type : 'calendar' },
        { type : 'constrainttype' },
        { type : 'constraintdate' },
        { type : 'statuscolumn' },
        { type : 'deadlinedate' },
        { type : 'addnew' }
    ],

    viewPreset : {
        base      : 'weekAndDayLetter',
        tickWidth : 35
    },

    subGridConfigs : {
        locked : { flex : 3 },
        normal : { flex : 4 }
    },

    columnLines : false,
    showTaskColorPickers : true,

    projectEditFeature : true,
    baselinesFeature   : { disabled : true },

    dependenciesFeature : {
        showLagInTooltip : true,
        radius           : 3,
        clickWidth       : 5
    },

    dependencyEditFeature : true,
    filterFeature         : true,

    labelsFeature : {
        before : {
            field  : 'name',
            editor : { type : 'textfield' }
        }
    },

    progressLineFeature : {
        disabled   : true,
        statusDate : new Date(2025, 0, 25)
    },

    rollupsFeature : { disabled : true },

    rowResizeFeature : {
        cellSelector : '.b-sequence-cell'
    },

    rowReorderFeature : {
        showGrip        : 'hover',
        preserveSorters : true
    },

    timeRangesFeature : {
        showCurrentTimeLine : true
    },

    fillHandleFeature     : true,
    cellCopyPasteFeature  : true,

    taskCopyPasteFeature : {
        useNativeClipboard : true
    },

    taskDragFeature : {
        dragAllSelectedTasks : true
    },

    tbar : {
        type : 'gantttoolbar'
    }
};
```

### Template

```html
<!-- gantt.component.html -->
<bryntum-gantt
    #gantt
    [columns]="ganttProps.columns"
    [project]="ganttProps.project"
    [features]="ganttProps.features"
    [startDate]="ganttProps.startDate"
    [endDate]="ganttProps.endDate"
    (onTaskClick)="onTaskClick($event)"
>
</bryntum-gantt>
```

### Instance Access

```typescript
// gantt.component.ts
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { BryntumGanttComponent } from '@bryntum/gantt-angular';

@Component({
    selector    : 'app-gantt',
    templateUrl : './gantt.component.html'
})
export class GanttComponent implements AfterViewInit {
    @ViewChild('gantt') ganttComponent!: BryntumGanttComponent;

    ganttProps = ganttProps;

    ngAfterViewInit() {
        // Access instance
        const gantt = this.ganttComponent.instance;
        console.log('Task count:', gantt.taskStore.count);
    }

    onTaskClick({ taskRecord }) {
        console.log('Task clicked:', taskRecord.name);
    }

    zoomIn() {
        this.ganttComponent.instance.zoomIn();
    }

    zoomOut() {
        this.ganttComponent.instance.zoomOut();
    }
}
```

### Error Handler

```typescript
// error.handler.ts
import { ErrorHandler, Injectable, NgZone } from '@angular/core';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
    constructor(private ngZone: NgZone) {}

    handleError(error: any): void {
        // Log Bryntum-specific errors
        if (error.message?.includes('Bryntum')) {
            console.error('Bryntum error:', error);
        }

        // Re-run in Angular zone if needed
        this.ngZone.run(() => {
            console.error('Application error:', error);
        });
    }
}
```

### Data Service Pattern

```typescript
// data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    constructor(private http: HttpClient) {}

    loadGanttData(): Observable<any> {
        return this.http.get('assets/data/gantt.json');
    }

    saveGanttData(data: any): Observable<any> {
        return this.http.post('api/gantt', data);
    }
}
```

---

## Cross-Framework Patterns

### Props Naming Convention

Features worden als props doorgegeven met `Feature` suffix:

```typescript
// Alle frameworks
{
    // Feature enabled
    filterFeature : true,

    // Feature met config
    dependenciesFeature : {
        showLagInTooltip : true,
        radius           : 3
    },

    // Feature disabled
    baselinesFeature : { disabled : true }
}
```

### Instance Access Pattern

```typescript
// React
const ganttRef = useRef();
const gantt = ganttRef.current?.instance;

// Vue 3
const ganttRef = ref(null);
const gantt = ganttRef.value?.instance.value;

// Angular
@ViewChild('gantt') ganttComponent;
const gantt = this.ganttComponent.instance;
```

### Event Naming

```typescript
// React: on prefix
onTaskClick, onCellClick, onDataChange

// Vue: @ prefix in template
@taskclick, @cellclick, @datachange

// Angular: () binding
(onTaskClick)="handler($event)"
```

### Data Binding Caveat

React en Vue gebruiken immutable data patterns. Bij direct muteren van store data:

```typescript
// Kopieer data voor binding
const copy = data => data.map(item => ({ ...item }));

// React
<BryntumGanttProjectModel
    tasks={copy(data.tasks)}
    dependencies={copy(data.dependencies)}
/>

// Vue
:tasks="[...initialData.tasks]"
:dependencies="[...initialData.dependencies]"
```

---

## Custom Widgets in Frameworks

### Custom Column (Alle Frameworks)

```typescript
// lib/StatusColumn.ts
import { Column, ColumnStore } from '@bryntum/gantt';

export default class StatusColumn extends Column {
    static get $name() {
        return 'StatusColumn';
    }

    static get type() {
        return 'statuscolumn';
    }

    static get isGanttColumn() {
        return true;
    }

    static get defaults() {
        return {
            field      : 'status',
            text       : 'Status',
            width      : 100,
            editor     : false,
            filterable : true
        };
    }

    renderer({ value, record }) {
        const statusColors = {
            'Not Started' : '#999',
            'In Progress' : '#f0ad4e',
            'Completed'   : '#5cb85c',
            'Delayed'     : '#d9534f'
        };

        return {
            tag       : 'div',
            className : 'status-badge',
            style     : `background-color: ${statusColors[value] || '#999'}`,
            html      : value || 'Unknown'
        };
    }
}

// Registreer
ColumnStore.registerColumnType(StatusColumn);
```

### Custom Toolbar (React)

```tsx
// lib/GanttToolbar.tsx
import { Toolbar } from '@bryntum/gantt';

export default class GanttToolbar extends Toolbar {
    static get $name() {
        return 'GanttToolbar';
    }

    static get type() {
        return 'gantttoolbar';
    }

    static get configurable() {
        return {
            items : [
                {
                    type    : 'buttongroup',
                    items   : [
                        {
                            ref     : 'zoomInBtn',
                            icon    : 'b-icon-search-plus',
                            tooltip : 'Zoom In',
                            onClick : 'up.onZoomIn'
                        },
                        {
                            ref     : 'zoomOutBtn',
                            icon    : 'b-icon-search-minus',
                            tooltip : 'Zoom Out',
                            onClick : 'up.onZoomOut'
                        }
                    ]
                },
                { type : 'filler' },
                {
                    type        : 'undoredo',
                    showTooltip : true
                }
            ]
        };
    }

    onZoomIn() {
        this.owner.zoomIn();
    }

    onZoomOut() {
        this.owner.zoomOut();
    }
}

// Registreer
Toolbar.register(GanttToolbar);
```

### Custom Task Model

```typescript
// lib/Task.ts
import { TaskModel } from '@bryntum/gantt';

export default class Task extends TaskModel {
    static get $name() {
        return 'Task';
    }

    static get fields() {
        return [
            { name : 'status', type : 'string', defaultValue : 'Not Started' },
            { name : 'priority', type : 'number', defaultValue : 3 },
            { name : 'deadline', type : 'date' },
            { name : 'cost', type : 'number', defaultValue : 0 }
        ];
    }

    get isOverdue() {
        return this.deadline && this.endDate > this.deadline;
    }

    get statusColor() {
        const colors = {
            'Not Started' : 'gray',
            'In Progress' : 'orange',
            'Completed'   : 'green',
            'Delayed'     : 'red'
        };
        return colors[this.status] || 'gray';
    }
}
```

---

## Vite Configuratie

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';  // of vue()

export default defineConfig({
    plugins : [react()],

    optimizeDeps : {
        include : ['@bryntum/gantt']
    },

    build : {
        rollupOptions : {
            output : {
                manualChunks : {
                    bryntum : ['@bryntum/gantt']
                }
            }
        }
    },

    css : {
        preprocessorOptions : {
            scss : {
                additionalData : `@import "@bryntum/gantt/gantt.stockholm.css";`
            }
        }
    }
});
```

---

## Multi-Product Setup

### Gantt + SchedulerPro

```tsx
// React
import { BryntumGantt, BryntumSchedulerPro, BryntumSplitter } from '@bryntum/gantt-react';
import { SchedulerProProjectModel } from '@bryntum/schedulerpro';

function App() {
    const projectRef = useRef();

    return (
        <div className="container">
            <BryntumGantt
                project={projectRef}
                {...ganttProps}
            />
            <BryntumSplitter />
            <BryntumSchedulerPro
                project={projectRef}
                {...schedulerProps}
            />
        </div>
    );
}
```

```vue
<!-- Vue 3 -->
<template>
    <div class="container">
        <bryntum-gantt
            :project="project"
            v-bind="ganttProps"
        />
        <bryntum-splitter />
        <bryntum-scheduler-pro
            :project="project"
            v-bind="schedulerProps"
        />
    </div>
</template>

<script setup>
import { BryntumGantt, BryntumSchedulerPro, BryntumSplitter } from '@bryntum/gantt-vue-3';
import { ref } from 'vue';

const project = ref(null);
</script>
```

---

## Troubleshooting

### Common Issues

1. **"Cannot read property of undefined"**
   - Instance nog niet gemount - gebruik lifecycle hooks

2. **Reactivity niet werkend (Vue)**
   - Gebruik `ref()` of `reactive()` voor data
   - Kopieer arrays: `[...data]`

3. **Redux state mutations**
   - Kopieer data voor Bryntum: `data.map(item => ({...item}))`

4. **Angular Change Detection**
   - Gebruik `NgZone.run()` voor Bryntum events
   - Mark for check: `ChangeDetectorRef.markForCheck()`

5. **TypeScript errors**
   - Gebruik type imports: `import type { ... }`
   - Custom widgets: `// @ts-ignore` voor custom types

---

## Gerelateerde Documentatie

- [INTEGRATION-DASHBOARD.md](./INTEGRATION-DASHBOARD.md) - Dashboard met meerdere componenten
- [INTEGRATION-CALENDAR-TASKBOARD.md](./INTEGRATION-CALENDAR-TASKBOARD.md) - Calendar en TaskBoard sync
- [INTEGRATION-REALTIME.md](./INTEGRATION-REALTIME.md) - WebSocket integratie
- [INTEGRATION-EXPORT.md](./INTEGRATION-EXPORT.md) - PDF/Excel export
