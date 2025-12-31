# DELIVERABLES - Code Modules (D1-D10)

> **Versie:** 1.0
> **Datum:** 2024-12-29
> **Categorie:** Code Modules
> **Deliverables:** D1-D10

[< Terug naar DELIVERABLES.md](./DELIVERABLES.md)

---

## Overzicht Code Modules

| Code | Naam | Secties | Taken | Status |
|------|------|---------|-------|--------|
| D1 | Foundation Module | 8 | 35 | Pending |
| D2 | Gantt Module | 9 | 44 | Pending |
| D3 | Calendar Module | 7 | 32 | Pending |
| D4 | TaskBoard Module | 8 | 32 | Pending |
| D5 | Grid Module | 8 | 32 | Pending |
| D6 | Dashboard Module | 7 | 28 | Pending |
| D7 | Workspace Module | 6 | 26 | Pending |
| D8 | Auth/RBAC Module | 7 | 30 | Pending |
| D9 | Vault Module | 7 | 30 | Pending |
| D10 | Export Module | 7 | 25 | Pending |
| **TOTAAL** | | **74** | **314** | |

---

# D1: Foundation Module

## Doelstelling

Bouw de technische basis voor het Gantt Dashboard platform met Bryntum Suite integratie, gedeelde types, providers en hooks die door alle andere modules worden gebruikt.

## Scope

### Wat WEL
- Bryntum Suite installatie en licentie configuratie
- TypeScript type definities voor alle Bryntum entities
- ProjectModel configuratie met alle stores
- CrudManager setup voor data synchronisatie
- Theme systeem (light/dark mode)
- Shared React components (ErrorBoundary, Loading, etc.)
- React Providers (BryntumProvider, ThemeProvider)
- Custom hooks (useProject, useTheme, useSync)

### Wat NIET
- Specifieke view implementaties (Gantt, Calendar, etc.)
- API endpoints (zie D13)
- Database schema (zie D11)
- Authentication logic (zie D8)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Bryntum licentie issues | Hoog | Early validation, contact support |
| Type conflicts met Bryntum | Medium | Module augmentation pattern |
| ProjectModel re-render issues | Medium | Memo, useMemo, singleton pattern |
| Theme flashing on load | Laag | SSR theme detection, CSS variables |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Bundle size impact | <500KB | TBD | - |
| Type coverage | 100% | TBD | - |
| Test coverage | >80% | TBD | - |
| Performance impact | <50ms init | TBD | - |

## Definition of Done

- [ ] Alle Bryntum packages geinstalleerd zonder errors
- [ ] Geen "Trial" watermark in productie
- [ ] TypeScript types voor alle entities gedefinieerd
- [ ] ProjectModel correct geconfigureerd met alle stores
- [ ] CrudManager sync werkt met backend
- [ ] Light/dark theme toggle functioneel
- [ ] Shared components gedocumenteerd
- [ ] Providers correct genest in app layout
- [ ] Hooks unit tested
- [ ] Geen console errors/warnings

## RACI Matrix

| Activiteit | A0 (Orchestrator) | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-------------------|-----------|------------|-----------|
| Bryntum Setup | I | R/A | C | I |
| TypeScript Types | I | R/A | I | C |
| ProjectModel | I | R/A | C | I |
| CrudManager | I | R/A | C | I |
| Theme System | I | R/A | I | I |
| Shared Components | I | R/A | I | C |
| Providers | I | R/A | I | I |
| Hooks | I | R/A | I | C |

*R=Responsible, A=Accountable, C=Consulted, I=Informed*

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Config | `src/lib/bryntum/config.ts` | Bryntum configuratie |
| Types | `src/types/*.ts` | TypeScript interfaces |
| Model | `src/models/ProjectModel.ts` | Extended ProjectModel |
| Service | `src/services/CrudManager.ts` | CrudManager configuratie |
| Styles | `src/styles/variables.css` | CSS custom properties |
| Styles | `src/styles/bryntum-overrides.css` | Bryntum theme overrides |
| Components | `src/components/shared/*.tsx` | Shared UI components |
| Providers | `src/providers/*.tsx` | React context providers |
| Hooks | `src/hooks/*.ts` | Custom React hooks |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Depends on | D11 | Database schema voor CrudManager endpoints |
| Used by | D2-D10 | Alle andere modules gebruiken Foundation |
| Documented in | D15 | ARCHITECTURE.md beschrijft de structuur |
| API spec | D16 | CONTRACTS.md definieert de interfaces |

