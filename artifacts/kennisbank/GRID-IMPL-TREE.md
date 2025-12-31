# Grid Implementation: TreeGrid

> **Implementatie guide** voor hiërarchische data in Bryntum Grid: TreeGrid, lazy loading, expand/collapse, parent nodes, en cross-tree drag & drop.

---

## Overzicht

TreeGrid is een gespecialiseerde versie van Grid voor hiërarchische data. Het ondersteunt:
- **Nested data** met parent/child relaties
- **Expand/Collapse** van nodes
- **Lazy loading** van children
- **Drag & drop** binnen en tussen trees
- **Tree-specifieke selectie** (includeChildren/includeParents)

---

## 1. Basic TreeGrid

### 1.1 Configuration

```javascript
import { TreeGrid } from '@bryntum/grid';

const treeGrid = new TreeGrid({
    appendTo: 'container',

    columns: [
        { type: 'tree', text: 'Name', field: 'name', flex: 1 },
        { text: 'Age', field: 'age', width: 100 }
    ],

    store: {
        // Niet nodig - TreeGrid zet dit automatisch
        // tree: true
        data: [...]
    }
});
```

### 1.2 Tree Data Structure

```javascript
const data = [
    {
        id       : 1,
        name     : 'Parent A',
        expanded : true,                // Start expanded
        children : [
            { id: 11, name: 'Child A1' },
            { id: 12, name: 'Child A2' },
            {
                id      : 13,
                name    : 'Child A3',
                children: [
                    { id: 131, name: 'Grandchild A3.1' }
                ]
            }
        ]
    },
    {
        id      : 2,
        name    : 'Parent B',
        children: [
            { id: 21, name: 'Child B1' }
        ]
    }
];
```

---

## 2. TreeColumn

### 2.1 Configuration

```javascript
{
    type           : 'tree',
    field          : 'name',
    text           : 'Name',
    flex           : 1,

    // Icons
    expandIconCls  : 'fa fa-plus-square',    // Expand icon
    collapseIconCls: 'fa fa-minus-square',   // Collapse icon
    leafIconCls    : 'b-icon fa-user',       // Leaf node icon

    // Indentation
    indentSize     : 20,                     // Pixels per level

    // Editing
    editor         : { type: 'textfield', required: true }
}
```

### 2.2 Custom Renderer

```javascript
{
    type      : 'tree',
    field     : 'name',
    renderer({ value, record, row }) {
        // Different rendering for different node types
        if (record.isLeaf) {
            return { className: 'leaf-node', text: value };
        }

        // Parent with child count
        return {
            className: 'parent-node',
            children : [
                value,
                { tag: 'span', className: 'count', text: `(${record.children.length})` }
            ]
        };
    }
}
```

---

## 3. Tree Feature

### 3.1 Configuration

```javascript
features: {
    tree: {
        treeLines: true                      // Show connecting lines
    }
}
```

### 3.2 Toggle Tree Lines

```javascript
grid.features.tree.treeLines = true;
grid.features.tree.treeLines = false;
```

---

## 4. Expand/Collapse

### 4.1 API Methods

```javascript
// Single node
treeGrid.expand(record);
treeGrid.collapse(record);
treeGrid.toggleCollapse(record);

// All nodes
treeGrid.expandAll();
treeGrid.collapseAll();

// To specific depth
treeGrid.expandAll(2);                      // Expand 2 levels deep
```

### 4.2 Events

```javascript
listeners: {
    beforeToggleNode({ record, collapse }) {
        // Return false to prevent
        if (record.locked) return false;
    },

    toggleNode({ record, collapse }) {
        console.log(collapse ? 'Collapsed' : 'Expanded', record.name);
    }
}
```

### 4.3 Data Properties

```javascript
// In data
{ id: 1, name: 'Node', expanded: true }

// Programmatisch
record.expanded = true;
record.expanded = false;
```

---

## 5. Custom Model

### 5.1 GridRowModel

```javascript
import { GridRowModel } from '@bryntum/grid';

class PersonModel extends GridRowModel {
    static fields = [
        'name',
        { name: 'age', type: 'number' },
        'department'
    ];

    // Auto-convert lege parent naar leaf
    static convertEmptyParentToLeaf = true;
}

class DepartmentModel extends GridRowModel {
    static fields = [
        'name',
        'budget'
    ];
}
```

### 5.2 Dynamic Model Class

```javascript
store: {
    modelClass: PersonModel,

    // Dynamische model keuze
    createRecord(data) {
        let modelClass = this.modelClass;

        if (data.type === 'department') {
            modelClass = DepartmentModel;
        }

        return new modelClass(data, this);
    }
}
```

---

## 6. Lazy Loading

### 6.1 Server-Side Loading

