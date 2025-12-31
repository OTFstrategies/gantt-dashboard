# Bryntum DomSync/DomHelper DOM Reconciliation Internals

## Overview

Bryntum's `DomSync` is a utility class for syncing declarative DOM config objects to DOM elements. It implements a virtual DOM-like reconciliation algorithm on a per-element basis, comparing new configurations with previously applied ones and only updating the differences.

**Key Principle**: Similar to React's virtual DOM, DomSync minimizes actual DOM operations by computing the minimal set of changes needed.

---

## 1. DomConfig Structure

The `DomConfig` type is a declarative specification for describing DOM elements:

```typescript
type DomConfig = Record<string, any> & {
    /**
     * Tag name (default: 'div'). Special value '#fragment' creates DocumentFragment.
     */
    tag?: string;

    /**
     * Parent element for insertion
     */
    parent?: HTMLElement;

    /**
     * Element's next sibling for positioning
     */
    nextSibling?: HTMLElement;

    /**
     * CSS classes - accepts string or truthy-keyed object
     * @example
     * class: 'foo bar'
     * class: { foo: true, bar: false, baz: condition }
     */
    class?: string | object;

    /**
     * Alias for `class`
     */
    className?: string | object;

    /**
     * Inline styles - string or object (keys auto-hyphenated)
     * @example
     * style: 'color: red; font-size: 14px'
     * style: { color: 'red', fontSize: '14px' }
     */
    style?: string | object;

    /**
     * Custom data stored as expando property on element (element.elementData)
     */
    elementData?: object;

    /**
     * Data attributes applied to element.dataset
     * @example { customId: '123' } becomes data-custom-id="123"
     */
    dataset?: object;

    /**
     * Child elements - array of DomConfigs, strings (text nodes), or HTMLElements.
     * Also accepts object map keyed by syncId (for DomSync only, not createElement).
     */
    children?: DomConfig[] | Record<string, DomConfig> | string[] | HTMLElement[];

    /**
     * Raw HTML (mutually exclusive with children/text)
     */
    html?: string;

    /**
     * Tooltip configuration
     */
    tooltip?: TooltipConfig | string;

    /**
     * Text content (XSS-safe, mutually exclusive with children/html)
     */
    text?: string;

    /**
     * Element id attribute
     */
    id?: string;

    /**
     * href attribute (for anchor elements)
     */
    href?: string;

    /**
     * XML namespace (for SVG elements)
     * @example 'http://www.w3.org/2000/svg'
     */
    ns?: string;

    /**
     * src attribute (for img, script elements)
     */
    src?: string;
};
```

### Extended DomConfig Properties (Used by DomSync)

```typescript
interface SyncableDomConfig extends DomConfig {
    /**
     * Unique identifier for element matching during reconciliation.
     * Maps to dataset entry specified by syncIdField option.
     */
    syncId?: string | number;

    /**
     * Reference name for accessing element via syncOptions.refOwner
     */
    reference?: string;

    /**
     * Callback invoked when element is synced
     */
    callback?: (element: HTMLElement, action: string) => void;

    /**
     * Retain element in DOM even when not in new config (pooling)
     */
    retainElement?: boolean;

    /**
     * Skip syncing this element and its children
     */
    skipSync?: boolean;
}
```

---

## 2. DomSync.sync() API

```typescript
class DomSync {
    static sync(options: {
        /**
         * The declarative DOM configuration
         */
        domConfig: DomConfig;

        /**
         * Target element to sync into
         */
        targetElement: HTMLElement;

        /**
         * When true, only sync values set by previous sync calls.
         * External modifications to DOM are preserved.
         */
        strict?: boolean;

        /**
         * Dataset field name used for element matching (default: 'syncId')
         */
        syncIdField?: string;

        /**
         * Unique identifier for caller isolation. Elements created
         * with different syncOwner values won't be reused across calls.
         */
        syncOwner?: string;

        /**
         * References affected by partial sync
         */
        affected?: string | string[];

        /**
         * Callback invoked for element creation/reuse/update events
         */
        callback?: (info: SyncCallbackInfo) => void;

        /**
         * Custom equality function for comparing configs
         */
        configEquality?: (is: any, was: any) => boolean;
    }): HTMLElement;
}
```

