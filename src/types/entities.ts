/**
 * D1 Foundation Module - Entity Type Definitions
 * Core business entities for the Gantt Dashboard
 */

// =============================================================================
// Enums
// =============================================================================

export enum WorkspaceRole {
  ADMIN = 'admin',
  VAULT_MEDEWERKER = 'vault_medewerker',
  MEDEWERKER = 'medewerker',
  KLANT_EDITOR = 'klant_editor',
  KLANT_VIEWER = 'klant_viewer',
}

export enum WorkspaceType {
  AFDELING = 'afdeling',
  KLANT = 'klant',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled',
}

export enum VaultStatus {
  INPUT = 'input',
  PROCESSING = 'processing',
  DONE = 'done',
  REJECTED = 'rejected',
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum ResourceType {
  HUMAN = 'human',
  MATERIAL = 'material',
  EQUIPMENT = 'equipment',
}

export enum DependencyType {
  START_TO_START = 0,
  START_TO_FINISH = 1,
  FINISH_TO_START = 2,
  FINISH_TO_FINISH = 3,
}

export enum ConstraintType {
  AS_SOON_AS_POSSIBLE = 'assoonaspossible',
  AS_LATE_AS_POSSIBLE = 'aslateaspossible',
  MUST_START_ON = 'muststarton',
  MUST_FINISH_ON = 'mustfinishon',
  START_NO_EARLIER_THAN = 'startnoearlierthan',
  START_NO_LATER_THAN = 'startnolaterthan',
  FINISH_NO_EARLIER_THAN = 'finishnoearlierthan',
  FINISH_NO_LATER_THAN = 'finishnolaterthan',
}

export enum SchedulingMode {
  NORMAL = 'Normal',
  FIXED_DURATION = 'FixedDuration',
  FIXED_EFFORT = 'FixedEffort',
  FIXED_UNITS = 'FixedUnits',
}

// =============================================================================
// Base Types
// =============================================================================

export interface BaseEntity {
  id: string
  created_at: string
  updated_at?: string
}

// =============================================================================
// User & Profile
// =============================================================================

export interface Profile extends BaseEntity {
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  job_title?: string
  timezone?: string
  locale?: string
  last_login_at?: string
  is_active: boolean
}

// =============================================================================
// Workspace
// =============================================================================

export interface Workspace extends BaseEntity {
  name: string
  type: WorkspaceType
  description?: string
  logo_url?: string
  settings?: Record<string, unknown>
  created_by: string
  is_archived: boolean
  archived_at?: string
}

export interface WorkspaceMember extends BaseEntity {
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  invited_by: string
  joined_at: string
}

export interface WorkspaceInvite extends BaseEntity {
  workspace_id: string
  email: string
  role: WorkspaceRole
  invited_by: string
  status: InviteStatus
  token: string
  expires_at: string
  accepted_at?: string
}

// =============================================================================
// Project
// =============================================================================

export interface Project extends BaseEntity {
  workspace_id: string
  name: string
  description?: string
  status: ProjectStatus
  start_date?: string
  end_date?: string
  calendar_id?: string
  settings?: Record<string, unknown>
  created_by: string
}

// =============================================================================
// Task
// =============================================================================

export interface Task extends BaseEntity {
  project_id: string
  parent_id?: string
  name: string
  start_date?: string
  end_date?: string
  duration?: number
  duration_unit?: string
  percent_done: number
  effort?: number
  effort_unit?: string
  note?: string
  constraint_type: ConstraintType
  constraint_date?: string
  scheduling_mode: SchedulingMode
  manually_scheduled: boolean
  rollup: boolean
  show_in_timeline: boolean
  inactive: boolean
  cls?: string
  icon_cls?: string
  order_index: number
  wbs_code?: string
}

// =============================================================================
// Dependency
// =============================================================================

export interface Dependency extends BaseEntity {
  project_id: string
  from_task: string
  to_task: string
  type: DependencyType
  lag: number
  lag_unit: string
  cls?: string
}

// =============================================================================
// Resource
// =============================================================================

export interface Resource extends BaseEntity {
  project_id: string
  name: string
  type: ResourceType
  calendar_id?: string
  image?: string
  capacity: number
  cost_per_hour?: number
}

// =============================================================================
// Assignment
// =============================================================================

export interface Assignment extends BaseEntity {
  project_id: string
  task_id: string
  resource_id: string
  units: number
}

// =============================================================================
// Calendar
// =============================================================================

export interface Calendar extends BaseEntity {
  project_id: string
  name: string
  is_default: boolean
  intervals?: CalendarInterval[]
}

export interface CalendarInterval {
  name?: string
  start_date?: string
  end_date?: string
  is_working: boolean
  recurrence_rule?: string
}

// =============================================================================
// Baseline
// =============================================================================

export interface Baseline extends BaseEntity {
  project_id: string
  name: string
  created_by: string
  snapshot: Record<string, unknown>
}

// =============================================================================
// Vault
// =============================================================================

export interface VaultItem extends BaseEntity {
  workspace_id: string
  project_id?: string
  source_data: Record<string, unknown>
  status: VaultStatus
  processing_notes?: string
  processed_by?: string
  processed_at?: string
  done_at?: string
  expires_at?: string
  exported_at?: string
}

// =============================================================================
// Export
// =============================================================================

export interface ExportLog extends BaseEntity {
  user_id: string
  project_id: string
  format: 'pdf' | 'excel' | 'csv' | 'image'
  options?: Record<string, unknown>
  file_url?: string
  file_size?: number
}

// =============================================================================
// User Preferences
// =============================================================================

export interface UserPreferences extends BaseEntity {
  user_id: string
  theme: 'light' | 'dark' | 'system'
  locale: string
  default_view: 'gantt' | 'calendar' | 'taskboard' | 'grid'
  sidebar_collapsed: boolean
  recent_workspaces: string[]
  settings?: Record<string, unknown>
}

// =============================================================================
// Activity & Notifications
// =============================================================================

export interface ActivityLog extends BaseEntity {
  user_id?: string
  workspace_id: string
  action: string
  entity_type: string
  entity_id: string
  details?: Record<string, unknown>
}

export interface Notification extends BaseEntity {
  user_id: string
  workspace_id?: string
  type: string
  title: string
  message?: string
  link?: string
  read: boolean
  read_at?: string
}