```javascript
const treeGrid = new TreeGrid({
    columns: [
        { type: 'tree', text: 'Name', field: 'name' },
        { text: 'Size', field: 'size' }
    ],

    store: {
        readUrl  : '/api/tree',
        autoLoad : true,

        listeners: {
            async exception({ response }) {
                console.error(response.error);
            }
        }
    }
});
```

### 6.2 Server Response Format

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Root",
            "children": true,
            "expanded": false
        }
    ]
}
```

**children: true** geeft aan dat er children zijn die nog geladen moeten worden.

### 6.3 Load Children on Expand

```json
// Request: GET /api/tree?parentId=1

// Response:
{
    "success": true,
    "data": [
        { "id": 11, "name": "Child 1", "parentId": 1 },
        { "id": 12, "name": "Child 2", "parentId": 1, "children": true }
    ]
}
```

---

## 7. Tree Navigation

### 7.1 Record Properties

```javascript
// Parent/Child relaties
record.parent              // Parent record
record.children            // Direct children array
record.allChildren         // All descendants
record.firstChild          // First child
record.lastChild           // Last child

// Siblings
record.previousSibling     // Previous sibling
record.nextSibling         // Next sibling

// State
record.isLeaf              // No children
record.isParent            // Has children
record.expanded            // Is expanded
record.childLevel          // Depth level (0 = root)

// Tree position
record.isRoot              // Is root node
record.descendantCount     // Number of descendants
```

### 7.2 Store Properties

```javascript
// All records
store.allRecords           // Flat array of all

// Root level
store.rootNode             // Virtual root
store.roots                // Top-level records

// Leaves
store.leaves               // All leaf nodes
```

---

## 8. Tree Selection

### 8.1 Include Children

```javascript
selectionMode: {
    checkbox       : true,
    includeChildren: true          // Select children when parent selected
    // OF
    includeChildren: 'always'      // Always include, not just checkbox
}
```

### 8.2 Include Parents

```javascript
selectionMode: {
    checkbox      : true,
    includeParents: true           // Select parent when ALL children selected
    // OF
    includeParents: 'some'         // Select parent when SOME children selected
}
```

---

## 9. Drag & Drop

### 9.1 Within Tree

```javascript
features: {
    rowReorder: true
}
```

### 9.2 Cross-Tree Drag

```javascript
features: {
    rowReorder: {
        showGrip          : true,
        allowCrossGridDrag: true,   // Allow drag between TreeGrids
        dropOnLeaf        : true    // Allow drop on leaf nodes
    }
}
```

### 9.3 Drag Events

```javascript
listeners: {
    gridRowBeforeDropFinalize({ source, target, context }) {
        // Return false to prevent drop
        if (!canDrop(source, target)) {
            return false;
        }
    },

    gridRowDrop({ source, target }) {
        console.log('Dropped', source.record.name, 'onto', target.record.name);
    }
}
```

---

## 10. AggregateColumn

### 10.1 Sum Children

```javascript
{
    type             : 'aggregate',
    text             : 'Total',
    field            : 'amount',
    sum              : 'sum',            // 'sum' | 'count' | 'average' | function
    enableAggregation: true
}
```

### 10.2 Custom Aggregation

```javascript
{
    type: 'aggregate',
    field: 'amount',
    sum: records => records.reduce((sum, r) => sum + r.amount, 0),
    summaryRenderer: ({ sum }) => `€${sum.toFixed(2)}`
}
```

---

## 11. Tree Filtering

### 11.1 Configuration

```javascript
features: {
    filter    : true,
    filterBar : true
}
```

### 11.2 Filter Behavior

Bij filtering in tree:
- Matching nodes worden getoond
- Parent nodes worden ook getoond (om hiërarchie te behouden)
- Non-matching leafs worden verborgen

---

## 12. Tree Grouping

### 12.1 TreeGroup Feature

```javascript
features: {
    treeGroup: {
        levels: ['department', 'team']   // Groepeer op deze velden
    }
}
```

### 12.2 Flat Data → Tree

```javascript
// Input (flat)
[
    { id: 1, name: 'John', department: 'Sales', team: 'A' },
    { id: 2, name: 'Jane', department: 'Sales', team: 'B' },
    { id: 3, name: 'Bob', department: 'Dev', team: 'C' }
]

// Output (tree)
- Sales
  - Team A
    - John
  - Team B
    - Jane
- Dev
  - Team C
    - Bob
```

---

## 13. Performance

### 13.1 Large Trees

```javascript
const treeGrid = new TreeGrid({
    // Vaste rij hoogte
    fixedRowHeight: true,
    rowHeight     : 40,

    store: {
        useRawData: true
    }
});
```

### 13.2 Virtualized Tree

TreeGrid gebruikt dezelfde virtuele rendering als Grid:
- Alleen zichtbare rijen worden gerenderd
- Buffer zones boven/onder viewport
- Row recycling bij scrollen

---

## 14. TypeScript Interfaces

```typescript
import { TreeGrid, GridRowModel } from '@bryntum/grid';

