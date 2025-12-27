# Performance Optimization Patterns

Dit document beschrijft performance optimalisatie patronen voor Bryntum componenten bij grote datasets.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Big Dataset Handling](#big-dataset-handling)
3. [Lazy Loading](#lazy-loading)
4. [Infinite Scroll](#infinite-scroll)
5. [Sparse Index](#sparse-index)
6. [Batch Updates](#batch-updates)
7. [Feature Toggles](#feature-toggles)
8. [Data Generation](#data-generation)
9. [Best Practices](#best-practices)

---

## Overzicht

### Performance Metrics

| Configuratie | Tasks | Render tijd |
|-------------|-------|-------------|
| Default | 1,000 | ~500ms |
| useRawData | 1,000 | ~300ms |
| useRawData + suspendRefresh | 5,000 | ~800ms |
| lazyLoad | 10,000+ | Instant (paginated) |
| infiniteScroll | Unlimited | Progressive |

### Key Optimisaties

```typescript
// 1. Raw Data - skip cloning
taskStore : { useRawData : true }

// 2. Lazy Loading - load on demand
resourceStore : { lazyLoad : { chunkSize : 30 } }

// 3. Batch Updates - single refresh
scheduler.suspendRefresh();
// ... modifications
scheduler.resumeRefresh(true);

// 4. Feature Toggles - disable expensive features
stickyEvents    : false,
scheduleTooltip : false
```

---

## Big Dataset Handling

### useRawData Pattern

De `useRawData` optie zorgt dat stores data objecten niet kopiëren maar direct gebruiken:

```typescript
const project = new ProjectModel({
    // Skip object cloning voor snellere record creatie
    taskStore : {
        useRawData : true
    },
    dependencyStore : {
        useRawData : true
    },
    resourceStore : {
        useRawData : true
    },
    assignmentStore : {
        useRawData : true
    }
});
```

### Project Replacement Pattern

Bij grote data wijzigingen is het vaak sneller om het hele project te vervangen:

```typescript
async generateDataset(count) {
    // Mask tonen voor UX
    if (count > 1000) {
        gantt.mask('Generating tasks');
    }

    // Wacht op DOM update
    await AsyncHelper.sleep(100);

    // Genereer data
    const config = await ProjectGenerator.generateAsync(count, projectSize);

    // Wacht voor calculations
    await AsyncHelper.sleep(10);

    // Destroy oude project
    gantt.project?.destroy();

    // Nieuw project met useRawData
    gantt.project = new ProjectModel({
        taskStore       : { useRawData : true },
        dependencyStore : { useRawData : true },
        ...config
    });

    // Update view
    gantt.startDate = gantt.project.startDate;

    if (count > 1000) {
        gantt.unmask();
    }
}
```

### Alternative Load Patterns

```typescript
// Optie A: Replace project (hierboven)

// Optie B: Replace store data per store
gantt.taskStore.data = config.tasksData;
gantt.dependencyStore.data = config.dependenciesData;

// Optie C: Replace via project inline data
gantt.project.loadInlineData(config);
```

---

## Lazy Loading

### Store-Level Lazy Loading

```typescript
const scheduler = new SchedulerPro({
    project : {
        resourceStore : {
            // Lazy load met chunk size
            lazyLoad : { chunkSize : 30 },
            autoLoad : true,

            // Custom data request handler
            async requestData({ startIndex, count }) {
                const response = await fetch(
                    `/api/resources?offset=${startIndex}&limit=${count}`
                );
                const data = await response.json();

                return {
                    data  : data.rows,
                    total : data.total  // Totaal aantal records
                };
            }
        },

        eventStore : {
            tree     : true,
            lazyLoad : true,

            async requestData({ startDate, endDate, startIndex, count }) {
                const response = await fetch(
                    `/api/events?` +
                    `start=${startDate.toISOString()}&` +
                    `end=${endDate.toISOString()}&` +
                    `offset=${startIndex}&limit=${count}`
                );
                const data = await response.json();

                return { data };
            }
        },

        assignmentStore : {
            lazyLoad : true,

            async requestData({ startDate, endDate, startIndex, count }) {
                const response = await fetch(
                    `/api/assignments?` +
                    `start=${startDate.toISOString()}&` +
                    `end=${endDate.toISOString()}`
                );
                const data = await response.json();

                return { data };
            }
        }
    },

    features : {
        // Grouping niet supported met lazy load
        group  : false,
        filter : false
    }
});
```

### Lazy Load Events

```typescript
store.on({
    lazyLoadStarted() {
        console.log('Lazy load started');
    },

    lazyLoadEnded() {
        console.log('Lazy load finished');
    }
});

// Wacht op lazy load completion
if (store.isLoading) {
    await store.await('lazyLoadEnded', false);
}
```

---

## Infinite Scroll

### Timeline Infinite Scroll

```typescript
const scheduler = new SchedulerPro({
    // Enable endless timeline scrolling
    infiniteScroll : true,

    // Grotere buffer voor betere UX met lazy loading
    // Alleen events in/nabij zichtbare range worden geladen
    bufferCoef     : 20,

    // Wanneer timespan shift bij horizontale scroll
    bufferThreshold : 0.01,

    // Voorkom te lange date ranges
    minZoomLevel : 11,

    // Center op specifieke datum
    visibleDate : new Date(2024, 1, 6),

    project : {
        autoLoad       : true,
        autoSync       : true,
        lazyLoad       : true,
        loadUrl        : 'api/read',
        syncUrl        : 'api/sync',
        phantomIdField : 'phantomId',

        // Sync settings voor lazy loaded stores
        assignmentStore : {
            syncDataOnLoad : false
        },
        resourceStore : {
            syncDataOnLoad : false,
            fields         : [
                { name : 'calendar', persist : false },
                { name : 'parentId', persist : false }
            ]
        },
        eventStore : {
            syncDataOnLoad : false,
            fields         : [
                { name : 'duration', persist : false },
                { name : 'effort', persist : false }
            ]
        }
    },

    columns : [
        {
            text       : 'Resource',
            field      : 'name',
            width      : 200,
            // Sorting/filtering niet compatible met lazy load
            sortable   : false,
            filterable : false
        }
    ],

    tbar : [
        {
            type : 'viewpresetcombo'
        },
        '->',
        {
            type : 'button',
            text : 'Reset data',
            icon : 'fa fa-refresh',
            onClick() {
                scheduler.project.load({ reset : true });
            }
        }
    ]
});
```

---

## Sparse Index

### Sparse Index voor Tree Stores

Sparse index optimaliseert tree stores voor grote hierarchische datasets:

```typescript
const project = ProjectModel.new({
    loadUrl            : '/project',
    syncUrl            : '/project',
    autoSetConstraints : true,
    autoLoad           : false,
    autoSync           : false,

    taskStore : {
        // Enable sparse index voor tree data
        useSparseIndex     : true,
        // Behoud expanded state na load niet
        keepExpandedOnLoad : false,
        // Transform flat data naar tree
        transformFlatData  : true
    },

    listeners : {
        changes : toggleSyncButton,
        dataReady : toggleSyncButton,
        beforeLoadApply : disableSyncButton,
        beforeSyncApply : disableSyncButton
    }
});
```

### Sparse Index Column

```typescript
columns : [
    { type : 'name', width : 250 },
    {
        type     : 'template',
        field    : 'sparseIndex',
        readOnly : true,
        sortable : false,
        template : ({ record }) => `[${record.get('sparseIndex') ?? '—'}]`,
        text     : 'Sparse index',
        width    : 120,
        align    : 'center'
    }
]
```

### Database Integration

```typescript
// Check database status
const checkDbStatus = async(store, setButtonStates) => {
    const res = await fetch('/db/status');
    const status = await res.json();

    if (status.success && status.stores.every(s => s.hasData)) {
        if (store.isProject) {
            await store.load('/project');
        }
        else {
            await store.load();
        }
        setButtonStates(true);
        return true;
    }
    else {
        // Seed database indien leeg
        const res = await fetch('/db/seed', { method : 'POST' });
        if (res.ok) {
            await store.load();
            setButtonStates(true);
            return true;
        }
    }
    return false;
};

// Drop database
const dropDB = async(store, setButtonStates) => {
    setButtonStates(false);
    const res = await fetch('/db/drop', { method : 'POST' });

    if (res.ok) {
        // Wacht op lazy load completion
        if (store.isLoading) {
            await store.await('lazyLoadEnded', false);
        }
        await store.clear();
    }
};
```

---

## Batch Updates

### suspendRefresh / resumeRefresh

```typescript
// Suspend alle view updates
scheduler.suspendRefresh();

// Bulk modificaties
scheduler.endDate = newEndDate;
scheduler.project = {
    assignmentStore : {
        useRawData : true,
        data       : assignments
    },
    resourceStore : {
        useRawData : true,
        data       : resources
    },
    eventStore : {
        useRawData : true,
        data       : events
    },
    dependencyStore : {
        useRawData : true,
        data       : dependencies
    }
};

// Resume en trigger single refresh
scheduler.resumeRefresh(true);

// Wacht op project commit
await scheduler.project.commitAsync();
```

### Prevent Event Transitions

```typescript
// Disable animaties tijdens bulk load
scheduler.element.classList.add('b-prevent-event-transitions');

// ... load data

// Re-enable animaties
scheduler.element.classList.remove('b-prevent-event-transitions');
```

### Progress Masking

```typescript
import { Mask, AsyncHelper } from '@bryntum/gantt';

async function loadLargeDataset() {
    const mask = Mask.mask('Generating records', scheduler.element);

    let processed = 0;
    const total = 10000;

    while (processed < total) {
        // Process batch
        processed += 2000;

        // Update mask text
        mask.text = `Generated ${processed} of ${total} records`;

        // Allow DOM update
        await AsyncHelper.animationFrame();
    }

    mask.text = 'Loading data';

    // Final load
    await loadData();

    mask.close();
}
```

---

## Feature Toggles

### Disable Expensive Features

```typescript
const scheduler = new SchedulerPro({
    features : {
        // Turn off sticky events voor betere performance
        stickyEvents : false,

        // Turn off schedule tooltip voor sneller scrollen
        scheduleTooltip : false,

        // Dependencies kunnen duur zijn bij veel records
        dependencies : {
            disabled : true  // of true om te enablen
        },

        // Resource time ranges
        resourceTimeRanges : {
            disabled : true
        },

        // Non-working time shading
        resourceNonWorkingTime : true,
        nonWorkingTime         : false,

        // Grouping en filtering niet compatible met lazy load
        group  : false,
        filter : false
    },

    // Disable initial animation
    useInitialAnimation : false,

    // Disable transitions
    transitions : false
});
```

### Dynamic Feature Toggles

```typescript
// Toggle dependencies dynamically
scheduler.features.dependencies.disabled = !enabled;

// Regenereer data als feature opnieuw enabled wordt
if (enabled && !scheduler.dependencyStore.count) {
    await generateData();
}
```

---

## Data Generation

### ProjectGenerator (Gantt)

```typescript
import { ProjectGenerator, AsyncHelper } from '@bryntum/gantt';

async function generateGanttData(taskCount, projectSize) {
    // Async generatie met progress
    const config = await ProjectGenerator.generateAsync(taskCount, projectSize);

    // config bevat:
    // - tasksData
    // - dependenciesData
    // - calendarsData
    // - resourcesData
    // - assignmentsData

    return config;
}
```

### DataGenerator (SchedulerPro)

```typescript
import { DataGenerator, DateHelper, AsyncHelper } from '@bryntum/schedulerpro';

async function generateSchedulerData(resourceCount, eventCount) {
    const
        today      = DateHelper.clearTime(new Date()),
        resources  = [],
        events     = [],
        assignments = [],
        dependencies = [];

    // Generator pattern
    const generator = DataGenerator.generate(resourceCount);

    let step;
    while ((step = generator.next()) && !step.done) {
        const res = step.value;
        resources.push(res);

        // Genereer events per resource
        let startDate = DateHelper.add(today, Math.round(Math.random() * 20), 'days');

        for (let j = 0; j < eventCount; j++) {
            const
                duration = Math.round(Math.random() * 9) + 2,
                endDate  = DateHelper.add(startDate, duration, 'days'),
                eventId  = events.length + 1;

            events.push({
                id         : eventId,
                name       : `Task #${eventId}`,
                startDate,
                duration,
                endDate,
                eventColor : ['cyan', 'green', 'indigo'][resources.length % 3]
            });

            assignments.push({
                id       : `a${eventId}`,
                event    : eventId,
                resource : res.id
            });

            if (j > 0) {
                dependencies.push({
                    id   : dependencies.length + 1,
                    from : eventId - 1,
                    to   : eventId,
                    lag  : 3
                });
            }

            startDate = DateHelper.add(endDate, 3, 'days');
        }

        // Progress update elke 2000 resources
        if (resources.length % 2000 === 0) {
            await AsyncHelper.animationFrame();
        }
    }

    return { resources, events, assignments, dependencies };
}
```

### AsyncHelper Utilities

```typescript
import { AsyncHelper } from '@bryntum/gantt';

// Sleep voor DOM updates
await AsyncHelper.sleep(100);

// Wacht op animation frame
await AsyncHelper.animationFrame();

// Next tick
await AsyncHelper.nextTick();
```

---

## Best Practices

### 1. Initial Load Optimisatie

```typescript
const gantt = new Gantt({
    // Specifieke start/end dates voor beperkte initial render
    startDate : '2025-01-05',
    endDate   : '2025-03-24',

    // Disable initial animation
    useInitialAnimation : false,

    // Disable transitions
    transitions : false,

    // Lege text tijdens load
    emptyText : ''
});
```

### 2. View Preset voor Performance

```typescript
import { PresetManager } from '@bryntum/gantt';

// Custom preset met optimale tick size
PresetManager.registerPreset('threeMonths', {
    name            : '3 months',
    base            : 'weekAndDayLetter',
    tickSize        : 20,  // Kleinere ticks = minder DOM elements
    defaultSpan     : 3,
    defaultSpanUnit : 'month'
});
```

### 3. Column Optimisatie

```typescript
columns : [
    { type : 'name', field : 'name', width : 200 },
    { type : 'startdate', text : 'Start date' },
    { type : 'duration', text : 'Duration' }
    // Minimaal aantal kolommen voor initial load
]
```

### 4. Memory Management

```typescript
// Destroy project bij replacement
gantt.project?.destroy();

// Clear stores indien nodig
await store.clear();

// Unregister service workers
const registrations = await navigator.serviceWorker.getRegistrations();
await Promise.all(registrations.map(reg => reg.unregister()));
```

### 5. Conditional Feature Loading

```typescript
// Start met minimal features
const scheduler = new SchedulerPro({
    features : {
        dependencies       : false,
        resourceTimeRanges : { disabled : true },
        stickyEvents       : false,
        scheduleTooltip    : false
    }
});

// Enable features on demand
function enableAdvancedFeatures() {
    scheduler.features.dependencies.disabled = false;
    scheduler.features.resourceTimeRanges.disabled = false;
}
```

### 6. Debounced Updates

```typescript
{
    type                 : 'number',
    ref                  : 'countField',
    keyStrokeChangeDelay : 500,  // Debounce keyboard input
    changeOnSpin         : 500,  // Debounce spinner clicks
    onChange({ userAction }) {
        if (userAction) {
            regenerateData();
        }
    }
}
```

---

## Performance Checklist

### Initial Load
- [ ] `useRawData` enabled op alle stores
- [ ] `useInitialAnimation : false`
- [ ] `transitions : false`
- [ ] Beperkte date range
- [ ] Minimal columns

### Large Datasets (>1000 records)
- [ ] Lazy loading enabled
- [ ] `stickyEvents : false`
- [ ] `scheduleTooltip : false`
- [ ] Mask voor progress feedback
- [ ] `suspendRefresh()` bij bulk updates

### Very Large Datasets (>10000 records)
- [ ] `infiniteScroll : true`
- [ ] `useSparseIndex : true` (tree stores)
- [ ] Pagination op server
- [ ] Group/filter disabled

### Memory
- [ ] Project destroy bij replacement
- [ ] Store clear bij reset
- [ ] Service worker cleanup

---

## Gerelateerde Documentatie

- [INTEGRATION-REALTIME.md](./INTEGRATION-REALTIME.md) - Realtime updates
- [INTEGRATION-FRAMEWORKS.md](./INTEGRATION-FRAMEWORKS.md) - Framework integratie
- [INTEGRATION-EXPORT.md](./INTEGRATION-EXPORT.md) - Export functies
