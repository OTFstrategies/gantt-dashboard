# CONTRACTS.md - TypeScript Interfaces & API Contracts

> **Versie:** 1.0.0
> **Datum:** 2024-12-30
> **Deliverable:** D16
> **Status:** Complete

---

## Inhoudsopgave

1. [Overzicht](#1-overzicht)
2. [Entity Interfaces](#2-entity-interfaces)
3. [API Contracts](#3-api-contracts)
4. [CrudManager Contracts](#4-crudmanager-contracts)
5. [Event Payloads](#5-event-payloads)
6. [Validation Schemas (Zod)](#6-validation-schemas-zod)
7. [Error Codes & Messages](#7-error-codes--messages)

---

## 1. Overzicht

Dit document bevat alle TypeScript type definities voor het Gantt Dashboard platform. De types zijn georganiseerd in logische categorien en zijn direct copy-paste ready voor implementatie.

### 1.1 Type Structuur

```
types/
├── entities/
│   ├── workspace.ts
│   ├── project.ts
│   ├── task.ts
│   ├── dependency.ts
│   ├── resource.ts
│   ├── assignment.ts
│   ├── vault.ts
│   └── profile.ts
├── api/
│   ├── responses.ts
│   ├── requests.ts
│   └── crud-manager.ts
├── events/
│   ├── bryntum-events.ts
│   └── app-events.ts
├── validation/
│   └── schemas.ts
└── errors/
    └── codes.ts
```

---

## 2. Entity Interfaces

### 2.1 Enums & Constants

```typescript
// types/enums.ts

/**
 * Platform rollen (5 niveau's)
 */
export enum WorkspaceRole {
  ADMIN = 'admin',
  VAULT_MEDEWERKER = 'vault_medewerker',
  MEDEWERKER = 'medewerker',
  KLANT_EDITOR = 'klant_editor',
  KLANT_VIEWER = 'klant_viewer'
}

/**
 * Rol niveau (lager = meer rechten)
 */
export const ROLE_LEVELS: Record<WorkspaceRole, number> = {
  [WorkspaceRole.ADMIN]: 1,
  [WorkspaceRole.VAULT_MEDEWERKER]: 2,
  [WorkspaceRole.MEDEWERKER]: 3,
  [WorkspaceRole.KLANT_EDITOR]: 4,
  [WorkspaceRole.KLANT_VIEWER]: 5
};

/**
 * Project status
 */
export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled'
}

/**
 * Task scheduling mode
 */
export enum SchedulingMode {
  NORMAL = 'Normal',
  FIXED_DURATION = 'FixedDuration',
  FIXED_EFFORT = 'FixedEffort',
  FIXED_UNITS = 'FixedUnits'
}

/**
 * Task constraint types
 */
export enum ConstraintType {
  MUST_START_ON = 'muststarton',
  MUST_FINISH_ON = 'mustfinishon',
  START_NO_EARLIER_THAN = 'startnoearlierthan',
  START_NO_LATER_THAN = 'startnolaterthan',
  FINISH_NO_EARLIER_THAN = 'finishnoearlierthan',
  FINISH_NO_LATER_THAN = 'finishnolaterthan',
  AS_SOON_AS_POSSIBLE = 'assoonaspossible',
  AS_LATE_AS_POSSIBLE = 'aslateaspossible'
}

/**
 * Dependency types (Bryntum standard)
 */
export enum DependencyType {
  START_TO_START = 0,  // SS
  END_TO_START = 1,    // FS (default)
  END_TO_END = 2,      // FF
  START_TO_END = 3     // SF
}

/**
 * Dependency type labels
 */
export const DEPENDENCY_TYPE_LABELS: Record<DependencyType, string> = {
  [DependencyType.START_TO_START]: 'SS',
  [DependencyType.END_TO_START]: 'FS',
  [DependencyType.END_TO_END]: 'FF',
  [DependencyType.START_TO_END]: 'SF'
};

/**
 * Duration units
 */
export type DurationUnit =
  | 'millisecond' | 'ms'
  | 'second' | 's'
  | 'minute' | 'mi' | 'm'
  | 'hour' | 'h'
  | 'day' | 'd'
  | 'week' | 'w'
  | 'month' | 'mo' | 'M'
  | 'quarter' | 'q'
  | 'year' | 'y';

/**
 * Scheduling direction
 */
export type SchedulingDirection = 'Forward' | 'Backward';

/**
 * Vault item status
 */
export enum VaultStatus {
  INPUT = 'input',
  PROCESSING = 'processing',
  DONE = 'done',
  REJECTED = 'rejected'
}

/**
 * Export format types
 */
export enum ExportFormat {
  PDF = 'pdf',
  PNG = 'png',
  EXCEL = 'excel',
  MSP = 'msp',
  JSON = 'json',
  CSV = 'csv'
}

/**
 * Audit action types
 */
export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
  EXPORT = 'export',
  SYNC = 'sync'
}
```

### 2.2 Base Types

```typescript
// types/base.ts

/**
 * UUID type alias
 */
export type UUID = string;

/**
 * ISO 8601 date string
 */
export type ISODateString = string;

/**
 * Timestamp with timezone
 */
export type Timestamp = string;

/**
 * JSON value type
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Base entity interface
 */
export interface IBaseEntity {
  id: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Soft deletable entity
 */
export interface ISoftDeletable {
  deleted_at: Timestamp | null;
  is_deleted: boolean;
}

/**
 * Auditable entity
 */
export interface IAuditable {
  created_by: UUID;
  updated_by: UUID;
}
```

### 2.3 Workspace Interfaces

```typescript
// types/entities/workspace.ts

import { UUID, Timestamp, IBaseEntity } from '../base';
import { WorkspaceRole } from '../enums';

/**
 * Workspace settings
 */
export interface IWorkspaceSettings {
  // General
  locale: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';

  // Calendar
  hours_per_day: number;
  days_per_week: number;
  days_per_month: number;
  work_week: number[];  // [1,2,3,4,5] = Mon-Fri
  work_day_start: string;  // "08:00"
  work_day_end: string;    // "17:00"

  // Features
  enable_vault: boolean;
  enable_baselines: boolean;
  enable_time_tracking: boolean;
  enable_resource_calendar: boolean;

  // Sync
  auto_sync: boolean;
  sync_interval_ms: number;

  // UI
  default_view: 'gantt' | 'calendar' | 'taskboard' | 'grid';
  theme: 'stockholm' | 'classic' | 'material' | 'classic-light' | 'classic-dark';
}

/**
 * Workspace entity
 */
export interface IWorkspace extends IBaseEntity {
  // Identity
  name: string;
  slug: string;
  description: string | null;

  // Settings
  settings: IWorkspaceSettings;

  // Metadata
  owner_id: UUID;
  is_active: boolean;

  // Computed (via joins)
  member_count?: number;
  project_count?: number;
}

/**
 * Workspace creation input
 */
export interface IWorkspaceCreate {
  name: string;
  slug?: string;  // Auto-generated if not provided
  description?: string;
  settings?: Partial<IWorkspaceSettings>;
}

/**
 * Workspace update input
 */
export interface IWorkspaceUpdate {
  name?: string;
  description?: string;
  settings?: Partial<IWorkspaceSettings>;
  is_active?: boolean;
}

/**
 * Workspace member entity
 */
export interface IWorkspaceMember extends IBaseEntity {
  workspace_id: UUID;
  user_id: UUID;
  role: WorkspaceRole;

  // Department (for Vault filtering)
  department: string | null;

  // Status
  is_active: boolean;
  invited_at: Timestamp;
  accepted_at: Timestamp | null;

  // Expanded relations
  user?: IProfile;
  workspace?: IWorkspace;
}

/**
 * Workspace member creation
 */
export interface IWorkspaceMemberCreate {
  user_id?: UUID;  // Existing user
  email?: string;  // New invitation
  role: WorkspaceRole;
  department?: string;
}

/**
 * Workspace member update
 */
export interface IWorkspaceMemberUpdate {
  role?: WorkspaceRole;
  department?: string;
  is_active?: boolean;
}
```

### 2.4 Project Interfaces

```typescript
// types/entities/project.ts

import { UUID, Timestamp, IBaseEntity, JsonValue } from '../base';
import { ProjectStatus, SchedulingDirection } from '../enums';

/**
 * Project settings
 */
export interface IProjectSettings {
  // Scheduling
  direction: SchedulingDirection;
  auto_scheduling: boolean;
  skip_weekends: boolean;
  skip_non_working_time: boolean;

  // Calendar
  calendar_id: UUID | null;
  hours_per_day: number;
  days_per_week: number;
  days_per_month: number;

  // Features
  enable_dependencies: boolean;
  enable_resources: boolean;
  enable_baselines: boolean;
  enable_progress_tracking: boolean;
  enable_cost_tracking: boolean;

  // Critical path
  critical_path_threshold: number;  // Slack days threshold

  // UI
  default_duration_unit: string;
  show_critical_path: boolean;
  show_baselines: boolean;
}

/**
 * Project entity
 */
export interface IProject extends IBaseEntity {
  // Identity
  workspace_id: UUID;
  name: string;
  code: string | null;
  description: string | null;

  // Timeline
  start_date: Timestamp;
  end_date: Timestamp | null;
  planned_end_date: Timestamp | null;

  // Status
  status: ProjectStatus;
  percent_done: number;

  // Settings
  settings: IProjectSettings;

  // Metadata
  color: string | null;
  icon: string | null;
  tags: string[];

  // Template
  is_template: boolean;
  template_id: UUID | null;

  // Ownership
  owner_id: UUID;

  // Soft delete
  archived_at: Timestamp | null;

  // Computed
  task_count?: number;
  resource_count?: number;
}

/**
 * Project creation input
 */
export interface IProjectCreate {
  workspace_id: UUID;
  name: string;
  code?: string;
  description?: string;
  start_date: ISODateString;
  end_date?: ISODateString;
  status?: ProjectStatus;
  settings?: Partial<IProjectSettings>;
  color?: string;
  icon?: string;
  tags?: string[];
  template_id?: UUID;
}

/**
 * Project update input
 */
export interface IProjectUpdate {
  name?: string;
  code?: string;
  description?: string;
  start_date?: ISODateString;
  end_date?: ISODateString;
  planned_end_date?: ISODateString;
  status?: ProjectStatus;
  percent_done?: number;
  settings?: Partial<IProjectSettings>;
  color?: string;
  icon?: string;
  tags?: string[];
}
```

### 2.5 Task Interfaces

```typescript
// types/entities/task.ts

import { UUID, Timestamp, IBaseEntity, ISODateString } from '../base';
import { SchedulingMode, ConstraintType, DurationUnit } from '../enums';

/**
 * Task baseline data
 */
export interface ITaskBaseline {
  index: number;  // 0-based baseline index
  name: string | null;
  start_date: Timestamp;
  end_date: Timestamp;
  duration: number;
  duration_unit: DurationUnit;
  effort: number | null;
  effort_unit: DurationUnit | null;
  percent_done: number;
  created_at: Timestamp;
}

/**
 * Task segment (for split tasks)
 */
export interface ITaskSegment {
  id: UUID;
  task_id: UUID;
  name: string | null;
  start_date: Timestamp;
  end_date: Timestamp;
  duration: number;
  duration_unit: DurationUnit;
  order_index: number;
}

/**
 * Task entity (compatible with Bryntum TaskModel)
 */
export interface ITask extends IBaseEntity {
  // Bryntum identity
  project_id: UUID;

  // Hierarchy
  parent_id: UUID | null;
  parent_index: number;
  wbs_value: string | null;
  expanded: boolean;

  // Identity
  name: string;
  note: string | null;

  // Timing
  start_date: Timestamp;
  end_date: Timestamp;
  duration: number;
  duration_unit: DurationUnit;

  // Effort
  effort: number | null;
  effort_unit: DurationUnit | null;
  effort_driven: boolean;

  // Scheduling
  scheduling_mode: SchedulingMode;
  direction: 'Forward' | 'Backward' | null;
  manually_scheduled: boolean;
  inactive: boolean;
  ignore_resource_calendar: boolean;

  // Constraints
  constraint_type: ConstraintType | null;
  constraint_date: Timestamp | null;

  // Deadlines
  deadline_date: Timestamp | null;

  // Progress
  percent_done: number;

  // Calendar
  calendar_id: UUID | null;

  // Display
  cls: string | null;
  icon_cls: string | null;
  event_color: string | null;
  event_style: string | null;

  // Rollup
  rollup: boolean;
  show_in_timeline: boolean;

  // Baselines
  baselines: ITaskBaseline[];

  // Segments (split tasks)
  segments: ITaskSegment[];

  // Computed (read-only)
  is_leaf: boolean;
  is_parent: boolean;
  is_milestone: boolean;
  critical: boolean;
  total_slack: number | null;
  early_start_date: Timestamp | null;
  early_end_date: Timestamp | null;
  late_start_date: Timestamp | null;
  late_end_date: Timestamp | null;

  // Cost tracking
  cost: number | null;
  actual_cost: number | null;

  // Custom fields
  custom_fields: Record<string, unknown>;
}

/**
 * Task creation input
 */
export interface ITaskCreate {
  project_id: UUID;
  parent_id?: UUID;
  parent_index?: number;

  name: string;
  note?: string;

  start_date: ISODateString;
  end_date?: ISODateString;
  duration?: number;
  duration_unit?: DurationUnit;

  effort?: number;
  effort_unit?: DurationUnit;
  effort_driven?: boolean;

  scheduling_mode?: SchedulingMode;
  manually_scheduled?: boolean;
  inactive?: boolean;

  constraint_type?: ConstraintType;
  constraint_date?: ISODateString;

  deadline_date?: ISODateString;

  percent_done?: number;

  calendar_id?: UUID;

  cls?: string;
  icon_cls?: string;
  event_color?: string;
  event_style?: string;

  rollup?: boolean;
  show_in_timeline?: boolean;

  custom_fields?: Record<string, unknown>;
}

/**
 * Task update input
 */
export interface ITaskUpdate {
  parent_id?: UUID | null;
  parent_index?: number;
  expanded?: boolean;

  name?: string;
  note?: string;

  start_date?: ISODateString;
  end_date?: ISODateString;
  duration?: number;
  duration_unit?: DurationUnit;

  effort?: number;
  effort_unit?: DurationUnit;
  effort_driven?: boolean;

  scheduling_mode?: SchedulingMode;
  direction?: 'Forward' | 'Backward' | null;
  manually_scheduled?: boolean;
  inactive?: boolean;
  ignore_resource_calendar?: boolean;

  constraint_type?: ConstraintType | null;
  constraint_date?: ISODateString | null;

  deadline_date?: ISODateString | null;

  percent_done?: number;

  calendar_id?: UUID | null;

  cls?: string;
  icon_cls?: string;
  event_color?: string;
  event_style?: string;

  rollup?: boolean;
  show_in_timeline?: boolean;

  custom_fields?: Record<string, unknown>;
}

/**
 * Task with children (tree structure)
 */
export interface ITaskWithChildren extends ITask {
  children: ITaskWithChildren[];
}

/**
 * Bryntum-compatible task data format
 */
export interface IBryntumTaskData {
  id: string | number;
  parentId: string | number | null;
  parentIndex: number;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  durationUnit: string;
  effort?: number;
  effortUnit?: string;
  effortDriven?: boolean;
  percentDone: number;
  schedulingMode?: string;
  constraintType?: string;
  constraintDate?: string;
  manuallyScheduled?: boolean;
  inactive?: boolean;
  expanded?: boolean;
  rollup?: boolean;
  cls?: string;
  iconCls?: string;
  eventColor?: string;
  calendar?: string | number;
  deadlineDate?: string;
  note?: string;
  baselines?: Array<{
    startDate: string;
    endDate: string;
    duration: number;
    durationUnit: string;
  }>;
  children?: IBryntumTaskData[];
  [key: string]: unknown;
}
```

### 2.6 Dependency Interfaces

```typescript
// types/entities/dependency.ts

import { UUID, Timestamp, IBaseEntity } from '../base';
import { DependencyType, DurationUnit } from '../enums';

/**
 * Dependency entity (compatible with Bryntum DependencyModel)
 */
export interface IDependency extends IBaseEntity {
  project_id: UUID;

  // Source/Target
  from_task: UUID;  // Predecessor (fromEvent in Bryntum)
  to_task: UUID;    // Successor (toEvent in Bryntum)

  // Type
  type: DependencyType;

  // Lag
  lag: number;
  lag_unit: DurationUnit;

  // Status
  active: boolean;

  // Display
  cls: string | null;

  // Computed
  from_side?: 'start' | 'end';
  to_side?: 'start' | 'end';
  is_valid?: boolean;
}

/**
 * Dependency creation input
 */
export interface IDependencyCreate {
  project_id: UUID;
  from_task: UUID;
  to_task: UUID;
  type?: DependencyType;
  lag?: number;
  lag_unit?: DurationUnit;
  active?: boolean;
  cls?: string;
}

/**
 * Dependency update input
 */
export interface IDependencyUpdate {
  from_task?: UUID;
  to_task?: UUID;
  type?: DependencyType;
  lag?: number;
  lag_unit?: DurationUnit;
  active?: boolean;
  cls?: string;
}

/**
 * Bryntum-compatible dependency data
 */
export interface IBryntumDependencyData {
  id: string | number;
  fromEvent: string | number;  // fromTask in our schema
  toEvent: string | number;    // toTask in our schema
  type: number;  // 0=SS, 1=FS, 2=FF, 3=SF
  lag?: number;
  lagUnit?: string;
  active?: boolean;
  cls?: string;
  [key: string]: unknown;
}

/**
 * Dependency type mapping
 */
export interface IDependencyTypeInfo {
  type: DependencyType;
  code: 'SS' | 'FS' | 'FF' | 'SF';
  from_side: 'start' | 'end';
  to_side: 'start' | 'end';
  label: string;
  description: string;
}

export const DEPENDENCY_TYPES: IDependencyTypeInfo[] = [
  {
    type: DependencyType.START_TO_START,
    code: 'SS',
    from_side: 'start',
    to_side: 'start',
    label: 'Start-to-Start',
    description: 'Successor starts when predecessor starts'
  },
  {
    type: DependencyType.END_TO_START,
    code: 'FS',
    from_side: 'end',
    to_side: 'start',
    label: 'Finish-to-Start',
    description: 'Successor starts when predecessor ends (default)'
  },
  {
    type: DependencyType.END_TO_END,
    code: 'FF',
    from_side: 'end',
    to_side: 'end',
    label: 'Finish-to-Finish',
    description: 'Successor ends when predecessor ends'
  },
  {
    type: DependencyType.START_TO_END,
    code: 'SF',
    from_side: 'start',
    to_side: 'end',
    label: 'Start-to-Finish',
    description: 'Successor ends when predecessor starts'
  }
];
```

### 2.7 Resource & Assignment Interfaces

```typescript
// types/entities/resource.ts

import { UUID, Timestamp, IBaseEntity } from '../base';

/**
 * Resource entity (compatible with Bryntum ResourceModel)
 */
export interface IResource extends IBaseEntity {
  workspace_id: UUID;

  // Identity
  name: string;
  email: string | null;

  // Type
  type: 'human' | 'material' | 'equipment';

  // Cost
  cost_per_hour: number | null;
  cost_per_unit: number | null;

  // Capacity
  max_units: number;  // 100 = 100% capacity

  // Calendar
  calendar_id: UUID | null;

  // Display
  event_color: string | null;
  image: string | null;
  icon_cls: string | null;

  // Linked user
  user_id: UUID | null;

  // Status
  is_active: boolean;

  // Custom fields
  custom_fields: Record<string, unknown>;
}

/**
 * Resource creation input
 */
export interface IResourceCreate {
  workspace_id: UUID;
  name: string;
  email?: string;
  type?: 'human' | 'material' | 'equipment';
  cost_per_hour?: number;
  cost_per_unit?: number;
  max_units?: number;
  calendar_id?: UUID;
  event_color?: string;
  image?: string;
  icon_cls?: string;
  user_id?: UUID;
  custom_fields?: Record<string, unknown>;
}

/**
 * Resource update input
 */
export interface IResourceUpdate {
  name?: string;
  email?: string;
  type?: 'human' | 'material' | 'equipment';
  cost_per_hour?: number;
  cost_per_unit?: number;
  max_units?: number;
  calendar_id?: UUID;
  event_color?: string;
  image?: string;
  icon_cls?: string;
  user_id?: UUID;
  is_active?: boolean;
  custom_fields?: Record<string, unknown>;
}

/**
 * Bryntum-compatible resource data
 */
export interface IBryntumResourceData {
  id: string | number;
  name: string;
  eventColor?: string;
  image?: string;
  iconCls?: string;
  calendar?: string | number;
  maxUnits?: number;
  [key: string]: unknown;
}
```

```typescript
// types/entities/assignment.ts

import { UUID, Timestamp, IBaseEntity, ISODateString } from '../base';
import { DurationUnit } from '../enums';

/**
 * Assignment entity (compatible with Bryntum AssignmentModel)
 */
export interface IAssignment extends IBaseEntity {
  project_id: UUID;

  // Relations
  task_id: UUID;      // event in Bryntum
  resource_id: UUID;  // resource in Bryntum

  // Allocation
  units: number;  // 100 = 100% allocation

  // Time-phased (optional)
  start_date: Timestamp | null;
  end_date: Timestamp | null;
  effort: number | null;
  effort_unit: DurationUnit | null;

  // Computed
  cost?: number;
}

/**
 * Assignment creation input
 */
export interface IAssignmentCreate {
  project_id: UUID;
  task_id: UUID;
  resource_id: UUID;
  units?: number;
  start_date?: ISODateString;
  end_date?: ISODateString;
  effort?: number;
  effort_unit?: DurationUnit;
}

/**
 * Assignment update input
 */
export interface IAssignmentUpdate {
  units?: number;
  start_date?: ISODateString | null;
  end_date?: ISODateString | null;
  effort?: number | null;
  effort_unit?: DurationUnit | null;
}

/**
 * Bryntum-compatible assignment data
 */
export interface IBryntumAssignmentData {
  id: string | number;
  event: string | number;     // task_id
  resource: string | number;  // resource_id
  units?: number;
  [key: string]: unknown;
}
```

### 2.8 Vault Interfaces

```typescript
// types/entities/vault.ts

import { UUID, Timestamp, IBaseEntity, JsonValue } from '../base';
import { VaultStatus } from '../enums';

/**
 * Vault item entity
 */
export interface IVaultItem extends IBaseEntity {
  workspace_id: UUID;

  // Source
  source_type: 'project' | 'task' | 'document' | 'external';
  source_id: UUID | null;
  source_name: string;

  // Content
  title: string;
  description: string | null;
  content: JsonValue;  // Flexible JSON content

  // Classification
  category: string | null;
  tags: string[];
  department: string | null;

  // Status
  status: VaultStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Processing
  processed_at: Timestamp | null;
  processed_by: UUID | null;
  processing_notes: string | null;

  // Deadline
  due_date: Timestamp | null;

  // Metadata
  metadata: Record<string, unknown>;

  // Relations
  project?: {
    id: UUID;
    name: string;
  };
  processed_by_user?: {
    id: UUID;
    name: string;
  };
}

/**
 * Vault item creation input
 */
export interface IVaultItemCreate {
  workspace_id: UUID;
  source_type: 'project' | 'task' | 'document' | 'external';
  source_id?: UUID;
  source_name: string;
  title: string;
  description?: string;
  content?: JsonValue;
  category?: string;
  tags?: string[];
  department?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: ISODateString;
  metadata?: Record<string, unknown>;
}

/**
 * Vault item update input
 */
export interface IVaultItemUpdate {
  title?: string;
  description?: string;
  content?: JsonValue;
  category?: string;
  tags?: string[];
  department?: string;
  status?: VaultStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: ISODateString | null;
  processing_notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Vault processing action
 */
export interface IVaultProcessAction {
  item_id: UUID;
  action: 'start_processing' | 'complete' | 'reject' | 'reopen';
  notes?: string;
}

/**
 * Vault statistics
 */
export interface IVaultStats {
  total: number;
  by_status: {
    input: number;
    processing: number;
    done: number;
    rejected: number;
  };
  by_priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  overdue: number;
  processed_today: number;
  processing_time_avg_hours: number;
}
```

### 2.9 Profile Interface

```typescript
// types/entities/profile.ts

import { UUID, Timestamp, IBaseEntity } from '../base';

/**
 * User preferences
 */
export interface IUserPreferences {
  locale: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    task_assigned: boolean;
    task_due: boolean;
    project_updates: boolean;
  };
  default_workspace_id: UUID | null;
  sidebar_collapsed: boolean;
}

/**
 * User profile entity
 */
export interface IProfile extends IBaseEntity {
  // Supabase auth user id
  auth_user_id: UUID;

  // Identity
  email: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;

  // Contact
  phone: string | null;

  // Preferences
  preferences: IUserPreferences;

  // Status
  is_active: boolean;
  last_seen_at: Timestamp | null;

  // Metadata
  metadata: Record<string, unknown>;
}

/**
 * Profile update input
 */
export interface IProfileUpdate {
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  preferences?: Partial<IUserPreferences>;
  metadata?: Record<string, unknown>;
}
```

---

## 3. API Contracts

### 3.1 Response Types

```typescript
// types/api/responses.ts

import { UUID } from '../base';

/**
 * Standard API response wrapper
 */
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  meta?: IApiMeta;
  error?: IApiError;
}

/**
 * API response metadata
 */
export interface IApiMeta {
  // Pagination
  page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
  has_more?: boolean;

  // Timestamps
  timestamp: string;
  request_id: string;

  // Cache
  cached?: boolean;
  cache_ttl?: number;

  // Rate limiting
  rate_limit_remaining?: number;
  rate_limit_reset?: number;
}

/**
 * API error details
 */
export interface IApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
  validation_errors?: IValidationError[];
  stack?: string;  // Only in development
}

/**
 * Field validation error
 */
export interface IValidationError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

/**
 * List response with pagination
 */
export interface IListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Bulk operation result
 */
export interface IBulkOperationResult {
  success_count: number;
  error_count: number;
  errors: Array<{
    id: UUID;
    error: IApiError;
  }>;
}
```

### 3.2 Request Types

```typescript
// types/api/requests.ts

import { UUID } from '../base';

/**
 * List/Query parameters
 */
export interface IListParams {
  // Pagination
  page?: number;
  per_page?: number;
  offset?: number;
  limit?: number;

  // Sorting
  sort_by?: string;
  sort_order?: 'asc' | 'desc';

  // Filtering
  filters?: IFilterParam[];
  search?: string;

  // Include relations
  include?: string[];

  // Field selection
  select?: string[];
}

/**
 * Filter parameter
 */
export interface IFilterParam {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Filter operators
 */
export type FilterOperator =
  | 'eq'        // Equal
  | 'neq'       // Not equal
  | 'gt'        // Greater than
  | 'gte'       // Greater than or equal
  | 'lt'        // Less than
  | 'lte'       // Less than or equal
  | 'like'      // Pattern match
  | 'ilike'     // Case-insensitive pattern match
  | 'in'        // In array
  | 'nin'       // Not in array
  | 'is'        // Is null
  | 'isnot'     // Is not null
  | 'contains'  // Array contains
  | 'between';  // Between two values

/**
 * Workspace API requests
 */
export interface IWorkspaceListParams extends IListParams {
  include_archived?: boolean;
  role?: string;
}

/**
 * Project API requests
 */
export interface IProjectListParams extends IListParams {
  workspace_id: UUID;
  status?: string | string[];
  include_archived?: boolean;
  is_template?: boolean;
}

/**
 * Task API requests
 */
export interface ITaskListParams extends IListParams {
  project_id: UUID;
  parent_id?: UUID | null;
  include_children?: boolean;
  flat?: boolean;  // Return flat list instead of tree
  status?: 'all' | 'active' | 'completed' | 'overdue';
  assigned_to?: UUID;
  date_range?: {
    start: string;
    end: string;
  };
}

/**
 * Vault API requests
 */
export interface IVaultListParams extends IListParams {
  workspace_id: UUID;
  status?: string | string[];
  department?: string;
  priority?: string | string[];
  category?: string;
  assigned_to?: UUID;
  overdue_only?: boolean;
}

/**
 * Export request
 */
export interface IExportRequest {
  format: 'pdf' | 'png' | 'excel' | 'msp' | 'json' | 'csv';
  project_id: UUID;

  // PDF/PNG options
  paper_size?: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  scale?: number;

  // Date range
  date_range?: {
    start: string;
    end: string;
  };

  // Include options
  include_resources?: boolean;
  include_dependencies?: boolean;
  include_baselines?: boolean;
  include_notes?: boolean;

  // Column selection (for Excel/CSV)
  columns?: string[];
}

/**
 * Import request
 */
export interface IImportRequest {
  project_id: UUID;
  format: 'msp' | 'excel' | 'json' | 'csv';
  file: File | Blob;
  options?: {
    merge_mode: 'replace' | 'append' | 'update';
    map_resources?: boolean;
    preserve_ids?: boolean;
  };
}
```

### 3.3 Endpoint Contracts

```typescript
// types/api/endpoints.ts

import {
  IWorkspace, IWorkspaceCreate, IWorkspaceUpdate, IWorkspaceMember,
  IProject, IProjectCreate, IProjectUpdate,
  ITask, ITaskCreate, ITaskUpdate,
  IDependency, IDependencyCreate, IDependencyUpdate,
  IResource, IResourceCreate, IResourceUpdate,
  IAssignment, IAssignmentCreate, IAssignmentUpdate,
  IVaultItem, IVaultItemCreate, IVaultItemUpdate, IVaultStats,
  IProfile, IProfileUpdate
} from '../entities';
import {
  IApiResponse, IListResponse, IBulkOperationResult
} from './responses';
import {
  IWorkspaceListParams, IProjectListParams, ITaskListParams,
  IVaultListParams, IExportRequest
} from './requests';

/**
 * Workspace endpoints
 */
export interface IWorkspaceApi {
  // CRUD
  list(params?: IWorkspaceListParams): Promise<IApiResponse<IListResponse<IWorkspace>>>;
  get(id: string): Promise<IApiResponse<IWorkspace>>;
  create(data: IWorkspaceCreate): Promise<IApiResponse<IWorkspace>>;
  update(id: string, data: IWorkspaceUpdate): Promise<IApiResponse<IWorkspace>>;
  delete(id: string): Promise<IApiResponse<void>>;
  archive(id: string): Promise<IApiResponse<IWorkspace>>;
  restore(id: string): Promise<IApiResponse<IWorkspace>>;

  // Members
  getMembers(workspaceId: string): Promise<IApiResponse<IWorkspaceMember[]>>;
  addMember(workspaceId: string, data: IWorkspaceMemberCreate): Promise<IApiResponse<IWorkspaceMember>>;
  updateMember(workspaceId: string, memberId: string, data: IWorkspaceMemberUpdate): Promise<IApiResponse<IWorkspaceMember>>;
  removeMember(workspaceId: string, memberId: string): Promise<IApiResponse<void>>;
}

/**
 * Project endpoints
 */
export interface IProjectApi {
  // CRUD
  list(params: IProjectListParams): Promise<IApiResponse<IListResponse<IProject>>>;
  get(id: string): Promise<IApiResponse<IProject>>;
  create(data: IProjectCreate): Promise<IApiResponse<IProject>>;
  update(id: string, data: IProjectUpdate): Promise<IApiResponse<IProject>>;
  delete(id: string): Promise<IApiResponse<void>>;
  archive(id: string): Promise<IApiResponse<IProject>>;
  restore(id: string): Promise<IApiResponse<IProject>>;

  // Templates
  createFromTemplate(templateId: string, data: Partial<IProjectCreate>): Promise<IApiResponse<IProject>>;
  saveAsTemplate(id: string, name: string): Promise<IApiResponse<IProject>>;

  // Export
  export(id: string, options: IExportRequest): Promise<IApiResponse<{ url: string }>>;
}

/**
 * Task endpoints
 */
export interface ITaskApi {
  // CRUD
  list(params: ITaskListParams): Promise<IApiResponse<IListResponse<ITask>>>;
  getTree(projectId: string): Promise<IApiResponse<ITaskWithChildren[]>>;
  get(id: string): Promise<IApiResponse<ITask>>;
  create(data: ITaskCreate): Promise<IApiResponse<ITask>>;
  update(id: string, data: ITaskUpdate): Promise<IApiResponse<ITask>>;
  delete(id: string): Promise<IApiResponse<void>>;

  // Bulk operations
  bulkCreate(data: ITaskCreate[]): Promise<IApiResponse<IBulkOperationResult>>;
  bulkUpdate(updates: Array<{ id: string; data: ITaskUpdate }>): Promise<IApiResponse<IBulkOperationResult>>;
  bulkDelete(ids: string[]): Promise<IApiResponse<IBulkOperationResult>>;

  // Tree operations
  indent(ids: string[]): Promise<IApiResponse<ITask[]>>;
  outdent(ids: string[]): Promise<IApiResponse<ITask[]>>;
  move(id: string, parentId: string | null, index: number): Promise<IApiResponse<ITask>>;

  // Baselines
  addBaseline(projectId: string, name?: string): Promise<IApiResponse<void>>;
  removeBaseline(projectId: string, index: number): Promise<IApiResponse<void>>;
}

/**
 * Vault endpoints
 */
export interface IVaultApi {
  // CRUD
  list(params: IVaultListParams): Promise<IApiResponse<IListResponse<IVaultItem>>>;
  get(id: string): Promise<IApiResponse<IVaultItem>>;
  create(data: IVaultItemCreate): Promise<IApiResponse<IVaultItem>>;
  update(id: string, data: IVaultItemUpdate): Promise<IApiResponse<IVaultItem>>;
  delete(id: string): Promise<IApiResponse<void>>;

  // Processing
  process(action: IVaultProcessAction): Promise<IApiResponse<IVaultItem>>;

  // Stats
  getStats(workspaceId: string): Promise<IApiResponse<IVaultStats>>;

  // Export
  export(params: IVaultListParams & { format: 'excel' | 'csv' }): Promise<IApiResponse<{ url: string }>>;
}

/**
 * Export endpoints
 */
export interface IExportApi {
  // PDF Export
  exportPdf(request: IExportRequest): Promise<IApiResponse<{ url: string; expires_at: string }>>;

  // PNG Export
  exportPng(request: IExportRequest): Promise<IApiResponse<{ url: string; expires_at: string }>>;

  // Excel Export
  exportExcel(request: IExportRequest): Promise<IApiResponse<{ url: string; expires_at: string }>>;

  // MS Project Export
  exportMsp(request: IExportRequest): Promise<IApiResponse<{ url: string; expires_at: string }>>;

  // JSON Export
  exportJson(request: IExportRequest): Promise<IApiResponse<{ url: string; expires_at: string }>>;

  // Get export status (for async exports)
  getStatus(jobId: string): Promise<IApiResponse<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    url?: string;
    error?: string;
  }>>;
}
```

---

## 4. CrudManager Contracts

### 4.1 CrudManager Request/Response

```typescript
// types/api/crud-manager.ts

import { UUID } from '../base';
import { IBryntumTaskData, IBryntumDependencyData, IBryntumResourceData, IBryntumAssignmentData } from '../entities';

/**
 * CrudManager load request
 */
export interface ICrudManagerLoadRequest {
  type: 'load';
  requestId: number;
  project?: UUID;

  // Optional store-specific params
  tasks?: {
    startDate?: string;
    endDate?: string;
    parentId?: string | number;
  };

  // Paging (optional)
  page?: number;
  pageSize?: number;
}

/**
 * CrudManager sync request
 */
export interface ICrudManagerSyncRequest {
  type: 'sync';
  requestId: number;
  project: UUID;

  // Store changes
  tasks?: IStoreSyncData<IBryntumTaskData>;
  dependencies?: IStoreSyncData<IBryntumDependencyData>;
  resources?: IStoreSyncData<IBryntumResourceData>;
  assignments?: IStoreSyncData<IBryntumAssignmentData>;
  calendars?: IStoreSyncData<unknown>;
}

/**
 * Store sync data (changes per store)
 */
export interface IStoreSyncData<T> {
  added?: T[];
  updated?: T[];
  removed?: Array<{ id: string | number }>;
}

/**
 * CrudManager load response
 */
export interface ICrudManagerLoadResponse {
  success: boolean;
  requestId: number;
  revision?: number;

  // Project data
  project?: {
    calendar?: string | number;
    startDate?: string;
    hoursPerDay?: number;
    daysPerWeek?: number;
    daysPerMonth?: number;
  };

  // Store data
  tasks?: {
    rows: IBryntumTaskData[];
    total?: number;
  };
  dependencies?: {
    rows: IBryntumDependencyData[];
    total?: number;
  };
  resources?: {
    rows: IBryntumResourceData[];
    total?: number;
  };
  assignments?: {
    rows: IBryntumAssignmentData[];
    total?: number;
  };
  calendars?: {
    rows: unknown[];
  };

  // Error (if success is false)
  message?: string;
  code?: string;
}

/**
 * CrudManager sync response
 */
export interface ICrudManagerSyncResponse {
  success: boolean;
  requestId: number;
  revision?: number;

  // Updated store data (with server-assigned IDs, computed values)
  tasks?: IStoreSyncResult;
  dependencies?: IStoreSyncResult;
  resources?: IStoreSyncResult;
  assignments?: IStoreSyncResult;
  calendars?: IStoreSyncResult;

  // Error (if success is false)
  message?: string;
  code?: string;
}

/**
 * Store sync result
 */
export interface IStoreSyncResult {
  // Rows with updated data (ID mappings, computed fields)
  rows?: Array<{
    $PhantomId?: string | number;  // Client-side temp ID
    id: string | number;           // Server-assigned ID
    [key: string]: unknown;        // Other updated fields
  }>;

  // Removed rows confirmation
  removed?: Array<{ id: string | number }>;
}

/**
 * CrudManager transport configuration
 */
export interface ICrudManagerTransportConfig {
  load: {
    url: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    params?: Record<string, string>;
  };
  sync: {
    url: string;
    method?: 'POST';
    headers?: Record<string, string>;
  };
}

/**
 * CrudManager error response
 */
export interface ICrudManagerErrorResponse {
  success: false;
  requestId: number;
  message: string;
  code: string;
  details?: {
    store?: string;
    recordId?: string | number;
    field?: string;
    constraint?: string;
  };
}

/**
 * CrudManager revision conflict
 */
export interface ICrudManagerConflictResponse {
  success: false;
  requestId: number;
  code: 'REVISION_CONFLICT';
  message: string;
  serverRevision: number;
  clientRevision: number;
  conflictingChanges: Array<{
    store: string;
    recordId: string | number;
    field: string;
    serverValue: unknown;
    clientValue: unknown;
  }>;
}
```

### 4.2 Realtime Sync Types

```typescript
// types/api/realtime.ts

import { UUID } from '../base';
import { AuditAction } from '../enums';

/**
 * Realtime subscription channels
 */
export type RealtimeChannel =
  | `workspace:${UUID}`
  | `project:${UUID}`
  | `vault:${UUID}`;

/**
 * Realtime event types
 */
export type RealtimeEventType =
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE';

/**
 * Realtime payload base
 */
export interface IRealtimePayload<T = unknown> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: RealtimeEventType;
  new: T | null;
  old: T | null;
  errors: string[] | null;
}

/**
 * Presence state
 */
export interface IPresenceState {
  user_id: UUID;
  user_name: string;
  avatar_url: string | null;
  online_at: string;
  current_view: 'gantt' | 'calendar' | 'taskboard' | 'grid' | null;
  editing_task_id: UUID | null;
}

/**
 * Broadcast message types
 */
export interface IBroadcastMessage {
  type: 'cursor_move' | 'task_select' | 'user_typing' | 'sync_request';
  sender_id: UUID;
  payload: Record<string, unknown>;
}

/**
 * Cursor position (collaborative editing)
 */
export interface ICursorPosition {
  user_id: UUID;
  task_id: UUID | null;
  field: string | null;
  position?: {
    x: number;
    y: number;
  };
}
```

---

## 5. Event Payloads

### 5.1 Bryntum Events

```typescript
// types/events/bryntum-events.ts

import { UUID } from '../base';
import { ITask, IDependency, IResource, IAssignment } from '../entities';

/**
 * Base event interface
 */
export interface IBryntumEvent {
  source: unknown;  // The widget that fired the event
  type: string;
}

/**
 * Task change event
 */
export interface ITaskChangeEvent extends IBryntumEvent {
  type: 'taskChange';
  action: 'add' | 'update' | 'remove';
  records: ITask[];
  changes?: Record<string, {
    oldValue: unknown;
    value: unknown;
  }>;
}

/**
 * Task before change event (cancelable)
 */
export interface IBeforeTaskChangeEvent extends ITaskChangeEvent {
  type: 'beforeTaskChange';
}

/**
 * Dependency change event
 */
export interface IDependencyChangeEvent extends IBryntumEvent {
  type: 'dependencyChange';
  action: 'add' | 'update' | 'remove';
  records: IDependency[];
  changes?: Record<string, {
    oldValue: unknown;
    value: unknown;
  }>;
}

/**
 * Assignment change event
 */
export interface IAssignmentChangeEvent extends IBryntumEvent {
  type: 'assignmentChange';
  action: 'add' | 'update' | 'remove';
  records: IAssignment[];
}

/**
 * Resource change event
 */
export interface IResourceChangeEvent extends IBryntumEvent {
  type: 'resourceChange';
  action: 'add' | 'update' | 'remove';
  records: IResource[];
}

/**
 * Sync event (CrudManager)
 */
export interface ISyncEvent extends IBryntumEvent {
  type: 'sync' | 'beforeSync' | 'syncFail';
  pack?: unknown;  // Request data
  response?: unknown;  // Response data
  exception?: Error;
}

/**
 * Load event (CrudManager)
 */
export interface ILoadEvent extends IBryntumEvent {
  type: 'load' | 'beforeLoad' | 'loadFail';
  pack?: unknown;
  response?: unknown;
  exception?: Error;
}

/**
 * Task drag event
 */
export interface ITaskDragEvent extends IBryntumEvent {
  type: 'beforeTaskDrag' | 'taskDrag' | 'afterTaskDrag' | 'taskDragAbort';
  taskRecord: ITask;
  context: {
    startDate: Date;
    endDate: Date;
    duration: number;
    valid: boolean;
  };
}

/**
 * Task resize event
 */
export interface ITaskResizeEvent extends IBryntumEvent {
  type: 'beforeTaskResize' | 'taskResize' | 'afterTaskResize' | 'taskResizeEnd';
  taskRecord: ITask;
  startDate: Date;
  endDate: Date;
  edge: 'start' | 'end';
}

/**
 * Dependency create event
 */
export interface IDependencyCreateEvent extends IBryntumEvent {
  type: 'beforeDependencyAdd' | 'dependencyAdd';
  dependency: IDependency;
  fromTask: ITask;
  toTask: ITask;
}

/**
 * Task edit event
 */
export interface ITaskEditEvent extends IBryntumEvent {
  type: 'beforeTaskEdit' | 'taskEdit' | 'beforeTaskSave' | 'afterTaskSave' | 'taskEditCanceled';
  taskRecord: ITask;
  editor?: unknown;  // TaskEditor widget
  values?: Record<string, unknown>;
}

/**
 * Scheduling conflict event
 */
export interface ISchedulingConflictEvent extends IBryntumEvent {
  type: 'schedulingConflict';
  conflict: {
    type: 'cycle' | 'constraint' | 'calendar';
    tasks: ITask[];
    dependencies?: IDependency[];
    message: string;
  };
  continueWithResolution: (resolution: 'cancel' | 'ignore' | 'remove_dependency') => void;
}

/**
 * Critical path calculated event
 */
export interface ICriticalPathEvent extends IBryntumEvent {
  type: 'criticalPathsCalculated';
  criticalPaths: Array<{
    tasks: ITask[];
    dependencies: IDependency[];
  }>;
}

/**
 * Undo/Redo event
 */
export interface IUndoRedoEvent extends IBryntumEvent {
  type: 'beforeUndo' | 'undo' | 'beforeRedo' | 'redo';
  title: string;
  transactions: unknown[];
}
```

### 5.2 Application Events

```typescript
// types/events/app-events.ts

import { UUID, Timestamp } from '../base';
import {
  IWorkspace, IProject, ITask, IVaultItem, IProfile
} from '../entities';
import { WorkspaceRole, AuditAction, ExportFormat } from '../enums';

/**
 * Workspace change event
 */
export interface IWorkspaceChangeEvent {
  type: 'workspace:created' | 'workspace:updated' | 'workspace:deleted' | 'workspace:archived';
  workspace_id: UUID;
  workspace: IWorkspace;
  changed_by: UUID;
  changed_at: Timestamp;
  changes?: Record<string, {
    old_value: unknown;
    new_value: unknown;
  }>;
}

/**
 * Workspace member event
 */
export interface IWorkspaceMemberEvent {
  type: 'member:added' | 'member:updated' | 'member:removed';
  workspace_id: UUID;
  user_id: UUID;
  role?: WorkspaceRole;
  changed_by: UUID;
  changed_at: Timestamp;
}

/**
 * Project change event
 */
export interface IProjectChangeEvent {
  type: 'project:created' | 'project:updated' | 'project:deleted' | 'project:archived' | 'project:status_changed';
  project_id: UUID;
  workspace_id: UUID;
  project: IProject;
  changed_by: UUID;
  changed_at: Timestamp;
  changes?: Record<string, {
    old_value: unknown;
    new_value: unknown;
  }>;
}

/**
 * Vault event
 */
export interface IVaultEvent {
  type: 'vault:item_created' | 'vault:item_updated' | 'vault:item_processed' | 'vault:item_deleted';
  item_id: UUID;
  workspace_id: UUID;
  item: IVaultItem;
  action_by: UUID;
  action_at: Timestamp;
}

/**
 * Export event
 */
export interface IExportEvent {
  type: 'export:started' | 'export:progress' | 'export:completed' | 'export:failed';
  job_id: UUID;
  project_id: UUID;
  format: ExportFormat;
  requested_by: UUID;
  requested_at: Timestamp;

  // Progress (for export:progress)
  progress?: number;

  // Result (for export:completed)
  url?: string;
  expires_at?: Timestamp;

  // Error (for export:failed)
  error?: string;
}

/**
 * Audit log event
 */
export interface IAuditLogEvent {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  action: AuditAction;
  entity_type: string;
  entity_id: UUID;
  entity_name: string;
  changes: Record<string, {
    old_value: unknown;
    new_value: unknown;
  }> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Timestamp;
}

/**
 * User session event
 */
export interface ISessionEvent {
  type: 'session:started' | 'session:ended' | 'session:timeout';
  user_id: UUID;
  session_id: string;
  ip_address: string;
  user_agent: string;
  timestamp: Timestamp;
}

/**
 * Notification event
 */
export interface INotificationEvent {
  id: UUID;
  type: 'task_assigned' | 'task_due' | 'task_overdue' | 'project_update' | 'mention' | 'vault_item' | 'system';
  recipient_id: UUID;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  created_at: Timestamp;
}
```

---

## 6. Validation Schemas (Zod)

```typescript
// types/validation/schemas.ts

import { z } from 'zod';
import {
  WorkspaceRole, ProjectStatus, SchedulingMode,
  ConstraintType, DependencyType, VaultStatus, ExportFormat
} from '../enums';

// =============================================================================
// Base Schemas
// =============================================================================

export const uuidSchema = z.string().uuid();

export const dateStringSchema = z.string().datetime({ offset: true });

export const isoDateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/,
  'Ongeldige datum formaat. Gebruik ISO 8601 (YYYY-MM-DD of YYYY-MM-DDTHH:mm:ssZ)'
);

// =============================================================================
// Workspace Schemas
// =============================================================================

export const workspaceSettingsSchema = z.object({
  locale: z.string().default('nl-NL'),
  timezone: z.string().default('Europe/Amsterdam'),
  date_format: z.string().default('DD-MM-YYYY'),
  time_format: z.enum(['12h', '24h']).default('24h'),
  hours_per_day: z.number().min(1).max(24).default(8),
  days_per_week: z.number().min(1).max(7).default(5),
  days_per_month: z.number().min(1).max(31).default(20),
  work_week: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5]),
  work_day_start: z.string().regex(/^\d{2}:\d{2}$/).default('08:00'),
  work_day_end: z.string().regex(/^\d{2}:\d{2}$/).default('17:00'),
  enable_vault: z.boolean().default(true),
  enable_baselines: z.boolean().default(true),
  enable_time_tracking: z.boolean().default(false),
  enable_resource_calendar: z.boolean().default(true),
  auto_sync: z.boolean().default(true),
  sync_interval_ms: z.number().min(1000).max(60000).default(5000),
  default_view: z.enum(['gantt', 'calendar', 'taskboard', 'grid']).default('gantt'),
  theme: z.enum(['stockholm', 'classic', 'material', 'classic-light', 'classic-dark']).default('stockholm'),
}).partial();

export const createWorkspaceSchema = z.object({
  name: z.string()
    .min(2, 'Naam moet minimaal 2 karakters bevatten')
    .max(100, 'Naam mag maximaal 100 karakters bevatten'),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug mag alleen kleine letters, cijfers en streepjes bevatten')
    .min(2)
    .max(50)
    .optional(),
  description: z.string().max(500).optional(),
  settings: workspaceSettingsSchema.optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  settings: workspaceSettingsSchema.optional(),
  is_active: z.boolean().optional(),
});

export const addWorkspaceMemberSchema = z.object({
  user_id: uuidSchema.optional(),
  email: z.string().email('Ongeldig email adres').optional(),
  role: z.nativeEnum(WorkspaceRole),
  department: z.string().max(100).optional(),
}).refine(
  data => data.user_id || data.email,
  { message: 'User ID of email is verplicht' }
);

// =============================================================================
// Project Schemas
// =============================================================================

export const projectSettingsSchema = z.object({
  direction: z.enum(['Forward', 'Backward']).default('Forward'),
  auto_scheduling: z.boolean().default(true),
  skip_weekends: z.boolean().default(true),
  skip_non_working_time: z.boolean().default(true),
  calendar_id: uuidSchema.nullable().optional(),
  hours_per_day: z.number().min(1).max(24).default(8),
  days_per_week: z.number().min(1).max(7).default(5),
  days_per_month: z.number().min(1).max(31).default(20),
  enable_dependencies: z.boolean().default(true),
  enable_resources: z.boolean().default(true),
  enable_baselines: z.boolean().default(true),
  enable_progress_tracking: z.boolean().default(true),
  enable_cost_tracking: z.boolean().default(false),
  critical_path_threshold: z.number().min(0).max(30).default(0),
  default_duration_unit: z.string().default('day'),
  show_critical_path: z.boolean().default(true),
  show_baselines: z.boolean().default(false),
}).partial();

export const createProjectSchema = z.object({
  workspace_id: uuidSchema,
  name: z.string()
    .min(2, 'Projectnaam moet minimaal 2 karakters bevatten')
    .max(200, 'Projectnaam mag maximaal 200 karakters bevatten'),
  code: z.string().max(20).optional(),
  description: z.string().max(2000).optional(),
  start_date: isoDateSchema,
  end_date: isoDateSchema.optional(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.DRAFT),
  settings: projectSettingsSchema.optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  template_id: uuidSchema.optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  code: z.string().max(20).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  start_date: isoDateSchema.optional(),
  end_date: isoDateSchema.optional().nullable(),
  planned_end_date: isoDateSchema.optional().nullable(),
  status: z.nativeEnum(ProjectStatus).optional(),
  percent_done: z.number().min(0).max(100).optional(),
  settings: projectSettingsSchema.optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

// =============================================================================
// Task Schemas
// =============================================================================

export const durationUnitSchema = z.enum([
  'millisecond', 'ms',
  'second', 's',
  'minute', 'mi', 'm',
  'hour', 'h',
  'day', 'd',
  'week', 'w',
  'month', 'mo', 'M',
  'quarter', 'q',
  'year', 'y'
]);

export const createTaskSchema = z.object({
  project_id: uuidSchema,
  parent_id: uuidSchema.optional().nullable(),
  parent_index: z.number().int().min(0).optional(),

  name: z.string()
    .min(1, 'Taaknaam is verplicht')
    .max(500, 'Taaknaam mag maximaal 500 karakters bevatten'),
  note: z.string().max(5000).optional(),

  start_date: isoDateSchema,
  end_date: isoDateSchema.optional(),
  duration: z.number().min(0).optional(),
  duration_unit: durationUnitSchema.default('day'),

  effort: z.number().min(0).optional(),
  effort_unit: durationUnitSchema.optional(),
  effort_driven: z.boolean().default(false),

  scheduling_mode: z.nativeEnum(SchedulingMode).default(SchedulingMode.NORMAL),
  manually_scheduled: z.boolean().default(false),
  inactive: z.boolean().default(false),

  constraint_type: z.nativeEnum(ConstraintType).optional().nullable(),
  constraint_date: isoDateSchema.optional().nullable(),

  deadline_date: isoDateSchema.optional().nullable(),

  percent_done: z.number().min(0).max(100).default(0),

  calendar_id: uuidSchema.optional().nullable(),

  cls: z.string().max(200).optional(),
  icon_cls: z.string().max(200).optional(),
  event_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  event_style: z.string().max(500).optional(),

  rollup: z.boolean().default(false),
  show_in_timeline: z.boolean().default(false),

  custom_fields: z.record(z.unknown()).optional(),
});

export const updateTaskSchema = createTaskSchema
  .omit({ project_id: true })
  .partial();

// =============================================================================
// Dependency Schemas
// =============================================================================

export const createDependencySchema = z.object({
  project_id: uuidSchema,
  from_task: uuidSchema,
  to_task: uuidSchema,
  type: z.nativeEnum(DependencyType).default(DependencyType.END_TO_START),
  lag: z.number().default(0),
  lag_unit: durationUnitSchema.default('day'),
  active: z.boolean().default(true),
  cls: z.string().max(200).optional(),
}).refine(
  data => data.from_task !== data.to_task,
  { message: 'Een taak kan geen afhankelijkheid van zichzelf hebben' }
);

export const updateDependencySchema = createDependencySchema
  .omit({ project_id: true })
  .partial();

// =============================================================================
// Resource Schemas
// =============================================================================

export const createResourceSchema = z.object({
  workspace_id: uuidSchema,
  name: z.string()
    .min(1, 'Resourcenaam is verplicht')
    .max(200, 'Resourcenaam mag maximaal 200 karakters bevatten'),
  email: z.string().email().optional().nullable(),
  type: z.enum(['human', 'material', 'equipment']).default('human'),
  cost_per_hour: z.number().min(0).optional().nullable(),
  cost_per_unit: z.number().min(0).optional().nullable(),
  max_units: z.number().min(0).max(1000).default(100),
  calendar_id: uuidSchema.optional().nullable(),
  event_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  image: z.string().url().optional().nullable(),
  icon_cls: z.string().max(200).optional(),
  user_id: uuidSchema.optional().nullable(),
  custom_fields: z.record(z.unknown()).optional(),
});

export const updateResourceSchema = createResourceSchema
  .omit({ workspace_id: true })
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  });

// =============================================================================
// Assignment Schemas
// =============================================================================

export const createAssignmentSchema = z.object({
  project_id: uuidSchema,
  task_id: uuidSchema,
  resource_id: uuidSchema,
  units: z.number().min(0).max(1000).default(100),
  start_date: isoDateSchema.optional().nullable(),
  end_date: isoDateSchema.optional().nullable(),
  effort: z.number().min(0).optional().nullable(),
  effort_unit: durationUnitSchema.optional().nullable(),
});

export const updateAssignmentSchema = createAssignmentSchema
  .omit({ project_id: true, task_id: true, resource_id: true })
  .partial();

// =============================================================================
// Vault Schemas
// =============================================================================

export const createVaultItemSchema = z.object({
  workspace_id: uuidSchema,
  source_type: z.enum(['project', 'task', 'document', 'external']),
  source_id: uuidSchema.optional().nullable(),
  source_name: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  content: z.unknown().optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  department: z.string().max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: isoDateSchema.optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateVaultItemSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional().nullable(),
  content: z.unknown().optional(),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  department: z.string().max(100).optional().nullable(),
  status: z.nativeEnum(VaultStatus).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: isoDateSchema.optional().nullable(),
  processing_notes: z.string().max(5000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// =============================================================================
// Export Schemas
// =============================================================================

export const exportRequestSchema = z.object({
  format: z.nativeEnum(ExportFormat),
  project_id: uuidSchema,

  // PDF/PNG options
  paper_size: z.enum(['A4', 'A3', 'Letter', 'Legal']).optional(),
  orientation: z.enum(['portrait', 'landscape']).optional(),
  scale: z.number().min(0.1).max(2).optional(),

  // Date range
  date_range: z.object({
    start: isoDateSchema,
    end: isoDateSchema,
  }).optional(),

  // Include options
  include_resources: z.boolean().default(true),
  include_dependencies: z.boolean().default(true),
  include_baselines: z.boolean().default(false),
  include_notes: z.boolean().default(false),

  // Column selection (for Excel/CSV)
  columns: z.array(z.string()).optional(),
});

// =============================================================================
// Type Exports (inferred from schemas)
// =============================================================================

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateDependencyInput = z.infer<typeof createDependencySchema>;
export type UpdateDependencyInput = z.infer<typeof updateDependencySchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type CreateVaultItemInput = z.infer<typeof createVaultItemSchema>;
export type UpdateVaultItemInput = z.infer<typeof updateVaultItemSchema>;
export type ExportRequestInput = z.infer<typeof exportRequestSchema>;
```

---

## 7. Error Codes & Messages

```typescript
// types/errors/codes.ts

/**
 * Error code prefixes
 */
export const ERROR_PREFIX = {
  AUTH: 'AUTH',
  AUTHZ: 'AUTHZ',
  VALIDATION: 'VAL',
  RESOURCE: 'RES',
  SYNC: 'SYNC',
  EXPORT: 'EXP',
  IMPORT: 'IMP',
  SERVER: 'SRV',
  RATE_LIMIT: 'RATE',
} as const;

/**
 * Authentication errors (AUTH_*)
 */
export const AUTH_ERRORS = {
  // Session
  AUTH_INVALID_TOKEN: 'AUTH_001',
  AUTH_EXPIRED_TOKEN: 'AUTH_002',
  AUTH_MISSING_TOKEN: 'AUTH_003',
  AUTH_INVALID_REFRESH_TOKEN: 'AUTH_004',

  // Credentials
  AUTH_INVALID_CREDENTIALS: 'AUTH_010',
  AUTH_USER_NOT_FOUND: 'AUTH_011',
  AUTH_INVALID_PASSWORD: 'AUTH_012',
  AUTH_ACCOUNT_LOCKED: 'AUTH_013',
  AUTH_ACCOUNT_DISABLED: 'AUTH_014',

  // Registration
  AUTH_EMAIL_IN_USE: 'AUTH_020',
  AUTH_WEAK_PASSWORD: 'AUTH_021',
  AUTH_INVALID_EMAIL: 'AUTH_022',

  // MFA
  AUTH_MFA_REQUIRED: 'AUTH_030',
  AUTH_INVALID_MFA_CODE: 'AUTH_031',
} as const;

/**
 * Authorization errors (AUTHZ_*)
 */
export const AUTHZ_ERRORS = {
  // General
  AUTHZ_FORBIDDEN: 'AUTHZ_001',
  AUTHZ_INSUFFICIENT_PERMISSIONS: 'AUTHZ_002',

  // Workspace
  AUTHZ_NOT_WORKSPACE_MEMBER: 'AUTHZ_010',
  AUTHZ_NOT_WORKSPACE_ADMIN: 'AUTHZ_011',
  AUTHZ_WORKSPACE_ACCESS_DENIED: 'AUTHZ_012',

  // Project
  AUTHZ_NOT_PROJECT_MEMBER: 'AUTHZ_020',
  AUTHZ_PROJECT_ACCESS_DENIED: 'AUTHZ_021',
  AUTHZ_PROJECT_READ_ONLY: 'AUTHZ_022',

  // Role
  AUTHZ_ROLE_REQUIRED: 'AUTHZ_030',
  AUTHZ_CANNOT_MODIFY_OWN_ROLE: 'AUTHZ_031',
  AUTHZ_CANNOT_REMOVE_LAST_ADMIN: 'AUTHZ_032',

  // Vault
  AUTHZ_VAULT_ACCESS_DENIED: 'AUTHZ_040',
  AUTHZ_VAULT_DEPARTMENT_MISMATCH: 'AUTHZ_041',
} as const;

/**
 * Validation errors (VAL_*)
 */
export const VALIDATION_ERRORS = {
  // General
  VAL_INVALID_INPUT: 'VAL_001',
  VAL_REQUIRED_FIELD: 'VAL_002',
  VAL_INVALID_FORMAT: 'VAL_003',
  VAL_VALUE_OUT_OF_RANGE: 'VAL_004',

  // Task
  VAL_INVALID_DATE_RANGE: 'VAL_010',
  VAL_END_BEFORE_START: 'VAL_011',
  VAL_NEGATIVE_DURATION: 'VAL_012',
  VAL_INVALID_PERCENT: 'VAL_013',
  VAL_INVALID_CONSTRAINT: 'VAL_014',
  VAL_CIRCULAR_PARENT: 'VAL_015',

  // Dependency
  VAL_SELF_DEPENDENCY: 'VAL_020',
  VAL_CIRCULAR_DEPENDENCY: 'VAL_021',
  VAL_DUPLICATE_DEPENDENCY: 'VAL_022',
  VAL_INVALID_DEPENDENCY_TYPE: 'VAL_023',

  // Resource
  VAL_INVALID_UNITS: 'VAL_030',
  VAL_RESOURCE_OVERALLOCATED: 'VAL_031',

  // Project
  VAL_INVALID_PROJECT_STATUS: 'VAL_040',
  VAL_INVALID_PROJECT_DATES: 'VAL_041',
} as const;

/**
 * Resource errors (RES_*)
 */
export const RESOURCE_ERRORS = {
  // Not found
  RES_NOT_FOUND: 'RES_001',
  RES_WORKSPACE_NOT_FOUND: 'RES_002',
  RES_PROJECT_NOT_FOUND: 'RES_003',
  RES_TASK_NOT_FOUND: 'RES_004',
  RES_RESOURCE_NOT_FOUND: 'RES_005',
  RES_DEPENDENCY_NOT_FOUND: 'RES_006',
  RES_ASSIGNMENT_NOT_FOUND: 'RES_007',
  RES_VAULT_ITEM_NOT_FOUND: 'RES_008',
  RES_USER_NOT_FOUND: 'RES_009',

  // Already exists
  RES_ALREADY_EXISTS: 'RES_010',
  RES_DUPLICATE_SLUG: 'RES_011',
  RES_DUPLICATE_CODE: 'RES_012',

  // State
  RES_ARCHIVED: 'RES_020',
  RES_DELETED: 'RES_021',
  RES_LOCKED: 'RES_022',
  RES_IN_USE: 'RES_023',
} as const;

/**
 * Sync errors (SYNC_*)
 */
export const SYNC_ERRORS = {
  // General
  SYNC_FAILED: 'SYNC_001',
  SYNC_TIMEOUT: 'SYNC_002',
  SYNC_CONFLICT: 'SYNC_003',

  // Revision
  SYNC_REVISION_MISMATCH: 'SYNC_010',
  SYNC_STALE_DATA: 'SYNC_011',

  // Data
  SYNC_INVALID_PAYLOAD: 'SYNC_020',
  SYNC_MISSING_PROJECT: 'SYNC_021',
  SYNC_PARTIAL_FAILURE: 'SYNC_022',

  // Network
  SYNC_CONNECTION_LOST: 'SYNC_030',
  SYNC_SERVER_UNAVAILABLE: 'SYNC_031',
} as const;

/**
 * Export errors (EXP_*)
 */
export const EXPORT_ERRORS = {
  // General
  EXP_FAILED: 'EXP_001',
  EXP_UNSUPPORTED_FORMAT: 'EXP_002',
  EXP_TIMEOUT: 'EXP_003',

  // PDF
  EXP_PDF_GENERATION_FAILED: 'EXP_010',
  EXP_PDF_TOO_LARGE: 'EXP_011',

  // Excel
  EXP_EXCEL_GENERATION_FAILED: 'EXP_020',
  EXP_EXCEL_TOO_MANY_ROWS: 'EXP_021',

  // MSP
  EXP_MSP_GENERATION_FAILED: 'EXP_030',
  EXP_MSP_INVALID_DATA: 'EXP_031',

  // Storage
  EXP_UPLOAD_FAILED: 'EXP_040',
  EXP_DOWNLOAD_EXPIRED: 'EXP_041',
} as const;

/**
 * Server errors (SRV_*)
 */
export const SERVER_ERRORS = {
  SRV_INTERNAL_ERROR: 'SRV_001',
  SRV_DATABASE_ERROR: 'SRV_002',
  SRV_SERVICE_UNAVAILABLE: 'SRV_003',
  SRV_CONFIGURATION_ERROR: 'SRV_004',
  SRV_EXTERNAL_SERVICE_ERROR: 'SRV_005',
  SRV_MAINTENANCE_MODE: 'SRV_006',
} as const;

/**
 * Rate limit errors (RATE_*)
 */
export const RATE_LIMIT_ERRORS = {
  RATE_LIMIT_EXCEEDED: 'RATE_001',
  RATE_TOO_MANY_REQUESTS: 'RATE_002',
  RATE_QUOTA_EXCEEDED: 'RATE_003',
} as const;

/**
 * All error codes union
 */
export type ErrorCode =
  | typeof AUTH_ERRORS[keyof typeof AUTH_ERRORS]
  | typeof AUTHZ_ERRORS[keyof typeof AUTHZ_ERRORS]
  | typeof VALIDATION_ERRORS[keyof typeof VALIDATION_ERRORS]
  | typeof RESOURCE_ERRORS[keyof typeof RESOURCE_ERRORS]
  | typeof SYNC_ERRORS[keyof typeof SYNC_ERRORS]
  | typeof EXPORT_ERRORS[keyof typeof EXPORT_ERRORS]
  | typeof SERVER_ERRORS[keyof typeof SERVER_ERRORS]
  | typeof RATE_LIMIT_ERRORS[keyof typeof RATE_LIMIT_ERRORS];

/**
 * Error messages in Dutch
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // AUTH
  [AUTH_ERRORS.AUTH_INVALID_TOKEN]: 'Ongeldige authenticatie token',
  [AUTH_ERRORS.AUTH_EXPIRED_TOKEN]: 'Sessie is verlopen, log opnieuw in',
  [AUTH_ERRORS.AUTH_MISSING_TOKEN]: 'Authenticatie token ontbreekt',
  [AUTH_ERRORS.AUTH_INVALID_REFRESH_TOKEN]: 'Ongeldige refresh token',
  [AUTH_ERRORS.AUTH_INVALID_CREDENTIALS]: 'Ongeldige inloggegevens',
  [AUTH_ERRORS.AUTH_USER_NOT_FOUND]: 'Gebruiker niet gevonden',
  [AUTH_ERRORS.AUTH_INVALID_PASSWORD]: 'Ongeldig wachtwoord',
  [AUTH_ERRORS.AUTH_ACCOUNT_LOCKED]: 'Account is vergrendeld',
  [AUTH_ERRORS.AUTH_ACCOUNT_DISABLED]: 'Account is gedeactiveerd',
  [AUTH_ERRORS.AUTH_EMAIL_IN_USE]: 'Email adres is al in gebruik',
  [AUTH_ERRORS.AUTH_WEAK_PASSWORD]: 'Wachtwoord is te zwak',
  [AUTH_ERRORS.AUTH_INVALID_EMAIL]: 'Ongeldig email adres',
  [AUTH_ERRORS.AUTH_MFA_REQUIRED]: 'Twee-factor authenticatie vereist',
  [AUTH_ERRORS.AUTH_INVALID_MFA_CODE]: 'Ongeldige verificatiecode',

  // AUTHZ
  [AUTHZ_ERRORS.AUTHZ_FORBIDDEN]: 'Toegang geweigerd',
  [AUTHZ_ERRORS.AUTHZ_INSUFFICIENT_PERMISSIONS]: 'Onvoldoende rechten voor deze actie',
  [AUTHZ_ERRORS.AUTHZ_NOT_WORKSPACE_MEMBER]: 'Je bent geen lid van deze workspace',
  [AUTHZ_ERRORS.AUTHZ_NOT_WORKSPACE_ADMIN]: 'Admin rechten vereist',
  [AUTHZ_ERRORS.AUTHZ_WORKSPACE_ACCESS_DENIED]: 'Geen toegang tot deze workspace',
  [AUTHZ_ERRORS.AUTHZ_NOT_PROJECT_MEMBER]: 'Je bent geen lid van dit project',
  [AUTHZ_ERRORS.AUTHZ_PROJECT_ACCESS_DENIED]: 'Geen toegang tot dit project',
  [AUTHZ_ERRORS.AUTHZ_PROJECT_READ_ONLY]: 'Project is alleen-lezen',
  [AUTHZ_ERRORS.AUTHZ_ROLE_REQUIRED]: 'Deze rol is vereist voor deze actie',
  [AUTHZ_ERRORS.AUTHZ_CANNOT_MODIFY_OWN_ROLE]: 'Je kunt je eigen rol niet wijzigen',
  [AUTHZ_ERRORS.AUTHZ_CANNOT_REMOVE_LAST_ADMIN]: 'Er moet minimaal 1 admin blijven',
  [AUTHZ_ERRORS.AUTHZ_VAULT_ACCESS_DENIED]: 'Geen toegang tot de Vault',
  [AUTHZ_ERRORS.AUTHZ_VAULT_DEPARTMENT_MISMATCH]: 'Dit Vault item hoort bij een andere afdeling',

  // VALIDATION
  [VALIDATION_ERRORS.VAL_INVALID_INPUT]: 'Ongeldige invoer',
  [VALIDATION_ERRORS.VAL_REQUIRED_FIELD]: 'Dit veld is verplicht',
  [VALIDATION_ERRORS.VAL_INVALID_FORMAT]: 'Ongeldig formaat',
  [VALIDATION_ERRORS.VAL_VALUE_OUT_OF_RANGE]: 'Waarde buiten toegestane bereik',
  [VALIDATION_ERRORS.VAL_INVALID_DATE_RANGE]: 'Ongeldige datumbereik',
  [VALIDATION_ERRORS.VAL_END_BEFORE_START]: 'Einddatum moet na startdatum liggen',
  [VALIDATION_ERRORS.VAL_NEGATIVE_DURATION]: 'Duur mag niet negatief zijn',
  [VALIDATION_ERRORS.VAL_INVALID_PERCENT]: 'Percentage moet tussen 0 en 100 liggen',
  [VALIDATION_ERRORS.VAL_INVALID_CONSTRAINT]: 'Ongeldige constraint configuratie',
  [VALIDATION_ERRORS.VAL_CIRCULAR_PARENT]: 'Een taak kan geen kind van zichzelf zijn',
  [VALIDATION_ERRORS.VAL_SELF_DEPENDENCY]: 'Een taak kan geen afhankelijkheid van zichzelf hebben',
  [VALIDATION_ERRORS.VAL_CIRCULAR_DEPENDENCY]: 'Circulaire afhankelijkheid gedetecteerd',
  [VALIDATION_ERRORS.VAL_DUPLICATE_DEPENDENCY]: 'Deze afhankelijkheid bestaat al',
  [VALIDATION_ERRORS.VAL_INVALID_DEPENDENCY_TYPE]: 'Ongeldig afhankelijkheidstype',
  [VALIDATION_ERRORS.VAL_INVALID_UNITS]: 'Ongeldige toewijzingspercentage',
  [VALIDATION_ERRORS.VAL_RESOURCE_OVERALLOCATED]: 'Resource is overbelast',
  [VALIDATION_ERRORS.VAL_INVALID_PROJECT_STATUS]: 'Ongeldige projectstatus',
  [VALIDATION_ERRORS.VAL_INVALID_PROJECT_DATES]: 'Ongeldige projectdatums',

  // RESOURCE
  [RESOURCE_ERRORS.RES_NOT_FOUND]: 'Resource niet gevonden',
  [RESOURCE_ERRORS.RES_WORKSPACE_NOT_FOUND]: 'Workspace niet gevonden',
  [RESOURCE_ERRORS.RES_PROJECT_NOT_FOUND]: 'Project niet gevonden',
  [RESOURCE_ERRORS.RES_TASK_NOT_FOUND]: 'Taak niet gevonden',
  [RESOURCE_ERRORS.RES_RESOURCE_NOT_FOUND]: 'Resource niet gevonden',
  [RESOURCE_ERRORS.RES_DEPENDENCY_NOT_FOUND]: 'Afhankelijkheid niet gevonden',
  [RESOURCE_ERRORS.RES_ASSIGNMENT_NOT_FOUND]: 'Toewijzing niet gevonden',
  [RESOURCE_ERRORS.RES_VAULT_ITEM_NOT_FOUND]: 'Vault item niet gevonden',
  [RESOURCE_ERRORS.RES_USER_NOT_FOUND]: 'Gebruiker niet gevonden',
  [RESOURCE_ERRORS.RES_ALREADY_EXISTS]: 'Resource bestaat al',
  [RESOURCE_ERRORS.RES_DUPLICATE_SLUG]: 'Deze slug is al in gebruik',
  [RESOURCE_ERRORS.RES_DUPLICATE_CODE]: 'Deze code is al in gebruik',
  [RESOURCE_ERRORS.RES_ARCHIVED]: 'Resource is gearchiveerd',
  [RESOURCE_ERRORS.RES_DELETED]: 'Resource is verwijderd',
  [RESOURCE_ERRORS.RES_LOCKED]: 'Resource is vergrendeld',
  [RESOURCE_ERRORS.RES_IN_USE]: 'Resource is nog in gebruik',

  // SYNC
  [SYNC_ERRORS.SYNC_FAILED]: 'Synchronisatie mislukt',
  [SYNC_ERRORS.SYNC_TIMEOUT]: 'Synchronisatie timeout',
  [SYNC_ERRORS.SYNC_CONFLICT]: 'Synchronisatieconflict gedetecteerd',
  [SYNC_ERRORS.SYNC_REVISION_MISMATCH]: 'Data is gewijzigd door een andere gebruiker',
  [SYNC_ERRORS.SYNC_STALE_DATA]: 'Data is verouderd, vernieuw de pagina',
  [SYNC_ERRORS.SYNC_INVALID_PAYLOAD]: 'Ongeldige synchronisatiedata',
  [SYNC_ERRORS.SYNC_MISSING_PROJECT]: 'Project ontbreekt in synchronisatie',
  [SYNC_ERRORS.SYNC_PARTIAL_FAILURE]: 'Synchronisatie deels mislukt',
  [SYNC_ERRORS.SYNC_CONNECTION_LOST]: 'Verbinding verloren',
  [SYNC_ERRORS.SYNC_SERVER_UNAVAILABLE]: 'Server niet bereikbaar',

  // EXPORT
  [EXPORT_ERRORS.EXP_FAILED]: 'Export mislukt',
  [EXPORT_ERRORS.EXP_UNSUPPORTED_FORMAT]: 'Export formaat niet ondersteund',
  [EXPORT_ERRORS.EXP_TIMEOUT]: 'Export timeout',
  [EXPORT_ERRORS.EXP_PDF_GENERATION_FAILED]: 'PDF generatie mislukt',
  [EXPORT_ERRORS.EXP_PDF_TOO_LARGE]: 'PDF te groot, probeer een kleiner bereik',
  [EXPORT_ERRORS.EXP_EXCEL_GENERATION_FAILED]: 'Excel generatie mislukt',
  [EXPORT_ERRORS.EXP_EXCEL_TOO_MANY_ROWS]: 'Te veel rijen voor Excel export',
  [EXPORT_ERRORS.EXP_MSP_GENERATION_FAILED]: 'MS Project export mislukt',
  [EXPORT_ERRORS.EXP_MSP_INVALID_DATA]: 'Ongeldige data voor MS Project',
  [EXPORT_ERRORS.EXP_UPLOAD_FAILED]: 'Upload van exportbestand mislukt',
  [EXPORT_ERRORS.EXP_DOWNLOAD_EXPIRED]: 'Download link is verlopen',

  // SERVER
  [SERVER_ERRORS.SRV_INTERNAL_ERROR]: 'Interne serverfout',
  [SERVER_ERRORS.SRV_DATABASE_ERROR]: 'Database fout',
  [SERVER_ERRORS.SRV_SERVICE_UNAVAILABLE]: 'Service tijdelijk niet beschikbaar',
  [SERVER_ERRORS.SRV_CONFIGURATION_ERROR]: 'Configuratiefout',
  [SERVER_ERRORS.SRV_EXTERNAL_SERVICE_ERROR]: 'Externe service fout',
  [SERVER_ERRORS.SRV_MAINTENANCE_MODE]: 'Systeem in onderhoudsmodus',

  // RATE LIMIT
  [RATE_LIMIT_ERRORS.RATE_LIMIT_EXCEEDED]: 'Rate limit overschreden',
  [RATE_LIMIT_ERRORS.RATE_TOO_MANY_REQUESTS]: 'Te veel verzoeken, probeer later opnieuw',
  [RATE_LIMIT_ERRORS.RATE_QUOTA_EXCEEDED]: 'Quota overschreden',
};

/**
 * Error factory helper
 */
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number = 400,
    public details?: Record<string, unknown>,
    public field?: string
  ) {
    super(ERROR_MESSAGES[code] || 'Onbekende fout');
    this.name = 'ApiError';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      field: this.field,
    };
  }
}

/**
 * HTTP status code mapping
 */
export const ERROR_STATUS_CODES: Record<string, number> = {
  AUTH: 401,
  AUTHZ: 403,
  VAL: 400,
  RES: 404,
  SYNC: 409,
  EXP: 500,
  IMP: 400,
  SRV: 500,
  RATE: 429,
};
```

---

## Appendix: Quick Reference

### A. Bryntum Field Mapping

| Onze Database | Bryntum Model | Notes |
|---------------|---------------|-------|
| `from_task` | `fromEvent` | Dependency source |
| `to_task` | `toEvent` | Dependency target |
| `task_id` | `event` | Assignment event ref |
| `resource_id` | `resource` | Assignment resource ref |
| `parent_id` | `parentId` | Task hierarchy |
| `calendar_id` | `calendar` | Calendar reference |

### B. Duration Unit Mapping

| Database | Bryntum | Description |
|----------|---------|-------------|
| `day` / `d` | `day` | Werkdagen |
| `hour` / `h` | `hour` | Uren |
| `week` / `w` | `week` | Weken |
| `month` / `mo` | `month` | Maanden |

### C. Common API Response Patterns

```typescript
// Success response
{
  success: true,
  data: { /* entity */ },
  meta: { timestamp: "...", request_id: "..." }
}

// Error response
{
  success: false,
  data: null,
  error: {
    code: "RES_004",
    message: "Taak niet gevonden",
    field: "task_id"
  }
}

// List response
{
  success: true,
  data: {
    items: [ /* entities */ ],
    pagination: { page: 1, per_page: 20, total: 100 }
  }
}
```

---

**Document Versie:** 1.0.0
**Laatste Update:** 2024-12-30
**Auteur:** Agent A1 (Architect)
