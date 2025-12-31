import { NextRequest } from 'next/server'
import { createClient, getUser, hasMinRole } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
} from '@/lib/api/response'

/**
 * POST /api/export/pdf
 * Generate PDF export of project data
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    const supabase = await createClient()
    const body = await request.json()

    // Validate input
    if (!body.projectId) {
      return validationErrorResponse({
        projectId: ['Project ID is required'],
      })
    }

    // Get project and check access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, workspace:workspaces(*)')
      .eq('id', body.projectId)
      .single()

    if (projectError || !project) {
      return notFoundResponse('Project not found')
    }

    // Check export access (at least medewerker, or klant_editor for own project)
    const hasAccess = await hasMinRole(project.workspace_id, 'klant_editor')
    if (!hasAccess) {
      return forbiddenResponse('No export access to this project')
    }

    // Get project data
    const [tasks, resources, dependencies] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('project_id', body.projectId)
        .order('order_index'),
      supabase
        .from('resources')
        .select('*')
        .eq('project_id', body.projectId),
      supabase
        .from('dependencies')
        .select('*')
        .eq('project_id', body.projectId),
    ])

    // Build export data
    const exportData = {
      project: {
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.start_date,
        endDate: project.end_date,
      },
      tasks: tasks.data || [],
      resources: resources.data || [],
      dependencies: dependencies.data || [],
      exportedAt: new Date().toISOString(),
      exportedBy: user.id,
      options: body.options || {},
    }

    // Log export
    await supabase.from('export_logs').insert({
      user_id: user.id,
      project_id: body.projectId,
      format: 'pdf',
      options: body.options || {},
    })

    // Note: Actual PDF generation would use a library like pdfmake or puppeteer
    // For now, return the data structure that would be used
    return successResponse({
      success: true,
      message: 'PDF export initiated',
      data: exportData,
      // In production: fileUrl: 'https://storage.../export.pdf'
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to generate PDF export')
  }
}
