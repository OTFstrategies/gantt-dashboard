'use client'

import React from 'react'
import { Button } from '@/components/shared'
import type { Project, ProjectStatus } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface ProjectHeaderProps {
  project: Project
  onEdit?: () => void
  onExport?: () => void
  onShare?: () => void
  className?: string
}

// =============================================================================
// Status Configuration
// =============================================================================

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  draft: { label: 'Concept', color: 'var(--color-project-draft, #6c757d)' },
  active: { label: 'Actief', color: 'var(--color-project-active, #198754)' },
  on_hold: { label: 'Gepauzeerd', color: 'var(--color-project-on-hold, #ffc107)' },
  completed: { label: 'Voltooid', color: 'var(--color-project-completed, #0d6efd)' },
  archived: { label: 'Gearchiveerd', color: 'var(--color-project-archived, #adb5bd)' },
  cancelled: { label: 'Geannuleerd', color: 'var(--color-project-cancelled, #dc3545)' },
}

// =============================================================================
// Icons
// =============================================================================

const icons = {
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  export: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
}

// =============================================================================
// Project Header Component
// =============================================================================

export function ProjectHeader({
  project,
  onEdit,
  onExport,
  onShare,
  className = '',
}: ProjectHeaderProps) {
  const status = statusConfig[project.status]

  // Format dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className={`project-header ${className}`}>
      <div className="project-info">
        <div className="project-title-row">
          <h1 className="project-name">{project.name}</h1>
          <span className="project-status" style={{ backgroundColor: status.color }}>
            {status.label}
          </span>
        </div>

        {project.description && (
          <p className="project-description">{project.description}</p>
        )}

        <div className="project-meta">
          {project.start_date && (
            <span className="meta-item">
              <strong>Start:</strong> {formatDate(project.start_date)}
            </span>
          )}
          {project.end_date && (
            <span className="meta-item">
              <strong>Einde:</strong> {formatDate(project.end_date)}
            </span>
          )}
        </div>
      </div>

      <div className="project-actions">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={icons.edit}
            onClick={onEdit}
          >
            Bewerken
          </Button>
        )}
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={icons.export}
            onClick={onExport}
          >
            Exporteren
          </Button>
        )}
        {onShare && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={icons.share}
            onClick={onShare}
          >
            Delen
          </Button>
        )}
      </div>

      <style jsx>{`
        .project-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1rem 0;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .project-info {
          flex: 1;
          min-width: 0;
        }

        .project-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .project-name {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-text-primary, #212529);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-status {
          flex-shrink: 0;
          padding: 0.25rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: white;
          border-radius: 9999px;
        }

        .project-description {
          margin: 0.5rem 0;
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6c757d);
          line-height: 1.5;
        }

        .project-meta {
          display: flex;
          gap: 1.5rem;
          font-size: 0.8125rem;
          color: var(--color-text-tertiary, #adb5bd);
        }

        .meta-item strong {
          color: var(--color-text-secondary, #6c757d);
        }

        .project-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .project-header {
            flex-direction: column;
          }

          .project-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
