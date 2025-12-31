'use client'

import React, { memo } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import { TaskCard } from './TaskCard'
import type { Task } from '@/types'

// =============================================================================
// Types
// =============================================================================

export interface ColumnDefinition {
  id: string
  title: string
  color: string
}

interface TaskColumnProps {
  column: ColumnDefinition
  tasks: Task[]
  onTaskClick?: (task: Task) => void
}

// =============================================================================
// Task Column Component (Memoized)
// =============================================================================

export const TaskColumn = memo(function TaskColumn({ column, tasks, onTaskClick }: TaskColumnProps) {
  return (
    <div className="task-column">
      <div className="column-header">
        <div
          className="column-indicator"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="column-title">{column.title}</h3>
        <span className="column-count">{tasks.length}</span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-content ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
          >
            {tasks.length === 0 ? (
              <div className="column-empty">
                <p>Geen taken</p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={onTaskClick}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <style dangerouslySetInnerHTML={{__html: `
        .task-column {
          display: flex;
          flex-direction: column;
          min-width: 280px;
          max-width: 320px;
          background: var(--color-gray-50, #f8f9fa);
          border-radius: 8px;
          overflow: hidden;
        }

        .column-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--color-surface, #ffffff);
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .column-indicator {
          width: 4px;
          height: 16px;
          border-radius: 2px;
        }

        .column-title {
          flex: 1;
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary, #212529);
        }

        .column-count {
          padding: 0.125rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-tertiary, #adb5bd);
          background: var(--color-gray-100, #f1f3f5);
          border-radius: 12px;
        }

        .column-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem;
          min-height: 200px;
          overflow-y: auto;
          transition: background-color 0.2s;
        }

        .column-content.drag-over {
          background: var(--color-primary-light, #e7f1ff);
        }

        .column-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          color: var(--color-text-tertiary, #adb5bd);
          font-size: 0.875rem;
        }

        .column-empty p {
          margin: 0;
        }
      `}} />
    </div>
  )
})

// =============================================================================
// Default Columns
// =============================================================================

export const DEFAULT_COLUMNS: ColumnDefinition[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'var(--color-gray-400, #adb5bd)',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: 'var(--color-primary, #0d6efd)',
  },
  {
    id: 'done',
    title: 'Done',
    color: 'var(--color-success, #198754)',
  },
]

// =============================================================================
// Helper: Get column ID for a task
// =============================================================================

export function getColumnForTask(task: Task): string {
  if (task.percent_done === 100) return 'done'
  if (task.percent_done > 0) return 'in-progress'
  return 'todo'
}
