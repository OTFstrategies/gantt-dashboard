'use client'

import { useParams } from 'next/navigation'
import { ProjectProvider, useProject } from '@/providers'
import { CalendarView } from '@/components/calendar'
import { ViewToolbar } from '@/components/toolbar'
import { CalendarSkeleton, ErrorBoundary } from '@/components/shared'

/**
 * Calendar View Page
 * Task visualization in calendar format with drag & drop rescheduling
 */
function CalendarContent() {
  const { projectId, projectData, syncState } = useProject()

  if (syncState.isLoading) {
    return (
      <div className="calendar-page">
        <ViewToolbar
          projectId={projectId}
          title="Kalender"
          subtitle="Laden..."
          defaultExportScope="tasks"
        />
        <main className="calendar-content">
          <CalendarSkeleton />
        </main>
        <style dangerouslySetInnerHTML={{__html: pageStyles}} />
      </div>
    )
  }

  if (syncState.error) {
    return (
      <div className="calendar-error">
        <p>Fout: {syncState.error}</p>
        <style dangerouslySetInnerHTML={{__html: pageStyles}} />
      </div>
    )
  }

  const tasks = projectData?.tasks ?? []
  const taskCount = tasks.filter(t => t.start_date && !t.inactive).length

  return (
    <div className="calendar-page">
      <ViewToolbar
        projectId={projectId}
        title="Kalender"
        subtitle={`${taskCount} taken gepland`}
        defaultExportScope="tasks"
      />

      <main className="calendar-content">
        <ErrorBoundary fallback={<div className="calendar-error">Er ging iets mis met de Kalender.</div>}>
          <CalendarView
            onEventClick={(taskId) => {
              console.log('Task clicked:', taskId)
            }}
          />
        </ErrorBoundary>
      </main>

      <style jsx>{pageStyles}</style>
    </div>
  )
}

const pageStyles = `
  .calendar-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .calendar-content {
    flex: 1;
    overflow: hidden;
    padding: 1rem;
  }

  .calendar-error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: var(--color-error, #dc3545);
  }
`

export default function CalendarPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <ProjectProvider>
      <CalendarWrapper projectId={projectId} />
    </ProjectProvider>
  )
}

function CalendarWrapper({ projectId }: { projectId: string }) {
  const { setProjectId } = useProject()

  if (projectId) {
    setProjectId(projectId)
  }

  return <CalendarContent />
}
