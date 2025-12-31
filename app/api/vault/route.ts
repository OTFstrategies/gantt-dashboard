import { NextRequest } from 'next/server'
import { createClient, getUser, getWorkspaceRole } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api/response'

/**
 * GET /api/vault
 * List vault items for a workspace
 * Only accessible by admin and vault_medewerker roles
 */
export async function GET(request: NextRequest) {
  try {
    await getUser()
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const status = searchParams.get('status')

    if (!workspaceId) {
      return errorResponse('workspaceId is required')
    }

    // Check vault access (admin or vault_medewerker)
    const role = await getWorkspaceRole(workspaceId)
    if (!role || !['admin', 'vault_medewerker'].includes(role)) {
      return forbiddenResponse('Vault access requires admin or vault_medewerker role')
    }

    let query = supabase
      .from('vault_items')
      .select(`
        *,
        project:projects (
          id,
          name
        ),
        processed_by_user:profiles!vault_items_processed_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: items, error } = await query

    if (error) {
      return errorResponse(error.message)
    }

    // Calculate statistics
    const stats = {
      total: items?.length || 0,
      input: items?.filter((i) => i.status === 'input').length || 0,
      processing: items?.filter((i) => i.status === 'processing').length || 0,
      done: items?.filter((i) => i.status === 'done').length || 0,
      expiringSoon: items?.filter((i) => {
        if (i.status !== 'done' || !i.expires_at) return false
        const expiresAt = new Date(i.expires_at)
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
        return expiresAt <= sevenDaysFromNow
      }).length || 0,
    }

    return successResponse({ items, stats })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to fetch vault items')
  }
}
