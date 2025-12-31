import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/cron/cleanup-sessions
 * Cron job to clean up stale sessions and inactive users
 * Scheduled: Weekly on Sunday at 3:00 AM (see vercel.json)
 *
 * Security: Only accepts requests from Vercel Cron
 */
export async function POST(request: NextRequest) {
  // Verify this is a legitimate cron request from Vercel
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const results = {
      expiredInvites: 0,
      oldExportLogs: 0,
      oldActivityLogs: 0,
      oldNotifications: 0,
    }

    // 1. Clean up expired workspace invites (older than 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const { data: expiredInvites } = await supabase
      .from('workspace_invites')
      .delete()
      .eq('status', 'pending')
      .lt('created_at', sevenDaysAgo.toISOString())
      .select('id')

    results.expiredInvites = expiredInvites?.length || 0

    // 2. Clean up old export logs (older than 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const { data: oldExports } = await supabase
      .from('export_logs')
      .delete()
      .lt('created_at', ninetyDaysAgo.toISOString())
      .select('id')

    results.oldExportLogs = oldExports?.length || 0

    // 3. Clean up old activity logs (older than 180 days)
    const oneEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    const { data: oldActivity } = await supabase
      .from('activity_log')
      .delete()
      .lt('created_at', oneEightyDaysAgo.toISOString())
      .select('id')

    results.oldActivityLogs = oldActivity?.length || 0

    // 4. Clean up old read notifications (older than 30 days)
    const { data: oldNotifications } = await supabase
      .from('notifications')
      .delete()
      .eq('read', true)
      .lt('created_at', thirtyDaysAgo.toISOString())
      .select('id')

    results.oldNotifications = oldNotifications?.length || 0

    const totalCleaned =
      results.expiredInvites +
      results.oldExportLogs +
      results.oldActivityLogs +
      results.oldNotifications

    console.log('Session cleanup results:', results)

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${totalCleaned} stale records`,
      details: results,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Session cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
  return POST(request)
}
