'use client'

import React from 'react'
import { useProject } from '@/providers'
import { ErrorBoundary } from '../shared/ErrorBoundary'

// =============================================================================
// Types
// =============================================================================

export interface ResourceGridProps {
  className?: string
  onResourceClick?: (resourceId: string) => void
  onResourceEdit?: (resourceId: string) => void
  readOnly?: boolean
}

// =============================================================================
// Component
// =============================================================================

function ResourceGridInner({
  className = '',
  onResourceClick,
  onResourceEdit,
  readOnly = false,
}: ResourceGridProps) {
  const { projectData, syncState } = useProject()

  if (syncState.isLoading) {
    return (
      <div className={`resource-grid resource-grid--loading ${className}`}>
        <div className="resource-grid__loader">
          <div className="resource-grid__spinner" />
          <p>Resources laden...</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  if (syncState.error) {
    return (
      <div className={`resource-grid resource-grid--error ${className}`}>
        <div className="resource-grid__error">
          <span className="resource-grid__error-icon">⚠️</span>
          <p>{syncState.error}</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  const resources = projectData?.resources || []

  return (
    <div className={`resource-grid ${className}`}>
      <div className="resource-grid__header">
        <h2>Resource Grid</h2>
        <span className="resource-grid__count">{resources.length} resources</span>
      </div>

      <div className="resource-grid__table-wrapper">
        <table className="resource-grid__table">
          <thead>
            <tr>
              <th>Naam</th>
              <th>Type</th>
              <th>Capaciteit</th>
              <th>Kosten/uur</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr>
                <td colSpan={5} className="resource-grid__empty">
                  <p>Geen resources gevonden</p>
                  <small>Voeg resources toe om ze hier te zien</small>
                </td>
              </tr>
            ) : (
              resources.map(resource => (
                <tr
                  key={resource.id}
                  onClick={() => onResourceClick?.(resource.id)}
                >
                  <td>{resource.name}</td>
                  <td>
                    <span className={`resource-grid__type resource-grid__type--${resource.type}`}>
                      {resource.type}
                    </span>
                  </td>
                  <td>{resource.capacity || 100}%</td>
                  <td>€{resource.cost_per_hour?.toFixed(2) || '0.00'}</td>
                  <td>
                    <button
                      className="resource-grid__action"
                      onClick={(e) => {
                        e.stopPropagation()
                        onResourceEdit?.(resource.id)
                      }}
                      disabled={readOnly}
                    >
                      Bewerken
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="resource-grid__info">
        <p>Deze grid wordt uitgebreid met <code>TanStack Table</code> voor sorteren, filteren en virtueel scrollen.</p>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}

// =============================================================================
// Styles
// =============================================================================

const styles = `
  .resource-grid {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 400px;
    background: var(--color-bg-secondary, #f5f5f5);
    border-radius: 8px;
    overflow: hidden;
  }

  .resource-grid--loading,
  .resource-grid--error {
    justify-content: center;
    align-items: center;
  }

  .resource-grid__loader {
    text-align: center;
    color: var(--color-text-secondary, #666);
  }

  .resource-grid__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border, #ddd);
    border-top-color: var(--color-primary, #0066cc);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .resource-grid__error {
    text-align: center;
    color: var(--color-error, #dc3545);
  }

  .resource-grid__error-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }

  .resource-grid__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border, #ddd);
    background: var(--color-bg-tertiary, #fff);
  }

  .resource-grid__header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .resource-grid__count {
    font-size: 14px;
    color: var(--color-text-secondary, #666);
  }

  .resource-grid__table-wrapper {
    flex: 1;
    overflow: auto;
    padding: 16px;
  }

  .resource-grid__table {
    width: 100%;
    border-collapse: collapse;
    background: var(--color-bg-tertiary, #fff);
    border-radius: 8px;
    overflow: hidden;
  }

  .resource-grid__table th,
  .resource-grid__table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--color-border, #eee);
  }

  .resource-grid__table th {
    background: var(--color-bg-secondary, #f8f9fa);
    font-weight: 600;
    font-size: 13px;
    color: var(--color-text-secondary, #666);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .resource-grid__table tbody tr:hover {
    background: var(--color-bg-secondary, #f8f9fa);
    cursor: pointer;
  }

  .resource-grid__table tbody tr:last-child td {
    border-bottom: none;
  }

  .resource-grid__empty {
    text-align: center;
    padding: 48px 16px !important;
    color: var(--color-text-secondary, #666);
  }

  .resource-grid__empty p {
    margin: 0 0 4px;
    font-size: 15px;
  }

  .resource-grid__empty small {
    font-size: 13px;
    opacity: 0.7;
  }

  .resource-grid__type {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
  }

  .resource-grid__type--person {
    background: #e3f2fd;
    color: #1565c0;
  }

  .resource-grid__type--equipment {
    background: #fff3e0;
    color: #ef6c00;
  }

  .resource-grid__type--material {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .resource-grid__action {
    padding: 4px 12px;
    border: 1px solid var(--color-border, #ddd);
    border-radius: 4px;
    background: var(--color-bg-tertiary, #fff);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .resource-grid__action:hover:not(:disabled) {
    background: var(--color-primary, #0066cc);
    color: white;
    border-color: var(--color-primary, #0066cc);
  }

  .resource-grid__action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .resource-grid__info {
    padding: 12px 20px;
    border-top: 1px solid var(--color-border, #ddd);
    background: var(--color-bg-tertiary, #fff);
    text-align: center;
  }

  .resource-grid__info p {
    margin: 0;
    font-size: 13px;
    color: var(--color-text-secondary, #666);
  }

  .resource-grid__info code {
    background: var(--color-bg-secondary, #f0f0f0);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
`

// =============================================================================
// Export with Error Boundary
// =============================================================================

export function ResourceGrid(props: ResourceGridProps) {
  return (
    <ErrorBoundary fallback={<div>Er ging iets mis met de Resource grid.</div>}>
      <ResourceGridInner {...props} />
    </ErrorBoundary>
  )
}

export default ResourceGrid
