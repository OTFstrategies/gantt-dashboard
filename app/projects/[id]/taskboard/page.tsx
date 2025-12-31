'use client'

import { useParams } from 'next/navigation'
import { ProjectProvider, useProject } from '@/providers'
import { TaskBoard } from '@/components/taskboard'
import { ViewToolbar } from '@/components/toolbar'
import { TaskBoardSkeleton, ErrorBoundary } from '@/components/shared'

/**
 * TaskBoard Page
 * Kanban-style task management view
 */
function TaskBoardContent() {
  const { projectId, projectData, syncState, updateTask } = useProject()

  if (syncState.isLoading) {
    return (
      <div className="taskboard-page">
        <ViewToolbar
          projectId={projectId}
          title="TaskBoard"
          subtitle="Laden..."
          defaultExportScope="tasks"
        />
        <main className="taskboard-content">
          <TaskBoardSkeleton />
        </main>
        <style jsx>{pageStyles}</style>
      </div>
    )
  }

  if (syncState.error) {
    return (
      <div className="taskboard-error">
        <p>Fout: {syncState.error}</p>
        <style jsx>{pageStyles}</style>
      </div>
    )
  }

  const tasks = projectData?.tasks ?? []

  return (
    <div className="taskboard-page">
      <ViewToolbar
        projectId={projectId}
        title="TaskBoard"
        subtitle={`${tasks.length} taken`}
        defaultExportScope="tasks"
      />

      <main className="taskboard-content">
        <ErrorBoundary fallback={<div className="taskboard-error">Er ging iets mis met het TaskBoard.</div>}>
          <TaskBoard
            tasks={tasks}
            onTaskUpdate={(taskId, updates) => updateTask(taskId, updates)}
          />
        </ErrorBoundary>
      </main>

      <style jsx>{pageStyles}</style>
    </div>
  )
}

const pageStyles = `
  .taskboard-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .taskboard-content {
    flex: 1;
    overflow: hidden;
  }

  .taskboard-error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: var(--color-error, #dc3545);
  }
`

export default function TaskBoardPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <ProjectProvider>
      <TaskBoardWrapper projectId={projectId} />
    </ProjectProvider>
  )
}

function TaskBoardWrapper({ projectId }: { projectId: string }) {
  const { setProjectId } = useProject()

  if (projectId) {
    setProjectId(projectId)
  }

  return <TaskBoardContent />
}
