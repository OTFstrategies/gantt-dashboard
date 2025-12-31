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
 * GET /api/projects
 * List projects, optionally filtered by workspace
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    let query = supabase
      .from('projects')
      .select(`
        *,
        workspace:workspaces (
          id,
          name,
          type
        )
      `)
      .order('updated_at', { ascending: false })

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId)
    }

    const { data: projects, error } = await query

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse({ projects })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to fetch projects')
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    const supabase = await createClient()
    const body = await request.json()

    // Validate input
    const errors: Record<string, string[]> = {}
    if (!body.name || typeof body.name !== 'string') {
      errors.name = ['Name is required']
    }
    if (!body.workspaceId || typeof body.workspaceId !== 'string') {
      errors.workspaceId = ['Workspace ID is required']
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors)
    }

    // Check workspace access (need at least medewerker role)
    const hasAccess = await hasMinRole(body.workspaceId, 'medewerker')
    if (!hasAccess) {
      return forbiddenResponse('Insufficient permissions to create project')
    }

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        workspace_id: body.workspaceId,
        name: body.name,
        description: body.description || null,
        status: body.status || 'draft',
        start_date: body.startDate || null,
        end_date: body.endDate || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse({ project }, 201)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to create project')
  }
}
