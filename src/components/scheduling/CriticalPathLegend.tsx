'use client'

import React from 'react'

// =============================================================================
// Types
// =============================================================================

export interface CriticalPathLegendProps {
  showSlackLegend?: boolean
  className?: string
}

// =============================================================================
// Critical Path Legend Component
// =============================================================================

export function CriticalPathLegend({
  showSlackLegend = true,
  className = '',
}: CriticalPathLegendProps) {
  return (
    <div className={`critical-path-legend ${className}`}>
      <div className="critical-path-legend__item">
        <span className="critical-path-legend__color critical-path-legend__color--critical" />
        <span className="critical-path-legend__label">Kritiek pad (geen speling)</span>
      </div>

      {showSlackLegend && (
        <>
          <div className="critical-path-legend__item">
            <span className="critical-path-legend__color critical-path-legend__color--low-slack" />
            <span className="critical-path-legend__label">Weinig speling (1-3 dagen)</span>
          </div>

          <div className="critical-path-legend__item">
            <span className="critical-path-legend__color critical-path-legend__color--normal" />
            <span className="critical-path-legend__label">Normale speling (&gt;3 dagen)</span>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .critical-path-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 0.5rem;
          font-size: 0.75rem;
          color: var(--color-text-secondary, #6c757d);
        }

        .critical-path-legend__item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .critical-path-legend__color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .critical-path-legend__color--critical {
          background: var(--color-critical, #dc3545);
        }

        .critical-path-legend__color--low-slack {
          background: var(--color-warning, #ffc107);
        }

        .critical-path-legend__color--normal {
          background: var(--color-success, #28a745);
        }

        .critical-path-legend__label {
          white-space: nowrap;
        }
      `}} />
    </div>
  )
}

export default CriticalPathLegend
