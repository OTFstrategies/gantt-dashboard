'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar'
import withDragAndDrop, { type EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { nl } from 'date-fns/locale'
import { useProject } from '@/providers'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import type { Task } from '@/types'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

// =============================================================================
// Types
// =============================================================================

export type CalendarMode = 'day' | 'week' | 'month' | 'agenda'

export interface CalendarViewProps {
  className?: string
  initialMode?: CalendarMode
  initialDate?: Date
  onEventClick?: (taskId: string) => void
  onDateChange?: (date: Date) => void
  onModeChange?: (mode: CalendarMode) => void
  readOnly?: boolean
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource?: {
    taskId: string
    progress: number
    status: string
    note?: string
  }
}

// Create typed DnD Calendar
const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar)

// =============================================================================
// Localizer Setup (Dutch)
// =============================================================================

const locales = { 'nl': nl }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
  getDay,
  locales,
})

// =============================================================================
// Helper Functions
// =============================================================================

function getStatusFromProgress(progress: number): string {
  if (progress === 0) return 'To Do'
  if (progress === 100) return 'Done'
  return 'In Progress'
}

function getEventColor(progress: number): string {
  if (progress === 100) return '#28a745' // Green - done
  if (progress > 0) return '#0066cc'     // Blue - in progress
  return '#6c757d'                        // Gray - todo
}

function transformTasksToEvents(tasks: Task[]): CalendarEvent[] {
  return tasks
    .filter(task => !task.inactive && task.start_date)
    .map(task => {
      const start = new Date(task.start_date!)

      // Calculate end date
      let end: Date
      if (task.end_date) {
        end = new Date(task.end_date)
      } else if (task.duration) {
        end = new Date(start)
        end.setDate(end.getDate() + task.duration)
      } else {
        // Default: same day event
        end = new Date(start)
        end.setHours(end.getHours() + 1)
      }

      // Ensure end is after start
      if (end <= start) {
        end = new Date(start)
        end.setHours(end.getHours() + 1)
      }

      return {
        id: task.id,
        title: task.name,
        start,
        end,
        allDay: !task.end_date || task.duration_unit === 'day',
        resource: {
          taskId: task.id,
          progress: task.percent_done,
          status: getStatusFromProgress(task.percent_done),
          note: task.note,
        },
      }
    })
}

function mapViewToMode(view: View): CalendarMode {
  switch (view) {
    case Views.DAY: return 'day'
    case Views.WEEK: return 'week'
    case Views.MONTH: return 'month'
    case Views.AGENDA: return 'agenda'
    default: return 'month'
  }
}

function mapModeToView(mode: CalendarMode): View {
  switch (mode) {
    case 'day': return Views.DAY
    case 'week': return Views.WEEK
    case 'month': return Views.MONTH
    case 'agenda': return Views.AGENDA
    default: return Views.MONTH
  }
}

// =============================================================================
// Component
// =============================================================================

