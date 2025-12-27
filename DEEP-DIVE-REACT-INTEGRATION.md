# DEEP-DIVE: React/Next.js Integration

> **Level 2** - Framework-specifieke integratie patronen voor Bryntum Gantt in React/Next.js applicaties.

---

## Inhoudsopgave

1. [React Wrapper Architectuur](#1-react-wrapper-architectuur)
2. [Component Hiërarchie](#2-component-hiërarchie)
3. [Props en Configuratie](#3-props-en-configuratie)
4. [Refs en Instance Access](#4-refs-en-instance-access)
5. [Event Handling](#5-event-handling)
6. [Data Binding Patronen](#6-data-binding-patronen)
7. [State Management (Redux/Zustand)](#7-state-management-reduxzustand)
8. [JSX Rendering in Cells (Portals)](#8-jsx-rendering-in-cells-portals)
9. [Next.js Specifieke Patronen](#9-nextjs-specifieke-patronen)
10. [Performance Optimalisatie](#10-performance-optimalisatie)
11. [TypeScript Integratie](#11-typescript-integratie)
12. [Cross-References](#12-cross-references)

---

## 1. React Wrapper Architectuur

### 1.1 Wrapper Component Structuur

De Bryntum React wrapper is een class-based component die de native Bryntum Gantt widget omhult:

```typescript
// vendor/gantt-react/src/BryntumGantt.tsx
export class BryntumGantt extends React.Component<BryntumGanttProps> {
    // Verwijzing naar de native Bryntum Gantt class
    static instanceClass = Gantt;
    static instanceName = 'Gantt';

    // Component is een View class (rendert naar DOM)
    static isView = true;

    // React Portal management voor JSX in cellen
    portalsCache?: HTMLElement;
    portalContainerClass = 'b-react-portal-container';

    state = {
        // Houdt React portals bij voor JSX rendering in cellen
        portals: new Map(),
        // Teller voor unieke portal IDs
        generation: 0
    };
}
```

### 1.2 Beschikbare React Components

| Component | Beschrijving | Gebruik |
|-----------|--------------|---------|
| `BryntumGantt` | Hoofdcomponent voor Gantt chart | Primaire UI component |
| `BryntumGanttProjectModel` | Standalone project data container | Data scheiding van UI |
| `BryntumGanttBase` | Basis versie zonder scheduling engine | Lightweight alternatief |
| `BryntumResourceHistogram` | Resource histogram view | Capaciteitsplanning |
| `BryntumSplitter` | Splitter tussen componenten | Layout management |
| `BryntumButton` | Button wrapper | Toolbar controls |

### 1.3 Component Lifecycle

```
Mount Phase:
┌─────────────────────────────────────────────────────────────┐
│ constructor()                                                │
│   └─> Initialize state (portals Map, generation)            │
│                                                              │
│ render()                                                     │
│   └─> Create container div + portal holders                 │
│                                                              │
│ componentDidMount()                                          │
│   └─> createWidget() - Instantieer native Bryntum widget    │
│       └─> processWidgetConfig() - Transformeer React props  │
│           └─> Wire up event handlers                        │
└─────────────────────────────────────────────────────────────┘

Update Phase:
┌─────────────────────────────────────────────────────────────┐
│ shouldComponentUpdate(nextProps)                             │
│   └─> WrapperHelper.shouldComponentUpdate()                 │
│       └─> Compare props, update instance properties         │
│       └─> Return false (widget manages own updates)         │
│                                                              │
│ componentDidUpdate()                                         │
│   └─> Sync changed props to native widget                   │
└─────────────────────────────────────────────────────────────┘

Unmount Phase:
┌─────────────────────────────────────────────────────────────┐
│ componentWillUnmount()                                       │
│   └─> widget.destroy()                                      │
│   └─> Clean up portals                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Component Hiërarchie

### 2.1 Basis Setup

```jsx
import { BryntumGantt, BryntumGanttProjectModel } from '@bryntum/gantt-react';

function App() {
    const projectRef = useRef(null);
    const ganttRef = useRef(null);

    return (
        <>
            {/* Project Model - houdt alle data */}
            <BryntumGanttProjectModel
                ref={projectRef}
                tasks={tasks}
                dependencies={dependencies}
                resources={resources}
                assignments={assignments}
                calendars={calendars}
            />

            {/* Gantt UI - verwijst naar project */}
            <BryntumGantt
                ref={ganttRef}
                project={projectRef}  // Verbind met ProjectModel
                columns={columns}
                features={features}
            />
        </>
    );
}
```

### 2.2 Inline Project Configuratie

```jsx
// Alternatief: project direct in Gantt configureren
<BryntumGantt
    project={{
        autoLoad: true,
        transport: {
            load: { url: '/api/tasks' }
        }
    }}
    columns={columns}
/>
```

### 2.3 Multi-View Setup (Gantt + Histogram)

```jsx
function GanttWithHistogram() {
    const projectRef = useRef(null);
    const ganttRef = useRef(null);
    const histogramRef = useRef(null);

    // Koppel histogram aan gantt na mount
    useEffect(() => {
        histogramRef.current.instance.addPartner(
            ganttRef.current.instance
        );
    }, []);

    return (
        <>
            <BryntumGanttProjectModel ref={projectRef} {...projectProps} />

            <BryntumGantt
                ref={ganttRef}
                project={projectRef}
                {...ganttProps}
            />

            <BryntumSplitter />

            <BryntumResourceHistogram
                ref={histogramRef}
                project={projectRef}
                {...histogramProps}
            />
        </>
    );
}
```

---

## 3. Props en Configuratie

### 3.1 Props Object Pattern

Het beste pattern is om props te definiëren in een apart config bestand:

```javascript
// GanttConfig.js
export const ganttProps = {
    columns: [
        { type: 'name', field: 'name', width: 250 },
        { type: 'startdate', width: 150 },
        { type: 'duration', width: 100 }
    ],

    viewPreset: 'weekAndDayLetter',
    barMargin: 10,

    features: {
        taskEdit: true,
        dependencies: true,
        progressLine: {
            statusDate: new Date()
        }
    }
};

export const projectProps = {
    autoLoad: true,
    autoSetConstraints: true,
    transport: {
        load: { url: '/api/gantt/load' },
        sync: { url: '/api/gantt/sync' }
    }
};
```

```jsx
// App.jsx
import { ganttProps, projectProps } from './GanttConfig';

<BryntumGantt {...ganttProps} project={projectRef} />
```

### 3.2 Dynamische Props Updates

```jsx
function DynamicGantt() {
    const [viewPreset, setViewPreset] = useState('weekAndDayLetter');
    const [barMargin, setBarMargin] = useState(10);

    // Props worden automatisch gesynchroniseerd naar widget
    return (
        <>
            <select onChange={e => setViewPreset(e.target.value)}>
                <option value="weekAndDayLetter">Week</option>
                <option value="monthAndYear">Month</option>
            </select>

            <BryntumGantt
                viewPreset={viewPreset}
                barMargin={barMargin}
            />
        </>
    );
}
```

### 3.3 Feature Configuratie

```javascript
const features = {
    // Boolean toggle
    dependencies: true,
    criticalPaths: true,

    // Object configuratie
    taskEdit: {
        editorConfig: {
            width: '48em',
            modal: { closeOnMaskTap: true }
        },
        items: {
            generalTab: {
                title: 'Details',
                items: {
                    customField: {
                        type: 'textfield',
                        name: 'customData',
                        label: 'Custom'
                    }
                }
            }
        }
    },

    // Factory function
    labels: {
        left: {
            field: 'name',
            renderer: ({ taskRecord }) => taskRecord.name
        }
    }
};
```

---

## 4. Refs en Instance Access

### 4.1 Basis Ref Pattern

```jsx
function GanttWithControls() {
    const ganttRef = useRef(null);

    // Toegang tot native Bryntum instance
    const handleZoomIn = () => {
        const gantt = ganttRef.current.instance;
        gantt.zoomIn();
    };

    const handleScrollToTask = (taskId) => {
        const gantt = ganttRef.current.instance;
        const task = gantt.taskStore.getById(taskId);
        gantt.scrollTaskIntoView(task);
    };

    return (
        <>
            <button onClick={handleZoomIn}>Zoom In</button>
            <BryntumGantt ref={ganttRef} {...props} />
        </>
    );
}
```

### 4.2 Ref Structuur

```typescript
// Wat je krijgt van ganttRef.current
interface BryntumGanttRef {
    // De native Bryntum Gantt instance
    instance: Gantt;

    // React component internals
    state: {
        portals: Map<string, ReactPortal>;
        generation: number;
    };
}

// Beschikbare instance methoden
ganttRef.current.instance.zoomIn();
ganttRef.current.instance.zoomOut();
ganttRef.current.instance.scrollTaskIntoView(task);
ganttRef.current.instance.expandAll();
ganttRef.current.instance.collapseAll();
ganttRef.current.instance.taskStore.add({ name: 'New Task' });
```

### 4.3 ProjectModel Ref

```jsx
function DataManagement() {
    const projectRef = useRef(null);

    const handleSave = async () => {
        const project = projectRef.current.instance;
        await project.sync();
    };

    const handleUndo = () => {
        projectRef.current.instance.stm.undo();
    };

    return (
        <>
            <BryntumGanttProjectModel ref={projectRef} {...props} />
            <button onClick={handleSave}>Save</button>
            <button onClick={handleUndo}>Undo</button>
        </>
    );
}
```

---

## 5. Event Handling

### 5.1 Event Props Pattern

Alle Bryntum events zijn beschikbaar als `onEventName` props:

```jsx
<BryntumGantt
    // Task events
    onTaskClick={({ taskRecord, event }) => {
        console.log('Clicked:', taskRecord.name);
    }}

    onTaskDblClick={({ taskRecord }) => {
        // Open custom editor
        setSelectedTask(taskRecord);
        setEditorOpen(true);
    }}

    // Dependency events
    onDependencyClick={({ dependency }) => {
        console.log('Dependency:', dependency.fromTask.name, '->', dependency.toTask.name);
    }}

    // Data events
    onBeforeTaskEdit={({ taskRecord }) => {
        // Return false to prevent editing
        return taskRecord.editable !== false;
    }}

    // Selection events
    onSelectionChange={({ selected }) => {
        setSelectedTasks(selected);
    }}
/>
```

### 5.2 Project Events

```jsx
<BryntumGanttProjectModel
    onLoad={({ source }) => {
        console.log('Data loaded:', source.taskStore.count, 'tasks');
    }}

    onSync={({ response }) => {
        console.log('Sync complete');
    }}

    onBeforeSync={({ pack }) => {
        // Modify sync data before sending
        pack.requestId = generateRequestId();
    }}

    onDataChange={({ store, action, records }) => {
        console.log(`${store.id}: ${action}`, records.length);
    }}

    onHasChangesChange={({ hasChanges }) => {
        setSaveEnabled(hasChanges);
    }}
/>
```

### 5.3 Event Handler met Redux

```jsx
import { useDispatch } from 'react-redux';
import { taskActions } from './store/taskSlice';

function GanttWithRedux() {
    const dispatch = useDispatch();

    const handleTaskUpdate = ({ taskRecord, changes }) => {
        dispatch(taskActions.updateTask({
            id: taskRecord.id,
            changes: changes
        }));
    };

    return (
        <BryntumGantt
            onAfterTaskEdit={handleTaskUpdate}
            onTaskDrop={handleTaskUpdate}
        />
    );
}
```

---

## 6. Data Binding Patronen

### 6.1 Statische Data

```jsx
const tasks = [
    { id: 1, name: 'Task 1', startDate: '2024-01-01', duration: 5 },
    { id: 2, name: 'Task 2', startDate: '2024-01-06', duration: 3 }
];

<BryntumGanttProjectModel
    tasks={tasks}
    dependencies={dependencies}
/>
```

### 6.2 Redux Data Binding

**Belangrijk**: Bryntum muteert data intern. Kopieer Redux data voordat je het doorgeeft:

```jsx
function GanttWithRedux() {
    const data = useSelector(state => state.ganttData);

    // BELANGRIJK: Kopieer data om Redux immutability te behouden
    const copy = data => data.map(item => ({ ...item }));

    return (
        <BryntumGanttProjectModel
            tasks={copy(data.tasks)}
            dependencies={copy(data.dependencies)}
            resources={copy(data.resources)}
            assignments={copy(data.assignments)}
            calendars={copy(data.calendars)}
        />
    );
}
```

### 6.3 RTK Query Integratie

```jsx
import { dataApi } from './services/data';

function GanttWithRTKQuery() {
    const [trigger, { data, isLoading, isError }] =
        dataApi.useLazyGetDataByNameQuery();

    useEffect(() => {
        trigger('project-1');
    }, [trigger]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading data</div>;

    const { tasks, dependencies, resources, assignments } = data;

    return (
        <BryntumGanttProjectModel
            tasks={tasks.map(t => ({ ...t }))}
            dependencies={dependencies.map(d => ({ ...d }))}
        />
    );
}
```

### 6.4 Async Data Loading

```jsx
function AsyncGantt() {
    const projectRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <>
            <BryntumGanttProjectModel
                ref={projectRef}
                autoLoad={true}
                transport={{
                    load: { url: '/api/gantt/load' }
                }}
                onLoad={() => setIsLoaded(true)}
            />

            {!isLoaded && <LoadingOverlay />}

            <BryntumGantt
                project={projectRef}
                disabled={!isLoaded}
            />
        </>
    );
}
```

---

## 7. State Management (Redux/Zustand)

### 7.1 Redux Setup

```javascript
// store/ganttSlice.js
import { createSlice } from '@reduxjs/toolkit';

const ganttSlice = createSlice({
    name: 'gantt',
    initialState: {
        dataset: 'default',
        zoomLevel: 10,
        selectedTaskIds: []
    },
    reducers: {
        setDataset: (state, action) => {
            state.dataset = action.payload;
        },
        setZoomLevel: (state, action) => {
            state.zoomLevel = action.payload;
        },
        setSelectedTasks: (state, action) => {
            state.selectedTaskIds = action.payload;
        }
    }
});

// store/uiSlice.js
const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        zoomAction: null  // 'zoomIn' | 'zoomOut' | null
    },
    reducers: {
        zoom: (state, action) => {
            state.zoomAction = action.payload;
        }
    }
});
```

### 7.2 Redux-Driven Actions

```jsx
function GanttController() {
    const ganttRef = useRef();
    const dispatch = useDispatch();
    const zoomAction = useSelector(state => state.ui.zoomAction);

    // React op Redux state changes
    useEffect(() => {
        if (zoomAction) {
            const gantt = ganttRef.current.instance;
            gantt[zoomAction]();  // 'zoomIn' of 'zoomOut'
            dispatch(uiActions.zoom(null));  // Reset action
        }
    }, [dispatch, zoomAction]);

    return <BryntumGantt ref={ganttRef} />;
}
```

### 7.3 Zustand Alternatief

```javascript
// store/useGanttStore.js
import { create } from 'zustand';

const useGanttStore = create((set, get) => ({
    tasks: [],
    selectedTaskId: null,

    setTasks: (tasks) => set({ tasks }),
    selectTask: (id) => set({ selectedTaskId: id }),

    // Actions die Gantt instance nodig hebben
    ganttRef: null,
    setGanttRef: (ref) => set({ ganttRef: ref }),

    zoomIn: () => {
        get().ganttRef?.current?.instance?.zoomIn();
    },

    scrollToTask: (taskId) => {
        const gantt = get().ganttRef?.current?.instance;
        const task = gantt?.taskStore.getById(taskId);
        if (task) gantt.scrollTaskIntoView(task);
    }
}));

// Component
function GanttWithZustand() {
    const ganttRef = useRef();
    const { setGanttRef, setTasks } = useGanttStore();

    useEffect(() => {
        setGanttRef(ganttRef);
    }, [setGanttRef]);

    return <BryntumGantt ref={ganttRef} />;
}
```

---

## 8. JSX Rendering in Cells (Portals)

### 8.1 Portal Mechanisme

De React wrapper gebruikt React Portals om JSX te renderen in Bryntum cellen:

```javascript
// WrapperHelper.tsx - processCellContent()
processCellContent(data) {
    const { column, cellElement, record } = data;

    // Als column.renderer JSX returned
    if (isValidElement(rendererResult)) {
        const containerId = `${record.id}-${column.id}`;

        // Maak portal container in cell
        const container = document.createElement('div');
        container.className = 'b-react-portal-container';
        cellElement.appendChild(container);

        // Render JSX via React Portal
        const portal = createPortal(rendererResult, container, containerId);
        this.state.portals.set(containerId, portal);
    }
}
```

### 8.2 Custom JSX Cell Renderer

```jsx
const columns = [
    {
        text: 'Status',
        field: 'status',
        renderer: ({ record }) => (
            <div className="status-badge">
                <StatusIcon status={record.status} />
                <span>{record.status}</span>
            </div>
        )
    },
    {
        text: 'Actions',
        renderer: ({ record }) => (
            <div className="action-buttons">
                <button onClick={() => handleEdit(record)}>
                    Edit
                </button>
                <button onClick={() => handleDelete(record)}>
                    Delete
                </button>
            </div>
        )
    }
];
```

### 8.3 JSX in Task Renderer

```jsx
const ganttProps = {
    taskRenderer: ({ taskRecord, renderData }) => {
        // Return JSX voor task bar content
        return (
            <div className="custom-task">
                <span className="task-name">{taskRecord.name}</span>
                <ProgressBar value={taskRecord.percentDone} />
                <Avatar user={taskRecord.assignedTo} />
            </div>
        );
    }
};
```

### 8.4 flushSync voor Export

Bij PDF export moet React synchronous renderen:

```javascript
// WrapperHelper.tsx
if (forExport) {
    flushSync(() => {
        this.setState({ portals: newPortals });
    });
}
```

---

## 9. Next.js Specifieke Patronen

### 9.1 Dynamic Import (Client-Side Only)

Bryntum gebruikt DOM APIs die niet beschikbaar zijn tijdens SSR:

```jsx
// components/GanttWrapper.jsx
'use client';

import dynamic from 'next/dynamic';

const BryntumGantt = dynamic(
    () => import('@bryntum/gantt-react').then(mod => mod.BryntumGantt),
    { ssr: false, loading: () => <div>Loading Gantt...</div> }
);

const BryntumGanttProjectModel = dynamic(
    () => import('@bryntum/gantt-react').then(mod => mod.BryntumGanttProjectModel),
    { ssr: false }
);

export function GanttWrapper(props) {
    return (
        <div className="gantt-container">
            <BryntumGantt {...props} />
        </div>
    );
}
```

### 9.2 App Router Pattern

```jsx
// app/gantt/page.tsx
import { GanttWrapper } from '@/components/GanttWrapper';
import { getGanttData } from '@/lib/data';

export default async function GanttPage() {
    // Server-side data fetching
    const data = await getGanttData();

    return (
        <div className="h-screen">
            <GanttWrapper initialData={data} />
        </div>
    );
}

// components/GanttWrapper.tsx
'use client';

export function GanttWrapper({ initialData }) {
    const [data, setData] = useState(initialData);

    return (
        <BryntumGantt
            project={{
                tasks: data.tasks,
                dependencies: data.dependencies
            }}
        />
    );
}
```

### 9.3 CSS Import

```jsx
// app/layout.tsx of _app.tsx
import '@bryntum/gantt/gantt.stockholm.css';
```

### 9.4 Webpack Configuratie

```javascript
// next.config.js
module.exports = {
    transpilePackages: ['@bryntum/gantt', '@bryntum/gantt-react'],

    webpack: (config) => {
        // Bryntum packages zijn ESM
        config.resolve.extensionAlias = {
            '.js': ['.ts', '.tsx', '.js', '.jsx']
        };
        return config;
    }
};
```

---

## 10. Performance Optimalisatie

### 10.1 shouldComponentUpdate Override

De wrapper voorkomt onnodige re-renders:

```javascript
// WrapperHelper.tsx
shouldComponentUpdate(nextProps) {
    const result = WrapperHelper.shouldComponentUpdate(
        this,
        this.props,
        nextProps
    );
    // Returned meestal false - widget managed eigen updates
    return result;
}
```

### 10.2 Memoization van Config

```jsx
const ganttConfig = useMemo(() => ({
    columns: [...],
    features: {...},
    viewPreset: 'weekAndDayLetter'
}), []);  // Alleen herberekenen als nodig

<BryntumGantt {...ganttConfig} />
```

### 10.3 Lazy Loading van Data

```jsx
function LazyGantt() {
    const [visibleRange, setVisibleRange] = useState(null);

    return (
        <BryntumGantt
            infiniteScroll={true}
            bufferCoef={5}

            onVisibleDateRangeChange={({ new: range }) => {
                setVisibleRange(range);
                // Fetch only visible data
                fetchTasksInRange(range.startDate, range.endDate);
            }}
        />
    );
}
```

### 10.4 Virtualization Settings

```jsx
const ganttProps = {
    // Alleen zichtbare rows renderen
    rowHeight: 45,

    // Buffer voor smooth scrolling
    bufferCoef: 5,

    // Lazy row rendering
    enableSticky: true,

    // Disable features voor grote datasets
    features: {
        dependencies: {
            // Alleen dependencies in viewport tekenen
            drawOnScroll: true
        }
    }
};
```

---

## 11. TypeScript Integratie

### 11.1 Type Imports

```typescript
import {
    BryntumGantt,
    BryntumGanttProps,
    BryntumGanttProjectModel,
    BryntumGanttProjectModelProps
} from '@bryntum/gantt-react';

import type {
    Gantt,
    ProjectModel,
    TaskModel,
    DependencyModel,
    ColumnConfig,
    GanttFeaturesConfigType
} from '@bryntum/gantt';
```

### 11.2 Typed Refs

```typescript
import { useRef } from 'react';
import type { Gantt, ProjectModel } from '@bryntum/gantt';

function TypedGantt() {
    const ganttRef = useRef<{ instance: Gantt } | null>(null);
    const projectRef = useRef<{ instance: ProjectModel } | null>(null);

    const handleClick = () => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.zoomIn();
        }
    };

    return (
        <>
            <BryntumGanttProjectModel ref={projectRef} />
            <BryntumGantt ref={ganttRef} project={projectRef} />
        </>
    );
}
```

### 11.3 Typed Event Handlers

```typescript
import type { TaskClickEvent, DependencyClickEvent } from '@bryntum/gantt';

const handleTaskClick = (event: TaskClickEvent) => {
    const { taskRecord, domEvent } = event;
    console.log(taskRecord.name, domEvent.clientX);
};

const handleDependencyClick = (event: DependencyClickEvent) => {
    const { dependency } = event;
    console.log(dependency.fromTask.name, dependency.toTask.name);
};
```

### 11.4 Custom TaskModel Type

```typescript
interface CustomTaskData {
    id: number;
    name: string;
    startDate: Date | string;
    duration: number;
    customField: string;
    priority: 'high' | 'medium' | 'low';
}

// Type-safe task store operations
const gantt = ganttRef.current?.instance;
const tasks = gantt?.taskStore.records as TaskModel[];
const customTask = tasks[0] as TaskModel & CustomTaskData;
```

---

## 12. Cross-References

### Gerelateerde Documenten

| Document | Relevante Secties |
|----------|-------------------|
| [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) | Event handling, listeners |
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | ProjectModel, stores |
| [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) | Custom widgets, TaskEditor |
| [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) | taskRenderer, DomConfig |
| [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md) | Backend sync, offline mode |

### Code Referenties

| Pattern | Bestand | Lijn |
|---------|---------|------|
| BryntumGantt class | `vendor/gantt-react/src/BryntumGantt.tsx` | 4054 |
| Portal management | `vendor/gantt-react/src/WrapperHelper.tsx` | processCellContent() |
| shouldComponentUpdate | `vendor/gantt-react/src/WrapperHelper.tsx` | shouldComponentUpdate() |
| DataStores mapping | `vendor/gantt-react/src/BryntumGanttProjectModel.tsx` | 946-954 |

### Bryntum Demo Voorbeelden

| Demo | Pattern |
|------|---------|
| `react/javascript/gantt-redux` | Redux state management |
| `react/javascript/resource-histogram` | Multi-view met addPartner() |
| `react/javascript/taskeditor` | Custom TaskEditor tabs |
| `react/typescript/sharepoint-fabric` | TypeScript + Office Fabric |

---

## Samenvatting

### Best Practices

1. **Gebruik refs voor instance access** - `ganttRef.current.instance`
2. **Kopieer Redux data** - Voorkom mutatie van immutable state
3. **Definieer config in apart bestand** - Houdt components schoon
4. **Gebruik ProjectModel component** - Scheidt data van UI
5. **Dynamic import in Next.js** - SSR compatibiliteit
6. **Memoize config objects** - Voorkom onnodige re-renders

### Anti-Patterns

1. ❌ Direct data muteren van Redux store
2. ❌ SSR van Bryntum components
3. ❌ Inline config objects (veroorzaakt re-renders)
4. ❌ `forceUpdate()` of `setState()` voor Gantt updates
5. ❌ Event handlers direct in JSX (bind issues)

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
