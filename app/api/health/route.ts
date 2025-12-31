import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    database: 'ok' | 'error'
    auth: 'ok' | 'error'
    api: 'ok' | 'error'
  }
  latency?: {
    database: number
  }
}

/**
 * GET /api/health
 * Health check endpoint for monitoring and load balancers
 */
export async function GET() {
  const startTime = Date.now()

  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'ok',
      auth: 'ok',
      api: 'ok',
    },
  }

  // Check database connection
  try {
    const supabase = await createClient()
    const dbStart = Date.now()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    const dbLatency = Date.now() - dbStart

    if (error) {
      health.checks.database = 'error'
      health.status = 'degraded'
    } else {
      health.latency = { database: dbLatency }
    }
  } catch {
    health.checks.database = 'error'
    health.status = 'unhealthy'
  }

  // Check auth service
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.getSession()
    if (error) {
      health.checks.auth = 'error'
      health.status = 'degraded'
    }
  } catch {
    health.checks.auth = 'error'
    health.status = 'degraded'
  }

  // Determine HTTP status code
  const httpStatus =
    health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503

  return NextResponse.json(health, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  })
}