---

## 3. Reconciliation Algorithm

### Phase 1: Config Normalization

1. **Tag Resolution**: If no `tag` specified, defaults to `'div'`
2. **Fragment Detection**: `tag: '#fragment'` creates `DocumentFragment`
3. **Class Normalization**: String classes split into object form with truthy values
4. **Style Normalization**: String styles parsed into object form
5. **Children Normalization**: Object-keyed children converted to array with syncId

### Phase 2: Element Matching (Key-based Reconciliation)

The algorithm uses a **syncIdMap** stored on parent elements to track children:

```
parent.$bryntum.syncIdMap = {
    [syncId]: childElement,
    ...
}
```

**Matching Process:**

1. For each child in new config:
   - Extract `syncId` from config (explicit or from `dataset[syncIdField]`)
   - Look up existing element in parent's `syncIdMap`
   - If found: **Reuse** element
   - If not found: **Create** new element

2. **syncOwner Isolation**: When specified, elements are tagged with owner:
   ```
   element.$bryntum.syncOwner = 'myComponent'
   ```
   Only elements with matching owner are candidates for reuse.

### Phase 3: Diff Computation

For matched elements, DomSync compares old vs new configs:

```typescript
// Conceptual diff algorithm
function computeDiff(oldConfig: DomConfig, newConfig: DomConfig): Patch[] {
    const patches: Patch[] = [];

    // Compare each attribute type
    diffClasses(oldConfig.class, newConfig.class, patches);
    diffStyles(oldConfig.style, newConfig.style, patches);
    diffDataset(oldConfig.dataset, newConfig.dataset, patches);
    diffAttributes(oldConfig, newConfig, patches);
    diffChildren(oldConfig.children, newConfig.children, patches);

    return patches;
}
```

### Phase 4: Patch Application

**Patch Operations Generated:**

| Operation | Description |
|-----------|-------------|
| `ADD_ELEMENT` | Create new element |
| `REMOVE_ELEMENT` | Remove element from DOM |
| `MOVE_ELEMENT` | Reposition element in parent |
| `UPDATE_ATTRIBUTE` | Set/remove attribute |
| `UPDATE_CLASS` | Add/remove CSS class |
| `UPDATE_STYLE` | Set/remove style property |
| `UPDATE_DATASET` | Set/remove data attribute |
| `UPDATE_TEXT` | Update textContent |
| `UPDATE_HTML` | Update innerHTML |

---

## 4. Key-based Matching Details

### syncId Resolution

```javascript
// Priority order for syncId extraction:
function getSyncId(config, syncIdField) {
    // 1. Explicit syncId property
    if (config.syncId !== undefined) return config.syncId;

    // 2. Dataset field matching syncIdField
    if (config.dataset?.[syncIdField]) return config.dataset[syncIdField];

    // 3. For object-keyed children, the key itself
    // { myKey: { tag: 'div' } } => syncId = 'myKey'

    // 4. Array index as fallback (not recommended)
    return arrayIndex;
}
```

### syncIdMap Structure

```javascript
// Stored on element.$bryntum.syncIdMap
element.$bryntum = {
    syncIdMap: Map<string | number, HTMLElement>,
    lastDomConfig: DomConfig,  // For strict mode diffing
    syncOwner: string,         // Isolation owner
    syncId: string | number    // This element's syncId
};
```

### getChild() Path Resolution

```javascript
// Access nested elements via dot-separated path
DomSync.getChild(container, 'row.cell.content');
// Traverses: container -> syncIdMap['row'] -> syncIdMap['cell'] -> syncIdMap['content']
```

---

## 5. Attribute Handling

### Class Merging

```javascript
// Object form merges with toggle semantics
const oldClass = { foo: true, bar: true };
const newClass = { foo: true, bar: false, baz: true };

// Result: remove 'bar', add 'baz', keep 'foo'
```

**DomClassList Helper:**

