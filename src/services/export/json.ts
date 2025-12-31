/**
 * JSON Export Service
 * Exports project data to JSON format
 */

import type { Task, Resource, Dependency, Assignment, ProjectData } from '@/types'

export interface JsonExportOptions {
  filename?: string
  pretty?: boolean
  includeMetadata?: boolean
}

const defaultOptions: JsonExportOptions = {
  filename: 'project-export',
  pretty: true,
  includeMetadata: true,
}

export interface ProjectExportData {
  metadata?: {
    exportedAt: string
    version: string
    taskCount: number
    resourceCount: number
    dependencyCount: number
  }
  tasks: Task[]
  resources: Resource[]
  dependencies: Dependency[]
  assignments: Assignment[]
}

/**
 * Export full project data to JSON
 */
export function projectToJSON(
  projectData: ProjectData,
  options: JsonExportOptions = {}
): string {
  const opts = { ...defaultOptions, ...options }

  const exportData: ProjectExportData = {
    tasks: projectData.tasks || [],
    resources: projectData.resources || [],
    dependencies: projectData.dependencies || [],
    assignments: projectData.assignments || [],
  }

  if (opts.includeMetadata) {
    exportData.metadata = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      taskCount: exportData.tasks.length,
      resourceCount: exportData.resources.length,
      dependencyCount: exportData.dependencies.length,
    }
  }

  return opts.pretty
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData)
}

/**
 * Export only tasks to JSON
 */
export function tasksToJSON(
  tasks: Task[],
  options: JsonExportOptions = {}
): string {
  const opts = { ...defaultOptions, ...options }

  const exportData = opts.includeMetadata
    ? {
        metadata: {
          exportedAt: new Date().toISOString(),
          type: 'tasks',
          count: tasks.length,
        },
        tasks: tasks.filter(t => !t.inactive),
      }
    : { tasks: tasks.filter(t => !t.inactive) }

  return opts.pretty
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData)
}

/**
 * Export only resources to JSON
 */
export function resourcesToJSON(
  resources: Resource[],
  options: JsonExportOptions = {}
): string {
  const opts = { ...defaultOptions, ...options }

  const exportData = opts.includeMetadata
    ? {
        metadata: {
          exportedAt: new Date().toISOString(),
          type: 'resources',
          count: resources.length,
        },
        resources,
      }
    : { resources }

  return opts.pretty
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData)
}

/**
 * Download JSON as file
 */
export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
