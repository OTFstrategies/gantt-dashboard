# Calendar Implementation: Radio Schedule

> **Implementatie guide** voor resource-gebaseerde scheduling in Bryntum Calendar: multi-resource views, date range selection, zoom controls, en resource filtering.

---

## Overzicht

Radio Schedule combineert meerdere view modes met geavanceerde controls:

- **DayResource View** - Resources als kolommen, dagen als rijen
- **Resource View** - Dagen als kolommen per resource
- **Date Range Selection** - Multi-select datepicker
- **Dual Zoom** - Height en width zoom controls
- **Resource Filter** - Sidebar filtering

---

## 1. View Modes

### 1.1 Mode Defaults

```javascript
import { Calendar } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo: 'container',
    date: '2024-03-03',

    modeDefaults: {
        date: '2024-03-03',
        range: '1 week',
        dayStartTime: 5,
        dayEndTime: 22,
        fitHours: true,
        zoomOnMouseWheel: 5,
        minEventHeight: 0,

        // Event layout zonder gutter
        eventLayout: {
            gutterWidth: 0
        },

        // Sync view date met calendar
        syncViewDate: false,

        // Verberg resource naam bij smalle kolommen
        hideResourceNameWhenNarrow: true,

        // Subview defaults voor ResourceView
        view: {
            dayStartTime: 5,
            dayEndTime: 22,
            zoomOnMouseWheel: 5,
            minEventHeight: 0,
            fitHours: true,
            interDayResize: false,
            interDayDrag: false,
            listeners: {
                layoutUpdate: 'up.onViewLayout'
            }
        },

        listeners: {
            layoutUpdate: 'up.onViewLayout',
            show: 'up.onViewShow'
        }
    }
});
```

### 1.2 View Configuration

```javascript
modes: {
    day: null,
    week: null,
    month: null,
    year: null,
    agenda: null,

    // Resources als kolommen
    dayresource: {
        title: 'Day/Resource',
        range: '1 week'
    },

    // Dagen als kolommen per resource
    resource: {
        title: 'Resource/Day',

        // Subview configuratie
        view: {
            allDayEvents: {
                expanded: true,
                maxHeight: null
            }
        }
    }
}
```

---

## 2. Date Range Selection

### 2.1 Sidebar Configuration

```javascript
sidebar: {
    items: {
        // Date range display
        rangeDisplay: {
            type: 'container',
            weight: 0,
            layout: 'hbox',

            defaults: {
                editable: false,
                format: 'MMM DD',
                picker: null,
                step: '1d',
                labelPosition: 'above',
                flex: 1,
                triggers: { expand: null },
                listeners: {
                    change: 'up.onRangeFieldChanged'
                }
            },

            items: {
                startDate: {
                    label: 'Start',
                    type: 'datefield',
                    value: '2024-03-03'
                },
                endDate: {
                    label: 'End',
                    type: 'datefield',
                    value: '2024-03-09'
                }
            }
        },

        // Multi-select datepicker
        datePicker: {
            type: 'datepicker',
            multiSelect: 'range',
            selection: ['2024-03-03', '2024-03-09'],
            listeners: {
                selectionChange: 'up.onDatePickerRangeSelected'
            }
        },

        // Resource filter
        resourceFilter: {
            title: 'Stations',
            minHeight: null
        }
    }
}
```

### 2.2 Range Handlers

```javascript
onDatePickerRangeSelected({ selection }) {
    const [startDate, endDate] = selection;

    // Update range fields
    this.widgetMap.startDate.value = startDate;
    this.widgetMap.endDate.value = endDate;

    // Update active view
    this.activeView.setConfig({
        date: startDate,
        range: {
            startDate,
            endDate
        }
    });
}

onRangeFieldChanged({ source, value }) {
    const { startDate, endDate, datePicker } = this.widgetMap;

    // Sync datepicker selection
    datePicker.selection = [startDate.value, endDate.value];

    // Update view range
    this.activeView.setConfig({
        date: startDate.value,
        range: {
            startDate: startDate.value,
            endDate: endDate.value
        }
    });
}
```

---

## 3. Dual Zoom Controls

### 3.1 Height and Width Sliders

