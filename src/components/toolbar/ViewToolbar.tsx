'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ExportDialog } from '@/components/export'
import type { ExportScope } from '@/hooks'

// =============================================================================
// Types
// =============================================================================

export interface ViewToolbarProps {
  projectId: string | null
  title: string
  subtitle?: string
  defaultExportScope?: ExportScope
  children?: React.ReactNode
}

// =============================================================================
// View Toolbar Component
// =============================================================================

export function ViewToolbar({
  projectId,
  title,
  subtitle,
  defaultExportScope = 'project',
  children,
}: ViewToolbarProps) {
  const [showExportDialog, setShowExportDialog] = useState(false)

  return (
    <>
      <header className="view-toolbar">
        <div className="view-toolbar__left">
          {projectId && (
            <Link href={`/projects/${projectId}`} className="view-toolbar__back">
              ← Terug naar project
            </Link>
          )}
          <div className="view-toolbar__title">
            <h1>{title}</h1>
            {subtitle && <p className="view-toolbar__subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="view-toolbar__right">
          {children}
          <button
            className="view-toolbar__btn view-toolbar__btn--export"
            onClick={() => setShowExportDialog(true)}
            aria-label="Exporteren"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exporteren
          </button>
        </div>
      </header>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        defaultScope={defaultExportScope}
      />

      <style jsx>{`
        .view-toolbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: var(--color-surface, #ffffff);
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .view-toolbar__left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .view-toolbar__back {
          display: inline-block;
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6c757d);
          text-decoration: none;
        }

        .view-toolbar__back:hover {
          color: var(--color-primary, #0d6efd);
        }

        .view-toolbar__title h1 {
          margin: 0;
          font-size: 1.5rem;
        }

        .view-toolbar__subtitle {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6c757d);
        }

        .view-toolbar__right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .view-toolbar__btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .view-toolbar__btn svg {
          width: 16px;
          height: 16px;
        }

        .view-toolbar__btn--export {
          background: var(--color-surface, #fff);
          border: 1px solid var(--color-border, #ddd);
          color: var(--color-text-primary, #333);
        }

        .view-toolbar__btn--export:hover {
          background: var(--color-bg-secondary, #f0f0f0);
          border-color: var(--color-primary, #0066cc);
          color: var(--color-primary, #0066cc);
        }

        @media (max-width: 640px) {
          .view-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .view-toolbar__right {
            justify-content: flex-end;
          }
        }
      `}</style>
    </>
  )
}

export default ViewToolbar
