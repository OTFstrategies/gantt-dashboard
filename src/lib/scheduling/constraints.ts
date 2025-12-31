/**
 * Constraint Validation Service
 * Validates task dates against constraints and dependencies
 */

import type { Task, Dependency, ConstraintType, DependencyType } from '@/types'
import type { DateValidationResult, DependencyValidationResult, DependencyConflict, WorkingCalendar } from './types'
import { DEFAULT_CALENDAR } from './types'
import { parseDate, getNextWorkingDay, addWorkingDays } from './calendar'

// =============================================================================
// Constraint Validation
// =============================================================================

/**
 * Validate a proposed start date against the task's constraint
 */
export function validateConstraint(
  task: Task,
  proposedDate: Date,
  constraintType?: ConstraintType
): DateValidationResult {
  const type = constraintType || task.constraint_type
  const constraintDate = task.constraint_date ? parseDate(task.constraint_date) : null

  switch (type) {
    case 'assoonaspossible':
    case 'aslateaspossible':
      // These don't have hard constraints
      return { valid: true }

    case 'muststarton':
      if (constraintDate) {
        const isSameDay = isSameDate(proposedDate, constraintDate)
        return {
          valid: isSameDay,
          reason: isSameDay ? undefined : `Taak moet starten op ${formatDate(constraintDate)}`,
          suggestedDate: constraintDate,
        }
      }
      return { valid: true }

    case 'mustfinishon':
      // This applies to end date, not start date
      // We would need duration to validate this
      return { valid: true }

    case 'startnoearlierthan':
      if (constraintDate) {
        const isAfterOrEqual = proposedDate >= constraintDate
        return {
          valid: isAfterOrEqual,
          reason: isAfterOrEqual ? undefined : `Taak mag niet eerder starten dan ${formatDate(constraintDate)}`,
          suggestedDate: constraintDate,
          minDate: constraintDate,
        }
      }
      return { valid: true }

    case 'startnolaterthan':
      if (constraintDate) {
        const isBeforeOrEqual = proposedDate <= constraintDate
        return {
          valid: isBeforeOrEqual,
          reason: isBeforeOrEqual ? undefined : `Taak mag niet later starten dan ${formatDate(constraintDate)}`,
          suggestedDate: constraintDate,
          maxDate: constraintDate,
        }
      }
      return { valid: true }

    case 'finishnoearlierthan':
    case 'finishnolaterthan':
      // These apply to end date
      return { valid: true }

    default:
      return { valid: true }
  }
}

/**
 * Validate an end date against finish constraints
 */
export function validateFinishConstraint(
  task: Task,
  proposedEndDate: Date
): DateValidationResult {
  const constraintDate = task.constraint_date ? parseDate(task.constraint_date) : null

  switch (task.constraint_type) {
    case 'mustfinishon':
      if (constraintDate) {
        const isSameDay = isSameDate(proposedEndDate, constraintDate)
        return {
          valid: isSameDay,
          reason: isSameDay ? undefined : `Taak moet eindigen op ${formatDate(constraintDate)}`,
          suggestedDate: constraintDate,
        }
      }
      return { valid: true }

    case 'finishnoearlierthan':
      if (constraintDate) {
        const isAfterOrEqual = proposedEndDate >= constraintDate
        return {
          valid: isAfterOrEqual,
          reason: isAfterOrEqual ? undefined : `Taak mag niet eerder eindigen dan ${formatDate(constraintDate)}`,
          suggestedDate: constraintDate,
          minDate: constraintDate,
        }
      }
      return { valid: true }

    case 'finishnolaterthan':
      if (constraintDate) {
        const isBeforeOrEqual = proposedEndDate <= constraintDate
        return {
          valid: isBeforeOrEqual,
          reason: isBeforeOrEqual ? undefined : `Taak mag niet later eindigen dan ${formatDate(constraintDate)}`,
          suggestedDate: constraintDate,
          maxDate: constraintDate,
        }
      }
      return { valid: true }

    default:
      return { valid: true }
  }
}

/**
 * Get the valid date range for a task based on constraints
 */
