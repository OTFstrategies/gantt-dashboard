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
