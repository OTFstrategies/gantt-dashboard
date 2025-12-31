/**
 * CPM Scheduler
 * Critical Path Method implementation for project scheduling
 */

import type { Task, Dependency, DependencyType } from '@/types'
import type {
  SchedulingResult,
  ScheduledTaskInfo,
  SchedulingConflict,
  TaskNode,
  DependencyEdge,
  SchedulingOptions,
} from './types'
import { DEFAULT_SCHEDULING_OPTIONS } from './types'
import { parseDate, countWorkingDays, addWorkingDays, calculateDuration } from './calendar'

// =============================================================================
// Main Scheduler Function
// =============================================================================

/**
 * Calculate the project schedule using Critical Path Method (CPM)
 */
export function calculateSchedule(
  tasks: Task[],
  dependencies: Dependency[],
  options: SchedulingOptions = DEFAULT_SCHEDULING_OPTIONS
): SchedulingResult {
  const opts = { ...DEFAULT_SCHEDULING_OPTIONS, ...options }

  // Build task graph
  const taskGraph = buildTaskGraph(tasks, dependencies)

  // Detect circular dependencies
  const conflicts: SchedulingConflict[] = []
  if (opts.detectCircular) {
    const circular = detectCircularDependencies(taskGraph)
    if (circular.length > 0) {
      conflicts.push(...circular)
    }
  }

  // If we have circular dependencies, we can't calculate the schedule
  if (conflicts.some(c => c.type === 'circular_dependency')) {
    return {
      scheduledTasks: new Map(),
      criticalPath: [],
      conflicts,
      projectDuration: 0,
      projectStart: new Date(),
      projectEnd: new Date(),
    }
  }

  // Calculate project start date
  const projectStart = opts.projectStartDate || getProjectStartDate(tasks)

  // Forward pass: Calculate early start/finish times
  forwardPass(taskGraph, projectStart, opts)

  // Find project end date (max early finish)
  const projectEnd = getProjectEndDate(taskGraph)

  // Backward pass: Calculate late start/finish times
  backwardPass(taskGraph, projectEnd, opts)

  // Calculate slack and identify critical path
  const scheduledTasks = new Map<string, ScheduledTaskInfo>()
  const criticalPath: string[] = []

  for (const [taskId, node] of Array.from(taskGraph.entries())) {
    const totalSlack = node.lateStart - node.earlyStart
    const freeSlack = calculateFreeSlack(node, taskGraph)
    const isCritical = totalSlack === 0

    const taskInfo: ScheduledTaskInfo = {
      taskId,
      earlyStart: daysToDate(node.earlyStart, projectStart),
      earlyFinish: daysToDate(node.earlyFinish, projectStart),
      lateStart: daysToDate(node.lateStart, projectStart),
      lateFinish: daysToDate(node.lateFinish, projectStart),
      totalSlack,
      freeSlack,
      isCritical,
    }

    scheduledTasks.set(taskId, taskInfo)

    if (isCritical) {
      criticalPath.push(taskId)
    }
  }

  // Sort critical path by early start
  criticalPath.sort((a, b) => {
    const aInfo = scheduledTasks.get(a)!
    const bInfo = scheduledTasks.get(b)!
    return aInfo.earlyStart.getTime() - bInfo.earlyStart.getTime()
  })

  return {
    scheduledTasks,
    criticalPath,
    conflicts,
    projectDuration: calculateProjectDuration(projectStart, projectEnd),
    projectStart,
    projectEnd,
  }
}

// =============================================================================
// Graph Building
// =============================================================================

/**
 * Build a task graph from tasks and dependencies
 */
function buildTaskGraph(
  tasks: Task[],
  dependencies: Dependency[]
): Map<string, TaskNode> {
  const graph = new Map<string, TaskNode>()

  // Initialize nodes for all tasks
  for (const task of tasks) {
    if (task.inactive) continue

    const duration = getTaskDuration(task)

    graph.set(task.id, {
      task,
      predecessors: [],
      successors: [],
      earlyStart: 0,
      earlyFinish: 0,
      lateStart: Infinity,
      lateFinish: Infinity,
      duration,
      totalSlack: 0,
      freeSlack: 0,
      visited: false,
    })
  }

  // Add dependency edges
  for (const dep of dependencies) {
    const fromNode = graph.get(dep.from_task)
    const toNode = graph.get(dep.to_task)

    if (fromNode && toNode) {
      const lag = dep.lag || 0

      // Add successor to from-node
      fromNode.successors.push({
        dependency: dep,
        targetTaskId: dep.to_task,
        lag,
      })

      // Add predecessor to to-node
      toNode.predecessors.push({
        dependency: dep,
        targetTaskId: dep.from_task,
        lag,
      })
    }
  }

  return graph
}

