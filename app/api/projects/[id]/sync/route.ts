import { NextRequest } from 'next/server'
import { createClient, getUser, hasMinRole } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api/response'

interface CrudManagerRequest {
  type: 'load' | 'sync'
  requestId?: string
  tasks?: CrudOperation
  resources?: CrudOperation
  dependencies?: CrudOperation
  assignments?: CrudOperation
  calendars?: CrudOperation
}

interface CrudOperation {
  added?: Record<string, unknown>[]
  updated?: Record<string, unknown>[]
  removed?: Record<string, unknown>[]
}

interface CrudManagerResponse {
  success: boolean
  requestId?: string
  tasks?: { rows: unknown[] }
  resources?: { rows: unknown[] }
  dependencies?: { rows: unknown[] }
  assignments?: { rows: unknown[] }
  calendars?: { rows: unknown[] }
}

/**
 * POST /api/projects/[id]/sync
 * CrudManager sync endpoint for Bryntum components
 * Handles both 'load' and 'sync' request types
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getUser()
    const supabase = await createClient()
    const { id: projectId } = await params

    // Verify project exists and user has access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, workspace_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return notFoundResponse('Project not found')
    }

    // Check workspace access
    const hasAccess = await hasMinRole(project.workspace_id, 'klant_viewer')
    if (!hasAccess) {
      return forbiddenResponse('No access to this project')
    }

    const body: CrudManagerRequest = await request.json()
    const response: CrudManagerResponse = {
      success: true,
      requestId: body.requestId,
    }

    if (body.type === 'load') {
      // Load all project data
      const [tasks, resources, dependencies, assignments, calendars] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index'),
        supabase
          .from('resources')
          .select('*')
          .eq('project_id', projectId)
          .order('name'),
        supabase
          .from('dependencies')
          .select('*')
          .eq('project_id', projectId),
        supabase
          .from('assignments')
          .select('*')
          .eq('project_id', projectId),
        supabase
          .from('calendars')
          .select('*')
          .eq('project_id', projectId),
      ])

      response.tasks = { rows: tasks.data || [] }
      response.resources = { rows: resources.data || [] }
      response.dependencies = { rows: dependencies.data || [] }
      response.assignments = { rows: assignments.data || [] }
      response.calendars = { rows: calendars.data || [] }
    } else if (body.type === 'sync') {
      // Check write access
      const canWrite = await hasMinRole(project.workspace_id, 'klant_editor')
      if (!canWrite) {
        return forbiddenResponse('No write access to this project')
      }

      // Process sync operations for each store
      if (body.tasks) {
        response.tasks = await processCrudOperations(
          supabase,
          'tasks',
          projectId,
          body.tasks
        )
      }
      if (body.resources) {
        response.resources = await processCrudOperations(
          supabase,
          'resources',
          projectId,
          body.resources
        )
      }
      if (body.dependencies) {
        response.dependencies = await processCrudOperations(
          supabase,
          'dependencies',
          projectId,
          body.dependencies
        )
      }
      if (body.assignments) {
        response.assignments = await processCrudOperations(
          supabase,
          'assignments',
          projectId,
          body.assignments
        )
      }
      if (body.calendars) {
        response.calendars = await processCrudOperations(
          supabase,
          'calendars',
          projectId,
          body.calendars
        )
      }

      // Update project's updated_at timestamp
      await supabase
        .from('projects')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', projectId)
    }

    return successResponse(response)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    console.error('Sync error:', error)
    return errorResponse('Failed to sync project data')
  }
}

/**
 * Process CRUD operations for a store
 */
async function processCrudOperations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  projectId: string,
  operations: CrudOperation
): Promise<{ rows: unknown[] }> {
  const results: unknown[] = []

  // Process added records
  if (operations.added && operations.added.length > 0) {
    const records = operations.added.map((record) => ({
      ...record,
      project_id: projectId,
      // Remove phantom ID if present
      id: record.$PhantomId ? undefined : record.id,
    }))

    const { data, error } = await supabase
      .from(table)
      .insert(records)
      .select()

    if (error) {
      console.error(`Error adding to ${table}:`, error)
    } else if (data) {
      // Map phantom IDs to real IDs for client
      data.forEach((row, index) => {
        const original = operations.added![index]
        if (original.$PhantomId) {
          results.push({
            $PhantomId: original.$PhantomId,
            id: row.id,
          })
        }
      })
    }
  }

  // Process updated records
  if (operations.updated && operations.updated.length > 0) {
    for (const record of operations.updated) {
      const { id, ...updateData } = record as { id: string; [key: string]: unknown }

      const { error } = await supabase
        .from(table)
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('project_id', projectId)
        .select()
        .single()

      if (error) {
        console.error(`Error updating ${table}:`, error)
      }
    }
  }

  // Process removed records
  if (operations.removed && operations.removed.length > 0) {
    const ids = operations.removed.map((r) => (r as { id: string }).id)

    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids)
      .eq('project_id', projectId)

    if (error) {
      console.error(`Error removing from ${table}:`, error)
    }
  }

  return { rows: results }
}
