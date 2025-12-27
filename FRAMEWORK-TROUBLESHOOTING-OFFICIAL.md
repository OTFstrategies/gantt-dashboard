# Bryntum Framework Troubleshooting - Official Reference

> **Bron**: Officiële Bryntum v7.1.0 troubleshooting guides voor Angular, React en Vue

---

## Angular Troubleshooting

### Version Requirements

| Dependency | Minimum Version |
|------------|-----------------|
| Angular | 9.0.0+ |
| TypeScript | 3.6.0+ |
| Vite | 4.0.0+ |

### Vite Multiple Bundle Loading Issue

**Probleem**: Angular application laadt meerdere Bryntum bundles, veroorzaakt errors.

**Oplossing**: Configureer `optimizeDeps` in `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
    optimizeDeps: {
        include: [
            '@bryntum/gantt',
            '@bryntum/gantt-angular'
        ]
    }
});
```

### Memory Issues During Build

**Probleem**: Out of memory error bij build van grote applicaties.

**Oplossing**: Verhoog Node.js memory limit:

```bash
# Linux/Mac
export NODE_OPTIONS=--max-old-space-size=8192
ng build

# Windows PowerShell
$env:NODE_OPTIONS="--max-old-space-size=8192"
ng build

# Windows CMD
set NODE_OPTIONS=--max-old-space-size=8192
ng build
```

### Legacy Peer Dependencies (npm 7+)

**Probleem**: npm 7+ geeft errors over peer dependency conflicts.

**Oplossing**: Gebruik `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

Of voeg toe aan `.npmrc`:

```
legacy-peer-deps=true
```

### OpenSSL Legacy Provider (Node 18+)

**Probleem**: Crypto errors met Node.js 18+ en oudere Angular versies.

**Oplossing**: Enable legacy OpenSSL provider:

```bash
# Linux/Mac
export NODE_OPTIONS=--openssl-legacy-provider
ng serve

# Windows
set NODE_OPTIONS=--openssl-legacy-provider
ng serve
```

### Zone.js Change Detection

**Probleem**: Bryntum events triggeren geen Angular change detection.

**Oplossing**: Wrap event handlers in NgZone:

```typescript
import { Component, NgZone } from '@angular/core';

@Component({...})
export class GanttComponent {
    constructor(private zone: NgZone) {}

    onTaskClick(event: any) {
        this.zone.run(() => {
            // Angular detecteert nu deze changes
            this.selectedTask = event.taskRecord;
        });
    }
}
```

### Strict Mode Type Errors

**Probleem**: TypeScript strict mode geeft errors op Bryntum configs.

**Oplossing**: Type assertion gebruiken:

```typescript
const ganttConfig: Partial<GanttConfig> = {
    columns: [...] as ColumnConfig[],
    features: {...} as Partial<GanttFeaturesConfigType>
};
```

---

## React Troubleshooting

### Version Requirements

| Dependency | Minimum Version |
|------------|-----------------|
| React | 16.8.0+ (hooks support) |
| React DOM | 16.8.0+ |
| TypeScript | 3.6.0+ (optional) |

### React 18 Strict Mode Double-Mount Issue

**Probleem**: React 18+ Strict Mode mount components tweemaal, veroorzaakt "Bryntum component already destroyed" errors.

**Symptomen**:
- Console error: "Cannot read property of null (reading 'destroy')"
- Gantt chart verschijnt niet of verdwijnt direct
- Errors alleen in development mode

**Oplossing 1**: Disable Strict Mode (niet aanbevolen voor productie):

```jsx
// index.js
root.render(
    // <React.StrictMode>
        <App />
    // </React.StrictMode>
);
```

**Oplossing 2**: Gebruik `useRef` pattern met cleanup guard:

```jsx
import { useRef, useEffect } from 'react';
import { BryntumGantt } from '@bryntum/gantt-react';