/**
 * Get task duration in days
 */
function getTaskDuration(task: Task): number {
  // If duration is specified, use it
  if (task.duration && task.duration > 0) {
    return task.duration
  }

  // Calculate from start/end dates
  const startDate = parseDate(task.start_date)
  const endDate = parseDate(task.end_date)

  if (startDate && endDate) {
    return calculateDuration(startDate, endDate)
  }

  // Default: 1 day
  return 1
}

// =============================================================================
// Forward Pass
// =============================================================================

/**
 * Forward pass: Calculate early start and early finish times
 */
function forwardPass(
  graph: Map<string, TaskNode>,
  projectStart: Date,
  _options: SchedulingOptions
): void {
  // Reset visited flags
  for (const node of Array.from(graph.values())) {
    node.visited = false
    node.earlyStart = 0
    node.earlyFinish = 0
  }

  // Find tasks with no predecessors (start tasks)
  const startTasks: TaskNode[] = []
  for (const node of Array.from(graph.values())) {
    if (node.predecessors.length === 0) {
      startTasks.push(node)
    }
  }

  // If a task has a specific start date, use that as its early start
  for (const node of Array.from(graph.values())) {
    const taskStart = parseDate(node.task.start_date)
    if (taskStart && node.task.manually_scheduled) {
      const daysSinceProjectStart = dateToDays(taskStart, projectStart)
      node.earlyStart = Math.max(0, daysSinceProjectStart)
    }
  }

  // Process tasks in topological order
  const queue = [...startTasks]

  while (queue.length > 0) {
    const node = queue.shift()!

    if (node.visited) continue

    // Check if all predecessors are visited
    const allPredecessorsVisited = node.predecessors.every(
      pred => graph.get(pred.targetTaskId)?.visited
    )

    if (!allPredecessorsVisited) {
      // Re-queue this node
      queue.push(node)
      continue
    }

    // Calculate early start based on predecessors
    let maxPredFinish = 0

    for (const pred of node.predecessors) {
      const predNode = graph.get(pred.targetTaskId)
      if (predNode) {
        const predFinishWithLag = calculateDependencyDate(
          predNode,
          pred.dependency.type,
          pred.lag,
          true // forward pass
        )
        maxPredFinish = Math.max(maxPredFinish, predFinishWithLag)
      }
    }

    // If task has a manually set start date, use that if it's later
    if (node.task.manually_scheduled && node.task.start_date) {
      const manualStart = dateToDays(parseDate(node.task.start_date)!, projectStart)
      node.earlyStart = Math.max(maxPredFinish, manualStart)
    } else {
      node.earlyStart = maxPredFinish
    }

    node.earlyFinish = node.earlyStart + node.duration

    node.visited = true

    // Queue successors
    for (const succ of node.successors) {
      const succNode = graph.get(succ.targetTaskId)
      if (succNode && !succNode.visited) {
        queue.push(succNode)
      }
    }
  }
}

// =============================================================================
// Backward Pass
// =============================================================================

/**
 * Backward pass: Calculate late start and late finish times
 */