function CalendarViewInner({
  className = '',
  initialMode = 'month',
  initialDate,
  onEventClick,
  onDateChange,
  onModeChange,
  readOnly = false,
}: CalendarViewProps) {
  const { projectData, syncState, updateTask } = useProject()
  const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date())
  const [currentView, setCurrentView] = useState<View>(mapModeToView(initialMode))

  // Transform tasks to calendar events
  const events = useMemo(() => {
    if (!projectData?.tasks) return []
    return transformTasksToEvents(projectData.tasks)
  }, [projectData?.tasks])

  // Handle event click
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    onEventClick?.(event.id)
  }, [onEventClick])

  // Handle event drag & drop (reschedule)
  const handleEventDrop = useCallback((args: EventInteractionArgs<CalendarEvent>) => {
    if (readOnly) return

    const { event, start, end } = args
    const startDate = typeof start === 'string' ? new Date(start) : start
    const endDate = typeof end === 'string' ? new Date(end) : end

    updateTask(event.id, {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    })
  }, [readOnly, updateTask])

  // Handle event resize
  const handleEventResize = useCallback((args: EventInteractionArgs<CalendarEvent>) => {
    if (readOnly) return

    const { event, start, end } = args
    const startDate = typeof start === 'string' ? new Date(start) : start
    const endDate = typeof end === 'string' ? new Date(end) : end

    updateTask(event.id, {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    })
  }, [readOnly, updateTask])

  // Handle navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }, [onDateChange])

  // Handle view change
  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view)
    onModeChange?.(mapViewToMode(view))
  }, [onModeChange])

  // Custom event styling
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const progress = event.resource?.progress ?? 0
    const backgroundColor = getEventColor(progress)

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 1,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    }
  }, [])

  // Loading state
  if (syncState.isLoading) {
    return (
      <div className={`calendar-view calendar-view--loading ${className}`}>
        <div className="calendar-view__loader">
          <div className="calendar-view__spinner" />
          <p>Kalender laden...</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  // Error state
  if (syncState.error) {
    return (
      <div className={`calendar-view calendar-view--error ${className}`}>
        <div className="calendar-view__error">
          <span className="calendar-view__error-icon">⚠️</span>
          <p>{syncState.error}</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  return (
    <div className={`calendar-view ${className}`}>
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        view={currentView}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={handleSelectEvent}
        onEventDrop={readOnly ? undefined : handleEventDrop}
        onEventResize={readOnly ? undefined : handleEventResize}
        eventPropGetter={eventStyleGetter}
        resizable={!readOnly}
        draggableAccessor={() => !readOnly}
        selectable={!readOnly}
        popup
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        messages={{
          today: 'Vandaag',
          previous: 'Vorige',
          next: 'Volgende',
          month: 'Maand',
          week: 'Week',
          day: 'Dag',
          agenda: 'Agenda',
          date: 'Datum',
          time: 'Tijd',
          event: 'Taak',
          noEventsInRange: 'Geen taken in deze periode.',
          showMore: (total) => `+ ${total} meer`,
        }}
        culture="nl"
        style={{ height: '100%' }}
      />
      <style jsx>{styles}</style>
      <style jsx global>{globalStyles}</style>
    </div>
  )
}

// =============================================================================
// Styles
// =============================================================================

const styles = `
  .calendar-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 500px;
    background: var(--color-surface, #ffffff);
    border-radius: 8px;
    overflow: hidden;
    padding: 16px;
  }

  .calendar-view--loading,
  .calendar-view--error {
    justify-content: center;
    align-items: center;
  }

  .calendar-view__loader {
    text-align: center;
    color: var(--color-text-secondary, #666);
  }

  .calendar-view__spinner {
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

  .calendar-view__error {
    text-align: center;
    color: var(--color-error, #dc3545);
  }

  .calendar-view__error-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }
`

const globalStyles = `
  /* React Big Calendar Theme Overrides */
  .rbc-calendar {
    font-family: inherit;
  }

  .rbc-toolbar {
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .rbc-toolbar button {
    padding: 8px 16px;
    border: 1px solid var(--color-border, #ddd);
    border-radius: 6px;
    background: var(--color-surface, #fff);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.15s;
  }

  .rbc-toolbar button:hover {
    background: var(--color-bg-secondary, #f0f0f0);
  }

  .rbc-toolbar button.rbc-active {
    background: var(--color-primary, #0066cc);
    color: white;
    border-color: var(--color-primary, #0066cc);
  }

  .rbc-header {
    padding: 8px;
    font-weight: 600;
    color: var(--color-text-primary, #333);
    background: var(--color-bg-secondary, #f8f9fa);
    border-bottom: 1px solid var(--color-border, #e9ecef);
  }

  .rbc-today {
    background-color: rgba(0, 102, 204, 0.1);
  }

  .rbc-off-range-bg {
    background: var(--color-bg-secondary, #f8f9fa);
  }

  .rbc-event {
    padding: 4px 8px;
    font-size: 13px;
    font-weight: 500;
  }

  .rbc-event:focus {
    outline: 2px solid var(--color-primary, #0066cc);
    outline-offset: 2px;
  }

  .rbc-show-more {
    color: var(--color-primary, #0066cc);
    font-weight: 500;
  }

  .rbc-agenda-view table.rbc-agenda-table {
    border: 1px solid var(--color-border, #e9ecef);
    border-radius: 8px;
    overflow: hidden;
  }

  .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
    padding: 12px;
    border-bottom: 1px solid var(--color-border, #e9ecef);
  }

  .rbc-agenda-date-cell,
  .rbc-agenda-time-cell {
    white-space: nowrap;
    color: var(--color-text-secondary, #666);
  }

  .rbc-agenda-event-cell {
    font-weight: 500;
  }

  /* Month view cell sizing */
  .rbc-month-view {
    border: 1px solid var(--color-border, #e9ecef);
    border-radius: 8px;
    overflow: hidden;
  }

  .rbc-month-row {
    border-bottom: 1px solid var(--color-border, #e9ecef);
  }

  .rbc-day-bg {
    border-left: 1px solid var(--color-border, #e9ecef);
  }

  /* Week/Day time grid */
  .rbc-time-view {
    border: 1px solid var(--color-border, #e9ecef);
    border-radius: 8px;
    overflow: hidden;
  }

  .rbc-time-header {
    border-bottom: 1px solid var(--color-border, #e9ecef);
  }

  .rbc-time-content {
    border-top: 1px solid var(--color-border, #e9ecef);
  }

  .rbc-timeslot-group {
    border-bottom: 1px solid var(--color-border, #e9ecef);
  }

  .rbc-time-gutter {
    color: var(--color-text-secondary, #666);
    font-size: 12px;
  }

  .rbc-current-time-indicator {
    background-color: var(--color-error, #dc3545);
    height: 2px;
  }
`

// =============================================================================
// Export with Error Boundary
// =============================================================================

export function CalendarView(props: CalendarViewProps) {
  return (
    <ErrorBoundary fallback={<div>Er ging iets mis met de Calendar view.</div>}>
      <CalendarViewInner {...props} />
    </ErrorBoundary>
  )
}

export default CalendarView
