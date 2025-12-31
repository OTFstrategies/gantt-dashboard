-- ============================================================================
-- seed.sql
-- Development test data for Gantt Dashboard
-- ============================================================================

-- NOTE: This seed file assumes you have created test users in Supabase Auth first.
-- The UUIDs below are placeholders - replace with actual auth.users IDs.

-- ============================================================================
-- PLACEHOLDER USER IDs (replace with actual Supabase Auth user IDs)
-- ============================================================================

-- You can create these users in Supabase Dashboard or via API:
-- 1. admin@veha.nl (Admin)
-- 2. vault@veha.nl (Vault Medewerker)
-- 3. jan@veha.nl (Medewerker)
-- 4. piet@veha.nl (Medewerker)
-- 5. klant@example.com (Klant Editor)
-- 6. viewer@example.com (Klant Viewer)

DO $$
DECLARE
    -- User IDs (these will be created by auth triggers, we use fixed UUIDs for testing)
    admin_user_id UUID := '00000000-0000-0000-0000-000000000001';
    vault_user_id UUID := '00000000-0000-0000-0000-000000000002';
    jan_user_id UUID := '00000000-0000-0000-0000-000000000003';
    piet_user_id UUID := '00000000-0000-0000-0000-000000000004';
    klant_editor_id UUID := '00000000-0000-0000-0000-000000000005';
    klant_viewer_id UUID := '00000000-0000-0000-0000-000000000006';

    -- Workspace IDs
    veha_workspace_id UUID := '10000000-0000-0000-0000-000000000001';
    demo_workspace_id UUID := '10000000-0000-0000-0000-000000000002';

    -- Project IDs
    project_bouw_id UUID := '20000000-0000-0000-0000-000000000001';
    project_renovatie_id UUID := '20000000-0000-0000-0000-000000000002';
    project_onderhoud_id UUID := '20000000-0000-0000-0000-000000000003';

    -- Calendar IDs
    std_calendar_id UUID := '30000000-0000-0000-0000-000000000001';

    -- Resource IDs
    res_jan_id UUID := '40000000-0000-0000-0000-000000000001';
    res_piet_id UUID := '40000000-0000-0000-0000-000000000002';
    res_kraan_id UUID := '40000000-0000-0000-0000-000000000003';

    -- Task IDs
    task_1_id UUID := '50000000-0000-0000-0000-000000000001';
    task_1_1_id UUID := '50000000-0000-0000-0000-000000000002';
    task_1_2_id UUID := '50000000-0000-0000-0000-000000000003';
    task_1_3_id UUID := '50000000-0000-0000-0000-000000000004';
    task_2_id UUID := '50000000-0000-0000-0000-000000000005';
    task_2_1_id UUID := '50000000-0000-0000-0000-000000000006';
    task_2_2_id UUID := '50000000-0000-0000-0000-000000000007';
    task_3_id UUID := '50000000-0000-0000-0000-000000000008';

