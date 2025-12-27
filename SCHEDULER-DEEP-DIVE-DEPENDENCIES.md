# SCHEDULER-DEEP-DIVE-DEPENDENCIES.md

> **Diepgaande analyse** van het dependency system in SchedulerPro - dependency types, lag, terminals, rendering, editing en integratie met nested events.

---

## Overzicht

Dependencies (afhankelijkheden) in SchedulerPro definiëren relaties tussen events. Ze bepalen de volgorde waarin events gepland worden en zorgen voor automatische herscheduling wanneer een gekoppeld event wijzigt.

### Kerncomponenten

| Component | Beschrijving |
|-----------|--------------|
| **DependencyModel** | Data model voor een dependency |
| **DependencyStore** | Store voor dependency records |
| **Dependencies Feature** | Visualisatie en interactie |
| **DependencyEdit Feature** | Popup editor voor dependencies |
| **DependencyMenu Feature** | Context menu voor dependencies |

---

## 1. Dependency Types

SchedulerPro ondersteunt vier dependency types:

```typescript
// DependencyType enum
const DependencyType = {
    StartToStart : 0,   // SS: Successor kan niet starten voor predecessor start
    StartToEnd   : 1,   // SF: Successor kan niet eindigen voor predecessor start
    EndToStart   : 2,   // FS: Successor kan niet starten voor predecessor eindigt (DEFAULT)
    EndToEnd     : 3    // EE: Successor kan niet eindigen voor predecessor eindigt
};
```

### Visuele Representatie

```
Finish-to-Start (FS) - Type 2 (Most common):
┌─────────┐
│ Event A │───────┐
└─────────┘       │
                  ▼
            ┌─────────┐
            │ Event B │
            └─────────┘

Start-to-Start (SS) - Type 0:
┌─────────┐
│ Event A │
└─────────┘
    │
    └───────┐
            ▼
      ┌─────────┐
      │ Event B │
      └─────────┘

Finish-to-Finish (FF) - Type 3:
┌─────────────┐
│   Event A   │
└─────────────┘
              │
    ┌─────────┘
    ▼
┌─────────┐
│ Event B │
└─────────┘

Start-to-Finish (SF) - Type 1 (Rare):
      ┌─────────┐
      │ Event A │
      └─────────┘
          │
    ┌─────┘
    ▼
┌─────────┐
│ Event B │
└─────────┘
```

---

## 2. DependencyModel

### Fields en Properties

```typescript
interface DependencyModelConfig {
    // Link identification
    id?: string | number;
    from: string | number;              // Source event ID
    to: string | number;                // Target event ID

    // Dependency type
    type?: number;                       // 0-3 (default: 2 = FS)
    hardType?: number;                   // Sets type and resets sides

    // Connection sides (optional, overrides type)
    fromSide?: 'top' | 'left' | 'bottom' | 'right';
    toSide?: 'top' | 'left' | 'bottom' | 'right';

    // Lag (delay between events)
    lag?: number;                        // Lag magnitude
    lagUnit?: DurationUnit;              // 'day', 'hour', etc. (readonly after creation)

    // Scheduling
    active?: boolean;                    // Set false to ignore in scheduling
    calendar?: CalendarModel;            // Calendar for lag calculation

    // Styling
    cls?: string;                        // CSS class for the line
    bidirectional?: boolean;             // Draw arrows both ways
}
```

### Data Format

```json
{
    "dependencies" : [
        {
            "id"   : 1,
            "from" : 11,
            "to"   : 12,
            "type" : 2,
            "lag"  : 0
        },
        {
            "id"      : 2,
            "from"    : 12,
            "to"      : 13,
            "type"    : 2,
            "lag"     : 1,
            "lagUnit" : "day"
        },
        {
            "id"       : 3,
            "from"     : 14,
            "to"       : 15,
            "fromSide" : "bottom",
            "toSide"   : "top"
        }
    ]
}
```

### Programmatisch Aanmaken

