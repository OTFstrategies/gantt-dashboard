# SchedulerPro Implementation: Split Events

> **Implementatie guide** voor event splitting in Bryntum SchedulerPro: discontinuous work, event segments, auto-merge, en segment editing.

---

## Overzicht

Split events maken het mogelijk om onderbroken werk te visualiseren:

- **Event Segments** - Een event opgesplitst in meerdere tijdblokken
- **Gaps** - Niet-werk periodes tussen segmenten
- **Auto-Merge** - Automatisch samenvoegen van aangrenzende segmenten
- **Segment Editing** - Individuele segmenten bewerken/verplaatsen
- **Visual Tracing** - Verbindingslijnen tussen segmenten

---

## 1. Concept

### 1.1 Wat zijn Split Events?

Een split event is een enkel event dat uit meerdere segmenten bestaat. Dit is nuttig voor:

- Werk dat wordt onderbroken (pauzes, andere taken)
- Taken die over meerdere dagen lopen met gaps
- Maintenance werk met wachttijden
- Logistieke operaties met tussenliggende periodes

```
Event: "Delivery Task"
┌──────┐        ┌──────────┐        ┌──────┐
│ Seg1 │ (gap)  │   Seg2   │ (gap)  │ Seg3 │
└──────┘        └──────────┘        └──────┘
03:00   04:00   05:00      07:00    12:00  13:00
```

---

## 2. Data Structure

### 2.1 Event met Segments

```json
{
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Arrive",
                "startDate": "2020-03-23T03:00",
                "duration": 2,
                "durationUnit": "hour",
                "eventColor": "blue",
                "segments": [
                    {
                        "id": 1,
                        "startDate": "2020-03-23T03:00",
                        "duration": 1,
                        "durationUnit": "hour"
                    },
                    {
                        "id": 2,
                        "startDate": "2020-03-23T05:00",
                        "duration": 1,
                        "durationUnit": "hour"
                    }
                ]
            },
            {
                "id": 2,
                "name": "Unload",
                "startDate": "2020-03-23T07:00",
                "duration": 4,
                "durationUnit": "hour",
                "eventColor": "red",
                "segments": [
                    {
                        "id": 21,
                        "startDate": "2020-03-23T07:00",
                        "duration": 1,
                        "durationUnit": "hour"
                    },
                    {
                        "id": 22,
                        "startDate": "2020-03-23T09:00",
                        "duration": 2,
                        "durationUnit": "hour"
                    },
                    {
                        "id": 23,
                        "startDate": "2020-03-23T12:00",
                        "duration": 1,
                        "durationUnit": "hour"
                    }
                ]
            }
        ]
    }
}
```

### 2.2 Segment Properties

```javascript
// Elk segment heeft:
{
    id: 1,                           // Unieke segment ID
    startDate: '2020-03-23T03:00',   // Segment start
    endDate: '2020-03-23T04:00',     // Of endDate
    duration: 1,                      // Of duration
    durationUnit: 'hour',
    name: 'First part',              // Optioneel: segment naam
    cls: 'custom-segment'            // Optioneel: custom CSS class
}
```

---

## 3. Basic Configuration

### 3.1 Scheduler Setup

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',
    startDate: '2020-03-23',
    endDate: '2020-03-24',
    rowHeight: 60,
    barMargin: 15,
    viewPreset: 'hourAndDay',
    eventStyle: 'traced',  // Visual style voor traced lines

    project: {
        autoLoad: true,
        loadUrl: './data/data.json'
    },

    features: {
        eventDrag: {
            // Voorkom reassignment via drag
            constrainDragToResource: true
        },
        stickyEvents: false
    }
});
```

### 3.2 Event Style: Traced

De `traced` event style voegt visuele verbindingslijnen toe tussen segmenten:

```javascript
eventStyle: 'traced'  // Toont lines tussen segmenten
```

Andere opties:
- `plain` - Standaard stijl
- `rounded` - Rounded corners
- `calendar` - Calendar-achtige stijl

---

## 4. Auto-Merge Configuration

### 4.1 Project Level Setting

```javascript
project: {
    autoLoad: true,
    loadUrl: './data/data.json',

    // Automatisch samenvoegen van aangrenzende segmenten
    autoMergeAdjacentSegments: true
}
```

### 4.2 Toggle via UI

```javascript
tbar: [
    {
        type: 'slidetoggle',
        text: 'Auto-merge adjacent segments',
        checked: true,
        tooltip: 'If two segments are placed next to each other, merge them',

        onChange({ checked }) {
            scheduler.project.autoMergeAdjacentSegments = checked;
        }
    }
]
```

---

## 5. Event Renderer

### 5.1 Segment-aware Renderer

```javascript
eventRenderer({ eventRecord }) {
    // eventRecord kan een segment zijn of het parent event
    // Bij segment: eventRecord.event geeft het parent event

    const name = eventRecord.name || eventRecord.event?.name;

    return StringHelper.encodeHtml(name);
}
```

### 5.2 Rendering verschil Event vs Segment

```javascript
eventRenderer({ eventRecord, renderData }) {
    // Check of dit een segment is
    const isSegment = eventRecord.isEventSegment;
    const parentEvent = eventRecord.event;  // Alleen voor segments

    if (isSegment) {
        // Dit is een individueel segment
        return {
            children: [
                {
                    class: 'segment-name',
                    text: eventRecord.name || `Part ${eventRecord.segmentIndex + 1}`
                },
                {
                    class: 'segment-times',
                    text: `${DateHelper.format(eventRecord.startDate, 'HH:mm')} - ${DateHelper.format(eventRecord.endDate, 'HH:mm')}`
                }
            ]
        };
    }

    // Regulier event (zonder segments)
    return eventRecord.name;
}
```

---

## 6. Segment Operations

### 6.1 Programmatisch Aanmaken

```javascript
// Event ophalen
const event = scheduler.eventStore.getById(1);

