# Bryntum Store Class - Internal Implementation Analysis

## Overview

The Bryntum `Store` class is a sophisticated data management layer that provides collection management, indexing, filtering, sorting, grouping, tree structure support, and reactive data binding. It is built using a mixin architecture where different functionalities are composed together.

**File Location**: `build/gantt.module.js` (bundled), TypeScript definitions in `build/gantt.d.ts`

## Architecture

The Store class uses a mixin-based architecture combining multiple specialized classes:

```
Store extends Base
  + StoreCRUD       - Add, remove, modify records, commit/revert changes
  + StoreChained    - Create filtered/sorted views (chained stores)
  + StoreChanges    - Track and apply changesets
  + StoreFilter     - Filtering with CollectionFilter
  + StoreGroup      - Grouping with Grouper objects
  + StorePaging     - Remote pagination support
  + StoreRelation   - Foreign key relationships
  + StoreSearch     - Search/find functionality
  + StoreSort       - Sorting with CollectionSorter
  + StoreSparseIndex - Sparse index for reordering
  + StoreState      - State persistence
  + StoreSum        - Aggregation functions
  + StoreSync       - Synchronization
  + StoreTree       - Tree structure support
  + StoreStm        - State Transaction Manager integration
```

---

## 1. Indexing System

### Primary Index: `idMap`

The Store maintains an `idMap` for O(1) record lookups by ID:

```javascript
// Internal structure (conceptual)
Store {
    idMap: Map<id, { index: number, record: Model }>
}
```

**Key Operations:**

| Operation | Method | Complexity |
|-----------|--------|------------|
| Get by ID | `getById(id)` | O(1) |
| Get by index | `getAt(index)` | O(1) |
| Find index of record | `indexOf(record)` | O(1) |
| Change record ID | Triggers `idChange` event, updates `idMap` | O(1) |

**Update Triggers:**
- Adding records (`add`, `insert`, `appendChild`)
- Removing records (`remove`, `removeChild`)
- ID changes on any record
- Filtering/sorting (updates visible indices)

### Collection-Based Storage

Records are stored in a `Collection` instance (`storage` config):

```typescript
// Collection provides:
interface Collection {
    values: object[];           // Current filtered/sorted records
    allValues: object[];        // All records ignoring filters
    idProperty: string;         // Field used as ID (default: 'id')
    filters: Collection;        // Nested Collection of CollectionFilter
    sorters: Collection;        // Nested Collection of CollectionSorter
    generation: number;         // Incremented on each mutation
}
```

### Multiple Index Support

The Store supports secondary indices through the Collection's `findItem` and `getBy` methods:

```javascript
// Find by any property
store.getBy('propertyName', value);
store.findItem('propertyName', value);
```

---

## 2. Filtering Algorithm

### Filter Chain Architecture

Filters are stored in a `Collection` of `CollectionFilter` instances:

```typescript
interface CollectionFilterConfig {
    id?: string;                          // Filter identifier
    property?: string;                    // Field to filter on
    value?: any;                          // Value to compare
    operator?: CollectionCompareOperator; // Comparison operator
    filterBy?: (data: any) => boolean;   // Custom function
    caseSensitive?: boolean;              // String comparison mode
    disabled?: boolean;                   // Temporarily disable
    internal?: boolean;                   // Protected from clearFilters()
    children?: CollectionFilter[];        // Nested filters (AND/OR logic)
}
```

### Supported Operators

```typescript
type CollectionCompareOperator =
    | '='  | '!='  | '>'  | '>='  | '<'  | '<='
    | '*'  | 'includes' | 'doesNotInclude'
    | 'startsWith' | 'endsWith'
    | 'isIncludedIn' | 'isNotIncludedIn'
    | 'between' | 'notBetween'
    | 'empty' | 'notEmpty'
    | 'sameDay' | 'sameDayOrBefore' | 'sameDayOrAfter';
```

### Filter Processing Flow

```
1. addFilter(filterConfig)
   |
2. Create CollectionFilter instance
   |
3. Add to filters Collection
   |
4. Generate combined filter function
   |   CollectionFilter.generateFiltersFunction(filters)
   |   - Combines all active filters
   |   - Respects AND/OR with children
   |
5. Apply to Collection.values
   |
6. Trigger 'filter' event
   |
7. Update visible indices in idMap
```

