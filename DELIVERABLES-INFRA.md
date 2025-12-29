# DELIVERABLES - Infrastructure (D11-D14)

> **Versie:** 1.0
> **Datum:** 2024-12-29
> **Categorie:** Infrastructure
> **Deliverables:** D11-D14

[< Terug naar DELIVERABLES.md](./DELIVERABLES.md)

---

## Overzicht Infrastructure

| Code | Naam | Secties | Taken | Status |
|------|------|---------|-------|--------|
| D11 | Database Schema | 7 | 31 | Pending |
| D12 | Auth Configuration | 4 | 15 | Pending |
| D13 | API Routes | 7 | 26 | Pending |
| D14 | Deployment | 5 | 17 | Pending |
| **TOTAAL** | | **23** | **89** | |

---

# D11: Database Schema

## Doelstelling

Ontwerp en implementeer het complete database schema in Supabase met alle tabellen, Row Level Security policies, indexes, triggers en seed data.

## Scope

### Wat WEL
- Core tables (profiles, workspaces, projects)
- Project tables (tasks, dependencies, resources, assignments, calendars, baselines)
- Feature tables (vault_items, export_logs, user_preferences, taskboard_columns)
- Row Level Security (RLS) policies voor alle tabellen
- Performance indexes
- Triggers (timestamps, cascades, audit)
- Development seed data

### Wat NIET
- Application code (zie D1-D10)
- API endpoint logic (zie D13)
- Supabase project setup (zie D12)
- Backup/restore procedures

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| RLS policy bypass | Kritiek | Thorough testing, security audit |
| Foreign key performance | Medium | Proper indexes, query optimization |
| Migration failures | Hoog | Versioned migrations, rollback plan |
| Data model changes | Medium | Schema versioning, migrations |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| RLS coverage | 100% | TBD | - |
| Query performance | <100ms avg | TBD | - |
| Migration success | 100% | TBD | - |
| Seed data complete | Yes | TBD | - |

## Definition of Done

- [ ] Alle core tables aangemaakt
- [ ] Alle project tables aangemaakt
- [ ] Alle feature tables aangemaakt
- [ ] RLS policies op elke table
- [ ] RLS policies getest
- [ ] Foreign key indexes aanwezig
- [ ] Query optimization indexes
- [ ] updated_at triggers werken
- [ ] Cascade delete triggers
- [ ] Seed data voor development

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Core Tables | I | C | R/A | I |
| Project Tables | I | C | R/A | I |
| Feature Tables | I | C | R/A | I |
| RLS Policies | I | C | R/A | I |
| Indexes | I | C | R/A | I |
| Triggers | I | C | R/A | I |
| Seed Data | I | C | R/A | I |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Migration | `supabase/migrations/001_core_tables.sql` | Core tables |
| Migration | `supabase/migrations/002_project_tables.sql` | Project tables |
| Migration | `supabase/migrations/003_feature_tables.sql` | Feature tables |
| Migration | `supabase/migrations/004_rls_policies.sql` | RLS policies |
| Migration | `supabase/migrations/005_indexes.sql` | Indexes |
| Migration | `supabase/migrations/006_triggers.sql` | Triggers |
| Seed | `supabase/seed.sql` | Development seed data |

## Schema Details

### S11.1: Core Tables

```sql
-- profiles (extends auth.users)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'medewerker',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- workspaces
workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('afdeling', 'klant')),
  settings JSONB DEFAULT '{}',
  archived_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- workspace_members
workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE,
  user_id UUID REFERENCES profiles ON DELETE CASCADE,
  role TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
)

-- workspace_invites
workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- projects
projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### S11.2: Project Tables

```sql
-- tasks
tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects ON DELETE CASCADE,
  parent_id UUID REFERENCES tasks ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  duration NUMERIC,
  duration_unit TEXT DEFAULT 'day',
  percent_done NUMERIC DEFAULT 0,
  effort NUMERIC,
  effort_unit TEXT DEFAULT 'hour',
  constraint_type TEXT,
  constraint_date TIMESTAMPTZ,
  manually_scheduled BOOLEAN DEFAULT FALSE,
  cls TEXT,
  icon_cls TEXT,
  note TEXT,
  expanded BOOLEAN DEFAULT TRUE,
  rollup BOOLEAN DEFAULT FALSE,
  show_in_timeline BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  wbs_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- dependencies
dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects ON DELETE CASCADE,
  from_task UUID REFERENCES tasks ON DELETE CASCADE,
  to_task UUID REFERENCES tasks ON DELETE CASCADE,
  type INTEGER DEFAULT 2, -- 0=SS, 1=SF, 2=FS, 3=FF
  lag NUMERIC DEFAULT 0,
  lag_unit TEXT DEFAULT 'day',
  cls TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- resources
resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'human', -- human, material, equipment
  calendar_id UUID,
  image TEXT,
  capacity NUMERIC DEFAULT 100,
  cost_per_hour NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- assignments
assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects ON DELETE CASCADE,
  task_id UUID REFERENCES tasks ON DELETE CASCADE,
  resource_id UUID REFERENCES resources ON DELETE CASCADE,
  units NUMERIC DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- calendars
calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  intervals JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- baselines
baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### S11.3: Feature Tables

```sql
-- vault_items
vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE,
  project_id UUID REFERENCES projects,
  source_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'input', -- input, processing, done
  processing_notes TEXT,
  processed_by UUID REFERENCES profiles,
  processed_at TIMESTAMPTZ,
  done_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- export_logs
export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles,
  project_id UUID REFERENCES projects,
  format TEXT NOT NULL,
  options JSONB DEFAULT '{}',
  file_url TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- user_preferences
user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light',
  locale TEXT DEFAULT 'nl',
  default_view TEXT DEFAULT 'gantt',
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  recent_workspaces UUID[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- taskboard_columns
taskboard_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects ON DELETE CASCADE,
  name TEXT NOT NULL,
  status_value TEXT NOT NULL,
  color TEXT,
  wip_limit INTEGER,
  order_index INTEGER DEFAULT 0,
  collapsed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### S11.4: RLS Policies

```sql
-- Example RLS policies (per table)

-- profiles: users can read all, update own
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- workspaces: members can access their workspaces
CREATE POLICY "workspaces_select" ON workspaces FOR SELECT
  USING (id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "workspaces_insert" ON workspaces FOR INSERT
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "workspaces_update" ON workspaces FOR UPDATE
  USING (id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role = 'admin'));

-- projects: workspace members can access projects
CREATE POLICY "projects_select" ON projects FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

-- tasks: project access inherits from workspace membership
CREATE POLICY "tasks_select" ON tasks FOR SELECT
  USING (project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE wm.user_id = auth.uid()
  ));

-- vault_items: only vault medewerker and admin
CREATE POLICY "vault_items_select" ON vault_items FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'vault_medewerker')
    )
  );
```

### S11.5: Indexes

```sql
-- Foreign key indexes
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_id);
CREATE INDEX idx_dependencies_project ON dependencies(project_id);
CREATE INDEX idx_dependencies_from ON dependencies(from_task);
CREATE INDEX idx_dependencies_to ON dependencies(to_task);
CREATE INDEX idx_assignments_task ON assignments(task_id);
CREATE INDEX idx_assignments_resource ON assignments(resource_id);
CREATE INDEX idx_vault_items_workspace ON vault_items(workspace_id);
CREATE INDEX idx_vault_items_status ON vault_items(status);

-- Query optimization indexes
CREATE INDEX idx_tasks_dates ON tasks(start_date, end_date);
CREATE INDEX idx_vault_items_expires ON vault_items(expires_at) WHERE status = 'done';