export function getConstraintBounds(task: Task): { minDate?: Date; maxDate?: Date } {
  const constraintDate = task.constraint_date ? parseDate(task.constraint_date) : null

  switch (task.constraint_type) {
    case 'muststarton':
      return { minDate: constraintDate || undefined, maxDate: constraintDate || undefined }

    case 'startnoearlierthan':
      return { minDate: constraintDate || undefined }

    case 'startnolaterthan':
      return { maxDate: constraintDate || undefined }

    default:
      return {}
  }
}

// =============================================================================
// Dependency Validation
// =============================================================================

/**
 * Validate a task's dates against its dependencies
 */
export function validateAgainstDependencies(
  task: Task,
  proposedStartDate: Date,
  proposedEndDate: Date,
  dependencies: Dependency[],
  allTasks: Task[],
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): DependencyValidationResult {
  const conflicts: DependencyConflict[] = []
  const taskMap = new Map(allTasks.map(t => [t.id, t]))

  // Check dependencies where this task is the successor (to_task)
  const incomingDeps = dependencies.filter(d => d.to_task === task.id)

  for (const dep of incomingDeps) {
    const predTask = taskMap.get(dep.from_task)
    if (!predTask) continue

    const predStart = parseDate(predTask.start_date)
    const predEnd = parseDate(predTask.end_date)
    if (!predStart || !predEnd) continue

    const expectedDate = calculateExpectedDate(
      dep.type,
      predStart,
      predEnd,
      dep.lag,
      calendar
    )

    const conflict = checkDependencyConflict(
      dep,
      proposedStartDate,
      proposedEndDate,
      expectedDate
    )

    if (conflict) {
      conflicts.push(conflict)
    }
  }

  // Check dependencies where this task is the predecessor (from_task)
  const outgoingDeps = dependencies.filter(d => d.from_task === task.id)

  for (const dep of outgoingDeps) {
    const succTask = taskMap.get(dep.to_task)
    if (!succTask) continue

    const succStart = parseDate(succTask.start_date)
    const succEnd = parseDate(succTask.end_date)
    if (!succStart || !succEnd) continue

    const expectedSuccDate = calculateExpectedSuccessorDate(
      dep.type,
      proposedStartDate,
      proposedEndDate,
      dep.lag,
      calendar
    )

    // Check if successor's current date is valid
    const isValid = succStart >= expectedSuccDate

    if (!isValid) {
      conflicts.push({
        dependencyId: dep.id,
        fromTaskId: dep.from_task,
        toTaskId: dep.to_task,
        type: dep.type,
        expectedDate: expectedSuccDate,
        actualDate: succStart,
        violation: 'too_early',
      })
    }
  }

  return {
    valid: conflicts.length === 0,
    conflicts,
  }
}

/**
 * Calculate the expected start date based on dependency type
 */
function calculateExpectedDate(
  depType: DependencyType,
  predStart: Date,
  predEnd: Date,
  lag: number,
  calendar: WorkingCalendar
): Date {
  let baseDate: Date

  switch (depType) {
    case 2: // Finish-to-Start (FS)
      baseDate = predEnd
      break
    case 0: // Start-to-Start (SS)
      baseDate = predStart
      break
    case 3: // Finish-to-Finish (FF)
      baseDate = predEnd
      break
    case 1: // Start-to-Finish (SF)
      baseDate = predStart
      break
    default:
      baseDate = predEnd
  }

  // Apply lag
  if (lag > 0) {
    return addWorkingDays(baseDate, lag, calendar)
  } else if (lag < 0) {
    return addWorkingDays(baseDate, lag, calendar)
  }

  return getNextWorkingDay(baseDate, calendar)
}

/**
 * Calculate when the successor can earliest start
 */
function calculateExpectedSuccessorDate(
  depType: DependencyType,
  predStart: Date,
  predEnd: Date,
  lag: number,
  calendar: WorkingCalendar
): Date {
  return calculateExpectedDate(depType, predStart, predEnd, lag, calendar)
}

/**
 * Check if there's a dependency conflict
 */
