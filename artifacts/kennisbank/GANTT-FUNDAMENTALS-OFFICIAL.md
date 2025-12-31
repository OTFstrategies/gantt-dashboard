# Bryntum Gantt Fundamentals - Official Guide

> **Bron**: Officiële Bryntum Gantt v7.1.0 documentatie - basics & advanced guides

---

## Deel 1: Event Handling

### Waar Events Te Vinden

Events staan onderaan elke class documentatie pagina. Klik op rode "e" icoon bovenaan elke class.

### Listeners Tijdens Constructie

```javascript
const gantt = new Gantt({
    listeners: {
        taskclick: myTaskClickFn
    }
});
```

### Met thisObj

```javascript
const gantt = new Gantt({
    listeners: {
        taskclick: 'myTaskClickFn',
        thisObj: this
    }
});
```

### Meerdere Listeners

```javascript
const gantt = new Gantt({
    listeners: {
        taskclick: 'myTaskClickFn',
        taskdblclick: 'myTaskDblClickFn',
        thisObj: this
    }
});
```

### ES6 Inline Syntax

```javascript
const gantt = new Gantt({
    listeners: {
        taskclick() {
            console.log('clicked');
        }
    }
});
```

### Listeners Na Constructie

```javascript
// Korte syntax
gantt.on('taskclick', () => console.log('click'));

// Met thisObj
gantt.on('taskclick', this.onTaskClick, this);

// Config object
gantt.on({
    taskclick: 'onTaskClick',
    taskdblclick: 'onTaskDblClick',
    thisObj: this
});
```

### on[EventName] Pattern

```javascript
const gantt = new Gantt({
    onTaskClick() {
        console.log('Task click');
    }
});

// Of runtime
gantt.onTaskClick = () => console.log('Task click');
```

### Listener Opties

**once** - Eenmalig listener:
```javascript
gantt.on({
    taskclick() {
        // Alleen eerste keer
    },
    once: true
});
```

**prio** - Listener prioriteit:
```javascript
store.on({
    load() {
        // Vóór normale listeners
    },
    prio: 100
});
```

**catchAll** - Alle events:
```javascript
gantt.on({
    catchAll(event) {
        // Alle events passeren hier
    }
});
```

### Events Voorkomen

```javascript
onBeforeTaskEdit(event) {
    if (someCondition) {
        return false;  // Voorkomt actie
    }
}
```

---

## Deel 2: Gantt Features Overzicht

Features zijn classes die functionaliteit toevoegen aan Gantt.

### Standaard ENABLED Features

| Feature | Beschrijving |
|---------|-------------|
| **CellEdit** | Cell editing in grid |
| **CriticalPaths** | Kritieke pad highlighting |
| **Dependencies** | Dependency lijnen |
| **ProjectLines** | Project start/eind lijnen |
| **TaskCopyPaste** | Ctrl+C/X/V voor taken |
| **TaskDrag** | Taken slepen in timeline |
| **TaskDragCreate** | Ongeplande taken inplannen |
| **TaskEdit** | Task editor dialog |
| **TaskMenu** | Context menu (rechter muisklik) |
| **TaskResize** | Taken resizen (duur wijzigen) |
| **TaskSegmentDrag** | Task segmenten slepen |
| **TaskSegmentResize** | Task segmenten resizen |
| **TaskTooltip** | Tooltip bij hover |
| **ColumnLines** | Kolom lijnen in timeline |
| **TimeAxisHeaderMenu** | Context menu voor tijdas |

### Standaard DISABLED Features

| Feature | Beschrijving |
|---------|-------------|
| **Baselines** | Baseline weergave onder taken |
| **Indicators** | Iconen voor verschillende datums |
| **Labels** | Labels voor taken |
| **MspExport** | Export naar MS Project (geen server) |
| **ParentArea** | Highlight parent task area |
| **PdfExport** | PDF/PNG generatie |
| **Print** | Browser print dialog |
| **ProgressLine** | Project voortgangslijn |
| **ProjectEdit** | Project info dialog |
| **Rollups** | Rollup weergave op parent |
| **ScrollButtons** | Scroll-to-view knoppen |
| **Summary** | Summary bar in footer |
| **TaskNonWorkingTime** | Non-working time per task |
| **TimelineChart** | S-curve chart |
| **TreeGroup** | Tree grouping |
| **Versions** | Snapshot versioning |
| **HeaderZoom** | Zoom via header drag |
| **NonWorkingTime** | Weekend/feestdag highlighting |
| **Pan** | Timeline pannen met muis |
| **TimeRanges** | Tijd ranges en zones |

