'use client'

import React from 'react'

// =============================================================================
// Types
// =============================================================================

type ViewType = 'gantt' | 'calendar' | 'taskboard' | 'grid'

interface ViewSwitcherProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  availableViews?: ViewType[]
  className?: string
}

// =============================================================================
// View Icons
// =============================================================================

const viewIcons: Record<ViewType, React.ReactNode> = {
  gantt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="16" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="12" y2="18" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  taskboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
}

const viewLabels: Record<ViewType, string> = {
  gantt: 'Gantt',
  calendar: 'Kalender',
  taskboard: 'TaskBoard',
  grid: 'Grid',
}

// =============================================================================
// View Switcher Component
// =============================================================================

export function ViewSwitcher({
  currentView,
  onViewChange,
  availableViews = ['gantt', 'calendar', 'taskboard', 'grid'],
  className = '',
}: ViewSwitcherProps) {
  return (
    <div className={`view-switcher ${className}`} role="tablist">
      {availableViews.map(view => (
        <button
          key={view}
          role="tab"
          aria-selected={currentView === view}
          className={`view-button ${currentView === view ? 'active' : ''}`}
          onClick={() => onViewChange(view)}
          title={viewLabels[view]}
        >
          <span className="view-icon">{viewIcons[view]}</span>
          <span className="view-label">{viewLabels[view]}</span>
        </button>
      ))}

      <style jsx>{`
        .view-switcher {
          display: flex;
          gap: 0.25rem;
          padding: 0.25rem;
          background: var(--color-gray-100, #f1f3f5);
          border-radius: var(--radius-lg, 8px);
        }

        .view-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
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

        .view-button:hover {
          color: var(--color-text-primary, #212529);
        }

        .view-button.active {
          background: var(--color-surface, #ffffff);
          color: var(--color-text-primary, #212529);
          box-shadow: var(--shadow-sm);
        }

        .view-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }

        .view-icon :global(svg) {
          width: 100%;
          height: 100%;
        }

        .view-label {
          display: none;
        }

        @media (min-width: 640px) {
          .view-label {
            display: inline;
          }
        }

        /* Dark mode */
        :global(.dark) .view-switcher {
          background: var(--color-surface, #252542);
        }

        :global(.dark) .view-button.active {
          background: var(--color-surface-elevated, #2d2d4a);
        }
      `}</style>
    </div>
  )
}