function GanttComponent() {
    const ganttRef = useRef(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;

        return () => {
            // Cleanup alleen bij echte unmount
            if (ganttRef.current?.instance) {
                ganttRef.current.instance.destroy();
            }
        };
    }, []);

    return <BryntumGantt ref={ganttRef} {...config} />;
}
```

**Oplossing 3**: Gebruik key prop om remount te forceren:

```jsx
function GanttWrapper() {
    const [ganttKey, setGanttKey] = useState(Date.now());

    return <BryntumGantt key={ganttKey} {...config} />;
}
```

### Circular Dependency Warnings (Thin Bundles)

**Probleem**: Vite/Rollup geeft circular dependency warnings bij thin bundles.

**Oplossing**: Suppress warnings in `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            onLog(level, log, handler) {
                if (log.code === 'CIRCULAR_DEPENDENCY') {
                    return; // Ignore circular dependency warnings
                }
                handler(level, log);
            }
        }
    }
});
```

### State Management Integration

**Probleem**: Redux/Context state updates reflecteren niet in Gantt.

**Oplossing**: Gebruik `syncDataOnLoad` en controlled updates:

```jsx
function GanttWithRedux() {
    const tasks = useSelector(state => state.tasks);
    const ganttRef = useRef(null);

    useEffect(() => {
        if (ganttRef.current?.instance) {
            // Sync externe state naar Gantt
            ganttRef.current.instance.project.loadInlineData({
                tasksData: tasks
            });
        }
    }, [tasks]);

    return (
        <BryntumGantt
            ref={ganttRef}
            syncDataOnLoad={true}
            {...config}
        />
    );
}
```

### Hot Module Replacement Issues

**Probleem**: HMR veroorzaakt duplicate Gantt instances of state loss.

**Oplossing**: Proper cleanup in development:

```jsx
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        // Cleanup voor HMR
        if (window.__bryntumGanttInstance) {
            window.__bryntumGanttInstance.destroy();
        }
    });
}
```

---

## Vue Troubleshooting

### Version Requirements

| Dependency | Minimum Version | Notes |
|------------|-----------------|-------|
| Vue 3 | 3.0.0+ | Recommended |
| Vue 2 | 2.6.0+ | EOL - migrate to Vue 3 |
| Vite | 4.0.0+ | For Vue 3 |
| Vue CLI | 4.0.0+ | For Vue 2 |

### Vue 2 End of Life Notice

Vue 2 reached End of Life on December 31, 2023. Bryntum recommends migrating to Vue 3 for:
- Security updates
- Performance improvements
- Better TypeScript support
- Composition API

### Vue CLI transpileDependencies

**Probleem**: Vue CLI transpileert Bryntum packages niet correct.

**Oplossing**: Voeg toe aan `vue.config.js`:

```javascript
module.exports = {
    transpileDependencies: [
        '@bryntum/gantt',
        '@bryntum/gantt-vue-3'
    ]
};
```

### ESLint Ignore voor Bryntum Modules

**Probleem**: ESLint geeft errors op Bryntum source files.

**Oplossing**: Voeg toe aan `.eslintignore`:

```
# Bryntum modules
**/node_modules/@bryntum/**
```

Of in `vue.config.js`:

```javascript
module.exports = {
    chainWebpack: config => {
        config.module
            .rule('eslint')
            .exclude
            .add(/node_modules\/@bryntum/);
    }
};
```

### Vite Build Optimizations

**Probleem**: Lange build times of grote bundle sizes.

**Oplossing**: Configureer `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue()],
    optimizeDeps: {
        include: ['@bryntum/gantt']
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    bryntum: ['@bryntum/gantt']
                }
            }
        }
    }
});
```

### Composition API Integration

**Probleem**: Reactivity werkt niet correct met Bryntum instances.

**Oplossing**: Gebruik `shallowRef` voor Bryntum instances:

```vue
<script setup>
import { shallowRef, onMounted, onUnmounted } from 'vue';
import { BryntumGantt } from '@bryntum/gantt-vue-3';

const ganttRef = shallowRef(null);
const selectedTask = shallowRef(null);

const onTaskClick = ({ taskRecord }) => {
    // shallowRef voorkomt deep reactivity issues
    selectedTask.value = taskRecord;
};

onMounted(() => {
    // Access Gantt instance
    const gantt = ganttRef.value?.instance;
});
</script>

<template>
    <bryntum-gantt
        ref="ganttRef"
        @taskClick="onTaskClick"
        v-bind="ganttConfig"
    />
</template>
```

### Vue Devtools Integration

**Probleem**: Vue Devtools toont geen Bryntum component state.

**Oplossing**: Expose relevante data voor debugging:

```vue
<script setup>
import { computed } from 'vue';

const ganttRef = ref(null);

// Expose voor Vue Devtools
defineExpose({
    ganttInstance: computed(() => ganttRef.value?.instance),
    taskCount: computed(() => ganttRef.value?.instance?.taskStore.count)
});
</script>
```

---

## Cross-Framework Issues

### Bundle Size Optimization

Alle frameworks kunnen profiteren van tree-shaking met thin bundles:

```javascript
// In plaats van full bundle
import { Gantt } from '@bryntum/gantt';

// Gebruik thin bundle (requires bundler config)
import { Gantt } from '@bryntum/gantt/gantt.thin.js';
```

### CSS Import Order

**Probleem**: Styling issues door verkeerde CSS import order.

**Correcte volgorde** (v7.0+):

```javascript
// 1. FontAwesome
import '@bryntum/gantt/fonts/fontawesome/css/fontawesome.css';
import '@bryntum/gantt/fonts/fontawesome/css/solid.css';

// 2. Structural CSS
import '@bryntum/gantt/gantt.css';

// 3. Theme
import '@bryntum/gantt/stockholm-light.css';

// 4. Custom styles (laatste)
import './custom-styles.css';
```

### Async Data Loading

**Probleem**: Component mount voordat data geladen is.

**Pattern voor alle frameworks**:

```javascript
// Gebruik project.loadInlineData na mount
const ganttConfig = {
    project: {
        // Geen data hier
    }
};

// Na mount, laad data async
async function loadData() {
    const response = await fetch('/api/project');
    const data = await response.json();

    gantt.project.loadInlineData({
        tasksData: data.tasks,
        dependenciesData: data.dependencies,
        resourcesData: data.resources,
        assignmentsData: data.assignments
    });
}
```

### Event Handler Memory Leaks

**Probleem**: Event listeners worden niet opgeruimd bij component destroy.

**Pattern voor alle frameworks**:

```javascript
// Store listener references
const listeners = [];

function addListener(event, handler) {
    gantt.on(event, handler);
    listeners.push({ event, handler });
}

// Cleanup bij destroy
function cleanup() {
    listeners.forEach(({ event, handler }) => {
        gantt.un(event, handler);
    });
    listeners.length = 0;
}
```

---

## Common Error Messages

### "Cannot read property 'destroy' of null"

**Oorzaak**: Component probeert te destroyen terwijl instance al null is.

**Oplossing**: Null check voor destroy:

```javascript
if (ganttRef.current?.instance && !ganttRef.current.instance.isDestroyed) {
    ganttRef.current.instance.destroy();
}
```

### "Bryntum component already registered"

**Oorzaak**: Dubbele registratie van custom widget of column.

**Oplossing**: Check of al geregistreerd:

```javascript
if (!ColumnStore.getColumnClass('mycolumn')) {
    ColumnStore.registerColumnType(MyColumn);
}
```

### "Maximum call stack size exceeded"

**Oorzaak**: Circular reactivity of infinite event loops.

**Oplossing**:
1. Gebruik `shallowRef` (Vue) of vermijd deep objects in state
2. Guard tegen re-entry in event handlers:

```javascript
let isUpdating = false;

function onDataChange() {
    if (isUpdating) return;
    isUpdating = true;
    try {
        // Update logic
    } finally {
        isUpdating = false;
    }
}
```

### "ResizeObserver loop limit exceeded"

**Oorzaak**: Resize triggers nieuwe resize (infinite loop).

**Oplossing**: Debounce resize handlers of negeer warning:

```javascript
// Negeer in development
if (typeof window !== 'undefined') {
    const resizeObserverErr = window.console.error;
    window.console.error = (...args) => {
        if (args[0]?.includes?.('ResizeObserver')) return;
        resizeObserverErr(...args);
    };
}
```

---

## Performance Best Practices

### 1. Lazy Loading

```javascript
// Dynamic import voor code splitting
const BryntumGantt = lazy(() => import('@bryntum/gantt-react'));

function App() {
    return (
        <Suspense fallback={<Loading />}>
            <BryntumGantt {...config} />
        </Suspense>
    );
}
```

### 2. Virtual Rendering

Bryntum gebruikt automatisch virtual rendering, maar je kunt het optimaliseren:

```javascript
const ganttConfig = {
    // Verhoog buffer voor smoother scrolling
    bufferCoef: 5,

    // Disable features die je niet gebruikt
    features: {
        cellEdit: false,
        taskTooltip: false
    }
};
```

### 3. Batch Updates

```javascript
// Slecht - triggers meerdere renders
tasks.forEach(task => gantt.taskStore.add(task));

// Goed - één render
gantt.taskStore.add(tasks);

// Of gebruik suspendEvents
gantt.taskStore.suspendEvents();
tasks.forEach(task => gantt.taskStore.add(task));
gantt.taskStore.resumeEvents();
```

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
*Extracted from: Official troubleshooting guides (Angular, React, Vue)*
