'use client'

import React, { useMemo, useCallback } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { TaskColumn, DEFAULT_COLUMNS, getColumnForTask, type ColumnDefinition } from './TaskColumn'
import type { Task } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface TaskBoardProps {
  tasks: Task[]
  columns?: ColumnDefinition[]
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskClick?: (task: Task) => void
}

// =============================================================================
// TaskBoard Component
// =============================================================================

export function TaskBoard({
  tasks,
  columns = DEFAULT_COLUMNS,
  onTaskUpdate,
  onTaskClick,
}: TaskBoardProps) {
  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, Task[]> = {}

    // Initialize empty arrays for each column
    columns.forEach(col => {
      grouped[col.id] = []
    })

    // Sort tasks into columns based on percent_done
    tasks.forEach(task => {
      const columnId = getColumnForTask(task)
      if (grouped[columnId]) {
        grouped[columnId].push(task)
      }
    })

    // Sort tasks within each column by order_index
    Object.keys(grouped).forEach(columnId => {
      grouped[columnId].sort((a, b) => a.order_index - b.order_index)
    })

    return grouped
  }, [tasks, columns])

  // Handle drag end
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result

    // Dropped outside a droppable
    if (!destination) return

    // Dropped in same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Find the task
    const task = tasks.find(t => t.id === draggableId)
    if (!task) return

    // Calculate new percent_done based on destination column
    let newPercentDone = task.percent_done

    if (destination.droppableId === 'todo') {
      newPercentDone = 0
    } else if (destination.droppableId === 'in-progress') {
      // Keep current progress if moving to in-progress, but ensure it's > 0
      newPercentDone = task.percent_done > 0 && task.percent_done < 100
        ? task.percent_done
        : 50 // Default to 50% when moving to in-progress
    } else if (destination.droppableId === 'done') {
      newPercentDone = 100
    }

    // Only update if percent_done changed
    if (newPercentDone !== task.percent_done) {
      onTaskUpdate?.(task.id, { percent_done: newPercentDone })
    }
  }, [tasks, onTaskUpdate])

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="taskboard">
        {columns.map(column => (
          <TaskColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] || []}
            onTaskClick={onTaskClick}
          />
        ))}

        <style jsx>{`
          .taskboard {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            height: 100%;
            overflow-x: auto;
            overflow-y: hidden;
          }
        `}</style>
      </div>
    </DragDropContext>
  )
}
