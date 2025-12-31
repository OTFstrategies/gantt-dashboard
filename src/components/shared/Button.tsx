'use client'

import React, { forwardRef, ButtonHTMLAttributes } from 'react'
import { Loading } from './Loading'

// =============================================================================
// Types
// =============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

// =============================================================================
// Button Component
// =============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <span className="btn-loading">
            <Loading size="sm" variant="spinner" />
          </span>
        ) : (
          <>
            {leftIcon && <span className="btn-icon btn-icon-left">{leftIcon}</span>}
            <span className="btn-content">{children}</span>
            {rightIcon && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
          </>
        )}
        <style jsx>{`
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-family: inherit;
            font-weight: 500;
            line-height: 1;
            text-decoration: none;
            border: 1px solid transparent;
            border-radius: var(--radius-md, 6px);
            cursor: pointer;
            transition:
              background-color var(--transition-fast),
              border-color var(--transition-fast),
              color var(--transition-fast),
              box-shadow var(--transition-fast);
            white-space: nowrap;
          }

          .btn:disabled {
            cursor: not-allowed;
            opacity: 0.6;
          }

          .btn:focus-visible {
            outline: 2px solid var(--color-primary, #0d6efd);
            outline-offset: 2px;
          }

          /* Sizes */
          .btn-sm {
            height: 32px;
            padding: 0 0.75rem;
            font-size: 0.8125rem;
          }

          .btn-md {
            height: 40px;
            padding: 0 1rem;
            font-size: 0.875rem;
          }

          .btn-lg {
            height: 48px;
            padding: 0 1.5rem;
            font-size: 1rem;
          }

          /* Full width */
          .btn-full {
            width: 100%;
          }

          /* Variants */
          .btn-primary {
            background-color: var(--color-primary, #0d6efd);
            color: var(--color-primary-contrast, #ffffff);
          }

          .btn-primary:hover:not(:disabled) {
            background-color: var(--color-primary-dark, #0b5ed7);
          }

          .btn-secondary {
            background-color: var(--color-secondary, #6c757d);
            color: var(--color-secondary-contrast, #ffffff);
          }

          .btn-secondary:hover:not(:disabled) {
            background-color: var(--color-secondary-dark, #5a6268);
          }

          .btn-outline {
            background-color: transparent;
            border-color: var(--color-border-strong, #dee2e6);
            color: var(--color-text-primary, #212529);
          }

          .btn-outline:hover:not(:disabled) {
            background-color: var(--color-gray-100, #f1f3f5);
            border-color: var(--color-gray-400, #ced4da);
          }

          .btn-ghost {
            background-color: transparent;
            color: var(--color-text-primary, #212529);
          }

          .btn-ghost:hover:not(:disabled) {
            background-color: var(--color-gray-100, #f1f3f5);
          }

          .btn-danger {
            background-color: var(--color-error, #dc3545);
            color: #ffffff;
          }

          .btn-danger:hover:not(:disabled) {
            background-color: var(--color-error-dark, #b02a37);
          }

          /* Icons */
          .btn-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .btn-icon-left {
            margin-right: -0.25rem;
          }

          .btn-icon-right {
            margin-left: -0.25rem;
          }

          .btn-sm .btn-icon {
            width: 14px;
            height: 14px;
          }

          .btn-md .btn-icon {
            width: 16px;
            height: 16px;
          }

          .btn-lg .btn-icon {
            width: 20px;
            height: 20px;
          }

          .btn-loading {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* Dark mode */
          :global(.dark) .btn-outline {
            border-color: var(--color-border, #3d3d5c);
            color: var(--color-text-primary, #f8f9fa);
          }

          :global(.dark) .btn-outline:hover:not(:disabled) {
            background-color: var(--color-surface, #252542);
            border-color: var(--color-border-strong, #4d4d6a);
          }

          :global(.dark) .btn-ghost {
            color: var(--color-text-primary, #f8f9fa);
          }

          :global(.dark) .btn-ghost:hover:not(:disabled) {
            background-color: var(--color-surface, #252542);
          }
        `}</style>
      </button>
    )
  }
)

Button.displayName = 'Button'

// =============================================================================
// Icon Button
// =============================================================================

interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className = '', ...props }, ref) => {
    const sizeMap = {
      sm: 32,
      md: 40,
      lg: 48,
    }

    return (
      <button
        ref={ref}
        className={`icon-btn icon-btn-${size} ${className}`}
        {...props}
      >
        <span className="icon-btn-icon">{icon}</span>
        <style jsx>{`
          .icon-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: none;
            border-radius: var(--radius-md, 6px);
            background-color: transparent;
            color: var(--color-text-secondary, #6c757d);
            cursor: pointer;
            transition:
              background-color var(--transition-fast),
              color var(--transition-fast);
          }

          .icon-btn:hover:not(:disabled) {
            background-color: var(--color-gray-100, #f1f3f5);
            color: var(--color-text-primary, #212529);
          }

          .icon-btn:disabled {
            cursor: not-allowed;
            opacity: 0.6;
          }

          .icon-btn:focus-visible {
            outline: 2px solid var(--color-primary, #0d6efd);
            outline-offset: 2px;
          }

          .icon-btn-sm {
            width: ${sizeMap.sm}px;
            height: ${sizeMap.sm}px;
          }

          .icon-btn-md {
            width: ${sizeMap.md}px;
            height: ${sizeMap.md}px;
          }

          .icon-btn-lg {
            width: ${sizeMap.lg}px;
            height: ${sizeMap.lg}px;
          }

          .icon-btn-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60%;
            height: 60%;
          }

          :global(.dark) .icon-btn {
            color: var(--color-text-secondary, #adb5bd);
          }

          :global(.dark) .icon-btn:hover:not(:disabled) {
            background-color: var(--color-surface, #252542);
            color: var(--color-text-primary, #f8f9fa);
          }
        `}</style>
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