-- Full-text search indexes
CREATE INDEX idx_tasks_name_fts ON tasks USING gin(to_tsvector('dutch', name));
CREATE INDEX idx_projects_name_fts ON projects USING gin(to_tsvector('dutch', name));
```

### S11.6: Triggers

```sql
-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ... etc for all tables

-- Vault expiration trigger
CREATE OR REPLACE FUNCTION set_vault_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.done_at = NOW();
    NEW.expires_at = NOW() + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vault_expiration_trigger BEFORE UPDATE ON vault_items
  FOR EACH ROW EXECUTE FUNCTION set_vault_expiration();
```

### S11.7: Seed Data

```sql
-- Development seed data
-- Test users
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@test.nl'),
  ('00000000-0000-0000-0000-000000000002', 'vault@test.nl'),
  ('00000000-0000-0000-0000-000000000003', 'medewerker@test.nl'),
  ('00000000-0000-0000-0000-000000000004', 'klant@test.nl');

INSERT INTO profiles (id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@test.nl', 'Admin User', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'vault@test.nl', 'Vault User', 'vault_medewerker'),
  ('00000000-0000-0000-0000-000000000003', 'medewerker@test.nl', 'Test Medewerker', 'medewerker'),
  ('00000000-0000-0000-0000-000000000004', 'klant@test.nl', 'Test Klant', 'klant_viewer');

-- Test workspaces
INSERT INTO workspaces (id, name, type, created_by) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Afdeling A', 'afdeling', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'Klant Project X', 'klant', '00000000-0000-0000-0000-000000000001');

-- Test projects with tasks, resources, etc.
-- ... (extensive seed data)
```

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Used by | D1-D10 | Alle code modules |
| Configured by | D12 | Supabase Auth setup |
| Accessed via | D13 | API Routes |
| Documented in | D16 | CONTRACTS.md schema |

---

# D12: Auth Configuration

## Doelstelling

Configureer Supabase Auth met email authentication, custom email templates, JWT settings en redirect URLs voor alle omgevingen.

## Scope

### Wat WEL
- Supabase project setup en configuratie
- Email provider configuratie (SMTP)
- Custom email templates (welcome, password reset, invite)
- JWT expiration en session settings
- Rate limiting configuratie
- Redirect URLs per environment
- Auth hooks configuratie

### Wat NIET
- Application auth logic (zie D8)
- User management UI (zie D8)
- Database schema (zie D11)
- API middleware (zie D8)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Email deliverability | Hoog | SPF/DKIM setup, test thoroughly |
| JWT security | Hoog | Follow best practices, short expiry |
| Redirect URL hijacking | Medium | Strict URL validation |
| Rate limit bypass | Medium | Multiple layers of protection |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Email delivery rate | >98% | TBD | - |
| Auth success rate | >99% | TBD | - |
| JWT security audit | Pass | TBD | - |
| Rate limit effectiveness | Pass | TBD | - |

## Definition of Done

- [ ] Supabase project aangemaakt
- [ ] Email provider geconfigureerd
- [ ] Email templates aangepast
- [ ] JWT settings geconfigureerd
- [ ] Session timeout ingesteld
- [ ] Rate limiting actief
- [ ] Password policy ingesteld
- [ ] Development redirect URLs
- [ ] Preview redirect URLs
- [ ] Production redirect URLs
- [ ] Auth hooks werkend

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Supabase Auth | I | C | R/A | I |
| Email Templates | I | I | R/A | C |
| Auth Settings | I | C | R/A | I |
| Redirect URLs | I | C | R/A | I |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Config | `supabase/config.toml` | Supabase configuratie |
| Template | `supabase/templates/confirm.html` | Email confirmation |
| Template | `supabase/templates/reset.html` | Password reset |
| Template | `supabase/templates/invite.html` | Workspace invite |
| Template | `supabase/templates/magic-link.html` | Magic link |

## Configuration Details

### S12.1: Supabase Auth Setup

```toml
# supabase/config.toml
[auth]
enabled = true
site_url = "https://gantt-dashboard.vercel.app"
additional_redirect_urls = [
  "http://localhost:3000",
  "https://*.vercel.app"
]

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true
secure_password_change = true

[auth.sms]
enable_signup = false
enable_confirmations = false

[auth.external]
# Disable social providers for now
```

### S12.2: Email Templates

```html
<!-- Welcome Email Template -->
<h2>Welkom bij Gantt Dashboard</h2>
<p>Hallo {{ .Email }},</p>
<p>Bedankt voor je registratie. Klik op de link hieronder om je email te bevestigen:</p>
<p><a href="{{ .ConfirmationURL }}">Email Bevestigen</a></p>
<p>Deze link verloopt over 24 uur.</p>

<!-- Password Reset Template -->
<h2>Wachtwoord Resetten</h2>
<p>Hallo,</p>
<p>Je hebt een wachtwoord reset aangevraagd. Klik op de link hieronder:</p>
<p><a href="{{ .ConfirmationURL }}">Nieuw Wachtwoord Instellen</a></p>
<p>Deze link verloopt over 1 uur.</p>
<p>Als je deze aanvraag niet hebt gedaan, kun je deze email negeren.</p>

<!-- Invite Email Template -->
<h2>Uitnodiging voor {{ .WorkspaceName }}</h2>
<p>Hallo,</p>
<p>Je bent uitgenodigd om deel te nemen aan workspace "{{ .WorkspaceName }}" met de rol {{ .Role }}.</p>
<p><a href="{{ .InviteURL }}">Uitnodiging Accepteren</a></p>
<p>Deze uitnodiging verloopt over 7 dagen.</p>
```

### S12.3: Auth Settings

```toml
[auth.jwt]
secret = "your-jwt-secret"
expiry = 3600          # 1 hour
refresh_expiry = 604800 # 7 days

[auth.session]
timebox = 28800        # 8 hours inactivity timeout

[auth.password]
min_length = 8
require_uppercase = true
require_lowercase = true
require_number = true
require_special = false

[auth.rate_limit]
token_refresh = { interval = "60s", max_requests = 10 }
signup = { interval = "60s", max_requests = 5 }
signin = { interval = "60s", max_requests = 10 }
reset_password = { interval = "60s", max_requests = 3 }
```

### S12.4: Redirect URLs

```
Development:
- http://localhost:3000
- http://localhost:3000/auth/callback
- http://localhost:3000/login

Preview (Vercel):
- https://*-username.vercel.app
- https://*-username.vercel.app/auth/callback

Production:
- https://gantt-dashboard.vercel.app
- https://gantt-dashboard.vercel.app/auth/callback
- https://gantt-dashboard.nl (custom domain)
- https://gantt-dashboard.nl/auth/callback
```

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Uses | D11 | Database schema (profiles) |
| Used by | D8 | Auth/RBAC module |
| Deployed via | D14 | Vercel deployment |
| Documented in | D17 | API-DOCS auth section |

---

# D13: API Routes

## Doelstelling

Implementeer alle Next.js API routes voor workspace, project, task, resource, vault en export operaties inclusief de CrudManager sync endpoint.

## Scope

### Wat WEL
- Workspace routes (CRUD, members, invites)
- Project routes (CRUD, sync, baseline, complete)
- Task routes (CRUD, bulk operations)
- Resource routes (CRUD, availability)
- Vault routes (list, detail, process, export)
- Export routes (PDF, Excel, CSV, image)
- CrudManager sync endpoint

### Wat NIET
- Frontend components (zie D1-D10)
- Database schema (zie D11)
- Auth configuration (zie D12)
- Deployment setup (zie D14)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| API security vulnerabilities | Kritiek | Auth middleware, input validation |
| CrudManager sync conflicts | Hoog | Optimistic locking, conflict resolution |
| Performance bottlenecks | Medium | Caching, query optimization |
| Rate limit abuse | Medium | Per-user rate limiting |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| API response time | <200ms avg | TBD | - |
| Sync success rate | >99% | TBD | - |
| Error handling coverage | 100% | TBD | - |
| Security audit | Pass | TBD | - |

## Definition of Done

- [ ] Alle workspace routes werken
- [ ] Alle project routes werken
- [ ] Task CRUD en bulk werken
- [ ] Resource routes werken
- [ ] Vault routes werken met RBAC
- [ ] Export routes genereren files
- [ ] CrudManager sync endpoint werkt
- [ ] Auth middleware op alle routes
- [ ] Input validation op alle routes
- [ ] Error responses consistent
- [ ] API getest met Postman/Bruno

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Workspace Routes | I | R/A | C | I |
| Project Routes | I | R/A | C | I |
| Task Routes | I | R/A | C | I |
| Resource Routes | I | R/A | C | I |
| Vault Routes | I | R/A | C | I |
| Export Routes | I | R/A | C | I |
| Sync Route | I | R/A | C | I |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Route | `app/api/workspaces/route.ts` | Workspace list/create |
| Route | `app/api/workspaces/[id]/route.ts` | Workspace detail |
| Route | `app/api/workspaces/[id]/members/route.ts` | Members |
| Route | `app/api/workspaces/[id]/invites/route.ts` | Invites |
| Route | `app/api/projects/route.ts` | Project list/create |
| Route | `app/api/projects/[id]/route.ts` | Project detail |
| Route | `app/api/projects/[id]/sync/route.ts` | CrudManager sync |
| Route | `app/api/projects/[id]/baseline/route.ts` | Baselines |
| Route | `app/api/tasks/route.ts` | Task list/create |
| Route | `app/api/tasks/[id]/route.ts` | Task detail |
| Route | `app/api/tasks/bulk/route.ts` | Bulk operations |
| Route | `app/api/resources/route.ts` | Resource list/create |
| Route | `app/api/resources/[id]/route.ts` | Resource detail |
| Route | `app/api/vault/route.ts` | Vault list |
| Route | `app/api/vault/[id]/route.ts` | Vault item |
| Route | `app/api/vault/[id]/process/route.ts` | Process item |
| Route | `app/api/vault/[id]/export/route.ts` | Export item |
| Route | `app/api/export/pdf/route.ts` | PDF export |
| Route | `app/api/export/excel/route.ts` | Excel export |
| Route | `app/api/export/csv/route.ts` | CSV export |
| Route | `app/api/export/image/route.ts` | Image export |
| Route | `app/api/sync/route.ts` | Generic sync |

## API Specifications

### S13.1: Workspace Routes

```typescript
// GET /api/workspaces
// Returns: { workspaces: Workspace[] }

// POST /api/workspaces
// Body: { name: string, type: 'afdeling' | 'klant', description?: string }
// Returns: { workspace: Workspace }

// GET /api/workspaces/[id]
// Returns: { workspace: Workspace }

// PUT /api/workspaces/[id]
// Body: { name?: string, description?: string, settings?: object }
// Returns: { workspace: Workspace }

// DELETE /api/workspaces/[id]
// Returns: { success: true }

// GET /api/workspaces/[id]/members
// Returns: { members: WorkspaceMember[] }

// POST /api/workspaces/[id]/members
// Body: { userId: string, role: string }
// Returns: { member: WorkspaceMember }

// DELETE /api/workspaces/[id]/members/[userId]
// Returns: { success: true }

// POST /api/workspaces/[id]/invites
// Body: { email: string, role: string }
// Returns: { invite: WorkspaceInvite }

// POST /api/invites/[token]/accept
// Returns: { workspace: Workspace, member: WorkspaceMember }
```

### S13.2: Project Routes

```typescript
// GET /api/projects?workspaceId=xxx
// Returns: { projects: Project[] }

// POST /api/projects
// Body: { workspaceId: string, name: string, ... }
// Returns: { project: Project }

// GET /api/projects/[id]
// Returns: { project: Project }

// PUT /api/projects/[id]
// Body: { name?: string, description?: string, ... }
// Returns: { project: Project }

// DELETE /api/projects/[id]
// Returns: { success: true }

// POST /api/projects/[id]/sync
// Body: CrudManager request format
// Returns: CrudManager response format

// POST /api/projects/[id]/baseline
// Body: { name: string }
// Returns: { baseline: Baseline }

// POST /api/projects/[id]/complete
// Body: {}
// Returns: { vaultItem: VaultItem }
```

### S13.3-S13.4: Task & Resource Routes

```typescript
// Standard CRUD pattern for tasks and resources
// GET /api/tasks?projectId=xxx
// POST /api/tasks
// GET /api/tasks/[id]
// PUT /api/tasks/[id]
// DELETE /api/tasks/[id]

// POST /api/tasks/bulk
// Body: { operations: { create?: Task[], update?: Task[], delete?: string[] } }
// Returns: { created: Task[], updated: Task[], deleted: string[] }

// GET /api/resources?projectId=xxx
// GET /api/resources/availability?resourceIds=x,y,z&start=date&end=date
// Returns: { availability: { resourceId: string, slots: TimeSlot[] }[] }
```

### S13.5: Vault Routes

```typescript
// GET /api/vault?workspaceId=xxx&status=xxx
// Returns: { items: VaultItem[] }

// GET /api/vault/[id]
// Returns: { item: VaultItem }

// PUT /api/vault/[id]
// Body: { status?: string, processingNotes?: string }
// Returns: { item: VaultItem }

// POST /api/vault/[id]/process
// Body: { notes: string }
// Returns: { item: VaultItem }

// POST /api/vault/[id]/export
// Body: { destination: 'permanent' | 'archive' }
// Returns: { success: true, exportedAt: string }
```

### S13.6: Export Routes

```typescript
// POST /api/export/pdf
// Body: { projectId: string, type: 'gantt' | 'calendar', options: ExportOptions }
// Returns: Binary PDF file

// POST /api/export/excel
// Body: { projectId: string, type: 'grid' | 'tasks', options: ExportOptions }
// Returns: Binary Excel file

// POST /api/export/csv
// Body: { projectId: string, type: 'tasks' | 'resources', fields: string[] }
// Returns: Binary CSV file

// POST /api/export/image
// Body: { projectId: string, type: 'gantt' | 'calendar', format: 'png' | 'svg', options: ImageOptions }
// Returns: Binary image file
```

### S13.7: Sync Route (CrudManager)

```typescript
// POST /api/sync
// Body: {
//   requestId: string,
//   type: 'load' | 'sync',
//   tasks?: { $PhantomId?: string, ... }[],
//   dependencies?: { ... }[],
//   resources?: { ... }[],
//   assignments?: { ... }[]
// }
// Returns: {
//   requestId: string,
//   success: true,
//   tasks?: { rows: Task[], removed: string[] },
//   dependencies?: { ... },
//   resources?: { ... },
//   assignments?: { ... }
// }
```

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Uses | D11 | Database schema |
| Uses | D12 | Auth configuration |
| Called by | D1 | CrudManager |
| Deployed via | D14 | Vercel deployment |
| Documented in | D17 | API-DOCS.md |

---

# D14: Deployment

## Doelstelling

Configureer en deploy de applicatie naar Vercel met environment variables, custom domain, CI/CD pipeline en monitoring.

## Scope

### Wat WEL
- Vercel project setup
- Git repository koppeling
- Environment variables per omgeving
- Custom domain configuratie
- SSL certificate
- CI/CD build configuratie
- Preview deployments
- Production deployment
- Monitoring en analytics

### Wat NIET
- Application code (zie D1-D10)
- Database setup (zie D11)
- Auth setup (zie D12)
- API implementation (zie D13)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Environment variable leak | Kritiek | Strict access control, encryption |
| Failed deployments | Hoog | Staging environment, rollback plan |
| Domain DNS issues | Medium | Early DNS propagation |
| Build performance | Laag | Caching, optimization |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Deployment success rate | >99% | TBD | - |
| Build time | <3 min | TBD | - |
| TTFB | <200ms | TBD | - |
| Uptime | 99.9% | TBD | - |

## Definition of Done

- [ ] Vercel project aangemaakt
- [ ] Git repository gekoppeld
- [ ] Development env vars ingesteld
- [ ] Preview env vars ingesteld
- [ ] Production env vars ingesteld
- [ ] Env var validation werkt
- [ ] Custom domain geconfigureerd
- [ ] SSL certificate actief
- [ ] DNS correct geconfigureerd
- [ ] Build configuratie optimaal
- [ ] Preview deployments werken
- [ ] Production deployment succesvol
- [ ] Analytics ingesteld
- [ ] Error tracking actief
- [ ] Performance monitoring actief

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Vercel Setup | I | C | R/A | I |
| Environment Variables | I | C | R/A | I |
| Domain | I | I | R/A | I |
| CI/CD | I | C | R/A | I |
| Monitoring | I | C | R/A | I |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Config | `vercel.json` | Vercel configuratie |
| Config | `.env.example` | Environment template |
| Config | `.env.local` | Local development |
| Script | `scripts/validate-env.js` | Env validation |
| Workflow | `.github/workflows/ci.yml` | CI workflow (optional) |

## Configuration Details

### S14.1: Vercel Setup

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "regions": ["ams1"],
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

### S14.2: Environment Variables

```bash
# .env.example
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Bryntum
BRYNTUM_LICENSE_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Gantt Dashboard"

# Email (for invites)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx
EMAIL_FROM=noreply@gantt-dashboard.nl

# Export (optional)
EXPORT_SERVER_URL=https://export.example.com

# Development
NEXT_PUBLIC_ENV=development
```

**Per Environment:**

| Variable | Development | Preview | Production |
|----------|-------------|---------|------------|
| NEXT_PUBLIC_SUPABASE_URL | Local/Dev project | Staging project | Prod project |
| NEXT_PUBLIC_APP_URL | localhost:3000 | *.vercel.app | gantt-dashboard.nl |
| NEXT_PUBLIC_ENV | development | preview | production |

### S14.3: Domain Configuration

```
DNS Records:
A     gantt-dashboard.nl      76.76.21.21
AAAA  gantt-dashboard.nl      2606:4700:3032::ac43:d071
CNAME www.gantt-dashboard.nl  cname.vercel-dns.com

SSL: Auto-provisioned by Vercel (Let's Encrypt)
```

### S14.4: CI/CD Pipeline

```yaml
# Build triggers
- Push to main → Production deployment
- Push to develop → Preview deployment
- Pull request → Preview deployment with unique URL

# Build steps
1. npm ci (install dependencies)
2. npm run lint (code quality)
3. npm run type-check (TypeScript)
4. npm run test (unit tests)
5. npm run build (Next.js build)
6. Deploy to Vercel

# Notifications
- Slack: deployment status
- Email: failed deployments
```

### S14.5: Monitoring

```
Vercel Analytics:
- Page views
- Unique visitors
- Top pages
- Geographic distribution

Vercel Web Vitals:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)

Error Tracking (Sentry):
- JavaScript errors
- API errors
- Performance issues
- User feedback

Custom Monitoring:
- API response times
- Sync success rate
- Export generation time
```

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Deploys | D1-D10 | Code modules |
| Uses | D11 | Database (Supabase) |
| Uses | D12 | Auth configuration |
| Hosts | D13 | API routes |
| Documented in | D15 | ARCHITECTURE.md deployment section |

---

## Versie Historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0 | 2024-12-29 | A2 | Initieel document met D11-D14 |

---

*Document versie: 1.0*
*Laatst bijgewerkt: 29 December 2024*
*Infrastructure: 4 | Secties: 23 | Taken: 89*
