export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Gantt Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Project Management Platform - Phase 1 in development
      </p>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Gantt</h2>
          <p className="text-sm text-gray-500">Coming soon</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Calendar</h2>
          <p className="text-sm text-gray-500">Coming soon</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">TaskBoard</h2>
          <p className="text-sm text-gray-500">Coming soon</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Grid</h2>
          <p className="text-sm text-gray-500">Coming soon</p>
        </div>
      </div>
    </main>
  )
}
