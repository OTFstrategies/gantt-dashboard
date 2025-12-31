'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project, Task, Resource, Dependency, Assignment, Calendar } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface ProjectDataState {
  project: Project | null
  tasks: Task[]
  resources: Resource[]
  dependencies: Dependency[]
  assignments: Assignment[]
  calendars: Calendar[]
}

interface UseProjectOptions {
  autoLoad?: boolean
}

interface UseProjectDataReturn {
  data: ProjectDataState
  isLoading: boolean
  error: string | null
  load: () => Promise<void>
  reload: () => Promise<void>
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to load project data from API.
 * Note: Use `useProject` from providers for context-based project access.
 */
export function useProjectData(
  projectId: string | null,
  options: UseProjectOptions = {}
): UseProjectDataReturn {
  const { autoLoad = true } = options

  const [data, setData] = useState<ProjectDataState>({
    project: null,
    tasks: [],
    resources: [],
    dependencies: [],
    assignments: [],
    calendars: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!projectId) {
      setData({
        project: null,
        tasks: [],
        resources: [],
        dependencies: [],
        assignments: [],
        calendars: [],
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Load project details
      const projectResponse = await fetch(`/api/projects/${projectId}`)
      if (!projectResponse.ok) {
        throw new Error('Failed to load project')
      }
      const projectData = await projectResponse.json()

      // Load project data via sync endpoint
      const syncResponse = await fetch(`/api/projects/${projectId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'load', requestId: crypto.randomUUID() }),
      })

      if (!syncResponse.ok) {
        throw new Error('Failed to load project data')
      }

      const syncData = await syncResponse.json()

      setData({
        project: projectData.project,
        tasks: syncData.tasks?.rows || [],
        resources: syncData.resources?.rows || [],
        dependencies: syncData.dependencies?.rows || [],
        assignments: syncData.assignments?.rows || [],
        calendars: syncData.calendars?.rows || [],
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  // Auto-load on mount or projectId change
  useEffect(() => {
    if (autoLoad && projectId) {
      load()
    }
  }, [autoLoad, projectId, load])

  return {
    data,
    isLoading,
    error,
    load,
    reload: load,
  }
}
