# IMPL: Nested Events & Task Segments

> **Implementation Guide** - Hoe Bryntum's split tasks en task segments werken.

---

## Overzicht

Bryntum ondersteunt taken die opgesplitst zijn in meerdere segmenten. Dit is nuttig wanneer werk onderbroken wordt (bijv. door een wachtperiode of resource niet beschikbaar).

```
Normale task:
|████████████████████████████████|

Gesegmenteerde task:
|████████|          |████████|          |████████|
  Seg 1      gap      Seg 2      gap      Seg 3
```

---

## 1. Data Structuur

### 1.1 Task met Segments

```json
{
    "id": 12,
    "name": "Configure firewall",
    "startDate": "2024-01-14",
    "endDate": "2024-01-26",
    "duration": 7,
    "segments": [
        {
            "name": "DDOS",
            "startDate": "2024-01-14",
            "endDate": "2024-01-18"
        },
        {
            "name": "Ports",
            "startDate": "2024-01-21",
            "endDate": "2024-01-22"
        },
        {
            "name": "Malware",
            "startDate": "2024-01-24",
            "endDate": "2024-01-26"
        }
    ]
}
```

### 1.2 EventSegmentModel

```typescript
interface EventSegmentModel extends TimeSpan {
    // Inherited from TimeSpan
    startDate: Date;
    endDate: Date;
    duration: number;
    durationUnit: DurationUnit;

    // Segment-specific
    event: EventModel;           // Parent event/task
    isEventSegment: boolean;     // Always true
    eventColor: string;          // Inherited or custom
    draggable: boolean;
    resizable: boolean | 'start' | 'end';

    // Assignments (for time-phased)
    assignments: AssignmentModel[];
}
```

---

## 2. Basis Implementatie

### 2.1 Gantt met Segments

```javascript
import { Gantt } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',

    project: {
        autoLoad: true,
        loadUrl: '/api/project-with-segments'
    },

    // Custom rendering voor segments
    taskRenderer({ taskRecord }) {
        if (taskRecord.isEventSegment) {
            return taskRecord.name;  // Toon segment naam
        }
        return '';  // Parent task toont niets
    }
});
```

### 2.2 Programmatisch Segments Maken

```javascript
// Split een task
const task = gantt.taskStore.getById(12);

await task.splitTask(new Date('2024-01-18'));  // Split op specifieke datum

// Of: set segments direct
await task.setSegments([
    { name: 'Part 1', startDate: '2024-01-14', endDate: '2024-01-16' },
    { name: 'Part 2', startDate: '2024-01-18', endDate: '2024-01-20' }
]);

// Merge segments
await task.mergeSegments(segment1, segment2);
```

---

## 3. Features voor Segments

### 3.1 EventSegments Feature

```javascript
// Standaard ingeschakeld voor SchedulerPro/Gantt
const gantt = new Gantt({
    features: {
        // EventSegments is automatisch enabled
        // Configuratie opties:
    }
});
```

### 3.2 Segment Drag

```javascript
const gantt = new Gantt({
    features: {
        // Aparte feature voor segment dragging
        taskSegmentDrag: {
            // Validatie
            validatorFn({ taskRecord, startDate }) {
                // Voorkom overlap met andere segments
                return { valid: true };
            }
        }
    }
});
```

### 3.3 Segment Resize

```javascript
const gantt = new Gantt({
    features: {
        taskSegmentResize: {
            // Alleen rechter kant resizable
            // resizable: 'end'
        }
    }
});
```

---

## 4. Auto-Merge Behavior

### 4.1 Configuratie

```javascript
const gantt = new Gantt({
    features: {
        // Automatisch aangrenzende segments mergen
        // Default: true
        mergeAdjacentSegments: true
    }
});

// Of via project
const project = new ProjectModel({
    // Merge overlapping/adjacent segments
    autoMergeSegments: true
});
```

### 4.2 Wanneer Merge Gebeurt

```
Scenario 1: Adjacent segments
|████████||████████|  →  |████████████████|
  Seg 1     Seg 2           Merged

Scenario 2: Overlapping segments
|████████████|       →  |████████████████|
    |████████████|          Merged

Scenario 3: Gap between segments (NO merge)
|████████|    |████████|  →  Blijft 2 segments
```

---

## 5. Rendering

### 5.1 Task Renderer voor Segments

```javascript
const gantt = new Gantt({
    taskRenderer({ taskRecord, renderData }) {
        if (taskRecord.isEventSegment) {
            // Dit is een segment
            const segment = taskRecord;
            const parentTask = segment.event;

            // Custom styling
            renderData.cls['segment'] = true;
            renderData.cls['first-segment'] = segment === parentTask.segments[0];

            return {
                tag: 'div',
                class: 'segment-content',
                children: [
                    { tag: 'span', text: segment.name },
                    { tag: 'span', class: 'duration', text: `${segment.duration}d` }
                ]
            };
        }

        // Parent task (container)
        return '';
    }
});
```