### Feature Importeren (Sources/Thin Bundle)

```javascript
import Gantt from 'PATH_TO_SOURCE/Gantt/view/Gantt.js';
import 'PATH_TO_SOURCE/Gantt/feature/Baselines.js';

const gantt = new Gantt({
    features: {
        baselines: {
            // config
        }
    }
});
```

---

## Deel 3: Debugging

### Console Queries

```javascript
// Widget op type
theScheduler = bryntum.query('scheduler', true);

// Alle matching widgets
const all = bryntum.queryAll('gantt');

// Widget van DOM element
theCombo = bryntum.fromElement($0);

// Widget op id
theCalendar = bryntum.get('app-calendar');
```

### Component Tree Navigatie

```javascript
// Parent widget vinden
theEditor = theCombo.up('popup', true);

// Store queries
multiAssigned = theScheduler.eventStore.getRange()
    .filter(e => e.resources.length > 1);
```

### Conditional Breakpoints

```javascript
// Eerst: zet flag (breekt niet)
(window.doBreak = 1), 0

// Later: conditional breakpoint
window.doBreak  // Breekt alleen als flag gezet
```

### Event Discovery via catchAll

```javascript
myCalendar.on('catchAll', (e) => {
    if (e.type.endsWith('click')) console.dir(e);
});
```

### Focus Debugging (Chrome)

Gebruik "Emulate a focused page" in Elements tab > Rendering:
- Houdt focus in applicatie tijdens debuggen
- Nuttig voor EventEditor/TaskEditor die verdwijnen bij focus loss

---

## Deel 4: Accessibility (a11y)

### WCAG 2.1 Compliance

- Alt text voor images
- High Contrast thema (Q3 2025)
- Browser zoom support
- Correcte heading structuur
- Beschrijvende links
- ARIA-compliant grids
- Keyboard alternatieven voor alle mouse acties
- Labels voor alle input fields en buttons
- Tooltip content aangekondigd bij focus

### Widget ARIA Configs

```javascript
{
    ariaElement: 'element',     // Hoofd ARIA element
    role: 'grid',               // ARIA role
    ariaLabel: 'My Grid',       // aria-label
    ariaDescription: 'Desc',    // aria-describedby
    ariaHasPopup: 'menu'        // Popup indicator
}
```

### Keyboard Navigation - Grid/Gantt

| Toets | Actie |
|-------|-------|
| ↑ ↓ ← → | Navigeer cellen |
| Space | Context menu |
| Enter | Cell editor openen |
| Escape | Naar cell element |
| Page Up/Down | Pagina omhoog/omlaag |
| Home | Eerste cell in rij |
| End | Laatste cell in rij |
| Ctrl+Home | Eerste cell |
| Ctrl+End | Laatste cell |

### Tree Feature Keys

| Toets | Actie |
|-------|-------|
| Shift+← | Node inklappen |
| Shift+→ | Node uitklappen |

### Filter Feature

| Toets | Actie |
|-------|-------|
| F | Filter field tonen (op kolom header) |

### Search Feature

| Toets | Actie |
|-------|-------|
| F3 / Ctrl+G | Volgende hit |
| Shift+F3 / Ctrl+Shift+G | Vorige hit |

### Widget Keyboard

**Combo**: ↓ toont listbox, ↑↓ navigeert, Enter selecteert

**DateField**: Shift+↓/↑ voor nudge, ↓ toont date picker

**TimeField**: ↓↑ increment/decrement, Space toont picker

**Popup**: Tab trapped binnen popup, Escape sluit

---

## Deel 5: Inactive Tasks

### Concept

Inactive tasks worden uitgesloten van scheduling:
- Pushen geen actieve successors
- Rollen niet op naar actieve parents
- Geen resource allocation effect
- Niet in Resource Histogram

### Visueel

- Strike-out in grid
- Grijs gekleurd in timeline

### API

```javascript
// Via field
task.inactive = true;

// Via method (async)
await task.setInactive(true);
```

### UI Opties

