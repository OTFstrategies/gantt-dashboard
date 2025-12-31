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
 * GET /api/resources
 * List resources for a project
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

    const { data: resources, error } = await supabase
      .from('resources')
      .select(`
        *,
        assignments (
          id,
          task_id,
          units
        )
      `)
      .eq('project_id', projectId)
      .order('name')

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse({ resources })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to fetch resources')
  }
}

/**
 * POST /api/resources
 * Create a new resource
 */
export async function POST(request: NextRequest) {
  try {
    await getUser()
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

    // Check write access (medewerker or higher)
    const canWrite = await hasMinRole(project.workspace_id, 'medewerker')
    if (!canWrite) {
      return forbiddenResponse('No permission to manage resources')
    }

    // Create resource
    const { data: resource, error } = await supabase
      .from('resources')
      .insert({
        project_id: body.projectId,
        name: body.name,
        type: body.type || 'human',
        calendar_id: body.calendarId || null,
        image: body.image || null,
        capacity: body.capacity || 100,
        cost_per_hour: body.costPerHour || null,
      })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse({ resource }, 201)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to create resource')
  }
}
