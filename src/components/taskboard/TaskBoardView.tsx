'use client'

import React from 'react'
import { useProject } from '@/providers'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { TaskBoard } from './TaskBoard'
import type { Task } from '@/types'

// =============================================================================
// Types
// =============================================================================

export interface TaskBoardViewProps {
  className?: string
  onTaskClick?: (taskId: string) => void
  onTaskMove?: (taskId: string, newStatus: string) => void
  readOnly?: boolean
}

// =============================================================================
// Component
// =============================================================================

function TaskBoardViewInner({
  className = '',
  onTaskClick,
  readOnly = false,
}: TaskBoardViewProps) {
  const { projectData, syncState, updateTask } = useProject()

  if (syncState.isLoading) {
    return (
      <div className={`taskboard-view taskboard-view--loading ${className}`}>
        <div className="taskboard-view__loader">
          <div className="taskboard-view__spinner" />
          <p>TaskBoard laden...</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  if (syncState.error) {
    return (
      <div className={`taskboard-view taskboard-view--error ${className}`}>
        <div className="taskboard-view__error">
          <span className="taskboard-view__error-icon">⚠️</span>
          <p>{syncState.error}</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  const tasks = projectData?.tasks || []

  const handleTaskClick = (task: Task) => {
    onTaskClick?.(task.id)
  }

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    if (!readOnly) {
      updateTask(taskId, updates)
    }
  }

  return (
    <div className={`taskboard-view ${className}`}>
      <TaskBoard
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onTaskUpdate={handleTaskUpdate}
      />
      <style jsx>{styles}</style>
    </div>
  )
}

// =============================================================================
// Styles
// =============================================================================

const styles = `
  .taskboard-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 400px;
    background: var(--color-bg-secondary, #f5f5f5);
    overflow: hidden;
  }

  .taskboard-view--loading,
  .taskboard-view--error {
    justify-content: center;
    align-items: center;
  }

  .taskboard-view__loader {
    text-align: center;
    color: var(--color-text-secondary, #666);
  }

  .taskboard-view__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border, #ddd);
    border-top-color: var(--color-primary, #0066cc);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .taskboard-view__error {
    text-align: center;
    color: var(--color-error, #dc3545);
  }

  .taskboard-view__error-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }
`

// =============================================================================
// Export with Error Boundary
// =============================================================================

export function TaskBoardView(props: TaskBoardViewProps) {
  return (
    <ErrorBoundary fallback={<div>Er ging iets mis met de TaskBoard view.</div>}>
      <TaskBoardViewInner {...props} />
    </ErrorBoundary>
  )
}

export default TaskBoardView