```typescript
class DomClassList {
    // Set property to add class (truthy) or remove (falsy)
    [className: string]: boolean;

    add(...classes: string[]): void;
    remove(...classes: string[]): void;
    toggle(className: string, force?: boolean): boolean;
    contains(className: string): boolean;
    isEqual(other: DomClassList | string): boolean;
    assign(classList: object): void;
    assignTo(element: HTMLElement): void;

    // Convert to string for element.className
    toString(): string;
    trim(): string;
    split(): string[];
    clone(): DomClassList;
}
```

### Style Objects

```javascript
// Object keys are auto-hyphenated
const style = {
    fontSize: '14px',        // becomes font-size
    backgroundColor: 'red',  // becomes background-color
    '--custom-var': 'value'  // CSS variables work too
};
```

**Strict Mode Style Handling:**

When `strict: true`, only styles previously set by DomSync are managed:
- External style modifications are preserved
- Only DomSync-tracked properties are updated/removed

### Dataset Handling

```javascript
const dataset = {
    customId: '123',      // data-custom-id="123"
    syncId: 'myElement',  // data-sync-id="myElement" (used for matching)
    index: 5              // data-index="5"
};
```

---

## 6. Event Listener Management

DomSync does **not** directly manage event listeners. Instead:

1. **Widget System**: Bryntum widgets use the EventHelper system
2. **Delegation**: Events are typically delegated to container elements
3. **Listeners Config**: Use widget `listeners` config for event binding

For elements needing direct listeners, use `DomHelper.createElement()` with callback:

```javascript
DomHelper.createElement({
    tag: 'button',
    text: 'Click me',
    // Not directly supported - use Widget system instead
});
```

---

## 7. Text Node Handling

### textContent Optimization

When only text changes, DomSync updates `textContent` directly:

```javascript
// Optimized path - no child element manipulation
if (onlyTextChanged(oldConfig, newConfig)) {
    element.textContent = newConfig.text;
    return;
}
```

### Text vs HTML vs Children

| Property | Behavior | XSS Safety |
|----------|----------|------------|
| `text` | Sets `textContent` | Safe |
| `html` | Sets `innerHTML` | Unsafe - sanitize input |
| `children` | Creates child elements | N/A |

These are mutually exclusive - only one should be specified.

---

## 8. Fragment Support

### Creating Fragments

```javascript
DomSync.sync({
    domConfig: {
        tag: '#fragment',
        children: [
            { tag: 'div', text: 'First' },
            { tag: 'div', text: 'Second' }
        ]
    },
    targetElement: container
});
```

### Fragment Behavior

- Creates `DocumentFragment` instead of wrapper element
- Children are appended directly to target
- No wrapper element overhead
- syncIdMap still maintained on targetElement

---

## 9. SVG Element Support

### Namespace Handling

```javascript
const svgConfig = {
    tag: 'svg',
    ns: 'http://www.w3.org/2000/svg',
    children: [
        {
            tag: 'rect',
            ns: 'http://www.w3.org/2000/svg',
            width: 100,
            height: 100,
            fill: 'blue'
        },
        {
            tag: 'circle',
            ns: 'http://www.w3.org/2000/svg',
            cx: 50,
            cy: 50,
            r: 25,
            fill: 'red'
        }
    ]
};
```

### SVG-specific Notes

- Must specify `ns` for SVG elements
- Attributes are set via `setAttributeNS`
- Child elements inherit parent namespace if not specified

---

## 10. Reference Tracking

### Reference System

```javascript
DomSync.sync({
    domConfig: {
        class: 'container',
        children: [
            {
                reference: 'header',
                class: 'header',
                text: 'Title'
            },
            {
                reference: 'content',
                class: 'content'
            }
        ]
    },
    targetElement: container,
    callback: widget.domSyncCallback.bind(widget)
});
```

### Widget Integration

```javascript
class MyWidget extends Widget {
    domSyncCallback(info) {
        // info.action: 'created', 'reused', 'updated', 'removed'
        // info.element: The affected element
        // info.reference: Reference name if specified

        if (info.reference === 'header') {
            this._headerElement = info.element;
        }
    }
}
```

### attachRef / detachRef Lifecycle

```javascript
class Widget {
    // Called when reference element is created/attached
    attachRef(name, element) {
        this[name] = element;
    }

    // Called when reference element is removed
    detachRef(name, element) {
        this[name] = null;
    }
}
```

