# SchedulerPro Deep Dive: Dependencies

## Overview

Dependencies in SchedulerPro represent relationships between events, where one event (successor) depends on another (predecessor). The Dependencies feature draws visual lines between events and supports interactive creation, editing, and validation.

## Dependency Types

SchedulerPro supports four standard dependency types:

```typescript
type DependencyType = {
    StartToStart: 0   // SS: Successor cannot start before predecessor starts
    StartToEnd: 1     // SF: Successor cannot finish before predecessor starts
    EndToStart: 2     // FS: Successor cannot start before predecessor finishes (most common)
    EndToEnd: 3       // FF: Successor cannot finish before predecessor finishes
}

// Access via static property
DependencyBaseModel.Type.EndToStart  // 2
DependencyBaseModel.Type.StartToStart  // 0
```

### Visual Representation

```
FS (Finish-to-Start):          SS (Start-to-Start):
┌────────┐                     ┌────────┐
│  Pred  │────┐                │  Pred  │
└────────┘    │                └────┬───┘
              │                     │
              └──▶┌────────┐   ┌────▼───┐
                  │  Succ  │   │  Succ  │
                  └────────┘   └────────┘

FF (Finish-to-Finish):         SF (Start-to-Finish):
┌────────┐                     ┌────────┐
│  Pred  ├────┐                │  Pred  │
└────────┘    │                └┬───────┘
              │                 │
         ┌────▼───┐             │    ┌────────┐
         │  Succ  │             └───▶│  Succ  │
         └────────┘                  └────────┘
```

## DependencyBaseModel

The model class for dependency records.

### Fields

```typescript
export class DependencyBaseModel extends Model {
    // Static type enumeration
    static readonly Type: DependencyType

    // Source event
    from: string | number              // ID of source event
    fromEvent: string | number | SchedulerEventModel  // Source event or ID
    fromSide: 'top' | 'left' | 'bottom' | 'right'    // Which side to connect from

    // Target event
    to: string | number                // ID of target event
    toEvent: string | number | SchedulerEventModel   // Target event or ID
    toSide: 'top' | 'left' | 'bottom' | 'right'      // Which side to connect to

    // Type
    type: number                       // 0-3, see DependencyType
    hardType: number                   // Same as type, but resets sides when set

    // Lag (delay/lead time)
    lag: number                        // Magnitude of lag
    readonly lagUnit: DurationUnit     // Unit (day, hour, etc.)
    fullLag: Duration                  // Combined magnitude and unit

    // Appearance
    cls: string                        // CSS class for line styling
    bidirectional: boolean             // Arrows on both ends

    // State
    readonly isPersistable: boolean    // Both events are persisted
    readonly isDependencyBaseModel: boolean
}
```

### Methods

```typescript
// Set lag with unit
setLag(lag: number | string | object, lagUnit?: DurationUnitShort): void

// Example:
dependency.setLag(2, 'd');      // 2 days
dependency.setLag('1w');        // 1 week (parsed string)
dependency.setLag({ magnitude: 4, unit: 'hour' });

// Set type and reset sides
setHardType(type: number): void
getHardType(): number

// Highlighting
highlight(cls: string): void
unhighlight(cls: string): void
isHighlightedWith(cls: string): boolean

// Async field update
setAsync(field: string | object, value?: any, silent?: boolean): Promise<void>
```

## DependencyStore

Manages the collection of dependencies.

### Configuration

```typescript
const dependencyStore = new DependencyStore({
    data: [
        { id: 1, from: 'event1', to: 'event2', type: 2 },
        { id: 2, from: 'event2', to: 'event3', type: 2, lag: 1, lagUnit: 'd' }
    ]
});
```

### Key Methods

```typescript
// Add dependencies
add(records: DependencyModel | DependencyModelConfig[]): DependencyModel[]
addAsync(records: DependencyModel | DependencyModelConfig[]): Promise<DependencyModel[]>

// Query dependencies
getDependencyForSourceAndTargetEvents(
    sourceEvent: SchedulerEventModel | string,
    targetEvent: SchedulerEventModel | string
): DependencyModel

getEventDependencies(event: SchedulerEventModel): DependencyModel[]

getEventsLinkingDependency(
    sourceEvent: SchedulerEventModel | string,
    targetEvent: SchedulerEventModel | string
): DependencyModel

// Validation
isValidDependency(
    dependencyOrFromId: DependencyModel | TimeSpan | number | string,
    toId?: TimeSpan | number | string,
    type?: number
): Promise<boolean>

// Highlighting
getHighlightedDependencies(cls: string): DependencyBaseModel[]

// Async data loading
loadDataAsync(data: DependencyModelConfig[]): Promise<void>
```

## Dependencies Feature Configuration

### Basic Setup