### 5.2 CSS Styling

```css
/* Segment bars */
.b-gantt-task.b-event-segment {
    border-radius: 4px;
    opacity: 0.9;
}

/* Eerste segment */
.b-gantt-task.b-event-segment:first-of-type {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}

/* Laatste segment */
.b-gantt-task.b-event-segment:last-of-type {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}

/* Gap indicator */
.b-gantt-task-wrap.b-segmented .b-segment-gap {
    background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 5px,
        rgba(0,0,0,0.1) 5px,
        rgba(0,0,0,0.1) 10px
    );
}

/* Custom styling class */
.custom-styling .b-gantt-task.b-event-segment {
    background-color: var(--segment-color, #4a90d9);
}
```

---

## 6. Events

### 6.1 Segment Events

```javascript
gantt.on({
    // Segment drag events
    beforeTaskSegmentDrag({ taskRecord, context }) {
        console.log('About to drag segment:', taskRecord.name);
        return true;  // Allow drag
    },

    taskSegmentDragStart({ taskRecord }) {
        console.log('Started dragging:', taskRecord.name);
    },

    taskSegmentDrop({ taskRecord, startDate }) {
        console.log('Dropped at:', startDate);
    },

    // Segment resize events
    beforeTaskSegmentResize({ taskRecord }) {
        return taskRecord.resizable !== false;
    },

    taskSegmentResizeEnd({ taskRecord, startDate, endDate }) {
        console.log('Resized:', startDate, 'to', endDate);
    }
});
```

---

## 7. Hierarchische Tasks (Parent/Child)

### 7.1 Task Hiërarchie

```json
{
    "tasks": {
        "rows": [
            {
                "id": 1,
                "name": "Parent Task",
                "expanded": true,
                "children": [
                    {
                        "id": 11,
                        "name": "Child Task 1",
                        "duration": 5
                    },
                    {
                        "id": 12,
                        "name": "Child Task 2",
                        "duration": 3
                    }
                ]
            }
        ]
    }
}
```

### 7.2 Parent Task Berekening

```javascript
// Parent task dates worden automatisch berekend
// startDate = min(children.startDate)
// endDate = max(children.endDate)
// duration = endDate - startDate (in working time)
// percentDone = weighted average of children
```

### 7.3 Rollup

```javascript
// Toon child milestones op parent task
{
    "id": 11,
    "name": "Milestone",
    "duration": 0,
    "rollup": true  // Toon op parent
}
```

---

## 8. Eigen Implementatie

### 8.1 Segment Data Model

```typescript
interface Segment {
    id: string;
    taskId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    order: number;
}

interface SegmentedTask extends Task {
    segments: Segment[];
    isSegmented: boolean;
}

class SegmentManager {
    private segments: Map<string, Segment[]> = new Map();

    getSegments(taskId: string): Segment[] {
        return this.segments.get(taskId) || [];
    }

    addSegment(taskId: string, segment: Omit<Segment, 'id' | 'order'>): Segment {
        const segments = this.getSegments(taskId);
        const newSegment: Segment = {
            ...segment,
            id: crypto.randomUUID(),
            taskId,
            order: segments.length
        };

        // Insert in chronological order
        const insertIndex = segments.findIndex(s => s.startDate > newSegment.startDate);
        if (insertIndex === -1) {
            segments.push(newSegment);
        } else {
            segments.splice(insertIndex, 0, newSegment);
        }

        // Reorder
        segments.forEach((s, i) => s.order = i);

        this.segments.set(taskId, segments);
        return newSegment;
    }

    splitTask(taskId: string, splitDate: Date): [Segment, Segment] {
        const task = this.getTask(taskId);
        const segments = this.getSegments(taskId);

        if (segments.length === 0) {
            // Create two segments from unsegmented task
            const seg1: Segment = {
                id: crypto.randomUUID(),
                taskId,
                name: `${task.name} - Part 1`,
                startDate: task.startDate,
                endDate: splitDate,
                order: 0
            };

            const seg2: Segment = {
                id: crypto.randomUUID(),
                taskId,
                name: `${task.name} - Part 2`,
                startDate: this.addDays(splitDate, 1), // Gap of 1 day
                endDate: task.endDate,
                order: 1
            };

            this.segments.set(taskId, [seg1, seg2]);
            return [seg1, seg2];
        }

        // Find segment to split
        const segmentToSplit = segments.find(
            s => splitDate > s.startDate && splitDate < s.endDate
        );

        if (!segmentToSplit) {
            throw new Error('Split date must be within a segment');
        }

        // Split the segment
        const newSeg: Segment = {
            id: crypto.randomUUID(),
            taskId,
            name: `${segmentToSplit.name} - Part 2`,
            startDate: this.addDays(splitDate, 1),
            endDate: segmentToSplit.endDate,
            order: segmentToSplit.order + 1
        };

        segmentToSplit.endDate = splitDate;
        segmentToSplit.name = `${segmentToSplit.name} - Part 1`;

        // Insert and reorder
        const index = segments.indexOf(segmentToSplit);
        segments.splice(index + 1, 0, newSeg);
        segments.forEach((s, i) => s.order = i);

        return [segmentToSplit, newSeg];
    }

    mergeSegments(taskId: string, seg1Id: string, seg2Id: string): Segment {
        const segments = this.getSegments(taskId);
        const seg1 = segments.find(s => s.id === seg1Id)!;
        const seg2 = segments.find(s => s.id === seg2Id)!;

        // Ensure seg1 is before seg2
        const [first, second] = seg1.order < seg2.order ? [seg1, seg2] : [seg2, seg1];

        // Merge all segments between first and second
        const startIndex = segments.indexOf(first);
        const endIndex = segments.indexOf(second);
        const toMerge = segments.slice(startIndex, endIndex + 1);

        const merged: Segment = {
            id: crypto.randomUUID(),
            taskId,
            name: first.name.replace(' - Part 1', ''),
            startDate: first.startDate,
            endDate: second.endDate,
            order: first.order
        };

        // Remove merged segments and add new one
        segments.splice(startIndex, toMerge.length, merged);
        segments.forEach((s, i) => s.order = i);

        return merged;
    }

    private addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}
```

