# Gantt Implementation: Layers

> **Layers** voor het beheren van de z-index en zichtbaarheid van Gantt canvaslagen.

---

## Overzicht

Bryntum Gantt heeft meerdere canvas lagen die je kunt tonen/verbergen en herordenen.

```
+--------------------------------------------------------------------------+
| GANTT                                                    | LAYERS       |
+--------------------------------------------------------------------------+
|                                                          | [x] Progress |
|  Name              |        Timeline                     | [x] Tasks    |
|  Planning          |  ████████                           | [x] Deps     |
|  Design            |       ████████                      | [x] Ranges   |
|  Development       |            ████████████             | [x] Rows     |
|                    |        |                            | [x] Tick     |
|                    | Progress Line                       | [x] Non-work |
|                    |                                     |              |
+--------------------------------------------------------------------------+
|                                                          | [^] [v]      |
|  CANVAS LAYERS (z-index order):                          | Move up/down |
|                                                          |              |
|  1. Progress Line Canvas    .b-progress-line-canvas      |              |
|  2. Tasks (Foreground)      .b-sch-foreground-canvas     |              |
|  3. Dependencies            .b-sch-dependencies-canvas   |              |
|  4. Time Ranges             .b-sch-time-ranges-canvas    |              |
|  5. Rows                    .b-time-axis-sub-grid        |              |
|  6. Column Lines            .b-column-lines-canvas       |              |
|  7. Non-working Time        .b-sch-non-working-time-canvas              |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Layers Setup

### 1.1 Create Layer Control Panel

```javascript
import { Gantt } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',

    project: {
        autoSetConstraints: true,
        autoLoad: true,
        loadUrl: '../_datasets/timeranges.json'
    },

    dependencyIdField: 'sequenceNumber',

    columns: [
        { type: 'name', field: 'name', text: 'Name', width: 250 }
    ],

    viewPreset: 'weekAndDayLetter',

    features: {
        progressLine: { statusDate: new Date(2019, 0, 27) },
        timeRanges: true
    },

    strips: {
        right: {
            type: 'panel',
            title: 'Layers',
            dock: 'right',
            collapsible: true,
            width: '20em',
            cls: 'b-sidebar',
            scrollable: { overflowY: true },
            defaults: {
                labelPosition: 'above',
                width: '15em'
            },
            items: {
                list: {
                    type: 'list',
                    flex: 1,
                    multiSelect: true,
                    itemTpl: record => `
                        <span>${record.text}</span>
                        <i class="fa fa-chevron-up" data-noselect></i>
                        <i class="fa fa-chevron-down" data-noselect></i>
                    `,
                    selected: [1, 2, 3, 4, 5, 6, 7],
                    items: [
                        { id: 1, text: 'Progress Line', selector: '.b-progress-line-canvas' },
                        { id: 2, text: 'Tasks', selector: '.b-sch-foreground-canvas' },
                        { id: 3, text: 'Dependencies', selector: '.b-sch-dependencies-canvas' },
                        { id: 4, text: 'Time Ranges', selector: '.b-sch-time-ranges-canvas' },
                        { id: 5, text: 'Rows', selector: '.b-time-axis-sub-grid' },
                        { id: 6, text: 'Time Axis Tick Lines', selector: '.b-column-lines-canvas' },
                        { id: 7, text: 'Nonworking Time', selector: '.b-sch-non-working-time-canvas' }
                    ],
                    onItem: 'up.onListItemClick',
                    onSelectionChange: 'up.onListSelectionChange'
                }
            }
        }
    },

    onListItemClick({ source: list, index, record, event }) {
        const { store } = list;

        // Move layer up
        if (event.target.matches('.fa-chevron-up')) {
            if (index > 0) {
                store.move(record, store.getAt(index - 1));
                this.applyZIndexes(store);
            }
        }
        // Move layer down
        else if (event.target.matches('.fa-chevron-down')) {
            if (index < store.count - 1) {
                store.move(record, store.getAt(index + 2));
                this.applyZIndexes(store);
            }
        }
    },

    onListSelectionChange({ source: list, selected }) {
        if (this.element) {
            // Remove disabled class from all
            this.element.querySelectorAll('.b-disabled').forEach(el =>
                el.classList.remove('b-disabled')
            );

            // Add disabled class to unselected
            list.store.forEach(item => {
                if (!list.selected.includes(item)) {
                    this.element.querySelectorAll(item.selector).forEach(el =>
                        el.classList.add('b-disabled')
                    );
                }
            });
        }
    },

    applyZIndexes(store) {
        store.forEach((record, index) => {
            this.element.querySelectorAll(record.selector).forEach(el =>
                el.style.zIndex = 1000 - index
            );
        });
    }
});
```

---

## 2. Available Canvas Layers

### 2.1 Layer Selectors

```javascript
const layers = [
    {
        id: 'progress',
        text: 'Progress Line',
        selector: '.b-progress-line-canvas',
        description: 'Shows project progress line'
    },
    {
        id: 'tasks',
        text: 'Tasks',
        selector: '.b-sch-foreground-canvas',
        description: 'Task bars and milestones'
    },
    {
        id: 'dependencies',
        text: 'Dependencies',
        selector: '.b-sch-dependencies-canvas',
        description: 'Dependency lines between tasks'
    },
    {
        id: 'timeranges',
        text: 'Time Ranges',
        selector: '.b-sch-time-ranges-canvas',
        description: 'Highlighted time ranges'
    },
    {
        id: 'rows',
        text: 'Rows',
        selector: '.b-time-axis-sub-grid',
        description: 'Row backgrounds'
    },
    {
        id: 'columns',
        text: 'Column Lines',
        selector: '.b-column-lines-canvas',
        description: 'Vertical tick lines'
    },
    {
        id: 'nonworking',
        text: 'Non-working Time',
        selector: '.b-sch-non-working-time-canvas',
        description: 'Weekend/holiday highlighting'
    }
];
```

---

## 3. Programmatic Layer Control

### 3.1 Toggle Layer Visibility

```javascript
// Hide a specific layer
function hideLayer(selector) {
    gantt.element.querySelectorAll(selector).forEach(el => {
        el.classList.add('b-disabled');
    });
}

