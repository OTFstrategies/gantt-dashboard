'use client'

import { useParams } from 'next/navigation'
import { ProjectProvider, useProject } from '@/providers'
import { TaskGrid } from '@/components/grid'
import { ViewToolbar } from '@/components/toolbar'
import { GridSkeleton, ErrorBoundary } from '@/components/shared'

/**
 * Grid View Page
 * Tabular task view with sorting, filtering, and inline editing
 */
function GridContent() {
  const { projectId, projectData, syncState, updateTask } = useProject()

  if (syncState.isLoading) {
    return (
      <div className="grid-page">
        <ViewToolbar
          projectId={projectId}
          title="Task Grid"
          subtitle="Laden..."
          defaultExportScope="tasks"
        />
        <main className="grid-content">
          <GridSkeleton />
        </main>
        <style dangerouslySetInnerHTML={{__html: pageStyles}} />
      </div>
    )
  }

  if (syncState.error) {
    return (
      <div className="grid-error">
        <p>Fout: {syncState.error}</p>
        <style dangerouslySetInnerHTML={{__html: pageStyles}} />
      </div>
    )
  }

  const tasks = projectData?.tasks ?? []
  const resources = projectData?.resources ?? []

  return (
    <div className="grid-page">
      <ViewToolbar
        projectId={projectId}
        title="Task Grid"
        subtitle={`${tasks.length} taken`}
        defaultExportScope="tasks"
      />

      <main className="grid-content">
        <ErrorBoundary fallback={<div className="grid-error">Er ging iets mis met de Task Grid.</div>}>
          <TaskGrid
            tasks={tasks}
            resources={resources}
            onTaskUpdate={(taskId, updates) => updateTask(taskId, updates)}
          />
        </ErrorBoundary>
      </main>

      <style dangerouslySetInnerHTML={{__html: pageStyles}} />
    </div>
  )
}

const pageStyles = `
  .grid-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .grid-content {
    flex: 1;
    overflow: auto;
    padding: 1rem;
  }

  .grid-error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: var(--color-error, #dc3545);
  }
`

export default function GridPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <ProjectProvider>
      <GridWrapper projectId={projectId} />
    </ProjectProvider>
  )
}

function GridWrapper({ projectId }: { projectId: string }) {
  const { setProjectId } = useProject()

  if (projectId) {
    setProjectId(projectId)
  }

  return <GridContent />
}
