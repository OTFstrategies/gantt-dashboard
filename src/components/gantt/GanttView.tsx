'use client'

import React from 'react'
import { useProject } from '@/providers'
import { ErrorBoundary } from '../shared/ErrorBoundary'

// =============================================================================
// Types
// =============================================================================

export interface GanttViewProps {
  className?: string
  onTaskClick?: (taskId: string) => void
  onTaskDoubleClick?: (taskId: string) => void
  readOnly?: boolean
}

// =============================================================================
// Component
// =============================================================================

function GanttViewInner({
  className = '',
  onTaskClick,
  onTaskDoubleClick,
  readOnly = false,
}: GanttViewProps) {
  const { projectData, syncState } = useProject()

  if (syncState.isLoading) {
    return (
      <div className={`gantt-view gantt-view--loading ${className}`}>
        <div className="gantt-view__loader">
          <div className="gantt-view__spinner" />
          <p>Project laden...</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  if (syncState.error) {
    return (
      <div className={`gantt-view gantt-view--error ${className}`}>
        <div className="gantt-view__error">
          <span className="gantt-view__error-icon">⚠️</span>
          <p>{syncState.error}</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  const taskCount = projectData?.tasks.length || 0

  return (
    <div className={`gantt-view ${className}`}>
      <div className="gantt-view__placeholder">
        <div className="gantt-view__icon">📊</div>
        <h2 className="gantt-view__title">Gantt View</h2>
        <p className="gantt-view__subtitle">
          {taskCount > 0
            ? `${taskCount} taken geladen - implementatie volgt`
            : 'Geen taken gevonden'
          }
        </p>
        <div className="gantt-view__info">
          <p>Deze view wordt vervangen door een open-source Gantt implementatie.</p>
          <p>Zie <code>WBS-GANTT-REBUILD.md</code> voor de planning.</p>
        </div>
        {taskCount > 0 && (
          <div className="gantt-view__preview">
            <h3>Geladen taken:</h3>
            <ul>
              {projectData?.tasks.slice(0, 5).map(task => (
                <li
                  key={task.id}
                  onClick={() => onTaskClick?.(task.id)}
                  onDoubleClick={() => onTaskDoubleClick?.(task.id)}
                >
                  {task.name}
                </li>
              ))}
              {taskCount > 5 && <li className="gantt-view__more">...en {taskCount - 5} meer</li>}
            </ul>
          </div>
        )}
      </div>
      <style jsx>{styles}</style>
    </div>
  )
}

// =============================================================================
// Styles
// =============================================================================

const styles = `
  .gantt-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 400px;
    background: var(--color-bg-secondary, #f5f5f5);
    border-radius: 8px;
    overflow: hidden;
  }

  .gantt-view--loading,
  .gantt-view--error {
    justify-content: center;
    align-items: center;
  }

  .gantt-view__loader {
    text-align: center;
    color: var(--color-text-secondary, #666);
  }

  .gantt-view__spinner {
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

  .gantt-view__error {
    text-align: center;
    color: var(--color-error, #dc3545);
  }

  .gantt-view__error-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }

  .gantt-view__placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 48px;
    text-align: center;
  }

  .gantt-view__icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .gantt-view__title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--color-text-primary, #333);
  }

  .gantt-view__subtitle {
    font-size: 16px;
    color: var(--color-text-secondary, #666);
    margin: 0 0 24px;
  }

  .gantt-view__info {
    max-width: 400px;
    padding: 16px;
    background: var(--color-bg-tertiary, #fff);
    border-radius: 8px;
    border: 1px dashed var(--color-border, #ddd);
  }

  .gantt-view__info p {
    margin: 0 0 8px;
    font-size: 14px;
    color: var(--color-text-secondary, #666);
  }

  .gantt-view__info p:last-child {
    margin-bottom: 0;
  }

  .gantt-view__info code {
    background: var(--color-bg-secondary, #f0f0f0);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }

  .gantt-view__preview {
    margin-top: 24px;
    padding: 16px;
    background: var(--color-bg-tertiary, #fff);
    border-radius: 8px;
    text-align: left;
    max-width: 400px;
    width: 100%;
  }

  .gantt-view__preview h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px;
    color: var(--color-text-primary, #333);
  }

  .gantt-view__preview ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .gantt-view__preview li {
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .gantt-view__preview li:hover {
    background: var(--color-bg-secondary, #f0f0f0);
  }

  .gantt-view__more {
    color: var(--color-text-secondary, #666);
    font-style: italic;
    cursor: default !important;
  }
`

// =============================================================================
// Export with Error Boundary
// =============================================================================

export function GanttView(props: GanttViewProps) {
  return (
    <ErrorBoundary fallback={<div>Er ging iets mis met de Gantt view.</div>}>
      <GanttViewInner {...props} />
    </ErrorBoundary>
  )
}

export default GanttView
