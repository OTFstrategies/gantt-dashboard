/**
 * useExport Hook
 * Provides export functionality for project data
 */

import { useCallback, useState } from 'react'
import { useProject } from '@/providers'
import {
  tasksToCSV,
  resourcesToCSV,
  downloadCSV,
  projectToJSON,
  tasksToJSON,
  downloadJSON,
  exportTasksToExcel,
  exportProjectToExcel,
} from '@/services/export'

export type ExportFormat = 'csv' | 'json' | 'excel'
export type ExportScope = 'tasks' | 'resources' | 'project'

export interface UseExportOptions {
  format: ExportFormat
  scope: ExportScope
  filename?: string
}

export interface UseExportReturn {
  isExporting: boolean
  error: string | null
  exportData: (options: UseExportOptions) => Promise<void>
  exportTasks: (format: ExportFormat) => Promise<void>
  exportProject: (format: ExportFormat) => Promise<void>
  clearError: () => void
}

export function useExport(): UseExportReturn {
  const { projectData } = useProject()
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Export tasks to specified format
   */
  const exportTasks = useCallback(async (format: ExportFormat) => {
    if (!projectData?.tasks?.length) {
      setError('Geen taken om te exporteren')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `taken-${timestamp}`

      switch (format) {
        case 'csv': {
          const csv = tasksToCSV(projectData.tasks)
          downloadCSV(csv, filename)
          break
        }
        case 'json': {
          const json = tasksToJSON(projectData.tasks)
          downloadJSON(json, filename)
          break
        }
        case 'excel': {
          exportTasksToExcel(projectData.tasks, { filename })
          break
        }
        default:
          throw new Error(`Onbekend formaat: ${format}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export mislukt')
    } finally {
      setIsExporting(false)
    }
  }, [projectData?.tasks])

  /**
   * Export full project to specified format
   */
  const exportProject = useCallback(async (format: ExportFormat) => {
    if (!projectData) {
      setError('Geen projectdata om te exporteren')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `project-${timestamp}`

      switch (format) {
        case 'csv': {
          // For CSV, export tasks only (main data)
          const csv = tasksToCSV(projectData.tasks || [])
          downloadCSV(csv, filename)
          break
        }
        case 'json': {
          const json = projectToJSON(projectData)
          downloadJSON(json, filename)
          break
        }
        case 'excel': {
          exportProjectToExcel(projectData, { filename })
          break
        }
        default:
          throw new Error(`Onbekend formaat: ${format}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export mislukt')
    } finally {
      setIsExporting(false)
    }
  }, [projectData])

  /**
   * Generic export function
   */
  const exportData = useCallback(async (options: UseExportOptions) => {
    const { format, scope, filename } = options

    if (scope === 'tasks') {
      await exportTasks(format)
    } else if (scope === 'project') {
      await exportProject(format)
    } else if (scope === 'resources') {
      if (!projectData?.resources?.length) {
        setError('Geen resources om te exporteren')
        return
      }

      setIsExporting(true)
      setError(null)

      try {
        const timestamp = new Date().toISOString().split('T')[0]
        const name = filename || `resources-${timestamp}`

        if (format === 'csv') {
          const csv = resourcesToCSV(projectData.resources)
          downloadCSV(csv, name)
        } else if (format === 'json') {
          const json = JSON.stringify({ resources: projectData.resources }, null, 2)
          downloadJSON(json, name)
        } else {
          throw new Error('Resources kunnen alleen als CSV of JSON geëxporteerd worden')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Export mislukt')
      } finally {
        setIsExporting(false)
      }
    }
  }, [exportTasks, exportProject, projectData?.resources])

  return {
    isExporting,
    error,
    exportData,
    exportTasks,
    exportProject,
    clearError,
  }
}