function backwardPass(
  graph: Map<string, TaskNode>,
  projectEnd: Date,
  _options: SchedulingOptions
): void {
  // Reset visited flags
  for (const node of Array.from(graph.values())) {
    node.visited = false
    node.lateStart = Infinity
    node.lateFinish = Infinity
  }

  // Find the maximum early finish (project duration)
  let maxEarlyFinish = 0
  for (const node of Array.from(graph.values())) {
    maxEarlyFinish = Math.max(maxEarlyFinish, node.earlyFinish)
  }

  // Find tasks with no successors (end tasks)
  const endTasks: TaskNode[] = []
  for (const node of Array.from(graph.values())) {
    if (node.successors.length === 0) {
      endTasks.push(node)
    }
  }

  // Initialize end tasks with project end
  for (const node of endTasks) {
    node.lateFinish = maxEarlyFinish
    node.lateStart = node.lateFinish - node.duration
  }

  // Process tasks in reverse topological order
  const queue = [...endTasks]

  while (queue.length > 0) {
    const node = queue.shift()!

    if (node.visited) continue

    // Check if all successors are visited
    const allSuccessorsVisited = node.successors.every(
      succ => graph.get(succ.targetTaskId)?.visited
    )

    if (!allSuccessorsVisited) {
      queue.push(node)
      continue
    }

    // Calculate late finish based on successors
    let minSuccStart = maxEarlyFinish

    for (const succ of node.successors) {
      const succNode = graph.get(succ.targetTaskId)
      if (succNode) {
        const succStartWithLag = calculateDependencyDate(
          succNode,
          succ.dependency.type,
          succ.lag,
          false // backward pass
        )
        minSuccStart = Math.min(minSuccStart, succStartWithLag)
      }
    }

    if (node.successors.length === 0) {
      node.lateFinish = maxEarlyFinish
    } else {
      node.lateFinish = minSuccStart
    }

    node.lateStart = node.lateFinish - node.duration

    node.visited = true

    // Queue predecessors
    for (const pred of node.predecessors) {
      const predNode = graph.get(pred.targetTaskId)
      if (predNode && !predNode.visited) {
        queue.push(predNode)
      }
    }
  }
}

// =============================================================================
// Dependency Calculations
// =============================================================================

/**
 * Calculate dependency date based on dependency type
 */
function calculateDependencyDate(
  relatedNode: TaskNode,
  depType: DependencyType,
  lag: number,
  isForwardPass: boolean
): number {
  if (isForwardPass) {
    // Forward pass: calculating when successor can start
    switch (depType) {
      case 2: // Finish-to-Start (FS)
        return relatedNode.earlyFinish + lag
      case 0: // Start-to-Start (SS)
        return relatedNode.earlyStart + lag
      case 3: // Finish-to-Finish (FF)
        return relatedNode.earlyFinish + lag // Will be adjusted by successor's duration
      case 1: // Start-to-Finish (SF)
        return relatedNode.earlyStart + lag // Will be adjusted by successor's duration
      default:
        return relatedNode.earlyFinish + lag
    }
  } else {
    // Backward pass: calculating when predecessor must finish
    switch (depType) {
      case 2: // Finish-to-Start (FS)
        return relatedNode.lateStart - lag
      case 0: // Start-to-Start (SS)
        return relatedNode.lateStart - lag // + predecessor duration
      case 3: // Finish-to-Finish (FF)
        return relatedNode.lateFinish - lag
      case 1: // Start-to-Finish (SF)
        return relatedNode.lateFinish - lag
      default:
        return relatedNode.lateStart - lag
    }
  }
}

// =============================================================================
// Slack Calculations
// =============================================================================

/**
 * Calculate free slack for a task
 */
function calculateFreeSlack(
  node: TaskNode,
  graph: Map<string, TaskNode>
): number {
  if (node.successors.length === 0) {
    // For end tasks, free slack equals total slack
    return node.lateStart - node.earlyStart
  }

  // Free slack = min(successor early start) - this task early finish
  let minSuccEarlyStart = Infinity

  for (const succ of node.successors) {
    const succNode = graph.get(succ.targetTaskId)
    if (succNode) {
      const succStartWithLag = succNode.earlyStart - succ.lag
      minSuccEarlyStart = Math.min(minSuccEarlyStart, succStartWithLag)
    }
  }

  return Math.max(0, minSuccEarlyStart - node.earlyFinish)
}

// =============================================================================
// Circular Dependency Detection
// =============================================================================

/**
 * Detect circular dependencies using DFS
 */