```javascript
tbar: {
    items: {
        // Vertical zoom (hour height)
        hourHeight: {
            type: 'slider',
            label: 'Time zoom',
            weight: 610,
            min: 42,
            max: 400,
            value: 42,
            showValue: false,
            showTooltip: true,
            onInput: 'up.onHeightSliderChange'
        },

        // Horizontal zoom (column width)
        dayColumnWidth: {
            type: 'slider',
            label: 'Day width zoom',
            weight: 620,
            min: 50,
            max: 250,
            value: 120,
            showValue: false,
            showTooltip: true,
            onInput: 'up.onWidthSliderChange'
        }
    }
}
```

### 3.2 Zoom Handlers

```javascript
onHeightSliderChange({ value }) {
    const view = this.activeView;

    if (view.isResourceView) {
        // ResourceView: update alle subviews
        view.eachView(subView => {
            subView.hourHeight = value;
        });
    } else {
        // DayResourceView: update direct
        view.hourHeight = value;
    }
}

onWidthSliderChange({ value }) {
    const view = this.activeView;

    if (view.isResourceView) {
        // ResourceView: minDayWidth
        view.minDayWidth = value;
    } else {
        // DayResourceView: minResourceWidth
        view.minResourceWidth = value;
    }
}
```

---

## 4. Layout Synchronization

### 4.1 View Layout Handler

```javascript
onViewLayout({ source }) {
    const { hourHeight, dayColumnWidth } = this.widgetMap;

    // Sync height slider
    hourHeight.suspendEvents();
    hourHeight.value = source.hourHeight || 42;
    hourHeight.resumeEvents();

    // Sync width slider
    dayColumnWidth.suspendEvents();
    if (source.isResourceView) {
        dayColumnWidth.value = source.minDayWidth || 120;
    } else {
        dayColumnWidth.value = source.minResourceWidth || 120;
    }
    dayColumnWidth.resumeEvents();
}
```

### 4.2 View Show Handler

```javascript
onViewShow({ source }) {
    const { startDate, endDate, datePicker } = this.widgetMap;

    // Sync date range met nieuwe view
    if (source.startDate && source.endDate) {
        startDate.value = source.startDate;
        endDate.value = source.endDate;
        datePicker.selection = [source.startDate, source.endDate];
    }
}
```

---

## 5. Resource Filtering

### 5.1 Filter Configuration

```javascript
sidebar: {
    items: {
        resourceFilter: {
            type: 'list',
            title: 'Stations',

            store: {
                // Data komt van calendar's resourceStore
            },

            itemTpl: record => `
                <div class="resource-item">
                    <i class="${record.iconCls}"></i>
                    ${record.name}
                </div>
            `,

            multiSelect: true,
            toggleAllIfCtrlPressed: true,

            listeners: {
                selectionChange: 'up.onResourceFilterChange'
            }
        }
    }
}
```

### 5.2 Filter Handler

```javascript
onResourceFilterChange({ selection }) {
    if (selection.length === 0) {
        // Geen selectie = toon alles
        this.resourceStore.clearFilters();
    } else {
        // Filter op geselecteerde resources
        const selectedIds = selection.map(r => r.id);

        this.resourceStore.filter({
            id: 'resourceFilter',
            filterBy: record => selectedIds.includes(record.id)
        });
    }
}
```

---

## 6. Event Styling

### 6.1 Custom Event Renderer

```javascript
modeDefaults: {
    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        const { name, duration } = eventRecord;

        // Styling op basis van duur
        if (duration < 0.5) {
            renderData.cls.add('short-event');
        }

        return [
            {
                className: 'event-title',
                text: name
            },
            duration >= 1 && {
                className: 'event-time',
                text: `${DateHelper.format(eventRecord.startDate, 'HH:mm')} - ${DateHelper.format(eventRecord.endDate, 'HH:mm')}`
            }
        ];
    }
}
```

### 6.2 Event CSS

```css
.b-cal-event {
    border-radius: 4px;
    padding: 4px 8px;
}

.event-title {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.event-time {
    font-size: 0.85em;
    opacity: 0.8;
}

.short-event .b-cal-event {
    font-size: 0.8em;
    padding: 2px 4px;
}

/* Resource header in narrow mode */
.b-cal-resource-header.b-narrow .b-resource-name {
    display: none;
}

.b-cal-resource-header.b-narrow .b-resource-avatar {
    margin: 0 auto;
}
```

---

## 7. TypeScript Interfaces

