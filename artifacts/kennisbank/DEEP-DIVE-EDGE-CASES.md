# DEEP-DIVE: Edge Cases & Gotchas

> **Level 2** - Veelvoorkomende valkuilen, edge cases en best practices voor Bryntum Gantt.

---

## Inhoudsopgave

1. [Data Binding Gotchas](#1-data-binding-gotchas)
2. [Scheduling Conflicts](#2-scheduling-conflicts)
3. [Performance Valkuilen](#3-performance-valkuilen)
4. [React/Next.js Specifiek](#4-reactnextjs-specifiek)
5. [Store & Model Gotchas](#5-store--model-gotchas)
6. [Feature Interacties](#6-feature-interacties)
7. [Browser Quirks](#7-browser-quirks)
8. [Memory Leaks](#8-memory-leaks)
9. [Common Error Messages](#9-common-error-messages)
10. [Cross-References](#10-cross-references)

---

## 1. Data Binding Gotchas

### 1.1 Redux Immutability

**Probleem**: Bryntum muteert data objecten intern.

```javascript
// FOUT: Direct Redux state doorgeven
const tasks = useSelector(state => state.tasks);
<BryntumGanttProjectModel tasks={tasks} />
// ❌ Redux state wordt gemuteerd!
```

**Oplossing**: Kopieer data voordat je het doorgeeft:

```javascript
// GOED: Kopieer data
const tasks = useSelector(state => state.tasks);
const copy = data => data.map(item => ({ ...item }));

<BryntumGanttProjectModel tasks={copy(tasks)} />
```

### 1.2 State Updates Niet Zichtbaar

**Probleem**: React state updates reflecteren niet in Gantt.

```javascript
// FOUT: Denken dat state updates automatisch doorwerken
const [tasks, setTasks] = useState(initialTasks);
setTasks([...tasks, newTask]);  // Gantt ziet dit niet!
```

**Oplossing**: Gebruik store API direct:

```javascript
// GOED: Gebruik store methods
const gantt = ganttRef.current.instance;
gantt.taskStore.add(newTask);
```

### 1.3 Circular References

**Probleem**: Circular references in data veroorzaken problemen.

```javascript
// FOUT: Task verwijst naar zichzelf via parent
{
    id: 1,
    parent: 1  // Circular!
}

// FOUT: Dependency loop
{ fromTask: 1, toTask: 2 }
{ fromTask: 2, toTask: 1 }  // Cycle!
```

**Oplossing**: Valideer data vooraf:

```javascript
project.on('schedulingConflict', ({ conflict, continueWithResolutionResult }) => {
    if (conflict.type === 'cycle') {
        console.error('Dependency cycle detected');
        continueWithResolutionResult(conflict.resolutions.find(
            r => r.type === 'RemoveDependency'
        ));
    }
});
```

---

## 2. Scheduling Conflicts

### 2.1 Constraint Conflicts

**Probleem**: Constraints kunnen niet allemaal vervuld worden.

```javascript
// Task met MustStartOn constraint die conflicteert met dependency
{
    id: 2,
    constraintType: 'muststarton',
    constraintDate: '2024-01-05'
}
// Maar predecessor eindigt pas op 2024-01-10
```

**Oplossing**: Conflict resolution configureren:

```javascript
const project = new ProjectModel({
    // Automatisch conflicts uitstellen
    autoPostponeConflicts: true,

    // Of: handmatige resolutie
    listeners: {
        schedulingConflict({ conflict, continueWithResolutionResult }) {
            // Toon UI voor gebruiker
            showConflictDialog(conflict).then(resolution => {
                continueWithResolutionResult(resolution);
            });
        }
    }
});
```

### 2.2 Empty Calendar

**Probleem**: Kalender zonder werktijd.

```javascript
// FOUT: Kalender met alleen niet-werkdagen
{
    id: 'broken',
    unspecifiedTimeIsWorking: false
    // Geen working intervals gedefinieerd!
}
```

**Oplossing**: Altijd working intervals definiëren:

```javascript
{
    id: 'custom',
    unspecifiedTimeIsWorking: false,
    intervals: [
        {
            recurrentStartDate: 'on Mon at 9:00',
            recurrentEndDate: 'on Mon at 17:00',
            isWorking: true
        }
        // ... rest van de week
    ]
}
```

### 2.3 Invalid Dependencies

```javascript
// Self-referencing dependency
gantt.dependencyStore.add({ fromTask: 11, toTask: 11 });

// Project zal conflict detecteren
project.on('schedulingConflict', handler);
```

---

## 3. Performance Valkuilen

### 3.1 Unbatched Updates

**Probleem**: Elke wijziging triggert recalculatie.

```javascript
// SLECHT: 100 afzonderlijke propagations
tasks.forEach(task => {
    task.duration = 5;  // Propagate!
});
```

**Oplossing**: Batch updates:

```javascript
// GOED: Eén propagation
project.beginBatch();
tasks.forEach(task => {
    task.duration = 5;
});
await project.endBatch();
```

### 3.2 Onnodige Re-renders

**Probleem**: Config object recreatie veroorzaakt re-renders.

```javascript
// SLECHT: Nieuw object elke render
<BryntumGantt
    columns={[
        { type: 'name', width: 250 }  // Nieuw array elke render!
    ]}
/>
```

**Oplossing**: Memoize config:

```javascript
// GOED: Stabiele referentie
const columns = useMemo(() => [
    { type: 'name', width: 250 }
], []);

<BryntumGantt columns={columns} />
```

### 3.3 Grote Datasets

**Probleem**: Alle data laden is traag.

```javascript
// SLECHT: 10.000 tasks direct laden
project.loadInlineData({ tasksData: hugeArray });
```

**Oplossing**: Lazy loading of paging:

```javascript
// GOED: Infinite scroll
const gantt = new Gantt({
    infiniteScroll: true,
    bufferCoef: 5,

    project: {
        transport: {
            load: {
                url: '/api/tasks',
                params: { page: 1, limit: 100 }
            }
        }
    }
});
```

### 3.4 Memory bij Destroy

```javascript
// ALTIJD cleanup bij unmount
useEffect(() => {
    return () => {
        ganttRef.current?.instance?.destroy();
    };
}, []);
```

---

## 4. React/Next.js Specifiek

### 4.1 SSR Errors

**Probleem**: Bryntum gebruikt DOM APIs.

```
ReferenceError: window is not defined
```

**Oplossing**: Dynamic import met SSR disabled:

```javascript
import dynamic from 'next/dynamic';

const BryntumGantt = dynamic(
    () => import('@bryntum/gantt-react').then(mod => mod.BryntumGantt),
    { ssr: false }
);
```

### 4.2 Hydration Mismatch

**Probleem**: Server en client HTML komen niet overeen.

**Oplossing**: Render alleen na mount:

```javascript
const [mounted, setMounted] = useState(false);

useEffect(() => {
    setMounted(true);
}, []);

if (!mounted) return <LoadingSkeleton />;

return <BryntumGantt />;
```

### 4.3 StrictMode Double Render

**Probleem**: React StrictMode rendert twee keer.

```javascript
// Kan dubbele event handlers veroorzaken
useEffect(() => {
    gantt.on('taskClick', handler);
    // Cleanup mist!
});
```

**Oplossing**: Altijd cleanup:

```javascript
useEffect(() => {
    const gantt = ganttRef.current?.instance;
    gantt?.on('taskClick', handler);

    return () => {
        gantt?.un('taskClick', handler);
    };
}, []);
```

### 4.4 Ref Null bij First Render

```javascript
// FOUT: Ref is null bij eerste render
useEffect(() => {
    ganttRef.current.instance.zoomIn();  // Error!
}, []);

// GOED: Check of ref bestaat
useEffect(() => {
    const gantt = ganttRef.current?.instance;
    if (gantt) {
        gantt.zoomIn();
    }
}, []);
```

---

## 5. Store & Model Gotchas

### 5.1 ID Conflicts

**Probleem**: Dubbele IDs veroorzaken onvoorspelbaar gedrag.

```javascript
// FOUT: Zelfde ID
store.add([
    { id: 1, name: 'Task A' },
    { id: 1, name: 'Task B' }  // Overschrijft Task A!
]);
```

**Oplossing**: Unieke IDs of auto-generate:

```javascript
store.add([
    { name: 'Task A' },  // ID wordt gegenereerd
    { name: 'Task B' }
]);
```

### 5.2 Phantom Records

**Probleem**: Nieuwe records hebben tijdelijke IDs.

```javascript
const newTask = store.add({ name: 'New' })[0];
console.log(newTask.id);  // '_generatedXXX'
console.log(newTask.isPhantom);  // true

// Na sync krijgt het een echte ID
await project.sync();
console.log(newTask.id);  // 123 (van server)
```

### 5.3 Field Type Mismatches

```javascript
// FOUT: String waar date verwacht wordt
task.startDate = '2024-01-15';  // Werkt soms
task.startDate = 'invalid';      // Error!

// GOED: Altijd correct type
task.startDate = new Date('2024-01-15');
task.startDate = DateHelper.parse('2024-01-15', 'YYYY-MM-DD');
```

### 5.4 Chained Store Sync

```javascript
// Chained store synct niet automatisch wijzigingen terug
const filteredStore = store.chain({
    filters: [{ property: 'status', value: 'active' }]
});

// Wijzigingen in filteredStore gaan naar parent
filteredStore.first.name = 'Updated';  // OK

// Maar: parent filter update triggert geen re-filter
store.first.status = 'inactive';
// filteredStore bevat record nog steeds!
filteredStore.filter();  // Handmatig re-filter nodig
```

---

## 6. Feature Interacties

### 6.1 TaskEdit vs Custom Editor

**Probleem**: TaskEdit feature blokkeert custom editing.

```javascript
// FOUT: Beide actief
features: {
    taskEdit: true,
    cellEdit: true
}
// Double-click opent TaskEditor, niet cell editor
```

**Oplossing**: Kies één of custom trigger:

```javascript
features: {
    taskEdit: {
        triggerEvent: 'taskdblclick'  // Of 'taskeditrequest'
    },
    cellEdit: true
}
```

### 6.2 Dependencies + Constraints

```javascript
// Dependencies en constraints kunnen conflicteren
// Dependency zegt: Task B moet na Task A
// Constraint zegt: Task B moet op specifieke datum starten

// Prioriteit: Constraints > Dependencies (standaard)
// Configureerbaar via:
project.constraintPriority = 'dependency';  // Dependencies winnen
```

### 6.3 Undo/Redo State

```javascript
// Undo kan onverwachte states creëren
stm.undo();  // Maakt laatste actie ongedaan

// Maar: externe state (bijv. Redux) is niet gesync'd!
// Oplossing: Luister naar STM events
stm.on({
    recordingStop({ stm, transaction }) {
        // Sync naar externe state
        syncToRedux(transaction);
    }
});
```

---

## 7. Browser Quirks

### 7.1 Safari Rendering

```javascript
// Safari heeft soms scroll issues
// Oplossing: Force repaint
gantt.element.style.transform = 'translateZ(0)';
```

### 7.2 Firefox Drag & Drop

```javascript
// Firefox vereist setData voor drag
element.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', '');  // Required for FF
});
```

### 7.3 Chrome DevTools Performance

```javascript
// Chrome DevTools vertraagt rendering significant
// Disable "Paint flashing" en "Layer borders" voor accurate tests
```

### 7.4 Touch Devices

```javascript
// Touch events hebben andere timing
features: {
    taskDrag: {
        // Langere delay voor touch om scroll te onderscheiden
        touchStartDelay: 300
    }
}
```

---

## 8. Memory Leaks

### 8.1 Event Listener Cleanup

```javascript
// FOUT: Listener niet verwijderd
componentDidMount() {
    this.gantt.on('taskClick', this.handleClick);
}
// Component unmount maar listener blijft!

// GOED: Cleanup
componentWillUnmount() {
    this.gantt.un('taskClick', this.handleClick);
}
```

### 8.2 Closure References

```javascript
// FOUT: Closure houdt oude data vast
gantt.on('taskClick', ({ taskRecord }) => {
    // largeDataObject wordt nooit garbage collected
    console.log(largeDataObject[taskRecord.id]);
});

// GOED: Gebruik WeakMap of cleanup
```

### 8.3 Store Data Accumulation

```javascript
// FOUT: Data blijft groeien
project.load();  // Load 1
project.load();  // Load 2 - data accumuleert!

// GOED: Clear voor load
project.taskStore.removeAll();
await project.load();
```

---

## 9. Common Error Messages

### 9.1 "Cannot read property of undefined"

**Oorzaak**: Toegang tot record dat niet bestaat.

```javascript
// Check altijd
const task = taskStore.getById(id);
if (task) {
    task.name = 'Updated';
}
```

### 9.2 "Maximum call stack exceeded"

**Oorzaak**: Infinite loop, vaak door:
- Circular dependencies
- Event handler triggert zelfde event
- Recursive computed field

### 9.3 "Store already has a record with id X"

**Oorzaak**: Dubbele ID.

```javascript
// Oplossing 1: Verwijder eerst
store.remove(store.getById(id));
store.add(newRecord);

// Oplossing 2: Update bestaand
store.getById(id).set(newData);
```

### 9.4 "Cannot sync - no sync URL configured"

```javascript
// Sync URL is required
project.syncUrl = '/api/sync';
await project.sync();
```

### 9.5 "L{...} - Locale key not found"

**Oorzaak**: Ontbrekende vertaling.

```javascript
// Development: throw errors
LocaleManager.throwOnMissingLocale = true;

// Production: use fallback
LocaleManager.throwOnMissingLocale = false;
```

---

## 10. Cross-References

### Gerelateerde Documenten

| Document | Relevante Secties |
|----------|-------------------|
| [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) | React specifieke patterns |
| [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) | Constraint conflicts |
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | Store operaties |
| [INTERNALS-SOURCE-CODE](./INTERNALS-SOURCE-CODE.md) | Internal mechanics |

### Demo's met Edge Cases

| Demo | Edge Case |
|------|-----------|
| `conflicts` | Dependency cycles, invalid dependencies |
| `postponed-conflicts` | Constraint conflict resolution |
| `bigdataset` | Performance met grote datasets |
| `undoredo` | State management edge cases |

---

## Samenvatting Checklist

### Voor Development

- [ ] Kopieer Redux/immutable data voordat je het doorgeeft
- [ ] Gebruik batching voor bulk updates
- [ ] Memoize config objects in React
- [ ] Cleanup event listeners bij unmount
- [ ] Handle scheduling conflicts

### Voor Production

- [ ] Test met grote datasets
- [ ] Validate data IDs vooraf
- [ ] Configure error handling voor conflicts
- [ ] Test op verschillende browsers
- [ ] Monitor memory usage

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
