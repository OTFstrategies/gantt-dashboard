# IMPL: Infinite Scroll & Large Data Handling

> **Implementation Guide** - Hoe Bryntum omgaat met grote datasets.

---

## Overzicht

Bryntum biedt meerdere strategieën voor het efficiënt renderen van grote datasets:

```
Performance Strategies:
┌─────────────────────────────────────────────────────────────┐
│ 1. Virtual Rendering   - Alleen zichtbare rows renderen     │
│ 2. Infinite Scroll     - Horizontale timeline uitbreiden    │
│ 3. Store Paging        - Server-side pagination             │
│ 4. Remote Sort/Filter  - Server-side data processing        │
│ 5. useRawData          - Optimized record creation          │
│ 6. Async Loading       - Non-blocking data generation       │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Virtual Row Rendering

### 1.1 Hoe Het Werkt

```
Viewport (zichtbaar):
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  Buffer (boven)
├─────────────────────────────────────────┤
│ ████████████████████████████████████████│  Zichtbare rows
│ ████████████████████████████████████████│
│ ████████████████████████████████████████│
│ ████████████████████████████████████████│
├─────────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  Buffer (onder)
└─────────────────────────────────────────┘

- Rows buiten buffer worden niet gerenderd
- Bij scroll worden rows hergebruikt (recycled)
- Alleen zichtbare + buffer rows zijn in DOM
```

### 1.2 Configuratie

```javascript
const gantt = new Gantt({
    // Row height (belangrijk voor virtualisatie)
    rowHeight: 45,

    // WAARSCHUWING: autoHeight bypass virtual rendering!
    // autoHeight: true  // NIET gebruiken bij grote datasets

    // Buffer coefficient (hoeveel extra te renderen)
    // Default: 5 (render 5x viewport hoogte)
    bufferCoef: 5
});
```

### 1.3 Performance Tips

```javascript
// ❌ VERMIJDEN bij grote datasets
const gantt = new Gantt({
    autoHeight: true  // Rendert ALLE rows!
});

// ✅ CORRECT
const gantt = new Gantt({
    height: '100%',   // Fixed height
    rowHeight: 45     // Consistent row height
});
```

---

## 2. Infinite Scroll (Timeline)

### 2.1 Basic Setup

```javascript
const gantt = new Gantt({
    // Enable infinite horizontal scroll
    infiniteScroll: true,

    // Buffer coefficient voor smooth scrolling
    // Hoger = meer data geladen, smoother scroll
    bufferCoef: 5,  // Default: 5

    // Touch devices: meer buffer voor momentum scroll
    bufferCoef: globalThis.matchMedia('(any-pointer:coarse)').matches ? 10 : 5,

    // Start position
    visibleDate: {
        date: new Date(),
        block: 'center'
    }
});
```

### 2.2 Scroll to Date

```javascript
// Scroll naar specifieke datum
gantt.scrollToDate(new Date('2024-06-15'), {
    block: 'center',  // 'start', 'center', 'end'
    animate: 500      // Animation duration (ms)
});

// Track visible date during scroll
gantt.on('horizontalScroll', () => {
    const centerDate = gantt.viewportCenterDate;
    console.log('Center:', centerDate);
});
```

### 2.3 Buffer Zone Behavior

```
Infinite Scroll Timeline:
         ◄─── bufferCoef ───►
┌────────────────────────────────────────────────────────────┐
│  Past Buffer  │  Visible Viewport  │  Future Buffer        │
│  (invisible)  │     (rendered)     │  (invisible)          │
└────────────────────────────────────────────────────────────┘
                        ↕
                 centerDate synced
```

---

## 3. Store Paging

### 3.1 Server-Side Paging

```javascript
const store = new AjaxStore({
    pageSize: 100,
    pageSizeParamName: 'limit',

    // Remote data URL
    readUrl: '/api/tasks',

    // Paging enabled
    remotePaging: true,

    // Optional: remote sort/filter
    remoteSort: true,
    remoteFilter: true
});
```

### 3.2 Load Request Format

```javascript
// Request naar server:
{
    page: 1,
    limit: 100,  // pageSize
    start: 0,    // offset

    // Als remoteSort enabled:
    sorters: [
        { field: 'startDate', direction: 'ASC' }
    ],

    // Als remoteFilter enabled:
    filters: [
        { property: 'status', operator: '=', value: 'active' }
    ]
}
```

### 3.3 Response Format

```javascript
// Response van server:
{
    success: true,
    data: [...],       // Records voor huidige pagina
    total: 5000        // Totaal aantal records
}
```

### 3.4 Load Pages

```javascript
// Load specific page
await store.loadPage(2);

