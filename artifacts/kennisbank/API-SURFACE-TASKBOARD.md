# BRYNTUM TASKBOARD API SURFACE

> Kanban board with columns and swimlanes (170,056 lines)

---

## 1. TASKBOARD CLASS

```typescript
export class TaskBoard extends TaskBoardBase
```

### Static Identifier

```typescript
isTaskBoard: boolean
```

### Configuration

```typescript
columnField: string           // Field to match task to column
swimlaneField: string         // Field to match task to swimlane
tasksPerRow: number          // Tasks per row
readOnly: boolean
```

---

## 2. COLUMNMODEL

### Properties

```typescript
id: string | number           // Unique identifier
text: string                  // Header text
collapsible: boolean
collapsed: boolean            // readonly
color: ColumnColor            // See colors below
hidden: boolean
locked: 'start' | 'end' | null
flex: number
width: number
minWidth: number
tooltip: string
tasksPerRow: number
htmlEncodeHeaderText: boolean
```

### Colors

```typescript
'red' | 'pink' | 'magenta' | 'purple' | 'violet' |
'deep-purple' | 'indigo' | 'blue' | 'light-blue' |
'cyan' | 'teal' | 'green' | 'light-green' | 'lime' |
'yellow' | 'orange' | 'amber' | 'deep-orange' |
'light-gray' | 'gray' | string | null
```

### Read-only Properties

```typescript
readonly tasks: TaskModel[]
```

### Methods

```typescript
collapse(): Promise<any>
expand(): Promise<any>
```

---

## 3. SWIMLANEMODEL

### Properties

```typescript
id: string | number
text: string
collapsible: boolean
collapsed: boolean            // readonly
color: ColumnColor
hidden: boolean
flex: number
height: number
tasksPerRow: number
```

### Read-only Properties

```typescript
readonly tasks: TaskModel[]
```

### Methods

```typescript
collapse(): Promise<any>
expand(): Promise<any>
```

---

## 4. TASKMODEL

Extends EventModel with additional fields:

### Properties

```typescript
// Core
name: string
description: string

// Position
status: string                // Links to column
prio: string | number         // Links to swimlane
weight: number                // Display order (higher = lower)

// Display
collapsed: boolean            // Render as small bar
eventColor: ColumnColor
style: string                 // CSS style
iconCls: string               // Icon class

// Behavior
readOnly: boolean

// Inherited from EventModel
startDate: Date
endDate: Date
duration: number
draggable: boolean
resizable: boolean
resourceId: string | number
resources: ResourceModel[]
assignments: AssignmentModel[]
```

---

## 5. EVENTS

### Task Events

```typescript
onActivateTask              // Enter/double-click
onBeforeTaskRemove
onBeforeTaskEdit
onBeforeTaskEditShow
onBeforeTaskDrag
onBeforeTaskDrop
onTaskClick
onTaskDblClick
onTaskMouseEnter
onTaskMouseLeave
onRenderTask
onRenderTasks
onRemoveTaskElement
onSelectionChange
```

### Column Events

```typescript
onColumnHeaderClick
onColumnTitleClick
onColumnHeaderContextMenu
onColumnTitleContextMenu
onColumnHeaderDblClick
onColumnTitleDblClick
onColumnCollapse
onColumnExpand
onColumnToggle
```

### Swimlane Events

```typescript
onSwimlaneHeaderClick
onSwimlaneHeaderContextMenu
onSwimlaneHeaderDblClick
onSwimlaneCollapse
onSwimlaneExpand
onSwimlaneToggle
```

---

## 6. METHODS

```typescript
addTask(data): TaskModel
removeTask(tasks): void
editTask(task): void
```

---

## 7. FEATURES

### Task Management

| Feature | Purpose |
|---------|---------|
| `taskDrag` | Drag tasks between columns |
| `taskEdit` | Task editor dialog |
| `simpleTaskEdit` | Inline editing |
| `taskMenu` | Task context menu |
| `taskTooltip` | Task tooltips |

### Column/Swimlane

| Feature | Purpose |
|---------|---------|
| `columnDrag` | Reorder columns |
| `columnHeaderMenu` | Column context menu |
| `columnToolbars` | Column toolbars |
| `swimlaneDrag` | Reorder swimlanes |

### UI

| Feature | Purpose |
|---------|---------|
| `responsive` | Responsive layout |
| `scrolling` | Scroll management |
| `zooming` | Card size control |
| `search` | Search tasks |

---

## 8. CARD ITEMS

TaskBoard cards can contain different item types:

```typescript
// Body items
{ type: 'text', field: 'description' }
{ type: 'image', field: 'imageUrl' }
{ type: 'progress', field: 'percentDone' }
{ type: 'todoList', field: 'todos' }

// Footer items
{ type: 'resourceAvatars' }
{ type: 'tags', field: 'labels' }
```

---

## 9. COMPARISON

| Feature | TaskBoard | Calendar |
|---------|-----------|----------|
| **Focus** | Tasks in columns | Events on timeline |
| **Time** | Optional dates | Required dates |
| **Views** | Kanban only | Day/Week/Month/Year |
| **Resources** | Assignments | Assignments |
| **Drag** | Between columns | On timeline |

---

## SUMMARY

| Category | Count |
|----------|-------|
| Column Properties | 12 |
| Swimlane Properties | 9 |
| Task Properties | 15+ |
| Events | 25+ |

**Source:** `taskboard.d.ts` - 170,056 lines