---

# D2: Gantt Module

## Doelstelling

Implementeer een volledig functionele Gantt Chart view met BryntumGantt voor projectplanning, taakbeheer, dependencies en resource management.

## Scope

### Wat WEL
- BryntumGantt React wrapper component
- Gantt toolbar (zoom, filters, actions)
- Task CRUD (create, read, update, delete)
- Task hierarchy (parent/child, WBS)
- Dependency management (FS, SS, FF, SF)
- Task editor dialog met tabs
- Critical path highlighting
- Baselines (planned vs actual)
- Column configuratie
- Extra features (progress line, labels, indicators)

### Wat NIET
- Calendar view (zie D3)
- TaskBoard view (zie D4)
- Export functionaliteit (zie D10)
- API endpoints (zie D13)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Dependency cycles | Hoog | Bryntum validation, UI feedback |
| Performance bij 1000+ taken | Medium | Virtual scrolling, lazy loading |
| Critical path berekening traag | Medium | Web worker, caching |
| Complex task editor state | Medium | Form library, validation schema |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Max taken performant | 1000 | TBD | - |
| Drag & drop latency | <100ms | TBD | - |
| Critical path calc time | <500ms | TBD | - |
| Task editor validation | 100% | TBD | - |

## Definition of Done

- [ ] Gantt chart rendert correct met data
- [ ] Taken kunnen CRUD operaties ondergaan
- [ ] Dependencies visueel zichtbaar en bewerkbaar
- [ ] Task editor volledig functioneel
- [ ] Critical path toggle werkt
- [ ] Baselines kunnen worden aangemaakt en vergeleken
- [ ] Toolbar acties werken (zoom, filter, etc.)
- [ ] Kolommen configureerbaar
- [ ] Undo/Redo werkt correct
- [ ] Responsive design op tablet

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Gantt Component | I | R/A | I | I |
| Gantt Toolbar | I | R/A | I | I |
| Task Management | I | R/A | C | I |
| Dependencies | I | R/A | C | I |
| Task Editor | I | R/A | I | C |
| Critical Path | I | R/A | I | I |
| Baselines | I | R/A | C | I |
| Column Config | I | R/A | I | I |
| Gantt Features | I | R/A | I | C |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Component | `src/components/gantt/BryntumGanttWrapper.tsx` | Main Gantt component |
| Component | `src/components/gantt/GanttToolbar.tsx` | Toolbar component |
| Component | `src/components/gantt/TaskEditor.tsx` | Task editor dialog |
| Config | `src/components/gantt/config.ts` | Gantt configuratie |
| Config | `src/components/gantt/columns.ts` | Column definities |
| Page | `app/(dashboard)/gantt/page.tsx` | Gantt route |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Depends on | D1 | Foundation Module (ProjectModel, types) |
| Syncs with | D3, D4, D5 | Gedeelde data via ProjectModel |
| Exports to | D10 | PDF en Excel export van Gantt |
| API | D13 | Sync endpoint voor task data |

---

# D3: Calendar Module

## Doelstelling

Implementeer een volledige Calendar view met BryntumCalendar voor event management, resource scheduling en meerdere weergavemodi.

## Scope

### Wat WEL
- BryntumCalendar React wrapper component
- Calendar toolbar (view switcher, navigation)
- View modes (Day, Week, Month, Year, Agenda)
- Event CRUD operaties
- Event editor met recurrence
- Sidebar (mini calendar, filters)
- Resource view (per-resource calendar)

### Wat NIET
- Gantt-specifieke features (zie D2)
- TaskBoard features (zie D4)
- Export functionaliteit (zie D10)
- API endpoints (zie D13)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Recurrence complexity | Hoog | Bryntum RRULE support, testing |
| Timezone handling | Medium | Consistent UTC storage, display conversion |
| All-day event rendering | Laag | CSS positioning, Bryntum config |
| Resource view performance | Medium | Pagination, lazy loading |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Events per view | 500+ | TBD | - |
| View switch latency | <200ms | TBD | - |
| Recurrence accuracy | 100% | TBD | - |
| Mobile usability | Good | TBD | - |