// Navigate pages
await store.nextPage();
await store.previousPage();

// Check paging state
store.currentPage;    // Current page number
store.lastPage;       // Total pages
store.isPaged;        // true
```

---

## 4. useRawData Optimization

### 4.1 What It Does

```javascript
// ZONDER useRawData:
// - Elk record wordt gecloned
// - Type conversie voor alle velden
// - Duplicate ID check
// - Default values toegepast

// MET useRawData:
// - Data wordt direct gebruikt (geen clone)
// - Snellere record creatie
// - Minder memory overhead
```

### 4.2 Configuration

```javascript
const project = new ProjectModel({
    taskStore: {
        useRawData: true
    },
    dependencyStore: {
        useRawData: true
    }
});

// Of met specifieke opties:
taskStore: {
    useRawData: {
        disableDuplicateIdCheck: true,
        disableDefaultValue: true,
        disableTypeConversion: true
    }
}
```

### 4.3 When to Use

```javascript
// ✅ GEBRUIK voor:
// - Grote datasets (1000+ records)
// - Data die al correct geformatteerd is
// - Batch imports
// - Performance-critical scenarios

// ❌ VERMIJD als:
// - Data type conversie nodig is
// - Duplicate IDs mogelijk zijn
// - Default values belangrijk zijn
```

---

## 5. Async Data Generation

### 5.1 ProjectGenerator

```javascript
import { ProjectGenerator, AsyncHelper } from '@bryntum/gantt';

// Generate large dataset async
async function generateDataset(taskCount) {
    // Show loading indicator
    gantt.mask('Generating tasks...');

    // Allow browser to update DOM
    await AsyncHelper.sleep(100);

    // Generate data
    const config = await ProjectGenerator.generateAsync(
        taskCount,      // Number of tasks
        50              // Project size (tasks per "project")
    );

    // Allow DOM update before calculations
    await AsyncHelper.sleep(10);

    // Apply to gantt
    gantt.project?.destroy();
    gantt.project = new ProjectModel({
        taskStore: { useRawData: true },
        dependencyStore: { useRawData: true },
        ...config
    });

    gantt.unmask();
}
```

### 5.2 Replacing Data Strategies

```javascript
// Strategy A: Replace entire project (recommended)
gantt.project?.destroy();
gantt.project = new ProjectModel({
    taskStore: { useRawData: true },
    ...config
});

// Strategy B: Replace store data per store
gantt.taskStore.data = config.tasksData;
gantt.dependencyStore.data = config.dependenciesData;

// Strategy C: Replace via project
gantt.project.loadInlineData(config);
```

---

## 6. Lazy Loading (Trees)

### 6.1 On-Demand Child Loading

```javascript
const store = new TreeStore({
    readUrl: '/api/tasks',

    // Load children on expand
    lazyLoad: true
});

// Server receives parentId in request
// Request: GET /api/tasks?parentId=123
```

### 6.2 Response Structure

```javascript
// Initial load (root nodes)
{
    success: true,
    data: [
        { id: 1, name: 'Parent 1', children: true },  // Has children
        { id: 2, name: 'Parent 2', children: false }  // Leaf node
    ]
}

// Child load (parentId=1)
{
    success: true,
    data: [
        { id: 11, name: 'Child 1.1' },
        { id: 12, name: 'Child 1.2' }
    ]
}
```

---

## 7. Performance Monitoring

### 7.1 Rendering Statistics

```javascript
// After render
gantt.on('renderRows', () => {
    const rowManager = gantt.rowManager;

    console.log({
        visibleRows: rowManager.visibleRowCount,
        renderedRows: rowManager.rowCount,
        topRow: rowManager.topRow,
        bottomRow: rowManager.bottomRow
    });
});
```

### 7.2 Store Statistics

```javascript
console.log({
    totalRecords: gantt.taskStore.count,
    filteredRecords: gantt.taskStore.filteredCount,
    visibleRecords: gantt.taskStore.records.length
});
```

---

## 8. Eigen Implementatie

### 8.1 Virtual List Renderer

```typescript
interface VirtualListConfig {
    itemHeight: number;
    containerHeight: number;
    bufferSize: number;  // Extra items boven/onder
}