```typescript
import { Calendar, DayResourceView, ResourceView, DateHelper } from '@bryntum/calendar';

// Mode Defaults
interface RadioScheduleModeDefaults {
    date?: Date | string;
    range?: string | DateRange;
    dayStartTime?: number;
    dayEndTime?: number;
    fitHours?: boolean;
    zoomOnMouseWheel?: number | boolean;
    minEventHeight?: number;
    syncViewDate?: boolean;
    hideResourceNameWhenNarrow?: boolean;
    eventLayout?: EventLayoutConfig;
    view?: SubViewConfig;
}

interface DateRange {
    startDate: Date | string;
    endDate: Date | string;
}

interface EventLayoutConfig {
    gutterWidth?: number;
}

interface SubViewConfig {
    dayStartTime?: number;
    dayEndTime?: number;
    fitHours?: boolean;
    allDayEvents?: AllDayConfig;
}

interface AllDayConfig {
    expanded?: boolean;
    maxHeight?: number | null;
}

// Zoom Slider Config
interface ZoomSliderConfig {
    type: 'slider';
    label: string;
    min: number;
    max: number;
    value: number;
    showValue?: boolean;
    showTooltip?: boolean;
    onInput: string | ((event: SliderInputEvent) => void);
}

// View Types
interface RadioScheduleView extends DayResourceView {
    minResourceWidth?: number;
    hourHeight: number;
}

interface RadioResourceView extends ResourceView {
    minDayWidth?: number;
    eachView(fn: (view: DayView) => void): void;
}
```

---

## 8. Complete Example

```javascript
import { Calendar, DateHelper } from '@bryntum/calendar';

const startDate = '2024-03-03';
const endDate = '2024-03-09';

const calendar = new Calendar({
    appendTo: 'container',
    date: startDate,

    crudManager: {
        autoLoad: true,
        loadUrl: 'data/data.json'
    },

    tbar: {
        items: {
            hourHeight: {
                type: 'slider',
                label: 'Time zoom',
                weight: 610,
                min: 42,
                max: 400,
                value: 42,
                showValue: false,
                showTooltip: true,
                onInput: 'up.onHeightSliderChange'
            },
            dayColumnWidth: {
                type: 'slider',
                label: 'Day width',
                weight: 620,
                min: 50,
                max: 250,
                value: 120,
                showValue: false,
                showTooltip: true,
                onInput: 'up.onWidthSliderChange'
            }
        }
    },

    sidebar: {
        items: {
            rangeDisplay: {
                type: 'container',
                weight: 0,
                layout: 'hbox',
                items: {
                    startDate: {
                        type: 'datefield',
                        label: 'Start',
                        value: startDate,
                        listeners: { change: 'up.onRangeFieldChanged' }
                    },
                    endDate: {
                        type: 'datefield',
                        label: 'End',
                        value: endDate,
                        listeners: { change: 'up.onRangeFieldChanged' }
                    }
                }
            },
            datePicker: {
                type: 'datepicker',
                multiSelect: 'range',
                selection: [startDate, endDate],
                listeners: {
                    selectionChange: 'up.onDatePickerRangeSelected'
                }
            },
            resourceFilter: {
                title: 'Stations',
                minHeight: null
            }
        }
    },

    modeDefaults: {
        date: startDate,
        range: '1 week',
        dayStartTime: 5,
        dayEndTime: 22,
        fitHours: true,
        zoomOnMouseWheel: 5,
        syncViewDate: false,
        eventLayout: { gutterWidth: 0 },
        listeners: {
            layoutUpdate: 'up.onViewLayout',
            show: 'up.onViewShow'
        }
    },

    modes: {
        day: null, week: null, month: null, year: null, agenda: null,
        dayresource: { title: 'Day/Resource' },
        resource: { title: 'Resource/Day' }
    },

    onHeightSliderChange({ value }) {
        this.activeView.hourHeight = value;
    },

    onWidthSliderChange({ value }) {
        if (this.activeView.isResourceView) {
            this.activeView.minDayWidth = value;
        } else {
            this.activeView.minResourceWidth = value;
        }
    },

    onDatePickerRangeSelected({ selection }) {
        const [start, end] = selection;
        this.widgetMap.startDate.value = start;
        this.widgetMap.endDate.value = end;
        this.activeView.setConfig({ date: start, range: { startDate: start, endDate: end } });
    }
});
```

---

## Referenties

- Examples: `calendar-7.1.0-trial/examples/radio-schedule/`
- View: DayResourceView
- View: ResourceView
- API: modeDefaults
- Widget: DatePicker (multiSelect)

---

*Document gegenereerd: December 2024*
*Bryntum Calendar versie: 7.1.0*
