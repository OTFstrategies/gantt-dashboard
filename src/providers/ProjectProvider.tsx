'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Task, Dependency, Resource, Assignment, ProjectData } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface SyncState {
  isLoading: boolean
  isSyncing: boolean
  lastSyncAt: Date | null
  pendingChanges: number
  error: string | null
}

interface ProjectContextValue {
  // Project state
  projectId: string | null
  setProjectId: (id: string | null) => void
  projectData: ProjectData | null

  // Sync state
  syncState: SyncState
  hasUnsavedChanges: boolean

  // Operations
  load: () => Promise<ProjectData | null>
  save: () => Promise<boolean>
  clearError: () => void

  // Task operations
  addTask: (task: Partial<Task>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void

  // Dependency operations
  addDependency: (dependency: Partial<Dependency>) => void
  removeDependency: (id: string) => void

  // Resource operations
  addResource: (resource: Partial<Resource>) => void
  updateResource: (id: string, updates: Partial<Resource>) => void
  removeResource: (id: string) => void
}

interface ProjectProviderProps {
  children: React.ReactNode
  autoSave?: boolean
  saveDelay?: number
}

// =============================================================================
// Context
// =============================================================================

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

// =============================================================================
// Initial State
// =============================================================================

const initialProjectData: ProjectData = {
  tasks: [],
  resources: [],
  dependencies: [],
  assignments: [],
  calendars: [],
}

const initialSyncState: SyncState = {
  isLoading: false,
  isSyncing: false,
  lastSyncAt: null,
  pendingChanges: 0,
  error: null,
}

// =============================================================================
// Provider
// =============================================================================

export function ProjectProvider({
  children,
  autoSave = false,
  saveDelay = 2000
}: ProjectProviderProps) {
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [syncState, setSyncState] = useState<SyncState>(initialSyncState)

  // =========================================================================
  // Load Project Data
  // =========================================================================

  const load = useCallback(async (): Promise<ProjectData | null> => {
    if (!projectId) {
      console.warn('ProjectProvider: No projectId set for load')
      return null
    }

    setSyncState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/projects/${projectId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to load project data')
      }

      const data = await response.json()

      const projectData: ProjectData = {
        tasks: data.tasks || [],
        resources: data.resources || [],
        dependencies: data.dependencies || [],
        assignments: data.assignments || [],
        calendars: data.calendars || [],
      }

      setProjectData(projectData)
      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        lastSyncAt: new Date(),
        pendingChanges: 0,
      }))

      return projectData
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      return null
    }
  }, [projectId])

  // =========================================================================
  // Save Project Data
  // =========================================================================

  const save = useCallback(async (): Promise<boolean> => {
    if (!projectId || !projectData) {
      console.warn('ProjectProvider: No projectId or data for save')
      return false
    }

    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to save project data')
      }

      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date(),
        pendingChanges: 0,
      }))

      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: message,
      }))
      return false
    }
  }, [projectId, projectData])

  // =========================================================================
  // Task Operations
  // =========================================================================

  const addTask = useCallback((task: Partial<Task>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      project_id: projectId || '',
      name: task.name || 'Nieuwe taak',
      start_date: task.start_date || new Date().toISOString(),
      end_date: task.end_date || new Date().toISOString(),
      duration: task.duration || 1,
      duration_unit: task.duration_unit || 'day',
      percent_done: task.percent_done || 0,
      scheduling_mode: task.scheduling_mode || 'Normal',
      manually_scheduled: task.manually_scheduled || false,
      rollup: task.rollup || false,
      show_in_timeline: task.show_in_timeline || true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...task,
    } as Task

    setProjectData(prev => prev ? {
      ...prev,
      tasks: [...prev.tasks, newTask]
    } : null)

    setSyncState(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
  }, [projectId])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setProjectData(prev => prev ? {
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      )
    } : null)

    setSyncState(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
  }, [])

  const removeTask = useCallback((id: string) => {
    setProjectData(prev => prev ? {
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id),
      // Also remove related dependencies and assignments
      dependencies: prev.dependencies.filter(
        dep => dep.from_task !== id && dep.to_task !== id
      ),
      assignments: prev.assignments.filter(
        assign => assign.task_id !== id
      ),
    } : null)

    setSyncState(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
  }, [])

  // =========================================================================
  // Dependency Operations
  // =========================================================================

  const addDependency = useCallback((dependency: Partial<Dependency>) => {
    const newDep: Dependency = {
      id: crypto.randomUUID(),
      project_id: projectId || '',
      from_task: dependency.from_task || '',
      to_task: dependency.to_task || '',
      type: dependency.type || 2, // FS default
      lag: dependency.lag || 0,
      lag_unit: dependency.lag_unit || 'day',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...dependency,
    } as Dependency

    setProjectData(prev => prev ? {
      ...prev,
      dependencies: [...prev.dependencies, newDep]
    } : null)

    setSyncState(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
  }, [projectId])

  const removeDependency = useCallback((id: string) => {
    setProjectData(prev => prev ? {
      ...prev,
      dependencies: prev.dependencies.filter(dep => dep.id !== id)
    } : null)

    setSyncState(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
  }, [])

  // =========================================================================
  // Resource Operations
  // =========================================================================

  const addResource = useCallback((resource: Partial<Resource>) => {
    const newResource: Resource = {
      id: crypto.randomUUID(),
      workspace_id: '', // Set by API
      name: resource.name || 'Nieuwe resource',
      type: resource.type || 'person',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...resource,
    } as Resource

    setProjectData(prev => prev ? {
      ...prev,
      resources: [...prev.resources, newResource]
    } : null)

    setSyncState(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
  }, [])

  const updateResource = useCallback((id: string, updates: Partial<Resource>) => {
    setProjectData(prev => prev ? {
      ...prev,
      resources: prev.resources.map(resource =>
        resource.id === id
          ? { ...resource, ...updates, updated_at: new Date().toISOString() }
          : resource
      )
    } : null)

    setSyncState(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
  }, [])

  const removeResource = useCallback((id: string) => {
    setProjectData(prev => prev ? {
      ...prev,
      resources: prev.resources.filter(resource => resource.id !== id),
      // Also remove related assignments
      assignments: prev.assignments.filter(
        assign => assign.resource_id !== id
      ),
    } : null)

    setSyncState(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
  }, [])

  // =========================================================================
  // Clear Error
  // =========================================================================

  const clearError = useCallback(() => {
    setSyncState(prev => ({ ...prev, error: null }))
  }, [])

  // =========================================================================
  // Unsaved Changes Warning
  // =========================================================================

  const hasUnsavedChanges = syncState.pendingChanges > 0

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // =========================================================================
  // Auto-load when projectId changes
  // =========================================================================

  useEffect(() => {
    if (projectId) {
      load()
    } else {
      setProjectData(null)
    }
  }, [projectId, load])

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        setProjectId,
        projectData,
        syncState,
        hasUnsavedChanges,
        load,
        save,
        clearError,
        addTask,
        updateTask,
        removeTask,
        addDependency,
        removeDependency,
        addResource,
        updateResource,
        removeResource,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

// =============================================================================
// Hook
// =============================================================================

export function useProject(): ProjectContextValue {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

export { ProjectContext }