class VirtualListRenderer {
    private items: any[] = [];
    private scrollTop = 0;
    private config: VirtualListConfig;

    constructor(config: VirtualListConfig) {
        this.config = config;
    }

    setItems(items: any[]): void {
        this.items = items;
    }

    setScrollTop(scrollTop: number): void {
        this.scrollTop = scrollTop;
    }

    getVisibleRange(): { start: number; end: number } {
        const { itemHeight, containerHeight, bufferSize } = this.config;

        // Calculate visible items
        const firstVisible = Math.floor(this.scrollTop / itemHeight);
        const visibleCount = Math.ceil(containerHeight / itemHeight);

        // Add buffer
        const start = Math.max(0, firstVisible - bufferSize);
        const end = Math.min(
            this.items.length,
            firstVisible + visibleCount + bufferSize
        );

        return { start, end };
    }

    getVisibleItems(): { item: any; index: number; top: number }[] {
        const { start, end } = this.getVisibleRange();
        const { itemHeight } = this.config;

        return this.items.slice(start, end).map((item, i) => ({
            item,
            index: start + i,
            top: (start + i) * itemHeight
        }));
    }

    getTotalHeight(): number {
        return this.items.length * this.config.itemHeight;
    }
}
```

### 8.2 Infinite Scroll Manager (Horizontal)

```typescript
interface TimelineConfig {
    visibleRange: number;  // Visible time in ms
    bufferRange: number;   // Buffer time in ms
    onRangeChange: (start: Date, end: Date) => void;
}

class InfiniteTimelineScroller {
    private config: TimelineConfig;
    private centerDate: Date;
    private loadedRanges: { start: Date; end: Date }[] = [];

    constructor(config: TimelineConfig) {
        this.config = config;
        this.centerDate = new Date();
    }

    scrollTo(date: Date): void {
        this.centerDate = date;
        this.ensureDataLoaded();
    }

    scrollBy(deltaMs: number): void {
        const newCenter = new Date(this.centerDate.getTime() + deltaMs);
        this.scrollTo(newCenter);
    }

    getVisibleRange(): { start: Date; end: Date } {
        const halfVisible = this.config.visibleRange / 2;
        return {
            start: new Date(this.centerDate.getTime() - halfVisible),
            end: new Date(this.centerDate.getTime() + halfVisible)
        };
    }

    private ensureDataLoaded(): void {
        const { bufferRange } = this.config;
        const visible = this.getVisibleRange();

        const requiredStart = new Date(visible.start.getTime() - bufferRange);
        const requiredEnd = new Date(visible.end.getTime() + bufferRange);

        // Check if data is loaded
        const needsLoad = !this.isRangeLoaded(requiredStart, requiredEnd);

        if (needsLoad) {
            this.config.onRangeChange(requiredStart, requiredEnd);
            this.loadedRanges.push({ start: requiredStart, end: requiredEnd });
        }
    }

    private isRangeLoaded(start: Date, end: Date): boolean {
        return this.loadedRanges.some(range =>
            range.start <= start && range.end >= end
        );
    }
}
```

### 8.3 Paginated Store

```typescript
interface PaginatedStoreConfig<T> {
    pageSize: number;
    fetchPage: (page: number, params: LoadParams) => Promise<PageResult<T>>;
}

interface LoadParams {
    sort?: { field: string; direction: 'ASC' | 'DESC' }[];
    filter?: { property: string; operator: string; value: any }[];
}

interface PageResult<T> {
    data: T[];
    total: number;
}

class PaginatedStore<T> {
    private config: PaginatedStoreConfig<T>;
    private pages: Map<number, T[]> = new Map();
    private currentPage = 1;
    private totalCount = 0;
    private loadParams: LoadParams = {};

