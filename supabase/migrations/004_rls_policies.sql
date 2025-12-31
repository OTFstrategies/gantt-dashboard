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
