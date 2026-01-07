-- ============================================================================
-- 001_core_tables.sql
-- Core tables for Gantt Dashboard: profiles, workspaces, members, invites, projects
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Workspace roles enum
CREATE TYPE workspace_role AS ENUM (
    'admin',           -- Full access to workspace and all projects
    'vault_medewerker', -- Can manage vault items and view all projects
    'medewerker',      -- Can edit assigned projects
    'klant_editor',    -- External client with edit access to specific projects
    'klant_viewer'     -- External client with view-only access
);

-- Invite status enum
CREATE TYPE invite_status AS ENUM (
    'pending',
    'accepted',
    'declined',
    'expired'
);

-- Project status enum
CREATE TYPE project_status AS ENUM (
    'draft',
    'active',
    'on_hold',
    'completed',
    'archived'
);

-- ============================================================================
-- PROFILES TABLE
-- Extended user profile linked to Supabase auth.users
-- ============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    job_title TEXT,
    department TEXT,
    timezone TEXT DEFAULT 'Europe/Amsterdam',
    locale TEXT DEFAULT 'nl-NL',
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE profiles IS 'Extended user profiles linked to Supabase auth';
COMMENT ON COLUMN profiles.metadata IS 'Flexible JSON field for additional user data';

-- ============================================================================
-- WORKSPACES TABLE
-- Multi-tenant workspaces for departments and clients
-- ============================================================================

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,

    -- Workspace settings
    settings JSONB DEFAULT '{
        "default_calendar": "standard",
        "working_hours": {"start": "09:00", "end": "17:00"},
        "working_days": [1, 2, 3, 4, 5],
        "default_task_duration": 8,
        "allow_weekend_work": false
    }',

    -- Subscription/limits
    max_members INTEGER DEFAULT 10,
    max_projects INTEGER DEFAULT 50,
    storage_limit_mb INTEGER DEFAULT 5120,

    -- Status
    is_active BOOLEAN DEFAULT true,
    suspended_at TIMESTAMPTZ,
    suspended_reason TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT workspace_slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$')
);

COMMENT ON TABLE workspaces IS 'Multi-tenant workspaces for organizing projects';
COMMENT ON COLUMN workspaces.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN workspaces.settings IS 'Workspace-wide configuration settings';

-- ============================================================================
-- WORKSPACE_MEMBERS TABLE
-- Junction table linking users to workspaces with roles
-- ============================================================================

CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role workspace_role NOT NULL DEFAULT 'medewerker',

    -- Member settings
    can_create_projects BOOLEAN DEFAULT false,
    can_invite_members BOOLEAN DEFAULT false,
    can_manage_vault BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{
        "email_digest": "daily",
        "task_assigned": true,
        "task_completed": true,
        "project_updates": true,
        "mentions": true
    }',

    -- Status
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deactivated_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_workspace_member UNIQUE (workspace_id, user_id)
);

COMMENT ON TABLE workspace_members IS 'Links users to workspaces with their roles and permissions';

-- ============================================================================
-- WORKSPACE_INVITES TABLE
-- Pending invitations to join workspaces
-- ============================================================================

CREATE TABLE workspace_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    -- Invite details
    email TEXT NOT NULL,
    role workspace_role NOT NULL DEFAULT 'medewerker',
    invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,

    -- Token for invite link
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),

    -- Status tracking
    status invite_status DEFAULT 'pending' NOT NULL,
    message TEXT,

    -- Expiration
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE workspace_invites IS 'Pending invitations for users to join workspaces';
COMMENT ON COLUMN workspace_invites.token IS 'Secure token for invite URL';

-- ============================================================================
-- PROJECTS TABLE
-- Projects within workspaces containing Gantt data
-- ============================================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    -- Basic info
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',

    -- Project timeline
    start_date DATE,
    end_date DATE,
    deadline DATE,

    -- Status and progress
    status project_status DEFAULT 'draft' NOT NULL,
    progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

    -- Project manager
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Settings
    settings JSONB DEFAULT '{
        "calendar_id": null,
        "auto_scheduling": true,
        "critical_path_enabled": true,
        "show_weekends": false,
        "time_unit": "day",
        "hours_per_day": 8,
        "days_per_week": 5,
        "default_constraint": "ASAP"
    }',

    -- Client access (for klant_editor/klant_viewer)
    client_visible BOOLEAN DEFAULT false,
    client_notes TEXT,

    -- Bryntum specific
    gantt_config JSONB DEFAULT '{}',

    -- Status
    is_template BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMPTZ,
    archived_by UUID REFERENCES profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE projects IS 'Projects containing Gantt charts and task data';
COMMENT ON COLUMN projects.code IS 'Short project code for reference (e.g., PRJ-001)';
COMMENT ON COLUMN projects.gantt_config IS 'Bryntum Gantt specific configuration';
COMMENT ON COLUMN projects.client_visible IS 'Whether project is visible to client roles';

-- ============================================================================
-- PROJECT_MEMBERS TABLE
-- Fine-grained project access control
-- ============================================================================

CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Access level
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_manage_members BOOLEAN DEFAULT false,
    can_export BOOLEAN DEFAULT true,

    -- Notification settings
    notify_on_changes BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    added_by UUID REFERENCES profiles(id),

    CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

COMMENT ON TABLE project_members IS 'Fine-grained access control for specific projects';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate unique project code
CREATE OR REPLACE FUNCTION generate_project_code(workspace_id UUID)
RETURNS TEXT AS $$
DECLARE
    workspace_slug TEXT;
    next_num INTEGER;
    new_code TEXT;