### Filter API

```javascript
// Add single filter
await store.addFilter({ property: 'status', value: 'active' });

// Add multiple filters
await store.filter([
    { property: 'name', operator: 'startsWith', value: 'A' },
    { property: 'age', operator: '>=', value: 18 }
]);

// Filter with function
await store.filterBy(record => record.isValid);

// Remove specific filter
await store.removeFilter('filterId');

// Clear all (respects internal flag)
await store.clearFilters();
```

**Important**: Filters flagged as `internal: true` are NOT removed by `clearFilters()`.

---

## 3. Sorting Implementation

### Sorter Structure

```typescript
interface CollectionSorterConfig {
    id?: string;                    // Sorter identifier
    property?: string;              // Field to sort by
    direction?: 'ASC' | 'DESC';     // Sort direction
    sortFn?: (a, b, dir) => number; // Custom comparator
    convert?: (value) => any;       // Value transformer
    caseSensitive?: boolean;        // String comparison
    useLocaleSort?: boolean | string | object; // Locale-aware sorting
}
```

### Multi-Column Sort

The Store supports multi-level sorting through an array of sorters:

```javascript
store.sort([
    { field: 'department', ascending: true },
    { field: 'salary', ascending: false },
    { field: 'name', ascending: true }
]);
```

### Sort Function Generation

```javascript
// Internal: createSorterFn(sorters) generates:
function combinedSort(a, b) {
    for (const sorter of sorters) {
        const result = sorter.compare(a, b);
        if (result !== 0) return result;
    }
    return 0;
}
```

### Sorting Features

- **Locale-aware sorting**: `useLocaleSort` config uses `localeCompare()`
- **Value conversion**: `convert` function pre-processes values before comparison
- **Reapply on update**: `reapplySortersOnUpdate` config re-sorts when data changes

```javascript
// Reapply sort only for specific fields
store.reapplySortersOnUpdate = { fields: ['priority', 'dueDate'] };
```

---

## 4. Grouping Logic

### Grouper Structure

```typescript
interface Grouper {
    field: string;          // Field to group by
    ascending?: boolean;    // Group order
    fn?: Function;          // Custom grouping function
}
```

### Group Record Model

When grouping is active, the Store inserts special "group header" records:

```javascript
// Group header records have:
{
    isGroupHeader: true,
    groupRowFor: 'groupFieldValue',
    groupChildren: Model[],     // Records in this group
    meta: {
        collapsed: boolean      // Collapse state
    }
}
```

### Grouping Internals

```
1. store.group('department')
   |
2. Sort records by group field
   |
3. Iterate sorted records, detect group boundaries
   |
4. Insert group header records
   |
5. Track group children in groupHeaderRecords[]
   |
6. Trigger 'group' event
```

### Nested Groups

Multi-level grouping creates hierarchical structure:

```javascript
store.group('region', true, false);      // First level
store.group('department', true, true);   // Add second level
```

### Group API

```javascript
store.groupers;                           // Current groupers array
store.isGrouped;                          // Boolean flag
store.groupHeaderRecords;                 // All group header records
store.getGroupRecords(groupValue);        // Records in specific group
store.getGroupTitles();                   // All group titles
store.isRecordInGroup(record, groupValue); // Check membership
store.clearGroupers();                    // Remove all grouping
```

---

## 5. Tree Traversal

### TreeNode Mixin

Tree functionality is provided by the `TreeNode` mixin applied to `Model`:

```typescript
interface TreeNodeClass {
    // Navigation
    parent: Model;
    children: Model[];
    firstChild: Model;
    lastChild: Model;
    previousSibling: Model;
    nextSibling: Model;

    // Properties
    childLevel: number;       // Depth in tree (0-based)
    isLeaf: boolean;
    isParent: boolean;
    isRoot: boolean;

    // Counts
    descendantCount: number;  // All descendants
    visibleDescendantCount: number;
}
```

### Traversal Methods

#### `traverse(fn, skipSelf?, options?)`
Depth-first, pre-order traversal (parent before children):

```javascript
node.traverse(record => {
    console.log(record.name);
}, false, { includeFilteredOutRecords: true });
```

#### `traverseBefore(fn, skipSelf?, options?)`
Depth-first, post-order traversal (children before parent):

