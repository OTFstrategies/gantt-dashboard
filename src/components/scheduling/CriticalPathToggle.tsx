'use client'

import React from 'react'

// =============================================================================
// Types
// =============================================================================

export interface CriticalPathToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  criticalTaskCount?: number
  className?: string
}

// =============================================================================
// Critical Path Toggle Component
// =============================================================================

export function CriticalPathToggle({
  enabled,
  onChange,
  criticalTaskCount,
  className = '',
}: CriticalPathToggleProps) {
  return (
    <label className={`critical-path-toggle ${className}`}>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="critical-path-toggle__label">
        Kritiek pad
        {criticalTaskCount !== undefined && (
          <span className="critical-path-toggle__count">
            ({criticalTaskCount} taken)
          </span>
        )}
      </span>

      <style dangerouslySetInnerHTML={{__html: `
        .critical-path-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          user-select: none;
        }

        .critical-path-toggle input {
          width: 1rem;
          height: 1rem;
          accent-color: var(--color-critical, #dc3545);
        }

        .critical-path-toggle__label {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .critical-path-toggle__count {
          color: var(--color-text-secondary, #6c757d);
        }
      `}} />
    </label>
  )
}

export default CriticalPathToggle
