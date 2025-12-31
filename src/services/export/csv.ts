/**
 * CSV Export Service
 * Converts task data to CSV format
 */

import type { Task, Resource, Dependency } from '@/types'

export interface CsvExportOptions {
  filename?: string
  includeHeaders?: boolean
  delimiter?: string
  dateFormat?: 'iso' | 'nl' | 'us'
}

const defaultOptions: CsvExportOptions = {
  filename: 'tasks-export',
  includeHeaders: true,
  delimiter: ';', // Semi-colon for Dutch Excel compatibility
  dateFormat: 'nl',
}

/**
 * Format date based on locale preference
 */
function formatDate(dateStr: string | undefined, format: 'iso' | 'nl' | 'us'): string {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''

  switch (format) {
    case 'nl':
      return date.toLocaleDateString('nl-NL')
    case 'us':
      return date.toLocaleDateString('en-US')
    case 'iso':
    default:
      return date.toISOString().split('T')[0]
  }
}

/**
 * Escape CSV field value
 */
function escapeField(value: string | number | boolean | undefined | null, delimiter: string): string {
  if (value === null || value === undefined) return ''

  const str = String(value)

  // If contains delimiter, quotes, or newlines, wrap in quotes
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Export tasks to CSV string
 */
export function tasksToCSV(tasks: Task[], options: CsvExportOptions = {}): string {
  const opts = { ...defaultOptions, ...options }
  const { delimiter, dateFormat, includeHeaders } = opts

  const lines: string[] = []

  // Headers
  if (includeHeaders) {
    const headers = [
      'ID',
      'WBS Code',
      'Naam',
      'Start Datum',
      'Eind Datum',
      'Duur',
      'Eenheid',
      'Voortgang %',
      'Status',
      'Notitie',
    ]
    lines.push(headers.join(delimiter))
  }

  // Data rows
  for (const task of tasks) {
    if (task.inactive) continue

    const status = task.percent_done === 0
      ? 'To Do'
      : task.percent_done === 100
        ? 'Done'
        : 'In Progress'

    const row = [
      escapeField(task.id, delimiter!),
      escapeField(task.wbs_code, delimiter!),
      escapeField(task.name, delimiter!),
      escapeField(formatDate(task.start_date, dateFormat!), delimiter!),
      escapeField(formatDate(task.end_date, dateFormat!), delimiter!),
      escapeField(task.duration, delimiter!),
      escapeField(task.duration_unit || 'day', delimiter!),
      escapeField(task.percent_done, delimiter!),
      escapeField(status, delimiter!),
      escapeField(task.note, delimiter!),
    ]
    lines.push(row.join(delimiter))
  }

  return lines.join('\n')
}

/**
 * Export resources to CSV string
 */
export function resourcesToCSV(resources: Resource[], options: CsvExportOptions = {}): string {
  const opts = { ...defaultOptions, ...options }
  const { delimiter, includeHeaders } = opts

  const lines: string[] = []

  if (includeHeaders) {
    const headers = ['ID', 'Naam', 'Type', 'Capaciteit', 'Kosten/uur']
    lines.push(headers.join(delimiter))
  }

  for (const resource of resources) {
    const row = [
      escapeField(resource.id, delimiter!),
      escapeField(resource.name, delimiter!),
      escapeField(resource.type, delimiter!),
      escapeField(resource.capacity, delimiter!),
      escapeField(resource.cost_per_hour, delimiter!),
    ]
    lines.push(row.join(delimiter))
  }

  return lines.join('\n')
}

/**
 * Export dependencies to CSV string
 */
export function dependenciesToCSV(dependencies: Dependency[], options: CsvExportOptions = {}): string {
  const opts = { ...defaultOptions, ...options }
  const { delimiter, includeHeaders } = opts

  const depTypes = ['Start-Start', 'Start-Finish', 'Finish-Start', 'Finish-Finish']
  const lines: string[] = []

  if (includeHeaders) {
    const headers = ['ID', 'Van Taak', 'Naar Taak', 'Type', 'Vertraging', 'Eenheid']
    lines.push(headers.join(delimiter))
  }

  for (const dep of dependencies) {
    const row = [
      escapeField(dep.id, delimiter!),
      escapeField(dep.from_task, delimiter!),
      escapeField(dep.to_task, delimiter!),
      escapeField(depTypes[dep.type] || 'Unknown', delimiter!),
      escapeField(dep.lag, delimiter!),
      escapeField(dep.lag_unit || 'day', delimiter!),
    ]
    lines.push(row.join(delimiter))
  }

  return lines.join('\n')
}

/**
 * Download CSV as file
 */
export function downloadCSV(content: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
