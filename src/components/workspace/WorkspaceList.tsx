'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button, Skeleton } from '@/components/shared'
import type { Workspace } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface WorkspaceListProps {
  onSelect?: (workspace: Workspace) => void
  className?: string
}

// =============================================================================
// Icons
// =============================================================================

const icons = {
  workspace: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  afdeling: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  klant: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
}

// =============================================================================
// Workspace List Component
// =============================================================================

export function WorkspaceList({ onSelect, className = '' }: WorkspaceListProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'afdeling' | 'klant'>('all')

  // Load workspaces
  const loadWorkspaces = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/workspaces')
      if (!response.ok) {
        throw new Error('Kon workspaces niet laden')
      }
      const data = await response.json()
      setWorkspaces(data.workspaces || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Onbekende fout'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWorkspaces()
  }, [loadWorkspaces])

  // Filter workspaces
  const filteredWorkspaces = workspaces.filter(ws => {
    if (filter === 'all') return true
    return ws.type === filter
  })

  // Group by type
  const afdelingen = filteredWorkspaces.filter(ws => ws.type === 'afdeling')
  const klanten = filteredWorkspaces.filter(ws => ws.type === 'klant')

  if (isLoading) {
    return (
      <div className={`workspace-list ${className}`}>
        <div className="workspace-list-loading">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height={72} />
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          .workspace-list-loading {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
        `}} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`workspace-list workspace-list-error ${className}`}>
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={loadWorkspaces}>
          Opnieuw proberen
        </Button>
        <style dangerouslySetInnerHTML={{__html: `
          .workspace-list-error {
            text-align: center;
            padding: 2rem;
            color: var(--color-text-secondary, #6c757d);
          }
          .workspace-list-error p {
            margin: 0 0 1rem;
          }
        `}} />
      </div>
    )
  }

  return (
    <div className={`workspace-list ${className}`}>
      {/* Filter tabs */}
      <div className="workspace-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Alle ({workspaces.length})
        </button>
        <button
          className={`filter-btn ${filter === 'afdeling' ? 'active' : ''}`}
          onClick={() => setFilter('afdeling')}
        >
          Afdelingen ({afdelingen.length})
        </button>
        <button
          className={`filter-btn ${filter === 'klant' ? 'active' : ''}`}
          onClick={() => setFilter('klant')}
        >
          Klanten ({klanten.length})
        </button>
      </div>

      {/* Workspace list */}
      {filteredWorkspaces.length === 0 ? (
        <div className="workspace-empty">
          <p>Geen workspaces gevonden</p>
        </div>
      ) : (
        <div className="workspace-grid">
          {filteredWorkspaces.map(workspace => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .workspace-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .workspace-filters {
          display: flex;
          gap: 0.5rem;
          padding: 0.25rem;
          background: var(--color-gray-100, #f1f3f5);
          border-radius: var(--radius-lg, 8px);
        }

        .filter-btn {
          flex: 1;
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--color-text-secondary, #6c757d);
          background: transparent;
          border: none;
          border-radius: var(--radius-md, 6px);
          cursor: pointer;
          transition:
            background var(--transition-fast),
            color var(--transition-fast);
        }

        .filter-btn:hover {
          color: var(--color-text-primary, #212529);
        }

        .filter-btn.active {
          background: var(--color-surface, #ffffff);
          color: var(--color-text-primary, #212529);
          box-shadow: var(--shadow-sm);
        }

        .workspace-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .workspace-empty {
          text-align: center;
          padding: 3rem;
          color: var(--color-text-tertiary, #adb5bd);
        }

        .workspace-empty p {
          margin: 0;
        }

        :global(.dark) .workspace-filters {
          background: var(--color-surface, #252542);
        }

        :global(.dark) .filter-btn.active {
          background: var(--color-surface-elevated, #2d2d4a);
        }
      `}} />
    </div>
  )
}

// =============================================================================
// Workspace Card Component
// =============================================================================

interface WorkspaceCardProps {
  workspace: Workspace
  onSelect?: (workspace: Workspace) => void
}

function WorkspaceCard({ workspace, onSelect }: WorkspaceCardProps) {
  const icon = workspace.type === 'afdeling' ? icons.afdeling : icons.klant
  const typeLabel = workspace.type === 'afdeling' ? 'Afdeling' : 'Klant'

  const handleClick = () => {
    onSelect?.(workspace)
  }

  return (
    <Link href={`/workspaces/${workspace.id}`} className="workspace-card" onClick={handleClick}>
      <div className="workspace-card-icon">{icon}</div>
      <div className="workspace-card-content">
        <h3 className="workspace-card-name">{workspace.name}</h3>
        <span className="workspace-card-type">{typeLabel}</span>
        {workspace.description && (
          <p className="workspace-card-description">{workspace.description}</p>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .workspace-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: var(--radius-lg, 8px);
          text-decoration: none;
          transition:
            border-color var(--transition-fast),
            box-shadow var(--transition-fast);
        }

        .workspace-card:hover {
          border-color: var(--color-primary, #0d6efd);
          box-shadow: var(--shadow-md);
        }

        .workspace-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--color-gray-100, #f1f3f5);
          border-radius: var(--radius-md, 6px);
          color: var(--color-primary, #0d6efd);
          flex-shrink: 0;
        }

        .workspace-card-icon :global(svg) {
          width: 24px;
          height: 24px;
        }

        .workspace-card-content {
          flex: 1;
          min-width: 0;
        }

        .workspace-card-name {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary, #212529);
        }

        .workspace-card-type {
          display: inline-block;
          margin-top: 0.25rem;
          font-size: 0.6875rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-tertiary, #adb5bd);
        }

        .workspace-card-description {
          margin: 0.5rem 0 0;
          font-size: 0.8125rem;
          color: var(--color-text-secondary, #6c757d);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        :global(.dark) .workspace-card-icon {
          background: var(--color-surface-elevated, #2d2d4a);
        }
      `}} />
    </Link>
  )
}