BEGIN
    -- Get workspace slug
    SELECT slug INTO workspace_slug FROM workspaces WHERE id = workspace_id;

    -- Get next project number for this workspace
    SELECT COALESCE(MAX(
        CAST(NULLIF(regexp_replace(code, '[^0-9]', '', 'g'), '') AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM projects
    WHERE projects.workspace_id = generate_project_code.workspace_id;

    -- Generate code
    new_code := UPPER(LEFT(workspace_slug, 3)) || '-' || LPAD(next_num::TEXT, 3, '0');

    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to check workspace membership
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = ws_id
        AND user_id = user_uuid
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in workspace
CREATE OR REPLACE FUNCTION get_workspace_role(ws_id UUID, user_uuid UUID)
RETURNS workspace_role AS $$
DECLARE
    user_role workspace_role;
BEGIN
    SELECT role INTO user_role
    FROM workspace_members
    WHERE workspace_id = ws_id
    AND user_id = user_uuid
    AND is_active = true;

    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is workspace admin
CREATE OR REPLACE FUNCTION is_workspace_admin(ws_id UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = ws_id
        AND user_id = user_uuid
        AND role = 'admin'
        AND is_active = true
    ) OR EXISTS (
        SELECT 1 FROM workspaces
        WHERE id = ws_id
        AND owner_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check project access
CREATE OR REPLACE FUNCTION has_project_access(proj_id UUID, user_uuid UUID, required_permission TEXT DEFAULT 'view')
RETURNS BOOLEAN AS $$
DECLARE
    ws_id UUID;
    user_role workspace_role;
    is_project_member BOOLEAN;
    proj_visible BOOLEAN;
BEGIN
    -- Get project's workspace and visibility
    SELECT workspace_id, client_visible INTO ws_id, proj_visible
    FROM projects WHERE id = proj_id;

    IF ws_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Get user's workspace role
    user_role := get_workspace_role(ws_id, user_uuid);

    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Admins and vault_medewerker have full access
    IF user_role IN ('admin', 'vault_medewerker') THEN
        RETURN TRUE;
    END IF;

    -- Check if user is explicit project member
    SELECT EXISTS (
        SELECT 1 FROM project_members
        WHERE project_id = proj_id AND user_id = user_uuid
    ) INTO is_project_member;

    -- Medewerkers need explicit project membership for edit
    IF user_role = 'medewerker' THEN
        IF required_permission = 'view' THEN
            RETURN TRUE; -- Can view all workspace projects
        ELSE
            RETURN is_project_member;
        END IF;
    END IF;

    -- Client roles need project to be client_visible and explicit membership
    IF user_role IN ('klant_editor', 'klant_viewer') THEN
        IF NOT proj_visible THEN
            RETURN FALSE;
        END IF;

        IF required_permission = 'view' THEN
            RETURN is_project_member;
        ELSIF required_permission = 'edit' AND user_role = 'klant_editor' THEN
            RETURN is_project_member;
        END IF;

        RETURN FALSE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================================================
-- 002_project_tables.sql
-- Bryntum Gantt data model: tasks, dependencies, resources, assignments,
-- calendars, baselines
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Task constraint types (Bryntum compatible)
CREATE TYPE task_constraint AS ENUM (
    'ASAP',           -- As Soon As Possible
    'ALAP',           -- As Late As Possible
    'SNET',           -- Start No Earlier Than
    'SNLT',           -- Start No Later Than
    'FNET',           -- Finish No Earlier Than
    'FNLT',           -- Finish No Later Than
    'MSO',            -- Must Start On
    'MFO'             -- Must Finish On
);

-- Task scheduling mode
CREATE TYPE scheduling_mode AS ENUM (
    'Normal',
    'FixedDuration',
    'FixedEffort',
    'FixedUnits'
);

-- Dependency type (Bryntum compatible)
CREATE TYPE dependency_type AS ENUM (
    'SS',  -- Start-to-Start
    'SF',  -- Start-to-Finish
    'FS',  -- Finish-to-Start (most common)
    'FF'   -- Finish-to-Finish
);

-- Calendar day type
CREATE TYPE calendar_day_type AS ENUM (
    'working',
    'non_working',
    'holiday'
);

-- ============================================================================
-- CALENDARS TABLE
-- Working calendars for scheduling
-- ============================================================================

CREATE TABLE calendars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Calendar info
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,

    -- Standard working hours
    working_hours JSONB DEFAULT '[
        {"day": 1, "hours": [{"from": "09:00", "to": "12:00"}, {"from": "13:00", "to": "17:00"}]},
        {"day": 2, "hours": [{"from": "09:00", "to": "12:00"}, {"from": "13:00", "to": "17:00"}]},
        {"day": 3, "hours": [{"from": "09:00", "to": "12:00"}, {"from": "13:00", "to": "17:00"}]},
        {"day": 4, "hours": [{"from": "09:00", "to": "12:00"}, {"from": "13:00", "to": "17:00"}]},
        {"day": 5, "hours": [{"from": "09:00", "to": "12:00"}, {"from": "13:00", "to": "17:00"}]}
    ]',

    -- Hours per day for calculations
    hours_per_day DECIMAL(4,2) DEFAULT 8,
    days_per_week INTEGER DEFAULT 5,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE calendars IS 'Working calendars for task scheduling';
COMMENT ON COLUMN calendars.working_hours IS 'JSON array defining working hours per weekday (1=Monday)';

-- ============================================================================
-- CALENDAR_EXCEPTIONS TABLE
-- Holidays and special days
-- ============================================================================

CREATE TABLE calendar_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,

    -- Exception details
    name TEXT NOT NULL,
    date DATE NOT NULL,
    day_type calendar_day_type DEFAULT 'non_working' NOT NULL,

    -- Override hours (for partial working days)
    working_hours JSONB,

    -- Recurrence (optional)
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT, -- 'yearly', or RRULE format

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE calendar_exceptions IS 'Holidays and special calendar exceptions';

-- ============================================================================
-- TASKS TABLE
-- Tasks/activities in the Gantt chart (Bryntum compatible)
-- ============================================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Bryntum phantom ID support for sync
    phantom_id TEXT,

    -- Hierarchy
    parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    wbs TEXT, -- Work Breakdown Structure code (e.g., "1.2.3")
    ordinal_position INTEGER DEFAULT 0,

    -- Basic info
    name TEXT NOT NULL,
    note TEXT,
    color TEXT,

    -- Dates and duration (Bryntum format)
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    duration DECIMAL(10,2),
    duration_unit TEXT DEFAULT 'day' CHECK (duration_unit IN ('minute', 'hour', 'day', 'week', 'month')),

    -- Effort tracking
    effort DECIMAL(10,2),
    effort_unit TEXT DEFAULT 'hour' CHECK (effort_unit IN ('minute', 'hour', 'day', 'week', 'month')),
    effort_driven BOOLEAN DEFAULT false,

    -- Scheduling
    scheduling_mode scheduling_mode DEFAULT 'Normal',
    constraint_type task_constraint DEFAULT 'ASAP',
    constraint_date TIMESTAMPTZ,
    manually_scheduled BOOLEAN DEFAULT false,
    ignore_resource_calendar BOOLEAN DEFAULT false,

    -- Calendar override
    calendar_id UUID REFERENCES calendars(id) ON DELETE SET NULL,

    -- Progress
    percent_done DECIMAL(5,2) DEFAULT 0 CHECK (percent_done >= 0 AND percent_done <= 100),

    -- Milestones and summary
    milestone BOOLEAN DEFAULT false,
    is_summary BOOLEAN DEFAULT false,
    rollup BOOLEAN DEFAULT true,

    -- Deadlines
    deadline TIMESTAMPTZ,
    early_start_date TIMESTAMPTZ,
    early_end_date TIMESTAMPTZ,
    late_start_date TIMESTAMPTZ,
    late_end_date TIMESTAMPTZ,
    total_slack DECIMAL(10,2),
    critical BOOLEAN DEFAULT false,

    -- Display settings
    show_in_timeline BOOLEAN DEFAULT false,
    expanded BOOLEAN DEFAULT true,
    cls TEXT, -- CSS class

    -- Custom data
    custom_fields JSONB DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES profiles(id)
);

COMMENT ON TABLE tasks IS 'Bryntum Gantt compatible tasks/activities';
COMMENT ON COLUMN tasks.phantom_id IS 'Temporary ID from client before server sync';
COMMENT ON COLUMN tasks.wbs IS 'Work Breakdown Structure hierarchical code';
COMMENT ON COLUMN tasks.duration IS 'Duration in duration_unit units';
COMMENT ON COLUMN tasks.effort IS 'Total work effort in effort_unit units';
COMMENT ON COLUMN tasks.custom_fields IS 'User-defined custom fields';

-- ============================================================================
-- DEPENDENCIES TABLE
-- Task dependencies/links (Bryntum compatible)
-- ============================================================================

CREATE TABLE dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Bryntum phantom ID support
    phantom_id TEXT,

    -- Link definition
    from_task UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    to_task UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

    -- Dependency type
    type dependency_type DEFAULT 'FS' NOT NULL,

    -- Lag/Lead time
    lag DECIMAL(10,2) DEFAULT 0,
    lag_unit TEXT DEFAULT 'day' CHECK (lag_unit IN ('minute', 'hour', 'day', 'week', 'month')),

    -- Display
    cls TEXT, -- CSS class
    active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT no_self_dependency CHECK (from_task != to_task)
);

COMMENT ON TABLE dependencies IS 'Task dependencies/links for Bryntum Gantt';
COMMENT ON COLUMN dependencies.lag IS 'Lag (positive) or lead (negative) time';

-- ============================================================================
-- RESOURCES TABLE
-- People, equipment, materials that can be assigned to tasks
-- ============================================================================

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    -- Bryntum phantom ID support
    phantom_id TEXT,

    -- Resource info
    name TEXT NOT NULL,
    code TEXT,
    email TEXT,
    image_url TEXT,

    -- Type
    type TEXT DEFAULT 'user' CHECK (type IN ('user', 'equipment', 'material')),

    -- Link to user profile (for user type)
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Capacity
    calendar_id UUID REFERENCES calendars(id) ON DELETE SET NULL,
    max_units DECIMAL(5,2) DEFAULT 100 CHECK (max_units >= 0), -- 100 = 100% availability

    -- Cost rates
    hourly_rate DECIMAL(10,2),
    overtime_rate DECIMAL(10,2),
    cost_per_use DECIMAL(10,2),

    -- Display
    color TEXT,
    cls TEXT,

    -- Custom data
    custom_fields JSONB DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE resources IS 'Resources that can be assigned to tasks';
COMMENT ON COLUMN resources.max_units IS 'Maximum allocation percentage (100 = full time)';

-- ============================================================================
-- ASSIGNMENTS TABLE
-- Links tasks to resources with allocation
-- ============================================================================

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Bryntum phantom ID support
    phantom_id TEXT,

    -- Assignment
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,

    -- Allocation
    units DECIMAL(5,2) DEFAULT 100 CHECK (units >= 0), -- Percentage allocation

    -- Effort tracking
    effort DECIMAL(10,2),
    effort_unit TEXT DEFAULT 'hour' CHECK (effort_unit IN ('minute', 'hour', 'day', 'week', 'month')),

    -- Display
    cls TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_task_resource UNIQUE (task_id, resource_id)
);