interface TreeNodeData {
    id: string | number;
    name: string;
    expanded?: boolean;
    children?: TreeNodeData[] | boolean;
    parentId?: string | number;
    [key: string]: any;
}

interface TreeColumnConfig {
    type: 'tree';
    field: string;
    text?: string;
    flex?: number;
    width?: number;
    expandIconCls?: string;
    collapseIconCls?: string;
    leafIconCls?: string;
    indentSize?: number;
    renderer?: (data: RenderData) => any;
}

interface TreeGridConfig extends GridConfig {
    features?: {
        tree?: boolean | {
            treeLines?: boolean;
        };
        rowReorder?: boolean | {
            allowCrossGridDrag?: boolean;
            dropOnLeaf?: boolean;
        };
    };
}

// TreeGrid API
interface TreeGrid extends Grid {
    expand(record: Model): Promise<void>;
    collapse(record: Model): void;
    toggleCollapse(record: Model): void;
    expandAll(depth?: number): Promise<void>;
    collapseAll(): void;
}

// Model properties
interface TreeNode extends Model {
    parent: TreeNode;
    children: TreeNode[];
    allChildren: TreeNode[];
    isLeaf: boolean;
    isParent: boolean;
    expanded: boolean;
    childLevel: number;
    descendantCount: number;
}
```

---

## 15. Complete Example

```javascript
import { TreeGrid, GridRowModel } from '@bryntum/grid';

// Custom model
class TeamMember extends GridRowModel {
    static fields = [
        'name',
        { name: 'age', type: 'number' },
        'role'
    ];

    static convertEmptyParentToLeaf = true;
}

// TreeGrid instance
const treeGrid = new TreeGrid({
    appendTo: 'container',

    features: {
        tree: { treeLines: true },
        rowReorder: {
            showGrip          : true,
            allowCrossGridDrag: true
        },
        cellEdit: true,
        filter  : true
    },

    selectionMode: {
        checkbox       : true,
        includeChildren: true,
        showCheckAll   : true
    },

    columns: [
        {
            type       : 'tree',
            text       : 'Name',
            field      : 'name',
            flex       : 2,
            leafIconCls: 'fa fa-user',
            editor     : { type: 'textfield', required: true }
        },
        {
            type : 'number',
            text : 'Age',
            field: 'age',
            width: 80
        },
        {
            text : 'Role',
            field: 'role',
            flex : 1
        },
        {
            type : 'aggregate',
            text : 'Team Size',
            field: 'age',
            sum  : 'count'
        }
    ],

    store: {
        modelClass: TeamMember,
        data: [
            {
                id      : 1,
                name    : 'Engineering',
                expanded: true,
                children: [
                    {
                        id      : 11,
                        name    : 'Frontend',
                        expanded: true,
                        children: [
                            { id: 111, name: 'Alice', age: 28, role: 'Developer' },
                            { id: 112, name: 'Bob', age: 32, role: 'Senior Dev' }
                        ]
                    },
                    {
                        id      : 12,
                        name    : 'Backend',
                        children: [
                            { id: 121, name: 'Charlie', age: 35, role: 'Architect' }
                        ]
                    }
                ]
            },
            {
                id      : 2,
                name    : 'Design',
                children: [
                    { id: 21, name: 'Diana', age: 26, role: 'UX Designer' }
                ]
            }
        ]
    },

    tbar: [
        {
            type    : 'button',
            icon    : 'fa fa-expand',
            text    : 'Expand All',
            onClick : () => treeGrid.expandAll()
        },
        {
            type    : 'button',
            icon    : 'fa fa-compress',
            text    : 'Collapse All',
            onClick : () => treeGrid.collapseAll()
        },
        {
            type   : 'slidetoggle',
            text   : 'Tree Lines',
            checked: true,
            onChange: ({ checked }) => {
                treeGrid.features.tree.treeLines = checked;
            }
        }
    ],

    listeners: {
        toggleNode({ record, collapse }) {
            console.log(collapse ? 'Collapsed' : 'Expanded', record.name);
        }
    }
});
```

---

## Referenties

- Examples: `grid-7.1.0-trial/examples/tree/`
- Examples: `grid-7.1.0-trial/examples/treeloadondemand/`
- Examples: `grid-7.1.0-trial/examples/drag-between-trees/`
- Examples: `grid-7.1.0-trial/examples/tree-grouping/`
- TypeScript: `grid.d.ts` lines 146448+ (TreeGrid)
- TypeScript: `grid.d.ts` lines 127883+ (Tree feature)

---

*Document gegenereerd: December 2024*
*Bryntum Grid versie: 7.1.0*