1. **InactiveColumn** - Checkbox kolom
2. **Task Editor** - Inactive checkbox in Advanced tab

### Interactie met Features

- **CriticalPaths**: Inactive taken nooit in critical path
- **Rollups**: Niet getoond op actieve parents
- **ProgressLine**: Behandeld als niet gestart

---

## Deel 6: Resource Costs

### Resource Types

1. **Work** (default) - Contribueert effort (worker, equipment)
2. **Cost** - Vaste kosten (taxes, travel, lodging)
3. **Material** - Materiaal verbruik (cement, wood)

### Cost Berekening

**Work**: `rate × effort` (bv. $20/uur × 8 uur = $160)
**Material**: `rate × quantity` (bv. $155/ton × 2 ton = $310)
**Cost**: Directe waarde op assignment

### Rate Tables

Resources kunnen meerdere rate tables hebben:

```javascript
const rateTable = worker.addRateTable({
    name: '10% off rates',
    rates: [{
        startDate: new Date(),
        standardRate: 10
    }]
});

// Rate toevoegen
rateTable.addRate({
    startDate: new Date(),
    standardRate: 10
});
```

### Rate Table Toewijzen

```javascript
// Aan assignment
assignment.rateTable = rateTable;

// Of async
await assignment.setRateTable(rateTable);
```

### Cost Resources Voorbeeld

```javascript
// Cost-type resources maken
const [airfare, lodging] = project.resourceStore.add([
    { type: 'cost', name: 'Airfare' },
    { type: 'cost', name: 'Lodging' }
]);

// Toewijzen met kosten
project.assignmentStore.add([
    { event: task1, resource: airfare, cost: 250 },
    { event: task1, resource: lodging, cost: 1000 }
]);

// Totalen bekijken
console.log(task1.cost);    // $1250
console.log(airfare.cost);  // Total airfare across project
```

### Cost Accrual

```javascript
resource.costAccrual = 'prorated';  // Verdeeld over duur (default)
resource.costAccrual = 'start';     // Bij task start
resource.costAccrual = 'end';       // Bij task eind
```

### Data Load Voorbeeld

```json
{
    "resources": {
        "rows": [{
            "id": 1,
            "name": "Celia",
            "defaultRateTable": 101,
            "costAccrual": "start",
            "rateTables": [{
                "id": 101,
                "name": "Default",
                "rates": [{
                    "startDate": "2025-01-01",
                    "standardRate": 40,
                    "standardRateEffortUnit": "hour",
                    "perUseCost": 5
                }]
            }]
        }]
    }
}
```

---

## Deel 7: Component Sizing

### CSS Sizing (Aanbevolen)

**Fixed size**:
```css
.b-gantt {
    width: 800px;
    height: 600px;
}
```

**Parent block layout**:
```css
.b-gantt {
    width: 100%;
    height: 100%;
}
```

**Parent flex column**:
```css
.b-gantt {
    flex: 1;      /* Bepaalt height */
    width: 100%;
}
```

**Parent flex row**:
```css
.b-gantt {
    height: 100%;
    flex: 1;      /* Bepaalt width */
}
```

### Programmatisch

```javascript
const gantt = new Gantt({
    width: 800,      // 800px
    height: '30em'
});
```

### Gerelateerde Properties

- `minWidth`, `minHeight`
- `maxWidth`, `maxHeight`
- `flex`

### Auto Height

```javascript
const gantt = new Gantt({
    autoHeight: true
});
```

**Let op**: Schakelt virtualization uit - alleen voor kleine datasets!

---

## Quick Reference: Event Categories

### Task Events
- `taskClick`, `taskDblClick`, `taskContextMenu`
- `beforeTaskEdit`, `taskEdit`
- `beforeTaskDelete`, `taskDelete`
- `taskDrag`, `taskDrop`, `taskResizeStart`, `taskResizeEnd`

### Dependency Events
- `dependencyClick`, `dependencyDblClick`
- `beforeDependencyAdd`, `dependencyAdd`
- `beforeDependencyDelete`, `dependencyDelete`

### Store Events
- `load`, `beforeLoad`, `loadFail`
- `add`, `remove`, `update`
- `beforeSync`, `sync`, `syncFail`

### Project Events
- `dataReady`, `beforeDataChange`
- `progress`, `refresh`
- `scheduleChange`

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