## Definition of Done

- [ ] Calendar rendert correct met events
- [ ] Alle 5 view modes functioneel
- [ ] Events kunnen CRUD ondergaan
- [ ] Recurring events werken correct
- [ ] Drag & drop voor reschedule
- [ ] Event resize werkt
- [ ] Sidebar met mini calendar
- [ ] Resource filtering werkt
- [ ] Toolbar acties functioneel
- [ ] Responsive design

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Calendar Component | I | R/A | I | I |
| Calendar Toolbar | I | R/A | I | I |
| View Modes | I | R/A | I | C |
| Event Management | I | R/A | C | I |
| Event Editor | I | R/A | I | C |
| Sidebar | I | R/A | I | I |
| Resource View | I | R/A | C | I |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Component | `src/components/calendar/BryntumCalendarWrapper.tsx` | Main Calendar component |
| Component | `src/components/calendar/CalendarToolbar.tsx` | Toolbar component |
| Component | `src/components/calendar/EventEditor.tsx` | Event editor dialog |
| Component | `src/components/calendar/CalendarSidebar.tsx` | Sidebar component |
| Config | `src/components/calendar/config.ts` | Calendar configuratie |
| Page | `app/(dashboard)/calendar/page.tsx` | Calendar route |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Depends on | D1 | Foundation Module |
| Syncs with | D2, D4, D5 | Gedeelde data via ProjectModel |
| Exports to | D10 | PDF export van Calendar |
| API | D13 | Sync endpoint voor event data |

---

# D4: TaskBoard Module

## Doelstelling

Implementeer een Kanban-style TaskBoard met BryntumTaskBoard voor visueel taakbeheer met columns, cards, swimlanes en WIP limits.

## Scope

### Wat WEL
- BryntumTaskBoard React wrapper component
- TaskBoard toolbar (filters, actions)
- Column configuratie (status-based)
- Card rendering met items
- Drag & drop tussen columns
- Card editor dialog
- Swimlanes voor grouping
- WIP limits per column

### Wat NIET
- Gantt timeline (zie D2)
- Calendar views (zie D3)
- Grid tabular view (zie D5)
- Export functionaliteit (zie D10)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Card rendering performance | Medium | Virtual scrolling, card pooling |
| Swimlane complexity | Medium | Clear UX, collapsible swimlanes |
| WIP limit enforcement | Laag | Visual warning, optional blocking |
| Multi-select drag | Medium | Clear UI feedback, batch operations |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Cards per column | 100+ | TBD | - |
| Drag latency | <50ms | TBD | - |
| Column transitions | Smooth | TBD | - |
| Mobile swipe support | Yes | TBD | - |

## Definition of Done

- [ ] TaskBoard rendert correct met cards
- [ ] Columns configureerbaar (add, remove, reorder)
- [ ] Cards tonen alle benodigde info
- [ ] Drag & drop werkt smooth
- [ ] Card editor volledig functioneel
- [ ] Swimlanes werken correct
- [ ] WIP limits zichtbaar en enforced
- [ ] Toolbar filters werken
- [ ] Responsive design
- [ ] Keyboard navigatie

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| TaskBoard Component | I | R/A | I | I |
| TaskBoard Toolbar | I | R/A | I | I |
| Columns | I | R/A | C | I |
| Cards | I | R/A | I | C |
| Drag & Drop | I | R/A | I | I |
| Card Editor | I | R/A | I | C |
| Swimlanes | I | R/A | I | I |
| WIP Limits | I | R/A | I | I |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Component | `src/components/taskboard/BryntumTaskBoardWrapper.tsx` | Main TaskBoard component |
| Component | `src/components/taskboard/TaskBoardToolbar.tsx` | Toolbar component |
| Component | `src/components/taskboard/CardEditor.tsx` | Card editor dialog |
| Component | `src/components/taskboard/CardTemplate.tsx` | Card template |
| Config | `src/components/taskboard/config.ts` | TaskBoard configuratie |
| Config | `src/components/taskboard/columns.ts` | Column definities |
| Page | `app/(dashboard)/taskboard/page.tsx` | TaskBoard route |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Depends on | D1 | Foundation Module |
| Syncs with | D2, D3, D5 | Gedeelde data via ProjectModel |
| Used by | D9 | Vault module gebruikt TaskBoard layout |
| API | D13 | Sync endpoint voor task data |