```typescript
const scheduler = new SchedulerPro({
    features: {
        dependencies: true  // Enable with defaults
    },
    dependencyStore: {
        data: [
            { from: 1, to: 2, type: 2 }
        ]
    }
});
```

### Full Configuration

```typescript
const scheduler = new SchedulerPro({
    features: {
        dependencies: {
            // Creation
            allowCreate: true,                    // Allow creating via drag
            allowCreateOnlyParent: false,         // Only for parent events (NestedEvents)
            allowDropOnEventBar: true,            // Drop on bar uses default type

            // Interaction
            enableDelete: true,                   // Click to delete
            clickWidth: 10,                       // Clickable width for easy selection

            // Terminals (connection points)
            terminalSides: ['start', 'top', 'end', 'bottom'],
            terminalCls: 'my-terminal',
            terminalSize: 12,                     // Diameter in px
            terminalOffset: 0,                    // Offset from event edge
            terminalShowDelay: 500,               // Delay before showing on hover
            terminalHideDelay: 200,               // Delay before hiding

            // Visual
            radius: 5,                            // Corner radius for line bends
            markerDef: 'M0,0 L9,3 L0,6 z',       // Arrow head SVG path

            // Tooltips
            showTooltip: true,                    // Show on hover
            showCreationTooltip: true,            // Show during creation
            showLagInTooltip: true,               // Include lag info

            // Performance
            drawOnScroll: true,                   // Draw during scroll
            drawOnEventInteraction: true,         // Draw during drag/resize
            drawAroundParents: false              // Experimental: route around parents
        }
    }
});
```

### Tooltip Templates

```typescript
features: {
    dependencies: {
        // Hover tooltip
        tooltipTemplate(dependency) {
            return `
                <div class="dep-tooltip">
                    <strong>${dependency.fromEvent.name}</strong>
                    →
                    <strong>${dependency.toEvent.name}</strong>
                    <br>
                    Type: ${['SS', 'SF', 'FS', 'FF'][dependency.type]}
                    ${dependency.lag ? `<br>Lag: ${dependency.lag} ${dependency.lagUnit}` : ''}
                </div>
            `;
        },

        // Creation tooltip
        creationTooltipTemplate({ source, target, fromSide, toSide, valid }) {
            if (!valid) {
                return '<div class="invalid">Invalid dependency</div>';
            }
            return {
                tag: 'div',
                class: 'creation-tooltip',
                children: [
                    { tag: 'div', text: `From: ${source.name} (${fromSide})` },
                    { tag: 'div', text: `To: ${target.name} (${toSide})` }
                ]
            };
        }
    }
}
```

### Custom Renderer

```typescript
features: {
    dependencies: {
        renderer({
            domConfig,           // DomConfig to modify
            dependencyRecord,    // The dependency being rendered
            fromAssignmentRecord,
            toAssignmentRecord,
            points,              // Line segment points (read-only)
            fromBox,             // Source event bounds
            toBox,               // Target event bounds
            fromSide,            // 'top' | 'right' | 'bottom' | 'left'
            toSide
        }) {
            // Add custom class based on type
            domConfig.class['type-' + dependencyRecord.type] = true;

            // Custom styling for critical path
            if (dependencyRecord.isCritical) {
                domConfig.class['critical-path'] = true;
                domConfig.style = domConfig.style || {};
                domConfig.style.stroke = '#ff0000';
                domConfig.style.strokeWidth = '3px';
            }

            // Add data attribute
            domConfig.dataset = {
                dependencyId: dependencyRecord.id
            };
        }
    }
}
```

## Event Relationships

Access dependencies from events:

```typescript
// Get all dependencies where event is the predecessor
const outgoing = event.successors;  // DependencyBaseModel[]

// Get all dependencies where event is the successor
const incoming = event.predecessors;  // DependencyBaseModel[]

// Example usage
eventStore.getById('task-1').successors.forEach(dep => {
    console.log(`Depends on: ${dep.toEvent.name}, Type: ${dep.type}`);
});
```

## Dependencies Events

### Creation Events

```typescript
const scheduler = new SchedulerPro({
    listeners: {
        // Before drag starts
        beforeDependencyCreateDrag({ source }) {
            // Return false to prevent
            if (source.locked) return false;
        },

        // Drag started
        dependencyCreateDragStart({ source }) {
            console.log('Started from:', source.name);
        },

        // Before drop finalizes
        beforeDependencyCreateFinalize({ source, target, fromSide, toSide }) {
            // Validate and possibly prevent
            if (source.type === 'milestone' && target.type === 'milestone') {
                return false;  // No milestone-to-milestone
            }
        },

        // After successful drop
        dependencyCreateDrop({ source, target, dependency }) {
            console.log('Created:', dependency.id);
        },

        // After any drop (success or cancel)
        afterDependencyCreateDrop({ source, target, dependency }) {
            // dependency is null if cancelled
        }
    }
});
```

