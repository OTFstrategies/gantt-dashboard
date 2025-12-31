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