function detectCircularDependencies(
  graph: Map<string, TaskNode>
): SchedulingConflict[] {
  const conflicts: SchedulingConflict[] = []
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const cyclePaths: string[][] = []

  function dfs(nodeId: string, path: string[]): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const node = graph.get(nodeId)
    if (!node) return false

    for (const succ of node.successors) {
      if (!visited.has(succ.targetTaskId)) {
        if (dfs(succ.targetTaskId, [...path, nodeId])) {
          return true
        }
      } else if (recursionStack.has(succ.targetTaskId)) {
        // Found a cycle
        const cycleStart = path.indexOf(succ.targetTaskId)
        const cycle = cycleStart >= 0
          ? [...path.slice(cycleStart), nodeId, succ.targetTaskId]
          : [...path, nodeId, succ.targetTaskId]
        cyclePaths.push(cycle)
        return true
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  for (const nodeId of Array.from(graph.keys())) {
    if (!visited.has(nodeId)) {
      dfs(nodeId, [])
    }
  }

  // Convert cycle paths to conflicts
  for (const cycle of cyclePaths) {
    conflicts.push({
      type: 'circular_dependency',
      taskIds: cycle,
      message: `Circulaire afhankelijkheid gedetecteerd: ${cycle.join(' → ')}`,
      severity: 'error',
    })
  }

  return conflicts
}

// =============================================================================
// Critical Path Helpers
// =============================================================================

/**
 * Get the critical path task IDs
 */
export function getCriticalPath(
  tasks: Task[],
  dependencies: Dependency[],
  options?: SchedulingOptions
): string[] {
  const result = calculateSchedule(tasks, dependencies, options)
  return result.criticalPath
}

/**
 * Check if a specific task is on the critical path
 */
export function isTaskCritical(
  taskId: string,
  tasks: Task[],
  dependencies: Dependency[],
  options?: SchedulingOptions
): boolean {
  const result = calculateSchedule(tasks, dependencies, options)
  return result.criticalPath.includes(taskId)
}

/**
 * Get slack information for a task
 */
export function getTaskSlack(
  taskId: string,
  tasks: Task[],
  dependencies: Dependency[],
  options?: SchedulingOptions
): { totalSlack: number; freeSlack: number } | null {
  const result = calculateSchedule(tasks, dependencies, options)
  const taskInfo = result.scheduledTasks.get(taskId)

  if (!taskInfo) return null

  return {
    totalSlack: taskInfo.totalSlack,
    freeSlack: taskInfo.freeSlack,
  }
}

// =============================================================================
// Predecessor/Successor Helpers
// =============================================================================

/**
 * Get all predecessor task IDs for a task
 */
export function getPredecessors(
  taskId: string,
  dependencies: Dependency[]
): string[] {
  return dependencies
    .filter(d => d.to_task === taskId)
    .map(d => d.from_task)
}

/**
 * Get all successor task IDs for a task
 */
export function getSuccessors(
  taskId: string,
  dependencies: Dependency[]
): string[] {
  return dependencies
    .filter(d => d.from_task === taskId)
    .map(d => d.to_task)
}

/**
 * Get all transitive predecessors (including predecessors of predecessors)
 */
export function getAllPredecessors(
  taskId: string,
  dependencies: Dependency[]
): string[] {
  const result = new Set<string>()
  const queue = getPredecessors(taskId, dependencies)

  while (queue.length > 0) {
    const predId = queue.shift()!
    if (!result.has(predId)) {
      result.add(predId)
      queue.push(...getPredecessors(predId, dependencies))
    }
  }

  return Array.from(result)
}

/**
 * Get all transitive successors
 */
export function getAllSuccessors(
  taskId: string,
  dependencies: Dependency[]
): string[] {
  const result = new Set<string>()
  const queue = getSuccessors(taskId, dependencies)

  while (queue.length > 0) {
    const succId = queue.shift()!
    if (!result.has(succId)) {
      result.add(succId)
      queue.push(...getSuccessors(succId, dependencies))
    }
  }

  return Array.from(result)
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get the project start date from tasks
 */
function getProjectStartDate(tasks: Task[]): Date {
  let minDate = new Date()

  for (const task of tasks) {
    if (task.inactive) continue

    const startDate = parseDate(task.start_date)
    if (startDate && startDate < minDate) {
      minDate = startDate
    }
  }

  return minDate
}

/**
 * Get the project end date from the graph
 */
function getProjectEndDate(graph: Map<string, TaskNode>): Date {
  let maxDays = 0
  let projectStart = new Date()

  for (const node of Array.from(graph.values())) {
    maxDays = Math.max(maxDays, node.earlyFinish)
    const taskStart = parseDate(node.task.start_date)
    if (taskStart && taskStart < projectStart) {
      projectStart = taskStart
    }
  }

  return addWorkingDays(projectStart, maxDays)
}

/**
 * Calculate project duration in days
 */
function calculateProjectDuration(start: Date, end: Date): number {
  return countWorkingDays(start, end)
}

/**
 * Convert days from project start to Date
 */
function daysToDate(days: number, projectStart: Date): Date {
  return addWorkingDays(projectStart, days)
}

/**
 * Convert Date to days from project start
 */
function dateToDays(date: Date, projectStart: Date): number {
  return countWorkingDays(projectStart, date)
}