```javascript
// Calculate totals bottom-up
node.traverseBefore(record => {
    record.total = record.children?.reduce((sum, c) => sum + c.total, 0) || record.value;
});
```

#### `traverseWhile(fn, skipSelf?, options?)`
Traversal that stops when function returns false:

```javascript
// Find first matching node
let found = null;
node.traverseWhile(record => {
    if (record.isMatch) {
        found = record;
        return false; // Stop traversal
    }
    return true;
});
```

#### `bubble(fn, skipSelf?)`
Traverse up from node to root:

```javascript
record.bubble(ancestor => {
    ancestor.dirty = true;
});
```

#### `bubbleWhile(fn, skipSelf?)`
Bubble up while function returns true.

### Flatten Algorithms

```javascript
// Get all children recursively (excluding filtered)
node.allChildren;

// Get all children including filtered out
node.allUnfilteredChildren;

// Store-level traversal
store.traverse(fn, topNode?, skipTopNode?, options?);
```

---

## 6. Change Batching

### Batch Operations

The Store provides mechanisms to batch multiple changes into a single update:

```javascript
// Using beginBatch/endBatch
store.beginBatch();
try {
    store.add([...many records...]);
    store.remove([...some records...]);
    records.forEach(r => r.field = newValue);
} finally {
    store.endBatch(); // Single 'refresh' event
}
```

### Event Suspension

```javascript
// Suspend all events
store.suspendEvents();
// ... make changes ...
store.resumeEvents(); // Events fire

// Suspend specific events
store.suspendEvents('update', 'add');
```

### Auto-Commit Control

```javascript
// Suspend automatic commits
store.suspendAutoCommit();
store.add(record1);
store.add(record2);
store.resumeAutoCommit(); // Triggers single commit if needed
```

### Change Tracking

Changes are tracked in internal arrays:

```javascript
store.changes = {
    added: Model[],     // Records added since last commit
    modified: Model[],  // Records modified since last commit
    removed: Model[]    // Records removed since last commit
};

store.hasChanges;       // Quick boolean check
```

---

## 7. Chained Stores

### Concept

A chained store is a live-filtered view of a master store:

```javascript
const allTasks = new Store({ data: tasks });

// Create filtered view
const activeTasks = allTasks.chain(
    record => record.status === 'active',  // Filter function
    ['status'],                            // Fields that trigger re-filter
    { /* additional config */ }
);
```

### Chained Store Configuration

```typescript
interface StoreChainedClassConfig {
    masterStore?: Store;              // Source store
    chainedFilterFn?: (record) => boolean;  // Filter function
    chainedFields?: string[];         // Fields triggering refill
    chainFilters?: boolean;           // Apply master's filters
    syncSort?: boolean;               // Sync sorting with master
    syncOrder?: boolean;              // Sync reordering
    excludeCollapsedRecords?: boolean; // For trees
    doRelayToMaster?: string[];       // Methods to relay
    dontRelayToMaster?: string[];     // Methods to block
}
```

### Synchronization

```
Master Store Changes
        |
        v
   Change Event
        |
        v
  Chained Store
  .fillFromMaster()
        |
        v
  Re-apply chainedFilterFn
        |
        v
  Update chained records
```

### Tree Chaining

```javascript
// Chain tree store (filters on leaves, maintains parents)
const filteredTree = treeStore.chainTree(
    record => record.isLeaf && record.visible,
    ['visible']
);
```

---

## 8. Memory Management

### Record Caching

Records are held by reference in the Store's `storage` Collection:

```javascript
// Records are Model instances
store.add({ id: 1, name: 'Task' });
// Creates: new Model({ id: 1, name: 'Task' })
```

### Lazy Loading (Virtual Store)

For large datasets, the Store supports lazy/virtual loading:

```javascript
const store = new Store({
    lazyLoad: true,
    autoLoad: true,
    async requestData({ startIndex, count, parentId, sorters, filters }) {
        const response = await fetch(`/api/records?start=${startIndex}&count=${count}`);
        return {
            data: response.data,
            total: response.total
        };
    }
});
```

### Lazy Load Configuration

```typescript
interface LazyLoadRequestParams {
    startIndex: number;           // First record index needed
    count: number;                // Number of records needed
    sorters?: Sorter[];           // Current sort state (if remoteSort)
    filters?: CollectionFilterConfig[]; // Current filters (if remoteFilter)
    parentId?: string | number;   // For tree stores
    startDate?: Date;             // For date-range queries
    endDate?: Date;               // For date-range queries
}
```