---

# D5: Grid Module

## Doelstelling

Implementeer een krachtige Grid view met BryntumGrid voor tabelweergave van data met sorting, filtering, editing en export mogelijkheden.

## Scope

### Wat WEL
- BryntumGrid React wrapper component
- Grid toolbar (actions, export)
- Column configuratie (types, renderers)
- Sorting en filtering
- Cell en row editing
- Selection (single, multi, checkbox)
- Grouping met summaries
- Export (CSV, Excel)

### Wat NIET
- Timeline visualisatie (zie D2)
- Calendar views (zie D3)
- Kanban layout (zie D4)
- PDF export (zie D10)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Large dataset performance | Hoog | Virtual scrolling, pagination |
| Complex filter combinations | Medium | Filter builder UI |
| Custom cell renderers | Laag | Template system |
| Export large datasets | Medium | Server-side generation |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Rows performant | 10000+ | TBD | - |
| Sort latency | <100ms | TBD | - |
| Filter apply time | <200ms | TBD | - |
| Export 1000 rows | <3s | TBD | - |

## Definition of Done

- [ ] Grid rendert correct met data
- [ ] Kolommen sorteerbaar
- [ ] Filtering werkt (header + filter builder)
- [ ] Cell editing functioneel
- [ ] Row selection werkt
- [ ] Grouping met collapse/expand
- [ ] CSV export werkt
- [ ] Excel export werkt
- [ ] Column resize en reorder
- [ ] Responsive design

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Grid Component | I | R/A | I | I |
| Grid Toolbar | I | R/A | I | I |
| Columns | I | R/A | I | C |
| Sorting & Filtering | I | R/A | I | I |
| Editing | I | R/A | C | I |
| Selection | I | R/A | I | I |
| Grouping | I | R/A | I | I |
| Export | I | R/A | C | C |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Component | `src/components/grid/BryntumGridWrapper.tsx` | Main Grid component |
| Component | `src/components/grid/GridToolbar.tsx` | Toolbar component |
| Component | `src/components/grid/FilterBuilder.tsx` | Filter builder UI |
| Config | `src/components/grid/config.ts` | Grid configuratie |
| Config | `src/components/grid/columns.ts` | Column definities |
| Page | `app/(dashboard)/grid/page.tsx` | Grid route |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Depends on | D1 | Foundation Module |
| Syncs with | D2, D3, D4 | Gedeelde data via ProjectModel |
| Exports to | D10 | Export module voor PDF |
| API | D13 | Sync endpoint voor data |

---

# D6: Dashboard Module

## Doelstelling

Bouw een centrale Dashboard interface met navigatie, view switching, widget systeem en quick actions voor een uniforme gebruikerservaring.

## Scope

### Wat WEL
- Dashboard layout met resizable panels
- Sidebar navigatie (workspace, project)
- View switcher (tabs, routing)
- Widget systeem (Gantt, Calendar, TaskBoard widgets)
- Quick actions panel
- Recent items tracking
- Notification center

### Wat NIET
- Individuele view implementaties (zie D2-D5)
- Authentication (zie D8)
- Workspace management (zie D7)
- API endpoints (zie D13)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Layout complexity | Medium | CSS Grid, tested breakpoints |
| Widget performance | Medium | Lazy loading, suspense |
| State synchronization | Medium | Single source of truth |
| Mobile navigation | Laag | Hamburger menu, bottom nav |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Initial load time | <2s | TBD | - |
| View switch time | <500ms | TBD | - |
| Widget render time | <300ms | TBD | - |
| Mobile usability | Good | TBD | - |

## Definition of Done

