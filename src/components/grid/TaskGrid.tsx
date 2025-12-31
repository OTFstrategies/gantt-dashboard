'use client'

import React, { useMemo, useState, useCallback, memo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import type { Task, Resource } from '@/types'
import { ErrorBoundary } from '../shared/ErrorBoundary'

// =============================================================================
// Types
// =============================================================================

export interface TaskGridProps {
  tasks: Task[]
  resources?: Resource[]
  className?: string
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskClick?: (taskId: string) => void
}

// =============================================================================
// Column Helper
// =============================================================================

const columnHelper = createColumnHelper<Task>()

// =============================================================================
// Helper Functions
// =============================================================================

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getStatusFromProgress(percentDone: number): string {
  if (percentDone === 100) return 'Done'
  if (percentDone > 0) return 'In Progress'
  return 'To Do'
}

function getStatusColor(percentDone: number): string {
  if (percentDone === 100) return 'var(--color-success, #28a745)'
  if (percentDone > 0) return 'var(--color-primary, #0d6efd)'
  return 'var(--color-gray-400, #6c757d)'
}

// =============================================================================
// Component
// =============================================================================

const TaskGridInner = memo(function TaskGridInner({
  tasks,
  resources: _resources = [],
  className = '',
  onTaskUpdate: _onTaskUpdate,
  onTaskClick,
}: TaskGridProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Memoized click handler
  const handleRowClick = useCallback(
    (taskId: string) => {
      onTaskClick?.(taskId)
    },
    [onTaskClick]
  )

  // Create columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('wbs_code', {
        header: 'WBS',
        cell: (info) => info.getValue() || '-',
        size: 80,
      }),
      columnHelper.accessor('name', {
        header: 'Taaknaam',
        cell: (info) => info.getValue(),
        size: 250,
      }),
      columnHelper.accessor('start_date', {
        header: 'Start',
        cell: (info) => formatDate(info.getValue()),
        size: 100,
      }),
      columnHelper.accessor('end_date', {
        header: 'Eind',
        cell: (info) => formatDate(info.getValue()),
        size: 100,
      }),
      columnHelper.accessor('duration', {
        header: 'Duur',
        cell: (info) => {
          const value = info.getValue()
          const unit = info.row.original.duration_unit || 'days'
          return value ? `${value} ${unit}` : '-'
        },
        size: 80,
      }),
      columnHelper.accessor('percent_done', {
        header: 'Voortgang',
        cell: (info) => {
          const value = info.getValue()
          return (
            <div className="task-grid__progress">
              <div
                className="task-grid__progress-bar"
                style={{
                  width: `${value}%`,
                  backgroundColor: getStatusColor(value),
                }}
              />
              <span className="task-grid__progress-text">{value}%</span>
            </div>
          )
        },
        size: 120,
      }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        cell: (info) => {
          const percentDone = info.row.original.percent_done
          return (
            <span
              className="task-grid__status"
              style={{ color: getStatusColor(percentDone) }}
            >
              {getStatusFromProgress(percentDone)}
            </span>
          )
        },
        size: 100,
      }),
      columnHelper.accessor('note', {
        header: 'Notitie',
        cell: (info) => {
          const value = info.getValue()
          return value ? (
            <span className="task-grid__note" title={value}>
              {value.length > 30 ? `${value.substring(0, 30)}...` : value}
            </span>
          ) : (
            '-'
          )
        },
        size: 150,
      }),
    ],
    []
  )

  // Create table instance
  const table = useReactTable({
    data: tasks,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className={`task-grid ${className}`}>
      {/* Search / Filter Bar */}
      <div className="task-grid__toolbar">
        <input
          type="text"
          placeholder="Zoeken in taken..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="task-grid__search"
        />
        <span className="task-grid__count">
          {table.getFilteredRowModel().rows.length} van {tasks.length} taken
        </span>
      </div>

      {/* Table */}
      <div className="task-grid__table-wrapper">
        <table className="task-grid__table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      width: header.getSize(),
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    }}
                    className={header.column.getIsSorted() ? 'sorted' : ''}
                  >
                    <div className="task-grid__header-content">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() && (
                        <span className="task-grid__sort-icon">
                          {header.column.getIsSorted() === 'asc' ? ' ▲' : ' ▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="task-grid__empty">
                  <p>Geen taken gevonden</p>
                  <small>
                    {globalFilter
                      ? 'Pas je zoekopdracht aan'
                      : 'Voeg taken toe om ze hier te zien'}
                  </small>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row.original.id)}
                  className={row.original.inactive ? 'inactive' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .task-grid {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--color-surface, #ffffff);
          border-radius: 8px;
          border: 1px solid var(--color-border, #e9ecef);
          overflow: hidden;
        }

        .task-grid__toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid var(--color-border, #e9ecef);
          gap: 1rem;
        }

        .task-grid__search {
          flex: 1;
          max-width: 300px;
          padding: 0.5rem 1rem;
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: 6px;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }

        .task-grid__search:focus {
          border-color: var(--color-primary, #0d6efd);
        }

        .task-grid__count {
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6c757d);
        }

        .task-grid__table-wrapper {
          flex: 1;
          overflow: auto;
        }

        .task-grid__table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .task-grid__table th,
        .task-grid__table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .task-grid__table th {
          background: var(--color-bg-secondary, #f8f9fa);
          font-weight: 600;
          color: var(--color-text-secondary, #495057);
          position: sticky;
          top: 0;
          z-index: 1;
          user-select: none;
        }

        .task-grid__table th:hover {
          background: var(--color-bg-tertiary, #e9ecef);
        }

        .task-grid__table th.sorted {
          background: var(--color-bg-tertiary, #e9ecef);
        }

        .task-grid__header-content {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .task-grid__sort-icon {
          font-size: 0.75rem;
          color: var(--color-primary, #0d6efd);
        }

        .task-grid__table tbody tr {
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .task-grid__table tbody tr:hover {
          background: var(--color-bg-secondary, #f8f9fa);
        }

        .task-grid__table tbody tr.inactive {
          opacity: 0.5;
        }

        .task-grid__table tbody tr:last-child td {
          border-bottom: none;
        }

        .task-grid__progress {
          position: relative;
          width: 100%;
          height: 20px;
          background: var(--color-bg-secondary, #e9ecef);
          border-radius: 4px;
          overflow: hidden;
        }

        .task-grid__progress-bar {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s;
        }

        .task-grid__progress-text {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--color-text-primary, #212529);
        }

        .task-grid__status {
          font-weight: 500;
          font-size: 0.8125rem;
        }

        .task-grid__note {
          color: var(--color-text-secondary, #6c757d);
          font-size: 0.8125rem;
        }

        .task-grid__empty {
          text-align: center;
          padding: 3rem 1rem !important;
          color: var(--color-text-secondary, #6c757d);
        }

        .task-grid__empty p {
          margin: 0 0 0.25rem;
          font-size: 1rem;
        }

        .task-grid__empty small {
          font-size: 0.8125rem;
          opacity: 0.7;
        }
      `}} />
    </div>
  )
})

// =============================================================================
// Export with Error Boundary
// =============================================================================

export function TaskGrid(props: TaskGridProps) {
  return (
    <ErrorBoundary fallback={<div>Er ging iets mis met de Task grid.</div>}>
      <TaskGridInner {...props} />
    </ErrorBoundary>
  )
}

export default TaskGrid
