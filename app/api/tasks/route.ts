import { NextRequest } from 'next/server'
import { createClient, getUser, hasMinRole } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
} from '@/lib/api/response'

/**
 * GET /api/tasks
 * List tasks for a project
 */
export async function GET(request: NextRequest) {
  try {
    await getUser()
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return errorResponse('projectId is required')
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignments (
          id,
          resource_id,
          units
        )
      `)
      .eq('project_id', projectId)
      .order('order_index')

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse({ tasks })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to fetch tasks')
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    const supabase = await createClient()
    const body = await request.json()

    // Validate input
    const errors: Record<string, string[]> = {}
    if (!body.projectId) {
      errors.projectId = ['Project ID is required']
    }
    if (!body.name) {
      errors.name = ['Name is required']
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors)
    }

    // Get project to check workspace access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('workspace_id')
      .eq('id', body.projectId)
      .single()

    if (projectError || !project) {
      return errorResponse('Project not found')
    }

    // Check write access
    const canWrite = await hasMinRole(project.workspace_id, 'klant_editor')
    if (!canWrite) {
      return forbiddenResponse('No write access to this project')
    }

    // Get max order_index for new task
    const { data: maxOrder } = await supabase
      .from('tasks')
      .select('order_index')
      .eq('project_id', body.projectId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const orderIndex = (maxOrder?.order_index ?? -1) + 1

    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        project_id: body.projectId,
        parent_id: body.parentId || null,
        name: body.name,
        start_date: body.startDate || null,
        end_date: body.endDate || null,
        duration: body.duration || null,
        duration_unit: body.durationUnit || 'day',
        percent_done: body.percentDone || 0,
        effort: body.effort || null,
        effort_unit: body.effortUnit || 'hour',
        note: body.note || null,
        constraint_type: body.constraintType || 'assoonaspossible',
        constraint_date: body.constraintDate || null,
        scheduling_mode: body.schedulingMode || 'Normal',
        manually_scheduled: body.manuallyScheduled || false,
        rollup: body.rollup || false,
        show_in_timeline: body.showInTimeline || false,
        inactive: body.inactive || false,
        cls: body.cls || null,
        icon_cls: body.iconCls || null,
        order_index: orderIndex,
      })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse({ task }, 201)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to create task')
  }
}