BEGIN
    -- ========================================================================
    -- PROFILES (normally created via auth trigger, we insert manually for seed)
    -- ========================================================================

    INSERT INTO profiles (id, email, full_name, job_title, department) VALUES
    (admin_user_id, 'admin@veha.nl', 'Admin Gebruiker', 'Beheerder', 'Management'),
    (vault_user_id, 'vault@veha.nl', 'Vault Beheerder', 'Vault Medewerker', 'Administratie'),
    (jan_user_id, 'jan@veha.nl', 'Jan Jansen', 'Projectleider', 'Uitvoering'),
    (piet_user_id, 'piet@veha.nl', 'Piet Pietersen', 'Monteur', 'Uitvoering'),
    (klant_editor_id, 'klant@example.com', 'Karel Klant', 'Projectmanager', 'Klant BV'),
    (klant_viewer_id, 'viewer@example.com', 'Vera Viewer', 'Stakeholder', 'Klant BV')
    ON CONFLICT (id) DO NOTHING;

    -- ========================================================================
    -- WORKSPACES
    -- ========================================================================

    -- VEHA Workspace (main workspace)
    INSERT INTO workspaces (id, name, slug, description, owner_id, settings) VALUES
    (veha_workspace_id, 'VEHA Projecten', 'veha', 'Centrale werkruimte voor alle VEHA projecten', admin_user_id,
    '{
        "default_calendar": "standard",
        "working_hours": {"start": "07:00", "end": "16:00"},
        "working_days": [1, 2, 3, 4, 5],
        "default_task_duration": 8,
        "allow_weekend_work": false
    }')
    ON CONFLICT (id) DO NOTHING;

    -- Demo Workspace
    INSERT INTO workspaces (id, name, slug, description, owner_id) VALUES
    (demo_workspace_id, 'Demo Workspace', 'demo', 'Demo workspace voor testen', admin_user_id)
    ON CONFLICT (id) DO NOTHING;

    -- ========================================================================
    -- WORKSPACE MEMBERS
    -- ========================================================================

    -- VEHA Workspace members
    -- Note: admin is auto-added via trigger, but we ensure all roles exist
    INSERT INTO workspace_members (workspace_id, user_id, role, can_create_projects, can_invite_members, can_manage_vault) VALUES
    (veha_workspace_id, admin_user_id, 'admin', true, true, true),
    (veha_workspace_id, vault_user_id, 'vault_medewerker', false, false, true),
    (veha_workspace_id, jan_user_id, 'medewerker', true, false, false),
    (veha_workspace_id, piet_user_id, 'medewerker', false, false, false),
    (veha_workspace_id, klant_editor_id, 'klant_editor', false, false, false),
    (veha_workspace_id, klant_viewer_id, 'klant_viewer', false, false, false)
    ON CONFLICT (workspace_id, user_id) DO NOTHING;

    -- ========================================================================
    -- CALENDARS
    -- ========================================================================

    INSERT INTO calendars (id, workspace_id, name, is_default, hours_per_day, days_per_week, working_hours) VALUES
    (std_calendar_id, veha_workspace_id, 'Standaard Werkkalender', true, 8, 5, '[
        {"day": 1, "hours": [{"from": "07:00", "to": "12:00"}, {"from": "12:30", "to": "16:00"}]},
        {"day": 2, "hours": [{"from": "07:00", "to": "12:00"}, {"from": "12:30", "to": "16:00"}]},
        {"day": 3, "hours": [{"from": "07:00", "to": "12:00"}, {"from": "12:30", "to": "16:00"}]},
        {"day": 4, "hours": [{"from": "07:00", "to": "12:00"}, {"from": "12:30", "to": "16:00"}]},
        {"day": 5, "hours": [{"from": "07:00", "to": "12:00"}, {"from": "12:30", "to": "16:00"}]}
    ]')
    ON CONFLICT (id) DO NOTHING;

    -- Calendar exceptions (Dutch holidays 2025)
    INSERT INTO calendar_exceptions (calendar_id, name, date, day_type, is_recurring, recurrence_pattern) VALUES
    (std_calendar_id, 'Nieuwjaarsdag', '2025-01-01', 'holiday', true, 'yearly'),
    (std_calendar_id, 'Koningsdag', '2025-04-26', 'holiday', true, 'yearly'),
    (std_calendar_id, 'Bevrijdingsdag', '2025-05-05', 'holiday', true, 'yearly'),
    (std_calendar_id, 'Kerst', '2025-12-25', 'holiday', true, 'yearly'),
    (std_calendar_id, 'Tweede Kerstdag', '2025-12-26', 'holiday', true, 'yearly')
    ON CONFLICT DO NOTHING;

    -- ========================================================================
    -- PROJECTS
    -- ========================================================================

    INSERT INTO projects (id, workspace_id, name, code, description, status, manager_id, start_date, end_date, client_visible, settings) VALUES
    (project_bouw_id, veha_workspace_id, 'Nieuwbouw Kantoorpand', 'VEH-001', 'Nieuwbouw kantoorpand op industrieterrein Noord', 'active', jan_user_id, '2025-02-01', '2025-08-31', true,
    '{
        "auto_scheduling": true,
        "critical_path_enabled": true,
        "show_weekends": false,
        "hours_per_day": 8
    }'),
    (project_renovatie_id, veha_workspace_id, 'Renovatie Gemeentehuis', 'VEH-002', 'Renovatie historisch gemeentehuis centrum', 'active', jan_user_id, '2025-03-01', '2025-06-30', true, '{}'),
    (project_onderhoud_id, veha_workspace_id, 'Jaarlijks Onderhoud 2025', 'VEH-003', 'Regulier onderhoud diverse locaties', 'draft', piet_user_id, '2025-01-15', '2025-12-31', false, '{}')
    ON CONFLICT (id) DO NOTHING;

    -- Project members (klanten krijgen toegang tot client_visible projecten)
    INSERT INTO project_members (project_id, user_id, can_edit, can_export) VALUES
    (project_bouw_id, klant_editor_id, true, true),
    (project_bouw_id, klant_viewer_id, false, true),
    (project_renovatie_id, klant_editor_id, true, true)
    ON CONFLICT (project_id, user_id) DO NOTHING;

    -- ========================================================================
    -- RESOURCES
    -- ========================================================================

    INSERT INTO resources (id, workspace_id, name, code, type, user_id, calendar_id, max_units, hourly_rate, color) VALUES
    (res_jan_id, veha_workspace_id, 'Jan Jansen', 'JJ', 'user', jan_user_id, std_calendar_id, 100, 75.00, '#3B82F6'),
    (res_piet_id, veha_workspace_id, 'Piet Pietersen', 'PP', 'user', piet_user_id, std_calendar_id, 100, 55.00, '#10B981'),
    (res_kraan_id, veha_workspace_id, 'Hijskraan 25T', 'HK25', 'equipment', NULL, NULL, 100, 150.00, '#F59E0B')
    ON CONFLICT (id) DO NOTHING;

    -- ========================================================================
    -- TASKS - Project Bouw (hierarchical structure)
    -- ========================================================================

    -- Root tasks
    INSERT INTO tasks (id, project_id, name, wbs, ordinal_position, start_date, end_date, duration, duration_unit, is_summary, expanded, milestone, percent_done) VALUES
    -- Phase 1: Voorbereiding
    (task_1_id, project_bouw_id, 'Voorbereiding', '1', 0,
     '2025-02-01 07:00:00+01', '2025-02-28 16:00:00+01', 20, 'day', true, true, false, 75),

    -- Phase 1 subtasks
    (task_1_1_id, project_bouw_id, 'Vergunningen aanvragen', '1.1', 0,
     '2025-02-01 07:00:00+01', '2025-02-14 16:00:00+01', 10, 'day', false, true, false, 100),
    (task_1_2_id, project_bouw_id, 'Materialen bestellen', '1.2', 1,
     '2025-02-10 07:00:00+01', '2025-02-21 16:00:00+01', 8, 'day', false, true, false, 80),
    (task_1_3_id, project_bouw_id, 'Kick-off meeting', '1.3', 2,
     '2025-02-03 09:00:00+01', '2025-02-03 11:00:00+01', 2, 'hour', false, true, true, 100),

    -- Phase 2: Bouwfase
    (task_2_id, project_bouw_id, 'Bouwfase', '2', 1,
     '2025-03-01 07:00:00+01', '2025-07-31 16:00:00+01', 105, 'day', true, true, false, 20),

    -- Phase 2 subtasks
    (task_2_1_id, project_bouw_id, 'Fundering leggen', '2.1', 0,
     '2025-03-01 07:00:00+01', '2025-03-31 16:00:00+01', 22, 'day', false, true, false, 45),
    (task_2_2_id, project_bouw_id, 'Constructie opbouwen', '2.2', 1,
     '2025-04-01 07:00:00+01', '2025-06-30 16:00:00+01', 65, 'day', false, true, false, 0),

    -- Phase 3: Oplevering (milestone)
    (task_3_id, project_bouw_id, 'Oplevering', '3', 2,
     '2025-08-31 09:00:00+01', '2025-08-31 09:00:00+01', 0, 'day', false, true, true, 0)
    ON CONFLICT (id) DO NOTHING;

    -- Set parent relationships
    UPDATE tasks SET parent_id = task_1_id WHERE id IN (task_1_1_id, task_1_2_id, task_1_3_id);
    UPDATE tasks SET parent_id = task_2_id WHERE id IN (task_2_1_id, task_2_2_id);

    -- ========================================================================
    -- DEPENDENCIES
    -- ========================================================================

    INSERT INTO dependencies (project_id, from_task, to_task, type, lag, lag_unit) VALUES
    -- Vergunningen moeten klaar zijn voordat materialen besteld worden
    (project_bouw_id, task_1_1_id, task_1_2_id, 'FS', 0, 'day'),
    -- Voorbereiding moet klaar zijn voordat bouwfase start
    (project_bouw_id, task_1_id, task_2_id, 'FS', 0, 'day'),
    -- Fundering moet klaar zijn voordat constructie start
    (project_bouw_id, task_2_1_id, task_2_2_id, 'FS', 2, 'day'),
    -- Bouwfase moet klaar zijn voordat oplevering
    (project_bouw_id, task_2_id, task_3_id, 'FS', 0, 'day')
    ON CONFLICT DO NOTHING;

    -- ========================================================================
    -- ASSIGNMENTS
    -- ========================================================================

    INSERT INTO assignments (project_id, task_id, resource_id, units) VALUES
    (project_bouw_id, task_1_1_id, res_jan_id, 50),
    (project_bouw_id, task_1_2_id, res_jan_id, 25),
    (project_bouw_id, task_2_1_id, res_piet_id, 100),
    (project_bouw_id, task_2_1_id, res_kraan_id, 50),
    (project_bouw_id, task_2_2_id, res_jan_id, 100),
    (project_bouw_id, task_2_2_id, res_piet_id, 100)
    ON CONFLICT DO NOTHING;

    -- ========================================================================
    -- BASELINES
    -- ========================================================================

    INSERT INTO baselines (id, project_id, name, description, baseline_number, created_by) VALUES
    ('60000000-0000-0000-0000-000000000001', project_bouw_id, 'Initieel Plan', 'Baseline bij projectstart', 1, jan_user_id)
    ON CONFLICT (id) DO NOTHING;

    -- ========================================================================
    -- VAULT ITEMS
    -- ========================================================================

    INSERT INTO vault_items (workspace_id, project_id, title, description, type, status, priority, created_by, tags) VALUES
    (veha_workspace_id, project_bouw_id, 'Bouwtekeningen v1.2', 'Laatste versie bouwtekeningen kantoorpand', 'document', 'completed', 'high', jan_user_id, ARRAY['tekeningen', 'bouw', 'v1.2']),
    (veha_workspace_id, project_bouw_id, 'Vergunning omgevingswet', 'Omgevingsvergunning gemeente', 'document', 'completed', 'critical', jan_user_id, ARRAY['vergunning', 'gemeente']),
    (veha_workspace_id, NULL, 'Inkooplijst materialen', 'Checklist voor inkoop bouwmaterialen', 'checklist', 'in_progress', 'medium', vault_user_id, ARRAY['inkoop', 'materialen']),
    (veha_workspace_id, project_renovatie_id, 'Monumenten richtlijnen', 'Richtlijnen voor werken aan monumenten', 'note', 'pending', 'high', vault_user_id, ARRAY['monument', 'richtlijnen'])
    ON CONFLICT DO NOTHING;

    -- ========================================================================
    -- TASKBOARD COLUMNS (Kanban setup)
    -- ========================================================================

    INSERT INTO taskboard_columns (workspace_id, name, status_value, color, sort_order, is_done_column) VALUES
    (veha_workspace_id, 'Backlog', 'backlog', '#6B7280', 0, false),
    (veha_workspace_id, 'Te Doen', 'todo', '#3B82F6', 1, false),
    (veha_workspace_id, 'In Uitvoering', 'in_progress', '#F59E0B', 2, false),
    (veha_workspace_id, 'Review', 'review', '#8B5CF6', 3, false),
    (veha_workspace_id, 'Afgerond', 'done', '#10B981', 4, true)
    ON CONFLICT DO NOTHING;

    -- ========================================================================
    -- USER PREFERENCES (default settings)
    -- ========================================================================

    INSERT INTO user_preferences (user_id, workspace_id, theme, gantt_preferences) VALUES
    (admin_user_id, veha_workspace_id, 'light', '{
        "view_preset": "weekAndDay",
        "show_weekends": false,
        "show_critical_path": true,
        "show_baselines": true,
        "row_height": 45
    }'),
    (jan_user_id, veha_workspace_id, 'dark', '{
        "view_preset": "monthAndYear",
        "show_weekends": false,
        "show_critical_path": true,
        "row_height": 40
    }')
    ON CONFLICT (user_id, workspace_id) DO NOTHING;

    -- ========================================================================
    -- SAVED FILTERS
    -- ========================================================================

    INSERT INTO saved_filters (workspace_id, user_id, name, entity_type, filter_config, is_shared, color) VALUES
    (veha_workspace_id, jan_user_id, 'Mijn taken', 'tasks', '{"assigned_to": "me", "status": ["active"]}', false, '#3B82F6'),
    (veha_workspace_id, jan_user_id, 'Kritieke pad', 'tasks', '{"critical": true}', true, '#EF4444'),
    (veha_workspace_id, vault_user_id, 'Urgente vault items', 'vault_items', '{"priority": ["high", "critical"], "status": ["pending", "in_progress"]}', true, '#F59E0B')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE 'Created workspaces: VEHA Projecten, Demo Workspace';
    RAISE NOTICE 'Created projects: Nieuwbouw Kantoorpand, Renovatie Gemeentehuis, Jaarlijks Onderhoud';
    RAISE NOTICE 'Created users: admin, vault, jan, piet, klant_editor, klant_viewer';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these to verify seed data
-- ============================================================================

-- Check workspace members
-- SELECT w.name as workspace, p.full_name, wm.role
-- FROM workspace_members wm
-- JOIN workspaces w ON w.id = wm.workspace_id
-- JOIN profiles p ON p.id = wm.user_id
-- ORDER BY w.name, wm.role;

-- Check project structure
-- SELECT p.name as project, p.status, pr.full_name as manager
-- FROM projects p
-- LEFT JOIN profiles pr ON pr.id = p.manager_id
-- ORDER BY p.code;

-- Check task hierarchy
-- SELECT t.wbs, t.name, t.is_summary, t.milestone, t.percent_done
-- FROM tasks t
-- WHERE t.project_id = '20000000-0000-0000-0000-000000000001'
-- ORDER BY t.wbs;