```typescript
// Via store
scheduler.dependencyStore.add({
    from : event1.id,
    to   : event2.id,
    type : 2  // Finish-to-Start
});

// Via project
project.dependencyStore.add([
    { from : 1, to : 2, type : 2 },
    { from : 2, to : 3, type : 2, lag : 1, lagUnit : 'day' }
]);

// Met event references
scheduler.dependencyStore.add({
    fromEvent : event1,
    toEvent   : event2,
    type      : DependencyModel.Type.EndToStart
});
```

---

## 3. Dependencies Feature

### Basis Configuratie

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencies : {
            // Rendering
            radius     : 10,              // Corner radius voor lines
            clickWidth : 5,               // Clickable width (performance impact!)

            // Terminals (connection points)
            terminalCls       : 'my-terminal',
            terminalSize      : 16,
            terminalOffset    : 0,
            terminalSides     : ['start', 'end'],  // Which sides to show
            terminalShowDelay : 100,               // ms before showing
            terminalHideDelay : 200,               // ms before hiding

            // Interaction
            allowCreate             : true,
            allowDropOnEventBar     : true,
            enableDelete            : true,

            // Highlighting
            highlightDependenciesOnEventHover : true,

            // Performance options
            drawOnScroll           : true,    // Redraw during scroll
            drawOnEventInteraction : true,    // Redraw during drag/resize

            // Tooltips
            showTooltip       : true,
            showLagInTooltip  : true,
            showCreationTooltip : true
        }
    }
});
```

### Custom Dependency Rendering

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencies : {
            // Custom renderer voor dependency lines
            renderer({ domConfig, dependencyRecord, fromBox, toBox, fromSide, toSide }) {
                // Add custom CSS class based on dependency data
                domConfig.class['critical'] = dependencyRecord.isCritical;
                domConfig.class['delayed'] = dependencyRecord.lag > 0;

                // Custom styling
                if (dependencyRecord.lag > 5) {
                    domConfig.style = {
                        stroke           : 'red',
                        strokeWidth      : 3,
                        strokeDasharray  : '5,5'
                    };
                }

                // Add custom attributes
                domConfig.dataset = {
                    dependencyId : dependencyRecord.id,
                    lagDays      : dependencyRecord.lag
                };
            },

            // Custom arrow marker
            markerDef : 'M0,0 L9,3 L0,6 z'  // SVG path, fits 9x6 viewBox
        }
    }
});
```

### Terminal Customization

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencies : {
            // Customize which sides show terminals
            terminalSides : ['start', 'top', 'end', 'bottom'],

            // Terminal styling via CSS
            terminalCls : 'custom-terminal',

            // Offset terminals from event bar
            terminalOffset : 5,  // px outside event bar

            // Size of terminals
            terminalSize : 20
        }
    }
});
```

```css
/* Custom terminal styling */
.custom-terminal {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.custom-terminal:hover {
    transform: scale(1.2);
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
```

---

## 4. Lag (Vertraging)

Lag definieert de minimale tijd tussen gekoppelde events.

### Lag Configuratie

```typescript
// In dependency data
{
    from    : 1,
    to      : 2,
    type    : 2,
    lag     : 2,
    lagUnit : 'day'  // 2 dagen vertraging
}

// Programmatisch
dependency.setLag(2, 'day');
dependency.setLag('2d');        // String format
dependency.setLag({ magnitude : 2, unit : 'day' });

// Read lag
const fullLag = dependency.fullLag;  // { magnitude: 2, unit: 'day' }
```

### Lag Units

```typescript
type DurationUnit =
    | 'millisecond' | 'ms'
    | 'second' | 's'
    | 'minute' | 'mi'
    | 'hour' | 'h'
    | 'day' | 'd'
    | 'week' | 'w'
    | 'month' | 'mo'
    | 'quarter' | 'q'
    | 'year' | 'y';
```

### Negative Lag (Lead Time)

```typescript
// Successor kan starten VOOR predecessor eindigt
{
    from    : 1,
    to      : 2,
    type    : 2,        // Finish-to-Start
    lag     : -1,       // Negative = lead time
    lagUnit : 'day'     // Start 1 dag voor predecessor eindigt
}
```

### Lag met Calendar

```typescript
// Dependency met eigen calendar voor lag berekening
{
    from     : 1,
    to       : 2,
    lag      : 3,
    lagUnit  : 'day',
    calendar : 'businessDays'  // Alleen werkdagen tellen
}
```

---

## 5. DependencyEdit Feature

### Editor Configuratie

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencyEdit : {
            // Show lag field in editor
            showLagField : true,

            // Trigger event (default: dependencydblclick)
            triggerEvent : 'dependencydblclick',

            // Editor items
            editorConfig : {
                title  : 'Edit Dependency',
                width  : 400,
                height : 'auto'
            }
        }
    }
});
```

### Custom Editor Items

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencyEdit : {
            showLagField : true,

            editorConfig : {
                items : {
                    // Custom field
                    priorityField : {
                        type    : 'combo',
                        label   : 'Priority',
                        name    : 'priority',
                        items   : ['Low', 'Medium', 'High', 'Critical'],
                        weight  : 300  // Order in form
                    }
                }
            }
        }
    }
});
```

### Editor Events

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencyEdit : true
    },

    listeners : {
        // Before editor opens
        beforeDependencyEdit({ dependencyRecord, editor }) {
            // Can cancel with return false
            if (dependencyRecord.locked) {
                return false;
            }
        },

        // After save
        afterDependencySave({ dependencyRecord }) {
            console.log('Saved:', dependencyRecord.data);
        },

        // After delete
        afterDependencyDelete({ dependencyRecords }) {
            console.log('Deleted:', dependencyRecords.length);
        }
    }
});
```

