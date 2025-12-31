'use client'

import React from 'react'

// =============================================================================
// Types
// =============================================================================

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'bar'
  text?: string
  fullScreen?: boolean
  overlay?: boolean
}

interface LoadingSpinnerProps {
  size: number
}

interface LoadingDotsProps {
  size: number
}

interface LoadingBarProps {
  size: number
}

// =============================================================================
// Size mappings
// =============================================================================

const sizeMap = {
  sm: 16,
  md: 32,
  lg: 48,
}

// =============================================================================
// Spinner Variant
// =============================================================================

function LoadingSpinner({ size }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="loading-spinner-track"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="60 200"
          className="loading-spinner-indicator"
        />
      </svg>
      <style dangerouslySetInnerHTML={{__html: `
        .loading-spinner {
          display: inline-block;
          color: var(--color-primary, #0d6efd);
        }
        .loading-spinner svg {
          width: 100%;
          height: 100%;
          animation: spin 1s linear infinite;
        }
        .loading-spinner-track {
          opacity: 0.2;
        }
        .loading-spinner-indicator {
          opacity: 1;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}} />
    </div>
  )
}

// =============================================================================
// Dots Variant
// =============================================================================

function LoadingDots({ size }: LoadingDotsProps) {
  const dotSize = Math.max(6, size / 4)
  const gap = Math.max(4, size / 8)

  return (
    <div
      className="loading-dots"
      style={{ gap, height: dotSize }}
    >
      <span style={{ width: dotSize, height: dotSize }} />
      <span style={{ width: dotSize, height: dotSize }} />
      <span style={{ width: dotSize, height: dotSize }} />
      <style dangerouslySetInnerHTML={{__html: `
        .loading-dots {
          display: flex;
          align-items: center;
        }
        .loading-dots span {
          background: var(--color-primary, #0d6efd);
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite;
        }
        .loading-dots span:nth-child(1) {
          animation-delay: 0s;
        }
        .loading-dots span:nth-child(2) {
          animation-delay: 0.16s;
        }
        .loading-dots span:nth-child(3) {
          animation-delay: 0.32s;
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}} />
    </div>
  )
}

// =============================================================================
// Bar Variant
// =============================================================================

function LoadingBar({ size }: LoadingBarProps) {
  const height = Math.max(4, size / 8)

  return (
    <div className="loading-bar" style={{ height, width: size * 3 }}>
      <div className="loading-bar-indicator" />
      <style dangerouslySetInnerHTML={{__html: `
        .loading-bar {
          background: var(--color-border, #e9ecef);
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
        }
        .loading-bar-indicator {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 40%;
          background: var(--color-primary, #0d6efd);
          border-radius: 9999px;
          animation: slide 1.5s ease-in-out infinite;
        }
        @keyframes slide {
          0% {
            left: -40%;
          }
          100% {
            left: 100%;
          }
        }
      `}} />
    </div>
  )
}

// =============================================================================
// Main Loading Component
// =============================================================================

export function Loading({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  overlay = false,
}: LoadingProps) {
  const pixelSize = sizeMap[size]

  const indicator = {
    spinner: <LoadingSpinner size={pixelSize} />,
    dots: <LoadingDots size={pixelSize} />,
    bar: <LoadingBar size={pixelSize} />,
  }[variant]

  const content = (
    <div className="loading-content">
      {indicator}
      {text && <p className="loading-text">{text}</p>}
      <style dangerouslySetInnerHTML={{__html: `
        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .loading-text {
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6c757d);
          margin: 0;
        }
      `}} />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        {content}
        <style dangerouslySetInnerHTML={{__html: `
          .loading-fullscreen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-background, #ffffff);
            z-index: 9999;
          }
        `}} />
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
        <style dangerouslySetInnerHTML={{__html: `
          .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(2px);
            z-index: 100;
          }
          :global(.dark) .loading-overlay {
            background: rgba(26, 26, 46, 0.8);
          }
        `}} />
      </div>
    )
  }

  return content
}

// =============================================================================
// Skeleton Loading Component
// =============================================================================

interface SkeletonProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
  className?: string
}

export function Skeleton({
  width = '100%',
  height = '1em',
  variant = 'text',
  animation = 'pulse',
  className = '',
}: SkeletonProps) {
  const borderRadius = {
    text: '4px',
    circular: '50%',
    rectangular: '0',
  }[variant]

  return (
    <div
      className={`skeleton skeleton-${animation} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .skeleton {
          background: var(--color-skeleton, #e9ecef);
          display: inline-block;
        }
        .skeleton-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        .skeleton-wave {
          position: relative;
          overflow: hidden;
        }
        .skeleton-wave::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: wave 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        @keyframes wave {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        :global(.dark) .skeleton {
          background: var(--color-skeleton-dark, #2d2d44);
        }
      `}} />
    </div>
  )
}