// Show a specific layer
function showLayer(selector) {
    gantt.element.querySelectorAll(selector).forEach(el => {
        el.classList.remove('b-disabled');
    });
}

// Toggle layer
function toggleLayer(selector, visible) {
    if (visible) {
        showLayer(selector);
    } else {
        hideLayer(selector);
    }
}

// Usage
toggleLayer('.b-sch-dependencies-canvas', false);  // Hide dependencies
toggleLayer('.b-progress-line-canvas', true);       // Show progress line
```

### 3.2 Change Layer Order

```javascript
// Set z-index for a layer
function setLayerZIndex(selector, zIndex) {
    gantt.element.querySelectorAll(selector).forEach(el => {
        el.style.zIndex = zIndex;
    });
}

// Bring tasks to front
setLayerZIndex('.b-sch-foreground-canvas', 1000);

// Send dependencies to back
setLayerZIndex('.b-sch-dependencies-canvas', 100);
```

---

## 4. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useState, useRef, useCallback } from 'react';

const LAYERS = [
    { id: 'progress', text: 'Progress Line', selector: '.b-progress-line-canvas' },
    { id: 'tasks', text: 'Tasks', selector: '.b-sch-foreground-canvas' },
    { id: 'dependencies', text: 'Dependencies', selector: '.b-sch-dependencies-canvas' },
    { id: 'timeranges', text: 'Time Ranges', selector: '.b-sch-time-ranges-canvas' },
    { id: 'columns', text: 'Column Lines', selector: '.b-column-lines-canvas' }
];

function GanttWithLayers({ projectData }) {
    const ganttRef = useRef(null);
    const [visibleLayers, setVisibleLayers] = useState(LAYERS.map(l => l.id));
    const [layerOrder, setLayerOrder] = useState(LAYERS.map(l => l.id));

    const toggleLayer = useCallback((layerId) => {
        const layer = LAYERS.find(l => l.id === layerId);
        if (!layer) return;

        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        const isVisible = visibleLayers.includes(layerId);

        gantt.element.querySelectorAll(layer.selector).forEach(el => {
            el.classList.toggle('b-disabled', isVisible);
        });

        setVisibleLayers(prev =>
            isVisible
                ? prev.filter(id => id !== layerId)
                : [...prev, layerId]
        );
    }, [visibleLayers]);

    const moveLayer = useCallback((layerId, direction) => {
        const currentIndex = layerOrder.indexOf(layerId);
        const newIndex = direction === 'up'
            ? Math.max(0, currentIndex - 1)
            : Math.min(layerOrder.length - 1, currentIndex + 1);

        if (currentIndex === newIndex) return;

        const newOrder = [...layerOrder];
        [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
        setLayerOrder(newOrder);

        // Apply z-indexes
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            newOrder.forEach((id, index) => {
                const layer = LAYERS.find(l => l.id === id);
                if (layer) {
                    gantt.element.querySelectorAll(layer.selector).forEach(el => {
                        el.style.zIndex = 1000 - index;
                    });
                }
            });
        }
    }, [layerOrder]);

    const ganttConfig = {
        features: {
            progressLine: { statusDate: new Date() },
            timeRanges: true,
            columnLines: true
        },
        columns: [
            { type: 'name', width: 250 }
        ],
        viewPreset: 'weekAndDayLetter'
    };

    return (
        <div className="gantt-layers-wrapper">
            <BryntumGantt
                ref={ganttRef}
                project={projectData}
                {...ganttConfig}
            />

            <div className="layers-panel">
                <h3>Layers</h3>
                {layerOrder.map((layerId, index) => {
                    const layer = LAYERS.find(l => l.id === layerId);
                    const isVisible = visibleLayers.includes(layerId);

                    return (
                        <div key={layerId} className="layer-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={() => toggleLayer(layerId)}
                                />
                                {layer.text}
                            </label>
                            <button onClick={() => moveLayer(layerId, 'up')} disabled={index === 0}>
                                ▲
                            </button>
                            <button onClick={() => moveLayer(layerId, 'down')} disabled={index === layerOrder.length - 1}>
                                ▼
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
```