- [ ] Dashboard layout rendert correct
- [ ] Sidebar navigatie functioneel
- [ ] View tabs werken met routing
- [ ] Widgets laden correct
- [ ] Quick actions panel werkt
- [ ] Recent items worden getracked
- [ ] Notifications tonen correct
- [ ] Layout persistence werkt
- [ ] Responsive breakpoints
- [ ] Keyboard shortcuts

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Dashboard Layout | I | R/A | I | I |
| Navigation | I | R/A | I | I |
| View Switcher | I | R/A | I | C |
| Widget System | I | R/A | I | I |
| Quick Actions | I | R/A | I | I |
| Recent Items | I | R/A | C | I |
| Notifications | I | R/A | C | I |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Layout | `src/components/dashboard/DashboardLayout.tsx` | Main layout |
| Component | `src/components/dashboard/Sidebar.tsx` | Navigation sidebar |
| Component | `src/components/dashboard/ViewTabs.tsx` | View switcher tabs |
| Component | `src/components/dashboard/WidgetContainer.tsx` | Widget wrapper |
| Component | `src/components/dashboard/QuickActions.tsx` | Quick actions panel |
| Component | `src/components/dashboard/NotificationCenter.tsx` | Notifications |
| Layout | `app/(dashboard)/layout.tsx` | Dashboard route layout |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Depends on | D1 | Foundation Module |
| Integrates | D2-D5 | View modules als widgets |
| Works with | D7 | Workspace context |
| Uses | D8 | Auth context voor user info |

---

# D7: Workspace Module

## Doelstelling

Implementeer workspace management voor afdelingsscheiding en klantsamenwerking met volledige CRUD, member management en invite systeem.

## Scope

### Wat WEL
- Workspace CRUD operaties
- Workspace types (Afdeling, Klant)
- Member management (add, remove, roles)
- Invite systeem (email, accept flow)
- Workspace settings pagina
- Workspace dashboard/overview

### Wat NIET
- User authentication (zie D8)
- Role definitions (zie D8)
- Database schema (zie D11)
- API endpoints (zie D13)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Data isolation breach | Hoog | RLS policies, thorough testing |
| Invite link security | Hoog | Token expiration, one-time use |
| Member role confusion | Medium | Clear UI, role descriptions |
| Workspace switching UX | Laag | Quick switcher, recent workspaces |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Workspace isolation | 100% | TBD | - |
| Invite success rate | >95% | TBD | - |
| Member operations | <500ms | TBD | - |
| Settings save time | <1s | TBD | - |

## Definition of Done

- [ ] Workspace list pagina werkt
- [ ] Workspace create/update/delete werkt
- [ ] Workspace types correct geimplementeerd
- [ ] Member list zichtbaar
- [ ] Members kunnen worden toegevoegd/verwijderd
- [ ] Roles kunnen worden toegewezen
- [ ] Invite via email werkt
- [ ] Invite accept flow werkt
- [ ] Settings pagina functioneel
- [ ] Data isolation getest

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Workspace CRUD | I | R/A | C | I |
| Workspace Types | I | R/A | C | C |
| Member Management | I | R/A | C | I |
| Invite System | I | R/A | R/A | I |
| Workspace Settings | I | R/A | I | I |
| Workspace Dashboard | I | R/A | I | I |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Component | `src/components/workspace/WorkspaceList.tsx` | Workspace list |
| Component | `src/components/workspace/WorkspaceForm.tsx` | Create/edit form |
| Component | `src/components/workspace/MemberList.tsx` | Member management |
| Component | `src/components/workspace/InviteDialog.tsx` | Invite dialog |
| Component | `src/components/workspace/WorkspaceSettings.tsx` | Settings panel |
| Page | `app/(dashboard)/workspaces/page.tsx` | Workspace list route |
| Page | `app/(dashboard)/workspaces/[id]/page.tsx` | Workspace detail |
| Page | `app/invite/[token]/page.tsx` | Invite accept page |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Depends on | D1 | Foundation Module |
| Depends on | D8 | Auth/RBAC voor roles |
| Uses | D11 | Database schema voor workspaces |
| API | D13 | Workspace API endpoints |

---

# D8: Auth/RBAC Module

## Doelstelling

Implementeer authenticatie en Role-Based Access Control met Supabase Auth, 5 gedefinieerde rollen, permission matrix en UI/API guards.

## Scope

### Wat WEL
- Authentication (login, logout, session)
- Password management (reset, change)
- 5 Role definitions (Admin, Vault Medewerker, Medewerker, Klant Editor, Klant Viewer)
- Permission matrix
- UI guards (ProtectedRoute, PermissionGate)
- API guards (middleware)
- User management (admin panel)