### Programmatisch Openen

```typescript
// Open editor for specific dependency
scheduler.features.dependencyEdit.editDependency(dependencyRecord);
```

---

## 6. DependencyMenu Feature

### Context Menu Configuratie

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencyMenu : {
            // Custom menu items
            items : {
                // Add custom item
                editDependency : {
                    text   : 'Edit Link',
                    icon   : 'b-fa b-fa-edit',
                    weight : 100,
                    onItem({ dependencyRecord }) {
                        scheduler.features.dependencyEdit.editDependency(dependencyRecord);
                    }
                },

                // Remove default item
                deleteDependency : false,

                // Modify default item
                addDependency : {
                    text : 'Add New Link'
                }
            }
        }
    }
});
```

### Dynamic Menu Items

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencyMenu : {
            processItems({ dependencyRecord, items }) {
                // Conditionally show items
                if (dependencyRecord.locked) {
                    items.deleteDependency = false;
                }

                // Add dynamic item
                items.customAction = {
                    text   : `Lag: ${dependencyRecord.lag} days`,
                    icon   : 'b-fa b-fa-clock',
                    onItem : () => {
                        // Handle click
                    }
                };
            }
        }
    }
});
```

---

## 7. Dependencies met Nested Events

### Configuratie voor Nested Events

```typescript
const scheduler = new SchedulerPro({
    features : {
        nestedEvents : {
            eventLayout             : 'stack',
            headerHeight            : 25,
            allowDeNestingOnDrop    : false,
            constrainResizeToParent : false
        },

        dependencies : {
            clickWidth        : 5,
            radius            : 5,
            terminalSize      : 16,
            terminalHideDelay : 200,

            // Draw lines around parent events
            drawAroundParents : true,

            // Only allow dependencies from parent events
            allowCreateOnlyParent : false,

            showLagInTooltip : true
        },

        dependencyEdit : true
    }
});
```

### drawAroundParents

```typescript
// Met drawAroundParents: true
// Lines worden om parent events heen getekend ipv er doorheen

const scheduler = new SchedulerPro({
    features : {
        dependencies : {
            drawAroundParents : true  // Experimental feature
        }
    }
});

// Toggle at runtime
scheduler.features.dependencies.drawAroundParents = false;
```

---

## 8. Dependency Highlighting

### Highlighting Predecessors/Successors