---

## 5. Styling

```css
/* Hidden layer */
.b-disabled {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
}

/* Layer panel */
.layers-panel {
    position: absolute;
    right: 0;
    top: 0;
    width: 200px;
    background: #f5f5f5;
    border-left: 1px solid #e0e0e0;
    padding: 16px;
}

.layers-panel h3 {
    margin: 0 0 16px;
    font-size: 14px;
    text-transform: uppercase;
    color: #666;
}

/* Layer item */
.layer-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 4px;
}

.layer-item label {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.layer-item button {
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    background: #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
}

.layer-item button:hover:not(:disabled) {
    background: #1976d2;
    color: white;
}

.layer-item button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

/* Transition for layer changes */
.b-progress-line-canvas,
.b-sch-foreground-canvas,
.b-sch-dependencies-canvas,
.b-sch-time-ranges-canvas,
.b-column-lines-canvas,
.b-sch-non-working-time-canvas {
    transition: opacity 0.3s, z-index 0s;
}

/* Sidebar panel styling */
.b-sidebar {
    background: #fafafa;
}

.b-sidebar .b-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
}

.b-sidebar .b-list-item i {
    cursor: pointer;
    padding: 4px;
    opacity: 0.5;
}

.b-sidebar .b-list-item i:hover {
    opacity: 1;
    color: #1976d2;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Layer niet zichtbaar | b-disabled class | Verwijder class |
| Z-index werkt niet | Position niet relative | Check CSS positioning |
| Selector niet gevonden | Element niet gerenderd | Wacht op paint event |
| Transition niet smooth | Transition CSS mist | Voeg transition toe |

---

## API Reference

### Canvas Layer Selectors

| Layer | Selector |
|-------|----------|
| Progress Line | `.b-progress-line-canvas` |
| Tasks | `.b-sch-foreground-canvas` |
| Dependencies | `.b-sch-dependencies-canvas` |
| Time Ranges | `.b-sch-time-ranges-canvas` |
| Rows | `.b-time-axis-sub-grid` |
| Column Lines | `.b-column-lines-canvas` |
| Non-working Time | `.b-sch-non-working-time-canvas` |

### Strip Panel Config

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | 'panel' |
| `dock` | String | 'right', 'left' |
| `collapsible` | Boolean | Allow collapse |
| `width` | String/Number | Panel width |

---

## Bronnen

- **Example**: `examples/layers/`
- **Strip Panels**: `Core.widget.Panel`

---

*Priority 2: Medium Priority Features*
