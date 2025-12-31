import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Note: Database types will be generated from Supabase CLI later
// For now, using untyped client for faster development

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Silently fail for read-only scenarios
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Silently fail for read-only scenarios
          }
        },
      },
    }
  )
}

/**
 * Get the current authenticated user
 * Throws if not authenticated
 */
export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return user
}

/**
 * Get user's role in a workspace
 */
export async function getWorkspaceRole(workspaceId: string) {
  const user = await getUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data.role
}

/**
 * Check if user has at least the specified role level
 * Role levels: admin=1, vault_medewerker=2, medewerker=3, klant_editor=4, klant_viewer=5
 */
export async function hasMinRole(workspaceId: string, minRole: string): Promise<boolean> {
  const roleLevels: Record<string, number> = {
    admin: 1,
    vault_medewerker: 2,
    medewerker: 3,
    klant_editor: 4,
    klant_viewer: 5,
  }

  const userRole = await getWorkspaceRole(workspaceId)
  if (!userRole) return false

  const userLevel = roleLevels[userRole] ?? 999
  const minLevel = roleLevels[minRole] ?? 0

  return userLevel <= minLevel
}