### Wat NIET
- Supabase project setup (zie D12)
- Database schema (zie D11)
- Email templates (zie D12)
- API endpoints (zie D13)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Permission bypass | Kritiek | Server-side validation, RLS |
| Session hijacking | Hoog | Secure cookies, token rotation |
| Role confusion | Medium | Clear documentation, UI feedback |
| Password security | Hoog | Supabase defaults, no custom storage |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Auth security | Pass audit | TBD | - |
| Permission accuracy | 100% | TBD | - |
| Login time | <2s | TBD | - |
| Role assignment UX | Intuitive | TBD | - |

## Definition of Done

- [ ] Login/logout werkt correct
- [ ] Password reset flow functioneel
- [ ] Alle 5 rollen gedefinieerd
- [ ] Permission matrix geimplementeerd
- [ ] ProtectedRoute werkt
- [ ] PermissionGate werkt
- [ ] API middleware blokkeert unauthorized
- [ ] User management pagina werkt
- [ ] Role assignment UI werkt
- [ ] Security audit passed

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Authentication | I | R/A | C | I |
| Password Management | I | R/A | C | I |
| Role Definitions | I | R/A | I | R/A |
| Permissions | I | R/A | C | C |
| UI Guards | I | R/A | I | I |
| API Guards | I | R/A | R/A | I |
| User Management | I | R/A | C | I |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Component | `src/components/auth/LoginForm.tsx` | Login form |
| Component | `src/components/auth/ProtectedRoute.tsx` | Route guard |
| Component | `src/components/auth/PermissionGate.tsx` | Permission guard |
| Hook | `src/hooks/useAuth.ts` | Auth hook |
| Hook | `src/hooks/usePermissions.ts` | Permission hook |
| Config | `src/lib/auth/roles.ts` | Role definitions |
| Config | `src/lib/auth/permissions.ts` | Permission matrix |
| Middleware | `src/middleware.ts` | API middleware |
| Page | `app/login/page.tsx` | Login page |
| Page | `app/(dashboard)/admin/users/page.tsx` | User management |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Depends on | D11 | Database schema voor profiles |
| Depends on | D12 | Supabase Auth configuratie |
| Used by | D7 | Workspace member roles |
| Used by | D9 | Vault access control |
| Documented | P1 | ROLLEN.md beschrijft rollen |

---

# D9: Vault Module

## Doelstelling

Implementeer het Vault systeem voor gecontroleerde dataverwerking met Kanban workflow, 30-dagen retentie en export naar permanente opslag.

## Scope

### Wat WEL
- Vault dashboard (overview, stats)
- Vault Kanban (Input, Processing, Done columns)
- Vault item CRUD en detail view
- Processing workflow en tools
- 30-dagen retentie countdown
- Export naar permanent storage
- Audit trail en logging

### Wat NIET
- TaskBoard implementatie (zie D4, hergebruikt)
- Export formats (zie D10)
- Database schema (zie D11)
- API endpoints (zie D13)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Data loss before export | Kritiek | Warnings, confirmations, backups |
| Retention countdown bugs | Hoog | Thorough testing, manual override |
| Unauthorized vault access | Hoog | Strict RBAC, audit logging |
| Processing workflow unclear | Medium | Clear UI, documentation |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Data retention accuracy | 100% | TBD | - |
| Export success rate | >99% | TBD | - |
| Processing throughput | TBD | TBD | - |
| Audit trail completeness | 100% | TBD | - |

## Definition of Done

