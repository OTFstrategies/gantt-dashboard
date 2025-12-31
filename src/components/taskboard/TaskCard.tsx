'use client'

import React, { memo, useCallback } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import type { Task } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface TaskCardProps {
  task: Task
  index: number
  onClick?: (task: Task) => void
}

// =============================================================================
// Task Card Component (Memoized)
// =============================================================================

const TaskCardInner = memo(function TaskCardInner({ task, index, onClick }: TaskCardProps) {
  const priorityColor = getPriorityColor(task.percent_done)

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
          onClick={() => onClick?.(task)}
        >
          <div className="task-card-header">
            <span className="task-name">{task.name}</span>
            {task.wbs_code && (
              <span className="task-wbs">{task.wbs_code}</span>
            )}
          </div>

          {task.note && (
            <p className="task-note">{task.note}</p>
          )}

          <div className="task-card-footer">
            <div className="task-progress">
              <div
                className="progress-bar"
                style={{
                  width: `${task.percent_done}%`,
                  backgroundColor: priorityColor
                }}
              />
              <span className="progress-text">{task.percent_done}%</span>
            </div>

            {task.end_date && (
              <span className="task-date">
                {formatDate(task.end_date)}
              </span>
            )}
          </div>

          <style jsx>{`
            .task-card {
              padding: 0.75rem;
              background: var(--color-surface, #ffffff);
              border: 1px solid var(--color-border, #e9ecef);
              border-radius: 6px;
              cursor: grab;
              transition: box-shadow 0.2s, border-color 0.2s;
            }

            .task-card:hover {
              border-color: var(--color-primary, #0d6efd);
            }

            .task-card.dragging {
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
              cursor: grabbing;
            }

            .task-card-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 0.5rem;
              margin-bottom: 0.5rem;
            }

            .task-name {
              font-weight: 500;
              font-size: 0.875rem;
              color: var(--color-text-primary, #212529);
              word-break: break-word;
            }

            .task-wbs {
              flex-shrink: 0;
              padding: 0.125rem 0.375rem;
              font-size: 0.625rem;
              font-weight: 600;
              color: var(--color-text-tertiary, #adb5bd);
              background: var(--color-gray-100, #f1f3f5);
              border-radius: 4px;
            }

            .task-note {
              margin: 0 0 0.5rem;
              font-size: 0.75rem;
              color: var(--color-text-secondary, #6c757d);
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            .task-card-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 0.5rem;
            }

            .task-progress {
              flex: 1;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }

            .progress-bar {
              flex: 1;
              height: 4px;
              background: var(--color-gray-200, #e9ecef);
              border-radius: 2px;
              position: relative;
            }

            .progress-bar::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              height: 100%;
              border-radius: 2px;
              background: inherit;
            }

            .progress-text {
              font-size: 0.625rem;
              font-weight: 600;
              color: var(--color-text-tertiary, #adb5bd);
              min-width: 2rem;
            }

            .task-date {
              font-size: 0.625rem;
              color: var(--color-text-tertiary, #adb5bd);
            }
          `}</style>
        </div>
      )}
    </Draggable>
  )
})

// =============================================================================
// Helpers
// =============================================================================

function getPriorityColor(percentDone: number): string {
  if (percentDone === 100) return 'var(--color-success, #198754)'
  if (percentDone > 50) return 'var(--color-primary, #0d6efd)'
  if (percentDone > 0) return 'var(--color-warning, #ffc107)'
  return 'var(--color-gray-400, #ced4da)'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
  })
}

// =============================================================================
// Export with custom comparison
// =============================================================================

export function TaskCard(props: TaskCardProps) {
  return <TaskCardInner {...props} />
}

// For direct import
export default TaskCard
