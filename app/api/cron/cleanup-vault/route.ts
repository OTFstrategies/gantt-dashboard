import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/cron/cleanup-vault
 * Cron job to clean up expired vault items
 * Scheduled: Daily at 2:00 AM (see vercel.json)
 *
 * Security: Only accepts requests from Vercel Cron
 */
export async function POST(request: NextRequest) {
  // Verify this is a legitimate cron request from Vercel
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development, allow without auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // Use service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const now = new Date().toISOString()

    // Find expired vault items (done status, past expires_at)
    const { data: expiredItems, error: fetchError } = await supabase
      .from('vault_items')
      .select('id, workspace_id, project_id')
      .eq('status', 'done')
      .lt('expires_at', now)

    if (fetchError) {
      console.error('Error fetching expired vault items:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch expired items' },
        { status: 500 }
      )
    }

    if (!expiredItems || expiredItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired items to clean up',
        cleaned: 0,
      })
    }

    // Delete expired items
    const expiredIds = expiredItems.map((item) => item.id)
    const { error: deleteError } = await supabase
      .from('vault_items')
      .delete()
      .in('id', expiredIds)

    if (deleteError) {
      console.error('Error deleting expired vault items:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete expired items' },
        { status: 500 }
      )
    }

    // Log the cleanup action
    await supabase.from('activity_log').insert(
      expiredItems.map((item) => ({
        workspace_id: item.workspace_id,
        action: 'vault_auto_cleanup',
        entity_type: 'vault_item',
        entity_id: item.id,
        details: { reason: 'expired', cleaned_at: now },
      }))
    )

    console.log(`Cleaned up ${expiredItems.length} expired vault items`)

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${expiredItems.length} expired vault items`,
      cleaned: expiredItems.length,
      timestamp: now,
    })
  } catch (error) {
    console.error('Vault cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support GET for manual triggering in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
  return POST(request)
}
