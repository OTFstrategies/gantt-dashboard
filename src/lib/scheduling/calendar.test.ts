import { describe, it, expect } from 'vitest'
import {
  isWorkingDay,
  getNextWorkingDay,
  getPreviousWorkingDay,
  addWorkingDays,
  subtractWorkingDays,
  countWorkingDays,
  calculateEndDate,
  calculateDuration,
  getWorkingDaysInRange,
  parseDate,
} from './calendar'
import { DEFAULT_CALENDAR } from './types'

// =============================================================================
// Working Day Tests
// =============================================================================

describe('isWorkingDay', () => {
  it('should return true for Monday-Friday', () => {
    // Monday
    expect(isWorkingDay(new Date('2024-01-01'))).toBe(true)
    // Tuesday
    expect(isWorkingDay(new Date('2024-01-02'))).toBe(true)
    // Wednesday
    expect(isWorkingDay(new Date('2024-01-03'))).toBe(true)
    // Thursday
    expect(isWorkingDay(new Date('2024-01-04'))).toBe(true)
    // Friday
    expect(isWorkingDay(new Date('2024-01-05'))).toBe(true)
  })

  it('should return false for Saturday-Sunday', () => {
    // Saturday
    expect(isWorkingDay(new Date('2024-01-06'))).toBe(false)
    // Sunday
    expect(isWorkingDay(new Date('2024-01-07'))).toBe(false)
  })

  it('should respect holidays', () => {
    const calendarWithHoliday = {
      ...DEFAULT_CALENDAR,
      holidays: [new Date('2024-01-01')],
    }

    // January 1st is Monday but marked as holiday
    expect(isWorkingDay(new Date('2024-01-01'), calendarWithHoliday)).toBe(false)
  })

  it('should support custom working days', () => {
    const saturdayWorkCalendar = {
      ...DEFAULT_CALENDAR,
      workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    }

    expect(isWorkingDay(new Date('2024-01-06'), saturdayWorkCalendar)).toBe(true)
    expect(isWorkingDay(new Date('2024-01-07'), saturdayWorkCalendar)).toBe(false)
  })
})

describe('getNextWorkingDay', () => {
  it('should return same day if already working day', () => {
    const monday = new Date('2024-01-01')
    const result = getNextWorkingDay(monday)

    expect(result.getDay()).toBe(1) // Monday
    expect(result.getDate()).toBe(1)
  })

  it('should skip to Monday for Saturday', () => {
    const saturday = new Date('2024-01-06')
    const result = getNextWorkingDay(saturday)

    expect(result.getDay()).toBe(1) // Monday
    expect(result.getDate()).toBe(8)
  })

  it('should skip to Monday for Sunday', () => {
    const sunday = new Date('2024-01-07')
    const result = getNextWorkingDay(sunday)

    expect(result.getDay()).toBe(1) // Monday
    expect(result.getDate()).toBe(8)
  })
})

describe('getPreviousWorkingDay', () => {
  it('should return same day if already working day', () => {
    const friday = new Date('2024-01-05')
    const result = getPreviousWorkingDay(friday)

    expect(result.getDay()).toBe(5) // Friday
    expect(result.getDate()).toBe(5)
  })

  it('should skip to Friday for Saturday', () => {
    const saturday = new Date('2024-01-06')
    const result = getPreviousWorkingDay(saturday)

    expect(result.getDay()).toBe(5) // Friday
    expect(result.getDate()).toBe(5)
  })

  it('should skip to Friday for Sunday', () => {
    const sunday = new Date('2024-01-07')
    const result = getPreviousWorkingDay(sunday)

    expect(result.getDay()).toBe(5) // Friday
    expect(result.getDate()).toBe(5)
  })
})

// =============================================================================
// Duration Calculation Tests
// =============================================================================

describe('addWorkingDays', () => {
  it('should add working days correctly', () => {
    // Monday Jan 1
    const start = new Date('2024-01-01')
    // Adding 5 working days = Monday Jan 8 (skips weekend)
    const result = addWorkingDays(start, 5)

    expect(result.getDate()).toBe(8)
    expect(result.getMonth()).toBe(0) // January
  })

  it('should handle adding 0 days', () => {
    const start = new Date('2024-01-01')
    const result = addWorkingDays(start, 0)

    expect(result.getDate()).toBe(1)
  })

  it('should handle adding days across weekend', () => {
    // Friday Jan 5
    const friday = new Date('2024-01-05')
    // Adding 1 working day = Monday Jan 8
    const result = addWorkingDays(friday, 1)

    expect(result.getDay()).toBe(1) // Monday
    expect(result.getDate()).toBe(8)
  })
})