---

## 11. Performance Considerations

### Optimization Strategies

1. **Stable syncIds**: Use stable, unique IDs for better element reuse
2. **Avoid Array Index Keys**: Array index as syncId causes unnecessary recreation
3. **Minimal Config Changes**: Only change what's needed
4. **Fragment for Lists**: Use fragments to avoid wrapper overhead
5. **Strict Mode**: Enable for components with external DOM manipulation

### Config Equality Cache

```javascript
DomSync.sync({
    domConfig: config,
    targetElement: el,
    configEquality: (is, was) => {
        // Custom equality check for expensive comparisons
        return deepEqual(is, was);
    }
});
```

### Batch Updates

DomSync is synchronous - batch multiple updates yourself:

```javascript
// Collect changes
const changes = [];
records.forEach(r => changes.push(r.domConfig));

// Single sync call
DomSync.sync({
    domConfig: { children: changes },
    targetElement: container
});
```

---

## 12. DomHelper.createElement()

For one-time element creation without syncing:

```typescript
static createElement(
    config: DomConfig,
    options?: {
        ignoreRefs?: boolean;
        returnAll?: boolean;
    }
): HTMLElement | HTMLElement[] | Record<string, HTMLElement>;
```

### Return Modes

```javascript
// Single element (default)
const div = DomHelper.createElement({ tag: 'div' });

// All elements including children
const elements = DomHelper.createElement(config, { returnAll: true });

// Named references as object
const refs = DomHelper.createElement({
    children: [
        { reference: 'header', tag: 'header' },
        { reference: 'footer', tag: 'footer' }
    ]
}, { returnAll: true });
// refs = { header: <header>, footer: <footer> }
```

---

## 13. Algorithm Flowchart

```
DomSync.sync(options)
        |
        v
+------------------+
| Normalize Config |
+------------------+
        |
        v
+------------------+
| Get/Create       |
| syncIdMap        |
+------------------+
        |
        v
+------------------+
| For each child:  |
+------------------+
        |
        v
+------------------+
| Extract syncId   |-----> Lookup in syncIdMap
+------------------+
        |
   Found?
   /    \
  v      v
REUSE   CREATE
  |       |
  v       v
+------------------+
| Compute Diff     |
+------------------+
        |
        v
+------------------+
| Apply Patches    |
+------------------+
        |
        v
+------------------+
| Recurse for      |
| children         |
+------------------+
        |
        v
+------------------+
| Remove orphaned  |
| elements         |
+------------------+
        |
        v
+------------------+
| Invoke callback  |
+------------------+
        |
        v
     DONE
```

---

## 14. Usage Examples

### Basic Sync

```javascript
import { DomSync } from '@bryntum/gantt';

const container = document.getElementById('app');

DomSync.sync({
    domConfig: {
        class: 'my-app',
        children: [
            { class: 'header', text: 'Hello' },
            { class: 'content', html: '<p>World</p>' }
        ]
    },
    targetElement: container
});
```

### With Key-based Reconciliation

```javascript
const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
];

DomSync.sync({
    domConfig: {
        class: 'list',
        children: items.map(item => ({
            dataset: { syncId: item.id },
            class: 'item',
            text: item.name
        }))
    },
    targetElement: listContainer,
    syncIdField: 'syncId'
});
```

### With Callback

```javascript
DomSync.sync({
    domConfig: config,
    targetElement: container,
    callback: ({ action, element, syncId }) => {
        if (action === 'created') {
            console.log(`Created element with syncId: ${syncId}`);
        }
    }
});
```

---

## Summary

Bryntum's DomSync provides a declarative, efficient way to manage DOM updates:

- **Declarative**: Describe desired DOM state, not imperative mutations
- **Efficient**: Key-based reconciliation minimizes DOM operations
- **Flexible**: Supports classes, styles, datasets, SVG, fragments
- **Isolated**: syncOwner prevents cross-component interference
- **Trackable**: Reference system enables element access
- **Strict Mode**: Preserves external DOM modifications

The algorithm is similar to React's reconciliation but operates on a per-element basis without a full virtual DOM tree, making it lightweight while still providing efficient updates.
