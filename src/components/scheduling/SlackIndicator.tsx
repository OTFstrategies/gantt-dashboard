'use client'

import React from 'react'

// =============================================================================
// Types
// =============================================================================

export interface SlackIndicatorProps {
  totalSlack: number
  freeSlack?: number
  isCritical: boolean
  showLabel?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

// =============================================================================
// Slack Indicator Component
// =============================================================================

export function SlackIndicator({
  totalSlack,
  freeSlack,
  isCritical,
  showLabel = false,
  size = 'medium',
  className = '',
}: SlackIndicatorProps) {
  const getSlackLevel = (): 'critical' | 'low' | 'normal' => {
    if (isCritical || totalSlack === 0) return 'critical'
    if (totalSlack <= 3) return 'low'
    return 'normal'
  }

  const slackLevel = getSlackLevel()

  const getLabel = (): string => {
    if (isCritical) return 'Kritiek'
    if (totalSlack === 0) return 'Geen speling'
    return `${totalSlack}d speling`
  }

  return (
    <div
      className={`slack-indicator slack-indicator--${slackLevel} slack-indicator--${size} ${className}`}
      title={`Totale speling: ${totalSlack} dagen${freeSlack !== undefined ? `, Vrije speling: ${freeSlack} dagen` : ''}`}
    >
      <span className="slack-indicator__dot" />
      {showLabel && (
        <span className="slack-indicator__label">{getLabel()}</span>
      )}

      <style jsx>{`
        .slack-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .slack-indicator__dot {
          border-radius: 50%;
        }

        /* Sizes */
        .slack-indicator--small .slack-indicator__dot {
          width: 6px;
          height: 6px;
        }

        .slack-indicator--medium .slack-indicator__dot {
          width: 8px;
          height: 8px;
        }

        .slack-indicator--large .slack-indicator__dot {
          width: 10px;
          height: 10px;
        }

        /* Colors */
        .slack-indicator--critical .slack-indicator__dot {
          background: var(--color-critical, #dc3545);
          box-shadow: 0 0 4px var(--color-critical, #dc3545);
        }

        .slack-indicator--low .slack-indicator__dot {
          background: var(--color-warning, #ffc107);
        }

        .slack-indicator--normal .slack-indicator__dot {
          background: var(--color-success, #28a745);
        }

        /* Label */
        .slack-indicator__label {
          font-size: 0.75rem;
          color: var(--color-text-secondary, #6c757d);
        }

        .slack-indicator--critical .slack-indicator__label {
          color: var(--color-critical, #dc3545);
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

export default SlackIndicator