### Validation Events

```typescript
listeners: {
    // Async validation started
    dependencyValidationStart({ source, target, dependencyType }) {
        showLoadingIndicator();
    },

    // Async validation completed
    dependencyValidationComplete({ source, target, dependencyType }) {
        hideLoadingIndicator();
    }
}
```

### Terminal Events

```typescript
listeners: {
    // Before showing terminals on hover
    beforeShowTerminals({ source }) {
        // Return false to prevent showing terminals
        if (source.readOnly) return false;
    }
}
```

## Programmatic Dependency Management

### Creating Dependencies

```typescript
// Add single dependency
const [dep] = dependencyStore.add({
    from: 'event-1',
    to: 'event-2',
    type: DependencyBaseModel.Type.EndToStart,
    lag: 1,
    lagUnit: 'd'
});

// Add with async (wait for engine calculation)
const [dep] = await dependencyStore.addAsync({
    from: 'event-1',
    to: 'event-2',
    type: 2
});

// Add multiple
dependencyStore.add([
    { from: 1, to: 2, type: 2 },
    { from: 2, to: 3, type: 2 },
    { from: 3, to: 4, type: 0 }
]);
```

### Querying Dependencies

```typescript
// Get all dependencies for an event
const deps = dependencyStore.getEventDependencies(event);

// Get specific dependency
const dep = dependencyStore.getDependencyForSourceAndTargetEvents('event-1', 'event-2');

// Get linking dependency (same as above)
const dep = dependencyStore.getEventsLinkingDependency('event-1', 'event-2');
```

### Modifying Dependencies

```typescript
// Change type
dependency.type = DependencyBaseModel.Type.StartToStart;

// Change type and reset sides
dependency.setHardType(DependencyBaseModel.Type.FinishToFinish);

// Set lag
dependency.setLag(2, 'd');  // 2 days
dependency.setLag(-1, 'h'); // -1 hour (lead time)

// Async update (triggers engine recalculation)
await dependency.setAsync('lag', 3);

// Change events
dependency.fromEvent = anotherEvent;
dependency.toEvent = yetAnotherEvent;
```

### Removing Dependencies

```typescript
// Remove single
dependencyStore.remove(dependency);

// Remove multiple
dependencyStore.remove([dep1, dep2, dep3]);

// Remove by ID
dependencyStore.remove(dependencyStore.getById('dep-1'));
```

### Validation

```typescript
// Check if dependency is valid
const isValid = await dependencyStore.isValidDependency('event-1', 'event-2', 2);

// Check existing dependency
const isValid = await dependencyStore.isValidDependency(dependency);

// With type
const isValid = await dependencyStore.isValidDependency(
    fromEvent,
    toEvent,
    DependencyBaseModel.Type.EndToStart
);
```

## Highlighting Dependencies

```typescript
// Highlight specific dependency
dependency.highlight('my-highlight-class');

// Check if highlighted
if (dependency.isHighlightedWith('my-highlight-class')) {
    // ...
}

// Remove highlight
dependency.unhighlight('my-highlight-class');

// Get all highlighted dependencies
const highlighted = dependencyStore.getHighlightedDependencies('my-highlight-class');
```

### Highlight on Event Hover

```typescript
features: {
    dependencies: {
        highlightDependenciesOnEventHover: true
    }
}
```

## Dependency Styling

### CSS Classes

```typescript
// On dependency record
dependencyStore.add({
    from: 1,
    to: 2,
    type: 2,
    cls: 'critical important'
});

// In renderer
renderer({ domConfig, dependencyRecord }) {
    domConfig.class['dashed'] = dependencyRecord.priority === 'low';
    domConfig.class['thick'] = dependencyRecord.priority === 'high';
}
```

### CSS Variables

```css
/* Dependency line styling */
.b-sch-dependency {
    stroke: #999;
    stroke-width: 1px;
}

.b-sch-dependency.critical {
    stroke: #ff0000;
    stroke-width: 2px;
}

.b-sch-dependency.dashed {
    stroke-dasharray: 5, 5;
}

/* Arrow marker */
.b-sch-dependency-arrow {
    fill: #999;
}

.b-sch-dependency.critical .b-sch-dependency-arrow {
    fill: #ff0000;
}

/* Terminals */
.b-sch-terminal {
    fill: #666;
    stroke: #fff;
}

.b-sch-terminal:hover {
    fill: #333;
    transform: scale(1.2);
}
```

## Lag and Lead Time

### Positive Lag (Delay)

```typescript
// Successor starts 2 days AFTER predecessor finishes
dependencyStore.add({
    from: 1,
    to: 2,
    type: 2,  // FS
    lag: 2,
    lagUnit: 'd'
});
```

