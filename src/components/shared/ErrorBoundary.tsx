'use client'

import React, { Component, ReactNode } from 'react'

// =============================================================================
// Types
// =============================================================================

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetOnChange?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// =============================================================================
// Default Fallback Component
// =============================================================================

function DefaultErrorFallback({
  error,
  onRetry,
}: {
  error: Error
  onRetry: () => void
}) {
  return (
    <div className="error-boundary-fallback">
      <div className="error-boundary-content">
        <div className="error-boundary-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="error-boundary-title">Er is iets misgegaan</h2>
        <p className="error-boundary-message">
          {error.message || 'Er is een onverwachte fout opgetreden.'}
        </p>
        <button onClick={onRetry} className="error-boundary-button">
          Probeer opnieuw
        </button>
        {process.env.NODE_ENV === 'development' && (
          <pre className="error-boundary-stack">{error.stack}</pre>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .error-boundary-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          padding: 2rem;
          background: var(--color-surface, #f8f9fa);
          border-radius: 8px;
          border: 1px solid var(--color-border, #e9ecef);
        }
        .error-boundary-content {
          text-align: center;
          max-width: 400px;
        }
        .error-boundary-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          color: var(--color-error, #dc3545);
        }
        .error-boundary-icon svg {
          width: 100%;
          height: 100%;
        }
        .error-boundary-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary, #212529);
          margin: 0 0 0.5rem;
        }
        .error-boundary-message {
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6c757d);
          margin: 0 0 1rem;
        }
        .error-boundary-button {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
          background: var(--color-primary, #0d6efd);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .error-boundary-button:hover {
          background: var(--color-primary-dark, #0b5ed7);
        }
        .error-boundary-stack {
          margin-top: 1rem;
          padding: 1rem;
          background: #1a1a2e;
          color: #ff6b6b;
          border-radius: 4px;
          font-size: 0.75rem;
          text-align: left;
          overflow: auto;
          max-height: 200px;
        }
      `}} />
    </div>
  )
}

// =============================================================================
// Error Boundary Component
// =============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when resetOnChange values change
    if (
      this.state.hasError &&
      this.props.resetOnChange &&
      prevProps.resetOnChange &&
      JSON.stringify(this.props.resetOnChange) !== JSON.stringify(prevProps.resetOnChange)
    ) {
      this.setState({ hasError: false, error: null })
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

// =============================================================================
// Hook for functional components
// =============================================================================

export function useErrorHandler(): (error: Error) => void {
  return (error: Error) => {
    throw error
  }
}
