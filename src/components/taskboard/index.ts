/**
 * D4 TaskBoard Module - Exports
 * Kanban-style task management with drag & drop
 */

// Main view component (with error boundary)
export { TaskBoardView } from './TaskBoardView'
export type { TaskBoardViewProps } from './TaskBoardView'

// Core components
export { TaskBoard } from './TaskBoard'
export { TaskColumn, DEFAULT_COLUMNS, getColumnForTask } from './TaskColumn'
export { TaskCard } from './TaskCard'

// Types
export type { ColumnDefinition } from './TaskColumn'
