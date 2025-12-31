/**
 * D1 Foundation Module - API Type Definitions
 * Request/Response types for all API endpoints
 */

import type { Workspace, Project, Task, Resource, VaultItem, WorkspaceRole } from './entities'

// =============================================================================
// Generic API Types
// =============================================================================

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// =============================================================================
// Workspace API
// =============================================================================

export interface CreateWorkspaceRequest {
  name: string
  type?: 'afdeling' | 'klant'
  description?: string
}

export interface UpdateWorkspaceRequest {
  name?: string
  description?: string
  settings?: Record<string, unknown>
}

export interface InviteMemberRequest {
  email: string
  role: WorkspaceRole
}

export interface WorkspaceResponse {
  workspace: Workspace
}

export interface WorkspaceListResponse {
  workspaces: Workspace[]
}

// =============================================================================
// Project API
// =============================================================================

export interface CreateProjectRequest {
  workspaceId: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  status?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: string
  startDate?: string
  endDate?: string
  settings?: Record<string, unknown>
}

export interface ProjectResponse {
  project: Project
}

export interface ProjectListResponse {
  projects: Project[]
}

// =============================================================================
// Task API
// =============================================================================

export interface CreateTaskRequest {
  projectId: string
  parentId?: string
  name: string
  startDate?: string
  endDate?: string
  duration?: number
  durationUnit?: string
  percentDone?: number
  effort?: number
  effortUnit?: string
  note?: string
  constraintType?: string
  constraintDate?: string
  schedulingMode?: string
  manuallyScheduled?: boolean
}

export interface UpdateTaskRequest {
  name?: string
  startDate?: string
  endDate?: string
  duration?: number
  percentDone?: number
  note?: string
  constraintType?: string
  constraintDate?: string
}

export interface BulkTaskRequest {
  operations: {
    create?: CreateTaskRequest[]
    update?: (UpdateTaskRequest & { id: string })[]
    delete?: string[]
  }
}

export interface TaskResponse {
  task: Task
}

export interface TaskListResponse {
  tasks: Task[]
}

export interface BulkTaskResponse {
  created: Task[]
  updated: Task[]
  deleted: string[]
}

// =============================================================================
// Resource API
// =============================================================================

export interface CreateResourceRequest {
  projectId: string
  name: string
  type?: 'human' | 'material' | 'equipment'
  calendarId?: string
  image?: string
  capacity?: number
  costPerHour?: number
}

export interface ResourceResponse {
  resource: Resource
}

export interface ResourceListResponse {
  resources: Resource[]
}

// =============================================================================
// Vault API
// =============================================================================

export interface VaultListResponse {
  items: VaultItem[]
  stats: VaultStats
}

export interface VaultStats {
  total: number
  input: number
  processing: number
  done: number
  expiringSoon: number
}

export interface ProcessVaultRequest {
  action: 'start_processing' | 'complete' | 'reject'
  processingNotes?: string
  rejectionReason?: string
}

export interface VaultItemResponse {
  item: VaultItem
}

// =============================================================================
// Export API
// =============================================================================

export interface ExportRequest {
  projectId: string
  options?: ExportOptions
}

export interface ExportOptions {
  // PDF options
  paperFormat?: 'A4' | 'A3' | 'Letter'
  orientation?: 'portrait' | 'landscape'
  range?: 'visible' | 'all' | 'custom'
  customRange?: { start: string; end: string }

  // Excel options
  includeResources?: boolean
  includeDependencies?: boolean

  // Image options
  format?: 'png' | 'svg'
  scale?: number
}

export interface ExportResponse {
  success: boolean
  message: string
  fileUrl?: string
  data?: unknown
}

// =============================================================================
// Health API
// =============================================================================

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    database: 'ok' | 'error'
    auth: 'ok' | 'error'
    api: 'ok' | 'error'
  }
  latency?: {
    database: number
  }
}
