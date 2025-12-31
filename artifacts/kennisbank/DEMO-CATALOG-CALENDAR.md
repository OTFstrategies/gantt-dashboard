# BRYNTUM CALENDAR DEMO CATALOGUS (64 demos)

## VIEWS & MODES

### basic
- **Doel**: Standard calendar met week view
- **Features**: Compact header, date picker sidebar

### day-agenda
- **Doel**: Day/week agenda format
- **Features**: hideEmptyHours, syncHourHeights

### day-time-ticks
- **Doel**: Custom time axis (6-minute ticks)
- **Config**: `sixMinuteTicks: true`, 300px hour height

### day-zoom
- **Doel**: Interactive hour height control
- **Features**: 20-500px range slider

### dual-dayview
- **Doel**: Scheduled vs unscheduled side-by-side
- **Features**: Dynamic zoom to fit

### list-range / listview
- **Doel**: List format event display
- **Features**: Date range selection, grouping

### month-agenda
- **Doel**: Month view met agenda
- **Features**: Event dots, heatmap display

### monthgrid
- **Doel**: Multi-month grid
- **Config**: 4-month view

### recurrence
- **Doel**: Recurring events
- **Features**: Recurrence rules, all-day events

---

## RESOURCES

### date-resource
- **Doel**: Resources in columns
- **Config**: `dayresource` mode
- **Features**: Avatar display, width slider

### multiassign
- **Doel**: Events op multiple resources
- **Features**: Gradient rendering, color-mix

### resource-avatars
- **Doel**: Avatar images met events
- **Features**: Stack multi-day events

### resource-modes
- **Doel**: Week/month by resource views
- **Features**: Resource width slider

### resource-time-capacity
- **Doel**: Capacity tracking (party size)
- **Features**: Overbooked indication

### resourceview
- **Doel**: Resources in separate columns
- **Features**: Resource grouping/filtering

---

## INTERACTION

### action-buttons
- **Doel**: Edit/delete buttons op events
- **Features**: Read-only detection

### confirmation-dialogs
- **Doel**: Async confirmations voor drag
- **Features**: MessageDialog

### custom-menus
- **Doel**: Custom context menu items
- **Features**: allDay toggle, processItems

### current-time-options
- **Doel**: Current time line display
- **Config**: showTime, fullWidth, onTop

### docked-editor
- **Doel**: Drawer-style event editor
- **Config**: `continueEditingOnEventClick`

### custom-rendering
- **Doel**: Extensive custom rendering
- **Features**: Icons, dayCell rendering

---

## DRAG & DROP

### drag-between-calendars
- **Doel**: Sync twee calendars
- **Features**: Synchronized scroll/zoom

### dragfromgrid
- **Doel**: Drag vanuit externe grid
- **Config**: `externalEventSource` feature

### dragfromsidebar
- **Doel**: Drag vanuit sidebar
- **Features**: Task duration display

### drag-onto-tasks
- **Doel**: Equipment op events slepen
- **Features**: Equipment assignment

---

## FILTERING

### filtering
- **Doel**: Event filtering by name
- **Features**: Highlight matching

### filtering-advanced
- **Doel**: Project/resource filtering
- **Features**: Dual filter approach

---

## DATA & INTEGRATION

### calendar-scheduler
- **Doel**: Calendar + Scheduler/Timeline
- **Features**: Scale slider, staff display

### calendar-taskboard
- **Doel**: Calendar + Kanban
- **Features**: Status field sync

### calendar-chart
- **Doel**: Real-time statistics chart
- **Features**: Bar chart, dataset toggle

### load-on-demand
- **Doel**: On-demand event loading
- **Config**: 100,000 events
- **Features**: `loadOnDemand` feature

### bigdataset / megadataset
- **Doel**: Performance testing
- **Config**: 100,000 events
- **Features**: useRawData optimization

---

## SPECIALIZED

### show-booking
- **Doel**: Theater booking system
- **Features**: Public vs admin mode, seat selector

### radio-schedule
- **Doel**: Radio programming
- **Features**: Month/year views

### travel-time
- **Doel**: Travel time buffers
- **Features**: Leaflet map integration

---

## EXPORT

### export-to-excel
- **Doel**: Excel export
- **Features**: Custom columns

### export-to-ics
- **Doel**: iCalendar export
- **Features**: RFC5545 compliance

### print
- **Doel**: Print calendar
- **Features**: Custom headers/footers

---

## TIME MANAGEMENT

### timeranges
- **Doel**: Custom time ranges
- **Features**: Working hours, breaks

### timezone
- **Doel**: Multiple timezone support
- **Features**: TimeZoneHelper

### visible-hours
- **Doel**: Configure visible/core hours
- **Features**: Core hours overlay

### shifted
- **Doel**: Midnight shift (starts 6PM)
- **Config**: `dayStartShift: 18`

---

## STATE & CONFIG

### state
- **Doel**: Persist calendar state
- **Config**: StateProvider (local/remote)

### responsive
- **Doel**: Responsive design
- **Features**: Size-based state switching

### sidebar-customization
- **Doel**: Custom sidebar widgets
- **Features**: Keyboard shortcuts

---

## MODES OVERVIEW

| Mode | Type |
|------|------|
| `day` | Single day |
| `week` | Week (7 days) |
| `month` | Month grid |
| `year` | Year calendar |
| `agenda` | List agenda |
| `list` | Event list |
| `resource` | By resource |
| `dayresource` | Days by resource |
| `monthgrid` | Multi-month |
| `dayagenda` | Day + agenda |
| `monthagenda` | Month + agenda |