    constructor(config: PaginatedStoreConfig<T>) {
        this.config = config;
    }

    async loadPage(page: number): Promise<T[]> {
        if (this.pages.has(page)) {
            this.currentPage = page;
            return this.pages.get(page)!;
        }

        const result = await this.config.fetchPage(page, this.loadParams);

        this.pages.set(page, result.data);
        this.totalCount = result.total;
        this.currentPage = page;

        return result.data;
    }

    async nextPage(): Promise<T[]> {
        if (this.currentPage < this.lastPage) {
            return this.loadPage(this.currentPage + 1);
        }
        return this.getCurrentPageData();
    }

    async previousPage(): Promise<T[]> {
        if (this.currentPage > 1) {
            return this.loadPage(this.currentPage - 1);
        }
        return this.getCurrentPageData();
    }

    setSort(sort: LoadParams['sort']): void {
        this.loadParams.sort = sort;
        this.pages.clear();  // Clear cache
    }

    setFilter(filter: LoadParams['filter']): void {
        this.loadParams.filter = filter;
        this.pages.clear();  // Clear cache
    }

    getCurrentPageData(): T[] {
        return this.pages.get(this.currentPage) || [];
    }

    get lastPage(): number {
        return Math.ceil(this.totalCount / this.config.pageSize);
    }

    get isPaged(): boolean {
        return true;
    }
}
```

### 8.4 React Virtual List Component

```tsx
interface VirtualListProps<T> {
    items: T[];
    itemHeight: number;
    containerHeight: number;
    renderItem: (item: T, index: number) => React.ReactNode;
    bufferSize?: number;
}

function VirtualList<T>({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    bufferSize = 5
}: VirtualListProps<T>) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalHeight = items.length * itemHeight;

    // Calculate visible range
    const firstVisible = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.max(0, firstVisible - bufferSize);
    const end = Math.min(items.length, firstVisible + visibleCount + bufferSize);

    const visibleItems = items.slice(start, end);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    return (
        <div
            ref={containerRef}
            style={{ height: containerHeight, overflow: 'auto' }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleItems.map((item, i) => (
                    <div
                        key={start + i}
                        style={{
                            position: 'absolute',
                            top: (start + i) * itemHeight,
                            height: itemHeight,
                            width: '100%'
                        }}
                    >
                        {renderItem(item, start + i)}
                    </div>
                ))}
            </div>
        </div>
    );
}
```

---

## 9. Best Practices

### 9.1 Performance Checklist

```javascript
// ✅ DO:
const gantt = new Gantt({
    height: '100%',              // Fixed height
    rowHeight: 45,               // Consistent row height
    infiniteScroll: true,        // Horizontal infinite scroll
    bufferCoef: 5,               // Reasonable buffer

    project: {
        taskStore: { useRawData: true },
        dependencyStore: { useRawData: true }
    }
});

// ❌ DON'T:
const gantt = new Gantt({
    autoHeight: true,            // Kills virtualization!
    // No useRawData for large datasets
});
```

### 9.2 Data Loading Strategy

```javascript
// For large datasets:
// 1. Show loading indicator immediately
// 2. Generate/fetch data async
// 3. Use useRawData
// 4. Replace project entirely (not incremental updates)

async function loadLargeDataset() {
    gantt.mask('Loading...');

    await AsyncHelper.sleep(50);  // Let UI update

    const data = await fetchData();

    gantt.project?.destroy();
    gantt.project = new ProjectModel({
        taskStore: { useRawData: true },
        dependencyStore: { useRawData: true },
        ...data
    });

    gantt.unmask();
}
```

### 9.3 Memory Management

```javascript
// Clear old project to free memory
function replaceProject(newData) {
    // Destroy old project
    gantt.project?.destroy();

    // Create fresh project
    gantt.project = new ProjectModel(newData);
}

// Paginated loading clears old pages
store.on('load', () => {
    // Clear pages not in view
    store.clearOldPages();
});
```

---

## 10. Cross-References

| Document | Relevante Secties |
|----------|-------------------|
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | Store loading |
| [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) | Virtual rendering |
| [IMPL-FILTERING](./IMPL-FILTERING.md) | Remote filtering |
| [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md) | Data sync |

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