### 8.2 Segment Rendering

```typescript
interface SegmentRenderData {
    taskId: string;
    segments: {
        id: string;
        x: number;      // Start position in pixels
        width: number;  // Width in pixels
        name: string;
    }[];
    gaps: {
        x: number;
        width: number;
    }[];
}

class SegmentRenderer {
    private timeToPixel: (date: Date) => number;

    calculateRenderData(task: SegmentedTask): SegmentRenderData {
        const segments = task.segments;

        const segmentData = segments.map(seg => ({
            id: seg.id,
            x: this.timeToPixel(seg.startDate),
            width: this.timeToPixel(seg.endDate) - this.timeToPixel(seg.startDate),
            name: seg.name
        }));

        // Calculate gaps
        const gaps = [];
        for (let i = 0; i < segments.length - 1; i++) {
            const current = segments[i];
            const next = segments[i + 1];

            gaps.push({
                x: this.timeToPixel(current.endDate),
                width: this.timeToPixel(next.startDate) - this.timeToPixel(current.endDate)
            });
        }

        return {
            taskId: task.id,
            segments: segmentData,
            gaps
        };
    }

    render(data: SegmentRenderData): HTMLElement {
        const container = document.createElement('div');
        container.className = 'segmented-task';

        // Render segments
        data.segments.forEach((seg, i) => {
            const el = document.createElement('div');
            el.className = 'task-segment';
            el.style.left = `${seg.x}px`;
            el.style.width = `${seg.width}px`;
            el.dataset.segmentId = seg.id;
            el.textContent = seg.name;

            if (i === 0) el.classList.add('first-segment');
            if (i === data.segments.length - 1) el.classList.add('last-segment');

            container.appendChild(el);
        });

        // Render gaps
        data.gaps.forEach(gap => {
            const el = document.createElement('div');
            el.className = 'segment-gap';
            el.style.left = `${gap.x}px`;
            el.style.width = `${gap.width}px`;
            container.appendChild(el);
        });

        return container;
    }
}
```

---

## 9. Interactie met Scheduling

### 9.1 Segment Duration

```javascript
// Totale task duration = som van segment durations
// NIET inclusief gaps

task.duration = task.segments.reduce(
    (total, seg) => total + seg.duration,
    0
);

// Task start/end = eerste segment start / laatste segment end
task.startDate = task.segments[0].startDate;
task.endDate = task.segments[task.segments.length - 1].endDate;
```

### 9.2 Dependencies met Segments

```javascript
// Dependency naar gesegmenteerde task:
// - Eindigt bij laatste segment

// Dependency van gesegmenteerde task:
// - Start bij eerste segment
```

---

## 10. Cross-References

| Document | Relevante Secties |
|----------|-------------------|
| [IMPL-SCHEDULING-ENGINE](./IMPL-SCHEDULING-ENGINE.md) | Duration calculation |
| [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) | Task rendering |
| [DEEP-DIVE-CRITICAL-FEATURES](./DEEP-DIVE-CRITICAL-FEATURES.md) | Time-phased assignments |
| [CLASS-INVENTORY](./CLASS-INVENTORY.md) | EventSegmentModel |

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