COMMENT ON TABLE assignments IS 'Resource assignments to tasks';
COMMENT ON COLUMN assignments.units IS 'Allocation percentage (100 = full time on task)';

-- ============================================================================
-- BASELINES TABLE
-- Project baselines for tracking planned vs actual
-- ============================================================================

CREATE TABLE baselines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Baseline info
    name TEXT NOT NULL,
    description TEXT,
    baseline_number INTEGER NOT NULL DEFAULT 1,

    -- Who created it
    created_by UUID NOT NULL REFERENCES profiles(id),

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    baseline_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE baselines IS 'Project baseline snapshots';

-- ============================================================================
-- BASELINE_TASKS TABLE
-- Snapshot of task data at baseline time
-- ============================================================================

CREATE TABLE baseline_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baseline_id UUID NOT NULL REFERENCES baselines(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

    -- Snapshot of task fields at baseline time
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    duration DECIMAL(10,2),
    duration_unit TEXT DEFAULT 'day',
    effort DECIMAL(10,2),
    effort_unit TEXT DEFAULT 'hour',
    percent_done DECIMAL(5,2),
    cost DECIMAL(12,2),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_baseline_task UNIQUE (baseline_id, task_id)
);

COMMENT ON TABLE baseline_tasks IS 'Task snapshots within a baseline';

-- ============================================================================
-- TIME_RANGES TABLE
-- Visual ranges/zones on the timeline (Bryntum feature)
-- ============================================================================

CREATE TABLE time_ranges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Range info
    name TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,

    -- Display
    cls TEXT,
    color TEXT,
    icon_cls TEXT,

    -- Type
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE time_ranges IS 'Visual ranges/zones on the Gantt timeline';

-- ============================================================================
-- HELPER FUNCTIONS FOR TASKS
-- ============================================================================

-- Function to calculate WBS code
CREATE OR REPLACE FUNCTION calculate_wbs(task_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    parent_wbs TEXT;
    sibling_count INTEGER;
    result_wbs TEXT;
BEGIN
    -- Get parent's WBS
    SELECT t.wbs INTO parent_wbs
    FROM tasks t
    JOIN tasks child ON child.parent_id = t.id
    WHERE child.id = task_uuid;

    -- Count siblings before this task
    SELECT COUNT(*) INTO sibling_count
    FROM tasks
    WHERE parent_id = (SELECT parent_id FROM tasks WHERE id = task_uuid)
    AND project_id = (SELECT project_id FROM tasks WHERE id = task_uuid)
    AND ordinal_position <= (SELECT ordinal_position FROM tasks WHERE id = task_uuid);

    IF parent_wbs IS NULL THEN
        result_wbs := sibling_count::TEXT;
    ELSE
        result_wbs := parent_wbs || '.' || sibling_count::TEXT;
    END IF;

    RETURN result_wbs;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a task is a summary (has children)
CREATE OR REPLACE FUNCTION update_task_summary_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the old parent's summary status
    IF TG_OP = 'UPDATE' AND OLD.parent_id IS DISTINCT FROM NEW.parent_id THEN
        UPDATE tasks
        SET is_summary = EXISTS (SELECT 1 FROM tasks WHERE parent_id = OLD.parent_id)
        WHERE id = OLD.parent_id;
    END IF;

    -- Update new parent's summary status
    IF NEW.parent_id IS NOT NULL THEN
        UPDATE tasks
        SET is_summary = true
        WHERE id = NEW.parent_id;
    END IF;

    -- Handle delete
    IF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        UPDATE tasks
        SET is_summary = EXISTS (SELECT 1 FROM tasks WHERE parent_id = OLD.parent_id AND id != OLD.id)
        WHERE id = OLD.parent_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get all child tasks recursively
CREATE OR REPLACE FUNCTION get_descendant_tasks(root_task_id UUID)
RETURNS TABLE (task_id UUID, depth INTEGER) AS $$
WITH RECURSIVE task_tree AS (
    SELECT id, 0 as depth
    FROM tasks
    WHERE id = root_task_id

    UNION ALL

    SELECT t.id, tt.depth + 1
    FROM tasks t
    JOIN task_tree tt ON t.parent_id = tt.id
)
SELECT id, depth FROM task_tree WHERE id != root_task_id;
$$ LANGUAGE SQL;

-- Function to get all parent tasks
CREATE OR REPLACE FUNCTION get_ancestor_tasks(child_task_id UUID)
RETURNS TABLE (task_id UUID, depth INTEGER) AS $$
WITH RECURSIVE parent_tree AS (
    SELECT parent_id as id, 1 as depth
    FROM tasks
    WHERE id = child_task_id AND parent_id IS NOT NULL

    UNION ALL

    SELECT t.parent_id, pt.depth + 1
    FROM tasks t
    JOIN parent_tree pt ON t.id = pt.id
    WHERE t.parent_id IS NOT NULL
)
SELECT id, depth FROM parent_tree;
$$ LANGUAGE SQL;
-- ============================================================================
-- 003_feature_tables.sql
-- Feature tables: vault_items, export_logs, user_preferences, taskboard_columns
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Vault item status
CREATE TYPE vault_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'on_hold',
    'cancelled'
);

-- Vault item priority
CREATE TYPE vault_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Export format
CREATE TYPE export_format AS ENUM (
    'pdf',
    'xlsx',
    'csv',
    'mpp',
    'png',
    'svg',
    'json'
);

-- Export status
CREATE TYPE export_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);

-- ============================================================================
-- VAULT_ITEMS TABLE
-- Central vault for documents, notes, and important items
-- ============================================================================

