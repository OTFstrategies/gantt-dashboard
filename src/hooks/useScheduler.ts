/**
 * useScheduler Hook
 * Provides scheduling functionality for project management
 */

import { useCallback, useMemo, useState } from 'react'
import { useProject } from '@/providers'
import {
  calculateSchedule,
  getCriticalPath,
  getTaskSlack,
  validateTaskDates,
  getEarliestStartDate,
  getPredecessors,
  getSuccessors,
  DEFAULT_SCHEDULING_OPTIONS,
} from '@/lib/scheduling'
import type {
  SchedulingResult,
  ScheduledTaskInfo,
  SchedulingConflict,
  DateValidationResult,
  DependencyValidationResult,
  SchedulingOptions,
  WorkingCalendar,
} from '@/lib/scheduling'
import type { Task } from '@/types'

// =============================================================================
// Types
// =============================================================================

export interface UseSchedulerReturn {
  // Scheduling state
  isCalculating: boolean
  schedulingResult: SchedulingResult | null
  lastCalculatedAt: Date | null

  // Core functions
  calculateProjectSchedule: () => SchedulingResult
  recalculate: () => void

  // Critical path
  criticalPath: string[]
  isTaskOnCriticalPath: (taskId: string) => boolean

  // Slack information
  getSlack: (taskId: string) => { totalSlack: number; freeSlack: number } | null
  getScheduledTaskInfo: (taskId: string) => ScheduledTaskInfo | null

  // Validation
  validateDates: (
    taskId: string,
    proposedStart: Date,
    proposedEnd: Date
  ) => {
    valid: boolean
    constraintResult: DateValidationResult
    finishConstraintResult: DateValidationResult
    dependencyResult: DependencyValidationResult
  }
  getEarliestStart: (taskId: string) => Date

  // Dependencies
  getTaskPredecessors: (taskId: string) => string[]
  getTaskSuccessors: (taskId: string) => string[]

  // Conflicts
  conflicts: SchedulingConflict[]
  hasConflicts: boolean
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useScheduler(
  options: SchedulingOptions = DEFAULT_SCHEDULING_OPTIONS
): UseSchedulerReturn {
  const { projectData } = useProject()
  const [isCalculating, setIsCalculating] = useState(false)
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null)
  const [lastCalculatedAt, setLastCalculatedAt] = useState<Date | null>(null)

  const tasks = projectData?.tasks ?? []
  const dependencies = projectData?.dependencies ?? []

  // Calculate schedule
  const calculateProjectSchedule = useCallback((): SchedulingResult => {
    setIsCalculating(true)

    try {
      const result = calculateSchedule(tasks, dependencies, options)
      setSchedulingResult(result)
      setLastCalculatedAt(new Date())
      return result
    } finally {
      setIsCalculating(false)
    }
  }, [tasks, dependencies, options])

  // Memoized schedule calculation for automatic updates
  const memoizedResult = useMemo(() => {
    if (tasks.length === 0) {
      return {
        scheduledTasks: new Map<string, ScheduledTaskInfo>(),
        criticalPath: [],
        conflicts: [],
        projectDuration: 0,
        projectStart: new Date(),
        projectEnd: new Date(),
      } as SchedulingResult
    }

    return calculateSchedule(tasks, dependencies, options)
  }, [tasks, dependencies, options])

  // Recalculate on demand
  const recalculate = useCallback(() => {
    calculateProjectSchedule()
  }, [calculateProjectSchedule])

  // Critical path helpers
  const criticalPath = useMemo(() => {
    return memoizedResult?.criticalPath ?? []
  }, [memoizedResult])

  const isTaskOnCriticalPath = useCallback(
    (taskId: string): boolean => {
      return criticalPath.includes(taskId)
    },
    [criticalPath]
  )

  // Slack helpers
  const getSlack = useCallback(
    (taskId: string): { totalSlack: number; freeSlack: number } | null => {
      const taskInfo = memoizedResult?.scheduledTasks.get(taskId)
      if (!taskInfo) return null

      return {
        totalSlack: taskInfo.totalSlack,
        freeSlack: taskInfo.freeSlack,
      }
    },
    [memoizedResult]
  )

  const getScheduledTaskInfo = useCallback(
    (taskId: string): ScheduledTaskInfo | null => {
      return memoizedResult?.scheduledTasks.get(taskId) ?? null
    },
    [memoizedResult]
  )

  // Validation helpers
  const validateDates = useCallback(
    (
      taskId: string,
      proposedStart: Date,
      proposedEnd: Date
    ) => {
      const task = tasks.find(t => t.id === taskId)
      if (!task) {
        return {
          valid: false,
          constraintResult: { valid: false, reason: 'Taak niet gevonden' },
          finishConstraintResult: { valid: true },
          dependencyResult: { valid: true, conflicts: [] },
        }
      }

      return validateTaskDates(
        task,
        proposedStart,
        proposedEnd,
        dependencies,
        tasks,
        options.calendar
      )
    },
    [tasks, dependencies, options.calendar]
  )

  const getEarliestStart = useCallback(
    (taskId: string): Date => {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return new Date()

      return getEarliestStartDate(task, dependencies, tasks, options.calendar)
    },
    [tasks, dependencies, options.calendar]
  )

  // Dependency helpers
  const getTaskPredecessors = useCallback(
    (taskId: string): string[] => {
      return getPredecessors(taskId, dependencies)
    },
    [dependencies]
  )

  const getTaskSuccessors = useCallback(
    (taskId: string): string[] => {
      return getSuccessors(taskId, dependencies)
    },
    [dependencies]
  )

  // Conflicts
  const conflicts = useMemo(() => {
    return memoizedResult?.conflicts ?? []
  }, [memoizedResult])

  const hasConflicts = conflicts.length > 0

  return {
    isCalculating,
    schedulingResult: schedulingResult ?? memoizedResult,
    lastCalculatedAt,

    calculateProjectSchedule,
    recalculate,

    criticalPath,
    isTaskOnCriticalPath,

    getSlack,
    getScheduledTaskInfo,

    validateDates,
    getEarliestStart,

    getTaskPredecessors,
    getTaskSuccessors,

    conflicts,
    hasConflicts,
  }
}

// =============================================================================
// Utility Hook: useTaskScheduling
// =============================================================================

/**
 * Hook for scheduling a single task
 */
export function useTaskScheduling(taskId: string) {
  const scheduler = useScheduler()

  const scheduledInfo = useMemo(
    () => scheduler.getScheduledTaskInfo(taskId),
    [scheduler, taskId]
  )

  const isCritical = useMemo(
    () => scheduler.isTaskOnCriticalPath(taskId),
    [scheduler, taskId]
  )

  const slack = useMemo(
    () => scheduler.getSlack(taskId),
    [scheduler, taskId]
  )

  const predecessors = useMemo(
    () => scheduler.getTaskPredecessors(taskId),
    [scheduler, taskId]
  )

  const successors = useMemo(
    () => scheduler.getTaskSuccessors(taskId),
    [scheduler, taskId]
  )

  const validateNewDates = useCallback(
    (proposedStart: Date, proposedEnd: Date) => {
      return scheduler.validateDates(taskId, proposedStart, proposedEnd)
    },
    [scheduler, taskId]
  )

  const earliestStart = useMemo(
    () => scheduler.getEarliestStart(taskId),
    [scheduler, taskId]
  )

  return {
    scheduledInfo,
    isCritical,
    slack,
    predecessors,
    successors,
    validateNewDates,
    earliestStart,
  }
}

export default useScheduler
