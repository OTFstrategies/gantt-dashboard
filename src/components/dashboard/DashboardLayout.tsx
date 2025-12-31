'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useTheme } from '@/providers'
import { IconButton } from '@/components/shared'

// =============================================================================
// Types
// =============================================================================

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  sidebarCollapsed?: boolean
  onSidebarToggle?: (collapsed: boolean) => void
}

// =============================================================================
// Icons
// =============================================================================

const icons = {
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
}

// =============================================================================
// Dashboard Layout Component
// =============================================================================

export function DashboardLayout({
  children,
  sidebar,
  header,
  footer,
  sidebarCollapsed: controlledCollapsed,
  onSidebarToggle,
}: DashboardLayoutProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [internalCollapsed, setInternalCollapsed] = useState(false)

  // Use controlled or internal state
  const isCollapsed = controlledCollapsed ?? internalCollapsed

  const handleSidebarToggle = useCallback(() => {
    const newValue = !isCollapsed
    setInternalCollapsed(newValue)
    onSidebarToggle?.(newValue)
  }, [isCollapsed, onSidebarToggle])

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      const collapsed = JSON.parse(saved)
      setInternalCollapsed(collapsed)
      onSidebarToggle?.(collapsed)
    }
  }, [onSidebarToggle])

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

  return (
    <div className={`dashboard-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      {sidebar && (
        <aside className="dashboard-sidebar">
          <div className="sidebar-content">{sidebar}</div>
          <button
            className="sidebar-toggle"
            onClick={handleSidebarToggle}
            aria-label={isCollapsed ? 'Sidebar uitklappen' : 'Sidebar inklappen'}
          >
            {isCollapsed ? icons.chevronRight : icons.chevronLeft}
          </button>
        </aside>
      )}

      {/* Main content area */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            {!sidebar && (
              <IconButton
                icon={icons.menu}
                aria-label="Menu"
                onClick={handleSidebarToggle}
              />
            )}
            {header}
          </div>
          <div className="header-right">
            <IconButton
              icon={resolvedTheme === 'dark' ? icons.sun : icons.moon}
              aria-label={resolvedTheme === 'dark' ? 'Licht thema' : 'Donker thema'}
              onClick={toggleTheme}
            />
          </div>
        </header>

        {/* Content */}
        <main className="dashboard-content">{children}</main>

        {/* Footer */}
        {footer && <footer className="dashboard-footer">{footer}</footer>}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: var(--color-background, #ffffff);
        }

        /* Sidebar */
        .dashboard-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width, 280px);
          background: var(--color-surface, #ffffff);
          border-right: 1px solid var(--color-border, #e9ecef);
          display: flex;
          flex-direction: column;
          z-index: var(--z-fixed, 1030);
          transition: width var(--transition-normal);
        }

        .sidebar-collapsed .dashboard-sidebar {
          width: var(--sidebar-collapsed-width, 64px);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-toggle {
          position: absolute;
          top: 50%;
          right: -12px;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: background var(--transition-fast);
        }

        .sidebar-toggle:hover {
          background: var(--color-gray-100, #f1f3f5);
        }

        .sidebar-toggle svg {
          width: 14px;
          height: 14px;
          color: var(--color-text-secondary, #6c757d);
        }

        /* Main area */
        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: var(--sidebar-width, 280px);
          transition: margin-left var(--transition-normal);
        }

        .sidebar-collapsed .dashboard-main {
          margin-left: var(--sidebar-collapsed-width, 64px);
        }

        /* Header */
        .dashboard-header {
          position: sticky;
          top: 0;
          height: var(--header-height, 64px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          background: var(--color-surface, #ffffff);
          border-bottom: 1px solid var(--color-border, #e9ecef);
          z-index: var(--z-sticky, 1020);
        }

        .header-left,
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Content */
        .dashboard-content {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }

        /* Footer */
        .dashboard-footer {
          height: var(--footer-height, 48px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 1.5rem;
          background: var(--color-surface, #ffffff);
          border-top: 1px solid var(--color-border, #e9ecef);
          font-size: 0.75rem;
          color: var(--color-text-tertiary, #adb5bd);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
          }

          .sidebar-collapsed .dashboard-sidebar {
            transform: translateX(0);
            width: var(--sidebar-width, 280px);
          }

          .dashboard-main {
            margin-left: 0;
          }

          .sidebar-collapsed .dashboard-main {
            margin-left: 0;
          }

          .sidebar-toggle {
            display: none;
          }
        }
      `}} />
    </div>
  )
}