```typescript
const scheduler = new SchedulerPro({
    // Enable highlighting on event selection
    highlightSuccessors   : true,
    highlightPredecessors : true,

    features : {
        dependencies : {
            // Highlight on hover
            highlightDependenciesOnEventHover : true
        }
    }
});

// Toggle highlighting at runtime
scheduler.highlightSuccessors = false;
scheduler.highlightPredecessors = false;
```

### Custom Highlighting

```typescript
// Highlight specific dependency
dependencyRecord.highlight('my-highlight-class');

// Check if highlighted
const isHighlighted = dependencyRecord.isHighlightedWith('my-highlight-class');

// Remove highlight
dependencyRecord.unhighlight('my-highlight-class');
```

```css
/* Custom highlight styling */
.b-sch-dependency.my-highlight-class {
    stroke: #ff6b6b;
    stroke-width: 3px;
    animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
```

---

## 9. Dependency Tooltips

### Hover Tooltip

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencies : {
            showTooltip      : true,
            showLagInTooltip : true,

            // Custom tooltip config
            tooltip : {
                align     : 'b-t',
                showDelay : 200
            },

            // Custom tooltip template
            tooltipTemplate(dependency) {
                const { fromEvent, toEvent, type, lag, lagUnit } = dependency;

                return `
                    <div class="dep-tooltip">
                        <div class="from">${fromEvent.name}</div>
                        <div class="arrow">${getTypeArrow(type)}</div>
                        <div class="to">${toEvent.name}</div>
                        ${lag ? `<div class="lag">Lag: ${lag} ${lagUnit}</div>` : ''}
                    </div>
                `;
            }
        }
    }
});

function getTypeArrow(type) {
    const arrows = {
        0 : '→→',  // SS
        1 : '→←',  // SF
        2 : '←→',  // FS
        3 : '←←'   // FF
    };
    return arrows[type] || '→';
}
```

### Creation Tooltip

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencies : {
            showCreationTooltip : true,

            // Custom creation tooltip config
            creationTooltip : {
                cls : 'my-creation-tooltip'
            },

            // Custom creation tooltip template
            creationTooltipTemplate({ source, target, fromSide, toSide, valid }) {
                if (!valid) {
                    return '<div class="invalid">Invalid dependency!</div>';
                }

                return {
                    class    : 'creation-tooltip',
                    children : [
                        { text : `From: ${source.name} (${fromSide})` },
                        { text : `To: ${target?.name || 'Drop on event'} (${toSide || '?'})` }
                    ]
                };
            }
        }
    }
});
```

---

## 10. Dependency Validation

### Validation bij Aanmaken

```typescript
const scheduler = new SchedulerPro({
    listeners : {
        beforeDependencyAdd({ dependencyRecord }) {
            const { fromEvent, toEvent, type } = dependencyRecord;

            // Prevent circular dependencies
            if (wouldCreateCycle(fromEvent, toEvent)) {
                Toast.show('Cannot create circular dependency!');
                return false;
            }

            // Prevent duplicate dependencies
            if (dependencyExists(fromEvent, toEvent)) {
                Toast.show('Dependency already exists!');
                return false;
            }

            // Validate type for specific events
            if (fromEvent.isMilestone && type !== 2) {
                Toast.show('Milestones can only have FS dependencies!');
                return false;
            }
        }
    }
});

function wouldCreateCycle(from, to) {
    // Check if 'to' is already a predecessor of 'from'
    let current = from;
    const visited = new Set();

    while (current) {
        if (visited.has(current.id)) break;
        visited.add(current.id);

        if (current.id === to.id) return true;

        // Check predecessors
        const predecessors = current.predecessors;
        if (predecessors.length === 0) break;

        current = predecessors[0].fromEvent;
    }

    return false;
}
```

