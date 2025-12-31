import { NextRequest } from 'next/server'
import { createClient, getUser, getWorkspaceRole } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
} from '@/lib/api/response'

/**
 * POST /api/vault/[id]/process
 * Process a vault item (move from input to processing, or processing to done)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    const supabase = await createClient()
    const { id: vaultItemId } = await params
    const body = await request.json()

    // Get vault item
    const { data: item, error: itemError } = await supabase
      .from('vault_items')
      .select('*, workspace_id')
      .eq('id', vaultItemId)
      .single()

    if (itemError || !item) {
      return notFoundResponse('Vault item not found')
    }

    // Check vault access
    const role = await getWorkspaceRole(item.workspace_id)
    if (!role || !['admin', 'vault_medewerker'].includes(role)) {
      return forbiddenResponse('Vault access requires admin or vault_medewerker role')
    }

    // Validate action
    const validActions = ['start_processing', 'complete', 'reject']
    if (!body.action || !validActions.includes(body.action)) {
      return validationErrorResponse({
        action: [`Action must be one of: ${validActions.join(', ')}`],
      })
    }

    let updateData: Record<string, unknown> = {}

    switch (body.action) {
      case 'start_processing':
        if (item.status !== 'input') {
          return errorResponse('Can only start processing items in input status')
        }
        updateData = {
          status: 'processing',
          processed_by: user.id,
          updated_at: new Date().toISOString(),
        }
        break

      case 'complete': {
        if (item.status !== 'processing') {
          return errorResponse('Can only complete items in processing status')
        }
        if (!body.processingNotes) {
          return validationErrorResponse({
            processingNotes: ['Processing notes are required when completing'],
          })
        }
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30) // 30 day retention

        updateData = {
          status: 'done',
          processing_notes: body.processingNotes,
          processed_at: new Date().toISOString(),
          done_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        }
        break
      }

      case 'reject':
        if (!['input', 'processing'].includes(item.status)) {
          return errorResponse('Can only reject items in input or processing status')
        }
        if (!body.rejectionReason) {
          return validationErrorResponse({
            rejectionReason: ['Rejection reason is required'],
          })
        }
        updateData = {
          status: 'rejected',
          processing_notes: body.rejectionReason,
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        break
    }

    const { data: updatedItem, error: updateError } = await supabase
      .from('vault_items')
      .update(updateData)
      .eq('id', vaultItemId)
      .select()
      .single()

    if (updateError) {
      return errorResponse(updateError.message)
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      workspace_id: item.workspace_id,
      action: `vault_${body.action}`,
      entity_type: 'vault_item',
      entity_id: vaultItemId,
      details: { previousStatus: item.status, newStatus: updatedItem.status },
    })

    return successResponse({ item: updatedItem })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to process vault item')
  }
}
