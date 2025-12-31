-- ============================================================================
-- 005_indexes.sql
-- Foreign key indexes and query optimization indexes
-- ============================================================================

-- ============================================================================
-- PROFILES INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_email ON profiles (email);
CREATE INDEX idx_profiles_is_active ON profiles (is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_last_seen ON profiles (last_seen_at DESC);

-- ============================================================================
-- WORKSPACES INDEXES
-- ============================================================================

CREATE INDEX idx_workspaces_owner ON workspaces (owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces (slug);
CREATE INDEX idx_workspaces_is_active ON workspaces (is_active) WHERE is_active = true;
CREATE INDEX idx_workspaces_created_at ON workspaces (created_at DESC);

-- ============================================================================
-- WORKSPACE_MEMBERS INDEXES
-- ============================================================================

-- Composite index for common lookup
CREATE INDEX idx_workspace_members_workspace_user ON workspace_members (workspace_id, user_id);
CREATE INDEX idx_workspace_members_user ON workspace_members (user_id);
CREATE INDEX idx_workspace_members_role ON workspace_members (workspace_id, role);
CREATE INDEX idx_workspace_members_active ON workspace_members (workspace_id, is_active) WHERE is_active = true;

-- ============================================================================
-- WORKSPACE_INVITES INDEXES
-- ============================================================================

CREATE INDEX idx_workspace_invites_workspace ON workspace_invites (workspace_id);
CREATE INDEX idx_workspace_invites_email ON workspace_invites (email);
CREATE INDEX idx_workspace_invites_token ON workspace_invites (token);
CREATE INDEX idx_workspace_invites_status ON workspace_invites (status) WHERE status = 'pending';
CREATE INDEX idx_workspace_invites_expires ON workspace_invites (expires_at) WHERE status = 'pending';

-- ============================================================================
-- PROJECTS INDEXES
-- ============================================================================

CREATE INDEX idx_projects_workspace ON projects (workspace_id);
CREATE INDEX idx_projects_manager ON projects (manager_id);
CREATE INDEX idx_projects_status ON projects (workspace_id, status);
CREATE INDEX idx_projects_client_visible ON projects (workspace_id, client_visible) WHERE client_visible = true;
CREATE INDEX idx_projects_is_template ON projects (workspace_id, is_template) WHERE is_template = true;
CREATE INDEX idx_projects_is_archived ON projects (workspace_id, is_archived);
CREATE INDEX idx_projects_created_at ON projects (workspace_id, created_at DESC);
CREATE INDEX idx_projects_deadline ON projects (deadline) WHERE deadline IS NOT NULL;

-- Full text search on project name
CREATE INDEX idx_projects_name_search ON projects USING gin(to_tsvector('dutch', name));

-- ============================================================================
-- PROJECT_MEMBERS INDEXES
-- ============================================================================

CREATE INDEX idx_project_members_project ON project_members (project_id);
CREATE INDEX idx_project_members_user ON project_members (user_id);
CREATE INDEX idx_project_members_project_user ON project_members (project_id, user_id);

-- ============================================================================
-- CALENDARS INDEXES
-- ============================================================================

CREATE INDEX idx_calendars_workspace ON calendars (workspace_id);
CREATE INDEX idx_calendars_project ON calendars (project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_calendars_default ON calendars (workspace_id, is_default) WHERE is_default = true;

-- ============================================================================
-- CALENDAR_EXCEPTIONS INDEXES
-- ============================================================================

CREATE INDEX idx_calendar_exceptions_calendar ON calendar_exceptions (calendar_id);
CREATE INDEX idx_calendar_exceptions_date ON calendar_exceptions (calendar_id, date);
CREATE INDEX idx_calendar_exceptions_recurring ON calendar_exceptions (calendar_id, is_recurring) WHERE is_recurring = true;

-- ============================================================================
-- TASKS INDEXES
-- ============================================================================

-- Foreign keys
CREATE INDEX idx_tasks_project ON tasks (project_id);
CREATE INDEX idx_tasks_parent ON tasks (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_tasks_calendar ON tasks (calendar_id) WHERE calendar_id IS NOT NULL;
CREATE INDEX idx_tasks_created_by ON tasks (created_by);

-- Common query patterns
CREATE INDEX idx_tasks_project_parent ON tasks (project_id, parent_id);
CREATE INDEX idx_tasks_project_ordinal ON tasks (project_id, ordinal_position);
CREATE INDEX idx_tasks_milestone ON tasks (project_id, milestone) WHERE milestone = true;
CREATE INDEX idx_tasks_critical ON tasks (project_id, critical) WHERE critical = true;
CREATE INDEX idx_tasks_dates ON tasks (project_id, start_date, end_date);
CREATE INDEX idx_tasks_deadline ON tasks (project_id, deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_tasks_progress ON tasks (project_id, percent_done);
CREATE INDEX idx_tasks_is_active ON tasks (project_id, is_active) WHERE is_active = true;

-- WBS ordering
CREATE INDEX idx_tasks_wbs ON tasks (project_id, wbs);

-- Full text search on task name
CREATE INDEX idx_tasks_name_search ON tasks USING gin(to_tsvector('dutch', name));

-- JSONB custom fields
CREATE INDEX idx_tasks_custom_fields ON tasks USING gin(custom_fields);

-- ============================================================================
-- DEPENDENCIES INDEXES
-- ============================================================================

CREATE INDEX idx_dependencies_project ON dependencies (project_id);
CREATE INDEX idx_dependencies_from ON dependencies (from_task);
CREATE INDEX idx_dependencies_to ON dependencies (to_task);
CREATE INDEX idx_dependencies_from_to ON dependencies (from_task, to_task);
CREATE INDEX idx_dependencies_type ON dependencies (project_id, type);
CREATE INDEX idx_dependencies_active ON dependencies (project_id, active) WHERE active = true;

-- ============================================================================
-- RESOURCES INDEXES
-- ============================================================================

CREATE INDEX idx_resources_workspace ON resources (workspace_id);
CREATE INDEX idx_resources_user ON resources (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_resources_calendar ON resources (calendar_id) WHERE calendar_id IS NOT NULL;
CREATE INDEX idx_resources_type ON resources (workspace_id, type);
CREATE INDEX idx_resources_active ON resources (workspace_id, is_active) WHERE is_active = true;

-- Full text search on resource name
CREATE INDEX idx_resources_name_search ON resources USING gin(to_tsvector('dutch', name));

-- ============================================================================
-- ASSIGNMENTS INDEXES
-- ============================================================================

CREATE INDEX idx_assignments_project ON assignments (project_id);
CREATE INDEX idx_assignments_task ON assignments (task_id);
CREATE INDEX idx_assignments_resource ON assignments (resource_id);
CREATE INDEX idx_assignments_task_resource ON assignments (task_id, resource_id);

-- ============================================================================
-- BASELINES INDEXES
-- ============================================================================

CREATE INDEX idx_baselines_project ON baselines (project_id);
CREATE INDEX idx_baselines_active ON baselines (project_id, is_active) WHERE is_active = true;
CREATE INDEX idx_baselines_number ON baselines (project_id, baseline_number);

-- ============================================================================
-- BASELINE_TASKS INDEXES
-- ============================================================================

CREATE INDEX idx_baseline_tasks_baseline ON baseline_tasks (baseline_id);
CREATE INDEX idx_baseline_tasks_task ON baseline_tasks (task_id);

-- ============================================================================
-- TIME_RANGES INDEXES
-- ============================================================================

CREATE INDEX idx_time_ranges_project ON time_ranges (project_id);
CREATE INDEX idx_time_ranges_dates ON time_ranges (project_id, start_date, end_date);

-- ============================================================================
-- VAULT_ITEMS INDEXES
-- ============================================================================

CREATE INDEX idx_vault_items_workspace ON vault_items (workspace_id);
CREATE INDEX idx_vault_items_project ON vault_items (project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_vault_items_created_by ON vault_items (created_by);
CREATE INDEX idx_vault_items_assigned ON vault_items (assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_vault_items_related_task ON vault_items (related_task_id) WHERE related_task_id IS NOT NULL;

-- Status and priority queries
CREATE INDEX idx_vault_items_status ON vault_items (workspace_id, status);
CREATE INDEX idx_vault_items_priority ON vault_items (workspace_id, priority);
CREATE INDEX idx_vault_items_type ON vault_items (workspace_id, type);

-- Due dates and reminders
CREATE INDEX idx_vault_items_due ON vault_items (due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_vault_items_reminder ON vault_items (reminder_date) WHERE reminder_date IS NOT NULL AND reminder_sent = false;
CREATE INDEX idx_vault_items_expires ON vault_items (expires_at) WHERE expires_at IS NOT NULL;

-- Visibility
CREATE INDEX idx_vault_items_private ON vault_items (workspace_id, is_private);
CREATE INDEX idx_vault_items_visible_to ON vault_items USING gin(visible_to) WHERE is_private = true;
CREATE INDEX idx_vault_items_archived ON vault_items (workspace_id, is_archived);
CREATE INDEX idx_vault_items_pinned ON vault_items (workspace_id, pinned) WHERE pinned = true;

-- Tags
CREATE INDEX idx_vault_items_tags ON vault_items USING gin(tags);

-- Full text search
CREATE INDEX idx_vault_items_title_search ON vault_items USING gin(to_tsvector('dutch', title));
CREATE INDEX idx_vault_items_content_search ON vault_items USING gin(to_tsvector('dutch', coalesce(content, '')));

-- ============================================================================
-- VAULT_ITEM_ATTACHMENTS INDEXES
-- ============================================================================

CREATE INDEX idx_vault_attachments_item ON vault_item_attachments (vault_item_id);

-- ============================================================================
-- VAULT_ITEM_COMMENTS INDEXES
-- ============================================================================

CREATE INDEX idx_vault_comments_item ON vault_item_comments (vault_item_id);
CREATE INDEX idx_vault_comments_author ON vault_item_comments (author_id);
CREATE INDEX idx_vault_comments_parent ON vault_item_comments (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_vault_comments_mentions ON vault_item_comments USING gin(mentions) WHERE mentions != '{}';
CREATE INDEX idx_vault_comments_created ON vault_item_comments (vault_item_id, created_at DESC);

-- ============================================================================
-- EXPORT_LOGS INDEXES
-- ============================================================================

CREATE INDEX idx_export_logs_workspace ON export_logs (workspace_id);
CREATE INDEX idx_export_logs_project ON export_logs (project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_export_logs_user ON export_logs (requested_by);
CREATE INDEX idx_export_logs_status ON export_logs (status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_export_logs_expires ON export_logs (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_export_logs_created ON export_logs (created_at DESC);

-- ============================================================================
-- USER_PREFERENCES INDEXES
-- ============================================================================

CREATE INDEX idx_user_preferences_user ON user_preferences (user_id);
CREATE INDEX idx_user_preferences_user_workspace ON user_preferences (user_id, workspace_id);

-- ============================================================================
-- TASKBOARD_COLUMNS INDEXES
-- ============================================================================

CREATE INDEX idx_taskboard_columns_workspace ON taskboard_columns (workspace_id);
CREATE INDEX idx_taskboard_columns_project ON taskboard_columns (project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_taskboard_columns_order ON taskboard_columns (workspace_id, sort_order);
CREATE INDEX idx_taskboard_columns_visible ON taskboard_columns (workspace_id, is_visible) WHERE is_visible = true;

-- ============================================================================
-- ACTIVITY_LOG INDEXES
-- Already defined in 003, but adding more
-- ============================================================================

CREATE INDEX idx_activity_log_workspace ON activity_log (workspace_id);
CREATE INDEX idx_activity_log_action ON activity_log (workspace_id, action);
CREATE INDEX idx_activity_log_entity_type_date ON activity_log (entity_type, created_at DESC);

-- ============================================================================
-- NOTIFICATIONS INDEXES
-- ============================================================================

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_unread ON notifications (user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications (user_id, type);
CREATE INDEX idx_notifications_entity ON notifications (entity_type, entity_id);
CREATE INDEX idx_notifications_group ON notifications (user_id, group_key) WHERE group_key IS NOT NULL;
CREATE INDEX idx_notifications_created ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_expires ON notifications (expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- SAVED_FILTERS INDEXES
-- ============================================================================

CREATE INDEX idx_saved_filters_workspace ON saved_filters (workspace_id);
CREATE INDEX idx_saved_filters_user ON saved_filters (user_id);
CREATE INDEX idx_saved_filters_shared ON saved_filters (workspace_id, is_shared) WHERE is_shared = true;
CREATE INDEX idx_saved_filters_entity ON saved_filters (workspace_id, entity_type);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Dashboard: Get active projects with progress for workspace
CREATE INDEX idx_projects_dashboard ON projects (workspace_id, status, progress)
    WHERE is_archived = false AND status IN ('active', 'on_hold');

-- Task list: Get tasks for project with common filters
CREATE INDEX idx_tasks_list ON tasks (project_id, percent_done, start_date, is_active)
    WHERE is_active = true;

-- Vault dashboard: Get pending/active items for workspace
CREATE INDEX idx_vault_dashboard ON vault_items (workspace_id, status, priority, due_date)
    WHERE is_archived = false AND status IN ('pending', 'in_progress');

-- Resource utilization: Get active resources with assignments
CREATE INDEX idx_resources_utilization ON resources (workspace_id, type, is_active)
    WHERE is_active = true;