- [ ] Vault dashboard toont correcte stats
- [ ] Kanban columns werken correct
- [ ] Items kunnen door columns bewegen
- [ ] Item detail view toont alle data
- [ ] Processing notes kunnen worden toegevoegd
- [ ] 30-dagen countdown zichtbaar
- [ ] Auto-cleanup werkt correct
- [ ] Export naar permanent werkt
- [ ] Audit trail wordt gelogd
- [ ] RBAC enforcement werkt

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Vault Dashboard | I | R/A | I | I |
| Vault Kanban | I | R/A | I | I |
| Vault Items | I | R/A | C | I |
| Processing | I | R/A | C | C |
| Retention | I | R/A | R/A | I |
| Vault Export | I | R/A | C | I |
| Audit Trail | I | R/A | R/A | I |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Component | `src/components/vault/VaultDashboard.tsx` | Dashboard |
| Component | `src/components/vault/VaultKanban.tsx` | Kanban board |
| Component | `src/components/vault/VaultItemCard.tsx` | Item card |
| Component | `src/components/vault/VaultItemDetail.tsx` | Item detail |
| Component | `src/components/vault/ProcessingPanel.tsx` | Processing UI |
| Component | `src/components/vault/ExportDialog.tsx` | Export dialog |
| Hook | `src/hooks/useVault.ts` | Vault data hook |
| Page | `app/(dashboard)/vault/page.tsx` | Vault route |
| Page | `app/(dashboard)/vault/[id]/page.tsx` | Item detail route |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Depends on | D1 | Foundation Module |
| Depends on | D4 | TaskBoard voor Kanban |
| Depends on | D8 | RBAC voor access control |
| Exports to | D10 | Export module |
| Uses | D11 | vault_items table |
| Documented | P2 | PROCEDURES.md beschrijft workflow |

---

# D10: Export Module

## Doelstelling

Implementeer een uitgebreide export module voor PDF, Excel, CSV en image exports met preview en configuratie opties.

## Scope

### Wat WEL
- Export UI (dialog, configuration)
- PDF export (Gantt, Calendar)
- Excel export (Grid, data)
- CSV export (simple format)
- Image export (PNG, SVG)
- Export preview panel
- Export history en re-download

### Wat NIET
- View implementaties (zie D2-D5)
- API endpoints (zie D13)
- Database schema (zie D11)
- Vault export logic (zie D9)

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Large PDF generation | Medium | Server-side, streaming |
| Excel format compatibility | Laag | Use exceljs library |
| Image quality | Laag | Resolution options |
| Export timeout | Medium | Background job, notification |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| PDF generation time | <10s | TBD | - |
| Excel compatibility | 100% | TBD | - |
| Image resolution | Up to 4K | TBD | - |
| Export success rate | >99% | TBD | - |

## Definition of Done

- [ ] Export button trigger werkt
- [ ] Export dialog met format selectie
- [ ] PDF export van Gantt werkt
- [ ] PDF export van Calendar werkt
- [ ] Excel export werkt
- [ ] CSV export werkt
- [ ] PNG export werkt
- [ ] SVG export werkt
- [ ] Preview panel toont correcte output
- [ ] Export history wordt opgeslagen

## RACI Matrix

| Activiteit | A0 | A1 (Code) | A2 (Infra) | A3 (Docs) |
|------------|-----|-----------|------------|-----------|
| Export UI | I | R/A | I | I |
| PDF Export | I | R/A | C | I |
| Excel Export | I | R/A | I | I |
| CSV Export | I | R/A | I | I |
| Image Export | I | R/A | I | I |
| Export Preview | I | R/A | I | I |
| Export History | I | R/A | C | I |

## Artefacts

| Type | Pad | Beschrijving |
|------|-----|--------------|
| Component | `src/components/export/ExportDialog.tsx` | Main export dialog |
| Component | `src/components/export/ExportPreview.tsx` | Preview panel |
| Component | `src/components/export/FormatSelector.tsx` | Format selection |
| Component | `src/components/export/ExportHistory.tsx` | History list |
| Service | `src/services/export/pdf.ts` | PDF generation |
| Service | `src/services/export/excel.ts` | Excel generation |
| Service | `src/services/export/csv.ts` | CSV generation |
| Service | `src/services/export/image.ts` | Image generation |
| Hook | `src/hooks/useExport.ts` | Export hook |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Depends on | D1 | Foundation Module |
| Exports from | D2 | Gantt data |
| Exports from | D3 | Calendar data |
| Exports from | D4, D5 | TaskBoard/Grid data |
| Uses | D9 | Vault export integration |
| API | D13 | Export API endpoints |
| Uses | D11 | export_logs table |

---

## Versie Historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0 | 2024-12-29 | A1 | Initieel document met D1-D10 |

---

*Document versie: 1.0*
*Laatst bijgewerkt: 29 December 2024*
*Code Modules: 10 | Secties: 74 | Taken: 314*
