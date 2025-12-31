'use client'

import React, { useState } from 'react'
import { Button } from '@/components/shared'
import { useAuth } from './AuthGuard'

// =============================================================================
// Types
// =============================================================================

interface LoginFormProps {
  onSuccess?: () => void
  className?: string
}

// =============================================================================
// Login Form Component
// =============================================================================

export function LoginForm({ onSuccess, className = '' }: LoginFormProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await signIn(email, password)
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Inloggen mislukt'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={`login-form ${className}`} onSubmit={handleSubmit}>
      <div className="form-header">
        <h1>Inloggen</h1>
        <p>Welkom terug! Log in om door te gaan.</p>
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">E-mailadres</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="naam@bedrijf.nl"
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Wachtwoord</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
      >
        Inloggen
      </Button>

      <div className="form-footer">
        <a href="/forgot-password">Wachtwoord vergeten?</a>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .login-form {
          width: 100%;
          max-width: 400px;
          padding: 2rem;
          background: var(--color-surface, #ffffff);
          border-radius: var(--radius-xl, 12px);
          box-shadow: var(--shadow-lg);
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-header h1 {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-text-primary, #212529);
        }

        .form-header p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6c757d);
        }

        .form-error {
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          background: var(--color-status-rejected-bg, #f8d7da);
          color: var(--color-error, #dc3545);
          border-radius: var(--radius-md, 6px);
          font-size: 0.875rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary, #212529);
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: var(--radius-md, 6px);
          transition:
            border-color var(--transition-fast),
            box-shadow var(--transition-fast);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--color-primary, #0d6efd);
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
        }

        .form-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-group input::placeholder {
          color: var(--color-text-tertiary, #adb5bd);
        }

        .form-footer {
          margin-top: 1.5rem;
          text-align: center;
        }

        .form-footer a {
          font-size: 0.8125rem;
          color: var(--color-primary, #0d6efd);
          text-decoration: none;
        }

        .form-footer a:hover {
          text-decoration: underline;
        }

        :global(.dark) .form-group input {
          background: var(--color-surface-elevated, #2d2d4a);
          border-color: var(--color-border, #3d3d5c);
          color: var(--color-text-primary, #f8f9fa);
        }
      `}} />
    </form>
  )
}
