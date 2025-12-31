'use client'

import React, { useState, useRef, useEffect } from 'react'
import type { Workspace } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface WorkspaceSwitcherProps {
  currentWorkspace?: Workspace
  workspaces: Workspace[]
  onSelect: (workspace: Workspace) => void
  className?: string
}

// =============================================================================
// Icons
// =============================================================================

const icons = {
  chevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
}

// =============================================================================
// Workspace Switcher Component
// =============================================================================

export function WorkspaceSwitcher({
  currentWorkspace,
  workspaces,
  onSelect,
  className = '',
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown when pressing Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = (workspace: Workspace) => {
    onSelect(workspace)
    setIsOpen(false)
  }

  return (
    <div className={`workspace-switcher ${className}`} ref={dropdownRef}>
      <button
        className="switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="switcher-name">
          {currentWorkspace?.name || 'Selecteer workspace'}
        </span>
        <span className={`switcher-chevron ${isOpen ? 'open' : ''}`}>
          {icons.chevronDown}
        </span>
      </button>

      {isOpen && (
        <div className="switcher-dropdown" role="listbox">
          {workspaces.map(workspace => (
            <button
              key={workspace.id}
              className={`switcher-option ${workspace.id === currentWorkspace?.id ? 'selected' : ''}`}
              onClick={() => handleSelect(workspace)}
              role="option"
              aria-selected={workspace.id === currentWorkspace?.id}
            >
              <span className="option-name">{workspace.name}</span>
              <span className="option-type">
                {workspace.type === 'afdeling' ? 'Afdeling' : 'Klant'}
              </span>
              {workspace.id === currentWorkspace?.id && (
                <span className="option-check">{icons.check}</span>
              )}
            </button>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .workspace-switcher {
          position: relative;
        }

        .switcher-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          width: 100%;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: var(--radius-md, 6px);
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .switcher-trigger:hover {
          border-color: var(--color-border-strong, #dee2e6);
        }

        .switcher-name {
          flex: 1;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary, #212529);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .switcher-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          color: var(--color-text-tertiary, #adb5bd);
          transition: transform var(--transition-fast);
        }

        .switcher-chevron.open {
          transform: rotate(180deg);
        }

        .switcher-chevron :global(svg) {
          width: 100%;
          height: 100%;
        }

        .switcher-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.25rem;
          background: var(--color-surface-elevated, #ffffff);
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: var(--radius-md, 6px);
          box-shadow: var(--shadow-lg);
          z-index: var(--z-dropdown, 1000);
          max-height: 300px;
          overflow-y: auto;
        }

        .switcher-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background var(--transition-fast);
        }

        .switcher-option:hover {
          background: var(--color-gray-100, #f1f3f5);
        }

        .switcher-option.selected {
          background: var(--color-primary, #0d6efd);
        }

        .switcher-option.selected:hover {
          background: var(--color-primary-dark, #0b5ed7);
        }

        .option-name {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary, #212529);
        }

        .switcher-option.selected .option-name {
          color: white;
        }

        .option-type {
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-tertiary, #adb5bd);
        }

        .switcher-option.selected .option-type {
          color: rgba(255, 255, 255, 0.7);
        }

        .option-check {
          width: 16px;
          height: 16px;
          color: white;
        }

        .option-check :global(svg) {
          width: 100%;
          height: 100%;
        }

        :global(.dark) .switcher-dropdown {
          background: var(--color-surface-elevated, #2d2d4a);
        }

        :global(.dark) .switcher-option:hover {
          background: var(--color-surface, #252542);
        }
      `}} />
    </div>
  )
}
