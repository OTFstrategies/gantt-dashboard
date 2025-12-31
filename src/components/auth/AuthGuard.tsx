'use client'

import React, { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loading } from '@/components/shared'
import type { Profile, WorkspaceRole } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface AuthContextValue {
  user: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkWorkspaceAccess: (workspaceId: string, requiredRole?: WorkspaceRole) => Promise<boolean>
}

interface AuthProviderProps {
  children: React.ReactNode
}

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: WorkspaceRole
  workspaceId?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

// =============================================================================
// Context
// =============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// =============================================================================
// Role Hierarchy
// =============================================================================

const roleHierarchy: Record<WorkspaceRole, number> = {
  admin: 100,
  vault_medewerker: 80,
  medewerker: 60,
  klant_editor: 40,
  klant_viewer: 20,
}

function hasMinimumRole(userRole: WorkspaceRole, requiredRole: WorkspaceRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// =============================================================================
// Auth Provider
// =============================================================================

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Sign in
  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Inloggen mislukt')
    }

    const data = await response.json()
    setUser(data.user)
    router.push('/dashboard')
  }

  // Sign out
  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  // Check workspace access
  const checkWorkspaceAccess = async (
    workspaceId: string,
    requiredRole?: WorkspaceRole
  ): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/role`)
      if (!response.ok) return false

      const { role } = await response.json()
      if (!role) return false

      if (requiredRole) {
        return hasMinimumRole(role as WorkspaceRole, requiredRole)
      }

      return true
    } catch {
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        checkWorkspaceAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// =============================================================================
// Auth Guard Component
// =============================================================================

export function AuthGuard({
  children,
  requiredRole,
  workspaceId,
  fallback,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { isLoading, isAuthenticated, checkWorkspaceAccess } = useAuth()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Check access
  useEffect(() => {
    const checkAccess = async () => {
      if (isLoading) return

      if (!isAuthenticated) {
        setHasAccess(false)
        router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      // If no workspace-specific check needed
      if (!workspaceId || !requiredRole) {
        setHasAccess(true)
        return
      }

      // Check workspace access
      const access = await checkWorkspaceAccess(workspaceId, requiredRole)
      setHasAccess(access)

      if (!access) {
        router.push('/403')
      }
    }

    checkAccess()
  }, [
    isLoading,
    isAuthenticated,
    workspaceId,
    requiredRole,
    router,
    pathname,
    redirectTo,
    checkWorkspaceAccess,
  ])

  // Loading state
  if (isLoading || hasAccess === null) {
    return (
      fallback || (
        <div className="auth-guard-loading">
          <Loading size="lg" text="Authenticeren..." />
          <style dangerouslySetInnerHTML={{__html: `
            .auth-guard-loading {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
          `}} />
        </div>
      )
    )
  }

  // No access
  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}

// =============================================================================
// Hook
// =============================================================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext }
