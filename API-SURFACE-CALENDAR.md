# BRYNTUM CALENDAR API SURFACE

> Event calendar with multiple view modes (342,695 lines)

---

## 1. CALENDAR CLASS

```typescript
export class Calendar extends Panel
```

### Static Identifiers

```typescript
isCalendar: boolean
isCalendarStores: boolean
isCrudManagerView: boolean
isEventNavigation: boolean
isEventSelection: boolean
```

### Configuration

```typescript
date: Date | string                    // Active date
dateFormat: string                     // Date format
mode: string                           // Active view mode
modeDefaults: object                   // Config for all views
nonWorkingDays: Record<number, boolean> // 0-6 = Sun-Sat
project: ProjectModel
readOnly: boolean
hideNonWorkingDays: boolean
deselectAllOnScheduleClick: boolean
useContextualRecurrenceRules: boolean
```

### Stores

```typescript
readonly eventStore: EventStore
readonly resourceStore: ResourceStore
readonly assignmentStore: AssignmentStore
readonly timeRangeStore: TimeRangeStore
readonly resourceTimeRangeStore: ResourceTimeRangeStore
```

---

## 2. VIEW MODES

### DayView

```typescript
allowDragCreate: boolean
allowDragMove: boolean
allowDragResize: boolean
hourHeight: number
dayStartTime: string        // "08:00"
dayEndTime: string          // "18:00"
increment: number           // Minutes
minDayWidth: number
fitHours: boolean
compactHeader: boolean
coreHours: { start: number, end: number }
```

### WeekView (extends DayView)

Weekly view with days and hours.

### MonthView

```typescript
autoRowHeight: boolean
eventHeight: number
eventSpacing: number
showWeekNumber: boolean
persistShrinkWrappedRows: boolean
```

### YearView

Year overview with mini months.

### AgendaView

List view of events.

### EventListView

Detailed event list.

### DayResourceView (extends DayView)

Day view with resources as columns.

### ResourceView

Resources with their own timelines.

---

## 3. EVENTMODEL

### Properties

```typescript
// Core
id: string | number
startDate: Date
endDate: Date
duration: number
allDay: boolean

// Display
eventColor: EventColor
eventStyle: 'plain' | 'border' | 'colored' | 'hollow' |
            'line' | 'dashed' | 'minimal' | 'rounded' |
            'calendar' | 'interday' | 'gantt'

// Behavior
draggable: boolean
resizable: boolean | 'start' | 'end'

// Resources
resourceId: string | number
resourceIds: string[] | number[]

// Recurrence
recurrenceRule: string           // RFC-5545
exceptionDates: string[]

// Sticky
stickyContents: boolean
```

### Read-only Properties

```typescript
readonly assignments: AssignmentModel[]
readonly resources: ResourceModel[]
readonly isInterDay: boolean
readonly isOccurrence: boolean
readonly isRecurring: boolean
readonly occurrenceIndex: number
```

### Key Methods

```typescript
assign(resource, removeExisting?): Promise<void>
unassign(resource?): Promise<void>
getOccurrencesForDateRange(start, end?): TimeSpan[]
getResource(resourceId?): ResourceModel
hasException(date): boolean
isAssignedTo(resource): boolean
setRecurrence(config, interval?, end?): void
shift(amount, unit): Promise<any>
```

---

## 4. RESOURCEMODEL

### Properties

```typescript
id: string | number
name: string
image: string | boolean
imageUrl: string
eventColor: EventColor
eventStyle: EventStyle
eventLayout: 'stack' | 'pack' | 'mixed' | 'none'
allowOverlap: boolean
barMargin: number
columnWidth: number
rowHeight: number
showAvatar: boolean
```

### Read-only Properties

```typescript
readonly events: EventModel[]
readonly assignments: AssignmentModel[]
readonly timeRanges: ResourceTimeRangeModel[]
readonly initials: string
```

---

## 5. EVENTS

### View Events

```typescript
onActiveItemChange         // View mode changed
onBeforeActiveItemChange   // Before view change
onDateChange               // Calendar date changed
onDateRangeChange          // View date range changed
```

### Event Interaction

```typescript
// Creation
onBeforeAutoCreate
onBeforeDragCreate
onDragCreateEnd

// Movement
onBeforeDragMove
onDragMoveEnd

// Resize
onBeforeDragResize
onDragResizeEnd

// Clicks
onEventClick
onEventDblClick
onEventContextMenu
onEventKeyDown

// Mouse
onEventMouseEnter
onEventMouseLeave
onEventMouseOver
onEventMouseOut
```

### Schedule Events

```typescript
onScheduleClick
onScheduleContextMenu
onScheduleDblClick
onScheduleMouseDown
onScheduleMouseUp
```

### Other Events

```typescript
onResourceClick
onSelectionChange
onDayNumberClick
onMonthNameClick
onDaysCellPopulated
```

---

## 6. RECURRENCE (RFC-5545)

### RecurrenceRule Format

```typescript
// Daily
"FREQ=DAILY;INTERVAL=1"

// Weekly on Monday, Wednesday
"FREQ=WEEKLY;BYDAY=MO,WE"

// Monthly on 15th
"FREQ=MONTHLY;BYMONTHDAY=15"

// Yearly
"FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25"

// With end
"FREQ=DAILY;UNTIL=20251231"
"FREQ=DAILY;COUNT=10"
```

### Methods

```typescript
setRecurrence(config, interval?, end?): void
addExceptionDate(date): void
hasException(date): boolean
getOccurrencesForDateRange(start, end?): TimeSpan[]
```

---

## SUMMARY

| Category | Count |
|----------|-------|
| View Modes | 8 |
| EventModel Fields | 15+ |
| ResourceModel Fields | 10+ |
| Events | 30+ |

**Source:** `calendar.d.ts` - 342,695 lines