// Segments toevoegen
event.segments = [
    {
        id: 's1',
        startDate: new Date(2020, 2, 23, 8, 0),
        duration: 2,
        durationUnit: 'hour'
    },
    {
        id: 's2',
        startDate: new Date(2020, 2, 23, 11, 0),
        duration: 3,
        durationUnit: 'hour'
    }
];
```

### 6.2 Segment Toevoegen

```javascript
const event = scheduler.eventStore.getById(1);

// Voeg nieuw segment toe
event.segments = [
    ...event.segments,
    {
        id: 's3',
        startDate: new Date(2020, 2, 23, 16, 0),
        duration: 1,
        durationUnit: 'hour'
    }
];
```

### 6.3 Segment Verwijderen

```javascript
const event = scheduler.eventStore.getById(1);

// Filter segment uit
event.segments = event.segments.filter(s => s.id !== 's2');
```

### 6.4 Segment Bewerken

```javascript
const event = scheduler.eventStore.getById(1);
const segment = event.segments[0];

// Update segment timing
segment.startDate = new Date(2020, 2, 23, 9, 0);
segment.duration = 3;
```

---

## 7. Split Event via Context Menu

### 7.1 SplitEvent Feature

```javascript
features: {
    eventMenu: {
        items: {
            // Standaard split menu item
            splitEvent: true  // Enabled by default

            // Of customized
            splitEvent: {
                text: 'Split this event',
                icon: 'fa fa-scissors'
            }
        }
    }
}
```

### 7.2 Custom Split Logic

```javascript
features: {
    eventMenu: {
        items: {
            customSplit: {
                text: 'Split at cursor',
                icon: 'fa fa-cut',

                onItem({ eventRecord, date }) {
                    // Split event op cursor positie
                    const splitDate = date;

                    if (splitDate > eventRecord.startDate &&
                        splitDate < eventRecord.endDate) {

                        // Bereken segment duraties
                        const firstDuration = splitDate - eventRecord.startDate;
                        const secondDuration = eventRecord.endDate - splitDate;

                        // Maak segments
                        eventRecord.segments = [
                            {
                                id: `${eventRecord.id}_s1`,
                                startDate: eventRecord.startDate,
                                duration: firstDuration,
                                durationUnit: 'ms'
                            },
                            {
                                id: `${eventRecord.id}_s2`,
                                startDate: splitDate,
                                duration: secondDuration,
                                durationUnit: 'ms'
                            }
                        ];
                    }
                }
            }
        }
    }
}
```

---

## 8. Segment Styling

### 8.1 CSS voor Segments

```css
/* Traced style voor segment verbindingen */
.b-sch-event-wrap.b-sch-style-traced {
    .b-sch-event {
        border: none;
        background: var(--event-color);
    }

    /* Verbindingslijn tussen segmenten */
    &::after {
        content: '';
        position: absolute;
        height: 2px;
        background: var(--event-color);
        opacity: 0.5;
    }
}

/* Eerste segment */
.b-event-segment-first {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}

/* Laatste segment */
.b-event-segment-last {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}

/* Middelste segmenten */
.b-event-segment-middle {
    border-radius: 0;
}

/* Custom segment styling */
.b-sch-event-segment {
    min-width: 20px;
}

.b-sch-event-segment.b-sch-event-hover {
    filter: brightness(1.1);
}
```

---

## 9. Drag & Drop Segments

### 9.1 Segment Drag Configuration

Segments kunnen individueel verplaatst worden:

```javascript
features: {
    eventDrag: {
        constrainDragToResource: true,

        // Validatie voor segment drag
        validatorFn({ eventRecords, startDate, endDate }) {
            const segment = eventRecords[0];

            // Check of segment een segment is
            if (segment.isEventSegment) {
                const parentEvent = segment.event;

                // Voorkom overlap met andere segmenten
                for (const otherSeg of parentEvent.segments) {
                    if (otherSeg !== segment) {
                        if (DateHelper.intersectSpans(
                            startDate, endDate,
                            otherSeg.startDate, otherSeg.endDate
                        )) {
                            return {
                                valid: false,
                                message: 'Segments cannot overlap'
                            };
                        }
                    }
                }
            }

            return true;
        }
    }
}
```

---

## 10. TypeScript Interfaces

```typescript
import { EventModel, Model } from '@bryntum/schedulerpro';