### Chunk-Based Loading

```
lazyLoad config:
{
    chunkSize: 100,   // Records per request (flat store default: 100)
                      // Tree store default: 50
}
```

### Skeleton Records

While loading, the Grid displays placeholder "skeleton" rows:

```
Grid requests record at index 500
        |
        v
Store checks: record exists?
        |
    NO  v
Request chunk: startIndex=400, count=200
        |
        v
Return Promise (Grid shows skeleton)
        |
        v
Data arrives, resolve Promise
        |
        v
Grid re-renders with real data
```

### Sparse Index

For maintaining record order with minimal updates:

```typescript
interface StoreSparseIndexClassConfig {
    useSparseIndex?: boolean;  // Enable sparse indexing
}
```

When enabled:
- Records get a `sparseIndex` field
- Moving records updates with fractional indices
- Avoids re-indexing entire store

---

## Data Structures Summary

### Store Internal State

```javascript
Store {
    // Core storage
    _storage: Collection,          // Records collection

    // Indexing
    _idMap: Map<id, {index, record}>,

    // Change tracking
    _added: Model[],
    _modified: Model[],
    _removed: Model[],

    // Filtering
    _filters: Collection<CollectionFilter>,
    _isFiltered: boolean,

    // Sorting
    _sorters: Sorter[],
    _isSorted: boolean,

    // Grouping
    _groupers: Grouper[],
    _isGrouped: boolean,
    _groupRecords: Map<groupValue, Model[]>,

    // Tree
    _rootNode: Model,
    _isTree: boolean,

    // Chaining
    _masterStore: Store | null,
    _chainedStores: Store[],

    // State
    _generation: number,           // Mutation counter
    _suspendCount: number,         // Event suspension depth
}
```

### Collection Internal State

```javascript
Collection {
    _values: any[],                // Filtered/sorted items
    _allValues: any[],             // All items
    _indices: Map<id, number>,     // ID to index mapping
    _generation: number,           // Mutation counter
    _filters: Collection<CollectionFilter>,
    _sorters: Collection<CollectionSorter>,
    _filterFunction: Function,     // Combined filter
    _sortFunction: Function,       // Combined sort
}
```

---

## Performance Considerations

### Indexing Complexity

| Operation | Time Complexity | Notes |
|-----------|-----------------|-------|
| `getById(id)` | O(1) | Hash map lookup |
| `getAt(index)` | O(1) | Array access |
| `indexOf(record)` | O(1) | Stored in idMap |
| `add(records)` | O(n) | n = records added |
| `remove(records)` | O(n) | n = records removed |
| `filter()` | O(n) | Scans all records |
| `sort()` | O(n log n) | Standard sort |
| `traverse()` | O(n) | Visits all nodes |

### Best Practices

1. **Use batch operations** for multiple changes
2. **Suspend events** during bulk updates
3. **Use lazy loading** for large datasets (10,000+ records)
4. **Configure `reapplySortersOnUpdate`** with specific fields
5. **Mark internal filters** to prevent accidental clearing
6. **Use chained stores** instead of re-filtering

---

## Event Flow

### CRUD Events

```
add() -> 'beforeAdd' -> 'add' -> 'change'
remove() -> 'beforeRemove' -> 'remove' -> 'change'
record.field = x -> 'update' -> 'change'
commit() -> 'beforeCommit' -> 'commit'
```

### Filter/Sort Events

```
filter() -> 'beforeFilter' -> 'filter' -> 'change'
sort() -> 'beforeSort' -> 'sort' -> 'change'
group() -> 'group' -> 'change'
```

### Tree Events

```
appendChild() -> 'beforeAdd' -> 'add' -> 'change'
removeChild() -> 'beforeRemove' -> 'remove' -> 'change'
toggleCollapse() -> 'toggleNode'
indent() -> 'beforeIndent' -> 'indent'
outdent() -> 'beforeOutdent' -> 'outdent'
```

---

## Version Information

- **Bryntum Gantt Version**: 7.1.0 (Trial)
- **Analysis Date**: 2025-12-26
- **Source**: TypeScript definitions and documentation from trial package
