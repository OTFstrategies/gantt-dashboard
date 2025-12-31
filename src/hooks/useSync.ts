'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type {
  SyncRequest,
  SyncResponse,
  CrudOperation,
  Task,
  Resource,
  Dependency,
  Assignment,
} from '@/types'

// =============================================================================
// Types
// =============================================================================

interface SyncOptions {
  debounceMs?: number
  onSuccess?: (response: SyncResponse) => void
  onError?: (error: Error) => void
  onPendingChange?: (pending: boolean) => void
}

interface UseSyncReturn {
  isSyncing: boolean
  lastSyncAt: Date | null
  error: string | null
  pendingChanges: boolean

  // Queue changes for sync
  addTask: (task: Partial<Task>) => void
  updateTask: (task: Partial<Task> & { id: string }) => void
  removeTask: (id: string) => void

  addResource: (resource: Partial<Resource>) => void
  updateResource: (resource: Partial<Resource> & { id: string }) => void
  removeResource: (id: string) => void

  addDependency: (dependency: Partial<Dependency>) => void
  updateDependency: (dependency: Partial<Dependency> & { id: string }) => void
  removeDependency: (id: string) => void

  addAssignment: (assignment: Partial<Assignment>) => void
  updateAssignment: (assignment: Partial<Assignment> & { id: string }) => void
  removeAssignment: (id: string) => void

  // Manual sync control
  syncNow: () => Promise<SyncResponse | null>
  clearPending: () => void
  clearError: () => void
}

interface PendingChanges {
  tasks: CrudOperation<Task>
  resources: CrudOperation<Resource>
  dependencies: CrudOperation<Dependency>
  assignments: CrudOperation<Assignment>
}

// =============================================================================
// Hook
// =============================================================================

export function useSync(
  projectId: string | null,
  options: SyncOptions = {}
): UseSyncReturn {
  const { debounceMs = 1000, onSuccess, onError, onPendingChange } = options

  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pendingRef = useRef<PendingChanges>({
    tasks: { added: [], updated: [], removed: [] },
    resources: { added: [], updated: [], removed: [] },
    dependencies: { added: [], updated: [], removed: [] },
    assignments: { added: [], updated: [], removed: [] },
  })

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Check if there are pending changes
  const hasPendingChanges = useCallback((): boolean => {
    const p = pendingRef.current
    return (
      (p.tasks.added?.length || 0) > 0 ||
      (p.tasks.updated?.length || 0) > 0 ||
      (p.tasks.removed?.length || 0) > 0 ||
      (p.resources.added?.length || 0) > 0 ||
      (p.resources.updated?.length || 0) > 0 ||
      (p.resources.removed?.length || 0) > 0 ||
      (p.dependencies.added?.length || 0) > 0 ||
      (p.dependencies.updated?.length || 0) > 0 ||
      (p.dependencies.removed?.length || 0) > 0 ||
      (p.assignments.added?.length || 0) > 0 ||
      (p.assignments.updated?.length || 0) > 0 ||
      (p.assignments.removed?.length || 0) > 0
    )
  }, [])

  const [pendingChanges, setPendingChanges] = useState(false)

  // Notify parent of pending changes
  useEffect(() => {
    onPendingChange?.(pendingChanges)
  }, [pendingChanges, onPendingChange])

  // Perform sync
  const syncNow = useCallback(async (): Promise<SyncResponse | null> => {
    if (!projectId || !hasPendingChanges()) {
      return null
    }

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    setIsSyncing(true)
    setError(null)

    const request: SyncRequest = {
      requestId: crypto.randomUUID(),
      tasks: pendingRef.current.tasks,
      resources: pendingRef.current.resources,
      dependencies: pendingRef.current.dependencies,
      assignments: pendingRef.current.assignments,
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Sync failed')
      }

      const data: SyncResponse = await response.json()

      // Clear pending changes on success
      pendingRef.current = {
        tasks: { added: [], updated: [], removed: [] },
        resources: { added: [], updated: [], removed: [] },
        dependencies: { added: [], updated: [], removed: [] },
        assignments: { added: [], updated: [], removed: [] },
      }
      setPendingChanges(false)

      setLastSyncAt(new Date())
      onSuccess?.(data)

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      onError?.(err instanceof Error ? err : new Error(message))
      return null
    } finally {
      setIsSyncing(false)
    }
  }, [projectId, hasPendingChanges, onSuccess, onError])

  // Schedule debounced sync
  const scheduleSync = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      syncNow()
    }, debounceMs)
  }, [debounceMs, syncNow])

  // Task operations
  const addTask = useCallback((task: Partial<Task>) => {
    pendingRef.current.tasks.added = [
      ...(pendingRef.current.tasks.added || []),
      task as Task,
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  const updateTask = useCallback((task: Partial<Task> & { id: string }) => {
    pendingRef.current.tasks.updated = [
      ...(pendingRef.current.tasks.updated || []),
      task as Task,
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  const removeTask = useCallback((id: string) => {
    pendingRef.current.tasks.removed = [
      ...(pendingRef.current.tasks.removed || []),
      { id },
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  // Resource operations
  const addResource = useCallback((resource: Partial<Resource>) => {
    pendingRef.current.resources.added = [
      ...(pendingRef.current.resources.added || []),
      resource as Resource,
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  const updateResource = useCallback((resource: Partial<Resource> & { id: string }) => {
    pendingRef.current.resources.updated = [
      ...(pendingRef.current.resources.updated || []),
      resource as Resource,
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  const removeResource = useCallback((id: string) => {
    pendingRef.current.resources.removed = [
      ...(pendingRef.current.resources.removed || []),
      { id },
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  // Dependency operations
  const addDependency = useCallback((dependency: Partial<Dependency>) => {
    pendingRef.current.dependencies.added = [
      ...(pendingRef.current.dependencies.added || []),
      dependency as Dependency,
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  const updateDependency = useCallback((dependency: Partial<Dependency> & { id: string }) => {
    pendingRef.current.dependencies.updated = [
      ...(pendingRef.current.dependencies.updated || []),
      dependency as Dependency,
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  const removeDependency = useCallback((id: string) => {
    pendingRef.current.dependencies.removed = [
      ...(pendingRef.current.dependencies.removed || []),
      { id },
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  // Assignment operations
  const addAssignment = useCallback((assignment: Partial<Assignment>) => {
    pendingRef.current.assignments.added = [
      ...(pendingRef.current.assignments.added || []),
      assignment as Assignment,
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  const updateAssignment = useCallback((assignment: Partial<Assignment> & { id: string }) => {
    pendingRef.current.assignments.updated = [
      ...(pendingRef.current.assignments.updated || []),
      assignment as Assignment,
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  const removeAssignment = useCallback((id: string) => {
    pendingRef.current.assignments.removed = [
      ...(pendingRef.current.assignments.removed || []),
      { id },
    ]
    setPendingChanges(true)
    scheduleSync()
  }, [scheduleSync])

  // Clear pending changes
  const clearPending = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    pendingRef.current = {
      tasks: { added: [], updated: [], removed: [] },
      resources: { added: [], updated: [], removed: [] },
      dependencies: { added: [], updated: [], removed: [] },
      assignments: { added: [], updated: [], removed: [] },
    }
    setPendingChanges(false)
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    isSyncing,
    lastSyncAt,
    error,
    pendingChanges,
    addTask,
    updateTask,
    removeTask,
    addResource,
    updateResource,
    removeResource,
    addDependency,
    updateDependency,
    removeDependency,
    addAssignment,
    updateAssignment,
    removeAssignment,
    syncNow,
    clearPending,
    clearError,
  }
}