### Dependency Constraints

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencies : {
            // Validate during creation drag
            validateDependency({ from, to, fromSide, toSide }) {
                // Don't allow dependencies to the same event
                if (from.id === to.id) {
                    return {
                        valid   : false,
                        message : 'Cannot link event to itself'
                    };
                }

                // Don't allow SS dependencies to milestones
                if (to.isMilestone && fromSide === 'start') {
                    return {
                        valid   : false,
                        message : 'Cannot start dependency to milestone'
                    };
                }

                return { valid : true };
            }
        }
    }
});
```

---

## 11. Event Navigation via Dependencies

### Get Predecessors/Successors

```typescript
// Get all predecessors of an event
const predecessors = eventRecord.predecessors;  // DependencyModel[]
predecessors.forEach(dep => {
    console.log('Predecessor event:', dep.fromEvent.name);
    console.log('Type:', dep.type);
    console.log('Lag:', dep.lag, dep.lagUnit);
});

// Get all successors of an event
const successors = eventRecord.successors;  // DependencyModel[]
successors.forEach(dep => {
    console.log('Successor event:', dep.toEvent.name);
});

// Get predecessor events directly
const predecessorEvents = eventRecord.predecessorEvents;  // EventModel[]

// Get successor events directly
const successorEvents = eventRecord.successorEvents;  // EventModel[]
```

### Dependency Chain Analysis

```typescript
// Find all events in dependency chain
function getAllDependentEvents(event, direction = 'successors') {
    const result = new Set();
    const stack = [event];

    while (stack.length > 0) {
        const current = stack.pop();

        const deps = direction === 'successors'
            ? current.successors
            : current.predecessors;

        deps.forEach(dep => {
            const related = direction === 'successors'
                ? dep.toEvent
                : dep.fromEvent;

            if (!result.has(related)) {
                result.add(related);
                stack.push(related);
            }
        });
    }

    return Array.from(result);
}

// Usage
const allSuccessors = getAllDependentEvents(event, 'successors');
const allPredecessors = getAllDependentEvents(event, 'predecessors');
```

---

## 12. Active/Inactive Dependencies

```typescript
// Disable dependency in scheduling
dependency.active = false;

// The dependency line is still drawn but the scheduling engine ignores it
// Useful for "what-if" scenarios

// Batch update
scheduler.dependencyStore.forEach(dep => {
    if (dep.type === 1) {  // SF type
        dep.active = false;
    }
});
```

```css
/* Style inactive dependencies */
.b-sch-dependency[data-active="false"] {
    stroke: #ccc;
    stroke-dasharray: 4 2;
    opacity: 0.5;
}
```

---

## 13. Performance Optimizations

### Large Datasets

```typescript
const scheduler = new SchedulerPro({
    features : {
        dependencies : {
            // Disable during scroll for smoother scrolling
            drawOnScroll : false,

            // Disable during event interaction
            drawOnEventInteraction : false,

            // Don't use clickWidth (draws 2 paths per dependency)
            clickWidth : 0,

            // Don't use radius (curves are more expensive)
            radius : 0,

            // Reduce terminal delays
            terminalShowDelay : 0,
            terminalHideDelay : 0
        }
    }
});

// Batch operations
scheduler.dependencyStore.beginBatch();

// Add many dependencies
data.forEach(d => scheduler.dependencyStore.add(d));

scheduler.dependencyStore.endBatch();
```

### Lazy Loading Dependencies

```typescript
const project = new ProjectModel({
    dependencyStore : {
        // Only load dependencies for visible date range
        loadOnDemand : true
    },

    crudManager : {
        autoLoad : true,
        loadUrl  : '/api/data',

        // Request dependencies for visible range
        beforeLoad({ params }) {
            params.dependencyStartDate = scheduler.startDate;
            params.dependencyEndDate = scheduler.endDate;
        }
    }
});
```

---

## TypeScript Interfaces

```typescript
interface DependencyModel {
    // Identification
    id: string | number;
    from: string | number;
    to: string | number;

    // Events
    readonly fromEvent: EventModel;
    readonly toEvent: EventModel;

    // Type
    type: number;  // 0=SS, 1=SF, 2=FS, 3=FF
    hardType: number;

    // Sides
    fromSide: 'top' | 'left' | 'bottom' | 'right';
    toSide: 'top' | 'left' | 'bottom' | 'right';

    // Lag
    lag: number;
    readonly lagUnit: DurationUnit;
    readonly fullLag: { magnitude: number; unit: DurationUnit };