CREATE TABLE vault_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Item info
    title TEXT NOT NULL,
    description TEXT,
    content TEXT, -- Rich text content

    -- Type and category
    type TEXT DEFAULT 'note' CHECK (type IN ('note', 'document', 'link', 'file', 'checklist')),
    category TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Status and priority
    status vault_status DEFAULT 'pending',
    priority vault_priority DEFAULT 'medium',

    -- File attachment (for file type)
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,

    -- External link (for link type)
    external_url TEXT,

    -- Checklist data (for checklist type)
    checklist_items JSONB DEFAULT '[]',

    -- Assignment
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,

    -- Due date and reminders
    due_date TIMESTAMPTZ,
    reminder_date TIMESTAMPTZ,
    reminder_sent BOOLEAN DEFAULT false,

    -- Expiration (auto-archive/delete)
    expires_at TIMESTAMPTZ,
    auto_delete_on_expire BOOLEAN DEFAULT false,

    -- Related task
    related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

    -- Visibility
    is_private BOOLEAN DEFAULT false,
    visible_to UUID[] DEFAULT '{}', -- Specific users who can see if private

    -- Display
    color TEXT,
    icon TEXT,
    pinned BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,

    -- Archive
    is_archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMPTZ,
    archived_by UUID REFERENCES profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID NOT NULL REFERENCES profiles(id),
    last_modified_by UUID REFERENCES profiles(id)
);

COMMENT ON TABLE vault_items IS 'Central vault for documents, notes, and important items';
COMMENT ON COLUMN vault_items.visible_to IS 'Specific users who can see this item when private';
COMMENT ON COLUMN vault_items.checklist_items IS 'JSON array of checklist items with checked status';

-- ============================================================================
-- VAULT_ITEM_ATTACHMENTS TABLE
-- Multiple file attachments per vault item
-- ============================================================================

CREATE TABLE vault_item_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_item_id UUID NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,

    -- File info
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,

    -- Upload info
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE vault_item_attachments IS 'File attachments for vault items';

-- ============================================================================
-- VAULT_ITEM_COMMENTS TABLE
-- Comments on vault items
-- ============================================================================

CREATE TABLE vault_item_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_item_id UUID NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,

    -- Comment content
    content TEXT NOT NULL,

    -- Author
    author_id UUID NOT NULL REFERENCES profiles(id),

    -- Parent comment for threading
    parent_id UUID REFERENCES vault_item_comments(id) ON DELETE CASCADE,

    -- Mentions
    mentions UUID[] DEFAULT '{}',

    -- Edit tracking
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE vault_item_comments IS 'Comments on vault items';

-- ============================================================================
-- EXPORT_LOGS TABLE
-- Track all export operations
-- ============================================================================

CREATE TABLE export_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Export details
    format export_format NOT NULL,
    status export_status DEFAULT 'pending',

    -- Export options used
    options JSONB DEFAULT '{}',

    -- Result
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,

    -- Error info (if failed)
    error_message TEXT,
    error_details JSONB,

    -- Stats
    rows_exported INTEGER,
    processing_time_ms INTEGER,

    -- User
    requested_by UUID NOT NULL REFERENCES profiles(id),
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,

    -- Expiration (auto-delete download links)
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE export_logs IS 'Track export operations and provide download links';
COMMENT ON COLUMN export_logs.options IS 'JSON containing export options like date range, filters, etc.';

-- ============================================================================
-- USER_PREFERENCES TABLE
-- Per-user application preferences
-- ============================================================================

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,

    -- Scope: NULL workspace_id = global prefs, set workspace_id = workspace-specific
    CONSTRAINT unique_user_workspace_prefs UNIQUE (user_id, workspace_id),

    -- UI Preferences
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    sidebar_collapsed BOOLEAN DEFAULT false,
    compact_mode BOOLEAN DEFAULT false,

    -- Gantt preferences
    gantt_preferences JSONB DEFAULT '{
        "view_preset": "weekAndDay",
        "show_weekends": false,
        "show_project_lines": true,
        "show_baselines": true,
        "show_critical_path": false,
        "show_dependencies": true,
        "row_height": 45,
        "bar_margin": 5,
        "column_lines": true,
        "fit_hours": true,
        "time_resolution": {"unit": "hour", "increment": 1}
    }',

    -- Task list preferences
    tasklist_preferences JSONB DEFAULT '{
        "sort_by": "start_date",
        "sort_direction": "asc",
        "group_by": null,
        "columns": ["name", "start_date", "end_date", "progress", "assigned"],
        "show_completed": true,
        "show_milestones": true
    }',

    -- Dashboard preferences
    dashboard_widgets JSONB DEFAULT '[
        {"id": "progress-overview", "position": 0, "visible": true},
        {"id": "upcoming-deadlines", "position": 1, "visible": true},
        {"id": "my-tasks", "position": 2, "visible": true},
        {"id": "recent-activity", "position": 3, "visible": true}
    ]',

    -- Notification preferences
    notification_preferences JSONB DEFAULT '{
        "email_enabled": true,
        "email_digest": "daily",
        "push_enabled": true,
        "sound_enabled": true,
        "task_assigned": true,
        "task_due_reminder": true,
        "task_completed": true,
        "mentions": true,
        "project_updates": true,
        "deadline_warning_days": 3
    }',

    -- Keyboard shortcuts customization
    keyboard_shortcuts JSONB DEFAULT '{}',

    -- Recent items for quick access
    recent_projects UUID[] DEFAULT '{}',
    favorite_projects UUID[] DEFAULT '{}',
    pinned_vault_items UUID[] DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE user_preferences IS 'User-specific application preferences';
COMMENT ON COLUMN user_preferences.workspace_id IS 'NULL for global prefs, set for workspace-specific';

-- ============================================================================
-- TASKBOARD_COLUMNS TABLE
-- Kanban board column definitions
-- ============================================================================

CREATE TABLE taskboard_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Column info
    name TEXT NOT NULL,
    description TEXT,

    -- Status mapping
    status_value TEXT NOT NULL, -- Maps to task status
    is_done_column BOOLEAN DEFAULT false, -- Tasks here are considered complete

    -- Display
    color TEXT DEFAULT '#6B7280',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,

    -- Limits
    wip_limit INTEGER, -- Work in progress limit

    -- Visibility
    is_visible BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE taskboard_columns IS 'Kanban board column definitions';
COMMENT ON COLUMN taskboard_columns.wip_limit IS 'Maximum tasks allowed in this column';

-- ============================================================================
-- ACTIVITY_LOG TABLE
-- Audit trail for important actions
-- ============================================================================

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    -- What happened
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    entity_name TEXT,

    -- Who did it
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT,

    -- Details
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',

    -- IP and user agent for security
    ip_address INET,
    user_agent TEXT,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE activity_log IS 'Audit trail for important actions';
COMMENT ON COLUMN activity_log.action IS 'e.g., created, updated, deleted, shared, exported';
COMMENT ON COLUMN activity_log.entity_type IS 'e.g., project, task, vault_item, workspace';

-- Create partitioned index for faster queries
CREATE INDEX idx_activity_log_created_at ON activity_log (created_at DESC);
CREATE INDEX idx_activity_log_entity ON activity_log (entity_type, entity_id);
CREATE INDEX idx_activity_log_actor ON activity_log (actor_id);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- In-app notifications
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,

    -- Notification content
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    icon TEXT,

    -- Related entity
    entity_type TEXT,
    entity_id UUID,
    action_url TEXT,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,

    -- From (optional)
    from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Grouping
    group_key TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON COLUMN notifications.group_key IS 'For grouping similar notifications';

-- ============================================================================
-- SAVED_FILTERS TABLE
-- Saved filter configurations for reuse
-- ============================================================================

