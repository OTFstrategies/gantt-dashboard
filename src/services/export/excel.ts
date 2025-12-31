/**
 * Excel Export Service
 * Exports project data to Excel format using SheetJS
 */

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Task, Resource, Dependency, ProjectData } from '@/types'

export interface ExcelExportOptions {
  filename?: string
  sheetName?: string
  includeResources?: boolean
  includeDependencies?: boolean
  dateFormat?: string
}

const defaultOptions: ExcelExportOptions = {
  filename: 'project-export',
  sheetName: 'Taken',
  includeResources: true,
  includeDependencies: true,
  dateFormat: 'dd-mm-yyyy',
}

/**
 * Format date for Excel
 */
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('nl-NL')
}

/**
 * Get status from progress
 */
function getStatus(percentDone: number): string {
  if (percentDone === 0) return 'To Do'
  if (percentDone === 100) return 'Done'
  return 'In Progress'
}

/**
 * Convert tasks to worksheet data
 */
function tasksToWorksheetData(tasks: Task[]): object[] {
  return tasks
    .filter(t => !t.inactive)
    .map(task => ({
      'WBS Code': task.wbs_code || '',
      'Naam': task.name,
      'Start Datum': formatDate(task.start_date),
      'Eind Datum': formatDate(task.end_date),
      'Duur': task.duration || '',
      'Eenheid': task.duration_unit || 'dag',
      'Voortgang (%)': task.percent_done,
      'Status': getStatus(task.percent_done),
      'Notitie': task.note || '',
    }))
}

/**
 * Convert resources to worksheet data
 */
function resourcesToWorksheetData(resources: Resource[]): object[] {
  return resources.map(resource => ({
    'Naam': resource.name,
    'Type': resource.type,
    'Capaciteit': resource.capacity,
    'Kosten/uur': resource.cost_per_hour || '',
  }))
}

/**
 * Convert dependencies to worksheet data
 */
function dependenciesToWorksheetData(dependencies: Dependency[]): object[] {
  const depTypes = ['Start-Start', 'Start-Finish', 'Finish-Start', 'Finish-Finish']

  return dependencies.map(dep => ({
    'Van Taak': dep.from_task,
    'Naar Taak': dep.to_task,
    'Type': depTypes[dep.type] || 'Onbekend',
    'Vertraging': dep.lag,
    'Eenheid': dep.lag_unit || 'dag',
  }))
}

/**
 * Export tasks to Excel file
 */
export function exportTasksToExcel(
  tasks: Task[],
  options: ExcelExportOptions = {}
): void {
  const opts = { ...defaultOptions, ...options }

  // Create workbook
  const wb = XLSX.utils.book_new()

  // Add tasks sheet
  const tasksData = tasksToWorksheetData(tasks)
  const tasksWs = XLSX.utils.json_to_sheet(tasksData)

  // Set column widths
  tasksWs['!cols'] = [
    { wch: 12 }, // WBS Code
    { wch: 30 }, // Naam
    { wch: 12 }, // Start Datum
    { wch: 12 }, // Eind Datum
    { wch: 8 },  // Duur
    { wch: 8 },  // Eenheid
    { wch: 12 }, // Voortgang
    { wch: 12 }, // Status
    { wch: 40 }, // Notitie
  ]

  XLSX.utils.book_append_sheet(wb, tasksWs, opts.sheetName!)

  // Generate and download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `${opts.filename}.xlsx`)
}

/**
 * Export full project to Excel file with multiple sheets
 */
export function exportProjectToExcel(
  projectData: ProjectData,
  options: ExcelExportOptions = {}
): void {
  const opts = { ...defaultOptions, ...options }

  // Create workbook
  const wb = XLSX.utils.book_new()

  // Add tasks sheet
  const tasks = projectData.tasks || []
  const tasksData = tasksToWorksheetData(tasks)
  const tasksWs = XLSX.utils.json_to_sheet(tasksData)
  tasksWs['!cols'] = [
    { wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
    { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 40 },
  ]
  XLSX.utils.book_append_sheet(wb, tasksWs, 'Taken')

  // Add resources sheet
  if (opts.includeResources && projectData.resources?.length) {
    const resourcesData = resourcesToWorksheetData(projectData.resources)
    const resourcesWs = XLSX.utils.json_to_sheet(resourcesData)
    resourcesWs['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
    ]
    XLSX.utils.book_append_sheet(wb, resourcesWs, 'Resources')
  }

  // Add dependencies sheet
  if (opts.includeDependencies && projectData.dependencies?.length) {
    const depsData = dependenciesToWorksheetData(projectData.dependencies)
    const depsWs = XLSX.utils.json_to_sheet(depsData)
    depsWs['!cols'] = [
      { wch: 36 }, { wch: 36 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
    ]
    XLSX.utils.book_append_sheet(wb, depsWs, 'Dependencies')
  }

  // Add metadata sheet
  const metaData = [
    { 'Eigenschap': 'Geëxporteerd op', 'Waarde': new Date().toLocaleString('nl-NL') },
    { 'Eigenschap': 'Aantal taken', 'Waarde': tasks.length },
    { 'Eigenschap': 'Aantal resources', 'Waarde': projectData.resources?.length || 0 },
    { 'Eigenschap': 'Aantal dependencies', 'Waarde': projectData.dependencies?.length || 0 },
  ]
  const metaWs = XLSX.utils.json_to_sheet(metaData)
  metaWs['!cols'] = [{ wch: 20 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, metaWs, 'Info')

  // Generate and download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `${opts.filename}.xlsx`)
}
