/**
 * Supabase Database Types
 * Generated from entities.ts for type-safe database operations
 */

// String literal types for database (Supabase uses strings, not enums)
type WorkspaceRoleDB = 'admin' | 'vault_medewerker' | 'medewerker' | 'klant_editor' | 'klant_viewer'
type WorkspaceTypeDB = 'afdeling' | 'klant'
type ProjectStatusDB = 'draft' | 'active' | 'on_hold' | 'completed' | 'archived' | 'cancelled'
type VaultStatusDB = 'input' | 'processing' | 'done' | 'rejected'
type InviteStatusDB = 'pending' | 'accepted' | 'expired' | 'cancelled'
type ResourceTypeDB = 'human' | 'material' | 'equipment'
type DependencyTypeDB = 0 | 1 | 2 | 3
type ConstraintTypeDB = 'assoonaspossible' | 'aslateaspossible' | 'muststarton' | 'mustfinishon' | 'startnoearlierthan' | 'startnolaterthan' | 'finishnoearlierthan' | 'finishnolaterthan'
type SchedulingModeDB = 'Normal' | 'FixedDuration' | 'FixedEffort' | 'FixedUnits'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          job_title: string | null
          timezone: string | null
          locale: string | null
          last_login_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          job_title?: string | null
          timezone?: string | null
          locale?: string | null
          last_login_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          job_title?: string | null
          timezone?: string | null
          locale?: string | null
          last_login_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          type: WorkspaceTypeDB
          description: string | null
          logo_url: string | null
          settings: Json | null
          created_by: string
          is_archived: boolean
          archived_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: WorkspaceTypeDB
          description?: string | null
          logo_url?: string | null
          settings?: Json | null
          created_by: string
          is_archived?: boolean
          archived_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: WorkspaceTypeDB
          description?: string | null
          logo_url?: string | null
          settings?: Json | null
          created_by?: string
          is_archived?: boolean
          archived_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: WorkspaceRoleDB
          invited_by: string
          joined_at: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role: WorkspaceRoleDB
          invited_by: string
          joined_at?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: WorkspaceRoleDB
          invited_by?: string
          joined_at?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      workspace_invites: {
        Row: {
          id: string
          workspace_id: string
          email: string
          role: WorkspaceRoleDB
          invited_by: string
          status: InviteStatusDB
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          email: string
          role: WorkspaceRoleDB
          invited_by: string
          status?: InviteStatusDB
          token: string
          expires_at: string
          accepted_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string
          role?: WorkspaceRoleDB
          invited_by?: string
          status?: InviteStatusDB
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          workspace_id: string
          name: string
          description: string | null
          status: ProjectStatusDB
          start_date: string | null
          end_date: string | null
          calendar_id: string | null
          settings: Json | null
          created_by: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          description?: string | null
          status?: ProjectStatusDB
          start_date?: string | null
          end_date?: string | null
          calendar_id?: string | null
          settings?: Json | null
          created_by: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          description?: string | null
          status?: ProjectStatusDB
          start_date?: string | null
          end_date?: string | null
          calendar_id?: string | null
          settings?: Json | null
          created_by?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          parent_id: string | null
          name: string
          start_date: string | null
          end_date: string | null
          duration: number | null
          duration_unit: string | null
          percent_done: number
          effort: number | null
          effort_unit: string | null
          note: string | null
          constraint_type: ConstraintTypeDB
          constraint_date: string | null
          scheduling_mode: SchedulingModeDB
          manually_scheduled: boolean
          rollup: boolean
          show_in_timeline: boolean
          inactive: boolean
          cls: string | null
          icon_cls: string | null
          order_index: number
          wbs_code: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          parent_id?: string | null
          name: string
          start_date?: string | null
          end_date?: string | null
          duration?: number | null
          duration_unit?: string | null
          percent_done?: number
          effort?: number | null
          effort_unit?: string | null
          note?: string | null
          constraint_type?: ConstraintTypeDB
          constraint_date?: string | null
          scheduling_mode?: SchedulingModeDB
          manually_scheduled?: boolean
          rollup?: boolean
          show_in_timeline?: boolean
          inactive?: boolean
          cls?: string | null
          icon_cls?: string | null
          order_index?: number
          wbs_code?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          parent_id?: string | null
          name?: string
          start_date?: string | null
          end_date?: string | null
          duration?: number | null
          duration_unit?: string | null
          percent_done?: number
          effort?: number | null
          effort_unit?: string | null
          note?: string | null
          constraint_type?: ConstraintTypeDB
          constraint_date?: string | null
          scheduling_mode?: SchedulingModeDB
          manually_scheduled?: boolean
          rollup?: boolean
          show_in_timeline?: boolean
          inactive?: boolean
          cls?: string | null
          icon_cls?: string | null
          order_index?: number
          wbs_code?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      dependencies: {
        Row: {
          id: string
          project_id: string
          from_task: string
          to_task: string
          type: DependencyTypeDB
          lag: number
          lag_unit: string
          cls: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          from_task: string
          to_task: string
          type?: DependencyTypeDB
          lag?: number
          lag_unit?: string
          cls?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          from_task?: string
          to_task?: string
          type?: DependencyTypeDB
          lag?: number
          lag_unit?: string
          cls?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      resources: {
        Row: {
          id: string
          project_id: string
          name: string
          type: ResourceTypeDB
          calendar_id: string | null
          image: string | null
          capacity: number
          cost_per_hour: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          type?: ResourceTypeDB
          calendar_id?: string | null
          image?: string | null
          capacity?: number
          cost_per_hour?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          type?: ResourceTypeDB
          calendar_id?: string | null
          image?: string | null
          capacity?: number
          cost_per_hour?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      assignments: {
        Row: {
          id: string
          project_id: string
          task_id: string
          resource_id: string
          units: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          task_id: string
          resource_id: string
          units?: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          task_id?: string
          resource_id?: string
          units?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      calendars: {
        Row: {
          id: string
          project_id: string
          name: string
          is_default: boolean
          intervals: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          is_default?: boolean
          intervals?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          is_default?: boolean
          intervals?: Json | null
          created_at?: string
          updated_at?: string | null
        }
      }
      baselines: {
        Row: {
          id: string
          project_id: string
          name: string
          created_by: string
          snapshot: Json
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          created_by: string
          snapshot: Json
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          created_by?: string
          snapshot?: Json
          created_at?: string
          updated_at?: string | null
        }
      }
      vault_items: {
        Row: {
          id: string
          workspace_id: string
          project_id: string | null
          source_data: Json
          status: VaultStatusDB
          processing_notes: string | null
          processed_by: string | null
          processed_at: string | null
          done_at: string | null
          expires_at: string | null
          exported_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          project_id?: string | null
          source_data: Json
          status?: VaultStatusDB
          processing_notes?: string | null
          processed_by?: string | null
          processed_at?: string | null
          done_at?: string | null
          expires_at?: string | null
          exported_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          project_id?: string | null
          source_data?: Json
          status?: VaultStatusDB
          processing_notes?: string | null
          processed_by?: string | null
          processed_at?: string | null
          done_at?: string | null
          expires_at?: string | null
          exported_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      export_logs: {
        Row: {
          id: string
          user_id: string
          project_id: string
          format: 'pdf' | 'excel' | 'csv' | 'image'
          options: Json | null
          file_url: string | null
          file_size: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          format: 'pdf' | 'excel' | 'csv' | 'image'
          options?: Json | null
          file_url?: string | null
          file_size?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          format?: 'pdf' | 'excel' | 'csv' | 'image'
          options?: Json | null
          file_url?: string | null
          file_size?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark' | 'system'
          locale: string
          default_view: 'gantt' | 'calendar' | 'taskboard' | 'grid'
          sidebar_collapsed: boolean
          recent_workspaces: string[]
          settings: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          locale?: string
          default_view?: 'gantt' | 'calendar' | 'taskboard' | 'grid'
          sidebar_collapsed?: boolean
          recent_workspaces?: string[]
          settings?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          locale?: string
          default_view?: 'gantt' | 'calendar' | 'taskboard' | 'grid'
          sidebar_collapsed?: boolean
          recent_workspaces?: string[]
          settings?: Json | null
          created_at?: string
          updated_at?: string | null
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          workspace_id: string
          action: string
          entity_type: string
          entity_id: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          workspace_id: string
          action: string
          entity_type: string
          entity_id: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          workspace_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          details?: Json | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          workspace_id: string | null
          type: string
          title: string
          message: string | null
          link: string | null
          read: boolean
          read_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          workspace_id?: string | null
          type: string
          title: string
          message?: string | null
          link?: string | null
          read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workspace_id?: string | null
          type?: string
          title?: string
          message?: string | null
          link?: string | null
          read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      workspace_role: WorkspaceRoleDB
      workspace_type: WorkspaceTypeDB
      project_status: ProjectStatusDB
      vault_status: VaultStatusDB
      invite_status: InviteStatusDB
      resource_type: ResourceTypeDB
      dependency_type: DependencyTypeDB
      constraint_type: ConstraintTypeDB
      scheduling_mode: SchedulingModeDB
    }
  }
}
