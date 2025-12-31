/**
 * Project Type Definitions
 * Generic types for project management (not Bryntum-specific)
 */

import type {
  Task,
  Dependency,
  Resource,
  Assignment,
  Calendar,
  ProjectStatus,
} from './entities'

// =============================================================================
// Project Data Types
// =============================================================================

/**
 * Complete project data structure
 */
export interface ProjectData {
  tasks: Task[]
  resources: Resource[]
  dependencies: Dependency[]
  assignments: Assignment[]
  calendars: Calendar[]
}

/**
 * Project metadata
 */
export interface ProjectMeta {
  id: string
  name: string
  description?: string
  start_date: string
  end_date?: string
  status: ProjectStatus
  workspace_id: string
  created_at: string
  updated_at: string
}

// =============================================================================
// CRUD Operation Types
// =============================================================================

/**
 * Generic CRUD operation for batch updates
 */
export interface CrudOperation<T> {
  added?: Partial<T>[]
  updated?: (Partial<T> & { id: string })[]
  removed?: { id: string }[]
}

/**
 * Batch sync request
 */
export interface SyncRequest {
  requestId: string
  tasks?: CrudOperation<Task>
  resources?: CrudOperation<Resource>
  dependencies?: CrudOperation<Dependency>
  assignments?: CrudOperation<Assignment>
  calendars?: CrudOperation<Calendar>
}

/**
 * Batch sync response
 */
export interface SyncResponse {
  success: boolean
  requestId: string
  tasks?: { created: IdMapping[], updated: string[], removed: string[] }
  resources?: { created: IdMapping[], updated: string[], removed: string[] }
  dependencies?: { created: IdMapping[], updated: string[], removed: string[] }
  assignments?: { created: IdMapping[], updated: string[], removed: string[] }
  calendars?: { created: IdMapping[], updated: string[], removed: string[] }
  errors?: SyncError[]
}

/**
 * ID mapping for newly created records (temp ID → real ID)
 */
export interface IdMapping {
  tempId: string
  id: string
}

/**
 * Sync error details
 */
export interface SyncError {
  entity: 'task' | 'resource' | 'dependency' | 'assignment' | 'calendar'
  operation: 'create' | 'update' | 'delete'
  id?: string
  message: string
}

// =============================================================================
// View Configuration Types
// =============================================================================

/**
 * Gantt view configuration
 */
export interface GanttViewConfig {
  columns: ColumnConfig[]
  viewPreset: ViewPreset
  rowHeight?: number
  barMargin?: number
  showWeekends?: boolean
  showCriticalPath?: boolean
  showBaselines?: boolean
  readOnly?: boolean
}

/**
 * Column configuration for grid views
 */
export interface ColumnConfig {
  field: string
  header: string
  width?: number
  minWidth?: number
  flex?: number
  hidden?: boolean
  sortable?: boolean
  filterable?: boolean
  editable?: boolean
  type?: ColumnType
  renderer?: (value: unknown, record: Task) => string | React.ReactNode
}

export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'duration'
  | 'percent'
  | 'resource'
  | 'wbs'
  | 'action'

/**
 * Timeline view presets
 */
export type ViewPreset =
  | 'hourAndDay'
  | 'dayAndWeek'
  | 'weekAndDay'
  | 'weekAndMonth'
  | 'monthAndYear'
  | 'year'

/**
 * Calendar view configuration
 */
export interface CalendarViewConfig {
  mode: CalendarMode
  date?: Date
  showWeekNumbers?: boolean
  readOnly?: boolean
}

export type CalendarMode =
  | 'day'
  | 'week'
  | 'month'
  | 'year'
  | 'agenda'

/**
 * TaskBoard view configuration
 */
export interface TaskBoardViewConfig {
  columns: BoardColumn[]
  swimlanes?: BoardSwimlane[]
  columnField: string
  swimlaneField?: string
  readOnly?: boolean
}

export interface BoardColumn {
  id: string
  text: string
  color?: string
  collapsed?: boolean
  wipLimit?: number
}

export interface BoardSwimlane {
  id: string
  text: string
  color?: string
  collapsed?: boolean
}

/**
 * Grid view configuration
 */
export interface GridViewConfig {
  columns: ColumnConfig[]
  groupBy?: string
  sortBy?: { field: string; direction: 'asc' | 'desc' }[]
  filterBy?: { field: string; operator: string; value: unknown }[]
  readOnly?: boolean
}

// =============================================================================
// Event Types
// =============================================================================

/**
 * Task event parameters
 */
export interface TaskEventParams {
  task: Task
  event?: MouseEvent
}

export interface TaskDragParams extends TaskEventParams {
  startDate: Date
  endDate: Date
  valid: boolean
}

export interface TaskResizeParams extends TaskEventParams {
  edge: 'start' | 'end'
  newDate: Date
}

/**
 * Dependency event parameters
 */
export interface DependencyEventParams {
  dependency: Dependency
  fromTask: Task
  toTask: Task
}

/**
 * Calendar event parameters
 */
export interface CalendarEventParams {
  event: Task
  date: Date
  mode: CalendarMode
}

// =============================================================================
// Scheduling Types
// =============================================================================

/**
 * Scheduling calculation result
 */
export interface SchedulingResult {
  tasks: ScheduledTask[]
  criticalPath: string[]
  conflicts: SchedulingConflict[]
}

export interface ScheduledTask {
  id: string
  earlyStart: Date
  earlyFinish: Date
  lateStart: Date
  lateFinish: Date
  totalSlack: number
  freeSlack: number
  isCritical: boolean
}

export interface SchedulingConflict {
  type: 'circular_dependency' | 'constraint_violation' | 'resource_overload'
  taskIds: string[]
  message: string
}

