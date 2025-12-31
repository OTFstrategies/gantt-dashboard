# Bryntum Popup and Overlay Positioning System Internals

A comprehensive deep-dive into how Bryntum positions floating widgets including Popups, Tooltips, Menus, Dialogs, and Combo dropdowns.

## Table of Contents

1. [Class Hierarchy](#class-hierarchy)
2. [AlignSpec Complete Reference](#alignspec-complete-reference)
3. [Positioning Algorithm](#positioning-algorithm)
4. [Flip Logic](#flip-logic)
5. [Anchor Arrow System](#anchor-arrow-system)
6. [Z-Index Stacking](#z-index-stacking)
7. [Constraint Box](#constraint-box)
8. [Show/Hide Animations](#showhide-animations)
9. [Focus Management](#focus-management)
10. [Specific Widget Patterns](#specific-widget-patterns)
11. [Common Usage Patterns](#common-usage-patterns)

---

## Class Hierarchy

```
Widget (floating: boolean)
  |-- Container
        |-- Panel
              |-- Popup (base floating container)
                    |-- Menu (context menus, dropdowns)
                    |-- Tooltip (hover information)
                    |-- TaskEditorBase (abstract)
                          |-- GanttTaskEditor
                                |-- TaskEditor
                          |-- SchedulerTaskEditor
                          |-- SchedulerProTaskEditor
              |-- PickerField (combo dropdowns)
                    |-- Combo
                    |-- DateField
                    |-- TimeField

Rectangle (geometric calculations)
  |-- Point (x, y coordinate)
```

**Key Files:**
- TypeScript definitions: `build/gantt.d.ts`
- Runtime implementation: `build/gantt.module.js`

---

## AlignSpec Complete Reference

The `AlignSpec` type is the core configuration object for positioning floating widgets.

### Full Type Definition

```typescript
type AlignSpec = {
    /**
     * The Widget, Element, Rectangle, or Event to align to.
     * Can be a DOM element, another widget, a Rectangle geometry object,
     * or a DOM event (uses clientX/clientY for point positioning).
     */
    target?: HTMLElement | Widget | Rectangle | Event;

    /**
     * The edge alignment specification string: `[trblc]n-[trblc]n`
     *
     * Format: `<source-edge><offset>-<target-edge><offset>`
     *
     * Edge codes:
     *   t = top
     *   r = right
     *   b = bottom
     *   l = left
     *   c = center
     *
     * Offset: 0-100 percentage along the edge (optional)
     *
     * Examples:
     *   'b-t'     - Bottom of widget to Top of target
     *   't-b'     - Top of widget to Bottom of target
     *   'l-r'     - Left of widget to Right of target
     *   'r-l'     - Right of widget to Left of target
     *   't0-b0'   - Top-left corner to Bottom-left corner
     *   't100-b100' - Top-right corner to Bottom-right corner
     *   'c-c'     - Center to center
     *   'r50-l50' - Right-center to Left-center
     *   'b0-t0'   - Menu alignment (top-left of popup below target)
     */
    align?: string;

    /**
     * Show a connector arrow pointing to the align target.
     * The arrow points from the popup towards the target element.
     * Defaults to false.
     */
    anchor?: boolean;

    /**
     * Allow this widget to overlap the target.
     * When false (default), positioning tries to place widget adjacent to target.
     * When true, widget may overlay the target.
     */
    overlap?: boolean;

    /**
     * A pointer event to position this Widget by.
     * Used for context menus - positions at event.clientX, event.clientY.
     */
    domEvent?: Event;

    /**
     * Arguments to Rectangle.inflate().
     * Expands/contracts the target rectangle before alignment calculation.
     * Number: inflate all edges by that many pixels
     * Array: [top, right, bottom, left] or [vertical, horizontal]
     */
    inflate?: number | number[];

    /**
     * Element, Widget, or Rectangle to constrain within.
     * The positioned widget will be adjusted to fit within this boundary.
     * Commonly set to document.body, window, or a parent container.
     */
    constrainTo?: HTMLElement | Widget | Rectangle;

    /**
     * Padding in pixels from the constrainTo boundary.
     * Number: uniform padding on all sides
     * Array: [top, right, bottom, left] in CSS order
     */
    constrainPadding?: number | number[];

    /**
     * Minimum height when constraining.
     * If widget must shrink to fit, it won't go below this height.
     */
    minHeight?: number;

    /**
     * Minimum width when constraining.
     * If widget must shrink to fit, it won't go below this width.
     */
    minWidth?: number;

    /**
     * Controls flip behavior when alignment cannot be achieved.
     *
     * true: Try opposite edge on same axis (e.g., b-t fails, try t-b)
     * 'flexible': Also try perpendicular axes (b-t -> t-b -> l-r -> r-l)
     * false: No automatic flipping
     */
    axisLock?: boolean | 'flexible';

    /**
     * Match the aligned-to edge length of the target.
     * Only honored when axisLock is enabled and alignment succeeds.
     *
     * true: Match exactly
     * 'min': Use as minimum size (widget can be larger)
     */
    matchSize?: boolean | 'min';

    /**
     * Position offset from the target.
     * Number: Apply to both X and Y
     * Array: [x, y] offsets
     *
     * Positive values move away from target.
     * Negative values move towards target (anchor piercing effect).
     */
    offset?: number | number[];

    /**
     * Monitor the target element for resizing.
     * When true, realigns if target size changes while visible.
     */
    monitorResize?: boolean;
};
```

### AlignResult Type

Returned from `Rectangle.alignTo()` with positioning results:

```typescript
type AlignResult = Rectangle & {
    /**
     * Anchor point information for arrow positioning.
     */
    anchor: {
        x?: number;      // X coordinate of anchor point
        y?: number;      // Y coordinate of anchor point
        edge: 'top' | 'right' | 'bottom' | 'left';  // Which edge anchor points from
    };

    /**
     * The final alignment string used after constraint/flip was applied.
     * May differ from requested align if flipping occurred.
     */
    align: string;

    /**
     * The zone number result was aligned into.
     * 0 = top, 1 = right, 2 = bottom, 3 = left
     */
    zone: number;

    /**
     * The Rectangle the result was constrained into.
     */
    constraint: Rectangle;
};
```

---

## Positioning Algorithm

The positioning system follows this sequence:

### Step 1: Target Resolution

```typescript
// Target can be various types
let targetRect: Rectangle;

if (spec.target instanceof Rectangle) {
    targetRect = spec.target;
} else if (spec.target instanceof Widget) {
    targetRect = Rectangle.from(spec.target.element);
} else if (spec.target instanceof HTMLElement) {
    targetRect = Rectangle.from(spec.target);
} else if (spec.domEvent) {
    // Point-based positioning from event
    targetRect = new Rectangle(spec.domEvent.clientX, spec.domEvent.clientY, 0, 0);
}

// Apply inflation if specified
if (spec.inflate) {
    targetRect = targetRect.inflate(...spec.inflate);
}
```

### Step 2: Parse Alignment String

```typescript
// Parse alignment specification: '[trblc]n-[trblc]n'
function parseAlign(align: string) {
    const match = align.match(/^([trblc])(\d+)?-([trblc])(\d+)?$/);

    return {
        myEdge: match[1],        // Source widget edge
        myOffset: match[2] || 0, // Percentage along source edge
        atEdge: match[3],        // Target edge
        atOffset: match[4] || 0  // Percentage along target edge
    };
}
```

### Step 3: Calculate Initial Position

```typescript
function calculatePosition(myRect: Rectangle, targetRect: Rectangle, align: ParsedAlign) {
    let x, y;

    // Calculate target point
    const targetPoint = getEdgePoint(targetRect, align.atEdge, align.atOffset);

    // Calculate where source edge should go
    switch (align.myEdge) {
        case 't':  // My top aligns to target point
            y = targetPoint.y;
            break;
        case 'b':  // My bottom aligns to target point
            y = targetPoint.y - myRect.height;
            break;
        case 'l':  // My left aligns to target point
            x = targetPoint.x;
            break;
        case 'r':  // My right aligns to target point
            x = targetPoint.x - myRect.width;
            break;
        case 'c':  // My center aligns to target point
            x = targetPoint.x - myRect.width / 2;
            y = targetPoint.y - myRect.height / 2;
            break;
    }

    return new Rectangle(x, y, myRect.width, myRect.height);
}
```

### Step 4: Rectangle Methods

The `Rectangle` class provides key positioning operations:

```typescript
class Rectangle {
    // Properties
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;    // Alias for y
    left: number;   // Alias for x
    right: number;  // x + width
    bottom: number; // y + height
    center: Point;

    // Static factory methods
    static from(element: HTMLElement, relativeTo?: HTMLElement, ignorePageScroll?: boolean): Rectangle;
    static fromScreen(element: HTMLElement, relativeTo?: HTMLElement): Rectangle;
    static client(element: HTMLElement, relativeTo?: HTMLElement): Rectangle;
    static content(element: HTMLElement, relativeTo?: HTMLElement): Rectangle;
    static inner(element: HTMLElement, relativeTo?: HTMLElement): Rectangle;
    static union(...rectangles: Rectangle[]): Rectangle;

    // Instance methods
    clone(): Rectangle;
    moveTo(x: number, y: number): Rectangle;
    translate(x: number, y: number): Rectangle;
    adjust(x: number, y: number, width: number, height: number): Rectangle;

    // Alignment
    alignTo(spec: AlignSpec): AlignResult;

    // Constraint
    constrainTo(constrainTo: Rectangle, strict?: boolean): Rectangle | boolean;

    // Geometry tests
    contains(other: Rectangle): boolean;
    intersect(other: Rectangle, useBoolean?: boolean): Rectangle | boolean;
    exclude(...other: Rectangle[]): Rectangle;

    // Display
    highlight(): void;
    roundPx(devicePixelRatio?: number): void;
}
```

---

## Flip Logic

When the initial alignment doesn't fit within constraints, the system attempts to flip:

### Flip Sequence

```typescript
// Zone indices: 0=top, 1=right, 2=bottom, 3=left
const FLIP_POSITIONS = [
    ['b-t', 't-b'],  // Vertical: below -> above
    ['l-r', 'r-l'],  // Horizontal: right -> left
    ['t-b', 'b-t'],  // Vertical: above -> below
    ['r-l', 'l-r']   // Horizontal: left -> right
];

function findBestAlignment(myRect, targetRect, constrainRect, requestedAlign, axisLock) {
    // Try requested alignment first
    let result = tryAlign(myRect, targetRect, requestedAlign, constrainRect);

    if (fitsConstraint(result, constrainRect)) {
        return result;
    }

    // Determine primary axis
    const isVertical = requestedAlign.startsWith('t') || requestedAlign.startsWith('b');

    if (axisLock === true) {
        // Only try opposite edge on same axis
        const opposite = isVertical ? flipVertical(requestedAlign) : flipHorizontal(requestedAlign);
        result = tryAlign(myRect, targetRect, opposite, constrainRect);
        if (fitsConstraint(result, constrainRect)) {
            return result;
        }
    } else if (axisLock === 'flexible') {
        // Try all four positions, pick best fit
        const candidates = [];

        for (const [primary, secondary] of FLIP_POSITIONS) {
            const aligned = tryAlign(myRect, targetRect, primary, constrainRect);
            candidates.push({
                result: aligned,
                overflow: calculateOverflow(aligned, constrainRect)
            });
        }

        // Sort by smallest overflow and pick best
        candidates.sort((a, b) => a.overflow - b.overflow);
        return candidates[0].result;
    }

    // Fall back to constrained version of original
    return result.constrainTo(constrainRect);
}
```

### Calculating Overflow

```typescript
function calculateOverflow(rect: Rectangle, constraint: Rectangle): number {
    let overflow = 0;

    if (rect.top < constraint.top) {
        overflow += constraint.top - rect.top;
    }
    if (rect.bottom > constraint.bottom) {
        overflow += rect.bottom - constraint.bottom;
    }
    if (rect.left < constraint.left) {
        overflow += constraint.left - rect.left;
    }
    if (rect.right > constraint.right) {
        overflow += rect.right - constraint.right;
    }

    return overflow;
}
```

---

## Anchor Arrow System

The anchor arrow connects the floating widget to its target.

### Anchor Size

```typescript
// Widget.anchorSize returns [width, height] of anchor arrow
// Typically extracted from CSS custom properties or computed styles
get anchorSize(): number[] {
    // Default values, can be overridden by CSS
    return [16, 8];  // [width, height]
}
```

### Anchor Positioning Algorithm

```typescript
function positionAnchor(alignResult: AlignResult, anchorElement: HTMLElement) {
    const { anchor, zone } = alignResult;

    if (!anchor) return;

    // Determine rotation based on zone
    const rotations = {
        0: 180,  // Pointing up (popup below target)
        1: 270,  // Pointing left (popup right of target)
        2: 0,    // Pointing down (popup above target)
        3: 90    // Pointing right (popup left of target)
    };

    const rotation = rotations[zone];

    // Position anchor element
    anchorElement.style.transform = `rotate(${rotation}deg)`;

    // Calculate position along the edge
    if (zone === 0 || zone === 2) {
        // Horizontal edge - position by x
        anchorElement.style.left = `${anchor.x}px`;
        anchorElement.style.top = zone === 0 ? '100%' : '0';
    } else {
        // Vertical edge - position by y
        anchorElement.style.top = `${anchor.y}px`;
        anchorElement.style.left = zone === 1 ? '0' : '100%';
    }
}
```

### CSS Classes for Anchor

```css
/* Anchor arrow element structure */
.b-popup.b-anchored::before {
    content: '';
    position: absolute;
    /* Triangle using borders or SVG */
}

/* Zone-specific anchor positioning */
.b-popup.b-anchor-top::before    { /* Arrow points up */ }
.b-popup.b-anchor-right::before  { /* Arrow points right */ }
.b-popup.b-anchor-bottom::before { /* Arrow points down */ }
.b-popup.b-anchor-left::before   { /* Arrow points left */ }
```

---

## Z-Index Stacking

Floating widgets maintain a stacking order for proper layering.

### Stack Management

```typescript
class Widget {
    // Static tracking of all floating widgets
    static floatingWidgets: Set<Widget> = new Set();
    static topZIndex: number = 10000;

    /**
     * Brings this floating widget to the front of the visual stack.
     */
    toFront(): void {
        if (this.floating) {
            Widget.topZIndex++;
            this.element.style.zIndex = String(Widget.topZIndex);
        }
    }

    // Called when showing a floating widget
    onShow() {
        if (this.floating) {
            Widget.floatingWidgets.add(this);
            this.toFront();
        }
    }

    // Called when hiding
    onHide() {
        if (this.floating) {
            Widget.floatingWidgets.delete(this);
        }
    }
}
```

### Z-Index Ranges (Typical)

```typescript
const Z_INDEX_LAYERS = {
    // Base layer for positioned widgets
    floating: 10000,

    // Menus above popups
    menu: 10100,

    // Tooltips above menus
    tooltip: 10200,

    // Modal mask behind modal content
    modalMask: 10300,

    // Modal content on top
    modal: 10400,

    // Message dialogs highest
    messageDialog: 10500
};
```

### Modal Stacking

```typescript
// Modal configuration
type ModalConfig = {
    closeOnMaskTap?: boolean;  // Close when clicking mask
    transparent?: boolean;      // Invisible mask
};

// Modal creates a mask element
class Popup {
    showModal() {
        // Create/show mask
        this.mask = new Mask({
            cls: 'b-modal-mask',
            transparent: this.modal.transparent
        });

        // Mask goes just below popup
        this.mask.element.style.zIndex = String(this.zIndex - 1);

        // Add to document
        document.body.appendChild(this.mask.element);
    }
}
```

---

## Constraint Box

The constraint system keeps popups within visible boundaries.

### Constraint Resolution

```typescript
function resolveConstraint(constrainTo: HTMLElement | Widget | Rectangle): Rectangle {
    if (constrainTo instanceof Rectangle) {
        return constrainTo;
    }

    if (constrainTo instanceof Widget) {
        return Rectangle.from(constrainTo.element);
    }

    if (constrainTo === window || constrainTo === document.body) {
        // Viewport constraint
        return new Rectangle(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );
    }

    return Rectangle.from(constrainTo);
}
```

### Constraint with Padding

```typescript
function applyConstraintPadding(constraint: Rectangle, padding: number | number[]): Rectangle {
    const p = Array.isArray(padding)
        ? padding
        : [padding, padding, padding, padding];

    return constraint.adjust(
        p[3],        // Left inset
        p[0],        // Top inset
        -(p[1] + p[3]), // Width reduction (right + left)
        -(p[0] + p[2])  // Height reduction (top + bottom)
    );
}
```

### Rectangle.constrainTo Method

```typescript
class Rectangle {
    /**
     * Constrains this rectangle to fit within another.
     * @param constrainTo The bounding rectangle
     * @param strict If true, returns false if cannot fit; otherwise translates
     */
    constrainTo(constrainTo: Rectangle, strict: boolean = false): Rectangle | boolean {
        let { x, y, width, height } = this;

        // Check if we can fit at all
        if (strict) {
            if (width > constrainTo.width || height > constrainTo.height) {
                return false;
            }
        }

        // Shrink if necessary
        width = Math.min(width, constrainTo.width);
        height = Math.min(height, constrainTo.height);

        // Translate to fit
        if (x < constrainTo.left) {
            x = constrainTo.left;
        } else if (x + width > constrainTo.right) {
            x = constrainTo.right - width;
        }

        if (y < constrainTo.top) {
            y = constrainTo.top;
        } else if (y + height > constrainTo.bottom) {
            y = constrainTo.bottom - height;
        }

        return new Rectangle(x, y, width, height);
    }
}
```

---

## Show/Hide Animations

### Animation Configuration

```typescript
// Widget animation configs
type AnimationConfig = {
    // CSS animation/transition properties
    duration?: number;     // Milliseconds
    easing?: string;       // CSS easing function

    // Or boolean to use defaults
} | boolean;

// PopupConfig
interface PopupConfig {
    /**
     * Animation when showing the popup.
     * true: Use default fade/slide animation
     * false: No animation
     * object: Custom animation config
     */
    showAnimation?: AnimationConfig;

    /**
     * Animation when hiding the popup.
     */
    hideAnimation?: AnimationConfig;
}
```

### Default Animations

```typescript
// Default show animation (fade in + slide up)
const DEFAULT_SHOW_ANIMATION = {
    opacity: { from: 0, to: 1 },
    transform: { from: 'translateY(10px)', to: 'translateY(0)' },
    duration: 200,
    easing: 'ease-out'
};

// Default hide animation (fade out + slide down)
const DEFAULT_HIDE_ANIMATION = {
    opacity: { from: 1, to: 0 },
    transform: { from: 'translateY(0)', to: 'translateY(10px)' },
    duration: 150,
    easing: 'ease-in'
};
```

### Animation Implementation

```typescript
class Popup {
    async show(options?: { animate?: boolean }) {
        const animate = options?.animate ?? this.showAnimation;

        if (animate) {
            // Set initial state
            this.element.style.opacity = '0';

            // Trigger reflow
            this.element.offsetHeight;

            // Apply animation
            await this.animateTo(this.showAnimation);
        }

        this.element.classList.add('b-visible');
        this.trigger('show');
    }

    async hide(animate?: boolean) {
        animate = animate ?? this.hideAnimation;

        if (animate) {
            await this.animateTo(this.hideAnimation);
        }

        this.element.classList.remove('b-visible');
        this.trigger('hide');
    }

    private animateTo(config: AnimationConfig): Promise<void> {
        return new Promise(resolve => {
            const animation = this.element.animate(
                this.buildKeyframes(config),
                {
                    duration: config.duration || 200,
                    easing: config.easing || 'ease-out',
                    fill: 'forwards'
                }
            );

            animation.onfinish = () => resolve();
        });
    }
}
```

### Scroll Action

```typescript
// What happens when document scrolls while popup is visible
type ScrollAction = 'hide' | 'realign' | null;

interface PopupConfig {
    /**
     * Behavior when document scrolls while popup is visible.
     * 'hide': Hide the popup
     * 'realign': Recalculate position relative to target
     * null: Do nothing
     */
    scrollAction?: ScrollAction;
}

// Implementation
class Popup {
    onDocumentScroll() {
        switch (this.scrollAction) {
            case 'hide':
                this.hide();
                break;
            case 'realign':
                if (this.lastAlignSpec) {
                    this.alignTo(this.lastAlignSpec);
                }
                break;
            // null: do nothing
        }
    }
}
```

---

## Focus Management

### Focus Trapping

```typescript
// Panel/Popup focus configuration
interface PopupConfig {
    /**
     * Trap focus within this popup.
     * When true, Tab key cycles through focusable elements inside,
     * never leaving the popup.
     */
    trapFocus?: boolean;  // Defaults to true for Popup
}
```

### Focus Trap Implementation

```typescript
class Panel {
    setupFocusTrap() {
        if (!this.trapFocus) return;

        this.element.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const focusables = this.getFocusableElements();
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey) {
                // Shift+Tab: going backwards
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                // Tab: going forwards
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    getFocusableElements(): HTMLElement[] {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');

        return Array.from(this.element.querySelectorAll(selector));
    }
}
```

### Default Focus

```typescript
interface ContainerConfig {
    /**
     * Query selector function to find the default focus target.
     * Called when popup opens to determine initial focus.
     */
    defaultFocus?: ((widget: Widget) => boolean) | string;
}

class Container {
    focusDefault() {
        let target: Widget;

        if (typeof this.defaultFocus === 'function') {
            target = this.query(this.defaultFocus);
        } else if (typeof this.defaultFocus === 'string') {
            target = this.widgetMap[this.defaultFocus];
        }

        if (target?.focusElement) {
            target.focusElement.focus();
        }
    }
}
```

### Focus Restoration

```typescript
class Popup {
    private previousFocus: HTMLElement;

    onBeforeShow() {
        // Remember what had focus
        this.previousFocus = document.activeElement as HTMLElement;
    }

    onShow() {
        // Focus the popup's default focus target
        this.focusDefault();
    }

    onHide() {
        // Restore previous focus
        if (this.previousFocus && document.contains(this.previousFocus)) {
            this.previousFocus.focus();
        }
    }
}
```

---

## Specific Widget Patterns

### Tooltip Configuration

```typescript
type TooltipConfig = PopupConfig & {
    /**
     * Element to monitor for hover events.
     */
    forElement?: HTMLElement;

    /**
     * CSS selector for child elements that trigger tooltip.
     */
    forSelector?: string;

    /**
     * Delay in ms before showing after hover starts.
     */
    hoverDelay?: number;  // Default: 500

    /**
     * Delay in ms before hiding after hover ends.
     */
    hideDelay?: number;   // Default: 200

    /**
     * Auto-hide after showing, regardless of mouse position.
     */
    dismissDelay?: number;

    /**
     * Hide when mouse leaves the target element.
     */
    autoHide?: boolean;   // Default: true

    /**
     * Keep tooltip open when mouse hovers over the tooltip itself.
     */
    allowOver?: boolean;  // Default: false

    /**
     * Anchor tooltip to target (vs follow mouse).
     * When false, tooltip follows mouse movement.
     */
    anchorToTarget?: boolean;  // Default: true

    /**
     * Dynamic HTML content generator.
     */
    getHtml?: (context: {
        tip: Tooltip;
        element: HTMLElement;
        activeTarget: HTMLElement;
        event: Event;
    }) => string | Promise<string>;

    /**
     * Loading message shown during async getHtml.
     */
    loadingMsg?: string;
};
```

### Tooltip Mouse Following

```typescript
class Tooltip {
    onMouseMove(event: MouseEvent) {
        if (this.anchorToTarget) {
            // Stay anchored to original target element
            return;
        }

        // Follow mouse
        this.showBy({
            target: new Point(event.clientX, event.clientY),
            align: 't0-b0',
            offset: [10, 10]  // Offset from cursor
        });
    }
}
```

### Menu System

```typescript
type MenuConfig = PopupConfig & {
    /**
     * Focus menu items on hover (vs requiring click).
     */
    focusOnHover?: boolean;  // Default: true

    /**
     * Menu items
     */
    items?: (MenuItemConfig | '-')[];  // '-' creates separator
};

type MenuItemConfig = {
    text?: string;
    icon?: string;
    cls?: string;
    disabled?: boolean;

    /**
     * Make this a checkable item.
     */
    checked?: boolean;
    toggleable?: boolean;

    /**
     * Radio group - only one in group can be checked.
     */
    toggleGroup?: string;

    /**
     * Submenu configuration.
     */
    menu?: MenuConfig | MenuItemConfig[];

    /**
     * Click handler.
     */
    onItem?: (event: MenuItemEvent) => void;
};
```

### Combo Dropdown

```typescript
// Combo uses PickerField which manages dropdown alignment
class PickerField {
    /**
     * The picker (dropdown) widget.
     */
    picker: Widget;

    /**
     * Default alignment: dropdown below input field.
     */
    pickerAlignElement: string = 'inputWrap';

    /**
     * Show the dropdown aligned to the input.
     */
    showPicker() {
        this.picker.showBy({
            target: this[this.pickerAlignElement],
            align: 't0-b0',  // Top of picker to bottom of input
            axisLock: true,  // Allow flip to t-b (above input)
            anchor: false,
            matchSize: true, // Match input width
            constrainTo: window
        });
    }
}
```

### TaskEditor Positioning

```typescript
// TaskEditor is a Popup subclass
class TaskEditor extends Popup {
    static configurable = {
        // Default to modal centered display
        modal: true,
        centered: true,

        // Can also be positioned by task element
        // centered: false,
        // align: {
        //     align: 'l-r',
        //     constrainTo: window
        // }
    };

    /**
     * Show editor for a task.
     */
    async editTask(taskRecord: TaskModel, element?: HTMLElement) {
        this.loadRecord(taskRecord);

        if (element && !this.centered) {
            // Position relative to task bar
            await this.showBy({
                target: element,
                align: 'l-r',
                offset: [10, 0],
                constrainTo: window
            });
        } else {
            // Centered modal
            await this.show();
        }
    }
}
```

### Context Menu (TaskMenu)

```typescript
class TaskMenu extends Menu {
    /**
     * Show context menu at event position.
     */
    showContextMenu(event: MouseEvent, taskRecord: TaskModel) {
        event.preventDefault();

        // Store context
        this.taskRecord = taskRecord;

        // Position at click
        this.showBy({
            target: new Point(event.clientX, event.clientY),
            align: 't0-b0',  // Top-left of menu at click point
            constrainTo: window,
            axisLock: 'flexible'
        });
    }
}
```

---

## Common Usage Patterns

### Basic Popup Positioning

```typescript
// Below a button
popup.showBy({
    target: button.element,
    align: 't-b',  // Top of popup to bottom of button
    anchor: true
});

// Above a button
popup.showBy({
    target: button.element,
    align: 'b-t',  // Bottom of popup to top of button
    anchor: true
});

// Right of element
popup.showBy({
    target: element,
    align: 'l-r',  // Left of popup to right of element
    offset: [5, 0]
});

// Centered in viewport
popup.showBy({
    target: document.body,
    align: 'c-c'
});
```

### Context Menu at Click

```typescript
element.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    menu.showBy({
        target: new Point(event.clientX, event.clientY),
        align: 't0-b0',
        constrainTo: window,
        axisLock: 'flexible'
    });
});
```

### Tooltip with Dynamic Content

```typescript
const tooltip = new Tooltip({
    forElement: gantt.element,
    forSelector: '.b-gantt-task',
    hoverDelay: 300,
    hideDelay: 100,

    async getHtml({ activeTarget, tip }) {
        const taskId = activeTarget.dataset.taskId;

        // Show loading state
        tip.showAsyncMessage('Loading...');

        // Fetch data
        const details = await fetchTaskDetails(taskId);

        return `
            <div class="task-tooltip">
                <h4>${details.name}</h4>
                <p>Duration: ${details.duration}</p>
            </div>
        `;
    }
});
```

### Modal Dialog

```typescript
const dialog = new Popup({
    title: 'Confirm Delete',
    modal: {
        closeOnMaskTap: true
    },
    centered: true,
    closable: true,
    trapFocus: true,

    items: [
        { html: 'Are you sure you want to delete this task?' }
    ],

    bbar: [
        {
            type: 'button',
            text: 'Delete',
            cls: 'b-red',
            onClick: async () => {
                await performDelete();
                dialog.close();
            }
        },
        {
            type: 'button',
            text: 'Cancel',
            onClick: () => dialog.close()
        }
    ]
});

dialog.show();
```

### Constrained Popup

```typescript
// Constrain to parent container
popup.showBy({
    target: targetElement,
    align: 'b-t',
    constrainTo: containerElement,
    constrainPadding: 10,
    minWidth: 200,
    minHeight: 100,
    axisLock: 'flexible'
});
```

### Match Target Size

```typescript
// Dropdown matching input width
dropdown.showBy({
    target: inputElement,
    align: 't0-b0',
    matchSize: true,     // Match width
    axisLock: true       // Only flip vertically
});
```

---

## Key CSS Classes

```css
/* Floating state */
.b-floating { position: absolute; }

/* Visible state */
.b-visible { visibility: visible; }
.b-hidden { visibility: hidden; }

/* Modal mask */
.b-modal-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
}

/* Anchor arrow */
.b-popup.b-anchored::before {
    /* Triangle/arrow implementation */
}

/* Alignment zones */
.b-aligned-top { }
.b-aligned-right { }
.b-aligned-bottom { }
.b-aligned-left { }

/* Animation states */
.b-animating { pointer-events: none; }
```

---

## Summary

The Bryntum positioning system provides:

1. **AlignSpec**: Comprehensive alignment specification with edge-based positioning
2. **Rectangle.alignTo**: Core algorithm that calculates positions with constraint/flip support
3. **Flip Logic**: Automatic repositioning when primary alignment doesn't fit
4. **Anchor System**: Visual connection arrows between popup and target
5. **Z-Index Management**: Automatic stacking order for overlapping widgets
6. **Constraint Box**: Boundary enforcement with padding and min dimensions
7. **Animations**: Configurable show/hide transitions
8. **Focus Management**: Trapping, default focus, and restoration

This system enables consistent positioning behavior across all floating widgets: Popup, Menu, Tooltip, Dialog, Combo dropdowns, and TaskEditor.
