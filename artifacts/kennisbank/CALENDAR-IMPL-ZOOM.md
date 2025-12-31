# Calendar Implementation: Day Zoom

> **Implementatie guide** voor zoom functionaliteit in Bryntum Calendar: hour height controle, fit hours mode, slider controls, en mouse wheel zoom.

---

## Overzicht

Day Zoom biedt flexibele zoom controls voor dag/week views:

- **Hour Height** - Variabele hoogte per uur (20-500px)
- **Fit Hours** - Automatisch passen in viewport
- **Slider Control** - UI control voor zoom level
- **Mouse Wheel Zoom** - CTRL + scroll voor zoom
- **Smooth Animation** - Frame-based updates

---

## 1. Basic Configuration

### 1.1 Calendar Setup

```javascript
import { Calendar } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo: 'container',
    date: new Date(2020, 9, 12),

    crudManager: {
        loadUrl: 'data/data.json',
        autoLoad: true
    },

    // Overlay sidebar voor meer ruimte
    overlaySidebar: true,

    modes: {
        day: null,
        month: null,
        year: null,
        agenda: null,

        week: {
            // Initial hour height
            hourHeight: 42,

            // Enable mouse wheel zoom
            zoomOnMouseWheel: true,

            listeners: {
                layoutUpdate: 'up.onWeekviewLayout'
            }
        }
    }
});
```

---

## 2. Hour Height Slider

### 2.1 Sidebar Slider Configuration

```javascript
sidebar: {
    items: {
        hourHeightSlider: {
            weight: 110,
            type: 'slider',
            label: 'Hour height',
            labelWidth: '6em',

            // Slider range
            value: 42,
            min: 20,
            max: 500,
            step: 1,

            // UI options
            showValue: false,
            showTooltip: true,

            // Real-time updates tijdens drag
            triggerChangeOnInput: true,

            onChange: 'up.onRowHeightChange'
        }
    }
}
```

### 2.2 Change Handler

```javascript
onRowHeightChange({ source }) {
    // Zoom naar nieuwe height
    this.activeView.zoomTo?.(source.value);

    // Zet fitHours uit
    this.widgetMap.fitHeightCheckbox.value = false;
}
```

---

## 3. Fit Hours Mode

### 3.1 Toggle Configuration

```javascript
sidebar: {
    items: {
        fitHeightCheckbox: {
            type: 'slidetoggle',
            weight: 120,
            label: 'Fit hours',
            labelWidth: '6em',
            checked: false,

            onChange: 'up.onFitHoursCheckChange'
        }
    }
}
```

### 3.2 Fit Hours Handler

```javascript
onFitHoursCheckChange({ checked }) {
    this.activeView.fitHours = checked;
}
```

---

## 4. Layout Synchronization

### 4.1 Keep Slider in Sync

```javascript
onWeekviewLayout({ source: weekView }) {
    const { hourHeightSlider } = this.widgetMap;

    // Suspend events tijdens sync om loops te voorkomen
    if (weekView.fitHours) {
        hourHeightSlider.suspendEvents();
    }

    hourHeightSlider.value = weekView.hourHeight;

    if (weekView.fitHours) {
        hourHeightSlider.resumeEvents();
    }
}
```

### 4.2 Frame-based Updates

```javascript
// Throttle slider changes voor smooth animation
calendar.onRowHeightChange = calendar.createOnFrame(
    calendar.onRowHeightChange,
    [],      // No args
    calendar, // Context
    true     // Cancel pending
);
```

---

## 5. Mouse Wheel Zoom

### 5.1 Enable Zoom on Scroll

```javascript
modes: {
    week: {
        // Enable CTRL + mouse wheel zoom
        zoomOnMouseWheel: true,

        // Of met custom rate (hoger = sneller)
        zoomOnMouseWheel: 5
    }
}
```

### 5.2 Custom Zoom Behavior

```javascript
modes: {
    week: {
        zoomOnMouseWheel: {
            // Zoom factor per scroll tick
            factor: 1.2,

            // Minimum/maximum grenzen
            minHourHeight: 20,
            maxHourHeight: 500,

            // Zoom rond muispositie
            centerOnMouse: true
        }
    }
}
```

---

## 6. Zoom API

### 6.1 Programmatic Zoom

```javascript
// Zoom naar specifieke hour height
calendar.activeView.zoomTo(100);

// Zoom in/out met factor
calendar.activeView.zoomIn(1.2);   // 20% in
calendar.activeView.zoomOut(1.2);  // 20% out

// Fit to viewport
calendar.activeView.fitHours = true;

// Get current hour height
const currentHeight = calendar.activeView.hourHeight;
```

### 6.2 Zoom met Animation

```javascript
// Animated zoom
async function animatedZoom(view, targetHeight, duration = 300) {
    const startHeight = view.hourHeight;
    const diff = targetHeight - startHeight;
    const startTime = performance.now();

    return new Promise(resolve => {
        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const eased = 1 - Math.pow(1 - progress, 3);

            view.hourHeight = startHeight + (diff * eased);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(step);
    });
}

// Usage
await animatedZoom(calendar.activeView, 150);
```

---

## 7. Toolbar Controls

### 7.1 Zoom Buttons

