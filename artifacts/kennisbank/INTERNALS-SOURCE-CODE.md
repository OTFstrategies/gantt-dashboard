# INTERNALS: Source Code Architecture

> **Level 3** - Interne architectuur en implementatiedetails van Bryntum Gantt.

---

## Inhoudsopgave

1. [Class Hiërarchie](#1-class-hiërarchie)
2. [Mixin Systeem](#2-mixin-systeem)
3. [Configurable Pattern](#3-configurable-pattern)
4. [DomSync Engine](#4-domsync-engine)
5. [Chronograph Scheduling Engine](#5-chronograph-scheduling-engine)
6. [Feature Plugin Systeem](#6-feature-plugin-systeem)
7. [Store Internals](#7-store-internals)
8. [Event System Internals](#8-event-system-internals)
9. [Widget Factory](#9-widget-factory)
10. [Performance Patterns](#10-performance-patterns)

---

## 1. Class Hiërarchie

### 1.1 Core Inheritance Chain

```
Base (Core lifecycle, events, config)
  └── Widget (DOM rendering, visibility)
        └── Container (Child widgets, layout)
              └── Panel (Header, footer, tools)
                    └── Grid (Columns, rows, stores)
                          └── TimelineBase (Time axis, zooming)
                                └── Gantt (Tasks, dependencies, scheduling)
```

### 1.2 Model Inheritance

```
Model (Core data model)
  └── TimeSpan (startDate, endDate, duration)
        └── EventModel (Basic event)
              └── TaskModel (Scheduling, constraints, effort)
                    └── GanttTaskModel (Full Gantt features)
```

### 1.3 Store Inheritance

```
Store (Basic store)
  └── AjaxStore (HTTP loading)
        └── TreeStore (Hierarchical data)
              └── TaskStore (Task-specific methods)
```

---

## 2. Mixin Systeem

### 2.1 Mixin Pattern

Bryntum gebruikt een mixin pattern voor code hergebruik:

```javascript
// Basis mixin definitie
class Delayable {
    static get $name() {
        return 'Delayable';
    }

    // Delayed function execution
    setTimeout(fn, delay) {
        return globalThis.setTimeout(() => {
            if (!this.isDestroyed) {
                fn.call(this);
            }
        }, delay);
    }

    clearTimeout(id) {
        globalThis.clearTimeout(id);
    }
}

// Mixin toepassen
class MyWidget extends Widget.mixin(Delayable, Focusable) {
    // ...
}
```

### 2.2 Belangrijke Mixins

| Mixin | Functionaliteit |
|-------|-----------------|
| `Delayable` | setTimeout/setInterval met auto-cleanup |
| `Factoryable` | Widget type registration |
| `Localizable` | i18n support |
| `Draggable` | Drag & drop support |
| `Events` | Event emitter pattern |
| `State` | State persistence |

### 2.3 Mixin Volgorde

Mixins worden toegepast van rechts naar links:

```javascript
class Gantt extends TimelineBase.mixin(
    Delayable,      // Eerste toegepast
    DependencyView, // Tweede
    TaskRendering   // Laatste
) {}
```

---

## 3. Configurable Pattern

### 3.1 Static Configurable

```javascript
class MyWidget extends Widget {
    static get configurable() {
        return {
            // Simple config
            title: 'Default Title',

            // Config met setter
            data: {
                $config: {
                    // Welke property changes triggeren update
                    equal: (a, b) => a === b
                },
                value: null
            },

            // Lazy config - wordt pas geïnitialiseerd bij access
            store: {
                $config: {
                    lazy: true
                },
                value: {}
            }
        };
    }

    // Auto-gegenereerd: get data(), set data(value)
    // Custom setter override:
    updateData(data) {
        // Aangeroepen wanneer data verandert
        this.refresh();
    }

    changeData(data) {
        // Kan nieuwe waarde transformeren of rejecten
        return Array.isArray(data) ? data : [data];
    }
}
```

### 3.2 Config Lifecycle

```
1. construct(config)
   └── processConfig(config)
       └── Voor elke config property:
           ├── changePropertyName(value) → kan waarde transformeren
           └── updatePropertyName(value) → side effects uitvoeren

2. Property assignment later:
   widget.property = newValue
   └── set property(value)
       └── changePropertyName(value)
           └── updatePropertyName(value)
```

### 3.3 Config Merging

```javascript
static get configurable() {
    return {
        // Object configs worden gemerged
        features: {
            dependencies: true,
            taskEdit: true
        }
    };
}

// Subclass kan uitbreiden:
static get configurable() {
    return {
        features: {
            ...super.configurable.features,
            criticalPaths: true
        }
    };
}
```

---

## 4. DomSync Engine

### 4.1 Virtual DOM-achtige Rendering

DomSync vergelijkt DOM configs en past alleen differences toe:

```javascript
import { DomSync } from '@bryntum/gantt';

// Eerste render
const config = {
    tag: 'div',
    className: 'task',
    children: [
        { tag: 'span', className: 'name', text: 'Task 1' }
    ]
};

DomSync.sync({
    targetElement: container,
    domConfig: config,
    syncId: 'task-1'
});

// Update - alleen text wijzigt
const updatedConfig = {
    tag: 'div',
    className: 'task',
    children: [
        { tag: 'span', className: 'name', text: 'Updated Task' }
    ]
};

DomSync.sync({
    targetElement: container,
    domConfig: updatedConfig,
    syncId: 'task-1'
});
// Alleen de textContent wordt aangepast, niet de hele DOM
```

### 4.2 Sync Algoritme

```
DomSync.sync(config):
1. Bereken diff tussen vorige en nieuwe config
2. Voor elke child:
   a. Match op syncId of positie
   b. Als match: recursief sync
   c. Als geen match: remove/insert
3. Apply attribute changes
4. Apply style changes
5. Apply class changes
```

### 4.3 Performance Optimalisaties

```javascript
// Release sync - maakt element herbruikbaar
DomSync.addReleaseElement(element);

// Adopt - neem bestaand element over zonder recreate
DomSync.addChild(parent, child);

// Sync callbacks voor custom logic
DomSync.sync({
    domConfig: config,
    callback(data) {
        // Aangeroepen na sync voor elk element
        data.targetElement.myCustomProperty = true;
    }
});
```

---

## 5. Chronograph Scheduling Engine

### 5.1 Reactive Computation Graph

De Chronograph engine is een reactive scheduling engine:

```
┌─────────────────────────────────────────────────────────────┐
│                    Chronograph Engine                        │
├─────────────────────────────────────────────────────────────┤
│  Computed Fields (Atoms)                                     │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐                  │
│  │startDate│ → │ endDate  │ → │ duration │                  │
│  └─────────┘   └──────────┘   └──────────┘                  │
│       ↑             ↑              ↑                        │
│       └─────────────┴──────────────┘                        │
│            Dependency Graph                                  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Commit Cycle

```javascript
// Wijzigingen batchen
project.taskStore.getById(1).startDate = new Date();
project.taskStore.getById(2).duration = 5;

// Commit triggert recalculatie
await project.commitAsync();

// Na commit:
// - Alle affected tasks herberekend
// - Dependencies gerespecteerd
// - Constraints gevalideerd
// - Calendars toegepast
```

### 5.3 Propagation Flow

```
User Action (task.startDate = ...)
    │
    ▼
Queue Change
    │
    ▼
commitAsync()
    │
    ▼
┌─────────────────────────────────────┐
│ Calculate affected atoms            │
│ Build computation order             │
│ Execute computations                │
│ Detect conflicts                    │
└─────────────────────────────────────┘
    │
    ▼
Fire 'dataReady' event
```

### 5.4 Conflict Detection

```javascript
// Conflicts worden gedetecteerd tijdens propagation
project.on('schedulingConflict', ({ conflict, continueWithResolutionResult }) => {
    // conflict.type: 'dependency', 'constraint', 'calendar'
    // conflict.resolutions: beschikbare oplossingen

    // Automatisch oplossen:
    continueWithResolutionResult(conflict.resolutions[0]);
});
```

---

## 6. Feature Plugin Systeem

### 6.1 Feature Registratie

```javascript
class CriticalPaths extends InstancePlugin {
    static get $name() {
        return 'CriticalPaths';
    }

    // Plugs into this widget type
    static get pluginConfig() {
        return {
            chain: ['render']  // Hook into render cycle
        };
    }

    construct(gantt, config) {
        super.construct(gantt, config);
        this.gantt = gantt;
    }

    // Called during render
    render() {
        if (!this.disabled) {
            this.highlightCriticalPath();
        }
    }

    doDisable(disable) {
        super.doDisable(disable);
        if (disable) {
            this.clearHighlight();
        }
    }
}

// Registreer feature
Gantt.featureClass['criticalPaths'] = CriticalPaths;
```

### 6.2 Feature Lifecycle

```
Gantt construct
    │
    ▼
For each feature in config.features:
    │
    ├── feature = new FeatureClass(gantt, featureConfig)
    ├── feature.construct()
    └── Register hooks (render, refresh, etc.)

Gantt render
    │
    ▼
For each feature with render hook:
    └── feature.render()
```

### 6.3 Feature Communicatie

```javascript
// Features kunnen events dispatchen
this.gantt.trigger('criticalPathChanged', { paths: this.paths });

// Andere features kunnen luisteren
class MyFeature extends InstancePlugin {
    construct(gantt, config) {
        super.construct(gantt, config);

        gantt.on('criticalPathChanged', this.onCriticalPathChanged, this);
    }
}
```

---

## 7. Store Internals

### 7.1 Record Lifecycle

```
Store.add(data)
    │
    ▼
Create Model instance
    │
    ├── Assign id (or generate)
    ├── Set fields from data
    ├── Register in store.idMap
    └── Fire 'add' event

Store.remove(record)
    │
    ▼
├── Remove from idMap
├── Clear relationships
├── Fire 'remove' event
└── Optionally: track as 'removed' for sync
```

### 7.2 Change Tracking

```javascript
// Store houdt changes bij
store.add({ name: 'New' });     // → store.added = [record]
record.name = 'Updated';        // → store.modified = [record]
store.remove(record);           // → store.removed = [record]

// Changes ophalen
const changes = store.changes;
// { added: [...], modified: [...], removed: [...] }

// Changes committen (clear tracking)
store.commit();
```

### 7.3 Relational Fields

```javascript
// TaskModel heeft relational fields
class TaskModel extends Model {
    static get fields() {
        return [
            // Foreign key naar resource
            { name: 'resourceId', type: 'number' },

            // Relatie definitie
            {
                name: 'resource',
                persist: false,
                // Auto-resolve van resourceStore
                convert(value, record) {
                    if (typeof value === 'number') {
                        return record.project?.resourceStore.getById(value);
                    }
                    return value;
                }
            }
        ];
    }
}
```

---

## 8. Event System Internals

### 8.1 Event Flow

```javascript
// trigger() flow
widget.trigger('eventName', eventData)
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Check if suspended               │
│ 2. Create event object              │
│ 3. Call 'on' listeners in order     │
│ 4. If not cancelled, bubble up      │
│ 5. Return event object              │
└─────────────────────────────────────┘
```

### 8.2 Listener Priority

```javascript
widget.on({
    click: {
        fn: handler1,
        prio: 100  // Higher = earlier
    }
});

widget.on({
    click: {
        fn: handler2,
        prio: 50   // Called after handler1
    }
});
```

### 8.3 Event Delegation

```javascript
// Container delegeert events naar children
container.on({
    // Matched op CSS selector
    delegate: '.child-button',
    click(event) {
        // event.source = actual button
        // this = container
    }
});
```

---

## 9. Widget Factory

### 9.1 Type Registration

```javascript
class MyWidget extends Widget {
    // Required for factory
    static get type() {
        return 'mywidget';
    }
}

// Registreer bij factory
MyWidget.initClass();

// Nu kan het als type gebruikt worden:
const widget = Widget.create({
    type: 'mywidget',
    title: 'Test'
});
```

### 9.2 Factory Resolution

```
Widget.create({ type: 'button', text: 'Click' })
    │
    ▼
WidgetHelper.createWidget(config)
    │
    ▼
Look up type in Widget.factoryable
    │
    ▼
new Button(config)
```

### 9.3 Lazy Widget Creation

```javascript
// Widgets in containers worden lazy gecreëerd
container.items = [
    { type: 'button', text: 'Lazy' }  // Nog geen instance
];

// Instance wordt gecreëerd bij eerste access of render
container.widgetMap.button;  // → Nu gecreëerd
```

---

## 10. Performance Patterns

### 10.1 Batched Updates

```javascript
// Slecht: triggert meerdere renders
tasks.forEach(task => {
    task.name = 'Updated';  // Render
    task.duration = 5;      // Render
});

// Goed: batch in transaction
gantt.project.beginBatch();
tasks.forEach(task => {
    task.name = 'Updated';
    task.duration = 5;
});
gantt.project.endBatch();  // Enkele render
```

### 10.2 Suspending Events

```javascript
// Suspend store events
store.suspendEvents();
// ... bulk operations ...
store.resumeEvents();
store.trigger('refresh');  // Handmatig refresh triggeren
```

### 10.3 Virtual Rendering

```javascript
// Gantt rendert alleen zichtbare rows
const visibleRowCount = Math.ceil(gantt.height / gantt.rowHeight);
const bufferSize = visibleRowCount * gantt.bufferCoef;

// Scroll handlers updaten virtuele viewport
gantt.on('scroll', () => {
    // Render rows in nieuwe viewport
    // Recycle DOM elements uit oude viewport
});
```

### 10.4 Buffered Rendering

```javascript
// Dependencies worden gebufferd getekend
gantt.features.dependencies.drawOnScroll = true;

// Alleen dependencies in zichtbare area worden gerenderd
// Bij scroll: incremental update
```

---

## Samenvatting

De Bryntum Gantt interne architectuur is gebouwd op:

1. **Class Inheritance** - Diepe hiërarchie met specifieke verantwoordelijkheden
2. **Mixin System** - Flexibele code hergebruik via mixins
3. **Configurable Pattern** - Declaratieve configuratie met reactive updates
4. **DomSync** - Efficiënte DOM updates via virtual DOM-achtige diffing
5. **Chronograph** - Reactive scheduling met dependency graph
6. **Feature Plugins** - Extensible feature systeem
7. **Stores** - Centralized data management met change tracking
8. **Event System** - Pub/sub met delegation en bubbling
9. **Widget Factory** - Type-based widget creation
10. **Performance** - Batching, virtualization, buffering

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
