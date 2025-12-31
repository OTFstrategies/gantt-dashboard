'use client'

import React from 'react'
import { useScheduler } from '@/hooks'
import { CriticalPathLegend } from './CriticalPathLegend'

// =============================================================================
// Types
// =============================================================================

export interface SchedulingInfoProps {
  showLegend?: boolean
  showConflicts?: boolean
  showProjectDates?: boolean
  className?: string
}

// =============================================================================
// Scheduling Info Panel Component
// =============================================================================

export function SchedulingInfo({
  showLegend = true,
  showConflicts = true,
  showProjectDates = true,
  className = '',
}: SchedulingInfoProps) {
  const { schedulingResult, criticalPath, conflicts, hasConflicts } = useScheduler()

  if (!schedulingResult) {
    return null
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className={`scheduling-info ${className}`}>
      {/* Project dates */}
      {showProjectDates && (
        <div className="scheduling-info__dates">
          <div className="scheduling-info__stat">
            <span className="scheduling-info__stat-label">Project duur</span>
            <span className="scheduling-info__stat-value">
              {schedulingResult.projectDuration} werkdagen
            </span>
          </div>
          <div className="scheduling-info__stat">
            <span className="scheduling-info__stat-label">Start</span>
            <span className="scheduling-info__stat-value">
              {formatDate(schedulingResult.projectStart)}
            </span>
          </div>
          <div className="scheduling-info__stat">
            <span className="scheduling-info__stat-label">Einde</span>
            <span className="scheduling-info__stat-value">
              {formatDate(schedulingResult.projectEnd)}
            </span>
          </div>
          <div className="scheduling-info__stat">
            <span className="scheduling-info__stat-label">Kritieke taken</span>
            <span className="scheduling-info__stat-value scheduling-info__stat-value--critical">
              {criticalPath.length}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="scheduling-info__legend">
          <CriticalPathLegend />
        </div>
      )}

      {/* Conflicts */}
      {showConflicts && hasConflicts && (
        <div className="scheduling-info__conflicts">
          <h4 className="scheduling-info__conflicts-title">
            Waarschuwingen ({conflicts.length})
          </h4>
          <ul className="scheduling-info__conflicts-list">
            {conflicts.map((conflict, index) => (
              <li
                key={index}
                className={`scheduling-info__conflict scheduling-info__conflict--${conflict.severity}`}
              >
                {conflict.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .scheduling-info {
          font-size: 0.875rem;
        }

        .scheduling-info__dates {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--color-bg-secondary, #f8f9fa);
          border-radius: 6px;
          margin-bottom: 0.75rem;
        }

        .scheduling-info__stat {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .scheduling-info__stat-label {
          font-size: 0.75rem;
          color: var(--color-text-secondary, #6c757d);
        }

        .scheduling-info__stat-value {
          font-weight: 500;
        }

        .scheduling-info__stat-value--critical {
          color: var(--color-critical, #dc3545);
        }

        .scheduling-info__legend {
          padding: 0.5rem 0;
          border-top: 1px solid var(--color-border, #e9ecef);
        }

        .scheduling-info__conflicts {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 6px;
        }

        .scheduling-info__conflicts-title {
          margin: 0 0 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #856404;
        }

        .scheduling-info__conflicts-list {
          margin: 0;
          padding: 0 0 0 1rem;
        }

        .scheduling-info__conflict {
          margin: 0.25rem 0;
          color: #856404;
        }

        .scheduling-info__conflict--error {
          color: #721c24;
          background: #f8d7da;
          padding: 0.25rem 0.5rem;
          margin-left: -1rem;
          padding-left: 1rem;
          border-radius: 4px;
        }

        :global(.dark) .scheduling-info__dates {
          background: rgba(255, 255, 255, 0.05);
        }
      `}} />
    </div>
  )
}

export default SchedulingInfo