// Segment Data
interface EventSegmentData {
    id: string | number;
    startDate: Date | string;
    endDate?: Date | string;
    duration?: number;
    durationUnit?: string;
    name?: string;
    cls?: string;
}

// Event met Segments
interface SplitEventData {
    id: string | number;
    name: string;
    startDate: Date | string;
    endDate?: Date | string;
    duration?: number;
    durationUnit?: string;
    segments?: EventSegmentData[];
    resourceId: string | number;
}

// Event Segment Model
interface EventSegment extends Model {
    id: string | number;
    startDate: Date;
    endDate: Date;
    duration: number;
    durationUnit: string;
    name: string;
    event: SplitEvent;           // Parent event
    isEventSegment: true;
    segmentIndex: number;
    isFirst: boolean;
    isLast: boolean;
}

// Split Event Model
interface SplitEvent extends EventModel {
    segments: EventSegment[];
    hasSegments: boolean;
}

// Project Config
interface SplitEventProjectConfig {
    autoMergeAdjacentSegments?: boolean;
}

// Renderer Context
interface SegmentRendererContext {
    eventRecord: EventModel | EventSegment;
    renderData: object;
}
```

---

## 11. Complete Example

```javascript
import { SchedulerPro, StringHelper, DateHelper } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',
    startDate: '2020-03-23',
    endDate: '2020-03-24',
    rowHeight: 60,
    barMargin: 15,
    viewPreset: 'hourAndDay',
    eventStyle: 'traced',

    project: {
        autoLoad: true,
        loadUrl: './data/data.json',
        autoMergeAdjacentSegments: true
    },

    columns: [
        {
            text: 'Resource',
            width: 150,
            field: 'name',
            htmlEncode: false,
            renderer: ({ record }) => ({
                children: [
                    record.icon && {
                        tag: 'i',
                        className: `fa fa-fw ${record.icon}`,
                        style: 'margin-right: .5em'
                    },
                    record.name
                ]
            })
        }
    ],

    features: {
        eventDrag: {
            constrainDragToResource: true
        },
        stickyEvents: false,

        eventMenu: {
            items: {
                splitEvent: true,

                // Custom merge item
                mergeSegments: {
                    text: 'Merge all segments',
                    icon: 'fa fa-compress',
                    weight: 210,

                    onItem({ eventRecord }) {
                        if (eventRecord.segments?.length > 1) {
                            // Verwijder segments - event wordt weer continu
                            eventRecord.segments = null;
                        }
                    }
                }
            }
        }
    },

    eventRenderer({ eventRecord }) {
        // Toon naam van segment of parent event
        const name = eventRecord.name || eventRecord.event?.name;

        // Toon segment index indien segment
        if (eventRecord.isEventSegment) {
            const index = eventRecord.segmentIndex + 1;
            const total = eventRecord.event.segments.length;
            return `${StringHelper.encodeHtml(name)} (${index}/${total})`;
        }

        return StringHelper.encodeHtml(name);
    },

    tbar: [
        {
            type: 'slidetoggle',
            text: 'Auto-merge adjacent segments',
            checked: true,
            tooltip: 'Merge segments when placed next to each other',

            onChange({ checked }) {
                scheduler.project.autoMergeAdjacentSegments = checked;
            }
        },
        '->',
        {
            type: 'button',
            text: 'Add split event',
            icon: 'fa fa-plus',

            onClick() {
                // Voeg nieuw split event toe
                scheduler.eventStore.add({
                    id: 'new-split',
                    name: 'New Split Task',
                    resourceId: 1,
                    startDate: '2020-03-23T14:00',
                    segments: [
                        {
                            id: 'ns1',
                            startDate: '2020-03-23T14:00',
                            duration: 1,
                            durationUnit: 'hour'
                        },
                        {
                            id: 'ns2',
                            startDate: '2020-03-23T16:00',
                            duration: 2,
                            durationUnit: 'hour'
                        }
                    ]
                });
            }
        }
    ]
});
```

---

## 12. Best Practices

### 12.1 Wanneer Split Events Gebruiken

- **Wel**: Onderbroken werk, maintenance met wachttijd, gefaseerde taken
- **Niet**: Taken die parallel lopen (gebruik multi-assignment)
- **Niet**: Recurring events (gebruik recurrence feature)

### 12.2 Performance Tips

- Beperk aantal segmenten per event (max 5-10)
- Gebruik `autoMergeAdjacentSegments` om fragmentatie te voorkomen
- Vermijd extreem korte segmenten

### 12.3 UX Considerations

- Maak duidelijk dat segmenten bij hetzelfde event horen
- Toon visuele verbinding (traced style)
- Geef feedback bij split/merge operaties

---

## Referenties

- Examples: `schedulerpro-7.1.0-trial/examples/split-events/`
- API: EventModel.segments
- API: Project.autoMergeAdjacentSegments
- Feature: Split Event Menu

---

*Document gegenereerd: December 2024*
*Bryntum SchedulerPro versie: 7.1.0*
