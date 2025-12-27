# Grid Implementation: Tooltip

> **Tooltip** voor het configureren van geavanceerde tooltips.

---

## Overzicht

Bryntum biedt uitgebreide Tooltip widgets met alignment, async content en constraints.

```
+--------------------------------------------------------------------------+
| PANEL                  [Align: t-b ▼] [Min height: 100] [Axis lock ☐]    |
+--------------------------------------------------------------------------+
|                                                                          |
|           +---------------------------+                                  |
|           | The Tooltip               |                                  |
|           |---------------------------|                                  |
|           | This is extended          |                                  |
|           | informational text.       |                                  |
|           |                           |                                  |
|           | Aligned to the target.    |                                  |
|           +---------------------------+                                  |
|                       |                                                  |
|              [Drag me (target)]                                          |
|                                                                          |
|     [I show async tooltip, hover me]                                     |
|              +---------------------------+                               |
|              | Async Tooltip             |                               |
|              | Loading content from      |                               |
|              | server...                 |                               |
|              +---------------------------+                               |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Tooltip Setup

### 1.1 Static Tooltip

```javascript
import { Tooltip, Panel } from '@bryntum/grid';

const panel = new Panel({
    appendTo: 'container',
    html: '<div id="tipTarget" class="target">Hover me</div>'
});

const target = document.getElementById('tipTarget');

const tooltip = new Tooltip({
    title: 'The Tooltip',
    html: '<p>This is extended informational text.</p><p>Aligned to the target element.</p>',
    maxWidth: '20em',
    forElement: target,      // Mouseover this element
    hideDelay: false,        // Don't hide on timer
    showOnHover: true,       // Show on hover
    hoverDelay: 0,           // Immediate show
    autoShow: true,          // Show on construct
    textContent: true,       // Contains flowing text
    autoClose: false,        // No "tap out" listener
    scrollAction: 'realign', // Realign on scroll
    constrainTo: document.querySelector('.b-panel-content')
});
```

---

## 2. Async Tooltip

### 2.1 Load Content from Server

```javascript
import { Tooltip, AjaxHelper } from '@bryntum/grid';

const asyncTooltip = new Tooltip({
    title: 'Async Tooltip',
    maxWidth: '20em',
    forElement: document.getElementById('asyncTarget'),
    hideDelay: 0,
    showOnHover: true,
    hoverDelay: 0,
    textContent: true,
    scrollAction: 'realign',

    // Async content getter
    async getHtml({ source: tip }) {
        const { parsedJson: json } = await AjaxHelper.get('api/tooltip-content.json', {
            parseJson: true
        });
        return json.success && json.msg || 'No content available';
    }
});
```

---

## 3. Alignment Options

### 3.1 Tooltip Alignment Configuration

```javascript
const tooltip = new Tooltip({
    // Alignment options: 't-b', 'b-t', 'l-r', 'r-l'
    align: 't-b',  // Top of tooltip to bottom of target

    // Minimum dimensions
    align: {
        align: 't-b',
        minHeight: 100,
        minWidth: 150
    },

    // Axis lock - keep on same axis when flipping
    axisLock: true
});

// Change alignment dynamically
tooltip.align = 'l-r';
tooltip.alignTo(targetElement);
```

### 3.2 Interactive Alignment Controls

```javascript
tbar: {
    items: {
        align: {
            type: 'combo',
            label: 'Align',
            items: ['t-b', 'b-t', 'l-r', 'r-l'],
            editable: false,
            inputWidth: '6em',
            onChange: ({ value }) => {
                tooltip.align = value;
                tooltip.alignTo(target);
            }
        },
        minHeight: {
            type: 'numberfield',
            label: 'Min height',
            min: 100,
            clearable: true,
            value: null,
            inputWidth: '8em',
            listeners: {
                change({ value }) {
                    tooltip.align.minHeight = value;
                },
                clear() {
                    tooltip.align.minHeight = null;
                }
            }
        },
        axisLock: {
            type: 'checkbox',
            text: 'Axis lock',
            onChange: ({ checked }) => {
                tooltip.axisLock = checked;
                tooltip.alignTo(target);
            }
        }
    }
}
```

---

## 4. Draggable Target with Tooltip

### 4.1 Keep Tooltip Aligned During Drag

```javascript
import { DragHelper, Rectangle, EventHelper } from '@bryntum/grid';

const constrainTo = document.querySelector('.b-panel-content');
const target = document.getElementById('tipTarget');
const constrainBox = Rectangle.content(constrainTo);

const dragger = new DragHelper({
    outerElement: constrainTo,
    mode: 'translateXY',
    minX: 0,
    minY: 0,
    maxX: constrainBox.width - target.offsetWidth,
    maxY: constrainBox.height - target.offsetHeight,
    targetSelector: '#tipTarget',
    listeners: {
        // Realign tooltip during drag
        drag: () => tooltip.alignTo(target)
    }
});

