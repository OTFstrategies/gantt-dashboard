import { describe, it, expect } from 'vitest'
import {
  calculateSchedule,
  getCriticalPath,
  getPredecessors,
  getSuccessors,
  getAllPredecessors,
  getAllSuccessors,
} from './scheduler'
import type { Task, Dependency } from '@/types'
import { ConstraintType, SchedulingMode, DependencyType } from '@/types'

// =============================================================================
// Test Data Factory
// =============================================================================

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    project_id: 'project-1',
    name: 'Test Task',
    start_date: '2024-01-01',
    end_date: '2024-01-05',
    duration: 5,
    percent_done: 0,
    constraint_type: ConstraintType.AS_SOON_AS_POSSIBLE,
    scheduling_mode: SchedulingMode.NORMAL,
    manually_scheduled: false,
    rollup: false,
    show_in_timeline: true,
    inactive: false,
    order_index: 0,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function createDependency(
  fromTask: string,
  toTask: string,
  overrides: Partial<Dependency> = {}
): Dependency {
  return {
    id: `dep-${fromTask}-${toTask}`,
    project_id: 'project-1',
    from_task: fromTask,
    to_task: toTask,
    type: DependencyType.FINISH_TO_START,
    lag: 0,
    lag_unit: 'day',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

// =============================================================================
// Schedule Calculation Tests
// =============================================================================

describe('calculateSchedule', () => {
  it('should calculate schedule for single task', () => {
    const tasks = [
      createTask({
        id: 'task-1',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        duration: 5,
      }),
    ]

    const result = calculateSchedule(tasks, [])

    expect(result.scheduledTasks.size).toBe(1)
    expect(result.criticalPath).toContain('task-1')
    expect(result.conflicts).toHaveLength(0)
  })

  it('should calculate schedule for sequential tasks with FS dependency', () => {
    const tasks = [
      createTask({
        id: 'task-1',
        name: 'Task 1',
        start_date: '2024-01-01',
        duration: 3,
      }),
      createTask({
        id: 'task-2',
        name: 'Task 2',
        start_date: '2024-01-04',
        duration: 2,
      }),
    ]

    const dependencies = [
      createDependency('task-1', 'task-2'),
    ]

    const result = calculateSchedule(tasks, dependencies)

    expect(result.scheduledTasks.size).toBe(2)
    expect(result.criticalPath).toContain('task-1')
    expect(result.criticalPath).toContain('task-2')
  })

  it('should calculate slack for non-critical tasks', () => {
    // Diamond pattern: A -> B, A -> C, B -> D, C -> D
    // If C is longer, B will have slack
    const tasks = [
      createTask({ id: 'A', start_date: '2024-01-01', duration: 2 }),
      createTask({ id: 'B', start_date: '2024-01-03', duration: 2 }),
      createTask({ id: 'C', start_date: '2024-01-03', duration: 5 }),
      createTask({ id: 'D', start_date: '2024-01-08', duration: 2 }),
    ]

    const dependencies = [
      createDependency('A', 'B'),
      createDependency('A', 'C'),
      createDependency('B', 'D'),
      createDependency('C', 'D'),
    ]

    const result = calculateSchedule(tasks, dependencies)

    // Task B should have slack (C is longer path)
    const taskB = result.scheduledTasks.get('B')
    expect(taskB).toBeDefined()
    expect(taskB?.totalSlack).toBeGreaterThan(0)
    expect(taskB?.isCritical).toBe(false)

    // Task C should be on critical path
    const taskC = result.scheduledTasks.get('C')
    expect(taskC?.isCritical).toBe(true)
  })

  it('should detect circular dependencies', () => {
    const tasks = [
      createTask({ id: 'A', start_date: '2024-01-01', duration: 2 }),
      createTask({ id: 'B', start_date: '2024-01-03', duration: 2 }),
      createTask({ id: 'C', start_date: '2024-01-05', duration: 2 }),
    ]

    // A -> B -> C -> A (circular)
    const dependencies = [
      createDependency('A', 'B'),
      createDependency('B', 'C'),
      createDependency('C', 'A'),
    ]

    const result = calculateSchedule(tasks, dependencies)

    expect(result.conflicts.length).toBeGreaterThan(0)
    expect(result.conflicts[0].type).toBe('circular_dependency')
  })

  it('should handle tasks without dates', () => {
    const tasks = [
      createTask({
        id: 'task-1',
        start_date: undefined,
        end_date: undefined,
        duration: 3,
      }),
    ]

    const result = calculateSchedule(tasks, [])

    // Should still calculate with default dates
    expect(result.scheduledTasks.size).toBe(1)
  })

  it('should skip inactive tasks', () => {
    const tasks = [
      createTask({ id: 'active', inactive: false }),
      createTask({ id: 'inactive', inactive: true }),
    ]

    const result = calculateSchedule(tasks, [])

    expect(result.scheduledTasks.size).toBe(1)
    expect(result.scheduledTasks.has('active')).toBe(true)
    expect(result.scheduledTasks.has('inactive')).toBe(false)
  })
})

// =============================================================================
// Critical Path Tests
// =============================================================================

describe('getCriticalPath', () => {
  it('should return critical path task IDs', () => {
    const tasks = [
      createTask({ id: 'task-1', duration: 5 }),
      createTask({ id: 'task-2', duration: 3 }),
    ]

    const dependencies = [
      createDependency('task-1', 'task-2'),
    ]

    const criticalPath = getCriticalPath(tasks, dependencies)

    expect(criticalPath).toContain('task-1')
    expect(criticalPath).toContain('task-2')
  })

  it('should identify longest path as critical', () => {
    // Parallel paths: A -> B (5 days) and A -> C (2 days), both to D
    const tasks = [
      createTask({ id: 'A', duration: 1 }),
      createTask({ id: 'B', duration: 5 }),
      createTask({ id: 'C', duration: 2 }),
      createTask({ id: 'D', duration: 1 }),
    ]

    const dependencies = [
      createDependency('A', 'B'),
      createDependency('A', 'C'),
      createDependency('B', 'D'),
      createDependency('C', 'D'),
    ]

    const criticalPath = getCriticalPath(tasks, dependencies)

    expect(criticalPath).toContain('A')
    expect(criticalPath).toContain('B')
    expect(criticalPath).toContain('D')
    expect(criticalPath).not.toContain('C')
  })
})

// =============================================================================
// Predecessor/Successor Tests
// =============================================================================

describe('getPredecessors', () => {
  it('should return direct predecessors', () => {
    const dependencies = [
      createDependency('A', 'C'),
      createDependency('B', 'C'),
      createDependency('C', 'D'),
    ]

    const predecessors = getPredecessors('C', dependencies)

    expect(predecessors).toContain('A')
    expect(predecessors).toContain('B')
    expect(predecessors).not.toContain('D')
  })

  it('should return empty array for tasks without predecessors', () => {
    const dependencies = [
      createDependency('A', 'B'),
    ]

    const predecessors = getPredecessors('A', dependencies)

    expect(predecessors).toHaveLength(0)
  })
})

describe('getSuccessors', () => {
  it('should return direct successors', () => {
    const dependencies = [
      createDependency('A', 'B'),
      createDependency('A', 'C'),
      createDependency('B', 'D'),
    ]

    const successors = getSuccessors('A', dependencies)

    expect(successors).toContain('B')
    expect(successors).toContain('C')
    expect(successors).not.toContain('D')
  })
})

describe('getAllPredecessors', () => {
  it('should return all transitive predecessors', () => {
    const dependencies = [
      createDependency('A', 'B'),
      createDependency('B', 'C'),
      createDependency('C', 'D'),
    ]

    const allPredecessors = getAllPredecessors('D', dependencies)

    expect(allPredecessors).toContain('A')
    expect(allPredecessors).toContain('B')
    expect(allPredecessors).toContain('C')
    expect(allPredecessors).not.toContain('D')
  })
})

describe('getAllSuccessors', () => {
  it('should return all transitive successors', () => {
    const dependencies = [
      createDependency('A', 'B'),
      createDependency('B', 'C'),
      createDependency('C', 'D'),
    ]

    const allSuccessors = getAllSuccessors('A', dependencies)

    expect(allSuccessors).toContain('B')
    expect(allSuccessors).toContain('C')
    expect(allSuccessors).toContain('D')
    expect(allSuccessors).not.toContain('A')
  })
})
