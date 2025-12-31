# TaskBoard Responsive Design - Implementation Guide

> **Uitgebreide documentatie** voor responsive design, zooming, en scroll navigatie in Bryntum TaskBoard.

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Responsive Config](#responsive-config)
3. [Responsive States](#responsive-states)
4. [Zooming (tasksPerRow)](#zooming-tasksperrow)
5. [ZoomSlider Widget](#zoomslider-widget)
6. [Scroll Navigatie](#scroll-navigatie)
7. [Scroll Widgets](#scroll-widgets)
8. [Sticky Headers](#sticky-headers)
9. [TypeScript Interfaces](#typescript-interfaces)
10. [CSS Media Queries](#css-media-queries)
11. [Mobile Optimizations](#mobile-optimizations)
12. [Best Practices](#best-practices)

---

## Overzicht

TaskBoard biedt uitgebreide ondersteuning voor responsive layouts, zooming en scroll navigatie. Dit stelt je in staat om een optimale gebruikerservaring te bieden op alle apparaten.

### Architectuur

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TaskBoard                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Responsive System                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │
│  │  │ Breakpoints │  │   States    │  │     Callbacks       │   │  │
│  │  │ (when: px)  │  │ (configs)   │  │  (dynamic logic)    │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘   │  │
│  │         │                │                    │               │  │
│  │         └────────────────┼────────────────────┘               │  │
│  │                          │                                     │  │
│  │               ┌──────────▼──────────┐                         │  │
│  │               │  responsiveState    │                         │  │
│  │               │  (current state)    │                         │  │
│  │               └──────────┬──────────┘                         │  │
│  │                          │                                     │  │
│  └──────────────────────────┼────────────────────────────────────┘  │
│                             │                                        │
│  ┌──────────────────────────▼────────────────────────────────────┐  │
│  │                    Zoom System                                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │
│  │  │ tasksPerRow │  │ ZoomSlider  │  │  stretchCards       │   │  │
│  │  │ (1, 2, 3+)  │  │  (widget)   │  │  (expand cards)     │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Scroll System                               │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │  │
│  │  │ scrollToTask()  │  │ scrollToColumn()│  │ Scroll Widgets│ │  │
│  │  │ scrollToInters. │  │ scrollToSwiml() │  │ (buttons)     │ │  │
│  │  └─────────────────┘  └─────────────────┘  └───────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Responsive Flow

```
┌─────────────────┐
│ Viewport Resize │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│   Compare width against breakpoints             │
│   (sorted by 'when' value descending)           │
└────────────────────────┬────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │  small   │    │  medium  │    │  large   │
   │ <= 375px │    │ <= 850px │    │ > 850px  │
   └────┬─────┘    └────┬─────┘    └────┬─────┘
        │               │               │
        ▼               ▼               ▼
┌─────────────────────────────────────────────────┐
│   1. Merge with '*' defaults                    │
│   2. Apply config overrides                     │
│   3. Execute callback (if defined)              │
│   4. Fire 'responsiveStateChange' event         │
└─────────────────────────────────────────────────┘
```

---

## Responsive Config

### Basis Configuratie

```javascript
const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Responsive configuratie
    responsive: {
        // State voor kleine schermen
        small: {
            when: 375,  // Actief wanneer width <= 375px

            // Config overrides
            showCountInHeader: false,
            footerItems: {
                resourceAvatars: { hidden: true }
            },

            features: {
                columnToolbars: { disabled: true }
            }
        },

        // State voor medium schermen
        medium: {
            when: 768,  // Actief wanneer width <= 768px

            showCountInHeader: true,
            footerItems: {
                resourceAvatars: { hidden: false }
            }
        },

        // State voor grote schermen (geen 'when' = default)
        large: {
            // Actief wanneer width > 768px (hoogste 'when' waarde)
            showCountInHeader: true,
            footerItems: {
                resourceAvatars: { overlap: true }
            }
        }
    },

    // Basis configuratie
    columns: [
        { id: 'todo', text: 'Todo' },
        { id: 'doing', text: 'Doing' },
        { id: 'done', text: 'Done' }
    ],

    columnField: 'status'
});
```

### Met Callbacks

```javascript
const taskBoard = new TaskBoard({
    responsive: {
        small: {
            when: 375,

            // Configs
            showCountInHeader: false,

            // Callback voor dynamische wijzigingen
            callback({ source, state, prevState }) {
                // source = TaskBoard instance
                // state = 'small'
                // prevState = vorige state

                // Verberg kolommen dynamisch
                source.columns.done.hidden = true;
                source.columns.considering.hidden = true;

                // Pas tasksPerRow aan
                source.tasksPerRow = 1;

                console.log(`Switched from ${prevState} to ${state}`);
            }
        },

        medium: {
            when: 768,

            callback({ source }) {
                source.columns.done.hidden = true;
                source.columns.considering.hidden = false;
                source.tasksPerRow = 2;
            }
        },

        large: {
            callback({ source }) {
                // Herstel alles
                source.columns.done.hidden = false;
                source.columns.considering.hidden = false;
                source.tasksPerRow = 3;
            }
        }
    }
});
```

### Met Default State (*)

```javascript
const taskBoard = new TaskBoard({
    responsive: {
        small: {
            when: 375,

            // Overschrijf defaults
            features: {
                columnToolbars: { disabled: true }
            },
            showCountInHeader: false,
            footerItems: {
                'tags > resourceAvatars': { hidden: true }
            }
        },

        medium: {
            when: 768
            // Gebruikt defaults van '*'
        },

        large: {
            // Gebruikt defaults van '*'
        },

        // Defaults die gelden voor alle states (tenzij overschreven)
        '*': {
            features: {
                columnToolbars: { disabled: false }
            },
            showCountInHeader: true,
            footerItems: {
                'tags > resourceAvatars': { hidden: false }
            }
        }
    }
});
```

---

## Responsive States

### State Bepaling

De responsive state wordt bepaald door de breedte van het TaskBoard element te vergelijken met de `when` waarden:

```javascript
// Pseudo-code voor state bepaling
function determineState(currentWidth, states) {
    // Sorteer states op 'when' waarde (descending)
    const sortedStates = Object.entries(states)
        .filter(([name]) => name !== '*')
        .sort((a, b) => (b[1].when || 0) - (a[1].when || 0));

    // Vind eerste state waar width <= when
    for (const [name, config] of sortedStates) {
        if (config.when && currentWidth <= config.when) {
            return name;
        }
    }

    // Gebruik state zonder 'when' als default
    return sortedStates.find(([, config]) => !config.when)?.[0];
}
```

### Voorbeeld State Progressie

| Viewport Width | Active State | Reason |
|---------------|--------------|--------|
| 320px | `small` | 320 <= 375 |
| 375px | `small` | 375 <= 375 |
| 376px | `narrow` | 376 <= 600 |
| 600px | `narrow` | 600 <= 600 |
| 601px | `medium` | 601 <= 850 |
| 850px | `medium` | 850 <= 850 |
| 851px | `large` | No `when` defined |
| 1920px | `large` | No `when` defined |

### Event Listener

```javascript
const taskBoard = new TaskBoard({
    responsive: {
        small: { when: 375 },
        medium: { when: 768 },
        large: {}
    },

    listeners: {
        responsiveStateChange({ source, state, prevState }) {
            console.log(`Responsive state changed: ${prevState} → ${state}`);

            // Update UI indicator
            document.getElementById('state-indicator').textContent = state;

            // Analytics
            trackEvent('responsive_change', { from: prevState, to: state });
        }
    }
});

// Of programmatisch
taskBoard.on('responsiveStateChange', ({ state }) => {
    document.body.dataset.responsiveState = state;
});
```

### Huidige State Opvragen

```javascript
// Huidige state
const currentState = taskBoard.responsiveState;
console.log(`Current state: ${currentState}`);  // 'small', 'medium', 'large'

// Forceer state evaluatie
taskBoard.updateResponsiveState();
```

---

## Zooming (tasksPerRow)

### Basis Configuratie

```javascript
const taskBoard = new TaskBoard({
    // Aantal kaarten per rij (globaal)
    tasksPerRow: 3,

    columns: [
        { id: 'todo', text: 'Todo' },
        { id: 'doing', text: 'Doing' },
        { id: 'done', text: 'Done' }
    ]
});

// Runtime wijzigen
taskBoard.tasksPerRow = 2;  // 2 kaarten per rij
taskBoard.tasksPerRow = 1;  // 1 kaart per rij (maximale grootte)
```

### Per Kolom/Swimlane

```javascript
const taskBoard = new TaskBoard({
    // Globale default
    tasksPerRow: 3,

    columns: [
        {
            id: 'backlog',
            text: 'Backlog',
            // Meer kaarten in backlog (kleinere kaarten)
            tasksPerRow: 4
        },
        {
            id: 'doing',
            text: 'Doing'
            // Gebruikt globale tasksPerRow: 3
        },
        {
            id: 'done',
            text: 'Done',
            // Minder kaarten in done (grotere kaarten)
            tasksPerRow: 2
        }
    ],

    swimlanes: [
        {
            id: 'urgent',
            text: 'Urgent',
            // Eén grote kaart per rij in urgent swimlane
            tasksPerRow: 1
        },
        {
            id: 'normal',
            text: 'Normal'
            // Gebruikt globale tasksPerRow: 3
        }
    ]
});
```

### stretchCards

```javascript
const taskBoard = new TaskBoard({
    tasksPerRow: 3,

    // Stretch kaarten als er minder zijn dan tasksPerRow
    stretchCards: true,

    // Als een kolom maar 1 taak heeft:
    // - stretchCards: false → kaart neemt 1/3 breedte
    // - stretchCards: true  → kaart neemt volledige breedte
});
```

### Zoom Levels Voorbeeld

```javascript
// Zoom controls
const zoomLevels = [
    { label: 'XS', tasksPerRow: 5 },
    { label: 'S', tasksPerRow: 4 },
    { label: 'M', tasksPerRow: 3 },
    { label: 'L', tasksPerRow: 2 },
    { label: 'XL', tasksPerRow: 1 }
];

let currentLevel = 2;  // Start at 'M'

function zoomIn() {
    if (currentLevel < zoomLevels.length - 1) {
        currentLevel++;
        taskBoard.tasksPerRow = zoomLevels[currentLevel].tasksPerRow;
    }
}

function zoomOut() {
    if (currentLevel > 0) {
        currentLevel--;
        taskBoard.tasksPerRow = zoomLevels[currentLevel].tasksPerRow;
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '+') {
        zoomIn();
        e.preventDefault();
    }
    if (e.ctrlKey && e.key === '-') {
        zoomOut();
        e.preventDefault();
    }
});
```

---

## ZoomSlider Widget

### Basis Gebruik

```javascript
const taskBoard = new TaskBoard({
    tbar: [
        // ZoomSlider widget
        { type: 'zoomslider' }
    ],

    // Initiële waarde
    tasksPerRow: 3
});
```

### Configuratie Opties

```javascript
const taskBoard = new TaskBoard({
    tbar: [
        {
            type: 'zoomslider',

            // Slider configuratie
            min: 1,       // Minimum tasksPerRow
            max: 6,       // Maximum tasksPerRow
            step: 1,      // Stapgrootte

            // Label
            showLabel: true,
            label: 'Zoom',

            // Tooltip
            showTooltip: true,

            // Breedte
            width: 200,

            // Event handlers
            onChange({ value }) {
                console.log(`Zoom changed to ${value} tasks per row`);
            }
        }
    ]
});
```

### Custom Zoom Widget

```javascript
const taskBoard = new TaskBoard({
    tbar: [
        // Zoom out button
        {
            type: 'button',
            icon: 'fa fa-search-minus',
            tooltip: 'Zoom out',
            onClick() {
                if (taskBoard.tasksPerRow < 6) {
                    taskBoard.tasksPerRow++;
                }
            }
        },

        // Zoom indicator
        {
            type: 'label',
            ref: 'zoomLabel',
            text: '3 per row'
        },

        // Zoom in button
        {
            type: 'button',
            icon: 'fa fa-search-plus',
            tooltip: 'Zoom in',
            onClick() {
                if (taskBoard.tasksPerRow > 1) {
                    taskBoard.tasksPerRow--;
                }
            }
        }
    ],

    listeners: {
        // Update label bij wijziging
        tasksPerRowChange({ tasksPerRow }) {
            taskBoard.widgetMap.zoomLabel.text = `${tasksPerRow} per row`;
        }
    }
});
```

---

## Scroll Navigatie

### scrollToTask

```javascript
// Scroll naar specifieke taak
await taskBoard.scrollToTask(404);  // by ID
await taskBoard.scrollToTask('task-123');  // by string ID
await taskBoard.scrollToTask(taskRecord);  // by TaskModel

// Met opties
await taskBoard.scrollToTask(404, {
    animate: true,           // Smooth scroll
    highlight: true,         // Highlight task na scroll
    focus: true,            // Focus task
    block: 'center'         // Positie: 'start', 'center', 'end', 'nearest'
});
```

### scrollToColumn

```javascript
// Scroll naar kolom
await taskBoard.scrollToColumn('done');
await taskBoard.scrollToColumn(columnRecord);

// Met opties
await taskBoard.scrollToColumn('done', {
    animate: { duration: 300 },
    block: 'center'
});
```

### scrollToSwimlane

```javascript
// Scroll naar swimlane
await taskBoard.scrollToSwimlane('high');
await taskBoard.scrollToSwimlane(swimlaneRecord);

// Met opties
await taskBoard.scrollToSwimlane('high', {
    animate: true,
    block: 'start'
});
```

### scrollToIntersection

```javascript
// Scroll naar kruispunt van swimlane en column
await taskBoard.scrollToIntersection('hr', 'q4');
await taskBoard.scrollToIntersection(swimlaneRecord, columnRecord);

// Met opties
await taskBoard.scrollToIntersection('urgent', 'doing', {
    animate: true,
    block: 'center'
});
```

### Scroll Options Type

```typescript
interface BryntumScrollOptions {
    /**
     * Animate the scroll
     */
    animate?: boolean | {
        duration?: number;
        easing?: string;
    };

    /**
     * Positie van element na scroll
     */
    block?: 'start' | 'center' | 'end' | 'nearest';

    /**
     * Highlight element na scroll
     */
    highlight?: boolean;

    /**
     * Focus element na scroll
     */
    focus?: boolean;

    /**
     * Extra padding rond element
     */
    edgeOffset?: number;
}
```

### Scroll Event Handling

```javascript
const taskBoard = new TaskBoard({
    listeners: {
        scroll({ source, scrollLeft, scrollTop }) {
            console.log(`Scrolled to: ${scrollLeft}, ${scrollTop}`);

            // Lazy load bij naderende rand
            if (scrollTop > source.scrollHeight - source.clientHeight - 100) {
                loadMoreTasks();
            }
        }
    }
});

// Programmatisch scrollen
taskBoard.scrollable.scrollTo(0, 500, { animate: true });
```

---

## Scroll Widgets

### SwimlaneScrollButton

```javascript
const taskBoard = new TaskBoard({
    swimlanes: [
        { id: 'high', text: 'High Priority' },
        { id: 'medium', text: 'Medium Priority' },
        { id: 'low', text: 'Low Priority' },
        { id: 'backlog', text: 'Backlog' },
        { id: 'archive', text: 'Archive' }
    ],

    tbar: [
        // Dropdown om naar swimlane te scrollen
        { type: 'swimlaneScrollButton' }
    ]
});
```

### ColumnScrollButton

```javascript
const taskBoard = new TaskBoard({
    columns: [
        { id: 'unplanned', text: 'Unplanned' },
        { id: 'asap', text: 'ASAP' },
        { id: 'q1', text: 'Q1' },
        { id: 'q2', text: 'Q2' },
        { id: 'q3', text: 'Q3' },
        { id: 'q4', text: 'Q4' },
        { id: 'later', text: 'Later' },
        { id: 'finished', text: 'Finished' }
    ],

    tbar: [
        // Dropdown om naar kolom te scrollen
        { type: 'columnScrollButton' }
    ]
});
```

### Gecombineerd Voorbeeld

```javascript
const taskBoard = new TaskBoard({
    columns: [...],  // 8 kolommen
    swimlanes: [...],  // 5 swimlanes

    tbar: [
        // Scroll widgets
        { type: 'swimlaneScrollButton' },
        { type: 'columnScrollButton' },

        // Custom scroll buttons
        {
            type: 'button',
            text: 'Go to HR/Q4',
            onClick() {
                taskBoard.scrollToIntersection('hr', 'q4', {
                    animate: true,
                    highlight: true
                });
            }
        },
        {
            type: 'button',
            text: 'Find My Tasks',
            async onClick() {
                const myTasks = taskBoard.taskStore.query(
                    t => t.assignedTo === currentUser.id
                );

                if (myTasks.length > 0) {
                    await taskBoard.scrollToTask(myTasks[0], {
                        animate: true,
                        highlight: true
                    });
                }
            }
        }
    ]
});
```

---

## Sticky Headers

### Basis Configuratie

```javascript
const taskBoard = new TaskBoard({
    // Maak kolom en swimlane headers sticky
    stickyHeaders: true,

    columns: [...],
    swimlanes: [...]
});
```

### CSS Customization

```css
/* Sticky column headers */
.b-taskboard-column-header.b-sticky {
    top: 0;
    z-index: 10;
    background: var(--taskboard-header-background);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Sticky swimlane headers */
.b-taskboard-swimlane-header.b-sticky {
    position: sticky;
    left: 0;
    z-index: 9;
    background: var(--taskboard-swimlane-background);
}

/* Sticky header hoek (intersection) */
.b-taskboard .b-sticky-corner {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 11;
}
```

### Responsive Sticky Headers

```javascript
const taskBoard = new TaskBoard({
    responsive: {
        small: {
            when: 375,
            // Disable sticky headers op kleine schermen
            stickyHeaders: false
        },
        medium: {
            when: 768,
            stickyHeaders: true
        },
        large: {
            stickyHeaders: true
        }
    }
});
```

---

## TypeScript Interfaces

### ResponsiveState Type

```typescript
interface ResponsiveState {
    /**
     * Breakpoint in pixels
     * State is actief wanneer width <= when
     */
    when?: number;

    /**
     * Callback uitgevoerd bij state change
     */
    callback?: (params: {
        source: TaskBoard;
        state: string;
        prevState: string;
    }) => void;

    /**
     * Config overrides voor deze state
     * Elke TaskBoard config property kan hier overschreven worden
     */
    [configKey: string]: any;
}

interface ResponsiveConfig {
    /**
     * Named states
     */
    [stateName: string]: ResponsiveState;

    /**
     * Default configs (merged met alle states)
     */
    '*'?: Partial<TaskBoardConfig>;
}
```

### TaskBoardConfig Responsive Properties

```typescript
interface TaskBoardConfig {
    /**
     * Responsive configuratie
     */
    responsive?: ResponsiveConfig;

    /**
     * Aantal kaarten per rij
     */
    tasksPerRow?: number;

    /**
     * Stretch kaarten als minder dan tasksPerRow
     */
    stretchCards?: boolean;

    /**
     * Sticky headers aan/uit
     */
    stickyHeaders?: boolean;

    /**
     * Maximum breedte (voor testing)
     */
    maxWidth?: number | null;
}
```

### Scroll Methods

```typescript
interface TaskBoardScroll {
    /**
     * Scroll naar taak
     */
    scrollToTask(
        taskOrId: TaskModel | number | string,
        options?: BryntumScrollOptions
    ): Promise<void>;

    /**
     * Scroll naar kolom
     */
    scrollToColumn(
        columnOrId: ColumnModel | number | string,
        options?: BryntumScrollOptions
    ): Promise<void>;

    /**
     * Scroll naar swimlane
     */
    scrollToSwimlane(
        swimlaneOrId: SwimlaneModel | number | string,
        options?: BryntumScrollOptions
    ): Promise<void>;

    /**
     * Scroll naar kruispunt
     */
    scrollToIntersection(
        swimlaneOrId: SwimlaneModel | number | string,
        columnOrId: ColumnModel | number | string,
        options?: BryntumScrollOptions
    ): Promise<void>;
}
```

### ZoomSlider Config

```typescript
interface ZoomSliderConfig extends SliderConfig {
    type: 'zoomslider';

    /**
     * Minimum tasksPerRow
     */
    min?: number;

    /**
     * Maximum tasksPerRow
     */
    max?: number;

    /**
     * Stapgrootte
     */
    step?: number;

    /**
     * Toon label
     */
    showLabel?: boolean;

    /**
     * Label tekst
     */
    label?: string;

    /**
     * Toon tooltip
     */
    showTooltip?: boolean;

    /**
     * Breedte in px
     */
    width?: number;
}
```

### Events

```typescript
interface TaskBoardEvents {
    /**
     * Fired wanneer responsive state verandert
     */
    responsiveStateChange: (event: {
        source: TaskBoard;
        state: string;
        prevState: string;
    }) => void;

    /**
     * Fired wanneer tasksPerRow verandert
     */
    tasksPerRowChange: (event: {
        source: TaskBoard;
        tasksPerRow: number;
        oldTasksPerRow: number;
    }) => void;

    /**
     * Fired bij scroll
     */
    scroll: (event: {
        source: TaskBoard;
        scrollLeft: number;
        scrollTop: number;
    }) => void;
}
```

---

## CSS Media Queries

### Standaard Breakpoints

```css
/* Extra small devices (phones) */
@media (max-width: 375px) {
    .b-taskboard {
        /* Compacte layout */
        --taskboard-card-padding: 0.5rem;
        --taskboard-column-gap: 0.5rem;
    }

    .b-taskboard-column-header {
        font-size: 0.875rem;
        padding: 0.5rem;
    }

    .b-taskboard-card {
        min-height: 60px;
    }

    /* Verberg niet-essentiële items */
    .b-taskboard-card-footer .b-tags {
        display: none;
    }
}

/* Small devices (landscape phones) */
@media (min-width: 376px) and (max-width: 600px) {
    .b-taskboard {
        --taskboard-card-padding: 0.75rem;
        --taskboard-column-gap: 0.75rem;
    }
}

/* Medium devices (tablets) */
@media (min-width: 601px) and (max-width: 850px) {
    .b-taskboard {
        --taskboard-card-padding: 1rem;
        --taskboard-column-gap: 1rem;
    }
}

/* Large devices (desktops) */
@media (min-width: 851px) {
    .b-taskboard {
        --taskboard-card-padding: 1rem;
        --taskboard-column-gap: 1.25rem;
    }
}
```

### Touch-Specific Styles

```css
/* Detecteer touch devices */
@media (pointer: coarse) {
    /* Grotere touch targets */
    .b-taskboard-card {
        min-height: 80px;
    }

    .b-taskboard-column-header button,
    .b-taskboard-card-header .b-icon {
        min-width: 44px;
        min-height: 44px;
    }

    /* Disable hover effects */
    .b-taskboard-card:hover {
        transform: none;
        box-shadow: none;
    }
}

/* Precise pointer (mouse) */
@media (pointer: fine) {
    .b-taskboard-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
}
```

### Orientation-Based Styles

```css
/* Portrait orientation */
@media (orientation: portrait) {
    .b-taskboard {
        /* Verticale scroll prioriteit */
        overflow-x: auto;
        overflow-y: scroll;
    }

    .b-taskboard-column {
        min-width: 280px;
    }
}

/* Landscape orientation */
@media (orientation: landscape) {
    .b-taskboard {
        /* Horizontale scroll prioriteit */
        overflow-x: scroll;
        overflow-y: auto;
    }

    .b-taskboard-swimlane {
        min-height: 200px;
    }
}
```

---

## Mobile Optimizations

### Touch Drag Handling

```javascript
const taskBoard = new TaskBoard({
    features: {
        taskDrag: {
            // Touch-specifieke configuratie
            touchStartDelay: 150,  // Delay voor drag start op touch

            // Visuele feedback
            dragHelperClass: 'mobile-drag-helper'
        }
    },

    // Disable context menu op mobile
    features: {
        taskMenu: {
            // Gebruik tap i.p.v. long-press
            triggerEvent: 'click'
        }
    }
});

// CSS voor mobile drag
.mobile-drag-helper {
    opacity: 0.9;
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
```

### Swipe Navigation

```javascript
// Swipe detectie met Hammer.js of native
let touchStartX = 0;
let touchEndX = 0;

taskBoard.element.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

taskBoard.element.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
        const columns = taskBoard.columns.allRecords.filter(c => !c.hidden);
        const currentIndex = columns.findIndex(c => isColumnVisible(c));

        if (diff > 0 && currentIndex < columns.length - 1) {
            // Swipe left - next column
            taskBoard.scrollToColumn(columns[currentIndex + 1]);
        } else if (diff < 0 && currentIndex > 0) {
            // Swipe right - previous column
            taskBoard.scrollToColumn(columns[currentIndex - 1]);
        }
    }
}
```

### Pull-to-Refresh

```javascript
let pullStartY = 0;
let pullMoveY = 0;
const threshold = 100;

taskBoard.element.addEventListener('touchstart', (e) => {
    if (taskBoard.scrollable.y === 0) {
        pullStartY = e.touches[0].pageY;
    }
});

taskBoard.element.addEventListener('touchmove', (e) => {
    if (pullStartY) {
        pullMoveY = e.touches[0].pageY;
        const diff = pullMoveY - pullStartY;

        if (diff > 0 && diff < threshold * 2) {
            // Show pull indicator
            showPullIndicator(diff / threshold);
        }
    }
});

taskBoard.element.addEventListener('touchend', async () => {
    if (pullMoveY - pullStartY > threshold) {
        // Trigger refresh
        showLoadingIndicator();
        await taskBoard.project.load();
        hideLoadingIndicator();
    }

    hidePullIndicator();
    pullStartY = 0;
    pullMoveY = 0;
});
```

### Virtual Keyboard Handling

```javascript
// Detecteer virtual keyboard
const initialViewportHeight = window.innerHeight;

window.addEventListener('resize', () => {
    const currentHeight = window.innerHeight;
    const heightDiff = initialViewportHeight - currentHeight;

    if (heightDiff > 150) {
        // Keyboard is waarschijnlijk open
        document.body.classList.add('keyboard-open');

        // Scroll actieve input in view
        const activeElement = document.activeElement;
        if (activeElement?.closest('.b-taskboard')) {
            activeElement.scrollIntoView({ block: 'center' });
        }
    } else {
        document.body.classList.remove('keyboard-open');
    }
});

// CSS
.keyboard-open .b-taskboard {
    /* Reduceer hoogte om keyboard ruimte te geven */
    height: calc(100vh - 300px);
}

.keyboard-open .b-toolbar {
    /* Verberg toolbar tijdens typen */
    display: none;
}
```

---

## Best Practices

### 1. Definieer Alle States

```javascript
// Goed: Expliciete states voor alle breakpoints
const taskBoard = new TaskBoard({
    responsive: {
        mobile: { when: 375 },
        tablet: { when: 768 },
        desktop: { when: 1024 },
        wide: {}  // Default voor >= 1024

        '*': {
            // Defaults
        }
    }
});

// Slecht: Incomplete states
const taskBoard = new TaskBoard({
    responsive: {
        small: { when: 375 }
        // Wat gebeurt er boven 375px?
    }
});
```

### 2. Gebruik Callbacks voor Complexe Logica

```javascript
// Goed: Callback voor dynamische wijzigingen
responsive: {
    mobile: {
        when: 375,
        callback({ source }) {
            // Verberg specifieke kolommen
            source.columns.forEach(col => {
                col.hidden = !['todo', 'doing'].includes(col.id);
            });
        }
    }
}

// Slecht: Proberen kolommen te verbergen via config
responsive: {
    mobile: {
        when: 375,
        columns: [{ id: 'done', hidden: true }]  // Werkt niet!
    }
}
```

### 3. Test Op Echte Devices

```javascript
// Force test modes
const testModes = {
    iphone6: { width: 375, height: 667 },
    iphone12: { width: 390, height: 844 },
    ipad: { width: 768, height: 1024 },
    ipadPro: { width: 1024, height: 1366 }
};

function testResponsiveMode(mode) {
    const { width, height } = testModes[mode];
    taskBoard.maxWidth = width;
    taskBoard.height = height;
    console.log(`Testing ${mode}: ${width}x${height}`);
    console.log(`Current state: ${taskBoard.responsiveState}`);
}
```

### 4. Optimaliseer Performance

```javascript
// Debounce resize handling
let resizeTimeout;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        taskBoard.updateResponsiveState();
    }, 100);
});

// Lazy load content voor grote boards
const taskBoard = new TaskBoard({
    project: {
        loadUrl: 'api/tasks',
        autoLoad: true,
        pageSize: 50  // Laad in chunks
    }
});
```

### 5. Accessibility

```javascript
// Keyboard navigation voor scroll
document.addEventListener('keydown', (e) => {
    if (!e.target.closest('.b-taskboard')) return;

    switch (e.key) {
        case 'ArrowRight':
            scrollToNextColumn();
            break;
        case 'ArrowLeft':
            scrollToPrevColumn();
            break;
        case 'ArrowDown':
            scrollToNextSwimlane();
            break;
        case 'ArrowUp':
            scrollToPrevSwimlane();
            break;
    }
});

// ARIA announcements
taskBoard.on('responsiveStateChange', ({ state }) => {
    announceToScreenReader(`Layout changed to ${state} view`);
});
```

---

## Complete Implementatie Voorbeeld

```javascript
import { TaskBoard } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Responsive configuratie
    responsive: {
        mobile: {
            when: 480,
            showCountInHeader: false,
            tasksPerRow: 1,

            features: {
                columnToolbars: { disabled: true },
                columnHeaderMenu: { disabled: true }
            },

            footerItems: {
                resourceAvatars: { hidden: true }
            },

            callback({ source }) {
                // Toon alleen essentiële kolommen
                source.columns.forEach(col => {
                    col.hidden = !['todo', 'doing', 'done'].includes(col.id);
                });
            }
        },

        tablet: {
            when: 768,
            showCountInHeader: true,
            tasksPerRow: 2,

            callback({ source }) {
                source.columns.forEach(col => col.hidden = false);
            }
        },

        desktop: {
            when: 1024,
            tasksPerRow: 3,
            stretchCards: true
        },

        wide: {
            tasksPerRow: 4,
            stretchCards: false,

            callback({ source }) {
                source.columns.forEach(col => col.hidden = false);
            }
        },

        '*': {
            showCountInHeader: true,
            stickyHeaders: true,
            features: {
                columnToolbars: { disabled: false },
                columnHeaderMenu: { disabled: false }
            },
            footerItems: {
                resourceAvatars: { overlap: true }
            }
        }
    },

    // Columns
    columns: [
        { id: 'backlog', text: 'Backlog', color: 'gray' },
        { id: 'todo', text: 'To Do', color: 'blue' },
        { id: 'doing', text: 'In Progress', color: 'orange' },
        { id: 'review', text: 'Review', color: 'purple' },
        { id: 'done', text: 'Done', color: 'green' }
    ],

    columnField: 'status',

    // Swimlanes
    swimlanes: [
        { id: 'high', text: 'High Priority', color: 'red' },
        { id: 'medium', text: 'Medium Priority', color: 'yellow' },
        { id: 'low', text: 'Low Priority', color: 'green' }
    ],

    swimlaneField: 'priority',

    // Toolbar
    tbar: [
        { type: 'zoomslider' },
        '-',
        { type: 'swimlaneScrollButton' },
        { type: 'columnScrollButton' },
        '->',
        {
            type: 'label',
            ref: 'stateLabel',
            text: 'desktop'
        }
    ],

    // Event handlers
    listeners: {
        responsiveStateChange({ state }) {
            taskBoard.widgetMap.stateLabel.text = state;

            // Track analytics
            if (window.gtag) {
                gtag('event', 'responsive_change', { state });
            }
        }
    },

    // Data
    project: {
        loadUrl: 'api/tasks',
        autoLoad: true
    }
});

// Expose for debugging
window.taskBoard = taskBoard;
```

---

## Gerelateerde Documentatie

- [TASKBOARD-DEEP-DIVE-COLUMNS.md](./TASKBOARD-DEEP-DIVE-COLUMNS.md) - Column configuratie
- [TASKBOARD-DEEP-DIVE-CARDS.md](./TASKBOARD-DEEP-DIVE-CARDS.md) - Card rendering
- [TASKBOARD-IMPL-THEMING.md](./TASKBOARD-IMPL-THEMING.md) - Theming en CSS
- [CALENDAR-IMPL-RESPONSIVE.md](./CALENDAR-IMPL-RESPONSIVE.md) - Calendar responsive (vergelijkbaar)

---

*Laatst bijgewerkt: December 2024*
*Document versie: 1.0*
*Bryntum TaskBoard versie: 7.1.0*