// Handle window resize
EventHelper.on({
    element: window,
    resize: () => {
        const constrainBox = Rectangle.content(constrainTo);
        dragger.maxX = constrainBox.width - target.offsetWidth;
        dragger.maxY = constrainBox.height - target.offsetHeight;
    }
});
```

---

## 5. React Integration

```jsx
import { useEffect, useRef, useCallback } from 'react';
import { Tooltip, AjaxHelper } from '@bryntum/grid';

function TooltipDemo() {
    const targetRef = useRef(null);
    const asyncTargetRef = useRef(null);
    const tooltipRef = useRef(null);
    const asyncTooltipRef = useRef(null);

    useEffect(() => {
        // Create static tooltip
        tooltipRef.current = new Tooltip({
            title: 'Information',
            html: '<p>This is helpful information about this element.</p>',
            maxWidth: '20em',
            forElement: targetRef.current,
            showOnHover: true,
            hoverDelay: 300,
            hideDelay: 0,
            textContent: true
        });

        // Create async tooltip
        asyncTooltipRef.current = new Tooltip({
            title: 'Loading...',
            maxWidth: '20em',
            forElement: asyncTargetRef.current,
            showOnHover: true,
            hoverDelay: 0,
            textContent: true,
            async getHtml() {
                const response = await fetch('/api/tooltip-content');
                const data = await response.json();
                return data.content;
            }
        });

        return () => {
            tooltipRef.current?.destroy();
            asyncTooltipRef.current?.destroy();
        };
    }, []);

    const setAlignment = useCallback((align) => {
        if (tooltipRef.current) {
            tooltipRef.current.align = align;
            tooltipRef.current.alignTo(targetRef.current);
        }
    }, []);

    return (
        <div className="tooltip-demo">
            <div className="toolbar">
                <label>
                    Alignment:
                    <select onChange={(e) => setAlignment(e.target.value)}>
                        <option value="t-b">Top to Bottom</option>
                        <option value="b-t">Bottom to Top</option>
                        <option value="l-r">Left to Right</option>
                        <option value="r-l">Right to Left</option>
                    </select>
                </label>
            </div>

            <div className="content">
                <button ref={targetRef} className="tooltip-target">
                    Hover for static tooltip
                </button>

                <button ref={asyncTargetRef} className="tooltip-target">
                    Hover for async tooltip
                </button>
            </div>
        </div>
    );
}
```

---

## 6. Styling

```css
/* Tooltip container */
.b-tooltip {
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 300px;
}

/* Tooltip title */
.b-tooltip .b-tooltip-header {
    background: #1976d2;
    color: white;
    padding: 8px 12px;
    font-weight: 500;
    border-radius: 8px 8px 0 0;
}

/* Tooltip content */
.b-tooltip .b-tooltip-content {
    padding: 12px;
    line-height: 1.5;
}

/* Tooltip with arrow */
.b-tooltip::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 8px solid transparent;
}

/* Arrow positions */
.b-tooltip.b-aligned-below::before {
    border-bottom-color: #1976d2;
    top: -16px;
    left: 50%;
    transform: translateX(-50%);
}

.b-tooltip.b-aligned-above::before {
    border-top-color: white;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
}

/* Target element */
.tooltip-target {
    padding: 16px 24px;
    background: #e3f2fd;
    border: 2px solid #1976d2;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
}

.tooltip-target:hover {
    background: #bbdefb;
}

/* Loading state */
.b-tooltip.loading .b-tooltip-content::after {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #1976d2;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 8px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Tooltip niet zichtbaar | forElement niet correct | Check element reference |
| Tooltip blijft hangen | hideDelay: false | Voeg hideDelay toe |
| Positie springt | constrainTo niet gezet | Voeg constrainTo toe |
| Async content toont niet | getHtml error | Check async function |

---

## API Reference

### Tooltip Config

| Property | Type | Description |
|----------|------|-------------|
| `title` | String | Tooltip title |
| `html` | String | HTML content |
| `forElement` | HTMLElement | Target element |
| `showOnHover` | Boolean | Show on hover |
| `hoverDelay` | Number | Delay before show (ms) |
| `hideDelay` | Number/Boolean | Delay before hide |
| `autoShow` | Boolean | Show on construct |
| `autoClose` | Boolean | Close on tap outside |
| `textContent` | Boolean | Contains text |
| `maxWidth` | String/Number | Maximum width |
| `constrainTo` | HTMLElement | Constrain boundary |
| `scrollAction` | String | 'realign', 'hide' |
| `axisLock` | Boolean | Lock flip axis |

### Tooltip Methods

| Method | Description |
|--------|-------------|
| `alignTo(element)` | Align to element |
| `show()` | Show tooltip |
| `hide()` | Hide tooltip |
| `destroy()` | Cleanup tooltip |

### Alignment Options

| Value | Description |
|-------|-------------|
| `'t-b'` | Top of tooltip to bottom of target |
| `'b-t'` | Bottom of tooltip to top of target |
| `'l-r'` | Left of tooltip to right of target |
| `'r-l'` | Right of tooltip to left of target |

---

## Bronnen

- **Example**: `examples/tooltip/`
- **Tooltip**: `Core.widget.Tooltip`

---

*Priority 2: Medium Priority Features*
