'use client'

import { useParams } from 'next/navigation'
import { ProjectProvider, useProject } from '@/providers'
import { GanttChart } from '@/components/gantt'
import { ViewToolbar } from '@/components/toolbar'
import { GanttSkeleton, ErrorBoundary } from '@/components/shared'

/**
 * Gantt View Page
 * Timeline visualization with task bars and dependencies
 */
function GanttContent() {
  const { projectId, projectData, syncState, updateTask } = useProject()

  if (syncState.isLoading) {
    return (
      <div className="gantt-page">
        <ViewToolbar
          projectId={projectId}
          title="Gantt Chart"
          subtitle="Laden..."
          defaultExportScope="tasks"
        />
        <main className="gantt-content">
          <GanttSkeleton />
        </main>
        <style dangerouslySetInnerHTML={{__html: pageStyles}} />
      </div>
    )
  }

  if (syncState.error) {
    return (
      <div className="gantt-error">
        <p>Fout: {syncState.error}</p>
        <style dangerouslySetInnerHTML={{__html: pageStyles}} />
      </div>
    )
  }

  const tasks = projectData?.tasks ?? []
  const dependencies = projectData?.dependencies ?? []

  return (
    <div className="gantt-page">
      <ViewToolbar
        projectId={projectId}
        title="Gantt Chart"
        subtitle={`${tasks.length} taken`}
        defaultExportScope="tasks"
      />

      <main className="gantt-content">
        <ErrorBoundary fallback={<div className="gantt-error">Er ging iets mis met de Gantt chart.</div>}>
          <GanttChart
            tasks={tasks}
            dependencies={dependencies}
            onTaskUpdate={(taskId, updates) => updateTask(taskId, updates)}
          />
        </ErrorBoundary>
      </main>

      <style dangerouslySetInnerHTML={{__html: pageStyles}} />
    </div>
  )
}

const pageStyles = `
  .gantt-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .gantt-content {
    flex: 1;
    overflow: hidden;
    padding: 1rem;
  }

  .gantt-error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: var(--color-error, #dc3545);
  }
`

export default function GanttPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <ProjectProvider>
      <GanttWrapper projectId={projectId} />
    </ProjectProvider>
  )
}

function GanttWrapper({ projectId }: { projectId: string }) {
  const { setProjectId } = useProject()

  if (projectId) {
    setProjectId(projectId)
  }

  return <GanttContent />
}
