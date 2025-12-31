'use client'

import React, { useState, useCallback } from 'react'
import { Button, IconButton } from '@/components/shared'

// =============================================================================
// View Presets (moved from lib/bryntum/config)
// =============================================================================

const viewPresets = {
  hourAndDay: 'hourAndDay',
  dayAndWeek: 'dayAndWeek',
  weekAndDay: 'weekAndDay',
  weekAndMonth: 'weekAndMonth',
  monthAndYear: 'monthAndYear',
  year: 'year',
} as const

const defaultViewPreset = 'weekAndMonth'

// =============================================================================
// Types
// =============================================================================

interface GanttToolbarProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomToFit?: () => void
  onViewPresetChange?: (preset: string) => void
  onExpandAll?: () => void
  onCollapseAll?: () => void
  onCriticalPath?: (enabled: boolean) => void
  onExport?: (format: 'pdf' | 'excel' | 'png') => void
  showCriticalPath?: boolean
  currentViewPreset?: string
  readOnly?: boolean
  className?: string
}

// =============================================================================
// Icons
// =============================================================================

const icons = {
  zoomIn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  zoomOut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  zoomToFit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  ),
  expand: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  collapse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
    </svg>
  ),
  criticalPath: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
}

// =============================================================================
// View Preset Labels (Dutch)
// =============================================================================

const presetLabels: Record<string, string> = {
  hourAndDay: 'Uur / Dag',
  dayAndWeek: 'Dag / Week',
  weekAndDay: 'Week / Dag',
  weekAndMonth: 'Week / Maand',
  monthAndYear: 'Maand / Jaar',
  year: 'Jaar',
}

// =============================================================================
// Gantt Toolbar Component
// =============================================================================

export function GanttToolbar({
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onViewPresetChange,
  onExpandAll,
  onCollapseAll,
  onCriticalPath,
  onExport,
  showCriticalPath = false,
  currentViewPreset = defaultViewPreset,
  readOnly = false,
  className = '',
}: GanttToolbarProps) {
  const [criticalPathEnabled, setCriticalPathEnabled] = useState(showCriticalPath)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)

  const handleCriticalPathToggle = useCallback(() => {
    const newValue = !criticalPathEnabled
    setCriticalPathEnabled(newValue)
    onCriticalPath?.(newValue)
  }, [criticalPathEnabled, onCriticalPath])

  const handleExport = useCallback(
    (format: 'pdf' | 'excel' | 'png') => {
      setExportMenuOpen(false)
      onExport?.(format)
    },
    [onExport]
  )

  return (
    <div className={`gantt-toolbar ${className}`}>
      {/* Zoom controls */}
      <div className="toolbar-group">
        <IconButton
          icon={icons.zoomOut}
          aria-label="Zoom uit"
          onClick={onZoomOut}
          size="sm"
        />
        <IconButton
          icon={icons.zoomIn}
          aria-label="Zoom in"
          onClick={onZoomIn}
          size="sm"
        />
        <IconButton
          icon={icons.zoomToFit}
          aria-label="Zoom passend"
          onClick={onZoomToFit}
          size="sm"
        />
      </div>

      {/* View preset selector */}
      <div className="toolbar-group">
        <select
          value={currentViewPreset}
          onChange={e => onViewPresetChange?.(e.target.value)}
          className="toolbar-select"
        >
          {Object.entries(viewPresets).map(([key, value]) => (
            <option key={key} value={value}>
              {presetLabels[key] || key}
            </option>
          ))}
        </select>
      </div>

      {/* Expand/Collapse */}
      <div className="toolbar-group">
        <IconButton
          icon={icons.expand}
          aria-label="Alles uitklappen"
          onClick={onExpandAll}
          size="sm"
        />
        <IconButton
          icon={icons.collapse}
          aria-label="Alles inklappen"
          onClick={onCollapseAll}
          size="sm"
        />
      </div>

      {/* Critical path toggle */}
      <div className="toolbar-group">
        <Button
          variant={criticalPathEnabled ? 'primary' : 'outline'}
          size="sm"
          leftIcon={icons.criticalPath}
          onClick={handleCriticalPathToggle}
        >
          Kritiek pad
        </Button>
      </div>

      {/* Spacer */}
      <div className="toolbar-spacer" />

      {/* Export menu */}
      {!readOnly && onExport && (
        <div className="toolbar-group toolbar-export">
          <Button
            variant="outline"
            size="sm"
            leftIcon={icons.download}
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
          >
            Exporteren
          </Button>

          {exportMenuOpen && (
            <div className="export-menu">
              <button onClick={() => handleExport('pdf')}>PDF</button>
              <button onClick={() => handleExport('excel')}>Excel</button>
              <button onClick={() => handleExport('png')}>Afbeelding (PNG)</button>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .gantt-toolbar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--color-surface, #ffffff);
          border-bottom: 1px solid var(--color-border, #e9ecef);
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0 0.5rem;
          border-right: 1px solid var(--color-border, #e9ecef);
        }

        .toolbar-group:last-child {
          border-right: none;
        }

        .toolbar-spacer {
          flex: 1;
        }

        .toolbar-select {
          height: 32px;
          padding: 0 0.5rem;
          font-size: 0.8125rem;
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: var(--radius-md, 6px);
          background: var(--color-background, #ffffff);
          color: var(--color-text-primary, #212529);
          cursor: pointer;
        }

        .toolbar-select:focus {
          outline: 2px solid var(--color-primary, #0d6efd);
          outline-offset: 2px;
        }

        .toolbar-export {
          position: relative;
        }

        .export-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.25rem;
          background: var(--color-surface-elevated, #ffffff);
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: var(--radius-md, 6px);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          z-index: var(--z-dropdown, 1000);
        }

        .export-menu button {
          display: block;
          width: 100%;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          text-align: left;
          background: transparent;
          border: none;
          cursor: pointer;
          white-space: nowrap;
        }

        .export-menu button:hover {
          background: var(--color-gray-100, #f1f3f5);
        }

        :global(.dark) .toolbar-select {
          background: var(--color-surface, #252542);
          border-color: var(--color-border, #3d3d5c);
          color: var(--color-text-primary, #f8f9fa);
        }

        :global(.dark) .export-menu {
          background: var(--color-surface-elevated, #2d2d4a);
          border-color: var(--color-border, #3d3d5c);
        }

        :global(.dark) .export-menu button:hover {
          background: var(--color-surface, #252542);
        }
      `}} />
    </div>
  )
}
