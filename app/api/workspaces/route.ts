import { NextRequest } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/lib/api/response'

/**
 * GET /api/workspaces
 * List all workspaces the current user is a member of
 */
export async function GET() {
  try {
    const user = await getUser()
    const supabase = await createClient()

    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        workspace_members!inner (
          role,
          user_id
        )
      `)
      .eq('workspace_members.user_id', user.id)
      .order('name')

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse({ workspaces })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to fetch workspaces')
  }
}

/**
 * POST /api/workspaces
 * Create a new workspace
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
    if (body.type && !['afdeling', 'klant'].includes(body.type)) {
      errors.type = ['Type must be "afdeling" or "klant"']
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors)
    }

    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: body.name,
        type: body.type || 'afdeling',
        description: body.description || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (workspaceError) {
      return errorResponse(workspaceError.message)
    }

    // Add creator as admin
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'admin',
        invited_by: user.id,
      })

    if (memberError) {
      // Rollback workspace creation
      await supabase.from('workspaces').delete().eq('id', workspace.id)
      return errorResponse(memberError.message)
    }

    return successResponse({ workspace }, 201)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to create workspace')
  }
}