### Negative Lag (Lead Time)

```typescript
// Successor can start 3 hours BEFORE predecessor finishes
dependencyStore.add({
    from: 1,
    to: 2,
    type: 2,  // FS
    lag: -3,
    lagUnit: 'h'
});
```

### Lag Units

```typescript
// Valid lagUnit values
'millisecond' | 'ms'
'second' | 's'
'minute' | 'mi'
'hour' | 'h'
'day' | 'd'
'week' | 'w'
'month' | 'M'
'quarter' | 'q'
'year' | 'y'
```

## Bidirectional Dependencies

```typescript
// Draw arrows on both ends
dependencyStore.add({
    from: 1,
    to: 2,
    type: 2,
    bidirectional: true
});
```

## Custom Terminal Sides

```typescript
// Specify which sides to draw from/to
dependencyStore.add({
    from: 1,
    to: 2,
    type: 2,
    fromSide: 'bottom',
    toSide: 'top'
});

// Configure available terminal positions
features: {
    dependencies: {
        terminalSides: ['start', 'end']  // Only left/right
    }
}
```

## Performance Optimization

### Large Datasets

```typescript
features: {
    dependencies: {
        // Skip drawing during scroll
        drawOnScroll: false,

        // Skip drawing during interaction
        drawOnEventInteraction: false,

        // Increase click width (requires 2x lines)
        clickWidth: 1  // Minimal (harder to click)
    }
}
```

### Disabling Feature

```typescript
// Disable dependencies temporarily
scheduler.features.dependencies.disabled = true;

// Re-enable
scheduler.features.dependencies.disabled = false;
```

## Integration with SchedulerPro Engine

In SchedulerPro (vs regular Scheduler), dependencies affect scheduling:

```typescript
// When a predecessor's end date changes, successors are rescheduled
event1.endDate = new Date('2024-02-01');
// event2 (successor) automatically moves based on dependency type and lag

// The scheduling engine respects:
// - Dependency types
// - Lag/lead time
// - Event constraints
// - Calendars/working time
```

## Common Patterns

### Pattern 1: Chain Dependencies

```typescript
function chainEvents(eventIds) {
    const dependencies = [];
    for (let i = 0; i < eventIds.length - 1; i++) {
        dependencies.push({
            from: eventIds[i],
            to: eventIds[i + 1],
            type: DependencyBaseModel.Type.EndToStart
        });
    }
    return dependencyStore.add(dependencies);
}

// Usage
chainEvents([1, 2, 3, 4, 5]);  // 1→2→3→4→5
```

### Pattern 2: Validate Before Save

```typescript
async function validateAllDependencies() {
    const invalid = [];

    for (const dep of dependencyStore.records) {
        const isValid = await dependencyStore.isValidDependency(dep);
        if (!isValid) {
            invalid.push(dep);
        }
    }

    return invalid;
}
```

### Pattern 3: Critical Path Highlighting

```typescript
function highlightCriticalPath(criticalDependencyIds) {
    dependencyStore.forEach(dep => {
        if (criticalDependencyIds.includes(dep.id)) {
            dep.highlight('critical-path');
        } else {
            dep.unhighlight('critical-path');
        }
    });
}
```

### Pattern 4: Dependency Info Tooltip

```typescript
features: {
    dependencies: {
        showTooltip: true,
        tooltipTemplate(dep) {
            const typeNames = ['Start-to-Start', 'Start-to-Finish', 'Finish-to-Start', 'Finish-to-Finish'];
            return `
                <table class="dep-info">
                    <tr><td>From:</td><td>${dep.fromEvent?.name || 'N/A'}</td></tr>
                    <tr><td>To:</td><td>${dep.toEvent?.name || 'N/A'}</td></tr>
                    <tr><td>Type:</td><td>${typeNames[dep.type]}</td></tr>
                    <tr><td>Lag:</td><td>${dep.lag || 0} ${dep.lagUnit}</td></tr>
                </table>
            `;
        }
    }
}
```

## Integration Notes

1. **Async Validation**: Always use async methods (`addAsync`, `isValidDependency`) when you need guaranteed valid state.

2. **Engine Calculation**: In SchedulerPro, modifying dependencies triggers the scheduling engine. Use batching for multiple changes.

3. **Circular Dependencies**: The engine will reject circular dependencies. Always validate before adding.

4. **Performance**: Drawing many dependencies can impact scrolling performance. Consider `drawOnScroll: false` for large datasets.

5. **Terminals**: Terminal visibility is controlled by hover state. Use `terminalShowDelay`/`terminalHideDelay` for UX tuning.

6. **Model Persistence**: The `isPersistable` property returns `true` only when both source and target events are persisted (not phantoms).
