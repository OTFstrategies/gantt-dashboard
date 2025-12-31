'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ProjectProvider, useProject } from '@/providers'

/**
 * Project Detail Page
 * Shows project overview with navigation to different views
 */
function ProjectContent() {
  const { projectId, projectData, syncState } = useProject()

  if (syncState.isLoading) {
    return (
      <div className="project-loading">
        <p>Project laden...</p>
      </div>
    )
  }

  if (syncState.error) {
    return (
      <div className="project-error">
        <p>Fout: {syncState.error}</p>
      </div>
    )
  }

  const taskCount = projectData?.tasks.length ?? 0
  const resourceCount = projectData?.resources.length ?? 0

  return (
    <div className="project-detail">
      <header className="project-header">
        <h1>Project: {projectId}</h1>
        <p className="project-stats">
          {taskCount} taken • {resourceCount} resources
        </p>
      </header>

      <nav className="project-views">
        <h2>Views</h2>
        <div className="view-grid">
          <Link href={`/projects/${projectId}/taskboard`} className="view-card">
            <div className="view-icon">📋</div>
            <h3>TaskBoard</h3>
            <p>Kanban bord voor taakbeheer</p>
          </Link>

          <Link href={`/projects/${projectId}/gantt`} className="view-card">
            <div className="view-icon">📊</div>
            <h3>Gantt</h3>
            <p>Timeline weergave met drag & drop</p>
          </Link>

          <Link href={`/projects/${projectId}/calendar`} className="view-card">
            <div className="view-icon">📅</div>
            <h3>Calendar</h3>
            <p>Kalender weergave met drag & drop</p>
          </Link>

          <Link href={`/projects/${projectId}/grid`} className="view-card">
            <div className="view-icon">📑</div>
            <h3>Grid</h3>
            <p>Tabel weergave met sorteren en filteren</p>
          </Link>
        </div>
      </nav>

      <style dangerouslySetInnerHTML={{__html: `
        .project-detail {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .project-header {
          margin-bottom: 2rem;
        }

        .project-header h1 {
          margin: 0 0 0.5rem;
          font-size: 1.75rem;
        }

        .project-stats {
          color: var(--color-text-secondary, #6c757d);
          margin: 0;
        }

        .project-views h2 {
          font-size: 1.25rem;
          margin: 0 0 1rem;
        }

        .view-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .view-card {
          display: block;
          padding: 1.5rem;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e9ecef);
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .view-card:hover:not(.disabled) {
          border-color: var(--color-primary, #0d6efd);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .view-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .view-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .view-card h3 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
        }

        .view-card p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6c757d);
        }

        .project-loading,
        .project-error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: var(--color-text-secondary, #6c757d);
        }

        .project-error {
          color: var(--color-error, #dc3545);
        }
      `}} />
    </div>
  )
}

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <ProjectProvider>
      <ProjectWrapper projectId={projectId} />
    </ProjectProvider>
  )
}

function ProjectWrapper({ projectId }: { projectId: string }) {
  const { setProjectId } = useProject()

  // Set project ID on mount
  if (projectId) {
    setProjectId(projectId)
  }

  return <ProjectContent />
}
