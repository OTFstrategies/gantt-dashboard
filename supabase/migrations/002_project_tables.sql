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