CREATE TABLE saved_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Filter info
    name TEXT NOT NULL,
    description TEXT,

    -- What it applies to
    entity_type TEXT NOT NULL CHECK (entity_type IN ('tasks', 'projects', 'vault_items', 'resources')),

    -- Filter definition
    filter_config JSONB NOT NULL,

    -- Sharing
    is_shared BOOLEAN DEFAULT false,

    -- Display
    color TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE saved_filters IS 'Saved filter configurations for quick access';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
    p_workspace_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_entity_name TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO activity_log (
        workspace_id,
        action,
        entity_type,
        entity_id,
        entity_name,
        actor_id,
        old_values,
        new_values,
        metadata
    ) VALUES (
        p_workspace_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_entity_name,
        auth.uid(),
        p_old_values,
        p_new_values,
        p_metadata
    )
    RETURNING id INTO activity_id;

    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_workspace_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        workspace_id,
        type,
        title,
        message,
        entity_type,
        entity_id,
        action_url,
        from_user_id
    ) VALUES (
        p_user_id,
        p_workspace_id,
        p_type,
        p_title,
        p_message,
        p_entity_type,
        p_entity_id,
        p_action_url,
        auth.uid()
    )
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for expired vault items
CREATE OR REPLACE FUNCTION process_expired_vault_items()
RETURNS INTEGER AS $$
DECLARE
    processed_count INTEGER := 0;
BEGIN
    -- Archive items that have expired but not auto-delete
    UPDATE vault_items
    SET
        is_archived = true,
        archived_at = NOW()
    WHERE
        expires_at IS NOT NULL
        AND expires_at < NOW()
        AND is_archived = false
        AND auto_delete_on_expire = false;

    GET DIAGNOSTICS processed_count = ROW_COUNT;

    -- Delete items marked for auto-delete
    DELETE FROM vault_items
    WHERE
        expires_at IS NOT NULL
        AND expires_at < NOW()
        AND auto_delete_on_expire = true;

    RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old export logs
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    DELETE FROM export_logs
    WHERE
        expires_at IS NOT NULL
        AND expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================================================
-- 004_rls_policies.sql
-- Row Level Security policies for all tables
-- Multi-tenant security with 5 roles:
-- admin, vault_medewerker, medewerker, klant_editor, klant_viewer
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE baseline_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_item_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE taskboard_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view profiles of members in shared workspaces
CREATE POLICY "Users can view profiles in shared workspaces"
    ON profiles FOR SELECT
    USING (
        id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM workspace_members wm1
            JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
            WHERE wm1.user_id = auth.uid()
            AND wm2.user_id = profiles.id
            AND wm1.is_active = true
            AND wm2.is_active = true
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- New users can insert their profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- ============================================================================
-- WORKSPACES POLICIES
-- ============================================================================

-- Members can view their workspaces
CREATE POLICY "Members can view workspaces"
    ON workspaces FOR SELECT
    USING (
        owner_id = auth.uid()
        OR is_workspace_member(id, auth.uid())
    );

-- Only owners and admins can update workspace
CREATE POLICY "Admins can update workspaces"
    ON workspaces FOR UPDATE
    USING (
        owner_id = auth.uid()
        OR is_workspace_admin(id, auth.uid())
    )
    WITH CHECK (
        owner_id = auth.uid()
        OR is_workspace_admin(id, auth.uid())
    );

-- Users can create workspaces
CREATE POLICY "Users can create workspaces"
    ON workspaces FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Only owners can delete workspaces
CREATE POLICY "Owners can delete workspaces"
    ON workspaces FOR DELETE
    USING (owner_id = auth.uid());

-- ============================================================================
-- WORKSPACE_MEMBERS POLICIES
-- ============================================================================

-- Members can view other members in their workspaces
CREATE POLICY "Members can view workspace members"
    ON workspace_members FOR SELECT
    USING (
        user_id = auth.uid()
        OR is_workspace_member(workspace_id, auth.uid())
    );

-- Admins can add members
CREATE POLICY "Admins can add workspace members"
    ON workspace_members FOR INSERT
    WITH CHECK (
        is_workspace_admin(workspace_id, auth.uid())
        OR (
            -- Users with can_invite_members permission
            EXISTS (
                SELECT 1 FROM workspace_members
                WHERE workspace_id = workspace_members.workspace_id
                AND user_id = auth.uid()
                AND can_invite_members = true
                AND is_active = true
            )
        )
    );

-- Admins can update members
CREATE POLICY "Admins can update workspace members"
    ON workspace_members FOR UPDATE
    USING (is_workspace_admin(workspace_id, auth.uid()))
    WITH CHECK (is_workspace_admin(workspace_id, auth.uid()));

-- Admins can remove members, users can remove themselves
CREATE POLICY "Admins can delete workspace members"
    ON workspace_members FOR DELETE
    USING (
        user_id = auth.uid()
        OR is_workspace_admin(workspace_id, auth.uid())
    );

-- ============================================================================
-- WORKSPACE_INVITES POLICIES
-- ============================================================================

-- Invitees and admins can view invites
CREATE POLICY "View invites"
    ON workspace_invites FOR SELECT
    USING (
        email = (SELECT email FROM profiles WHERE id = auth.uid())
        OR is_workspace_admin(workspace_id, auth.uid())
        OR invited_by = auth.uid()
    );

-- Admins and users with invite permission can create invites
CREATE POLICY "Create invites"
    ON workspace_invites FOR INSERT
    WITH CHECK (
        is_workspace_admin(workspace_id, auth.uid())
        OR EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = workspace_invites.workspace_id
            AND user_id = auth.uid()
            AND can_invite_members = true
            AND is_active = true
        )
    );

-- Admins can update invites, invitees can accept/decline
CREATE POLICY "Update invites"
    ON workspace_invites FOR UPDATE
    USING (
        is_workspace_admin(workspace_id, auth.uid())
        OR email = (SELECT email FROM profiles WHERE id = auth.uid())
    );

-- Admins can delete invites
CREATE POLICY "Delete invites"
    ON workspace_invites FOR DELETE
    USING (is_workspace_admin(workspace_id, auth.uid()));

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================

-- View projects based on role
CREATE POLICY "View projects"
    ON projects FOR SELECT
    USING (
        -- Workspace admins and vault_medewerker see all
        get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
        OR (
            -- Medewerkers see all workspace projects
            get_workspace_role(workspace_id, auth.uid()) = 'medewerker'
        )
        OR (
            -- Client roles see only client_visible projects they're members of
            get_workspace_role(workspace_id, auth.uid()) IN ('klant_editor', 'klant_viewer')
            AND client_visible = true
            AND EXISTS (
                SELECT 1 FROM project_members
                WHERE project_id = projects.id
                AND user_id = auth.uid()
            )
        )
    );

-- Create projects
CREATE POLICY "Create projects"
    ON projects FOR INSERT
    WITH CHECK (
        get_workspace_role(workspace_id, auth.uid()) = 'admin'
        OR EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = projects.workspace_id
            AND user_id = auth.uid()
            AND can_create_projects = true
            AND is_active = true
        )
    );

-- Update projects
CREATE POLICY "Update projects"
    ON projects FOR UPDATE
    USING (
        get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
        OR manager_id = auth.uid()
        OR (
            get_workspace_role(workspace_id, auth.uid()) = 'medewerker'
            AND EXISTS (
                SELECT 1 FROM project_members
                WHERE project_id = projects.id
                AND user_id = auth.uid()
                AND can_edit = true
            )
        )
        OR (
            get_workspace_role(workspace_id, auth.uid()) = 'klant_editor'
            AND client_visible = true
            AND EXISTS (
                SELECT 1 FROM project_members
                WHERE project_id = projects.id
                AND user_id = auth.uid()
                AND can_edit = true
            )
        )
    );

-- Delete projects (admins and managers only)
CREATE POLICY "Delete projects"
    ON projects FOR DELETE
    USING (
        get_workspace_role(workspace_id, auth.uid()) = 'admin'
        OR manager_id = auth.uid()
    );

