'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import Gantt, { type Task as GanttTask } from 'frappe-gantt'
import type { Task, Dependency } from '@/types'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { CriticalPathToggle, CriticalPathLegend } from '../scheduling'
import { calculateSchedule } from '@/lib/scheduling'

// =============================================================================
// Types
// =============================================================================

export interface GanttChartProps {
  tasks: Task[]
  dependencies?: Dependency[]
  className?: string
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskClick?: (taskId: string) => void
  readOnly?: boolean
  showCriticalPathToggle?: boolean
}

type ViewMode = 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month'

// =============================================================================
// Helper Functions
// =============================================================================

function formatDateForGantt(dateString?: string): string {
  if (!dateString) {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

function transformTasksForGantt(
  tasks: Task[],
  dependencies: Dependency[],
  criticalPath: string[] = [],
  showCriticalPath: boolean = false
): GanttTask[] {
  // Create dependency map: toTask -> fromTask IDs
  const depMap = new Map<string, string[]>()
  dependencies.forEach((dep) => {
    const existing = depMap.get(dep.to_task) || []
    existing.push(dep.from_task)
    depMap.set(dep.to_task, existing)
  })

  const criticalSet = new Set(criticalPath)

  return tasks
    .filter((task) => !task.inactive)
    .map((task) => {
      const deps = depMap.get(task.id)

      // Calculate end date from duration if not set
      let endDate = task.end_date
      if (!endDate && task.start_date && task.duration) {
        const start = new Date(task.start_date)
        start.setDate(start.getDate() + task.duration)
        endDate = start.toISOString()
      }

      // Ensure we have valid dates
      const startStr = formatDateForGantt(task.start_date)
      const endStr = formatDateForGantt(endDate || task.start_date)

      // Make sure end is after start
      const finalEnd = endStr >= startStr ? endStr : startStr

      // Determine custom class
      let customClass: string | undefined
      if (task.percent_done === 100) {
        customClass = 'completed'
      } else if (showCriticalPath && criticalSet.has(task.id)) {
        customClass = 'critical'
      }

      return {
        id: task.id,
        name: task.name,
        start: startStr,
        end: finalEnd,
        progress: task.percent_done,
        dependencies: deps?.join(', '),
        custom_class: customClass,
      }
    })
}

// =============================================================================
// Component
// =============================================================================

function GanttChartInner({
  tasks,
  dependencies = [],
  className = '',
  onTaskUpdate,
  onTaskClick,
  readOnly = false,
  showCriticalPathToggle = true,
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<Gantt | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('Week')
  const [isInitialized, setIsInitialized] = useState(false)
  const [showCriticalPath, setShowCriticalPath] = useState(false)

  // Calculate schedule and critical path
  const schedulingResult = useMemo(() => {
    if (tasks.length === 0) return null
    return calculateSchedule(tasks, dependencies)
  }, [tasks, dependencies])

  const criticalPath = schedulingResult?.criticalPath ?? []

  // Transform tasks for frappe-gantt
  const ganttTasks = transformTasksForGantt(tasks, dependencies, criticalPath, showCriticalPath)

  // Handle date change (drag/resize)
  const handleDateChange = useCallback(
    (task: GanttTask, start: Date, end: Date) => {
      if (readOnly || !onTaskUpdate) return

      onTaskUpdate(task.id, {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      })
    },
    [readOnly, onTaskUpdate]
  )

  // Handle progress change
  const handleProgressChange = useCallback(
    (task: GanttTask, progress: number) => {
      if (readOnly || !onTaskUpdate) return

      onTaskUpdate(task.id, {
        percent_done: Math.round(progress),
      })
    },
    [readOnly, onTaskUpdate]
  )

  // Handle task click
  const handleClick = useCallback(
    (task: GanttTask) => {
      onTaskClick?.(task.id)
    },
    [onTaskClick]
  )

  // Initialize Gantt chart
  useEffect(() => {
    if (!containerRef.current || ganttTasks.length === 0) return

    // Clean up previous instance
    if (ganttRef.current) {
      containerRef.current.innerHTML = ''
    }

    try {
      ganttRef.current = new Gantt(containerRef.current, ganttTasks, {
        view_mode: viewMode,
        date_format: 'YYYY-MM-DD',
        popup_trigger: 'click',
        custom_popup_html: (task: GanttTask) => {
          const progress = task.progress || 0
          return `
            <div class="gantt-popup">
              <h4>${task.name}</h4>
              <p><strong>Start:</strong> ${task.start}</p>
              <p><strong>Eind:</strong> ${task.end}</p>
              <p><strong>Voortgang:</strong> ${progress}%</p>
            </div>
          `
        },
        on_click: handleClick,
        on_date_change: handleDateChange,
        on_progress_change: handleProgressChange,
        readonly: readOnly,
        language: 'nl',
      })

      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize Gantt chart:', error)
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      ganttRef.current = null
    }
  }, [ganttTasks.length]) // Only reinit when task count changes

  // Update view mode
  useEffect(() => {
    if (ganttRef.current && isInitialized) {
      try {
        ganttRef.current.change_view_mode(viewMode)
      } catch (error) {
        console.error('Failed to change view mode:', error)
      }
    }
  }, [viewMode, isInitialized])

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className={`gantt-chart gantt-chart--empty ${className}`}>
        <div className="gantt-chart__empty">
          <p>Geen taken om te tonen</p>
          <small>Voeg taken toe om de Gantt chart te zien</small>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  // Filter out tasks without dates
  const tasksWithDates = tasks.filter((t) => t.start_date)
  if (tasksWithDates.length === 0) {
    return (
      <div className={`gantt-chart gantt-chart--empty ${className}`}>
        <div className="gantt-chart__empty">
          <p>Geen taken met datums</p>
          <small>Taken hebben een startdatum nodig voor de Gantt chart</small>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  return (
    <div className={`gantt-chart ${className}`}>
      {/* Toolbar */}
      <div className="gantt-chart__toolbar">
        <div className="gantt-chart__toolbar-left">
          <div className="gantt-chart__view-modes">
            {(['Day', 'Week', 'Month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                className={`gantt-chart__view-btn ${viewMode === mode ? 'active' : ''}`}
                onClick={() => setViewMode(mode)}
              >
                {mode === 'Day' ? 'Dag' : mode === 'Week' ? 'Week' : 'Maand'}
              </button>
            ))}
          </div>

          {showCriticalPathToggle && (
            <CriticalPathToggle
              enabled={showCriticalPath}
              onChange={setShowCriticalPath}
              criticalTaskCount={criticalPath.length}
            />
          )}
        </div>
        <div className="gantt-chart__info">
          {ganttTasks.length} taken
          {schedulingResult && (
            <span className="gantt-chart__duration">
              &nbsp;• {schedulingResult.projectDuration} werkdagen
            </span>
          )}
        </div>
      </div>

      {/* Critical Path Legend */}
      {showCriticalPath && (
        <div className="gantt-chart__legend">
          <CriticalPathLegend showSlackLegend={false} />
        </div>
      )}

      {/* Gantt Container */}
      <div className="gantt-chart__container">
        <div ref={containerRef} className="gantt-chart__svg" />
      </div>

      <style jsx>{styles}</style>
      <style jsx global>{globalStyles}</style>
    </div>
  )
}

// =============================================================================
// Styles
// =============================================================================

const styles = `
  .gantt-chart {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-surface, #ffffff);
    border-radius: 8px;
    border: 1px solid var(--color-border, #e9ecef);
    overflow: hidden;
  }

  .gantt-chart--empty {
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  .gantt-chart__empty {
    text-align: center;
    color: var(--color-text-secondary, #6c757d);
  }

  .gantt-chart__empty p {
    margin: 0 0 0.25rem;
    font-size: 1rem;
  }

  .gantt-chart__empty small {
    font-size: 0.875rem;
    opacity: 0.7;
  }

  .gantt-chart__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border, #e9ecef);
    background: var(--color-bg-secondary, #f8f9fa);
  }

  .gantt-chart__toolbar-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .gantt-chart__view-modes {
    display: flex;
    gap: 0.25rem;
  }

  .gantt-chart__legend {
    padding: 0.5rem 1rem;
    background: var(--color-surface, #ffffff);
    border-bottom: 1px solid var(--color-border, #e9ecef);
  }

  .gantt-chart__duration {
    color: var(--color-text-secondary, #6c757d);
  }

  .gantt-chart__view-btn {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--color-border, #e9ecef);
    border-radius: 4px;
    background: var(--color-surface, #ffffff);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .gantt-chart__view-btn:hover {
    background: var(--color-bg-tertiary, #e9ecef);
  }

  .gantt-chart__view-btn.active {
    background: var(--color-primary, #0d6efd);
    border-color: var(--color-primary, #0d6efd);
    color: white;
  }

  .gantt-chart__info {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6c757d);
  }

  .gantt-chart__container {
    flex: 1;
    overflow: auto;
  }

  .gantt-chart__svg {
    min-height: 300px;
  }
`

const globalStyles = `
  /* Frappe Gantt Overrides */
  .gantt-container {
    font-family: inherit;
  }

  .gantt .bar {
    fill: var(--color-primary, #0d6efd);
  }

  .gantt .bar-progress {
    fill: var(--color-primary-hover, #0b5ed7);
  }

  .gantt .bar.completed .bar-inner {
    fill: var(--color-success, #28a745);
  }

  .gantt .bar.critical .bar-inner {
    fill: var(--color-critical, #dc3545);
  }

  .gantt .bar.critical {
    fill: var(--color-critical, #dc3545);
  }

  .gantt .bar.critical .bar-progress {
    fill: #a71d2a;
  }

  .gantt .bar-label {
    font-size: 12px;
    font-weight: 500;
  }

  .gantt .tick {
    stroke: var(--color-border, #e9ecef);
  }

  .gantt .grid-row {
    fill: transparent;
  }

  .gantt .grid-row:nth-child(even) {
    fill: var(--color-bg-secondary, #f8f9fa);
  }

  .gantt .row-line {
    stroke: var(--color-border, #e9ecef);
  }

  .gantt .today-highlight {
    fill: rgba(13, 110, 253, 0.1);
  }

  .gantt .arrow {
    stroke: var(--color-gray-400, #6c757d);
    stroke-width: 1.5;
  }

  .gantt .handle {
    fill: var(--color-primary, #0d6efd);
    cursor: ew-resize;
  }

  .gantt-popup {
    padding: 0.5rem;
    min-width: 150px;
  }

  .gantt-popup h4 {
    margin: 0 0 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .gantt-popup p {
    margin: 0.25rem 0;
    font-size: 0.8125rem;
    color: var(--color-text-secondary, #6c757d);
  }

  .gantt-popup p strong {
    color: var(--color-text-primary, #212529);
  }

  /* Lower section styling */
  .gantt .lower-text {
    font-size: 11px;
    fill: var(--color-text-secondary, #6c757d);
  }

  .gantt .upper-text {
    font-size: 12px;
    font-weight: 600;
    fill: var(--color-text-primary, #212529);
  }
`

// =============================================================================
// Export with Error Boundary
// =============================================================================

export function GanttChart(props: GanttChartProps) {
  return (
    <ErrorBoundary fallback={<div>Er ging iets mis met de Gantt chart.</div>}>
      <GanttChartInner {...props} />
    </ErrorBoundary>
  )
}

export default GanttChart
