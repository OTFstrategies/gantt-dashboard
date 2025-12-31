'use client'

import React from 'react'
import { Skeleton } from './Loading'

// =============================================================================
// Gantt Skeleton
// =============================================================================

export function GanttSkeleton() {
  return (
    <div className="gantt-skeleton">
      {/* Toolbar */}
      <div className="gantt-skeleton__toolbar">
        <div className="gantt-skeleton__buttons">
          <Skeleton width={60} height={32} />
          <Skeleton width={60} height={32} />
          <Skeleton width={60} height={32} />
        </div>
        <Skeleton width={100} height={20} />
      </div>

      {/* Chart area */}
      <div className="gantt-skeleton__chart">
        {/* Header row */}
        <div className="gantt-skeleton__header">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} width={80} height={24} />
          ))}
        </div>

        {/* Task rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="gantt-skeleton__row">
            <Skeleton width={150} height={16} />
            <div className="gantt-skeleton__bar-container">
              <Skeleton
                width={`${30 + Math.random() * 40}%`}
                height={24}
                variant="rectangular"
              />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .gantt-skeleton {
          background: var(--color-surface, #ffffff);
          border-radius: 8px;
          border: 1px solid var(--color-border, #e9ecef);
          overflow: hidden;
        }

        .gantt-skeleton__toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--color-border, #e9ecef);
          background: var(--color-bg-secondary, #f8f9fa);
        }

        .gantt-skeleton__buttons {
          display: flex;
          gap: 0.25rem;
        }

        .gantt-skeleton__chart {
          padding: 1rem;
        }

        .gantt-skeleton__header {
          display: flex;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border, #e9ecef);
          margin-bottom: 0.5rem;
        }

        .gantt-skeleton__row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 0;
        }

        .gantt-skeleton__bar-container {
          flex: 1;
        }
      `}</style>
    </div>
  )
}

// =============================================================================
// TaskBoard Skeleton
// =============================================================================

export function TaskBoardSkeleton() {
  return (
    <div className="taskboard-skeleton">
      {Array.from({ length: 3 }).map((_, columnIndex) => (
        <div key={columnIndex} className="taskboard-skeleton__column">
          {/* Column header */}
          <div className="taskboard-skeleton__header">
            <Skeleton width={4} height={16} />
            <Skeleton width={80} height={20} />
            <Skeleton width={24} height={24} variant="circular" />
          </div>

          {/* Cards */}
          <div className="taskboard-skeleton__cards">
            {Array.from({ length: 2 + Math.floor(Math.random() * 3) }).map((_, cardIndex) => (
              <div key={cardIndex} className="taskboard-skeleton__card">
                <Skeleton width="70%" height={16} />
                <Skeleton width="100%" height={12} />
                <div className="taskboard-skeleton__card-footer">
                  <Skeleton width="60%" height={8} />
                  <Skeleton width={40} height={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <style jsx>{`
        .taskboard-skeleton {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          overflow-x: auto;
        }

        .taskboard-skeleton__column {
          min-width: 280px;
          max-width: 320px;
          background: var(--color-gray-50, #f8f9fa);
          border-radius: 8px;
          overflow: hidden;
        }

        .taskboard-skeleton__header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--color-surface, #ffffff);
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .taskboard-skeleton__cards {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem;
        }

        .taskboard-skeleton__card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: 6px;
        }

        .taskboard-skeleton__card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  )
}

// =============================================================================
// Grid Skeleton
// =============================================================================

export function GridSkeleton() {
  return (
    <div className="grid-skeleton">
      {/* Toolbar */}
      <div className="grid-skeleton__toolbar">
        <Skeleton width={200} height={36} />
        <Skeleton width={120} height={20} />
      </div>

      {/* Table */}
      <div className="grid-skeleton__table">
        {/* Header */}
        <div className="grid-skeleton__header-row">
          <Skeleton width={60} height={16} />
          <Skeleton width={150} height={16} />
          <Skeleton width={80} height={16} />
          <Skeleton width={80} height={16} />
          <Skeleton width={60} height={16} />
          <Skeleton width={100} height={16} />
        </div>

        {/* Rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid-skeleton__row">
            <Skeleton width={40} height={14} />
            <Skeleton width={`${60 + Math.random() * 30}%`} height={14} />
            <Skeleton width={70} height={14} />
            <Skeleton width={70} height={14} />
            <Skeleton width={40} height={14} />
            <Skeleton width={80} height={20} variant="rectangular" />
          </div>
        ))}
      </div>

      <style jsx>{`
        .grid-skeleton {
          background: var(--color-surface, #ffffff);
          border-radius: 8px;
          border: 1px solid var(--color-border, #e9ecef);
          overflow: hidden;
        }

        .grid-skeleton__toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .grid-skeleton__table {
          overflow: hidden;
        }

        .grid-skeleton__header-row {
          display: flex;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: var(--color-bg-secondary, #f8f9fa);
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .grid-skeleton__row {
          display: flex;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .grid-skeleton__row:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  )
}

// =============================================================================
// Calendar Skeleton
// =============================================================================

export function CalendarSkeleton() {
  return (
    <div className="calendar-skeleton">
      {/* Toolbar */}
      <div className="calendar-skeleton__toolbar">
        <div className="calendar-skeleton__nav">
          <Skeleton width={80} height={32} />
          <Skeleton width={32} height={32} />
          <Skeleton width={32} height={32} />
        </div>
        <Skeleton width={150} height={24} />
        <div className="calendar-skeleton__views">
          <Skeleton width={60} height={32} />
          <Skeleton width={60} height={32} />
          <Skeleton width={60} height={32} />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="calendar-skeleton__grid">
        {/* Day headers */}
        <div className="calendar-skeleton__header">
          {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
            <div key={day} className="calendar-skeleton__day-header">
              <Skeleton width={30} height={16} />
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        {Array.from({ length: 5 }).map((_, weekIndex) => (
          <div key={weekIndex} className="calendar-skeleton__week">
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div key={dayIndex} className="calendar-skeleton__cell">
                <Skeleton width={20} height={16} />
                {Math.random() > 0.7 && (
                  <Skeleton width="80%" height={20} variant="rectangular" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        .calendar-skeleton {
          background: var(--color-surface, #ffffff);
          border-radius: 8px;
          border: 1px solid var(--color-border, #e9ecef);
          overflow: hidden;
          padding: 1rem;
        }

        .calendar-skeleton__toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .calendar-skeleton__nav,
        .calendar-skeleton__views {
          display: flex;
          gap: 0.5rem;
        }

        .calendar-skeleton__grid {
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: 8px;
          overflow: hidden;
        }

        .calendar-skeleton__header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--color-bg-secondary, #f8f9fa);
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .calendar-skeleton__day-header {
          padding: 0.5rem;
          text-align: center;
        }

        .calendar-skeleton__week {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .calendar-skeleton__week:last-child {
          border-bottom: none;
        }

        .calendar-skeleton__cell {
          min-height: 80px;
          padding: 0.5rem;
          border-left: 1px solid var(--color-border, #e9ecef);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .calendar-skeleton__cell:first-child {
          border-left: none;
        }
      `}</style>
    </div>
  )
}
