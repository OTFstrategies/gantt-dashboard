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