function checkDependencyConflict(
  dep: Dependency,
  proposedStart: Date,
  proposedEnd: Date,
  expectedDate: Date
): DependencyConflict | null {
  let violation: 'too_early' | 'too_late' | null = null
  let actualDate: Date

  switch (dep.type) {
    case 2: // Finish-to-Start: successor can't start before predecessor finishes
      if (proposedStart < expectedDate) {
        violation = 'too_early'
        actualDate = proposedStart
      }
      break

    case 0: // Start-to-Start: successor can't start before predecessor starts
      if (proposedStart < expectedDate) {
        violation = 'too_early'
        actualDate = proposedStart
      }
      break

    case 3: // Finish-to-Finish: successor can't finish before predecessor finishes
      if (proposedEnd < expectedDate) {
        violation = 'too_early'
        actualDate = proposedEnd
      }
      break

    case 1: // Start-to-Finish: successor can't finish before predecessor starts
      if (proposedEnd < expectedDate) {
        violation = 'too_early'
        actualDate = proposedEnd
      }
      break
  }

  if (violation) {
    return {
      dependencyId: dep.id,
      fromTaskId: dep.from_task,
      toTaskId: dep.to_task,
      type: dep.type,
      expectedDate,
      actualDate: actualDate!,
      violation,
    }
  }

  return null
}

// =============================================================================
// Combined Validation
// =============================================================================

/**
 * Validate a task's dates against all constraints and dependencies
 */
export function validateTaskDates(
  task: Task,
  proposedStartDate: Date,
  proposedEndDate: Date,
  dependencies: Dependency[],
  allTasks: Task[],
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): {
  valid: boolean
  constraintResult: DateValidationResult
  finishConstraintResult: DateValidationResult
  dependencyResult: DependencyValidationResult
} {
  const constraintResult = validateConstraint(task, proposedStartDate)
  const finishConstraintResult = validateFinishConstraint(task, proposedEndDate)
  const dependencyResult = validateAgainstDependencies(
    task,
    proposedStartDate,
    proposedEndDate,
    dependencies,
    allTasks,
    calendar
  )

  return {
    valid:
      constraintResult.valid &&
      finishConstraintResult.valid &&
      dependencyResult.valid,
    constraintResult,
    finishConstraintResult,
    dependencyResult,
  }
}

/**
 * Get the earliest valid start date for a task
 */
export function getEarliestStartDate(
  task: Task,
  dependencies: Dependency[],
  allTasks: Task[],
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): Date {
  const taskMap = new Map(allTasks.map(t => [t.id, t]))
  let earliestDate = new Date(0)

  // Check constraint bounds
  const constraintBounds = getConstraintBounds(task)
  if (constraintBounds.minDate) {
    earliestDate = constraintBounds.minDate
  }

  // Check dependencies
  const incomingDeps = dependencies.filter(d => d.to_task === task.id)

  for (const dep of incomingDeps) {
    const predTask = taskMap.get(dep.from_task)
    if (!predTask) continue

    const predStart = parseDate(predTask.start_date)
    const predEnd = parseDate(predTask.end_date)
    if (!predStart || !predEnd) continue

    const expectedDate = calculateExpectedDate(
      dep.type,
      predStart,
      predEnd,
      dep.lag,
      calendar
    )

    if (expectedDate > earliestDate) {
      earliestDate = expectedDate
    }
  }

  return getNextWorkingDay(earliestDate, calendar)
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if two dates are the same day
 */
function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Format a date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Get the dependency type name in Dutch
 */
export function getDependencyTypeName(type: DependencyType): string {
  switch (type) {
    case 0:
      return 'Start-naar-Start'
    case 1:
      return 'Start-naar-Eind'
    case 2:
      return 'Eind-naar-Start'
    case 3:
      return 'Eind-naar-Eind'
    default:
      return 'Onbekend'
  }
}

/**
 * Get the constraint type name in Dutch
 */
export function getConstraintTypeName(type: ConstraintType): string {
  switch (type) {
    case 'assoonaspossible':
      return 'Zo snel mogelijk'
    case 'aslateaspossible':
      return 'Zo laat mogelijk'
    case 'muststarton':
      return 'Moet starten op'
    case 'mustfinishon':
      return 'Moet eindigen op'
    case 'startnoearlierthan':
      return 'Start niet eerder dan'
    case 'startnolaterthan':
      return 'Start niet later dan'
    case 'finishnoearlierthan':
      return 'Eindig niet eerder dan'
    case 'finishnolaterthan':
      return 'Eindig niet later dan'
    default:
      return 'Geen constraint'
  }
}