-- ============================================================================
-- PROJECT_MEMBERS POLICIES
-- ============================================================================

CREATE POLICY "View project members"
    ON project_members FOR SELECT
    USING (has_project_access(project_id, auth.uid(), 'view'));

CREATE POLICY "Manage project members"
    ON project_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_members.project_id
            AND (
                get_workspace_role(p.workspace_id, auth.uid()) = 'admin'
                OR p.manager_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM project_members pm
                    WHERE pm.project_id = project_members.project_id
                    AND pm.user_id = auth.uid()
                    AND pm.can_manage_members = true
                )
            )
        )
    );

-- ============================================================================
-- CALENDARS POLICIES
-- ============================================================================

CREATE POLICY "View calendars"
    ON calendars FOR SELECT
    USING (
        is_workspace_member(workspace_id, auth.uid())
        OR (
            project_id IS NOT NULL
            AND has_project_access(project_id, auth.uid(), 'view')
        )
    );

CREATE POLICY "Manage calendars"
    ON calendars FOR ALL
    USING (
        get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
    );

-- ============================================================================
-- CALENDAR_EXCEPTIONS POLICIES
-- ============================================================================

CREATE POLICY "View calendar exceptions"
    ON calendar_exceptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM calendars c
            WHERE c.id = calendar_exceptions.calendar_id
            AND is_workspace_member(c.workspace_id, auth.uid())
        )
    );

CREATE POLICY "Manage calendar exceptions"
    ON calendar_exceptions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM calendars c
            WHERE c.id = calendar_exceptions.calendar_id
            AND get_workspace_role(c.workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
        )
    );

-- ============================================================================
-- TASKS POLICIES
-- ============================================================================

CREATE POLICY "View tasks"
    ON tasks FOR SELECT
    USING (has_project_access(project_id, auth.uid(), 'view'));

CREATE POLICY "Create tasks"
    ON tasks FOR INSERT
    WITH CHECK (has_project_access(project_id, auth.uid(), 'edit'));

CREATE POLICY "Update tasks"
    ON tasks FOR UPDATE
    USING (has_project_access(project_id, auth.uid(), 'edit'));

CREATE POLICY "Delete tasks"
    ON tasks FOR DELETE
    USING (has_project_access(project_id, auth.uid(), 'edit'));

-- ============================================================================
-- DEPENDENCIES POLICIES
-- ============================================================================

CREATE POLICY "View dependencies"
    ON dependencies FOR SELECT
    USING (has_project_access(project_id, auth.uid(), 'view'));

CREATE POLICY "Manage dependencies"
    ON dependencies FOR ALL
    USING (has_project_access(project_id, auth.uid(), 'edit'));

-- ============================================================================
-- RESOURCES POLICIES
-- ============================================================================

CREATE POLICY "View resources"
    ON resources FOR SELECT
    USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Manage resources"
    ON resources FOR ALL
    USING (
        get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
    );

-- ============================================================================
-- ASSIGNMENTS POLICIES
-- ============================================================================

CREATE POLICY "View assignments"
    ON assignments FOR SELECT
    USING (has_project_access(project_id, auth.uid(), 'view'));

CREATE POLICY "Manage assignments"
    ON assignments FOR ALL
    USING (has_project_access(project_id, auth.uid(), 'edit'));

-- ============================================================================
-- BASELINES POLICIES
-- ============================================================================

CREATE POLICY "View baselines"
    ON baselines FOR SELECT
    USING (has_project_access(project_id, auth.uid(), 'view'));

CREATE POLICY "Create baselines"
    ON baselines FOR INSERT
    WITH CHECK (has_project_access(project_id, auth.uid(), 'edit'));

CREATE POLICY "Delete baselines"
    ON baselines FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = baselines.project_id
            AND get_workspace_role(p.workspace_id, auth.uid()) = 'admin'
        )
    );

-- ============================================================================
-- BASELINE_TASKS POLICIES
-- ============================================================================

CREATE POLICY "View baseline tasks"
    ON baseline_tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM baselines b
            WHERE b.id = baseline_tasks.baseline_id
            AND has_project_access(b.project_id, auth.uid(), 'view')
        )
    );

CREATE POLICY "Insert baseline tasks"
    ON baseline_tasks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM baselines b
            WHERE b.id = baseline_tasks.baseline_id
            AND has_project_access(b.project_id, auth.uid(), 'edit')
        )
    );

-- ============================================================================
-- TIME_RANGES POLICIES
-- ============================================================================

CREATE POLICY "View time ranges"
    ON time_ranges FOR SELECT
    USING (has_project_access(project_id, auth.uid(), 'view'));

CREATE POLICY "Manage time ranges"
    ON time_ranges FOR ALL
    USING (has_project_access(project_id, auth.uid(), 'edit'));

-- ============================================================================
-- VAULT_ITEMS POLICIES
-- ============================================================================

CREATE POLICY "View vault items"
    ON vault_items FOR SELECT
    USING (
        -- Admins and vault_medewerker see all
        get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
        OR (
            -- Creator can see their own
            created_by = auth.uid()
        )
        OR (
            -- Non-private items visible to workspace members
            is_private = false
            AND is_workspace_member(workspace_id, auth.uid())
        )
        OR (
            -- Private items visible to specified users
            is_private = true
            AND auth.uid() = ANY(visible_to)
        )
    );

CREATE POLICY "Create vault items"
    ON vault_items FOR INSERT
    WITH CHECK (
        get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'vault_medewerker', 'medewerker')
    );

CREATE POLICY "Update vault items"
    ON vault_items FOR UPDATE
    USING (
        get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
        OR created_by = auth.uid()
        OR (
            -- Assigned users can update their items
            assigned_to = auth.uid()
        )
    );

CREATE POLICY "Delete vault items"
    ON vault_items FOR DELETE
    USING (
        get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
        OR created_by = auth.uid()
    );

-- ============================================================================
-- VAULT_ITEM_ATTACHMENTS POLICIES
-- ============================================================================

CREATE POLICY "View vault attachments"
    ON vault_item_attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM vault_items vi
            WHERE vi.id = vault_item_attachments.vault_item_id
            AND (
                get_workspace_role(vi.workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
                OR vi.created_by = auth.uid()
                OR (vi.is_private = false AND is_workspace_member(vi.workspace_id, auth.uid()))
                OR (vi.is_private = true AND auth.uid() = ANY(vi.visible_to))
            )
        )
    );

CREATE POLICY "Manage vault attachments"
    ON vault_item_attachments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM vault_items vi
            WHERE vi.id = vault_item_attachments.vault_item_id
            AND (
                get_workspace_role(vi.workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
                OR vi.created_by = auth.uid()
            )
        )
    );

-- ============================================================================
-- VAULT_ITEM_COMMENTS POLICIES
-- ============================================================================

CREATE POLICY "View vault comments"
    ON vault_item_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM vault_items vi
            WHERE vi.id = vault_item_comments.vault_item_id
            AND (
                get_workspace_role(vi.workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
                OR vi.created_by = auth.uid()
                OR (vi.is_private = false AND is_workspace_member(vi.workspace_id, auth.uid()))
                OR (vi.is_private = true AND auth.uid() = ANY(vi.visible_to))
            )
        )
    );

CREATE POLICY "Create vault comments"
    ON vault_item_comments FOR INSERT
    WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM vault_items vi
            WHERE vi.id = vault_item_comments.vault_item_id
            AND is_workspace_member(vi.workspace_id, auth.uid())
        )
    );

CREATE POLICY "Update own vault comments"
    ON vault_item_comments FOR UPDATE
    USING (author_id = auth.uid());

