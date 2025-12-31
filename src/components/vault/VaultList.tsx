'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button, Skeleton } from '@/components/shared'
import type { VaultItem, VaultStatus } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface VaultListProps {
  workspaceId: string
  onItemSelect?: (item: VaultItem) => void
  onProcess?: (item: VaultItem, action: 'start_processing' | 'complete' | 'reject') => void
  className?: string
}

// =============================================================================
// Status Configuration
// =============================================================================

const statusConfig: Record<VaultStatus, { label: string; color: string; bgColor: string }> = {
  input: {
    label: 'Input',
    color: 'var(--color-status-input, #ffc107)',
    bgColor: 'var(--color-status-input-bg, #fff3cd)',
  },
  processing: {
    label: 'In Behandeling',
    color: 'var(--color-status-processing, #0dcaf0)',
    bgColor: 'var(--color-status-processing-bg, #cff4fc)',
  },
  done: {
    label: 'Gereed',
    color: 'var(--color-status-done, #198754)',
    bgColor: 'var(--color-status-done-bg, #d1e7dd)',
  },
  rejected: {
    label: 'Afgewezen',
    color: 'var(--color-status-rejected, #dc3545)',
    bgColor: 'var(--color-status-rejected-bg, #f8d7da)',
  },
}

// =============================================================================
// Vault List Component
// =============================================================================

export function VaultList({
  workspaceId,
  onItemSelect,
  onProcess,
  className = '',
}: VaultListProps) {
  const [items, setItems] = useState<VaultItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'input' | 'processing' | 'done' | 'rejected'>('all')

  // Load vault items
  const loadItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/vault?workspaceId=${workspaceId}`)
      if (!response.ok) {
        throw new Error('Kon vault items niet laden')
      }
      const data = await response.json()
      setItems(data.items || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Onbekende fout'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Filter items
  const filteredItems = items.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })

  // Count by status
  const counts = {
    all: items.length,
    input: items.filter(i => i.status === 'input').length,
    processing: items.filter(i => i.status === 'processing').length,
    done: items.filter(i => i.status === 'done').length,
    rejected: items.filter(i => i.status === 'rejected').length,
  }

  if (isLoading) {
    return (
      <div className={`vault-list ${className}`}>
        <div className="vault-loading">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height={120} />
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          .vault-loading {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
        `}} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`vault-list vault-error ${className}`}>
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={loadItems}>
          Opnieuw proberen
        </Button>
        <style dangerouslySetInnerHTML={{__html: `
          .vault-error {
            text-align: center;
            padding: 2rem;
            color: var(--color-text-secondary, #6c757d);
          }
          .vault-error p {
            margin: 0 0 1rem;
          }
        `}} />
      </div>
    )
  }

  return (
    <div className={`vault-list ${className}`}>
      {/* Stats bar */}
      <div className="vault-stats">
        <div className="stat-item">
          <span className="stat-value">{counts.input}</span>
          <span className="stat-label">Input</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{counts.processing}</span>
          <span className="stat-label">In Behandeling</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{counts.done}</span>
          <span className="stat-label">Gereed</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="vault-filters">
        {(['all', 'input', 'processing', 'done', 'rejected'] as const).map(status => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'Alle' : statusConfig[status].label} ({counts[status]})
          </button>
        ))}
      </div>

      {/* Item list */}
      {filteredItems.length === 0 ? (
        <div className="vault-empty">
          <p>Geen items gevonden</p>
        </div>
      ) : (
        <div className="vault-items">
          {filteredItems.map(item => (
            <VaultCard
              key={item.id}
              item={item}
              onSelect={onItemSelect}
              onProcess={onProcess}
            />
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .vault-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .vault-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .stat-item {
          padding: 1rem;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: var(--radius-lg, 8px);
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary, #212529);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--color-text-tertiary, #adb5bd);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .vault-filters {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--color-text-secondary, #6c757d);
          background: var(--color-gray-100, #f1f3f5);
          border: none;
          border-radius: var(--radius-full, 9999px);
          cursor: pointer;
          white-space: nowrap;
          transition:
            background var(--transition-fast),
            color var(--transition-fast);
        }

        .filter-btn:hover {
          color: var(--color-text-primary, #212529);
        }

        .filter-btn.active {
          background: var(--color-primary, #0d6efd);
          color: white;
        }

        .vault-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .vault-empty {
          text-align: center;
          padding: 3rem;
          color: var(--color-text-tertiary, #adb5bd);
        }

        .vault-empty p {
          margin: 0;
        }
      `}} />
    </div>
  )
}

// =============================================================================
// Vault Card Component
// =============================================================================

interface VaultCardProps {
  item: VaultItem
  onSelect?: (item: VaultItem) => void
  onProcess?: (item: VaultItem, action: 'start_processing' | 'complete' | 'reject') => void
}

function VaultCard({ item, onSelect, onProcess }: VaultCardProps) {
  const status = statusConfig[item.status]

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Check if expiring soon (within 7 days)
  const isExpiringSoon = item.expires_at
    ? new Date(item.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
    : false

  return (
    <div className="vault-card" onClick={() => onSelect?.(item)}>
      <div className="card-header">
        <span className="card-status" style={{ backgroundColor: status.bgColor, color: status.color }}>
          {status.label}
        </span>
        {isExpiringSoon && item.status === 'done' && (
          <span className="card-warning">Verloopt binnenkort</span>
        )}
      </div>

      <div className="card-content">
        <div className="card-meta">
          <span>Aangemaakt: {formatDate(item.created_at)}</span>
          {item.processed_at && <span>Verwerkt: {formatDate(item.processed_at)}</span>}
        </div>

        {item.processing_notes && (
          <p className="card-notes">{item.processing_notes}</p>
        )}
      </div>

      {onProcess && item.status === 'input' && (
        <div className="card-actions">
          <Button
            variant="primary"
            size="sm"
            onClick={e => {
              e.stopPropagation()
              onProcess(item, 'start_processing')
            }}
          >
            Start Verwerking
          </Button>
        </div>
      )}

      {onProcess && item.status === 'processing' && (
        <div className="card-actions">
          <Button
            variant="primary"
            size="sm"
            onClick={e => {
              e.stopPropagation()
              onProcess(item, 'complete')
            }}
          >
            Afronden
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation()
              onProcess(item, 'reject')
            }}
          >
            Afwijzen
          </Button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .vault-card {
          padding: 1rem;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: var(--radius-lg, 8px);
          cursor: pointer;
          transition:
            border-color var(--transition-fast),
            box-shadow var(--transition-fast);
        }

        .vault-card:hover {
          border-color: var(--color-primary, #0d6efd);
          box-shadow: var(--shadow-md);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .card-status {
          padding: 0.25rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: var(--radius-full, 9999px);
        }

        .card-warning {
          padding: 0.25rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--color-warning, #ffc107);
          background: var(--color-status-input-bg, #fff3cd);
          border-radius: var(--radius-full, 9999px);
        }

        .card-content {
          margin-bottom: 0.75rem;
        }

        .card-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--color-text-tertiary, #adb5bd);
        }

        .card-notes {
          margin: 0.5rem 0 0;
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6c757d);
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--color-border, #e9ecef);
        }
      `}} />
    </div>
  )
}