```javascript
tbar: {
    items: {
        zoomIn: {
            type: 'button',
            icon: 'b-icon-search-plus',
            tooltip: 'Zoom in',
            onClick: 'up.onZoomIn'
        },
        zoomOut: {
            type: 'button',
            icon: 'b-icon-search-minus',
            tooltip: 'Zoom out',
            onClick: 'up.onZoomOut'
        },
        zoomSlider: {
            type: 'slider',
            min: 20,
            max: 200,
            value: 42,
            width: 150,
            showValue: false,
            onInput: 'up.onZoomSliderInput'
        },
        fitHours: {
            type: 'button',
            icon: 'b-icon-fit-to-page',
            tooltip: 'Fit to viewport',
            toggleable: true,
            onClick: 'up.onFitHoursClick'
        }
    }
},

onZoomIn() {
    const view = this.activeView;
    view.zoomTo(Math.min(view.hourHeight * 1.2, 500));
},

onZoomOut() {
    const view = this.activeView;
    view.zoomTo(Math.max(view.hourHeight / 1.2, 20));
},

onZoomSliderInput({ value }) {
    this.activeView.hourHeight = value;
},

onFitHoursClick({ source }) {
    this.activeView.fitHours = source.pressed;
}
```

---

## 8. Preset Zoom Levels

### 8.1 Quick Zoom Presets

```javascript
tbar: {
    items: {
        zoomPreset: {
            type: 'buttongroup',
            items: [
                {
                    text: 'Day',
                    tooltip: 'Full day view',
                    onClick: () => calendar.activeView.fitHours = true
                },
                {
                    text: 'Hour',
                    tooltip: 'Detailed hour view',
                    onClick: () => calendar.activeView.zoomTo(100)
                },
                {
                    text: '30min',
                    tooltip: 'Very detailed view',
                    onClick: () => calendar.activeView.zoomTo(200)
                }
            ]
        }
    }
}
```

---

## 9. TypeScript Interfaces

```typescript
import { Calendar, DayView, WeekView } from '@bryntum/calendar';

// Zoom Configuration
interface ZoomConfig {
    zoomOnMouseWheel?: boolean | number | ZoomMouseWheelConfig;
    hourHeight?: number;
    fitHours?: boolean;
}

interface ZoomMouseWheelConfig {
    factor?: number;
    minHourHeight?: number;
    maxHourHeight?: number;
    centerOnMouse?: boolean;
}

// Zoomable View Interface
interface ZoomableView extends DayView {
    hourHeight: number;
    fitHours: boolean;

    zoomTo(height: number): void;
    zoomIn(factor?: number): void;
    zoomOut(factor?: number): void;
}

// Layout Update Event
interface LayoutUpdateEvent {
    source: ZoomableView;
}

// Slider Config
interface ZoomSliderConfig {
    type: 'slider';
    min: number;
    max: number;
    value: number;
    step?: number;
    showValue?: boolean;
    showTooltip?: boolean;
    triggerChangeOnInput?: boolean;
    onChange: string | ((event: SliderChangeEvent) => void);
}

interface SliderChangeEvent {
    source: Slider;
    value: number;
}
```

---

## 10. Complete Example

```javascript
import { Calendar } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo: 'container',
    date: new Date(2020, 9, 12),

    crudManager: {
        loadUrl: 'data/data.json',
        autoLoad: true
    },

    overlaySidebar: true,

    modes: {
        day: null,
        month: null,
        year: null,
        agenda: null,

        week: {
            hourHeight: 42,
            zoomOnMouseWheel: true,

            listeners: {
                layoutUpdate: 'up.onWeekviewLayout'
            }
        }
    },

    sidebar: {
        items: {
            hourHeightSlider: {
                weight: 110,
                type: 'slider',
                label: 'Hour height',
                labelWidth: '6em',
                value: 42,
                min: 20,
                max: 500,
                step: 1,
                showValue: false,
                showTooltip: true,
                triggerChangeOnInput: true,
                onChange: 'up.onRowHeightChange'
            },
            fitHeightCheckbox: {
                type: 'slidetoggle',
                weight: 120,
                label: 'Fit hours',
                labelWidth: '6em',
                checked: false,
                onChange: 'up.onFitHoursCheckChange'
            }
        }
    },

    onWeekviewLayout({ source: weekView }) {
        const { hourHeightSlider } = this.widgetMap;

        if (weekView.fitHours) {
            hourHeightSlider.suspendEvents();
        }
        hourHeightSlider.value = weekView.hourHeight;
        if (weekView.fitHours) {
            hourHeightSlider.resumeEvents();
        }
    },

    onRowHeightChange({ source }) {
        this.activeView.zoomTo?.(source.value);
        this.widgetMap.fitHeightCheckbox.value = false;
    },

    onFitHoursCheckChange({ checked }) {
        this.activeView.fitHours = checked;
    }
});

// Frame-based updates voor smooth animation
calendar.onRowHeightChange = calendar.createOnFrame(
    calendar.onRowHeightChange, [], calendar, true
);
```

---

## Referenties

- Examples: `calendar-7.1.0-trial/examples/day-zoom/`
- API: DayView.hourHeight
- API: DayView.fitHours
- API: DayView.zoomTo()
- Config: zoomOnMouseWheel

---

*Document gegenereerd: December 2024*
*Bryntum Calendar versie: 7.1.0*
