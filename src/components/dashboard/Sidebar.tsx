'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// =============================================================================
// Types
// =============================================================================

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: number | string
}

interface NavGroup {
  id: string
  label?: string
  items: NavItem[]
}

interface SidebarProps {
  logo?: React.ReactNode
  navigation: NavGroup[]
  footer?: React.ReactNode
  collapsed?: boolean
}

// =============================================================================
// Default Icons
// =============================================================================

export const sidebarIcons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
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
  resources: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  vault: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  workspace: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  project: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  export: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
}

// =============================================================================
// Sidebar Component
// =============================================================================

export function Sidebar({ logo, navigation, footer, collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      {logo && (
        <div className="sidebar-logo">
          {logo}
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navigation.map(group => (
          <div key={group.id} className="nav-group">
            {group.label && !collapsed && (
              <div className="nav-group-label">{group.label}</div>
            )}
            <ul className="nav-list">
              {group.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {!collapsed && <span className="nav-label">{item.label}</span>}
                      {!collapsed && item.badge !== undefined && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && !collapsed && (
        <div className="sidebar-footer">{footer}</div>
      )}

      <style jsx>{`
        .sidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .sidebar-logo {
          padding: 1rem;
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .sidebar-nav {
          flex: 1;
          padding: 0.5rem;
          overflow-y: auto;
        }

        .nav-group {
          margin-bottom: 1rem;
        }

        .nav-group-label {
          padding: 0.5rem 0.75rem;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-tertiary, #adb5bd);
        }

        .nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          border-radius: var(--radius-md, 6px);
          color: var(--color-text-secondary, #6c757d);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition:
            background var(--transition-fast),
            color var(--transition-fast);
        }

        .nav-item:hover {
          background: var(--color-gray-100, #f1f3f5);
          color: var(--color-text-primary, #212529);
        }

        .nav-item.active {
          background: var(--color-primary, #0d6efd);
          color: var(--color-primary-contrast, #ffffff);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .nav-icon :global(svg) {
          width: 100%;
          height: 100%;
        }

        .nav-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-badge {
          padding: 0.125rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 600;
          background: var(--color-primary, #0d6efd);
          color: white;
          border-radius: 9999px;
        }

        .nav-item.active .nav-badge {
          background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--color-border, #e9ecef);
        }

        /* Collapsed state */
        .collapsed .sidebar-nav {
          padding: 0.5rem 0.25rem;
        }

        .collapsed .nav-item {
          justify-content: center;
          padding: 0.75rem;
        }

        .collapsed .nav-icon {
          width: 24px;
          height: 24px;
        }

        /* Dark mode */
        :global(.dark) .nav-item:hover {
          background: var(--color-surface, #252542);
          color: var(--color-text-primary, #f8f9fa);
        }
      `}</style>
    </div>
  )
}