CREATE POLICY "Delete vault comments"
    ON vault_item_comments FOR DELETE
    USING (
        author_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM vault_items vi
            WHERE vi.id = vault_item_comments.vault_item_id
            AND get_workspace_role(vi.workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
        )
    );

-- ============================================================================
-- EXPORT_LOGS POLICIES
-- ============================================================================

CREATE POLICY "View own exports"
    ON export_logs FOR SELECT
    USING (
        requested_by = auth.uid()
        OR get_workspace_role(workspace_id, auth.uid()) = 'admin'
    );

CREATE POLICY "Create exports"
    ON export_logs FOR INSERT
    WITH CHECK (
        requested_by = auth.uid()
        AND is_workspace_member(workspace_id, auth.uid())
    );

-- ============================================================================
-- USER_PREFERENCES POLICIES
-- ============================================================================

CREATE POLICY "Manage own preferences"
    ON user_preferences FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TASKBOARD_COLUMNS POLICIES
-- ============================================================================

CREATE POLICY "View taskboard columns"
    ON taskboard_columns FOR SELECT
    USING (
        is_workspace_member(workspace_id, auth.uid())
        OR (
            project_id IS NOT NULL
            AND has_project_access(project_id, auth.uid(), 'view')
        )
    );

CREATE POLICY "Manage taskboard columns"
    ON taskboard_columns FOR ALL
    USING (
        get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
    );

-- ============================================================================
-- ACTIVITY_LOG POLICIES
-- ============================================================================

CREATE POLICY "View activity log"
    ON activity_log FOR SELECT
    USING (
        get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'vault_medewerker')
        OR actor_id = auth.uid()
    );

-- Only system can insert (via functions)
CREATE POLICY "Insert activity log"
    ON activity_log FOR INSERT
    WITH CHECK (true); -- Controlled via SECURITY DEFINER functions

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

CREATE POLICY "View own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Delete own notifications"
    ON notifications FOR DELETE
    USING (user_id = auth.uid());

-- System inserts notifications
CREATE POLICY "Insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true); -- Controlled via SECURITY DEFINER functions

-- ============================================================================
-- SAVED_FILTERS POLICIES
-- ============================================================================

CREATE POLICY "View saved filters"
    ON saved_filters FOR SELECT
    USING (
        user_id = auth.uid()
        OR (
            is_shared = true
            AND is_workspace_member(workspace_id, auth.uid())
        )
    );

CREATE POLICY "Manage own filters"
    ON saved_filters FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
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
-- ============================================================================
-- 006_triggers.sql
-- Triggers for updated_at, vault expiration, and other automation
-- ============================================================================

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Generic function to update the updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- APPLY UPDATED_AT TRIGGERS TO ALL TABLES
-- ============================================================================

-- Profiles
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Workspaces
CREATE TRIGGER trigger_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Workspace Members
CREATE TRIGGER trigger_workspace_members_updated_at
    BEFORE UPDATE ON workspace_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Workspace Invites
CREATE TRIGGER trigger_workspace_invites_updated_at
    BEFORE UPDATE ON workspace_invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Projects
CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Project Members
CREATE TRIGGER trigger_project_members_updated_at
    BEFORE UPDATE ON project_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Calendars
CREATE TRIGGER trigger_calendars_updated_at
    BEFORE UPDATE ON calendars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Calendar Exceptions
CREATE TRIGGER trigger_calendar_exceptions_updated_at
    BEFORE UPDATE ON calendar_exceptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tasks
CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Dependencies
CREATE TRIGGER trigger_dependencies_updated_at
    BEFORE UPDATE ON dependencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Resources
CREATE TRIGGER trigger_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Assignments
CREATE TRIGGER trigger_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Time Ranges
CREATE TRIGGER trigger_time_ranges_updated_at
    BEFORE UPDATE ON time_ranges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vault Items
CREATE TRIGGER trigger_vault_items_updated_at
    BEFORE UPDATE ON vault_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vault Item Comments
CREATE TRIGGER trigger_vault_item_comments_updated_at
    BEFORE UPDATE ON vault_item_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Export Logs
CREATE TRIGGER trigger_export_logs_updated_at
    BEFORE UPDATE ON export_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User Preferences
CREATE TRIGGER trigger_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Taskboard Columns
CREATE TRIGGER trigger_taskboard_columns_updated_at
    BEFORE UPDATE ON taskboard_columns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Saved Filters
CREATE TRIGGER trigger_saved_filters_updated_at
    BEFORE UPDATE ON saved_filters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PROFILE CREATION TRIGGER
