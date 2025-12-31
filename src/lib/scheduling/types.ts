/**
 * Scheduling Types
 * Extended types for the scheduling engine
 */

import type { Task, Dependency, DependencyType, ConstraintType } from '@/types'

// =============================================================================
// Scheduling Result Types
// =============================================================================

export interface SchedulingResult {
  scheduledTasks: Map<string, ScheduledTaskInfo>
  criticalPath: string[]
  conflicts: SchedulingConflict[]
  projectDuration: number
  projectStart: Date
  projectEnd: Date
}

export interface ScheduledTaskInfo {
  taskId: string
  earlyStart: Date
  earlyFinish: Date
  lateStart: Date
  lateFinish: Date
  totalSlack: number // days
  freeSlack: number  // days
  isCritical: boolean
}

export interface SchedulingConflict {
  type: SchedulingConflictType
  taskIds: string[]
  message: string
  severity: 'error' | 'warning'
}

export type SchedulingConflictType =
  | 'circular_dependency'
  | 'constraint_violation'
  | 'resource_overload'
  | 'invalid_dates'
  | 'missing_dates'

// =============================================================================
// Validation Types
// =============================================================================

export interface DateValidationResult {
  valid: boolean
  reason?: string
  suggestedDate?: Date
  minDate?: Date
  maxDate?: Date
}

export interface DependencyValidationResult {
  valid: boolean
  conflicts: DependencyConflict[]
}

export interface DependencyConflict {
  dependencyId: string
  fromTaskId: string
  toTaskId: string
  type: DependencyType
  expectedDate: Date
  actualDate: Date
  violation: 'too_early' | 'too_late'
}

// =============================================================================
// Graph Types (for CPM calculation)
// =============================================================================

export interface TaskNode {
  task: Task
  predecessors: DependencyEdge[]
  successors: DependencyEdge[]
  earlyStart: number   // days from project start
  earlyFinish: number
  lateStart: number
  lateFinish: number
  duration: number
  totalSlack: number
  freeSlack: number
  visited: boolean
}

export interface DependencyEdge {
  dependency: Dependency
  targetTaskId: string
  lag: number // days
}

// =============================================================================
// Calendar Types
// =============================================================================

export interface WorkingCalendar {
  workingDays: number[] // 0=Sunday, 1=Monday, etc.
  holidays: Date[]
  workingHoursStart: number // 0-23
  workingHoursEnd: number   // 0-23
  hoursPerDay: number
}

export const DEFAULT_CALENDAR: WorkingCalendar = {
  workingDays: [1, 2, 3, 4, 5], // Monday-Friday
  holidays: [],
  workingHoursStart: 9,
  workingHoursEnd: 17,
  hoursPerDay: 8,
}

// =============================================================================
// Scheduling Options
// =============================================================================

export interface SchedulingOptions {
  calendar?: WorkingCalendar
  projectStartDate?: Date
  respectConstraints?: boolean
  respectManuallyScheduled?: boolean
  calculateSlack?: boolean
  detectCircular?: boolean
}

export const DEFAULT_SCHEDULING_OPTIONS: SchedulingOptions = {
  calendar: DEFAULT_CALENDAR,
  respectConstraints: true,
  respectManuallyScheduled: true,
  calculateSlack: true,
  detectCircular: true,
}