    // Scheduling
    active: boolean;
    calendar: CalendarModel;

    // Styling
    cls: string;
    bidirectional: boolean;

    // Status
    readonly isPersistable: boolean;

    // Methods
    setLag(lag: number | string | object, lagUnit?: DurationUnit): void;
    setHardType(type: number): void;
    getHardType(): number;
    highlight(cls: string): void;
    unhighlight(cls: string): void;
    isHighlightedWith(cls: string): boolean;
    convertLagGen(lag: number, fromUnit: DurationUnit, toUnit: DurationUnit): number;
}

interface DependenciesFeatureConfig {
    // Creation
    allowCreate: boolean;
    allowCreateOnlyParent: boolean;
    allowDropOnEventBar: boolean;

    // Terminals
    terminalSides: string[];
    terminalCls: string;
    terminalSize: number | string;
    terminalOffset: number;
    terminalShowDelay: number;
    terminalHideDelay: number;

    // Rendering
    radius: number;
    clickWidth: number;
    markerDef: string;
    drawOnScroll: boolean;
    drawOnEventInteraction: boolean;
    drawAroundParents: boolean;

    // Interaction
    enableDelete: boolean;
    highlightDependenciesOnEventHover: boolean;

    // Tooltips
    showTooltip: boolean;
    showLagInTooltip: boolean;
    showCreationTooltip: boolean;
    tooltip: TooltipConfig;
    creationTooltip: TooltipConfig;
    tooltipTemplate: (dep: DependencyModel) => string | DomConfig;
    creationTooltipTemplate: (data: CreationTooltipData) => string | DomConfig;

    // Custom rendering
    renderer: (renderData: DependencyRenderData) => void;
}

interface DependencyEditFeatureConfig {
    showLagField: boolean;
    triggerEvent: string;
    editorConfig: object;
}

interface DependencyRenderData {
    domConfig: DomConfig;
    dependencyRecord: DependencyModel;
    fromAssignmentRecord: AssignmentModel;
    toAssignmentRecord: AssignmentModel;
    points: object[];
    fromBox: Rectangle;
    toBox: Rectangle;
    fromSide: 'top' | 'right' | 'bottom' | 'left';
    toSide: 'top' | 'right' | 'bottom' | 'left';
}
```

---

## Complete Example

```typescript
import { SchedulerPro, ProjectModel, Toast, StringHelper } from '@bryntum/schedulerpro';

const project = new ProjectModel({
    autoLoad : true,
    loadUrl  : 'data/data.json',

    // Custom dependency fields
    dependencyStore : {
        fields : ['priority', 'notes']
    }
});