-- Auto-create profile when user signs up
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- WORKSPACE MEMBER CREATION TRIGGER
-- Auto-add owner as admin when workspace is created
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_workspace()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO workspace_members (workspace_id, user_id, role, can_create_projects, can_invite_members, can_manage_vault)
    VALUES (NEW.id, NEW.owner_id, 'admin', true, true, true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workspace_created
    AFTER INSERT ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_workspace();

-- ============================================================================
-- INVITE ACCEPTANCE TRIGGER
-- Create workspace member when invite is accepted
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_invite_accepted()
RETURNS TRIGGER AS $$
DECLARE
    user_id_from_email UUID;
BEGIN
    -- Only process if status changed to 'accepted'
    IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        -- Find user by email
        SELECT id INTO user_id_from_email
        FROM profiles
        WHERE email = NEW.email;

        IF user_id_from_email IS NOT NULL THEN
            -- Create workspace member
            INSERT INTO workspace_members (workspace_id, user_id, role)
            VALUES (NEW.workspace_id, user_id_from_email, NEW.role)
            ON CONFLICT (workspace_id, user_id) DO NOTHING;

            -- Update accepted_at
            NEW.accepted_at = NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_invite_accepted
    BEFORE UPDATE ON workspace_invites
    FOR EACH ROW
    EXECUTE FUNCTION handle_invite_accepted();

-- ============================================================================
-- TASK SUMMARY STATUS TRIGGER
-- Update is_summary when children are added/removed
-- ============================================================================

CREATE TRIGGER on_task_parent_changed
    AFTER INSERT OR UPDATE OF parent_id OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_summary_status();

-- ============================================================================
-- TASK PROGRESS ROLLUP TRIGGER
-- Update parent task progress when child progress changes
-- ============================================================================

CREATE OR REPLACE FUNCTION rollup_task_progress()
RETURNS TRIGGER AS $$
DECLARE
    parent_uuid UUID;
    avg_progress DECIMAL;
BEGIN
    -- Get parent ID
    IF TG_OP = 'DELETE' THEN
        parent_uuid := OLD.parent_id;
    ELSE
        parent_uuid := NEW.parent_id;
    END IF;

    -- If no parent, nothing to do
    IF parent_uuid IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Calculate average progress of all children
    SELECT AVG(percent_done) INTO avg_progress
    FROM tasks
    WHERE parent_id = parent_uuid
    AND is_active = true;

    -- Update parent progress (only if rollup is enabled)
    UPDATE tasks
    SET percent_done = COALESCE(avg_progress, 0)
    WHERE id = parent_uuid
    AND rollup = true
    AND is_summary = true;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_task_progress_changed
    AFTER INSERT OR UPDATE OF percent_done OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION rollup_task_progress();

-- ============================================================================
-- PROJECT PROGRESS TRIGGER
-- Update project progress when tasks change
-- ============================================================================

CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    proj_id UUID;
    avg_progress DECIMAL;
BEGIN
    -- Get project ID
    IF TG_OP = 'DELETE' THEN
        proj_id := OLD.project_id;
    ELSE
        proj_id := NEW.project_id;
    END IF;

    -- Calculate average progress of root-level tasks
    SELECT AVG(percent_done) INTO avg_progress
    FROM tasks
    WHERE project_id = proj_id
    AND parent_id IS NULL
    AND is_active = true;

    -- Update project progress
    UPDATE projects
    SET progress = COALESCE(avg_progress, 0)
    WHERE id = proj_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_task_project_progress
    AFTER INSERT OR UPDATE OF percent_done OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

-- ============================================================================
-- VAULT ITEM EXPIRATION CHECK
-- Handle vault item expiration (called by scheduled job)
-- ============================================================================

-- Already defined in 003_feature_tables.sql as process_expired_vault_items()

-- ============================================================================
-- VAULT ITEM LAST MODIFIED TRIGGER
-- Track who last modified a vault item
-- ============================================================================

CREATE OR REPLACE FUNCTION track_vault_item_modifier()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vault_item_modified
    BEFORE UPDATE ON vault_items
    FOR EACH ROW
    EXECUTE FUNCTION track_vault_item_modifier();

-- ============================================================================
-- VAULT COMMENT EDIT TRACKING
-- Track when comments are edited
-- ============================================================================

CREATE OR REPLACE FUNCTION track_comment_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.content != NEW.content THEN
        NEW.is_edited = true;
        NEW.edited_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vault_comment_edited
    BEFORE UPDATE ON vault_item_comments
    FOR EACH ROW
    EXECUTE FUNCTION track_comment_edit();

-- ============================================================================
-- ACTIVITY LOGGING TRIGGERS
-- Auto-log important actions
-- ============================================================================

-- Log project changes
CREATE OR REPLACE FUNCTION log_project_activity()
RETURNS TRIGGER AS $$
DECLARE
    action_type TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        action_type := 'created';
        PERFORM log_activity(
            NEW.workspace_id,
            action_type,
            'project',
            NEW.id,
            NEW.name,
            NULL,
            to_jsonb(NEW)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only log significant changes
        IF OLD.status != NEW.status THEN
            action_type := 'status_changed';
        ELSIF OLD.is_archived != NEW.is_archived THEN
            action_type := CASE WHEN NEW.is_archived THEN 'archived' ELSE 'unarchived' END;
        ELSE
            action_type := 'updated';
        END IF;

        PERFORM log_activity(
            NEW.workspace_id,
            action_type,
            'project',
            NEW.id,
            NEW.name,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_activity(
            OLD.workspace_id,
            'deleted',
            'project',
            OLD.id,
            OLD.name,
            to_jsonb(OLD),
            NULL
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_activity
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_project_activity();

-- Log vault item changes
CREATE OR REPLACE FUNCTION log_vault_item_activity()
RETURNS TRIGGER AS $$
DECLARE
    action_type TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        action_type := 'created';
        PERFORM log_activity(
            NEW.workspace_id,
            action_type,
            'vault_item',
            NEW.id,
            NEW.title,
            NULL,
            jsonb_build_object('type', NEW.type, 'status', NEW.status)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            action_type := 'status_changed';
        ELSIF OLD.is_archived != NEW.is_archived THEN
            action_type := CASE WHEN NEW.is_archived THEN 'archived' ELSE 'unarchived' END;
        ELSIF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
            action_type := 'assigned';
        ELSE
            action_type := 'updated';
        END IF;

        PERFORM log_activity(
            NEW.workspace_id,
            action_type,
            'vault_item',
            NEW.id,
            NEW.title,
            jsonb_build_object('status', OLD.status, 'assigned_to', OLD.assigned_to),
            jsonb_build_object('status', NEW.status, 'assigned_to', NEW.assigned_to)
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vault_item_activity
    AFTER INSERT OR UPDATE ON vault_items
    FOR EACH ROW
    EXECUTE FUNCTION log_vault_item_activity();

-- ============================================================================
-- NOTIFICATION TRIGGERS
-- Auto-create notifications for important events
-- ============================================================================

-- Notify when assigned to task
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
    task_name TEXT;
    project_name TEXT;
    proj_id UUID;
    ws_id UUID;
    resource_user_id UUID;
BEGIN
    -- Get task and project info
    SELECT t.name, t.project_id, p.name, p.workspace_id
    INTO task_name, proj_id, project_name, ws_id
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE t.id = NEW.task_id;

    -- Get user ID from resource
    SELECT user_id INTO resource_user_id
    FROM resources
    WHERE id = NEW.resource_id;

    -- Only notify if resource is linked to a user
    IF resource_user_id IS NOT NULL AND resource_user_id != auth.uid() THEN
        PERFORM create_notification(
            resource_user_id,
            ws_id,
            'task_assigned',
            'Je bent toegewezen aan een taak',
            format('Je bent toegewezen aan "%s" in project "%s"', task_name, project_name),
            'task',
            NEW.task_id,
            format('/projects/%s/tasks/%s', proj_id, NEW.task_id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_assignment_created
    AFTER INSERT ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_assignment();

-- Notify when vault item is assigned
CREATE OR REPLACE FUNCTION notify_vault_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify on new assignment
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL AND NEW.assigned_to != auth.uid() THEN
        PERFORM create_notification(
            NEW.assigned_to,
            NEW.workspace_id,
            'vault_assigned',
            'Vault item aan jou toegewezen',
            format('"%s" is aan jou toegewezen', NEW.title),
            'vault_item',
            NEW.id,
            format('/vault/%s', NEW.id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vault_item_assigned
    AFTER UPDATE OF assigned_to ON vault_items
    FOR EACH ROW
    EXECUTE FUNCTION notify_vault_assignment();

-- Notify on workspace invite
CREATE OR REPLACE FUNCTION notify_workspace_invite()
RETURNS TRIGGER AS $$
DECLARE
    invitee_id UUID;
    ws_name TEXT;
BEGIN
    -- Get workspace name
    SELECT name INTO ws_name FROM workspaces WHERE id = NEW.workspace_id;

    -- Find user by email
    SELECT id INTO invitee_id FROM profiles WHERE email = NEW.email;

    -- If user exists, create notification
    IF invitee_id IS NOT NULL THEN
        PERFORM create_notification(
            invitee_id,
            NEW.workspace_id,
            'workspace_invite',
            format('Uitnodiging voor %s', ws_name),
            format('Je bent uitgenodigd om lid te worden van workspace "%s"', ws_name),
            'workspace_invite',
            NEW.id,
            format('/invites/%s', NEW.token)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workspace_invite_created
    AFTER INSERT ON workspace_invites
    FOR EACH ROW
    EXECUTE FUNCTION notify_workspace_invite();

-- ============================================================================
-- CLEANUP SCHEDULED FUNCTIONS
-- These should be called by pg_cron or external scheduler
-- ============================================================================

-- Expire old invites
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE workspace_invites
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean old activity logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM activity_log
    WHERE created_at < NOW() - INTERVAL '90 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SCHEDULED JOB SETUP (requires pg_cron extension)
-- Run these commands manually in production to set up scheduled jobs
-- ============================================================================

-- Enable pg_cron if available (run as superuser):
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup jobs (run as superuser):
-- SELECT cron.schedule('expire-invites', '0 * * * *', 'SELECT expire_old_invites()');
-- SELECT cron.schedule('cleanup-notifications', '0 3 * * *', 'SELECT cleanup_old_notifications()');
-- SELECT cron.schedule('cleanup-activity-logs', '0 4 * * 0', 'SELECT cleanup_old_activity_logs()');
-- SELECT cron.schedule('cleanup-exports', '0 5 * * *', 'SELECT cleanup_expired_exports()');
-- SELECT cron.schedule('process-vault-expiry', '*/15 * * * *', 'SELECT process_expired_vault_items()');