describe('subtractWorkingDays', () => {
  it('should subtract working days correctly', () => {
    // Friday Jan 12
    const start = new Date('2024-01-12')
    // Subtracting 5 working days = Friday Jan 5 (skips weekend)
    const result = subtractWorkingDays(start, 5)

    expect(result.getDate()).toBe(5)
    expect(result.getDay()).toBe(5) // Friday
  })
})

describe('countWorkingDays', () => {
  it('should count working days in a week', () => {
    const monday = new Date('2024-01-01')
    const friday = new Date('2024-01-05')

    // Mon to Fri inclusive = 4 days (exclusive of end)
    const count = countWorkingDays(monday, friday)
    expect(count).toBe(4)
  })

  it('should exclude weekends', () => {
    const friday = new Date('2024-01-05')
    const nextMonday = new Date('2024-01-08')

    // Fri to Mon = 1 day (just Friday)
    const count = countWorkingDays(friday, nextMonday)
    expect(count).toBe(1)
  })

  it('should return 0 for same day', () => {
    const day = new Date('2024-01-01')
    const count = countWorkingDays(day, day)
    expect(count).toBe(0)
  })

  it('should return 0 if end is before start', () => {
    const start = new Date('2024-01-05')
    const end = new Date('2024-01-01')

    const count = countWorkingDays(start, end)
    expect(count).toBe(0)
  })
})

describe('calculateEndDate', () => {
  it('should calculate end date for duration', () => {
    const start = new Date('2024-01-01') // Monday
    const endDate = calculateEndDate(start, 5)

    // 5 working days starting Monday = Friday
    expect(endDate.getDay()).toBe(5) // Friday
    expect(endDate.getDate()).toBe(5)
  })

  it('should handle 1 day duration', () => {
    const start = new Date('2024-01-01')
    const endDate = calculateEndDate(start, 1)

    // 1 day duration means end = start
    expect(endDate.getDate()).toBe(1)
  })

  it('should handle 0 or negative duration', () => {
    const start = new Date('2024-01-01')
    const endDate = calculateEndDate(start, 0)

    // Should return start date as next working day
    expect(endDate.getDate()).toBe(1)
  })
})

describe('calculateDuration', () => {
  it('should calculate duration between two dates', () => {
    const start = new Date('2024-01-01') // Monday
    const end = new Date('2024-01-05') // Friday

    const duration = calculateDuration(start, end)
    expect(duration).toBe(5) // 5 working days
  })

  it('should return 1 for same day', () => {
    const date = new Date('2024-01-01')
    const duration = calculateDuration(date, date)
    expect(duration).toBe(1)
  })
})

// =============================================================================
// Range Tests
// =============================================================================

describe('getWorkingDaysInRange', () => {
  it('should return array of working days', () => {
    const start = new Date('2024-01-01') // Monday
    const end = new Date('2024-01-07') // Sunday

    const workingDays = getWorkingDaysInRange(start, end)

    expect(workingDays).toHaveLength(5) // Mon-Fri
    expect(workingDays[0].getDay()).toBe(1) // Monday
    expect(workingDays[4].getDay()).toBe(5) // Friday
  })

  it('should return empty array for weekend only range', () => {
    const saturday = new Date('2024-01-06')
    const sunday = new Date('2024-01-07')

    const workingDays = getWorkingDaysInRange(saturday, sunday)
    expect(workingDays).toHaveLength(0)
  })
})

// =============================================================================
// Utility Tests
// =============================================================================

describe('parseDate', () => {
  it('should parse valid ISO date string', () => {
    const result = parseDate('2024-01-15')

    expect(result).not.toBeNull()
    expect(result?.getFullYear()).toBe(2024)
    expect(result?.getMonth()).toBe(0) // January
    expect(result?.getDate()).toBe(15)
  })

  it('should return null for undefined', () => {
    expect(parseDate(undefined)).toBeNull()
  })

  it('should return null for invalid date string', () => {
    expect(parseDate('not-a-date')).toBeNull()
  })
})