const scheduler = new SchedulerPro({
    appendTo : 'container',
    project,

    startDate  : new Date(2024, 0, 1),
    endDate    : new Date(2024, 2, 1),
    viewPreset : 'weekAndDay',

    // Highlight dependency chains on selection
    highlightSuccessors   : true,
    highlightPredecessors : true,

    features : {
        dependencies : {
            // Styling
            radius     : 10,
            clickWidth : 5,

            // Terminals
            terminalSides     : ['start', 'end'],
            terminalSize      : 16,
            terminalOffset    : 2,
            terminalShowDelay : 100,
            terminalHideDelay : 200,

            // Behavior
            allowCreate             : true,
            enableDelete            : true,
            highlightDependenciesOnEventHover : true,
            drawOnScroll           : true,
            drawOnEventInteraction : true,

            // Tooltips
            showTooltip      : true,
            showLagInTooltip : true,

            tooltipTemplate(dependency) {
                const types = ['SS', 'SF', 'FS', 'FF'];
                return `
                    <div class="dep-tooltip">
                        <strong>${dependency.fromEvent.name}</strong>
                        <span class="type">${types[dependency.type]}</span>
                        <strong>${dependency.toEvent.name}</strong>
                        ${dependency.lag
                            ? `<div class="lag">Lag: ${dependency.lag} ${dependency.lagUnit}</div>`
                            : ''}
                    </div>
                `;
            },

            // Custom rendering
            renderer({ domConfig, dependencyRecord }) {
                // Style based on priority
                domConfig.class['priority-high'] = dependencyRecord.priority === 'high';
                domConfig.class['priority-critical'] = dependencyRecord.priority === 'critical';
            }
        },

        dependencyEdit : {
            showLagField : true,

            editorConfig : {
                items : {
                    priorityField : {
                        type   : 'combo',
                        label  : 'Priority',
                        name   : 'priority',
                        items  : ['low', 'normal', 'high', 'critical'],
                        weight : 300
                    },
                    notesField : {
                        type   : 'textarea',
                        label  : 'Notes',
                        name   : 'notes',
                        weight : 400
                    }
                }
            }
        },

        dependencyMenu : {
            items : {
                viewDetails : {
                    text   : 'View Details',
                    icon   : 'b-fa b-fa-info-circle',
                    weight : 50,
                    onItem({ dependencyRecord }) {
                        showDependencyDetails(dependencyRecord);
                    }
                }
            }
        }
    },

    columns : [
        { type : 'resourceInfo', text : 'Resource', width : 200 }
    ],

    listeners : {
        beforeDependencyAdd({ dependencyRecord }) {
            // Validate new dependencies
            const { fromEvent, toEvent } = dependencyRecord;

            // Prevent self-links
            if (fromEvent.id === toEvent.id) {
                Toast.show('Cannot link event to itself');
                return false;
            }

            // Check for duplicates
            const exists = scheduler.dependencyStore.find(d =>
                d.from === fromEvent.id && d.to === toEvent.id
            );

            if (exists) {
                Toast.show('Dependency already exists');
                return false;
            }
        },

        dependencyClick({ dependencyRecord }) {
            console.log('Clicked dependency:', dependencyRecord.id);
        }
    },

    tbar : [
        {
            type    : 'checkbox',
            label   : 'Highlight chains',
            checked : true,
            onChange({ checked }) {
                scheduler.highlightSuccessors = checked;
                scheduler.highlightPredecessors = checked;
            }
        },
        {
            type     : 'button',
            text     : 'Add FS Dependency',
            icon     : 'b-fa b-fa-link',
            onAction() {
                const events = scheduler.eventStore.records;
                if (events.length >= 2) {
                    scheduler.dependencyStore.add({
                        from : events[0].id,
                        to   : events[1].id,
                        type : 2
                    });
                }
            }
        }
    ]
});

function showDependencyDetails(dep) {
    const types = {
        0 : 'Start-to-Start',
        1 : 'Start-to-Finish',
        2 : 'Finish-to-Start',
        3 : 'Finish-to-Finish'
    };

    Toast.show({
        html : `
            <strong>Dependency Details</strong><br>
            From: ${dep.fromEvent.name}<br>
            To: ${dep.toEvent.name}<br>
            Type: ${types[dep.type]}<br>
            Lag: ${dep.lag || 0} ${dep.lagUnit}<br>
            Active: ${dep.active}
        `,
        timeout : 5000
    });
}
```

```css
/* Custom dependency styling */
.b-sch-dependency.priority-high path {
    stroke: #ff9800;
    stroke-width: 2px;
}

.b-sch-dependency.priority-critical path {
    stroke: #f44336;
    stroke-width: 3px;
    stroke-dasharray: none;
}

.dep-tooltip {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
}

.dep-tooltip .type {
    background: #e0e0e0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
    align-self: center;
}

.dep-tooltip .lag {
    color: #666;
    font-size: 0.85em;
}
```

---

## Referenties

- **DependencyModel**: `schedulerpro.d.ts:310660`
- **DependencyBaseModel**: `schedulerpro.d.ts:200095`
- **DependenciesConfig**: `schedulerpro.d.ts:305370`
- **DependencyEditConfig**: `schedulerpro.d.ts:183958`
- **DependencyCreation**: `schedulerpro.d.ts:199586`
- **Example dependencies**: `examples/dependencies/app.module.js`
- **Example nested-events-dependencies**: `examples/nested-events-dependencies/app.module.js`

---

*Laatst bijgewerkt: December 2024*
