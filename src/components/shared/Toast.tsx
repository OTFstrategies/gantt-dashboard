'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

// =============================================================================
// Types
// =============================================================================

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (type: ToastType, message: string, duration?: number) => void
  removeToast: (id: string) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

interface ToastProviderProps {
  children: React.ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxToasts?: number
}

// =============================================================================
// Context
// =============================================================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

// =============================================================================
// Provider
// =============================================================================

export function ToastProvider({
  children,
  position = 'bottom-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 5000) => {
      const id = crypto.randomUUID()
      const toast: Toast = { id, type, message, duration }

      setToasts(prev => {
        const newToasts = [...prev, toast]
        // Keep only the last maxToasts
        return newToasts.slice(-maxToasts)
      })

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }
    },
    [maxToasts, removeToast]
  )

  const success = useCallback(
    (message: string, duration?: number) => addToast('success', message, duration),
    [addToast]
  )

  const error = useCallback(
    (message: string, duration?: number) => addToast('error', message, duration),
    [addToast]
  )

  const warning = useCallback(
    (message: string, duration?: number) => addToast('warning', message, duration),
    [addToast]
  )

  const info = useCallback(
    (message: string, duration?: number) => addToast('info', message, duration),
    [addToast]
  )

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 16, right: 16 },
    'top-left': { top: 16, left: 16 },
    'bottom-right': { bottom: 16, right: 16 },
    'bottom-left': { bottom: 16, left: 16 },
  }

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <div className="toast-container" style={positionStyles[position]}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
        <style dangerouslySetInnerHTML={{__html: `
          .toast-container {
            position: fixed;
            z-index: var(--z-toast, 1080);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            max-width: 400px;
            pointer-events: none;
          }
        `}} />
      </div>
    </ToastContext.Provider>
  )
}

// =============================================================================
// Toast Item
// =============================================================================

interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }, [onClose])

  const icons: Record<ToastType, React.ReactNode> = {
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  }

  const colors: Record<ToastType, string> = {
    success: 'var(--color-success, #198754)',
    error: 'var(--color-error, #dc3545)',
    warning: 'var(--color-warning, #ffc107)',
    info: 'var(--color-info, #0dcaf0)',
  }

  return (
    <div
      className={`toast-item toast-${toast.type} ${isExiting ? 'toast-exit' : ''}`}
      role="alert"
    >
      <span className="toast-icon" style={{ color: colors[toast.type] }}>
        {icons[toast.type]}
      </span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={handleClose} aria-label="Sluiten">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <style dangerouslySetInnerHTML={{__html: `
        .toast-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--color-surface-elevated, #ffffff);
          border-radius: var(--radius-lg, 8px);
          box-shadow: var(--shadow-lg);
          border-left: 4px solid ${colors[toast.type]};
          pointer-events: auto;
          animation: slideIn 0.2s ease-out;
        }
        .toast-exit {
          animation: slideOut 0.2s ease-in forwards;
        }
        .toast-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }
        .toast-icon svg {
          width: 100%;
          height: 100%;
        }
        .toast-message {
          flex: 1;
          font-size: 0.875rem;
          color: var(--color-text-primary, #212529);
          line-height: 1.5;
        }
        .toast-close {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          padding: 0;
          border: none;
          background: transparent;
          color: var(--color-text-tertiary, #adb5bd);
          cursor: pointer;
          transition: color 0.15s;
        }
        .toast-close:hover {
          color: var(--color-text-secondary, #6c757d);
        }
        .toast-close svg {
          width: 100%;
          height: 100%;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        :global(.dark) .toast-item {
          background: var(--color-surface-elevated, #2d2d4a);
        }
      `}} />
    </div>
  )
}

// =============================================================================
// Hook
// =============================================================================

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export { ToastContext }
