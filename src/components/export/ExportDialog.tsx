'use client'

import React, { useState } from 'react'
import { useExport } from '@/hooks'
import type { ExportFormat, ExportScope } from '@/hooks'

// =============================================================================
// Types
// =============================================================================

export interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  defaultScope?: ExportScope
  className?: string
}

// =============================================================================
// Options Configuration
// =============================================================================

const formatOptions: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'excel', label: 'Excel (.xlsx)', description: 'Geschikt voor verdere bewerking in Excel' },
  { value: 'csv', label: 'CSV', description: 'Universeel formaat, te openen in elke spreadsheet' },
  { value: 'json', label: 'JSON', description: 'Voor technische integraties en backups' },
]

const scopeOptions: { value: ExportScope; label: string; description: string }[] = [
  { value: 'project', label: 'Volledig project', description: 'Taken, resources en dependencies' },
  { value: 'tasks', label: 'Alleen taken', description: 'Exporteer alleen de takenlijst' },
  { value: 'resources', label: 'Alleen resources', description: 'Exporteer alleen de resourcelijst' },
]

// =============================================================================
// Export Dialog Component
// =============================================================================

export function ExportDialog({
  isOpen,
  onClose,
  defaultScope = 'project',
  className = '',
}: ExportDialogProps) {
  const { isExporting, error, exportData, clearError } = useExport()
  const [format, setFormat] = useState<ExportFormat>('excel')
  const [scope, setScope] = useState<ExportScope>(defaultScope)

  if (!isOpen) return null

  const handleExport = async () => {
    await exportData({ format, scope })
    if (!error) {
      onClose()
    }
  }

  const handleClose = () => {
    clearError()
    onClose()
  }

  return (
    <>
      <div className="export-dialog-overlay" onClick={handleClose} />
      <div
        className={`export-dialog ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
      >
        <header className="export-dialog__header">
          <h2 id="export-title">Exporteren</h2>
          <button
            className="export-dialog__close"
            onClick={handleClose}
            aria-label="Sluiten"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="export-dialog__content">
          {/* Scope selection */}
          <fieldset className="export-dialog__fieldset">
            <legend>Wat wil je exporteren?</legend>
            <div className="export-dialog__options">
              {scopeOptions.map(option => (
                <label
                  key={option.value}
                  className={`export-dialog__option ${scope === option.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="scope"
                    value={option.value}
                    checked={scope === option.value}
                    onChange={() => setScope(option.value)}
                  />
                  <span className="export-dialog__option-content">
                    <span className="export-dialog__option-label">{option.label}</span>
                    <span className="export-dialog__option-desc">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Format selection */}
          <fieldset className="export-dialog__fieldset">
            <legend>Formaat</legend>
            <div className="export-dialog__options">
              {formatOptions.map(option => (
                <label
                  key={option.value}
                  className={`export-dialog__option ${format === option.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={format === option.value}
                    onChange={() => setFormat(option.value)}
                  />
                  <span className="export-dialog__option-content">
                    <span className="export-dialog__option-label">{option.label}</span>
                    <span className="export-dialog__option-desc">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Error message */}
          {error && (
            <div className="export-dialog__error" role="alert">
              {error}
            </div>
          )}
        </div>

        <footer className="export-dialog__footer">
          <button
            className="export-dialog__btn export-dialog__btn--secondary"
            onClick={handleClose}
            disabled={isExporting}
          >
            Annuleren
          </button>
          <button
            className="export-dialog__btn export-dialog__btn--primary"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporteren...' : 'Exporteren'}
          </button>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .export-dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }

        .export-dialog {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--color-surface, #ffffff);
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          width: 90%;
          max-width: 480px;
          max-height: 90vh;
          overflow: auto;
          z-index: 1001;
        }

        .export-dialog__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .export-dialog__header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .export-dialog__close {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: var(--color-text-secondary, #6c757d);
          transition: color 0.15s;
        }

        .export-dialog__close:hover {
          color: var(--color-text-primary, #333);
        }

        .export-dialog__close svg {
          width: 20px;
          height: 20px;
        }

        .export-dialog__content {
          padding: 1.5rem;
        }

        .export-dialog__fieldset {
          border: none;
          margin: 0 0 1.5rem;
          padding: 0;
        }

        .export-dialog__fieldset:last-of-type {
          margin-bottom: 0;
        }

        .export-dialog__fieldset legend {
          font-weight: 600;
          margin-bottom: 0.75rem;
          font-size: 0.9375rem;
        }

        .export-dialog__options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .export-dialog__option {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .export-dialog__option:hover {
          background: var(--color-bg-secondary, #f8f9fa);
        }

        .export-dialog__option.selected {
          border-color: var(--color-primary, #0066cc);
          background: rgba(0, 102, 204, 0.05);
        }

        .export-dialog__option input {
          margin-top: 0.25rem;
        }

        .export-dialog__option-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .export-dialog__option-label {
          font-weight: 500;
        }

        .export-dialog__option-desc {
          font-size: 0.8125rem;
          color: var(--color-text-secondary, #6c757d);
        }

        .export-dialog__error {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #b91c1c;
          font-size: 0.875rem;
        }

        .export-dialog__footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--color-border, #e9ecef);
          background: var(--color-bg-secondary, #f8f9fa);
        }

        .export-dialog__btn {
          padding: 0.625rem 1.25rem;
          border-radius: 6px;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .export-dialog__btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .export-dialog__btn--secondary {
          background: var(--color-surface, #fff);
          border: 1px solid var(--color-border, #ddd);
          color: var(--color-text-primary, #333);
        }

        .export-dialog__btn--secondary:hover:not(:disabled) {
          background: var(--color-bg-secondary, #f0f0f0);
        }

        .export-dialog__btn--primary {
          background: var(--color-primary, #0066cc);
          border: 1px solid var(--color-primary, #0066cc);
          color: white;
        }

        .export-dialog__btn--primary:hover:not(:disabled) {
          background: #0052a3;
          border-color: #0052a3;
        }

        :global(.dark) .export-dialog {
          background: var(--color-surface, #1e1e2e);
        }

        :global(.dark) .export-dialog__option:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        :global(.dark) .export-dialog__option.selected {
          background: rgba(0, 102, 204, 0.15);
        }

        :global(.dark) .export-dialog__footer {
          background: rgba(0, 0, 0, 0.1);
        }
      `}} />
    </>
  )
}

export default ExportDialog
