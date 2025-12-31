/**
 * Calendar Service
 * Handles working days calculations for scheduling
 */

import type { WorkingCalendar } from './types'
import { DEFAULT_CALENDAR } from './types'

// =============================================================================
// Working Day Functions
// =============================================================================

/**
 * Check if a date is a working day
 */
export function isWorkingDay(
  date: Date,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): boolean {
  const dayOfWeek = date.getDay()

  // Check if it's a working day of the week
  if (!calendar.workingDays.includes(dayOfWeek)) {
    return false
  }

  // Check if it's a holiday
  const dateStr = formatDateKey(date)
  const isHoliday = calendar.holidays.some(
    h => formatDateKey(h) === dateStr
  )

  return !isHoliday
}

/**
 * Get the next working day (including today if it's a working day)
 */
export function getNextWorkingDay(
  date: Date,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)

  while (!isWorkingDay(result, calendar)) {
    result.setDate(result.getDate() + 1)
  }

  return result
}

/**
 * Get the previous working day (including today if it's a working day)
 */
export function getPreviousWorkingDay(
  date: Date,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)

  while (!isWorkingDay(result, calendar)) {
    result.setDate(result.getDate() - 1)
  }

  return result
}

// =============================================================================
// Duration Functions
// =============================================================================

/**
 * Add working days to a date
 */
export function addWorkingDays(
  startDate: Date,
  daysToAdd: number,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): Date {
  if (daysToAdd === 0) {
    return getNextWorkingDay(startDate, calendar)
  }

  const result = new Date(startDate)
  result.setHours(0, 0, 0, 0)

  let remainingDays = Math.abs(daysToAdd)
  const direction = daysToAdd > 0 ? 1 : -1

  // Ensure we start on a working day
  result.setTime(getNextWorkingDay(result, calendar).getTime())

  while (remainingDays > 0) {
    result.setDate(result.getDate() + direction)

    if (isWorkingDay(result, calendar)) {
      remainingDays--
    }
  }

  return result
}

/**
 * Subtract working days from a date
 */
export function subtractWorkingDays(
  startDate: Date,
  daysToSubtract: number,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): Date {
  return addWorkingDays(startDate, -daysToSubtract, calendar)
}

/**
 * Count working days between two dates (inclusive of start, exclusive of end)
 */
export function countWorkingDays(
  startDate: Date,
  endDate: Date,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): number {
  if (startDate >= endDate) {
    return 0
  }

  let count = 0
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)

  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (current < end) {
    if (isWorkingDay(current, calendar)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

/**
 * Calculate end date given start date and duration in working days
 */
export function calculateEndDate(
  startDate: Date,
  durationDays: number,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): Date {
  if (durationDays <= 0) {
    return getNextWorkingDay(startDate, calendar)
  }

  // Duration is in working days, so end date is (duration - 1) working days after start
  // Because if duration is 1, end date = start date
  return addWorkingDays(startDate, durationDays - 1, calendar)
}

/**
 * Calculate duration in working days between start and end date
 */
export function calculateDuration(
  startDate: Date,
  endDate: Date,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): number {
  const start = getNextWorkingDay(startDate, calendar)
  const end = getNextWorkingDay(endDate, calendar)

  if (start >= end) {
    return 1 // Minimum duration
  }

  // Add 1 because we count both start and end day
  return countWorkingDays(start, end, calendar) + 1
}

// =============================================================================
// Calendar Day Helpers
// =============================================================================

/**
 * Get all working days in a date range
 */
export function getWorkingDaysInRange(
  startDate: Date,
  endDate: Date,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): Date[] {
  const workingDays: Date[] = []
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)

  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    if (isWorkingDay(current, calendar)) {
      workingDays.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }

  return workingDays
}

/**
 * Get working hours for a specific date
 */
export function getWorkingHours(
  date: Date,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): { start: number; end: number; total: number } | null {
  if (!isWorkingDay(date, calendar)) {
    return null
  }

  return {
    start: calendar.workingHoursStart,
    end: calendar.workingHoursEnd,
    total: calendar.hoursPerDay,
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format date as YYYY-MM-DD for comparison
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Parse an ISO date string to Date
 */
export function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Convert calendar days to working days (approximate)
 */
export function calendarDaysToWorkingDays(
  calendarDays: number,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): number {
  const workingDaysPerWeek = calendar.workingDays.length
  const ratio = workingDaysPerWeek / 7
  return Math.ceil(calendarDays * ratio)
}

/**
 * Convert working days to calendar days (approximate)
 */
export function workingDaysToCalendarDays(
  workingDays: number,
  calendar: WorkingCalendar = DEFAULT_CALENDAR
): number {
  const workingDaysPerWeek = calendar.workingDays.length
  const ratio = 7 / workingDaysPerWeek
  return Math.ceil(workingDays * ratio)
}
